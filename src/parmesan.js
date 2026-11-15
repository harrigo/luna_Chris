// ===== L9: PARMESAN PRIME (v2.78, part 1) =====
// The rats' homeworld: one colossal, ancient wheel of Parmesan, rock-hard and glittering with crunchy crystals, its rind
// stamped with giant dotted lettering. A decadent rat empire sits on top (gold domes, marble columns, banners, statues of
// the King), and it's all coming apart, because the rats have been grating their own planet for cheese.
//  * THE ROYAL RASP: a planet-sized grater blade on cables from a mining ship sweeps right round the world. A siren, a
//    warning on the side it's coming from and a red band at its height: LOW (jump it) or HIGH (duck under it). It shreds
//    any rat in its way, and every pass grates a layer off: the planet gets SMALLER all level (520 -> 380).
//  * The ground cracks and then falls away into chasms (down to the glowing core): fall in and you're hauled out a heart
//    lighter. They're refilled with rubble after a while.
//  * Palace rubble rains down (columns, statue heads, gold dome chunks), a shadow showing where.
//  * The Rat Empire's finest: ROYAL GUARDS (tower shield in front - shots plink off; slow to turn; halberd jab),
//    GRENADIERS (lob rind grenades that bounce once then go off), THE TAXMAN (snatches your cheddar and legs it - splat
//    him for a refund with interest) and COCKROACH CAVALRY (paw the ground, then charge straight through: jump it).
// Part 2 brings the Parmesan Colossus and the escape to the Royal Saucer.

function makeParmTextures(scene) {
  if (typeof makeParmArt === 'function') makeParmArt(scene);         // (v2.80) the city, the machines, the props (parmart.js)
  if (scene.game.__parmTex) return; scene.game.__parmTex = true;
  const INK = 0x1a1020, FUR = [0xc4c8dc, 0x868ca6, 0x4a4f6a], PINK = [0xffb0c0, 0xe07a90, 0xa04a60], GOLD = [0xfff0a0, 0xffc83a, 0xb07a1a],
    RED = [0xff5a4a, 0xc81e2a, 0x6a0a14], MARB = [0xfff8ec, 0xe0d8c8, 0x9a9282], STEEL = [0xe8eef8, 0xa8b0c0, 0x5a6272], ROACH = [0xb8703a, 0x7a3e18, 0x3a1a08];
  const ratHead = (a, x, y, f) => {                                    // a rat's head facing right (x,y = skull centre)
    a.ell(x, y, 7, 6, FUR); a.poly([[x + 4, y - 3], [x + 13, y + 1], [x + 4, y + 5]], FUR); a.ell(x + 13, y + 1, 1.8, 1.6, PINK);
    a.ell(x + 2, y - 1, 1.8, 1.8, 0xff2a1a); a.px(x + 2, y - 2, 0xffffff); a.rect(x + 8, y + 4, x + 9, y + 6, 0xfff4d8);
    for (let k = 0; k < 3; k++) a.line([[x + 11, y + 1], [x + 17, y - 1 + k * 2]], 0x2a2030);
  };
  // ---- ROYAL GUARD: plumed helmet, red tunic, a tower shield in front embossed with the rat crown, a halberd behind
  for (const f of [0, 1]) pixSprite(scene, 'ppguard' + (f ? '_b' : ''), 52, 60, a => {
    a.line([[10, 58], [12, 4]], 0x6a4a2a, 3); a.poly([[8, 10], [12, 0], [18, 8], [12, 14]], STEEL); a.poly([[12, 8], [20, 6], [18, 14]], STEEL);   // halberd
    const lg = f ? [[18, 59], [26, 57]] : [[16, 57], [27, 59]]; for (const [x, y] of lg) a.rect(x - 2, 44, x + 2, y, 0x3a2a40);
    a.ell(22, 36, 11, 12, RED); a.rect(14, 40, 30, 43, GOLD[1]);                                           // tunic + belt
    ratHead(a, 22, 20, f); a.poly([[14, 16], [22, 6], [30, 16]], STEEL); a.rect(14, 15, 30, 17, GOLD[1]);   // helmet
    a.poly([[20, 7], [26, 0], [30, 2], [24, 9]], RED);                                                     // plume
    a.rrect(31, 18, 49, 56, 3, [0xd8b850, 0xa88420, 0x5a420a]); a.rrect(34, 22, 46, 52, 2, RED);            // tower shield
    a.poly([[36, 32], [38, 26], [40, 30], [42, 26], [44, 32]], GOLD); a.rect(36, 32, 44, 34, GOLD[1]);     // the crown on it
    for (const [x, y] of [[33, 20], [47, 20], [33, 54], [47, 54]]) a.px(x, y, 0xfff4c0);
  });
  // ---- GRENADIER: a towering bearskin hat, a bandolier of rind grenades; frame b winds up to throw
  for (const f of [0, 1]) pixSprite(scene, 'ppgren' + (f ? '_b' : ''), 44, 52, a => {
    a.rect(14, 38, 18, 51, 0x3a2a40); a.rect(23, 38, 27, 51, 0x3a2a40);
    a.ell(20, 30, 10, 11, [0x5a7ad8, 0x2a4aa8, 0x142a5a]); a.line([[12, 22], [28, 40]], 0x6a4a2a, 3);
    for (const [x, y] of [[15, 26], [20, 31], [25, 36]]) a.ell(x, y, 2.5, 2.5, [0xe8d8a0, 0xb8a060, 0x6a5a2a]);
    ratHead(a, 20, 16, f); a.rrect(11, -1, 29, 14, 4, [0x4a3a3a, 0x2a1e1e, 0x120a0a]); a.rect(11, 11, 29, 13, RED[1]);   // bearskin
    if (f) { a.line([[26, 26], [34, 14], [36, 8]], FUR[1], 3); a.ell(37, 6, 3.5, 3.5, [0xe8d8a0, 0xb8a060, 0x6a5a2a]); a.px(39, 3, 0xffd23f); }
    else a.line([[26, 26], [32, 32]], FUR[1], 3);
  });
  // ---- THE TAXMAN: a fat rat in a top hat and monocle, a sack over his shoulder
  for (const f of [0, 1]) pixSprite(scene, 'pptax' + (f ? '_b' : ''), 50, 50, a => {
    const lg = f ? [[17, 49], [27, 47]] : [[15, 47], [29, 49]]; for (const [x, y] of lg) a.rect(x - 2, 40, x + 2, y, 0x2a2030);
    a.ell(10, 24, 9, 10, [0xd8b878, 0xa8884a, 0x6a5428]); a.line([[8, 18], [12, 16]], 0x6a5428); a.rect(6, 26, 13, 28, 0x6a5428);   // the sack (with a coin mark)
    a.ell(9, 27, 3, 3, GOLD);
    a.ell(23, 32, 13, 11, [0x5a5a6a, 0x3a3a4a, 0x1e1e2a]); a.rect(21, 22, 25, 40, 0xf0f0f0); a.px(23, 26, RED[1]); a.px(23, 30, RED[1]);   // waistcoat
    a.line([[16, 33], [28, 34]], GOLD[1]);                                                                 // watch chain
    ratHead(a, 25, 15, f);
    a.line([[25, 11], [29, 11]], GOLD[1]); a.ell(27, 14, 2.6, 2.6, 0xbfe8ff); a.line([[29, 15], [29, 20]], GOLD[1]);   // monocle
    a.rect(17, -1, 30, 7, 0x1a1a22); a.rect(14, 7, 33, 9, 0x1a1a22); a.rect(17, 5, 30, 6, RED[1]);          // top hat
  });
  // ---- COCKROACH CAVALRY: a rat in a little crown riding a giant greasy cockroach, lance couched
  for (const f of [0, 1]) pixSprite(scene, 'ppcav' + (f ? '_b' : ''), 76, 52, a => {
    for (let k = 0; k < 3; k++) { const x = 18 + k * 14, s = (k + f) % 2 ? 4 : -4; a.line([[x, 38], [x + s, 44], [x + s * 2, 51]], 0x2a1408, 2); }
    a.ell(36, 36, 26, 9, ROACH); a.ell(30, 33, 14, 4, 0xd8904a); a.line([[12, 36], [60, 36]], 0x3a1a08);   // glossy shell + its seam
    a.ell(64, 38, 8, 6, ROACH); a.line([[68, 34], [76, 22]], 0x3a1a08); a.line([[66, 34], [72, 20]], 0x3a1a08);   // head + antennae
    a.ell(66, 37, 1.5, 1.5, 0xfff4c0);
    a.ell(32, 22, 8, 8, RED); ratHead(a, 33, 10, f); a.poly([[27, 5], [29, 0], [32, 3], [35, 0], [38, 3], [40, 0], [40, 5]], GOLD);   // rider + crown
    a.line([[30, 24], [64, 16]], 0x6a4a2a, 2); a.poly([[62, 14], [72, 15], [62, 19]], STEEL);              // lance
  });
  pixSprite(scene, 'ppgrenade', 14, 16, a => { a.ell(7, 10, 6, 6, [0xe8d8a0, 0xb8a060, 0x6a5a2a]); for (const [x, y] of [[5, 8], [9, 12]]) a.ell(x, y, 1.2, 1, 0x8a7a40); a.rect(6, 1, 8, 4, 0x6a6a72); a.px(7, 0, 0xffd23f); });
  // ---- palace rubble that rains down
  pixSprite(scene, 'pp_column', 26, 46, a => { a.rect(4, 2, 22, 44, MARB[1]); for (const x of [7, 11, 15, 19]) a.line([[x, 4], [x, 42]], MARB[2]); a.rect(2, 0, 24, 5, MARB); a.poly([[2, 40], [24, 38], [22, 46], [4, 46]], MARB); a.line([[6, 20], [14, 26], [10, 32]], 0x5a5242); });
  pixSprite(scene, 'pp_head', 40, 36, a => {                                     // a marble statue head of the Rat-King, crown and all
    a.ell(16, 20, 13, 12, MARB); a.poly([[24, 14], [40, 22], [24, 28]], MARB); a.ell(39, 22, 2, 2, MARB[2]);
    a.poly([[6, 10], [8, 2], [12, 7], [16, 1], [20, 7], [24, 2], [26, 10]], GOLD); a.ell(16, 18, 3, 3, MARB[2]); a.line([[4, 26], [12, 30], [8, 34]], 0x5a5242);
  });
  pixSprite(scene, 'pp_dome', 40, 26, a => { a.ell(20, 22, 19, 16, GOLD); a.rect(0, 22, 40, 26, 0x1a1020); a.line([[8, 10], [12, 20]], GOLD[2]); a.line([[20, 6], [20, 20]], GOLD[2]); a.line([[32, 10], [28, 20]], GOLD[2]); a.ell(14, 12, 3, 2, 0xffffff); });
  // ---- the ruined empire on the surface
  pixSprite(scene, 'ppstatue', 50, 92, a => {                                     // a statue of the King, cracked, an arm gone
    a.rect(6, 78, 44, 91, MARB[2]); a.rect(4, 74, 46, 80, MARB); a.rect(14, 82, 36, 86, GOLD[1]);
    a.ell(25, 54, 13, 20, MARB); a.poly([[13, 70], [37, 70], [40, 76], [10, 76]], MARB); a.line([[34, 44], [44, 30], [46, 22]], MARB[1], 5);   // robe, sceptre arm
    a.ell(46, 20, 3, 3, GOLD); ratHead(a, 25, 27, 0); a.poly([[17, 20], [19, 12], [23, 17], [27, 11], [31, 17], [33, 20]], GOLD);
    a.line([[20, 40], [28, 52], [24, 64]], 0x5a5242, 2); a.line([[28, 52], [34, 56]], 0x5a5242); a.ell(12, 44, 3, 2, 0x5a5242);   // cracks, a stump
  });
  pixSprite(scene, 'ppcol', 28, 80, a => { a.rect(4, 74, 24, 79, MARB); a.rect(6, 18, 22, 74, MARB[1]); for (const x of [9, 13, 17]) a.line([[x, 18], [x, 72]], MARB[2]); a.poly([[6, 18], [10, 8], [15, 14], [19, 4], [22, 18]], MARB); a.line([[10, 40], [16, 48]], 0x5a5242); });
  pixSprite(scene, 'ppbanner', 34, 90, a => {
    a.line([[4, 89], [4, 2]], 0x6a4a2a, 3); a.ell(4, 2, 2.5, 2.5, GOLD);
    a.poly([[6, 6], [32, 6], [30, 40], [24, 34], [20, 48], [14, 36], [6, 44]], RED); a.rect(6, 6, 32, 9, GOLD[1]);
    a.poly([[13, 22], [15, 16], [18, 20], [21, 16], [24, 22]], GOLD); a.rect(13, 22, 24, 24, GOLD[1]);
  });
  if (typeof makeParmFolk === 'function') makeParmFolk(scene);
  if (typeof makeParmStatues === 'function') makeParmStatues(scene);
  if (typeof makeParmDeep === 'function') makeParmDeep(scene);
  if (typeof makeParmFolk2 === 'function') makeParmFolk2(scene);   // (v2.91) everyone repainted, and the new folk of the mines and the core   // (v2.90) the mines and the crystal core   // (v2.82) the King's statues, sculpted       // (v2.80) repainted richer: guards, grenadiers, the Taxman, cavalry, the Colossus
}

