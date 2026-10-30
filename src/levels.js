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
  frog:     { hp: 6,  r: 24, ch: 18, tex: 'frog',     oy: 0.92,    drop: 0.55, big: true },
  drone:    { hp: 2,  r: 16, ch: 12, tex: 'drone',    oy: 0.5,     drop: 0.25 },
  miniwheel: { hp: 2, r: 13, ch: 14, tex: 'miniwheel', oy: 0.5, drop: 0.2, ai: 'miniwheel' },             // L6: little wheels the Pepper Jack spits out
  ghostpirate: { hp: 3, r: 15, ch: 14, tex: 'ghostpirate', oy: 0.6, drop: 0.25, ai: 'flyer' },             // L5 phantom pirate: triangle-zigzag bolts
  polterwedge: { hp: 2, r: 13, ch: 10, tex: 'polterwedge', oy: 0.6, drop: 0.3, ai: 'polter' },            // L5 poltergeist wedge: only hittable when it's solid
  mgolem:   { hp: 18, r: 27, ch: 30, tex: 'mgolem',   oy: 1,       drop: 0.65, big: true, ai: 'golem' },   // L4 Mozzarella Magma-Golem: charred armour chips off
  rocketrat: { hp: 2, r: 15, ch: 12, tex: 'rocketrat', oy: 0.6,    drop: 0.28, ai: 'flyer' },               // L4 rocket rat: hovers over you, drops pepperoni bombs
  gogglerat: { hp: 3, r: 15, ch: 12, tex: 'gogglerat', oy: 0.95, drop: 0.2, ai: 'welder' },         // L3 welder rat: riot shield + blowtorch
  slicer:   { hp: 5,  r: 21, ch: 17, tex: 'slicer',   oy: 0.9,     drop: 0.55, big: true },
  // roadmap enemies (ai = which existing behaviour they use)
  phantom:  { hp: 3,  r: 15, ch: 14, tex: 'phantom',  oy: 0.6,     drop: 0.25, ai: 'drone' },          // ghostly dairy-maid: hovers, then rams
  stinkfly: { hp: 2,  r: 15, ch: 12, tex: 'stinkfly', oy: 0.55,    drop: 0.2,  ai: 'flyer' },          // L2: bloated swamp fly that drops spore bombs
  paladin:  { hp: 8,  r: 17, ch: 12, tex: 'paladin',  oy: 0.92,    drop: 0.5,  big: true, ai: 'mouse' } // armoured Rat-Paladin
};

