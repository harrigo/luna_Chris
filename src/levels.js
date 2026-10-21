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
    radius: 420, sky: [0x111a6a, 0x4a2296], skyCols: [0x0a0c40, 0x11186a, 0x1d1f86, 0x2d2192, 0x45249a, 0x5e2a9c], bg: '#0a0c40', starTint: 0xffffff, dustAlpha: 1.3, bgDecor: 'cosmic', lava: 9,
    surface: { pal: [0x6a3a0c, 0xb8761a, 0xdca536, 0xf0cb52, 0xffe27a, 0xfff4c4], seed: 4242 },
    geysers: { n: 7, idle: [3.5, 7], warn: 1.1, erupt: 1.3, height: 175 },
    planet: { fill: 0xf0cb52, inner: 0xe6bd45, rim: 0xffe58a, glow: 0xfff1b5 },
    dust: [0x6a4cff, 0xb04cff, 0x3aa0ff, 0xff6ab0], decorTint: 0xffffff, decorAlpha: 1,
    gravity: 1, ledgeTex: 'ledge1',
    ledges: [{ theta: 0.9, half: 0.14, h: 85 }, { theta: 2.0, half: 0.12, h: 165 }, { theta: 3.3, half: 0.14, h: 85 }, { theta: 4.4, half: 0.12, h: 165 }, { theta: 5.5, half: 0.14, h: 85 }],
    props: [
      { tex: 'p_skull', n: 3, sc: [1, 1.3], tint: 0xe0d8c0 },
      { tex: 'p_tuft1', n: 12, sc: [0.8, 1.4], fg: true }],
    waves: [
      { name: 'WAVE 1', spawns: [S('mouse', 0), S('mouse', 1), S('flyer', 2), S('mouse', 2.4), S('mouse', 3.6), S('flyer', 4), S('mouse', 4.8), S('flyer', 6.2), S('mouse', 6.8), S('mouse', 7.6)] },
      { name: 'WAVE 2', spawns: [S('golem', 0), S('mouse', 0.8), S('flyer', 1.6), S('mouse', 2.4), S('flyer', 3), S('golem', 4), S('mouse', 4.6), S('flyer', 5.2), S('mouse', 6), S('flyer', 6.8), S('mouse', 7.4), S('flyer', 8.4), S('mouse', 9)] },
      { name: 'WAVE 3', spawns: [S('golem', 0), S('mouse', 1), S('flyer', 1.8), S('golem', 2.6), S('mouse', 3), S('flyer', 3.6), S('mouse', 4.2), S('golem', 5.4), S('flyer', 6), S('mouse', 6.6), S('flyer', 7.6), S('mouse', 8.2), S('golem', 9), S('flyer', 9.6), S('mouse', 10.2)] }
    ],
    boss: { tex: 'croque', hp: 110, ai: 'croque', armouredTop: true },
    win: 'The Croque Monsieur is toast. Literally.\nBessie was safe... for about ten seconds.\nAfter that rat-ship!'
  },

  2: {
    id: 2, name: 'Gorgonzola Gulch', short: 'GORGONZOLA GULCH', blurb: 'Stinky blue-cheese swamp.\nSpores bend gravity. Germs and rat-frogs.',
    music: 'level2', bossName: 'BARON VON BLUE', tip: 'SPORES BEND GRAVITY!',
    radius: 580, sky: [0x02100c, 0x16584a], bg: '#02100c', starTint: 0xc8ffe6, dustAlpha: 1.6, bgDecor: 'motes',
    planet: { fill: 0x7a9ea6, inner: 0x5f868f, rim: 0xb5e3d2, glow: 0x9be8c8 },
    dust: [0x2fbf8f, 0x3ad0c0, 0x6a8cff, 0x9bff6a], decorTint: 0x4fa88f, decorAlpha: 1,
    gravity: 1, ledgeTex: 'ledge2',
    ledges: [{ theta: 0.7, half: 0.1, h: 90 }, { theta: 1.5, half: 0.09, h: 170 }, { theta: 2.5, half: 0.1, h: 90 }, { theta: 3.6, half: 0.09, h: 170 }, { theta: 4.5, half: 0.1, h: 90 }, { theta: 5.5, half: 0.09, h: 170 }],
    props: [
      { tex: 'pile_tyres', n: 7, sc: [2.4, 3.6], depth: 1.6, tint: 0x40604f, alpha: 0.6, h: -10 },
      { tex: 'pile_tyres', n: 7, sc: [1.2, 1.9], tint: 0x9fb8a8, alpha: 0.92 },
      { tex: 'pile_bones', n: 5, sc: [1.1, 1.8], tint: 0xc8c8b0, alpha: 0.9 },
      { tex: 'p_shroom', n: 6, sc: [0.9, 1.6] }, { tex: 'p_reed', n: 10, sc: [0.9, 1.5], sway: true }, { tex: 'p_stalk', n: 4, sc: [0.9, 1.4] },
      { tex: 'p_tuft2', n: 16, sc: [0.8, 1.4], fg: true, sway: true }],
    waves: [
      { name: 'WAVE 1', spawns: [S('germ', 0), S('germ', 1.4), S('frog', 2.6), S('germ', 3.4), S('germ', 4.6), S('frog', 6), S('germ', 6.6), S('germ', 7.8)] },
      { name: 'WAVE 2', spawns: [S('frog', 0), S('germ', 0.8), S('germ', 1.8), S('frog', 3), S('germ', 3.6), S('germ', 4.6), S('frog', 6), S('germ', 6.4), S('germ', 7.4), S('frog', 8.6), S('germ', 9)] },
      { name: 'WAVE 3', spawns: [S('frog', 0), S('germ', 0.6), S('frog', 1.8), S('germ', 2.4), S('germ', 3.2), S('frog', 4.4), S('germ', 5), S('frog', 6.4), S('germ', 6.8), S('germ', 7.8), S('frog', 8.6), S('germ', 9.4)] }
    ],
    boss: { tex: 'baron', hp: 120, ai: 'baron' },
    win: 'Baron von Blue is mould-y history!\nBessie squelched free... and got nabbed AGAIN.\nThe rats are heading for a giant grater...'
  },

  3: {
    id: 3, name: 'The Great Grater', short: 'THE GREAT GRATER', blurb: 'An industrial asteroid.\nThe floor is a giant grater!',
    music: 'level3', bossName: 'THE MEGA-MANDOLINE', tip: 'THE FLOOR IS A GRATER! USE THE PLATFORMS!',
    radius: 300, sky: [0x0e0506, 0x56260c], bg: '#0e0506', starTint: 0xffd9a8, dustAlpha: 1.4, bgDecor: 'gears',
    planet: { fill: 0x707a86, inner: 0x59616d, rim: 0xd5dde8, glow: 0xd5dde8 },
    dust: [0xff9a3a, 0xff6a3a, 0x8aa0c0, 0xffd23f], decorTint: 0x8a929c, decorAlpha: 0.55,
    gravity: 1, ledgeTex: 'ledge3',
    ledges: [{ theta: 0.5, half: 0.15, h: 95 }, { theta: 1.8, half: 0.14, h: 175 }, { theta: 3.1, half: 0.15, h: 95 }, { theta: 4.3, half: 0.14, h: 175 }, { theta: 5.5, half: 0.15, h: 95 }],
    props: [
      { tex: 'pile_scrap', n: 7, sc: [2.4, 3.6], depth: 1.6, tint: 0x5a3a34, alpha: 0.6, h: -10 },
      { tex: 'pile_scrap', n: 6, sc: [1.2, 1.8], tint: 0xb4a8a8, alpha: 0.92 },
      { tex: 'pile_bones', n: 5, sc: [1.2, 1.8], tint: 0xd8b8a8, alpha: 0.92 },
      { tex: 'pile_tyres', n: 2, sc: [1.2, 1.7], tint: 0x9a8a8a },
      { tex: 'p_pipe', n: 3, sc: [0.9, 1.4] }, { tex: 'p_whisk', n: 4, sc: [0.9, 1.3] }, { tex: 'p_skull', n: 4, sc: [1.1, 1.5], tint: 0xe8c8b8 },
      { tex: 'p_cone', n: 9, sc: [0.8, 1.2], fg: true }],
    waves: [
      { name: 'WAVE 1', spawns: [S('slicer', 0), S('drone', 1.4), S('drone', 3), S('slicer', 4.2), S('drone', 5.6), S('drone', 7)] },
      { name: 'WAVE 2', spawns: [S('slicer', 0), S('drone', 0.8), S('drone', 2.4), S('slicer', 3.6), S('drone', 4.4), S('drone', 6), S('slicer', 7), S('drone', 8)] },
      { name: 'WAVE 3', spawns: [S('slicer', 0), S('drone', 0.8), S('drone', 1.8), S('slicer', 3), S('drone', 4), S('drone', 5), S('slicer', 6.4), S('drone', 7), S('drone', 8), S('slicer', 9.4)] }
    ],
    boss: { tex: 'mandoline', hp: 120, ai: 'mandoline' },
    // SECRET: a dull "background" black hole. Smash the three bits of floating junk high up and it wakes into a warp to level 5.5.
    // (Temporary home: per the roadmap the warp to 5.5 belongs on level 5 once that level exists.)
    warp: { to: 5.5, theta: 2.55, h: 238, relics: [{ theta: 1.72, h: 236 }, { theta: 4.4, h: 242 }, { theta: 0.42, h: 214 }] },
    win: 'The Mega-Mandoline is sliced and diced!\nBessie bounced clear of the blades... right into a tractor beam.\nMore levels coming soon...'
  },

  // LEVEL 5.5 (secret detour): reached through a warp hole (shows on level select once found)
  5.5: {
    id: 5.5, secret: true, name: 'The Forbidden Fondue Fountain', short: 'FONDUE FOUNTAIN', blurb: 'A molten cheese moon, deep in a warp.\nFondue fountains everywhere.',
    music: 'level1', bossName: 'LE GRAND FROMAGE', tip: 'WARP ZONE! MIND THE FONDUE FOUNTAINS!',
    radius: 460, sky: [0x12030a, 0x6a1220], skyCols: [0x12030a, 0x24050f, 0x3c0816, 0x580e1c, 0x781a20, 0x9a2c22], bg: '#12030a', starTint: 0xffd0a0, dustAlpha: 1.3, bgDecor: 'cosmic', lava: 14,
    surface: { pal: [0x5a1406, 0xa8380e, 0xe06c18, 0xf6a62e, 0xffd65e, 0xfff0b0], seed: 6161 },
    geysers: { n: 11, idle: [2.2, 4.6], warn: 0.9, erupt: 1.5, height: 235 },
    planet: { fill: 0xf6a62e, inner: 0xe06c18, rim: 0xffd65e, glow: 0xffb060 },
    dust: [0xff6a3a, 0xffb03a, 0xff3a6a, 0xffd23f], decorTint: 0xffffff, decorAlpha: 1,
    gravity: 1, ledgeTex: 'ledge1',
    ledges: [{ theta: 0.6, half: 0.12, h: 90 }, { theta: 1.5, half: 0.11, h: 175 }, { theta: 2.6, half: 0.12, h: 90 }, { theta: 3.6, half: 0.11, h: 175 }, { theta: 4.6, half: 0.12, h: 90 }, { theta: 5.5, half: 0.11, h: 175 }],
    props: [
      { tex: 'p_skull', n: 4, sc: [1, 1.4], tint: 0xffc8a8 },
      { tex: 'pile_bones', n: 4, sc: [1.1, 1.6], tint: 0xe8a888, alpha: 0.92 },
      { tex: 'p_tuft1', n: 12, sc: [0.8, 1.3], fg: true, tint: 0xff9a5a }],
    waves: [
      { name: 'WAVE 1', spawns: [S('mouse', 0), S('flyer', 0.8), S('mouse', 1.6), S('drone', 2.4), S('mouse', 3.2), S('flyer', 4), S('golem', 5), S('mouse', 5.8), S('drone', 6.6), S('flyer', 7.4), S('mouse', 8.2)] },
      { name: 'WAVE 2', spawns: [S('frog', 0), S('drone', 0.8), S('mouse', 1.4), S('golem', 2.4), S('flyer', 3), S('drone', 3.8), S('frog', 4.8), S('mouse', 5.4), S('flyer', 6.2), S('drone', 7), S('golem', 8), S('mouse', 8.6)] },
      { name: 'WAVE 3', spawns: [S('golem', 0), S('slicer', 0.8), S('flyer', 1.6), S('drone', 2.2), S('frog', 3), S('mouse', 3.6), S('golem', 4.6), S('drone', 5.2), S('slicer', 6), S('flyer', 6.8), S('frog', 7.6), S('drone', 8.4), S('golem', 9.4)] }
    ],
    boss: { tex: 'croque', hp: 170, ai: 'croque', armouredTop: true, tint: 0xff9a6a },
    win: 'Le Grand Fromage melted into the fountain!\nBessie bobbed up out of the fondue... and straight into another rat-ship.\nMore warps are out there somewhere...'
  }
};

