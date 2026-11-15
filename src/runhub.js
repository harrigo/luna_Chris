// ================================================================= MOON CAMP (v3.06): run mode's home, Hades-style
// The title screen's world made walkable: the top of the Gruyere Globe under the purple sky, with Chris's tent and a
// fondue campfire in the middle. Walk him left/right (or tap where to go) between the stations:
//   SIGNPOST      back to the main menu (the campaign)
//   NOTICEBOARD   records: best run, runs, wins, the last run
//   LUNCHBOX      pack one starter perk for the next run (more unlock as your best run gets further)
//   CAMPFIRE      how runs work
//   FRIDGE-O-TRON trades GOLDEN CRUMBS (earned every run, kept for good) for LARDER upgrades every run starts with
//   CHEESE ROCKET launch a run
// Every run ends back here: Chris drops out of the sky by the fire and the run's summary card pops up.
const HUB_W = 1000;                      // the camp's width in sprite pixels
const HUB_ST = [
  { id: 'sign',   u: 46,  tex: 'hub_sign',   name: 'MAIN MENU',      verb: 'LEAVE CAMP' },
  { id: 'board',  u: 190, tex: 'hub_board',  name: 'NOTICEBOARD',    verb: 'READ' },
  { id: 'lunch',  u: 330, tex: 'hub_lunch',  name: 'LUNCHBOX',       verb: 'PACK' },
  { id: 'fire',   u: 492, tex: 'hub_fire0',  name: 'CAMPFIRE',       verb: 'SIT' },
  { id: 'larder', u: 690, tex: 'shopbot',    name: 'FRIDGE-O-TRON',  verb: 'TRADE CRUMBS' },
  { id: 'rocket', u: 905, tex: 'hub_rocket', name: 'CHEESE ROCKET',  verb: 'LAUNCH A RUN' }
];

