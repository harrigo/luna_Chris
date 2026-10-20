// Luna Chris - level definitions, enemy table, extra art and the level-select screen.
// To add a level: add an entry to LEVELS (waves, palette, music, boss) - main.js reads everything from here.

const S = (type, t) => ({ type, t });     // spawn helper: S('mouse', 2.5) = a mouse 2.5s into the wave

// Per-enemy stats. hp = shots to kill, r = hit radius, ch = centre height above its feet, drop = chance of a cheese wedge,
// big = may drop the Parmesan Power-Up, oy = sprite origin Y.
const ENEMY = {
  mouse:    { hp: 2,  r: 14, ch: 10, tex: 'mouse',    oy: 22 / 24, drop: 0.15 },
  flyer:    { hp: 2,  r: 15, ch: 12, tex: 'flyer',    oy: 0.6,     drop: 0.28 },
  golem:    { hp: 14, r: 26, ch: 28, tex: 'golem',    oy: 1,       drop: 0.65, big: true },
  germ:     { hp: 3,  r: 17, ch: 15, tex: 'germ',     oy: 0.85,    drop: 0.18 },
  minigerm: { hp: 1,  r: 11, ch: 9,  tex: 'minigerm', oy: 0.85,    drop: 0.05 },
  frog:     { hp: 5,  r: 24, ch: 18, tex: 'frog',     oy: 0.92,    drop: 0.55, big: true },
  drone:    { hp: 2,  r: 16, ch: 12, tex: 'drone',    oy: 0.5,     drop: 0.25 },
  slicer:   { hp: 5,  r: 21, ch: 17, tex: 'slicer',   oy: 0.9,     drop: 0.55, big: true }
};