Object.assign(ENEMY, {
  ppguard: { hp: 9, r: 18, ch: 26, tex: 'ppguard', oy: 0.97, drop: 0.4, ai: 'ppguard', k: 1.25, frames: ['ppguard', 'ppguard_b'], fps: 5 },
  ppgren:  { hp: 5, r: 15, ch: 22, tex: 'ppgren',  oy: 0.97, drop: 0.35, ai: 'ppgren', k: 1.2, frames: ['ppgren', 'ppgren'], fps: 4 },
  pptax:   { hp: 6, r: 17, ch: 22, tex: 'pptax',   oy: 0.97, drop: 0.2, ai: 'pptax', k: 1.25, frames: ['pptax', 'pptax_b'], fps: 9 },
  ppcav:   { hp: 7, r: 24, ch: 20, tex: 'ppcav',   oy: 0.97, drop: 0.4, ai: 'ppcav', k: 1.25, frames: ['ppcav', 'ppcav_b'], fps: 10 },
});

const inView0 = (sc, th) => Math.abs(angDiff(th, sc.viewT())) < sc.visHalf + 0.4;
const PP_RMIN = 380;
// (v2.90) THE COLLAPSING LAYERS. Parmesan Prime is grated so hard the crust gives way: after wave 1 the Imperial City
// collapses and Chris drops through to THE MINES; after wave 2 they cave in too and he falls to THE CRYSTAL CORE (wave 3
// and the boss). Each layer is smaller (520 -> 420 -> 320), and the Rasp keeps shaving it down in between.
const PP_LAYERS = [
  { R: 520, name: 'THE IMPERIAL CITY' },
  { R: 420, name: 'THE MINES', sub: 'DOWN WHERE THE GRATERS DIG' },
  { R: 320, name: 'THE CRYSTAL CORE', sub: 'THE HEART OF PARMESAN PRIME' },
  { R: 250, name: 'THE MOLTEN HEART', sub: 'THE BOTTOM OF EVERYTHING' },     // (v2.91) the boss's arena: one more drop
];
const ParmMixin = {
  parmInit() {
    this.pp = { rasp: { st: 'idle', t: 9, theta: 0, dir: 1, kind: 'low', hitDone: false, passes: 0, run: 0 }, cracks: [], crackT: 7, nades: [], taxmen: [], R0: R, sparkle: 0, layer: 0, rmin: PP_LAYERS[0].R - 70, geysers: [], drop: null, trails: [], gwaves: [] };
    // (v2.80) THE CITY on the horizon (behind the planet's curve: their feet are hidden by it), two layers, plus the
    // mining machines chewing at it; braziers burning in the street; the mining mothership up in the sky
    const NEAR = ['ppb_palace', 'ppb_minaret', 'ppb_drill', 'ppb_temple', 'ppb_arch', 'ppb_statue', 'ppb_grater', 'ppb_minaret'], FAR = ['ppb_minaret', 'ppb_palace', 'ppb_statue', 'ppb_temple', 'ppb_drill', 'ppb_arch'];
    this.ppCity = [];
    NEAR.forEach((k, i) => { const im = this.add.image(0, 0, k).setOrigin(0.5, 1).setDepth(1.0).setTint(0xf0d8c8); im.bsx = im.bsy = k === 'ppb_drill' ? 1.25 : 1.45; this.ppCity.push({ im, theta: i * TAU / NEAR.length + 0.17, h: -16, drill: k === 'ppb_drill' }); });
    // (the far skyline is a parallax ring now: depth.js 'skyline' / 'machines')
    this.ppFire = [];
    for (let i = 0; i < 6; i++) {
      const th = i * TAU / 6 + 0.42, base = this.add.image(0, 0, 'ppbrazier').setOrigin(0.5, 1).setDepth(2.55), fl = this.add.image(0, 0, 'ppflame0').setOrigin(0.5, 1).setDepth(2.56), gl = this.add.image(0, 0, 'puff').setDepth(2.54).setBlendMode(Phaser.BlendModes.ADD).setTint(0xff9a3a);
      base.bsx = base.bsy = 1.2; fl.bsx = fl.bsy = 1.3; gl.bsx = gl.bsy = 1.8; this.ppFire.push({ th, base, fl, gl, ph: i * 1.7 });
    }
    this.ppShip = this.add.image(0, 0, 'ppb_ship').setDepth(0.6).setScrollFactor(0).setAlpha(0.95);
    this.ppG = this.add.graphics().setDepth(7.7); this.ppBack = this.add.graphics().setDepth(2.9); this.ppHud = this.add.graphics().setDepth(19);
    // (v2.90) the underground: a dark sheet over the sky, the cavern roof (the underside of the layer above), shafts of light
    this.ppDark = this.add.graphics().setDepth(0.5).setScrollFactor(0).setVisible(false);
    this.ppRoof = this.add.graphics().setDepth(2.85); this.ppShaft = this.add.graphics().setDepth(2.86).setBlendMode(Phaser.BlendModes.ADD);
    this.ppDropFx = this.add.graphics().setDepth(18).setScrollFactor(0);
    if (this.cp && this.cp.wave) this.pp.pending = Math.min(3, this.cp.wave);      // a retry from a checkpoint: already down there (applied on the first draw, once the props exist)
  },

  // ---- (v2.90) swap the world to layer n
  ppApplyLayer(n) {
    const S = this.pp, L = PP_LAYERS[n]; S.layer = n; S.rmin = L.R - 70; R = L.R;
    if (n > 0) {
      const key = 'surf9_' + n; if (!this.textures.exists(key)) makeParmPlanet(this, key, L.R, { layer: n });
      if (this.planetImg) this.planetImg.setTexture(key);
      if (this.planetShade) { const sk = 'shade9_' + n; if (!this.textures.exists(sk)) makePlanetShade(this, sk, L.R, this.def.surface.rimLight, this.def.surface.dark); this.planetShade.setTexture(sk); }   // (sized for the new radius)
      for (const B of this.ppCity || []) B.im.destroy(); this.ppCity = [];
      for (const F of this.ppFire || []) [F.base, F.fl, F.gl].forEach(o => o.destroy()); this.ppFire = [];
      if (this.ppShip) { this.ppShip.destroy(); this.ppShip = null; }
      for (const p of this.props || []) { p.spr.destroy(); if (p.halo) p.halo.destroy(); } this.props = [];
      const add = (tex, n2, sc, tint, h, depth) => { for (let i = 0; i < n2; i++) { const spr = this.add.image(0, 0, tex).setOrigin(0.5, 1).setDepth(depth || 2.5); if (tint) spr.setTint(tint); spr.bsx = spr.bsy = rnd(sc[0], sc[1]) * 1.35; if (Math.random() < 0.5) spr.setFlipX(true);
        this.props.push({ spr, halo: null, theta: wrap((i + rnd(0.1, 0.9)) * TAU / n2 + n * 0.37), h: h === undefined ? -2 : h, sway: -1, ph: rnd(0, 6) }); } };
      if (n === 1) { add('ppmine_prop', 7, [0.75, 0.95]); add('ppmine_cart', 4, [0.6, 0.75]); add('ppmine_wheel', 3, [0.8, 1], 0x9a8070, -6, 0.97); add('ppcrys2', 4, [0.45, 0.6]); add('pprubble', 4, [0.9, 1.2]); add('ppcolbroke', 3, [0.9, 1.1], 0x8a7a6a); }
      else if (n === 3) { add('ppcrys3', 3, [0.8, 1.1], 0xc06040); add('ppcrys1', 3, [1.2, 1.5], 0x8a3a20, -10, 0.97); add('pprubble', 3, [0.9, 1.1], 0xa06a4a); }
      else { add('ppcrys1', 6, [0.7, 1]); add('ppcrys3', 4, [0.6, 0.85]); add('ppcrys2', 6, [0.5, 0.7]); add('ppcrys1', 4, [1.4, 1.8], 0x8a6a40, -10, 0.97); add('ppcolbroke', 2, [0.8, 1], 0x7a6a5a); }
      for (const C of S.cracks) { const i = this.craters.indexOf(C.cr); if (i >= 0) this.craters.splice(i, 1); } S.cracks = [];
      const ng = [0, 3, 5, 4][n]; S.geysers = Array.from({ length: ng }, (_, i) => ({ theta: wrap(i * TAU / ng + 0.6), st: 'idle', t: 4 + i * 2.3 }));
      S.rasp.st = 'idle'; S.rasp.t = 10;
      this.ppDark.setVisible(true);
    }
  },
  // the wave gate (main.js updateWaves): before wave 2 and wave 3, the crust gives way first
  parmGate() {
    const S = this.pp; if (!S) return false;
    if (S.drop) return true;
    const next = this.waveIdx + 1;
    if ((next === 1 || next === 2 || next === 3) && S.layer < next) { this.ppStartDrop(next); return true; }
    return false;
  },
  ppStartDrop(n) {
    const S = this.pp; S.drop = { to: n, st: 'quake', t: 0 };
    this.banner('THE CRUST IS GIVING WAY!'); Sound.sfx('alarm'); Sound.sfx('grind');
    S.rasp.st = 'idle'; S.rasp.t = 99;
  },
  // while he's falling, this runs instead of updatePlayer
  parmDropPlayer(dt) {
    const P = this.pl, D = this.pp.drop; P.vx = 0; P.invuln = Math.max(P.invuln, 1);
    if (D.st === 'fall') P.sink = (P.sink || 0) + dt * (120 + D.t * 600);
  },
  ppDropUpdate(dt) {
    const S = this.pp, D = S.drop, P = this.pl; if (!D) return; D.t += dt;
    if (D.st === 'quake') {
      const k = Math.min(1, D.t / 3.2);
      if (Math.random() < dt * (4 + 10 * k)) this.cameras.main.shake(120, 0.004 + 0.012 * k);
      if (Math.random() < dt * (3 + 8 * k)) { const th = wrap(P.theta + rnd(-1, 1) * this.visHalf), im = this.add.image(0, 0, ['pp_column', 'pp_head', 'pp_dome', 'db_rock', 'pprubble'][Math.floor(Math.random() * 5)]).setDepth(6.5); im.bsx = im.bsy = rnd(0.8, 1.6);
        this.parts.push({ theta: th, h: rnd(380, 520), vt: rnd(-30, 30), vh: rnd(-200, -60), life: 3, stay: true, spr: im, rot: rnd(0, 6), rv: rnd(-4, 4) }); }
      if (Math.random() < dt * 6) { const th = wrap(P.theta + rnd(-1, 1) * this.visHalf); this.burst(th, 2, 'crumb', 6, 0.8); }
      if (Math.random() < dt * 2.5) Sound.sfx(Math.random() < 0.5 ? 'crash' : 'grind');
      for (const B of this.ppCity || []) { B.h -= dt * 30 * k; B.im.setRotation((B.im.rotation || 0) + dt * 0.05 * (B.theta % 1 < 0.5 ? 1 : -1)); }
      if (D.t > 3.2 && P.h <= 0.5) {                                                      // the ground under him splits
        D.st = 'fall'; D.t = 0; Sound.sfx('crash'); Sound.sfx('whoosh'); buzz([60, 30, 120]); this.cameras.main.shake(400, 0.02);
        this.burst(P.theta, 4, 'crumb', 40, 2); this.banner('AAAAAAARGH!');
        for (const e of this.enemies) if (e.type !== 'boss') { e.quietKill = true; e.hp = 0; }
      }
    } else if (D.st === 'fall') {
      if (D.t > 1.1 && !D.swapped) {
        D.swapped = true; this.ppApplyLayer(D.to); P.sink = 0; P.h = 420; P.vh = -120; P.pitFall = 0;
        D.st = 'land'; D.t = 0; Sound.sfx('whoosh');
      }
    } else if (D.st === 'land') {
      if (P.h <= 0.5 || D.t > 4) {
        this.cameras.main.shake(300, 0.016); Sound.sfx('crash'); this.burst(P.theta, 4, 'crumb', 24, 1.4);
        const L = PP_LAYERS[D.to]; this.banner(L.name + '\n' + L.sub);
        S.drop = null; this.nextWave();
      }
    }
  },
  parmUpdate(dt, bossUp) {
    const S = this.pp, P = this.pl; if (!S || this.state !== 'play') return;
    if (S.drop) this.ppDropUpdate(dt);
    // ---- (v2.90) molten-cheese geysers down in the mines and the core: bubbling... then a scalding column
    for (const G of S.geysers) {
      G.t -= dt;
      if (G.st === 'idle' && G.t <= 0) { G.st = 'warn'; G.t = 1.3; if (inView0(this, G.theta)) Sound.sfx('hiss'); }
      else if (G.st === 'warn') { if (Math.random() < dt * 14) this.burst(G.theta, 2, 'spark', 1, 0.5); if (G.t <= 0) { G.st = 'blow'; G.t = 1.5; if (inView0(this, G.theta)) { Sound.sfx('boom'); this.cameras.main.shake(150, 0.006); } } }
      else if (G.st === 'blow') {
        if (Math.random() < dt * 30) { const im = this.add.image(0, 0, 'puff').setDepth(6.6).setTint(Math.random() < 0.5 ? 0xffb52a : 0xffe08a); im.bsx = im.bsy = rnd(0.5, 1); this.parts.push({ theta: wrap(G.theta + rnd(-12, 12) / R), h: rnd(150, 230), vt: rnd(-60, 60), vh: rnd(-40, 120), life: 0.8, spr: im }); }
        if (Math.abs(angDiff(P.theta, G.theta)) * R < 22 && P.h < 230 && P.invuln <= 0 && !S.drop) { this.hurt(); this.popup(P.theta, P.h + 60, 'SCALDED!', '#ffb52a'); P.vh = 380; P.vx = (Math.sign(angDiff(P.theta, G.theta)) || 1) * 300; }
        for (const e of this.enemies) if (e.type !== 'boss' && e.hp > 0 && Math.abs(angDiff(e.theta, G.theta)) * R < 22 && e.h < 230) { e.hp = 0; this.addScore(100); }
        if (G.t <= 0) { G.st = 'idle'; G.t = rnd(4, 7); }
      }
    }
    // ---- (v2.91) the slugs' burning trails, the golems' shockwaves
    for (const T of S.trails) { T.t -= dt; if (T.t > 0.5 && Math.abs(angDiff(P.theta, T.theta)) * R < 14 && P.h < 4 && P.invuln <= 0) { this.hurt(); this.popup(P.theta, P.h + 60, 'HOT HOT HOT!', '#ffb52a'); P.vh = 300; } }
    S.trails = S.trails.filter(T => T.t > 0);
    for (const Wv of S.gwaves) { const v = 320 * dt; Wv.run += v; Wv.theta = wrap(Wv.theta + Wv.dir * v / R);
      if (!Wv.hit && Math.abs(angDiff(P.theta, Wv.theta)) * R < 18 && P.h < 14 && P.invuln <= 0) { Wv.hit = true; this.hurt(); P.vh = 420; this.popup(P.theta, P.h + 60, 'SHOCKWAVE!', '#9fd8ff'); }
      if (Math.random() < dt * 30 && inView0(this, Wv.theta)) this.burst(Wv.theta, 2, 'spark', 1, 0.6); }
    S.gwaves = S.gwaves.filter(Wv => Wv.run < 340);
    // ---- THE ROYAL RASP
    const RS = S.rasp; RS.t -= dt;
    if (RS.st === 'idle' && RS.t <= 0 && !bossUp && !S.drop && R > S.rmin + 2) {
      RS.st = 'warn'; RS.t = 2.6; RS.dir = Math.random() < 0.5 ? 1 : -1; RS.kind = RS.passes % 3 === 2 ? 'high' : (Math.random() < 0.6 ? 'low' : 'high'); RS.hitDone = false;
      Sound.sfx('alarm'); if (!RS.passes) this.banner('THE ROYAL RASP!\nIT\'S GRATING THE PLANET!'); else this.banner(RS.kind === 'low' ? 'RASP! JUMP!' : 'RASP! DUCK!');
    } else if (RS.st === 'warn') {
      if (Math.floor(RS.t * 4) !== Math.floor((RS.t + dt) * 4)) Sound.sfx('blip');
      if (RS.t <= 0) { RS.st = 'pass'; RS.theta = wrap(P.theta - RS.dir * (this.visHalf + 0.9)); RS.run = 0; Sound.sfx('grind'); Sound.sfx('crash'); }
    } else if (RS.st === 'pass') {
      // (v2.85) it rumbles in at a steady 470 px/s near Chris (it was 820 - too fast to react to), and only speeds up
      // round the back of the planet where you can't see it
      const dist = Math.abs(angDiff(P.theta, RS.theta)) * R, ahead = angDiff(P.theta, RS.theta) * RS.dir > 0;
      const sp = (dist < 900 || ahead ? 470 : 1100) / R; RS.theta = wrap(RS.theta + RS.dir * sp * dt); RS.run += sp * dt;
      // shavings: curls of Parmesan peeling off the cutting edge, arcing up and back and raining down behind it
      if (inView0(this, RS.theta) && (RS.shT = (RS.shT || 0) - dt) <= 0) { RS.shT = 0.014;
        const [g0, g1] = RS.kind === 'low' ? [0, 36] : [24, 118], half = 150 / R, edge = wrap(RS.theta + RS.dir * half * 0.9);
        const im = this.add.image(0, 0, Math.random() < 0.7 ? 'ppshave' : 'ppshave2').setDepth(Math.random() < 0.5 ? 7.2 : 4.6); im.bsx = im.bsy = rnd(1.2, 2.2);
        this.parts.push({ theta: edge, h: RS.kind === 'low' ? rnd(0, 8) : rnd(g0, g0 + 10), vt: -RS.dir * rnd(60, 260), vh: rnd(160, 420), life: rnd(1.8, 2.8), stay: true, spr: im, rot: rnd(0, 6), rv: rnd(-14, 14) });   // they land and lie there a moment
        if (Math.random() < 0.35) { const pf = this.add.image(0, 0, 'puff').setDepth(4.7).setTint(0xf2da92).setAlpha(0.5); pf.bsx = pf.bsy = rnd(0.4, 0.8); this.parts.push({ theta: edge, h: rnd(0, 20), vt: -RS.dir * rnd(20, 80), vh: rnd(20, 60), life: rnd(0.8, 1.3), noGrav: true, grow: 1.2, spr: pf }); }
        S.scars = S.scars || []; S.scars.push({ theta: edge, t: 4 });                 // the freshly grated ground behind it
      }
      R = Math.max(S.rmin, R - 30 * (sp * dt) / TAU);                   // (v2.90) every lap grates ~30 units off this layer
      const near = Math.abs(angDiff(P.theta, RS.theta)) * R;
      if (near < 500 && Math.random() < dt * 12) { this.cameras.main.shake(60, 0.006); if (Math.random() < 0.3) Sound.sfx('grind'); }
      const [h0, h1] = RS.kind === 'low' ? [0, 36] : [24, 118];
      if (!RS.hitDone && near < 150) {
        const top = P.h + (P.duck ? 19 : 34), bot = P.h + (P.duck ? 1 : 10);
        if (bot < h1 && top > h0 && P.invuln <= 0) { RS.hitDone = true; this.hurt(); this.popup(P.theta, P.h + 70, 'GRATED!', '#ffd23f'); P.vh = 300; }
      }
      // (v2.92) it's the Empire's own machine: the rats know the drill and hop it (or flatten under it) - it doesn't clear your waves for you
      for (const e of this.enemies) if (e.type !== 'boss' && !e.phased && e.hp > 0 && Math.abs(angDiff(e.theta, RS.theta)) * R < 220 && !e.raspDodge) {
        e.raspDodge = 0.8; if (RS.kind === 'low' && e.h <= 1 && e.type !== 'ppcart') e.vh = 420;
      }
      for (const e of this.enemies) if (e.raspDodge) { e.raspDodge -= dt; if (e.raspDodge <= 0) e.raspDodge = 0; }
      if (RS.run >= TAU) { RS.st = 'idle'; RS.t = rnd(11, 15); RS.passes++; this.popup(P.theta, P.h + 90, 'THE PLANET SHRANK!', '#ffb07a'); }
    }
    if (S.scars) { for (const q of S.scars) q.t -= dt; S.scars = S.scars.filter(q => q.t > 0); }
    // ---- the ground cracks... then falls away into a chasm
    S.crackT -= dt;
    const open = S.cracks.filter(c => c.st !== 'gone').length;
    if (S.crackT <= 0 && open < (S.layer ? 3 : 2) && !bossUp && !S.drop) {
      S.crackT = rnd(5.5, 9);
      const th = wrap(P.theta + (P.facing || 1) * rnd(0.12, 0.45) + rnd(-0.08, 0.08));
      if (!this.craters.some(c => Math.abs(angDiff(c.theta, th)) < 0.2) && !S.cracks.some(c => c.st !== 'gone' && Math.abs(angDiff(c.theta, th)) < 0.25)) {
        S.cracks.push({ theta: th, half: 36 / R, st: 'crack', t: 1.7 }); Sound.sfx('clunk'); Sound.sfx('grind');
      }
    }
    for (const C of S.cracks) {
      C.t -= dt;
      if (C.st === 'crack' && C.t <= 0) {
        C.st = 'open'; C.t = rnd(10, 13); C.cr = { theta: C.theta, half: C.half, kind: 'pit', pp: true }; this.craters.push(C.cr);
        this.burst(C.theta, 6, 'crumb', 22, 1.4); this.bang(C.theta, 4, 26); this.cameras.main.shake(220, 0.012); Sound.sfx('crash'); buzz([40, 20, 60]);
        for (let k = 0; k < 6; k++) { const im = this.add.image(0, 0, 'db_rock').setDepth(6).setTint(0xc8b080); im.bsx = im.bsy = rnd(0.8, 1.6); this.parts.push({ theta: wrap(C.theta + rnd(-1, 1) * C.half), h: 2, vt: rnd(-40, 40), vh: rnd(-260, -80), life: 0.8, spr: im }); }
      } else if (C.st === 'open' && C.t <= 0) {
        C.st = 'gone'; const i = this.craters.indexOf(C.cr); if (i >= 0) this.craters.splice(i, 1);
        this.burst(C.theta, 4, 'crumb', 12, 1); Sound.sfx('clunk');
      }
    }
    S.cracks = S.cracks.filter(c => c.st !== 'gone' || c.t > -1);
    // ---- grenades: bounce once, then go off
    for (let i = S.nades.length - 1; i >= 0; i--) {
      const N = S.nades[i]; N.fuse -= dt; N.vh -= this.gAt(N.theta) * dt; N.h += N.vh * dt; N.theta = wrap(N.theta + N.vt / R * dt); N.rot += N.vt / 30 * dt;
      if (N.h <= 0) { N.h = 0; if (N.vh < -80 && !N.bounced) { N.vh = -N.vh * 0.4; N.vt *= 0.5; N.bounced = true; Sound.sfx('tink'); } else { N.vh = 0; N.vt *= Math.max(0, 1 - dt * 6); } }
      this.place(N.spr, N.theta, N.h + 6, N.rot);
      if (N.fuse <= 0) {
        this.bang(N.theta, N.h + 6, 30); this.burst(N.theta, N.h + 6, 'spark', 12, 1); this.burst(N.theta, N.h + 6, 'crumb', 10, 1); Sound.sfx('boom'); this.cameras.main.shake(120, 0.008);
        if (dist2(N.theta, N.h, P.theta, P.h + 20) < (N.dyn ? 80 : 58) ** 2 && P.invuln <= 0) this.hurt();
        if (N.dyn) { this.bang(N.theta, N.h + 6, 50); this.burst(N.theta, 4, 'crumb', 20, 1.6); this.cameras.main.shake(260, 0.014);   // (v2.91) dynamite: blows a hole in the ground
          if (N.h < 10 && !this.craters.some(c => Math.abs(angDiff(c.theta, N.theta)) < 0.15)) S.cracks.push({ theta: N.theta, half: 30 / R, st: 'crack', t: 0.05 }); }
        N.spr.destroy(); S.nades.splice(i, 1);
      }
    }
    // ---- taxmen who died with your money: refund with interest
    for (const e of S.taxmen) if (!e.refunded && e.hp <= 0) {
      e.refunded = true;
      if (e.escaped) continue;
      if (e.loot > 0) { this.spillCheddar(e.theta, e.h + 30, e.loot * 2); this.banner('TAX REFUND!\n+' + e.loot * 2 + ' CHEDDAR'); Sound.sfx('power'); }
    }
    S.taxmen = S.taxmen.filter(e => !e.refunded);
    S.sparkle += dt;
    this.colUpdate(dt);
  },
  // ---- the empire's finest
  parmAI(e, dt, P, dirP) {
    const toP = angDiff(P.theta, e.theta), distP = Math.abs(toP) * R, side = Math.sign(toP) || 1, g = this.gAt(e.theta);
    const ground = () => { e.vh = (e.vh || 0) - g * dt; e.h += e.vh * dt; if (e.h <= 0) { e.h = 0; if (e.vh < 0) e.vh = 0; } };
    e.cd = (e.cd || 0) - dt; e.st = e.st || 'walk'; e.stT = (e.stT || 0) + dt;
    const set = s => { e.st = s; e.stT = 0; };
    if (e.type === 'ppguard') {
      if (e.face === undefined) e.face = side;
      if (side !== e.face && e.st === 'walk') { e.turnT = (e.turnT || 0) + dt; if (e.turnT > 0.6) { e.face = side; e.turnT = 0; Sound.sfx('clunk'); } } else e.turnT = 0;
      e.dir = e.face;
      if (e.st === 'walk') {
        if (distP > 55) e.theta = wrap(e.theta + e.face * 55 / R * dt);
        if (distP < 85 && side === e.face && e.cd <= 0 && P.h < 60) { set('wind'); Sound.sfx('swish'); }
      } else if (e.st === 'wind') { if (e.stT > 0.45) { set('jab'); Sound.sfx('swish'); e.theta = wrap(e.theta + e.face * 14 / R); } }
      else if (e.st === 'jab') {
        if (!e.jabbed && distP < 100 && side === e.face && P.h < 50 && P.invuln <= 0) { e.jabbed = true; this.hurt(); }
        if (e.stT > 0.25) { set('walk'); e.cd = 1.5; e.jabbed = false; }
      }
      ground();
    } else if (e.type === 'ppgren') {
      e.dir = side;
      if (e.st === 'walk') {
        if (distP < 230) e.theta = wrap(e.theta - side * 70 / R * dt); else if (distP > 380) e.theta = wrap(e.theta + side * 60 / R * dt);
        if (e.cd <= 0 && distP < 520) { set('wind'); e.spr.setTexture('ppgren_b'); }
      } else if (e.st === 'wind' && e.stT > 0.45) {
        const vt = side * Math.max(120, Math.min(380, distP * 0.95)), im = this.add.image(0, 0, 'ppgrenade').setDepth(6.2); im.bsx = im.bsy = 1.5;
        this.pp.nades.push({ theta: e.theta, h: e.h + 46, vt, vh: 420, fuse: 1.5, rot: 0, spr: im }); Sound.sfx('swish');
        set('walk'); e.cd = rnd(2.2, 3); e.spr.setTexture('ppgren');
      }
      ground();
    } else if (e.type === 'pptax') {
      if (!e.taxInit) { e.taxInit = true; e.loot = 0; this.pp.taxmen.push(e); }
      if (e.st === 'walk') {
        e.noTouch = true; e.dir = side; e.theta = wrap(e.theta + side * 175 / R * dt);
        if (distP < 26 && P.h < 40) {
          const sh = Shop.get(this.registry), take = Math.min(40, sh.coins || 0);
          if (take >= 5) { sh.coins -= take; Shop.set(this.registry, sh); e.loot = take; this.popup(P.theta, P.h + 70, 'TAXED! -' + take, '#ff9a5a'); Sound.sfx('cackle'); this.banner('THE TAXMAN!\nSPLAT HIM FOR A REFUND!'); }
          else { this.hurt(); Sound.sfx('cackle'); }
          set('flee'); e.fleeDir = -side;
        }
      } else if (e.st === 'flee') {
        e.dir = e.fleeDir; e.theta = wrap(e.theta + e.fleeDir * 215 / R * dt);
        if (Math.random() < dt * 8) this.burst(e.theta, 10, 'crumb', 1, 0.3);
        if (e.stT > 6.5) { e.escaped = true; e.quietKill = true; e.hp = 0; this.burst(e.theta, 30, 'spark', 14, 1); Sound.sfx('whoosh'); if (e.loot) this.popup(e.theta, 80, 'HE GOT AWAY WITH IT!', '#ff9a5a'); }
      }
      if (e.h <= 0 && Math.random() < dt * 3) e.vh = 120;
      ground();
    } else if (e.type === 'ppcav') {
      if (e.st === 'walk') {
        e.dir = side; e.theta = wrap(e.theta + side * 45 / R * dt);
        if (e.cd <= 0 && distP < 430 && distP > 90 && P.h < 120) { set('paw'); e.chDir = side; Sound.sfx('squeak'); }
      } else if (e.st === 'paw') {
        e.dir = e.chDir; if (Math.random() < dt * 14) this.burst(wrap(e.theta - e.chDir * 22 / R), 2, 'crumb', 1, 0.4);
        if (e.stT > 0.75) { set('charge'); Sound.sfx('growl'); }
      } else if (e.st === 'charge') {
        e.theta = wrap(e.theta + e.chDir * 400 / R * dt); if (Math.random() < dt * 20) this.burst(e.theta, 2, 'crumb', 1, 0.5);
        if (e.stT > 1.4 || (angDiff(P.theta, e.theta) * e.chDir < -220 / R)) { set('skid'); Sound.sfx('scrap'); }
      } else if (e.st === 'skid') { e.theta = wrap(e.theta + e.chDir * 400 * Math.max(0, 1 - e.stT * 2.2) / R * dt); if (e.stT > 0.55) { set('walk'); e.cd = rnd(2, 3); } }
      ground();
    }
    // ======== (v2.91) the folk of the mines and the core ========
    else if (e.type === 'ppminer') {                                    // burrows up under you, swings the pick, digs off again
      if (e.st === 'walk' && !e.dug) { e.dug = true; set('under'); }
      if (e.st === 'under') {
        e.phased = true; e.noTouch = true; e.spr.setAlpha(0); e.h = 0; e.dir = side;
        e.theta = wrap(e.theta + side * Math.min(130, distP * 3) / R * dt);
        if (Math.random() < dt * 14) this.burst(e.theta, 2, 'crumb', 1, 0.5);
        if (distP < 26 && e.stT > 1) { set('pop'); Sound.sfx('crash'); this.burst(e.theta, 4, 'crumb', 16, 1.2); this.cameras.main.shake(100, 0.006); }
      } else if (e.st === 'pop') {
        e.spr.setAlpha(1); e.phased = false; e.h = Math.min(0, -30 + e.stT * 120); e.vh = 0;
        if (e.stT < 0.25 && distP < 28 && P.h < 30 && P.invuln <= 0) { this.hurt(); P.vh = 360; }
        if (e.stT > 0.35) { e.h = 0; set('walk2'); e.noTouch = false; e.digT = rnd(5, 7); }
      } else if (e.st === 'walk2') {
        e.dir = side; if (distP > 40) e.theta = wrap(e.theta + side * 70 / R * dt);
        e.spr.setTexture('ppminer');
        if (distP < 70 && e.cd <= 0 && P.h < 60) { set('swing'); Sound.sfx('swish'); }
        if ((e.digT -= dt) <= 0) { set('under'); this.burst(e.theta, 4, 'crumb', 12, 1); Sound.sfx('clunk'); }
        ground();
      } else if (e.st === 'swing') {
        e.spr.setTexture(e.stT > 0.3 ? 'ppminer_b' : 'ppminer_r');
        if (e.stT > 0.3 && !e.hit && distP < 80 && P.h < 50 && P.invuln <= 0) { e.hit = true; this.hurt(); this.burst(P.theta, P.h + 20, 'spark', 6, 0.8); Sound.sfx('clang'); }
        if (e.stT > 0.6) { set('walk2'); e.cd = 1.4; e.hit = false; }
        ground();
      }
    } else if (e.type === 'ppdyna') {                                  // lobs lit dynamite: a big bang that blows a hole in the ground
      e.dir = side;
      if (e.st === 'walk') {
        if (distP < 260) e.theta = wrap(e.theta - side * 70 / R * dt); else if (distP > 420) e.theta = wrap(e.theta + side * 60 / R * dt);
        if (e.cd <= 0 && distP < 560) { set('wind'); e.spr.setTexture('ppdyna_b'); Sound.sfx('hiss'); }
      } else if (e.st === 'wind' && e.stT > 0.7) {
        const vt = side * Math.max(120, Math.min(380, distP * 0.85)), im = this.add.image(0, 0, 'ppdynamite').setDepth(6.2); im.bsx = im.bsy = 0.9;
        this.pp.nades.push({ theta: e.theta, h: e.h + 60, vt, vh: 440, fuse: 2.2, rot: 0, spr: im, dyn: true }); Sound.sfx('swish');
        set('walk'); e.cd = rnd(3, 4); e.spr.setTexture('ppdyna');
      }
      ground();
    } else if (e.type === 'ppcart') {                                  // a runaway mine cart: round and round the planet, jump it
      if (!e.cartDir) { e.cartDir = side; Sound.sfx('grind'); }
      e.dir = e.cartDir; e.theta = wrap(e.theta + e.cartDir * 300 / R * dt);
      if (Math.random() < dt * 12) this.burst(wrap(e.theta - e.cartDir * 14 / R), 2, 'spark', 1, 0.4);
      if (distP < 400 && Math.random() < dt * 3) Sound.sfx('grind');
      ground();
    } else if (e.type === 'ppmite') {                                  // scuttles at you in hops; bursts into shards
      e.dir = side; e.theta = wrap(e.theta + side * 150 / R * dt);
      if (e.h <= 0 && e.cd <= 0 && distP < 140) { e.vh = 360; e.cd = rnd(1, 1.6); Sound.sfx('squeak'); }
      ground();
    } else if (e.type === 'ppslug') {                                  // oozes after you, leaving a burning trail
      e.dir = side; e.theta = wrap(e.theta + side * 38 / R * dt);
      if ((e.trT = (e.trT || 0) - dt) <= 0) { e.trT = 0.25; this.pp.trails.push({ theta: e.theta, t: 5 }); }
      ground();
    } else if (e.type === 'ppgolem') {                                 // rises out of the crystal, lumbers, slams: a shockwave to jump
      if (!e.risen) { e.risen = true; set('rise'); Sound.sfx('crash'); }
      if (e.st === 'rise') { e.h = Math.min(0, -60 + e.stT * 80); e.noTouch = e.stT < 0.6; if (Math.random() < dt * 20) this.burst(e.theta, 2, 'spark', 1, 0.6); if (e.stT > 0.75) { e.h = 0; set('walk'); e.noTouch = false; } }
      else if (e.st === 'walk') {
        e.dir = side; if (distP > 60) e.theta = wrap(e.theta + side * 32 / R * dt);
        if (e.cd <= 0 && distP < 230) { set('raise'); e.spr.setTexture('ppgolem_b'); Sound.sfx('charge'); }
        ground();
      } else if (e.st === 'raise' && e.stT > 0.8) {
        set('walk'); e.cd = rnd(3, 4.2); e.spr.setTexture('ppgolem'); Sound.sfx('boom'); this.cameras.main.shake(250, 0.014); this.burst(e.theta, 4, 'spark', 14, 1.2);
        for (const d of [-1, 1]) this.pp.gwaves.push({ theta: e.theta, dir: d, run: 0, hit: false });
      }
    }
  },
  ppMiteBurst(e) { for (let k = 0; k < 6; k++) { const a = -0.2 + k / 5 * (Math.PI + 0.4); const b = this.addEBullet('ppshard', e.theta, e.h + 12, Math.cos(a) * 220, Math.sin(a) * 260 + 80, 7, 1.2); b.grav = 600; } Sound.sfx('tink'); },
  // the guard's shield: shots from in front plink off (unless he's mid-jab), from behind they bite
  ppHitK(e) {
    if (e.type !== 'ppguard') return 1;
    const from = Math.sign(angDiff(this.pl.theta, e.theta)) || 1;
    if (from === e.face && e.st !== 'jab') return 0;
    return from === e.face ? 0.8 : 1.5;
  },

  parmDraw() {
    const S = this.pp; if (!S) return;
    if (S.pending !== undefined) { const n = S.pending; S.pending = undefined; this.ppApplyLayer(n); }
    // (v2.90) keep the planet's top where Chris stands as it shrinks (layout() only sets the centre on a resize)
    if (!this.fullCam) { const Rz = R * this.zoom, W = this.W, H = this.H; this.cy = this.groundY + Rz + (this.camSlide || 0);
      this.visHalf = Math.min(Math.asin(Math.min(1, (W / 2) / Rz)), Math.acos(Math.max(-1, Math.min(1, (this.cy - H) / Rz)))); this.visArc = R * this.visHalf; }
    const g = this.ppG, bg = this.ppBack, hg = this.ppHud;
    this.ppG.clear(); this.colDraw(this.ppG); this.parmEscapeDraw(this.ppG); const _ = 0, z = this.zoom, t = this.t, P = this.pl, vt = this.viewT(), vh = this.visHalf + 0.15;
    bg.clear(); hg.clear();
    const inView = th => Math.abs(angDiff(th, vt)) < vh;
    // ---- (v2.80) the city on the horizon, the machines working, the braziers, the mothership
    for (const B of this.ppCity || []) {
      const th = wrap(B.theta + (this.unw - (this.lagU || 0)) * 0.15);   // (v2.85: from the UNWRAPPED view angle - the wrapped one jumped by 0.9 rad every lap and flicked the whole city round)                                      // (v2.81) parallax: a touch slower than the ground
      const vis = Math.abs(angDiff(th, vt)) < vh + 0.5; B.im.setVisible(vis); if (!vis) continue;
      if (B.drill) { B.im.setTexture(Math.floor(t * 8 + B.theta * 5) % 2 ? 'ppb_drill_b' : 'ppb_drill'); if (Math.random() < 0.15) this.burst(th, 2, 'spark', 1, 0.5); }
      this.place(B.im, th, B.h, 0);
    }
    for (const F of this.ppFire || []) {
      const vis = Math.abs(angDiff(F.th, vt)) < vh; [F.base, F.fl, F.gl].forEach(o => o.setVisible(vis)); if (!vis) continue;
      this.place(F.base, F.th, 0, 0); this.place(F.fl, F.th, 52 * 1.2 / 1.2 - 4, Math.sin(t * 6 + F.ph) * 0.08); F.fl.setTexture('ppflame' + (Math.floor(t * 12 + F.ph) % 3));
      this.place(F.gl, F.th, 56, 0); F.gl.setAlpha(0.35 + 0.15 * Math.sin(t * 9 + F.ph));
    }
    if (this.ppShip) this.ppShip.setPosition(this.W * 0.42 + Math.sin(t * 0.13) * 30, this.H * 0.3 + Math.sin(t * 0.4) * 4).setScale(z * 0.75).setTint(0xc89080);
    for (let k = 0; k < 90; k++) {
      const th = wrap(k * 0.0698 + Math.sin(k * 7.1) * 0.02); if (!inView(th)) continue;
      const tw = Math.sin(t * 3 + k * 1.7); if (tw < 0.6) continue;
      const p = this.screenPos(th, -4 - (k * 13) % 40), s = (tw - 0.6) * 6 * z;
      bg.fillStyle(0xffffff, 0.9).fillRect(p.x - s, p.y - 0.6 * z, s * 2, 1.2 * z).fillRect(p.x - 0.6 * z, p.y - s, 1.2 * z, s * 2);
    }
    // ---- (v2.90) underground: the dark, the cavern roof far above (the underside of the layer you fell through, with the
    // holes you came down by and shafts of light through them), and the geysers
    const rf = this.ppRoof, sh = this.ppShaft; rf.clear(); sh.clear();
    if (S.layer > 0) {
      const W = this.W, H = this.H, dk = this.ppDark; dk.clear();
      for (let i = 0; i < 12; i++) dk.fillStyle(S.layer === 3 ? Phaser.Display.Color.GetColor(40 + i * 12, 8 + i * 3, 4 + i) : S.layer === 1 ? Phaser.Display.Color.GetColor(22 + i * 3, 10 + i * 2, 8 + i) : Phaser.Display.Color.GetColor(30 + i * 8, 10 + i * 4, 6 + i), 0.93).fillRect(0, H * i / 12, W, H / 12 + 1);
      const step = 0.02, a0 = vt - vh - 0.1, n = Math.ceil((vh * 2 + 0.2) / step), base = 300, holes = [0.4, 1.9, 3.3, 4.6, 5.8].map(x => wrap(x + S.layer));
      for (let i = 0; i < n; i++) {
        const th = wrap(a0 + i * step), th2 = wrap(th + step), hole = holes.some(hh => Math.abs(angDiff(th, hh)) < 0.09);
        if (hole) continue;
        const j = Math.sin(th * 37) * 10 + Math.sin(th * 91) * 6, j2 = Math.sin(th2 * 37) * 10 + Math.sin(th2 * 91) * 6;
        const p1 = this.screenPos(th, base + j), p2 = this.screenPos(th2, base + j2), p3 = this.screenPos(th2, base + 240), p4 = this.screenPos(th, base + 240);
        rf.fillStyle(S.layer === 1 ? 0x3a2414 : 0x4a2a18, 1).fillPoints([p1, p2, p3, p4], true);
        const q1 = this.screenPos(th, base + j + 8), q2 = this.screenPos(th2, base + j2 + 8); rf.fillStyle(0x6a4a2a, 1).fillPoints([p1, p2, q2, q1], true);
        if ((Math.floor(th * 300) % 7) === 0) { const s1 = this.screenPos(th, base + j), s2 = this.screenPos(wrap(th + 0.006), base + j - 30 - (Math.floor(th * 100) % 3) * 12), s3 = this.screenPos(wrap(th + 0.012), base + j); rf.fillStyle(0x6a4a2a, 1).fillTriangle(s1.x, s1.y, s2.x, s2.y, s3.x, s3.y); }   // drips of old cheese
        if (S.layer === 2 && (Math.floor(th * 300) % 11) === 0) { const c = this.screenPos(th, base + j - 6); rf.fillStyle(0xfff6d0, 1).fillCircle(c.x, c.y, 2 * z); }
      }
      for (const hh of holes) { if (!inView(hh)) continue; const a = this.screenPos(wrap(hh - 0.07), base), b = this.screenPos(wrap(hh + 0.07), base), c = this.screenPos(wrap(hh + 0.11), 0), d = this.screenPos(wrap(hh - 0.11), 0);
        sh.fillStyle(0xffc070, 0.08 + 0.03 * Math.sin(t * 1.3 + hh)).fillPoints([a, b, c, d], true); }
      for (const G of S.geysers) {
        if (!inView(G.theta) || G.st === 'idle') continue;
        const p0 = this.screenPos(G.theta, 0);
        if (G.st === 'warn') { g.fillStyle(0xffb52a, 0.5 + 0.4 * Math.sin(t * 30)).fillEllipse(p0.x, p0.y, 40 * z, 10 * z); for (let k = 0; k < 3; k++) { const q = this.screenPos(wrap(G.theta + (k - 1) * 8 / R), 6 + ((t * 40 + k * 9) % 20)); g.fillStyle(0xffe08a, 1).fillCircle(q.x, q.y, 3 * z); } }
        else { const hT = 230 * Math.min(1, (1.5 - G.t) * 5); for (const [w, col, al] of [[24, 0xe0601a, 0.9], [17, 0xffb52a, 1], [8, 0xfff0a0, 1]]) { const a = this.screenPos(wrap(G.theta - w / R), 0), b = this.screenPos(wrap(G.theta + w / R), 0), c = this.screenPos(wrap(G.theta + w * 0.7 / R), hT), d = this.screenPos(wrap(G.theta - w * 0.7 / R), hT); g.fillStyle(col, al).fillPoints([a, b, c, d], true); }
          const top = this.screenPos(G.theta, hT); g.fillStyle(0xffb52a, 1).fillCircle(top.x, top.y, 22 * z); g.fillStyle(0xfff0a0, 1).fillCircle(top.x, top.y - 4 * z, 12 * z); }
      }
    }
    for (const T of S.trails) { if (!inView(T.theta)) continue; const a = this.screenPos(wrap(T.theta - 9 / R), 0), b = this.screenPos(wrap(T.theta + 9 / R), 0), c = this.screenPos(T.theta, 6 * Math.min(1, T.t)); g.fillStyle(0xffa030, Math.min(0.9, T.t)).fillTriangle(a.x, a.y, b.x, b.y, c.x, c.y); if (Math.random() < 0.05) this.burst(T.theta, 4, 'spark', 1, 0.3); }
    for (const Wv of S.gwaves) { if (!inView(Wv.theta)) continue; const k = 1 - Wv.run / 340; for (const [w, hh, col] of [[18, 26, 0x9fd8ff], [10, 14, 0xffffff]]) { const a = this.screenPos(wrap(Wv.theta - w / R), 0), b = this.screenPos(wrap(Wv.theta + w / R), 0), c = this.screenPos(Wv.theta, hh * k); g.fillStyle(col, 0.8 * k + 0.2).fillTriangle(a.x, a.y, b.x, b.y, c.x, c.y); } }
    for (const e of this.enemies) if (e.type === 'ppminer' && e.st === 'under' && inView(e.theta)) { const p = this.screenPos(e.theta, 0); g.fillStyle(0x5a4028, 1).fillEllipse(p.x, p.y, 34 * z, 14 * z); g.fillStyle(0x8a6a48, 1).fillEllipse(p.x - 3 * z, p.y - 2 * z, 22 * z, 8 * z); }
    { const fx = this.ppDropFx; fx.clear(); const D = S.drop;                // the fall: the screen goes dark, rubble whooshing up past
      if (D && (D.st === 'fall' || (D.st === 'land' && D.t < 0.8))) {
        const a = D.st === 'fall' ? Math.min(1, D.t / 0.8) : 1 - D.t / 0.8, W = this.W, H = this.H;
        fx.fillStyle(0x1a0c06, a * 0.92).fillRect(0, 0, W, H);
        for (let k = 0; k < 26; k++) { const x = (k * 97.3) % W, y = H - ((t * 900 + k * 173) % (H + 80)); fx.fillStyle(k % 3 ? 0x6a4a2a : 0xd8c890, a).fillRect(x, y, 6 + (k % 4) * 4, 10 + (k % 5) * 6); }
      }
    }
    // ---- cracks spreading before the ground gives way; the chasms' glowing core
    for (const C of S.cracks) {
      if (!inView(C.theta)) continue;
      if (C.st === 'crack') {
        const k = 1 - Math.max(0, C.t) / 1.7, n = 6;
        for (let i = 0; i < n; i++) { const a0 = wrap(C.theta + (i / (n - 1) * 2 - 1) * C.half * k), a = this.screenPos(C.theta, 1), b = this.screenPos(a0, -14 * k - (i % 2) * 8), c2 = this.screenPos(wrap(a0 + 0.01), 0.5); g.lineStyle(2.5 * z, 0x2a1406, 1).lineBetween(a.x, a.y, b.x, b.y).lineBetween(b.x, b.y, c2.x, c2.y); }
        if (Math.floor(t * 10) % 2) { const p = this.screenPos(C.theta, 2); g.fillStyle(0xff6a2a, 0.4 * k).fillEllipse(p.x, p.y, 60 * z * k, 8 * z); }
      } else if (C.st === 'open') {
        const p = this.screenPos(C.theta, -40); g.fillStyle(0xff5a1a, 0.35 + 0.15 * Math.sin(t * 4)).fillEllipse(p.x, p.y, C.half * R * 1.4 * z, 26 * z);
        g.fillStyle(0xffd23f, 0.3).fillEllipse(p.x, p.y + 4 * z, C.half * R * 0.8 * z, 10 * z);
      }
    }
    // ---- grenades' fuses fizz
    for (const N of S.nades) { const p = this.screenPos(N.theta, N.h + 14); if (Math.floor(t * 16) % 2) g.fillStyle(0xffd23f, 1).fillCircle(p.x, p.y, 2.5 * z); }
    // ---- the guards' halberd jab
    for (const e of this.enemies) if (e.type === 'ppguard' && (e.st === 'wind' || e.st === 'jab')) {
      const reach = e.st === 'jab' ? 70 : 10, a = this.screenPos(e.theta, e.h + 34), b = this.screenPos(wrap(e.theta + e.face * (20 + reach) / R), e.h + 34);
      g.lineStyle(4 * z, 0x6a4a2a, 1).lineBetween(a.x, a.y, b.x, b.y); g.fillStyle(0xe8eef8, 1).fillCircle(b.x, b.y, 4 * z);
      if (e.st === 'wind' && Math.floor(t * 14) % 2) g.fillStyle(0xffffff, 0.8).fillCircle(b.x, b.y, 6 * z);
    }
    // ---- THE ROYAL RASP: a vast curved grater face hung on cables, rasp holes rushing past, shavings spraying off it
    const RS = S.rasp, W = this.W, H = this.H;
    const [h0, h1] = RS.kind === 'low' ? [0, 36] : [24, 118];
    if (RS.st === 'warn') {                                       // where it's coming from and at what height
      const a = 0.4 + 0.4 * Math.sin(t * 20), sx = RS.dir > 0 ? 0 : W;
      const band = [], n = 24;
      for (let k = 0; k <= n; k++) band.push(this.screenPos(wrap(vt + (k / n * 2 - 1) * vh), h1));
      for (let k = n; k >= 0; k--) band.push(this.screenPos(wrap(vt + (k / n * 2 - 1) * vh), h0));
      g.fillStyle(0xff2a1a, 0.12 + 0.12 * Math.sin(t * 20)).fillPoints(band, true);
      hg.fillStyle(0xff3a1a, a).fillTriangle(sx + (RS.dir > 0 ? 8 : -8), H * 0.5, sx + (RS.dir > 0 ? 44 : -44), H * 0.5 - 30, sx + (RS.dir > 0 ? 44 : -44), H * 0.5 + 30);
      if (!this.ppWarnTxt) this.ppWarnTxt = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '12px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 4 }).setOrigin(0.5).setDepth(20);
      this.ppWarnTxt.setVisible(true).setText(RS.kind === 'low' ? 'JUMP!' : 'DUCK!').setPosition(RS.dir > 0 ? 80 : W - 80, H * 0.5 - 44).setAlpha(0.6 + 0.4 * Math.sin(t * 20));
    } else if (this.ppWarnTxt) this.ppWarnTxt.setVisible(false);
    if (S.scars && S.scars.length) {                              // (v2.85) a raw, freshly-shaved strip of Parmesan where it's been
      for (const q of S.scars) { if (!inView(q.theta)) continue; const a = this.screenPos(wrap(q.theta - 9 / R), -1), b = this.screenPos(wrap(q.theta + 9 / R), -1), c = this.screenPos(wrap(q.theta + 9 / R), -9), d = this.screenPos(wrap(q.theta - 9 / R), -9);
        g.fillStyle(0xfff4cc, Math.min(0.8, q.t / 3)).fillPoints([a, b, c, d], true); const m = this.screenPos(q.theta, -4); g.fillStyle(0xd6b66a, Math.min(0.9, q.t / 3)).fillRect(m.x - 1, m.y - 1, 3 * z, 1.5 * z); }
    }
    if (RS.st === 'pass' && !inView(RS.theta)) {                 // (v2.85) INCOMING: an edge marker that grows as it closes in, and the distance
      const d = angDiff(RS.theta, P.theta), side = d > 0 ? 1 : -1, dist = Math.abs(d) * R;
      if ((side === -RS.dir) && dist < 1400) {                     // it's coming at him
        const k = 1 - Math.min(1, dist / 1400), sx = side > 0 ? W - 30 : 30, sy = this.groundY - (RS.kind === 'low' ? 18 : 70) * z, sz = 14 + 22 * k, a = 0.55 + 0.45 * Math.sin(t * (8 + 14 * k));
        hg.fillStyle(0x1a1020, 0.9).fillTriangle(sx + side * (sz + 4), sy, sx - side * 4, sy - sz - 4, sx - side * 4, sy + sz + 4);
        hg.fillStyle(0xff3a1a, a).fillTriangle(sx + side * sz, sy, sx, sy - sz, sx, sy + sz);
        if (!this.ppWarnTxt) this.ppWarnTxt = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '12px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 4 }).setOrigin(0.5).setDepth(20);
        this.ppWarnTxt.setVisible(true).setText((RS.kind === 'low' ? 'JUMP!' : 'DUCK!') + '\n' + Math.max(1, Math.round(dist / 47)) + 'm').setAlign('center').setPosition(side > 0 ? W - 80 : 80, sy - 40).setAlpha(a);
        if (Math.floor(t * (3 + 9 * k)) !== Math.floor((t - 1 / 60) * (3 + 9 * k))) Sound.sfx('blip');
      }
    } else if (RS.st === 'pass' && this.ppWarnTxt) this.ppWarnTxt.setVisible(false);
    if (RS.st === 'pass' && inView(RS.theta)) {
      const half = 150 / R, n = 18, top = [], bot = [];
      for (let k = 0; k <= n; k++) { const th = wrap(RS.theta + (k / n * 2 - 1) * half); top.push(this.screenPos(th, h1)); bot.unshift(this.screenPos(th, h0)); }
      g.fillStyle(0x1a1020, 1).fillPoints(top.concat(bot), true);
      const inner = []; for (let k = 0; k <= n; k++) inner.push(this.screenPos(wrap(RS.theta + (k / n * 2 - 1) * half * 0.98), h1 - 3)); for (let k = n; k >= 0; k--) inner.push(this.screenPos(wrap(RS.theta + (k / n * 2 - 1) * half * 0.98), h0 + 3));
      g.fillStyle(0x9aa4b4, 1).fillPoints(inner, true);
      g.lineStyle(3 * z, 0xeef4ff, 1).strokePoints(top.slice(1, -1), false);
      const rows = RS.kind === 'low' ? 2 : 5, scroll = (t * 600) % 26;
      for (let r = 0; r < rows; r++) for (let x = -150 + scroll + (r % 2) * 13; x < 150; x += 26) {         // the rasp holes, rushing past
        const th = wrap(RS.theta + x / R), hh = h0 + 8 + r * ((h1 - h0 - 16) / Math.max(1, rows - 1)), p = this.screenPos(th, hh);
        g.fillStyle(0x2a2e38, 1).fillEllipse(p.x, p.y, 9 * z, 5 * z); g.fillStyle(0xffffff, 0.9).fillRect(p.x - 4 * z, p.y - 3.5 * z, 8 * z, 1.4 * z);
      }
      for (const sd of [-1, 1]) {                                  // cables up to the mining ship
        const a = this.screenPos(wrap(RS.theta + sd * half * 0.85), h1), b = this.screenPos(wrap(RS.theta + sd * half * 0.5), 700);
        g.lineStyle(5 * z, 0x1a1020, 1).lineBetween(a.x, a.y, b.x, b.y); g.lineStyle(2 * z, 0x8a94a6, 1).lineBetween(a.x, a.y, b.x, b.y);
      }
      const lead = wrap(RS.theta + RS.dir * half);                // the cutting edge: sparks and parmesan shavings spraying off
      for (let k = 0; k < 6; k++) { const q = this.screenPos(wrap(lead - RS.dir * rnd(0, 40) / R), rnd(h0, h1)); g.fillStyle(k % 2 ? 0xfff4c0 : 0xffd23f, 0.9).fillEllipse(q.x, q.y, rnd(4, 10) * z, rnd(2, 4) * z); }
      if (Math.random() < 0.5) this.burst(wrap(RS.theta - RS.dir * half), rnd(h0, h1), 'crumb', 2, 0.6);
    }
  },
};

