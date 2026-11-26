// ================================================================= THE MOON BAR, INSIDE (v3.113)
// Walk in through the big bar at camp and you're in a proper wicked little space-bar: neon, a disco ball, a dance floor
// that lights up, Clank-the-shopbot polishing glasses behind the counter, a jukebox, RIDIC LOUISE (the fruit machine)
// and a row of arcade cabinets - one for every BONUS LEVEL in the game. For now they're all in; later they'll turn up
// as you discover them (BAR_GAMES[].found).
// Side-on, one pixel grid (z screen px per art px, 200 art px tall), the room scrolls with Chris.
//   left / right (or tap the floor): walk   A / up / tap a machine: play it   B: out of the door
const BAR = { RW: 760, RH: 200, FL: 170 };      // room width / height (art px), the floor line
const BAR_GAMES = [   // the arcade cabinets: [id, art x, name, two-line marquee, colours [body, trim, screen]]
  { id: 'zerog', x: 388, name: 'ZERO-G ROOM', mq: 'ZERO-G', col: [0x0e3a5a, 0x2ad8e8, 0x5ce1ff] },
  { id: 'zerog2', x: 448, name: 'ZERO-G ROOM II', mq: 'ZERO-G 2', col: [0x3a0e4a, 0xc86aff, 0xff6ad0] },
  { id: 'zerog3', x: 508, name: 'WARP BONUS ROOM', mq: 'WARP', col: [0x4a0e14, 0xff4a4a, 0xff9a2a] },
  { id: 'freefall', x: 568, name: 'GRILL FREEFALL', mq: 'FREEFALL', col: [0x4a2a08, 0xff9a2a, 0xffe040] },
  { id: 'centrifuge', x: 628, name: 'CENTRIFUGE', mq: 'SPIN DRUM', col: [0x0e3a1a, 0x7dff8a, 0xc8ff6a] }
];
const BarRoom = { back: false };
const BAR_BEER = 15;   // (v3.121) a pint of moon ale, in golden crumbs   // set while a bonus level was started from the bar: its exit comes back here