// the floating junk you smash to open the warp: a rusty sieve-satellite with a blinking light
function makeWarpTextures(scene) {
  makeBlackHolePix(scene, 'px_bhole');
  if (scene.textures.exists('w_relic')) return;
  pixSprite(scene, 'w_relic', 26, 24, p => {
    p.line([[13, 1], [13, 6]], 0x8a929c);
    p.ell(13, 13, 10, 8, [0xc0907a, 0x8a5a4a, 0x5a3a30]);
    p.ell(13, 12, 6.5, 4.5, [0x5a3a30, 0x3a2420, 0x2a1a18]);
    for (const [x, y] of [[9, 11], [13, 10], [17, 11], [11, 14], [15, 14]]) p.px(x, y, 0xffb070);
    p.rect(1, 12, 4, 15, 0x8a929c); p.rect(22, 12, 25, 15, 0x8a929c);
  });
}

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
  const GERM = [0x9cf0c4, 0x4fcf9a, 0x2a8a62];
  const germ = (a, cx, cy, r, fuzz) => {
    for (let i = 0; i < fuzz; i++) { const ang = (i / fuzz) * Math.PI * 2, l = r + 3 + (i % 3); a.line([[cx + Math.cos(ang) * (r - 1), cy + Math.sin(ang) * (r - 1)], [cx + Math.cos(ang) * l, cy + Math.sin(ang) * l]], 0x2f6f5a); }
    a.ell(cx, cy, r, r, GERM);
    a.ell(cx - r * 0.35, cy - r * 0.4, r * 0.25, r * 0.2, 0xd8ffe8);
    a.px(cx + r * 0.4, cy + r * 0.3, 0x2a8a62); a.px(cx - r * 0.5, cy + r * 0.5, 0x2a8a62);
  };
  pixSprite(scene, 'germ', 42, 40, a => {
    germ(a, 21, 21, 13, 16);
    a.ell(15, 17, 4.5, 4.5, 0xffffff); a.ell(27, 17, 4.5, 4.5, 0xffffff);
    a.rect(15, 17, 17, 19, OUTPX); a.rect(25, 17, 27, 19, OUTPX);
    a.rrect(14, 25, 28, 29, 1, 0x1d4a3a); a.rect(17, 25, 18, 27, 0xffffff); a.rect(23, 25, 24, 27, 0xffffff);
  });
  pixSprite(scene, 'minigerm', 26, 24, a => {
    germ(a, 13, 13, 7.5, 10);
    a.ell(10, 11, 2.6, 2.6, 0xffffff); a.ell(16, 11, 2.6, 2.6, 0xffffff); a.px(10, 12, OUTPX); a.px(16, 12, OUTPX);
  });

  // rat-frog hybrid: green skin, rat ears and tail, big eyes. Faces right.
  pixSprite(scene, 'frog', 60, 46, a => {
    const SKIN = [0x8ad06a, 0x4d8a3c, 0x2e5a22];
    a.line([[9, 30], [3, 22], [1, 16], [4, 10]], 0xe9a8b8, 2);                                                // rat tail
    a.rrect(7, 31, 26, 44, 5, [0x5aa046, 0x3d7230, 0x24481a]); a.rrect(30, 35, 50, 44, 4, [0x5aa046, 0x3d7230, 0x24481a]);   // big back legs
    a.ell(26, 30, 18, 11.5, SKIN); a.ell(30, 36, 12, 5.5, [0xeef8c8, 0xcbe29a, 0x9ab86a]);                 // body + belly
    a.ell(38, 10, 5.5, 5.5, 0xe9a8b8); a.ell(50, 10, 5.5, 5.5, 0xe9a8b8); a.ell(38, 10, 2.5, 2.5, 0x8a5a6a); a.ell(50, 10, 2.5, 2.5, 0x8a5a6a);   // rat ears
    a.ell(44, 24, 11.5, 11, SKIN);                                                                            // head
    a.ell(40, 18, 5, 5, 0xffffff); a.ell(50, 18, 5, 5, 0xffffff); a.rect(41, 18, 43, 20, OUTPX); a.rect(51, 18, 53, 20, OUTPX);
    a.rect(38, 28, 55, 30, 0x23461c); a.px(55, 27, 0x23461c);                                                 // wide grin
    a.line([[55, 25], [59, 23]], 0xe9a8b8); a.line([[55, 28], [59, 30]], 0xe9a8b8);                          // whiskers
    for (const [x, y] of [[18, 25], [24, 22], [30, 26], [14, 30]]) a.px(x, y, 0x2e5a22);                      // warts
  });

  // cheese-slicing drone: steel disc, rotor, blade underneath, angry red eye
  pixSprite(scene, 'drone', 50, 38, a => {
    const STL = [0xdfe6f0, 0x8c98ab, 0x56607a];
    a.rect(4, 2, 45, 4, 0xaab4c4); a.rect(4, 2, 45, 2, 0xe8eef6); a.rect(22, 5, 27, 9, 0x56607a);              // rotor + hub
    a.poly([[6, 27], [44, 27], [25, 36]], [0xf2f6fc, 0xc4cede, 0x8a96aa]);                                     // blade
    for (let i = 0; i < 6; i++) a.poly([[9 + i * 6, 27], [13 + i * 6, 27], [11 + i * 6, 31]], 0x6a7488);
    a.ell(25, 19, 19, 9, STL);
    a.rect(10, 20, 40, 21, 0x56607a);                                                                          // panel seam
    a.ell(25, 18, 5, 5, [0xff8a8a, 0xff3030, 0xa01010]); a.rect(23, 16, 24, 17, 0xffffff);                    // eye
  });

  // slicer bot: a rolling saw-blade with a face
  pixSprite(scene, 'slicer', 46, 46, a => {
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2;
      a.poly([[23 + Math.cos(ang - 0.15) * 16, 23 + Math.sin(ang - 0.15) * 16], [23 + Math.cos(ang + 0.15) * 16, 23 + Math.sin(ang + 0.15) * 16], [23 + Math.cos(ang + 0.05) * 22, 23 + Math.sin(ang + 0.05) * 22]], [0xf2f6fc, 0xcfd8e6, 0x9aa6ba]);
    }
    a.ell(23, 23, 17, 17, [0xc4cede, 0x8c98ab, 0x56607a]);
    a.ell(23, 23, 11, 11, [0xdfe6f0, 0xaab4c4, 0x7a8698]);
    for (let i = 0; i < 6; i++) { const ang = i / 6 * Math.PI * 2; a.px(23 + Math.cos(ang) * 14, 23 + Math.sin(ang) * 14, 0x3b4252); }   // bolts
    a.ell(23, 23, 5, 5, [0xff8a8a, 0xff3030, 0xa01010]); a.rect(21, 21, 22, 22, 0xffffff);
  });

  // boss: Baron von Blue, a giant crowned blue-cheese blob with frog legs
  pixSprite(scene, 'baron', 116, 100, a => {
    a.rrect(8, 74, 38, 96, 8, [0x5aa046, 0x3d7230, 0x24481a]); a.rrect(78, 74, 108, 96, 8, [0x5aa046, 0x3d7230, 0x24481a]);   // frog feet
    a.ell(58, 54, 49, 37, [0xb8d0ff, 0x7fa4e8, 0x4a6ab8]);                                                     // blue-cheese body
    for (const [x, y, r] of [[26, 62, 7], [86, 50, 8], [70, 78, 5.5], [40, 77, 4.5], [96, 68, 5], [20, 44, 4]]) { a.ell(x, y, r, r * 0.8, 0x3d57a8); a.ell(x + 1, y + 1, r * 0.5, r * 0.4, 0x2a3a80); }   // mould veins
    a.line([[30, 66], [24, 74]], 0x3d57a8, 2); a.line([[88, 56], [96, 50]], 0x3d57a8, 2);
    a.ell(42, 44, 13, 13, 0xffffff); a.ell(76, 44, 13, 13, 0xffffff);
    a.rect(43, 44, 49, 51, OUTPX); a.rect(69, 44, 75, 51, OUTPX); a.rect(44, 45, 45, 46, 0xffffff); a.rect(70, 45, 71, 46, 0xffffff);
    a.line([[28, 29], [54, 38]], OUTPX, 4); a.line([[90, 29], [64, 38]], OUTPX, 4);                           // angry brows
    a.rrect(36, 62, 82, 78, 5, 0x1b2a55); a.rect(42, 62, 47, 68, 0xffffff); a.rect(56, 62, 61, 68, 0xffffff); a.rect(70, 62, 75, 68, 0xffffff); a.rect(49, 73, 53, 78, 0xffffff); a.rect(63, 73, 67, 78, 0xffffff);
    a.poly([[30, 25], [36, 4], [46, 16], [58, 0], [70, 16], [80, 4], [86, 25]], [0xfff09a, 0xffd23f, 0xc9901a]);   // crown
    a.ell(58, 18, 3, 3, 0xff3a5a); a.ell(42, 20, 2, 2, 0x4ab0ff); a.ell(74, 20, 2, 2, 0x4ab0ff);
  }, 2);

  // boss: the Mega-Mandoline, a giant steel grater with spinning slicer blades
  pixSprite(scene, 'mandoline', 130, 96, a => {
    a.rrect(0, 40, 10, 64, 3, [0x5a6272, 0x3b4252, 0x23283a]); a.rrect(120, 40, 130, 64, 3, [0x5a6272, 0x3b4252, 0x23283a]);   // handles
    a.rrect(6, 6, 124, 90, 9, [0x7a8494, 0x59616d, 0x3b4252]);
    a.rrect(14, 12, 116, 84, 7, [0xdfe6f0, 0xaab4c4, 0x7a8698]);
    for (let y = 22; y < 80; y += 11) for (let x = 24; x < 108; x += 14) { const xx = x + ((y / 11) % 2) * 7; a.ell(xx, y, 3, 2.6, 0x3b4252); a.px(xx, y + 2, 0xf2f6fc); }   // grater holes
    a.rect(14, 56, 116, 61, 0xf2f6fc); a.rect(14, 61, 116, 62, 0x7a8698);                                      // blade slot
    a.ell(65, 38, 12, 12, [0xff8a8a, 0xff3030, 0xa01010]); a.rect(60, 33, 62, 35, 0xffffff);                  // angry eye
    a.line([[46, 22], [62, 28]], OUTPX, 4); a.line([[84, 22], [68, 28]], OUTPX, 4);
    a.rrect(36, 66, 94, 78, 3, 0xd62828); a.rect(36, 66, 94, 67, 0xff6a6a);
    for (let i = 0; i < 6; i++) a.poly([[40 + i * 9, 66], [48 + i * 9, 66], [44 + i * 9, 74]], 0xffffff);
  }, 2);

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
  // ---- ledges and scenery props
  // ---- Earthworm-Jim-ish junk heaps: tyres, bones, scrap (dark, chunky, faded when tinted/alpha'd behind)
  const tyre = (g, cx, cy, w, h) => {
    g.fillStyle(OUT, 1).fillEllipse(cx, cy, w + 4, h + 4);
    g.fillStyle(0x3a5a48, 1).fillEllipse(cx, cy, w, h);
    g.fillStyle(0x24382e, 1).fillEllipse(cx, cy + 1, w * 0.58, h * 0.5);
    g.fillStyle(OUT, 1).fillEllipse(cx, cy + 1, w * 0.3, h * 0.26);
    g.fillStyle(0x6f9a80, 1).fillEllipse(cx - w * 0.22, cy - h * 0.3, w * 0.3, h * 0.13);
  };
  mk('pile_tyres', 120, 78, g => {
    g.fillStyle(OUT, 0.5).fillEllipse(60, 76, 116, 8);
    const rows = [[18, 66, 44, 22, 4], [18, 78, 44, 22, 3], [60, 66, 44, 22, 3], [102, 66, 40, 22, 2]];
    for (const [x, y, w, h] of rows) tyre(g, x, y, w, h);
    tyre(g, 40, 46, 42, 22); tyre(g, 80, 46, 42, 22); tyre(g, 60, 27, 40, 21); tyre(g, 59, 10, 34, 18);
  });
  const bone = (g, x1, y1, x2, y2) => {
    g.lineStyle(7, OUT, 1).lineBetween(x1, y1, x2, y2);
    g.lineStyle(4, 0xe4dcc4, 1).lineBetween(x1, y1, x2, y2);
    g.fillStyle(OUT, 1).fillCircle(x1, y1, 5).fillCircle(x2, y2, 5);
    g.fillStyle(0xe4dcc4, 1).fillCircle(x1, y1, 3.5).fillCircle(x2, y2, 3.5);
  };
  const skull = (g, cx, cy, r) => {
    g.fillStyle(OUT, 1).fillCircle(cx, cy, r + 2).fillRoundedRect(cx - r * 0.6 - 2, cy + r * 0.4, r * 1.2 + 4, r * 0.9 + 2, 3);
    g.fillStyle(0xe8e0c8, 1).fillCircle(cx, cy, r).fillRoundedRect(cx - r * 0.6, cy + r * 0.45, r * 1.2, r * 0.8, 2);
    g.fillStyle(OUT, 1).fillCircle(cx - r * 0.38, cy - r * 0.05, r * 0.3).fillCircle(cx + r * 0.38, cy - r * 0.05, r * 0.3);
    g.fillTriangle(cx - 2, cy + r * 0.25, cx + 2, cy + r * 0.25, cx, cy + r * 0.5);
    for (let i = -1; i <= 1; i++) g.fillRect(cx + i * r * 0.32 - 1, cy + r * 0.8, 2, r * 0.45);
    g.fillStyle(0xff3a3a, 1).fillCircle(cx - r * 0.38, cy - r * 0.05, 1.6).fillCircle(cx + r * 0.38, cy - r * 0.05, 1.6);   // glowing eyes
  };
  mk('p_skull', 30, 30, g => skull(g, 15, 13, 10));
  mk('pile_bones', 110, 62, g => {
    g.fillStyle(OUT, 0.5).fillEllipse(55, 60, 104, 6);
    bone(g, 8, 56, 70, 40); bone(g, 100, 56, 36, 38); bone(g, 14, 44, 96, 50); bone(g, 30, 56, 84, 30); bone(g, 70, 58, 98, 34);
    for (let i = 0; i < 5; i++) { g.lineStyle(6, OUT, 1).beginPath().arc(55, 52, 18 + i * 4, Math.PI * 1.08, Math.PI * 1.9).strokePath(); g.lineStyle(3, 0xe4dcc4, 1).beginPath().arc(55, 52, 18 + i * 4, Math.PI * 1.08, Math.PI * 1.9).strokePath(); }
    skull(g, 55, 22, 11);
  });
  mk('pile_rind', 100, 56, g => {
    g.fillStyle(OUT, 0.5).fillEllipse(50, 54, 96, 6);
    const tri = (x1, y1, x2, y2, x3, y3, c) => { g.fillStyle(OUT, 1).fillTriangle(x1 - 2, y1 + 2, x2, y2 - 3, x3 + 2, y3 + 2); g.fillStyle(c, 1).fillTriangle(x1, y1, x2, y2, x3, y3); };
    tri(2, 54, 20, 22, 46, 54, 0xe8c040); tri(30, 54, 52, 10, 78, 54, 0xf0cb52); tri(62, 54, 82, 26, 98, 54, 0xd9a830);
    g.fillStyle(0xb5851c, 1).fillCircle(24, 44, 3).fillCircle(50, 40, 4).fillCircle(60, 48, 3).fillCircle(84, 46, 3).fillCircle(46, 24, 2);
    bone(g, 6, 50, 36, 44);
  });
  mk('pile_scrap', 120, 80, g => {
    g.fillStyle(OUT, 0.5).fillEllipse(60, 78, 116, 6);
    const plate = (pts, c) => { g.fillStyle(OUT, 1).fillPoints(pts.map(p => ({ x: p[0], y: p[1] })).concat(), true); };
    const poly = (pts, c, hi) => {
      const P = pts.map(p => ({ x: p[0], y: p[1] }));
      g.fillStyle(OUT, 1).fillPoints(P.map(p => ({ x: p.x + (p.x < 60 ? -2 : 2), y: p.y + 2 })), true);
      g.fillStyle(c, 1).fillPoints(P, true);
      g.lineStyle(2, hi, 1).lineBetween(P[0].x, P[0].y, P[1].x, P[1].y);
    };
    poly([[4, 78], [14, 36], [40, 78]], 0x566070, 0x9aa8b8);
    poly([[30, 78], [58, 6], [82, 78]], 0x6a7482, 0xc0ccd8);
    poly([[70, 78], [100, 30], [116, 78]], 0x4a525e, 0x8a98a8);
    poly([[44, 78], [70, 40], [96, 78]], 0x7a4a34, 0xd0825a);                       // rusty plate
    g.fillStyle(OUT, 1).fillCircle(86, 40, 14); g.fillStyle(0x8a6a50, 1).fillCircle(86, 40, 12); g.fillStyle(OUT, 1).fillCircle(86, 40, 5);   // gear
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.fillStyle(0x8a6a50, 1).fillRect(86 + Math.cos(a) * 13 - 2, 40 + Math.sin(a) * 13 - 2, 4, 4); }
    g.lineStyle(5, OUT, 1).lineBetween(14, 36, 4, 18); g.lineStyle(3, 0xa8b4c4, 1).lineBetween(14, 36, 4, 18);        // bent pipe
    g.fillStyle(0xff3a3a, 1).fillCircle(58, 12, 2.4);                                                                  // warning light
    bone(g, 20, 72, 52, 66);
  });
  // ledge slabs: chunky top with a ragged rocky underside, one per level
  const ledge = (key, top, topHi, under, underHi) => mk(key, 72, 30, g => {
    const tri = (x, w, d, c) => { g.fillStyle(c, 1).fillTriangle(x, 10, x + w, 10, x + w * 0.5, 10 + d); };
    for (const [x, w, d] of [[2, 16, 14], [14, 18, 20], [30, 14, 12], [40, 18, 18], [54, 16, 13]]) { tri(x - 1, w + 2, d + 2, OUT); tri(x, w, d, under); }
    g.fillStyle(underHi, 1).fillTriangle(16, 11, 22, 11, 20, 24).fillTriangle(42, 11, 48, 11, 46, 22);
    g.fillStyle(OUT, 1).fillRoundedRect(0, 1, 72, 14, 5);
    g.fillStyle(top, 1).fillRoundedRect(2, 2, 68, 10, 4);
    g.fillStyle(topHi, 1).fillRoundedRect(4, 3, 64, 3, 2);
  });
  ledge('ledge1', 0xd9902a, 0xf5c860, 0x5a3a6a, 0x8a6aa8);
  ledge('ledge2', 0x7a6a3a, 0xb0a060, 0x2a4a48, 0x4f8a7a);
  ledge('ledge3', 0x6a6f7a, 0xb8c0cc, 0x4a2a2a, 0x9a4a3a);
  mk('ledge', 64, 16, g => {
    g.fillStyle(OUT, 1).fillRoundedRect(0, 2, 64, 13, 4);
    g.fillStyle(0xffffff, 1).fillRoundedRect(2, 3, 60, 8, 3);
    g.fillStyle(0xb0b0b0, 1).fillRect(4, 11, 56, 3);
    g.fillStyle(0x808080, 1).fillCircle(14, 7, 2).fillCircle(32, 8, 2).fillCircle(50, 7, 2);
  });
  mk('p_rock', 30, 22, g => {
    g.fillStyle(OUT, 1).fillTriangle(0, 22, 9, 3, 30, 22); g.fillStyle(0xd9b13a, 1).fillTriangle(3, 20, 10, 6, 25, 20);
    g.fillStyle(0xf0cb52, 1).fillTriangle(10, 6, 14, 8, 8, 14);
  });
  mk('p_wedge', 34, 26, g => {
    g.fillStyle(OUT, 1).fillTriangle(0, 26, 4, 6, 34, 26); g.fillStyle(0xffd23f, 1).fillTriangle(3, 24, 6, 9, 29, 24);
    g.fillStyle(0xc99a2a, 1).fillCircle(11, 19, 3).fillCircle(20, 21, 2).fillCircle(9, 13, 2);
  });
  mk('p_flag', 24, 44, g => {
    g.fillStyle(OUT, 1).fillRect(5, 4, 4, 40); g.fillStyle(0xcfcfcf, 1).fillRect(6, 5, 2, 38);
    g.fillStyle(OUT, 1).fillTriangle(8, 4, 24, 11, 8, 18); g.fillStyle(0xff6a6a, 1).fillTriangle(9, 6, 21, 11, 9, 16);
    g.fillStyle(0xffd23f, 1).fillCircle(14, 11, 2);
  });
  mk('p_tuft1', 18, 10, g => { g.fillStyle(0xb5851c, 1).fillTriangle(0, 10, 3, 2, 6, 10).fillTriangle(5, 10, 9, 0, 13, 10).fillTriangle(12, 10, 15, 3, 18, 10); });
  mk('p_shroom', 30, 34, g => {
    g.fillStyle(OUT, 1).fillRect(11, 16, 9, 18).fillEllipse(15, 14, 30, 22);
    g.fillStyle(0xdfe8d0, 1).fillRect(12, 17, 7, 16); g.fillStyle(0x3a7fd0, 1).fillEllipse(15, 14, 26, 18);
    g.fillStyle(0xcfe8ff, 1).fillCircle(9, 12, 2).fillCircle(17, 9, 2).fillCircle(21, 15, 2);
  });
  mk('p_reed', 14, 52, g => {
    g.fillStyle(OUT, 1).fillRect(5, 12, 4, 40).fillRoundedRect(3, 0, 8, 20, 3);
    g.fillStyle(0x4a8f3a, 1).fillRect(6, 13, 2, 38); g.fillStyle(0x7a4a2a, 1).fillRoundedRect(4, 1, 6, 18, 2);
  });
  mk('p_stalk', 22, 40, g => {
    g.fillStyle(OUT, 1).fillTriangle(0, 40, 11, 0, 22, 40); g.fillStyle(0x6fb4e8, 1).fillTriangle(3, 38, 11, 6, 19, 38);
    g.fillStyle(0xcfe8ff, 1).fillTriangle(9, 12, 12, 12, 10, 30);
  });
  mk('p_tuft2', 20, 14, g => { g.fillStyle(0x2f9f6a, 1).fillTriangle(0, 14, 3, 1, 7, 14).fillTriangle(6, 14, 10, 0, 14, 14).fillTriangle(12, 14, 17, 3, 20, 14); });
  mk('p_pipe', 22, 36, g => {
    g.fillStyle(OUT, 1).fillRect(2, 8, 18, 28).fillRect(0, 2, 22, 10);
    g.fillStyle(0x8a929c, 1).fillRect(4, 10, 14, 26); g.fillStyle(0xb8c0cc, 1).fillRect(2, 4, 18, 6); g.fillStyle(0xd8e0ec, 1).fillRect(6, 10, 3, 24);
  });
  mk('p_whisk', 26, 34, g => {
    g.lineStyle(3, OUT, 1).strokeEllipse(13, 12, 22, 22).strokeEllipse(13, 12, 10, 22); g.fillStyle(OUT, 1).fillRect(10, 22, 6, 12);
    g.lineStyle(1.5, 0xd8e0ec, 1).strokeEllipse(13, 12, 22, 22).strokeEllipse(13, 12, 10, 22); g.fillStyle(0x8a929c, 1).fillRect(11, 23, 4, 10);
  });
  mk('p_crate', 30, 28, g => {
    g.fillStyle(OUT, 1).fillRect(0, 0, 30, 28); g.fillStyle(0x6a717c, 1).fillRect(2, 2, 26, 24);
    g.lineStyle(2, 0xb8c0cc, 1).lineBetween(2, 2, 28, 26).lineBetween(28, 2, 2, 26);
    g.fillStyle(0xffd23f, 1).fillRect(2, 11, 26, 5);
  });
  mk('p_cone', 14, 16, g => { g.fillStyle(OUT, 1).fillTriangle(0, 16, 7, 0, 14, 16); g.fillStyle(0xff8a2a, 1).fillTriangle(2, 15, 7, 3, 12, 15); g.fillStyle(0xffffff, 1).fillRect(4, 9, 6, 2); });
  // ---- level 1 "cosmic" sky: chunky 16-bit space stuff (white parts are tinted at runtime)
  const star5 = (g, cx, cy, ro, ri) => {
    const pts = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? ri : ro; pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }); }
    return pts;
  };
  mk('c_star', 26, 26, g => {
    g.fillStyle(OUT, 1).fillPoints(star5(g, 13, 14, 13, 6), true);
    g.fillStyle(0xffffff, 1).fillPoints(star5(g, 13, 14, 9.5, 4.2), true);
  });
  const spiral = (g, cx, cy, arms, col, maxR) => {
    for (let arm = 0; arm < arms; arm++) {
      for (let i = 0; i < 70; i++) {
        const t = i / 70, a = arm * (Math.PI * 2 / arms) + t * 4.2, r = 4 + t * maxR;
        g.fillStyle(col, (1 - t) * 0.85).fillCircle(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.62, 6 * (1 - t) + 1.5);
      }
    }
  };
  mk('c_galaxy', 120, 90, g => {
    spiral(g, 60, 45, 2, 0xffffff, 54);
    g.fillStyle(0xffffff, 1).fillEllipse(60, 45, 20, 13);
  });
  mk('c_disk', 120, 90, g => {                     // black hole accretion swirl (orange, not tinted)
    spiral(g, 60, 45, 3, 0xff8a2a, 52);
    spiral(g, 60, 45, 3, 0xffd23f, 30);
  });
  mk('c_hole', 40, 30, g => {
    g.fillStyle(0x6a2aff, 0.5).fillEllipse(20, 15, 40, 28);
    g.fillStyle(0x000000, 1).fillEllipse(20, 15, 28, 19);
  });
  mk('c_ringed', 90, 56, g => {
    g.lineStyle(9, OUT, 1).strokeEllipse(45, 30, 84, 22);
    g.lineStyle(5, 0xffd9a8, 1).strokeEllipse(45, 30, 84, 22);
    g.fillStyle(OUT, 1).fillCircle(45, 28, 22);
    g.fillStyle(0xff9a5a, 1).fillCircle(45, 28, 19);
    g.fillStyle(0xe0603a, 1).fillRect(28, 20, 34, 5).fillRect(27, 31, 36, 4);
    g.fillStyle(0xffd0a0, 1).fillCircle(37, 20, 5);
    g.lineStyle(5, 0xffd9a8, 1).beginPath().arc(45, 30, 42, 0.15, Math.PI - 0.15).strokePath();   // front of the ring
  });
  // bubbling cheese-lava crater on the moon's surface + its droplets
  mk('lava_pool', 76, 22, g => {
    g.fillStyle(OUT, 1).fillEllipse(38, 11, 76, 22);
    g.fillStyle(0xb06a10, 1).fillEllipse(38, 11, 70, 17);
    g.fillStyle(0xff7a1a, 1).fillEllipse(38, 12, 56, 11);
    g.fillStyle(0xffd23f, 1).fillEllipse(34, 11, 30, 5);
  });
  mk('lava_glow', 90, 50, g => { for (let i = 0; i < 8; i++) g.fillStyle(0xff9a2a, 0.08).fillEllipse(45, 25, 90 - i * 10, 50 - i * 5.5); });
  mk('lava_drop', 10, 10, g => { g.fillStyle(OUT, 1).fillCircle(5, 5, 5); g.fillStyle(0xff8a1a, 1).fillCircle(5, 5, 3.6); g.fillStyle(0xffe27a, 1).fillCircle(4, 4, 1.6); });
  // fondue geyser: a crusty vent mound with a glowing crack, and the molten cheese blobs it throws
  mk('geyser_vent', 54, 20, g => {
    g.fillStyle(OUT, 1).fillEllipse(27, 14, 54, 16).fillTriangle(8, 14, 20, 2, 30, 14).fillTriangle(24, 14, 36, 0, 48, 14);
    g.fillStyle(0x9a5a14, 1).fillEllipse(27, 14, 48, 11).fillTriangle(12, 13, 20, 5, 28, 13).fillTriangle(27, 13, 36, 4, 44, 13);
    g.fillStyle(0xff8a1a, 1).fillRect(22, 9, 12, 3);
    g.fillStyle(0xffe27a, 1).fillRect(25, 9, 6, 2);
  });
  mk('fondue', 12, 12, g => { g.fillStyle(OUT, 1).fillCircle(6, 6, 6); g.fillStyle(0xffc23a, 1).fillCircle(6, 6, 4.6); g.fillStyle(0xfff3a0, 1).fillCircle(5, 4.5, 2.2); });
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
    if (this.input.keyboard) this.input.keyboard.on('keydown-FIVE', () => { if (Progress.found(5.5)) this.go(5.5); });
    if (this.input.keyboard) this.input.keyboard.on('keydown-ESC', () => { if (!this.going) this.scene.start('menu'); });
    // controller: left/right picks a card, A or Start plays it
    this.sel = this.sel || 1;
    this.selG = this.add.graphics().setDepth(2);
    const padOff = Pad.on(b => {
      if (b === 'left' || b === 'right') { this.sel = Phaser.Math.Wrap(this.sel + (b === 'left' ? -1 : 1), 1, 4); this.showSel = true; Sound.sfx('jump'); }
      else if (b === 'a' || b === 'start') this.go(this.sel);
      else if (b === 'b' || b === 'back') { if (!this.going) this.scene.start('menu'); }
      else if (b === 'y' && Progress.found(5.5)) this.go(5.5);
      else this.showSel = true;
    });
    this.events.once('shutdown', padOff);
  }

  go(n) {
    if (this.going) return;
    this.going = true;
    Sound.sfx('wave');
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.time.delayedCall(230, () => this.scene.start('weapons', { level: n }));     // next: choose a weapon (timer, not the fade event: that can be skipped)
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
    this.cardRects = [];
    for (let i = 1; i <= 3; i++) this.cardRects[i] = { x: x0 + (i - 1) * (cw + gap), y: y0, w: cw, h: ch };
    const back = this.add.text(12, 12, '< MENU', f(8, '#9fa6c2', { stroke: '#1a1020', strokeThickness: 4 })).setInteractive({ useHandCursor: true });
    back.on('pointerup', () => { if (!this.going) this.scene.start('menu'); });
    this.ui.add(back);
    this.ui.add(this.add.text(W / 2, H - 16, Pad.state.connected ? 'PICK A LEVEL  (A TO PLAY)' : 'TAP A LEVEL', f(9, '#6b7390')).setOrigin(0.5, 1));
    if (Progress.found(5.5)) {                                       // found the warp: the secret level shows up
      const s = this.add.text(W / 2, Math.min(H - 34, y0 + ch + 18), '* WARP: LEVEL 5.5 FONDUE FOUNTAIN *' + (Pad.state.connected ? '  (Y)' : ''), f(9, '#ff9a5a', { stroke: '#1a1020', strokeThickness: 4 })).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
      s.on('pointerup', () => this.go(5.5));
      this.tweens.add({ targets: s, alpha: 0.55, yoyo: true, repeat: -1, duration: 600 });
      this.ui.add(s);
    }
  }

  update(time) {
    const W = this.scale.width, H = this.scale.height, g = this.bg;
    g.clear();
    for (const s of this.stars) { g.fillStyle(0xffffff, 0.35 + 0.35 * Math.sin(time / 600 + s.tw)).fillRect(s.x * W, s.y * H, s.s, s.s); }
    this.selG.clear();
    if ((this.showSel || Pad.state.connected) && this.cardRects && this.cardRects[this.sel]) {
      const r = this.cardRects[this.sel];
      this.selG.lineStyle(4, 0xffffff, 0.6 + 0.4 * Math.sin(time / 150)).strokeRoundedRect(r.x - 6, r.y - 6, r.w + 12, r.h + 12, 16);
    }
  }
}

