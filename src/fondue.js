// LEVEL 5.5 (secret warp): THE FORBIDDEN FONDUE FOUNTAIN - a gilded banquet fountain in a purple party nebula.
//
//  LOOK        a polished gold fountain-basin planet with pools of fondue, party lights strung across the sky, rat
//              bunting on poles, a towering tiered fountain spire spurting cheese on the horizon, fountain tiers in
//              the distance (depth.js 'tiers'), forks/skewers/goblets up against the camera ('banquet').
//  CURTAINS    waterfalls of hot cheese pour down out of the sky at fixed spots: a drip (warning), a heavy pour (it
//              burns), then a gap to sprint through. A BASH swipe next to one parts it for a moment.
//  CROUTONS    floating crouton ledges over the fondue pools go SOGGY: stand on one ~1 s and it sinks into the
//              pool, popping back up a few seconds later. Skewers are solid ledges.
//  ENEMIES     FORK FANATICS - party rats that pole-vault right over you on their fondue forks, then lance-charge.
//              THE DIPPED - soggy food blobs that drag themselves out of the pools, lob dripping debris, and burst
//                into STICKY puddles (they slow you) when killed.
//              KAMIKAZE CROUTONS - toast missiles that lock on and dive into the fondue: a wave rolls round the
//                planet both ways (jump it).
//              SKIMMERS - darting robot flies with toothpicks that fire spirals of cheese drops.
//  BOSS        LE GRAND FROMAGE - a pompous rat aristocrat riding a giant fondue pot: lances you with a huge fork,
//              tips the pot to send a flood round the planet, and rains croutons. The pot's too hot to stand on.
//              ACT 2: the pot cracks and shatters - he fights on foot (fork charges, leaping slams) and CAN be stomped.
//
// Mixed into Level1; level state in this.fd, the boss's in e.gfS.