const LEVELS = {
  1: {
    fullCam: true,                                                // CAMERA: FULL is allowed here (tested level)
    id: 1, name: 'The Gruyère Globe', short: 'GRUYERE GLOBE', blurb: 'A cheesy cratered moon.\nGouda-Golems and space-mice.',
    music: 'level1', bossName: 'CRUSTY CROQUE MONSIEUR', tip: '',
    radius: 420, sky: [0x111a6a, 0x4a2296], skyCols: [0x0a0c40, 0x11186a, 0x1d1f86, 0x2d2192, 0x45249a, 0x5e2a9c], bg: '#0a0c40', starTint: 0xffffff, dustAlpha: 1.3, bgDecor: 'cosmic', lava: 9,
    surface: { pal: [0x6a3a0c, 0xb8761a, 0xdca536, 0xf0cb52, 0xffe27a, 0xfff4c4], seed: 4242 },
    geysers: { n: 7, idle: [3.5, 7], warn: 1.1, erupt: 1.3, height: 175 },
    planet: { fill: 0xf0cb52, inner: 0xe6bd45, rim: 0xffe58a, glow: 0xfff1b5 },
    dust: [0x6a4cff, 0xb04cff, 0x3aa0ff, 0xff6ab0], decorTint: 0xffffff, decorAlpha: 1,
    gravity: 1, ledgeTypes: ['panini', 'crystal', 'carnival', 'energy', 'panini'], ledgeTex: 'ledge1',
    ledges: [{ theta: 0.9, half: 0.14, h: 85 }, { theta: 2.0, half: 0.12, h: 165 }, { theta: 3.3, half: 0.14, h: 85 }, { theta: 4.4, half: 0.12, h: 165 }, { theta: 5.5, half: 0.14, h: 85 }],
    props: [
      { tex: 'p_skull', n: 3, sc: [1, 1.3], tint: 0xe0d8c0 },
      { tex: 'p_tuft1', n: 12, sc: [0.8, 1.4], fg: true }],
    waves: [
      { name: 'WAVE 1', spawns: [S('mouse', 0), S('mouse', 1), S('flyer', 2), S('mouse', 2.4), S('mouse', 3.6), S('flyer', 4), S('mouse', 4.8), S('flyer', 6.2), S('mouse', 6.8), S('mouse', 7.6)] },
      { name: 'WAVE 2', spawns: [S('golem', 0), S('mouse', 0.8), S('flyer', 1.6), S('mouse', 2.4), S('flyer', 3), S('golem', 4), S('mouse', 4.6), S('flyer', 5.2), S('mouse', 6), S('flyer', 6.8), S('mouse', 7.4), S('flyer', 8.4), S('mouse', 9)] },
      { name: 'WAVE 3', spawns: [S('golem', 0), S('mouse', 1), S('flyer', 1.8), S('golem', 2.6), S('mouse', 3), S('flyer', 3.6), S('mouse', 4.2), S('golem', 5.4), S('flyer', 6), S('mouse', 6.6), S('flyer', 7.6), S('mouse', 8.2), S('golem', 9), S('flyer', 9.6), S('mouse', 10.2)] }
    ],
    boss: { tex: 'croque', hp: 155, ai: 'croque', armouredTop: true },
    win: 'The Croque Monsieur is toast. Literally.\nBessie was safe... for about ten seconds.\nAfter that rat-ship!'
  },

  2: {
    id: 2, name: 'Gorgonzola Gulch', short: 'GORGONZOLA GULCH', blurb: 'Stinky blue-cheese swamp.\nSpores bend gravity. Quicksand goop.\nGerms, tongue-lashing rat-frogs, stink-flies.',
    music: 'level2', bossName: 'BARON VON BLUE', tip: 'SPORES BEND GRAVITY!',
    radius: 580, sky: [0x000204, 0x021a16], bg: '#000204', starTint: 0xe8fff8, dustAlpha: 0.6, bgDecor: 'motes',
    surface: { pal: [0x04080e, 0x0a1220, 0x121e30, 0x1c2c42, 0x283c56, 0x3e5a74], seed: 2121, rim: [0x1d5a2a, 0x3a9a3a, 0x7ee05a], spot: [0x163a26, 0x2f7a3a], rimLight: [170, 255, 130], dark: [0, 4, 10] },
    rimGlow: 0x6aff6a,
    nebula: { pal: [0x021614, 0x053a36, 0x0b5e52, 0x1f9a7e, 0x7ae8c8], n: 4, sparkles: [0xffffff, 0x8af5d2, 0x5ce1ff, 0xc8ffd0] },
    planet: { fill: 0x7a9ea6, inner: 0x5f868f, rim: 0xb5e3d2, glow: 0x3aff8a },
    dust: [0x2fbf8f, 0x3ad0c0, 0x6a8cff, 0x9bff6a], decorTint: 0x4fa88f, decorAlpha: 1,
    gravity: 1, ledgeTypes: ['crystal', 'girder', 'panini', 'crystal', 'girder', 'panini'], ledgeTex: 'ledge2',
    ledges: [{ theta: 0.7, half: 0.1, h: 90 }, { theta: 1.5, half: 0.09, h: 170 }, { theta: 2.5, half: 0.1, h: 90 }, { theta: 3.6, half: 0.09, h: 170 }, { theta: 4.5, half: 0.1, h: 90 }, { theta: 5.5, half: 0.09, h: 170 }],
    props: [
      // the skyline, composed by hand round the planet: [theta, scale, flipX]. Big and small pieces alternate so it reads
      // as a rhythm (tall mushroom, ribcage, little pair, skull...) rather than random clumps. They stand behind the horizon.
      { tex: 'bg_shroom', at: [[0.35, 2.0], [2.75, 1.7, 1], [4.55, 2.1], [5.95, 1.5, 1]], depth: 0.96, tint: 0x6aa8b0, alpha: 0.7, h: -30, glow: 0x3ae8ff, glowA: 0.38 },
      { tex: 'bg_ribcage', at: [[1.2, 2.3], [3.55, 2.1, 1], [5.25, 2.0]], depth: 0.95, tint: 0x5a8c80, alpha: 0.7, h: -22 },
      { tex: 'bg_shroom2', at: [[0.75, 1.5, 1], [1.85, 1.3], [3.05, 1.6], [4.2, 1.4, 1], [6.25, 1.3]], depth: 0.97, tint: 0x7ab8bc, alpha: 0.78, h: -18, glow: 0x3ae8ff, glowA: 0.4 },
      { tex: 'bg_skull', at: [[2.25, 1.6, 1], [4.95, 1.5]], depth: 0.95, tint: 0x6a9a8c, alpha: 0.72, h: -20 },
      // dark mossy boulders: a few behind Chris, a couple of small ones in front
      { tex: 'rock_dark', at: [[0.55, 1.6], [1.62, 1.9, 1], [2.6, 1.5], [3.35, 2.0, 1], [4.75, 1.7], [5.75, 1.8, 1]], depth: 2.45, h: -3 },
      { tex: 'rock_dark2', at: [[0.95, 1.4], [2.35, 1.3, 1], [3.85, 1.5], [5.35, 1.3, 1]], depth: 2.46, h: -2 },
      { tex: 'rock_dark2', at: [[1.4, 1.0, 1], [4.4, 1.1]], fg: true, h: -6 },
      { tex: 'pile_bones', n: 2, sc: [1.1, 1.5], tint: 0xc8d8c8, alpha: 0.85 },
      { tex: 'p_shroom', n: 9, sc: [0.9, 1.6], tint: 0x9ff0ff, glow: 0x5ce1ff }, { tex: 'p_reed', n: 14, sc: [0.9, 1.5], sway: true }, { tex: 'p_stalk', n: 6, sc: [0.9, 1.4], glow: 0x6fe8ff },
      { tex: 'p_tuft2', n: 16, sc: [0.8, 1.4], fg: true, sway: true }],
    waves: [
      { name: 'WAVE 1', spawns: [S('germ', 0), S('germ', 0.8), S('stinkfly', 1.6), S('frog', 2.4), S('germ', 3), S('germ', 3.6), S('stinkfly', 4.4), S('frog', 5), S('germ', 5.6), S('germ', 6.2), S('stinkfly', 7), S('germ', 7.6)] },
      { name: 'WAVE 2', spawns: [S('frog', 0), S('germ', 0.5), S('stinkfly', 1), S('germ', 1.6), S('frog', 2.4), S('germ', 2.8), S('stinkfly', 3.4), S('germ', 4), S('frog', 4.8), S('stinkfly', 5.2), S('germ', 5.8), S('germ', 6.2), S('frog', 7), S('stinkfly', 7.6), S('germ', 8.2), S('frog', 8.8), S('germ', 9.4)] },
      { name: 'WAVE 3', spawns: [S('stinkfly', 0), S('stinkfly', 0.5), S('frog', 1.2), S('germ', 1.6), S('germ', 2), S('frog', 2.8), S('stinkfly', 3.2), S('germ', 3.8), S('frog', 4.4), S('germ', 4.8), S('stinkfly', 5.4), S('germ', 5.8), S('frog', 6.4), S('germ', 7), S('stinkfly', 7.4), S('frog', 8), S('germ', 8.6), S('frog', 9.2), S('stinkfly', 9.6), S('frog', 10.2)] },
    ],
    goop: [{ theta: 1.08, half: 0.1 }, { theta: 2.05, half: 0.085 }, { theta: 3.08, half: 0.11 }, { theta: 4.05, half: 0.09 }, { theta: 5.02, half: 0.1 }],   // green quicksand pools
    boss: { tex: 'baron', hp: 175, ai: 'baron', scale: 1.35 },
    win: 'Baron von Blue is mould-y history!\nBessie squelched free... and got nabbed AGAIN.\nThe rats are heading for a giant grater...'
  },

  3: {
    id: 3, name: 'The Brie-muda Triangle', short: 'BRIE-MUDA TRIANGLE', blurb: 'A graveyard of lost ships and cows in a wheel of brie.\nPhantom pirates and poltergeist wedges.',
    music: 'level5', bossName: 'THE PHANTOM MILKMAID', tip: 'WEDGES ARE ONLY SOLID SOMETIMES - TIME YOUR SHOTS!',
    radius: 500, sky: [0x0c0618, 0x3a2058], bg: '#0c0618', starTint: 0xd8c8ff, dustAlpha: 0.9, bgDecor: 'haze',
    // a wheel of brie: powdery white rind with grey fuzz, a creamy paste inside, bones of lost cows sunk into it
    surface: { pal: [0xc8b88a, 0xe0d4b0, 0xf0e8d4, 0xf8f4ea, 0xfdfbf6, 0xffffff], seed: 5151, rim: [0xd8d4e0, 0xf0eef6, 0xffffff], spot: [0xd8cca8, 0xece4cc], rimD: 0.93, rimLight: [230, 200, 255], dark: [30, 10, 50] },
    rimGlow: 0xb07aff, squish: true,
    planet: { fill: 0xececf4, inner: 0xd8d8e4, rim: 0xffffff, glow: 0xa070ff },
    dust: [0xc8a8ff, 0xffffff, 0xd8c8ff, 0xa8f0ff], decorTint: 0xe0e8ff, decorAlpha: 0.8,
    gravity: 1, ledgeTypes: ['bone', 'bone', 'bone', 'bone', 'bone', 'bone'], ledgeTex: 'ledge1',
    ledges: [{ theta: 0.6, half: 0.1, h: 95 }, { theta: 1.5, half: 0.09, h: 180 }, { theta: 2.6, half: 0.1, h: 95 }, { theta: 3.6, half: 0.09, h: 180 }, { theta: 4.6, half: 0.1, h: 95 }, { theta: 5.5, half: 0.09, h: 180 }],
    props: [
      // the graveyard: huge ribcages and skulls of ancient space-livestock, half-swallowed by the brie
      { tex: 'bone_ribcage', at: [[0.25, 1.0], [1.95, 1.15, 1], [3.15, 0.95], [4.15, 1.1, 1], [5.85, 1.0]], depth: 2.4, h: -30 },
      { tex: 'bone_skull', at: [[1.1, 0.95, 1], [2.3, 0.85], [3.9, 0.9, 1], [5.2, 0.85]], depth: 2.42, h: -12 },
      { tex: 'pile_bones', at: [[0.8, 1.2], [2.9, 1.1, 1], [4.9, 1.2]], tint: 0xf0ead8, alpha: 0.95 },
      { tex: 'p_skull', at: [[1.7, 1.1], [3.4, 1.0, 1], [5.6, 1.2]], tint: 0xf0ead8 },
      { tex: 'p_tuft2', n: 12, sc: [0.8, 1.3], fg: true, tint: 0xd8d0f0 }],
    // SECRET: the Brie-muda Triangle itself. Three ghostly ship's lanterns drift high over the wreckage; shoot them out and a
    // triangular rift tears open in the sky: a warp to the Fondue Fountain (5.5), which comes out at level 7.
    warp: { to: 5.5, style: 'triangle', theta: 2.6, h: 222, relics: [{ theta: 1.2, h: 226 }, { theta: 3.7, h: 230 }, { theta: 5.3, h: 224 }] },
    waves: [
      { name: 'WAVE 1', spawns: [S('ghostpirate', 0), S('polterwedge', 1), S('ghostpirate', 2), S('polterwedge', 2.8), S('phantom', 4), S('ghostpirate', 5), S('polterwedge', 6), S('ghostpirate', 7)] },
      { name: 'WAVE 2', spawns: [S('ghostpirate', 0), S('ghostpirate', 0.6), S('polterwedge', 1.4), S('phantom', 2.2), S('polterwedge', 3), S('ghostpirate', 3.8), S('polterwedge', 4.6), S('phantom', 5.4), S('ghostpirate', 6.2), S('polterwedge', 7), S('ghostpirate', 7.8)] },
      { name: 'WAVE 3', spawns: [S('polterwedge', 0), S('ghostpirate', 0.5), S('ghostpirate', 1), S('phantom', 1.8), S('polterwedge', 2.4), S('polterwedge', 2.8), S('ghostpirate', 3.6), S('phantom', 4.4), S('ghostpirate', 5), S('polterwedge', 5.6), S('ghostpirate', 6.4), S('polterwedge', 7), S('phantom', 7.8), S('ghostpirate', 8.4)] }
    ],
    boss: { tex: 'milkmaid', hp: 160, ai: 'phantom' },
    win: 'The Phantom Milkmaid has curdled into mist!\nBessie floated free... straight into a waiting tractor beam.\nThe rats are fleeing to a smoking volcano planet.'
  },

  4: {
    id: 4, name: 'Mount Mozzarella', short: 'MOUNT MOZZARELLA', blurb: 'A volatile volcano planet.\nBoiling string cheese whips across the sky.',
    music: 'level4', bossName: 'THE PIZZA OVEN OF DOOM', tip: 'WATCH FOR THE STRING CHEESE - IT SNAPS!',
    radius: 440, sky: [0x0a0204, 0x5a140c], bg: '#0a0204', starTint: 0xffb080, dustAlpha: 0.8, bgDecor: 'oven', lava: 12,
    // a wood-fired pizza planet: white mozzarella surface, a charred, ashy crust rim, burnt black patches
    surface: { pal: [0x7a4a24, 0xc89a6a, 0xe8d4b0, 0xf6ead2, 0xfff8ec, 0xffffff], seed: 4444, rim: [0x2a140a, 0x6a3418, 0xb06a30], spot: [0x1a0e08, 0x3a2414], rimD: 0.925, rimLight: [255, 170, 90], dark: [40, 10, 4] },
    rimGlow: 0xff7a2a,
    geysers: { n: 5, idle: [4, 8], warn: 1, erupt: 1.2, height: 150 },
    planet: { fill: 0xf6ecdc, inner: 0xe8d4b8, rim: 0xffffff, glow: 0xff8a3a },
    dust: [0xff6a3a, 0xffb03a, 0xff3a3a, 0xffd23f], decorTint: 0xffffff, decorAlpha: 1,
    gravity: 1, ledgeTypes: ['panini', 'girder', 'crystal', 'panini', 'energy'], ledgeTex: 'ledge1',
    ledges: [{ theta: 0.9, half: 0.14, h: 90 }, { theta: 2.0, half: 0.12, h: 170 }, { theta: 3.2, half: 0.14, h: 90 }, { theta: 4.3, half: 0.12, h: 170 }, { theta: 5.4, half: 0.14, h: 90 }],
    props: [
      { tex: 'pile_rind', at: [[0.4, 1.4], [1.45, 1.2, 1], [2.6, 1.5], [3.75, 1.3, 1], [4.85, 1.4], [5.95, 1.2, 1]], tint: 0xc88a5a },
      { tex: 'rock_dark', at: [[0.7, 1.4], [2.3, 1.6, 1], [3.5, 1.3], [5.1, 1.5, 1]], tint: 0x8a4a2a, h: -3 },
      { tex: 'p_tuft1', n: 10, sc: [0.8, 1.3], fg: true, tint: 0xff7a3a }],
    // molten string-cheese pits: they GRAB you in stretchy strands - mash jump to tear free before you burn
    goop: [{ theta: 1.2, half: 0.06 }, { theta: 2.6, half: 0.055 }, { theta: 3.95, half: 0.06 }, { theta: 5.7, half: 0.055 }],
    goopMode: 'string', goopTex: 'cheesepit', goopBub: 'cheesebub', goopGlow: 0xff8a2a,
    strands: { every: [2.6, 4.5] },
    waves: [
      { name: 'WAVE 1', spawns: [S('mouse', 0), S('rocketrat', 1), S('mouse', 1.8), S('mouse', 2.8), S('rocketrat', 3.6), S('mgolem', 4.6), S('mouse', 5.4), S('rocketrat', 6.4), S('mouse', 7.2)] },
      { name: 'WAVE 2', spawns: [S('frog', 0), S('mouse', 0.8), S('rocketrat', 1.6), S('mgolem', 2.6), S('mouse', 3.2), S('frog', 4.2), S('rocketrat', 5), S('mouse', 5.8), S('mgolem', 7), S('rocketrat', 7.8)] },
      { name: 'WAVE 3', spawns: [S('mgolem', 0), S('frog', 1), S('rocketrat', 1.8), S('mouse', 2.4), S('mgolem', 3.6), S('rocketrat', 4.2), S('frog', 5.2), S('mouse', 6), S('rocketrat', 6.8), S('mgolem', 8), S('rocketrat', 8.6)] }
    ],
    boss: { tex: 'oven', hp: 150, ai: 'oven', armouredTop: true },
    win: 'The Pizza Oven of Doom has gone cold!\nBessie popped out of the dough... and into a rat-ship. AGAIN.\nThe trail leads to a grinding industrial asteroid...'
  },

  5: {
    id: 5, name: 'The Great Grater', short: 'THE GREAT GRATER', blurb: 'An industrial asteroid.\nThe floor is a giant grater!',
    music: 'level3', bossName: 'THE MEGA-MANDOLINE', tip: 'WATCH THE SKY: RED RINGS = INCOMING! JUMP THE LASER!',
    radius: 300, sky: [0x04050a, 0x1a1c2c], bg: '#04050a', starTint: 0x9aa8c8, dustAlpha: 0.7, bgDecor: 'factory',
    surface: { pal: [0x10141e, 0x2a3242, 0x4a5568, 0x76839a, 0xaab6c8, 0xeef4fc], seed: 3131, grater: true, rimLight: [230, 240, 255], dark: [4, 6, 14] },
    geysers: { n: 7, idle: [2.5, 5], warn: 1.0, erupt: 1.3, height: 180, puff: 'steam', vent: 'steamvent', glow: 0xffffff, float: true },   // steam vents
    planet: { fill: 0x707a86, inner: 0x59616d, rim: 0xd5dde8, glow: 0x9ab8e8 },
    dust: [0xff9a3a, 0xffd23f, 0x5a6a8a, 0xff6a3a], decorTint: 0x8a929c, decorAlpha: 0.55,
    gravity: 1, ledgeTypes: ['girder', 'energy', 'girder', 'energy', 'girder'], ledgeTex: 'ledge3',
    ledges: [{ theta: 0.5, half: 0.15, h: 95 }, { theta: 1.8, half: 0.14, h: 175 }, { theta: 3.1, half: 0.15, h: 95 }, { theta: 4.3, half: 0.14, h: 175 }, { theta: 5.5, half: 0.15, h: 95 }],
    props: [
      // the factory skyline behind the horizon: scaffold towers, crate stacks, barrels
      { tex: 'scaffold', at: [[0.2, 1.0], [1.35, 1.15, 1], [2.55, 0.9], [3.75, 1.1, 1], [5.0, 1.0]], depth: 0.95, tint: 0x6a7488, alpha: 0.8, h: -24 },
      { tex: 'crates', at: [[0.8, 1.05], [2.1, 0.95, 1], [3.3, 1.1], [4.6, 1.0, 1], [5.75, 1.05]], depth: 0.96, tint: 0x9a8a7a, alpha: 0.9, h: -10 },
      // on the deck: beacons flashing red/blue, barrels, pipes, cones
      { tex: 'beacon_r', at: [[0.35, 1.0], [2.0, 1.0], [3.6, 1.0], [5.2, 1.0]], h: -2, glow: 0xff3030, glowA: 0.6, blink: 3 },
      { tex: 'beacon_b', at: [[1.15, 1.0], [2.8, 1.0], [4.4, 1.0], [6.0, 1.0]], h: -2, glow: 0x3a8aff, glowA: 0.6, blink: 3, blinkOff: 0.5 },
      { tex: 'barrel', at: [[0.65, 1.0], [1.6, 0.9, 1], [3.0, 1.05], [4.0, 1.0, 1], [5.45, 0.9]], h: -2 },
      { tex: 'p_pipe', n: 3, sc: [0.9, 1.4] },
      { tex: 'p_cone', n: 7, sc: [0.8, 1.1], fg: true }],
    waves: [
      { name: 'WAVE 1', spawns: [S('gogglerat', 0), S('drone', 1.2), S('gogglerat', 2), S('slicer', 3.2), S('drone', 4.4), S('gogglerat', 5.2), S('drone', 6.4), S('gogglerat', 7.2)] },
      { name: 'WAVE 2', spawns: [S('slicer', 0), S('gogglerat', 0.8), S('drone', 1.6), S('drone', 2.6), S('gogglerat', 3.4), S('slicer', 4.2), S('drone', 5), S('gogglerat', 5.8), S('drone', 6.6), S('slicer', 7.6), S('gogglerat', 8.2)] },
      { name: 'WAVE 3', spawns: [S('slicer', 0), S('drone', 0.8), S('gogglerat', 1.4), S('drone', 2), S('slicer', 3), S('gogglerat', 3.6), S('drone', 4.2), S('drone', 5), S('gogglerat', 5.6), S('slicer', 6.4), S('drone', 7), S('gogglerat', 7.6), S('drone', 8.2), S('slicer', 9.4)] },
    ],
    boss: { tex: 'mandoline', hp: 150, ai: 'mandoline' },
    win: 'The Mega-Mandoline is sliced and diced!\nBessie bounced clear of the blades... right into a tractor beam.\nThe rats are fleeing to a tiny cheddar moon.'
  },

  6: {
    id: 6, name: 'Cheddar Gorge', short: 'CHEDDAR GORGE', blurb: 'A tiny, high-speed cheddar planetoid.\nA giant wheel of Pepper Jack is chasing you.',
    music: 'level6', bossName: 'THE GREAT PEPPER JACK', tip: 'RUN! BLAST THE CHIPS, JET OVER THE PITS!',
    radius: 270, sky: [0x1a0a20, 0xd86a20], skyCols: [0x1a0a20, 0x3a1430, 0x6a2030, 0xa03a28, 0xd86a20, 0xf0a030], bg: '#1a0a20', starTint: 0xffd8a0, dustAlpha: 1.2, bgDecor: 'cosmic',
    surface: { pal: [0x6a2a0a, 0xa84a10, 0xe07a1a, 0xf6a02a, 0xffc85a, 0xffe8a0], seed: 6262 },
    planet: { fill: 0xf6a02a, inner: 0xe07a1a, rim: 0xffe8a0, glow: 0xffb050 },
    dust: [0xff9a3a, 0xffd23f, 0xff6a3a, 0xffb0a0], decorTint: 0xffffff, decorAlpha: 1,
    gravity: 1, ledgeTypes: ['panini', 'girder', 'panini', 'girder'], ledgeTex: 'ledge1',
    ledges: [{ theta: 0.8, half: 0.2, h: 90 }, { theta: 2.4, half: 0.18, h: 165 }, { theta: 4.0, half: 0.18, h: 90 }, { theta: 5.5, half: 0.18, h: 165 }],
    props: [
      { tex: 'bg_spires', at: [[0.5, 0.7], [1.9, 0.6, 1], [3.3, 0.75], [4.7, 0.65, 1], [5.9, 0.6]], depth: 0.95, tint: 0xa06a5a, alpha: 0.85, h: -14 },
      { tex: 'rock_dark', at: [[1.2, 0.9], [3.6, 1.0, 1], [5.2, 0.9]], tint: 0xc0703a, h: -3 },
      { tex: 'p_tuft1', n: 8, sc: [0.8, 1.2], fg: true, tint: 0xffb050 }],
    chaser: { speed: 175, spit: [2.5, 4], spawn: [7, 10] },
    // bottomless pits (jet over them!) and speed-bump craters; razor tortilla chips block the way - blast them
    craters: [{ theta: 1.05, half: 0.075, kind: 'pit' }, { theta: 1.6, half: 0.1, kind: 'bump' }, { theta: 2.15, half: 0.08, kind: 'pit' }, { theta: 3.0, half: 0.11, kind: 'bump' },
              { theta: 3.35, half: 0.075, kind: 'pit' }, { theta: 4.45, half: 0.1, kind: 'bump' }, { theta: 4.85, half: 0.08, kind: 'pit' }, { theta: 5.85, half: 0.075, kind: 'pit' }],
    chips: [0.55, 1.35, 1.85, 2.7, 3.15, 3.85, 4.25, 5.05, 5.55, 6.15],
    waves: [
      { name: 'WAVE 1', spawns: [S('mouse', 0), S('mouse', 1.2), S('slicer', 2.4), S('mouse', 3.4), S('drone', 4.4), S('mouse', 5.4), S('slicer', 6.6)] },
      { name: 'WAVE 2', spawns: [S('slicer', 0), S('mouse', 1), S('drone', 2), S('mouse', 3), S('slicer', 4), S('drone', 5), S('mouse', 6), S('mouse', 7)] },
      { name: 'WAVE 3', spawns: [S('drone', 0), S('slicer', 1), S('mouse', 1.8), S('drone', 2.8), S('slicer', 3.8), S('mouse', 4.6), S('drone', 5.6), S('slicer', 6.6), S('mouse', 7.4)] }
    ],
    boss: { tex: 'jack_rind', hp: 170, ai: 'wheel' },
    win: 'The Great Pepper Jack has crumbled!\nBessie rolled clear... into the hold of the rat armada.\nTime to board their fleet.'
  },

  7: {
    id: 7, name: 'The Astro-Rat Armada', short: 'ASTRO-RAT ARMADA', blurb: 'A fleet of rusty spherical rat ships.\nThe flagship sweeps the decks with lasers.',
    music: 'level7', bossName: 'THE RAT FLAGSHIP', tip: 'DODGE THE FLAGSHIP LASERS!',
    radius: 380, sky: [0x02040c, 0x18265a], skyCols: [0x02040c, 0x060c1c, 0x0a1430, 0x101c44, 0x18265a, 0x22306a], bg: '#02040c', starTint: 0xffffff, dustAlpha: 1.2, bgDecor: 'cosmic',
    surface: { pal: [0x3a1a10, 0x6a3a24, 0x9a5a32, 0xc0804a, 0xd8a070, 0xf0c8a0], seed: 7373 },
    planet: { fill: 0x9a5a32, inner: 0x6a3a24, rim: 0xf0c8a0, glow: 0xff9a5a },
    dust: [0x5ce1ff, 0x6a8cff, 0xff9a5a, 0xffffff], decorTint: 0xffffff, decorAlpha: 1,
    gravity: 1, ledgeTypes: ['girder', 'energy', 'girder', 'energy', 'girder', 'energy', 'girder'], ledgeTex: 'ledge3',
    ledges: [{ theta: 0.5, half: 0.12, h: 85 }, { theta: 1.3, half: 0.1, h: 165 }, { theta: 2.1, half: 0.1, h: 240 }, { theta: 3.0, half: 0.12, h: 85 }, { theta: 3.9, half: 0.1, h: 165 }, { theta: 4.8, half: 0.1, h: 240 }, { theta: 5.6, half: 0.12, h: 110 }],
    props: [{ tex: 'pile_scrap', n: 6, sc: [1.1, 1.6], tint: 0xc08060 }, { tex: 'p_pipe', n: 4, sc: [0.9, 1.3] }, { tex: 'p_crate', n: 4, sc: [0.9, 1.2] }, { tex: 'p_cone', n: 6, sc: [0.8, 1.1], fg: true }],
    sweep: { every: [3.5, 6] },
    waves: [
      { name: 'WAVE 1', spawns: [S('drone', 0), S('flyer', 1), S('drone', 2), S('slicer', 3), S('flyer', 4), S('drone', 5), S('flyer', 6), S('drone', 7)] },
      { name: 'WAVE 2', spawns: [S('golem', 0), S('drone', 0.8), S('flyer', 1.8), S('slicer', 2.6), S('drone', 3.4), S('golem', 4.6), S('flyer', 5.4), S('drone', 6.2), S('slicer', 7.2)] },
      { name: 'WAVE 3', spawns: [S('drone', 0), S('drone', 0.6), S('golem', 1.6), S('flyer', 2.2), S('slicer', 3), S('drone', 3.8), S('golem', 5), S('flyer', 5.6), S('drone', 6.4), S('slicer', 7.4), S('drone', 8)] }
    ],
    boss: { tex: 'flagship', hp: 170, ai: 'flagship', armouredTop: true },
    win: 'The flagship is going down in flames!\nBessie was bundled into an escape pod...\n...that crashed straight into a giant block of Swiss.'
  },

  8: {
    id: 8, name: 'Lactose Labyrinth', short: 'LACTOSE LABYRINTH', blurb: 'Deep inside a hollow block of Swiss.\nShots ricochet. Rat-Paladins in heavy armour.',
    music: 'level8', bossName: 'THE GRAND PALADIN', tip: 'YOUR SHOTS RICOCHET IN HERE!',
    radius: 1100, sky: [0x0a0602, 0x4a3014], skyCols: [0x0a0602, 0x1a1006, 0x2a1a0a, 0x3a2410, 0x4a3014, 0x5a3a18], bg: '#0a0602', starTint: 0xffd890, dustAlpha: 1.5, bgDecor: 'motes',
    surface: { pal: [0x6a4a10, 0xa87a1a, 0xe0b02a, 0xf6d04a, 0xffe27a, 0xfff4c4], seed: 8484 },
    planet: { fill: 0xf6d04a, inner: 0xe0b02a, rim: 0xfff4c4, glow: 0xffd23f },
    dust: [0xffd23f, 0xffb03a, 0xfff4c4, 0xe0b02a], decorTint: 0xffe8a0, decorAlpha: 0.8,
    gravity: 1, ledgeTypes: ['crystal', 'panini', 'crystal', 'girder', 'panini', 'crystal'], ledgeTex: 'ledge1',
    ledges: [{ theta: 0.6, half: 0.13, h: 80 }, { theta: 1.5, half: 0.12, h: 160 }, { theta: 2.5, half: 0.13, h: 80 }, { theta: 3.5, half: 0.12, h: 160 }, { theta: 4.5, half: 0.13, h: 80 }, { theta: 5.5, half: 0.12, h: 160 }],
    props: [{ tex: 'pile_rind', n: 6, sc: [1.2, 1.8], tint: 0xffe27a }, { tex: 'p_skull', n: 4, sc: [1, 1.4], tint: 0xffe0a0 }, { tex: 'p_tuft2', n: 10, sc: [0.8, 1.2], fg: true, tint: 0xd8b040 }],
    ricochet: true,
    // TEST: a labyrinth inside the planet (main.js: the cave). Angles are relative to the hole in the surface.
    // Ring 1: a wall just to the right, so go LEFT round to the hole; ring 2: a wall to the left, so go RIGHT; the core: Bessie.
    cave: { holeOff: 0.3, fillT: 200, rings: [
      { hole: 0 },                                                                                     // the surface
      { R: 980, ceil: 92, walls: [0.15], hole: -1.1, outlet: -0.55, every: 4, valves: [-0.35, -0.85] },
      { R: 860, ceil: 92, walls: [-1.25], hole: 0.1, outlet: -0.5, every: 2, valves: [-0.8, -0.15] },
      { R: 700, ceil: 130, core: true, bessie: 1.45, outlet: 1.45, every: 2, doubles: true }
    ] },
    waves: [
      { name: 'WAVE 1', spawns: [S('paladin', 0), S('mouse', 1), S('germ', 2), S('mouse', 3), S('paladin', 4), S('germ', 5), S('mouse', 6)] },
      { name: 'WAVE 2', spawns: [S('paladin', 0), S('frog', 1), S('mouse', 2), S('paladin', 3), S('germ', 4), S('frog', 5), S('paladin', 6), S('mouse', 7)] },
      { name: 'WAVE 3', spawns: [S('paladin', 0), S('paladin', 1), S('frog', 2), S('germ', 2.8), S('paladin', 3.8), S('mouse', 4.6), S('frog', 5.6), S('paladin', 6.4), S('paladin', 7.4)] }
    ],
    boss: { tex: 'grandpaladin', hp: 180, ai: 'paladin', armouredTop: true },
    win: 'The Grand Paladin is out for the count!\nBessie squeezed out through a hole... onto the rat homeworld itself.\nOne last push, Chris.'
  },

  9: {
    id: 9, name: 'Parmesan Prime', short: 'PARMESAN PRIME', blurb: 'The collapsing rat homeworld.\nThe Grand Rat-King waits at the core.',
    music: 'level9', bossMusic: 'final', bossName: 'THE GRAND RAT-KING', tip: 'THE PLANET IS FALLING APART - WATCH THE SKY!',
    radius: 520, sky: [0x100204, 0x8a2010], skyCols: [0x100204, 0x2a0408, 0x4a080c, 0x6a1010, 0x8a2010, 0xaa3a10], bg: '#100204', starTint: 0xffb0a0, dustAlpha: 1.4, bgDecor: 'gears', lava: 10,
    surface: { pal: [0x5a4a2a, 0x8a7a4a, 0xc0b07a, 0xdcd0a0, 0xeee6c4, 0xfff8e0], seed: 9595 },
    planet: { fill: 0xdcd0a0, inner: 0xc0b07a, rim: 0xfff8e0, glow: 0xffb070 },
    dust: [0xff6a3a, 0xffb03a, 0xd8c8a0, 0xff3a3a], decorTint: 0xc8a8a0, decorAlpha: 0.6,
    gravity: 1, ledgeTypes: ['girder', 'energy', 'crystal', 'girder', 'energy', 'crystal'], ledgeTex: 'ledge3',
    ledges: [{ theta: 0.6, half: 0.09, h: 90 }, { theta: 1.5, half: 0.08, h: 170 }, { theta: 2.6, half: 0.09, h: 90 }, { theta: 3.6, half: 0.08, h: 170 }, { theta: 4.6, half: 0.09, h: 90 }, { theta: 5.5, half: 0.08, h: 170 }],
    props: [{ tex: 'pile_scrap', n: 6, sc: [1.2, 1.8], tint: 0xa08070 }, { tex: 'pile_bones', n: 5, sc: [1.1, 1.6], tint: 0xd8c8a0 }, { tex: 'p_skull', n: 4, sc: [1.1, 1.5], tint: 0xffd0c0 }, { tex: 'p_pipe', n: 3, sc: [0.9, 1.3] }],
    debris: { every: [0.9, 1.8] },
    waves: [
      { name: 'WAVE 1', spawns: [S('mouse', 0), S('paladin', 1), S('flyer', 1.8), S('phantom', 2.8), S('mouse', 3.6), S('drone', 4.6), S('paladin', 5.6), S('flyer', 6.4), S('mouse', 7.2)] },
      { name: 'WAVE 2', spawns: [S('golem', 0), S('phantom', 1), S('slicer', 2), S('paladin', 3), S('drone', 3.8), S('frog', 4.8), S('phantom', 5.6), S('slicer', 6.6), S('paladin', 7.6)] },
      { name: 'WAVE 3', spawns: [S('paladin', 0), S('golem', 0.8), S('phantom', 1.6), S('drone', 2.4), S('slicer', 3.2), S('paladin', 4), S('frog', 5), S('phantom', 5.8), S('golem', 6.8), S('drone', 7.6), S('paladin', 8.4)] }
    ],
    boss: { tex: 'ratking', hp: 240, ai: 'king', armouredTop: true },
    win: 'The Grand Rat-King\'s mech is scrap!\nBessie is free - and this time she is STAYING free.\nLuna Chris: hero of the galaxy. MOO!'
  },

  // LEVEL 5.5 (secret detour): reached through a warp hole (shows on level select once found)
  5.5: {
    id: 5.5, secret: true, name: 'The Forbidden Fondue Fountain', short: 'FONDUE FOUNTAIN', blurb: 'A molten cheese moon, deep in a warp.\nFondue fountains everywhere.',
    music: 'level55', bossName: 'LE GRAND FROMAGE', tip: 'WARP ZONE! MIND THE FONDUE FOUNTAINS!',
    radius: 460, sky: [0x12030a, 0x6a1220], skyCols: [0x12030a, 0x24050f, 0x3c0816, 0x580e1c, 0x781a20, 0x9a2c22], bg: '#12030a', starTint: 0xffd0a0, dustAlpha: 1.3, bgDecor: 'cosmic', lava: 14,
    surface: { pal: [0x5a1406, 0xa8380e, 0xe06c18, 0xf6a62e, 0xffd65e, 0xfff0b0], seed: 6161 },
    geysers: { n: 11, idle: [2.2, 4.6], warn: 0.9, erupt: 1.5, height: 235 },
    planet: { fill: 0xf6a62e, inner: 0xe06c18, rim: 0xffd65e, glow: 0xffb060 },
    dust: [0xff6a3a, 0xffb03a, 0xff3a6a, 0xffd23f], decorTint: 0xffffff, decorAlpha: 1,
    gravity: 1, ledgeTypes: ['carnival', 'panini', 'energy', 'carnival', 'panini', 'energy'], ledgeTex: 'ledge1',
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
  if (madeTex(scene, 'w_relic')) return;
  pixSprite(scene, 'w_relic', 26, 24, p => {
    p.line([[13, 1], [13, 6]], 0x8a929c);
    p.ell(13, 13, 10, 8, [0xc0907a, 0x8a5a4a, 0x5a3a30]);
    p.ell(13, 12, 6.5, 4.5, [0x5a3a30, 0x3a2420, 0x2a1a18]);
    for (const [x, y] of [[9, 11], [13, 10], [17, 11], [11, 14], [15, 14]]) p.px(x, y, 0xffb070);
    p.rect(1, 12, 4, 15, 0x8a929c); p.rect(22, 12, 25, 15, 0x8a929c);
  });
  // L3's secret: a ghostly ship's lantern (three drift over the Brie-muda Triangle)...
  pixSprite(scene, 'w_lantern', 18, 28, p => {
    p.ell(9, 3, 3, 3, [0xb0a890, 0x7a7260, 0x4a4438]); p.ell(9, 3, 1.4, 1.4, -1);                                  // hanging ring
    p.poly([[3, 9], [15, 9], [12, 5], [6, 5]], [0x9a8a6a, 0x6a5a40, 0x3a3020]);                                    // cap
    p.rrect(3, 9, 15, 22, 2, [0xd8c8ff, 0x9a7ad8, 0x5a3a98]);                                                      // glass
    p.ell(9, 16, 3.5, 5, [0xffffff, 0xd8b0ff, 0xa060ff]); p.poly([[7, 13], [11, 13], [9, 9]], 0xffffff);            // ghost flame
    p.line([[3, 9], [3, 22]], 0x3a3020); p.line([[15, 9], [15, 22]], 0x3a3020); p.line([[9, 9], [9, 10]], 0x3a3020);
    p.rrect(2, 22, 16, 26, 1, [0x9a8a6a, 0x6a5a40, 0x3a3020]);                                                      // base
  });
  // ...and the triangular rift that tears open when they're all out (rotated and tinted in main.js)
  pixSprite(scene, 'w_tri', 60, 54, p => {
    p.poly([[30, 1], [59, 52], [1, 52]], [0xc8a8ff, 0x8a5ad8, 0x4a2a8a]);
    p.poly([[30, 10], [51, 47], [9, 47]], [0x5a2a9a, 0x3a1a6a, 0x1a0a30]);
    p.poly([[30, 19], [43, 42], [17, 42]], [0xd8b0ff, 0xa060ff, 0x6a30c8]);
    p.poly([[30, 27], [36, 38], [24, 38]], [0xffffff, 0xf0e0ff, 0xd8b0ff]);
  }, 2);
}

// ---------------------------------------------------------------- extra art (all drawn with code)
function makeLevelTextures(scene) {
  if (madeTex(scene, 'germ')) return;
  const mk = (key, w, h, draw) => {
    if (SPRITE_FILES.has(key)) return;
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
  // the rat-frog: a hunched, mottled brown-green body, a huge bulging yellow eye, rat snout + buck teeth, a curly pink
  // worm tail and long froggy legs. Several frames (idle / blink / crouch / leap / mouth open) swapped by its AI.
  // the L2 "rat-frog": a mangy mutant swamp rat. Dark purple-brown fur with a toxic neon-green rim light along its back
  // so it pops off the dark ground, glowing purple veins, bald pink patches with green pustules, a long naked pink tail,
  // a huge bloodshot yellow eye, yellow buck teeth, drool. Open-mouthed it hunches harder, digs its claws in and
  // thrusts its snout forward (the tongue is drawn in main.js).
  const drawFrog = (a, o) => {
    const FUR = [0xb08ab0, 0x7a5a80, 0x3e2a48], SKIN = [0xffb8c8, 0xe07890, 0x9a4058], NEON = 0xb8ff5a, NEON2 = 0x6ae83a, VEIN = 0xc070ff;
    const dy = o.crouch ? 4 : 0, push = o.open ? 4 : 0;                                         // open: lunging forward
    const rim = (cx, cy, rx, ry, x0, x1) => { for (let x = Math.ceil(cx - rx * 0.92); x <= Math.floor(cx + rx * 0.92); x++) { if (x < x0 || x > x1) continue; const u = (x - cx) / rx, y = Math.round(cy - ry * Math.sqrt(Math.max(0, 1 - u * u))); a.px(x, y, NEON); a.px(x, y + 1, NEON2); } };
    if (o.leap) {                                                   // stretched out mid-leap, tail streaming behind, claws forward
      a.line([[16, 24], [8, 26], [2, 22], [0, 16]], SKIN[1], 3); a.line([[16, 23], [8, 25], [2, 21]], SKIN[0]);
      a.line([[20, 30], [12, 36], [6, 40]], FUR[1], 4); a.poly([[6, 40], [2, 42], [8, 42]], SKIN);   // hind legs kicked back
      a.ell(30, 24, 17, 9, FUR); rim(30, 24, 17, 9, 14, 46);
      a.ell(26, 22, 4, 3, SKIN[1]); a.px(26, 22, NEON); a.px(33, 20, NEON);                         // a bald patch + pustules
      a.line([[20, 22], [28, 26], [36, 24]], VEIN);
      a.line([[40, 28], [48, 34], [53, 36]], FUR[1], 3); for (const [x, y] of [[53, 36], [55, 34], [54, 38]]) a.px(x, y, 0xfff0a0);   // claws out front
    } else {
      // the long naked tail, curling round behind
      a.line([[16, 40 + dy * 0.5], [8, 42], [2, 38], [1, 30], [4, 24], [9, 22]], SKIN[1], 3); a.line([[16, 39 + dy * 0.5], [8, 41], [3, 37], [2, 30]], SKIN[0]);
      for (let k = 0; k < 6; k++) a.px(3 + (k % 2), 26 + k * 2.4, SKIN[2]);
      a.ell(18, 36 + dy * 0.6, 10, 8 - dy * 0.3, FUR);                                                          // haunch
      a.poly([[12, 42], [28, 42], [30, 45], [10, 45]], FUR); for (const x of [26, 29, 31]) a.poly([[x, 44], [x + 2, 45], [x, 45]], 0xfff0a0);   // big hind foot, claws dug in
      a.ell(26 + push * 0.5, 28 + dy, 17, 13 - dy * 0.4 - push * 0.3, FUR);                                   // the hunched body
      rim(26 + push * 0.5, 28 + dy, 17, 13 - dy * 0.4 - push * 0.3, 10, 40);                                   // toxic neon rim light along the spine
      for (let x = 12; x < 38; x += 3) a.px(x, Math.round(28 + dy - (13 - dy * 0.4 - push * 0.3) * Math.sqrt(Math.max(0, 1 - ((x - 26 - push * 0.5) / 17) ** 2))) - 1, NEON2);   // spiky, mangy fur
      for (const [x, y, r] of [[18, 24, 4], [30, 32, 3], [22, 33, 2.5]]) { a.ell(x, y + dy, r, r * 0.75, SKIN[1]); a.ell(x, y + dy, r * 0.6, r * 0.45, SKIN[0]); }   // bald, raw patches
      for (const [x, y] of [[17, 23], [20, 25], [29, 31], [31, 33], [23, 33]]) { a.px(x, y + dy, NEON); a.px(x, y - 1 + dy, 0xf0ffe0); }   // green pustules
      a.line([[12, 30 + dy], [18, 28 + dy], [22, 31 + dy], [30, 27 + dy]], VEIN); a.line([[22, 31 + dy], [24, 36 + dy]], VEIN);   // glowing purple veins
      a.ell(32 + push, 36 + dy * 0.5, 8, 4, [0xc8a0b0, 0x9a7080, 0x6a4050]);                                 // scrawny belly
      a.line([[38 + push, 34 + dy * 0.6], [41 + push, 40], [43 + push, 44]], FUR[1], 3);                    // front leg
      for (const x of [41, 44, 46]) a.poly([[x + push, 43], [x + push + 2, 45], [x + push - 1, 45]], 0xfff0a0);   // front claws gripping the turf
    }
    const hx = (o.leap ? 46 : 44) + push, hy = (o.leap ? 16 : 21) + dy - (o.open ? 1 : 0);                    // head + long rat snout
    a.ell(hx - 9, hy - 8, 4, 5, SKIN); a.ell(hx - 9, hy - 8, 2, 3, SKIN[2]); a.px(hx - 11, hy - 12, NEON);    // tatty ear
    a.ell(hx, hy, 10, 9, FUR); rim(hx, hy, 10, 9, hx - 8, hx + 6);
    a.poly([[hx + 3, hy - 3], [hx + 15 + push * 0.5, hy + 1], [hx + 16 + push * 0.5, hy + 4], [hx + 12, hy + 7], [hx + 3, hy + 7]], FUR);   // snout
    a.ell(hx + 15 + push * 0.5, hy + 2, 2, 1.8, SKIN);                                                       // nose
    a.line([[hx + 13, hy + 4], [hx + 20, hy + 2]], 0xd8c8a0); a.line([[hx + 13, hy + 5], [hx + 20, hy + 7]], 0xd8c8a0);   // whiskers
    if (o.open) {                                                     // jaw wide: dark throat, yellow fangs, ropes of drool
      a.poly([[hx + 1, hy + 6], [hx + 16, hy + 5], [hx + 13, hy + 15], [hx + 3, hy + 15]], 0x2a0a14);
      a.ell(hx + 7, hy + 12, 4, 2, [0xff8aa0, 0xe0405a, 0x90203a]);
      a.rect(hx + 10, hy + 5, hx + 12, hy + 10, 0xfff0a0); a.rect(hx + 13, hy + 5, hx + 14, hy + 8, 0xe8d070);   // buck teeth
      a.poly([[hx + 4, hy + 15], [hx + 6, hy + 15], [hx + 5, hy + 11]], 0xfff0a0);                          // lower fang
      a.line([[hx + 3, hy + 14], [hx + 3, hy + 19]], 0xb8ffe0); a.px(hx + 3, hy + 20, 0xe0fff0);            // drool rope
      a.line([[hx + 12, hy + 14], [hx + 12, hy + 17]], 0xb8ffe0);
      a.ell(hx + 7, hy + 17, 6, 2, FUR);                                                                     // lower jaw
    } else {
      a.line([[hx + 2, hy + 7], [hx + 12, hy + 7]], 0x2a0a14);
      a.rect(hx + 8, hy + 6, hx + 11, hy + 10, 0xfff0a0); a.line([[hx + 9, hy + 7], [hx + 9, hy + 10]], 0xc8b060);   // yellow buck teeth
      a.px(hx + 6, hy + 9, 0xb8ffe0); a.px(hx + 6, hy + 10, 0xb8ffe0);
    }
    const ex = hx + 1, ey = hy - 6, er = o.open ? 8 : 7.5;                                                    // the HUGE bulging eye
    a.ell(ex, ey, er + 1, er + 1, 0xc04a3a); a.ell(ex, ey, er, er, [0xfff8a0, 0xffd23a, 0xc08a1a]);
    for (const pts of [[[ex - 7, ey - 1], [ex - 4, ey]], [[ex + 6, ey + 2], [ex + 3, ey + 1]], [[ex - 3, ey + 6], [ex - 2, ey + 3]], [[ex + 2, ey - 7], [ex + 1, ey - 4]], [[ex + 6, ey - 4], [ex + 4, ey - 3]]]) a.line(pts, 0xe0302a);   // red veins
    if (o.blink) { a.ell(ex, ey - 2, 7.5, 5, FUR); a.line([[ex - 6, ey + 1], [ex + 6, ey + 1]], 0x2a0a14); }
    else {
      const px2 = o.twitch ? ex + 3 : ex + 1, py2 = o.twitch ? ey - 2 : ey, pr = o.open ? 1.6 : 2.4;         // pin-prick pupil when it's lashing; twitching about
      a.ell(px2, py2, pr, pr + 0.8, 0x14080a); a.px(ex - 2, ey - 4, 0xffffff); a.px(ex - 1, ey - 4, 0xffffff); a.px(ex - 2, ey - 3, 0xffffff);
    }
  };
  pixSprite(scene, 'frog', 60, 46, a => drawFrog(a, {}));
  pixSprite(scene, 'frog_blink', 60, 46, a => drawFrog(a, { blink: true }));
  pixSprite(scene, 'frog_crouch', 60, 46, a => drawFrog(a, { crouch: true }));
  pixSprite(scene, 'frog_leap', 60, 46, a => drawFrog(a, { leap: true }));
  pixSprite(scene, 'frog_open', 60, 46, a => drawFrog(a, { open: true }));
  pixSprite(scene, 'frog_open_c', 60, 46, a => drawFrog(a, { open: true, crouch: true }));
  pixSprite(scene, 'frog_open_t', 60, 46, a => drawFrog(a, { open: true, twitch: true }));          // grab: the pupil twitches about
  pixSprite(scene, 'frog_open_ct', 60, 46, a => drawFrog(a, { open: true, crouch: true, twitch: true }));

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

  // boss: Baron von Blue, a lopsided, rotting mass of fuzzy blue cheese: pulsing veins, cratered mould, slime dripping
  // off his underside, a rusty tin-can lid smashed into his head, one huge bloodshot bulging eye and one tiny twitchy one.
  // (pupils, mouth, claws, the jiggle and the drips are animated in main.js: drawBaron)
  pixSprite(scene, 'baron', 116, 100, a => {
    const BL = [0xa8c4ff, 0x6a8ae0, 0x34509e], rz = rng(4242);
    // the lumpy body: a big saggy mass, a swollen lump on the left, a knot of mould up on the right, a belly that hangs low
    a.ell(58, 56, 48, 34, BL); a.ell(22, 48, 19, 21, BL); a.ell(90, 34, 20, 18, BL); a.ell(60, 80, 36, 14, BL); a.ell(96, 66, 14, 14, BL);
    // fuzzy, furry mould on the edges
    for (let n = 0; n < 260; n++) { const t = rz() * Math.PI * 2, x = 58 + Math.cos(t) * (46 + rz() * 8), y = 54 + Math.sin(t) * (34 + rz() * 6); if (rz() < 0.5) a.px(x, y, rz() < 0.5 ? 0xd8e4ff : 0x8aa8f0); }
    // cratered mould spots (dark pits with teal mould in them)
    for (const [x, y, r] of [[18, 56, 6], [30, 34, 4], [72, 60, 5], [92, 52, 4.5], [50, 86, 4], [84, 78, 5], [10, 42, 3], [100, 30, 3.5], [66, 30, 3]]) {
      a.ell(x, y, r + 1, r * 0.8 + 1, 0x8aa8f0); a.ell(x, y, r, r * 0.8, 0x1e2a6a); a.ell(x + 0.5, y + 0.5, r * 0.55, r * 0.45, 0x3ac0a0); a.px(x - r * 0.4, y - r * 0.3, 0x9affe0);
    }
    // pulsing veins (purple-pink, branching)
    for (const pts of [[[6, 60], [16, 64], [24, 72], [22, 82]], [[24, 72], [34, 74]], [[104, 44], [96, 48], [98, 58], [92, 64]], [[96, 48], [108, 54]], [[44, 92], [52, 88], [62, 92]], [[54, 22], [60, 26], [58, 32]]])
      a.line(pts, 0xc04a9a, 1);
    // the tin-can lid, smashed in at an angle: rusty, jagged edge, ring pull sticking up
    a.poly([[56, 18], [62, 6], [86, 0], [104, 6], [106, 14], [92, 22], [70, 24]], [0xd0d0d8, 0x9a9aa8, 0x5a5a68]);
    for (const [x, y] of [[60, 10], [66, 4], [74, 2], [84, 1], [94, 3], [102, 6]]) a.poly([[x, y], [x + 3, y - 4], [x + 5, y]], 0x9a9aa8);   // jagged rim
    for (const [x, y, w] of [[66, 12, 6], [84, 8, 5], [94, 14, 4], [76, 18, 5]]) a.rect(x, y, x + w, y + 1, 0xa0502a);                  // rust streaks
    a.ell(90, 6, 4, 2.5, 0x5a5a68); a.ell(90, 6, 2, 1.2, -1);                                                                          // ring pull
    a.line([[60, 20], [56, 26]], 0x8ae84a, 2); a.px(56, 28, 0xc8ffa8);                                                                 // slime oozing round it
    // the eyes: one huge, bulging and bloodshot; one tiny and squinting (pupils are overlays)
    a.ell(38, 44, 17, 17, 0x34509e); a.ell(38, 44, 15, 15, [0xfff8f0, 0xf0e0d0, 0xd8b8a8]);
    for (const pts of [[[24, 40], [30, 42], [33, 46]], [[38, 30], [38, 35], [41, 38]], [[50, 50], [45, 49], [43, 46]], [[28, 54], [32, 50]], [[48, 36], [44, 40]]]) a.line(pts, 0xd8303a, 1);
    a.ell(80, 40, 7, 6, 0x34509e); a.ell(80, 41, 5, 4, [0xfff0b0, 0xe8d090, 0xb89a5a]);
    a.line([[71, 35], [89, 37]], OUTPX, 3);                                                                                             // heavy lid over the little one
    a.line([[20, 24], [34, 27], [50, 22]], OUTPX, 3);                                                                                  // a wild brow over the big one
    a.ell(58, 72, 24, 10, [0x8aa8f0, 0x5a7ad0, 0x2e4490]);                                                                             // jowls round the mouth
    // slime dripping off his underside (more animated drips in main.js)
    for (const [x, y0, y1] of [[34, 86, 96], [46, 90, 99], [70, 90, 97], [82, 84, 93], [58, 92, 99]]) { a.line([[x, y0], [x, y1]], 0x6ad83a, 2); a.ell(x, y1, 1.6, 1.6, 0xb8ff8a); }
  }, 2);

  // his mouths: broken, yellowed chunks of bone and a rusty shard for teeth, at awkward angles
  const MOUTH = 0x1b0a2a, BONE = [0xfff2b0, 0xe0c870, 0x9a8a3a], RUST = [0xd08a5a, 0xa0502a, 0x5a2a14], TONGUE = [0xff8a9a, 0xe0405a, 0x90203a];
  const brokenTeeth = (a, top, bot) => {
    for (const [x, y, w, h, kind, lean] of top) a.poly([[x, y], [x + w, y], [x + w / 2 + lean, y + h]], kind ? RUST : BONE);
    for (const [x, y, w, h, kind, lean] of bot) a.poly([[x, y], [x + w, y], [x + w / 2 + lean, y - h]], kind ? RUST : BONE);
  };
  pixSprite(scene, 'baron_m0', 54, 22, a => {                     // a lopsided sneer, teeth like a smashed fence
    a.poly([[1, 6], [10, 9], [27, 11], [44, 7], [53, 1], [49, 13], [26, 18], [5, 13]], MOUTH);
    brokenTeeth(a, [[8, 9, 5, 5, 0, 1], [15, 10, 4, 3, 0, -1], [22, 11, 6, 6, 1, 2], [32, 10, 4, 4, 0, 0], [40, 8, 5, 6, 0, -2]], [[12, 16, 4, 3, 0, 1], [28, 17, 5, 4, 0, -1], [44, 13, 4, 3, 1, 0]]);
  });
  pixSprite(scene, 'baron_m1', 54, 26, a => {                     // snarling, half open
    a.poly([[1, 4], [10, 7], [27, 8], [44, 5], [53, 1], [48, 17], [27, 24], [6, 17]], MOUTH);
    brokenTeeth(a, [[7, 7, 6, 7, 0, 2], [16, 8, 4, 4, 0, -1], [24, 8, 7, 9, 1, 1], [35, 7, 4, 5, 0, 0], [42, 5, 6, 7, 0, -2]], [[10, 20, 5, 5, 0, 1], [20, 23, 4, 3, 0, 0], [33, 22, 6, 6, 0, -2], [42, 17, 4, 4, 1, 1]]);
    a.ell(27, 20, 8, 3, TONGUE);
  });
  pixSprite(scene, 'baron_m2', 56, 34, a => {                     // ROAR / COUGH: jaw dropped, broken teeth everywhere, tongue, drool
    a.poly([[1, 2], [12, 5], [28, 6], [44, 4], [55, 0], [50, 22], [28, 33], [6, 22]], MOUTH);
    brokenTeeth(a, [[6, 5, 6, 9, 0, 2], [15, 6, 4, 5, 0, -1], [22, 6, 7, 12, 1, 2], [33, 5, 4, 6, 0, 0], [40, 4, 6, 10, 0, -2], [48, 2, 4, 5, 0, 1]], [[11, 28, 5, 6, 0, 1], [22, 31, 4, 4, 0, -1], [32, 30, 6, 7, 0, 2], [42, 25, 4, 5, 1, 0]]);
    a.ell(28, 26, 11, 5, TONGUE); a.line([[28, 23], [28, 29]], 0x90203a);
    a.line([[48, 18], [49, 26]], 0x8ae86a, 2); a.px(49, 27, 0xc8ffa8);                                     // drool
  });
  pixSprite(scene, 'baron_pupil', 9, 9, a => { a.ell(4, 4, 3.5, 3.5, [0xff6a3a, 0xd62020, 0x6a0a0a]); a.rect(4, 2, 4, 6, 0x1a0a0a); a.px(3, 2, 0xffffff); });
  // a grotesque mutated rat claw (points right): fleshy pink, knuckly fingers, long dirty yellow talons, mould patches
  pixSprite(scene, 'ratclaw', 34, 28, a => {
    const SK = [0xffb8c0, 0xe07a8a, 0x9a4050];
    a.ell(10, 14, 9, 8, SK);                                                                              // palm / wrist
    for (const [y0, y1, len] of [[6, 2, 16], [11, 9, 19], [16, 17, 18], [20, 25, 13]]) {                    // four bony fingers, splayed
      a.line([[14, y0], [14 + len * 0.6, (y0 + y1) / 2], [14 + len, y1]], SK[2], 4); a.line([[14, y0], [14 + len * 0.6, (y0 + y1) / 2], [14 + len, y1]], SK[0], 2);
      a.poly([[14 + len, y1 - 2], [14 + len + 6, y1 + 1], [14 + len, y1 + 2]], [0xfff0a0, 0xd8c060, 0x8a7a2a]);   // talon
      a.px(14 + len * 0.6, (y0 + y1) / 2 - 1, SK[2]);                                                     // knuckle
    }
    a.ell(7, 11, 3, 2, 0x3d57a8); a.ell(12, 18, 2, 1.5, 0x3ac0a0); a.px(5, 16, 0x3d57a8);                // mould creeping over it
  });
  // the globes he coughs up: big bubbling balls of toxic blue cheese
  pixSprite(scene, 'cheeseglobe', 26, 26, a => {
    a.ell(13, 13, 12, 12, [0x9affe8, 0x3ac0b8, 0x1a6a80]);
    for (const [x, y, r] of [[8, 9, 3], [16, 16, 2.5], [17, 7, 2], [9, 17, 1.6]]) { a.ell(x, y, r, r, 0x2a5aa8); a.px(x - 1, y - 1, 0xc8fff0); }
    a.px(7, 5, 0xffffff); a.px(8, 5, 0xffffff); a.px(7, 6, 0xffffff);
  });
  // a wave of molten cheese rolling round the cave tunnel (Bessie's pump)
  pixSprite(scene, 'cwave', 30, 20, a => {
    a.poly([[0, 19], [6, 8], [14, 2], [22, 4], [28, 12], [29, 19]], [0xfff0a0, 0xffb52a, 0xc87a10]);
    a.ell(16, 7, 4, 2.5, 0xfff8d0); a.px(9, 11, 0xfff8d0); a.ell(22, 14, 2, 1.5, 0xc87a10);
  });
  // ribcage debris shaken loose by his scream
  pixSprite(scene, 'bonechunk', 18, 14, a => {
    a.poly([[1, 9], [6, 3], [16, 1], [17, 6], [11, 12], [3, 13]], [0xf0ecd8, 0xc8c0a0, 0x8a8268]); a.line([[5, 9], [13, 4]], 0x8a8268);
  });
  pixSprite(scene, 'chainlink', 8, 8, a => { a.ell(4, 4, 3, 3, [0xc8d0dc, 0x8a92a2, 0x4a5262]); a.ell(4, 4, 1.2, 1.2, -1); });

  // boss: the Mega-Mandoline, a giant box grater. A carry handle on top, angry brow plates over one big red laser
  // eye in a chrome bezel, a slicer slot full of teeth, rows of raised grater holes, a brass cog, wires, rivets and
  // shoulder sockets for its robot arms (the arms, the eye glow and the laser are drawn in mandoline.js)
  pixSprite(scene, 'mandoline', 120, 128, a => {
    const DARK = [0x7a8494, 0x4a5262, 0x2a3040], STEEL = [0xf2f6fc, 0xb4bece, 0x7a8698];
    a.rrect(36, 0, 84, 18, 7, DARK); a.rrect(44, 5, 76, 12, 3, -1);                                          // carry handle
    a.rect(40, 14, 80, 18, 0x3b4252);
    a.poly([[16, 14], [104, 14], [119, 127], [1, 127]], DARK);                                                // the body: a tapered box
    a.poly([[19, 17], [101, 17], [115, 124], [5, 124]], STEEL);
    a.rect(19, 17, 101, 22, 0x8a94a4); for (let x = 24; x < 98; x += 9) a.px(x, 19, 0xf2f6fc);                   // top band + rivets
    const edge = y => 19 - 14 * (y - 17) / 107;                                                                // left edge of the face at height y
    for (let r = 0, y = 70; y < 120; y += 8, r++) {                                                            // raised grater holes, staggered
      const lx = edge(y) + 9, rx = 120 - lx;
      for (let x = lx + (r % 2) * 6; x < rx - 3; x += 12) { a.ell(x, y, 3.6, 2.6, 0xffffff); a.ell(x, y + 1, 2.6, 1.6, 0x1c2232); a.px(x - 2, y + 2, 0x8a94a4); }
    }
    a.poly([[edge(58) + 4, 58], [116 - edge(58), 58], [116 - edge(64), 64], [edge(64) + 4, 64]], 0x1c2232);      // the slicer slot...
    a.line([[edge(58) + 6, 58], [114 - edge(58), 58]], 0xffffff);
    for (let x = edge(64) + 8; x < 110 - edge(64); x += 6) a.poly([[x, 63], [x + 4, 63], [x + 2, 67]], [0xffffff, 0xd8e0ec, 0x9aa4b4]);   // ...with serrated teeth
    a.ell(60, 40, 16, 16, [0xffffff, 0x9aa4b4, 0x3b4252]); a.ell(60, 40, 12.5, 12.5, 0x1c2232);                // the eye: chrome bezel...
    a.ell(60, 40, 11, 11, [0xff9a9a, 0xff2020, 0x8a0a0a]); a.ell(60, 40, 4.5, 4.5, [0xffe0e0, 0xffb0b0, 0xff6060]);   // ...red lens, hot core
    a.rect(53, 33, 55, 35, 0xffffff); a.px(57, 32, 0xffffff);
    a.poly([[30, 21], [54, 28], [54, 32], [28, 25]], DARK); a.poly([[90, 21], [66, 28], [66, 32], [92, 25]], DARK);   // angry brow plates
    a.ell(24, 46, 8, 8, [0xffe08a, 0xd0962a, 0x7a5414]);                                                       // brass cog
    for (let i = 0; i < 8; i++) { const t = i / 8 * Math.PI * 2; a.rect(Math.round(24 + Math.cos(t) * 9) - 1, Math.round(46 + Math.sin(t) * 9) - 1, Math.round(24 + Math.cos(t) * 9) + 1, Math.round(46 + Math.sin(t) * 9) + 1, 0xd0962a); }
    a.ell(24, 46, 2.5, 2.5, 0x3b4252);
    a.line([[92, 30], [99, 38], [100, 50]], 0xe03030); a.line([[95, 30], [103, 40], [104, 52]], 0x3a8aff);      // wires
    a.ell(9, 64, 7, 7, DARK); a.ell(9, 64, 3, 3, 0x1c2232); a.ell(111, 64, 7, 7, DARK); a.ell(111, 64, 3, 3, 0x1c2232);   // shoulder sockets
    a.line([[30, 100], [36, 103]], 0x7a8698); a.line([[86, 84], [92, 82]], 0x7a8698); a.px(70, 110, 0x7a8698);   // dents and scratches
  }, 2);
  // a mandoline slicer blade, flung down from the slot during the waves (falls edge first)
  pixSprite(scene, 'mblade', 24, 44, a => {
    a.rect(5, 0, 19, 5, 0x3b4252); a.ell(8, 3, 1.5, 1.5, 0x9aa4b4); a.ell(16, 3, 1.5, 1.5, 0x9aa4b4);
    a.poly([[3, 5], [21, 5], [21, 30], [12, 42], [3, 30]], [0xf2f6fc, 0xb4bece, 0x6a7688]);
    a.line([[3, 30], [12, 42], [21, 30]], 0xffffff); a.line([[7, 10], [7, 26]], 0xffffff);
    for (const y of [14, 22]) a.ell(15, y, 2.2, 1.6, 0x3b4252);
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
    makeTextures(this); makeLevelTextures(this); makePowerupTextures(this);
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
    if (this.input.keyboard) ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'].forEach((k, i) => this.input.keyboard.on('keydown-' + k, () => { if (LEVELS[i + 1] && this.isOpen(i + 1)) this.go(i + 1); }));
    if (this.input.keyboard) ['LEFT', 'RIGHT', 'UP', 'DOWN'].forEach(k => this.input.keyboard.on('keydown-' + k, () => this.nav(k.toLowerCase())));
    if (this.input.keyboard) this.input.keyboard.on('keydown-ENTER', () => this.go(this.sel));
    if (this.input.keyboard) this.input.keyboard.on('keydown-ESC', () => { if (!this.going) this.scene.start('menu'); });
    // controller: left/right picks a card, A or Start plays it
    this.sel = this.sel || 1;
    this.selG = this.add.graphics().setDepth(2);
    // Luna Chris himself, jetpacking along the route to whichever stop is picked
    this.rig = new ChrisRig(this); this.rig.root.setDepth(3); this.rig.setWeapon(WEAPONS[0]);
    this.rigP = { h: 60, floor: 0, vh: 0, vx: 0, thrusting: true, firing: 0, aimA: 0.1, power: 0, duck: false, facing: 1 };
    this.rigX = null; this.lastT = 0;
    const padOff = Pad.on(b => {
      if (b === 'left' || b === 'right' || b === 'up' || b === 'down') this.nav(b);
      else if (b === 'a' || b === 'start') this.go(this.sel);
      else if (b === 'b' || b === 'back') { if (!this.going) this.scene.start('menu'); }
      else this.showSel = true;
    });
    this.events.once('shutdown', padOff);
  }

  // ---- the ROUTE MAP (Star Fox style). The main road arcs along the top, 1 -> 9. Detours:
  //  - BONUS rooms (Zero-G Recoil Rooms) above the road after 3 and after 6, each rejoining at the next level;
  //  - the WARP along the bottom: level 3's hidden black hole -> the Fondue Fountain (5.5) -> a warp bonus room -> 7,
  //    skipping 4, 5 and 6.
  // Only level 1 starts open; beating a stop opens the next. Secret stops (bonus rooms, the warp) stay hidden until open.
  mapNodes() {
    const bonus = 'BONUS: no gravity. You fly AWAY from where you shoot.\nGrab all 12 ingredients to open the gun crate.';
    return [
      { id: 1, x: 0.05, y: 0.62 }, { id: 2, x: 0.15, y: 0.47 }, { id: 3, x: 0.255, y: 0.6 },
      { id: 4, x: 0.37, y: 0.42 }, { id: 5, x: 0.48, y: 0.35 }, { id: 6, x: 0.59, y: 0.42 },
      { id: 7, x: 0.72, y: 0.6 }, { id: 8, x: 0.83, y: 0.47 }, { id: 9, x: 0.94, y: 0.62 },
      { id: 'zerog', x: 0.3, y: 0.02, kind: 'bonus', name: 'BONUS: ZERO-G ROOM', blurb: bonus },
      { id: 'freefall', x: 0.655, y: 0.02, kind: 'bonus', name: 'BONUS: CERAMIC GRILL FREEFALL', blurb: 'BONUS: drop down a giant kamado grill to the coals.\nFind the gaps in the grates, dodge the flare-ups, hold JUMP to brake.' },
      { id: 5.5, x: 0.4, y: 0.97, kind: 'warp', name: 'WARP: FONDUE FOUNTAIN', blurb: 'WARP ZONE: a molten cheese moon, deep in a warp.\nFound through the Triangle on level 3. Comes out at level 7.' },
      { id: 'centrifuge', x: 0.56, y: 0.99, kind: 'bonus', name: 'WARP BONUS: CENTRIFUGE FERMENTER', blurb: 'BONUS: inside a spinning drum. The spin holds you to the wall,\nsurvive 60s, grab every ingredient, then jump for the gun.' }
    ];
  }
  mapLinks() { return [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [3, 'zerog'], ['zerog', 4], [6, 'freefall'], ['freefall', 7], [3, 5.5], [5.5, 'centrifuge'], ['centrifuge', 7]]; }
  // pick a stop: Chris boosts there along the route (straight across if they aren't joined)
  travel(id) {
    const from = this.sel; if (from === id) return;
    this.sel = id; this.showSel = true; this.buildInfo();
    const link = this.mapLinks().find(([a, b]) => (a === from && b === id) || (b === from && a === id));
    this.trip = { from, to: id, link, u: 0 };
    Sound.sfx('whoosh');
  }
  // a point along a route's curve (the same curve the dots are drawn on), u from its first stop to its second
  routePt(a, b, u) {
    const A = this.pos(a), B = this.pos(b), cx = (A.x + B.x) / 2 - (B.y - A.y) * 0.18, cy = (A.y + B.y) / 2 + (B.x - A.x) * 0.18, iu = 1 - u;
    return { x: iu * iu * A.x + 2 * iu * u * cx + u * u * B.x, y: iu * iu * A.y + 2 * iu * u * cy + u * u * B.y };
  }
  isOpen(id) {
    const best = Progress.best;
    if (id === 1) return true;
    if (id === 'zerog') return best >= 3;
    if (id === 'freefall') return best >= 6;
    if (id === 5.5) return Progress.found(5.5);
    if (id === 'centrifuge') return Progress.secretBeat(5.5);
    if (id === 7 && Progress.secretBeat(5.5)) return true;
    return typeof id === 'number' && best >= id - 1;
  }
  // d-pad: follow the routes. Left/right go to the next/previous stop along a route (the main road first at a fork);
  // up/down switch between the road and a detour. Only open stops.
  nav(d) {
    const N = this.nodes; if (!N) return;
    const cur = N.find(n => n.id === this.sel) || N[0];
    const open = N.filter(n => n !== cur && this.isOpen(n.id));
    const linked = open.filter(n => this.mapLinks().some(([a, b]) => (a === cur.id && b === n.id) || (b === cur.id && a === n.id)));
    const dirOk = (n, dd) => { const dx = n.x - cur.x, dy = n.y - cur.y; return dd === 'left' ? dx < -0.005 : dd === 'right' ? dx > 0.005 : dd === 'up' ? dy < -0.05 : dy > 0.05; };
    let pick = null;
    if (d === 'left' || d === 'right') {
      const c = linked.filter(n => dirOk(n, d)).sort((p, q) => (!!p.kind - !!q.kind) || Math.abs(p.y - cur.y) - Math.abs(q.y - cur.y));
      pick = c[0];
    } else {
      const c = linked.filter(n => dirOk(n, d)).sort((p, q) => Math.abs(p.x - cur.x) - Math.abs(q.x - cur.x));
      pick = c[0] || open.filter(n => dirOk(n, d)).sort((p, q) => Math.abs(p.x - cur.x) * 3 + Math.abs(p.y - cur.y) - Math.abs(q.x - cur.x) * 3 - Math.abs(q.y - cur.y))[0];
    }
    if (pick) this.travel(pick.id);
  }

  go(n) {
    if (this.going) return;
    if (!this.isOpen(n)) { Sound.sfx('clunk'); this.cameras.main.shake(80, 0.004); return; }
    if (n === 'centrifuge') { this.going = true; Sound.sfx('wave'); this.cameras.main.fadeOut(200, 0, 0, 0); this.time.delayedCall(230, () => this.scene.start('centrifuge')); return; }
    if (n === 'freefall') { this.going = true; Sound.sfx('wave'); this.cameras.main.fadeOut(200, 0, 0, 0); this.time.delayedCall(230, () => this.scene.start('freefall')); return; }
    if (/^zerog/.test(n)) { this.going = true; Sound.sfx('wave'); this.cameras.main.fadeOut(200, 0, 0, 0); this.time.delayedCall(230, () => this.scene.start('zerog', { room: n })); return; }
    if (!LEVELS[n]) return;
    this.going = true;
    Sound.sfx('wave');
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.time.delayedCall(230, () => this.scene.start('weapons', { level: n }));     // next: choose a weapon (timer, not the fade event: that can be skipped)
  }

  // a soft nebula for the backdrop and a sphere-shading overlay for the planets (canvas textures, made once)
  mapTextures() {
    if (!this.textures.exists('map_neb')) {
      const t = this.textures.createCanvas('map_neb', 256, 128), c = t.getContext();
      c.fillStyle = '#070a1c'; c.fillRect(0, 0, 256, 128);
      for (const [x, y, r, col] of [[60, 40, 70, '90,40,150'], [150, 80, 80, '40,60,160'], [210, 30, 60, '150,40,110'], [110, 110, 60, '60,30,120'], [20, 100, 50, '30,80,140']]) {
        const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(' + col + ',0.55)'); g.addColorStop(1, 'rgba(' + col + ',0)');
        c.fillStyle = g; c.fillRect(0, 0, 256, 128);
      }
      t.refresh();
    }
    if (!this.textures.exists('map_shade')) {
      const t = this.textures.createCanvas('map_shade', 64, 64), c = t.getContext();
      const g = c.createRadialGradient(24, 22, 2, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,0.28)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(0.8, 'rgba(6,4,24,0.35)'); g.addColorStop(1, 'rgba(6,4,24,0.7)');
      c.beginPath(); c.arc(32, 32, 32, 0, Math.PI * 2); c.fillStyle = g; c.fill(); t.refresh();
    }
  }

  build() {
    const W = this.scale.width, H = this.scale.height;
    this.ui.removeAll(true);
    this.mapTextures();
    const f = (size, color, extra) => Object.assign({ fontFamily: PIXEL, fontSize: size + 'px', color }, extra || {});
    this.f = f;
    if (this.nebImg) this.nebImg.destroy();
    this.nebImg = this.add.image(0, 0, 'map_neb').setOrigin(0).setDisplaySize(W, H).setDepth(-1);
    // the title, in a framed banner
    const tw = Math.min(W * 0.46, 380), th = Math.max(26, H * 0.085), tx = W / 2 - tw / 2, ty = 6;
    const ban = this.add.graphics();
    ban.fillStyle(0x000000, 0.4).fillRect(tx + 4, ty + 4, tw, th);
    ban.fillStyle(0x141a44, 1).fillRect(tx, ty, tw, th);
    ban.lineStyle(3, 0xffd23f, 1).strokeRect(tx, ty, tw, th); ban.lineStyle(1, 0x5a78d8, 1).strokeRect(tx + 4, ty + 4, tw - 8, th - 8);
    this.ui.add(ban);
    this.ui.add(this.add.text(W / 2, ty + th / 2 + 1, 'ROUTE TO BESSIE', f(Math.round(Math.min(18, th * 0.55, tw / 17)), '#ffd23f', { stroke: '#5a0a0a', strokeThickness: 4 })).setOrigin(0.5));
    this.bannerBox = { tx, ty, tw, th };
    // the map: only the stops you can see (secret ones appear once they're found)
    this.nodes = this.mapNodes().filter(n => !n.kind || this.isOpen(n.id)); this.ids = this.nodes.map(n => n.id);
    const panelH = Math.min(H * 0.24, 96), y0p = H - 6 - panelH;            // (the info panels along the bottom)
    const top = ty + th + Math.max(44, H * 0.12), mh = (y0p - 28 - top) / 0.95, R = Math.round(Math.max(13, Math.min(30, W * 0.03, H * 0.064)));
    this.panelY = y0p;
    this.nodeR = R;
    this.pos = id => { const n = this.nodes.find(q => q.id === id); return { x: W * n.x, y: top + mh * n.y }; };
    this.hit = {}; this.flair = [];
    for (const n of this.nodes) {
      const p = this.pos(n.id), L = LEVELS[n.id], open = this.isOpen(n.id), r = n.kind ? R * 0.8 : R;
      const g = this.add.graphics();
      if (n.id === 'centrifuge') {                                // the centrifuge: a riveted steel drum with a hub
        g.fillStyle(0x9fd8ff, 0.2).fillCircle(p.x, p.y, r + 6);
        g.fillStyle(0x1a1020, 1).fillCircle(p.x + 2, p.y + 2, r); g.fillStyle(0x6a7080, 1).fillCircle(p.x, p.y, r); g.fillStyle(0x2a1a10, 1).fillCircle(p.x, p.y, r * 0.72);
        g.lineStyle(2, 0xc8d0dc, 1).strokeCircle(p.x, p.y, r * 0.74);
        for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; g.fillStyle(0x3a3e48, 1).fillCircle(p.x + Math.cos(a) * r * 0.86, p.y + Math.sin(a) * r * 0.86, 1.6); }
        g.fillStyle(0xa8b0c0, 1).fillCircle(p.x, p.y, r * 0.18); g.fillStyle(0xf0ecd0, 0.7).fillCircle(p.x - r * 0.4, p.y + r * 0.3, r * 0.12);
        this.ui.add(g);
      } else if (n.id === 'freefall') {                                  // the grill freefall: a little green kamado egg glowing inside
        g.fillStyle(0xff7a1a, 0.22).fillCircle(p.x, p.y, r + 6);
        g.fillStyle(0x1a1020, 1).fillEllipse(p.x + 2, p.y + 2, r * 1.7, r * 2); g.fillStyle(0x2f8a3c, 1).fillEllipse(p.x, p.y, r * 1.7, r * 2);
        g.fillStyle(0x6ad05a, 1).fillEllipse(p.x - r * 0.3, p.y - r * 0.45, r * 0.4, r * 0.6);
        g.fillStyle(0x1a1020, 1).fillRect(p.x - r * 0.85, p.y - 1, r * 1.7, 3);                               // lid seam
        g.fillStyle(0xff7a1a, 1).fillRect(p.x - r * 0.45, p.y + r * 0.35, r * 0.9, r * 0.22);                  // vent glowing
        g.fillStyle(0xa8b0c0, 1).fillRect(p.x - 3, p.y - r - 3, 6, 5);                                        // chimney cap
        this.ui.add(g);
      } else if (n.kind === 'bonus') {                                   // bonus stage: a spinning gold star in a ring
        g.fillStyle(0xffd23f, 0.18).fillCircle(p.x, p.y, r + 6);
        const pts = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; pts.push({ x: p.x + Math.cos(a) * rr, y: p.y + Math.sin(a) * rr }); }
        g.fillStyle(0x1a1020, 1).fillPoints(pts.map(q => ({ x: q.x + 2, y: q.y + 2 })), true); g.fillStyle(0xffd23f, 1).fillPoints(pts, true);
        this.ui.add(g);
      } else if (n.kind === 'warp') {                              // warp zone: a swirling portal (spun in update)
        this.flair.push({ kind: 'portal', x: p.x, y: p.y, r });
      } else {                                                     // a real little planet: the level's own surface, shaded into a sphere
        g.fillStyle(L.planet.glow, open ? 0.22 : 0.06).fillCircle(p.x, p.y, r + 7);
        this.ui.add(g);
        const img = this.add.image(p.x, p.y, 'surf' + n.id).setDisplaySize(r * 2, r * 2);
        if (!open) img.setTint(0x2a3050);
        this.ui.add(img);
        this.ui.add(this.add.image(p.x, p.y, 'map_shade').setDisplaySize(r * 2 + 1, r * 2 + 1));
        const rim = this.add.graphics(); rim.lineStyle(2, open ? L.planet.rim : 0x3a4270, open ? 0.9 : 1).strokeCircle(p.x, p.y, r); this.ui.add(rim);
        if (!open) {                                               // padlock
          const k = this.add.graphics();
          k.lineStyle(3, 0x9aa4c8, 1).strokeCircle(p.x, p.y - r * 0.2, r * 0.22);
          k.fillStyle(0x9aa4c8, 1).fillRect(p.x - r * 0.34, p.y - r * 0.1, r * 0.68, r * 0.5); k.fillStyle(0x2a3058, 1).fillRect(p.x - 1, p.y + r * 0.02, 2, r * 0.22);
          this.ui.add(k);
        }
        // a touch of character per world (animated in update)
        if (n.id === 4 && open) this.flair.push({ kind: 'flames', x: p.x, y: p.y, r });
        if (n.id === 3) this.flair.push({ kind: 'ring', x: p.x, y: p.y, r, open });
        if (n.id === 2 && open) this.flair.push({ kind: 'drips', x: p.x, y: p.y, r });
        if (n.id === 7 && open) { const s = this.add.image(p.x, p.y, 'ratship').setScale(0.16); this.ui.add(s); this.flair.push({ kind: 'orbit', x: p.x, y: p.y, r, s }); }
        if (n.id === 9) {                                          // Bessie's UFO, hovering over the last world: the goal
          const beam = this.add.image(p.x, p.y - r - 30, 'beam0').setOrigin(0.5, 0).setScale(0.32, 0.22).setAlpha(0.7);
          const cow = this.add.image(p.x, p.y - r - 14, 'bessie').setScale(0.26);
          const ufo = this.add.image(p.x, p.y - r - 34, 'ratship').setScale(0.5);
          this.ui.add([beam, cow, ufo]); this.flair.push({ kind: 'ufo', x: p.x, y: p.y, r, beam, cow, ufo });
        }
      }
      // labels: "LV. 3" over the world's name (??? until it's open). Secret stops label to the side.
      const side = !!n.kind, lx = side ? p.x + r + 8 : p.x, ly = side ? p.y - 8 : p.y + r + 6, org = side ? 0 : 0.5;
      const top1 = n.kind === 'bonus' ? 'BONUS' : n.kind === 'warp' ? 'WARP' : 'LV. ' + n.id;
      const name = n.kind === 'bonus' ? (n.id === 'centrifuge' ? 'CENTRIFUGE' : n.id === 'freefall' ? 'GRILL FREEFALL' : 'ZERO-G ROOM') : n.kind === 'warp' ? 'FONDUE FOUNTAIN' : open ? L.short : '???';
      this.ui.add(this.add.text(lx, ly, top1, f(7, open ? '#ffd23f' : '#5a6488', { stroke: '#1a1020', strokeThickness: 3 })).setOrigin(org, 0));
      this.ui.add(this.add.text(lx, ly + 11, name, f(6, open ? '#ffffff' : '#5a6488', { stroke: '#1a1020', strokeThickness: 3, align: side ? 'left' : 'center', lineSpacing: 3, wordWrap: { width: side ? 80 : Math.max(60, W * 0.1) } })).setOrigin(org, 0));
      const rk = typeof n.id === 'number' && Progress.rank(n.id);
      if (rk) this.ui.add(this.add.text(p.x + r * 0.85, p.y - r * 0.85, rk, f(9, { S: '#ffd23f', A: '#7dff8a', B: '#5ce1ff', C: '#ffffff', D: '#ff9db8' }[rk], { stroke: '#1a1020', strokeThickness: 3 })).setOrigin(0.5));
      const z = this.add.zone(p.x - r - 10, p.y - r - 10, r * 2 + 20, r * 2 + 36).setOrigin(0).setInteractive({ useHandCursor: true });
      z.on('pointerdown', () => { this.wantFs = true; });
      z.on('pointerup', () => { if (!open) { Sound.sfx('clunk'); return; } if (this.sel === n.id) this.go(n.id); else this.travel(n.id); });   // tap to pick, tap again to go
      this.ui.add(z);
    }
    if (!this.ids.includes(this.sel) || !this.isOpen(this.sel)) this.sel = 1;
    // the secret-exit hint: a level with an undiscovered warp shows a stub of route trailing off into the dark, with a '?'
    this.stubs = [];
    for (const n of this.nodes) {
      const w = !n.kind && this.isOpen(n.id) && LEVELS[n.id] && LEVELS[n.id].warp; if (!w || Progress.found(w.to)) continue;
      const tgt = this.mapNodes().find(q => q.id === w.to); if (!tgt) continue;
      const A = this.pos(n.id), B = { x: W * tgt.x, y: top + mh * tgt.y };
      const end = { x: A.x + (B.x - A.x) * 0.55, y: A.y + (B.y - A.y) * 0.55 };
      const q = this.add.text(end.x, end.y, '?', f(14, '#ff9a3a', { stroke: '#1a1020', strokeThickness: 5 })).setOrigin(0.5); this.ui.add(q);
      this.stubs.push({ A, end, q });
    }
    const back = this.add.text(10, 10, '< MENU', f(8, '#9fa6c2', { stroke: '#1a1020', strokeThickness: 4 })).setInteractive({ useHandCursor: true });
    back.on('pointerup', () => { if (!this.going) this.scene.start('menu'); });
    this.ui.add(back);
    // TEST buttons (top right): open the next stop on the road, open a level's secret warp, lock everything again
    this.testBtns = [];
    const tb = (y, label, fn) => { const b = this.add.text(W - 8, y, label, f(6, '#1a1020', { backgroundColor: '#7dff8a', padding: { x: 5, y: 4 } })).setOrigin(1, 0).setInteractive({ useHandCursor: true }); b.on('pointerup', fn); this.ui.add(b); this.testBtns.push(b); return b; };
    const next = [2, 3, 4, 5, 6, 7, 8, 9].find(id => !this.isOpen(id));
    if (next) tb(8, 'TEST: OPEN LEVEL ' + next, () => { Progress.setBest(next - 1); Sound.sfx('power'); this.build(); });
    this.clearBtn = tb(28, '', () => {                              // 'clear' the picked stop (opens whatever comes after it, secret routes too)
      const id = this.sel;
      if (id === 5.5) { try { localStorage.setItem('lc_sbeat_5.5', '1'); } catch (e) { /* ignore */ } }
      else if (typeof id === 'number') Progress.setBest(Math.max(Progress.best, id));
      Sound.sfx('power'); this.build();
    });
    this.secretBtn = tb(28, '', () => { const w = LEVELS[this.sel] && LEVELS[this.sel].warp; if (w) { Progress.find(w.to); Sound.sfx('power'); this.build(); } });
    if (Progress.best > 0 || Progress.found(5.5) || Progress.secretBeat(5.5)) tb(0, 'TEST: LOCK ALL', () => { Progress.setBest(0); try { localStorage.removeItem('lc_found5.5'); localStorage.removeItem('lc_found6'); localStorage.removeItem('lc_sbeat_5.5'); } catch (e) { /* ignore */ } this.sel = 1; Sound.sfx('clunk'); this.build(); });
    this.infoBox = this.add.container(0, 0); this.ui.add(this.infoBox);
    this.buildInfo();
  }
  // the panels along the bottom: the stop you've picked (left), lives and golden wheels (right)
  buildInfo() {
    if (!this.infoBox) return;
    const W = this.scale.width, H = this.scale.height, f = this.f, n = this.nodes.find(q => q.id === this.sel) || this.nodes[0], L = LEVELS[n.id];
    this.infoBox.removeAll(true);
    if (this.secretBtn) {                                          // the TEST secret-warp button shows on a level that has a warp in it
      const w = L && L.warp, show = !!w && !Progress.found(w.to);
      this.secretBtn.setVisible(show).setText(show ? 'TEST: OPEN SECRET ' + (LEVELS[w.to].short || w.to) : '');
      const id = this.sel, canClear = id === 5.5 ? !Progress.secretBeat(5.5) : (typeof id === 'number' && Progress.best < id && id < 9);
      this.clearBtn.setVisible(canClear).setText(canClear ? 'TEST: CLEAR ' + (id === 5.5 ? 'FONDUE FOUNTAIN' : 'LV ' + id) : '');
      let y = 8; for (const b of this.testBtns) if (b.visible) { b.setY(y); y += 18; }
    }
    const y0 = Math.round(this.panelY || H * 0.76), ph = H - y0 - 6, rw = Math.min(190, W * 0.26), lw = W - 24 - rw;
    const panel = (x, y, w, h) => {
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.35).fillRect(x + 3, y + 3, w, h);
      g.fillStyle(0x0e1434, 0.94).fillRect(x, y, w, h);
      g.lineStyle(3, 0x3a5aa8, 1).strokeRect(x, y, w, h); g.lineStyle(1, 0x1a2458, 1).strokeRect(x + 4, y + 4, w - 8, h - 8);
      this.infoBox.add(g);
    };
    panel(8, y0, lw, ph); panel(W - 8 - rw, y0, rw, ph);
    // left: a framed thumbnail of the world, its name, blurb, rank and wheels
    const ts = Math.min(ph - 16, 54), tx = 16, ty = y0 + (ph - ts) / 2;
    const fr = this.add.graphics(); fr.fillStyle(0x070a1c, 1).fillRect(tx, ty, ts, ts); fr.lineStyle(2, 0xb9c4e8, 1).strokeRect(tx, ty, ts, ts); this.infoBox.add(fr);
    if (!n.kind) { this.infoBox.add(this.add.image(tx + ts / 2, ty + ts / 2, 'surf' + n.id).setDisplaySize(ts - 12, ts - 12)); this.infoBox.add(this.add.image(tx + ts / 2, ty + ts / 2, 'map_shade').setDisplaySize(ts - 11, ts - 11)); }
    else this.infoBox.add(this.add.text(tx + ts / 2, ty + ts / 2, n.kind === 'bonus' ? 'BONUS' : 'WARP', f(8, '#ffd23f')).setOrigin(0.5));
    const name = n.name || ('LV ' + n.id + ': ' + L.short), blurb = n.blurb || L.blurb, x1 = tx + ts + 12;
    this.infoBox.add(this.add.text(x1, y0 + 10, name, f(10, '#ffd23f', { stroke: '#1a1020', strokeThickness: 4 })));
    this.infoBox.add(this.add.text(x1, y0 + 27, blurb, f(7, '#c8cde0', { lineSpacing: 5, wordWrap: { width: lw - (x1 - 8) - 14 } })));
    if (typeof n.id === 'number' && !n.kind) {
      const wm = Progress.wheels(n.id), rk = Progress.rank(n.id);
      for (let k = 0; k < 3; k++) this.infoBox.add(this.add.image(8 + lw - 54 + k * 16, y0 + 15, 'goldwheel').setScale(0.55).setAlpha(wm & (1 << k) ? 1 : 0.2));
      if (rk) this.infoBox.add(this.add.text(8 + lw - 72, y0 + 15, rk, f(10, '#ffd23f', { stroke: '#1a1020', strokeThickness: 3 })).setOrigin(0.5));
    }
    this.infoBox.add(this.add.text(8 + lw - 10, y0 + ph - 8, Pad.state.connected ? 'A: GO' : 'TAP AGAIN TO GO', f(6, '#6b7390')).setOrigin(1, 1));
    // right: lives and how many golden cheese wheels you've found in total
    const lives = this.registry.get('lives') > 0 ? this.registry.get('lives') : CFG.startLives;
    let wheels = 0; for (let i = 1; i <= 9; i++) wheels += Progress.wheelCount(i);
    const rx = W - rw + 2, half = ph / 2;
    this.infoBox.add(this.add.text(rx, y0 + half * 0.5 + 2, 'LIVES: ' + lives, f(9, '#ffffff', { stroke: '#1a1020', strokeThickness: 3 })).setOrigin(0, 0.5));
    for (let k = 0; k < Math.min(3, lives); k++) this.infoBox.add(this.add.image(W - 30 - k * 18, y0 + half * 0.5 + 2, 'wedge').setScale(0.9));
    this.infoBox.add(this.add.text(rx, y0 + half * 1.5 - 2, 'WHEELS: ' + wheels + '/27', f(9, '#ffffff', { stroke: '#1a1020', strokeThickness: 3 })).setOrigin(0, 0.5));
    this.wheelIcon = this.add.image(W - 30, y0 + half * 1.5 - 2, 'goldwheel').setScale(0.8); this.infoBox.add(this.wheelIcon);
  }

  update(time) {
    const W = this.scale.width, H = this.scale.height, g = this.bg;
    const dt = Math.min(0.05, ((time - (this.lastT || time)) / 1000) || 0.016); this.lastT = time;
    g.clear();
    // twinkling stars, a few of them four-point sparkles
    for (const [i, s] of this.stars.entries()) {
      const a = 0.35 + 0.35 * Math.sin(time / 600 + s.tw), x = s.x * W, y = s.y * H;
      if (i % 9 === 0) { const l = 2 + 3 * (0.5 + 0.5 * Math.sin(time / 400 + s.tw)); g.fillStyle(0xfff3c0, a + 0.2).fillRect(x - l, y, l * 2 + 1, 1).fillRect(x, y - l, 1, l * 2 + 1); }
      else g.fillStyle(0xffffff, a).fillRect(x, y, s.s, s.s);
    }
    // the routes: chunky gold dots along a gentle curve, a bright pulse marching along; faint where it's still locked
    if (this.pos) for (const [a, b] of this.mapLinks()) {
      if (!this.ids.includes(a) || !this.ids.includes(b)) continue;          // a secret stop you haven't found: no route either
      const A = this.pos(a), B = this.pos(b), d = Math.hypot(B.x - A.x, B.y - A.y), n = Math.floor(d / 10);
      const shut = !this.isOpen(a) || !this.isOpen(b), bonus = [a, b].some(id => /^zerog/.test(id) || id === 'freefall' || id === 'centrifuge' || id === 5.5);
      const cx = (A.x + B.x) / 2 - (B.y - A.y) * 0.18, cy = (A.y + B.y) / 2 + (B.x - A.x) * 0.18;
      for (let k = 1; k < n; k++) {
        const u = k / n, iu = 1 - u, x = iu * iu * A.x + 2 * iu * u * cx + u * u * B.x, y = iu * iu * A.y + 2 * iu * u * cy + u * u * B.y;
        if (Math.hypot(x - A.x, y - A.y) < this.nodeR + 10 || Math.hypot(x - B.x, y - B.y) < this.nodeR + 10) continue;   // start at the planets' edges
        if (shut) { if (k % 2 === 0) g.fillStyle(0x3a4270, 0.6).fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2); continue; }
        const lit = ((k - time / 110) % 7 + 7) % 7 < 1;
        g.fillStyle(0x1a1020, 0.8).fillRect(Math.round(x) - 1, Math.round(y) - 1, 4, 4);
        g.fillStyle(lit ? 0xffffff : (bonus ? 0xff9a3a : 0xffd23f), 1).fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4);
      }
    }
    for (const S of (this.stubs || [])) {                         // secret-exit stubs: orange dots fading off into the dark
      const n = 9;
      for (let k = 1; k < n; k++) {
        const u = k / n, x = S.A.x + (S.end.x - S.A.x) * u, y = S.A.y + (S.end.y - S.A.y) * u;
        if (Math.hypot(x - S.A.x, y - S.A.y) < this.nodeR + 8) continue;
        g.fillStyle(0xff9a3a, (1 - u) * (0.5 + 0.4 * Math.sin(time / 200 - k))).fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4);
      }
      S.q.setAlpha(0.5 + 0.4 * Math.sin(time / 250)).setScale(1 + 0.1 * Math.sin(time / 180));
    }
    // each world's touch of character
    this.selG.clear();
    const fx = this.selG;
    for (const F of (this.flair || [])) {
      if (F.kind === 'flames') for (let k = 0; k < 5; k++) {
        const a = -Math.PI / 2 + (k - 2) * 0.32, bx = F.x + Math.cos(a) * F.r * 0.92, by = F.y + Math.sin(a) * F.r * 0.92, hgt = F.r * (0.45 + 0.25 * Math.sin(time / 90 + k * 1.7));
        fx.fillStyle(0xff4a1a, 0.9).fillTriangle(bx - 4, by + 2, bx + 4, by + 2, bx + Math.cos(a) * hgt, by + Math.sin(a) * hgt);
        fx.fillStyle(0xffd23f, 1).fillTriangle(bx - 2, by + 1, bx + 2, by + 1, bx + Math.cos(a) * hgt * 0.55, by + Math.sin(a) * hgt * 0.55);
      }
      if (F.kind === 'ring') { fx.lineStyle(2, F.open ? 0xe8e0c8 : 0x3a4270, 0.8).strokeEllipse(F.x, F.y, F.r * 3.1, F.r * 0.8); }
      if (F.kind === 'drips') for (let k = 0; k < 3; k++) { const u = ((time / 1400 + k / 3) % 1), x = F.x + (k - 1) * F.r * 0.5; fx.fillStyle(0x7dff8a, 0.8 * (1 - u)).fillCircle(x, F.y + F.r * 0.85 + u * 14, 2); }
      if (F.kind === 'orbit') { const a = time / 900; F.s.setPosition(F.x + Math.cos(a) * F.r * 1.5, F.y + Math.sin(a) * F.r * 0.5).setDepth(Math.sin(a) > 0 ? 2 : 0); }
      if (F.kind === 'ufo') { const b = Math.sin(time / 500) * 3; F.ufo.setY(F.y - F.r - 34 + b).setRotation(Math.sin(time / 700) * 0.08); F.cow.setY(F.y - F.r - 14 + b * 0.5).setRotation(Math.sin(time / 300) * 0.2); F.beam.setY(F.y - F.r - 30 + b).setAlpha(0.5 + 0.25 * Math.sin(time / 120)); }
      if (F.kind === 'portal') for (let k = 0; k < 4; k++) { fx.lineStyle(3, [0xff7a2a, 0xffd23f, 0xff4a7a, 0xffffff][(k + Math.floor(time / 140)) % 4], 1).strokeCircle(F.x, F.y, F.r * (1 - k * 0.22) + Math.sin(time / 200 + k) * 1.5); }
    }
    if (this.wheelIcon) this.wheelIcon.setScale(0.8 * Math.max(0.15, Math.abs(Math.cos(time / 500))), 0.8);
    if (this.pos && this.ids && this.ids.includes(this.sel)) {
      const p = this.pos(this.sel), r = this.nodeR + 8 + Math.sin(time / 150) * 2;
      fx.lineStyle(3, 0xffffff, 0.85).strokeCircle(p.x, p.y, r);
      // Chris glides over to it (feet just above the planet), bobbing on his jetpack
      let tx = p.x, ty = p.y - this.nodeR - 8 + Math.sin(time / 260) * 3, k = Math.min(1, dt * 5), boost = 0;
      const T = this.trip;
      if (T && this.ids.includes(T.from) && this.ids.includes(T.to)) {     // BOOSTING along the route
        T.u = Math.min(1, T.u + dt / 0.7);
        const e = T.u * T.u * (3 - 2 * T.u);
        let q;
        if (T.link) q = this.routePt(T.link[0], T.link[1], T.link[0] === T.from ? e : 1 - e);
        else { const A = this.pos(T.from), B = this.pos(T.to); q = { x: A.x + (B.x - A.x) * e, y: A.y + (B.y - A.y) * e }; }
        tx = q.x; ty = q.y - this.nodeR - 8 - Math.sin(T.u * Math.PI) * 14; k = 1; boost = Math.sin(T.u * Math.PI);
        if (T.u >= 1) this.trip = null;
      } else this.trip = null;
      if (this.rigX === null) { this.rigX = tx; this.rigY = ty; }
      const vx = (tx - this.rigX) * k / Math.max(dt, 0.001), vy = (ty - this.rigY) * k / Math.max(dt, 0.001);
      this.rigX += (tx - this.rigX) * k; this.rigY += (ty - this.rigY) * k;
      // the boost trail: puffs left behind while he's moving fast
      this.trail = this.trail || [];
      if (Math.hypot(vx, vy) > 60 && Math.random() < 0.9) this.trail.push({ x: this.rigX - (this.rigP.facing || 1) * 6, y: this.rigY - 6, life: 0.45, s: 2 + Math.random() * 3 });
      for (let i = this.trail.length - 1; i >= 0; i--) { const q = this.trail[i]; q.life -= dt; q.y += dt * 10; if (q.life <= 0) { this.trail.splice(i, 1); continue; } fx.fillStyle(q.life > 0.3 ? 0xffd23f : 0xff7a1a, q.life * 1.8).fillCircle(q.x, q.y, q.s * (0.6 + q.life)); }
      const P = this.rigP; if (Math.abs(vx) > 8) P.facing = vx > 0 ? 1 : -1;
      P.vx = vx * 0.3; P.vh = -(ty - this.rigY) * 4;
      const sc = Math.max(0.38, Math.min(0.6, this.nodeR / 40));
      this.rig.update(P, dt, Math.round(this.rigX), Math.round(this.rigY), sc, 1, 0);
      this.rig.root.setRotation(Math.max(-0.35, Math.min(0.35, vx / 900)));
      const jx = this.rigX - P.facing * 9 * sc, jy = this.rigY - 18 * sc, fl = (1 + 0.35 * Math.sin(time / 30)) * (1 + boost * 1.6);
      fx.fillStyle(0xff7a1a, 0.9).fillTriangle(jx - 4 * sc, jy, jx + 4 * sc, jy, jx, jy + 16 * sc * fl);
      fx.fillStyle(0xffe27a, 1).fillTriangle(jx - 2 * sc, jy, jx + 2 * sc, jy, jx, jy + 9 * sc * fl);
    }
  }
}

