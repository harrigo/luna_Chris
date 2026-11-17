// ================================================================= CAMP TOYS (v3.42)
// More things to muck about with at Moon Camp, each one quietly training a move:
//   HIGH STRIKER  (-0.7)  a fairground strength tester. Bash the pad and the puck flies up the tower: a plain bash gets
//                         about halfway, an UPPERCUT more, a SPIKE from high up more again, and anything in CHEESE TIME
//                         hits harder still. Ring the bell! Your best is chalked on the board.
//   CLAY CHEESE   (-2.55) Clank's trap. Press DOWN for "PULL!" and he lobs 8 little cheese wheels into the sky over
//                         12 seconds: shoot them, or bash one as it comes in to PARRY it back (worth double).
//   CRATE TOWER   (2.4)   a stack of crates and barrels. Shoot it, bash it, bowl the beach ball into it: everything
//                         topples with a bit of physics. It stacks itself back up a while after.
//   HOOP          (0.86)  a basketball hoop. Get the beach ball through it (shoot, bash, uppercut, header...). Biscuit
//                         goes wild. Streaks count.
const TOY = { strikerTh: -0.7, hoopTh: 0.86, trapTh: -2.55, towerTh: 2.4, strikerH: 150, rimH: 141, rimHalf: 29, rimOff: -3 };

function makeToyTextures(scene) {
  if (scene.textures.exists('ty_striker')) return;
  const WD = [0xd09050, 0x9a5c26, 0x5a3212], GOLD = [0xfff0a0, 0xf2c040, 0x9a6a10], ST = [0xe8eef6, 0x9aa6b8, 0x4e5868], RED = [0xff7a6a, 0xd83a2a, 0x7a1410];
  pixSprite(scene, 'ty_striker', 34, 124, a => {
    a.rrect(11, 14, 23, 116, 2, WD);                                                                  // the board
    for (let y = 18; y < 112; y += 8) { const k = (y - 18) / 94; a.rect(13, y, 21, y + 6, k < 0.33 ? 0xff4a3a : k < 0.66 ? 0xffb02a : 0x7dff8a); }   // the scale: red at the top
    for (let y = 22; y < 112; y += 16) a.rect(9, y, 11, y, 0x1a1020);
    a.line([[17, 14], [17, 116]], 0x5a3212, 1);                                                      // the wire
    a.ell(17, 8, 8, 7, GOLD); a.px(14, 5, 0xffffff); a.rect(16, 0, 18, 2, 0x5a3212);                   // the bell
    a.rrect(2, 114, 32, 123, 2, RED); a.rect(4, 115, 30, 117, 0xffb0a0);                               // the pad you hit
  });
  pixSprite(scene, 'ty_puck', 10, 6, a => { a.rrect(0, 0, 9, 5, 1, ST); a.px(2, 1, 0xffffff); });
  pixSprite(scene, 'ty_trap', 36, 26, a => {
    a.rrect(2, 12, 34, 25, 2, ST); for (let x = 4; x < 34; x += 6) a.poly([[x, 25], [x + 3, 25], [x + 6, 12], [x + 3, 12]], 0xffd23f);   // hazard stripes
    a.line([[18, 12], [10, 2]], 0x4e5868, 3); a.ell(9, 3, 4, 3, ST);                                   // the throwing arm
    a.ell(26, 6, 5, 4, [0xffd060, 0xf2a020, 0x9a5a10]);                                               // a wheel ready to go
    a.rect(4, 18, 8, 21, 0xff3a2a);                                                                   // the PULL light
  });
  pixSprite(scene, 'ty_clay', 18, 9, a => { a.ell(9, 4.5, 8.5, 4, [0xffd060, 0xf2a020, 0x9a5a10]); a.ell(9, 3.5, 5, 2, 0xffe890); for (const [x, y] of [[5, 5], [12, 4]]) a.ell(x, y, 1.2, 0.8, 0xb07818); });
  pixSprite(scene, 'ty_hoop', 84, 176, a => {                                                      // side-on: post and backboard on the right, the rim reaching out left
    a.rrect(76, 20, 81, 175, 1, ST); a.rect(70, 28, 78, 31, ST[1]);                                  // the post + its arm
    a.rrect(66, 0, 72, 56, 1, [0xffffff, 0xe8ecf4, 0xa0a8b8]); a.rect(67, 16, 71, 34, 0xd83a2a);      // the backboard, edge-on
    a.rect(8, 32, 66, 35, 0xff7a2a); a.rect(8, 35, 66, 36, 0x9a3a10); a.ell(8, 34, 2.5, 2.5, 0xff7a2a);   // the rim
    for (let k = 0; k < 9; k++) a.line([[10 + k * 7, 36], [16 + k * 5.5, 56]], 0xf0f0f8, 1);          // the net, tapering
    a.line([[13, 44], [62, 44]], 0xe0e0ec, 1); a.line([[17, 51], [58, 51]], 0xe0e0ec, 1);
  });
}

