// ===== L9 PARMESAN PRIME: the folk (v2.93: redrawn in the house style) =====
// Hard-pixel cel art like the rest of the cast (pixSprite, 3 flat tones, a dark outline) and properly GROTESQUE: huge
// mismatched bloodshot eyeballs with pin-prick pupils bulging over the tops of their heads, a heavy scowling brow, a long
// warty snout, a gaping maw of crooked yellow teeth, a lolling tongue, a string of drool, scrawny limbs, a pot belly, a
// kinked whip of a tail. Everyone has a 4-frame cycle (the legs scissor, the body bobs, the tongue flaps, the drool
// stretches and drips) plus their action frames, and their eyes POP when they're hit (ENEMY.eyes, toons.js).
//   THE IMPERIAL CITY  palace guard, grenadier, the Taxman, cavalry (a knight on a slobbering war-rat)
//   THE MINES          miner (digs up under you, pickaxe), dynamiter, runaway mine cart
//   THE CRYSTAL CORE   crystal mite, molten slug, crystal golem
// All drawn facing right (the game flips them).

function makeParmFolk2(scene) {
  if (scene.game.__ppFolk3) return; scene.game.__ppFolk3 = true;
  const DARK = 0x1a1018, WH = [0xffffff, 0xf6f0e0, 0xc8bca8], PINK = [0xffc0cc, 0xf08aa0, 0xb04a68], TOOTH = [0xfffbe0, 0xf0e090, 0xb09a40];
  const FUR = [0xc8bcb4, 0x8e7e76, 0x54443e], RED = [0xff6a4a, 0xd0281e, 0x7a0e0e], GOLD = [0xfff0a0, 0xf0b828, 0x9a6410];
  const BLUE = [0x7a9af0, 0x3a52c0, 0x1c2870], BLACK = [0x5a5868, 0x34323e, 0x18161e], STEEL = [0xeaf2ff, 0x9aa8c0, 0x4a5670];
  const DENIM = [0x8ab4dc, 0x4e78a8, 0x2a4468], KHAKI = [0xe8d498, 0xb49a58, 0x6e5a2a], RUST = [0xe08a4a, 0xa8521e, 0x5e2a0c];
  const WOOD = [0xc89058, 0x8a5a2a, 0x4e3014], PARM = [0xfff4c0, 0xf2d27a, 0xb8903a], SACK = [0xe0c890, 0xb09458, 0x6a5428];
  const CRUST = [0x7a5a4c, 0x4a322a, 0x241614], LAVA = [0xfff6a0, 0xffb030, 0xe0501a], CRY = [0xffffff, 0xffe89a, 0xc89438], CRYB = [0xffffff, 0xb8dcf8, 0x5a88b8];
  const DROOL = 0x9fe8ff;

  // a bulging cartoon eyeball: off-white, red veins creeping in from the rim, a pin-prick pupil (dx,dy: where it's looking)
  const eye = (a, x, y, r, dx, dy, o) => {
    o = o || {};
    a.ell(x, y, r + 1, r + 1, DARK);                                       // a dark socket, so it stands proud of the head
    a.ell(x, y, r, r, 0xffffff); a.ell(x + r * 0.25, y + r * 0.45, r * 0.7, r * 0.5, WH[1]); a.ell(x, y - r * 0.1, r * 0.8, r * 0.75, 0xffffff);   // white, a shaded underside
    const n = r > 5 ? 3 : (r > 3.6 ? 2 : 0);
    for (let k = 0; k < n; k++) { const an = 2.2 + k * 1.5 + (o.va || 0), c = Math.cos(an), s = Math.sin(an); a.line([[x + c * r * 0.95, y + s * r * 0.95], [x + c * r * 0.6 + s * 0.6, y + s * r * 0.6 - c * 0.6]], 0xe03a3a); }
    const pr = o.pr || Math.max(1.1, r * 0.3), px0 = x + (dx || 0) * r * 0.45, py0 = y + (dy || 0) * r * 0.45;
    if (o.iris) a.ell(px0, py0, pr + 1.2, pr + 1.2, o.iris);
    a.ell(px0, py0, pr, pr, DARK);
    a.px(Math.round(x - r * 0.4), Math.round(y - r * 0.5), 0xffffff);
  };
  const limb = (a, pts, tones, th) => { a.line(pts, tones[2], th || 3); a.line(pts.map(([x, y]) => [x, y - 0.6]), tones[1], Math.max(1, (th || 3) - 1)); };

  // ---- THE RAT. o: f (0-3 walk frame), by (feet), coat [3 tones], belly, fat, back/body/hat/face/front callbacks,
  // armB / armF (point lists), look [dx, dy], mouth 0 shut-ish / 1 gaping
  const rat = (a, o) => {
    const f = o.f || 0, by = o.by || 56, bob = [0, -1, 0, -1][f % 4], lg = [[-5, 5], [-2, 2], [5, -5], [2, -2]][f % 4], coat = o.coat || FUR, fat = o.fat || 0;
    const yb = by + bob, hy = yb - 37, look = o.look || [0.7, 0.25];
    if (o.back) o.back(a, yb);
    // the tail: a naked whip with a kink, cracking on alternate frames
    if (f % 2) { a.line([[13, yb - 13], [7, yb - 11], [3, yb - 17], [6, yb - 25], [2, yb - 30]], PINK[1], 2); a.line([[7, yb - 12], [4, yb - 17], [6, yb - 24]], PINK[0]); }
    else { a.line([[13, yb - 13], [6, yb - 13], [2, yb - 19], [4, yb - 26], [9, yb - 30]], PINK[1], 2); a.line([[6, yb - 14], [3, yb - 19], [5, yb - 25]], PINK[0]); }
    if (o.armB) limb(a, o.armB(yb), coat, 3);
    limb(a, [[19, yb - 13], [18 + lg[0] * 0.5, by - 7], [17 + lg[0], by - 3]], o.legs || coat, 3); a.ell(19 + lg[0], by - 1.5, 4.5, 2, PINK);       // back leg
    a.ell(22, yb - 22, 10 + fat, 12, coat);                                                                                                         // pot belly
    if (o.belly) a.ell(25 + fat * 0.5, yb - 19, 6 + fat, 8, o.belly);
    limb(a, [[26, yb - 12], [27 + lg[1] * 0.5, by - 7], [28 + lg[1], by - 3]], o.legs || coat, 3); a.ell(30 + lg[1], by - 1.5, 4.5, 2, PINK);       // front leg
    if (o.body) o.body(a, yb);
    // the head
    a.ell(21, hy - 9, 5, 6.5, PINK); a.ell(21, hy - 8, 2.4, 4, PINK[2]); a.px(18, hy - 14, -1); a.px(19, hy - 15, -1);                              // a ragged ear
    a.ell(31, hy, 12, 10, FUR);
    if (o.hat) o.hat(a, 31, hy);
    a.poly([[36, hy - 5], [49, hy - 2], [53, hy + 2], [49, hy + 6], [36, hy + 7]], FUR);                                                             // the snout
    a.ell(53, hy + 1, 3.2, 3, PINK); a.px(54, hy + 2, PINK[2]); a.px(51, hy - 2, PINK[2]);                                                          // a warty nose
    const open = o.mouth === 0 ? 3 : 6;
    a.poly([[37, hy + 5], [51, hy + 5], [47, hy + 5 + open], [39, hy + 4 + open]], 0x4a0a14);                                                       // the maw
    a.rect(39, hy + 5, 40, hy + 7, TOOTH[0]); a.rect(43, hy + 5, 44, hy + 8, TOOTH[1]); a.rect(47, hy + 5, 48, hy + 6, TOOTH[0]); a.px(41, hy + 5, TOOTH[2]);
    if (open > 3) { a.rect(41, hy + 8, 42, hy + 10, TOOTH[1]); a.ell(46, hy + 10 + (f % 2), 3, 2.2, PINK); a.px(46, hy + 10 + (f % 2), PINK[2]); }  // a snaggle tooth, the tongue lolling
    a.line([[48, hy + 11], [48, hy + 13 + f % 4]], DROOL); if (f % 4 === 3) a.px(48, hy + 19, DROOL);                                                // drool, stretching... dripping
    if (o.monocle) a.ell(43, hy - 5, 6, 6, GOLD);
    eye(a, 31, hy - 6, 7, look[0], look[1], { va: f * 0.4 }); eye(a, 43, hy - 5, 4.4, look[0], look[1]);
    a.line([[24, hy - 14], [35, hy - 11], [47, hy - 9]], DARK, 2);                                                                                  // a heavy scowl
    a.line([[50, hy + 3], [57, hy + 1 + (f % 2)]], FUR[2]); a.line([[50, hy + 5], [57, hy + 6 - (f % 2)]], FUR[2]);
    if (o.face) o.face(a, 31, hy);
    if (o.armF) { const pts = o.armF(yb); limb(a, pts, coat, 3); const e = pts[pts.length - 1]; a.ell(e[0], e[1], 2.6, 2.4, PINK); }
    if (o.front) o.front(a, yb);
  };
  const W4 = (key, w, h, fn, extra) => { for (let f = 0; f < 4; f++) pixSprite(scene, key + (f ? '_w' + f : ''), w, h, a => fn(a, f)); if (extra) for (const [suf, fn2] of extra) pixSprite(scene, key + suf, w, h, fn2); };

  // ======== THE IMPERIAL CITY ========
  // palace guard: a dented gold breastplate and a plumed helm jammed down over his ears, a crown-crested shield, a halberd
  W4('ppguard', 60, 62, (a, f) => rat(a, { f, by: 60, coat: RED, mouth: 0,
    back: (a, y) => { a.line([[10, y - 1], [10, y - 54]], WOOD[1], 2); a.poly([[10, y - 56], [3, y - 50], [4, y - 43], [10, y - 46]], STEEL); a.poly([[9, y - 60], [13, y - 53], [8, y - 53]], STEEL); },
    armB: y => [[18, y - 28], [13, y - 26], [11, y - 30]],
    body: (a, y) => { a.ell(22, y - 24, 8, 9, GOLD); a.line([[22, y - 32], [22, y - 16]], GOLD[2]); a.px(18, y - 27, GOLD[0]); a.px(26, y - 21, GOLD[2]); a.rect(15, y - 14, 30, y - 12, RUST[1]); },
    hat: (a, x, y) => { a.poly([[x - 12, y - 6], [x - 10, y - 14], [x - 1, y - 17], [x + 8, y - 13], [x + 10, y - 7]], GOLD); a.rect(x - 12, y - 7, x + 10, y - 6, GOLD[2]);
      a.poly([[x - 5, y - 16], [x - 13, y - 23 - (f % 2)], [x - 3, y - 27], [x + 4, y - 22], [x + 1, y - 16]], RED); },
    front: (a, y) => { a.ell(44, y - 17, 8, 13, GOLD); a.ell(44, y - 17, 6, 11, RED); a.poly([[41, y - 19], [41, y - 23], [43, y - 21], [44, y - 24], [45, y - 21], [47, y - 23], [47, y - 19]], GOLD); a.ell(44, y - 12, 1.6, 1.6, GOLD); a.px(40, y - 26, GOLD[0]); } }));
  // grenadier: a blue coat, a white cross-belt hung with bombs, a tall shako; _b: winding up with a lit bomb
  const gren = (a, f, wind) => rat(a, { f, by: 62, coat: BLUE, look: wind ? [0.8, -0.3] : undefined,
    armB: wind ? y => [[17, y - 28], [10, y - 36], [7, y - 46]] : y => [[18, y - 28], [14, y - 22], [15, y - 17]],
    armF: wind ? null : y => [[27, y - 27], [33, y - 21], [37, y - 23]],
    body: (a, y) => { a.line([[14, y - 30], [30, y - 14]], 0xffffff, 2); for (const t of [0.2, 0.5, 0.8]) a.ell(14 + 16 * t, y - 30 + 16 * t, 2.4, 2.4, STEEL); a.px(29, y - 26, GOLD[0]); a.px(29, y - 21, GOLD[0]); },
    hat: (a, x, y) => { a.poly([[x - 10, y - 7], [x - 11, y - 21], [x + 6, y - 22], [x + 8, y - 7]], BLACK); a.rect(x - 11, y - 9, x + 9, y - 7, GOLD[1]); a.ell(x - 2, y - 15, 2.2, 2.2, GOLD); a.ell(x - 2, y - 24, 2.6, 3, RED); },
    front: wind ? (a, y) => { a.ell(7, y - 50, 4.5, 4.5, STEEL); a.line([[8, y - 54], [11, y - 58]], WOOD[1]); a.px(12, y - 59, 0xffd23f); a.px(13, y - 60, 0xffffff); a.px(11, y - 61, 0xff6a1a); } : null });
  W4('ppgren', 60, 66, (a, f) => gren(a, f, false), [['_b', a => gren(a, 0, true)]]);
  pixSprite(scene, 'ppgrenade', 14, 16, a => { a.ell(6, 9, 5, 5, STEEL); a.rect(5, 3, 7, 4, GOLD[1]); a.line([[6, 3], [9, 0]], WOOD[1]); a.px(10, 0, 0xffd23f); });
  // the Taxman: fat, a black tailcoat, a gold waistcoat straining at its buttons, a top hat, a monocle screwed into the
  // little eye, hugging a fat sack of cheddar
  W4('pptax', 62, 60, (a, f) => rat(a, { f, by: 58, coat: BLACK, fat: 3, belly: GOLD, monocle: true,
    armB: y => [[16, y - 28], [10, y - 22], [9, y - 16]],
    body: (a, y) => { for (const dy of [24, 19, 14]) a.px(27, y - dy, BLACK[2]); a.line([[27, y - 20], [33, y - 18]], GOLD[0]); },
    hat: (a, x, y) => { a.rect(x - 13, y - 9, x + 9, y - 7, BLACK[1]); a.poly([[x - 9, y - 9], [x - 8, y - 24], [x + 5, y - 25], [x + 6, y - 9]], BLACK); a.rect(x - 9, y - 12, x + 6, y - 10, RED[1]); a.px(x - 6, y - 22, BLACK[0]); },
    face: (a, x, y) => { a.line([[x + 12, y + 1], [x + 12, y + 9]], GOLD[1]); },
    armF: y => [[28, y - 26], [36, y - 20], [40, y - 16]],
    front: (a, y) => { a.ell(45, y - 10, 9, 10, SACK); a.poly([[41, y - 20], [49, y - 21], [47, y - 17], [43, y - 17]], SACK); a.rect(42, y - 18, 48, y - 17, RUST[1]);
      a.ell(45, y - 9, 4, 4, GOLD); a.line([[44, y - 11], [46, y - 7]], GOLD[2]); a.ell(54, y - 2 - (f % 2) * 3, 1.8, 1.4, GOLD); a.ell(37, y - 1, 1.8, 1.4, GOLD); } }));
  // cavalry: a tin-pot knight with a lance, on a slobbering, bug-eyed, caparisoned war-rat
  W4('ppcav', 92, 66, (a, f) => {
    const by = 64, bob = [0, -1, 0, -1][f], y = by + bob, g = [[-5, 4, 5, -4], [-2, 2, 2, -2], [5, -4, -5, 4], [2, -2, -2, 2]][f];
    if (f % 2) a.line([[12, y - 20], [5, y - 22], [2, y - 30], [6, y - 36]], PINK[1], 2); else a.line([[12, y - 20], [4, y - 18], [1, y - 26], [3, y - 34]], PINK[1], 2);
    [[20, 0], [28, 1], [48, 2], [56, 3]].forEach(([x, i]) => { limb(a, [[x, y - 14], [x + g[i] * 0.5, by - 7], [x + g[i], by - 3]], FUR, 4); a.ell(x + g[i] + 2, by - 1.5, 5, 2.2, PINK); });
    a.ell(36, y - 20, 24, 11, FUR);
    a.poly([[18, y - 28], [54, y - 30], [58, y - 14], [20, y - 11]], RED); for (let x = 22; x < 56; x += 6) a.poly([[x, y - 12], [x + 3, y - 7], [x + 6, y - 12]], GOLD);
    a.ell(57, y - 36, 4.5, 6, PINK); a.ell(57, y - 35, 2.2, 3.6, PINK[2]);
    a.ell(66, y - 26, 12, 10, FUR);
    a.poly([[70, y - 31], [84, y - 28], [88, y - 23], [84, y - 19], [70, y - 18]], FUR); a.ell(88, y - 24, 3.2, 3, PINK); a.px(89, y - 23, PINK[2]);
    a.poly([[72, y - 20], [86, y - 20], [82, y - 13], [74, y - 14]], 0x4a0a14); a.rect(74, y - 20, 75, y - 18, TOOTH[0]); a.rect(78, y - 20, 79, y - 17, TOOTH[1]); a.rect(83, y - 20, 84, y - 19, TOOTH[0]); a.rect(76, y - 16, 77, y - 14, TOOTH[1]);
    a.ell(81, y - 13 + (f % 2), 3.4, 2.4, PINK); a.line([[83, y - 12], [83, y - 9 + f]], DROOL); a.line([[76, y - 13], [76, y - 11 + (f % 2) * 2]], DROOL);
    a.poly([[58, y - 34], [70, y - 37], [74, y - 31], [62, y - 28]], STEEL);                                             // a chamfron
    eye(a, 66, y - 33, 6.5, 0.7, 0.3, { va: f * 0.4 }); eye(a, 77, y - 31, 4, 0.6, 0.3); a.line([[60, y - 40], [70, y - 37], [80, y - 35]], DARK, 2);
    // the rider
    a.ell(32, y - 38, 7, 8, STEEL); a.line([[32, y - 45], [32, y - 32]], STEEL[2]);
    a.ell(36, y - 50, 6.5, 5.5, FUR); a.poly([[40, y - 53], [48, y - 50], [49, y - 47], [40, y - 46]], FUR); a.ell(49, y - 49, 1.8, 1.6, PINK);
    a.poly([[29, y - 51], [31, y - 58], [39, y - 59], [43, y - 54], [42, y - 51]], GOLD); a.poly([[35, y - 59], [31, y - 64 - (f % 2)], [38, y - 63]], RED);
    eye(a, 39, y - 51, 3.6, 0.7, 0.2); a.line([[35, y - 55], [43, y - 53]], DARK);
    a.line([[26, y - 40], [84, y - 46 + (f % 2)]], WOOD[1], 2); a.poly([[82, y - 49 + (f % 2)], [91, y - 46 + (f % 2)], [82, y - 43 + (f % 2)]], STEEL);
    a.poly([[44, y - 44], [56, y - 48 - (f % 2)], [54, y - 42]], RED); a.ell(40, y - 42, 3, 3, GOLD);
  });

  // ======== THE MINES ========
  // miner: a dented tin hat with a guttering candle, filthy dungarees, a pickaxe. _r pick raised, _b pick buried
  const miner = (a, f, pose) => rat(a, { f, by: 70, coat: DENIM, look: pose === 1 ? [0.5, -0.6] : pose === 2 ? [0.6, 0.8] : undefined,
    body: (a, y) => { a.rect(17, y - 33, 19, y - 22, DENIM[2]); a.rect(25, y - 33, 27, y - 22, DENIM[2]); a.px(18, y - 21, GOLD[1]); a.px(26, y - 21, GOLD[1]); a.px(15, y - 18, CRUST[1]); a.px(28, y - 26, CRUST[1]); a.px(21, y - 14, CRUST[0]); },
    hat: (a, x, y) => { a.poly([[x - 12, y - 6], [x - 10, y - 14], [x - 1, y - 17], [x + 8, y - 14], [x + 11, y - 6]], GOLD); a.rect(x - 14, y - 7, x + 12, y - 6, GOLD[2]); a.px(x - 6, y - 12, GOLD[2]); a.px(x - 5, y - 11, GOLD[2]);
      a.rect(x - 2, y - 21, x, y - 17, WH[1]); a.px(x - 1, y - 23 - (f % 2), 0xffd23f); a.px(x - 1, y - 22, 0xff6a1a); },
    armF: pose === 1 ? y => [[27, y - 27], [31, y - 40], [30, y - 52]] : pose === 2 ? y => [[27, y - 26], [36, y - 18], [42, y - 10]] : y => [[27, y - 27], [33, y - 22], [36, y - 26]],
    front: (a, y) => {
      if (pose === 1) { a.line([[30, y - 52], [30, y - 66]], WOOD[1], 2); a.poly([[18, y - 68], [42, y - 66], [42, y - 63], [18, y - 64]], STEEL); a.poly([[41, y - 67], [47, y - 61], [41, y - 63]], STEEL); }
      else if (pose === 2) { a.line([[42, y - 12], [46, y - 2]], WOOD[1], 2); a.poly([[38, y - 3], [56, y - 2], [56, y], [38, y]], STEEL); a.poly([[55, y - 4], [59, y], [55, y]], STEEL); for (const [x, yy] of [[50, y - 8], [58, y - 6], [53, y - 12]]) a.px(x, yy, 0xffd23f); }
      else { a.line([[36, y - 26], [22, y - 50]], WOOD[1], 2); a.poly([[12, y - 52], [32, y - 54], [32, y - 51], [12, y - 48]], STEEL); a.poly([[13, y - 53], [8, y - 46], [13, y - 49]], STEEL); } } });
  W4('ppminer', 62, 72, (a, f) => miner(a, f, 0), [['_r', a => miner(a, 0, 1)], ['_b', a => miner(a, 0, 2)]]);
  // dynamiter: a red spotted bandana, a waistcoat hung with sticks of dynamite; _b: a lit stick held high, cackling
  const dyna = (a, f, wind) => rat(a, { f, by: 70, coat: KHAKI, legs: CRUST, look: wind ? [0.3, -0.8] : undefined,
    body: (a, y) => { for (let k = 0; k < 4; k++) { a.rect(14 + k * 4, y - 30, 16 + k * 4, y - 19, RED[1]); a.px(14 + k * 4, y - 30, RED[0]); a.px(15 + k * 4, y - 32, WH[2]); } a.rect(13, y - 25, 30, y - 24, WOOD[2]); },
    hat: (a, x, y) => { a.poly([[x - 12, y - 5], [x - 6, y - 13], [x + 6, y - 12], [x + 10, y - 7]], RED); a.px(x - 5, y - 9, 0xffffff); a.px(x, y - 11, 0xffffff); a.px(x + 4, y - 9, 0xffffff); a.poly([[x - 12, y - 6], [x - 19, y - 4 - (f % 2) * 2], [x - 17, y - 1]], RED); },
    armF: wind ? y => [[27, y - 27], [30, y - 40], [31, y - 52]] : y => [[27, y - 27], [33, y - 22], [37, y - 24]],
    front: wind ? (a, y) => { a.rect(29, y - 66, 33, y - 54, RED[1]); a.rect(29, y - 66, 30, y - 54, RED[0]); a.line([[31, y - 66], [35, y - 70]], WH[2]); a.px(36, y - 71, 0xffd23f); a.px(37, y - 72, 0xffffff); a.px(35, y - 73, 0xff6a1a); a.px(38, y - 70, 0xff6a1a); } : null });
  W4('ppdyna', 60, 76, (a, f) => dyna(a, f, false), [['_b', a => dyna(a, 0, true)]]);
  pixSprite(scene, 'ppdynamite', 10, 20, a => { a.rect(2, 6, 6, 17, RED[1]); a.rect(2, 6, 3, 17, RED[0]); a.rect(2, 9, 6, 9, WH[1]); a.line([[4, 6], [7, 2]], WH[2]); a.px(8, 1, 0xffd23f); a.px(8, 0, 0xffffff); });
  // a runaway mine cart: the driver's eyes out on stalks, ears and tongue streaming back, wheels sparking
  W4('ppcart', 70, 52, (a, f) => {
    const by = 50, j = f % 2;
    a.ell(26, by - 42 + j, 4, 6, PINK); a.ell(26, by - 41 + j, 2, 3.4, PINK[2]);
    a.ell(36, by - 38 + j, 9, 8, FUR); a.poly([[40, by - 42 + j], [52, by - 39 + j], [55, by - 35 + j], [50, by - 32 + j], [40, by - 32 + j]], FUR); a.ell(55, by - 36 + j, 2.6, 2.4, PINK);
    a.poly([[40, by - 33 + j], [51, by - 33 + j], [47, by - 28 + j], [41, by - 29 + j]], 0x4a0a14); a.rect(42, by - 33 + j, 43, by - 31 + j, TOOTH[0]); a.rect(46, by - 33 + j, 47, by - 30 + j, TOOTH[1]);
    a.line([[41, by - 29 + j], [34, by - 26 - j], [28, by - 27 + j * 2]], PINK[1], 2);                                        // the tongue, streaming back
    a.ell(35, by - 43 + j, 6.2, 6.2, GOLD); a.ell(45, by - 42 + j, 4.4, 4.4, GOLD); eye(a, 35, by - 43 + j, 5, 0.7, 0.1 - j * 0.3); eye(a, 45, by - 42 + j, 3.3, 0.7, 0.1);   // goggles
    limb(a, [[38, by - 30 + j], [46, by - 30], [52, by - 28]], FUR, 3); a.ell(53, by - 28, 2.6, 2.4, PINK);
    a.poly([[6, by - 30], [62, by - 30], [56, by - 8], [12, by - 8]], RUST); a.rect(6, by - 31, 62, by - 29, RUST[0]);
    for (let x = 11; x < 60; x += 7) { a.px(x, by - 26, STEEL[0]); a.px(x + 2, by - 11, STEEL[0]); }
    a.poly([[8, by - 30], [14, by - 40 + j], [24, by - 37], [22, by - 30]], PARM); a.px(15, by - 36 + j, 0xffffff);
    for (const x of [20, 48]) { a.ell(x, by - 6, 7, 7, STEEL); const an = f * 0.8, c = Math.cos(an) * 5, s = Math.sin(an) * 5; a.line([[x - c, by - 6 - s], [x + c, by - 6 + s]], DARK); a.line([[x + s, by - 6 - c], [x - s, by - 6 + c]], DARK); a.ell(x, by - 6, 1.6, 1.6, DARK); }
    for (const [x, yy] of [[56 + j * 3, by - 2], [60, by - 6 - j * 2], [12 - j * 2, by - 3], [64 - j, by - 1]]) a.px(x, yy, j ? 0xffd23f : 0xffffff);
  });

  // ======== THE CRYSTAL CORE ========
  // crystal mite: a squat tick with a back of crystal spikes, two bug eyes, dripping fangs, six scuttling legs
  W4('ppmite', 46, 34, (a, f) => {
    const by = 32, j = f % 2;
    for (let k = 0; k < 3; k++) for (const sd of [-1, 1]) { const x = 14 + k * 7, d = ((k + (sd > 0 ? 1 : 0) + f) % 2 ? 3 : -3); a.line([[x, by - 9], [x + sd * 3 + d, by - 5], [x + sd * 5 + d, by - 1]], CRUST[2], 2); }
    a.ell(20, by - 12 - j, 14, 8, CRUST);
    for (let k = 0; k < 5; k++) { const x = 9 + k * 5, L = 7 + (k % 2) * 6 + (k === 2 ? 3 : 0); a.poly([[x - 2.5, by - 16 - j], [x + 2.5, by - 16 - j], [x + 0.5, by - 17 - L - j]], k % 2 ? CRY : CRYB); }
    a.ell(34, by - 11 - j, 7, 6, CRUST);
    eye(a, 33, by - 16 - j, 5, 0.6, 0.3, { va: f }); eye(a, 40, by - 13 - j, 3.2, 0.6, 0.3);
    a.poly([[34, by - 8 - j], [42, by - 9 - j], [40, by - 4 - j], [35, by - 5 - j]], 0x4a0a14); a.rect(36, by - 8 - j, 36, by - 6 - j, TOOTH[0]); a.rect(40, by - 8 - j, 40, by - 5 - j, TOOTH[0]);
    a.line([[38, by - 4 - j], [38, by - 2 + f % 3]], DROOL);
  });
  pixSprite(scene, 'ppshard', 10, 10, a => { a.poly([[4, 1], [8, 4], [6, 9], [1, 6]], CRY); });
  // molten slug: a fat glowing body under cracked plates of crust, bloodshot eyes on stalks, a wide dribbling mouth
  W4('ppslug', 66, 36, (a, f) => {
    const by = 34, st = [0, 2, 4, 2][f], sq = [0, 1, 2, 1][f];
    a.poly([[2 + st, by], [5 + st, by - 8], [16 + st, by - 15 - sq], [38, by - 17 - sq], [52, by - 12], [60, by - 3], [58, by]], LAVA);
    for (const [x0, x1] of [[11 + st, 22 + st * 0.5], [25, 36], [39, 49]]) a.poly([[x0, by - 11 - sq], [x0 + 2, by - 17 - sq], [x1 - 2, by - 18 - sq], [x1, by - 11 - sq]], CRUST);
    for (const x of [8 + st, 24, 40]) a.ell(x, by - 0.5, 2.4, 1.4, LAVA[0]);
    a.poly([[48, by - 8], [60, by - 7], [58, by - 2], [50, by - 2]], 0x4a0a14); for (const x of [50, 53, 56]) a.rect(x, by - 8, x, by - 6 + (x % 2), TOOTH[0]); a.line([[55, by - 2], [55, by + f % 3]], LAVA[0]);
    for (const [x, L, r] of [[50, 13, 4.6], [57, 9, 3.2]]) { const wob = (f % 2 ? 1 : -1) * (x === 50 ? 1 : -1); a.line([[x, by - 12], [x + wob, by - 12 - L]], LAVA[2], 2); eye(a, x + wob, by - 13 - L, r, 0.6, 0.5, { va: f }); }
    a.px(30, by - 6, 0xffffff); a.px(18 + st, by - 5, 0xffffff); a.px(44, by - 5, LAVA[0]);
  });
  // crystal golem: slabs of crystal round a molten heart, sunken mismatched eyes, a jagged crack for a mouth; _b: fists up
  const golem = (a, f, up) => {
    const by = 72, lean = [0, 1, 0, -1][f], bob = [0, -1, 0, -1][f], y = by + bob;
    for (const [x, d] of [[22, f === 1 ? -3 : 0], [42, f === 3 ? -3 : 0]]) a.poly([[x - 6, by], [x + 7, by], [x + 5, by - 18 - d], [x - 5, by - 18 - d]], CRYB);
    a.poly([[14 + lean, y - 16], [50 + lean, y - 16], [56 + lean, y - 40], [46 + lean, y - 54], [20 + lean, y - 54], [9 + lean, y - 40]], CRY);
    for (const [x, yy, an, L] of [[16, y - 50, -2.2, 13], [22, y - 54, -1.9, 17], [44, y - 54, -1.2, 15], [50, y - 48, -0.9, 11]]) { const nx = Math.cos(an + 1.57) * 3, ny = Math.sin(an + 1.57) * 3; a.poly([[x + lean - nx, yy - ny], [x + lean + nx, yy + ny], [x + lean + Math.cos(an) * L, yy + Math.sin(an) * L]], L > 13 ? CRYB : CRY); }
    a.line([[20 + lean, y - 50], [26 + lean, y - 40], [23 + lean, y - 28]], LAVA[1]); a.line([[44 + lean, y - 48], [39 + lean, y - 40], [46 + lean, y - 26]], LAVA[1]);
    a.ell(32 + lean, y - 34, 6, 6, LAVA); a.ell(32 + lean, y - 34, 2.6, 2.6, 0xffffff);
    a.poly([[21 + lean, y - 54], [43 + lean, y - 54], [45 + lean, y - 66], [33 + lean, y - 72], [20 + lean, y - 66]], CRYB);
    eye(a, 27 + lean, y - 63, 5.5, 0.6, 0.3, { iris: LAVA[1] }); eye(a, 39 + lean, y - 61, 3.4, 0.6, 0.3, { iris: LAVA[1] });
    a.line([[20 + lean, y - 70], [32 + lean, y - 66], [44 + lean, y - 65]], DARK, 2);
    a.poly([[24 + lean, y - 57], [42 + lean, y - 57], [40 + lean, y - 51], [26 + lean, y - 52]], 0x4a0a14); for (const x of [26, 30, 34, 38]) a.poly([[x + lean, y - 57], [x + 3 + lean, y - 57], [x + 1.5 + lean, y - 53]], CRY);   // a maw of crystal fangs
    for (const [x, sd] of [[9, -1], [55, 1]]) {
      const fy = up ? y - 70 : y - 22 + (sd > 0 ? lean * 2 : -lean * 2), ex = x + sd * 4 + lean;
      a.poly([[x - 4 + lean, y - 48], [x + 4 + lean, y - 50], [ex + 4, fy + 8], [ex - 4, fy + 10]], CRY);
      a.poly([[ex - 8, fy - 2], [ex + 8, fy - 4], [ex + 9, fy + 10], [ex - 8, fy + 11]], CRYB);
    }
  };
  W4('ppgolem', 66, 76, (a, f) => golem(a, f, false), [['_b', a => golem(a, 0, true)]]);
}