// ---------------------------------------------------------------- pixel-art planet surface
// Builds a chunky 16-bit planet texture once: dithered cheese tones, a crusty rind round the edge, shaded craters,
// Gruyere holes, crumbs and debris. Drawn at HALF resolution and shown at 2x with nearest-neighbour filtering,
// so every texel is a fat pixel. It rotates with the world; lighting/depth is a separate fixed overlay.
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
function makePlanetTexture(scene, key, Rw, pal, seed, opts) {
  opts = opts || {};
  if (opts.grater) return makeMetalPlanet(scene, key, Rw, pal, seed);
  if (scene.textures.exists(key)) return;
  const S = Math.round(Rw), c = S / 2, r = S / 2;                  // texture is Rw x Rw, shown at 2x = full diameter
  let sd = seed || 1;
  const rand = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  const hex = v => [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  const P = pal.concat(opts.rim || [], opts.spot || []).map(hex);   // tones, dark -> light (+ optional moss crust and spot tones)
  const nP = pal.length, RIM = opts.rim ? nP : -1, SPOT = opts.spot ? nP + (opts.rim ? opts.rim.length : 0) : -1;
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
    if (RIM >= 0 && d > (opts.rimD || 0.952) + (noise(x * 4, y * 4) - 0.5) * 0.03) {   // a ragged mossy crust in its own tones
      const m = 1.2 + (noise(x * 5, y * 5) - 0.5) * 2 + (d - 0.95) * 25;
      T[j] = RIM + Math.max(0, Math.min(2, Math.floor(m) + ((m - Math.floor(m)) > th ? 1 : 0))); continue;
    }
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
      if (dd < 1) { took[j] = 1; T[j] = SPOT >= 0 ? (dd > 0.6 && hy < 0 ? SPOT + 1 : SPOT) : (dd > 0.7 && hy > 0 ? 3 : 0); }
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

// L3: a polished steel dome. Concentric riveted panels, radial seams, and rings of almond-shaped grater holes with a
// sharp bright cutting lip near the surface (which is the part you actually see).
function makeMetalPlanet(scene, key, Rw, pal, seed) {
  if (scene.textures.exists(key)) return;
  const S = Math.round(Rw), c = S / 2, r = S / 2;
  const hex = v => [(v >> 16) & 255, (v >> 8) & 255, v & 255], P = pal.map(hex), N = P.length - 1;
  const tex = scene.textures.createCanvas(key, S, S), ctx = tex.getContext(), img = ctx.createImageData(S, S), D = img.data;
  const T = new Int8Array(S * S).fill(-1);
  const rings = [0.62, 0.71, 0.8, 0.89], holeL = 7, holeW = 2.2;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = x + 0.5 - c, dy = y + 0.5 - c, d = Math.sqrt(dx * dx + dy * dy) / r;
    if (d > 1) continue;
    const th = BAYER4[(y & 3) * 4 + (x & 3)], ang = Math.atan2(dy, dx);
    // brushed steel: lit from the top-left, with banded panels
    let v = 2.6 + (-dx - dy) / S * 1.6 + Math.sin(d * 60) * 0.25 + Math.sin(ang * 3 + d * 9) * 0.2;
    const band = d * 11, fb = band - Math.floor(band);
    if (fb < 0.07) v = 1.2;                                            // concentric panel seams
    else if (fb > 0.93) v += 1.1;                                      // lit edge just above each seam
    const radial = (ang / (Math.PI * 2) * 24 + 24) % 1;
    if ((radial < 0.025 || radial > 0.975) && d < 0.97) v = 1.3;        // radial seams
    T[y * S + x] = Math.max(0, Math.min(N, Math.floor(v) + ((v - Math.floor(v)) > th ? 1 : 0)));
    if (d > 0.97) T[y * S + x] = d > 0.988 ? 0 : N;                    // polished rim
  }
  // rivets along the seams
  for (let b = 2; b < 11; b++) { const rr = (b / 11) * r + 2, n = Math.floor(rr * 0.35); for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, x = Math.round(c + Math.cos(a) * rr), y = Math.round(c + Math.sin(a) * rr); if (x > 0 && y > 0 && x < S - 1 && y < S - 1) { T[y * S + x] = N; T[(y + 1) * S + x] = 1; } } }
  // grater holes
  rings.forEach((rd, ri) => {
    const rr = rd * r, n = Math.floor(Math.PI * 2 * rr / 13);
    for (let k = 0; k < n; k++) {
      const a = (k + (ri % 2) * 0.5) / n * Math.PI * 2, hx = c + Math.cos(a) * rr, hy = c + Math.sin(a) * rr;
      const tx = -Math.sin(a), ty = Math.cos(a), nx = Math.cos(a), ny = Math.sin(a);   // tangent / outward
      for (let y = Math.floor(hy - holeL); y <= Math.ceil(hy + holeL); y++) for (let x = Math.floor(hx - holeL); x <= Math.ceil(hx + holeL); x++) {
        if (x < 0 || y < 0 || x >= S || y >= S) continue;
        const px = x + 0.5 - hx, py = y + 0.5 - hy, u = (px * tx + py * ty) / holeL, w = (px * nx + py * ny) / holeW;
        const e = u * u + w * w;
        if (e < 1) T[y * S + x] = w > 0.35 ? 1 : 0;                    // dark slot (a touch lighter at the far wall)
        else if (e < 1.7 && w < -0.2) T[y * S + x] = N;                // the bright cutting lip on the inner edge
        else if (e < 1.5 && w > 0.4) T[y * S + x] = 1;                 // raised shadow on the outer edge
      }
    }
  });
  for (let j = 0; j < S * S; j++) { const t = T[j]; if (t < 0) continue; const col = P[t]; D[j * 4] = col[0]; D[j * 4 + 1] = col[1]; D[j * 4 + 2] = col[2]; D[j * 4 + 3] = 255; }
  ctx.putImageData(img, 0, 0); tex.refresh(); tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

// fixed (non-rotating) overlay: dithered darkening deeper into the planet + bright dithered rim
function makePlanetShade(scene, key, Rw, rimCol, darkCol) {
  const RC = rimCol || [255, 246, 190], DC = darkCol || [40, 14, 60];
  if (scene.textures.exists(key)) return;
  const S = Math.round(Rw), c = S / 2, r = S / 2;
  const tex = scene.textures.createCanvas(key, S, S), ctx = tex.getContext(), img = ctx.createImageData(S, S), D = img.data;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const d = Math.hypot(x + 0.5 - c, y + 0.5 - c) / r;
    if (d > 1) continue;
    const th = BAYER4[(y & 3) * 4 + (x & 3)], i = (y * S + x) * 4;
    const dark = Math.max(0, Math.min(0.7, (0.8 - d) * 1.6));      // deeper = darker
    if (dark > th) { D[i] = DC[0]; D[i + 1] = DC[1]; D[i + 2] = DC[2]; D[i + 3] = 105; }
    else if (d > 0.955 && d < 0.985 && th < 0.5) { D[i] = RC[0]; D[i + 1] = RC[1]; D[i + 2] = RC[2]; D[i + 3] = 200; }   // rim light
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

// ---------------------------------------------------------------- roadmap art: new enemies, bosses and shots (levels 4-9)
// Bosses are 96px tall (the boss gun maths assumes it); cannon positions are given relative to the sprite centre in each AI.
function makeRoadmapTextures(scene) {
  if (madeTex(scene, 'oven')) return;
  const STEEL = [0xdfe6f0, 0x9aa4b4, 0x5a6272], RUST = [0xd08a5a, 0x9a5a32, 0x5e3020], GOLD = [0xfff0a0, 0xffc83a, 0xb07a1a];
  // ---- shots
  pixSprite(scene, 'pepper', 16, 16, p => { p.ell(8, 8, 7, 7, [0xff7a6a, 0xd0301a, 0x8a1a10]); for (const [x, y] of [[5, 5], [10, 6], [7, 10], [11, 10], [4, 9]]) { p.px(x, y, 0x7a1010); p.px(x + 1, y, 0xff9a8a); } });
  pixSprite(scene, 'psyorb', 14, 14, p => { p.ell(7, 7, 6, 6, [0xf0c8ff, 0xb06aff, 0x6a2ad0]); p.ell(7, 7, 3, 3, [0xffffff, 0xf0d8ff, 0xc890ff]); p.px(5, 4, 0xffffff); });
  pixTex(scene, 'goop', 64, 26, put => {                         // purple quicksand pit: flush with the ground, walls sloping in, murky depths
    for (let y = 0; y < 26; y++) for (let x = 0; x < 64; x++) {
      const inset = y < 4 ? 0 : (y - 4) * 0.42, ex = Math.min(x, 63 - x) - inset;   // narrower the deeper it goes
      const wave = y === 2 && ((x >> 2) % 2) === 0 ? 1 : 0;           // a gently rippled surface
      if (ex < 0 || y < 2 + wave) continue;
      let c;
      if (ex < 1 || y === 25) c = 0x12061e;                          // outline / pit wall edge
      else if (y <= 3 + wave) c = 0xf0c8ff;                          // glossy surface
      else if (y < 7) c = 0xc070f0;
      else if (y < 14) c = ((x * 5 + y * 3) % 13 === 0) ? 0x9a4ae0 : 0x8a3ad0;
      else c = ((x * 7 + y) % 11 === 0) ? 0x6a28b0 : 0x4e1a88;
      if (y > 5 && ex < 3) c = 0x2a0c4a;                             // shadowed walls
      put(x, y, c);
    }
    for (const [bx, by] of [[14, 9], [38, 8], [26, 14], [48, 11], [22, 19], [40, 18]]) { put(bx, by, 0xf0d0ff); put(bx + 1, by, 0xc890f0); put(bx, by + 1, 0xc890f0); }
  });
  pixSprite(scene, 'goopbub', 8, 8, p => { p.ell(4, 4, 3, 3, [0xf4d8ff, 0xc070f0, 0x7a30c0]); p.px(3, 2, 0xffffff); });
  // dark basalt boulders with mossy tops
  pixSprite(scene, 'rock_dark', 44, 30, p => {
    p.poly([[2, 29], [4, 16], [12, 6], [24, 2], [34, 6], [41, 15], [43, 29]], [0x3a4652, 0x222a34, 0x10151c]);
    p.line([[14, 12], [20, 20], [18, 28]], 0x0a0e14); p.line([[30, 10], [28, 18]], 0x0a0e14);
    p.poly([[10, 8], [18, 3], [28, 2], [36, 7], [30, 9], [20, 7], [13, 11]], [0x8af06a, 0x3aa040, 0x1a5a2a]);  // moss cap
    p.px(16, 14, 0x5a6878); p.px(32, 20, 0x5a6878);
  });
  pixSprite(scene, 'rock_dark2', 30, 22, p => {
    p.poly([[1, 21], [3, 10], [10, 3], [20, 2], [27, 8], [29, 21]], [0x3a4652, 0x222a34, 0x10151c]);
    p.poly([[8, 5], [14, 2], [22, 3], [18, 6], [11, 7]], [0x8af06a, 0x3aa040, 0x1a5a2a]); p.line([[16, 9], [13, 18]], 0x0a0e14);
  });
  pixSprite(scene, 'ghostorb', 14, 14, p => { p.ell(7, 7, 6, 6, [0xffffff, 0xc8f0ff, 0x7ab8e0]); p.px(5, 4, 0xffffff); });
  pixSprite(scene, 'chili', 10, 12, p => { p.poly([[2, 2], [8, 3], [6, 11], [3, 9]], [0xff6a4a, 0xe02a1a, 0x8a1a10]); p.px(4, 1, 0x4ac040); p.px(5, 1, 0x2a8a20); });
  // ---- L2 skyline: giant beast skeletons and tall glowing mushrooms
  const BONE_SAGE = [0xe0f4e8, 0xa8d4c0, 0x5e8e7e], BONE_WHITE = [0xfffcf2, 0xe4dac2, 0x9a8e74];
  for (const [rk, BONE] of [['bg_ribcage', BONE_SAGE], ['bone_ribcage', BONE_WHITE]]) pixSprite(scene, rk, 140, 80, p => {                 // a long-dead space beast: arched spine, ribs hanging to the ground
    const spine = []; for (let i = 0; i <= 16; i++) { const t = i / 16; spine.push([8 + t * 126, 64 - Math.sin(Math.min(1, t * 1.15) * Math.PI) * 50 - t * 6]); }
    for (let i = 3; i <= 14; i++) {                                // ribs (biggest in the middle)
      const [x, y] = spine[i], k = Math.sin((i / 16) * Math.PI), drop = 76 - y, sw = 10 + 10 * k;
      p.line([[x, y], [x + sw * 0.5, y + drop * 0.25], [x + sw * 0.7, y + drop * 0.6], [x + sw * 0.3, y + drop * 0.92]], BONE[1], 3);
      p.line([[x - 1, y + 1], [x + sw * 0.5 - 1, y + drop * 0.25], [x + sw * 0.7 - 1, y + drop * 0.55]], BONE[0]);
      p.line([[x, y], [x - sw * 0.35, y + drop * 0.3], [x - sw * 0.45, y + drop * 0.7]], BONE[2], 2);     // the far-side ribs, in shadow
    }
    for (let i = 0; i < spine.length; i++) { const [x, y] = spine[i]; p.ell(x, y, 4.2 - i * 0.12, 3.4, BONE); p.px(x, y - 4, BONE[1]); p.px(x, y - 5, BONE[2]); }   // vertebrae + spines
    p.ell(10, 66, 6, 5, BONE); p.ell(132, 34, 3, 3, BONE);         // hip / tail tip
  });
  for (const [rk, BONE] of [['bg_skull', BONE_SAGE], ['bone_skull', BONE_WHITE]]) pixSprite(scene, rk, 76, 46, p => {   // horned beast skull, half sunk
    p.poly([[4, 40], [8, 22], [22, 10], [44, 8], [60, 14], [72, 26], [74, 38], [62, 42], [40, 44], [16, 44]], BONE);
    p.poly([[42, 12], [52, 2], [66, 0], [58, 6], [52, 14]], BONE);   // horn
    p.poly([[16, 14], [10, 4], [2, 2], [8, 10], [12, 18]], BONE);
    p.ell(26, 24, 7, 6, 0x0e1e22); p.ell(25, 23, 3, 2.5, 0x2ad0c0);  // eye socket (faint glow deep inside)
    p.ell(56, 30, 4, 3, 0x0e1e22); p.ell(66, 33, 2, 2, 0x0e1e22);   // nasal holes
    for (let x = 40; x < 72; x += 5) p.poly([[x, 40], [x + 3, 40], [x + 1.5, 45]], BONE);          // teeth
    p.line([[14, 32], [34, 34], [50, 36]], BONE[2]);
  });
  pixSprite(scene, 'bg_shroom', 56, 92, p => {                     // a tall bioluminescent mushroom
    const CAP = [0x9afff0, 0x3ad0c8, 0x1a7a84], STEM = [0xe0fff6, 0x9ad8cc, 0x4a8a8c];
    p.poly([[25, 92], [24, 70], [22, 50], [24, 34], [30, 26], [34, 34], [33, 52], [34, 72], [36, 92]], STEM);   // a curvy stem
    p.line([[27, 88], [26, 60], [26, 40]], 0xf0fffa);
    p.poly([[22, 50], [16, 52], [22, 56]], STEM); p.poly([[34, 70], [42, 68], [36, 74]], STEM);   // little frills
    p.ell(28, 22, 27, 16, CAP);                                     // the cap
    p.poly([[2, 24], [54, 24], [48, 30], [8, 30]], [0x6af0e0, 0x2aa8a8, 0x16686e]);               // underside rim
    for (let x = 8; x < 50; x += 4) p.line([[x, 25], [28 + (x - 28) * 0.4, 29]], 0x0e5a60);       // gills
    for (const [x, y, r] of [[14, 16, 3], [28, 10, 3.5], [40, 15, 2.6], [21, 22, 2], [36, 21, 2], [48, 20, 1.6]]) p.ell(x, y, r, r * 0.8, 0xd8fff8);   // glowing spots
  });
  pixSprite(scene, 'bg_shroom2', 40, 52, p => {                    // a smaller pair
    const CAP = [0x9afff0, 0x3ad0c8, 0x1a7a84], STEM = [0xe0fff6, 0x9ad8cc, 0x4a8a8c];
    p.poly([[11, 52], [12, 30], [16, 30], [16, 52]], STEM); p.ell(14, 26, 12, 8, CAP); for (const [x, y] of [[9, 23], [17, 21], [20, 27]]) p.ell(x, y, 1.6, 1.3, 0xd8fff8);
    p.poly([[28, 52], [28, 40], [31, 40], [32, 52]], STEM); p.ell(30, 37, 8, 5.5, CAP); p.px(28, 35, 0xd8fff8); p.px(33, 36, 0xd8fff8);
  });

  // ---- enemies
  pixSprite(scene, 'stinkfly', 34, 28, p => {                   // bloated blue-cheese swamp fly
    const WING = [0xe8fff8, 0xb8e8f0, 0x7ab0c8], BODY = [0x9ad8b8, 0x4a9a80, 0x1e5a4a], VEIN = 0x2a6a8a;
    p.ell(10, 7, 8, 5, WING); p.ell(23, 6, 8, 5, WING); p.line([[6, 7], [13, 8]], 0x9ac8d8); p.line([[20, 6], [27, 7]], 0x9ac8d8);
    p.ell(17, 17, 10, 8, BODY);                                     // fat mouldy abdomen
    for (const [x, y] of [[12, 15], [19, 20], [22, 14], [15, 21]]) { p.px(x, y, VEIN); p.px(x + 1, y, VEIN); }
    p.ell(27, 15, 5, 5, [0x6ab89a, 0x3a7a64, 0x1a4a3a]);                 // head
    p.ell(29, 13, 2.5, 2.5, [0xff9a8a, 0xe03030, 0x8a1010]); p.px(29, 12, 0xffffff);   // big red eye
    p.line([[31, 17], [33, 20]], 0x1a2a20);                            // proboscis
    p.line([[13, 24], [11, 27]], 0x1a2a20); p.line([[18, 25], [18, 27]], 0x1a2a20); p.line([[22, 24], [24, 27]], 0x1a2a20);   // dangly legs
  });
  pixSprite(scene, 'phantom', 36, 40, p => {                    // ghostly dairy-maid
    const GH = [0xffffff, 0xd8ecff, 0x8ab0e0];
    p.poly([[8, 18], [28, 18], [32, 34], [27, 30], [22, 38], [17, 31], [12, 38], [8, 31], [4, 35]], GH);   // wispy skirt
    p.ell(18, 14, 9, 9, GH);
    p.ell(18, 7, 12, 5, [0xffffff, 0xf0f4ff, 0xb8c8e8]); p.rect(7, 7, 29, 8, 0xe8b8d8);                   // frilly bonnet
    p.ell(14, 14, 2, 2.5, 0x1a2a4a); p.ell(22, 14, 2, 2.5, 0x1a2a4a); p.ell(18, 19, 1.5, 2, 0x1a2a4a);      // hollow eyes, "oooh" mouth
    p.line([[9, 20], [2, 24]], 0xd8ecff, 2); p.line([[27, 20], [34, 24]], 0xd8ecff, 2);                   // arms out to ram
    p.rrect(29, 22, 35, 29, 1, STEEL);                                                                      // milk pail
  });
  pixSprite(scene, 'paladin', 38, 32, p => {                    // armoured Rat-Paladin
    p.line([[3, 22], [0, 14], [3, 9]], 0xd9a5b3, 2);             // tail
    p.ell(17, 20, 12, 8, STEEL); p.rect(9, 18, 25, 19, 0x5a6272);
    p.ell(28, 14, 7, 7, STEEL); p.rect(28, 13, 35, 14, 0x1a1020); p.px(31, 13, 0xff4040);                 // helmet + visor slit
    p.poly([[25, 7], [29, 1], [33, 2], [30, 8]], [0xff6a6a, 0xe02a2a, 0x8a1010]);                         // plume
    p.ell(24, 6, 2, 3, 0xffb5c8);                                                                           // ear poking out
    p.rrect(29, 18, 37, 28, 2, GOLD); p.px(33, 22, 0xe63946); p.px(33, 23, 0xe63946);                    // shield
    for (const x of [11, 21]) p.rect(x, 27, x + 3, 31, 0x5a6272);
  });
  // ---- bosses
  pixSprite(scene, 'oven', 150, 96, p => {                      // L4: the giant pizza oven
    const BR = [0xe0845a, 0xb0502e, 0x6e2a18];
    p.rrect(100, 0, 116, 34, 2, [0xa0a4b0, 0x7b7f8c, 0x50545f]);                                         // chimney
    p.ell(75, 60, 68, 40, BR); p.rect(8, 60, 142, 95, BR[1]);
    for (let y = 30; y < 95; y += 8) { const hw = y < 60 ? Math.sqrt(Math.max(0, 1 - Math.pow((y - 60) / 40, 2))) * 66 : 66; p.line([[75 - hw, y], [75 + hw, y]], 0x6e2a18);
      for (let x = 75 - hw + ((y / 8) % 2) * 8; x < 75 + hw; x += 16) p.line([[x, y], [x, y + 7]], 0x6e2a18); }
    p.ell(75, 80, 36, 22, 0x1a0a08); p.rect(39, 80, 111, 95, 0x1a0a08);                                    // the mouth
    p.ell(75, 88, 28, 8, [0xffe27a, 0xff8a1a, 0xd0301a]);                                                    // fire
    p.poly([[46, 46], [66, 52], [64, 58], [46, 54]], [0xffe27a, 0xffb020, 0xd06a10]); p.poly([[104, 46], [84, 52], [86, 58], [104, 54]], [0xffe27a, 0xffb020, 0xd06a10]);   // glowing angry eyes
    p.rrect(0, 60, 14, 74, 3, STEEL); p.rrect(136, 60, 150, 74, 3, STEEL);                                 // pepperoni chutes
    p.ell(75, 22, 20, 6, [0xfff0b0, 0xf0c050, 0xc08020]); for (const x of [64, 74, 84]) p.ell(x, 21, 3, 2, [0xff7a6a, 0xd0301a, 0x8a1a10]);   // a pizza cooking on top
  });
  pixSprite(scene, 'milkmaid', 124, 96, p => {                  // L5: the phantom milkmaid
    const GH = [0xffffff, 0xd8ecff, 0x8ab0e0];
    p.poly([[34, 44], [90, 44], [104, 88], [92, 78], [82, 95], [70, 80], [58, 95], [46, 80], [34, 94], [26, 80], [18, 90]], GH);
    p.ell(62, 32, 18, 17, GH);
    p.ell(62, 18, 26, 10, [0xffffff, 0xf0f4ff, 0xb8c8e8]); p.rect(36, 20, 88, 22, 0xe8b8d8);
    p.ell(55, 32, 4, 5, 0x1a2a4a); p.ell(69, 32, 4, 5, 0x1a2a4a); p.px(54, 30, 0x9fd8ff); p.px(68, 30, 0x9fd8ff);
    p.ell(62, 42, 4, 5, 0x1a2a4a);
    p.line([[38, 48], [16, 60]], 0xd8ecff, 3); p.line([[86, 48], [108, 60]], 0xd8ecff, 3);
    p.rrect(4, 56, 22, 74, 2, STEEL); p.rrect(102, 56, 120, 74, 2, STEEL);                                 // two milk pails (the guns)
    p.ell(13, 57, 8, 2, 0xffffff); p.ell(111, 57, 8, 2, 0xffffff);
  });
  pixSprite(scene, 'wheel', 96, 96, p => {                      // L6: the gargantuan Spicy Pepper Jack
    p.ell(48, 48, 46, 46, [0xf0d890, 0xd8b050, 0x9a7020]);
    p.ell(48, 48, 39, 39, [0xfff8d0, 0xf6e6a0, 0xd8c070]);
    const r = rng(9);
    for (let k = 0; k < 40; k++) { const a = r() * 6.28, d = Math.sqrt(r()) * 34, x = 48 + Math.cos(a) * d | 0, y = 48 + Math.sin(a) * d | 0, c = k % 3 ? 0xe02a1a : 0x2a9a2a; p.px(x, y, c); p.px(x + 1, y, c); p.px(x, y + 1, c); }
    p.poly([[26, 34], [42, 40], [40, 46], [26, 42]], 0x1a1020); p.poly([[70, 34], [54, 40], [56, 46], [70, 42]], 0x1a1020);   // angry brows/eyes
    p.px(34, 41, 0xffffff); p.px(62, 41, 0xffffff);
    p.ell(48, 64, 16, 7, 0x6a1010); for (let x = 36; x < 62; x += 5) p.rect(x, 58, x + 2, 61, 0xffffff);   // snarling mouth
  });
  pixSprite(scene, 'flagship', 160, 96, p => {                  // L7: the rat armada flagship
    p.ell(54, 10, 8, 10, [0xffc8d8, 0xff9db8, 0xc06a88]); p.ell(106, 10, 8, 10, [0xffc8d8, 0xff9db8, 0xc06a88]);   // rat ears
    p.ell(80, 48, 64, 40, RUST);
    for (const y of [30, 48, 66]) p.line([[20, y], [140, y]], 0x5e3020);
    for (let x = 30; x < 135; x += 18) p.px(x, 40, 0xffd8a8);
    for (const x of [52, 80, 108]) { p.ell(x, 40, 8, 8, STEEL); p.ell(x, 40, 5, 5, [0x9ff4ff, 0x5ce1ff, 0x1a8ab0]); }   // portholes
    p.ell(80, 40, 3, 2, 0xff9db8);                                                                           // a rat peering out
    p.rrect(0, 42, 18, 54, 3, STEEL); p.rrect(142, 42, 160, 54, 3, STEEL);                                  // side cannons
    p.ell(80, 88, 16, 8, [0xff9a9a, 0xe03030, 0x901818]); p.rect(74, 80, 86, 84, 0x5a6272);                // the big laser emitter
  });
  pixSprite(scene, 'grandpaladin', 120, 96, p => {              // L8: the Grand Paladin
    p.line([[8, 80], [2, 60], [10, 44]], 0xd9a5b3, 3);
    p.ell(56, 62, 36, 28, STEEL); p.rect(26, 60, 86, 62, 0x5a6272); for (const x of [40, 56, 72]) p.px(x, 52, 0xffffff);
    p.ell(80, 34, 22, 22, STEEL); p.rect(80, 30, 102, 34, 0x1a1020); p.rect(92, 31, 96, 33, 0xff4040);    // great helm
    p.poly([[70, 14], [80, 0], [92, 2], [84, 16]], [0xff6a6a, 0xe02a2a, 0x8a1010]);
    p.rrect(88, 44, 118, 90, 6, GOLD); p.ell(103, 66, 7, 7, [0xffe27a, 0xf0bc36, 0xb8801c]);                 // tower shield with a cheese crest
    p.line([[20, 40], [28, 6]], 0xdfe6f0, 4); p.rect(14, 38, 30, 42, 0xc8a040);                              // sword
    for (const x of [36, 66]) p.rect(x, 86, x + 8, 95, 0x5a6272);
  });
  pixSprite(scene, 'ratking', 150, 96, p => {                   // L9: the Grand Rat-King in his cheese-powered mech
    for (const x of [44, 96]) p.rrect(x, 70, x + 12, 95, 3, RUST);                                        // legs
    p.rrect(28, 34, 122, 76, 8, RUST); for (let x = 36; x < 120; x += 14) p.px(x, 40, 0xffd8a8);
    p.ell(75, 56, 14, 12, [0xfff6b0, 0xffd23f, 0xd09a10]); p.ell(75, 56, 6, 5, 0xffffff);                  // glowing cheese reactor
    p.rrect(0, 42, 30, 56, 4, STEEL); p.rrect(120, 42, 150, 56, 4, STEEL);                                  // arm cannons
    p.ell(75, 22, 26, 18, [0xeaf8ff, 0xcfeeff, 0x8ac0e0]);                                                    // cockpit dome
    p.ell(75, 26, 12, 10, [0xc0c8d4, 0x9aa3b2, 0x6a7280]); p.ell(66, 18, 4, 5, [0xffc8d8, 0xff9db8, 0xc06a88]); p.ell(84, 18, 4, 5, [0xffc8d8, 0xff9db8, 0xc06a88]);
    p.px(71, 25, 0xff2020); p.px(79, 25, 0xff2020);
    p.poly([[64, 10], [68, 2], [72, 8], [75, 0], [78, 8], [82, 2], [86, 10]], GOLD);                         // the crown
  });
}

// ---------------------------------------------------------------- timed power-ups
// Dropped (randomly) by medium and big enemies. `from` = the first level they can turn up on, so the early levels get the
// plain ones and the silly ones arrive later. t = seconds it lasts (0 = instant).
const BUFFS = {
  jalapeno: { name: 'JALAPENO BOOST!', tex: 'pu_jalapeno', t: 8, from: 6, col: 0x6aff4a },              // supercharged jet + a flame trail that stalls the wheel
  sauce:   { name: 'HOT SAUCE!',        tex: 'pu_sauce',  t: 10, from: 1, col: 0xff4a2a },
  boots:   { name: 'ROCKET BOOTS!',     tex: 'pu_boots',  t: 10, from: 1, col: 0x5ce1ff },
  magnet:  { name: 'MAGNET FORK!',      tex: 'pu_magnet', t: 12, from: 1, col: 0xff6a8a },
  shield:  { name: 'FONDUE SHIELD!',    tex: 'pu_shield', t: 14, from: 2, col: 0xffd23f },
  slowmo:  { name: 'SLOW-MO BRIE!',     tex: 'pu_slowmo', t: 6,  from: 3, col: 0xb8a8ff },
  giant:   { name: 'GOUDA GIGANTISM!',  tex: 'pu_giant',  t: 8,  from: 2, col: 0xff3a3a },
  moo:     { name: 'MOO BOMB!',         tex: 'pu_moo',    t: 0,  from: 4, col: 0xffffff },
  disguise:{ name: 'RAT DISGUISE!',     tex: 'pu_ears',   t: 10, from: 3, col: 0xff9db8 }
};
function makePowerupTextures(scene) {
  if (madeTex(scene, 'pu_sauce')) return;
  const STEEL = [0xdfe6f0, 0x9aa4b4, 0x5a6272];
  pixSprite(scene, 'pu_sauce', 18, 22, p => {                  // hot sauce bottle
    p.rrect(7, 1, 11, 6, 1, [0x8af06a, 0x3aa040, 0x1a6a20]); p.rect(8, 6, 10, 8, 0xe8e8f0);
    p.rrect(4, 8, 14, 21, 3, [0xff7a5a, 0xe0301a, 0x8a1010]); p.rect(5, 12, 13, 16, 0xfff6e0); p.px(8, 14, 0xe0301a); p.px(10, 14, 0xe0301a); p.px(9, 13, 0xff9a1a);
  });
  pixSprite(scene, 'pu_boots', 20, 20, p => {                  // rocket boot
    p.ell(7, 18, 3, 2, [0xfff6a0, 0xffa21a, 0xd04a10]);
    p.rrect(3, 2, 11, 14, 2, [0x9fd8ff, 0x4a7ae0, 0x24348a]); p.rrect(3, 11, 18, 16, 3, [0x9fd8ff, 0x4a7ae0, 0x24348a]); p.rect(4, 15, 17, 16, 0xe8e8f0);
    p.line([[5, 6], [9, 6]], 0xffffff);
  });
  pixSprite(scene, 'pu_magnet', 20, 20, p => {                 // horseshoe magnet
    p.ell(10, 9, 8, 8, [0xff8a8a, 0xe03030, 0x901818]); p.ell(10, 9, 4, 4, -1);
    p.rect(2, 9, 6, 18, 0xe03030); p.rect(14, 9, 18, 18, 0xe03030); p.rect(2, 15, 6, 18, STEEL[0]); p.rect(14, 15, 18, 18, STEEL[0]);
  });
  pixSprite(scene, 'pu_shield', 22, 20, p => {                 // fondue pot
    p.ell(11, 6, 9, 3, [0xfff0a0, 0xffc83a, 0xd8901a]); p.rrect(7, 4, 9, 10, 1, [0xfff0a0, 0xffc83a, 0xd8901a]);
    p.rrect(2, 6, 20, 17, 5, [0xd08a5a, 0x9a5a32, 0x5e3020]); p.line([[4, 12], [18, 12]], 0xc0804a);
    p.line([[5, 18], [4, 19]], 0x5a6272); p.line([[17, 18], [18, 19]], 0x5a6272);
  });
  pixSprite(scene, 'pu_slowmo', 22, 18, p => {                 // a wedge of brie with a clock on it
    p.poly([[1, 16], [21, 16], [21, 6]], [0xffffff, 0xf2eedc, 0xc8c0a0]); p.poly([[1, 16], [21, 6], [21, 3], [1, 13]], [0xe8dcb0, 0xd8c890, 0xa89860]);
    p.ell(14, 12, 4, 4, [0xd8ecff, 0x9ab8e0, 0x4a6aa0]); p.line([[14, 12], [14, 9]], 0x1a1020); p.line([[14, 12], [16, 12]], 0x1a1020);
  });
  pixSprite(scene, 'pu_giant', 20, 20, p => {                  // a red-waxed gouda with an up arrow
    p.ell(10, 12, 9, 7, [0xff7a6a, 0xd0301a, 0x8a1a10]); p.ell(10, 11, 6, 4, [0xfff0a0, 0xffd23f, 0xd09a10]);
    p.poly([[10, 0], [15, 5], [12, 5], [12, 9], [8, 9], [8, 5], [5, 5]], [0xffffff, 0xe8e8f0, 0xa8a8b8]);
  });
  pixSprite(scene, 'pu_moo', 20, 20, p => {                    // golden cowbell
    p.rect(9, 0, 11, 3, STEEL[1]);
    p.poly([[5, 4], [15, 4], [18, 16], [2, 16]], [0xfff0a0, 0xffc83a, 0xb07a1a]); p.rect(2, 15, 18, 17, 0xb07a1a);
    p.ell(10, 18, 2, 1.5, STEEL);
  });
  pixSprite(scene, 'oneup', 22, 26, p => {                     // 1UP: a little Chris head (toque, helmet, red nose, moustache)
    const W3 = [0xffffff, 0xeef2f8, 0xbcc6d6];
    p.ell(6, 6, 4.5, 4.5, W3); p.ell(16, 6, 4.5, 4.5, W3); p.ell(11, 4, 5.5, 4.5, W3); p.rect(5, 8, 17, 11, W3[1]);
    p.ell(11, 17, 9, 8.5, [0xe8f8ff, 0xb8e0ff, 0x7ab0e0]); p.ell(11, 18, 6.5, 6.5, [0xffd9c4, 0xf2b593, 0xc9805e]);
    p.px(8, 16, 0x1a1020); p.px(14, 16, 0x1a1020); p.ell(11, 19, 1.8, 1.5, [0xff9a9a, 0xe03a3a, 0xa01818]);
    p.line([[6, 22], [9, 21], [11, 21.5], [13, 21], [16, 22]], 0x5a3216, 2);
    p.px(5, 13, 0xffffff); p.px(6, 12, 0xffffff);
  });
  pixSprite(scene, 'goldwheel', 22, 22, p => {                // a golden cheese wheel, face-on, with a shine
    p.ell(11, 11, 10, 10, [0xfff6b0, 0xffd23f, 0xb07a1a]); p.ell(11, 11, 7, 7, [0xfff0a0, 0xffc83a, 0xd8901a]);
    p.ell(8, 9, 1.5, 1.5, [0xd8901a, 0xb07a1a, 0x8a5a10]); p.ell(14, 13, 2, 2, [0xd8901a, 0xb07a1a, 0x8a5a10]); p.ell(10, 15, 1, 1, [0xd8901a, 0xb07a1a, 0x8a5a10]);
    p.line([[5, 7], [7, 5]], 0xffffff); p.px(15, 6, 0xffffff);
  });
  pixSprite(scene, 'pu_ears', 22, 14, p => {                   // novelty rat ears on a headband
    p.ell(5, 6, 4.5, 5, [0xc0c8d4, 0x9aa3b2, 0x6a7280]); p.ell(17, 6, 4.5, 5, [0xc0c8d4, 0x9aa3b2, 0x6a7280]);
    p.ell(5, 6, 2.5, 3, [0xffc8d8, 0xff9db8, 0xc06a88]); p.ell(17, 6, 2.5, 3, [0xffc8d8, 0xff9db8, 0xc06a88]);
    p.line([[2, 12], [6, 10], [16, 10], [20, 12]], 0x1a1020, 2);
  });
}

// ---------------------------------------------------------------- platform types (all 124px wide, scaled to each ledge)
// top = the pixel row you stand on. Extras (siren, glow, drips, sparkles) are added at runtime in main.js.
const PLATFORMS = {
  energy:   { key: 'pl_energy0', frames: 3, top: 7 },
  girder:   { key: 'pl_girder', top: 4 },
  panini:   { key: 'pl_panini', top: 3 },
  crystal:  { key: 'pl_crystal', top: 14 },
  carnival: { key: 'pl_carnival', top: 4 },
  bone:     { key: 'pl_bone', top: 5 }
};
function makePlatformTextures(scene) {
  if (madeTex(scene, 'pl_girder')) return;
  const W = 124, STEEL = [0xdfe6f0, 0x9aa4b4, 0x5a6272], DARK = [0x5a6272, 0x3a3e4c, 0x24262e];
  // electric bar: metal end caps with cyan lamps, a glowing energy tube, lightning crackling along it (3 frames)
  for (let f = 0; f < 3; f++) pixSprite(scene, 'pl_energy' + f, W, 26, p => {
    const r = rng(77 + f * 13);
    p.rrect(12, 7, 111, 18, 4, [0xc8fbff, 0x5ce1ff, 0x1a8ab0]);
    p.rect(14, 9, 109, 10, 0xffffff);
    for (let k = 0; k < 2; k++) {                                    // a lightning bolt running the length of the tube
      let y = 12 + (r() * 4 - 2) | 0; const pts = [];
      for (let x = 12; x <= 112; x += 6 + (r() * 6 | 0)) { pts.push([x, y]); y = Math.max(8, Math.min(17, y + (r() * 8 - 4 | 0))); }
      p.line(pts, k ? 0xe8ffff : 0xffffff);
    }
    for (let k = 0; k < 5; k++) { const x = 16 + r() * 92 | 0, up = r() < 0.5; p.line([[x, up ? 7 : 18], [x + (r() * 6 - 3 | 0), up ? 2 + (r() * 3 | 0) : 22 + (r() * 3 | 0)]], 0x9ff4ff); }   // stray arcs
    for (const x0 of [0, 110]) {
      p.rrect(x0, 3, x0 + 13, 22, 4, STEEL); p.rect(x0 + 2, 11, x0 + 11, 13, 0x5a6272);
      p.ell(x0 + 6.5, 12, 3.5, 3.5, [0xffffff, 0x9ff4ff, 0x2aa8d0]);
    }
  });
  // steel girder: riveted beam, hazard stripes, cables and a chain hanging underneath (siren added at runtime)
  pixSprite(scene, 'pl_girder', W, 52, p => {
    for (const [x0, x1, sag, c] of [[18, 46, 22, 0x3a3e4c], [30, 70, 30, 0x24262e], [52, 86, 18, 0x4a2f1a], [74, 100, 26, 0x3a3e4c]]) {   // drooping cables
      const pts = []; for (let k = 0; k <= 10; k++) { const t = k / 10; pts.push([x0 + (x1 - x0) * t, 17 + Math.sin(t * Math.PI) * sag]); }
      p.line(pts, c, 2);
    }
    p.line([[60, 17], [62, 40], [60, 46]], 0x24262e, 2); p.rect(59, 45, 62, 48, 0xffa21a);       // a cable end dangling
    for (let y = 18; y < 46; y += 4) { p.rect(104, y, 106, y + 2, 0x7a8290); p.px(105, y + 3, 0x5a6272); }   // chain
    p.rrect(1, 3, 122, 17, 2, STEEL);
    p.rect(22, 6, 101, 13, 0x1a1020);
    for (let x = 22; x < 102; x += 8) for (let y = 6; y <= 13; y++) for (let k = 0; k < 4; k++) { const xx = x + k + (y - 6); if (xx < 102) p.px(xx, y, 0xffd23f); }   // diagonal hazard stripes
    for (const x of [6, 14, 108, 116]) for (const y of [6, 13]) { p.px(x, y, 0xffffff); p.px(x + 1, y + 1, 0x3a3e4c); }   // rivets
    p.line([[2, 16], [121, 16]], 0x3a3e4c);
  });
  pixSprite(scene, 'pl_siren', 12, 10, p => { p.rect(1, 7, 10, 9, 0x5a6272); p.ell(5.5, 5, 4, 4, [0xff8a8a, 0xe03030, 0x901818]); p.px(4, 3, 0xffffff); });
  // toasted panini: grill-marked bread, oozing cheese, drips hanging off the bottom
  pixSprite(scene, 'pl_panini', W, 34, p => {
    const CH = [0xfff0a0, 0xffc83a, 0xd8901a];
    for (const [x, len] of [[14, 10], [26, 16], [40, 8], [57, 19], [71, 11], [88, 15], [104, 9]]) { p.rrect(x - 2, 14, x + 2, 14 + len, 2, CH); p.ell(x, 15 + len, 2.5, 2.5, CH); }
    p.rrect(3, 11, 120, 17, 3, CH);                                                    // the melted layer
    p.rrect(1, 2, 122, 13, 6, [0xffd890, 0xe0a050, 0xa86a2a]);                         // the bread
    for (let x = 10; x < 118; x += 9) p.line([[x, 3], [x + 6, 12]], 0x8a4a1a, 2);      // grill marks
    p.line([[8, 4], [114, 4]], 0xfff0c0);
  });
  // floating crystal rock: craggy dark stone, glowing purple/cyan crystals, roots trailing underneath
  pixSprite(scene, 'pl_crystal', W, 58, p => {
    const ROCK = [0x5a5470, 0x3a344e, 0x221e30];
    for (const [x, y, len] of [[30, 40, 14], [48, 44, 12], [72, 43, 13], [92, 38, 15]]) p.line([[x, y], [x - 3, y + len * 0.5], [x + 2, y + len]], 0x6a4a2a);   // roots
    p.poly([[2, 16], [12, 13], [40, 14], [70, 13], [100, 14], [121, 16], [118, 26], [104, 36], [84, 44], [60, 48], [38, 44], [18, 36], [6, 26]], ROCK);
    for (const [x, y] of [[20, 24], [44, 30], [66, 22], [80, 34], [98, 26], [56, 40]]) { p.px(x, y, 0x5ce1ff); p.px(x + 1, y, 0x2aa8d0); p.px(x, y + 1, 0x2aa8d0); }
    for (const [x, y] of [[32, 20], [88, 20], [70, 40]]) { p.px(x, y, 0xd080ff); p.px(x + 1, y + 1, 0x8a3ad0); }
    const xtal = (x, h, w, cols) => p.poly([[x - w, 15], [x - w, 15 - h * 0.7], [x, 15 - h], [x + w, 15 - h * 0.7], [x + w, 15]], cols);
    const PUR = [0xf0c0ff, 0xb060f0, 0x6a2aa8], CY = [0xd0ffff, 0x5ce1ff, 0x1a8ab0];
    xtal(6, 13, 3, PUR); xtal(12, 9, 2, CY); xtal(3, 7, 2, CY);                       // clusters on the ends (the middle is the walkway)
    xtal(116, 12, 3, CY); xtal(110, 8, 2, PUR); xtal(121, 6, 2, PUR);
  });
  // carnival beam: gold riveted bar with scroll ends, purple star bunting and stars on strings
  pixSprite(scene, 'pl_carnival', W, 50, p => {
    const GOLD = [0xfff0a0, 0xffc83a, 0xb07a1a], PUR = [0x9a6aff, 0x5a3ad0, 0x2a1a8a];
    for (const x of [16, 108]) { p.line([[x, 14], [x, 40]], 0xc8a040); p.poly([[x, 39], [x + 3, 43], [x + 1, 46], [x - 1, 46], [x - 3, 43]], GOLD); }   // hanging stars
    for (const [x0, x1] of [[20, 62], [62, 104]]) {                                    // two swags of pennants
      const n = 5;
      for (let k = 0; k < n; k++) { const t = (k + 0.5) / n, x = x0 + (x1 - x0) * t, y = 14 + Math.sin(t * Math.PI) * 6;
        p.poly([[x - 4, y], [x + 4, y], [x + 4, y + 9], [x, y + 13], [x - 4, y + 9]], PUR); p.px(x, y + 5, 0xffd23f); p.px(x - 1, y + 5, 0xffe27a); p.px(x + 1, y + 5, 0xffe27a); p.px(x, y + 4, 0xffe27a); p.px(x, y + 6, 0xffe27a); }
      const pts = []; for (let k = 0; k <= 8; k++) { const t = k / 8; pts.push([x0 + (x1 - x0) * t, 14 + Math.sin(t * Math.PI) * 6]); }
      p.line(pts, 0xffd23f);
    }
    p.rrect(4, 3, 119, 14, 3, GOLD);
    p.line([[6, 5], [117, 5]], 0xfffbe0);
    for (let x = 14; x < 112; x += 12) { p.ell(x, 9, 1.6, 1.6, [0xffffff, 0xc8a040, 0x7a5a1a]); }
    for (const x0 of [0, 113]) p.ell(x0 + 5, 8.5, 5, 6, GOLD);                          // scroll ends
  });
}

// L6 "Cheddar Gorge": the chase. The Pepper Jack's spinning rind + its (upright) angry face / exposed core, mini wheels,
// tortilla-chip stalagmites, bottomless pits and speed-bump craters, the Jalapeño Boost, ruined spires on the skyline
function makeGorgeTextures(scene) {
  if (madeTex(scene, 'jack_rind')) return;
  const RIND = [0xffc860, 0xf09a2a, 0xa85a10], PASTE = [0xfff0a0, 0xffd060, 0xd89a2a];
  pixSprite(scene, 'jack_rind', 120, 120, p => {                    // the wheel itself (it spins); the face is a separate upright overlay
    p.ell(60, 60, 58, 58, RIND); p.ell(60, 60, 50, 50, PASTE);
    const r = rng(61);
    for (let k = 0; k < 22; k++) { const a = r() * 6.28, d = Math.sqrt(r()) * 44, x = 60 + Math.cos(a) * d, y = 60 + Math.sin(a) * d, rr = 2 + r() * 4; p.ell(x, y, rr, rr * 0.85, 0xc87a1a); p.px(x - 1, y - 1, 0x8a4a0a); }   // holes
    for (let k = 0; k < 40; k++) { const a = r() * 6.28, d = r() * 46; p.px(60 + Math.cos(a) * d, 60 + Math.sin(a) * d, k % 3 ? 0xd02a1a : 0x2a8a2a); }   // pepper flecks
    for (let k = 0; k < 16; k++) { const a = k / 16 * 6.28; p.line([[60 + Math.cos(a) * 51, 60 + Math.sin(a) * 51], [60 + Math.cos(a) * 57, 60 + Math.sin(a) * 57]], 0xa85a10); }   // rind ridges (show the spin)
  });
  pixSprite(scene, 'jack_face', 70, 46, p => {                      // furious face: knitted brows, glaring eyes, gritted teeth
    p.line([[4, 6], [30, 16]], 0x1a0a04, 4); p.line([[66, 6], [40, 16]], 0x1a0a04, 4);
    p.ell(20, 18, 9, 7, 0xffffff); p.ell(50, 18, 9, 7, 0xffffff); p.ell(23, 19, 3.5, 4, 0x1a0a04); p.ell(47, 19, 3.5, 4, 0x1a0a04); p.px(22, 17, 0xffffff); p.px(46, 17, 0xffffff);
    p.rrect(12, 30, 58, 44, 5, 0x5a0a0a); for (let x = 15; x < 56; x += 6) p.rect(x, 31, x + 4, 43, 0xffffff); p.line([[14, 37], [56, 37]], 0x9a8a7a);   // clenched teeth
  });
  pixSprite(scene, 'jack_core', 70, 60, p => {                      // rind torn open: gooey molten core with ONE big glowing eye
    p.ell(35, 30, 33, 28, [0xffd890, 0xff9a3a, 0xc84a10]);
    for (const [x, y] of [[8, 20], [60, 26], [16, 48], [54, 50], [30, 56]]) p.poly([[x - 4, y], [x + 4, y], [x, y + 8]], [0xffd890, 0xff9a3a, 0xc84a10]);   // drips
    p.ell(35, 28, 15, 15, 0xffffff); p.ell(35, 28, 9, 9, [0xff8a8a, 0xe02020, 0x800808]); p.ell(35, 28, 4, 5, 0x1a0204); p.px(31, 23, 0xffffff); p.px(32, 23, 0xffffff);   // the eye: the target
    for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; p.px(35 + Math.cos(a) * 13, 28 + Math.sin(a) * 13, 0xe02020); }       // bloodshot rim
  });
  pixSprite(scene, 'miniwheel', 30, 30, p => {                      // little angry cheese wheel
    p.ell(15, 15, 14, 14, RIND); p.ell(15, 15, 11, 11, PASTE);
    p.ell(10, 13, 3, 2.5, 0xffffff); p.ell(20, 13, 3, 2.5, 0xffffff); p.px(11, 13, 0x1a0a04); p.px(19, 13, 0x1a0a04);
    p.line([[6, 9], [12, 11]], 0x1a0a04, 2); p.line([[24, 9], [18, 11]], 0x1a0a04, 2); p.rect(10, 18, 20, 21, 0x5a0a0a); p.rect(11, 19, 19, 19, 0xffffff);
  });
  pixSprite(scene, 'nacho', 34, 50, p => {                          // a razor-sharp giant tortilla chip jutting out of the crust
    p.poly([[17, 0], [33, 49], [1, 49]], [0xffe08a, 0xf0b040, 0xb07818]);
    p.poly([[17, 0], [21, 49], [14, 49]], [0xfff0b0, 0xffd060, 0xd09a30]);
    for (const [x, y] of [[12, 30], [22, 36], [16, 42], [20, 20], [9, 44], [26, 44]]) { p.px(x, y, 0xa86a10); p.px(x + 1, y, 0xd8a040); }   // toasted flecks
    for (const [x, y] of [[8, 34], [25, 28]]) p.px(x, y, 0xd02a1a);
  });
  for (const [k, deep] of [['crater_pit', true], ['crater_bump', false]]) pixTex(scene, k, 64, 26, put => {   // flush with the ground: a crust lip, then either a black void or a shallow bowl
    for (let y = 0; y < 26; y++) for (let x = 0; x < 64; x++) {
      const inset = y < 4 ? 0 : (y - 4) * (deep ? 0.25 : 0.9), ex = Math.min(x, 63 - x) - inset;
      if (ex < 0 || y < 2) continue;
      let c;
      if (y <= 3) c = ex < 4 ? 0xffc860 : 0xa85a10;                  // the raised crust lip
      else if (deep) c = y < 8 ? (ex < 3 ? 0x6a2a0a : 0x2a0a04) : 0x0a0204;   // falls away into darkness
      else { if (y > 12) continue; c = ex < 3 ? 0xc87a1a : ((x + y) % 5 === 0 ? 0xd8902a : 0xe8a03a); }
      put(x, y, c);
    }
  });
  pixSprite(scene, 'pu_jalapeno', 20, 22, p => {                    // a green chilli with a flame
    p.poly([[5, 4], [9, 2], [14, 8], [15, 16], [11, 21], [8, 15]], [0x8af06a, 0x3aa040, 0x1a6a20]); p.rect(6, 1, 9, 3, 0x6a4a20);
    p.poly([[14, 12], [19, 8], [18, 16]], [0xfff6a0, 0xffa21a, 0xd04a10]); p.px(9, 6, 0xffffff);
  });
  pixSprite(scene, 'bg_spires', 120, 80, p => {                     // a ruined cheese-rock citadel on the horizon
    const R2 = [0x6a3a3a, 0x4a2428, 0x2a1418];
    for (const [x, w, h] of [[6, 14, 50], [22, 10, 70], [36, 18, 40], [56, 12, 78], [72, 16, 55], [92, 10, 66], [104, 14, 38]]) {
      p.poly([[x, 79], [x, 79 - h + 8], [x + w / 2, 79 - h], [x + w, 79 - h + 8], [x + w, 79]], R2);
      for (let y = 79 - h + 14; y < 76; y += 12) p.rect(x + w / 2 - 1, y, x + w / 2 + 1, y + 3, 0xffb050);   // lit windows
    }
  });
}

// L5 "The Brie-muda Triangle": powdery rind, a graveyard of lost ships and cows, purple haze and glowing triangles
function makeBrieTextures(scene) {
  if (madeTex(scene, 'ghostpirate')) return;
  const BONE = [0xfffbf0, 0xe0d8c4, 0x9a907a], GH = [0xc8ffd8, 0x5ae890, 0x1e8a4a];
  pixSprite(scene, 'pl_bone', 124, 24, p => {                       // a giant femur from some ancient space-cow, as a platform
    p.rrect(14, 6, 110, 16, 4, BONE);
    for (const x of [8, 116]) { p.ell(x, 6, 8, 6, BONE); p.ell(x, 16, 8, 6, BONE); }   // knobbly ends
    p.line([[18, 7], [106, 7]], 0xffffff); p.line([[30, 14], [90, 14]], 0xc8bca0);
    for (const [x, y] of [[40, 10], [64, 12], [86, 9]]) p.px(x, y, 0xb8ae96);       // pits
  });
  pixSprite(scene, 'ghostpirate', 44, 44, p => {                    // the ghost of a crashed space-rat pirate: tricorn, tattered coat, cutlass
    p.poly([[10, 20], [30, 18], [36, 34], [32, 42], [27, 37], [22, 43], [17, 37], [12, 42], [8, 34]], GH);   // tattered ghostly coat
    p.ell(24, 16, 10, 9, GH); p.poly([[30, 13], [40, 17], [38, 20], [30, 21]], GH);                          // head + snout
    p.ell(16, 8, 3.5, 4, GH); p.ell(16, 8, 1.6, 2, 0xa0ffc0);                                               // ear
    p.ell(26, 14, 3, 3, 0xffffff); p.ell(33, 14, 2.4, 2.6, 0xffffff); p.px(27, 14, 0x0a3a1a); p.px(33, 14, 0x0a3a1a);   // glowing eyes
    p.poly([[11, 6], [24, 1], [37, 6], [33, 9], [24, 7], [15, 9]], [0x3a3a48, 0x24242e, 0x101016]);           // tricorn hat
    p.px(24, 4, 0xffffff); p.px(23, 5, 0xffffff); p.px(25, 5, 0xffffff);                                    // skull badge
    p.line([[30, 26], [42, 20]], 0xd8e4ec, 2); p.rect(29, 25, 31, 28, 0xffd23f);                            // cutlass
    p.line([[14, 28], [10, 24]], GH[2], 2);
  });
  pixSprite(scene, 'polterwedge', 34, 28, p => {                    // a poltergeist wedge of cheese: hollow eyes, wispy tail
    p.poly([[2, 22], [30, 22], [30, 6]], [0xfff4b0, 0xffd23f, 0xc09a20]); p.poly([[2, 22], [30, 6], [30, 3], [2, 18]], [0xffe890, 0xe0b830, 0xa07a10]);
    for (const [x, y, r] of [[22, 16, 2.2], [14, 19, 1.6], [26, 10, 1.4]]) p.ell(x, y, r, r, 0xa07a10);
    p.ell(17, 14, 2, 2.6, 0x1a0a2a); p.ell(24, 13, 1.8, 2.4, 0x1a0a2a);                                      // hollow eyes
    p.poly([[2, 22], [8, 24], [4, 27], [10, 27]], [0xfff8d0, 0xffe890, 0xd0b050]);                           // wisp
  });
  pixSprite(scene, 'tribolt', 14, 14, p => { p.poly([[7, 1], [13, 12], [1, 12]], [0xe0ffe8, 0x5ae890, 0x1e8a4a]); p.poly([[7, 5], [10, 10], [4, 10]], 0xffffff); });
  for (const [k, c] of [['tri_p', 0xd070ff], ['tri_c', 0x5ce1ff], ['tri_k', 0xff7ad8]]) pixTex(scene, k, 40, 36, put => {   // glowing triangle anomalies (outlines)
    const A = [20, 2], B = [38, 34], C = [2, 34];
    const edge = (P0, P1) => { for (let t = 0; t <= 1; t += 0.01) { const x = Math.round(P0[0] + (P1[0] - P0[0]) * t), y = Math.round(P0[1] + (P1[1] - P0[1]) * t); put(x, y, 0xffffff); put(x + 1, y, c); put(x, y + 1, c); } };
    edge(A, B); edge(B, C); edge(C, A);
  });
  for (let i = 0; i < 2; i++) pixTex(scene, 'fogbank' + i, 160, 48, (put, w, h) => {   // a bank of pixel fog (alpha set in game)
    const r = rng(800 + i * 17), n1 = vnoise(r, 6), n2 = vnoise(r, 14);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const u = x / w - 0.5, v = y / h - 0.5, den = n1(x / w, y / h) * 0.7 + n2(x / w, y / h) * 0.4 - Math.hypot(u * 1.1, v * 2.2) * 1.6 + 0.3;
      if (den < 0.12 + bay(x, y) * 0.2) continue;
      put(x, y, den > 0.4 ? 0xf0e8ff : 0xc8b8f0, 255);
    }
  });
}