function makeHubTextures(scene) {
  if (scene.textures.exists('hub_rocket')) return;
  const RED = [0xff6a5a, 0xd83a2a, 0x8a1a14], CH = [0xffe27a, 0xf2c040, 0xc08a18], ST = [0xdfe6f0, 0x9aa4b4, 0x5a6272], WD = [0xb8783a, 0x8a5222, 0x5a3212];
  // the CHEESE ROCKET: a Swiss-holed fuselage, red nose and fins, a porthole with a light in it
  pixSprite(scene, 'hub_rocket', 40, 86, a => {
    a.poly([[6, 62], [13, 50], [13, 74], [4, 80]], RED); a.poly([[34, 62], [27, 50], [27, 74], [36, 80]], RED);   // fins
    a.rrect(11, 18, 29, 76, 7, CH);                                                                             // fuselage
    a.poly([[20, 1], [29, 20], [11, 20]], RED); a.rect(11, 19, 29, 21, 0x8a1a14);                               // nose
    for (const [x, y, r] of [[15, 30, 1.6], [25, 42, 2], [16, 56, 2.2], [24, 66, 1.5], [14, 44, 1.2], [26, 29, 1.2]]) a.ell(x, y, r, r, 0xb87a10);
    a.ell(20, 36, 4.5, 4.5, ST); a.ell(20, 36, 3, 3, [0x9adfff, 0x4aa0d8, 0x1a5a8a]); a.px(19, 35, 0xffffff);     // porthole
    a.rect(16, 76, 24, 80, 0x5a6272); a.rect(17, 81, 23, 84, 0x30364a);                                         // nozzle
    a.rect(20, 22, 20, 25, 0xfff6c0);
  });
  pixSprite(scene, 'hub_pad', 64, 8, a => { a.rect(0, 2, 63, 5, ST); a.rect(4, 6, 8, 7, 0x30364a); a.rect(55, 6, 59, 7, 0x30364a); for (let x = 6; x < 60; x += 8) a.rect(x, 2, x + 3, 3, 0xffd23f); });
  // the NOTICEBOARD: cork on two posts, pinned papers
  pixSprite(scene, 'hub_board', 46, 50, a => {
    a.rect(5, 18, 8, 49, WD[2]); a.rect(37, 18, 40, 49, WD[2]);
    a.rrect(1, 2, 44, 34, 2, WD); a.rect(4, 5, 41, 31, 0xc89a5a); for (let i = 0; i < 30; i++) a.px(5 + (i * 7) % 36, 6 + (i * 5) % 24, 0xa87a3a);
    a.rect(7, 8, 18, 20, 0xf4f0e0); a.rect(9, 11, 16, 11, 0x5a6272); a.rect(9, 14, 15, 14, 0x5a6272); a.rect(9, 17, 13, 17, 0x5a6272);
    a.rect(22, 7, 38, 16, 0xffe890); a.rect(24, 10, 36, 10, 0xb87a10); a.rect(24, 13, 33, 13, 0xb87a10);
    a.rect(21, 19, 31, 29, 0xf4f0e0); a.ell(26, 24, 3, 3, [0xff9db8, 0xd8607a, 0x8a2a3a]);
    a.px(12, 8, 0xff3a3a); a.px(30, 7, 0x3a8aff); a.px(26, 19, 0xff3a3a);
  });
  // the LUNCHBOX on a red-and-white picnic blanket
  pixSprite(scene, 'hub_lunch', 40, 26, a => {
    for (let y = 18; y < 26; y++) for (let x = 0; x < 40; x++) a.px(x, y, ((x >> 2) + (y >> 2)) % 2 ? 0xf4f0e0 : 0xd83a2a);
    a.rrect(9, 6, 31, 21, 2, [0x7ab8ff, 0x3a78d8, 0x1a3a8a]); a.rect(9, 11, 31, 12, 0x1a3a8a); a.rect(18, 12, 22, 14, 0xffd23f);
    a.rect(15, 2, 25, 3, ST[1]); a.rect(15, 2, 16, 6, ST[1]); a.rect(24, 2, 25, 6, ST[1]);
    a.ell(36, 15, 3, 3, [0xffe27a, 0xf2c040, 0xc08a18]);                                                         // a stray cheese ball
  });
  // Chris's TENT
  pixSprite(scene, 'hub_tent', 76, 50, a => {
    a.poly([[38, 4], [74, 49], [2, 49]], [0xffb04a, 0xe0782a, 0x9a4a12]);
    a.poly([[38, 14], [50, 49], [26, 49]], 0x2a1410); a.poly([[38, 14], [46, 49], [38, 49]], 0x4a2418);
    a.rect(37, 0, 38, 6, 0x5a3212); a.poly([[39, 0], [47, 2], [39, 4]], 0xff3a3a);
    a.line([[38, 4], [2, 49]], 0xffd08a); a.rect(60, 46, 75, 49, 0x9a4a12);
  });
  // the CAMPFIRE: a little fondue pot on crossed logs, 4 flame frames
  for (let f = 0; f < 4; f++) pixSprite(scene, 'hub_fire' + f, 30, 34, a => {
    const k = [0, 1, 2, 1][f];
    a.poly([[2, 30], [5, 27], [28, 31], [25, 33]], WD); a.poly([[2, 31], [25, 27], [28, 30], [5, 33]], WD);
    a.poly([[6, 28], [10 - k, 14 + k], [13, 20], [15, 8 + k * 2], [18, 18], [21 + k, 12], [24, 28]], [0xffd23f, 0xff8a1a, 0xd83a0a]);
    a.poly([[11, 28], [14, 19 + k], [16, 23], [18, 17 - k], [20, 28]], 0xfff6c0);
  });
  // the SIGNPOST home
  pixSprite(scene, 'hub_sign', 34, 44, a => {
    a.rect(15, 8, 18, 43, WD[2]);
    a.poly([[1, 12], [7, 5], [31, 5], [31, 19], [7, 19]], WD); a.rect(9, 9, 27, 10, 0xf4e0b0); a.rect(9, 13, 24, 14, 0xf4e0b0);
  });
  pixSprite(scene, 'hub_crumb', 10, 9, a => { a.poly([[1, 6], [4, 1], [9, 3], [8, 8], [3, 8]], [0xfff0a0, 0xffc83a, 0xb87a10]); a.px(4, 4, 0xffffff); });
}

