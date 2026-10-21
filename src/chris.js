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

const RIG_SCALE = 0.95;

function makeChrisTextures(scene) {
  if (scene.textures.exists('c_head')) return;
  const OUT = 0x1a1020;
  const mk = (key, w, h, draw) => {
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

  pixSprite(scene, 'c_boot', 24, 13, a => {
    a.rrect(1, 1, 22, 10, 4, BLUE);
    a.rect(2, 9, 21, 10, 0xd9d9e0); a.rect(2, 10, 21, 10, 0x8a8a98);                    // sole
    a.rect(14, 3, 17, 3, 0xc4d4ff);                                                     // toe shine
  });
  pixSprite(scene, 'c_leg', 16, 18, a => {
    a.rrect(1, 0, 14, 17, 4, SUIT);
    a.rect(2, 9, 13, 9, 0xd62828); a.rect(2, 10, 13, 11, 0x4a6ad8);                     // red + blue knee trim
  });
  // suit torso with a slight belly overhang under the hem
  pixSprite(scene, 'c_body', 44, 42, a => {
    a.rrect(5, 1, 38, 31, 10, SUIT);                                                    // the suit, a size too small
    a.rect(6, 27, 37, 28, 0xd62828); a.rect(7, 29, 36, 30, 0x93a8cc);                   // red hem trim + stretched hem
    a.ell(14, 11, 4, 4, BLUE); a.px(14, 10, 0xffffff); a.px(13, 11, 0xffffff); a.px(15, 11, 0xffffff); a.px(14, 12, 0xffd23f);   // mission patch
    a.rect(30, 4, 33, 6, 0xd62828); a.rect(30, 7, 33, 8, 0x4a6ad8);                     // shoulder flag
  }, 1);
  // the apron: "KISS THE COOK", cream with red lettering and macaroni-cheese stains
  pixSprite(scene, 'c_apron', 28, 38, a => {
    a.poly([[8, 1], [20, 1], [24, 12], [27, 35], [1, 35], [4, 12]], CREAM);
    a.rect(8, 1, 20, 2, 0xd62828);                                                       // neck band
    word(a, 'KISS', 7, 12, 0xd62828); word(a, 'THE', 9, 18, 0xd62828); word(a, 'COOK', 7, 24, 0xd62828);
    for (const [x, y] of [[5, 30], [6, 30], [20, 29], [21, 30], [22, 16], [4, 21], [18, 32]]) a.px(x, y, 0xff9a2a);   // stains
    a.px(19, 9, 0xffd23f); a.px(9, 31, 0xffd23f);
  });
  // the apron's other life: a cape (same cream cloth, red edge)
  pixSprite(scene, 'c_cape', 50, 46, a => {
    const pts = [[48, 2], [48, 14], [22, 30], [14, 45], [8, 33], [1, 40], [5, 22], [24, 8]];
    a.poly(pts, CREAM);
    a.poly([[48, 8], [48, 14], [22, 30], [14, 45], [24, 26]], [0xf0e0c8, 0xd8c4a8, 0xb8a080]);          // fold in shadow
    a.line([[48, 13], [22, 29], [14, 44]], 0xd62828, 2);                                                // red hem
    word(a, 'KISS', 22, 12, 0xd62828);                                                                  // a ghost of the lettering
  });
  // head: glass helmet bubble round a furious face: one squint, one bulging eye, red nose, big moustache, gritted teeth
  pixSprite(scene, 'c_head', 30, 30, a => {
    a.ell(15, 15, 14, 14, [0xe8f8ff, 0xb8e0ff, 0x7ab0e0]);                              // helmet glass
    a.ell(15, 16, 11, 11.5, SKIN);                                                       // face
    a.line([[6, 8], [13, 11]], HAIR, 2); a.line([[24, 7], [17, 11]], HAIR, 2);           // angry brows
    a.rect(7, 12, 12, 12, 0x1a1020); a.px(8, 13, 0x1a1020);                              // squinting eye
    a.ell(20.5, 13, 3.2, 3.4, 0xffffff); a.rect(21, 12, 22, 14, 0x1a1020);                // bulging eye
    a.ell(16, 17.5, 3.4, 3, [0xff9a9a, 0xe03a3a, 0xa01818]); a.px(15, 16, 0xffffff);     // big red nose
    a.poly([[5, 22], [9, 19], [15, 20.5], [21, 19], [26, 21], [28, 18], [27, 23], [21, 23], [15, 22.5], [9, 23], [3, 24], [2, 20]], HAIR);   // handlebar moustache
    a.rect(10, 24, 20, 26, 0xffffff); a.rect(10, 25, 20, 25, 0x8a7a7a); a.px(13, 24, 0x8a7a7a); a.px(17, 24, 0x8a7a7a); a.px(13, 26, 0x8a7a7a); a.px(17, 26, 0x8a7a7a);   // gritted teeth
    a.px(5, 6, 0xffffff); a.px(6, 5, 0xffffff); a.px(7, 5, 0xffffff); a.px(4, 8, 0xffffff);   // glass glint
  });
  // chef's toque
  pixSprite(scene, 'c_hat', 38, 30, a => {
    const W3 = [0xffffff, 0xeef2f8, 0xbcc6d6];
    a.ell(9, 17, 7.5, 7.5, W3); a.ell(29, 17, 7.5, 7.5, W3); a.ell(19, 11, 9.5, 9.5, W3); a.ell(19, 18, 8.5, 8, W3);
    a.rrect(7, 21, 30, 28, 2, [0xffffff, 0xf1f1f1, 0xc4cede]);
    for (const x of [13, 19, 25]) a.rect(x, 22, x, 27, 0xbcc6d6);                        // pleats
    a.line([[14, 6], [16, 13]], 0xbcc6d6); a.line([[24, 7], [22, 13]], 0xbcc6d6);
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
  pixSprite(scene, 'c_belly', 24, 16, a => {
    a.ell(12, 7, 11, 7.5, SKIN);
    a.px(16, 10, 0xb06a4a); a.px(16, 11, 0xc9805e);                                     // navel
    a.rect(17, 5, 19, 5, 0xffe8dc);                                                     // shine
  });
  // gun arm: suit sleeve, red cuff, big white glove
  pixSprite(scene, 'c_arm', 18, 11, a => {
    a.rrect(0, 2, 10, 8, 2, SUIT); a.rect(8, 2, 9, 8, 0xd62828);
    a.ell(13, 5.5, 4.2, 4.2, [0xffffff, 0xeef2f8, 0xbcc6d6]);
  });
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
    const img = (key, x, y, ox, oy) => scene.add.image(x, y, key).setOrigin(ox, oy);
    this.root = scene.add.container(0, 0).setDepth(7);

    this.cape = img('c_cape', -6, -42, 1, 0.08);
    this.tanks = img('c_tanks', -16, -36, 0.5, 0.5);
    this.legB = img('c_leg', -6, -16, 0.5, 0);
    this.bootB = img('c_boot', -6, 0, 0.5, 1);
    this.torso = scene.add.container(0, -16);
    this.body = img('c_body', 0, 3, 0.5, 1);
    this.belly = img('c_belly', 7, -9, 0.5, 0.35);                  // pokes out under the front of the suit
    this.armB = img('c_arm', -3, -22, 0, 0.5);
    this.apron = img('c_apron', -7, -30, 0.5, 0);
    this.head = img('c_head', 2, -44, 0.5, 0.5);
    this.hat = img('c_hat', 3, -54, 0.5, 1);
    this.torso.add([this.apron, this.belly, this.body, this.armB, this.head, this.hat]);     // apron hangs BEHIND him so the belly is on show
    this.legF = img('c_leg', 7, -16, 0.5, 0);
    this.bootF = img('c_boot', 7, 0, 0.5, 1);
    this.gunArm = scene.add.container(4, -42);
    this.gArm = img('c_arm', 0, 0, 0, 0.5);
    this.gun = img('c_gun', 4, 1, 0, 15 / 26).setScale(1.25);   // barrel centre lines up with the arm; a big chunky gun
    this.auger = img('auger0', 44, 1, 0, 0.5).setScale(1.25);
    this.gunArm.add([this.gArm, this.gun, this.auger]);
    this.root.add([this.cape, this.tanks, this.legB, this.bootB, this.torso, this.legF, this.bootF, this.gunArm]);

    this.parts = [this.cape, this.tanks, this.legB, this.bootB, this.body, this.belly, this.armB, this.apron, this.head, this.hat, this.legF, this.bootF, this.gArm, this.gun];
    this.tinted = false;
    this.wp = 0;          // waddle phase
    this.t = 0;
    this.c = 0;           // 0 = apron, 1 = cape
    this.squash = 0;
    this.recoil = 0;
    this.wasGround = true;
    this.vhPrev = 0;
  }

  setPowered(on) {
    if (on === this.tinted) return;
    this.tinted = on;
    for (const p of this.parts) { if (on) p.setTint(0xffe9a0); else p.clearTint(); }
  }

  // P = player state, (x, y) = screen position of his feet, z = world zoom, alpha = hit flicker, augerFrame = 0..3
  update(P, dt, x, y, z, alpha, augerFrame) {
    this.t += dt;
    const t = this.t;
    const grounded = P.h <= (P.floor || 0) + 0.5 && P.vh <= 0;
    const spd = Math.abs(P.vx);
    const run = grounded ? Math.min(1, spd / 140) : 0;

    // ---- phases
    if (grounded && spd > 10) this.wp += dt * (spd / 230) * 8;
    if (!this.wasGround && grounded) { this.squash = 1; this.bv = (this.bv || 0) + 5; }   // landing squash (and a belly wobble)
    if (this.wasGround && !grounded && P.vh > 200) this.squash = -0.8;   // take-off stretch
    this.wasGround = grounded;
    this.squash += (0 - this.squash) * Math.min(1, dt * 9);
    const sq = this.squash;
    const sw = Math.sin(this.wp);
    const air = grounded ? 0 : 1;
    const fly = P.thrusting ? 1 : 0;

    // ---- cape / apron swap (the apron spins edge-on, then the cape unfurls)
    const target = (!grounded || P.thrusting) ? 1 : 0;
    this.c += (target - this.c) * Math.min(1, dt * 10);
    const c = this.c;
    this.apron.setScale(1.15 * Math.cos(Math.min(c, 0.5) * Math.PI), 0.95).setVisible(c < 0.5);
    const cp = Math.max(0, Math.min(1, (c - 0.3) / 0.7));
    this.cape.setVisible(cp > 0.02).setScale(cp, 0.6 + 0.4 * cp).setAlpha(cp);
    this.cape.setRotation(0.25 * cp + Math.sin(t * 17) * 0.09 * cp * (1 + fly) - P.vh * 0.00035);

    // ---- waddle: legs, boots and body roll
    const legAmp = 0.38 * run;
    const rotF = sw * legAmp + air * (0.45 + fly * 0.1 * Math.sin(t * 22));
    const rotB = -sw * legAmp - air * (0.3 + fly * 0.1 * Math.cos(t * 22));
    const L = 16;
    const place = (leg, boot, hipX, rot, liftPhase) => {
      leg.setRotation(rot);
      const lift = run > 0 ? Math.max(0, liftPhase) * 3.2 * run : 0;
      boot.setPosition(hipX - Math.sin(rot) * L, -16 + Math.cos(rot) * L - lift + air * -3);
      boot.setRotation(rot * 0.35);
      leg.setPosition(hipX, -16 - lift * 0.6);
    };
    place(this.legF, this.bootF, 7, rotF, sw);
    place(this.legB, this.bootB, -6, rotB, -sw);

    const idle = (1 - run) * (1 - air);
    this.torso.setPosition(sw * 1.9 * run, -16 - (1 - Math.cos(this.wp * 2)) * 0.9 * run + Math.sin(t * 2.6) * 0.7 * idle);
    this.torso.setRotation(sw * 0.1 * run + 0.06 * run - P.vh * 0.00022 * air);
    const stretchY = air ? 1 + Math.max(-0.1, Math.min(0.12, P.vh / 2000)) : 1;
    this.torso.setScale(1 + 0.16 * Math.max(0, sq) - 0.08 * Math.max(0, -sq) + Math.sin(t * 2.6) * 0.012 * idle,
      stretchY - 0.18 * Math.max(0, sq) + 0.1 * Math.max(0, -sq) + Math.sin(t * 2.6 + 1) * 0.018 * idle);

    // belly jiggle on every footfall
    this.body.setScale(1, 1 + Math.abs(Math.cos(this.wp)) * 0.05 * run);
    // belly jiggle: a little spring driven by the waddle and by landings
    this.bo = this.bo || 0; this.bv = this.bv || 0;
    const drive = run * Math.sin(this.wp * 2) * 3;
    this.bv += (-this.bo * 170 - this.bv * 8 + drive * 55) * dt;
    this.bo = Math.max(-1.4, Math.min(1.4, this.bo + this.bv * dt));
    this.belly.setScale(1 - this.bo * 0.1, 1 + this.bo * 0.16).setPosition(7 + this.bo * 0.6, -9 + this.bo * 1.6);

    // ---- chef-hat helmet lags behind
    const vyLag = Math.max(-7, Math.min(8, P.vh * 0.011));
    this.hat.setPosition(3 - sw * 2.2 * run, -54 + vyLag * 0.6 + Math.sin(t * 5) * 0.5);
    this.hat.setRotation(-sw * 0.16 * run - P.vh * 0.0004 - 0.04 * Math.sin(t * 5));
    this.hat.setScale(1 + vyLag * -0.006, 1 + vyLag * 0.012 + Math.sin(t * 5.5) * 0.015);
    this.head.setPosition(2 + sw * 0.6 * run, -44 + vyLag * 0.2);

    // ---- arms
    this.armB.setRotation(-sw * 0.8 * run + 0.35 + Math.sin(t * 2.2) * 0.07 * idle - air * 1.2);
    if (P.firing > 0.09) this.recoil = 1;
    this.recoil = Math.max(0, this.recoil - dt * 9);
    this.gunArm.setPosition(this.torso.x + 4 - this.recoil * 3, this.torso.y - 26 + sw * 0.6 * run);
    this.gunArm.setRotation(-this.recoil * 0.07 + sw * 0.03 * run + this.torso.rotation * 0.4);
    if (this.tipSpins !== false) this.auger.setTexture('auger' + augerFrame);
    this.tanks.setPosition(this.torso.x - 16, this.torso.y - 24);

    this.setPowered(P.power > 0);
    this.duckA = (this.duckA || 0) + ((P.duck ? 1 : 0) - (this.duckA || 0)) * Math.min(1, dt * 16);   // crouch: squash down, spread a little
    const dk = this.duckA;
    this.gunArm.setScale(1 / (1 + 0.12 * dk), 1 / (1 - 0.42 * dk));      // crouching squashes Chris, not his gun
    this.root.setPosition(x, y).setScale(z * RIG_SCALE * (P.facing < 0 ? -1 : 1) * (1 + 0.12 * dk), z * RIG_SCALE * (1 - 0.42 * dk)).setAlpha(alpha);
  }
}
