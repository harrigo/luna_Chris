// ================================================================= MOON CAMP (v3.07): run mode's home, Hades-style
// A real little planet: Chris runs, jumps, jets and shoots round it exactly as in the levels (it IS the level scene, in
// 'camp' mode: no waves, no HUD, no harm). Round the moon, from his tent and the fondue campfire:
//   right: PICNIC TABLE (the lunchbox: a starter perk)  ->  CHEESE ROCKET on its gantry (launch a run)
//   left:  NOTICEBOARD (records)  ->  FRIDGE-O-TRON's LARDER stall (golden crumbs -> permanent upgrades)
//   round the back: Bessie's empty pen and the SIGNPOST home (main menu)
// Stand at a station and press DOWN (or tap its sign) to use it. Every run ends back here: Chris drops out of the sky
// by the fire and the run's summary card pops up.
const CAMP_ST = [            // (v3.31) spread right round the moon - every station gets room to breathe
  { id: 'fire',   theta: 0.0,   tex: 'cr_fire0',  sc: 1.6, name: 'CAMPFIRE',      verb: 'SIT' },
  { id: 'lunch',  theta: 0.72,  tex: 'cr_picnic', sc: 1.7, name: 'LUNCHBOX',      verb: 'PACK A LUNCH' },
  { id: 'rack',   theta: 1.3,   tex: 'cr_rack',   sc: 1.7, name: 'GUN RACK',      verb: 'PICK A GUN' },
  { id: 'rocket', theta: 2.0,   tex: 'cr_rocket', sc: 2.3, name: 'CHEESE ROCKET', verb: 'LAUNCH A RUN', h: 6 },
  { id: 'board',  theta: -0.85, tex: 'cr_board',  sc: 1.7, name: 'NOTICEBOARD',   verb: 'READ' },
  { id: 'larder', theta: -1.6,  tex: 'cr_stall',  sc: 1.7, name: 'THE LARDER',    verb: 'TRADE CRUMBS' },
  { id: 'train',  theta: -2.35, tex: 'cr_dummy',  sc: 1.7, name: 'TRAINING DUMMY', verb: 'TRAIN' },
  { id: 'clay',   theta: -2.55, tex: 'ty_trap',   sc: 1.5, name: 'CLAY CHEESE',   verb: 'PULL!' },        // (v3.42) camptoys.js
  { id: 'cave',   theta: 1.65,  tex: 'cv_hole',   sc: 1.6, name: 'SECRET CAVERN', verb: 'DROP IN' },     // (v3.41) cavern.js - hidden until you break the boulder
  { id: 'rush',   theta: -2.95, tex: 'cr_gate',   sc: 1.7, name: 'BOSS GATE',     verb: 'BOSS RUSH' },     // (v3.36) bossrush.js
  { id: 'sign',   theta: Math.PI, tex: 'cr_sign', sc: 1.7, name: 'MAIN MENU',     verb: 'LEAVE CAMP' }
];
const CAMP_DECOR = [   // [tex, theta, scale, h, depth]
  ['cr_tent', -0.42, 1.9, 0, 2.3], ['cr_gantry', 2.13, 2.2, 0, 2.2], ['cr_pad', 2.05, 2.2, -2, 2.45], ['shopship', -1.85, 1.15, 14, 2.2],
  ['cr_barrel', -1.15, 1.6, 0, 2.6],
  ['cr_lamp', -1.22, 1.7, 0, 2.25], ['cr_lamp', -0.55, 1.7, 0, 2.25], ['cr_lamp', 0.4, 1.7, 0, 2.25], ['cr_lamp', 1.02, 1.7, 0, 2.25],
  ['cr_pen', 2.78, 1.8, 0, 2.3], ['cr_dish', -2.8, 1.7, 0, 2.3], ['cr_flag', -0.22, 1.7, 0, 2.2], 
];
const CAMP_LIGHTS = [[-1.22, -0.55], [-0.55, 0.4], [0.4, 1.02]];        // strings of bulbs between the lamp posts

function campDef() {
  return Object.assign({}, LEVELS[1], {
    name: 'Moon Camp', short: 'MOON CAMP', camp: true, geysers: null, lava: 0, warp: null, waves: [], tip: '', music: 'title',
    ledges: [{ theta: 2.6, half: 0.11, h: 95 }, { theta: 2.95, half: 0.09, h: 175 }, { theta: -1.2, half: 0.1, h: 120 }, { theta: -2.95, half: 0.1, h: 150 }],
    props: [{ tex: 'p_tuft1', n: 10, sc: [0.8, 1.3], fg: true }]
  });
}

