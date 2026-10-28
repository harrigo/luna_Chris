// BONUS II: the CERAMIC GRILL FREEFALL. Chris DIVES head-first down the inside of a giant ceramic kamado grill, from
// the lid to the hot coals, where the prize gun floats over the pizza stone. A trail of cheese marks the racing line
// through the gaps in the grill grates: follow it and each bit you snap up plays the next note up the scale (keep the
// chain going for a run of rising notes and bonus time). Bump a grate and you bounce off it and slide towards the
// nearest gap (no stopping dead); the glowing hot grates and the flare-ups from the side vents cost 2 seconds.
// Hold JUMP to BRAKE: Chris flips flat, belly down, and spreads his cape like a wingsuit (flapping comically), which
// slows the fall right down; it costs nothing but time. Hold DOWN to BOOST: his jet boots (pointing up now) fire and
// drive him down faster, using the fuel bar.
//
// Controls: left/right (keys, d-pad, stick); brake = jump (Space/Up/W/Z, controller A); boost = down (S/X, controller
// down). Touch: on-screen buttons: steer bottom left, BRAKE and BOOST bottom right.
class FreefallScene extends Phaser.Scene {
  constructor() { super('freefall'); }

  create() {
    buildAllTextures(this);
    const SW = this.SW = 600, SH = this.SH = 7000, rnd = (a, b) => a + Math.random() * (b - a);
    this.cameras.main.setBackgroundColor('#0a0406').fadeIn(300, 0, 0, 0);
    Sound.init(); Sound.music('level4');
    this.leaving = false; this.done = false; this.cageOpen = false; this.touchG = null; this.touchLbl = null; this.wingG = null; this.wingK = 0; this.wingOn = false; this.t = 0; this.timeLeft = 27; this.fuel = 1; this.penaltyT = 0;
    this.chain = 0; this.chainT = 0; this.gotCheese = 0;
    this.P = { h: 60, floor: 0, vh: -200, vx: 0, thrusting: false, firing: 0, aimA: 0, power: 0, duck: false, facing: 1 };
    this.pos = { x: SW / 2, y: 80 }; this.vel = { x: 0, y: 60 };
    this.fx = [];

    // ---- the grill: grate rows with wide gaps (a few slide slowly); some hot ones lower down; flare-up vents
    this.rows = [];
    let lastGap = SW / 2;
    for (let y = 520, i = 0; y < SH - 360; i++) {
      const w = rnd(124, 150);
      // every third grate is a SWITCHBACK: close under the last one and right over on the far side. At full speed you
      // can't get across in time: brake (the trail there is blue cheese, and a BRAKE! sign hangs over it)
      const sw = i > 1 && i % 3 === 2;
      if (sw) y = this.rows[this.rows.length - 1].y + rnd(255, 285);
      let gx = sw ? (lastGap > SW / 2 ? rnd(25, 60) : SW - w - rnd(25, 60))
        : Math.max(30, Math.min(SW - w - 30, lastGap + (Math.random() < 0.5 ? -1 : 1) * rnd(120, 300) - w / 2));          // not too far from the last gap: a flowing line
      const gaps = [{ x: gx, w }];
      if (Math.random() < 0.25) { const ox = gx > SW / 2 ? rnd(30, gx - w - 40) : rnd(gx + w + 40, SW - w - 30); if (ox > 20 && ox < SW - w - 20) gaps.push({ x: ox, w: w * 0.8 }); }   // sometimes a second (off-line) gap
      const slide = !sw && i > 2 && Math.random() < 0.4;
      if (slide) { const g = gaps[0]; g.amp = rnd(60, 110); g.sp = rnd(0.9, 1.4); g.ph = rnd(0, 6); g.x0 = Math.max(g.amp + 10, Math.min(SW - g.w - g.amp - 10, g.x)); }
      this.rows.push({ y, gaps, hot: !sw && y > SH * 0.35 && Math.random() < 0.55, slide, sw });
      lastGap = (gaps[0].x0 !== undefined ? gaps[0].x0 : gaps[0].x) + w / 2;
      y += rnd(440, 540);
    }
    this.vents = [];
    for (let k = 0; k < 10; k++) {
      const row = this.rows[2 + Math.floor(Math.random() * (this.rows.length - 3))], y = row.y - rnd(200, 360);
      if (this.vents.some(v => Math.abs(v.y - y) < 240)) continue;
      // fire from the side AWAY from the racing line, so it's a hazard for straying, not a wall across it
      const lineX = this.lineXAt(y);
      this.vents.push({ y, side: Math.random() < 0.5 ? (lineX > SW / 2 ? -1 : 1) : (lineX > SW / 2 ? 1 : -1),   // half of them right across the line: time it or brake
        t: rnd(0, 3), st: 'idle', hitDone: false });
    }
    // ---- THE CHEESE TRAIL: the racing line, from the lid through every main gap down to the gun
    this.trail = [];
    let prev = { x: SW / 2, y: 140 };
    const pts = this.rows.map(r => { const g = r.gaps[0]; return { x: (g.x0 !== undefined ? g.x0 : g.x) + g.w / 2, y: r.y }; }).concat([{ x: SW / 2, y: SH - 90 }]);
    pts.forEach((q, qi) => { q.sw = this.rows[qi] && this.rows[qi].sw; });
    for (const q of pts) {
      const d = q.y - prev.y, n = Math.floor(d / 46);
      if (q.sw) { const t = this.add.text((prev.x + q.x) / 2, prev.y + 50, 'BRAKE!', { fontFamily: PIXEL, fontSize: '12px', color: '#9fd8ff', stroke: '#1a1020', strokeThickness: 5 }).setOrigin(0.5).setDepth(3.5); this.tweens.add({ targets: t, scale: 1.15, yoyo: true, repeat: -1, duration: 300 }); }
      for (let k = 1; k <= n; k++) {
        const u = k / n, e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;          // ease across: drop, drift over, line up with the gap
        const x = prev.x + (q.x - prev.x) * Math.min(1, e * 1.15), y = prev.y + d * u;
        if (Math.abs(y - q.y) < 30) continue;                                                     // nothing sitting in the grate itself
        const im = this.add.image(x, y, 'cube').setDepth(3).setScale(0.9);
        if (q.sw) im.setTintFill(0x6ad0ff);                                                            // blue cheese = brake here
        this.trail.push({ x, y, im, got: false, ph: (x + y) * 0.02, sw: !!q.sw });
      }
      prev = q;
    }
    this.isTouch = (navigator.maxTouchPoints || 0) > 0 || ('ontouchstart' in window);
    this.need = Math.ceil(this.trail.length * 0.85);                  // the gun's cage only opens if you've followed the line: 3/4 of the cheese
    this.buildShaft();

    // ---- the prize: a gun floating over the pizza stone at the bottom (an extra life once every gun's won)
    this.prize = ZeroGScene.prototype.pickPrize.call(this);
    this.gunY = SH - 70;
    this.gunImg = this.add.image(SW / 2, this.gunY, this.prize ? this.prize.gunTex : 'burger').setDepth(3).setScale(2.2);
    this.cage = this.add.graphics().setDepth(3.1);                     // bars round the gun, until you've got enough cheese
    this.gunGlow = this.add.image(SW / 2, this.gunY, 'puff').setDepth(2.9).setBlendMode(Phaser.BlendModes.ADD).setTint(0xffd23f).setScale(3).setAlpha(0.5);

    // Chris, diving head first: no gun in his hands, arms out in front
    this.rig = new ChrisRig(this); this.rig.root.setDepth(5); this.rig.setWeapon(WEAPONS[0]);
    this.rig.gunArm.setVisible(false);
    this.dynG = this.add.graphics().setDepth(2);
    this.fxG = this.add.graphics().setDepth(6).setBlendMode(Phaser.BlendModes.ADD);

    // HUD
    const f = (s, c) => ({ fontFamily: PIXEL, fontSize: s + 'px', color: c, stroke: '#1a1020', strokeThickness: 4 });
    this.f = f;
    this.timeTxt = this.add.text(0, 0, '', f(16, '#ffd23f')).setOrigin(0.5, 0).setScrollFactor(0).setDepth(20);
    this.gotTxt = this.add.text(0, 0, '', f(9, '#ffffff')).setOrigin(0.5, 0).setScrollFactor(0).setDepth(20);
    this.depthG = this.add.graphics().setScrollFactor(0).setDepth(20);
    this.msg = this.add.text(0, 0, 'CERAMIC GRILL FREEFALL\nFOLLOW THE CHEESE TRAIL DOWN!\nMOST OF IT OPENS THE CAGE AT THE BOTTOM\nBLUE CHEESE = BRAKE (WINGSUIT!)  DOWN = BOOST',
      Object.assign(f(11, '#ffcf9a'), { align: 'center', lineSpacing: 8 })).setOrigin(0.5).setScrollFactor(0).setDepth(20);
    this.tweens.add({ targets: this.msg, alpha: 0, delay: 3200, duration: 600 });
    this.exitBtn = this.add.text(0, 0, '< MAP', Object.assign(f(10, '#ffffff'), { backgroundColor: '#3a1a1a', padding: { x: 8, y: 7 } })).setScrollFactor(0).setDepth(25).setInteractive({ useHandCursor: true });
    this.exitBtn.on('pointerdown', () => this.leave());
    this.layout(); this.scale.on('resize', this.layout, this); this.events.once('shutdown', () => this.scale.off('resize', this.layout, this));

    this.keys = this.input.keyboard ? this.input.keyboard.addKeys({ left: 'LEFT', right: 'RIGHT', up: 'UP', down: 'DOWN', a: 'A', d: 'D', w: 'W', s: 'S', x: 'X', z: 'Z', space: 'SPACE' }) : null;
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
  // where the racing line is at a given depth (the next main gap's centre)
  lineXAt(y) { const r = this.rows.find(q => q.y > y) || this.rows[this.rows.length - 1], g = r.gaps[0]; return (g.x0 !== undefined ? g.x0 : g.x) + g.w / 2; }

  // ---- the shaft: glazed green ceramic walls with crackle and steel bands, a sooty inside, the coal bed at the bottom
  buildShaft() {
    const SW = this.SW, SH = this.SH, rnd = (a, b) => a + Math.random() * (b - a);
    const bg = this.add.graphics().setDepth(-1);
    for (let y = -200; y < SH + 200; y += 200) { const k = Math.max(0, Math.min(1, y / SH)); bg.fillStyle(Phaser.Display.Color.GetColor(22 + 70 * k * k, 10 + 12 * k, 12), 1).fillRect(0, y, SW, 201); }
    for (let i = 0; i < 140; i++) bg.fillStyle(0x000000, rnd(0.15, 0.3)).fillCircle(rnd(0, SW), rnd(0, SH), rnd(6, 30));
    const wall = this.add.graphics().setDepth(4);
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? -420 : SW;
      wall.fillStyle(0x1e4a2a, 1).fillRect(x0, -200, 420, SH + 400);
      wall.fillStyle(0x2f6a3c, 1).fillRect(side < 0 ? -26 : SW, -200, 26, SH + 400);
      wall.fillStyle(0x4a8a54, 1).fillRect(side < 0 ? -8 : SW, -200, 8, SH + 400);
      wall.lineStyle(1, 0x123018, 0.9);
      for (let i = 0; i < 60; i++) {
        let x = side < 0 ? rnd(-400, -30) : rnd(SW + 30, SW + 400), y = rnd(0, SH); wall.beginPath(); wall.moveTo(x, y);
        for (let k = 0; k < 4; k++) { x += rnd(-30, 30); y += rnd(10, 40); wall.lineTo(x, y); } wall.strokePath();
      }
      for (let y = 300; y < SH; y += 900) {
        wall.fillStyle(0x6a7080, 1).fillRect(x0, y, 420, 16); wall.fillStyle(0xa8b0c0, 1).fillRect(x0, y, 420, 3);
        for (let x = x0 + 14; x < x0 + 420; x += 40) wall.fillStyle(0x3a3e48, 1).fillCircle(x, y + 9, 3);
      }
    }
    for (const v of this.vents) { const x = v.side < 0 ? -18 : SW; wall.fillStyle(0x0a0404, 1).fillRect(x, v.y - 14, 18, 28); wall.lineStyle(2, 0xa8b0c0, 1).strokeRect(x, v.y - 14, 18, 28); }
    const gr = this.add.graphics().setDepth(2);
    for (const r of this.rows) if (!r.slide) this.drawGrate(gr, r, 0);
    gr.fillStyle(0x2a0a04, 1).fillRect(0, SH - 10, SW, 80);
    for (let i = 0; i < 40; i++) gr.fillStyle([0xff4a1a, 0xffa21a, 0x8a1a0a][i % 3], 1).fillCircle(rnd(10, SW - 10), SH + rnd(10, 40), rnd(8, 18));
    gr.fillStyle(0x8a6a4a, 1).fillRect(SW / 2 - 140, SH - 14, 280, 14); gr.fillStyle(0xb8946a, 1).fillRect(SW / 2 - 140, SH - 14, 280, 4);
  }
  drawGrate(g, r, t) {
    const SW = this.SW, gaps = this.gapsAt(r, t), hot = r.hot;
    const solid = []; let x = 0;
    for (const gp of gaps.slice().sort((a, b) => a.x - b.x)) { if (gp.x > x) solid.push([x, gp.x]); x = Math.max(x, gp.x + gp.w); }
    if (x < SW) solid.push([x, SW]);
    for (const [a, b] of solid) {
      g.fillStyle(0x1a1012, 1).fillRect(a, r.y - 2, b - a, 14);
      g.fillStyle(hot ? 0xd8501a : 0x6a7080, 1).fillRect(a + 1, r.y, b - a - 2, 10);
      g.fillStyle(hot ? 0xffb03a : 0xc8d0dc, 1).fillRect(a + 1, r.y, b - a - 2, 3);
      for (let k = a + 6; k < b - 4; k += 12) g.fillStyle(hot ? 0x8a1a0a : 0x3a3e48, 1).fillRect(k, r.y + 4, 3, 4);
    }
  }
  gapsAt(r, t) { return r.slide ? r.gaps.map(g => g.x0 !== undefined ? { x: g.x0 + Math.sin(t * g.sp + g.ph) * g.amp, w: g.w } : g) : r.gaps; }
  inGap(r, x, half) { return this.gapsAt(r, this.t).some(g => x - half >= g.x && x + half <= g.x + g.w); }
  nearestGapX(r, x) { let best = null, bd = 1e9; for (const g of this.gapsAt(r, this.t)) { const c = g.x + g.w / 2, d = Math.abs(c - x); if (d < bd) { bd = d; best = c; } } return best; }