class RunHubScene extends Phaser.Scene {
  constructor() { super('runhub'); }
  init(data) { this.sum = (data && data.sum) || null; }
  create() {
    if (typeof Run !== 'undefined' && Run.on) Run.restore(this.registry);
    makeTextures(this); makeLevelTextures(this); makeShopTextures(this); makePowerupTextures(this); makeChrisTextures(this); makeHubTextures(this);
    Sound.init(); Sound.music('title');
    this.cameras.main.setBackgroundColor('#070a26').fadeIn(400, 0, 0, 0);
    this.t = 0; this.rigA = 1; this.panel = null; this.coolT = 0.3; this.going = false; this.camX = null; this.tgt = null;
    this.stars = []; for (let i = 0; i < 140; i++) this.stars.push({ x: Math.random(), y: Math.random() * 0.7, s: Math.random() < 0.15 ? 2 : 1, tw: Math.random() * 6, c: [0xffffff, 0xffe8b0, 0xb8d0ff][i % 3] });
    this.craters = []; for (let i = 0; i < 26; i++) this.craters.push({ u: Math.random() * (HUB_W + 200) - 100, d: 6 + Math.random() * 40, r: 4 + Math.random() * 10 });
    this.sky = this.add.graphics().setDepth(0);
    // the run's planets hanging in the sky, far off (parallax): where the rocket goes
    this.far = [];
    [[2, 0.08, 0.14, 13], [5, 0.3, 0.07, 9], [4, 0.52, 0.2, 11], [7, 0.7, 0.1, 15], [3, 0.9, 0.26, 10], [6, 1.08, 0.12, 8]].forEach(([id, fx, fy, r]) => {
      const key = LEVELS[id] && LEVELS[id].ocean && this.textures.exists('oceanglobe') ? 'oceanglobe' : 'surf' + id;
      if (!this.textures.exists(key)) return;
      this.far.push({ fx, fy, r, img: this.add.image(0, 0, key).setDepth(0.2).setAlpha(0.85), sh: this.textures.exists('map_shade') ? this.add.image(0, 0, 'map_shade').setDepth(0.21) : null });
    });
    this.ground = this.add.graphics().setDepth(1);
    this.tent = this.add.image(0, 0, 'hub_tent').setOrigin(0.5, 1).setDepth(1.5);
    this.pad = this.add.image(0, 0, 'hub_pad').setOrigin(0.5, 1).setDepth(1.6);
    this.ship = this.add.image(0, 0, 'shopship').setOrigin(0.5, 1).setDepth(1.4);
    this.st = HUB_ST.map(d => Object.assign({}, d, { spr: this.add.image(0, 0, d.tex).setOrigin(0.5, 1).setDepth(d.id === 'rocket' ? 1.7 : 2) }));
    this.glow = this.add.image(0, 0, 'puff').setDepth(1.3).setBlendMode(Phaser.BlendModes.ADD).setTint(0xff8a2a).setAlpha(0.35);
    this.labels = this.st.map(() => this.add.text(0, 0, '', RUN_UI.f(8, '#c9cde0', { strokeThickness: 3 })).setOrigin(0.5, 0).setDepth(4));
    this.prompt = this.add.text(0, 0, '', RUN_UI.f(9, '#ffd23f')).setOrigin(0.5, 1).setDepth(4.5);
    this.bubble = this.add.text(0, 0, '', RUN_UI.f(7, '#1a1020', { stroke: '#ffffff', strokeThickness: 0, backgroundColor: '#f4f0e0', padding: { x: 6, y: 5 }, align: 'center', wordWrap: { width: 170 } })).setOrigin(0.5, 1).setDepth(4.6).setVisible(false);
    // the HUD: crumbs, title, best run
    this.hud = this.add.container(0, 0).setDepth(6);
    this.rig = new ChrisRig(this); this.rig.root.setDepth(3); this.rig.setWeapon(runGun());
    this.P = { h: 0, floor: 0, vh: 0, vx: 0, thrusting: false, firing: 0, aimA: 0, power: 0, duck: false, facing: 1 };
    this.u = this.sum ? 455 : 110;
    if (this.sum) { this.P.h = 520; this.P.vh = -200; this.P.thrusting = false; }          // back from a run: he drops in by the fire
    this.fridgeLine = this.pickLine();
    this.layout(); this.scale.on('resize', this.layout, this); this.events.once('shutdown', () => this.scale.off('resize', this.layout, this));
    // input
    const kb = this.input.keyboard;
    this.keys = kb ? kb.addKeys('LEFT,RIGHT,A,D,UP,W,E,ENTER,SPACE,Z') : null;
    if (kb) {
      kb.on('keydown', e => { if (this.card) { this.closeCard(); return; } if (this.panel || this.coolT > 0) return;
        if (['ArrowUp', 'w', 'W', 'e', 'E', 'Enter'].includes(e.key)) this.use();
        else if ([' ', 'z', 'Z'].includes(e.key)) this.jump(); });
    }
    const padOff = Pad.on(b => { if (this.card) { if (b === 'a' || b === 'b') this.closeCard(); return; } if (this.panel || this.coolT > 0) return;
      if (b === 'a' || b === 'up') { if (this.near()) this.use(); else if (b === 'a') this.jump(); } else if (b === 'x') this.jump(); });
    this.events.once('shutdown', padOff);
    this.input.on('pointerup', p => {
      if (this.card) { this.closeCard(); return; }
      if (this.panel || this.coolT > 0 || this.going) return;
      const wx = p.x + this.camX;
      const hit = this.st.find(s => { const b = s.spr.getBounds(); return p.x >= b.x - 8 && p.x <= b.right + 8 && p.y >= b.y - 8 && p.y <= b.bottom + 14; });
      if (hit) this.tgt = { u: hit.u + (hit.id === 'rocket' ? -26 : hit.id === 'larder' ? -34 : 0), st: hit };
      else this.tgt = { u: Math.max(20, Math.min(HUB_W - 20, wx / this.z)), st: null };
    });
    if (this.sum) this.time.delayedCall(1300, () => this.showCard());
    else this.time.delayedCall(700, () => this.say(this.st.find(s => s.id === 'larder'), this.fridgeLine, 4));
  }

