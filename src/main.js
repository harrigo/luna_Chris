// Luna Chris - Level 1: The Gruyere Globe
//
// Everything lives in polar coordinates around the planet centre:
//   theta = angle around the planet (radians), h = height above the surface.
// The "camera" rotates so the player is always at the top of the screen, which is
// what makes the planet feel spherical. Arcade physics is NOT used.

const BUILD = 'v0.47';
const verEl = document.getElementById('ver');
if (verEl) verEl.textContent = BUILD;

const TAU = Math.PI * 2;
let R = 420; // planet radius in world units (set per level from LEVELS[n].radius)

const CFG = {
  gravity: 1500,
  jumpV: 560,
  runSpeed: 230,
  maxHp: 5,
  jetHoldDelay: 0.28, // hold jump this long after take-off and the jetpack lights by itself
  fireInterval: 0.085,
  bulletSpeed: 760,
  bulletLife: 0.6,
  invuln: 1.6,
  jetAccel: 2400,   // jetpack thrust
  jetMaxV: 260,     // max climb speed under thrust
  jetDrain: 0.5,    // fuel per second (full tank = 2s)
  jetRegen: 0.7,    // fuel per second while standing on the ground
  jetCeiling: 300,  // max height
  ammoPerShot: 0.022, // Mac-Grinder gauge: full tank is about 45 shots
  ammoRegen: 0.5,     // refill per second once you stop shooting
  ammoDelay: 0.35,    // pause after the last shot before it refills
  ammoRestart: 0.3,   // after running dry the gun stays jammed until the gauge climbs back to this
  // Parmesan Power-Up (triple shot + unlimited pasta) lasts until Chris is hit: it soaks up that hit instead of a heart
  aimAssist: false, // true = shots home in on the nearest enemy; false = shots fly straight the way Chris faces
  autoFire: false   // true = guns fire by themselves whenever an enemy is on screen; false = hold the FIRE button
};

// phone buzz (Android Chrome; ignored elsewhere)
const buzz = p => {           // phone vibration + controller rumble
  try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* not supported */ }
  try { if (typeof Pad !== 'undefined' && Pad.state.connected) Pad.rumble(p); } catch (e) { /* not supported */ }
};

const rnd = (a, b) => a + Math.random() * (b - a);
const wrap = a => { a %= TAU; return a < 0 ? a + TAU : a; };
const angDiff = (a, b) => {
  let d = (a - b) % TAU;
  if (d > Math.PI) d -= TAU; else if (d < -Math.PI) d += TAU;
  return d;
};
// squared distance between two polar points (arc length approximated at mean radius)
const dist2 = (t1, h1, t2, h2) => {
  const dx = angDiff(t1, t2) * (R + (h1 + h2) * 0.5);
  const dy = h1 - h2;
  return dx * dx + dy * dy;
};

class Level1 extends Phaser.Scene {
  constructor() { super('level1'); }

  init(data) {
    this.autostart = !!(data && data.autostart);
    this.direct = !!(data && data.direct);                       // arrived from the level-select screen
    this.levelId = (data && data.level) || 1;
    this.def = LEVELS[this.levelId];
    R = this.def.radius || 420;
    this.waves = this.def.waves.concat([{ name: 'BOSS: ' + this.def.bossName, spawns: [{ type: 'boss', t: 1.5 }] }]);
  }

