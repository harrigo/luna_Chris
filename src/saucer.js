// LEVEL 10 (the finale, in progress): THE RAT KING'S ROYAL SAUCER (v2.62 - stage 1: the ship, the deck, the crew).
//
// Not a planet: the curved top deck of an enormous flying saucer. Under the bonnet it's still the polar world (a very big
// radius, so the deck is a gentle arc), but only the middle is deck: +-SAUCER_HALF px from the dome. Step off either rim
// and you FALL (a heart, and the tractor beam drops you back on board). Rats can be shoved overboard too.
//
//   THE DOME      in the middle, the Grand Rat-King at the yoke (a first sketch of him: stage 2 is the fight).
//   STEERING      every so often he throws the ship hard over. The deck lights run the way you're about to slide, an
//                 alarm sounds, then everything on deck (Chris, the crew, loose cheddar) slides that way for a few seconds.
//   HATCHES       the crew don't walk in from the sides: four flaps in the deck bang open and they climb out.
//   STRAFING RUN  (from the second wave) an escort fighter screams over and stitches a line of laser bolts along the deck:
//                 red rings mark where each will land.
//   THE CREW      posh: STEWARDS (tailcoat, monocle, a silver cloche), ADMIRALS (bicorne, epaulettes, sabre: tough),
//                 TOFFS (top hat, monocle, floating under a parasol, popping champagne corks).
//
// Still to come: the Rat King fight (his knotted minions for limbs), Bessie in the dome, the ending and credits.

const SAUCER_HALF = 560;                                  // half the deck, px along the surface