Object.assign(ENEMY, {
  ppguard: { hp: 9, r: 18, ch: 26, tex: 'ppguard', oy: 0.97, drop: 0.4, ai: 'ppguard', k: 1.2, frames: ['ppguard', 'ppguard_w1', 'ppguard_w2', 'ppguard_w3'], eyes: [[31, 17, 7], [43, 18, 4.4]] },
  ppgren:  { hp: 5, r: 15, ch: 22, tex: 'ppgren',  oy: 0.97, drop: 0.35, ai: 'ppgren', k: 1.15, frames: ['ppgren', 'ppgren_w1', 'ppgren_w2', 'ppgren_w3'], eyes: [[31, 19, 7], [43, 20, 4.4]] },
  pptax:   { hp: 6, r: 17, ch: 22, tex: 'pptax',   oy: 0.97, drop: 0.2, ai: 'pptax', k: 1.2, frames: ['pptax', 'pptax_w1', 'pptax_w2', 'pptax_w3'], eyes: [[31, 15, 7], [43, 16, 4.4]] },
  ppcav:   { hp: 7, r: 26, ch: 22, tex: 'ppcav',   oy: 0.97, drop: 0.4, ai: 'ppcav', k: 1.15, frames: ['ppcav', 'ppcav_w1', 'ppcav_w2', 'ppcav_w3'], eyes: [[66, 31, 6.5], [77, 33, 4]] },
  ppminer: { hp: 6, r: 17, ch: 24, tex: 'ppminer', oy: 0.97, drop: 0.35, ai: 'ppminer', k: 1.15, frames: ['ppminer', 'ppminer_w1', 'ppminer_w2', 'ppminer_w3'], eyes: [[31, 27, 7], [43, 28, 4.4]] },
  ppdyna:  { hp: 5, r: 15, ch: 23, tex: 'ppdyna',  oy: 0.97, drop: 0.35, ai: 'ppdyna', k: 1.15, frames: ['ppdyna', 'ppdyna_w1', 'ppdyna_w2', 'ppdyna_w3'], eyes: [[31, 27, 7], [43, 28, 4.4]] },
  ppcart:  { hp: 8, r: 26, ch: 20, tex: 'ppcart',  oy: 0.97, drop: 0.5, ai: 'ppcart', k: 1.2, frames: ['ppcart', 'ppcart_w1', 'ppcart_w2', 'ppcart_w3'], fps: 14, eyes: [[35, 7, 5], [45, 8, 3.3]] },
  ppmite:  { hp: 3, r: 14, ch: 11, tex: 'ppmite',  oy: 0.95, drop: 0.2, ai: 'ppmite', k: 1.15, frames: ['ppmite', 'ppmite_w1', 'ppmite_w2', 'ppmite_w3'], fps: 14, eyes: [[33, 16, 5], [40, 19, 3.2]] },
  ppslug:  { hp: 7, r: 22, ch: 13, tex: 'ppslug',  oy: 0.95, drop: 0.3, ai: 'ppslug', k: 1.2, frames: ['ppslug', 'ppslug_w1', 'ppslug_w2', 'ppslug_w3'], fps: 5, eyes: [[49, 8, 4.6], [58, 12, 3.2]] },
  ppgolem: { hp: 18, r: 26, ch: 40, tex: 'ppgolem', oy: 0.98, drop: 0.6, ai: 'ppgolem', k: 1.2, big: true, frames: ['ppgolem', 'ppgolem_w1', 'ppgolem_w2', 'ppgolem_w3'] },
});
