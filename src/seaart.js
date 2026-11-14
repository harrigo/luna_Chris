// ===== L7 THE ASTRO-RAT ARMADA: the deep-sea art (v2.83) =====
// Sculpted (ppSculpt, parmart.js) in a sea palette: coral, sea fans, brain coral, anemones, kelp, a giant clam with a
// glowing pearl, and a sunken rat ironclad overgrown with coral - plus the ocean-world icon for the map and the radar.

const SEAR = {
  CORAL: [0xffd8d0, 0xff8a8a, 0xe0506a, 0xa02a50, 0x5a1438],
  ORNG:  [0xffe6a8, 0xffa850, 0xe06a28, 0xa03a18, 0x5a1c0c],
  FAN:   [0xf0c8ff, 0xb070e8, 0x7a40b8, 0x4a2080, 0x26104a],
  KELP:  [0xe0f088, 0x98c844, 0x5a8a28, 0x34581a, 0x1a300e],
  BRAIN: [0xf4f0b0, 0xccc468, 0x9a9238, 0x625c1e, 0x30300c],
  SEA:   [0xc8faff, 0x5ad0e8, 0x2a8ab8, 0x18507a, 0x0c2840],
  ROCK:  [0xb0a8b0, 0x807888, 0x564e62, 0x342c40, 0x1a1622],
  SAND:  [0xf0dca8, 0xd0b47a, 0xa48854, 0x6e5a36, 0x3e321e],
  RUST:  [0xf0a866, 0xc0763e, 0x904c24, 0x5e2e14, 0x361a0a],
  IRON:  [0xa8b4c0, 0x7a8696, 0x52606e, 0x323c48, 0x1a2028],
  GOLD:  [0xfff8c0, 0xffdc50, 0xe8a822, 0xb06e12, 0x6e3e08],
  GLOW:  [0xffffff, 0xc8faff, 0x8af0ff],
};
const SEA_PAL = [].concat(SEAR.CORAL, SEAR.ORNG, SEAR.FAN, SEAR.KELP, SEAR.BRAIN, SEAR.SEA, SEAR.ROCK, SEAR.SAND, SEAR.RUST, SEAR.IRON, SEAR.GOLD, SEAR.GLOW, [0x1a1020, 0xff5ab0]);

