// BONUS II: the CERAMIC GRILL FREEFALL. Chris drops down the inside of a giant ceramic kamado grill, from the lid
// to the hot coals. Steer left and right to find the gaps in the grill grates (land on one and you have to walk off
// it, which costs time), dodge the flare-ups that roar out of the side vents, and don't touch the glowing hot grates
// near the bottom. Hold JUMP to fire the jetpack against the fall (a brake, with limited fuel). Scoop up all 12
// ingredients on the way down and reach the pizza stone at the bottom in time: the gun crate opens.
//
// Controls: left/right (keys, d-pad, stick); brake = jump (Space/Up/W/Z, controller A). Touch: hold anywhere; Chris
// steers towards your finger, and holding ABOVE him brakes.
class FreefallScene extends Phaser.Scene {
  constructor() { super('freefall'); }

  create() {
    buildAllTextures(this);
    const SW = this.SW = 600, SH = this.SH = 7600, rnd = (a, b) => a + Math.random() * (b - a);
    this.cameras.main.setBackgroundColor('#0a0406').fadeIn(300, 0, 0, 0);
    Sound.init(); Sound.music('level4');
    this.leaving = false; this.done = false; this.t = 0; this.timeLeft = 40; this.got = 0; this.fuel = 1; this.penaltyT = 0;
    this.P = { h: 60, floor: 0, vh: -200, vx: 0, thrusting: false, firing: 0, aimA: -0.6, power: 0, duck: false, facing: 1 };
    this.pos = { x: SW / 2, y: 80 }; this.vel = { x: 0, y: 60 }; this.standing = null;
    this.fx = [];

    // ---- the grill: grate rows with gaps (some gaps slide), hot ones lower down; flare-up vents on the walls
    this.rows = [];
    for (let y = 520, i = 0; y < SH - 300; y += rnd(430, 520), i++) {
      const two = Math.random() < 0.35, w = two ? 96 : 124, gaps = [];
      if (two) { const a = rnd(20, SW / 2 - w - 20), b = rnd(SW / 2 + 20, SW - w - 20); gaps.push({ x: a, w }, { x: b, w }); }
      else gaps.push({ x: rnd(20, SW - w - 20), w });
      const slide = i > 2 && Math.random() < 0.35;
      if (slide) for (const g of gaps) { g.amp = rnd(60, 110); g.sp = rnd(0.9, 1.5); g.ph = rnd(0, 6); g.x0 = Math.max(g.amp + 10, Math.min(SW - g.w - g.amp - 10, g.x)); }
      this.rows.push({ y, gaps, hot: y > SH * 0.55 && Math.random() < 0.5, slide });
    }
    this.vents = [];
    for (let k = 0; k < 9; k++) {
      const row = this.rows[1 + Math.floor(Math.random() * (this.rows.length - 2))], y = row.y - rnd(120, 300);
      if (this.vents.some(v => Math.abs(v.y - y) < 160)) continue;
      this.vents.push({ y, side: Math.random() < 0.5 ? -1 : 1, t: rnd(0, 3), st: 'idle', hitDone: false });
    }
    // ingredients: spread down the shaft, mostly over the gaps (the line you'd want to take), a few off the beaten path
    const kinds = ['wedge', 'goldwheel', 'meatball', 'ix_pancake', 'pepper', 'chili'], glow = [0xffd23f, 0xffc23a, 0xff8a5a, 0xffb36a, 0x7dff8a, 0xff4a3a];
    this.items = [];
    for (let i = 0; i < 12; i++) {
      const row = this.rows[Math.min(this.rows.length - 1, Math.floor((i + 0.5) * this.rows.length / 12))], g = row.gaps[0];
      const x = Math.random() < 0.7 ? g.x0 !== undefined ? g.x0 + g.w / 2 : g.x + g.w / 2 : rnd(60, SW - 60), y = row.y - rnd(110, 220), k = i % kinds.length;
      const im = this.add.image(x, y, kinds[k]).setDepth(3).setScale(k === 3 ? 2.4 : 1.5);
      this.items.push({ x, y, im, got: false, col: glow[k], ph: rnd(0, 6) });
    }
    this.buildShaft();

    // the prize, waiting on the pizza stone at the bottom
    this.prize = ZeroGScene.prototype.pickPrize.call(this);
    this.crate = this.add.container(SW / 2, SH - 34).setDepth(3);
    const box = this.add.graphics();
    box.fillStyle(0x1a1020, 1).fillRect(-30, -24, 60, 48); box.fillStyle(0x6a4a2a, 1).fillRect(-27, -21, 54, 42);
    box.fillStyle(0x8a6a3a, 1).fillRect(-27, -21, 54, 6).fillRect(-27, 15, 54, 6); box.lineStyle(3, 0x4a3018, 1).lineBetween(-24, -14, 24, 14).lineBetween(-24, 14, 24, -14);
    box.fillStyle(0xb9c4d8, 1).fillRect(-6, -8, 12, 14); box.fillStyle(0x1a1020, 1).fillRect(-2, -3, 4, 6);
    this.crate.add(box);
    this.crateGun = this.add.image(0, -40, this.prize ? this.prize.gunTex : 'burger').setScale(1.5).setAlpha(0.35);
    this.crate.add(this.crateGun);

    // Chris
    this.rig = new ChrisRig(this); this.rig.root.setDepth(5); this.rig.setWeapon(WEAPONS[0]);
    this.dynG = this.add.graphics().setDepth(2);                                   // sliding grates
    this.fxG = this.add.graphics().setDepth(6).setBlendMode(Phaser.BlendModes.ADD);  // flames, glows, sparks
    this.cameras.main.setBounds(SW / 2 - 2000, -200, 4000, SH + 400);

    // HUD (same layout as the Zero-G rooms)
    const f = (s, c) => ({ fontFamily: PIXEL, fontSize: s + 'px', color: c, stroke: '#1a1020', strokeThickness: 4 });
    this.f = f;
    this.timeTxt = this.add.text(0, 0, '', f(16, '#ffd23f')).setOrigin(0.5, 0).setScrollFactor(0).setDepth(20);
    this.gotTxt = this.add.text(0, 0, '', f(9, '#ffffff')).setOrigin(0.5, 0).setScrollFactor(0).setDepth(20);
    this.depthG = this.add.graphics().setScrollFactor(0).setDepth(20);
    this.msg = this.add.text(0, 0, 'CERAMIC GRILL FREEFALL\nFIND THE GAPS IN THE GRATES!\nHOLD JUMP TO BRAKE. GRAB ALL 12' + (this.prize ? '\nPRIZE: ' + this.prize.name : ''),
      Object.assign(f(11, '#ffcf9a'), { align: 'center', lineSpacing: 8 })).setOrigin(0.5).setScrollFactor(0).setDepth(20);
    this.tweens.add({ targets: this.msg, alpha: 0, delay: 3600, duration: 600 });
    this.exitBtn = this.add.text(0, 0, '< MAP', Object.assign(f(10, '#ffffff'), { backgroundColor: '#3a1a1a', padding: { x: 8, y: 7 } })).setScrollFactor(0).setDepth(25).setInteractive({ useHandCursor: true });
    this.exitBtn.on('pointerdown', () => this.leave());
    this.layout(); this.scale.on('resize', this.layout, this); this.events.once('shutdown', () => this.scale.off('resize', this.layout, this));

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

  // ---- the shaft: glazed green ceramic walls with crackle and steel bands, a sooty inside, the coal bed at the bottom
  buildShaft() {
    const SW = this.SW, SH = this.SH, rnd = (a, b) => a + Math.random() * (b - a);
    const bg = this.add.graphics().setDepth(-1);
    for (let y = -200; y < SH + 200; y += 200) { const k = Math.max(0, Math.min(1, y / SH)); bg.fillStyle(Phaser.Display.Color.GetColor(20 + 60 * k * k, 10 + 10 * k, 12), 1).fillRect(0, y, SW, 201); }   // soot, getting hotter
    for (let i = 0; i < 160; i++) bg.fillStyle(0x000000, rnd(0.15, 0.35)).fillCircle(rnd(0, SW), rnd(0, SH), rnd(6, 30));       // soot smudges
    const wall = this.add.graphics().setDepth(4);
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? -420 : SW;
      wall.fillStyle(0x1e4a2a, 1).fillRect(x0, -200, 420, SH + 400);                       // the egg's green glaze
      wall.fillStyle(0x2f6a3c, 1).fillRect(side < 0 ? -26 : SW, -200, 26, SH + 400);        // lit inner lip
      wall.fillStyle(0x4a8a54, 1).fillRect(side < 0 ? -8 : SW, -200, 8, SH + 400);
      wall.lineStyle(1, 0x123018, 0.9);
      for (let i = 0; i < 70; i++) {                                                          // crackle glaze
        let x = side < 0 ? rnd(-400, -30) : rnd(SW + 30, SW + 400), y = rnd(0, SH); wall.beginPath(); wall.moveTo(x, y);
        for (let k = 0; k < 4; k++) { x += rnd(-30, 30); y += rnd(10, 40); wall.lineTo(x, y); } wall.strokePath();
      }
      for (let y = 300; y < SH; y += 900) {                                                   // steel bands with rivets
        wall.fillStyle(0x6a7080, 1).fillRect(x0, y, 420, 16); wall.fillStyle(0xa8b0c0, 1).fillRect(x0, y, 420, 3);
        for (let x = x0 + 14; x < x0 + 420; x += 40) wall.fillStyle(0x3a3e48, 1).fillCircle(x, y + 9, 3);
      }
    }
    // flare-up vents: dark slots in the walls
    for (const v of this.vents) { const x = v.side < 0 ? -18 : SW; wall.fillStyle(0x0a0404, 1).fillRect(x, v.y - 14, 18, 28); wall.lineStyle(2, 0xa8b0c0, 1).strokeRect(x, v.y - 14, 18, 28); }
    // static grates (sliding rows are drawn every frame)
    const gr = this.add.graphics().setDepth(2);
    for (const r of this.rows) if (!r.slide) this.drawGrate(gr, r, 0);
    // the pizza stone and the coal bed
    gr.fillStyle(0x2a0a04, 1).fillRect(0, SH - 10, SW, 80);
    for (let i = 0; i < 40; i++) gr.fillStyle([0xff4a1a, 0xffa21a, 0x8a1a0a][i % 3], 1).fillCircle(rnd(10, SW - 10), SH + rnd(10, 40), rnd(8, 18));
    gr.fillStyle(0x8a6a4a, 1).fillRect(SW / 2 - 140, SH - 14, 280, 14); gr.fillStyle(0xb8946a, 1).fillRect(SW / 2 - 140, SH - 14, 280, 4);   // the stone
    this.coalT = 0;
  }
  // one grate row: chunky steel rods laid side by side (you see their round ends), with gaps
  drawGrate(g, r, t) {
    const SW = this.SW, gaps = this.gapsAt(r, t), hot = r.hot;
    const solid = []; let x = 0;
    for (const gp of gaps.slice().sort((a, b) => a.x - b.x)) { if (gp.x > x) solid.push([x, gp.x]); x = Math.max(x, gp.x + gp.w); }
    if (x < SW) solid.push([x, SW]);
    for (const [a, b] of solid) {
      g.fillStyle(0x1a1012, 1).fillRect(a, r.y - 2, b - a, 14);
      g.fillStyle(hot ? 0xd8501a : 0x6a7080, 1).fillRect(a + 1, r.y, b - a - 2, 10);
      g.fillStyle(hot ? 0xffb03a : 0xc8d0dc, 1).fillRect(a + 1, r.y, b - a - 2, 3);
      for (let k = a + 6; k < b - 4; k += 12) g.fillStyle(hot ? 0x8a1a0a : 0x3a3e48, 1).fillRect(k, r.y + 4, 3, 4);   // rod ends
    }
  }
  gapsAt(r, t) { return r.slide ? r.gaps.map(g => ({ x: g.x0 + Math.sin(t * g.sp + g.ph) * g.amp, w: g.w })) : r.gaps; }
  inGap(r, x, half) { return this.gapsAt(r, this.t).some(g => x - half >= g.x && x + half <= g.x + g.w); }