function makeBarRoomArt(scene) {
  if (scene.textures.exists('br_bg')) return;
  const { RW, RH, FL } = BAR;
  const cv = (key, w, h, fn) => { const T = scene.textures.createCanvas(key, w, h), c = T.getContext(); c.imageSmoothingEnabled = false; fn(c, w, h); T.refresh(); T.setFilter(Phaser.Textures.FilterMode.NEAREST); };
  const hex = n => '#' + n.toString(16).padStart(6, '0');
  const R = (c, x, y, w, h, col, a) => { c.globalAlpha = a === undefined ? 1 : a; c.fillStyle = typeof col === 'number' ? hex(col) : col; c.fillRect(x, y, w, h); c.globalAlpha = 1; };
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  // ---- the room
  cv('br_bg', RW, RH, (c) => {
    const bands = [0x0e0618, 0x120820, 0x170a28, 0x1c0c30, 0x220e38, 0x281040, 0x2e1248];
    for (let i = 0; i < bands.length; i++) R(c, 0, Math.floor(FL * i / bands.length), RW, Math.ceil(FL / bands.length) + 1, bands[i]);
    for (let y = 4, r = 0; y < 118; y += 7, r++) for (let x = (r % 2) * 8 - 8; x < RW; x += 16) { R(c, x, y, 15, 6, 0x2a1240, 0.5); R(c, x, y, 15, 1, 0x3a1a58, 0.5); }   // brick
    // two round windows: stars, the Earth, a passing cheese moon
    for (const [wx, earth] of [[300, true], [700, false]]) {
      for (let y = -22; y <= 22; y++) for (let x = -22; x <= 22; x++) { const d = Math.hypot(x, y); if (d <= 22) R(c, wx + x, 40 + y, 1, 1, d > 19.5 ? 0x9aa4b8 : d > 18 ? 0x3a3448 : 0x05061a); }
      for (let k = 0; k < 16; k++) { const a = rnd() * 6.28, d = rnd() * 16; R(c, wx + Math.cos(a) * d, 40 + Math.sin(a) * d, 1, 1, rnd() < 0.3 ? 0xffd23f : 0xffffff); }
      if (earth) for (let y = -7; y <= 7; y++) for (let x = -7; x <= 7; x++) { if (x * x + y * y > 49) continue; R(c, wx + 6 + x, 46 + y, 1, 1, (Math.sin(x * 0.9 + y * 0.5) > 0.3) ? 0x3aa04a : (x + y > 6 ? 0x1a3a8a : 0x2a6ad8)); }
      else for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) { if (x * x + y * y > 36) continue; R(c, wx - 4 + x, 36 + y, 1, 1, (x * 3 + y * 5) % 7 === 0 ? 0xc8902a : 0xffd23f); }
      R(c, wx - 1, 18, 2, 44, 0x9aa4b8); R(c, wx - 22, 39, 44, 2, 0x9aa4b8);
    }
    // the wood panelling under the dado rail
    R(c, 0, 118, RW, 3, 0xc8902a); R(c, 0, 121, RW, 1, 0x5a3a0a);
    for (let x = 0; x < RW; x += 24) { R(c, x, 122, 24, FL - 122, 0x2a160c); R(c, x + 2, 124, 20, FL - 128, 0x3a1e10); R(c, x + 2, 124, 20, 1, 0x5a2e16); }
    // the back bar: shelves of glowing bottles
    R(c, 44, 52, 176, 70, 0x140810); R(c, 44, 52, 176, 2, 0x5a3a0a);
    for (const sy of [72, 94, 116]) { R(c, 44, sy, 176, 3, 0x8a5a2a); R(c, 44, sy + 3, 176, 1, 0x2a160c); }
    const BOT = [0x2aa04a, 0x5a3aa0, 0xd83a2a, 0xffd23f, 0x2ad8e8, 0xff6ad0, 0xff9a2a, 0xf4ecd8];
    for (const sy of [72, 94, 116]) for (let x = 48; x < 214;) { const w = 4 + Math.floor(rnd() * 3), h = 9 + Math.floor(rnd() * 8), col = BOT[Math.floor(rnd() * BOT.length)];
      R(c, x, sy - h, w, h, col); R(c, x + 1, sy - h - 3, w - 2, 3, col); R(c, x, sy - h, 1, h, 0xffffff, 0.35); R(c, x + w - 1, sy - h, 1, h, 0x000000, 0.3); x += w + 1 + Math.floor(rnd() * 3); }
    R(c, 44, 52, 176, 70, 0xff6ad0, 0.05);
    // the door (left), with a little round window and EXIT
    R(c, 6, 84, 34, FL - 84, 0x1a1020); R(c, 8, 86, 30, FL - 86, 0x5a2e16); R(c, 10, 88, 26, FL - 90, 0x7a4220);
    for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) if (x * x + y * y <= 25) R(c, 23 + x, 104 + y, 1, 1, x * x + y * y > 16 ? 0x9aa4b8 : 0x1a3a8a);
    R(c, 32, 128, 3, 4, 0xffd23f); R(c, 12, 74, 22, 8, 0x0e3a1a); R(c, 13, 75, 20, 6, 0x1a6a2a);
    // the stage corner for the jukebox, a rug
    R(c, 680, FL - 2, 72, 2, 0x8a1a2a);
    // the floor: a dance floor of tiles (the lights are drawn over it, live)
    for (let y = FL, j = 0; y < RH; y += 6, j++) for (let x = 0, i = 0; x < RW; x += 12, i++) { R(c, x, y, 12, 6, (i + j) % 2 ? 0x241034 : 0x180a26); R(c, x, y, 12, 1, 0x3a1a50, 0.6); }
    R(c, 0, FL, RW, 1, 0xffd23f);
  });
  // ---- the counter front (in front of the barman)
  cv('br_ctr', 180, 46, (c) => {
    R(c, 0, 0, 180, 5, 0xc8902a); R(c, 0, 0, 180, 1, 0xfff0a0); R(c, 0, 5, 180, 1, 0x5a3a0a);
    for (let x = 0; x < 180; x += 20) { R(c, x, 6, 20, 40, 0x5a0e1a); R(c, x + 2, 8, 16, 34, 0x8a1a2a); R(c, x + 2, 8, 16, 1, 0xb83040); R(c, x + 9, 20, 2, 8, 0xffd23f); }
    R(c, 0, 40, 180, 2, 0xc8ccd8);       // the brass foot rail
    for (const x of [30, 70, 110, 150]) { R(c, x - 2, -6, 5, 6, 0xf4ecd8, 0.9); R(c, x - 1, -9, 3, 3, 0xff9a2a); }   // pint glasses on the bar
  });
  // the pint glass, full to empty (0..4): a handled tankard with a head of foam
  for (let f = 0; f < 5; f++) cv('br_pint' + f, 12, 14, (c) => {
    R(c, 1, 2, 9, 12, 0x1a1020); R(c, 2, 3, 7, 10, 0xdff4ff, 0.55); R(c, 9, 5, 3, 6, 0x1a1020); R(c, 10, 6, 1, 4, 0xdff4ff);
    const lv = [9, 7, 5, 3, 0][f]; if (lv) { R(c, 2, 13 - lv, 7, lv, 0xffb03a); R(c, 2, 13 - lv, 2, lv, 0xffd27a); R(c, 7, 13 - lv, 2, lv, 0xc87a1a); }
    if (f < 4) { R(c, 2, 12 - lv - (f ? 0 : 1), 7, f ? 1 : 2, 0xffffff); if (!f) { R(c, 1, 1, 9, 2, 0xffffff); R(c, 3, 0, 4, 1, 0xfff4e0); } }
    R(c, 3, 4, 1, 7, 0xffffff, 0.7);
  });
  cv('br_pint', 8, 12, (c) => { R(c, 0, 2, 8, 10, 0x1a1020); R(c, 1, 3, 6, 8, 0xffb03a); R(c, 1, 3, 6, 2, 0xfff4e0); R(c, 1, 0, 6, 3, 0xffffff); R(c, 2, 5, 1, 5, 0xffe0a0); R(c, 7, 4, 1, 4, 0x1a1020); });
  cv('br_stool', 14, 26, (c) => { R(c, 0, 0, 14, 4, 0x1a1020); R(c, 1, 0, 12, 3, 0xd83a2a); R(c, 1, 0, 12, 1, 0xff6a6a); R(c, 6, 4, 2, 20, 0xc8ccd8); R(c, 2, 24, 10, 2, 0x9aa4b8); R(c, 3, 15, 8, 1, 0x9aa4b8); });
  // ---- the arcade cabinets (one texture each, their screens are animated over the top)
  for (const g of BAR_GAMES) cv('br_cab_' + g.id, 36, 78, (c) => {
    const [b, t] = g.col;
    R(c, 2, 0, 32, 78, 0x08040e); R(c, 3, 1, 30, 76, b); R(c, 3, 1, 3, 76, t, 0.55); R(c, 30, 1, 3, 76, 0x000000, 0.3);
    R(c, 4, 2, 28, 12, t); R(c, 5, 3, 26, 10, 0x1a1020);                       // the marquee
    R(c, 5, 17, 26, 22, 0x08040e);                                             // the screen bezel
    R(c, 0, 42, 36, 8, b); R(c, 0, 42, 36, 2, t); R(c, 7, 44, 4, 3, 0x1a1020); R(c, 8, 41, 2, 4, 0xff4a4a);     // the control deck, a joystick
    R(c, 20, 45, 4, 3, 0xffe040); R(c, 26, 45, 4, 3, 0x2ad8e8);
    R(c, 13, 58, 10, 3, 0x1a1020); R(c, 14, 59, 8, 1, 0xffd23f);                // the coin slot
    R(c, 3, 74, 30, 4, 0x1a1020);
  });
  // ---- RIDIC LOUISE herself: a big red-and-gold fruit machine
  cv('br_slot', 52, 96, (c) => {
    R(c, 0, 6, 52, 90, 0x1a1020); R(c, 1, 7, 50, 88, 0x8a1a2a); R(c, 1, 7, 4, 88, 0xb83040); R(c, 46, 7, 5, 88, 0x5a0e1a);
    R(c, 2, 0, 48, 14, 0x1a1020); R(c, 3, 1, 46, 12, 0xc8902a); R(c, 3, 1, 46, 2, 0xfff0a0);          // the marquee
    R(c, 5, 18, 42, 26, 0xc8ccd8); R(c, 6, 19, 40, 24, 0x1a1020);                                     // the reel window
    for (let k = 0; k < 3; k++) R(c, 7 + k * 13, 20, 12, 22, 0xf4ecd8);
    R(c, 6, 30, 40, 1, 0xff3a3a);
    R(c, 5, 48, 42, 8, 0x140404); R(c, 1, 60, 50, 10, 0x5a0e1a); R(c, 1, 60, 50, 2, 0xe05a5a);
    for (const [x, col] of [[6, 0x5a4a90], [16, 0x5a4a90], [26, 0xc8902a], [37, 0x2aa04a]]) { R(c, x, 62, 9, 5, 0x1a1020); R(c, x, 62, 9, 4, col); R(c, x, 62, 9, 1, 0xffffff, 0.5); }
    R(c, 14, 78, 24, 8, 0x1a1020); R(c, 15, 79, 22, 6, 0xc8902a);                                    // the coin tray
    R(c, 51, 24, 1, 2, 0x1a1020);
  });
  cv('br_juke', 40, 66, (c) => {
    for (let y = 0; y < 66; y++) for (let x = 0; x < 40; x++) { const cx = x - 19.5, top = y < 20 ? Math.hypot(cx, y - 20) <= 20 : true; if (!top) continue;
      const edge = (y < 20 ? Math.hypot(cx, y - 20) > 18.5 : (x < 2 || x > 37)) || y > 63;
      R(c, x, y, 1, 1, edge ? 0x1a1020 : (Math.abs(cx) > 14 || y < 6 ? 0xc8902a : 0x5a0e1a)); }
    R(c, 9, 14, 22, 16, 0x1a1020); R(c, 10, 15, 20, 14, 0x2a1a3a);
    for (let k = 0; k < 4; k++) R(c, 11, 16 + k * 3, 18, 2, [0xffd23f, 0xff6ad0, 0x2ad8e8, 0x7dff8a][k], 0.7);
    R(c, 8, 36, 24, 18, 0x1a1020); for (let k = 0; k < 6; k++) R(c, 9, 37 + k * 3, 22, 1, 0xc8902a);
  });
}

