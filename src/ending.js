// Luna Chris - the ENDING. Same pixel-cutscene engine as the intro (it extends IntroScene and borrows its stage, captions,
// speech bubbles and the real Chris rig), just a lot sillier. Plays after beating Level 9; also on the menu once the game
// is finished, or straight away with ?ending in the URL.

function makeEndingPix(scene) {
  if (scene.textures.exists('ix_tank')) return;
  const W = 760;
  // a ruined red sky, and a "cured" one that fades in when the planet gets better
  const skyTex = (key, cols, seed) => pixTex(scene, key, W, 360, put => {
    const n = cols.length - 1, r = rng(seed);
    for (let y = 0; y < 360; y++) { const v = Math.pow(y / 359, 1.3) * n, lo = Math.floor(v), f = v - lo; for (let x = 0; x < W; x++) put(x, y, cols[Math.min(n, lo + (f > bay(x, y) ? 1 : 0))]); }
    for (let i = 0; i < 220; i++) { const x = r() * W | 0, y = Math.pow(r(), 1.5) * 240 | 0; put(x, y, [0xffffff, 0xffd0c0, 0xfff1a0][i % 3]); }
  });
  skyTex('ix_sky_ruin', [0x100204, 0x220408, 0x3a080c, 0x5a1010, 0x7a1c10, 0x9a2c10, 0xc04a14], 91);
  skyTex('ix_sky_cured', [0x0b1a40, 0x14286a, 0x1e3c8a, 0x2c58a8, 0x4a7ac0, 0x78a8d8, 0xb8dcf0], 92);
  // the dairy-extraction tank Bessie is stuck in
  pixSprite(scene, 'ix_tank', 96, 104, p => {
    const STEEL = [0xdfe6f0, 0x9aa4b4, 0x5a6272];
    p.rrect(4, 84, 91, 103, 3, STEEL); p.rect(10, 90, 85, 92, 0xff3030);
    p.rrect(4, 0, 91, 14, 3, STEEL); p.line([[48, 0], [48, -2]], 0x5a6272);
    for (const x of [6, 88]) p.rect(x, 14, x + 2, 84, 0x9aa4b4);
    p.line([[14, 18], [10, 40]], 0xffffff, 2); p.line([[20, 20], [17, 32]], 0xd8f4ff);         // glass glints
    p.rrect(88, 30, 96, 40, 2, [0xffe27a, 0xf0bc36, 0xb8801c]); p.line([[92, 40], [92, 60]], 0x5a6272, 3);   // the cheese-suction pipe
  });
  pixSprite(scene, 'ix_shard', 8, 10, p => p.poly([[1, 9], [4, 0], [7, 6]], [0xffffff, 0xcfeeff, 0x8ac0e0]));
  // the Rat-King, out of his mech, in his pants
  pixSprite(scene, 'ix_king', 30, 34, p => {
    p.line([[4, 26], [0, 18], [3, 12]], 0xd9a5b3, 2);
    p.ell(15, 22, 9, 8, [0xc0c8d4, 0x9aa3b2, 0x6a7280]);
    p.rrect(8, 22, 22, 29, 2, [0xffffff, 0xf0f0f0, 0xc8c8c8]);                                   // undies...
    for (const [x, y] of [[10, 24], [14, 26], [18, 24], [12, 28], [19, 28]]) p.px(x, y, 0xe63946); // ...with red polka dots
    p.ell(22, 12, 7, 6, [0xc0c8d4, 0x9aa3b2, 0x6a7280]); p.ell(18, 6, 2.5, 3, [0xffc8d8, 0xff9db8, 0xc06a88]); p.ell(25, 5, 2.5, 3, [0xffc8d8, 0xff9db8, 0xc06a88]);
    p.px(25, 11, 0x1a1020); p.ell(29, 13, 1.5, 1.5, 0xff9db8);
    p.poly([[15, 4], [17, 0], [19, 3], [21, 0], [23, 3], [25, 0], [27, 4]], [0xfff0a0, 0xffc83a, 0xb07a1a]);   // crooked crown
    for (const x of [11, 17]) p.rect(x, 30, x + 2, 33, 0x9aa3b2);
  });
  pixSprite(scene, 'ix_apron', 12, 12, p => { p.rrect(1, 1, 10, 11, 2, [0xffffff, 0xe8e8f0, 0xb8b8c8]); p.rect(3, 4, 8, 5, 0xe63946); });
  pixSprite(scene, 'ix_heart', 11, 10, p => { p.ell(3, 3, 2.5, 2.5, [0xff8aa8, 0xe8305a, 0x9a1030]); p.ell(7, 3, 2.5, 2.5, [0xff8aa8, 0xe8305a, 0x9a1030]); p.poly([[0.5, 4], [10.5, 4], [5.5, 9.5]], [0xff8aa8, 0xe8305a, 0x9a1030]); p.px(2, 2, 0xffffff); });
  pixSprite(scene, 'ix_flower', 10, 14, p => { p.line([[5, 13], [5, 6]], 0x3aa040, 1); p.px(4, 10, 0x6fd84a); for (const [x, y] of [[5, 2], [3, 4], [7, 4], [5, 6]]) p.ell(x, y, 1.6, 1.6, [0xffffff, 0xff9ad8, 0xc04a90]); p.px(5, 4, 0xffd23f); });
  pixSprite(scene, 'ix_crown', 14, 9, p => p.poly([[1, 8], [1, 2], [4, 5], [7, 0], [10, 5], [13, 2], [13, 8]], [0xfff0a0, 0xffc83a, 0xb07a1a]));
  pixSprite(scene, 'ix_bunting', 300, 22, p => {
    const pts = []; for (let k = 0; k <= 20; k++) { const t = k / 20; pts.push([2 + t * 296, 3 + Math.sin(t * Math.PI) * 8]); }
    p.line(pts, 0xffd23f);
    const cols = [[0xff8a8a, 0xe63946, 0x901818], [0xffe27a, 0xffc83a, 0xb07a1a], [0x9fd8ff, 0x3a8ae0, 0x1a4a8a], [0xb4ff8a, 0x5fcf3a, 0x2f8a1a]];
    for (let k = 0; k < 14; k++) { const t = (k + 0.5) / 14, x = 2 + t * 296, y = 3 + Math.sin(t * Math.PI) * 8; p.poly([[x - 6, y], [x + 6, y], [x, y + 11]], cols[k % 4]); }
  });
}