  layout() {
    const W = this.scale.width, H = this.scale.height;
    this.timeTxt.setPosition(W / 2, 8); this.gotTxt.setPosition(W / 2, 32); this.msg.setPosition(W / 2, H * 0.42);
    this.exitBtn.setPosition(10, 10);
  }
  puff(x, y, n, col, spd, life, size) { ZeroGScene.prototype.puff.call(this, x, y, n, col, spd, life, size); }
  pop(x, y, txt, col) { ZeroGScene.prototype.pop.call(this, x, y, txt, col); }
  penalty(x, y, why) {
    if (this.penaltyT > 0 || this.done) return;
    this.penaltyT = 0.8; this.timeLeft = Math.max(0, this.timeLeft - 2);
    Sound.sfx(['ouch1', 'ouch2', 'ouch3'][Math.floor(Math.random() * 3)]); this.cameras.main.shake(140, 0.008);
    this.pop(x, y - 70, why + ' -2s', '#ff7a5a'); this.puff(x, y - 30, 12, 0xff7a1a, 200, 0.4, 3);
  }

  update(time, dms) {
    const dt = Math.min(0.05, dms / 1000); this.t += dt;
    const P = this.P, cam = this.cameras.main, k = this.keys, W = this.scale.width, H = this.scale.height;
    this.penaltyT = Math.max(0, this.penaltyT - dt);
    // ---- input: steer + brake
    let ax = 0, brake = false;
    if (k) { ax += (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0); brake = k.up.isDown || k.w.isDown || k.z.isDown || k.space.isDown; }
    if (Pad.state.connected) { if (Pad.state.left || Pad.state.lx < -0.3) ax = -1; if (Pad.state.right || Pad.state.lx > 0.3) ax = 1; if (Pad.state.jump) brake = true; }
    const ptr = this.input.activePointer, eb = this.exitBtn.getBounds();
    if (ptr.isDown && !this.done && !eb.contains(ptr.downX, ptr.downY)) {
      const wp = cam.getWorldPoint(ptr.x, ptr.y), dx = wp.x - this.pos.x;
      ax = Math.abs(dx) > 14 ? Math.sign(dx) : 0;
      if (wp.y < this.pos.y - 40) brake = true;
    }
    if (this.done) { ax = 0; brake = false; }
    // ---- move
    this.vel.x += (ax * 250 - this.vel.x) * Math.min(1, dt * 8);
    if (ax) P.facing = ax;
    const braking = brake && this.fuel > 0 && !this.standing;
    if (braking) { this.fuel = Math.max(0, this.fuel - dt / 2.6); this.vel.y = Math.max(70, this.vel.y - 1500 * dt); }
    else if (!this.standing) this.vel.y = Math.min(430, this.vel.y + 900 * dt);
    if (this.standing) this.fuel = Math.min(1, this.fuel + dt * 0.6);
    const prevY = this.pos.y;
    this.pos.x = Math.max(16, Math.min(this.SW - 16, this.pos.x + this.vel.x * dt));
    if (this.standing) {                                                          // walking along a grate: off the end of it, or into a gap
      if (this.inGap(this.standing, this.pos.x, 10)) { this.standing = null; this.vel.y = 40; }
      else this.pos.y = this.standing.y;
    } else this.pos.y += this.vel.y * dt;
    // ---- grates: landing on them (feet crossing the row's top while not over a gap)
    if (!this.standing) for (const r of this.rows) {
      if (prevY <= r.y && this.pos.y >= r.y && !this.inGap(r, this.pos.x, 12)) {
        if (r.hot) { this.pos.y = r.y; this.vel.y = -260; this.penalty(this.pos.x, r.y, 'HOT!'); Sound.sfx('hiss'); }
        else { this.pos.y = r.y; this.vel.y = 0; this.standing = r; Sound.sfx('clunk'); this.puff(this.pos.x, r.y, 6, 0xc8d0dc, 120, 0.3, 2); }
        break;
      }
    }
    if (this.standing && this.standing.hot) this.standing = null;
    // ---- flare-ups from the side vents: glow, then a roaring sheet of flame across part of the shaft
    for (const v of this.vents) {
      v.t -= dt;
      if (v.t <= 0) {
        if (v.st === 'idle') { v.st = 'warn'; v.t = 0.7; }
        else if (v.st === 'warn') { v.st = 'fire'; v.t = 0.9; v.hitDone = false; if (Math.abs(v.y - this.pos.y) < H) Sound.sfx('fan'); }
        else { v.st = 'idle'; v.t = 2 + Math.random() * 2; }
      }
      if (v.st === 'fire' && !v.hitDone) {
        const reach = 260, inX = v.side < 0 ? this.pos.x < reach : this.pos.x > this.SW - reach;
        if (inX && Math.abs(this.pos.y - 30 - v.y) < 34) { v.hitDone = true; this.vel.x = -v.side * 380; this.vel.y = Math.min(this.vel.y, -80); this.standing = null; this.penalty(this.pos.x, this.pos.y, 'FLARE-UP!'); }
      }
    }
    // ---- ingredients
    for (const it of this.items) {
      if (it.got) continue;
      it.im.y = it.y + Math.sin(this.t * 2 + it.ph) * 5; it.im.rotation = Math.sin(this.t * 1.4 + it.ph) * 0.3;
      if (!this.done && Math.hypot(this.pos.x - it.x, this.pos.y - 30 - it.y) < 40) {
        it.got = true; this.got++; this.timeLeft += 1; Sound.sfx('pickup');
        this.puff(it.x, it.im.y, 14, it.col, 200, 0.5, 3); this.pop(it.x, it.im.y - 24, '+1s', '#7dff8a');
        this.tweens.add({ targets: it.im, scale: 0, angle: 360, duration: 250, onComplete: () => it.im.destroy() });
        this.crateGun.setAlpha(0.35 + 0.65 * this.got / this.items.length);
      }
    }
    // ---- the bottom: land on the stone
    if (!this.done && this.pos.y >= this.SH - 14) { this.pos.y = this.SH - 14; this.vel.y = 0; this.standing = { y: this.SH - 14, gaps: [] }; Sound.sfx('clunk'); this.cameras.main.shake(200, 0.01); this.finish(this.got >= this.items.length, true); }
    // ---- the clock
    if (!this.done) { this.timeLeft -= dt; if (this.timeLeft <= 0) { this.timeLeft = 0; this.finish(false, false); } }
    this.timeTxt.setText(String(Math.ceil(this.timeLeft))).setColor(this.timeLeft < 10 && Math.floor(this.t * 4) % 2 ? '#ff5a3a' : '#ffd23f');
    this.gotTxt.setText('INGREDIENTS ' + this.got + ' / ' + this.items.length);

    // ---- camera: the shaft centred, Chris in the upper third so you can see what's coming
    cam.scrollX = this.SW / 2 - W / 2;
    const ty = this.pos.y - H * 0.33 + Math.min(80, Math.max(0, this.vel.y) * 0.15);
    cam.scrollY += (ty - cam.scrollY) * Math.min(1, dt * 6);

    // ---- draw
    const dg = this.dynG; dg.clear();
    for (const r of this.rows) if (r.slide && Math.abs(r.y - this.pos.y) < H * 1.5) this.drawGrate(dg, r, this.t);
    const g = this.fxG; g.clear();
    for (const r of this.rows) if (r.hot && Math.abs(r.y - this.pos.y) < H * 1.5) g.fillStyle(0xff5a1a, 0.18 + 0.08 * Math.sin(this.t * 6 + r.y)).fillRect(0, r.y - 10, this.SW, 26);   // hot grates shimmer
    for (const v of this.vents) {
      if (Math.abs(v.y - this.pos.y) > H * 1.5) continue;
      const x0 = v.side < 0 ? 0 : this.SW;
      if (v.st === 'warn') g.fillStyle(0xff7a1a, 0.3 + 0.3 * Math.sin(this.t * 30)).fillCircle(x0, v.y, 22);
      if (v.st === 'fire') {
        for (let i = 0; i < 9; i++) {
          const u = i / 9, len = 260 * (0.85 + 0.15 * Math.sin(this.t * 40 + i)), x = x0 - v.side * len * u, r = 14 + 18 * u;
          g.fillStyle(u < 0.3 ? 0xffffff : u < 0.6 ? 0xffd23f : 0xff5a1a, 0.75 - u * 0.4).fillCircle(x, v.y + Math.sin(this.t * 30 + i) * 4 * u, r);
        }
      }
    }
    for (const it of this.items) if (!it.got) g.fillStyle(it.col, 0.18 + 0.08 * Math.sin(this.t * 4 + it.ph)).fillCircle(it.x, it.im.y, 26);
    // embers rising, more of them the deeper you go
    const deep = this.pos.y / this.SH;
    if (Math.random() < dt * (10 + 40 * deep)) this.fx.push({ x: Math.random() * this.SW, y: cam.scrollY + H + 10, vx: (Math.random() - 0.5) * 30, vy: -60 - Math.random() * 90, life: 3, max: 3, col: Math.random() < 0.5 ? 0xff7a1a : 0xffd23f, size: 2 });
    if (braking && Math.random() < dt * 40) this.fx.push({ x: this.pos.x - P.facing * 10, y: this.pos.y - 22, vx: (Math.random() - 0.5) * 40, vy: 160, life: 0.35, max: 0.35, col: 0x9fd8ff, size: 4 });
    for (let i = this.fx.length - 1; i >= 0; i--) {
      const q = this.fx[i]; q.life -= dt; if (q.life <= 0) { this.fx.splice(i, 1); continue; }
      q.x += q.vx * dt; q.y += q.vy * dt; const k2 = q.life / q.max;
      g.fillStyle(q.col, k2 * 0.9).fillCircle(q.x, q.y, q.size * (0.5 + k2));
    }
    // the coals glow
    g.fillStyle(0xff4a1a, 0.25 + 0.1 * Math.sin(this.t * 3)).fillRect(0, this.SH - 60, this.SW, 70);
    // Chris: falling pose, the jet flame when he brakes
    P.thrusting = braking; P.vh = this.standing ? 0 : -this.vel.y; P.h = this.standing ? 0 : 60; P.vx = this.vel.x * 0.5;
    this.rig.update(P, dt, Math.round(this.pos.x), Math.round(this.pos.y), 1, this.penaltyT > 0 && Math.floor(this.t * 20) % 2 ? 0.4 : 1, 0);
    this.rig.root.setRotation(this.standing ? 0 : Math.max(-0.3, Math.min(0.3, this.vel.x / 900)));
    if (braking) { const jx = this.pos.x - P.facing * 14, jy = this.pos.y - 26, fl = 1 + 0.3 * Math.sin(this.t * 40); g.fillStyle(0xff7a1a, 0.9).fillTriangle(jx - 6, jy, jx + 6, jy, jx, jy + 30 * fl); g.fillStyle(0xffe27a, 1).fillTriangle(jx - 3, jy, jx + 3, jy, jx, jy + 16 * fl); }
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
      if (this.prize) { Progress.giveGun(this.prize.id); body = 'THE CRATE IS OPEN!\n\nNEW GUN: ' + this.prize.name; }
      else { const lives = Math.min(CFG.maxLives, (this.registry.get('lives') || CFG.startLives) + 1); this.registry.set('lives', lives); body = 'ALL 12 INGREDIENTS!\n\n+1 LIFE'; }
      body += '\n(' + Math.ceil(this.timeLeft) + 's TO SPARE)';
      this.puff(this.crate.x, this.crate.y, 40, 0x7dff8a, 320, 0.8, 4); this.crate.list[0].setVisible(false);
      this.tweens.add({ targets: this.crateGun.setAlpha(1), y: -70, scale: 2.4, duration: 700, ease: 'Back.out' });
      this.tweens.add({ targets: this.crateGun, angle: 360, duration: 1800, repeat: -1 });
    } else if (bottom) { Sound.music('lose'); body = 'MADE IT TO THE BOTTOM...\n\nBUT ONLY ' + this.got + ' / ' + this.items.length + ' INGREDIENTS'; }
    else { Sound.music('lose'); body = 'OUT OF TIME!\n\n' + this.got + ' / ' + this.items.length + ' INGREDIENTS'; }
    const W = this.scale.width, H = this.scale.height, D = 30;
    this.add.rectangle(0, 0, W, H, 0x000000, 0.55).setOrigin(0).setScrollFactor(0).setDepth(D);
    this.add.text(W / 2, H * 0.24, won ? 'BONUS CLEAR!' : bottom ? 'SO CLOSE!' : 'TIME UP', { fontFamily: PIXEL, fontSize: '22px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 6 }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1);
    this.add.text(W / 2, H * 0.36, body, { fontFamily: PIXEL, fontSize: '10px', color: '#ffffff', align: 'center', lineSpacing: 8 }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(D + 1);
    const pad = typeof inputDevice === 'function' && inputDevice() === 'pad';
    const btn = (x, label, fn, col) => {
      const b = this.add.text(x, H * 0.76, label, { fontFamily: PIXEL, fontSize: '11px', color: '#1a1020', backgroundColor: col, padding: { x: 12, y: 10 } }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 2).setInteractive({ useHandCursor: true });
      b.on('pointerup', () => { if (this.t - this.doneT > 0.5) fn(); });
    };
    btn(W / 2 - 80, pad ? 'A: MAP' : 'MAP', () => this.leave(), '#ffd23f');
    btn(W / 2 + 80, pad ? 'X: AGAIN' : 'AGAIN', () => this.again(), '#ffb07a');
    this.exitBtn.setVisible(false);
  }
  again() { if (this.leaving) return; this.leaving = true; this.cameras.main.fadeOut(200, 0, 0, 0); this.time.delayedCall(220, () => this.scene.restart()); }
  leave() { if (this.leaving) return; this.leaving = true; this.cameras.main.fadeOut(250, 0, 0, 0); this.time.delayedCall(280, () => this.scene.start('select')); }
}
