// ================================================================= THE CHEESE SLOT (v3.102): the casino at the Moon Bar
// A 5 x 3 video slot with a UK-style FEATURE TRAIL, played with your own cheese: cheddar in story mode (from the shop's
// MEGA FRUITY button), golden crumbs in camp (the MOON BAR). The maths lives in slotmath.js and is tuned by
// tools/slotsim.js so it returns 95% however you play it.
//   * 10 paylines; BESSIE is wild (reels 2-4); three CHEESE STRENGTHS (Mild / Mature / Extra Mature) = volatility
//   * a STAR on the centre line climbs the trail a step; a spin without one may slip you back. Every step can be TAKEN:
//     cash, or a bonus game (FREE SPINS with sticky Bessies, the RAT TRAP pick-em, CHEDDAR RESPINS hold-and-spin). The
//     top pays the JACKPOT. Each step is worth exactly what climbing on is worth: taking is banking, not a mistake
//   * any win can be GAMBLED on hi-lo at true odds (it never changes the 95%)
//   * MEGA SPINS (one per golden set) are 10 free spins at your bet
const FM_INK = 0x1a1020;
const SLOT_BETS = { shop: [5, 10, 25, 50, 100], camp: [1, 2, 5, 10] };
const SLOT_TIERS = [[50, 'CHEESE-TASTROPHIC!', 0xff6ad0], [25, 'MEGA WIN!', 0xffd23f], [10, 'BIG WIN!', 0x7dff8a]];

// ---- the art: nine reel symbols (22 x 22), each lit from the top left with a dark outline, in the game's palette
function makeFruityTextures(scene) {
  if (scene.textures.exists('fm_wheel')) return;
  const S = 22, c = 10.5;
  const icon = (key, shape) => pixTex(scene, key, S, S, put => {
    const g = []; for (let y = 0; y < S; y++) { g.push([]); for (let x = 0; x < S; x++) g[y].push(shape(x + 0.5, y + 0.5, x, y)); }
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      if (g[y][x] != null) { put(x, y, g[y][x]); continue; }
      const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g[y + dy] && g[y + dy][x + dx] != null);
      if (n) put(x, y, FM_INK);
    }
  });
  const shade = (ramp, v, x, y) => { const f = Math.max(0, Math.min(ramp.length - 1, v * (ramp.length - 1))), i = Math.floor(f); return ramp[Math.min(ramp.length - 1, i + ((f - i) * 16 > bay(x, y) ? 1 : 0))]; };
  const disc = (x, y, cx, cy, r) => Math.hypot(x - cx, y - cy) <= r;
  const CH = [0x8a5a12, 0xc08a18, 0xf0c030, 0xffe070, 0xfff6c0];
  const GOLD = [0x7a4a0a, 0xb8781a, 0xe8b030, 0xffe070, 0xfffad0];
  // the cheese wedge
  icon('fm_wedge', (x, y, px, py) => {
    if (y < 7 || y > 18 || x < 2 || x > 20) return null;
    const top = 7 + (20 - x) * 0.33; if (y < top) return null;
    if (y < top + 3) return shade(CH, 0.95 - (x / 22) * 0.3, px, py);                   // the top face
    for (const [hx, hy, hr] of [[7, 13, 1.8], [13, 15, 1.4], [16, 11.5, 1.1]]) if (disc(x, y, hx, hy, hr)) return y < hy ? CH[0] : CH[1];
    return shade(CH, 0.62 - (y - 12) * 0.04 - (x / 22) * 0.15, px, py);
  });
  // a cheddar coin
  icon('fm_coin', (x, y, px, py) => {
    const d = Math.hypot(x - c, y - c); if (d > 9) return null;
    if (d > 7.2) return shade(GOLD, 0.55 + (-(x - c) - (y - c)) / 18 * 0.5, px, py);
    if (Math.abs(x - c) < 1.2 && Math.abs(y - c) < 4.5) return GOLD[1];                 // a "C"? no: a cheese-slice mark
    if (Math.abs(y - c) < 1.2 && Math.abs(x - c) < 4.5) return GOLD[1];
    return shade(GOLD, 0.62 + (-(x - c) - (y - c)) / 20 * 0.6, px, py);
  });
  // an armour plate
  const ST = [0x2a3048, 0x55618a, 0x8a9ac0, 0xc8d4ec, 0xffffff];
  icon('fm_plate', (x, y, px, py) => {
    const hw = y < 14 ? 8 : 8 - (y - 14) * 1.1; if (y < 3 || y > 20 || Math.abs(x - c) > hw) return null;
    if (Math.abs(x - c) < 1 && y > 5 && y < 17) return ST[1];
    if (disc(x, y, c - 5, 6, 0.9) || disc(x, y, c + 5, 6, 0.9)) return 0xffd23f;
    return shade(ST, 0.6 + (-(x - c)) / 16 * 0.6 - (y - 3) * 0.02, px, py);
  });
  // a Slow-Mo stopwatch
  const PU = [0x2a1a5a, 0x5a3aa0, 0x8a6ad0, 0xc0a8f0, 0xf0e8ff];
  icon('fm_slow', (x, y, px, py) => {
    if (x > 9 && x < 12 && y > 1 && y < 5) return ST[2];
    const d = Math.hypot(x - c, y - 12); if (d > 8.5) return null;
    if (d > 7) return shade(PU, 0.5 + (-(x - c) - (y - 12)) / 16 * 0.6, px, py);
    if ((Math.abs(x - c) < 0.8 && y < 12.5 && y > 6.5) || (Math.abs(y - 12) < 0.8 && x > c && x < c + 4.5)) return FM_INK;
    return shade([0xb8c0d8, 0xe8ecf8, 0xffffff], 0.7 - (y - 6) * 0.03, px, py);
  });
  // a chilli (POWER)
  const RD = [0x5a0e12, 0x9a1a1a, 0xd83a2a, 0xff7a5a, 0xffd0c0];
  icon('fm_power', (x, y, px, py) => {
    if (x > 13 && x < 17 && y > 1 && y < 6 && Math.abs((x - 15) - (y - 3) * 0.4) < 1.3) return 0x3a9a2a;     // the stalk
    const t = (x - 3) / 14; if (t < 0 || t > 1) return null;
    const cy = 6 + t * 3 + Math.sin(t * 3.1) * 5, r = 4.2 * Math.sin(Math.PI * Math.min(1, t * 1.05 + 0.08)) + 0.6;
    if (Math.abs(y - cy) > r) return null;
    if (y - cy < -r * 0.45 && x > 6 && x < 14) return RD[4];
    return shade(RD, 0.7 - (y - cy) / r * 0.3, px, py);
  });
  // 2X
  const GR = [0x0e3a20, 0x1a6a36, 0x2aa04a, 0x6ad878, 0xc8ffd0];
  const X2 = ['##..#.....#', '..#..#...#.', '..#...#.#..', '.#.....#...', '#.....#.#..', '#....#...#.', '###.#.....#'];
  icon('fm_x2', (x, y, px, py) => {
    const bx = Math.floor(x) - 5, by = Math.floor(y) - 8;
    if (by >= 0 && by < 7 && bx >= 0 && bx < 11 && X2[by][bx] === '#') return 0xffffff;
    if (Math.abs(x - c) > 9.5 || Math.abs(y - c) > 7.5) return null;
    return shade(GR, 0.65 - (y - 4) * 0.035 - (x / 22) * 0.12, px, py);
  });
  // a heart
  icon('fm_heart', (x, y, px, py) => {
    const X = (x - c) / 8, Y = -(y - 11) / 8, q = X * X + Y * Y - 0.85, v = q * q * q - X * X * Y * Y * Y;
    if (v > 0) return null;
    if (disc(x, y, c - 3.5, 7.5, 1.6)) return RD[4];
    return shade(RD, 0.72 - (y - 5) * 0.03 - (x - 4) * 0.012, px, py);
  });
  // the golden cheese wheel (the jackpot)
  icon('fm_wheel', (x, y, px, py) => {
    const d = Math.hypot(x - c, (y - c) * 1.05); if (d > 9.6) return null;
    const a = Math.atan2(y - c, x - c);
    if (d < 2.2) return GOLD[4];
    if (d > 8) return shade(GOLD, 0.45 + (-(x - c) - (y - c)) / 20 * 0.6, px, py);
    if (Math.abs(((a / (Math.PI / 4)) % 1 + 1) % 1 - 0.5) > 0.42 && d > 2.5) return GOLD[1];   // the cuts between wedges
    return shade(GOLD, 0.7 + (-(x - c) - (y - c)) / 20 * 0.55, px, py);
  });
  // the rat (the dud)
  const RT = [0x3a3448, 0x5a5468, 0x8a8498, 0xb8b2c4, 0xe8e4f0];
  icon('fm_rat', (x, y, px, py) => {
    if (disc(x, y, 5.5, 6.5, 3.2) || disc(x, y, 16.5, 6.5, 3.2)) return disc(x, y, 5.5, 6.5, 1.6) || disc(x, y, 16.5, 6.5, 1.6) ? 0xd88a9a : RT[2];
    const d = Math.hypot((x - c) / 7.5, (y - 12.5) / 6.5); if (d > 1) return null;
    if (disc(x, y, 8, 11.5, 1.1) || disc(x, y, 13, 11.5, 1.1)) return 0xff3a3a;
    if (disc(x, y, c, 16.5, 1.3)) return 0xd88a9a;
    return shade(RT, 0.62 - (y - 7) * 0.03 - (x - 4) * 0.01, px, py);
  });
  // BESSIE (the wild): a cow's head, white with black patches, pink muzzle, little horns
  const WH = [0x8a8498, 0xc8c4d4, 0xf4f0f8, 0xffffff];
  icon('fm_bessie', (x, y, px, py) => {
    if ((disc(x, y, 4, 5, 2) && y < 6) || (disc(x, y, 18, 5, 2) && y < 6)) return 0xf0e0b0;              // horns
    if (disc(x, y, 3, 9, 2.6) || disc(x, y, 19, 9, 2.6)) return disc(x, y, 3, 9, 1.2) || disc(x, y, 19, 9, 1.2) ? 0xd88a9a : WH[1];   // ears
    const head = Math.hypot((x - c) / 7, (y - 10) / 7.5) <= 1, muz = Math.hypot((x - c) / 6, (y - 16.5) / 4) <= 1;
    if (!head && !muz) return null;
    if (muz) return disc(x, y, c - 2.5, 16.5, 1) || disc(x, y, c + 2.5, 16.5, 1) ? 0x8a3a4a : shade([0xb86a7a, 0xe8a0b0, 0xffd0dc], 0.7 - (y - 13) * 0.06, px, py);
    if (disc(x, y, 7.5, 10, 1.3) || disc(x, y, 13.5, 10, 1.3)) return FM_INK;
    if (disc(x, y, 8, 9.6, 0.5) || disc(x, y, 14, 9.6, 0.5)) return 0xffffff;
    if (disc(x, y, 14, 5.5, 3) || disc(x, y, 6, 13, 1.8)) return 0x2a2438;                                // patches
    return shade(WH, 0.85 - (y - 3) * 0.02 - (x - 4) * 0.012, px, py);
  });
  // the STAR (moves the trail): a fat five-point golden star with a glint
  icon('fm_star', (x, y, px, py) => {
    const dx = x - c, dy = y - 11.5, a = Math.atan2(dy, dx) + Math.PI / 2, rr = Math.hypot(dx, dy);
    const k = Math.cos(((a / (Math.PI * 2 / 5)) % 1 + 1) % 1 * Math.PI * 2 / 5 - Math.PI / 5), lim = 4.6 / Math.max(0.42, k * 1.05) * (0.55 + 0.45 * k);
    if (rr > Math.min(10, lim + 1)) return null;
    if (disc(x, y, c - 2.5, 8, 1.2)) return 0xffffff;
    return shade(GOLD, 0.85 - (dy + dx * 0.5) / 22 - rr / 40, px, py);
  });
}

