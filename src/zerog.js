// BONUS: the Zero-G Recoil Room. No gravity, no running, no jetpack: the only way to move is the kick of the gun.
// Fire one way and Chris drifts the other, like a pinball, bouncing off the walls and the cheese bumpers. Scoop up
// all the scattered cheese wheels before the clock runs out and the GUN CRATE in the middle opens: a new weapon to
// keep (Progress.gun), or an extra life once every gun is owned.
//
// Controls (v2.42: the main game's): touch = the AIM+FIRE thumbstick (put a thumb down anywhere and push: it fires the
// way you push, harder = straight away); mouse: point + click; keys: arrows/WASD fire that way; controller: right stick. Remember: you FLY AWAY from where you shoot.
// The < MAP button (top left), ESC or the controller's BACK leave at any time.
// ---- GOAL panel for the bonus levels (top left, under the MAP button): what you have to do, ticked off as you go.
// update(goals) with [{ label, frac 0..1, right: 'text', done, locked, hot }]. (No coloured edge stripes: a plain panel.)
// the bonus rooms' collectables (v2.42: CHEESE WHEELS, not 'cheese wheels'): a little truckle of cheese side-on, red wax
// rind, a wedge cut out of it so the pale paste shows (different enough from the GOLDEN wheels hidden in the levels)
function makeMiniWheel(scene) {
  if (scene.textures.exists('miniwheel_c')) return;
  pixSprite(scene, 'miniwheel_c', 22, 18, a => {
    a.ell(11, 12, 10, 5, [0xd04030, 0xa02818, 0x681008]);                      // the side of the truckle (red wax)
    a.rect(1, 7, 21, 12, [0xd04030, 0xa02818, 0x681008][1]);
    a.ell(11, 7, 10, 5, [0xfff09a, 0xffcf3a, 0xc9901a]);                       // the top: cheese
    a.poly([[11, 7], [21, 6], [19, 10]], 0xfff6c8); a.rect(17, 8, 21, 13, 0xfff09a);   // the cut wedge: pale paste
    a.px(6, 6, 0xffffff); a.px(7, 5, 0xffffff); a.px(14, 9, 0xc9901a); a.px(8, 8, 0xc9901a);
  }, true);
}
// ---- the MAC-GRINDER in the bonus rooms (v2.48): the same gun as on the planets - its level from the shop / wheel,
// the tumbling cheesy elbows, the glowing sauce ribbon - in flat x/y space. bonusMacLv(scene) = its level (1-4);
// bonusMacVolley(...) the shots for one pull of the trigger; bonusMacStep / bonusMacDraw move and draw them.
function bonusMacLv(scene) {
  const g = scene.registry.get('gunLv') || {}, chip = typeof Shop !== 'undefined' ? Shop.chip(scene.registry, 'grinder') : 0;
  return Math.max(1, Math.min(4, Math.max(g.grinder || 1, 1 + chip)));
}
function bonusMacVolley(scene, x, y, dx, dy, speed, extra, add) {   // add(img): put the sprite in the right container
  const lv = bonusMacLv(scene), out = [], ph0 = Math.random() * 6;
  const spec = lv <= 1 ? [[0, 0]] : lv === 2 ? [[0, 0], [0, Math.PI]] : [[-0.2, 0], [0, 0], [0.2, 0]];
  for (const [a, ph] of spec) {
    const c = Math.cos(a), s2 = Math.sin(a), ux = dx * c - dy * s2, uy = dx * s2 + dy * c;
    const im = scene.add.image(x, y, 'mac0').setScale(1.15); if (add) add(im);
    out.push({ x, y, bx: x, by: y, vx: ux * speed + (extra ? extra.x : 0), vy: uy * speed + (extra ? extra.y : 0), px: -uy, py: ux, ph: ph0 + ph, helix: lv === 2,
      age: 0, im, tr: [], pierce: lv >= 4 ? 2 : 0, hit: [] });
  }
  return out;
}
function bonusMacStep(s, dt) {                                   // move one shot (the twin helix winds round its path)
  s.age += dt; s.bx += s.vx * dt; s.by += s.vy * dt;
  const w = s.helix ? Math.sin(s.age * 30 + s.ph) * 8 : Math.sin(s.age * 38 + s.ph) * 2.5;
  s.x = s.bx + s.px * w; s.y = s.by + s.py * w;
  s.im.setPosition(s.x, s.y).setTexture('mac' + (Math.floor(s.age * 20 + s.ph) % 3)).setRotation(Math.atan2(s.vy, s.vx));
  s.tr.unshift(s.x, s.y); if (s.tr.length > 14) s.tr.length = 14;
}
function bonusMacDraw(g, shots) {                               // the sauce ribbons (on an additive graphics layer)
  for (const s of shots) {
    const t = s.tr; if (t.length < 4) continue;
    g.fillStyle(0xff8a1a, 0.16).fillCircle(t[0], t[1], 11); g.fillStyle(0xffd060, 0.2).fillCircle(t[0], t[1], 6);
    for (let i = 1, n = t.length / 2; i < n; i++) {
      const k = 1 - i / n;
      g.lineStyle(Math.max(1.5, 10 * k), 0xff6a08, 0.6 * k).lineBetween(t[i * 2 - 2], t[i * 2 - 1], t[i * 2], t[i * 2 + 1]);
      g.lineStyle(Math.max(1, 4.5 * k), 0xffc840, 0.8 * k).lineBetween(t[i * 2 - 2], t[i * 2 - 1], t[i * 2], t[i * 2 + 1]);
    }
  }
}
// v2.50: PC mouse in the bonus rooms, like the planets: a real mouse switches on aim-at-cursor with the chunky pixel crosshair
class MouseCursor {
  constructor(scene) {
    this.s = scene; this.on = false; this.g = scene.add.graphics().setScrollFactor(0).setDepth(40);
    if (scene.input.mouse) scene.input.mouse.disableContextMenu();
    scene.input.on('pointermove', p => { if (!p.wasTouch && p === scene.input.manager.mousePointer) this.on = true; });
    scene.input.on('pointerdown', p => { if (p.wasTouch) this.on = false; });
    scene.events.once('shutdown', () => { if (scene.game.canvas) scene.game.canvas.style.cursor = ''; });
  }
  get ptr() { return this.s.input.manager.mousePointer; }
  draw(show, firing) {
    const g = this.g, vis = this.on && show; g.clear();
    if (this.s.game.canvas) this.s.game.canvas.style.cursor = vis ? 'none' : '';
    if (!vis) return;
    const m = this.ptr, x = Math.round(m.x), y = Math.round(m.y);
    g.fillStyle(0x1a1020, 1);
    for (const [rx, ry, rw, rh] of [[-10, -2, 6, 4], [5, -2, 6, 4], [-2, -10, 4, 6], [-2, 5, 4, 6]]) g.fillRect(x + rx, y + ry, rw, rh);
    g.fillStyle(firing ? 0xffd23f : 0xffffff, 1);
    for (const [rx, ry, rw, rh] of [[-9, -1, 4, 2], [6, -1, 4, 2], [-1, -9, 2, 4], [-1, 6, 2, 4], [-1, -1, 2, 2]]) g.fillRect(x + rx, y + ry, rw, rh);
  }
}
class GoalHud {
  constructor(scene) { this.s = scene; this.g = scene.add.graphics().setScrollFactor(0).setDepth(20); this.rows = []; this.title = null; }
  update(goals, x, y) {
    const s = this.s, g = this.g, rowH = 20, w = Math.min(176, s.scale.width * 0.3), h = 20 + goals.length * rowH;
    x = x === undefined ? 10 : x; y = y === undefined ? 48 : y;
    const tf = (c) => ({ fontFamily: PIXEL, fontSize: '7px', color: c, stroke: '#0a0c14', strokeThickness: 2 });
    if (!this.title) this.title = s.add.text(0, 0, 'GOAL', tf('#ffd23f')).setScrollFactor(0).setDepth(20.5);
    this.title.setPosition(x + 8, y + 6);
    g.clear(); g.fillStyle(0x0a0c14, 0.62).fillRoundedRect(x, y, w, h, 6);
    goals.forEach((q, i) => {
      if (!this.rows[i]) this.rows[i] = { l: s.add.text(0, 0, '', tf('#ffffff')).setScrollFactor(0).setDepth(20.5), r: s.add.text(0, 0, '', tf('#ffffff')).setOrigin(1, 0).setScrollFactor(0).setDepth(20.5) };
      const R = this.rows[i], ry = y + 19 + i * rowH, flash = q.hot && Math.floor(s.t * 4) % 2;
      const col = q.done ? '#7dff8a' : q.locked ? '#6a6a80' : flash ? '#ffd23f' : '#ffffff';
      g.fillStyle(0x1a1020, 1).fillRect(x + 8, ry, 11, 11);
      g.fillStyle(q.done ? 0x3aa040 : q.locked ? 0x2a2a3a : 0x3a3048, 1).fillRect(x + 9, ry + 1, 9, 9);
      if (q.done) { g.fillStyle(0xffffff, 1).fillRect(x + 10, ry + 5, 2, 2).fillRect(x + 12, ry + 7, 2, 2).fillRect(x + 14, ry + 5, 2, 2).fillRect(x + 16, ry + 3, 2, 2); }
      R.l.setText(q.label).setColor(col).setPosition(x + 25, ry);
      R.r.setText(q.right || '').setColor(col).setPosition(x + w - 8, ry);
      if (q.frac !== undefined && !q.locked) {
        const bx = x + 25, bw = w - 33;
        g.fillStyle(0x2a2a3a, 1).fillRect(bx, ry + 11, bw, 3);
        g.fillStyle(q.done ? 0x7dff8a : 0xffb03a, 1).fillRect(bx, ry + 11, bw * Math.max(0, Math.min(1, q.frac)), 3);
      }
    });
  }
}

