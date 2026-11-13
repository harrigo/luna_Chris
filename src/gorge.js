// L6: CHEDDAR GORGE (v2.61). A tiny cheddar planetoid, a canyon all the way round it, and THE GREAT PEPPER JACK rolling
// after Chris for the whole level.
//
//   THE WHEEL IS THE LEVEL   three laps = three layers of rind. Shoot it and it STAGGERS: enough hits and it reels back,
//                            dizzy, and great shards of rind fly off it over Chris's head and stick in the ground AHEAD of
//                            him as razor tortilla chips. So the wheel makes its own obstacle course, different every lap,
//                            and you see every chip coming.
//   STUMBLE, DON'T STALL     clip a chip and it shatters: Chris trips (a beat of lost speed), no damage. The wheel eases off a
//                            touch when it's right on top of him and puts its foot down when he's far ahead.
//   SALSA SNAPPERS           the pits are full of salsa, and some have a Snapper in them: the salsa boils, then it leaps
//                            straight up, jaws first. Jet over high, wait for it, or shoot it out of the air.
//   CHIP BANDITOS            rats in sombreros and ponchos (ground).   PEPPER WASPS   bloated jalapeno wasps that drip hot sauce.
//   JALAPENO                 one floats ahead of you every so often: grab it for the afterburner.
//
// Textures: the wheel (three rinds, four faces, the core), the mini wheels, the chips, the new rats and wasps, the
// snapper, and the canyon furniture (arches, chip spires, chili cacti).