class EndingScene extends IntroScene {
  constructor() { super('ending'); }
  preload() {}

  create() {
    buildAllTextures(this); makeEndingPix(this);
    this.cameras.main.setBackgroundColor('#000000');
    this.phase = 'play'; this.leaving = false; this.rig = null; this.shot = null; this.acts = []; this.skipArmed = false;
    this.stage = this.add.container(0, 0).setDepth(1);
    this.bars = this.add.graphics().setDepth(8);
    this.caption = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '11px', color: '#ffffff', lineSpacing: 7 }).setDepth(10);
    this.chapter = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '8px', color: '#ffd23f' }).setDepth(10);
    this.skipText = this.add.text(0, 0, 'SKIP >>', { fontFamily: PIXEL, fontSize: '8px', color: '#9fa6c2' }).setOrigin(1, 0.5).setDepth(10);
    this.flashRect = this.add.rectangle(0, 0, 10, 10, 0xffffff, 0).setOrigin(0).setDepth(9);
    // (the intro's title-gate bits, hidden: fit() positions them)
    this.capText = this.add.text(0, 0, '').setVisible(false); this.gateTitle = this.add.text(0, 0, '').setVisible(false); this.gateSub = this.add.text(0, 0, '').setVisible(false);
    this.fit();
    this.scale.on('resize', this.fit, this);
    const padOff = Pad.on(b => { if (['a', 'b', 'x', 'y', 'start'].includes(b)) this.press(); });
    this.events.once('shutdown', () => { this.scale.off('resize', this.fit, this); padOff(); Sound.jet(false); });
    if (this.input.keyboard) this.input.keyboard.on('keydown', e => { if (['Enter', ' ', 'Escape', 'x', 'X', 'z', 'Z'].includes(e.key)) this.press(); });
    this.input.on('pointerdown', () => this.press());
    Sound.init();
    this.cameras.main.fadeIn(700, 0, 0, 0);
    this.shotRescue();
  }

  // the end card: tapping leaves rather than skipping
  press() {
    if (this.leaving) return;
    if (this.creditsUp) { this.leave(); return; }
    super.press();
  }

  heartBurst(x, y, n, spread = 40) {
    for (let i = 0; i < n; i++) {
      const h = this.img(x, y, 'ix_heart', 0.5, 0.5).setScale(0.3);
      const a = Phaser.Math.FloatBetween(-Math.PI, 0), d = Phaser.Math.FloatBetween(spread * 0.4, spread);
      this.tweens.add({ targets: h, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d - 10, scale: Phaser.Math.FloatBetween(0.8, 1.4), duration: 500, ease: 'Quad.easeOut' });
      this.tweens.add({ targets: h, y: '-=30', alpha: 0, delay: 600 + i * 20, duration: 700, onComplete: () => h.destroy() });
    }
  }

  firework(x, y) {
    const cols = [0xffd23f, 0xff6ad5, 0x5ce1ff, 0x7dff8a, 0xffffff, 0xff9a3a];
    const em = this.add2(this.add.particles(x, y, 'spark', { speed: { min: 40, max: 130 }, lifespan: 1000, scale: { start: 1.2, end: 0 }, gravityY: 60, blendMode: 'ADD', tint: cols[Math.floor(Math.random() * cols.length)], emitting: false }));
    em.explode(30); Sound.sfx('shine');
    this.time.delayedCall(1300, () => em.destroy());
  }

  // ============================================================= 1: the rescue, on the ruins of Parmesan Prime
  shotRescue() {
    this.clearShot();
    this.chapter.setText('PARMESAN PRIME  -  WHAT IS LEFT OF IT');
    Sound.music('tense');
    this.img(0, GY + 12, 'ix_sky_ruin');
    this.twinkles(-360, 360, -280, -40);
    this.img(0, GY + 2, 'ix_hills_far').setTint(0x803030);
    this.img(0, GY + 4, 'ix_hills_mid').setTint(0x9a6a4a);
    this.add2(this.add.particles(0, -120, 'spark', { x: { min: -360, max: 360 }, speedY: { min: 20, max: 60 }, lifespan: 4000, scale: { start: 0.6, end: 0.2 }, tint: 0xff8a3a, frequency: 120, blendMode: 'ADD' }));   // ash
    const wreck = this.img(150, GY + 8, 'ratking', 0.5, 1).setAngle(-12).setTint(0x8a7a7a);
    this.add2(this.add.particles(150, GY - 70, 'ix_smoke', { lifespan: 2400, speedY: { min: -24, max: -10 }, speedX: { min: -6, max: 10 }, scale: { start: 0.7, end: 1.8 }, alpha: { start: 0.8, end: 0 }, frequency: 160 }));
    this.img(0, GY - 1, 'ix_ground', 0.5, 0).setTint(0xd8c8a0);
    for (const [x, k] of [[-240, 'p_skull'], [-150, 'db_bolt'], [230, 'p_skull'], [-60, 'db_bolt']]) this.img(x, GY + 2, k).setTint(0xd8c0b0);
    // Bessie, sulking in the extraction tank
    this.bessie = this.img(10, GY - 10, 'bessie').setFlipX(true);
    this.bessieGlass = this.img(10, GY - 2, 'puff', 0.5, 0.5).setScale(1.2, 1.3).setTint(0x9fd8ff).setAlpha(0.35);
    this.tank = this.img(10, GY + 2, 'ix_tank');
    this.tweens.add({ targets: this.bessie, angle: { from: -3, to: 3 }, yoyo: true, repeat: -1, duration: 900 });

    this.makeChris(-180, 1, 'gun');
    this.P.h = 300; this.hop = true; this.P.thrusting = true; this.thrustAcc = -220; this.P.vh = -60;   // jets down from the sky
    const jets = [0, 1].map(() => this.add2(this.add.particles(0, 0, 'flame', { lifespan: 300, speedY: { min: 60, max: 140 }, speedX: { min: -16, max: 16 }, scale: { start: 2.2, end: 0 }, blendMode: 'ADD', frequency: 22 })));
    Sound.jet(true);
    this.acts.push(() => {
      if (!this.rig) return;
      const r = this.rig.root, sx = r.scaleX, sy = r.scaleY;
      jets[0].setPosition(r.x + this.rig.bootF.x * sx, r.y + 2 * sy); jets[1].setPosition(r.x + this.rig.bootB.x * sx, r.y + 2 * sy);
      if (this.P.thrusting && this.P.h < 30) {                     // touch down
        this.P.thrusting = false; this.P.h = 0; this.P.vh = 0; this.hop = false; jets.forEach(j => j.stop()); Sound.jet(false);
        this.dust(this.cx, GY, 8, 'ix_dust', 20, 14); this.shake(150, 0.005);
      }
    });
    this.say('MEANWHILE, ON THE SMOKING RUINS OF PARMESAN PRIME...');
    this.at(2600, () => { this.say('...LUNA CHRIS FOUND HER.'); this.bubble(this.cx + 4, GY - 104, 'BESSIE!!!', 1600, '#d0302a'); });
    this.at(3600, () => { Sound.sfx('moo'); this.bubble(30, GY - 72, 'MOO?!', 1400); this.tweens.killTweensOf(this.bessie); });
    this.at(4800, () => {                                          // pew pew: smash the glass
      for (let i = 0; i < 5; i++) this.at(i * 110, () => {
        this.P.firing = 0.12; Sound.sfx('shoot');
        const m = this.handPoint(58, 0), b = this.img(m.x, m.y, 'macaroni', 0.5, 0.5);
        this.tweens.add({ targets: b, x: -12, y: GY - 30 + i * 6, duration: 180, onComplete: () => { b.destroy(); this.dust(-14, GY - 30 + i * 6, 2, 'ix_dust', 4, 8); } });
      });
    });
    this.at(5500, () => {
      Sound.sfx('crash'); this.shake(300, 0.012); this.flash(0.7, 300);
      this.tank.setVisible(false); this.bessieGlass.setVisible(false);
      for (let i = 0; i < 14; i++) {
        const s = this.img(10 + Phaser.Math.Between(-30, 30), GY - Phaser.Math.Between(10, 90), 'ix_shard', 0.5, 0.5);
        this.tweens.add({ targets: s, x: s.x + Phaser.Math.Between(-90, 90), y: GY, angle: Phaser.Math.Between(-500, 500), duration: Phaser.Math.Between(500, 900), ease: 'Quad.easeIn', onComplete: () => this.tweens.add({ targets: s, alpha: 0, delay: 900, duration: 300 }) });
      }
      this.tweens.add({ targets: this.bessie, y: GY + 1, duration: 300, ease: 'Bounce.easeOut' });
      this.say('THE GLASS NEVER STOOD A CHANCE.');
    });
    this.at(7600, () => this.cut(this.shotRun));
  }

  // ============================================================= 2: the slow-motion run (it is a very big field)
  shotRun() {
    this.chapter.setText('THE REUNION');
    Sound.music('ranch');
    this.img(0, GY + 12, 'ix_sky_dusk');
    this.twinkles(-360, 360, -280, -20);
    this.img(0, GY + 2, 'ix_hills_far'); this.img(0, GY + 4, 'ix_hills_mid');
    this.img(0, GY - 1, 'ix_ground', 0.5, 0);
    this.add2(this.add.particles(0, -40, 'spark', { x: { min: -300, max: 300 }, y: { min: -60, max: 40 }, lifespan: 1600, scale: { start: 0, end: 1.2 }, alpha: { start: 1, end: 0 }, frequency: 50, blendMode: 'ADD', tint: [0xffffff, 0xffd8f0, 0xfff1a0] }));   // dreamy sparkles
    this.makeChris(-230, 1, 'gun');
    this.walkSpeed = 22; this.walkTo = -40;                         // s l o w   m o t i o n
    const B = this.bessie = this.img(230, GY + 1, 'bessie').setFlipX(true);
    this.tweens.add({ targets: B, x: 40, duration: 8000, ease: 'Linear' });
    this.acts.push(() => { B.y = GY + 1 - Math.abs(Math.sin(this.time.now / 380)) * 4; });   // slow-mo gallop
    this.say('THEY RAN TOWARDS EACH OTHER IN SLOW MOTION. AS IS TRADITIONAL.');
    this.at(1200, () => this.bubble(this.cx + 4, GY - 104, 'BEEEEESSSSIIIIEEEEE...', 2600));
    this.at(2600, () => { Sound.sfx('moo'); this.bubble(B.x + 10, GY - 66, 'MOOOOOOOOOOOO...', 2400); });
    this.at(4300, () => this.cut(this.shotWide));
  }

  shotWide() {                                                       // ...cut to a wide shot: they are still miles apart
    this.chapter.setText('THE REUNION (CONTINUED)');
    this.img(0, GY + 12, 'ix_sky_dusk');
    this.img(0, GY - 1, 'ix_ground', 0.5, 0);
    const field = this.add2(this.add.container(0, 0));
    const chris = this.add.image(-250, GY + 1, 'chris').setOrigin(0.5, 1).setScale(0.35);
    const cow = this.add.image(250, GY + 1, 'bessie').setOrigin(0.5, 1).setScale(0.3).setFlipX(true);
    field.add([chris, cow]);
    this.tweens.add({ targets: chris, y: GY - 2, yoyo: true, repeat: -1, duration: 400 });
    this.tweens.add({ targets: cow, y: GY - 2, yoyo: true, repeat: -1, duration: 420 });
    this.tweens.add({ targets: chris, x: -230, duration: 3000 }); this.tweens.add({ targets: cow, x: 230, duration: 3000 });
    this.say('IT WAS A VERY, VERY BIG FIELD.');
    this.at(2800, () => this.cut(this.shotHug));
  }

  shotHug() {
    this.chapter.setText('THE REUNION (FINALLY)');
    this.img(0, GY + 12, 'ix_sky_dusk');
    this.twinkles(-360, 360, -280, -20);
    this.img(0, GY + 2, 'ix_hills_far'); this.img(0, GY + 4, 'ix_hills_mid');
    this.img(0, GY - 1, 'ix_ground', 0.5, 0);
    this.makeChris(-80, 1, 'gun');
    this.walkSpeed = 120; this.walkTo = -24;
    const B = this.bessie = this.img(90, GY + 1, 'bessie').setFlipX(true);
    this.tweens.add({ targets: B, x: 26, duration: 450, ease: 'Quad.easeIn' });
    this.say('AND THEN...');
    this.at(500, () => {                                             // CRASH-HUG
      Sound.sfx('clunk'); Sound.sfx('moo'); this.shake(250, 0.01); this.flash(0.5, 250);
      this.flashRect.setFillStyle(0xff8ab0, 1); this.at(260, () => this.flashRect.setFillStyle(0xffffff, 1));
      this.heartBurst(0, GY - 40, 18, 80);
      this.hop = true; this.P.vh = 200;
      this.tweens.add({ targets: B, angle: { from: -10, to: 10 }, yoyo: true, repeat: 5, duration: 120 });
      this.say('THE HUG OF THE CENTURY.');
    });
    this.at(1800, () => { Sound.sfx('stretch'); this.bubble(30, GY - 66, 'SLUUUURP!', 1500); this.heartBurst(-10, GY - 70, 6, 30); });
    this.at(2900, () => this.bubble(this.cx - 6, GY - 104, '...I MISSED YOU TOO, GIRL.', 2000));
    this.at(3300, () => this.say('(SHE LICKED HIS VISOR. IT WILL NEVER BE CLEAN AGAIN.)'));
    this.at(5600, () => this.cut(this.shotKing));
  }

  // ============================================================= 3: the Rat-King, in his pants. The planet is cured.
  shotKing() {
    this.chapter.setText('MEANWHILE, IN THE WRECKAGE');
    Sound.music('tense');
    const ruin = this.img(0, GY + 12, 'ix_sky_ruin');
    const cured = this.img(0, GY + 12, 'ix_sky_cured').setAlpha(0);
    const hills = this.img(0, GY + 4, 'ix_hills_mid').setTint(0x9a6a4a);
    const ground = this.img(0, GY - 1, 'ix_ground', 0.5, 0).setTint(0xd8c8a0);
    this.img(110, GY + 8, 'ratking', 0.5, 1).setAngle(-12).setTint(0x8a7a7a);
    const smoke = this.add2(this.add.particles(110, GY - 70, 'ix_smoke', { lifespan: 2000, speedY: { min: -20, max: -10 }, scale: { start: 0.6, end: 1.6 }, alpha: { start: 0.8, end: 0 }, frequency: 200 }));
    this.makeChris(-120, 1, 'gun');
    const B = this.bessie = this.img(-60, GY + 1, 'bessie');
    const K = this.img(110, GY - 20, 'ix_king').setAlpha(0);
    this.say('BUT THE GRAND RAT-KING WAS NOT FINISHED. NOT QUITE.');
    this.at(900, () => {
      K.setAlpha(1); Sound.sfx('squeak');
      this.tweens.add({ targets: K, x: 70, y: GY + 1, duration: 600, ease: 'Bounce.easeOut' });
    });
    this.at(1700, () => this.bubble(70, GY - 50, 'CURSE YOU, LUNA CHRIS!', 1800, '#d0302a'));
    this.at(3700, () => { this.say('HE WAS WEARING HIS PANTS. ONLY HIS PANTS.'); this.tweens.add({ targets: K, angle: { from: -6, to: 6 }, yoyo: true, repeat: 3, duration: 90 }); });
    this.at(5400, () => { Sound.sfx('grind'); this.bubble(70, GY - 50, '*RUMBLE* ...WE ONLY WANTED SOME CHEESE.', 2400); });
    this.at(8000, () => { Sound.sfx('moo'); this.bubble(B.x + 10, GY - 66, 'MOO.', 1200); });
    this.at(8800, () => {                                            // Bessie produces a glowing wheel of Mad Cheese
      Sound.sfx('reveal'); this.say('SO BESSIE MADE HIM A WHEEL OF MAD CHEESE.');
      const W = this.img(-20, GY - 120, 'wheel', 0.5, 0.5).setScale(0.5).setTint(0xfff0a0);
      const glow = this.img(-20, GY - 120, 'puff', 0.5, 0.5).setScale(2).setTint(0xffd23f).setAlpha(0.5).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: [W, glow], x: 40, y: GY - 20, duration: 900, ease: 'Quad.easeIn', onComplete: () => { Sound.sfx('clunk'); this.dust(40, GY, 6, 'ix_dust', 16, 12); } });
      this.tweens.add({ targets: W, angle: 360, duration: 900 });
      this.at(1500, () => { Sound.sfx('flap'); this.bubble(70, GY - 50, '*NOM*', 900); });
      this.at(2400, () => {                                          // ...and the whole planet is CURED
        Sound.music('win'); this.flash(0.9, 800); this.shake(400, 0.006);
        this.tweens.add({ targets: cured, alpha: 1, duration: 1600 });
        hills.clearTint(); ground.clearTint(); smoke.stop();
        W.destroy(); glow.destroy();
        for (let i = 0; i < 26; i++) this.at(i * 40, () => { const f = this.img(Phaser.Math.Between(-300, 300), GY + 2, 'ix_flower').setScale(0); this.tweens.add({ targets: f, scale: Phaser.Math.FloatBetween(1, 1.6), duration: 300, ease: 'Back.easeOut' }); });
        this.say('ONE BITE, AND THE WHOLE PLANET WAS CURED. TURNS OUT THEY JUST HAD TO ASK NICELY.');
        for (let i = 0; i < 5; i++) {                               // the rats pop out and dance
          const r = this.img(140 + i * 22, GY + 1, 'mouse').setFlipX(true).setScale(0);
          this.at(300 + i * 150, () => { Sound.sfx('squeak'); this.tweens.add({ targets: r, scale: 1, duration: 250, ease: 'Back.easeOut' }); this.tweens.add({ targets: r, y: GY - 10, yoyo: true, repeat: -1, duration: 220, delay: i * 60 }); });
        }
        this.tweens.add({ targets: K, y: GY - 12, yoyo: true, repeat: -1, duration: 200 });
      });
      this.at(4600, () => this.bubble(70, GY - 50, '...IS THIS GOUDA?', 1600));
      this.at(6300, () => { Sound.sfx('moo'); this.bubble(B.x + 10, GY - 66, 'MOO!!', 1200); });   // (it is not gouda)
      this.at(7600, () => this.cut(this.shotParty));
    });
  }

  // ============================================================= 4: the party back at the ranch
  shotParty() {
    this.chapter.setText('BACK HOME  -  SPACE RANCH 9');
    Sound.music('ranch');
    this.img(0, GY + 12, 'ix_sky_night');
    this.twinkles(-360, 360, -300, -20);
    this.img(0, GY + 2, 'ix_hills_far'); this.img(0, GY + 4, 'ix_hills_mid');
    this.img(-190, GY + 3, 'ix_cabin');
    this.img(BX, GY + 2, 'ix_barn');
    this.buildStockpile();
    this.img(112, GY + 2, 'ix_fence');
    this.img(0, GY - 1, 'ix_ground', 0.5, 0);
    this.img(0, -60, 'ix_bunting', 0.5, 0);
    const sign = this.add.text(0, -40, 'WELCOME HOME BESSIE!', { fontFamily: PIXEL, fontSize: '9px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 3 }).setOrigin(0.5).setResolution(Math.max(2, Math.ceil(this.s)));
    this.add2(sign);
    this.tweens.add({ targets: sign, y: -36, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.easeInOut' });
    this.buildRanchFolk();
    // Bessie, in a crown
    const B = this.bessie = this.img(30, GY + 1, 'bessie').setFlipX(true);
    const crown = this.img(14, GY - 44, 'ix_crown');
    this.acts.push(() => { const k = Math.abs(Math.sin(this.time.now / 300)) * 4; B.y = GY + 1 - k; crown.y = GY - 44 - k; });
    // the Rat-King, in an apron, on the grill
    this.img(-30, GY + 1, 'ix_grill');
    const K = this.img(-6, GY + 1, 'ix_king').setFlipX(true); this.img(-6, GY - 12, 'ix_apron');
    this.acts.push(() => { K.angle = Math.sin(this.time.now / 150) * 5; });
    this.partyLoops = [];
    this.partyLoops.push(this.time.addEvent({ delay: 900, loop: true, callback: () => {
      const bg = this.img(-30, GY - 24, 'burger', 0.5, 0.5).setScale(0.45);
      this.tweens.add({ targets: bg, y: GY - 70, angle: 360, yoyo: true, duration: 380, ease: 'Quad.easeOut', onComplete: () => bg.destroy() });
    } }));
    // Chris, flipping pancakes onto a stack that keeps growing
    this.makeChris(-110, 1, 'spatula');
    const stack = []; const stackX = -78;
    this.partyLoops.push(this.time.addEvent({ delay: 700, loop: true, callback: () => {
      if (this.stackGone || !this.rig) return;
      this.P.aimA = 0.9; this.at(120, () => { if (this.P) this.P.aimA = 0; });
      const pc = this.img(this.cx + 30, GY - 50, 'ix_pancake', 0.5, 0.5);
      const y = GY - 2 - stack.length * 4;
      this.tweens.add({ targets: pc, x: stackX, y, angle: 360, duration: 420, ease: 'Quad.easeOut', onComplete: () => { stack.push(pc); Sound.sfx('flap'); } });
    } }));
    this.stack = stack;
    // a rat conga line
    for (let i = 0; i < 6; i++) {
      const r = this.img(-260 - i * 22, GY + 1, 'mouse').setScale(0.85);
      this.tweens.add({ targets: r, x: 300, duration: 9000, delay: i * 120, ease: 'Linear' });
      this.tweens.add({ targets: r, y: GY - 8, yoyo: true, repeat: -1, duration: 200, delay: i * 70 });
    }
    this.partyLoops.push(this.time.addEvent({ delay: 650, loop: true, callback: () => this.firework(Phaser.Math.Between(-260, 260), Phaser.Math.Between(-150, -70)) }));
    this.say('BACK HOME, THERE WAS A PARTY. A BIG ONE.');
    this.at(3000, () => this.say('EVEN THE RATS CAME. THEY BROUGHT CRACKERS.'));
    this.at(4200, () => this.bubble(-6, GY - 46, 'WHO WANTS A BURGER?', 1500));
    this.at(6200, () => this.say('AND SO LUNA CHRIS RETIRED. AGAIN. FOR GOOD THIS TIME. PROBABLY.'));
    this.at(9200, () => {                                            // ...until a tiny UFO nicks the pancakes
      Sound.sfx('ufoFly');
      const ship = this.img(-400, -160, 'ratship', 0.5, 0.5).setScale(0.6);
      const beam = this.img(stackX, GY - 90, 'beam0', 0.5, 0).setScale(0.8, (90 / 84)).setAlpha(0);
      this.tweens.add({ targets: ship, x: stackX, y: GY - 100, duration: 900, ease: 'Quad.easeOut', onComplete: () => {
        Sound.sfx('beam'); this.tweens.add({ targets: beam, alpha: 0.9, duration: 200 });
        let f = 0; this.time.addEvent({ delay: 80, repeat: 30, callback: () => beam.setTexture('beam' + (f = (f + 1) % 4)) });
        this.stackGone = true;
        this.stack.forEach((pc, i) => this.tweens.add({ targets: pc, y: GY - 96, angle: 720, alpha: 0, delay: i * 40, duration: 700 }));
        this.at(1100, () => {
          this.tweens.add({ targets: beam, alpha: 0, duration: 150 });
          this.tweens.add({ targets: ship, x: 500, y: -260, duration: 700, ease: 'Quad.easeIn' }); Sound.sfx('whoosh');
        });
      } });
      this.at(1600, () => { this.P.facing = 1; this.bubble(this.cx + 4, GY - 104, 'OH, COME ON!!', 1800, '#d0302a'); this.shake(150, 0.004); });
      this.at(2400, () => { Sound.sfx('flap'); this.bubble(this.folk.dog.x + 4, GY - 32, 'WOOF!', 1000); });
    });
    this.at(13200, () => this.cut(this.shotCredits));
  }

  // ============================================================= 5: THE END...? + silly credits
  shotCredits() {
    (this.partyLoops || []).forEach(e => e.remove()); this.partyLoops = [];
    this.chapter.setText('');
    Sound.music('stinger', 'title');
    this.img(0, GY + 12, 'ix_sky_night');
    this.twinkles(-360, 360, -300, 100);
    const res = Math.max(2, Math.ceil(this.s));
    const end = this.add.text(0, -40, 'THE END', { fontFamily: PIXEL, fontSize: '28px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 6 }).setOrigin(0.5).setResolution(res).setScale(0);
    const q = this.add.text(78, -52, '?', { fontFamily: PIXEL, fontSize: '20px', color: '#ff6ad5', stroke: '#1a1020', strokeThickness: 5 }).setOrigin(0.5).setResolution(res).setScale(0);
    this.add2(end); this.add2(q);
    this.tweens.add({ targets: end, scale: 1, duration: 600, ease: 'Back.easeOut' });
    this.at(1400, () => { Sound.sfx('pickup'); this.tweens.add({ targets: q, scale: 1, angle: 15, duration: 300, ease: 'Back.easeOut' }); this.tweens.add({ targets: q, y: -56, yoyo: true, repeat: -1, duration: 400 }); });
    this.say('THANKS FOR PLAYING LUNA CHRIS!');
    const lines = [
      ['STARRING', '#9fd8ff'], ['LUNA CHRIS', '#ffffff'], ['AND BESSIE THE COW', '#ffffff'], ['', ''],
      ['ALSO STARRING', '#9fd8ff'], ['THE GRAND RAT-KING (IN HIS PANTS)', '#ffffff'], ['THE DOG', '#ffffff'], ['THE CHICKENS', '#ffffff'], ['', ''],
      ['PANCAKE CONSULTANT', '#9fd8ff'], ['THE DOG AGAIN', '#ffffff'], ['', ''],
      ['ALL CHEESE SUPPLIED BY', '#9fd8ff'], ['BESSIE', '#ffffff'], ['', ''],
      ['NO RATS WERE HARMED', '#9fd8ff'], ['MOST OF THEM WERE CURED', '#ffffff'], ['', ''],
      ['MADE BY', '#9fd8ff'], ['HARRIGO', '#ffd23f'], ['', ''], ['MOO.', '#ffd23f']
    ];
    const roll = this.add2(this.add.container(0, 150));
    lines.forEach(([t, c], i) => { if (t) roll.add(this.add.text(0, i * 16, t, { fontFamily: PIXEL, fontSize: '8px', color: c, stroke: '#1a1020', strokeThickness: 3 }).setOrigin(0.5).setResolution(res)); });
    this.at(2600, () => {
      this.tweens.add({ targets: [end, q], y: '-=200', duration: 4000, ease: 'Sine.easeIn' });
      this.tweens.add({ targets: roll, y: -lines.length * 16 + 10, duration: 16000, ease: 'Linear' });
    });
    // Bessie floats across waving goodbye in zero-g, as she does
    const B = this.img(-420, -10, 'bessie', 0.5, 0.5).setScale(0.8);
    this.tweens.add({ targets: B, x: 420, duration: 14000, delay: 3000 });
    this.tweens.add({ targets: B, angle: 360, duration: 6000, repeat: -1 });
    this.at(9000, () => { Sound.sfx('moo'); this.bubble(B.x, B.y - 40, 'MOO!', 1200); });
    this.at(17000, () => { this.creditsUp = true; this.say('TAP TO CONTINUE'); });
  }

  leave() {
    if (this.leaving) return;
    this.leaving = true;
    Sound.jet(false); Sound.music(null);
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(540, () => this.scene.start('menu'));
  }
}
