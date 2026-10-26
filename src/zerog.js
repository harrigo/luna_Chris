// BONUS: the Zero-G Recoil Room. No gravity, no running, no jetpack: the only way to move is the kick of the gun.
// Fire one way and Chris drifts the other, like a pinball, bouncing off the walls and the cheese bumpers. Scoop up
// all the scattered ingredients before the clock runs out for an extra life.
//
// Controls: aim + fire as usual (touch: drag/hold anywhere = fire that way; mouse: point + click; keys: arrows/WASD
// fire in that direction; controller: right stick). Remember: you FLY AWAY from where you shoot.
class ZeroGScene extends Phaser.Scene {
  constructor() { super('zerog'); }

  create() {
    buildAllTextures(this);
    const RW = this.RW = 1500, RH = this.RH = 900;
    this.cameras.main.setBackgroundColor('#070a18').setBounds(-60, -60, RW + 120, RH + 120).fadeIn(300, 0, 0, 0);
    Sound.init(); Sound.music('level7');
    this.t = 0; this.timeLeft = 50; this.done = false; this.fireCd = 0;
    this.P = { h: 60, floor: 0, vh: 0, vx: 0, thrusting: false, firing: 0, aimA: 0, power: 0, duck: false, facing: 1 };
    this.pos = new Phaser.Math.Vector2(RW / 2, RH / 2); this.vel = new Phaser.Math.Vector2(0, 0); this.aim = new Phaser.Math.Vector2(1, 0);
    // the room: a dark panelled hangar, the walls lit round the edge, a few big round cheese bumpers
    const bg = this.add.graphics().setDepth(0);
    for (let i = 0; i < 160; i++) bg.fillStyle(0xffffff, Math.random() * 0.5 + 0.2).fillRect(Math.random() * RW, Math.random() * RH, 2, 2);
    bg.lineStyle(1, 0x2a3466, 0.6); for (let x = 0; x <= RW; x += 100) bg.lineBetween(x, 0, x, RH); for (let y = 0; y <= RH; y += 100) bg.lineBetween(0, y, RW, y);
    bg.fillStyle(0x3a4266, 1).fillRect(-40, -40, RW + 80, 40).fillRect(-40, RH, RW + 80, 40).fillRect(-40, 0, 40, RH).fillRect(RW, 0, 40, RH);
    bg.lineStyle(4, 0xffd23f, 0.8).strokeRect(0, 0, RW, RH);
    this.bumpers = [[300, 260, 46], [760, 450, 62], [1200, 250, 46], [420, 680, 40], [1120, 660, 50], [760, 130, 30], [760, 780, 30]].map(([x, y, r]) => ({ x, y, r, flash: 0 }));
    this.bumpG = this.add.graphics().setDepth(1);
    // the ingredients, floating about
    const kinds = ['wedge', 'goldwheel', 'meatball', 'ix_pancake', 'pepper', 'chili'], spots = [];
    while (spots.length < 12) {
      const x = 80 + Math.random() * (RW - 160), y = 80 + Math.random() * (RH - 160);
      if (this.bumpers.some(b => Math.hypot(x - b.x, y - b.y) < b.r + 50) || Math.hypot(x - RW / 2, y - RH / 2) < 140 || spots.some(s => Math.hypot(x - s.x, y - s.y) < 110)) continue;
      spots.push({ x, y });
    }
    this.items = spots.map((s, i) => { const im = this.add.image(s.x, s.y, kinds[i % kinds.length]).setDepth(2).setScale(i % kinds.length === 3 ? 2.6 : 1.6); return { x: s.x, y: s.y, im, ph: Math.random() * 6, got: false }; });
    this.got = 0;
    this.shots = [];
    // Chris
    this.rig = new ChrisRig(this); this.rig.root.setDepth(5); this.rig.setWeapon(WEAPONS[0]);
    this.cameras.main.startFollow(this.rig.root, true, 0.12, 0.12);
    // HUD
    const f = (s, c) => ({ fontFamily: PIXEL, fontSize: s + 'px', color: c, stroke: '#1a1020', strokeThickness: 4 });
    this.timeTxt = this.add.text(0, 0, '', f(16, '#ffd23f')).setOrigin(0.5, 0).setScrollFactor(0).setDepth(20);
    this.gotTxt = this.add.text(0, 0, '', f(9, '#ffffff')).setOrigin(0.5, 0).setScrollFactor(0).setDepth(20);
    this.msg = this.add.text(0, 0, 'ZERO-G RECOIL ROOM\nYOU FLY AWAY FROM WHERE YOU SHOOT!\nGRAB ALL 12 INGREDIENTS', Object.assign(f(11, '#9fd8ff'), { align: 'center', lineSpacing: 8 })).setOrigin(0.5).setScrollFactor(0).setDepth(20);
    this.tweens.add({ targets: this.msg, alpha: 0, delay: 3200, duration: 600 });
    this.layout(); this.scale.on('resize', this.layout, this); this.events.once('shutdown', () => this.scale.off('resize', this.layout, this));
    // input
    this.keys = this.input.keyboard ? this.input.keyboard.addKeys({ left: 'LEFT', right: 'RIGHT', up: 'UP', down: 'DOWN', a: 'A', d: 'D', w: 'W', s: 'S', space: 'SPACE' }) : null;
    this.input.on('pointerup', () => { if (this.done && this.t - this.doneT > 0.8) this.leave(); });
    const padOff = Pad.on(b => { if (this.done && (b === 'a' || b === 'start') && this.t - this.doneT > 0.8) this.leave(); if (b === 'back') this.leave(); });
    this.events.once('shutdown', padOff);
    if (this.input.keyboard) this.input.keyboard.on('keydown-ESC', () => this.leave());
  }
  layout() { const W = this.scale.width, H = this.scale.height; this.timeTxt.setPosition(W / 2, 8); this.gotTxt.setPosition(W / 2, 32); this.msg.setPosition(W / 2, H * 0.4); }

