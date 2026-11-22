// ================================================================= CAPE UP! (v3.63)
// The start of every level: the camera's in tight on Chris, still in his cook's apron. He sets his face, grabs the
// apron, WHIPS it round (the same spin that turns it into his cape in the opening story), strikes a pose, the camera
// pulls back and it's GO. There are four ways he does it, picked at random (never the same twice running):
//   twirl   spins on the spot with it
//   jump    leaps, spins in the air, lands in a cloud of dust
//   top     goes round like a spinning top, hat flying, and comes out of it dizzy
//   slow    a long hard squint, the moustache twitching... then one sudden whip
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
    const t = C.t, s = t - C.spinAt, kind = C.kind, END = C.spinAt + 1.75;
    // ---- before the spin: he sets himself
    if (s < 0) {
      P.duck = kind !== 'slow' && s > -0.3;                                         // a little crouch to wind up
      if (kind === 'slow') { if (Math.floor(t * 5) !== C.tw) { C.tw = Math.floor(t * 5); r.twitch = 0.22; } if (s > -0.16) r.detFace = 'c_head_det'; }   // the long squint, the moustache going
    } else {
      if (!C.spun) {                                                                // WHIP
        C.spun = true; P.duck = false; r.spinToCape(); r.detFace = 'c_head_det';
        Sound.sfx('whoosh'); this.cameras.main.shake(90, 0.004);
        if (kind === 'jump') C.vh = 470; else if (kind === 'slow') { r.morph = 0.42; C.vh = 180; } else if (kind === 'top') { r.hatV += 14; C.vh = 0; } else C.vh = 140;
      }
      const spinT = kind === 'slow' ? 0.5 : 0.9, sp = Math.min(1, s / spinT);
      if (sp < 1) {                                                                 // round he goes with it (faster and faster, like the apron)
        const turns = kind === 'top' ? 9 : kind === 'jump' ? 5 : kind === 'slow' ? 2 : 4;
        P.facing = Math.cos(sp * sp * Math.PI * turns) >= 0 ? 1 : -1;
        if (kind === 'top') r.hatV += Math.sin(t * 30) * 2;
      } else P.facing = 1;
      if (C.vh || P.h > C.h0) { C.vh -= 1300 * dt; P.h += C.vh * dt; P.vh = C.vh; if (P.h <= C.h0) { P.h = C.h0; P.vh = 0; C.vh = 0; if (!C.landed && kind === 'jump') { C.landed = true; this.cameras.main.shake(160, 0.008); this.burst(P.theta, 3, 'crumb', 10, 0.9); Sound.sfx('clunk'); } } }
      if (sp >= 1 && !C.posed && P.h <= C.h0) {                                     // TA-DA: cape on, chest out
        C.posed = true;
        if (kind === 'top') { r.detFace = 'c_head_hurt'; C.dizzy = 0.45; } else { r.detFace = null; r.grinT = 1.6; }
        r.squash = 0.7; this.burst(P.theta, P.h + 46, 'spark', 10, 1.1); Sound.sfx('reveal');
        this.tweens.add({ targets: this.goCam, z: 1, duration: 520, ease: 'Cubic.easeInOut' });
      }
      if (C.dizzy > 0) { C.dizzy -= dt; P.facing = Math.sin(t * 26) > 0 ? 1 : -1; if (C.dizzy <= 0) { P.facing = 1; r.detFace = null; r.grinT = 1.4; } }
      if (C.posed && !C.go && this.goCam && this.goCam.z < 1.35) {                   // GO!
        C.go = true;
        const tx = this.add.text(this.W / 2, this.H * 0.36, CAPE_GO[Math.floor(Math.random() * CAPE_GO.length)], { fontFamily: PIXEL, fontSize: '30px', color: '#ffd23f', stroke: '#2a0606', strokeThickness: 8 }).setOrigin(0.5).setDepth(40).setScale(0.2);
        this.tweens.add({ targets: tx, scale: 1, duration: 220, ease: 'Back.easeOut' });
        this.tweens.add({ targets: tx, alpha: 0, scale: 1.5, delay: 750, duration: 300, onComplete: () => tx.destroy() });
        Sound.sfx('charged');
      }
    }
    // the camera: in tight on him, following his head as he hops
    const hx = P.spr ? P.spr.x : this.W / 2, hy = (P.spr ? P.spr.y : this.groundY) - 44 * this.zoom;
    if (this.goCam && !C.posed) { this.goCam.x = hx; this.goCam.y = hy; }
    else if (this.goCam) { const k = Math.max(0, (this.goCam.z - 1) / 1.5); this.goCam.x = this.W / 2 + (hx - this.W / 2) * k; this.goCam.y = this.H / 2 + (hy - this.H / 2) * k; }
    if (C.skip || t >= END) this.capeEnd();
  },
  capeEnd() {
    const C = this.cape, P = this.pl, r = this.rig; if (!C) return;
    this.cape = null; this.capeDone = true;
    this.tweens.killTweensOf(this.goCam); this.goCam = null;
    if (r.chef || r.morph >= 0) r.setChef(false);
    r.detFace = null; P.duck = false; P.facing = 1; P.h = C.h0; P.vh = 0;
    this.state = 'intro'; this.startGame();
  }
};
