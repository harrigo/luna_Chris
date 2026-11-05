// Luna Chris - multiplayer client (step 1: see each other run round the planet).
//
// Talks to the relay in server/ over a WebSocket. Every frame we send our own state (throttled to 60 a second);
// the server batches everyone's into 60 Hz snapshots. Other players are drawn INTERP_MS in the past, interpolated
// between the two snapshots either side of that moment, so they move smoothly even if packets bunch up.
//
// Turning it on (for now, until there's a menu for it) - add to the game's address:
//   ?mp=wss://your.server/path&room=friday&name=harri     a server, a room name to share, your name
//   ?mp=local                                              ws://<this host>:8787 (testing on your own network)
//   ?mp=off                                                switch it off again
// The settings are remembered on the device, so the next launch reconnects to the same room.
//
// State sent: [level id, theta (angle round the planet), h (height), vx, vh, facing, aimA, flags, weapon index]
// flags: 1 duck, 2 jetpack on, 4 firing, 8 powered up, 16 on the ground

const Net = (() => {
  const SEND_HZ = 60, INTERP_MS = 100, KEEP = 40;
  const F = { duck: 1, jet: 2, fire: 4, power: 8, ground: 16 };
  const st = { ws: null, url: null, room: null, name: null, id: null, status: 'off', peers: new Map(), lastSend: 0, retry: 0, sent: 0, got: 0, clockOff: null };

  function conf() {
    let c = null;
    try { c = JSON.parse(localStorage.getItem('lc_mp') || 'null'); } catch (e) {}
    const q = new URLSearchParams(location.search);
    if (q.has('mp')) {
      const v = q.get('mp');
      if (v === 'off' || v === '0') { try { localStorage.removeItem('lc_mp'); } catch (e) {} return null; }
      const url = v === 'local' || v === '1' ? (location.protocol === 'https:' ? 'wss://' : 'ws://') + (location.hostname || 'localhost') + ':8787' : v;
      c = { url, room: q.get('room') || (c && c.room) || 'lobby', name: q.get('name') || (c && c.name) || 'CHRIS' };
      try { localStorage.setItem('lc_mp', JSON.stringify(c)); } catch (e) {}
    } else if (c && (q.get('room') || q.get('name'))) {
      c.room = q.get('room') || c.room; c.name = q.get('name') || c.name;
    }
    return c;
  }

  function connect() {
    if (!st.url) return;
    st.status = 'connecting';
    let ws;
    try { ws = new WebSocket(st.url); } catch (e) { st.status = 'error'; return later(); }
    st.ws = ws;
    ws.onopen = () => { st.retry = 0; st.status = 'joining'; ws.send(JSON.stringify({ t: 'hi', room: st.room, name: st.name, v: typeof BUILD !== 'undefined' ? BUILD : '' })); };
    ws.onmessage = (ev) => {
      let m; try { m = JSON.parse(ev.data); } catch (e) { return; }
      const now = performance.now();
      if (m.t === 'welcome') {
        st.id = m.id; st.room = m.room; st.status = 'online'; st.peers.clear();
        for (const p of m.players) st.peers.set(p.id, { name: p.name, buf: [] });
      } else if (m.t === 'join') { st.peers.set(m.id, { name: m.name, buf: [] }); toast(m.name + ' JOINED'); }
      else if (m.t === 'leave') { const p = st.peers.get(m.id); if (p) toast(p.name + ' LEFT'); st.peers.delete(m.id); }
      else if (m.t === 'full') { st.status = 'full'; }
      else if (m.t === 'snap') {
        st.got++;
        // put snapshots on OUR clock: track the smallest (server - local) gap seen, which is the least-delayed packet
        const off = m.ts - now; st.clockOff = st.clockOff === null ? off : Math.min(st.clockOff + 0.02, off);
        const t = m.ts - st.clockOff;
        for (const id in m.p) {
          if (+id === st.id) continue;
          let p = st.peers.get(+id); if (!p) { p = { name: 'P' + id, buf: [] }; st.peers.set(+id, p); }
          p.buf.push({ t, d: m.p[id] }); if (p.buf.length > KEEP) p.buf.shift();
        }
      }
    };
    ws.onclose = () => { if (st.ws !== ws) return; st.ws = null; if (st.status !== 'full') st.status = 'offline'; st.peers.clear(); later(); };
    ws.onerror = () => {};
  }
  function later() { if (st.status === 'full') return; st.retry = Math.min(st.retry + 1, 6); setTimeout(connect, 500 * st.retry); }

  let toasts = [];
  function toast(s) { toasts.push({ s, t: performance.now() }); }

  const wrapA = (a) => { a %= Math.PI * 2; return a < 0 ? a + Math.PI * 2 : a; };
  const dA = (a, b) => { let d = (a - b) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };

  return {
    F,
    start() { const c = conf(); if (!c) return; st.url = c.url; st.room = c.room; st.name = c.name; connect(); },
    get on() { return st.status === 'online'; },
    get status() { return st.status; },
    get room() { return st.room; },
    get id() { return st.id; },
    get count() { return st.peers.size + (st.status === 'online' ? 1 : 0); },
    stats() { return { sent: st.sent, got: st.got, peers: st.peers.size }; },
    takeToasts() { const now = performance.now(); toasts = toasts.filter(x => now - x.t < 2500); return toasts; },
    // my state, every frame: throttled to SEND_HZ
    send(d) {
      const ws = st.ws; if (!ws || ws.readyState !== 1 || st.status !== 'online') return;
      const now = performance.now(); if (now - st.lastSend < 1000 / SEND_HZ - 2) return;
      st.lastSend = now; st.sent++;
      ws.send(JSON.stringify({ t: 's', d }));
    },
    event(e) { const ws = st.ws; if (ws && ws.readyState === 1 && st.status === 'online') ws.send(JSON.stringify({ t: 'ev', e })); },
    // every other player, as they were INTERP_MS ago: { id, name, d: [state...] } (interpolated), stale ones skipped
    peers() {
      const out = [], tr = performance.now() - INTERP_MS;
      for (const [id, p] of st.peers) {
        const b = p.buf; if (!b.length) continue;
        if (performance.now() - b[b.length - 1].t > 3000) continue;               // gone quiet: don't draw a frozen ghost
        let i = b.length - 1; while (i > 0 && b[i - 1].t > tr) i--;
        const A = b[Math.max(0, i - 1)], B = b[i];
        let d;
        if (A === B || B.t <= A.t || tr >= B.t) d = B.d.slice();
        else {
          const k = Math.max(0, Math.min(1, (tr - A.t) / (B.t - A.t)));
          d = B.d.slice();
          d[1] = wrapA(A.d[1] + dA(B.d[1], A.d[1]) * k);                          // theta: the short way round
          for (const j of [2, 3, 4, 6]) d[j] = A.d[j] + (B.d[j] - A.d[j]) * k;
        }
        out.push({ id, name: p.name, d });
      }
      return out;
    }
  };
})();
Net.start();