  update(time, dms) {
    const dt = Math.min(0.05, dms / 1000); this.t += dt;
    const P = this.P, cam = this.cameras.main;
    // ---- aim + fire
    let fire = false, ax = 0, ay = 0;
    const ptr = this.input.activePointer;
    if (ptr.isDown && !this.done) { const wp = cam.getWorldPoint(ptr.x, ptr.y); ax = wp.x - this.pos.x; ay = wp.y - (this.pos.y - 24); fire = true; }
    const k = this.keys;
    if (k) { const kx = (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0), ky = (k.down.isDown || k.s.isDown ? 1 : 0) - (k.up.isDown || k.w.isDown ? 1 : 0); if (kx || ky) { ax = kx; ay = ky; fire = true; } }
    if (Pad.state.connected && Pad.state.aimOn) { ax = Pad.state.aimX; ay = Pad.state.aimY; fire = true; }
    if (ax || ay) this.aim.set(ax, ay).normalize();
    P.facing = this.aim.x >= 0 ? 1 : -1; P.aimA = Math.atan2(-this.aim.y, Math.abs(this.aim.x));
    this.fireCd -= dt;
    if (fire && !this.done && this.fireCd <= 0) {
      this.fireCd = 0.1; P.firing = 0.12;
      this.vel.x -= this.aim.x * 46; this.vel.y -= this.aim.y * 46;          // THE KICK: away from where you shoot
      const sx = this.pos.x + this.aim.x * 46, sy = this.pos.y - 26 + this.aim.y * 46;
      const im = this.add.image(sx, sy, 'macaroni').setDepth(4).setScale(1.4);
      this.shots.push({ x: sx, y: sy, vx: this.aim.x * 620 + this.vel.x * 0.3, vy: this.aim.y * 620 + this.vel.y * 0.3, life: 1.2, im });
      Sound.sfx('shoot');
    }
    P.firing = Math.max(0, P.firing - dt);
    // ---- drift: no gravity, a whisker of drag, capped speed
    const sp = this.vel.length(); if (sp > 460) this.vel.scale(460 / sp);
    this.vel.scale(Math.max(0, 1 - dt * 0.15));
    this.pos.x += this.vel.x * dt; this.pos.y += this.vel.y * dt;
    // walls: bounce (pinball)
    const rad = 26;
    if (this.pos.x < rad) { this.pos.x = rad; this.vel.x = Math.abs(this.vel.x) * 0.85; this.bonk(); }
    if (this.pos.x > this.RW - rad) { this.pos.x = this.RW - rad; this.vel.x = -Math.abs(this.vel.x) * 0.85; this.bonk(); }
    if (this.pos.y < rad + 30) { this.pos.y = rad + 30; this.vel.y = Math.abs(this.vel.y) * 0.85; this.bonk(); }
    if (this.pos.y > this.RH - 4) { this.pos.y = this.RH - 4; this.vel.y = -Math.abs(this.vel.y) * 0.85; this.bonk(); }
    // bumpers: pinball kick
    for (const b of this.bumpers) {
      const dx = this.pos.x - b.x, dy = (this.pos.y - 24) - b.y, d = Math.hypot(dx, dy) || 1;
      if (d < b.r + rad) {
        const nx = dx / d, ny = dy / d, vn = this.vel.x * nx + this.vel.y * ny;
        this.pos.x = b.x + nx * (b.r + rad); this.pos.y = b.y + 24 + ny * (b.r + rad);
        if (vn < 0) { this.vel.x -= 2 * vn * nx; this.vel.y -= 2 * vn * ny; }
        this.vel.x += nx * 160; this.vel.y += ny * 160; b.flash = 0.2; Sound.sfx('bonk'); cam.shake(60, 0.004);
      }
      b.flash = Math.max(0, b.flash - dt);
    }
    // ---- shots
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const s = this.shots[i]; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; s.im.setPosition(s.x, s.y).setRotation(s.im.rotation + dt * 12);
      if (s.life <= 0 || s.x < 0 || s.y < 0 || s.x > this.RW || s.y > this.RH || this.bumpers.some(b => Math.hypot(s.x - b.x, s.y - b.y) < b.r)) { s.im.destroy(); this.shots.splice(i, 1); }
    }
    // ---- ingredients
    for (const it of this.items) {
      if (it.got) continue;
      it.im.y = it.y + Math.sin(this.t * 2 + it.ph) * 6; it.im.rotation = Math.sin(this.t * 1.3 + it.ph) * 0.3;
      if (Math.hypot(this.pos.x - it.x, this.pos.y - 24 - it.y) < 44) {
        it.got = true; this.got++; Sound.sfx('pickup'); this.tweens.add({ targets: it.im, scale: 0, angle: 360, duration: 250, onComplete: () => it.im.destroy() });
        if (this.got >= this.items.length) this.finish(true);
      }
    }
    // ---- the clock
    if (!this.done) { this.timeLeft -= dt; if (this.timeLeft <= 0) { this.timeLeft = 0; this.finish(false); } }
    this.timeTxt.setText(String(Math.ceil(this.timeLeft))).setColor(this.timeLeft < 10 && Math.floor(this.t * 4) % 2 ? '#ff5a3a' : '#ffd23f');
    this.gotTxt.setText('INGREDIENTS ' + this.got + ' / ' + this.items.length);
    // ---- draw
    const g = this.bumpG; g.clear();
    for (const b of this.bumpers) {
      g.fillStyle(0xffb52a, 0.25 + b.flash * 2).fillCircle(b.x, b.y, b.r + 8);
      g.fillStyle(b.flash > 0 ? 0xffffff : 0xffd23f, 1).fillCircle(b.x, b.y, b.r);
      g.fillStyle(0xd89a1a, 1).fillCircle(b.x - b.r * 0.3, b.y + b.r * 0.2, b.r * 0.22).fillCircle(b.x + b.r * 0.35, b.y - b.r * 0.25, b.r * 0.15);
      g.lineStyle(3, 0x1a1020, 1).strokeCircle(b.x, b.y, b.r);
    }
    P.vx = this.vel.x * 0.2; P.vh = -this.vel.y;
    this.rig.update(P, dt, Math.round(this.pos.x), Math.round(this.pos.y), 1, 1, Math.floor(this.t * 20) % 4);
    this.rig.root.setRotation(Math.max(-0.5, Math.min(0.5, this.vel.x / 900)));    // a lazy tilt with the drift
  }
  bonk() { if (this.vel.length() > 120) { Sound.sfx('clunk'); this.cameras.main.shake(50, 0.003); } }

  finish(won) {
    if (this.done) return;
    this.done = true; this.doneT = this.t;
    let body;
    if (won) {
      const lives = Math.min(CFG.maxLives, (this.registry.get('lives') || CFG.startLives) + 1); this.registry.set('lives', lives);
      Sound.sfx('power'); Sound.music('win'); body = 'ALL 12 INGREDIENTS!\n\n+1 LIFE   (' + Math.ceil(this.timeLeft) + 's TO SPARE)';
    } else { Sound.music('lose'); body = 'OUT OF TIME!\n\n' + this.got + ' / ' + this.items.length + ' INGREDIENTS'; }
    const W = this.scale.width, H = this.scale.height;
    this.add.rectangle(0, 0, W, H, 0x000000, 0.6).setOrigin(0).setScrollFactor(0).setDepth(30);
    this.add.text(W / 2, H * 0.32, won ? 'BONUS CLEAR!' : 'TIME UP', { fontFamily: PIXEL, fontSize: '22px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 6 }).setOrigin(0.5).setScrollFactor(0).setDepth(31);
    this.add.text(W / 2, H * 0.48, body + '\n\nTAP FOR THE MAP', { fontFamily: PIXEL, fontSize: '10px', color: '#ffffff', align: 'center', lineSpacing: 8 }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(31);
  }
  leave() { if (this.leaving) return; this.leaving = true; this.cameras.main.fadeOut(250, 0, 0, 0); this.time.delayedCall(280, () => this.scene.start('select')); }
}
