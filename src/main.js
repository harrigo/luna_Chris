// Luna Chris - Level 1: The Gruyere Globe
//
// Everything lives in polar coordinates around the planet centre:
//   theta = angle around the planet (radians), h = height above the surface.
// The "camera" rotates so the player is always at the top of the screen, which is
// what makes the planet feel spherical. Arcade physics is NOT used.

const BUILD = 'v0.95';
const verEl = document.getElementById('ver');
if (verEl) verEl.textContent = BUILD;

const TAU = Math.PI * 2;
let R = 420; // planet radius in world units (set per level from LEVELS[n].radius)

const CFG = {
  finalLevel: 9,          // Bessie only stays rescued after this level; before it the rats always snatch her back
  gravity: 1500,
  jumpV: 560,
  runSpeed: 230,
  maxHp: 5,
  startLives: 3,     // lives per game; GAME OVER when they run out
  maxLives: 9,
  lifeEvery: 40000,  // a bonus life for every this many points scored in a level
  jumpBuffer: 0.12,   // a jump pressed this long before landing still happens
  coyoteTime: 0.1,    // ...and you can still jump this long after running off an edge
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
  bashTime: 0.3,      // melee: whole move (120-degree butt swing, a beat at the hit, snap back)
  bashCd: 0.45,        // melee: time between bashes
  bashRange: 64,      // melee: reach in front of Chris
  bashDmg: 4,         // melee: one-shots small fry, two hits for the bigger ones
  ammoRestart: 0.3,   // after running dry the gun stays jammed until the gauge climbs back to this
  // Parmesan Power-Up (triple shot + unlimited pasta) lasts until Chris is hit: it soaks up that hit instead of a heart
  aimAssist: false, // true = shots home in on the nearest enemy; false = shots fly straight the way Chris faces
  autoFire: false   // true = guns fire by themselves whenever an enemy is on screen; false = hold the FIRE button
};

// ---- weapons. `unlock` = the level you must have reached to own it (the progression system).
// For now CFG.allWeapons = true unlocks everything on every level.
const WEAPONS = [
  { id: 'grinder', name: 'MAC-GRINDER 3000', short: 'MAC', gunTex: 'c_gun', tipTex: 'auger', shot: 'macaroni', unlock: 1,
    interval: 0.085, speed: 760, life: 0.75, ammo: 0.022, dmg: 1, wobble: 5, pierce: 0, sfxEvery: 2, sfx: 'shoot', pressure: true,
    blurb: 'A fast stream of wobbly macaroni. Spray and pray.', stats: { POWER: 2, RATE: 5, RANGE: 3, PIERCE: 1 } },
  { id: 'spinner', name: 'SPAGHETTI SPINNER', short: 'SPG', gunTex: 'c_gun2', tipTex: 'c_nozzle', shot: 'spaghetti', unlock: 2,
    beam: true, range: 250, reachMin: 0.4, droop: 46, drain: 0.45, tick: 0.1, dmg: 99, bossDmg: 2.5, sfx: 'shoot',   // a constant stream: ~2.2s per tank; anything it touches is taken out (boss: 25/s)
    blurb: 'A non-stop stream of spaghetti that hits everything in line. Burns through pasta fast.', stats: { POWER: 5, RATE: 5, RANGE: 4, PIERCE: 5 } },
  { id: 'swiss', name: 'SWISS-SHOT', short: 'SWS', gunTex: 'c_gun3', tipTex: 'c_bell', shot: 'swissball', unlock: 3,
    lob: true, aimed: true, plough: true, charge: true, chargeTime: 1.1, interval: 0.3, speed: 447, angle: 0.8, gravity: 420, life: 3, ammo: 0.12, dmg: 0, blast: 130, blastDmg: 20, bossDmg: 12, ballScale: 2.2, wobble: 0, pierce: 0, sfxEvery: 1, sfx: 'jump',
    blurb: 'HOLD to charge a ball of Swiss, RELEASE to lob it. Bigger charge = bigger ball, further, bigger blast.', stats: { POWER: 4, RATE: 1, RANGE: 4, PIERCE: 4 } }
];
CFG.allWeapons = true;
// graphics quality comes from Settings.gfx (menu.js): HIGH = glow + lights, MEDIUM = lights only, LOW = none (?lowfx forces LOW)
const glowFx = (obj, col, strength, dist) => { try { if (Settings.glow && obj && obj.preFX) return obj.preFX.addGlow(col, strength, 0, false, 0.1, dist || 8); } catch (e) { /* canvas renderer */ } return null; };
// Same look as glowFx for things that never change texture, but the halo is drawn once into a cached texture
// instead of costing a shader pass every frame (lava pools, enemy shots, swiss balls, power-ups...).
const glowKey = (base, col, strength, d) => base + '_g' + col.toString(16) + '_' + strength + '_' + d;
function makeGlowTexture(sc, base, col, strength, dist) {
  const d = Math.ceil(dist || 8), gk = glowKey(base, col, strength, d);
  if (!sc.textures.exists(gk)) {
    {
      const f = sc.textures.getFrame(base), w = f.cutWidth, h = f.cutHeight, W = w + d * 2, H = h + d * 2;    // works on atlas frames too
      const ct = sc.textures.createCanvas(gk, W, H), ctx = ct.getContext();
      ctx.drawImage(f.source.image, f.cutX, f.cutY, w, h, d, d, w, h);
      const img = ctx.getImageData(0, 0, W, H), D = img.data, N = W * H;
      let A = new Float32Array(N), B = new Float32Array(N);
      for (let i = 0; i < N; i++) A[i] = D[i * 4 + 3] / 255;
      const rad = Math.max(1, Math.round(d / 2));
      for (let pass = 0; pass < 2; pass++) {                         // two box-blur passes ~ a soft gaussian halo
        for (let y = 0; y < H; y++) { let acc = 0; for (let x = -rad; x < W + rad; x++) { if (x + rad < W) acc += A[y * W + x + rad]; if (x - rad - 1 >= 0) acc -= A[y * W + x - rad - 1]; if (x >= 0 && x < W) B[y * W + x] = acc / (rad * 2 + 1); } }
        for (let x = 0; x < W; x++) { let acc = 0; for (let y = -rad; y < H + rad; y++) { if (y + rad < H) acc += B[(y + rad) * W + x]; if (y - rad - 1 >= 0) acc -= B[(y - rad - 1) * W + x]; if (y >= 0 && y < H) A[y * W + x] = acc / (rad * 2 + 1); } }
      }
      const r = (col >> 16) & 255, g = (col >> 8) & 255, bl = col & 255, k = 0.75 * strength;
      for (let i = 0; i < N; i++) {
        const oa = D[i * 4 + 3] / 255, ga = Math.min(1, A[i] * k) * (1 - oa);
        const a = oa + ga; if (a <= 0) continue;
        D[i * 4] = (D[i * 4] * oa + r * ga) / a; D[i * 4 + 1] = (D[i * 4 + 1] * oa + g * ga) / a; D[i * 4 + 2] = (D[i * 4 + 2] * oa + bl * ga) / a; D[i * 4 + 3] = a * 255;
      }
      ctx.putImageData(img, 0, 0); ct.refresh();
    }
  }
  return gk;
}
const bakedGlow = (obj, col, strength, dist) => {
  try {
    if (!Settings.glow || !obj || !obj.scene || obj.__glowBase) return;
    const base = obj.texture.key, d = Math.ceil(dist || 8), gk = makeGlowTexture(obj.scene, base, col, strength, d);
    const dox = obj.displayOriginX, doy = obj.displayOriginY;
    obj.__glowBase = { key: base, dox, doy };
    obj.setTexture(gk); obj.setDisplayOrigin(dox + d, doy + d);
  } catch (e) { /* ignore */ }
};
const Progress = {           // remembered on the device: highest level beaten
  get best() { try { return +(localStorage.getItem('lc_best') || 0); } catch (e) { return 0; } },
  beat(n) { try { if (!(LEVELS[n] && LEVELS[n].secret) && n > this.best) localStorage.setItem('lc_best', String(n)); } catch (e) { /* ignore */ } },
  found(n) { try { if (n === 5.5 && localStorage.getItem('lc_found6') === '1') return true; return localStorage.getItem('lc_found' + n) === '1'; } catch (e) { return false; } },    // secret warp levels (5.5 was briefly numbered 6)
  find(n) { try { localStorage.setItem('lc_found' + n, '1'); } catch (e) { /* ignore */ } },
  // best rank per level (S A B C D) and which of its 3 golden cheese wheels have been found (bitmask)
  rank(n) { try { return localStorage.getItem('lc_rank_' + n) || ''; } catch (e) { return ''; } },
  setRank(n, r) { const o = 'SABCD'; try { const old = this.rank(n); if (!old || o.indexOf(r) < o.indexOf(old)) localStorage.setItem('lc_rank_' + n, r); } catch (e) { /* ignore */ } },
  wheels(n) { try { return +(localStorage.getItem('lc_wheels_' + n) || 0); } catch (e) { return 0; } },
  addWheel(n, i) { try { localStorage.setItem('lc_wheels_' + n, String(this.wheels(n) | (1 << i))); } catch (e) { /* ignore */ } },
  wheelCount(n) { const m = this.wheels(n); return (m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1); }
};
const weaponUnlocked = (w, levelId) => CFG.allWeapons || levelId >= w.unlock || Progress.best + 1 >= w.unlock;

