// ================================================================= SMASH (v3.15): bash small fry into orbit
// A gun-butt BASH no longer just pops a small rat: it LAUNCHES it, Smash Bros style - spinning, trailing streaks, off
// across the planet. Anything it hits on the way takes a whack and (if it's small too) gets launched in turn, so one
// good bash can bowl down a whole line. A launched rat that was finished off by the bash goes out on impact, or if it
// goes high enough, flies off the top of the screen with a star-twinkle KO. Bosses can be hit with flying rats too.
// Big ones (golems, admirals, frogs...), turrets, ships and bosses are too heavy to launch - they get the old shove.
const SMASH_NO = ['lturret', 'ironclad', 'ovendrone', 'polter', 'sharkrat'];
// (v3.92) what a rat you bowl into sounds like: armour and machines CLANG, flyers BOING, ghosts wooo, the rest squeak
const SMASH_METAL = /golem|ironclad|ovendrone|turret|paladin|admiral|drone|wheel|rocket|guard|cart|toff|slicer|knight|cube|wedge/;
const SMASH_FLY = /flyer|wasp|stinkfly|skimmer|bat|germ/;
const SMASH_GHOST = /ghost|phantom|polter/;
function smashMat(o) {
  const k = (o.type || '') + ' ' + ((ENEMY[o.type] || {}).ai || '') + ' ' + (o.ai || '');
  if (o.type === 'boss' || SMASH_METAL.test(k)) return 'bowlMetal';
  if (SMASH_GHOST.test(k)) return 'bowlGhost';
  if (SMASH_FLY.test(k)) return 'bowlBoing';
  return 'bowlSqueak';
}
const SmashMixin = {
  canLaunch(e) {
    const st = ENEMY[e.type] || {};
    return e.type !== 'boss' && !e.launch && !st.big && !e.big && (st.r || e.r) <= 22 && !SMASH_NO.includes(st.ai || e.ai) && !e.over && !e.phased && !e.burrow && this.pl.grabbed !== e && !e.noKnock;
  },
  launchEnemy(e, dir, power, kill) {
    // most go skimming low and fast (to bowl into the others); now and then a finished one is a home run, out of sight
    const homer = kill && Math.random() < 0.3, vt = homer ? rnd(360, 420) : kill ? rnd(620, 720) : rnd(430, 500), vh = homer ? rnd(640, 700) : kill ? rnd(200, 260) : rnd(240, 290);
    e.launch = { vt: dir * vt * power, vh: vh * power, spin: dir * rnd(13, 19), t: 0, kill, bounces: 0, hit: new Set(), roll0: e.roll, power };
    e.kb = 0; if (kill) e.hp = Math.max(0.01, e.hp);
    if (e.h <= 0) e.h = 2;
    Sound.sfx('whoosh'); if (this.trainEvent) this.trainEvent('launch');
  },
  launchUpdate(e, dt) {
    const L = e.launch; L.t += dt;
    e.theta = wrap(e.theta + L.vt / (R + Math.max(0, e.h)) * dt); e.h += L.vh * dt;
    L.vh -= 820 * dt; L.vt *= Math.exp(-0.35 * dt);
    e.roll = (e.roll || 0) + L.spin * dt;
    // speed streaks and smoke behind it
    if (Math.random() < dt * 40) this.burst(e.theta, e.h + e.ch, Math.random() < 0.6 ? 'spark' : 'puff', 1, 0.25);
    // bowling: whatever it flies into takes a whack (and the small ones get launched too)
    for (const o of this.enemies) {
      if (o === e || o.hp <= 0 || o.launch || o.phased || L.hit.has(o)) continue;
      const dx = angDiff(o.theta, e.theta) * (R + Math.max(0, e.h)), dy = (o.h + o.ch) - (e.h + e.ch), rr = (o.r || 14) + (e.r || 14);
      if (dx * dx + dy * dy > rr * rr) continue;
      L.hit.add(o);
      if (this.sfIs && this.sfIs(o)) { this.sfCrack(o); if (o.kind === 'shieldrat' && !(o.dazeT > 0)) this.sfDaze(o); }   // (v3.35) bowling cracks wax and knocks shields away
      const boss = o.type === 'boss', d = Math.sign(L.vt) || 1;
      o.hp -= boss ? 3 : 4; o.flash = 0.08; o.flashCd = 0.15; o.spr.setTintFill(0xffffff); o.spr.hsq = 1;
      this.smashChain = (this.smashChain || 0) + 1; this.smashChainT = 1.2;
      this.popup(o.theta, o.h + o.ch + 30, this.smashChain > 1 ? 'SMASH x' + this.smashChain + '!' : 'SMASH!', '#ff9d3a', true);
      this.addScore(60 * this.smashChain); this.styleAdd('smash', 30); if (this.trainEvent) this.trainEvent('smash');
      Sound.sfx('bowlPin', this.smashChain); Sound.sfx(smashMat(o)); buzz([20, 15, 40]);   // (v3.92) a note up the scale per rat bowled, and what it's made of
      if (!this.training) Ach.best('strike', this.smashChain); this.hitStop = Math.max(this.hitStop || 0, 0.05); this.camKick(d * 5, 2);
      this.bang(o.theta, o.h + o.ch, 14); this.addLight(o.theta, o.h + o.ch, 60, 0xffc080, 0.8, 0.2);
      if (!boss && this.canLaunch(o)) this.launchEnemy(o, d, Math.max(0.65, L.power * 0.85), o.hp <= 0);
      else if (!boss) this.knock(o, e.theta, 260);
      L.kill = true; L.vt *= -0.3; L.vh = Math.max(L.vh, 240);           // it ricochets off, and it's done for
    }
    // off the top of the screen: a star-twinkle KO
    if (L.kill && e.h > (this.def.saucer ? 520 : 420) && L.vh > 0) { this.smashKO(e); return; }
    // landing: a finished one splats; a live one bounces once, then gets up dizzy
    if (e.h <= 0 && L.vh < 0 && L.t > 0.08) {
      e.h = 0;
      if (L.spike && !L.spiked) { L.spiked = true; this.spikeLand(e); }
      if (L.kill) { e.hp = 0; e.launch = null; this.burst(e.theta, 4, 'crumb', 10, 0.9); Sound.sfx('squelch'); this.cameras.main.shake(70, 0.004); return; }
      if (L.bounces < 1 && L.vh < -220) { L.vh = -L.vh * 0.38; L.vt *= 0.5; L.bounces++; this.burst(e.theta, 2, 'puff', 4, 0.5); Sound.sfx('bonk'); return; }
      e.launch = null; e.roll = L.roll0; e.stunT = 0.5;
    }
    if (!L.kill && L.t > 1.2 && e.h > 0 && (ENEMY[e.type] || {}).ai !== 'mouse') { e.launch = null; e.roll = L.roll0; }   // a flyer gets its wings back
  },
  // the Smash Bros KO: a twinkle where it left the screen, a ding, and it's gone
  smashKO(e) {
    const p = this.screenPos(e.theta, e.h + e.ch), W = this.W, H = this.H;
    const x = Math.max(24, Math.min(W - 24, p.x)), y = Math.max(24, Math.min(H - 24, p.y));
    const star = this.add.image(x, y, 'spark').setDepth(30).setScale(0.5).setBlendMode(Phaser.BlendModes.ADD).setTint(0xfff0a0);
    this.tweens.add({ targets: star, scale: 5, angle: 180, alpha: 0, duration: 650, ease: 'Cubic.easeOut', onComplete: () => star.destroy() });
    const ring = this.add.circle(x, y, 6, 0xffffff, 0).setStrokeStyle(3, 0xffd23f).setDepth(30);
    this.tweens.add({ targets: ring, scale: 6, alpha: 0, duration: 500, onComplete: () => ring.destroy() });
    Sound.sfx('chime'); this.addScore(150); this.styleAdd('ko', 50); if (!this.training) Ach.stat('kos');
    const t = this.add.text(x, y + 22, 'K.O.!', { fontFamily: PIXEL, fontSize: '14px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 5 }).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets: t, y: y + 4, alpha: 0, duration: 900, delay: 250, onComplete: () => t.destroy() });
    e.launch = null; e.hp = 0;
  }
};
