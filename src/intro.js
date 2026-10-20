// Luna Chris - opening cutscene.
// Placeholder comic-style art, all drawn with code (thick ink outlines, bright colours).
// The stage is a fixed 800x360 canvas that is scaled to fit the screen; the caption bar sits underneath.
// Tap once to start (needed for fullscreen), tap again at any time to skip into Level 1.
// Add ?skipintro to the URL to jump straight to Level 1 while testing.

const INK = 0x1a1020;
const FONT = '"Comic Sans MS","Chalkboard SE","Comic Neue",cursive,sans-serif';
const STAGE_W = 800, STAGE_H = 360, GROUND = 300, BAR_H = 58;

const ell = (g, x, y, w, h, f, lw = 3) => { g.fillStyle(f, 1).fillEllipse(x, y, w, h); g.lineStyle(lw, INK, 1).strokeEllipse(x, y, w, h); };
const rrect = (g, x, y, w, h, r, f, lw = 3) => { g.fillStyle(f, 1).fillRoundedRect(x, y, w, h, r); g.lineStyle(lw, INK, 1).strokeRoundedRect(x, y, w, h, r); };
const circ = (g, x, y, r, f, lw = 3) => { g.fillStyle(f, 1).fillCircle(x, y, r); g.lineStyle(lw, INK, 1).strokeCircle(x, y, r); };
const poly = (g, a, f, lw = 3) => { const p = a.map(([x, y]) => ({ x, y })); g.fillStyle(f, 1).fillPoints(p, true); g.lineStyle(lw, INK, 1).strokePoints(p, true); };
const line = (g, x1, y1, x2, y2, w, c) => { g.lineStyle(w, c, 1).lineBetween(x1, y1, x2, y2); };