class BarRoomScene extends Phaser.Scene {
  constructor() { super('barroom'); }
  create() {
    makeTextures(this); if (typeof makeFruityTextures === 'function') makeFruityTextures(this); makeBarRoomArt(this);
    if (typeof makeCampTextures === 'function' && !this.textures.exists('shopbot')) makeCampTextures(this);
    this.cameras.main.setBackgroundColor('#0e0618'); this.cameras.main.fadeIn(350, 0, 0, 0);
    Sound.init(); this.tracks = ['bar', 'title', 'level1', 'tent']; this.trackI = 0; Sound.music('bar');
    BarRoom.back = false;
    this.t = 0; this.going = false; this.cx = 60; this.goal = null; this.useOnArrive = null; this.hold = 0;
    this.P = { h: 0, floor: 0, vh: 0, vx: 0, thrusting: false, firing: 0, aimA: 0.1, power: 0, duck: false, facing: 1 };
    this.spots = [{ id: 'door', x: 23, name: 'THE DOOR', verb: 'BACK TO CAMP' }, { id: 'bot', x: 130, name: 'CLANK THE BARMAN', verb: 'BUY A BEER (' + BAR_BEER + ' CRUMBS)' },
      { id: 'slot', x: 290, name: 'RIDIC LOUISE', verb: 'PLAY' }]
      .concat(BAR_GAMES.map(g => ({ id: g.id, x: g.x, name: g.name, verb: 'PLAY', game: g })), (typeof Story === 'undefined' || Story.built('juke') ? [{ id: 'juke', x: 716, name: 'THE JUKEBOX', verb: 'CHANGE THE TUNE' }] : []));   // (v3.132) DJ Camembeat brings it
    this.build();
    this.scale.on('resize', this.build, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.build, this));
    const kb = this.input.keyboard;
    if (kb) {
      this.keys = kb.addKeys('LEFT,RIGHT,A,D');
      kb.on('keydown-UP', () => this.use()); kb.on('keydown-W', () => this.use()); kb.on('keydown-SPACE', () => this.use()); kb.on('keydown-ENTER', () => this.use()); kb.on('keydown-DOWN', () => this.use());
      kb.on('keydown-ESC', () => this.leave());
    }
    const padOff = typeof Pad !== 'undefined' ? Pad.on(b => { if (b === 'a' || b === 'up' || b === 'x') this.use(); else if (b === 'b' || b === 'back') this.leave(); }) : null;
    if (padOff) this.events.once('shutdown', padOff);
    this.input.on('pointerdown', p => this.tapAt(p));
    this.say(['WELCOME TO THE MOON BAR!', 'MIND THE DANCE FLOOR, CHEF.', 'THE GAMES ARE ON THE HOUSE.'][Math.floor(Math.random() * 3)]);
  }
  build() {
    const W = this.scale.width, H = this.scale.height, z = this.z = H / BAR.RH, { RW, FL } = BAR;
    this.children.removeAll(true); if (this.rig) this.rig = null;
    const A = (x, y) => [x * z, y * z];
    this.cameras.main.setBounds(0, 0, Math.max(W, RW * z), H);
    this.add.image(0, 0, 'br_bg').setOrigin(0).setScale(z).setDepth(0);
    this.lightG = this.add.graphics().setDepth(0.5).setBlendMode(Phaser.BlendModes.ADD);
    // neon signs
    const f = (s, c, o) => Object.assign({ fontFamily: PIXEL, fontSize: Math.round(s * z) + 'px', color: c, stroke: '#1a1020', strokeThickness: Math.max(2, Math.round(z * 1.2)) }, o || {});
    this.neon = [
      this.add.text(...A(132, 30), 'MOON BAR', f(12, '#ff6ad0', { stroke: '#ffd0f0', strokeThickness: Math.max(1, Math.round(z * 0.7)) })).setOrigin(0.5).setShadow(0, 0, '#ff2aa0', 12 * z, true, true).setDepth(1),
      this.add.text(...A(508, 18), 'BONUS ARCADE', f(8, '#5ce1ff', { stroke: '#d0f8ff', strokeThickness: Math.max(1, Math.round(z * 0.6)) })).setOrigin(0.5).setShadow(0, 0, '#2a9aff', 10 * z, true, true).setDepth(1),
      this.add.text(...A(23, 78), 'EXIT', f(4, '#7dff8a', { stroke: '#0e3a1a', strokeThickness: 1 })).setOrigin(0.5).setDepth(1)
    ];
    // the barman behind the counter, then the counter, then stools
    this.bot = this.add.image(...A(130, 150), this.textures.exists('shopbot') ? 'shopbot' : 'br_juke').setOrigin(0.5, 1).setDepth(1.5);
    this.bot.setScale(z * 46 / Math.max(1, this.bot.height) * (this.bot.texture.key === 'shopbot' ? 1.15 : 1));
    this.add.image(...A(42, 124), 'br_ctr').setOrigin(0, 0).setScale(z).setDepth(1.6);
    for (const x of [62, 102, 142, 182]) this.add.image(...A(x, FL), 'br_stool').setOrigin(0.5, 1).setScale(z).setDepth(1.7);
    // the machines
    this.slot = this.add.image(...A(290, FL), 'br_slot').setOrigin(0.5, 1).setScale(z).setDepth(1.6);
    this.slotIm = [0, 1, 2].map(k => this.add.image(...A(290 - 26 + 7 + k * 13 + 6, FL - 96 + 31), 'fm_wedge').setScale(z * 0.5).setDepth(1.65));
    this.add.text(...A(290, FL - 89), 'RIDIC\nLOUISE', f(3.2, '#1a1020', { stroke: '#fff0a0', strokeThickness: 1, align: 'center', lineSpacing: -Math.round(z) })).setOrigin(0.5).setDepth(1.7);
    this.cabs = BAR_GAMES.map(g => {
      const im = this.add.image(...A(g.x, FL), 'br_cab_' + g.id).setOrigin(0.5, 1).setScale(z).setDepth(1.6);
      const mq = this.add.text(...A(g.x, FL - 70), g.mq, f(g.mq.length > 6 ? 2.6 : 3.2, '#' + g.col[2].toString(16).padStart(6, '0'), { strokeThickness: 1 })).setOrigin(0.5).setDepth(1.7);
      const st = this.add.text(...A(g.x, FL + 7), '', f(3.4, '#ffffff', { strokeThickness: 2 })).setOrigin(0.5, 0).setDepth(1.7);
      return { g, im, mq, st };
    });
    this.hasJuke = typeof Story === 'undefined' || Story.built('juke');
    this.juke = this.add.image(...A(716, FL), 'br_juke').setOrigin(0.5, 1).setScale(z).setDepth(1.6).setVisible(this.hasJuke);
    if (this.hasJuke && typeof makeStoryTextures === 'function') { makeStoryTextures(this); this.dj = this.add.image(...A(690, FL), 'cf_dj0').setOrigin(0.5, 1).setScale(z * 0.9).setDepth(1.62); }
    this.scrG = this.add.graphics().setDepth(1.65);
    this.fxG = this.add.graphics().setDepth(4);
    // Chris
    this.rig = new ChrisRig(this); this.rig.root.setDepth(3); this.rig.setWeapon(WEAPONS[0]);
    // the prompt and the caption (fixed to the screen)
    this.prompt = this.add.text(0, 0, '', f(4.2, '#1a1020', { stroke: '#1a1020', strokeThickness: 0, backgroundColor: '#ffd23f', padding: { x: Math.round(3 * z), y: Math.round(2 * z) } })).setOrigin(0.5, 1).setDepth(6).setVisible(false);
    this.capT = this.add.text(W / 2, H - 4 * z, this.capMsg || '', f(4, '#ffd9f0', { align: 'center' })).setOrigin(0.5, 1).setDepth(6).setScrollFactor(0);
    const ex = this.add.text(8, 8, 'LEAVE  (B)', { fontFamily: PIXEL, fontSize: Math.max(9, Math.round(3.6 * z)) + 'px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 3, backgroundColor: '#2a1a2a', padding: { x: 6, y: 4 } }).setDepth(6).setScrollFactor(0);
    this.exitBox = { x: 8, y: 8, w: ex.width, h: ex.height };
    this.updateCabs();
  }
  say(m) { this.capMsg = m; this.capT0 = this.t; if (this.capT) this.capT.setText(m).setAlpha(1); }
  status(id) {
    if (Progress.testMode) return ['TEST MODE', '#9fa6c2'];
    if (Progress.bonusWon(id)) return ['CLEARED', '#7dff8a'];
    const n = Progress.bonusTries(id);
    if (n >= BONUS_TRIES) return ['PRACTICE', '#ffb04a'];
    return [(BONUS_TRIES - n) + ' PRIZE GOES', '#ffffff'];
  }
  updateCabs() { for (const C of this.cabs) { const [s, col] = this.status(C.g.id); C.st.setText(s).setColor(col); } }
  near() { let best = null, bd = 1e9; for (const s of this.spots) { const d = Math.abs(s.x - this.cx); if (d < bd) { bd = d; best = s; } } return bd < 22 ? best : null; }
  tapAt(p) {
    if (this.going) return;
    if (p.x >= this.exitBox.x && p.x <= this.exitBox.x + this.exitBox.w && p.y >= this.exitBox.y && p.y <= this.exitBox.y + this.exitBox.h) { this.leave(); return; }
    const wx = (p.x + this.cameras.main.scrollX) / this.z, wy = p.y / this.z;
    // tapped the prompt, or a machine: walk there and use it
    const s = this.spots.find(q => Math.abs(q.x - wx) < 20 && wy > BAR.FL - 100 && wy < BAR.FL + 10);
    if (s) { if (Math.abs(s.x - this.cx) < 6) this.use(s); else { this.goal = s.x; this.useOnArrive = s; } return; }
    this.goal = Math.max(14, Math.min(BAR.RW - 14, wx)); this.useOnArrive = null;
  }
  use(s) {
    if (this.going) return; s = s || this.near(); if (!s) return;
    const go = (fn) => { this.going = true; Sound.sfx('wave'); this.cameras.main.fadeOut(300, 0, 0, 0); this.time.delayedCall(330, fn); };
    if (s.id === 'door') { this.leave(); return; }
    if (s.id === 'bot') { this.buyBeer(); return; }
    if (s.id === 'juke') { this.trackI = (this.trackI + 1) % this.tracks.length; Sound.music(this.tracks[this.trackI]); Sound.sfx('blip'); this.jukeT = 1; this.say('NOW PLAYING: ' + ['MOON BAR BOOGIE', 'THE CAMP ANTHEM', 'LEVEL ONE (LOUNGE MIX)', 'THE TENT LULLABY'][this.trackI]); return; }
    if (s.id === 'slot') { go(() => this.scene.start('fruity', { from: 'camp', back: 'bar' })); return; }
    if (s.game) { if (typeof Run !== 'undefined' && Run.on) return; BarRoom.back = true; const id = s.id;
      go(() => { if (id === 'centrifuge') this.scene.start('centrifuge'); else if (id === 'freefall') this.scene.start('freefall'); else this.scene.start('zerog', { room: id }); }); }
  }
  // (v3.121) a pint from Clank: costs crumbs, Chris glugs it, and he's tipsy for 30 seconds (src/tipsy.js)
  buyBeer() {
    if (this.drinkT > 0) return;
    if (Meta.crumbs() < BAR_BEER) { Sound.sfx('clunk'); this.botT = 0.6; this.say(['CLANK: NO CRUMBS, NO BEER, CHEF.', 'CLANK: YOUR CRUMB TAB IS... EMPTY.', 'CLANK: COME BACK WITH ' + BAR_BEER + ' GOLDEN CRUMBS.'][Math.floor(Math.random() * 3)]); return; }
    if (Tipsy.pints() >= Tipsy.MAX) { Sound.sfx('clunk'); this.say('CLANK: I THINK YOU\'VE HAD ENOUGH, CHEF.'); return; }
    Meta.addCrumbs(-BAR_BEER); Sound.sfx('pickup'); this.botT = 1.2;
    this.say(['CLANK: ONE PINT OF MOON ALE. -' + BAR_BEER + ' CRUMBS', 'CLANK: FRESH FROM THE CRATER. -' + BAR_BEER + ' CRUMBS', 'CLANK: MIND THE HEAD ON THAT. -' + BAR_BEER + ' CRUMBS'][Math.floor(Math.random() * 3)]);
    // (v3.126) the pint slides down the bar; Chris takes it (the rig does the drinking: reach, raise, head back, five
    // glugs as the glass empties, down with a grin, a wipe of the moustache), then tosses the empty over his shoulder
    const z = this.z, pint = this.add.image(134 * z, 124 * z, 'br_pint0').setOrigin(0.5, 1).setScale(z * 0.75).setDepth(1.65);
    this.goal = null; this.useOnArrive = null; this.drinkT = 3.5; this.drinkU = 0; this.slidePint = pint; this.gulps = 0; this.P.facing = this.cx < 130 ? 1 : this.P.facing;
    Sound.sfx('zing');
    this.tweens.add({ targets: pint, x: (this.cx + this.P.facing * 12) * z, duration: 300, ease: 'Cubic.easeOut' });
  }
  drinkTick(dt) {
    if (!(this.drinkT > 0)) { this.P.drink = 0; return; }
    const T = 3.2, u = this.drinkU = Math.min(1, this.drinkU + dt / T), z = this.z, R0 = this.rig.root;
    this.P.drink = u < 1 ? Math.max(0.001, u) : 0;
    if (this.slidePint && u > 0.04) {                    // off the bar and into his reaching hand
      const k = Math.min(1, (u - 0.04) / 0.08), e = k * k * (3 - 2 * k), H = this.rig.fFist, hx = R0.x + (H.x - 6) * R0.scaleX, hy = R0.y + (H.y + 2) * R0.scaleY, sp = this.slidePint;
      if (sp.fx === undefined) { this.tweens.killTweensOf(sp); sp.fx = sp.x; sp.fy = sp.y; sp.setDepth(3.4); }
      sp.setPosition(sp.fx + (hx - sp.fx) * e, sp.fy + (hy - sp.fy) * e - Math.sin(e * Math.PI) * 4 * z);
    }
    if (this.slidePint && u >= 0.12) { this.slidePint.destroy(); this.slidePint = null; Sound.sfx('pickup'); }
    const g = Math.floor((u - 0.3) / 0.44 * 5); if (u > 0.3 && u < 0.74 && g >= this.gulps) { this.gulps = g + 1; Sound.sfx('blip'); this.rig.bv = (this.rig.bv || 0) + 3; }
    if (u >= 0.78 && !this.ahh) { this.ahh = true; const n = Tipsy.drink(); Sound.sfx('power');
      const t = this.add.text(R0.x + this.P.facing * 14 * z, R0.y - 50 * z, 'AHHH!', { fontFamily: PIXEL, fontSize: Math.round(5 * z) + 'px', color: '#fff0c8', stroke: '#1a1020', strokeThickness: 4 }).setOrigin(0.5).setDepth(5).setScale(0.3);
      this.tweens.add({ targets: t, scale: 1, y: t.y - 10 * z, duration: 260, ease: 'Back.easeOut' }); this.tweens.add({ targets: t, alpha: 0, delay: 900, duration: 400, onComplete: () => t.destroy() });
      this.say(n > 3 ? 'FOUR PINTS. HE CAN SEE THROUGH TIME.' : n > 2 ? 'THREE PINTS... WHO PUT TWO MOONS UP THERE?' : n > 1 ? 'TWO PINTS IN... THE ROOM IS SPINNING' : 'AHHH. THAT HITS THE SPOT.'); }
    if (u >= 0.86 && !this.tossed) { this.tossed = true; Sound.sfx('jump');                       // the empty goes over his shoulder
      const gl = this.add.image(R0.x, R0.y - 40 * z, 'br_pint4').setScale(z * 0.75).setDepth(3.4), dir = -this.P.facing;
      this.tweens.add({ targets: gl, x: gl.x + dir * 90 * z, angle: dir * 720, duration: 700, ease: 'Linear' });
      this.tweens.add({ targets: gl, y: gl.y - 40 * z, duration: 300, ease: 'Quad.easeOut', yoyo: false, onComplete: () => this.tweens.add({ targets: gl, y: BAR.FL * z, duration: 400, ease: 'Quad.easeIn', onComplete: () => {
        Sound.sfx('clang'); for (let k = 0; k < 6; k++) { const sh = this.add.rectangle(gl.x, gl.y, 2 * z, 2 * z, 0xdff4ff).setDepth(3.4); this.tweens.add({ targets: sh, x: sh.x + (Math.random() - 0.5) * 40 * z, y: sh.y - Math.random() * 22 * z, alpha: 0, duration: 450, onComplete: () => sh.destroy() }); }
        gl.destroy(); this.botT = 1; this.say('CLANK: ...THAT IS COMING OUT OF YOUR CRUMBS.'); } }) }); }
    this.drinkT -= dt; if (this.drinkT <= 0) { this.P.drink = 0; this.ahh = false; this.tossed = false; }
  }
  hic() { const z = this.z, t = this.add.text(this.cx * z + (Math.random() - 0.5) * 20 * z, (BAR.FL - 48) * z, '*HIC*', { fontFamily: PIXEL, fontSize: Math.round(4 * z) + 'px', color: '#ffd9a0', stroke: '#1a1020', strokeThickness: 3 }).setOrigin(0.5).setDepth(5);
    this.tweens.add({ targets: t, y: t.y - 16 * z, alpha: 0, angle: (Math.random() - 0.5) * 30, duration: 1100, onComplete: () => t.destroy() }); Sound.sfx('squeak'); }
  leave() { if (this.going) return; this.going = true; Sound.sfx('wave'); this.cameras.main.fadeOut(350, 0, 0, 0); this.time.delayedCall(380, () => this.scene.start('level1', { camp: true, at: CAMP_ST.find(s => s.id === 'bar').theta })); }
  update(time, delta) {
    const dt = Math.min(0.05, delta / 1000); this.t += dt; const t = this.t, z = this.z, { FL, RW } = BAR, P = this.P, W = this.scale.width, H = this.scale.height;
    // walking
    let dir = 0; const K = this.keys;
    if (K && (K.LEFT.isDown || K.A.isDown)) dir -= 1; if (K && (K.RIGHT.isDown || K.D.isDown)) dir += 1;
    if (typeof Pad !== 'undefined' && Pad.state) { if (Pad.state.left) dir = -1; if (Pad.state.right) dir = 1; }
    this.drinkTick(dt); if (this.drinkT > 0) dir = 0;
    if (dir) { this.goal = null; this.useOnArrive = null; }
    else if (this.goal !== null) { const d = this.goal - this.cx; if (Math.abs(d) < 2) { this.goal = null; if (this.useOnArrive) { const s = this.useOnArrive; this.useOnArrive = null; this.use(s); } } else dir = Math.sign(d); }
    if (Tipsy.level() > 0 && !(this.drinkT > 0) && !this.going) dir = Tipsy.steer(dir, this.time.now);
    P.tipsy = Tipsy.level();
    const sp = 95; P.vx = this.going ? 0 : dir * sp * z; this.cx = Math.max(14, Math.min(RW - 14, this.cx + (this.going ? 0 : dir * sp * dt)));
    if (Math.abs(dir) > 0.15) P.facing = Math.sign(dir);
    this.rig.update(P, dt, Math.round(this.cx * z), Math.round(FL * z), z * 0.58, 1, Math.floor(t * 10) % 4);
    if (this.rig.hicFlag) { this.rig.hicFlag = false; this.hic(); }
    const cam = this.cameras.main; cam.scrollX = Math.max(0, Math.min(Math.max(0, RW * z - W), this.cx * z - W / 2));
    // the prompt over whatever you're next to
    const s = this.near();
    if (s && !this.going) {
      const top = s.id === 'slot' ? 104 : s.id === 'door' ? 96 : s.id === 'bot' ? 64 : s.id === 'juke' ? 74 : 86;
      const pad = typeof Pad !== 'undefined' && Pad.state && Pad.state.connected;
      this.prompt.setVisible(true).setText((pad ? 'A: ' : 'TAP / UP: ') + s.verb + (s.game || s.id === 'slot' ? ' ' + s.name : '')).setPosition(Math.max(cam.scrollX + this.prompt.width / 2 + 4, Math.min(cam.scrollX + W - this.prompt.width / 2 - 4, s.x * z)), (FL - top) * z + Math.sin(t * 4) * z);
    } else this.prompt.setVisible(false);
    if (this.capT && this.capT0 !== undefined && t - this.capT0 > 4) this.capT.setAlpha(Math.max(0, 1 - (t - this.capT0 - 4)));
    // the lights: spotlights sweeping, a disco ball, the dance floor pulsing to the beat, neon flicker
    const L = this.lightG; L.clear(); const beat = (t * 118 / 60) % 1, pulse = Math.pow(1 - beat, 3);
    const RAIN = [0xff4a6a, 0xff9a2a, 0xffe040, 0x7dff8a, 0x2ad8e8, 0x6a8aff, 0xc86aff, 0xff6ad0];
    for (let y = FL, j = 0; y < BAR.RH; y += 6, j++) for (let x = 0, i = 0; x < RW; x += 12, i++) {
      const v = Math.sin(i * 1.7 + j * 2.3 + Math.floor(t * 118 / 60) * 1.3); if (v < 0.55) continue;
      L.fillStyle(RAIN[(i + j + Math.floor(t * 2)) % RAIN.length], 0.18 + 0.35 * pulse).fillRect(x * z, y * z, 12 * z, 6 * z);
    }
    for (const [bx, col, ph] of [[100, 0xff6ad0, 0], [300, 0x2ad8e8, 1.7], [470, 0xffe040, 3.1], [640, 0x7dff8a, 4.4]]) {
      const a = Math.sin(t * 0.7 + ph) * 0.6, Ln = BAR.RH * 1.2, w = 0.14;
      L.fillStyle(col, 0.08 + 0.05 * pulse).fillTriangle(bx * z, 0, (bx + Math.sin(a - w) * Ln) * z, Math.cos(a - w) * Ln * z, (bx + Math.sin(a + w) * Ln) * z, Math.cos(a + w) * Ln * z);
    }
    const g = this.fxG; g.clear();
    { const bx = 380 * z, by = 16 * z, br = 8 * z;                         // the disco ball
      g.lineStyle(Math.max(1, z * 0.6), 0x9aa4b8, 1).lineBetween(bx, 0, bx, by - br); g.fillStyle(0x6a7088, 1).fillCircle(bx, by, br);
      for (let k = 0; k < 7; k++) for (let j = -3; j <= 3; j++) { const u = ((k / 7 + t * 0.12) % 1) * 2 - 1, xx = bx + u * br * Math.sqrt(1 - (j / 4) ** 2), yy = by + j * br / 4; if (Math.abs(u) < 0.95) g.fillStyle((k + j) % 2 ? 0xf4f8ff : 0xc8ccd8, 1).fillRect(xx - z * 0.6, yy - z * 0.6, z * 1.2, z * 1.2); }
      for (let i = 0; i < 40; i++) { const a = i * 2.39996 + t * 0.3, rr = (40 + (i * 53) % 330) * z, x = bx + Math.cos(a) * rr, y = by + Math.abs(Math.sin(a)) * rr * 0.5; if (y > FL * z) continue;
        const tw = 0.5 + 0.5 * Math.sin(t * 5 + i); g.fillStyle(RAIN[i % RAIN.length], 0.25 + 0.5 * tw).fillRect(x - z, y - z, 2 * z, 2 * z); } }
    for (const [i, n] of this.neon.entries()) n.setAlpha(Math.random() < 0.012 ? 0.3 : 0.88 + 0.12 * Math.sin(t * 9 + i));
    // the machines come alive: cabinet screens playing their attract modes, Louise's reels ticking over, the jukebox glowing
    const S = this.scrG; S.clear();
    for (const C of this.cabs) {
      const [b, tr, sc] = C.g.col, x0 = (C.g.x - 13) * z, y0 = (FL - 61) * z, w = 26 * z, h = 22 * z, near = s && s.id === C.g.id;
      S.fillStyle(0x05061a, 1).fillRect(x0, y0, w, h);
      for (let k = 0; k < 6; k++) { const px = x0 + ((k * 37 + t * (20 + k * 9) * z) % w), py = y0 + ((k * 13 + Math.sin(t * 2 + k) * 6 + 8) * z % h); S.fillStyle(k % 2 ? sc : tr, 0.9).fillRect(px, py, 2 * z, 2 * z); }
      S.fillStyle(sc, 0.15 + (near ? 0.25 : 0.1) * (0.5 + 0.5 * Math.sin(t * 6 + C.g.x))).fillRect(x0, y0, w, h);
      for (let k = 0; k < h; k += 2 * z) S.fillStyle(0x000000, 0.25).fillRect(x0, y0 + k, w, z * 0.7);
      if (near) { S.lineStyle(z, 0xffd23f, 0.6 + 0.4 * Math.sin(t * 8)).strokeRect((C.g.x - 18) * z, (FL - 79) * z, 36 * z, 79 * z); }
    }
    const reelT = ['fm_wedge', 'fm_heart', 'fm_bessie', 'fm_star', 'fm_coin', 'fm_rat'].filter(k => this.textures.exists(k));
    this.slotIm.forEach((im, k) => { if (reelT.length) im.setTexture(reelT[(Math.floor(t * (s && s.id === 'slot' ? 9 : 1.2) + k * 2)) % reelT.length]); });
    for (let k = 0; k < 11; k++) { const on = (Math.floor(t * 8) + k) % 3 === 0; S.fillStyle(on ? 0xffffff : RAIN[(k + Math.floor(t * 3)) % RAIN.length], 1).fillRect((290 - 23 + k * 4.2) * z, (FL - 92.5) * z, 2 * z, 2 * z); }
    if (s && s.id === 'slot') S.lineStyle(z, 0xffd23f, 0.6 + 0.4 * Math.sin(t * 8)).strokeRect((290 - 27) * z, (FL - 97) * z, 54 * z, 97 * z);
    if (this.dj) this.dj.setTexture('cf_dj' + (Math.floor(t * 118 / 60) % 2)).setY((FL - Math.abs(Math.sin(t * Math.PI * 118 / 60)) * 2) * z);
    if (this.hasJuke) { const jx = 716 * z, jy = (FL - 50) * z; for (let k = 0; k < 4; k++) S.fillStyle(RAIN[(k + Math.floor(t * 4)) % RAIN.length], 0.5 + 0.5 * pulse).fillRect(jx - 9 * z, jy + (k * 3 - 14) * z, 18 * z, 2 * z);
      this.juke.setScale(z * (1 + 0.03 * pulse * (this.jukeT > 0 ? 3 : 1)), z * (1 - 0.02 * pulse)); this.jukeT = Math.max(0, (this.jukeT || 0) - dt);
      if (Math.random() < dt * 3) { const nt = this.add.text(jx + (Math.random() - 0.5) * 20 * z, jy - 20 * z, Math.random() < 0.5 ? '♪' : '♫', { fontSize: Math.round(7 * z) + 'px', color: '#' + RAIN[Math.floor(Math.random() * 8)].toString(16).padStart(6, '0') }).setDepth(4).setOrigin(0.5);
        this.tweens.add({ targets: nt, y: nt.y - 30 * z, x: nt.x + (Math.random() - 0.5) * 20 * z, alpha: 0, duration: 1600, onComplete: () => nt.destroy() }); } }
    // Clank polishes a glass (a bob), and bobs harder when you order
    this.botT = Math.max(0, (this.botT || 0) - dt);
    this.bot.setY((150 - Math.abs(Math.sin(t * (this.botT > 0 ? 10 : 2))) * (this.botT > 0 ? 3 : 1)) * z).setRotation(Math.sin(t * 1.5) * 0.03);
  }
}
