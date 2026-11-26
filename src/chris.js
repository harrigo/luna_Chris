// Luna Chris, the character rig: a chubby chef-astronaut built from separate parts that animate in code.
//
//   - waddle: legs swing and lift alternately while the whole body rolls side to side
//   - belly pokes out of the too-small suit; the "Kiss the Cook" apron covers the front
//   - jump: the apron spins edge-on and turns into a cape that streams behind him (and spins back on landing)
//   - chef's-hat helmet (a toque on a glass bubble) that lags behind the body and bounces
//   - gun arm recoils, the drill-bit auger spins, back arm swings, squash and stretch on landing / take-off
//
// Everything is drawn with code (outlined EWJ-ish look). Swap any texture for real art under the same key later.
// Local units: feet at (0,0), +x = the way he faces, -y = up. The whole rig is scaled by RIG_SCALE.

const RIG_SCALE = 1.0;    // (v3.83: 0.95 -> 1, so one of his art pixels is one world unit, the same as the ground and the redrawn enemies)
const HAT_K = 0.82;   // (v3.59) the tall toque, drawn a bit smaller
// (v3.85) the stride: how far each boot swings fore and aft (world units). The steps come as fast as the ground goes by
// (cadence = speed / STRIDE), so the planted boot keeps up with the floor instead of skating along it. It was a 7.5 swing at a
// fixed 8 rad/s at full speed: the feet moved at about a quarter of his speed.
const STRIDE = 10;
// (v3.53) where the hands go on each gun's texture: g = the grip (gun hand), f = under the front (support hand; none = one-handed)
// ================================================================= LIMBS (v3.60)
// Each arm and leg is ONE long sprite laid along a curve (a Phaser Rope): shoulder -> elbow -> hand, hip -> knee -> ankle.
// So a limb flexes like hand-drawn rubber instead of hinging like a paper doll, and it stretches when it has to reach.
// The sprite runs left to right: for an arm, 8px of shoulder ball, then 14 of sleeve to the elbow, then 14 of forearm.
// These painters are shared with the Black Rind armour (shop.js), which re-skins the same shapes.
const LIMB = { armW: 36, armH: 18, armN: 19, armI0: 4, armIK: 11, legW: 16, legH: 10, legN: 9, legIK: 4, bootW: 22, bootH: 12, ankX: 7.5, ankH: 9.5 };
function chrisArmPaint(a, C) {
  const cy = 8.5;
  const R = x => {                                                  // half-thickness along the arm
    const d = x + 0.5 - 8, ball = d * d < 38 ? Math.sqrt(38 - d * d) : 0;                       // a big round shoulder (the joint is at x 8)
    const r = x < 8 ? 0 : x < 22 ? 5.9 - (x - 8) / 14 * 1.8 : x < 30 ? 4.1 + (x - 22) / 8 * 1.9 : x < 33 ? 6.7 : 3.1;   // sleeve pinching in to the elbow, a Popeye forearm, the cuff ring, the wrist
    return Math.max(ball, r);
  };
  for (let x = 1; x < 36; x++) { const r = R(x);
    for (let y = Math.ceil(cy - r - 0.5); y <= Math.floor(cy + r - 0.5); y++) {
      const k = (y + 0.5 - cy) / r, cuff = x >= 30 && x < 33, wrist = x >= 33;
      a.px(x, y, cuff ? (k > 0.3 ? C.cuff[2] : k < -0.55 ? C.cuff[0] : C.cuff[1]) : wrist ? (k > 0.2 ? C.skin[1] : C.skin[0]) : (k > 0.34 ? C.dark : C.lite));   // two hard tones: lit above, a cool shadow underneath
    } }
  a.line([[21, 5], [22, 7]], C.fold); a.line([[23, 12], [22, 10]], C.fold); a.px(24, 6, C.fold);   // creases where the elbow bends
  a.px(27, 12, C.fold); a.px(14, 13, C.fold);
  if (C.hair) { a.px(34, 7, C.hair); a.px(33, 9, C.hair); }
  if (C.badge) { a.ell(8, 8.5, 3.3, 3.3, C.badge); a.ell(8, 8.5, 1.5, 1.5, C.badgeIn || 0xdfe8ff); a.px(7, 6, 0xffffff); }
}
// a soft slate line round the shoulder (where the arm lies over the suit), inking up to full black by the cuff
const chrisArmInk = (g, w) => { for (let i = 0; i < g.length; i++) if (g[i] === 0x1a1020) { const x = i % w; g[i] = x < 14 ? 0x8a97b6 : x < 24 ? 0x56628a : 0x1a1020; } };
function chrisLegPaint(a, C) {                                       // hip at x 0, a knobbly knee at x 8, ankle at x 16 (top of the sprite = the FRONT of the leg)
  const cy = 4.5, R = x => x < 5 ? 3.3 - x * 0.1 : x < 11 ? 2.8 + 1.0 * Math.sin((x - 5) / 6 * Math.PI) : 2.6;
  for (let x = 0; x < 16; x++) { const r = R(x);
    for (let y = Math.ceil(cy - r - 0.5); y <= Math.floor(cy + r - 0.5); y++) a.px(x, y, (y + 0.5 - cy) / r > 0.2 ? C.dark : C.lite); }
  a.px(7, 2, C.fold); a.px(8, 3, C.fold); a.px(9, 2, C.fold); a.px(8, 7, C.fold); a.px(3, 6, C.fold); a.px(13, 3, C.fold);
}
function chrisBootPaint(a, C) {                                      // a clompy moon boot: ankle cuff, short heel, a great bulbous toe, thick tread
  a.rrect(3, 0, 12, 4, 2, C.cuff); a.rect(4, 1, 11, 1, C.cuffHi);
  a.poly([[2, 3], [12, 3], [15, 4], [20, 5], [21, 8], [1, 8], [1, 5]], C.wb);
  a.ell(16, 5.2, 5.4, 3.9, C.toe || C.wb); a.px(15, 2, C.shine); a.px(16, 2, C.shine); a.px(14, 3, C.shine);
  a.line([[11, 4], [12, 8]], C.fold); a.px(5, 6, C.fold); a.px(6, 7, C.fold);
  a.rect(0, 9, 21, 11, C.sole); a.rect(0, 9, 21, 9, C.soleHi); for (let x = 1; x < 21; x += 3) a.px(x, 11, C.tread);
}
function chrisFistPaint(a, G, dot) {                                 // the gun hand: a fat glove wrapped round the grip
  a.rrect(2, 2, 11, 12, 4, G);
  a.line([[7, 5], [11, 5]], G[2]); a.line([[7, 8], [11, 8]], G[2]); a.px(8, 11, G[2]);        // fingers round the front
  a.ell(5, 3.5, 3.4, 2.4, G); a.px(4, 2, dot || 0xffffff); a.px(7, 4, G[2]);                   // the thumb over the top
}
function chrisHoldPaint(a, G, dot) {                                 // the support hand: cupped under the gun, fingertips curled up its side
  a.rrect(1, 5, 11, 9, 3, G);
  for (const x of [3, 6, 9]) { a.rrect(x - 1, 1, x + 1, 6, 1, G); a.px(x, 5, G[2]); a.px(x, 1, dot || 0xffffff); }
}
const GUN_HOLD = { c_gun: { g: [13, 20], f: [19, 20] }, c_gun2: { g: [13, 20], f: [19, 20] }, c_gun3: { g: [13, 20], f: [19, 21] }, ix_spatula: { g: [7, 15], f: null } };

// ================================================================= GUN FX PARTS (v3.61)
// The guns have moving parts now, so their sprites are split up at run time (this works on the PNGs in assets/sprites
// and on the drawn-in-code versions alike): '<gun>_e' is the gun with the live bit taken out, and the live bit is drawn
// over it every frame - macaroni to the level of the tank, a crank that turns, a reel that spins and unwinds.
function chrisGunParts(scene) {
  const T = scene.textures, INK = 0x1a1020;
  const derive = (src, dst, fn) => {
    if (T.exists(dst) || !T.exists(src)) return;
    const fr = T.getFrame(src), w = fr.cutWidth, h = fr.cutHeight, ct = T.createCanvas(dst, w, h), ctx = ct.getContext();
    ctx.drawImage(fr.source.image, fr.cutX, fr.cutY, w, h, 0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h), D = img.data;
    const get = (x, y) => { const i = (y * w + x) * 4; return x < 0 || y < 0 || x >= w || y >= h || D[i + 3] < 200 ? null : [D[i], D[i + 1], D[i + 2]]; };
    const put = (x, y, c) => { if (x < 0 || y < 0 || x >= w || y >= h) return; const i = (y * w + x) * 4; if (c === null) { D[i + 3] = 0; return; } D[i] = (c >> 16) & 255; D[i + 1] = (c >> 8) & 255; D[i + 2] = c & 255; D[i + 3] = 255; };
    fn(get, put, w, h); ctx.putImageData(img, 0, 0); ct.refresh(); ct.setFilter(Phaser.Textures.FilterMode.NEAREST);
  };
  // Mac-Grinder: an EMPTY glass hopper, and no crank
  derive('c_gun', 'c_gun_e', (get, put) => {
    for (let y = 3; y <= 9; y++) for (let x = 8; x <= 26; x++) { const c = get(x, y); if (c && c[0] > 200 && c[1] > 120 && c[2] < 150) put(x, y, y < 5 ? 0xdcf2ff : y < 8 ? 0xb8e4ff : 0x9ad0f0); }
    for (let y = 3; y <= 12; y++) for (let x = 0; x <= 3; x++) put(x, y, null);
    for (let y = 13; y <= 15; y++) for (let x = 0; x <= 2; x++) put(x, y, null);
    for (let y = 9; y <= 15; y++) { const c = get(4, y), l = get(3, y); if (c && (c[0] + c[1] + c[2]) > 150 && !l) put(3, y, INK); }   // re-ink the body's back edge where the crank crossed it
  });
  // Spaghetti Spinner: no reel, no loose strand (and the top of the body they sat on, made good)
  derive('c_gun2', 'c_gun2_e', (get, put) => {
    const body = [];
    for (let x = 0; x <= 27; x++) { const c = get(x, 13); body[x] = !!c && x >= 3; }
    for (let y = 0; y <= 9; y++) for (let x = 0; x <= 27; x++) put(x, y, null);
    for (let y = 10; y <= 12; y++) for (let x = 0; x <= 22; x++) { const c = get(x, y); if (!c) continue;
      const yel = c[0] > 170 && c[1] > 120 && c[2] < 160, dark = (c[0] + c[1] + c[2]) < 150;
      if ((yel || dark) && x >= 5 && x <= 21) { const r = get(23, y); put(x, y, y === 11 ? 0xb8fff4 : r && (r[0] + r[1] + r[2]) > 150 ? (r[0] << 16 | r[1] << 8 | r[2]) : 0x7af0e0); } }
    for (let x = 5; x <= 25; x++) if (get(x, 10)) put(x, 9, INK);
    put(13, 8, 0x5a6272); put(14, 8, 0x5a6272); put(13, 7, INK); put(14, 7, INK); put(12, 8, INK); put(15, 8, INK);   // the spindle the reel turns on
  });
  // (v3.63) DETERMINED: both eyes narrowed under a great scowl of brow, and the tip of his tongue poking out
  derive('c_head', 'c_head_det', (get, put) => {
    const SK = 0xffd9c4, BR = 0x5a3216, on = (x, y, c) => { if (get(x, y)) put(x, y, c); };
    for (let x = 17; x <= 24; x++) { on(x, 9, SK); on(x, 10, SK); on(x, 11, INK); }        // the big eye, half shut under a heavy lid
    for (let x = 18; x <= 24; x++) on(x, 8 + (x > 21 ? 0 : 1), BR); for (let x = 16; x <= 21; x++) on(x, 10, BR);   // and its brow comes right down
    on(21, 13, INK); on(22, 13, INK); on(21, 12, INK); on(20, 13, 0xffffff);                // a small hard pupil
    for (let x = 6; x <= 13; x++) on(x, 10 + Math.round((x - 6) * 0.3), BR);                // the other brow, lower and thicker
    for (const [x, y, c] of [[19, 24, 0xff8aa0], [20, 24, 0xff8aa0], [19, 25, 0xe85a7a], [20, 25, 0xff8aa0], [21, 25, 0xe85a7a], [19, 26, INK], [20, 26, INK], [21, 24, INK]]) on(x, y, c);   // the tongue
  });
  const noInk = g => { for (let i = 0; i < g.length; i++) if (g[i] === INK) g[i] = -1; };
  if (!T.exists('c_hopfill')) {
    pixSprite(scene, 'c_hopfill', 19, 7, a => {                       // a hopperful of macaroni (texture x 0 = gun x 8, y 0 = gun y 3)
      for (let ty = 0; ty < 7; ty++) { const y = 3 + ty, k = (y - 2) * 3 / 8;
        for (let x = Math.ceil(9 + k); x <= Math.floor(25 - k); x++) a.px(x - 8, ty, (x * 3 + y * 5) % 7 < 2 ? 0xffa21a : (x + y * 2) % 5 === 0 ? 0xfff0a0 : 0xffd23f); }
    }, 1, noInk);
    pixSprite(scene, 'c_crank', 6, 11, a => { a.rect(2, 4, 3, 9, 0x7a8698); a.rect(2, 4, 2, 9, 0xb8c4d4); a.rrect(1, 1, 4, 4, 1, [0xff8a8a, 0xe03030, 0x901818]); });
    const SP = [0xfff4b0, 0xffd23f, 0xc99a1a];
    for (let fq = 0; fq < 4; fq++) pixSprite(scene, 'c_reel' + fq, 17, 16, a => {   // the reel, in four turns: two spiral strands and a notched hub
      a.ell(8.5, 8, 7, 6.5, SP);
      for (const arm of [0, Math.PI]) for (let k = 0; k < 30; k++) { const u = k / 30, r = 1.8 + u * 4.7, an = arm + fq * Math.PI / 4 + u * 4.2; a.px(8.5 + Math.cos(an) * r, 8 + Math.sin(an) * r * 0.92, 0xc99a1a); }
      a.ell(8.5, 8, 1.7, 1.7, 0x5a6272); a.px(8.5 + Math.cos(fq * Math.PI / 4) * 1.1, 8 + Math.sin(fq * Math.PI / 4) * 1.1, 0xdfe6f0);
      a.px(5, 3, 0xffffff); a.px(6, 3, 0xffffff);
    });
    pixSprite(scene, 'c_strand', 10, 6, a => { a.line([[1, 4], [3, 2], [5, 4], [8, 1]], 0xffd23f); });
    pixSprite(scene, 'c_socket', 5, 5, a => { a.ell(2.5, 2.5, 1.6, 1.6, 0x3a4252); a.px(2, 2, 0x2a3040); });
    pixSprite(scene, 'c_heat', 15, 15, a => { a.ell(7.5, 7.5, 7, 7, 0x3a0e00); a.ell(7.5, 7.5, 5.2, 5.2, 0x8a3000); a.ell(7.5, 7.5, 3.4, 3.4, 0xd87020); a.ell(7.5, 7.5, 1.7, 1.7, 0xffd890); }, 1, noInk);
    pixSprite(scene, 'c_puff', 8, 8, a => { a.ell(4, 4, 3.4, 3.4, [0xffffff, 0xeef2f8, 0xc8d2e2]); }, 1, noInk);
  }
}