// ---------------------------------------------------------------- pixel-art planet surface
// Builds a chunky 16-bit planet texture once: dithered cheese tones, a crusty rind round the edge, shaded craters,
// Gruyere holes, crumbs and debris. Drawn at HALF resolution and shown at 2x with nearest-neighbour filtering,
// so every texel is a fat pixel. It rotates with the world; lighting/depth is a separate fixed overlay.
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
function makePlanetTexture(scene, key, Rw, pal, seed) {
  if (scene.textures.exists(key)) return;
  const S = Math.round(Rw), c = S / 2, r = S / 2;                  // texture is Rw x Rw, shown at 2x = full diameter
  let sd = seed || 1;
  const rand = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  const hex = v => [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  const P = pal.map(hex);                                           // tones, dark -> light
  // smooth value noise
  const G = 24, grid = []; for (let i = 0; i < (G + 1) * (G + 1); i++) grid.push(rand());
  const noise = (x, y) => {
    const fx = x / S * G, fy = y / S * G, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
    const g = (a, b) => grid[Math.min(G, b) * (G + 1) + Math.min(G, a)];
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    return (g(ix, iy) * (1 - sx) + g(ix + 1, iy) * sx) * (1 - sy) + (g(ix, iy + 1) * (1 - sx) + g(ix + 1, iy + 1) * sx) * sy;
  };
  // features
  const craters = [], holes = [];
  for (let i = 0; i < 70; i++) { const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * r * 0.86; craters.push({ x: c + Math.cos(a) * d, y: c + Math.sin(a) * d, r: 3 + rand() * rand() * 16 }); }
  for (let i = 0; i < 45; i++) { const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * r * 0.8; holes.push({ x: c + Math.cos(a) * d, y: c + Math.sin(a) * d, r: 2 + rand() * 7 }); }
  const tex = scene.textures.createCanvas(key, S, S), ctx = tex.getContext(), img = ctx.createImageData(S, S), D = img.data;
  const put = (i, t) => { const col = P[Math.max(0, Math.min(P.length - 1, t))]; D[i] = col[0]; D[i + 1] = col[1]; D[i + 2] = col[2]; D[i + 3] = 255; };
  // pass 1: base cheese tone per pixel (T), then craters and holes are stamped over just their own bounding boxes
  // (same result as testing every feature at every pixel, but ~50x faster; the first feature listed wins, as before)
  const T = new Int8Array(S * S), dist = new Float32Array(S * S).fill(2);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = x + 0.5 - c, dy = y + 0.5 - c, d = Math.sqrt(dx * dx + dy * dy) / r;
    if (d > 1) continue;
    const j = y * S + x; dist[j] = d;
    const th = BAYER4[(y & 3) * 4 + (x & 3)];
    // base cheese: noise picks a tone, the Bayer threshold dithers between neighbouring tones
    let v = 2.7 + (noise(x, y) - 0.5) * 3.0 + (noise(x * 3.1, y * 3.1) - 0.5) * 1.2;
    // rind crust towards the edge
    if (d > 0.935) v = 1.5 + (noise(x * 2, y * 2) - 0.5) * 1.6 - (d - 0.935) * 8;
    else if (d > 0.9) v -= (d - 0.9) / 0.035 * 1.2;
    T[j] = Math.floor(v) + ((v - Math.floor(v)) > th ? 1 : 0);
  }
  // craters: dark bowl, lit lower-right lip, shadowed upper-left
  const took = new Uint8Array(S * S);
  for (const k of craters) {
    const e = k.r * 1.25;
    for (let y = Math.max(0, Math.floor(k.y - e)); y <= Math.min(S - 1, Math.ceil(k.y + e)); y++) for (let x = Math.max(0, Math.floor(k.x - e)); x <= Math.min(S - 1, Math.ceil(k.x + e)); x++) {
      const j = y * S + x; if (took[j] || dist[j] > 1) continue;
      const cx2 = x - k.x, cy2 = y - k.y, dd = Math.sqrt(cx2 * cx2 + cy2 * cy2) / k.r;
      if (dd >= 1.25) continue;
      took[j] = 1;
      const th = BAYER4[(y & 3) * 4 + (x & 3)];
      if (dd < 1) { const sh = (cx2 + cy2) / k.r; T[j] = (sh > 0.3 ? 2 : 1) + ((0.5 + sh * 0.5) > th ? 0 : -1); }
      else { const lip = (cx2 + cy2) / k.r; if (lip > 0.2) T[j] = Math.max(T[j], 4); else if (lip < -0.4) T[j] = Math.min(T[j], 1); }
    }
  }
  // gruyere holes: very dark with a bright lower rim
  took.fill(0);
  for (const h of holes) {
    for (let y = Math.max(0, Math.floor(h.y - h.r)); y <= Math.min(S - 1, Math.ceil(h.y + h.r)); y++) for (let x = Math.max(0, Math.floor(h.x - h.r)); x <= Math.min(S - 1, Math.ceil(h.x + h.r)); x++) {
      const j = y * S + x; if (took[j] || dist[j] > 1) continue;
      const hx = x - h.x, hy = y - h.y, dd = Math.sqrt(hx * hx + hy * hy) / h.r;
      if (dd < 1) { took[j] = 1; T[j] = dd > 0.7 && hy > 0 ? 3 : 0; }
    }
  }
  for (let j = 0; j < S * S; j++) { if (dist[j] > 1) continue; put(j * 4, dist[j] > 0.985 ? 0 : T[j]); }      // dark outline pixel ring
  // crumbs & debris: scattered 1-2px specks
  const speck = (x, y, t) => { if (x < 0 || y < 0 || x >= S || y >= S) return; const dd = Math.hypot(x - c, y - c) / r; if (dd > 0.96) return; put((y * S + x) * 4, t); };
  for (let i = 0; i < S * 3; i++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * r * 0.95, x = Math.round(c + Math.cos(a) * d), y = Math.round(c + Math.sin(a) * d);
    const kind = rand();
    if (kind < 0.55) speck(x, y, P.length - 1);                       // light crumb
    else if (kind < 0.85) speck(x, y, 0);                             // dark grit
    else { speck(x, y, 1); speck(x + 1, y, 1); speck(x, y + 1, 0); speck(x + 1, y + 1, 0); }   // little rock chunk
  }
  ctx.putImageData(img, 0, 0);
  tex.refresh();
  tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

// fixed (non-rotating) overlay: dithered darkening deeper into the planet + bright dithered rim
function makePlanetShade(scene, key, Rw) {
  if (scene.textures.exists(key)) return;
  const S = Math.round(Rw), c = S / 2, r = S / 2;
  const tex = scene.textures.createCanvas(key, S, S), ctx = tex.getContext(), img = ctx.createImageData(S, S), D = img.data;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const d = Math.hypot(x + 0.5 - c, y + 0.5 - c) / r;
    if (d > 1) continue;
    const th = BAYER4[(y & 3) * 4 + (x & 3)], i = (y * S + x) * 4;
    const dark = Math.max(0, Math.min(0.7, (0.8 - d) * 1.6));      // deeper = darker
    if (dark > th) { D[i] = 40; D[i + 1] = 14; D[i + 2] = 60; D[i + 3] = 105; }
    else if (d > 0.955 && d < 0.985 && th < 0.5) { D[i] = 255; D[i + 1] = 246; D[i + 2] = 190; D[i + 3] = 200; }   // rim light
  }
  ctx.putImageData(img, 0, 0);
  tex.refresh();
  tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

// ---------------------------------------------------------------- pixel-art sky (16-bit parallax layers)
// Every sky piece is drawn into a small canvas pixel by pixel (dithered, limited palette) and shown scaled up
// with nearest-neighbour filtering, so it reads as chunky 16-bit art rather than smooth vector shapes.
function pixTex(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h), ctx = tex.getContext(), img = ctx.createImageData(w, h), D = img.data;
  const put = (x, y, col, a) => {
    x |= 0; y |= 0; if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = (y * w + x) * 4; D[i] = (col >> 16) & 255; D[i + 1] = (col >> 8) & 255; D[i + 2] = col & 255; D[i + 3] = a === undefined ? 255 : a;
  };
  draw(put, w, h);
  ctx.putImageData(img, 0, 0); tex.refresh(); tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
}
const bay = (x, y) => BAYER4[(y & 3) * 4 + (x & 3)];
function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
function vnoise(rand, G) {
  const g = []; for (let i = 0; i < (G + 1) * (G + 1); i++) g.push(rand());
  return (u, v) => {                         // u, v in 0..1
    const fx = Math.max(0, Math.min(G - 0.001, u * G)), fy = Math.max(0, Math.min(G - 0.001, v * G)), ix = fx | 0, iy = fy | 0, tx = fx - ix, ty = fy - iy;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty), q = (a, b) => g[b * (G + 1) + a];
    return (q(ix, iy) * (1 - sx) + q(ix + 1, iy) * sx) * (1 - sy) + (q(ix, iy + 1) * (1 - sx) + q(ix + 1, iy + 1) * sx) * sy;
  };
}

