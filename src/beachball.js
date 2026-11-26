// ================================================================= THE BEACH BALL (v3.32): a toy for Moon Camp
// A big stripy beach ball that can't be popped. Shoot it, bash it, uppercut it, spike it, bounce on it, or just walk it
// along. It bounces off the moon (and the ledges) with a squash and a spin, and Biscuit chases it about and headbutts it
// back to you - which keeps him out from under Chris's feet.
const BALL = { r: 22, grav: 620, bounce: 0.8, roll: 0.55, maxH: 520 };

function makeBallTexture(scene) {
  if (scene.textures.exists('cr_ball')) return;
  const COLS = [0xff4a4a, 0xffd23f, 0x3aa8ff, 0xffffff, 0x4ad86a, 0xff8a2a];
  const shadeC = (c, k) => { const r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255, f = v => Math.max(0, Math.min(255, Math.round(v * k))); return (f(r) << 16) | (f(g) << 8) | f(b); };
  pixSprite(scene, 'cr_ball', 24, 24, a => {
    const cx = 11.5, cy = 11.5, rr = 11.5;
    for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
      const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy);
      if (d > rr) continue;
      if (d > rr - 1.2) { a.px(x, y, 0x2a1a30); continue; }                                   // dark outline
      // the panels: wedges round a white cap, curved as if wrapping round the ball
      const pole = { x: cx - 3, y: cy - 4 }, pd = Math.hypot(x - pole.x, y - pole.y);
      let c;
      if (pd < 2.6) c = 0xffffff;
      else { const ang = Math.atan2(y - pole.y, x - pole.x) + pd * 0.06; c = COLS[((Math.floor((ang + Math.PI) / (Math.PI * 2) * 6) % 6) + 6) % 6]; }
      const lit = 1.12 - 0.42 * Math.max(0, (dx * 0.6 + dy * 0.8) / rr);                         // lit from the top-left
      c = shadeC(c, lit);
      if (Math.hypot(x - (cx - 5), y - (cy - 5)) < 1.6) c = 0xffffff;                            // the shine
      a.px(x, y, c);
    }
  });
}