function makeIntroTextures(scene) {
  if (scene.textures.exists('i_chris')) return;
  const mk = (key, w, h, draw) => {
    const gg = scene.make.graphics({ x: 0, y: 0, add: false });
    draw(gg);
    gg.generateTexture(key, w, h);
    gg.destroy();
  };

  // Luna Chris: tired astronaut, bulky suit, "Kiss the Cook" apron. Origin = bottom centre (60,182).
  mk('i_chris', 150, 182, gg => {
    rrect(gg, 4, 58, 18, 44, 6, 0xb8c2d3);                                  // backpack
    rrect(gg, 22, 168, 36, 13, 5, 0x3a3f55); rrect(gg, 62, 168, 36, 13, 5, 0x3a3f55);   // boots
    rrect(gg, 26, 110, 70, 62, 16, 0xdfe6f0);                               // suit legs
    rrect(gg, 32, 112, 58, 54, 8, 0xe03030);                                // apron
    gg.fillStyle(0xffffff, 1).fillRect(40, 126, 42, 5).fillRect(40, 136, 42, 5).fillRect(48, 146, 26, 5);
    rrect(gg, 18, 50, 86, 70, 24, 0xeef2f8);                                // torso
    circ(gg, 38, 78, 8, 0x1d4ed8, 2); line(gg, 31, 83, 46, 74, 2, 0xe03030);   // mission patch
    line(gg, 28, 70, 16, 108, 20, INK); line(gg, 28, 70, 16, 108, 14, 0xeef2f8); circ(gg, 15, 112, 9, 0x555b6e);  // left arm
    line(gg, 94, 66, 122, 44, 20, INK); line(gg, 94, 66, 122, 44, 14, 0xeef2f8); circ(gg, 124, 42, 9, 0xffffff);   // right arm
    circ(gg, 60, 36, 32, 0xffffff, 4);                                      // helmet
    ell(gg, 68, 38, 42, 30, 0x22385e);                                      // visor
    gg.fillStyle(0x6fa8ff, 0.9).fillEllipse(80, 30, 12, 6);
    gg.fillStyle(0xffffff, 1).fillCircle(60, 40, 5).fillCircle(77, 40, 5);    // tired eyes
    gg.fillStyle(0x111111, 1).fillCircle(61, 41, 2.2).fillCircle(78, 41, 2.2);
    line(gg, 54, 35, 66, 37, 3, 0x22385e); line(gg, 71, 37, 83, 35, 3, 0x22385e);   // heavy lids
  });

  mk('i_spat', 26, 76, gg => {                                              // spatula, origin (0.5,0.92)
    line(gg, 13, 72, 13, 30, 9, INK); line(gg, 13, 72, 13, 30, 5, 0x8a5a3a);
    rrect(gg, 3, 2, 20, 30, 4, 0xc0c8d4);
  });

  mk('i_pancake', 44, 18, gg => {
    ell(gg, 22, 10, 40, 14, 0xd9923a); gg.fillStyle(0xf6c460, 1).fillEllipse(22, 8, 30, 8);
    rrect(gg, 16, 3, 10, 6, 1, 0xfff3a0, 2);
  });

  // Bessie, the zero-gravity cow. Origin = bottom centre (100,124).
  mk('i_bessie', 200, 124, gg => {
    line(gg, 168, 52, 188, 80, 5, INK); circ(gg, 190, 84, 7, 0x2a2a35, 2);   // tail
    [[62, 98], [86, 102], [124, 98], [148, 102]].forEach(([x, y]) => rrect(gg, x, y, 16, 22, 5, 0xffffff));
    ell(gg, 118, 104, 34, 20, 0xff9db8);                                    // udder
    ell(gg, 108, 66, 130, 76, 0xffffff, 4);                                 // body
    gg.fillStyle(0x2a2a35, 1).fillEllipse(95, 50, 34, 22).fillEllipse(140, 72, 38, 26).fillEllipse(122, 42, 16, 12);
    poly(gg, [[30, 36], [24, 14], [40, 30]], 0xf3e3b0, 2); poly(gg, [[48, 34], [56, 14], [58, 34]], 0xf3e3b0, 2); // horns
    ell(gg, 36, 60, 54, 48, 0xffffff, 4);                                   // head
    ell(gg, 58, 46, 18, 14, 0x2a2a35, 2);                                   // ear/patch
    ell(gg, 18, 72, 32, 24, 0xffb5c8);                                      // snout
    gg.fillStyle(0x7a3b4a, 1).fillCircle(12, 72, 2.5).fillCircle(22, 72, 2.5);
    circ(gg, 34, 52, 7, 0xffffff, 2); gg.fillStyle(0x111111, 1).fillCircle(32, 53, 3);   // eye
    line(gg, 28, 44, 24, 40, 2, INK); line(gg, 34, 44, 33, 39, 2, INK);        // lashes
    gg.fillStyle(0xffd23f, 1).fillCircle(116, 118, 3).fillCircle(124, 120, 2.5);       // Mad Cheese drips
  });

  // Roquefort Rodents' junk UFO
  mk('i_ufo', 240, 124, gg => {
    poly(gg, [[214, 70], [240, 60], [232, 78], [240, 92], [214, 86]], 0xff8c1a, 2);
    gg.fillStyle(0x9fe8ff, 0.95).fillEllipse(120, 44, 84, 70); gg.lineStyle(4, INK, 1).strokeEllipse(120, 44, 84, 70);
    circ(gg, 120, 50, 14, 0x9aa3b2, 3); circ(gg, 110, 38, 6, 0xff9db8, 2); circ(gg, 130, 38, 6, 0xff9db8, 2);
    gg.fillStyle(0x111111, 1).fillCircle(115, 50, 2).fillCircle(126, 50, 2);
    ell(gg, 120, 76, 224, 50, 0x8b93a3, 4);
    rrect(gg, 40, 62, 40, 22, 4, 0x6b8f5a); rrect(gg, 150, 64, 44, 20, 4, 0xb5523c);       // mismatched junk plates
    gg.fillStyle(0x6b4a2f, 1).fillEllipse(100, 90, 26, 9);                                  // rust
    for (let i = 0; i < 9; i++) circ(gg, 28 + i * 23, 80, 4, i % 2 ? 0xffd23f : 0xff6b6b, 2);
    ell(gg, 120, 104, 64, 18, 0x555b6e);                                                    // beam emitter
    line(gg, 170, 26, 188, 6, 3, INK); circ(gg, 190, 5, 4, 0xff6b6b, 2);                    // antenna
  });

  // Roquefort Rodent in junk armour. Origin = bottom centre (35,64).
  mk('i_rat', 70, 64, gg => {
    line(gg, 12, 50, 2, 36, 4, 0xd9a5b3);
    ell(gg, 34, 44, 40, 26, 0x9aa3b2);
    rrect(gg, 20, 32, 14, 14, 2, 0x4a8f5a, 2);                              // tin-can pauldron
    circ(gg, 50, 34, 15, 0x9aa3b2); circ(gg, 44, 20, 6, 0xff9db8, 2); circ(gg, 58, 22, 5, 0xff9db8, 2);
    circ(gg, 64, 36, 3.5, 0xff6b8a, 2);
    ell(gg, 50, 24, 30, 14, 0x9b7a58); line(gg, 36, 22, 28, 18, 4, INK);    // saucepan helmet
    circ(gg, 53, 34, 4.5, 0xffffff, 2); gg.fillStyle(0x111111, 1).fillCircle(54, 35, 1.8);
    rrect(gg, 20, 56, 10, 8, 3, 0x555b6e, 2); rrect(gg, 40, 56, 10, 8, 3, 0x555b6e, 2);
  });

  mk('i_barn', 250, 160, gg => {
    rrect(gg, 4, 4, 242, 154, 4, 0xb5372c, 4);
    for (let x = 28; x < 246; x += 24) line(gg, x, 6, x, 156, 2, 0x8e2a22);
    rrect(gg, 84, 44, 84, 114, 3, 0xe9dcb5, 4);
    line(gg, 88, 48, 164, 154, 5, 0x8e7a4a); line(gg, 164, 48, 88, 154, 5, 0x8e7a4a);
    rrect(gg, 104, 10, 44, 24, 3, 0x2a1a10);
  });
  const roof = gg => {
    poly(gg, [[2, 94], [40, 30], [150, 4], [260, 30], [298, 94]], 0x5a3a2a, 4);
    for (let i = 1; i < 4; i++) line(gg, 6 + i * 6, 94 - i * 20, 294 - i * 6, 94 - i * 20, 2, 0x3a251a);
  };
  mk('i_roof', 300, 96, roof);
  mk('i_roofX', 300, 96, gg => {
    roof(gg);
    poly(gg, [[110, 94], [122, 48], [138, 70], [150, 34], [166, 66], [182, 94]], 0x120a14, 3);
    poly(gg, [[118, 50], [112, 26], [128, 46]], 0xc9955a, 2); poly(gg, [[160, 40], [170, 18], [176, 44]], 0xc9955a, 2);
  });
  mk('i_plank', 46, 10, gg => { rrect(gg, 1, 1, 44, 8, 2, 0x8a5a3a, 2); });

  mk('i_cabin', 200, 140, gg => {
    rrect(gg, 10, 50, 180, 88, 3, 0x6b4a2f, 4);
    for (let i = 1; i < 6; i++) line(gg, 12, 50 + i * 14, 188, 50 + i * 14, 2, 0x4a321e);
    rrect(gg, 150, 12, 18, 38, 2, 0x7b7f8c, 3);
    poly(gg, [[0, 54], [100, 6], [200, 54]], 0x7a3b2a, 4);
    rrect(gg, 84, 88, 34, 50, 3, 0x4a2f1a); rrect(gg, 28, 74, 34, 28, 3, 0xffd23f);
    line(gg, 45, 74, 45, 102, 2, INK); line(gg, 28, 88, 62, 88, 2, INK);
  });

  mk('i_grinder', 28, 66, gg => {
    rrect(gg, 4, 20, 20, 44, 8, 0x8a5a3a); rrect(gg, 8, 10, 12, 12, 3, 0x6b4326);
    circ(gg, 14, 7, 6, 0x5a3a22); rrect(gg, 4, 50, 20, 7, 2, 0x3a2616, 2);
  });

  // fireplace panel (flips round to reveal the armoury)
  mk('i_stone', 380, 204, gg => {
    rrect(gg, 2, 2, 376, 200, 4, 0x7b7f8c, 4);
    for (let r = 0; r < 8; r++) {
      const off = r % 2 ? 0 : 30;
      for (let x = -30 + off; x < 380; x += 60) rrect(gg, Math.max(4, x), 4 + r * 25, 56, 23, 3, r % 2 ? 0x8a8e9b : 0x6f7380, 2);
    }
    rrect(gg, 110, 70, 160, 134, 6, 0x1a1210, 4);
    ell(gg, 190, 190, 90, 26, 0xff6b1a, 2); ell(gg, 190, 192, 50, 14, 0xffd23f, 1);
  });

  mk('i_armory', 380, 204, gg => {
    rrect(gg, 2, 2, 376, 200, 6, 0x2b3447, 5);
    line(gg, 10, 14, 370, 14, 4, 0x39d0c8); line(gg, 10, 190, 370, 190, 4, 0x39d0c8);
    line(gg, 190, 22, 190, 182, 3, 0x1a2234);
    // Mac-Laster 3000
    rrect(gg, 24, 38, 92, 28, 6, 0xff8c1a); rrect(gg, 58, 28, 22, 48, 3, 0x7a3b00);
    poly(gg, [[116, 40], [152, 52], [116, 64]], 0xffc36a, 3); poly(gg, [[34, 66], [50, 66], [44, 90]], 0x555b6e, 3);
    // Swiss-Shot
    rrect(gg, 214, 40, 100, 26, 6, 0xffd23f); rrect(gg, 314, 46, 38, 14, 3, 0xc99a2a);
    [236, 262, 288].forEach(x => circ(gg, x, 53, 5, 0xe3a21a, 2));
    // Fondue Flamethrower
    rrect(gg, 24, 122, 40, 52, 8, 0xd62828); rrect(gg, 64, 140, 56, 14, 4, 0x555b6e);
    poly(gg, [[120, 140], [158, 130], [146, 144], [166, 150], [120, 154]], 0xff8c1a, 3);
    // Gouda Grenade launcher
    rrect(gg, 214, 126, 112, 36, 10, 0x5b6b3a); rrect(gg, 322, 120, 18, 48, 4, 0x3a3f55);
    poly(gg, [[214, 172], [240, 172], [240, 150]], 0xffd23f, 3);
  });

  mk('i_glow', 180, 180, gg => { for (let i = 0; i < 10; i++) gg.fillStyle(0xffb347, 0.07).fillCircle(90, 90, 90 - i * 8.5); });
  mk('i_puff', 48, 48, gg => { gg.fillStyle(0xf3ead6, 1).fillCircle(24, 24, 22); gg.fillStyle(0xffffff, 0.5).fillCircle(18, 18, 10); });
  mk('i_glove', 26, 26, gg => { circ(gg, 13, 13, 10, 0xffffff, 3); });
}

