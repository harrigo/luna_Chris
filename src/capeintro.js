// ================================================================= CAPE UP! (v3.64)
// The start of every level: the camera's in tight on Chris, still in his cook's apron. He sets his face, RIPS the apron
// off and swirls it round himself - you see the cloth itself whirl (white at first, turning cape-red as it goes, with a
// trail behind it) - and it lands on his back as his cape with a pop and a billow. He grins, the camera pulls back and
// it's GO. He never turns round: all the movement is the cloth. Four ways he does it, picked at random (never the same
// twice running):
//   twirl   whirls it twice round his middle
//   jump    leaps and loops it right round himself in the air
//   top     lassoes it over his head, cheeks puffed, and drops it on
//   slow    a long hard squint, the moustache twitching... then one sudden flick
// Tap / press to skip. Not played on a retry, from a checkpoint, in the Boss Rush, the cavern, camp or training.
// Mixed into Level1 (main.js). State: this.state === 'capeup', this.cape.
const CAPE_GO = ['GO!', 'LET\'S COOK!', 'ORDER UP!', 'CAPE ON!', 'DINNER TIME!'];
const CapeIntroMixin = {
  capeIntroOK() {
    return !this.capeDone && !this.camp && !this.training && !this.rushOn && !this.warped && !(this.def && this.def.cavern) && !(this.deaths > 0) && !this.cp
      && this.rig && this.rig.spinToCape && this.pl && !(this.cave && this.cave.ring > 0);
  },
  capeIntro() {
    const P = this.pl, r = this.rig, kinds = ['twirl', 'jump', 'top', 'slow'];
    let last = -1; try { last = +localStorage.getItem('lc_cape_last'); } catch (e) { /* ignore */ }
    let k = Math.floor(Math.random() * kinds.length); if (k === last) k = (k + 1 + Math.floor(Math.random() * (kinds.length - 1))) % kinds.length;
    try { localStorage.setItem('lc_cape_last', String(k)); } catch (e) { /* ignore */ }
    this.hideOverlay(); this.state = 'capeup';
    const kind = kinds[k];
    this.cape = { t: 0, kind, spinAt: kind === 'slow' ? 0.95 : 0.55, spun: false, landed: false, posed: false, go: false, skip: false, h0: P.h, f0: P.facing || 1, vh: 0 };
    P.facing = 1; P.vx = 0; P.aimA = 0;
    r.setChef(true); r.detFace = kind === 'slow' ? 'c_head_blink' : 'c_head_det';
    this.goCam = { z: 2.5, x: this.W / 2, y: this.H / 2 };
    try { Sound.init(); } catch (e) { /* ignore */ }
  },
  capeTick(dt) {
    const C = this.cape, P = this.pl, r = this.rig; if (!C) { this.state = 'play'; return; }
    C.t += dt;
    const t = C.t, s = t - C.spinAt, kind = C.kind, z = this.zoom, px = P.spr ? P.spr.x : this.W / 2, py = P.spr ? P.spr.y : this.groundY;
    const spinT = kind === 'slow' ? 0.34 : kind === 'top' ? 1.1 : 0.95, HOLD = 0.75, END = C.spinAt + spinT + HOLD + 0.75;
    P.facing = 1;
    // ---- before the whip: he sets himself
    if (s < 0) {
      P.duck = kind !== 'slow' && s > -0.3;                                         // a little crouch to wind up
      if (kind === 'slow') { if (Math.floor(t * 5) !== C.tw) { C.tw = Math.floor(t * 5); r.twitch = 0.22; } if (s > -0.16) r.detFace = 'c_head_det'; }   // the long squint, the moustache going
    } else {
      if (!C.spun) {                                                                // RIP: the apron comes off in his hand
        C.spun = true; P.duck = false; r.apron.setVisible(false); r.apronB.setVisible(false);
        r.detFace = kind === 'top' ? 'c_head_puff' : 'c_head_det';
        const dp = r.root.depth || 7;
        C.cloth = this.add.image(px, py, 'c_apron').setDepth(dp + 0.1);
        C.ghosts = [0, 1, 2, 3].map(k => this.add.image(px, py, 'c_apron').setDepth(dp - 0.11).setAlpha(0));
        C.trail = [];
        this.events.once('shutdown', () => { if (C.cloth) { C.cloth.destroy(); C.cloth = null; } if (C.ghosts) { C.ghosts.forEach(g => g.destroy()); C.ghosts = null; } });
        Sound.sfx('whoosh'); this.cameras.main.shake(90, 0.004);
        if (kind === 'jump') C.vh = 470; else if (kind === 'slow') C.vh = 150; else C.vh = 0;
      }
      if (C.vh || P.h > C.h0) { C.vh -= 1300 * dt; P.h += C.vh * dt; P.vh = C.vh; if (P.h <= C.h0) { P.h = C.h0; P.vh = 0; C.vh = 0; if (!C.landed && kind === 'jump') { C.landed = true; this.cameras.main.shake(160, 0.008); this.burst(P.theta, 3, 'crumb', 10, 0.9); Sound.sfx('clunk'); } } }
      const sp = Math.min(1, s / spinT);
      if (C.cloth) {
        // the cloth's path: round his middle / over his head / right round him, ending at the back of his neck
        const e = sp * sp * (3 - 2 * sp), turns = kind === 'slow' ? 0.5 : kind === 'top' ? 3 : 2, a = Math.PI / 2 + e * (turns * 2 * Math.PI + Math.PI / 2);   // starts in front of him, ends behind
        const O = kind === 'top' ? [2, -98, 34, 9] : kind === 'jump' ? [0, -40, 36, 34] : kind === 'slow' ? [0, -38, 44, 14] : [0, -36, 40, 12];
        const grow = Math.min(1, sp * 5) * Math.min(1, (1 - sp) * 4 + 0.25);
        let cx = O[0] + Math.cos(a) * O[2] * grow, cy = O[1] + Math.sin(a) * O[3] * grow;
        if (sp > 0.82) { const k = (sp - 0.82) / 0.18; cx += (-12 - cx) * k; cy += (-50 - cy) * k; }                // home onto his shoulders
        if (sp < 0.1) { const k = 1 - sp / 0.1; cx += (5 - cx) * k; cy += (-28 - cy) * k; }                         // (from where the apron hung)
        const X = px + cx * z, Y = py + cy * z, front = Math.sin(a) > 0 || kind === 'top', dp = r.root.depth || 7;
        const col = Phaser.Display.Color.GetColor(255, Math.round(255 - 207 * e), Math.round(255 - 207 * e));       // white -> cape red
        C.cloth.setPosition(X, Y).setDepth(dp + (front ? 0.1 : -0.1)).setRotation(a + Math.PI / 2 + Math.sin(t * 30) * 0.2).setScale(z * 1.25 * (0.55 + 0.45 * Math.abs(Math.cos(a * 1.5))), z * 1.25).setTint(col);
        C.trail.unshift([X, Y, C.cloth.rotation, C.cloth.scaleX, col, front]); C.trail.length = Math.min(C.trail.length, 9);
        C.ghosts.forEach((g, k) => { const q = C.trail[(k + 1) * 2]; if (!q) { g.setAlpha(0); return; } g.setPosition(q[0], q[1]).setRotation(q[2]).setScale(q[3], z * 1.25).setTint(q[4]).setAlpha(0.42 - k * 0.09).setDepth(dp + (q[5] ? 0.09 : -0.11)); });
        r.freeRot = Math.atan2(cy + 27, cx + 7);                                     // his free hand follows it round
        if (Math.random() < 0.5) this.burst(P.theta, Math.max(2, P.h - cy), 'spark', 1, 0.3);
      }
      if (sp >= 1 && !C.posed) {                                                    // ...and it's ON: the cape pops out and billows
        C.posed = true; C.poseT = 0;
        if (C.cloth) { C.cloth.destroy(); C.cloth = null; C.ghosts.forEach(g => g.destroy()); C.ghosts = null; }
        r.freeRot = null; r.setChef(false); r.detFace = null; r.grinT = 2;
        if (r.cloth) for (let i = 1; i < r.cloth.length; i++) { r.cloth[i].vx -= 260 + i * 60; r.cloth[i].vy -= 380; }   // thrown out behind him
        r.squash = 0.6; this.burst(P.theta, P.h + 50, 'spark', 16, 1.3); this.cameras.main.shake(120, 0.006);
        Sound.sfx('reveal');
      }
      if (C.posed) {
        C.poseT += dt;
        const k = 1 + 0.9 * Math.exp(-C.poseT * 7) * Math.cos(C.poseT * 22), fl = C.poseT < 0.14;                    // a springy pop, and a white flash on the cloth
        for (const c of r.capeS) { c.setScale(k, Math.max(0.3, k)); if (fl) c.setTintFill(0xffffff); else if (C.poseT < 0.3) c.clearTint(); }
        r.collar.setScale(Math.max(1, k));
        if (!C.out && C.poseT > HOLD) { C.out = true; this.tweens.add({ targets: this.goCam, z: 1, duration: 520, ease: 'Cubic.easeInOut' }); }
      }
      if (C.out && !C.go && this.goCam && this.goCam.z < 1.35) {                     // GO!
        C.go = true;
        const tx = this.add.text(this.W / 2, this.H * 0.36, CAPE_GO[Math.floor(Math.random() * CAPE_GO.length)], { fontFamily: PIXEL, fontSize: '30px', color: '#ffd23f', stroke: '#2a0606', strokeThickness: 8 }).setOrigin(0.5).setDepth(40).setScale(0.2);
        this.tweens.add({ targets: tx, scale: 1, duration: 220, ease: 'Back.easeOut' });
        this.tweens.add({ targets: tx, alpha: 0, scale: 1.5, delay: 750, duration: 300, onComplete: () => tx.destroy() });
        Sound.sfx('charged');
      }
    }
    // the camera: in tight on him (a touch wider while the cloth's flying), following him as he hops
    const hx = px, hy = py - 46 * z;
    if (this.goCam && !C.out) { this.goCam.x = hx; this.goCam.y = hy; this.goCam.z += ((C.spun && !C.posed ? 2.1 : 2.5) - this.goCam.z) * Math.min(1, dt * 6); }
    else if (this.goCam) { const k = Math.max(0, (this.goCam.z - 1) / 1.5); this.goCam.x = this.W / 2 + (hx - this.W / 2) * k; this.goCam.y = this.H / 2 + (hy - this.H / 2) * k; }
    if (C.skip || t >= END) this.capeEnd();
  },
  capeEnd() {
    const C = this.cape, P = this.pl, r = this.rig; if (!C) return;
    this.cape = null; this.capeDone = true;
    this.tweens.killTweensOf(this.goCam); this.goCam = null;
    if (C.cloth) C.cloth.destroy(); if (C.ghosts) C.ghosts.forEach(g => g.destroy());
    if (r.chef || r.morph >= 0) r.setChef(false);
    for (const c of r.capeS) c.setScale(1).clearTint(); r.collar.setScale(1); r.freeRot = null;
    r.detFace = null; P.duck = false; P.facing = 1; P.h = C.h0; P.vh = 0;
    this.state = 'intro'; this.startGame();
  }
};