// ===== L9 part 2 (v2.79): THE PARMESAN COLOSSUS, and the ESCAPE to the Royal Saucer =====
// A giant marble-and-Parmesan statue of the Rat-King comes alive in the palace plaza.
//  1 (full to 65%): it plods after you. STOMP: a foot lifts (the tell), slams, and a shockwave runs round the ground both
//    ways: jump it. CROWN LASER: a red sight-line from the crown, then a beam that sweeps across the ground through where
//    you are. Shots chip lumps off it.
//  2 (65% to 30%): it cracks open: three glowing crystals (knee, chest, crown). Only shots near a crystal hurt it
//    properly (1.6x); the rest of it shrugs them off (0.3x). Faster stomps, double lasers.
//  3 (below 30%): its HEAD snaps off and comes after you on its own, bouncing round the planet in big arcs (each landing
//    a shockwave), spitting rubble and firing the crown laser. The body stays behind as a crumbled heap.
// When it falls the real King flies over in his Royal Saucer, laughing, Bessie in the dome, and the planet SPLITS:
// run (the ground collapsing behind you, chasms opening ahead, palace rubble raining) and grab the saucer's dangling
// ladder as it lifts off. Then straight on board: Level 10.
function makeColossusTextures(scene) {
  if (scene.game.__colTex) return; scene.game.__colTex = true;
  const MARB = [0xfff8ec, 0xe0d8c8, 0x9a9282], PARM = [0xf4e6b4, 0xd8c488, 0x9a864a], GOLD = [0xfff0a0, 0xffc83a, 0xb07a1a], CRY = [0xffffff, 0xfff0a0, 0xffb03a], INK = 0x1a1020;
  const crown = (a, x, y, w) => { a.poly([[x - w, y], [x - w + 2, y - 12], [x - w / 2, y - 5], [x, y - 15], [x + w / 2, y - 5], [x + w - 2, y - 12], [x + w, y]], GOLD); a.rect(x - w, y - 2, x + w, y + 2, GOLD[1]); a.ell(x, y - 9, 2.5, 2.5, 0xd62828); };
  const head = (a, x, y, cr) => {                                     // the statue's rat head facing right
    a.ell(x, y, 22, 19, PARM); a.poly([[x + 12, y - 8], [x + 42, y + 4], [x + 12, y + 14]], PARM); a.ell(x + 42, y + 4, 4, 3.5, 0xc89a8a);
    a.ell(x - 10, y - 18, 8, 10, PARM); a.ell(x - 10, y - 18, 4, 6, PARM[2]);
    a.ell(x + 6, y - 4, 5, 4, 0x3a2a10); a.ell(x + 7, y - 4, 2.5, 2.5, cr ? 0xff3a1a : 0x9a864a);       // the eye: dead, or glowing
    a.line([[x + 26, y + 10], [x + 32, y + 14]], 0x6a5a2a); a.rect(x + 30, y + 10, x + 32, y + 15, MARB[0]);
    for (const [dx, dy] of [[-12, 6], [2, 10], [-4, -6], [14, 4]]) a.ell(x + dx, y + dy, 2, 1.5, 0xb8a464);   // parmesan pits
  };
  for (const v of [0, 1]) pixSprite(scene, v ? 'colossus_b' : 'colossus', 120, 160, a => {
    a.rect(20, 146, 100, 159, MARB[2]); a.rect(16, 142, 104, 148, MARB); a.rect(30, 150, 90, 154, GOLD[1]);   // plinth
    a.rect(38, 112, 52, 142, PARM[1]); a.rect(66, 112, 80, 142, PARM[1]); a.ell(46, 140, 12, 5, PARM); a.ell(74, 140, 12, 5, PARM);   // legs + feet
    a.poly([[30, 60], [90, 60], [100, 120], [20, 120]], [0xd84a5a, 0xa01a2a, 0x5a0a14]);                       // the robe (painted)
    a.poly([[26, 66], [34, 60], [40, 120], [26, 120]], MARB); a.poly([[94, 66], [86, 60], [80, 120], [94, 120]], MARB);   // ermine trim
    for (const [x, y] of [[30, 80], [32, 100], [90, 84], [88, 106]]) a.px(x, y, INK);
    a.line([[90, 70], [106, 50], [110, 30]], PARM[1], 7); a.ell(110, 26, 6, 6, GOLD);                          // sceptre arm
    a.line([[30, 70], [18, 90], [22, 104]], PARM[1], 7);
    head(a, 56, 40, v); crown(a, 50, 22, 16);
    if (v) {                                                                                                  // cracked open: the crystals glow through
      for (const [x, y] of [[44, 120], [62, 78], [50, 16]]) { a.poly([[x - 8, y], [x - 3, y - 9], [x + 4, y - 7], [x + 8, y + 2], [x + 2, y + 9], [x - 6, y + 6]], CRY); a.px(x - 2, y - 4, 0xffffff); }
      a.line([[30, 64], [40, 80], [36, 96]], 0x3a2a10, 2); a.line([[84, 66], [76, 90]], 0x3a2a10, 2); a.line([[60, 30], [66, 44]], 0x3a2a10, 2);
      a.line([[46, 112], [40, 126]], 0x3a2a10, 2);
    } else for (const [x0, y0, x1, y1] of [[34, 70, 40, 84], [80, 72, 86, 88]]) a.line([[x0, y0], [x1, y1]], 0x9a864a);
  });
  pixSprite(scene, 'colhead', 84, 70, a => {
    head(a, 30, 36, 1); crown(a, 26, 18, 15);
    a.poly([[6, 50], [12, 58], [22, 54], [30, 62], [40, 56], [46, 62], [50, 50]], CRY);                        // the snapped neck, glowing
    a.line([[10, 30], [18, 40]], 0x3a2a10, 2); a.line([[40, 24], [46, 32]], 0x3a2a10, 2);
  });
  pixSprite(scene, 'colrubble', 120, 70, a => {
    a.rect(20, 56, 100, 69, MARB[2]); a.rect(16, 52, 104, 58, MARB);
    a.poly([[24, 52], [34, 22], [52, 30], [60, 14], [78, 26], [92, 20], [100, 52]], PARM);
    a.poly([[36, 40], [48, 34], [56, 44]], [0xd84a5a, 0xa01a2a, 0x5a0a14]); for (const [x, y] of [[44, 26], [70, 34], [84, 30]]) a.ell(x, y, 5, 4, PARM[2]);
    a.poly([[54, 18], [60, 12], [66, 18], [60, 24]], CRY);
  });
}

