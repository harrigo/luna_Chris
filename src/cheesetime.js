// ================================================================= CHEESE TIME (v3.23): Viewtiful-Joe-style slow-mo, as an upgrade
// Fridge-o-tron's STOPWATCH (in the shop): press C / pad X / the touch SLOW button and for a few seconds everything but
// Chris crawls - enemies, their shots, the hazards - while he moves at full speed. His hits land 50% harder and the parry
// window nearly doubles. It costs something: one charge. STOPWATCH I gives one charge a LEVEL (6s); STOPWATCH II
// recharges at the start of every WAVE (6s). The colours drain, a violet haze closes in, streaks trail off him.
const CT = { dur: 6, slow: 0.35, hit: 1.5 };

function makeCtTextures(scene) {
  if (scene.textures.exists('ct_watch')) return;
  pixSprite(scene, 'ct_watch', 22, 24, a => {
    a.rect(9, 0, 13, 3, [0xffe27a, 0xd8a020, 0x8a6008]); a.rect(10, 3, 12, 4, 0x8a6008);
    a.rect(17, 3, 20, 6, [0xffe27a, 0xd8a020, 0x8a6008]);
    a.ell(11, 14, 10, 10, [0xffe27a, 0xd8a020, 0x8a6008]); a.ell(11, 14, 7.5, 7.5, [0xfffbe8, 0xf4ecd0, 0xc8bc98]);
    for (let k = 0; k < 12; k++) { const ang = k * Math.PI / 6; a.px(Math.round(11 + Math.cos(ang) * 6), Math.round(14 + Math.sin(ang) * 6), 0x5a4a2a); }
    a.line([[11, 14], [11, 9]], 0x1a1020); a.line([[11, 14], [15, 16]], 0xd83a2a); a.px(11, 14, 0x1a1020);
  });
}