function makeSaucerTextures(scene, toonRat) {
  makeKingTextures(scene);
  if (scene.game.__saucerTex) return; scene.game.__saucerTex = true;
  const INK = 0x1a1020, STEEL = [0xdfe6f0, 0x8a94a6, 0x4a5262], DARK = [0x5a6688, 0x2a3044, 0x141826], GOLD = [0xfff0a0, 0xffc83a, 0xb07a1a];
  const BLK = [0x4a4a5e, 0x1e1e2c, 0x0a0a12], RED = [0xff7a5a, 0xd8301a, 0x8a1408], FUR = [0xc4c8dc, 0x868ca6, 0x4a4f6a], PINK = [0xffb0c0, 0xe07a90, 0xa04a60];
  const monocle = (a, x, y, r) => { for (let k = 0; k < 14; k++) { const t = k / 14 * 6.283; a.px(Math.round(x + Math.cos(t) * r), Math.round(y + Math.sin(t) * r), GOLD[1]); } a.px(Math.round(x - r * 0.5), Math.round(y - r * 0.6), 0xffffff); a.line([[x + r * 0.5, y + r], [x + r * 0.2, y + r + 6], [x - 4, y + r + 8]], GOLD[2]); };
  if (toonRat) {
    // ---- STEWARD: tailcoat, bow tie, slicked hair, monocle, a silver cloche carried before him
    [{ f: 0 }, { f: 1, drool: true }, { f: 0, blink: true }, { f: 1, look: 0.3 }].forEach((o, i) => pixSprite(scene, 'steward' + ['', '_b', '_c', '_d'][i], 56, 40, a => {
      const ox = 3, oy = 10, bob = i % 2;
      a.poly([[ox + 3, oy + 26], [ox + 8, oy + 15], [ox + 12, oy + 20]], BLK); a.poly([[ox + 7, oy + 28], [ox + 11, oy + 17], [ox + 15, oy + 22]], BLK);   // coat tails
      toonRat(a, ox, oy, Object.assign({ shell: false }, o));
      a.poly([[ox + 8, oy + 12], [ox + 24, oy + 11], [ox + 27, oy + 16], [ox + 25, oy + 23], [ox + 10, oy + 23], [ox + 7, oy + 18]], BLK);            // the coat
      a.poly([[ox + 22, oy + 13], [ox + 27, oy + 15], [ox + 25, oy + 22], [ox + 21, oy + 21]], [0xffffff, 0xeef2f8, 0xbcc6d6]);                          // shirt front
      a.px(ox + 23, oy + 16, INK); a.px(ox + 23, oy + 19, INK); a.line([[ox + 10, oy + 13], [ox + 20, oy + 12]], 0x6a6a80);                              // studs, a sheen on the shoulder
      a.poly([[ox + 24, oy + 12], [ox + 27, oy + 10], [ox + 27, oy + 14]], RED); a.poly([[ox + 30, oy + 12], [ox + 27, oy + 10], [ox + 27, oy + 14]], RED);   // bow tie
      a.ell(ox + 30, oy + 3, 6, 2.2, BLK); a.px(ox + 28, oy + 2, 0x6a6a80);                                                                              // hair, slicked flat
      monocle(a, ox + 31, oy + 11, 5.4);
      a.line([[ox + 27, oy + 18], [ox + 34, oy + 22], [ox + 40, oy + 21 - bob]], FUR[1], 2);                                                              // the arm
      a.ell(ox + 45, oy + 21 - bob, 8, 1.6, STEEL); a.ell(ox + 45, oy + 16 - bob, 6, 5, STEEL); a.rect(ox + 39, oy + 17 - bob, ox + 51, oy + 20 - bob, STEEL[1]); a.ell(ox + 45, oy + 15 - bob, 5.5, 4, STEEL);   // tray + cloche
      a.px(ox + 45, oy + 10 - bob, GOLD[1]); a.px(ox + 42, oy + 13 - bob, 0xffffff); a.px(ox + 43, oy + 12 - bob, 0xffffff);
      if (i === 1 || i === 3) { a.px(ox + 50, oy + 9, 0xd8dee8); a.px(ox + 51, oy + 7, 0xbcc6d6); }                                                       // a wisp of steam
    }));
    // ---- ADMIRAL: bicorne and plume, navy coat, epaulettes, a sash of medals, a sabre. Big and slow to drop.
    [{ f: 0 }, { f: 1, drool: true }].forEach((o, i) => pixSprite(scene, 'admiral' + (i ? '_b' : ''), 60, 46, a => {
      const ox = 4, oy = 15, NAVY = [0x5a6ac0, 0x2a3478, 0x141a44];
      toonRat(a, ox, oy, Object.assign({ shell: false }, o));
      a.poly([[ox + 7, oy + 11], [ox + 25, oy + 10], [ox + 28, oy + 16], [ox + 25, oy + 24], [ox + 9, oy + 24], [ox + 6, oy + 18]], NAVY);
      a.line([[ox + 9, oy + 13], [ox + 25, oy + 22]], RED[1], 3); a.line([[ox + 9, oy + 12], [ox + 25, oy + 21]], RED[0], 1);                             // the sash
      for (const [x, y, c] of [[14, 18, GOLD[1]], [17, 20, 0xdfe6f0], [20, 22, GOLD[1]]]) { a.px(ox + x, oy + y, c); a.px(ox + x, oy + y + 1, c); }      // medals
      a.ell(ox + 23, oy + 10, 4.5, 2.2, GOLD); for (const x of [20, 22, 24, 26]) a.px(ox + x, oy + 12 + (x % 4 ? 1 : 0), GOLD[2]);                        // epaulette, fringe
      for (const y of [14, 17, 20]) a.px(ox + 26, oy + y, GOLD[0]);                                                                                       // buttons
      a.poly([[ox + 19, oy + 5], [ox + 24, oy - 4], [ox + 31, oy - 8], [ox + 38, oy - 4], [ox + 44, oy + 4], [ox + 38, oy + 3], [ox + 31, oy - 1], [ox + 25, oy + 3]], BLK);   // the bicorne
      a.line([[ox + 20, oy + 5], [ox + 25, oy + 2], [ox + 31, oy - 2], [ox + 38, oy + 2], [ox + 43, oy + 4]], GOLD[1]); a.ell(ox + 31, oy - 4, 2, 2, GOLD);
      a.ell(ox + 29, oy - 10, 4, 3, [0xffffff, 0xeef2f8, 0xbcc6d6]); a.ell(ox + 25, oy - 9, 3, 2, [0xffffff, 0xeef2f8, 0xbcc6d6]); a.px(ox + 31, oy - 12, 0xffffff);   // plume
      a.line([[ox + 38, oy + 16], [ox + 42, oy + 15]], 0xffffff, 1); a.line([[ox + 38, oy + 17], [ox + 34, oy + 18]], 0xffffff, 1);                       // waxed whiskers
      const sy = i ? -2 : 0;
      a.line([[ox + 28, oy + 19], [ox + 34, oy + 21]], FUR[1], 2); a.line([[ox + 35, oy + 20], [ox + 52, oy + 2 + sy]], STEEL[0], 2); a.line([[ox + 36, oy + 21], [ox + 53, oy + 3 + sy]], STEEL[2], 1);   // sabre
      a.ell(ox + 35, oy + 20, 2.6, 2.6, GOLD); a.px(ox + 52, oy + 1 + sy, 0xffffff);
    }));
    // ---- TOFF: top hat, monocle, cravat, floating under a striped parasol (it spins), little rocket spats
    [{ f: 2, tail: 0 }, { f: 3, tail: 1, drool: true }, { f: 4, tail: 2 }, { f: 3, tail: 0, blink: true }].forEach((o, i) => pixSprite(scene, 'toff' + ['', '_b', '_c', '_d'][i], 54, 56, a => {
      const ox = 4, oy = 24, PK = [0xffd0e0, 0xff8ab0, 0xc04a78], WH = [0xffffff, 0xeef2f8, 0xbcc6d6];
      a.line([[ox + 24, oy + 14], [ox + 24, oy - 12]], 0x7a4a1a, 2); a.line([[ox + 24, oy + 14], [ox + 27, oy + 17]], 0x7a4a1a, 2);                       // the parasol's stick
      a.ell(ox + 24, oy - 14, 20, 8, WH);
      for (let k = 0; k < 5; k++) { const x0 = ox + 6 + ((k * 9 + i * 4) % 40); a.poly([[ox + 24, oy - 22], [x0, oy - 9], [x0 + 5, oy - 8]], PK); }       // stripes (they turn)
      for (let x = ox + 6; x <= ox + 42; x += 6) a.ell(x, oy - 8, 3, 2.2, x % 12 ? WH : PK);                                                              // scalloped edge
      a.px(ox + 24, oy - 23, GOLD[1]); a.px(ox + 24, oy - 24, GOLD[0]);
      toonRat(a, ox, oy, Object.assign({ shell: false }, o));
      a.poly([[ox + 22, oy + 12], [ox + 27, oy + 11], [ox + 28, oy + 17], [ox + 24, oy + 19]], WH); a.px(ox + 25, oy + 14, RED[1]);                        // cravat, a ruby pin
      a.rect(ox + 26, oy - 8, ox + 35, oy + 2, BLK[1]); a.rect(ox + 26, oy - 8, ox + 27, oy + 2, BLK[0]); a.rect(ox + 26, oy - 1, ox + 35, oy, RED[1]); a.ell(ox + 30.5, oy + 3, 8, 1.6, BLK); a.px(ox + 28, oy - 6, 0x6a6a80);   // top hat
      monocle(a, ox + 31, oy + 11, 5.4);
      for (const [x, y] of [[12, 28], [24, 28]]) { a.rect(ox + x, oy + y - 1, ox + x + 3, oy + y, WH[1]); a.poly([[ox + x, oy + y + 1], [ox + x + 3, oy + y + 1], [ox + x + 1.5, oy + y + 4 + (i % 2)]], [0xfff6c0, 0xffb52a, 0xff6a1a]); }   // rocket spats
    }));
  }
  // (v2.67) a deck LASER TURRET: an armoured base bolted to the deck, a glass bubble with a rat gunner squinting through
  // it (goggles), and a separate twin-barrelled gun that tracks Chris
  pixSprite(scene, 'lturret', 44, 34, a => {
    a.rrect(2, 22, 41, 33, 3, DARK); a.rect(4, 24, 39, 25, DARK[0]); for (const x of [6, 14, 29, 37]) { a.px(x, 29, STEEL[0]); a.px(x + 1, 30, INK); }
    for (let k = 0; k < 5; k++) { a.poly([[6 + k * 7, 33], [9 + k * 7, 33], [12 + k * 7, 26], [9 + k * 7, 26]], k % 2 ? 0xffc23a : INK); }   // hazard stripes on the base
    a.ell(22, 18, 13, 11, [0x9fd8ff, 0x5a9ac8, 0x2a5a88]);                                                                               // the bubble
    a.ell(22, 18, 6, 5.5, FUR); a.ell(18, 13, 2, 2.4, PINK); a.ell(26, 13, 2, 2.4, PINK); a.ell(22, 18, 4.5, 2.2, 0x2a3044); a.px(20, 18, 0xff3a2a); a.px(24, 18, 0xff3a2a); a.rect(21, 22, 23, 23, 0xfffbe8);   // the gunner, goggles glowing red
    a.ell(16, 11, 3, 2, 0xffffff); a.px(29, 23, 0xffffff);                                                                              // glints on the glass
  });
  pixSprite(scene, 'lturret_gun', 34, 14, a => {                                                         // the gun (pivot at its left end)
    a.rrect(0, 2, 12, 12, 3, STEEL); a.rect(10, 3, 32, 5, DARK[1]); a.rect(10, 9, 32, 11, DARK[1]); a.rect(10, 3, 32, 3, STEEL[0]); a.rect(10, 9, 32, 9, STEEL[0]);
    a.rect(30, 2, 33, 6, 0xff3a2a); a.rect(30, 8, 33, 12, 0xff3a2a); a.px(4, 6, 0xff3a2a);
  });
  pixSprite(scene, 'cork', 10, 13, a => { a.rrect(2, 4, 7, 12, 1, [0xe8c890, 0xc09a58, 0x8a6a30]); a.ell(4.5, 3.5, 4, 3, [0xf0d8a0, 0xc8a060, 0x8a6a30]); a.px(3, 2, 0xfff6d8); a.px(4, 8, 0x8a6a30); a.px(6, 10, 0x8a6a30); });
  pixSprite(scene, 'sbolt', 8, 24, a => { a.rrect(1, 0, 6, 23, 3, [0xffb0a0, 0xff3a2a, 0xa01008]); a.rect(3, 2, 4, 21, 0xffffff); }, 0);
  // an escort fighter: a ball cockpit (a rat squinting out of it) between two cheese-grater wings
  pixSprite(scene, 'sfighter', 46, 28, a => {
    for (const x0 of [0, 37]) { a.poly([[x0, 2], [x0 + 8, 0], [x0 + 8, 27], [x0, 25]], DARK); for (let y = 4; y < 24; y += 4) for (let x = x0 + 2; x < x0 + 7; x += 3) a.px(x, y + (x % 2), 0x0a0c14); a.line([[x0 + 1, 2], [x0 + 1, 24]], STEEL[1]); }
    a.rect(8, 12, 37, 15, STEEL[2]); a.ell(22.5, 14, 9.5, 9.5, STEEL);
    a.ell(22.5, 14, 5.5, 5.5, [0xff8a7a, 0xc0201a, 0x600808]); a.px(20, 13, 0xffffff); a.px(25, 13, 0xffffff); a.px(20, 14, INK); a.px(25, 14, INK); a.rect(21, 17, 24, 17, 0xfffbe8);
    a.px(18, 8, 0xffffff); a.px(19, 7, 0xffffff); a.rect(21, 23, 24, 24, 0xffb52a);
  });
  // deck hatch: shut / ajar / flung open (amber light pouring out)
  [0, 1, 2].forEach(f => pixSprite(scene, 'hatch' + f, 64, 30, a => {
    a.rrect(2, 18, 61, 29, 2, DARK); a.rect(6, 20, 57, 27, f ? 0x0a0c14 : DARK[1]);
    if (f) { a.rect(8, 21, 55, 27, f === 2 ? 0xffb040 : 0xa85a10); a.rect(14, 23, 49, 27, f === 2 ? 0xffe890 : 0xffb040); }
    const flap = (x0, dir) => {
      const pts = f === 0 ? [[x0, 18], [x0 + dir * 26, 18], [x0 + dir * 26, 22], [x0, 22]] : f === 1 ? [[x0, 20], [x0 + dir * 22, 8], [x0 + dir * 24, 12], [x0 + dir * 2, 23]] : [[x0, 21], [x0 + dir * 8, 0], [x0 + dir * 12, 2], [x0 + dir * 3, 23]];
      a.poly(pts, STEEL);
      for (let k = 1; k < 4; k++) { const t = k / 4, x = pts[0][0] + (pts[1][0] - pts[0][0]) * t, y = pts[0][1] + (pts[1][1] - pts[0][1]) * t; a.px(Math.round(x), Math.round(y + 1), k % 2 ? 0xffd23f : INK); a.px(Math.round(x + dir), Math.round(y + 1), k % 2 ? 0xffd23f : INK); }
    };
    flap(6, 1); flap(57, -1);
    for (const x of [3, 60]) { a.px(x, 20, STEEL[0]); a.px(x, 27, STEEL[0]); }
    a.rect(30, 16, 33, 17, f ? 0xff3a2a : 0x7a1a14);                                                                                                       // a warning lamp
  }));
  // the dome: a dark interior, then (drawn over the King) the glass: ribs, a rim, a long glint
  pixSprite(scene, 'sdome_back', 180, 124, a => {
    a.ell(90, 110, 80, 100, [0x3e6e90, 0x1e3c5c, 0x10203a]); a.rect(0, 110, 179, 123, 0x000000);
    a.rrect(2, 106, 177, 123, 4, STEEL); a.rect(4, 115, 175, 117, STEEL[2]);
    for (let x = 10; x < 172; x += 12) { a.px(x, 110, 0xffffff); a.px(x + 1, 111, 0x4a5262); a.rect(x + 4, 119, x + 6, 120, (x / 12) % 2 ? 0xffd23f : 0xff3a2a); }
  }, true, (grid, w, h) => { for (let y = 110; y < 124; y++) for (let x = 0; x < w; x++) if (grid[y * w + x] === 0x000000) grid[y * w + x] = -1; });
  pixSprite(scene, 'sdome_glass', 180, 124, a => {
    for (let k = 0; k <= 200; k++) { const t = Math.PI + k / 200 * Math.PI, x = 90 + Math.cos(t) * 80, y = 110 + Math.sin(t) * 100; a.px(Math.round(x), Math.round(y), 0xd8f0ff); a.px(Math.round(x), Math.round(y) + 1, 0x8ac0e8); }
    for (const m of [-0.55, 0, 0.55]) for (let k = 0; k <= 90; k++) { const t = k / 90 * Math.PI / 2, x = 90 + Math.sin(t) * 80 * m, y = 110 - Math.cos(t) * 100; if (k % 3) a.px(Math.round(x), Math.round(y), 0x9ad0f0); }   // ribs
    for (let k = 0; k < 44; k++) { const t = Math.PI * 1.18 + k / 44 * 0.5, x = 90 + Math.cos(t) * 68, y = 110 + Math.sin(t) * 86; a.px(Math.round(x), Math.round(y), 0xffffff); if (k > 8 && k < 30) a.px(Math.round(x) + 1, Math.round(y), 0xffffff); }   // the glint
    for (const [x, y] of [[132, 42], [134, 44], [140, 58]]) a.px(x, y, 0xffffff);
  }, 0);
  // THE GRAND RAT-KING (a first sketch, seen through the glass): a bloated, mottled head, a crown far too small, one
  // great bloodshot eye and one sunk in fat, rotten buck teeth, ropes of drool, an ermine collar, fat paws on the yoke
  pixSprite(scene, 'sking', 120, 100, a => {
    a.ell(22, 30, 12, 15, PINK); a.ell(22, 31, 6, 9, PINK[2]); a.ell(98, 30, 12, 15, PINK); a.ell(98, 31, 6, 9, PINK[2]); a.poly([[104, 18], [110, 22], [106, 26]], INK);   // ears (one torn)
    a.ell(60, 48, 38, 34, FUR);                                                                                                                             // the head
    a.ell(36, 66, 16, 14, [0xd4d8ec, 0x9aa0b8, 0x5a6080]); a.ell(84, 66, 16, 14, [0xb0b4cc, 0x7a8098, 0x4a4f6a]);                                          // jowls
    for (const [x, y, r] of [[30, 40, 3], [88, 36, 2.4], [74, 74, 2.6], [44, 78, 2], [96, 56, 2]]) { a.ell(x, y, r, r * 0.9, [0xe8a0b0, 0xc06a80, 0x8a3a54]); a.px(x - 1, y - 1, 0xffd0d8); if (r > 2.5) a.line([[x, y - r], [x + 1, y - r - 3]], INK); }   // warts, a hair in the big ones
    for (const [x, y] of [[40, 30], [52, 24], [70, 26], [80, 44], [48, 60], [66, 58]]) a.px(x, y, FUR[2]);                                                   // mange
    a.line([[30, 30], [50, 36]], INK, 4); a.line([[92, 26], [70, 36]], INK, 5);                                                                             // brows
    a.ell(42, 44, 6, 3.4, INK); a.ell(42, 44, 4.6, 2, [0xfff0e0, 0xe8d0c0, 0xc0a090]); a.px(43, 44, INK); a.line([[35, 48], [48, 49]], FUR[2]);              // the small eye, sunk in fat
    a.ell(76, 44, 13.5, 12.5, INK); a.ell(76, 44, 12, 11, [0xffffff, 0xfff0e0, 0xd8c0b0]);                                                                   // the big one
    for (let k = 0; k < 8; k++) { const t = k / 8 * 6.283 + 0.4; a.line([[76 + Math.cos(t) * 11, 44 + Math.sin(t) * 10], [76 + Math.cos(t + 0.3) * 7, 44 + Math.sin(t + 0.3) * 6.5]], 0xe0301a); }
    a.ell(78, 45, 4.5, 5, [0xffd23f, 0xc8901a, 0x7a5210]); a.ell(78, 45, 2, 3, INK); a.px(74, 40, 0xffffff); a.px(75, 40, 0xffffff);
    a.ell(60, 60, 9, 7, PINK); a.px(56, 58, 0xffffff); a.px(57, 62, PINK[2]); a.px(63, 62, PINK[2]);                                                         // a wet pink nose
    for (const sd of [-1, 1]) for (const dy of [-3, 0, 4]) a.line([[60 + sd * 10, 62 + dy * 0.3], [60 + sd * 34, 58 + dy * 2]], 0xe8ecf8);                   // whiskers
    a.poly([[44, 70], [76, 70], [72, 80], [48, 80]], [0x8a1a1a, 0x5a0a0a, 0x2a0404]);                                                                        // the mouth
    a.rect(52, 70, 58, 80, 0xf0e090); a.rect(60, 70, 66, 78, 0xfffbe8); a.line([[59, 70], [59, 80]], 0x8a7a40); a.px(54, 76, 0x8a7a40); a.px(55, 73, 0x6a8a30); a.px(63, 75, 0xc8b060);   // buck teeth, one rotten
    a.line([[48, 80], [47, 90]], 0x9ae8ff); a.px(47, 91, 0xc8f4ff); a.line([[70, 80], [71, 86]], 0x9ae8ff);                                                  // drool
    a.poly([[44, 18], [46, 6], [52, 12], [58, 3], [64, 12], [70, 5], [73, 17]], GOLD); a.rect(45, 16, 72, 19, GOLD[1]); a.px(58, 6, RED[0]); a.px(52, 16, 0x5ce1ff); a.px(64, 16, RED[1]); a.px(58, 17, 0x7dff8a);   // the crown
    a.ell(60, 92, 44, 9, [0xffffff, 0xeef2f8, 0xc8d0e0]); for (let x = 22; x < 100; x += 9) { a.px(x, 90 + (x % 2), INK); a.px(x + 1, 91 + (x % 2), INK); }  // ermine
  });
  pixSprite(scene, 'sking_yoke', 64, 30, a => {                                                          // the yoke, his paws on it
    a.line([[32, 29], [32, 14]], DARK[1], 5); a.line([[8, 4], [8, 14], [56, 14], [56, 4]], DARK[1], 5); a.line([[9, 5], [9, 13]], DARK[0], 1);
    for (const x of [8, 56]) { a.ell(x, 8, 7, 6, PINK); a.line([[x - 4, 6], [x - 4, 10]], PINK[2]); a.line([[x, 5], [x, 10]], PINK[2]); a.line([[x + 4, 6], [x + 4, 10]], PINK[2]); a.px(x - 5, 4, 0xfffbe8); a.px(x + 5, 4, 0xfffbe8); }
    a.px(26, 14, RED[0]); a.px(32, 13, 0x7dff8a); a.px(38, 14, 0xffd23f);
  });
  pixSprite(scene, 'sking_rat', 30, 26, a => {                                                           // one of his knotted minions, hauling on a lever
    a.line([[2, 22], [8, 18], [12, 22], [6, 25]], PINK[1], 2);                                                                                              // its tail, off to the knot
    a.ell(16, 16, 8, 6, FUR); a.ell(22, 11, 6, 5.5, FUR); a.ell(19, 6, 3, 3.6, PINK); a.ell(27, 13, 2, 1.6, PINK);
    a.ell(23, 10, 2.6, 2.6, INK); a.ell(23, 10, 1.8, 1.8, 0xffffff); a.px(24, 10, INK); a.rect(25, 15, 26, 17, 0xfffbe8);
    a.line([[20, 18], [26, 22]], FUR[1], 2); a.line([[27, 24], [27, 14]], DARK[1], 2); a.ell(27, 13, 2, 2, RED);
  });
}