  // ---- geometry: the camp sits on a huge, gently curved moon; positions are in sprite pixels (u) x zoom
  layout() {
    const W = this.scale.width, H = this.scale.height;
    this.z = Math.max(1.4, Math.min(3, Math.round(H / 200 * 2) / 2));
    this.WW = HUB_W * this.z; this.top = H * 0.76; this.RR = this.WW * 5;
    for (const s of this.st) s.spr.setScale(this.z * (s.id === 'larder' ? 0.62 : s.id === 'fire' ? 1.3 : 1));
    this.tent.setScale(this.z); this.pad.setScale(this.z); this.ship.setScale(this.z * 0.75);
    this.glow.setScale(this.z * 2.4);
    this.buildHud();
  }
  gy(wx) { const dx = wx - this.WW / 2; return this.top + this.RR - Math.sqrt(Math.max(0, this.RR * this.RR - dx * dx)); }
  slope(wx) { const dx = wx - this.WW / 2; return Math.atan2(dx, Math.sqrt(Math.max(1, this.RR * this.RR - dx * dx))); }
  buildHud() {
    const W = this.scale.width, f = RUN_UI.f;
    this.hud.removeAll(true);
    this.hud.add(this.add.image(16, 16, 'hub_crumb').setScale(2));
    this.crumbT = this.add.text(30, 16, String(Meta.crumbs()), f(10, '#ffd23f')).setOrigin(0, 0.5); this.hud.add(this.crumbT);
    this.hud.add(this.add.text(30, 30, 'GOLDEN CRUMBS', f(6, '#c9cde0', { strokeThickness: 3 })).setOrigin(0, 0.5));
    this.hud.add(this.add.text(W / 2, 10, 'MOON CAMP', f(Math.min(18, W / 34), '#ffd23f', { stroke: '#5a0a0a', strokeThickness: 5 })).setOrigin(0.5, 0));
    const b = Run.best(), kit = Meta.kit();
    this.hud.add(this.add.text(W - 12, 12, 'BEST RUN ' + (b ? b.planets + '/' + RUN_ROUTE.length : '-'), f(8, '#e8ecf8', { strokeThickness: 3 })).setOrigin(1, 0));
    this.hud.add(this.add.text(W - 12, 26, 'PACKED: ' + kit.name, f(6, '#9aa4c8', { strokeThickness: 3 })).setOrigin(1, 0));
  }
  pickLine() {
    const S = this.sum, P = (a) => a[Math.floor(Math.random() * a.length)];
    if (!S) return Meta.stats().runs ? P(['BACK FOR MORE? CRUMBS ARE CRUMBS, CHEF.', 'THE LARDER IS STOCKED. YOUR POCKETS?', 'I SELL THINGS THAT LAST. UNLIKE YOU.']) :
      'WELCOME TO CAMP! GO OUT, GET GRATED, BRING ME GOLDEN CRUMBS.';
    if (S.how === 'won') return 'A LEGEND! NOW SPEND, SPEND, SPEND!';
    if (S.how === 'quit') return 'GAVE UP? THE CRUMBS STILL COUNT.';
    return P(['GRATED AGAIN? HAPPENS TO THE BEST CHEESES.', 'OUCH. STILL, CRUMBS ARE CRUMBS.', 'YOU SMELL OF RAT. TRADE?', 'DEATH IS JUST A LONG NAP. SPEND!']);
  }
  say(st, text, secs) { if (!st) return; this.bubbleSt = st; this.bubble.setText(text).setVisible(true); this.bubbleT = secs || 3.5; }

  // ---- moving about
  near() {
    let best = null, bd = 1e9;
    for (const s of this.st) { const d = Math.abs(s.u - this.u) - (s.id === 'rocket' || s.id === 'larder' ? 22 : 0); if (d < bd) { bd = d; best = s; } }
    return bd < 34 ? best : null;
  }
  jump() { if (this.P.h <= 0 && !this.going) { this.P.vh = 380; Sound.sfx('jump'); } }
  use(st) {
    st = st || this.near(); if (!st || this.panel || this.going) return;
    this.tgt = null; this.P.vx = 0; Sound.sfx('pickup');
    ({ sign: () => this.leave(), board: () => this.openBoard(), lunch: () => this.openLunch(), fire: () => this.openFire(), larder: () => this.openLarder(), rocket: () => this.openRocket() })[st.id]();
  }
  openPanel(title, items, w) {
    this.closePanel(true);
    this.panel = makeMenu(this, { items, title, minWidth: w || 300, depth: 40, onBack: () => this.closePanel() });
  }
  closePanel(quiet) { if (!this.panel) return; this.panel.destroy(); this.panel = null; this.coolT = 0.3; if (!quiet) Sound.sfx('jump'); this.buildHud(); }