// swirling nebula: domain-warped noise, quantised to a few tones with Bayer dithering, dithered soft edge
function makeNebula(scene, key, seed, pal) {
  pixTex(scene, key, 140, 90, (put, w, h) => {
    const r = rng(seed), n1 = vnoise(r, 6), n2 = vnoise(r, 12);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let u = x / w - 0.5, v = y / h - 0.5;
      const d = Math.hypot(u * 1.1, v * 1.5), ang = Math.atan2(v, u) + (0.55 - d) * 4.2;      // swirl
      const su = 0.5 + Math.cos(ang) * d, sv = 0.5 + Math.sin(ang) * d;
      let den = n1(su, sv) * 0.75 + n2(su, sv) * 0.4 - d * 1.5 + 0.12;
      const t = bay(x, y);
      if (den < 0.08 + t * 0.12) continue;                                                 // dithered transparent edge
      const lv = Math.min(pal.length - 1, Math.floor((den - 0.08) * 7 + t * 0.9));
      put(x, y, pal[lv], 255);
    }
  });
}

// star cluster: a dithered glow core with lots of single-pixel stars and a few cross-shaped bright ones
function makeCluster(scene, key, seed) {
  pixTex(scene, key, 48, 48, (put, w, h) => {
    const r = rng(seed), cols = [0xffffff, 0xbfe4ff, 0xfff1a0, 0xffc0f0];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const d = Math.hypot(x - 24, y - 24) / 24;
      if (d < 0.75 && (0.75 - d) * 0.9 > bay(x, y) + 0.25) put(x, y, d < 0.3 ? 0x6a52d8 : 0x3a2e8a);
    }
    for (let i = 0; i < 70; i++) { const a = r() * 6.28, d = Math.pow(r(), 1.8) * 22; put(24 + Math.cos(a) * d, 24 + Math.sin(a) * d, cols[i % 4]); }
    for (let i = 0; i < 5; i++) {
      const a = r() * 6.28, d = r() * 14, x = 24 + Math.cos(a) * d | 0, y = 24 + Math.sin(a) * d | 0, c = cols[i % 4];
      put(x, y, 0xffffff); put(x - 1, y, c); put(x + 1, y, c); put(x, y - 1, c); put(x, y + 1, c); if (i < 2) { put(x - 2, y, c); put(x + 2, y, c); put(x, y - 2, c); put(x, y + 2, c); }
    }
  });
}