const STARS = (() => { let s = 7; const a = []; for (let i = 0; i < 60; i++) { s = (s * 16807) % 2147483647; const x = s % 800; s = (s * 16807) % 2147483647; const y = s % 200; a.push([x, y, 1 + (s % 3) * 0.6]); } return a; })();

class IntroScene extends Phaser.Scene {
  constructor() { super('intro'); }

  create() {
    if (/[?&]skipintro/.test(window.location.search)) { this.scene.start('level1'); return; }
    makeIntroTextures(this);
    this.cameras.main.setBackgroundColor('#000000');
    this.phase = 'gate';            // gate (waiting for first tap) -> play -> leaving
    this.wantFs = false;
    this.leaving = false;

    this.stage = this.add.container(0, 0).setDepth(1);
    this.buildRanch();

    this.letterbox = this.add.graphics().setDepth(8);
    this.capText = this.add.text(0, 0, 'TAP TO START', { fontFamily: PIXEL, fontSize: '13px', color: '#ffffff', align: 'center' }).setOrigin(0.5).setDepth(10);
    this.skipText = this.add.text(0, 0, 'tap to skip', { fontFamily: FONT, fontSize: '12px', color: '#c9cde0' }).setOrigin(1, 0).setDepth(10).setVisible(false);
    this.gateTitle = this.add.text(0, 0, 'LUNA CHRIS', { fontFamily: PIXEL, fontSize: '46px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 10 }).setOrigin(0.5).setDepth(5);
    this.gateSub = this.add.text(0, 0, 'SPACE-RANCH HERO', { fontFamily: PIXEL, fontSize: '11px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 4 }).setOrigin(0.5).setDepth(5);
    this.pulse = this.tweens.add({ targets: this.capText, alpha: 0.35, yoyo: true, repeat: -1, duration: 700 });

    this.fit();
    this.scale.on('resize', this.fit, this);
    const lockLandscape = () => {
      try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* not supported */ }
    };
    this.scale.on('enterfullscreen', lockLandscape);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.fit, this);
      this.scale.off('enterfullscreen', lockLandscape);
    });

    this.input.on('pointerdown', () => {
      if (this.phase === 'gate') this.wantFs = true;
      else if (this.phase === 'play') this.leave();
    });
    // Fullscreen needs a tap *release* (user activation), so it is requested on pointerup.
    this.input.on('pointerup', () => {
      if (!this.wantFs) return;
      this.wantFs = false;
      const standalone = window.matchMedia && (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches);
      try { if (!standalone && !this.scale.isFullscreen) this.scale.startFullscreen({ navigationUI: 'hide' }); } catch (e) { /* e.g. iPhone Safari */ }
      if (this.phase === 'gate') this.startShow();
    });
  }