  // ---- the stations
  leave() { if (this.going) return; this.going = true; this.cameras.main.fadeOut(300, 0, 0, 0); this.time.delayedCall(330, () => this.scene.start('menu')); }
  openBoard() {
    const I = (text, color) => ({ info: true, text, color }), st = Meta.stats(), b = Run.best(), last = Meta._j('lc_run_last', null);
    const lastTxt = !last ? 'NO RUNS YET' : last.how === 'won' ? 'WON THE LOT!' : last.how === 'quit' ? 'GAVE UP AFTER ' + last.planets + ' PLANET' + (last.planets === 1 ? '' : 'S') :
      'GRATED ON ' + ((LEVELS[last.at] && (LEVELS[last.at].short || LEVELS[last.at].name)) || 'A ROCK');
    this.openPanel('NOTICEBOARD', [
      I('BEST RUN: ' + (b ? b.planets + '/' + RUN_ROUTE.length + ' PLANETS, ' + b.score : '-'), '#ffd23f'),
      I('RUNS ' + st.runs + '   WINS ' + st.wins), I('PLANETS CLEARED ' + st.planets + '   RATS ' + st.kills),
      I('LAST RUN: ' + lastTxt, '#ff9db8'), I(''),
      I('NEW LUNCHES UNLOCK AS YOUR BEST RUN GETS FURTHER', '#9aa4c8'),
      { label: () => 'BACK', act: () => this.closePanel() }]);
  }
  openLunch() {
    const cur = () => Meta.kit().id;
    const build = () => KITS.map(k => Meta.kitOk(k) ? [
      { info: true, text: k.desc, color: '#9aa4c8' },
      { label: () => (cur() === k.id ? '* ' : '') + k.name + (cur() === k.id ? ' *' : ''), act: () => { Meta.setKit(k.id); Sound.sfx('power'); this.panel.setItems(build()); } }] : [{ info: true, text: '??? - REACH PLANET ' + (k.need + 1) + ' IN A RUN', color: '#5a6290' }]).flat()
      .concat([{ label: () => 'DONE', act: () => this.closePanel() }]);
    this.openPanel('PACK A LUNCH', build(), 320);
  }
  openFire() {
    const I = (text, color) => ({ info: true, text, color });
    this.P.duck = true; this.time.delayedCall(1200, () => { this.P.duck = false; });
    this.openPanel('THE CAMPFIRE', [
      I('A RUN IS FIVE PLANETS ON ONE LIFE.', '#ffffff'), I('THREE WAVES AND A BOSS ON EACH.'), I('BEAT A BOSS: PICK A PERK. FORKS: PICK A PLANET.'),
      I('CHEDDAR AND PERKS ARE FOR THAT RUN ONLY.'), I('GOLDEN CRUMBS COME HOME WITH YOU, WIN OR LOSE:', '#ffd23f'),
      I('8 A PLANET, 1 PER 10 RATS, 1 PER 50 CHEDDAR.', '#ffd23f'), I('GUNS YOU FIND IN THE CAMPAIGN COME TOO.', '#9aa4c8'),
      { label: () => 'BACK', act: () => this.closePanel() }], 340);
  }
  openLarder() {
    this.say(this.st.find(s => s.id === 'larder'), 'WHAT ARE YOU BUYING?', 2.5);
    const build = () => [{ info: true, text: 'YOU HAVE ' + Meta.crumbs() + ' GOLDEN CRUMBS', color: '#ffd23f' }].concat(LARDER.map(u => {
      const lv = Meta.lv(u.id), max = lv >= u.cost.length, c = u.cost[lv];
      return [{ info: true, text: u.desc, color: '#9aa4c8' }, { label: () => u.name + ' ' + (u.cost.length > 1 ? lv + '/' + u.cost.length + ' ' : '') + (max ? '- OWNED' : '- ' + c), act: () => {
        if (max) { Sound.sfx('clunk'); return; }
        if (!Meta.buy(u)) { Sound.sfx('zing'); this.cameras.main.shake(90, 0.004); this.say(this.st.find(s => s.id === 'larder'), 'NOT ENOUGH CRUMBS. THAT IS ' + c + '.', 2.5); return; }
        Sound.sfx('power'); this.cameras.main.flash(120, 255, 230, 160); this.say(this.st.find(s => s.id === 'larder'), ['PLEASURE DOING BUSINESS.', 'NO REFUNDS.', 'A FINE CHOICE.'][Math.floor(Math.random() * 3)], 2.5);
        this.panel.setItems(build()); this.crumbT.setText(String(Meta.crumbs()));
      } }];
    }).flat()).concat([{ label: () => 'DONE', act: () => this.closePanel() }]);
    this.openPanel("FRIDGE-O-TRON'S LARDER", build(), 340);
  }
  openRocket() {
    const I = (text, color) => ({ info: true, text, color }), L = Meta.larder(), kit = Meta.kit();
    const perks = [kit.perk ? 'LUNCH: ' + kit.name : 'LUNCH: NOTHING PACKED'];
    if (L.hearty) perks.push('+' + L.hearty + ' HEART'); if (L.purse) perks.push('+' + 40 * L.purse + ' CHEDDAR'); if (L.rind) perks.push('BLACK RIND'); if (L.toque) perks.push(L.toque + ' SPARE TOQUE');
    this.openPanel('LAUNCH A RUN?', [I('ONE LIFE. FIVE PLANETS.', '#ffffff'), I(perks.slice(0, 1).join(''), '#ffd23f')].concat(perks.length > 1 ? [I(perks.slice(1).join('  '), '#9aa4c8')] : [])
      .concat([{ label: () => 'BLAST OFF!', act: () => { this.closePanel(true); this.launch(); } }, { label: () => 'NOT YET', act: () => this.closePanel() }]), 300);
  }
  launch() {
    if (this.going) return; this.going = true; this.tgt = null;
    const R = this.st.find(s => s.id === 'rocket');
    Sound.sfx('wave');
    this.tweens.add({ targets: this, rigA: 0, duration: 250 });                       // he climbs in
    this.launchT = 0; this.launchR = R;
    this.time.delayedCall(2300, () => {
      this.cameras.main.fadeOut(400, 255, 240, 200);
      this.time.delayedCall(450, () => { Run.start(this.registry); this.scene.start('runpick', { phase: 'route' }); });
    });
  }