const LEVELS = {
  1: {
    id: 1, name: 'The Gruyère Globe', short: 'GRUYERE GLOBE', blurb: 'A cheesy cratered moon.\nGouda-Golems and space-mice.',
    music: 'level1', bossName: 'CRUSTY CROQUE MONSIEUR', tip: '',
    radius: 420, sky: [0x0b1020, 0x1b1245], bg: '#0b1020', starTint: 0xffffff, dustAlpha: 1, bgDecor: null,
    planet: { fill: 0xf0cb52, inner: 0xe6bd45, rim: 0xffe58a, glow: 0xfff1b5 },
    dust: [0x6a4cff, 0xb04cff, 0x3aa0ff, 0xff6ab0], decorTint: 0xffffff, decorAlpha: 1,
    gravity: 1,
    waves: [
      { name: 'WAVE 1', spawns: [S('mouse', 0), S('mouse', 1), S('flyer', 2), S('mouse', 2.4), S('mouse', 3.6), S('flyer', 4), S('mouse', 4.8), S('flyer', 6.2), S('mouse', 6.8), S('mouse', 7.6)] },
      { name: 'WAVE 2', spawns: [S('golem', 0), S('mouse', 0.8), S('flyer', 1.6), S('mouse', 2.4), S('flyer', 3), S('golem', 4), S('mouse', 4.6), S('flyer', 5.2), S('mouse', 6), S('flyer', 6.8), S('mouse', 7.4), S('flyer', 8.4), S('mouse', 9)] },
      { name: 'WAVE 3', spawns: [S('golem', 0), S('mouse', 1), S('flyer', 1.8), S('golem', 2.6), S('mouse', 3), S('flyer', 3.6), S('mouse', 4.2), S('golem', 5.4), S('flyer', 6), S('mouse', 6.6), S('flyer', 7.6), S('mouse', 8.2), S('golem', 9), S('flyer', 9.6), S('mouse', 10.2)] }
    ],
    boss: { tex: 'croque', hp: 110, ai: 'croque' },
    win: 'The Croque Monsieur is toast. Literally.\nBessie is safe... for now.\nA fresh rat-ship is already circling.'
  },

  2: {
    id: 2, name: 'Gorgonzola Gulch', short: 'GORGONZOLA GULCH', blurb: 'Stinky blue-cheese swamp.\nSpores bend gravity. Germs and rat-frogs.',
    music: 'level2', bossName: 'BARON VON BLUE', tip: 'SPORES BEND GRAVITY!',
    radius: 580, sky: [0x02100c, 0x16584a], bg: '#02100c', starTint: 0xc8ffe6, dustAlpha: 1.6, bgDecor: 'motes',
    planet: { fill: 0x7a9ea6, inner: 0x5f868f, rim: 0xb5e3d2, glow: 0x9be8c8 },
    dust: [0x2fbf8f, 0x3ad0c0, 0x6a8cff, 0x9bff6a], decorTint: 0x4fa88f, decorAlpha: 1,
    gravity: 1,
    // spore clouds: theta, half-width (rad), gravity multiplier (green = floaty, purple = heavy)
    zones: [
      { theta: 0.0, half: 0.5, mult: 0.38 }, { theta: 1.05, half: 0.36, mult: 1.7 },
      { theta: 2.1, half: 0.5, mult: 0.38 }, { theta: 3.15, half: 0.36, mult: 1.7 },
      { theta: 4.2, half: 0.5, mult: 0.38 }, { theta: 5.25, half: 0.36, mult: 1.7 }
    ],
    waves: [
      { name: 'WAVE 1', spawns: [S('germ', 0), S('germ', 1.4), S('frog', 2.6), S('germ', 3.4), S('germ', 4.6), S('frog', 6), S('germ', 6.6), S('germ', 7.8)] },
      { name: 'WAVE 2', spawns: [S('frog', 0), S('germ', 0.8), S('germ', 1.8), S('frog', 3), S('germ', 3.6), S('germ', 4.6), S('frog', 6), S('germ', 6.4), S('germ', 7.4), S('frog', 8.6), S('germ', 9)] },
      { name: 'WAVE 3', spawns: [S('frog', 0), S('germ', 0.6), S('frog', 1.8), S('germ', 2.4), S('germ', 3.2), S('frog', 4.4), S('germ', 5), S('frog', 6.4), S('germ', 6.8), S('germ', 7.8), S('frog', 8.6), S('germ', 9.4)] }
    ],
    boss: { tex: 'baron', hp: 120, ai: 'baron' },
    win: 'Baron von Blue is mould-y history!\nBessie squelches free, narrowly.\nThe rats are heading for a giant grater...'
  },

  3: {
    id: 3, name: 'The Great Grater', short: 'THE GREAT GRATER', blurb: 'An industrial asteroid.\nThe floor is a giant grater!',
    music: 'level3', bossName: 'THE MEGA-MANDOLINE', tip: 'THE FLOOR IS A GRATER! USE THE PLATFORMS!',
    radius: 300, sky: [0x0e0506, 0x56260c], bg: '#0e0506', starTint: 0xffd9a8, dustAlpha: 1.4, bgDecor: 'gears',
    planet: { fill: 0x707a86, inner: 0x59616d, rim: 0xd5dde8, glow: 0xd5dde8 },
    dust: [0xff9a3a, 0xff6a3a, 0x8aa0c0, 0xffd23f], decorTint: 0x8a929c, decorAlpha: 0.55,
    gravity: 1,
    conveyor: 90,            // the surface scrolls backwards at this many units/s
    platforms: { count: 8, half: 0.2 },
    waves: [
      { name: 'WAVE 1', spawns: [S('slicer', 0), S('drone', 1.4), S('drone', 3), S('slicer', 4.2), S('drone', 5.6), S('drone', 7)] },
      { name: 'WAVE 2', spawns: [S('slicer', 0), S('drone', 0.8), S('drone', 2.4), S('slicer', 3.6), S('drone', 4.4), S('drone', 6), S('slicer', 7), S('drone', 8)] },
      { name: 'WAVE 3', spawns: [S('slicer', 0), S('drone', 0.8), S('drone', 1.8), S('slicer', 3), S('drone', 4), S('drone', 5), S('slicer', 6.4), S('drone', 7), S('drone', 8), S('slicer', 9.4)] }
    ],
    boss: { tex: 'mandoline', hp: 120, ai: 'mandoline' },
    win: 'The Mega-Mandoline is sliced and diced!\nBessie bounces clear of the blades.\nMore levels coming soon...'
  }
};

