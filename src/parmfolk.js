// ===== L9 PARMESAN PRIME: the folk, sculpted (v2.91) =====
// Every enemy on Parmesan Prime repainted with ppSculpt (parmart.js) at 1.5x density, and a crowd for each layer:
//   THE IMPERIAL CITY  palace guards (shield + halberd), grenadiers, the Taxman, cavalry (a knight on a war-rat)
//   THE MINES          miners (dig up under you with a pickaxe), dynamiters (lit sticks that blow a hole in the ground),
//                      runaway mine carts (charge round the planet - jump them)
//   THE CRYSTAL CORE   crystal mites (scuttle, burst into shards), molten slugs (leave a burning trail), crystal golems
//                      (rise out of the crystal, slam the ground: a shockwave to jump)
// All drawn facing right (the game flips them).

const PPF = {
  FUR: [0xddd2ca, 0xaa9a92, 0x7a6a62, 0x4a3c38, 0x241c1a],
  PINK: [0xffd8e0, 0xf09aaa, 0xc86a80, 0x8a3a52, 0x4a1a2a],
  RED: [0xff8a6a, 0xe0302a, 0xa01818, 0x600c0c, 0x300404],
  BLUE: [0x9ab8ff, 0x4a6ad8, 0x2a40a0, 0x18246a, 0x0c1240],
  BLACK: [0x6a6878, 0x46444e, 0x2c2a34, 0x1c1a22, 0x0e0c12],
  DENIM: [0x9ac0e0, 0x6a90b8, 0x46648a, 0x2c405a, 0x161e2e],
  KHAKI: [0xe8d8a8, 0xc0aa70, 0x8a7a48, 0x5a4e2a, 0x2e2814],
  ROACH: [0xd0905a, 0xa0602e, 0x704018, 0x46260c, 0x221206],
  LAVA: [0xfff6c0, 0xffd860, 0xffa030, 0xe8601a, 0xa8300a],
  CRUST: [0x8a6a5a, 0x5a4038, 0x3a2622, 0x241614, 0x120a08],
  CRY: [0xffffff, 0xfff6d0, 0xffe08a, 0xd8a440, 0x8a5a18],
  CRYB: [0xffffff, 0xe8f4ff, 0xb8d8f4, 0x7aa0c8, 0x3a5a84],
};

