// ================================================================= RE-ART (v3.97)
// The weakest sprites, found by measuring every texture (flat single-colour areas, long ruler-straight edges, few
// colours) and then looking at the worst: skeletons made of evenly spaced sticks, rocks that were a triangle split
// corner to corner into a light half and a dark half, barrels and crates with no grain. They're redrawn here with the
// boss painter (BA.paint, bossart.js): round shading lit from the top-left, organic shapes, cracks, specks, moss, drips.
// Same canvas sizes and footprints as before, so everything that places them still fits.
// Run once at boot (buildAllTextures, atlas.js), after the old painters; the keys are then marked as "files" so no later
// painter draws over them.
const REART = (() => {
  const P = (name, a, b) => PAL_RAMPS[name].slice(a === undefined ? 0 : a, b).reverse();     // a palette ramp, light first
  const rng = seed => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  // a fat line as one long ellipse (shaded across its width)
  const seg = (a, b, r, ramp, g, extra) => Object.assign({ e: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.hypot(b[0] - a[0], b[1] - a[1]) / 2 + r * 0.8, r], rot: Math.atan2(b[1] - a[1], b[0] - a[0]), r: ramp, g }, extra || {});
  // a bendy tube that tapers from r0 to r1
  const tube = (pts, r0, r1, ramp, g, extra) => pts.slice(0, -1).map((p, i) => seg(p, pts[i + 1], r0 + (r1 - r0) * (i / Math.max(1, pts.length - 2)), ramp, g, extra));
  // a long bone: a shaft with a knuckle of two knobs at each end
  const bone = (a, b, r, ramp, g) => { const an = Math.atan2(b[1] - a[1], b[0] - a[0]), nx = -Math.sin(an) * r * 0.9, ny = Math.cos(an) * r * 0.9;
    return [seg(a, b, r, ramp, g)].concat([a, b].flatMap(q => [{ e: [q[0] + nx, q[1] + ny, r * 1.25, r * 1.25], r: ramp, g }, { e: [q[0] - nx, q[1] - ny, r * 1.25, r * 1.25], r: ramp, g }])); };
  // scattered single pixels inside a box (masked: they only land on paint)
  const specks = (x0, y0, x1, y1, n, c, seed) => { const r = rng(seed), d = []; for (let i = 0; i < n; i++) d.push([x0 + r() * (x1 - x0), y0 + r() * (y1 - y0)]); return { d, c, m: true }; };
  const crack = (pts, c) => ({ l: pts, c, w: 1, m: true });
  // a skull (cx, cy = the middle of the cranium; k = size): lopsided sockets, a cracked dome, gappy teeth
  const skull = (cx, cy, k, ramp, g, glow) => [
    { e: [cx, cy, 10.5 * k, 9.5 * k], r: ramp, g },
    { p: [[cx - 6.5 * k, cy + 4 * k], [cx + 6.5 * k, cy + 4 * k], [cx + 5.5 * k, cy + 13 * k], [cx - 5 * k, cy + 13 * k]], r: ramp, g, bulge: 0.3 },
    { e: [cx - 4.4 * k, cy + 1.2 * k, 3.1 * k, 3.5 * k], r: [0x1a1020], noLine: true }, { e: [cx + 4.2 * k, cy + 0.6 * k, 3.5 * k, 3.9 * k], r: [0x1a1020], noLine: true },
    { p: [[cx - 1.2 * k, cy + 5 * k], [cx + 1.4 * k, cy + 5 * k], [cx + 0.2 * k, cy + 7.8 * k]], r: [0x1a1020], noLine: true },
    { d: [[cx - 4.4 * k, cy + 1.6 * k], [cx + 4.4 * k, cy + 1 * k]], c: glow === undefined ? 0xe0342e : glow },
    crack([[cx + 2 * k, cy - 9 * k], [cx + 0.5 * k, cy - 5.5 * k], [cx + 3 * k, cy - 3.5 * k], [cx + 2 * k, cy - 1.5 * k]], ramp[ramp.length - 1]),
    { l: [[cx - 3.2 * k, cy + 9.5 * k], [cx - 3.2 * k, cy + 12.5 * k]], c: 0x1a1020, w: 1, m: true }, { l: [[cx - 0.6 * k, cy + 9.5 * k], [cx - 0.6 * k, cy + 12.5 * k]], c: 0x1a1020, w: 1, m: true },
    { l: [[cx + 3.6 * k, cy + 9.5 * k], [cx + 3.6 * k, cy + 12.5 * k]], c: 0x1a1020, w: 1, m: true },
    { p: [[cx + 1 * k, cy + 10 * k], [cx + 2.8 * k, cy + 10 * k], [cx + 2.8 * k, cy + 13.2 * k], [cx + 1 * k, cy + 13.2 * k]], r: [0x1a1020], noLine: true }       // a missing tooth
  ];
  // a lumpy boulder: overlapping lumps, cracks, grit, and (optionally) a cap of moss
  const rockLumps = (lumps, ramp, g) => lumps.map(([x, y, rx, ry, rot]) => ({ e: [x, y, rx, ry], rot: rot || 0, r: ramp, g, grain: 0.16 }));

  const DEFS = {};
  // ---------------------------------------------------------------- skeletons
  for (const [key, ramp, far, moss] of [['bone_ribcage', P('cream', 1), P('cream', 0, 3), 0x5e6634], ['bg_ribcage', P('sage', 1), P('sage', 0, 3), 0x267030]]) DEFS[key] = [140, 80, () => {
    const r = rng(77), sh = [], spine = [];
    for (let i = 0; i <= 18; i++) { const t = i / 18; spine.push([8 + t * 126, 64 - Math.sin(Math.min(1, t * 1.12) * Math.PI) * 50 - t * 6 + (r() - 0.5) * 2.4]); }
    const ribs = [];
    for (let i = 3; i <= 15; i += (i % 4 === 1 ? 2 : 1)) {                // each rib its own length and lean; a couple are missing, two are snapped off
      const [x, y] = spine[i], k = Math.sin((i / 18) * Math.PI), broken = i === 6 || i === 12, len = (74 - y) * (broken ? 0.42 : 0.82 + r() * 0.2), sw = (8 + 11 * k) * (0.8 + r() * 0.4), lean = (r() - 0.5) * 5;
      ribs.push({ x, y, len, sw, lean, broken, i });
      sh.push(...tube([[x, y + 1], [x - sw * 0.3 + lean, y + len * 0.3], [x - sw * 0.42 + lean, y + len * 0.62]], 2, 1.2, far, 'far', { soft: true }));   // the far-side ribs, in shadow
    }
    for (const q of ribs) sh.push(...tube([[q.x, q.y], [q.x + q.sw * 0.5 + q.lean, q.y + q.len * 0.28], [q.x + q.sw * 0.72 + q.lean, q.y + q.len * 0.62], [q.x + q.sw * 0.38 + q.lean, q.y + q.len * 0.96]].slice(0, q.broken ? 3 : 4), 3.3, q.broken ? 2.6 : 1.7, ramp, 'r' + q.i));
    for (let i = 0; i < spine.length; i++) { const [x, y] = spine[i], s = 5.6 - i * 0.14 + (i % 2) * 0.8;                // knobbly vertebrae, a spur on each
      sh.push({ e: [x, y, s, s * 0.82], r: ramp, g: 'v' + i }, { p: [[x - 1.2, y - s * 0.6], [x + 1.4, y - s * 0.6], [x + 0.6, y - s * 0.6 - 3.4 - (i % 3)]], r: ramp, g: 'v' + i, bulge: 0.2 }); }
    sh.push({ e: [9, 67, 7, 5.5], r: ramp, rot: 0.3 }, { e: [133, 60, 3, 2.6], r: ramp });                              // the hip, and the tail's tip
    sh.push(...bone([92, 75], [108, 77], 1.5, ramp, 'f1'), ...tube([[52, 77], [58, 75], [64, 77]], 1.6, 1.2, ramp, 'f2'));   // what's fallen off: a bone, half a rib
    sh.push(specks(4, 6, 136, 78, 60, ramp[ramp.length - 1], 5), specks(4, 6, 136, 40, 26, moss, 9), crack([[40, 26], [44, 30], [42, 34]], ramp[ramp.length - 1]), crack([[78, 16], [82, 20]], ramp[ramp.length - 1]));
    return sh;
  }];
  DEFS.labribs = [70, 40, () => {
    const B = P('cream', 1), r = rng(31), sh = [];
    sh.push({ e: [34, 37, 34, 4.5], r: P('olive', 0, 4), grain: 0.2 });                                                   // a mound of dirt
    for (let i = 0; i < 7; i++) { const x = 7 + i * 7 + (r() - 0.5) * 2, hgt = (i === 3 ? 10 : 17 + Math.sin(i * 0.6) * 8 + r() * 4), lean = 3 + r() * 4;
      sh.push(...tube([[x, 33], [x + lean * 0.2, 33 - hgt * 0.45], [x + lean * 0.7, 33 - hgt * 0.8], [x + lean * 1.3, 33 - hgt]].slice(0, i === 3 ? 3 : 4), 2.4, 1.4, B, 'r' + i)); }
    for (let i = 0; i < 10; i++) sh.push({ e: [6 + i * 5.2, 33.5 + (i % 2) * 0.6, 3.2, 2.5], r: B, g: 'v' + i });         // the spine along the ground
    sh.push(...skull(61, 24, 0.66, B, 'sk', 0x5ad8d8), specks(2, 4, 68, 38, 22, B[B.length - 1], 3), specks(2, 30, 68, 40, 14, 0x84904a, 4));
    return sh;
  }];
  DEFS.p_skull = [30, 30, () => skull(15, 12, 1, P('cream', 1), 'sk').concat([specks(4, 2, 26, 26, 14, 0xb89a62, 11), { d: [[6, 9], [6, 10], [7, 8]], c: 0x8a6a40, m: true }])];
  DEFS.pile_bones = [110, 62, () => {
    const B = P('cream', 1), F = P('cream', 0, 4), sh = [];
    for (const [x, y, rx, ry] of [[34, 56, 24, 6], [70, 56, 26, 6]]) sh.push({ e: [x, y, rx, ry], r: F, g: 'heap', grain: 0.22 });                                       // the bottom of the heap, in shadow
    sh.push(...bone([8, 54], [46, 40], 3, B, 'b1'), ...bone([62, 38], [102, 54], 3, B, 'b2'), ...bone([30, 57], [74, 58], 2.6, B, 'b3'), ...bone([78, 46], [94, 28], 2.4, B, 'b4'), ...bone([24, 48], [14, 32], 2.2, B, 'b5'));
    sh.push(...tube([[26, 46], [30, 34], [40, 30], [50, 36]], 2.6, 1.6, B, 'r1'), ...tube([[60, 52], [66, 44], [76, 46]], 2.4, 1.5, B, 'r2'), ...tube([[40, 50], [48, 46], [56, 50]], 2.2, 1.5, B, 'r3'));   // loose ribs
    for (let i = 0; i < 5; i++) sh.push({ e: [82 + i * 5, 57.5 - i * 0.5, 3, 2.5], r: B, g: 'v' + i });                    // a run of vertebrae
    sh.push(...skull(54, 22, 1.05, B, 'sk'), specks(4, 10, 106, 60, 50, B[B.length - 1], 21), specks(4, 44, 106, 60, 16, 0x5e6634, 22));
    return sh;
  }];
  // ---------------------------------------------------------------- rocks
  DEFS.p_rock = [30, 22, () => rockLumps([[9, 16, 9, 6], [20, 15, 9.5, 7, 0.2], [14, 10, 8, 7, -0.2]], P('cheese', 1), 'k').concat([
    { e: [11, 9, 2.2, 1.7], r: [0x8a5a12, 0x5a3410], noLine: true }, { e: [21, 14, 2.6, 2], r: [0x8a5a12, 0x5a3410], noLine: true }, { e: [7, 17, 1.6, 1.2], r: [0x8a5a12, 0x5a3410], noLine: true },
    specks(2, 5, 28, 21, 16, 0xfff6c0, 3), specks(2, 5, 28, 21, 12, 0x8a5a12, 4)])];
  const boulderDef = (w, h, lumps, ramp, mossAt, seed) => [w, h, () => rockLumps(lumps, ramp, 'k').concat(
    mossAt.map(([x, y, rx, ry]) => ({ e: [x, y, rx, ry], r: P('green', 1, 5), g: 'm', soft: true, grain: 0.3 })),
    [specks(1, 1, w - 1, h - 1, Math.round(w * h / 28), ramp[ramp.length - 1], seed), specks(1, 1, w - 1, h * 0.6, Math.round(w * h / 50), ramp[0], seed + 1),
      crack([[w * 0.55, h * 0.3], [w * 0.5, h * 0.5], [w * 0.58, h * 0.66], [w * 0.52, h * 0.86]], ramp[ramp.length - 1]), crack([[w * 0.5, h * 0.5], [w * 0.36, h * 0.6]], ramp[ramp.length - 1])])];
  DEFS.rock_dark = boulderDef(44, 30, [[12, 22, 11, 8], [30, 20, 13, 10, 0.15], [21, 13, 13, 11, -0.1], [36, 25, 7, 5]], P('slate', 0, 5), [[19, 4.5, 9, 3], [28, 9, 5, 2]], 41);
  DEFS.rock_dark2 = boulderDef(30, 22, [[9, 15, 8.5, 6.5], [20, 14, 9.5, 7.5, 0.2], [14, 9, 8, 7]], P('slate', 0, 5), [[13, 3.5, 6, 2.2]], 43);
  DEFS.labboulder = boulderDef(72, 52, [[20, 38, 18, 12], [50, 36, 19, 14, 0.1], [35, 24, 22, 17, -0.08], [58, 44, 10, 6], [14, 45, 9, 5]], P('stone', 0, 5), [], 47);
  DEFS.boulder = [28, 28, () => [{ e: [14, 14, 13, 13], r: P('wood', 0, 4), grain: 0.2 },
    { e: [8, 9, 2.6, 2.2], r: P('orange', 2, 6), noLine: true }, { e: [19, 8, 3, 2.4], r: P('orange', 2, 6), noLine: true }, { e: [20, 19, 2.6, 2.6], r: P('orange', 2, 6), noLine: true }, { e: [10, 20, 3.2, 2.4], r: P('orange', 2, 6), noLine: true },
    crack([[8, 9], [12, 13], [19, 8]], 0xd0561e), crack([[12, 13], [14, 18], [10, 20]], 0xd0561e), crack([[14, 18], [20, 19]], 0xff8a2a),
    specks(2, 2, 26, 26, 22, 0x2e1a14, 51), specks(2, 2, 26, 16, 10, 0xa86a34, 52)]];
  // ---------------------------------------------------------------- the factory's junk
  DEFS.barrel = [22, 30, () => [
    { p: [[3, 2], [19, 2], [21, 8], [21, 23], [19, 29], [3, 29], [1, 23], [1, 8]], r: P('slate', 1, 6), bulge: 0.7 },
    { p: [[1, 12], [21, 12], [21, 17], [1, 17]], r: P('cheese', 2, 5), bulge: 0.3 },                                         // a hazard band
    { p: [[4, 12], [7, 12], [4, 17], [1, 17]], r: [0x1a1020], noLine: true }, { p: [[10, 12], [13, 12], [10, 17], [7, 17]], r: [0x1a1020], noLine: true }, { p: [[16, 12], [19, 12], [16, 17], [13, 17]], r: [0x1a1020], noLine: true },
    { l: [[2, 7], [20, 7]], c: 0x2e3a4a, w: 1, m: true }, { l: [[2, 6], [20, 6]], c: 0xd2e0ea, w: 1, m: true }, { l: [[2, 23], [20, 23]], c: 0x2e3a4a, w: 1, m: true }, { l: [[2, 22], [20, 22]], c: 0x9cb0c2, w: 1, m: true },   // the rolled ribs
    { e: [15, 26, 2.6, 1.6], r: [0x2e3a4a, 0x1c2430], noLine: true },                                                        // a dent
    specks(2, 2, 20, 28, 12, 0xd0561e, 61), specks(2, 18, 20, 29, 8, 0x922e14, 62), { l: [[6, 23], [6, 27]], c: 0x922e14, w: 1, m: true }]];   // rust, and a rusty dribble
  DEFS.crates = [54, 44, () => {
    const W = P('wood', 1), D = P('wood', 0, 4), sh = [];
    const crate = (x, y, w, h, g) => { sh.push({ p: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], r: W, g, bulge: 0.25 });
      for (const [a, b] of [[[x, y], [x + w, y + 3]], [[x, y + h - 3], [x + w, y + h]], [[x, y], [x + 3, y + h]], [[x + w - 3, y], [x + w, y + h]]]) sh.push({ p: [[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]], r: D, g: g + 'f', bulge: 0.2 });   // the frame
      sh.push({ l: [[x + 4, y + 4], [x + w - 4, y + h - 4]], c: 0x4e2a1a, w: 2, m: true }, { l: [[x + 4, y + 5], [x + w - 5, y + h - 4]], c: 0xa86a34, w: 1, m: true });   // a brace across it
      for (let i = 1; i < 3; i++) sh.push({ l: [[x + 3, y + h * i / 3], [x + w - 3, y + h * i / 3]], c: 0x4e2a1a, w: 1, m: true });                                           // the planks
      sh.push({ d: [[x + 1.5, y + 1.5], [x + w - 1.5, y + 1.5], [x + 1.5, y + h - 1.5], [x + w - 1.5, y + h - 1.5]], c: 0xcfd8e6, m: true }); };                              // nails
    crate(2, 22, 24, 22, 'a'); crate(27, 20, 25, 24, 'b'); crate(15, 1, 22, 20, 'c');
    sh.push(specks(2, 1, 52, 44, 46, 0x2e1a14, 71), specks(2, 1, 52, 44, 26, 0xf0c490, 72),
      { p: [[20, 8], [32, 8], [32, 14], [20, 14]], r: [0xe6dcc4, 0xb8a890], noLine: true }, { d: [[22, 10], [24, 10], [26, 10], [28, 10], [30, 10], [23, 12], [25, 12], [27, 12], [29, 12]], c: 0x1a1020, m: true });   // a label
    return sh;
  }];
  DEFS.p_pipe = [22, 36, () => [
    { p: [[5, 8], [17, 8], [17, 36], [5, 36]], r: P('steel', 0, 5), bulge: 0.9 },
    { p: [[1, 2], [21, 2], [21, 9], [1, 9]], r: P('steel', 1, 6), bulge: 0.6 },                                              // the flange
    { p: [[4, 22], [18, 22], [18, 25], [4, 25]], r: P('steel', 1, 5), bulge: 0.4 },                                          // a collar
    { d: [[3, 5.5], [8, 5.5], [14, 5.5], [19, 5.5], [6, 23.5], [16, 23.5]], c: 0xffffff, m: true }, { d: [[3, 6.5], [8, 6.5], [14, 6.5], [19, 6.5]], c: 0x2a2a40, m: true },   // bolts
    { l: [[8, 10], [8, 21]], c: 0xcfd8e6, w: 1, m: true }, { l: [[13, 26], [13, 33]], c: 0x922e14, w: 1, m: true }, { l: [[14, 26], [14, 30]], c: 0xd0561e, w: 1, m: true },   // a shine, a rust streak
    specks(5, 9, 17, 35, 14, 0x2a2a40, 81), specks(5, 9, 17, 35, 6, 0xd0561e, 82)]];
  DEFS.mblade = [24, 44, () => [
    { p: [[3, 1], [22, 1], [22, 30], [12.5, 43], [3, 30]], r: P('steel', 1, 6), bulge: 0.35 },
    { p: [[3, 30], [12.5, 43], [12.5, 36], [6, 28]], r: P('steel', 3, 6), noLine: true, bulge: 0.1 },                         // the ground edge, catching the light
    { p: [[3, 1], [22, 1], [22, 6], [3, 6]], r: P('slate', 0, 4), bulge: 0.3 },                                              // the clamp
    { d: [[7, 3.5], [18, 3.5]], c: 0xcfd8e6, m: true }, { l: [[16, 9], [16, 27]], c: 0x6a7088, w: 1, m: true }, { l: [[9, 9], [9, 24]], c: 0xffffff, w: 1, m: true },
    { p: [[19, 16], [22, 15], [22, 18]], r: [0x2a2a40], noLine: true }, { p: [[19, 24], [22, 23], [22, 26]], r: [0x2a2a40], noLine: true },   // nicks out of the back
    specks(4, 7, 21, 30, 12, 0x46485e, 91), specks(4, 20, 21, 34, 6, 0xa81c28, 92)]];
  // ---------------------------------------------------------------- growing things, food
  DEFS.p_mushroom = [22, 18, () => [
    { p: [[8, 9], [14, 9], [15, 18], [7, 18]], r: P('cream', 2), bulge: 0.6 },
    { e: [11, 7.5, 10.5, 7], r: P('red', 1, 6) },
    { p: [[2, 9], [20, 9], [17, 11.5], [5, 11.5]], r: P('cream', 0, 4), noLine: true, bulge: 0.1 },                           // the gills
    { e: [6, 5, 2, 1.6], r: [0xfff2cc, 0xdcc48a], noLine: true }, { e: [13, 3.5, 2.4, 1.8], r: [0xfff2cc, 0xdcc48a], noLine: true }, { e: [17, 7, 1.5, 1.2], r: [0xfff2cc, 0xdcc48a], noLine: true }, { e: [10, 7.5, 1.2, 1], r: [0xfff2cc, 0xdcc48a], noLine: true },
    { l: [[7, 10], [7, 11]], c: 0x8a6a40, w: 1, m: true }, { l: [[10, 10], [10, 11]], c: 0x8a6a40, w: 1, m: true }, { l: [[13, 10], [13, 11]], c: 0x8a6a40, w: 1, m: true }, { l: [[16, 10], [16, 11]], c: 0x8a6a40, w: 1, m: true }]];
  DEFS.chili_cactus = [30, 46, () => {
    const G = P('green', 0, 5), sh = [];
    sh.push(...tube([[6, 30], [5, 22], [6, 15]], 3.2, 3, G, 'l'), ...tube([[6, 30], [10, 32], [14, 32]], 3, 3, G, 'l'));                          // the left arm
    sh.push(...tube([[24, 24], [25, 16], [24, 10]], 3, 2.8, G, 'r'), ...tube([[24, 24], [20, 27], [16, 27]], 3, 3, G, 'r'));                      // the right arm
    sh.push(...tube([[15, 46], [14, 30], [15, 16], [15, 8]], 5.4, 5, G, 't'));                                                                      // the trunk
    for (const x of [12, 15, 18]) sh.push({ l: [[x, 8], [x - 0.5, 44]], c: 0x184a26, w: 1, m: true });                                               // its ribs
    sh.push({ l: [[5, 16], [5, 28]], c: 0x184a26, w: 1, m: true }, { l: [[25, 12], [25, 22]], c: 0x184a26, w: 1, m: true });
    const r = rng(101), sp = []; for (let i = 0; i < 26; i++) sp.push([3 + r() * 24, 6 + r() * 38]); sh.push({ d: sp, c: 0xc0f080, m: true });   // spines
    for (const [x, y, a] of [[15, 4, 0.1], [6, 11, -0.4], [24, 6, 0.4]]) sh.push({ e: [x, y, 2.4, 3.6], rot: a, r: P('red', 2, 6), g: 'c' + x }, { d: [[x, y - 4]], c: 0x40a03a });   // a chilli on each tip
    return sh;
  }];
  DEFS.ham = [28, 16, () => [
    ...tube([[20, 8], [26, 8]], 1.6, 1.6, P('cream', 2), 'b'), { e: [26, 6.5, 1.8, 1.8], r: P('cream', 2), g: 'b' }, { e: [26, 9.5, 1.8, 1.8], r: P('cream', 2), g: 'b' },   // the bone
    { e: [11, 8, 10.5, 7.5], r: P('pink', 2, 6), grain: 0.12 },
    { e: [20, 8, 3, 5.5], r: P('cream', 3), g: 'cut' }, { e: [20.5, 8, 1.8, 3.6], r: P('red', 3, 6), g: 'cut', soft: true },                                               // the cut end: fat, then meat
    { l: [[5, 5], [9, 3.5], [14, 4]], c: 0xffd6ec, w: 1, m: true }, { l: [[4, 10], [8, 12], [13, 12.5]], c: 0xb43a86, w: 1, m: true }, specks(2, 2, 18, 14, 9, 0xb43a86, 111)]];
  DEFS.cwave = [30, 20, () => [
    { p: [[0, 20], [2, 12], [8, 5], [16, 2], [24, 4], [28, 9], [25, 10], [27, 15], [30, 20]], r: P('cheese', 1), bulge: 0.7 },
    { e: [22, 7, 5, 3.6], r: P('cheese', 3), g: 'f', soft: true }, { e: [15, 4.5, 4.5, 2.6], r: P('cheese', 4), g: 'f', soft: true }, { e: [26, 11, 2.6, 2], r: P('cheese', 4), g: 'f', soft: true },   // the curl of the crest
    { e: [9, 13, 2.2, 1.7], r: [0xc08a18, 0x8a5a12], noLine: true }, { e: [18, 14, 2.8, 2], r: [0xc08a18, 0x8a5a12], noLine: true },
    { l: [[4, 14], [8, 9], [13, 6]], c: 0xfff6c0, w: 1, m: true }, specks(2, 4, 28, 19, 12, 0x8a5a12, 121)]];
  DEFS.pp_dome = [40, 26, () => [
    { p: [[1, 26], [1, 22], [39, 22], [39, 26]], r: P('stone', 1, 5), bulge: 0.3 },
    { e: [20, 23, 18.5, 17.5], r: P('cheese', 1) },
    { p: [[0, 23], [40, 23], [40, 40], [0, 40]], r: [0x1a1020], noLine: true },
    { p: [[1, 22], [39, 22], [39, 26], [1, 26]], r: P('stone', 1, 5), bulge: 0.3 },
    ...[8, 14, 20, 26, 32].map(x => ({ l: [[20, 6], [x, 21]], c: 0x8a5a12, w: 1, m: true })),                                                                      // the dome's ribs
    { e: [20, 5, 2.4, 2.4], r: P('cheese', 2) }, crack([[26, 9], [28, 13], [25, 16], [28, 20]], 0x5a3410), { p: [[31, 12], [36, 15], [33, 18]], r: [0x5a3410], noLine: true },   // a finial, a crack, a hole
    specks(2, 6, 38, 22, 16, 0xfff6c0, 131), specks(2, 22, 38, 26, 8, 0x5e5048, 132)]];
  DEFS.sf_bug_ball = [28, 28, () => [
    { e: [14, 14, 13, 13], r: P('red', 1, 6) },
    ...[-0.9, -0.3, 0.3, 0.9].map(a => ({ l: Array.from({ length: 9 }, (_, i) => { const t = (i / 8 - 0.5) * 2.2; return [14 + Math.sin(a + t * 0.35) * 12.5 * Math.cos(t * 0.55) + Math.sin(a) * 3, 14 + Math.sin(t) * 12.4]; }), c: 0x6e1224, w: 1, m: true })),   // the plates of its shell
    { e: [9, 8, 3, 2], rot: -0.6, r: [0xffa890, 0xff6a50], noLine: true }, specks(3, 3, 25, 25, 14, 0x6e1224, 141), specks(3, 3, 25, 14, 6, 0xffa890, 142)]];
  // ---------------------------------------------------------------- Mount Mozzarella's melted hills
  const mozz = (w, h, base, top, peaks, seed) => [w, h, () => {
    const C = P('cream', 1), r = rng(seed), prof = [[0, base + 4]];
    const H = x => { let v = 0; for (const [px, ph, pw] of peaks) v = Math.max(v, ph * Math.exp(-Math.pow((x - px) / pw, 2))); return v * (base - top) * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, x / w))), 0.35); };
    for (let x = 0; x <= w; x += 3) prof.push([x, base - H(x) + Math.sin(x * 0.45 + seed) * 1.2]);
    prof.push([w, base + 4]);
    const sh = [{ p: prof, r: C, bulge: 0.85, grain: 0.1 }];
    for (const [px, ph, pw] of peaks) { const y = base - ph * (base - top) * 0.45; sh.push({ e: [px + pw * 0.5, y + 6, pw * 0.7, (base - y) * 0.45], r: C, g: 'fold', soft: true, lift: -0.06, grain: 0.1 }); }   // a sagging fold under each peak
    for (let i = 0; i < Math.round(w / 12); i++) { const x = 6 + r() * (w - 12), y0 = base - H(x) * (0.25 + r() * 0.5), len = 5 + r() * 11; sh.push({ l: [[x, y0], [x + (r() - 0.5) * 2, y0 + len]], c: C[0], w: 1.5, m: true }, { l: [[x + 1.5, y0 + 1], [x + 1.5, y0 + len + 1]], c: C[3], w: 1, m: true }); }   // strings of cheese running down it
    for (let i = 0; i < Math.round(w / 13); i++) { const x = 8 + r() * (w - 16), y = base - 3 - H(x) * r() * 0.75, rx = 3 + r() * 5; sh.push({ l: [[x - rx, y], [x + rx, y + (r() - 0.5) * 2]], c: 0xa86a34, w: 2 + r() * 2, m: true }, { l: [[x - rx * 0.6, y - 1], [x + rx * 0.6, y - 1]], c: 0xd4985a, w: 1, m: true }); }   // toasted patches
    sh.push(specks(1, 1, w - 1, base, Math.round(w * base / 60), 0x8a6a40, seed + 1), specks(1, 1, w - 1, base * 0.7, Math.round(w * base / 90), 0xfff2cc, seed + 2));
    return sh;
  }, base];
  DEFS.mozzmtn1 = mozz(132, 82, 78, 10, [[40, 0.75, 26], [86, 1, 30]], 151);
  DEFS.mozzmtn2 = mozz(92, 104, 96, 10, [[46, 1, 22], [22, 0.5, 16], [72, 0.45, 14]], 157);
  DEFS.mozzmtn4 = mozz(84, 76, 68, 8, [[34, 1, 22], [62, 0.6, 14]], 163);

  // paint them all (once), over the old ones
  function make(scene) {
    if (scene.registry.get('reartDone') || typeof BA === 'undefined') return;
    scene.registry.set('reartDone', true);
    for (const key in DEFS) {
      const [w, h, shapes, cut] = DEFS[key];
      try {
        BA.paint(scene, key, w, h, shapes());
        if (cut) {                                              // (the hills: everything below the base line is cut away)
          const t = scene.textures.get(key), cv = t.getSourceImage(), ctx = cv.getContext('2d'); ctx.clearRect(0, cut, w, h - cut); t.refresh();
        }
        SPRITE_FILES.add(key); if (typeof Pal !== 'undefined') Pal.done.add(key);
      } catch (e) { console.warn('[reart]', key, e); }
    }
  }
  return { make, keys: Object.keys(DEFS) };
})();