// ---- the camp bar (a station on the moon): a little lean-to with a counter, a stool, a neon sign and the machine
function makeBarTexture(scene) {
  pixTex(scene, 'cr_bar', 64, 56, (put, w, h) => {
    const WD = [0x2a160c, 0x4a2a14, 0x6a3e1e, 0x8a5a2a], R = [0x5a0e1a, 0x8a1a2a, 0xb83040, 0xe05a5a];
    const rect = (x0, y0, x1, y1, f) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const c = f(x, y); if (c != null) put(x, y, c); } };
    rect(2, 10, 61, 55, (x, y) => (x === 2 || x === 61 || y === 10) ? FM_INK : null);
    rect(3, 11, 60, 13, (x, y) => (x + y) % 6 < 3 ? 0xd83a2a : 0xf4ece0);                              // a striped awning
    rect(3, 14, 60, 14, () => FM_INK);
    rect(3, 15, 60, 54, (x, y) => WD[(y % 6 === 0) ? 0 : 1 + ((x * 7 + Math.floor(y / 6) * 13) % 9 === 0 ? 1 : 0)]);   // the back wall, planks
    for (const sx of [8, 14, 20]) rect(sx, 19, sx + 3, 24, (x, y) => y === 19 ? FM_INK : [0x2aa04a, 0x5a3aa0, 0xd83a2a][(sx / 6) % 3 | 0]);   // bottles on a shelf
    rect(6, 25, 26, 26, () => WD[3]);
    const NE = 'BAR';                                                                                    // the neon sign
    const glyph = { B: ['##.', '#.#', '##.', '#.#', '##.'], A: ['.#.', '#.#', '###', '#.#', '#.#'], R: ['##.', '#.#', '##.', '#.#', '#.#'] };
    for (let k = 0; k < 3; k++) for (let gy = 0; gy < 5; gy++) for (let gx = 0; gx < 3; gx++) if (glyph[NE[k]][gy][gx] === '#') { const x = 33 + k * 5 + gx, y = 18 + gy; put(x, y, 0xff6ad0); }
    rect(31, 16, 47, 24, (x, y) => (x === 31 || x === 47 || y === 16 || y === 24) ? 0x8a2a7a : null);
    rect(3, 34, 44, 38, (x, y) => y === 34 ? FM_INK : y === 35 ? WD[3] : WD[2]);                         // the counter
    rect(4, 39, 44, 54, (x, y) => x === 44 ? FM_INK : WD[(x % 8 === 0) ? 0 : 1]);
    rect(48, 18, 60, 54, (x, y) => (x === 48 || x === 60 || y === 18) ? FM_INK : null);                  // the fruit machine
    rect(49, 19, 59, 54, (x, y) => y < 23 ? (Math.floor(x / 2) % 2 ? 0xffd23f : 0xff6a2a) : R[x < 51 ? 2 : x > 57 ? 0 : 1]);
    rect(50, 26, 58, 32, (x, y) => (y === 26 || y === 32 || x === 50 || x === 58) ? 0xc8ccd8 : (x === 53 || x === 55) ? 0x8a8498 : [0xf4ecd8, 0xffd23f, 0xf4ecd8][Math.floor((x - 51) / 2) % 3]);
    rect(51, 29, 57, 29, () => 0xff3a3a);                                                                // the payline
    rect(61, 24, 62, 34, () => 0xc8ccd8); rect(60, 21, 63, 24, () => 0xff3a3a);                         // the lever
    rect(52, 44, 56, 46, () => FM_INK);                                                                  // the coin tray
    rect(20, 41, 25, 42, () => R[2]); rect(22, 43, 23, 54, () => 0xc8ccd8); rect(19, 54, 26, 54, () => 0xc8ccd8);   // a stool
  });
}