// THE PLANET: a polished gold-and-silver fountain basin (not a rock): riveted panels in two rows, a channel of bubbling
// fondue round the crust between bronze posts, engraved rings further in. (The gilded rim itself is depth.js 'ornate'.)
function makeFountainPlanet(scene, key, Rw, pal, seed) {
  if (scene.textures.exists(key)) return;
  const S = Math.round(Rw), c = S / 2, hex = v => [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  const GOLD = pal.map(hex), SIL = [0x2a3040, 0x5a6272, 0x8a94a4, 0xbcc6d4, 0xe4ecf6, 0xffffff].map(hex), CH = [0x7a3a06, 0xc8741a, 0xf0a828, 0xffd050, 0xffeea0].map(hex);
  const OUT = hex(0x2a1404);
  let sd = seed || 7; const rand = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  const bubbles = []; for (let i = 0; i < 260; i++) bubbles.push({ a: rand() * Math.PI * 2, d: 0.912 + rand() * 0.034, r: 0.6 + rand() * 1.6 });
  const tex = scene.textures.createCanvas(key, S, S), ctx = tex.getContext(), img = ctx.createImageData(S, S), D = img.data;
  const tone = (arr, v, th) => arr[Math.max(0, Math.min(arr.length - 1, Math.floor(v) + ((v - Math.floor(v)) > th ? 1 : 0)))];
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = x + 0.5 - c, dy = y + 0.5 - c, d = Math.hypot(dx, dy) / c;
    if (d > 1) continue;
    const th = BAYER4[(y & 3) * 4 + (x & 3)], ang = Math.atan2(dy, dx), lit = (-dx - dy) / S, i = (y * S + x) * 4;
    let col;
    if (d > 0.986) col = OUT;
    else if (d > 0.955) col = GOLD[3];                                              // (under the gilded rim)
    else if (d > 0.905) {                                                           // the FONDUE CHANNEL, between bronze posts
      const seg = ang / (Math.PI * 2) * 48 + 48, f = seg - Math.floor(seg);
      if (d > 0.949 || d < 0.911) col = d > 0.949 ? GOLD[1] : GOLD[5];               // basin lips
      else if (f < 0.1) col = f < 0.03 ? GOLD[5] : (f < 0.07 ? GOLD[3] : GOLD[1]);  // a post
      else {
        const v = 2.2 + Math.sin(ang * 260 + d * 300) * 0.6 + Math.sin(ang * 77 - d * 140) * 0.4 + (0.95 - d) * 14;
        col = tone(CH, v, th);
      }
    } else if (d > 0.79) {                                                          // riveted panels, gold and silver in two rows
      const row = d > 0.85 ? 0 : 1, n = row ? 40 : 48, seg = ang / (Math.PI * 2) * n + n, k = Math.floor(seg), f = seg - k;
      const P2 = (k + row) % 2 ? SIL : GOLD, v = 2.6 + lit * 2.4 + Math.sin(d * 140) * 0.35 + (f - 0.5) * 0.6;
      const edge = Math.abs(d - 0.85) < 0.004 || d < 0.794 || d > 0.901;
      if (edge) col = GOLD[0];
      else if (f < 0.035) col = P2[0];                                              // seam
      else if (f < 0.07) col = P2[5 - (P2 === SIL ? 0 : 0)];                        // lit seam edge
      else col = tone(P2, v, th);
      const rv = Math.min(f, 1 - f), dv = row ? Math.min(d - 0.794, 0.85 - d) : Math.min(d - 0.85, 0.901 - d);
      if (rv < 0.16 && rv > 0.08 && dv > 0.008 && dv < 0.018) col = rv < 0.12 && dv < 0.013 ? GOLD[5] : GOLD[0];   // rivets in the corners
    } else {                                                                        // engraved bronze, deeper in
      const fb = d * 26 - Math.floor(d * 26), fil = Math.sin(ang * 16 + Math.sin(d * 40) * 2.5);
      let v = 1.6 + lit * 2 + (fb < 0.12 ? 1.2 : 0) + (Math.abs(fil) < 0.08 ? 1 : 0);
      col = tone(GOLD, v, th);
    }
    D[i] = col[0]; D[i + 1] = col[1]; D[i + 2] = col[2]; D[i + 3] = 255;
  }
  for (const b of bubbles) {                                                        // bubbles in the fondue
    const bx = c + Math.cos(b.a) * b.d * c, by = c + Math.sin(b.a) * b.d * c, seg = b.a / (Math.PI * 2) * 48 + 48;
    if (seg - Math.floor(seg) < 0.14) continue;
    for (let y = Math.floor(by - b.r - 1); y <= by + b.r + 1; y++) for (let x = Math.floor(bx - b.r - 1); x <= bx + b.r + 1; x++) {
      const q = Math.hypot(x + 0.5 - bx, y + 0.5 - by); if (q > b.r + 0.5) continue;
      const col = q > b.r - 0.6 ? CH[4] : CH[2], i = (y * S + x) * 4; D[i] = col[0]; D[i + 1] = col[1]; D[i + 2] = col[2];
    }
  }
  ctx.putImageData(img, 0, 0); tex.refresh(); tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

function makeFondueTextures(scene) {
  const GOLD = [0xfff0a0, 0xf0c040, 0xa87818], SIL = [0xf4f8ff, 0xb8c0cc, 0x6a7280], CH = [0xfff4b0, 0xffc83a, 0xd88a1a];
  const RAT = [0xc8b8b0, 0x8a7a74, 0x4a3e3c], PINK = 0xffa8b8, DARK = 0x1a1018;
  const rat = (p, x, y, s) => {                                  // a little party rat: body, head, ear, tail, red bandana
    p.ell(x, y, 9 * s, 7 * s, RAT); p.ell(x + 8 * s, y - 6 * s, 6 * s, 5 * s, RAT);
    p.ell(x + 6 * s, y - 11 * s, 3 * s, 3 * s, [0xffd0d8, PINK, 0xc87888]);
    p.px(Math.round(x + 10 * s), Math.round(y - 7 * s), DARK); p.px(Math.round(x + 14 * s), Math.round(y - 5 * s), PINK);
    p.line([[x - 9 * s, y], [x - 15 * s, y - 4 * s], [x - 18 * s, y - 2 * s]], PINK);
    p.rect(Math.round(x + 3 * s), Math.round(y - 10 * s), Math.round(x + 12 * s), Math.round(y - 8 * s), 0x9a3ae8);
  };
  const fork = (p, x0, y0, x1, y1) => {                          // a long two-pronged fondue fork
    p.line([[x0, y0], [x1, y1]], SIL[1], 2);
    const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a);
    for (const sd of [-2, 2]) p.line([[x1 + nx * sd, y1 + ny * sd], [x1 + nx * sd + Math.cos(a) * 7, y1 + ny * sd + Math.sin(a) * 7]], SIL[0]);
    p.rect(Math.round(x0) - 1, Math.round(y0) - 1, Math.round(x0) + 2, Math.round(y0) + 2, 0x8a4a2a);
  };
  // (the Fork Fanatic, Skimmer and Kamikaze Crouton are drawn in toons.js)
  pixSprite(scene, 'dipped', 46, 40, p => {                      // a soggy mutant of food that fell in years ago
    const MOULD = [0xb8d860, 0x6a9a2a, 0x2e4a12];
    p.ell(23, 24, 20, 15, MOULD);
    for (const [x, y, r] of [[30, 18, 3], [16, 30, 2.5], [36, 28, 2], [22, 14, 2]]) p.ell(x, y, r, r, 0x1e3a0a);   // dark rot spots
    for (const [x, y] of [[33, 21], [11, 27], [27, 34]]) p.ell(x, y, 2, 1.5, [0xd8ff8a, 0x9aff4a, 0x4aa82a]);   // toxic green blisters
    p.ell(12, 13, 8, 5, [0xd8a0ff, 0x9a4ae0, 0x4a1a8a]); p.rect(10, 16, 14, 21, 0xe8d8f0);   // a purple toadstool cap stuck on top
    p.px(9, 11, 0xffffff); p.px(15, 12, 0xffffff);
    p.rrect(30, 26, 38, 33, 2, [0xb06048, 0x7a3a2a, 0x4a2018]);                             // a lump of meat
    p.ell(26, 12, 4, 3, [0x9ad86a, 0x5aa83a, 0x2a6a1a]);                                    // a mouldy sprout
    p.ell(17, 24, 3, 3, 0xffffff); p.px(17, 24, DARK); p.ell(26, 22, 2, 2, 0xffffff); p.px(26, 22, DARK);
    p.ell(21, 31, 4, 3, DARK); p.px(19, 30, 0xffffff);                                      // screaming
    for (const [x, l] of [[6, 6], [14, 8], [30, 7], [40, 5]]) p.line([[x, 34], [x, 34 + l]], CH[1], 2);
  });
  pixSprite(scene, 'crouton', 14, 12, p => { p.rrect(1, 1, 12, 10, 2, [0xf6d090, 0xc88a3a, 0x7a4a14]); p.px(4, 4, 0xfff0c0); p.px(9, 7, 0x8a5a24); });
  pixSprite(scene, 'fdrop', 8, 10, p => { p.ell(4, 6, 3, 3.5, CH); p.poly([[2, 4], [6, 4], [4, 0]], CH); p.px(3, 5, 0xffffff); });
  // platforms
  pixSprite(scene, 'pl_crouton', 124, 30, p => {
    p.rrect(4, 4, 119, 26, 6, [0xf6d090, 0xc88a3a, 0x7a4a14]);
    p.rrect(10, 8, 113, 22, 4, [0xfff0c0, 0xf0d098, 0xc8a060]);
    for (const [x, y] of [[20, 12], [44, 16], [70, 11], [92, 17], [108, 13], [32, 19], [60, 20]]) p.ell(x, y, 2, 1.5, 0xb88a4a);
  });
  pixSprite(scene, 'pl_skewer', 124, 26, p => {
    p.line([[0, 8], [123, 8]], SIL[1], 2); p.ell(121, 8, 3, 3, SIL);
    const bits = [[14, [0xb06048, 0x7a3a2a, 0x4a2018]], [34, [0x8ae05a, 0x4aa83a, 0x2a6a1a]], [54, [0xff6a4a, 0xd0301a, 0x7a1010]], [74, [0xf0e0d0, 0xc8b4a0, 0x8a7460]], [94, [0xb06048, 0x7a3a2a, 0x4a2018]]];
    for (const [x, c] of bits) p.rrect(x - 8, 2, x + 8, 20, 3, c);
  });
  // props
  pixSprite(scene, 'p_bunting', 76, 72, p => {                   // two poles strung with rat-face bunting
    p.rect(2, 4, 4, 71, GOLD[1]); p.rect(71, 10, 73, 71, GOLD[1]); p.ell(3, 3, 3, 3, GOLD); p.ell(72, 9, 3, 3, GOLD);
    const pts = []; for (let k = 0; k <= 10; k++) { const x = 4 + k * 6.7; pts.push([x, 8 + Math.sin(k / 10 * Math.PI) * 10 + k * 0.6]); }
    p.line(pts, 0x8a6a4a);
    const cols = [[0xff6a8a, 0xe02a4a, 0x8a1020], [0xffe080, 0xf0b020, 0x8a6010], [0x9ad8ff, 0x3a9ae0, 0x1a4a8a], [0xc89aff, 0x8a4ae0, 0x4a2a8a]];
    for (let k = 0; k < 9; k++) { const [x, y] = pts[k + 1]; p.poly([[x - 3, y], [x + 3, y], [x, y + 9]], cols[k % 4]); p.px(Math.round(x), Math.round(y + 3), DARK); }
  });
  // circus BIG TOPS: red-and-white striped cones, a scalloped valance, striped walls, the entrance curtains drawn back
  // the CIRCUS: one cluster of big tops way off on the horizon (screen space, behind the planet, like the fountain spire)
  const drawTent = (p, ox, oy, W, H, o) => {
    const cx = ox + W / 2, apex = oy + o.apex, eave = oy + o.eave, wallT = eave + 7, base = oy + H, R3 = o.roof, W3 = o.wall, foot = base + 70;   // walls run on down below the horizon
    p.line([[cx, oy], [cx, apex + 2]], 0x6a4a2a, 2);                                            // flagpole and pennant
    p.poly([[cx + 1, oy + 1], [cx + 14, oy + 4], [cx + 1, oy + 8]], o.flag);
    for (let y = apex + 2; y <= eave; y++) {                                                    // the roof: stripes fanning from the apex
      const half = (y - apex) / (eave - apex) * (W / 2 - 2);
      for (let x = Math.ceil(cx - half); x <= cx + half; x++) {
        const u = (x - cx) / Math.max(1, y - apex + 2), st = ((Math.floor(u * o.fan + 30)) % R3.length + R3.length) % R3.length, edge = Math.abs(x - cx) / Math.max(1, half);
        const T = (o.cap && y < apex + o.cap) ? o.capC[st % 2] : R3[st];
        p.px(x, y, edge > 0.84 ? T[2] : (edge < 0.25 && y < eave - 6 ? T[0] : T[1]));
      }
    }
    const sc = o.scallop, wl = ox + 5, wr = ox + W - 5, V = o.val || R3;
    for (let x = wl - 2; x <= wr + 2; x++) {                                                    // the scalloped valance
      const k = Math.floor((x - wl + 2) / sc), f = ((x - wl + 2) % sc) / sc, drop = Math.sqrt(Math.max(0, 1 - Math.pow(f * 2 - 1, 2))) * 5;
      for (let y = eave; y <= eave + 2 + drop; y++) p.px(x, y, V[k % V.length][y === Math.floor(eave + 2 + drop) ? 2 : 1]);
      p.px(x, eave, 0xffd040);
      if (o.bulbs && Math.abs(f - 0.5) < 0.05) p.px(x, eave + 2, o.bulbs[k % o.bulbs.length]);
    }
    for (let y = wallT; y < foot; y++) for (let x = wl; x <= wr; x++) {                          // striped walls, shaded like a drum
      const k = Math.floor((x - wl) / o.stripe), e = Math.abs(x - cx) / (W / 2 - 5), T = W3[k % W3.length];
      p.px(x, y, e > 0.82 ? T[2] : (e < 0.3 ? T[0] : T[1]));
    }
    if (o.deco) for (let k = 0; k * o.stripe < wr - wl; k++) {                                  // little round medallions on every other panel
      if (k % 2) continue; const x = wl + k * o.stripe + o.stripe / 2; if (Math.abs(x - cx) < o.door + 4) continue;
      for (let y = wallT + 6; y < base - 4; y += 9) p.ell(x, y, 1.6, 1.6, [0xff8a6a, 0xd0302a, 0x7a1010]);
    }
    const dw = o.door, dt = base - o.doorH, CU = o.curt || R3[0];                                // the entrance, curtains tied back with gold rope
    for (let y = dt; y < foot; y++) for (let x = cx - dw; x <= cx + dw; x++) { const ay = dt + 6 - Math.sqrt(Math.max(0, dw * dw - (x - cx) * (x - cx))) * 6 / dw; if (y >= ay) p.px(x, y, 0x2a0a1a); }
    if (o.inner) { p.poly([[cx - dw + 2, dt + 3], [cx - 2, dt + 3], [cx - dw + 2, base - 1]], o.inner); p.poly([[cx + dw - 2, dt + 3], [cx + 2, dt + 3], [cx + dw - 2, base - 1]], o.inner); }
    p.poly([[cx - dw, dt + 2], [cx - dw + (o.inner ? 6 : dw - 2), dt + 2], [cx - dw, base - 1]], CU); p.poly([[cx + dw, dt + 2], [cx + dw - (o.inner ? 6 : dw - 2), dt + 2], [cx + dw, base - 1]], CU);
    p.line([[cx - dw, dt + o.doorH * 0.55], [cx - dw + 5, dt + o.doorH * 0.5]], 0xffd040, 2); p.line([[cx + dw, dt + o.doorH * 0.55], [cx + dw - 5, dt + o.doorH * 0.5]], 0xffd040, 2);
  };
  const RED = [0xff6a6a, 0xe02a2a, 0x8a1010], WHT = [0xffffff, 0xf0e8e0, 0xb8a8a0];
  const BLU = [0x8ae0ff, 0x2a9ad0, 0x14507a], YEL = [0xfff08a, 0xffc832, 0xb07a10], ORA = [0xffb060, 0xf07a1a, 0x9a3a0a];
  pixSprite(scene, 'fcircus', 320, 236, p => {
    drawTent(p, 2, 30, 100, 128, { apex: 10, eave: 50, fan: 3, roof: [RED, WHT], wall: [RED, WHT], scallop: 10, stripe: 8, door: 10, doorH: 26, flag: 0xffd040 });            // red-and-white tents either side...
    drawTent(p, 218, 34, 100, 124, { apex: 10, eave: 48, fan: 3, roof: [RED, WHT], wall: [WHT, RED], scallop: 10, stripe: 8, door: 9, doorH: 24, flag: 0x9a3ae8 });
    drawTent(p, 88, 8, 144, 150, { apex: 12, eave: 70, fan: 3.4, roof: [BLU, YEL, ORA, YEL], cap: 18, capC: [RED, ORA], wall: [ORA, BLU], val: [ORA], bulbs: [0xff3a5a, 0x5ad8ff, 0xffe040, 0x7dff8a],
      scallop: 9, stripe: 13, door: 11, doorH: 34, curt: BLU, inner: RED, deco: true, flag: 0xf07a1a });                                                                   // ...and the big blue-and-gold top in the middle
    const poles = [[80, 52], [116, 64], [204, 64], [240, 50], [8, 92], [312, 96]];
    for (const [x, y] of poles) { p.line([[x, y], [x, 235]], 0xb07a3a, 1); p.ell(x, y - 3, 4, 4.5, [0xff8a6a, 0xe0402a, 0x8a1a10]); p.line([[x, y - 8], [x, y - 11]], 0xffd040); }   // lantern poles
    const flagC = [[0xff6a8a, 0xe02a4a, 0x8a1020], [0xfff08a, 0xffc832, 0xb07a10], [0x8ae0ff, 0x2a9ad0, 0x14507a], [0xffb060, 0xf07a1a, 0x9a3a0a]];
    const string = (a, b, n) => { for (let k = 0; k <= n; k++) { const t = k / n, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * 8; p.px(Math.round(x), Math.round(y), 0x5a3a2a); if (k % 3 === 1 && k < n) p.poly([[x - 2, y], [x + 2, y], [x, y + 5]], flagC[k % 4]); } };
    string([8, 92], [80, 52], 36); string([80, 52], [116, 64], 24); string([204, 64], [240, 50], 24); string([240, 50], [312, 96], 36);
  });
  pixSprite(scene, 'p_goblet', 22, 34, p => { p.poly([[2, 2], [20, 2], [16, 14], [6, 14]], GOLD); p.ell(11, 3, 9, 2, CH); p.rect(10, 14, 12, 28, GOLD[1]); p.ell(11, 30, 7, 3, GOLD); });
  pixSprite(scene, 'p_mushroom', 22, 18, p => { p.ell(11, 8, 10, 7, [0xf6eadc, 0xd8c4b0, 0x9a8470]); p.rect(8, 10, 14, 17, 0xf0e4d4); p.px(7, 5, 0xffffff); });
  // the great fountain spire on the horizon (screen space)
  pixSprite(scene, 'fspire', 150, 190, p => {
    p.rect(66, 30, 84, 189, GOLD[1]); p.rect(70, 30, 74, 189, 0xfff8c8);                       // the column
    for (const [y, w] of [[60, 34], [110, 52], [160, 70]]) { p.ell(75, y, w, 9, GOLD); p.ell(75, y - 3, w - 4, 5, CH); p.rect(75 - w, y, 75 + w, y + 3, GOLD[2]); }   // basins full of fondue
    for (const [x, y, l] of [[44, 63, 40], [104, 63, 44], [26, 113, 42], [124, 113, 40], [10, 163, 26], [140, 163, 26]]) p.line([[x, y], [x, y + l]], CH[1], 3);   // cheese pouring off them
    p.ell(75, 26, 12, 8, GOLD); p.ell(75, 20, 6, 6, CH);
  });
  // LE GRAND FROMAGE: the pot, the rat, his fork, and the rat on foot (act 2)
  pixSprite(scene, 'gf_pot', 124, 84, p => {
    const CU = [0xffb070, 0xd0703a, 0x7a3418];
    p.poly([[10, 22], [114, 22], [104, 70], [20, 70]], CU);                                  // copper pot
    p.rect(12, 18, 112, 26, [0xffd0a0, 0xe08a4a, 0x8a4420][1]); p.rect(12, 18, 112, 20, 0xffe0c0);   // rim
    p.ell(62, 20, 48, 6, CH);                                                                 // bubbling fondue
    for (const [x, y] of [[40, 19], [70, 18], [88, 20], [54, 21]]) p.ell(x, y, 3, 2, 0xfff8d0);
    p.line([[10, 30], [0, 34], [4, 42]], 0x4a2a1a, 3); p.line([[114, 30], [123, 34], [119, 42]], 0x4a2a1a, 3);   // handles
    for (const [x, l] of [[30, 10], [48, 6], [80, 12], [96, 7]]) p.line([[x, 24], [x, 24 + l]], CH[1], 2);       // drips over the side
    p.rect(30, 70, 94, 74, 0x3a3a44); p.rect(36, 74, 40, 80, 0x3a3a44); p.rect(84, 74, 88, 80, 0x3a3a44);   // the stand
    for (let k = 0; k < 5; k++) p.poly([[42 + k * 10, 82], [46 + k * 10, 82], [44 + k * 10, 74]], [0xfff0a0, 0x5ac8ff, 0x1a6ab0]);   // blue burner flames
  });
  pixSprite(scene, 'gf_rat', 64, 62, p => {                     // pompous rat aristocrat: top hat, monocle, moustache, red coat
    p.poly([[14, 60], [16, 34], [48, 34], [50, 60]], [0xff6a5a, 0xd02a2a, 0x7a1010]); p.rect(30, 36, 34, 60, 0xffd040);   // coat, gold buttons line
    p.poly([[28, 34], [36, 34], [32, 44]], 0xffffff);                                         // cravat
    p.ell(32, 24, 14, 11, RAT); p.ell(20, 14, 5, 5, [0xffd0d8, PINK, 0xc87888]); p.ell(44, 14, 5, 5, [0xffd0d8, PINK, 0xc87888]);
    p.ell(32, 31, 4, 3, PINK); p.line([[24, 31], [16, 29]], DARK); p.line([[40, 31], [48, 29]], DARK);   // nose and moustache
    p.ell(26, 24, 2, 2, DARK); p.ell(38, 24, 4, 4, [0xe0f0ff, 0xa0b8d0, 0x5a6a80]); p.ell(38, 24, 2, 2, DARK); p.line([[42, 26], [44, 34]], 0xffd040);   // eye, monocle on a chain
    p.rect(22, 2, 42, 12, DARK); p.rect(18, 11, 46, 13, DARK); p.rect(22, 9, 42, 10, 0xd02a2a);   // top hat with a red band
  });
  pixSprite(scene, 'gf_fork', 120, 12, p => { p.rect(0, 4, 18, 8, 0x6a3a1a); p.rect(18, 5, 104, 7, SIL[1]); p.rect(18, 5, 104, 5, SIL[0]); for (const y of [2, 9]) p.rect(102, y, 119, y + 1, SIL[0]); p.rect(102, 2, 104, 10, SIL[1]); });
  pixSprite(scene, 'gf_ratbig', 70, 96, p => {
    p.poly([[18, 92], [16, 46], [54, 46], [52, 92]], [0xff6a5a, 0xd02a2a, 0x7a1010]); p.rect(33, 48, 37, 90, 0xffd040);
    p.rect(20, 88, 30, 95, DARK); p.rect(42, 88, 52, 95, DARK);                              // boots
    p.poly([[30, 46], [40, 46], [35, 56]], 0xffffff);
    p.ell(35, 34, 16, 13, RAT); p.ell(21, 22, 6, 6, [0xffd0d8, PINK, 0xc87888]); p.ell(49, 22, 6, 6, [0xffd0d8, PINK, 0xc87888]);
    p.ell(35, 42, 5, 3, PINK); p.line([[26, 42], [16, 39]], DARK); p.line([[44, 42], [54, 39]], DARK);
    p.line([[24, 31], [32, 34]], DARK, 2); p.line([[46, 31], [38, 34]], DARK, 2);              // furious now
    p.ell(29, 35, 2, 2, 0xff3a3a); p.ell(41, 35, 2, 2, 0xff3a3a);
    p.rect(26, 6, 44, 18, DARK); p.rect(22, 17, 48, 19, DARK); p.line([[26, 10], [44, 14]], 0x6a6a74);   // a dented hat
    p.line([[1, 70], [16, 60]], RAT[1], 3);                                                  // tail
  });
}