  // ------------------------------------------------------------- layout
  fit() {
    const W = this.scale.width, H = this.scale.height;
    const s = Math.min(W / STAGE_W, (H - BAR_H) / STAGE_H);
    const w = STAGE_W * s, h = STAGE_H * s;
    const x0 = (W - w) / 2, y0 = Math.max(0, (H - BAR_H - h) / 2);
    this.stage.setScale(s).setPosition(x0, y0);

    const lb = this.letterbox;
    lb.clear().fillStyle(0x000000, 1);
    lb.fillRect(0, 0, W, y0);                       // top
    lb.fillRect(0, y0, x0, h);                      // left
    lb.fillRect(x0 + w, y0, W - x0 - w, h);         // right
    lb.fillRect(0, y0 + h, W, H - y0 - h);          // bottom + caption bar

    this.capText.setPosition(W / 2, H - BAR_H / 2).setWordWrapWidth(W - 40);
    this.skipText.setOrigin(1, 1).setPosition(W - 10, H - 6);
    this.gateTitle.setFontSize(Math.max(24, Math.min(46, 46 * s))).setPosition(W / 2, y0 + 62 * s);
    this.gateSub.setFontSize(Math.max(9, 11 * s)).setPosition(W / 2, y0 + 108 * s);
  }

  add2(o) { this.stage.add(o); return o; }       // add an object to the stage container
  at(ms, fn) { return this.time.delayedCall(ms, () => { if (!this.leaving) fn(); }); }

