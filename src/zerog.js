// BONUS: the Zero-G Recoil Room. No gravity, no running, no jetpack: the only way to move is the kick of the gun.
// Fire one way and Chris drifts the other, like a pinball, bouncing off the walls and the cheese bumpers. Scoop up
// all the scattered ingredients before the clock runs out and the GUN CRATE in the middle opens: a new weapon to
// keep (Progress.gun), or an extra life once every gun is owned.
//
// Controls: aim + fire as usual (touch: drag/hold anywhere = fire that way; mouse: point + click; keys: arrows/WASD
// fire in that direction; controller: right stick). Remember: you FLY AWAY from where you shoot.
// The < MAP button (top left), ESC or the controller's BACK leave at any time.
class ZeroGScene extends Phaser.Scene {
  constructor() { super('zerog'); }

  create() {
    buildAllTextures(this);
    const RW = this.RW = 1500, RH = this.RH = 900;
    this.cameras.main.setBackgroundColor('#05061a').setBounds(-80, -80, RW + 160, RH + 160).fadeIn(300, 0, 0, 0);
    Sound.init(); Sound.music('level6');
    this.t = 0; this.timeLeft = 50; this.done = false; this.fireCd = 0; this.combo = 0; this.comboT = 0;
    this.P = { h: 60, floor: 0, vh: 0, vx: 0, thrusting: false, firing: 0, aimA: 0, power: 0, duck: false, facing: 1 };
    this.pos = new Phaser.Math.Vector2(RW / 2, RH / 2 + 150); this.vel = new Phaser.Math.Vector2(0, 0); this.aim = new Phaser.Math.Vector2(1, 0);
    this.fx = [];                                                   // little particles: sparks, puffs, trail
    this.buildBackdrop();

    // the bumpers: wheels of cheese, holes turning; two of them roam about on slow loops
    this.bumpers = [[300, 260, 46], [760, 420, 62, 0, 0], [1200, 250, 46], [420, 680, 40, 90, 0.5], [1120, 660, 50, 70, 0.7], [760, 130, 30], [760, 780, 30]]
      .map(([x, y, r, roam, sp]) => ({ x, y, hx: x, hy: y, r, roam: roam || 0, sp: sp || 0, flash: 0, pop: 0, rot: Math.random() * 6, spin: (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * 0.6) }));
    this.bumpG = this.add.graphics().setDepth(1);
    this.glowG = this.add.graphics().setDepth(0.9).setBlendMode(Phaser.BlendModes.ADD);

    // the ingredients, floating about, each in its own little glow
    const kinds = ['wedge', 'goldwheel', 'meatball', 'ix_pancake', 'pepper', 'chili'], glow = [0xffd23f, 0xffc23a, 0xff8a5a, 0xffb36a, 0x7dff8a, 0xff4a3a], spots = [];
    while (spots.length < 12) {
      const x = 80 + Math.random() * (RW - 160), y = 80 + Math.random() * (RH - 160);
      if (this.bumpers.some(b => Math.hypot(x - b.hx, y - b.hy) < b.r + b.roam + 50) || Math.hypot(x - RW / 2, y - RH / 2) < 160 || spots.some(s => Math.hypot(x - s.x, y - s.y) < 110)) continue;
      spots.push({ x, y });
    }
    this.items = spots.map((s, i) => { const k = i % kinds.length; const im = this.add.image(s.x, s.y, kinds[k]).setDepth(2).setScale(k === 3 ? 2.6 : 1.6); return { x: s.x, y: s.y, im, ph: Math.random() * 6, got: false, col: glow[k] }; });
    this.got = 0;
    this.shots = [];

    // the prize: a crate in the middle of the room, chained shut until the last ingredient is in
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
    this.msg = this.add.text(0, 0, 'ZERO-G RECOIL ROOM\nYOU FLY AWAY FROM WHERE YOU SHOOT!\nGRAB ALL 12 TO OPEN THE CRATE' + (this.prize ? '\nPRIZE: ' + this.prize.name : ''),
      Object.assign(f(11, '#9fd8ff'), { align: 'center', lineSpacing: 8 })).setOrigin(0.5).setScrollFactor(0).setDepth(20);
    this.tweens.add({ targets: this.msg, alpha: 0, delay: 3600, duration: 600 });
    // an always-there way out: tapping it never fires the gun
    this.exitBtn = this.add.text(0, 0, '< MAP', Object.assign(f(10, '#ffffff'), { backgroundColor: '#2a1d4a', padding: { x: 8, y: 7 } })).setScrollFactor(0).setDepth(25).setInteractive({ useHandCursor: true });
    this.exitBtn.on('pointerdown', () => this.leave());
    this.layout(); this.scale.on('resize', this.layout, this); this.events.once('shutdown', () => this.scale.off('resize', this.layout, this));

    // input
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
    if (ptr.isDown && !this.done && !onBtn && !this.leaving) { const wp = cam.getWorldPoint(ptr.x, ptr.y); ax = wp.x - this.pos.x; ay = wp.y - (this.pos.y - 24); fire = true; }
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
      const im = this.add.image(sx, sy, 'macaroni').setDepth(4.8).setScale(1.4);
      this.shots.push({ x: sx, y: sy, vx: dx * 620 + this.vel.x * 0.3, vy: dy * 620 + this.vel.y * 0.3, life: 1.2, im });
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
    // ---- shots
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const s = this.shots[i]; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; s.im.setPosition(s.x, s.y).setRotation(s.im.rotation + dt * 12);
      const hitB = this.bumpers.find(b => Math.hypot(s.x - b.x, s.y - b.y) < b.r);
      const out = s.x < 0 || s.y < 0 || s.x > this.RW || s.y > this.RH;
      if (hitB || out) this.puff(Math.max(0, Math.min(this.RW, s.x)), Math.max(0, Math.min(this.RH, s.y)), 4, hitB ? 0xffd23f : 0x9fd8ff, 120, 0.25, 2);
      if (hitB) { hitB.flash = Math.max(hitB.flash, 0.08); hitB.pop = Math.max(hitB.pop, 0.4); }
      if (s.life <= 0 || hitB || out) { s.im.destroy(); this.shots.splice(i, 1); }
    }
    // ---- ingredients (a quick chain of pickups is a combo, each one buys back a second)
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
        if (this.got >= this.items.length) this.finish(true);
      }
    }
    // ---- the clock
    if (!this.done) { this.timeLeft -= dt; if (this.timeLeft <= 0) { this.timeLeft = 0; this.finish(false); } }
    this.timeTxt.setText(String(Math.ceil(this.timeLeft))).setColor(this.timeLeft < 10 && Math.floor(this.t * 4) % 2 ? '#ff5a3a' : '#ffd23f');
    this.gotTxt.setText('INGREDIENTS ' + this.got + ' / ' + this.items.length);

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
    // particles + muzzle flash
    const fg = this.fxG; fg.clear();
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
  bonk(x, y) { if (this.vel.length() > 120) { Sound.sfx('clunk'); this.cameras.main.shake(50, 0.003); this.wallHit = { x, y, k: 1 }; this.puff(x, y, 6, 0x4ae0ff, 160, 0.3, 2); } }

  finish(won) {
    if (this.done) return;
    this.done = true; this.doneT = this.t;
    let body;
    if (won) {
      Sound.sfx('power'); Sound.music('win');
      if (this.prize) { Progress.giveGun(this.prize.id); body = 'THE CRATE IS OPEN!\n\nNEW GUN: ' + this.prize.name; }
      else { const lives = Math.min(CFG.maxLives, (this.registry.get('lives') || CFG.startLives) + 1); this.registry.set('lives', lives); body = 'ALL 12 INGREDIENTS!\n\n+1 LIFE'; }
      body += '\n(' + Math.ceil(this.timeLeft) + 's TO SPARE)';
      // the crate bursts and the prize floats up
      this.tweens.killTweensOf(this.crate);
      this.puff(this.crate.x, this.crate.y, 40, 0x7dff8a, 320, 0.8, 4);
      this.crate.list[0].setVisible(false);
      this.tweens.add({ targets: this.crateGun.setAlpha(1), y: -70, scale: 2.4, duration: 700, ease: 'Back.out' });
      this.tweens.add({ targets: this.crateGun, angle: 360, duration: 1800, repeat: -1 });
    } else { Sound.music('lose'); body = 'OUT OF TIME!\n\n' + this.got + ' / ' + this.items.length + ' INGREDIENTS'; }
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
