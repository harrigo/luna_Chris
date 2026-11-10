// THE CARTOON PASS: 90s grotesque-slapstick cel animation for the enemies.
//
//  TOON MOTION  every enemy (not bosses) is squashed and stretched like a hand-drawn cartoon, worked out from how it is
//               actually moving: walkers bounce along a gait cycle and lean into their run, anything in the air
//               stretches along its jump and tips nose-up / nose-down, landings SQUASH and spring back, fliers wobble
//               and bank into their turns, and anything that takes a hit judders like jelly.
//  FRAMES       ENEMY.<type>.frames = [...] plays a walk / flap cycle (in step with the gait for walkers).
//  EYE POP      ENEMY.<type>.eyes = [[x, y, r], ...] (texture px, sprite facing right): take a hit and its eyeballs
//               bulge right out of its head, bloodshot, for a moment.
//  REDRAWS      the worst of the old static sprites, redrawn grotesque: bulging mismatched eyes with pin-prick pupils,
//               veins, crooked teeth, drool, scrawny limbs - the space-mouse, Gouda-Golem, germ, and the Fondue
//               Fountain's Fork Fanatic, Skimmer and Kamikaze Crouton.
//
// Mixed into Level1 (toonUpdate from update, toonDraw from render; place() applies spr.tqx / tqy / trot).

const TOON_SKIP = { frog: 1, drone: 1, slicer: 1, miniwheel: 1, ovendrone: 1, anchovy: 1 };   // (spinning blades, or they animate themselves)