  say(text) {
    if (this.typer) this.typer.remove();
    this.capText.setText('');
    let i = 0;
    this.typer = this.time.addEvent({ delay: 26, repeat: text.length - 1, callback: () => { i++; this.capText.setText(text.slice(0, i)); } });
  }

  bubble(x, y, txt, life = 1500) {
    const t = this.add.text(0, 0, txt, { fontFamily: FONT, fontSize: '22px', color: '#111111', fontStyle: 'bold' }).setOrigin(0.5);
    const w = t.width + 28, h = t.height + 14;
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    g.lineStyle(3, INK, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    g.fillStyle(0xffffff, 1).fillTriangle(-10, h / 2 - 2, 10, h / 2 - 2, -2, h / 2 + 16);
    g.lineStyle(3, INK, 1).lineBetween(-10, h / 2 - 1, -2, h / 2 + 16).lineBetween(10, h / 2 - 1, -2, h / 2 + 16);
    const c = this.add.container(x, y, [g, t]);
    this.add2(c).setScale(0);
    this.tweens.add({ targets: c, scale: 1, duration: 200, ease: 'Back.easeOut' });
    this.at(life, () => this.tweens.add({ targets: c, alpha: 0, duration: 250, onComplete: () => c.destroy() }));
    return c;
  }

  puffs(x, y, n, spread = 60, tint = 0xffffff) {
    for (let i = 0; i < n; i++) {
      const p = this.add2(this.add.image(x + Phaser.Math.Between(-spread, spread), y + Phaser.Math.Between(-20, 10), 'i_puff').setScale(0.3).setTint(tint).setAlpha(0.9));
      this.tweens.add({
        targets: p, scale: Phaser.Math.FloatBetween(0.8, 1.6), alpha: 0, y: p.y - Phaser.Math.Between(20, 60),
        x: p.x + Phaser.Math.Between(-30, 30), duration: Phaser.Math.Between(500, 900), onComplete: () => p.destroy()
      });
    }
  }

  // ------------------------------------------------------------- scenes
  buildRanch() {
    const g = this.add2(this.add.graphics());
    const bands = [0x2a1a4a, 0x3c2260, 0x55307a, 0x7a3d86, 0xa34a85, 0xcf5a7a, 0xe8795f, 0xf29a52, 0xf7b957];
    const bh = 220 / bands.length;
    bands.forEach((c, i) => g.fillStyle(c, 1).fillRect(0, i * bh, STAGE_W, bh + 1));
    STARS.forEach(([x, y, r]) => g.fillStyle(0xffffff, y < 120 ? 0.85 : 0.35).fillCircle(x, y, r));
    circ(g, 640, 76, 46, 0x8a63c9);                                              // ringed planet
    g.lineStyle(6, 0xf3d27a, 0.95).strokeEllipse(640, 80, 160, 26);
    g.fillStyle(0xc98a4b, 1).fillRect(0, 262, STAGE_W, 100);                      // dusty ground
    g.fillStyle(0xb2763c, 1).fillEllipse(120, 268, 340, 40).fillEllipse(560, 266, 420, 34);
    g.fillStyle(0xd9a05f, 1).fillRect(0, GROUND, STAGE_W, 60);
    for (let i = 0; i < 40; i++) g.fillStyle(0xa96b34, 1).fillCircle((i * 97) % 800, 310 + (i * 31) % 45, 2 + (i % 3));
    for (let x = 270; x < 520; x += 46) { rrect(g, x, 262, 10, 40, 2, 0x8a5a3a, 2); }   // fence
    line(g, 262, 274, 526, 274, 5, INK); line(g, 262, 274, 526, 274, 3, 0x8a5a3a);
    line(g, 262, 290, 526, 290, 5, INK); line(g, 262, 290, 526, 290, 3, 0x8a5a3a);

    this.add2(this.add.image(78, GROUND + 4, 'i_cabin').setOrigin(0.5, 1));
    this.barn = this.add2(this.add.image(660, GROUND, 'i_barn').setOrigin(0.5, 1));
    this.roof = this.add2(this.add.image(660, GROUND - 154, 'i_roof').setOrigin(0.5, 1));

    this.bessie = this.add2(this.add.image(470, GROUND, 'i_bessie').setOrigin(0.5, 1));
    this.chris = this.add2(this.add.image(200, GROUND, 'i_chris').setOrigin(60 / 150, 1));
    this.spat = this.add2(this.add.image(200 + 64, GROUND - 140, 'i_spat').setOrigin(0.5, 0.92));
    this.pancake = this.add2(this.add.image(264, GROUND - 212, 'i_pancake'));

    this.tweens.add({ targets: this.bessie, y: GROUND - 5, yoyo: true, repeat: -1, duration: 1100, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: this.spat, angle: { from: -12, to: 10 }, yoyo: true, repeat: -1, duration: 380, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: this.pancake, y: GROUND - 275, angle: 360, yoyo: true, repeat: -1, duration: 650, ease: 'Sine.easeOut' });
  }

  // The first tap lands here: the title fanfare starts (browsers only allow sound after a tap) and the logo gets its moment.
  startShow() {
    this.phase = 'title';
    Sound.init(); Sound.music('title');
    this.pulse.stop();
    this.capText.setText('').setAlpha(1);
    this.tweens.add({ targets: [this.gateTitle, this.gateSub], scale: 1.12, yoyo: true, repeat: 3, duration: 330, ease: 'Sine.easeInOut' });
    this.at(3200, () => this.story());
  }

  story() {
    this.phase = 'play';
    Sound.music('ranch');
    this.skipText.setVisible(true);
    this.tweens.add({ targets: [this.gateTitle, this.gateSub], alpha: 0, duration: 500, onComplete: () => { this.gateTitle.setVisible(false); this.gateSub.setVisible(false); } });

    // ---- beat 1: the retired hero
    this.say('Luna Chris. The galaxy\'s most decorated astronaut.');
    this.at(1300, () => Sound.sfx('flap'));
    this.at(2700, () => this.say('The space race burned him out. Now he flips flapjacks and looks after Bessie.'));

    // ---- beat 2: the Roquefort Rodents
    this.at(6200, () => { this.say('Then the Roquefort Rodents came calling...'); Sound.music('tense'); this.ufoCrash(); });
    this.at(10600, () => this.say('Their world is rotting. Bessie\'s Mad Cheese is the only cure.'));

    // ---- beat 3: the armoury
    this.at(14000, () => this.cabin());
  }

  ufoCrash() {
    Sound.sfx('ufoFly');
    const ufo = this.add2(this.add.image(-170, -90, 'i_ufo')).setAngle(20);
    this.ufo = ufo;
    this.time.addEvent({ delay: 55, repeat: 14, callback: () => { if (ufo.active) this.puffs(ufo.x - 70, ufo.y + 10, 1, 8, 0x555566); } });
    this.tweens.add({ targets: ufo, x: 660, y: 96, angle: 5, duration: 850, ease: 'Quad.easeIn', onComplete: () => this.impact(ufo) });
  }

  impact(ufo) {
    Sound.sfx('crash');
    this.cameras.main.shake(380, 0.014);
    this.roof.setTexture('i_roofX');
    for (let i = 0; i < 8; i++) {
      const p = this.add2(this.add.image(650 + Phaser.Math.Between(-40, 40), 90, 'i_plank'));
      this.tweens.add({
        targets: p, x: p.x + Phaser.Math.Between(-220, 220), y: p.y - Phaser.Math.Between(60, 150), angle: Phaser.Math.Between(-400, 400),
        duration: 450, ease: 'Quad.easeOut', yoyo: true, onComplete: () => p.destroy()
      });
    }
    this.puffs(660, 130, 10, 90);
    this.tweens.add({ targets: this.chris, x: this.chris.x - 6, yoyo: true, repeat: 3, duration: 50 });

    // the rodents spill out
    const spots = [560, 610, 700];
    this.rats = spots.map((x, i) => {
      const r = this.add2(this.add.image(650, 110, 'i_rat').setOrigin(0.5, 1).setScale(0.2).setAlpha(0));
      this.at(250 + i * 220, () => {
        Sound.sfx('squeak');
        r.setAlpha(1);
        this.tweens.add({ targets: r, x, scale: 1, duration: 600, ease: 'Quad.easeOut' });
        this.tweens.add({ targets: r, y: GROUND, duration: 600, ease: 'Bounce.easeOut' });
      });
      return r;
    });

    // up and away to Bessie
    this.at(1900, () => {
      this.tweens.add({ targets: ufo, x: 470, y: 60, angle: 0, duration: 800, ease: 'Sine.easeInOut', onComplete: () => this.abduct(ufo) });
    });
  }

  abduct(ufo) {
    Sound.sfx('beam'); this.at(300, () => Sound.sfx('moo'));
    const bx = 470;
    const beam = this.add2(this.add.graphics());
    beam.fillStyle(0xfff3a0, 0.38).fillPoints([{ x: bx - 34, y: 96 }, { x: bx + 34, y: 96 }, { x: bx + 120, y: GROUND + 4 }, { x: bx - 120, y: GROUND + 4 }], true);
    beam.fillStyle(0xffffff, 0.22).fillPoints([{ x: bx - 18, y: 96 }, { x: bx + 18, y: 96 }, { x: bx + 60, y: GROUND + 4 }, { x: bx - 60, y: GROUND + 4 }], true);
    this.tweens.add({ targets: beam, alpha: 0.6, yoyo: true, repeat: 5, duration: 160 });
    this.tweens.killTweensOf(this.bessie);
    this.tweens.add({ targets: this.bessie, y: 130, scale: 0.55, angle: 18, duration: 1100, ease: 'Sine.easeInOut' });
    this.bubble(bx + 70, 170, 'MOOOO!', 1300);
    this.at(1300, () => this.bubble(this.chris.x + 20, 90, '...', 1100));
    this.at(1500, () => {
      this.bessie.setAlpha(0);
      Sound.sfx('whoosh');
      this.rats.forEach(r => this.tweens.add({ targets: r, alpha: 0, scale: 0.2, y: r.y - 80, duration: 300 }));
      this.tweens.add({ targets: beam, alpha: 0, duration: 250 });
      this.tweens.add({ targets: ufo, x: 900, y: -60, angle: -12, duration: 700, ease: 'Quad.easeIn' });
    });
  }

  cabin() {
    this.tweens.killAll();
    this.cameras.main.fadeOut(220, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (this.leaving) return;
      this.stage.removeAll(true);
      this.buildCabin();
      this.cameras.main.fadeIn(260, 0, 0, 0);
    });
  }