// ---------------------------------------------------------------- the camp's art (hard pixels, the house style)
function makeCampTextures(scene) {
  if (scene.textures.exists('cr_rocket')) return;
  const RED = [0xff7a6a, 0xd83a2a, 0x7a1410], CH = [0xfff0a0, 0xf2c040, 0xa8700c], ST = [0xeef2f8, 0x9aa4b4, 0x4a5262], WD = [0xd09050, 0x9a5c26, 0x5a3212],
    DWD = [0x8a5226, 0x5a3212, 0x3a1e0a], CAN = [0xfff0d8, 0xe8c89a, 0xa8784a], GLASS = [0xbff0ff, 0x4aa0d8, 0x1a4a7a];
  // CHEESE ROCKET: a Swiss-holed fuselage with riveted bands, a big porthole, red nose cone and fins, a fat nozzle
  pixSprite(scene, 'cr_rocket', 56, 120, a => {
    a.poly([[4, 92], [18, 70], [18, 104], [2, 112]], RED); a.poly([[52, 92], [38, 70], [38, 104], [54, 112]], RED);    // fins
    a.rrect(15, 26, 41, 106, 10, CH);                                                                                   // fuselage
    for (const y of [44, 88]) { a.rect(15, y, 41, y + 3, ST[1]); for (let x = 17; x < 40; x += 4) a.px(x, y + 1, ST[0]); }    // riveted bands
    a.poly([[28, 1], [41, 28], [15, 28]], RED); a.rect(15, 26, 41, 28, 0x7a1410); a.rect(27, 1, 29, 4, 0xffd23f);        // nose + tip
    for (const [x, y, r] of [[20, 36, 2.2], [36, 52, 2.6], [21, 66, 3], [35, 76, 2], [19, 82, 1.6], [34, 97, 2.4], [22, 98, 1.6], [37, 36, 1.4]]) {
      a.ell(x, y, r, r, 0x9a6408); a.ell(x - 0.6, y - 0.6, r * 0.55, r * 0.55, 0x7a4a04);
    }
    a.ell(28, 60, 8, 8, ST); a.ell(28, 60, 5.5, 5.5, GLASS); a.rect(25, 57, 26, 58, 0xffffff); a.px(27, 57, 0xffffff);   // porthole
    a.rect(20, 106, 36, 110, ST[2]); a.poly([[19, 110], [37, 110], [40, 118], [16, 118]], [0x7a828e, 0x4a5262, 0x2a2e3a]);   // nozzle
    a.rect(26, 30, 30, 33, 0xfff6c0); a.line([[18, 30], [18, 100]], 0xfffbe0);                                           // highlight
  });
  // the launch GANTRY: a red girder tower with a ladder, an arm and a blinking light on top
  pixSprite(scene, 'cr_gantry', 40, 130, a => {
    a.rect(4, 6, 7, 129, [0xd84a3a, 0xa82a1a, 0x6a140a][1]); a.rect(20, 6, 23, 129, 0xa82a1a);
    for (let y = 10; y < 128; y += 12) { a.line([[5, y], [22, y + 11]], 0xd84a3a); a.line([[22, y], [5, y + 11]], 0x7a1a10); a.rect(4, y, 23, y + 1, 0xd84a3a); }
    a.rect(24, 40, 39, 43, ST[1]); a.rect(36, 36, 39, 48, ST[2]);                                                       // arm
    a.rect(2, 2, 25, 6, ST[1]); a.ell(13, 2, 2.5, 2.5, 0xff3a3a);
  });
  pixSprite(scene, 'cr_pad', 84, 12, a => {
    a.poly([[0, 11], [8, 3], [76, 3], [83, 11]], ST); for (let x = 10; x < 74; x += 10) a.rect(x, 4, x + 4, 5, 0xffd23f); a.rect(14, 8, 70, 9, ST[2]);
  });
  // Chris's TENT: patched canvas, guy ropes, bunting, a lantern, the flap open on a sleeping bag
  pixSprite(scene, 'cr_tent', 104, 70, a => {
    a.line([[2, 69], [20, 30]], 0xb89a6a); a.line([[101, 69], [84, 30]], 0xb89a6a);                                     // guy ropes
    a.poly([[52, 8], [98, 68], [6, 68]], [0xffb04a, 0xe0782a, 0x8a3e0e]);
    a.poly([[52, 8], [98, 68], [80, 68]], 0xb85a1a);                                                                    // shaded side
    a.poly([[52, 22], [70, 68], [34, 68]], 0x2a1410); a.poly([[52, 22], [66, 68], [52, 68]], 0x4a2418);                // door
    a.poly([[52, 22], [34, 68], [28, 68]], CAN); a.poly([[52, 22], [70, 68], [76, 68]], CAN);                           // rolled-back flaps
    a.rrect(40, 56, 64, 68, 4, [0x6aa0ff, 0x3a68d8, 0x1a3a8a]); a.ell(44, 60, 4, 3, CAN);                              // sleeping bag + pillow
    a.rect(16, 46, 27, 55, 0xc86a1a); a.rect(18, 48, 25, 53, 0x9a4a0a); a.px(20, 50, 0xffd08a);                         // patches
    a.rect(76, 40, 85, 47, 0xc86a1a);
    a.rect(51, 0, 52, 10, DWD[1]); a.poly([[53, 0], [64, 3], [53, 6]], 0xff3a3a);                                         // pennant
    const bc = [0xff3a3a, 0xffd23f, 0x3a8aff, 0x7dff8a];                                                                 // bunting
    for (let i = 0; i < 8; i++) { const x0 = 20 + i * 4.2, y0 = 30 + i * 4.5 * 0.9; a.poly([[x0, y0], [x0 + 5, y0], [x0 + 2.5, y0 + 5]], bc[i % 4]); }
    a.rect(78, 44, 81, 45, ST[2]); a.ell(80, 49, 2.5, 3.5, [0xfff6c0, 0xffd23f, 0xc08a18]);                               // lantern
  });
  // the CAMPFIRE: a black fondue cauldron on a tripod over the flames, a ring of stones - 4 frames (flames + bubbles)
  for (let f = 0; f < 4; f++) pixSprite(scene, 'cr_fire' + f, 50, 56, a => {
    const k = [0, 1, 2, 1][f], kk = [1, 0, 1, 2][f];
    a.line([[6, 54], [25, 4]], DWD[2], 2); a.line([[44, 54], [25, 4]], DWD[2], 2); a.rect(24, 2, 26, 5, ST[2]);             // tripod
    a.poly([[10, 50], [14, 44], [40, 50], [36, 54]], WD); a.poly([[10, 51], [36, 44], [40, 49], [14, 54]], WD);             // logs
    a.poly([[12, 50], [16 - k, 34 + k], [20, 40], [23, 28 + kk * 2], [27, 38], [31 + k, 30], [34, 40], [38, 50]], [0xffd23f, 0xff8a1a, 0xd83a0a]);
    a.poly([[18, 50], [21, 40 + k], [24, 44], [27, 36 - kk], [31, 50]], 0xfff6c0);
    a.line([[25, 5], [25, 14]], ST[2]);                                                                                    // chain
    a.ell(25, 24, 12, 10, [0x5a5a6a, 0x2a2a34, 0x14141a]); a.rect(13, 14, 37, 17, 0x14141a);                              // cauldron
    a.ell(25, 15, 11, 3, [0xffe27a, 0xf2c040, 0xc08a18]);                                                                   // fondue
    a.ell(19 + k * 3, 14, 2, 1.6, 0xfff0a0); a.ell(30 - kk * 2, 15, 1.5, 1.2, 0xfff0a0);                                   // bubbles
    a.poly([[34, 12], [40, 4], [42, 5], [36, 13]], ST); a.ell(41, 4, 1.6, 1.6, 0xffe27a);                                  // a fork stuck in it
    for (const [x, y] of [[4, 53], [11, 55], [39, 55], [46, 53], [25, 55]]) a.ell(x, y, 3.4, 2.4, [0xa8a4b8, 0x6a6878, 0x3a3848]);   // stones
  });
  // the NOTICEBOARD: a little shingled roof, cork, a WANTED rat poster, a route map, notes and pins
  pixSprite(scene, 'cr_board', 66, 72, a => {
    a.rect(8, 30, 12, 71, DWD[1]); a.rect(53, 30, 57, 71, DWD[1]);
    a.poly([[0, 14], [33, 1], [65, 14], [60, 18], [5, 18]], [0xb84a3a, 0x8a2a1a, 0x5a140a]);                             // roof
    for (let x = 4; x < 62; x += 6) a.rect(x, 15, x + 1, 17, 0x5a140a);
    a.rrect(3, 18, 62, 52, 2, WD); a.rect(6, 21, 59, 49, 0xc8965a); for (let i = 0; i < 46; i++) a.px(7 + (i * 11) % 52, 22 + (i * 7) % 27, 0xa8763a);
    a.rect(9, 23, 26, 46, 0xf4ecd0); a.rect(11, 24, 24, 27, 0x5a1a0a);                                                   // WANTED
    a.ell(17.5, 35, 5, 5, [0x9a9ab0, 0x6a6a80, 0x3a3a50]); a.ell(13, 30, 2, 2, 0x9a9ab0); a.ell(22, 30, 2, 2, 0x9a9ab0); a.px(16, 34, 0xff3a3a); a.px(19, 34, 0xff3a3a);
    a.rect(12, 42, 23, 43, 0x5a1a0a);
    a.rect(30, 23, 56, 36, 0xe8f0ff); a.line([[33, 33], [38, 27], [44, 31], [48, 25], [53, 29]], 0xd83a2a);                 // route map
    for (const [x, y, c] of [[33, 33, 0xffd23f], [38, 27, 0xb0e0ff], [44, 31, 0xffb04a], [48, 25, 0x7dff8a], [53, 29, 0xff8ab0]]) a.ell(x, y, 1.6, 1.6, c);
    a.rect(30, 39, 42, 48, 0xffe890); a.rect(32, 41, 40, 41, 0xb87a10); a.rect(32, 44, 38, 44, 0xb87a10);
    a.rect(45, 39, 57, 48, 0xf4ecd0); a.rect(47, 41, 55, 41, 0x5a6272); a.rect(47, 44, 53, 44, 0x5a6272);
    for (const [x, y, c] of [[17, 23, 0xff3a3a], [43, 23, 0x3a8aff], [36, 39, 0x7dff8a], [51, 39, 0xff3a3a]]) a.ell(x, y, 1.4, 1.4, c);
  });
  // the PICNIC TABLE: check cloth, the blue lunchbox, a thermos, a half-eaten sandwich
  pixSprite(scene, 'cr_picnic', 76, 46, a => {
    a.poly([[10, 45], [16, 26], [19, 26], [14, 45]], DWD); a.poly([[66, 45], [60, 26], [57, 26], [62, 45]], DWD);         // legs
    a.rect(2, 38, 74, 40, DWD[1]);                                                                                        // bench
    for (let y = 22; y < 30; y++) for (let x = 4; x < 72; x++) a.px(x, y, ((x >> 2) + (y >> 1)) % 2 ? 0xf4f0e0 : 0xd83a2a);   // cloth
    a.poly([[4, 29], [72, 29], [70, 34], [6, 34]], 0xd83a2a); for (let x = 8; x < 70; x += 8) a.rect(x, 30, x + 3, 33, 0xf4f0e0);
    a.rrect(26, 6, 50, 22, 3, [0x8ac8ff, 0x3a78d8, 0x1a3a8a]); a.rect(26, 12, 50, 13, 0x1a3a8a); a.rect(36, 13, 40, 16, 0xffd23f);   // lunchbox
    a.rect(33, 1, 43, 2, ST[1]); a.rect(33, 1, 34, 6, ST[1]); a.rect(42, 1, 43, 6, ST[1]);
    a.rect(29, 16, 33, 19, 0xffe27a); a.rect(43, 16, 47, 19, 0xff8ab0);                                                  // stickers
    a.rrect(56, 8, 63, 22, 2, [0x7dff8a, 0x2a9a4a, 0x0a4a2a]); a.rect(56, 6, 63, 9, ST[1]);                               // thermos
    a.poly([[8, 22], [20, 22], [14, 15]], CH); a.rect(9, 19, 19, 20, 0x7dc84a);                                           // sandwich
  });
  // FRIDGE-O-TRON's stall: a striped awning on poles, a hand-painted LARDER board, shelves of jars
  pixSprite(scene, 'cr_stall', 92, 84, a => {
    a.rect(6, 22, 9, 83, ST[2]); a.rect(82, 22, 85, 83, ST[2]);
    for (let i = 0; i < 9; i++) a.poly([[2 + i * 10, 14], [12 + i * 10, 14], [12 + i * 10, 26], [7 + i * 10, 30], [2 + i * 10, 26]], i % 2 ? [0xffffff, 0xe8e8f0, 0xb8b8c8] : [0x5ae0c8, 0x2aa890, 0x0a6a5a]);
    a.rrect(20, 0, 72, 14, 2, WD); a.rect(23, 3, 69, 11, 0x3a2212);
    // L A R D E R in chunky pixels
    const L = (x) => { a.rect(x, 4, x, 10, 0xffd23f); a.rect(x, 10, x + 3, 10, 0xffd23f); };
    const A = (x) => { a.rect(x, 5, x, 10, 0xffd23f); a.rect(x + 3, 5, x + 3, 10, 0xffd23f); a.rect(x, 4, x + 3, 4, 0xffd23f); a.rect(x, 7, x + 3, 7, 0xffd23f); };
    const Rr = (x) => { a.rect(x, 4, x, 10, 0xffd23f); a.rect(x, 4, x + 3, 4, 0xffd23f); a.rect(x + 3, 5, x + 3, 6, 0xffd23f); a.rect(x, 7, x + 2, 7, 0xffd23f); a.rect(x + 3, 8, x + 3, 10, 0xffd23f); };
    const D = (x) => { a.rect(x, 4, x, 10, 0xffd23f); a.rect(x, 4, x + 2, 4, 0xffd23f); a.rect(x, 10, x + 2, 10, 0xffd23f); a.rect(x + 3, 5, x + 3, 9, 0xffd23f); };
    const E = (x) => { a.rect(x, 4, x, 10, 0xffd23f); a.rect(x, 4, x + 3, 4, 0xffd23f); a.rect(x, 7, x + 2, 7, 0xffd23f); a.rect(x, 10, x + 3, 10, 0xffd23f); };
    L(26); A(32); Rr(38); D(44); E(50); Rr(56); a.rect(62, 4, 66, 10, 0x3a2212);
    for (const y of [44, 62]) { a.rect(12, y, 80, y + 2, WD[1]); }
    const jar = (x, y, c) => { a.rrect(x, y - 9, x + 6, y, 1, c); a.rect(x, y - 11, x + 6, y - 9, ST[1]); a.px(x + 1, y - 7, 0xffffff); };
    [[14, 44, [0xffe27a, 0xf2c040, 0xa8700c]], [22, 44, [0xff8a6a, 0xd83a2a, 0x7a1410]], [30, 44, [0x9aff8a, 0x4ac84a, 0x1a6a1a]], [62, 44, [0xb0a0ff, 0x7a5ad8, 0x3a1a8a]], [70, 44, [0xffe27a, 0xf2c040, 0xa8700c]],
      [14, 62, [0xffc8e0, 0xff7aa8, 0x8a2a4a]], [64, 62, [0x8ae0ff, 0x3a9ad8, 0x0a4a8a]], [72, 62, [0xffe27a, 0xf2c040, 0xa8700c]]].forEach(([x, y, c]) => jar(x, y, c));
    a.ell(24, 58, 5, 4, CH); a.ell(24, 58, 1.2, 1.2, 0xa8700c);                                                         // a cheese wheel
    a.rrect(10, 70, 82, 83, 2, WD); for (let x = 14; x < 80; x += 9) a.rect(x, 72, x + 1, 82, DWD[1]);                   // counter
  });
  // the SIGNPOST home (arrows) with a mailbox
  pixSprite(scene, 'cr_sign', 44, 76, a => {
    a.rect(20, 6, 24, 75, DWD[1]);
    a.poly([[2, 14], [9, 6], [40, 6], [40, 22], [9, 22]], WD); a.rect(12, 11, 34, 12, 0xf4e0b0); a.rect(12, 15, 30, 16, 0xf4e0b0);
    a.poly([[42, 32], [35, 25], [4, 25], [4, 39], [35, 39]], [0xffd060, 0xd89a2a, 0x8a5a0a]); a.rect(9, 30, 30, 31, 0x5a3212); a.rect(9, 34, 26, 35, 0x5a3212);
    a.rect(26, 52, 40, 60, [0x6aa0ff, 0x3a68d8, 0x1a3a8a][1]); a.ell(33, 52, 7, 4, [0x6aa0ff, 0x3a68d8, 0x1a3a8a]); a.rect(31, 60, 33, 75, ST[2]); a.rect(40, 50, 41, 56, 0xff3a3a); a.rect(40, 50, 44, 52, 0xff3a3a);
  });
  // decor
  pixSprite(scene, 'cr_lamp', 16, 78, a => { a.rect(7, 8, 8, 77, ST[2]); a.rect(4, 74, 11, 77, ST[2]); a.rect(3, 4, 12, 6, ST[1]); a.ell(7.5, 11, 4, 5, [0xfff6c0, 0xffd23f, 0xc08a18]); a.rect(3, 15, 12, 16, ST[1]); });
  pixSprite(scene, 'cr_crate', 26, 24, a => { a.rect(1, 1, 24, 22, WD); a.rect(1, 1, 24, 3, DWD[1]); a.rect(1, 20, 24, 22, DWD[1]); a.line([[3, 4], [22, 19]], DWD[1], 2); a.rect(9, 9, 16, 13, 0xf4e0b0); a.px(11, 11, 0xd83a2a); a.px(14, 11, 0xd83a2a); });
  pixSprite(scene, 'cr_barrel', 20, 26, a => { a.rrect(1, 1, 18, 24, 4, [0xc87a3a, 0x8a4a1a, 0x5a2a0a]); a.rect(1, 6, 18, 7, ST[2]); a.rect(1, 18, 18, 19, ST[2]); a.ell(9.5, 2, 7, 1.5, CH); });
  pixSprite(scene, 'cr_flag', 30, 80, a => { a.rect(2, 2, 3, 79, ST[1]); a.ell(2.5, 2, 2, 2, 0xffd23f); a.poly([[4, 5], [28, 9], [26, 22], [4, 24]], [0xffe27a, 0xf2c040, 0xa8700c]); a.ell(14, 14, 4, 4, 0xa8700c); a.ell(21, 11, 1.6, 1.6, 0xa8700c); a.ell(10, 20, 1.4, 1.4, 0xa8700c); });
  pixSprite(scene, 'cr_dish', 50, 60, a => { a.rect(22, 30, 27, 59, ST[2]); a.rect(14, 54, 35, 59, ST[2]); a.poly([[4, 6], [44, 18], [30, 40], [8, 34]], ST); a.poly([[10, 12], [38, 20], [28, 34], [12, 30]], [0xc8d0e0, 0x8a94a8, 0x4a5262]); a.line([[24, 24], [40, 8]], ST[2]); a.ell(40, 8, 2.5, 2.5, 0xff3a3a); });
  pixSprite(scene, 'cr_wheels', 48, 40, a => { for (const [x, y] of [[12, 30], [34, 30], [23, 14]]) { a.ell(x, y, 11, 9, CH); a.ell(x, y - 1, 9, 2, 0xfff0a0); a.ell(x - 3, y + 2, 1.6, 1.6, 0xa8700c); a.ell(x + 4, y + 4, 1.2, 1.2, 0xa8700c); } });
  // Bessie's empty pen: a fence, hay, her bell on a post, a MISSING poster
  pixSprite(scene, 'cr_pen', 104, 54, a => {
    for (let x = 2; x < 104; x += 14) a.rect(x, 14, x + 3, 53, WD[1]);
    a.rect(2, 22, 101, 25, WD); a.rect(2, 38, 101, 41, WD);
    a.ell(50, 50, 20, 6, [0xffe890, 0xe8c050, 0xa8801a]); for (let i = 0; i < 14; i++) a.line([[34 + i * 2.4, 50], [36 + i * 2.6, 44 + (i % 3)]], 0xfff0a0);
    a.rect(80, 2, 98, 20, 0xf4ecd0); a.rect(82, 4, 96, 6, 0xd83a2a); a.ell(89, 13, 5, 4, [0xffffff, 0xd8d8e0, 0x8a8a9a]); a.ell(87, 12, 1.4, 1.2, 0x1a1020); a.ell(91, 14, 1.6, 1.3, 0x1a1020);
    a.rect(8, 4, 10, 14, DWD[1]); a.ell(9, 17, 3, 3, [0xffe27a, 0xd8a020, 0x8a6008]);
  });
  // the GUN RACK: a wooden A-frame rack with three guns on pegs and an ammo crate
  pixSprite(scene, 'cr_rack', 60, 62, a => {
    a.line([[4, 61], [14, 4]], DWD[1], 3); a.line([[56, 61], [46, 4]], DWD[1], 3); a.rect(10, 2, 50, 6, WD);
    for (const y of [18, 34, 50]) a.rect(8, y, 52, y + 2, WD[1]);
    a.rrect(14, 10, 42, 16, 2, [0xffb060, 0xff8a1a, 0xa8480a]); a.rect(42, 11, 50, 14, ST[1]); a.rect(18, 16, 22, 20, DWD[2]);          // mac-grinder
    a.rrect(14, 26, 38, 32, 2, [0x8ae0ff, 0x3a9ad8, 0x0a4a8a]); a.ell(42, 29, 4, 4, ST); a.rect(18, 32, 22, 36, DWD[2]);                  // spinner
    a.rrect(14, 42, 44, 47, 2, [0xfff0a0, 0xf2c040, 0xa8700c]); a.ell(22, 44, 1.2, 1.2, 0xa8700c); a.ell(32, 45, 1, 1, 0xa8700c); a.rect(44, 43, 49, 46, ST[2]);   // swiss-shot
    a.rect(20, 54, 40, 61, [0x6a8a3a, 0x4a6a2a, 0x2a3a14][1]); a.rect(20, 54, 40, 55, 0x8aaa4a); a.rect(27, 57, 33, 58, 0xffd23f);
  });
  // the TRAINING DUMMY: a straw rat stuffed into a sack on a post, a target painted on its belly
  pixSprite(scene, 'cr_dummy', 40, 66, a => {
    a.rect(18, 30, 21, 65, DWD[1]); a.rect(10, 62, 29, 65, DWD[1]);
    a.rrect(8, 22, 31, 50, 6, [0xe8d090, 0xc8a85a, 0x8a6a2a]); for (let i = 0; i < 10; i++) a.px(10 + (i * 7) % 20, 25 + (i * 5) % 22, 0xa8884a);
    a.ell(19.5, 37, 7, 7, 0xf4f0e0); a.ell(19.5, 37, 5, 5, 0xd83a2a); a.ell(19.5, 37, 3, 3, 0xf4f0e0); a.ell(19.5, 37, 1.4, 1.4, 0xd83a2a);
    a.ell(19.5, 14, 9, 8, [0xe8d090, 0xc8a85a, 0x8a6a2a]); a.ell(11, 7, 3.5, 3.5, [0xe8d090, 0xc8a85a, 0x8a6a2a]); a.ell(28, 7, 3.5, 3.5, [0xe8d090, 0xc8a85a, 0x8a6a2a]);
    a.rect(14, 12, 17, 13, 0x1a1020); a.rect(22, 12, 25, 13, 0x1a1020); a.rect(15, 11, 16, 14, 0x1a1020); a.rect(23, 11, 24, 14, 0x1a1020);      // stitched X eyes
    a.rect(17, 18, 22, 18, 0x5a3212); a.line([[29, 15], [37, 12]], 0xc8a85a); a.line([[29, 17], [38, 18]], 0xc8a85a);                   // mouth, whiskers
    a.line([[31, 44], [38, 54]], 0xc8a85a, 2);                                                                                             // tail
  });
  pixSprite(scene, 'cr_dice', 22, 22, a => { a.rrect(1, 1, 20, 20, 4, [0xffffff, 0xe0e4f0, 0x9aa4b4]); for (const [x, y] of [[6, 6], [15, 6], [10.5, 10.5], [6, 15], [15, 15]]) a.ell(x, y, 1.8, 1.8, 0xd83a2a); });
  pixSprite(scene, 'cr_lunchbox', 24, 20, a => { a.rrect(1, 5, 22, 19, 3, [0x8ac8ff, 0x3a78d8, 0x1a3a8a]); a.rect(1, 10, 22, 11, 0x1a3a8a); a.rect(10, 11, 13, 13, 0xffd23f); a.rect(7, 1, 16, 2, 0x9aa4b4); a.rect(7, 1, 8, 5, 0x9aa4b4); a.rect(15, 1, 16, 5, 0x9aa4b4); a.rect(4, 14, 7, 17, 0xffe27a); });
  pixSprite(scene, 'cr_crumb', 12, 11, a => { a.poly([[1, 7], [5, 1], [11, 3], [10, 9], [4, 10]], [0xfff0a0, 0xffc83a, 0xb87a10]); a.px(5, 4, 0xffffff); a.px(8, 6, 0xb87a10); });
}