// ---------------------------------------------------------------- extra art (all drawn with code)
function makeLevelTextures(scene) {
  if (scene.textures.exists('germ')) return;
  const mk = (key, w, h, draw) => {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  };
  const OUT = 0x1a1020;

  // fuzzy mutated bacteria blob
  const germ = (g, cx, cy, r, fuzz) => {
    g.lineStyle(2, 0x2f6f5a, 1);
    for (let i = 0; i < fuzz; i++) {
      const a = (i / fuzz) * Math.PI * 2, l = r + 5 + (i % 3) * 1.6;
      g.lineBetween(cx + Math.cos(a) * (r - 2), cy + Math.sin(a) * (r - 2), cx + Math.cos(a) * l, cy + Math.sin(a) * l);
    }
    g.fillStyle(0x4fcf9a, 1).fillCircle(cx, cy, r);
    g.fillStyle(0x7be8b8, 1).fillCircle(cx - r * 0.25, cy - r * 0.3, r * 0.55);
    g.lineStyle(2, OUT, 1).strokeCircle(cx, cy, r);
  };
  mk('germ', 42, 40, g => {
    germ(g, 21, 21, 14, 16);
    g.fillStyle(0xffffff, 1).fillCircle(15, 17, 5).fillCircle(27, 17, 5);
    g.fillStyle(OUT, 1).fillCircle(16, 18, 2.2).fillCircle(26, 18, 2.2);
    g.fillStyle(0x1d4a3a, 1).fillRoundedRect(14, 25, 14, 5, 2);
    g.fillStyle(0xffffff, 1).fillRect(17, 25, 2, 3).fillRect(23, 25, 2, 3);
  });
  mk('minigerm', 26, 24, g => {
    germ(g, 13, 13, 8, 10);
    g.fillStyle(0xffffff, 1).fillCircle(10, 11, 3).fillCircle(16, 11, 3);
    g.fillStyle(OUT, 1).fillCircle(10.5, 11.5, 1.4).fillCircle(15.5, 11.5, 1.4);
  });

  // rat-frog hybrid: green skin, rat ears and tail, big eyes. Faces right.
  mk('frog', 60, 46, g => {
    g.lineStyle(3, 0xe9a8b8, 1).lineBetween(8, 30, 0, 18).lineBetween(0, 18, 4, 10);        // rat tail
    g.fillStyle(0x4d8a3c, 1).fillEllipse(26, 30, 38, 24);                                    // body
    g.fillStyle(0xcbe29a, 1).fillEllipse(30, 36, 26, 12);                                    // belly
    g.fillStyle(0x3d7230, 1).fillRoundedRect(8, 32, 18, 12, 5).fillRoundedRect(30, 36, 20, 9, 4);   // big back legs
    g.fillStyle(0x4d8a3c, 1).fillCircle(44, 24, 12);                                         // head
    g.fillStyle(0xe9a8b8, 1).fillCircle(38, 10, 6).fillCircle(50, 10, 6);                    // rat ears
    g.fillStyle(0x8a5a6a, 1).fillCircle(38, 10, 3).fillCircle(50, 10, 3);
    g.fillStyle(0xffffff, 1).fillCircle(40, 18, 5.5).fillCircle(50, 18, 5.5);                // goggle eyes
    g.fillStyle(OUT, 1).fillCircle(41.5, 19, 2.4).fillCircle(51.5, 19, 2.4);
    g.fillStyle(0x23461c, 1).fillRoundedRect(38, 28, 18, 5, 2);                              // wide mouth
    g.lineStyle(1.5, 0xe9a8b8, 1).lineBetween(54, 26, 62, 23).lineBetween(54, 28, 62, 30);   // whiskers
    g.lineStyle(2, OUT, 1).strokeCircle(44, 24, 12).strokeEllipse(26, 30, 38, 24);
  });

  // cheese-slicing drone: steel disc, rotor, blade underneath, angry red eye
  mk('drone', 50, 38, g => {
    g.fillStyle(0xaab4c4, 1).fillRect(4, 2, 42, 4);                                          // rotor
    g.fillStyle(0x6b7585, 1).fillRect(22, 5, 6, 6);
    g.fillStyle(0x8c98ab, 1).fillEllipse(25, 19, 38, 18);                                    // body
    g.fillStyle(0xc9d3e0, 1).fillEllipse(25, 15, 26, 8);
    g.fillStyle(0xff3c3c, 1).fillCircle(25, 19, 5);                                          // eye
    g.fillStyle(0xffffff, 1).fillCircle(23.5, 17.5, 1.6);
    g.fillStyle(0xd9e2f0, 1).fillTriangle(6, 28, 44, 28, 25, 37);                            // cheese-slicing blade
    for (let i = 0; i < 6; i++) g.fillStyle(0x7a8497, 1).fillTriangle(9 + i * 6, 28, 13 + i * 6, 28, 11 + i * 6, 32);
    g.lineStyle(2, OUT, 1).strokeEllipse(25, 19, 38, 18);
  });

  // slicer bot: a rolling saw-blade with a face
  mk('slicer', 46, 46, g => {
    g.fillStyle(0xcfd8e6, 1);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      g.fillTriangle(23 + Math.cos(a - 0.14) * 17, 23 + Math.sin(a - 0.14) * 17, 23 + Math.cos(a + 0.14) * 17, 23 + Math.sin(a + 0.14) * 17, 23 + Math.cos(a) * 23, 23 + Math.sin(a) * 23);
    }
    g.fillStyle(0x8c98ab, 1).fillCircle(23, 23, 18);
    g.fillStyle(0xaab4c4, 1).fillCircle(23, 23, 12);
    g.fillStyle(0xff3c3c, 1).fillCircle(23, 23, 5);
    g.fillStyle(0xffffff, 1).fillCircle(21.5, 21.5, 1.6);
    g.lineStyle(2, OUT, 1).strokeCircle(23, 23, 18);
  });

  // boss: Baron von Blue, a giant crowned blue-cheese blob with frog legs
  mk('baron', 116, 100, g => {
    g.fillStyle(0x3d7230, 1).fillRoundedRect(8, 74, 30, 22, 8).fillRoundedRect(78, 74, 30, 22, 8);   // frog feet
    g.fillStyle(0x7fa4e8, 1).fillEllipse(58, 54, 100, 76);                                            // blue-cheese body
    g.fillStyle(0xa9c4f5, 1).fillEllipse(48, 40, 56, 30);
    g.fillStyle(0x3d57a8, 1).fillCircle(26, 62, 7).fillCircle(86, 50, 9).fillCircle(70, 76, 6).fillCircle(40, 76, 5).fillCircle(96, 68, 5);   // mould veins
    g.fillStyle(0xffffff, 1).fillCircle(42, 44, 14).fillCircle(76, 44, 14);                           // goggle eyes
    g.fillStyle(OUT, 1).fillCircle(46, 47, 6).fillCircle(72, 47, 6);
    g.lineStyle(5, OUT, 1).lineBetween(28, 30, 54, 38).lineBetween(90, 30, 64, 38);                   // angry brows
    g.fillStyle(0x1b2a55, 1).fillRoundedRect(36, 62, 46, 16, 6);                                      // mouth
    g.fillStyle(0xffffff, 1).fillRect(42, 62, 6, 7).fillRect(56, 62, 6, 7).fillRect(70, 62, 6, 7);
    g.fillStyle(0xffd23f, 1).fillPoints([{ x: 30, y: 24 }, { x: 36, y: 4 }, { x: 46, y: 16 }, { x: 58, y: 0 }, { x: 70, y: 16 }, { x: 80, y: 4 }, { x: 86, y: 24 }], true);   // crown
    g.lineStyle(3, OUT, 1).strokePoints([{ x: 30, y: 24 }, { x: 36, y: 4 }, { x: 46, y: 16 }, { x: 58, y: 0 }, { x: 70, y: 16 }, { x: 80, y: 4 }, { x: 86, y: 24 }], true);
    g.lineStyle(3, OUT, 1).strokeEllipse(58, 54, 100, 76);
  });

  // boss: the Mega-Mandoline, a giant steel grater with spinning slicer blades
  mk('mandoline', 130, 96, g => {
    g.fillStyle(0x59616d, 1).fillRoundedRect(6, 6, 118, 84, 10);
    g.fillStyle(0xaab4c4, 1).fillRoundedRect(14, 12, 102, 72, 8);
    g.lineStyle(2, 0x59616d, 1);
    for (let y = 22; y < 80; y += 11) for (let x = 24; x < 108; x += 14) g.fillStyle(0x59616d, 1).fillCircle(x + ((y / 11) % 2) * 7, y, 3.2);   // grater holes
    g.fillStyle(0xd9e2f0, 1).fillRect(14, 56, 102, 6);                                               // blade slot
    g.fillStyle(0xff3c3c, 1).fillCircle(65, 38, 12);                                                 // angry eye
    g.fillStyle(0xffffff, 1).fillCircle(61, 34, 3.5);
    g.lineStyle(5, OUT, 1).lineBetween(46, 22, 62, 28).lineBetween(84, 22, 68, 28);
    g.fillStyle(0xd62828, 1).fillRoundedRect(36, 66, 58, 12, 4);                                     // grinning slot
    for (let i = 0; i < 6; i++) g.fillStyle(0xffffff, 1).fillTriangle(40 + i * 9, 66, 48 + i * 9, 66, 44 + i * 9, 74);
    g.fillStyle(0x3b4252, 1).fillRoundedRect(0, 40, 10, 24, 4).fillRoundedRect(120, 40, 10, 24, 4);  // handles
    g.lineStyle(4, OUT, 1).strokeRoundedRect(6, 6, 118, 84, 10);
  });

  // enemy bullets
  mk('spore', 18, 18, g => {
    g.fillStyle(0x9bff6a, 0.35).fillCircle(9, 9, 9);
    g.fillStyle(0x4fcf9a, 1).fillCircle(9, 9, 6);
    g.fillStyle(0xd9ffd0, 1).fillCircle(7, 7, 2.2);
    g.lineStyle(2, 0x1d4a3a, 1).strokeCircle(9, 9, 6);
  });
  mk('blade', 24, 24, g => {
    g.fillStyle(0xd9e2f0, 1);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.fillTriangle(12 + Math.cos(a - 0.2) * 7, 12 + Math.sin(a - 0.2) * 7, 12 + Math.cos(a + 0.2) * 7, 12 + Math.sin(a + 0.2) * 7, 12 + Math.cos(a) * 12, 12 + Math.sin(a) * 12);
    }
    g.fillStyle(0x8c98ab, 1).fillCircle(12, 12, 7);
    g.fillStyle(0x3b4252, 1).fillCircle(12, 12, 3);
  });
  // big background gear for the industrial level
  mk('gear', 180, 180, g => {
    g.fillStyle(0xffffff, 1);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.fillTriangle(90 + Math.cos(a - 0.17) * 70, 90 + Math.sin(a - 0.17) * 70, 90 + Math.cos(a + 0.17) * 70, 90 + Math.sin(a + 0.17) * 70, 90 + Math.cos(a + 0.05) * 88, 90 + Math.sin(a + 0.05) * 88);
      g.fillTriangle(90 + Math.cos(a - 0.17) * 70, 90 + Math.sin(a - 0.17) * 70, 90 + Math.cos(a - 0.05) * 88, 90 + Math.sin(a - 0.05) * 88, 90 + Math.cos(a + 0.05) * 88, 90 + Math.sin(a + 0.05) * 88);
    }
    g.fillCircle(90, 90, 74);
    g.fillStyle(0x000000, 1).fillCircle(90, 90, 44);                       // dark hole
    g.fillStyle(0xffffff, 1).fillCircle(90, 90, 14);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; g.fillRect(90 + Math.cos(a) * 28 - 5, 90 + Math.sin(a) * 28 - 5, 10, 10); }
  });
  // spore-cloud puff for the gravity zones
  mk('puff', 64, 64, g => { for (let i = 0; i < 10; i++) g.fillStyle(0xffffff, 0.09).fillCircle(32, 32, 32 - i * 3); });
}