function makeGorgeTextures(scene, toonRat) {
  if (scene.game.__gorgeTex) return; scene.game.__gorgeTex = true;          // (once: sprites already hold these textures)
  const RIND = [0xffc860, 0xf09a2a, 0xa85a10], PASTE = [0xfff0a0, 0xffd060, 0xd89a2a], INK = 0x1a0a04;
  const RED = [0xff7a5a, 0xd8301a, 0x8a1408], GRN = [0x9ae060, 0x3a9a2a, 0x1a5a14];
  // ---- THE GREAT PEPPER JACK: the wheel (it spins; the face is an upright overlay). Three rinds: whole, cracked, in ruins.
  const rind = (key, stage) => pixSprite(scene, key, 120, 120, p => {
    const r = rng(61), notch = [];
    for (let k = 0; k < [0, 3, 6][stage]; k++) notch.push({ a: (k * 2.4 + 0.7) % 6.283, w: 0.16 + (k % 3) * 0.05, d: 7 + (k % 2) * 5 });
    const rad = (a, base) => { let rr = base; for (const n of notch) { let d = Math.abs(((a - n.a + 9.42) % 6.283) - 3.1416); if (d < n.w) rr = Math.min(rr, base - n.d * (1 - d / n.w)); } return rr; };
    const ring = base => { const pts = []; for (let k = 0; k < 90; k++) { const a = k / 90 * 6.283; pts.push([60 + Math.cos(a) * rad(a, base), 60 + Math.sin(a) * rad(a, base)]); } return pts; };
    p.poly(ring(58), RIND); p.poly(ring(51), stage === 2 ? [0xffe890, 0xf8b848, 0xc8801e] : PASTE);
    for (let k = 0; k < 22; k++) { const a = r() * 6.28, d = Math.sqrt(r()) * 42, x = 60 + Math.cos(a) * d, y = 60 + Math.sin(a) * d, rr = 2 + r() * 4.5; p.ell(x, y, rr, rr * 0.85, [0xd89030, 0xb86a14, 0x8a4a0c]); p.px(x - 1, y - 1, 0xffe8a0); }   // pocks
    for (let k = 0; k < 26; k++) { const a = r() * 6.28, d = r() * 44; let x = 60 + Math.cos(a) * d, y = 60 + Math.sin(a) * d;           // fat flecks of pepper
      x = Math.round(x); y = Math.round(y);
      if (k % 3) { p.rect(x, y, x + 2 + (k % 2), y + 2, RED[1]); p.rect(x, y, x + 1, y, RED[0]); p.px(x + 2, y + 2, RED[2]); } else { p.rect(x, y, x + 3, y + 1, GRN[1]); p.px(x, y, GRN[0]); p.px(x + 3, y + 1, GRN[2]); } }
    for (let k = 0; k < 20; k++) { const a = k / 20 * 6.28; p.line([[60 + Math.cos(a) * 52, 60 + Math.sin(a) * 52], [60 + Math.cos(a) * rad(a, 57), 60 + Math.sin(a) * rad(a, 57)]], 0xa85a10); }   // rind ridges (show the roll)
    for (let k = 0; k < 7; k++) { const a = k * 0.9 + 0.3; p.px(60 + Math.cos(a) * 55, 60 + Math.sin(a) * 55, 0xffe8a0); }                 // waxy glints
    if (stage >= 1) for (const n of notch) {                                                                                              // cracks running in from every bite
      let x = 60 + Math.cos(n.a) * (51 - n.d), y = 60 + Math.sin(n.a) * (51 - n.d); const pts = [[x, y]];
      for (let s = 0; s < 4 + stage * 2; s++) { const aa = n.a + Math.PI + (r() - 0.5) * 1.3; x += Math.cos(aa) * 6; y += Math.sin(aa) * 6; pts.push([x, y]); }
      p.line(pts, 0x6a2a08, 2); p.line(pts.slice(0, 3), INK, 1);
    }
    if (stage === 2) for (const [x, y, rr] of [[38, 44, 7], [80, 72, 9], [52, 86, 6], [84, 38, 5]]) { p.ell(x, y, rr, rr * 0.8, [0xfff0b0, 0xff9a3a, 0xd04a10]); p.px(x - 2, y - 2, 0xffffff); }   // the molten core showing through
  });
  rind('jack_rind', 0); rind('jack_rind1', 1); rind('jack_rind2', 2);
  // the faces (76 x 52): mismatched bloodshot eyes, brows like girders, a mouthful of yellow tombstones, drool
  const eye = (p, x, y, rx, ry, px, py, shot) => {
    p.ell(x, y, rx + 1.2, ry + 1.2, INK); p.ell(x, y, rx, ry, [0xffffff, 0xfff0e0, 0xd8c0b0]);
    if (shot) for (const [dx, dy] of [[-rx + 1, -1], [rx - 2, 2], [-2, ry - 2], [2, -ry + 1], [-rx + 2, 3]]) p.px(x + dx, y + dy, 0xe0301a);
    p.ell(x + px, y + py, 2.6, 3, INK); p.px(x + px - 1, y + py - 1, 0xffffff);
  };
  const teeth = (p, x0, y0, x1, y1, gap) => {
    p.rrect(x0 - 2, y0 - 2, x1 + 2, y1 + 2, 4, [0x8a1a1a, 0x5a0a0a, 0x2a0404]);
    const mid = Math.floor((y0 + y1) / 2);
    for (let x = x0, k = 0; x < x1 - 3; x += 6, k++) { const c = k % 4 === 2 ? 0xf0e090 : 0xfffbe8, h = k % 3 === 1 ? 1 : 0;
      p.rect(x, y0, x + 4, mid - gap + h, c); p.rect(x + (k % 2), mid + gap + 2, x + 4, y1, k % 5 === 3 ? 0xe8d070 : 0xfffbe8); p.px(x + 4, y0 + 1, 0xb8a888); }
    p.line([[x0, mid + 1], [x1, mid + 1]], 0x8a7a6a);
    p.px(x0 + 8, y1 + 2, 0x9ae8ff); p.px(x0 + 8, y1 + 4, 0x5ac8f0); p.px(x1 - 6, y1 + 3, 0x9ae8ff);                                       // drool
  };
  const warts = p => { for (const [x, y] of [[6, 30], [70, 26], [34, 4], [10, 44], [66, 46]]) { p.ell(x, y, 2, 1.6, RED); p.px(x - 1, y - 1, 0xffb0a0); } };
  pixSprite(scene, 'jack_face', 76, 52, p => {                                                       // RAGE (teeth clenched)
    warts(p); p.line([[2, 4], [32, 17]], INK, 5); p.line([[74, 5], [44, 17]], INK, 5); p.line([[4, 3], [30, 14]], 0x5a2a0a, 1);
    eye(p, 21, 21, 9, 7.5, 3, 1, true); eye(p, 55, 20, 11, 9, -3, 1, true);
    p.line([[30, 27], [34, 30]], 0xc87a1a, 2); p.line([[46, 27], [42, 30]], 0xc87a1a, 2);                                                  // a wrinkled snarl
    teeth(p, 13, 34, 63, 47, 0);
  });
  pixSprite(scene, 'jack_face_b', 76, 52, p => {                                                     // RAGE (roaring: teeth apart, tongue)
    warts(p); p.line([[2, 6], [32, 16]], INK, 5); p.line([[74, 3], [44, 16]], INK, 5);
    eye(p, 21, 21, 9.5, 8, 3, 2, true); eye(p, 55, 20, 11, 9.5, -3, 2, true);
    teeth(p, 13, 32, 63, 49, 3); p.ell(38, 42, 9, 3, [0xff8a9a, 0xd04a5a, 0x8a1a2a]); p.line([[38, 40], [38, 44]], 0x8a1a2a);
    p.px(8, 26, 0x9ae8ff); p.px(7, 28, 0x5ac8f0); p.px(68, 12, 0x9ae8ff);                                                                    // spit
  });
  pixSprite(scene, 'jack_dizzy', 76, 52, p => {                                                      // STUNNED: spiral eyes, tongue lolling
    warts(p); p.line([[6, 12], [32, 9]], INK, 4); p.line([[70, 9], [44, 12]], INK, 4);
    for (const [cx, cy, rr] of [[21, 22, 9], [55, 21, 10.5]]) { p.ell(cx, cy, rr + 1.2, rr, INK); p.ell(cx, cy, rr, rr - 1.2, 0xffffff);
      const sp = []; for (let k = 0; k < 16; k++) { const a = k * 0.8, d = k * rr / 17; sp.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.85]); } p.line(sp, INK, 1); }
    p.rrect(18, 36, 58, 46, 4, [0x8a1a1a, 0x5a0a0a, 0x2a0404]); for (let x = 21; x < 55; x += 7) p.rect(x, 36, x + 4, 39, 0xfffbe8);
    p.poly([[40, 42], [54, 42], [55, 51], [47, 52], [41, 49]], [0xff9aa8, 0xd04a5a, 0x8a1a2a]); p.line([[47, 43], [48, 50]], 0x8a1a2a);
    for (const [x, y] of [[8, 4], [66, 2], [38, 0]]) { p.px(x, y, 0xffe27a); p.px(x + 1, y + 1, 0xffffff); p.px(x - 1, y + 1, 0xffe27a); p.px(x, y + 2, 0xffe27a); }   // stars
  });
  pixSprite(scene, 'jack_hurt', 76, 52, p => {                                                       // OW: eyes on stalks, mouth a great O
    warts(p); p.line([[4, 12], [30, 5]], INK, 4); p.line([[72, 12], [46, 4]], INK, 4);
    eye(p, 20, 20, 10.5, 9.5, -2, -1, true); eye(p, 56, 19, 12.5, 11, 3, -2, true);
    p.ell(38, 41, 13, 9.5, INK); p.ell(38, 41, 11, 8, [0x8a1a1a, 0x5a0a0a, 0x2a0404]); p.rect(30, 34, 46, 36, 0xfffbe8); p.px(34, 37, 0xf0e090); p.ell(38, 46, 6, 2.5, [0xff8a9a, 0xd04a5a, 0x8a1a2a]);
    p.px(6, 28, 0x9ae8ff); p.px(5, 30, 0x5ac8f0); p.px(70, 30, 0x9ae8ff); p.px(71, 32, 0x5ac8f0);
  });
  pixSprite(scene, 'jack_core', 70, 60, p => {                                                       // rind torn open: molten goo round ONE huge veined eye (the target)
    p.ell(35, 30, 33, 28, [0xffd890, 0xff9a3a, 0xc84a10]);
    for (const [x, y, l] of [[8, 20, 9], [60, 26, 11], [16, 46, 12], [54, 48, 10], [30, 54, 6], [44, 55, 5]]) { p.poly([[x - 4, y], [x + 4, y], [x + 1, y + l], [x - 1, y + l]], [0xffd890, 0xff9a3a, 0xc84a10]); p.ell(x, y + l, 2, 2, [0xffd890, 0xff9a3a, 0xc84a10]); }   // strings and drips
    for (const [x, y] of [[12, 12], [56, 10], [20, 6], [50, 52]]) { p.rect(x, y, x + 2, y + 1, RED[1]); p.px(x, y, RED[0]); }
    p.ell(35, 28, 17.5, 16.5, INK); p.ell(35, 28, 16, 15, [0xffffff, 0xfff0e0, 0xe0c0b0]);
    for (let k = 0; k < 9; k++) { const a = k / 9 * 6.28 + 0.3, pts = [[35 + Math.cos(a) * 15, 28 + Math.sin(a) * 14], [35 + Math.cos(a + 0.2) * 11, 28 + Math.sin(a + 0.2) * 10.5], [35 + Math.cos(a - 0.1) * 8, 28 + Math.sin(a - 0.1) * 8]]; p.line(pts, 0xe0301a, 1); }   // veins
    p.ell(35, 28, 9, 9, [0xffc23a, 0xe0701a, 0x8a2a08]); p.ell(35, 28, 4, 5.5, INK); p.px(31, 23, 0xffffff); p.px(32, 23, 0xffffff); p.px(31, 24, 0xffffff);
    p.poly([[18, 13], [35, 9], [52, 13], [46, 15], [35, 12], [24, 15]], [0xffb050, 0xe07a1a, 0xa04a0c]);                                    // a heavy molten lid
  });
  // the pups: little wheels with bug eyes and buck teeth (two frames: the eyes roll)
  const pup = (key, f) => pixSprite(scene, key, 30, 30, p => {
    p.ell(15, 15, 14, 14, RIND); p.ell(15, 15, 11, 11, PASTE);
    for (const [x, y, c] of [[7, 21, RED[1]], [22, 22, GRN[1]], [15, 6, RED[1]], [24, 9, GRN[1]]]) p.px(x, y, c);
    p.line([[5, 7], [13, 10]], INK, 2); p.line([[25, 7], [17, 10]], INK, 2);
    for (const [x, rr] of [[10, 3.4], [20, 4.2]]) { p.ell(x, 13, rr + 0.8, rr + 0.8, INK); p.ell(x, 13, rr, rr, 0xffffff); p.px(x + (f ? -1 : 1), 13 + (f ? 1 : 0), INK); p.px(x + (f ? -1 : 1), 14 + (f ? 1 : 0), INK); p.px(x - 2, 11, 0xe0301a); }
    p.rect(9, 19, 21, 23, 0x5a0a0a); p.rect(11, 19, 14, 22 + f, 0xfffbe8); p.rect(16, 19, 19, 21, 0xf0e090); p.px(22, 24, 0x9ae8ff);
  });
  pup('miniwheel', 0); pup('miniwheel_b', 1);
  // a razor tortilla chip, standing in the ground: blistered, salted, a blob of salsa sliding down it
  pixSprite(scene, 'nacho', 34, 50, p => {
    p.poly([[17, 0], [33, 49], [1, 49]], [0xffe08a, 0xf0b040, 0xb07818]);
    p.poly([[17, 0], [22, 49], [13, 49]], [0xfff0b0, 0xffd060, 0xd09a30]);
    p.line([[17, 1], [32, 48]], 0xfff6c8); p.line([[16, 2], [2, 48]], 0x8a5a10);                                                           // the keen edge, the shadowed one
    for (const [x, y, rr] of [[12, 30, 2.2], [22, 37, 2.6], [16, 43, 1.8], [19, 20, 1.6], [9, 44, 1.6], [26, 45, 1.8]]) { p.ell(x, y, rr, rr * 0.8, [0xffe8a0, 0xd89a30, 0xa86a10]); p.px(x - 1, y - 1, 0xfff6c8); }   // blisters
    for (const [x, y] of [[14, 14], [20, 28], [10, 38], [24, 41], [17, 34], [15, 24]]) p.px(x, y, 0xffffff);                              // salt
    p.poly([[14, 6], [20, 6], [22, 12], [19, 17], [15, 15], [12, 11]], RED); p.line([[18, 17], [18, 23]], RED[1], 2); p.ell(18, 24, 1.6, 1.8, RED); p.px(15, 8, 0xffb0a0); p.px(17, 11, GRN[0]);   // salsa
    p.line([[8, 40], [13, 47]], 0x8a5a10);                                                                                                 // a crack
  });
  pixSprite(scene, 'rindshard', 26, 26, p => {                                                       // a great shard of rind, flung off the wheel
    p.poly([[3, 20], [10, 3], [23, 8], [20, 22], [10, 24]], RIND); p.poly([[8, 18], [12, 8], [19, 11], [17, 19]], PASTE);
    p.px(13, 13, RED[1]); p.px(15, 16, GRN[1]); p.line([[10, 3], [23, 8]], 0xffe8a0);
  });
  pixSprite(scene, 'salsablob', 9, 9, p => { p.ell(4.5, 4.5, 4, 4, RED); p.px(3, 3, 0xffb0a0); p.px(5, 5, GRN[0]); }, 0);
  // ---- SALSA SNAPPER: a chilli with fins and far too many teeth (jaws shut / jaws wide). It points UP: it leaps head first.
  const snapper = (key, open) => pixSprite(scene, key, 30, 44, p => {
    p.poly([[10, 41], [15, 34], [20, 41], [17, 43], [15, 39], [13, 43]], GRN);                                                              // a stalk for a tail
    p.poly([[6, 26], [1, 31], [7, 32]], RED); p.poly([[24, 26], [29, 31], [23, 32]], RED);                                                  // fins
    p.ell(15, 24, 9, 13, RED); p.ell(12, 22, 3.5, 8, [0xffa08a, 0xff7a5a, 0xd8301a]);                                                       // the body, a waxy shine down it
    for (const [x, y] of [[19, 28], [17, 33], [21, 22]]) p.px(x, y, 0x8a1408);
    const jy = open ? 2 : 7;
    p.poly([[5, 16], [7, jy], [15, jy - 2 + (open ? 0 : 1)], [23, jy], [25, 16], [15, 19]], RED);                                           // the upper jaw
    if (open) { p.poly([[8, 15], [9, 5], [15, 3], [21, 5], [22, 15], [15, 17]], [0x8a1a1a, 0x5a0a0a, 0x2a0404]); p.ell(15, 13, 3.5, 3, [0xff9aa8, 0xd04a5a, 0x8a1a2a]);
      for (const [x, l] of [[9, 4], [12, 5], [15, 4], [18, 5], [21, 4]]) p.poly([[x - 1.5, 5], [x + 1.5, 5], [x, 5 + l]], [0xfffbe8, 0xf0e8c8, 0xc8b890]);
      for (const [x, l] of [[10, 3], [13, 4], [17, 4], [20, 3]]) p.poly([[x - 1.5, 16], [x + 1.5, 16], [x, 16 - l]], [0xfffbe8, 0xf0e8c8, 0xc8b890]); }
    else for (const [x, l] of [[8, 4], [11, 5], [14, 4], [17, 5], [20, 4], [23, 3]]) p.poly([[x - 1.5, 12], [x + 1.5, 12], [x, 12 + l]], [0xfffbe8, 0xf0e8c8, 0xc8b890]);   // an underbite of needles
    for (const [x, rr] of [[8, 3.2], [22, 4]]) { const y = open ? 18 : 17; p.ell(x, y, rr + 0.9, rr + 0.9, INK); p.ell(x, y, rr, rr, 0xffffff); p.px(x, y - 1, INK); p.px(x, y, INK); p.px(x - 2, y + 1, 0xe0301a); p.px(x + 1, y - 2, 0xe0301a); }   // eyes out on the sides of its head
  });
  snapper('snapper', false); snapper('snapper_b', true);
  // ---- CHIP BANDITO: the same wretched space-rat in a battered sombrero and a striped poncho, a bandolier of chillies
  if (toonRat) [{ f: 0 }, { f: 1, drool: true }, { f: 0, blink: true, tail: 2 }, { f: 1, look: 0.4 }].forEach((o, i) =>
    pixSprite(scene, 'chiprat' + ['', '_b', '_c', '_d'][i], 52, 38, a => {
      const ox = 4, oy = 8, STRAW = [0xffe8a0, 0xe0b050, 0xa07020];
      toonRat(a, ox, oy, Object.assign({ shell: false }, o));
      // the poncho: a striped blanket slung over his back
      a.poly([[ox + 7, oy + 12], [ox + 25, oy + 11], [ox + 27, oy + 19], [ox + 22, oy + 23], [ox + 9, oy + 22], [ox + 5, oy + 18]], [0xf06a4a, 0xc8402a, 0x7a1a10]);
      for (const y of [14, 17, 20]) a.line([[ox + 7, oy + y], [ox + 26, oy + y - 1]], y === 17 ? 0xffd23f : 0x2a8a80);
      for (const x of [9, 13, 17, 21]) a.px(ox + x, oy + 23, 0xffd23f);                                                                     // tassels
      a.line([[ox + 10, oy + 12], [ox + 24, oy + 21]], 0x5a3418, 2); for (const [x, y] of [[13, 14], [17, 17], [21, 19]]) { a.px(ox + x, oy + y, RED[1]); a.px(ox + x, oy + y - 1, GRN[1]); }   // bandolier
      // the sombrero: a great floppy brim, a dented crown, a red band; it rides up when he runs
      const hy = oy + 1 - (i % 2);
      a.ell(ox + 30, hy + 3, 15, 3.6, STRAW); a.ell(ox + 30, hy + 2, 12, 2, [0xfff6c8, 0xffe8a0, 0xe0b050]);
      a.poly([[ox + 23, hy + 2], [ox + 25, hy - 6], [ox + 30, hy - 8], [ox + 35, hy - 6], [ox + 37, hy + 2]], STRAW); a.rect(ox + 24, hy - 1, ox + 36, hy, RED[1]); a.px(ox + 28, hy - 6, 0xfff6c8);
      for (const x of [17, 22, 38, 43]) a.px(ox + x, hy + 6, RED[1]);                                                                       // bobbles
      a.line([[ox + 44, hy + 4], [ox + 46, hy + 7]], STRAW[2]); a.px(ox + 20, hy + 5, 0xa07020);                                           // frayed
    }));
  // ---- PEPPER WASP: a bloated jalapeno with a rat's idea of a face, a stinger dripping hot sauce, wings a blur
  [0, 1].forEach(f => pixSprite(scene, 'pepwasp' + (f ? '_b' : ''), 40, 34, a => {
    const WG = [0xf4fbff, 0xbfe4ff, 0x7ab0e0];
    if (f) { a.poly([[14, 12], [4, 2], [18, 4]], WG); a.poly([[22, 11], [20, 0], [30, 4]], WG); } else { a.poly([[14, 12], [0, 10], [12, 5]], WG); a.poly([[22, 11], [30, 0], [34, 8]], WG); }
    a.line([[5, 22], [1, 26]], INK, 2); a.px(0, 28, 0xff5a1a); a.px(0, 30 + f, 0xffb52a);                                                   // the stinger, dripping
    a.ell(16, 19, 12, 8.5, GRN); a.ell(13, 16, 7, 3, [0xc8f09a, 0x9ae060, 0x3a9a2a]);                                                       // a fat waxy body
    for (const x of [9, 14, 19]) a.line([[x, 13], [x - 1, 26]], 0x1a5a14);                                                                  // seams
    a.poly([[25, 13], [30, 11], [33, 13], [31, 16]], [0x7a5a2a, 0x5a3a14, 0x3a2408]);                                                       // the stalk, bent over like a quiff
    a.ell(28, 21, 6.5, 6, [0xb0e878, 0x4aa832, 0x1a5a14]);                                                                                  // the head end
    for (const [x, y, rr] of [[26, 18, 3.2], [32, 19, 2.4]]) { a.ell(x, y, rr + 0.8, rr + 0.8, INK); a.ell(x, y, rr, rr, 0xffffff); a.px(x + 1, y + (f ? 1 : 0), INK); a.px(x - 1, y - 2, 0xe0301a); }
    a.line([[22, 14], [29, 16]], INK, 2);                                                                                                   // one furious brow
    a.rect(26, 24, 33, 26, 0x5a0a0a); for (const x of [27, 29, 31]) a.px(x, 24 + ((x + f) % 2), 0xfffbe8); a.px(33, 27, 0x9ae8ff);           // little needle teeth, drool
    for (const [x, y] of [[8, 22], [18, 24], [12, 14]]) a.px(x, y, 0xc8f09a);
    for (const [x, y] of [[12, 27], [17, 28], [22, 27]]) a.line([[x, y], [x - 1 + f, y + 4]], INK);                                         // dangly legs
  }));
  // ---- canyon furniture (background props)
  pixSprite(scene, 'gorge_arch', 120, 84, p => {                                                     // a cheddar rock arch, banded like the canyon walls
    const ST = [[0xffd070, 0xf0a030, 0xb86a14], [0xf0a030, 0xd07a1a, 0x8a4a0c], [0xffe090, 0xf8b848, 0xc8801e]];
    const sil = x => { const u = x / 119; return 84 - (18 + 58 * Math.pow(Math.sin(u * Math.PI), 0.6) + 5 * Math.sin(u * 23)); };
    for (let x = 2; x < 118; x++) for (let y = Math.round(sil(x)); y < 84; y++) {
      const hx = (x - 60) / 30, hy = (y - 84) / 44; if (hx * hx + hy * hy < 1) continue;                                                     // the hole through it
      const band = Math.floor((y + Math.sin(x * 0.12) * 3) / 9) % 3, edge = y - sil(x) < 2 ? 0 : (x < 16 || x > 104 || (hx * hx + hy * hy < 1.25 && hx > 0) ? 2 : 1);
      p.px(x, y, ST[band][edge]);
    }
    for (const [x, y] of [[20, 50], [98, 44], [60, 20], [36, 30], [86, 28]]) { p.ell(x, y, 3, 2.4, [0xc8801e, 0xa86a10, 0x7a4a08]); p.px(x - 1, y - 1, 0xffe8a0); }   // cheese holes
    p.poly([[52, 12], [57, 0], [62, 12]], [0xffe08a, 0xf0b040, 0xb07818]); p.poly([[70, 16], [76, 6], [79, 17]], [0xffe08a, 0xf0b040, 0xb07818]);   // chips growing on top
  });
  pixSprite(scene, 'chip_spire', 56, 80, p => {                                                      // a stack of giant tortilla chips, a puddle of salsa
    const CH = [0xffe08a, 0xf0b040, 0xb07818];
    p.poly([[4, 79], [16, 22], [30, 79]], CH); p.poly([[22, 79], [36, 2], [52, 79]], CH); p.poly([[36, 2], [40, 79], [33, 79]], [0xfff0b0, 0xffd060, 0xd09a30]);
    p.poly([[30, 79], [46, 40], [55, 79]], [0xf0b040, 0xd08a20, 0x8a5a10]);
    for (const [x, y] of [[14, 50], [36, 30], [40, 56], [46, 62], [20, 66], [34, 70]]) { p.ell(x, y, 2, 1.6, [0xffe8a0, 0xd89a30, 0xa86a10]); p.px(x, y - 1, 0xffffff); }
    p.poly([[32, 8], [40, 8], [42, 18], [36, 24], [33, 16]], RED); p.line([[37, 24], [37, 34]], RED[1], 2);
    p.ell(26, 78, 20, 2.5, RED);
  });
  pixSprite(scene, 'chili_cactus', 30, 46, p => {                                                    // a jalapeno cactus, red chillies for flowers
    p.rrect(11, 6, 19, 45, 4, GRN); p.rrect(2, 18, 8, 30, 3, GRN); p.rect(6, 26, 12, 30, GRN[1]); p.rrect(22, 12, 28, 26, 3, GRN); p.rect(18, 22, 24, 26, GRN[1]);
    for (const [x, y] of [[13, 12], [17, 20], [13, 28], [17, 36], [4, 22], [25, 16]]) p.px(x, y, 0xe8ffc0);                                 // spines
    for (const [x, y] of [[15, 3], [5, 15], [25, 9]]) { p.poly([[x - 2, y], [x + 2, y], [x + 1, y + 5], [x - 1, y + 4]], RED); p.px(x, y - 1, GRN[0]); }
  });
}