// ---------------------------------------------------------------- the card shelf: a dressed-up chooser used all over camp
// opts: { title, sub, cards: [{ icon, name, desc, foot, footCol, pips: [n, max], tag, tagCol, dim, col }], buttons: [{ label, act, col }],
//         onPick(i), onClose(), cols }
function makeShelf(scene, opts) {
  const W = scene.scale.width, H = scene.scale.height, f = RUN_UI.f, c = scene.add.container(0, 0).setDepth(60);
  let sel = 0, hits = [], dead = false, cards = opts.cards || [], selG, t = 0;
  const build = () => {
    c.removeAll(true); hits = [];
    const small = H < 430, n = cards.length, cols = opts.cols || Math.min(n, W < 700 ? 3 : 4), rows = Math.max(1, Math.ceil(n / cols));
    const pw = Math.min(W - 16, cols * 200 + 40), x0 = (W - pw) / 2;
    const cw = (pw - 28 - (cols - 1) * 10) / cols, chMax = small ? 104 : 140;
    const btnH = opts.buttons && opts.buttons.length ? 30 : 0, head = small ? 44 : 58;
    const ch = Math.max(70, Math.min(chMax, (H - 24 - head - btnH - 26 - (rows - 1) * 10) / rows));
    const ph = head + rows * ch + (rows - 1) * 10 + btnH + 26, y0 = Math.max(6, (H - ph) / 2);
    c.add(scene.add.rectangle(0, 0, W, H, 0x05030c, 0.6).setOrigin(0).setInteractive());
    const g = scene.add.graphics(); c.add(g);
    // the panel: ink, a gold frame, a deep blue body with a faint dither, and a title plate across the top
    g.fillStyle(0x1a1020, 1).fillRect(x0 - 4, y0 - 4, pw + 8, ph + 8);
    g.fillStyle(0xc8962a, 1).fillRect(x0 - 2, y0 - 2, pw + 4, ph + 4); g.fillStyle(0xffd23f, 1).fillRect(x0 - 2, y0 - 2, pw + 4, 2);
    g.fillStyle(0x121838, 1).fillRect(x0, y0, pw, ph);
    for (let yy = y0 + 2; yy < y0 + ph; yy += 4) for (let xx = x0 + ((yy >> 2) % 2) * 2; xx < x0 + pw; xx += 4) g.fillStyle(0x1a2250, 1).fillRect(xx, yy, 1, 1);
    g.fillStyle(0x5a140a, 1).fillRect(x0, y0, pw, head - 10); g.fillStyle(0x8a2a1a, 1).fillRect(x0, y0, pw, 3); g.fillStyle(0x3a0a06, 1).fillRect(x0, y0 + head - 13, pw, 3);
    for (const sx of [x0 + 10, x0 + pw - 10]) { g.fillStyle(0xffd23f, 1).fillRect(sx - 2, y0 + 8, 4, 4); }
    c.add(scene.add.text(W / 2, y0 + (small ? 6 : 9), opts.title, f(small ? 13 : 16, '#ffd23f', { stroke: '#2a0606', strokeThickness: 5 })).setOrigin(0.5, 0));
    if (opts.sub) c.add(scene.add.text(W / 2, y0 + (small ? 23 : 30), typeof opts.sub === 'function' ? opts.sub() : opts.sub, f(7, '#ffd8b0', { strokeThickness: 3 })).setOrigin(0.5, 0));
    // the cards
    cards.forEach((cd, i) => {
      const col = i % cols, row = Math.floor(i / cols), rowN = Math.min(cols, n - row * cols);
      const x = x0 + 14 + (cols - rowN) * (cw + 10) / 2 + col * (cw + 10), y = y0 + head + row * (ch + 10);
      const gg = scene.add.graphics(); c.add(gg);
      const tone = cd.col || 0x2a3a7a;
      gg.fillStyle(0x1a1020, 1).fillRect(x - 2, y - 2, cw + 4, ch + 4);
      gg.fillStyle(cd.dim ? 0x2a2e48 : 0x9aa4c8, 1).fillRect(x - 1, y - 1, cw + 2, ch + 2);
      gg.fillStyle(cd.dim ? 0x161a30 : 0x1c2452, 1).fillRect(x, y, cw, ch);
      gg.fillStyle(cd.dim ? 0x1e2238 : tone, 1).fillRect(x, y, cw, 14);                                 // a header band right across the top
      gg.fillStyle(0xffffff, cd.dim ? 0.03 : 0.12).fillRect(x, y, cw, 2);
      const ix = x + Math.min(34, cw * 0.18), iy = y + 14 + (ch - 14) * 0.42, ir = Math.min(26, ch * 0.27);
      gg.fillStyle(cd.dim ? 0x1a1e34 : tone, 0.5).fillCircle(ix, iy, ir); gg.fillStyle(0xffffff, cd.dim ? 0.02 : 0.08).fillCircle(ix - ir * 0.3, iy - ir * 0.3, ir * 0.45);
      if (cd.icon && scene.textures.exists(cd.icon)) { const im = RUN_UI.fit(scene.add.image(ix, iy, cd.icon), ir * 1.6); if (cd.dim) im.setTint(0x3a4060); c.add(im); }
      else if (cd.planet) { for (const o of RUN_UI.planetImg(scene, cd.planet, ix, iy, ir * 0.8)) c.add(o); }
      else if (cd.dim) c.add(scene.add.text(ix, iy, '?', f(16, '#3a4270', { strokeThickness: 0 })).setOrigin(0.5));
      c.add(scene.add.text(x + 6, y + 3, cd.tag || '', f(6, cd.tagCol || '#ffffff', { strokeThickness: 2 })));
      const tx = x + Math.min(34, cw * 0.18) * 2 + 4, tw = x + cw - tx - 6;
      c.add(scene.add.text(tx, y + 20, cd.name, f(cw < 190 ? 8 : 9, cd.dim ? '#5a6290' : '#ffffff', { strokeThickness: 3, wordWrap: { width: tw } })));
      c.add(scene.add.text(tx, y + (cw < 190 ? 34 : 36), cd.desc || '', f(cw < 190 ? 6 : 7, cd.dim ? '#4a5280' : '#b8c0e0', { strokeThickness: 2, wordWrap: { width: tw }, lineSpacing: 3 })));
      if (cd.pips) for (let p = 0; p < cd.pips[1]; p++) gg.fillStyle(0x1a1020, 1).fillRect(tx + p * 9 - 1, y + ch - 13, 8, 8).fillStyle(p < cd.pips[0] ? 0xffd23f : 0x3a4270, 1).fillRect(tx + p * 9, y + ch - 12, 6, 6);
      if (cd.foot) {
        const ft = scene.add.text(x + cw - 6, y + ch - 6, cd.foot, f(8, cd.footCol || '#ffd23f', { strokeThickness: 3 })).setOrigin(1, 1); c.add(ft);
        if (cd.footIcon) c.add(scene.add.image(ft.x - ft.width - 8, ft.y - 6, cd.footIcon).setScale(1.5));
      }
      hits.push({ x, y, w: cw, h: ch, i, card: true });
    });
    (opts.buttons || []).forEach((b, k) => {
      const nb = opts.buttons.length, bw = Math.min(170, (pw - 40) / nb - 10), bx = W / 2 + (k - (nb - 1) / 2) * (bw + 14) - bw / 2, by = y0 + ph - btnH - 12;
      const gg = scene.add.graphics(); c.add(gg);
      gg.fillStyle(0x1a1020, 1).fillRect(bx - 2, by - 2, bw + 4, 26); gg.fillStyle(b.col || 0xffd23f, 1).fillRect(bx - 1, by - 1, bw + 2, 24); gg.fillStyle(0x1d2a5a, 1).fillRect(bx + 1, by + 1, bw - 2, 20);
      gg.fillStyle(0xffffff, 0.1).fillRect(bx + 1, by + 1, bw - 2, 3);
      c.add(scene.add.text(bx + bw / 2, by + 11, b.label, f(9, '#ffd23f', { strokeThickness: 3 })).setOrigin(0.5));
      hits.push({ x: bx, y: by, w: bw, h: 22, b });
    });
    // the X
    const xg = scene.add.text(x0 + pw - 8, y0 + 6, 'X', f(11, '#ffd8b0', { stroke: '#2a0606', strokeThickness: 4 })).setOrigin(1, 0); c.add(xg);
    hits.push({ x: xg.x - 24, y: y0, w: 30, h: 26, close: true });
    selG = scene.add.graphics(); c.add(selG);
    if (sel >= hits.length - 1) sel = 0;
  };
  const navN = () => hits.length - 1;                     // (the X isn't in the cursor's loop)
  const fire = (h) => {
    if (dead || !h) return;
    if (h.close) { api.close(); return; }
    if (h.b) { Sound.sfx('pickup'); h.b.act(); return; }
    if (opts.onPick) opts.onPick(h.i);
  };
  const move = d => { if (!navN()) return; sel = (sel + d + navN()) % navN(); Sound.sfx('jump'); };
  const cols = () => opts.cols || Math.min(cards.length, scene.scale.width < 700 ? 3 : 4);
  const onKey = e => {
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') move(-1);
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') move(1);
    else if (k === 'ArrowUp' || k === 'w' || k === 'W') move(-cols());
    else if (k === 'ArrowDown' || k === 's' || k === 'S') move(cols());
    else if (k === 'Enter' || k === ' ' || k === 'z' || k === 'Z' || k === 'x' || k === 'X') fire(hits[sel]);
    else if (k === 'Escape' || k === 'Backspace') api.close();
  };
  window.addEventListener('keydown', onKey);
  const padOff = Pad.on(b => { if (b === 'left') move(-1); else if (b === 'right') move(1); else if (b === 'up') move(-cols()); else if (b === 'down') move(cols()); else if (b === 'a') fire(hits[sel]); else if (b === 'b' || b === 'back' || b === 'start') api.close(); });
  const onUp = p => { if (dead || api.age < 0.2) return; const h = hits.find(r => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h); if (!h) return; const i = hits.indexOf(h); if (h.card && sel !== i && !opts.oneTap) { sel = i; Sound.sfx('jump'); return; } sel = i < navN() ? i : sel; fire(h); };
  scene.input.on('pointerup', onUp);
  const tick = (time, dms) => {
    if (dead) return; t += dms / 1000; api.age += dms / 1000;
    const h = hits[sel]; selG.clear();
    if (h) { const a = 0.7 + 0.3 * Math.sin(t * 7); selG.lineStyle(3, 0xffd23f, a).strokeRect(h.x - 4, h.y - 4, h.w + 8, h.h + 8); selG.fillStyle(0xffd23f, a).fillRect(h.x - 6, h.y - 6, 5, 5).fillRect(h.x + h.w + 1, h.y - 6, 5, 5).fillRect(h.x - 6, h.y + h.h + 1, 5, 5).fillRect(h.x + h.w + 1, h.y + h.h + 1, 5, 5); }
  };
  scene.events.on('update', tick);
  const api = {
    age: 0,
    get sel() { return sel; },
    setCards(cs) { cards = cs; build(); },
    close() { if (dead) return; api.destroy(); Sound.sfx('jump'); if (opts.onClose) opts.onClose(); },
    destroy() { if (dead) return; dead = true; window.removeEventListener('keydown', onKey); padOff(); scene.input.off('pointerup', onUp); scene.events.off('update', tick); scene.scale.off('resize', build); c.destroy(); }
  };
  scene.scale.on('resize', build);
  scene.events.once('shutdown', () => api.destroy());
  build();
  c.setAlpha(0); scene.tweens.add({ targets: c, alpha: 1, duration: 160 });
  return api;
}

