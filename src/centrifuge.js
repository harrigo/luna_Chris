// BONUS: the CENTRIFUGE FERMENTER. Chris is inside a huge spinning steel drum where the curds are separated. There's
// no gravity in here: the spin pins him to the inside of the wall, and "down" is always outwards, so the floor curves
// up all round him and the far side of the drum hangs upside down overhead.
//
// The fun is the real physics: in the air he flies in a STRAIGHT LINE (nothing pulls him) while the drum turns under
// him, so a jump lands further round than you'd think. Running WITH the spin makes you "heavier" and throws you
// forward; running AGAINST it cancels the spin out, so a jump goes straight across. The spin also rises and falls:
// when it slows, jumps sail right across the middle, which is the only way to reach the ingredients floating near the
// axle. HATCHES in the wall open now and then onto space: the air roars out and drags you towards them (get sucked
// out and you're thrown back in, 3 s down), and rats fly in through them on rocket packs and take pot-shots. Shoot
// them with the Mac-Grinder. Grab all 12 for the prize.
//
// Controls are the main game's: left/right run (his own left/right, like on a planet), jump (Space/Up/W, controller A;
// hold it in the air for the jetpack, which pushes you in towards the middle), fire (Z/X/J or the mouse, which aims;
// controller X/RT, right stick aims). Touch: on-screen ◀ ▶ JUMP FIRE (fire auto-aims at the nearest rat).
class CentrifugeScene extends Phaser.Scene {
  constructor() { super('centrifuge'); }