  buildCabin() {
    Sound.music('sneak');
    const g = this.add2(this.add.graphics());
    g.fillStyle(0x6b4a2f, 1).fillRect(0, 0, STAGE_W, STAGE_H);
    for (let y = 0; y < GROUND; y += 36) line(g, 0, y, STAGE_W, y, 3, 0x553a24);
    g.fillStyle(0x3b2a1e, 1).fillRect(0, GROUND, STAGE_W, 60);
    rrect(g, 110, 66, 600, 26, 4, 0x8a5a3a, 4);                                   // mantle shelf
    rrect(g, 150, 24, 54, 62, 3, 0x2a1a10, 4); circ(g, 177, 56, 18, 0xffffff, 2); // framed photo of Bessie
    g.fillStyle(0x2a2a35, 1).fillCircle(172, 52, 6);
    rrect(g, 735, 110, 50, 70, 3, 0x2a1a10, 4); rrect(g, 741, 116, 38, 58, 2, 0x39d0c8, 2);   // little window

    this.grinder = this.add2(this.add.image(470, 66, 'i_grinder').setOrigin(0.5, 1));

    this.stone = this.add2(this.add.image(500, 96, 'i_stone').setOrigin(0.5, 0));
    this.armory = this.add2(this.add.image(500, 96, 'i_armory').setOrigin(0.5, 0)).setScale(0, 1);

    this.armG = this.add2(this.add.graphics());
    this.chris2 = this.add2(this.add.image(-90, GROUND + 4, 'i_chris').setOrigin(60 / 150, 1));
    this.spat2 = this.add2(this.add.image(-90 + 64, GROUND + 4 - 140, 'i_spat').setOrigin(0.5, 0.92));
    this.glove = this.add2(this.add.image(0, 0, 'i_glove')).setVisible(false);

    const walk = { x: 170 };
    this.tweens.add({
      targets: this.chris2, x: walk.x, duration: 1000, ease: 'Sine.easeOut',
      onUpdate: () => this.spat2.setPosition(this.chris2.x + 64, this.chris2.y - 140)
    });
    this.say('Chris sighs...');
    this.at(1100, () => { Sound.sfx('sigh'); this.bubble(this.chris2.x + 40, 96, '*sigh*', 1100); });
    this.at(1500, () => {
      Sound.sfx('clang');                           // lets go of the spatula, wipes his hands
      this.tweens.add({ targets: this.spat2, y: GROUND + 4, angle: 80, duration: 350, ease: 'Bounce.easeOut' });
    });
    this.at(2300, () => { this.say('...wipes his hands, and twists the pepper grinder.'); this.reach(); });
    this.at(4300, () => this.flipWall());
    this.at(6600, () => this.say('Time to get Bessie back.'));
    this.at(8300, () => this.leave());
  }