  // ------------------------------------------------------------------ setup
  create() {
    makeTextures(this);
    makeLevelTextures(this);
    this.cameras.main.setBackgroundColor(this.def.bg);
    this.cameras.main.fadeIn(300, 0, 0, 0);
    this.skyG = this.add.graphics().setDepth(-1);

    this.t = 0;
    this.state = 'intro';           // intro | play | dead | won
    this.endT = 0;
    this.fpsT = 0;
    this.enemies = [];
    this.pBullets = [];
    this.eBullets = [];
    this.parts = [];
    this.pickups = [];
    this.waveIdx = -1;
    this.queue = [];
    this.waveT = 0;
    this.clearT = 0;
    this.spawnSide = 1;
    this.actors = [];               // decorative things placed in the world: Bessie, the rat-ship, falling debris
    this.rescue = null;
    this.nap = null;
    this.paused = false; this.time.paused = false; if (typeof Sound !== 'undefined' && Sound.pause) Sound.pause(false);
    this.skyImg = null; this.abduct = null;
    this.score = 0; this.scoreShown = 0; this.waveTotal = 1;
    this.bonusHeart = false; this.burgerIcon = null;      // the scene object is reused, so reset everything that survives restarts
    this.gotPower = false; this.shootG = null; this.jetOn = false; this.shotN = 0; this.glintT = 0; this.lastDt = 0.016;

    // distant stars
    // Parallax sky, all circling the planet centre at different speeds (k). Layers, far to near:
    //   milky-way dust band (slowest) -> faint far stars -> mid stars -> a few big twinkling near stars (fastest)
    this.bgStars = [];
    this.unw = 0; this.lastTheta = 0;      // unwrapped player angle, so the sky never jumps when theta wraps past 2*pi
    const dust = this.def.dust;
    for (let i = 0; i < (this.def.bgDecor === 'cosmic' ? 0 : 46); i++) {
      const a = rnd(-0.55, 0.55) + (Math.random() < 0.5 ? 0 : Math.PI);        // two opposite smears so one is always passing
      const s = this.add.image(0, 0, 'blob').setDepth(0).setTint(dust[i % dust.length]).setAlpha(Math.min(0.6, rnd(0.16, 0.32) * this.def.dustAlpha)).setScale(rnd(1.0, 2.4) * (this.levelId === 2 ? 1.5 : 1));
      this.bgStars.push({ s, a: a + 0.8, r: 0.25 + rnd(0, 0.5) + Math.sin(a * 2) * 0.1, k: 0.08, dust: true });
    }
    if (this.def.bgDecor === 'cosmic') {               // level 1: 16-bit parallax space, far -> near
      makeDebris(this); makePixStar(this); makeBeam(this); makeBlackHolePix(this, 'px_bhole');
      const nebPal = [[0x1e0c52, 0x3a1680, 0x6224a8, 0x9a3ccc, 0xd47af0], [0x2a0838, 0x581870, 0x8e2496, 0xd04ab8, 0xff90dc], [0x0c1a50, 0x16348a, 0x2a5cc0, 0x5a96f0, 0xa0d4ff]];
      for (let i = 0; i < 5; i++) {                    // swirling nebulae (slowest)
        makeNebula(this, 'neb' + i, 101 + i * 37, nebPal[i % 3]);
        const s = this.add.image(0, 0, 'neb' + i).setDepth(0).setAlpha(0.9).setFlipX(i % 2 === 1);
        s.setScale(3);
        this.bgStars.push({ s, a: i * TAU / 5 + rnd(-0.3, 0.3), r: rnd(0.35, 0.95), k: rnd(0.035, 0.06), rv: rnd(0.01, 0.03) * (i % 2 ? 1 : -1) });
      }
      const galPal = [[0x3a3aa0, 0x7a8aff, 0xc8d8ff, 0xffffff], [0x6a2a8a, 0xc05ad0, 0xffa0f0, 0xffffff]];
      for (let i = 0; i < 4; i++) {                    // pixel spiral galaxies
        makeGalaxyPix(this, 'gal' + i, 300 + i * 11, galPal[i % 2]);
        const s = this.add.image(0, 0, 'gal' + i).setDepth(0).setScale(i < 2 ? 3 : 2).setRotation(rnd(-0.5, 0.5));
        this.bgStars.push({ s, a: i * TAU / 4 + 0.7, r: rnd(0.3, 0.9), k: rnd(0.06, 0.09), rv: 0.05 * (i % 2 ? 1 : -1) });
      }
      for (let i = 0; i < 6; i++) {                    // glowing star clusters
        makeCluster(this, 'clu' + i, 500 + i * 7);
        const s = this.add.image(0, 0, 'clu' + i).setDepth(0).setScale(2);
        this.bgStars.push({ s, a: i * TAU / 6 + 0.3, r: rnd(0.2, 0.95), k: rnd(0.1, 0.14), pulse: rnd(0, 6), bsc: 2 });
      }
      for (let i = 0; i < 2; i++) {                    // black holes
        const s = this.add.image(0, 0, 'px_bhole').setDepth(0).setScale(2);
        this.bgStars.push({ s, a: i * Math.PI + rnd(0.6, 1.4), r: rnd(0.45, 0.85), k: 0.12, rv: 0.25, pulse: rnd(0, 6), bsc: 2 });
      }
      for (let i = 0; i < 3; i++) {
        const s = this.add.image(0, 0, 'c_ringed').setDepth(0).setScale(rnd(0.5, 0.9)).setRotation(rnd(-0.4, 0.4)).setTint([0xffffff, 0x9fd8ff, 0xffb0e0][i]);
        this.bgStars.push({ s, a: i * TAU / 3 + 1, r: rnd(0.3, 0.8), k: rnd(0.16, 0.24) });
      }
    }
    for (let i = 0; i < 200; i++) {
      const s = this.add.image(0, 0, 'bgstar').setDepth(0).setAlpha(rnd(0.15, 0.45)).setScale(rnd(0.4, 0.8));
      this.bgStars.push({ s, a: rnd(0, TAU), r: rnd(0, 1), k: 0.15 });
    }
    for (let i = 0; i < 160; i++) {
      const s = this.add.image(0, 0, 'bgstar').setDepth(0).setAlpha(rnd(0.25, 0.9)).setScale(rnd(0.6, 1.4));
      this.bgStars.push({ s, a: rnd(0, TAU), r: rnd(0, 1), k: 0.35 });   // r = fraction of the way out from the planet
    }
    for (let i = 0; i < 26; i++) {
      const s = this.add.image(0, 0, 'bgstar').setDepth(0).setAlpha(1).setScale(rnd(1.6, 2.6));
      this.bgStars.push({ s, a: rnd(0, TAU), r: rnd(0, 1), k: 0.7, tw: rnd(0, 6) });
    }
    for (const b of this.bgStars) if (!b.dust && this.def.starTint !== 0xffffff) b.s.setTint(this.def.starTint);
    if (this.def.bgDecor === 'cosmic') {               // chunky coloured stars, nearer and faster, spinning and twinkling
      const scol = [0xffd23f, 0x5ce1ff, 0xff6ad5, 0x7dff8a, 0xffffff, 0xff9a3a];
      for (let i = 0; i < 34; i++) {
        const near = i < 12;
        const s = this.add.image(0, 0, 'px_star').setDepth(0).setTint(scol[i % scol.length]).setScale(near ? 3 : 2);
        this.bgStars.push({ s, a: rnd(0, TAU), r: rnd(0.05, 1), k: near ? rnd(0.75, 0.95) : rnd(0.4, 0.55), tws: rnd(0, 6), bsc: s.scale });
      }
      const deb = ['db_rock', 'db_rock', 'db_sat', 'db_bolt', 'db_cheese', 'db_cheese'];
      for (let i = 0; i < 12; i++) {                   // orbital debris tumbling past (nearest layer)
        const s = this.add.image(0, 0, deb[i % deb.length]).setDepth(0.4).setScale(2);
        this.bgStars.push({ s, a: rnd(0, TAU), r: rnd(0.02, 0.6), k: rnd(0.6, 1.1), rv: rnd(-1.6, 1.6) });
      }
      // the rat UFO beaming Bessie up: always hangs in the sky as a reminder of the goal
      this.abduct = {
        beam: this.add.image(0, 0, 'beam0').setOrigin(0.5, 0).setDepth(0.6).setScale(2).setAlpha(0),
        cow: this.add.image(0, 0, 'bessie').setDepth(0.62).setAlpha(0),
        ship: this.add.image(0, 0, 'ratship').setDepth(0.64).setAlpha(0),
        f: 0, ft: 0, a: 0
      };
    }
    if (this.def.bgDecor === 'motes') {                 // level 2: drifting glowing spores
      for (let i = 0; i < 40; i++) {
        const s = this.add.image(0, 0, 'spore').setDepth(0).setScale(rnd(0.4, 1.1)).setAlpha(0.5).setBlendMode(Phaser.BlendModes.ADD);
        this.bgStars.push({ s, a: rnd(0, TAU), r: rnd(0.05, 0.95), k: 0.22, tw: rnd(0, 6), ta: 0.6 });
      }
    } else if (this.def.bgDecor === 'gears') {          // level 3: huge slow gears in the haze
      for (let i = 0; i < 9; i++) {
        const s = this.add.image(0, 0, 'gear').setDepth(0).setTint(i % 2 ? 0x7a3a1c : 0x4a4f5a).setAlpha(rnd(0.16, 0.3)).setScale(rnd(0.7, 2.0));
        this.bgStars.push({ s, a: rnd(0, TAU), r: rnd(0.1, 0.95), k: 0.1, rv: rnd(0.08, 0.3) * (i % 2 ? 1 : -1) });
      }
    }
    this.shoot = null; this.shootCd = rnd(3, 6);

    this.planetG = this.add.graphics().setDepth(1);

    // surface decoration: pits on the surface line and cheese holes inside the planet
    this.decor = [];
    this.planetImg = null;
    if (this.def.surface) {                              // pixel-art planet surface (rotates with the world) + fixed shading
      const key = 'surf' + this.levelId;
      makePlanetTexture(this, key, R, this.def.surface.pal, this.def.surface.seed);
      makePlanetShade(this, 'shade' + this.levelId, R);
      this.planetImg = this.add.image(0, 0, key).setDepth(1.05);
      this.planetShade = this.add.image(0, 0, 'shade' + this.levelId).setDepth(1.1);
      this.rimG = this.add.graphics().setDepth(1.12);
    }
    if (!this.def.surface) for (let i = 0; i < 28; i++) {
      const spr = this.add.image(0, 0, 'crater').setDepth(2).setTint(this.def.decorTint).setAlpha(this.def.decorAlpha);
      spr.bsx = rnd(0.6, 1.5); spr.bsy = rnd(0.8, 1.3);
      this.decor.push({ spr, theta: rnd(0, TAU), h: -8 });
    }
    if (!this.def.surface) for (let i = 0; i < 60; i++) {
      const spr = this.add.image(0, 0, 'hole').setDepth(2).setTint(this.def.decorTint).setAlpha(rnd(0.5, 1) * this.def.decorAlpha);
      spr.bsx = spr.bsy = rnd(0.5, 2.2);
      this.decor.push({ spr, theta: rnd(0, TAU), h: -rnd(30, 170) });
    }

    // bubbling lava craters (level 1): glowing pools that spit droplets now and then
    this.lavas = [];
    for (let i = 0; i < (this.def.lava || 0); i++) {
      const theta = i * TAU / this.def.lava + rnd(0.1, 0.5);
      const glow = this.add.image(0, 0, 'lava_glow').setDepth(2).setBlendMode(Phaser.BlendModes.ADD);
      const pool = this.add.image(0, 0, 'lava_pool').setDepth(2.2);
      const bub = this.add.image(0, 0, 'lava_drop').setDepth(2.3);
      pool.bsx = glow.bsx = rnd(0.8, 1.4); pool.bsy = glow.bsy = rnd(0.9, 1.3);
      this.lavas.push({ theta, h: -rnd(22, 190), pool, glow, bub, bt: rnd(0, 1), bx: 0, ph: rnd(0, 6) });   // set into the planet at random depths
    }

    // fondue geysers (level 1): idle -> warn (vent glows, bubbles, rumble) -> erupt (column of molten cheese that hurts)
    this.geysers = [];
    const gd = this.def.geysers;
    if (gd) for (let i = 0; i < gd.n; i++) {
      const theta = wrap(0.45 + i * (TAU - 0.9) / gd.n + rnd(0, 0.15));          // none right where Chris starts
      const glow = this.add.image(0, 0, 'lava_glow').setDepth(2.5).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
      const vent = this.add.image(0, 0, 'geyser_vent').setOrigin(0.5, 0.75).setDepth(2.6);
      glow.bsx = 1.3; glow.bsy = 2;
      this.geysers.push({ theta, glow, vent, st: 'idle', cd: rnd(1.5, gd.idle[1]), emitT: 0 });
    }

    // ledges you can hop onto, plus scenery props standing on the surface (some behind Chris, some in front)
    this.ledgeSprs = [];
    for (const L of (this.def.ledges || [])) {
      const spr = this.add.image(0, 0, this.def.ledgeTex || 'ledge1').setOrigin(0.5, 0.1).setDepth(3);
      spr.bsx = (L.half * 2 * R) / 72; spr.bsy = 1;
      this.ledgeSprs.push({ spr, L });
    }
    this.props = [];
    for (const pr of (this.def.props || [])) {
      for (let i = 0; i < pr.n; i++) {
        const spr = this.add.image(0, 0, pr.tex).setOrigin(0.5, 1).setDepth(pr.depth || (pr.fg ? 8.2 : 2.5));
        if (pr.tint) spr.setTint(pr.tint);
        if (pr.alpha) spr.setAlpha(pr.alpha);
        spr.bsx = spr.bsy = rnd(pr.sc[0], pr.sc[1]) * 1.35;
        if (Math.random() < 0.5) spr.setFlipX(true);
        this.props.push({ spr, theta: wrap((i + rnd(0.1, 0.9)) * TAU / pr.n), h: pr.h !== undefined ? pr.h : (pr.fg ? -4 : -2), sway: pr.sway ? rnd(0, 6) : -1 });
      }
    }

    // level hazards: gravity spore clouds (level 2) and the moving grater floor (level 3)
    this.zoneSprs = [];
    for (const z of (this.def.zones || [])) {
      const col = z.mult < 1 ? 0x6dff9a : 0xb06aff;
      for (let i = 0; i < 9; i++) {
        const spr = this.add.image(0, 0, 'puff').setDepth(5.5).setTint(col).setAlpha(0.28).setBlendMode(Phaser.BlendModes.ADD);
        spr.bsx = spr.bsy = rnd(1.2, 2.4);
        this.zoneSprs.push({ spr, theta: z.theta + rnd(-z.half, z.half) * 0.9, h: rnd(10, 150), ph: rnd(0, 6) });
      }
    }
    this.convPhase = 0; this.bladeT = 0;

    this.augerPhase = 0;
    this.rig = new ChrisRig(this);        // the animated chef-astronaut (src/chris.js); P.spr below is just an invisible anchor
    this.pl = {
      theta: 0, h: 0, vh: 0, vx: 0, facing: 1,
      hp: CFG.maxHp, invuln: 0, fireCd: 0, ammo: 1, ammoHold: 0, overheat: false, power: 0, fuel: 1, jetArmed: false, thrusting: false,
      spr: this.add.image(0, 0, 'blank').setOrigin(0.5, 1).setDepth(7)
    };

    // particle emitters (screen space; positions come from screenPos())
    this.fxJet = this.add.particles(0, 0, 'flame', { lifespan: { min: 160, max: 340 }, speedY: { min: 140, max: 280 }, speedX: { min: -45, max: 45 }, scale: { start: 1.4, end: 0 }, alpha: { start: 0.95, end: 0 }, blendMode: 'ADD', emitting: false }).setDepth(6);
    this.fxBang = this.add.particles(0, 0, 'spark', { lifespan: { min: 300, max: 750 }, speed: { min: 60, max: 300 }, angle: { min: 0, max: 360 }, scale: { start: 1.5, end: 0 }, alpha: { start: 1, end: 0 }, gravityY: 260, color: [0xfff3a0, 0xff9a2a, 0x8a2a10], colorEase: 'quad.out', blendMode: 'ADD', emitting: false }).setDepth(9);
    this.fxRatJet = this.add.particles(0, 0, 'flame', { lifespan: { min: 220, max: 420 }, speedY: { min: 30, max: 80 }, speedX: { min: -14, max: 14 }, scale: { start: 0.8, end: 0 }, alpha: { start: 0.8, end: 0 }, blendMode: 'ADD', emitting: false }).setDepth(4.8);
    this.fxGlint = this.add.particles(0, 0, 'spark', { lifespan: { min: 350, max: 700 }, speed: { min: 5, max: 40 }, scale: { start: 1.2, end: 0 }, alpha: { start: 1, end: 0 }, tint: 0xfff3a0, blendMode: 'ADD', emitting: false }).setDepth(9);
    this.buildHud();
    this.buildControls();
    this.buildOverlay();

    this.keys = this.input.keyboard
      ? this.input.keyboard.addKeys({ left: 'LEFT', right: 'RIGHT', a: 'A', d: 'D', up: 'UP', w: 'W', space: 'SPACE', z: 'Z', x: 'X', down: 'DOWN', s: 'S' })
      : null;

    if (this.wantFs === undefined) this.wantFs = false;
    this.coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

    // on-screen buttons only on touch devices (a PC uses keyboard / controller); they appear if a touch ever happens
    this.touchUI = (navigator.maxTouchPoints || 0) > 0 || ('ontouchstart' in window);
    if (this.input.keyboard) ['P', 'ESC'].forEach(k => this.input.keyboard.on('keydown-' + k, () => { if (this.state === 'play' || this.state === 'rescue' || this.paused) this.togglePause(); }));
    this.input.on('pointerdown', p => {
      if (p.wasTouch) this.touchUI = true;
      if (this.paused) { this.togglePause(); return; }
      if (p.x > this.W - 74 && p.y > 86 && p.y < 118 && (this.state === 'play' || this.state === 'rescue')) { this.togglePause(); return; }   // PAUSE button
      if (p.x > this.W - 74 && p.y > 50 && p.y < 84) { this.scene.start('select'); return; }   // MENU button
      if (this.state === 'intro' || this.state === 'dead' || this.state === 'won') this.wantFs = true;
      if (this.state === 'intro') this.startGame();
      else if (this.state === 'dead' && this.t - this.endT > 0.8) this.scene.restart({ autostart: true, level: this.levelId });
      else if (this.state === 'won' && this.t - this.endT > 0.8) this.scene.start('select');
    });
    // controller: A/Start = start / retry / continue, View (back) = level menu
    const padOff = Pad.on(b => {
      if (b === 'back') { this.scene.start('select'); return; }
      if (b === 'start' && (this.state === 'play' || this.state === 'rescue' || this.paused)) { this.togglePause(); return; }
      if (this.paused) { if (b === 'a') this.togglePause(); return; }
      if (b !== 'a' && b !== 'start') return;
      if (this.state === 'intro') this.startGame();
      else if (this.state === 'dead' && this.t - this.endT > 0.8) this.scene.restart({ autostart: true, level: this.levelId });
      else if (this.state === 'won' && this.t - this.endT > 0.8) this.scene.start('select');
    });
    this.events.once('shutdown', padOff);
    // cheat mode: H / phone shake gives a heart
    const cheatOff = Cheat.on_(type => {
      if (type === 'mode') { this.cheatText.setVisible(Cheat.on); return; }
      if (type !== 'heart' || !Cheat.on || (this.state !== 'play' && this.state !== 'rescue')) return;
      const P = this.pl;
      if (P.hp < CFG.maxHp) { P.hp++; this.updateHearts(); this.banner('+1 CHEESE'); }
      else if (!this.bonusHeart) { this.bonusHeart = true; this.updateHearts(); this.banner('BONUS BURGER'); }
      Sound.sfx('pickup'); buzz(25);
      this.burst(P.theta, P.h + 30, 'spark', 8, 0.6);
    });
    this.events.once('shutdown', cheatOff);
    // Fullscreen needs a real tap *release* (user activation), so ask for it on pointerup.
    this.input.on('pointerup', () => { if (this.wantFs) { this.wantFs = false; this.enterFullscreen(); } });

    const lockLandscape = () => {
      try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* not supported */ }
    };
    this.scale.on('enterfullscreen', lockLandscape);
    this.scale.on('resize', this.layout, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.layout, this);
      this.scale.off('enterfullscreen', lockLandscape);
    });

    this.layout();
    this.updateHearts();
    if (this.autostart || this.direct) {
      this.startGame();                       // retry after dying / picked from the level select: straight in
    } else {
      this.showOverlay(
        'LEVEL ' + this.levelId,
        this.def.name + '\n\n◀ ▶ run   JUMP to hop   hold FIRE to blast\nTap JUMP, let go, then HOLD it in the air\nto fire the JETPACK. Shots fly straight.\n\nTap to start'
      );
    }
  }

  layout() {
    const W = this.scale.width, H = this.scale.height;
    this.W = W; this.H = H;
    this.landscape = W > H * 1.1;
    this.zoom = Math.min(1, H / 470);          // short (landscape) screens zoom the world out so the boss still fits
    const z = this.zoom, Rz = R * z;
    this.cx = W / 2;
    this.groundY = H * (this.landscape ? 0.70 : 0.58);   // where the player stands on screen
    this.cy = this.groundY + Rz;                          // planet centre
    // how far round the planet (radians) you can see before things drop off-screen
    const byX = Math.asin(Math.min(1, (W / 2) / Rz));
    const byY = Math.acos(Math.max(-1, Math.min(1, (this.cy - H) / Rz)));
    this.visHalf = Math.min(byX, byY);
    this.visArc = R * this.visHalf;
    this.maxStarR = Math.hypot(W, this.cy);

    if (this.def.skyCols) {                             // 16-bit dithered sky bands
      const sw = Math.ceil(W / 3), sh = Math.ceil(H / 3);
      if (this.skyImg) this.skyImg.destroy();
      makeSkyDither(this, 'skyd' + this.levelId, sw, sh, this.def.skyCols);
      this.skyImg = this.add.image(0, 0, 'skyd' + this.levelId).setOrigin(0).setScale(3).setDepth(-1);
      this.skyG.clear();
    } else this.skyG.clear().fillGradientStyle(this.def.sky[0], this.def.sky[0], this.def.sky[1], this.def.sky[1], 1).fillRect(0, 0, W, H);

    this.btn = {
      left:  { x: 64,     y: H - 68, r: 44 },
      right: { x: 172,    y: H - 68, r: 44 },
      jump:  { x: W - 78, y: H - 78, r: 54 },
      fire:  { x: W - 196, y: H - 60, r: 42 }
    };
    for (const k in this.btn) this.btnLabels[k].setPosition(this.btn[k].x, this.btn[k].y);

    this.waveText.setPosition(W / 2, 4);
    this.scoreText.setPosition(W / 2, 26);
    if (this.portrait) this.portrait.setPosition(10, 10);
    this.nameText.setPosition(66, 8);
    this.cheeseIcons.forEach((c, i) => c.setPosition(66 + i * 28, 20));
    this.macIcons.forEach((c, i) => c.setPosition(96 + i * 20, 61));
    this.hud = { dx0: W - 262, dx1: W - 74, dy: 24 };
    this.distText.setPosition(this.hud.dx0, 8);
    this.cowIcon.setPosition(this.hud.dx1 + 14, this.hud.dy + 1);
    this.bannerText.setPosition(W / 2, H * 0.22).setWordWrapWidth(W - 40);
    this.jetText.setPosition(66, 46);
    this.macText.setPosition(66, 63);
    this.menuText.setPosition(W - 10, 58);
    this.pauseBtnText.setPosition(W - 10, 94);
    this.pauseText.setPosition(W / 2, H * 0.42);
    this.pauseHint.setPosition(W / 2, H * 0.42 + 34);
    this.zoneText.setPosition(W / 2, 52);
    this.fpsText.setPosition(10, 66);
    this.cheatText.setPosition(10, 76);
    this.ovBg.setSize(W, H);
    this.ovTitle.setPosition(W / 2, H * (this.landscape ? 0.17 : 0.28)).setWordWrapWidth(W - 40);
    this.ovBody.setFontSize(this.landscape ? '9px' : '10px').setPosition(W / 2, H * (this.landscape ? 0.3 : 0.4)).setWordWrapWidth(W - 40);
  }

  buildHud() {
    const f = (size, color, extra) => Object.assign({ fontFamily: PIXEL, fontSize: size + 'px', color }, extra || {});
    makeHudTextures(this);
    const ink = { stroke: '#1a1020', strokeThickness: 3 };
    this.heartsText = this.add.text(12, 8, '', f(22, '#ff4d6d', { fontFamily: 'monospace', fontStyle: 'bold' })).setDepth(20).setVisible(false);
    this.waveText = this.add.text(0, 0, '', f(16, '#ffd23f', { stroke: '#1a1020', strokeThickness: 5 })).setOrigin(0.5, 0).setDepth(20);
    this.scoreText = this.add.text(0, 0, 'SCORE: 0000000', f(8, '#ffffff', ink)).setOrigin(0.5, 0).setDepth(20);
    this.fpsText = this.add.text(0, 0, '', f(6, '#6b7390')).setDepth(20);
    this.nameText = this.add.text(0, 0, 'CHRIS', f(8, '#ffd23f', ink)).setDepth(20);
    this.jetText = this.add.text(0, 0, 'JET', f(8, '#9fd8ff', ink)).setDepth(20);
    this.macText = this.add.text(0, 0, 'MAC', f(8, '#ffc36a', ink)).setDepth(20);
    this.portrait = this.textures.exists('portrait') ? this.add.image(0, 0, 'portrait').setOrigin(0).setScale(2).setDepth(20.5) : null;
    this.cheeseIcons = []; for (let i = 0; i < CFG.maxHp; i++) this.cheeseIcons.push(this.add.image(0, 0, 'hud_cheese').setOrigin(0).setScale(2).setDepth(20.5));
    this.macIcons = []; for (let i = 0; i < 7; i++) this.macIcons.push(this.add.image(0, 0, 'hud_mac').setOrigin(0).setScale(2).setDepth(20.5));
    this.distText = this.add.text(0, 0, 'DISTANCE TO COW', f(8, '#ffffff', ink)).setDepth(20);
    this.cheatText = this.add.text(0, 0, 'CHEAT', f(8, '#ff4d8d', ink)).setDepth(20).setVisible(Cheat.on);
    this.cowIcon = this.add.image(0, 0, 'bessie').setScale(0.36).setDepth(20.5);
    this.chrisMark = this.textures.exists('portrait') ? this.add.image(0, 0, 'portrait').setScale(0.5).setDepth(20.6) : null;
    this.menuText = this.add.text(0, 0, 'MENU', f(8, '#9fa6c2')).setOrigin(1, 0).setDepth(20);
    this.pauseBtnText = this.add.text(0, 0, 'PAUSE', f(8, '#9fa6c2')).setOrigin(1, 0).setDepth(20);
    this.pauseText = this.add.text(0, 0, 'PAUSED', f(26, '#ffd23f', { stroke: '#1a1020', strokeThickness: 6 })).setOrigin(0.5).setDepth(32).setVisible(false);
    this.pauseHint = this.add.text(0, 0, 'START / P / TAP TO RESUME', f(9, '#ffffff', { stroke: '#1a1020', strokeThickness: 4 })).setOrigin(0.5).setDepth(32).setVisible(false);
    this.zoneText = this.add.text(0, 0, '', f(9, '#9bff6a', { stroke: '#1a1020', strokeThickness: 3 })).setOrigin(0.5, 0).setDepth(20);
    this.bannerText = this.add.text(0, 0, '', f(17, '#ffd23f', { align: 'center', stroke: '#1a1020', strokeThickness: 4, lineSpacing: 8 })).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.hudG = this.add.graphics().setDepth(20);
  }

  buildControls() {
    this.ctrlG = this.add.graphics().setDepth(20);
    const labels = { left: '◀', right: '▶', jump: 'JUMP\n+JET', fire: 'FIRE' };
    this.btnLabels = {};
    for (const k in labels) {
      this.btnLabels[k] = this.add.text(0, 0, labels[k], {
        fontFamily: (k === 'left' || k === 'right') ? 'monospace' : PIXEL, fontSize: (k === 'left' || k === 'right') ? '30px' : '11px', color: '#ffffff', align: 'center', lineSpacing: 6
      }).setOrigin(0.5).setDepth(21).setAlpha(0.85);
    }
  }

  buildOverlay() {
    this.ovBg = this.add.rectangle(0, 0, 10, 10, 0x000000, 0.62).setOrigin(0).setDepth(30);
    this.ovTitle = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '22px', color: '#ffd23f', align: 'center', stroke: '#1a1020', strokeThickness: 5 }).setOrigin(0.5).setDepth(31);
    this.ovBody = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '9px', color: '#ffffff', align: 'center', lineSpacing: 9 }).setOrigin(0.5, 0).setDepth(31);
  }

  enterFullscreen() {
    const standalone = window.matchMedia && (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches);
    if (standalone) return;     // installed app is already fullscreen
    try { if (!this.scale.isFullscreen) this.scale.startFullscreen({ navigationUI: 'hide' }); } catch (e) { /* not supported (e.g. iPhone Safari) */ }
  }

  showOverlay(title, body) {
    this.ovTitle.setText(title);
    this.ovBody.setText(body);
    this.ovBg.setVisible(true); this.ovTitle.setVisible(true); this.ovBody.setVisible(true);
  }
  hideOverlay() { this.ovBg.setVisible(false); this.ovTitle.setVisible(false); this.ovBody.setVisible(false); }

  banner(text) {
    this.tweens.killTweensOf(this.bannerText);
    this.bannerText.setText(text).setAlpha(1);
    this.tweens.add({ targets: this.bannerText, alpha: 0, delay: 1400, duration: 500 });
  }

  addScore(n) { this.score += n; }

  updateHearts() {
    const hp = Math.max(0, this.pl.hp);
    this.cheeseIcons.forEach((c, i) => c.setTexture(i < hp ? 'hud_cheese' : 'hud_cheese_off'));
    if (this.bonusHeart) {                 // the cheeseburger heart sits after the cheese wedges
      if (!this.burgerIcon) this.burgerIcon = this.add.image(0, 0, 'burger').setDepth(20).setScale(0.55);
      this.burgerIcon.setPosition(66 + CFG.maxHp * 28 + 12, 30);
    }
  }

  // ------------------------------------------------------------- game flow
  startGame() {
    this.hideOverlay();
    this.state = 'play';
    Sound.init();
    this.waveText.setText('LEVEL ' + this.levelId);
    if (this.autostart) { Sound.music(this.def.music); this.nextWave(); return; }   // retry: no cutscene, straight back in
    Sound.music('stinger', this.def.music);
    this.clearT = -1.8;                // first wave starts about 3s in, once the rat-ship has made off with Bessie
    this.banner('THE RATS ARE TAKING BESSIE!');
    this.startNap();
  }

  // Start of the level: a rat-ship tractor-beams Bessie and scuttles off round the planet.
  startNap() {
    const P = this.pl;
    const ship = { spr: this.add.image(0, 0, 'ratship').setDepth(6), theta: wrap(P.theta + 0.5), h: 250, rot: 0 };
    const cow = { spr: this.add.image(0, 0, 'bessie').setOrigin(0.5, 1).setDepth(6), theta: ship.theta, h: 205, rot: 0 };
    this.actors.push(ship, cow);
    this.nap = { ship, cow, t: 0 };
    Sound.sfx('beam'); Sound.sfx('moo');
  }

  updateNap(dt) {
    const n = this.nap;
    n.t += dt;
    n.ship.theta = wrap(n.ship.theta - (0.12 + n.t * 0.22) * dt);   // accelerates away
    n.ship.h += n.t * 26 * dt;
    n.cow.theta = n.ship.theta;
    n.cow.h = n.ship.h - 58 - Math.sin(n.t * 5) * 4;
    n.cow.rot = Math.sin(n.t * 4) * 0.25;
    if (n.t > 4) {
      for (const a of [n.ship, n.cow]) { a.spr.destroy(); this.actors.splice(this.actors.indexOf(a), 1); }
      this.nap = null;
    }
  }

  // End of the level: the Croque Monsieur's wreck drops Bessie, she dodges the falling debris by a whisker.
  startRescue() {
    const P = this.pl;
    const T0 = wrap(P.theta + 0.3);
    const cow = { spr: this.add.image(0, 0, 'bessie').setOrigin(0.5, 1).setDepth(6), theta: T0, h: 330, rot: 0 };
    const ham = { spr: this.add.image(0, 0, 'ham').setDepth(8), theta: wrap(T0 - 0.02), h: 640, rot: 0 };
    this.actors.push(cow, ham);
    this.rescue = { cow, ham, T0, t: 0, landed: false, smashed: false, burger: null, got: false };
    this.state = 'rescue';
    this.clearEBullets();
    Sound.jet(false); Sound.music(null);
    this.banner('BESSIE!');
    Sound.sfx('moo');
  }

  updateRescue(dt) {
    const r = this.rescue;
    r.t += dt;
    const t = r.t, k = Math.min(1, t / 2.4);
    r.cow.h = 330 * (1 - k * k);                                     // floats down, zero-g style
    r.cow.theta = wrap(r.T0 + 0.1 * Math.min(1, Math.max(0, (t - 1.0) / 1.4)));   // sidesteps at the last moment
    r.cow.rot = Math.sin(t * 3.2) * 0.3 * (1 - k);
    r.ham.h = Math.max(0, 640 - t * t * 250);                        // hot ham from the wreck, falling fast
    r.ham.rot += dt * 6;
    if (!r.smashed && r.ham.h <= 0) {
      r.smashed = true;
      this.burst(r.ham.theta, 6, 'crumb', 18, 1.3);
      this.cameras.main.shake(260, 0.012);
      Sound.sfx('boom');
      r.ham.spr.destroy(); this.actors.splice(this.actors.indexOf(r.ham), 1);
    }
    if (!r.landed && k >= 1) {
      r.landed = true;
      this.burst(r.cow.theta, 30, 'spark', 14, 0.9);
      Sound.music('win');
      Sound.sfx('moo');
      this.banner('MOO! ...Bessie is safe!');
    }
    if (r.landed && !r.burger && t > 2.8) {           // the end-of-level treat: a cheeseburger falls from the sky
      r.burger = { spr: this.add.image(0, 0, 'burger').setDepth(8), theta: wrap(this.pl.theta + 0.05), h: 330, rot: 0 };
      this.actors.push(r.burger);
      Sound.sfx('whoosh');
    }
    if (r.burger && !r.got) {
      const b = r.burger, P = this.pl;
      b.rot = Math.sin(t * 6) * 0.2;
      b.theta = wrap(b.theta + angDiff(P.theta, b.theta) * Math.min(1, dt * 2.5));
      b.h += (P.h + 34 - b.h) * Math.min(1, dt * 1.8);
      if (Math.abs(b.h - (P.h + 34)) < 14 && Math.abs(angDiff(b.theta, P.theta)) * R < 18) {
        r.got = true;
        this.actors.splice(this.actors.indexOf(b), 1); b.spr.destroy();
        this.burst(P.theta, P.h + 30, 'spark', 14, 1);
        this.bonusHeart = true; this.addScore(1000);
        buzz([25, 40, 25, 40, 90]);
        this.bang(P.theta, P.h + 30, 40);
        this.registry.set('bonusHeart', true);             // carried forward for Level 2
        this.updateHearts();
        Sound.sfx('power');
        this.banner('EXTRA HEART! CHEESEBURGER!');
      }
    }
    if (t > 7.4) {
      r.cow.spr.destroy(); this.actors.splice(this.actors.indexOf(r.cow), 1);
      if (r.burger && !r.got) { r.burger.spr.destroy(); this.actors.splice(this.actors.indexOf(r.burger), 1); }
      this.rescue = null;
      this.finishWin();
    }
  }

  nextWave() {
    this.waveIdx++;
    if (this.waveIdx >= this.waves.length) { this.win(); return; }
    const w = this.waves[this.waveIdx];
    this.queue = w.spawns.map(s => Object.assign({}, s)).sort((a, b) => a.t - b.t);
    this.waveTotal = Math.max(1, this.queue.length);
    if (this.waveIdx > 0) this.addScore(1000);                // wave-clear bonus
    this.waveT = 0;
    this.clearT = 0;
    this.banner(this.waveIdx === 0 && this.def.tip ? w.name + '\n' + this.def.tip : w.name);
    if (this.waveIdx > 0 && this.waveIdx < this.waves.length - 1) Sound.sfx('wave');
    if (this.waveIdx > 0 && this.pl.hp < CFG.maxHp) {      // a breather: a cheese wedge drops in between waves when you're hurt
      this.pickups.push({ kind: 'heal', theta: wrap(this.pl.theta + 0.14), h: 330, vh: 0, life: 16, spr: this.add.image(0, 0, 'wedge').setDepth(6) });
    }
    this.waveText.setText(this.waveIdx < this.waves.length - 1 ? 'WAVE ' + (this.waveIdx + 1) + '/' + (this.waves.length - 1) : 'BOSS');
  }

  win() { this.startRescue(); }

  finishWin() {
    this.state = 'won';
    this.endT = this.t;
    this.showOverlay('LEVEL ' + this.levelId + ' CLEAR!', this.def.win + '\n\nTap for level select');
  }

  die() {
    buzz([120, 60, 250]);
    this.state = 'dead';
    Sound.jet(false); Sound.music('lose');
    this.endT = this.t;
    this.burst(this.pl.theta, this.pl.h + 20, 'spark', 14, 1.2);
    this.showOverlay('CHRIS IS TOAST', 'The rats got away with Bessie.\n\nTap to try again');
  }

  hurt() {
    const P = this.pl;
    if (P.invuln > 0 || this.state !== 'play') return;
    if (P.power > 0) {                     // the Parmesan Power-Up takes the hit instead of a heart
      P.power = 0;
      P.invuln = CFG.invuln;
      Sound.sfx('clunk');
      buzz(35);
      this.bang(P.theta, P.h + 24, 18);
      this.burst(P.theta, P.h + 24, 'spark', 10, 1);
      this.cameras.main.shake(100, 0.005);
      this.banner('POWER-UP LOST!');
      return;
    }
    P.hp--;
    P.invuln = CFG.invuln;
    P.vh = Math.max(P.vh, 300);
    this.updateHearts();
    Sound.sfx('hurt');
    this.bang(P.theta, P.h + 24, 12);
    buzz(60);
    this.cameras.main.shake(120, 0.006);
    if (P.hp <= 0) this.die();
  }

  // per-level world rules: the scrolling grater floor, gravity-zone label
  updateWorld(dt) {
    const d = this.def, P = this.pl;
    if (d.conveyor) this.convPhase = wrap(this.convPhase + d.conveyor / R * dt);
    if (d.zones) {
      const g = this.gAt(P.theta);
      this.zoneText.setText(g < CFG.gravity ? 'LOW GRAVITY' : (g > CFG.gravity ? 'HEAVY GRAVITY' : '')).setColor(g < CFG.gravity ? '#9bff6a' : '#d6a6ff');
    }
  }

  // floating ledges (one-way: jump up through them, land on top). Returns the height of the highest ledge you could be standing on, else 0.
  floorAt(theta, h) {
    let f = 0;
    if (this.pl && this.pl.dropT > 0) return 0;          // dropping through a ledge
    for (const L of (this.def.ledges || [])) if (L.h > f && L.h <= h + 4 && Math.abs(angDiff(theta, L.theta)) < L.half) f = L.h;
    return f;
  }

  onPlatform(theta) {
    const pf = this.def.platforms;
    for (let i = 0; i < pf.count; i++) if (Math.abs(angDiff(theta, wrap(i * TAU / pf.count - this.convPhase))) < pf.half) return true;
    return false;
  }

  // gravity at a spot on the surface (level 2's spore clouds make it floaty or heavy)
  gAt(theta) {
    const zs = this.def.zones;
    if (zs) for (const z of zs) if (Math.abs(angDiff(theta, z.theta)) < z.half) return CFG.gravity * z.mult;
    return CFG.gravity;
  }

  // ----------------------------------------------------------------- update
  update(time, delta) {
    const dt = Math.min(delta / 1000, 0.05);
    this.lastDt = dt;
    const inp = this.readInput();
    if (this.coarse && this.H > this.W) { this.render(inp); return; }   // paused while the "rotate your phone" prompt shows
    if (this.paused) { this.render(inp); return; }
    this.t += dt;

    if (this.state === 'play') {
      this.updateWorld(dt);
      this.updatePlayer(dt, inp);
      this.updateWaves(dt);
      this.updateEnemies(dt);
      this.updatePlayerBullets(dt);
      this.updateEnemyBullets(dt);
      this.updatePickups(dt);
    }
    else if (this.state === 'rescue') {
      this.updatePlayer(dt, inp);
      this.updateRescue(dt);
    }
    if (this.nap) this.updateNap(dt);
    this.updateParticles(dt);

    this.fpsT += dt;
    if (this.fpsT > 0.5) { this.fpsT = 0; this.fpsText.setText(Math.round(this.game.loop.actualFps) + ' fps'); }

    this.render(inp);
  }

  togglePause() {
    this.paused = !this.paused;
    this.time.paused = this.paused;
    if (this.paused) this.tweens.pauseAll(); else this.tweens.resumeAll();
    Sound.pause(this.paused);
    this.pauseText.setVisible(this.paused);
    this.pauseHint.setVisible(this.paused);
  }

  readInput() {
    const d = { left: false, right: false, jump: false, fire: false, down: false };
    for (const p of this.input.manager.pointers) {
      if (!p || !p.isDown) continue;
      let best = null, bd = 1e9;
      for (const k in this.btn) {
        const b = this.btn[k];
        const dd = Math.hypot(p.x - b.x, p.y - b.y);
        if (dd < b.r * 1.25 && dd < bd) { bd = dd; best = k; }
      }
      if (best) d[best] = true;
    }
    const k = this.keys;
    if (k) {
      if (k.left.isDown || k.a.isDown) d.left = true;
      if (k.right.isDown || k.d.isDown) d.right = true;
      if (k.space.isDown || k.up.isDown || k.w.isDown) d.jump = true;
      if (k.z.isDown || k.x.isDown) d.fire = true;
      if (k.down.isDown || k.s.isDown) d.down = true;
    }
    const g = Pad.state;
    if (g.connected) {
      if (g.left) d.left = true;
      if (g.right) d.right = true;
      if (g.jump) d.jump = true;
      if (g.fire) d.fire = true;
      if (g.down) d.down = true;
    }
    return d;
  }

  updatePlayer(dt, inp) {
    const P = this.pl;
    // jump vs down: the most recent press wins while both are held (no fighting / bouncing)
    if (inp.jump && !this.prevJ) P.jumpAt = this.t;
    if (inp.down && !this.prevD) P.downAt = this.t;
    this.prevJ = inp.jump; this.prevD = inp.down;
    P.dropT = Math.max(0, (P.dropT || 0) - dt);
    if (!inp.jump) P.jumpEaten = false;
    if (inp.jump && inp.down) {
      const onLedge = (P.floor || 0) > 0 && P.h <= P.floor + 0.5 && P.vh <= 0;
      if (P.jumpAt >= P.downAt && onLedge && !P.jumpEaten) { P.dropT = 0.35; P.floor = 0; P.h -= 1; P.jumpEaten = true; }   // down + jump on a ledge = drop through it
      inp = Object.assign({}, inp, (P.downAt > P.jumpAt || P.jumpEaten) ? { jump: false } : { down: false });
    } else if (P.jumpEaten) inp = Object.assign({}, inp, { jump: false });
    P.duck = !!inp.down && !inp.jump;                        // on the ground: crouch; in the air: tuck and drop   // crouch: stop, shoot low, smaller target
    const onGround = P.h <= (P.floor || 0) + 0.5 && P.vh <= 0;
    const ax = (P.duck && onGround) ? 0 : (inp.right ? 1 : 0) - (inp.left ? 1 : 0);   // can still steer while dropping
    if (P.duck && inp.left) P.facing = -1; else if (P.duck && inp.right) P.facing = 1;

    P.vx += (ax * CFG.runSpeed - P.vx) * Math.min(1, dt * (P.h > 0 ? 6 : 12));
    P.theta = wrap(P.theta + (P.vx / R) * dt);
    if (this.def.conveyor && this.state === 'play' && P.h <= 0) {          // the grater floor: the treadmill carries you back...
      P.theta = wrap(P.theta - this.def.conveyor / R * dt);
      if (this.onPlatform(P.theta)) this.bladeT = 0;
      else {                                                                // ...and the bare blades hurt
        this.bladeT -= dt;
        if (this.bladeT <= 0) {
          this.bladeT = 0.7;
          const s = this.screenPos(P.theta, 0);
          this.fxBang.emitParticleAt(s.x, s.y, 10);
          Sound.sfx('zing');
          this.hurt();
        }
      }
    }
    if (ax !== 0) P.facing = ax;

    const hPrev = P.h;
    P.floor = this.floorAt(P.theta, P.h);
    const grounded = P.h <= P.floor && P.vh <= 0;
    if (inp.jump && grounded) { P.vh = CFG.jumpV; P.jetArmed = false; P.holdT = 0; Sound.sfx('jump'); }
    if (!grounded && inp.jump) { P.holdT = (P.holdT || 0) + dt; if (P.holdT > CFG.jetHoldDelay) P.jetArmed = true; }   // keep holding jump: the jetpack kicks in after a beat
    else if (!inp.jump) P.holdT = CFG.jetHoldDelay + 1;                                                                                // (a fresh press in mid-air lights it at once)
    if (!inp.jump && P.vh > 320) P.vh = 320;      // release early = shorter hop
    if (!grounded && !inp.jump) P.jetArmed = true; // let go in mid-air, then hold again to light the jetpack

    P.diving = !grounded && !!inp.down;                       // duck in mid-air = tuck and drop fast (cuts the jetpack)
    P.thrusting = !grounded && inp.jump && P.jetArmed && P.fuel > 0 && !P.diving;
    if (P.thrusting !== this.jetOn) { this.jetOn = P.thrusting; Sound.jet(P.thrusting); }
    if (P.thrusting) {
      P.vh = Math.min(CFG.jetMaxV, P.vh + CFG.jetAccel * dt);
      P.fuel = Math.max(0, P.fuel - CFG.jetDrain * dt);
      this.jetFlames(2);
    } else if (grounded) {
      P.fuel = Math.min(1, P.fuel + CFG.jetRegen * dt);
    }

    P.vh -= this.gAt(P.theta) * dt * (P.diving ? 3.2 : 1);
    if (P.diving && P.vh > -220) P.vh = -220;                // kill the upward float straight away
    if (P.diving) P.vh = Math.max(P.vh, -900);
    P.h += P.vh * dt;
    if (P.h >= CFG.jetCeiling) { P.h = CFG.jetCeiling; if (P.vh > 0) P.vh = 0; }
    const fl2 = this.floorAt(P.theta, hPrev);
    if (P.h <= fl2) {
      if (P.diving && P.vh < -420) { this.cameras.main.shake(90, 0.006); this.burst(P.theta, fl2 + 4, 'spark', 8, 0.8); Sound.sfx('jump'); buzz(25); }   // ground-pound thud
      P.h = fl2; P.floor = fl2; if (P.vh < 0) P.vh = 0;
    }

    P.invuln = Math.max(0, P.invuln - dt);

    // Mac-Grinder: hold FIRE (Z/X on keyboard). Pasta gauge drains per shot and refills when you let off.
    P.fireCd -= dt;
    P.ammoHold = Math.max(0, P.ammoHold - dt);
    if (P.overheat && P.ammo >= CFG.ammoRestart) P.overheat = false;
    const tgt = CFG.aimAssist ? this.pickTarget() : null;
    const want = (CFG.autoFire && tgt) || inp.fire;
    if (P.fireCd <= 0 && want && !P.overheat) {
      this.fire(tgt);
      P.fireCd = CFG.fireInterval;
      if (P.power <= 0) {
        P.ammo = Math.max(0, P.ammo - CFG.ammoPerShot);
        P.ammoHold = CFG.ammoDelay;
        if (P.ammo <= 0) { P.overheat = true; Sound.sfx('hiss'); }
      }
    }
    if (P.ammoHold <= 0) P.ammo = Math.min(1, P.ammo + CFG.ammoRegen * dt);
  }

  pickTarget() {
    const P = this.pl;
    const halfW = this.visArc + 30;
    let best = null, bd = 1e12;
    for (const e of this.enemies) {
      const ex = angDiff(e.theta, P.theta) * R;
      if (Math.abs(ex) > halfW) continue;
      const ey = e.h + e.ch - (P.h + 40);
      let d = ex * ex + ey * ey;
      if (e.type === 'boss') d *= 0.25;
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  // The Mac-Grinder 3000: a fast stream of spiralling macaroni, auto-aimed at the nearest enemy.
  fire(tgt) {
    const P = this.pl;
    if ((this.shotN = (this.shotN || 0) + 1) % 2 === 0) Sound.sfx('shoot');
    let dx = P.facing, dy = 0;
    const gh = P.h + (P.duck ? 22 : 40);   // muzzle height: chest height, or low when ducking
    if (tgt) {
      let ex = angDiff(tgt.theta, P.theta) * R;
      let ey = tgt.h + tgt.ch - gh;
      const t0 = Math.hypot(ex, ey) / CFG.bulletSpeed;       // lead the target
      ex += tgt.vx * t0;
      ey += Math.max(-150, Math.min(150, tgt.dh * t0));
      const len = Math.hypot(ex, ey) || 1;
      dx = ex / len; dy = ey / len;
      P.facing = ex >= 0 ? 1 : -1;
    }
    P.firing = 0.12;
    if (Pad.state.connected) Pad.pulse(70, 0, 0.18);          // a light buzz in the hands while the Mac-Grinder fires
    { const sp = this.screenPos(P.theta, P.h), z = this.zoom; this.fxBang.emitParticleAt(sp.x + P.facing * 74 * z, sp.y - (P.duck ? 22 : 40) * z, 1); }                      // keeps the drill-bit spinning for a moment
    const bt = wrap(P.theta + (Math.sign(dx) || 1) * (70 / R));
    for (const a of (P.power > 0 ? [-0.2, 0, 0.2] : [0])) {      // Parmesan Power-Up = triple spread
      const c = Math.cos(a), s = Math.sin(a);
      const ux = dx * c - dy * s, uy = dx * s + dy * c;
      this.pBullets.push({
        bt, bh: gh, theta: bt, h: gh,
        vt: ux * CFG.bulletSpeed, vh: uy * CFG.bulletSpeed,
        px: -uy, py: ux, ph: rnd(0, TAU), age: 0,
        spr: this.add.image(0, 0, 'macaroni').setDepth(8)
      });
    }
  }

  jetFlames(n) {
    const P = this.pl;
    const s = this.screenPos(P.theta, P.h), z = this.zoom;
    this.fxJet.emitParticleAt(s.x - P.facing * 17 * z, s.y - 19 * z, n + 1);
  }

  updateWaves(dt) {
    this.waveT += dt;
    while (this.queue.length && this.queue[0].t <= this.waveT) this.spawnEnemy(this.queue.shift().type);
    if (!this.queue.length && this.enemies.length === 0) {
      this.clearT += dt;
      if (this.clearT > 1.4) this.nextWave();
    } else {
      this.clearT = 0;
    }
  }

  // pick an off-screen spot and spawn one enemy there
  spawnEnemy(type) {
    const P = this.pl;
    let theta, side = this.spawnSide;
    if (type === 'boss') theta = wrap(P.theta + 0.2);
    else {
      this.spawnSide = -this.spawnSide;
      theta = wrap(P.theta + side * (this.visHalf + 0.1 + rnd(0, 0.15)));
    }
    const e = this.makeEnemy(type, theta, side);
    this.enemies.push(e);
    if (type === 'boss') { Sound.sfx('bossIn'); Sound.music('boss'); buzz(150); }
    return e;
  }

  // Build an enemy object. Sprites are drawn a bit bigger than their art; hitboxes grow less so it stays fair.
  makeEnemy(type, theta, side) {
    let st, tex, oy, k;
    if (type === 'boss') {
      const b = this.def.boss;
      st = { hp: b.hp, r: 54, ch: 0, drop: 0 }; tex = b.tex; oy = 0.5; k = 1.12;
    } else {
      st = ENEMY[type]; tex = st.tex; oy = st.oy; k = 1.22;
    }
    const e = {
      type, theta, h: type === 'boss' ? 240 : 0, vh: 0, hp: st.hp, maxHp: st.hp, r: st.r * (1 + (k - 1) * 0.5), ch: st.ch * k,
      big: !!st.big, drop: st.drop,
      spr: this.add.image(0, 0, tex).setOrigin(0.5, oy).setDepth(type === 'boss' ? 6 : 5),
      t: 0, seed: rnd(0, 6), flash: 0, vx: 0, dh: 0, dir: -(side || 1)
    };
    e.spr.bsx = e.spr.bsy = k;
    if (type === 'boss') {
      e.ai = this.def.boss.ai; e.rainCd = 1.5; e.fanCd = 3; e.sumCd = 5; e.dir = 1;
    } else if (type === 'flyer') {
      e.h = e.baseH = rnd(110, 270); e.bombCd = rnd(0.8, 1.8);
    } else if (type === 'mouse' || type === 'germ' || type === 'minigerm') {
      e.hopCd = rnd(0.2, 1);
    } else if (type === 'golem') {
      e.shootCd = rnd(0.8, 1.6); e.volley = 0;
    } else if (type === 'frog') {
      e.state = 'idle'; e.cd = rnd(0.6, 1.4); e.leapV = 0;
    } else if (type === 'drone') {
      e.h = e.baseH = rnd(100, 210); e.state = 'hover'; e.cd = rnd(1.4, 2.4); e.tx = 0; e.ty = 0;
    } else if (type === 'slicer') {
      e.shootCd = rnd(1.4, 2.4); e.roll = 0; e.flipCd = rnd(3, 6);
    }
    return e;
  }

  updateEnemies(dt) {
    const P = this.pl;
    for (const e of this.enemies) {
      const pt = e.theta, ph = e.h;
      e.t += dt;
      const toP = angDiff(P.theta, e.theta);
      const distP = Math.abs(toP) * R;
      if (e.fdir === undefined || distP > 16) e.fdir = toP >= 0 ? 1 : -1;      // keep facing when right next to Chris: no flip flicker
      const dirP = e.fdir;

      if (e.type === 'mouse') {
        const grounded = e.h <= 0 && e.vh <= 0;
        const sp = 85 + 35 * Math.sin(e.t * 7 + e.seed);
        e.theta = wrap(e.theta + (dirP * sp / R) * dt);
        e.dir = dirP;
        e.hopCd -= dt;
        if (grounded && e.hopCd <= 0) { e.vh = rnd(280, 430); e.hopCd = rnd(0.5, 1.4); }
        e.vh -= this.gAt(e.theta) * dt;
        e.h += e.vh * dt;
        if (e.h <= 0) { e.h = 0; if (e.vh < 0) e.vh = 0; }

      } else if (e.type === 'flyer') {
        const want = e.baseH + Math.sin(e.t * 2 + e.seed) * 28;
        e.h += (want - e.h) * Math.min(1, dt * 3);
        const hold = 90 + Math.sin(e.t * 0.7 + e.seed) * 70;
        const mv = distP > hold ? dirP : -dirP * 0.6;
        e.theta = wrap(e.theta + (mv * 105 / R) * dt);
        e.dir = dirP;
        e.bombCd -= dt;
        if (e.bombCd <= 0 && distP < 230) {
          this.addEBullet('cube', e.theta, e.h, dirP * 40, -190, 9, 3);
          e.bombCd = rnd(1.5, 2.5);
          Sound.sfx('cube');
        }

      } else if (e.type === 'golem') {
        let mv = 0;
        if (distP > 270) mv = dirP; else if (distP < 160) mv = -dirP;
        e.theta = wrap(e.theta + (mv * 42 / R) * dt);
        e.dir = dirP;
        e.shootCd -= dt;
        if (e.shootCd <= 0 && distP < 460) {
          const n = (e.volley++ % 3 === 2) ? 5 : 3;
          Sound.sfx('cube');
          for (let k = 0; k < n; k++) {
            this.addEBullet('cube', e.theta + dirP * (32 / R), e.h + 30, dirP * 185, (k - (n - 1) / 2) * 45, 9, 3.5);
          }
          e.shootCd = rnd(1.8, 2.4);
        }

      } else if (e.type === 'germ' || e.type === 'minigerm') {
        // fuzzy bacteria: slow squelchy hops (floaty in the green spore clouds)
        const grounded = e.h <= 0 && e.vh <= 0;
        const mini = e.type === 'minigerm';
        e.theta = wrap(e.theta + (dirP * (mini ? 95 : 55) / R) * dt);
        e.dir = dirP;
        e.hopCd -= dt;
        if (grounded && e.hopCd <= 0) { e.vh = mini ? rnd(260, 360) : rnd(340, 500); e.hopCd = mini ? rnd(0.4, 0.9) : rnd(0.9, 1.7); }
        e.vh -= this.gAt(e.theta) * dt;
        e.h += e.vh * dt;
        if (e.h <= 0) { e.h = 0; if (e.vh < 0) e.vh = 0; }
        e.spr.sqx = 1 + Math.sin(e.t * 9) * 0.05; e.spr.sqy = 1 - Math.sin(e.t * 9) * 0.05;

      } else if (e.type === 'frog') {
        // rat-frog: crouches, then makes a big leap straight at Chris
        const grounded = e.h <= 0 && e.vh <= 0;
        if (grounded) {
          if (e.state === 'air') { e.state = 'idle'; e.cd = rnd(0.7, 1.3); e.leapV = 0; Sound.sfx('squeak'); this.cameras.main.shake(60, 0.003); }
          e.cd -= dt; e.dir = dirP;
          if (e.cd <= 0) { e.state = 'air'; e.vh = rnd(460, 560); e.leapV = dirP * rnd(190, 250); Sound.sfx('ribbit'); }
        }
        e.theta = wrap(e.theta + (e.leapV / R) * dt);
        e.vh -= this.gAt(e.theta) * dt;
        e.h += e.vh * dt;
        if (e.h <= 0) { e.h = 0; if (e.vh < 0) e.vh = 0; }
        const crouch = e.state === 'idle' && e.cd < 0.35;
        e.spr.sqx = crouch ? 1.14 : 1; e.spr.sqy = crouch ? 0.8 : 1 + Math.max(0, Math.min(0.15, e.vh / 3500));

      } else if (e.type === 'drone') {
        // cheese-slicing drone: hovers, flashes red, then dives at where Chris was
        if (e.state === 'hover') {
          const want = e.baseH + Math.sin(e.t * 2 + e.seed) * 14;
          e.h += (want - e.h) * Math.min(1, dt * 3);
          const hold = 110 + Math.sin(e.t * 0.6 + e.seed) * 50;
          e.theta = wrap(e.theta + ((distP > hold ? dirP : -dirP * 0.5) * 95 / R) * dt);
          e.dir = dirP;
          e.cd -= dt;
          if (e.cd <= 0) { e.state = 'tele'; e.cd = 0.55; e.tx = P.theta; e.ty = P.h + 20; e.spr.setTint(0xff6060); Sound.sfx('zing'); }
        } else if (e.state === 'tele') {
          e.cd -= dt;
          e.h += Math.sin(e.t * 60) * 0.6;
          if (e.cd <= 0) { e.state = 'dive'; e.spr.clearTint(); e.cd = 0.9; e.flipP = 0; }
        } else if (e.state === 'dive') {
          const dx = angDiff(e.tx, e.theta) * R, dy = e.ty - e.h, len = Math.hypot(dx, dy) || 1;
          e.theta = wrap(e.theta + ((dx / len) * 380 / R) * dt);
          e.h += (dy / len) * 380 * dt;
          e.dir = dx >= 0 ? 1 : -1;
          e.cd -= dt;
          if (len < 18 || e.cd <= 0 || e.h <= 4) { e.state = 'rise'; e.cd = 1; }
        } else {
          e.h += (e.baseH - e.h) * Math.min(1, dt * 2.2);
          e.cd -= dt;
          if (e.cd <= 0) { e.state = 'hover'; e.cd = rnd(1.8, 3); }
        }

      } else if (e.type === 'slicer') {
        // rolling saw-blade bot: fast, low, throws flat discs you have to jump
        const conv = this.def.conveyor || 0;
        e.theta = wrap(e.theta + ((dirP * 125 - conv) / R) * dt);
        e.dir = dirP;
        e.roll += ((dirP * 125 - conv) / 25) * dt;                   // rolls like a wheel (rotation follows the ground speed)
        e.flipCd -= dt;
        if (e.flipCd <= 0 && e.flipP === undefined) { e.flipP = 0; e.flipCd = rnd(4, 7); }   // the odd coin-flip spin
        e.shootCd -= dt;
        if (e.shootCd <= 0 && distP < 420 && distP > 90) {
          e.shootCd = rnd(2.2, 3.2);
          this.addEBullet('blade', e.theta + dirP * (24 / R), 14, dirP * 250, 0, 10, 2.2);
          Sound.sfx('zing');
        }

      } else if (e.type === 'boss') {
        // slow, heavy drifting: Chris (230 units/s) can run clean past it, turn round and shoot back
        const target = P.theta + Math.sin(e.t * 0.5) * 0.3;
        const maxV = e.hp < e.maxHp * 0.5 ? 0.3 : 0.24;          // radians per second (about 100-125 units/s)
        const step = Math.max(-maxV, Math.min(maxV, angDiff(target, e.theta) * 0.9));
        e.theta = wrap(e.theta + step * dt);
        e.h = 175 + Math.sin(e.t * 1.3) * 30;       // low enough to hit with a jump (shots fly straight)
        const phase2 = e.hp < e.maxHp * 0.5;

        if (phase2 && !e.healed) {          // halfway: a cheese wedge drops in to help
          e.healed = true;
          this.pickups.push({ kind: 'heal', theta: wrap(P.theta + 0.12), h: 320, vh: 0, life: 14, spr: this.add.image(0, 0, 'wedge').setDepth(6) });
        }
        e.rainCd -= dt;
        e.fanCd -= dt;
        e.sumCd -= dt;
        if (e.ai === 'croque') {
          if (e.rainCd <= 0) {          // hot ham rain
            e.rainCd = phase2 ? 0.5 : 0.8;
            this.addEBullet('ham', P.theta + rnd(-0.22, 0.22), 300, rnd(-40, 40), -300, 13, 2);
          }
          if (e.fanCd <= 0) {           // fan of toast crumbs
            e.fanCd = phase2 ? 3.4 : 5.2;
            Sound.sfx('fan');
            const n = phase2 ? 5 : 4;
            for (let k = 0; k < n; k++) {
              const a = (k - (n - 1) / 2) * 0.4;
              this.addEBullet('crumb', e.theta, e.h - 30, 210 * Math.sin(a), -210 * Math.cos(a), 7, 2.5);
            }
          }
        } else if (e.ai === 'baron') {
          if (e.rainCd <= 0) {          // slow spore globs drift down around Chris
            e.rainCd = phase2 ? 1.0 : 1.4;
            for (const k of [-1, 0, 1]) this.addEBullet('spore', P.theta + k * 0.15 + rnd(-0.04, 0.04), 300, rnd(-30, 30), -165, 12, 2.8);
            Sound.sfx('cube');
          }
          if (e.fanCd <= 0) {           // ring of spores
            e.fanCd = phase2 ? 4.2 : 5.6;
            Sound.sfx('fan');
            const n = phase2 ? 10 : 8;
            for (let k = 0; k < n; k++) { const a = (k / n) * TAU; this.addEBullet('spore', e.theta, e.h, 150 * Math.sin(a), 150 * Math.cos(a), 11, 2.2); }
          }
          if (phase2 && e.sumCd <= 0 && this.enemies.length < 5) {   // calls in germ pals
            e.sumCd = 7;
            for (const sd of [-1, 1]) { const c = this.makeEnemy('minigerm', wrap(e.theta + sd * 0.06), sd); c.h = e.h; c.vh = 120; this.enemies.push(c); }
          }
        } else if (e.ai === 'mandoline') {
          if (e.rainCd <= 0) {          // a slicing disc skimming the floor: jump it
            e.rainCd = phase2 ? 1.6 : 2.4;
            this.addEBullet('blade', e.theta, 14, dirP * (phase2 ? 320 : 270), 0, 11, 3);
            Sound.sfx('zing');
          }
          if (e.fanCd <= 0) {           // discs at different heights
            e.fanCd = phase2 ? 3 : 4.2;
            Sound.sfx('fan');
            for (const hh of (phase2 ? [14, 70, 125] : [14, 95])) this.addEBullet('blade', e.theta, hh, dirP * 250, 0, 11, 3);
          }
          if (e.sumCd <= 0 && this.enemies.length < 4) { e.sumCd = phase2 ? 7 : 10; this.spawnEnemy('drone'); }
        }
      }

      if (e.flashCd > 0) e.flashCd -= dt;
      if (e.flash > 0) { e.flash -= dt; if (e.flash <= 0) e.spr.clearTint(); }
      if (e.state === 'tele') e.spr.setTint(0xff6060);               // drone warning colour wins over the hit flash
      if (e.flipP !== undefined) {                                   // coin-flip spin around the vertical axis
        e.flipP += dt * TAU / 0.6;
        if (e.flipP >= TAU) { e.flipP = undefined; e.spr.sqx = 1; } else e.spr.sqx = Math.cos(e.flipP);
      }
      const idt = Math.max(dt, 1e-4);
      e.vx = angDiff(e.theta, pt) * R / idt;
      e.dh = (e.h - ph) / idt;

      // touching Chris
      // stomp: landing on an enemy's head hurts it and bounces Chris up (big ones need two, or one ground-pound)
      if (P.vh < -40 && e.hp > 0 && this.state === 'play') {
        const top = e.h + e.ch + e.r * 0.6;
        if (Math.abs(angDiff(P.theta, e.theta)) * (R + e.h) < e.r + 8 && P.h >= top - 18 && P.h <= top + 20) {
          const pound = P.diving && P.vh < -380;
          if (e.type === 'boss') e.hp -= pound ? 12 : 6;
          else if (e.big) { e.stomps = (e.stomps || 0) + 1; if (pound || e.stomps >= 2) e.hp = 0; else e.hp = Math.max(1, e.hp - 3); }
          else e.hp = 0;
          P.vh = pound ? 520 : 440; P.h = top + 1; P.jetArmed = false;
          P.invuln = Math.max(P.invuln, 0.2);
          e.flash = 0.12; e.flashCd = 0.15; e.spr.setTint(0xffffff);
          this.burst(e.theta, top, 'spark', pound ? 16 : 8, pound ? 1.3 : 0.8);
          this.cameras.main.shake(pound ? 140 : 70, pound ? 0.008 : 0.004);
          Sound.sfx('jump'); buzz(pound ? 40 : 18);
          if (e.hp > 0) this.banner(e.type === 'boss' ? 'BONK!' : 'ONE MORE!');
          this.addScore(50);
          continue;
        }
      }
      if (P.invuln <= 0 && dist2(e.theta, e.h + e.ch, P.theta, P.h + (P.duck ? 10 : 22)) < (e.r + (P.duck ? 9 : 12)) * (e.r + (P.duck ? 9 : 12))) {
        this.hurt();
        if (e.type === 'mouse' || e.type === 'flyer' || e.type === 'minigerm' || e.type === 'drone') e.hp = 0;     // small fry go out in a blaze
      }
    }
    this.reapEnemies();
  }

  reapEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.hp > 0) continue;
      this.addScore({ mouse: 100, flyer: 150, golem: 400, germ: 150, minigerm: 50, frog: 200, drone: 250, slicer: 200, boss: 5000 }[e.type] || 100);
      Sound.sfx(e.type === 'boss' ? 'boom' : 'kill');
      this.bang(e.theta, e.h + e.ch, e.type === 'boss' ? 90 : (e.big ? 30 : 14));
      if (e.type === 'boss') { this.cameras.main.flash(300, 255, 240, 180); buzz([80, 50, 80, 50, 220]); }
      else if (e.big) buzz(25);
      this.burst(e.theta, e.h + e.ch, e.type === 'boss' ? 'crumb' : 'spark', e.type === 'boss' ? 40 : 8, e.type === 'boss' ? 2 : 1);
      if (e.type === 'boss') { this.clearEBullets(); this.cameras.main.shake(300, 0.012); }
      if (e.type === 'germ') {          // bacteria split in two
        for (const sd of [-1, 1]) { const c = this.makeEnemy('minigerm', wrap(e.theta + sd * 0.03), sd); c.h = e.h + e.ch * 0.5; c.vh = 260; this.enemies.push(c); }
      }
      if (e.big && (!this.gotPower || Math.random() < 0.3)) {     // the first big enemy always drops a Power-Up
        this.gotPower = true;
        this.pickups.push({ kind: 'power', theta: e.theta, h: e.h + e.ch, vh: 220, life: 14, spr: this.add.image(0, 0, 'power').setDepth(6) });
      } else if (Math.random() < (e.drop || 0)) {
        this.pickups.push({ kind: 'heal', theta: e.theta, h: e.h + e.ch, vh: 150, life: 12, spr: this.add.image(0, 0, 'wedge').setDepth(6) });
      }
      e.spr.destroy();
      if (e.jet) e.jet.destroy();
      this.enemies.splice(i, 1);
    }
  }

  addEBullet(kind, theta, h, vt, vh, r, life) {
    this.eBullets.push({
      kind, theta: wrap(theta), h, vt, vh, r, life,
      spin: 0, spinV: kind === 'cube' ? rnd(-6, 6) : (kind === 'ham' ? rnd(-3, 3) : (kind === 'blade' ? 16 : 0)),
      spr: this.add.image(0, 0, kind).setDepth(8)
    });
  }

  clearEBullets() {
    for (const b of this.eBullets) b.spr.destroy();
    this.eBullets = [];
  }

  updatePlayerBullets(dt) {
    for (let i = this.pBullets.length - 1; i >= 0; i--) {
      const b = this.pBullets[i];
      b.age += dt;
      b.bt = wrap(b.bt + (b.vt / R) * dt);
      b.bh += b.vh * dt;
      const w = Math.sin(b.age * 38 + b.ph) * 5;      // slow corkscrew: pasta twisting out of the extruder
      b.theta = wrap(b.bt + (b.px * w) / R);
      b.h = b.bh + b.py * w;

      let dead = b.age > CFG.bulletLife || b.h < 0;
      if (!dead) {
        for (const e of this.enemies) {
          const rr = e.r + 8;
          if (dist2(b.theta, b.h, e.theta, e.h + e.ch) < rr * rr) {
            e.hp -= 1;
            Sound.sfx('hit');
            if (!(e.flashCd > 0)) { e.flash = 0.05; e.flashCd = 0.15; e.spr.setTint(0xffb4b4); }      // limited blink rate, not constant flicker
            dead = true;
            break;
          }
        }
      }
      if (dead) { b.spr.destroy(); this.pBullets.splice(i, 1); }
    }
    this.reapEnemies();
  }

  updateEnemyBullets(dt) {
    const P = this.pl;
    for (let i = this.eBullets.length - 1; i >= 0; i--) {
      const b = this.eBullets[i];
      b.theta = wrap(b.theta + (b.vt / R) * dt);
      b.h += b.vh * dt;
      b.life -= dt;
      b.spin += b.spinV * dt;
      let dead = b.life <= 0 || b.h < -2;
      if (!dead && P.invuln <= 0) {
        const rr = b.r + (P.duck ? 8 : 12);
        if (dist2(b.theta, b.h, P.theta, P.h + (P.duck ? 10 : 22)) < rr * rr) { this.hurt(); dead = true; }
      }
      if (dead) { b.spr.destroy(); this.eBullets.splice(i, 1); }
    }
  }

  updatePickups(dt) {
    const P = this.pl;
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      p.vh -= this.gAt(p.theta) * 0.6 * dt;
      p.h += p.vh * dt;
      if (p.h <= 0) { p.h = 0; p.vh = 0; }
      p.life -= dt;
      let dead = p.life <= 0;
      if (!dead && dist2(p.theta, p.h + 8, P.theta, P.h + 22) < 30 * 30) {
        if (p.kind === 'power') {
          P.power = 1; P.overheat = false; P.ammo = 1; this.addScore(500);
          Sound.sfx('power');
          buzz([20, 30, 20, 30, 60]);
          this.bang(P.theta, P.h + 24, 26);
          this.banner('PARMESAN POWER!');
        } else {
          if (P.hp < CFG.maxHp) { P.hp++; this.updateHearts(); }
          this.addScore(50);
          Sound.sfx('pickup');
          buzz(20);
        }
        this.burst(p.theta, p.h + 8, 'spark', 6, 0.6);
        dead = true;
      }
      if (dead) { p.spr.destroy(); this.pickups.splice(i, 1); }
    }
  }

  burst(theta, h, tex, n, spd) {
    for (let i = 0; i < n; i++) {
      this.parts.push({
        theta, h, vt: rnd(-160, 160) * spd, vh: rnd(60, 300) * spd, life: rnd(0.3, 0.6),
        spr: this.add.image(0, 0, tex).setDepth(9)
      });
    }
  }

  updateParticles(dt) {
    const gd = this.def.geysers, P = this.pl;
    for (const G of (this.geysers || [])) {
      const near = Math.abs(angDiff(G.theta, P.theta)) < 1.3;
      G.cd -= dt;
      if (G.st === 'idle' && G.cd <= 0) {
        if (this.state !== 'play') { G.cd = 1; continue; }
        G.st = 'warn'; G.cd = gd.warn;
        if (near) Sound.sfx('zing');
      } else if (G.st === 'warn') {
        G.emitT -= dt;
        if (near && G.emitT <= 0) { G.emitT = 0.12; this.parts.push({ theta: G.theta, h: 2, vt: rnd(-40, 40), vh: rnd(80, 160), life: 0.4, spr: this.add.image(0, 0, 'fondue').setDepth(2.7) }); }
        if (G.cd <= 0) { G.st = 'erupt'; G.cd = gd.erupt; if (near) { this.cameras.main.shake(160, 0.005); Sound.sfx('boom'); buzz(30); } }
      } else if (G.st === 'erupt') {
        G.emitT -= dt;
        if (near && G.emitT <= 0) {
          G.emitT = 0.035;
          this.parts.push({ theta: G.theta, h: 2, vt: rnd(-55, 55), vh: rnd(420, 640), life: rnd(0.9, 1.3), spr: (() => { const im = this.add.image(0, 0, 'fondue').setDepth(2.7); im.bsx = im.bsy = rnd(0.9, 1.7); return im; })() });
        }
        // standing in the column hurts
        if (P.invuln <= 0 && this.state === 'play' && Math.abs(angDiff(P.theta, G.theta)) * R < 20 && P.h < gd.height) this.hurt();
        if (G.cd <= 0) { G.st = 'idle'; G.cd = rnd(gd.idle[0], gd.idle[1]); }
      }
    }
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.theta = wrap(p.theta + (p.vt / R) * dt);
      p.vh -= 900 * dt;
      p.h += p.vh * dt;
      p.life -= dt;
      if (p.life <= 0 || p.h < 0) { p.spr.destroy(); this.parts.splice(i, 1); }
    }
  }

  // ----------------------------------------------------------------- render
  // Convert (theta, h) to screen space relative to the player and position a sprite.
  // level 3: the sharp scrolling blades and the safe platforms riding on them
  drawGrater(pg) {
    const z = this.zoom, cx = this.cx, cy = this.cy, P = this.pl, pf = this.def.platforms;
    const pol = (d, h) => { const r = (R + h) * z; return { x: cx + r * Math.sin(d), y: cy - r * Math.cos(d) }; };
    const vis = this.visHalf + 0.15, n = 126, step = TAU / n;
    const kmin = Math.floor((P.theta - vis + this.convPhase) / step), kmax = Math.ceil((P.theta + vis + this.convPhase) / step);
    for (let k = kmin; k <= kmax; k++) {
      const a = k * step - this.convPhase, d = angDiff(a, P.theta);
      if (this.onPlatform(wrap(a))) continue;
      const b1 = pol(d - step * 0.5, 0), b2 = pol(d + step * 0.5, 0), tip = pol(d, 11);
      pg.fillStyle(k % 2 ? 0xe3eaf4 : 0xaeb9ca, 1).fillTriangle(b1.x, b1.y, b2.x, b2.y, tip.x, tip.y);
    }
    for (let i = 0; i < pf.count; i++) {
      const c = wrap(i * TAU / pf.count - this.convPhase), d = angDiff(c, P.theta);
      if (Math.abs(d) > vis + pf.half) continue;
      const top = [], bot = [];
      for (let j = 0; j <= 8; j++) { const a = d - pf.half + (j / 8) * pf.half * 2; top.push(pol(a, 4)); bot.unshift(pol(a, -9)); }
      pg.fillStyle(0x8396b0, 1).fillPoints(top.concat(bot), true);
      pg.lineStyle(3, 0xffd23f, 1).strokePoints(top, false);
      const e1 = pol(d - pf.half, 4), e2 = pol(d + pf.half, 4), f1 = pol(d - pf.half, 14), f2 = pol(d + pf.half, 14);
      pg.lineStyle(3, 0xffd23f, 1).lineBetween(e1.x, e1.y, f1.x, f1.y).lineBetween(e2.x, e2.y, f2.x, f2.y);    // little end posts
    }
  }

  // screen position of a polar point (what place() does, for particle emitters)
  screenPos(theta, h) {
    const d = angDiff(theta, this.pl.theta), r = (R + h) * this.zoom;
    return { x: this.cx + r * Math.sin(d), y: this.cy - r * Math.cos(d), vis: Math.abs(d) < 1.45 };
  }

  bang(theta, h, n) {
    const s = this.screenPos(theta, h);
    if (s.vis) this.fxBang.emitParticleAt(s.x, s.y, n);
  }

  place(o, theta, h, extraRot) {
    const d = angDiff(theta, this.pl.theta);
    if (Math.abs(d) > 1.45) { o.setVisible(false); return; }   // far side of the planet
    const z = this.zoom, r = (R + h) * z;
    o.setVisible(true);
    o.setPosition(this.cx + r * Math.sin(d), this.cy - r * Math.cos(d));
    o.setRotation(d + (extraRot || 0));
    o.setScale((o.bsx || 1) * z * (o.sqx || 1), (o.bsy || 1) * z * (o.sqy || 1));
  }

  render(inp) {
    const P = this.pl;
    const { cx, cy } = this;

    const Rz = R * this.zoom;
    this.unw += angDiff(P.theta, this.lastTheta); this.lastTheta = P.theta;
    const r0 = Rz + 24, span = Math.max(100, this.maxStarR - r0);
    for (const b of this.bgStars) {
      const a = b.a - (this.unw + this.t * 0.03) * b.k, rr = r0 + b.r * span;     // drifts slowly even when standing still
      b.s.setPosition(cx + rr * Math.sin(a), cy - rr * Math.cos(a));
      if (b.tw !== undefined) b.s.setAlpha((b.ta || 1) * (0.55 + 0.45 * Math.sin(this.t * 3 + b.tw)));     // near stars twinkle
      if (b.rv) b.s.rotation += b.rv * (this.lastDt || 0.016);
      if (b.tws !== undefined) b.s.setScale(b.bsc * (0.75 + 0.3 * Math.sin(this.t * 2.2 + b.tws)));
      if (b.pulse !== undefined) b.s.setScale(b.bsc * (1 + 0.08 * Math.sin(this.t * 3 + b.pulse)));
    }
    if (this.abduct) {                                  // the rat UFO with Bessie: lives up in the world and keeps its distance
      const A = this.abduct, dtA = this.lastDt || 0.016, P = this.pl, z = this.zoom;
      A.a += ((this.state === 'play' && !this.nap ? 1 : 0) - A.a) * Math.min(1, dtA * 2);
      if (A.theta === undefined) { A.theta = wrap(P.theta + 0.4); A.tgt = A.theta; A.st = 'hover'; A.vt = 0; A.wt = 0; A.h = 215; }
      const off = angDiff(A.theta, P.theta);
      if (A.st !== 'flee' && Math.abs(off) < 0.14) {                     // Chris got too close: zip off to one side
        const away = Math.sign(off) || (P.facing || 1);
        A.fdir = Math.random() < 0.45 ? -away : away;                    // sometimes swoops over to the other side
        A.fd = rnd(0.45, 0.6); A.st = 'flee'; Sound.sfx('whoosh');
      } else if (A.st === 'hover' && Math.abs(off) > 0.8) {              // left far behind: drift back into view (slower than Chris runs)
        A.st = 'return'; A.tgt = wrap(P.theta + Math.sign(off) * 0.5);
      }
      if (A.st === 'hover') {                                            // idle wander
        A.wt -= dtA; if (A.wt <= 0) { A.wt = rnd(1.5, 3.5); A.tgt = wrap(A.theta + rnd(-0.08, 0.08)); A.th = rnd(190, 240); }
      }
      if (A.st === 'return') A.tgt = wrap(P.theta + Math.sign(angDiff(A.theta, P.theta) || 1) * 0.5);
      if (A.st === 'flee') A.tgt = wrap(P.theta + A.fdir * A.fd);          // keeps its distance while you chase
      const toT = angDiff(A.tgt, A.theta), maxV = A.st === 'flee' ? 1.3 : (A.st === 'return' ? 0.3 : 0.08);
      const want = Math.max(-maxV, Math.min(maxV, toT * (A.st === 'flee' ? 4 : 2)));
      A.vt += (want - A.vt) * Math.min(1, dtA * (A.st === 'flee' ? 5 : 2));
      A.theta = wrap(A.theta + A.vt * dtA);
      if (A.st !== 'hover' && Math.abs(toT) < 0.02) A.st = 'hover';
      A.h += ((A.th || 215) - A.h) * Math.min(1, dtA * 0.8);
      // project into the rotating view like everything else
      const d = angDiff(A.theta, P.theta), rr = (R + A.h + Math.sin(this.t * 1.3) * 6) * z;
      const sx = this.cx + rr * Math.sin(d), sy = this.cy - rr * Math.cos(d), tilt = d - A.vt * 0.35;
      const vis = Math.abs(d) < 1.45 ? A.a : 0;
      A.ship.setPosition(sx, sy).setScale(z * 0.9).setRotation(tilt + Math.sin(this.t * 1.1) * 0.05).setAlpha(vis);
      A.ft += dtA; if (A.ft > 0.09) { A.ft = 0; A.f = (A.f + 1) % 4; A.beam.setTexture('beam' + A.f); }
      A.beam.setPosition(sx - Math.sin(tilt) * 8 * z, sy + Math.cos(tilt) * 8 * z).setScale(2 * z).setRotation(tilt).setAlpha(A.st === 'flee' ? vis * 0.6 : vis);
      A.swing = (A.swing || 0) + (-A.vt * 0.9 - (A.swing || 0)) * Math.min(1, dtA * 3);        // Bessie lags behind when it moves
      const cd = (75 + Math.sin(this.t * 0.8) * 18) * z, ca = tilt + A.swing;
      A.cow.setPosition(sx - Math.sin(ca) * cd, sy + Math.cos(ca) * cd).setScale(z * 0.55).setRotation(this.t * 0.8).setAlpha(vis);
    }
    // the odd shooting star
    const dtS = this.lastDt || 0.016;
    this.shootCd -= dtS;
    if (!this.shoot && this.shootCd <= 0) {
      const x = rnd(0.1, 0.9) * this.W, y = rnd(0.02, 0.35) * this.H;
      this.shoot = { x, y, vx: rnd(380, 520) * (Math.random() < 0.5 ? 1 : -1), vy: rnd(120, 200), life: 0.55 };
    }
    this.shootG = this.shootG || this.add.graphics().setDepth(0.5);
    this.shootG.clear();
    if (this.shoot) {
      const s = this.shoot;
      s.x += s.vx * dtS; s.y += s.vy * dtS; s.life -= dtS;
      this.shootG.lineStyle(2, 0xffffff, Math.max(0, s.life * 1.8)).lineBetween(s.x, s.y, s.x - s.vx * 0.09, s.y - s.vy * 0.09);
      if (s.life <= 0) { this.shoot = null; this.shootCd = rnd(4, 9); }
    }

    const pg = this.planetG;
    pg.clear();
    const pc = this.def.planet;
    pg.fillStyle(pc.glow, 0.08).fillCircle(cx, cy, Rz + 30);
    pg.fillStyle(pc.glow, 0.14).fillCircle(cx, cy, Rz + 14);
    if (this.planetImg) {
      const ps = (2 * Rz) / this.planetImg.width;
      this.planetImg.setPosition(cx, cy).setScale(ps).setRotation(-this.unw);
      this.planetShade.setPosition(cx, cy).setScale(ps);
      this.rimG.clear().lineStyle(3, 0x1a1020, 1).strokeCircle(cx, cy, Rz + 1);
    } else {
      pg.fillStyle(pc.fill, 1).fillCircle(cx, cy, Rz);
      pg.fillStyle(pc.inner, 1).fillCircle(cx, cy, Rz - 70 * this.zoom);
      pg.lineStyle(5, pc.rim, 1).strokeCircle(cx, cy, Rz);
    }
    if (this.def.conveyor) this.drawGrater(pg);
    for (const zs of this.zoneSprs) { this.place(zs.spr, zs.theta, zs.h + Math.sin(this.t * 0.9 + zs.ph) * 12, 0); zs.spr.setAlpha(0.2 + 0.1 * Math.sin(this.t * 1.3 + zs.ph)); }

    for (const d of this.decor) this.place(d.spr, d.theta, d.h, 0);
    for (const G of this.geysers) {
      this.place(G.vent, G.theta, -3, 0);
      const k = G.st === 'warn' ? 0.4 + 0.4 * Math.abs(Math.sin(this.t * 14)) : (G.st === 'erupt' ? 1 : 0);
      G.glow.setAlpha(k);
      this.place(G.glow, G.theta, 6, 0);
      G.vent.sqx = G.st === 'warn' ? 1 + 0.08 * Math.sin(this.t * 40) : 1;
    }
    for (const L of this.lavas) {
      this.place(L.glow, L.theta, L.h + 4, 0); this.place(L.pool, L.theta, L.h, 0);
      L.glow.setAlpha(0.55 + 0.35 * Math.sin(this.t * 4 + L.ph));
      L.bt += (this.lastDt || 0.016) * 0.9;                                    // a bubble swells and pops, over and over
      if (L.bt >= 1) { L.bt = 0; L.bx = rnd(-0.02, 0.02) * (420 / R); }
      L.bub.sqx = L.bub.sqy = 0.3 + L.bt * 1.3;
      this.place(L.bub, L.theta + L.bx, L.h + 2 + L.bt * 5, 0);
      L.bub.setAlpha(L.bt < 0.9 ? 1 : (1 - L.bt) * 10);
    }
    for (const q of this.ledgeSprs) this.place(q.spr, q.L.theta, q.L.h - 1, 0);
    for (const q of this.props) this.place(q.spr, q.theta, q.h, q.sway >= 0 ? Math.sin(this.t * 1.6 + q.sway) * 0.07 : 0);

    this.place(P.spr, P.theta, P.h, 0);
    P.spr.setFlipX(P.facing < 0);
    P.spr.setAlpha(P.invuln > 0 && Math.floor(this.t * 20) % 2 ? 0.35 : 1);

    // sparkles: Chris while powered up, power-up pickups and Bessie's trail
    this.glintT = (this.glintT || 0) + (this.lastDt || 0.016);
    if (this.glintT > 0.05) {
      this.glintT = 0;
      if (P.power > 0) this.fxGlint.emitParticleAt(P.spr.x + rnd(-18, 18) * this.zoom, P.spr.y - rnd(4, 56) * this.zoom, 1);
      for (const p of this.pickups) if (p.kind === 'power') this.fxGlint.emitParticleAt(p.spr.x + rnd(-12, 12), p.spr.y + rnd(-12, 12), 1);
      const cows = this.nap ? [this.nap.cow] : (this.rescue && !this.rescue.landed ? [this.rescue.cow] : []);
      for (const c of cows) this.fxGlint.emitParticleAt(c.spr.x + rnd(-14, 14), c.spr.y + rnd(-6, 24), 2);
    }

    // spinning drill-bit on the end of the Mac-Grinder, like a mincer's auger: fast while firing, idle-slow otherwise
    P.firing = Math.max(0, (P.firing || 0) - (this.lastDt || 0.016));
    this.augerPhase += (this.lastDt || 0.016) * (P.firing > 0 ? 40 : 5);
    this.rig.update(P, this.lastDt || 0.016, P.spr.x, P.spr.y, this.zoom, P.spr.alpha, Math.floor(this.augerPhase) % 4);

    for (const e of this.enemies) {
      this.place(e.spr, e.theta, e.h, e.type === 'boss' ? Math.sin(e.t * 1.5) * 0.08 : (e.roll !== undefined ? e.roll : 0));
      if (e.type !== 'boss' && e.type !== 'slicer') e.spr.setFlipX(e.dir < 0);
      if (e.type === 'flyer') {                          // wobbly jet flame under the tank + a little exhaust stream
        if (!e.jet) e.jet = this.add.image(0, 0, 'ratjet0').setOrigin(0.5, 0).setDepth(4.9);
        const sc = Math.abs(e.spr.scaleX), fl = e.dir < 0 ? -1 : 1, r = e.spr.rotation;
        const ox = -8 * fl * sc, oy = 4.5 * sc;                       // tank bottom, relative to the sprite origin
        const jx = e.spr.x + ox * Math.cos(r) - oy * Math.sin(r), jy = e.spr.y + ox * Math.sin(r) + oy * Math.cos(r);
        e.jet.setTexture('ratjet' + (Math.floor(this.t * 18 + e.theta * 10) % 3)).setPosition(jx, jy)
          .setRotation(r + Math.sin(this.t * 23 + e.theta * 7) * 0.18).setScale(sc * 1.3 * (0.95 + Math.sin(this.t * 31) * 0.08), sc * 1.3 * (0.85 + Math.abs(Math.sin(this.t * 17 + e.theta)) * 0.35))
          .setVisible(e.spr.visible).setAlpha(e.spr.alpha);
        e.jetT = (e.jetT || 0) - (this.lastDt || 0.016);
        if (e.spr.visible && e.jetT <= 0) { e.jetT = 0.05; this.fxRatJet.emitParticleAt(jx - Math.sin(r) * 9 * sc, jy + Math.cos(r) * 9 * sc, 1); }
      }
    }
    for (const b of this.pBullets) this.place(b.spr, b.theta, b.h, Math.atan2(-b.vh, b.vt));
    for (const b of this.eBullets) this.place(b.spr, b.theta, b.h, b.spin);
    for (const p of this.pickups) this.place(p.spr, p.theta, p.h, 0);
    for (const a of this.actors) this.place(a.spr, a.theta, a.h, a.rot);
    for (const p of this.parts) { this.place(p.spr, p.theta, p.h, 0); p.spr.setAlpha(Math.min(1, p.life * 3)); }

    // controls
    const cg = this.ctrlG;
    cg.clear();
    for (const k in this.btnLabels) this.btnLabels[k].setVisible(this.touchUI);
    if (this.touchUI) for (const k in this.btn) {
      const b = this.btn[k];
      const on = inp[k];
      cg.fillStyle(0xffffff, on ? 0.38 : 0.14).fillCircle(b.x, b.y, b.r);
      cg.lineStyle(3, 0xffffff, on ? 0.9 : 0.45).strokeCircle(b.x, b.y, b.r);
    }

    // boss health bar
    const hg = this.hudG;
    hg.clear();
    const boss = this.enemies.find(e => e.type === 'boss');
    if (boss) {
      const w = this.landscape ? Math.min(this.W * 0.5, 420) : this.W - 40;
      const x0 = (this.W - w) / 2, y0 = this.landscape ? 42 : 62;
      const frac = Math.max(0, boss.hp / boss.maxHp);
      hg.fillStyle(0x000000, 0.5).fillRect(x0, y0, w, 10);
      hg.fillStyle(0xff8c1a, 1).fillRect(x0, y0, w * frac, 10);
      hg.lineStyle(2, 0xffffff, 0.8).strokeRect(x0, y0, w, 10);
    }

    // 16-bit HUD: framed portrait, JET bar, macaroni ammo icons, distance-to-cow track, rolling score
    const pix = (x, y, w, h, fill) => {                 // chunky framed box: dark outline, light bevel
      hg.fillStyle(0x1a1020, 1).fillRect(x - 2, y - 2, w + 4, h + 4);
      hg.fillStyle(0xc9cde0, 1).fillRect(x - 1, y - 1, w + 2, h + 2);
      hg.fillStyle(fill, 1).fillRect(x, y, w, h);
    };
    if (this.portrait) pix(10, 10, 48, 48, 0x2a1f5a);
    const flash = Math.floor(this.t * 8) % 2;
    const gx = 96, gy = 46, gw = 136, gh = 8;
    pix(gx, gy, gw, gh, 0x0c0a24);
    const fc = P.fuel > 0.3 ? 0x39c6ff : (flash ? 0xff5a3c : 0xa02a1a), nb = 17, bw = gw / nb;    // fills in chunky 8px blocks
    const litB = Math.ceil(P.fuel * nb - 0.05);
    for (let i = 0; i < litB; i++) { const x = Math.round(gx + i * bw); hg.fillStyle(fc, 1).fillRect(x + 1, gy + 1, Math.round(bw) - 2, gh - 2); hg.fillStyle(0xffffff, 0.55).fillRect(x + 1, gy + 1, Math.round(bw) - 2, 2); }
    const lit = Math.ceil(P.ammo * this.macIcons.length - 0.001);
    this.macIcons.forEach((m, i) => m.setTexture(P.power > 0 ? (flash ? 'hud_mac_gold' : 'hud_mac') : P.overheat ? (flash ? 'hud_mac_hot' : 'hud_mac_off') : (i < lit ? 'hud_mac' : 'hud_mac_off')));

    // distance to the cow = progress through the level (waves, then the boss)
    const D = this.hud, nW = this.waves.length;
    let prog = 0;
    if (this.state === 'rescue' || this.state === 'won') prog = 1;
    else if (this.waveIdx >= 0) {
      let frac = 1 - ((this.queue || []).length + this.enemies.filter(e => e.type !== 'boss').length) / this.waveTotal;
      if (boss) frac = 1 - Math.max(0, boss.hp / boss.maxHp);
      prog = Math.min(1, (this.waveIdx + Math.max(0, Math.min(1, frac))) / nW);
    }
    this.distProg = (this.distProg || 0) + (prog - (this.distProg || 0)) * Math.min(1, (this.lastDt || 0.016) * 3);
    const dw = D.dx1 - D.dx0, db = 6, dn = Math.floor(dw / db), dl = Math.floor(this.distProg * dn + 0.001);   // chunky 6px blocks
    pix(D.dx0, D.dy - 3, dn * db, 6, 0x0c0a24);
    for (let i = 0; i < dl; i++) hg.fillStyle(i % 2 ? 0xffb52a : 0xffd23f, 1).fillRect(D.dx0 + i * db, D.dy - 3, db - 1, 6);
    for (let i = 1; i < nW; i++) hg.fillStyle(0xffffff, 1).fillRect(D.dx0 + Math.round(dn * i / nW) * db - 1, D.dy - 5, 2, 10);
    if (this.chrisMark) this.chrisMark.setPosition(D.dx0 + dl * db, D.dy);
    this.cowIcon.setRotation(Math.sin(this.t * 2) * 0.15);

    this.scoreShown += Math.ceil((this.score - this.scoreShown) * Math.min(1, (this.lastDt || 0.016) * 8));
    if (this.scoreShown > this.score) this.scoreShown = this.score;
    this.scoreText.setText('SCORE: ' + String(this.scoreShown).padStart(7, '0'));
    P.spr.setTint(P.power > 0 ? 0xffe27a : 0xffffff);
  }
}