class ZeroGScene extends Phaser.Scene {
  constructor() { super('zerog'); }

  drawStick() {                                           // the AIM+FIRE stick, as in the main game: a ghost at rest bottom right, live where the thumb is
    if (!this.stickG) { this.stickG = this.add.graphics().setScrollFactor(0).setDepth(22); this.stickLbl = this.add.text(0, 0, 'AIM + FIRE', { fontFamily: PIXEL, fontSize: '8px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0).setDepth(23); }
    const g = this.stickG; g.clear();
    const show = this.isTouch && !(this.curs && this.curs.on) && !(Pad.state.connected && typeof LAST_INPUT !== 'undefined' && LAST_INPUT !== 'touch') && !this.done;
    this.stickLbl.setVisible(show); if (!show) return;
    const W = this.scale.width, H = this.scale.height, r = 52, live = this.aimS, bx = live ? live.ox : W - 120, by = live ? live.oy : H - 86;
    this.stickLbl.setPosition(W - 120, H - 86 + 64).setAlpha(live ? 0.3 : 1);
    g.fillStyle(0xffffff, live ? 0.12 : 0.06).fillCircle(bx, by, r);
    g.lineStyle(3, 0xffffff, live ? 0.6 : 0.25).strokeCircle(bx, by, r);
    const kx = bx + (live ? live.vx * r * 0.75 : 0), ky = by + (live ? live.vy * r * 0.75 : 0);
    g.fillStyle(0xffffff, live ? 0.5 : 0.18).fillCircle(kx, ky, r * 0.42);
    g.lineStyle(2, 0x1a1020, live ? 0.6 : 0.2).strokeCircle(kx, ky, r * 0.42);
  }
  create(data) {
    buildAllTextures(this); makeMiniWheel(this);
    // three rooms share this scene: after level 3, after level 6, and on the warp route (each its own layout and colours)
    this.room = (data && data.room) || this.room || 'zerog';
    const V = this.V = ({
      zerog: { title: 'ZERO-G RECOIL ROOM', time: 30, bg: '#05061a', music: 'level6', zap: [[430, 450, 130, 0.9]], mines: 3,
        bumpers: [[300, 260, 46], [760, 420, 62, 0, 0], [1200, 250, 46], [420, 680, 40, 90, 0.5], [1120, 660, 50, 70, 0.7], [760, 130, 30], [760, 780, 30]] },
      zerog2: { title: 'ZERO-G ROOM II', time: 28, bg: '#0a0516', music: 'level9', zap: [[420, 450, 130, -1.1], [1100, 450, 130, 1.1]], mines: 4,
        bumpers: [[250, 450, 50, 120, 0.6], [560, 220, 40], [560, 680, 40], [960, 220, 40], [960, 680, 40], [1260, 450, 50, 120, 0.7], [760, 450, 36, 160, 0.9]] },
      zerog3: { title: 'WARP BONUS ROOM', time: 25, bg: '#160608', music: 'level55', zap: [[560, 450, 120, 0.9], [960, 450, 120, -0.9]], mines: 5, wind: true,
        bumpers: [[380, 300, 44, 110, 0.8], [1120, 300, 44, 110, 0.9], [380, 640, 44, 110, 0.7], [1120, 640, 44, 110, 0.85], [760, 160, 30, 200, 1.1], [760, 760, 30, 200, 1.2]] }
    })[this.room] || {};
    const RW = this.RW = 1500, RH = this.RH = 900;
    this.cameras.main.setBackgroundColor(V.bg || '#05061a').setBounds(-80, -80, RW + 160, RH + 160).fadeIn(300, 0, 0, 0);
    Sound.init(); Sound.music(V.music || 'level6');
    this.goalHud = null; this.leaving = false; this.wallHit = null; this.flash = 0;           // (the scene object is reused: reset what leave() and the effects left behind)
    this.t = 0; this.timeLeft = V.time || 50; this.done = false; this.fireCd = 0; this.combo = 0; this.comboT = 0;
    this.P = { h: 60, floor: 0, vh: 0, vx: 0, thrusting: false, firing: 0, aimA: 0, power: 0, duck: false, facing: 1 };
    this.pos = new Phaser.Math.Vector2(RW / 2, RH / 2 + 150); this.vel = new Phaser.Math.Vector2(0, 0); this.aim = new Phaser.Math.Vector2(1, 0);
    this.fx = [];                                                   // little particles: sparks, puffs, trail
    this.buildBackdrop();

    // the bumpers: wheels of cheese, holes turning; two of them roam about on slow loops
    this.bumpers = (V.bumpers || [])
      .map(([x, y, r, roam, sp]) => ({ x, y, hx: x, hy: y, r, roam: roam || 0, sp: sp || 0, flash: 0, pop: 0, rot: Math.random() * 6, spin: (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * 0.6) }));
    this.bumpG = this.add.graphics().setDepth(1);
    this.glowG = this.add.graphics().setDepth(0.9).setBlendMode(Phaser.BlendModes.ADD);

    // the cheese wheels, floating about, each in its own little glow
    const kinds = ['miniwheel_c'], glow = [0xffc23a], spots = [];     // (all cheese wheels now)
    while (spots.length < 12) {
      const x = 80 + Math.random() * (RW - 160), y = 80 + Math.random() * (RH - 160);
      if ((V.zap || []).some(z => Math.hypot(x - z[0], y - z[1]) < 60) || this.bumpers.some(b => Math.hypot(x - b.hx, y - b.hy) < b.r + b.roam + 50) || Math.hypot(x - RW / 2, y - RH / 2) < 160 || spots.some(s => Math.hypot(x - s.x, y - s.y) < 110)) continue;
      spots.push({ x, y });
    }
    this.items = spots.map((s, i) => { const k = i % kinds.length; const im = this.add.image(s.x, s.y, kinds[k]).setDepth(2).setScale(1.7); return { x: s.x, y: s.y, im, ph: Math.random() * 6, got: false, col: glow[k] }; });
    this.got = 0;
    this.shots = [];
    // OBSTACLES (v2.44: it was all very samey). ZAP-BARS: electrified spokes turning round a hub; touch one and you're
    // flung off with 2 s off the clock. RAT MINES: spiky floating rat-heads that drift after you; pop them with a shot
    // (they come back a few seconds later), touch one and BANG: thrown across the room, 2 s off. Room 3 has gusts too.
    this.zaps = (V.zap || []).map(([x, y, len, spd]) => ({ x, y, len, spd, a: Math.random() * 6, hit: 0 }));
    this.mines = [];
    for (let i = 0; i < (V.mines || 0); i++) this.mines.push(this.newMine(i));
    this.gust = { t: 4, on: 0, dx: 0, dy: 0 }; this.cleared = false;
    this.penT = 0;

    // the prize: a crate in the middle of the room, chained shut until the last cheese wheel is in
    this.prize = this.pickPrize();
    this.crate = this.add.container(RW / 2, RH / 2).setDepth(2);
    const box = this.add.graphics();
    box.fillStyle(0x1a1020, 1).fillRect(-30, -24, 60, 48); box.fillStyle(0x6a4a2a, 1).fillRect(-27, -21, 54, 42);
    box.fillStyle(0x8a6a3a, 1).fillRect(-27, -21, 54, 6).fillRect(-27, 15, 54, 6); box.lineStyle(3, 0x4a3018, 1).lineBetween(-24, -14, 24, 14).lineBetween(-24, 14, 24, -14);
    box.fillStyle(0xb9c4d8, 1).fillRect(-6, -8, 12, 14); box.fillStyle(0x1a1020, 1).fillRect(-2, -3, 4, 6);    // padlock
    this.crate.add(box);
    this.crateGun = this.add.image(0, -40, this.prize ? this.prize.gunTex : 'burger').setScale(this.prize ? 1.6 : 1.4).setAlpha(0.35);
    this.crate.add(this.crateGun);
    this.tweens.add({ targets: this.crate, y: RH / 2 - 8, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // Chris
    this.trailG = this.add.graphics().setDepth(4.5).setBlendMode(Phaser.BlendModes.ADD);
    this.rig = new ChrisRig(this); this.rig.root.setDepth(5); this.rig.setWeapon(WEAPONS[0]);
    this.fxG = this.add.graphics().setDepth(6).setBlendMode(Phaser.BlendModes.ADD);
    this.cameras.main.startFollow(this.rig.root, true, 0.12, 0.12);

    // HUD
    const f = (s, c) => ({ fontFamily: PIXEL, fontSize: s + 'px', color: c, stroke: '#1a1020', strokeThickness: 4 });
    this.f = f;
    this.timeTxt = this.add.text(0, 0, '', f(16, '#ffd23f')).setOrigin(0.5, 0).setScrollFactor(0).setDepth(20);
    this.gotTxt = this.add.text(0, 0, '', f(9, '#ffffff')).setOrigin(0.5, 0).setScrollFactor(0).setDepth(20);
    this.msg = this.add.text(0, 0, (V.title || 'ZERO-G RECOIL ROOM') + '\nYOU FLY AWAY FROM WHERE YOU SHOOT!\nGRAB ALL 12 CHEESE WHEELS, THEN FLY INTO THE GUN\nMIND THE ZAP-BARS AND RAT MINES' + (this.prize ? '\nPRIZE: ' + this.prize.name : ''),
      Object.assign(f(11, '#9fd8ff'), { align: 'center', lineSpacing: 8 })).setOrigin(0.5).setScrollFactor(0).setDepth(20);
    this.tweens.add({ targets: this.msg, alpha: 0, delay: 3600, duration: 600 });
    // an always-there way out: tapping it never fires the gun
    this.exitBtn = this.add.text(0, 0, '< MAP', Object.assign(f(10, '#ffffff'), { backgroundColor: '#2a1d4a', padding: { x: 8, y: 7 } })).setScrollFactor(0).setDepth(25).setInteractive({ useHandCursor: true });
    this.exitBtn.on('pointerdown', () => this.leave());
    this.layout(); this.scale.on('resize', this.layout, this); this.events.once('shutdown', () => this.scale.off('resize', this.layout, this));

    // input
    this.isTouch = (navigator.maxTouchPoints || 0) > 0 || ('ontouchstart' in window); this.stickG = null; this.stickLbl = null;
    this.input.on('pointerdown', p => { if (p.wasTouch) this.isTouch = true; }); this.curs = new MouseCursor(this);
    this.keys = this.input.keyboard ? this.input.keyboard.addKeys({ left: 'LEFT', right: 'RIGHT', up: 'UP', down: 'DOWN', a: 'A', d: 'D', w: 'W', s: 'S', r: 'R', enter: 'ENTER', space: 'SPACE' }) : null;
    const padOff = Pad.on(b => {
      if (b === 'back') return this.leave();
      if (this.done && this.t - this.doneT > 0.8) { if (b === 'x' || b === 'y') this.again(); else if (b === 'a' || b === 'b' || b === 'start') this.leave(); }
    });
    this.events.once('shutdown', padOff);
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => this.leave());
      this.input.keyboard.on('keydown', e => { if (!this.done || this.t - this.doneT < 0.8) return; if (e.key === 'r' || e.key === 'R') this.again(); else if (e.key === 'Enter' || e.key === ' ') this.leave(); });
    }
  }

  // ---- the backdrop: deep-space parallax behind the hangar's glass, a ringed gas giant, chase lights round the walls
  buildBackdrop() {
    const RW = this.RW, RH = this.RH, rnd = (a, b) => a + Math.random() * (b - a);
    const sky = this.add.graphics().setDepth(-3).setScrollFactor(0.15);
    for (const [x, y, r, c] of [[300, 260, 260, 0x5a1a8a], [900, 520, 320, 0x1a3a9a], [1500, 200, 240, 0x8a1a5a], [600, 800, 220, 0x1a6a8a]])
      for (let i = 6; i > 0; i--) sky.fillStyle(c, 0.05).fillCircle(x * 0.6, y * 0.6, r * i / 6);
    sky.setBlendMode(Phaser.BlendModes.ADD);
    this.moon = this.add.container(980, 140).setDepth(-2.5).setScrollFactor(0.22).setRotation(-0.3);
    const mg = this.add.graphics();                               // a far-off ringed gas giant: pale, so it never reads as a bumper
    mg.fillStyle(0x8a7ad8, 0.10).fillCircle(0, 0, 74);
    mg.fillStyle(0x4a3a8a, 1).fillCircle(0, 0, 58); mg.fillStyle(0x5e4ea8, 1).fillCircle(-6, -6, 50);
    mg.fillStyle(0x7a6ac8, 0.7).fillRect(-50, -18, 100, 6).fillRect(-54, 4, 108, 5); mg.fillStyle(0x3a2a6a, 0.6).fillRect(-46, 20, 92, 4);
    mg.lineStyle(4, 0xb9a8ff, 0.55).strokeEllipse(0, 0, 170, 34);
    this.moon.add(mg);
    this.stars = [];
    for (const [sf, n, sz] of [[0.3, 90, 1], [0.55, 60, 2], [0.8, 30, 3]]) {
      const g = this.add.graphics().setDepth(-2 + sf).setScrollFactor(sf);
      for (let i = 0; i < n; i++) { const c = [0xffffff, 0x9fd8ff, 0xffd23f, 0xff9db8][i % 4]; g.fillStyle(c, rnd(0.35, 0.9)).fillRect(rnd(-200, RW * sf + 1400), rnd(-200, RH * sf + 900), sz, sz); }
      this.stars.push(g);
    }
    // the room itself: a faint glass floor grid, a scanline that sweeps it, walls of riveted plate
    const grid = this.add.graphics().setDepth(-0.5);
    grid.fillStyle(0x0c1030, 0.55).fillRect(0, 0, RW, RH);
    grid.lineStyle(1, 0x2a3a88, 0.5); for (let x = 0; x <= RW; x += 75) grid.lineBetween(x, 0, x, RH); for (let y = 0; y <= RH; y += 75) grid.lineBetween(0, y, RW, y);
    this.scanG = this.add.graphics().setDepth(-0.4).setBlendMode(Phaser.BlendModes.ADD);
    const wall = this.add.graphics().setDepth(0.5);
    wall.fillStyle(0x2a3058, 1).fillRect(-60, -60, RW + 120, 60).fillRect(-60, RH, RW + 120, 60).fillRect(-60, 0, 60, RH).fillRect(RW, 0, 60, RH);
    wall.fillStyle(0x3e4678, 1).fillRect(-60, -60, RW + 120, 8).fillRect(-60, RH + 52, RW + 120, 8);
    wall.fillStyle(0x6a74a8, 1);
    for (let x = -40; x < RW + 60; x += 50) wall.fillRect(x, -34, 4, 4).fillRect(x, RH + 30, 4, 4);
    for (let y = 20; y < RH; y += 50) wall.fillRect(-34, y, 4, 4).fillRect(RW + 30, y, 4, 4);
    this.lights = [];                                               // chase bulbs all the way round the inside edge
    const step = 30;
    for (let x = 0; x <= RW; x += step) { this.lights.push([x, -3]); }
    for (let y = step; y <= RH; y += step) { this.lights.push([RW + 3, y]); }
    for (let x = RW - step; x >= 0; x -= step) { this.lights.push([x, RH + 3]); }
    for (let y = RH - step; y > 0; y -= step) { this.lights.push([-3, y]); }
    this.lightG = this.add.graphics().setDepth(0.6).setBlendMode(Phaser.BlendModes.ADD);
  }

  layout() {
    const W = this.scale.width, H = this.scale.height;
    this.timeTxt.setPosition(W / 2, 8); this.gotTxt.setPosition(W / 2, 32); this.msg.setPosition(W / 2, H * 0.4);
    this.exitBtn.setPosition(10, 10);
  }

  // which gun the crate holds: the first one not yet won here (null once all are won: then it's a life)
  pickPrize() {
    for (const w of WEAPONS) if (w.unlock > 1 && !Progress.hasGun(w.id)) return w;
    return null;
  }

  puff(x, y, n, col, spd, life, size) {
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = spd * (0.4 + Math.random() * 0.6); this.fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life, max: life, col, size }); }
  }
  pop(x, y, txt, col) {
    const t = this.add.text(x, y, txt, this.f(9, col)).setOrigin(0.5).setDepth(12);
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 800, ease: 'Cubic.out', onComplete: () => t.destroy() });
  }

  update(time, dms) {
    const dt = Math.min(0.05, dms / 1000); this.t += dt;
    const P = this.P, cam = this.cameras.main;
    // ---- aim + fire (a press that started on the MAP button never fires)
    let fire = false, ax = 0, ay = 0;
    const ptr = this.input.activePointer, eb = this.exitBtn.getBounds();
    const onBtn = eb.contains(ptr.downX, ptr.downY) || eb.contains(ptr.x, ptr.y);
    this.aimS = null;
    if (this.isTouch && !this.curs.on) {                  // the AIM+FIRE stick: wherever a thumb lands it's the centre; push to fire that way
      for (const p of this.input.manager.pointers) {
        if (!p || !p.isDown || (p === this.input.manager.mousePointer && !p.wasTouch) || this.done || this.leaving) continue;
        if (eb.contains(p.downX, p.downY) || p.downY < this.scale.height * 0.18) continue;
        const rad = 46, vx = Math.max(-1, Math.min(1, (p.x - p.downX) / rad)), vy = Math.max(-1, Math.min(1, (p.y - p.downY) / rad));
        this.aimS = { ox: p.downX, oy: p.downY, vx, vy };
        if (Math.hypot(vx, vy) > 0.35) { ax = vx; ay = vy; fire = true; }       // (a thumb just resting doesn't fire: every shot kicks you)
        break;
      }
    } else if (this.curs.on && !this.done && !this.leaving) {          // mouse: the gun follows the crosshair, left click fires
      const m = this.curs.ptr, wp = cam.getWorldPoint(m.x, m.y), mx = wp.x - this.pos.x, my = wp.y - (this.pos.y - 24);
      if (Math.hypot(mx, my) > 12) this.aim.set(mx, my).normalize();
      if (m.leftButtonDown() && !onBtn) { ax = this.aim.x; ay = this.aim.y; fire = true; }
    }
    this.drawStick(); this.curs.draw(!this.done && !this.leaving, fire);
    const k = this.keys;
    if (k) { const kx = (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0), ky = (k.down.isDown || k.s.isDown ? 1 : 0) - (k.up.isDown || k.w.isDown ? 1 : 0); if (kx || ky) { ax = kx; ay = ky; fire = true; } }
    if (Pad.state.connected && Pad.state.aimOn) { ax = Pad.state.aimX; ay = Pad.state.aimY; fire = true; }
    if (ax || ay) this.aim.set(ax, ay).normalize();
    P.facing = this.aim.x >= 0 ? 1 : -1; P.aimA = Math.atan2(-this.aim.y, Math.abs(this.aim.x));
    this.fireCd -= dt;
    if (fire && !this.done && !this.leaving && this.fireCd <= 0) {
      this.fireCd = 0.1; P.firing = 0.12;
      this.vel.x -= this.aim.x * 46; this.vel.y -= this.aim.y * 46;          // THE KICK: away from where you shoot
      // out of the barrel: last frame's muzzle (the rig's real gun tip), pointing the way the barrel points
      const m = this.muzzle, sx = m ? m.x : this.pos.x + this.aim.x * 46, sy = m ? m.y : this.pos.y - 26 + this.aim.y * 46;
      const dx = m ? m.dx : this.aim.x, dy = m ? m.dy : this.aim.y;
      for (const sh of bonusMacVolley(this, sx, sy, dx, dy, 620, { x: this.vel.x * 0.3, y: this.vel.y * 0.3 }, im => im.setDepth(4.8))) { sh.life = 1.2; this.shots.push(sh); }
      this.flash = 0.06; this.puff(sx, sy, 3, 0xffd23f, 90, 0.18, 2);
      this.puff(this.pos.x - this.aim.x * 10, this.pos.y - 30 - this.aim.y * 10, 1, 0x9fd8ff, 40, 0.4, 3);
      Sound.sfx('shoot');
    }
    P.firing = Math.max(0, P.firing - dt);
    // ---- drift: no gravity, a whisker of drag, capped speed
    const sp = this.vel.length(); if (sp > 460) this.vel.scale(460 / sp);
    this.vel.scale(Math.max(0, 1 - dt * 0.15));
    this.pos.x += this.vel.x * dt; this.pos.y += this.vel.y * dt;
    if (sp > 90 && Math.random() < dt * 40) this.fx.push({ x: this.pos.x + (Math.random() - 0.5) * 10, y: this.pos.y - 28 + (Math.random() - 0.5) * 10, vx: 0, vy: 0, life: 0.5, max: 0.5, col: 0x6ab8ff, size: 4 });
    // walls: bounce (pinball), the chase lights flare where you hit
    const rad = 26;
    if (this.pos.x < rad) { this.pos.x = rad; this.vel.x = Math.abs(this.vel.x) * 0.85; this.bonk(0, this.pos.y - 24); }
    if (this.pos.x > this.RW - rad) { this.pos.x = this.RW - rad; this.vel.x = -Math.abs(this.vel.x) * 0.85; this.bonk(this.RW, this.pos.y - 24); }
    if (this.pos.y < rad + 30) { this.pos.y = rad + 30; this.vel.y = Math.abs(this.vel.y) * 0.85; this.bonk(this.pos.x, 0); }
    if (this.pos.y > this.RH - 4) { this.pos.y = this.RH - 4; this.vel.y = -Math.abs(this.vel.y) * 0.85; this.bonk(this.pos.x, this.RH); }
    // bumpers: roam, spin, pinball kick
    for (const b of this.bumpers) {
      if (b.roam) { b.x = b.hx + Math.cos(this.t * b.sp) * b.roam; b.y = b.hy + Math.sin(this.t * b.sp * 1.3) * b.roam * 0.6; }
      b.rot += dt * b.spin * (1 + b.flash * 20);
      const dx = this.pos.x - b.x, dy = (this.pos.y - 24) - b.y, d = Math.hypot(dx, dy) || 1;
      if (d < b.r + rad) {
        const nx = dx / d, ny = dy / d, vn = this.vel.x * nx + this.vel.y * ny;
        this.pos.x = b.x + nx * (b.r + rad); this.pos.y = b.y + 24 + ny * (b.r + rad);
        if (vn < 0) { this.vel.x -= 2 * vn * nx; this.vel.y -= 2 * vn * ny; }
        this.vel.x += nx * 160; this.vel.y += ny * 160;
        if (b.flash <= 0.05) { this.puff(b.x + nx * b.r, b.y + ny * b.r, 10, 0xffd23f, 220, 0.4, 3); this.pop(b.x, b.y - b.r - 10, ['BOING!', 'BONK!', 'SPROING!'][Math.floor(Math.random() * 3)], '#ffd23f'); }
        b.flash = 0.2; b.pop = 1; Sound.sfx('bonk'); cam.shake(60, 0.004);
      }
      b.flash = Math.max(0, b.flash - dt); b.pop = Math.max(0, b.pop - dt * 4);
    }
    this.updateHazards(dt);
    // ---- shots
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const s = this.shots[i]; bonusMacStep(s, dt); s.life -= dt;
      const hitB = this.bumpers.find(b => Math.hypot(s.x - b.x, s.y - b.y) < b.r);
      const out = s.x < 0 || s.y < 0 || s.x > this.RW || s.y > this.RH;
      if (hitB || out) this.puff(Math.max(0, Math.min(this.RW, s.x)), Math.max(0, Math.min(this.RH, s.y)), 4, hitB ? 0xffd23f : 0x9fd8ff, 120, 0.25, 2);
      if (hitB) { hitB.flash = Math.max(hitB.flash, 0.08); hitB.pop = Math.max(hitB.pop, 0.4); }
      const hitM = this.mines.find(m => m.dead <= 0 && Math.hypot(s.x - m.x, s.y - m.y) < m.r + 8);
      if (hitM) { this.mineBoom(hitM); this.pop(hitM.x, hitM.y - 30, 'POP!', '#ffd23f'); }
      if (hitM && s.pierce > 1) { s.pierce--; continue; }
      if (s.life <= 0 || hitB || hitM || out) { s.im.destroy(); this.shots.splice(i, 1); }
    }
    // ---- cheese wheels (a quick chain of pickups is a combo, each one buys back a second)
    this.comboT -= dt; if (this.comboT <= 0) this.combo = 0;
    for (const it of this.items) {
      if (it.got) continue;
      it.im.y = it.y + Math.sin(this.t * 2 + it.ph) * 6; it.im.rotation = Math.sin(this.t * 1.3 + it.ph) * 0.3;
      if (Math.random() < dt * 1.5) this.fx.push({ x: it.x + (Math.random() - 0.5) * 40, y: it.im.y + (Math.random() - 0.5) * 40, vx: 0, vy: -10, life: 0.6, max: 0.6, col: 0xffffff, size: 2, star: true });
      if (!this.done && Math.hypot(this.pos.x - it.x, this.pos.y - 24 - it.y) < 44) {
        it.got = true; this.got++; this.combo++; this.comboT = 1.6; this.timeLeft += 1;
        Sound.sfx(this.combo > 1 ? 'combo' : 'pickup');
        this.puff(it.x, it.im.y, 14, it.col, 200, 0.5, 3);
        this.pop(it.x, it.im.y - 24, this.combo > 1 ? 'COMBO x' + this.combo + '!' : '+1s', this.combo > 1 ? '#ff9db8' : '#7dff8a');
        this.tweens.add({ targets: it.im, scale: 0, angle: 360, duration: 250, onComplete: () => it.im.destroy() });
        this.crateGun.setAlpha(0.35 + 0.65 * this.got / this.items.length);
        if (this.got >= this.items.length) this.openCrate();
      }
    }
    // ---- the clock
    if (!this.done && !this.cleared) { this.timeLeft -= dt; if (this.timeLeft <= 0) { this.timeLeft = 0; this.finish(false); } }
    if (this.cleared && !this.done && Math.hypot(this.pos.x - this.crate.x, this.pos.y - 24 - (this.crate.y - 40)) < 56) this.finish(true);   // flew into the gun: got it
    if (this.cleared) this.timeTxt.setText('GRAB THE GUN!').setColor(Math.floor(this.t * 4) % 2 ? '#7dff8a' : '#ffd23f');
    else this.timeTxt.setText(String(Math.ceil(this.timeLeft))).setColor(this.timeLeft < 10 && Math.floor(this.t * 4) % 2 ? '#ff5a3a' : '#ffd23f');
    this.gotTxt.setText('CHEESE WHEELS ' + this.got + ' / ' + this.items.length);
    (this.goalHud || (this.goalHud = new GoalHud(this))).update([
      { label: 'CHEESE WHEELS', frac: this.got / this.items.length, right: this.got + '/' + this.items.length, done: this.got >= this.items.length },
      { label: 'BEFORE THE CLOCK', frac: this.timeLeft / (this.V.time || 30), right: this.cleared ? 'STOPPED' : Math.ceil(this.timeLeft) + 's', hot: this.timeLeft < 10 && !this.cleared, done: this.cleared },
      { label: 'FLY INTO THE GUN', done: this.done && this.cleared, locked: !this.cleared, hot: this.cleared && !this.done }]);

    // ---- draw
    const sc = this.scanG; sc.clear();
    const sy = (this.t * 160) % (this.RH + 200) - 100;
    for (let i = 0; i < 6; i++) sc.fillStyle(0x3a6aff, 0.06 - i * 0.009).fillRect(0, sy - i * 6, this.RW, 6);
    const lg = this.lightG; lg.clear();
    const n = this.lights.length, head = (this.t * 28) % n, cols = [0xff4a8a, 0xffd23f, 0x4ae0ff];
    this.lights.forEach(([x, y], i) => {
      let d = (head - i + n) % n; const lit = d < 6 ? 1 - d / 6 : 0;
      const near = this.wallHit ? Math.max(0, 1 - Math.hypot(x - this.wallHit.x, y - this.wallHit.y) / 160) * this.wallHit.k : 0;
      const a = 0.25 + Math.max(lit, near) * 0.75, c = this.done ? cols[(i + Math.floor(this.t * 8)) % 3] : cols[Math.floor(i / 8) % 3];
      lg.fillStyle(c, a * 0.35).fillCircle(x, y, 7); lg.fillStyle(c, a).fillCircle(x, y, 3);
    });
    if (this.wallHit) { this.wallHit.k -= dt * 2; if (this.wallHit.k <= 0) this.wallHit = null; }
    const g = this.bumpG, gl = this.glowG; g.clear(); gl.clear();
    for (const b of this.bumpers) {
      const r = b.r * (1 + b.pop * 0.18), pulse = 0.5 + 0.5 * Math.sin(this.t * 3 + b.hx);
      gl.fillStyle(0xffb52a, 0.12 + pulse * 0.08 + b.flash * 1.5).fillCircle(b.x, b.y, r + 16); gl.fillStyle(0xffd23f, 0.12 + b.flash).fillCircle(b.x, b.y, r + 7);
      g.fillStyle(b.flash > 0.1 ? 0xffffff : 0xffd23f, 1).fillCircle(b.x, b.y, r);
      g.fillStyle(0xffe680, 1).fillCircle(b.x - r * 0.25, b.y - r * 0.25, r * 0.55);
      for (const [hr, ha, hs] of [[0.55, 0, 0.2], [0.5, 2.1, 0.15], [0.6, 4.0, 0.17], [0.15, 1, 0.12]]) {
        const a = ha + b.rot; g.fillStyle(0xd89a1a, 1).fillCircle(b.x + Math.cos(a) * r * hr, b.y + Math.sin(a) * r * hr, r * hs);
      }
      g.lineStyle(3, 0x1a1020, 1).strokeCircle(b.x, b.y, r);
      if (b.roam) g.lineStyle(2, 0xff9db8, 0.6 + pulse * 0.4).strokeCircle(b.x, b.y, r + 4);   // the roaming ones wear a pink ring
    }
    for (const it of this.items) if (!it.got) {
      const p = 0.5 + 0.5 * Math.sin(this.t * 4 + it.ph);
      gl.fillStyle(it.col, 0.10 + p * 0.1).fillCircle(it.x, it.im.y, 30); gl.fillStyle(it.col, 0.12).fillCircle(it.x, it.im.y, 18);
    }
    gl.fillStyle(this.got >= this.items.length ? 0x7dff8a : 0x9fd8ff, 0.08 + 0.05 * Math.sin(this.t * 2)).fillCircle(this.crate.x, this.crate.y - 10, 60);
    this.drawHazards(g, gl);
    if (this.cleared && !this.done) {                      // the open crate: a beacon pulling you in
      const r = 56 + 6 * Math.sin(this.t * 6);
      gl.fillStyle(0x7dff8a, 0.18).fillCircle(this.crate.x, this.crate.y - 40, r); g.lineStyle(3, 0x7dff8a, 0.6 + 0.4 * Math.sin(this.t * 8)).strokeCircle(this.crate.x, this.crate.y - 40, r);
    }
    // particles + muzzle flash
    const fg = this.fxG; fg.clear();
    bonusMacDraw(fg, this.shots);
    for (let i = this.fx.length - 1; i >= 0; i--) {
      const p = this.fx[i]; p.life -= dt; if (p.life <= 0) { this.fx.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 - dt * 3; p.vy *= 1 - dt * 3;
      const k2 = p.life / p.max;
      if (p.star) { fg.fillStyle(p.col, k2).fillRect(p.x - 1, p.y - 4 * k2, 2, 8 * k2).fillRect(p.x - 4 * k2, p.y - 1, 8 * k2, 2); }
      else fg.fillStyle(p.col, k2 * 0.9).fillCircle(p.x, p.y, p.size * (0.5 + k2));
    }
    this.flash = Math.max(0, (this.flash || 0) - dt);
    if (this.flash > 0 && this.muzzle) { fg.fillStyle(0xffd23f, 0.9).fillCircle(this.muzzle.x, this.muzzle.y, 7); fg.fillStyle(0xffffff, 1).fillCircle(this.muzzle.x, this.muzzle.y, 3); }
    // Chris, and where his gun's muzzle really is this frame
    P.vx = this.vel.x * 0.2; P.vh = -this.vel.y;
    this.rig.update(P, dt, Math.round(this.pos.x), Math.round(this.pos.y), 1, 1, Math.floor(this.t * (P.firing > 0 ? 40 : 6)) % 4);
    this.rig.root.setRotation(Math.max(-0.5, Math.min(0.5, this.vel.x / 900)));    // a lazy tilt with the drift
    const tip = this.rig.auger, mt = tip.getWorldTransformMatrix();
    const tp = mt.transformPoint(tip.width * (1 - tip.originX) - 1, 0), tb = mt.transformPoint(-tip.width * tip.originX, 0);
    const ml = Math.hypot(tp.x - tb.x, tp.y - tb.y) || 1;
    this.muzzle = { x: tp.x, y: tp.y, dx: (tp.x - tb.x) / ml, dy: (tp.y - tb.y) / ml };
    const tg = this.trailG; tg.clear();
    if (sp > 60) { const a = Math.min(0.5, sp / 900); tg.fillStyle(0x4a9aff, a * 0.5).fillCircle(this.pos.x, this.pos.y - 28, 30); }
  }
  newMine(i) {
    const RW = this.RW, RH = this.RH, side = i % 4;
    const x = side === 0 ? 60 : side === 1 ? RW - 60 : 200 + Math.random() * (RW - 400), y = side < 2 ? 120 + Math.random() * (RH - 240) : side === 2 ? 70 : RH - 70;
    return { x, y, vx: 0, vy: 0, r: 17, dead: 0, ph: Math.random() * 6 };
  }
  hazardHit(nx, ny, why, kick) {                           // flung away from the thing, and (while the clock's running) 2 seconds lost
    if (this.penT > 0 || this.done) return;
    this.penT = 0.7;
    this.vel.x = nx * kick; this.vel.y = ny * kick;
    if (!this.cleared) { this.timeLeft = Math.max(0.5, this.timeLeft - 2); this.pop(this.pos.x, this.pos.y - 70, why + ' -2s', '#ff5a3a'); }
    else this.pop(this.pos.x, this.pos.y - 70, why, '#ff5a3a');
    Sound.sfx(['ouch1', 'ouch2', 'ouch3'][Math.floor(Math.random() * 3)]); this.cameras.main.shake(160, 0.009); buzz(60);
    this.puff(this.pos.x, this.pos.y - 26, 14, 0xff5a3a, 260, 0.4, 3);
  }
  updateHazards(dt) {
    const cx = this.pos.x, cy = this.pos.y - 24;
    this.penT = Math.max(0, this.penT - dt);
    for (const z of this.zaps) {                           // the zap-bars: two spokes through the hub
      z.a += z.spd * dt; z.hit = Math.max(0, z.hit - dt * 3);
      for (const off of [0, Math.PI]) {
        const ex = Math.cos(z.a + off), ey = Math.sin(z.a + off), t = Math.max(0, Math.min(z.len, (cx - z.x) * ex + (cy - z.y) * ey));
        const px = z.x + ex * t, py = z.y + ey * t, d = Math.hypot(cx - px, cy - py);
        if (d < 24 && t > 18) { z.hit = 1; const nx = (cx - px) / (d || 1), ny = (cy - py) / (d || 1); this.hazardHit(nx, ny, 'ZAPPED!', 420); }
      }
      if (Math.hypot(cx - z.x, cy - z.y) < 40) { const d = Math.hypot(cx - z.x, cy - z.y) || 1; this.hazardHit((cx - z.x) / d, (cy - z.y) / d, 'ZAPPED!', 380); }
    }
    for (let i = 0; i < this.mines.length; i++) {          // the rat mines drift after you, slowly
      const m = this.mines[i];
      if (m.dead > 0) { m.dead -= dt; if (m.dead <= 0) { this.mines[i] = this.newMine(i); this.puff(this.mines[i].x, this.mines[i].y, 10, 0xff4a8a, 120, 0.4, 3); } continue; }
      const dx = cx - m.x, dy = cy - m.y, d = Math.hypot(dx, dy) || 1;
      m.vx += dx / d * 60 * dt; m.vy += dy / d * 60 * dt;
      const ms = Math.hypot(m.vx, m.vy); if (ms > 95) { m.vx *= 95 / ms; m.vy *= 95 / ms; }
      m.x = Math.max(30, Math.min(this.RW - 30, m.x + m.vx * dt)); m.y = Math.max(40, Math.min(this.RH - 30, m.y + m.vy * dt));
      for (const b of this.bumpers) { const bx = m.x - b.x, by = m.y - b.y, bd = Math.hypot(bx, by) || 1; if (bd < b.r + m.r) { m.x = b.x + bx / bd * (b.r + m.r); m.y = b.y + by / bd * (b.r + m.r); m.vx *= -0.5; m.vy *= -0.5; } }
      if (d < m.r + 24) { this.mineBoom(m); this.hazardHit(dx / d, dy / d, 'BOOM!', 520); }
    }
    if (this.V.wind) {                                     // room 3: GUSTS blow across the room every few seconds (the arrows warn you first)
      const G = this.gust; G.t -= dt;
      if (G.t <= 0 && !G.on) { G.on = 2.2; const a = Math.random() * Math.PI * 2; G.dx = Math.cos(a); G.dy = Math.sin(a); G.warn = 0.9; Sound.sfx('whoosh'); }
      if (G.on) { if (G.warn > 0) G.warn -= dt; else { this.vel.x += G.dx * 260 * dt; this.vel.y += G.dy * 260 * dt; } G.on = Math.max(0, G.on - dt); if (!G.on) G.t = 3 + Math.random() * 2; }
    }
  }
  mineBoom(m) { m.dead = 4; this.puff(m.x, m.y, 26, 0xff6a3a, 300, 0.6, 4); this.puff(m.x, m.y, 12, 0xffd23f, 200, 0.4, 3); Sound.sfx('boom'); }
  drawHazards(g, gl) {
    for (const z of this.zaps) {
      for (const off of [0, Math.PI]) {
        const ex = Math.cos(z.a + off), ey = Math.sin(z.a + off), x1 = z.x + ex * z.len, y1 = z.y + ey * z.len, fl = Math.random() < 0.15;
        gl.lineStyle(16, 0x4ae0ff, 0.14 + z.hit * 0.3).lineBetween(z.x, z.y, x1, y1);
        g.lineStyle(7, 0x1a1020, 1).lineBetween(z.x, z.y, x1, y1);
        g.lineStyle(4, fl || z.hit > 0.5 ? 0xffffff : 0x9af0ff, 1).lineBetween(z.x, z.y, x1, y1);
        let px = z.x, py = z.y;                            // crackle along it
        for (let k = 1; k <= 6; k++) { const t = k / 6, jx = (Math.random() - 0.5) * 10, jy = (Math.random() - 0.5) * 10, qx = z.x + ex * z.len * t + jx, qy = z.y + ey * z.len * t + jy; gl.lineStyle(2, 0xffffff, 0.7).lineBetween(px, py, qx, qy); px = qx; py = qy; }
        g.fillStyle(0x1a1020, 1).fillCircle(x1, y1, 8); g.fillStyle(0x4ae0ff, 1).fillCircle(x1, y1, 5);
      }
      g.fillStyle(0x1a1020, 1).fillCircle(z.x, z.y, 22); g.fillStyle(0x5a6272, 1).fillCircle(z.x, z.y, 19); g.fillStyle(0x9aa4b4, 1).fillCircle(z.x - 4, z.y - 4, 9);
      g.fillStyle(0xff4a3a, 0.6 + 0.4 * Math.sin(this.t * 10)).fillCircle(z.x, z.y, 5);
    }
    for (const m of this.mines) {
      if (m.dead > 0) continue;
      const pul = 0.5 + 0.5 * Math.sin(this.t * 6 + m.ph), near = Math.hypot(this.pos.x - m.x, this.pos.y - 24 - m.y) < 160;
      gl.fillStyle(0xff3a5a, (near ? 0.25 : 0.12) + pul * 0.1).fillCircle(m.x, m.y, m.r + 12);
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + this.t * 0.8; g.lineStyle(4, 0x1a1020, 1).lineBetween(m.x, m.y, m.x + Math.cos(a) * (m.r + 8), m.y + Math.sin(a) * (m.r + 8)); g.lineStyle(2, 0xc0c8d8, 1).lineBetween(m.x, m.y, m.x + Math.cos(a) * (m.r + 7), m.y + Math.sin(a) * (m.r + 7)); }
      g.fillStyle(0x1a1020, 1).fillCircle(m.x, m.y, m.r + 2); g.fillStyle(0x8a7e96, 1).fillCircle(m.x, m.y, m.r); g.fillStyle(0xb0a4bc, 1).fillCircle(m.x - 4, m.y - 5, m.r * 0.5);
      g.fillStyle(0x8a7e96, 1).fillCircle(m.x - 11, m.y - 13, 6).fillCircle(m.x + 11, m.y - 13, 6); g.fillStyle(0xff9db8, 1).fillCircle(m.x - 11, m.y - 13, 3).fillCircle(m.x + 11, m.y - 13, 3);   // ears
      g.fillStyle(near && pul > 0.5 ? 0xffffff : 0xff3a2a, 1).fillCircle(m.x - 5, m.y - 2, 2.5).fillCircle(m.x + 5, m.y - 2, 2.5);                                  // glowing eyes
    }
    const G = this.gust;
    if (this.V.wind && G.on) {                             // the gust: streaks blowing across the whole room
      const a = G.warn > 0 ? 0.25 * (Math.floor(this.t * 10) % 2) : 0.35;
      for (let k = 0; k < 26; k++) { const sx = ((k * 211 + this.t * 900 * G.dx) % this.RW + this.RW) % this.RW, sy = ((k * 137 + this.t * 900 * G.dy) % this.RH + this.RH) % this.RH; gl.lineStyle(2, 0xffffff, a).lineBetween(sx, sy, sx - G.dx * 40, sy - G.dy * 40); }
    }
  }
  bonk(x, y) { if (this.vel.length() > 120) { Sound.sfx('clunk'); this.cameras.main.shake(50, 0.003); this.wallHit = { x, y, k: 1 }; this.puff(x, y, 6, 0x4ae0ff, 160, 0.3, 2); } }

  openCrate() {                                         // every cheese wheel in: the clock stops, the crate bursts, the gun hangs in the middle
    if (this.cleared) return; this.cleared = true;
    this.crate.list[0].setVisible(false);
    this.puff(this.crate.x, this.crate.y, 40, 0x7dff8a, 320, 0.8, 4); Sound.sfx('power'); this.cameras.main.flash(200, 200, 255, 200);
    this.tweens.add({ targets: this.crateGun.setAlpha(1), scale: (this.prize ? 1.6 : 1.4) * 1.5, duration: 500, ease: 'Back.out' });
    this.tweens.add({ targets: this.crateGun, angle: 360, duration: 2400, repeat: -1 });
    this.pop(this.scale.width / 2, this.scale.height * 0.3, 'CLOCK STOPPED! SHOOT YOURSELF INTO THE GUN!', '#7dff8a');
    for (const m of this.mines) if (m.dead <= 0) this.mineBoom(m);
  }
  finish(won) {
    if (this.done) return;
    this.done = true; this.doneT = this.t;
    let body;
    if (won) {
      Sound.sfx('power'); Sound.music('win');
      if (this.prize) { Progress.giveGun(this.prize.id); body = 'THE CRATE IS OPEN!\n\nNEW GUN: ' + this.prize.name; }
      else { const lives = Math.min(CFG.maxLives, (this.registry.get('lives') || CFG.startLives) + 1); this.registry.set('lives', lives); body = 'ALL 12 CHEESE WHEELS!\n\n+1 LIFE'; }
      body += '\n(' + Math.ceil(this.timeLeft) + 's TO SPARE)';
      this.crateGun.setVisible(false); this.puff(this.crate.x, this.crate.y - 40, 30, 0xffd23f, 300, 0.7, 4);
    } else { Sound.music('lose'); body = 'OUT OF TIME!\n\n' + this.got + ' / ' + this.items.length + ' CHEESE WHEELS'; }
    const W = this.scale.width, H = this.scale.height, D = 30;
    this.add.rectangle(0, 0, W, H, 0x000000, 0.55).setOrigin(0).setScrollFactor(0).setDepth(D);
    this.add.text(W / 2, H * 0.24, won ? 'BONUS CLEAR!' : 'TIME UP', { fontFamily: PIXEL, fontSize: '22px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 6 }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1);
    this.add.text(W / 2, H * 0.36, body, { fontFamily: PIXEL, fontSize: '10px', color: '#ffffff', align: 'center', lineSpacing: 8 }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(D + 1);
    const pad = typeof inputDevice === 'function' && inputDevice() === 'pad';
    const btn = (x, label, fn, col) => {
      const b = this.add.text(x, H * 0.76, label, { fontFamily: PIXEL, fontSize: '11px', color: '#1a1020', backgroundColor: col, padding: { x: 12, y: 10 } }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 2).setInteractive({ useHandCursor: true });
      b.on('pointerup', () => { if (this.t - this.doneT > 0.5) fn(); });
      return b;
    };
    btn(W / 2 - 80, pad ? 'A: MAP' : 'MAP', () => this.leave(), '#ffd23f');
    btn(W / 2 + 80, pad ? 'X: AGAIN' : 'AGAIN', () => this.again(), '#9fd8ff');
    this.exitBtn.setVisible(false);
  }
  again() { if (this.leaving) return; this.leaving = true; this.cameras.main.fadeOut(200, 0, 0, 0); this.time.delayedCall(220, () => this.scene.restart()); }
  leave() { if (this.leaving) return; this.leaving = true; this.cameras.main.fadeOut(250, 0, 0, 0); this.time.delayedCall(280, () => this.scene.start('select')); }
}