  reach() {
    Sound.sfx('stretch');
    const c = this.chris2;
    const sx = c.x + 34, sy = c.y - 120;               // shoulder
    const hx0 = c.x + 64, hy0 = c.y - 140;             // hand rest position
    this.glove.setPosition(hx0, hy0).setVisible(true);
    const draw = () => {
      const a = this.armG; a.clear();
      line(a, sx, sy, this.glove.x, this.glove.y, 20, INK);
      line(a, sx, sy, this.glove.x, this.glove.y, 14, 0xeef2f8);
    };
    draw();
    this.tweens.add({
      targets: this.glove, x: 470, y: 34, duration: 700, ease: 'Sine.easeInOut', onUpdate: draw,
      onComplete: () => {
        const grinder = this.grinder;
        Sound.sfx('grind');
        this.tweens.add({ targets: grinder, angle: { from: -22, to: 22 }, yoyo: true, repeat: 5, duration: 130 });
        this.at(900, () => this.tweens.add({ targets: this.glove, x: hx0, y: hy0, duration: 500, ease: 'Sine.easeInOut', onUpdate: draw }));
      }
    });
  }

  flipWall() {
    Sound.sfx('hiss'); this.at(250, () => Sound.sfx('clunk')); this.at(520, () => Sound.sfx('reveal'));
    this.cameras.main.shake(260, 0.006);
    this.puffs(320, 280, 6, 20); this.puffs(680, 280, 6, 20);
    this.tweens.add({
      targets: this.stone, scaleX: 0, duration: 260, ease: 'Cubic.easeIn',
      onComplete: () => {
        this.tweens.add({ targets: this.armory, scaleX: 1, duration: 280, ease: 'Cubic.easeOut' });
        const flash = this.add2(this.add.rectangle(0, 0, STAGE_W, STAGE_H, 0xffffff, 0.8).setOrigin(0));
        this.tweens.add({ targets: flash, alpha: 0, duration: 450, onComplete: () => flash.destroy() });
        const glow = this.add2(this.add.image(310 + 88, 96 + 52, 'i_glow').setScale(1.1).setAlpha(0.7));
        this.tweens.add({ targets: glow, scale: 1.5, alpha: 0.25, yoyo: true, repeat: -1, duration: 600, ease: 'Sine.easeInOut' });
        this.say('...and reaches for the Mac-Laster 3000.');
      }
    });
  }

  leave() {
    if (this.leaving) return;
    this.leaving = true;
    Sound.music(null);
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('select'));
  }
}
