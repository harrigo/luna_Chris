// Luna Chris - Level 1: The Gruyere Globe
//
// Everything lives in polar coordinates around the planet centre:
//   theta = angle around the planet (radians), h = height above the surface.
// The "camera" rotates so the player is always at the top of the screen, which is
// what makes the planet feel spherical. Arcade physics is NOT used.

const BUILD = 'v0.5';
const verEl = document.getElementById('ver');
if (verEl) verEl.textContent = BUILD;

const TAU = Math.PI * 2;
const R = 420; // planet radius in world units

const CFG = {
  gravity: 1500,
  jumpV: 560,
  runSpeed: 230,
  maxHp: 5,
  fireInterval: 0.085,
  bulletSpeed: 760,
  bulletLife: 0.6,
  invuln: 1.2,
  jetAccel: 2400,   // jetpack thrust
  jetMaxV: 260,     // max climb speed under thrust
  jetDrain: 0.5,    // fuel per second (full tank = 2s)
  jetRegen: 0.7,    // fuel per second while standing on the ground
  jetCeiling: 300   // max height
};

const rnd = (a, b) => a + Math.random() * (b - a);
const wrap = a => { a %= TAU; return a < 0 ? a + TAU : a; };
const angDiff = (a, b) => {
  let d = (a - b) % TAU;
  if (d > Math.PI) d -= TAU; else if (d < -Math.PI) d += TAU;
  return d;
};
// squared distance between two polar points (arc length approximated at mean radius)
const dist2 = (t1, h1, t2, h2) => {
  const dx = angDiff(t1, t2) * (R + (h1 + h2) * 0.5);
  const dy = h1 - h2;
  return dx * dx + dy * dy;
};

// Spawns: m = space-mouse, g = Gouda-Golem, b = boss. t = seconds after wave start.
const m = t => ({ type: 'mouse', t });
const g = t => ({ type: 'golem', t });
const WAVES = [
  { name: 'WAVE 1', spawns: [m(0), m(1.3), m(2.6), m(3.9), m(5.2)] },
  { name: 'WAVE 2', spawns: [g(0), m(1), m(2.2), m(3.4), g(5), m(6), m(7)] },
  { name: 'WAVE 3', spawns: [g(0), m(0.8), g(2.5), m(3), m(3.8), g(5), m(5.5), m(6.2), m(7)] },
  { name: 'BOSS: CRUSTY CROQUE MONSIEUR', spawns: [{ type: 'boss', t: 1.5 }] }
];

class Level1 extends Phaser.Scene {
  constructor() { super('level1'); }

  init(data) { this.autostart = !!(data && data.autostart); }

