// ===== L9 boss: THE PARMESAN COLOSSUS, redrawn (v2.94) =====
// The King's own statue, come to life - the same fat, imperious marble Rat King as the statues all over the city
// (parmart.js ppKingStatue), but ALIVE and grotesque, in the house pixel style: one enormous bloodshot eyeball rolling
// in its marble socket, the other a blank cracked stone eye; a heavy stone scowl; a long warty snout; a gaping maw of
// crooked GOLD teeth, a slab of a tongue, molten cheese dribbling out; a porphyry cape with an ermine hem; a gold-leaf
// crown, flaking; a sceptre for a walking stick; pigeon mess; a chipped ear; cracks.
// Frames: colossus (+ _w1.._w3 a lumbering walk), _s (a foot hauled up, sceptre raised: about to STOMP), _l (maw wide,
// the eye blazing: the LASER). colossus_b... the same set, wrecked: an arm gone, great glowing fissures, clusters of
// crystal bursting out at the three weak points (px 30 / 70 / 111 above the feet = colHitK's 40 / 95 / 150).
// colhead (+ colhead_o, screaming): the head on its own, phase 3. colrubble: what's left of the rest.

function makeColossus3(scene) {
  if (scene.game.__col3) return; scene.game.__col3 = true;
  const DARK = 0x1a1018, MARB = [0xf6f1e8, 0xc6beb2, 0x8a8278], MARBD = [0xc6beb2, 0x8a8278, 0x544e48], WH = [0xffffff, 0xf6f0e0, 0xc8bca8];
  const RED = [0xe0503a, 0xa82418, 0x5e0c0c], GOLD = [0xfff0a0, 0xf0b828, 0x9a6410], LAVA = [0xfff6a0, 0xffb030, 0xe0501a], CRY = [0xffffff, 0xffe89a, 0xc89438];
  const PINK = [0xe8c8c0, 0xc09a94, 0x8a6660], MOSS = 0x6a8a3a;

  const eyeball = (a, x, y, r, dx, dy, blaze) => {
    a.ell(x, y, r + 2, r + 2, DARK);
    a.ell(x, y, r, r, 0xffffff); a.ell(x + r * 0.25, y + r * 0.45, r * 0.7, r * 0.5, WH[1]); a.ell(x, y - r * 0.1, r * 0.8, r * 0.75, 0xffffff);
    for (let k = 0; k < 6; k++) { const an = 1.2 + k * 1.05, c = Math.cos(an), s = Math.sin(an); a.line([[x + c * r * 0.97, y + s * r * 0.97], [x + c * r * 0.6 + s * 1.2, y + s * r * 0.6 - c * 1.2], [x + c * r * 0.42, y + s * r * 0.42]], 0xe03a3a); }
    const px0 = x + dx * r * 0.45, py0 = y + dy * r * 0.45;
    a.ell(px0, py0, r * 0.42, r * 0.42, blaze ? LAVA : [0xff8a6a, 0xd0281e, 0x7a0e0e]); a.ell(px0, py0, r * (blaze ? 0.22 : 0.16), r * (blaze ? 0.22 : 0.16), blaze ? 0xffffff : DARK);
    a.px(Math.round(x - r * 0.4), Math.round(y - r * 0.5), 0xffffff); a.px(Math.round(x - r * 0.4) + 1, Math.round(y - r * 0.5), 0xffffff);
  };
  const crystals = (a, x, y, n, dir) => { for (let k = 0; k < n; k++) { const an = dir + (k - (n - 1) / 2) * 0.45, L = 15 + (k % 2) * 10, nx = Math.cos(an + 1.57) * 4, ny = Math.sin(an + 1.57) * 4; a.poly([[x - nx, y - ny], [x + nx, y + ny], [x + Math.cos(an) * L, y + Math.sin(an) * L]], k % 2 ? CRY : LAVA); } a.ell(x, y, 6, 6, LAVA); a.ell(x, y, 2.4, 2.4, 0xffffff); };
  const crack = (a, pts, glow) => { if (glow) { a.line(pts, LAVA[2], 3); a.line(pts, LAVA[0]); } else a.line(pts, MARBD[2]); };

  // the head, with its neck at (ox, oy): o.open 0..2 (jaw), o.blaze, o.dmg, o.look
  const head = (a, ox, oy, o) => {
    const X = x => ox + x, Y = y => oy + y, open = [4, 9, 16][o.open || 0], lk = o.look || [0.7, 0.3];
    a.ell(X(-28), Y(-34), 13, 16, MARB); a.ell(X(-28), Y(-32), 7, 10, PINK);                                           // big round rat ears: one chipped
    a.poly([[X(-40), Y(-50)], [X(-30), Y(-52)], [X(-36), Y(-42)]], -1); a.ell(X(22), Y(-46), 8, 10, MARB); a.ell(X(23), Y(-45), 4, 6, PINK);
    a.ell(X(2), Y(-22), 27, 23, MARB);
    // the crown: gold leaf flaking off, jewels, pigeon mess
    a.poly([[X(-20), Y(-40)], [X(-22), Y(-58)], [X(-12), Y(-49)], [X(-4), Y(-63)], [X(5), Y(-50)], [X(16), Y(-59)], [X(19), Y(-42)]], GOLD);
    a.rect(X(-20), Y(-44), X(19), Y(-40), GOLD[1]); a.rect(X(-20), Y(-41), X(19), Y(-40), GOLD[2]);
    for (const [x, y] of [[-22, -59], [-4, -64], [16, -60]]) a.ell(X(x), Y(y), 2.4, 2.4, GOLD);
    a.ell(X(-2), Y(-43), 2.6, 2.4, RED); a.ell(X(-13), Y(-42), 1.8, 1.8, [0x9ab8ff, 0x4a6ad8, 0x1c2870]); a.ell(X(10), Y(-43), 1.8, 1.8, [0x9ab8ff, 0x4a6ad8, 0x1c2870]);
    for (const [x, y] of [[-8, -52], [8, -47], [-16, -46]]) a.px(X(x), Y(y), MARB[1]);
    a.rect(X(2), Y(-58), X(4), Y(-52), 0xffffff); a.px(X(3), Y(-51), 0xffffff); a.px(X(5), Y(-55), 0xffffff);
    // the snout: long, warty
    a.poly([[X(14), Y(-32)], [X(44), Y(-27)], [X(58), Y(-20)], [X(46), Y(-9)], [X(14), Y(-6)]], MARB);
    a.ell(X(57), Y(-21), 6.5, 5.5, PINK); a.px(X(59), Y(-19), DARK); a.px(X(56), Y(-19), DARK); a.px(X(55), Y(-24), 0xffffff); a.ell(X(40), Y(-27), 2, 1.6, MARBD); a.ell(X(33), Y(-14), 1.6, 1.4, MARBD);
    // the maw: crooked gold teeth, a slab of tongue, molten cheese dribbling
    a.poly([[X(16), Y(-10)], [X(46), Y(-10)], [X(40), Y(-10 + open)], [X(20), Y(-11 + open)]], 0x3a0a10);
    for (const [x, w, l] of [[18, 3, 4], [24, 2, 6], [29, 3, 3], [35, 2, 5], [41, 3, 3]]) a.rect(X(x), Y(-10), X(x + w), Y(-10 + Math.min(l, open - 1)), l > 4 ? GOLD[1] : GOLD[0]);
    if (open > 6) { for (const [x, l] of [[22, 4], [32, 5], [37, 3]]) a.rect(X(x), Y(-11 + open - l), X(x + 2), Y(-11 + open), GOLD[1]); a.ell(X(31), Y(-9 + open), 7, 4, PINK); a.line([[X(27), Y(-9 + open)], [X(34), Y(-9 + open)]], PINK[2]); }
    a.line([[X(42), Y(-9 + open)], [X(42), Y(-3 + open + (o.f || 0) % 3 * 2)]], LAVA[1], 2); a.px(X(42), Y(4 + open + (o.f || 0) % 3 * 3), LAVA[0]);
    a.ell(X(8), Y(-4), 14, 8, MARB);                                                                                    // jowls
    // the eyes: one alive and rolling, one blank carved stone (cracked; glowing once he's wrecked)
    eyeball(a, X(2), Y(-27), 12, lk[0], lk[1], o.blaze);
    a.ell(X(26), Y(-25), 9, 9, DARK); a.ell(X(26), Y(-25), 7, 7, o.dmg ? LAVA : MARBD); a.line([[X(22), Y(-30)], [X(27), Y(-25)], [X(25), Y(-19)]], o.dmg ? 0xffffff : DARK);
    a.line([[X(-14), Y(-41)], [X(4), Y(-39)], [X(20), Y(-35)], [X(36), Y(-33)]], DARK, 3); a.line([[X(-14), Y(-42)], [X(4), Y(-40)], [X(20), Y(-36)]], MARBD[1]);   // the stone scowl
    for (const [y, l] of [[-16, 12], [-12, 10]]) a.line([[X(46), Y(y)], [X(46 + l), Y(y - 3 + (y + 16))]], GOLD[2]);    // whiskers: snapped gold rods
    crack(a, [[X(-10), Y(-30)], [X(-14), Y(-20)], [X(-8), Y(-12)], [X(-12), Y(-4)]], o.dmg);
    if (o.dmg) { crack(a, [[X(12), Y(-44)], [X(16), Y(-36)], [X(12), Y(-30)]], true); a.poly([[X(-26), Y(-18)], [X(-18), Y(-22)], [X(-20), Y(-10)]], -1); }
  };

  const statue = (a, o) => {
    const f = o.f || 0, by = 176, dmg = o.dmg, stomp = o.pose === 's', bob = stomp ? -2 : [0, -1, 0, -1][f], y = by + bob;
    const liftN = stomp ? 22 : [0, 8, 0, 0][f], liftF = stomp ? 0 : [0, 0, 0, 8][f];
    // the tail
    a.line([[36, y - 28], [20, y - 24], [9, y - 32], [7, y - 46], [14, y - 56]], MARB[2], 7); a.line([[36, y - 30], [20, y - 26], [10, y - 33], [8, y - 46]], MARB[1], 4);
    // the porphyry cape, an ermine hem
    a.poly([[40, y - 112], [22, y - 94], [12, y - 54], [7, by - 5], [42, by - 7], [54, y - 56]], RED);
    for (const pts of [[[30, y - 96], [22, y - 50], [18, by - 8]], [[42, y - 90], [36, y - 50], [32, by - 8]]]) a.line(pts, RED[2], 2);
    a.rect(7, by - 8, 42, by - 4, 0xffffff); for (let x = 10; x < 42; x += 6) a.rect(x, by - 7, x, by - 5, DARK);
    if (dmg) { a.poly([[10, y - 60], [20, y - 70], [18, y - 48]], -1); a.poly([[8, by - 30], [16, by - 36], [14, by - 20]], -1); }
    // the far arm (gone once he's wrecked: a jagged stump of crystal)
    if (!dmg) { a.line([[44, y - 100], [30, y - 82], [34, y - 66]], MARB[2], 12); a.line([[44, y - 101], [31, y - 83], [34, y - 68]], MARB[1], 8); a.ell(36, y - 62, 8, 8, MARB); }
    else { a.line([[44, y - 100], [36, y - 90]], MARB[2], 12); crystals(a, 34, y - 88, 3, 2.6); }
    // the far leg
    a.poly([[44, y - 40], [62, y - 40], [60, by - 6 - liftF], [46, by - 6 - liftF]], MARBD); a.ell(56, by - 4 - liftF, 14, 5, MARBD);
    // the great belly
    a.ell(62, y - 66, 36, 38, MARB);
    a.ell(74, y - 58, 20, 22, [0xffffff, 0xf6f1e8, 0xc6beb2]);
    // the near leg (hauled right up for the stomp)
    a.poly([[66, y - 38], [88, y - 38], [88, by - 6 - liftN], [70, by - 6 - liftN]], MARB); a.ell(84, by - 4 - liftN, 16, 5.5, MARB);
    for (const x of [92, 96, 99]) a.line([[x, by - 5 - liftN], [x + 3, by - 2 - liftN]], MARBD[2]);
    if (stomp) for (const [x, yy] of [[70, by - 8], [84, by - 3], [98, by - 9]]) a.px(x, yy, MARB[2]);
    // the gold belt
    a.line([[28, y - 60], [50, y - 52], [78, y - 50], [97, y - 58]], GOLD[2], 6); a.line([[28, y - 61], [50, y - 53], [78, y - 51], [97, y - 59]], GOLD[1], 3);
    a.ell(72, y - 51, 6, 6, GOLD); a.ell(72, y - 51, 2.6, 2.6, RED);
    // chest, ermine mantle
    a.ell(64, y - 100, 28, 18, MARB);
    a.ell(66, y - 108, 27, 8, WH); for (let x = 44; x < 90; x += 7) a.rect(x, y - 109, x, y - 107, DARK);
    // cracks, moss, pigeon mess
    crack(a, [[48, y - 92], [56, y - 78], [50, y - 64], [58, y - 50]], dmg); crack(a, [[84, y - 80], [78, y - 70], [84, y - 60]], dmg);
    if (dmg) { crack(a, [[40, y - 44], [52, y - 36], [48, y - 24], [56, y - 12]], true); crack(a, [[70, y - 96], [80, y - 88], [74, y - 76]], true);
      crystals(a, 92, y - 30, 3, 0.2); crystals(a, 98, y - 70, 4, -0.1); crystals(a, 90, y - 111, 3, -0.5);       // the weak points
      a.poly([[30, y - 76], [40, y - 82], [38, y - 66]], -1); }
    for (const [x, yy] of [[50, by - 5], [64, by - 3], [80, by - 2], [90, by - 4]]) a.px(x, yy, MOSS);
    a.rect(44, y - 104, 46, y - 98, 0xffffff); a.px(45, y - 96, 0xffffff);
    // the head
    head(a, 70, y - 110 + (stomp ? -1 : 0), { open: o.pose === 'l' ? 2 : stomp ? 1 : (f % 2 ? 1 : 0), blaze: o.pose === 'l', dmg, f, look: stomp ? [0.5, 0.8] : o.pose === 'l' ? [0.8, 0.5] : [0.7, 0.3] });
    // the near arm and the sceptre: a walking stick... raised like a club for the stomp
    if (stomp) { a.line([[86, y - 100], [102, y - 112], [108, y - 128]], MARB[2], 12); a.line([[86, y - 101], [102, y - 113], [108, y - 128]], MARB[1], 8); a.ell(109, y - 131, 8, 8, MARB);
      a.line([[104, y - 118], [118, y - 158]], GOLD[2], 4); a.line([[104, y - 118], [118, y - 158]], GOLD[1], 2); a.ell(119, y - 162, 6, 6, GOLD); }
    else { const sw = [0, 2, 0, -2][f];
      a.line([[86, y - 100], [102, y - 86], [108 + sw, y - 72]], MARB[2], 12); a.line([[86, y - 101], [102, y - 87], [108 + sw, y - 73]], MARB[1], 8);
      a.line([[108 + sw, y - 82], [118 + sw * 2, by - 4]], GOLD[2], 4); a.line([[108 + sw, y - 82], [118 + sw * 2, by - 4]], GOLD[1], 2); a.ell(107 + sw, y - 86, 6, 6, GOLD); a.ell(107 + sw, y - 86, 2.4, 2.4, RED);
      a.ell(109 + sw, y - 72, 8, 8, MARB); a.line([[104 + sw, y - 72], [114 + sw, y - 72]], MARBD[2]); }
  };

  for (const dmg of [0, 1]) {
    const base = dmg ? 'colossus_b' : 'colossus';
    for (let f = 0; f < 4; f++) pixSprite(scene, base + (f ? '_w' + f : ''), 132, 180, a => statue(a, { f, dmg }));
    pixSprite(scene, base + '_s', 132, 180, a => statue(a, { pose: 's', dmg }));
    pixSprite(scene, base + '_l', 132, 180, a => statue(a, { pose: 'l', dmg }));
  }
  // the head on its own: the neck a jagged break, crystals glowing in it
  for (const op of [0, 1]) pixSprite(scene, op ? 'colhead_o' : 'colhead', 96, 84, a => {
    a.poly([[18, 62], [58, 62], [52, 74], [44, 70], [38, 78], [30, 70], [22, 76]], MARBD);
    crystals(a, 30, 72, 2, 1.8); crystals(a, 46, 72, 2, 1.3);
    head(a, 38, 70, { open: op ? 2 : 0, blaze: !!op, dmg: true, look: op ? [0.6, 0.7] : [0.7, 0.3] });
  });
  // what's left of the rest: a heap of marble, the cape, a leg sticking up, the sceptre, crystals
  pixSprite(scene, 'colrubble', 132, 76, a => {
    a.poly([[6, 74], [14, 50], [40, 44], [56, 52], [50, 74]], RED); a.rect(6, 71, 50, 74, 0xffffff); for (let x = 10; x < 50; x += 6) a.rect(x, 72, x, 73, DARK);
    for (const [x, y, rx, ry] of [[34, 60, 22, 14], [70, 54, 28, 20], [102, 62, 20, 12], [56, 66, 14, 8]]) a.ell(x, y, rx, ry, MARB);
    a.poly([[80, 44], [96, 40], [98, 10], [84, 12]], MARB); a.ell(90, 9, 15, 5.5, MARB);                                // a leg, sole up
    a.line([[30, 50], [16, 14]], GOLD[2], 4); a.line([[30, 50], [16, 14]], GOLD[1], 2); a.ell(15, 10, 6, 6, GOLD);
    crack(a, [[58, 40], [66, 52], [60, 62]], true); crack(a, [[100, 54], [108, 62]], true); crystals(a, 64, 40, 3, -1.5); crystals(a, 112, 58, 2, -0.8);
    a.line([[70, 70], [84, 66], [96, 72]], MARBD[2]); for (const [x, y] of [[20, 73], [60, 74], [120, 73]]) a.px(x, y, MOSS);
  });
}