const startPhaser = () => { window.game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0b1020',
  pixelArt: true,                  // hard-edged pixels everywhere (16-bit look)
  // Fixed-ish logical height: the game is laid out at about phone height (~430px) on every screen and
  // then scaled up, so a big PC monitor shows the same framing as a phone instead of a tiny world.
  scale: { mode: Phaser.Scale.NONE, width: fitSize().w, height: fitSize().h, zoom: fitSize().k, fullscreenTarget: document.documentElement },
  input: { activePointers: 4 },
  scene: [IntroScene, SelectScene, Level1]
});
  // Phones report the new size late when going fullscreen / rotating, so check a few times after each
  // event and also poll: whenever the window size and the game size disagree, refit.
  const apply = () => {
    const f = fitSize(), sc = window.game.scale;
    if (Math.abs(sc.width - f.w) > 1 || Math.abs(sc.height - f.h) > 1 || Math.abs(sc.zoom - f.k) > 0.01) { sc.setZoom(f.k); sc.resize(f.w, f.h); }
  };
  const refit = () => [50, 200, 500, 1000].forEach(ms => setTimeout(apply, ms));
  window.addEventListener('resize', refit);
  window.addEventListener('orientationchange', refit);
  document.addEventListener('fullscreenchange', refit);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', refit);
  setInterval(apply, 400);
};
const DESIGN_H = 516;          // logical height on big screens (bigger = more zoomed out)
function fitSize() {
  const el = document.getElementById('game');
  const vw = (el && el.clientWidth) || window.innerWidth, vh = (el && el.clientHeight) || window.innerHeight;
  const k = Math.max(1, vh / DESIGN_H);
  return { k, w: Math.ceil(vw / k), h: Math.ceil(vh / k) };
}
// wait (briefly) for the pixel font so the first text isn't drawn in the fallback font
if (document.fonts && document.fonts.load) {
  Promise.race([document.fonts.load('12px "Press Start 2P"'), new Promise(res => setTimeout(res, 2500))]).then(startPhaser, startPhaser);
} else startPhaser();