const SaucerMixin = {
  // a laser turret: bolted to the deck, the gun tracks him, a red sight line, then a bolt. Every wave: tougher, quicker, faster bolts.
  turretSetup(e) {
    const w = this.waveIdx || 0;
    e.hp = e.maxHp = (4 + 3 * w) * Settings.dk.hp; e.h = 0; e.noStomp = false;
    e.tur = { cd: rnd(1, 2), aim: 0, ang: -Math.PI / 2, every: Math.max(0.9, 2.4 - 0.55 * w), speed: 380 + 110 * w, burst: 1 + Math.min(2, w), left: 0 };
    e.spr.setOrigin(0.5, 1); e.ov = e.ov || {}; const g = this.add.image(0, 0, 'lturret_gun').setOrigin(0.18, 0.5).setDepth(4.95); g.bsx = g.bsy = e.spr.bsx || 1; e.ov.gun = g;
  },
  turretAI(e, dt, P) {
    const T = e.tur, k = e.spr.bsx || 1, gh = e.h + 20 * k, w = this.waveIdx || 0;
    if (Math.abs(this.sz.tilt) > 0.02) e.theta = wrap(e.theta);                                    // (bolted down: it doesn't slide)
    const ex = angDiff(P.theta, e.theta) * R, ey = P.h + 30 - gh, want = Math.max(0.15, Math.min(Math.PI - 0.15, Math.atan2(ey, ex)));   // (angle up from the deck, toward him)
    T.ang = T.ang < 0 ? Math.PI / 2 : T.ang;
    T.ang += Math.max(-1, Math.min(1, want - T.ang)) * (2.2 + 0.6 * w) * dt;
    this.place(e.ov.gun, e.theta, gh, -T.ang);
    T.cd -= dt;
    if (T.left <= 0 && T.cd <= 0 && this.state === 'play' && Math.abs(ex) < 520) { T.aim = 0.55; T.left = T.burst; T.cd = T.every; Sound.sfx('charge'); }
    if (T.aim > 0) { T.aim -= dt; if (T.aim <= 0) T.shot = 0; }
    else if (T.left > 0 && (T.shot = (T.shot || 0) - dt) <= 0) {
      T.shot = 0.16; T.left--;
      const c = Math.cos(T.ang), sn = Math.sin(T.ang), b = this.addEBullet('sbolt', wrap(e.theta + c * 26 * k / R), gh + sn * 26 * k, c * T.speed, sn * T.speed, 7, 3);
      b.face = true; Sound.sfx('zing'); this.muzzleFlash(b.theta, b.h);
    }
  },
  saucerInit() {
    const DH = SAUCER_HALF / R;
    const G = this.sz = { DH, tilt: 0, tiltDir: 0, tState: 'idle', tT: rnd(7, 10), hatches: [], strafe: null, strafeT: 16, streaks: [], t: 0 };
    G.sky = this.add.graphics().setDepth(0.45);
    G.g = this.add.graphics().setDepth(1.02);                 // the hull
    G.lights = this.add.graphics().setDepth(1.06).setBlendMode(Phaser.BlendModes.ADD);
    G.fx = this.add.graphics().setDepth(7.9);                 // strafing-run rings and bolts
    for (const px of [-400, -190, 190, 400]) { const spr = this.add.image(0, 0, 'hatch0').setOrigin(0.5, 0.74).setDepth(2.2); spr.bsx = spr.bsy = 1.25; G.hatches.push({ theta: wrap(px / R), open: 0, spr }); }
    G.domeBack = this.add.image(0, 0, 'sdome_back').setOrigin(0.5, 0.9).setDepth(2.3);
    G.king = this.add.image(0, 0, 'sking').setOrigin(0.5, 1).setDepth(2.32);
    G.minions = [-1, 1].map(sd => { const m = this.add.image(0, 0, 'sking_rat').setOrigin(0.5, 1).setDepth(2.33); m.sd = sd; return m; });
    G.yoke = this.add.image(0, 0, 'sking_yoke').setOrigin(0.5, 1).setDepth(2.34);
    G.domeGlass = this.add.image(0, 0, 'sdome_glass').setOrigin(0.5, 0.9).setDepth(2.36);
    G.fighter = this.add.image(0, 0, 'sfighter').setDepth(8.3).setVisible(false); G.fighter.bsx = G.fighter.bsy = 1.5;
    for (let i = 0; i < 46; i++) G.streaks.push({ x: Math.random(), y: Math.random(), len: 20 + Math.random() * 90, sp: 0.5 + Math.random() * 1.2, c: [0xffffff, 0x9fd8ff, 0xffd8a0][i % 3] });
  },
  // the crew climb out of whichever hatch is a fair way from Chris
  saucerSpawnTheta() {
    const G = this.sz, P = this.pl, far = G.hatches.filter(h => Math.abs(angDiff(h.theta, P.theta)) * R > 170);
    const h = (far.length ? far : G.hatches)[Math.floor(Math.random() * (far.length || G.hatches.length))];
    if (h.open <= 0) { Sound.sfx('clunk'); this.burst(h.theta, 8, 'spark', 5, 0.7); }
    h.open = 1.3;
    return h.theta;
  },
  saucerEdgeBack() { const P = this.pl, sd = Math.sign(angDiff(P.theta, 0)) || 1; return wrap(sd * (SAUCER_HALF - 120) / R); },
  saucerUpdate(dt, bossUp) {
    const G = this.sz, P = this.pl; if (!G) return;
    G.t += dt;
    // ---- HE STEERS: idle -> warn (lights run, alarm) -> hard over -> ease back
    if (this.state === 'play') G.tT -= dt;
    if (G.fall) { this.saucerFall(dt); this.kingWaves(dt); }
    if (G.tState === 'idle' && G.tT <= 0) { G.tState = 'warn'; G.tT = G.fall ? 0.7 : 1.3; G.tiltDir = Math.random() < 0.5 ? -1 : 1; Sound.sfx('alarm'); this.banner(G.tiltDir < 0 ? '<<<  HARD TO PORT!' : 'HARD TO STARBOARD!  >>>'); }
    else if (G.tState === 'warn' && G.tT <= 0) { G.tState = 'over'; G.tT = G.fall ? rnd(1.4, 2.4) : rnd(2.6, 3.4) + 0.3 * (this.waveIdx || 0); Sound.sfx('whoosh'); this.cameras.main.shake(260, 0.006); buzz(60); }
    else if (G.tState === 'over' && G.tT <= 0) { G.tState = 'idle'; G.tT = G.fall ? rnd(2.5, 4.5) : rnd(7, 11) - 1.2 * (this.waveIdx || 0); }
    const goal = (G.tState === 'over' ? G.tiltDir : 0) + (G.fall ? 0.22 * Math.sin(G.t * 1.7) + 0.12 * Math.sin(G.t * 4.3) : 0);   // (diving: it never sits level)
    G.tilt += (goal - G.tilt) * Math.min(1, dt * (goal ? 3.5 : 2.2));
    if (Math.abs(G.tilt) > 0.02 && this.state === 'play' && !P.pitFall) {
      const onDeck = P.h <= (P.floor || 0) + 0.5;
      P.theta = wrap(P.theta + G.tilt * (onDeck ? 118 : 60) / R * dt);                                   // (you can run against it, just)
      if (onDeck && Math.random() < dt * 14) this.burst(wrap(P.theta - G.tilt * 10 / R), 2, 'spark', 1, 0.3);   // boots scraping
    }
    // ---- the edges: no deck, no floor
    const d = angDiff(P.theta, 0);
    if (Math.abs(d) > G.DH + 6 / R && P.h <= 0.5 && !(P.floor > 0) && !P.pitFall && this.state === 'play') { P.pitFall = 0.85; Sound.sfx('whoosh'); this.banner('OVERBOARD!'); buzz(80); }
    for (const e of this.enemies) {
      if (e.type === 'boss' || e.hp <= 0) continue;
      if (e.tossV) { e.theta = wrap(e.theta + e.tossV / R * dt); if (e.h <= 1) e.tossV = 0; }
      const st = ENEMY[e.type] || {};
      if (!e.over) {
        if (st.deck && e.h <= 1) {
          if (Math.abs(G.tilt) > 0.02) e.theta = wrap(e.theta + G.tilt * 95 / R * dt);                   // the crew slide too
          if (Math.abs(angDiff(e.theta, 0)) > G.DH + 10 / R) { e.over = { h: 0, vh: 120, vt: Math.sign(angDiff(e.theta, 0)) * 60, th: e.theta }; Sound.sfx('squeak'); this.popup(e.theta, 40, 'OVERBOARD!', '#ffd23f'); }
        }
      } else {                                                                                           // over the side: arms windmilling, gone
        const O = e.over; O.vh -= 900 * dt; O.h += O.vh * dt; O.th = wrap(O.th + O.vt / R * dt);
        e.theta = O.th; e.h = O.h; e.roll = (e.roll || 0) + dt * 9; e.phased = true;
        if (O.h < -300) { e.phased = false; e.hp = 0; }
      }
    }
    for (const h of G.hatches) { h.open = Math.max(0, h.open - dt); h.spr.setTexture(h.open > 1.05 || (h.open > 0 && h.open < 0.2) ? 'hatch1' : (h.open > 0 ? 'hatch2' : 'hatch0')); }
    // ---- STRAFING RUN (from the second wave): a fighter screams over, a line of bolts walks along the deck
    if (!G.strafe && !bossUp && this.state === 'play' && (this.waveIdx || 0) >= 1 && (G.strafeT -= dt) <= 0) {
      const dir = Math.random() < 0.5 ? -1 : 1, bolts = [];
      for (let k = 0; k < 8; k++) { const th = wrap(P.theta + dir * (-260 + k * 74) / R); if (Math.abs(angDiff(th, 0)) < G.DH) bolts.push({ theta: th, t: -1.0 - k * 0.14 }); }
      G.strafe = { dir, bolts, t: 0 }; G.strafeT = rnd(11, 15); Sound.sfx('alarm');
    }
    if (G.strafe) {
      const S = G.strafe; S.t += dt; let live = false;
      for (const B of S.bolts) {
        B.t += dt; if (B.t < 0.35) live = true;
        if (B.t >= 0 && !B.hit) { B.hit = true; Sound.sfx('zing'); this.burst(B.theta, 4, 'spark', 8, 1); this.bang(B.theta, 6, 14); this.addLight(B.theta, 10, 70, 0xff4a2a, 0.9, 0.25); this.cameras.main.shake(50, 0.003);
          if (Math.abs(angDiff(P.theta, B.theta)) * R < 22 && P.h < 56 && P.invuln <= 0 && this.state === 'play') this.hurt(); }
      }
      if (!live && S.t > 2.4) G.strafe = null;
    }
  },
  // the hull, the sky, the dome and everything bolted to the deck
  saucerDraw() {
    const G = this.sz; if (!G) return;
    const z = this.zoom, W = this.W, H = this.H, t = this.t, DH = G.DH, P = this.pl;
    const sp = (px, h) => this.screenPos(wrap(px / R), h);
    // ---- sky: hyperspace streaks (they lean with the helm), and the cheese world far below
    const sk = G.sky; sk.clear();
    if (G.fall) for (const s of G.streaks) {                                                         // diving: everything rushes up past us
      s.y -= (0.5 * s.sp) * (this.lastDt || 0.016); if (s.y < -0.2) { s.y += 1.4; s.x = Math.random(); }
      const x = s.x * W + G.tilt * 30, y = s.y * H, len = s.len * 1.4;
      sk.lineStyle(s.sp > 1.3 ? 2 : 1, s.c, 0.3 + 0.3 * s.sp / 1.7).lineBetween(x, y, x - G.tilt * len * 0.3, y + len);
    }
    else for (const s of G.streaks) {
      s.x -= (0.22 * s.sp + G.tilt * 0.3 * s.sp) * (this.lastDt || 0.016); if (s.x < -0.2) s.x += 1.4; if (s.x > 1.2) s.x -= 1.4;
      const x = s.x * W, y = s.y * H * 0.8, len = s.len * (1 + Math.abs(G.tilt) * 1.5);
      sk.lineStyle(s.sp > 1.3 ? 2 : 1, s.c, 0.25 + 0.3 * s.sp / 1.7).lineBetween(x, y, x + len, y - G.tilt * len * 0.12);
    }
    { const fk = G.fall ? Math.min(1, G.fall / 40) : 0, pr = H * (0.2 + 0.9 * fk), px = W * (0.2 + 0.3 * fk) - angDiff(P.theta, 0) * 40, py = H * (0.34 + 0.75 * fk);   // (it swells as we plunge toward it)                          // Parmesan Prime, far below and behind: small, on fire
      sk.fillStyle(0xffb070, 0.07).fillCircle(px, py, pr + 26); sk.fillStyle(0xffb070, 0.1).fillCircle(px, py, pr + 12);
      sk.fillStyle(0x8a7a4a, 1).fillCircle(px, py, pr); sk.fillStyle(0xc0b07a, 1).fillCircle(px - pr * 0.02, py - pr * 0.02, pr * 0.975); sk.fillStyle(0xdcd0a0, 1).fillCircle(px - pr * 0.05, py - pr * 0.05, pr * 0.93);
      for (let k = 0; k < 9; k++) { const a = k * 0.7 + 0.3, dd = pr * (0.25 + (k % 4) * 0.16), cxp = px + Math.cos(a) * dd, cyp = py + Math.sin(a) * dd; sk.fillStyle(k % 3 ? 0xa8985a : 0xff7a3a, k % 3 ? 0.8 : 0.6 + 0.3 * Math.sin(t * 5 + k)).fillEllipse(cxp, cyp, pr * (0.12 + (k % 3) * 0.05), pr * (0.07 + (k % 2) * 0.03)); }
      sk.fillStyle(0x03040e, 0.45).fillCircle(px + pr * 0.22, py + pr * 0.2, pr * 0.9);   // craters, and fires (it's coming apart)
    }
    // ---- the hull
    const g = G.g, N = 44, E = SAUCER_HALF, RIM = 40; g.clear();
    const top = [], low = [], bowl = [];
    for (let k = 0; k <= N; k++) { const u = k / N * 2 - 1, px = u * (E + RIM), over = Math.max(0, Math.abs(px) - E) / RIM; top.push(sp(px, -22 * over * over)); low.push(sp(px, -30 - 14 * (1 - over))); bowl.push(sp(u * (E + RIM), -34 - 230 * Math.sqrt(Math.max(0, 1 - u * u)))); }
    g.fillStyle(0x10131e, 1).fillPoints(top.concat(bowl.slice().reverse()), true);                         // silhouette
    g.fillStyle(0x232a3e, 1).fillPoints(low.concat(bowl.slice().reverse()), true);                         // the bowl underneath
    for (const f of [0.3, 0.6]) { const ring = []; for (let k = 0; k <= N; k++) { const u = k / N * 2 - 1; ring.push(sp(u * (E + RIM) * (1 - f * 0.25), -34 - 230 * f * Math.sqrt(Math.max(0, 1 - u * u)))); } g.lineStyle(2 * z, 0x10131e, 1).strokePoints(ring, false); g.lineStyle(1 * z, 0x3a4460, 1).strokePoints(ring.map(q => ({ x: q.x, y: q.y + 2 * z })), false); }
    g.fillStyle(0x4a5672, 1).fillPoints(top.concat(low.slice().reverse()), true);                          // the deck's edge plate
    for (let px = -E; px <= E; px += 70) { const a = sp(px, -1), b = sp(px, -36); g.lineStyle(1.5 * z, 0x232a3e, 1).lineBetween(a.x, a.y, b.x, b.y); const c = sp(px + 35, -20); g.fillStyle(0x8a94a6, 1).fillCircle(c.x, c.y, 1.8 * z); }   // panel seams, rivets
    for (const sd of [-1, 1]) for (let k = 0; k < 6; k++) { const a = sp(sd * (E - 8 - k * 14), 0), b = sp(sd * (E - 15 - k * 14), 0), c = sp(sd * (E - 15 - k * 14), -9), d2 = sp(sd * (E - 8 - k * 14), -9); g.fillStyle(k % 2 ? 0x1a1020 : 0xffc23a, 1).fillPoints([a, b, c, d2], true); }   // hazard stripes at the rims
    g.lineStyle(3 * z, 0xb8c4e0, 1).strokePoints(top.filter((q, k) => Math.abs((k / N * 2 - 1) * (E + RIM)) <= E + 4), false);   // the deck itself, catching the light
    g.lineStyle(3 * z, 0x1a1020, 1).strokePoints(top, false); g.lineStyle(2 * z, 0xb8c4e0, 1).strokePoints(top.filter((q, k) => Math.abs((k / N * 2 - 1) * (E + RIM)) <= E + 4).map(q => ({ x: q.x, y: q.y + 2 * z })), false);
    // ---- lights (ADD): the rim, the deck chevrons that run the way you're about to slide, thrusters, the underside lamp
    const L = G.lights; L.clear();
    for (let px = -E - 20, k = 0; px <= E + 20; px += 62, k++) { const q = sp(px, -52), on = (Math.floor(t * 5) + k) % 5 === 0; L.fillStyle(on ? 0xffe27a : 0xff5a2a, on ? 0.9 : 0.35).fillCircle(q.x, q.y, (on ? 4 : 2.5) * z); if (on) L.fillStyle(0xffe27a, 0.18).fillCircle(q.x, q.y, 11 * z); }
    const warn = G.tState === 'warn' || G.tState === 'over', dir = G.tiltDir;
    if (warn) for (let px = -E + 40, k = 0; px <= E - 40; px += 46, k++) {
      const ph = ((t * 7 - k * dir) % 6 + 6) % 6; if (ph > 2) continue;
      const a = sp(px + dir * 16, -9), b = sp(px - dir * 8, -1), c = sp(px - dir * 8, -17);
      L.fillStyle(G.tState === 'warn' ? 0xffc23a : 0xff5a2a, 0.9).fillPoints([a, b, c], true);
    }
    for (const sd of [-1, 1]) {                                                                           // thrusters under each rim: the far one fires to shove the ship over
      const n0 = sp(sd * (E + 6), -58), fire = warn && sd === -dir ? 1 : 0.25, n1 = sp(sd * (E + 6) + sd * 6, -58 - (30 + 70 * fire + Math.sin(t * 40) * 8 * fire));
      L.lineStyle(10 * z * (0.5 + fire), 0xff8a2a, 0.5 * (0.4 + fire)).lineBetween(n0.x, n0.y, n1.x, n1.y); L.lineStyle(4 * z, 0xfff6c0, 0.9 * (0.3 + fire * 0.7)).lineBetween(n0.x, n0.y, (n0.x + n1.x) / 2, (n0.y + n1.y) / 2);
    }
    // ---- hatches, the dome, the King at the yoke (he throws his weight into every turn), his two knotted rats on the levers
    for (const h of G.hatches) this.place(h.spr, h.theta, 0, 0);
    const lean = G.tilt * 0.3 + (G.tState === 'warn' ? dir * 0.12 * Math.sin(t * 30) * 0.3 : 0), bob = Math.sin(t * 2.2) * 1.5;
    this.place(G.domeBack, 0, 0, 0); G.domeBack.setScale(G.domeBack.scaleX * 1.25, G.domeBack.scaleY * 1.25);
    this.place(G.king, wrap(G.tilt * 14 / R), 22 + bob, lean); G.king.setScale(G.king.scaleX * 1.0, G.king.scaleY * (1 + 0.02 * Math.sin(t * 2.2)));
    for (const m of G.minions) { this.place(m, wrap((m.sd * 62 + G.tilt * 8) / R), 20 + Math.abs(Math.sin(t * 5 + m.sd)) * 4 + (warn && m.sd === dir ? 5 : 0), 0); m.setFlipX(m.sd > 0); m.setScale(m.scaleX * 1.2, m.scaleY * 1.2); }
    this.place(G.yoke, wrap(G.tilt * 20 / R), 14, G.tilt * 0.6);
    if (G.broken) { G.king.setVisible(false); G.yoke.setVisible(false); G.minions.forEach(m => m.setVisible(false)); if (G.domeGlass.texture.key !== 'sdome_broken') G.domeGlass.setTexture('sdome_broken'); }
    if (G.breakout) {                                                                                  // the King throwing himself at the glass
      G.lunge = Math.max(0, (G.lunge || 0) - (this.lastDt || 0.016));
      const l = G.lunge / 0.18; G.king.x += Math.sin(t * 50) * 2 + l * 6 * Math.sin(t * 9); G.king.y -= l * 10 * z; G.king.setScale(G.king.scaleX * (1 + 0.12 * l), G.king.scaleY * (1 - 0.06 * l));
      for (const m of G.minions) m.x += Math.sin(t * 60 + m.sd) * 3;
    }
    this.place(G.domeGlass, 0, 0, 0); G.domeGlass.setScale(G.domeGlass.scaleX * 1.25, G.domeGlass.scaleY * 1.25); G.domeGlass.setAlpha(G.broken ? 1 : 0.8);
    if (G.breakout && G.impacts) {                                                                     // a starburst of cracks at every blow, growing with each one after
      const lv = G.crackLv || 0, L = G.crackG || (G.crackG = this.add.graphics().setDepth(2.4)); L.clear();   // (over the dome glass)
      const bb = this.enemies.find(q => q.type === 'boss'); if (bb) bb.spr.setAlpha(0);
      G.impacts.forEach((I, n) => {
        const c = this.screenPos(wrap(I.x / R), I.h), grow = Math.min(1, 0.45 + (lv - n) * 0.18), arms = 6 + n;
        L.fillStyle(0xffffff, 0.7).fillCircle(c.x, c.y, 2.5 * z);
        for (let i = 0; i < arms; i++) {
          const a = I.a + i * 6.283 / arms + Math.sin(i * 7.1 + n) * 0.25, r2 = (16 + 26 * grow + (i % 3) * 6) * z, mid = r2 * 0.55, kink = Math.sin(i * 3.3 + n) * 0.3;
          const p1 = { x: c.x + Math.cos(a) * mid, y: c.y + Math.sin(a) * mid }, p2 = { x: c.x + Math.cos(a + kink) * r2, y: c.y + Math.sin(a + kink) * r2 };
          L.lineStyle(2 * z, 0xffffff, 0.9).lineBetween(c.x, c.y, p1.x, p1.y); L.lineStyle(1.2 * z, 0xd8f4ff, 0.8).lineBetween(p1.x, p1.y, p2.x, p2.y);
        }
        L.lineStyle(1 * z, 0xffffff, 0.5).strokeCircle(c.x, c.y, (8 + 6 * grow) * z);                  // the ring round the impact
      });
      if (G.lunge > 0.1) { const q = this.screenPos(0, 70); L.fillStyle(0xffffff, 0.25).fillCircle(q.x, q.y, 60 * z); }   // a flash on each blow
    }
    if (G.fall) for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) {                               // re-entry: flames streaming up off the rims
      const q = sp(sd * (E + 20 - k * 30), -60), len = (40 + 40 * Math.random()) * z;
      L.fillStyle(k % 2 ? 0xff8a2a : 0xffd23f, 0.5).fillTriangle(q.x - 8 * z, q.y, q.x + 8 * z, q.y, q.x + G.tilt * 10, q.y - len);
    }
    if (G.waves) for (const Wv of G.waves) { const q = this.screenPos(wrap(Wv.theta + Wv.dir * 300 * Wv.t / R), 6); L.fillStyle(0xffe27a, 0.8).fillEllipse(q.x, q.y, 34 * z, 12 * z); L.fillStyle(0xffffff, 0.9).fillEllipse(q.x, q.y, 14 * z, 5 * z); }
    { const b = this.enemies.find(q => q.type === 'boss'); if (b && b.ks && b.ks.swing) {                // the knot sweeping across: a smear in front of him, low or high
      const S2 = b.ks.swing; S2.t += this.lastDt || 0.016; if (S2.t > 0.35) b.ks.swing = null; else { const a = S2.t / 0.35, hh = S2.high ? 100 : 26; const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push(this.screenPos(wrap(b.theta + S2.dir * (20 + 150 * u * a) / R), hh + 20 * Math.sin(u * Math.PI))); } L.lineStyle(16 * z, 0xffd23f, 0.35 * (1 - a)).strokePoints(pts, false); L.lineStyle(5 * z, 0xffffff, 0.8 * (1 - a)).strokePoints(pts, false); } }
      if (b && b.ks && b.ks.st === 'sweep' && !b.ks.hit) { const q = this.screenPos(wrap(b.theta + b.ks.dir * 70 / R), b.ks.high ? 100 : 26); L.fillStyle(0xff3a2a, 0.25 + 0.2 * Math.sin(t * 30)).fillEllipse(q.x, q.y, 150 * z, 26 * z); } }
    // ---- the strafing run
    const fx = G.fx; fx.clear(); G.fighter.setVisible(false);
    for (const e of this.enemies) if (e.tur && e.tur.aim > 0 && e.hp > 0) {                         // turrets taking aim: a flickering red sight line
      const T = e.tur, k = e.spr.bsx || 1, gh = e.h + 20 * k, a = this.screenPos(wrap(e.theta + Math.cos(T.ang) * 26 * k / R), gh + Math.sin(T.ang) * 26 * k), b = this.screenPos(wrap(e.theta + Math.cos(T.ang) * 600 / R), gh + Math.sin(T.ang) * 600);
      fx.lineStyle((1 + 2 * (1 - T.aim / 0.55)) * z, 0xff3a2a, 0.35 + 0.4 * Math.sin(t * 40)).lineBetween(a.x, a.y, b.x, b.y);
    }
    if (G.strafe) {
      const S = G.strafe;
      if (S.t < 1.9) { const u = S.t / 1.9; this.place(G.fighter, wrap(P.theta + S.dir * (u * 2 - 1) * (this.visHalf + 0.25)), 300 - 60 * Math.sin(u * Math.PI), S.dir * 0.2); G.fighter.setFlipX(S.dir < 0); }
      for (const B of S.bolts) {
        const q = this.screenPos(B.theta, 1); if (!q.vis) continue;
        if (B.t < 0) { const k = Math.max(0, 1 + B.t / 1.0), w = (20 - 9 * k) * z; fx.lineStyle(2.5 * z, 0xff3a2a, 0.4 + 0.6 * k).strokeEllipse(q.x, q.y, w * 2, w * 0.7); fx.fillStyle(0xff3a2a, 0.25 * k).fillEllipse(q.x, q.y, w * 1.2, w * 0.4); if (k > 0.7) { const s0 = this.screenPos(B.theta, 420 * (1 - (k - 0.7) / 0.3) + 20), s1 = this.screenPos(B.theta, 420 * (1 - (k - 0.7) / 0.3) + 70); fx.lineStyle(5 * z, 0xff3a2a, 1).lineBetween(s0.x, s0.y, s1.x, s1.y); fx.lineStyle(2 * z, 0xffffff, 1).lineBetween(s0.x, s0.y, s1.x, s1.y); } }
        else if (B.t < 0.3) { const k = 1 - B.t / 0.3; fx.fillStyle(0xfff0c0, k).fillEllipse(q.x, q.y, 44 * z * (1.3 - k * 0.3), 14 * z); fx.fillStyle(0xff5a2a, k * 0.7).fillCircle(q.x, q.y - 8 * z, 16 * z * k); }
      }
    }
  }
};

