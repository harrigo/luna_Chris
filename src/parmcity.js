// ===== L9 PARMESAN PRIME: the Imperial City's buildings, redrawn (v2.96) =====
// The big set-pieces on the horizon in the house pixel style (pixSprite: hard pixels, flat tones, dark outline), and
// grander - a rat EMPIRE's capital, not a place of worship:
//   ppb_palace   THE ROYAL PALACE: a wide baroque front - grand stair, colonnade, tall lit windows, a pediment with the
//                royal crest, a rotunda roofed with a colossal gold CROWN (a bite out of it, scaffolding), wing towers
//                roofed with giant wedges of holey cheese, flags, banners down the front
//   ppb_minaret  THE VICTORY COLUMN: a fluted column wound with a gold spiral, the King in gold on top (was a minaret)
//   ppb_arch     THE TRIUMPHAL ARCH: you can see the sky through it; a gold cheese-wheel chariot on top
//   ppb_temple   THE ROYAL TREASURY: columns, a pediment with a gold coin, a great round vault door ajar, gold spilling out
//   ppb_statue / ppstatue_big   THE COLOSSUS on his plinth (the same statue as the boss, parmboss.js, eyes still stone)
//   ppb_drill(_b), ppb_grater   the mining machines: a derrick driving a huge drill bit, a box-grater on tank tracks