function makeParmFolk2(scene) {
  if (scene.game.__ppFolk2 || typeof ppSculpt !== 'function') return; scene.game.__ppFolk2 = true;
  const P = PPR, F = PPF, INK = P.INK, S = 1.5;
  const pal = [].concat(P.MARB, P.GOLD, P.RUST, P.STEEL.slice(1), P.PARM, F.FUR, F.PINK, F.RED, F.BLUE, F.BLACK, F.DENIM, F.KHAKI, F.ROACH, F.LAVA, F.CRUST, F.CRY, F.CRYB, [INK, 0xffffff, 0xff2a1a, 0x7dff8a]);
  const O = { pal };
  const sculpt = (key, w, h, draw) => ppSculpt(scene, key, Math.round(w * S), Math.round(h * S), S, draw, O);

  // ---- a rat, facing right, feet on y = by. o: coat ramp, ph (walk phase 0/1), armB/armF (point lists for the arms,
  // drawn behind/in front of the body), fat (belly), noHead
  const rat = (H, o) => {
    const by = o.by || 58, ph = o.ph || 0, coat = o.coat || F.FUR, fat = o.fat || 0;
    H.ink = INK;
    H.tube([[16, by - 14], [6, by - 18], [2, by - 28], [6, by - 34]], 3.4, 1.2, F.PINK);                       // tail
    if (o.armB) H.tube(o.armB, 6, 5, o.sleeve || coat);
    H.tube([[22, by - 14], [20 - ph * 2, by - 6], [17 - ph * 4, by - 1]], 7, 5.5, o.legs || coat); H.ell(17 - ph * 4 + 2, by - 1, 5, 2.4, F.PINK, 'round');   // back leg
    H.shape([[18, by - 12], [15 - fat, by - 26], [21, by - 38], [33, by - 40], [40 + fat, by - 30], [40 + fat * 0.6, by - 14], [30, by - 10]], coat, 'round');   // the body
    H.tube([[31, by - 14], [33 + ph * 2, by - 6], [36 + ph * 4, by - 1]], 7, 5.5, o.legs || coat); H.ell(36 + ph * 4 + 2, by - 1, 5, 2.4, F.PINK, 'round');   // front leg
    if (o.body) o.body(H, by);
    if (!o.noHead) {
      const hx = 37, hy = by - 44;
      H.ell(hx - 9, hy - 8, 4.6, 5.6, F.PINK, 'round', -0.3); H.ell(hx - 9, hy - 7.5, 2.4, 3.2, F.PINK[2]);    // ear
      H.ell(hx - 3, hy, 9.5, 8.5, F.FUR, 'round');
      H.shape([[hx, hy - 6], [hx + 11, hy - 2], [hx + 16, hy + 2], [hx + 11, hy + 6], [hx + 1, hy + 7]], F.FUR, 'round');   // snout
      H.ell(hx + 16, hy + 1.5, 2.2, 2, F.PINK, 'round');
      H.ell(hx + 2, hy - 2, 2, 1.8, INK); H.ell(hx + 2.6, hy - 2.6, 0.8, 0.8, 0xff2a1a);                          // a beady red eye
      H.line([[hx + 3, hy - 5], [hx + 6, hy - 4.2]], INK, 0.9);                                                    // a mean brow
      H.shape([[hx + 9, hy + 6], [hx + 12, hy + 6], [hx + 11.5, hy + 10], [hx + 9.5, hy + 10]], 0xfff8e0, 'flat');   // buck teeth
      for (const dy of [0, 2.5]) H.line([[hx + 12, hy + 3 + dy], [hx + 20, hy + 1 + dy * 1.6]], F.FUR[3], 0.5);
      if (o.hat) o.hat(H, hx, hy);
    }
    if (o.armF) { H.tube(o.armF, 6, 5, o.sleeve || coat); const e = o.armF[o.armF.length - 1]; H.ell(e[0], e[1], 3.2, 3, F.PINK, 'round'); }
    if (o.front) o.front(H, by);
  };

  // ======== THE IMPERIAL CITY ========
  // palace guard: gold breastplate over a red tabard, a plumed helmet, a great gold-rimmed shield, a halberd
  for (const f of [0, 1]) sculpt('ppguard' + (f ? '_b' : ''), 56, 62, H => rat(H, { by: 60, ph: f, coat: F.RED,
    armB: [[24, 26], [16, 30], [14, 36]],
    body: (H, by) => { H.shape([[20, by - 36], [34, by - 38], [39, by - 28], [36, by - 20], [22, by - 20], [18, by - 28]], P.GOLD, 'round'); H.line([[28, by - 36], [28, by - 21]], P.GOLD[3], 0.8); H.shape([[20, by - 20], [38, by - 20], [37, by - 14], [21, by - 14]], P.RUST, 'down'); },
    hat: (H, x, y) => { H.shape([[x - 12, y - 4], [x - 10, y - 12], [x - 2, y - 15], [x + 6, y - 11], [x + 7, y - 4]], P.GOLD, 'round'); H.shape([[x - 6, y - 14], [x - 14, y - 22], [x - 2, y - 26], [x + 4, y - 20], [x - 1, y - 14]], F.RED, 'round'); H.line([[x - 11, y - 4], [x + 7, y - 4]], P.GOLD[3], 1.4); },
    front: (H, by) => {
      H.line([[14, by - 2], [14, by - 58]], P.RUST[2], 2); H.shape([[14, by - 58], [8, by - 52], [8, by - 46], [14, by - 48]], P.STEEL, 'cyl'); H.shape([[14, by - 62], [16, by - 56], [12, by - 56]], P.STEEL, 'cyl');   // the halberd, held upright behind
      H.shape([[38, by - 44], [50, by - 40], [53, by - 26], [48, by - 12], [40, by - 10], [36, by - 26]], P.GOLD, 'round'); H.shape([[40, by - 40], [48, by - 37], [50, by - 26], [46, by - 15], [41, by - 14], [39, by - 26]], F.RED, 'round');
      H.shape([[41, by - 30], [41, by - 34], [43, by - 32], [45, by - 36], [47, by - 32], [49, by - 34], [49, by - 30]], P.GOLD, 'round'); H.ell(45, by - 22, 2, 2, P.GOLD, 'round');
    } }));
  // grenadier: a blue coat, a white cross-belt of bombs, a tall shako; _b: arm back, a lit bomb in his fist
  for (const f of [0, 1]) sculpt('ppgren' + (f ? '_b' : ''), 50, 66, H => rat(H, { by: 64, coat: F.BLUE,
    armB: f ? [[24, 32], [16, 24], [12, 14]] : [[24, 34], [20, 40], [22, 46]],
    armF: f ? null : [[34, 32], [40, 38], [44, 36]],
    body: (H, by) => { H.line([[20, by - 36], [38, by - 16]], 0xffffff, 3); for (const t of [0.2, 0.45, 0.7]) H.ell(20 + 18 * t, by - 36 + 20 * t, 2.6, 2.6, P.STEEL, 'round'); for (const y of [by - 32, by - 26, by - 20]) H.ell(38, y, 1, 1, P.GOLD[1]); },
    hat: (H, x, y) => { H.shape([[x - 11, y - 4], [x - 12, y - 18], [x + 2, y - 19], [x + 4, y - 4]], F.BLACK, 'cyl'); H.shape([[x - 12, y - 6], [x + 6, y - 6], [x + 6, y - 3], [x - 12, y - 3]], P.GOLD, 'down'); H.ell(x - 4, y - 19, 2.4, 3, F.RED, 'round'); H.ell(x - 4, y - 11, 2.2, 2.2, P.GOLD, 'round'); },
    front: f ? (H) => { H.ell(12, 12, 4.5, 4.5, P.STEEL, 'round'); H.line([[13, 8], [16, 5]], P.RUST[1], 1); H.ell(16.5, 4.5, 1.6, 1.6, 0xffd23f); } : null }));
  ppSculpt(scene, 'ppgrenade', 21, 24, S, H => { H.ink = INK; H.ell(7, 10, 6, 6, P.STEEL, 'round'); H.shape([[5, 3], [9, 3], [9, 5], [5, 5]], P.GOLD, 'down'); H.line([[7, 3], [10, 0]], P.RUST[1], 1); H.ell(10.5, 0.5, 1.4, 1.4, 0xffd23f); }, O);
  // the Taxman: fat, a black tailcoat, a gold waistcoat, a top hat and a monocle, clutching a fat money sack
  for (const f of [0, 1]) sculpt('pptax' + (f ? '_b' : ''), 54, 58, H => rat(H, { by: 56, ph: f, coat: F.BLACK, fat: 4,
    armB: [[22, 26], [14, 32], [12, 38]],
    body: (H, by) => { H.shape([[24, by - 36], [36, by - 36], [42, by - 26], [38, by - 16], [26, by - 16]], P.GOLD, 'round'); for (const y of [by - 32, by - 26, by - 20]) H.ell(33, y, 1, 1, F.BLACK[3]); H.line([[33, by - 26], [41, by - 24]], P.GOLD[0], 0.8); },
    hat: (H, x, y) => { H.shape([[x - 13, y - 5], [x + 5, y - 7], [x + 5, y - 4], [x - 13, y - 2]], F.BLACK, 'down'); H.shape([[x - 9, y - 6], [x - 8, y - 22], [x + 2, y - 23], [x + 2, y - 6]], F.BLACK, 'cyl'); H.shape([[x - 9, y - 9], [x + 2, y - 10], [x + 2, y - 7], [x - 9, y - 6]], F.RED, 'down');
      H.ell(x + 2, y - 2, 3.2, 3.2, 0xffffff); H.ell(x + 2, y - 2, 3.2, 3.2, P.GOLD[2], null); H.ell(x + 2, y - 2, 2.2, 2.2, 0xe8f4ff); H.line([[x + 2, y + 1], [x + 2, y + 8]], P.GOLD[1], 0.6); },
    armF: [[34, 26], [42, 32], [46, 36]],
    front: (H, by) => { H.shape([[40, by - 22], [52, by - 24], [56, by - 10], [50, by - 2], [40, by - 4], [37, by - 12]], F.KHAKI, 'round'); H.shape([[43, by - 24], [49, by - 25], [47, by - 21]], F.KHAKI[3], 'flat'); H.line([[42, by - 21], [50, by - 22]], P.RUST[2], 1.2);
      H.ell(47, by - 12, 4, 4, P.GOLD, 'round'); H.line([[46, by - 14], [48, by - 10]], P.GOLD[3], 0.9); for (const [x, y] of [[54, by - 4], [38, by - 2]]) H.ell(x, y, 1.8, 1.4, P.GOLD, 'round'); } }));
  // cavalry: a knight in a gold helm with a lance, on an armoured war-rat (snarling, a red caparison)
  for (const f of [0, 1]) sculpt('ppcav' + (f ? '_b' : ''), 104, 84, H => {
    H.ink = INK; const by = 82;
    H.tube([[12, by - 22], [4, by - 26], [0, by - 36]], 4, 1.4, F.PINK);
    for (const [x, d] of [[18, f ? -4 : 4], [26, f ? 4 : -4], [52, f ? 4 : -4], [60, f ? -4 : 4]]) { H.tube([[x, by - 18], [x + d * 0.5, by - 9], [x + d, by - 1]], 7, 5.5, F.FUR); H.ell(x + d + 2, by - 1, 4.5, 2.2, F.PINK, 'round'); }
    H.shape([[12, by - 18], [14, by - 32], [30, by - 38], [54, by - 38], [66, by - 30], [66, by - 18], [40, by - 12]], F.FUR, 'round');
    H.shape([[20, by - 34], [56, by - 36], [60, by - 20], [22, by - 16]], F.RED, 'round'); for (let x = 24; x < 58; x += 6) H.shape([[x, by - 18], [x + 3, by - 12], [x + 6, by - 18]], P.GOLD, 'round');
    H.ell(72, by - 32, 9, 8, F.FUR, 'round'); H.shape([[74, by - 38], [84, by - 34], [86, by - 30], [80, by - 26], [72, by - 26]], F.FUR, 'round'); H.ell(86, by - 31, 2, 2, F.PINK, 'round');
    H.shape([[76, by - 26], [84, by - 27], [80, by - 23]], 0x3a0a10, 'flat'); H.shape([[80, by - 27], [82, by - 27], [81, by - 24]], 0xffffff, 'flat'); H.ell(76, by - 35, 1.8, 1.6, 0xff2a1a);
    H.shape([[64, by - 40], [74, by - 42], [78, by - 36], [70, by - 30], [64, by - 32]], P.STEEL, 'round'); H.ell(66, by - 42, 3.6, 4.6, F.PINK, 'round');
    // the rider
    H.shape([[30, by - 38], [32, by - 54], [42, by - 58], [48, by - 50], [46, by - 38]], P.STEEL, 'round'); H.line([[38, by - 56], [40, by - 38]], P.STEEL[3], 0.8);
    H.ell(44, by - 62, 7, 6.5, F.FUR, 'round'); H.shape([[46, by - 66], [54, by - 63], [56, by - 60], [48, by - 58]], F.FUR, 'round'); H.ell(48, by - 63, 1.4, 1.4, 0xff2a1a);
    H.shape([[37, by - 64], [38, by - 72], [46, by - 74], [51, by - 68], [50, by - 62]], P.GOLD, 'round'); H.shape([[44, by - 74], [40, by - 80], [46, by - 78]], F.RED, 'round');
    H.line([[34, by - 46], [96, by - 50 + (f ? 2 : 0)]], P.RUST[1], 2.4); H.shape([[92, by - 52], [102, by - 50], [92, by - 47]], P.STEEL, 'cyl'); H.shape([[46, by - 50], [52, by - 52], [52, by - 44], [46, by - 44]], P.GOLD, 'round');
    H.shape([[56, by - 52], [68, by - 56], [66, by - 50]], F.RED, 'round');                                                // a pennant
  });

  // ======== THE MINES ========
  // miner: a dented hard hat with a candle, filthy dungarees, a pickaxe (raised; _b swung down)
  for (const f of [0, 1]) sculpt('ppminer' + (f ? '_b' : ''), 58, 72, H => rat(H, { by: 70, coat: F.DENIM, legs: F.DENIM,
    body: (H, by) => { H.shape([[22, by - 38], [26, by - 38], [28, by - 26], [24, by - 26]], F.DENIM[3], 'flat'); H.ell(34, by - 34, 1.6, 1.6, P.GOLD, 'round'); H.flecks(16, by - 40, 40, by - 10, 14, F.CRUST[2], 1.2); },
    hat: (H, x, y) => { H.shape([[x - 13, y - 4], [x - 11, y - 13], [x - 2, y - 16], [x + 6, y - 12], [x + 8, y - 4]], P.GOLD, 'round'); H.shape([[x - 14, y - 5], [x + 9, y - 5], [x + 9, y - 2], [x - 14, y - 2]], P.GOLD, 'down');
      H.shape([[x - 4, y - 16], [x - 1, y - 16], [x - 1, y - 22], [x - 4, y - 22]], P.MARB, 'cyl'); H.ell(x - 2.5, y - 25, 2, 3, F.LAVA, 'round'); H.crack(x - 6, y - 12, 6, 0.4); },
    armF: f ? [[34, 36], [42, 44], [46, 54]] : [[34, 36], [40, 28], [42, 20]],
    front: (H, by) => { if (f) { H.line([[46, by - 16], [46, by - 2]], P.RUST[2], 2.4); H.shape([[38, by - 4], [56, by - 2], [56, by + 1], [38, by + 1]], P.STEEL, 'down'); H.shape([[54, by - 4], [60, by + 1], [54, by + 1]], P.STEEL, 'cyl'); }
      else { H.line([[42, by - 50], [40, by - 64]], P.RUST[2], 2.4); H.shape([[30, by - 66], [52, by - 62], [52, by - 60], [30, by - 63]], P.STEEL, 'down'); H.shape([[50, by - 63], [56, by - 58], [50, by - 60]], P.STEEL, 'cyl'); } } }));
  // dynamiter: a red bandana, a vest strung with sticks of dynamite; _b: a lit stick held high
  for (const f of [0, 1]) sculpt('ppdyna' + (f ? '_b' : ''), 50, 80, H => rat(H, { by: 78, ph: f && 0, coat: F.KHAKI, legs: F.CRUST,
    body: (H, by) => { for (let k = 0; k < 4; k++) { H.shape([[20 + k * 5, by - 34], [24 + k * 5, by - 34], [24 + k * 5, by - 22], [20 + k * 5, by - 22]], F.RED, 'cyl'); H.line([[22 + k * 5, by - 34], [22 + k * 5, by - 36]], P.MARB[3], 0.6); } },
    hat: (H, x, y) => { H.shape([[x - 12, y - 6], [x - 4, y - 12], [x + 6, y - 9], [x + 6, y - 5], [x - 10, y - 2]], F.RED, 'round'); for (const [dx, dy] of [[-6, -7], [0, -8], [3, -6]]) H.ell(x + dx, y + dy, 0.9, 0.9, 0xffffff); H.shape([[x - 12, y - 4], [x - 20, y - 2], [x - 18, y + 2]], F.RED, 'round'); },
    armF: f ? [[34, 44], [38, 34], [40, 24]] : [[34, 44], [40, 50], [44, 48]],
    front: (H, by) => { if (f) { H.shape([[38, by - 56], [43, by - 56], [43, by - 70], [38, by - 70]], F.RED, 'cyl'); H.line([[40.5, by - 70], [44, by - 75]], P.MARB[3], 0.8); H.ell(44, by - 76, 2.2, 2.2, 0xffd23f); H.ell(44, by - 76, 1, 1, 0xffffff); } } }));
  ppSculpt(scene, 'ppdynamite', 15, 30, S, H => { H.ink = INK; H.shape([[2, 6], [8, 6], [8, 19], [2, 19]], F.RED, 'cyl'); H.line([[2, 9], [8, 9]], P.MARB[1], 0.8); H.line([[5, 6], [8, 2]], P.MARB[3], 0.8); H.ell(8.5, 1.6, 1.6, 1.6, 0xffd23f); }, O);
  // a runaway mine cart: a rat driver, wild-eyed in goggles, heaped cheese, sparking wheels
  for (const f of [0, 1]) sculpt('ppcart' + (f ? '_b' : ''), 64, 50, H => {
    H.ink = INK; const by = 48;
    H.ell(34, by - 40, 7, 6.5, F.FUR, 'round'); H.shape([[36, by - 44], [46, by - 41], [48, by - 37], [38, by - 35]], F.FUR, 'round'); H.ell(28, by - 46, 3.6, 4.6, F.PINK, 'round');
    H.ell(38, by - 42, 3, 3, P.GOLD, 'round'); H.ell(38, by - 42, 2, 2, 0x7dff8a); H.line([[28, by - 43], [36, by - 42]], INK, 1.2);
    H.shape([[40, by - 38], [44, by - 36], [42, by - 34]], 0xfff8e0, 'flat');
    H.tube([[36, by - 34], [46, by - 36], [52, by - 30]], 5, 4, F.FUR);                                            // hanging on to the rim
    H.shape([[6, by - 32], [58, by - 32], [52, by - 8], [12, by - 8]], P.RUST, 'cyl');
    for (let x = 10; x < 56; x += 7) { H.ell(x, by - 29, 1, 1, P.STEEL[1]); H.ell(x + 2, by - 11, 1, 1, P.STEEL[1]); }
    H.shape([[8, by - 30], [16, by - 40], [24, by - 36], [20, by - 30]], P.PARM, 'round');
    for (const x of [18, 46]) { H.ell(x, by - 6, 7, 7, P.STEEL, 'round'); H.line([[x - 5 * Math.cos(f), by - 6 - 5 * Math.sin(f)], [x + 5 * Math.cos(f), by - 6 + 5 * Math.sin(f)]], INK, 1.2); H.ell(x, by - 6, 2, 2, INK); }
    if (f) for (const [x, y] of [[54, by - 2], [58, by - 6], [10, by - 3]]) H.ell(x, y, 1.3, 1.3, 0xffd23f);
  });

  // ======== THE CRYSTAL CORE ========
  // crystal mite: a squat chitin tick, a back bristling with crystal spikes, six legs
  for (const f of [0, 1]) sculpt('ppmite' + (f ? '_b' : ''), 42, 32, H => {
    H.ink = INK; const by = 30;
    for (let k = 0; k < 3; k++) for (const sd of [-1, 1]) { const x = 14 + k * 8, d = ((k + (sd > 0 ? 1 : 0) + f) % 2 ? 3 : -3); H.tube([[x, by - 10], [x + sd * 3 + d, by - 6], [x + sd * 5 + d, by]], 2.6, 1.6, F.CRUST); }
    H.ell(21, by - 12, 15, 9, F.CRUST, 'round');
    for (let k = 0; k < 5; k++) { const x = 10 + k * 5, L = 8 + (k % 2) * 6; H.poly([[x - 2.5, by - 16], [x + 2.5, by - 16], [x + 1, by - 16 - L], [x - 1.5, by - 16 - L + 2]], k % 2 ? F.CRY : F.CRYB, 'cyl'); }
    H.ell(36, by - 12, 6, 5, F.CRUST, 'round'); H.ell(39, by - 13, 1.8, 1.8, 0xff2a1a); H.ell(37, by - 15, 1.4, 1.4, 0xff2a1a);
    H.line([[41, by - 9], [44, by - 6]], F.CRUST[3], 1.2); H.line([[40, by - 8], [42, by - 4]], F.CRUST[3], 1.2);
  });
  ppSculpt(scene, 'ppshard', 15, 15, S, H => { H.ink = INK; H.poly([[5, 1], [9, 4], [7, 9], [2, 7]], F.CRY, 'cyl'); }, O);
  // molten slug: a fat glowing body under a cracked crust, eye-stalks, dripping
  for (const f of [0, 1]) sculpt('ppslug' + (f ? '_b' : ''), 60, 32, H => {
    H.ink = INK; const by = 30, s2 = f ? 2 : 0;
    H.shape([[2, by], [6, by - 8], [18 - s2, by - 16], [38, by - 18], [52, by - 12], [58, by - 2], [56, by]], F.LAVA, 'round');
    for (const [x0, x1] of [[10, 22], [24, 36], [38, 50]]) H.shape([[x0, by - 12], [x0 + 2, by - 17 + (x0 === 24 ? -1 : 0)], [x1 - 2, by - 17], [x1, by - 11]], F.CRUST, 'round');
    for (const x of [50, 54]) { H.line([[x, by - 12], [x + 3, by - 24 - (x - 50)]], F.LAVA[3], 1.6); H.ell(x + 3, by - 25 - (x - 50), 2.4, 2.4, F.LAVA[0]); H.ell(x + 3.5, by - 25 - (x - 50), 1, 1, INK); }
    for (const x of [8, 26, 44]) H.ell(x + s2, by + 0.5, 2, 1.5, F.LAVA[1]);
    H.flecks(4, by - 14, 56, by, 10, 0xfff6c0, 0.8);
  });
  // crystal golem: a hulk of crystal slabs round a glowing heart, big fists (_b: raised to slam)
  for (const f of [0, 1]) sculpt('ppgolem' + (f ? '_b' : ''), 66, 74, H => {
    H.ink = INK; const by = 72;
    for (const x of [22, 40]) H.poly([[x - 6, by], [x + 6, by], [x + 5, by - 18], [x - 5, by - 18]], F.CRYB, 'cyl');
    H.poly([[14, by - 16], [48, by - 16], [54, by - 40], [44, by - 54], [20, by - 54], [10, by - 40]], F.CRY, 'cyl');
    for (const [a, b] of [[[20, by - 54], [26, by - 30]], [[44, by - 54], [36, by - 34]], [[14, by - 30], [30, by - 22]]]) H.line([a, b], F.CRY[3], 0.9);
    for (const [x, y, a, L] of [[16, by - 50, -2.2, 14], [22, by - 54, -1.9, 18], [42, by - 54, -1.2, 16], [48, by - 48, -0.9, 12], [12, by - 40, -2.6, 10]]) { const nx = Math.cos(a + 1.57) * 3, ny = Math.sin(a + 1.57) * 3; H.poly([[x - nx, y - ny], [x + nx, y + ny], [x + Math.cos(a) * L, y + Math.sin(a) * L]], L > 14 ? F.CRYB : F.CRY, 'cyl'); }
    for (const pts of [[[18, by - 48], [24, by - 40], [22, by - 30]], [[42, by - 46], [38, by - 40], [44, by - 28]]]) { H.line(pts, F.LAVA[2], 1.6); H.line(pts, F.LAVA[0], 0.6); }
    H.ell(31, by - 36, 6, 6, F.LAVA, 'round'); H.ell(31, by - 36, 3, 3, 0xffffff);                                    // the heart
    H.poly([[22, by - 54], [40, by - 54], [42, by - 66], [32, by - 72], [20, by - 66]], F.CRYB, 'cyl'); H.ell(36, by - 62, 2, 1.6, 0xff2a1a); H.ell(28, by - 62, 2, 1.6, 0xff2a1a);
    for (const [x, sd] of [[10, -1], [52, 1]]) {
      const fy = f ? by - 70 : by - 20, ex = x + sd * 6;
      H.poly([[x - 4, by - 48], [x + 4, by - 50], [ex + 4, fy + 8], [ex - 4, fy + 10]], F.CRY, 'cyl');
      H.poly([[ex - 8, fy - 2], [ex + 8, fy - 4], [ex + 9, fy + 10], [ex - 8, fy + 11]], F.CRYB, 'cyl');
    }
  });
}