// L4 "Mount Mozzarella": the cosmic pizza oven. Magma-golems, rocket rats, pepperoni bombs, molten string-cheese pits, greasy smoke
function makeOvenTextures(scene) {
  if (madeTex(scene, 'mgolem')) return;
  const MOZ = [0xffffff, 0xf4ead6, 0xc8b496], CHAR = [0xb0703a, 0x7a4220, 0x3a1c0c], HOT = [0xfff4a0, 0xffa030, 0xd04a10], CRUST = [0xe0a060, 0xa86a34, 0x6a3a18];
  const golem = (key, armoured) => pixSprite(scene, key, 64, 68, p => {
    p.rrect(10, 46, 26, 67, 4, armoured ? CHAR : MOZ); p.rrect(38, 46, 54, 67, 4, armoured ? CHAR : MOZ);           // legs
    p.ell(32, 36, 24, 22, MOZ);                                                                                     // melting cheese body
    for (const [x, y] of [[12, 44], [20, 52], [44, 50], [52, 42]]) p.poly([[x - 3, y], [x + 3, y], [x, y + 9]], MOZ); // drips
    p.ell(10, 34, 8, 11, MOZ); p.ell(54, 34, 8, 11, MOZ); p.ell(8, 46, 7, 6, MOZ); p.ell(56, 46, 7, 6, MOZ);       // big arms + fists
    if (armoured) {                                                                                                  // charred crust armour plates
      for (const [x, y, w, h] of [[16, 18, 14, 10], [34, 16, 14, 12], [22, 34, 12, 9], [40, 34, 10, 10], [4, 30, 10, 9], [50, 30, 10, 9], [11, 52, 14, 10], [39, 52, 14, 10]]) {
        p.poly([[x - 2, y + 2], [x + 3, y - 2], [x + w + 2, y], [x + w + 1, y + h + 1], [x, y + h + 1]], CHAR); p.px(x + 3, y + 2, 0x2a1408); p.px(x + w - 2, y + h - 2, 0x2a1408); p.px(x + 5, y + 4, 0xe0a060);
      }
      for (const [x, y] of [[30, 24], [20, 42], [46, 44], [8, 40]]) { p.px(x, y, 0xffa030); p.px(x + 1, y, 0xff6a1a); }   // glowing cracks
    } else {
      for (const [x, y, w] of [[16, 22, 10], [36, 20, 10], [24, 38, 12], [42, 40, 8]]) p.ell(x + w / 2, y, w / 2, 3, HOT);   // molten veins
      p.ell(14, 52, 5, 3, HOT); p.ell(48, 54, 5, 3, HOT);
    }
    p.ell(24, 26, 5, 4, 0xffffff); p.ell(40, 26, 5, 4, 0xffffff); p.rect(25, 26, 27, 28, 0x1a1020); p.rect(39, 26, 41, 28, 0x1a1020);   // furious eyes
    p.line([[18, 20], [29, 24]], 0x1a1020, 2); p.line([[46, 20], [35, 24]], 0x1a1020, 2);
    p.poly([[24, 34], [40, 34], [37, 42], [27, 42]], 0x5a0a14); p.rect(26, 34, 38, 35, 0xffffff); p.ell(32, 40, 4, 2, [0xff8aa0, 0xe0405a, 0x90203a]);   // roaring mouth
    for (const [x, y, r] of [[18, 10, 3], [28, 6, 4], [40, 8, 3.5], [48, 14, 2.5], [33, 2, 2]]) p.ell(x, y, r, r, MOZ);  // bubbling top
  });
  golem('mgolem', true); golem('mgolem_hot', false);
  pixSprite(scene, 'rocketrat', 44, 40, p => {                     // rat on a rocket pack: blast goggles, oven mitts
    const FUR = [0x9a9aa8, 0x6a6a78, 0x3a3a48];
    p.poly([[4, 22], [12, 18], [12, 28]], HOT);                                                     // thrust flame
    p.rrect(10, 14, 20, 30, 3, [0xe0e4ea, 0x9aa4b4, 0x5a6272]); p.rect(11, 18, 19, 20, 0xe03030);  // rocket pack
    p.line([[14, 32], [8, 37], [4, 34]], 0xe9a8b8, 2);                                              // tail
    p.ell(24, 25, 9, 9, FUR); p.rect(18, 24, 30, 26, 0x6a4a2a);                                     // body + harness
    p.ell(31, 13, 8, 7, FUR); p.poly([[35, 10], [43, 14], [41, 17], [35, 17]], FUR); p.ell(42, 14, 1.4, 1.4, [0xffb0c0, 0xe0607a, 0x9a3048]);
    p.ell(26, 6, 3.5, 4, FUR); p.ell(26, 6, 1.6, 2.2, 0xe9a8b8);                                    // ear
    p.rect(24, 10, 40, 12, 0x2a2a2a); p.ell(32, 11, 4, 4, [0xffd88a, 0xff9a3a, 0xa04a10]); p.ell(38, 11, 3, 3.5, [0xffd88a, 0xff9a3a, 0xa04a10]); p.px(31, 9, 0xffffff);   // amber blast goggles
    p.ell(34, 30, 5, 4, [0xff8a8a, 0xe03030, 0x901818]); p.rect(31, 33, 37, 35, 0xffffff);         // big oven mitt (holding the bomb)
    p.ell(18, 33, 4, 3.5, [0xff8a8a, 0xe03030, 0x901818]);
  });
  pixSprite(scene, 'pepbomb', 16, 18, p => {                       // a sizzling pepperoni bomb with a fuse
    p.ell(8, 11, 7, 6.5, [0xff7a5a, 0xc8301a, 0x7a1010]); for (const [x, y] of [[5, 9], [10, 8], [8, 13], [11, 12]]) p.px(x, y, 0x5a0808);
    p.line([[9, 4], [11, 1]], 0x8a7a5a); p.px(12, 0, 0xffe27a); p.px(11, 0, 0xff8a2a);
  });
  pixTex(scene, 'cheesepit', 64, 26, put => {                      // a crater of boiling mozzarella: charred crust lip, bubbling white pool, sinking into the cheese
    for (let y = 0; y < 26; y++) for (let x = 0; x < 64; x++) {
      const ex = Math.min(x, 63 - x), wave = y === 3 && ((x >> 2) % 2) === 0 ? 1 : 0;
      if (y < 2 || (y < 4 && ex < 4 - y) ) continue;
      let c;
      if (y === 2 || (y < 5 && ex < 2)) c = 0x5a2c10;                // charred crust lip
      else if (y <= 3 + wave) c = 0xffffff;                          // glossy molten surface
      else if (y < 9) c = ((x * 3 + y) % 7 === 0) ? 0xffd890 : (ex < 4 ? 0xffa040 : 0xfff6e6);   // bubbling, hot at the edges
      else c = ((x + y) % 2 === 0) ? 0xf6ead2 : 0xe8d4b0;            // below: dithered into the planet's own cheese
      if (y >= 9 && (y - 9) / 17 > 0.5 + 0.5 * Math.sin(x * 0.4)) continue;   // ragged fade into the surface
      put(x, y, c);
    }
    for (const [bx, by] of [[12, 6], [36, 5], [26, 7], [50, 6]]) { put(bx, by, 0xffffff); put(bx + 1, by, 0xe8d4b0); }
  });
  pixSprite(scene, 'cheesebub', 8, 8, p => { p.ell(4, 4, 3, 3, [0xffffff, 0xf4ead6, 0xc8b496]); p.px(3, 2, 0xffffff); });
  for (let i = 0; i < 3; i++) pixTex(scene, 'smokecloud' + i, 110, 60, (put, w, h) => {   // a big greasy smoke cloud, dithered
    const r = rng(700 + i * 31), n1 = vnoise(r, 5), n2 = vnoise(r, 11);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const u = x / w - 0.5, v = y / h - 0.5, d = Math.hypot(u * 1.1, v * 1.8);
      const den = n1(x / w, y / h) * 0.8 + n2(x / w, y / h) * 0.4 - d * 1.7 + 0.25, t = bay(x, y);
      if (den < 0.1 + t * 0.15) continue;
      put(x, y, den > 0.45 ? 0x0e0806 : (den > 0.3 ? 0x1e1210 : 0x2e1c18), 255);
    }
  });
}

