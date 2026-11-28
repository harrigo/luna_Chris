// ================================================================= THE CHEESE SLOT (v3.102): the casino at the Moon Bar
// A 5 x 3 video slot with a UK-style FEATURE TRAIL, played with your own cheese: cheddar in story mode (from the shop's
// MEGA FRUITY button), golden crumbs in camp (the MOON BAR). The maths lives in slotmath.js and is tuned by
// tools/slotsim.js so it returns 95% however you play it.
//   * 10 paylines; BESSIE is wild (reels 2-4); three CHEESE STRENGTHS (Mild / Mature / Extra Mature) = volatility
//   * a STAR on the centre line climbs the trail a step; a spin without one may slip you back. (v3.111) Climbing onto a
//     BONUS lamp plays it there and then (FREE SPINS with sticky Bessies, the RAT TRAP pick-em, CHEDDAR RESPINS
//     hold-and-spin) and you climb on from it. Any lamp can be TAKEN as cash; the top pays the JACKPOT
//   * any win can be GAMBLED on hi-lo at true odds (it never changes the 95%)
//   * MEGA SPINS (one per golden set) are 10 free spins at your bet
const FM_INK = 0x1a1020;
const SLOT_BETS = { shop: [5, 10, 25, 50, 100], camp: [3, 5, 15, 30] };   // (v3.136 camp: x3 with the crumbs)
const SLOT_TIERS = [[50, 'CHEESE-TASTROPHIC!', 0xff6ad0], [25, 'MEGA WIN!', 0xffd23f], [10, 'BIG WIN!', 0x7dff8a]];

// ---- the art: nine reel symbols (22 x 22), each lit from the top left with a dark outline, in the game's palette
// ---- (v3.147) THE MILKING: when the udder's full, you milk her. Five rounds, each a bigger thing to fill; four teats a
// round, most squirt and show your new multiplier, one (two, later) is DRY - Bessie's had enough, she plods off, and you
// keep what you've got. It never loses: it can only stop. The udder's pot becomes the STAKE: stake = pot / E[multiplier],
// so the milking pays the pot on average (the slot's RTP doesn't move) - but anything from x1 to x300 of it.
const MILK_LV = [
  { name: 'PAIL',       m: [2, 3, 4, 5],          dry: 1 },
  { name: 'CHURN',      m: [6, 8, 10, 15],        dry: 1 },
  { name: 'BATHTUB',    m: [18, 22, 30, 40],      dry: 2 },
  { name: 'MILK FLOAT', m: [50, 70, 90, 120],     dry: 2 },
  { name: 'TANKER',     m: [150, 200, 250, 300],  dry: 2 }
];
const MILK_EM = (() => {             // the expected final multiplier, starting from a splash (x1) in the pail
  const E = (i, c) => { if (i >= MILK_LV.length) return c; const L = MILK_LV[i], pd = L.dry / 4; return pd * c + (1 - pd) * L.m.reduce((a, m) => a + E(i + 1, m), 0) / L.m.length; };
  return E(0, 1);
})();
// (v3.147) little WILD / BONUS flags baked in pixels, stuck on the bottom of those symbols on the reels
const FM_GLYPH = { W: ['101', '101', '101', '111', '101'], I: ['111', '010', '010', '010', '111'], L: ['100', '100', '100', '100', '111'], D: ['110', '101', '101', '101', '110'],
  B: ['110', '101', '110', '101', '110'], O: ['111', '101', '101', '101', '111'], N: ['101', '111', '111', '111', '101'], U: ['101', '101', '101', '101', '111'], S: ['111', '100', '111', '001', '111'] };
function makeFruityFlags(scene) {
  if (scene.textures.exists('fm_lbl_wild')) return;
  for (const [key, word, bg, fg] of [['wild', 'WILD', 0xff2a8a, 0xffffff], ['bonus', 'BONUS', 0xffd23f, 0x1a1020]]) {
    const w = word.length * 4 + 3, h = 9;
    pixTex(scene, 'fm_lbl_' + key, w, h, put => {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const edge = x === 0 || y === 0 || x === w - 1 || y === h - 1; if ((x === 0 || x === w - 1) && (y === 0 || y === h - 1)) continue; put(x, y, edge ? 0x1a1020 : y === 1 ? 0xffffff : bg, 255); }
      [...word].forEach((ch, i) => FM_GLYPH[ch].forEach((row, yy) => [...row].forEach((b, xx) => { if (b === '1') put(2 + i * 4 + xx, 2 + yy, fg, 255); })));
    });
  }
}
// (v3.145) every symbol sits on its own bright tile (like the bosses: loud, saturated, never the same colour twice)
const FM_TILE = { wedge: [0xd8581a, 0xffb43a], coin: [0x0a6a7a, 0x2ad8c8], slow: [0x4a1aa0, 0xa07af6], plate: [0x123ab0, 0x4a9aff], power: [0x127a32, 0x6ade5a],
  heart: [0xa0105a, 0xff5ab0], wheel: null, bessie: [0x4a8a12, 0xb8ec4a], star: [0x140c48, 0x7a3ad0] };
function makeFruityTiles(scene) {
  if (scene.textures.exists('fm_t_star')) return;
  const TW = 36, TH = 28;
  for (const k of Object.keys(FM_TILE)) pixTex(scene, 'fm_t_' + k, TW, TH, put => {
    const C = FM_TILE[k];
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
      const cx = Math.min(x, TW - 1 - x), cy = Math.min(y, TH - 1 - y); if (cx + cy < 3) continue;          // the corners clipped off
      let col;
      if (!C) col = FM_RAINBOW[Math.floor(((x + y * 0.8) / 5 + 100)) % FM_RAINBOW.length];                  // the jackpot wheel: a rainbow
      else { const v = 1 - y / (TH - 1) + (k === 'star' ? -Math.hypot(x - TW / 2, y - TH / 2) / 30 : 0); col = v * 16 > bay(x, y) + 4 ? C[1] : C[0]; }
      if (y === 1 || (cx + cy === 3 && y < TH / 2)) col = 0xffffff;                                           // a glossy top edge
      else if (y === TH - 2) col = 0x1a1020;
      put(x, y, col, y === 1 ? 190 : 255);
    }
  });
}
function makeFruityTextures(scene) {
  makeFruityTiles(scene); makeFruityFlags(scene);
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
// (v3.119) THE MOON BAR, a proper building: a plank-walled pub with a pitched tin roof, a MOON BAR marquee on top,
// a CHEESE HERE banner under the eaves, BEER glowing in the window, a SPINS board, and the door propped open - the
// doorway is see-through, and the camp draws a slice of the bar's real inside behind it (runhub.js: barInside), which
// slides as you walk past. Outside on the plinth: a little beer garden - a parasol table, a stool and a GAMES A-board.
// 76 x 84 art px, two frames (the bulbs chase). Stone plinth along the bottom 8 rows.
const BAR_DOOR = { x0: 24, x1: 37, y0: 47, y1: 75 };      // the doorway (art px, transparent)
function makeBarTexture(scene) {
  const F = {
    M: ['#.#', '###', '###', '#.#', '#.#'], O: ['###', '#.#', '#.#', '#.#', '###'], N: ['##.', '#.#', '#.#', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'],
    A: ['.#.', '#.#', '###', '#.#', '#.#'], R: ['##.', '#.#', '##.', '#.#', '#.#'], C: ['###', '#..', '#..', '#..', '###'], H: ['#.#', '#.#', '###', '#.#', '#.#'],
    E: ['###', '#..', '##.', '#..', '###'], S: ['###', '#..', '###', '..#', '###'], P: ['##.', '#.#', '##.', '#..', '#..'], I: ['###', '.#.', '.#.', '.#.', '###'],
    G: ['###', '#..', '#.#', '#.#', '###'], '!': ['#', '#', '#', '.', '#'], ' ': ['..', '..', '..', '..', '..']
  };
  for (const fr of [0, 1]) pixTex(scene, fr ? 'cr_bar1' : 'cr_bar', 76, 84, (put, w, h) => {
    const rect = (x0, y0, x1, y1, f) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const c = typeof f === 'function' ? f(x, y) : f; if (c != null) put(x, y, c); } };
    const text = (str, x, y, col) => { for (const ch of str) { const g = F[ch] || F[' ']; g.forEach((row, gy) => [...row].forEach((q, gx) => { if (q === '#') put(x + gx, y + gy, typeof col === 'function' ? col(ch) : col); })); x += g[0].length + 1; } };
    const tw = str => [...str].reduce((a, ch) => a + (F[ch] || F[' '])[0].length + 1, -1);
    const INK = 0x1a1020, WD = [0x2a160c, 0x4a2a14, 0x6a3e1e, 0x8a5a2a, 0xa8743a], ROOF = [0x3a3448, 0x5e566e, 0x7a7290, 0x9a92b0];
    // --- the plinth (whole width) and the beer-garden deck on it
    for (let y = 76; y < 84; y++) for (let x = 0; x < 76; x++) { const row = (y - 76) >> 2, mort = (y - 76) % 4 === 3 || (x + row * 5) % 10 === 0; put(x, y, x === 0 || x === 75 ? INK : mort ? 0x3a3448 : y === 76 ? 0xa8a0b8 : row ? 0x5e566e : 0x7a7290); }
    rect(56, 74, 75, 75, (x, y) => y === 74 ? WD[3] : (x % 4 === 0 ? WD[0] : WD[1]));
    // --- the building: plank walls
    rect(3, 34, 55, 75, (x, y) => x === 3 || x === 55 ? INK : (y % 5 === 0 ? WD[0] : (x * 7 + Math.floor(y / 5) * 13) % 23 === 0 ? WD[1] : x < 8 ? WD[3] : x > 50 ? WD[1] : WD[2]));
    rect(4, 70, 54, 75, (x, y) => y === 70 ? INK : (x + y) % 6 === 0 ? 0x5e566e : 0x7a7290);              // stone skirting
    // --- the pitched tin roof, overhanging both sides
    for (let y = 18; y <= 33; y++) { const half = 8 + Math.round((y - 18) * 1.45); for (let x = 29 - half; x <= 29 + half; x++) { if (x < 0 || x > 58) continue; const edge = x === 29 - half || x === 29 + half || y === 33;
      put(x, y, edge ? INK : (x % 3 === 0 ? ROOF[0] : x < 29 ? ROOF[2] : ROOF[1])); } }
    rect(0, 33, 58, 34, (x, y) => y === 33 ? INK : ROOF[3]);
    rect(22, 14, 25, 20, (x, y) => x === 22 || x === 25 ? INK : 0x7a2a2a); rect(21, 13, 26, 14, INK);         // the chimney
    // --- the MOON BAR marquee on two posts over the roof ridge, bulbs chasing round it
    rect(17, 6, 18, 18, INK); rect(40, 6, 41, 18, INK);
    rect(9, 0, 49, 9, (x, y) => (x === 9 || x === 49 || y === 0 || y === 9) ? INK : 0x2a0a3a);
    for (let x = 10; x <= 48; x += 2) for (const y of [1, 8]) put(x, y, ((x >> 1) + fr) % 2 ? 0xfff0a0 : 0x8a5a12);
    { const T = 'MOON BAR'; text(T, 29 - (tw(T) >> 1), 2, ch => (('MOON BAR'.indexOf(ch) + fr) % 2 ? 0xff6ad0 : 0xffd23f)); }
    // --- CHEESE HERE banner under the eaves
    rect(5, 36, 53, 43, (x, y) => (x === 5 || x === 53 || y === 36 || y === 43) ? INK : 0xffd23f);
    rect(6, 37, 52, 37, 0xfff0a0); rect(6, 42, 52, 42, 0xc8902a);
    { const T = 'CHEESE HERE'; text(T, 29 - (tw(T) >> 1), 37, 0x8a1a2a); }
    // --- the door: frame, the open door swung back against the wall (left), the doorway itself left see-through
    const D = BAR_DOOR;
    rect(D.x0 - 2, D.y0 - 2, D.x1 + 2, D.y1, (x, y) => (x < D.x0 || x > D.x1 || y < D.y0) ? (x === D.x0 - 2 || x === D.x1 + 2 || y === D.y0 - 2 ? INK : WD[4]) : null);
    for (let y = D.y0; y <= D.y1; y++) for (let x = D.x0; x <= D.x1; x++) put(x, y, 0, 0);
    rect(D.x0 - 9, D.y0 + 1, D.x0 - 3, D.y1, (x, y) => (x === D.x0 - 9 || x === D.x0 - 3 || y === D.y0 + 1) ? INK : (y - D.y0) % 9 === 4 ? WD[1] : WD[3]);     // the door, open
    rect(D.x0 - 6, D.y0 + 13, D.x0 - 5, D.y0 + 14, 0xffd23f);
    rect(D.x0 - 1, D.y1 + 1, D.x1 + 1, D.y1 + 1, 0x8a1a2a);                                                     // a red mat
    // --- the window, glowing, BEER in amber neon
    rect(41, 48, 53, 62, (x, y) => (x === 41 || x === 53 || y === 48 || y === 62) ? INK : (x === 47 || y === 55) ? WD[0] : ((x + y + fr) % 7 === 0 ? 0xffe8a0 : 0xffc860));
    rect(40, 63, 54, 64, (x, y) => y === 63 ? WD[4] : INK);
    { const T = 'BEER'; rect(41, 66, 41 + tw(T) + 2, 72, (x, y) => (y === 66 || y === 72 || x === 41 || x === 41 + tw(T) + 2) ? INK : 0x2a0a10); text(T, 43, 67, fr ? 0xffb03a : 0xffd27a); }
    // --- SPINS board hung by the door (left wall), with chasing dots
    rect(5, 49, 18, 57, (x, y) => (x === 5 || x === 18 || y === 49 || y === 57) ? INK : 0x3a0e4a);
    { const T = 'SPINS'; text(T, 6 + ((12 - tw(T)) >> 1) + 1, 51, 0xff6ad0); }
    for (let x = 6; x <= 17; x += 2) put(x, 58, ((x >> 1) + fr) % 2 ? 0xff6ad0 : 0x5a1a5a);
    // --- bulbs along the eaves
    for (let x = 1; x <= 57; x += 3) put(x, 35, (Math.floor(x / 3) + fr) % 2 ? 0xffe060 : 0x7dff8a);
    // --- the beer garden: parasol table, a stool, the GAMES A-board
    rect(63, 50, 64, 73, 0xc8ccd8);                                                                              // parasol pole
    for (let y = 44; y <= 50; y++) { const hw = 1 + (y - 44) * 1.6; for (let x = Math.round(63.5 - hw); x <= Math.round(63.5 + hw); x++) if (x >= 56 && x <= 75) put(x, y, y === 50 || x === Math.round(63.5 - hw) || x === Math.round(63.5 + hw) ? INK : ((x >> 1) % 2 ? 0xff4a6a : 0xf4ecd8)); }
    rect(58, 64, 69, 65, (x, y) => y === 64 ? WD[4] : WD[1]); rect(59, 66, 59, 73, WD[1]); rect(68, 66, 68, 73, WD[1]);   // the table
    rect(60, 61, 61, 63, 0xf4ecd8); rect(60, 60, 61, 60, 0xffffff); rect(66, 61, 67, 63, 0xffb03a);              // a pint and a cheese
    rect(71, 68, 74, 69, 0xd83a2a); rect(72, 70, 72, 73, 0xc8ccd8); rect(73, 70, 73, 73, 0xc8ccd8);                 // a stool
  });
  // the GAMES A-board is its own little sprite (it stands on the ground in front)
  pixTex(scene, 'cr_games', 22, 18, (put) => {
    const INK = 0x1a1020;
    for (let y = 0; y < 18; y++) for (let x = 0; x < 22; x++) {
      const lx = 1 + Math.round(y * 0.12), rx = 20 - Math.round(y * 0.12);
      if (x < lx || x > rx || y > 14) continue;
      put(x, y, x === lx || x === rx || y === 0 || y === 14 ? INK : 0x0e2a20);
    }
    for (const x0 of [3, 18]) for (let y = 14; y < 18; y++) put(x0 + (x0 < 11 ? -Math.round((y - 14) * 0.4) : Math.round((y - 14) * 0.4)), y, INK);
    const G = { G: ['###', '#..', '#.#', '#.#', '###'], A: ['.#.', '#.#', '###', '#.#', '#.#'], M: ['#.#', '###', '###', '#.#', '#.#'], E: ['###', '#..', '##.', '#..', '###'], S: ['###', '#..', '###', '..#', '###'] };
    let x = 2; for (const ch of 'GAMES') { G[ch].forEach((row, gy) => [...row].forEach((q, gx) => { if (q === '#') put(x + gx, 4 + gy, 0x5ce1ff); })); x += 4; }
    for (let k = 0; k < 4; k++) put(5 + k * 4, 11, [0xffd23f, 0xff6ad0, 0x7dff8a, 0xff9a2a][k]);
  });
}


// ---------------------------------------------------------------- the machine (v3.104: one cabinet, four buttons)
// Everything is part of the cabinet: the TRAIL is a row of lamps on the top glass, the reels sit in the window, the
// LEFT GLASS shows the cheese strength, the RIGHT GLASS a little pay table at your bet, an LED ticker talks to you, and
// the deck has four arcade buttons: BET -, BET +, the lit one (TAKE when you're on the trail, MEGA when you have one)
// and SPIN. Controller: A spin, X take / mega, LB / RB (or left / right) bet, Y strength, B leave.
const FM_ICON = 1.28;   // (v3.120) symbols drawn 28% bigger on the upright machine
const FM_RAINBOW = [0xff4a6a, 0xff9a2a, 0xffe040, 0x7dff8a, 0x2ad8e8, 0x6a8aff, 0xc86aff, 0xff6ad0];
const FM = { red: [0x3a0810, 0x5a0e1a, 0x8a1a2a, 0xb83040, 0xe05a5a], gold: [0x5a3a0a, 0x8a5a12, 0xc8902a, 0xffd23f, 0xfff0a0], chrome: [0x3a3448, 0x6a7088, 0x9aa4b8, 0xc8ccd8, 0xf4f8ff] };
const FM_LAMP = { C: [0x2a2440, 0x6a5aa0], FREE: [0x0e3a44, 0x2ad8e8], SUPER: [0x0e3a44, 0x7af0ff], RAT: [0x4a1a08, 0xff8a2a], RESPIN: [0x4a3a08, 0xffd23f], JACKPOT: [0x5a3a0a, 0xfff0a0],
  COLLECT: [0x0a3a1a, 0x4ae86a], CHAIN: [0x3a0a3a, 0xe85ae8], MARCH: [0x0a2a4a, 0x5aa8ff], MEGA: [0x4a0a1a, 0xff4a6a] };
const FM_SHORT = { FREE: 'FREE', SUPER: 'SUPER', RAT: 'RAT', RESPIN: 'COINS', JACKPOT: 'JACKPOT', COLLECT: 'COLLECT', CHAIN: 'CHAIN COLLECT', MARCH: 'MARCH COLLECT', MEGA: 'MEGA COLLECT' };