// ---------------------------------------------------------------- STAGE 2 (v2.65): THE RAT KING BREAKS OUT
// When the waves are done he smashes out through the dome glass and comes for Chris on the open deck. With nobody at the
// wheel the saucer goes into a dive: it pitches about at random (short warnings), and FREE FALL / PULL UP spells swing the
// gravity - floaty while it plunges, crushing when it lurches level. Parmesan Prime swells up below, streaks rush past.
//   THE KING      a bloated mangy rat in a tattered ermine robe, the crown jammed on, the one huge eye - and for arms,
//                 two writhing knots of his own minions, tails tangled together.
//   KNOT SWEEP    he hauls a knot back (it glows), then sweeps it across the deck: LOW (jump it) or HIGH (duck it).
//   MINION TOSS   he plucks rats off his knot and lobs them; they land and scurry at you.
//   BELLY SLAM    he leaps, hangs, and drops on the deck: a shockwave runs both ways along it (jump), and the ship
//                 pitches toward the impact.
//   Half health: everything faster, the dive gets wilder.
function makeKingTextures(scene) {
  if (scene.game.__kingTex) return; scene.game.__kingTex = true;
  const INK = 0x1a1020, FUR = [0xc4c8dc, 0x868ca6, 0x4a4f6a], MANGE = [0x9aa0b8, 0x6a7088, 0x3a3f54], PINK = [0xffb0c0, 0xe07a90, 0xa04a60];
  const GOLD = [0xfff0a0, 0xffc83a, 0xb07a1a], ERM = [0xffffff, 0xeef2f8, 0xc8d0e0], ROBE = [0xc84a6a, 0x8a1a3a, 0x4a0a1e];
  const minirat = (a, x, y, ang, s, eyeOpen) => {                          // one of the rats in the knot: a body, a head, an eye, a tail
    const c = Math.cos(ang), sn = Math.sin(ang);
    a.ell(x, y, 6 * s, 4 * s, FUR); a.ell(x + c * 6 * s, y + sn * 6 * s, 3.6 * s, 3.2 * s, FUR);
    a.ell(x + c * 4 * s - sn * 3 * s, y + sn * 4 * s + c * 3 * s - 2 * s, 1.8 * s, 2 * s, PINK);
    a.px(Math.round(x + c * 9 * s), Math.round(y + sn * 9 * s), PINK[1]);
    if (eyeOpen) { a.ell(x + c * 7 * s, y + sn * 7 * s - 1, 1.6, 1.6, 0xffffff); a.px(Math.round(x + c * 7 * s + c), Math.round(y + sn * 7 * s - 1), INK); }
    a.line([[x - c * 5 * s, y - sn * 5 * s], [x - c * 9 * s + sn * 3, y - sn * 9 * s - c * 3], [x - c * 12 * s, y - sn * 12 * s + 2]], PINK[1]);
  };
  const knot = (a, cx, cy, ang, len) => {                                  // an arm made of rats: a writhing tangle along a line
    for (let k = 0; k < 5; k++) { const u = k / 4, x = cx + Math.cos(ang) * len * u + Math.sin(k * 2.1) * 4, y = cy + Math.sin(ang) * len * u + Math.cos(k * 1.7) * 4; minirat(a, x, y, ang + Math.sin(k * 2.7) * 1.4 + (k % 2 ? Math.PI : 0), 1 - u * 0.15, k % 2 === 0); }
    for (let k = 0; k < 6; k++) { const u = (k + 0.5) / 6, x = cx + Math.cos(ang) * len * u, y = cy + Math.sin(ang) * len * u; a.line([[x - 4, y - 3], [x + 2, y + 4], [x + 5, y - 2]], PINK[1]); }   // the tangled tails
    const ex = cx + Math.cos(ang) * (len + 6), ey = cy + Math.sin(ang) * (len + 6); a.ell(ex, ey, 7, 6, FUR); a.ell(ex + 2, ey - 1, 2.6, 2.6, 0xffffff); a.px(Math.round(ex + 3), Math.round(ey - 1), INK); a.rect(Math.round(ex + 4), Math.round(ey + 2), Math.round(ex + 6), Math.round(ey + 4), 0xfffbe8);   // a fist of a rat on the end, teeth bared
  };
  const body = (key, pose) => pixSprite(scene, key, 140, 130, a => {
    const sq = pose === 2 ? 6 : 0, up = pose === 1;
    // the knots behind (the far arm)
    knot(a, 46, 70, up ? -2.2 : 2.5, up ? 40 : 34);
    // robe, tattered at the hem; a sagging belly out of it
    a.poly([[30, 72 + sq], [46, 52 + sq], [94, 52 + sq], [110, 72 + sq], [112, 118], [100, 124], [92, 116], [82, 126], [70, 118], [58, 126], [48, 116], [36, 124], [28, 118]], ROBE);
    for (let x = 34; x < 108; x += 7) a.line([[x, 70 + sq], [x + 2, 116]], ROBE[2]);
    a.ell(70, 96 + sq * 0.5, 26, 22 - sq * 0.3, MANGE); a.ell(66, 92 + sq * 0.5, 16, 12, FUR); a.ell(70, 98 + sq * 0.5, 2.4, 2, PINK[2]);   // the belly, a deep navel
    for (const [x, y] of [[54, 104], [84, 88], [76, 110], [60, 86]]) { a.px(x, y + sq * 0.5, MANGE[2]); a.px(x + 1, y + sq * 0.5, PINK[1]); }   // sores
    a.ell(70, 52 + sq, 42, 8, ERM); for (let x = 34; x < 108; x += 8) { a.px(x, 51 + sq, INK); a.px(x + 1, 52 + sq, INK); }                       // ermine collar
    // the head: jowly, mangy, one huge eye, a crown jammed on
    const hy = 34 + sq;
    a.ell(40, hy - 14, 10, 13, PINK); a.ell(100, hy - 14, 10, 13, PINK); a.ell(40, hy - 13, 5, 8, PINK[2]); a.ell(100, hy - 13, 5, 8, PINK[2]); a.poly([[104, hy - 24], [110, hy - 20], [105, hy - 17]], INK);
    a.ell(70, hy, 32, 26, FUR); a.ell(52, hy + 14, 14, 10, MANGE); a.ell(88, hy + 14, 14, 10, MANGE);
    for (const [x, y] of [[50, hy - 8], [92, hy - 2], [62, hy + 20], [80, hy - 16]]) { a.ell(x, y, 2.4, 2, PINK); a.px(x - 1, y - 1, 0xffd0d8); }   // warts
    a.line([[46, hy - 10], [62, hy - 4]], INK, 4); a.line([[96, hy - 14], [78, hy - 4]], INK, 5);
    a.ell(56, hy, 4.6, 2.6, INK); a.ell(56, hy, 3.4, 1.4, 0xffe8d0); a.px(57, hy, INK);
    a.ell(84, hy + 1, 12, 11, INK); a.ell(84, hy + 1, 10.6, 9.6, [0xffffff, 0xfff0e0, 0xd8c0b0]);
    for (let k = 0; k < 7; k++) { const t2 = k / 7 * 6.283; a.line([[84 + Math.cos(t2) * 9.5, hy + 1 + Math.sin(t2) * 8.6], [84 + Math.cos(t2 + 0.3) * 6, hy + 1 + Math.sin(t2 + 0.3) * 5.5]], 0xe0301a); }
    a.ell(85 + (up ? 0 : 1), hy + 2, 4, 4.5, [0xffd23f, 0xc8901a, 0x7a5210]); a.ell(85 + (up ? 0 : 1), hy + 2, 1.8, 2.8, INK); a.px(81, hy - 3, 0xffffff);
    a.ell(70, hy + 14, 7, 5.5, PINK); a.px(67, hy + 12, 0xffffff);
    if (up || pose === 2) { a.ell(70, hy + 22, 11, 7, [0x8a1a1a, 0x5a0a0a, 0x2a0404]); a.rect(64, hy + 15, 69, hy + 22, 0xf0e090); a.rect(71, hy + 15, 76, hy + 21, 0xfffbe8); a.ell(70, hy + 26, 5, 2, [0xff8a9a, 0xd04a5a, 0x8a1a2a]); a.line([[60, hy + 26], [58, hy + 36]], 0x9ae8ff); }
    else { a.poly([[58, hy + 19], [82, hy + 19], [78, hy + 26], [62, hy + 26]], [0x8a1a1a, 0x5a0a0a, 0x2a0404]); a.rect(64, hy + 19, 69, hy + 27, 0xf0e090); a.rect(71, hy + 19, 76, hy + 25, 0xfffbe8); a.line([[62, hy + 26], [61, hy + 33]], 0x9ae8ff); }
    for (const sd of [-1, 1]) for (const dy of [-2, 1, 4]) a.line([[70 + sd * 8, hy + 13 + dy * 0.3], [70 + sd * 30, hy + 9 + dy * 2]], 0xe8ecf8);
    const cy2 = hy - 26 - (up ? 2 : 0);
    a.poly([[56, cy2 + 8], [58, cy2 - 4], [63, cy2 + 2], [70, cy2 - 7], [77, cy2 + 2], [82, cy2 - 4], [84, cy2 + 8]], GOLD); a.rect(57, cy2 + 6, 83, cy2 + 9, GOLD[1]);
    a.px(70, cy2 - 4, 0xff3a2a); a.px(63, cy2 + 7, 0x5ce1ff); a.px(77, cy2 + 7, 0x7dff8a); a.line([[80, cy2 + 2], [83, cy2 + 6]], GOLD[2]);   // dented
    // the near arm: a knot of rats
    knot(a, 96, 70, up ? -1.0 : (pose === 2 ? 0.3 : 0.9), up ? 40 : 34);
    // stubby legs, splayed toes
    for (const x of [52, 88]) { a.rrect(x - 7, 116, x + 7, 128, 3, MANGE); for (const t2 of [-5, 0, 5]) a.ell(x + t2, 128, 2, 1.6, PINK); }
  });
  body('kingboss', 0); body('kingboss_b', 1); body('kingboss_c', 2);
  pixSprite(scene, 'sdome_broken', 180, 124, a => {                         // what's left of the dome: the rim, jagged stubs of glass, a bent rib
    for (let k = 0; k <= 60; k++) { const t2 = Math.PI + k / 60 * Math.PI, x = 90 + Math.cos(t2) * 80, y = 110 + Math.sin(t2) * 100; if (y > 70) { a.px(Math.round(x), Math.round(y), 0xd8f0ff); a.px(Math.round(x), Math.round(y) + 1, 0x8ac0e8); } }
    for (const [x0, h, w] of [[16, 26, 10], [40, 16, 12], [130, 22, 12], [156, 30, 10], [96, 10, 14]]) a.poly([[x0, 110], [x0 + w * 0.3, 110 - h], [x0 + w * 0.6, 110 - h * 0.5], [x0 + w, 110 - h * 0.8], [x0 + w + 2, 110]], [0xd8f4ff, 0x8ac8f0, 0x3a7aa8]);
    a.line([[48, 110], [60, 64], [80, 52]], 0x9ad0f0, 2);
  }, 0);
  pixSprite(scene, 'glassshard', 12, 12, a => { a.poly([[1, 10], [5, 1], [11, 6], [7, 11]], [0xffffff, 0xb8e4ff, 0x6aa8d8]); }, 0);
}