  create() {
    buildAllTextures(this);
    const RD = this.RD = 250, rnd = (a, b) => a + Math.random() * (b - a);
    this.cameras.main.setBackgroundColor('#0a0806').fadeIn(300, 0, 0, 0);
    Sound.init(); Sound.music('level7');
    this.leaving = false; this.done = false; this.axHeld = false; this.axFlip = 0; this.t = 0; this.timeLeft = 50; this.got = 0; this.penaltyT = 0; this.touchG = null; this.touchLbl = null; this.plateTxt = null; this.gaugeTxt = null;
    this.intro = 3.0; this.count = -1;
    // the drum: its angle D and spin w (radians/s), easing between fast and slow
    this.D = 0; this.w = 1.3; this.spinPhase = 0; this.spinLow = false;
    // Chris: on the wall (a = his angle IN THE DRUM, run = his running speed along it) or flying (pos/vel, inertial)
    this.onWall = true; this.a = Math.PI / 2; this.run = 0; this.pos = { x: 0, y: 0 }; this.vel = { x: 0, y: 0 };
    this.P = { h: 0, floor: 0, vh: 0, vx: 0, thrusting: false, firing: 0, aimA: 0, power: 0, duck: false, facing: 1 };
    this.fx = [];

    // ---- the factory round it (screen space, behind the drum): steel wall panels, pipes feeding the drum, a big SPIN
    // gauge on the left and a maker's plate on the right
    this.backG = this.add.graphics().setDepth(0); this.gaugeG = this.add.graphics().setDepth(0.5);
    // ---- the world: everything inertial lives in this container, which is rotated/moved to make the camera
    this.world = this.add.container(0, 0).setDepth(1);
    this.drum = this.add.container(0, 0);                       // the drum and everything fixed to it, turned by D
    this.world.add(this.drum);
    this.buildDrum();
    // hatches in the wall (fixed in the drum): closed, then a flashing warning, then open onto space for a few seconds
    this.hatches = [0, 1, 2].map(k => ({ a: Math.PI * 1.5 + k * 2.094 + rnd(-0.2, 0.2), half: 0.16, st: 'closed', t: rnd(2.5, 5), open: 0 }));
    this.padG = this.add.graphics(); this.drum.add(this.padG);
    this.ens = []; this.ebul = []; this.shots = []; this.fuel = 1; this.fireCd = 0; this.out = null;
    // ingredients, fixed in the drum: most near the wall-ish, a few floating near the axle (slow spin needed)
    const kinds = ['wedge', 'goldwheel', 'meatball', 'ix_pancake', 'pepper', 'chili'], glow = [0xffd23f, 0xffc23a, 0xff8a5a, 0xffb36a, 0x7dff8a, 0xff4a3a];
    this.items = [];
    for (let i = 0; i < 12; i++) {
      const ang = i / 12 * Math.PI * 2 + rnd(-0.15, 0.15), r = i % 4 === 3 ? rnd(30, 90) : rnd(RD - 210, RD - 60), k = i % kinds.length;
      const x = Math.cos(ang) * r, y = Math.sin(ang) * r;
      const im = this.add.image(x, y, kinds[k]).setScale(k === 3 ? 2.3 : 1.5);
      this.drum.add(im);
      this.items.push({ x, y, ang, r, im, got: false, col: glow[k], ph: rnd(0, 6) });
    }
    this.glowG = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD); this.drum.add(this.glowG);
    // the prize waits at the hub
    this.prize = ZeroGScene.prototype.pickPrize.call(this);
    // Chris
    this.rig = new ChrisRig(this); this.rig.setWeapon(WEAPONS[0]);
    this.world.add(this.rig.root);
    this.fxG = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD); this.world.add(this.fxG);
    this.camPhi = this.a + this.D; this.camK = 0.62;

    // ---- HUD
    const f = (s, c) => ({ fontFamily: PIXEL, fontSize: s + 'px', color: c, stroke: '#1a1020', strokeThickness: 4 });
    this.f = f;
    this.timeTxt = this.add.text(0, 0, '', f(16, '#ffd23f')).setOrigin(0.5, 0).setDepth(20);
    this.gotTxt = this.add.text(0, 0, '', f(9, '#ffffff')).setOrigin(0.5, 0).setDepth(20);
    this.spinTxt = this.add.text(0, 0, '', f(9, '#9fd8ff')).setOrigin(1, 0).setDepth(20);
    this.hudG = this.add.graphics().setDepth(20);
    this.msg = this.add.text(0, 0, 'CENTRIFUGE FERMENTER\nIT SPINS YOU ROUND LIKE A HAMSTER WHEEL!\nKEEP AWAY FROM THE OPEN HATCHES, SHOOT THE RATS\nWHEN THE SPIN SLOWS, JUMP RIGHT THROUGH THE MIDDLE', Object.assign(f(10, '#ffcf9a'), { align: 'center', lineSpacing: 8 })).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: this.msg, alpha: 0, delay: 2600, duration: 500 });
    this.countTxt = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '40px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 8 }).setOrigin(0.5).setDepth(21);
    this.exitBtn = this.add.text(0, 0, '< MAP', Object.assign(f(10, '#ffffff'), { backgroundColor: '#2a1d10', padding: { x: 8, y: 7 } })).setDepth(25).setInteractive({ useHandCursor: true });
    this.exitBtn.on('pointerdown', () => this.leave());
    this.layout(); this.scale.on('resize', this.layout, this); this.events.once('shutdown', () => this.scale.off('resize', this.layout, this));
    this.isTouch = (navigator.maxTouchPoints || 0) > 0 || ('ontouchstart' in window);

    this.keys = this.input.keyboard ? this.input.keyboard.addKeys({ left: 'LEFT', right: 'RIGHT', up: 'UP', a: 'A', d: 'D', w: 'W', z: 'Z', x: 'X', j: 'J', space: 'SPACE' }) : null;
    const padOff = Pad.on(b => {
      if (b === 'back') return this.leave();
      if (this.done && this.t - this.doneT > 0.8) { if (b === 'x' || b === 'y') this.again(); else if (b === 'a' || b === 'b' || b === 'start') this.leave(); }
    });
    this.events.once('shutdown', padOff);
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => this.leave());
      this.input.keyboard.on('keydown', e => { if (!this.done || this.t - this.doneT < 0.8) return; if (e.key === 'r' || e.key === 'R') this.again(); else if (e.key === 'Enter') this.leave(); });
    }
  }

  // ---- the drum: a riveted stainless steel shell with portholes, a film of whey pinned to the wall, curd lumps, the hub
  buildDrum() {
    const RD = this.RD, g = this.add.graphics(), rnd = (a, b) => a + Math.random() * (b - a);
    g.fillStyle(0x1a120a, 1).fillCircle(0, 0, RD + 60);
    for (let i = 7; i > 0; i--) g.fillStyle(Phaser.Display.Color.GetColor(30 + i * 6, 22 + i * 4, 14 + i * 2), 1).fillCircle(0, 0, RD * i / 7);   // dim inside, a bit lighter at the wall
    for (let i = 0; i < 40; i++) { const a = rnd(0, 6.3), r = rnd(40, RD - 30); g.fillStyle(0x000000, 0.18).fillCircle(Math.cos(a) * r, Math.sin(a) * r, rnd(8, 24)); }
    // the wall: steel shell, rivets, portholes with light coming through
    g.lineStyle(34, 0x6a7080, 1).strokeCircle(0, 0, RD + 17); g.lineStyle(6, 0xc8d0dc, 1).strokeCircle(0, 0, RD + 3); g.lineStyle(4, 0x2a2e38, 1).strokeCircle(0, 0, RD + 34);
    for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2; g.fillStyle(0x3a3e48, 1).fillCircle(Math.cos(a) * (RD + 20), Math.sin(a) * (RD + 20), 3); }
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * Math.PI * 2 + 0.3, x = Math.cos(a) * (RD + 18), y = Math.sin(a) * (RD + 18);
      g.fillStyle(0x2a2e38, 1).fillCircle(x, y, 13); g.fillStyle(0x9fd8ff, 1).fillCircle(x, y, 9); g.fillStyle(0xffffff, 0.8).fillCircle(x - 3, y - 3, 3);
    }
    // warning stripes round the inside of the wall, so you can see it whizz round
    for (let k = 0; k < 16; k++) { const a0 = k / 16 * Math.PI * 2, a1 = a0 + 0.12; g.fillStyle(k % 2 ? 0xffd23f : 0x1a1012, 1).fillPoints([{ x: Math.cos(a0) * (RD - 2), y: Math.sin(a0) * (RD - 2) }, { x: Math.cos(a1) * (RD - 2), y: Math.sin(a1) * (RD - 2) }, { x: Math.cos(a1) * (RD + 6), y: Math.sin(a1) * (RD + 6) }, { x: Math.cos(a0) * (RD + 6), y: Math.sin(a0) * (RD + 6) }], true); }
    // whey film along the wall, and lumps of curd stuck in it
    g.lineStyle(10, 0xf0ecd0, 0.45).strokeCircle(0, 0, RD - 4);
    for (let k = 0; k < 26; k++) { const a = rnd(0, 6.3), r = RD - rnd(4, 10); g.fillStyle(0xfff6d8, 1).fillCircle(Math.cos(a) * r, Math.sin(a) * r, rnd(4, 9)); g.fillStyle(0xd8ccaa, 1).fillCircle(Math.cos(a) * r + 2, Math.sin(a) * r + 2, 3); }
    // the hub: the axle, with the prize hanging off it
    g.fillStyle(0x3a3e48, 1).fillCircle(0, 0, 22); g.fillStyle(0xa8b0c0, 1).fillCircle(0, 0, 14); g.fillStyle(0x2a2e38, 1).fillCircle(0, 0, 5);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; g.fillStyle(0xa8b0c0, 1).fillRect(Math.cos(a) * 18 - 3, Math.sin(a) * 18 - 3, 6, 6); }
    this.drum.add(g);
  }

  drawFactory() {
    const W = this.scale.width, H = this.scale.height, g = this.backG; g.clear();
    g.fillStyle(0x15181f, 1).fillRect(0, 0, W, H);
    for (let x = 0; x < W; x += 64) { g.fillStyle(x / 64 % 2 ? 0x1b1f28 : 0x181c24, 1).fillRect(x, 0, 62, H); g.fillStyle(0x2a303c, 1).fillRect(x + 62, 0, 2, H); for (let y = 20; y < H; y += 60) g.fillStyle(0x323a48, 1).fillCircle(x + 6, y, 2).fillCircle(x + 56, y, 2); }
    const cy = H * 0.53, rr = H * 0.47 * (this.RD + 40) / (this.RD + 40);
    for (const [y, c] of [[cy - rr * 0.55, 0x8a5a2a], [cy + rr * 0.4, 0x5a6a7a]]) {       // pipes running into the drum from both sides
      g.fillStyle(0x0a0c10, 1).fillRect(0, y - 9, W, 18); g.fillStyle(c, 1).fillRect(0, y - 7, W, 14); g.fillStyle(0xffffff, 0.18).fillRect(0, y - 6, W, 3);
      for (const x of [W * 0.12, W * 0.3, W * 0.7, W * 0.88]) { g.fillStyle(0x0a0c10, 1).fillRect(x - 6, y - 12, 12, 24); g.fillStyle(0xa8b0c0, 1).fillRect(x - 4, y - 10, 8, 20); }
    }
    g.fillStyle(0x000000, 0.55).fillCircle(W / 2, cy, rr + 12);                              // the drum's shadow on the wall
    // maker's plate
    const px = W * 0.86, py = H * 0.78;
    g.fillStyle(0x0a0c10, 1).fillRect(px - 62, py - 22, 124, 44); g.fillStyle(0xb89a5a, 1).fillRect(px - 60, py - 20, 120, 40); g.fillStyle(0x7a5a2a, 1).fillRect(px - 56, py - 16, 112, 32);
    this.plateTxt = this.plateTxt || this.add.text(0, 0, 'FERMENTER\nNo. 9', { fontFamily: PIXEL, fontSize: '7px', color: '#ffe8a8', align: 'center', lineSpacing: 4 }).setOrigin(0.5).setDepth(0.6);
    this.plateTxt.setPosition(px, py);
  }
  drawGauge() {                                                   // the SPIN gauge: a needle over a green / red dial
    const W = this.scale.width, H = this.scale.height, g = this.gaugeG, x = W * 0.12, y = H * 0.72, r = Math.min(54, H * 0.14); g.clear();
    g.fillStyle(0x0a0c10, 1).fillCircle(x, y, r + 6); g.fillStyle(0xd8dce4, 1).fillCircle(x, y, r + 2); g.fillStyle(0xf4f2ea, 1).fillCircle(x, y, r - 2);
    const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2;
    for (let k = 0; k <= 10; k++) { const a = a0 + (a1 - a0) * k / 10; g.lineStyle(3, k < 4 ? 0x3aa040 : k < 7 ? 0xffb03a : 0xd62828, 1).lineBetween(x + Math.cos(a) * (r - 12), y + Math.sin(a) * (r - 12), x + Math.cos(a) * (r - 4), y + Math.sin(a) * (r - 4)); }
    const v = Math.max(0, Math.min(1, (this.w - 0.4) / 1.1)), an = a0 + (a1 - a0) * v + Math.sin(this.t * 40) * 0.02 * this.w;
    g.lineStyle(4, 0x1a1012, 1).lineBetween(x, y, x + Math.cos(an) * (r - 8), y + Math.sin(an) * (r - 8)); g.fillStyle(0xd62828, 1).fillCircle(x, y, 5);
    this.gaugeTxt = this.gaugeTxt || this.add.text(0, 0, 'SPIN', { fontFamily: PIXEL, fontSize: '8px', color: '#1a1012' }).setOrigin(0.5).setDepth(0.6);
    this.gaugeTxt.setPosition(x, y + r * 0.45);
  }

  layout() {
    const W = this.scale.width, H = this.scale.height;
    if (this.backG) this.drawFactory();
    this.timeTxt.setPosition(W / 2, 8); this.gotTxt.setPosition(W / 2, 32); this.spinTxt.setPosition(W - 12, 12);
    this.msg.setPosition(W / 2, H * 0.36); this.countTxt.setPosition(W / 2, H * 0.6); this.exitBtn.setPosition(10, 10);
  }
  puff(x, y, n, col, spd, life, size) { ZeroGScene.prototype.puff.call(this, x, y, n, col, spd, life, size); }
  pop(x, y, txt, col) { ZeroGScene.prototype.pop.call(this, x, y, txt, col); }
  touchBtns() { const W = this.scale.width, H = this.scale.height, r = Math.max(28, Math.min(44, H * 0.1)); return { r, L: { x: 20 + r, y: H - 20 - r }, Rt: { x: 20 + r * 3.4, y: H - 20 - r }, B: { x: W - 30 - r * 1.6, y: H - 20 - r * 1.2 }, F: { x: W - 30 - r * 4.4, y: H - 20 - r } }; }
  readTouch() {
    const T = this.touchBtns(), st = { l: false, r: false, b: false, f: false };
    if (!this.isTouch) return st;
    for (const p of this.input.manager.pointers) {
      if (!p.isDown) continue;
      if (Math.hypot(p.x - T.L.x, p.y - T.L.y) < T.r * 1.3) st.l = true;
      else if (Math.hypot(p.x - T.Rt.x, p.y - T.Rt.y) < T.r * 1.3) st.r = true;
      else if (Math.hypot(p.x - T.B.x, p.y - T.B.y) < T.r * 1.5) st.b = true;
      else if (Math.hypot(p.x - T.F.x, p.y - T.F.y) < T.r * 1.3) st.f = true;
    }
    return st;
  }
  drawTouch(st) {
    const g = this.touchG || (this.touchG = this.add.graphics().setDepth(22)), T = this.touchBtns(); g.clear();
    const show = this.isTouch && !(Pad.state.connected && typeof LAST_INPUT !== 'undefined' && LAST_INPUT !== 'touch') && !this.done;
    if (this.touchLbl) this.touchLbl.setVisible(show);
    if (!show) return;
    const btn = (p, on, col, rr) => { g.fillStyle(0x000000, 0.35).fillCircle(p.x + 3, p.y + 3, rr); g.fillStyle(on ? col : 0x1a1020, on ? 0.85 : 0.5).fillCircle(p.x, p.y, rr); g.lineStyle(3, col, 0.9).strokeCircle(p.x, p.y, rr); };
    btn(T.L, st.l, 0xffd23f, T.r); btn(T.Rt, st.r, 0xffd23f, T.r); btn(T.B, st.b, 0x7dff8a, T.r * 1.25); btn(T.F, st.f, 0xff7a3a, T.r);
    const tri = (p, d) => g.fillStyle(0xffffff, 1).fillTriangle(p.x + d * T.r * 0.45, p.y, p.x - d * T.r * 0.3, p.y - T.r * 0.45, p.x - d * T.r * 0.3, p.y + T.r * 0.45);
    tri(T.L, -1); tri(T.Rt, 1);
    if (!this.touchLbl) { const lab = t => this.add.text(0, 0, t, { fontFamily: PIXEL, fontSize: '9px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 3 }).setOrigin(0.5).setDepth(23); this.touchLbl = this.add.container(0, 0).setDepth(23); this.touchLbl.add([lab('JUMP'), lab('FIRE')]); }
    this.touchLbl.list[0].setPosition(T.B.x, T.B.y); this.touchLbl.list[1].setPosition(T.F.x, T.F.y);
  }
  bonk(why, secs) {
    if (this.penaltyT > 0 || this.done) return;
    secs = secs || 2;
    this.penaltyT = 0.8; this.timeLeft = Math.max(0, this.timeLeft - secs);
    Sound.sfx(['ouch1', 'ouch2', 'ouch3'][Math.floor(Math.random() * 3)]); this.cameras.main.shake(140, 0.008);
    this.pop(this.scale.width / 2, this.scale.height * 0.5, why + ' -' + secs + 's', '#ff7a5a');
  }
  launch(inward, tang) {                                         // leave the wall: inertial velocity = the wall's own speed + your run + the jump
    const phi = this.a + this.D, rx = Math.cos(phi), ry = Math.sin(phi), tx = -ry, ty = rx, vt = this.w * this.RD + tang;
    this.pos = { x: rx * this.RD, y: ry * this.RD };
    this.vel = { x: tx * vt - rx * inward, y: ty * vt - ry * inward };
    this.onWall = false;
  }

  update(time, dms) {
    const dt = Math.min(0.05, dms / 1000); this.t += dt;
    const P = this.P, W = this.scale.width, H = this.scale.height, RD = this.RD;
    this.penaltyT = Math.max(0, this.penaltyT - dt);
    // ---- the spin: a slow cycle between fast (heavy, short throws) and slow (floaty, jumps fly right across)
    this.spinPhase += dt;
    const cyc = (this.spinPhase % 14) / 14, low = cyc > 0.55 && cyc < 0.9;
    const wTarget = low ? 0.55 : 1.35;
    this.w += (wTarget - this.w) * Math.min(1, dt * 1.2);
    if (low !== this.spinLow) { this.spinLow = low; if (this.t > 1) { Sound.sfx(low ? 'whoosh' : 'charge'); this.pop(W / 2, H * 0.3, low ? 'SPIN DOWN: JUMP ACROSS!' : 'SPIN UP!', low ? '#9fd8ff' : '#ffb07a'); } }
    this.D += this.w * dt;
    // ---- input
    const k = this.keys, ts = this.readTouch();
    let ax = 0, jump = false, fire = false, aimAt = null;
    if (k) { ax = (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0); jump = k.up.isDown || k.w.isDown || k.space.isDown; fire = k.z.isDown || k.x.isDown || k.j.isDown; }
    if (Pad.state.connected) { if (Pad.state.left || Pad.state.lx < -0.3) ax = -1; if (Pad.state.right || Pad.state.lx > 0.3) ax = 1; if (Pad.state.jump) jump = true; if (Pad.state.fire) fire = true; if (Pad.state.aimOn) { fire = true; aimAt = { sx: Pad.state.aimX, sy: Pad.state.aimY }; } }
    if (ts.l) ax = -1; if (ts.r) ax = 1; if (ts.b) jump = true; if (ts.f) fire = true;
    const mp = this.input.mousePointer;
    if (!this.isTouch && mp && mp.leftButtonDown() && !this.exitBtn.getBounds().contains(mp.x, mp.y)) { fire = true; const q = this.world.pointToContainer({ x: mp.x, y: mp.y }); aimAt = { wx: q.x, wy: q.y }; }
    this.drawTouch(ts);
    if (this.intro > 0) {
      this.intro -= dt; ax = 0; jump = false;
      const show = this.intro > 0.6 ? String(Math.max(1, Math.ceil(this.intro - 0.6))) : 'GO!';
      if (show !== this.count) { this.count = show; Sound.sfx(show === 'GO!' ? 'power' : 'combo'); this.countTxt.setText(show).setScale(1.8).setAlpha(1).setColor(show === 'GO!' ? '#7dff8a' : '#ffd23f'); this.tweens.add({ targets: this.countTxt, scale: 1, duration: 260, ease: 'Back.out' }); if (show === 'GO!') this.tweens.add({ targets: this.countTxt, alpha: 0, delay: 450, duration: 300 }); }
    }
    if (this.done || this.out || this.intro > 0) { ax = 0; jump = false; fire = false; }
    // standard controls: left/right are HIS left/right (like running round a planet), so upside down over the top,
    // right runs screen-left. His right is the way the angle DEcreases round the drum.
    if (ax) P.facing = ax;
    const dirA = -ax;
    const jumpPress = jump && !this.jumpWas; this.jumpWas = jump;
    // ---- on the wall: run round it (the paddles creep round and shove you if you don't jump them)
    if (this.onWall) {
      this.run += (dirA * 230 - this.run) * Math.min(1, dt * 10);
      this.fuel = Math.min(1, this.fuel + dt * 0.8);
      this.a += this.run / RD * dt;
      if (Math.abs(this.run) > 60 && Math.random() < dt * 14) { const phi = this.a + this.D; this.fx.push({ x: Math.cos(phi) * (RD - 4), y: Math.sin(phi) * (RD - 4), vx: -Math.sin(phi) * (this.w * RD) * 0.6 - Math.cos(phi) * 60, vy: Math.cos(phi) * (this.w * RD) * 0.6 - Math.sin(phi) * 60, life: 0.5, max: 0.5, col: 0xf0ecd0 }); }
      if (jumpPress) { this.launch(400, this.run); Sound.sfx('jump'); this.puff(Math.cos(this.a + this.D) * RD, Math.sin(this.a + this.D) * RD, 5, 0xf0ecd0, 100, 0.3, 2); }
    } else {
      // ---- flying: a dead straight line (no gravity in here), with a touch of air-steer along his own sideways
      const phi = Math.atan2(this.pos.y, this.pos.x), tx = -Math.sin(phi), ty = Math.cos(phi);
      this.vel.x += tx * dirA * 160 * dt; this.vel.y += ty * dirA * 160 * dt;
      if (jump && !jumpPress && this.fuel > 0) {                // JETPACK: hold jump in the air to push in towards the middle
        this.fuel = Math.max(0, this.fuel - dt / 1.6); this.vel.x -= Math.cos(phi) * 520 * dt; this.vel.y -= Math.sin(phi) * 520 * dt; this.jetting = true;
        if (Math.random() < dt * 40) this.fx.push({ x: this.pos.x + Math.cos(phi) * 20, y: this.pos.y + Math.sin(phi) * 20, vx: Math.cos(phi) * 120, vy: Math.sin(phi) * 120, life: 0.3, max: 0.3, col: 0xffa21a });
      } else this.jetting = false;
      this.pos.x += this.vel.x * dt; this.pos.y += this.vel.y * dt;
      const r = Math.hypot(this.pos.x, this.pos.y);
      if (r >= RD) {                                             // touch down: back on the wall, wherever it's turned to
        const phi2 = Math.atan2(this.pos.y, this.pos.x);
        const hz = !(this.grace > 0) && this.hatches.find(h => h.open > 0.5 && Math.abs(angDiff(phi2 - this.D, h.a)) < h.half);
        if (hz) { this.suckOut(); return; }
        this.a = phi2 - this.D; this.onWall = true;
        const vt = this.vel.x * -Math.sin(phi2) + this.vel.y * Math.cos(phi2);
        this.run = Math.max(-260, Math.min(260, (vt - this.w * RD) * 0.35));   // the skid as the moving floor grabs you
        Sound.sfx('clunk'); this.puff(Math.cos(phi2) * RD, Math.sin(phi2) * RD, 8, 0xf0ecd0, 140, 0.35, 2);
      }
    }
    this.grace = Math.max(0, (this.grace || 0) - dt);
    // ---- hatches: closed, a flashing warning, then open onto space: the air roars out and drags you along the wall towards
    // it. Get to the gap and you're SUCKED OUT. A rat on a rocket pack flies in whenever one opens.
    for (const h of this.hatches) {
      h.t -= dt;
      if (h.t <= 0) {
        if (h.st === 'closed') { h.st = 'warn'; h.t = 1.0; }
        else if (h.st === 'warn') { h.st = 'open'; h.t = 3.4; Sound.sfx('hiss'); if (this.ens.length < 4 && this.intro <= 0) this.spawnRat(h); }
        else { h.st = 'closed'; h.t = 3 + Math.random() * 3; }
      }
      h.open += ((h.st === 'open' ? 1 : 0) - h.open) * Math.min(1, dt * 6);
      if (h.open > 0.3 && !this.out && this.intro <= 0 && !this.done) {
        if (this.onWall && !(this.grace > 0)) {
          const d = angDiff(h.a, this.a), arc = Math.abs(d) * RD;
          if (arc < 150) this.a += Math.sign(d) * (150 - arc) / 150 * 1.1 * h.open * dt;      // the draught drags you towards it
          if (Math.abs(d) < h.half * h.open) { this.suckOut(); break; }
        }
        if (Math.random() < dt * 30) { const ang = h.a + this.D + (Math.random() - 0.5) * 0.9, rr = RD - Math.random() * 120; this.fx.push({ x: Math.cos(ang) * rr, y: Math.sin(ang) * rr, vx: (Math.cos(h.a + this.D) * RD - Math.cos(ang) * rr) * 2, vy: (Math.sin(h.a + this.D) * RD - Math.sin(ang) * rr) * 2, life: 0.45, max: 0.45, col: 0xd8e8ff }); }
      }
    }
    if (this.out) {                                              // sucked out into space... and thrown back in at the bottom
      this.out.t += dt;
      if (this.out.t > 1.1) {                                   // back in at the bottom, clear of any open hatch, with a moment's grace
        let a = Math.PI / 2 - this.D;
        for (let k = 0; k < 8 && this.hatches.some(h => h.st !== 'closed' && Math.abs(angDiff(h.a, a)) < 0.9); k++) a += 0.5;
        this.out = null; this.onWall = true; this.a = a; this.run = 0; this.penaltyT = 1.2; this.grace = 1.8;
      }
    }
    // ---- the rats: they fly in through an open hatch, hover in the middle (they don't spin with the drum) and shoot
    const cp0 = this.chrisPos();
    for (let i = this.ens.length - 1; i >= 0; i--) {
      const e = this.ens[i];
      e.t += dt; e.flash = Math.max(0, e.flash - dt);
      const tx = Math.cos(e.ha) * e.hr, ty = Math.sin(e.ha) * e.hr;
      e.ha += 0.25 * dt; e.x += (tx - e.x) * Math.min(1, dt * 1.6); e.y += (ty - e.y) * Math.min(1, dt * 1.6);
      e.cd -= dt;
      if (e.cd <= 0 && e.t > 1.2 && !this.done && !this.out) {
        e.cd = 1.6 + Math.random() * 1.2;
        const dx = cp0.x - e.x, dy = cp0.y - e.y, L = Math.hypot(dx, dy) || 1;
        const im = this.add.image(e.x, e.y, 'pepper').setScale(1.2); this.world.add(im);
        this.ebul.push({ x: e.x, y: e.y, vx: dx / L * 230, vy: dy / L * 230, im });
        Sound.sfx('cube');
      }
      e.im.setPosition(e.x, e.y).setFlipX(cp0.x < e.x).setRotation(Math.sin(e.t * 3) * 0.15).clearTint();
      if (e.flash > 0) e.im.setTintFill(0xffffff);
      if (e.hp <= 0) {
        this.puff(e.x, e.y, 16, 0xffc040, 220, 0.5, 3); Sound.sfx('splat'); this.timeLeft += 1;
        this.pop(this.scale.width / 2, this.scale.height * 0.45, 'RAT DOWN! +1s', '#7dff8a');
        e.im.destroy(); this.ens.splice(i, 1);
      }
    }
    for (let i = this.ebul.length - 1; i >= 0; i--) {
      const b = this.ebul[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.im.setPosition(b.x, b.y).setRotation(b.im.rotation + dt * 8);
      const hitC = !this.out && this.penaltyT <= 0 && Math.hypot(b.x - cp0.x, b.y - cp0.y) < 20;
      if (hitC) { this.bonk('OUCH'); this.puff(b.x, b.y, 8, 0xff6a3a, 160, 0.3, 2); }
      if (hitC || Math.hypot(b.x, b.y) > RD) { b.im.destroy(); this.ebul.splice(i, 1); }
    }
    // ---- the Mac-Grinder: fires from the gun, aims at the mouse / right stick, or the nearest rat
    this.fireCd -= dt;
    let aimDir = null;
    if (aimAt && aimAt.wx !== undefined) { const dx = aimAt.wx - cp0.x, dy = aimAt.wy - cp0.y, L = Math.hypot(dx, dy) || 1; aimDir = { x: dx / L, y: dy / L }; }
    else if (aimAt) { const L = Math.hypot(aimAt.sx, aimAt.sy) || 1; aimDir = { x: aimAt.sx / L, y: aimAt.sy / L }; }
    else if (fire && this.ens.length) { let best = null, bd = 1e9; for (const e of this.ens) { const d = Math.hypot(e.x - cp0.x, e.y - cp0.y); if (d < bd) { bd = d; best = e; } } const dx = best.x - cp0.x, dy = best.y - cp0.y; aimDir = { x: dx / bd, y: dy / bd }; }
    const phiP = Math.atan2(cp0.y, cp0.x), up = { x: -Math.cos(phiP), y: -Math.sin(phiP) }, right = { x: Math.sin(phiP), y: -Math.cos(phiP) };
    if (aimDir) {
      const fwdS = aimDir.x * right.x + aimDir.y * right.y; if (Math.abs(fwdS) > 0.15) P.facing = fwdS > 0 ? 1 : -1;
      const fx2 = right.x * P.facing, fy2 = right.y * P.facing;
      P.aimA = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, Math.atan2(aimDir.x * up.x + aimDir.y * up.y, aimDir.x * fx2 + aimDir.y * fy2)));
    } else P.aimA = (P.aimA || 0) * Math.max(0, 1 - dt * 8);
    if (fire && this.fireCd <= 0 && this.muz) {
      this.fireCd = 0.11; P.firing = 0.12;
      const im = this.add.image(this.muz.x, this.muz.y, 'macaroni').setScale(1.2); this.world.add(im);
      this.shots.push({ x: this.muz.x, y: this.muz.y, vx: this.muz.dx * 720, vy: this.muz.dy * 720, im, life: 1 });
      Sound.sfx('shoot');
    }
    P.firing = Math.max(0, (P.firing || 0) - dt);
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const b = this.shots[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; b.im.setPosition(b.x, b.y).setRotation(b.im.rotation + dt * 12);
      let dead = b.life <= 0 || Math.hypot(b.x, b.y) > RD;
      for (const e of this.ens) if (!dead && Math.hypot(b.x - e.x, b.y - e.y) < 22) { e.hp--; e.flash = 0.06; dead = true; Sound.sfx('squish'); }
      if (dead) { b.im.destroy(); this.shots.splice(i, 1); }
    }
    // ---- ingredients (in the drum's frame)
    const cp = this.chrisPos(), ca = Math.cos(-this.D), sa = Math.sin(-this.D);
    const lx = cp.x * ca - cp.y * sa, ly = cp.x * sa + cp.y * ca;          // Chris in drum coordinates
    for (const it of this.items) {
      if (it.got) continue;
      it.im.setRotation(Math.sin(this.t * 1.4 + it.ph) * 0.3);
      if (!this.done && this.intro <= 0 && Math.hypot(lx - it.x, ly - it.y) < 40) {
        it.got = true; this.got++; this.timeLeft += 1; Sound.sfx('pickup');
        this.tweens.add({ targets: it.im, scale: 0, angle: 360, duration: 250, onComplete: () => it.im.destroy() });
        this.pop(W / 2, H * 0.42, it.r < 120 ? 'FROM THE MIDDLE! +1s' : '+1s', '#7dff8a');
        if (this.got >= this.items.length) this.finish(true);
      }
    }
    // ---- clock
    if (!this.done && this.intro <= 0) { this.timeLeft -= dt; if (this.timeLeft <= 0) { this.timeLeft = 0; this.finish(false); } }
    this.timeTxt.setText(String(Math.ceil(this.timeLeft))).setColor(this.timeLeft < 10 && Math.floor(this.t * 4) % 2 ? '#ff5a3a' : '#ffd23f');
    this.gotTxt.setText('INGREDIENTS ' + this.got + ' / ' + this.items.length);
    this.spinTxt.setText(this.w < 0.8 ? 'SPIN: SLOW' : 'SPIN: FAST').setColor(this.w < 0.8 ? '#9fd8ff' : '#ffb07a');
    this.drawGauge();

    // ---- draw: the drum turns, items glow, the paddles
    this.drum.setRotation(this.D);
    const gg = this.glowG; gg.clear();
    for (const it of this.items) if (!it.got) gg.fillStyle(it.col, 0.16 + 0.08 * Math.sin(this.t * 4 + it.ph)).fillCircle(it.x, it.y, 26);
    const pg = this.padG; pg.clear();
    for (const h of this.hatches) {                                       // a hatch in the wall: a window onto space when open
      const n = 10, pts = (r0, r1, f) => { const o = []; for (let k = 0; k <= n; k++) { const a2 = h.a - h.half * f + 2 * h.half * f * k / n; o.push({ x: Math.cos(a2) * r0, y: Math.sin(a2) * r0 }); } for (let k = n; k >= 0; k--) { const a2 = h.a - h.half * f + 2 * h.half * f * k / n; o.push({ x: Math.cos(a2) * r1, y: Math.sin(a2) * r1 }); } return o; };
      if (h.st !== 'closed') pg.fillStyle(h.st === 'open' ? 0xff3a2a : 0xffd23f, h.st === 'open' ? 0.18 : (Math.floor(this.t * 8) % 2) * 0.22).fillPoints(pts(RD - 70, RD - 4, 1.5), true);   // danger glow on the floor
      pg.fillStyle(0x1a1012, 1).fillPoints(pts(RD - 4, RD + 36, 1.25), true);
      if (h.open > 0.02) { pg.fillStyle(0x020208, 1).fillPoints(pts(RD - 4, RD + 36, h.open), true); for (let k = 0; k < 6; k++) { const a2 = h.a + (k / 5 - 0.5) * h.half * h.open * 1.6, rr = RD + 8 + (k * 7) % 22; pg.fillStyle(0xffffff, 0.8).fillRect(Math.cos(a2) * rr, Math.sin(a2) * rr, 2, 2); } }
      for (const sd of [-1, 1]) {                                         // the two doors, sliding apart
        const a0 = h.a + sd * h.half * h.open, a1 = h.a + sd * h.half * 1.25, q = [];
        for (let k = 0; k <= 6; k++) { const a2 = a0 + (a1 - a0) * k / 6; q.push({ x: Math.cos(a2) * (RD - 2), y: Math.sin(a2) * (RD - 2) }); }
        for (let k = 6; k >= 0; k--) { const a2 = a0 + (a1 - a0) * k / 6; q.push({ x: Math.cos(a2) * (RD + 34), y: Math.sin(a2) * (RD + 34) }); }
        if (Math.abs(a1 - a0) > 0.005) pg.fillStyle(0x8a929e, 1).fillPoints(q, true);
      }
      const warn = h.st === 'warn' && Math.floor(this.t * 8) % 2, lightCol = h.st === 'open' ? 0xff3a2a : warn ? 0xffd23f : 0x3aa040;
      for (const sd of [-1, 1]) { const a2 = h.a + sd * h.half * 1.4; pg.fillStyle(lightCol, 1).fillCircle(Math.cos(a2) * (RD + 12), Math.sin(a2) * (RD + 12), 5); }
    }
    // Chris
    const phiC = Math.atan2(cp.y, cp.x);
    P.h = this.onWall ? 0 : 40; P.vh = this.onWall ? 0 : 1; P.vx = this.onWall ? -this.run : 0; P.thrusting = !!this.jetting;
    this.rig.update(P, dt, cp.x, cp.y, 1, this.penaltyT > 0 && Math.floor(this.t * 20) % 2 ? 0.4 : 1, 0);
    this.rig.root.setRotation(phiC - Math.PI / 2);                // feet to the wall (outwards)
    if (this.out) { const k2 = Math.min(1, this.out.t / 0.9); this.rig.root.setAlpha(1 - k2).setScale(this.rig.root.scaleX * (1 - k2 * 0.7), this.rig.root.scaleY * (1 - k2 * 0.7)).setPosition(this.out.x * (1 + k2 * 0.5), this.out.y * (1 + k2 * 0.5)).setRotation(this.out.t * 12); }
    { const tip = this.rig.auger, m = tip.getWorldTransformMatrix(), a1 = m.transformPoint(tip.width * (1 - tip.originX), 0), a0 = m.transformPoint(-tip.width * tip.originX, 0);
      const p1 = this.world.pointToContainer({ x: a1.x, y: a1.y }), p0 = this.world.pointToContainer({ x: a0.x, y: a0.y }), L = Math.hypot(p1.x - p0.x, p1.y - p0.y) || 1;
      this.muz = { x: p1.x, y: p1.y, dx: (p1.x - p0.x) / L, dy: (p1.y - p0.y) / L }; }
    const fg = this.fxG; fg.clear();
    if (!this.onWall && Math.random() < dt * 30) this.fx.push({ x: cp.x, y: cp.y, vx: 0, vy: 0, life: 0.4, max: 0.4, col: 0x9fd8ff });
    for (let i = this.fx.length - 1; i >= 0; i--) { const q = this.fx[i]; q.life -= dt; if (q.life <= 0) { this.fx.splice(i, 1); continue; } q.x += (q.vx || 0) * dt; q.y += (q.vy || 0) * dt; fg.fillStyle(q.col || 0x9fd8ff, q.life / q.max * 0.6).fillCircle(q.x, q.y, 4); }
    // ---- camera: FIXED on the whole drum, so you SEE it spin and Chris get carried round it (upside down over the top)
    // like a hamster in a wheel. A faint judder that grows with the spin.
    const sc = (H * 0.47) / (RD + 40), jud = (this.w - 0.5) * 1.6;
    this.world.setScale(sc).setRotation(0).setPosition(W / 2 + (Math.random() - 0.5) * jud, H * 0.53 + (Math.random() - 0.5) * jud);
  }
  spawnRat(h) {                                                   // a rat on a rocket pack, in through the hatch
    const ang = h.a + this.D, im = this.add.image(Math.cos(ang) * this.RD, Math.sin(ang) * this.RD, 'rocketrat').setScale(1.7); this.world.add(im);
    this.ens.push({ x: Math.cos(ang) * this.RD, y: Math.sin(ang) * this.RD, ha: ang, hr: 80 + Math.random() * 90, hp: 3, cd: 1.5, t: 0, flash: 0, im });
    Sound.sfx('whoosh');
  }
  suckOut() {
    const cp = this.chrisPos();
    this.out = { t: 0, x: cp.x, y: cp.y }; this.onWall = true; this.run = 0;
    Sound.sfx('whoosh'); this.cameras.main.shake(300, 0.012);
    this.penaltyT = 0; this.bonk('SUCKED OUT!', 3);
  }
  chrisPos() {
    if (!this.onWall) return this.pos;
    const phi = this.a + this.D; return { x: Math.cos(phi) * this.RD, y: Math.sin(phi) * this.RD };
  }

  finish(won) {
    if (this.done) return;
    this.done = true; this.doneT = this.t;
    let body;
    if (won) {
      Sound.sfx('power'); Sound.music('win'); Sound.say('woohoo', { force: true });
      if (this.prize) { Progress.giveGun(this.prize.id); body = 'ALL 12!\n\nNEW GUN: ' + this.prize.name; }
      else { const lives = Math.min(CFG.maxLives, (this.registry.get('lives') || CFG.startLives) + 1); this.registry.set('lives', lives); body = 'ALL 12 INGREDIENTS!\n\n+1 LIFE'; }
      body += '\n(' + Math.ceil(this.timeLeft) + 's TO SPARE)';
    } else { Sound.music('lose'); body = 'OUT OF TIME!\n\n' + this.got + ' / ' + this.items.length + ' INGREDIENTS'; }
    const W = this.scale.width, H = this.scale.height, D = 30;
    this.add.rectangle(0, 0, W, H, 0x000000, 0.55).setOrigin(0).setDepth(D);
    this.add.text(W / 2, H * 0.24, won ? 'BONUS CLEAR!' : 'TIME UP', { fontFamily: PIXEL, fontSize: '22px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 6 }).setOrigin(0.5).setDepth(D + 1);
    this.add.text(W / 2, H * 0.36, body, { fontFamily: PIXEL, fontSize: '10px', color: '#ffffff', align: 'center', lineSpacing: 8 }).setOrigin(0.5, 0).setDepth(D + 1);
    const pad = typeof inputDevice === 'function' && inputDevice() === 'pad';
    const btn = (x, label, fn, col) => {
      const b = this.add.text(x, H * 0.78, label, { fontFamily: PIXEL, fontSize: '11px', color: '#1a1020', backgroundColor: col, padding: { x: 12, y: 10 } }).setOrigin(0.5).setDepth(D + 2).setInteractive({ useHandCursor: true });
      b.on('pointerup', () => { if (this.t - this.doneT > 0.5) fn(); });
    };
    btn(W / 2 - 80, pad ? 'A: MAP' : 'MAP', () => this.leave(), '#ffd23f');
    btn(W / 2 + 80, pad ? 'X: AGAIN' : 'AGAIN', () => this.again(), '#ffb07a');
    this.exitBtn.setVisible(false);
  }
  again() { if (this.leaving) return; this.leaving = true; this.cameras.main.fadeOut(200, 0, 0, 0); this.time.delayedCall(220, () => this.scene.restart()); }
  leave() { if (this.leaving) return; this.leaving = true; this.cameras.main.fadeOut(250, 0, 0, 0); this.time.delayedCall(280, () => this.scene.start('select')); }
}