// spiral galaxy, pixel version
function makeGalaxyPix(scene, key, seed, pal) {
  pixTex(scene, key, 64, 40, (put, w, h) => {
    const r = rng(seed);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const u = (x - 32) / 30, v = (y - 20) / 18, d = Math.hypot(u, v);
      if (d > 1) continue;
      const ang = Math.atan2(v, u), arm = Math.cos(2 * (ang - d * 4.5));                   // two arms
      const val = (arm * 0.5 + 0.5) * (1 - d) * 1.4 + (d < 0.22 ? 0.9 : 0) + (r() - 0.5) * 0.15;
      const t = bay(x, y);
      if (val < 0.18 + t * 0.2) continue;
      put(x, y, pal[Math.min(pal.length - 1, Math.floor(val * 3 + t * 0.8))]);
    }
  });
}

// black hole: dithered orange accretion ring, pitch-black core, purple halo
function makeBlackHolePix(scene, key) {
  pixTex(scene, key, 56, 40, (put, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const u = (x - 28) / 26, v = (y - 20) / 13, d = Math.hypot(u, v), t = bay(x, y);
      if (d < 0.38) put(x, y, 0x000000);
      else if (d < 0.44) put(x, y, 0xfff3c0);
      else if (d < 0.78) { const k = (d - 0.44) / 0.34; put(x, y, k + t * 0.35 < 0.45 ? 0xffd23f : (k + t * 0.35 < 0.85 ? 0xff8a1a : 0xc0401a)); }
      else if (d < 1 && (1 - d) * 3 > t) put(x, y, 0x4a1ab0);
    }
  });
}