// ---------------------------------------------------------------- the camp, as a mode of the level scene (mixed into Level1)
const CampMixin = {
  campInit(data) {
    this.camp = true; this.levelId = 1; this.def = campDef(); R = this.def.radius;
    this.waves = []; this.autostart = true; this.campSum = (data && data.sum) || null;
  },
  campStart() {
    makeCampTextures(this); makeGrowTextures(this); makeCavernTextures(this); makeToyTextures(this); if (typeof makeLabTextures === 'function') makeLabTextures(this);
    this.hideOverlay(); this.state = 'play'; Sound.init(); Sound.music('title');
    this.campPanel = null; this.campCool = 0.4; this.campDownHeld = true; this.campGo = false; this.campFx = []; this.campSparkT = 0; this.campCard = null;
    this.campSt = CAMP_ST.map(d => { const spr = this.add.image(0, 0, d.tex).setOrigin(0.5, 1).setDepth(d.id === 'rocket' ? 2.35 : 2.4); spr.bsx = spr.bsy = d.sc;
      const a = { spr, theta: d.theta, h: (d.h || 0) - this.campSink(spr, d.sc), rot: 0 }; this.actors.push(a); return Object.assign({}, d, { a }); });
    for (const [tex, theta, sc, h, dep] of CAMP_DECOR) { if (!this.textures.exists(tex)) continue; const spr = this.add.image(0, 0, tex).setOrigin(0.5, 1).setDepth(dep); spr.bsx = spr.bsy = sc; this.actors.push({ spr, theta, h: h - (h > 0 ? 0 : this.campSink(spr, sc)), rot: 0 }); }
    this.campBot = { spr: this.add.image(0, 0, 'shopbot').setOrigin(0.5, 1).setDepth(2.45), theta: -1.36, h: 0, rot: 0 }; this.campBot.spr.bsx = this.campBot.spr.bsy = 1.3; this.actors.push(this.campBot);
    this.campFolkInit();
    this.ball = null; this.ballInit();
    this.campCaveInit();
    this.toysInit();                                                       // (v3.42) the camp toys (camptoys.js)
    this.campGrowInit();                                                   // (v3.36) the camp grows (campgrow.js)                                     // (v3.32) the beach ball
    this.campGlow = this.add.image(0, 0, 'puff').setDepth(2.2).setBlendMode(Phaser.BlendModes.ADD).setTint(0xff8a2a);
    this.campLightG = this.add.graphics().setDepth(2.5);
    const f = RUN_UI.f;
    this.campPrompt = this.add.text(0, 0, '', f(9, '#1a1020', { stroke: '#1a1020', strokeThickness: 0, backgroundColor: '#ffd23f', padding: { x: 7, y: 5 } })).setOrigin(0.5, 1).setDepth(19).setVisible(false).setInteractive({ useHandCursor: true });
    this.campPrompt.on('pointerup', () => { const s = this.campTarget(); if (s) this.campUse(s); });
    this.campName = this.add.text(0, 0, '', f(8, '#ffffff', { strokeThickness: 4 })).setOrigin(0.5, 1).setDepth(19);
    this.campBubble = this.add.text(0, 0, '', f(7, '#1a1020', { stroke: '#1a1020', strokeThickness: 0, backgroundColor: '#f4f0e0', padding: { x: 6, y: 5 }, align: 'center', wordWrap: { width: 180 } })).setOrigin(0.5, 1).setDepth(18.5).setVisible(false);
    this.campHud = this.add.container(0, 0).setDepth(21);
    this.campHudBuild();
    this.campLine = this.campPickLine();
    const P = this.pl; P.theta = this.campSum ? 0.42 : -0.14;
    if (this.campSum && this.campSum.cavern) { P.theta = 1.65; P.h = 0; P.vh = 560; Sound.sfx('jump'); this.time.delayedCall(900, () => this.campShowCard()); }   // (v3.41) popping back out of the cavern hole
    else if (this.campSum) { P.h = 640; P.vh = -120; this.time.delayedCall(1500, () => this.campShowCard()); }
    else this.time.delayedCall(900, () => this.campSay(this.campLine, 4.5));
  },
  // a flat-bottomed sprite on a round moon: drop it by the curve's sag under its half-width so its ends touch down
  campSink(spr, sc) { const hw = spr.width * sc / 2; return hw * hw / (2 * R) * 0.9; },
  // whatever Chris is standing at: one of the folk (to TALK to) or a station
  campTarget() {
    if (this.campPanel || this.campGo || this.campCard || this.campChat) return null;
    const s = this.campNear(), fN = this.campFolk && this.campFolkNear();
    // (v3.32) the stations come first; folk only win if they're closer, and Biscuit only when there's nothing else to use
    if (fN && (!s || (fN.F.id !== 'dog' && fN.d < Math.abs(angDiff(this.pl.theta, s.theta)) * R))) return fN.F;
    return s;
  },
  campHudBuild() {
    const f = RUN_UI.f, W = this.scale.width; this.campHud.removeAll(true);
    const g = this.add.graphics(); this.campHud.add(g);
    g.fillStyle(0x1a1020, 0.8).fillRect(8, 8, 128, 30); g.fillStyle(0xffd23f, 1).fillRect(8, 8, 128, 2);
    this.campHud.add(this.add.image(24, 23, 'cr_crumb').setScale(2));
    this.campCrumbT = this.add.text(40, 16, String(Meta.crumbs()), f(10, '#ffd23f')); this.campHud.add(this.campCrumbT);
    this.campHud.add(this.add.text(40, 29, 'GOLDEN CRUMBS', f(5, '#c9cde0', { strokeThickness: 2 })));
    if (Progress.testMode) {                                         // (v3.25) TEST MODE: crumbs on tap
      const tb = this.add.text(8, 44, '+500 CRUMBS (TEST)', f(6, '#1a1020', { strokeThickness: 0, backgroundColor: '#ffd23f', padding: { x: 5, y: 4 } })).setInteractive({ useHandCursor: true });
      tb.on('pointerup', () => { Meta.addCrumbs(500); Sound.sfx('power'); this.campHudBuild(); }); this.campHud.add(tb);
    }
    this.campHud.add(this.add.text(W / 2, 8, 'MOON CAMP', f(Math.min(18, W / 34), '#ffd23f', { stroke: '#5a0a0a', strokeThickness: 5 })).setOrigin(0.5, 0));
    const b = Run.best();
    this.campHud.add(this.add.text(W / 2, 32, 'STRENGTH: ' + STRENGTHS[Run.tierSel()].name + '   GUN: ' + runGun().short + '   LUNCH: ' + Meta.kit().name, f(6, '#c9cde0', { strokeThickness: 3 })).setOrigin(0.5, 0));
  },
  campPickLine() {
    const S = this.campSum, P = (a) => a[Math.floor(Math.random() * a.length)];
    { const seen = storySeen(), last = seen[seen.length - 1]; if (last && STORY[last].fridge && Math.random() < 0.5) return STORY[last].fridge; }
    if (!S) return Meta.stats().runs ? P(['BACK FOR MORE? CRUMBS ARE CRUMBS, CHEF.', 'THE LARDER IS STOCKED. YOUR POCKETS?', 'I SELL THINGS THAT LAST. UNLIKE YOU.']) :
      'WELCOME TO CAMP, CHEF! GO OUT, GET GRATED, BRING ME GOLDEN CRUMBS.';
    if (S.how === 'won') return 'A LEGEND! NOW SPEND, SPEND, SPEND!';
    if (S.how === 'quit') return 'GAVE UP? THE CRUMBS STILL COUNT.';
    return P(['GRATED AGAIN? HAPPENS TO THE BEST CHEESES.', 'OUCH. STILL, CRUMBS ARE CRUMBS.', 'YOU SMELL OF RAT. TRADE?', 'DEATH IS JUST A LONG NAP. SPEND!']);
  },
  campSay(text, secs) { this.campBubble.setText(text).setVisible(true); this.campBubbleT = secs || 3.5; },
  campNear() {
    const P = this.pl; let best = null, bd = 1e9;
    for (const s of this.campSt) { if (s.id === 'cave' && !this.cvStation) continue; if (s.id === 'clay' && this.toyOpen && !this.toyOpen('clay')) continue; const d = Math.abs(angDiff(P.theta, s.theta)) * R; if (d < bd) { bd = d; best = s; } }
    return bd < 46 && P.h < 60 ? best : null;
  },
  campUpdate(dt, inp) {
    this.campCool = Math.max(0, this.campCool - dt);
    const near = this.campTarget();
    if (inp.down && !this.campDownHeld && near && this.campCool <= 0) this.campUse(near);
    this.campFolkUpdate(dt);
    this.campCaveTick(dt);
    this.toysUpdate(dt);
    this.ballUpdate(dt);
    this.campDownHeld = !!inp.down;
    // the fire: sparks and smoke
    this.campSparkT -= dt;
    if (this.campSparkT <= 0) { this.campSparkT = 0.09; const fire = this.campSt.find(s => s.id === 'fire');
      const spr = this.add.image(0, 0, Math.random() < 0.7 ? 'spark' : 'puff').setDepth(2.3).setBlendMode(Phaser.BlendModes.ADD);
      const smoke = spr.texture.key === 'puff'; spr.setTint(smoke ? 0x8a7a9a : 0xffb03a).setBlendMode(smoke ? Phaser.BlendModes.NORMAL : Phaser.BlendModes.ADD);
      spr.bsx = spr.bsy = smoke ? 0.5 : rnd(0.4, 0.8);
      this.campFx.push({ spr, theta: fire.theta + rnd(-0.015, 0.015), h: 40, vt: rnd(-0.03, 0.03), vh: smoke ? 40 : rnd(60, 130), life: smoke ? 2.2 : rnd(0.6, 1.2), max: smoke ? 2.2 : 1, smoke }); }
    for (let i = this.campFx.length - 1; i >= 0; i--) { const q = this.campFx[i]; q.life -= dt; q.h += q.vh * dt; q.theta += q.vt * dt + Math.sin(this.t * 3 + i) * 0.002;
      if (q.smoke) { q.spr.bsx = q.spr.bsy = 0.5 + (1 - q.life / q.max) * 1.6; }
      if (q.life <= 0) { q.spr.destroy(); this.campFx.splice(i, 1); } }
    if (this.campBubbleT > 0) { this.campBubbleT -= dt; if (this.campBubbleT <= 0) this.campBubble.setVisible(false); }
    if (this.campGo) this.campLaunchTick(dt);
  },
  // after render: the level HUD goes, the camp's own bits go on
  campDraw() {
    for (const o of [this.heartsText, this.fpsText, this.waveText, this.scoreText, this.nameText, this.jetText, this.macText, this.portrait, this.distText, this.weaponIcon, this.swapText, this.armText, this.coinText, this.lvText, this.livesText, this.cowIcon, this.chrisMark, this.cheatText])
      if (o) o.setVisible(false);
    for (const o of this.cheeseIcons.concat(this.macIcons)) o.setVisible(false);
    this.hudG.clear(); if (this.armG) this.armG.clear();
    const t = this.t, z = this.zoom;
    for (const s of this.campSt) if (s.id === 'fire') s.a.spr.setTexture('cr_fire' + (Math.floor(t * 9) % 4));
    for (const q of this.campFx) { this.place(q.spr, q.theta, q.h, 0); q.spr.setAlpha(Math.min(1, q.life / q.max * 1.5) * (q.smoke ? 0.35 : 1)); }
    { const fp = this.screenPos(0.06, 30); this.campGlow.setPosition(fp.x, fp.y).setScale(z * 3.4).setAlpha(fp.vis ? 0.3 + 0.07 * Math.sin(t * 9) + 0.04 * Math.sin(t * 23) : 0); }
    // strings of bulbs between the lamp posts
    const g = this.campLightG; g.clear();
    const cols = [0xff5a5a, 0xffd23f, 0x5ab0ff, 0x7dff8a, 0xff8ad8];
    CAMP_LIGHTS.forEach(([a, b], li) => {
      const N = 18, pts = [];
      for (let k = 0; k <= N; k++) { const u = k / N; pts.push(this.screenPos(a + (b - a) * u, 128 - 30 * 4 * u * (1 - u))); }
      if (!pts.some(p => p.vis)) return;
      g.lineStyle(Math.max(1, 2 * z), 0x2a1a20, 1); g.beginPath(); g.moveTo(pts[0].x, pts[0].y); for (const p of pts) g.lineTo(p.x, p.y); g.strokePath();
      for (let k = 1; k < N; k += 2) { const p = pts[k], c = cols[(k + li) % cols.length], on = Math.sin(t * 2.2 + k * 0.9 + li) > -0.6;
        g.fillStyle(c, on ? 0.25 : 0).fillCircle(p.x, p.y + 4 * z, 7 * z); g.fillStyle(on ? c : 0x3a3040, 1).fillCircle(p.x, p.y + 4 * z, 3 * z); }
    });
    // the station under Chris: its name, and the USE prompt
    this.campFolkDraw();
    const near = this.campTarget(), dev = inputDevice();
    if (near) {
      const sp = this.screenPos(this.pl.theta, this.pl.h + 118);                 // just over Chris's hat
      this.campPrompt.setText((dev === 'touch' ? 'TAP: ' : dev === 'pad' ? 'DOWN: ' : '[S] / [DOWN]: ') + near.verb).setVisible(true).setPosition(Math.max(110, Math.min(this.W - 110, sp.x)), Math.max(70, sp.y + Math.sin(t * 5) * 2));
      this.campName.setText(near.name).setVisible(true).setPosition(sp.x, this.campPrompt.y - this.campPrompt.height - 2);
    } else { this.campPrompt.setVisible(false); this.campName.setVisible(false); }
    if (this.campChat || this.campPanel) this.campBubble.setVisible(false);
    if (this.campBubble.visible) { const b = this.campBot.spr.getBounds(); this.campBubble.setPosition(Math.max(100, Math.min(this.W - 100, b.centerX)), this.campPrompt.visible ? Math.min(b.y - 4, this.campName.y - this.campName.height - 6) : b.y - 4).setAlpha(this.campBot.spr.visible ? 1 : 0); }
    if (this.campGo && this.campGo.t > 0.15) this.rig.root.setAlpha(0);
  },
  // ---- the stations
  campOpen(opts) {
    this.state = 'campmenu'; this.pl.vx = 0; this.pl.firing = 0;
    this.campPanel = makeShelf(this, Object.assign({}, opts, { onClose: () => { this.campPanel = null; this.state = 'play'; this.campCool = 0.35; this.campDownHeld = true; this.campHudBuild(); if (opts.onClose) opts.onClose(); } }));
  },
  campUse(st) {
    if (this.campPanel || this.campGo || this.campCard || this.campChat) return;
    if (st.folk) { this.campTalk(st); return; }
    Sound.sfx('pickup');
    ({ train: () => { if (this.campGo) return; this.campGo = { leave: true, t: 0 }; this.cameras.main.fadeOut(300, 0, 0, 0); this.time.delayedCall(330, () => this.scene.start('level1', { training: { from: 'camp' } })); }, rack: () => this.campRack(), sign: () => this.campLeave(), board: () => this.campBoard(), lunch: () => this.campLunch(), fire: () => this.campFire(), larder: () => this.campLarder(), rocket: () => this.campRocket(), rush: () => this.campRush(), cave: () => this.campCaveGo(), clay: () => this.clayStart() })[st.id]();
  },
  campLeave() { if (this.campGo) return; this.campGo = { leave: true, t: 0 }; this.cameras.main.fadeOut(350, 0, 0, 0); this.time.delayedCall(380, () => this.scene.start('menu')); },
  campBoard() {
    const st = Meta.stats(), b = Run.best(), last = Meta._j('lc_run_last', null);
    const lastTxt = !last ? 'No runs yet. Off you go!' : last.how === 'won' ? 'WON THE LOT!' : last.how === 'quit' ? 'Gave up after ' + last.planets + ' planet' + (last.planets === 1 ? '' : 's') + '.' :
      'Grated on ' + ((LEVELS[last.at] && (LEVELS[last.at].short || LEVELS[last.at].name)) || 'a rock') + '.';
    this.campOpen({ title: 'NOTICEBOARD', sub: 'THE CAMP RECORDS', cols: 3, cards: [
      { icon: 'goldwheel', name: 'BEST RUN', desc: b ? b.planets + ' planet' + (b.planets === 1 ? '' : 's') + ' cleared\nscore ' + b.score + '\nstrongest: ' + STRENGTHS[Run.tierMax()].name : 'None yet.', col: 0x8a5a0a, tag: 'RECORD', tagCol: '#ffd23f' },
      { icon: 'c_head', name: 'RUNS: ' + st.runs, desc: 'Wins: ' + st.wins + '\nPlanets cleared: ' + st.planets, col: 0x2a4a8a, tag: 'STATS' },
      { icon: 'wi_rat', name: 'RATS: ' + st.kills, desc: 'Squashed, zapped and grated over all your runs.', col: 0x6a2a3a, tag: 'TALLY' },
      { planet: last && last.at ? last.at : 1, name: 'LAST RUN', desc: lastTxt, col: 0x3a2a6a, tag: 'LOG' },
      { icon: 'cr_crumb', name: 'CRUMBS: ' + Meta.crumbs(), desc: 'Spend them at the Larder. They never go stale.', col: 0x7a5a0a, tag: 'WALLET', tagCol: '#ffd23f' },
      { icon: 'hud_cheese', name: 'NEW LUNCHES', desc: 'More packed lunches unlock as your best run gets further.', col: 0x2a6a4a, tag: 'TIP' }
    ], buttons: [{ label: 'BACK', act: () => this.campPanel.close() }] });
  },
  campLunch() {
    const cur = () => Meta.kit().id;
    const cards = () => KITS.map(k => {
      const ok = Meta.kitOk(k), p = k.perk && RUN_PERKS.find(q => q.id === k.perk);
      return ok ? { icon: p ? RUN_UI.iconFor(this, p) : 'cr_lunchbox', name: k.name, desc: k.desc, col: cur() === k.id ? 0x8a5a0a : 0x2a3a7a, tag: cur() === k.id ? 'PACKED' : 'LUNCH', tagCol: cur() === k.id ? '#ffd23f' : '#ffffff', foot: cur() === k.id ? 'PACKED!' : '', footCol: '#7dff8a' }
        : { dim: true, name: '???', desc: 'Reach planet ' + (k.need + 1) + ' in a run to unlock.', tag: 'LOCKED', tagCol: '#5a6290' };
    });
    this.campOpen({ title: 'PACK A LUNCH', sub: 'ONE STARTER PERK FOR YOUR NEXT RUN', cards: cards(), cols: 4, buttons: [{ label: 'DONE', act: () => this.campPanel.close() }],
      onPick: i => { const k = KITS[i]; if (!Meta.kitOk(k)) { Sound.sfx('zing'); return; } Meta.setKit(k.id); Sound.sfx('power'); this.cameras.main.flash(100, 255, 240, 200); this.campPanel.setCards(cards()); } });
  },
  campFire() {
    this.pl.duck = true;
    this.campOpen({ title: 'BY THE FIRE', sub: 'HOW A RUN WORKS', cols: 3, cards: [
      { icon: 'c_head', name: 'ONE LIFE', desc: 'No checkpoints, no extra lives. Get grated and it\'s back to camp.', col: 0x6a2a3a, tag: '1' },
      { planet: 4, name: 'SHORT PLANETS', desc: 'Three waves and a boss each. Pick your path at the forks.', col: 0x2a4a8a, tag: '2' },
      { icon: 'pu_sauce', name: 'PERKS', desc: 'Beat a boss: pick one of three perks. They last the run.', col: 0x7a3a1a, tag: '3' },
      { icon: 'cheddar', name: 'CHEDDAR', desc: 'Spend it in the ship shop between planets. Run only.', col: 0x8a6a0a, tag: '4' },
      { icon: 'cr_crumb', name: 'GOLDEN CRUMBS', desc: '8 a planet, 1 per 10 rats, 1 per 50 cheddar. Kept for good.', col: 0x8a5a0a, tag: '5', tagCol: '#ffd23f' },
      { icon: runGun().gunTex, name: 'YOUR GUNS', desc: 'Every gun you\'ve found in the campaign comes too.', col: 0x2a6a5a, tag: '6' }
    ], buttons: [{ label: 'BACK', act: () => this.campPanel.close() }], onClose: () => { this.pl.duck = false; } });
  },
  campLarder() {
    this.campSay('WHAT ARE YOU BUYING?', 2.5);
    const icons = { hearty: 'hud_cheese', purse: 'cheddar', rind: 'si_armour', toque: 'c_head', dice: 'cr_dice', menu4: 'pu_magnet' };
    const tones = { hearty: 0x7a2a3a, purse: 0x8a6a0a, rind: 0x2a3a5a, toque: 0x5a3a7a, dice: 0x2a6a5a, menu4: 0x7a3a1a };
    const cards = () => LARDER.map(u => { const lv = Meta.lv(u.id), max = lv >= u.cost.length, c = u.cost[lv], can = !max && Meta.crumbs() >= c;
      return { icon: icons[u.id], name: u.name, desc: u.desc, col: tones[u.id], pips: [lv, u.cost.length], tag: max ? 'OWNED' : 'LV ' + (lv + 1), tagCol: max ? '#7dff8a' : '#ffffff',
        foot: max ? 'SOLD OUT' : String(c), footCol: max ? '#7dff8a' : can ? '#ffd23f' : '#ff7a6a', footIcon: max ? null : 'cr_crumb' }; });
    this.campOpen({ title: "FRIDGE-O-TRON'S LARDER", sub: () => 'YOU HAVE ' + Meta.crumbs() + ' GOLDEN CRUMBS', cards: cards(), cols: 3, buttons: [{ label: 'DONE', act: () => this.campPanel.close() }],
      onPick: i => { const u = LARDER[i], lv = Meta.lv(u.id);
        if (lv >= u.cost.length) { Sound.sfx('clunk'); this.campSay('YOU ALREADY HAVE THE LOT.', 2); return; }
        if (!Meta.buy(u)) { Sound.sfx('zing'); this.cameras.main.shake(90, 0.004); this.campSay('NOT ENOUGH CRUMBS. THAT IS ' + u.cost[lv] + '.', 2.5); return; }
        Sound.sfx('power'); this.cameras.main.flash(120, 255, 230, 160); this.campSay(['PLEASURE DOING BUSINESS.', 'NO REFUNDS.', 'A FINE CHOICE.', 'IT SUITS YOU.'][Math.floor(Math.random() * 4)], 2.5);
        this.campPanel.setCards(cards()); this.campHudBuild(); } });
  },
  campRocket() {
    const L = Meta.larder(), kit = Meta.kit(), kp = kit.perk && RUN_PERKS.find(q => q.id === kit.perk), cards = [];
    cards.push(kp ? { icon: RUN_UI.iconFor(this, kp), name: kit.name, desc: kit.desc, col: 0x8a5a0a, tag: 'LUNCH', tagCol: '#ffd23f' } : { icon: 'cr_lunchbox', name: 'NO LUNCH', desc: 'Pack one at the picnic table.', col: 0x2a3a5a, tag: 'LUNCH' });
    cards.push({ icon: 'hud_cheese', name: (CFG.maxHp + (L.hearty || 0)) + ' HEARTS', desc: 'One life. Make them count.', col: 0x7a2a3a, tag: 'BODY' });
    cards.push({ icon: 'cheddar', name: (RUN_START_CHEDDAR + 40 * (L.purse || 0)) + ' CHEDDAR', desc: 'To spend in the ship shop.', col: 0x8a6a0a, tag: 'PURSE' });
    const extra = []; if (L.rind) extra.push('Black Rind Mk I'); if (L.toque) extra.push(L.toque + ' spare toque' + (L.toque > 1 ? 's' : '')); if (L.dice) extra.push(L.dice + ' reroll' + (L.dice > 1 ? 's' : '')); if (L.menu4) extra.push('4-card perk picks');
    cards.push({ icon: 'si_armour', name: 'FROM THE LARDER', desc: extra.length ? extra.join(', ') + '.' : 'Nothing yet. Fridge-o-tron takes crumbs.', col: 0x2a3a5a, tag: 'KIT' });
    const loadout = (kp ? kit.name : 'NO LUNCH') + '  -  ' + (CFG.maxHp + (L.hearty || 0)) + ' HEARTS  -  ' + (RUN_START_CHEDDAR + 40 * (L.purse || 0)) + ' CHEDDAR' + (extra.length ? '  -  ' + extra.join(', ').toUpperCase() : '');
    const strCards = () => STRENGTHS.map((S, i) => i <= Run.tierMax()
      ? { icon: 'wedge', name: S.name, desc: S.desc, col: S.col, tag: i === Run.tierSel() ? 'CHOSEN' : 'STRENGTH ' + (i + 1), tagCol: i === Run.tierSel() ? '#ffd23f' : '#ffffff', foot: 'CRUMBS x' + S.crumbs, footCol: i === Run.tierSel() ? '#7dff8a' : '#ffd23f' }
      : { dim: true, name: '???', desc: 'Win a run on ' + STRENGTHS[i - 1].name + ' to unlock.', tag: 'LOCKED', tagCol: '#5a6290' });
    this.campOpen({ title: 'CHOOSE YOUR STRENGTH', sub: loadout, cards: strCards(), cols: this.scale.width >= 800 ? 5 : 3,
      onPick: i => { if (i > Run.tierMax()) { Sound.sfx('zing'); return; } Meta._s('lc_run_tier', i); Sound.sfx('power'); this.campPanel.setCards(strCards()); },
      buttons: [{ label: 'BLAST OFF!', act: () => { this.campPanel.destroy(); this.campPanel = null; this.state = 'play'; this.campLaunch(); } }, { label: 'NOT YET', act: () => this.campPanel.close(), col: 0x9aa4c8 }] });
  },
  campRack() {
    const cards = () => WEAPONS.map((w, i) => weaponUnlocked(w, 99)
      ? { icon: w.gunTex, name: w.name, desc: w.blurb, col: this.weaponIdx === i ? 0x8a5a0a : 0x2a4a6a, tag: this.weaponIdx === i ? 'EQUIPPED' : 'GUN', tagCol: this.weaponIdx === i ? '#ffd23f' : '#ffffff', foot: this.weaponIdx === i ? 'IN HAND' : '', footCol: '#7dff8a' }
      : { dim: true, name: '???', desc: 'Not found yet. Every run you finish brings a new one home (or find it in the campaign\'s bonus rooms).', tag: 'LOCKED', tagCol: '#5a6290' });
    this.campOpen({ title: 'THE GUN RACK', sub: 'TAKE ONE ON THE RUN (SWAP MID-LEVEL WITH ANY OTHERS YOU OWN)', cards: cards(), cols: Math.min(4, WEAPONS.length), buttons: [{ label: 'DONE', act: () => this.campPanel.close() }],
      onPick: i => { const w = WEAPONS[i]; if (!weaponUnlocked(w, 99)) { Sound.sfx('zing'); return; }
        try { localStorage.setItem('lc_weapon', String(i)); } catch (e) { /* ignore */ }
        this.weaponIdx = i; this.weapon = w; this.rig.setWeapon(w); Sound.sfx('power'); this.cameras.main.flash(100, 255, 240, 200); this.campPanel.setCards(cards()); } });
  },
  campLaunch() {
    if (this.campGo) return;
    const R0 = this.campSt.find(s => s.id === 'rocket');
    this.campGo = { t: 0, r: R0 }; this.state = 'campmenu'; Sound.sfx('wave');
  },
  campLaunchTick(dt) {
    const G = this.campGo; if (!G.r) return; G.t += dt;
    const A = G.r.a, lt = G.t;
    A.rot = lt < 1.1 ? Math.sin(lt * 70) * 0.02 * Math.min(1, lt * 2) : 0;
    if (lt > 1.1) A.h += (lt - 1.1) * 900 * dt * 1.6;
    if (lt > 0.4 && Math.random() < dt * 50) {
      const spr = this.add.image(0, 0, 'puff').setDepth(2.3).setTint(lt > 1.1 ? 0xffd08a : 0xdfe6f0); spr.bsx = spr.bsy = lt > 1.1 ? 1.2 : 0.7;
      this.campFx.push({ spr, theta: G.r.theta + rnd(-0.05, 0.05), h: A.h + rnd(0, 10), vt: rnd(-0.12, 0.12), vh: rnd(-10, 30), life: 1.2, max: 1.2, smoke: true });
    }
    if (lt > 1.1 && !G.boom) { G.boom = true; this.cameras.main.shake(900, 0.014); Sound.sfx('power'); }
    if (lt > 2.4 && !G.out) { G.out = true; this.cameras.main.fadeOut(450, 255, 240, 200); this.time.delayedCall(480, () => { Run.start(this.registry); this.scene.start('runpick', { phase: 'route' }); }); }
  },
  // ---- the run's summary card, when he lands back at camp
  campShowCard() {
    const S = this.campSum; if (!S || this.campCard) return;
    if (S.rush) { this.rushCard(S); return; }
    if (S.cavern) { this.cavernCard(S); this.campSum = null; return; }                              // (v3.36) back from the Boss Rush
    this.state = 'campmenu';
    const W = this.scale.width, H = this.scale.height, f = RUN_UI.f, c = this.add.container(0, 0).setDepth(60);
    const small = H < 430, w = Math.min(W - 30, 470), x = (W - w) / 2, y = small ? 14 : 40;
    c.add(this.add.rectangle(0, 0, W, H, 0x05030c, 0.5).setOrigin(0));
    const g = this.add.graphics(); c.add(g);
    const won = S.how === 'won', title = won ? 'RUN COMPLETE!' : S.how === 'quit' ? 'RUN ABANDONED' : 'GRATED!';
    c.add(this.add.text(W / 2, y + 9, title, f(small ? 17 : 21, won ? '#ffd23f' : '#ff9a7a', { stroke: '#2a0606', strokeThickness: 6 })).setOrigin(0.5, 0));
    const atL = LEVELS[S.at], sub = won ? 'One life, all the way. Bessie salutes you.' : S.how === 'quit' ? 'Chris heads back to camp for a nap.' : 'The run ended on ' + ((atL && (atL.short || atL.name)) || 'a cold rock') + '.';
    c.add(this.add.text(W / 2, y + (small ? 36 : 42), sub, f(7, '#ffd8b0', { strokeThickness: 3 })).setOrigin(0.5, 0));
    const n = RUN_ROUTE.length, gap = Math.min(56, (w - 40) / n), py = y + (small ? 76 : 88), pg = this.add.graphics(); c.add(pg);
    for (let i = 0; i < n; i++) {
      const px = W / 2 + (i - (n - 1) / 2) * gap, id = (S.done || [])[i];
      if (i < n - 1) pg.fillStyle(i < (S.done || []).length - 1 ? 0xffd23f : 0x3a4270, 1).fillRect(px + 16, py - 1, gap - 32, 3);
      if (id) { for (const o of RUN_UI.planetImg(this, id, px, py, 15)) c.add(o); }
      else if (i === (S.done || []).length && !won) { pg.lineStyle(2, 0xff5a5a, 1).strokeCircle(px, py, 15); c.add(this.add.text(px, py, 'X', f(10, '#ff5a5a', { strokeThickness: 0 })).setOrigin(0.5)); }
      else { pg.lineStyle(2, 0x3a4270, 1).strokeCircle(px, py, 15); c.add(this.add.text(px, py, '?', f(9, '#3a4270', { strokeThickness: 0 })).setOrigin(0.5)); }
    }
    const mm = Math.floor((S.time || 0) / 60), ss = String(Math.floor((S.time || 0) % 60)).padStart(2, '0');
    // stat tiles
    const tiles = [['SCORE', S.score || 0], ['RATS', S.kills || 0], ['CHEDDAR', S.earned || 0], ['TIME', mm + ':' + ss]], tw = (w - 40 - 18) / 4, ty = py + 32;
    tiles.forEach(([k, v], i) => { const tx = x + 20 + i * (tw + 6); pg.fillStyle(0x1a1020, 1).fillRect(tx - 1, ty - 1, tw + 2, 32); pg.fillStyle(0x222c60, 1).fillRect(tx, ty, tw, 30); pg.fillStyle(0xffffff, 0.08).fillRect(tx, ty, tw, 2);
      c.add(this.add.text(tx + tw / 2, ty + 5, k, f(5, '#9aa4c8', { strokeThickness: 2 })).setOrigin(0.5, 0)); c.add(this.add.text(tx + tw / 2, ty + 15, String(v), f(9, '#ffffff', { strokeThickness: 3 })).setOrigin(0.5, 0)); });
    let ly = ty + 40;
    if (S.newBest) { c.add(this.add.text(W / 2, ly, 'NEW BEST RUN!', f(9, '#7dff8a', { strokeThickness: 3 })).setOrigin(0.5, 0)); ly += 16; }
    if (S.newGun) { c.add(this.add.text(W / 2, ly, 'NEW GUN: ' + S.newGun + '! (ON THE GUN RACK)', f(8, '#5ae0ff', { strokeThickness: 3 })).setOrigin(0.5, 0)); ly += 16; }
    if (S.unlocked) { c.add(this.add.text(W / 2, ly, 'NEW CHEESE STRENGTH: ' + S.unlocked + '! (AT THE ROCKET)', f(8, '#ffb03a', { strokeThickness: 3 })).setOrigin(0.5, 0)); ly += 16; }
    const pk = S.perks || [];
    if (pk.length) { const pw = 28, x0 = W / 2 - (pk.length - 1) * pw / 2; pk.forEach((id, i) => { const p = RUN_PERKS.concat(RUN_GOLD).find(q => q.id === id); if (p) c.add(RUN_UI.fit(this.add.image(x0 + i * pw, ly + 11, RUN_UI.iconFor(this, p)), 22)); }); ly += 28; }
    const cr = this.add.image(W / 2 - 66, ly + 12, 'cr_crumb').setScale(2.5); c.add(cr);
    const ct = this.add.text(W / 2 - 50, ly + 12, '+0 GOLDEN CRUMBS', f(10, '#ffd23f')).setOrigin(0, 0.5); c.add(ct);
    ly += 30;
    const hh = ly + 18 - y;
    g.fillStyle(0x1a1020, 1).fillRect(x - 4, y - 4, w + 8, hh + 8); g.fillStyle(0xc8962a, 1).fillRect(x - 2, y - 2, w + 4, hh + 4); g.fillStyle(0xffd23f, 1).fillRect(x - 2, y - 2, w + 4, 2);
    g.fillStyle(0x121838, 1).fillRect(x, y, w, hh); g.fillStyle(won ? 0x5a4a0a : 0x5a140a, 1).fillRect(x, y, w, small ? 32 : 38); g.fillStyle(0xffffff, 0.08).fillRect(x, y, w, 3);
    c.add(this.add.text(W / 2, y + hh - 6, 'TAP / PRESS A KEY', f(6, '#9aa4c8', { strokeThickness: 3 })).setOrigin(0.5, 1));
    const got = S.crumbs || 0, before = Meta.crumbs() - got;
    this.campCrumbT.setText(String(before));
    this.tweens.addCounter({ from: 0, to: got, duration: Math.min(1400, 200 + got * 30), delay: 450, onUpdate: tw2 => { const v = Math.round(tw2.getValue()); ct.setText('+' + v + ' GOLDEN CRUMBS'); this.campCrumbT.setText(String(before + v)); }, onComplete: () => Sound.sfx('power') });
    c.setAlpha(0); this.tweens.add({ targets: c, alpha: 1, duration: 250 });
    this.campCard = c; Sound.sfx(won ? 'reveal' : 'clunk');
    const close = () => { if (!this.campCard || this.time.now - opened < 900) return; this.campCard = null; window.removeEventListener('keydown', close); padOff(); this.input.off('pointerup', close);
      this.state = 'play'; this.campCool = 0.4; this.campDownHeld = true; this.tweens.add({ targets: c, alpha: 0, duration: 200, onComplete: () => c.destroy() });
      this.time.delayedCall(500, () => this.campSay(this.campLine, 4)); };
    const opened = this.time.now, padOff = Pad.on(b => { if (b === 'a' || b === 'b' || b === 'start') close(); });
    window.addEventListener('keydown', close); this.input.on('pointerup', close);
    this.events.once('shutdown', () => { window.removeEventListener('keydown', close); padOff(); });
  }
};
