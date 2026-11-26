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
const FM_RAINBOW = [0xff4a6a, 0xff9a2a, 0xffe040, 0x7dff8a, 0x2ad8e8, 0x6a8aff, 0xc86aff, 0xff6ad0];
const FM = { red: [0x3a0810, 0x5a0e1a, 0x8a1a2a, 0xb83040, 0xe05a5a], gold: [0x5a3a0a, 0x8a5a12, 0xc8902a, 0xffd23f, 0xfff0a0], chrome: [0x3a3448, 0x6a7088, 0x9aa4b8, 0xc8ccd8, 0xf4f8ff] };
const FM_LAMP = { C: [0x2a2440, 0x6a5aa0], FREE: [0x0e3a44, 0x2ad8e8], SUPER: [0x0e3a44, 0x7af0ff], RAT: [0x4a1a08, 0xff8a2a], RESPIN: [0x4a3a08, 0xffd23f], JACKPOT: [0x5a3a0a, 0xfff0a0] };
const FM_SHORT = { FREE: 'FREE', SUPER: 'SUPER', RAT: 'RAT', RESPIN: 'COINS', JACKPOT: 'JACKPOT' };

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
    Sound.init(); Sound.music(null);
    const sv = this.registry.get('slot_' + this.from) || {};
    this.sk = sv.sk || 'mature'; this.betI = sv.betI !== undefined ? sv.betI : 1; this.pos = sv.pos !== undefined ? sv.pos : -1; this.dispPos = this.pos;
    this.carry = 0; this.going = false; this.ph = 'idle'; this.t = 0; this.free = 0; this.lastWin = 0; this.winLines = []; this.coins = []; this.sparks = []; this.flyers = []; this.banner = null;
    this.shownBal = this.bal(); this.press = {}; this.R = [0, 1, 2, 3, 4].map(() => ({ pos: Math.floor(Math.random() * 30), stop: null, v: 0, ant: false })); this.sticky = [];
    this.bg = this.add.graphics().setDepth(0); this.cab = this.add.graphics().setDepth(1);
    this.sym = this.R.map(() => [0, 1, 2, 3, 4].map(() => this.add.image(0, 0, 'fm_wedge').setDepth(2)));
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
    this.input.on('pointerdown', p => { const hit = [...(this.boxes || []), ...(this.oBoxes || [])].reverse().find(q => q.on() && p.x >= q.x && p.x <= q.x + q.w && p.y >= q.y && p.y <= q.y + q.h); if (hit) hit.fn(); });
    this.build();
    this.scale.on('resize', this.build, this);
    this.events.once('shutdown', () => { this.scale.off('resize', this.build, this); this.saveTrail(); });
    this.say(this.from === 'camp' ? 'LOUISE: WELCOME TO THE MOON BAR, CHRIS!' : 'LOUISE: SPIN ME, CHEF!');
  }
  say(m, col) { this.msg = m; this.msgCol = col || '#ff5a3a'; this.msgT0 = this.t; if (this.msgT) this.msgT.setText(m).setColor(this.msgCol); }
  // ---------------------------------------------------------------- layout: one cabinet, in art pixels (z screen px each)
  geom() {
    const W = this.scale.width, H = this.scale.height, CHa = 192, CWa = 300;
    let z = Math.min((H - 4) / CHa, (W - 8) / CWa); z = z >= 2 ? Math.floor(z) : z >= 1.5 ? 1.5 : Math.max(1, Math.floor(z * 4) / 4);
    const ox = Math.round((W - CWa * z) / 2), oy = Math.round((H - CHa * z) / 2);
    const A = (x, y) => ({ x: ox + x * z, y: oy + y * z });
    const zi = z, cw = 28 * z, chh = 24 * z, rw = 5 * cw + 4 * 3 * z, rh = 3 * chh, rx = ox + (CWa / 2) * z - rw / 2, ry = oy + 46 * z;
    return { W, H, z, zi, CWa, CHa, ox, oy, A, cw, chh, rw, rh, rx, ry, gap: 3 * z };
  }
  cell(r, k) { const G = this.geom(); return { x: G.rx + r * (G.cw + G.gap) + G.cw / 2, y: G.ry + k * G.chh + G.chh / 2 }; }
  // the deck's buttons: [id, x, w (art px), label, controller hint]
  deck() { return [['down', 18, 46, 'BET -', 'LB'], ['up', 70, 46, 'BET +', 'RB'], ['take', 122, 70, 'TAKE', 'X'], ['spin', 198, 84, 'SPIN', 'A']]; }
  build() {
    const G = this.geom(), z = G.z, f = (s, c, o) => Object.assign({ fontFamily: PIXEL, fontSize: Math.round(s * z) + 'px', color: c, stroke: '#1a1020', strokeThickness: Math.max(2, Math.round(z * 1.2)) }, o || {});
    this.ui.removeAll(true); this.boxes = []; this.payIm.forEach(im => im.destroy()); this.payIm = [];
    // deck buttons
    this.btnT = {};
    for (const [id, x, w, , hint] of this.deck()) {
      const p = G.A(x, 156), B = { id, x: p.x, y: p.y, w: w * z, h: 30 * z, on: () => true, fn: () => this.act(id) }; this.boxes.push(B);
      this.btnT[id] = [this.add.text(p.x + w * z / 2, p.y + 12 * z, '', f(id === 'spin' ? 5.5 : 4, '#ffffff')).setOrigin(0.5), this.add.text(p.x + w * z / 2, p.y + 24 * z, hint, f(3, '#c8ccd8', { strokeThickness: 2 })).setOrigin(0.5)];
      this.ui.add(this.btnT[id]);
    }
    // the left glass (strength: tap it, or Y), the exit plate
    const lg = G.A(8, 46); this.boxes.push({ x: lg.x, y: lg.y, w: 52 * z, h: 72 * z, on: () => true, fn: () => this.act('strength') });
    const ex = this.add.text(8, 8, 'EXIT  (B)', f(3.6, '#ffffff', { backgroundColor: '#2a1a2a', padding: { x: 6, y: 4 } })).setDepth(4); this.ui.add(ex);
    this.boxes.push({ x: 8, y: 8, w: ex.width, h: ex.height, on: () => true, fn: () => this.act('back') });
    // texts: the title, the strength, the meters, the LED ticker, the trail lamps, the pay table
    this.titleT = this.add.text(G.A(150, 7).x, G.A(150, 7).y, 'RIDIC LOUISE', f(6, '#ffd23f', { stroke: '#7a1a1a', strokeThickness: Math.round(z * 1.6) })).setOrigin(0.5); this.ui.add(this.titleT);
    this.strT = this.add.text(G.A(34, 52).x, G.A(34, 52).y, '', f(3.2, '#ffffff', { align: 'center' })).setOrigin(0.5, 0); this.ui.add(this.strT);
    this.strH = this.add.text(G.A(34, 110).x, G.A(34, 110).y, 'CHANGE (Y)', f(2.8, '#c8ccd8', { strokeThickness: 2 })).setOrigin(0.5); this.ui.add(this.strH);
    this.metT = ['CREDIT', 'BET', 'WIN'].map((lab, i) => { const p = G.A(30 + i * 90, 133); const L = this.add.text(p.x, p.y, lab, f(2.8, '#c8ccd8', { strokeThickness: 2 })).setOrigin(0, 0.5), V = this.add.text(p.x + 68 * z, p.y, '', f(5, '#ff4a2a', { stroke: '#1a0404' })).setOrigin(1, 0.5); this.ui.add([L, V]); return V; });
    this.msgT = this.add.text(G.A(150, 124).x, G.A(150, 124).y, this.msg || '', f(3.4, this.msgCol || '#ff5a3a', { stroke: '#1a0404' })).setOrigin(0.5); this.ui.add(this.msgT);
    const n = SLOT.STRENGTHS[this.sk].trail.length;
    this.lampT = SLOT.STRENGTHS[this.sk].trail.map(() => { const t = this.add.text(0, 0, '', f(2.9, '#ffffff', { strokeThickness: 2 })).setOrigin(0.5); this.ui.add(t); return t; });
    // (v3.111) the MAX CHEESE GRATER EDITION sticker, slapped on the corner of the marquee, and a neon sign on the wall
    { const p = G.A(52, 8), st = this.add.text(p.x, p.y, 'MAX CHEESE\nGRATER EDITION!', f(3.1, '#1a1020', { align: 'center', stroke: '#fff6c0', strokeThickness: Math.max(1, Math.round(z * 0.8)), backgroundColor: '#ffd23f', padding: { x: Math.round(2 * z), y: Math.round(0.5 * z) }, lineSpacing: -Math.round(z * 0.6) })).setOrigin(0.5).setRotation(-0.08);
      this.ui.add(st); this.sticker = st; }
    this.neon = [];
    { const right = G.W - (G.ox + G.CWa * z); if (right > 50) { const nx = G.W - right / 2, n = this.add.text(nx, G.oy + 46 * z, 'GRATE\nWINS', f(Math.min(6, right / z / 8), '#ff6ad0', { align: 'center', stroke: '#ffd0f0', strokeThickness: Math.max(1, Math.round(z * 0.6)) })).setOrigin(0.5).setShadow(0, 0, '#ff2aa0', 10 * z, true, true); this.ui.add(n); this.neon.push(n); } }
    { const p = G.A(G.CWa - 34, 51); this.ui.add(this.add.text(p.x, p.y, 'FIVE IN A ROW', f(2.6, '#ffd23f', { strokeThickness: 2 })).setOrigin(0.5)); }
    this.payT = [];
    ['wheel', 'heart', 'power', 'plate'].forEach((k, i) => { const p = G.A(254, 56 + i * 15); this.payIm.push(this.add.image(p.x, p.y + 1 * z, 'fm_' + k).setScale(z * 0.45).setDepth(4)); const t = this.add.text(p.x + 8 * z, p.y + z, '', f(3, '#ffffff', { strokeThickness: 2 })).setOrigin(0, 0.5); this.ui.add(t); this.payT.push([k, t]); });
    this.refresh();
  }
  refresh() {
    if (!this.btnT) return;
    const live = this.live(), lab = { down: 'BET -', up: 'BET +', take: this.ctxLabel(), spin: this.ph === 'idle' ? (this.free > 0 ? 'FREE ' + this.free : 'SPIN') : this.ph === 'show' ? 'SKIP' : '...' };
    for (const id in this.btnT) this.btnT[id][0].setText(lab[id]).setAlpha(live[id] ? 1 : 0.35);
    const S = SLOT.STRENGTHS[this.sk]; this.strT.setText('CHEESE\nSTRENGTH\n\n' + S.name.replace(' ', '\n')).setColor('#' + S.col.toString(16).padStart(6, '0'));
    this.strH.setAlpha(this.canSetup() ? 1 : 0.3);
    this.payT.forEach(([k, t]) => t.setText(String(Math.round(SLOT.PAYS[k][2] / 10 * SLOT.TUNE[this.sk].line * this.bet()))));
  }
  ctxLabel() { return this.pos >= 0 ? 'TAKE ' + Math.max(1, Math.round(SLOT.valAt(this.sk, this.pos) * this.bet())) : Shop.megaLeft() > 0 && this.free <= 0 ? 'MEGA x' + Shop.megaLeft() : 'TAKE'; }
  live() { const idle = this.ph === 'idle'; return { down: this.canSetup(), up: this.canSetup(), take: idle && (this.pos >= 0 || (Shop.megaLeft() > 0 && this.free <= 0)), spin: idle || this.ph === 'show' }; }
  canSetup() { return this.ph === 'idle' && this.pos < 0 && this.free <= 0; }
  stepName(p) { const s = SLOT.STRENGTHS[this.sk].trail[p]; return s === 'C' ? String(Math.max(1, Math.round(SLOT.TUNE[this.sk].val[p] * this.bet()))) : FM_SHORT[s]; }
  // ---------------------------------------------------------------- the four buttons (and Y / B)
  act(id) {
    if (!id || this.going) return;
    this.press[id] = 0.15;
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
    if (freeSpin) this.free--; else this.addBal(-bet);
    this.lastWin = 0; this.winLines = []; this.res = SLOT.play(this.sk, Math.random, this.pos);
    this.startReels(this.res.stops); this.ph = 'spin'; this.say(freeSpin ? 'FREE SPIN - ' + this.free + ' LEFT' : 'GOOD LUCK!', '#ff5a3a'); Sound.sfx('clang'); this.refresh();
    if (Math.random() < 0.25) this.louise('wink', 0.9);
  }
  startReels(stops) {
    const res = this.res, starsBy = i => res && res.grid ? res.grid.slice(0, i).filter(c => c[1] === SLOT.STAR).length : 0, top = SLOT.STRENGTHS[this.sk].trail.length - 1;
    let t = 0.45;
    this.R.forEach((R, i) => {
      const lead = starsBy(i), ant = res && res.grid && i >= 2 && (lead >= 2 || (this.pos >= 0 && this.pos + lead >= top - 1 && lead >= 1));
      t += ant ? 0.9 : 0.2; R.v = 22 + i * 2; R.stop = { at: t, to: stops[i], go: false }; R.ant = ant;
    });
    this.spinT = 0;
  }
  reelsMoving() { return this.R.some(R => R.stop); }
  onReelStop(i) {
    Sound.sfx('clunk');
    const g = this.res && this.res.grid; if (!g) return;
    if (g[i][1] === SLOT.STAR) { Sound.sfx('chime'); const c = this.cell(i, 1); this.flyers.push({ x: c.x, y: c.y, t: 0 }); this.burstAt(c.x, c.y, 0xffd23f, 10); }
    if (this.R[i + 1] && this.R[i + 1].ant && this.R[i + 1].stop) { Sound.sfx('reveal'); this.cameras.main.shake(120, 0.003); }
  }
  settle() {
    const r = this.res, bet = this.bet();
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
    if (tier) { this.louise('cheer', this.count.dur + 0.6, ['THAT\'S RIDIC!', 'OOH, CHRIS!', 'WHAT A SPIN!'][Math.floor(Math.random() * 3)]); this.bigBanner(tier[1], tier[2], this.count.dur); this.cameras.main.shake(400, 0.008); Sound.sfx('power'); this.time.delayedCall(300, () => Sound.sfx('achieve')); this.fountain(tier[0] >= 50 ? 90 : tier[0] >= 25 ? 60 : 36); }
    else if (x >= 2) { this.fountain(8 + Math.round(x * 2)); this.louise('wink', 1); }
    this.refresh();
  }
  bigBanner(text, col, dur) {
    if (this.banner) this.banner.t.destroy();
    const G = this.geom(), t = this.add.text(G.rx + G.rw / 2, G.ry + G.rh / 2, text, { fontFamily: PIXEL, fontSize: Math.round(9 * G.z) + 'px', color: '#' + col.toString(16).padStart(6, '0'), stroke: '#1a1020', strokeThickness: Math.round(G.z * 2.5) }).setOrigin(0.5).setDepth(8).setScale(0.1);
    this.banner = { t, life: dur + 1, max: dur + 1 };
  }
  fountain(n) { const G = this.geom(); for (let k = 0; k < n; k++) this.coins.push({ x: G.ox + 150 * G.z + (Math.random() - 0.5) * 60, y: G.oy + 150 * G.z, vx: (Math.random() - 0.5) * 420, vy: -260 - Math.random() * 420, r: Math.random() * 6, d: Math.random() < 0.5 }); }
  burstAt(x, y, col, n) { for (let k = 0; k < n; k++) { const a = Math.random() * 6.28, s = 60 + Math.random() * 160; this.sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5 + Math.random() * 0.4, col }); } }
  jackpot() { this.louise('cheer', 4, 'JACKPOT! THAT IS TOTALLY RIDIC!'); this.bigBanner('JACKPOT!!!', 0xffd23f, 3.5); this.cameras.main.flash(500, 255, 240, 150); this.cameras.main.shake(900, 0.014); this.fountain(140); Sound.sfx('achieve'); this.time.delayedCall(400, () => Sound.sfx('power')); this.time.delayedCall(900, () => Sound.sfx('achieve')); }
  // ---------------------------------------------------------------- TAKE: cash, or a bonus game
  takeStep() {
    const f = SLOT.take(this.sk, this.pos), bet = this.bet(); this.pos = -1; this.dispPos = -1; this.saveTrail();
    if (typeof Ach !== 'undefined') Ach.unlock('fruity');
    const w = f.x * bet; this.lastWin = this.addBal(w); this.say('BANKED ' + Math.round(w) + ' ' + this.unit() + '!', '#7dff8a'); Sound.sfx('power'); this.countWin(w, f.x);
  }
  playFeat(f) {
    if (typeof Ach !== 'undefined') Ach.unlock('fruity');
    this.feat = f;
    if (f.kind === 'free' || f.kind === 'super') this.freeStart(f); else if (f.kind === 'rat') this.ratStart(f); else this.respinStart(f);
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
    for (const k in this.press) this.press[k] = Math.max(0, this.press[k] - dt);
    if (this.spinT !== undefined) this.spinT += dt;
    for (let i = 0; i < 5; i++) {
      const R = this.R[i], S = R.stop; if (!S) continue;
      if (!S.go) { R.pos -= R.v * (R.ant && this.spinT > S.at - 0.9 ? 0.55 : 1) * dt; if (this.spinT >= S.at) { const n = SLOT.STRIPS[this.sk][i].length; S.go = true; S.from = R.pos; S.end = S.to + n * Math.floor((R.pos - 3 - S.to) / n); S.u = 0; } }
      else { S.u += dt / 0.42; const u = Math.min(1, S.u), c1 = 1.6, e = 1 + (c1 + 1) * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); R.pos = S.from + (S.end - S.from) * e; if (u >= 1) { R.pos = S.end; R.stop = null; this.onReelStop(i); } }
    }
    if (this.ph === 'spin' && !this.reelsMoving()) this.settle();
    if (this.ph === 'freespin' && !this.reelsMoving()) this.freeSettle();
    if (this.count) { const C = this.count; C.t += dt; const u = Math.min(1, C.t / C.dur); C.v = C.to * (1 - Math.pow(1 - u, 2)); if (u >= 1) { this.count = null; if (this.ph === 'show') this.ph = 'idle'; this.refresh(); if (this.free > 0) this.time.delayedCall(400, () => { if (this.ph === 'idle' && this.free > 0) this.spin(); }); } }
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
    const left = G.ox, right = W - (G.ox + G.CWa * z);
    // the next machine along (right of ours), lights chasing
    if (right > 40 * z * 0.6) {
      const mw = Math.min(56 * z, right - 10 * P), mx = G.ox + G.CWa * z + 8 * P + Math.max(0, (right - 8 * P - mw) / 2), my = G.oy + 70 * z, mh = fy - my + 6 * z;
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
    for (const [x0, x1] of [[0, G.ox], [G.ox + G.CWa * z, W]]) {
      if (x1 - x0 < 20) continue; const n = Math.max(2, Math.floor((x1 - x0) / (12 * z)));
      for (let k = 0; k < n; k++) { const x = x0 + (k + 0.5) * (x1 - x0) / n, sag = Math.sin(Math.PI * (k + 0.5) / n) * 8 * z, y = G.oy + 2 * z + sag, sw = Math.sin(t * 2 + k) * 1.5 * z;
        bg.fillStyle([0xffe040, 0xff6ad0, 0x2ad8e8, 0xff9a2a, 0x7dff8a][k % 5], 1).fillTriangle(x - 4 * z, y, x + 4 * z, y, x + sw, y + 9 * z); }
      bg.lineStyle(P, 0xf4ecd8, 0.8); bg.beginPath(); for (let k = 0; k <= 12; k++) { const x = x0 + (x1 - x0) * k / 12, y = G.oy + 2 * z + Math.sin(Math.PI * k / 12) * 8 * z; if (k) bg.lineTo(x, y); else bg.moveTo(x, y); } bg.strokePath();
    }
    if (this.sticker) this.sticker.setScale(1 + 0.06 * Math.max(0, Math.sin(t * 3))).setRotation(-0.08 + Math.sin(t * 1.3) * 0.03);
    if (this.neon) { this.neon.forEach((n, i) => n.setAlpha(Math.random() < 0.015 ? 0.35 : (hot ? 0.85 + 0.15 * Math.sin(t * 12 + i) : 1))); }
  }
  draw(dt) {
    const G = this.geom(), { W, H, z, A, rx, ry, rw, rh, cw, chh, gap } = G, t = this.t, g = this.cab;
    const r = (x, y, w, h, col, a) => g.fillStyle(col, a === undefined ? 1 : a).fillRect(G.ox + x * z, G.oy + y * z, w * z, h * z);
    const hot = this.count || this.ph === 'free' || this.ph === 'freespin' || this.ph === 'respin';
    // ---- the bar behind: dark panelling, a warm wash on the floor
    this.drawBar(G, t, hot);
    // ---- the cabinet
    g.clear();
    r(-2, -2, G.CWa + 4, G.CHa + 4, FM_INK);
    r(0, 0, G.CWa, G.CHa, FM.red[2]); r(0, 0, 3, G.CHa, FM.red[3]); r(G.CWa - 3, 0, 3, G.CHa, FM.red[1]);   // red body, lit from the left
    for (let y = 0; y < G.CHa; y += 2) r(3, y, G.CWa - 6, 1, FM.red[1], 0.18);                                // a fine grain
    // the topper: gold marquee with the name, chasing bulbs all round
    r(4, 0, G.CWa - 8, 14, FM.gold[2]); r(4, 0, G.CWa - 8, 2, FM.gold[4]); r(4, 12, G.CWa - 8, 2, FM.gold[0]);
    const nb = Math.floor((G.CWa - 12) / 7);
    for (let k = 0; k < nb; k++) { const on = hot ? (Math.floor(t * 16) + k) % 2 === 0 : (Math.floor(t * 5) + k) % 4 === 0; const rc = FM_RAINBOW[(k + Math.floor(t * (hot ? 12 : 4))) % FM_RAINBOW.length]; r(7 + k * 7, 3, 3, 3, on ? 0xffffff : rc); r(7 + k * 7, 9, 3, 2, on ? rc : FM.gold[0]); }
    // the TRAIL GLASS: a dark glass panel with the lamps in a row, a chrome frame
    r(6, 16, G.CWa - 12, 26, FM.chrome[3]); r(7, 17, G.CWa - 14, 24, FM_INK); r(8, 18, G.CWa - 16, 22, 0x120a1c);
    const T = SLOT.STRENGTHS[this.sk].trail, n = T.length, lw = (G.CWa - 22) / n;
    for (let p = 0; p < n; p++) {
      const s = T[p], C = FM_LAMP[s === 'C' ? 'C' : s], x = 11 + p * lw, at = p === this.dispPos, lit = p <= this.dispPos;
      const col = at ? (Math.floor(t * 8) % 2 ? 0xffffff : C[1]) : lit ? C[1] : C[0];
      r(x, 21, lw - 2, 15, FM_INK); r(x + 0.5, 21.5, lw - 3, 14, col); if (lit || at) r(x + 1, 22, lw - 4, 2, 0xffffff, 0.45);
      if (s === 'JACKPOT') for (let k = 0; k < 3; k++) r(x + 1 + k * (lw - 4) / 3, 36.5, 2, 1.5, (Math.floor(t * 9) + k) % 2 ? 0xfff6c0 : FM.gold[1]);
      const L = this.lampT[p]; if (L) { const q = A(x + (lw - 2) / 2, 28.5); L.setPosition(q.x, q.y).setText(this.stepName(p)).setColor(lit || at ? '#1a1020' : '#c8c0e0').setStroke(lit || at ? '#ffffff' : '#1a1020', 2); }
    }
    if (this.dispPos >= 0) { const x = 11 + this.dispPos * lw + (lw - 2) / 2; r(x - 2, 38.5, 4, 2, 0xffd23f); }        // a pointer under your lamp
    // the side glasses: strength (left), the pay table (right)
    for (const [x0, w0] of [[8, 52], [G.CWa - 60, 52]]) { r(x0, 46, w0, 72, FM.chrome[2]); r(x0 + 1, 47, w0 - 2, 70, FM_INK); r(x0 + 2, 48, w0 - 4, 68, 0x1c1030); }
    { const S = SLOT.STRENGTHS[this.sk], lvl = { mild: 1, mature: 2, extra: 3 }[this.sk]; for (let k = 0; k < 3; k++) r(20 + k * 10, 94, 8, 6, k < lvl ? S.col : 0x2a2440); }
    r(G.CWa - 58, 48, 48, 6, 0x3a2a4a); 
    // the reel window: chrome surround, the drums, curved shading, anticipation flashes, the centre line marks
    g.fillStyle(FM.chrome[3], 1).fillRect(rx - 4 * z, ry - 4 * z, rw + 8 * z, rh + 8 * z); g.fillStyle(FM_INK, 1).fillRect(rx - 2 * z, ry - 2 * z, rw + 4 * z, rh + 4 * z);
    for (let i = 0; i < 5; i++) { const x = rx + i * (cw + gap), R = this.R[i]; g.fillStyle(R.ant && R.stop ? (Math.floor(t * 10) % 2 ? 0xfff0b0 : 0xf4ecd8) : 0xf4ecd8, 1).fillRect(x, ry, cw, rh); for (let b = 0; b < 6; b++) { g.fillStyle(0x000000, 0.3 - b * 0.05).fillRect(x, ry + b * z, cw, z); g.fillStyle(0x000000, 0.3 - b * 0.05).fillRect(x, ry + rh - (b + 1) * z, cw, z); } }
    // the LED ticker and the three meters
    r(20, 119, G.CWa - 40, 10, FM.chrome[1]); r(21, 120, G.CWa - 42, 8, 0x140404);
    for (let k = 0; k < 3; k++) { r(26 + k * 90, 131, 76, 11, FM.chrome[1]); r(27 + k * 90, 132, 74, 9, 0x140404); }
    // the deck: a sloped panel and four arcade buttons
    r(4, 148, G.CWa - 8, 40, FM.red[1]); r(4, 148, G.CWa - 8, 2, FM.red[3]); r(4, 186, G.CWa - 8, 2, FM.red[0]);
    const live = this.live();
    for (const [id, x, w] of this.deck()) {
      const on = live[id], pr = this.press[id] > 0 ? 1.5 : 0, col = id === 'spin' ? [0x0e4a1a, 0x2aa04a, 0x7dff8a] : id === 'take' ? [0x4a2a04, 0xc8902a, 0xffe070] : [0x2a2440, 0x5a4a90, 0xa090e0];
      const glow = on && (id === 'spin' || (id === 'take')) ? 0.5 + 0.5 * Math.sin(t * 5) : 0;
      r(x - 1, 155, w + 2, 32, FM_INK); r(x, 156 + pr, w, 30 - pr, on ? col[1] : 0x2a2030); r(x, 156 + pr, w, 3, on ? col[2] : 0x3a3040); r(x, 183, w, 3, on ? col[0] : 0x1a1420);
      if (glow) r(x + 2, 159 + pr, w - 4, 1, 0xffffff, glow * 0.7);
      this.btnT[id][0].setY(G.oy + (168 + pr) * z); this.btnT[id][1].setY(G.oy + (180 + pr) * z);
    }
    // ---- Louise, beside the cabinet (as big as the gap allows; off if there's no room)
    { this.louT = Math.max(0, this.louT - dt); if (this.louT <= 0 && this.louPose !== 'idle') this.louPose = 'idle';
      const room = G.ox - 6, sc = Math.min(z, room / 46);
      if (sc < 1) this.lou.setVisible(false);
      else { const bob = this.louPose === 'cheer' ? Math.abs(Math.sin(t * 9)) * 3 * sc : Math.sin(t * 1.8) * 0.6 * sc; this.lou.setVisible(true).setTexture('lou_' + this.louPose).setScale(sc).setPosition(Math.round(G.ox / 2), Math.round(G.oy + 188 * z - bob)); } }
    // ---- the symbols on the reels
    const strips = SLOT.STRIPS[this.sk];
    this.R.forEach((R, i) => {
      const nn = strips[i].length, base = Math.floor(R.pos), cx = rx + i * (cw + gap) + cw / 2, blur = R.stop && !R.stop.go;
      this.sym[i].forEach((im, j) => {
        const idx = ((base + j - 1) % nn + nn) % nn, row = base + j - 1 - R.pos, y = ry + (row + 0.5) * chh;
        let key = strips[i][idx];
        if (!R.stop && this.res && this.res.grid && Math.abs(row - Math.round(row)) < 0.01 && row > -0.5 && row < 2.5) key = this.res.grid[i][Math.round(row)] || key;
        const wob = !R.stop && this.winLines.length && this.winCell(i, Math.round(row)) ? Math.sin(t * 14 + i) * 0.1 : 0, sy = z * (blur ? 1.25 : 1 + wob);
        im.setTexture('fm_' + key).setPosition(Math.round(cx), Math.round(y)).setScale(z * (1 + wob), sy).setAlpha(blur ? 0.7 : 1);
        const hh = 11 * sy, y0 = y - hh, y1 = y + hh, v0 = Math.max(y0, ry), v1 = Math.min(y1, ry + rh);
        if (v1 <= v0) { im.setVisible(false); return; }
        im.setVisible(true).setCrop(0, (v0 - y0) / sy, 22, (v1 - v0) / sy);
      });
    });
    this.stickyIm.forEach((im, k) => { const s = this.sticky[k]; if (!s || !(this.ph === 'free' || this.ph === 'freespin')) { im.setVisible(false); return; } const c = this.cell(s[0], s[1]); im.setVisible(true).setPosition(c.x, c.y).setScale(z * (1 + Math.sin(t * 6 + k) * 0.06)); });
    // ---- the win lines
    const fg = this.fg; fg.clear();
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
    // ---- effects: coins, sparks, stars flying to your lamp, the banner
    const fx = this.fx; fx.clear();
    for (const c of this.coins) { c.vy += 760 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.r += dt * 12; const w = (Math.abs(Math.cos(c.r)) * 3.5 + 1) * z; fx.fillStyle(FM_INK, 1).fillRect(c.x - w / 2 - z / 2, c.y - 2.5 * z, w + z, 5 * z); fx.fillStyle(c.d ? 0xffd23f : 0xffe070, 1).fillRect(c.x - w / 2, c.y - 2 * z, w, 4 * z); }
    this.coins = this.coins.filter(c => c.y < H + 20);
    for (const s of this.sparks) { s.life -= dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 200 * dt; fx.fillStyle(s.col, Math.max(0, s.life * 2)).fillRect(s.x - z, s.y - z, 2 * z, 2 * z); }
    this.sparks = this.sparks.filter(s => s.life > 0);
    for (const q of this.flyers) {
      q.t += dt * 1.8; const tgt = Math.max(0, Math.min(n - 1, this.dispPos + 1)), tp = A(11 + tgt * lw + (lw - 2) / 2, 28), u = Math.min(1, q.t), e = u * u * (3 - 2 * u), x = q.x + (tp.x - q.x) * e, y = q.y + (tp.y - q.y) * e - Math.sin(u * Math.PI) * 30 * z;
      if (!q.im) q.im = this.add.image(x, y, 'fm_star').setDepth(7.5);
      q.im.setPosition(x, y).setScale(z * (1 + Math.sin(u * Math.PI) * 0.6)).setRotation(u * 6); this.sparks.push({ x, y, vx: 0, vy: 0, life: 0.3, col: 0xffd23f });
      if (u >= 1) { q.im.destroy(); q.dead = true; this.burstAt(tp.x, tp.y, 0xffd23f, 14); }
    }
    this.flyers = this.flyers.filter(q => !q.dead);
    if (this.banner) { const B = this.banner; B.life -= dt; const age = B.max - B.life, s = age < 0.35 ? 0.1 + (age / 0.35) * 1.25 : 1.2 + Math.sin(age * 10) * 0.06; B.t.setScale(s).setRotation(Math.sin(age * 7) * 0.06).setAlpha(Math.min(1, B.life * 2)); if (B.life <= 0) { B.t.destroy(); this.banner = null; } }
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
    wink: [[[13, 30], [9, 41], [15, 47]], [[31, 30], [38, 36], [33, 25]]]
  };
  for (const pose of ['idle', 'cheer', 'wink']) pixTex(scene, 'lou_' + pose, Wd, Ht, put => {
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
