// LEVEL 3: THE MEGA-MANDOLINE, a giant box grater with a laser eye and two robot arms.
//
// During the waves it LURKS high over the factory (a dark shape with a glowing red eye, arms hanging) and attacks
// from above: a laser PING (a thin red sight line locks on to a spot, then a short fat beam) or a slicer BLADE flung
// down at a red target ring (it sticks in the deck, sparking, then gets yanked back up).
//
// When the boss wave lands it comes down for real, in three acts:
//  1  pings, claw SLAMS (an arm reaches over a spot, opens, and smashes down) and floor-skimming slicer discs
//  2  (2/3 health) EYE SWEEP: the eye charges, a red strip shows the path, then the beam burns along the floor from one
//     side to the other. Only where it meets the deck hurts: jump over the burning point as it runs under you.
//  3  (1/3 health) cracked and sparking: sweeps go there AND back, pings come in threes, both arms slam in turn.
//
// Mixed into Level1 (see main.js). Everything lives in this.mando.
const MANDO = {
  eye: [0, -24],                 // the eye, in texture pixels from the sprite centre (y down)
  slot: [0, -4],                 // the slicer slot
  shoulder: [52, -2],            // right shoulder (left is mirrored)
  arm: 82,                       // length of each arm segment, world units (times the body's scale)
  lurkH: 250                     // how high it hangs during the waves
};