const BallMixin = {
  ballInit() {
    if (this.toyOpen && !this.toyOpen('hoop')) { this.ball = null; return; }   // (v3.132) Zib's toy
    makeBallTexture(this);
    const spr = this.add.image(0, 0, 'cr_ball').setOrigin(0.5, 0.5).setDepth(5.5);
    spr.bsx = spr.bsy = BALL.r * 2 / 24;
    const B = { spr, theta: wrap(this.pl.theta + 0.32), h: BALL.r, vt: 0, vh: 0, rot: 0, spin: 0, hitCd: 0, sq: 0 };
    this.actors.push(B); this.ball = B;
  },
  // give it a smack: dv in px/s (dt = along the ground, dh = up)
  ballKick(dt, dh, who) {
    const B = this.ball; if (!B) return;
    B.vt += dt; B.vh = Math.max(B.vh, 0) * 0.3 + dh; B.sq = 1; B.spin += dt * 0.02;
    if (B.h <= this.ballFloor() + BALL.r + 1 && B.vh < 120) B.vh = 120;
    const s = Math.min(1, Math.hypot(dt, dh) / 700);
    Sound.sfx(who === 'shot' ? 'tink' : 'bonk'); if (who !== 'shot') buzz(12);
    this.burst(B.theta, B.h, 'spark', who === 'shot' ? 2 : 5 + Math.round(6 * s), 0.6);
    if (who !== 'shot' && who !== 'dog') { this.camPunch && this.camPunch(0.02 + 0.03 * s); this.hitStop = Math.max(this.hitStop || 0, 0.04); }
  },
  ballFloor() { const B = this.ball; return this.floorAt ? this.floorAt(B.theta, B.h - BALL.r) : 0; },
  // a shot hitting it? (called for each player bullet in flight)
  ballShot(b) {
    const B = this.ball; if (!B || b.ballHit) return false;
    const rr = BALL.r + 8;
    if (dist2(b.theta, b.h, B.theta, B.h) > rr * rr) return false;
    b.ballHit = true;
    const sgn = Math.sign(b.vt || angDiff(B.theta, b.theta) || 1);
    this.ballKick(sgn * (120 + Math.min(260, Math.abs(b.vt) * 0.18)) * (b.blast ? 2 : 1), 110 + Math.max(0, (b.vh || 0) * 0.25) + (b.blast ? 200 : 0), 'shot');
    return !b.plough;
  },
  // the gun-butt: bash, uppercut, or a spike from above
  ballBash(dir, cy) {
    const B = this.ball, P = this.pl; if (!B) return false;
    const a = angDiff(B.theta, P.theta) * dir;
    if (a < -20 / R || a > (CFG.bashRange + BALL.r) / R) return false;
    if (Math.abs(B.h - cy) > BALL.r + 70) return false;
    if (P.upper) this.ballKick(dir * 140 - B.vt * 0.5, 820, 'upper');                       // UPPERCUT: straight up into the sky
    else if (P.spikeArm) { B.vh = Math.min(B.vh, 0); this.ballKick(dir * 380 - B.vt * 0.5, -700, 'spike'); }   // SPIKE: hammered down to bounce sky-high
    else this.ballKick(dir * 560 - B.vt * 0.6, 340, 'bash');                                // a big belt along the ground
    if (this.popup && Math.random() < 0.35) this.popup(B.theta, B.h + 30, ['BOINK!', 'WHEE!', 'FORE!', 'BOING!'][Math.floor(Math.random() * 4)], '#ffd23f');
    return true;
  },
  ballUpdate(dt) {
    const B = this.ball; if (!B) return;
    const P = this.pl, r = BALL.r;
    B.hitCd = Math.max(0, B.hitCd - dt);
    B.vh -= BALL.grav * dt;
    B.h += B.vh * dt; B.theta = wrap(B.theta + B.vt / (R + B.h) * dt);
    const fl = this.ballFloor();
    if (B.h > BALL.maxH) { B.h = BALL.maxH; B.vh = -Math.abs(B.vh) * 0.5; }
    if (B.h - r <= fl) {                                                                        // landed: bounce
      B.h = fl + r;
      if (B.vh < -70) { B.sq = Math.min(1, -B.vh / 600); B.vh = -B.vh * BALL.bounce; B.vt *= 0.93; if (B.sq > 0.25) { Sound.sfx('bonk'); this.burst(B.theta, fl + 2, 'puff', 3, 0.5); } }
      else { B.vh = 0; B.vt *= Math.max(0, 1 - BALL.roll * dt); if (Math.abs(B.vt) < 4) B.vt = 0; }   // rolling to a stop
    }
    // Chris: walk into it to dribble it along, land on it to bounce
    const gap = angDiff(B.theta, P.theta) * (R + B.h), top = P.h + 64;
    if (Math.abs(gap) < r + 14 && P.h < B.h + r && top > B.h - r) {
      if (P.h > B.h + r * 0.35 && P.vh < 0) {                                                   // bounced on it
        P.vh = 560; B.vh = Math.min(B.vh, -260); B.vt += (P.vx || 0) * 0.3; B.sq = 1; Sound.sfx('bonk'); buzz(15);
        if (this.popup) this.popup(B.theta, B.h + r + 20, 'BOING!', '#ffd23f');
      } else {
        const side = Math.sign(gap) || 1, push = Math.abs(P.vx || 0) + 70;
        if (side * B.vt < push) B.vt = side * push;
        B.theta = wrap(P.theta + side * (r + 14) / (R + B.h));
        if (B.hitCd <= 0 && Math.abs(P.vx || 0) > 120) { B.hitCd = 0.25; B.vh = Math.max(B.vh, 90); B.sq = 0.4; }
      }
    }
    // squash on landing, spin as it rolls
    B.sq = Math.max(0, B.sq - dt * 5);
    B.spin += (B.vt / r) * dt * (B.h - r <= fl + 1 ? 1 : 0.6);
    B.rot = B.spin;
    const q = B.sq * Math.cos(B.sq * 8);
    B.spr.sqx = 1 + 0.22 * q; B.spr.sqy = 1 - 0.22 * q;
  },
  // Biscuit and the ball: chases it about and headbutts it on (returns a target theta for him, or null)
  ballDogTarget(F) {
    const B = this.ball; if (!B) return null;
    const A = F.a, d = angDiff(B.theta, A.theta);
    if (Math.abs(d) > 1.3) return null;
    if (Math.abs(B.vt) < 25 && B.h <= this.ballFloor() + BALL.r + 2 && !(F.chaseT > 0)) return null;   // only a MOVING ball is worth chasing
    if (Math.abs(B.vt) >= 25 || B.h > this.ballFloor() + BALL.r + 2) F.chaseT = 1.2;              // (keeps at it a moment after it stops)
    F.chaseT = Math.max(0, (F.chaseT || 0) - (this.lastDt || 0.016));
    const side = Math.sign(angDiff(B.theta, this.pl.theta)) || 1;                               // nose it away from Chris, round the back of the ball
    if (Math.abs(d) * R < BALL.r + 12 && B.h < BALL.r + 30 && !(F.butt > 0)) {
      F.butt = rnd(0.8, 1.6); F.vh = 200;
      this.ballKick(side * rnd(180, 300), rnd(220, 380), 'dog');
    }
    F.butt = Math.max(0, (F.butt || 0) - (this.lastDt || 0.016));
    return wrap(B.theta - side * (BALL.r + 10) / R);
  }
};