// orbital debris: little tumbling bits of junk
function makeDebris(scene) {
  const OUTC = 0x1a1020;
  pixTex(scene, 'db_rock', 14, 12, put => {
    const rows = ['....xxxxx.....', '..xxoooooxx...', '.xoooooooooxx.', 'xoooo.ooooooox', 'xooooooo.oooox', 'xoooooooooooox', '.xoo.oooooooox', '.xoooooooo..ox', '..xxoooooooxx.', '....xxxxxxx...'];
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'x') put(x, y + 1, OUTC); else if (ch === 'o') put(x, y + 1, y < 4 ? 0x9a8a9e : 0x6a5a72); else if (ch === '.' && y > 0 && y < 9 && x > 0 && x < 13) {} }));
  });
  pixTex(scene, 'db_sat', 22, 10, put => {
    for (let x = 0; x < 22; x++) for (let y = 0; y < 10; y++) {
      const panel = (x < 7 || x > 14) && y > 1 && y < 8, body = x >= 8 && x <= 13 && y >= 2 && y <= 7;
      if (panel) put(x, y, (x + y) % 3 === 0 ? 0x1a1020 : ((x % 3 === 0) ? 0x2a4ab0 : 0x4a7aff));
      else if (body) put(x, y, x === 8 || x === 13 || y === 2 || y === 7 ? 0x1a1020 : 0xd8dfe8);
      else if (x === 7 || x === 14) { if (y === 4 || y === 5) put(x, y, 0x8a929c); }
    }
    put(11, 0, 0xff4040); put(11, 1, 0x8a929c);
  });
  pixTex(scene, 'db_bolt', 8, 8, put => {
    const rows = ['..xxxx..', '.xooOox.', 'xoo..oox', 'xo....ox', 'xo....ox', 'xoo..oox', '.xooOox.', '..xxxx..'];
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'x') put(x, y, OUTC); else if (ch === 'o') put(x, y, 0xb8c0cc); else if (ch === 'O') put(x, y, 0xffffff); }));
  });
  pixTex(scene, 'db_cheese', 12, 10, put => {
    const rows = ['xx..........', 'xoxx........', 'xoooxx......', 'xoo.ooxx....', 'xoooooooxx..', 'xoooo.oooox.', 'xooooooooox.', 'xxxxxxxxxxx.'];
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'x') put(x, y + 1, OUTC); else if (ch === 'o') put(x, y + 1, y < 4 ? 0xffe27a : 0xf0cb52); else if (ch === '.' && x < 10 && y > 1 && y < 7 && row[x - 1] === 'o') put(x, y + 1, 0xc99a2a); }));
  });
}