  // ---- the run's summary card, when he lands back at camp
  showCard() {
    const S = this.sum; if (!S || this.card) return;
    const W = this.scale.width, H = this.scale.height, f = RUN_UI.f, c = this.add.container(0, 0).setDepth(50);
    const small = H < 430, w = Math.min(W - 30, 460), h = Math.min(H - 30, small ? 300 : 340), x = (W - w) / 2, y = (H - h) / 2;
    c.add(this.add.rectangle(0, -H, W, H * 3, 0x000000, 0.45).setOrigin(0));
    const g = this.add.graphics(); c.add(g);
    const title = S.how === 'won' ? 'RUN COMPLETE!' : S.how === 'quit' ? 'RUN ABANDONED' : 'GRATED!';
    c.add(this.add.text(W / 2, y + 12, title, f(small ? 18 : 22, S.how === 'won' ? '#ffd23f' : '#ff7a5a', { strokeThickness: 6 })).setOrigin(0.5, 0));
    const atL = LEVELS[S.at], sub = S.how === 'won' ? 'Five planets, one life. Bessie salutes you.' : S.how === 'quit' ? 'Chris heads back to camp for a nap.' : 'The run ended on ' + ((atL && (atL.short || atL.name)) || 'a cold rock') + '.';
    c.add(this.add.text(W / 2, y + (small ? 40 : 46), sub, f(7, '#e8ecf8', { strokeThickness: 3 })).setOrigin(0.5, 0));
    const n = RUN_ROUTE.length, gap = Math.min(54, (w - 40) / n), py = y + (small ? 76 : 88);
    const pg = this.add.graphics(); c.add(pg);
    for (let i = 0; i < n; i++) {
      const px = W / 2 + (i - (n - 1) / 2) * gap, id = (S.done || [])[i];
      if (id) for (const o of RUN_UI.planetImg(this, id, px, py, 15)) c.add(o);
      else { pg.lineStyle(2, 0x3a4270, 1).strokeCircle(px, py, 15); c.add(this.add.text(px, py, '?', f(9, '#3a4270', { strokeThickness: 0 })).setOrigin(0.5)); }
    }
    const mm = Math.floor((S.time || 0) / 60), ss = String(Math.floor((S.time || 0) % 60)).padStart(2, '0');
    const lines = ['PLANETS ' + (S.planets || 0) + '/' + n + '     SCORE ' + (S.score || 0), 'RATS ' + (S.kills || 0) + '     CHEDDAR ' + (S.earned || 0) + '     TIME ' + mm + ':' + ss];
    let ly = py + 28; for (const l of lines) { c.add(this.add.text(W / 2, ly, l, f(8, '#ffffff', { strokeThickness: 3 })).setOrigin(0.5, 0)); ly += small ? 15 : 18; }
    if (S.newBest) { c.add(this.add.text(W / 2, ly, 'NEW BEST RUN!', f(9, '#7dff8a', { strokeThickness: 3 })).setOrigin(0.5, 0)); ly += small ? 16 : 20; }
    const pk = S.perks || [];
    if (pk.length) { const pw = 26, x0 = W / 2 - (pk.length - 1) * pw / 2; pk.forEach((id, i) => { const p = RUN_PERKS.find(q => q.id === id); if (p) c.add(RUN_UI.fit(this.add.image(x0 + i * pw, ly + 10, RUN_UI.iconFor(this, p)), 20)); }); ly += 26; }
    // the crumbs, counting up
    const cr = this.add.image(W / 2 - 54, ly + 12, 'hub_crumb').setScale(2.5); c.add(cr);
    const ct = this.add.text(W / 2 - 38, ly + 12, '+0 GOLDEN CRUMBS', f(10, '#ffd23f')).setOrigin(0, 0.5); c.add(ct);
    const got = S.crumbs || 0, before = Meta.crumbs() - got;
    this.tweens.addCounter({ from: 0, to: got, duration: Math.min(1400, 200 + got * 30), delay: 400, onUpdate: tw => { const v = Math.round(tw.getValue()); ct.setText('+' + v + ' GOLDEN CRUMBS'); if (this.crumbT) this.crumbT.setText(String(before + v)); }, onComplete: () => Sound.sfx('power') });
    const hh = Math.min(h, ly + 58 - y); RUN_UI.panel(g, x, y, w, hh, 0xc9cde0, 0x151b40); c.y = (h - hh) / 2;
    c.add(this.add.text(W / 2, y + hh - 12, 'TAP TO GO BACK TO CAMP', f(7, '#9aa4c8', { strokeThickness: 3 })).setOrigin(0.5, 1));
    c.setAlpha(0); this.tweens.add({ targets: c, alpha: 1, duration: 250 });
    this.card = c; this.cardT = 0;
    Sound.sfx(S.how === 'won' ? 'reveal' : 'clunk');
  }
  closeCard() { if (!this.card || this.cardT < 0.8) return; const c = this.card; this.card = null; this.coolT = 0.3; this.tweens.add({ targets: c, alpha: 0, duration: 200, onComplete: () => c.destroy() }); this.buildHud(); this.time.delayedCall(500, () => this.say(this.st.find(s => s.id === 'larder'), this.fridgeLine, 4)); }