  // ------------------------------------------------------------------ setup
  create() {
    makeTextures(this);
    this.cameras.main.setBackgroundColor('#0b1020');
    this.cameras.main.fadeIn(300, 0, 0, 0);

    this.t = 0;
    this.state = 'intro';           // intro | play | dead | won
    this.endT = 0;
    this.fpsT = 0;
    this.enemies = [];
    this.pBullets = [];
    this.eBullets = [];
    this.parts = [];
    this.pickups = [];
    this.waveIdx = -1;
    this.queue = [];
    this.waveT = 0;
    this.clearT = 0;
    this.spawnSide = 1;

    // distant stars
    this.bgStars = [];
    for (let i = 0; i < 360; i++) {
      const s = this.add.image(0, 0, 'bgstar').setDepth(0).setAlpha(rnd(0.25, 0.9)).setScale(rnd(0.6, 1.6));
      this.bgStars.push({ s, a: rnd(0, TAU), r: rnd(0, 1) });   // r = fraction of the way out from the planet
    }

    this.planetG = this.add.graphics().setDepth(1);

    // surface decoration: pits on the surface line and cheese holes inside the planet
    this.decor = [];
    for (let i = 0; i < 28; i++) {
      const spr = this.add.image(0, 0, 'crater').setDepth(2);
      spr.bsx = rnd(0.6, 1.5); spr.bsy = rnd(0.8, 1.3);
      this.decor.push({ spr, theta: rnd(0, TAU), h: -8 });
    }
    for (let i = 0; i < 60; i++) {
      const spr = this.add.image(0, 0, 'hole').setDepth(2).setAlpha(rnd(0.5, 1));
      spr.bsx = spr.bsy = rnd(0.5, 2.2);
      this.decor.push({ spr, theta: rnd(0, TAU), h: -rnd(30, 170) });
    }

    this.pl = {
      theta: 0, h: 0, vh: 0, vx: 0, facing: 1,
      hp: CFG.maxHp, invuln: 0, fireCd: 0, fuel: 1, jetArmed: false, thrusting: false,
      spr: this.add.image(0, 0, 'chris').setOrigin(0.41, 1).setDepth(7)
    };

    this.buildHud();
    this.buildControls();
    this.buildOverlay();

    this.keys = this.input.keyboard
      ? this.input.keyboard.addKeys({ left: 'LEFT', right: 'RIGHT', a: 'A', d: 'D', up: 'UP', w: 'W', space: 'SPACE', z: 'Z', x: 'X' })
      : null;

    if (this.wantFs === undefined) this.wantFs = false;
    this.coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

    this.input.on('pointerdown', () => {
      if (this.state === 'intro' || this.state === 'dead' || this.state === 'won') this.wantFs = true;
      if (this.state === 'intro') this.startGame();
      else if ((this.state === 'dead' || this.state === 'won') && this.t - this.endT > 0.8) this.scene.restart({ autostart: true });
    });
    // Fullscreen needs a real tap *release* (user activation), so ask for it on pointerup.
    this.input.on('pointerup', () => { if (this.wantFs) { this.wantFs = false; this.enterFullscreen(); } });

    const lockLandscape = () => {
      try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* not supported */ }
    };
    this.scale.on('enterfullscreen', lockLandscape);
    this.scale.on('resize', this.layout, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.layout, this);
      this.scale.off('enterfullscreen', lockLandscape);
    });

    this.layout();
    this.updateHearts();
    if (this.autostart) {
      this.startGame();                       // retry after dying: straight back in
    } else {
      this.showOverlay(
        'LEVEL 1',
        'The Gruyère Globe\n\n◀ ▶ run   JUMP to hop\nTap JUMP, let go, then HOLD it in the air\nto fire the JETPACK. Guns fire automatically.\n\nTap to start'
      );
    }
  }

  layout() {
    const W = this.scale.width, H = this.scale.height;
    this.W = W; this.H = H;
    this.landscape = W > H * 1.1;
    this.zoom = Math.min(1, H / 470);          // short (landscape) screens zoom the world out so the boss still fits
    const z = this.zoom, Rz = R * z;
    this.cx = W / 2;
    this.groundY = H * (this.landscape ? 0.70 : 0.58);   // where the player stands on screen
    this.cy = this.groundY + Rz;                          // planet centre
    // how far round the planet (radians) you can see before things drop off-screen
    const byX = Math.asin(Math.min(1, (W / 2) / Rz));
    const byY = Math.acos(Math.max(-1, Math.min(1, (this.cy - H) / Rz)));
    this.visHalf = Math.min(byX, byY);
    this.visArc = R * this.visHalf;
    this.maxStarR = Math.hypot(W, this.cy);

    this.btn = {
      left:  { x: 64,     y: H - 68, r: 44 },
      right: { x: 172,    y: H - 68, r: 44 },
      jump:  { x: W - 78, y: H - 78, r: 54 }
    };
    for (const k in this.btn) this.btnLabels[k].setPosition(this.btn[k].x, this.btn[k].y);

    this.waveText.setPosition(W / 2, 10);
    this.bannerText.setPosition(W / 2, H * 0.22).setWordWrapWidth(W - 40);
    this.jetText.setPosition(12, 38);
    this.fpsText.setPosition(12, 58);
    this.ovBg.setSize(W, H);
    this.ovTitle.setPosition(W / 2, H * (this.landscape ? 0.17 : 0.28)).setWordWrapWidth(W - 40);
    this.ovBody.setFontSize(this.landscape ? '15px' : '16px').setPosition(W / 2, H * (this.landscape ? 0.3 : 0.4)).setWordWrapWidth(W - 40);
  }

  buildHud() {
    const f = (size, color, extra) => Object.assign({ fontFamily: 'monospace', fontSize: size + 'px', color, fontStyle: 'bold' }, extra || {});
    this.heartsText = this.add.text(12, 8, '', f(22, '#ff4d6d')).setDepth(20);
    this.waveText = this.add.text(0, 0, '', f(14, '#ffffff')).setOrigin(0.5, 0).setDepth(20);
    this.fpsText = this.add.text(0, 0, '', f(11, '#6b7390')).setDepth(20);
    this.jetText = this.add.text(0, 0, 'JET', f(12, '#9fd8ff')).setDepth(20);
    this.bannerText = this.add.text(0, 0, '', f(26, '#ffd23f', { align: 'center' })).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.hudG = this.add.graphics().setDepth(20);
  }

  buildControls() {
    this.ctrlG = this.add.graphics().setDepth(20);
    const labels = { left: '◀', right: '▶', jump: 'JUMP\n+JET' };
    this.btnLabels = {};
    for (const k in labels) {
      this.btnLabels[k] = this.add.text(0, 0, labels[k], {
        fontFamily: 'monospace', fontSize: (k === 'left' || k === 'right') ? '30px' : '16px', color: '#ffffff', fontStyle: 'bold', align: 'center'
      }).setOrigin(0.5).setDepth(21).setAlpha(0.85);
    }
  }

  buildOverlay() {
    this.ovBg = this.add.rectangle(0, 0, 10, 10, 0x000000, 0.62).setOrigin(0).setDepth(30);
    this.ovTitle = this.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: '34px', fontStyle: 'bold', color: '#ffd23f', align: 'center' }).setOrigin(0.5).setDepth(31);
    this.ovBody = this.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff', align: 'center', lineSpacing: 4 }).setOrigin(0.5, 0).setDepth(31);
  }

  enterFullscreen() {
    const standalone = window.matchMedia && (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches);
    if (standalone) return;     // installed app is already fullscreen
    try { if (!this.scale.isFullscreen) this.scale.startFullscreen({ navigationUI: 'hide' }); } catch (e) { /* not supported (e.g. iPhone Safari) */ }
  }

  showOverlay(title, body) {
    this.ovTitle.setText(title);
    this.ovBody.setText(body);
    this.ovBg.setVisible(true); this.ovTitle.setVisible(true); this.ovBody.setVisible(true);
  }
  hideOverlay() { this.ovBg.setVisible(false); this.ovTitle.setVisible(false); this.ovBody.setVisible(false); }

  banner(text) {
    this.tweens.killTweensOf(this.bannerText);
    this.bannerText.setText(text).setAlpha(1);
    this.tweens.add({ targets: this.bannerText, alpha: 0, delay: 1400, duration: 500 });
  }

  updateHearts() {
    const hp = Math.max(0, this.pl.hp);
    this.heartsText.setText('♥'.repeat(hp) + '♡'.repeat(CFG.maxHp - hp));
  }

  // ------------------------------------------------------------- game flow
  startGame() {
    this.hideOverlay();
    this.state = 'play';
    Sound.init(); Sound.music('level1');
    this.nextWave();
  }

  nextWave() {
    this.waveIdx++;
    if (this.waveIdx >= WAVES.length) { this.win(); return; }
    const w = WAVES[this.waveIdx];
    this.queue = w.spawns.map(s => Object.assign({}, s)).sort((a, b) => a.t - b.t);
    this.waveT = 0;
    this.clearT = 0;
    this.banner(w.name);
    if (this.waveIdx > 0 && this.waveIdx < 3) Sound.sfx('wave');
    this.waveText.setText(this.waveIdx < 3 ? 'WAVE ' + (this.waveIdx + 1) + '/3' : 'BOSS');
  }

  win() {
    this.state = 'won';
    Sound.jet(false); Sound.music('win');
    this.endT = this.t;
    this.clearEBullets();
    this.showOverlay('LEVEL 1 CLEAR!', 'The Croque Monsieur is toast. Literally.\nBut Bessie is still out there…\n\nLevel 2: Gorgonzola Gulch\ncoming soon\n\nTap to replay');
  }

  die() {
    this.state = 'dead';
    Sound.jet(false); Sound.music('lose');
    this.endT = this.t;
    this.burst(this.pl.theta, this.pl.h + 20, 'spark', 14, 1.2);
    this.showOverlay('CHRIS IS TOAST', 'The rats got away with Bessie.\n\nTap to try again');
  }

  hurt() {
    const P = this.pl;
    if (P.invuln > 0 || this.state !== 'play') return;
    P.hp--;
    P.invuln = CFG.invuln;
    P.vh = Math.max(P.vh, 300);
    this.updateHearts();
    Sound.sfx('hurt');
    this.cameras.main.shake(120, 0.006);
    if (P.hp <= 0) this.die();
  }

  // ----------------------------------------------------------------- update
  update(time, delta) {
    const dt = Math.min(delta / 1000, 0.05);
    const inp = this.readInput();
    if (this.coarse && this.H > this.W) { this.render(inp); return; }   // paused while the "rotate your phone" prompt shows
    this.t += dt;

    if (this.state === 'play') {
      this.updatePlayer(dt, inp);
      this.updateWaves(dt);
      this.updateEnemies(dt);
      this.updatePlayerBullets(dt);
      this.updateEnemyBullets(dt);
      this.updatePickups(dt);
    }
    this.updateParticles(dt);

    this.fpsT += dt;
    if (this.fpsT > 0.5) { this.fpsT = 0; this.fpsText.setText(Math.round(this.game.loop.actualFps) + ' fps'); }

    this.render(inp);
  }

  readInput() {
    const d = { left: false, right: false, jump: false, fire: false };
    for (const p of this.input.manager.pointers) {
      if (!p || !p.isDown) continue;
      let best = null, bd = 1e9;
      for (const k in this.btn) {
        const b = this.btn[k];
        const dd = Math.hypot(p.x - b.x, p.y - b.y);
        if (dd < b.r * 1.25 && dd < bd) { bd = dd; best = k; }
      }
      if (best) d[best] = true;
    }
    const k = this.keys;
    if (k) {
      if (k.left.isDown || k.a.isDown) d.left = true;
      if (k.right.isDown || k.d.isDown) d.right = true;
      if (k.space.isDown || k.up.isDown || k.w.isDown) d.jump = true;
      if (k.z.isDown || k.x.isDown) d.fire = true;
    }
    return d;
  }

  updatePlayer(dt, inp) {
    const P = this.pl;
    const ax = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);

    P.vx += (ax * CFG.runSpeed - P.vx) * Math.min(1, dt * (P.h > 0 ? 6 : 12));
    P.theta = wrap(P.theta + (P.vx / R) * dt);
    if (ax !== 0) P.facing = ax;

    const grounded = P.h <= 0 && P.vh <= 0;
    if (inp.jump && grounded) { P.vh = CFG.jumpV; P.jetArmed = false; Sound.sfx('jump'); }
    if (!inp.jump && P.vh > 320) P.vh = 320;      // release early = shorter hop
    if (!grounded && !inp.jump) P.jetArmed = true; // let go in mid-air, then hold again to light the jetpack

    P.thrusting = !grounded && inp.jump && P.jetArmed && P.fuel > 0;
    if (P.thrusting !== this.jetOn) { this.jetOn = P.thrusting; Sound.jet(P.thrusting); }
    if (P.thrusting) {
      P.vh = Math.min(CFG.jetMaxV, P.vh + CFG.jetAccel * dt);
      P.fuel = Math.max(0, P.fuel - CFG.jetDrain * dt);
      this.jetFlames(2);
    } else if (grounded) {
      P.fuel = Math.min(1, P.fuel + CFG.jetRegen * dt);
    }

    P.vh -= CFG.gravity * dt;
    P.h += P.vh * dt;
    if (P.h >= CFG.jetCeiling) { P.h = CFG.jetCeiling; if (P.vh > 0) P.vh = 0; }
    if (P.h <= 0) { P.h = 0; if (P.vh < 0) P.vh = 0; }

    P.invuln = Math.max(0, P.invuln - dt);

    // guns fire automatically whenever an enemy is on screen (Z/X fires manually on keyboard)
    P.fireCd -= dt;
    if (P.fireCd <= 0) {
      const tgt = this.pickTarget();
      if (tgt || inp.fire) { this.fire(tgt); P.fireCd = CFG.fireInterval; }
    }
  }

  pickTarget() {
    const P = this.pl;
    const halfW = this.visArc + 30;
    let best = null, bd = 1e12;
    for (const e of this.enemies) {
      const ex = angDiff(e.theta, P.theta) * R;
      if (Math.abs(ex) > halfW) continue;
      const ey = e.h + e.ch - (P.h + 26);
      let d = ex * ex + ey * ey;
      if (e.type === 'boss') d *= 0.25;
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  // The Mac-Laster 3000: a fast stream of spiralling macaroni, auto-aimed at the nearest enemy.
  fire(tgt) {
    const P = this.pl;
    if ((this.shotN = (this.shotN || 0) + 1) % 2 === 0) Sound.sfx('shoot');
    let dx = P.facing, dy = 0;
    const gh = P.h + 26;
    if (tgt) {
      let ex = angDiff(tgt.theta, P.theta) * R;
      let ey = tgt.h + tgt.ch - gh;
      const t0 = Math.hypot(ex, ey) / CFG.bulletSpeed;       // lead the target
      ex += tgt.vx * t0;
      ey += Math.max(-150, Math.min(150, tgt.dh * t0));
      const len = Math.hypot(ex, ey) || 1;
      dx = ex / len; dy = ey / len;
      P.facing = ex >= 0 ? 1 : -1;
    }
    const bt = wrap(P.theta + (Math.sign(dx) || 1) * (26 / R));
    this.pBullets.push({
      bt, bh: gh, theta: bt, h: gh,
      vt: dx * CFG.bulletSpeed, vh: dy * CFG.bulletSpeed,
      px: -dy, py: dx, ph: rnd(0, TAU), age: 0,
      spr: this.add.image(0, 0, 'macaroni').setDepth(8)
    });
  }

  jetFlames(n) {
    const P = this.pl;
    for (let i = 0; i < n; i++) {
      this.parts.push({
        theta: wrap(P.theta - P.facing * (16 / R)), h: P.h + 10,
        vt: -P.facing * 30 + rnd(-30, 30), vh: rnd(-320, -200), life: rnd(0.12, 0.25),
        spr: this.add.image(0, 0, 'flame').setDepth(6)
      });
    }
  }

  updateWaves(dt) {
    this.waveT += dt;
    while (this.queue.length && this.queue[0].t <= this.waveT) this.spawnEnemy(this.queue.shift().type);
    if (!this.queue.length && this.enemies.length === 0) {
      this.clearT += dt;
      if (this.clearT > 1.4) this.nextWave();
    } else {
      this.clearT = 0;
    }
  }

  spawnEnemy(type) {
    const P = this.pl;
    if (type === 'boss') {
      this.enemies.push({
        type: 'boss', theta: wrap(P.theta + 0.2), h: 240, vh: 0, hp: 150, maxHp: 150, r: 54, ch: 0,
        spr: this.add.image(0, 0, 'croque').setDepth(6),
        t: 0, flash: 0, rainCd: 1.5, fanCd: 3, vx: 0, dh: 0, dir: 1
      });
      Sound.sfx('bossIn'); Sound.music('boss');
      return;
    }
    const halfAng = this.visHalf + 0.1;   // just off-screen
    const side = this.spawnSide;
    this.spawnSide = -this.spawnSide;
    const theta = wrap(P.theta + side * (halfAng + rnd(0, 0.15)));
    if (type === 'mouse') {
      this.enemies.push({
        type: 'mouse', theta, h: 0, vh: 0, hp: 2, r: 14, ch: 10,
        spr: this.add.image(0, 0, 'mouse').setOrigin(0.5, 22 / 24).setDepth(5),
        t: 0, seed: rnd(0, 6), hopCd: rnd(0.2, 1), flash: 0, vx: 0, dh: 0, dir: -side
      });
    } else {
      this.enemies.push({
        type: 'golem', theta, h: 0, vh: 0, hp: 14, r: 26, ch: 28,
        spr: this.add.image(0, 0, 'golem').setOrigin(0.5, 1).setDepth(5),
        t: 0, shootCd: rnd(0.8, 1.6), volley: 0, flash: 0, vx: 0, dh: 0, dir: -side
      });
    }
  }

  updateEnemies(dt) {
    const P = this.pl;
    for (const e of this.enemies) {
      const pt = e.theta, ph = e.h;
      e.t += dt;
      const toP = angDiff(P.theta, e.theta);
      const dirP = toP >= 0 ? 1 : -1;
      const distP = Math.abs(toP) * R;

      if (e.type === 'mouse') {
        const grounded = e.h <= 0 && e.vh <= 0;
        const sp = 85 + 35 * Math.sin(e.t * 7 + e.seed);
        e.theta = wrap(e.theta + (dirP * sp / R) * dt);
        e.dir = dirP;
        e.hopCd -= dt;
        if (grounded && e.hopCd <= 0) { e.vh = rnd(280, 430); e.hopCd = rnd(0.5, 1.4); }
        e.vh -= CFG.gravity * dt;
        e.h += e.vh * dt;
        if (e.h <= 0) { e.h = 0; if (e.vh < 0) e.vh = 0; }

      } else if (e.type === 'golem') {
        let mv = 0;
        if (distP > 270) mv = dirP; else if (distP < 160) mv = -dirP;
        e.theta = wrap(e.theta + (mv * 42 / R) * dt);
        e.dir = dirP;
        e.shootCd -= dt;
        if (e.shootCd <= 0 && distP < 460) {
          const n = (e.volley++ % 3 === 2) ? 5 : 3;
          Sound.sfx('cube');
          for (let k = 0; k < n; k++) {
            this.addEBullet('cube', e.theta + dirP * (32 / R), e.h + 30, dirP * 185, (k - (n - 1) / 2) * 45, 9, 3.5);
          }
          e.shootCd = rnd(1.8, 2.4);
        }

      } else if (e.type === 'boss') {
        const target = P.theta + Math.sin(e.t * 0.8) * 0.2;
        e.theta = wrap(e.theta + angDiff(target, e.theta) * Math.min(1, dt * 2.2));
        e.h = 235 + Math.sin(e.t * 1.3) * 28;
        const phase2 = e.hp < e.maxHp * 0.5;

        e.rainCd -= dt;
        if (e.rainCd <= 0) {          // hot ham rain
          e.rainCd = phase2 ? 0.33 : 0.55;
          this.addEBullet('ham', P.theta + rnd(-0.22, 0.22), 300, rnd(-40, 40), -300, 13, 2);
        }
        e.fanCd -= dt;
        if (e.fanCd <= 0) {           // fan of toast crumbs
          e.fanCd = phase2 ? 2.4 : 4.2;
          Sound.sfx('fan');
          const n = phase2 ? 7 : 5;
          for (let k = 0; k < n; k++) {
            const a = (k - (n - 1) / 2) * 0.4;
            this.addEBullet('crumb', e.theta, e.h - 30, 210 * Math.sin(a), -210 * Math.cos(a), 7, 2.5);
          }
        }
      }

      if (e.flash > 0) { e.flash -= dt; if (e.flash <= 0) e.spr.clearTint(); }
      const idt = Math.max(dt, 1e-4);
      e.vx = angDiff(e.theta, pt) * R / idt;
      e.dh = (e.h - ph) / idt;

      // touching Chris
      if (P.invuln <= 0 && dist2(e.theta, e.h + e.ch, P.theta, P.h + 22) < (e.r + 12) * (e.r + 12)) {
        this.hurt();
        if (e.type === 'mouse') e.hp = 0;     // mice go out in a blaze of crumbs
      }
    }
    this.reapEnemies();
  }

  reapEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.hp > 0) continue;
      Sound.sfx(e.type === 'boss' ? 'boom' : 'kill');
      this.burst(e.theta, e.h + e.ch, e.type === 'boss' ? 'crumb' : 'spark', e.type === 'boss' ? 40 : 8, e.type === 'boss' ? 2 : 1);
      if (e.type === 'boss') { this.clearEBullets(); this.cameras.main.shake(300, 0.012); }
      if ((e.type === 'golem' && Math.random() < 0.4) || (e.type === 'mouse' && Math.random() < 0.06)) {
        this.pickups.push({ theta: e.theta, h: e.h + e.ch, vh: 150, life: 12, spr: this.add.image(0, 0, 'wedge').setDepth(6) });
      }
      e.spr.destroy();
      this.enemies.splice(i, 1);
    }
  }

  addEBullet(kind, theta, h, vt, vh, r, life) {
    this.eBullets.push({
      kind, theta: wrap(theta), h, vt, vh, r, life,
      spin: 0, spinV: kind === 'cube' ? rnd(-6, 6) : (kind === 'ham' ? rnd(-3, 3) : 0),
      spr: this.add.image(0, 0, kind).setDepth(8)
    });
  }

  clearEBullets() {
    for (const b of this.eBullets) b.spr.destroy();
    this.eBullets = [];
  }

  updatePlayerBullets(dt) {
    for (let i = this.pBullets.length - 1; i >= 0; i--) {
      const b = this.pBullets[i];
      b.age += dt;
      b.bt = wrap(b.bt + (b.vt / R) * dt);
      b.bh += b.vh * dt;
      const w = Math.sin(b.age * 42 + b.ph) * 6;      // corkscrew wobble
      b.theta = wrap(b.bt + (b.px * w) / R);
      b.h = b.bh + b.py * w;

      let dead = b.age > CFG.bulletLife || b.h < 0;
      if (!dead) {
        for (const e of this.enemies) {
          const rr = e.r + 8;
          if (dist2(b.theta, b.h, e.theta, e.h + e.ch) < rr * rr) {
            e.hp -= 1;
            Sound.sfx('hit');
            e.flash = 0.06;
            e.spr.setTint(0xff8a8a);
            dead = true;
            break;
          }
        }
      }
      if (dead) { b.spr.destroy(); this.pBullets.splice(i, 1); }
    }
    this.reapEnemies();
  }

  updateEnemyBullets(dt) {
    const P = this.pl;
    for (let i = this.eBullets.length - 1; i >= 0; i--) {
      const b = this.eBullets[i];
      b.theta = wrap(b.theta + (b.vt / R) * dt);
      b.h += b.vh * dt;
      b.life -= dt;
      b.spin += b.spinV * dt;
      let dead = b.life <= 0 || b.h < -2;
      if (!dead && P.invuln <= 0) {
        const rr = b.r + 12;
        if (dist2(b.theta, b.h, P.theta, P.h + 22) < rr * rr) { this.hurt(); dead = true; }
      }
      if (dead) { b.spr.destroy(); this.eBullets.splice(i, 1); }
    }
  }

  updatePickups(dt) {
    const P = this.pl;
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      p.vh -= CFG.gravity * 0.6 * dt;
      p.h += p.vh * dt;
      if (p.h <= 0) { p.h = 0; p.vh = 0; }
      p.life -= dt;
      let dead = p.life <= 0;
      if (!dead && dist2(p.theta, p.h + 8, P.theta, P.h + 22) < 30 * 30) {
        if (P.hp < CFG.maxHp) { P.hp++; this.updateHearts(); }
        Sound.sfx('pickup');
        this.burst(p.theta, p.h + 8, 'spark', 6, 0.6);
        dead = true;
      }
      if (dead) { p.spr.destroy(); this.pickups.splice(i, 1); }
    }
  }

  burst(theta, h, tex, n, spd) {
    for (let i = 0; i < n; i++) {
      this.parts.push({
        theta, h, vt: rnd(-160, 160) * spd, vh: rnd(60, 300) * spd, life: rnd(0.3, 0.6),
        spr: this.add.image(0, 0, tex).setDepth(9)
      });
    }
  }

  updateParticles(dt) {
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.theta = wrap(p.theta + (p.vt / R) * dt);
      p.vh -= 900 * dt;
      p.h += p.vh * dt;
      p.life -= dt;
      if (p.life <= 0 || p.h < 0) { p.spr.destroy(); this.parts.splice(i, 1); }
    }
  }

  // ----------------------------------------------------------------- render
  // Convert (theta, h) to screen space relative to the player and position a sprite.
  place(o, theta, h, extraRot) {
    const d = angDiff(theta, this.pl.theta);
    if (Math.abs(d) > 1.45) { o.setVisible(false); return; }   // far side of the planet
    const z = this.zoom, r = (R + h) * z;
    o.setVisible(true);
    o.setPosition(this.cx + r * Math.sin(d), this.cy - r * Math.cos(d));
    o.setRotation(d + (extraRot || 0));
    o.setScale((o.bsx || 1) * z, (o.bsy || 1) * z);
  }

  render(inp) {
    const P = this.pl;
    const { cx, cy } = this;

    const Rz = R * this.zoom;
    const rot = P.theta * 0.35;
    const r0 = Rz + 24, span = Math.max(100, this.maxStarR - r0);
    for (const b of this.bgStars) {
      const a = b.a - rot, rr = r0 + b.r * span;
      b.s.setPosition(cx + rr * Math.sin(a), cy - rr * Math.cos(a));
    }

    const pg = this.planetG;
    pg.clear();
    pg.fillStyle(0xfff1b5, 0.08).fillCircle(cx, cy, Rz + 30);
    pg.fillStyle(0xfff1b5, 0.14).fillCircle(cx, cy, Rz + 14);
    pg.fillStyle(0xf0cb52, 1).fillCircle(cx, cy, Rz);
    pg.fillStyle(0xe6bd45, 1).fillCircle(cx, cy, Rz - 70 * this.zoom);
    pg.lineStyle(5, 0xffe58a, 1).strokeCircle(cx, cy, Rz);

    for (const d of this.decor) this.place(d.spr, d.theta, d.h, 0);

    this.place(P.spr, P.theta, P.h, 0);
    P.spr.setFlipX(P.facing < 0);
    P.spr.setAlpha(P.invuln > 0 && Math.floor(this.t * 20) % 2 ? 0.35 : 1);

    for (const e of this.enemies) {
      this.place(e.spr, e.theta, e.h, e.type === 'boss' ? Math.sin(e.t * 1.5) * 0.08 : 0);
      if (e.type !== 'boss') e.spr.setFlipX(e.dir < 0);
    }
    for (const b of this.pBullets) this.place(b.spr, b.theta, b.h, Math.atan2(-b.vh, b.vt));
    for (const b of this.eBullets) this.place(b.spr, b.theta, b.h, b.spin);
    for (const p of this.pickups) this.place(p.spr, p.theta, p.h, 0);
    for (const p of this.parts) { this.place(p.spr, p.theta, p.h, 0); p.spr.setAlpha(Math.min(1, p.life * 3)); }

    // controls
    const cg = this.ctrlG;
    cg.clear();
    for (const k in this.btn) {
      const b = this.btn[k];
      const on = inp[k];
      cg.fillStyle(0xffffff, on ? 0.38 : 0.14).fillCircle(b.x, b.y, b.r);
      cg.lineStyle(3, 0xffffff, on ? 0.9 : 0.45).strokeCircle(b.x, b.y, b.r);
    }

    // boss health bar
    const hg = this.hudG;
    hg.clear();
    const boss = this.enemies.find(e => e.type === 'boss');
    if (boss) {
      const w = this.landscape ? Math.min(this.W * 0.5, 420) : this.W - 40;
      const x0 = (this.W - w) / 2, y0 = this.landscape ? 34 : 62;
      const frac = Math.max(0, boss.hp / boss.maxHp);
      hg.fillStyle(0x000000, 0.5).fillRect(x0, y0, w, 10);
      hg.fillStyle(0xff8c1a, 1).fillRect(x0, y0, w * frac, 10);
      hg.lineStyle(2, 0xffffff, 0.8).strokeRect(x0, y0, w, 10);
    }

    // jetpack fuel gauge
    const gx = 44, gy = 40, gw = 110, gh = 10;
    hg.fillStyle(0x000000, 0.5).fillRect(gx, gy, gw, gh);
    hg.fillStyle(P.fuel > 0.3 ? 0x39c6ff : 0xff5a3c, 1).fillRect(gx, gy, gw * P.fuel, gh);
    hg.lineStyle(2, 0xffffff, P.thrusting ? 1 : 0.55).strokeRect(gx, gy, gw, gh);
  }
}

window.game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0b1020',
  scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%', fullscreenTarget: document.documentElement },
  input: { activePointers: 4 },
  scene: [IntroScene, Level1]
});
