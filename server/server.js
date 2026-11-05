// Luna Chris multiplayer relay (step 1: see each other).
//
// Clients connect over WebSocket, join a ROOM by name, then stream their own state (level, angle round the planet,
// height, velocity, facing, aim, a few flags) as often as every frame. The server keeps the latest state of every
// player and, 60 times a second, sends each room ONE snapshot of everyone who changed. Clients draw the others
// slightly in the past and interpolate between snapshots, so it's smooth even when packets arrive unevenly.
//
// The server doesn't simulate anything (yet): each player is in charge of their own Chris. Enemies, pickups and
// bosses are still per-player; sharing those comes later (one player "hosts" the level and owns the enemies).
//
// Messages (JSON):
//   client -> server  { t: 'hi', room, name, v }        join (or switch) a room
//                     { t: 's', d: [lvl, th, h, vx, vh, facing, aimA, flags, weapon] }   my state
//                     { t: 'ev', e: {...} }               a one-off event (a shot, a hit...) relayed to the room
//   server -> client  { t: 'welcome', id, room, players: [{ id, name }] }
//                     { t: 'join', id, name }  /  { t: 'leave', id }
//                     { t: 'snap', ts, p: { id: [state...] } }     60 Hz, only players that changed
//                     { t: 'ev', id, e }  /  { t: 'full' }  (room has MAX players)
//
// Run:  npm install && npm start          (PORT=8787 by default; GET / is a health check)
const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = +process.env.PORT || 8787;
const TICK_HZ = 60;
const MAX = +process.env.MAX_PLAYERS || 4;

const rooms = new Map();          // room name -> Set of clients
let nextId = 1;

const server = http.createServer((req, res) => {
  const n = [...rooms.values()].reduce((a, r) => a + r.size, 0);
  res.writeHead(200, { 'content-type': 'text/plain', 'access-control-allow-origin': '*' });
  res.end(`luna-chris relay ok - ${rooms.size} rooms, ${n} players\n`);
});
const wss = new WebSocketServer({ server, maxPayload: 4096 });

const clean = (s, n) => String(s || '').replace(/[^\w \-]/g, '').trim().slice(0, n);
const send = (c, m) => { if (c.readyState === 1) c.send(typeof m === 'string' ? m : JSON.stringify(m)); };
const toRoom = (room, m, except) => { const s = JSON.stringify(m); for (const c of room) if (c !== except) send(c, s); };

function leave(c) {
  const room = c.room && rooms.get(c.room);
  if (!room) return;
  room.delete(c);
  toRoom(room, { t: 'leave', id: c.id });
  if (!room.size) rooms.delete(c.room);
  c.room = null;
}

wss.on('connection', (c) => {
  c.id = nextId++; c.room = null; c.name = 'CHRIS'; c.state = null; c.dirty = false; c.alive = true;
  c.on('pong', () => { c.alive = true; });
  c.on('message', (raw) => {
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (!m || typeof m !== 'object') return;
    if (m.t === 'hi') {
      const roomName = clean(m.room, 24).toLowerCase() || 'lobby';
      leave(c);
      const room = rooms.get(roomName) || new Set();
      if (room.size >= MAX) return send(c, { t: 'full', room: roomName, max: MAX });
      rooms.set(roomName, room);
      c.name = clean(m.name, 12).toUpperCase() || 'CHRIS' + c.id;
      c.room = roomName; c.state = null;
      send(c, { t: 'welcome', id: c.id, room: roomName, players: [...room].map(o => ({ id: o.id, name: o.name })) });
      toRoom(room, { t: 'join', id: c.id, name: c.name });
      room.add(c);
      // send them everyone's current state straight away (not just what changes later)
      const p = {}; for (const o of room) if (o !== c && o.state) p[o.id] = o.state;
      send(c, { t: 'snap', ts: Date.now(), p });
    } else if (m.t === 's' && c.room && Array.isArray(m.d) && m.d.length <= 16) {
      c.state = m.d.map(v => (typeof v === 'number' && isFinite(v) ? Math.round(v * 1000) / 1000 : 0));
      c.dirty = true;
    } else if (m.t === 'ev' && c.room && m.e && typeof m.e === 'object') {
      const room = rooms.get(c.room); if (room) toRoom(room, { t: 'ev', id: c.id, e: m.e }, c);
    }
  });
  c.on('close', () => leave(c));
  c.on('error', () => leave(c));
});

// 60 Hz: one snapshot per room, with only the players whose state changed since the last one
setInterval(() => {
  const ts = Date.now();
  for (const room of rooms.values()) {
    const p = {}; let any = false;
    for (const c of room) if (c.dirty && c.state) { p[c.id] = c.state; c.dirty = false; any = true; }
    if (any) toRoom(room, { t: 'snap', ts, p });
  }
}, 1000 / TICK_HZ);

// drop dead connections (phones that went to sleep without closing the socket)
setInterval(() => {
  for (const c of wss.clients) { if (!c.alive) { c.terminate(); continue; } c.alive = false; c.ping(); }
}, 10000);

server.listen(PORT, () => console.log(`luna-chris relay on :${PORT} (${TICK_HZ} Hz, max ${MAX}/room)`));