Object.assign(SaucerMixin, {
  // the boss turns up in the dome: he shakes, the glass cracks... and he bursts out
  kingSetup(e) {
    const G = this.sz;
    e.theta = 0; e.h = 20; e.phased = true; e.ch = 80; e.r = 58; e.ks = { st: 'breakout', t: 0, cd: 1.5, seq: 0 };
    e.spr.setOrigin(0.5, 1).setDepth(6); e.spr.bsx = e.spr.bsy = 1.5; e.spr.setVisible(false);
    G.breakout = 0.001; this.banner('THE RAT KING IS COMING OUT!');
  },
  kingAI(e, dt, P) {
    const G = this.sz, K = e.ks, toP = angDiff(P.theta, e.theta), dirP = Math.sign(toP) || 1, p2 = e.hp < e.maxHp * 0.5, sp = p2 ? 1.3 : 1;
    K.t += dt;
    if (K.st === 'breakout') {
      // (v2.67) he HAMMERS on the glass: blows coming faster and harder, each one a thud, a shake, spreading cracks and a
      // spray of shards; the last one, at ~4.3 s, takes the dome out
      e.spr.setAlpha(0);                                  // (his full-size body only appears once he's out: in the dome he's the sketch)
      const HITS = [0.5, 1.25, 1.9, 2.45, 2.9, 3.3, 3.65, 3.95];
      K.hitN = K.hitN || 0;
      if (K.hitN < HITS.length && K.t >= HITS[K.hitN]) {
        K.hitN++; G.crackLv = K.hitN; G.lunge = 0.18; const pw = K.hitN / HITS.length;
        const hx = rnd(-30, 30), hh = rnd(50, 110); G.impacts = (G.impacts || []).concat([{ x: hx, h: hh, a: rnd(0, 6) }]);
        for (let k = 0; k < 3 + K.hitN * 2; k++) { const im = this.add.image(0, 0, 'glassshard').setDepth(8); im.bsx = im.bsy = rnd(0.5, 1.1); this.parts.push({ theta: wrap(hx / R), h: hh, vt: rnd(-160, 160), vh: rnd(80, 260), life: rnd(0.5, 0.9), spr: im, rot: 0, rv: rnd(-12, 12) }); }
        this.cameras.main.shake(140 + 160 * pw, 0.004 + 0.01 * pw); Sound.sfx(K.hitN % 3 ? 'clunk' : 'crash'); buzz(30 + 40 * pw);
        if (K.hitN === 3) this.banner('THE GLASS IS GIVING WAY...');
      }
      if (K.t > 4.3) {
        K.st = 'land'; K.t = 0; e.phased = false; e.spr.setVisible(true).setAlpha(1); if (G.crackG) G.crackG.clear(); e.spr.setTexture('kingboss_b');
        e.h = 140; e.vh = 360; e.vt = dirP * 90;
        G.broken = true; G.breakout = 0; G.fall = 0.001;
        for (let k = 0; k < 40; k++) { const im = this.add.image(0, 0, 'glassshard').setDepth(8); im.bsx = im.bsy = rnd(0.7, 1.6); this.parts.push({ theta: wrap(rnd(-60, 60) / R), h: rnd(40, 140), vt: rnd(-300, 300), vh: rnd(150, 520), life: rnd(0.8, 1.4), spr: im, rot: 0, rv: rnd(-14, 14) }); }
        this.cameras.main.shake(400, 0.016); this.cameras.main.flash(200, 220, 240, 255); Sound.sfx('crash'); Sound.sfx('boom'); buzz([80, 40, 120]);
        this.banner('NOBODY AT THE WHEEL... WE\'RE GOING DOWN!');
      }
      return;
    }
    if (K.st === 'land') {                                // in the air (out of the dome, or a slam): ballistic
      e.vh -= this.gAt(e.theta) * dt; e.h += e.vh * dt; e.theta = wrap(e.theta + e.vt / R * dt);
      if (e.h <= 0 && e.vh < 0) {
        e.h = 0; e.vh = 0;
        this.kingShock(e, K.slam ? 1 : 0.6);
        K.slam = false; K.st = 'walk'; K.t = 0; K.cd = rnd(0.9, 1.4) / sp; e.spr.setTexture('kingboss_c'); K.squash = 0.35;
      }
      return;
    }
    // slides with the deck, and staggers toward Chris between attacks
    if (Math.abs(G.tilt) > 0.02) e.theta = wrap(e.theta + G.tilt * 70 / R * dt);
    if (Math.abs(angDiff(e.theta, 0)) > G.DH - 40 / R) e.theta = wrap(Math.sign(angDiff(e.theta, 0)) * (G.DH - 40 / R));   // (he holds on at the rim)
    K.squash = Math.max(0, (K.squash || 0) - dt);
    if (K.st === 'walk') {
      if (K.squash <= 0) e.spr.setTexture('kingboss');
      if (Math.abs(toP) * R > 90) e.theta = wrap(e.theta + dirP * 55 * sp / R * dt);
      e.spr.setFlipX(dirP < 0);
      if ((K.cd -= dt) <= 0) {
        const moves = ['sweep', 'toss', 'sweep', 'slam'];
        const m = moves[K.seq++ % moves.length];
        if (m === 'sweep') { K.st = 'sweep'; K.t = 0; K.high = Math.random() < 0.5; K.dir = dirP; e.spr.setTexture('kingboss_b'); Sound.sfx('charge'); this.popup(e.theta, e.h + 170, K.high ? 'DUCK!' : 'JUMP!', '#ffd23f'); }
        else if (m === 'toss') { K.st = 'toss'; K.t = 0; K.n = p2 ? 3 : 2; e.spr.setTexture('kingboss_b'); }
        else { K.st = 'slamup'; K.t = 0; e.spr.setTexture('kingboss_b'); Sound.sfx('charge'); }
      }
    } else if (K.st === 'sweep') {                        // wind-up (0.7 s), then the knot sweeps across in front of him
      const wind = 0.7 / sp;
      if (K.t > wind && !K.hit) {
        K.hit = true; Sound.sfx('whoosh'); this.cameras.main.shake(120, 0.006);
        K.swing = { t: 0, dir: K.dir, high: K.high };
        const dx = angDiff(P.theta, e.theta) * R * K.dir, low = !K.high;
        const hitLow = low && P.h < 46, hitHigh = !low && P.h + (P.duck ? 30 : 62) > 64 && P.h < 150;
        if (dx > -20 && dx < 170 && (hitLow || hitHigh) && P.invuln <= 0 && this.state === 'play') { this.hurt(); P.vx = K.dir * 320; P.vh = Math.max(P.vh, 260); }
      }
      if (K.t > wind + 0.5) { K.st = 'walk'; K.cd = rnd(1.0, 1.6) / sp; K.hit = false; }
    } else if (K.st === 'toss') {                         // plucks rats off his arm and lobs them
      if (K.t > 0.45 && K.n > 0) {
        K.t = 0.2; K.n--;
        const r = this.makeEnemy('steward', e.theta, dirP); r.h = 110; r.vh = 420; r.tossV = dirP * rnd(120, 220); this.enemies.push(r);
        Sound.sfx('squeak'); this.burst(e.theta, 110, 'spark', 4, 0.6);
      }
      if (K.n <= 0 && K.t > 0.6) { K.st = 'walk'; K.cd = rnd(1.0, 1.5) / sp; }
    } else if (K.st === 'slamup') {                       // a crouch, then a huge leap at where Chris is
      if (K.t > 0.5 / sp) { K.st = 'land'; K.slam = true; e.vh = 640; e.vt = Math.max(-260, Math.min(260, toP * R / 1.3)); e.spr.setTexture('kingboss_c'); Sound.sfx('jump'); }
    }
  },
  // the slam: a shockwave runs both ways along the deck, and the ship pitches toward it
  kingShock(e, power) {
    const G = this.sz;
    G.waves = G.waves || [];
    for (const d of [-1, 1]) G.waves.push({ theta: e.theta, dir: d, t: 0, power });
    this.cameras.main.shake(260, 0.012 * power); Sound.sfx('crash'); this.burst(e.theta, 4, 'spark', 16, 1.3); buzz(70);
    if (G.tState === 'idle' && power >= 1) { G.tState = 'over'; G.tiltDir = Math.sign(angDiff(e.theta, 0)) || 1; G.tT = 1.4; }
  },
  kingWaves(dt) {
    const G = this.sz, P = this.pl; if (!G.waves) return;
    for (let i = G.waves.length - 1; i >= 0; i--) {
      const W = G.waves[i]; W.t += dt; const px = W.dir * 300 * W.t;
      const th = wrap(W.theta + px / R);
      if (!W.hit && Math.abs(angDiff(P.theta, th)) * R < 18 && P.h < 24 && P.invuln <= 0 && this.state === 'play') { W.hit = true; this.hurt(); P.vh = 300; }
      if (Math.random() < dt * 30) this.burst(th, 4, 'spark', 1, 0.5);
      if (W.t > 2.2 || Math.abs(angDiff(th, 0)) > G.DH) G.waves.splice(i, 1);
    }
  },
  // the dive: FREE FALL (light) and PULL UP (heavy) spells, wild pitching
  saucerFall(dt) {
    const G = this.sz, P = this.pl;
    G.fall += dt;
    G.fs = G.fs || { st: 'dive', t: 3 };
    G.fs.t -= dt;
    if (G.fs.t <= 0) {
      if (G.fs.st === 'dive') { G.fs.st = Math.random() < 0.5 ? 'free' : 'pull'; G.fs.t = G.fs.st === 'free' ? rnd(2.2, 3) : rnd(1.4, 2); this.banner(G.fs.st === 'free' ? 'FREE FALL!' : 'PULL UP!'); Sound.sfx(G.fs.st === 'free' ? 'whoosh' : 'alarm'); if (G.fs.st === 'pull') this.cameras.main.shake(300, 0.01); }
      else { G.fs.st = 'dive'; G.fs.t = rnd(3, 5); }
    }
    const goalG = G.fs.st === 'free' ? 0.35 : (G.fs.st === 'pull' ? 1.55 : 1);
    this.gravMul = (this.gravMul || 1) + (goalG - (this.gravMul || 1)) * Math.min(1, dt * 4);
    if (G.fs.st === 'free' && Math.random() < dt * 6) { P.vh += 30; }                                    // lifted off the deck
    if (Math.random() < dt * 1.5) this.cameras.main.shake(80, 0.003);
  }
});
