// ================================================================= CHEESE TIME (v3.24): Viewtiful-Joe-style slow-mo, from SLOW-MO CHEESE
// SLOW-MO CHEESE is a collectible you keep in your pocket (up to 3): press C / pad RB / the touch SLOW button to eat one,
// and for 6 seconds everything but Chris crawls - enemies, their shots, the hazards - while he moves at full speed. His
// hits land 50% harder and the parry window nearly doubles. The colours drain and a violet haze closes in.
// Where they come from: one floats somewhere on every level (up high - jump or jet for it), the Slow-Mo Brie power-up
// that drops from enemies goes in your pocket instead of going off straight away (unless your pocket's full), and
// Fridge-o-tron sells them. In the campaign they carry over like your upgrades; on a run, they're for that run.
const CT = { dur: 6, slow: 0.1, chris: 0.6, hit: 1.5, max: 3, cost: 150 };

const CheeseTimeMixin = {
  ctOn() { return !this.camp && !this.training; },
  ctKeyName() { return 'ctgot_' + this.levelId + (Run.on ? '_' + Run.t0 : ''); },
  ctCount() { return Shop.get(this.registry).slowmo || 0; },
  ctInit() {
    this.ctT = 0; this.ctReq = false;
    this.ctIcon = this.add.image(0, 0, 'pu_slowmo').setDepth(20).setVisible(false);
    this.ctKey = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '7px', color: '#e8dcff', stroke: '#1a1020', strokeThickness: 3, align: 'center' }).setOrigin(0.5, 0).setDepth(20).setVisible(false);
    this.ctN = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '9px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 4 }).setOrigin(0, 1).setDepth(20).setVisible(false);
    this.ctG = this.add.graphics().setDepth(20);
    this.ctHaze = this.add.graphics().setDepth(19.5);
    this.ctFx = null;
    if (this.input.keyboard) this.input.keyboard.on('keydown-C', () => { this.ctReq = true; });
    this.events.once('shutdown', () => { try { const c = this.cameras && this.cameras.main; if (this.ctFx && c && c.postFX) c.postFX.remove(this.ctFx); } catch (e) { /* camera already gone */ } this.ctFx = null; });
  },
  // one on every level, floating up high somewhere round the planet
  ctPlace() {
    if (!this.ctOn() || this.registry.get(this.ctKeyName())) return;      // (once you've had a level's one, it's gone - even if you retry)
    const P = this.pl, th = wrap(P.theta + (Math.random() < 0.5 ? -1 : 1) * rnd(0.9, 2.3)), B = BUFFS.slowmo;
    this.pickups.push({ kind: 'buff', bk: 'slowmo', theta: th, h: 150, hover: 150, vh: 0, life: 1e9, spr: (() => { const im = this.add.image(0, 0, B.tex).setDepth(6); bakedGlow(im, B.col, 3, 8); im.bsx = im.bsy = 1.3; return im; })() });
  },
  // picked up a Slow-Mo cheese: into the pocket (false = the pocket's full, so it goes off now instead)
  ctPocketAdd(p) {
    if (!this.ctOn()) return false;
    if (p && p.hover !== undefined) this.registry.set(this.ctKeyName(), true);
    const s = Shop.get(this.registry); if ((s.slowmo || 0) >= CT.max) return false;
    s.slowmo = (s.slowmo || 0) + 1; Shop.set(this.registry, s);
    Sound.sfx('power'); this.addScore(200);
    this.banner('SLOW-MO CHEESE!\n' + (inputDevice() === 'touch' ? 'TAP SLOW' : inputDevice() === 'pad' ? 'PRESS RB' : 'PRESS C') + ' FOR CHEESE TIME');
    this.ctIcon.setScale(3); this.tweens.add({ targets: this.ctIcon, scale: 1.4, duration: 300, ease: 'Back.easeOut' });
    return true;
  },
  ctTry() {
    if (!this.ctOn() || this.ctT > 0 || this.state !== 'play' || this.paused) return;
    const s = Shop.get(this.registry);
    if (!(s.slowmo > 0)) { Sound.sfx('clunk'); this.popup(this.pl.theta, this.pl.h + 80, 'NO SLOW-MO CHEESE', '#b8a8ff'); return; }
    s.slowmo--; Shop.set(this.registry, s);
    this.ctT = CT.dur;
    Sound.sfx('psy'); Sound.sfx('whoosh'); buzz([20, 30, 60]);
    this.cameras.main.flash(160, 200, 180, 255); this.camPunch(0.05);
    this.banner('CHEESE TIME!');
    try { if (this.cameras.main.postFX && !this.ctFx) { this.ctFx = this.cameras.main.postFX.addColorMatrix(); this.ctFx.saturate(-0.55); } } catch (e) { this.ctFx = null; }
    this.styleAdd('cheesetime', 20);
  },
  ctEnd() {
    this.ctT = 0; Sound.sfx('whoosh');
    try { const c = this.cameras && this.cameras.main; if (this.ctFx && c && c.postFX) c.postFX.remove(this.ctFx); } catch (e) { /* ignore */ } this.ctFx = null;
  },
  // the world's speed this frame (everything but Chris)
  ctK() { return this.ctT > 0 ? CT.slow : 1; },
  ctUpdate(rawDt) {
    if (this.ctIcon === undefined) return;
    if (this.ctReq) { this.ctReq = false; this.ctTry(); }
    if (this.ctT > 0) {
      this.ctT -= rawDt;
      if ((this.ctGhost = (this.ctGhost || 0) - rawDt) <= 0) { this.ctGhost = 0.07; this.dashGhost(); }
      if (this.ctT <= 0 || this.state !== 'play') this.ctEnd();
    }
  },
  ctDraw() {
    if (this.ctIcon === undefined) return;
    const n = this.ctOn() ? this.ctCount() : 0;
    const show = this.ctOn() && (n > 0 || this.ctT > 0) && (this.state === 'play' || this.state === 'rescue');
    const W = this.W, H = this.H, g = this.ctG; g.clear(); this.ctHaze.clear();
    this.ctIcon.setVisible(show); this.ctKey.setVisible(show); this.ctN.setVisible(show && n > 1);
    if (this.ctT > 0) {                                                 // the haze closing in round the edges
      const k = Math.min(1, (CT.dur - this.ctT) * 4, this.ctT * 3);
      for (let i = 0; i < 6; i++) { const m = i * 10; this.ctHaze.lineStyle(14, 0x6a3ad8, 0.07 * k).strokeRect(m, m, W - 2 * m, H - 2 * m); }
      this.ctHaze.fillStyle(0x3a1a8a, 0.08 * k).fillRect(0, 0, W, H);
    }
    if (!show) return;
    const tb = this.touchUI && this.btn && this.btn.slow, x = tb ? tb.x : W - 40, y = tb ? tb.y : 214;
    this.ctIcon.setPosition(x, y); if (this.ctIcon.scale < 1.3) this.ctIcon.setScale(tb ? 1.6 : 1.4);
    if (tb) { g.fillStyle(0xb8a8ff, 0.2).fillCircle(x, y, tb.r); g.lineStyle(3, 0xb8a8ff, 0.8).strokeCircle(x, y, tb.r); }
    if (this.ctT > 0) { g.lineStyle(4, 0xb8a8ff, 1).beginPath(); g.arc(x, y, 20, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (this.ctT / CT.dur), false); g.strokePath(); }
    else g.lineStyle(2, 0xb8a8ff, 0.5 + 0.4 * Math.sin(this.t * 5)).strokeCircle(x, y, 19);
    this.ctN.setText('x' + n).setPosition(x + 12, y + 14);
    const dev = inputDevice();
    this.ctKey.setText(tb ? 'SLOW' : (this.ctT > 0 ? 'CHEESE TIME' : (dev === 'pad' ? '(RB) SLOW-MO' : '[C] SLOW-MO'))).setPosition(x, y + (tb ? tb.r + 2 : 18));
  }
};

// hits land harder in Cheese Time (wraps whatever hitK already does)
function ctInstall(L) {
  const hitK = L.prototype.hitK;
  L.prototype.hitK = function (e, th, h) { const k = hitK.call(this, e, th, h); return this.ctT > 0 ? k * CT.hit : k; };
  Object.assign(L.prototype, CheeseTimeMixin);
}