const CheeseTimeMixin = {
  ctInit() {
    makeCtTextures(this);
    const s = Shop.get(this.registry);
    this.ctLv = this.camp || this.training ? 0 : (s.watch || 0); this.ctT = 0; this.ctCharge = this.ctLv > 0 ? 1 : 0; this.ctWave = this.waveIdx || 0; this.ctReq = false;
    this.ctIcon = this.add.image(0, 0, 'ct_watch').setDepth(20).setVisible(false);
    this.ctKey = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '7px', color: '#e8dcff', stroke: '#1a1020', strokeThickness: 3, align: 'center' }).setOrigin(0.5, 0).setDepth(20).setVisible(false);
    this.ctG = this.add.graphics().setDepth(20);
    this.ctHaze = this.add.graphics().setDepth(19.5);
    this.ctFx = null;
    if (this.input.keyboard) this.input.keyboard.on('keydown-C', () => { this.ctReq = true; });
    this.events.once('shutdown', () => { if (this.ctFx && this.cameras.main.postFX) this.cameras.main.postFX.remove(this.ctFx); this.ctFx = null; });
  },
  ctTry() {
    if (!this.ctLv || this.ctT > 0 || this.ctCharge <= 0 || this.state !== 'play' || this.paused) { if (this.ctLv && this.ctCharge <= 0 && this.state === 'play') { Sound.sfx('clunk'); this.popup(this.pl.theta, this.pl.h + 80, this.ctLv >= 2 ? 'NEXT WAVE!' : 'USED THIS LEVEL', '#b8a8ff'); } return; }
    this.ctCharge--; this.ctT = CT.dur;
    Sound.sfx('psy'); Sound.sfx('whoosh'); buzz([20, 30, 60]);
    this.cameras.main.flash(160, 200, 180, 255); this.camPunch(0.05);
    this.banner('CHEESE TIME!');
    try { if (this.cameras.main.postFX && !this.ctFx) { this.ctFx = this.cameras.main.postFX.addColorMatrix(); this.ctFx.saturate(-0.55); } } catch (e) { this.ctFx = null; }
    this.styleAdd('cheesetime', 20);
  },
  ctEnd() {
    this.ctT = 0; Sound.sfx('whoosh');
    if (this.ctFx && this.cameras.main.postFX) { this.cameras.main.postFX.remove(this.ctFx); this.ctFx = null; }
  },
  // the world's speed this frame (everything but Chris)
  ctK() { return this.ctT > 0 ? CT.slow : 1; },
  ctUpdate(rawDt) {
    if (this.ctLv === undefined) return;
    if (this.ctReq) { this.ctReq = false; this.ctTry(); }
    if (this.ctLv >= 2 && (this.waveIdx || 0) !== this.ctWave) { this.ctWave = this.waveIdx || 0; if (this.ctCharge < 1) { this.ctCharge = 1; if (this.state === 'play') this.popup(this.pl.theta, this.pl.h + 96, 'STOPWATCH READY', '#b8a8ff'); } }
    if (this.ctT > 0) {
      this.ctT -= rawDt;
      if ((this.ctGhost = (this.ctGhost || 0) - rawDt) <= 0) { this.ctGhost = 0.07; this.dashGhost(); }
      if (this.ctT <= 0 || this.state !== 'play') this.ctEnd();
    }
  },
  ctDraw() {
    if (this.ctLv === undefined) return;
    const show = this.ctLv > 0 && (this.state === 'play' || this.state === 'rescue') && !this.camp;
    const W = this.W, H = this.H, g = this.ctG; g.clear(); this.ctHaze.clear();
    this.ctIcon.setVisible(show); this.ctKey.setVisible(show);
    if (this.ctT > 0) {                                                 // the haze closing in round the edges
      const k = Math.min(1, (CT.dur - this.ctT) * 4, this.ctT * 3);
      for (let i = 0; i < 6; i++) { const m = i * 10; this.ctHaze.lineStyle(14, 0x6a3ad8, 0.07 * k).strokeRect(m, m, W - 2 * m, H - 2 * m); }
      this.ctHaze.fillStyle(0x3a1a8a, 0.08 * k).fillRect(0, 0, W, H);
    }
    if (!show) return;
    const tb = this.touchUI && this.btn && this.btn.slow, x = tb ? tb.x : W - 40, y = tb ? tb.y : 214;
    const ready = this.ctCharge > 0 && this.ctT <= 0;
    this.ctIcon.setPosition(x, y).setScale(tb ? 1.6 : 1.4).setAlpha(ready || this.ctT > 0 ? 1 : 0.35).setTint(ready ? 0xffffff : 0x9a8ac8);
    if (tb) { g.fillStyle(0xb8a8ff, ready ? 0.22 : 0.08).fillCircle(x, y, tb.r); g.lineStyle(3, 0xb8a8ff, ready ? 0.8 : 0.3).strokeCircle(x, y, tb.r); }
    if (this.ctT > 0) { g.lineStyle(4, 0xb8a8ff, 1).beginPath(); g.arc(x, y, 20, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (this.ctT / CT.dur), false); g.strokePath(); }
    else if (ready) { g.lineStyle(2, 0xb8a8ff, 0.5 + 0.4 * Math.sin(this.t * 5)).strokeCircle(x, y, 19); }
    const dev = inputDevice();
    this.ctKey.setText(tb ? 'SLOW' : (this.ctT > 0 ? 'CHEESE TIME' : ready ? (dev === 'pad' ? '(X) SLOW-MO' : '[C] SLOW-MO') : (this.ctLv >= 2 ? 'NEXT WAVE' : 'USED'))).setPosition(x, y + (tb ? tb.r + 2 : 18));
  }
};

// hits land harder in Cheese Time (wraps whatever hitK already does)
function ctInstall(L) {
  const hitK = L.prototype.hitK;
  L.prototype.hitK = function (e, th, h) { const k = hitK.call(this, e, th, h); return this.ctT > 0 ? k * CT.hit : k; };
  Object.assign(L.prototype, CheeseTimeMixin);
}
