// The cheese slot simulator + tuner (src/slotmath.js).
//   node tools/slotsim.js [spins]            report: RTP, hit rate, bonus frequency, biggest wins, for several ways of
//                                             playing the trail (when you COLLECT)
//   node tools/slotsim.js [spins] --write    TUNE first, then write the result into src/slotmath.js, then report
// Tuning, per cheese strength:
//   * line wins are scaled so they return split[0] (e.g. 60%)
//   * the trail is a small Markov chain (positions; each spin moves it up by the stars on the centre line, or maybe slips
//     it back one). Its bonuses' average values come from simulating each bonus; the chain is solved exactly for the
//     trail's average return per spin, which is scaled to split[1] (e.g. 35%)
//   * each CASH step is then worth h(step) - h(start), where h is the chain's relative value: exactly what carrying on is
//     worth, so collecting is never a mistake and the RTP comes out the same however you play the trail
const fs = require('fs'), path = require('path');
const FILE = path.join(__dirname, '../src/slotmath.js');
const N = +(process.argv[2] || 1000000), WRITE = process.argv.includes('--write');
let seed = 987654321; const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };
const load = () => { delete require.cache[require.resolve(FILE)]; return require(FILE); };

function tune(SLOT) {
  const out = {};
  for (const sk of Object.keys(SLOT.STRENGTHS)) {
    const T = SLOT.STRENGTHS[sk], Lr = T.trail.length, top = Lr - 1;
    SLOT.TUNE[sk] = { line: 1, val: [], fx: [] };
    // raw line RTP
    let lx = 0; for (let i = 0; i < N; i++) { const { grid } = SLOT.spin(sk, rnd); lx += SLOT.lineWins(grid).reduce((a, q) => a + q.x, 0); }
    const lineRaw = lx / N;
    // stars on the centre line per spin: each reel independently
    const pr = SLOT.STRIPS[sk].map(st => st.filter(q => q === SLOT.STAR).length / st.length);
    let dist = [1]; for (const p of pr) { const nd = Array(dist.length + 1).fill(0); dist.forEach((v, k) => { nd[k] += v * (1 - p); nd[k + 1] += v * p; }); dist = nd; }
    // (v3.111) each bonus game's raw average, and its weight (higher lamps pay a bit more)
    const ev = {}, M = 150000, w = T.trail.map((s, p) => 1 + 0.6 * p / top);
    for (const s of T.trail) if (SLOT.isBonus(s) && ev[s] === undefined) { let a = 0; for (let i = 0; i < M; i++) a += SLOT.bonusRaw(sk, s, rnd).x; ev[s] = a / M; }
    const evs = Object.values(ev), Jb = evs.reduce((a, b) => a + b, 0) / evs.length, Jraw = T.jackK * Jb;   // every bonus is worth the same on average (times its lamp's weight)
    // the chain, never taking: states -1..top-1 (index +1); stopping on a bonus lamp plays it; the top pays J and resets
    const S = Lr, idx = p => p + 1, P = [], Rw = [];
    for (let p = -1; p < top; p++) {
      const row = Array(S).fill(0); let rew = 0;
      dist.forEach((pk, k) => {
        if (k === 0) { if (p >= 0) { row[idx(p - 1)] += pk * T.slip; row[idx(p)] += pk * (1 - T.slip); } else row[0] += pk; return; }
        const q = SLOT.climb(sk, p, k);
        if (q === top) { rew += pk * Jraw; row[0] += pk; }
        else { if (SLOT.isBonus(T.trail[q])) rew += pk * Jb * w[q]; row[idx(q)] += pk; }
      });
      P.push(row); Rw.push(rew);
    }
    const solve = () => { let h = Array(S).fill(0), g = 0; for (let it = 0; it < 30000; it++) { const nh = Rw.map((r, i) => r + P[i].reduce((a, pij, j) => a + pij * h[j], 0)); g = nh[0]; h = nh.map(v => v - g); } return { h, g }; };
    const { h, g: g1 } = solve(), f = T.split[1] / g1;
    const val = T.trail.map((s, p) => p === top ? Jraw * f : f * (h[idx(p)] - h[0]));
    const fx = T.trail.map((s, p) => SLOT.isBonus(s) ? +(f * w[p] * Jb / ev[s]).toFixed(5) : 0);
    SLOT.TUNE[sk] = { line: +(T.split[0] / lineRaw).toFixed(5), val: val.map(v => +v.toFixed(3)), fx };
    out[sk] = { lineRaw, topRate: 0, ev, starsPerSpin: pr.reduce((a, b) => a + b, 0) };
  }
  return out;
}
let SLOT = load();
if (WRITE) {
  const info = tune(SLOT);
  for (const [sk, o] of Object.entries(info)) console.log(sk, 'raw lines ' + (o.lineRaw * 100).toFixed(1) + '%, stars/spin ' + o.starsPerSpin.toFixed(3), 'bonus avg (raw)', JSON.stringify(Object.fromEntries(Object.entries(o.ev).map(([k, v]) => [k, +v.toFixed(1)]))));
  const src = fs.readFileSync(FILE, 'utf8'), a = src.indexOf('// @@TUNE@@'), b = src.indexOf('  // @@END@@');
  const body = '// @@TUNE@@\n  const TUNE = ' + JSON.stringify(SLOT.TUNE) + ';\n';
  fs.writeFileSync(FILE, src.slice(0, a) + body + src.slice(b));
  console.log('written:', JSON.stringify(SLOT.TUNE));
  SLOT = load();
}
// ---- report
const STRATS = { 'never take': () => false, 'take at x3+': (sk, p) => SLOT.valAt(sk, p) >= 3, 'take at x20+': (sk, p) => SLOT.valAt(sk, p) >= 20, 'take anything': (sk, p) => p >= 0 };
for (const sk of Object.keys(SLOT.STRENGTHS)) {
  console.log('\n== ' + SLOT.STRENGTHS[sk].name + '  trail: ' + SLOT.TUNE[sk].val.map((c, i) => (SLOT.STRENGTHS[sk].trail[i] === 'C' ? '' : SLOT.STRENGTHS[sk].trail[i] + ':') + 'x' + c.toFixed(1)).join(' '));
  for (const [name, collect] of Object.entries(STRATS)) {
    let paid = 0, hits = 0, pos = -1, sum2 = 0, max = 0, line = 0, trail = 0, big = 0; const feats = {}, featX = {};
    for (let i = 0; i < N; i++) {
      const r = SLOT.play(sk, rnd, pos); let x = r.x; line += r.x; pos = r.pos;
      if (r.feat) { feats[r.feat.kind] = (feats[r.feat.kind] || 0) + 1; featX[r.feat.kind] = (featX[r.feat.kind] || 0) + r.feat.x; x += r.feat.x; trail += r.feat.x; }
      if (pos >= 0 && collect(sk, pos)) { const f = SLOT.take(sk, pos); feats[f.kind] = (feats[f.kind] || 0) + 1; featX[f.kind] = (featX[f.kind] || 0) + f.x; x += f.x; trail += f.x; pos = -1; }
      paid += x; if (x > 0) hits++; sum2 += x * x; if (x > max) max = x; if (x >= 20) big++;
    }
    const rtp = paid / N, sd = Math.sqrt(sum2 / N - rtp * rtp);
    console.log('  ' + name.padEnd(17) + ' RTP ' + (rtp * 100).toFixed(2) + '%  (lines ' + (line / N * 100).toFixed(1) + '%, trail ' + (trail / N * 100).toFixed(1) + '%)  hit ' + (hits / N * 100).toFixed(1) + '%  sd ' + sd.toFixed(2) + '  20x+ wins 1 in ' + Math.round(N / Math.max(1, big)) + '  max x' + max.toFixed(0));
    console.log('      bonuses: ' + Object.entries(feats).map(([k, v]) => k + ' 1 in ' + Math.round(N / v) + ' (avg x' + (featX[k] / v).toFixed(1) + ')').join(', '));
  }
}