// phone buzz (Android Chrome; ignored elsewhere)
const buzz = p => {           // phone vibration + controller rumble
  if (typeof Settings !== 'undefined' && !Settings.rumble) return;
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
    this.warped = !!(data && data.warped);                       // arrived through a warp hole
    this.direct = !!(data && data.direct);                       // arrived from the level-select screen
    this.levelId = (data && data.level) || 1;
    this.cp = (data && data.cp) || null;                         // checkpoint to resume from after dying: { wave, score }
    this.deaths = (data && data.deaths) || 0;                    // deaths this attempt (counts against the level rank)
    this.runT0 = (data && data.runT) || 0;                       // time already spent before the last death
    this.def = LEVELS[this.levelId];
    R = this.def.radius || 420;
    this.waves = this.def.waves.concat([{ name: 'BOSS FIGHT!', spawns: [{ type: 'boss', t: 1.5 }] }]);
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
    this.skyImg = null; this.abduct = null; this.beamG = null;
    { const cam = this.cameras.main, sh = cam.shake.bind(cam); cam.shake = (...a) => Settings.shake ? sh(...a) : cam; }   // SCREEN SHAKE setting
    this.hitStop = 0; this.slowT = 0; this.kick = { x: 0, y: 0, vx: 0, vy: 0 }; this.punch = 0; this.lights = []; this.lightPool = []; this.hazeT = 0;
    this.score = 0; this.scoreShown = 0; this.waveTotal = 1;
    this.bonusHeart = false; this.burgerIcon = null;      // the scene object is reused, so reset everything that survives restarts
    this.strands = []; this.strandT = 2; this.chaser = null; this.sweeps = []; this.sweepT = 3; this.rocks = []; this.rockT = 2; this.bossLaser = null; this.hazG = null;
    this.buffFx = null; this.giantK = 1; this.slowRect = null; this.buffIcon = null; this.stepT = 0;
    this.bashTipShown = false; this.chargeSpr = null; this.bashTrail = null; this.blastFx = []; this.puddles = []; this.blastG = null; this.puddleG = null;
    this.popups = []; this.popPool = []; this.combo = 0; this.comboT = 0; this.maxCombo = 0; this.comboText = null; this.vign = null; this.beatT = 0;
    this.hurtCount = 0; this.wheelsGot = []; this.wheels = []; this.bossCard = null; this.oneUp = null; this.ko = null; this.koStars = null; this.goCam = null; this.goReady = false; this.leavingGO = false;
    if (!(this.registry.get('lives') > 0)) this.registry.set('lives', CFG.startLives);   // a fresh game
    this.nextLife = (Math.floor(((this.cp && this.cp.score) || 0) / CFG.lifeEvery) + 1) * CFG.lifeEvery;
    this.gotPower = !!(this.cp && this.cp.power); this.shootG = null; this.jetOn = false; this.shotN = 0; this.glintT = 0; this.lastDt = 0.016;

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
      makeCosmicTextures(this);
      for (let i = 0; i < 5; i++) {                    // swirling nebulae (slowest)
        const s = this.add.image(0, 0, 'neb' + i).setDepth(0).setAlpha(0.9).setFlipX(i % 2 === 1);
        s.setScale(3);
        this.bgStars.push({ s, a: i * TAU / 5 + rnd(-0.3, 0.3), r: rnd(0.35, 0.95), k: rnd(0.035, 0.06), rv: rnd(0.01, 0.03) * (i % 2 ? 1 : -1) });
      }
      for (let i = 0; i < 4; i++) {                    // pixel spiral galaxies
        const s = this.add.image(0, 0, 'gal' + i).setDepth(0).setScale(i < 2 ? 3 : 2).setRotation(rnd(-0.5, 0.5));
        this.bgStars.push({ s, a: i * TAU / 4 + 0.7, r: rnd(0.3, 0.9), k: rnd(0.06, 0.09), rv: 0.05 * (i % 2 ? 1 : -1) });
      }
      for (let i = 0; i < 6; i++) {                    // glowing star clusters
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
      const deb = ['db_rock', 'db_rock', 'db_sat', 'db_bolt', 'db_rock', 'db_sat'];   // (no cheese chunks: they looked like the heart pickups)
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
      glowFx(this.abduct.beam, 0xffd23f, 3, 10); bakedGlow(this.abduct.ship, 0x9fd8ff, 1, 6);
    }
    if (this.def.nebula) {                              // big swirling pixel nebulae + four-point sparkle stars (level 2: turquoise)
      const NB = this.def.nebula;
      for (let i = 0; i < NB.n; i++) {
        const key = 'neb' + this.levelId + '_' + i; if (!this.textures.exists(key)) makeNebula(this, key, 900 + i * 41, NB.pal);
        const s = this.add.image(0, 0, key).setDepth(0).setAlpha(0.8).setScale(rnd(4.5, 5.5)).setFlipX(i % 2 === 1).setRotation(rnd(-0.6, 0.6));
        this.bgStars.push({ s, a: i * TAU / NB.n + rnd(-0.4, 0.4), r: rnd(0.12, 0.4), k: rnd(0.035, 0.06), rv: rnd(0.008, 0.02) * (i % 2 ? 1 : -1) });
      }
      for (let i = 0; i < 26; i++) {
        const near = i < 8, s = this.add.image(0, 0, 'px_star').setDepth(0).setTint(NB.sparkles[i % NB.sparkles.length]).setScale(near ? 3 : 2);
        this.bgStars.push({ s, a: rnd(0, TAU), r: rnd(0.05, 1), k: near ? rnd(0.6, 0.85) : rnd(0.3, 0.5), tws: rnd(0, 6), bsc: s.scale });
      }
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
      makePlanetTexture(this, key, R, this.def.surface.pal, this.def.surface.seed, this.def.surface);
      makePlanetShade(this, 'shade' + this.levelId, R, this.def.surface.rimLight, this.def.surface.dark);
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
      this.lavas.push({ theta, h: -rnd(22, 190), pool, glow, bub, bt: rnd(0, 1), bx: 0, ph: rnd(0, 6) });
      bakedGlow(pool, 0xff7a1a, 3, 6);   // set into the planet at random depths
    }

    // fondue geysers (level 1): idle -> warn (vent glows, bubbles, rumble) -> erupt (column of molten cheese that hurts)
    this.geysers = [];
    const gd = this.def.geysers;
    if (gd) for (let i = 0; i < gd.n; i++) {
      const theta = wrap(0.45 + i * (TAU - 0.9) / gd.n + rnd(0, 0.15));          // none right where Chris starts
      const glow = this.add.image(0, 0, 'lava_glow').setDepth(2.5).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
      const vent = this.add.image(0, 0, 'geyser_vent').setOrigin(0.5, 0.75).setDepth(2.6);
      glow.bsx = 1.3; glow.bsy = 2;
      this.geysers.push({ theta, glow, vent, st: 'idle', cd: rnd(1.5, gd.idle[1]), emitT: 0, fx: glowFx(vent, 0xff9a2a, 1, 10) });
    }

    // ledges you can hop onto, plus scenery props standing on the surface (some behind Chris, some in front)
    // L2: green quicksand goop pools (drawn IN FRONT of Chris, so he visibly sinks into them)
    this.goops = (this.def.goop || []).map(g => {
      const spr = this.add.image(0, 0, 'goop').setOrigin(0.5, 0.12).setDepth(7.6);   // surface sits flush with the ground
      let halo = null;
      if (Settings.lights) { halo = this.add.image(0, 0, 'halo').setDepth(2.4).setTint(0xb05aff).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.35); halo.bsx = (2 * g.half * R) / 128 * 1.6; halo.bsy = 0.7; }
      spr.bsx = (2 * g.half * R) / 64 * 1.1; spr.bsy = 1.7;
      return Object.assign({}, g, { spr, halo, bubT: rnd(0, 1) });
    });
    this.goopTip = false; this.slimeTip = false; this.frogNextLash = 0; this.frogLow = false; this.tongueG = null;
    this.ledgeSprs = [];
    makePlatformTextures(this); makeRoadmapTextures(this); makePowerupTextures(this);
    (this.def.ledges || []).forEach((L, i) => {
      const types = this.def.ledgeTypes, type = L.type || (types ? types[i % types.length] : null), T = type && PLATFORMS[type];
      if (!T) {                                                      // old-style slab (fallback)
        const spr = this.add.image(0, 0, this.def.ledgeTex || 'ledge1').setOrigin(0.5, 0.1).setDepth(3);
        spr.bsx = (L.half * 2 * R) / 72; spr.bsy = 1;
        this.ledgeSprs.push({ spr, L, extras: [] }); return;
      }
      const tex = this.textures.get(T.key).getSourceImage ? this.textures.getFrame(T.key) : null, th = tex ? tex.cutHeight : 30;
      const spr = this.add.image(0, 0, T.key).setOrigin(0.5, T.top / th).setDepth(3);
      spr.bsx = spr.bsy = (L.half * 2 * R) / 124;                    // scaled evenly to the ledge's width
      const q = { spr, L, type, extras: [], t: rnd(0, 6), f: 0, ft: 0 };
      const ex = (key, dx, dy, depth, add) => { const im = this.add.image(0, 0, key).setDepth(depth); if (add) im.setBlendMode(Phaser.BlendModes.ADD); q.extras.push({ im, dx, dy }); return im; };
      if (type === 'energy') { q.glow = ex('puff', 0, 5, 2.95, true).setTint(0x5ce1ff); q.glow.bsx = 2.4; q.glow.bsy = 0.5; }
      if (type === 'girder') { ex('pl_siren', 26, -5, 3.05); q.beacon = ex('puff', 26, -6, 3.06, true).setTint(0xff3030); q.beacon.bsx = q.beacon.bsy = 0.5; }
      if (type === 'crystal') { q.sparks = [ex('spark', -56, -8, 3.06, true), ex('spark', 56, -8, 3.06, true), ex('spark', -48, -12, 3.06, true)]; q.glow = ex('puff', 0, 6, 2.95, true).setTint(0xb060f0); q.glow.bsx = 2.2; q.glow.bsy = 0.7; }
      if (type === 'panini') { q.glow = ex('puff', 0, 4, 2.95, true).setTint(0xffb040); q.glow.bsx = 2.2; q.glow.bsy = 0.45; q.dripT = rnd(0.2, 1); }
      this.ledgeSprs.push(q);
    });
    this.props = [];
    for (const pr of (this.def.props || [])) {
      for (let i = 0; i < (pr.at ? pr.at.length : pr.n); i++) {
        const spot = pr.at ? pr.at[i] : null;                         // hand-placed: [theta, scale, flipX]
        const spr = this.add.image(0, 0, pr.tex).setOrigin(0.5, 1).setDepth(pr.depth || (pr.fg ? 8.2 : 2.5));
        if (pr.tint) spr.setTint(pr.tint);
        if (pr.alpha) spr.setAlpha(pr.alpha);
        spr.bsx = spr.bsy = (spot ? spot[1] : rnd(pr.sc[0], pr.sc[1])) * 1.35;
        if (spot ? spot[2] : Math.random() < 0.5) spr.setFlipX(true);
        let halo = null;
        if (pr.glow && Settings.lights) {                // a soft pulsing glow behind it (bioluminescent mushrooms, crystals)
          halo = this.add.image(0, 0, 'halo').setDepth((pr.depth || (pr.fg ? 8.2 : 2.5)) - 0.01).setTint(pr.glow).setBlendMode(Phaser.BlendModes.ADD);
          halo.bsx = halo.bsy = spr.bsx * (spr.width / 128) * 2.6; halo.baseA = pr.glowA || 0.75;
        }
        this.props.push({ spr, halo, theta: spot ? spot[0] : wrap((i + rnd(0.1, 0.9)) * TAU / pr.n), h: pr.h !== undefined ? pr.h : (pr.fg ? -4 : -2), sway: pr.sway ? rnd(0, 6) : -1, ph: rnd(0, 6) });
      }
    }

    // level hazards: gravity spore clouds (level 2) and the moving grater floor (level 3)
    this.zoneSprs = [];
    // SECRET WARP: a dull black hole in the sky + floating junk to smash (see LEVELS[n].warp)
    this.warp = null; this.relics = []; this.warpK = 1;
    const wd = this.def.warp;
    if (wd) {
      makeWarpTextures(this);
      const glow = this.add.image(0, 0, 'puff').setDepth(0.29).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setTint(0xa040ff);
      const hole = this.add.image(0, 0, 'px_bhole').setDepth(0.3).setTint(0x6a6268).setAlpha(0.6);
      this.warp = { def: wd, theta: wd.theta, h: wd.h, hole, glow, stage: 0, size: 0.8, tgt: 0.8, pulse: 0, spin: 0, open: false, entering: false, t: 0 };
      for (const r of wd.relics) {
        const spr = this.add.image(0, 0, 'w_relic').setDepth(2.9);
        const light = this.add.image(0, 0, 'spark').setDepth(2.95).setBlendMode(Phaser.BlendModes.ADD).setTint(0xff3030);
        this.relics.push({ theta: r.theta, h: r.h, hp: 6, r: 16, spr, light, ph: rnd(0, 6), flash: 0 });
      }
    }

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
    this.rig = new ChrisRig(this);
    { let wi = 0; try { wi = +(localStorage.getItem('lc_weapon') || 0); } catch (e) { /* ignore */ }
      if (!WEAPONS[wi] || !weaponUnlocked(WEAPONS[wi], this.levelId)) wi = 0;
      this.weaponIdx = wi; this.weapon = WEAPONS[wi]; this.rig.setWeapon(this.weapon); }        // the animated chef-astronaut (src/chris.js); P.spr below is just an invisible anchor
    this.pl = {
      theta: 0, h: 0, vh: 0, vx: 0, facing: 1,
      hp: CFG.maxHp, invuln: 0, fireCd: 0, ammo: 1, ammoHold: 0, overheat: false, bashT: 0, bashCd: 0, bashA: 0, bashX: 0, bashY: 0, bashSpin: 0, bashLean: 0, charge: 0, charging: false, beamReach: 1, power: 0, fuel: 1, jetArmed: false, thrusting: false,
      spr: this.add.image(0, 0, 'blank').setOrigin(0.5, 1).setDepth(7)
    };

    // particle emitters (screen space; positions come from screenPos())
    this.fxJet = this.add.particles(0, 0, 'flame', { lifespan: { min: 160, max: 340 }, speedY: { min: 140, max: 280 }, speedX: { min: -45, max: 45 }, scale: { start: 1.4, end: 0 }, alpha: { start: 0.95, end: 0 }, blendMode: 'ADD', emitting: false }).setDepth(6);
    this.fxBang = this.add.particles(0, 0, 'spark', { lifespan: { min: 300, max: 750 }, speed: { min: 60, max: 300 }, angle: { min: 0, max: 360 }, scale: { start: 1.5, end: 0 }, alpha: { start: 1, end: 0 }, gravityY: 260, color: [0xfff3a0, 0xff9a2a, 0x8a2a10], colorEase: 'quad.out', blendMode: 'ADD', emitting: false }).setDepth(9);
    this.fxHaze = this.add.particles(0, 0, 'blob', { lifespan: { min: 1100, max: 1700 }, speedY: { min: -40, max: -18 }, speedX: { min: -10, max: 10 }, scale: { start: 0.15, end: 0.55 }, alpha: { start: 0.18, end: 0 }, tint: [0xff9a2a, 0xffc04a], blendMode: 'ADD', emitting: false }).setDepth(2.9);
    this.fxNoodle = this.add.particles(0, 0, 'spark', { lifespan: { min: 300, max: 650 }, speedX: { min: -30, max: 30 }, speedY: { min: 10, max: 60 }, gravityY: 500, scale: { start: 1.3, end: 0.4 }, tint: [0xffd23f, 0xffb52a, 0xffe27a], emitting: false }).setDepth(8);
    this.fxRatJet = this.add.particles(0, 0, 'flame', { lifespan: { min: 220, max: 420 }, speedY: { min: 30, max: 80 }, speedX: { min: -14, max: 14 }, scale: { start: 0.8, end: 0 }, alpha: { start: 0.8, end: 0 }, blendMode: 'ADD', emitting: false }).setDepth(4.8);
    this.fxGlint = this.add.particles(0, 0, 'spark', { lifespan: { min: 350, max: 700 }, speed: { min: 5, max: 40 }, scale: { start: 1.2, end: 0 }, alpha: { start: 1, end: 0 }, tint: 0xfff3a0, blendMode: 'ADD', emitting: false }).setDepth(9);
    this.buildHud();
    this.buildControls();
    this.buildOverlay();

    this.keys = this.input.keyboard
      ? this.input.keyboard.addKeys({ left: 'LEFT', right: 'RIGHT', a: 'A', d: 'D', up: 'UP', w: 'W', space: 'SPACE', z: 'Z', x: 'X', down: 'DOWN', s: 'S', f: 'F', v: 'V' })
      : null;

    if (this.wantFs === undefined) this.wantFs = false;
    this.coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

    // on-screen buttons only on touch devices (a PC uses keyboard / controller); they appear if a touch ever happens
    this.touchUI = (navigator.maxTouchPoints || 0) > 0 || ('ontouchstart' in window);
    if (this.input.keyboard) ['Q', 'C'].forEach(k => this.input.keyboard.on('keydown-' + k, () => { if (!this.paused && (this.state === 'play' || this.state === 'rescue')) this.switchWeapon(1); }));
    if (this.input.keyboard) ['P', 'ESC'].forEach(k => this.input.keyboard.on('keydown-' + k, () => { if (this.state === 'play' || this.state === 'rescue' || this.paused) this.togglePause(); }));
    this.input.on('pointerdown', p => {
      if (p.wasTouch) this.touchUI = true;
      if (this.paused) return;                          // taps go to the pause menu
      if (p.x > this.W - 74 && p.y > 86 && p.y < 118 && (this.state === 'play' || this.state === 'rescue')) { this.togglePause(); return; }   // PAUSE button
      if (p.x >= 232 && p.x <= 300 && p.y >= 36 && p.y <= 86 && (this.state === 'play' || this.state === 'rescue')) { this.switchWeapon(1); return; }   // tap the weapon box to swap
      if (p.x > this.W - 74 && p.y > 50 && p.y < 84) { this.scene.start('select'); return; }   // MENU button
      if (this.state === 'intro' || this.state === 'dead' || this.state === 'won') this.wantFs = true;
      if (this.state === 'intro') this.startGame();
      else if (this.state === 'dead' && this.t - this.endT > 0.5) this.retry();
      else if (this.state === 'won' && this.t - this.endT > 0.8) this.scene.start('select');
      else if (this.state === 'gameover' && this.goReady) this.leaveGameOver();
    });
    // controller: A/Start = start / retry / continue, View (back) = level menu
    const padOff = Pad.on(b => {
      if (b === 'back') { this.scene.start('select'); return; }
      if (b === 'start' && (this.state === 'play' || this.state === 'rescue' || this.paused)) { this.togglePause(); return; }
      if (this.paused) return;                          // the pause menu handles its own buttons
      if (b === 'y' && (this.state === 'play' || this.state === 'rescue')) { this.switchWeapon(1); return; }
      if (b !== 'a' && b !== 'start') return;
      if (this.state === 'intro') this.startGame();
      else if (this.state === 'dead' && this.t - this.endT > 0.5) this.retry();
      else if (this.state === 'won' && this.t - this.endT > 0.8) this.scene.start('select');
      else if (this.state === 'gameover' && this.goReady) this.leaveGameOver();
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
    this.input.on('pointerup', p => {
      if (this.wantFs) { this.wantFs = false; this.enterFullscreen(); }
      // touch: a quick tap on the left (MOVE) side = jump
      if (p.wasTouch && this.state === 'play' && !this.paused && p.downX < this.W * 0.45 && p.downY >= this.H * 0.28
        && p.upTime - p.downTime < 230 && Math.hypot(p.upX - p.downX, p.upY - p.downY) < 16) this.tapJumpT = 0.2;   // held ~0.2s = a full-height hop
    });
    // PC: mouse aims, left click fires, right click bashes, wheel swaps (switches on as soon as a real mouse moves)
    this.mouseAim = false; this.tapJumpT = 0; this.wheelCd = 0;
    if (this.input.mouse) this.input.mouse.disableContextMenu();
    this.input.on('pointermove', p => { if (!p.wasTouch && p === this.input.manager.mousePointer) this.mouseAim = true; });
    this.input.on('pointerdown', p => {
      if (p.wasTouch) this.mouseAim = false;
      const Bb = this.btn && this.btn.bash;                // touch BASH button reacts on the press, so even a flick of a tap counts
      if (p.wasTouch && Bb && this.touchUI && Math.hypot(p.x - Bb.x, p.y - Bb.y) < Bb.r * 1.05) this.bashReq = true;
    });
    this.input.on('wheel', (p, objs, dx, dy) => {
      if (this.state !== 'play' || this.paused || this.time.now < this.wheelCd || !dy) return;
      this.wheelCd = this.time.now + 160; this.switchWeapon(dy > 0 ? 1 : -1);
    });
    this.events.once('shutdown', () => { if (this.game.canvas) this.game.canvas.style.cursor = ''; });

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
        this.def.name + '\n\n' + (this.touchUI
          ? 'LEFT: drag to run, tap or push up to jump,\nhold up to fly   RIGHT: drag to aim + fire   BASH button'
          : (Pad.state.connected
            ? 'L-stick run  R-stick aim + fire  A jump (hold = jet)\nRT fire (pressure!)  B bash  LT jetpack  Y swap'
            : 'WASD / arrows run   SPACE jump (hold = jet)\nMOUSE aim  CLICK fire  RIGHT-CLICK bash  WHEEL swap')) +
          '\nOut of pasta? BASH them!\n\nTap to start'
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

    // touch layout: floating MOVE stick (left side), floating AIM+FIRE stick (right side), JUMP button up the right edge
    this.btn = {
      move: { x: 92, y: H - 86, r: 52 },
      aim:  { x: W - 170, y: H - 86, r: 52 },
      bash: { x: W - 48, y: Math.max(H * 0.36, H - 215), r: 32 }      // up the right edge, clear of where the thumb lands to aim
    };
    this.btnLabels.move.setPosition(this.btn.move.x, this.btn.move.y + 64);
    this.btnLabels.aim.setPosition(this.btn.aim.x, this.btn.aim.y + 64);
    this.btnLabels.bash.setPosition(this.btn.bash.x, this.btn.bash.y);

    this.waveText.setPosition(W / 2, 4);
    this.scoreText.setPosition(W / 2, 26);
    if (this.portrait) this.portrait.setPosition(10, 10);
    this.livesText.setPosition(60, 60);
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
    this.zoneText.setPosition(W / 2, 52);
    this.fpsText.setPosition(10, 66);
    this.cheatText.setPosition(10, 76);
    this.weaponIcon.setPosition(266, 56);
    this.swapText.setPosition(266, 72);
    if (this.weapon) { this.weaponIcon.setTexture(this.weapon.gunTex); this.macText.setText(this.weapon.short); }
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
    this.weaponIcon = this.add.image(0, 0, 'c_gun').setOrigin(0.5).setScale(1).setDepth(20.6);
    this.swapText = this.add.text(0, 0, 'SWAP', f(8, '#9fa6c2', ink)).setOrigin(0.5, 0).setDepth(20);
    this.cheatText = this.add.text(0, 0, 'CHEAT', f(8, '#ff4d8d', ink)).setDepth(20).setVisible(Cheat.on);
    this.livesText = this.add.text(0, 0, '', f(10, '#ffffff', { stroke: '#1a1020', strokeThickness: 4 })).setOrigin(1, 1).setDepth(20.7);
    this.cowIcon = this.add.image(0, 0, 'bessie').setScale(0.36).setDepth(20.5);
    this.chrisMark = this.textures.exists('portrait') ? this.add.image(0, 0, 'portrait').setScale(0.5).setDepth(20.6) : null;
    this.menuText = this.add.text(0, 0, 'MENU', f(8, '#9fa6c2')).setOrigin(1, 0).setDepth(20);
    this.pauseBtnText = this.add.text(0, 0, 'PAUSE', f(8, '#9fa6c2')).setOrigin(1, 0).setDepth(20);
    this.zoneText = this.add.text(0, 0, '', f(9, '#9bff6a', { stroke: '#1a1020', strokeThickness: 3 })).setOrigin(0.5, 0).setDepth(20);
    this.bannerText = this.add.text(0, 0, '', f(17, '#ffd23f', { align: 'center', stroke: '#1a1020', strokeThickness: 4, lineSpacing: 8 })).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.hudG = this.add.graphics().setDepth(20);
  }

  buildControls() {
    this.ctrlG = this.add.graphics().setDepth(20);
    const labels = { move: 'MOVE  (TAP/UP = JUMP)', aim: 'AIM+FIRE', bash: 'BASH' };
    this.btnLabels = {};
    for (const k in labels) {
      this.btnLabels[k] = this.add.text(0, 0, labels[k], { fontFamily: PIXEL, fontSize: '8px', color: '#ffffff', align: 'center', lineSpacing: 6 }).setOrigin(0.5).setDepth(21).setAlpha(0.7);
    }
    this.sticks = { move: null, aim: null };          // live twin-stick state (touch)
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

  addScore(n) {
    this.score += n;
    if (this.score >= this.nextLife && this.state === 'play') { this.nextLife += CFG.lifeEvery; this.gainLife(); }
  }

  get lives() { return this.registry.get('lives') || 0; }
  gainLife() {
    this.registry.set('lives', Math.min(CFG.maxLives, this.lives + 1));
    Sound.sfx('power'); buzz([20, 30, 20, 30, 60]); this.banner('1UP!');
    this.popup(this.pl.theta, this.pl.h + 70, '1UP', '#7dff8a', true);
    this.tweens.add({ targets: this.livesText, scale: 1.8, yoyo: true, duration: 160 });
  }

  // one 1UP floats somewhere in every level (high up, so it takes the jetpack). Once taken it stays taken until GAME OVER.
  placeOneUp() {
    if (this.oneUp) { this.oneUp.spr.destroy(); this.oneUp = null; }
    if (this.registry.get('oneup_' + this.levelId)) return;
    const ledges = (this.def.ledges || []).slice().sort((a, b) => b.h - a.h), L = ledges[1] || ledges[0];
    const theta = L ? L.theta : wrap(this.pl.theta - 1.6), h = L ? L.h + 70 : 220;
    const spr = this.add.image(0, 0, 'oneup').setDepth(6); bakedGlow(spr, 0x7dff8a, 3, 8);
    this.oneUp = { theta, h, spr };
  }
  updateOneUp() {
    const U = this.oneUp, P = this.pl; if (!U) return;
    const bob = Math.sin(this.t * 3) * 5;
    this.place(U.spr, U.theta, U.h + bob, Math.sin(this.t * 2) * 0.15);
    if (this.state === 'play' && dist2(U.theta, U.h + bob, P.theta, P.h + 22) < 30 * 30) {
      this.registry.set('oneup_' + this.levelId, true);
      this.burst(U.theta, U.h, 'spark', 14, 1); this.bang(U.theta, U.h, 20);
      U.spr.destroy(); this.oneUp = null; this.gainLife();
    }
  }

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
    this.placeWheels(); this.placeOneUp();
    this.state = 'play';
    Sound.init();
    this.waveText.setText('LEVEL ' + this.levelId);
    if (this.warped) { this.warped = false; Sound.music('stinger', this.def.music); this.nextWave(); this.banner('WARP ZONE!\n' + this.def.name.toUpperCase()); this.cameras.main.fadeIn(600, 255, 255, 255); return; }
    if (this.autostart) {                                    // retry: no cutscene, straight back in (from the checkpoint if one was reached)
      Sound.music(this.def.music);
      if (this.cp) { this.waveIdx = this.cp.wave - 1; this.score = this.scoreShown = this.cp.score; this.resumed = true; }
      this.nextWave(); this.resumed = false;
      if (this.cp) this.banner('CHECKPOINT\n' + this.waves[this.waveIdx].name);
      return;
    }
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
    if (this.levelId < CFG.finalLevel) {            // Bessie is never really safe until the last level: the rats swoop back in
      if (!r.snatch && t > 5.2) this.startSnatch();
      if (r.snatch) { if (this.updateSnatch(dt)) { this.rescue = null; this.finishWin(); } return; }
    }
    if (t > 7.4) {
      r.cow.spr.destroy(); this.actors.splice(this.actors.indexOf(r.cow), 1);
      if (r.burger && !r.got) { r.burger.spr.destroy(); this.actors.splice(this.actors.indexOf(r.burger), 1); }
      this.rescue = null;
      this.finishWin();
    }
  }

  // ...and just when you think she's safe: a rat-ship drops out of the sky, beams Bessie up and legs it.
  startSnatch() {
    const r = this.rescue;
    const ship = { spr: this.add.image(0, 0, 'ratship').setDepth(7), theta: r.cow.theta, h: 720, rot: 0 };
    const beam = this.add.image(0, 0, 'beam0').setOrigin(0.5, 0).setDepth(5.9).setAlpha(0);
    glowFx(beam, 0xffd23f, 3, 10); bakedGlow(ship.spr, 0x9fd8ff, 1, 6);
    this.actors.push(ship);
    r.snatch = { ship, beam, t: 0, f: 0, ft: 0, grabbed: false };
    const lines = ['WAIT... WHAT\'S THAT NOISE?', 'OH NO. NOT AGAIN...', 'IS THAT... ANOTHER SHIP?!', 'SQUEAK SQUEAK SQUEAK!'];
    this.banner(lines[(this.levelId - 1) % lines.length]);
    Sound.music(null); Sound.sfx('whoosh');
  }

  updateSnatch(dt) {
    const r = this.rescue, S = r.snatch, cow = r.cow, ship = S.ship;
    S.t += dt;
    const t = S.t;
    if (t < 1.3) {                                    // dives in fast and brakes over her
      const k = t / 1.3, e = 1 - Math.pow(1 - k, 3);
      ship.h = 720 - (720 - 175) * e; ship.theta = cow.theta; ship.rot = Math.sin(t * 9) * 0.12 * (1 - k);
    } else if (t < 2.9) {                             // tractor beam: up she goes, legs flailing
      if (!S.grabbed) { S.grabbed = true; Sound.sfx('beam'); Sound.sfx('moo'); this.banner('THEY\'VE GOT BESSIE AGAIN!'); buzz([40, 30, 40]); this.cameras.main.shake(200, 0.006); }
      const k = (t - 1.3) / 1.6;
      ship.h = 175 + Math.sin(t * 3) * 4; ship.rot = Math.sin(t * 2) * 0.05;
      cow.h = (ship.h - 48) * k * k; cow.rot = Math.sin(t * 7) * 0.35;
    } else {                                          // ...and away round the planet, accelerating
      const k = t - 2.9;
      ship.theta = wrap(ship.theta - (0.1 + k * 0.5) * dt); ship.h += k * 60 * dt; ship.rot = -0.25;
      cow.theta = ship.theta; cow.h = ship.h - 48 - Math.sin(t * 5) * 4; cow.rot = Math.sin(t * 4) * 0.25;
      if (!S.taunt && k > 0.4) { S.taunt = true; Sound.sfx('squeak'); }
    }
    // the beam hangs off the bottom of the ship while it's grabbing her
    const ba = t < 1.1 ? 0 : (t < 2.9 ? Math.min(1, (t - 1.1) * 4) : Math.max(0, 1 - (t - 2.9) * 2.5));
    const sp = this.screenPos(ship.theta, ship.h - 10), d = angDiff(ship.theta, this.pl.theta), z = this.zoom;
    S.ft += dt; if (S.ft > 0.09) { S.ft = 0; S.f = (S.f + 1) % 4; S.beam.setTexture('beam' + S.f); }
    S.beam.setPosition(sp.x, sp.y).setRotation(d).setScale(2 * z, (ship.h - 10) / 84 * z).setAlpha(sp.vis ? ba * 0.85 : 0);
    if (t > 5.4) {
      for (const a of [ship, cow]) { a.spr.destroy(); this.actors.splice(this.actors.indexOf(a), 1); }
      S.beam.destroy();
      if (r.burger && !r.got) { r.burger.spr.destroy(); this.actors.splice(this.actors.indexOf(r.burger), 1); }
      return true;
    }
    return false;
  }

  // ---------------------------------------------------------------- the secret warp
  relicHit(theta, h, rad, dmg) {
    let hit = false;
    for (const r of this.relics) {
      if (r.hp <= 0) continue;
      const rr = r.r + rad;
      if (dist2(theta, h, r.theta, r.h) > rr * rr) continue;
      r.hp -= dmg; hit = true;
      r.spr.hsq = 1; r.spr.setTintFill(0xffffff); r.flash = 0.06;
      Sound.sfx('clang');
      if (r.hp <= 0) this.breakRelic(r);
    }
    return hit;
  }

  breakRelic(r) {
    const W = this.warp;
    this.burst(r.theta, r.h, 'spark', 16, 1.1); this.bang(r.theta, r.h, 34);
    for (let k = 0; k < 5; k++) { const im = this.add.image(0, 0, 'db_bolt').setDepth(9); im.bsx = im.bsy = 1.5; this.parts.push({ theta: r.theta, h: r.h, vt: rnd(-200, 200), vh: rnd(100, 380), life: rnd(0.6, 1), spr: im }); }
    this.addLight(r.theta, r.h, 90, 0xd0a0ff, 1, 0.5);
    Sound.sfx('kill'); buzz(40);
    r.spr.destroy(); r.light.destroy();
    W.stage++; W.pulse = 1;
    const left = this.relics.filter(x => x.hp > 0).length;
    if (left === 0) this.time.delayedCall(500, () => this.openWarp());
    else { W.tgt = 0.8 + W.stage * 0.35; this.time.delayedCall(250, () => Sound.sfx('beam')); }      // the "background" black hole thrums and swells
  }

  openWarp() {
    const W = this.warp;
    if (!W || W.open) return;
    W.open = true; W.tgt = 2.6; W.pulse = 1;
    W.hole.clearTint().setAlpha(1);
    Sound.sfx('reveal'); this.cameras.main.shake(400, 0.01); this.camPunch(0.04);
    this.addLight(W.theta, W.h, 260, 0xb04aff, 1, 1.2);
    this.banner('A WARP HOLE HAS OPENED!');
    buzz([40, 40, 40, 40, 120]);
  }

  updateWarp(dt) {
    const W = this.warp, P = this.pl;
    W.t += dt;
    W.spin += dt * (W.open ? 2.4 : 0.12);
    W.size += (W.tgt - W.size) * Math.min(1, dt * 2.2);
    W.pulse = Math.max(0, W.pulse - dt * 1.2);
    const s = W.size * (1 + 0.18 * W.pulse + (W.open ? 0.05 * Math.sin(this.t * 7) : 0));
    W.hole.bsx = W.hole.bsy = s; this.place(W.hole, W.theta, W.h, W.spin);
    W.glow.bsx = W.glow.bsy = s * 1.7; this.place(W.glow, W.theta, W.h);
    W.glow.setAlpha(W.open ? 0.55 + 0.2 * Math.sin(this.t * 5) : 0.6 * W.pulse);
    if (!W.open) W.hole.setTint(W.pulse > 0.25 ? 0xc8a0ff : 0x6a6268);
    if (W.open && Math.random() < dt * 14) {                          // sparks spiralling in
      const a = rnd(0, TAU), d = rnd(60, 110) * W.size / 2.6;
      const im = this.add.image(0, 0, 'spark').setDepth(0.35).setTint(Math.random() < 0.5 ? 0xd0a0ff : 0xffd23f).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.addCounter({ from: 1, to: 0, duration: 650, onUpdate: tw => { const k = tw.getValue(), aa = a + (1 - k) * 2.5; this.place(im, wrap(W.theta + Math.cos(aa) * d * k / R), W.h + Math.sin(aa) * d * k); im.setScale(im.scaleX * (0.6 + k)); }, onComplete: () => im.destroy() });
    }
    for (const r of this.relics) {
      if (r.hp <= 0) continue;
      r.ph += dt;
      const bob = Math.sin(r.ph * 1.6) * 4;
      this.place(r.spr, r.theta, r.h + bob, Math.sin(r.ph * 0.9) * 0.25);
      this.place(r.light, r.theta, r.h + bob + 13);
      r.light.setAlpha(Math.sin(this.t * 4 + r.ph) > 0.5 ? 1 : 0.15);
      r.spr.hsq = Math.max(0, (r.spr.hsq || 0) - dt * 7);
      if (r.flash > 0) { r.flash -= dt; if (r.flash <= 0) r.spr.clearTint(); }
    }
    if (W.open && !W.entering && this.state === 'play') {
      const rr = 24 * W.size;
      if (dist2(P.theta, P.h + 30, W.theta, W.h) < rr * rr) this.enterWarp();
    }
    if (W.entering) {                                                  // sucked in: spiral to the centre, shrink, white-out
      const k = Math.min(1, W.t / 1.4);
      P.theta = wrap(P.theta + angDiff(W.theta, P.theta) * Math.min(1, dt * 4));
      P.h += (W.h - 30 - P.h) * Math.min(1, dt * 4);
      P.vx = 0; P.vh = 0;
      this.warpK = Math.max(0.05, 1 - k);
      W.size += dt * 0.8;
    }
  }

  enterWarp() {
    const W = this.warp;
    W.entering = true; W.t = 0;
    this.state = 'warp';
    Progress.find(W.def.to);
    this.clearEBullets(); Sound.jet(false); Sound.music(null);
    Sound.sfx('whoosh'); Sound.sfx('beam'); buzz([80, 40, 200]);
    this.banner('WARP ZONE!');
    this.cameras.main.shake(1400, 0.006);
    this.time.delayedCall(1300, () => this.cameras.main.fadeOut(450, 255, 255, 255));
    this.time.delayedCall(1800, () => this.scene.restart({ level: W.def.to, warped: true, autostart: true }));
  }

  nextWave() {
    this.waveIdx++;
    if (this.waveIdx >= this.waves.length) { this.win(); return; }
    const w = this.waves[this.waveIdx];
    this.queue = w.spawns.map(s => Object.assign({}, s)).sort((a, b) => a.t - b.t);
    this.waveTotal = Math.max(1, this.queue.length);
    if (this.waveIdx > 0 && !this.resumed) this.addScore(1000);                // wave-clear bonus
    this.waveT = 0;
    this.clearT = 0;
    // checkpoints: halfway through the waves, and just before the boss
    const half = Math.max(1, Math.floor((this.waves.length - 1) / 2)), isCp = this.waveIdx === half || this.waveIdx === this.waves.length - 1 || (Settings.diff === 'easy' && this.waveIdx > 0);
    if (isCp && !this.resumed && (!this.cp || this.cp.wave < this.waveIdx)) {
      this.cp = { wave: this.waveIdx, score: this.score, power: this.gotPower };
      Sound.sfx('shine');
    }
    this.banner((this.waveIdx === 0 && this.def.tip ? w.name + '\n' + this.def.tip : w.name) + (isCp && !this.resumed ? '\nCHECKPOINT!' : ''));
    if (this.waveIdx > 0 && this.waveIdx < this.waves.length - 1) Sound.sfx('wave');
    if (this.waveIdx > 0 && this.pl.hp < CFG.maxHp && Settings.diff !== 'hard') {      // a breather: a cheese wedge drops in between waves when you're hurt
      this.pickups.push({ kind: 'heal', theta: wrap(this.pl.theta + 0.14), h: 330, vh: 0, life: 16, spr: this.add.image(0, 0, 'wedge').setDepth(6) });
    }
    this.waveText.setText(this.waveIdx < this.waves.length - 1 ? 'WAVE ' + (this.waveIdx + 1) + '/' + (this.waves.length - 1) : 'BOSS');
  }

  win() { this.startRescue(); }

  // ---- golden cheese wheels: 3 hidden per level, remembered on the device
  //  #1 sits on the highest ledge (or floats mid-air), #2 hangs right up at the jetpack ceiling on the far side,
  //  #3 only drops when you finish off a medium-or-bigger enemy with a BASH
  placeWheels() {
    for (const w of this.wheels) w.spr.destroy();
    this.wheels = [];
    const ledges = (this.def.ledges || []).slice().sort((a, b) => b.h - a.h), have = Progress.wheels(this.levelId);
    const top = ledges[0];
    this.addWheel(0, top ? top.theta : wrap(this.pl.theta + 2.2), top ? top.h + 22 : 170, have);
    this.addWheel(1, wrap(this.pl.theta + Math.PI), CFG.jetCeiling - 20, have);
  }
  addWheel(i, theta, h, have) {
    if (this.wheels.some(w => w.i === i) || this.wheelsGot.includes(i)) return;
    have = have === undefined ? Progress.wheels(this.levelId) : have;
    const spr = this.add.image(0, 0, 'goldwheel').setDepth(6);
    if (have & (1 << i)) spr.setAlpha(0.45); else bakedGlow(spr, 0xffd23f, 3, 8);   // already found on an earlier run: a ghost of it
    this.wheels.push({ i, theta, h, spr, ph: rnd(0, 6), old: !!(have & (1 << i)) });
  }
  updateWheels(dt) {
    const P = this.pl;
    for (let k = this.wheels.length - 1; k >= 0; k--) {
      const w = this.wheels[k], bob = Math.sin(this.t * 3 + w.ph) * 4;
      if (w.vh !== undefined) { w.vh -= 600 * dt; w.h = Math.max(w.rest || 20, w.h + w.vh * dt); if (w.h <= (w.rest || 20)) w.vh = 0; }
      this.place(w.spr, w.theta, w.h + bob, 0);
      w.spr.setScale(w.spr.scaleX * Math.max(0.15, Math.abs(Math.cos(this.t * 2.4 + w.ph))), w.spr.scaleY);     // spins like a coin
      if (this.state === 'play' && dist2(w.theta, w.h + bob, P.theta, P.h + 22) < 30 * 30) {
        this.wheels.splice(k, 1); w.spr.destroy(); this.wheelsGot.push(w.i);
        Progress.addWheel(this.levelId, w.i);
        this.addScore(2500); this.popup(w.theta, w.h + 20, '+2500', '#ffd23f', true);
        Sound.sfx('reveal'); buzz([30, 30, 60]);
        this.burst(w.theta, w.h, 'crumb', 16, 1.2); this.bang(w.theta, w.h, 24); this.addLight(w.theta, w.h, 120, 0xffd23f, 1, 0.5);
        this.banner('GOLDEN CHEESE WHEEL!\n' + Progress.wheelCount(this.levelId) + ' / 3 FOUND');
      }
    }
  }

  // the end-of-level rank: S A B C D from hits taken, deaths, time and best combo
  levelRank() {
    const time = this.runT0 + this.t, par = this.def.par || (70 + 35 * this.waves.length);
    let pts = (Settings.diff === 'hard' ? 108 : 100) - 12 * this.hurtCount - 20 * this.deaths - Math.max(0, (time - par) / 5) + Math.min(10, this.maxCombo / 2);
    if (Settings.diff === 'easy') pts = Math.min(pts, 91);      // S rank needs Normal or Hard
    const r = pts >= 92 ? 'S' : pts >= 78 ? 'A' : pts >= 60 ? 'B' : pts >= 40 ? 'C' : 'D';
    return { r, time, pts };
  }

  finishWin() {
    Progress.beat(this.levelId);
    this.state = 'won';
    const RK = this.levelRank(), prev = Progress.rank(this.levelId);
    Progress.setRank(this.levelId, RK.r);
    const mm = Math.floor(RK.time / 60), ss = String(Math.floor(RK.time % 60)).padStart(2, '0');
    const stats = 'TIME ' + mm + ':' + ss + '   HITS ' + this.hurtCount + (this.deaths ? '   DEATHS ' + this.deaths : '') + '   BEST COMBO ' + this.maxCombo +
      '\nCHEESE WHEELS ' + Progress.wheelCount(this.levelId) + '/3' + (prev && 'SABCD'.indexOf(RK.r) < 'SABCD'.indexOf(prev) ? '   NEW BEST!' : '');
    this.time.delayedCall(700, () => this.showRank(RK.r));
    if (this.levelId === CFG.finalLevel) {               // the whole game is done: on to the ending
      Sound.music('win'); this.endT = this.t;
      this.showOverlay('YOU DID IT!', 'Bessie is safe at last...\n\n' + stats);
      this.time.delayedCall(2600, () => { this.cameras.main.fadeOut(600, 0, 0, 0); this.time.delayedCall(650, () => this.scene.start('ending')); });
      return;
    }
    if (this.levelId < CFG.finalLevel) Sound.music('win');
    this.endT = this.t;
    this.showOverlay('LEVEL ' + this.levelId + ' CLEAR!', this.def.win + '\n\n' + stats + '\n\nTap for level select');
  }

  die() {
    buzz([120, 60, 250]);
    this.state = 'dead';
    Sound.jet(false); Sound.music('lose');
    this.endT = this.t;
    this.burst(this.pl.theta, this.pl.h + 20, 'spark', 14, 1.2);
    this.deaths++;
    this.registry.set('lives', this.lives - 1);
    if (this.lives <= 0) { this.hideOverlay(); this.gameOver(); return; }
    const quips = ['The rats got away with Bessie.', 'Chris has been grated.', 'That was cheesy.', 'Bessie is NOT impressed.', 'Squeak squeak. (The rats are laughing.)', 'Brie-lliant effort. Not really.', 'You got Camem-BURNT.'];
    this.showOverlay('CHRIS IS TOAST', quips[(this.deaths - 1) % quips.length] + '\n\nLIVES LEFT: ' + this.lives + '\n\n' + (this.cp ? 'Tap to retry from the checkpoint' : 'Tap to try again'));
  }

  // the big rank letter that slams onto the clear screen
  showRank(r) {
    if (this.state !== 'won') return;
    const col = { S: '#ffd23f', A: '#7dff8a', B: '#5ce1ff', C: '#ffffff', D: '#ff9db8' }[r];
    const rx = Math.min(this.W - 40, this.ovTitle.x + this.ovTitle.width / 2 + 54), ry = this.ovTitle.y;
    const t = this.add.text(rx, ry, r, { fontFamily: PIXEL, fontSize: '44px', color: col, stroke: '#1a1020', strokeThickness: 8 }).setOrigin(0.5).setDepth(32).setScale(4).setAlpha(0).setRotation(-0.3);
    const lab = this.add.text(rx, ry + 34, 'RANK', { fontFamily: PIXEL, fontSize: '8px', color: '#ffffff' }).setOrigin(0.5).setDepth(32).setAlpha(0);
    this.tweens.add({ targets: t, scale: 1, alpha: 1, rotation: -0.12, duration: 260, ease: 'Back.In', onComplete: () => {
      this.cameras.main.shake(180, 0.008); Sound.sfx(r === 'S' ? 'reveal' : 'clunk'); buzz(40); this.tweens.add({ targets: lab, alpha: 1, duration: 200 });
      if (r === 'S') this.tweens.add({ targets: t, scale: 1.12, yoyo: true, repeat: -1, duration: 420 });
    } });
  }

  // GAME OVER: the camera pushes in on Chris where he fell and the world goes dark around him (a spotlight).
  // In the spotlight: his helmet glass cracks... and shatters, he keels over flat on his back with stars circling,
  // and far off in the sky the rat UFO whisks Bessie away. Then black, a big old-school GAME OVER drops in letter
  // by letter, and it all fades out back to the menu.
  gameOver() {
    const P = this.pl, rig = this.rig, dirn = P.facing || 1, cam = this.cameras.main;
    this.state = 'gameover'; this.cp = null;
    this.registry.set('lives', 0);
    Sound.jet(false); Sound.music(null);
    if (P.buff) this.endBuff();
    this.time.delayedCall(0, () => this.clearEBullets());       // not right now: we may be inside the bullet loop
    P.invuln = 0; P.thrusting = false; P.vx = 0; P.duck = false; P.firing = 0;
    this.slowT = 1.2; this.hitStop = 0.25;
    if (this.ctrlG) this.ctrlG.setVisible(false); for (const k in (this.btnLabels || {})) this.btnLabels[k].setVisible(false);
    const at = (ms, fn) => this.time.delayedCall(ms, () => { if (this.state === 'gameover') fn(); });
    const fx = P.spr.x, fy = P.spr.y - 34 * this.zoom;                         // centre of Chris on screen
    // 0. push in + spotlight
    if (!this.textures.exists('go_spot')) {
      const ct = this.textures.createCanvas('go_spot', 256, 256), c = ct.getContext(), g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.13, 'rgba(0,0,0,0)'); g.addColorStop(0.24, 'rgba(4,2,10,0.85)'); g.addColorStop(1, 'rgba(4,2,10,0.97)');
      c.fillStyle = g; c.fillRect(0, 0, 256, 256); ct.refresh(); ct.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
    const spot = this.add.image(fx, fy - 20, 'go_spot').setDepth(25).setDisplaySize(1000, 1000).setAlpha(0);
    this.tweens.add({ targets: spot, alpha: 1, duration: 900 });
    this.goCam = { z: 1, x: this.W / 2, y: this.H / 2 };
    this.tweens.add({ targets: this.goCam, z: 1.9, x: fx, y: fy, duration: 1000, ease: 'Sine.easeInOut' });
    // 1. crack
    at(700, () => { rig.crack.setVisible(true); Sound.sfx('clang'); buzz(40); cam.shake(120, 0.004); });
    at(1150, () => { rig.crack.setScale(1.15); Sound.sfx('clang'); });
    // 2. shatter
    at(1600, () => {
      rig.crack.setVisible(false); rig.head.setTexture('c_head_bare');
      this.burst(P.theta, P.h + 50, 'shard', 16, 1.1); this.bang(P.theta, P.h + 50, 24);
      Sound.sfx('crash'); buzz([60, 40, 120]); cam.flash(160, 255, 255, 255); cam.shake(250, 0.008);
    });
    // 3. timber! keels over backwards
    at(2100, () => {
      this.ko = { rot: 0 };
      Sound.sfx('sigh');
      rig.gunArm.setVisible(false); P.aimA = 0;                               // the gun clatters away
      const gun = this.add.image(0, 0, rig.gun.texture.key).setDepth(7).setFlipX(dirn < 0); gun.bsx = gun.bsy = 1.2;
      this.parts.push({ theta: wrap(P.theta + dirn * 20 / R), h: 40, vt: dirn * 90, vh: 260, life: 30, spr: gun, rot: 0, rv: dirn * 9, stay: true });
      this.tweens.add({ targets: this.ko, rot: -dirn * 1.5, duration: 650, ease: 'Bounce.easeOut', onComplete: () => {
        Sound.sfx('clunk'); this.burst(P.theta, 6, 'spark', 8, 0.6); cam.shake(160, 0.006);
        this.koStars = this.add.text(0, 0, '* * *', { fontFamily: PIXEL, fontSize: '8px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 3 }).setOrigin(0.5).setDepth(19);
      } });
    });
    // 4. far off in the night sky above him, the rat UFO whisks Bessie away (small, drifting up and away into the dark)
    at(3000, () => {
      const sx = fx + dirn * 70, sy = fy - 70;
      const ship = this.add.image(sx, sy, 'ratship').setDepth(5.5).setScale(0.32);
      const beam = this.add.image(sx, sy + 4, 'beam0').setDepth(5.4).setOrigin(0.5, 0).setScale(0.22, 0.2).setAlpha(0.8);
      const cow = this.add.image(sx, sy + 20, 'bessie').setDepth(5.5).setScale(0.2).setOrigin(0.5, 0);
      Sound.sfx('beam'); this.time.delayedCall(400, () => Sound.sfx('moo')); this.time.delayedCall(1300, () => Sound.sfx('ufoFly'));
      const T = { k: 0 };
      this.tweens.add({ targets: T, k: 1, duration: 2600, ease: 'Quad.easeIn', onUpdate: () => {
        const k = T.k, x = sx - dirn * 120 * k, y = sy - 70 * k - Math.sin(k * 9) * 4, sc = 1 - 0.85 * k;
        ship.setPosition(x, y).setScale(0.32 * sc).setRotation(-0.15 * Math.sin(k * 14));
        beam.setPosition(x, y + 4 * sc).setScale(0.22 * sc, 0.2 * sc).setAlpha(0.8 * (1 - k));
        cow.setPosition(x, y + 20 * sc).setScale(0.2 * sc).setRotation(Math.sin(k * 22) * 0.4);
        for (const o of [ship, cow]) o.setAlpha(1 - Math.max(0, k - 0.8) * 5);
      }, onComplete: () => { ship.destroy(); cow.destroy(); beam.destroy(); } });
      const moo = this.add.text(sx, sy - 14, 'moooo...', { fontFamily: PIXEL, fontSize: '6px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 2 }).setOrigin(0.5).setDepth(26).setResolution(3);
      this.tweens.add({ targets: moo, x: sx - dirn * 70, y: sy - 50, alpha: 0, duration: 1800, onComplete: () => moo.destroy() });
    });
    // 5. black... and the big GAME OVER
    at(5900, () => {
      const W = this.W, H = this.H;
      const black = this.add.rectangle(-W, -H, W * 3, H * 3, 0x000000, 1).setOrigin(0).setDepth(40).setAlpha(0).setScrollFactor(0);
      this.tweens.add({ targets: black, alpha: 1, duration: 600, onComplete: () => {
        this.goCam = null;                                                    // reset the push-in behind the black
        Sound.music('lose');
        const word = 'GAME OVER', cx = W / 2, cy = H * 0.42, sp = Math.min(34, W / 12), x0 = cx - (word.length - 1) * sp / 2;
        [...word].forEach((ch, i) => {
          if (ch === ' ') return;
          const t = this.add.text(x0 + i * sp, -40, ch, { fontFamily: PIXEL, fontSize: '32px', color: '#ff3a3a', stroke: '#ffd23f', strokeThickness: 4 }).setOrigin(0.5).setDepth(41).setScrollFactor(0);
          t.setShadow(4, 4, '#5a0a0a', 0, true, true);
          this.tweens.add({ targets: t, y: cy, delay: 300 + i * 110, duration: 520, ease: 'Bounce.easeOut', onStart: () => Sound.sfx('clunk') });
        });
        const sub = this.add.text(cx, cy + 46, 'BESSIE IS STILL OUT THERE...', { fontFamily: PIXEL, fontSize: '9px', color: '#ffffff' }).setOrigin(0.5).setDepth(41).setAlpha(0).setScrollFactor(0);
        this.tweens.add({ targets: sub, alpha: 1, delay: 1700, duration: 500 });
        const fin = this.add.text(cx, cy + 66, 'FINAL SCORE ' + String(this.score).padStart(7, '0'), { fontFamily: PIXEL, fontSize: '8px', color: '#ffd23f' }).setOrigin(0.5).setDepth(41).setAlpha(0).setScrollFactor(0);
        this.tweens.add({ targets: fin, alpha: 1, delay: 2100, duration: 500 });
        this.time.delayedCall(2300, () => { this.goReady = true; });
      } });
    });
    // 6. fade out, back to the start
    at(11500, () => this.leaveGameOver());
  }
  leaveGameOver() {
    if (this.leavingGO) return;
    this.leavingGO = true;
    for (const k of Object.keys(this.registry.getAll())) if (k.startsWith('oneup_')) this.registry.remove(k);   // a fresh game next time
    this.registry.set('lives', CFG.startLives);
    this.cameras.main.fadeOut(900, 0, 0, 0);
    this.time.delayedCall(950, () => { Sound.music(null); this.scene.start('menu'); });
  }

  // straight back in: from the last checkpoint if one was reached this attempt
  retry() {
    this.scene.restart({ autostart: true, level: this.levelId, cp: this.cp, deaths: this.deaths, runT: this.runT0 + this.t });
  }

  hurt() {
    this.camKick((Math.random() < 0.5 ? -1 : 1) * 7, -4);
    const P = this.pl;
    if (P.invuln > 0 || this.state !== 'play') return;
    if (this.buffOn('giant')) return;                        // too big to hurt
    if (this.buffOn('shield') && P.buff.charges > 0) {       // the Fondue Shield soaks it
      P.buff.charges--; P.invuln = 0.8;
      Sound.sfx('clang'); buzz(30); this.burst(P.theta, P.h + 30, 'fondue', 10, 1); this.bang(P.theta, P.h + 30, 16);
      this.banner(P.buff.charges > 0 ? 'SHIELD: ' + P.buff.charges + ' LEFT' : 'SHIELD GONE!');
      if (P.buff.charges <= 0) this.endBuff();
      return;
    }
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
    P.hp--; this.hurtCount++;
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
    for (const g of (this.goops || [])) {                   // goop bubbles plop up near Chris
      if (Math.abs(angDiff(g.theta, P.theta)) > 1.2) continue;
      g.bubT -= dt;
      if (g.bubT <= 0) {
        g.bubT = rnd(0.25, 0.7);
        const im = this.add.image(0, 0, 'goopbub').setDepth(7.7); im.bsx = im.bsy = rnd(0.6, 1.2);
        this.parts.push({ theta: wrap(g.theta + rnd(-g.half, g.half) * 0.85), h: 4, vt: 0, vh: rnd(60, 120), life: rnd(0.25, 0.4), spr: im });
      }
    }
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
    const rawDt = Math.min(delta / 1000, 0.05);
    const inp = this.readInput();
    this.lastDt = rawDt;
    if (this.coarse && this.H > this.W) { this.render(inp); return; }   // paused while the "rotate your phone" prompt shows
    if (this.paused) { this.render(inp); return; }
    if (this.hitStop > 0) { this.hitStop -= rawDt; this.fxTick(rawDt); this.render(inp); return; }   // hit-stop: freeze for a few frames on big impacts
    this.slowT = Math.max(0, (this.slowT || 0) - rawDt);
    const dt = rawDt * (this.slowT > 0 ? 0.3 + 0.7 * Math.pow(Math.max(0, 1 - this.slowT / 1.4), 3) : 1);   // boss-kill slow motion, easing back
    this.lastDt = dt;
    this.fxTick(rawDt);
    this.t += dt;

    if (this.state === 'play') {
      const ek = this.buffOn('slowmo') ? 0.4 : 1;          // Slow-Mo Brie: everything but Chris crawls
      this.updateBuff(dt);
      this.updateHazards(dt * ek);
      this.updateWorld(dt);
      this.updatePlayer(dt, inp);
      this.updateWaves(dt);
      this.updateEnemies(dt * ek);
      this.updatePlayerBullets(dt);
      this.updateEnemyBullets(dt * ek);
      this.updatePickups(dt);
      this.updateWheels(dt); this.updateOneUp();
    }
    else if (this.state === 'rescue') {
      this.updatePlayer(dt, inp);
      this.updateRescue(dt);
    }
    if (this.nap) this.updateNap(dt);
    if (this.warp) this.updateWarp(dt);
    this.updateFeel(rawDt);
    this.updateParticles(dt);

    this.fpsT += dt;
    if (this.fpsT > 0.5) { this.fpsT = 0; this.fpsText.setText(Math.round(this.game.loop.actualFps) + ' fps'); }

    this.render(inp);
  }

  // combo timer, low-health heartbeat + red vignette
  updateFeel(dt) {
    if (this.comboT > 0) {
      this.comboT -= dt;
      if (this.comboT <= 0) { if (this.combo >= 5) this.banner(this.combo + ' COMBO!'); this.combo = 0; if (this.comboText) this.tweens.add({ targets: this.comboText, alpha: 0, duration: 250 }); }
    }
    if (this.comboText) this.comboText.setPosition(this.W / 2, 40);
    const low = this.state === 'play' && this.pl.hp === 1 && !this.bonusHeart;
    if (low && !this.vign) {
      const key = 'vign_red';
      if (!this.textures.exists(key)) {
        const ct = this.textures.createCanvas(key, 160, 90), c = ct.getContext();
        const g = c.createRadialGradient(80, 45, 28, 80, 45, 95);
        g.addColorStop(0, 'rgba(255,0,40,0)'); g.addColorStop(0.45, 'rgba(255,20,40,0.3)'); g.addColorStop(1, 'rgba(170,0,20,1)');
        c.fillStyle = g; c.fillRect(0, 0, 160, 90); ct.refresh(); ct.setFilter(Phaser.Textures.FilterMode.LINEAR);
      }
      this.vign = this.add.image(0, 0, key).setOrigin(0).setDepth(19.4).setAlpha(0);
    }
    if (this.vign) {
      if (low) {
        this.beatT -= dt;
        if (this.beatT <= 0) { this.beatT = 0.9; Sound.sfx('beat'); }
        const ph = 0.9 - this.beatT, pulse = Math.exp(-ph * 9) + 0.6 * Math.exp(-Math.max(0, ph - 0.18) * 9) * (ph > 0.18 ? 1 : 0);
        this.vign.setDisplaySize(this.W, this.H).setAlpha(0.6 + 0.4 * Math.min(1, pulse));
      } else this.vign.setAlpha(Math.max(0, this.vign.alpha - dt * 2));
    }
  }

  switchWeapon(dirn) {
    const n = WEAPONS.length;
    for (let k = 1; k <= n; k++) {
      const i = ((this.weaponIdx + (dirn || 1) * k) % n + n) % n;
      if (!weaponUnlocked(WEAPONS[i], this.levelId)) continue;
      if (i === this.weaponIdx) return;
      this.weaponIdx = i; this.weapon = WEAPONS[i]; this.pl.charging = false; this.pl.charge = 0;
      try { localStorage.setItem('lc_weapon', String(i)); } catch (e) { /* ignore */ }
      this.rig.setWeapon(this.weapon);
      this.pl.fireCd = Math.max(this.pl.fireCd, 0.15);
      this.banner(this.weapon.name);
      this.macText.setText(this.weapon.short);
      this.weaponIcon.setTexture(this.weapon.gunTex);
      Sound.sfx('power'); buzz(20);
      return;
    }
  }

  togglePause() {
    this.paused = !this.paused;
    this.time.paused = this.paused;
    if (this.paused) this.tweens.pauseAll(); else this.tweens.resumeAll();
    Sound.pause(this.paused);
    if (this.paused) {
      this.pauseMenu = makeMenu(this, { title: 'PAUSED', depth: 40, items: [
        { label: () => 'RESUME', act: d => { if (!d) this.togglePause(); } },
        ...optionItems(() => this.applyGfx()),
        { label: () => 'QUIT TO MENU', act: d => { if (!d) { this.togglePause(); this.scene.start('menu'); } } }
      ] });
    } else if (this.pauseMenu) { this.pauseMenu.destroy(); this.pauseMenu = null; }
  }

  // graphics setting changed mid-level: drop shader glows if they're now off (lights follow the setting live)
  applyGfx() {
    if (!Settings.glow) {
      for (const o of this.children.list) {
        try { if (o.preFX) o.preFX.clear(); if (o.postFX) o.postFX.clear(); } catch (e) { /* ignore */ }
        if (o.__glowBase) { const g = o.__glowBase; o.setTexture(g.key); o.setDisplayOrigin(g.dox, g.doy); o.__glowBase = null; }
      }
    }
  }

  readInput() {
    const d = { left: false, right: false, jump: false, fire: false, down: false };
    // touch twin-sticks: each finger is a stick based where it first touched down
    const S = this.sticks; S.move = null; S.aim = null;
    let moveTouched = false;
    if (this.touchUI && this.btn) for (const p of this.input.manager.pointers) {
      if (!p || !p.isDown || (p === this.input.manager.mousePointer && !p.wasTouch)) continue;   // a real mouse isn't a thumbstick
      const ox = p.downX, oy = p.downY;
      if (oy < this.H * 0.28) continue;                                  // the HUD / menu area isn't a stick
      const Bb = this.btn.bash;
      if (Math.hypot(ox - Bb.x, oy - Bb.y) < Bb.r * 1.05) { d.melee = true; continue; }      // the right-hand button = BASH (only if the press starts on it)
      const rad = 46, vx = Math.max(-1, Math.min(1, (p.x - ox) / rad)), vy = Math.max(-1, Math.min(1, (p.y - oy) / rad));
      if (ox < this.W * 0.45) {                                          // MOVE stick
        S.move = { ox, oy, vx, vy }; moveTouched = true;
        if (vx < -0.3) d.left = true; else if (vx > 0.3) d.right = true;
        if (vy > 0.55 && Math.abs(vy) > Math.abs(vx) * 0.8) d.down = true;            // pull down: duck / drop fast
        // push UP to jump: must be a clear upward push (not a sloppy diagonal while running), and you have to come back
        // down past -0.3 before it can jump again (hysteresis: no accidental double-jumps from thumb wobble)
        const upish = -vy > Math.abs(vx) * 0.6;
        if (this.stickUp) { if (vy > -0.3) this.stickUp = false; } else if (vy < -0.6 && upish) this.stickUp = true;
        if (this.stickUp) d.jump = true;                                 // held up = keep holding jump (jetpack after a beat)
        if (vy < -0.88) d.jetNow = true;                                  // pushed right to the top: jetpack straight away
      } else {                                                           // AIM+FIRE stick: touching fires, dragging aims
        S.aim = { ox, oy, vx, vy };
        d.fire = true; d.reach = Math.max(d.reach || 0, 0.5 + 0.5 * Math.min(1, Math.hypot(vx, vy) / 0.9));   // touch: drag further = longer spaghetti
        if (Math.hypot(vx, vy) > 0.35) d.aim = { x: vx, y: vy };
      }
    }
    if (!moveTouched) this.stickUp = false;
    if (this.tapJumpT > 0) { this.tapJumpT -= this.lastDt || 0.016; d.jump = true; }
    if (this.bashReq) { this.bashReq = false; d.melee = true; }
    if (d.fire && !d.fireP) d.fireP = 1;
    if (this.mouseAim && this.pl && this.pl.spr) {                       // mouse aim: point from Chris's gun to the cursor
      const m = this.input.manager.mousePointer, gx = this.pl.spr.x, gy = this.pl.spr.y - 40 * this.zoom;
      const ax = m.x - gx, ay = m.y - gy, len = Math.hypot(ax, ay);
      if (len > 18) d.aim = { x: ax / len, y: ay / len };
      if (m.leftButtonDown()) { d.fire = true; d.fireP = 1; }
      if (m.rightButtonDown()) d.melee = true;
    }
    const k = this.keys;
    if (k) {
      if (k.left.isDown || k.a.isDown) d.left = true;
      if (k.right.isDown || k.d.isDown) d.right = true;
      if (k.space.isDown || k.up.isDown || k.w.isDown) d.jump = true;
      if (k.z.isDown || k.x.isDown) { d.fire = true; d.fireP = 1; }
      if (k.down.isDown || k.s.isDown) d.down = true;
      if (k.f.isDown || k.v.isDown) d.melee = true;
    }
    const g = Pad.state;
    if (g.connected) {
      if (g.left) d.left = true;
      if (g.right) d.right = true;
      if (g.jump) d.jump = true;
      if (g.fire) { d.fire = true; d.fireP = Math.max(d.fireP || 0, g.fireP || 1); d.reach = Math.max(d.reach || 0, g.fireP || 1); }
      if (g.down) d.down = true;
      if (g.melee) d.melee = true;
      if (g.jet) { d.jump = true; d.jetNow = true; }
      if (g.aimOn) { d.aim = { x: g.aimX, y: g.aimY }; d.fire = true; d.fireP = Math.max(d.fireP || 0, g.fireP || 1); }   // twin-stick: aiming fires
    }
    if (d.fire) { d.fireP = d.fireP || 1; d.reach = d.reach || d.fireP; }
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

    P.vx += (ax * CFG.runSpeed * (1 - 0.55 * (P.charge || 0)) * (P.goop ? 0.2 : (P.suck ? 0.4 : 1)) * (P.grabbed ? 0 : 1) - P.vx) * Math.min(1, dt * (P.h > 0 ? 6 : 12));
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
    if (inp.aim) {                                      // twin-stick: face and aim where the right stick points, whatever way you run
      if (Math.abs(inp.aim.x) > 0.2) P.facing = inp.aim.x > 0 ? 1 : -1;
      const up = Math.atan2(-inp.aim.y, Math.abs(inp.aim.x));
      P.aimA = Math.max(-0.6, Math.min(1.25, up));
    } else P.aimA = (P.aimA || 0) * Math.max(0, 1 - dt * 10);

    const hPrev = P.h;
    P.floor = this.floorAt(P.theta, P.h);
    const grounded = P.h <= P.floor && P.vh <= 0;
    // quicksand goop: sink in, crawl along, and the first couple of jumps only squelch you up a little (or hop then jet out)
    const pool = (this.goops && this.goops.length && P.floor === 0 && P.h <= 1 && this.state === 'play') ? this.goops.find(g => Math.abs(angDiff(P.theta, g.theta)) < g.half) : null;
    if (pool && !P.goop) {
      P.stuck = 2; Sound.sfx('squelch'); this.goopSplash(P.theta); buzz(30);
      if (!this.goopTip) { this.goopTip = true; this.banner('STUCK IN THE GOOP!\nJUMP JUMP - OR JET OUT!'); }
    }
    P.goop = !!pool;
    const edgeK = pool ? Math.max(0, Math.min(1, (1 - Math.abs(angDiff(P.theta, pool.theta)) / pool.half) * 4)) : 0;   // shallower at the very edges, so feet never poke out below
    P.sink = pool ? Math.min(18 * edgeK, (P.sink || 0) + dt * 26) : Math.max(0, (P.sink || 0) - dt * 90);
    P.jumpBufT = Math.max(0, (P.jumpBufT || 0) - dt); P.coyT = grounded ? CFG.coyoteTime : Math.max(0, (P.coyT || 0) - dt);
    if (inp.jump && !P.jumpWas) { if (P.grabbed) { P.mash = (P.mash || 0) + 1; this.burst(P.theta, P.h + 10, 'spark', 3, 0.5); } else P.jumpBufT = CFG.jumpBuffer; }     // jumps fire on the PRESS (buffered), not while held: no accidental bunny-hops
    P.jumpWas = !!inp.jump;
    if (P.jumpBufT > 0 && (grounded || P.coyT > 0) && P.vh <= 0) {
      if (P.goop && P.stuck > 0) { P.vh = CFG.jumpV * 0.42; P.stuck--; Sound.sfx('squelch'); this.goopSplash(P.theta); }   // glorp: only a little hop
      else { P.vh = CFG.jumpV; Sound.sfx('jump'); if (P.goop) this.goopSplash(P.theta); }
      P.jetArmed = false; P.holdT = 0; P.jumpBufT = 0; P.coyT = 0;
      if (P.goop) { P.jetArmed = true; P.holdT = CFG.jetHoldDelay + 1; }      // out of the goop, holding jump lights the boots at once (they just struggle)
      if (!grounded) P.h = Math.max(P.h, P.floor || 0);
    }
    if (!grounded && inp.jump) { P.holdT = (P.holdT || 0) + dt; if (P.holdT > CFG.jetHoldDelay || inp.jetNow) P.jetArmed = true; }   // keep holding jump: the jetpack kicks in after a beat
    else if (!inp.jump) P.holdT = CFG.jetHoldDelay + 1;                                                                                // (a fresh press in mid-air lights it at once)
    if (!inp.jump && P.vh > 320) P.vh = 320;      // release early = shorter hop
    if (!grounded && !inp.jump) P.jetArmed = true; // let go in mid-air, then hold again to light the jetpack

    P.diving = !grounded && !!inp.down;                       // duck in mid-air = tuck and drop fast (cuts the jetpack)
    P.thrusting = !grounded && inp.jump && P.jetArmed && P.fuel > 0 && !P.diving;
    if (P.thrusting !== this.jetOn) { this.jetOn = P.thrusting; Sound.jet(P.thrusting); }
    // goop suction: just above a pool the muck clings to the jet boots - weak thrust, slow climb, and it drags you back down
    const suck = (this.goops && this.goops.length && P.h < 46 && P.floor === 0) ? this.goops.some(g => Math.abs(angDiff(P.theta, g.theta)) < g.half * 1.05) : false;
    if (suck && P.thrusting && Math.random() < dt * 14) { const im = this.add.image(0, 0, 'goopbub').setDepth(7.7); this.parts.push({ theta: P.theta + rnd(-0.02, 0.02), h: P.h, vt: rnd(-40, 40), vh: rnd(-60, 20), life: 0.4, spr: im }); }
    P.suck = suck;
    if (suck) P.vh -= 320 * dt;
    if (P.thrusting) {
      const rb = this.buffOn('boots');
      P.vh = Math.max(P.vh, Math.min(CFG.jetMaxV * (rb ? 1.45 : 1) * (suck ? 0.3 : 1), P.vh + CFG.jetAccel * (rb ? 1.35 : 1) * (suck ? 0.85 : 1) * dt));   // (never slows a bounce down)
      P.fuel = rb ? 1 : Math.max(0, P.fuel - CFG.jetDrain * dt);
      this.jetFlames(2);
    } else if (grounded) {
      P.fuel = Math.min(1, P.fuel + CFG.jetRegen * dt);
    } else {                                                   // gliding with the jet off: a slow trickle back after half a second
      P.airRegenT = (P.airRegenT || 0) + dt;
      if (P.airRegenT > 0.5) P.fuel = Math.min(1, P.fuel + CFG.jetRegen * 0.3 * dt);
    }
    if (P.thrusting) P.airRegenT = 0;

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
    const W = this.weapon;
    // ---- MELEE: gun-butt bash (Halo style). B / F / V / right-click / the BASH button. Never automatic.
    P.bashCd = Math.max(0, P.bashCd - dt);
    // (no auto-bash: it only ever happens when you press BASH)
    if (inp.melee && P.bashCd <= 0 && P.bashT <= 0 && this.state === 'play') this.startBash();
    if (P.bashT > 0) {
      P.bashT = Math.max(0, P.bashT - dt);
      const k = 1 - P.bashT / CFG.bashTime;                                  // 0 -> 1 through the swing
      // 1) SWING: the gun whips ~120 degrees anticlockwise round the grip - barrel up and back, butt swinging
      //    forward into whatever's in front - with a lunge and a lean (the hit lands at the end of the swing)
      // 2) a split-second hold at the hit, 3) SNAP back to normal
      const SW = -2.1;                                                     // about 120 degrees
      if (k < 0.36) { const q = k / 0.36, e = 1 - Math.pow(1 - q, 3);
        P.bashSpin = SW * e; P.bashX = 10 * e; P.bashY = 2 * e; P.bashA = 0.1 * e; P.bashLean = 0.16 * e;
        P.theta = wrap(P.theta + (P.facing || 1) * 230 / R * dt); }         // lunge into it
      else if (k < 0.48) { P.bashSpin = SW - 0.06; P.bashX = 10; P.bashY = 2; P.bashA = 0.1; P.bashLean = 0.16; }
      else if (k < 0.82) { const q = (k - 0.48) / 0.34, e = q * q * (3 - 2 * q);
        P.bashSpin = (SW - 0.06) * (1 - e); P.bashX = 10 * (1 - e); P.bashY = 2 * (1 - e); P.bashA = 0.1 * (1 - e); P.bashLean = 0.16 * (1 - e); }
      else { P.bashSpin = 0; P.bashX = 0; P.bashY = 0; P.bashA = 0; P.bashLean = 0; }
      if (!P.bashHit && k >= 0.33) { P.bashHit = true; this.bashHit(); }
    } else { P.bashA = 0; P.bashX = 0; P.bashY = 0; P.bashSpin = 0; P.bashLean = 0; }
    P.beamOn = !!(W.beam && want && !P.overheat && P.bashT <= 0 && this.state === 'play');
    if (W.beam) {                                       // Spaghetti Spinner: a continuous stream instead of shots
      P.beamReach = (P.beamReach || 1) + ((W.reachMin + (1 - W.reachMin) * (inp.reach || 1)) - (P.beamReach || 1)) * Math.min(1, dt * 10);   // trigger pressure / drag = reach
      if (P.beamOn) {
        P.firing = 0.12;
        if (P.power <= 0) {
          P.ammo = Math.max(0, P.ammo - W.drain * dt); P.ammoHold = CFG.ammoDelay;
          if (P.ammo <= 0) { P.overheat = true; P.beamOn = false; Sound.sfx('hiss'); }
        }
        P.beamT = (P.beamT || 0) - dt;
        if (P.beamT <= 0) { P.beamT = W.tick * (this.buffOn('sauce') ? 0.6 : 1); this.beamHit(W); Sound.sfx(W.sfx); if (Pad.state.connected) Pad.pulse(110, 0.15, 0.45); }
      }
    } else if (W.charge) {                              // Swiss-Shot: HOLD to charge (ball grows, Chris slows), RELEASE to fire
      const ok = this.state === 'play' && !P.overheat && P.bashT <= 0;
      if (want && ok && P.fireCd <= 0) {
        if (!P.charging) { P.charging = true; P.charge = 0; P.chargeSnd = 0; P.chargeFull = false; }
        P.charge = Math.min(1, P.charge + dt / W.chargeTime * (0.55 + 0.45 * (inp.fireP || 1)));    // a harder trigger pull charges faster
        P.chargeSnd -= dt;
        if (P.charge < 1 && P.chargeSnd <= 0) { P.chargeSnd = 0.13; Sound.sfx('charge', P.charge); if (Pad.state.connected) Pad.pulse(60, 0.1 + 0.5 * P.charge, 0.2 + 0.4 * P.charge); }
        if (P.charge >= 1 && !P.chargeFull) { P.chargeFull = true; Sound.sfx('charged'); buzz(40); this.addLight(this.muzzle ? this.muzzle.theta : P.theta, this.muzzle ? this.muzzle.h : P.h + 40, 80, 0xffe27a, 1, 0.3); }
      } else if (P.charging) {                          // let go: fire it
        P.charging = false;
        if (ok) this.fireCharged(Math.max(0.2, P.charge), tgt);
        P.charge = 0;
      }
    } else if (P.fireCd <= 0 && want && !P.overheat && P.bashT <= 0) {
      const pr = W.pressure ? (inp.fireP || 1) : 1;      // Mac-Grinder: light trigger = slower, shorter shots
      this.fire(tgt, W.pressure ? { speedK: 0.6 + 0.4 * pr, lifeK: 0.6 + 0.4 * pr } : null);
      P.fireCd = this.weapon.interval / (W.pressure ? 0.45 + 0.55 * pr : 1) * (this.buffOn('sauce') ? 0.5 : 1);
      if (P.power <= 0) {
        P.ammo = Math.max(0, P.ammo - this.weapon.ammo);
        P.ammoHold = CFG.ammoDelay;
        if (P.ammo <= 0) { P.overheat = true; Sound.sfx('hiss'); }
      }
    }
    if (P.ammoHold <= 0) P.ammo = Math.min(1, P.ammo + CFG.ammoRegen * dt);
  }

  // release a charged Swiss-Shot: everything scales with the charge (c = 0.2 .. 1)
  fireCharged(c, tgt) {
    const P = this.pl, W = this.weapon;
    this.fire(tgt, { ploughDmg: 3 + 6 * c, speedK: 0.65 + 0.75 * c, scaleK: 0.45 + 0.95 * c, blast: W.blast * (0.45 + 0.85 * c), blastDmg: W.blastDmg * (0.4 + 1.0 * c), bossDmg: W.bossDmg * (0.4 + 1.0 * c), angleK: 0.85 + 0.25 * c });
    P.fireCd = W.interval * (this.buffOn('sauce') ? 0.5 : 1);
    if (P.power <= 0) {
      P.ammo = Math.max(0, P.ammo - W.ammo * (0.5 + 0.9 * c)); P.ammoHold = CFG.ammoDelay;
      if (P.ammo <= 0) { P.overheat = true; Sound.sfx('hiss'); }
    }
    if (c > 0.6) { this.camKick(-(P.facing || 1) * 6 * c, 0); P.vx -= (P.facing || 1) * 160 * c; buzz(Math.round(30 + 40 * c)); }   // a big one kicks back
  }

  // comic impact on a bash: a spinning pixel star flash and a "BONK!" that pops up and drifts off
  bashPop(theta, h) {
    const s = this.screenPos(theta, h), z = this.zoom;
    const star = this.add.image(s.x, s.y, 'px_star').setDepth(9.5).setScale(0.5 * z).setTint(0xffffff).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: star, scale: 4.2 * z, angle: 90, alpha: 0, duration: 260, ease: 'Quad.easeOut', onComplete: () => star.destroy() });
    const words = ['BONK!', 'THWACK!', 'BOP!', 'WHAM!'];
    const t = this.add.text(s.x, s.y - 18 * z, words[(this.bashN = (this.bashN || 0) + 1) % words.length], { fontFamily: PIXEL, fontSize: Math.round(11 * z) + 'px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: Math.max(3, Math.round(4 * z)) })
      .setOrigin(0.5).setDepth(9.6).setScale(0.4).setAngle(-8 + Math.random() * 16);
    this.tweens.add({ targets: t, scale: 1.15, duration: 120, ease: 'Back.easeOut' });
    this.tweens.add({ targets: t, y: t.y - 26 * z, alpha: 0, delay: 260, duration: 380, ease: 'Quad.easeIn', onComplete: () => t.destroy() });
  }

  // ================================================================= timed power-ups (see BUFFS in levels.js)
  buffOn(k) { const b = this.pl && this.pl.buff; return !!(b && b.kind === k); }

  startBuff(k) {
    const P = this.pl, B = BUFFS[k];
    if (P.buff) this.endBuff();
    Sound.sfx('power'); buzz([20, 30, 20, 30, 60]); this.bang(P.theta, P.h + 24, 26);
    this.banner(B.name); this.addScore(300);
    this.addLight(P.theta, P.h + 30, 140, B.col, 1, 0.5);
    if (k === 'moo') { this.mooBomb(); return; }
    P.buff = { kind: k, t: B.t, max: B.t, charges: k === 'shield' ? 3 : 0 };
    if (k === 'giant') this.cameras.main.shake(300, 0.01);
  }

  endBuff() {
    const P = this.pl; if (!P.buff) return;
    const k = P.buff.kind; P.buff = null;
    if (this.buffFx) { this.buffFx.forEach(o => o.destroy()); this.buffFx = null; }
    if (this.slowRect) this.slowRect.setVisible(false);
    if (k === 'giant') P.invuln = Math.max(P.invuln, 1);           // a moment's grace as he shrinks back
    Sound.sfx('flap');
  }

  updateBuff(dt) {
    const P = this.pl, b = P.buff;
    if (!b) return;
    b.t -= dt;
    if (b.kind === 'giant') {                                    // stomp stomp: flattens anything small he walks into
      for (const e of this.enemies) if (e.type !== 'boss' && e.hp > 0 && Math.abs(angDiff(e.theta, P.theta)) * R < 46 && e.h < 100) { e.hp = 0; this.burst(e.theta, e.h + 10, 'spark', 8, 1); }
      this.stepT -= dt;
      if (Math.abs(P.vx) > 60 && P.h <= (P.floor || 0) + 1 && this.stepT <= 0) { this.stepT = 0.3; this.cameras.main.shake(90, 0.007); Sound.sfx('clunk'); this.burst(P.theta, 2, 'crumb', 5, 0.7); }
      this.reapEnemies();
    }
    if (b.t <= 0) this.endBuff();
  }

  // the visible side of the power-ups: orbiting fondue, rat ears, the slow-mo wash and the HUD timer
  drawBuff() {
    const P = this.pl, b = P.buff, z = this.zoom;
    if (!this.buffIcon) {
      this.buffIcon = this.add.image(0, 0, 'pu_sauce').setDepth(20.6).setVisible(false);
      this.buffBarG = this.add.graphics().setDepth(20.6);
    }
    this.buffBarG.clear();
    if (!b) { this.buffIcon.setVisible(false); return; }
    const B = BUFFS[b.kind], frac = b.max ? Math.max(0, b.t / b.max) : 0;
    const flash = frac < 0.25 && Math.floor(this.t * 8) % 2;            // flashes when it's about to run out
    this.buffIcon.setTexture(B.tex).setPosition(320, 52).setScale(2).setVisible(!flash);
    this.buffBarG.fillStyle(0x1a1020, 0.9).fillRect(302, 70, 38, 6).fillStyle(B.col, 1).fillRect(303, 71, 36 * frac, 4);
    if (b.kind === 'shield') {
      if (!this.buffFx) this.buffFx = [0, 1, 2].map(() => this.add.image(0, 0, 'fondue').setDepth(7.4));
      this.buffFx.forEach((o, i) => {
        const a = this.t * 4 + i * TAU / 3, rr = 30 * this.giantK;
        o.setVisible(i < b.charges); o.bsx = o.bsy = 1.3;
        this.place(o, wrap(P.theta + Math.cos(a) * rr / R), P.h + 30 * this.giantK + Math.sin(a) * rr, 0);
      });
    }
    if (b.kind === 'disguise') {
      if (!this.buffFx) this.buffFx = [this.add.image(0, 0, 'pu_ears').setDepth(7.5)];
      const hd = this.rig.head.getWorldTransformMatrix();
      this.buffFx[0].setPosition(hd.tx, hd.ty - 25 * z * this.giantK).setScale(z * 1.1 * this.giantK).setRotation(hd.rotation);   // up on top, either side of the hat
    }
    if (b.kind === 'slowmo') {
      if (!this.slowRect) this.slowRect = this.add.rectangle(0, 0, this.W, this.H, 0x7a6aff, 0.13).setOrigin(0).setDepth(19).setBlendMode(Phaser.BlendModes.ADD);
      this.slowRect.setSize(this.W, this.H).setVisible(true).setAlpha(0.2 + 0.05 * Math.sin(this.t * 6));
    }
  }

  // Bessie's Moo Bomb: a giant ghostly Bessie moos everything small off the screen
  mooBomb() {
    const P = this.pl;
    Sound.sfx('moo'); Sound.sfx('boom'); this.cameras.main.flash(300, 255, 255, 255); this.cameras.main.shake(500, 0.014); buzz([60, 40, 120]);
    const s = this.screenPos(P.theta, P.h + 60);
    const g = this.add.image(s.x, s.y, 'bessie').setDepth(19).setBlendMode(Phaser.BlendModes.ADD).setScale(this.zoom).setAlpha(0.9);
    this.tweens.add({ targets: g, scale: this.zoom * 9, alpha: 0, duration: 900, ease: 'Quad.easeOut', onComplete: () => g.destroy() });
    for (const e of this.enemies) {
      if (Math.abs(angDiff(e.theta, P.theta)) > 1.3) continue;
      if (e.type === 'boss') { e.hp -= 25; e.flash = 0.1; e.spr.setTintFill(0xffffff); } else e.hp = 0;
    }
    this.clearEBullets();
    this.reapEnemies();
  }

  startBash() {
    const P = this.pl;
    P.bashT = CFG.bashTime; P.bashCd = CFG.bashCd; P.bashHit = false; P.charging = false; P.charge = 0;
    Sound.sfx('swish');
    if (P.overheat && !this.bashTipShown) { this.bashTipShown = true; this.banner('OUT OF PASTA - BASH \'EM!'); }
  }

  // how much damage a hit does: rat-frogs are slime-shielded (0) except when attacking / pouncing / stunned (x2)
  hitK(e) {
    if (e.kind !== 'frog') return 1;
    return (e.state === 'lash' || e.state === 'grab' || e.state === 'stun' || e.state === 'pounce') ? 2 : 0;
  }
  deflect(e, theta, h) {                                      // a shot glances off the slime: a glint and a plink
    if ((e.plinkT || 0) > this.t) return;
    e.plinkT = this.t + 0.12;
    this.burst(theta, h, 'spark', 3, 0.5); Sound.sfx('clang');
    e.spr.setTintFill(0xc8ffd0); e.flash = 0.05;
    if (!this.slimeTip) { this.slimeTip = true; this.banner('SLIME SHIELD!\nHIT THEM WHILE THEY ATTACK - OR BASH!'); }
  }
  frogStun(e, t) {
    if (this.pl.grabbed === e) this.releaseGrab(false);
    e.state = 'stun'; e.stunT = t; e.tongue = 0; e.leapV = 0; e.spr.setFlipY(true);
  }
  releaseGrab(chomped) {
    const P = this.pl, e = P.grabbed; if (!e) return;
    P.grabbed = null; P.mash = 0;
    if (e.hp > 0 && (e.state === 'grab' || e.state === 'lash')) { e.state = 'sit'; e.lashCd = 1.6; e.tongueOut = 0; }
    if (chomped) { const away = Math.sign(angDiff(P.theta, e.theta)) || 1; P.theta = wrap(P.theta + away * 26 / R); P.vh = 380; P.vx = away * 220; }
  }

  // RAT-FROG PACK. Learnable rules:
  //  * sitting frogs are slime-shielded: shots plink off. They hang back at mid-range, spaced out, on their own side.
  //  * they take turns: one LASHES its tongue at a time, the next a beat later. The TELL says which height:
  //      squats flat + GREEN throat  -> LOW tongue along the floor  -> JUMP it
  //      rears up tall + PINK throat -> HIGH tongue at chest height -> DUCK it
  //    (a pack alternates low / high, so you learn the rhythm)
  //  * caught? it reels you in: mash JUMP x3 to break free, or shoot its open mouth. Reeled all the way in = a chomp.
  //  * get too close and it POUNCES straight at you: run under it. It lands belly-up, stunned.
  //  * open mouth, mid-pounce and stunned = double damage. BASH always connects and stuns.
  frogAI(e, dt, toP, distP, dirP, fooled) {
    const P = this.pl, side = -(Math.sign(toP) || 1);            // which side of Chris this frog lives on
    if (!e.state || e.state === 'idle' || e.state === 'air') e.state = 'approach';
    e.lashCd = Math.max(0, (e.lashCd || 0) - dt); e.pounceCd = Math.max(0, (e.pounceCd === undefined ? 1.5 : e.pounceCd) - dt);
    const grounded = e.h <= 0 && e.vh <= 0;
    // where it wants to sit: 170px out on its own side, then 55px further per frog ahead of it in the queue
    let slot = 0;
    for (const f of this.enemies) if (f !== e && f.kind === 'frog' && f.hp > 0 && Math.sign(angDiff(f.theta, P.theta)) === side && Math.abs(angDiff(f.theta, P.theta)) < Math.abs(toP)) slot++;
    const want = wrap(P.theta + side * (170 + slot * 55) / R), off = angDiff(want, e.theta) * R;
    if (e.state !== 'stun') e.spr.setFlipY(false);
    if (e.state !== 'tell') { e.sacK = 0; }
    e.dir = (e.state === 'approach' && Math.abs(off) > 30) ? Math.sign(off) : dirP;

    if (e.state === 'approach') {
      if (grounded) {
        e.hopT = (e.hopT || 0) - dt;
        if (Math.abs(off) < 25 && distP < 320) { e.state = 'sit'; e.leapV = 0; }
        else if (e.hopT <= 0) { e.vh = rnd(240, 300); e.leapV = Math.sign(off) * Math.min(260, Math.abs(off) * 2.2 + 80); e.hopT = 0.12; Sound.sfx('squeak'); }
      }
    } else if (e.state === 'sit') {
      e.leapV = 0;
      if (fooled) { /* disguise: it just sits */ }
      else if (distP < 105 && e.pounceCd <= 0) {                 // too close: POUNCE
        e.state = 'pounce'; e.vh = 560; e.pounceCd = 3;
        const air = 2 * e.vh / this.gAt(e.theta);
        e.leapV = Math.max(-420, Math.min(420, (toP * R + (P.vx || 0) * air * 0.5) / air)) || dirP * 200;
        Sound.sfx('ribbit'); e.spr.hsq = 1;
      }
      else if (Math.abs(off) > 70 || distP > 340) e.state = 'approach';
      else if (e.lashCd <= 0 && distP < 245 && this.t >= (this.frogNextLash || 0) && this.state === 'play') {
        this.frogLow = !this.frogLow;                              // the pack alternates low / high
        e.state = 'tell'; e.tellT = 0.65; e.low = this.frogLow; e.lashDir = dirP;
        this.frogNextLash = this.t + 1.0;
        Sound.sfx('ribbit');
      }
    } else if (e.state === 'tell') {
      e.tellT -= dt; e.sacK = Math.min(1, 1 - e.tellT / 0.65);
      if (e.tellT <= 0) { e.state = 'lash'; e.tongue = 0; e.tongueT = 0; Sound.sfx('stretch'); }
    } else if (e.state === 'lash') {
      e.tongueT += dt;
      const L = 245, ext = 0.16, hold = 0.22, back = 0.3;
      e.tongue = e.tongueT < ext ? L * e.tongueT / ext : (e.tongueT < ext + hold ? L : L * Math.max(0, 1 - (e.tongueT - ext - hold) / back));
      // does it catch Chris? (anywhere along its length, at its height)
      const th = e.low ? 14 : 32, along = angDiff(P.theta, e.theta) * R * e.lashDir;
      const pc = P.h + (P.duck ? 10 : 22), pr = P.duck ? 9 : 12;
      if (e.tongueT < ext + hold && along > 0 && along < e.tongue + 6 && Math.abs(th - pc) < pr + 3 && P.invuln <= 0 && !P.grabbed && this.state === 'play') {
        e.state = 'grab'; P.grabbed = e; P.mash = 0; e.grabHp = e.hp; Sound.sfx('squelch'); buzz([40, 30, 40]);
        this.banner('GRABBED! MASH JUMP!');
      }
      if (e.tongueT >= ext + hold + back) { e.state = 'sit'; e.lashCd = rnd(1.8, 2.6); e.tongue = 0; }
    } else if (e.state === 'grab') {
      // reel him in
      const along = Math.abs(angDiff(P.theta, e.theta)) * R;
      e.tongue = along;
      P.theta = wrap(P.theta - e.lashDir * 175 / R * dt); P.vx = 0; P.vh = Math.min(P.vh, 0); P.h = Math.max(0, P.h - 300 * dt);
      if (P.mash >= 3) {                                          // broke free!
        this.releaseGrab(false); P.vh = 360; this.frogStun(e, 0.9); this.banner('BROKE FREE!'); Sound.sfx('jump'); buzz(30);
      } else if (e.hp <= e.grabHp - 2) {                          // shot in the open mouth: lets go
        this.releaseGrab(false); this.frogStun(e, 1.1); this.banner('LET GO!');
      } else if (along < e.r + 16) {                              // CHOMP
        this.releaseGrab(true); this.hurt(); e.state = 'sit'; e.lashCd = 2.2; Sound.sfx('bonk');
      }
    } else if (e.state === 'pounce') {
      if (grounded && e.t > 0.2) {                                 // lands: a splash either side, then flops over stunned
        Sound.sfx('squelch'); this.cameras.main.shake(90, 0.005);
        if (distP < 400) for (const sd of [-1, 1]) this.addEBullet('spore', wrap(e.theta + sd * 20 / R), 8, sd * 180, 0, 9, 1.1);
        this.frogStun(e, 0.95);
      }
    } else if (e.state === 'stun') {
      e.stunT -= dt; e.leapV = 0;
      if (e.stunT <= 0) { e.state = 'sit'; e.spr.setFlipY(false); e.lashCd = Math.max(e.lashCd, 0.8); }
    }
    e.theta = wrap(e.theta + ((e.leapV || 0) / R) * dt);
    e.vh -= this.gAt(e.theta) * dt;
    e.h += e.vh * dt;
    if (e.h <= 0) { e.h = 0; if (e.vh < 0) e.vh = 0; if (e.state === 'approach') e.leapV *= 0.5; }
    // which frame: leaping in the air, crouched just before a hop, mouth open for the tongue, blinking now and then
    let fr = 'frog';
    if (e.state === 'tell' || e.state === 'lash' || e.state === 'grab') fr = e.low ? 'frog_open_c' : 'frog_open';
    else if (e.h > 2 || e.state === 'pounce') fr = 'frog_leap';
    else if (e.state === 'approach' && (e.hopT || 0) < 0.08) fr = 'frog_crouch';
    else if (e.state === 'stun') fr = 'frog_blink';
    else if ((e.t + e.seed * 3) % 3.2 < 0.14) fr = 'frog_blink';
    if (e.spr.texture.key !== fr) e.spr.setTexture(fr);
    // body language: low tell = squat flat, high tell = rear up tall
    if (e.state === 'tell') { const k = e.sacK; e.spr.sqx = e.low ? 1 + 0.22 * k : 1 - 0.1 * k; e.spr.sqy = e.low ? 1 - 0.3 * k : 1 + 0.28 * k; }
    else if (e.state === 'lash' || e.state === 'grab') { e.spr.sqx = e.low ? 1.18 : 0.92; e.spr.sqy = e.low ? 0.75 : 1.22; }
    else { e.spr.sqx = 1; e.spr.sqy = 1 + Math.max(0, Math.min(0.15, e.vh / 3500)); }
  }

  // BARON VON BLUE: fast, in your face, with a spiked flail on a chain and an evil animated mouth.
  //  * the flail swings under him (don't camp below him)
  //  * WHIRL (0.8s, he grins, ball circles over his head) -> THROW straight at where you're going -> reels back in
  //  * he ROARS wide (mouth tell) then spits an aimed triple of spores; every so often he cackles
  //  * a spore ring now and then, and germ pals when angry (stink-flies too in phase 2)
  baronAI(e, dt, phase2, toP, distP) {
    const P = this.pl;
    if (!e.fl) e.fl = { st: 'hang', t: 0, a: 0, len: 95, cd: 2.5, n: 0 };
    if (!e.mouth) e.mouth = { f: 0, t: 0, cackleCd: 3 };
    const F = e.fl, M = e.mouth;
    F.t += dt; F.cd -= dt;
    const anchor = { theta: e.theta, h: e.h - 26 * (e.spr.bsy || 1) };          // his fist, under the body
    if (F.st === 'hang') {                                       // swinging pendulum below him
      F.len += (95 - F.len) * Math.min(1, dt * 6);          // low enough to clip him standing - DUCK under it
      F.a = Math.sin(F.t * 2.6) * 1.0 + (e.vx || 0) * -0.002;     // (trails behind as he moves)
      F.dx = Math.sin(F.a) * F.len; F.dy = -Math.cos(F.a) * F.len;
      if (F.cd <= 0 && distP < 420 && this.state === 'play') { F.st = 'whirl'; F.t = 0; M.f = 0; Sound.sfx('swish'); }
    } else if (F.st === 'whirl') {                               // the tell: whirling it over his head, faster and faster
      const sp = 6 + F.t * 12; F.a = (F.a || 0) + sp * dt; F.len = 62;
      F.dx = Math.cos(F.a) * F.len; F.dy = 30 + Math.sin(F.a) * F.len * 0.45;
      if (Math.floor(F.t * 6) !== Math.floor((F.t - dt) * 6)) Sound.sfx('swish');
      if (F.t > (phase2 ? 0.65 : 0.85)) {                         // HURL it at where Chris is heading
        const lead = (P.vx || 0) * 0.35, tx = angDiff(P.theta, e.theta) * R + lead, ty = (P.h + 20) - anchor.h;
        const d = Math.hypot(tx, ty) || 1, reach = Math.min(300, d + 30);
        F.st = 'throw'; F.t = 0; F.ux = tx / d; F.uy = ty / d; F.reach = reach; F.ox = F.dx; F.oy = F.dy;
        Sound.sfx('whoosh'); M.f = 2; M.t = 0.5;
      }
    } else if (F.st === 'throw') {
      const out = 0.32, hold = 0.18, back = 0.45;
      const k = F.t < out ? 1 - Math.pow(1 - F.t / out, 2) : (F.t < out + hold ? 1 : Math.max(0, 1 - (F.t - out - hold) / back));
      F.dx = F.ux * F.reach * k + F.ox * (1 - k); F.dy = F.uy * F.reach * k + F.oy * (1 - k); F.len = Math.hypot(F.dx, F.dy);
      if (F.t > out && F.t - dt <= out) { this.cameras.main.shake(90, 0.004); Sound.sfx('clang'); }
      if (F.t >= out + hold + back) {
        F.n++;
        if (phase2 && F.n % 2 === 1) { F.st = 'whirl'; F.t = 0.35; }          // angry: a second throw straight after
        else { F.st = 'hang'; F.t = 0; F.cd = phase2 ? 2.4 : 3.4; }
      }
    }
    // the ball: where it is, and does it hit Chris?
    F.theta = wrap(anchor.theta + F.dx / (R + anchor.h)); F.h = anchor.h + F.dy; F.ath = anchor.theta; F.ah = anchor.h;
    if (P.invuln <= 0 && this.state === 'play' && dist2(F.theta, F.h, P.theta, P.h + (P.duck ? 10 : 22)) < (15 + (P.duck ? 9 : 12)) ** 2) { this.hurt(); M.f = 1; M.cackle = 1.0; }

    // mouth: sneer by default; cackles now and then; roars wide before he spits
    M.t -= dt; M.cackleCd -= dt;
    if (M.cackle > 0) { M.cackle -= dt; M.f = Math.floor(M.cackle * 12) % 2 ? 1 : 2; if (M.cackle <= 0) M.f = 0; }
    else if (M.cackleCd <= 0 && F.st === 'hang') { M.cackle = 0.9; M.cackleCd = rnd(4.5, 7); Sound.sfx('cackle'); }
    else if (M.t <= 0 && M.f !== 0 && !(M.roar > 0)) M.f = 0;
    e.spitCd = (e.spitCd === undefined ? 3 : e.spitCd) - dt;
    if (e.spitCd <= 0.45 && !(M.roar > 0) && e.spitCd > 0) { M.roar = 0.45; M.f = 2; Sound.sfx('growl'); }    // the tell: jaw drops
    if (M.roar > 0) M.roar -= dt;
    if (e.spitCd <= 0) {                                         // from the mouth: an aimed triple of spores
      e.spitCd = phase2 ? 2.4 : 3.4; M.roar = 0; M.t = 0.25;
      const mh = e.h - 18 * (e.spr.bsy || 1), ex = angDiff(P.theta, e.theta) * R, ey = P.h + 24 - mh, v = phase2 ? 250 : 220, a0 = Math.atan2(ey, ex);
      for (const da of [-0.2, 0, 0.2]) this.addEBullet('spore', e.theta, mh, Math.cos(a0 + da) * v, Math.sin(a0 + da) * v, 10, 3);
      Sound.sfx('zing');
    }
    if (e.fanCd <= 0) {                                          // a spore ring
      e.fanCd = phase2 ? 5 : 6.5; Sound.sfx('fan'); M.f = 1; M.t = 0.4;
      const n = phase2 ? 10 : 8, off = rnd(0, 1);
      for (let k = 0; k < n; k++) { const a = ((k + off) / n) * TAU; this.addEBullet('spore', e.theta, e.h, 150 * Math.sin(a), 150 * Math.cos(a), 11, 2.4); }
    }
    if (e.sumCd <= 0 && phase2 && this.enemies.length < 6) {     // angry: calls in pals
      e.sumCd = 7;
      for (const sd of [-1, 1]) { const c = this.makeEnemy(sd > 0 ? 'stinkfly' : 'germ', wrap(e.theta + sd * 0.08), sd); if (c.kind !== 'flyer') { c.h = e.h; c.vh = 120; } this.enemies.push(c); }
    }
    e.rainCd = 99;                                               // (no more spore rain from the sky)
    // drool
    e.droolT = (e.droolT || 0) - dt;
    if (e.droolT <= 0) { e.droolT = rnd(0.5, 1.2); const im = this.add.image(0, 0, 'goopbub').setDepth(6.3); im.bsx = im.bsy = 0.7; this.parts.push({ theta: wrap(e.theta + 14 / R), h: e.h - 26 * (e.spr.bsy || 1), vt: 0, vh: -20, life: 0.6, spr: im }); }
  }

  // the Baron's overlays: animated mouth, pupils that follow Chris, chain + spiked ball
  drawBaron(e) {
    const k = e.spr.bsx || 1, z = this.zoom, P = this.pl;
    if (!e.ov) {
      e.ov = { mouth: this.add.image(0, 0, 'baron_m0').setDepth(6.1), pl: this.add.image(0, 0, 'baron_pupil').setDepth(6.1), pr: this.add.image(0, 0, 'baron_pupil').setDepth(6.1),
        ball: this.add.image(0, 0, 'spikeball').setDepth(6.3), chain: this.add.graphics().setDepth(5.9) };
    }
    const O = e.ov, rot = Math.sin(e.t * 1.5) * 0.08, M = e.mouth || { f: 0 };
    const atOff = (o, ox, oy, extra) => { this.place(o, wrap(e.theta + ox * k / (R + e.h)), e.h - oy * k, rot + (extra || 0)); o.setScale(o.scaleX * k, o.scaleY * k); };
    O.mouth.setTexture('baron_m' + (M.f || 0)).setOrigin(0.5, 0.3);
    atOff(O.mouth, 1, 18 + (M.f === 2 ? 1 : 0) + (M.cackle > 0 ? Math.sin(this.t * 40) : 0));
    const lookX = Math.max(-3, Math.min(3, angDiff(P.theta, e.theta) * R * 0.03)), lookY = Math.max(-2, Math.min(3, (e.h - P.h) * 0.02));
    atOff(O.pl, -16 + lookX, 3 + lookY); atOff(O.pr, 18 + lookX, 3 + lookY);
    for (const o of [O.mouth, O.pl, O.pr]) { o.setAlpha(e.spr.alpha); if (e.flash > 0) o.setTintFill(0xffffff); else o.clearTint(); }
    const F = e.fl;
    O.chain.clear();
    if (F && F.theta !== undefined) {
      this.place(O.ball, F.theta, F.h, F.t * 8);
      const a = this.screenPos(F.ath, F.ah), b = this.screenPos(F.theta, F.h), n = Math.max(3, Math.ceil(F.len / 9));
      for (let i = 1; i < n; i++) { const t = i / n, x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t + Math.sin(t * Math.PI) * (F.st === 'hang' ? 4 : 1) * z;
        O.chain.fillStyle(0x1a1020, 1).fillCircle(x, y, 3.2 * z).fillStyle(0xa8b0c0, 1).fillCircle(x, y, 2.2 * z); }
    }
  }

  // tongues + throat sacs (drawn along the curve of the planet)
  drawTongues() {
    if (!this.tongueG) this.tongueG = this.add.graphics().setDepth(5.5);
    const g = this.tongueG; g.clear();
    for (const e of this.enemies) {
      if (e.kind !== 'frog' || e.hp <= 0) continue;
      const mouthH = e.low ? 14 : 32;
      if (e.state === 'tell' && e.sacK > 0) {                    // the throat sac swells: green = low, pink = high
        const s = this.screenPos(wrap(e.theta + e.lashDir * 12 / R), e.low ? 10 : 26); if (!s.vis) continue;
        const r = (3 + 8 * e.sacK) * this.zoom;
        g.fillStyle(0x1a1020, 1).fillCircle(s.x, s.y, r + 1.5);
        g.fillStyle(e.low ? 0x8aff6a : 0xff7ab0, 1).fillCircle(s.x, s.y, r);
        g.fillStyle(0xffffff, 0.8).fillCircle(s.x - r * 0.35, s.y - r * 0.35, r * 0.25);
      }
      if ((e.state === 'lash' || e.state === 'grab') && e.tongue > 2) {
        const n = Math.max(2, Math.ceil(e.tongue / 12)), pts = [];
        for (let k = 0; k <= n; k++) { const a = wrap(e.theta + e.lashDir * (12 + (e.tongue - 12) * k / n) / R); pts.push(this.screenPos(a, mouthH + Math.sin(k * 0.9 + this.t * 30) * (e.state === 'grab' ? 1.5 : 0))); }
        if (e.state === 'grab') pts[n] = this.screenPos(this.pl.theta, this.pl.h + (this.pl.duck ? 10 : 22));
        g.lineStyle(7 * this.zoom, 0x1a1020, 1).beginPath(); g.moveTo(pts[0].x, pts[0].y); for (const p of pts) g.lineTo(p.x, p.y); g.strokePath();
        g.lineStyle(4.5 * this.zoom, 0xff6a96, 1).beginPath(); g.moveTo(pts[0].x, pts[0].y); for (const p of pts) g.lineTo(p.x, p.y); g.strokePath();
        g.lineStyle(1.5 * this.zoom, 0xffb8cc, 1).beginPath(); g.moveTo(pts[0].x, pts[0].y); for (const p of pts) g.lineTo(p.x, p.y - 1); g.strokePath();
        const t = pts[n]; g.fillStyle(0x1a1020, 1).fillCircle(t.x, t.y, 6 * this.zoom); g.fillStyle(0xff4a7a, 1).fillCircle(t.x, t.y, 4.5 * this.zoom);
      }
    }
  }

  // SAVED FOR LATER: the telekinesis ray (was on the L2 rat-frogs). An enemy stops, flashes purple, then streams
  // 10 psychic orbs along one big lobbed arc that lands where Chris will be. Call psyRayStart(e) from any enemy's AI,
  // then psyRayUpdate(e, dt) every frame while e.psy is set (returns true when finished).
  psyRayStart(e, toP) {
    const P = this.pl, air = 1.25, g = 430, dx = toP * R + (P.vx || 0) * air * 0.4;
    e.psy = { t: 0.55, n: 10, gap: 0, vt: Math.max(-360, Math.min(360, dx / air)), vh: 0.5 * g * air + (P.h + 20 - (e.h + e.ch + 8)) / air, g };
    Sound.sfx('psy');
  }
  psyRayUpdate(e, dt) {
    const S = e.psy; if (!S) return true;
    S.t -= dt; e.spr.setTint(Math.floor(e.t * 16) % 2 ? 0xd890ff : 0xffffff);
    if (S.t <= 0 && S.n > 0) { S.gap -= dt; if (S.gap <= 0) { S.gap = 0.045; S.n--; const b = this.addEBullet('psyorb', e.theta, e.h + e.ch + 8, S.vt, S.vh, 8, 2.6); b.grav = S.g * Settings.dk.shot * Settings.dk.shot; b.spinV = 8; } }
    if (S.n <= 0) { e.psy = null; e.spr.clearTint(); return true; }
    return false;
  }

  goopSplash(theta) {
    for (let k = 0; k < 7; k++) {
      const im = this.add.image(0, 0, 'goopbub').setDepth(7.7); im.bsx = im.bsy = rnd(0.8, 1.5);
      this.parts.push({ theta, h: 6, vt: rnd(-120, 120), vh: rnd(150, 300), life: rnd(0.35, 0.6), spr: im });
    }
  }

  // bouncing off a head refuels the jetpack (half a tank) and re-arms it: keep holding jump and it lights as you rise
  stompBoost() {
    const P = this.pl, before = P.fuel;
    P.fuel = Math.min(1, P.fuel + 0.5);
    P.jetArmed = true; P.holdT = CFG.jetHoldDelay + 1; P.airRegenT = 0;
    if (P.fuel > before + 0.05) { Sound.sfx('charged'); this.popup(P.theta, P.h + 60, 'BOOST!', '#5ce1ff'); this.fuelFlash = 0.35; }
  }

  // shove an enemy away from a point (bosses don't budge, big ones only a little)
  knock(e, fromTheta, v) {
    if (e.type === 'boss' || e.noKnock) return;
    const s = Math.sign(angDiff(e.theta, fromTheta)) || (this.pl.facing || 1);
    e.kb = (e.kb || 0) + s * v * (e.big ? 0.35 : 1);
    if (Math.abs(e.kb) > 420) e.kb = Math.sign(e.kb) * 420;
  }

  // little floating score numbers (pooled text objects)
  popup(theta, h, str, col, big) {
    let t = this.popPool.pop();
    if (!t) t = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '8px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 3 }).setOrigin(0.5).setDepth(19);
    t.setText(str).setColor(col || '#ffffff').setVisible(true).setAlpha(1);
    t.bsx = t.bsy = big ? 1.5 : 1;
    this.popups.push({ theta, h, vh: 70, life: big ? 1.2 : 0.8, t });
  }

  updatePopups(dt) {
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.h += p.vh * dt; p.vh *= Math.exp(-3 * dt); p.life -= dt;
      if (p.life <= 0) { p.t.setVisible(false); this.popPool.push(p.t); this.popups.splice(i, 1); continue; }
      this.place(p.t, p.theta, p.h, 0);
      p.t.setAlpha(Math.min(1, p.life * 4));
      const pop = Math.max(0, p.life - (p.t.bsx > 1 ? 1.0 : 0.6)) * 6;            // pops in big then settles
      p.t.setScale(p.t.scaleX * (1 + pop), p.t.scaleY * (1 + pop));
    }
  }

  // kill streaks: kills close together build a combo that multiplies the score
  comboKill() {
    this.combo = this.comboT > 0 ? this.combo + 1 : 1;
    this.comboT = 1.6;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    if (this.combo >= 3) {
      if (!this.comboText) this.comboText = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '10px', color: '#ff9d3a', stroke: '#1a1020', strokeThickness: 4 }).setOrigin(0.5, 0).setDepth(20);
      this.comboText.setText(this.combo + ' COMBO' + (this.comboMult() > 1 ? '  x' + this.comboMult() : '')).setAlpha(1).setScale(1.5);
      this.tweens.add({ targets: this.comboText, scale: 1, duration: 140, ease: 'Back.Out' });
      if (this.combo % 5 === 0) { Sound.sfx('charged'); buzz(15); }
    }
  }
  comboMult() { return this.combo >= 15 ? 4 : this.combo >= 10 ? 3 : this.combo >= 5 ? 2 : 1; }

  // is there anything in front of Chris that a bash would connect with?
  bashTargetNear() {
    const P = this.pl, dir = P.facing || 1, cy = P.h + (P.duck ? 28 : 34), reachT = CFG.bashRange / R;
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      const a = angDiff(e.theta, P.theta) * dir;
      if (a < -14 / R || a > reachT + e.r / R + 10 / R) continue;
      if (Math.abs(e.h + e.ch - cy) > e.r + 34) continue;
      return true;
    }
    return !!(this.relics && this.relics.some(r => Math.abs(angDiff(r.theta, P.theta)) * R < CFG.bashRange + 10 && Math.abs(r.h - cy) < 50));
  }

  bashHit() {
    const P = this.pl, dir = P.facing || 1, cy = P.h + (P.duck ? 28 : 34);
    const reachT = CFG.bashRange / R;
    let hit = 0;
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      const a = angDiff(e.theta, P.theta) * dir;                           // how far in front (radians)
      if (a < -14 / R || a > reachT + e.r / R) continue;
      if (Math.abs(e.h + e.ch - cy) > e.r + 34) continue;
      e.hp -= e.type === 'boss' ? 3 : CFG.bashDmg; hit++;
      if (e.hp <= 0 && e.type !== 'boss' && ((ENEMY[e.type] && ENEMY[e.type].hp) || 0) >= 3 && !this.wheels.some(w => w.i === 2)) {   // bash-finish a tough one: wheel #3
        this.addWheel(2, e.theta, e.h + e.ch + 10); const w = this.wheels.find(w => w.i === 2); if (w) { w.vh = 300; w.rest = 24; }
      }
      e.flash = 0.08; e.flashCd = 0.15; e.spr.setTintFill(0xffffff); e.spr.hsq = 1;
      if (e.kind === 'frog' && e.hp > 0) this.frogStun(e, 1.1);        // bash cracks the slime: stunned and open
      if (e.type !== 'boss') { e.theta = wrap(e.theta + dir * 12 / R); this.knock(e, P.theta, 300); if (e.h > 0 || e.baseH) e.h += 18; }   // knocked back
      this.burst(e.theta, e.h + e.ch, 'spark', 8, 0.9);
      this.bang(e.theta, e.h + e.ch, 16);
    }
    if (this.relics && this.relics.length) hit += this.relicHit(wrap(P.theta + dir * reachT * 0.6), cy, CFG.bashRange * 0.5, CFG.bashDmg) ? 1 : 0;
    if (hit) {
      this.bashPop(wrap(P.theta + dir * reachT * 0.45), cy);
      Sound.sfx('bonk'); buzz([30, 20, 50]);
      this.hitStop = Math.max(this.hitStop || 0, 0.07); this.camKick(dir * 6, 2); this.camPunch(0.02);
      this.addLight(wrap(P.theta + dir * reachT * 0.5), cy, 70, 0xffe0a0, 0.8, 0.25);
    }
    this.reapEnemies();
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
  fire(tgt, o) {
    const P = this.pl;
    const W = this.weapon;
    o = o || {};
    if ((this.shotN = (this.shotN || 0) + 1) % W.sfxEvery === 0) Sound.sfx(W.sfx);
    let dx = P.facing * Math.cos(P.aimA || 0), dy = Math.sin(P.aimA || 0);    // aimed up/down with the right stick
    const M = this.muzzle;
    const gh = M ? M.h : P.h + (P.duck ? 29 : 40);   // shots leave the real muzzle (falls back to chest / crouch height)
    if (tgt) {
      let ex = angDiff(tgt.theta, P.theta) * R;
      let ey = tgt.h + tgt.ch - gh;
      const t0 = Math.hypot(ex, ey) / W.speed;              // lead the target
      ex += tgt.vx * t0;
      ey += Math.max(-150, Math.min(150, tgt.dh * t0));
      const len = Math.hypot(ex, ey) || 1;
      dx = ex / len; dy = ey / len;
      P.facing = ex >= 0 ? 1 : -1;
    }
    P.firing = 0.12;
    if (Pad.state.connected) Pad.pulse(90, 0.05, 0.3);          // a light buzz in the hands while the Mac-Grinder fires
    { const sp = this.screenPos(P.theta, P.h), z = this.zoom; this.fxBang.emitParticleAt(sp.x + P.facing * 74 * z, sp.y - (P.duck ? 29 : 40) * z, 1); }                      // keeps the drill-bit spinning for a moment
    const bt = M ? M.theta : wrap(P.theta + (Math.sign(dx) || 1) * (70 / R));
    if (W.lob && !W.aimed) { const fc = dx >= 0 ? 1 : -1, la = Math.max(0.15, Math.min(1.3, W.angle * (o.angleK || 1) + (P.aimA || 0) * 0.6)); dx = fc * Math.cos(la); dy = Math.sin(la); }      // the Swiss-Shot lobs upwards (aim tilts the arc)
    for (const a of (P.power > 0 ? [-0.2, 0, 0.2] : [0])) {      // Parmesan Power-Up = triple spread
      const c = Math.cos(a), s = Math.sin(a);
      const ux = dx * c - dy * s, uy = dx * s + dy * c;
      this.pBullets.push({
        bt, bh: gh, theta: bt, h: gh,
        vt: ux * W.speed * (o.speedK || 1), vh: uy * W.speed * (o.speedK || 1),
        px: -uy, py: ux, ph: rnd(0, TAU), age: 0,
        life: W.life * (o.lifeK || 1), wob: W.wobble, dmg: W.dmg, pierce: W.pierce, hits: W.pierce ? [] : null, grav: W.gravity || 0,
        blast: o.blast || W.blast || 0, blastDmg: o.blastDmg || W.blastDmg || 0, bossDmg: o.bossDmg,
        plough: !!W.plough, ploughDmg: o.ploughDmg || 4, minScale: (W.ballScale || 1) * 0.32,
        spr: (() => { const im = this.add.image(0, 0, W.shot).setDepth(8); im.bsx = im.bsy = (W.ballScale || 1) * (o.scaleK || 1); if (W.lob) bakedGlow(im, 0xffe27a, 2, 6); return im; })()
      });
    }
  }

  // world position of a point on the boss sprite (texture pixels from its top-left), so shots leave real cannons
  bossGun(e, tx, ty) {
    const k = e.spr.bsx || 1, ox = tx * k, oy = -(ty - 48) * k;            // croque texture is 160x96, origin at its centre
    const rot = e.spr.rotation - angDiff(e.theta, this.pl.theta);          // the sprite's own tilt on top of the world angle
    const rx = ox * Math.cos(rot) + oy * Math.sin(rot), ry = -ox * Math.sin(rot) + oy * Math.cos(rot);
    const flip = e.spr.flipX ? -1 : 1;
    return { theta: wrap(e.theta + (rx * flip) / (R + e.h)), h: e.h + ry };
  }
  muzzleFlash(theta, h) {
    const s = this.screenPos(theta, h);
    if (s.vis) for (let i = 0; i < 6; i++) this.fxBang.emitParticleAt(s.x, s.y, 1);
    this.addLight(theta, h, 60, 0xffa040, 0.8, 0.2);
  }

  // ---------------------------------------------------------------- modern FX layer
  camKick(x, y) { if (Settings.shake) { this.kick.vx += x * 22; this.kick.vy += y * 22; } }          // directional camera knock (springs back)
  camPunch(a) { if (Settings.shake) this.punch = Math.max(this.punch, a); }                        // quick zoom-in punch on big impacts
  addLight(theta, h, r, col, a, life) { if (Settings.lights && this.lights.length < 30) this.lights.push({ theta, h, r, col, a, life, max: life }); }
  fxTick(dt) {
    const K = this.kick;                                                         // spring the camera kick back to centre
    K.vx += (-K.x * 260 - K.vx * 18) * dt; K.vy += (-K.y * 260 - K.vy * 18) * dt;
    K.x += K.vx * dt; K.y += K.vy * dt;
    this.punch = Math.max(0, this.punch - dt * 0.35);
    const cam = this.cameras.main;
    if (this.goCam) { cam.setZoom(this.goCam.z); cam.centerOn(this.goCam.x, this.goCam.y); }     // game over push-in
    else { cam.setScroll(Math.round(K.x), Math.round(K.y)); cam.setZoom(1 + this.punch); }
    for (let i = this.lights.length - 1; i >= 0; i--) { this.lights[i].life -= dt; if (this.lights[i].life <= 0) this.lights.splice(i, 1); }
    for (const e of this.enemies) if (e.spr.hsq > 0) e.spr.hsq = Math.max(0, e.spr.hsq - dt * 7);
  }
  // soft additive light halos (the "next-gen" layer over the pixel art): brightens whatever is near a light source
  drawLights() {
    if (!Settings.lights) { for (const im of this.lightPool) im.setVisible(false); return; }
    makeHalo(this);
    const P = this.pl, L = [];
    for (const l of this.lights) L.push([l.theta, l.h, l.r, l.col, l.a * (l.life / l.max)]);
    for (const lv of (this.lavas || [])) if (Math.abs(angDiff(lv.theta, P.theta)) < 1.2) L.push([lv.theta, lv.h + 6, 70, 0xff7a1a, 0.22 + 0.08 * Math.sin(this.t * 4 + lv.ph)]);
    for (const G of (this.geysers || [])) if (Math.abs(angDiff(G.theta, P.theta)) < 1.2) {
      if (G.st === 'erupt') L.push([G.theta, 70, 150, 0xff9a2a, 0.55 + 0.1 * Math.sin(this.t * 30)]);
      else if (G.st === 'warn') L.push([G.theta, 10, 70, 0xff7a1a, 0.25 + 0.2 * Math.abs(Math.sin(this.t * 14))]);
    }
    if (this.muzzle && (P.firing > 0 || P.beamOn)) L.push([this.muzzle.theta, this.muzzle.h, P.beamOn ? 60 : 45, 0xffd27a, 0.35 + Math.random() * 0.15]);
    if (P.power > 0) L.push([P.theta, P.h + 30, 60, 0xfff3a0, 0.18]);
    for (const pk of this.pickups) if (pk.kind === 'power') L.push([pk.theta, pk.h + 8, 50, 0xfff3a0, 0.3]);
    const A = this.abduct; if (A && A.theta !== undefined && A.a > 0.05) L.push([A.theta, A.h - 70, 110, 0xffd23f, 0.22 * A.a]);
    const z = this.zoom;
    while (this.lightPool.length < L.length) this.lightPool.push(this.add.image(0, 0, 'halo').setBlendMode(Phaser.BlendModes.ADD).setDepth(9.6));
    this.lightPool.forEach((im, i) => {
      const l = L[i];
      if (!l) { im.setVisible(false); return; }
      const sp = this.screenPos(l[0], l[1]);
      im.setVisible(sp.vis).setPosition(sp.x, sp.y).setScale(l[2] * 2 * z / 128).setTint(l[3]).setAlpha(Math.max(0, Math.min(1, l[4])));
    });
    // heat haze rising off the geysers
    this.hazeT -= this.lastDt || 0.016;
    if (this.hazeT <= 0 && this.geysers && this.geysers.length) {
      this.hazeT = 0.12;
      for (const G of this.geysers) if (Math.abs(angDiff(G.theta, P.theta)) < 1) { const sp = this.screenPos(G.theta, 6); this.fxHaze.emitParticleAt(sp.x, sp.y, G.st === 'idle' ? 1 : 3); }
    }
  }

  // Swiss-Shot burst: hurts everything within the blast radius
  swissBlast(theta, h, rad, dmg, bossDmg) {
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      const d = Math.sqrt(dist2(theta, h, e.theta, e.h + e.ch));
      if (d > rad + e.r) continue;
      const full = d < rad * 0.55 + e.r;
      e.hp -= (e.type === 'boss' ? (bossDmg || dmg) : dmg) * (full ? 1 : 0.6) * this.hitK(e);
      this.knock(e, theta, full ? 240 : 130);
      if (!(e.flashCd > 0)) { e.flash = 0.06; e.flashCd = 0.15; e.spr.setTintFill(0xffffff); e.spr.hsq = 1; }
    }
    if (this.relics.length) this.relicHit(theta, h, rad, dmg);
    // big cheesy splat: shockwave ring, chunks, sparks, a puddle left on the ground
    const s = this.screenPos(theta, h + 4), z = this.zoom;
    this.blastFx.push({ theta, h, rad, t: 0 });            // shockwave drawn in planet coordinates (see drawBlastFx), so it bends with the surface
    this.bang(theta, h + 6, 60);
    this.burst(theta, h + 6, 'crumb', 26, 1.8);
    for (let k = 0; k < 6; k++) { const im = this.add.image(0, 0, 'swissball').setDepth(9); im.bsx = im.bsy = rnd(0.5, 0.9);   // flying cheese chunks
      this.parts.push({ theta, h: h + 8, vt: rnd(-260, 260), vh: rnd(250, 520), life: rnd(0.6, 1), spr: im }); }
    for (let k = 0; k < 18; k++) this.fxBang.emitParticleAt(s.x + rnd(-10, 10) * z, s.y + rnd(-10, 10) * z, 1);
    if (h < 30) this.puddles.push({ theta, rad, t: 0, life: 2.6 });   // landed: a melted-cheese smear that hugs the curve of the ground, then fades
    this.cameras.main.shake(160 + rad * 0.6, 0.006 + rad * 0.00005);       // bigger blast, bigger shake
    this.hitStop = Math.max(this.hitStop || 0, 0.08); this.camPunch(0.035);
    this.addLight(theta, h + 10, rad * 1.6, 0xffe080, 1, 0.45);
    Sound.sfx('boom'); buzz([60, 30, 90]);
  }

  // the spaghetti stream runs along the curve of the planet at gun height, from the nozzle forwards
  beamGeom(W) {
    const P = this.pl, dir = P.facing || 1, M = this.muzzle;
    const gh = M ? M.h : P.h + (P.duck ? 29 : 40);
    const aa = P.aimA || 0, t0 = M ? M.theta : wrap(P.theta + dir * (70 / R)), rng = W.range * (P.beamReach || 1), span = rng * Math.cos(aa) / (R + gh);
    return { dir, gh, t0, span, rise: rng * Math.sin(aa), band: P.power > 0 ? 20 : 11 };
  }
  beamHit(W) {
    const B = this.beamGeom(W);
    let hitAny = false;
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      const a = angDiff(e.theta, B.t0) * B.dir;
      if (a < -e.r / R || a > B.span) continue;
      const f = Math.max(0, a / B.span), sag = f * f * (W.droop || 0);       // the noodle droops, so check its height there
      if (Math.abs(e.h + e.ch - (B.gh + B.rise * f - sag)) > e.r + B.band) continue;
      if (this.hitK(e) === 0) { this.deflect(e, e.theta, e.h + e.ch); hitAny = true; continue; }
      e.hp -= (e.type === 'boss' ? (W.bossDmg || W.dmg) : W.dmg) * this.hitK(e); hitAny = true; if (this.buffOn('sauce')) e.burn = 2;
      if (!(e.flashCd > 0)) { e.flash = 0.05; e.flashCd = 0.15; e.spr.setTintFill(0xffffff); e.spr.hsq = 1; }
      this.burst(e.theta, B.gh, 'spark', 2, 0.4);
    }
    for (const r of this.relics) {
      if (r.hp <= 0) continue;
      const a = angDiff(r.theta, B.t0) * B.dir;
      if (a < -r.r / R || a > B.span) continue;
      const f = Math.max(0, a / B.span), sag = f * f * (W.droop || 0);
      if (Math.abs(r.h - (B.gh + B.rise * f - sag)) <= r.r + B.band) this.relicHit(r.theta, r.h, 1, W.dmg);
    }
    if (hitAny) Sound.sfx('hit');
    this.reapEnemies();
  }
  drawBeam() {
    if (!this.beamG) { this.beamG = this.add.graphics().setDepth(8); try { if (Settings.glow && this.beamG.postFX) this.beamG.postFX.addGlow(0xffd23f, 2, 0, false, 0.1, 8); } catch (e) { /* ignore */ } }
    const g = this.beamG;
    g.clear();
    const P = this.pl;
    if (!P.beamOn) return;
    const W = this.weapon, B = this.beamGeom(W), z = this.zoom, pts = [];
    const n = 36, thick = P.power > 0 ? 1.6 : 1, solid = Math.round(n * 0.62);
    for (let i = 0; i <= n; i++) {
      const f = i / n, th = wrap(B.t0 + B.dir * B.span * f);
      const wv = (Math.sin(this.t * 34 - f * 22) * (2 + f * 4) + Math.sin(this.t * 11 + f * 7) * 1.5) * Math.min(1, f * 6);   // wobbly, pinned at the nozzle
      pts.push(this.screenPos(th, B.gh + B.rise * f + wv - f * f * (W.droop || 0)));                                                        // droops under its own weight
    }
    if (this.muzzle) { pts[0] = { x: this.muzzle.x, y: this.muzzle.y }; }
    const strand = (a, b, w, c) => { g.lineStyle(Math.max(1, Math.round(w * z * thick)), c, 1); g.beginPath(); g.moveTo(pts[a].x, pts[a].y); for (let i = a + 1; i <= b; i++) g.lineTo(pts[i].x, pts[i].y); g.strokePath(); };
    const seg = (a, b, sc) => { strand(a, b, 9 * sc, 0x1a1020); strand(a, b, 6 * sc, 0xffb52a); strand(a, b, 3 * sc, 0xffe27a); };
    seg(0, solid, 1);                                                                                                  // the solid stream
    const flick = Math.floor(this.t * 20);
    for (let i = solid + 1, k = 0; i < n; i += 2, k++) {                                                               // then it breaks up into bits
      if ((i + flick) % 5 === 0) continue;                                                                             // gaps flicker as it crumbles
      seg(i, Math.min(n, i + 1), Math.max(0.45, 1 - k * 0.12));
    }
    for (let i = 3; i < solid; i += 6) { const p = pts[i]; g.fillStyle(0xfff4c4, 1).fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 2, 2); }   // glints
    for (let k = 0; k < 2; k++) { const p = pts[solid + Math.floor(Math.random() * (n - solid))]; this.fxNoodle.emitParticleAt(p.x, p.y, 1); }   // crumbs falling off the end
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
    if (type === 'boss') { Sound.sfx('bossIn'); Sound.music(this.def.bossMusic || 'boss'); buzz(150); this.showBossCard(); }
    return e;
  }

  // a fighting-game style name card when the boss arrives
  showBossCard() {
    if (this.bossCard) this.bossCard.destroy();
    const W = this.W, H = this.H, y = H * 0.8, c = this.add.container(0, 0).setDepth(25);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.7).fillRect(0, y - 30, W, 60);
    g.fillStyle(0xffd23f, 1).fillRect(0, y - 30, W, 3).fillRect(0, y + 27, W, 3);
    const sm = this.add.text(W / 2, y - 16, 'WARNING!  BOSS APPROACHING', { fontFamily: PIXEL, fontSize: '8px', color: '#ff8a6a', stroke: '#1a1020', strokeThickness: 3 }).setOrigin(0.5);
    const nm = this.add.text(W / 2, y + 6, this.def.bossName, { fontFamily: PIXEL, fontSize: (this.def.bossName.length > 20 ? 14 : 18) + 'px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 5 }).setOrigin(0.5);
    c.add([g, sm, nm]);
    c.x = W; nm.x += 60;
    this.tweens.add({ targets: c, x: 0, duration: 260, ease: 'Cubic.Out' });
    this.tweens.add({ targets: nm, x: W / 2, duration: 1800, ease: 'Linear' });
    this.tweens.add({ targets: sm, alpha: 0.3, duration: 180, yoyo: true, repeat: 5 });
    this.tweens.add({ targets: c, x: -W, delay: 2000, duration: 260, ease: 'Cubic.In', onComplete: () => { c.destroy(); if (this.bossCard === c) this.bossCard = null; } });
    this.cameras.main.shake(300, 0.006);
    this.bossCard = c;
  }

  // Build an enemy object. Sprites are drawn a bit bigger than their art; hitboxes grow less so it stays fair.
  makeEnemy(type, theta, side) {
    let st, tex, oy, k;
    if (type === 'boss') {
      const b = this.def.boss;
      st = { hp: b.hp, r: 54, ch: 0, drop: 0 }; tex = b.tex; oy = 0.5; k = b.scale || 1.12;
    } else {
      st = ENEMY[type]; tex = st.tex; oy = st.oy; k = 1.22;
    }
    const e = {
      type, theta, h: type === 'boss' ? 240 : 0, vh: 0, hp: st.hp * Settings.dk.hp, maxHp: st.hp * Settings.dk.hp, r: st.r * (1 + (k - 1) * 0.5), ch: st.ch * k,
      big: !!st.big, drop: st.drop,
      spr: this.add.image(0, 0, tex).setOrigin(0.5, oy).setDepth(type === 'boss' ? 6 : 5),
      t: 0, seed: rnd(0, 6), flash: 0, vx: 0, dh: 0, dir: -(side || 1)
    };
    e.spr.bsx = e.spr.bsy = k;
    e.kind = type === 'boss' ? 'boss' : ((ENEMY[type] && ENEMY[type].ai) || type);   // which behaviour it uses (new enemies reuse old ones)
    const kind = e.kind;
    if (type === 'boss') {
      e.ai = this.def.boss.ai; e.rainCd = 1.5; e.fanCd = 3; e.sumCd = 5; e.dir = 1;
      if (e.ai === 'wheel') { e.h = 54; e.roll = 0; e.v = 0; }
      if (this.def.boss.tint) { e.baseTint = this.def.boss.tint; e.spr.setTint(e.baseTint); }
    } else if (kind === 'flyer') {
      e.h = e.baseH = rnd(110, 270); e.bombCd = rnd(0.8, 1.8);
    } else if (kind === 'mouse' || kind === 'germ' || kind === 'minigerm') {
      e.hopCd = rnd(0.2, 1);
    } else if (kind === 'golem') {
      e.shootCd = rnd(0.8, 1.6); e.volley = 0;
    } else if (kind === 'frog') {
      e.state = 'idle'; e.cd = rnd(0.6, 1.4); e.leapV = 0;
    } else if (kind === 'drone') {
      e.h = e.baseH = rnd(100, 210); e.state = 'hover'; e.cd = rnd(1.4, 2.4); e.tx = 0; e.ty = 0;
    } else if (kind === 'slicer') {
      e.shootCd = rnd(1.4, 2.4); e.roll = 0; e.flipCd = rnd(3, 6);
    }
    return e;
  }

  updateEnemies(dt) {
    const P = this.pl;
    for (const e of this.enemies) {
      const pt = e.theta, ph = e.h;
      e.t += dt;
      if (e.kb) {                                        // knockback from hits: a shove that dies away quickly
        e.theta = wrap(e.theta + e.kb / R * dt); e.kb *= Math.exp(-11 * dt);
        if (Math.abs(e.kb) < 3) e.kb = 0;
      }
      const toP = angDiff(P.theta, e.theta);
      const fooled = e.type !== 'boss' && this.buffOn('disguise');
      const distP = fooled ? 9999 : Math.abs(toP) * R;
      if (e.fdir === undefined || distP > 16) e.fdir = toP >= 0 ? 1 : -1;      // keep facing when right next to Chris: no flip flicker
      if (fooled && !e.wdir) e.wdir = Math.random() < 0.5 ? -1 : 1;
      const dirP = fooled ? e.wdir : e.fdir;
      if (e.burn > 0) {                                  // Hot Sauce: on fire for a bit
        e.burn -= dt; e.burnT = (e.burnT || 0) - dt;
        if (e.burnT <= 0) { e.burnT = 0.3; e.hp -= (e.type === 'boss' ? 0.5 : 0.7) * (e.kind === 'frog' ? 0.5 : 1); this.burst(e.theta, e.h + e.ch, 'flame', 2, 0.5); }
      }
      const ai = e.kind || e.type;
      if (e.type === 'phantom') e.spr.setAlpha(0.6 + 0.3 * Math.sin(e.t * 5 + e.seed));     // ghostly flicker

      if (ai === 'mouse') {
        const grounded = e.h <= 0 && e.vh <= 0;
        const sp = 85 + 35 * Math.sin(e.t * 7 + e.seed);
        e.theta = wrap(e.theta + (dirP * sp / R) * dt);
        e.dir = dirP;
        e.hopCd -= dt;
        if (grounded && e.hopCd <= 0) { e.vh = rnd(280, 430); e.hopCd = rnd(0.5, 1.4); }
        e.vh -= this.gAt(e.theta) * dt;
        e.h += e.vh * dt;
        if (e.h <= 0) { e.h = 0; if (e.vh < 0) e.vh = 0; }

      } else if (ai === 'flyer') {
        const want = e.baseH + Math.sin(e.t * 2 + e.seed) * 28;
        e.h += (want - e.h) * Math.min(1, dt * 3);
        const hold = 90 + Math.sin(e.t * 0.7 + e.seed) * 70;
        const mv = distP > hold ? dirP : -dirP * 0.6;
        e.theta = wrap(e.theta + (mv * 105 / R) * dt);
        e.dir = dirP;
        e.bombCd -= dt;
        if (e.bombCd <= 0 && distP < 230) {
          if (e.type === 'stinkfly') {                   // spore bomb: a lob that leads Chris, and a stink puff either side
            this.addEBullet('spore', e.theta, e.h, dirP * 70 + (P.vx || 0) * 0.35, -150, 11, 3).grav = 120;
            e.bombCd = rnd(2.0, 3.0);
          } else {
            this.addEBullet('cube', e.theta, e.h, dirP * 40, -190, 9, 3);
            e.bombCd = rnd(1.5, 2.5);
          }
          Sound.sfx('cube');
        }

      } else if (ai === 'golem') {
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

      } else if (ai === 'germ' || ai === 'minigerm') {
        // fuzzy bacteria: slow squelchy hops (floaty in the green spore clouds)
        const grounded = e.h <= 0 && e.vh <= 0;
        const mini = e.type === 'minigerm';
        e.theta = wrap(e.theta + (dirP * (mini ? 95 : 55) / R) * dt);
        e.dir = dirP;
        e.hopCd -= dt;
        if (grounded && e.hopCd <= 0) { e.vh = mini ? rnd(260, 360) : rnd(340, 500); e.hopCd = mini ? rnd(0.4, 0.9) : rnd(0.9, 1.7); }
        if (!mini) {                                     // big germs spit an arcing spore glob at Chris (a red flash warns first)
          e.spitCd = (e.spitCd === undefined ? rnd(2.5, 4.5) : e.spitCd) - dt;
          if (e.spitCd < 0.35 && e.spitCd + dt >= 0.35 && distP < 280) { e.spr.setTintFill(0xff6060); e.flash = 0.12; }
          if (e.spitCd <= 0) {
            e.spitCd = rnd(3.4, 5);
            if (distP < 280 && !fooled) {
              const ex = toP * R, air = 1.0, vt = Math.max(-260, Math.min(260, ex / air)), vh = 300;
              this.addEBullet('spore', e.theta, e.h + e.ch, vt, vh, 10, 3).grav = 2 * vh / air;
              Sound.sfx('cube'); e.spr.hsq = 1;
            }
          }
        }
        e.vh -= this.gAt(e.theta) * dt;
        e.h += e.vh * dt;
        if (e.h <= 0) { e.h = 0; if (e.vh < 0) e.vh = 0; }
        e.spr.sqx = 1 + Math.sin(e.t * 9) * 0.05; e.spr.sqy = 1 - Math.sin(e.t * 9) * 0.05;

      } else if (ai === 'frog') {
        this.frogAI(e, dt, toP, distP, dirP, fooled);

      } else if (ai === 'drone') {
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

      } else if (ai === 'slicer') {
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
        if (e.ai !== 'wheel') {
          const baron = e.ai === 'baron';
          const target = P.theta + (baron ? Math.sin(e.t * 0.9) * 75 / R : Math.sin(e.t * 0.5) * 0.3);      // the Baron hunts you down, weaving over your head
          const maxV = baron ? (e.hp < e.maxHp * 0.5 ? 270 : 225) / R : (e.hp < e.maxHp * 0.5 ? 0.3 : 0.24);   // (the Baron runs about as fast as Chris)
          const step = Math.max(-maxV, Math.min(maxV, angDiff(target, e.theta) * 0.9));
          if (!(e.charge > 0)) e.theta = wrap(e.theta + step * dt);
          if (!(e.charge > 0)) e.h = (e.ai === 'paladin' ? 130 : (baron ? 165 : 175)) + Math.sin(e.t * (baron ? 2.2 : 1.3)) * (baron ? 18 : 30);       // low enough to hit with a jump (shots fly straight)
        }
        const phase2 = e.hp < e.maxHp * 0.5;

        if (phase2 && !e.healed) {          // halfway: a cheese wedge drops in to help
          e.healed = true;
          this.pickups.push({ kind: 'heal', theta: wrap(P.theta + 0.12), h: 320, vh: 0, life: 14, spr: this.add.image(0, 0, 'wedge').setDepth(6) });
        }
        e.rainCd -= dt;
        e.fanCd -= dt;
        e.sumCd -= dt;
        if (e.ai === 'croque') {
          // BODY SLAM: punishes camping underneath it. Stay below it too long and it shudders, lifts slightly (the tell),
          // then drops straight down like a brick, sending crumb shockwaves along the ground (jump them).
          // While it sits on the ground afterwards it's low and easy to hit - the reward for getting out of the way.
          e.slamCd = Math.max(0, (e.slamCd || 0) - dt);
          const under = Math.abs(toP) * R < 70 && P.h < e.h;
          e.underT = under ? (e.underT || 0) + dt : Math.max(0, (e.underT || 0) - dt * 2);
          if (!e.slam && e.slamCd <= 0 && e.underT > (phase2 ? 1.2 : 1.7)) {
            e.slam = { st: 'rise', t: 0, th: e.theta, h0: e.h }; e.charge = 1; e.underT = 0; Sound.sfx('grind');
          }
          if (e.slam) {
            const SL = e.slam; SL.t += dt;
            if (SL.st === 'rise') {                      // the tell: a nervous shudder and a little lift
              const tell = phase2 ? 0.55 : 0.75, k = Math.min(1, SL.t / tell);
              e.h = SL.h0 + 30 * Math.sin(k * Math.PI / 2);
              e.theta = wrap(SL.th + Math.sin(SL.t * 70) * (2 + 3 * k) / R);
              if (Math.floor(SL.t * 14) % 2) e.spr.setTint(0xffb0a0); else e.spr.clearTint();
              if (SL.t > tell) { SL.st = 'drop'; SL.t = 0; SL.v = 0; e.theta = SL.th; e.spr.clearTint(); Sound.sfx('whoosh'); }
            } else if (SL.st === 'drop') {
              SL.v += 2600 * dt; e.h -= SL.v * dt;
              if (e.h <= 62) {
                e.h = 62; SL.st = 'land'; SL.t = 0;
                Sound.sfx('boom'); buzz([60, 30, 90]); this.cameras.main.shake(260, 0.014); this.camPunch(0.04);
                this.burst(e.theta, 6, 'crumb', 22, 1.5); this.bang(e.theta, 10, 40);
                for (const sd of [-1, 1]) {                          // shockwaves skimming the floor both ways
                  this.addEBullet('crumb', wrap(e.theta + sd * 50 / R), 9, sd * 250, 0, 11, 2.4);
                }
                if (phase2) for (let k = 0; k < 4; k++) { const a = (k - 1.5) * 0.45; this.addEBullet('meatball', e.theta, 80, 260 * Math.sin(a), 420 * Math.cos(a) * 0.8, 9, 3).grav = 500; }   // meatballs spray up and rain back down
              }
            } else if (SL.st === 'land') {
              if (SL.t > (phase2 ? 0.8 : 1.1)) SL.st = 'up';
            } else if (SL.st === 'up') {
              e.h += 190 * dt;
              if (e.h >= 170) { e.slam = null; e.charge = 0; e.slamCd = phase2 ? 2.5 : 3.5; e.rainCd = 0.6; }
            }
          } else {
            if (e.rainCd <= 0) {          // side cannons fire meatballs straight at him (both at once when it's angry)
              e.rainCd = phase2 ? 0.7 : 0.85;
              const facing = toP >= 0 ? 1 : -1, v = phase2 ? 290 : 245;
              for (const side of (phase2 ? [-1, 1] : [facing])) {
                const c = this.bossGun(e, side * 80, 56);
                const ex = angDiff(P.theta, c.theta) * R + (P.vx || 0) * 0.18, ey = P.h + 24 - c.h, len = Math.hypot(ex, ey) || 1;   // leads Chris a little
                this.addEBullet('meatball', c.theta, c.h, ex / len * v, ey / len * v, 9, 3);
                this.muzzleFlash(c.theta, c.h);
              }
              Sound.sfx('cube');
            }
            if (e.fanCd <= 0) {           // belly turret: a spread of toast crumbs fired downwards
              e.fanCd = phase2 ? 3.4 : 4.6;
              Sound.sfx('fan');
              const c = this.bossGun(e, 0, 93), n = phase2 ? 5 : 4;
              for (let k = 0; k < n; k++) {
                const a = (k - (n - 1) / 2) * 0.36;
                this.addEBullet('crumb', c.theta, c.h, 210 * Math.sin(a), -210 * Math.cos(a), 7, 2.5);
              }
              this.muzzleFlash(c.theta, c.h);
            }
          }
        } else if (e.ai === 'baron') {
          this.baronAI(e, dt, phase2, toP, distP);
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
        } else if (e.ai === 'oven') {                    // L4: homing pepperoni from the side chutes, and a fan of molten cheese from the mouth
          if (e.rainCd <= 0) {
            e.rainCd = phase2 ? 1.2 : 1.7;
            for (const side of (phase2 ? [-1, 1] : [toP >= 0 ? 1 : -1])) {
              const c = this.bossGun(e, side * 68, 66), b = this.addEBullet('pepper', c.theta, c.h, side * 150, 80, 9, 4.5);
              b.home = 2.4; b.homeV = phase2 ? 200 : 165; this.muzzleFlash(c.theta, c.h);
            }
            Sound.sfx('cube');
          }
          if (e.fanCd <= 0) {
            e.fanCd = phase2 ? 3.2 : 4.6; Sound.sfx('fan');
            const c = this.bossGun(e, 0, 84), n = phase2 ? 7 : 5;
            for (let k = 0; k < n; k++) { const a = (k - (n - 1) / 2) * 0.32; this.addEBullet('crumb', c.theta, c.h, 230 * Math.sin(a), -230 * Math.cos(a), 7, 2.5); }
            this.muzzleFlash(c.theta, c.h);
          }
        } else if (e.ai === 'phantom') {                 // L5: spinning geometric pinwheel patterns, and she vanishes and reappears
          if (!e.blinking) e.spr.setAlpha(0.7 + 0.25 * Math.sin(e.t * 4));
          e.spinA = (e.spinA || 0) + dt * (phase2 ? 1.6 : 1.1);
          if (e.rainCd <= 0) {
            e.rainCd = phase2 ? 0.12 : 0.17;
            const arms = phase2 ? 4 : 3;
            for (let k = 0; k < arms; k++) { const a = e.spinA + k * TAU / arms; this.addEBullet('ghostorb', e.theta, e.h, 150 * Math.sin(a), 150 * Math.cos(a), 8, 3.2); }
          }
          if (e.fanCd <= 0) {
            e.fanCd = phase2 ? 4 : 5.5; e.rainCd = 1.1;                 // a breather while she blinks across the sky
            Sound.sfx('whoosh'); e.blinking = true;
            this.tweens.add({ targets: e.spr, alpha: 0, duration: 250, yoyo: true, onYoyo: () => { e.theta = wrap(P.theta + (Math.random() < 0.5 ? -1 : 1) * rnd(0.3, 0.5)); }, onComplete: () => { e.blinking = false; } });
          }
          if (phase2 && e.sumCd <= 0 && this.enemies.length < 5) { e.sumCd = 6; this.spawnEnemy('phantom'); }
        } else if (e.ai === 'wheel') {                   // L6: the giant Pepper Jack rolls at Chris, overshoots, turns and comes again
          const top = phase2 ? 290 : 240;
          const want = (Math.abs(toP) * R > 30 || Math.abs(e.v) < 60) ? dirP * top : e.v;
          e.v += (want - e.v) * Math.min(1, dt * (Math.sign(want) !== Math.sign(e.v) ? 0.9 : 1.6));   // slow to turn round: jump it as it passes
          e.theta = wrap(e.theta + (e.v / R) * dt); e.roll += (e.v / 54) * dt; e.h = 54;
          if (e.rainCd <= 0) {                                         // spits chilli flakes up out of the rind
            e.rainCd = phase2 ? 0.9 : 1.4;
            for (let k = 0; k < (phase2 ? 3 : 2); k++) { const b = this.addEBullet('chili', e.theta, 100, rnd(-140, 140), rnd(260, 360), 7, 3); b.grav = 420; }
            Sound.sfx('cube');
          }
          if (e.fanCd <= 0) { e.fanCd = phase2 ? 3 : 4.5; this.cameras.main.shake(160, 0.006); Sound.sfx('clunk'); }
        } else if (e.ai === 'flagship') {                // L7: sweeping laser from the belly, side cannons, launches drones
          if (e.rainCd <= 0) {
            e.rainCd = phase2 ? 0.9 : 1.3;
            const side = toP >= 0 ? 1 : -1, c = this.bossGun(e, side * 74, 48);
            const ex = angDiff(P.theta, c.theta) * R, ey = P.h + 24 - c.h, len = Math.hypot(ex, ey) || 1, v = phase2 ? 270 : 230;
            this.addEBullet('meatball', c.theta, c.h, ex / len * v, ey / len * v, 9, 3); this.muzzleFlash(c.theta, c.h); Sound.sfx('cube');
          }
          if (e.fanCd <= 0 && !this.bossLaser) {
            e.fanCd = phase2 ? 4 : 5.5;
            const d = Math.random() < 0.5 ? -1 : 1;
            this.bossLaser = { boss: e, from: wrap(P.theta - d * 0.45), to: wrap(P.theta + d * 0.45), t: 0, warn: 0.75, dur: phase2 ? 1.4 : 1.8 };
            Sound.sfx('alarm');
          }
          if (e.sumCd <= 0 && this.enemies.length < 4) { e.sumCd = phase2 ? 6 : 9; this.spawnEnemy('drone'); }
        } else if (e.ai === 'paladin') {                 // L8: sword waves at different heights, shield-first charges
          if (e.rainCd <= 0) {
            e.rainCd = phase2 ? 1.5 : 2.2;
            for (const hh of (phase2 ? [14, 80] : [14])) this.addEBullet('blade', e.theta, hh, dirP * (phase2 ? 300 : 260), 0, 11, 3);
            Sound.sfx('zing');
          }
          if (e.fanCd <= 0) {                                         // CHARGE: a quick dash across at Chris's height
            e.fanCd = phase2 ? 3.5 : 5; e.charge = 0.9; e.chargeDir = dirP; e.spr.setTint(0xff8080); Sound.sfx('whoosh');
          }
          if (e.charge > 0) { e.charge -= dt; e.theta = wrap(e.theta + e.chargeDir * 420 / R * dt); e.h += (Math.max(40, P.h + 30) - e.h) * Math.min(1, dt * 6); if (e.charge <= 0) e.spr.clearTint(); }
          if (phase2 && e.sumCd <= 0 && this.enemies.length < 4) { e.sumCd = 8; this.spawnEnemy('paladin'); }
        } else if (e.ai === 'king') {                    // L9: the Rat-King's mech throws everything at you
          if (e.rainCd <= 0) {
            e.rainCd = phase2 ? 0.7 : 1.0;
            const side = toP >= 0 ? 1 : -1, c = this.bossGun(e, side * 70, 49);
            const ex = angDiff(P.theta, c.theta) * R, ey = P.h + 24 - c.h, len = Math.hypot(ex, ey) || 1, v = phase2 ? 290 : 240;
            this.addEBullet('meatball', c.theta, c.h, ex / len * v, ey / len * v, 9, 3); this.muzzleFlash(c.theta, c.h); Sound.sfx('cube');
          }
          if (e.fanCd <= 0) {
            e.fanCd = phase2 ? 3.2 : 4.6; Sound.sfx('fan');
            const c = this.bossGun(e, 0, 56), n = phase2 ? 14 : 10;      // a ring from the cheese reactor
            for (let k = 0; k < n; k++) { const a = (k / n) * TAU + e.t; this.addEBullet('ghostorb', c.theta, c.h, 170 * Math.sin(a), 170 * Math.cos(a), 8, 2.6); }
            if (phase2) for (const sd of [-1, 1]) { const g = this.bossGun(e, sd * 70, 49), b = this.addEBullet('pepper', g.theta, g.h, sd * 140, 60, 9, 4); b.home = 2; b.homeV = 190; }
          }
          if (e.sumCd <= 0 && this.enemies.length < 5) { e.sumCd = phase2 ? 6 : 9; this.spawnEnemy(Math.random() < 0.5 ? 'paladin' : 'phantom'); }
        }
      }

      if (e.flashCd > 0) e.flashCd -= dt;
      if (e.flash > 0) { e.flash -= dt; if (e.flash <= 0) { if (e.baseTint) e.spr.setTint(e.baseTint); else e.spr.clearTint(); } }
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
          if (e.type === 'boss' && this.def.boss.armouredTop) {           // armour plating: Chris just bounces off
            P.vh = 380; P.h = top + 1; P.jetArmed = false; P.invuln = Math.max(P.invuln, 0.2);
            this.burst(P.theta, top, 'spark', 12, 1.1); this.cameras.main.shake(80, 0.005);
            Sound.sfx('zing'); buzz(30); this.banner('CLANG!');
            continue;
          }
          if (e.type === 'boss') e.hp -= pound ? 12 : 6;
          else if (e.big) { e.stomps = (e.stomps || 0) + 1; if (pound || e.stomps >= 2) e.hp = 0; else e.hp = Math.max(1, e.hp - 3); }
          else e.hp = 0;
          P.vh = pound ? 520 : 440; P.h = top + 1;
          this.stompBoost();                                          // a head-bounce tops up the jetpack and re-arms it
          P.invuln = Math.max(P.invuln, 0.2);
          e.flash = 0.08; e.flashCd = 0.15; e.spr.setTintFill(0xffffff); e.spr.hsq = 1.4; this.hitStop = Math.max(this.hitStop || 0, 0.06); this.camKick(0, 5);
          this.burst(e.theta, top, 'spark', pound ? 16 : 8, pound ? 1.3 : 0.8);
          this.cameras.main.shake(pound ? 140 : 70, pound ? 0.008 : 0.004);
          Sound.sfx('jump'); buzz(pound ? 40 : 18);
          if (e.hp > 0) this.banner(e.type === 'boss' ? 'BONK!' : 'ONE MORE!');
          this.addScore(50);
          continue;
        }
      }
      if (!fooled && !(e.kind === 'frog' && e.state === 'stun') && P.invuln <= 0 && dist2(e.theta, e.h + e.ch, P.theta, P.h + (P.duck ? 10 : 22)) < (e.r + (P.duck ? 9 : 12)) * (e.r + (P.duck ? 9 : 12))) {
        this.hurt();
        if (e.type === 'mouse' || e.type === 'flyer' || e.type === 'minigerm' || e.type === 'drone' || e.type === 'phantom') e.hp = 0;     // small fry go out in a blaze
      }
    }
    this.reapEnemies();
  }

  reapEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.hp > 0) continue;
      if (this.pl.grabbed === e) this.releaseGrab(false);
      if (e.type !== 'boss') this.comboKill();
      const pts = ({ mouse: 100, flyer: 150, golem: 400, germ: 150, minigerm: 50, frog: 200, drone: 250, slicer: 200, stinkfly: 150, boss: 5000 }[e.type] || 100) * (e.type === 'boss' ? 1 : this.comboMult());
      this.addScore(pts);
      this.popup(e.theta, e.h + e.ch + e.r + 6, '+' + pts, e.type === 'boss' ? '#ffd23f' : (this.comboMult() > 1 ? '#ff9d3a' : '#ffffff'), e.type === 'boss' || this.comboMult() > 1);
      if (e.type !== 'boss' && e.spr.frame) {          // the body tumbles off, spinning, instead of just vanishing
        const c = this.add.image(0, 0, e.spr.texture.key, e.spr.frame.name).setOrigin(e.spr.originX, e.spr.originY).setDepth(e.spr.depth).setFlipX(e.spr.flipX).setTintFill(0xffffff);
        c.bsx = e.spr.bsx || 1; c.bsy = e.spr.bsy || 1;
        const away = Math.sign(angDiff(e.theta, this.pl.theta)) || 1;
        this.parts.push({ theta: e.theta, h: e.h, vt: away * rnd(110, 200), vh: rnd(260, 380), life: 0.75, spr: c, rot: 0, rv: away * rnd(9, 14), corpse: true, flashT: 0.07 });
      }
      Sound.sfx(e.type === 'boss' ? 'boom' : 'kill');
      this.bang(e.theta, e.h + e.ch, e.type === 'boss' ? 90 : (e.big ? 30 : 14));
      if (e.type === 'boss') { this.cameras.main.flash(450, 255, 255, 255); buzz([80, 50, 80, 50, 220]); this.hitStop = 0.3; this.slowT = 1.4; this.camPunch(0.08); }
      else if (e.big) { buzz(25); this.hitStop = Math.max(this.hitStop || 0, 0.07); this.camPunch(0.025); }
      else this.hitStop = Math.max(this.hitStop || 0, 0.035);
      this.addLight(e.theta, e.h + e.ch, e.type === 'boss' ? 260 : (e.big ? 110 : 70), 0xffc060, e.type === 'boss' ? 1 : 0.7, 0.35);
      this.burst(e.theta, e.h + e.ch, e.type === 'boss' ? 'crumb' : 'spark', e.type === 'boss' ? 40 : 8, e.type === 'boss' ? 2 : 1);
      if (e.type === 'boss') { this.clearEBullets(); this.cameras.main.shake(300, 0.012); }
      if (e.type === 'germ') {          // bacteria split in two
        for (const sd of [-1, 1]) { const c = this.makeEnemy('minigerm', wrap(e.theta + sd * 0.03), sd); c.h = e.h + e.ch * 0.5; c.vh = 260; this.enemies.push(c); }
      }
      const midSize = e.type !== 'boss' && ((ENEMY[e.type] && ENEMY[e.type].hp) || 0) >= 3;   // medium and big enemies can drop a timed power-up
      const pool = Object.keys(BUFFS).filter(k => BUFFS[k].from <= Math.floor(this.levelId));
      if (midSize && this.gotPower && Math.random() < 0.25 && !this.pickups.some(p => p.kind === 'buff') && pool.length) {
        const bk = pool[Math.floor(Math.random() * pool.length)], B = BUFFS[bk];
        this.pickups.push({ kind: 'buff', bk, theta: e.theta, h: e.h + e.ch, vh: 240, life: 14, spr: (() => { const im = this.add.image(0, 0, B.tex).setDepth(6); bakedGlow(im, B.col, 3, 8); return im; })() });
      } else if (e.big && (!this.gotPower || Math.random() < 0.3)) {     // the first big enemy always drops a Power-Up
        this.gotPower = true;
        this.pickups.push({ kind: 'power', theta: e.theta, h: e.h + e.ch, vh: 220, life: 14, spr: (() => { const im = this.add.image(0, 0, 'power').setDepth(6); bakedGlow(im, 0xfff3a0, 3, 8); return im; })() });
      } else if (Math.random() < (e.drop || 0)) {
        this.pickups.push({ kind: 'heal', theta: e.theta, h: e.h + e.ch, vh: 150, life: 12, spr: this.add.image(0, 0, 'wedge').setDepth(6) });
      }
      e.spr.destroy();
      if (e.jet) e.jet.destroy();
      if (e.ov) for (const o of Object.values(e.ov)) o.destroy();
      this.enemies.splice(i, 1);
    }
  }

  addEBullet(kind, theta, h, vt, vh, r, life) {
    const glow = { spore: 0x7dff8a, blade: 0xdfe6f0, pepper: 0xff6a3a, ghostorb: 0x9fd8ff, chili: 0xff4a2a, psyorb: 0xc080ff }[kind] || 0xffc040;
    const b = {
      kind, theta: wrap(theta), h, vt: vt * Settings.dk.shot, vh: vh * Settings.dk.shot, r, life: life / Settings.dk.shot,
      spin: 0, spinV: (kind === 'cube' || kind === 'meatball' || kind === 'chili') ? rnd(-6, 6) : (kind === 'ham' ? rnd(-3, 3) : (kind === 'blade' ? 16 : (kind === 'pepper' ? 12 : 0))),
      spr: (() => { const im = this.add.image(0, 0, kind).setDepth(8); bakedGlow(im, glow, 2, 6); return im; })()
    };
    this.eBullets.push(b);
    return b;
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
      if (b.grav) b.vh -= b.grav * dt;
      b.bh += b.vh * dt;
      const w = Math.sin(b.age * 38 + b.ph) * (b.wob === undefined ? 5 : b.wob);      // corkscrew: pasta twisting out of the extruder
      b.theta = wrap(b.bt + (b.px * w) / R);
      b.h = b.bh + b.py * w;

      if (this.def.ricochet && !b.grav && (b.bnc || 0) < 2 && (b.bh < 0 || b.bh > CFG.jetCeiling + 30)) {   // L8: shots bounce off floor and ceiling
        b.bh = b.bh < 0 ? -b.bh : 2 * (CFG.jetCeiling + 30) - b.bh; b.vh = -b.vh; b.bnc = (b.bnc || 0) + 1; b.age = Math.max(0, b.age - 0.2);
        b.h = b.bh; this.burst(b.theta, Math.max(0, b.h), 'spark', 3, 0.5);
      }
      let dead = b.age > (b.life || CFG.bulletLife) || b.h < 0;
      if (!dead && this.chaser) {                         // shooting the rolling Pepper Jack slows it a touch
        const C = this.chaser;
        if (dist2(b.theta, b.h, C.theta, C.r) < (C.r + 6) * (C.r + 6)) { dead = true; C.v *= 0.9; this.burst(b.theta, b.h, 'crumb', 3, 0.6); }
      }
      if (!dead && b.plough) {                            // Swiss-Shot: ploughs THROUGH enemies, shrinking (and losing blast) with every one
        if (!b.hits) b.hits = [];
        for (const e of this.enemies) {
          if (e.hp <= 0 || b.hits.includes(e)) continue;
          const rr = e.r + 9 * b.spr.bsx;
          if (dist2(b.theta, b.h, e.theta, e.h + e.ch) >= rr * rr) continue;
          if (e.type === 'boss') { dead = true; break; }  // too big to plough through: burst on it
          b.hits.push(e);
          if (this.hitK(e) === 0) { this.deflect(e, b.theta, b.h); dead = true; break; }
          e.hp -= b.ploughDmg * this.hitK(e); this.knock(e, b.theta, 190);
          if (!(e.flashCd > 0)) { e.flash = 0.06; e.flashCd = 0.15; e.spr.setTintFill(0xffffff); e.spr.hsq = 1; }
          this.burst(b.theta, b.h, 'crumb', 8, 0.9); this.bang(b.theta, b.h, 14);
          Sound.sfx('bonk'); this.hitStop = Math.max(this.hitStop || 0, 0.03);
          const k = e.hp > 0 ? 0.72 : 0.82;               // a tough one that survives takes more out of the ball
          b.spr.bsx *= k; b.spr.bsy *= k; b.blast *= k; b.blastDmg *= k; b.ploughDmg *= k;
          b.vt *= 0.94; b.vh *= 0.94;
          if (b.spr.bsx < b.minScale) { dead = true; break; }      // worn down to a crumb: pops early
        }
      } else if (!dead) {
        for (const e of this.enemies) {
          if (b.hits && b.hits.includes(e)) continue;           // a piercing noodle hits each enemy once
          const rr = e.r + 8;
          if (dist2(b.theta, b.h, e.theta, e.h + e.ch) < rr * rr) {
            const hk = this.hitK(e);
            if (hk === 0) { this.deflect(e, b.theta, b.h); dead = true; break; }
            e.hp -= (b.dmg || 1) * hk; if (this.buffOn('sauce')) e.burn = 2;
            this.knock(e, b.theta, 70 * Math.sqrt(b.dmg || 1));
            Sound.sfx('hit');
            if (!(e.flashCd > 0)) { e.flash = 0.05; e.flashCd = 0.15; e.spr.setTintFill(0xffffff); e.spr.hsq = 1; }      // limited blink rate, not constant flicker
            if (b.hits) { b.hits.push(e); this.burst(b.theta, b.h, 'spark', 3, 0.4); if (b.hits.length >= b.pierce) { dead = true; break; } }
            else { dead = true; break; }
          }
        }
      }
      if (!dead && this.relics.length && this.relicHit(b.theta, b.h, 6, b.dmg || 1)) dead = true;
      if (dead && b.blast) this.swissBlast(b.theta, Math.max(0, b.h), b.blast, b.blastDmg, b.bossDmg || this.weapon.bossDmg);
      if (dead) { b.spr.destroy(); this.pBullets.splice(i, 1); }
    }
    this.reapEnemies();
  }

  updateEnemyBullets(dt) {
    const P = this.pl;
    for (let i = this.eBullets.length - 1; i >= 0; i--) {
      if (this.state !== 'play') return;                // a hit just ended the game (and cleared the bullets)
      const b = this.eBullets[i];
      if (!b) continue;
      if (b.home > 0) {                                  // homing (pepperoni): steer towards Chris for a while
        b.home -= dt;
        const ex = angDiff(P.theta, b.theta) * R, ey = P.h + 22 - b.h, len = Math.hypot(ex, ey) || 1, v = b.homeV || 160;
        b.vt += (ex / len * v - b.vt) * Math.min(1, dt * 2.2); b.vh += (ey / len * v - b.vh) * Math.min(1, dt * 2.2);
      }
      if (b.grav) b.vh -= b.grav * dt;
      b.theta = wrap(b.theta + (b.vt / R) * dt);
      b.h += b.vh * dt;
      b.life -= dt;
      if (this.buffOn('magnet')) {                       // Magnet Fork: shots bend away
        const ex = angDiff(b.theta, P.theta) * R, ey = b.h - (P.h + 22), dd = Math.hypot(ex, ey);
        if (dd < 110 && dd > 1) { b.vt += ex / dd * 420 * dt; b.vh += ey / dd * 420 * dt; }
      }
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
      if (this.buffOn('magnet') && Math.abs(angDiff(p.theta, P.theta)) * R < 420) {     // Magnet Fork: everything comes to Chris
        p.theta = wrap(p.theta + Math.sign(angDiff(P.theta, p.theta)) * Math.min(Math.abs(angDiff(P.theta, p.theta)), 360 / R * dt));
        p.h += (P.h + 14 - p.h) * Math.min(1, dt * 4); p.vh = 0;
      }
      p.vh -= this.gAt(p.theta) * 0.6 * dt;
      p.h += p.vh * dt;
      if (p.kind === 'buff') p.spr.setScale(p.spr.scaleX * (1 + 0.1 * Math.sin(this.t * 8)));
      if (p.h <= 0) { p.h = 0; p.vh = 0; }
      p.life -= dt;
      let dead = p.life <= 0;
      if (!dead && dist2(p.theta, p.h + 8, P.theta, P.h + 22) < 30 * 30) {
        if (p.kind === 'buff') this.startBuff(p.bk);
        else if (p.kind === 'power') {
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
      if (p.rv) p.rot += p.rv * dt;
      if (p.flashT > 0) { p.flashT -= dt; if (p.flashT <= 0) p.spr.setTint(0xff9d9d); }
      if (p.stay && p.h < 0) { p.h = 0; p.vh = Math.abs(p.vh) > 120 ? -p.vh * 0.35 : 0; p.vt *= 0.5; p.rv *= 0.5; if (!p.vh) { p.vt = 0; p.rv = 0; } if (Math.abs(p.vh) > 0) Sound.sfx('clang'); }
      if (p.corpse && p.h < 0 && p.vh < 0) { this.burst(p.theta, 4, 'spark', 3, 0.4); p.h = 0; p.life = 0; }    // a little poof as it lands
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
    const hq = o.hsq || 0;                                   // hit squash (impact) on top of any other squash
    o.setScale((o.bsx || 1) * z * (o.sqx || 1) * (1 + 0.28 * hq), (o.bsy || 1) * z * (o.sqy || 1) * (1 - 0.22 * hq));
  }

  // ================================================================= level hazards (roadmap levels)
  //  strands  (L4): boiling string cheese stretches between two points, then SNAPS taut and whips - don't be on it
  //  chaser   (L6): a gargantuan Pepper Jack wheel rolls after Chris all level
  //  sweep    (L7): the flagship's lasers sweep the deck from the sky
  //  debris   (L9): chunks of the collapsing planet rain down (a shadow warns where)
  //  + the L7 boss's own belly laser (bossLaser)
  updateHazards(dt) {
    const d = this.def, P = this.pl, ph = P.h + (P.duck ? 10 : 22);
    const hit = () => { if (P.invuln <= 0) this.hurt(); };
    const bossUp = this.enemies.some(e => e.type === 'boss');
    if (d.strands) {
      this.strandT -= dt;
      if (this.strandT <= 0) {
        this.strandT = rnd(d.strands.every[0], d.strands.every[1]) * (bossUp ? 1.5 : 1);
        const span = rnd(0.25, 0.45), off = rnd(-0.2, 0.2);
        this.strands.push({ a: wrap(P.theta + off - span), b: wrap(P.theta + off + span), ha: rnd(10, 150), hb: rnd(10, 150), t: 0, warn: 1.0, snap: 0.55, ph: rnd(0, 6) });
        Sound.sfx('stretch');
      }
      for (let i = this.strands.length - 1; i >= 0; i--) {
        const S = this.strands[i]; S.t += dt;
        if (S.t > S.warn && !S.snapped) { S.snapped = true; Sound.sfx('zing'); this.camKick(0, 3); buzz(20); }
        if (S.t > S.warn && S.t < S.warn + S.snap) {               // live: distance from Chris to the strand
          const ax = angDiff(S.a, P.theta) * R, bx = angDiff(S.b, P.theta) * R, dx = bx - ax, dy = S.hb - S.ha;
          const u = Math.max(0, Math.min(1, ((0 - ax) * dx + (ph - S.ha) * dy) / (dx * dx + dy * dy || 1)));
          if (Math.hypot(ax + dx * u, S.ha + dy * u - ph) < 13) hit();
        }
        if (S.t > S.warn + S.snap + 0.4) this.strands.splice(i, 1);
      }
    }
    if (d.chaser) {
      if (bossUp) { if (this.chaser) { this.chaser.spr.destroy(); this.chaser = null; } }
      else {
        if (!this.chaser) {
          const r = 72, spr = this.add.image(0, 0, 'wheel').setDepth(5.5); spr.bsx = spr.bsy = 1.5;
          this.chaser = { theta: wrap(P.theta - (P.facing || 1) * 420 / R), v: 0, r, roll: 0, spr };
          this.banner('THE PEPPER JACK IS COMING - RUN!'); Sound.sfx('bossIn');
        }
        const C = this.chaser, to = angDiff(P.theta, C.theta), dir = Math.sign(to) || 1;
        const sp = d.chaser.speed + 15 * Math.max(0, this.waveIdx);
        C.v += (dir * sp - C.v) * Math.min(1, dt * 1.2);
        C.theta = wrap(C.theta + (C.v / R) * dt); C.roll += (C.v / C.r) * dt;
        if (Math.abs(to) * R < C.r * 0.8 && P.h < C.r * 1.6) {        // flattened! bounced up and over
          if (P.invuln <= 0) { this.hurt(); P.vh = 520; P.theta = wrap(P.theta + dir * 0.05); }
        }
        this.rumbleT = (this.rumbleT || 0) - dt;
        if (this.rumbleT <= 0 && Math.abs(to) * R < 260) { this.rumbleT = 0.45; this.cameras.main.shake(120, 0.003); }
      }
    }
    if (d.sweep) {
      this.sweepT -= dt;
      if (this.sweepT <= 0 && !bossUp) {
        this.sweepT = rnd(d.sweep.every[0], d.sweep.every[1]);
        const dd = Math.random() < 0.5 ? -1 : 1;
        this.sweeps.push({ from: wrap(P.theta - dd * 0.5), to: wrap(P.theta + dd * 0.5), t: 0, warn: 0.8, dur: 1.6 });
        Sound.sfx('alarm');
      }
    }
    const lasers = this.sweeps.slice(); if (this.bossLaser) lasers.push(this.bossLaser);
    for (const L of lasers) {
      L.t += dt;
      const k = Math.max(0, Math.min(1, (L.t - L.warn) / L.dur));
      L.at = wrap(L.from + angDiff(L.to, L.from) * k);
      if (L.t > L.warn && L.t < L.warn + L.dur && Math.abs(angDiff(P.theta, L.at)) * R < 14) hit();
      if (L.t > L.warn && !L.zap) { L.zap = true; Sound.sfx('beam'); }
    }
    this.sweeps = this.sweeps.filter(L => L.t < L.warn + L.dur + 0.2);
    if (this.bossLaser && (this.bossLaser.t >= this.bossLaser.warn + this.bossLaser.dur + 0.2 || !this.enemies.includes(this.bossLaser.boss))) this.bossLaser = null;
    if (d.debris) {
      this.rockT -= dt;
      if (this.rockT <= 0) {
        this.rockT = rnd(d.debris.every[0], d.debris.every[1]) * (bossUp ? 1.4 : 1);
        const spr = this.add.image(0, 0, 'db_rock').setDepth(7); spr.bsx = spr.bsy = rnd(2, 3);
        this.rocks.push({ theta: wrap(P.theta + rnd(-0.45, 0.45) + P.vx / R * 0.8), h: 460, vh: -200, spr, rot: 0, rv: rnd(-6, 6) });
      }
      for (let i = this.rocks.length - 1; i >= 0; i--) {
        const K = this.rocks[i]; K.vh -= 600 * dt; K.h += K.vh * dt; K.rot += K.rv * dt;
        if (K.h <= 0) {
          this.burst(K.theta, 4, 'crumb', 10, 1); this.bang(K.theta, 6, 20); this.cameras.main.shake(90, 0.004); Sound.sfx('clunk');
          if (Math.abs(angDiff(P.theta, K.theta)) * R < 30 && P.h < 40) hit();
          K.spr.destroy(); this.rocks.splice(i, 1);
        }
      }
    }
  }

  drawHazards() {
    if (!this.hazG) this.hazG = this.add.graphics().setDepth(7.6);
    const g = this.hazG, z = this.zoom; g.clear();
    const at = (th, h) => this.screenPos(th, h);
    for (const S of this.strands) {                                 // string cheese: a faint stretch, then a thick whipping strand
      const live = S.t > S.warn, pts = [], n = 18, dA = angDiff(S.b, S.a);
      for (let k = 0; k <= n; k++) {
        const u = k / n, wob = live ? Math.sin(u * Math.PI) * Math.sin(S.t * 38 + S.ph) * 16 * Math.max(0, 1 - (S.t - S.warn) * 1.6) : Math.sin(u * Math.PI) * 6;
        pts.push(at(wrap(S.a + dA * u), S.ha + (S.hb - S.ha) * u + wob));
      }
      const draw = (w, col, a) => { g.lineStyle(w, col, a); g.beginPath(); g.moveTo(pts[0].x, pts[0].y); for (const q of pts) g.lineTo(q.x, q.y); g.strokePath(); };
      if (!live) draw(2 * z, 0xfff6d0, 0.35 + 0.3 * Math.abs(Math.sin(S.t * 20)));
      else { const f = Math.max(0, 1 - Math.max(0, S.t - S.warn - S.snap) / 0.4); draw(8 * z, 0x1a1020, 0.9 * f); draw(5 * z, 0xfff6e0, f); draw(2 * z, 0xffffff, f); }
      for (const [th, h] of [[S.a, S.ha], [S.b, S.hb]]) { const q = at(th, h); g.fillStyle(0xfff6e0, 0.9).fillCircle(q.x, q.y, 4 * z); }
    }
    const lasers = this.sweeps.slice(); if (this.bossLaser) lasers.push(this.bossLaser);
    for (const L of lasers) {                                       // lasers from the sky (or the flagship's belly)
      const top = L.boss ? Math.max(40, L.boss.h - 40) : 520, live = L.t > L.warn;
      if (!live) { const q0 = at(L.from, 0), q1 = at(L.from, top); g.lineStyle(2 * z, 0xff3030, 0.4 + 0.4 * Math.abs(Math.sin(L.t * 24))).lineBetween(q0.x, q0.y, q1.x, q1.y); continue; }
      const q0 = at(L.at, 0), q1 = at(L.at, top);
      g.lineStyle(14 * z, 0xff2020, 0.35).lineBetween(q0.x, q0.y, q1.x, q1.y);
      g.lineStyle(6 * z, 0xff6060, 0.9).lineBetween(q0.x, q0.y, q1.x, q1.y);
      g.lineStyle(2 * z, 0xffffff, 1).lineBetween(q0.x, q0.y, q1.x, q1.y);
      g.fillStyle(0xffd0d0, 0.8).fillCircle(q0.x, q0.y, 8 * z);
    }
    for (const K of this.rocks) {                                   // falling debris + its shadow warning on the ground
      this.place(K.spr, K.theta, K.h, K.rot);
      const q = at(K.theta, 1), k = Math.max(0, 1 - K.h / 460);
      g.fillStyle(0xff3020, 0.15 + 0.35 * k).fillEllipse(q.x, q.y, (14 + 26 * k) * z, (5 + 6 * k) * z);
    }
    if (this.chaser) { const C = this.chaser; this.place(C.spr, C.theta, C.r, C.roll); }
  }

  // Swiss blasts, drawn every frame in the planet's own (curved) coordinates:
  //  - a shockwave dome/ring that bends with the surface and is cut off at the ground
  //  - a ripple that runs along the ground either side of the impact
  //  - a melted-cheese smear that follows the curve, tapers at both ends and fades
  drawBlastFx() {
    if (!this.blastG) { this.blastG = this.add.graphics().setDepth(8.5); this.puddleG = this.add.graphics().setDepth(2.85); }
    const g = this.blastG, pg = this.puddleG, z = this.zoom, dt = this.paused ? 0 : (this.lastDt || 0.016);
    g.clear(); pg.clear();
    const at = (th, h) => this.screenPos(th, h);
    const stroke = (gr, pts, w, col, a) => {
      let open = false;
      gr.lineStyle(w, col, a); gr.beginPath();
      for (const p of pts) { if (!p) { open = false; continue; } if (!open) { gr.moveTo(p.x, p.y); open = true; } else gr.lineTo(p.x, p.y); }
      gr.strokePath();
    };
    for (let i = this.blastFx.length - 1; i >= 0; i--) {
      const B = this.blastFx[i]; B.t += dt;
      const k = Math.min(1, B.t / 0.45); if (k >= 1) { this.blastFx.splice(i, 1); continue; }
      const e = 1 - Math.pow(1 - k, 3), r = B.rad * e, a = 1 - k, base = R + Math.max(0, B.h);
      for (const [rr, w, col, al] of [[r, 10, 0xffe27a, a], [r * 0.78, 4, 0xffffff, a * 0.75]]) {
        const pts = [];
        for (let s = 0; s <= 48; s++) {
          const ang = s / 48 * TAU, hh = B.h + Math.sin(ang) * rr;
          pts.push(hh < 0 ? null : at(wrap(B.theta + Math.cos(ang) * rr / base), hh));        // clipped at the ground
        }
        stroke(g, pts, Math.max(1.5, w * a * z), col, al);
      }
      if (B.h < r * 1.1) {                                             // ground ripple, curving with the planet
        const span = (Math.sqrt(Math.max(0, r * r - B.h * B.h)) * 1.2 + 8) / R, pts = [];
        for (let s = 0; s <= 30; s++) pts.push(at(wrap(B.theta - span + 2 * span * s / 30), 1.5));
        stroke(g, pts, Math.max(2, 8 * a * z), 0xfff1a0, a * 0.85);
      }
    }
    for (let i = this.puddles.length - 1; i >= 0; i--) {
      const Q = this.puddles[i]; Q.t += dt;
      const f = Q.t < Q.life - 0.9 ? 1 : Math.max(0, (Q.life - Q.t) / 0.9);
      if (f <= 0) { this.puddles.splice(i, 1); continue; }
      const grow = Math.min(1, Q.t / 0.18), span = Q.rad * 0.85 * grow / R, N = 22;
      for (let s = 0; s < N; s++) {                                    // short segments so the smear can taper and thin at the ends
        const u0 = -1 + 2 * s / N, u1 = -1 + 2 * (s + 1) / N, um = (u0 + u1) / 2, taper = 1 - um * um;
        const p0 = at(wrap(Q.theta + u0 * span), 0.5), p1 = at(wrap(Q.theta + u1 * span), 0.5);
        pg.lineStyle((3 + 8 * taper) * z, 0xff9a1a, f * (0.45 + 0.5 * taper)).lineBetween(p0.x, p0.y, p1.x, p1.y);
        const q0 = at(wrap(Q.theta + u0 * span), 2 + 2 * taper), q1 = at(wrap(Q.theta + u1 * span), 2 + 2 * taper);
        pg.lineStyle((1.5 + 3.5 * taper) * z, 0xffffff, f * 0.85 * taper).lineBetween(q0.x, q0.y, q1.x, q1.y);
      }
    }
  }

  render(inp) {
    const P = this.pl;
    const { cx, cy } = this;
    this.drawBlastFx();
    this.drawHazards();
    this.drawTongues();

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
      if (this.def.rimGlow) {                           // neon rim light (level 2)
        const gl = this.def.rimGlow, pulse = 0.85 + 0.15 * Math.sin(this.t * 2);
        this.rimG.lineStyle(14 * this.zoom, gl, 0.1 * pulse).strokeCircle(cx, cy, Rz + 3);
        this.rimG.lineStyle(6 * this.zoom, gl, 0.28 * pulse).strokeCircle(cx, cy, Rz + 1);
        this.rimG.lineStyle(2.5 * this.zoom, 0xd8ffc0, 0.95).strokeCircle(cx, cy, Rz - 1);
      }
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
      if (G.fx) G.fx.outerStrength = G.st === 'erupt' ? 6 : (G.st === 'warn' ? 2 + 2 * Math.abs(Math.sin(this.t * 14)) : 0.8);
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
    for (const q of this.ledgeSprs) {
      this.place(q.spr, q.L.theta, q.L.h - 1, 0);
      if (!q.type) continue;
      const dt = this.lastDt || 0.016, sc = q.spr.bsx, L = q.L;
      q.t += dt;
      for (const e of q.extras) this.place(e.im, wrap(L.theta + e.dx * sc / (R + L.h)), L.h - e.dy * sc, 0);   // dx along the ledge, dy below its top
      if (q.type === 'energy') {                                       // lightning flickers between frames, the glow hums
        q.ft += dt; if (q.ft > 0.06) { q.ft = 0; q.f = (q.f + 1 + (Math.random() < 0.3 ? 1 : 0)) % 3; q.spr.setTexture('pl_energy' + q.f); }
        q.glow.setAlpha(0.35 + 0.2 * Math.random());
      } else if (q.type === 'girder') {
        const on = Math.floor(q.t * 2.5) % 2 === 0; q.beacon.setAlpha(on ? 0.85 : 0.05); q.extras[0].im.setTint(on ? 0xffffff : 0x803030);
      } else if (q.type === 'crystal') {
        q.sparks.forEach((s, k) => s.setScale(s.scaleX * (0.4 + 0.6 * Math.max(0, Math.sin(q.t * 3 + k * 2.1)))));
        q.glow.setAlpha(0.22 + 0.1 * Math.sin(q.t * 2));
      } else if (q.type === 'panini') {
        q.glow.setAlpha(0.2 + 0.08 * Math.sin(q.t * 3));
        q.dripT -= dt;
        if (q.dripT <= 0 && this.state === 'play') {                   // a blob of cheese drops off now and then
          q.dripT = rnd(0.5, 1.4);
          const dx = rnd(-0.7, 0.7) * L.half;
          const im = this.add.image(0, 0, 'fondue').setDepth(2.9); im.bsx = im.bsy = rnd(0.4, 0.6);
          this.parts.push({ theta: wrap(L.theta + dx), h: L.h - 26 * sc, vt: 0, vh: -10, life: 1.6, spr: im });
        }
      }
    }
    for (const q of this.props) {
      this.place(q.spr, q.theta, q.h, q.sway >= 0 ? Math.sin(this.t * 1.6 + q.sway) * 0.07 : 0);
      if (q.halo) { this.place(q.halo, q.theta, q.h + q.spr.height * q.spr.bsy * 0.5, 0); q.halo.setAlpha(q.halo.baseA * (0.75 + 0.25 * Math.sin(this.t * 1.8 + q.ph))); }
    }

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
    this.giantK += ((this.buffOn('giant') ? 1.9 : 1) - this.giantK) * Math.min(1, (this.lastDt || 0.016) * 6);
    this.rig.update(P, this.lastDt || 0.016, P.spr.x, P.spr.y + (P.sink || 0) * this.zoom, this.zoom * this.warpK * this.giantK, P.spr.alpha, Math.floor(this.augerPhase) % 4);
    this.drawBuff();
    if (this.ko) {                                           // game over: flat on his back (rotates about his feet), little stars circling
      const r = this.rig.root; r.setRotation(this.ko.rot); r.y -= Math.abs(this.ko.rot) * 7 * this.zoom; r.x += this.ko.rot * 4 * this.zoom;   // lies ON the ground
      if (this.koStars) { const a = this.t * 5; this.koStars.setPosition(r.x - (P.facing || 1) * 52 * this.zoom + Math.cos(a) * 10, r.y - 12 * this.zoom + Math.sin(a) * 4); }
    }
    this.livesText.setText('x' + this.lives);
    if (this.warp && this.warp.entering) this.rig.root.setRotation(this.rig.root.rotation + this.warp.t * 9);
    { // where the gun's muzzle actually is this frame (after recoil, crouch and facing), in world terms
      const tipImg = this.rig.auger, m = tipImg.getWorldTransformMatrix();
      const tp = m.transformPoint(tipImg.width * (1 - tipImg.originX) - 1, 0);
      const dx = tp.x - this.cx, dy = this.cy - tp.y;
      this.muzzle = { theta: wrap(P.theta + Math.atan2(dx, dy)), h: Math.hypot(dx, dy) / this.zoom - R, x: tp.x, y: tp.y };
      const tb = m.transformPoint(-tipImg.width * tipImg.originX, 0), ml = Math.hypot(tp.x - tb.x, tp.y - tb.y) || 1;
      this.muzzle.dx = (tp.x - tb.x) / ml; this.muzzle.dy = (tp.y - tb.y) / ml;          // which way the barrel points on screen
    }
    { // melee flip: motion-blur trails following the barrel tip and the butt as the gun spins
      const B = this.bashTrail || (this.bashTrail = { tip: [], butt: [], g: this.add.graphics().setDepth(8.4) });
      B.g.clear();
      if (P.bashT > 0) {
        const tipImg = this.rig.auger, gun = this.rig.gun;
        const tp = tipImg.getWorldTransformMatrix().transformPoint(tipImg.width * (1 - tipImg.originX), 0);
        const bp = gun.getWorldTransformMatrix().transformPoint(-gun.width * gun.originX + 1, 0);
        B.tip.push({ x: tp.x, y: tp.y }); B.butt.push({ x: bp.x, y: bp.y });
        if (B.tip.length > 7) { B.tip.shift(); B.butt.shift(); }
        const z = this.zoom;
        for (const [pts, col, w] of [[B.tip, 0xffffff, 7], [B.butt, 0xffd23f, 9]]) {
          for (let i = 1; i < pts.length; i++) {
            const a = i / pts.length;
            B.g.lineStyle(Math.max(1, w * a * z), col, 0.55 * a).lineBetween(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y);
          }
        }
      } else if (B.tip.length) { B.tip.length = 0; B.butt.length = 0; }
    }
    { // Swiss-Shot charge: the ball swells on the end of the gun, wobbling faster as it fills
      if (!this.chargeSpr) { this.chargeSpr = this.add.image(0, 0, 'swissball').setDepth(8.6).setVisible(false); bakedGlow(this.chargeSpr, 0xffe27a, 2, 6); }
      const c = P.charging ? Math.max(0.2, P.charge) : 0, M = this.muzzle;
      if (c > 0 && M) {
        const z = this.zoom, W = this.weapon, wob = 1 + (0.05 + 0.08 * c) * Math.sin(this.t * (18 + 40 * c));
        const sc = (W.ballScale || 1) * (0.45 + 0.95 * c) * z, r = 11 * sc;                  // swissball is 22px across
        this.chargeSpr.setPosition(M.x + M.dx * r * 0.8, M.y + M.dy * r * 0.8).setScale(sc * wob, sc / wob).setRotation(this.t * 2).setVisible(true);
        if (P.chargeFull && Math.floor(this.t * 16) % 2) this.chargeSpr.setTint(0xfff6c0); else this.chargeSpr.clearTint();
        if (Math.random() < c * 0.5) this.fxBang.emitParticleAt(M.x + M.dx * r + rnd(-r, r), M.y + M.dy * r + rnd(-r, r), 1);    // sizzling sparks
      } else this.chargeSpr.setVisible(false);
    }

    for (const e of this.enemies) {
      this.place(e.spr, e.theta, e.h, e.type === 'boss' ? (e.ai === 'wheel' ? e.roll : Math.sin(e.t * 1.5) * 0.08) : (e.roll !== undefined ? e.roll : 0));
      if (e.ai === 'baron') this.drawBaron(e);
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
    this.drawBeam();
    this.drawLights();
    for (const b of this.eBullets) this.place(b.spr, b.theta, b.h, b.spin);
    for (const p of this.pickups) this.place(p.spr, p.theta, p.h, 0);
    for (const g of this.goops) { if (g.halo) this.place(g.halo, g.theta, 4, 0); this.place(g.spr, g.theta, 0, 0); g.spr.setScale(g.spr.scaleX * (1 + 0.015 * Math.sin(this.t * 3 + g.theta * 5)), g.spr.scaleY); }
    for (const a of this.actors) this.place(a.spr, a.theta, a.h, a.rot);
    for (const p of this.parts) { this.place(p.spr, p.theta, p.h, p.rot || 0); p.spr.setAlpha(Math.min(1, p.life * 3)); }
    this.updatePopups(this.lastDt || 0.016);

    // controls
    const cg = this.ctrlG;
    cg.clear();
    for (const k in this.btnLabels) this.btnLabels[k].setVisible(this.touchUI);
    if (this.touchUI && this.btn) {
      const stick = (rest, live) => {                       // base ring where the thumb landed (or a ghost at rest) + the knob
        const bx = live ? live.ox : rest.x, by = live ? live.oy : rest.y;
        cg.fillStyle(0xffffff, live ? 0.12 : 0.06).fillCircle(bx, by, rest.r);
        cg.lineStyle(3, 0xffffff, live ? 0.6 : 0.25).strokeCircle(bx, by, rest.r);
        const kx = bx + (live ? live.vx * rest.r * 0.75 : 0), ky = by + (live ? live.vy * rest.r * 0.75 : 0);
        cg.fillStyle(0xffffff, live ? 0.5 : 0.18).fillCircle(kx, ky, rest.r * 0.42);
        cg.lineStyle(2, 0x1a1020, live ? 0.6 : 0.2).strokeCircle(kx, ky, rest.r * 0.42);
      };
      stick(this.btn.move, this.sticks.move);
      stick(this.btn.aim, this.sticks.aim);
      const Bb = this.btn.bash, bOn = inp.melee || this.pl.bashT > 0;
      cg.fillStyle(0xffffff, bOn ? 0.38 : 0.14).fillCircle(Bb.x, Bb.y, Bb.r);
      cg.lineStyle(3, 0xffffff, bOn ? 0.9 : 0.45).strokeCircle(Bb.x, Bb.y, Bb.r);
    }
    // PC mouse aim: a chunky pixel crosshair instead of the system cursor
    const mouseOn = this.mouseAim && this.state === 'play' && !this.paused;
    if (this.game.canvas) this.game.canvas.style.cursor = mouseOn ? 'none' : '';
    if (mouseOn) {
      const m = this.input.manager.mousePointer, x = Math.round(m.x), y = Math.round(m.y), firing = inp.fire;
      cg.fillStyle(0x1a1020, 1);
      for (const [rx, ry, rw, rh] of [[-10, -2, 6, 4], [5, -2, 6, 4], [-2, -10, 4, 6], [-2, 5, 4, 6]]) cg.fillRect(x + rx, y + ry, rw, rh);
      cg.fillStyle(firing ? 0xffd23f : 0xffffff, 1);
      for (const [rx, ry, rw, rh] of [[-9, -1, 4, 2], [6, -1, 4, 2], [-1, -9, 2, 4], [-1, 6, 2, 4], [-1, -1, 2, 2]]) cg.fillRect(x + rx, y + ry, rw, rh);
    }

    // boss health bar
    const hg = this.hudG;
    hg.clear();
    const boss = this.enemies.find(e => e.type === 'boss');
    if (boss) {
      const w = this.landscape ? Math.min(this.W * 0.5, 420) : this.W - 40;
      const x0 = (this.W - w) / 2, y0 = this.landscape ? 90 : 96;            // below the HUD panel and weapon box
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
    pix(244, 42, 44, 28, 0x2a1f5a);                                              // weapon box (tap / Q / Y to swap)
    const flash = Math.floor(this.t * 8) % 2;
    const gx = 96, gy = 46, gw = 136, gh = 8;
    pix(gx, gy, gw, gh, 0x0c0a24);
    this.fuelFlash = Math.max(0, (this.fuelFlash || 0) - (this.lastDt || 0.016));
    const fc = this.fuelFlash > 0 && Math.floor(this.fuelFlash * 20) % 2 ? 0xffffff : (P.fuel > 0.3 ? 0x39c6ff : (flash ? 0xff5a3c : 0xa02a1a)), nb = 17, bw = gw / nb;   // (flashes white when a stomp refuels it)    // fills in chunky 8px blocks
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
  scene: [IntroScene, EndingScene, MenuScene, SelectScene, WeaponScene, Level1]
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
