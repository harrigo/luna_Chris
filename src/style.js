// ================================================================= SKILL MOVES (v3.16): parry, air combos, the style meter
//  PARRY       bash just as an enemy shot reaches you (the first ~0.16s of the swing) and you swat it straight back at
//              whoever's nearest: slow-mo flash, "PARRY!", your gun's heat cleared and topped up. Boss shots too (not the
//              huge stuff: falling rocks, bombs, anything bigger than a fist).
//  JUGGLE      shoot a rat that's been bashed into the air and it stays up (and it's going down for good): JUGGLE xN.
//  UPPERCUT    hold DOWN and BASH on the ground: Chris springs up into a rising uppercut that BOSHES whatever's in front
//              of him straight up - then shoot them to juggle. (v3.18)
//  SPIKE       in the air, hold DOWN and BASH: whatever's below you is driven into the ground (a shockwave knocks the rats
//              round it), and you POGO back up off it.
//  AIR CHAIN   stomps, spikes and juggles strung together before your feet touch down: AIR x2, x3...
//  STYLE       a rank from D to S fills as you mix it up - shots, bashes, smashes, K.O.s, stomps, spikes, juggles, parries.
//              Repeating one move earns less each time; taking a hit knocks you down two ranks. Your rank multiplies the
//              cheddar you pick up (x1 .. x2), and on a run every S rank you hit on a planet is +3 golden crumbs.
const STYLE_RANKS = [
  { r: 'D', at: 0,   col: '#9aa4c8', word: 'DULL',        mult: 1 },
  { r: 'C', at: 90,  col: '#7dc8ff', word: 'COOL',        mult: 1.1 },
  { r: 'B', at: 200, col: '#7dff8a', word: 'BRUTAL',      mult: 1.25 },
  { r: 'A', at: 340, col: '#ffd23f', word: 'AWESOME',     mult: 1.5 },
  { r: 'S', at: 500, col: '#ff5a8a', word: 'SMOKIN\' CHEF!', mult: 2 }
];
const STYLE_MAX = 640;
const Style = { mult: 1 };
(function () {                                    // your style rank multiplies the cheddar you pick up
  const earn = Shop.earn;
  Shop.earn = function (reg, n) { if (Style.noEarn && n > 0) return; if (n > 0 && Style.mult > 1) n = Math.round(n * Style.mult); return earn.call(this, reg, n); };
})();