// chunky pixel star (tinted at runtime)
function makePixStar(scene) {
  pixTex(scene, 'px_star', 9, 9, put => {
    const rows = ['....x....', '....o....', '...xox...', 'xoooOooox', '..xoOox..', '..xo.ox..', '.xo...ox.', '.x.....x.', '.........'];
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'x') put(x, y, 0x1a1020); else if (ch === 'o') put(x, y, 0xdddddd); else if (ch === 'O') put(x, y, 0xffffff); }));
  });
}

// the tractor beam: dithered cone with bright rings; several frames so the rings travel down
function makeBeam(scene) {
  for (let f = 0; f < 4; f++) pixTex(scene, 'beam' + f, 40, 84, (put, w, h) => {
    for (let y = 0; y < h; y++) {
      const half = 4 + (y / h) * 16;
      for (let x = 0; x < w; x++) {
        const dx = Math.abs(x + 0.5 - w / 2) / half; if (dx > 1) continue;
        const t = bay(x, y), ring = ((y + f * 3) % 12) < 2;
        const fade = y / h < 0.55 ? 1 : Math.max(0, 1 - (y / h - 0.55) / 0.45);          // the bottom of the beam fades out
        const a = ((1 - dx) * 0.9 + (ring ? 0.35 : 0) - (y / h) * 0.25) * fade;
        if (a > t * 0.55) put(x, y, ring ? 0xfffbe0 : (dx < 0.45 ? 0xffe04a : 0xffa21a));
      }
    }
  });
}

// dithered banded sky gradient, regenerated to fit the screen (key reused)
function makeSkyDither(scene, key, w, h, cols) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  pixTex(scene, key, w, h, (put) => {
    const n = cols.length - 1;
    for (let y = 0; y < h; y++) {
      const v = (y / (h - 1)) * n;
      const lo = Math.floor(v), f = v - lo;
      for (let x = 0; x < w; x++) put(x, y, cols[Math.min(n, lo + (f > bay(x, y) ? 1 : 0))]);
    }
  });
}

// the level-1 style space backdrop: debris, stars, tractor beam, black holes, nebulae, galaxies, star clusters
function makeCosmicTextures(scene) {
  makeDebris(scene); makePixStar(scene); makeBeam(scene); makeBlackHolePix(scene, 'px_bhole');
  const nebPal = [[0x1e0c52, 0x3a1680, 0x6224a8, 0x9a3ccc, 0xd47af0], [0x2a0838, 0x581870, 0x8e2496, 0xd04ab8, 0xff90dc], [0x0c1a50, 0x16348a, 0x2a5cc0, 0x5a96f0, 0xa0d4ff]];
  for (let i = 0; i < 5; i++) makeNebula(scene, 'neb' + i, 101 + i * 37, nebPal[i % 3]);
  const galPal = [[0x3a3aa0, 0x7a8aff, 0xc8d8ff, 0xffffff], [0x6a2a8a, 0xc05ad0, 0xffa0f0, 0xffffff]];
  for (let i = 0; i < 4; i++) makeGalaxyPix(scene, 'gal' + i, 300 + i * 11, galPal[i % 2]);
  for (let i = 0; i < 6; i++) makeCluster(scene, 'clu' + i, 500 + i * 7);
}

// soft additive light halo (smooth-filtered, so it stays OFF the pixel atlas)
function makeHalo(scene) {
  if (scene.textures.exists('halo')) return;
  const t = scene.textures.createCanvas('halo', 128, 128), c = t.getContext(), gr = c.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = gr; c.fillRect(0, 0, 128, 128); t.refresh(); t.setFilter(Phaser.Textures.FilterMode.LINEAR);
}

// ---------------------------------------------------------------- 16-bit HUD icons
function makeHudTextures(scene) {
  const OUTC = 0x1a1020;
  const wedge = (key, light, mid, holes) => pixTex(scene, key, 13, 10, put => {
    const inside = (x, y) => y >= 1 && y <= 9 && x >= 0 && x <= Math.floor(1 + (y - 1) * 1.45);
    for (let y = 0; y < 10; y++) for (let x = 0; x < 13; x++) {
      if (!inside(x, y)) continue;
      const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
      put(x, y, edge ? OUTC : (y < 4 ? light : mid));
    }
    if (holes) for (const [x, y] of [[3, 6], [6, 7], [2, 4], [7, 5]]) put(x, y, holes);
  });
  wedge('hud_cheese', 0xfff09a, 0xffcf3a, 0xc9901a);
  wedge('hud_cheese_off', 0x5a4a6a, 0x3a2e4a, 0x2a2036);
  const elbow = (key, c1, c2) => pixTex(scene, key, 9, 8, put => {
    const inR = (x, y) => { const d = Math.hypot(x + 0.5 - 1, y + 0.5 - 7.5); return x >= 1 && y <= 7 && d >= 3 && d <= 7; };
    for (let y = 0; y < 8; y++) for (let x = 0; x < 9; x++) {
      if (!inR(x, y)) continue;
      const edge = !inR(x - 1, y) || !inR(x + 1, y) || !inR(x, y - 1) || !inR(x, y + 1);
      put(x, y, edge ? OUTC : (Math.hypot(x - 1, y - 7.5) > 5 ? c1 : c2));
    }
  });
  elbow('hud_mac', 0xffe27a, 0xffa21a);
  elbow('hud_mac_off', 0x4a3e5a, 0x3a2e4a);
  elbow('hud_mac_hot', 0xff7a6a, 0xd0302a);
  elbow('hud_mac_gold', 0xfffbe0, 0xffd23f);
}