Object.assign(ParmMixin, {
  colossusSetup(e) {
    makeColossusTextures(this);
    e.h = 0; e.vh = 0; e.ch = 92; e.r = 60; e.spr.setOrigin(0.5, 0.97).setTexture('colossus'); e.spr.bsx = e.spr.bsy = 1.35;
    e.cs = { st: 'wake', t: 0, ph: 1, stompCd: 2.5, laserCd: 4, walkDir: 1, lift: 0 };
    e.theta = wrap(this.pl.theta + 0.6);
    this.pp.waves = []; this.pp.beams = [];
  },
  colHitK(e, th, h) {
    const C = e.cs; if (!C || C.st === 'wake' || C.st === 'snap') return 0;
    if (C.ph === 1) { if (Math.random() < 0.5) this.burst(e.theta, h, 'crumb', 3, 0.6); return 1; }
    if (C.ph === 2) {
      const sc = e.spr.bsy / 1.35, cry = [40, 95, 150].map(v => v * sc), near = cry.some(c => Math.abs(h - c) < 18);
      if (near) { this.burst(e.theta, h, 'spark', 4, 0.8); return 1.6; }
      this.burst(e.theta, h, 'crumb', 2, 0.4); return 0.3;
    }
    return 1;
  },
  colStomp(theta) {
    this.pp.waves.push({ theta, d: 0, dirs: [-1, 1], hit: false });
    this.bang(theta, 4, 40); this.burst(theta, 4, 'crumb', 18, 1.3); this.cameras.main.shake(260, 0.016); Sound.sfx('boom'); Sound.sfx('crash'); buzz([60, 30, 60]);
  },
  colLaser(e, crownH) {
    const P = this.pl, sd = Math.sign(angDiff(P.theta, e.theta)) || 1;
    this.pp.beams.push({ from: e, crownH, a0: wrap(P.theta - sd * 130 / R), a1: wrap(P.theta + sd * 130 / R), t: 0, warn: 0.85, dur: 0.75, hit: false });
    Sound.sfx('charge');
  },
  colossusAI(e, dt, P) {
    const C = e.cs || (this.colossusSetup(e), e.cs), toP = angDiff(P.theta, e.theta), side = Math.sign(toP) || 1;
    C.t += dt;
    const frac = e.hp / e.maxHp;
    if (C.st === 'wake') {                                                 // the statue shudders, cracks, its eye lights up
      e.spr.x += 0; if (Math.random() < dt * 12) this.burst(e.theta, rnd(20, 180), 'crumb', 2, 0.6);
      if (C.t > 2.2) { C.st = 'fight'; e.spr.setTexture('colossus'); Sound.sfx('growl'); this.banner('IT\'S ALIVE!'); this.cameras.main.shake(400, 0.012); }
      return;
    }
    if (C.ph === 1 && frac < 0.65) { C.ph = 2; e.spr.setTexture('colossus_b'); this.cameras.main.shake(500, 0.02); Sound.sfx('crash'); this.banner('IT\'S CRACKING!\nSHOOT THE GLOWING CRYSTALS!'); for (let k = 0; k < 10; k++) this.burst(e.theta, rnd(20, 190), 'crumb', 3, 1); }
    if (C.ph === 2 && frac < 0.3 && C.st !== 'snap') {
      C.st = 'snap'; C.t = 0; this.clearEBullets(); this.pp.beams = [];
      Sound.sfx('crash'); Sound.sfx('boom'); this.cameras.main.shake(700, 0.025); this.banner('ITS HEAD CAME OFF!\n...AND IT\'S STILL COMING!');
      const im = this.add.image(0, 0, 'colrubble').setOrigin(0.5, 0.97).setDepth(4.9); im.bsx = im.bsy = 1.35; this.place(im, e.theta, 0, 0); this.pp.rubble = { im, theta: e.theta };
      e.spr.setTexture('colhead'); e.spr.setOrigin(0.5, 0.6); e.h = 150; e.vh = 420; e.ch = 30; e.r = 40; e.spr.bsx = e.spr.bsy = 1.5;
    }
    if (C.st === 'snap') { e.vh -= 900 * dt; e.h += e.vh * dt; if (e.h <= 30 && e.vh < 0) { e.h = 30; C.st = 'head'; C.ph = 3; C.hopCd = 0.6; C.spitCd = 1.5; this.colStomp(e.theta); } e.dir = side; e.spr.setFlipX(side < 0); return; }
    if (C.ph < 3) {
      // ---- the statue: plods after you, stomps, crown laser
      const fast = C.ph === 2;
      C.stompCd -= dt; C.laserCd -= dt;
      if (C.lift > 0) {                                                  // a foot's up: the tell
        C.lift -= dt; e.spr.rotation = -side * 0.08 * Math.sin(C.lift * 20);
        if (C.lift <= 0) { e.spr.rotation = 0; this.colStomp(wrap(e.theta + side * 30 / R)); }
      } else {
        if (Math.abs(toP) * R > 170) e.theta = wrap(e.theta + side * (fast ? 55 : 40) / R * dt);
        if (C.stompCd <= 0) { C.lift = 0.6; C.stompCd = fast ? 2.4 : 3.3; Sound.sfx('grind'); }
        else if (C.laserCd <= 0) { this.colLaser(e, 150 * e.spr.bsy / 1.35); if (fast) this.time.delayedCall(900, () => { if (e.hp > 0 && e.cs.ph === 2) this.colLaser(e, 150 * e.spr.bsy / 1.35); }); C.laserCd = fast ? 3.8 : 4.6; }
      }
      e.dir = side; e.spr.setFlipX(side < 0); e.h = 0;
    } else {
      // ---- the head: bounces after you in big arcs, a shockwave each landing, spits rubble, crown laser
      e.vh -= 900 * dt; e.h += e.vh * dt; e.theta = wrap(e.theta + (C.vt || 0) / R * dt); e.spr.rotation += (C.vt || 0) / 200 * dt;
      if (e.h <= 30 && e.vh < 0) {
        e.h = 30; e.vh = 0; C.vt = 0; e.spr.rotation = 0;
        if (!C.landed) { C.landed = true; this.colStomp(e.theta); }
        C.hopCd -= dt;
        if (C.hopCd <= 0) { C.landed = false; e.vh = rnd(520, 640); C.vt = side * Math.min(330, Math.abs(toP) * R * 0.9 + 60); C.hopCd = rnd(0.5, 0.9); Sound.sfx('jump'); }
      }
      C.spitCd -= dt;
      if (C.spitCd <= 0) {
        C.spitCd = rnd(1.4, 2);
        for (let k = -1; k <= 1; k++) { const b = this.addEBullet('db_rock', e.theta, e.h + 20, side * (230 + k * 60), 260 + k * 60, 11, 3); b.grav = 700; b.spinV = 8; }
        Sound.sfx('swish');
      }
      C.laserCd -= dt; if (C.laserCd <= 0 && e.h <= 31) { this.colLaser(e, 60); C.laserCd = 4.2; }
      e.dir = side; e.spr.setFlipX(side < 0);
    }
  },
  // shockwaves and the crown laser (called from parmUpdate; they need to run during the boss)
  colUpdate(dt) {
    const S = this.pp, P = this.pl; if (!S.waves) return;
    for (const W of S.waves) {
      W.d += 330 * dt;
      for (const sd of W.dirs) { const th = wrap(W.theta + sd * W.d / R); if (!W.hit && Math.abs(angDiff(P.theta, th)) * R < 16 && P.h < 24 && P.invuln <= 0) { W.hit = true; this.hurt(); } }
    }
    S.waves = S.waves.filter(W => W.d < 520);
    for (const B of S.beams) {
      B.t += dt;
      if (B.t > B.warn && B.t < B.warn + B.dur && !B.hit) {
        const u = (B.t - B.warn) / B.dur, at = wrap(B.a0 + angDiff(B.a1, B.a0) * u);
        if (Math.abs(angDiff(P.theta, at)) * R < 20 && P.h < 60 && P.invuln <= 0) { B.hit = true; this.hurt(); }
        if (Math.random() < dt * 30) this.burst(at, 2, 'spark', 2, 0.5);
      }
    }
    S.beams = S.beams.filter(B => B.t < B.warn + B.dur + 0.1 && B.from.hp > 0);
  },
  colDraw(g) {
    const S = this.pp, z = this.zoom, t = this.t; if (!S.waves) return;
    for (const W of S.waves) for (const sd of W.dirs) {                    // a rolling ridge of cracked ground
      const th = wrap(W.theta + sd * W.d / R), k = 1 - W.d / 520, a = this.screenPos(th, 0), b = this.screenPos(th, 24 * k + 6);
      g.lineStyle(10 * z, 0xc8a860, 0.9 * k).lineBetween(a.x, a.y, b.x, b.y); g.lineStyle(4 * z, 0xfff0c0, k).lineBetween(a.x, a.y, b.x, b.y);
      if (Math.random() < 0.5) this.burst(th, 4, 'crumb', 1, 0.4);
    }
    for (const B of S.beams) {
      const e = B.from, c = this.screenPos(e.theta, e.h + B.crownH);
      if (B.t < B.warn) { const q = this.screenPos(B.a0, 0); g.lineStyle(1.5 * z, 0xff3a1a, 0.5 + 0.5 * Math.sin(t * 40)).lineBetween(c.x, c.y, q.x, q.y); g.fillStyle(0xff3a1a, 0.6).fillCircle(c.x, c.y, (5 + 3 * Math.sin(t * 30)) * z); }
      else if (B.t < B.warn + B.dur) {
        const u = (B.t - B.warn) / B.dur, at = wrap(B.a0 + angDiff(B.a1, B.a0) * u), q = this.screenPos(at, 0);
        g.lineStyle(12 * z, 0xff3a1a, 0.5).lineBetween(c.x, c.y, q.x, q.y); g.lineStyle(5 * z, 0xfff0a0, 1).lineBetween(c.x, c.y, q.x, q.y);
        g.fillStyle(0xffffff, 0.9).fillCircle(q.x, q.y, 9 * z); g.fillStyle(0xff7a1a, 0.6).fillCircle(q.x, q.y, 16 * z);
      }
    }
    if (S.rubble) this.place(S.rubble.im, S.rubble.theta, 0, 0);
  },

  // ================= THE ESCAPE =================
  parmEscape() {
    Tel.end(this, 'won');
    const P = this.pl, dir = P.facing || 1, S = this.pp;
    this.state = 'rescue'; this.rescue = null; this.clearEBullets(); Sound.jet(false); Sound.music('tense');
    for (const e of this.enemies) { e.quietKill = true; e.hp = 0; }
    S.waves = []; S.beams = [];
    const ship = this.add.image(0, 0, 'ratship').setDepth(6.5); ship.bsx = ship.bsy = 2.4;
    const cow = this.add.image(0, 0, 'bessie').setDepth(6.4).setOrigin(0.5, 1); cow.bsx = cow.bsy = 0.55;
    this.ppEsc = { t: 0, dir, front: wrap(P.theta - dir * 340 / R), ship, cow, st: 'intro', sTheta: wrap(P.theta + dir * 520 / R), sH: 520, ladder: 0, crackT: 2, rockT: 0.6, rocks: [], grab: 0 };
    this.banner('A STATUE?! HA HA HA!\nTOODLE-OO, CHEF!');
    Sound.sfx('ufoFly'); Sound.sfx('moo');
  },
  escHurt() {                                                                // (hurt() is off after a boss: this costs a heart, never the last)
    const P = this.pl; if (P.invuln > 0) return;
    P.hp = Math.max(1, P.hp - 1); this.updateHearts(); P.invuln = 1.2; this.rig.ouch(true); Sound.sfx('hurt'); Sound.sfx(['ouch1', 'ouch2', 'ouch3'][Math.floor(Math.random() * 3)]); this.cameras.main.shake(150, 0.01); buzz(60);
  },
  parmEscapeUpdate(dt) {
    const E = this.ppEsc, P = this.pl, S = this.pp; E.t += dt;
    const dir = E.dir;
    if (E.st === 'intro') {                                                  // the saucer swoops in low, Bessie in the dome
      E.sH += (190 - E.sH) * Math.min(1, dt * 2);
      if (E.t > 2.6) {
        E.st = 'run'; E.t = 0; Sound.music('final'); Sound.sfx('crash'); Sound.sfx('boom'); this.cameras.main.shake(900, 0.02);
        this.banner('THE PLANET\'S SPLITTING!\nCATCH THAT SAUCER!');
      }
    } else if (E.st === 'run') {
      // the saucer pulls away slower than you can run; its ladder dangles down
      E.sTheta = wrap(E.sTheta + dir * 150 / R * dt); E.ladder = Math.min(1, E.ladder + dt);
      E.sH = 190 + Math.sin(this.t * 2) * 10;
      // the collapse front chases you
      const gap = angDiff(P.theta, E.front) * dir * R, sp = gap > 260 ? 260 : gap > 140 ? 210 : 170;
      E.front = wrap(E.front + dir * sp / R * dt);
      if (gap < 0 && P.invuln <= 0) {                                         // it caught you: down you go... and you're thrown clear, a heart lighter
        this.escHurt(); this.banner('AAAARGH!'); P.theta = wrap(E.front + dir * 140 / R); P.h = 60; P.vh = 420; P.invuln = Math.max(P.invuln, 1.4);
      }
      if (Math.random() < dt * 30) this.burst(E.front, 4, 'crumb', 2, 1.2);
      if (Math.random() < dt * 4) this.cameras.main.shake(80, 0.008);
      // chasms open up ahead, rubble rains down
      E.crackT -= dt;
      if (E.crackT <= 0) {
        E.crackT = rnd(2, 3);
        const th = wrap(P.theta + dir * rnd(220, 340) / R);
        if (Math.abs(angDiff(th, E.sTheta)) * R > 120) S.cracks.push({ theta: th, half: 30 / R, st: 'crack', t: 0.9 });
      }
      for (const C of S.cracks) {
        C.t -= dt;
        if (C.st === 'crack' && C.t <= 0) { C.st = 'open'; C.t = 99; C.cr = { theta: C.theta, half: C.half, kind: 'pit', pp: true }; this.craters.push(C.cr); this.burst(C.theta, 6, 'crumb', 16, 1.2); Sound.sfx('crash'); this.cameras.main.shake(150, 0.01); }
      }
      E.rockT -= dt;
      if (E.rockT <= 0) {
        E.rockT = rnd(0.5, 0.9);
        const tx = ['pp_column', 'pp_head', 'pp_dome', 'db_rock'][Math.floor(Math.random() * 4)], spr = this.add.image(0, 0, tx).setDepth(7); spr.bsx = spr.bsy = rnd(1.3, 1.9);
        E.rocks.push({ theta: wrap(P.theta + dir * rnd(60, 360) / R), h: 460, vh: -150, spr, rot: 0, rv: rnd(-6, 6) });
      }
      for (let i = E.rocks.length - 1; i >= 0; i--) {
        const K = E.rocks[i]; K.vh -= 600 * dt; K.h += K.vh * dt; K.rot += K.rv * dt; this.place(K.spr, K.theta, K.h, K.rot);
        if (K.h <= 0) { this.burst(K.theta, 4, 'crumb', 10, 1); this.bang(K.theta, 6, 20); Sound.sfx('clunk'); if (Math.abs(angDiff(P.theta, K.theta)) * R < 30 && P.h < 40 && P.invuln <= 0) this.escHurt(); K.spr.destroy(); E.rocks.splice(i, 1); }
      }
      // grab the ladder!
      const lx = Math.abs(angDiff(P.theta, E.sTheta)) * R, ladBot = E.sH - 60 - 70 * E.ladder;
      if (lx < 34 && P.h + 40 > ladBot) {
        E.st = 'grab'; E.t = 0; Sound.sfx('power'); Sound.say && Sound.say('woohoo', { force: true });
        this.banner('GOT YOU!\nHANG ON, BESSIE!'); this.cameras.main.flash(200, 255, 240, 200);
      }
    } else if (E.st === 'grab') {                                             // up and away, Chris hanging off the ladder
      E.sH += (120 + E.t * 260) * dt; E.sTheta = wrap(E.sTheta + dir * 260 / R * dt);
      P.theta = E.sTheta; P.h = E.sH - 60 - 70; P.vh = 0; P.vx = 0; P.invuln = 5;
      if (E.t > 0.5 && !E.split) { E.split = true; Sound.sfx('boom'); Sound.sfx('crash'); this.cameras.main.shake(1500, 0.03); }
      if (E.t > 2.4 && !E.out) {
        E.out = true;
        Progress.beat(this.levelId); const RK = this.levelRank(); Progress.setRank(this.levelId, RK.r);
        this.cameras.main.fadeOut(700, 255, 255, 255);
        this.time.delayedCall(750, () => this.scene.restart({ level: 10, autostart: true, fromPrime: true }));
      }
    }
    // draw the saucer + Bessie + the ladder
    this.place(E.ship, E.sTheta, E.sH, Math.sin(this.t * 3) * 0.06);
    this.place(E.cow, E.sTheta, E.sH + 10, 0);
    if (E.cow.depth > E.ship.depth) E.cow.setDepth(E.ship.depth - 0.1);
  },
  parmEscapeDraw(g) {
    const E = this.ppEsc; if (!E) return;
    const z = this.zoom, t = this.t, vt = this.viewT(), vh = this.visHalf + 0.2;
    // behind the collapse front: the ground's gone - a great dark rift down to the glowing core
    if (E.st !== 'intro') {
      const n = 24, top = [], bot = [];
      for (let k = 0; k <= n; k++) { const th = wrap(E.front - E.dir * (k / n) * 1.2); top.push(this.screenPos(th, 2)); bot.unshift(this.screenPos(th, -160)); }
      g.fillStyle(0x0a0204, 1).fillPoints(top.concat(bot), true);
      const glow = []; for (let k = 0; k <= n; k++) glow.push(this.screenPos(wrap(E.front - E.dir * (k / n) * 1.2), -120 + Math.sin(t * 3 + k) * 6));
      g.lineStyle(10 * z, 0xff5a1a, 0.5).strokePoints(glow, false); g.lineStyle(3 * z, 0xffd23f, 0.7).strokePoints(glow, false);
      const e0 = this.screenPos(E.front, 0), e1 = this.screenPos(E.front, -50); g.lineStyle(4 * z, 0xffb03a, 0.9).lineBetween(e0.x, e0.y, e1.x, e1.y);
    }
    // the ladder
    if (E.ladder > 0) {
      const a = this.screenPos(E.sTheta, E.sH - 30), b = this.screenPos(E.sTheta, E.sH - 60 - 70 * E.ladder), sw = Math.sin(t * 3) * 6 * z;
      g.lineStyle(3 * z, 0x8a94a6, 1).lineBetween(a.x - 6 * z, a.y, b.x - 6 * z + sw, b.y).lineBetween(a.x + 6 * z, a.y, b.x + 6 * z + sw, b.y);
      for (let k = 1; k < 8; k++) { const u = k / 8, x = a.x + (b.x + sw - a.x) * u, y = a.y + (b.y - a.y) * u; g.lineStyle(2 * z, 0xc8d0dc, 1).lineBetween(x - 6 * z, y, x + 6 * z, y); }
      if (E.st === 'run' && Math.floor(t * 4) % 2) { g.lineStyle(2 * z, 0xffd23f, 0.9).strokeCircle(b.x + sw, b.y, 14 * z); }
    }
  },
});