const CampToysMixin = {
  toysInit() {
    makeToyTextures(this);
    const add = (tex, th, sc, depth, origY) => { const spr = this.add.image(0, 0, tex).setOrigin(0.5, origY === undefined ? 1 : origY).setDepth(depth); spr.bsx = spr.bsy = sc; const a = { spr, theta: th, h: -this.campSink(spr, sc), rot: 0 }; this.actors.push(a); return a; };
    let best = {}; try { best = JSON.parse(localStorage.getItem('lc_toys') || '{}'); } catch (e) { /* ignore */ }
    this.toyBest = best;
    this.toyG = this.add.graphics().setDepth(2.46);
    // the high striker
    this.striker = { a: add('ty_striker', TOY.strikerTh, 1.3, 2.4), puck: { h: 0, vh: 0, peak: 0 }, cd: 0,
      txt: this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '7px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 3, align: 'center' }).setOrigin(0.5, 1).setDepth(2.47) };
    this.strikerPuck = this.add.image(0, 0, 'ty_puck').setDepth(2.45); this.strikerPuck.bsx = this.strikerPuck.bsy = 1.3;
    // the hoop
    this.hoop = { a: add('ty_hoop', TOY.hoopTh, 1.0, 2.38), streak: 0, cd: 0 };
    // the crate tower: 3, 2, 1
    this.tower = { blocks: [], downT: 0 }; this.towerBuild();
    // the clay trap is a camp station (CAMP_ST 'clay'); its round
    this.clay = { on: false, n: 0, hits: 0, t: 0, next: 0, wheels: [] };
  },
  toySave() { try { localStorage.setItem('lc_toys', JSON.stringify(this.toyBest)); } catch (e) { /* ignore */ } },

  // ---- CRATE TOWER
  towerBuild() {
    const T = this.tower; for (const b of T.blocks) b.spr.destroy(); T.blocks = [];
    const W = 26 / R, rows = [[-1, 0, 1], [-0.5, 0.5], [0]];
    rows.forEach((row, ri) => row.forEach((k, j) => {
      const tex = (ri + j) % 3 === 1 ? 'cr_barrel' : 'cr_crate';
      const spr = this.add.image(0, 0, tex).setOrigin(0.5, 1).setDepth(2.6); spr.bsx = spr.bsy = 1.5;
      T.blocks.push({ spr, theta: wrap(TOY.towerTh + k * W), h: ri * 30, vt: 0, vh: 0, rot: 0, vr: 0, loose: false, rest: true });
    }));
    T.downT = 0;
  },
  towerKnock(b, vt, vh) {
    if (!b.loose) { b.loose = true; b.rest = false; }
    b.vt += vt; b.vh = Math.max(b.vh, vh); b.vr += (Math.sign(vt) || 1) * rnd(4, 9);
    if (!this.tower.cheer) { this.tower.cheer = true; this.time.delayedCall(250, () => { Sound.sfx('crash'); this.popup(TOY.towerTh, 110, 'TIMBER!', '#ffd23f', true); }); }
  },
  towerUpdate(dt) {
    const T = this.tower, B = this.ball, P = this.pl;
    for (const b of T.blocks) {
      if (!b.loose) {
        // unsupported? (something underneath has gone) then it falls too
        if (b.h > 1 && !T.blocks.some(o => o !== b && !o.loose && Math.abs(o.h - (b.h - 30)) < 4 && Math.abs(angDiff(o.theta, b.theta)) * R < 22)) { b.loose = true; b.rest = false; b.vt += rnd(-30, 30); }
        // the beach ball barrelling into it
        if (B && Math.abs(angDiff(B.theta, b.theta)) * R < 24 && B.h - BALL.r < b.h + 30 && B.h + BALL.r > b.h && Math.hypot(B.vt, B.vh) > 160) { this.towerKnock(b, B.vt * 0.8, 200 + Math.abs(B.vh) * 0.3); B.vt *= -0.4; }
        continue;
      }
      if (b.rest) continue;
      b.vh -= 900 * dt; b.h += b.vh * dt; b.theta = wrap(b.theta + b.vt / R * dt); b.rot += b.vr * dt;
      if (b.h <= 0) { b.h = 0; if (b.vh < -120) { b.vh = -b.vh * 0.35; Sound.sfx('clunk'); this.burst(b.theta, 4, 'crumb', 3, 0.4); } else b.vh = 0; b.vt *= 0.8; b.vr *= 0.7; if (Math.abs(b.vt) < 8 && b.vh === 0) { b.rest = true; b.vt = 0; b.rot = Math.round(b.rot / (Math.PI / 2)) * Math.PI / 2; } }
      // flying crates knock the still-standing ones
      for (const o of T.blocks) if (!o.loose && Math.abs(angDiff(o.theta, b.theta)) * R < 24 && Math.abs(o.h - b.h) < 28 && Math.hypot(b.vt, b.vh) > 120) this.towerKnock(o, b.vt * 0.6, 120);
    }
    // Chris shoving through at a run nudges the bottom row
    for (const b of T.blocks) if (!b.loose && b.h < 1 && Math.abs(angDiff(P.theta, b.theta)) * R < 20 && Math.abs(P.vx || 0) > 160) this.towerKnock(b, (P.vx || 0) * 0.6, 160);
    for (const b of T.blocks) this.place(b.spr, b.theta, b.h, b.rot);
    if (T.blocks.every(b => b.loose && b.rest)) { T.downT += dt; if (T.downT > 6) { for (const b of T.blocks) this.burst(b.theta, 14, 'puff', 4, 0.6); Sound.sfx('reveal'); this.towerBuild(); this.tower.cheer = false; } }
  },

  // ---- shots and bashes on the toys (true = the shot's used up)
  toyShot(b) {
    for (const k of this.tower.blocks) if (Math.abs(angDiff(b.theta, k.theta)) * R < 16 && b.h > k.h && b.h < k.h + 32) { this.towerKnock(k, Math.sign(b.vt || 1) * 160, 120); this.burst(k.theta, k.h + 16, 'spark', 3, 0.5); return true; }
    for (const w of this.clay.wheels) if (!w.dead && Math.hypot(angDiff(b.theta, w.theta) * R, b.h - w.h) < 18) { this.clayBreak(w, false); return true; }
    return false;
  },
  toyBash(dir, cy) {
    const P = this.pl, inFront = (th, reach) => { const a = angDiff(th, P.theta) * dir * R; return a > -12 && a < reach; };
    // the striker: hit the pad
    const S = this.striker;
    if (S.cd <= 0 && inFront(TOY.strikerTh, 64) && (P.h < 40 || P.spikeArm)) {
      let pw = P.upper ? 0.74 : P.spikeArm ? 0.62 + Math.min(0.36, Math.max(0, -(P.vhPre || P.vh || 0)) / 1400) : 0.42;
      pw += rnd(-0.06, 0.06); if (this.ctT > 0) pw *= 1.4; if (this.styleRank) pw += this.styleRank * 0.02;
      this.strikerHit(Math.max(0.12, pw));
    }
    // the crates
    for (const k of this.tower.blocks) if (inFront(k.theta, 70) && Math.abs(k.h + 15 - cy) < 46) this.towerKnock(k, dir * (P.upper ? 140 : 420), P.upper ? 620 : 220);
    // a clay wheel coming in: PARRY it
    for (const w of this.clay.wheels) if (!w.dead && Math.hypot(angDiff(w.theta, P.theta) * R - dir * 24, w.h - cy) < 40) this.clayBreak(w, true);
  },

  // ---- HIGH STRIKER
  strikerHit(pw) {
    const S = this.striker, top = TOY.strikerH;
    S.cd = 1.2; S.pw = pw; S.puck.vh = Math.sqrt(2 * 900 * top * Math.min(1.15, pw)) ; S.puck.h = 0; S.rang = false;
    Sound.sfx('clang'); this.cameras.main.shake(80, 0.004); this.burst(TOY.strikerTh, 6, 'spark', 6, 0.8);
  },
  strikerUpdate(dt) {
    const S = this.striker, top = TOY.strikerH, K = S.puck;
    S.cd = Math.max(0, S.cd - dt);
    if (K.vh || K.h > 0) {
      K.vh -= 900 * dt; K.h += K.vh * dt;
      if (K.h >= top && !S.rang) {                                            // DING!
        S.rang = true; K.h = top; K.vh = -40; Sound.sfx('chime'); Sound.sfx('reveal'); this.cameras.main.flash(120, 255, 240, 160);
        for (let k = 0; k < 3; k++) this.time.delayedCall(k * 120, () => this.burst(TOY.strikerTh, top * 1.3 + 30, 'spark', 10, 1.2));
        this.popup(TOY.strikerTh, top * 1.3 + 50, S.pw > 1.1 ? 'RINGER!!' : 'DING!', '#ffd23f', true);
      }
      if (K.h <= 0 && K.vh < 0) {
        K.h = 0; K.vh = 0;
        const score = Math.min(100, Math.round(S.pw * 100));
        if (!S.rang) this.popup(TOY.strikerTh, 120, score + '%', '#ffffff');
        if (score > (this.toyBest.striker || 0)) { this.toyBest.striker = score; this.toySave(); if (score > 20) this.popup(TOY.strikerTh, 150, 'NEW BEST!', '#7dff8a'); }
      }
    }
    this.place(this.strikerPuck, TOY.strikerTh, 14 + K.h * 0.9, 0);
    const t = this.screenPos(TOY.strikerTh, 178); S.txt.setPosition(t.x, t.y).setText('BEST ' + (this.toyBest.striker || 0) + '%').setVisible(t.vis).setScale(this.zoom);
  },

  // ---- CLAY CHEESE
  clayStart() {
    const C = this.clay; if (C.on) return;
    Object.assign(C, { on: true, n: 0, hits: 0, t: 0, next: 0.8 });
    this.campSay('CLANK: PULL!', 2); Sound.sfx('alarm');
  },
  clayBreak(w, parried) {
    w.dead = true; w.spr.destroy(); this.clay.hits += parried ? 2 : 1;
    Sound.sfx(parried ? 'zing' : 'cube'); this.burst(w.theta, w.h, 'crumb', 8, 0.8); this.burst(w.theta, w.h, 'spark', parried ? 8 : 3, 0.7);
    this.popup(w.theta, w.h + 24, parried ? 'PARRIED! +2' : 'PULLED!', parried ? '#ff8ad8' : '#ffd23f', parried);
    if (parried) { this.hitStop = Math.max(this.hitStop || 0, 0.05); this.styleAdd && this.styleAdd('parry', 20); }
  },
  clayUpdate(dt) {
    const C = this.clay; if (!C.on && !C.wheels.length) return;
    if (C.on) {
      C.t += dt; C.next -= dt;
      if (C.n < 8 && C.next <= 0) {
        C.n++; C.next = rnd(1.1, 1.7);
        const side = Math.sign(angDiff(this.pl.theta, TOY.trapTh)) || 1;
        const s = this.add.image(0, 0, 'ty_clay').setDepth(6); s.bsx = s.bsy = 1.5;
        C.wheels.push({ spr: s, theta: wrap(TOY.trapTh + side * 16 / R), h: 20, vt: side * rnd(170, 270), vh: rnd(480, 600), r: 0 });
        Sound.sfx('whoo');
      }
      if (C.n >= 8 && !C.wheels.some(w => !w.dead)) {
        C.on = false;
        const best = this.toyBest.clay || 0, nb = C.hits > best;
        if (nb) { this.toyBest.clay = C.hits; this.toySave(); }
        this.campSay('CLANK: ' + C.hits + ' POINTS!' + (nb ? ' NEW BEST!' : ' BEST: ' + best) + (C.hits >= 12 ? ' ...SHOW-OFF.' : ''), 4);
        Sound.sfx(nb ? 'reveal' : 'chime');
      }
    }
    for (let i = C.wheels.length - 1; i >= 0; i--) {
      const w = C.wheels[i];
      if (w.dead) { C.wheels.splice(i, 1); continue; }
      w.vh -= 300 * dt; w.h += w.vh * dt; w.theta = wrap(w.theta + w.vt / R * dt); w.r += dt * 9;
      this.place(w.spr, w.theta, w.h, w.r * 0.15);
      if (w.h <= 0) { w.dead = true; w.spr.destroy(); this.burst(w.theta, 4, 'crumb', 5, 0.5); Sound.sfx('clunk'); C.wheels.splice(i, 1); }
    }
  },

  // ---- HOOP
  hoopUpdate(dt) {
    const B = this.ball, H = this.hoop; if (!B) return;
    H.cd = Math.max(0, H.cd - dt);
    const rimH = TOY.rimH, dx = angDiff(B.theta, TOY.hoopTh) * R - TOY.rimOff;
    // the rim's two ends are solid: the ball clangs off them
    for (const ex of [-TOY.rimHalf, TOY.rimHalf]) {
      const ddx = dx - ex, ddy = B.h - rimH, d = Math.hypot(ddx, ddy);
      if (d < BALL.r + 2 && d > 0.01) { const nx = ddx / d, ny = ddy / d, vn = B.vt * nx + B.vh * ny; if (vn < 0) { B.vt -= 1.7 * vn * nx; B.vh -= 1.7 * vn * ny; Sound.sfx('tink'); } B.theta = wrap(TOY.hoopTh + (TOY.rimOff + ex + nx * (BALL.r + 2)) / R); B.h = rimH + ny * (BALL.r + 2); }
    }
    // through the middle, going down: SCORE
    if (H.prevH !== undefined && H.prevH > rimH && B.h <= rimH && Math.abs(dx) < TOY.rimHalf - 4 && B.vh < 0 && H.cd <= 0) {
      H.cd = 0.5; H.streak++;
      Sound.sfx('swish'); Sound.sfx('chime'); this.cameras.main.flash(100, 255, 230, 160);
      for (let k = 0; k < 3; k++) this.time.delayedCall(k * 150, () => this.burst(TOY.hoopTh, rimH + 20, 'spark', 10, 1.1));
      this.popup(TOY.hoopTh, rimH + 50, H.streak > 1 ? 'SWISH! x' + H.streak : 'SWISH!', '#ffd23f', true);
      if (H.streak > (this.toyBest.hoop || 0)) { this.toyBest.hoop = H.streak; this.toySave(); }
      const dog = this.campFolk && this.campFolk.find(F => F.id === 'dog'); if (dog) { dog.vh = 380; this.campFolkSay ? this.campFolkSay(dog, 'WOOF! WOOF!') : null; }
      H.lastScore = this.t;
    }
    if (H.lastScore !== undefined && this.t - H.lastScore > 12 && H.streak) H.streak = 0;     // a streak needs keeping up
    H.prevH = B.h;
  },
  toysUpdate(dt) {
    if (!this.striker) return;
    this.strikerUpdate(dt); this.clayUpdate(dt); this.towerUpdate(dt); this.hoopUpdate(dt);
  }
};