// ---------------------------------------------------------------- weapon select (between level select and the level)
class WeaponScene extends Phaser.Scene {
  constructor() { super('weapons'); }
  init(data) { this.levelId = (data && data.level) || 1; }

  create() {
    makeTextures(this); makeLevelTextures(this); makeChrisTextures(this);
    this.cameras.main.setBackgroundColor('#0b1020');
    this.cameras.main.fadeIn(200, 0, 0, 0);
    this.going = false;
    let wi = 0; try { wi = +(localStorage.getItem('lc_weapon') || 0); } catch (e) { /* ignore */ }
    this.sel = WEAPONS[wi] && weaponUnlocked(WEAPONS[wi], this.levelId) ? wi : 0;
    this.stars = [];
    for (let i = 0; i < 90; i++) this.stars.push({ x: Math.random(), y: Math.random(), s: 1 + Math.floor(Math.random() * 3), tw: Math.random() * 6 });
    this.bg = this.add.graphics().setDepth(0);
    this.ui = this.add.container(0, 0).setDepth(1);
    this.selG = this.add.graphics().setDepth(2);
    this.build();
    this.scale.on('resize', this.build, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.build, this));
    const kb = this.input.keyboard;
    if (kb) {
      kb.on('keydown-LEFT', () => this.move(-1)); kb.on('keydown-RIGHT', () => this.move(1));
      kb.on('keydown-A', () => this.move(-1)); kb.on('keydown-D', () => this.move(1));
      kb.on('keydown-ONE', () => this.pick(0)); kb.on('keydown-TWO', () => this.pick(1));
      kb.on('keydown-ENTER', () => this.pick(this.sel)); kb.on('keydown-SPACE', () => this.pick(this.sel)); kb.on('keydown-X', () => this.pick(this.sel));
      kb.on('keydown-ESC', () => this.back());
    }
    const padOff = Pad.on(b => {
      if (b === 'left' || b === 'right') this.move(b === 'left' ? -1 : 1);
      else if (b === 'a' || b === 'start') this.pick(this.sel);
      else if (b === 'b' || b === 'back') this.back();
    });
    this.events.once('shutdown', padOff);
  }

  move(d) {
    const n = WEAPONS.length;
    for (let k = 1; k <= n; k++) { const i = ((this.sel + d * k) % n + n) % n; if (weaponUnlocked(WEAPONS[i], this.levelId)) { if (i !== this.sel) { this.sel = i; Sound.sfx('jump'); } return; } }
  }

  pick(i) {
    if (this.going || !WEAPONS[i]) return;
    if (!weaponUnlocked(WEAPONS[i], this.levelId)) { Sound.sfx('zing'); this.cameras.main.shake(100, 0.004); return; }
    this.going = true; this.sel = i;
    try { localStorage.setItem('lc_weapon', String(i)); } catch (e) { /* ignore */ }
    Sound.sfx('power');
    this.cameras.main.flash(150, 255, 230, 160);
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.time.delayedCall(280, () => this.scene.start('level1', { level: this.levelId, direct: true }));
  }

  back() { if (!this.going) { this.going = true; this.scene.start('select'); } }

  build() {
    const W = this.scale.width, H = this.scale.height;
    this.ui.removeAll(true);
    const f = (size, color, extra) => Object.assign({ fontFamily: PIXEL, fontSize: size + 'px', color }, extra || {});
    const ink = { stroke: '#1a1020', strokeThickness: 4 };
    this.ui.add(this.add.text(W / 2, Math.max(14, H * 0.05), 'CHOOSE YOUR WEAPON', f(16, '#ffd23f', { stroke: '#1a1020', strokeThickness: 6 })).setOrigin(0.5, 0));
    this.ui.add(this.add.text(W / 2, Math.max(36, H * 0.05 + 24), 'LEVEL ' + this.levelId + ': ' + LEVELS[this.levelId].short, f(8, '#9fd8ff', ink)).setOrigin(0.5, 0));
    const n = WEAPONS.length, gap = 18, cw = Math.min(300, (W - gap * (n + 1)) / n), ch = Math.min(280, H - 110);
    const x0 = (W - (cw * n + gap * (n - 1))) / 2, y0 = Math.max(64, H * 0.2);
    this.cards = [];
    WEAPONS.forEach((w, i) => {
      const x = x0 + i * (cw + gap), open = weaponUnlocked(w, this.levelId);
      const g = this.add.graphics();
      g.fillStyle(0x1a1020, 1).fillRect(x - 3, y0 - 3, cw + 6, ch + 6);
      g.fillStyle(0xc9cde0, 1).fillRect(x - 1, y0 - 1, cw + 2, ch + 2);
      g.fillStyle(open ? 0x151b40 : 0x14141c, 1).fillRect(x, y0, cw, ch);
      this.ui.add(g);
      // the gun, big and pixelly, with its drill / nozzle on the front
      const gs = Math.max(2, Math.min(4, Math.floor(cw / 70)));
      const gx = x + cw / 2 - (34 + 20) * gs / 2, gy = y0 + 22 + 26 * gs / 2;
      const gun = this.add.image(gx, gy, w.gunTex).setOrigin(0, 15 / 26).setScale(gs);
      const tip = this.add.image(gx + 32 * gs, gy, w.tipTex === 'auger' ? 'auger0' : w.tipTex).setOrigin(0, 0.5).setScale(gs);
      if (!open) { gun.setTint(0x333344); tip.setTint(0x333344); }
      this.ui.add([tip, gun]);
      this.cards.push({ x, y: y0, w: cw, h: ch, gun, tip, gy, open, w8: w });
      let ty = gy + 16 * gs;
      this.ui.add(this.add.text(x + cw / 2, ty, w.name, f(cw > 240 ? 10 : 8, open ? '#ffffff' : '#6b7390', ink)).setOrigin(0.5, 0));
      ty += 20;
      this.ui.add(this.add.text(x + cw / 2, ty, w.blurb, f(8, open ? '#c9cde0' : '#4a5070', { align: 'center', wordWrap: { width: cw - 20 }, lineSpacing: 4 })).setOrigin(0.5, 0));
      ty += 34;
      if (open) {
        Object.entries(w.stats).forEach(([k, v], j) => {
          const sy = ty + j * 14;
          this.ui.add(this.add.text(x + 14, sy, k, f(8, '#9fa6c2')).setOrigin(0, 0));
          for (let b = 0; b < 5; b++) g.fillStyle(b < v ? (k === 'POWER' ? 0xff6a3a : k === 'RATE' ? 0xffd23f : k === 'RANGE' ? 0x39c6ff : 0x7dff8a) : 0x2a2f50, 1).fillRect(x + 84 + b * 14, sy, 11, 8);
        });
      } else {
        g.fillStyle(0xc9cde0, 1).fillRect(x + cw / 2 - 9, ty + 8, 18, 14); g.lineStyle(3, 0xc9cde0, 1).strokeRect(x + cw / 2 - 5, ty, 10, 10);   // padlock
        this.ui.add(this.add.text(x + cw / 2, ty + 30, 'UNLOCKS AT LEVEL ' + w.unlock, f(8, '#ff8a8a', ink)).setOrigin(0.5, 0));
      }
      const z = this.add.zone(x, y0, cw, ch).setOrigin(0).setInteractive({ useHandCursor: true });
      z.on('pointerup', () => { if (this.sel === i) this.pick(i); else if (open) { this.sel = i; this.pick(i); } else this.pick(i); });
      this.ui.add(z);
    });
    const hint = Pad.state.connected ? 'D-PAD TO CHOOSE   A TO GO   B BACK' : 'TAP A WEAPON   (KEYS: 1/2 OR ARROWS + ENTER, ESC BACK)';
    this.ui.add(this.add.text(W / 2, H - 12, hint, f(8, '#6b7390')).setOrigin(0.5, 1));
    const back = this.add.text(12, 12, '< BACK', f(8, '#9fa6c2', ink)).setInteractive({ useHandCursor: true });
    back.on('pointerup', () => this.back());
    this.ui.add(back);
  }

  update(time) {
    const W = this.scale.width, H = this.scale.height, g = this.bg;
    g.clear();
    for (const s of this.stars) g.fillStyle(0xffffff, 0.35 + 0.35 * Math.sin(time / 600 + s.tw)).fillRect(s.x * W, s.y * H, s.s, s.s);
    this.selG.clear();
    if (!this.cards) return;
    this.cards.forEach((c, i) => {
      const on = i === this.sel;
      const bob = on ? Math.round(Math.sin(time / 220) * 3) : 0;
      c.gun.y = c.gy + bob; c.tip.y = c.gy + bob;
      if (c.w8.tipTex === 'auger') c.tip.setTexture('auger' + (on ? Math.floor(time / 50) % 4 : 0));
      if (on) this.selG.lineStyle(4, 0xffd23f, 0.6 + 0.4 * Math.sin(time / 150)).strokeRect(c.x - 7, c.y - 7, c.w + 14, c.h + 14);
    });
  }
}