  update(time, dms) {
    const dt = Math.min(0.05, dms / 1000); this.t += dt; if (this.card) this.cardT += dt;
    this.coolT = Math.max(0, this.coolT - dt);
    const W = this.scale.width, H = this.scale.height, z = this.z, P = this.P, t = this.t;
    // -- walking
    let dir = 0;
    if (!this.panel && !this.card && !this.going) {
      const k = this.keys;
      if (k && (k.LEFT.isDown || k.A.isDown)) dir = -1; else if (k && (k.RIGHT.isDown || k.D.isDown)) dir = 1;
      if (Pad.state.left) dir = -1; else if (Pad.state.right) dir = 1;
      if (dir) this.tgt = null;
      else if (this.tgt) { const d = this.tgt.u - this.u; if (Math.abs(d) < 3) { const st = this.tgt.st; this.tgt = null; if (st) this.use(st); } else dir = Math.sign(d); }
    }
    P.vx = dir * 150; if (dir) P.facing = dir;
    this.u = Math.max(18, Math.min(HUB_W - 18, this.u + dir * 118 * dt));
    if (P.h > 0 || P.vh > 0) { P.vh -= 1100 * dt; P.h = Math.max(0, P.h + P.vh * dt); if (P.h === 0) { if (P.vh < -500) { this.cameras.main.shake(160, 0.008); Sound.sfx('clunk'); this.burstDust(); } P.vh = 0; } }
    // -- camera
    const wx = this.u * z, want = Math.max(Math.min(0, (this.WW - W) / 2), Math.min(Math.max(0, this.WW - W), wx - W / 2));
    this.camX = this.camX === null ? want : this.camX + (want - this.camX) * Math.min(1, dt * 5);
    const cx = this.camX;
    // -- the sky (as on the title screen)
    const g = this.sky; g.clear();
    const bands = [0x070a26, 0x0b1036, 0x111546, 0x1a1a56, 0x261c62, 0x34206a];
    bands.forEach((c, i) => g.fillStyle(c, 1).fillRect(0, Math.floor(H * i / bands.length), W, Math.ceil(H / bands.length) + 1));
    for (const s of this.stars) { const sx = ((s.x * W * 1.3 - cx * 0.05) % (W * 1.3) + W * 1.3) % (W * 1.3); g.fillStyle(s.c, 0.35 + 0.55 * Math.abs(Math.sin(t * 1.3 + s.tw))).fillRect(Math.round(sx), Math.round(s.y * H), s.s, s.s); }
    for (const p of this.far) { const px = p.fx * W * 1.2 - cx * 0.12, py = p.fy * H + Math.sin(t * 0.3 + p.fx * 9) * 2, r = p.r * z * 0.7; p.img.setPosition(px, py).setDisplaySize(r * 2, r * 2); if (p.sh) p.sh.setPosition(px, py).setDisplaySize(r * 2 + 1, r * 2 + 1); }
    { const px = W * 0.86 - cx * 0.08, py = H * 0.44, pr = Math.max(14, H * 0.055);                      // the ringed planet
      g.lineStyle(3, 0x8a6ab8, 0.5).strokeEllipse(px, py, pr * 3.4, pr * 0.9);
      g.fillStyle(0x6a4a9a, 1).fillCircle(px, py, pr); g.fillStyle(0x8a6ab8, 1).fillCircle(px - pr * 0.25, py - pr * 0.25, pr * 0.7); g.fillStyle(0x4a3478, 1).fillCircle(px + pr * 0.35, py + pr * 0.35, pr * 0.45);
      g.lineStyle(3, 0xb89ae0, 0.8).beginPath(); g.arc(px, py, pr * 1.7, 0.1, Math.PI - 0.1, false); g.strokePath(); }
    // -- the moon: one big cheese curve
    const G = this.ground; G.clear();
    const mx = this.WW / 2 - cx, my = this.top + this.RR, R = this.RR;
    G.fillStyle(0xffd23f, 0.08).fillCircle(mx, my, R + 26); G.fillStyle(0xffd23f, 0.12).fillCircle(mx, my, R + 12);
    G.fillStyle(0x7a4a10, 1).fillCircle(mx, my, R + 3); G.fillStyle(0xe0a628, 1).fillCircle(mx, my, R); G.fillStyle(0xf2c040, 1).fillCircle(mx, my - 6, R - 4); G.fillStyle(0xffd860, 1).fillCircle(mx - 4, my - 10, R - 14);
    for (const c of this.craters) { const x = c.u * z - cx; if (x < -40 || x > W + 40) continue; const y = this.gy(c.u * z) + c.d * z * 0.5 + 8, r = c.r * z;
      if (y - r > H) continue; G.fillStyle(0xa86a10, 1).fillEllipse(x, y, r * 2 + 2, r * 0.8); G.fillStyle(0x7a4a08, 1).fillEllipse(x, y - r * 0.12, r * 1.6 + 1, r * 0.5); G.fillStyle(0xffe890, 0.8).fillEllipse(x, y + r * 0.32, r * 1.4, r * 0.18); }
    // -- props and stations (sat on the curve, leaning with it)
    const sit = (spr, u, sink) => { const x = u * z; spr.setPosition(Math.round(x - cx), Math.round(this.gy(x) + (sink || 2) * z)).setRotation(this.slope(x)); };
    sit(this.tent, 455, 2); sit(this.ship, 742, 4);
    for (const s of this.st) {
      if (s.id === 'fire') s.spr.setTexture('hub_fire' + (Math.floor(t * 8) % 4));
      if (s.id === 'rocket') {
        if (this.going && this.launchR === s) {
          this.launchT += dt; const lt = this.launchT;
          const shake = lt < 0.9 ? Math.sin(lt * 90) * z * Math.min(1, lt * 2) : 0, lift = lt > 0.9 ? Math.pow(lt - 0.9, 2) * 420 * z : 0;
          sit(s.spr, s.u, 3); s.spr.x += shake; s.spr.y -= lift;
          if (lt > 0.4 && Math.random() < dt * 40) this.puff(s.spr.x + rnd(-6, 6) * z, s.spr.y + 2 * z, lt > 0.9);
          if (lt > 0.9 && !this.boomed) { this.boomed = true; this.cameras.main.shake(700, 0.012); Sound.sfx('power'); }
        } else sit(s.spr, s.u, 3);
      } else sit(s.spr, s.u, s.id === 'lunch' ? 3 : 2);
    }
    sit(this.pad, 905, 1);
    { const f = this.st.find(s => s.id === 'fire'); this.glow.setPosition(f.spr.x, f.spr.y - 10 * z).setAlpha(0.28 + 0.08 * Math.sin(t * 9) + 0.05 * Math.sin(t * 23)); }
    // -- Chris
    const x = this.u * z, y = this.gy(x) + 2 * z;
    this.rig.update(P, dt, Math.round(x - cx), Math.round(y - P.h * z * 0.55), z * 0.5, this.rigA, Math.floor(t * 10) % 4);
    this.rig.root.setRotation(this.slope(x));
    // -- labels and the use prompt
    const nr = (!this.panel && !this.card && !this.going) ? this.near() : null, dev = inputDevice();
    this.st.forEach((s, i) => { const L = this.labels[i]; L.setText(s.name).setPosition(s.spr.x, s.spr.y + 6).setColor(s === nr ? '#ffd23f' : '#9aa4c8'); });
    if (nr) {
      const b = nr.spr.getBounds();
      this.prompt.setText((dev === 'touch' ? 'TAP: ' : dev === 'pad' ? '(A) ' : '[UP] ') + nr.verb).setPosition(nr.spr.x, b.y - 6 + Math.sin(t * 5) * 2).setVisible(true);
    } else this.prompt.setVisible(false);
    // -- Fridge-o-tron's speech bubble
    if (this.bubble.visible) {
      this.bubbleT -= dt; const s = this.bubbleSt, b = s.spr.getBounds();
      this.bubble.setPosition(Math.max(95, Math.min(W - 95, s.spr.x)), b.y - (nr === s ? 22 : 6));
      if (this.bubbleT <= 0) this.bubble.setVisible(false);
    }
  }
  puff(x, y, big) {
    const p = this.add.image(x, y, 'puff').setDepth(1.65).setTint(big ? 0xffd08a : 0xdfe6f0).setAlpha(0.8).setScale(this.z * (big ? 0.9 : 0.5));
    this.tweens.add({ targets: p, x: x + rnd(-30, 30) * this.z, y: y + rnd(0, 12) * this.z, scale: p.scale * 2.4, alpha: 0, duration: rnd(500, 900), onComplete: () => p.destroy() });
  }
  burstDust() { const x = this.u * this.z - this.camX, y = this.gy(this.u * this.z) + 2 * this.z; for (let i = 0; i < 10; i++) this.puff(x + rnd(-14, 14) * this.z, y, false); }
}