function makeSeaArt(scene) {
  if (scene.game.__seaArt || typeof ppSculpt !== 'function') return; scene.game.__seaArt = true;
  const S = SEAR, O = { pal: SEA_PAL }, INKD = 0x1a1020;
  // a branching coral: recursive, every tip a little lit polyp
  const branch = (H, x, y, ang, len, w, d, ramp) => {
    const bend = (H.rnd() - 0.5) * 0.6, mx = x + Math.cos(ang + bend * 0.5) * len * 0.5, my = y + Math.sin(ang + bend * 0.5) * len * 0.5, ex = x + Math.cos(ang + bend) * len, ey = y + Math.sin(ang + bend) * len;
    H.tube([[x, y], [mx, my], [ex, ey]], w, w * 0.72, ramp);
    if (d > 0) { const n = d > 1 ? 2 + (H.rnd() < 0.4 ? 1 : 0) : 2; for (let k = 0; k < n; k++) branch(H, ex, ey, ang + bend + (k - (n - 1) / 2) * 0.75 + (H.rnd() - 0.5) * 0.3, len * (0.62 + H.rnd() * 0.2), w * 0.7, d - 1, ramp); }
    else { H.ell(ex, ey, w * 0.62, w * 0.62, ramp[0]); H.g.fillStyle = '#ffffff'; H.g.fillRect(ex - 0.5, ey - 0.5, 1, 1); }
  };
  const rockBase = (H, cx, cy, rx, ry) => { H.ell(cx, cy, rx, ry, S.ROCK, 'round'); H.flecks(cx - rx, cy - ry, cx + rx, cy + ry, 12, S.ROCK[4], 0.8); H.flecks(cx - rx, cy - ry, cx + rx, cy, 8, S.CORAL[1], 0.7); };

  // --- staghorn coral (orange) and a pink one
  for (const [key, ramp, seedA] of [['sea_coral', S.ORNG, 0], ['sea_coral2', S.CORAL, 1]]) ppSculpt(scene, key, 84, 92, 1, H => {
    H.ink = INKD; rockBase(H, 42, 84, 26, 7);
    for (let k = 0; k < 3; k++) branch(H, 34 + k * 8 + seedA * 2, 82, -Math.PI / 2 + (k - 1) * 0.5, 22 - Math.abs(k - 1) * 4, 7, 2, ramp);
  }, O);
  // --- a sea fan: a lacy purple gorgonian on a short stalk
  ppSculpt(scene, 'sea_fan', 84, 96, 1, H => {
    H.ink = 0; rockBase(H, 42, 89, 18, 6);
    const g = H.g, bx = 42, by = 84, rays = 13;
    g.save(); g.beginPath(); g.ellipse(42, 46, 38, 40, 0, 0, Math.PI * 2); g.clip();
    const tips = []; for (let k = 0; k < rays; k++) { const a = -Math.PI * 0.92 + k / (rays - 1) * Math.PI * 0.84, L = 70 + H.rnd() * 10; const pts = [[bx, by], [bx + Math.cos(a) * L * 0.4, by + Math.sin(a) * L * 0.42], [bx + Math.cos(a) * L, by + Math.sin(a) * L * 0.95]]; H.line(pts, S.FAN[3], 2.4, true); H.line(pts.map(([x, y]) => [x - 0.6, y - 0.6]), S.FAN[1], 1.1, true); tips.push(pts); }
    for (let r = 16; r < 80; r += 7) { const ring = []; for (let k = 0; k <= 24; k++) { const a = -Math.PI * 0.92 + k / 24 * Math.PI * 0.84; ring.push([bx + Math.cos(a) * r, by + Math.sin(a) * r * 0.95 + Math.sin(k * 2.1 + r) * 1.5]); } H.line(ring, S.FAN[2], 0.9, true); }
    g.restore();
    for (const p of tips) { const [x, y] = p[2]; if (y > 2) H.ell(x, Math.max(4, y), 1.6, 1.6, S.FAN[0]); }
    H.tube([[42, 88], [42, 80], [41, 74]], 4, 3, S.FAN);
  }, O);
  // --- brain coral: a lumpy dome with a maze of grooves
  ppSculpt(scene, 'sea_brain', 70, 44, 1, H => {
    H.ink = INKD; H.shape([[4, 42], [6, 26], [18, 10], [36, 5], [54, 10], [66, 26], [66, 42]], S.BRAIN, 'round');
    const g = H.g; g.globalCompositeOperation = 'source-atop';
    for (let k = 0; k < 9; k++) { let x = 8 + k * 6.5, y = 40, a = -1.6 + (k - 4) * 0.15; const pts = [[x, y]]; for (let i = 0; i < 16; i++) { a += Math.sin(i * 1.3 + k) * 0.9; x += Math.cos(a) * 3; y += Math.sin(a) * 2.2 - 0.6; pts.push([x, y]); } H.line(pts, S.BRAIN[4], 1.4, true); H.line(pts.map(([x, y]) => [x + 0.8, y + 0.9]), S.BRAIN[0], 0.6, true); }
    g.globalCompositeOperation = 'source-over'; H.ell(18, 40, 6, 3, S.ROCK, 'round');
  }, O);
  // --- an anemone: a fat striped column, a crown of fat tentacles with glowing tips (2 frames: they wave)
  for (const f of [0, 1]) ppSculpt(scene, 'sea_anem' + (f ? '_b' : ''), 64, 64, 1, H => {
    H.ink = INKD; rockBase(H, 32, 58, 16, 5);
    H.shape([[22, 58], [20, 40], [24, 32], [40, 32], [44, 40], [42, 58]], S.CORAL, 'cyl');
    for (let y = 36; y < 58; y += 5) H.line([[21, y], [43, y + 1]], S.CORAL[3], 0.9);
    for (let k = 0; k < 13; k++) { const a = -Math.PI + 0.15 + k / 12 * (Math.PI - 0.3), sw = Math.sin(k * 1.7 + f * 2.2) * 0.35, x0 = 32 + Math.cos(a) * 8, y0 = 33 + Math.sin(a) * 2, L = 16 + (k % 3) * 4;
      const mid = [x0 + Math.cos(a + sw) * L * 0.5, y0 + Math.sin(a + sw) * L * 0.6 - 4], end = [x0 + Math.cos(a + sw * 2) * L, y0 + Math.sin(a + sw * 2) * L * 0.8 - 2];
      H.tube([[x0, y0], mid, end], 4.2, 2.4, S.FAN); H.ell(end[0], end[1], 1.8, 1.8, 0xff5ab0); H.g.fillStyle = '#ffffff'; H.g.fillRect(end[0] - 0.5, end[1] - 1, 1, 1); }
    H.ell(32, 33, 7, 2.4, S.CORAL[4]);
  }, O);
  // --- tall kelp: a wavy stalk, long rippled blades, gas bladders (2 frames: it sways)
  for (const f of [0, 1]) ppSculpt(scene, 'sea_kelp' + (f ? '_b' : ''), 44, 140, 1, H => {
    H.ink = INKD; const sx = y => 22 + Math.sin(y * 0.05 + f * 1.2) * 5 * (1 - y / 140);
    const stem = []; for (let y = 138; y > 4; y -= 10) stem.push([sx(y), y]); H.tube(stem, 3.2, 2, S.KELP);
    for (let y = 120; y > 12; y -= 15) { const sd = (Math.floor(y / 15) % 2) ? 1 : -1, x = sx(y), L = 14 + (y % 7);
      const tip = [x + sd * L, y - 14 + Math.sin(y + f) * 3]; H.shape([[x, y], [x + sd * L * 0.5, y - 3], tip, [x + sd * L * 0.6, y - 10], [x + sd * 2, y - 6]], S.KELP, 'round');
      H.line([[x, y - 1], [tip[0] - sd * 3, tip[1] + 2]], S.KELP[3], 0.7, true); H.ell(x + sd * 3, y + 1, 2.6, 2.4, S.GOLD, 'round'); }
    H.shape([[sx(8), 10], [sx(8) - 6, 0], [sx(8) + 7, 2]], S.KELP, 'round');
  }, O);
  // --- a giant clam, gaping, a pearl glowing in it
  ppSculpt(scene, 'sea_clam', 64, 46, 1, H => {
    H.ink = INKD;
    H.shape([[2, 40], [6, 30], [18, 24], [32, 22], [46, 24], [58, 30], [62, 40], [32, 45]], S.ROCK, 'round');
    for (let k = 0; k < 7; k++) H.line([[32, 44], [6 + k * 9, 28 - Math.abs(k - 3) * 1.5]], S.ROCK[3], 1.2);
    H.shape([[6, 30], [14, 12], [32, 4], [50, 12], [58, 30], [46, 24], [32, 22], [18, 24]], S.ROCK, 'round');
    for (let k = 0; k < 6; k++) H.line([[32, 6], [12 + k * 8, 26 - Math.abs(k - 2.5) * 1.2]], S.ROCK[3], 1.1);
    H.shape([[8, 31], [20, 26], [32, 24], [44, 26], [56, 31], [44, 36], [32, 37], [20, 36]], S.FAN, 'round');   // the mantle
    for (let x = 10; x < 56; x += 4) H.ell(x, 31 + Math.sin(x) * 1.2, 1.2, 1, S.SEA[1]);
    H.ell(32, 30, 5.5, 5, S.GLOW.concat([0x5ad0e8, 0x2a8ab8]), 'round'); H.ell(30.5, 28.5, 1.4, 1.4, 0xffffff);
    H.flecks(4, 6, 60, 44, 10, S.SAND[1], 0.8);
  }, O);
  // --- a SUNKEN RAT IRONCLAD: snapped in two, riveted iron rusting through, the funnel toppled, the turret's gun drooping,
  // portholes glowing a ghostly cyan, a crowned rat figurehead at the prow, coral and anemones growing all over it
  ppSculpt(scene, 'sea_wreck', 210, 116, 1, H => {
    const g = H.g; H.ink = INKD;
    H.ell(105, 110, 100, 8, S.SAND, 'round');                                                       // the mound it's settled in
    // the stern half, tilted
    g.save(); g.translate(64, 96); g.rotate(-0.08);
    H.shape([[-58, 6], [-62, -22], [-50, -30], [30, -32], [40, -18], [36, 10]], S.IRON, 'round');
    H.poly([[-60, -24], [38, -34], [40, -28], [-60, -18]], S.RUST, 'down');
    for (let x = -54; x < 34; x += 6) for (const y of [-14, -2]) { H.ell(x, y, 0.9, 0.9, S.IRON[0]); }
    for (const x of [-40, -20, 0, 20]) { H.ell(x, -8, 4.2, 4.2, INKD); H.ell(x, -8, 3, 3, [0xc8faff, 0x8af0ff, 0x5ad0e8, 0x2a8ab8, 0x18507a], 'round'); }
    H.poly([[-20, -32], [-14, -52], [8, -52], [14, -32]], S.IRON, 'cyl');
    H.tube([[6, -46], [26, -54], [44, -52]], 6, 5, S.IRON);                                           // the gun, drooping
    H.streaks(-58, 36, -20, 26, 16, S.RUST[3]); H.flecks(-58, -32, 36, 8, 30, S.RUST[2], 1.2);
    H.crack(-30, -28, 30, 1.3);
    g.restore();
    // the toppled funnel lying across the sand
    H.tube([[96, 104], [120, 98], [146, 96]], 15, 15, S.IRON); H.flecks(90, 88, 150, 110, 24, S.RUST[2], 1.4); H.ell(148, 95, 6, 8, INKD); H.line([[104, 96], [108, 112]], S.IRON[3], 1.4); H.line([[124, 90], [126, 106]], S.IRON[3], 1.4);
    // the bow half, nose up, its broken end showing ribs
    g.save(); g.translate(170, 92); g.rotate(-0.42);
    H.shape([[-26, 10], [-28, -24], [22, -26], [44, -16], [40, 6]], S.IRON, 'round');
    H.poly([[-28, -26], [24, -28], [26, -22], [-28, -20]], S.RUST, 'down');
    for (const x of [-26, -20, -14]) H.rect(x, -30, 2.4, 40, S.IRON[3]);                             // the ribs, where it tore
    H.ell(6, -8, 4.2, 4.2, INKD); H.ell(6, -8, 3, 3, [0xc8faff, 0x8af0ff, 0x5ad0e8, 0x2a8ab8, 0x18507a], 'round');
    H.ell(44, -24, 6, 6, S.GOLD, 'round'); H.shape([[39, -29], [39, -36], [42, -32], [44, -38], [46, -32], [49, -36], [49, -29]], S.GOLD, 'round');   // the figurehead: a gilded rat in a crown
    H.shape([[46, -22], [56, -20], [48, -16]], S.GOLD, 'round');
    H.streaks(-26, 40, -20, 24, 10, S.RUST[3]); H.flecks(-26, -28, 40, 8, 20, S.RUST[2], 1.1);
    g.restore();
    // a broken mast leaning out of the stern half, a rag of the royal flag still on it
    H.tube([[52, 64], [60, 30], [66, 8]], 3.4, 2.4, S.IRON);
    H.shape([[61, 14], [80, 16], [76, 22], [82, 28], [62, 28]], S.CORAL, 'round');
    // life moving in: coral, an anemone, kelp
    branch(H, 30, 66, -1.9, 12, 5, 2, S.ORNG); branch(H, 182, 66, -1.3, 10, 4, 1, S.CORAL); branch(H, 120, 88, -1.6, 8, 3.5, 1, S.FAN);
    for (const [x, y] of [[14, 74], [86, 72], [150, 84]]) { H.ell(x, y, 3.2, 2.4, S.BRAIN, 'round'); }
    H.flecks(10, 60, 200, 108, 26, S.ROCK[0], 0.9);                                                  // barnacles
  }, O);
  // --- the ocean world, for the map and the radar: a blue globe, wave crests, a rat ironclad riding the top, the rock
  // core dimly through the water, kelp and bubbles
  ppSculpt(scene, 'oceanglobe', 128, 128, 1, H => {
    const g = H.g; H.ink = 0; g.translate(5, 9); g.scale(0.92, 0.92);
    H.ell(64, 66, 56, 56, S.SEA, 'round');
    g.save(); g.beginPath(); g.ellipse(64, 66, 56, 56, 0, 0, Math.PI * 2); g.clip();
    H.ell(64, 96, 22, 22, [S.SEA[3], S.SEA[3], S.SEA[4], S.SEA[4], 0x1a1020], 'round');                         // the core, deep down

    for (const [x, sd] of [[46, -1], [58, 1], [78, -1], [86, 1]]) { const pts = []; for (let y = 72; y > 50; y -= 4) pts.push([x + Math.sin(y * 0.4) * 2 * sd, y]); H.line(pts, S.KELP[2], 1.6, true); }
    for (let k = 0; k < 6; k++) { const y = 26 + k * 10, pts = []; for (let x = 0; x <= 128; x += 6) pts.push([x, y + Math.sin(x * 0.18 + k * 1.3) * 2.4]); H.line(pts, k < 2 ? S.SEA[0] : S.SEA[1], k < 2 ? 1.4 : 0.9, true); }
    g.globalAlpha = 0.6; for (let k = 0; k < 8; k++) H.ell(30 + k * 9, 40 + (k * 13) % 30, 1.6, 1.6, 0xffffff); g.globalAlpha = 1;
    g.restore();
    const crest = []; for (let k = 0; k <= 40; k++) { const a = -Math.PI + k / 40 * Math.PI * 2; crest.push([64 + Math.cos(a) * 56.5, 66 + Math.sin(a) * 56.5]); }
    H.line(crest, 0xffffff, 2.2, true); for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2; H.ell(64 + Math.cos(a) * 57, 66 + Math.sin(a) * 57, 2.2, 2.2, 0xffffff); }
    H.ink = INKD;                                                                                        // the ironclad, riding the top
    H.shape([[46, 14], [50, 6], [80, 6], [84, 14]], S.IRON, 'round'); H.poly([[58, 6], [60, -2], [70, -2], [72, 6]], S.RUST, 'cyl');
    H.ell(66, -1, 2, 2, S.GOLD); H.line([[72, 2], [82, -2]], S.IRON[3], 1.6);
    for (const x of [54, 64, 74]) H.ell(x, 10, 1.4, 1.4, S.GLOW[1]);
    g.globalAlpha = 0.3; H.ell(42, 46, 14, 9, 0xffffff); g.globalAlpha = 1;
  }, O);
}