function makeChrisTextures(scene) {
  if (scene.textures.exists('c_boot')) return;   // (v3.99) c_head is a PNG now, so the old check never stopped this re-running: every new rig rebuilt c_boot and killed sprites still using it (the intro's armoury crash)
  const OUT = 0x1a1020;
  const mk = (key, w, h, draw) => {
    if (SPRITE_FILES.has(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  };
  const rr = (g, x, y, w, h, r, fill, lw) => { g.fillStyle(fill, 1).fillRoundedRect(x, y, w, h, r); g.lineStyle(lw || 2, OUT, 1).strokeRoundedRect(x, y, w, h, r); };
  const el = (g, x, y, w, h, fill, lw) => { g.fillStyle(fill, 1).fillEllipse(x, y, w, h); g.lineStyle(lw || 2, OUT, 1).strokeEllipse(x, y, w, h); };
  const ci = (g, x, y, r, fill, lw) => { g.fillStyle(fill, 1).fillCircle(x, y, r); g.lineStyle(lw || 2, OUT, 1).strokeCircle(x, y, r); };

  mk('blank', 2, 2, () => {});

  // ---- Luna Chris in pixel art, styled after the title art: white/ice-blue suit with red and blue trim,
  // glass helmet over a furious red-nosed face with a big moustache, chef's toque, the "KISS THE COOK" apron.
  // Every part keeps its old size and pivot, so the rig animation is unchanged.
  const SUIT = [0xffffff, 0xd6e2f4, 0x93a8cc], SKIN = [0xffd9c4, 0xf2b593, 0xc9805e], BLUE = [0x8aa8ff, 0x4a6ad8, 0x2a3a90];
  const CREAM = [0xffffff, 0xfff1dc, 0xd8c4a8], RED = [0xff6a6a, 0xd62828, 0x8a1414], HAIR = 0x5a3216;
  const FONT3 = { K: ['1.1', '11.', '11.', '1.1', '1.1'], I: ['111', '.1.', '.1.', '.1.', '111'], S: ['111', '1..', '111', '..1', '111'],
    T: ['111', '.1.', '.1.', '.1.', '.1.'], H: ['1.1', '1.1', '111', '1.1', '1.1'], E: ['111', '1..', '11.', '1..', '111'], C: ['111', '1..', '1..', '1..', '111'], O: ['111', '1.1', '1.1', '1.1', '111'] };
  const word = (a, txt, x, y, col) => { for (const ch of txt) { (FONT3[ch] || []).forEach((row, j) => [...row].forEach((v, i) => { if (v === '1') a.px(x + i, y + j, col); })); x += 4; } };

  // space boots: chunky white moon-boots that read as FEET: a red ankle cuff the trouser leg tucks into, a rounded
  // heel at the back, a long rounded toe out front, and a thick dark tread sole flat on the floor (the bottom row)
  pixSprite(scene, 'c_boot', LIMB.bootW, LIMB.bootH, a => chrisBootPaint(a, {   // (v3.60: smaller and rounder, so there's leg to see above it)
    cuff: RED, cuffHi: 0xff9a9a, wb: [0xffffff, 0xf0f4fb, 0xb4c4e0], shine: 0xffffff, fold: 0x9fb0d0, sole: 0x3a3048, soleHi: 0x5a5070, tread: 0x6a6080 }));
  pixSprite(scene, 'c_welly', 24, 19, a => {                                         // green wellies (at home on the farm): a tall rubber shaft up the shin
    const G = [0x6ad05a, 0x2f8f2f, 0x1a5a1e];
    a.rrect(4, 0, 15, 15, 2, G);                                                        // the shaft
    a.rect(4, 0, 15, 1, 0x9af08a); a.rect(4, 2, 15, 2, 0x1a5a1e);                      // rolled top rim
    a.rrect(3, 9, 22, 17, 4, G);                                                        // the foot, a big round toe
    a.rect(7, 3, 7, 12, 0xb8ffa8);                                                      // rubbery shine
    a.rect(3, 16, 22, 18, 0x2a2018); for (let x = 4; x < 22; x += 3) a.px(x, 18, 0x4a3a2a);   // chunky tread
    a.rect(3, 13, 9, 15, 0x6a4424); a.px(18, 15, 0x6a4424); a.px(12, 14, 0x7a5030); a.px(5, 11, 0x6a4424);   // caked in mud
  });
  pixSprite(scene, 'c_sock', 24, 13, a => {                                          // woolly socks (between wellies and space boots)
    a.rrect(4, 3, 19, 10, 3, [0xf4ece0, 0xd8ccb8, 0xa89880]);
    a.rect(16, 6, 19, 10, 0xc04a3a); a.rect(4, 7, 6, 10, 0xc04a3a);                     // red toe and heel
  });
  const PANTS = [0x9ab4ff, 0x5a78d8, 0x2e3e8a];                                      // blue suit trousers
  pixSprite(scene, 'c_leg', 16, 18, a => {                                           // (v2.59) a stubby BOWED trouser leg: fat thigh, knee out, a sewn-on patch
    a.poly([[2, 0], [14, 0], [15, 7], [13, 17], [4, 17], [1, 8]], PANTS);
    a.rect(3, 9, 14, 9, 0xd62828); a.rect(3, 10, 13, 10, 0xc4d4ff);                     // red + white knee trim
    a.line([[5, 2], [4, 7]], 0xc4d4ff);                                                 // shine down the front
    a.rect(7, 12, 11, 15, 0xd8b070); a.rect(8, 13, 10, 14, 0xc09850);                   // a tan patch on the shin...
    for (const [x, y] of [[6, 12], [8, 11], [11, 11], [12, 13], [12, 15], [10, 16], [7, 16], [6, 14]]) a.px(x, y, 0x1a1020);   // ...stitched on by hand
    a.px(3, 4, 0x2e3e8a); a.px(12, 5, 0x2e3e8a);                                        // creases
  });
  // Chris's body: hand-pixelled (44x42, facing right, outline included). Edit the rows: each letter is a colour in the palette.
  pixArt(scene, 'c_body', {a: 0x1a1020, b: 0xffffff, c: 0xd6e2f4, d: 0xd52828, e: 0x8aa8fe, f: 0x4a69d7, g: 0x2a398f, h: 0x92a8cc, i: 0xf2b592, j: 0xf0ddd6, k: 0xfed9c4, l: 0xf2b593, m: 0xc8805e, n: 0x50211b, o: 0x37191c}, [
    '............................................',
    '............................................',
    '...........aaaaaaaaaaaaaaaaaaa..............',
    '.........aabbbbbbbbbbbbbbbbbbbaa............',
    '........abbbbbbbbbbbbbbbbbbbbbbca...........',
    '.......abbbbbbbbbbbbbbbbbbbbbcccca..........',
    '......abbbbbbbbbbbbbbbbbbbbbddddcca.........',
    '.....abbbbbbbbbbbbbbbbbbbbccddddccca........',
    '.....abbbbbbbbbbbbbbbbbbccccddddccca........',
    '....abbbbbbeeeebbbbbbbbcccccffffcccca.......',
    '....abbbbbeeeeffbbbbbcccccccffffcccca.......',
    '....abbbbeeeeffffbbccccccccccccccccca.......',
    '....abbbbeeefbffgbcccccccccccccccccha.......',
    '....abbbbeffbfbggcccccccccccccccchhha.......',
    '....abbbbffffigggcccccccccccccchhhhha.......',
    '....abbbbbffggggcccccccccccccchhhhhha.......',
    '....abbbbbbggggccccccccccccchhhhhhhha.......',
    '....abbbbccccccccccccccccchhhhhhhhhha.......',
    '....abbbccccccccccccccccchhhhhhhhhhha.......',
    '....abccccccccccccccccchhhhhhhhhhhhha.......',
    '....acccccccccccccccchhhhhhhhhhhhhhha.......',
    '....accccccccccccccchhhhhhhhhhhhhhhha.......',
    '.....accccccccccccccccccccccchhhhhha........',
    '.....accccccccccccccccccccccccccccha........',
    '......accccccccccccccccccccccccccccca.......',
    '.......accccccccccccccccccccccccccccca......',
    '........accccccccccccccccccccccccccccca.....',
    '........acccccccccccccccccccccccccccccca....',
    '.......acccccccccccccccccccccccddddddcca....',
    '.......accccccccccccccccccccdddddddddddda...',
    '......accccccccccccccccccdddddjjkkkkkkdda...',
    '......acccccccccccccccccdddlllllkkkkkkkma...',
    '......accccccccccccccdddddllllimmikkkkkka...',
    '......acccccccccccdddddlllllllmonmllkkkka...',
    '......acccccccccdddddlllllllllmnnillllkka...',
    '.......adddddddddddmmmllllllllikklllllla....',
    '......adddddddddmmmmmmmmllllllllllllllla....',
    '......aammmmmmmmmaammmmmmmlllllllllllla.....',
    '.......aammmmmmmmmaammmmmmmmlllaaaalla......',
    '........aaammmmaaa.aammmmmmmmaaa...aa.......',
    '..........aaaaaa....aaaaaaaaaa..............',
    '.............aa.............................'
  ]);
  // the apron: "KISS THE COOK", cream with red lettering and macaroni-cheese stains
  pixSprite(scene, 'c_apron', 28, 38, a => {
    a.poly([[8, 1], [20, 1], [24, 12], [27, 35], [1, 35], [4, 12]], CREAM);
    a.rect(8, 1, 20, 2, 0xd62828);                                                       // neck band
    word(a, 'KISS', 7, 12, 0xd62828); word(a, 'THE', 9, 18, 0xd62828); word(a, 'COOK', 7, 24, 0xd62828);
    for (const [x, y] of [[5, 30], [6, 30], [20, 29], [21, 30], [22, 16], [4, 21], [18, 32]]) a.px(x, y, 0xff9a2a);   // stains
    a.px(19, 9, 0xffd23f); a.px(9, 31, 0xffd23f);
  });
  // the apron split in two so the bottom half can flap: bib (KISS THE) and skirt (COOK + hem)
  pixSprite(scene, 'c_apronT', 24, 21, a => {
    a.poly([[6, 1], [17, 1], [21, 12], [22, 20], [1, 20], [2, 12]], CREAM);
    a.rect(6, 1, 17, 2, 0xd62828);                                                       // neck band
    word(a, 'KISS', 5, 9, 0xd62828); word(a, 'THE', 7, 15, 0xd62828);
    a.px(17, 7, 0xffd23f); a.px(4, 17, 0xff9a2a);
  });
  pixSprite(scene, 'c_apronB', 26, 17, a => {
    a.poly([[2, 0], [23, 0], [25, 15], [1, 15]], CREAM);
    word(a, 'COOK', 5, 3, 0xd62828);
    a.rect(1, 13, 25, 14, 0xd62828);                                                     // red hem
    for (const [x, y] of [[4, 10], [5, 10], [19, 9], [20, 10]]) a.px(x, y, 0xff9a2a);     // mac-cheese stains
  });
  // the cape, as 4 cloth strips that hang off a little physics chain (widening towards the hem)
  for (let i = 0; i < 4; i++) {
    const w = 13 + i * 3, last = i === 3;
    pixSprite(scene, 'c_capeS' + i, w + 2, last ? 15 : 13, a => {
      const t0 = i === 0 ? 3 : 1;
      a.poly([[t0 + 1, 0], [w - t0, 0], [w, 12], [1, 12]], [0xff6a6a, 0xd62828, 0x8a1414]);         // red cape cloth
      a.rect(Math.round(w / 2) + 1, 1, Math.round(w / 2) + 1, 11, 0xa01c1c);                           // a fold down the middle
      if (i === 0) a.rect(t0 + 1, 0, w - t0, 1, 0xff9a9a);                                             // shine at the shoulders
      if (last) { for (let x = 1; x <= w; x++) { const y = 12 + ((x >> 1) % 2); a.px(x, y, 0xffd23f); if ((x >> 1) % 2) a.px(x, y + 1, 0xd8901a); } }   // gold zig-zag hem
    });
  }
  // the knot that ties the cape on, sitting in FRONT of his neck so the cape wraps over him
  pixSprite(scene, 'c_collar', 16, 10, a => {
    a.poly([[1, 2], [7, 4], [7, 7], [1, 8]], [0xff6a6a, 0xd62828, 0x8a1414]);
    a.poly([[14, 2], [9, 4], [9, 7], [14, 8]], [0xff6a6a, 0xd62828, 0x8a1414]);
    a.ell(8, 5.5, 2.5, 2.5, [0xfff0a0, 0xffc83a, 0xb07a1a]);                              // gold clasp
  });
  // (old one-piece cape, kept for anything else that uses it)
  pixSprite(scene, 'c_cape', 50, 46, a => {
    const pts = [[48, 2], [48, 14], [22, 30], [14, 45], [8, 33], [1, 40], [5, 22], [24, 8]];
    a.poly(pts, CREAM);
    a.poly([[48, 8], [48, 14], [22, 30], [14, 45], [24, 26]], [0xf0e0c8, 0xd8c4a8, 0xb8a080]);          // fold in shadow
    a.line([[48, 13], [22, 29], [14, 44]], 0xd62828, 2);                                                // red hem
    word(a, 'KISS', 22, 12, 0xd62828);                                                                  // a ghost of the lettering
  });
  // (v2.59) THE FACE ACTS. One head, six faces (the moustache is its own part now, so it can bristle and twitch):
  //   c_head angry (idle) / _blink / _fire gritted, eyes bulging, a vein up / _hurt eyes out on stalks, screaming /
  //   _grin smug, a gold tooth / _puff cheeks blown out (jetpack). Stubble, a sweaty sheen, one crooked tooth, a scratched helmet.
  const INK = 0x1a1020, GLASS = [0xe8f8ff, 0xb8e0ff, 0x7ab0e0], NOSE = [0xff9a9a, 0xe03a3a, 0xa01818], BLUSH = [0xffb8a8, 0xf09480, 0xc06a58];
  const bulge = (a, x, y, r, px, py, shot) => {                                           // a bulging eyeball: pin-prick pupil, bloodshot if he's riled
    a.ell(x, y, r + 0.9, r * 1.06 + 0.9, INK);                                              // (inked round, so it pops off the skin)
    a.ell(x, y, r, r * 1.06, [0xffffff, 0xfff4ea, 0xd8c8c0]);
    if (shot) { a.px(Math.round(x - r + 0.6), Math.round(y - 1), 0xe0302a); a.px(Math.round(x + r - 1.4), Math.round(y + 1), 0xe0302a); a.px(Math.round(x), Math.round(y + r - 1), 0xe0302a); if (r > 3.6) a.px(Math.round(x - 1), Math.round(y - r + 0.6), 0xe0302a); }
    a.rect(Math.round(x + px), Math.round(y + py - 1), Math.round(x + px) + (r > 3 ? 1 : 0), Math.round(y + py), INK);
    a.px(Math.round(x - r * 0.4), Math.round(y - r * 0.5), 0xffffff);
  };
  const faceArt = (a, glass, f) => {
    if (glass) a.ell(15, 15, 14, 14, GLASS);
    a.ell(15, 16, f === 'puff' ? 12.2 : 11, 11.5, SKIN);
    a.px(11, 7, 0xfff4ea); a.px(12, 7, 0xfff4ea); a.px(13, 8, 0xfff4ea);                                                     // a sweaty sheen on the brow
    for (const [x, y] of [[6, 20], [7, 22], [8, 24], [7, 25], [10, 26], [12, 27], [14, 26], [17, 27], [19, 26], [21, 27], [22, 25], [24, 23], [23, 21], [9, 22], [21, 24]]) a.px(x, y, (x + y) % 2 ? 0xb8846a : 0xa07258);   // stubble
    a.line([[18, 17], [23, 17]], SKIN[2]);                                                                                     // a bag under the big eye
    if (f === 'puff') { a.ell(7.5, 20, 4, 3.6, BLUSH); a.ell(23, 20.5, 3.6, 3.4, BLUSH); a.px(6, 18, 0xffe0d8); a.px(22, 19, 0xffe0d8); }
    // brows + eyes
    if (f === 'hurt') {
      a.line([[5, 6], [12, 4]], HAIR, 2); a.line([[18, 3], [25, 5]], HAIR, 2);
      bulge(a, 9.5, 11.5, 4.2, -1, 1, true); bulge(a, 20.5, 11.5, 4.8, 2, -1, true);
    } else if (f === 'fire') {
      a.line([[5, 8], [13, 12]], HAIR, 2); a.line([[25, 7], [17, 12]], HAIR, 2);
      bulge(a, 9.5, 13.5, 2.8, 1, 0, true); bulge(a, 20.5, 13.5, 3.8, 1, 0, true);
      a.px(5, 14, 0xd0302a); a.px(6, 13, 0xd0302a); a.px(5, 12, 0xd0302a); a.px(6, 11, 0xd0302a); a.px(7, 10, 0xd0302a);         // the vein on his temple
    } else if (f === 'grin') {
      a.line([[6, 10], [13, 10]], HAIR, 2); a.line([[18, 6], [25, 8]], HAIR, 2);                                               // one brow cocked
      a.rect(7, 13, 12, 13, INK); a.px(11, 14, INK);
      bulge(a, 20.5, 13.5, 3.2, 1, 1, false); a.rect(17, 10, 24, 12, SKIN[1]); a.line([[17, 12], [24, 12]], INK);               // a heavy, smug lid
    } else if (f === 'puff') {
      a.line([[6, 9], [12, 9]], HAIR, 2); a.line([[18, 8], [24, 9]], HAIR, 2);
      a.line([[7, 13], [9.5, 11.5], [12, 13]], INK, 1); a.line([[18, 13], [20.5, 11.5], [23, 13]], INK, 1);                     // eyes screwed shut with the effort
    } else {
      a.line([[6, 8], [13, 11]], HAIR, 2); a.line([[24, 7], [17, 11]], HAIR, 2);                                               // angry brows
      a.rect(7, 12, 12, 12, INK); a.px(8, 13, INK); a.px(6, 11, SKIN[2]);                                                       // the squint (and a crow's foot)
      if (f === 'blink') { a.rect(18, 13, 23, 13, INK); a.px(19, 14, INK); }
      else bulge(a, 20.5, 13, 3.3, 1, 0, false);
    }
    a.ell(16, 17.5, 3.4, 3, NOSE); a.px(15, 16, 0xffffff); a.px(18, 19, 0x7a1010);                                             // big red nose, a pore
    // mouths (the moustache sits over the top lip)
    if (f === 'hurt') { a.ell(15, 25.5, 5.2, 3.6, [0x8a1a2a, 0x5a0a14, 0x3a0510]); a.rect(11, 23, 19, 23, 0xffffff); a.px(13, 24, 0xf0e090); a.ell(15, 27.2, 2.6, 1.3, 0xff7a8a); }
    else if (f === 'fire') { a.rect(8, 23, 22, 27, 0xffffff); for (const x of [10, 13, 16, 19]) a.rect(x, 23, x, 27, 0x8a7a7a); a.rect(8, 25, 22, 25, 0x8a7a7a); a.rect(8, 22, 22, 22, 0x7a3a2a); a.rect(8, 28, 22, 28, 0x7a3a2a); a.px(17, 28, 0xf0e090); a.px(24, 22, 0x9ae8ff); a.px(25, 23, 0x5ac8f0); }
    else if (f === 'grin') { a.rect(9, 24, 21, 25, 0xffffff); a.px(8, 23, 0xffffff); a.px(22, 23, 0xffffff); a.px(22, 22, 0x7a3a2a); a.px(8, 22, 0x7a3a2a); for (const x of [11, 14, 20]) a.px(x, 25, 0x8a7a7a); a.rect(17, 24, 18, 25, 0xffd23f); a.px(17, 24, 0xfff6c0); a.line([[9, 26], [15, 27], [21, 26]], 0x7a3a2a); }
    else if (f === 'puff') { a.ell(15, 25, 2.4, 2.1, 0x5a0a14); a.px(14, 24, 0x8a1a2a); a.px(19, 25, 0xc8f0ff); a.px(21, 24, 0xe8f8ff); }
    else { a.rect(10, 24, 20, 26, 0xffffff); a.rect(10, 25, 20, 25, 0x8a7a7a); a.px(13, 24, 0x8a7a7a); a.px(17, 24, 0x8a7a7a); a.px(13, 26, 0x8a7a7a); a.px(17, 26, 0x8a7a7a); a.rect(18, 26, 18, 27, 0xf0e090); }   // gritted teeth, one crooked and yellow
    if (glass) { a.px(5, 6, 0xffffff); a.px(6, 5, 0xffffff); a.px(7, 5, 0xffffff); a.px(4, 8, 0xffffff);                       // glass glint...
      a.px(22, 3, 0xffffff); a.px(23, 4, 0xffffff); a.px(24, 5, 0x7ab0e0); a.px(26, 20, 0x7ab0e0); a.px(25, 22, 0x7ab0e0); }   // ...a scratch, and a ding in the rim
  };
  // (the old all-in-one head, moustache and all: the bare game-over head still uses it)
  const headArt = (a, glass) => {
    faceArt(a, glass, '');
    a.poly([[5, 22], [9, 19], [15, 20.5], [21, 19], [26, 21], [28, 18], [27, 23], [21, 23], [15, 22.5], [9, 23], [3, 24], [2, 20]], HAIR);
  };
  pixSprite(scene, 'c_head', 30, 30, a => faceArt(a, true, ''));
  for (const f of ['blink', 'fire', 'hurt', 'grin', 'puff']) pixSprite(scene, 'c_head_' + f, 30, 30, a => faceArt(a, true, f));
  pixSprite(scene, 'c_tache', 30, 11, a => {                                              // the handlebar moustache, on its own
    a.poly([[5, 7], [9, 4], [15, 5.5], [21, 4], [26, 6], [28, 3], [27, 8], [21, 8], [15, 7.5], [9, 8], [3, 9], [2, 5]], [0x7a4a26, 0x5a3216, 0x3a1e0a]);
    a.px(8, 5, 0x8a5a30); a.px(12, 6, 0x8a5a30); a.px(19, 5, 0x8a5a30); a.px(24, 6, 0x8a5a30);
  });
  pixSprite(scene, 'c_eyepop', 22, 13, a => { bulge(a, 6.5, 6.5, 5.6, -2, 1, true); bulge(a, 15.5, 6.5, 5.6, 2, -1, true); a.px(3, 9, 0xe0302a); a.px(18, 3, 0xe0302a); });   // eyes out on stalks (a heavy hit)
  pixSprite(scene, 'c_ouchstar', 9, 9, a => { a.poly([[4, 0], [5.5, 3], [8, 3.5], [6, 5.5], [7, 8], [4, 6.5], [1, 8], [2, 5.5], [0, 3.5], [2.5, 3]], [0xfff6a0, 0xffd23f, 0xd8901a]); });
  // game over: the helmet glass cracks... then shatters (the bare head is left, dazed: both eyes X'd out)
  pixSprite(scene, 'c_head_bare', 30, 30, a => {
    headArt(a, false);
    a.rect(6, 10, 13, 15, SKIN[1]); a.rect(18, 10, 24, 16, SKIN[1]);
    for (const [cx, cy] of [[9.5, 12.5], [21, 13]]) { a.line([[cx - 2, cy - 2], [cx + 2, cy + 2]], 0x1a1020); a.line([[cx - 2, cy + 2], [cx + 2, cy - 2]], 0x1a1020); }
  });
  pixSprite(scene, 'c_crack', 30, 30, a => {
    a.line([[4, 9], [9, 12], [8, 17], [13, 20]], 0xffffff); a.line([[9, 12], [14, 9], [18, 4]], 0xffffff);
    a.line([[22, 5], [21, 10], [26, 13]], 0xffffff); a.line([[21, 10], [17, 14]], 0xffffff); a.line([[24, 22], [20, 25], [21, 28]], 0xffffff);
  }, 0);
  pixSprite(scene, 'shard', 8, 8, a => { a.poly([[0, 0], [7, 2], [2, 7]], [0xffffff, 0xc8f0ff, 0x7ab0e0]); });
  // chef's toque (v2.59: bigger and floppier, the top slumping over backwards, a grease stain, a darned hole)
  pixSprite(scene, 'c_hat', 42, 36, a => {
    const W3 = [0xffffff, 0xeef2f8, 0xbcc6d6];
    a.ell(8, 15, 6.5, 6.5, W3);                                                             // the lobe that's flopped over the back
    a.ell(11, 23, 8, 8, W3); a.ell(31, 22, 8.5, 8.5, W3); a.ell(18, 12, 11.5, 10.5, W3); a.ell(28, 13, 8, 8, W3); a.ell(21, 23, 9, 8.5, W3);
    // the band wraps round the round helmet, so its top and bottom edges curve down in the middle
    const curve = x => 3.2 * (1 - Math.pow((x + 0.5 - 20.5) / 12, 2));
    for (let x = 8; x <= 33; x++) {
      const c = curve(x), y0 = Math.round(25 + c * 0.6), y1 = Math.round(31 + c);
      for (let y = y0; y <= y1; y++) a.px(x, y, y === y0 ? 0xffffff : (y >= y1 - 1 ? 0xc4cede : (x > 26 ? 0xe2e8f0 : 0xf1f1f1)));
    }
    for (const x of [14, 20, 27]) { const c = curve(x); for (let y = Math.round(26 + c * 0.6); y <= Math.round(30 + c); y++) a.px(x, y, 0xbcc6d6); }   // pleats follow the curve
    a.line([[14, 8], [17, 18]], 0xbcc6d6); a.line([[26, 9], [24, 18]], 0xbcc6d6); a.line([[6, 12], [9, 18]], 0xbcc6d6); a.line([[20, 5], [21, 14]], 0xd8dee8);
    a.px(30, 18, 0xffb84a); a.px(31, 19, 0xffb84a); a.px(31, 18, 0xffd890); a.px(12, 20, 0xe8c070);                           // mac-cheese grease
    for (const [x, y] of [[23, 20], [25, 20], [24, 21], [23, 22], [25, 22]]) a.px(x, y, 0x8a96aa);                             // a hole, darned shut
  });
  // The Spaghetti Spinner (pixel art): teal body, a big reel of spaghetti on top, loose strand, red nozzle
  pixSprite(scene, 'c_gun2', 34, 26, a => {
    const TL = [0x7af0e0, 0x2fa89a, 0x1a6a62], SP = [0xfff4b0, 0xffd23f, 0xc99a1a];
    a.rrect(10, 18, 16, 25, 2, [0xb07a40, 0x7a4a1a, 0x4a2a0a]);                                      // grip
    a.line([[17, 19], [20, 23], [16, 24]], 0x3b4252);
    a.rrect(3, 10, 28, 20, 4, TL);                                                                     // body
    a.rect(5, 17, 26, 18, 0x1a6a62); a.rect(6, 11, 22, 11, 0xb8fff4);                                   // under-shade + shine
    a.rrect(26, 12, 33, 18, 1, [0xdfe6f0, 0x9aa4b4, 0x5a6272]);                                        // barrel
    a.ell(13, 6, 7, 6.5, SP);                                                                          // the reel of spaghetti
    for (const r of [5, 3]) for (let k = 0; k < 16; k++) { const t = k / 16 * Math.PI * 2; a.px(13 + Math.cos(t) * r, 6 + Math.sin(t) * r * 0.9, 0xc99a1a); }   // coils
    a.ell(13, 6, 1.6, 1.6, 0x5a6272);                                                                  // hub
    a.line([[19, 9], [22, 7], [24, 9], [26, 7]], 0xffd23f);                                             // loose strand
    a.px(9, 2, 0xffffff); a.px(10, 2, 0xffffff);
  });
  pixSprite(scene, 'c_nozzle', 14, 12, a => {
    a.rrect(0, 2, 5, 9, 1, [0xdfe6f0, 0x9aa4b4, 0x5a6272]);
    a.poly([[5, 1], [13, 3], [13, 8], [5, 10]], [0xff8a8a, 0xe03030, 0x901818]);                        // flared red nozzle
    a.rect(12, 4, 13, 7, 0x1a1020);
  });
  // The Swiss-Shot (pixel art): a cheese cannon - wheel-of-Swiss barrel with holes, brass bands, a drum of cheese balls
  pixSprite(scene, 'c_gun3', 34, 26, a => {
    const CH = [0xfff09a, 0xffcf3a, 0xc9901a], BR = [0xffe0a0, 0xd0a040, 0x8a6018];
    a.rrect(10, 18, 16, 25, 2, [0xb07a40, 0x7a4a1a, 0x4a2a0a]);                                      // grip
    a.line([[17, 19], [20, 23], [16, 24]], 0x3b4252);
    a.rrect(2, 9, 33, 21, 5, CH);                                                                      // cheese barrel
    for (const [x, y, r] of [[8, 13, 1.8], [15, 17, 1.5], [21, 12, 2], [27, 16, 1.6], [12, 11, 1]]) a.ell(x, y, r, r, 0xa8701a);   // holes
    a.rect(5, 9, 6, 21, 0xc9901a); a.rect(5, 9, 5, 21, BR[1]); a.rect(24, 9, 25, 21, BR[1]); a.rect(30, 9, 31, 21, BR[1]);   // brass bands
    a.ell(10, 5, 6, 5, [0xb8c0cc, 0x7a8698, 0x4a5262]);                                                  // ammo drum
    for (const [x, y] of [[8, 3], [12, 3], [10, 6]]) { a.ell(x, y, 1.6, 1.6, 0xffd23f); }
    a.rect(4, 7, 16, 8, 0x4a5262);
  });
  pixSprite(scene, 'c_bell', 12, 18, a => {                                                            // flared brass muzzle
    a.poly([[0, 5], [6, 3], [11, 0], [11, 17], [6, 14], [0, 12]], [0xffe0a0, 0xd0a040, 0x8a6018]);
    a.rect(10, 3, 11, 14, 0x1a1020);
  });
  // the Swiss-Shot's ammo: a fat ball of Swiss cheese
  pixSprite(scene, 'swissball', 22, 22, a => {
    a.ell(11, 11, 10, 10, [0xfff09a, 0xffcf3a, 0xc9901a]);
    for (const [x, y, r] of [[7, 7, 2], [14, 9, 2.4], [8, 15, 1.6], [15, 15, 1.4], [11, 4, 1]]) { a.ell(x, y, r, r, 0xa8701a); a.px(x + 1, y + 1, 0xffe27a); }
    a.rect(5, 4, 6, 4, 0xffffff); a.px(4, 5, 0xffffff);
  });
  // the splat it leaves: a puddle of melted Swiss
  pixSprite(scene, 'swisssplat', 60, 16, a => {
    a.ell(30, 10, 28, 5.5, [0xfff09a, 0xffcf3a, 0xc9901a]);
    for (const [x, r] of [[8, 3], [18, 4], [42, 4], [53, 3]]) a.ell(x, 6, r, r, [0xfff09a, 0xffcf3a, 0xc9901a]);
    a.ell(22, 10, 2, 1.4, 0xa8701a); a.ell(38, 11, 2.4, 1.6, 0xa8701a);
  });
  // the projectile: a long wavy strand of spaghetti
  pixSprite(scene, 'spaghetti', 36, 9, a => {
    const pts = []; for (let x = 1; x <= 34; x++) pts.push([x, 4 + Math.round(Math.sin(x / 34 * Math.PI * 3) * 2.4)]);
    a.line(pts, 0xffd23f, 2);
    for (let x = 3; x <= 33; x += 5) a.px(x, 4 + Math.round(Math.sin(x / 34 * Math.PI * 3) * 2.4) - 1, 0xfff4b0);
  });
  // the belly: hangs out under the front of the suit (drawn behind the suit, so only the front-bottom shows)
  // a round, bare belly bulging out from under the stretched suit: the hem rides up over it (so it's clearly part of
  // him, not stuck on), the bulge pushes out a little past the front of the suit, navel and a shine
  pixSprite(scene, 'c_belly', 26, 16, a => {
    a.ell(14, 5.5, 11.5, 10, SKIN); a.ell(19, 6, 6, 7, [0xffe4d4, 0xf5bea0, 0xd08a68]);   // the bulge, rounder and pushing forward
    for (let x = 1; x <= 25; x++) {                                                     // the suit hem stretched over it, bowing down where it's tightest
      const bow = Math.round(Math.sin(Math.PI * Math.min(1, Math.max(0, (x - 1) / 24))) * 2);
      for (let y = 0; y <= bow; y++) a.px(x, y, SUIT[1]);
      a.px(x, bow + 1, 0xd62828); a.px(x, bow + 2, 0x93a8cc);                           // red hem trim + the stretched edge
      a.px(x, bow + 3, 0xc9805e);                                                       // a shadow where the hem digs in
    }
    a.px(17, 9, 0xb06a4a); a.px(17, 10, 0x8a4a34);                                      // navel
    a.rect(20, 6, 21, 7, 0xffe8dc); a.px(22, 8, 0xffe8dc);                              // shine on the curve
    a.line([[6, 13], [12, 14], [18, 13]], 0xc9805e);                                    // the underside crease
  });
  // gun arm (v2.59): suit sleeve, red cuff, a hairy wrist poking out, and a great four-fingered cartoon glove
  const GLV = [0xffffff, 0xeef2f8, 0xbcc6d6];
  pixSprite(scene, 'c_arm', 22, 13, a => {
    a.rrect(0, 3, 9, 9, 2, SUIT); a.rect(8, 3, 9, 9, 0xd62828);
    a.rect(10, 4, 12, 8, SKIN[1]); a.px(10, 4, HAIR); a.px(12, 5, HAIR); a.px(11, 7, HAIR); a.px(10, 8, HAIR); a.px(12, 8, SKIN[2]);   // hairy wrist
    a.ell(13.5, 6, 2, 4.6, GLV);                                                          // the glove's rolled cuff
    a.rrect(13, 1, 21, 11, 4, GLV);                                                       // the fist
    a.line([[16, 2], [16, 5]], 0xbcc6d6); a.line([[18, 2], [18, 5]], 0xbcc6d6); a.line([[20, 3], [20, 5]], 0xbcc6d6);         // knuckles
    a.ell(16, 9.5, 2.6, 1.8, GLV); a.px(15, 3, 0xffffff);                                 // thumb
  });
  pixSprite(scene, 'c_hand_open', 17, 17, a => {                                          // the free hand, fingers splayed (falling, flailing)
    for (const [x, y] of [[13, 2], [15, 6], [15, 11], [11, 15]]) a.line([[6, 8], [x, y]], GLV[1], 3);
    for (const [x, y] of [[13, 2], [15, 6], [15, 11], [11, 15]]) { a.line([[7, 8], [x, y]], GLV[0], 1); a.ell(x, y, 1.6, 1.6, GLV); }
    a.line([[5, 7], [3, 2]], GLV[1], 3); a.ell(3, 2, 1.6, 1.6, GLV);                      // thumb
    a.ell(6, 8.5, 4.6, 4.6, GLV); a.ell(3, 9, 2, 3.6, GLV); a.line([[5, 6], [8, 7]], 0xbcc6d6);
  });
  pixSprite(scene, 'c_grip', 9, 12, a => {                                                // white-knuckled fingers wrapped round the gun's grip
    for (let k = 0; k < 4; k++) { a.rrect(1, k * 3, 7, k * 3 + 2, 1, GLV); a.px(6, k * 3, 0xffffff); a.px(2, k * 3 + 2, 0xbcc6d6); }
  });
  // (v3.60) the limbs (see LIMB at the top): bendy arms and legs in two hard cel tones, the far ones a shade darker
  const GLVD = [0xe4eaf4, 0xc2ccdc, 0x8a96ae];
  pixSprite(scene, 'c_armN', LIMB.armW, LIMB.armH, a => chrisArmPaint(a, { lite: 0xffffff, dark: 0xb9c8e2, fold: 0x8696b8, cuff: [0xff7a6a, 0xd62828, 0x9a1616], skin: [SKIN[1], SKIN[2]], hair: HAIR, badge: BLUE }), 1, chrisArmInk);
  pixSprite(scene, 'c_armF', LIMB.armW, LIMB.armH, a => chrisArmPaint(a, { lite: 0xdde6f4, dark: 0x9fb0d0, fold: 0x7686a8, cuff: [0xd84a4a, 0xb01e1e, 0x7a1010], skin: [SKIN[2], SKIN[2]], hair: HAIR }), 1, chrisArmInk);
  pixSprite(scene, 'c_legR', LIMB.legW, LIMB.legH, a => chrisLegPaint(a, { lite: 0xffffff, dark: 0xb9c8e2, fold: 0x8696b8 }));
  pixSprite(scene, 'c_legRF', LIMB.legW, LIMB.legH, a => chrisLegPaint(a, { lite: 0xe2e9f5, dark: 0xa6b6d4, fold: 0x7686a8 }));
  pixSprite(scene, 'c_fistg', 14, 15, a => chrisFistPaint(a, GLV));
  pixSprite(scene, 'c_fistF', 14, 15, a => chrisFistPaint(a, GLVD));
  pixSprite(scene, 'c_hold', 13, 11, a => chrisHoldPaint(a, GLVD));
  // popped stitches where the suit strains over the belly, and a gravy stain (laid over the body)
  pixSprite(scene, 'c_wear', 44, 42, a => {
    for (const y of [17, 19, 21]) a.px(27, y, 0x93a8cc);                                  // the side seam...
    for (const [x, y] of [[26, 23], [28, 23], [27, 24], [26, 25], [28, 25]]) a.px(x, y, 0x4a5a80);   // ...has burst
    a.px(27, 26, 0xf2b593); a.px(28, 26, 0xf2b593); a.px(27, 27, 0xc9805e); a.px(29, 24, 0xd62828); a.px(30, 23, 0xd62828);   // skin showing, a loose red thread
    for (const [x, y] of [[21, 24], [23, 23]]) { a.px(x, y, 0x4a5a80); a.px(x + 1, y + 1, 0x4a5a80); }                         // two more stitches hanging on
    a.px(17, 19, 0xe8b060); a.px(18, 19, 0xe8b060); a.px(18, 20, 0xd89a40); a.px(16, 20, 0xf0c880);                           // gravy down his front
  }, 0);
  // The Mac-Grinder (pixel art): chunky orange grinder body, glass hopper heaped with macaroni,
  // a crank with a red knob at the back, wooden grip and a steel barrel ring. The drill bit is a separate spinning part.
  pixSprite(scene, 'c_gun', 34, 26, a => {
    const OR = [0xffa04a, 0xff7a1a, 0xc4501a], STL = [0xdfe6f0, 0x9aa4b4, 0x5a6272];
    a.line([[4, 14], [1, 9]], 0x7a8698, 2); a.rrect(0, 5, 3, 8, 1, [0xff8a8a, 0xe03030, 0x901818]);   // crank + knob
    a.rrect(10, 18, 16, 25, 2, [0xb07a40, 0x7a4a1a, 0x4a2a0a]);                                      // grip
    a.line([[17, 19], [20, 23], [16, 24]], 0x3b4252);                                                  // trigger guard
    a.rrect(4, 10, 27, 20, 4, OR);                                                                     // body
    a.rect(6, 17, 25, 18, 0xc4501a); a.rect(7, 11, 22, 11, 0xffc890);                                   // under-shade + top shine
    a.ell(9, 15, 2.6, 2.6, STL); a.px(9, 15, 0x3b4252);                                                 // crank hub
    a.rrect(26, 11, 33, 19, 2, STL); a.rect(29, 11, 30, 19, 0x5a6272);                                  // barrel ring
    a.poly([[11, 10], [23, 10], [26, 2], [8, 2]], [0xeaf8ff, 0xb8e4ff, 0x6ab0e0]);                      // glass hopper
    a.rect(8, 0, 26, 2, [0xff8a8a, 0xe03030, 0x901818][1]);                                             // red rim
    for (const [x, y] of [[11, 4], [15, 3], [19, 4], [13, 6], [17, 6], [21, 6], [15, 8]]) { a.px(x, y, 0xffd23f); a.px(x + 1, y, 0xffa21a); a.px(x, y + 1, 0xffa21a); }   // macaroni
    a.px(10, 3, 0xffffff); a.px(10, 4, 0xffffff);                                                       // glass glint
  });
  // jetpack: twin white tanks with red caps and steel nozzles
  pixSprite(scene, 'c_tanks', 14, 28, a => {
    a.rrect(0, 1, 5, 20, 2, SUIT); a.rrect(7, 1, 12, 20, 2, SUIT);
    a.rect(0, 1, 5, 3, 0xd62828); a.rect(7, 1, 12, 3, 0xd62828);
    for (const [x, y, c] of [[1, 19, 0x3a3a48], [2, 18, 0x5a5a68], [3, 19, 0x3a3a48], [2, 16, 0x7a7a88], [8, 19, 0x3a3a48], [10, 18, 0x5a5a68], [9, 17, 0x7a7a88], [11, 19, 0x3a3a48], [10, 15, 0x8a8a98]]) a.px(x, y, c);   // (v2.59) scorched round the nozzles
    a.line([[2, 8], [4, 10]], 0x93a8cc); a.px(9, 7, 0xb86a3a); a.px(10, 8, 0xb86a3a); a.px(3, 5, 0x93a8cc); a.px(9, 11, 0x93a8cc);   // a dent, a rust spot
    a.rect(1, 21, 4, 25, 0x5a6272); a.rect(8, 21, 11, 25, 0x5a6272); a.rect(1, 21, 4, 21, 0x9aa4b4); a.rect(8, 21, 11, 21, 0x9aa4b4);
  });
}

class ChrisRig {
  // swap the gun model: the Mac-Grinder has a spinning drill, the Spaghetti Spinner a fixed nozzle
  setWeapon(w) {
    this.gun.setTexture(w.gunTex);
    this.tipSpins = w.tipTex === 'auger';
    this.auger.setTexture(this.tipSpins ? 'auger0' : w.tipTex);
  }

  constructor(scene) {
    makeChrisTextures(scene);
    this.gaitOn = scene.sys.settings.key === 'level1';   // (v3.94) the funny walks are for the levels (not the shop's wheel dances)
    const img = (key, x, y, ox, oy) => scene.add.image(x, y, key).setOrigin(ox, oy);
    // a bendy limb (v3.60): a Rope under WebGL; on the canvas fallback, a plain image that's stretched straight between its ends
    const webgl = scene.game.renderer.type === Phaser.WEBGL;
    const limb = (key, n) => {
      const o = webgl ? scene.add.rope(0, 0, key, null, n, true) : scene.add.image(0, 0, key).setOrigin(0, 0.5);
      if (webgl) {
        o.setTint = function (c) { this.setColors(c); return this; }; o.clearTint = function () { this.setColors(0xffffff); return this; };
        const st = o.setTexture; o.setTexture = function (k, fr) { st.call(this, k, fr); this.updateUVs(); return this; };
      }
      o.limbN = n; o.isRope = webgl; return o;
    };
    this.root = scene.add.container(0, 0).setDepth(7);

    this.capeS = [0, 1, 2, 3].map(i => img('c_capeS' + i, 0, 0, 0.5, 0));   // physics cape strips (behind everything)
    this.tanks = img('c_tanks', -16, -36, 0.5, 0.5);
    this.legB = limb('c_legRF', LIMB.legN);
    this.bootB = img('c_boot', -6, 0, LIMB.ankX / LIMB.bootW, 1);
    this.fFist = img('c_fistF', 0, 0, 0.45, 0.45).setVisible(false);      // the far hand when it's NOT on the gun (drawn behind the body)
    this.fOpen = img('c_hand_open', 0, 0, 0.3, 0.5).setVisible(false);
    this.torso = scene.add.container(0, -16);
    this.body = img('c_body', 0, 3, 0.5, 1);
    this.belly = img('c_belly', 8, -12, 0.5, 0).setVisible(false);   // (the belly is part of c_body now)
    this.armB = img('c_arm', -3, -22, 0, 0.5);
    this.apron = img('c_apronT', 5, -33, 0.5, 0);                    // the apron over the FRONT of the suit...
    this.apronB = img('c_apronB', 5, -14, 0.5, 0);                   // ...with a skirt that flaps on a spring
    this.collar = img('c_collar', -3, -37, 0.5, 0.5);                // the cape's knot, over the neck
    this.head = img('c_head', 2, -44, 0.5, 0.5);
    this.tache = img('c_tache', 2, -38, 0.5, 0.5);                    // (v2.59) the moustache is its own part: it twitches and bristles
    this.pop = img('c_eyepop', 5, -47, 0.5, 0.5).setVisible(false);   // eyes out on stalks
    this.wear = img('c_wear', 0, 3, 0.5, 1);                          // popped stitches over the belly
    this.handB = img('c_hand_open', 0, 0, 0.3, 0.5).setVisible(false); // the free hand, splayed
    this.crack = img('c_crack', 2, -44, 0.5, 0.5).setVisible(false);  // game over: cracked glass
    this.hat = img('c_hat', 3, -54, 0.5, 1);
    this.torso.add([this.body, this.wear, this.armB, this.handB, this.apron, this.apronB, this.belly, this.collar, this.head, this.crack, this.tache, this.hat, this.pop]);
    this.legF = limb('c_legR', LIMB.legN);
    this.bootF = img('c_boot', 7, 0, LIMB.ankX / LIMB.bootW, 1);
    this.gunArm = scene.add.container(4, -42);
    this.gArm = img('c_arm', 0, 0, 0, 0.5);
    // the gun hangs off a pivot at the grip, so the melee bash can FLIP it round (butt first) without moving the arm
    const BK = -5, GX = 20 + BK, GY = 5;                               // (v3.53: held a little further back and lower, at his belly, so both arms reach it)
    this.gunPivot = scene.add.container(GX, GY);
    this.gun = img('c_gun', 4 + BK - GX, 1 - GY, 0, 15 / 26).setScale(1.25);   // barrel centre lines up with the arm; a big chunky gun
    this.auger = img('auger0', 44 + BK - GX, 1 - GY, 0, 0.5).setScale(1.25);
    chrisGunParts(scene);
    { const gi = (key, ox, oy) => img(key, 0, 0, ox, oy).setVisible(false);     // (v3.61) the guns' live parts (see updateGunFx)
      this.gfx = { crank: gi('c_crank', 0.5, 0.92), fill: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(() => gi('c_hopfill', 0, 0)), reel: gi('c_reel0', 0.5, 0.5), strand: gi('c_strand', 0.1, 0.7),
        sock: [0, 1, 2].map(() => gi('c_socket', 0.5, 0.5)), heat: gi('c_heat', 0.5, 0.5).setBlendMode(Phaser.BlendModes.ADD),
        px: GX, py: GY, q: 0, qv: 0, sl: 0, slv: 0, lv: 1, hot: 0, spin: 0, crankA: 0, reelA: 0, steamT: 0, shot: false, puffs: [] }; }
    this.gunPivot.add([this.gfx.crank, this.gun, ...this.gfx.fill, this.gfx.reel, this.gfx.strand, ...this.gfx.sock, this.auger, this.gfx.heat]);
    this.grip = img('c_grip', 20, 10, 0.5, 0.5);                      // fingers round the grip, over the gun
    this.gunArm.add([this.gArm, this.gunPivot, this.grip]);
    this.stars = [0, 1, 2].map(() => img('c_ouchstar', 0, 0, 0.5, 0.5).setVisible(false));
    this.gArm.setVisible(false); this.grip.setVisible(false); this.armB.setAlpha(0); this.handB.setAlpha(0);   // (the old stub arms: replaced by the limbs below)
    this.fArm = limb('c_armF', LIMB.armN); this.fHand = img('c_hold', 0, 0, 0.5, 0.35);
    this.nArm = limb('c_armN', LIMB.armN); this.nHand = img('c_fistg', 0, 0, 0.45, 0.45);
    // back to front: legs and boots, [the far arm when it's free], the body, [the far arm when it's on the gun], the gun, the near arm
    this.root.add([...this.capeS, this.tanks, this.legB, this.bootB, this.legF, this.bootF, this.fFist, this.fOpen, this.torso, this.fArm, this.gunArm, this.fHand, this.nArm, this.nHand, ...this.stars]);
    this.fArmFront = true;

    this.parts = [...this.capeS, this.tanks, this.legB, this.bootB, this.body, this.belly, this.apron, this.apronB, this.collar, this.head, this.tache, this.wear, this.hat, this.legF, this.bootF, this.gun, this.fArm, this.fHand, this.fFist, this.fOpen, this.nArm, this.nHand, this.gfx.crank, ...this.gfx.fill, this.gfx.reel, this.gfx.strand];
    this.tinted = false;
    this.wp = 0;          // waddle phase
    this.t = 0;
    this.cloth = null;    // cape chain points (local space), built on the first update
    this.flapA = 0; this.flapV = 0;    // apron skirt spring
    this.morph = -1;                   // apron -> cape spin (intro only); -1 = not spinning
    this.setChef(false);               // in battle he's an astronaut: cape on, no apron
    this.squash = 0;
    this.recoil = 0;
    this.wasGround = true;
    this.vhPrev = 0;
    this.faceKey = null; this.ouchT = 0; this.ouchHeavy = false; this.grinT = 0; this.blinkT = 2; this.blinkOn = 0; this.twitchT = 3; this.twitch = 0; this.hatA = 0; this.hatV = 0;
  }
  // (v2.59) acting: a hit (eyes pop, stars), a kill (smug grin), or a face forced from outside (the shop wheel, game over)
  ouch(heavy) { this.ouchT = 0.7; this.ouchHeavy = !!heavy; }
  grin() { this.grinT = 0.8; }
  setFace(key) { this.faceKey = key || null; }

  // (v3.61) THE GUNS, ALIVE. Every shot squeezes the gun like a tube (long and thin, then fat, then settled); the tank
  // shows ON the gun (macaroni sloshing in the Mac-Grinder's hopper, the Spinner's reel unwinding, the Swiss-Shot's
  // drum emptying); the working parts turn while it fires; and as the tank runs down the muzzle glows, rattles when a
  // jam is close, and steams as it cools.
  updateGunFx(P, dt, sq, run) {
    const F = this.gfx, gun = this.gun, aug = this.auger, T = this.root.scene.textures, t = this.t, h = Math.min(0.033, dt);
    let key = gun.texture.key;
    if (T.exists(key + '_e')) { gun.setTexture(key + '_e'); key += '_e'; }
    const kind = key.startsWith('c_gun2') ? 'spin' : key.startsWith('c_gun3') ? 'swiss' : key.startsWith('c_gun') ? 'mac' : '';
    const live = !!kind && this.gunArm.visible, ammo = P.ammo == null ? 1 : Math.max(0, Math.min(1, P.ammo));
    const beam = !!P.beamOn, firing = P.firing > 0 || beam, charge = P.charge || 0, jam = !!(P.jamShake || P.jamBang);
    // ---- squash and stretch
    const shot = P.firing > 0.09; if (shot && !F.shot) { F.qv += 15; F.slv -= 2.2; } F.shot = shot;
    const qT = live ? -0.75 * charge + (charge >= 1 ? Math.sin(t * 50) * 0.18 : 0) + (beam ? 0.12 + Math.sin(t * 34) * 0.1 : 0) : 0;   // charging: it swells; the beam: it throbs
    F.qv += ((qT - F.q) * 320 - F.qv * 15) * h; F.q = Math.max(-1.1, Math.min(1.3, F.q + F.qv * h));
    const sx = 1.25 * (1 + 0.11 * F.q), sy = 1.25 * (1 - 0.09 * F.q);
    gun.setScale(sx, sy); aug.x = gun.x + 32 * sx; aug.setScale(1.25 * (1 + 0.2 * F.q), 1.25 * (1 - 0.06 * F.q));
    const gp = (px, py) => [gun.x + px * sx, gun.y + (py - 15) * sy];
    // ---- heat: how near the tank is to empty. Close to a jam the whole gun rattles
    F.hot += ((live ? 1 - ammo : 0) - F.hot) * Math.min(1, h * 6); F.lv += (ammo - F.lv) * Math.min(1, h * 9);
    const hk = Math.max(0, (F.hot - 0.35) / 0.65), near = live && firing && ammo < 0.22 ? 1 : 0;
    this.gunPivot.setPosition(F.px + Math.sin(t * 61) * 0.8 * near, F.py + Math.cos(t * 53) * 0.7 * near);
    aug.setTint(Phaser.Display.Color.GetColor(255, 255 - Math.round(125 * hk), 255 - Math.round(190 * hk)));
    F.heat.setVisible(live && hk > 0.02).setPosition(aug.x + 7 * sx, aug.y).setAlpha(Math.min(1, hk * (0.75 + 0.2 * Math.sin(t * 23)) + near * 0.25)).setScale(sx * (0.9 + 0.9 * hk + near * 0.3 * Math.sin(t * 47)));
    // ---- steam off the muzzle: in wisps as it cools, in a rush when it's about to jam (left behind in the world, not stuck to him)
    F.steamT -= h;
    if (live && F.steamT <= 0 && !jam && (near || (!firing && F.hot > 0.45))) {
      F.steamT = near ? 0.09 : 0.3 - 0.18 * F.hot;
      const sc = this.root.scene, m = aug.getWorldTransformMatrix(), tp = m.transformPoint(aug.width * (1 - aug.originX) - 3, -3);
      let pf = F.puffs.find(o => !o.im.visible);
      if (!pf && F.puffs.length < 10) { pf = { im: sc.add.image(0, 0, 'c_puff') }; F.puffs.push(pf); }
      if (pf) { pf.t = 0; pf.T = 0.45 + Math.random() * 0.3; pf.vx = (Math.random() - 0.5) * 14; pf.im.setVisible(true).setPosition(tp.x, tp.y).setDepth((this.root.depth || 0) + 0.01); }
    }
    { const z = Math.abs(this.root.scaleY) || 1;
      for (const pf of F.puffs) if (pf.im.visible) { pf.t += h; const k = pf.t / pf.T; if (k >= 1) { pf.im.setVisible(false); continue; }
        pf.im.x += pf.vx * h * z; pf.im.y -= (26 - 12 * k) * h * z; pf.im.setAlpha(0.6 * (1 - k)).setScale(z * (0.7 + 1.5 * k)); } }
    // ---- the working parts
    F.spin += ((live && firing ? 1 : 0) - F.spin) * Math.min(1, h * (firing ? 9 : 3));                // they wind up fast and run down slowly
    const mac = live && kind === 'mac', spin = live && kind === 'spin', swiss = live && kind === 'swiss';
    // Mac-Grinder: the crank turns (seen side-on, it bobs over the top and round the back), the macaroni sits level as the gun tilts, and sloshes
    F.crankA += h * F.spin * 24;
    { const p = gp(4.5, 13.5), c = Math.cos(F.crankA); F.crank.setVisible(mac).setPosition(p[0], p[1]).setScale(sx, sy * (Math.abs(c) < 0.18 ? 0.18 * (c < 0 ? -1 : 1) : c)); }
    const tilt = Math.max(-0.55, Math.min(0.55, -Math.tan(Math.max(-1.2, Math.min(1.2, this.gunArm.rotation + this.gunPivot.rotation)))));
    if (sq > 0.9) F.slv += 3;
    F.slv += ((tilt + Math.sin(this.wp * 2) * 0.12 * run - F.sl) * 110 - F.slv * 5.5) * h; F.sl = Math.max(-0.7, Math.min(0.7, F.sl + F.slv * h));
    { const p = gp(8, 3);
      F.fill.forEach((im, k) => {
        const x0 = k * 2, w = k === 9 ? 1 : 2, top = Math.max(0, Math.round(7 - F.lv * 7 + (x0 + 1 - 9.5) * F.sl + (firing ? Math.sin(t * 38 + k * 1.9) * 0.6 : 0)));
        im.setVisible(mac && top < 7); if (mac && top < 7) im.setPosition(p[0], p[1]).setScale(sx, sy).setCrop(x0, top, w, 7 - top);
      }); }
    // Spaghetti Spinner: the reel spins up, and unwinds as the tank drains
    F.reelA += h * F.spin * 26;
    { const p = gp(13.5, 6.5), rk = 0.68 + 0.32 * F.lv, fr = 'c_reel' + (Math.floor(F.reelA / (Math.PI / 4)) & 3), q = gp(19, 8.5);
      F.reel.setVisible(spin).setPosition(p[0], p[1] + (1 - rk) * 3).setScale(sx * rk, sy * rk); if (spin && F.reel.texture.key !== fr) F.reel.setTexture(fr);
      F.strand.setVisible(spin).setPosition(q[0], q[1]).setScale(sx, sy).setRotation(Math.sin(t * 7) * 0.2 + F.spin * Math.sin(t * 41) * 0.55); }
    // Swiss-Shot: the balls in the drum go as the tank does
    [[8, 3, 0.04], [12, 3, 0.36], [10, 6, 0.69]].forEach(([x, y, lim], k) => { const p = gp(x, y); F.sock[k].setVisible(swiss && ammo < lim).setPosition(p[0], p[1]).setScale(sx, sy); });
  }

  // lay a limb along a curve from A, THROUGH its joint K, to B. Points before index i0 run straight back from A (the
  // shoulder ball); the joint lands on index iK, where the sprite's elbow / knee is drawn.
  bendLimb(o, A, K, B, i0, iK) {
    const n = o.limbN;
    if (!o.isRope) {                                                    // canvas fallback: straight from A to B
      const d = Math.hypot(B[0] - A[0], B[1] - A[1]), w = o.width, back = w * i0 / (n - 1);
      o.setOrigin(back / w, 0.5).setPosition(A[0], A[1]).setRotation(Math.atan2(B[1] - A[1], B[0] - A[0])).setScale(d / (w - back), 1); return;
    }
    const cx = 2 * K[0] - (A[0] + B[0]) / 2, cy = 2 * K[1] - (A[1] + B[1]) / 2, P = o.points;   // a quadratic that passes through K at its middle
    for (let i = 0; i < n; i++) {
      const t = i <= iK ? 0.5 * (i - i0) / (iK - i0) : 0.5 + 0.5 * (i - iK) / (n - 1 - iK), u = 1 - t;
      if (t < 0) { const m = (i0 - i) * 2 / (Math.hypot(cx - A[0], cy - A[1]) || 1); P[i].x = A[0] - (cx - A[0]) * m; P[i].y = A[1] - (cy - A[1]) * m; }   // (2px a step, as drawn: the shoulder ball keeps its shape)
      else { P[i].x = u * u * A[0] + 2 * u * t * cx + t * t * B[0]; P[i].y = u * u * A[1] + 2 * u * t * cy + t * t * B[1]; }
    }
    o.updateVertices();
  }
  // where a two-bone limb's joint sits: A -> joint -> B with bone lengths a, b. sgn picks the side it bends to (and
  // fractions of it flatten the bend). Out of reach, the bones stretch.
  limbJoint(A, B, a, b, sgn) {
    const dx = B[0] - A[0], dy = B[1] - A[1], d = Math.hypot(dx, dy) || 0.001, k = Math.max(1, d / (a + b) * 1.01);
    a *= k; b *= k;
    const dd = Math.max(Math.abs(a - b) + 0.01, Math.min(a + b - 0.01, d)), ang = Math.atan2(dy, dx) + Math.acos(Math.max(-1, Math.min(1, (a * a + dd * dd - b * b) / (2 * a * dd)))) * sgn;
    return [A[0] + Math.cos(ang) * a, A[1] + Math.sin(ang) * a];
  }

  // (v3.60) THE ARMS. Both gloves stay on the gun (a fist round the grip, the other hand cupped under the front) while
  // the elbows trail behind on a spring: they swing back as he runs, drop as he lands, and kick out when he fires.
  // The far hand lets go to thump a jammed gun, flail when he's grabbed, hit or falling, and fling out behind a bash.
  updateArms(P, jB, dt, sw, run, air, sq) {
    const T = this.torso, tr = T.rotation, G = this.gunArm, gr = G.rotation, pv = this.gunPivot, ps = pv.rotation, gun = this.gun, t = this.t;
    const fromT = (lx, ly) => { const x = lx * T.scaleX, y = ly * T.scaleY; return [T.x + x * Math.cos(tr) - y * Math.sin(tr), T.y + x * Math.sin(tr) + y * Math.cos(tr)]; };
    const fromGun = (px, py) => {                                                      // a pixel on the gun's texture -> rig space
      const x = gun.x + px * gun.scaleX, y = gun.y + (py - 15) * gun.scaleY;
      const x1 = pv.x + x * Math.cos(ps) - y * Math.sin(ps), y1 = pv.y + x * Math.sin(ps) + y * Math.cos(ps);
      const x2 = x1 * G.scaleX, y2 = y1 * G.scaleY;
      return [G.x + x2 * Math.cos(gr) - y2 * Math.sin(gr), G.y + x2 * Math.sin(gr) + y2 * Math.cos(gr)];
    };
    const cl = (v, m) => Math.max(-m, Math.min(m, v)), fc = P.facing < 0 ? -1 : 1, h = Math.min(0.033, dt);
    // the elbow spring: where the body's motion wants to throw it
    const E = this.elb || (this.elb = { x: 0, y: 0, vx: 0, vy: 0 });
    const ex = cl(-(P.vx || 0) * fc * 0.011, 3) - this.recoil * 2.6, ey = cl((P.vh || 0) * 0.008 * air, 3.5) + this.recoil * 1.6 + Math.max(0, sq) * 4;
    E.vx += ((ex - E.x) * 240 - E.vx * 13) * h; E.vy += ((ey - E.y) * 240 - E.vy * 13) * h;
    E.x = cl(E.x + E.vx * h, 6); E.y = cl(E.y + E.vy * h, 6);

    const held = G.visible, H = GUN_HOLD[gun.texture.key] || GUN_HOLD.c_gun, gunRot = gr + ps, free = this.freeRot;
    // ---- the gun arm: on the grip (or swinging at his side if the gun's gone)
    const sN = fromT(-9.5, -25.5);                                     // (the shoulder sits right over the suit's badge)
    sN[0] += sw * 0.8 * run - this.recoil * 1.2; sN[1] -= Math.max(0, sq) * 1.5;                 // it rolls with his stride, shrugs on a landing
    let aN = free != null ? free * 0.85 - 0.25 : 1.4 - sw * 0.75 * run - air * 0.9;
    const tN = held ? fromGun(H.g[0], H.g[1]) : [sN[0] + Math.cos(aN) * 29, sN[1] + Math.sin(aN) * 29];
    const kN = this.limbJoint(sN, tN, 16.5, 16.5, 1); kN[0] += E.x; kN[1] += E.y;
    this.bendLimb(this.nArm, sN, kN, tN, LIMB.armI0, LIMB.armIK);
    this.nHand.setPosition(tN[0], tN[1]).setRotation(held ? gunRot : aN - 0.4);

    // ---- the far arm
    const open = this.handB.visible, jam = jB > 0 && this.fist && this.fist.visible;
    // (v3.128) THE PINT is in his REAR hand. The front arm keeps the gun, lowered out of the way, so you can see the
    // rear arm swing the glass up. Everything is placed from the GLASS: its near lip goes to his actual mouth (head
    // position and tilt), it tips as it empties, and the hand cups the BACK of the glass (drawn behind it, so the
    // beer going down is in plain view).
    const dr = this.drinkPose || { u: 0 }; let glass = null, dHand = null, dW = 0, dRot = 0;
    if (dr.u > 0) {
      const sm = (a, b) => { const u = Math.max(0, Math.min(1, (dr.u - a) / (b - a))); return u * u * (3 - 2 * u); }, L = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
      const hr = this.head.rotation, mx = 3.5, my = 10.5, mouth = fromT(this.head.x + mx * Math.cos(hr) - my * Math.sin(hr), this.head.y + mx * Math.sin(hr) + my * Math.cos(hr));
      const lv = Math.max(0, Math.min(4, Math.floor((dr.u - 0.3) / 0.44 * 5))), SC = 1.45;
      const reach = fromT(25, -31), low = fromT(23, -25), up = sm(0.2, 0.34), dn = sm(0.74, 0.84);
      const lip = dr.u < 0.74 ? L(reach, mouth, up) : L(mouth, low, dn);                                // where the glass's near lip is
      const rot = dr.u < 0.74 ? -(0.55 + 0.2 * lv) * up - 0.08 * dr.glug : -(0.55 + 0.8) * (1 - dn);       // tipped further as it empties
      const hx = 9.5 * SC, hy = 7.5 * SC, hnd = [lip[0] + hx * Math.cos(rot) - hy * Math.sin(rot), lip[1] + hx * Math.sin(rot) + hy * Math.cos(rot)];   // the back of the glass, low down
      const wipe = dr.u >= 0.86 ? [mouth[0] + 3 + Math.sin((dr.u - 0.86) / 0.08 * Math.PI * 2) * 4, mouth[1] - 1] : null;      // the back of his hand across the moustache
      dHand = wipe ? L(low, wipe, sm(0.86, 0.89)) : hnd; dW = sm(0, 0.11) * (1 - sm(0.95, 1)); dRot = rot + 0.3;
      if (dr.u >= 0.12 && dr.u < 0.86) glass = { x: lip[0], y: lip[1], rot, lv: dr.u < 0.3 ? 0 : lv, SC };
    }
    const two = held && H.f && !(jB > 0) && !P.grabbed && !open && !(P.bashSpin || 0) && free == null && !(dW > 0);
    const sF = fromT(-7, -27);
    let tF, front = true, hand = null, aF = 0;
    if (two) { tF = fromGun(H.f[0], H.f[1]); hand = this.fHand; aF = gunRot; }
    else if (jam) tF = [this.fist.x - 2, this.fist.y + 6];              // reaching up to the great fist that thumps the gun
    else if (dW > 0) { const g0 = held && H.f ? fromGun(H.f[0], H.f[1]) : dHand; tF = [g0[0] + (dHand[0] - g0[0]) * dW, g0[1] + (dHand[1] - g0[1]) * dW]; hand = this.fFist; aF = dRot * dW + 0.4; }
    else {
      front = false;
      aF = free != null ? free                                          // (set from outside: the skydive)
        : P.grabbed ? -1.7 + Math.sin(t * 23 + 1) * 1.0                 // grabbed: waving hysterically
        : this.ouchT > 0.3 ? -2.25 + Math.sin(t * 40) * 0.25            // hit: thrown up
        : open ? -2.0 + Math.sin(t * 13) * 0.32                         // falling: up and back, flapping
        : (P.bashSpin || 0) ? 2.75                                      // a bash: flung out behind for balance
        : 1.75 + sw * 0.75 * run - air * 0.7;                           // nothing to hold: it swings as he walks
      tF = [sF[0] + Math.cos(aF) * 27, sF[1] + Math.sin(aF) * 27];
      hand = open || P.grabbed || free != null ? this.fOpen : this.fFist;
    }
    const kF = this.limbJoint(sF, tF, 16, 16, front ? 1 : (aF < 0 ? -1 : 1)); kF[0] += E.x * 1.3; kF[1] += E.y * 1.3;
    this.bendLimb(this.fArm, sF, kF, tF, LIMB.armI0, LIMB.armIK);
    if (front !== this.fArmFront) { this.fArmFront = front; if (front) this.root.moveAbove(this.fArm, this.torso); else this.root.moveBelow(this.fArm, this.fFist); }
    for (const o of [this.fHand, this.fFist, this.fOpen]) o.setVisible(o === hand);
    if (hand) hand.setPosition(tF[0], tF[1]).setRotation(hand === this.fHand ? aF : hand === this.fOpen ? aF + Math.sin(t * 20) * 0.15 : aF - 0.4);
    const sc0 = this.root.scene;
    if (glass && !this.pint && sc0.textures.exists('br_pint0')) { this.pint = sc0.add.image(0, 0, 'br_pint0').setOrigin(1.5 / 12, 2.5 / 14); this.root.add(this.pint); }
    if ((dW > 0) !== !!this.fistFront) { this.fistFront = dW > 0; if (this.fistFront) this.root.moveAbove(this.fFist, this.fArm); else this.root.moveAbove(this.fFist, this.bootF); }
    if (this.pint) { this.pint.setVisible(!!glass); if (glass) { this.root.moveAbove(this.pint, this.fFist); this.pint.setTexture('br_pint' + glass.lv).setScale(glass.SC).setPosition(glass.x, glass.y).setRotation(glass.rot); } }
  }

  // chef mode (the intro / ending at home): "Kiss the Cook" apron, no cape. Battle mode: just the cape.
  setChef(on) {
    this.chef = on; this.morph = -1;
    this.apron.setVisible(on).setScale(1); this.apronB.setVisible(on);
    for (const c of this.capeS) c.setVisible(!on).setScale(1);
    this.collar.setVisible(!on).setScale(1);
  }
  // the transformation: the apron whips round and round on the spot and turns into the cape
  spinToCape() { if (this.chef) this.morph = 0; }

  setPowered(on) {
    if (on === this.tinted) return;
    this.tinted = on;
    for (const p of this.parts) { if (on) p.setTint(0xffe9a0); else p.clearTint(); }
  }

  // ---- the cape: a 5-point chain hanging off the back of the neck. Simulated in the rig's own (facing-right) space:
  // gravity pulls it down, and "air" blowing against Chris's movement drags it back when he runs, down when he jumps,
  // up when he falls, with a flutter that grows with speed. Strips snap to 1/12-turn angles so it stays sprite-y.
  updateCloth(P, dt, grounded, fly) {
    const N = 5, SEG = 9.5, fc = P.facing < 0 ? -1 : 1;
    const dk0 = this.drkOff || [0, 0, 0], tr = this.torso.rotation - dk0[2], tx = this.torso.x - dk0[0], ty = this.torso.y - dk0[1];   // (the cape hangs from where he'd be standing sober: the tipsy sway pumped it up over his head)
    const ax = tx + (-9) * Math.cos(tr) - (-36) * Math.sin(tr), ay = ty + (-9) * Math.sin(tr) + (-36) * Math.cos(tr);   // anchor: back of the neck
    if (!this.cloth) { this.cloth = []; for (let i = 0; i < N; i++) this.cloth.push({ x: ax - i * 1.5, y: ay + i * SEG, vx: 0, vy: 0 }); }
    const C = this.cloth, airX = -(P.vx || 0) * fc * 0.65, airY = (P.vh || 0) * 0.55 + (fly ? 140 : 0);   // jetting: the exhaust blows it down and back
    const sp = Math.hypot(airX, airY), nSub = Math.min(6, Math.max(2, Math.ceil(dt * 120))), h = Math.min(0.05, dt) / nSub;   // more steps on slow frames, so it moves at the same speed on any phone
    for (let sub = 0; sub < nSub; sub++) {
      C[0].x = ax; C[0].y = ay;
      for (let i = 1; i < N; i++) {
        const p = C[i], fl = Math.sin(this.t * (16 + sp * 0.02) + i * 1.4) * Math.min(260, sp * 0.9) * (i / N);   // flutter, worst at the hem
        const nx = -airY / (sp || 1), ny = airX / (sp || 1);
        p.vx += ((airX - p.vx) * 3.5 + nx * fl - 6) * h;               // (a slight backwards bias so it never hangs dead straight)
        p.vy += (900 + (airY - p.vy) * 3.5 + ny * fl) * h;
        p.ox = p.x; p.oy = p.y; p.x += p.vx * h; p.y += p.vy * h;
      }
      for (let it = 0; it < 3; it++) {
        C[0].x = ax; C[0].y = ay;
        for (let i = 1; i < N; i++) {
          const a = C[i - 1], b = C[i], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, k = (d - SEG) / d;
          if (i === 1) { b.x -= dx * k; b.y -= dy * k; } else { a.x += dx * k * 0.5; a.y += dy * k * 0.5; b.x -= dx * k * 0.5; b.y -= dy * k * 0.5; }
          const back = ax - 3.2 * i;                                  // drapes out in a cone behind him, so it shows even standing still
          if (b.x > back) b.x = back;
          if (grounded && b.y > -1) b.y = -1;                          // and never through the floor
        }
      }
      for (let i = 1; i < N; i++) { const p = C[i]; p.vx = (p.x - p.ox) / h; p.vy = (p.y - p.oy) / h; }
    }
    const STEP = Math.PI / 12;
    for (let i = 0; i < 4; i++) {
      const a = C[i], b = C[i + 1], ang = Math.atan2(b.y - a.y, b.x - a.x) - Math.PI / 2;
      this.capeS[i].setPosition(Math.round(a.x), Math.round(a.y)).setRotation(Math.round(ang / STEP) * STEP);
    }
    // apron skirt: a springy hinge at the waist. Swings back when running, flips up when falling, wobbles on landing
    const tgt = Math.max(-1.1, Math.min(0.5, -(P.vx || 0) * fc * 0.0022 + Math.min(0, P.vh || 0) * 0.0016 * (grounded ? 0 : 1)));
    this.flapV += ((tgt - this.flapA) * 160 - this.flapV * 9) * dt;
    if (this.squash > 0.9) this.flapV -= 6;                          // landing whump
    this.flapA = Math.max(-1.3, Math.min(0.7, this.flapA + this.flapV * dt));
    const fq = Math.round(this.flapA / (Math.PI / 16)) * (Math.PI / 16);
    this.apronB.setRotation(fq);
    if (this.morph < 0) this.apronB.setScale(1, Math.max(0.7, Math.cos(fq) * 0.9 + 0.1));
  }

  // P = player state, (x, y) = screen position of his feet, z = world zoom, alpha = hit flicker, augerFrame = 0..3
  update(P, dt, x, y, z, alpha, augerFrame) {
    this.t += dt;
    const t = this.t;
    const grounded = P.h <= (P.floor || 0) + 0.5 && P.vh <= 0;
    const spd = Math.abs(P.vx);
    const run = grounded ? Math.min(1, spd / 140) : 0;

    // ---- phases
    const crawl = grounded && P.duck ? Math.min(1, spd / 50) : 0;      // crouch-walking: short quick waddle steps
    if (grounded && spd > 10) this.wp += dt * (spd / (STRIDE * Math.max(0.35, Math.min(1, spd / 140)))) * 1.1 * (1 + crawl * 0.5) * ((P.vx || 0) * (P.facing < 0 ? -1 : 1) < 0 ? -1 : 1);   // (backing up while he aims: the legs back-pedal)
    if (!this.wasGround && grounded) { this.squash = 1; this.bv = (this.bv || 0) + 5; }   // landing squash (and a belly wobble)
    if (this.wasGround && !grounded && P.vh > 200) this.squash = -0.8;   // take-off stretch
    this.wasGround = grounded;
    this.squash += (0 - this.squash) * Math.min(1, dt * 9);
    const sq = this.squash;
    // ---- (v3.94) GAITS: so the run isn't the same loop over and over, he walks one of several ways, picked at random
    // each time he sets off and swapped every few seconds: a STRUT, a LIMP (one stiff leg dragged along, a lurch and a
    // dip each time his weight goes on it, the good leg hurrying), a SKIP (a hop on every other step) and a SWAGGER
    // (leaning back, hips rolling, boots wide). Now and then he TRIPS over nothing and catches himself.
    const G = this.gait || (this.gait = { k: 'strut', w: { strut: 1, limp: 0, skip: 0, swag: 0 }, t: 0, next: 4, trip: 0, tripCd: 9 });
    const moving = this.gaitOn && grounded && spd > 40 && !P.duck;
    if (moving) {
      G.t += dt; G.tripCd -= dt;
      if (G.t > G.next) { G.t = 0; G.next = 3.5 + Math.random() * 4; const o = ['strut', 'limp', 'skip', 'swag'].filter(k => k !== G.k); G.k = o[Math.floor(Math.random() * o.length)]; }
      if (G.tripCd <= 0 && spd > 100) { G.trip = 0.5; G.tripCd = 8 + Math.random() * 10; if (typeof Sound !== 'undefined') Sound.say('oi', { f0: 150 }); }
    } else if (!grounded || spd < 15) { if (G.t > 0.8 && Math.random() < 0.5) { const o = ['strut', 'limp', 'skip', 'swag']; G.k = o[Math.floor(Math.random() * 4)]; } G.t = 0; }
    for (const k in G.w) G.w[k] += ((k === G.k ? 1 : 0) - G.w[k]) * Math.min(1, dt * 5);
    G.trip = Math.max(0, G.trip - dt);
    const gk = this.gaitOn ? Math.min(1, run * 1.4) : 0, LIMP = G.w.limp * gk, SKIP = G.w.skip * gk, SWAG = G.w.swag * gk;
    const wpw = this.wp - 0.45 * Math.sin(this.wp) * LIMP;           // the limp: hurried off the bad leg, lingering on the good one
    const badW = Math.max(0, -Math.cos(wpw)) * LIMP;                   // his weight on the bad (front) leg
    const hop = Math.pow(Math.max(0, Math.sin(this.wp * 0.5 + 0.3)), 3) * SKIP * Math.max(0, Math.sin(this.wp));   // a hop on every other step
    const tripK = G.trip > 0 ? Math.sin(Math.PI * (1 - G.trip / 0.5)) : 0;
    const sw = Math.sin(wpw);
    const air = grounded ? 0 : 1;
    const fly = P.thrusting ? 1 : 0;


    // ---- CROUCH: a springy 0..1 (with a little overshoot going in and popping back up). Instead of squashing the
    // whole sprite, the knees bend out and the legs compress, the boots stay planted, and the body DROPS onto them.
    this.dv = (this.dv || 0) + (((P.duck ? 1 : 0) - (this.duckA || 0)) * 320 - (this.dv || 0) * 24) * dt;
    this.duckA = Math.max(-0.1, Math.min(1.12, (this.duckA || 0) + this.dv * dt));
    const dk = Math.max(0, this.duckA), DROP = 13.5 * dk, wad = crawl * dk, RAISE = 6;   // (v3.60: he stands 6px taller, on legs you can see)

    // ---- (v3.126) TIPSY (P.tipsy 0..1, from tipsy.js): it's in his legs and his balance, not a wobble of the whole sprite.
    // The body sways about 5 degrees over feet that keep shuffling to stay under it (and the gun sways with it); his
    // steps wander and high-step; every few seconds a knee buckles and he catches himself; he hiccups (a jolt, puffed
    // cheeks); his head lolls and his eyelids droop.
    const DRK = Math.min(1, (P.tipsy || 0) * 1.6), dsw = DRK ? (Math.sin(t * 1.9) * 0.065 + Math.sin(t * 0.83 + 1) * 0.03) * DRK : 0;
    let buckK = 0, hicK = 0;
    if (DRK) {
      this.buckCd = (this.buckCd === undefined ? 2.5 : this.buckCd) - dt; this.hicCd = (this.hicCd === undefined ? 1.8 : this.hicCd) - dt;
      if (this.buckCd <= 0 && grounded) { this.buck = 0.55; this.buckCd = 3 + Math.random() * 4; this.buckSide = Math.random() < 0.5 ? 1 : -1; }
      if (this.hicCd <= 0) { this.hic = 0.24; this.hicCd = 2.5 + Math.random() * 4.5; this.hicFlag = true; this.bv = (this.bv || 0) + 4; }
      if (this.blinkOn <= 0 && Math.random() < dt * 0.7) this.blinkOn = 0.45 + Math.random() * 0.5;      // heavy eyelids
    }
    this.buck = Math.max(0, (this.buck || 0) - dt); this.hic = Math.max(0, (this.hic || 0) - dt);
    if (this.buck > 0) buckK = Math.sin(Math.PI * (1 - this.buck / 0.55)) * DRK;
    if (this.hic > 0) hicK = Math.sin(Math.PI * (1 - this.hic / 0.24));
    // ---- (v3.126) DRINKING (P.drink 0..1): reach, raise, head back and glug, lower with a grin, wipe the moustache
    const dU = P.drink || 0, dSm = (a, b) => { const u = Math.max(0, Math.min(1, (dU - a) / (b - a))); return u * u * (3 - 2 * u); };
    const dTip = dU > 0 ? dSm(0.2, 0.34) * (1 - dSm(0.74, 0.84)) : 0, dGlug = dU > 0.3 && dU < 0.74 ? Math.max(0, Math.sin((dU - 0.3) / 0.44 * Math.PI * 5)) : 0;
    const dOff = dU > 0 ? dSm(0.02, 0.14) * (1 - dSm(0.93, 1)) : 0;     // his gun hand's off the gun: it sags, held by the other hand
    this.drinkPose = { u: dU, tip: dTip, glug: dGlug };
    this.drkOff = [Math.sin(t * 1.9 - 0.7) * 2.6 * DRK + buckK * 2.5 * (this.buckSide || 1) - dTip * 1.5, buckK * 4.5 - hicK * 3, dsw + buckK * 0.16 * (this.buckSide || 1) - dTip * 0.13];
    if (dTip > 0.5) this.blinkOn = Math.max(this.blinkOn, 0.08);
    if (dU > 0.76 && dU < 0.8) this.grinT = 1.6;

    // ---- the body: bob and roll. Running, it's lowest as a foot lands and highest as the legs pass; standing, a cocky
    // little knee bounce. The hips sink into the knees on a landing and push up on take-off.
    const idle = (1 - run) * (1 - air), up1 = 1 - Math.min(1, dk);
    const lsq = (2.6 * Math.max(0, sq) - 1.4 * Math.max(0, -sq)) * up1;
    this.torso.setPosition(sw * (1.9 * run + 1.6 * wad) + 1.5 * dk + sw * 2.2 * SWAG + tripK * 2.5 + Math.sin(t * 1.9 - 0.7) * 2.6 * DRK + buckK * 2.5 * (this.buckSide || 1) - dTip * 1.5,
      -16 - RAISE * up1 - (1 + Math.cos(wpw * 2)) * (1.0 * run + 0.9 * wad) * (1 - 0.5 * LIMP) + Math.sin(t * 5.2) * 0.8 * idle * up1 + lsq + DROP
      + badW * 4.6 - hop * 8 + tripK * 2.5 + buckK * 4.5 - hicK * 3);
    this.torso.setRotation(sw * (0.1 * run + 0.11 * wad) + 0.06 * run - P.vh * 0.00022 * air + (P.bashLean || 0) + 0.13 * dk - this.recoil * 0.035
      + badW * 0.22 - 0.05 * LIMP + sw * 0.1 * SWAG - 0.14 * SWAG - hop * 0.08 + tripK * 0.42 + dsw + buckK * 0.16 * (this.buckSide || 1) - dTip * 0.13);   // lurches onto the bad leg; leans back to swagger; pitches forward on a trip  // leans in when crouched; rocks as he waddles; braces back against the gun

    // ---- LEGS (v3.60): each boot has a spot to be, the knee is solved from the hip, and the leg bends through it.
    // Standing: planted wide and bow-legged (front knee forward, back knee out behind). Running: each foot rides a loop,
    // back along the floor then lifted and swung through, heel first. In the air: knees tucked going up, legs
    // dangling and pedalling coming down, trailing in the jetpack's wash.
    const AH = LIMB.ankH, upv = Math.max(-1, Math.min(1, (P.vh || 0) / 320)), ju = Math.max(0, upv), jf = Math.max(0, -upv), sk = Math.min(1, dk * 1.4);
    for (const [leg, boot, hx, ph, side, squatX] of [[this.legF, this.bootF, 5, wpw, 1, 11 + sw * 2 * wad], [this.legB, this.bootB, -5, wpw + Math.PI, -1, -9 - sw * 2 * wad]]) {
      const s1 = Math.sin(ph), c1 = Math.cos(ph), hip = [this.torso.x + hx, this.torso.y + 1];
      const bad = side > 0 ? LIMP : 0, strideK = 1 - 0.45 * bad + 0.15 * SWAG, liftK = (1 - 0.8 * bad) * (1 + 0.8 * SKIP);   // the bad leg: short and dragged
      let bx = this.torso.x * 0.4 + hx + side * (1 + 3 * (1 - run) + 2.5 * SWAG) + s1 * STRIDE * run * strideK, by = -Math.max(0, c1) * 5 * run * (1 + wad * 0.6) * liftK - hop * 5, br = -s1 * Math.max(0, c1 + 0.3) * 0.5 * run * (1 - 0.7 * bad) + 0.25 * bad * Math.max(0, c1);   // (the bad boot drags toe-down)
      if (air) {
        const q = t * 12 + side * 1.6;
        let ax = side * 1.5 + (side > 0 ? 4.5 : -2.5) * ju + Math.sin(q) * 2.5 * jf, ay = 13 - (side > 0 ? 6 : 2.5) * ju + 1.5 * jf + Math.cos(q) * 1.2 * jf;
        br = (side > 0 ? 0.6 : 0.9) * ju - 0.35 * jf + Math.sin(q) * 0.18 * jf;
        if (fly) { ax = side * 2 - 2 + Math.sin(t * 22 + side) * 0.8; ay = 13.5; br = 0.5 + Math.sin(t * 22 + side * 2) * 0.12; }
        bx = hip[0] + ax - Math.sin(br) * AH; by = hip[1] + ay + Math.cos(br) * AH;
      }
      if (DRK && !air) {                                                              // tipsy feet: wandering high steps; standing, little shuffles to keep his balance
        const q = t * 2.3 + (side > 0 ? 0 : Math.PI * 0.8), idl = 1 - run;
        bx += Math.sin(ph * 0.5 + side * 1.3) * 3.2 * DRK * run + Math.sin(q) * 2.8 * DRK * idl + buckK * 3 * side;
        by -= Math.max(0, c1) * 3 * DRK * run + Math.max(0, Math.cos(q)) * 2.2 * DRK * idl;
        br += s1 * 0.22 * DRK * run + Math.sin(q) * 0.16 * DRK * idl;
      }
      bx += (squatX - bx) * sk; by *= 1 - sk; br *= 1 - sk;                          // crouched: the boots plant wide, out in front
      boot.setPosition(bx, by).setRotation(br).setScale(1 + 0.06 * dk, 1);
      const ank = [bx + Math.sin(br) * AH, by - Math.cos(br) * AH];
      const bow = side > 0 ? -1 : 1 - 2 * Math.min(1, run * 1.5 + air);              // the back knee bows out behind when he's standing, and comes forward to run
      this.bendLimb(leg, hip, this.limbJoint(hip, ank, 6.6, 6.6, bow), ank, 0, LIMB.legIK);
    }
    // CROUCHED: he sits right down on his heels. The legs fold away out of sight and both boots come out in FRONT of
    // the body, planted wide, toes poking out from under the belly (instead of bent legs jutting out sideways)
    const squat = dk > 0.4;
    this.legF.setVisible(!squat); this.legB.setVisible(!squat);
    if (squat !== this.squatOn) {
      this.squatOn = squat;
      if (squat) { this.root.moveAbove(this.bootB, this.torso); this.root.moveAbove(this.bootF, this.bootB); }
      else { this.root.moveBelow(this.bootB, this.legF); this.root.moveBelow(this.bootF, this.fFist); }
    }
    this.updateCloth(P, dt, grounded, fly);
    if (this.morph >= 0) {                                       // ~0.9s: the apron spins (faster and faster), then the cape unfurls
      this.morph = Math.min(1, this.morph + dt / 0.9);
      const m = this.morph, spinK = Math.min(1, m / 0.6), sx = Math.cos(spinK * spinK * Math.PI * 7);
      this.apron.setVisible(m < 0.6).setScale(sx, 1); this.apronB.setVisible(m < 0.6).setScale(sx, 1);
      const cp = Math.max(0, (m - 0.5) / 0.5);
      for (const c of this.capeS) c.setVisible(cp > 0).setScale(cp, 0.4 + 0.6 * cp);
      this.collar.setVisible(cp > 0).setScale(Math.min(1, cp * 2));
      if (m >= 1) { this.chef = false; this.morph = -1; for (const c of this.capeS) c.setScale(1); this.collar.setScale(1); }
    }
    const stretchY = air ? 1 + Math.max(-0.1, Math.min(0.12, P.vh / 2000)) : 1;
    this.torso.setScale(1 + 0.16 * Math.max(0, sq) - 0.08 * Math.max(0, -sq) + Math.sin(t * 2.6) * 0.012 * idle,
      stretchY - 0.18 * Math.max(0, sq) + 0.1 * Math.max(0, -sq) + Math.sin(t * 2.6 + 1) * 0.018 * idle);
    if (dk > 0) this.torso.setScale(this.torso.scaleX * (1 + 0.04 * dk), this.torso.scaleY * (1 - 0.05 * dk));   // only a hint of squash
    if (this.ouchT > 0.45) { const k = (this.ouchT - 0.45) / 0.25; this.torso.setScale(this.torso.scaleX * (1 + 0.14 * k), this.torso.scaleY * (1 - 0.12 * k)); }   // OUCH: a squashed impact frame

    // belly jiggle on every footfall

    // belly jiggle: a little spring driven by the waddle and by landings
    this.bo = this.bo || 0; this.bv = this.bv || 0;
    const drive = run * Math.sin(this.wp * 2) * 3;
    this.bv += (-this.bo * 170 - this.bv * 8 + drive * 55) * dt;
    this.bo = Math.max(-1.4, Math.min(1.4, this.bo + this.bv * dt));
    // (no belly wobble)

    // ---- chef-hat helmet lags behind
    const vyLag = Math.max(-7, Math.min(8, P.vh * 0.011));
    // (v2.59) the toque flops on a spring of its own: it lags when he runs, whips forward when he stops, bobs when he lands
    { const fc = P.facing < 0 ? -1 : 1, tgt = Math.max(-0.5, Math.min(0.5, -(P.vx || 0) * fc * 0.0016 - (P.vh || 0) * 0.0005));
      this.hatV += ((tgt - this.hatA) * 130 - this.hatV * 7) * dt; if (this.squash > 0.9) this.hatV += 5;
      this.hatA = Math.max(-0.7, Math.min(0.7, this.hatA + this.hatV * dt)); }
    this.hat.setPosition(3 - sw * 2.2 * run + this.hatA * 5, -54 + vyLag * 0.6 + Math.sin(t * 5) * 0.5);
    this.hat.setRotation(-0.09 - sw * (0.16 * run + 0.1 * wad) - P.vh * 0.0004 - 0.04 * Math.sin(t * 5) + this.hatA * 0.7);   // (it sits a bit crooked)
    this.hat.setScale(HAT_K * (1 + vyLag * -0.006), HAT_K * (1 + vyLag * 0.012 + Math.sin(t * 5.5) * 0.015));
    const jS = P.jamShake || 0, jB = P.jamBang || 0;            // a clogged gun: he shakes it furiously, then thumps it
    this.head.setPosition(2 + sw * 0.6 * run + Math.sin(t * 37) * 1.3 * jS, -44 + vyLag * 0.2 + (jB > 0.55 && jB < 0.8 ? 1.5 : 0)); this.crack.setPosition(this.head.x, this.head.y);
    if (jS) { this.hat.x += Math.sin(t * 37 - 0.9) * 2.2 * jS; this.hat.rotation += Math.sin(t * 37 - 0.9) * 0.1 * jS; }
    // ---- (v2.59) the face: what's he doing?
    this.ouchT = Math.max(0, this.ouchT - dt); this.grinT = Math.max(0, this.grinT - dt); this.blinkOn = Math.max(0, this.blinkOn - dt); this.twitch = Math.max(0, this.twitch - dt);
    if ((this.blinkT -= dt) <= 0) { this.blinkT = 1.8 + Math.random() * 3.2; this.blinkOn = 0.12; }
    if ((this.twitchT -= dt) <= 0) { this.twitchT = 2.5 + Math.random() * 4; this.twitch = 0.22; }
    const angry = this.ouchT > 0 || jS || jB || P.firing > 0 || (P.charge || 0) > 0 || P.grabbed;
    const fk = this.faceKey || (this.ouchT > 0 ? 'c_head_hurt' : this.detFace ? this.detFace : (jS || jB || P.firing > 0 || (P.charge || 0) > 0 || P.grabbed) ? 'c_head_fire' : (fly || hicK > 0.2) ? 'c_head_puff' : this.grinT > 0 ? 'c_head_grin' : this.blinkOn > 0 ? 'c_head_blink' : 'c_head');
    if (this.head.texture.key !== fk) this.head.setTexture(fk);
    this.head.setRotation(0.06 + (this.ouchT > 0.45 ? Math.sin(t * 60) * 0.12 : 0) + (Math.sin(t * 1.3 + 0.5) * 0.11 - dsw * 0.6) * DRK - hicK * 0.12 - dTip * 0.34 - dGlug * 0.04); this.head.y += -hicK * 1.5 + dGlug * 0.8;                                // the helmet sits a touch crooked; it rattles when he's hit
    const br = angry || this.detFace === 'c_head_det' ? 1 : 0, tw = this.twitch > 0 ? Math.sin(this.twitch * 40) * 0.22 : 0;
    this.tache.setVisible(!this.faceKey).setPosition(this.head.x, this.head.y + 6 + (fk === 'c_head_hurt' ? -1 : 0))
      .setRotation(0.06 + tw + Math.sin(t * 2.2) * 0.02 + (br ? Math.sin(t * 50) * 0.05 : 0)).setScale(1 + 0.16 * br + (fk === 'c_head_grin' ? 0.08 : 0), 1 + 0.3 * br);   // it bristles when he's riled
    const pk = this.ouchT > 0.45 && this.ouchHeavy && !this.faceKey ? (0.7 - this.ouchT) / 0.25 : -1;                  // a heavy hit: the eyes shoot out and snap back
    this.pop.setVisible(pk >= 0).setPosition(this.head.x + 3, this.head.y - 3).setScale(pk >= 0 ? 0.75 + 0.5 * Math.sin(Math.min(1, pk) * Math.PI) : 1);
    if (this.helm && this.armoured) { this.helm.setPosition(this.head.x, this.head.y).setRotation(this.head.rotation); this.arGlow.setAlpha(0.45 + 0.3 * Math.sin(t * 4)).setScale(1 + 0.15 * Math.sin(t * 4)); }   // BLACK RIND: the ring rides the helmet, the reactor pulses
    this.stars.forEach((st, i) => { const on = this.ouchT > 0; st.setVisible(on); if (on) { const a = t * 9 + i * 2.094; st.setPosition(this.torso.x + 2 + Math.cos(a) * 15, this.torso.y - 68 + Math.sin(a) * 4).setRotation(t * 6).setScale(Math.min(1, this.ouchT * 4)); } });

    // ---- arms
    this.armB.setRotation(-sw * 0.8 * run + 0.35 + Math.sin(t * 2.2) * 0.07 * idle - air * 1.2 + (P.grabbed ? Math.sin(t * 23 + 1) * 1.2 - 1 : 0));   // (and flapping the other arm)
    if (jB > 0) {                                               // the thump: fist up over his head, then down hard on the gun
      const up = jB < 0.5 ? jB / 0.5 : 0, dn = jB >= 0.5 ? Math.min(1, (jB - 0.5) / 0.12) : 0;
      this.armB.setRotation(jB < 0.5 ? 0.35 - 1.6 * (1 - (1 - up) * (1 - up)) : -1.25 + 1.45 * dn * dn);
      const fw = Math.min(1, jB * 5);                                                              // the shoulder comes round to the front, and the fist is cartoon-big
      this.armB.setPosition(-3 + 13 * fw, -22 - 5 * fw).setScale(1 + 0.45 * fw);
    }
    else if (this.armUp) this.armB.setPosition(-3, -22).setScale(1);
    if (jB > 0) {                                               // ...and the FIST itself, big and gloved, in front of everything
      if (!this.fist) {
        const sc = this.root.scene;
        if (!sc.textures.exists('c_fist')) pixSprite(sc, 'c_fist', 16, 15, a => {
          a.rrect(1, 2, 13, 13, 4, [0xffffff, 0xdfe6f0, 0xaab4c8]); a.rrect(9, 6, 15, 12, 2, [0xffffff, 0xdfe6f0, 0xaab4c8]);       // glove and thumb
          a.line([[4, 4], [4, 8]], 0xaab4c8, 1); a.line([[7, 4], [7, 8]], 0xaab4c8, 1); a.line([[10, 4], [10, 7]], 0xaab4c8, 1);       // knuckles
          a.rect(3, 0, 11, 2, 0xe0403a);                                                                                              // red cuff
        }, true);
        this.fist = sc.add.image(0, 0, 'c_fist'); this.root.add(this.fist);
      }
      const gx = this.gunArm.x + 13, gy = this.gunArm.y - 13, hit = jB >= 0.5 ? Math.min(1, (jB - 0.5) / 0.12) : 0, up2 = jB < 0.5 ? 1 - Math.pow(1 - jB / 0.5, 2) : 1;
      const fy = jB < 0.5 ? gy - 6 - 26 * up2 : gy - 32 + 32 * hit * hit, sq = hit >= 1 && jB < 0.72;
      this.fist.setVisible(true).setPosition(gx + 9 * up2 * (1 - hit), fy + (sq ? 2 : 0)).setRotation(jB < 0.5 ? -0.5 * up2 : -0.5 + 0.5 * hit).setScale(sq ? 1.6 : 1.3, sq ? 1.0 : 1.3);
    } else if (this.fist) this.fist.setVisible(false);
    { const open = (air && !fly && P.vh < -60 && jB <= 0) || (this.ouchT > 0.3 && jB <= 0) || !!P.grabbed, r = this.armB.rotation;     // falling / hit / grabbed: the free hand splays open
      this.handB.setVisible(!!open).setPosition(this.armB.x + Math.cos(r) * 13, this.armB.y + Math.sin(r) * 13).setRotation(r + Math.sin(t * 20) * 0.15); }
    if ((jB > 0) !== !!this.armUp) { this.armUp = jB > 0; if (this.armUp) this.torso.bringToTop(this.armB); else this.torso.moveTo(this.armB, 2); }   // (his far arm comes round in front to do it)
    if (P.firing > 0.09) this.recoil = 1;
    this.recoil = Math.max(0, this.recoil - dt * 9);
    const jk = P.jamKick || 0;                                  // a jammed gun bucks back and up
    this.gunArm.setPosition(this.torso.x + 4 - this.recoil * 4.5 - jk * 8 + (P.bashX || 0) + Math.sin(t * 43) * 1.6 * jS, this.torso.y - 23 + Math.cos(this.wp * 2 - 1) * 1.1 * run + Math.sin(t * 2.6 - 0.8) * 0.5 * idle + (P.bashY || 0) + Math.cos(t * 51) * 2.2 * jS + (jB > 0.6 && jB < 0.85 ? 3 : 0) + dOff * 11);
    const flail = P.grabbed ? Math.sin(this.t * 26) * 1.1 + Math.sin(this.t * 41) * 0.35 - 0.6 : 0;      // grabbed: waving the useless gun about hysterically
    this.gunArm.setRotation(-this.recoil * 0.1 + Math.sin(t * 2.6) * 0.02 * idle - Math.sin(this.wp * 2 - 1) * 0.035 * run - jk * 0.42 + Math.sin(t * 43) * 0.26 * jS + (jB > 0.6 && jB < 0.85 ? 0.3 : 0) + sw * 0.03 * run + this.torso.rotation * 0.4 + dsw * 0.6 + Math.sin(t * 3.1 + 1) * 0.03 * DRK + dOff * 0.6 - (P.aimA || 0) + (P.bashA || 0) + flail);   // + melee swing
    this.gunArm.setScale(1 + this.recoil * 0.16, 1 - this.recoil * 0.07);                            // (v2.59) a smear: the arm stretches along the kick
    this.grip.setVisible(!(P.bashSpin || 0));
    this.gunPivot.setRotation(P.bashSpin || 0);                                                     // melee: the gun flips round, butt first   // twin-stick aim tilts the gun
    if (this.tipSpins !== false) this.auger.setTexture('auger' + augerFrame);
    this.tanks.setPosition(this.torso.x - 16, this.torso.y - 24);
    this.updateGunFx(P, dt, sq, run);
    this.updateArms(P, jB, dt, sw, run, air, sq);

    this.setPowered(P.power > 0);
    this.root.setPosition(x, y).setScale(z * RIG_SCALE * (P.facing < 0 ? -1 : 1), z * RIG_SCALE).setAlpha(alpha);   // (no whole-body squash: the crouch is in the legs)
  }
}