function makeToonTextures(scene) {
  const DARK = 0x1a1018, WH = [0xffffff, 0xf6f0e0, 0xc8bca8], PINK = [0xffc0cc, 0xf08aa0, 0xb04a68], TOOTH = [0xfffbe0, 0xf0e090, 0xb09a40];
  // a bulging cartoon eyeball: off-white with a shaded underside, red veins creeping in from the rim, a pin-prick pupil
  const eye = (a, x, y, r, dx, dy, o) => {
    o = o || {};
    a.ell(x, y, r, r, WH);
    const n = r > 6 ? 5 : 0;                              // (small eyes stay clean: veins turn them to mush)
    for (let k = 0; k < n; k++) { const an = 0.9 + k * 6.283 / n + (o.va || 0), c = Math.cos(an), s = Math.sin(an); a.line([[x + c * r * 0.95, y + s * r * 0.95], [x + c * r * 0.55 + s, y + s * r * 0.55 - c * 0.6]], 0xe0302a); }
    const pr = o.pr || Math.max(0.8, r * 0.26), px0 = x + (dx || 0) * r * 0.42, py0 = y + (dy || 0) * r * 0.42;
    if (o.iris) a.ell(px0, py0, pr + 1.2, pr + 1.2, o.iris);
    a.ell(px0, py0, pr, pr, DARK);
    a.px(Math.round(x - r * 0.4), Math.round(y - r * 0.5), 0xffffff);
    if (o.lid) { for (let yy = Math.floor(y - r); yy <= y - r + o.lid * 2 * r; yy++) for (let xx = Math.floor(x - r); xx <= x + r; xx++) if ((xx + 0.5 - x) ** 2 + (yy + 0.5 - y) ** 2 <= r * r) a.px(xx, yy, o.lidC); a.line([[x - r, y - r + o.lid * 2 * r], [x + r, y - r + o.lid * 2 * r]], DARK); }
  };

  // ---- THE SPACE-RAT: scrawny, bug-eyed, slobbering. o.f: 0/1 run cycle, 2 tucked in the air
  const FUR = [0xc4c8dc, 0x868ca6, 0x4e5270], ARM = [0xe09a5a, 0x9a5a2a, 0x5a3014], STEEL = [0xeaf2ff, 0x8eaad6, 0x4a6490];
  const toonRat = (a, ox, oy, o) => {
    const f = o.f || 0, P = (x, y) => [ox + x, oy + y], L = (pts, c, w) => a.line(pts.map(([x, y]) => P(x, y)), c, w);
    // the tail: a long naked whip with a kink in it
    if (f === 1) { L([[10, 21], [5, 22], [2, 17], [5, 11], [2, 6]], PINK[1], 2); L([[5, 21], [3, 17], [5, 12]], PINK[0]); }
    else { L([[10, 21], [5, 19], [1, 14], [4, 8], [1, 3]], PINK[1], 2); L([[5, 18], [2, 14], [4, 9]], PINK[0]); }
    // far legs (in shadow)
    if (f === 0) { L([[14, 22], [18, 26], [22, 27]], FUR[2], 2); L([[24, 21], [22, 26]], FUR[2], 2); }
    else if (f === 1) { L([[14, 22], [10, 26], [6, 27]], FUR[2], 2); L([[25, 21], [30, 25]], FUR[2], 2); }
    else { L([[14, 22], [17, 25], [22, 24]], FUR[2], 2); L([[25, 21], [29, 23]], FUR[2], 2); }
    a.ell(ox + 17, oy + 18, 9, 6.5, FUR);                                                          // a scrawny pear of a body
    a.ell(ox + 20, oy + 22, 5, 2.5, [0xe8d8e0, 0xc8a8b8, 0x8a6a80]);                              // bald pink belly
    if (o.shell !== false) { a.ell(ox + 15, oy + 13.5, 7.5, 4, ARM); a.px(ox + 11, oy + 13, 0xffd8a0); a.px(ox + 16, oy + 11, 0xffd8a0); a.px(ox + 19, oy + 13, 0xffd8a0); a.line([P(12, 15), P(15, 16)], ARM[2]); }   // a dented pot-lid for armour
    // near legs: knobbly knees, long clawed feet
    const foot = (x, y) => { a.line([P(x, y), P(x + 4, y)], PINK[1], 2); a.px(ox + x + 5, oy + y, TOOTH[0]); a.px(ox + x + 5, oy + y - 1, TOOTH[0]); };
    if (f === 0) { a.ell(ox + 13, oy + 21, 4, 3.5, FUR); L([[11, 23], [7, 26]], FUR[1], 2); foot(4, 27); L([[25, 21], [29, 25]], FUR[1], 2); foot(29, 26); }
    else if (f === 1) { a.ell(ox + 14, oy + 21, 4, 3.5, FUR); L([[15, 23], [19, 26]], FUR[1], 2); foot(18, 27); L([[24, 21], [22, 25]], FUR[1], 2); foot(21, 26); }
    else { a.ell(ox + 14, oy + 21, 4, 3.5, FUR); L([[13, 23], [9, 25], [6, 23]], FUR[1], 2); foot(2, 23); L([[25, 21], [31, 23]], FUR[1], 2); foot(31, 23); }
    // head: a long twitchy snout, huge torn ears
    a.ell(ox + 25, oy + 6, 4, 5, PINK); a.ell(ox + 25, oy + 6.5, 2, 3, PINK[2]); a.px(ox + 23, oy + 2, DARK);                       // ear, a bite out of it
    a.ell(ox + 29, oy + 13, 6.5, 6, FUR);
    a.poly([P(32, 10), P(41, 13), P(42, 16), P(34, 19), P(30, 18)], FUR);                                                           // snout
    a.ell(ox + 42, oy + 14, 1.8, 1.8, PINK); a.px(ox + 42, oy + 13, 0xffffff);                                                      // wet nose
    L([[38, 15], [43, 11]], 0xe8e0d0); L([[38, 16], [44, 18]], 0xe8e0d0);                                                           // whiskers
    L([[33, 18], [40, 17]], DARK);                                                                                                  // a sneer...
    a.rect(ox + 37, oy + 17, ox + 38, oy + 21, TOOTH[0]); a.rect(ox + 39, oy + 17, ox + 40, oy + 20, TOOTH[1]);                     // ...and buck teeth
    a.px(ox + 35, oy + 19, 0xb8ffe8); a.px(ox + 35, oy + 20, 0xb8ffe8); if (f === 1) a.px(ox + 35, oy + 21, 0xe0fff4);              // drool
    if (o.bandana) { a.poly([P(23, 8), P(34, 6), P(34, 9), P(23, 11)], o.bandana); L([[23, 9], [19, 7]], o.bandana[1], 2); L([[23, 10], [19, 11]], o.bandana[1]); }   // party bandana, knot flapping
    else if (o.cap) { a.ell(ox + 28, oy + 8, 6.5, 3.4, o.cap); L([[22, 9], [20, 15]], o.cap[1], 2); L([[24, 11], [37, 9]], o.cap[2]); }                           // a leather flying cap, strap dangling
    else { a.ell(ox + 28, oy + 7.5, 5.5, 2.6, STEEL); L([[27, 5], [27, 1]], STEEL[2]); a.px(ox + 27, oy + 0, 0xff3a3a); a.px(ox + 25, oy + 7, STEEL[2]); }       // a dented tin hat with a blinking aerial
    if (o.goggles) { a.ell(ox + 31, oy + 11, 5.6, 5.6, [0xffe08a, 0xd09a2a, 0x7a5210]); a.ell(ox + 36.5, oy + 11.5, 3.8, 3.8, [0xffe08a, 0xd09a2a, 0x7a5210]); }   // brass goggles, eyes swimming behind them
    eye(a, ox + 31, oy + 11, 4.2, 0.8, 0.3); eye(a, ox + 36.5, oy + 11.5, 2.6, 0.6, 0.4);                                           // one enormous eye, one small
    L([[27, 7], [35, 9]], DARK, 1);                                                                                                // one long furious brow
  };
  pixSprite(scene, 'mouse', 46, 30, a => toonRat(a, 0, 0, { f: 0 }));
  pixSprite(scene, 'mouse_b', 46, 30, a => toonRat(a, 0, 0, { f: 1 }));
  // JETPACK RAT: flying cap and brass goggles, a dented red tank strapped on, legs dangling
  pixSprite(scene, 'flyer', 50, 36, a => {
    a.rrect(12, 10, 20, 26, 2, [0xff8a6a, 0xd9503a, 0x8a2414]); a.rect(13, 14, 19, 15, 0x5a1a10); a.rect(13, 21, 19, 22, 0x5a1a10); a.px(14, 12, 0xffd0c0); a.ell(16, 9, 2.5, 2, STEEL);
    toonRat(a, 4, 2, { f: 2, shell: false, cap: [0xb07a4a, 0x7a4a24, 0x4a2a10], goggles: true });
    a.line([[19, 13], [24, 20]], 0x5a3a1a, 1);                                                                                     // harness strap
  });
  // FORK FANATIC: the same wretch in a party bandana, a two-pronged fondue fork under its arm
  const SIL = [0xf4f8ff, 0xb8c0cc, 0x6a7280], BAND = [0xd08aff, 0x9a3ae8, 0x5a1a9a];
  const fork = (a, x0, y0, x1, y1) => {
    a.line([[x0, y0], [x1, y1]], SIL[1], 2); a.line([[x0, y0 - 1], [x1, y1 - 1]], SIL[0]);
    const an = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(an), ny = Math.cos(an);
    for (const sd of [-2, 2]) a.line([[x1 + nx * sd, y1 + ny * sd], [x1 + nx * sd + Math.cos(an) * 7, y1 + ny * sd + Math.sin(an) * 7]], SIL[0]);
    a.line([[x0, y0], [x0 + Math.cos(an) * 6, y0 + Math.sin(an) * 6]], 0x8a4a2a, 3);
  };
  pixSprite(scene, 'forkrat0', 54, 34, a => { toonRat(a, 0, 4, { f: 0, shell: false, bandana: BAND }); fork(a, 12, 24, 46, 21); });
  pixSprite(scene, 'forkrat0b', 54, 34, a => { toonRat(a, 0, 4, { f: 1, shell: false, bandana: BAND }); fork(a, 12, 25, 46, 20); });
  pixSprite(scene, 'forkrat1', 54, 34, a => { fork(a, 34, 33, 20, 2); toonRat(a, 2, 0, { f: 2, shell: false, bandana: BAND }); });   // vaulting on it, legs tucked

  // ---- GOUDA-GOLEM: a sweating, slobbering slab of cheese. f: 0/1 stomp cycle
  const golem = (a, f) => {
    const CH = [0xfff0a0, 0xffc83d, 0xc8860f], dx = f ? 1 : -1;
    // stubby legs, one stomping
    a.rrect(10, 55 - (f ? 0 : 3), 24, 63 - (f ? 0 : 3), 2, [0xd8a020, 0x9a6a0c, 0x5a3a04]); a.rrect(36, 55 - (f ? 3 : 0), 50, 63 - (f ? 3 : 0), 2, [0xd8a020, 0x9a6a0c, 0x5a3a04]);
    // the slab, a bite taken out of one corner
    a.rrect(5 + dx, 5, 55 + dx, 58, 7, CH);
    a.ell(8 + dx, 7, 6, 5, -1); a.ell(13 + dx, 5, 3, 3, -1);
    for (const [x, y, r] of [[48, 12, 4], [50, 47, 5.5], [13, 50, 4.5], [8, 34, 2.5], [33, 9, 2]]) { a.ell(x + dx, y, r, r, 0xa87008); a.ell(x + dx - 0.6, y - 0.8, r * 0.7, r * 0.6, 0x6a4204); }
    a.px(27 + dx, 9, 0xfffbe0); a.px(53 + dx, 30, 0xfffbe0); a.px(9 + dx, 42, 0xfffbe0);
    // fists like hams
    a.ell(3, 38 + (f ? -3 : 2), 4, 5, CH); a.line([[1, 36 + (f ? -3 : 2)], [5, 36 + (f ? -3 : 2)]], CH[2]); a.ell(57, 38 + (f ? 2 : -3), 4, 5, CH); a.line([[55, 36 + (f ? 2 : -3)], [59, 36 + (f ? 2 : -3)]], CH[2]);
    // the face: one vast bloodshot eye, one heavy-lidded; a brow like a girder
    eye(a, 21 + dx, 25, 9, 0.5, 0.4, { pr: 2 }); eye(a, 41 + dx, 24, 6, 0.3, 0.5, { pr: 1.5, lid: 0.36, lidC: CH[2] });
    a.line([[10 + dx, 12], [28 + dx, 17], [34 + dx, 16], [50 + dx, 15]], 0x5a2a00, 4);
    a.ell(31 + dx, 33, 4, 3, [0xfffbe0, 0xffd860, 0xd89a20]); a.px(29 + dx, 34, DARK); a.px(32 + dx, 34, DARK);                    // a blob of a nose
    // a cavern of a mouth: crooked teeth, one gold, a tongue lolling out, ropes of drool
    const my = f ? 3 : 0;
    a.rrect(15 + dx, 39 + my, 47 + dx, 53, 4, [0x7a1a24, 0x4a0a14, 0x2a040a]);
    for (const [x, w, h, c] of [[17, 4, 5, TOOTH[0]], [23, 3, 3, TOOTH[1]], [28, 5, 6, TOOTH[0]], [35, 3, 4, 0xffc020], [40, 4, 5, TOOTH[1]]]) a.rect(x + dx, 39 + my, x + dx + w, 39 + my + h - (f ? 1 : 0), c);
    for (const [x, w, h] of [[20, 4, 3], [31, 3, 4], [42, 3, 2]]) a.rect(x + dx, 53 - h, x + dx + w, 53, TOOTH[1]);
    a.ell(36 + dx, 53, 6, 4, PINK); a.ell(38 + dx, 57, 4, 4, PINK); a.line([[36 + dx, 51], [38 + dx, 58]], PINK[2]);
    a.line([[19 + dx, 53], [19 + dx, 58 + (f ? 2 : 0)]], 0xb8ffe8); a.px(19 + dx, 59 + (f ? 2 : 0), 0xe0fff4);
    for (const [x, y] of [[51, 20], [6, 22]]) { a.px(x + dx, y + (f ? 2 : 0), 0x9ae8ff); a.px(x + dx, y + 1 + (f ? 2 : 0), 0x5ac8f0); }  // sweat flying off
  };
  pixSprite(scene, 'golem', 62, 64, a => golem(a, 0), 1);
  pixSprite(scene, 'golem_b', 62, 64, a => golem(a, 1), 1);

  // ---- GERM: a warty blob, all eye and teeth. f: 0/1 pulsing
  const germ = (a, f) => {
    const G = [0xb8ffb0, 0x4acc7a, 0x1a7a4a], cx = 21, cy = 21, rx = f ? 14 : 12.5, ry = f ? 12 : 13.5;
    for (let k = 0; k < 14; k++) {                                                                    // cilia, waving
      const an = k * 6.283 / 14 + (f ? 0.22 : 0), l = (k % 2 ? 5 : 3) + (f ? (k % 2 ? -1 : 2) : 0);
      a.line([[cx + Math.cos(an) * rx * 0.9, cy + Math.sin(an) * ry * 0.9], [cx + Math.cos(an + (f ? 0.15 : -0.1)) * (rx + l), cy + Math.sin(an + (f ? 0.15 : -0.1)) * (ry + l)]], G[2], 2);
    }
    a.ell(cx, cy, rx, ry, G);
    for (const [x, y, r] of [[30, 28, 2.5], [9, 24, 2], [27, 9, 1.8]]) { a.ell(x, y, r, r, 0x2a9a5a); a.px(Math.round(x - 1), Math.round(y - 1), 0xe0ffe0); }   // warts
    eye(a, 16, 15 + (f ? 1 : 0), 7, 0.5, 0.3, { pr: 1.6, iris: 0xffd23a }); eye(a, 29, 14 + (f ? 1 : 0), 3.6, 0.2, 0.5, { pr: 1, lid: 0.4, lidC: G[2] });
    a.line([[9, 7 + (f ? 1 : 0)], [21, 10 + (f ? 1 : 0)]], DARK, 2); a.line([[33, 9 + (f ? 1 : 0)], [26, 10 + (f ? 1 : 0)]], DARK, 2);
    const my = f ? 26 : 25;                                                                           // a grin far too wide for it
    a.poly([[8, my], [34, my - 1], [31, my + 6], [22, my + 8], [12, my + 6]], [0x5a1420, 0x3a0a14, 0x20040a]);
    for (let x = 10; x < 33; x += 4) a.poly([[x, my], [x + 3, my], [x + 1.5, my + 3 + (x % 8 ? 1 : 0)]], TOOTH[0]);
    for (let x = 14; x < 30; x += 5) a.poly([[x, my + 6], [x + 3, my + 6], [x + 1.5, my + 3]], TOOTH[1]);
    a.line([[30, my + 5], [30, my + 10 + (f ? 2 : 0)]], 0xb8ffe8);
  };
  pixSprite(scene, 'germ', 42, 42, a => germ(a, 0));
  pixSprite(scene, 'germ_b', 42, 42, a => germ(a, 1));

  // ---- SKIMMER: a bug-eyed robot fly with a toothpick. f: 0/1 wings up / down
  const skimmer = (a, f) => {
    const WG = [0xf0fcff, 0xa8dcf0, 0x5a9ac0], RED = [0xff9a8a, 0xe02a2a, 0x7a0a10];
    if (f) { a.poly([[16, 13], [6, 17], [2, 22], [12, 19]], WG); a.poly([[19, 13], [14, 20], [17, 23], [22, 16]], WG); }
    else { a.poly([[16, 12], [4, 6], [3, 1], [13, 5]], WG); a.poly([[19, 12], [14, 3], [18, 0], [22, 8]], WG); a.line([[15, 10], [7, 5]], WG[2]); }
    for (const [x, l] of [[12, 5], [16, 6], [20, 5]]) a.line([[x, 18], [x - 1 + (f ? 1 : 0), 18 + l], [x + 1, 19 + l]], SIL[2]);   // dangling legs
    a.ell(12, 15, 7, 4.5, SIL); for (const x of [8, 11, 14]) a.line([[x, 11], [x, 19]], 0x3a4250);                                    // a ribbed tin abdomen
    a.px(6, 14, 0xffd040); a.px(6, 16, 0xffd040);
    a.ell(20, 14, 5, 4.5, SIL);
    a.ell(25, 10, 5, 5, RED); a.ell(29, 14, 3.6, 3.6, RED);                                                                         // great red compound eyes
    for (const [x, y] of [[23, 8], [26, 8], [24, 11], [27, 11], [29, 13], [30, 15]]) a.px(x, y, 0xffd0c8);
    a.px(23, 7, 0xffffff); a.px(28, 12, 0xffffff);
    a.line([[23, 17], [30, 18]], DARK); for (const x of [24, 26, 28]) a.px(x, 18, TOOTH[0]);                                           // a nasty little grin
    a.line([[27, 19], [35, 23]], 0xe8c890, 1); a.px(35, 23, 0xfff0c0); a.ell(31, 21, 1.6, 1.6, [0xa8d86a, 0x6a9a2a, 0x3a5a14]);       // the toothpick, an olive still on it
    a.line([[22, 6], [20, 2]], SIL[2]); a.line([[25, 5], [26, 1]], SIL[2]);                                                          // feelers
  };
  pixSprite(scene, 'skimmer', 38, 26, a => skimmer(a, 0));
  pixSprite(scene, 'skimmer_b', 38, 26, a => skimmer(a, 1));

  // ---- KAMIKAZE CROUTON: a slice of toast that has realised what it's about to do. f: 0/1 flame flicker
  const kami = (a, f) => {
    const CR = [0xe8a850, 0xb06a20, 0x6a3a0c], CB = [0xfff0c0, 0xf6dca0, 0xd0a868];
    a.poly([[10, 13], [1, f ? 9 : 11], [5, 13], [0, f ? 17 : 15], [10, 14]], [0xfff0a0, 0xffa020, 0xd0401a]); a.poly([[10, 13], [4, 12], [6, 14], [4, 15]], 0xfff0a0);   // rocket flame
    a.poly([[12, 13], [6, 5], [12, 8]], CR); a.poly([[12, 13], [6, 21], [12, 18]], CR);                                               // fins
    a.poly([[10, 5], [16, 2], [36, 2], [41, 7], [41, 19], [36, 24], [16, 24], [10, 21]], CR);                                         // the crust
    a.rrect(14, 5, 37, 21, 3, CB);
    for (const [x, y] of [[17, 8], [21, 18], [34, 17], [16, 14]]) a.px(x, y, 0xb88a4a);
    eye(a, 24, 10, 4.6, 0.4, 0.7, { pr: 1.1 }); eye(a, 33, 10, 3.8, 0.2, 0.7, { pr: 1 });                                             // eyes out on stalks
    a.line([[19, 4], [27, 5]], DARK, 1); a.line([[37, 4], [30, 6]], DARK, 1);
    a.ell(29, 18, 5, f ? 4 : 3.4, [0x7a1a24, 0x4a0a14, 0x2a040a]); a.ell(29, 20, 3, 1.5, PINK); a.rect(26, 15, 27, 16, TOOTH[0]); a.rect(30, 15, 31, 16, TOOTH[0]);   // AAAAAAH
    a.px(40, 4 + (f ? 1 : 0), 0x9ae8ff); a.px(41, 5 + (f ? 1 : 0), 0x5ac8f0); a.px(13, 3 + (f ? 0 : 1), 0x9ae8ff);                    // sweat
  };
  pixSprite(scene, 'kamikaze', 42, 26, a => kami(a, 0));
  pixSprite(scene, 'kamikaze_b', 42, 26, a => kami(a, 1));

  // ---- STINK-FLY: bloated, mouldy, dribbling. f: 0/1 wings up / down
  const stinkfly = (a, f) => {
    const WING = [0xf0fff8, 0xb8e8f0, 0x6aa8c0], BODY = [0xa8e0c0, 0x4a9a80, 0x1a5444], VEIN = 0x2a6a9a;
    if (f) { a.poly([[12, 14], [1, 17], [3, 22], [13, 18]], WING); a.poly([[19, 13], [14, 21], [18, 24], [23, 16]], WING); }
    else { a.poly([[12, 13], [2, 5], [6, 1], [15, 9]], WING); a.poly([[18, 12], [14, 2], [20, 0], [23, 9]], WING); a.line([[11, 11], [5, 5]], WING[2]); a.line([[18, 9], [17, 3]], WING[2]); }
    for (const [x, l] of [[10, 4], [15, 5], [20, 4]]) a.line([[x, 24], [x - 2 + f, 24 + l], [x, 26 + l]], 0x14241c);              // hairy, dangling legs
    a.ell(15, 18, 10, 8, BODY);                                                                                                  // a fat mouldy abdomen
    for (const [x, y] of [[9, 16], [13, 21], [18, 22], [20, 15]]) { a.px(x, y, VEIN); a.px(x + 1, y, VEIN); a.px(x, y + 1, 0x7ab8e0); }
    for (const [x, y, r] of [[12, 14, 1.6], [17, 18, 1.4]]) { a.ell(x, y, r, r, 0xd8ff8a); a.px(Math.round(x), Math.round(y - 1), 0xffffff); }   // pustules
    a.ell(26, 16, 5, 5, [0x7ac8a8, 0x3a7a64, 0x16443a]);
    eye(a, 26.5, 11, 4.6, 0.6, 0.5, { pr: 1.1 }); eye(a, 31.5, 14.5, 3, 0.5, 0.6, { pr: 0.9 });                                  // bulging bug eyes
    a.line([[30, 19], [33, 22], [32, 26 + f]], 0x14241c); a.px(32, 27 + f, 0xb8ffe8);                                             // a dribbling proboscis
    for (const [x, y] of [[5, 9 - f], [7, 7 - f], [5, 5 - f]]) a.px(x + (y % 2), y + 22 - 20, 0x9aff6a);                         // stink
  };
  pixSprite(scene, 'stinkfly', 36, 32, a => stinkfly(a, 0));
  pixSprite(scene, 'stinkfly_b', 36, 32, a => stinkfly(a, 1));

  // ---- MINI-GERM: the germ's nasty little offspring
  const minigerm = (a, f) => {
    const G = [0xb8ffb0, 0x4acc7a, 0x1a7a4a], cx = 13, cy = 13, rx = f ? 8.4 : 7.4, ry = f ? 7 : 8;
    for (let k = 0; k < 10; k++) { const an = k * 0.6283 + (f ? 0.3 : 0), l = (k % 2 ? 3 : 2) + (f && k % 2 ? 1 : 0); a.line([[cx + Math.cos(an) * rx * 0.9, cy + Math.sin(an) * ry * 0.9], [cx + Math.cos(an) * (rx + l), cy + Math.sin(an) * (ry + l)]], G[2], 1); }
    a.ell(cx, cy, rx, ry, G);
    eye(a, 10, 10 + f, 4, 0.5, 0.3, { pr: 1.1 }); eye(a, 17, 10 + f, 2.2, 0.3, 0.5, { pr: 0.8 });
    a.line([[6, 5 + f], [13, 7 + f]], DARK); a.line([[20, 6 + f], [15, 8 + f]], DARK);
    a.poly([[7, 16], [19, 15], [17, 19], [13, 20], [9, 19]], 0x3a0a14); for (const x of [8, 12, 16]) a.poly([[x, 16], [x + 2, 16], [x + 1, 18]], TOOTH[0]);
  };
  pixSprite(scene, 'minigerm', 26, 26, a => minigerm(a, 0));
  pixSprite(scene, 'minigerm_b', 26, 26, a => minigerm(a, 1));

  // ---- PHANTOM: the ghost of a dairy-maid, face run like wax, wailing. f: 0/1 skirts billowing
  const phantom = (a, f) => {
    const GH = [0xffffff, 0xd8ecff, 0x86aee0], SOCK = 0x14203c;
    a.poly(f ? [[8, 18], [29, 18], [34, 31], [29, 35], [24, 30], [19, 39], [14, 31], [9, 37], [3, 32]] : [[8, 18], [29, 18], [33, 35], [28, 30], [23, 39], [18, 31], [13, 39], [8, 31], [4, 36]], GH);   // tattered skirts
    a.line([[9, 21], [4, 24 - f], [1, 21 - f]], GH[1], 2); for (const [x, y] of [[0, 19], [1, 18], [3, 19]]) a.px(x, y - f, GH[0]);                                  // a stringy arm, clawing
    a.line([[28, 21], [34, 25 + f]], GH[1], 2); a.rrect(31, 25 + f, 37, 32 + f, 1, [0xdfe6f0, 0x9aa4b4, 0x5a6272]); a.line([[31, 25 + f], [34, 22 + f], [37, 25 + f]], 0x5a6272);   // the milk pail, swinging
    a.ell(18, 14, 9.5, 10, GH);
    a.poly([[12, 22], [24, 22], [22, 27 + f], [19, 24], [16, 28 + f], [14, 24]], GH);                                                                                // the face, dripping off the chin
    a.ell(18, 6.5, 12, 5, [0xffffff, 0xf0f4ff, 0xb8c8e8]); a.rect(7, 7, 29, 8, 0xe8a8d0); for (let x = 7; x < 30; x += 4) a.px(x, 10, 0xb8c8e8);                     // frilly bonnet
    a.ell(14, 14, 3.6, 4.2, SOCK); a.ell(23.5, 13, 2.6, 3, SOCK); a.px(15, 15, 0x7af0ff); a.px(15, 14, 0xe0ffff); a.px(24, 13, 0x7af0ff);                            // hollow sockets, a spark deep in each
    a.line([[10, 9], [16, 11]], SOCK); a.line([[27, 9], [22, 10]], SOCK);
    a.ell(19, 21, 2.6, 3.4 + f, SOCK); a.px(18, 19, GH[0]); a.px(20, 19, GH[0]);                                                                                     // a long wail of a mouth
  };
  pixSprite(scene, 'phantom', 38, 42, a => phantom(a, 0));
  pixSprite(scene, 'phantom_b', 38, 42, a => phantom(a, 1));

  // ---- GHOST PIRATE: a dead space-rat buccaneer. Eyepatch, one mad eye, snaggle teeth, a hook. f: 0/1 coat tails
  const pirate = (a, f) => {
    const GG = [0xe0fff0, 0x7ae8b8, 0x2a8a6a], HAT = [0x4a4a5a, 0x24242e, 0x0c0c12];
    a.poly(f ? [[10, 20], [30, 18], [37, 32], [33, 40], [28, 35], [23, 42], [18, 35], [13, 40], [7, 33]] : [[10, 20], [30, 18], [36, 34], [32, 42], [27, 37], [22, 43], [17, 37], [12, 42], [8, 34]], GG);   // tattered coat
    a.line([[19, 22], [22, 34]], GG[2]); for (const y of [24, 28, 32]) a.px(21, y, 0xffd23f);                                                                             // gold buttons
    a.line([[14, 28], [9, 25 - f]], GG[1], 2); a.line([[9, 25 - f], [6, 22 - f], [8, 20 - f]], 0xffd23f);                                                                // a hook for a hand
    a.ell(16, 8, 3.5, 4.5, GG); a.ell(16, 8.5, 1.6, 2.4, GG[2]); a.px(14, 4, DARK);
    a.ell(24, 16, 10, 9, GG); a.poly([[30, 12], [41, 16], [42, 19], [36, 22], [30, 21]], GG);                                                                             // head + snout
    a.px(42, 16, 0xffa8b8); a.line([[37, 18], [43, 15]], 0xe0fff0);
    a.line([[31, 21], [40, 20]], DARK); a.rect(37, 20, 38, 23, TOOTH[0]); a.rect(34, 21, 34, 23, TOOTH[1]); a.px(32, 22, 0xb8ffe8); a.px(32, 23, 0xb8ffe8);               // snaggle teeth, drool
    eye(a, 27, 14, 4, 0.7, 0.2, { pr: 1.1 });                                                                                                                             // the one good eye
    a.ell(34.5, 14, 2.6, 2.6, HAT[2]); a.line([[18, 10], [37, 13]], HAT[2]);                                                                                             // eyepatch
    a.line([[22, 10], [30, 11]], DARK, 2);
    a.poly([[10, 7], [24, 0], [38, 7], [34, 10], [24, 7], [14, 10]], HAT); a.px(24, 3, 0xffffff); a.px(23, 4, 0xffffff); a.px(25, 4, 0xffffff); a.px(24, 5, 0xffffff);    // tricorn, skull badge
    a.line([[30, 27], [44, 19 + f]], 0xe8f0f8, 2); a.line([[30, 26], [43, 19 + f]], 0xffffff); a.rect(29, 25, 32, 29, 0xffd23f);                                          // cutlass
  };
  pixSprite(scene, 'ghostpirate', 46, 44, a => pirate(a, 0));
  pixSprite(scene, 'ghostpirate_b', 46, 44, a => pirate(a, 1));

  // the eyeball that bulges out when something is hit
  pixSprite(scene, 'toon_eye', 18, 18, a => { a.ell(9, 9, 7, 7, WH); for (const [x0, y0, x1, y1] of [[2, 8, 5, 9], [15, 11, 12, 10], [9, 15, 9, 13]]) a.line([[x0, y0], [x1, y1]], 0xe0302a); a.ell(11, 9.5, 1.5, 1.5, DARK); a.px(6, 5, 0xffffff); });
}

