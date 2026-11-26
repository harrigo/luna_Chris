// ================================================================= THE CHEESE SLOT: the maths (v3.102)
// Pure numbers, no Phaser: the game plays it, and a simulator (tools/slotsim.js) plays it millions of times to tune it.
// A 5 x 3 video slot with 10 paylines, a wild (Bessie), a TRAIL star, and a UK-style FEATURE TRAIL you climb across spins.
// Three CHEESE STRENGTHS, all tuned to the same return (RTP ~95%) but with different VOLATILITY:
//   MILD           lots of small wins, a short trail that barely slips, modest bonuses
//   MATURE         in between
//   EXTRA MATURE   long dry spells, a long trail that slips back, huge top prizes
// Everything is in multiples of the TOTAL BET (10 lines, a tenth of the bet each). `scale` (per strength) is set by the
// simulator so the whole thing returns 95%: every payout constant is multiplied by it.
const SLOT = (() => {
  const LINES = [[1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [2, 2, 2, 2, 2], [0, 1, 2, 1, 0], [2, 1, 0, 1, 2], [0, 0, 1, 2, 2], [2, 2, 1, 0, 0], [1, 0, 0, 0, 1], [1, 2, 2, 2, 1], [1, 0, 1, 2, 1]];
  const SYMS = ['wedge', 'coin', 'slow', 'plate', 'power', 'heart', 'wheel', 'bessie', 'star'];
  const WILD = 'bessie', STAR = 'star';
  // line pays, in LINE-BET multiples, for 3 / 4 / 5 in a row from the left
  const PAYS = {
    wedge: [5, 10, 25], coin: [5, 12, 30], slow: [6, 15, 40], plate: [8, 20, 50],
    power: [10, 30, 100], heart: [15, 50, 200], wheel: [25, 100, 750], bessie: [25, 100, 750]
  };
  // symbol counts on each reel's strip (reels 1..5). Bessie only on reels 2-4. One star per reel at most in view.
  const STRENGTHS = {
    mild: {
      name: 'MILD', col: 0xffe070, desc: 'Small wins, often. A short trail that barely slips.',
      counts: { wedge: [7, 7, 7, 7, 7], coin: [6, 6, 6, 6, 6], slow: [5, 5, 5, 5, 5], plate: [5, 5, 5, 5, 5], power: [3, 3, 3, 3, 3], heart: [2, 2, 2, 2, 2], wheel: [1, 1, 1, 1, 1], bessie: [0, 2, 2, 2, 0], star: [1, 2, 1, 2, 1] },
      trail: ['C', 'C', 'FREE', 'C', 'RAT', 'C', 'FREE', 'C', 'RESPIN', 'C', 'C', 'JACKPOT'], slip: 0.08, split: [0.57, 0.33], jackK: 6,
      free: { spins: 8, mult: 1 }, rat: [1, 1, 2, 2, 3, 3, 4, 5, 8, 12], rats: 2, respin: { start: 6, p: 0.075, vals: [1, 1, 1, 2, 2, 3, 5], grand: 50 }
    },
    mature: {
      name: 'MATURE', col: 0xf0c030, desc: 'Balanced. A longer trail and bigger bonuses.',
      counts: { wedge: [8, 8, 8, 8, 8], coin: [7, 7, 7, 7, 7], slow: [6, 6, 6, 6, 6], plate: [5, 5, 5, 5, 5], power: [3, 3, 3, 3, 3], heart: [2, 2, 2, 2, 2], wheel: [1, 1, 1, 1, 1], bessie: [0, 2, 2, 2, 0], star: [1, 1, 2, 1, 1] },
      trail: ['C', 'C', 'FREE', 'C', 'C', 'RAT', 'C', 'FREE', 'C', 'RESPIN', 'C', 'RAT', 'C', 'FREE', 'C', 'JACKPOT'], slip: 0.1, split: [0.47, 0.43], jackK: 10,
      free: { spins: 10, mult: 1 }, rat: [1, 2, 2, 3, 4, 5, 8, 10, 15, 25], rats: 2, respin: { start: 6, p: 0.07, vals: [1, 1, 2, 2, 3, 5, 10], grand: 200 }
    },
    extra: {
      name: 'EXTRA MATURE', col: 0xd87a1a, desc: 'Long dry spells. The trail slips back. Massive top end.',
      counts: { wedge: [9, 9, 9, 9, 9], coin: [8, 8, 8, 8, 8], slow: [7, 7, 7, 7, 7], plate: [6, 6, 6, 6, 6], power: [3, 3, 3, 3, 3], heart: [2, 2, 2, 2, 2], wheel: [1, 1, 1, 1, 1], bessie: [0, 1, 2, 1, 0], star: [1, 1, 1, 1, 1] },
      trail: ['C', 'C', 'FREE', 'C', 'C', 'RAT', 'C', 'C', 'RESPIN', 'C', 'FREE', 'C', 'C', 'SUPER', 'C', 'C', 'JACKPOT'], slip: 0.15, split: [0.40, 0.50], jackK: 25,
      free: { spins: 10, mult: 1 }, super: { spins: 12, mult: 3 }, rat: [1, 2, 3, 5, 8, 10, 15, 25, 50, 100], rats: 3, respin: { start: 5, p: 0.065, vals: [1, 2, 2, 3, 5, 10, 25], grand: 1000 }
    }
  };
  // TUNE (written by tools/slotsim.js --write): line = multiplier on line wins; val = what each trail step is worth if
  // you TAKE it there (total-bet multiples), the last being the jackpot; fx = per step, the multiplier that makes that
  // step's bonus game worth its val on average. Each val is exactly what carrying on from that step is worth, so taking
  // is never a mistake: it's banking versus gambling, and the RTP is the same however you play.
  // @@TUNE@@
  const TUNE = {"mild":{"line":1.29298,"val":[1.468,3.383,3.492,4.986,4.75,6.138,5.658,6.97,6.256,7.504,9.35,11.577],"fx":[0,0,0.14472,0,0.16381,0,0.17319,0,0.1286,0,0,0]},"mature":{"line":1.04405,"val":[2.401,5.993,7.268,10.308,14.218,15.299,18.23,18.564,21.122,21.023,23.364,22.913,25.079,24.297,26.297,29.987],"fx":[0,0,0.15073,0,0,0.13724,0,0.17865,0,0.11837,0,0.16469,0,0.21215,0,0]},"extra":{"line":0.97772,"val":[3.59,10.722,14.542,21.922,32.806,39.752,50.231,64.184,73.541,86.384,94.048,105.24,119.899,128.665,140.949,156.691,177.127],"fx":[0,0,0.61566,0,0,0.14075,0,0,0.13875,0,0.78748,0,0,0.19736,0,0,0]}};
  // @@END@@
  // reel strips: the counts, spread out so stars and wilds never bunch (a star at most once in any 3-high window)
  function strips(sk) {
    const C = STRENGTHS[sk].counts, out = [];
    for (let r = 0; r < 5; r++) {
      const bag = []; for (const s of SYMS) for (let k = 0; k < (C[s] ? C[s][r] : 0); k++) bag.push(s);
      let seed = 1234 + r * 977 + sk.length * 31; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      for (let tries = 0; tries < 400; tries++) {
        for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
        const n = bag.length; let ok = true;
        for (let i = 0; i < n && ok; i++) if (bag[i] === STAR || bag[i] === WILD) for (const d of [1, 2]) if (bag[(i + d) % n] === bag[i]) ok = false;
        if (ok) break;
      }
      out.push(bag.slice());
    }
    return out;
  }
  const STRIPS = {}; for (const k of Object.keys(STRENGTHS)) STRIPS[k] = strips(k);

  // a spin: stop positions -> the 5 x 3 grid (grid[reel][row])
  function spin(sk, rnd, sticky) {
    const S = STRIPS[sk], stops = [], grid = [];
    for (let r = 0; r < 5; r++) { const n = S[r].length, p = Math.floor(rnd() * n); stops.push(p); grid.push([0, 1, 2].map(k => S[r][(p + k) % n])); }
    if (sticky) for (const [r, k] of sticky) grid[r][k] = WILD;     // free spins: Bessies that stay put
    return { stops, grid };
  }
  // the line wins on a grid: [{ line, sym, n, x (total-bet multiple, before scale) }]
  function lineWins(grid) {
    const wins = [];
    LINES.forEach((L, li) => {
      const syms = L.map((row, r) => grid[r][row]);
      let base = null; for (const s of syms) { if (s === STAR) break; if (s !== WILD) { base = s; break; } }
      if (base === null) base = syms[0] === WILD ? WILD : null;
      if (!base) return;
      let n = 0; for (const s of syms) { if (s === base || (s === WILD && base !== STAR)) n++; else break; }
      // an all-wild run that's longer than the paying symbol's run pays as wilds instead
      let nw = 0; for (const s of syms) { if (s === WILD) nw++; else break; }
      let best = n >= 3 && PAYS[base] ? PAYS[base][n - 3] : 0, bs = base, bn = n;
      if (nw >= 3 && PAYS[WILD][nw - 3] > best) { best = PAYS[WILD][nw - 3]; bs = WILD; bn = nw; }
      if (best > 0) wins.push({ line: li, sym: bs, n: bn, x: best / 10 });
    });
    return wins;
  }
  const stars = grid => grid.reduce((a, col) => a + (col[1] === STAR ? 1 : 0), 0);   // only a star ON THE CENTRE LINE moves the trail

  // ---- the bonuses (all return total-bet multiples before scale; rnd is a 0..1 random source)
  function freeSpins(sk, rnd, cfg) {
    const F = cfg || STRENGTHS[sk].free, sticky = []; let tot = 0, mult = F.mult, log = [];
    for (let i = 0; i < F.spins; i++) {
      const { grid, stops } = spin(sk, rnd, sticky);
      for (let r = 1; r < 4; r++) for (let k = 0; k < 3; k++) if (grid[r][k] === WILD && !sticky.some(q => q[0] === r && q[1] === k)) sticky.push([r, k]);
      const w = lineWins(grid).reduce((a, q) => a + q.x, 0);
      if (w > 0) tot += w * mult;
      log.push({ grid, stops, w, mult, sticky: sticky.map(q => q.slice()) });
    }
    return { x: tot, log };
  }
  function ratTrap(sk, rnd) {
    const T = STRENGTHS[sk], cards = T.rat.map(v => v).concat(Array(T.rats).fill(0));
    for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
    if (cards[0] === 0) { const j = cards.findIndex(c => c > 0); [cards[0], cards[j]] = [cards[j], cards[0]]; }   // (v3.111) the first pick is never the rat
    let tot = 0, picks = 0; for (const c of cards) { picks++; if (c === 0) break; tot += c; }
    return { x: tot, cards, picks };
  }
  function respins(sk, rnd) {
    const P = STRENGTHS[sk].respin, cells = Array(15).fill(0), val = () => P.vals[Math.floor(rnd() * P.vals.length)];
    let placed = 0; while (placed < P.start) { const i = Math.floor(rnd() * 15); if (!cells[i]) { cells[i] = val(); placed++; } }
    let left = 3, rounds = [];
    while (left > 0 && cells.some(c => !c)) {
      left--; const add = [];
      for (let i = 0; i < 15; i++) if (!cells[i] && rnd() < P.p) { cells[i] = val(); add.push(i); }
      if (add.length) left = 3;
      rounds.push(add);
    }
    const full = cells.every(c => c);
    return { x: cells.reduce((a, c) => a + c, 0) + (full ? P.grand : 0), cells, full, rounds };
  }
  // the trail: what a step pays (or plays). Returns total-bet multiple before scale.
  // a bonus game, raw (unscaled) - the sim measures these; the game scales them by fx[step]
  function bonusRaw(sk, kind, rnd) {
    const T = STRENGTHS[sk];
    if (kind === 'FREE') return Object.assign({ kind: 'free' }, freeSpins(sk, rnd));
    if (kind === 'SUPER') return Object.assign({ kind: 'super' }, freeSpins(sk, rnd, T.super));
    if (kind === 'RAT') return Object.assign({ kind: 'rat' }, ratTrap(sk, rnd));
    return Object.assign({ kind: 'respin' }, respins(sk, rnd));
  }
  // (v3.111) BONUS STEPS PLAY THEMSELVES: climbing the trail, you stop on the first bonus lamp you reach and its game
  // plays there and then (you stay on that lamp and climb on from it). Any lamp you're sitting on can be TAKEN as cash
  // (back to the start); the top pays the JACKPOT and sends you back to the start.
  const isBonus = s => s && s !== 'C' && s !== 'JACKPOT';
  // the bonus game at a step, scaled by that step's fx
  function bonusAt(sk, step, rnd) { const b = bonusRaw(sk, STRENGTHS[sk].trail[step], rnd), k = TUNE[sk].fx[step] || 1; b.k = k; b.x *= k; b.step = step; return b; }
  // TAKE the lamp you're on: its cash. Returns { kind, x (total-bet multiple), step }
  function take(sk, step) {
    const T = STRENGTHS[sk], U = TUNE[sk], top = T.trail.length - 1;
    return { kind: step === top ? 'jackpot' : 'cash', x: U.val[step] || 0, step };
  }
  // where k stars take you from pos: up k lamps, but stopping on the first bonus lamp on the way
  function climb(sk, pos, k) {
    const T = STRENGTHS[sk], top = T.trail.length - 1; let q = Math.min(top, pos + k);
    for (let b = pos + 1; b < q; b++) if (isBonus(T.trail[b])) { q = b; break; }
    return q;
  }
  // one base-game spin plus what it does to the trail. pos: trail position before (-1 = not on it yet).
  // Each star ON THE CENTRE LINE moves you up a lamp; a spin with none may SLIP you back one (the strength's slip chance).
  function play(sk, rnd, pos) {
    const T = STRENGTHS[sk], { stops, grid } = spin(sk, rnd), wins = lineWins(grid), st = stars(grid), L = TUNE[sk].line, top = T.trail.length - 1;
    wins.forEach(w => { w.x *= L; });
    let x = wins.reduce((a, q) => a + q.x, 0), np = pos, feat = null, slipped = false;
    if (st > 0) np = climb(sk, pos, st);
    else if (pos >= 0 && rnd() < T.slip) { np = pos - 1; slipped = true; }
    if (np === top) { feat = take(sk, top); np = -1; }
    else if (np !== pos && np >= 0 && st > 0 && isBonus(T.trail[np])) feat = bonusAt(sk, np, rnd);
    return { stops, grid, wins, stars: st, x, pos: np, feat, slipped };
  }
  const valAt = (sk, pos) => pos >= 0 ? (TUNE[sk].val[pos] || 0) : 0;
  return { LINES, SYMS, PAYS, STRENGTHS, TUNE, STRIPS, WILD, STAR, spin, lineWins, stars, freeSpins, ratTrap, respins, bonusRaw, bonusAt, take, play, climb, isBonus, valAt };
})();
if (typeof module !== 'undefined') module.exports = SLOT;