// L3 "Planet Grat'o-Cheese": the cheese factory. Rusty cogs, scaffolds, the cheese claw, crates, barrels, beacons, goggle-rats
function makeFactoryTextures(scene) {
  if (madeTex(scene, 'cog_big')) return;
  const RUST = [0xd08a50, 0x9a5a2a, 0x5e3218], IRON = [0x9aa4b4, 0x5e6878, 0x323a48], STEEL = [0xe8eef8, 0xa8b2c2, 0x5a6272];
  const cog = (key, R, teeth, cols, spokes) => pixSprite(scene, key, R * 2 + 4, R * 2 + 4, p => {
    const cx = R + 2, cy = R + 2;
    for (let k = 0; k < teeth; k++) { const a = k / teeth * Math.PI * 2, w = Math.PI / teeth * 0.55, ri = R * 0.82;
      p.poly([[cx + Math.cos(a - w) * ri, cy + Math.sin(a - w) * ri], [cx + Math.cos(a - w * 0.7) * R, cy + Math.sin(a - w * 0.7) * R], [cx + Math.cos(a + w * 0.7) * R, cy + Math.sin(a + w * 0.7) * R], [cx + Math.cos(a + w) * ri, cy + Math.sin(a + w) * ri]], cols); }
    p.ell(cx, cy, R * 0.84, R * 0.84, cols);
    p.ell(cx, cy, R * 0.66, R * 0.66, -1);                             // open wheel...
    for (let k = 0; k < spokes; k++) { const a = k / spokes * Math.PI * 2 + 0.3; p.line([[cx + Math.cos(a) * R * 0.2, cy + Math.sin(a) * R * 0.2], [cx + Math.cos(a) * R * 0.68, cy + Math.sin(a) * R * 0.68]], cols[1], Math.max(3, Math.round(R * 0.13))); }   // ...with spokes
    p.ell(cx, cy, R * 0.24, R * 0.24, cols); p.ell(cx, cy, R * 0.09, R * 0.09, 0x1a1020);   // hub
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; p.ell(cx + Math.cos(a) * R * 0.75, cy + Math.sin(a) * R * 0.75, 1.3, 1.3, STEEL); }   // bolts
    for (let k = 0; k < Math.round(R / 3); k++) { const a = k * 2.4, d = R * (0.68 + (k % 3) * 0.05); p.px(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 0x6a3a1a); }   // rust spots
  });
  cog('cog_big', 46, 18, RUST, 6); cog('cog_mid', 30, 13, IRON, 5); cog('cog_small', 18, 10, RUST, 4);
  // the claw: a hydraulic arm coming down from the dark, three prongs gripping a great block of cheese
  pixSprite(scene, 'claw', 84, 132, p => {
    p.rrect(36, 0, 48, 50, 2, IRON); p.rect(38, 0, 40, 50, 0xc8d0dc);                   // the arm
    p.rrect(32, 22, 52, 30, 2, [0xffd23f, 0xd0a020, 0x8a6a10]); for (let x = 34; x < 50; x += 6) p.poly([[x, 22], [x + 3, 22], [x, 30]], 0x1a1020);   // hazard collar
    p.rrect(24, 48, 60, 62, 4, STEEL); p.ell(42, 55, 4, 4, IRON);    // knuckle housing
    p.poly([[26, 58], [8, 74], [6, 100], [14, 104], [16, 80], [30, 66]], RUST);   // left prong
    p.poly([[58, 58], [76, 74], [78, 100], [70, 104], [68, 80], [54, 66]], RUST); // right prong
    p.poly([[38, 60], [46, 60], [46, 82], [42, 88], [38, 82]], RUST);             // middle prong
    // the cheese block it's holding (swiss, holey)
    p.poly([[10, 84], [62, 76], [80, 92], [80, 124], [26, 132], [8, 116]], [0xfff09a, 0xffcf3a, 0xc9901a]);
    p.poly([[10, 84], [62, 76], [80, 92], [28, 98]], [0xfff6c0, 0xffe27a, 0xd8a83a]);   // top face
    for (const [x, y, rr] of [[22, 108, 4], [40, 116, 5], [62, 104, 4], [70, 118, 3], [32, 92, 2.5], [54, 88, 3]]) { p.ell(x, y, rr, rr * 0.8, 0xa8701a); p.px(x + 1, y + 1, 0xffe27a); }
    p.poly([[6, 100], [14, 104], [12, 112], [4, 108]], RUST); p.poly([[78, 100], [70, 104], [72, 112], [80, 108]], RUST);   // prong tips biting in
  });
  pixSprite(scene, 'scaffold', 60, 120, p => {                     // a steel scaffold tower with a walkway, crates and a warning light
    for (const x of [6, 52]) p.rect(x, 10, x + 3, 119, IRON[1]);
    for (let y = 18; y < 116; y += 22) { p.line([[8, y], [53, y + 20]], IRON[2], 2); p.line([[53, y], [8, y + 20]], IRON[2], 2); p.rect(6, y, 55, y + 2, IRON[0]); }
    p.rrect(0, 40, 60, 46, 1, STEEL); for (let x = 2; x < 58; x += 8) p.rect(x, 41, x + 3, 45, 0xffd23f);   // walkway with hazard paint
    p.rrect(10, 26, 26, 40, 1, [0xc08a50, 0x8a5a2a, 0x5a3418]); p.line([[10, 26], [26, 40]], 0x5a3418); p.line([[26, 26], [10, 40]], 0x5a3418);   // crate
    p.rect(40, 2, 43, 10, IRON[1]); p.ell(41.5, 2, 4, 3, [0xff8a8a, 0xff3030, 0xa01010]);             // beacon on top
  });
  pixSprite(scene, 'crates', 54, 44, p => {                        // stacked wooden crates
    const W = [0xd09a5a, 0x9a6a34, 0x5e3a18];
    for (const [x, y, w, h] of [[2, 20, 26, 23], [26, 18, 26, 25], [12, 1, 24, 20]]) {
      p.rrect(x, y, x + w, y + h, 1, W); p.rect(x + 2, y + 2, x + w - 2, y + 3, W[0]);
      p.line([[x + 2, y + 2], [x + w - 2, y + h - 2]], W[2], 2); p.line([[x + w - 2, y + 2], [x + 2, y + h - 2]], W[2], 2);
    }
    p.rect(16, 8, 30, 12, 0xffd23f); p.px(18, 10, 0x1a1020); p.px(22, 10, 0x1a1020); p.px(26, 10, 0x1a1020);   // a stencilled label
  });
  pixSprite(scene, 'cheeseblock', 46, 36, p => {                  // a block of Swiss dropped by the claw
    p.poly([[2, 10], [30, 4], [44, 10], [44, 34], [16, 35], [2, 30]], [0xfff09a, 0xffcf3a, 0xc9901a]);
    p.poly([[2, 10], [30, 4], [44, 10], [16, 14]], [0xfff6c0, 0xffe27a, 0xd8a83a]);
    for (const [x, y, r] of [[10, 22, 3], [24, 27, 3.5], [36, 20, 2.6], [30, 31, 2], [18, 9, 1.8]]) { p.ell(x, y, r, r * 0.8, 0xa8701a); p.px(x + 1, y + 1, 0xffe27a); }
  });
  pixSprite(scene, 'steam', 14, 14, p => { p.ell(7, 7, 6, 6, [0xffffff, 0xe0e8f0, 0xa8b4c4]); p.px(5, 4, 0xffffff); });
  pixSprite(scene, 'steamvent', 34, 14, p => {
    p.rrect(1, 4, 33, 13, 2, [0x9aa4b4, 0x5e6878, 0x323a48]); p.rect(6, 4, 28, 6, 0x1a1020);
    for (let x = 4; x < 31; x += 6) p.poly([[x, 9], [x + 3, 9], [x, 13]], 0xffd23f);
  });
  pixSprite(scene, 'barrel', 22, 30, p => {                        // steel drum with a hazard band
    p.rrect(1, 2, 21, 29, 3, [0x7ab0d8, 0x3a6a9a, 0x1e3a5a]);
    p.rect(1, 8, 21, 13, 0xffd23f); for (let x = 2; x < 21; x += 5) p.poly([[x, 8], [x + 2, 8], [x, 13]], 0x1a1020);
    p.rect(1, 22, 21, 23, 0x1e3a5a); p.rect(4, 3, 6, 28, 0xa8d0f0);
  });
  for (const [k, col] of [['beacon_r', [0xff9a9a, 0xff3030, 0x9a1010]], ['beacon_b', [0x9ad8ff, 0x3a8aff, 0x1a3a9a]]]) pixSprite(scene, k, 16, 34, p => {   // warning beacon on a post
    p.rect(6, 12, 9, 33, IRON[1]); p.rrect(3, 30, 13, 33, 1, IRON);
    p.rrect(2, 9, 14, 14, 1, STEEL); p.ell(8, 6, 5, 5.5, col); p.rect(6, 2, 7, 6, 0xffffff);
  });
  // goggle-rat welder: a factory rat in a boiler suit and green welding goggles, a riveted steel shield in front, a blowtorch behind it
  pixSprite(scene, 'gogglerat', 46, 34, p => {
    const FUR = [0xb8a08a, 0x8a705a, 0x54402e], SUIT = [0x9aa4b4, 0x5e6878, 0x323a48];
    p.line([[6, 26], [2, 20], [3, 13], [7, 10]], 0xe9a8b8, 2);                                   // tail
    p.ell(16, 23, 11, 9, SUIT); p.rect(10, 20, 22, 22, 0xffd23f);                               // boiler suit + hazard belt
    p.rrect(8, 28, 15, 33, 2, [0x5a4a3a, 0x3a2e22, 0x221a12]); p.rrect(18, 28, 25, 33, 2, [0x5a4a3a, 0x3a2e22, 0x221a12]);   // boots
    p.ell(24, 13, 9, 8, FUR); p.poly([[28, 10], [36, 14], [34, 17], [28, 18]], FUR);             // head + snout
    p.ell(35, 14, 1.6, 1.6, [0xffb0c0, 0xe0607a, 0x9a3048]);
    p.ell(18, 6, 4, 4.5, FUR); p.ell(18, 6, 2, 2.5, 0xe9a8b8);                                  // ear
    p.rect(17, 10, 32, 12, 0x2a2a2a);                                                           // goggle strap
    p.ell(25, 11, 4, 4, [0x9affa0, 0x3ac850, 0x1a6a2a]); p.ell(31, 11, 3, 3.5, [0x9affa0, 0x3ac850, 0x1a6a2a]); p.px(24, 9, 0xffffff); p.px(30, 9, 0xffffff);   // green lenses
    p.line([[14, 20], [8, 16]], SUIT[1], 3); p.rrect(2, 12, 9, 16, 1, [0xff8a8a, 0xe03030, 0x901818]); p.rect(0, 13, 2, 15, 0x5a6272);   // blowtorch held back
    p.rrect(35, 6, 45, 33, 2, [0xc8d0dc, 0x8a96aa, 0x4a5262]);                                   // the riot shield
    for (const y of [9, 30]) for (const x of [37, 43]) p.px(x, y, 0xffffff);                     // rivets
    p.rect(36, 18, 44, 22, 0xffd23f); p.px(38, 19, 0x1a1020); p.px(40, 21, 0x1a1020); p.px(42, 19, 0x1a1020);   // hazard band
    p.rect(36, 8, 37, 31, 0xeef4fc);                                                             // shine
  });
  // the flying pizza cutter: a steel cutting wheel on a handle, pushed along by a little rocket
  pixSprite(scene, 'drone', 50, 38, p => {
    p.poly([[2, 18], [10, 14], [10, 24]], [0xfff6a0, 0xffa21a, 0xd04a10]);                       // (rocket flame drawn as part of the sprite)
    p.rrect(8, 13, 22, 25, 3, [0xff8a8a, 0xe03030, 0x901818]); p.rect(10, 15, 20, 16, 0xffb0b0); // rocket
    p.rrect(20, 16, 30, 22, 1, [0xd09a5a, 0x9a6a34, 0x5e3a18]);                                  // wooden handle
    p.rect(28, 17, 33, 21, STEEL[1]);                                                            // ferrule
    p.ell(37, 19, 12, 12, STEEL); p.ell(37, 19, 9, 9, [0xf4f8ff, 0xc8d0dc, 0x8a96aa]);          // the cutting wheel
    p.ell(37, 19, 3, 3, [0xff8a8a, 0xff3030, 0xa01010]); p.px(36, 18, 0xffffff);               // angry red hub-eye
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; p.px(37 + Math.cos(a) * 11, 19 + Math.sin(a) * 11, 0xffffff); }   // glinting edge
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
  if (madeTex(scene, 'halo')) return;
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
      const bl = this.add.text(x + cw / 2, ty, w.blurb, f(8, open ? '#c9cde0' : '#4a5070', { align: 'center', wordWrap: { width: cw - 20 }, lineSpacing: 4 })).setOrigin(0.5, 0);
      this.ui.add(bl);
      ty += bl.height + 14;                                     // stats always start below the description, however long it is
      if (open) {
        const n = Object.keys(w.stats).length, blockW = 70 + 5 * 14 - 3;
        const sy0 = Math.max(ty, y0 + ch - n * 14 - 14), sx = Math.round(x + (cw - blockW) / 2);   // sit low in the card, centred
        Object.entries(w.stats).forEach(([k, v], j) => {
          const sy = sy0 + j * 14;
          this.ui.add(this.add.text(sx, sy, k, f(8, '#9fa6c2')).setOrigin(0, 0));
          for (let b = 0; b < 5; b++) g.fillStyle(b < v ? (k === 'POWER' ? 0xff6a3a : k === 'RATE' ? 0xffd23f : k === 'RANGE' ? 0x39c6ff : 0x7dff8a) : 0x2a2f50, 1).fillRect(sx + 70 + b * 14, sy, 11, 8);
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