Object.assign(ENEMY, {
  // (v2.91: re-drawn at 1.5x, so k is 1.5x smaller and r/ch are scaled to keep the old hit boxes)
  ppguard: { hp: 9, r: 22, ch: 39, tex: 'ppguard', oy: 0.97, drop: 0.4, ai: 'ppguard', k: 0.85, frames: ['ppguard', 'ppguard_b'], fps: 5 },
  ppgren:  { hp: 5, r: 18, ch: 33, tex: 'ppgren',  oy: 0.97, drop: 0.35, ai: 'ppgren', k: 0.82, frames: ['ppgren', 'ppgren'], fps: 4 },
  pptax:   { hp: 6, r: 20, ch: 33, tex: 'pptax',   oy: 0.97, drop: 0.2, ai: 'pptax', k: 0.85, frames: ['pptax', 'pptax_b'], fps: 9 },
  ppcav:   { hp: 7, r: 29, ch: 30, tex: 'ppcav',   oy: 0.98, drop: 0.4, ai: 'ppcav', k: 0.85, frames: ['ppcav', 'ppcav_b'], fps: 10 },
  ppminer: { hp: 6, r: 20, ch: 36, tex: 'ppminer', oy: 0.97, drop: 0.35, ai: 'ppminer', k: 0.82 },
  ppdyna:  { hp: 5, r: 18, ch: 34, tex: 'ppdyna',  oy: 0.97, drop: 0.35, ai: 'ppdyna', k: 0.82 },
  ppcart:  { hp: 8, r: 28, ch: 28, tex: 'ppcart',  oy: 0.97, drop: 0.5, ai: 'ppcart', k: 0.85, frames: ['ppcart', 'ppcart_b'], fps: 12 },
  ppmite:  { hp: 3, r: 16, ch: 16, tex: 'ppmite',  oy: 0.95, drop: 0.2, ai: 'ppmite', k: 0.8, frames: ['ppmite', 'ppmite_b'], fps: 12 },
  ppslug:  { hp: 7, r: 24, ch: 18, tex: 'ppslug',  oy: 0.95, drop: 0.3, ai: 'ppslug', k: 0.85, frames: ['ppslug', 'ppslug_b'], fps: 4 },
  ppgolem: { hp: 18, r: 28, ch: 54, tex: 'ppgolem', oy: 0.98, drop: 0.6, ai: 'ppgolem', k: 0.9 },
});