class FruityScene extends Phaser.Scene {
  constructor() { super('fruity'); }
  init(data) { this.from = (data && data.from) || 'shop'; this.backTo = data && data.back; }
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
    makeTextures(this); makeFruityTextures(this); makeLouiseTextures(this);
    this.cameras.main.setBackgroundColor('#0e0810'); this.cameras.main.fadeIn(220, 0, 0, 0);
    Sound.init(); Sound.music('slots');   // (v3.145) its own tune
    const sv = this.registry.get('slot_' + this.from) || {};
    this.sk = sv.sk || 'mature'; this.betI = sv.betI !== undefined ? sv.betI : 1; this.pos = sv.pos !== undefined ? sv.pos : -1; this.dispPos = this.pos;
    this.carry = 0; this.going = false; this.ph = 'idle'; this.t = 0; this.free = 0; this.lastWin = 0; this.winLines = []; this.coins = []; this.sparks = []; this.flyers = []; this.banner = null;
    // (v3.146) sess0: the balance you walked up with, for this session's win/loss
    this.shownBal = this.bal(); this.sess0 = this.bal(); this.sessN = 0; this.press = {}; this.R = [0, 1, 2, 3, 4].map(() => ({ pos: Math.floor(Math.random() * 30), stop: null, v: 0, ant: false })); this.sticky = [];
    this.bg = this.add.graphics().setDepth(0); this.cab = this.add.graphics().setDepth(1);
    this.sym = this.R.map(() => [0, 1, 2, 3, 4].map(() => this.add.image(0, 0, 'fm_wedge').setDepth(2)));
    this.tile = this.R.map(() => [0, 1, 2, 3, 4].map(() => this.add.image(0, 0, 'fm_t_wedge').setDepth(1.95)));
    this.flag = this.R.map(() => [0, 1, 2, 3, 4].map(() => this.add.image(0, 0, 'fm_lbl_wild').setDepth(2.05).setVisible(false)));   // (v3.147) WILD / BONUS
    this.stickyIm = []; for (let i = 0; i < 15; i++) this.stickyIm.push(this.add.image(0, 0, 'fm_bessie').setDepth(2.5).setVisible(false));
    this.payIm = []; this.fg = this.add.graphics().setDepth(3); this.ui = this.add.container(0, 0).setDepth(4);
    this.fx = this.add.graphics().setDepth(6);
    this.lou = this.add.image(0, 0, 'lou_idle').setOrigin(0.5, 1).setDepth(1.5); this.louPose = 'idle'; this.louT = 0;
    const kb = this.input.keyboard;
    if (kb) {
      kb.on('keydown-SPACE', () => this.act('spin')); kb.on('keydown-ENTER', () => this.act('spin'));
      kb.on('keydown-T', () => this.act('take')); kb.on('keydown-X', () => this.act('take'));
      kb.on('keydown-LEFT', () => this.act('down')); kb.on('keydown-RIGHT', () => this.act('up')); kb.on('keydown-S', () => this.act('strength'));
      kb.on('keydown-ESC', () => this.act('back'));
    }
    const padOff = typeof Pad !== 'undefined' ? Pad.on(b => this.act({ a: 'spin', x: 'take', lb: 'down', left: 'down', rb: 'up', right: 'up', y: 'strength', b: 'back', back: 'back' }[b])) : null;
    if (padOff) this.events.once('shutdown', padOff);
    this.input.on('pointerdown', p => { if (this.mk) { const Gm = this.milkGeo(); let best = -1, bd = 1e9; Gm.teats.forEach((tp, k) => { const d = Math.hypot(p.x - tp.x, (p.y - tp.y - 20 * Gm.S) * 0.6); if (d < bd) { bd = d; best = k; } }); if (bd < 60 * Gm.S) { this.mk.sel = best; this.milkPick(best); } return; } if (this.rules) { const q = this.rules.boxes.find(b => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h); if (q) q.fn(); return; } const hit = [...(this.boxes || []), ...(this.oBoxes || [])].reverse().find(q => q.on() && p.x >= q.x && p.x <= q.x + q.w && p.y >= q.y && p.y <= q.y + q.h); if (hit) hit.fn(); });
    this.bcLoad(); this.leverT = 0;
    this.build();
    this.scale.on('resize', this.build, this);
    this.events.once('shutdown', () => { this.scale.off('resize', this.build, this); this.saveTrail(); });
    this.say(this.from === 'camp' ? 'LOUISE: WELCOME TO THE MOON BAR, CHRIS!' : 'LOUISE: SPIN ME, CHEF!');
  }
  say(m, col) { this.msg = m; this.msgCol = col || '#ff5a3a'; this.msgT0 = this.t; if (this.msgT) this.msgT.setText(m).setColor(this.msgCol); }
  // ---------------------------------------------------------------- layout (v3.120): an UPRIGHT cabinet, cash-register shaped
  // In art pixels (z screen px each). The cabinet is CWa wide and runs off the bottom of the screen; beside it on the
  // right, the pull LEVER and THE BIG CHEESE builder tower. FW = the whole footprint (cabinet + lever + tower).
  geom() {
    // (v3.145) wider: the BURSTING UDDER lives inside the cabinet now, in a window right of the reels
    const W = this.scale.width, H = this.scale.height, CHa = 204, CWa = 300, FW = CWa + 28;
    const z = Math.max(1, Math.min((H - 2) / CHa, (W - 8) / (FW + 50)));
    const ox = Math.round((W - FW * z) / 2 + 24 * z), oy = Math.round((H - CHa * z) / 2);
    const A = (x, y) => ({ x: ox + x * z, y: oy + y * z });
    const cw = 40 * z, chh = 30 * z, gap = 3 * z, rw = 5 * cw + 4 * gap, rh = 3 * chh, rx = ox + 8 * z, ry = oy + 68 * z;
    return { W, H, z, zi: z, CWa, CHa, FW, ox, oy, A, cw, chh, rw, rh, rx, ry, gap, LX: CWa + 14, LY: 112, TX: 228, TW: 66 };   // TX/TW: the udder window
  }
  cell(r, k) { const G = this.geom(); return { x: G.rx + r * (G.cw + G.gap) + G.cw / 2, y: G.ry + k * G.chh + G.chh / 2 }; }
  // the deck's buttons: [id, x, w (art px), label, controller hint]
  deck() { const o = 34; return [['down', o + 8, 32, 'BET-', 'LB'], ['up', o + 43, 32, 'BET+', 'RB'], ['strength', o + 78, 40, 'CHEESE', 'Y'], ['take', o + 121, 44, 'TAKE', 'X'], ['spin', o + 168, 56, 'SPIN', 'A']]; }
  lampGeo() { const n = SLOT.STRENGTHS[this.sk].trail.length, lw = 212 / n; return { n, lw, x: p => 8 + p * lw, y: 44 }; }
  build() {
    const G = this.geom(), z = G.z, f = (s, c, o) => Object.assign({ fontFamily: PIXEL, fontSize: Math.max(6, Math.round(s * z)) + 'px', color: c, stroke: '#1a1020', strokeThickness: Math.max(2, Math.round(z * 1.2)) }, o || {});
    this.ui.removeAll(true); this.boxes = []; this.payIm.forEach(im => im.destroy()); this.payIm = [];
    if (this.glows) this.glows.forEach(q => q.destroy()); this.glows = [];
    // deck buttons
    this.btnT = {};
    for (const [id, x, w, , hint] of this.deck()) {
      const p = G.A(x, 186), B = { id, x: p.x, y: p.y, w: w * z, h: 18 * z, on: () => true, fn: () => this.act(id) }; this.boxes.push(B);
      this.btnT[id] = [this.add.text(p.x + w * z / 2, p.y + 7 * z, '', f(id === 'spin' ? 5.4 : 3.4, '#ffffff')).setOrigin(0.5), this.add.text(p.x + w * z / 2, p.y + 14 * z, hint, f(2.6, '#ffffff', { strokeThickness: 2 })).setOrigin(0.5).setAlpha(0.7)];
      this.ui.add(this.btnT[id]);
    }
    // the lever: tap the ball (or anywhere on the arm's sweep) to pull it
    { const p = G.A(G.LX - 12, G.LY - 76); this.boxes.push({ x: p.x, y: p.y, w: 26 * z, h: 100 * z, on: () => true, fn: () => this.act('spin') }); }
    const ex = this.add.text(8, 8, 'EXIT  (B)', f(3.6, '#ffffff', { backgroundColor: '#2a1a2a', padding: { x: 6, y: 4 } })).setDepth(4); this.ui.add(ex);
    this.boxes.push({ x: 8, y: 8, w: ex.width, h: ex.height, on: () => true, fn: () => this.act('back') });
    // THE NAME: a letter each, so they can bounce and flash one by one
    this.nameL = [...'RIDIC LOUISE'].map((ch, i, all) => { const q = G.A(G.CWa / 2 + (i - (all.length - 1) / 2) * 14, 26); const t = this.add.text(q.x, q.y, ch, f(15, '#ffd23f', { stroke: '#2a0a0a', strokeThickness: Math.round(z * 2.4) })).setOrigin(0.5); this.ui.add(t); return t; });
    if (this.sticker) this.sticker.destroy();
    { const q = G.A(G.CWa / 2, 38), t = this.add.text(q.x, q.y, 'BURSTING UDDER MAX CHEESE GRATER EDITION 9000', f(3.6, '#1a1020', { stroke: '#fff6c0', strokeThickness: Math.max(1, Math.round(z * 0.7)), backgroundColor: '#ffd23f', padding: { x: Math.round(3 * z), y: Math.round(0.6 * z) } })).setOrigin(0.5).setRotation(-0.03).setDepth(4.5); this.sticker = t; }
    // the meters, the LED ticker
    this.metT = ['CREDIT', 'BET', 'WIN'].map((lab, i) => { const p = G.A(10 + i * 72, 165); const L = this.add.text(p.x + 2 * z, p.y, lab, f(2.4, '#c8ccd8', { strokeThickness: 2 })).setOrigin(0, 0.5), V = this.add.text(p.x + 68 * z, p.y, '', f(4.6, '#ff4a2a', { stroke: '#1a0404' })).setOrigin(1, 0.5); this.ui.add([L, V]); return V; });
    this.sessT = [this.add.text(G.A(230, 175).x, G.A(230, 175).y, 'SESSION', f(2.2, '#c8ccd8', { strokeThickness: 2 })).setOrigin(0, 0.5), this.add.text(G.A(292, 175).x, G.A(292, 175).y, '', f(4, '#7dff8a', { stroke: '#1a0404' })).setOrigin(1, 0.5)]; this.ui.add(this.sessT);
    this.msgT = this.add.text(G.A(116, 177).x, G.A(G.CWa / 2, 177).y, this.msg || '', f(3.2, this.msgCol || '#ff5a3a', { stroke: '#1a0404' })).setOrigin(0.5); this.ui.add(this.msgT);
    // trail lamps
    const LG = this.lampGeo();
    this.lampT = SLOT.STRENGTHS[this.sk].trail.map(() => { const t = this.add.text(0, 0, '', f(2.1, '#ffffff', { strokeThickness: 2, align: 'center', lineSpacing: -Math.round(z * 0.6) })).setOrigin(0.5); this.ui.add(t); return t; });
    // (v3.145) THE BURSTING UDDER window texts: a label up top, the pot on the pail, the must-burst count under it
    { const c = G.TX + G.TW / 2;
      this.bcT = [this.add.text(G.A(c, 49).x, G.A(c, 49).y, 'THE BIG UDDER', f(2.8, '#ffd0dc', { stroke: '#5a0e2a', strokeThickness: Math.round(z * 1.2) })).setOrigin(0.5),
        this.add.text(G.A(c, 146).x, G.A(c, 146).y, '', f(3.6, '#ffffff', { stroke: '#1a1020' })).setOrigin(0.5),
        this.add.text(G.A(c, 164).x, G.A(c, 164).y, '', f(2.3, '#ffd0dc', { strokeThickness: 2, align: 'center' })).setOrigin(0.5, 0)];
      this.ui.add(this.bcT); }
    // RULES (v3.145)
    { const rb = this.add.text(G.W - 8, 8, 'RULES  ?', f(3.6, '#1a1020', { stroke: '#1a1020', strokeThickness: 0, backgroundColor: '#ffd23f', padding: { x: 6, y: 4 } })).setOrigin(1, 0).setDepth(4); this.ui.add(rb);
      this.boxes.push({ x: G.W - 8 - rb.width, y: 8, w: rb.width, h: rb.height, on: () => true, fn: () => this.rulesOpen() }); }
    // a strength badge on the topper's corner
    this.strT = this.add.text(G.A(G.CWa - 10, 52 + 3).x, G.A(G.CWa - 10, 52 + 3).y, '', f(2.4, '#ffffff')).setOrigin(1, 0.5).setVisible(false); this.ui.add(this.strT);
    // pixel glows: behind the name, the SPIN button and the jar
    const gl = (x, y, s, col) => { const q = G.A(x, y), im = this.add.image(q.x, q.y, 'pxglow').setBlendMode(Phaser.BlendModes.ADD).setTint(col).setScale(s * z).setDepth(0.95); this.glows.push(im); return im; };
    this.glowName = gl(G.CWa / 2, 24, 3.6, 0xff4a9a); this.glowSpin = gl(230, 194, 1.4, 0x2aff6a); this.glowJar = gl(G.TX + G.TW / 2, 100, 1.6, 0xff8ab0);
    this.neon = [];
    this.refresh();
  }
  refresh() {
    if (!this.btnT) return;
    const live = this.live(), lab = { down: 'BET-', up: 'BET+', strength: '', take: this.ctxLabel(), spin: this.ph === 'idle' ? (this.free > 0 ? 'FREE ' + this.free : 'SPIN') : this.ph === 'show' ? 'SKIP' : '...' };
    for (const id in this.btnT) { if (id !== 'strength') this.btnT[id][0].setText(lab[id]); this.btnT[id][0].setAlpha(live[id] ? 1 : 0.35); }
    if (this.btnT.strength) this.btnT.strength[0].setText(SLOT.STRENGTHS[this.sk].name.split(' ').pop()).setColor('#' + SLOT.STRENGTHS[this.sk].col.toString(16).padStart(6, '0'));
    this.bcRefresh();
  }
  ctxLabel() { return this.pos >= 0 ? 'TAKE\n' + Math.max(1, Math.round(SLOT.valAt(this.sk, this.pos) * this.bet())) : Shop.megaLeft() > 0 && this.free <= 0 ? 'MEGA x' + Shop.megaLeft() : 'TAKE'; }
  live() { const idle = this.ph === 'idle'; return { down: this.canSetup(), up: this.canSetup(), strength: this.canSetup(), take: idle && (this.pos >= 0 || (Shop.megaLeft() > 0 && this.free <= 0)), spin: idle || this.ph === 'show' }; }
  canSetup() { return this.ph === 'idle' && this.pos < 0 && this.free <= 0; }
  stepName(p) { const s = SLOT.STRENGTHS[this.sk].trail[p]; return s === 'C' ? String(Math.max(1, Math.round(SLOT.TUNE[this.sk].val[p] * this.bet()))) : FM_SHORT[s]; }
  // ---------------------------------------------------------------- the four buttons (and Y / B)
  act(id) {
    if (!id || this.going) return;
    if (this.rules) { if (id === 'back' || id === 'take') this.rulesClose(); else if (id === 'spin' || id === 'up') this.rulesPage(1); else if (id === 'down') this.rulesPage(-1); return; }
    this.press[id] = 0.15;
    if (this.mk) { const M = this.mk; if (id === 'up' || id === 'down') { M.sel = (M.sel + (id === 'up' ? 1 : 3)) % 4; Sound.sfx('blip'); } else if (id === 'spin' || id === 'take') this.milkPick(M.sel); return; }
    if (this.ph === 'rat' && this.ratCells && !this.ratDone) {          // the rat trap on a controller: left / right choose, A picks
      const n = this.ratCells.length, closed = i => !this.ratCells[i].open;
      if (id === 'up' || id === 'down') { let k = this.ratSel; for (let j = 0; j < n; j++) { k = (k + (id === 'up' ? 1 : -1) + n) % n; if (closed(k)) break; } this.ratSel = k; this.ratPaint(); Sound.sfx('blip'); return; }
      if (id === 'spin' || id === 'take') { if (!closed(this.ratSel)) { const k = this.ratCells.findIndex((c, i) => closed(i)); if (k < 0) return; this.ratSel = k; } this.ratPick(this.ratCells[this.ratSel]); return; }
    }
    if (id === 'back') { if (this.ph !== 'idle') return; this.going = true; this.saveTrail(); Sound.sfx('wave'); this.cameras.main.fadeOut(200, 0, 0, 0); this.time.delayedCall(220, () => { if (this.backTo === 'bar') this.scene.start('barroom'); else if (this.from === 'camp') this.scene.start('level1', { camp: true, at: 2.62 }); else this.scene.start('shop'); }); return; }
    if (id === 'spin') { if (this.ph === 'show') { if (this.count) this.count.t = this.count.dur; return; } if (this.ph === 'idle') this.spin(); return; }
    if (id === 'take') { if (this.ph !== 'idle') return; if (this.pos >= 0) this.takeStep(); else if (Shop.megaLeft() > 0 && this.free <= 0) this.mega(); return; }
    if (id === 'up' || id === 'down') {
      if (!this.canSetup()) { if (this.ph === 'idle' && this.pos >= 0) this.say('TAKE YOUR TRAIL PRIZE BEFORE CHANGING THE BET', '#ffb04a'); return; }
      const nb = Math.max(0, Math.min(SLOT_BETS[this.from].length - 1, this.betI + (id === 'up' ? 1 : -1))); if (nb === this.betI) { Sound.sfx('clunk'); return; }
      this.betI = nb; Sound.sfx('blip'); this.saveTrail(); this.say('BET ' + this.bet() + ' ' + this.unit(), '#ffd23f'); this.refresh(); return;
    }
    if (id === 'strength') {
      if (!this.canSetup()) { if (this.ph === 'idle' && this.pos >= 0) this.say('FINISH THE TRAIL FIRST', '#ffb04a'); return; }
      const ks = Object.keys(SLOT.STRENGTHS); this.sk = ks[(ks.indexOf(this.sk) + 1) % ks.length]; Sound.sfx('jump');
      this.say(SLOT.STRENGTHS[this.sk].name + ' - ' + SLOT.STRENGTHS[this.sk].desc.toUpperCase(), '#ffffff'); this.saveTrail(); this.build();
    }
  }
  // (v3.145) THE RULES: four pages over the machine - how to play, the pays (at your bet), the trail and bonuses, the udder
  rulesOpen() {
    if (this.rules || this.ph !== 'idle') return; Sound.sfx('blip');
    this.rules = { page: 0, boxes: [], c: this.add.container(0, 0).setDepth(20) }; this.rulesDraw();
  }
  rulesClose() { if (!this.rules) return; this.rules.c.destroy(); this.rules = null; Sound.sfx('blip'); }
  rulesPage(d) { const R = this.rules; R.page = Math.max(0, Math.min(3, R.page + d)); Sound.sfx('blip'); this.rulesDraw(); }
  rulesDraw() {
    const R = this.rules, W = this.scale.width, H = this.scale.height, c = R.c; c.removeAll(true); R.boxes = [];
    const pw = Math.min(W - 24, 620), ph = Math.min(H - 20, 360), x0 = (W - pw) / 2, y0 = (H - ph) / 2, s = Math.max(1, Math.min(pw / 620, ph / 360) * 1.6);
    const f = (sz, col, o) => Object.assign({ fontFamily: PIXEL, fontSize: Math.round(sz * s) + 'px', color: col, stroke: '#1a1020', strokeThickness: 3, lineSpacing: Math.round(3 * s) }, o || {});
    const g = this.add.graphics(); g.fillStyle(0x08040e, 0.82).fillRect(0, 0, W, H);
    g.fillStyle(0xffd23f, 1).fillRect(x0 - 3, y0 - 3, pw + 6, ph + 6); g.fillStyle(0x1a1020, 1).fillRect(x0 - 1, y0 - 1, pw + 2, ph + 2); g.fillStyle(0x2a1046, 1).fillRect(x0, y0, pw, ph);
    g.fillStyle(0x3a1a5a, 1).fillRect(x0, y0, pw, 26 * s); c.add(g);
    const TITLES = ['HOW TO PLAY', 'THE PAYS (AT YOUR BET OF ' + this.bet() + ')', 'THE TRAIL AND THE BONUSES', 'THE BIG UDDER'];
    c.add(this.add.text(W / 2, y0 + 13 * s, TITLES[R.page], f(8, '#ffd23f')).setOrigin(0.5));
    const body = (lines, y) => c.add(this.add.text(x0 + 16 * s, y || y0 + 36 * s, lines.join('\n\n'), f(6.4, '#ffffff', { wordWrap: { width: pw - 32 * s } })));
    if (R.page === 0) body([
      'PULL THE LEVER (OR PRESS SPIN). 10 LINES PAY LEFT TO RIGHT: 3, 4 OR 5 OF A KIND.',
      'BESSIE THE COW (MARKED WILD) STANDS IN FOR ANY SYMBOL. SHE ONLY TURNS UP ON REELS 2-4.',
      'BET- / BET+ CHANGE YOUR STAKE. CHEESE CHANGES THE STRENGTH: MILD = LITTLE WINS OFTEN, MATURE = IN BETWEEN, EXTRA MATURE = LONG DRY SPELLS AND HUGE TOP PRIZES.',
      'SO CLOSE? IF A SPIN WINS NOTHING BUT TWO GOOD SYMBOLS START A LINE, LOUISE OFTEN THROWS YOU A BONE AND RESPINS REELS 3-5 FOR FREE.']);
    else if (R.page === 1) {
      const keys = ['wheel', 'bessie', 'heart', 'power', 'plate', 'slow', 'coin', 'wedge'], cols = 2, cw2 = (pw - 32 * s) / cols, rh2 = (ph - 60 * s) / 4;
      keys.forEach((k, i) => {
        const x = x0 + 16 * s + (i % cols) * cw2, y = y0 + 34 * s + Math.floor(i / cols) * rh2, ic = rh2 * 0.8 / 28;
        c.add(this.add.image(x + 18 * ic, y + rh2 / 2, 'fm_t_' + k).setScale(ic)); c.add(this.add.image(x + 18 * ic, y + rh2 / 2, 'fm_' + k).setScale(ic * 1.1));
        const pay = n => { const v = SLOT.PAYS[k][n] / 10 * SLOT.TUNE[this.sk].line * this.bet(); return v >= 10 ? String(Math.round(v)) : v.toFixed(1).replace(/\.0$/, ''); };
        c.add(this.add.text(x + 40 * ic, y + rh2 / 2, '3: ' + pay(0) + '   4: ' + pay(1) + '   5: ' + pay(2), f(6.4, k === 'wheel' || k === 'bessie' ? '#ffd23f' : '#ffffff')).setOrigin(0, 0.5));
      });
      c.add(this.add.text(W / 2, y0 + ph - 30 * s, 'PER LINE. BESSIE (WILD) PAYS LIKE THE WHEEL WHEN SHE MAKES A LINE ALL BY HERSELF.', f(4, '#c8b8e8')).setOrigin(0.5));
    } else if (R.page === 2) body([
      'THE STAR (MARKED BONUS) IS HOW YOU GET TO THE BONUSES: EACH ONE ON THE MIDDLE ROW FLIES YOUR ROCKET ONE PLANET ALONG THE ROUTE ABOVE THE REELS. THREE OF THEM ISN\'T A BONUS BY ITSELF - IT\'S THREE STEPS. A SPIN WITH NO STAR MIGHT SLIP YOU BACK ONE.',
      'TAKE BANKS THE PLANET YOU\'RE ON - OR KEEP FLYING. LAND ON A RINGED PLANET AND ITS BONUS PLAYS STRAIGHT AWAY:',
      'FREE SPINS - EVERY BESSIE THAT LANDS STAYS PUT FOR THE REST OF THEM.   RAT TRAP - PICK CHEESES; FIND A RAT AND IT\'S OVER.   COINS - COINS LOCK IN PLACE; EVERY NEW ONE RESETS YOUR 3 RESPINS. FILL THE LOT FOR THE GRAND.',
      'FURTHER ALONG, THE COLLECTS: COLLECT (A BOARD OF COINS INTO THE GRATER), CHAIN (IT RESPINS - EACH NEW BOARD PAYS ONE TIMES MORE), MARCH (THE COINS MARCH RIGHT INTO THE GRATER) AND MEGA (THE GRATER HAS A MULTIPLIER).',
      'FLY THE ROCKET ALL THE WAY TO THE CHEESE MOON FOR THE JACKPOT.']);
    else body([
      'SOME PAID SPINS SQUIRT A COIN INTO BESSIE\'S UDDER. IT SWELLS AND DRIPS, AND THE PAIL SHOWS YOUR MILKING STAKE. SHE\'S ALWAYS READY BY THE COUNT UNDER THE WINDOW.',
      'THEN YOU MILK HER: 5 ROUNDS - PAIL, CHURN, BATHTUB, MILK FLOAT, TANKER. PICK 1 OF 4 TEATS EACH ROUND. A SQUIRT SETS YOUR MULTIPLIER (UP TO x300 IN THE TANKER). A DRY TEAT AND SHE PLODS OFF - BUT YOU KEEP WHAT YOU\'VE GOT. YOU NEVER LOSE IT.',
      'OVER TIME THE MACHINE PAYS BACK ABOUT 95% OF WHAT GOES IN, WHATEVER STRENGTH YOU PLAY. LOUISE ALWAYS WINS IN THE END!']);
    // the buttons
    const btn = (label, x, fn, col) => { const t = this.add.text(x, y0 + ph - 12 * s, label, f(5.4, '#1a1020', { stroke: '#1a1020', strokeThickness: 0, backgroundColor: col || '#ffd23f', padding: { x: 8, y: 5 } })).setOrigin(0.5); c.add(t); R.boxes.push({ x: t.x - t.width / 2, y: t.y - t.height / 2, w: t.width, h: t.height, fn }); };
    if (R.page > 0) btn('< BACK', x0 + 50 * s, () => this.rulesPage(-1));
    btn('CLOSE', W / 2, () => this.rulesClose(), '#ff8aa8');
    if (R.page < 3) btn('NEXT >', x0 + pw - 50 * s, () => this.rulesPage(1));
    c.add(this.add.text(x0 + pw - 8 * s, y0 + 13 * s, (R.page + 1) + '/4', f(5, '#c8b8e8')).setOrigin(1, 0.5));
  }
  louise(pose, secs, line) { this.louPose = pose; this.louT = secs || 1.2; if (line) this.say('LOUISE: ' + line, '#ff6ad0'); }
  // ---------------------------------------------------------------- spinning
  mega() {
    Shop.useMega(); this.free = 10; Sound.sfx('reveal'); this.cameras.main.flash(250, 255, 220, 120);
    this.bigBanner('10 FREE SPINS!', 0x5ce1ff, 1.4); this.say('MEGA SPIN - 10 FREE SPINS AT ' + this.bet(), '#5ce1ff'); this.refresh();
    this.time.delayedCall(1400, () => { if (this.ph === 'idle' && this.free > 0) this.spin(); });
  }
  spin() {
    const bet = this.bet(), freeSpin = this.free > 0;
    if (!freeSpin && this.bal() < bet) { Sound.sfx('clunk'); this.say('NOT ENOUGH ' + this.unit() + ' - BET LOWER', '#ff4a2a'); this.cameras.main.shake(100, 0.004); return; }
    if (freeSpin) this.free--; else { this.addBal(-bet); this.sessN++; }
    this.leverT = 0.5; this.coinDrop = freeSpin ? null : this.bcDrop();
    this.lastWin = 0; this.winLines = []; this.res = SLOT.play(this.sk, Math.random, this.pos);
    this.boneStage = this.res.bone ? 1 : 0; this.showGrid = this.res.bone ? this.res.bone.grid : null;   // (v3.145) a close call first...
    this.startReels(this.res.bone ? this.res.bone.stops : this.res.stops); this.ph = 'spin'; this.say(freeSpin ? 'FREE SPIN - ' + this.free + ' LEFT' : 'GOOD LUCK!', '#ff5a3a'); Sound.sfx('clang'); this.refresh();
    if (Math.random() < 0.25) this.louise('wink', 0.9);
  }
  startReels(stops, only) {
    const res = this.showGrid ? { grid: this.showGrid } : this.res, starsBy = i => res && res.grid ? res.grid.slice(0, i).filter(c => c[1] === SLOT.STAR).length : 0, top = SLOT.STRENGTHS[this.sk].trail.length - 1;
    let t = 0.45;
    this.R.forEach((R, i) => {
      if (only && !only.includes(i)) return;
      const lead = starsBy(i), ant = res && res.grid && i >= 2 && (lead >= 2 || (this.pos >= 0 && this.pos + lead >= top - 1 && lead >= 1));
      t += ant ? 0.9 : 0.2; R.v = 22 + i * 2; R.stop = { at: t, to: stops[i], go: false }; R.ant = ant;
    });
    this.spinT = 0;
  }
  reelsMoving() { return this.R.some(R => R.stop); }
  onReelStop(i) {
    Sound.sfx('clunk');
    const g = this.showGrid || (this.res && this.res.grid); if (!g) return;
    if (g[i][1] === SLOT.STAR) { Sound.sfx('chime'); const c = this.cell(i, 1); this.flyers.push({ x: c.x, y: c.y, t: 0 }); this.burstAt(c.x, c.y, 0xffd23f, 10); }
    if (this.R[i + 1] && this.R[i + 1].ant && this.R[i + 1].stop) { Sound.sfx('reveal'); this.cameras.main.shake(120, 0.003); }
  }
  settle() {
    const r = this.res, bet = this.bet();
    if (this.boneStage === 1) {                      // (v3.145) ...so close! Louise gives reels 3-5 another spin on her
      this.boneStage = 2; this.ph = 'bone';
      this.louise('cheer', 1.6, ['SO CLOSE! HAVE ANOTHER GO ON ME!', 'OOH NEARLY! LET ME NUDGE THAT...', 'GO ON THEN, CHRIS - ONE MORE!'][Math.floor(Math.random() * 3)]);
      Sound.sfx('reveal'); this.boneFlash = 1.1; for (const i of [2, 3, 4]) { const c = this.cell(i, 1); this.burstAt(c.x, c.y, 0xff6ad0, 10); }
      this.time.delayedCall(1100, () => { this.showGrid = null; this.startReels(r.stops, [2, 3, 4]); this.ph = 'spin'; Sound.sfx('clang'); this.leverT = 0.5; });
      return;
    }
    this.boneStage = 0; this.showGrid = null;
    if (this.coinDrop) { this.bcFly(this.coinDrop); this.coinDrop = null; }
    this.winLines = r.wins; let win = r.x * bet; this.pos = r.pos;
    if (r.stars > 1) this.louise('cheer', 1, 'TWO STARS!');
    if (r.stars > 0) this.say(r.stars > 1 ? r.stars + ' STARS - UP ' + r.stars + ' LAMPS!' : 'A STAR - UP THE TRAIL!', '#ffd23f');
    else if (r.slipped) { this.say('NO STAR - THE TRAIL SLIPS', '#ffb04a'); Sound.sfx('zing'); }
    if (r.feat && r.feat.kind === 'jackpot') { win += r.feat.x * bet; this.jackpot(); if (typeof Ach !== 'undefined') Ach.unlock('jackpot'); }
    else if (r.feat) {                                   // (v3.111) landed on a bonus lamp: it plays now, straight after the line wins
      this.lastWin = this.addBal(win); this.saveTrail(); this.refresh();
      this.louise('cheer', 1.6, ['BONUS! RIDIC!', 'OOH, A BONUS!', 'GRATE STUFF!'][Math.floor(Math.random() * 3)]); Sound.sfx('reveal');
      this.ph = 'feat'; this.time.delayedCall(win > 0 ? 900 : 500, () => this.playFeat(r.feat));
      return;
    }
    this.lastWin = this.addBal(win);
    if (win > 0) { this.countWin(win, win / bet); if (r.wins.length) Sound.sfx('pickup'); } else this.ph = 'idle';
    this.saveTrail(); this.refresh();
    if (this.free > 0 && this.ph === 'idle') this.time.delayedCall(500, () => { if (this.ph === 'idle' && this.free > 0) this.spin(); });
  }
  countWin(amount, x) {
    const tier = SLOT_TIERS.find(q => x >= q[0]);
    this.ph = 'show'; this.count = { v: 0, to: amount, dur: tier ? 1.6 + SLOT_TIERS.length - SLOT_TIERS.indexOf(tier) : Math.min(1.2, 0.3 + x * 0.12), t: 0 };
    if (tier) { this.louise('cheer', this.count.dur + 0.6, ['THAT\'S RIDIC!', 'OOH, CHRIS!', 'WHAT A SPIN!'][Math.floor(Math.random() * 3)]); this.bigBanner(tier[1], tier[2], this.count.dur); this.cameras.main.shake(400, 0.008); Sound.jingle('slotbig', 'slots'); this.time.delayedCall(300, () => Sound.sfx('bells')); this.fountain(tier[0] >= 50 ? 90 : tier[0] >= 25 ? 60 : 36); }
    else if (x >= 2) { this.fountain(8 + Math.round(x * 2)); this.louise('cheer', 1.4); Sound.sfx('bells'); }
    else if (x > 0) Sound.sfx('ding');
    this.refresh();
  }
  bigBanner(text, col, dur) {
    if (this.banner) this.banner.t.destroy();
    const G = this.geom(), t = this.add.text(G.rx + G.rw / 2, G.ry + G.rh / 2, text, { fontFamily: PIXEL, fontSize: Math.round(9 * G.z) + 'px', color: '#' + col.toString(16).padStart(6, '0'), stroke: '#1a1020', strokeThickness: Math.round(G.z * 2.5) }).setOrigin(0.5).setDepth(8).setScale(0.1);
    this.banner = { t, life: dur + 1, max: dur + 1 };
  }
  fountain(n, at) { const G = this.geom(); for (let k = 0; k < n; k++) this.coins.push({ x: (at ? at.x : G.ox + G.CWa / 2 * G.z) + (Math.random() - 0.5) * 60, y: at ? at.y : G.oy + 176 * G.z, vx: (Math.random() - 0.5) * 420, vy: -260 - Math.random() * 420, r: Math.random() * 6, d: Math.random() < 0.5 }); }
  burstAt(x, y, col, n) { for (let k = 0; k < n; k++) { const a = Math.random() * 6.28, s = 60 + Math.random() * 160; this.sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5 + Math.random() * 0.4, col }); } }
  jackpot() { Sound.jingle('slotbig', 'slots'); this.louise('cheer', 4, 'JACKPOT! THAT IS TOTALLY RIDIC!'); this.bigBanner('JACKPOT!!!', 0xffd23f, 3.5); this.cameras.main.flash(500, 255, 240, 150); this.cameras.main.shake(900, 0.014); this.fountain(140); Sound.sfx('achieve'); this.time.delayedCall(400, () => Sound.sfx('power')); this.time.delayedCall(900, () => Sound.sfx('achieve')); }
  // ---------------------------------------------------------------- TAKE: cash, or a bonus game
  takeStep() {
    const f = SLOT.take(this.sk, this.pos), bet = this.bet(); this.pos = -1; this.dispPos = -1; this.saveTrail();
    if (typeof Ach !== 'undefined') Ach.unlock('fruity');
    const w = f.x * bet; this.lastWin = this.addBal(w); this.say('BANKED ' + Math.round(w) + ' ' + this.unit() + '!', '#7dff8a'); Sound.sfx('power'); this.countWin(w, f.x);
  }
  playFeat(f) {
    if (typeof Ach !== 'undefined') Ach.unlock('fruity');
    this.feat = f;
    if (f.kind === 'free' || f.kind === 'super') this.freeStart(f); else if (f.kind === 'rat') this.ratStart(f); else if (f.frames) this.colStart(f); else this.respinStart(f);
    this.refresh();
  }
  freeStart(f) {
    this.ph = 'free'; this.fi = 0; this.sticky = []; this.freeTot = 0;
    this.bigBanner(f.kind === 'super' ? 'SUPER SPINS!' : 'FREE SPINS!', 0x5ce1ff, 1.4); Sound.sfx('reveal'); this.cameras.main.flash(250, 120, 220, 255);
    this.say(f.log.length + ' SPINS - BESSIES STICK' + (f.log[0].mult > 1 ? ' - WINS x' + f.log[0].mult : ''), '#5ce1ff');
    this.time.delayedCall(1500, () => this.freeNext());
  }
  freeNext() {
    const f = this.feat; if (!f) return;
    if (this.fi >= f.log.length) { const amt = this.freeTot; this.bigBanner('FREE SPINS WON ' + Math.round(amt), 0x5ce1ff, 1.6); this.sticky = []; this.feat = null; this.lastWin = Math.round(amt); if (amt > 0) this.countWin(amt, amt / this.bet()); else this.ph = 'idle'; this.refresh(); return; }
    const L = f.log[this.fi]; this.res = { grid: L.grid, stops: L.stops }; this.freeEntry = L;
    this.startReels(L.stops); this.ph = 'freespin'; Sound.sfx('clang'); this.say('FREE SPIN ' + (this.fi + 1) + ' OF ' + f.log.length, '#5ce1ff');
  }
  freeSettle() {
    const L = this.freeEntry, f = this.feat, bet = this.bet();
    this.sticky = L.sticky; this.winLines = SLOT.lineWins(L.grid);
    const w = L.w * L.mult * f.k * bet; this.freeTot += w; this.addBal(w);
    if (w > 0) { Sound.sfx('pickup'); this.fountain(Math.min(30, 6 + Math.round(w / bet))); this.say('+' + Math.round(w) + '  (TOTAL ' + Math.round(this.freeTot) + ')', '#7dff8a'); }
    this.fi++; this.ph = 'free'; this.time.delayedCall(w > 0 ? 900 : 450, () => this.freeNext());
  }
  ratStart(f) {
    this.ph = 'rat'; this.ratN = 0; this.ratTot = 0; this.ratDone = false; this.ratSel = 0;
    this.bigBanner('RAT TRAP!', 0xff9a2a, 1.2); Sound.sfx('reveal'); this.say('PICK CHEESES - FIND A RAT AND IT\'S OVER', '#ff9a2a');
    this.overlay(o => {
      const G = this.geom(), n = f.cards.length, cols = Math.ceil(n / 3), cw = Math.min(G.rw / cols - 4, 30 * G.z), ch = G.chh - 3, x0 = G.rx + G.rw / 2 - (cols * (cw + 4) - 4) / 2, y0 = G.ry + 2;
      this.ratCells = [];
      for (let i = 0; i < n; i++) {
        const x = x0 + (i % cols) * (cw + 4), y = y0 + Math.floor(i / cols) * (ch + 3), g = this.add.graphics(), im = this.add.image(x + cw / 2, y + ch / 2 - 2 * G.z, 'fm_wedge').setScale(G.z * 0.6), t = this.add.text(x + cw / 2, y + ch - 4 * G.z, '', { fontFamily: PIXEL, fontSize: Math.round(3.2 * G.z) + 'px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 3 }).setOrigin(0.5);
        o.add([g, im, t]); const C = { x, y, w: cw, h: ch, g, im, t, open: false }; this.ratCells.push(C);
        this.oBoxes.push({ x, y, w: cw, h: ch, on: () => this.ph === 'rat' && !C.open && !this.ratDone, fn: () => this.ratPick(C) });
      }
    });
    this.ratPaint();
  }
  ratPaint() { (this.ratCells || []).forEach((C, i) => { C.g.clear(); hudBox(C.g, C.x, C.y, C.w, C.h, C.open ? 0x2a1a0a : i === this.ratSel ? 0x8a5a12 : 0x4a2a0a, 1); }); }
  ratPick(C) {
    const f = this.feat, v = f.cards[this.ratN++]; C.open = true; this.ratPaint();
    this.tweens.add({ targets: C.im, scaleX: 0, duration: 90, yoyo: true, onYoyo: () => C.im.setTexture(v ? 'fm_wedge' : 'fm_rat') });
    if (!v) { Sound.sfx('squish'); this.cameras.main.shake(250, 0.01); C.t.setText('RAT!').setColor('#ff7a6a'); this.ratDone = true; this.time.delayedCall(900, () => this.ratEnd()); return; }
    const w = v * f.k * this.bet(); this.ratTot += w; this.addBal(w); C.t.setText('+' + Math.round(w)).setColor('#7dff8a');
    Sound.sfx('pickup'); this.burstAt(C.x + C.w / 2, C.y + C.h / 2, 0xffd23f, 12); this.say('TOTAL ' + Math.round(this.ratTot) + ' - KEEP PICKING!', '#ffd23f');
    if (this.ratN >= f.cards.length) { this.ratDone = true; this.time.delayedCall(700, () => this.ratEnd()); }
  }
  ratEnd() { const amt = this.ratTot; this.closeOverlay(); this.feat = null; this.lastWin = Math.round(amt); if (amt > 0) this.countWin(amt, amt / this.bet()); else this.ph = 'idle'; this.say('THE RAT TRAP PAID ' + Math.round(amt), '#ffd23f'); this.refresh(); }
  // ---------------------------------------------------------------- (v3.148) THE COLLECTS: a board of cheese coins with
  // values over the reels, and THE COLLECTOR - a big cheese grater on the right of the reels - that scoops them up
  colStart(f) {
    const NAMES = { collect: ['COLLECT!', 0x4ae86a, 'EVERY COIN ON THE BOARD GOES IN THE GRATER'], chain: ['CHAIN COLLECT!', 0xe85ae8, 'COLLECT, RESPIN, COLLECT AGAIN - EACH LINK PAYS ONE TIMES MORE'],
      march: ['MARCH COLLECT!', 0x5aa8ff, 'THE COINS MARCH RIGHT INTO THE GRATER, ONE REEL A STEP'], mega: ['MEGA COLLECT!', 0xff4a6a, 'A BIG BOARD - AND THE GRATER\'S GOT A MULTIPLIER'] }[f.kind];
    this.ph = 'collect'; this.colTot = 0; this.colI = 0; this.colName = NAMES; this.colMult = 1;
    this.bigBanner(NAMES[0], NAMES[1], 1.3); Sound.sfx('reveal'); this.cameras.main.flash(250, 120, 255, 160); this.say(NAMES[2], '#' + NAMES[1].toString(16).padStart(6, '0'));
    this.overlay(o => {
      const G = this.geom(); this.colCells = [];
      for (let i = 0; i < 15; i++) { const c = this.cell(Math.floor(i / 3), i % 3), g = this.add.graphics(), t = this.add.text(c.x, c.y, '', { fontFamily: PIXEL, fontSize: Math.round(4 * G.z) + 'px', color: '#1a1020', stroke: '#fff4c0', strokeThickness: 2 }).setOrigin(0.5); o.add([g, t]); this.colCells.push({ c, G, g, t, v: 0, ox: 0 }); }
      // the collector: a cheese grater over the udder window, with what it's holding and its multiplier
      const gx = G.A(G.TX + G.TW / 2, 100); this.colGr = this.add.graphics(); this.colGrT = this.add.text(gx.x, gx.y + 26 * G.z, '0', { fontFamily: PIXEL, fontSize: Math.round(6 * G.z) + 'px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 4 }).setOrigin(0.5);
      this.colMT = this.add.text(gx.x, gx.y - 30 * G.z, '', { fontFamily: PIXEL, fontSize: Math.round(7 * G.z) + 'px', color: '#ff4a6a', stroke: '#1a1020', strokeThickness: 4 }).setOrigin(0.5);
      o.add([this.colGr, this.colGrT, this.colMT]); this.colGrAt = gx;
    });
    this.time.delayedCall(1200, () => this.colFrame());
  }
  colDraw() {
    if (!this.colCells) return; const bet = this.bet(), f = this.feat, G = this.geom(), z = G.z;
    this.colCells.forEach(C => { const { c } = C, w = G.cw - 2, h = G.chh - 2, x = c.x + C.ox; C.g.clear();
      C.g.fillStyle(0x0e0a16, 0.9).fillRect(c.x - w / 2, c.y - h / 2, w, h);
      if (C.v) { C.g.fillStyle(FM_INK, 1).fillCircle(x, c.y, h * 0.46); C.g.fillStyle(0xc8902a, 1).fillCircle(x, c.y, h * 0.42); C.g.fillStyle(0xffd23f, 1).fillCircle(x, c.y, h * 0.36); C.g.fillStyle(0xfff4c0, 0.8).fillCircle(x - h * 0.12, c.y - h * 0.12, h * 0.1);
        C.t.setPosition(x, c.y).setText(String(Math.max(1, Math.round(C.v * f.k * bet * 10) / 10))); } else C.t.setText(''); });
    // the grater
    const g = this.colGr, at = this.colGrAt; g.clear(); const gw = 34 * z, gh = 40 * z, wob = Math.sin(this.t * 6) * z;
    g.fillStyle(FM_INK, 1).fillRect(at.x - gw / 2 - 2 * z, at.y - gh / 2 - 2 * z + wob, gw + 4 * z, gh + 4 * z); g.fillStyle(0xc8ccd8, 1).fillRect(at.x - gw / 2, at.y - gh / 2 + wob, gw, gh);
    g.fillStyle(0xe8ecf4, 1).fillRect(at.x - gw / 2, at.y - gh / 2 + wob, 4 * z, gh); g.fillStyle(FM_INK, 1).fillRect(at.x - 8 * z, at.y - gh / 2 - 10 * z + wob, 16 * z, 4 * z).fillRect(at.x - 8 * z, at.y - gh / 2 - 10 * z + wob, 3 * z, 10 * z).fillRect(at.x + 5 * z, at.y - gh / 2 - 10 * z + wob, 3 * z, 10 * z);
    for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < 4; xx++) g.fillStyle(0x3a3a4a, 1).fillRect(at.x - gw / 2 + 7 * z + xx * 7 * z, at.y - gh / 2 + 5 * z + yy * 7 * z + wob, 4 * z, 2 * z);
    this.colGrT.setText(String(Math.round(this.colTot * f.k * bet)));
    this.colMT.setText(this.colMult > 1 ? 'x' + this.colMult : '');
  }
  colFrame() {
    const f = this.feat; if (!f) return; const F = f.frames[this.colI];
    if (!F) { this.colEnd(); return; }
    const bet = this.bet(), G = this.geom();
    if (f.kind === 'march') {
      // step: the coins on reel 5 drop into the grater, everything else slides one reel right, new coins may land on reel 1
      if (this.colI > 0) {
        const prev = f.frames[this.colI - 1].cells;
        [12, 13, 14].forEach(i => { if (prev[i]) this.colFly(this.colCells[i], prev[i], 1); });
        this.colCells.forEach((C, i) => { C.v = prev[i]; }); this.tweens.addCounter({ from: 0, to: 1, duration: 260, onUpdate: tw => { const u = tw.getValue(); this.colCells.forEach((C, i) => { C.ox = (i < 12 && prev[i]) ? u * (G.cw + G.gap) : 0; if (i >= 12 && prev[i]) C.v = 0; }); this.colDraw(); },
          onComplete: () => { this.colCells.forEach((C, i) => { C.ox = 0; C.v = F.cells[i]; }); this.colDraw(); for (let k = 0; k < 3; k++) if (F.cells[k] && !(prev[k - 3] || 0)) { const c = this.colCells[k].c; this.burstAt(c.x, c.y, 0xffd23f, 6); Sound.sfx('ding'); } } });
        Sound.sfx('clunk'); this.say('MARCH! ' + Math.round(this.colTot * f.k * bet), '#5aa8ff');
      } else { this.colCells.forEach((C, i) => { C.v = F.cells[i]; }); this.colDraw(); Sound.sfx('clang'); }
      this.colI++; this.time.delayedCall(this.colI === 1 ? 900 : 620, () => this.colFrame()); return;
    }
    // collect / chain / mega: the board lands, then everything flies into the grater
    this.colMult = F.mult; let k = 0;
    this.time.addEvent({ delay: 60, repeat: 7, callback: () => { this.colCells.forEach(C => { C.v = Math.random() < 0.3 ? SLOT.STRENGTHS[this.sk].respin.vals[0] : 0; }); this.colDraw(); if (++k === 8) {
      this.colCells.forEach((C, i) => { C.v = F.cells[i]; }); this.colDraw(); Sound.sfx('clang');
      const any = F.cells.some(v => v);
      if (f.kind === 'chain') this.say(any ? 'CHAIN LINK ' + F.mult + ' - EVERY COIN x' + F.mult : 'NOTHING LANDED - THE CHAIN\'S DONE', any ? '#e85ae8' : '#a898d8');
      if (f.kind === 'mega') { this.say('THE GRATER\'S GOT x' + F.mult + '!', '#ff4a6a'); Sound.sfx('power'); }
      let d = 500; F.cells.forEach((v, i) => { if (v) { this.time.delayedCall(d, () => this.colFly(this.colCells[i], v, F.mult)); d += 110; } });
      this.colI++; this.time.delayedCall(d + (any ? 700 : 900), () => this.colFrame());
    } } });
  }
  colFly(C, v, mult) {
    const G = this.geom(), from = { x: C.c.x + C.ox, y: C.c.y }, to = this.colGrAt, im = this.add.image(from.x, from.y, 'fm_coin').setDepth(8).setScale(G.z);
    C.v = 0; this.colDraw();
    this.tweens.add({ targets: im, x: to.x, y: to.y, scale: G.z * 0.6, duration: 380, ease: 'Cubic.easeIn', onComplete: () => { im.destroy(); this.colTot += v * mult; this.colDraw(); Sound.sfx('coin'); this.burstAt(to.x, to.y, 0xffd23f, 6); } });
  }
  colEnd() {
    const f = this.feat, amt = f.x * this.bet();
    this.time.delayedCall(500, () => { this.closeOverlay(); this.colCells = null; this.feat = null; this.addBal(amt); this.lastWin = Math.round(amt); if (amt > 0) this.countWin(amt, amt / this.bet()); else this.ph = 'idle'; this.say(this.colName[0].replace('!', '') + ' PAID ' + Math.round(amt), '#ffd23f'); this.refresh(); });
  }
  respinStart(f) {
    this.ph = 'respin'; this.rsLeft = 3; this.rsRound = 0;
    this.bigBanner('CHEDDAR RESPINS!', 0xffd23f, 1.2); Sound.sfx('reveal');
    const added = new Set([].concat(...f.rounds)); this.rsOn = f.cells.map((v, i) => v && !added.has(i));
    this.overlay(o => { this.rsCells = []; for (let i = 0; i < 15; i++) { const c = this.cell(Math.floor(i / 3), i % 3), G = this.geom(), g = this.add.graphics(), t = this.add.text(c.x, c.y, '', { fontFamily: PIXEL, fontSize: Math.round(3.6 * G.z) + 'px', color: '#1a1020' }).setOrigin(0.5); o.add([g, t]); this.rsCells.push({ c, g, t, G }); } });
    this.rsDraw(); this.say('3 RESPINS - EVERY NEW COIN RESETS THEM', '#ffd23f');
    this.time.delayedCall(1300, () => this.rsNext());
  }
  rsDraw(flick) {
    const f = this.feat, bet = this.bet();
    this.rsCells.forEach((C, i) => {
      const { c, G } = C, w = G.cw - 2, h = G.chh - 2; C.g.clear();
      if (this.rsOn[i]) { C.g.fillStyle(FM_INK, 1).fillRect(c.x - w / 2, c.y - h / 2, w, h); C.g.fillStyle(0xc8902a, 1).fillRect(c.x - w / 2 + 2, c.y - h / 2 + 2, w - 4, h - 4); C.g.fillStyle(0xffd23f, 1).fillRect(c.x - w / 2 + 2, c.y - h / 2 + 2, w - 4, 3); C.t.setText(String(Math.round(f.cells[i] * f.k * bet)));
      } else { C.g.fillStyle(0x0e0a16, 0.92).fillRect(c.x - w / 2, c.y - h / 2, w, h); if (flick && Math.random() < 0.3) C.g.fillStyle(0xffd23f, 0.25).fillRect(c.x - w / 2, c.y - h / 2, w, h); C.t.setText(''); }
    });
  }
  rsNext() {
    const f = this.feat;
    if (this.rsRound >= f.rounds.length) { this.rsEnd(); return; }
    Sound.sfx('clang'); let k = 0;
    this.time.addEvent({ delay: 70, repeat: 9, callback: () => { this.rsDraw(true); if (++k === 10) {
      const add = f.rounds[this.rsRound++];
      add.forEach(i => { this.rsOn[i] = true; const C = this.rsCells[i]; this.burstAt(C.c.x, C.c.y, 0xffd23f, 14); });
      if (add.length) { this.rsLeft = 3; Sound.sfx('chime'); this.cameras.main.shake(150, 0.005); } else { this.rsLeft--; Sound.sfx('clunk'); }
      this.say('RESPINS LEFT: ' + this.rsLeft, '#ffd23f'); this.rsDraw(); this.time.delayedCall(add.length ? 800 : 500, () => this.rsNext());
    } } });
  }
  rsEnd() {
    const f = this.feat, bet = this.bet(), amt = f.x * bet;
    if (f.full) { this.bigBanner('GRAND!!!', 0xff6ad0, 2.5); this.cameras.main.flash(400, 255, 200, 255); }
    this.addBal(amt); this.time.delayedCall(f.full ? 1800 : 700, () => { this.closeOverlay(); this.feat = null; this.lastWin = Math.round(amt); this.countWin(amt, amt / bet); this.say('CHEDDAR RESPINS PAID ' + Math.round(amt), '#ffd23f'); this.refresh(); });
  }
  overlay(fill) { this.closeOverlay(); this.oBoxes = []; this.ov = this.add.container(0, 0).setDepth(5); const G = this.geom(), g = this.add.graphics(); g.fillStyle(0x0a0612, 0.85).fillRect(G.rx, G.ry, G.rw, G.rh); this.ov.add(g); fill(this.ov); }
  closeOverlay() { if (this.ov) { this.ov.destroy(); this.ov = null; } this.oBoxes = []; }
  // ---------------------------------------------------------------- the frame loop
  update(time, delta) {
    const dt = Math.min(0.05, delta / 1000); this.t += dt;
    if (this.mk) this.milkDraw(dt);
    for (const k in this.press) this.press[k] = Math.max(0, this.press[k] - dt);
    if (this.spinT !== undefined) this.spinT += dt;
    for (let i = 0; i < 5; i++) {
      const R = this.R[i], S = R.stop; if (!S) continue;
      if (!S.go) { R.pos -= R.v * (R.ant && this.spinT > S.at - 0.9 ? 0.55 : 1) * dt; if (this.spinT >= S.at) { const n = SLOT.STRIPS[this.sk][i].length; S.go = true; S.from = R.pos; S.end = S.to + n * Math.floor((R.pos - 3 - S.to) / n); S.u = 0; } }
      else { S.u += dt / 0.42; const u = Math.min(1, S.u), c1 = 1.6, e = 1 + (c1 + 1) * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); R.pos = S.from + (S.end - S.from) * e; if (u >= 1) { R.pos = S.end; R.stop = null; this.onReelStop(i); } }
    }
    if (this.ph === 'spin' && !this.reelsMoving()) this.settle();
    if (this.ph === 'freespin' && !this.reelsMoving()) this.freeSettle();
    if (this.count) { const C = this.count; C.t += dt; this.tickT = (this.tickT || 0) - dt; if (this.tickT <= 0 && C.t < C.dur) { this.tickT = 0.07; Sound.sfx('coin'); } const u = Math.min(1, C.t / C.dur); C.v = C.to * (1 - Math.pow(1 - u, 2)); if (u >= 1) { this.count = null; if (this.ph === 'show') this.ph = 'idle'; this.refresh(); if (this.free > 0) this.time.delayedCall(400, () => { if (this.ph === 'idle' && this.free > 0) this.spin(); }); } }
    if (this.bcPending && this.ph === 'idle' && !this.count) this.bcPop();
    // the trail lamp chases up (or down) to where you are, a step at a time
    this.chaseT = (this.chaseT || 0) - dt;
    if (this.dispPos !== this.pos && this.chaseT <= 0 && !this.flyers.length) { this.dispPos += this.pos > this.dispPos ? 1 : -1; this.chaseT = 0.16; Sound.sfx('blip'); if (this.pos > -1 && this.dispPos === this.pos) this.refresh(); }
    this.draw(dt);
  }
  // (v3.111) THE MOON BAR behind the machine: a purple bar with sweeping spotlights, two disco balls throwing specks
  // round the walls, cheese bunting, a neon sign, the next machine along blinking away, and a dance floor of coloured
  // light pools. All one Graphics, redrawn each frame (it's only rectangles and a few triangles).
  drawBar(G, t, hot) {
    const { W, H, z } = G, bg = this.bg, P = Math.max(1, Math.round(z)); bg.clear();
    const fy = G.oy + 172 * z, band = [0x12081e, 0x170a28, 0x1d0c32, 0x240e3c, 0x2c1046, 0x351250];
    for (let i = 0; i < band.length; i++) bg.fillStyle(band[i], 1).fillRect(0, Math.floor(fy * i / band.length), W, Math.ceil(fy / band.length) + 1);
    for (let y = 6 * z, j = 0; y < fy; y += 14 * z, j++) for (let x = (j % 2) * 9 * z; x < W; x += 18 * z) bg.fillStyle(0x3a1a5a, 0.55).fillRect(x, y, 2 * P, 2 * P);   // wallpaper diamonds
    // the dance floor: chequered, with pools of light drifting about
    for (let y = fy, j = 0; y < H; y += 8 * z, j++) for (let x = 0, i = 0; x < W; x += 12 * z, i++) bg.fillStyle((i + j) % 2 ? 0x241034 : 0x160a22, 1).fillRect(x, y, 12 * z, 8 * z);
    bg.fillStyle(0xffd23f, 1).fillRect(0, fy, W, P);
    [[0xff6ad0, 0.7, 0], [0x2ad8e8, 0.5, 2], [0xffe040, 0.9, 4]].forEach(([c, sp, ph]) => { const x = W * (0.5 + 0.45 * Math.sin(t * sp + ph)); bg.fillStyle(c, hot ? 0.3 : 0.18).fillEllipse(x, fy + 12 * z, 70 * z, 14 * z); });
    // spotlights sweeping from the ceiling
    const beams = [[0.08, 0xff6ad0, 0], [0.32, 0x2ad8e8, 1.7], [0.68, 0xffe040, 3.1], [0.92, 0x7dff8a, 4.4]];
    for (const [fx, c, ph] of beams) {
      const x0 = W * fx, a = Math.sin(t * (hot ? 1.6 : 0.6) + ph) * 0.55, L = H * 1.15, sp = 0.13;
      bg.fillStyle(c, hot ? 0.22 : 0.14).fillTriangle(x0, 0, x0 + Math.sin(a - sp) * L, Math.cos(a - sp) * L, x0 + Math.sin(a + sp) * L, Math.cos(a + sp) * L);
      bg.fillStyle(c, 1).fillRect(x0 - 3 * P, 0, 6 * P, 3 * P);
    }
    const left = G.ox, right = W - (G.ox + G.FW * z);
    // the next machine along (right of ours), lights chasing
    if (right > 40 * z * 0.6) {
      const mw = Math.min(56 * z, right - 10 * P), mx = G.ox + G.FW * z + 8 * P + Math.max(0, (right - 8 * P - mw) / 2), my = G.oy + 70 * z, mh = fy - my + 6 * z;
      bg.fillStyle(0x08040e, 1).fillRect(mx - P, my - P, mw + 2 * P, mh + 2 * P); bg.fillStyle(0x0e3a5a, 1).fillRect(mx, my, mw, mh); bg.fillStyle(0x1a5a80, 1).fillRect(mx, my, 3 * P, mh);
      bg.fillStyle(0x08040e, 1).fillRect(mx + 5 * P, my + 12 * z, mw - 10 * P, 22 * z);
      for (let k = 0; k < 3; k++) { const c = FM_RAINBOW[(k * 3 + Math.floor(t * 3 + k)) % FM_RAINBOW.length], cw2 = (mw - 14 * P) / 3; bg.fillStyle(c, 1).fillRect(mx + 7 * P + k * (cw2 + 0 * P), my + 14 * z, cw2 - 2 * P, 18 * z); }
      for (let k = 0; k * 6 * P < mw - 4 * P; k++) bg.fillStyle((k + Math.floor(t * 8)) % 3 ? 0x5a3a0a : 0xffe070, 1).fillRect(mx + 3 * P + k * 6 * P, my + 3 * z, 3 * P, 3 * P);
      bg.fillStyle(0xff4a6a, 0.6 + 0.4 * Math.sin(t * 6)).fillCircle(mx + mw / 2, my - 4 * z, 4 * z);
      bg.fillStyle(0xc8902a, 1).fillRect(mx + 4 * P, my + 42 * z, mw - 8 * P, 10 * z);
    }
    // disco balls over each side, throwing specks that wheel round the walls
    const balls = [left > 30 ? left / 2 : null, right > 30 ? W - right / 2 : null].filter(x => x !== null);
    for (const bx of balls) {
      const by = G.oy + 22 * z, br = Math.max(5, 7 * z);
      bg.lineStyle(P, 0x9aa4b8, 1).lineBetween(bx, 0, bx, by - br);
      bg.fillStyle(0x6a7088, 1).fillCircle(bx, by, br);
      for (let k = 0; k < 6; k++) for (let j = -2; j <= 2; j++) { const u = ((k / 6 + t * 0.15) % 1) * 2 - 1, xx = bx + u * br * Math.sqrt(1 - (j / 3) ** 2), yy = by + j * br / 3; if (Math.abs(u) < 0.95) bg.fillStyle((k + j) % 2 ? 0xf4f8ff : 0xc8ccd8, 1).fillRect(xx - P, yy - P, 2 * P, 2 * P); }
      for (let i = 0; i < 18; i++) { const a = i * 2.39996 + t * 0.35 * (bx < W / 2 ? 1 : -1), rr = (30 + (i * 37) % 120) * z, x = bx + Math.cos(a) * rr, y = by + Math.abs(Math.sin(a)) * rr * 0.8;
        if (y > fy) continue; const c = FM_RAINBOW[i % FM_RAINBOW.length], tw = 0.5 + 0.5 * Math.sin(t * 5 + i); bg.fillStyle(c, 0.35 + 0.5 * tw).fillRect(x - P, y - P, 2 * P + (tw > 0.8 ? P : 0), 2 * P); }
    }
    // cheese bunting strung across the top, swaying
    for (const [x0, x1] of [[0, G.ox], [G.ox + G.FW * z, W]]) {
      if (x1 - x0 < 20) continue; const n = Math.max(2, Math.floor((x1 - x0) / (12 * z)));
      for (let k = 0; k < n; k++) { const x = x0 + (k + 0.5) * (x1 - x0) / n, sag = Math.sin(Math.PI * (k + 0.5) / n) * 8 * z, y = G.oy + 2 * z + sag, sw = Math.sin(t * 2 + k) * 1.5 * z;
        bg.fillStyle([0xffe040, 0xff6ad0, 0x2ad8e8, 0xff9a2a, 0x7dff8a][k % 5], 1).fillTriangle(x - 4 * z, y, x + 4 * z, y, x + sw, y + 9 * z); }
      bg.lineStyle(P, 0xf4ecd8, 0.8); bg.beginPath(); for (let k = 0; k <= 12; k++) { const x = x0 + (x1 - x0) * k / 12, y = G.oy + 2 * z + Math.sin(Math.PI * k / 12) * 8 * z; if (k) bg.lineTo(x, y); else bg.moveTo(x, y); } bg.strokePath();
    }
    if (this.sticker) this.sticker.setScale(1 + 0.06 * Math.max(0, Math.sin(t * 3))).setRotation(-0.08 + Math.sin(t * 1.3) * 0.03);
    if (this.neon) { this.neon.forEach((n, i) => n.setAlpha(Math.random() < 0.015 ? 0.35 : (hot ? 0.85 + 0.15 * Math.sin(t * 12 + i) : 1))); }
  }
  draw(dt) {
    const G = this.geom(), { W, H, z, A, rx, ry, rw, rh, cw, chh, gap } = G, t = this.t, g = this.cab, LG = this.lampGeo(), n = LG.n, lw = LG.lw;
    const r = (x, y, w, h, col, a) => g.fillStyle(col, a === undefined ? 1 : a).fillRect(G.ox + x * z, G.oy + y * z, w * z, h * z);
    const hot = this.count || this.ph === 'free' || this.ph === 'freespin' || this.ph === 'respin';
    // ---- the bar behind: dark panelling, a warm wash on the floor
    this.drawBar(G, t, hot);
    this.drawCab(G, t, hot, dt);
    // ---- the symbols on the reels
    const strips = SLOT.STRIPS[this.sk];
    this.R.forEach((R, i) => {
      const nn = strips[i].length, base = Math.floor(R.pos), cx = rx + i * (cw + gap) + cw / 2, blur = R.stop && !R.stop.go;
      this.sym[i].forEach((im, j) => {
        const idx = ((base + j - 1) % nn + nn) % nn, row = base + j - 1 - R.pos, y = ry + (row + 0.5) * chh;
        let key = strips[i][idx];
        const shown = this.showGrid || (this.res && this.res.grid); if (!R.stop && shown && Math.abs(row - Math.round(row)) < 0.01 && row > -0.5 && row < 2.5) key = shown[i][Math.round(row)] || key;
        const wob = !R.stop && this.winLines.length && this.winCell(i, Math.round(row)) ? 0.08 + Math.abs(Math.sin(t * 9 + i)) * 0.14 : 0, sy = z * FM_ICON * (blur ? 1.3 : 1 + wob);
        im.setTexture('fm_' + key).setPosition(Math.round(cx), Math.round(y)).setScale(z * FM_ICON * (1 + wob), sy).setAlpha(blur ? 0.75 : 1);
        const ti = this.tile[i][j], ts = z * (blur ? 1.15 : 1), th = 14 * ts, t0 = y - th, t1 = y + th, w0 = Math.max(t0, ry), w1 = Math.min(t1, ry + rh);
        if (w1 <= w0 || !FM_TILE.hasOwnProperty(key)) ti.setVisible(false); else ti.setVisible(true).setTexture('fm_t_' + key).setPosition(Math.round(cx), Math.round(y)).setScale(z, ts).setAlpha(blur ? 0.8 : 1).setCrop(0, (w0 - t0) / ts, 36, (w1 - w0) / ts);
        { const fl = this.flag[i][j], fk = key === SLOT.WILD ? 'wild' : key === SLOT.STAR ? 'bonus' : null, fy = y + 10 * sy, fh = 4.5 * sy;
          if (!fk || blur || fy - fh < ry || fy + fh > ry + rh) fl.setVisible(false); else fl.setVisible(true).setTexture('fm_lbl_' + fk).setPosition(Math.round(cx), Math.round(fy)).setScale(z * 0.95, sy * 0.95); }
        const hh = 11 * sy, y0 = y - hh, y1 = y + hh, v0 = Math.max(y0, ry), v1 = Math.min(y1, ry + rh);
        if (v1 <= v0) { im.setVisible(false); return; }
        im.setVisible(true).setCrop(0, (v0 - y0) / sy, 22, (v1 - v0) / sy);
      });
    });
    this.stickyIm.forEach((im, k) => { const s = this.sticky[k]; if (!s || !(this.ph === 'free' || this.ph === 'freespin')) { im.setVisible(false); return; } const c = this.cell(s[0], s[1]); im.setVisible(true).setPosition(c.x, c.y).setScale(z * FM_ICON * (1 + Math.sin(t * 6 + k) * 0.06)); });
    // ---- the win lines
    const fg = this.fg; fg.clear(); this.drawGlass(G, t);
    fg.fillStyle(0xff3a3a, 0.8).fillRect(rx - 6 * z, ry + rh / 2 - z, 3 * z, 2 * z).fillRect(rx + rw + 3 * z, ry + rh / 2 - z, 3 * z, 2 * z);
    if (!this.reelsMoving() && this.winLines.length) {
      const cols = [0xffd23f, 0x7dff8a, 0x5ce1ff, 0xff6ad0, 0xff9a2a], k = Math.floor(t * 1.5) % this.winLines.length;
      this.winLines.forEach((wl, j) => {
        const L = SLOT.LINES[wl.line], col = cols[wl.line % cols.length], a = j === k ? 1 : 0.3, path = () => { fg.beginPath(); L.forEach((row, rr) => { const c = this.cell(rr, row); if (rr) fg.lineTo(c.x, c.y); else fg.moveTo(c.x, c.y); }); fg.strokePath(); };
        fg.lineStyle((j === k ? 2.5 : 1.2) * z, FM_INK, a); path(); fg.lineStyle((j === k ? 1.2 : 0.6) * z, col, a); path();
        if (j === k) for (let rr = 0; rr < wl.n; rr++) { const c = this.cell(rr, L[rr]); fg.lineStyle(z, col, 1).strokeRect(c.x - cw / 2 + z, c.y - chh / 2 + z, cw - 2 * z, chh - 2 * z); }
      });
    }
    // ---- the numbers and the LED ticker
    const bal = this.bal(); this.shownBal += (bal - this.shownBal) * Math.min(1, dt * 8); if (Math.abs(bal - this.shownBal) < 0.5) this.shownBal = bal;
    this.metT[0].setText(String(Math.round(this.shownBal))); this.metT[1].setText(String(this.bet())); this.metT[2].setText(this.count ? String(Math.round(this.count.v)) : this.lastWin > 0 ? String(this.lastWin) : '0');
    this.msgT.setAlpha(0.75 + 0.25 * Math.sin(t * 6));
    { const d = Math.round(this.shownBal - this.sess0); this.sessT[1].setText((d > 0 ? '+' : '') + d).setColor(d > 0 ? '#7dff8a' : d < 0 ? '#ff4a2a' : '#c8ccd8'); }
    // ---- effects: coins, sparks, stars flying to your lamp, the banner
    const fx = this.fx; fx.clear();
    if (this.boneFlash > 0) { this.boneFlash -= dt; for (let i = 2; i < 5; i++) { const x = rx + i * (cw + gap); fx.fillStyle(0xff6ad0, (Math.floor(t * 10) % 2 ? 0.35 : 0.15) * Math.min(1, this.boneFlash * 2)).fillRect(x, ry, cw, rh); } }
    for (const c of this.coins) { c.vy += 760 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.r += dt * 12; const w = (Math.abs(Math.cos(c.r)) * 3.5 + 1) * z; fx.fillStyle(FM_INK, 1).fillRect(c.x - w / 2 - z / 2, c.y - 2.5 * z, w + z, 5 * z); fx.fillStyle(c.d ? 0xffd23f : 0xffe070, 1).fillRect(c.x - w / 2, c.y - 2 * z, w, 4 * z); }
    this.coins = this.coins.filter(c => c.y < H + 20);
    for (const s of this.sparks) { s.life -= dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 200 * dt; fx.fillStyle(s.col, Math.max(0, s.life * 2)).fillRect(s.x - z, s.y - z, 2 * z, 2 * z); }
    this.sparks = this.sparks.filter(s => s.life > 0);
    for (const q of this.flyers) {
      q.t += dt * 1.8; const tgt = Math.max(0, Math.min(n - 1, this.dispPos + 1)), tp = A(LG.x(tgt) + lw / 2, LG.y + 4), u = Math.min(1, q.t), e = u * u * (3 - 2 * u), x = q.x + (tp.x - q.x) * e, y = q.y + (tp.y - q.y) * e - Math.sin(u * Math.PI) * 30 * z;
      if (!q.im) q.im = this.add.image(x, y, 'fm_star').setDepth(7.5);
      q.im.setPosition(x, y).setScale(z * (1 + Math.sin(u * Math.PI) * 0.6)).setRotation(u * 6); this.sparks.push({ x, y, vx: 0, vy: 0, life: 0.3, col: 0xffd23f });
      if (u >= 1) { q.im.destroy(); q.dead = true; this.burstAt(tp.x, tp.y, 0xffd23f, 14); }
    }
    this.flyers = this.flyers.filter(q => !q.dead);
    if (this.banner) { const B = this.banner; B.life -= dt; const age = B.max - B.life, s = age < 0.35 ? 0.1 + (age / 0.35) * 1.25 : 1.2 + Math.sin(age * 10) * 0.06; B.t.setScale(s).setRotation(Math.sin(age * 7) * 0.06).setAlpha(Math.min(1, B.life * 2)); if (B.life <= 0) { B.t.destroy(); this.banner = null; } }
  }
  // (v3.120) THE CABINET: an upright, cash-register shaped machine. Topper: an arched sign with the name in big
  // bouncing letters, sunburst rays turning behind it, a ring of chasing bulbs. Then the trail glass, the reel window
  // (big drums, glass glare, scanlines), the meters and ticker, and a deck that steps out wider like a till, with five
  // light-up buttons. On its right side: a chrome pull lever. Beyond it: THE BIG CHEESE builder tower.
  drawCab(G, t, hot, dt) {
    const { z, A, rx, ry, rw, rh, cw, chh, gap, CWa: CW } = G, g = this.cab, H = G.H;
    const r = (x, y, w, h, col, a) => g.fillStyle(col, a === undefined ? 1 : a).fillRect(G.ox + x * z, G.oy + y * z, w * z, h * z);
    const bottom = (H - G.oy) / z + 2, win = !!this.count, strobe = win || this.ph === 'pop' || this.ph === 'feat';
    const RB = k => FM_RAINBOW[((k % 8) + 8) % 8];
    g.clear();
    // -- the body: red, lit from the left, a gold pinstripe; it runs off the bottom of the screen
    r(-2, 44, CW + 4, bottom - 44, FM_INK); r(0, 46, CW, bottom - 46, FM.red[2]); r(0, 46, 4, bottom - 46, FM.red[3]); r(CW - 4, 46, 4, bottom - 46, FM.red[1]);
    for (let y = 46; y < bottom; y += 2) r(4, y, CW - 8, 1, FM.red[1], 0.16);
    r(3, 46, 1, bottom - 46, FM.gold[3]); r(CW - 4, 46, 1, bottom - 46, FM.gold[1]);
    // side bulb columns, chasing (they race when you win)
    for (let k = 0; k * 6 < 130; k++) for (const sx of [1, CW - 3]) { const on = strobe ? (Math.floor(t * 20) + k) % 2 : (Math.floor(t * 6) - k + (sx > 9 ? 3 : 0)) % 5 === 0; r(sx, 50 + k * 6, 2, 3, on ? 0xffffff : RB(k + Math.floor(t * (strobe ? 10 : 2)))); }
    // -- the topper: an arch. Dark glass inside, sunburst rays, a gold frame, bulbs all round
    const AH = 44, arch = y => y >= 18 ? CW / 2 : Math.sqrt(Math.max(0, 1 - Math.pow((18 - y) / 18, 2))) * CW / 2;
    for (let y = 0; y < AH; y++) { const hw = arch(y); if (hw < 1) continue; r(CW / 2 - hw - 2, y, hw * 2 + 4, 1, FM_INK); r(CW / 2 - hw, y, hw * 2, 1, FM.gold[y < 3 ? 4 : 2]); const ih = Math.max(0, hw - 4); if (y > 3 && y < AH - 3 && ih > 0) r(CW / 2 - ih, y, ih * 2, 1, y < 20 ? 0x2a0a3a : 0x1a0828); }
    { const cxp = G.ox + CW / 2 * z, cyp = G.oy + 26 * z, nR = 18, spin = t * (strobe ? 1.6 : 0.35);           // sunburst rays (clipped to the arch's inside)
      for (let k = 0; k < nR; k++) { const a0 = spin + k * Math.PI * 2 / nR, a1 = a0 + Math.PI / nR;
        const reach = a => { let L = 200; for (let s2 = 4; s2 < 200; s2 += 2) { const xx = Math.cos(a) * s2, yy = 26 + Math.sin(a) * s2; if (yy < 4 || yy > AH - 4 || Math.abs(xx) > arch(yy) - 5) { L = s2 - 2; break; } } return L; };
        const L0 = reach(a0), L1 = reach(a1); g.fillStyle(k % 2 ? (strobe ? RB(k + Math.floor(t * 6)) : 0x8a2a9a) : 0x3a0e4a, strobe ? 0.7 : 1).fillTriangle(cxp, cyp, cxp + Math.cos(a0) * L0 * z, cyp + Math.sin(a0) * L0 * z, cxp + Math.cos(a1) * L1 * z, cyp + Math.sin(a1) * L1 * z); } }
    { const nb = 46; for (let k = 0; k < nb; k++) {                                                                  // bulbs round the arch
      const u = k / (nb - 1), ang = Math.PI * (1 - u), bx = CW / 2 + Math.cos(ang) * (CW / 2 - 2.5), by0 = 18 - Math.sin(ang) * 16, by = Math.max(2, Math.min(AH - 3, u < 0.08 ? 18 + (0.08 - u) * 300 : u > 0.92 ? 18 + (u - 0.92) * 300 : by0));
      const on = strobe ? (Math.floor(t * 22) + k) % 2 === 0 : (Math.floor(t * 8) + k) % 6 < 2; r(bx - 1.5, by - 1.5, 3, 3, FM_INK); r(bx - 1, by - 1, 2, 2, on ? 0xffffff : RB(k + Math.floor(t * 3))); } }
    // the name: each letter bobs on a wave and cycles colour; on a win they jump and strobe
    this.nameL.forEach((L, i) => { const ph = t * (strobe ? 9 : 3) - i * 0.5, q = A(CW / 2 + (i - 5.5) * 14, 26 - Math.max(0, Math.sin(ph)) * (strobe ? 4 : 1.6));
      L.setPosition(q.x, q.y).setColor('#' + (strobe ? RB(i + Math.floor(t * 14)) : [0xffd23f, 0xffe070, 0xffffff, 0xffd23f][Math.floor((t * 5 - i) % 4 + 4) % 4]).toString(16).padStart(6, '0')).setScale(strobe ? 1 + Math.max(0, Math.sin(ph)) * 0.18 : 1); });
    if (this.sticker) this.sticker.setScale(1 + 0.05 * Math.max(0, Math.sin(t * 3))).setRotation(-0.03 + Math.sin(t * 1.3) * 0.02);
    this.glowName.setAlpha(strobe ? 0.75 + 0.25 * Math.sin(t * 20) : 0.42 + 0.12 * Math.sin(t * 2)).setTint(strobe ? RB(Math.floor(t * 8)) : 0xff4a9a);
    // -- (v3.148) THE ROUTE: Chris's rocket flying a line of planets. Each planet is a prize - its size and colour say
    // what kind, the label under it says what (a cash amount, or the bonus). The bonuses get better further along:
    // COLLECT, then CHAIN, MARCH and MEGA collects, with the cheese moon JACKPOT at the end.
    const LG = this.lampGeo(), T = SLOT.STRENGTHS[this.sk].trail, py = LG.y + 4;
    r(5, LG.y - 3, 218, 21, FM.chrome[3]); r(6, LG.y - 2, 216, 19, 0x070414);
    for (let k = 0; k < 40; k++) { const sx = 7 + ((k * 53.7) % 214), sy = LG.y - 1 + ((k * 29.3) % 17), tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + k)); r(sx, sy, 0.6, 0.6, 0xffffff, tw * 0.7); }
    const PX = p => LG.x(p) + LG.lw / 2, PY = p => py + Math.sin(p * 1.3) * 1.2;
    for (let p = 0; p < LG.n - 1; p++) { const x0 = PX(p), x1 = PX(p + 1), done = p < this.dispPos; for (let u = 0.25; u < 0.9; u += 0.25) r(x0 + (x1 - x0) * u - 0.4, PY(p) + (PY(p + 1) - PY(p)) * u - 0.4, 0.8, 0.8, done ? 0xffd23f : 0x5a4a8a); }
    for (let p = 0; p < LG.n; p++) {
      const s2 = T[p], C = FM_LAMP[s2] || FM_LAMP.C, x = PX(p), y = PY(p), at = p === this.dispPos, lit = p <= this.dispPos, big = s2 === 'JACKPOT', bonus = s2 !== 'C';
      const rad = big ? 6.2 : bonus ? 4.6 : 3, col = lit ? C[1] : (strobe && Math.random() < 0.08 ? C[1] : C[0]);
      const circ = (cx, cy, rr, c2, a2) => g.fillStyle(c2, a2 === undefined ? 1 : a2).fillCircle(G.ox + cx * z, G.oy + cy * z, rr * z);
      if (at) circ(x, y, rad + 2.2 + Math.sin(t * 8) * 0.6, 0xffffff, 0.35);
      circ(x, y, rad + 0.7, FM_INK); circ(x, y, rad, big ? (lit ? 0xffe070 : 0x8a6a1a) : col);
      if (big) { circ(x - 2, y - 1, 1.2, lit ? 0xc8a030 : 0x5a4a10); circ(x + 1.5, y + 2, 0.9, lit ? 0xc8a030 : 0x5a4a10); circ(x + 2, y - 2.5, 0.7, lit ? 0xc8a030 : 0x5a4a10); }
      else if (bonus) { g.lineStyle(0.8 * z, lit ? 0xffffff : C[1], lit ? 0.9 : 0.5).strokeEllipse(G.ox + x * z, G.oy + y * z, (rad * 2 + 4.5) * z, 2.2 * z); }   // the bonus planets have rings
      circ(x - rad * 0.35, y - rad * 0.35, rad * 0.35, 0xffffff, lit ? 0.45 : 0.15);
      const L = this.lampT[p]; if (L) { const q = A(x, LG.y + 13.5); L.setPosition(q.x, q.y).setText(this.lampName(p)).setColor(at ? '#ffffff' : lit ? '#' + C[1].toString(16).padStart(6, '0') : bonus ? '#' + C[1].toString(16).padStart(6, '0') : '#a898d8').setStroke('#070414', 2).setAlpha(lit || bonus ? 1 : 0.75); }
    }
    // the rocket: glides to the planet you're on (sits before the first planet when you're not on the route yet)
    { const tx = this.dispPos >= 0 ? PX(this.dispPos) : LG.x(0) - 1, ty = this.dispPos >= 0 ? PY(this.dispPos) - 6.5 : py;
      this.rkX = this.rkX === undefined ? tx : this.rkX + (tx - this.rkX) * Math.min(1, dt * 6); this.rkY = this.rkY === undefined ? ty : this.rkY + (ty - this.rkY) * Math.min(1, dt * 6);
      const rx2 = this.rkX - 3, ry2 = this.rkY + Math.sin(t * 5) * 0.4, fl = Math.floor(t * 20) % 2, moving = Math.abs(tx - this.rkX) > 0.3;
      r(rx2 - (moving ? 4 : 2) - fl, ry2 - 0.5, (moving ? 4 : 2) + fl, 1.6, fl ? 0xffd23f : 0xff7a2a); r(rx2 - 1, ry2 - 1.6, 1, 1, FM_INK); r(rx2 - 1, ry2 + 1.2, 1, 1, FM_INK);
      r(rx2, ry2 - 1.2, 5, 3, FM_INK); r(rx2 + 0.3, ry2 - 0.9, 4.4, 2.4, 0xf4f0f8); r(rx2 + 4.4, ry2 - 0.6, 1.4, 1.8, 0xff3a3a); r(rx2 + 1.6, ry2 - 0.5, 1.2, 1.2, 0x5ad8ff); r(rx2 - 1, ry2 - 2, 2, 1, 0xff3a3a); r(rx2 - 1, ry2 + 1.6, 2, 1, 0xff3a3a); }
    // -- the reel window: a chrome bezel with chasing lights, the drums, glass glare, scanlines
    const bz = 5; r((rx - G.ox) / z - bz - 1, (ry - G.oy) / z - bz - 1, rw / z + 2 * bz + 2, rh / z + 2 * bz + 2, FM_INK);
    r((rx - G.ox) / z - bz, (ry - G.oy) / z - bz, rw / z + 2 * bz, rh / z + 2 * bz, FM.chrome[3]);
    { const per = 2 * (rw / z + rh / z) + 8 * bz, nb = 40; for (let k = 0; k < nb; k++) { let d = (k / nb) * per; const x0 = (rx - G.ox) / z - bz + 1.5, y0 = (ry - G.oy) / z - bz + 1.5, W2 = rw / z + 2 * bz - 3, H2 = rh / z + 2 * bz - 3; let x, y;
      if (d < W2) { x = x0 + d; y = y0; } else if ((d -= W2) < H2) { x = x0 + W2; y = y0 + d; } else if ((d -= H2) < W2) { x = x0 + W2 - d; y = y0 + H2; } else { d -= W2; x = x0; y = y0 + H2 - Math.min(H2, d); }
      const on = strobe ? (Math.floor(t * 24) + k) % 2 === 0 : (Math.floor(t * 10) + k) % 8 < 2; r(x - 1, y - 1, 2, 2, on ? 0xffffff : RB(Math.floor(k / 2))); } }
    for (let i = 0; i < 5; i++) { const x = rx + i * (cw + gap), R = this.R[i]; g.fillStyle(R.ant && R.stop ? (Math.floor(t * 10) % 2 ? 0xfff0b0 : 0xf4ecd8) : 0xf4ecd8, 1).fillRect(x, ry, cw, rh);
      for (let b = 0; b < 7; b++) { g.fillStyle(0x000000, 0.32 - b * 0.045).fillRect(x, ry + b * z, cw, z); g.fillStyle(0x000000, 0.32 - b * 0.045).fillRect(x, ry + rh - (b + 1) * z, cw, z); }
      if (i < 4) g.fillStyle(FM_INK, 1).fillRect(x + cw, ry, gap, rh); }
    // -- the meters and the ticker
    for (let k = 0; k < 3; k++) { r(9 + k * 72, 159, 70, 12, FM.chrome[1]); r(10 + k * 72, 160, 68, 10, 0x140404); }
    r(9, 172, 214, 10, FM.chrome[1]); r(10, 173, 212, 8, 0x140404);
    for (let x = 11; x < 221; x += 2) r(x, 173, 1, 8, 0x2a0a0a, 0.5);
    r(227, 168, 68, 14, FM.chrome[1]); r(228, 169, 66, 12, 0x140404);   // (v3.146) the session box
    // -- the deck: steps out wider, like a till, with five arcade buttons that light up
    r(-8, 183, CW + 16, bottom - 183, FM_INK); r(-6, 184, CW + 12, bottom - 184, FM.red[1]); r(-6, 184, CW + 12, 2, FM.gold[3]); r(-6, 186, CW + 12, 1, FM.gold[1]);
    const live = this.live();
    for (const [id, x, w] of this.deck()) {
      const on = live[id], pr = this.press[id] > 0 ? 1.2 : 0, col = id === 'spin' ? [0x0e4a1a, 0x2aa04a, 0x7dff8a] : id === 'take' ? [0x4a2a04, 0xc8902a, 0xffe070] : id === 'strength' ? [0x3a0e4a, 0x9a3ac0, 0xe08aff] : [0x0e2a4a, 0x2a6ac0, 0x8ac0ff];
      const flash = on && (id === 'spin' ? Math.floor(t * 3) % 2 : id === 'take' && this.pos >= 0 ? Math.floor(t * 5) % 2 : 0);
      r(x - 1, 187, w + 2, 18, FM_INK); r(x, 188 + pr, w, 16 - pr, on ? (flash ? col[2] : col[1]) : 0x2a2030); r(x, 188 + pr, w, 2, on ? 0xffffff : 0x3a3040, on ? 0.6 : 1);
      for (let k = 0; k < w; k += 4) r(x + k, 187, 2, 1, on && (Math.floor(t * 12) + k / 4) % 4 === 0 ? 0xffffff : col[0]);
      this.btnT[id][0].setY(G.oy + (194 + pr) * z); this.btnT[id][1].setY(G.oy + (200 + pr) * z);
    }
    this.glowSpin.setAlpha(live.spin ? 0.35 + 0.3 * Math.abs(Math.sin(t * 3)) : 0.05);
    // -- (v3.145) THE BURSTING UDDER: a window in the cabinet with Bessie's belly at the top and her udder underneath,
    // swelling with every coin that flies in, throbbing as it nears bursting, dripping milk into a pail that fills up
    { const x0 = G.TX, w = G.TW, B = this.bc, frac = Math.min(1, B.n / B.N), cxj = x0 + w / 2, near = frac > 0.75, y0 = 44, y1 = 158;
      const e = (cx, cy, rx2, ry2, col, a2) => g.fillStyle(col, a2 === undefined ? 1 : a2).fillEllipse(G.ox + cx * z, G.oy + cy * z, rx2 * 2 * z, ry2 * 2 * z);
      r(x0 - 3, y0 - 2, w + 6, y1 - y0 + 4, FM_INK); r(x0 - 2, y0 - 1, w + 4, y1 - y0 + 2, FM.chrome[3]);
      // the field behind: a sky and a strip of grass, a chasing ring of pink bulbs on the frame
      for (let k = 0; k < 6; k++) r(x0, y0 + 9 + k * 12, w, 12, [0x3a7ad0, 0x4a8ade, 0x5a9ae6, 0x6aaaea, 0x7ab8ee, 0x8ac6f0][k]);
      r(x0, 138, w, y1 - 138, 0x3a8a3a); r(x0, 138, w, 2, 0x6ad06a); r(x0, y0, w, 9, 0x5a0e2a);
      { const nb = 22; for (let k = 0; k < nb; k++) { const u = k / nb, side = u < 0.5, yy = y0 + 10 + (side ? u * 2 : (u - 0.5) * 2) * (y1 - y0 - 12), xx = side ? x0 - 1.5 : x0 + w + 0.5, on = (Math.floor(t * (near ? 16 : 6)) + k) % 3 === 0;
        r(xx, yy, 1.5, 2, on ? 0xffffff : 0xff6aa0); } }
      // Bessie's belly and legs (we only see her underneath: she's standing over the window)
      const sw = Math.sin(t * 1.4) * 0.8;
      for (const lx of [x0 + 5, x0 + w - 11]) { r(lx - 1, y0 + 9, 8, 70, FM_INK); r(lx, y0 + 9, 6, 68, 0xf4f0f8); r(lx, y0 + 30, 6, 10, 0x2a2438); r(lx - 1, y0 + 76, 8, 5, 0x3a2a1a); }
      e(cxj + sw, y0 + 16, w / 2 + 2, 14, FM_INK); e(cxj + sw, y0 + 15, w / 2 + 1, 13, 0xf4f0f8);
      e(cxj - 14 + sw, y0 + 14, 9, 6, 0x2a2438); e(cxj + 16 + sw, y0 + 19, 7, 5, 0x2a2438); e(cxj + 3 + sw, y0 + 10, 5, 3, 0x2a2438);
      // the udder: grows from a little pink bag to an enormous one; boings when a coin lands; throbs near the end
      this.udderBoing = Math.max(0, (this.udderBoing || 0) - dt); this.udderPop = Math.max(0, (this.udderPop || 0) - dt * 0.7);
      const grow = this.udderPop > 0 ? 0.15 : frac, boing = Math.sin(this.udderBoing * 30) * this.udderBoing * 0.5, throb = near ? 1 + Math.sin(t * 14) * 0.06 : 1;
      const urx = (8 + grow * 16) * throb * (1 + boing), ury = (6 + grow * 15) * throb * (1 - boing * 0.6), ucy = y0 + 26 + ury * 0.9;
      // (v3.146) a proper droopy udder, not a balloon: a squashed top, two saggy lobes that bulge out and hang lower,
      // the whole thing jiggling; four teats splayed outward at angles, swinging, getting longer as she fills
      const jig = Math.sin(t * 3.1) * (0.6 + grow) + boing * 6, lob = 1 + grow * 0.35;
      const bag = (dx2, dy2, rx3, ry3, col) => e(cxj + sw + dx2, ucy + dy2, rx3, ry3, col);
      const blobs = [[0, -ury * 0.25, urx, ury * 0.75], [-urx * 0.45 - jig * 0.3, ury * 0.18, urx * 0.62 * lob, ury * 0.72], [urx * 0.45 + jig * 0.3, ury * 0.22 + jig * 0.15, urx * 0.62 * lob, ury * 0.7]];
      for (const [dx2, dy2, rx3, ry3] of blobs) bag(dx2, dy2, rx3 + 1, ry3 + 1, FM_INK);
      const pink = near ? (Math.floor(t * 8) % 2 ? 0xff8aa8 : 0xf6a0b8) : 0xf2a6b8;
      for (const [dx2, dy2, rx3, ry3] of blobs) bag(dx2, dy2, rx3, ry3, pink);
      bag(0, ury * 0.55, urx * 0.18, ury * 0.35, 0xd8849a);                                                              // the crease down the middle
      bag(-urx * 0.55 - jig * 0.3, ury * 0.0, urx * 0.22, ury * 0.22, 0xffd0dc);                                         // the shine
      if (grow > 0.5) for (let k = 0; k < 4; k++) { const vx = cxj + sw + (k - 1.5) * urx * 0.42, vy = ucy + Math.sin(k * 2.1) * ury * 0.25; g.lineStyle(Math.max(1, z * 0.7), 0xc8506a, 0.55).lineBetween(G.ox + vx * z, G.oy + vy * z, G.ox + (vx + Math.sin(k * 1.7) * 3) * z, G.oy + (vy + ury * 0.35) * z); }   // veins: it's straining
      const tl = 3 + grow * 5;
      const teats = [[-0.62, -0.55], [-0.22, -0.18], [0.22, 0.2], [0.62, 0.58]].map(([f2, ang], k) => {
        const bx = cxj + sw + f2 * urx * 1.05 + (f2 < 0 ? -jig * 0.3 : jig * 0.3), by = ucy + ury * (0.62 + 0.3 * (1 - Math.abs(f2))) + (f2 > 0 ? jig * 0.15 : 0);
        const a = ang * 0.6 + Math.sin(t * 2.3 + k * 1.3) * 0.22, ex = bx + Math.sin(a) * tl, ey = by + Math.cos(a) * tl;
        g.lineStyle(4 * z, FM_INK, 1).lineBetween(G.ox + bx * z, G.oy + by * z, G.ox + ex * z, G.oy + ey * z);
        g.lineStyle(2.6 * z, 0xe08aa0, 1).lineBetween(G.ox + bx * z, G.oy + by * z, G.ox + ex * z, G.oy + ey * z);
        g.fillStyle(0xd06a86, 1).fillCircle(G.ox + ex * z, G.oy + ey * z, 1.4 * z);
        return [ex, ey];
      });
      // milk dripping (faster the fuller she is) into the pail, which fills up with the pot
      this.drips = this.drips || []; this.dripT = (this.dripT || 0) - dt * (0.6 + frac * 6 + (near ? 6 : 0));
      if (this.dripT <= 0 && B.n > 0) { this.dripT = 1; const tq = teats[Math.floor(Math.random() * 4)]; this.drips.push({ x: tq[0], y: tq[1], vy: 10 }); }
      const pailTop = 128 - frac * 6;
      for (const d of this.drips) { d.vy += 160 * dt; d.y += d.vy * dt; r(d.x - 0.8, d.y - 1.6, 1.6, 2.4, 0xffffff); if (d.y >= pailTop) { d.dead = true; this.sparks.push({ x: G.ox + d.x * z, y: G.oy + pailTop * z, vx: (Math.random() - 0.5) * 40, vy: -30 - Math.random() * 40, life: 0.25, col: 0xffffff }); } }
      this.drips = this.drips.filter(d => !d.dead);
      // the pail (with the pot on its side) and the milk in it
      const px0 = cxj - 16, pw = 32; r(px0 - 1, 127, pw + 2, 28, FM_INK); r(px0, 128, pw, 26, FM.chrome[2]); r(px0, 128, 3, 26, FM.chrome[4]); r(px0 + pw - 3, 128, 3, 26, FM.chrome[0]);
      r(px0 + 2, 128, pw - 4, 3, 0xffffff); r(px0, 127, pw, 1, FM.chrome[4]);
      // the must-burst meter, under the window
      const segs = B.N, sw2 = (w - 4) / segs; for (let k = 0; k < segs; k++) r(x0 + 2 + k * sw2, 159, Math.max(0.6, sw2 - 0.6), 3, k < B.n ? (near ? (Math.floor(t * 12) + k) % 2 ? 0xff4a8a : 0xffd0dc : 0xffd0dc) : 0x3a2a5a);
      this.glowJar.setAlpha(near ? 0.5 + 0.4 * Math.abs(Math.sin(t * 8)) : 0.12 + frac * 0.3);
      if (this.ph === 'pop') { const k = Math.floor(t * 20); r(x0, y0, w, y1 - y0, k % 2 ? 0xffffff : 0xffd0dc, 0.35); }
      this.bcT[0].setText(near ? (Math.floor(t * 4) % 2 ? 'NEARLY MILKING TIME!' : 'THE BIG UDDER') : 'THE BIG UDDER').setColor(near ? '#ff6aa0' : '#ffd0dc');
    }
    // -- the LEVER: a chrome mount on the cabinet's side, a long arm and a red ball. It swings down when the reels go
    this.leverT = Math.max(0, (this.leverT || 0) - dt); const lu = this.leverT > 0 ? 1 - this.leverT / 0.5 : 1, pull = lu < 0.35 ? Math.sin(lu / 0.35 * Math.PI / 2) : Math.cos((lu - 0.35) / 0.65 * Math.PI / 2);
    { const px = G.LX, py = G.LY, ang = -Math.PI / 2 + 0.12 + pull * (Math.PI - 0.5), L = 70, bx = px + Math.cos(ang) * L, by = py + Math.sin(ang) * L;
      r(CW - 1, py - 12, 10, 24, FM_INK); r(CW, py - 11, 8, 22, FM.chrome[2]); r(CW, py - 11, 8, 2, FM.chrome[4]);
      g.lineStyle(5 * z, FM_INK, 1).lineBetween(G.ox + px * z, G.oy + py * z, G.ox + bx * z, G.oy + by * z);
      g.lineStyle(3 * z, FM.chrome[3], 1).lineBetween(G.ox + px * z, G.oy + py * z, G.ox + bx * z, G.oy + by * z);
      g.lineStyle(1 * z, 0xffffff, 0.8).lineBetween(G.ox + (px - 0.8) * z, G.oy + py * z, G.ox + (bx - 0.8) * z, G.oy + by * z);
      g.fillStyle(FM_INK, 1).fillCircle(G.ox + px * z, G.oy + py * z, 6 * z); g.fillStyle(FM.chrome[2], 1).fillCircle(G.ox + px * z, G.oy + py * z, 5 * z);
      const idleHint = this.ph === 'idle' && Math.floor(t * 2) % 2;
      g.fillStyle(FM_INK, 1).fillCircle(G.ox + bx * z, G.oy + by * z, 8.5 * z); g.fillStyle(idleHint ? 0xff4a4a : 0xd81a2a, 1).fillCircle(G.ox + bx * z, G.oy + by * z, 7.5 * z);
      g.fillStyle(0x8a0a14, 1).fillCircle(G.ox + (bx + 2) * z, G.oy + (by + 2) * z, 4.5 * z); g.fillStyle(0xff8a8a, 1).fillCircle(G.ox + (bx - 2.5) * z, G.oy + (by - 2.5) * z, 2.2 * z); g.fillStyle(0xffffff, 1).fillRect(G.ox + (bx - 3.5) * z, G.oy + (by - 3.5) * z, 1.5 * z, 1.5 * z); }
    // -- Louise, left of the cabinet
    // (v3.145) she DANCES to the music (150 bpm: a beat every 0.4s), arms swapping on the beat, hips swinging; on a win
    // she goes wild (cheer and dance frames, double time); a wink still pops in now and then
    { this.louT = Math.max(0, this.louT - dt); if (this.louT <= 0 && this.louPose !== 'idle') this.louPose = 'idle';
      const room = G.ox - 14 * z, sc = Math.min(z * 1.1, room / 46);
      if (sc < 1) this.lou.setVisible(false);
      else {
        const beat = t * 2.5, wild = this.louPose === 'cheer', ph = (wild ? beat * 2 : beat) % 1, k = Math.floor(wild ? beat * 2 : beat);
        const tex = this.louPose === 'wink' ? 'lou_wink' : wild ? (k % 3 === 0 ? 'lou_cheer' : 'lou_dance' + (k % 2)) : 'lou_dance' + (k % 2);
        const bob = Math.abs(Math.sin(ph * Math.PI)) * (wild ? 4 : 1.6) * sc, sway = Math.sin(beat * Math.PI) * (wild ? 0.09 : 0.05);
        this.lou.setVisible(true).setTexture(tex).setScale(sc * (1 + (wild ? 0.03 * Math.sin(ph * Math.PI) : 0))).setRotation(sway).setPosition(Math.round((G.ox - 10 * z) / 2 + Math.sin(beat * Math.PI) * 2 * sc), Math.round(Math.min(G.H + 4, G.oy + 206 * z) - bob));
      } }
  }
  // the reel glass over the symbols: scanlines and a glare that sweeps across now and then
  drawGlass(G, t) {
    const fg = this.fg, { rx, ry, rw, rh, z } = G;
    for (let y = 0; y < rh; y += 3 * z) fg.fillStyle(0x000000, 0.12).fillRect(rx, ry + y, rw, Math.max(1, z * 0.8));
    const u = (t * 0.25) % 1.6; if (u < 1) { const x = rx - rh + u * (rw + rh * 2); fg.fillStyle(0xffffff, 0.12).fillTriangle(x, ry, x + 18 * z, ry, x - rh + 18 * z, ry + rh).fillTriangle(x, ry, x - rh, ry + rh, x - rh + 18 * z, ry + rh); }
  }
  lampName(p) { const s2 = SLOT.STRENGTHS[this.sk].trail[p]; return s2 === 'C' ? String(Math.max(1, Math.round(SLOT.TUNE[this.sk].val[p] * this.bet()))) : { FREE: 'FREE', SUPER: 'SUPR', RAT: 'RAT', RESPIN: 'COIN', JACKPOT: 'JACK', COLLECT: 'COLL', CHAIN: 'CHAIN', MARCH: 'MRCH', MEGA: 'MEGA' }[s2]; }
  // ---------------------------------------------------------------- (v3.120) THE BIG CHEESE: an American-style builder
  // About one base spin in five drops a cheese coin (worth 0.1x-1x the bet) on a reel; it flies up into the dome and
  // the pot grows. The dome MUST POP by a hidden-ish count (shown as the meter, 18-30 coins): then the whole pot pays.
  // Coins are worth 5.1% of the bet on average, so with the reels and trail at ~90% the machine stays at ~95%.
  bcLoad() { let B = null; try { B = JSON.parse(localStorage.getItem('lc_bigcheese_' + this.from) || 'null'); } catch (e) { /* */ } this.bc = B && B.N ? B : { pot: 0, n: 0, N: 18 + Math.floor(Math.random() * 13) }; }
  bcSave() { try { localStorage.setItem('lc_bigcheese_' + this.from, JSON.stringify(this.bc)); } catch (e) { /* */ } }
  bcRefresh() { if (!this.bcT || !this.bc) return; this.bcT[1].setText('x' + Math.max(1, Math.round(this.bc.pot / MILK_EM * 10) / 10)); this.bcT[2].setText('MILKING BY ' + this.bc.N + ' SQUIRTS'); }
  bcDrop() {                                           // called as a paid spin settles: maybe a coin lands
    if (Math.random() >= 0.2) return null;
    const vs = [[0.1, 0.35], [0.2, 0.3], [0.3, 0.2], [0.5, 0.1], [1, 0.05]]; let u = Math.random(), v = 0.1; for (const [x, p] of vs) { if ((u -= p) <= 0) { v = x; break; } }
    return { v: v * this.bet(), reel: Math.floor(Math.random() * 5), row: Math.floor(Math.random() * 3) };
  }
  bcFly(c) {
    const G = this.geom(), from = this.cell(c.reel, c.row), to = G.A(G.TX + G.TW / 2, 92), im = this.add.image(from.x, from.y, 'fm_coin').setDepth(7.6).setScale(G.z * 1.6);
    const tx = this.add.text(from.x, from.y + 12 * G.z, '+' + Math.round(c.v), { fontFamily: PIXEL, fontSize: Math.round(4 * G.z) + 'px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 3 }).setOrigin(0.5).setDepth(7.7);
    Sound.sfx('chime'); this.burstAt(from.x, from.y, 0xffd23f, 12);
    this.tweens.add({ targets: im, scale: G.z * 2.2, duration: 200, yoyo: true });
    this.tweens.add({ targets: [im], x: to.x, y: to.y, delay: 420, duration: 520, ease: 'Cubic.easeIn', onComplete: () => { im.destroy(); this.bc.pot += c.v; this.bc.n++; this.bcSave(); this.bcRefresh(); Sound.sfx('moo'); this.burstAt(to.x, to.y, 0xffffff, 16); this.udderBoing = 0.5; if (this.bc.n >= this.bc.N) this.bcPending = true; } });
    this.tweens.add({ targets: tx, y: tx.y - 20 * G.z, alpha: 0, delay: 300, duration: 900, onComplete: () => tx.destroy() });
  }
  bcPop() {
    const B = this.bc, G = this.geom(), at = G.A(G.TX + G.TW / 2, 92); this.bcPending = false; this.ph = 'milk'; this.udderPop = 1;
    const stake = Math.max(1, B.pot / MILK_EM);
    this.bc = { pot: 0, n: 0, N: 18 + Math.floor(Math.random() * 13) }; this.bcSave(); this.bcRefresh();
    Sound.sfx('moo'); this.bigBanner('MILKING TIME!', 0xffd0dc, 1.4); this.cameras.main.flash(300, 255, 240, 250); this.fountain(30, at);
    this.louise('cheer', 2, 'SHE\'S FULL! GRAB A STOOL, CHRIS!');
    this.time.delayedCall(1500, () => this.milkStart(stake));
  }
  // ---------------------------------------------------------------- (v3.147) THE MILKING
  milkStart(stake) {
    const W = this.scale.width, H = this.scale.height;
    this.mk = { lvl: 0, mult: 1, stake, sel: 1, busy: false, teats: [], sq: [0, 0, 0, 0], off: 0, gone: false, fill: 0.15, msg: 'PICK A TEAT TO SQUEEZE', t: 0, fly: null, drops: [] };
    this.mkC = this.add.container(0, 0).setDepth(15); this.mkG = this.add.graphics(); this.mkC.add(this.mkG);
    const f = (sz, col, o) => Object.assign({ fontFamily: PIXEL, fontSize: Math.round(sz) + 'px', color: col, stroke: '#1a1020', strokeThickness: 4 }, o || {});
    const S = Math.min(W / 420, H / 240); this.mk.S = S;
    this.mkT = {
      title: this.add.text(W * 0.4, 6 * S, 'MILK HER FOR ALL SHE\'S WORTH', f(9 * S, '#ffd0dc')).setOrigin(0.5, 0),
      mult: this.add.text(0, 0, 'x1', f(22 * S, '#ffffff', { strokeThickness: 6 })).setOrigin(0.5),
      win: this.add.text(0, 0, '', f(7 * S, '#ffd23f')).setOrigin(0.5),
      msg: this.add.text(W * 0.4, 20 * S, '', f(6 * S, '#ffd23f')).setOrigin(0.5, 0),
      teat: [0, 1, 2, 3].map(() => this.add.text(0, 0, '', f(9 * S, '#ffffff', { strokeThickness: 5 })).setOrigin(0.5)),
      lad: MILK_LV.map(() => this.add.text(0, 0, '', f(5.2 * S, '#ffffff', { strokeThickness: 3 })).setOrigin(0, 0.5))
    };
    this.mkLou = this.add.image(0, 0, 'lou_dance0');
    this.mkC.add([this.mkLou, this.mkT.title, this.mkT.mult, this.mkT.win, this.mkT.msg, ...this.mkT.teat, ...this.mkT.lad]);
    this.mkC.setAlpha(0); this.tweens.add({ targets: this.mkC, alpha: 1, duration: 300 });
    Sound.music('slots');
    this.milkRound();
  }
  milkRound() {
    const M = this.mk, L = MILK_LV[M.lvl], vals = L.m.slice().sort(() => Math.random() - 0.5).slice(0, 4 - L.dry), cells = vals.concat(Array(L.dry).fill(0)).sort(() => Math.random() - 0.5);
    M.teats = cells.map(v => ({ v, open: false })); M.busy = false; M.msg = 'ROUND ' + (M.lvl + 1) + ' OF 5: FILL THE ' + L.name + '!  ' + (4 - L.dry) + ' TEATS SQUIRT, ' + L.dry + ' ' + (L.dry > 1 ? 'ARE' : 'IS') + ' DRY';
    this.mkT.teat.forEach(t => t.setText(''));
  }
  milkGeo() {
    const W = this.scale.width, H = this.scale.height, S = this.mk.S, cx = W * 0.4 + this.mk.off * W, ux = cx, uy = 74 * S, urx = 58 * S, ury = 36 * S;
    const teats = [-0.66, -0.22, 0.22, 0.66].map((f2, k) => ({ x: ux + f2 * urx * 1.1, y: uy + ury * (0.7 + 0.3 * (1 - Math.abs(f2))), k }));
    return { W, H, S, cx, ux, uy, urx, ury, teats, vy: H - 6 * S, lx: W - 104 * S };
  }
  milkPick(k) {
    const M = this.mk; if (!M || M.busy || M.gone) return; const T = M.teats[k]; if (!T || T.open) return;
    M.busy = true; T.open = true; M.sq[k] = 1; Sound.sfx('squish');
    const Gm = this.milkGeo(), tp = Gm.teats[k];
    if (!T.v) {                                                   // DRY: a puff of dust, a fly, a look, and off she plods
      this.time.delayedCall(250, () => {
        Sound.sfx('clunk'); this.mkT.teat[k].setText('DRY').setColor('#c8a878').setPosition(tp.x, tp.y + 40 * Gm.S);
        for (let q = 0; q < 14; q++) M.drops.push({ x: tp.x, y: tp.y + 24 * Gm.S, vx: (Math.random() - 0.5) * 120, vy: -Math.random() * 60, life: 0.7, col: 0xc8a878, r: 3 + Math.random() * 3 });
        M.fly = { x: tp.x, y: tp.y + 20 * Gm.S, t: 0 };
        M.teats.forEach((q, i) => { if (!q.open) { const p = Gm.teats[i]; this.mkT.teat[i].setText(q.v ? 'x' + q.v : 'DRY').setColor(q.v ? '#a0a0b8' : '#8a7a60').setAlpha(0.7).setPosition(p.x, p.y + 40 * Gm.S); } });
        this.louise('wink', 2, 'BESSIE\'S HAD ENOUGH!'); M.msg = 'DRY! BESSIE\'S HAD ENOUGH - YOU KEEP x' + M.mult;
      });
      this.time.delayedCall(1500, () => { Sound.sfx('moo'); this.tweens.add({ targets: M, off: 1.4, duration: 2200, ease: 'Sine.easeIn' }); M.gone = true; });
      this.time.delayedCall(3600, () => this.milkEnd());
      return;
    }
    // a squirt: milk arcs into the vessel, the multiplier jumps
    this.time.delayedCall(180, () => {
      Sound.sfx('splash'); M.mult = T.v; M.fill = Math.min(1, 0.25 + Math.random() * 0.5);
      for (let q = 0; q < 26; q++) M.drops.push({ x: tp.x, y: tp.y + 24 * Gm.S, vx: (Gm.cx - tp.x) * (0.6 + Math.random() * 0.6) + (Math.random() - 0.5) * 40, vy: 40 + Math.random() * 80, life: 1.2, col: 0xffffff, r: 2 + Math.random() * 2.5, milk: true });
      this.mkT.teat[k].setText('x' + T.v).setColor('#7dff8a').setPosition(tp.x, tp.y + 40 * Gm.S);
      this.tweens.add({ targets: this.mkT.mult, scale: 1.5, yoyo: true, duration: 140 }); Sound.sfx(M.lvl >= 3 ? 'bells' : 'ding');
      M.msg = ['LOVELY!', 'GET IN!', 'UDDERLY BRILLIANT!', 'THE CREAM OF THE CROP!', 'MOO-VELLOUS!'][M.lvl] + '  x' + T.v;
      this.louise('cheer', 1.2);
    });
    this.time.delayedCall(1100, () => {
      M.teats.forEach((q, i) => { if (!q.open) { const p = Gm.teats[i]; this.mkT.teat[i].setText(q.v ? 'x' + q.v : 'DRY').setColor(q.v ? '#a0a0b8' : '#8a7a60').setAlpha(0.7).setPosition(p.x, p.y + 40 * Gm.S); } });
    });
    this.time.delayedCall(2200, () => {
      this.mkT.teat.forEach(t => t.setAlpha(1));
      if (M.lvl >= MILK_LV.length - 1) { M.msg = 'THE TANKER\'S FULL! x' + M.mult + '!!'; Sound.sfx('honk'); this.time.delayedCall(400, () => Sound.sfx('honk')); this.time.delayedCall(1400, () => this.milkEnd()); return; }
      M.lvl++; M.fill = 0.12; Sound.sfx('reveal'); this.milkRound();
    });
  }
  milkEnd() {
    const M = this.mk; if (!M || M.ended) return; M.ended = true;
    const amt = Math.max(1, Math.round(M.stake * M.mult));
    this.tweens.add({ targets: this.mkC, alpha: 0, duration: 300, onComplete: () => { this.mkC.destroy(); this.mkC = null; this.mk = null; } });
    this.addBal(amt); this.lastWin = amt; this.countWin(amt, Math.max(M.mult, amt / this.bet()));
    if (M.mult >= 50) Sound.jingle('slotbig', 'slots');
    this.say('THE MILKING PAID ' + amt + '  (x' + M.mult + ')', '#ffd0dc'); this.refresh();
  }
  milkDraw(dt) {
    const M = this.mk; if (!M) return; M.t += dt; const t = M.t, g = this.mkG, Gm = this.milkGeo(), { W, H, S } = Gm; g.clear();
    // the barn at night-ish: a warm wall, hay on the floor
    for (let k = 0; k < 8; k++) g.fillStyle([0x3a1a12, 0x42201a, 0x4a2a1e, 0x522e20, 0x5a3424, 0x623a28, 0x6a422c, 0x724a30][k], 1).fillRect(0, k * H / 8, W, H / 8 + 1);
    for (let x = 0; x < W; x += 26 * S) g.fillStyle(0x2a120a, 0.5).fillRect(x, 0, 2 * S, H * 0.8);
    g.fillStyle(0xc8a040, 1).fillRect(0, H * 0.8, W, H * 0.2); for (let x = 0; x < W; x += 6 * S) g.fillStyle(0xe8c060, 1).fillRect(x + (x * 7 % 5), H * 0.8 + ((x * 13) % 17) * S * 0.5, 4 * S, 1.5 * S);
    // BESSIE: legs, belly with patches, the udder (droopy, two lobes), four big teats
    const sw = Math.sin(t * 1.3) * 3 * S + (M.gone ? Math.sin(t * 9) * 4 * S : 0), cx = Gm.cx + sw;
    for (const lx of [cx - 150 * S, cx - 120 * S, cx + 112 * S, cx + 142 * S]) { g.fillStyle(0x1a1020, 1).fillRect(lx - 1.5 * S, 10 * S, 21 * S, H * 0.8 - 2 * S); g.fillStyle(0xf4f0f8, 1).fillRect(lx, 10 * S, 18 * S, H * 0.8 - 10 * S); g.fillStyle(0x2a2438, 1).fillRect(lx, 60 * S, 18 * S, 26 * S); g.fillStyle(0x3a2a1a, 1).fillRect(lx - 2 * S, H * 0.8 - 12 * S, 22 * S, 12 * S); }
    g.fillStyle(0x1a1020, 1).fillEllipse(cx, 16 * S, 360 * S, 96 * S); g.fillStyle(0xf4f0f8, 1).fillEllipse(cx, 14 * S, 354 * S, 90 * S);
    g.fillStyle(0x2a2438, 1).fillEllipse(cx - 80 * S, 20 * S, 90 * S, 40 * S).fillEllipse(cx + 70 * S, 6 * S, 70 * S, 34 * S).fillEllipse(cx + 140 * S, 30 * S, 40 * S, 22 * S);
    const jig = Math.sin(t * 3) * 3 * S, { urx, ury, uy } = Gm, lobes = [[0, -ury * 0.25, urx, ury * 0.75], [-urx * 0.45 - jig, ury * 0.18, urx * 0.66, ury * 0.74], [urx * 0.45 + jig, ury * 0.22, urx * 0.66, ury * 0.72]];
    for (const [dx, dy, rx, ry] of lobes) g.fillStyle(0x1a1020, 1).fillEllipse(cx + dx, uy + dy, rx * 2 + 4 * S, ry * 2 + 4 * S);
    for (const [dx, dy, rx, ry] of lobes) g.fillStyle(0xf2a6b8, 1).fillEllipse(cx + dx, uy + dy, rx * 2, ry * 2);
    g.fillStyle(0xd8849a, 1).fillEllipse(cx, uy + ury * 0.55, urx * 0.36, ury * 0.6); g.fillStyle(0xffd0dc, 1).fillEllipse(cx - urx * 0.5 - jig, uy - ury * 0.05, urx * 0.4, ury * 0.4);
    Gm.teats.forEach((tp, k) => {
      const T = M.teats[k] || {}, sq = M.sq[k] = Math.max(0, M.sq[k] - dt * 2.5), len = (30 + sq * 14) * S, ang = (tp.k - 1.5) * 0.2 + Math.sin(t * 2.2 + k) * 0.12, x0 = tp.x + sw, y0 = tp.y;
      const x1 = x0 + Math.sin(ang) * len, y1 = y0 + Math.cos(ang) * len, sel = !M.busy && !T.open && M.sel === k && !M.gone;
      if (sel) { g.lineStyle(20 * S, 0xffd23f, 0.35 + 0.25 * Math.sin(t * 8)).lineBetween(x0, y0, x1, y1); }
      g.lineStyle(15 * S, 0x1a1020, 1).lineBetween(x0, y0, x1, y1); g.lineStyle(11 * S * (1 - sq * 0.3), T.open ? (T.v ? 0xf0b0c0 : 0xc89090) : 0xe08aa0, 1).lineBetween(x0, y0, x1, y1);
      g.lineStyle(3 * S, 0xffc0d0, 0.8).lineBetween(x0 - 3 * S, y0, x1 - 3 * S, y1); g.fillStyle(0xd06a86, 1).fillCircle(x1, y1, 5 * S);
      if (!T.open && !M.gone && !M.busy) { const tt = this.mkT.teat[k]; tt.setText('?').setColor('#ffffff').setAlpha(0.6 + 0.4 * Math.sin(t * 4 + k)).setPosition(x1, y1 + 14 * S); }
    });
    // the vessel for this round, filling with milk
    const V = MILK_LV[M.lvl].name, vx = W * 0.4, vy = Gm.vy, fill = M.fill = Math.min(1, M.fill + dt * 0.02);
    this.milkVessel(g, V, vx, vy, S * 0.78, fill, t);
    // the multiplier + what it's worth
    this.mkT.mult.setText('x' + M.mult).setPosition(W * 0.4 - 118 * S, H * 0.42); this.mkT.win.setText('WORTH ' + Math.max(1, Math.round(M.stake * M.mult))).setPosition(W * 0.4 - 118 * S, H * 0.42 + 22 * S);
    // milk and dust in flight, the fly
    for (const d of M.drops) { d.vy += 300 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life -= dt; g.fillStyle(d.col, Math.min(1, d.life * 2)).fillRect(d.x - d.r / 2, d.y - d.r / 2, d.r, d.r); if (d.milk && d.y > vy - 30 * S) d.life = 0; }
    M.drops = M.drops.filter(d => d.life > 0);
    if (M.fly) { const F = M.fly; F.t += dt; const fx = F.x + Math.sin(F.t * 7) * 30 * S + F.t * 40 * S, fy = F.y - F.t * 30 * S + Math.cos(F.t * 11) * 10 * S; g.fillStyle(0x1a1020, 1).fillCircle(fx, fy, 3 * S); g.fillStyle(0xffffff, 0.7).fillEllipse(fx - 2 * S, fy - 3 * S, 4 * S, 3 * S).fillEllipse(fx + 2 * S, fy - 3 * S, 4 * S, 3 * S); }
    // the ladder: five vessels, best at the bottom
    const lx = Gm.lx, ly = 30 * S, lh = 36 * S;
    g.fillStyle(0x1a1020, 0.75).fillRect(lx - 6 * S, ly - 22 * S, 108 * S, lh * 5 + 26 * S); this.mkT.lad.forEach((tx, i) => {
      const L = MILK_LV[i], y = ly + i * lh, cur = i === M.lvl, done = i < M.lvl;
      if (cur) g.fillStyle(0xffd23f, 0.3 + 0.15 * Math.sin(t * 6)).fillRect(lx - 4 * S, y - 2 * S, 104 * S, lh - 4 * S);
      tx.setText((done ? 'OK ' : '') + L.name + '\nx' + L.m[0] + '-' + L.m[3]).setPosition(lx + 2 * S, y + lh / 2 - 3 * S).setColor(cur ? '#ffd23f' : done ? '#7dff8a' : '#c8b8e8');
    });
    this.mkT.lad[0].scene && 0;
    this.mkT.msg.setText(M.msg);
    // Louise, cheering from the left
    const beat = this.t * 2.5, k2 = Math.floor(beat); this.mkLou.setTexture(this.louPose === 'wink' ? 'lou_wink' : this.louPose === 'cheer' ? (k2 % 2 ? 'lou_cheer' : 'lou_dance0') : 'lou_dance' + (k2 % 2)).setScale(S * 1.1).setPosition(24 * S, H * 0.8 - 52 * S - Math.abs(Math.sin(beat * Math.PI)) * 3 * S).setRotation(Math.sin(beat * Math.PI) * 0.05);
  }
  milkVessel(g, V, x, y, S, fill, t) {
    const K = 0x1a1020, ST = 0xb8c0cc, ST2 = 0x8a92a0, MILK = 0xfcfcff;
    const box = (x0, y0, w, h, col) => g.fillStyle(col, 1).fillRect(x0, y0, w, h);
    if (V === 'PAIL') { const w = 46 * S, h = 40 * S; g.fillStyle(K, 1).fillPoints([{ x: x - w / 2 - 3 * S, y: y - h - 2 * S }, { x: x + w / 2 + 3 * S, y: y - h - 2 * S }, { x: x + w / 2 - 6 * S, y: y + 2 * S }, { x: x - w / 2 + 6 * S, y: y + 2 * S }], true);
      g.fillStyle(ST, 1).fillPoints([{ x: x - w / 2, y: y - h }, { x: x + w / 2, y: y - h }, { x: x + w / 2 - 8 * S, y }, { x: x - w / 2 + 8 * S, y }], true); g.fillStyle(MILK, 1).fillEllipse(x, y - h + 4 * S, (w - 6 * S) * (0.6 + 0.4 * fill), 8 * S);
      g.lineStyle(3 * S, K, 1).beginPath().arc(x, y - h, w / 2, Math.PI, 0).strokePath(); }
    else if (V === 'CHURN') { const w = 44 * S, h = 70 * S; box(x - w / 2 - 2 * S, y - h - 2 * S, w + 4 * S, h + 4 * S, K); box(x - w / 2, y - h, w, h, ST); box(x - w / 2, y - h + 18 * S, w, 4 * S, ST2); box(x - w / 2, y - 14 * S, w, 4 * S, ST2);
      box(x - 14 * S, y - h - 14 * S, 28 * S, 14 * S, K); box(x - 12 * S, y - h - 12 * S, 24 * S, 12 * S, ST); box(x - 6 * S, y - h - 20 * S, 12 * S, 8 * S, ST2); box(x - w / 2 + 4 * S, y - h + 2 * S, 4 * S, h - 4 * S, 0xe8eef8);
      box(x - w / 2 + 10 * S, y - 6 * S - (h - 30 * S) * fill, 6 * S, 4 * S, MILK); }
    else if (V === 'BATHTUB') { const w = 120 * S, h = 46 * S; g.fillStyle(K, 1).fillRoundedRect(x - w / 2 - 3 * S, y - h - 3 * S, w + 6 * S, h + 6 * S, 18 * S); g.fillStyle(0xf8f8fc, 1).fillRoundedRect(x - w / 2, y - h, w, h, 16 * S);
      g.fillStyle(MILK, 1).fillRect(x - w / 2 + 6 * S, y - h + 4 * S, w - 12 * S, 6 * S); g.fillStyle(0xd8dce8, 1).fillRect(x - w / 2 + 6 * S, y - h + 10 * S, w - 12 * S, 2 * S);
      for (const fx of [x - w / 2 + 14 * S, x + w / 2 - 22 * S]) { box(fx, y, 8 * S, 8 * S, 0xd8b040); } for (let k = 0; k < 4; k++) g.fillStyle(MILK, 0.9).fillCircle(x - 30 * S + k * 20 * S, y - h + 2 * S - Math.abs(Math.sin(t * 2 + k)) * 6 * S * fill, 5 * S); }
    else if (V === 'MILK FLOAT') { const w = 150 * S, h = 56 * S; box(x - w / 2 - 2 * S, y - h - 2 * S, w + 4 * S, h - 8 * S, K); box(x - w / 2, y - h, w * 0.7, h - 12 * S, 0x2a8a4a); box(x + w * 0.2, y - h + 8 * S, w * 0.3, h - 20 * S, 0xf0f0f0);
      box(x + w * 0.25, y - h + 12 * S, w * 0.2, 14 * S, 0x8ac8e8); for (let k = 0; k < 6; k++) { box(x - w / 2 + 8 * S + k * 16 * S, y - h + 10 * S, 10 * S, 24 * S, K); box(x - w / 2 + 9 * S + k * 16 * S, y - h + 11 * S, 8 * S, 22 * S, k / 6 < fill + 0.3 ? MILK : 0x6a8aa0); }
      box(x - w / 2, y - h - 10 * S, w * 0.7, 10 * S, 0xffd23f); for (const wx of [x - w / 2 + 24 * S, x + w / 2 - 24 * S]) { g.fillStyle(K, 1).fillCircle(wx, y - 8 * S, 11 * S); g.fillStyle(0x8a8a9a, 1).fillCircle(wx, y - 8 * S, 5 * S); } }
    else { const w = 200 * S, h = 60 * S; g.fillStyle(K, 1).fillRoundedRect(x - w / 2 - 3 * S, y - h - 3 * S, w * 0.75 + 6 * S, h - 10 * S, 22 * S); g.fillStyle(0xe8ecf4, 1).fillRoundedRect(x - w / 2, y - h, w * 0.75, h - 16 * S, 20 * S);
      g.fillStyle(0x8a92a0, 1).fillRect(x - w / 2 + 10 * S, y - h + 18 * S, w * 0.75 - 20 * S, 3 * S); box(x + w * 0.27, y - h + 6 * S, w * 0.23, h - 22 * S, 0x2a6ab0); box(x + w * 0.32, y - h + 10 * S, w * 0.12, 16 * S, 0x8ac8e8);
      g.fillStyle(MILK, 1).fillRoundedRect(x - w / 2 + 20 * S, y - h + 26 * S, (w * 0.75 - 40 * S) * fill, 6 * S, 3 * S);
      for (const wx of [x - w / 2 + 26 * S, x - w / 2 + 56 * S, x + w * 0.1, x + w * 0.4]) { g.fillStyle(K, 1).fillCircle(wx, y - 8 * S, 12 * S); g.fillStyle(0x8a8a9a, 1).fillCircle(wx, y - 8 * S, 5 * S); } }
  }
  winCell(rr, row) { return this.winLines.some(w => rr < w.n && SLOT.LINES[w.line][rr] === row); }
}

// ---- LOUISE (v3.106): the machine's hostess, standing beside the cabinet. A 1950s casino girl with a red bob and a
// sparkly gold dress. Three poses: 'idle' (hand on hip, presenting the machine), 'cheer' (both arms up), 'wink'
// (a thumbs-up and a wink). 44 x 96 art pixels, lit from the left, with a dark outline.
function makeLouiseTextures(scene) {
  if (scene.textures.exists('lou_idle')) return;
  const Wd = 44, Ht = 96, INK = 0x1a1020;
  const SK = [0xa8604a, 0xd88a6a, 0xf4b490, 0xffd8bc], HR = [0x5a0e1a, 0x9a1a2a, 0xd83a3a, 0xff7a6a], GD = [0x7a4a0a, 0xb8781a, 0xe8b030, 0xffe070, 0xfffad0], RD = [0x5a0e1a, 0x9a1a2a, 0xd83a2a, 0xff6a5a];
  const segD = (x, y, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy))); return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy); };
  const ARMS = {
    idle: [[[13, 30], [9, 41], [15, 47]], [[31, 30], [37, 39], [42, 35]]],
    cheer: [[[13, 30], [7, 18], [10, 5]], [[31, 30], [37, 18], [34, 5]]],
    wink: [[[13, 30], [9, 41], [15, 47]], [[31, 30], [38, 36], [33, 25]]],
    dance0: [[[13, 30], [6, 20], [9, 8]], [[31, 30], [37, 38], [29, 43]]],      // (v3.145) she dances: one arm up, one on her hip...
    dance1: [[[13, 30], [7, 38], [15, 43]], [[31, 30], [38, 20], [35, 8]]]      // ...and swap
  };
  for (const pose of ['idle', 'cheer', 'wink', 'dance0', 'dance1']) pixTex(scene, 'lou_' + pose, Wd, Ht, put => {
    const g = []; for (let y = 0; y < Ht; y++) g.push(Array(Wd).fill(null));
    const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < Wd && y < Ht) g[y][x] = c; };
    const sh = (R, v, x, y) => { const f = Math.max(0, Math.min(R.length - 1, v * (R.length - 1))), i = Math.floor(f); return R[Math.min(R.length - 1, i + ((f - i) * 16 > bay(x, y) ? 1 : 0))]; };
    const rnd = rng(31);
    for (let y = 0; y < Ht; y++) for (let x = 0; x < Wd; x++) {
      const X = x + 0.5, Y = y + 0.5;
      // legs and shoes
      for (const lx of [19, 25]) { if (Math.abs(X - lx) < 1.8 && Y > 70 && Y < 89) set(x, y, sh(SK, 0.7 - (X - lx + 2) * 0.05, x, y)); if (Math.abs(X - lx - 0.5) < 2.6 && Y >= 89 && Y < 93) set(x, y, Y < 90 ? RD[3] : RD[2]); }
      // the dress: bodice to a nipped waist, then a flared skirt to the knee; gold, sparkling
      const hw = Y < 28 ? -1 : Y < 42 ? 9.5 - (Y - 28) * 0.18 : Y < 74 ? 7 + (Y - 42) * 0.25 : -1;
      if (hw > 0 && Math.abs(X - 22) < hw) { let c = sh(GD, 0.72 - (X - 22) / hw * 0.3 - (Y > 42 ? Math.abs(Math.sin((X - 22) * 0.9 + Y * 0.05)) * 0.25 : 0), x, y); if (rnd() < 0.05) c = GD[4]; if (Y > 41 && Y < 44) c = Y < 42.5 ? RD[3] : RD[2]; if (Y > 72) c = GD[1]; set(x, y, c); }
      // the neck and the face
      if (Math.abs(X - 23) < 2.5 && Y > 22 && Y < 29) set(x, y, sh(SK, 0.55, x, y));
      if (Math.hypot((X - 23) / 7, (Y - 16) / 8) <= 1) set(x, y, sh(SK, 0.78 - (X - 18) * 0.03 - (Y - 10) * 0.01, x, y));
      // the hair: a glossy red bob with a curl over the brow
      const hair = (Math.hypot((X - 22) / 10.5, (Y - 13) / 10) <= 1 && (Y < 11.5 || X < 16.5 || X > 29.5 || Y < 9 + Math.abs(X - 26) * 0.25)) || (Y > 19 && Y < 25 && (Math.abs(X - 13.5) < 3 || Math.abs(X - 31.5) < 2.5));
      if (hair) set(x, y, Math.hypot(X - 17, Y - 7) < 2.2 ? HR[3] : sh(HR, 0.75 - (X - 12) * 0.03 - (Y - 3) * 0.015, x, y));
    }
    // the arms, in the pose
    for (const A of ARMS[pose]) for (let y = 0; y < Ht; y++) for (let x = 0; x < Wd; x++) {
      const d = Math.min(segD(x + 0.5, y + 0.5, A[0], A[1]), segD(x + 0.5, y + 0.5, A[1], A[2]));
      if (d < 1.7) set(x, y, sh(SK, 0.72 - d * 0.12, x, y));
      if (Math.hypot(x + 0.5 - A[2][0], y + 0.5 - A[2][1]) < 2.3) set(x, y, SK[2]);
      if (d < 2.4 && segD(x + 0.5, y + 0.5, A[0], A[1]) < 2.4 && Math.hypot(x + 0.5 - A[0][0], y + 0.5 - A[0][1]) < 4) set(x, y, GD[2]);   // the dress's little sleeve
    }
    // the face: eyes (or a wink), lashes, blush, red lips, a gold earring
    set(19, 15, INK); set(19, 16, INK); set(18, 14, INK);
    if (pose === 'wink') { set(26, 16, INK); set(27, 16, INK); set(25, 16, INK); } else { set(26, 15, INK); set(26, 16, INK); set(27, 14, INK); }
    set(18, 19, 0xff8a8a); set(28, 19, 0xff8a8a);
    for (const [x, y] of [[22, 21], [23, 21], [24, 21]]) set(x, y, RD[2]); if (pose === 'cheer') { set(22, 22, RD[1]); set(23, 22, 0x5a0e1a); set(24, 22, RD[1]); }
    set(15, 20, GD[3]); set(15, 21, GD[2]);
    // ink outline round the lot, then put it down
    for (let y = 0; y < Ht; y++) for (let x = 0; x < Wd; x++) {
      if (g[y][x] != null) { put(x, y, g[y][x]); continue; }
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g[y + dy] && g[y + dy][x + dx] != null)) put(x, y, INK);
    }
  });
}