const GorgeMixin = {
  gorgeInit() {
    const pits = (this.craters || []).filter(c => c.kind === 'pit');
    const G = this.gz = { shards: [], snaps: [], jalT: 9, stage: 0 };
    pits.forEach((pit, i) => {                                             // a Snapper in every other pit
      if (i % 2) return;
      const spr = this.add.image(0, 0, 'snapper').setOrigin(0.5, 0.5).setDepth(5.4).setVisible(false); spr.bsx = spr.bsy = 1.25;
      G.snaps.push({ pit, st: 'lurk', cd: rnd(1, 2.5), theta: pit.theta, h: -50, vh: 0, vt: 0, spr, dead: 0 });
    });
  },
  // rind shards arc off the wheel, over Chris, and stick in the ground AHEAD of him as tortilla chips
  gorgeFling(C, n) {
    const P = this.pl, away = Math.sign(angDiff(P.theta, C.theta)) || 1;
    for (let k = 0; k < n; k++) {
      const target = wrap(P.theta + away * rnd(170, 250) / R + away * k * rnd(110, 160) / R), T = 1.25 + k * 0.25, h0 = C.r * 1.7, vh0 = 430;
      const spr = this.add.image(0, 0, 'rindshard').setDepth(8.1); spr.bsx = spr.bsy = 1.3;
      this.gz.shards.push({ theta: C.theta, h: h0, vt: angDiff(target, C.theta) * R / T, vh: vh0, g: 2 * (h0 + vh0 * T) / (T * T), spr, rot: 0, rv: rnd(-9, 9) });
    }
    this.burst(C.theta, C.r * 1.5, 'crumb', 16, 1.4); Sound.sfx('crash');
  },
  gorgeUpdate(dt, bossUp) {
    const G = this.gz, P = this.pl; if (!G) return;
    // the rind: a new layer cracks away with every lap
    const st = Math.max(0, Math.min(2, this.waveIdx || 0));
    if (st !== G.stage && this.chaser) { G.stage = st; const C = this.chaser; C.spr.setTexture('jack_rind' + (st || '')); C.hurtT = 0.6;
      this.burst(C.theta, C.r, 'crumb', 34, 1.8); this.cameras.main.shake(260, 0.01); Sound.sfx('crash'); this.banner(st === 1 ? 'THE RIND IS CRACKING!' : 'THE RIND IS FALLING APART!'); this.gorgeFling(C, 3); }
    for (let i = G.shards.length - 1; i >= 0; i--) {
      const S = G.shards[i]; S.vh -= S.g * dt; S.h += S.vh * dt; S.theta = wrap(S.theta + S.vt / R * dt); S.rot += S.rv * dt;
      if (Math.random() < dt * 14) this.burst(S.theta, S.h, 'crumb', 1, 0.3);
      if (S.h > 0) continue;
      const inPit = (this.craters || []).some(c => c.kind === 'pit' && Math.abs(angDiff(S.theta, c.theta)) < c.half);
      const near = this.chips.some(c => c.alive && Math.abs(angDiff(S.theta, c.theta)) * R < 44), full = this.chips.filter(c => c.alive).length >= 8;
      this.cameras.main.shake(70, 0.004); Sound.sfx('clunk');
      if (inPit) this.gorgeSplash(S.theta, 8);
      else if (near || full) this.burst(S.theta, 8, 'crumb', 10, 1);
      else { const spr = this.add.image(0, 0, 'nacho').setOrigin(0.5, 1).setDepth(5.2); spr.bsx = spr.bsy = 1.3; spr.hsq = 1; this.chips.push({ theta: S.theta, hp: 3, alive: true, regrow: 0, spr, flash: 0 }); this.burst(S.theta, 6, 'crumb', 8, 0.9); }
      if (Math.abs(angDiff(P.theta, S.theta)) * R < 22 && P.h < 46 && P.invuln <= 0 && this.state === 'play') this.hurt();
      S.spr.destroy(); G.shards.splice(i, 1);
    }
    // a jalapeno floats ahead of him every so often (the afterburner: flames stall the wheel)
    if (!bossUp && this.state === 'play' && (G.jalT -= dt) <= 0) {
      G.jalT = rnd(15, 21);
      if (!this.buffOn('jalapeno') && !this.pickups.some(p => p.kind === 'buff') && this.chaser) {
        const B = BUFFS.jalapeno, away = Math.sign(angDiff(P.theta, this.chaser.theta)) || 1;
        this.pickups.push({ kind: 'buff', bk: 'jalapeno', theta: wrap(P.theta + away * 330 / R), h: 150, vh: 0, life: 12, spr: (() => { const im = this.add.image(0, 0, B.tex).setDepth(6); bakedGlow(im, B.col, 3, 8); return im; })() });
      }
    }
    // SALSA SNAPPERS
    for (const S of G.snaps) {
      if (S.dead > 0) { S.dead -= dt; continue; }
      const dx = angDiff(P.theta, S.pit.theta) * R;
      if (S.st === 'lurk') {
        S.theta = S.pit.theta; S.h = -50; S.spr.setVisible(false);
        if (Math.abs(dx) < 230 && this.state === 'play') S.cd -= dt;
        if (S.cd < 0.55 && Math.random() < dt * 26) this.gorgeSplash(wrap(S.pit.theta + rnd(-1, 1) * S.pit.half * 0.6), 1);   // the salsa boils: here it comes
        if (S.cd <= 0) { S.st = 'leap'; S.vh = 560 + Math.max(0, Math.min(180, P.h * 0.9)); S.vt = Math.max(-70, Math.min(70, dx * 0.5)); S.h = -30; S.spr.setVisible(true); this.gorgeSplash(S.theta, 12); Sound.sfx('splat'); }
      } else {
        S.vh -= 1000 * dt; S.h += S.vh * dt; S.theta = wrap(S.theta + S.vt / R * dt);
        S.spr.setTexture(S.vh > -80 ? 'snapper_b' : 'snapper');
        if (Math.random() < dt * 12) this.burst(S.theta, S.h - 14, 'salsablob', 1, 0.3);
        if (S.h > -10 && P.invuln <= 0 && this.state === 'play' && dist2(P.theta, P.h + 22, S.theta, S.h) < 26 * 26) { this.hurt(); S.vh = Math.min(S.vh, 60); }
        if (S.h < -44 && S.vh < 0) { S.st = 'lurk'; S.cd = rnd(1.8, 3.2); this.gorgeSplash(S.pit.theta, 8); }
      }
    }
  },
  gorgeSplash(theta, n) {
    for (let k = 0; k < n; k++) { const im = this.add.image(0, 0, 'salsablob').setDepth(7.7); im.bsx = im.bsy = rnd(0.5, 1.1); this.parts.push({ theta: wrap(theta + rnd(-8, 8) / R), h: 2, vt: rnd(-80, 80), vh: rnd(120, 300), life: rnd(0.4, 0.7), spr: im, rot: 0, rv: rnd(-8, 8) }); }
  },
  // shots (and blasts, and the bash) against a leaping Snapper
  gorgeHit(theta, h, rad) {
    const G = this.gz; if (!G) return false;
    for (const S of G.snaps) {
      if (S.st !== 'leap' || S.dead > 0 || S.h < -14) continue;
      if (dist2(theta, h, S.theta, S.h) > (18 + rad) * (18 + rad)) continue;
      S.dead = 9; S.st = 'lurk'; S.cd = rnd(1.5, 3); S.spr.setVisible(false);
      this.burst(S.theta, S.h, 'salsablob', 12, 1.2); this.bang(S.theta, S.h, 24); Sound.sfx('kill'); this.addScore(200);
      this.popup(S.theta, S.h + 20, '+200', '#ffffff'); this.spillCheddar(S.theta, Math.max(10, S.h), 2);
      return true;
    }
    return false;
  },
  gorgeDraw() {
    const G = this.gz; if (!G) return;
    for (const S of G.shards) this.place(S.spr, S.theta, S.h, S.rot);
    for (const S of G.snaps) if (S.st === 'leap' && S.dead <= 0) this.place(S.spr, S.theta, S.h, S.vh > 0 ? S.vt * 0.004 : Math.PI + S.vt * 0.004);   // (it tips over at the top and dives back in head first)
  }
};