const ToonMixin = {
  toonUpdate(dt) {
    if (!(dt > 0)) return;
    const cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    for (const e of this.enemies) {
      const s = e.spr; if (!s) continue;
      if (e.type === 'boss' || e.noToon) { s.tqx = s.tqy = 1; s.trot = 0; continue; }
      const def = ENEMY[e.type] || {};
      const T = e.tn || (e.tn = { th: e.theta, h: e.h, hp: e.hp, ph: Math.random() * 6, land: 0, boing: 0, pop: 0, lean: 0 });
      const vt = angDiff(e.theta, T.th) * R / dt, vh = (e.h - T.h) / dt, sp = Math.abs(vt), ground = (def.oy || 0.5) > 0.8;
      if (e.hp < T.hp - 0.01) { T.boing = 1; T.pop = 1; }                               // took a hit: judder, eyes out
      if (ground && T.h > 6 && e.h <= 1 && vh < -60) T.land = 1;                        // touched down: SQUASH
      T.hp = e.hp; T.th = e.theta; T.h = e.h;
      T.land = Math.max(0, T.land - dt * 4.2); T.boing = Math.max(0, T.boing - dt * 3); T.pop = Math.max(0, T.pop - dt * 3.2);
      if (TOON_SKIP[e.type]) { s.tqx = s.tqy = 1; s.trot = 0; continue; }           // (still gets the eye pop)
      let qx = 1, qy = 1, rot = 0;
      if (ground) {
        if (e.h > 2) { const k = Math.min(0.26, Math.abs(vh) / 1500); qy *= 1 + k; qx *= 1 - k * 0.65; rot -= (Math.sign(vt) || e.dir || 1) * cl(vh / 1300, -0.3, 0.3); }   // stretched along the jump, nose up then nose down
        else if (sp > 15) { T.ph += sp * dt * 0.1; const w = Math.sin(T.ph * 2); qy *= 1 + 0.09 * w; qx *= 1 - 0.07 * w; rot += Math.sign(vt) * Math.min(0.12, sp / 1400); }   // bouncing along, leaning into it
        else { const w = Math.sin(this.t * 3 + T.ph); qy *= 1 + 0.035 * w; qx *= 1 - 0.025 * w; }                                                                           // breathing
      } else {
        const w = Math.sin(this.t * 8 + T.ph); qx *= 1 + 0.05 * w; qy *= 1 - 0.05 * w;
        T.lean += (cl(vt / 420, -0.32, 0.32) - T.lean) * Math.min(1, dt * 6); rot += T.lean;                                                                                // banking into the turn
      }
      if (T.land > 0) { const k = T.land * Math.cos((1 - T.land) * 8); qy *= 1 - 0.32 * k; qx *= 1 + 0.28 * k; }
      if (T.boing > 0) { const b = T.boing * Math.sin(T.boing * 24); qx *= 1 + 0.18 * b; qy *= 1 - 0.18 * b; }
      s.tqx = qx; s.tqy = qy; s.trot = rot;
      if (def.frames) {                                                                 // the walk / flap cycle (left alone while the AI is showing some other frame)
        const cur = s.texture.key, n = def.frames.length;
        if (def.frames.includes(cur)) {
          const fr = ground ? (e.h <= 2 && sp > 15 ? def.frames[Math.floor(T.ph * 2 / Math.PI) % n] : (e.h > 2 ? cur : def.frames[0])) : def.frames[Math.floor(this.t * (def.fps || 12) + T.ph) % n];
          if (fr !== cur) s.setTexture(fr);
        }
      }
    }
  },

  // EYE POP: bloodshot eyeballs bulging out of anything that's just been hit
  toonDraw() {
    const X = this.toon || (this.toon = { eyes: [] });
    let n = 0;
    for (const e of this.enemies) {
      const T = e.tn, def = ENEMY[e.type], s = e.spr;
      if (!T || !(T.pop > 0) || !def || !def.eyes || !s || !s.visible) continue;
      const p = T.pop, bulge = p > 0.8 ? (1 - p) / 0.2 : p / 0.8, fl = s.flipX ? -1 : 1, c = Math.cos(s.rotation), sn = Math.sin(s.rotation);
      for (const [ex, ey, er] of def.eyes) {
        let im = X.eyes[n]; if (!im) im = X.eyes[n] = this.add.image(0, 0, 'toon_eye');
        n++;
        const lx = ((ex - s.width * s.originX) * fl + fl * bulge * er * 0.7) * Math.abs(s.scaleX), ly = (ey - s.height * s.originY - bulge * er * 0.35) * s.scaleY;
        const k = er * (1 + 0.65 * bulge) / 7 * Math.abs(s.scaleX);
        im.setPosition(s.x + lx * c - ly * sn, s.y + lx * sn + ly * c).setRotation(s.rotation).setScale(k * fl, k).setDepth(s.depth + 0.004).setVisible(bulge > 0.04);
      }
    }
    for (let i = n; i < X.eyes.length; i++) X.eyes[i].setVisible(false);
  }
};
