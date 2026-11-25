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
      counts: { wedge: [7, 7, 7, 7, 7], coin: [6, 6, 6, 6, 6], slow: [5, 5, 5, 5, 5], plate: [5, 5, 5, 5, 5], power: [3, 3, 3, 3, 3], heart: [2, 2, 2, 2, 2], wheel: [1, 1, 1, 1, 1], bessie: [0, 2, 2, 2, 0], star: [1, 1, 1, 1, 1] },
      trail: ['C', 'C', 'FREE', 'C', 'RAT', 'C', 'C', 'RESPIN', 'C', 'JACKPOT'], slip: 0.12, split: [0.7, 0.25],
      free: { spins: 8, mult: 1 }, rat: [1, 1, 2, 2, 3, 3, 4, 5, 8, 12], rats: 2, respin: { start: 6, p: 0.075, vals: [1, 1, 1, 2, 2, 3, 5], grand: 50 }
    },
    mature: {
      name: 'MATURE', col: 0xf0c030, desc: 'Balanced. A longer trail and bigger bonuses.',
      counts: { wedge: [8, 8, 8, 8, 8], coin: [7, 7, 7, 7, 7], slow: [6, 6, 6, 6, 6], plate: [5, 5, 5, 5, 5], power: [3, 3, 3, 3, 3], heart: [2, 2, 2, 2, 2], wheel: [1, 1, 1, 1, 1], bessie: [0, 2, 2, 2, 0], star: [1, 1, 1, 1, 1] },
      trail: ['C', 'C', 'FREE', 'C', 'C', 'RAT', 'C', 'C', 'RESPIN', 'C', 'FREE', 'C', 'JACKPOT'], slip: 0.15, split: [0.6, 0.35],
      free: { spins: 10, mult: 1 }, rat: [1, 2, 2, 3, 4, 5, 8, 10, 15, 25], rats: 2, respin: { start: 6, p: 0.07, vals: [1, 1, 2, 2, 3, 5, 10], grand: 200 }
    },
    extra: {
      name: 'EXTRA MATURE', col: 0xd87a1a, desc: 'Long dry spells. The trail slips back. Massive top end.',
      counts: { wedge: [9, 9, 9, 9, 9], coin: [8, 8, 8, 8, 8], slow: [7, 7, 7, 7, 7], plate: [6, 6, 6, 6, 6], power: [3, 3, 3, 3, 3], heart: [2, 2, 2, 2, 2], wheel: [1, 1, 1, 1, 1], bessie: [0, 1, 2, 1, 0], star: [1, 1, 1, 1, 1] },
      trail: ['C', 'C', 'C', 'FREE', 'C', 'C', 'RAT', 'C', 'C', 'RESPIN', 'C', 'C', 'C', 'SUPER', 'C', 'C', 'JACKPOT'], slip: 0.2, split: [0.5, 0.45],
      free: { spins: 10, mult: 1 }, super: { spins: 12, mult: 3 }, rat: [1, 2, 3, 5, 8, 10, 15, 25, 50, 100], rats: 3, respin: { start: 5, p: 0.065, vals: [1, 2, 2, 3, 5, 10, 25], grand: 1000 }
    }
  };
  // TUNE (written by tools/slotsim.js --write): line = multiplier on line wins; val = what each trail step is worth if
  // you TAKE it there (total-bet multiples), the last being the jackpot; fx = per step, the multiplier that makes that
  // step's bonus game worth its val on average. Each val is exactly what carrying on from that step is worth, so taking
  // is never a mistake: it's banking versus gambling, and the RTP is the same however you play.
  // @@TUNE@@
  const TUNE = {"mild":{"line":1.5206,"val":[1.497,3.966,7.068,10.581,14.36,18.314,22.38,26.52,30.698,35.191],"fx":[0,0,0.4583,0,1.05547,0,0,1.23029,0,0]},"mature":{"line":1.30059,"val":[2.274,6.571,12.666,20.362,29.48,39.864,51.374,63.885,77.286,91.479,106.377,121.874,138.929],"fx":[0,0,0.57635,0,0,1.59142,0,0,2.24023,0,4.84052,0,0]},"extra":{"line":1.23414,"val":[3.18,10.497,23.194,42.892,71.696,112.345,168.403,244.506,346.684,482.78,663.001,900.62,1212.904,1622.316,2158.095,2856.623,3833.642],"fx":[0,0,0,3.48238,0,0,3.08005,0,0,7.26242,0,0,0,30.49778,0,0,0]}};
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
  // TAKE the step you're on: cash, or play its bonus. Returns { kind, x (total-bet multiple), k (the bonus's scale), ...the bonus }
  function take(sk, step, rnd) {
    const T = STRENGTHS[sk], s = T.trail[step], U = TUNE[sk];
    if (s === 'C' || s === 'JACKPOT') return { kind: s === 'C' ? 'cash' : 'jackpot', x: U.val[step] || 0, step };
    const b = bonusRaw(sk, s, rnd), k = U.fx[step] || 1; b.k = k; b.x *= k; b.step = step; return b;
  }
  // one base-game spin plus what it does to the trail. pos: trail position before (-1 = not on it yet).
  // Each star ON THE CENTRE LINE moves you up a step; a spin with none may SLIP you back one (the strength's slip chance).
  // Reaching the top pays the JACKPOT there and then and sends you back to the start. Anything else waits to be TAKEN.
  function play(sk, rnd, pos) {
    const T = STRENGTHS[sk], { stops, grid } = spin(sk, rnd), wins = lineWins(grid), st = stars(grid), L = TUNE[sk].line, top = T.trail.length - 1;
    wins.forEach(w => { w.x *= L; });
    let x = wins.reduce((a, q) => a + q.x, 0), np = pos, feat = null, slipped = false;
    if (st > 0) np = Math.min(top, pos + st);
    else if (pos >= 0 && rnd() < T.slip) { np = pos - 1; slipped = true; }
    if (np === top) { feat = take(sk, top, rnd); np = -1; }
    return { stops, grid, wins, stars: st, x, pos: np, feat, slipped };
  }
  const valAt = (sk, pos) => pos >= 0 ? (TUNE[sk].val[pos] || 0) : 0;
  return { LINES, SYMS, PAYS, STRENGTHS, TUNE, STRIPS, WILD, STAR, spin, lineWins, stars, freeSpins, ratTrap, respins, bonusRaw, take, play, valAt };
})();
if (typeof module !== 'undefined') module.exports = SLOT;