const FD_FAR_K = 0.45, FD_SPOUT = 245, FD_ZIP = 340;   // curtain spout height, zipline speed

const FondueMixin = {
  fdInit() {
    const F = this.fd = { curtains: [], waves: [], puddles: [], t: 0, lastTh: null };   // (called from create before Chris exists)
    (this.def.curtains || []).forEach((th, i) => F.curtains.push({ theta: th, st: 'idle', t: rnd(0.5, 3) + i * 0.4, part: 0, w: 16 }));
    F.g = this.add.graphics().setDepth(6.7);                                            // curtains, waves, puddles
    F.gl = this.add.graphics().setDepth(7.62).setBlendMode(Phaser.BlendModes.ADD);
    F.lights = this.add.graphics().setDepth(0.42);                                     // party lights strung across the sky
    F.lightsGl = this.add.graphics().setDepth(0.43).setBlendMode(Phaser.BlendModes.ADD);
    F.spire = this.add.image(0, 0, 'fspire').setDepth(0.35).setOrigin(0.5, 0.86);
    F.circus = this.add.image(0, 0, 'fcircus').setDepth(0.34).setOrigin(0.5, 158 / 236).setTint(0xd8ccf0);   // a big-top circus way off on the horizon
    F.spurt = [];
    for (const L of (this.def.ledges || [])) { if (L.h0 === undefined) L.h0 = L.h; L.h = L.h0; L.soak = 0; L.sunkT = 0; }
    return F;
  },

  fondueUpdate(dt, inp) {
    const F = this.fd || this.fdInit(), P = this.pl;
    inp = inp || {};
    F.t += dt;
    const grounded = P.h <= (P.floor || 0) + 0.5 && P.vh <= 0;
    // SKEWER ZIPLINES: jump up into one from underneath and Chris grabs it and slides along to the end (jump to let go)
    P.zipCd = Math.max(0, (P.zipCd || 0) - dt);
    if (P.zip) {
      const Z = P.zip, L = Z.L;
      Z.th = wrap(Z.th + Z.dir * FD_ZIP / R * dt);
      P.theta = Z.th; P.h = L.h - 54; P.vh = 0; P.facing = Z.dir; P.fuel = Math.min(1, P.fuel + dt * 0.5); P.vx = 0;
      if (Math.random() < dt * 30) this.burst(Z.th, L.h - 4, 'spark', 1, 0.4);
      const off = angDiff(Z.th, L.theta) * Z.dir, jumpPress = inp.jump && !Z.held;
      Z.held = !!inp.jump;
      if (off > L.half * 0.98 || jumpPress || inp.down || this.state !== 'play') {
        P.zip = null; P.zipCd = 0.45; P.vh = jumpPress ? CFG.jumpV : 160; P.jetArmed = false; P.holdT = 0;
        P.vx = Z.dir * FD_ZIP; Sound.sfx(jumpPress ? 'jump' : 'whoosh');
      }
    } else if (!grounded && P.vh > -80 && P.zipCd <= 0 && this.state === 'play') {
      for (const L of (this.def.ledges || [])) {
        if (L.type !== 'skewer' || Math.abs(angDiff(P.theta, L.theta)) > L.half * 0.9) continue;
        if (P.h + 54 >= L.h - 22 && P.h + 54 <= L.h + 14) {
          const dir = P.facing || 1;
          P.zip = { L, th: P.theta, dir, held: !!inp.jump };
          Sound.sfx('clunk'); this.burst(P.theta, L.h - 4, 'spark', 6, 0.6);
          if (!this.zipTip) { this.zipTip = true; this.banner('SKEWER ZIPLINE!\nJUMP TO LET GO'); }
          break;
        }
      }
    }
    // CROUTON BOUNCE: land on a crouton and it squishes and springs you up high - but every bounce soaks it a bit more
    const onCrouton = grounded && P.floor > 0 && (this.def.ledges || []).find(L => L.sink && Math.abs(P.floor - L.h) < 1 && Math.abs(angDiff(P.theta, L.theta)) < L.half);
    if (onCrouton && (F.lastVh || 0) < -150 && !inp.down) {
      P.vh = Math.min(820, CFG.jumpV * 1.05 + Math.abs(F.lastVh) * 0.3); P.h += 1; P.springT = 0.6; P.jetArmed = false; P.holdT = 0;
      onCrouton.soak += 0.32; onCrouton.squash = 1; Sound.sfx('bonk'); Sound.sfx('squish');
      this.burst(P.theta, onCrouton.h, 'crumb', 6, 0.7);
      if (!this.bounceTip) { this.bounceTip = true; this.banner('BOUNCY CROUTONS!\nHOLD DOWN TO LAND SOFTLY'); }
    }
    F.lastVh = P.vh;
    for (const L of (this.def.ledges || [])) if (L.squash) L.squash = Math.max(0, L.squash - dt * 4);
    // CURTAINS of hot cheese
    for (const C of F.curtains) {
      C.t -= dt; C.part = Math.max(0, C.part - dt);
      if (C.t <= 0) {
        if (C.st === 'idle') { C.st = 'warn'; C.t = 1.0; if (Math.abs(angDiff(C.theta, P.theta)) < this.visHalf) Sound.sfx('alarm'); }
        else if (C.st === 'warn') { C.st = 'pour'; C.t = rnd(1.8, 2.6); if (Math.abs(angDiff(C.theta, P.theta)) < this.visHalf) Sound.sfx('splat'); }
        else { C.st = 'idle'; C.t = rnd(1.6, 3.2); }
      }
      if (C.st === 'warn' && Math.random() < dt * 18) this.burst(C.theta, FD_SPOUT - 30, 'spark', 1, 0.5);   // sparks spit from the spout
      if (C.st === 'pour' && C.part <= 0 && P.invuln <= 0 && this.state === 'play' && P.h < FD_SPOUT - 40 && Math.abs(angDiff(P.theta, C.theta)) * R < C.w + 8) { this.hurt(); P.vx = (Math.sign(angDiff(P.theta, C.theta)) || 1) * 220; }
      if (C.st === 'pour' && C.part <= 0) {                                   // the splash zone: drops fly, steam rises
        if (Math.random() < dt * 30) this.burst(wrap(C.theta + rnd(-12, 12) / R), 4, 'fdrop', 1, 0.7);
        if (Math.random() < dt * 9) { const im = this.add.image(0, 0, 'puff').setDepth(6.6).setTint(0xfff4d0).setAlpha(0.55); im.bsx = im.bsy = rnd(0.25, 0.45); this.parts.push({ theta: wrap(C.theta + rnd(-30, 30) / R), h: 6, vt: rnd(-20, 20), vh: rnd(50, 90), life: rnd(0.8, 1.2), noGrav: true, grow: 1.4, spr: im }); }
      }
    }
    // soggy CROUTON ledges sink when you stand on them, then bob back up
    for (const L of (this.def.ledges || [])) {
      if (!L.sink) continue;
      const on = grounded && P.floor > 0 && Math.abs(P.floor - L.h) < 1 && Math.abs(angDiff(P.theta, L.theta)) < L.half;
      if (L.sunkT > 0) { L.sunkT -= dt; if (L.sunkT <= 0) L.h = -1; continue; }
      if (on) L.soak += dt; else L.soak = Math.max(0, L.soak - dt * 0.4);
      if (L.soak > 0.9) { L.h -= 80 * dt; if (Math.random() < dt * 20) this.burst(L.theta, L.h, 'fdrop', 1, 0.5); if (L.h < 4) { L.h = -200; L.sunkT = 3; L.soak = 0; Sound.sfx('squelch'); } }
      else if (L.h < L.h0) { L.h = Math.min(L.h0, (L.h < 0 ? 0 : L.h) + 60 * dt); }
    }
    // fondue WAVES rolling round the planet (kamikaze croutons, the boss)
    for (let i = F.waves.length - 1; i >= 0; i--) { const Wv = F.waves[i]; Wv.t += dt; if (Wv.t > 4.2) F.waves.splice(i, 1); }
    if (F.waves.length && P.invuln <= 0 && this.state === 'play') { const L = this.fdWaveAt(P.theta); if (P.h < L - 4) { this.hurt(); P.vh = Math.max(P.vh, 380); } }
    // STICKY puddles (the Dipped burst into them): wading through one drags at you
    if (F.lastTh === null) F.lastTh = P.theta;
    const dTh = angDiff(P.theta, F.lastTh);
    for (let i = F.puddles.length - 1; i >= 0; i--) { const D = F.puddles[i]; D.life -= dt; if (D.life <= 0) F.puddles.splice(i, 1); }
    if (grounded && P.floor === 0 && F.puddles.some(D => Math.abs(angDiff(P.theta, D.theta)) < D.half)) { P.theta = wrap(F.lastTh + dTh * 0.45); if (!this.stickyTip) { this.stickyTip = true; this.banner('STICKY! JUMP OUT!'); } }
    // wading through a fondue pool: ripples spread out from Chris's legs
    F.ripples = F.ripples || [];
    F.ripT = (F.ripT || 0) - dt;
    if (P.goop && F.ripT <= 0) { F.ripT = Math.abs(dTh) > 1e-4 ? 0.12 : 0.4; F.ripples.push({ theta: P.theta, t: 0 }); if (Math.abs(dTh) > 1e-4) this.burst(P.theta, 4, 'fdrop', 1, 0.5); }
    for (let i = F.ripples.length - 1; i >= 0; i--) { F.ripples[i].t += dt; if (F.ripples[i].t > 0.8) F.ripples.splice(i, 1); }
    F.lastTh = P.theta;
    // the boss's parts go when he does
    if (F.boss && !this.enemies.includes(F.boss)) { this.gfParts(F.boss); F.boss = null; }
  },
  fdWaveAt(theta) {
    let L = 0;
    for (const Wv of this.fd.waves) {
      const d = Math.abs(angDiff(theta, Wv.theta)) * R, s = 330 * Wv.t, amp = Math.max(0, 1 - Wv.t / 4.2) * (Wv.amp || 44);
      L = Math.max(L, amp * Math.exp(-Math.pow((d - s) / 34, 2)));
    }
    return L;
  },
  fdWave(theta, amp) { const F = this.fd || this.fdInit(); F.waves.push({ theta, t: 0, amp: amp || 44 }); this.burst(theta, 6, 'fdrop', 18, 1.4); Sound.sfx('bigsplat'); this.cameras.main.shake(200, 0.008); },
  fdPuddle(theta) { const F = this.fd || this.fdInit(); F.puddles.push({ theta, half: 34 / R, life: 4 }); Sound.sfx('squelch'); this.burst(theta, 8, 'fdrop', 12, 1); },
  // BASH next to a pouring curtain parts it for a moment
  fondueBash() {
    const F = this.fd; if (!F) return;
    for (const C of F.curtains) if (C.st === 'pour' && Math.abs(angDiff(this.pl.theta, C.theta)) * R < 70) { C.part = 1.1; Sound.sfx('splat'); this.burst(C.theta, this.pl.h + 30, 'fdrop', 14, 1.6); this.popup(C.theta, this.pl.h + 60, 'PARTED!', '#ffd23f'); }
  },

  // ---- ENEMIES
  forkratAI(e, dt, P, dirP) {
    e.st = e.st || 'run'; e.cd = (e.cd === undefined ? rnd(1, 2) : e.cd) - dt;
    const d = angDiff(P.theta, e.theta), dist = Math.abs(d) * R;
    if (e.st === 'run') {
      e.dir = Math.sign(d) || 1; e.theta = wrap(e.theta + e.dir * 120 / R * dt); e.h = 0;
      e.spr.setTexture('forkrat0');
      if (dist < 230 && e.cd <= 0) { e.st = 'vault'; e.vh = 640; e.vt = e.dir * Math.max(260, dist * 1.4); Sound.sfx('jump'); }
    } else if (e.st === 'vault') {                                       // over your head on the fork...
      e.spr.setTexture('forkrat1'); e.vh -= 1300 * dt; e.h += e.vh * dt; e.theta = wrap(e.theta + e.vt / R * dt);
      if (e.h <= 0) { e.h = 0; e.st = 'lance'; e.cd = 0.25; e.dir = Math.sign(angDiff(P.theta, e.theta)) || 1; }
    } else if (e.st === 'lance') {                                       // ...lands, turns and charges with it levelled
      e.spr.setTexture('forkrat0'); e.cd -= 0;
      if (e.cd > 0) { e.spr.x += 0; } else { e.theta = wrap(e.theta + e.dir * 400 / R * dt); e.lanceT = (e.lanceT || 0) + dt; if (e.lanceT > 0.55) { e.st = 'run'; e.lanceT = 0; e.cd = rnd(1.6, 2.6); } }
    }
  },
  dippedAI(e, dt, P) {
    if (!e.emerged) {                                                    // haul itself out of the nearest pool
      e.emerged = true;
      const pools = (this.goops || []).filter(g => Math.abs(angDiff(g.theta, P.theta)) < 1.2);
      if (pools.length) e.theta = pools[Math.floor(Math.random() * pools.length)].theta;
      e.rise = 0; e.cd = 1.5;
    }
    e.rise = Math.min(1, (e.rise || 0) + dt / 0.9);
    e.h = -18 * (1 - e.rise); e.spr.sqy = 0.5 + 0.5 * e.rise;
    const d = angDiff(P.theta, e.theta); e.dir = Math.sign(d) || 1;
    if (e.rise >= 1) e.theta = wrap(e.theta + e.dir * 38 / R * dt);
    e.cd -= dt;
    if (e.cd <= 0 && e.rise >= 1) {                                      // lob a soggy dripping lump at you
      e.cd = rnd(1.8, 2.6);
      const T = 0.9, tx = d * R, b = this.addEBullet('crouton', e.theta, 30, tx / T, (0 - 30 + 0.5 * 700 * T * T) / T, 8, 3);
      b.grav = 700; b.spinV = 6; b.spr.setTint(0xffd060); Sound.sfx('splat');
    }
  },
  kamikazeAI(e, dt, P) {
    e.st = e.st || 'cruise';
    if (e.st === 'cruise') {
      const d = angDiff(P.theta, e.theta); e.dir = Math.sign(d) || 1;
      e.theta = wrap(e.theta + e.dir * Math.min(Math.abs(d) * R, 170) / R * dt);
      e.h += (260 + Math.sin(e.t * 2) * 20 - e.h) * Math.min(1, dt * 2);
      e.cd = (e.cd === undefined ? rnd(1.5, 2.5) : e.cd) - dt;
      e.spr.setRotation(0);
      if (e.cd <= 0 && Math.abs(d) * R < 220) { e.st = 'lock'; e.cd = 0.6; e.tgt = wrap(P.theta + rnd(-0.05, 0.05)); Sound.sfx('alarm'); }
    } else if (e.st === 'lock') {
      e.cd -= dt; e.theta = wrap(e.theta + Math.sin(e.t * 60) * 2 / R); e.spr.setTint(Math.floor(e.t * 14) % 2 ? 0xffa080 : 0xffffff);
      if (e.cd <= 0) { e.st = 'dive'; e.spr.clearTint(); Sound.sfx('whoosh'); }
    } else if (e.st === 'dive') {                                         // straight down into the fondue: SPLOOSH, a wave
      const dd = angDiff(e.tgt, e.theta) * R, L = Math.hypot(dd, e.h) || 1;
      e.theta = wrap(e.theta + dd / L * 560 / R * dt); e.h -= e.h / L * 560 * dt;
      if (e.h <= 6) { e.hp = 0; e.quietKill = true; this.fdWave(e.theta, 46); }
    }
  },
  skimmerAI(e, dt, P) {
    e.orb = (e.orb === undefined ? rnd(0, TAU) : e.orb) + dt * 1.6;
    const cx = P.theta, want = wrap(cx + Math.cos(e.orb) * 0.32), wantH = 190 + Math.sin(e.orb * 1.3) * 60;
    e.theta = wrap(e.theta + angDiff(want, e.theta) * Math.min(1, dt * 2.2)); e.h += (wantH - e.h) * Math.min(1, dt * 2.2);
    e.dir = -Math.sin(e.orb) >= 0 ? 1 : -1;
    e.cd = (e.cd === undefined ? rnd(1, 2) : e.cd) - dt;
    if (e.cd <= 0) {                                                     // a spiral of cheese drops
      e.cd = rnd(1.8, 2.4); const off = Math.random() * TAU;
      for (let k = 0; k < 6; k++) { const a = off + k * TAU / 6, b = this.addEBullet('fdrop', e.theta, e.h, 140 * Math.cos(a), 140 * Math.sin(a), 6, 3.5); b.curl = 1.1; }
      Sound.sfx('fan');
    }
  },

  // ---- LE GRAND FROMAGE
  gfInit(e) {
    const F = this.fd || this.fdInit();
    const S = e.gfS = { st: 'drift', t: 0, cd: 2.2, i: 0, p2: false, tilt: 0, aim: 0, thrust: 0 };
    S.rat = this.add.image(0, 0, 'gf_rat').setDepth(5.98);
    S.fork = this.add.image(0, 0, 'gf_fork').setDepth(6.05).setOrigin(0.12, 0.5);
    F.boss = e; e.mmLock = true;
    return S;
  },
  gfAI(e, dt, P, phase2) {
    const S = e.gfS || this.gfInit(e), F = this.fd;
    S.t += dt;
    const d = angDiff(P.theta, e.theta), dir = Math.sign(d) || 1;
    if (phase2 && !S.p2) {                                               // ACT 2: the pot cracks and shatters
      S.p2 = true; S.st = 'shatter'; S.t = 0; S.n = 0; S.tilt = 0; S.thrust = 0;
      this.banner('THE POT\'S CRACKED!\nHE\'S COMING ON FOOT!'); Sound.sfx('crash'); Sound.sfx('boom'); this.cameras.main.shake(500, 0.02);
    }
    const aimAt = () => { const hand = this.mPt(e, S.p2 ? 18 : 22, S.p2 ? -10 : -58); return Math.atan2((P.h + 30) - hand.h, angDiff(P.theta, hand.theta) * R); };
    if (!S.p2) {
      // ---- ACT 1: riding the pot
      const hover = () => { const want = wrap(P.theta - dir * 160 / R), dd = angDiff(want, e.theta); e.theta = wrap(e.theta + Math.sign(dd) * Math.min(Math.abs(dd), 110 / R * dt)); e.h += (150 + Math.sin(S.t * 2) * 12 - e.h) * Math.min(1, dt * 2); };
      if (S.st === 'drift') { hover(); S.tilt *= 1 - Math.min(1, dt * 4); S.aim += (aimAt() - S.aim) * Math.min(1, dt * 3); S.cd -= dt; if (S.cd <= 0) { S.st = ['lance', 'tip', 'rain', 'lance', 'rain', 'tip'][S.i++ % 6]; S.t = 0; S.n = 0; Sound.sfx('growl'); } }
      else if (S.st === 'lance') this.gfLance(e, S, P, dt, aimAt, hover);
      else if (S.st === 'tip') {                                         // tip the pot: a pour, and a flood rolls round the planet
        if (S.t < 0.6) { S.tilt = 0.9 * (S.t / 0.6) * (S.side = S.side || dir); }
        else if (S.t < 1.6) { const lip = this.mPt(e, Math.sign(S.tilt) * 60, -20); F.pour = { theta: lip.theta, h: lip.h }; if (!S.n) { S.n = 1; this.time.delayedCall(300, () => { if (e.hp > 0) this.fdWave(lip.theta, 52); }); } }
        else { F.pour = null; S.tilt *= 1 - Math.min(1, dt * 4); if (S.t > 2.2) this.gfIdle(e); }
      } else if (S.st === 'rain') { hover(); this.gfRain(e, S); }
    } else {
      // ---- ACT 2: on foot
      if (S.st === 'shatter') {
        if (!S.n) { S.n = 1; F.pour = null; this.fdWave(e.theta, 56); for (let k = 0; k < 12; k++) { const im = this.add.image(0, 0, 'db_rock').setDepth(6.2).setTint(0xd0703a); im.bsx = im.bsy = rnd(1, 1.8); this.parts.push({ theta: e.theta, h: e.h, vt: rnd(-260, 260), vh: rnd(100, 380), life: rnd(0.8, 1.3), spr: im, rot: 0, rv: rnd(-10, 10) }); } e.spr.setTexture('gf_ratbig'); S.rat.setVisible(false); e.spr.bsx = e.spr.bsy = 1.2; }
        e.h += (48 - e.h) * Math.min(1, dt * 6);
        if (S.t > 1.2) this.gfIdle(e);
        return;
      }
      const walk = (spd) => { e.theta = wrap(e.theta + dir * Math.min(Math.abs(d) * R, spd) / R * dt); e.h = 48 + Math.abs(Math.sin(S.t * 8)) * 4; e.dir = dir; };
      if (S.st === 'drift') { walk(120); S.aim += (aimAt() - S.aim) * Math.min(1, dt * 3); S.cd -= dt; if (S.cd <= 0) { S.st = ['charge', 'leap', 'rain', 'charge', 'lance', 'leap'][S.i++ % 6]; S.t = 0; S.n = 0; Sound.sfx('growl'); } }
      else if (S.st === 'charge') {                                      // fork levelled, full tilt along the ground
        S.aim = dir > 0 ? 0 : Math.PI;
        if (S.t < 0.5) e.theta = wrap(e.theta + Math.sin(S.t * 60) * 2 / R);
        else { e.theta = wrap(e.theta + (S.cdir = S.cdir || dir) * 420 / R * dt); if (S.t > 1.3) { S.cdir = 0; this.gfIdle(e); } }
      } else if (S.st === 'leap') {                                      // up... and down on you
        if (!S.n) { S.n = 1; S.vh = 760; S.tgt = P.theta; }
        S.vh -= 1500 * dt; e.h += S.vh * dt; e.theta = wrap(e.theta + angDiff(S.tgt, e.theta) * Math.min(1, dt * 2.5));
        if (e.h <= 48 && S.vh < 0) { e.h = 48; Sound.sfx('boom'); this.cameras.main.shake(300, 0.016); for (const sd of [-1, 1]) this.addEBullet('crumb', wrap(e.theta + sd * 50 / R), 9, sd * 260, 0, 11, 2.4); this.gfIdle(e); }
      } else if (S.st === 'rain') { walk(60); this.gfRain(e, S); }
      else if (S.st === 'lance') this.gfLance(e, S, P, dt, aimAt, () => walk(40));
    }
  },
  gfLance(e, S, P, dt, aimAt, move) {                                   // aim the fork, a glint, then a lightning thrust
    move();
    if (S.t < 0.7) { S.aim += (aimAt() - S.aim) * Math.min(1, dt * 6); S.thrust = -0.15 * (S.t / 0.7); if (S.t > 0.5 && !S.glint) { S.glint = true; Sound.sfx('zing'); } }
    else if (S.t < 0.85) S.thrust = Math.min(1, (S.t - 0.7) / 0.08);
    else if (S.t < 1.4) S.thrust *= 1 - Math.min(1, dt * 8);
    else { S.glint = false; this.gfIdle(e); return; }
    if (S.thrust > 0.6 && P.invuln <= 0) {                               // the tip
      const tip = this.gfTip(e, S);
      if (dist2(tip.theta, tip.h, P.theta, P.h + 30) < 30 * 30) { this.hurt(); P.vx = Math.cos(S.aim) * 300; }
    }
  },
  gfTip(e, S) {
    const hx = S.p2 ? 18 : 22, hy = S.p2 ? -10 : -58, hand = this.mPt(e, hx, hy), L = (105 + 70 * Math.max(0, S.thrust));
    return { theta: wrap(hand.theta + Math.cos(S.aim) * L / R), h: hand.h + Math.sin(S.aim) * L };
  },
  gfRain(e, S) {                                                         // a shower of croutons flung high
    if (!S.n) {
      S.n = 1;
      for (let k = 0; k < (S.p2 ? 9 : 7); k++) { const b = this.addEBullet('crouton', e.theta, e.h + 40, rnd(-240, 240), rnd(520, 720), 8, 3.2); b.grav = 700; b.spinV = rnd(-8, 8); }
      Sound.sfx('fan');
    }
    if (S.t > 1.6) this.gfIdle(e);
  },
  gfIdle(e) { const S = e.gfS; S.side = 0; S.st = 'drift'; S.t = 0; S.cd = S.p2 ? rnd(0.8, 1.2) : rnd(1.2, 1.8); S.thrust = 0; },
  gfParts(e) { const S = e.gfS; if (!S) return; for (const im of [S.rat, S.fork]) if (im) im.destroy(); S.rat = S.fork = null; if (this.fd) { this.fd.pour = null; this.fd.waves = []; } },
  gfDraw(e) {
    const S = e.gfS; if (!S || !S.fork) return;
    const vis = e.spr.visible, sx = e.spr.scaleX, sy = e.spr.scaleY;
    if (!S.p2) {
      e.spr.setRotation(e.spr.rotation + S.tilt);
      const rp = this.mScreen(e, [0, -50]); S.rat.setPosition(rp.x, rp.y).setRotation(e.spr.rotation * 0.5).setScale(sx, sy).setVisible(vis).setFlipX(angDiff(this.pl.theta, e.theta) < 0);
    }
    const hand = this.mScreen(e, [S.p2 ? 18 : 22, S.p2 ? -10 : -58]), base = e.spr.rotation - (S.p2 ? 0 : S.tilt);
    const ang = -S.aim + (this.viewT ? angDiff(e.theta, this.viewT()) : 0), ext = Math.max(0, S.thrust) * 70 * this.zoom;
    S.fork.setPosition(hand.x + Math.cos(ang) * ext, hand.y + Math.sin(ang) * ext).setRotation(ang).setScale(sx, sy).setVisible(vis);
    if (S.glint && S.st === 'lance') S.fork.setTintFill(Math.floor(this.t * 20) % 2 ? 0xffffff : 0xffe080); else S.fork.clearTint();
  },

  // ---- drawing (from render)
  fondueDraw(unwV) {
    const F = this.fd; if (!F) return;
    const W = this.scale.width, H = this.scale.height, z = this.zoom, Rz = R * z, vt = this.viewT(), g = F.g, gl = F.gl;
    g.clear(); gl.clear();
    // the fountain spire on the right of the horizon, spurting
    // the fountain spire and the circus stand on the far side of the planet and come round with it (turning at the far
    // fountain tiers' parallax rate), their bases tucked behind the planet's edge
    if (F.u0 === undefined) F.u0 = unwV || 0;
    const turn = ((unwV || 0) - F.u0) * FD_FAR_K, onRim = (im, a0, sc) => {
      const a = Math.atan2(Math.sin(a0 - turn), Math.cos(a0 - turn)), Rb = Rz * 0.995;
      im.setVisible(Math.abs(a) < 1.7).setPosition(this.cx + Math.sin(a) * Rb, this.cy - Math.cos(a) * Rb).setRotation(a).setScale(sc);
      return a;
    };
    const ss = z * 1.4, sa = onRim(F.spire, 0.6, ss);
    onRim(F.circus, -0.55, z * 1.2);
    const L = 147 * ss, top = { x: F.spire.x + Math.sin(sa) * L, y: F.spire.y - Math.cos(sa) * L };
    if (F.spire.visible && Math.random() < 0.7) { const vu = rnd(120, 170) * ss, vs = rnd(-40, 40) * ss; F.spurt.push({ x: top.x, y: top.y, vx: Math.sin(sa) * vu + Math.cos(sa) * vs, vy: -Math.cos(sa) * vu + Math.sin(sa) * vs, life: 1.2 }); }
    const lg = F.lightsGl; lg.clear();
    for (let i = F.spurt.length - 1; i >= 0; i--) { const q = F.spurt[i]; q.life -= this.lastDt || 0.016; q.vy += 200 * ss * (this.lastDt || 0.016); q.x += q.vx * (this.lastDt || 0.016); q.y += q.vy * (this.lastDt || 0.016); if (q.life <= 0) { F.spurt.splice(i, 1); continue; } lg.fillStyle(0xffd040, 0.8).fillRect(q.x - 2 * ss, q.y - 2 * ss, 4 * ss, 4 * ss); }
    // party lights: three sagging strings across the sky, swaying, sliding a little as you run
    const lt = F.lights; lt.clear();
    const cols = [0xff5a7a, 0xffd23f, 0x5ad8ff, 0xb87aff, 0x7dff8a];
    [[0.02, 0.98, 0.07, 0.17], [-0.2, 0.45, 0.13, 0.22], [0.55, 1.2, 0.12, 0.2]].forEach(([a, b, y0, sag], si) => {
      const shift = ((unwV || 0) * 40 * (si + 1)) % 1, x0 = W * a, x1 = W * b, n = 26;
      const pt = k => { const t = k / n; return { x: x0 + (x1 - x0) * t, y: H * y0 + Math.sin(t * Math.PI) * H * sag + Math.sin(this.t * 1.2 + si) * 3 * Math.sin(t * Math.PI) }; };
      lt.lineStyle(1.5, 0x2a1a3a, 1).beginPath(); for (let k = 0; k <= n; k++) { const p = pt(k); if (k) lt.lineTo(p.x, p.y); else lt.moveTo(p.x, p.y); } lt.strokePath();
      for (let k = 1; k < n; k += 2) { const p = pt(k + shift * 0), c = cols[(k + si) % cols.length], on = 0.65 + 0.35 * Math.sin(this.t * 3 + k + si * 2); lt.fillStyle(c, 1).fillCircle(p.x, p.y + 4, 3); lg.fillStyle(c, 0.35 * on).fillCircle(p.x, p.y + 4, 9); }
    });
    // curtains of hot cheese pouring out of the sky
    for (const C of F.curtains) {
      const d = angDiff(C.theta, vt); if (Math.abs(d) > this.visHalf + 0.1) continue;
      const wid = C.st === 'pour' ? C.w : C.st === 'warn' ? 2.5 : 1.5, top2 = FD_SPOUT - 34, left = [], right = [];
      // the golden spout it pours from, hanging on a chain from the sky
      const sp = k => this.screenPos(C.theta, FD_SPOUT + k), chainTop = sp(400), chainBot = sp(40);
      g.lineStyle(2 * z, 0x8a6a2a, 1).lineBetween(chainTop.x, chainTop.y, chainBot.x, chainBot.y);
      const fun = [[-16, 30], [16, 30], [7, 0], [5, -34], [-5, -34], [-7, 0]].map(([u, v]) => this.screenPos(wrap(C.theta + u / R), FD_SPOUT + v));
      g.fillStyle(0xc89a2a, 1).fillPoints(fun, true); g.lineStyle(2 * z, 0x2a1404, 1).strokePoints(fun, true);
      const lip = [sp(26), sp(-30)]; g.lineStyle(3 * z, 0xfff0a0, 1).lineBetween(this.screenPos(wrap(C.theta - 12 / R), FD_SPOUT + 26).x, this.screenPos(wrap(C.theta - 12 / R), FD_SPOUT + 26).y, lip[0].x, lip[0].y);
      if (C.st === 'warn') {                                       // WARNING: the spout's mouth glows red-hot and pulses, a red target on the ground
        const pulse = 0.5 + 0.5 * Math.sin(this.t * 26), m = sp(-34), gr = this.screenPos(C.theta, 2);
        gl.fillStyle(0xff2a1a, 0.5 + 0.4 * pulse).fillCircle(m.x, m.y, (8 + 6 * pulse) * z);
        gl.fillStyle(0xff3a2a, 0.25 + 0.35 * pulse).fillEllipse(gr.x, gr.y, (C.w * 3 + 10 * pulse) * z, 10 * z);
        g.lineStyle(2 * z, 0xff3a2a, 0.6 + 0.4 * pulse).strokeEllipse(gr.x, gr.y, C.w * 3.2 * z, 11 * z);
      }
      if (C.st === 'idle') continue;
      const parted = C.part > 0 && C.st === 'pour';
      for (let k = 0; k <= 16; k++) {
        const h = top2 * (1 - k / 16), wob = Math.sin(this.t * 14 + k * 0.9 + C.theta * 5) * (C.st === 'pour' ? 3 : 1), w2 = wid * (1 + 0.25 * Math.sin(k + this.t * 6)) + wob;
        if (parted && h < (this.pl.h + 90) && h > 0) { left.push(null); right.push(null); continue; }
        const pa = this.screenPos(wrap(C.theta - w2 / R), h), pb = this.screenPos(wrap(C.theta + w2 / R), h);
        left.push(pa); right.push(pb);
      }
      const runs = []; let cur = [];
      for (let k = 0; k <= 16; k++) { if (left[k]) cur.push(k); else { if (cur.length > 1) runs.push(cur); cur = []; } }
      if (cur.length > 1) runs.push(cur);
      for (const run of runs) {
        const poly = run.map(k => left[k]).concat(run.slice().reverse().map(k => right[k]));
        g.fillStyle(0xffc83a, 0.95).fillPoints(poly, true);
        g.lineStyle(2 * z, 0xfff4b0, 1).beginPath(); run.forEach((k, j) => { const p = left[k]; if (j) g.lineTo(p.x, p.y); else g.moveTo(p.x, p.y); }); g.strokePath();
        if (C.st === 'pour') gl.fillStyle(0xffa020, 0.2).fillPoints(poly, true);
      }
      if (C.st === 'pour' && !parted) { const p = this.screenPos(C.theta, 4), sw = 1 + 0.15 * Math.sin(this.t * 20); g.fillStyle(0xfff0a0, 0.9).fillEllipse(p.x, p.y, 48 * z * sw, 13 * z); gl.fillStyle(0xff8a1a, 0.35).fillEllipse(p.x, p.y, 70 * z * sw, 22 * z); }
    }
    // the boss's pour
    if (F.pour) {
      const w = 12 / R, q = [this.screenPos(F.pour.theta - w, F.pour.h), this.screenPos(F.pour.theta + w, F.pour.h), this.screenPos(F.pour.theta + w * 1.6, 0), this.screenPos(F.pour.theta - w * 1.6, 0)];
      g.fillStyle(0xffc83a, 0.95).fillPoints(q, true); g.lineStyle(2 * z, 0xfff4b0, 1).lineBetween(q[0].x, q[0].y, q[3].x, q[3].y);
      if (Math.random() < 0.5) this.burst(F.pour.theta, 4, 'fdrop', 1, 0.8);
    }
    // waves of fondue rolling round the planet
    if (F.waves.length) {
      let prev = null;
      for (let k = 0; k <= 240; k++) {
        const th = wrap(vt - 1.4 + k * 0.0117), L = this.fdWaveAt(th);
        if (L > 2) { const b0 = this.screenPos(th, -3), t0 = this.screenPos(th, L); if (prev) { g.fillStyle(0xffd860, 0.92).fillPoints([prev.b, prev.t, t0, b0], true); g.lineStyle(2 * z, 0xffffff, 1).lineBetween(prev.t.x, prev.t.y, t0.x, t0.y); } prev = { b: b0, t: t0 }; } else prev = null;
      }
    }
    // sticky puddles
    for (const D of F.puddles) {
      const top3 = [], bot = [], a = Math.min(1, D.life / 0.6);
      for (let k = 0; k <= 8; k++) { const th = wrap(D.theta - D.half + 2 * D.half * k / 8); top3.push(this.screenPos(th, 3 + Math.sin(k / 8 * Math.PI) * 4)); bot.push(this.screenPos(th, -3)); }
      g.fillStyle(0xd8a020, 0.85 * a).fillPoints(top3.concat(bot.reverse()), true);
      for (let k = 1; k < 8; k += 3) g.fillStyle(0xfff0a0, a).fillCircle(top3[k].x, top3[k].y, 2 * z);
    }
    // ripples where Chris wades through the fondue
    for (const Rp of (F.ripples || [])) {
      const p = this.screenPos(Rp.theta, 2), k = Rp.t / 0.8;
      g.lineStyle(2 * z, 0xfff4c0, 1 - k);
      g.strokeEllipse(p.x, p.y, (14 + 60 * k) * z, (4 + 8 * k) * z);
    }
    // the zipline handle
    if (this.pl.zip) { const L = this.pl.zip.L, a = this.screenPos(this.pl.theta, L.h - 4), b = this.screenPos(this.pl.theta, this.pl.h + 50); g.lineStyle(3 * z, 0xc8d0dc, 1).lineBetween(a.x, a.y, b.x, b.y); g.fillStyle(0xffd040, 1).fillCircle(a.x, a.y, 3 * z); }
    for (const q of this.ledgeSprs || []) if (q.L.sink) { const k = q.L.squash || 0; q.spr.sqx = 1 + 0.18 * k * Math.cos(k * 9); q.spr.sqy = 1 - 0.3 * k * Math.cos(k * 9); }
    // soggy croutons darken as they soak
    for (const q of this.ledgeSprs || []) if (q.L.sink) { const s2 = Math.min(1, (q.L.soak || 0) / 0.9); q.spr.setTint(Phaser.Display.Color.GetColor(255, 255 - s2 * 60, 255 - s2 * 140)); q.spr.setVisible(q.L.h > -100); }
  }
};