const MandolineMixin = {
  // a point on the body (texture pixels from the centre, y down) in world terms, following the sprite's tilt
  mPt(o, ox, oy) {
    const k = o.spr.bsx || 1, x = ox * k, y = -oy * k;
    const rot = o.spr.rotation - angDiff(o.theta, this.viewT());
    const rx = x * Math.cos(rot) + y * Math.sin(rot), ry = -x * Math.sin(rot) + y * Math.cos(rot);
    return { theta: wrap(o.theta + rx / (R + o.h)), h: o.h + ry };
  },

  mScreen(o, [ox, oy]) { const w = this.mPt(o, ox, oy); return this.screenPos(w.theta, w.h); },

  mandoInit() {
    const M = this.mando = { beams: [], blades: [], scorch: [], lurker: null, t: 4, n: 0 };
    M.g = this.add.graphics().setDepth(7.6);                                   // beams, target rings, scorch
    M.glow = this.add.graphics().setDepth(7.62).setBlendMode(Phaser.BlendModes.ADD);
    M.armG = this.add.graphics().setDepth(5.95);                               // boss arms (behind its body)
    M.lurkArmG = this.add.graphics().setDepth(0.94);
    const spr = this.add.image(0, 0, 'mandoline').setDepth(0.95).setTint(0x6a7898).setAlpha(0.95);
    spr.bsx = spr.bsy = 0.85;
    M.lurker = { theta: wrap(this.pl.theta + 0.35), h: MANDO.lurkH, spr, arms: this.mandoArms(), gone: false };
    return M;
  },
  mandoArms() { return [-1, 1].map(side => ({ side, st: 'rest', t: 0, cur: null, goal: null, open: 0.35 })); },

  // ---- per frame (play state)
  updateMando(dt) {
    const M = this.mando || this.mandoInit(), P = this.pl;
    const boss = this.enemies.find(e => e.type === 'boss' && e.ai === 'mandoline');
    const L = M.lurker;
    // the lurker: drifts after Chris high up, bobbing. Gone once the real boss arrives.
    if (L && !L.gone) {
      if (boss || this.bossDown) {
        L.gone = true; this.tweens.add({ targets: L.spr, alpha: 0, duration: 400, onComplete: () => L.spr.destroy() });
      } else {
        const want = wrap(P.theta + Math.sin(this.t * 0.4) * 0.35);
        L.theta = wrap(L.theta + Math.max(-0.25, Math.min(0.25, angDiff(want, L.theta) * 0.8)) * dt);
        L.h = MANDO.lurkH + Math.sin(this.t * 1.1) * 14;
        this.updateArms(L, dt);
        M.t -= dt;
        if (M.t <= 0 && !M.beams.some(b => b.src === L)) {
          M.t = rnd(3.2, 5);
          if (M.n++ % 2 === 0) this.mandoPing(L, wrap(P.theta + (P.vx || 0) / R * 0.5), 0.75);
          else this.mandoBlade(L);
        }
      }
    }
    this.updateBeams(dt, boss);
    this.updateBlades(dt);
    for (let i = M.scorch.length - 1; i >= 0; i--) { M.scorch[i].life -= dt; if (M.scorch[i].life <= 0) M.scorch.splice(i, 1); }
  },

  // ---- the eye laser
  // ping: a sight line locks on to one spot, then a short fat beam (dodge by moving off the spot)
  mandoPing(src, theta, warn) {
    this.mando.beams.push({ src, kind: 'ping', from: theta, to: theta, at: theta, t: 0, warn: warn || 0.6, dur: 0.22 });
    Sound.sfx('alarm');
  },
  // sweep: the eye charges, then the beam's burning point runs along the floor from one side to the other (and back, in act 3)
  mandoSweep(src, back) {
    const P = this.pl, d = Math.random() < 0.5 ? -1 : 1, span = 0.55;
    this.mando.beams.push({ src, kind: 'sweep', from: wrap(P.theta - d * span), to: wrap(P.theta + d * span), at: wrap(P.theta - d * span), t: 0, warn: 0.95, dur: back ? 1.25 : 1.5, back });
    Sound.sfx('alarm'); Sound.sfx('charge');
  },
  beamLive(B) { return B.t > B.warn && B.t < B.warn + B.dur * (B.back ? 2 : 1); },
  updateBeams(dt, boss) {
    const M = this.mando, P = this.pl, ph = P.h + (P.duck ? 10 : 22);
    for (let i = M.beams.length - 1; i >= 0; i--) {
      const B = M.beams[i];
      const srcGone = B.src !== M.lurker ? !(boss && B.src === boss && boss.hp > 0) : M.lurker.gone;
      if (srcGone) { M.beams.splice(i, 1); continue; }
      B.t += dt;
      const total = B.dur * (B.back ? 2 : 1);
      if (B.t > B.warn + total + 0.15) { M.beams.splice(i, 1); continue; }
      if (B.kind === 'ping' && B.t < B.warn * 0.55) B.from = B.to = B.at = wrap(B.at + angDiff(P.theta, B.at) * Math.min(1, dt * 3));   // tracks Chris, then locks
      let u = Math.max(0, Math.min(1, (B.t - B.warn) / B.dur));
      if (B.back && B.t - B.warn > B.dur) u = Math.max(0, 1 - (B.t - B.warn - B.dur) / B.dur);
      if (B.kind === 'sweep') B.at = wrap(B.from + angDiff(B.to, B.from) * u);
      if (!this.beamLive(B)) continue;
      if (!B.zap) { B.zap = true; Sound.sfx('beam'); this.cameras.main.shake(B.kind === 'ping' ? 120 : 220, 0.006); buzz(30); }
      // the burning point on the deck: sparks and a scorch trail
      B.sparkT = (B.sparkT || 0) - dt;
      if (B.sparkT <= 0) { B.sparkT = 0.04; this.burst(B.at, 3, 'spark', 2, 0.9); if (Math.random() < 0.6) M.scorch.push({ theta: B.at, life: 1.4, max: 1.4 }); }
      // does it touch Chris? A ping is the whole beam; a sweep only burns where it meets the deck (jump it)
      const eye = this.mPt(B.src, MANDO.eye[0], MANDO.eye[1]);
      const ex = angDiff(eye.theta, P.theta) * (R + eye.h * 0.5), gx = angDiff(B.at, P.theta) * R;
      const dx = gx - ex, dy = -eye.h, len2 = dx * dx + dy * dy || 1;
      const s = Math.max(0, Math.min(1, ((0 - ex) * dx + (ph - eye.h) * dy) / len2));
      const qx = ex + dx * s, qy = eye.h + dy * s;
      const near = Math.hypot(qx, qy - ph) < (B.kind === 'ping' ? 16 : 15) && (B.kind === 'ping' || qy < 52);
      if (near && P.invuln <= 0) this.hurt();
    }
  },

  // ---- slicer blades flung down from the lurker's slot
  mandoBlade(src) {
    const P = this.pl, s = this.mPt(src, MANDO.slot[0], MANDO.slot[1]);
    const spr = this.add.image(0, 0, 'mblade').setDepth(4).setOrigin(0.5, 0.9).setVisible(false); spr.bsx = spr.bsy = 1.4;
    this.mando.blades.push({ st: 'warn', t: 0.9, theta: wrap(P.theta + (P.vx || 0) / R * 0.7 + rnd(-0.08, 0.08)), sTh: s.theta, sH: s.h, h: s.h, u: 0, spr });
    Sound.sfx('alarm');
  },
  updateBlades(dt) {
    const M = this.mando, P = this.pl;
    for (let i = M.blades.length - 1; i >= 0; i--) {
      const B = M.blades[i];
      if (B.st === 'warn') { B.t -= dt; if (B.t <= 0) { B.st = 'fall'; B.u = 0; B.spr.setVisible(true); Sound.sfx('whoosh'); } }
      else if (B.st === 'fall') {
        B.u = Math.min(1, B.u + dt * 1.9); const e = B.u * B.u;
        B.curTh = wrap(B.sTh + angDiff(B.theta, B.sTh) * e); B.h = B.sH * (1 - e);
        if (B.u >= 1) {
          B.st = 'stuck'; B.t = 0.75; B.h = 0; this.cameras.main.shake(160, 0.009); Sound.sfx('clang'); buzz(30);
          this.burst(B.theta, 4, 'spark', 14, 1.2); this.bang(B.theta, 8, 20);
          if (Math.abs(angDiff(P.theta, B.theta)) * R < 26 && P.h < 50 && P.invuln <= 0) { this.hurt(); P.vh = 300; }
          for (const e2 of this.enemies) if (e2.type !== 'boss' && e2.h < 40 && Math.abs(angDiff(e2.theta, B.theta)) * R < 24) e2.hp = 0;   // slices rats too
        }
      } else if (B.st === 'stuck') {
        B.t -= dt; B.curTh = B.theta;
        if (Math.random() < dt * 14) this.burst(B.theta, 6, 'spark', 1, 0.5);
        if (Math.abs(angDiff(P.theta, B.theta)) * R < 14 && P.h < 34 && P.invuln <= 0) this.hurt();
        if (B.t <= 0) { B.st = 'up'; B.vh = 200; Sound.sfx('zing'); }
      } else {
        B.vh += 1600 * dt; B.h += B.vh * dt;
        if (B.h > 520) { B.spr.destroy(); M.blades.splice(i, 1); continue; }
      }
      if (B.st !== 'warn') this.place(B.spr, B.curTh, B.h, B.st === 'fall' ? Math.sin(B.u * 20) * 0.25 : 0);
    }
  },

  // ---- the arms: shoulder -> elbow -> claw, solved on screen. Each arm eases its claw toward a goal in world terms.
  armRest(o, A) {
    const sh = this.mPt(o, A.side * MANDO.shoulder[0], MANDO.shoulder[1]), k = o.spr.bsx || 1;
    const sway = Math.sin(this.t * 1.6 + A.side) * 10;
    return { theta: wrap(sh.theta + A.side * (62 + sway) * k / (R + sh.h)), h: sh.h - (78 - sway * 0.5) * k };
  },
  updateArms(o, dt) {
    for (const A of o.arms) {
      const rest = this.armRest(o, A);
      if (!A.cur) A.cur = { theta: rest.theta, h: rest.h };
      let goal = rest, sp = 4;
      if (A.st === 'reach') { A.t -= dt; goal = { theta: A.tTh, h: 70 }; sp = 6; A.open += (1 - A.open) * dt * 6; if (A.t <= 0) { A.st = 'slam'; A.t = 0.14; Sound.sfx('whoosh'); } }
      else if (A.st === 'slam') {
        A.t -= dt; goal = { theta: A.tTh, h: 0 }; sp = 30;
        if (A.t <= 0) {
          A.st = 'hold'; A.t = 0.45; A.open = 0.15; A.cur = { theta: A.tTh, h: 0 };
          const P = this.pl, reached = A.reach !== false;
          if (reached) {
            this.cameras.main.shake(220, 0.012); Sound.sfx('clunk'); Sound.sfx('clang'); buzz([40, 20, 60]);
            this.burst(A.tTh, 4, 'spark', 16, 1.3); this.bang(A.tTh, 6, 26);
            if (Math.abs(angDiff(P.theta, A.tTh)) * R < 34 && P.h < 48 && P.invuln <= 0) { this.hurt(); P.vh = 320; }
            for (const e2 of this.enemies) if (e2.type !== 'boss' && e2.h < 40 && Math.abs(angDiff(e2.theta, A.tTh)) * R < 30) e2.hp = 0;
          }
        }
      } else if (A.st === 'hold') { A.t -= dt; goal = { theta: A.tTh, h: 0 }; sp = 30; if (A.t <= 0) { A.st = 'back'; A.t = 0.5; } }
      else if (A.st === 'back') { A.t -= dt; sp = 5; A.open += (0.35 - A.open) * dt * 4; if (A.t <= 0) A.st = 'rest'; }
      else A.open = 0.3 + 0.1 * Math.sin(this.t * 3 + A.side);
      const f = Math.min(1, dt * sp);
      A.cur.theta = wrap(A.cur.theta + angDiff(goal.theta, A.cur.theta) * f); A.cur.h += (goal.h - A.cur.h) * f;
    }
  },
  // start a claw slam on a spot (the arm on that side of the body does it)
  mandoSlam(o, theta, side) {
    const A = o.arms.find(a => a.side === (side || (angDiff(theta, o.theta) >= 0 ? 1 : -1)));
    if (!A || A.st !== 'rest') return false;
    A.st = 'reach'; A.t = 0.75; A.tTh = theta; A.reach = true; Sound.sfx('grind');
    return true;
  },
  armsBusy(o) { return o.arms.some(a => a.st !== 'rest'); },

  // ---- the boss itself (called from updateEnemies, after the shared drifting)
  mandoAI(e, dt, P, dirP) {
    if (!this.mando) this.mandoInit();
    if (!e.arms) { e.arms = this.mandoArms(); e.stage = 1; e.mh = e.h; }
    this.mandoStage(e, P);
    const st = e.stage, beam = this.mando.beams.find(b => b.src === e);
    // height: dips to reach with a claw, rises to sweep with the eye
    let wantH = 205 + Math.sin(e.t * 1.3) * 20;             // hangs a bit higher than the other bosses: it's tall
    if (beam && beam.kind === 'sweep') { wantH = 222; if (e.lockTh === undefined) e.lockTh = e.theta; e.theta = e.lockTh; }
    else { e.lockTh = undefined; if (this.armsBusy(e)) wantH = 140; }
    e.mh += (wantH - e.mh) * Math.min(1, dt * 3); e.h = e.mh;
    this.updateArms(e, dt);
    // arms: is the spot in reach? (if not, the slam stops short in the air: no hit)
    for (const A of e.arms) if (A.st === 'reach' || A.st === 'slam') {
      const sh = this.mPt(e, A.side * MANDO.shoulder[0], MANDO.shoulder[1]), k = e.spr.bsx || 1;
      A.reach = Math.hypot(angDiff(A.tTh, sh.theta) * (R + sh.h * 0.5), sh.h) < MANDO.arm * 2 * k * 0.98;
    }
    e.pingCd = (e.pingCd === undefined ? 1.5 : e.pingCd) - dt;
    e.slamCd = (e.slamCd === undefined ? 3 : e.slamCd) - dt;
    e.sweepCd = (e.sweepCd === undefined ? 2.5 : e.sweepCd) - dt;
    if (!beam) {
      if (st >= 2 && e.sweepCd <= 0 && !this.armsBusy(e)) { e.sweepCd = st >= 3 ? 5.2 : 5.8; e.pingCd = Math.max(e.pingCd, 1.2); this.mandoSweep(e, st >= 3); }
      else if (e.pingCd <= 0) {
        e.pingCd = st >= 3 ? 2.8 : st >= 2 ? 2.3 : 2.6;
        const n = st >= 3 ? 3 : 1;
        for (let i = 0; i < n; i++) this.time.delayedCall(i * 380, () => { if (e.hp > 0 && this.state === 'play') this.mandoPing(e, wrap(this.pl.theta + (this.pl.vx || 0) / R * 0.4), 0.55); });
      }
    }
    if (e.slamCd <= 0 && !(beam && beam.kind === 'sweep')) {
      e.slamCd = st >= 3 ? 3.4 : st >= 2 ? 4 : 4.8;
      const side = angDiff(P.theta, e.theta) >= 0 ? 1 : -1;
      if (this.mandoSlam(e, P.theta, side) && st >= 3) this.time.delayedCall(650, () => { if (e.hp > 0 && this.state === 'play') this.mandoSlam(e, wrap(this.pl.theta + (this.pl.vx || 0) / R * 0.3), -side); });
    }
    if (e.rainCd <= 0) {          // a slicing disc skimming the floor: jump it
      e.rainCd = st >= 3 ? 2.4 : 3.4;
      for (const hh of (st >= 3 ? [14, 90] : [14])) this.addEBullet('blade', e.theta, hh, dirP * 270, 0, 11, 3);
      Sound.sfx('zing');
    }
    if (e.sumCd <= 0 && this.enemies.length < 3) { e.sumCd = st >= 2 ? 9 : 12; this.spawnEnemy('drone'); }
    this.drawBossCracks(e, st, [[[-30, -46], [-20, -36], [-26, -24], [-16, -14]], [[28, 10], [36, 22], [30, 34]], [[-8, 30], [2, 40], [-4, 52]]]
      .concat(st >= 3 ? [[[-48, 20], [-38, 30], [-44, 46]], [[40, -40], [48, -28], [42, -16]], [[10, -50], [16, -40], [8, -32]]] : []),
      (ox, oy) => this.mPt(e, ox, oy), [0xff5a2a, 0xffd23f]);
    if (st >= 3 && Math.random() < dt * 8) { const q = this.mPt(e, rnd(-40, 40), rnd(-40, 50)); this.burst(q.theta, q.h, 'spark', 1, 0.6); }
  },
  mandoStage(e, P) {
    const f = e.hp / e.maxHp, want = f > 0.66 ? 1 : f > 0.33 ? 2 : 3;
    if (want <= e.stage || e.hp <= 0) return;
    e.stage = want; e.sweepCd = 1.6; e.slamCd = Math.max(e.slamCd || 0, 2.5);
    this.mando.beams = this.mando.beams.filter(b => b.src !== e);
    e.baseTint = want === 2 ? 0xffd8d0 : 0xffa898; e.spr.setTint(e.baseTint);
    Sound.sfx('growl'); Sound.sfx('crash'); buzz([80, 40, 160]);
    this.cameras.main.shake(500, 0.016); this.camPunch(0.05); this.hitStop = Math.max(this.hitStop || 0, 0.12);
    this.burst(e.theta, e.h, 'spark', 30, 1.6); this.bang(e.theta, e.h, 30);
    this.banner(want === 2 ? 'ITS EYE IS CHARGING!\nJUMP THE LASER WHERE IT HITS!' : 'IT\'S SHREDDING ITSELF APART!\nTHE BEAM COMES BACK!');
    if (want === 2 && !e.healed) {
      e.healed = true;
      this.pickups.push({ kind: 'heal', theta: wrap(P.theta + 0.12), h: 320, vh: 0, life: 14, spr: this.add.image(0, 0, 'wedge').setDepth(6) });
    }
  },

  // ---- drawing (every frame, after the world is placed)
  drawMando() {
    const M = this.mando; if (!M) return;
    const g = M.g, gl = M.glow, z = this.zoom; g.clear(); gl.clear(); M.armG.clear(); M.lurkArmG.clear();
    const boss = this.enemies.find(e => e.type === 'boss' && e.ai === 'mandoline' && e.hp > 0);
    const L = M.lurker;
    if (L && !L.gone && L.spr.active) {
      this.place(L.spr, L.theta, L.h, Math.sin(this.t * 0.9) * 0.06);
      this.drawArms(M.lurkArmG, L, true);
      const eye = this.mScreen(L, MANDO.eye);
      gl.fillStyle(0xff2020, 0.18 + 0.1 * Math.sin(this.t * 5)).fillCircle(eye.x, eye.y, 16 * z);
      gl.fillStyle(0xff6060, 0.5).fillCircle(eye.x, eye.y, 5 * z);
    }
    if (boss && boss.arms) {
      this.drawArms(M.armG, boss, false);
      const eye = this.mScreen(boss, MANDO.eye);
      gl.fillStyle(0xff2020, 0.15 + 0.08 * Math.sin(this.t * 6)).fillCircle(eye.x, eye.y, 22 * z);
    }
    // scorch marks burning on the deck
    for (const S of M.scorch) { const q = this.screenPos(S.theta, 1); if (!q.vis) continue; const k = S.life / S.max; g.fillStyle(0x1a0a08, 0.5 * k).fillEllipse(q.x, q.y, 16 * z, 5 * z); gl.fillStyle(0xff6a1a, 0.5 * k * k).fillEllipse(q.x, q.y, 12 * z, 4 * z); }
    // beams
    for (const B of M.beams) {
      const eyeW = this.mPt(B.src, MANDO.eye[0], MANDO.eye[1]), e0 = this.screenPos(eyeW.theta, eyeW.h);
      const live = this.beamLive(B), charge = Math.min(1, B.t / B.warn);
      if (!live && B.t <= B.warn) {
        // the tell: the eye swells, a flickering sight line, and (for a sweep) the red strip it's about to burn along
        gl.fillStyle(0xff2020, 0.25 + 0.4 * charge).fillCircle(e0.x, e0.y, (8 + 18 * charge) * z);
        const q = this.screenPos(B.from, 2), fl = 0.35 + 0.45 * Math.abs(Math.sin(B.t * 26));
        g.lineStyle(1.5 * z, 0xff3030, fl).lineBetween(e0.x, e0.y, q.x, q.y);
        g.lineStyle(2.5 * z, 0xff3030, 0.5 + 0.4 * fl).strokeEllipse(q.x, q.y, 26 * z, 8 * z);
        if (B.kind === 'sweep') {
          const n = 16, dA = angDiff(B.to, B.from);
          for (let i = 0; i < n; i++) { if ((i + Math.floor(B.t * 12)) % 2) continue; const a = this.screenPos(wrap(B.from + dA * i / n), 1), b = this.screenPos(wrap(B.from + dA * (i + 1) / n), 1); g.lineStyle(7 * z, 0xff3030, 0.45 + 0.45 * charge).lineBetween(a.x, a.y, b.x, b.y); gl.lineStyle(12 * z, 0xff2020, 0.15 + 0.2 * charge).lineBetween(a.x, a.y, b.x, b.y); }
          const end = this.screenPos(B.to, 2); g.fillStyle(0xff3030, 0.9).fillTriangle(end.x - 8 * z, end.y - 12 * z, end.x + 8 * z, end.y - 12 * z, end.x, end.y);
        }
        continue;
      }
      if (!live) continue;
      const q = this.screenPos(B.at, 0), w = B.kind === 'ping' ? 1.25 : 1;
      g.lineStyle(18 * z * w, 0xff1010, 0.28).lineBetween(e0.x, e0.y, q.x, q.y);
      g.lineStyle(8 * z * w, 0xff4a4a, 0.9).lineBetween(e0.x, e0.y, q.x, q.y);
      g.lineStyle(3 * z * w, 0xffffff, 1).lineBetween(e0.x, e0.y, q.x, q.y);
      gl.fillStyle(0xff3020, 0.55).fillCircle(e0.x, e0.y, 20 * z); gl.fillStyle(0xffffff, 0.8).fillCircle(e0.x, e0.y, 7 * z);
      gl.fillStyle(0xff6a1a, 0.5).fillCircle(q.x, q.y, (16 + 4 * Math.sin(this.t * 40)) * z); gl.fillStyle(0xffffff, 0.9).fillCircle(q.x, q.y, 6 * z);
    }
    // blade target rings
    for (const B of M.blades) if (B.st === 'warn' || B.st === 'fall') {
      const s0 = this.screenPos(B.theta, 2); if (!s0.vis) continue;
      const k = B.st === 'warn' ? 1 - B.t / 0.9 : 1, pulse = 0.5 + 0.5 * Math.sin(this.t * 18);
      g.lineStyle(3 * z, 0xff3030, 0.6 + 0.4 * pulse).strokeEllipse(s0.x, s0.y, (40 - 16 * k) * z, (12 - 4 * k) * z);
      g.fillStyle(0x000000, 0.2 + 0.3 * k).fillEllipse(s0.x, s0.y, 30 * z, 8 * z);
    }
  },
  drawArms(g, o, dim) {
    const z = this.zoom * (o.spr.bsx || 1), k = o.spr.bsx || 1, Lz = MANDO.arm * k * this.zoom;
    const steel = dim ? [0x14182a, 0x3a4462, 0x55607e] : [0x1a1020, 0x9aa4b4, 0xdfe6f0], al = dim ? o.spr.alpha : 1;
    for (const A of o.arms) {
      if (!A.cur) continue;
      const shW = this.mPt(o, A.side * MANDO.shoulder[0], MANDO.shoulder[1]), S = this.screenPos(shW.theta, shW.h);
      let T = this.screenPos(A.cur.theta, A.cur.h);
      if (!S.vis) continue;
      let dx = T.x - S.x, dy = T.y - S.y, d = Math.hypot(dx, dy) || 1;
      const max = Lz * 2 * 0.98; if (d > max) { T = { x: S.x + dx / d * max, y: S.y + dy / d * max }; dx = T.x - S.x; dy = T.y - S.y; d = max; }
      const hgt = Math.sqrt(Math.max(0, Lz * Lz - (d / 2) * (d / 2)));
      let px = -dy / d, py = dx / d;
      if (px * A.side + (-py) * 0.6 < 0) { px = -px; py = -py; }
      const E = { x: (S.x + T.x) / 2 + px * hgt, y: (S.y + T.y) / 2 + py * hgt };
      // hoses: a red and a blue wire drooping from shoulder to elbow
      for (const [c, off] of [[0xe03030, 3], [0x3a8aff, -3]]) {
        const mx = (S.x + E.x) / 2 + off * z, my = (S.y + E.y) / 2 + 9 * z;
        g.lineStyle(1.6 * z, dim ? 0x2a3048 : c, al).beginPath(); g.moveTo(S.x, S.y);
        for (let i = 1; i <= 8; i++) { const u = i / 8, iu = 1 - u; g.lineTo(iu * iu * S.x + 2 * iu * u * mx + u * u * E.x, iu * iu * S.y + 2 * iu * u * my + u * u * E.y); }
        g.strokePath();
      }
      for (const [P0, P1, w] of [[S, E, 9], [E, T, 7]]) {
        g.lineStyle((w + 3) * z, steel[0], al).lineBetween(P0.x, P0.y, P1.x, P1.y);
        g.lineStyle(w * z, steel[1], al).lineBetween(P0.x, P0.y, P1.x, P1.y);
        g.lineStyle(2 * z, steel[2], al).lineBetween(P0.x - 1.5 * z, P0.y - 1.5 * z, P1.x - 1.5 * z, P1.y - 1.5 * z);
      }
      // piston along the upper arm
      const pa = { x: S.x + (E.x - S.x) * 0.2 + px * 5 * z, y: S.y + (E.y - S.y) * 0.2 + py * 5 * z }, pb = { x: S.x + (E.x - S.x) * 0.75 + px * 5 * z, y: S.y + (E.y - S.y) * 0.75 + py * 5 * z };
      g.lineStyle(4 * z, steel[0], al).lineBetween(pa.x, pa.y, pb.x, pb.y); g.lineStyle(2 * z, dim ? steel[2] : 0xffd23f, al).lineBetween(pa.x, pa.y, pb.x, pb.y);
      for (const [J, r] of [[S, 7], [E, 6]]) { g.fillStyle(steel[0], al).fillCircle(J.x, J.y, (r + 1.5) * z); g.fillStyle(steel[1], al).fillCircle(J.x, J.y, r * z); g.fillStyle(steel[0], al).fillCircle(J.x, J.y, 2 * z); }
      // the claw: a palm and two hooked pincers, opening as it lines up a slam
      const ang = Math.atan2(T.y - E.y, T.x - E.x), op = A.open * 0.9;
      g.fillStyle(steel[0], al).fillCircle(T.x, T.y, 8 * z); g.fillStyle(steel[1], al).fillCircle(T.x, T.y, 6 * z);
      for (const s of [-1, 1]) {
        const a1 = ang + s * (0.25 + op), f1 = { x: T.x + Math.cos(a1) * 14 * z, y: T.y + Math.sin(a1) * 14 * z };
        const a2 = ang - s * 0.7, f2 = { x: f1.x + Math.cos(a2) * 9 * z, y: f1.y + Math.sin(a2) * 9 * z };
        g.lineStyle(6 * z, steel[0], al).lineBetween(T.x, T.y, f1.x, f1.y).lineBetween(f1.x, f1.y, f2.x, f2.y);
        g.lineStyle(3.5 * z, steel[1], al).lineBetween(T.x, T.y, f1.x, f1.y).lineBetween(f1.x, f1.y, f2.x, f2.y);
      }
      // a target ring under a claw that's lining up
      if (!dim && A.st === 'reach') { const q = this.screenPos(A.tTh, 2), pu = 0.5 + 0.5 * Math.sin(this.t * 20); this.mando.g.lineStyle(3 * this.zoom, 0xff3030, 0.5 + 0.5 * pu).strokeEllipse(q.x, q.y, 50 * this.zoom, 14 * this.zoom); }
    }
  }
};