  // on-screen buttons for phones: steer left / right (bottom left), BRAKE (bottom right). Hidden when a controller's in use.
  touchBtns() {
    const W = this.scale.width, H = this.scale.height, r = Math.max(28, Math.min(44, H * 0.1));
    return { r, L: { x: 20 + r, y: H - 20 - r }, Rt: { x: 20 + r * 3.4, y: H - 20 - r }, B: { x: W - 30 - r * 2.2, y: H - 20 - r * 1.2 }, D: { x: W - 30 - r * 4.6, y: H - 20 - r * 0.9 } };
  }
  drawTouch(state) {
    const g = this.touchG || (this.touchG = this.add.graphics().setScrollFactor(0).setDepth(22)), T = this.touchBtns();
    g.clear();
    const show = this.isTouch && !(Pad.state.connected && typeof LAST_INPUT !== 'undefined' && LAST_INPUT !== 'touch') && !this.done;
    if (this.touchLbl) this.touchLbl.forEach(t => t.setVisible(show));
    if (!show) return;
    const btn = (p, on, col, rr) => { g.fillStyle(0x000000, 0.35).fillCircle(p.x + 3, p.y + 3, rr); g.fillStyle(on ? col : 0x1a1020, on ? 0.85 : 0.5).fillCircle(p.x, p.y, rr); g.lineStyle(3, col, 0.9).strokeCircle(p.x, p.y, rr); };
    btn(T.L, state.l, 0xffd23f, T.r); btn(T.Rt, state.r, 0xffd23f, T.r); btn(T.B, state.b, 0xff5a5a, T.r * 1.25); btn(T.D, state.d, 0x39c6ff, T.r * 0.85);
    const tri = (p, d) => g.fillStyle(0xffffff, 1).fillTriangle(p.x + d * T.r * 0.45, p.y, p.x - d * T.r * 0.3, p.y - T.r * 0.45, p.x - d * T.r * 0.3, p.y + T.r * 0.45);
    tri(T.L, -1); tri(T.Rt, 1);
    const lab = t => this.add.text(0, 0, t, { fontFamily: PIXEL, fontSize: '9px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0).setDepth(23);
    if (!this.touchLbl) this.touchLbl = [lab('BRAKE'), lab('BOOST')];
    this.touchLbl[0].setPosition(T.B.x, T.B.y); this.touchLbl[1].setPosition(T.D.x, T.D.y);
  }
  readTouch() {
    const T = this.touchBtns(), st = { l: false, r: false, b: false, d: false };
    if (!this.isTouch) return st;
    for (const p of this.input.manager.pointers) {
      if (!p.isDown) continue;
      if (Math.hypot(p.x - T.L.x, p.y - T.L.y) < T.r * 1.3) st.l = true;
      else if (Math.hypot(p.x - T.Rt.x, p.y - T.Rt.y) < T.r * 1.3) st.r = true;
      else if (Math.hypot(p.x - T.B.x, p.y - T.B.y) < T.r * 1.5) st.b = true;
      else if (Math.hypot(p.x - T.D.x, p.y - T.D.y) < T.r * 1.1) st.d = true;
    }
    return st;
  }

  layout() {
    const W = this.scale.width, H = this.scale.height;
    this.timeTxt.setPosition(W / 2, 8); this.gotTxt.setPosition(W / 2, 32); this.msg.setPosition(W / 2, H * 0.42);
    this.exitBtn.setPosition(10, 10);
  }
  puff(x, y, n, col, spd, life, size) { ZeroGScene.prototype.puff.call(this, x, y, n, col, spd, life, size); }
  pop(x, y, txt, col) { ZeroGScene.prototype.pop.call(this, x, y, txt, col); }
  penalty(x, y, why) {
    if (this.penaltyT > 0 || this.done) return;
    this.penaltyT = 0.8; this.timeLeft = Math.max(0, this.timeLeft - 2); this.chain = 0;
    Sound.sfx(['ouch1', 'ouch2', 'ouch3'][Math.floor(Math.random() * 3)]); this.cameras.main.shake(140, 0.008);
    this.pop(x, y - 40, why + ' -2s', '#ff7a5a'); this.puff(x, y, 12, 0xff7a1a, 200, 0.4, 3);
  }

  update(time, dms) {
    const dt = Math.min(0.05, dms / 1000); this.t += dt;
    const P = this.P, cam = this.cameras.main, k = this.keys, W = this.scale.width, H = this.scale.height;
    this.penaltyT = Math.max(0, this.penaltyT - dt);
    // ---- input: steer + brake
    let ax = 0, brake = false, boost = false;
    if (k) { ax += (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0); brake = k.up.isDown || k.w.isDown || k.z.isDown || k.space.isDown; boost = (k.down && k.down.isDown) || (k.s && k.s.isDown) || (k.x && k.x.isDown); }
    if (Pad.state.connected) { if (Pad.state.left || Pad.state.lx < -0.3) ax = -1; if (Pad.state.right || Pad.state.lx > 0.3) ax = 1; if (Pad.state.jump) brake = true; if (Pad.state.down || Pad.state.ly > 0.5) boost = true; }
    const ts = this.readTouch();
    if (ts.l) ax = -1; if (ts.r) ax = 1; if (ts.b) brake = true; if (ts.d) boost = true;
    this.drawTouch(ts);
    const ptr = this.input.activePointer, eb = this.exitBtn.getBounds();
    if (ptr.isDown && !this.done && !eb.contains(ptr.downX, ptr.downY) && !this.isTouch) {
      const wp = cam.getWorldPoint(ptr.x, ptr.y), dx = wp.x - this.pos.x;
      ax = Math.abs(dx) > 14 ? Math.max(-1, Math.min(1, dx / 60)) : 0;
      if (wp.y < this.pos.y - 50) brake = true;
    }
    if (this.done) { ax = 0; brake = false; boost = false; }
    // ---- move: snappy steering, a fall you can control
    if (this.slideT > 0) this.slideT -= dt;
    else this.vel.x += (ax * 300 - this.vel.x) * Math.min(1, dt * 10);
    if (ax) P.facing = ax > 0 ? 1 : -1;
    // BRAKE = the wingsuit (free, just slower); BOOST = the jet boots (fuel)
    const braking = brake, boosting = !brake && boost && this.fuel > 0;
    if (braking && !this.wingOn) { Sound.sfx('swish'); }
    this.wingOn = braking;
    this.wingK = (this.wingK || 0) + ((braking ? 1 : 0) - (this.wingK || 0)) * Math.min(1, dt * 9);
    if (braking) this.vel.y = Math.max(110, this.vel.y - 1300 * dt);
    else if (boosting) { this.fuel = Math.max(0, this.fuel - dt / 2.2); this.vel.y = Math.min(720, this.vel.y + 1500 * dt); }
    else this.vel.y = this.vel.y > 470 ? Math.max(470, this.vel.y - 600 * dt) : Math.min(470, this.vel.y + 900 * dt);
    if (!boosting) this.fuel = Math.min(1, this.fuel + dt * 0.1);
    if (braking && Math.random() < dt * 6) Sound.sfx('flap');
    const prevY = this.pos.y;
    this.pos.x = Math.max(16, Math.min(this.SW - 16, this.pos.x + this.vel.x * dt));
    this.pos.y += this.vel.y * dt;
    // ---- grates: bump one and you bounce off and SLIDE towards the nearest gap (no stopping, no time lost unless it's hot)
    for (const r of this.rows) {
      if (prevY <= r.y && this.pos.y >= r.y && !this.inGap(r, this.pos.x, 12)) {
        this.pos.y = r.y - 1; this.vel.y = -200;
        const gx = this.nearestGapX(r, this.pos.x); this.vel.x = Math.sign(gx - this.pos.x) * 200; this.slideT = 0.25;
        if (r.hot) { this.penalty(this.pos.x, r.y, 'HOT!'); Sound.sfx('hiss'); }
        else { Sound.sfx('bonk'); this.puff(this.pos.x, r.y, 6, 0xc8d0dc, 120, 0.3, 2); this.chain = 0; this.timeLeft = Math.max(0, this.timeLeft - 1); this.pop(this.pos.x, r.y - 30, 'BONK -1s', '#ffb07a'); }
        break;
      }
    }
    // ---- flare-ups
    for (const v of this.vents) {
      v.t -= dt;
      if (v.t <= 0) {
        if (v.st === 'idle') { v.st = 'warn'; v.t = 0.8; }
        else if (v.st === 'warn') { v.st = 'fire'; v.t = 0.8; v.hitDone = false; if (Math.abs(v.y - this.pos.y) < H) Sound.sfx('fan'); }
        else { v.st = 'idle'; v.t = 2.5 + Math.random() * 2; }
      }
      if (v.st === 'fire' && !v.hitDone) {
        const reach = 270, inX = v.side < 0 ? this.pos.x < reach : this.pos.x > this.SW - reach;
        if (inX && Math.abs(this.pos.y - v.y) < 36) { v.hitDone = true; this.vel.x = -v.side * 360; this.slideT = 0.3; this.penalty(this.pos.x, this.pos.y, 'FLARE-UP!'); }
      }
    }
    // ---- the cheese trail: each bit is the next note up the scale while the chain lasts
    this.chainT -= dt; if (this.chainT <= 0) this.chain = 0;
    for (const c of this.trail) {
      if (c.got) continue;
      if (c.y < this.pos.y - 200 || c.y > this.pos.y + 200) continue;
      c.im.setScale(0.9 + 0.12 * Math.sin(this.t * 6 + c.ph));
      if (!this.done && Math.abs(this.pos.x - c.x) < 34 && Math.abs(this.pos.y - c.y) < 40) {
        c.got = true; this.gotCheese++; this.chain++; this.chainT = 0.9;
        Sound.sfx('chime', this.chain);
        if (this.chain % 20 === 0) { this.timeLeft += 1; this.pop(c.x, c.y - 20, 'CHAIN ' + this.chain + '! +1s', '#7dff8a'); Sound.sfx('combo'); }
        this.puff(c.x, c.y, 5, 0xffd23f, 120, 0.3, 2);
        this.tweens.add({ targets: c.im, scale: 0, y: c.y - 16, duration: 180, onComplete: () => c.im.destroy() });
      }
    }
    // ---- the bottom: grab the gun
    if (!this.done && this.pos.y >= this.SH - 20) { this.pos.y = this.SH - 20; this.vel.y = 0; this.finish(this.gotCheese >= this.need, true); }
    if (!this.done) { this.timeLeft -= dt; if (this.timeLeft <= 0) { this.timeLeft = 0; this.finish(false, false); } }
    this.timeTxt.setText(String(Math.ceil(this.timeLeft))).setColor(this.timeLeft < 10 && Math.floor(this.t * 4) % 2 ? '#ff5a3a' : '#ffd23f');
    this.gotTxt.setText('CHEESE ' + this.gotCheese + ' / ' + this.need + (this.gotCheese >= this.need ? '  CAGE OPEN!' : ' TO OPEN THE CAGE') + (this.chain > 2 ? '   x' + this.chain : '')).setColor(this.gotCheese >= this.need ? '#7dff8a' : '#ffffff');
    if (this.gotCheese >= this.need && !this.cageOpen) { this.cageOpen = true; Sound.sfx('shine'); this.pop(this.pos.x, this.pos.y + 40, 'CAGE OPEN!', '#7dff8a'); }

    // ---- camera: the shaft centred, Chris in the upper third so you can see what's coming
    cam.scrollX = this.SW / 2 - W / 2;
    const ty = this.pos.y - H * 0.32 + Math.min(70, Math.max(0, this.vel.y) * 0.15);
    cam.scrollY += (ty - cam.scrollY) * Math.min(1, dt * 7);

    // ---- draw
    const dg = this.dynG; dg.clear();
    for (const r of this.rows) if (r.slide && Math.abs(r.y - this.pos.y) < H * 1.5) this.drawGrate(dg, r, this.t);
    const g = this.fxG; g.clear();
    for (const r of this.rows) if (Math.abs(r.y - this.pos.y) < H * 1.5) {
      if (r.hot) g.fillStyle(0xff5a1a, 0.18 + 0.08 * Math.sin(this.t * 6 + r.y)).fillRect(0, r.y - 10, this.SW, 26);
      const gp = this.gapsAt(r, this.t)[0]; g.fillStyle(0xffd23f, 0.08 + 0.05 * Math.sin(this.t * 4 + r.y)).fillRect(gp.x, r.y - 6, gp.w, 20);   // the line's gap glows faintly
    }
    for (const c of this.trail) if (!c.got && Math.abs(c.y - this.pos.y) < H) g.fillStyle(c.sw ? 0x39c6ff : 0xffd23f, c.sw ? 0.35 : 0.22).fillCircle(c.x, c.y, c.sw ? 13 : 11);
    for (const v of this.vents) {
      if (Math.abs(v.y - this.pos.y) > H * 1.5) continue;
      const x0 = v.side < 0 ? 0 : this.SW;
      if (v.st === 'warn') g.fillStyle(0xff7a1a, 0.3 + 0.3 * Math.sin(this.t * 30)).fillCircle(x0, v.y, 24);
      if (v.st === 'fire') for (let i = 0; i < 9; i++) {
        const u = i / 9, len = 270 * (0.85 + 0.15 * Math.sin(this.t * 40 + i)), x = x0 - v.side * len * u, r = 14 + 18 * u;
        g.fillStyle(u < 0.3 ? 0xffffff : u < 0.6 ? 0xffd23f : 0xff5a1a, 0.75 - u * 0.4).fillCircle(x, v.y + Math.sin(this.t * 30 + i) * 4 * u, r);
      }
    }
    const deep = this.pos.y / this.SH;
    if (Math.random() < dt * (10 + 40 * deep)) this.fx.push({ x: Math.random() * this.SW, y: cam.scrollY + H + 10, vx: (Math.random() - 0.5) * 30, vy: -60 - Math.random() * 90, life: 3, max: 3, col: Math.random() < 0.5 ? 0xff7a1a : 0xffd23f, size: 2 });
    if (boosting && Math.random() < dt * 40) this.fx.push({ x: this.pos.x + (Math.random() - 0.5) * 10, y: this.pos.y - 92, vx: (Math.random() - 0.5) * 40, vy: -160, life: 0.35, max: 0.35, col: 0xffa21a, size: 4 });
    if (Math.random() < dt * 25) this.fx.push({ x: this.pos.x + (Math.random() - 0.5) * 16, y: this.pos.y - 60, vx: 0, vy: -40, life: 0.3, max: 0.3, col: 0xffffff, size: 2 });   // wind streaks off his boots
    for (let i = this.fx.length - 1; i >= 0; i--) {
      const q = this.fx[i]; q.life -= dt; if (q.life <= 0) { this.fx.splice(i, 1); continue; }
      q.x += q.vx * dt; q.y += q.vy * dt; const k2 = q.life / q.max;
      g.fillStyle(q.col, k2 * 0.9).fillCircle(q.x, q.y, q.size * (0.5 + k2));
    }
    g.fillStyle(0xff4a1a, 0.25 + 0.1 * Math.sin(this.t * 3)).fillRect(0, this.SH - 60, this.SW, 70);
    // the prize gun bobs and spins slowly over the stone
    this.cage.clear();
    if (!this.cageOpen && !this.done) { const cx = this.SW / 2, cy = this.gunY; this.cage.lineStyle(4, 0x1a1020, 1).strokeRect(cx - 54, cy - 40, 108, 80); for (let x = cx - 42; x <= cx + 42; x += 14) { this.cage.lineStyle(4, 0x1a1020, 1).lineBetween(x, cy - 40, x, cy + 40); this.cage.lineStyle(2, 0xa8b0c0, 1).lineBetween(x, cy - 40, x, cy + 40); } }
    if (!this.done) { this.gunImg.setY(this.gunY + Math.sin(this.t * 2) * 8).setRotation(Math.sin(this.t * 1.3) * 0.2); this.gunGlow.setY(this.gunImg.y).setAlpha(0.4 + 0.2 * Math.sin(this.t * 4)); }
    // Chris DIVING: head first, feet up, arms reaching down. Braking he swings round flat, belly down, into a wingsuit
    // spread (the cape stretched out between his arms and boots, flapping like mad); boosting, the boots fire upwards.
    P.thrusting = false; P.vh = -this.vel.y; P.h = 60; P.vx = this.vel.x * 0.5;
    const tilt = Math.max(-0.35, Math.min(0.35, this.vel.x / 800)), wk = this.wingK || 0;
    const rot = Math.PI - tilt + (Math.PI / 2 * P.facing - Math.PI) * wk + (wk > 0.5 ? Math.sin(this.t * 13) * 0.08 : 0);   // PI = head down; PI/2 (or -PI/2) = flat
    const rx = this.pos.x - 40 * Math.sin(rot), ry = this.pos.y - 40 + 40 * Math.cos(rot);
    this.rig.update(P, dt, Math.round(rx), Math.round(ry), 1, this.penaltyT > 0 && Math.floor(this.t * 20) % 2 ? 0.4 : 1, 0);
    this.rig.root.setRotation(rot);
    this.rig.armB.setRotation(-2.2 * (1 - wk) + (-1.3 + Math.sin(this.t * 18) * 0.25) * wk + Math.sin(this.t * 10) * 0.1);
    const wg = this.wingG || (this.wingG = this.add.graphics().setDepth(4.95)); wg.clear();
    if (wk > 0.05) {
      // the wingsuit: two cape-red membranes either side of his body (above and below the flat body line), flapping
      const cx = this.pos.x, cy = this.pos.y - 40, ux = Math.sin(rot), uy = -Math.cos(rot), nx = -uy, ny = ux;   // u = along the body (to the head), n = across it
      for (const side of [-1, 1]) {
        const fl = Math.sin(this.t * 22 + side) * 8, span = (50 + fl) * wk;
        const a = { x: cx + ux * 30, y: cy + uy * 30 }, b = { x: cx - ux * 38, y: cy - uy * 38 }, tip = { x: cx + ux * 10 + nx * side * span, y: cy + uy * 10 + ny * side * span }, tip2 = { x: cx - ux * 22 + nx * side * span * 0.85, y: cy - uy * 22 + ny * side * span * 0.85 };
        wg.fillStyle(0x1a1020, 1).fillTriangle(a.x, a.y, tip.x, tip.y, b.x, b.y).fillTriangle(tip.x, tip.y, tip2.x, tip2.y, b.x, b.y);
        wg.fillStyle(0xa01818, 1).fillTriangle(tip.x - nx * side * 2, tip.y - ny * side * 2, tip2.x - nx * side * 2, tip2.y - ny * side * 2, b.x + ux * 2, b.y + uy * 2);   // the trailing edge, in shadow
        wg.fillStyle(0xd62828, 1).fillTriangle(a.x + nx * side, a.y + ny * side, tip.x - nx * side * 2, tip.y - ny * side * 2, b.x, b.y);
        wg.fillStyle(0xff6a6a, 1).fillTriangle(a.x + nx * side, a.y + ny * side, tip.x - nx * side * 2, tip.y - ny * side * 2, (a.x + tip.x) / 2, (a.y + tip.y) / 2);
        wg.fillStyle(0xffd23f, 1).fillCircle(tip.x, tip.y, 2.5);
      }
      if (Math.random() < dt * 30) this.fx.push({ x: cx + (Math.random() - 0.5) * 60, y: cy + 20, vx: 0, vy: -200, life: 0.25, max: 0.25, col: 0xffffff, size: 1.5 });   // air rushing past
    }
    if (boosting) { const jx = this.pos.x, jy = this.pos.y - 92, fl = 1 + 0.3 * Math.sin(this.t * 40); g.fillStyle(0xff7a1a, 0.9).fillTriangle(jx - 6, jy, jx + 6, jy, jx, jy - 30 * fl); g.fillStyle(0xffe27a, 1).fillTriangle(jx - 3, jy, jx + 3, jy, jx, jy - 16 * fl); }
    // depth meter + jet fuel (right edge)
    const dgh = this.depthG; dgh.clear();
    const mx = W - 18, my = 60, mh = H - 120;
    dgh.fillStyle(0x1a1020, 0.8).fillRect(mx - 4, my - 4, 12, mh + 8); dgh.fillStyle(0x3a2030, 1).fillRect(mx - 1, my, 6, mh);
    dgh.fillStyle(0xff7a1a, 1).fillRect(mx - 1, my, 6, mh * Math.min(1, deep));
    dgh.fillStyle(0xffffff, 1).fillRect(mx - 4, my + mh * Math.min(1, deep) - 2, 12, 4);
    dgh.fillStyle(0x1a1020, 0.8).fillRect(mx - 26, my - 4, 12, mh * 0.4 + 8); dgh.fillStyle(0x39c6ff, 1).fillRect(mx - 23, my + mh * 0.4 * (1 - this.fuel), 6, mh * 0.4 * this.fuel);
  }

  finish(won, bottom) {
    if (this.done) return;
    this.done = true; this.doneT = this.t;
    let body;
    if (won) {
      Sound.sfx('power'); Sound.music('win'); Sound.say('woohoo', { force: true });
      if (this.prize) { Progress.giveGun(this.prize.id); body = 'GOT IT!\n\nNEW GUN: ' + this.prize.name; }
      else { const lives = Math.min(CFG.maxLives, (this.registry.get('lives') || CFG.startLives) + 1); this.registry.set('lives', lives); body = 'MADE IT TO THE BOTTOM!\n\n+1 LIFE'; }
      body += '\n\nCHEESE ' + this.gotCheese + ' / ' + this.trail.length + '   (' + Math.ceil(this.timeLeft) + 's TO SPARE)';
      this.puff(this.gunImg.x, this.gunImg.y, 40, 0xffd23f, 320, 0.8, 4);
      this.tweens.add({ targets: this.gunImg, y: this.gunY - 90, scale: 3, angle: 360, duration: 800, ease: 'Back.out' });
    } else if (bottom) { Sound.music('lose'); body = 'THE CAGE IS STILL SHUT!\n\nCHEESE ' + this.gotCheese + ' / ' + this.need + ': FOLLOW THE TRAIL'; }
    else { Sound.music('lose'); body = 'OUT OF TIME!\n\nSO CLOSE TO THE BOTTOM...'; }
    const W = this.scale.width, H = this.scale.height, D = 30;
    this.add.rectangle(0, 0, W, H, 0x000000, 0.55).setOrigin(0).setScrollFactor(0).setDepth(D);
    this.add.text(W / 2, H * 0.22, won ? 'BONUS CLEAR!' : bottom ? 'SO CLOSE!' : 'TIME UP', { fontFamily: PIXEL, fontSize: '22px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 6 }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1);
    this.add.text(W / 2, H * 0.34, body, { fontFamily: PIXEL, fontSize: '10px', color: '#ffffff', align: 'center', lineSpacing: 8 }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(D + 1);
    const pad = typeof inputDevice === 'function' && inputDevice() === 'pad';
    const btn = (x, label, fn, col) => {
      const b = this.add.text(x, H * 0.8, label, { fontFamily: PIXEL, fontSize: '11px', color: '#1a1020', backgroundColor: col, padding: { x: 12, y: 10 } }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 2).setInteractive({ useHandCursor: true });
      b.on('pointerup', () => { if (this.t - this.doneT > 0.5) fn(); });
    };
    btn(W / 2 - 80, pad ? 'A: MAP' : 'MAP', () => this.leave(), '#ffd23f');
    btn(W / 2 + 80, pad ? 'X: AGAIN' : 'AGAIN', () => this.again(), '#ffb07a');
    this.exitBtn.setVisible(false);
  }
  again() { if (this.leaving) return; this.leaving = true; this.cameras.main.fadeOut(200, 0, 0, 0); this.time.delayedCall(220, () => this.scene.restart()); }
  leave() { if (this.leaving) return; this.leaving = true; this.cameras.main.fadeOut(250, 0, 0, 0); this.time.delayedCall(280, () => this.scene.start('select')); }
}