// ---------------------------------------------------------------- level select
class SelectScene extends Phaser.Scene {
  constructor() { super('select'); }

  create() {
    makeTextures(this); makeLevelTextures(this);
    this.cameras.main.setBackgroundColor('#0b1020');
    this.cameras.main.fadeIn(250, 0, 0, 0);
    Sound.init(); Sound.music('title');
    this.wantFs = false;
    this.going = false;                     // (the scene object is reused, so reset this every visit)
    this.stars = [];
    for (let i = 0; i < 90; i++) this.stars.push({ x: Math.random(), y: Math.random(), s: 1 + Math.floor(Math.random() * 3), tw: Math.random() * 6 });
    this.bg = this.add.graphics().setDepth(0);
    this.ui = this.add.container(0, 0).setDepth(1);
    this.build();
    this.scale.on('resize', this.build, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.build, this));
    this.input.on('pointerup', () => {
      if (this.wantFs) { this.wantFs = false; try { const st = window.matchMedia && (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches); if (!st && !this.scale.isFullscreen) this.scale.startFullscreen({ navigationUI: 'hide' }); } catch (e) { /* ignore */ } }
    });
    if (this.input.keyboard) ['ONE', 'TWO', 'THREE'].forEach((k, i) => this.input.keyboard.on('keydown-' + k, () => this.go(i + 1)));
  }

  go(n) {
    if (this.going) return;
    this.going = true;
    Sound.sfx('wave');
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.time.delayedCall(230, () => this.scene.start('level1', { level: n, direct: true }));     // (timer, not the fade event: that can be skipped)
  }

  build() {
    const W = this.scale.width, H = this.scale.height;
    this.ui.removeAll(true);
    const f = (size, color, extra) => Object.assign({ fontFamily: PIXEL, fontSize: size + 'px', color }, extra || {});
    this.ui.add(this.add.text(W / 2, Math.max(22, H * 0.09), 'SELECT LEVEL', f(Math.min(26, W / 28), '#ffd23f', { stroke: '#1a1020', strokeThickness: 6 })).setOrigin(0.5));
    const gap = 16, cw = Math.min(250, (W - gap * 4) / 3), ch = Math.min(260, H * 0.68);
    const x0 = (W - (cw * 3 + gap * 2)) / 2, y0 = Math.max(48, H * 0.18);
    for (let i = 1; i <= 3; i++) {
      const L = LEVELS[i], x = x0 + (i - 1) * (cw + gap);
      const g = this.add.graphics();
      g.fillStyle(0x151b33, 1).fillRoundedRect(x, y0, cw, ch, 12);
      g.lineStyle(4, L.planet.rim, 1).strokeRoundedRect(x, y0, cw, ch, 12);
      const pr = Math.max(cw * 0.16, Math.min(cw * 0.25, cw * 0.2 * Math.pow(L.radius / 420, 0.6))), pcx = x + cw / 2, pcy = y0 + ch * 0.4;     // little planet
      g.fillStyle(L.planet.glow, 0.15).fillCircle(pcx, pcy, pr + 8);
      g.fillStyle(L.planet.fill, 1).fillCircle(pcx, pcy, pr);
      g.fillStyle(L.planet.inner, 1).fillCircle(pcx - pr * 0.25, pcy + pr * 0.2, pr * 0.55);
      g.lineStyle(3, L.planet.rim, 1).strokeCircle(pcx, pcy, pr);
      if (L.zones) { g.fillStyle(0x9bff6a, 0.35).fillCircle(pcx + pr * 0.6, pcy - pr * 0.7, 10).fillCircle(pcx - pr * 0.7, pcy - pr * 0.5, 7); }
      if (L.conveyor) { g.fillStyle(0xd5dde8, 1); for (let k = 0; k < 9; k++) { const a = -2.2 + k * 0.55; g.fillTriangle(pcx + Math.cos(a - 0.12) * pr, pcy + Math.sin(a - 0.12) * pr, pcx + Math.cos(a + 0.12) * pr, pcy + Math.sin(a + 0.12) * pr, pcx + Math.cos(a) * (pr + 9), pcy + Math.sin(a) * (pr + 9)); } }
      this.ui.add(g);
      this.ui.add(this.add.text(x + cw / 2, y0 + 14, 'LEVEL ' + i, f(11, '#9fd8ff')).setOrigin(0.5, 0));
      this.ui.add(this.add.text(x + cw / 2, y0 + ch * 0.64, L.short, f(10, '#ffffff', { align: 'center', wordWrap: { width: cw - 16 }, lineSpacing: 6 })).setOrigin(0.5, 0));
      this.ui.add(this.add.text(x + cw / 2, y0 + ch * 0.82, L.blurb, f(7, '#c9cde0', { align: 'center', wordWrap: { width: cw - 16 }, lineSpacing: 5 })).setOrigin(0.5, 0));
      const z = this.add.zone(x, y0, cw, ch).setOrigin(0).setInteractive({ useHandCursor: true });
      z.on('pointerdown', () => { this.wantFs = true; });
      z.on('pointerup', () => this.go(i));
      this.ui.add(z);
    }
    this.ui.add(this.add.text(W / 2, H - 16, 'TAP A LEVEL', f(9, '#6b7390')).setOrigin(0.5, 1));
  }

  update(time) {
    const W = this.scale.width, H = this.scale.height, g = this.bg;
    g.clear();
    for (const s of this.stars) { g.fillStyle(0xffffff, 0.35 + 0.35 * Math.sin(time / 600 + s.tw)).fillRect(s.x * W, s.y * H, s.s, s.s); }
  }
}
