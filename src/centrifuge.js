// BONUS: the CENTRIFUGE FERMENTER. Chris is inside a huge spinning steel drum where the curds are separated. There's
// no gravity in here: the spin pins him to the inside of the wall, and "down" is always outwards, so the floor curves
// up all round him and the far side of the drum hangs upside down overhead.
//
// The fun is the real physics: in the air he flies in a STRAIGHT LINE (nothing pulls him) while the drum turns under
// him, so a jump lands further round than you'd think. Running WITH the spin makes you "heavier" and throws you
// forward; running AGAINST it cancels the spin out, so a jump goes straight across. The spin also rises and falls:
// when it slows, jumps sail right across the middle, which is the only way to reach the ingredients floating near the
// axle. Stirring paddles sweep round the wall: jump them. Grab all 12 for the prize.
//
// Controls: left/right run, jump (Space/Up/W/Z, controller A). Touch: on-screen buttons.
class CentrifugeScene extends Phaser.Scene {
  constructor() { super('centrifuge'); }

  create() {
    buildAllTextures(this);
    const RD = this.RD = 330, rnd = (a, b) => a + Math.random() * (b - a);
    this.cameras.main.setBackgroundColor('#0a0806').fadeIn(300, 0, 0, 0);
    Sound.init(); Sound.music('level7');
    this.leaving = false; this.done = false; this.t = 0; this.timeLeft = 50; this.got = 0; this.penaltyT = 0; this.touchG = null; this.touchLbl = null;
    this.intro = 3.0; this.count = -1;
    // the drum: its angle D and spin w (radians/s), easing between fast and slow
    this.D = 0; this.w = 1.3; this.spinPhase = 0; this.spinLow = false;
    // Chris: on the wall (a = his angle IN THE DRUM, run = his running speed along it) or flying (pos/vel, inertial)
    this.onWall = true; this.a = -Math.PI / 2; this.run = 0; this.pos = { x: 0, y: 0 }; this.vel = { x: 0, y: 0 };
    this.P = { h: 0, floor: 0, vh: 0, vx: 0, thrusting: false, firing: 0, aimA: 0, power: 0, duck: false, facing: 1 };
    this.fx = [];

    // ---- the world: everything inertial lives in this container, which is rotated/moved to make the camera
    this.world = this.add.container(0, 0).setDepth(1);
    this.drum = this.add.container(0, 0);                       // the drum and everything fixed to it, turned by D
    this.world.add(this.drum);
    this.buildDrum();
    // paddles: stirring blades standing up off the wall, creeping round the drum (relative to it)
    this.paddles = [0, 2.1, 4.2].map(p => ({ a: p + rnd(-0.3, 0.3), sp: 0.42, len: 95, hit: 0 }));
    this.padG = this.add.graphics(); this.drum.add(this.padG);
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
    this.rig = new ChrisRig(this); this.rig.setWeapon(WEAPONS[0]); this.rig.gunArm.setVisible(false);
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
    this.msg = this.add.text(0, 0, 'CENTRIFUGE FERMENTER\nTHE SPIN HOLDS YOU TO THE WALL\nJUMPS FLY STRAIGHT: THE DRUM TURNS UNDER YOU\nWHEN THE SPIN SLOWS, JUMP RIGHT ACROSS!', Object.assign(f(10, '#ffcf9a'), { align: 'center', lineSpacing: 8 })).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: this.msg, alpha: 0, delay: 2600, duration: 500 });
    this.countTxt = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '40px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 8 }).setOrigin(0.5).setDepth(21);
    this.exitBtn = this.add.text(0, 0, '< MAP', Object.assign(f(10, '#ffffff'), { backgroundColor: '#2a1d10', padding: { x: 8, y: 7 } })).setDepth(25).setInteractive({ useHandCursor: true });
    this.exitBtn.on('pointerdown', () => this.leave());
    this.layout(); this.scale.on('resize', this.layout, this); this.events.once('shutdown', () => this.scale.off('resize', this.layout, this));
    this.isTouch = (navigator.maxTouchPoints || 0) > 0 || ('ontouchstart' in window);

    this.keys = this.input.keyboard ? this.input.keyboard.addKeys({ left: 'LEFT', right: 'RIGHT', up: 'UP', a: 'A', d: 'D', w: 'W', z: 'Z', space: 'SPACE' }) : null;
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
    // whey film along the wall, and lumps of curd stuck in it
    g.lineStyle(10, 0xf0ecd0, 0.45).strokeCircle(0, 0, RD - 4);
    for (let k = 0; k < 26; k++) { const a = rnd(0, 6.3), r = RD - rnd(4, 10); g.fillStyle(0xfff6d8, 1).fillCircle(Math.cos(a) * r, Math.sin(a) * r, rnd(4, 9)); g.fillStyle(0xd8ccaa, 1).fillCircle(Math.cos(a) * r + 2, Math.sin(a) * r + 2, 3); }
    // the hub: the axle, with the prize hanging off it
    g.fillStyle(0x3a3e48, 1).fillCircle(0, 0, 22); g.fillStyle(0xa8b0c0, 1).fillCircle(0, 0, 14); g.fillStyle(0x2a2e38, 1).fillCircle(0, 0, 5);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; g.fillStyle(0xa8b0c0, 1).fillRect(Math.cos(a) * 18 - 3, Math.sin(a) * 18 - 3, 6, 6); }
    this.drum.add(g);
  }

  layout() {
    const W = this.scale.width, H = this.scale.height;
    this.timeTxt.setPosition(W / 2, 8); this.gotTxt.setPosition(W / 2, 32); this.spinTxt.setPosition(W - 12, 12);
    this.msg.setPosition(W / 2, H * 0.36); this.countTxt.setPosition(W / 2, H * 0.6); this.exitBtn.setPosition(10, 10);
  }
  puff(x, y, n, col, spd, life, size) { ZeroGScene.prototype.puff.call(this, x, y, n, col, spd, life, size); }
  pop(x, y, txt, col) { ZeroGScene.prototype.pop.call(this, x, y, txt, col); }
  touchBtns() { const W = this.scale.width, H = this.scale.height, r = Math.max(28, Math.min(44, H * 0.1)); return { r, L: { x: 20 + r, y: H - 20 - r }, Rt: { x: 20 + r * 3.4, y: H - 20 - r }, B: { x: W - 30 - r * 1.6, y: H - 20 - r * 1.2 } }; }
  readTouch() {
    const T = this.touchBtns(), st = { l: false, r: false, b: false };
    if (!this.isTouch) return st;
    for (const p of this.input.manager.pointers) {
      if (!p.isDown) continue;
      if (Math.hypot(p.x - T.L.x, p.y - T.L.y) < T.r * 1.3) st.l = true;
      else if (Math.hypot(p.x - T.Rt.x, p.y - T.Rt.y) < T.r * 1.3) st.r = true;
      else if (Math.hypot(p.x - T.B.x, p.y - T.B.y) < T.r * 1.6) st.b = true;
    }
    return st;
  }
  drawTouch(st) {
    const g = this.touchG || (this.touchG = this.add.graphics().setDepth(22)), T = this.touchBtns(); g.clear();
    const show = this.isTouch && !(Pad.state.connected && typeof LAST_INPUT !== 'undefined' && LAST_INPUT !== 'touch') && !this.done;
    if (this.touchLbl) this.touchLbl.setVisible(show);
    if (!show) return;
    const btn = (p, on, col, rr) => { g.fillStyle(0x000000, 0.35).fillCircle(p.x + 3, p.y + 3, rr); g.fillStyle(on ? col : 0x1a1020, on ? 0.85 : 0.5).fillCircle(p.x, p.y, rr); g.lineStyle(3, col, 0.9).strokeCircle(p.x, p.y, rr); };
    btn(T.L, st.l, 0xffd23f, T.r); btn(T.Rt, st.r, 0xffd23f, T.r); btn(T.B, st.b, 0x7dff8a, T.r * 1.25);
    const tri = (p, d) => g.fillStyle(0xffffff, 1).fillTriangle(p.x + d * T.r * 0.45, p.y, p.x - d * T.r * 0.3, p.y - T.r * 0.45, p.x - d * T.r * 0.3, p.y + T.r * 0.45);
    tri(T.L, -1); tri(T.Rt, 1);
    if (!this.touchLbl) this.touchLbl = this.add.text(0, 0, 'JUMP', { fontFamily: PIXEL, fontSize: '9px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 3 }).setOrigin(0.5).setDepth(23);
    this.touchLbl.setPosition(T.B.x, T.B.y);
  }
  bonk(why) {
    if (this.penaltyT > 0 || this.done) return;
    this.penaltyT = 0.8; this.timeLeft = Math.max(0, this.timeLeft - 2);
    Sound.sfx(['ouch1', 'ouch2', 'ouch3'][Math.floor(Math.random() * 3)]); this.cameras.main.shake(140, 0.008);
    this.pop(this.scale.width / 2, this.scale.height * 0.5, why + ' -2s', '#ff7a5a');
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
    let ax = 0, jump = false;
    if (k) { ax = (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0); jump = k.up.isDown || k.w.isDown || k.z.isDown || k.space.isDown; }
    if (Pad.state.connected) { if (Pad.state.left || Pad.state.lx < -0.3) ax = -1; if (Pad.state.right || Pad.state.lx > 0.3) ax = 1; if (Pad.state.jump) jump = true; }
    if (ts.l) ax = -1; if (ts.r) ax = 1; if (ts.b) jump = true;
    this.drawTouch(ts);
    if (this.intro > 0) {
      this.intro -= dt; ax = 0; jump = false;
      const show = this.intro > 0.6 ? String(Math.max(1, Math.ceil(this.intro - 0.6))) : 'GO!';
      if (show !== this.count) { this.count = show; Sound.sfx(show === 'GO!' ? 'power' : 'combo'); this.countTxt.setText(show).setScale(1.8).setAlpha(1).setColor(show === 'GO!' ? '#7dff8a' : '#ffd23f'); this.tweens.add({ targets: this.countTxt, scale: 1, duration: 260, ease: 'Back.out' }); if (show === 'GO!') this.tweens.add({ targets: this.countTxt, alpha: 0, delay: 450, duration: 300 }); }
    }
    if (this.done) { ax = 0; jump = false; }
    // "right" on screen = increasing angle round the drum (he's always shown standing at the bottom)
    if (ax) P.facing = ax;
    const jumpPress = jump && !this.jumpWas; this.jumpWas = jump;
    // ---- on the wall: run round it (the paddles creep round and shove you if you don't jump them)
    if (this.onWall) {
      this.run += (ax * 230 - this.run) * Math.min(1, dt * 10);
      this.a += this.run / RD * dt;
      if (jumpPress) { this.launch(400, this.run); Sound.sfx('jump'); this.puff(Math.cos(this.a + this.D) * RD, Math.sin(this.a + this.D) * RD, 5, 0xf0ecd0, 100, 0.3, 2); }
    } else {
      // ---- flying: a dead straight line (no gravity in here), with a touch of air-steer along his own sideways
      const phi = Math.atan2(this.pos.y, this.pos.x), tx = -Math.sin(phi), ty = Math.cos(phi);
      this.vel.x += tx * ax * 160 * dt; this.vel.y += ty * ax * 160 * dt;
      this.pos.x += this.vel.x * dt; this.pos.y += this.vel.y * dt;
      const r = Math.hypot(this.pos.x, this.pos.y);
      if (r >= RD) {                                             // touch down: back on the wall, wherever it's turned to
        const phi2 = Math.atan2(this.pos.y, this.pos.x);
        this.a = phi2 - this.D; this.onWall = true;
        const vt = this.vel.x * -Math.sin(phi2) + this.vel.y * Math.cos(phi2);
        this.run = Math.max(-260, Math.min(260, (vt - this.w * RD) * 0.35));   // the skid as the moving floor grabs you
        Sound.sfx('clunk'); this.puff(Math.cos(phi2) * RD, Math.sin(phi2) * RD, 8, 0xf0ecd0, 140, 0.35, 2);
      }
    }
    // ---- paddles: they creep round the drum; touching one on the wall knocks you off it
    for (const p of this.paddles) {
      p.a += p.sp * dt; p.hit = Math.max(0, p.hit - dt);
      if (this.intro > 0 || this.done) continue;
      let hit = false;
      if (this.onWall) hit = Math.abs(angDiff(this.a, p.a)) * RD < 16;
      else { const r = Math.hypot(this.pos.x, this.pos.y), phi = Math.atan2(this.pos.y, this.pos.x); hit = r > RD - p.len && Math.abs(angDiff(phi - this.D, p.a)) * r < 14; }
      if (hit && p.hit <= 0) {
        p.hit = 0.6;
        if (this.onWall) { this.a = p.a + 18 / RD; this.launch(280, 200); }
        else { const phi = Math.atan2(this.pos.y, this.pos.x); this.vel.x = -Math.cos(phi) * 260; this.vel.y = -Math.sin(phi) * 260; }
        Sound.sfx('bonk'); this.bonk('PADDLED');
      }
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
    this.spinTxt.setText('SPIN ' + '|'.repeat(Math.round(this.w * 6))).setColor(this.w < 0.8 ? '#9fd8ff' : '#ffb07a');

    // ---- draw: the drum turns, items glow, the paddles
    this.drum.setRotation(this.D);
    const gg = this.glowG; gg.clear();
    for (const it of this.items) if (!it.got) gg.fillStyle(it.col, 0.16 + 0.08 * Math.sin(this.t * 4 + it.ph)).fillCircle(it.x, it.y, 26);
    const pg = this.padG; pg.clear();
    for (const p of this.paddles) {                                       // a stirring blade standing up off the wall
      const c = Math.cos(p.a), s = Math.sin(p.a), tx = -s, ty = c, r0 = RD - 2, r1 = RD - p.len;
      const pts = [[r0, -10], [r1, -7], [r1 - 10, 0], [r1, 7], [r0, 10]].map(([r, w]) => ({ x: c * r + tx * w, y: s * r + ty * w }));
      pg.fillStyle(0x1a1012, 1).fillPoints(pts.map(q => ({ x: q.x + 2, y: q.y + 2 })), true); pg.fillStyle(p.hit > 0 ? 0xffffff : 0xb8c0cc, 1).fillPoints(pts, true);
      pg.lineStyle(2, 0x6a7080, 1).lineBetween(c * (r0 - 6), s * (r0 - 6), c * (r1 + 4), s * (r1 + 4));
    }
    // Chris
    const phiC = Math.atan2(cp.y, cp.x);
    P.h = this.onWall ? 0 : 40; P.vh = this.onWall ? 0 : 1; P.vx = this.onWall ? this.run : 0;
    this.rig.update(P, dt, cp.x, cp.y, 1, this.penaltyT > 0 && Math.floor(this.t * 20) % 2 ? 0.4 : 1, 0);
    this.rig.root.setRotation(phiC - Math.PI / 2 + (this.onWall ? 0 : 0));   // feet to the wall (outwards)
    const fg = this.fxG; fg.clear();
    if (!this.onWall && Math.random() < dt * 30) this.fx.push({ x: cp.x, y: cp.y, life: 0.4, max: 0.4 });
    for (let i = this.fx.length - 1; i >= 0; i--) { const q = this.fx[i]; q.life -= dt; if (q.life <= 0) { this.fx.splice(i, 1); continue; } fg.fillStyle(0x9fd8ff, q.life / q.max * 0.5).fillCircle(q.x, q.y, 4); }
    // ---- camera: turn the world so Chris's feet point down the screen, centred between him and the axle
    let target = phiC;
    this.camPhi = this.camPhi + angDiff(target, this.camPhi) * Math.min(1, dt * (this.onWall ? 8 : 3));
    const rot = Math.PI / 2 - this.camPhi, sc = Math.min(1, H / 470) * 0.9;
    const fx = cp.x * this.camK, fy = cp.y * this.camK, cr = Math.cos(rot), sr = Math.sin(rot);
    this.world.setScale(sc).setRotation(rot).setPosition(W / 2 - (fx * cr - fy * sr) * sc, H * 0.5 - (fx * sr + fy * cr) * sc);
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