class FruityScene extends Phaser.Scene {
  constructor() { super('fruity'); }
  init(data) { this.from = (data && data.from) || 'shop'; }
  // ---------------------------------------------------------------- money: cheddar (story) or golden crumbs (camp)
  bal() { return this.from === 'camp' ? Meta.crumbs() : Shop.get(this.registry).coins; }
  addBal(n) {                                       // whole units only; the fractions are carried, so the 95% is exact
    const t = n + (this.carry || 0), w = Math.floor(t + 1e-9); this.carry = t - w;
    if (w === 0) return 0;
    if (this.from === 'camp') Meta.addCrumbs(w); else { const s = Shop.get(this.registry); s.coins += w; Shop.set(this.registry, s); }
    return w;
  }
  unit() { return this.from === 'camp' ? 'CRUMBS' : 'CHEDDAR'; }
  bet() { return SLOT_BETS[this.from][this.betI]; }
  saveTrail() { this.registry.set('slot_' + this.from, { sk: this.sk, betI: this.betI, pos: this.pos }); }
  create() {
    makeTextures(this); makeFruityTextures(this);
    this.cameras.main.setBackgroundColor('#120c1c'); this.cameras.main.fadeIn(220, 0, 0, 0);
    Sound.init(); Sound.music(null);
    const sv = this.registry.get('slot_' + this.from) || {};
    this.sk = sv.sk || 'mature'; this.betI = sv.betI !== undefined ? sv.betI : 1; this.pos = sv.pos !== undefined ? sv.pos : -1;
    this.carry = 0; this.going = false; this.ph = 'idle'; this.t = 0; this.lightT = 0; this.free = 0; this.freeTot = 0;
    this.lastWin = 0; this.winLines = []; this.coins = []; this.sparks = []; this.flyers = []; this.banner = null; this.shownBal = this.bal();
    this.R = [0, 1, 2, 3, 4].map(i => ({ pos: Math.floor(Math.random() * 30), stop: null, v: 0, ant: false }));
    this.sticky = [];
    this.bg = this.add.graphics().setDepth(0); this.cab = this.add.graphics().setDepth(1);
    this.sym = this.R.map(() => [0, 1, 2, 3, 4].map(() => this.add.image(0, 0, 'fm_wedge').setDepth(2)));
    this.stickyIm = []; for (let i = 0; i < 15; i++) this.stickyIm.push(this.add.image(0, 0, 'fm_bessie').setDepth(2.5).setVisible(false));
    this.fg = this.add.graphics().setDepth(3); this.trailG = this.add.graphics().setDepth(3);
    this.ui = this.add.container(0, 0).setDepth(4); this.fx = this.add.graphics().setDepth(6); this.top = this.add.container(0, 0).setDepth(7);
    const kb = this.input.keyboard;
    if (kb) {
      kb.on('keydown-SPACE', () => this.mainBtn()); kb.on('keydown-ENTER', () => this.mainBtn());
      kb.on('keydown-T', () => this.takeStep()); kb.on('keydown-G', () => this.gambleOpen());
      kb.on('keydown-LEFT', () => this.setBet(-1)); kb.on('keydown-RIGHT', () => this.setBet(1)); kb.on('keydown-S', () => this.setStrength());
      kb.on('keydown-ESC', () => this.back());
    }
    const padOff = typeof Pad !== 'undefined' ? Pad.on(b => { if (b === 'a') this.mainBtn(); else if (b === 'x') this.takeStep(); else if (b === 'y') this.gambleOpen(); else if (b === 'b') this.back(); else if (b === 'left') this.setBet(-1); else if (b === 'right') this.setBet(1); }) : null;
    if (padOff) this.events.once('shutdown', padOff);
    this.input.on('pointerdown', p => { const hit = [...(this.boxes || []), ...(this.oBoxes || [])].reverse().find(q => q.on() && p.x >= q.x && p.x <= q.x + q.w && p.y >= q.y && p.y <= q.y + q.h); if (hit) hit.fn(); });
    this.build();
    this.scale.on('resize', this.build, this);
    this.events.once('shutdown', () => { this.scale.off('resize', this.build, this); this.saveTrail(); });
    this.say(this.from === 'camp' ? 'WELCOME TO THE MOON BAR. CRUMBS IN, CHEESE OUT.' : 'THE MEGA FRUITY. PLAY YOUR CHEDDAR.');
  }
  say(m, col) { this.msg = m; if (this.msgT) this.msgT.setText(m).setColor(col || '#ffd23f'); }
  // ---------------------------------------------------------------- layout
  geom() {
    const W = this.scale.width, H = this.scale.height, zi = H >= 360 && W >= 720 ? 2 : 1.5;
    const cw = 22 * zi + 8, chh = 22 * zi + 6, rw = 5 * cw + 4 * 4, rh = 3 * chh;
    const tw = Math.max(130, Math.min(170, W * 0.19)), pw = Math.max(150, Math.min(200, W * 0.23));
    const cx = tw + 14 + (W - tw - pw - 28) / 2, rx = Math.round(cx - rw / 2), ry = Math.round(Math.max(56, (H - rh) / 2 - 6));
    return { W, H, zi, cw, chh, rw, rh, rx, ry, tw, pw, px: W - pw - 8 };
  }
  cell(r, k) { const G = this.geom(); return { x: G.rx + r * (G.cw + 4) + G.cw / 2, y: G.ry + k * G.chh + G.chh / 2 }; }
  build() {
    const G = this.geom(), { W, H } = G, f = (s, c, o) => Object.assign({ fontFamily: PIXEL, fontSize: s + 'px', color: c, stroke: '#1a1020', strokeThickness: 3 }, o || {});
    this.ui.removeAll(true); this.boxes = [];
    const btn = (x, y, w, h, label, col, fn, on, sz) => {
      const g = this.add.graphics(), t = this.add.text(x + w / 2, y + h / 2, '', f(sz || 8, '#ffffff')).setOrigin(0.5);
      this.ui.add([g, t]); const B = { x, y, w, h, fn, on: on || (() => true), g, t, label, col };
      B.draw = () => { const live = B.on(); g.clear(); hudBox(g, x, y, w, h, live ? (typeof B.col === 'function' ? B.col() : B.col) : 0x241e2e, 1); t.setText(typeof B.label === 'function' ? B.label() : B.label).setAlpha(live ? 1 : 0.4); };
      this.boxes.push(B); return B;
    };
    // the right panel: balance, bet, strength, SPIN, TAKE, GAMBLE, MEGA, BACK
    const x = G.px, w = G.pw;
    const pg = this.add.graphics(); hudBox(pg, x, 8, w, 58, 0x1c1430, 0.95); this.ui.add(pg);
    this.ui.add(this.add.text(x + w / 2, 14, this.unit(), f(7, '#9fa6c2')).setOrigin(0.5, 0));
    this.balT = this.add.text(x + w / 2, 26, '', f(14, '#ffd23f')).setOrigin(0.5, 0); this.ui.add(this.balT);
    this.winT = this.add.text(x + w / 2, 48, '', f(7, '#7dff8a')).setOrigin(0.5, 0); this.ui.add(this.winT);
    let y = 74;
    btn(x, y, 30, 26, '-', 0x2a2440, () => this.setBet(-1), () => this.canSetup(), 10);
    this.betB = btn(x + 34, y, w - 68, 26, () => 'BET ' + this.bet(), 0x2a2440, () => {}, () => true, 8);
    btn(x + w - 30, y, 30, 26, '+', 0x2a2440, () => this.setBet(1), () => this.canSetup(), 10);
    y += 32;
    btn(x, y, w, 26, () => SLOT.STRENGTHS[this.sk].name, () => ({ mild: 0x6a5a1a, mature: 0x7a4a0a, extra: 0x7a2a0a })[this.sk], () => this.setStrength(), () => this.canSetup(), 8);
    y += 34;
    this.spinB = btn(x, y, w, 40, () => this.ph === 'free' ? 'FREE SPINS...' : this.free > 0 ? 'FREE SPIN (' + this.free + ')' : 'SPIN', () => this.free > 0 ? 0x2a8a8a : 0x2a8a3a, () => this.mainBtn(), () => this.ph === 'idle', 12);
    y += 46;
    this.takeB = btn(x, y, w, 28, () => this.pos >= 0 ? 'TAKE ' + this.stepName(this.pos, true) : 'TAKE (CLIMB THE TRAIL)', 0x8a5a0a, () => this.takeStep(), () => this.ph === 'idle' && this.pos >= 0, 7);
    y += 34;
    this.gamB = btn(x, y, w, 24, () => this.lastWin > 0 ? 'GAMBLE ' + this.lastWin : 'GAMBLE', 0x5a2a7a, () => this.gambleOpen(), () => this.ph === 'idle' && this.lastWin > 0, 7);
    y += 30;
    this.megaB = btn(x, y, w, 24, () => 'MEGA SPIN (' + Shop.megaLeft() + ')', 0x8a6a10, () => this.mega(), () => this.ph === 'idle' && Shop.megaLeft() > 0 && this.free <= 0, 7);
    btn(W - 72, H - 30, 64, 22, 'BACK', 0x2a2440, () => this.back(), () => this.ph === 'idle' || this.ph === 'gamble', 7);
    // messages under the reels
    this.msgT = this.add.text(G.rx + G.rw / 2, G.ry + G.rh + 20, this.msg || '', f(8, '#ffd23f', { align: 'center', wordWrap: { width: G.rw + 40 } })).setOrigin(0.5, 0); this.ui.add(this.msgT);
    this.hdrT = this.add.text(G.rx + G.rw / 2, 10, '', f(11, '#ffd23f')).setOrigin(0.5, 0); this.ui.add(this.hdrT);
    // the trail's labels
    this.trailT = SLOT.STRENGTHS[this.sk].trail.map(() => { const t = this.add.text(0, 0, '', f(7, '#ffffff', { strokeThickness: 2 })).setOrigin(0, 0.5); this.ui.add(t); return t; });
    this.refresh();
  }
  refresh() { (this.boxes || []).forEach(B => B.draw && B.draw()); }
  canSetup() { return this.ph === 'idle' && this.pos < 0 && this.free <= 0; }
  setBet(d) {
    if (!this.canSetup()) { if (this.ph === 'idle' && this.pos >= 0) this.say('TAKE THE TRAIL (OR LOSE IT) BEFORE CHANGING YOUR BET.', '#ff9a7a'); return; }
    this.betI = Math.max(0, Math.min(SLOT_BETS[this.from].length - 1, this.betI + d)); Sound.sfx('blip'); this.saveTrail(); this.refresh();
  }
  setStrength() {
    if (!this.canSetup()) { if (this.ph === 'idle' && this.pos >= 0) this.say('FINISH THE TRAIL FIRST.', '#ff9a7a'); return; }
    const ks = Object.keys(SLOT.STRENGTHS); this.sk = ks[(ks.indexOf(this.sk) + 1) % ks.length]; Sound.sfx('jump');
    this.say(SLOT.STRENGTHS[this.sk].name + ': ' + SLOT.STRENGTHS[this.sk].desc.toUpperCase(), '#ffffff'); this.saveTrail(); this.build();
  }
  stepName(p, short) {
    const s = SLOT.STRENGTHS[this.sk].trail[p], v = SLOT.TUNE[this.sk].val[p] * this.bet();
    const nm = { FREE: 'FREE SPINS', SUPER: 'SUPER SPINS', RAT: 'RAT TRAP', RESPIN: 'CHEDDAR RESPINS', JACKPOT: 'JACKPOT' }[s];
    return nm ? (short ? nm : nm + ' ~' + Math.round(v)) : String(Math.max(1, Math.round(v)));
  }
  back() {
    if (this.going) return;
    if (this.ph === 'gamble') { this.gambleEnd(true); return; }
    if (this.ph !== 'idle') return;
    this.going = true; this.saveTrail(); Sound.sfx('wave'); this.cameras.main.fadeOut(200, 0, 0, 0);
    this.time.delayedCall(220, () => { if (this.from === 'camp') this.scene.start('level1', { camp: true, at: 2.45 }); else this.scene.start('shop'); });
  }
  // ---------------------------------------------------------------- spinning
  mainBtn() { if (this.ph === 'gamble') return; if (this.ph === 'show') { this.skipCount(); return; } if (this.ph === 'idle') this.spin(); }
  mega() {
    if (this.ph !== 'idle' || Shop.megaLeft() <= 0 || this.free > 0) return;
    Shop.useMega(); this.free = 10; Sound.sfx('reveal'); this.cameras.main.flash(250, 255, 220, 120);
    this.bigBanner('10 FREE SPINS!', 0x5ce1ff, 1.4); this.say('A MEGA SPIN: 10 FREE SPINS AT ' + this.bet() + ' A GO.', '#5ce1ff'); this.refresh();
    this.time.delayedCall(1400, () => { if (this.ph === 'idle' && this.free > 0) this.spin(); });
  }
  spin() {
    const bet = this.bet(), freeSpin = this.free > 0;
    if (!freeSpin && this.bal() < bet) { Sound.sfx('clunk'); this.say('NOT ENOUGH ' + this.unit() + '. LOWER THE BET.', '#ff7a6a'); this.cameras.main.shake(100, 0.004); return; }
    if (freeSpin) this.free--; else this.addBal(-bet);
    this.lastWin = 0; this.winLines = []; this.res = SLOT.play(this.sk, Math.random, this.pos);
    this.startReels(this.res.stops, null);
    this.ph = 'spin'; this.say(''); Sound.sfx('clang'); this.refresh();
  }
  // set the reels going and say where each stops (anticipation: a slow, tense last reel or two when something big is close)
  startReels(stops, opts) {
    const res = this.res, starsBy = i => res && res.grid ? res.grid.slice(0, i).filter(c => c[1] === SLOT.STAR).length : 0;
    let t = 0.45;
    this.R.forEach((R, i) => {
      const lead = starsBy(i), ant = !(opts && opts.fast) && res && res.grid && i >= 2 && (lead >= 2 || (this.pos >= 0 && this.pos + lead >= SLOT.STRENGTHS[this.sk].trail.length - 2 && lead >= 1));
      t += ant ? 0.9 : (opts && opts.fast ? 0.12 : 0.2);
      R.v = 22 + i * 2; R.stop = { at: t, to: stops[i], go: false }; R.ant = ant;
    });
    this.spinT = 0;
  }
  reelsMoving() { return this.R.some(R => R.stop); }
  onReelStop(i) {
    Sound.sfx('clunk');
    const g = this.res && this.res.grid; if (!g) return;
    if (g[i][1] === SLOT.STAR) {                       // a star on the line: it flies to the trail
      Sound.sfx('chime'); const c = this.cell(i, 1); this.flyers.push({ x: c.x, y: c.y, t: 0, key: 'fm_star' });
      this.burstAt(c.x, c.y, 0xffd23f, 10);
    }
    if (this.R[i + 1] && this.R[i + 1].ant && this.R[i + 1].stop) { Sound.sfx('reveal'); this.cameras.main.shake(120, 0.003); }
  }
  // the reels have stopped: pay the lines, move the trail
  settle() {
    const r = this.res, bet = this.bet();
    this.winLines = r.wins;
    let win = r.x * bet;
    const old = this.pos; this.pos = r.pos;
    if (r.stars > 0) { this.say(r.stars > 1 ? r.stars + ' STARS! UP ' + r.stars + ' STEPS.' : 'A STAR! UP THE TRAIL.', '#ffd23f'); this.trailPulse = 1; }
    else if (r.slipped) { this.say('NO STAR... THE TRAIL SLIPS.', '#ff9a7a'); Sound.sfx('zing'); this.trailSlip = 1; }
    if (r.feat) {                                         // the top: JACKPOT
      win += r.feat.x * bet; this.jackpot(r.feat.x * bet); if (typeof Ach !== 'undefined') Ach.unlock('jackpot');
    }
    this.lastWin = this.addBal(win) + 0; this.lastWinF = win;
    if (win > 0) { this.countWin(win, win / bet); if (r.wins.length) Sound.sfx('pickup'); }
    else this.ph = 'idle';
    this.saveTrail(); this.refresh();
    if (this.free > 0 && this.ph === 'idle') this.time.delayedCall(450, () => { if (this.ph === 'idle' && this.free > 0) this.spin(); });
  }
  // ---------------------------------------------------------------- the win counter and the big-win show
  countWin(amount, x) {
    const tier = SLOT_TIERS.find(q => x >= q[0]);
    this.ph = 'show'; this.count = { v: 0, to: amount, dur: tier ? 1.6 + SLOT_TIERS.length - SLOT_TIERS.indexOf(tier) : Math.min(1.2, 0.3 + x * 0.12), t: 0 };
    if (tier) { this.bigBanner(tier[1], tier[2], this.count.dur); this.cameras.main.shake(400, 0.008); Sound.sfx('power'); this.time.delayedCall(300, () => Sound.sfx('achieve')); this.fountain(tier[0] >= 50 ? 90 : tier[0] >= 25 ? 60 : 36); }
    else if (x >= 2) this.fountain(8 + Math.round(x * 2));
  }
  skipCount() { if (this.count) this.count.t = this.count.dur; }
  bigBanner(text, col, dur) {
    if (this.banner) this.banner.t.destroy();
    const G = this.geom(), t = this.add.text(G.rx + G.rw / 2, G.ry + G.rh / 2, text, { fontFamily: PIXEL, fontSize: '26px', color: '#' + col.toString(16).padStart(6, '0'), stroke: '#1a1020', strokeThickness: 7 }).setOrigin(0.5).setDepth(8).setScale(0.1);
    this.banner = { t, life: dur + 1, max: dur + 1 };
  }
  fountain(n) { const G = this.geom(); for (let k = 0; k < n; k++) this.coins.push({ x: G.rx + G.rw / 2 + (Math.random() - 0.5) * 60, y: G.ry + G.rh, vx: (Math.random() - 0.5) * 420, vy: -260 - Math.random() * 420, r: Math.random() * 6, d: Math.random() < 0.5 }); }
  burstAt(x, y, col, n) { for (let k = 0; k < n; k++) { const a = Math.random() * 6.28, s = 60 + Math.random() * 160; this.sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5 + Math.random() * 0.4, col }); } }
  jackpot(amount) {
    this.bigBanner('JACKPOT!!!', 0xffd23f, 3.5); this.cameras.main.flash(500, 255, 240, 150); this.cameras.main.shake(900, 0.014); this.fountain(140);
    Sound.sfx('achieve'); this.time.delayedCall(400, () => Sound.sfx('power')); this.time.delayedCall(900, () => Sound.sfx('achieve'));
  }
  // ---------------------------------------------------------------- TAKE: cash, or a bonus game
  takeStep() {
    if (this.ph !== 'idle' || this.pos < 0) return;
    const f = SLOT.take(this.sk, this.pos, Math.random), bet = this.bet(); this.pos = -1; this.saveTrail();
    if (typeof Ach !== 'undefined') Ach.unlock('fruity');
    if (f.kind === 'cash') { const w = f.x * bet; this.lastWin = this.addBal(w); this.say('BANKED ' + Math.round(w) + ' ' + this.unit() + '!', '#7dff8a'); Sound.sfx('power'); this.countWin(w, f.x); this.refresh(); return; }
    this.feat = f; this.featPaid = 0;
    if (f.kind === 'free' || f.kind === 'super') this.freeStart(f);
    else if (f.kind === 'rat') this.ratStart(f);
    else this.respinStart(f);
    this.refresh();
  }
  // FREE SPINS: the bonus's own spins, played out on the reels, Bessies sticking where they land
  freeStart(f) {
    this.ph = 'free'; this.fi = 0; this.sticky = []; this.freeTot = 0;
    this.bigBanner(f.kind === 'super' ? 'SUPER SPINS!' : 'FREE SPINS!', 0x5ce1ff, 1.4); Sound.sfx('reveal'); this.cameras.main.flash(250, 120, 220, 255);
    this.say(f.log.length + ' SPINS. BESSIES STICK' + (f.log[0].mult > 1 ? ', ALL WINS x' + f.log[0].mult : '') + '.', '#5ce1ff');
    this.time.delayedCall(1500, () => this.freeNext());
  }
  freeNext() {
    const f = this.feat; if (!f) return;
    if (this.fi >= f.log.length) {
      const amt = this.freeTot; this.bigBanner('FREE SPINS WON ' + Math.round(amt), 0x5ce1ff, 1.6); this.say('');
      this.sticky = []; this.feat = null; this.lastWin = Math.round(amt); this.lastWinF = amt;
      if (amt > 0) this.countWin(amt, amt / this.bet()); else this.ph = 'idle';
      this.refresh(); return;
    }
    const L = f.log[this.fi]; this.res = { grid: L.grid, stops: L.stops }; this.freeEntry = L;
    this.startReels(L.stops, { fast: false }); this.ph = 'freespin'; Sound.sfx('clang');
    this.hdrFree = 'FREE SPIN ' + (this.fi + 1) + ' / ' + f.log.length;
  }
  freeSettle() {
    const L = this.freeEntry, f = this.feat, bet = this.bet();
    this.sticky = L.sticky; this.winLines = SLOT.lineWins(L.grid).map(w => Object.assign(w, { x: w.x * L.mult * f.k }));
    const w = L.w * L.mult * f.k * bet; this.freeTot += w; this.addBal(w);
    if (w > 0) { Sound.sfx('pickup'); this.fountain(Math.min(30, 6 + Math.round(w / bet))); this.say('+' + Math.round(w), '#7dff8a'); }
    this.fi++; this.ph = 'free'; this.time.delayedCall(w > 0 ? 900 : 450, () => this.freeNext());
  }
  // THE RAT TRAP: pick cheeses, each a prize, until you find a rat
  ratStart(f) {
    this.ph = 'rat'; this.ratN = 0; this.ratTot = 0; this.ratDone = false;
    this.bigBanner('RAT TRAP!', 0xff9a2a, 1.2); Sound.sfx('reveal');
    this.say('PICK THE CHEESES. FIND A RAT AND IT\'S OVER.', '#ff9a2a');
    this.overlay(o => {
      const G = this.geom(), n = f.cards.length, cols = Math.ceil(n / 3), cw = Math.min(56, (G.rw + 80) / cols - 6), ch = 46, x0 = G.rx + G.rw / 2 - (cols * (cw + 6) - 6) / 2, y0 = G.ry + G.rh / 2 - (3 * (ch + 6) - 6) / 2;
      this.ratCells = [];
      for (let i = 0; i < n; i++) {
        const x = x0 + (i % cols) * (cw + 6), y = y0 + Math.floor(i / cols) * (ch + 6), g = this.add.graphics(), im = this.add.image(x + cw / 2, y + ch / 2 - 4, 'fm_wedge').setScale(1.4), t = this.add.text(x + cw / 2, y + ch - 9, '', { fontFamily: PIXEL, fontSize: '8px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 3 }).setOrigin(0.5);
        hudBox(g, x, y, cw, ch, 0x3a2a14, 1); o.add([g, im, t]);
        const C = { x, y, w: cw, h: ch, g, im, t, open: false };
        this.ratCells.push(C); this.oBoxes.push({ x, y, w: cw, h: ch, on: () => this.ph === 'rat' && !C.open && !this.ratDone, fn: () => this.ratPick(C) });
      }
    });
  }
  ratPick(C) {
    const f = this.feat, v = f.cards[this.ratN++]; C.open = true;
    this.tweens.add({ targets: C.im, scaleX: 0, duration: 90, yoyo: true, onYoyo: () => C.im.setTexture(v ? 'fm_wedge' : 'fm_rat') });
    if (!v) { Sound.sfx('squish'); this.cameras.main.shake(250, 0.01); C.t.setText('RAT!').setColor('#ff7a6a'); this.ratDone = true; this.time.delayedCall(900, () => this.ratEnd()); return; }
    const w = v * f.k * this.bet(); this.ratTot += w; this.addBal(w); C.t.setText('+' + Math.round(w)).setColor('#7dff8a');
    Sound.sfx('pickup'); this.burstAt(C.x + C.w / 2, C.y + C.h / 2, 0xffd23f, 12); this.say('TOTAL ' + Math.round(this.ratTot) + '. KEEP PICKING!', '#ffd23f');
    if (this.ratN >= f.cards.length) { this.ratDone = true; this.time.delayedCall(700, () => this.ratEnd()); }
  }
  ratEnd() { const amt = this.ratTot; this.closeOverlay(); this.feat = null; this.lastWin = Math.round(amt); this.lastWinF = amt; if (amt > 0) this.countWin(amt, amt / this.bet()); else this.ph = 'idle'; this.say('THE RAT TRAP PAID ' + Math.round(amt) + '.', '#ffd23f'); this.refresh(); }
  // CHEDDAR RESPINS: coins lock on the grid; three respins, reset by every new coin; fill it for the grand prize
  respinStart(f) {
    this.ph = 'respin'; this.rsLeft = 3; this.rsRound = 0;
    this.bigBanner('CHEDDAR RESPINS!', 0xffd23f, 1.2); Sound.sfx('reveal');
    const added = new Set([].concat(...f.rounds)); this.rsOn = f.cells.map((v, i) => v && !added.has(i));
    this.overlay(o => {
      this.rsCells = [];
      for (let i = 0; i < 15; i++) {
        const r = Math.floor(i / 3), k = i % 3, c = this.cell(r, k), G = this.geom(), g = this.add.graphics(), t = this.add.text(c.x, c.y, '', { fontFamily: PIXEL, fontSize: '9px', color: '#1a1020' }).setOrigin(0.5);
        o.add([g, t]); this.rsCells.push({ c, g, t, G });
      }
    });
    this.rsDraw(); this.say('3 RESPINS. EVERY NEW COIN RESETS THEM.', '#ffd23f');
    this.time.delayedCall(1300, () => this.rsNext());
  }
  rsDraw(flick) {
    const f = this.feat, bet = this.bet();
    this.rsCells.forEach((C, i) => {
      const { c, G } = C, w = G.cw - 2, h = G.chh - 2; C.g.clear();
      if (this.rsOn[i]) { C.g.fillStyle(FM_INK, 1).fillRect(c.x - w / 2, c.y - h / 2, w, h); C.g.fillStyle(0xc8902a, 1).fillRect(c.x - w / 2 + 2, c.y - h / 2 + 2, w - 4, h - 4); C.g.fillStyle(0xffd23f, 1).fillRect(c.x - w / 2 + 2, c.y - h / 2 + 2, w - 4, 3); C.t.setText(String(Math.round(f.cells[i] * f.k * bet)));
      } else { C.g.fillStyle(0x0e0a16, 0.9).fillRect(c.x - w / 2, c.y - h / 2, w, h); if (flick && Math.random() < 0.3) C.g.fillStyle(0xffd23f, 0.25).fillRect(c.x - w / 2, c.y - h / 2, w, h); C.t.setText(''); }
    });
    this.hdrFree = 'RESPINS: ' + this.rsLeft;
  }
  rsNext() {
    const f = this.feat;
    if (this.rsRound >= f.rounds.length) { this.rsEnd(); return; }
    Sound.sfx('clang'); let k = 0;
    const flick = this.time.addEvent({ delay: 70, repeat: 9, callback: () => { this.rsDraw(true); if (++k === 10) {
      const add = f.rounds[this.rsRound++];
      add.forEach(i => { this.rsOn[i] = true; const C = this.rsCells[i]; this.burstAt(C.c.x, C.c.y, 0xffd23f, 14); });
      if (add.length) { this.rsLeft = 3; Sound.sfx('chime'); this.cameras.main.shake(150, 0.005); } else { this.rsLeft--; Sound.sfx('clunk'); }
      this.rsDraw(); this.time.delayedCall(add.length ? 800 : 500, () => this.rsNext());
    } } });
  }
  rsEnd() {
    const f = this.feat, bet = this.bet(), amt = f.x * bet;
    if (f.full) { this.bigBanner('GRAND!!! FULL HOUSE', 0xff6ad0, 2.5); this.cameras.main.flash(400, 255, 200, 255); }
    this.addBal(amt); this.time.delayedCall(f.full ? 1800 : 700, () => { this.closeOverlay(); this.feat = null; this.lastWin = Math.round(amt); this.lastWinF = amt; this.countWin(amt, amt / bet); this.say('CHEDDAR RESPINS PAID ' + Math.round(amt) + '.', '#ffd23f'); this.refresh(); });
  }
  overlay(fill) {
    this.closeOverlay(); this.oBoxes = []; this.ov = this.add.container(0, 0).setDepth(5);
    const G = this.geom(), g = this.add.graphics(); g.fillStyle(0x0a0612, 0.82).fillRect(G.rx - 40, G.ry - 10, G.rw + 80, G.rh + 20); this.ov.add(g);
    fill(this.ov);
  }
  closeOverlay() { if (this.ov) { this.ov.destroy(); this.ov = null; } this.oBoxes = []; }
  // ---------------------------------------------------------------- GAMBLE: hi-lo at TRUE odds (it can't change the 95%)
  gambleOpen() {
    if (this.ph !== 'idle' || !(this.lastWin > 0)) return;
    const stake = this.lastWin; this.addBal(-stake); this.count = null; if (this.banner) { this.banner.t.destroy(); this.banner = null; }
    this.gam = { stake, card: 1 + Math.floor(Math.random() * 12), rounds: 0, flip: 0 }; this.ph = 'gamble'; Sound.sfx('reveal');
    this.overlay(o => {
      const G = this.geom(), cx = G.rx + G.rw / 2, cy = G.ry + G.rh / 2;
      this.gamCard = this.add.text(cx, cy - 8, '', { fontFamily: PIXEL, fontSize: '34px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 6 }).setOrigin(0.5);
      this.gamInfo = this.add.text(cx, G.ry + 4, '', { fontFamily: PIXEL, fontSize: '9px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 3, align: 'center' }).setOrigin(0.5, 0);
      const mk = (x, label, fn) => { const g = this.add.graphics(), t = this.add.text(x + 40, G.ry + G.rh - 16, '', { fontFamily: PIXEL, fontSize: '8px', color: '#ffffff' }).setOrigin(0.5); o.add([g, t]); const B = { x, y: G.ry + G.rh - 30, w: 80, h: 28, on: () => this.ph === 'gamble' && !this.gam.busy, fn, g, t, label }; this.oBoxes.push(B); return B; };
      this.gamHi = mk(cx - 130, 'HIGHER', () => this.gambleGo(1)); this.gamLo = mk(cx + 50, 'LOWER', () => this.gambleGo(-1)); this.gamCo = mk(cx - 40, 'COLLECT', () => this.gambleEnd(true));
      o.add([this.gamCard, this.gamInfo]);
    });
    this.gambleDraw(); this.say('HIGHER OR LOWER? PAID AT TRUE ODDS. SAME CARD: GO AGAIN.', '#c0a8f0'); this.refresh();
  }
  odds(dir) { const c = this.gam.card, n = dir > 0 ? 12 - c : c - 1; return n <= 0 ? 0 : 11 / n; }
  gambleDraw() {
    const g = this.gam; this.gamCard.setText(String(g.card));
    this.gamInfo.setText('STAKE ' + Math.round(g.stake) + (g.rounds ? '   (ROUND ' + (g.rounds + 1) + ')' : ''));
    [[this.gamHi, 1], [this.gamLo, -1], [this.gamCo, 0]].forEach(([B, d]) => {
      const o = d ? this.odds(d) : 1, live = d ? o > 0 : true; B.g.clear(); hudBox(B.g, B.x, B.y, B.w, B.h, live ? (d > 0 ? 0x2a6a8a : d < 0 ? 0x8a3a2a : 0x2a8a3a) : 0x241e2e, 1);
      B.t.setPosition(B.x + B.w / 2, B.y + B.h / 2).setText(d ? B.label + (o > 0 ? ' x' + o.toFixed(2) : '') : 'TAKE ' + Math.round(g.stake)).setAlpha(live ? 1 : 0.4);
    });
  }
  gambleGo(dir) {
    const g = this.gam; if (!g || g.busy || this.odds(dir) <= 0) return;
    let next; do { next = 1 + Math.floor(Math.random() * 12); } while (next === g.card && Math.random() < 0);   // (a tie is a push)
    g.busy = true; const o = this.odds(dir); Sound.sfx('whoosh');
    this.tweens.add({ targets: this.gamCard, scaleX: 0, duration: 140, yoyo: true, onYoyo: () => this.gamCard.setText(String(next)), onComplete: () => {
      g.busy = false;
      if (next === g.card) { this.say('SAME CARD. GO AGAIN.', '#ffffff'); Sound.sfx('blip'); }
      else if ((next > g.card) === (dir > 0)) { g.stake *= o; g.rounds++; Sound.sfx('power'); this.burstAt(this.gamCard.x, this.gamCard.y, 0x7dff8a, 18); this.say('YES! ' + Math.round(g.stake) + '. AGAIN, OR COLLECT?', '#7dff8a'); }
      else { Sound.sfx('clunk'); this.cameras.main.shake(200, 0.008); this.say('LOST IT.', '#ff7a6a'); g.stake = 0; g.card = next; this.time.delayedCall(700, () => this.gambleEnd(false)); this.gambleDraw(); return; }
      g.card = next; this.gambleDraw();
      if (g.rounds >= 5 || g.stake >= this.bet() * 500) this.time.delayedCall(500, () => this.gambleEnd(true));
    } });
  }
  gambleEnd(collect) {
    const g = this.gam; if (!g) return; this.gam = null; this.closeOverlay();
    const amt = collect ? g.stake : 0; this.lastWin = 0;
    if (amt > 0) { this.addBal(amt); if (g.rounds > 0) this.countWin(amt, amt / this.bet()); else this.ph = 'idle'; this.say('COLLECTED ' + Math.round(amt) + '.', '#7dff8a'); }
    else this.ph = 'idle';
    this.refresh();
  }
  // ---------------------------------------------------------------- the frame loop
  update(time, delta) {
    const dt = Math.min(0.05, delta / 1000); this.t += dt; this.lightT += dt;
    if (this.spinT !== undefined) this.spinT += dt;
    for (let i = 0; i < 5; i++) {
      const R = this.R[i], S = R.stop; if (!S) continue;
      if (!S.go) { R.pos -= R.v * (R.ant && this.spinT > S.at - 0.9 ? 0.55 : 1) * dt; if (this.spinT >= S.at) { const n = SLOT.STRIPS[this.sk][i].length; S.go = true; S.from = R.pos; S.end = S.to + n * Math.floor((R.pos - 3 - S.to) / n); S.u = 0; } }
      else { S.u += dt / 0.42; const u = Math.min(1, S.u), c1 = 1.6, e = 1 + (c1 + 1) * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); R.pos = S.from + (S.end - S.from) * e; if (u >= 1) { R.pos = S.end; R.stop = null; this.onReelStop(i); } }
    }
    if (this.ph === 'spin' && !this.reelsMoving()) this.settle();
    if (this.ph === 'freespin' && !this.reelsMoving()) this.freeSettle();
    if (this.count) { const C = this.count; C.t += dt; const u = Math.min(1, C.t / C.dur); C.v = C.to * (1 - Math.pow(1 - u, 2)); if (u >= 1) { this.count = null; if (this.ph === 'show') this.ph = 'idle'; this.refresh(); if (this.free > 0) this.time.delayedCall(400, () => { if (this.ph === 'idle' && this.free > 0) this.spin(); }); } }
    this.draw(dt);
  }
  draw(dt) {
    const G = this.geom(), { W, H, zi, cw, chh, rw, rh, rx, ry } = G, t = this.lightT;
    // ---- the bar behind
    const bg = this.bg; bg.clear(); bg.fillStyle(0x1a0e10, 1).fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 12) bg.fillStyle((y / 12) % 2 ? 0x221214 : 0x1c1012, 1).fillRect(0, y, W, 10);
    bg.fillStyle(0x0e0608, 1).fillRect(0, H - 24, W, 24);
    // ---- the cabinet round the reels: chasing bulbs (frantic on a win)
    const g = this.cab; g.clear();
    const fx0 = rx - 14, fy0 = ry - 34, fw = rw + 28, fh = rh + 48, hot = this.count || this.ph === 'free' || this.ph === 'freespin' || this.ph === 'respin';
    g.fillStyle(FM_INK, 1).fillRect(fx0 - 2, fy0 - 2, fw + 4, fh + 4); g.fillStyle(0x8a1a2a, 1).fillRect(fx0, fy0, fw, fh); g.fillStyle(0xb83040, 1).fillRect(fx0, fy0, 4, fh); g.fillStyle(0x5a0e1a, 1).fillRect(fx0 + fw - 4, fy0, 4, fh);
    g.fillStyle(0xc8902a, 1).fillRect(fx0, fy0, fw, 24); g.fillStyle(0xffd23f, 1).fillRect(fx0, fy0, fw, 2);
    const nb = Math.floor(fw / 10); for (let k = 0; k < nb; k++) { const on = hot ? (Math.floor(t * 16) + k) % 2 === 0 : (Math.floor(t * 6) + k) % 4 === 0; g.fillStyle(on ? 0xfff6c0 : 0x7a4a0a, 1).fillRect(fx0 + 4 + k * 10, fy0 + 4, 4, 4); g.fillStyle(on ? 0xfff6c0 : 0x7a4a0a, 1).fillRect(fx0 + 4 + k * 10, fy0 + fh - 8, 4, 4); }
    g.fillStyle(0xc8ccd8, 1).fillRect(rx - 4, ry - 4, rw + 8, rh + 8); g.fillStyle(FM_INK, 1).fillRect(rx - 2, ry - 2, rw + 4, rh + 4);
    for (let i = 0; i < 5; i++) { const x = rx + i * (cw + 4), R = this.R[i]; g.fillStyle(R.ant && R.stop ? (Math.floor(t * 10) % 2 ? 0xfff0b0 : 0xf4ecd8) : 0xf4ecd8, 1).fillRect(x, ry, cw, rh); for (let b = 0; b < 6; b++) { g.fillStyle(0x000000, 0.3 - b * 0.05).fillRect(x, ry + b * 2, cw, 2); g.fillStyle(0x000000, 0.3 - b * 0.05).fillRect(x, ry + rh - 2 - b * 2, cw, 2); } }
    this.hdrT.setText(this.hdrFree && (this.ph === 'free' || this.ph === 'freespin' || this.ph === 'respin') ? this.hdrFree : (this.from === 'camp' ? 'MOON BAR' : 'MEGA FRUITY') + ' - ' + SLOT.STRENGTHS[this.sk].name).setPosition(rx + rw / 2, fy0 + 5).setFontSize(9);
    // ---- the symbols
    const strips = SLOT.STRIPS[this.sk];
    this.R.forEach((R, i) => {
      const n = strips[i].length, base = Math.floor(R.pos), cx = rx + i * (cw + 4) + cw / 2, blur = R.stop && !R.stop.go;
      this.sym[i].forEach((im, j) => {
        const idx = ((base + j - 1) % n + n) % n, row = base + j - 1 - R.pos, y = ry + (row + 0.5) * chh;
        let key = strips[i][idx];
        if (!R.stop && this.res && this.res.grid && row > -0.01 && row < 2.99 && Math.abs(row - Math.round(row)) < 0.01) key = this.res.grid[i][Math.round(row)] || key;
        im.setTexture('fm_' + key).setScale(zi * (blur ? 1 : 1), zi * (blur ? 1.25 : 1)).setAlpha(blur ? 0.7 : 1);
        let wob = 0; if (!R.stop && this.winLines.length && this.winCell(i, Math.round(row))) wob = Math.sin(t * 14 + i) * 0.12;
        im.setPosition(Math.round(cx), Math.round(y)).setScale(zi * (1 + wob + (blur ? 0 : 0)), zi * (blur ? 1.25 : 1 + wob));
        const hh = 11 * zi * (blur ? 1.25 : 1), y0 = y - hh, y1 = y + hh, v0 = Math.max(y0, ry), v1 = Math.min(y1, ry + rh);
        if (v1 <= v0) { im.setVisible(false); return; }
        im.setVisible(true).setCrop(0, (v0 - y0) / (zi * (blur ? 1.25 : 1)), 22, (v1 - v0) / (zi * (blur ? 1.25 : 1)));
      });
    });
    this.stickyIm.forEach((im, k) => { const s = this.sticky[k]; if (!s || this.ph === 'idle' || this.ph === 'show' && !this.feat) { im.setVisible(false); return; } const c = this.cell(s[0], s[1]); im.setVisible(true).setPosition(c.x, c.y).setScale(zi * (1 + Math.sin(t * 6 + k) * 0.06)).setTint(Math.floor(t * 4 + k) % 2 ? 0xffffff : 0xfff0b0); });
    // ---- win lines and the centre line
    const fg = this.fg; fg.clear();
    fg.fillStyle(0xff3a3a, 0.5).fillRect(rx - 8, ry + rh / 2 - 1, 6, 2).fillRect(rx + rw + 2, ry + rh / 2 - 1, 6, 2);
    if (!this.reelsMoving() && this.winLines.length) {
      const cols = [0xffd23f, 0x7dff8a, 0x5ce1ff, 0xff6ad0, 0xff9a2a];
      const k = Math.floor(t * 1.5) % this.winLines.length;
      this.winLines.forEach((wl, j) => {
        const L = SLOT.LINES[wl.line], col = cols[wl.line % cols.length], a = j === k ? 1 : 0.35;
        fg.lineStyle(j === k ? 4 : 2, FM_INK, a); fg.beginPath(); L.forEach((row, r) => { const c = this.cell(r, row); if (r) fg.lineTo(c.x, c.y); else fg.moveTo(c.x, c.y); }); fg.strokePath();
        fg.lineStyle(j === k ? 2 : 1, col, a); fg.beginPath(); L.forEach((row, r) => { const c = this.cell(r, row); if (r) fg.lineTo(c.x, c.y); else fg.moveTo(c.x, c.y); }); fg.strokePath();
        if (j === k) for (let r = 0; r < wl.n; r++) { const c = this.cell(r, L[r]); fg.lineStyle(2, col, 1).strokeRect(c.x - cw / 2 + 1, c.y - chh / 2 + 1, cw - 2, chh - 2); }
      });
    }
    // ---- the feature trail: a ladder up the left, the cheese marker on your step
    this.drawTrail(G, t);
    // ---- the panel numbers
    const bal = this.bal(); this.shownBal += (bal - this.shownBal) * Math.min(1, dt * 8); if (Math.abs(bal - this.shownBal) < 0.5) this.shownBal = bal;
    this.balT.setText(String(Math.round(this.shownBal)));
    this.winT.setText(this.count ? 'WIN ' + Math.round(this.count.v) : this.lastWin > 0 ? 'LAST WIN ' + this.lastWin : '');
    // ---- effects: coins, sparks, stars flying to the trail, the big banner
    const fx = this.fx; fx.clear();
    for (const c of this.coins) { c.vy += 760 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.r += dt * 12; const w = Math.abs(Math.cos(c.r)) * 7 + 2; fx.fillStyle(FM_INK, 1).fillRect(c.x - w / 2 - 1, c.y - 5, w + 2, 10); fx.fillStyle(c.d ? 0xffd23f : 0xffe070, 1).fillRect(c.x - w / 2, c.y - 4, w, 8); if (w > 5) fx.fillStyle(0xfff6c0, 1).fillRect(c.x - w / 2 + 1, c.y - 3, 2, 3); }
    this.coins = this.coins.filter(c => c.y < H + 20);
    for (const s of this.sparks) { s.life -= dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 200 * dt; fx.fillStyle(s.col, Math.max(0, s.life * 2)).fillRect(s.x - 2, s.y - 2, 4, 4); }
    this.sparks = this.sparks.filter(s => s.life > 0);
    for (const q of this.flyers) {
      q.t += dt * 1.6; const tp = this.trailXY(Math.max(0, this.pos)), u = Math.min(1, q.t), e = u * u * (3 - 2 * u), x = q.x + (tp.x - q.x) * e, y = q.y + (tp.y - q.y) * e - Math.sin(u * Math.PI) * 60;
      if (!q.im) q.im = this.add.image(x, y, q.key).setDepth(7.5);
      q.im.setPosition(x, y).setScale(zi * (1 + Math.sin(u * Math.PI) * 0.6)).setRotation(u * 6);
      this.sparks.push({ x, y, vx: 0, vy: 0, life: 0.3, col: 0xffd23f });
      if (u >= 1) { q.im.destroy(); q.dead = true; this.burstAt(tp.x, tp.y, 0xffd23f, 14); Sound.sfx('blip'); }
    }
    this.flyers = this.flyers.filter(q => !q.dead);
    if (this.banner) {
      const B = this.banner; B.life -= dt; const age = B.max - B.life;
      const s = age < 0.35 ? 0.1 + (age / 0.35) * 1.25 : 1.2 + Math.sin(age * 10) * 0.06;
      B.t.setScale(s).setRotation(Math.sin(age * 7) * 0.06).setAlpha(Math.min(1, B.life * 2));
      if (B.life <= 0) { B.t.destroy(); this.banner = null; }
    }
    if (this.count && this.count.to >= this.bet() * 10) this.cameras.main.setZoom(1 + Math.sin(t * 20) * 0.004); else this.cameras.main.setZoom(1);
  }
  winCell(r, row) { return this.winLines.some(w => r < w.n && SLOT.LINES[w.line][r] === row); }
  trailXY(p) {
    const G = this.geom(), n = SLOT.STRENGTHS[this.sk].trail.length, top = 34, bot = G.H - 30, sh = (bot - top) / n;
    return { x: 18, y: bot - (p + 0.5) * sh, sh, w: G.tw };
  }
  drawTrail(G, t) {
    const T = SLOT.STRENGTHS[this.sk], g = this.trailG, n = T.trail.length; g.clear();
    const base = this.trailXY(0), w = G.tw - 12;
    g.fillStyle(0x0e0a16, 0.9).fillRect(6, 26, G.tw, G.H - 50);
    for (let p = 0; p < n; p++) {
      const q = this.trailXY(p), s = T.trail[p], on = p === this.pos, past = p < this.pos, feat = s !== 'C';
      const col = s === 'JACKPOT' ? 0xc8902a : feat ? ({ FREE: 0x1a6a7a, SUPER: 0x2a8a9a, RAT: 0x7a3a1a, RESPIN: 0x7a6a1a })[s] : 0x2a2440;
      const y0 = q.y - q.sh / 2 + 1, h = q.sh - 2;
      g.fillStyle(FM_INK, 1).fillRect(10, y0 - 1, w, h + 2);
      g.fillStyle(on ? (Math.floor(t * 6) % 2 ? 0xffd23f : 0xfff0a0) : past ? Phaser.Display.Color.IntegerToColor(col).lighten(15).color : col, 1).fillRect(11, y0, w - 2, h);
      if (s === 'JACKPOT') { for (let k = 0; k < 8; k++) g.fillStyle((Math.floor(t * 10) + k) % 2 ? 0xfff6c0 : 0x7a4a0a, 1).fillRect(14 + k * (w - 10) / 8, y0 + 1, 3, 2); }
      const L = this.trailT[p]; if (L) L.setPosition(16, q.y).setText(this.stepName(p, false)).setColor(on ? '#1a1020' : feat ? '#ffffff' : '#c9cde0').setStroke(on ? '#fff0a0' : '#1a1020', 2).setFontSize(Math.max(6, Math.min(8, Math.floor(q.sh * 0.55))));
    }
    // the marker: a cheese wedge riding the step you're on (below the ladder when you're not on it)
    const m = this.pos >= 0 ? this.trailXY(this.pos) : { x: 18, y: G.H - 16 }, bob = Math.sin(t * 5) * 2;
    if (!this.mark) this.mark = this.add.image(0, 0, 'fm_wedge').setDepth(3.5);
    this.mark.setPosition(G.tw - 6, m.y + bob).setScale(this.trailPulse ? 1.2 + this.trailPulse : 1.1).setTint(this.trailSlip ? 0xff7a6a : 0xffffff);
    if (this.trailPulse) { this.trailPulse = Math.max(0, this.trailPulse - (this.game.loop.delta / 1000) * 2); }
    if (this.trailSlip) { this.trailSlip = Math.max(0, this.trailSlip - (this.game.loop.delta / 1000) * 2); }
    if (this.pos < 0) g.fillStyle(0xffffff, 0.4).fillRect(10, G.H - 22, w, 1);
  }
}