function makeParmCity(scene) {
  if (scene.game.__ppCity2) return; scene.game.__ppCity2 = true;
  const DARK = 0x1a1018, M0 = 0xf6f1e8, M1 = 0xd0c8ba, M2 = 0x9a9084, M3 = 0x5e564e, MARB = [M0, M1, M2];
  const GOLD = [0xfff0a0, 0xf0b828, 0x9a6410], RED = [0xe0503a, 0xa82418, 0x5e0c0c], GLOW = [0xfff6a0, 0xffb030, 0xe0501a];
  const PARM = [0xfff4c0, 0xf2d27a, 0xb8903a], RUST = [0xe08a4a, 0xa8521e, 0x5e2a0c], STEEL = [0xeaf2ff, 0x9aa8c0, 0x4a5670], HOLE = 0x2a1612;
  // a block of masonry: lit top and left edge, shadowed right and bottom, courses of stone
  const block = (a, x0, y0, x1, y1, o) => { o = o || {}; a.rect(x0, y0, x1, y1, o.c || M1); a.rect(x0, y0, x1, y0, M0); a.rect(x0, y0, x0 + 1, y1, M0); a.rect(x1 - 1, y0, x1, y1, M2); a.rect(x0, y1, x1, y1, M2);
    if (o.courses) for (let y = y0 + o.courses; y < y1; y += o.courses) for (let x = x0 + 2; x < x1 - 1; x += 2) if ((x + y) % 5) a.px(x, y, M2); };
  // a fluted column with a gold capital and a base
  const column = (a, x, y0, y1, w) => { w = w || 6; a.rect(x, y0, x + w, y1, M1); a.rect(x, y0, x + 1, y1, M0); a.rect(x + w - 1, y0, x + w, y1, M2); for (let k = 2; k < w - 1; k += 2) a.rect(x + k, y0 + 2, x + k, y1 - 2, M2);
    a.rect(x - 1, y0 - 2, x + w + 1, y0, GOLD[1]); a.rect(x - 1, y0 - 2, x + w + 1, y0 - 2, GOLD[0]); a.rect(x - 1, y1, x + w + 1, y1 + 2, M0); a.rect(x - 1, y1 + 2, x + w + 1, y1 + 2, M2); };
  // a tall arched window, lit from inside
  const win = (a, x, y0, y1, w, dark) => { a.rect(x - 1, y0 + w / 2 - 1, x + w + 1, y1 + 1, M3); a.ell(x + w / 2, y0 + w / 2, w / 2 + 1, w / 2 + 1, M3);
    a.rect(x, y0 + w / 2, x + w, y1, dark ? HOLE : GLOW[1]); a.ell(x + w / 2, y0 + w / 2, w / 2, w / 2, dark ? HOLE : GLOW[1]);
    if (!dark) { a.rect(x, y0 + w / 2, x + 1, y1, GLOW[0]); a.rect(x, y1 - 3, x + w, y1, GLOW[2]); a.rect(x + w / 2, y0 + 1, x + w / 2, y1, M3); a.rect(x, (y0 + y1) / 2 | 0, x + w, (y0 + y1) / 2 | 0, M3); } };
  const crackL = (a, pts) => a.line(pts, M3);
  const flag = (a, x, y, d) => { a.rect(x, y - 16, x, y, M3); a.poly([[x + d, y - 16], [x + d * 11, y - 14], [x + d * 8, y - 11], [x + d * 11, y - 8], [x + d, y - 9]], RED); a.px(x, y - 17, GOLD[0]); };
  // a giant wedge of holey cheese (the wing towers' roofs)
  const wedge = (a, x0, x1, y, h) => { a.poly([[x0 - 3, y], [x1 + 3, y], [x1 + 3, y - h * 0.35], [x0 + 4, y - h]], PARM); a.poly([[x0 - 3, y], [x0 + 4, y - h], [x0 + 8, y - h + 3], [x0 + 2, y]], [PARM[0], PARM[0], PARM[1]]);
    for (const [u, v, r] of [[0.35, 0.3, 3], [0.6, 0.2, 2.2], [0.75, 0.45, 1.6], [0.45, 0.6, 1.8]]) a.ell(x0 + (x1 - x0) * u, y - h * v, r, r, [PARM[2], PARM[2], 0x7a5a1a]); a.rect(x0 - 3, y - 1, x1 + 3, y, PARM[2]); };

  // ================= THE ROYAL PALACE =================
  pixSprite(scene, 'ppb_palace', 236, 214, a => {
    const G = 212;
    // the grand stair, a red carpet down it
    for (let k = 0; k < 5; k++) block(a, 60 - k * 5, G - 4 - k * 3 + 0, 176 + k * 5, G - 2 - k * 3 + 3);
    a.poly([[106, G - 16], [130, G - 16], [138, G], [98, G]], RED); a.line([[100, G - 2], [108, G - 16]], GOLD[1]); a.line([[136, G - 2], [128, G - 16]], GOLD[1]);
    block(a, 10, 182, 226, 197, { courses: 5 });                                                         // the podium
    // the wings' towers (behind the front), roofed with wedges of cheese, flags flying
    for (const [x0, x1, d] of [[16, 50, 1], [186, 220, -1]]) { block(a, x0, 70, x1, 182, { courses: 7 }); win(a, x0 + 13, 82, 104, 8); win(a, x0 + 13, 116, 138, 8, x0 > 100);
      a.rect(x0 - 2, 66, x1 + 2, 70, M0); a.rect(x0 - 2, 70, x1 + 2, 70, M2); for (let x = x0; x < x1; x += 4) a.rect(x, 62, x + 1, 66, M1);
      wedge(a, x0 + 2, x1 - 2, 62, 34); flag(a, d > 0 ? x0 + 8 : x1 - 8, 30, d); }
    // the main front: a colonnade, tall lit windows between the columns, the great door
    block(a, 30, 112, 206, 182, { c: M1 });
    for (let k = 0; k < 9; k++) { const x = 35 + k * 20; if (k !== 4) win(a, x + 9, 126, 172, 8, k === 7); }
    a.rect(102, 132, 134, 182, M3); a.ell(118, 134, 17, 15, M3); a.rect(105, 136, 131, 182, HOLE); a.ell(118, 136, 13, 12, HOLE);     // the door
    a.rect(106, 140, 117, 182, GOLD[2]); a.rect(119, 140, 130, 182, GOLD[2]); a.rect(107, 142, 116, 180, GOLD[1]); a.rect(120, 142, 129, 180, GOLD[1]); a.px(116, 162, GOLD[0]); a.px(120, 162, GOLD[0]);
    a.poly([[113, 128], [113, 122], [116, 125], [118, 120], [120, 125], [123, 122], [123, 128]], GOLD);
    for (let k = 0; k < 10; k++) column(a, 32 + k * 20 - (k > 4 ? 1 : 0), 120, 178, 6);
    for (const x of [58, 158]) { a.poly([[x, 122], [x + 14, 122], [x + 14, 160], [x + 7, 154], [x, 160]], RED); a.rect(x, 122, x + 14, 123, GOLD[1]); a.ell(x + 7, 136, 3.4, 3.4, GOLD); }   // banners
    block(a, 26, 102, 210, 112); a.rect(26, 106, 210, 108, GOLD[1]); for (let x = 30; x < 208; x += 6) a.px(x, 110, M2);              // entablature, gold frieze
    for (let x = 28; x < 208; x += 5) a.rect(x, 96, x + 1, 101, M1); a.rect(26, 94, 210, 96, M0);                                      // balustrade
    // the pediment: the royal crest
    a.poly([[70, 102], [118, 72], [166, 102]], MARB); a.line([[70, 102], [118, 72], [166, 102]], M0); a.poly([[80, 100], [118, 77], [156, 100]], [M1, M2, M2]);
    a.ell(118, 92, 8, 7, GOLD); a.poly([[112, 87], [112, 81], [115, 84], [118, 79], [121, 84], [124, 81], [124, 87]], GOLD); a.ell(118, 93, 3, 3, RED);
    for (const sd of [-1, 1]) for (let k = 1; k < 4; k++) a.ell(118 + sd * (8 + k * 6), 97 - k * 1.5, 3, 1.6, GOLD);                   // laurels
    // the rotunda, and on it a colossal gold CROWN for a roof
    block(a, 86, 44, 150, 74, { courses: 6 }); for (let k = 0; k < 5; k++) win(a, 92 + k * 12, 50, 68, 6); a.rect(84, 72, 152, 75, M0); a.rect(84, 75, 152, 75, M2);
    a.ell(118, 34, 28, 14, RED); a.ell(118, 30, 22, 9, [0xff8a6a, 0xe0503a, 0xa82418]);                                                 // the velvet cap
    a.rect(84, 34, 152, 44, GOLD[1]); a.rect(84, 34, 152, 35, GOLD[0]); a.rect(84, 43, 152, 44, GOLD[2]);
    a.poly([[84, 34], [82, 12], [94, 24], [104, 4], [114, 22], [118, 2], [122, 22], [132, 4], [142, 24], [154, 12], [152, 34]], GOLD);
    for (const [x, y] of [[82, 11], [104, 3], [118, 1], [132, 3], [154, 11]]) a.ell(x, y, 3, 3, GOLD);
    for (const [x, c] of [[94, RED], [106, [0x9ab8ff, 0x4a6ad8, 0x1c2870]], [118, RED], [130, [0x9ab8ff, 0x4a6ad8, 0x1c2870]], [142, RED]]) a.ell(x, 39, 2.6, 2.6, c);
    for (const [x, y] of [[90, 20], [110, 14], [126, 12], [146, 20], [100, 28]]) a.px(x, y, 0xffffff);
    // ...falling apart: a bite out of the crown (scaffold round it), the right wing split open, cracks, rubble
    a.poly([[134, 4], [150, 8], [156, 20], [146, 24], [138, 16]], -1); for (const x of [138, 148, 158]) a.rect(x, 6, x, 44, RUST[1]); for (const y of [14, 26, 38]) a.rect(136, y, 160, y, RUST[2]); a.line([[138, 26], [148, 14]], RUST[1]);
    a.poly([[200, 96], [212, 112], [206, 134], [214, 156], [204, 182], [226, 182], [226, 96]], -1); a.poly([[196, 110], [204, 120], [200, 138], [208, 158], [200, 182], [206, 182], [214, 156], [206, 134], [212, 112], [202, 100]], HOLE);
    crackL(a, [[60, 114], [66, 128], [62, 140], [70, 152]]); crackL(a, [[150, 104], [144, 112]]); crackL(a, [[40, 76], [36, 90], [42, 100]]); crackL(a, [[92, 76], [98, 86]]);
    for (const [x, y, r] of [[206, 206, 6], [218, 208, 4], [196, 208, 3], [24, 208, 4]]) a.ell(x, y, r, r * 0.7, MARB);
  });

  // ================= THE VICTORY COLUMN =================
  pixSprite(scene, 'ppb_minaret', 70, 236, a => {
    const G = 234;
    block(a, 8, G - 12, 62, G); block(a, 14, G - 30, 56, G - 12, { courses: 6 }); a.rect(20, G - 26, 50, G - 16, M2); a.poly([[30, G - 18], [30, G - 23], [33, G - 20], [35, G - 24], [37, G - 20], [40, G - 23], [40, G - 18]], GOLD);
    a.rect(24, 56, 46, G - 30, M1); a.rect(24, 56, 26, G - 30, M0); a.rect(43, 56, 46, G - 30, M2); for (const x of [29, 33, 37, 41]) a.rect(x, 58, x, G - 32, M2);
    for (let y = G - 44; y > 62; y -= 22) { a.line([[24, y], [46, y - 12]], GOLD[2], 3); a.line([[24, y - 1], [46, y - 13]], GOLD[1], 2); }                  // the gold spiral
    a.rect(20, 50, 50, 56, M0); a.rect(20, 55, 50, 56, M2); a.rect(22, 46, 48, 50, GOLD[1]); a.rect(22, 46, 48, 46, GOLD[0]);
    // the King, in gold, sceptre raised
    a.ell(35, 34, 9, 12, GOLD); a.ell(36, 18, 7.5, 6.5, GOLD); a.poly([[40, 15], [50, 18], [51, 21], [40, 23]], GOLD); a.ell(29, 12, 3.4, 4.4, GOLD); a.ell(42, 11, 2.6, 3.4, GOLD);
    a.poly([[30, 13], [30, 6], [33, 10], [36, 4], [39, 10], [42, 6], [42, 13]], GOLD); a.px(42, 18, DARK); a.line([[24, 28], [14, 40], [18, 46]], RED[1], 3);
    a.line([[42, 30], [50, 24], [52, 14]], GOLD[2], 3); a.line([[52, 22], [56, 2]], GOLD[1], 2); a.ell(56, 2, 2.6, 2.6, GOLD); a.rect(30, 44, 34, 46, GOLD[2]); a.rect(37, 44, 41, 46, GOLD[2]);
    a.poly([[40, 120], [47, 126], [47, 146], [38, 140]], -1); a.poly([[36, 122], [40, 120], [38, 140], [34, 136]], HOLE); crackL(a, [[28, 96], [32, 108], [28, 118]]); crackL(a, [[38, 170], [42, 182]]);
    a.rect(34, 62, 36, 66, 0xffffff); a.px(35, 67, 0xffffff);
  });

  // ================= THE TRIUMPHAL ARCH =================
  pixSprite(scene, 'ppb_arch', 170, 176, a => {
    const G = 174;
    for (const x0 of [10, 112]) { block(a, x0, 62, x0 + 48, G, { courses: 8 }); block(a, x0 - 3, G - 12, x0 + 51, G); a.rect(x0 + 8, 76, x0 + 40, 118, M2); a.rect(x0 + 10, 78, x0 + 38, 116, M1);
      a.ell(x0 + 24, 92, 7, 8, M0); a.ell(x0 + 25, 86, 5, 4.5, M0); a.poly([[x0 + 28, 84], [x0 + 35, 86], [x0 + 28, 89]], MARB); a.line([[x0 + 14, 110], [x0 + 34, 110]], GOLD[1]);     // a relief: the King in profile
      column(a, x0 + 3, 70, G - 16, 5); column(a, x0 + 40, 70, G - 16, 5); }
    a.rect(58, 62, 112, 86, M1); a.rect(58, 62, 112, 62, M0); a.ell(85, 96, 27, 26, -1); a.rect(58, 96, 112, G, -1);                    // the opening: sky shows through
    for (let k = 0; k <= 12; k++) { const an = Math.PI + k / 12 * Math.PI, x = 85 + Math.cos(an) * 29, y = 96 + Math.sin(an) * 28; a.rect(x - 1, y - 1, x + 1, y + 1, k % 2 ? M0 : M2); }
    a.poly([[81, 64], [89, 64], [87, 74], [83, 74]], GOLD);                                                                           // keystone
    block(a, 4, 50, 166, 62); a.rect(4, 54, 166, 56, GOLD[1]); block(a, 10, 24, 160, 50, { courses: 9 });                              // cornice, attic
    for (const [x, w] of [[52, 4], [60, 6], [70, 4], [78, 6], [90, 4], [98, 6], [108, 4]]) a.rect(x, 34, x + w, 40, M3);              // an inscription
    a.rect(6, 20, 164, 24, M0); a.rect(6, 24, 164, 24, M2);
    // on top: a gold chariot - a wheel of cheese for a car, two gold mice pulling, the King driving
    a.ell(84, 8, 12, 12, GOLD); a.ell(84, 8, 4, 4, GOLD[2]); for (const [x, y] of [[78, 3], [90, 5], [82, 14]]) a.ell(x, y, 1.6, 1.6, GOLD[2]);
    for (const x of [110, 128]) { a.ell(x, 14, 8, 5, GOLD); a.ell(x + 8, 10, 4, 3.4, GOLD); a.rect(x - 5, 17, x - 4, 20, GOLD[2]); a.rect(x + 4, 17, x + 5, 20, GOLD[2]); a.px(x + 12, 10, GOLD[0]); }
    a.line([[96, 10], [104, 12]], GOLD[2]); a.ell(66, 6, 5, 7, GOLD); a.ell(68, -2, 4, 3.6, GOLD); a.line([[70, 4], [78, 2]], GOLD[2]);
    a.poly([[140, 20], [166, 20], [166, 50], [152, 44], [146, 30]], -1); a.poly([[144, 24], [150, 32], [156, 46], [150, 46], [142, 30]], HOLE);       // a corner gone
    crackL(a, [[30, 126], [36, 138], [30, 150]]); crackL(a, [[130, 64], [136, 76], [132, 88]]); for (const [x, y, r] of [[158, G - 3, 6], [148, G - 2, 4]]) a.ell(x, y, r, r * 0.7, MARB);
  });

  // ================= THE ROYAL TREASURY =================
  pixSprite(scene, 'ppb_temple', 196, 150, a => {
    const G = 148;
    for (let k = 0; k < 4; k++) block(a, 8 + k * 4, G - 3 - k * 4, 188 - k * 4, G - k * 4 + 1);
    block(a, 22, 56, 174, G - 16, { c: M2 });                                                             // the cella, in shadow
    // the vault: a great round steel door, ajar, gold light and coins pouring out
    a.ell(98, 96, 34, 34, M3); a.ell(98, 96, 31, 31, GLOW); a.ell(92, 98, 24, 26, HOLE);
    a.ell(118, 96, 26, 31, STEEL); a.ell(118, 96, 18, 22, [STEEL[1], STEEL[1], STEEL[2]]); for (let k = 0; k < 6; k++) { const an = k / 6 * Math.PI * 2; a.line([[118, 96], [118 + Math.cos(an) * 12, 96 + Math.sin(an) * 15]], STEEL[0]); } a.ell(118, 96, 4, 5, GOLD);
    for (let k = 0; k < 10; k++) { const an = k / 10 * Math.PI * 2; a.px(118 + Math.cos(an) * 22, 96 + Math.sin(an) * 27, STEEL[0]); }
    a.poly([[70, G - 16], [104, G - 16], [118, G], [62, G]], GOLD); for (const [x, y] of [[74, G - 12], [86, G - 8], [96, G - 13], [80, G - 4], [104, G - 5], [112, G - 2], [68, G - 2], [92, G - 2]]) { a.ell(x, y, 2.6, 2, GOLD); a.px(x - 1, y - 1, 0xffffff); }
    for (let k = 0; k < 8; k++) { if (k === 5) continue; column(a, 24 + k * 21, 60, G - 18, 7); }
    a.poly([[130, G - 18], [137, G - 18], [137, G - 44], [134, G - 40], [130, G - 46]], MARB); a.poly([[140, G - 14], [176, G - 22], [178, G - 16], [142, G - 8]], MARB);               // a column down
    block(a, 16, 46, 180, 56); a.rect(16, 50, 180, 52, GOLD[1]);
    a.poly([[12, 46], [98, 6], [184, 46]], MARB); a.line([[12, 46], [98, 6], [184, 46]], M0); a.poly([[28, 44], [98, 12], [168, 44]], [M1, M2, M2]);
    a.ell(98, 32, 10, 10, GOLD); a.ell(98, 32, 6, 6, [GOLD[1], GOLD[1], GOLD[2]]); a.poly([[94, 30], [94, 26], [96, 28], [98, 25], [100, 28], [102, 26], [102, 30]], GOLD[0]);          // a great gold coin
    for (const sd of [-1, 1]) for (let k = 1; k < 5; k++) a.ell(98 + sd * (10 + k * 8), 41 - k * 0.5, 3.4, 1.8, GOLD);
    a.poly([[150, 30], [184, 46], [184, 60], [166, 52]], -1); crackL(a, [[40, 48], [46, 58], [40, 66]]); crackL(a, [[120, 20], [126, 30]]);
  });

  // ================= THE MINING MACHINES =================
  for (const f of [0, 1]) pixSprite(scene, f ? 'ppb_drill_b' : 'ppb_drill', 110, 236, a => {
    const G = 234;
    for (const x of [14, 92]) { a.line([[x, 64], [x + (x < 50 ? -8 : 8), G]], RUST[2], 4); a.line([[x, 64], [x + (x < 50 ? -8 : 8), G]], RUST[1], 2); }
    for (let y = 70; y < G - 10; y += 22) { const w = (y - 64) / (G - 64) * 8; a.line([[14 - w, y], [92 + w, y + 22]], RUST[1]); a.line([[92 + w, y], [14 - w, y + 22]], RUST[2]); a.rect(14 - w, y, 92 + w, y + 1, RUST[1]); }
    a.rect(8, 44, 100, 64, STEEL[1]); a.rect(8, 44, 100, 45, STEEL[0]); a.rect(8, 62, 100, 64, STEEL[2]); for (let x = 12; x < 98; x += 8) a.poly([[x, 50], [x + 4, 50], [x + 1, 58], [x - 3, 58]], 0xffd23f);      // hazard stripes
    a.rect(22, 20, 34, 44, STEEL[1]); a.rect(22, 20, 24, 44, STEEL[0]); a.rect(20, 18, 36, 21, STEEL[2]); a.rect(70, 26, 80, 44, STEEL[1]); a.rect(68, 24, 82, 27, STEEL[2]);
    for (const [x, y, r] of [[28, 10 - f * 3, 6], [34, 2 - f * 2, 4], [75, 16 - f * 3, 5]]) a.ell(x, y, r, r * 0.8, [0x8a7a80, 0x6a5a62, 0x4a3c44]);                                                           // smoke
    a.rect(34, 70, 72, 104, RUST[1]); a.rect(34, 70, 72, 71, RUST[0]); a.rect(34, 102, 72, 104, RUST[2]); a.rect(40, 78, 50, 92, GLOW[1]); a.rect(56, 78, 66, 92, GLOW[1]); a.rect(40, 78, 50, 79, GLOW[0]); a.rect(56, 78, 66, 79, GLOW[0]);   // the engine house
    a.ell(45, 86, 3, 4, DARK); a.ell(46, 82, 2, 1.6, DARK);                                                                                                                                                    // a rat at the controls
    a.rect(48, 104, 58, 130, STEEL[1]); a.rect(48, 104, 50, 130, STEEL[0]);
    a.poly([[30, 130], [76, 130], [58, G - 6], [48, G - 6]], STEEL);                                                                                                                                             // the drill bit
    for (let y = 134 + f * 5; y < G - 10; y += 10) { const w = 23 * (1 - (y - 130) / (G - 136)); a.line([[53 - w, y + 4], [53 + w, y - 2]], STEEL[2], 2); a.line([[53 - w, y + 2], [53 + w, y - 4]], STEEL[0]); }
    a.ell(53, G - 2, 22, 4, PARM); for (const [x, y] of [[36 - f * 4, G - 10], [70 + f * 4, G - 12], [60, G - 16 - f * 3], [44, G - 16]]) a.px(x, y, PARM[0]);
  });
  pixSprite(scene, 'ppb_grater', 190, 150, a => {
    const G = 148;
    a.ell(34, G - 8, 32, 10, PARM); a.poly([[10, G - 8], [30, G - 30], [56, G - 10]], PARM); for (const [x, y] of [[24, G - 18], [36, G - 14], [30, G - 24], [44, G - 8]]) a.px(x, y, 0xffffff);            // a heap of gratings
    a.poly([[52, G - 20], [84, G - 44], [90, G - 38], [58, G - 14]], RUST); for (let k = 0; k < 5; k++) a.px(58 + k * 6, G - 22 - k * 4.6, PARM[0]);                                                       // the chute
    a.rect(78, G - 22, 184, G - 4, STEEL[2]); a.rect(78, G - 22, 184, G - 21, STEEL[1]); for (let x = 86; x < 180; x += 13) { a.ell(x, G - 11, 6, 6, STEEL); a.ell(x, G - 11, 2, 2, DARK); }                 // tracks
    a.rect(84, G - 34, 178, G - 22, RUST[1]); a.rect(84, G - 34, 178, G - 33, RUST[0]); for (let x = 88; x < 176; x += 9) a.px(x, G - 28, STEEL[0]);
    a.poly([[96, G - 34], [166, G - 34], [152, 22], [110, 22]], STEEL); a.poly([[96, G - 34], [110, 22], [116, 22], [104, G - 34]], [STEEL[0], STEEL[0], STEEL[1]]);                                      // the great grater
    for (let y = 30, row = 0; y < G - 40; y += 9, row++) { const u = (G - 34 - y) / (G - 56), xl = 96 + 14 * u + 10, xr = 166 - 14 * u - 8; for (let x = xl + (row % 2) * 4; x < xr - 3; x += 9) { a.rect(x, y, x + 4, y + 2, DARK); a.rect(x, y + 3, x + 4, y + 3, STEEL[0]); } }
    a.rect(106, 12, 156, 22, RUST[1]); a.rect(106, 12, 156, 13, RUST[0]); a.poly([[124, 12], [124, 6], [127, 9], [131, 4], [135, 9], [138, 6], [138, 12]], GOLD);
    a.rect(160, G - 62, 182, G - 34, RUST[1]); a.rect(160, G - 62, 182, G - 61, RUST[0]); a.rect(164, G - 58, 178, G - 46, GLOW[1]); a.ell(170, G - 50, 3, 4, DARK); a.ell(172, G - 54, 2, 1.6, DARK);        // the cab, a rat driving
    a.rect(168, G - 76, 172, G - 62, STEEL[1]); a.ell(170, G - 82, 5, 4, [0x8a7a80, 0x6a5a62, 0x4a3c44]);
  });
}