const StyleMixin = {
  styleInit() {
    this.styleP = 0; this.styleRank = 0; this.styleRecent = []; this.styleIdle = 0; this.styleSWave = -1; Style.mult = 1;
    Style.noEarn = !!this.training;
    this.events.once('shutdown', () => { Style.mult = 1; Style.noEarn = false; });
    const f = { fontFamily: PIXEL, stroke: '#1a1020' };
    this.styleT = this.add.text(0, 0, 'D', Object.assign({ fontSize: '26px', color: '#9aa4c8', strokeThickness: 6 }, f)).setOrigin(0.5).setDepth(20).setScrollFactor(0);
    this.styleW = this.add.text(0, 0, '', Object.assign({ fontSize: '7px', color: '#ffffff', strokeThickness: 3 }, f)).setOrigin(0.5, 0).setDepth(20).setScrollFactor(0);
    this.styleG = this.add.graphics().setDepth(20).setScrollFactor(0);
  },
  // something stylish happened: points, less for repeating yourself
  styleAdd(kind, pts) {
    if (this.styleP === undefined || this.camp || this.state !== 'play') return;
    const rep = this.styleRecent.filter(k => k === kind).length;
    this.styleRecent.push(kind); if (this.styleRecent.length > 6) this.styleRecent.shift();
    this.styleP = Math.min(STYLE_MAX, this.styleP + pts * [1, 0.65, 0.4, 0.25, 0.15, 0.1, 0.1][rep]);
    this.styleIdle = 0;
    this.styleCheckRank();
  },
  styleHit() {
    if (this.styleP === undefined) return;
    const r = Math.max(0, this.styleRank - 2);
    this.styleP = Math.min(this.styleP * 0.35, STYLE_RANKS[r].at + 20); this.styleRecent = [];
    this.styleCheckRank();
  },
  styleCheckRank() {
    let r = 0; for (let i = 0; i < STYLE_RANKS.length; i++) if (this.styleP >= STYLE_RANKS[i].at) r = i;
    if (r !== this.styleRank) {
      const up = r > this.styleRank; this.styleRank = r;
      if (up) {
        this.styleT.setScale(1.8); this.tweens.add({ targets: this.styleT, scale: 1, duration: 260, ease: 'Back.easeOut' });
        Sound.sfx(r === 4 ? 'shine' : 'blip');
        if (r === 4) { this.cameras.main.flash(120, 255, 120, 180); if (Run.on && this.styleSWave !== this.waveIdx) { this.styleSWave = this.waveIdx; Run.styleS = (Run.styleS || 0) + 1; } }
      }
    }
    Style.mult = STYLE_RANKS[this.styleRank].mult;
  },
  styleUpdate(dt) {
    if (this.styleP === undefined) return;
    this.styleIdle += dt;
    if (this.styleIdle > 1.6 && this.styleP > 0) { this.styleP = Math.max(0, this.styleP - dt * (22 + this.styleRank * 10)); this.styleCheckRank(); }
    // air chain resets when he lands
    const P = this.pl;
    if (P.h <= (P.floor || 0) + 0.5 && P.airChain) P.airChain = 0;
  },
  styleDraw() {
    if (!this.styleT) return;
    const show = !this.camp && (this.state === 'play' || this.state === 'rescue' || this.state === 'wonchat');
    this.styleT.setVisible(show); this.styleW.setVisible(show); this.styleG.clear();
    if (!show) return;
    const K = STYLE_RANKS[this.styleRank], x = this.W - 40, y = 150;
    this.styleT.setText(K.r).setColor(K.col).setPosition(x, y + Math.sin(this.t * 8) * (this.styleRank >= 3 ? 1.5 : 0));
    this.styleW.setText(K.word + (K.mult > 1 ? '\nCHEDDAR x' + K.mult : '')).setColor(K.col).setPosition(x, y + 18).setAlign('center');
    const nx = STYLE_RANKS[this.styleRank + 1], k = nx ? (this.styleP - K.at) / (nx.at - K.at) : 1, bw = 56;
    const g = this.styleG; g.fillStyle(0x1a1020, 0.85).fillRect(x - bw / 2 - 2, y + (K.mult > 1 ? 40 : 30), bw + 4, 7);
    g.fillStyle(Phaser.Display.Color.HexStringToColor(K.col).color, 1).fillRect(x - bw / 2, y + (K.mult > 1 ? 41 : 31), bw * Math.max(0, Math.min(1, k)), 5);
  },

  // ---- DODGE (v3.20): double-tap LEFT or RIGHT for a quick dash that way - nothing can touch him for the length of it.
  // Dash through a shot or a rat at the last moment for a CLOSE CALL: slow-mo, style, a little ammo back.
  dashUpdate(dt, inp) {
    const P = this.pl, t = this.t;
    for (const [k, d] of [['left', -1], ['right', 1]]) {
      const on = !!inp[k];
      if (on && !this['dh_' + k]) {                                   // a fresh press: was there another one just before?
        if (this['dt_' + k] !== undefined && t - this['dt_' + k] < 0.27 && !P.dash && !(P.dashCd > 0) && this.state === 'play' && !P.grabbed && !P.ob && !P.pit) this.dashStart(d * (this.axFlip || 1));
        this['dt_' + k] = t;
      }
      this['dh_' + k] = on;
    }
    if (P.dashCd > 0) P.dashCd -= dt;
    if (P.h <= (P.floor || 0) + 0.5) P.airDash = false;
    const D = P.dash; if (!D) return;
    D.t += dt; const u = Math.min(1, D.t / D.len);
    P.vx = D.dir * (820 - 560 * u * u); if (D.air) P.vh = Math.max(P.vh, -30);   // a burst that eases off; in the air he holds his height
    if ((D.ghostT -= dt) <= 0) { D.ghostT = 0.028; this.dashGhost(); }
    if (D.t >= D.len) { P.dash = null; P.vx = D.dir * CFG.runSpeed * 0.9; }
  },
  dashStart(dir) {
    const P = this.pl, air = P.h > (P.floor || 0) + 0.5;
    if (air && P.airDash) return;                                       // one dash per jump
    P.facing = dir;
    P.dash = { t: 0, len: 0.2, dir, air, ghostT: 0, close: false }; P.dashCd = 0.5; if (air) P.airDash = true;
    Sound.sfx('swish'); buzz(15);
    this.burst(P.theta, P.h + 4, 'puff', 5, 0.5);
    if (this.trainEvent) this.trainEvent('dash');
  },
  dashGhost() {                                                         // a pale streak left behind him
    const P = this.pl, p = this.screenPos(P.theta, P.h + 40), z = this.zoom;
    const im = this.add.image(p.x, p.y, 'blob').setDepth(4.9).setTint(0x9fe8ff).setAlpha(0.55).setScale(1.6 * z, 2.6 * z).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: im, alpha: 0, scaleX: 0.4 * z, duration: 220, onComplete: () => im.destroy() });
  },
  closeCall() {
    const P = this.pl, D = P.dash; if (!D || D.close) return;
    D.close = true;
    this.slowT = Math.max(this.slowT || 0, 0.55); P.ammo = Math.min(1, (P.ammo || 0) + 0.35);
    Sound.sfx('shine'); buzz([10, 10, 30]); this.cameras.main.flash(80, 160, 230, 255);
    this.popup(P.theta, P.h + 84, 'CLOSE CALL!', '#9fe8ff', true);
    this.addScore(120); this.styleAdd('dodge', 55);
    if (this.trainEvent) this.trainEvent('close');
  },

  // ---- PARRY: called every frame while the bash is in its opening window
  parryCheck() {
    const P = this.pl; if (P.bashT <= 0 || P.bashT < CFG.bashTime - 0.16 || P.parried) return;
    const dir = P.facing || 1, cy = P.h + (P.duck ? 22 : 34);
    let got = 0;
    for (const b of this.eBullets) {
      if (b.reflected || b.shadow || b.bomb || (b.r || 0) > 16 || b.noParry) continue;
      const ex = angDiff(b.theta, P.theta) * R, ey = b.h - cy;
      if (ex * dir < -26 || Math.hypot(ex, ey) > 78 + (b.r || 6)) continue;
      // swat it back at whoever's nearest in front, harder than it came
      let tgt = null, bd = 1e9;
      for (const e of this.enemies) { if (e.hp <= 0 || e.phased) continue; const dx = angDiff(e.theta, P.theta) * R; if (dx * dir < -40) continue; const d = Math.abs(dx) + Math.abs(e.h - P.h) * 0.5; if (d < bd) { bd = d; tgt = e; } }
      const sp = Math.max(420, Math.hypot(b.vt, b.vh) * 1.8);
      if (tgt) { const tx = angDiff(tgt.theta, b.theta) * R, ty = tgt.h + tgt.ch - b.h, L = Math.hypot(tx, ty) || 1; b.vt = tx / L * sp; b.vh = ty / L * sp; }
      else { b.vt = dir * sp; b.vh = Math.abs(b.vh) * 0.3 + 60; }
      b.reflected = true; b.home = 0; b.grav = 0; b.curl = 0; b.tri = null; b.life = 2.2; b.spr.setTint(0xffb0e0); b.spr.bsx = (b.spr.bsx || 1) * 1.3; b.spr.bsy = (b.spr.bsy || 1) * 1.3;
      got++;
    }
    if (got) {
      P.parried = true;
      this.slowT = Math.max(this.slowT || 0, 0.5); this.hitStop = Math.max(this.hitStop || 0, 0.08);
      P.ammo = 1; P.overheat = false; P.jam = null;
      Sound.sfx('shine'); Sound.sfx('zing'); buzz([20, 10, 60]); this.cameras.main.flash(90, 255, 200, 240); this.camPunch(0.04);
      this.popup(P.theta, P.h + 80, got > 1 ? 'PARRY x' + got + '!' : 'PARRY!', '#ff8ad8', true);
      this.addLight(wrap(P.theta + dir * 30 / R), cy, 90, 0xff9ae0, 0.9, 0.3);
      this.addScore(100 * got); this.styleAdd('parry', 70 + 20 * (got - 1));
      if (this.trainEvent) this.trainEvent('parry');
    }
  },
  // a swatted-back shot: does it hit anything?
  reflectHit(b) {
    for (const e of this.enemies) {
      if (e.hp <= 0 || e.phased) continue;
      const rr = (e.r || 14) + (b.r || 6) + 4;
      if (dist2(b.theta, b.h, e.theta, e.h + e.ch) < rr * rr) {
        e.hp -= e.type === 'boss' ? 6 : 5; e.flash = 0.08; e.flashCd = 0.15; e.spr.setTintFill(0xffffff); e.spr.hsq = 1;
        this.bang(b.theta, b.h, 14); this.burst(b.theta, b.h, 'spark', 8, 0.8); Sound.sfx('bonk');
        if (e.type !== 'boss' && this.canLaunch(e)) this.launchEnemy(e, Math.sign(b.vt) || 1, 0.9, e.hp <= 0);
        this.popup(e.theta, e.h + e.ch + 26, 'RETURN TO SENDER!', '#ff8ad8');
        this.styleAdd('reflect', 40);
        return true;
      }
    }
    return false;
  },

  // ---- JUGGLE: a shot on a flying rat keeps it up
  juggleHit(e) {
    const L = e.launch; if (!L) return;
    e.hp = Math.max(0.01, e.hp); L.kill = true; L.vh = Math.max(L.vh, 300); L.vt *= 0.6; L.t = Math.min(L.t, 0.2);
    L.jug = (L.jug || 0) + 1;
    if (L.jug === 1 || L.jug % 2 === 0) this.popup(e.theta, e.h + e.ch + 24, 'JUGGLE x' + L.jug + '!', '#7dc8ff', L.jug >= 4);
    this.addScore(25 * L.jug); this.styleAdd('juggle', 22);
    this.airChainUp();
    if (this.trainEvent) this.trainEvent('juggle');
  },
  airChainUp() {
    const P = this.pl; if (P.h <= (P.floor || 0) + 0.5) return;
    P.airChain = (P.airChain || 0) + 1;
    if (P.airChain >= 2) { this.popup(P.theta, P.h + 96, 'AIR x' + P.airChain + '!', '#ffd23f', P.airChain >= 4); this.addScore(40 * P.airChain); this.styleAdd('air', 18 + 6 * P.airChain); }
  },

  // ---- UPPERCUT (v3.17): DOWN + BASH, on the ground or in the air. Chris springs up into a rising gun-butt uppercut
  // and BOSHES whatever's in front of him straight up into the air - perfect for juggling with shots afterwards.
  uppercutStart() {
    const P = this.pl, onGround = P.h <= (P.floor || 0) + 0.5;
    P.upper = true; P.vh = Math.max(P.vh || 0, onGround ? 330 : 280); P.diving = false; P.bounceT = 0.45;
    Sound.sfx('whoosh');
    for (let k = 0; k < 6; k++) this.time.delayedCall(k * 30, () => this.burst(wrap(P.theta + (P.facing || 1) * 18 / R), P.h + 20 + k * 10, 'spark', 1, 0.3));
  },
  uppercutHit() {
    const P = this.pl, dir = P.facing || 1;
    let hit = 0;
    for (const e of this.enemies) {
      if (e.hp <= 0 || e.phased) continue;
      const a = angDiff(e.theta, P.theta) * R * dir, top = e.h + e.ch;
      if (a < -24 || a > 82 + (e.r || 14) * 0.5 || top < P.h - 24 || top > P.h + 150) continue;
      e.hp -= e.type === 'boss' ? 4 : CFG.bashDmg + 1; hit++;
      e.flash = 0.08; e.flashCd = 0.15; e.spr.setTintFill(0xffffff); e.spr.hsq = 1;
      if (e.type !== 'boss' && this.canLaunch(e)) {
        this.launchEnemy(e, dir, 1, e.hp <= 0);
        Object.assign(e.launch, { vt: dir * rnd(60, 110), vh: rnd(700, 780), kill: e.hp <= 0 || e.launch.kill, upper: true });
      } else if (e.type !== 'boss') { this.knock(e, P.theta, 200); if (e.h > 0 || e.baseH) e.h += 30; }
      this.burst(e.theta, top, 'spark', 10, 1);
      this.bang(e.theta, top, 16);
    }
    if (hit) {
      P.vh = Math.max(P.vh, 420); P.bounceT = Math.max(P.bounceT || 0, 0.4);   // a rising follow-through, Shoryuken style
      this.popup(P.theta, P.h + 80, hit > 1 ? 'BOSH x' + hit + '!' : (this.boshN = (this.boshN || 0) + 1) % 2 ? 'BOSH!' : 'UPPERCUT!', '#ff9d3a', true);
      Sound.sfx('bonk'); buzz([30, 20, 50]); this.hitStop = Math.max(this.hitStop || 0, 0.08); this.camKick(0, -7); this.camPunch(0.03);
      this.addLight(wrap(P.theta + dir * 30 / R), P.h + 60, 80, 0xffe0a0, 0.8, 0.25);
      this.addScore(80 * hit); this.styleAdd('upper', 40); this.airChainUp();
      if (this.trainEvent) this.trainEvent('uppercut');
    }
    return hit;
  },
  // ---- SPIKE: DOWN + BASH in the air (v3.18: back alongside the ground uppercut)
  spikeHit() {
    const P = this.pl, dir = P.facing || 1;
    let hit = 0;
    for (const e of this.enemies) {
      if (e.hp <= 0 || e.phased) continue;
      const a = angDiff(e.theta, P.theta) * R * dir, top = e.h + e.ch;
      if (a < -40 || a > 70 || top > P.h + 26 || top < P.h - 130) continue;
      e.hp -= e.type === 'boss' ? 4 : CFG.bashDmg + 1; hit++;
      e.flash = 0.08; e.flashCd = 0.15; e.spr.setTintFill(0xffffff); e.spr.hsq = 1;
      if (e.type !== 'boss' && this.canLaunch(e)) {
        this.launchEnemy(e, dir, 1, e.hp <= 0);
        Object.assign(e.launch, { vt: dir * 120, vh: -720, spike: true, kill: e.hp <= 0 || e.launch.kill });
      }
      this.burst(e.theta, top, 'spark', 8, 0.9);
    }
    if (hit) {
      P.vh = 470; P.diving = false; P.bounceT = 0.3; this.stompBoost();
      this.popup(P.theta, P.h + 70, 'SPIKE!', '#ff9d3a', true);
      Sound.sfx('bonk'); Sound.sfx('jump'); buzz([30, 20, 50]); this.hitStop = Math.max(this.hitStop || 0, 0.08); this.camKick(0, 6);
      this.styleAdd('spike', 45); this.airChainUp();
      if (this.trainEvent) this.trainEvent('spike');
    }
    return hit;
  },
  // a spiked rat hits the deck: a shockwave knocks the rats around it
  spikeLand(e) {
    this.cameras.main.shake(120, 0.008); this.bang(e.theta, 4, 26); this.burst(e.theta, 4, 'crumb', 14, 1.1); Sound.sfx('crash');
    for (const o of this.enemies) {
      if (o === e || o.hp <= 0 || o.phased || o.launch) continue;
      if (Math.abs(angDiff(o.theta, e.theta)) * R < 90 && o.h < 40) {
        o.hp -= o.type === 'boss' ? 2 : 3; o.flash = 0.08; o.spr.setTintFill(0xffffff);
        if (o.type !== 'boss' && this.canLaunch(o)) this.launchEnemy(o, Math.sign(angDiff(o.theta, e.theta)) || 1, 0.7, o.hp <= 0);
        else if (o.type !== 'boss') this.knock(o, e.theta, 240);
      }
    }
    this.popup(e.theta, 40, 'SHOCKWAVE!', '#ffd23f');
  }
};
