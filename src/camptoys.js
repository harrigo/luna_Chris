// ================================================================= CAMP TOYS (v3.42)
// More things to muck about with at Moon Camp, each one quietly training a move:
//   HIGH STRIKER  (-0.7)  a fairground strength tester. Bash the pad and the puck flies up the tower: a plain bash gets
//                         about halfway, an UPPERCUT more, a SPIKE from high up more again, and anything in CHEESE TIME
//                         hits harder still. Ring the bell! Your best is chalked on the board.
//   CLAY CHEESE   (-2.55) Clank's trap. Press DOWN for "PULL!" and he lobs 8 little cheese wheels into the sky over
//                         12 seconds: shoot them, or bash one as it comes in to PARRY it back (worth double).
//   CRATE TOWER   (2.4)   (v3.68) a stack of crates and barrels to SMASH. You walk straight past them (they never block
//                         you); two shots or one bash and a crate bursts into planks and drops a golden crumb. What was
//                         on top comes tumbling down. The stack is rebuilt a minute after the first one goes.
//   TIN CANS      (-1.9)  (v3.68) five tins on a fence rail. Shoot them off (or bash them): they ping away spinning.
//                         Clear all five for a CLEAN SWEEP; your fastest sweep is chalked on the post.
//   HOOP          (0.86)  a basketball hoop. Get the beach ball through it (shoot, bash, uppercut, header...). Biscuit
//                         goes wild. Streaks count.
const TOY_UNLOCK = { hoop: 1, cans: 1, striker: 2, tower: 3, clay: 4, cave: 5 };   // (v3.43) runs finished (won or lost) before each one turns up
const TOY_NAME = { hoop: 'A BASKETBALL HOOP', striker: 'A HIGH STRIKER', tower: 'A CRATE TOWER', cans: 'TIN CANS ON THE FENCE', clay: 'CLANK\'S CLAY CHEESE TRAP', cave: 'SOMETHING UNDER A BOULDER...' };
const TOY = { strikerTh: -0.7, hoopTh: 0.86, trapTh: -2.55, towerTh: 1.1, cansTh: -1.9, railH: 34, strikerH: 150, rimH: 141, rimHalf: 29, rimOff: -3 };

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
  pixSprite(scene, 'ty_plank', 12, 4, a => { a.rect(0, 0, 11, 3, WD[1]); a.rect(0, 0, 11, 0, WD[0]); a.px(2, 2, WD[2]); a.px(8, 1, WD[2]); }, 1, g => { for (let i = 0; i < g.length; i++) if (g[i] === 0x1a1020) g[i] = -1; });
  pixSprite(scene, 'ty_fence', 100, 40, a => {                                                     // a length of fence: two posts, two rails (the tins stand on the top one)
    a.rrect(8, 4, 15, 39, 1, WD); a.rrect(84, 4, 91, 39, 1, WD); a.rect(2, 8, 97, 12, WD[1]); a.rect(2, 8, 97, 8, WD[0]); a.rect(2, 12, 97, 12, WD[2]);
    a.rect(2, 24, 97, 27, WD[1]); a.rect(2, 24, 97, 24, WD[0]); for (const x of [11, 87]) { a.px(x, 10, 0x4e5868); a.px(x, 25, 0x4e5868); }
    a.line([[30, 9], [44, 11]], WD[2]); a.line([[60, 25], [72, 26]], WD[2]);
  });
  [[0xe03a3a, 0x8a1818], [0x3a7ad8, 0x1a3a8a], [0x3aa84a, 0x1a5a22]].forEach(([c, d], i) => pixSprite(scene, 'ty_can' + i, 11, 14, a => {   // a tin: ridged steel, a bright label
    a.rrect(1, 1, 9, 12, 1, ST); a.rect(1, 4, 9, 9, c); a.rect(8, 4, 9, 9, d); a.rect(2, 5, 3, 8, 0xffffff); a.rect(1, 2, 9, 2, 0xffffff); a.px(5, 6, 0xffe890); a.px(6, 7, 0xffe890);
  }));
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
  // (v3.43) the toys turn up one at a time as you finish runs (dying counts - something to come home to)
  toyOpen(id) { return Progress.testMode || (Meta.stats().runs || 0) >= (TOY_UNLOCK[id] || 0); },
  toysInit() {
    makeToyTextures(this);
    const add = (tex, th, sc, depth) => { const spr = this.add.image(0, 0, tex).setOrigin(0.5, 1).setDepth(depth); spr.bsx = spr.bsy = sc; spr.pixSnap = tex !== 'ty_hoop' && tex !== 'ty_striker';   /* (their rim and puck are lined up with the art in world units) */ const a = { spr, theta: th, h: -this.campSink(spr, sc), rot: 0 }; this.actors.push(a); return a; };
    let best = {}; try { best = JSON.parse(localStorage.getItem('lc_toys') || '{}'); } catch (e) { /* ignore */ }
    this.toyBest = best; this.toysOn = true;
    this.striker = null; this.hoop = null; this.tower = { blocks: [], calmT: 0, goneT: 0, paid: 0 }; this.cans = null; this.clay = { on: false, n: 0, hits: 0, t: 0, next: 0, wheels: [] };
    if (this.toyOpen('striker')) {
      this.striker = { a: add('ty_striker', TOY.strikerTh, 1.3, 2.4), puck: { h: 0, vh: 0 }, cd: 0,
        txt: this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '7px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 3, align: 'center' }).setOrigin(0.5, 1).setDepth(2.47) };
      this.strikerPuck = this.add.image(0, 0, 'ty_puck').setDepth(2.45); this.strikerPuck.bsx = this.strikerPuck.bsy = 1.3;
    }
    if (this.toyOpen('hoop')) this.hoop = { a: add('ty_hoop', TOY.hoopTh, 1.0, 2.38), streak: 0, cd: 0 };
    if (this.toyOpen('tower')) this.towerBuild();
    if (this.toyOpen('cans')) {
      this.cans = { a: add('ty_fence', TOY.cansTh, 1.0, 2.38), list: [], t0: -1, lastT: 0, doneT: 0,
        txt: this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '7px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 3, align: 'center' }).setOrigin(0.5, 1).setDepth(2.47) };
      for (let i = 0; i < 5; i++) { const spr = this.add.image(0, 0, 'ty_can' + (i % 3)).setOrigin(0.5, 1).setDepth(2.5); spr.bsx = spr.bsy = 1.2; this.cans.list.push({ spr, i, up: true, theta: 0, h: 0, vt: 0, vh: 0, rot: 0, vr: 0 }); }
      this.cansReset(true);
    }
    const trap = this.campSt.find(q => q.id === 'clay'); if (trap) trap.a.spr.setVisible(this.toyOpen('clay'));
    // anything new since last time? Fridge-o-tron points it out
    let seen = []; try { seen = JSON.parse(localStorage.getItem('lc_toys_seen') || '[]'); } catch (e) { /* ignore */ }
    const fresh = Object.keys(TOY_UNLOCK).filter(id => this.toyOpen(id) && !seen.includes(id));
    if (fresh.length) {
      try { localStorage.setItem('lc_toys_seen', JSON.stringify(seen.concat(fresh))); } catch (e) { /* ignore */ }
      this.time.delayedCall(this.campSum ? 5200 : 2400, () => {
        this.campSay('NEW AT CAMP: ' + fresh.map(id => TOY_NAME[id]).join(', ') + '!', 5); Sound.sfx('reveal');
        for (const id of fresh) { const th = { hoop: TOY.hoopTh, striker: TOY.strikerTh, tower: TOY.towerTh, clay: TOY.trapTh, cave: 1.65, cans: TOY.cansTh }[id]; for (let k = 0; k < 3; k++) this.time.delayedCall(k * 250, () => this.burst(th, 40, 'spark', 8, 1)); }
      });
    }
  },
  toySave() { try { localStorage.setItem('lc_toys', JSON.stringify(this.toyBest)); } catch (e) { /* ignore */ } },

  // ---- CRATE TOWER (v3.68: scenery to SMASH. No collision with Chris at all. Two shots or one bash bursts a crate into
  // planks and a golden crumb; whatever was resting on it tumbles; the stack is rebuilt a minute after the first goes)
  towerBuild() {
    const T = this.tower; for (const b of T.blocks) b.spr.destroy(); T.blocks = [];
    const W = 27 / R, rows = [[-1, 0, 1], [-0.5, 0.5], [0]];
    rows.forEach((row, ri) => row.forEach((k, j) => {
      const tex = (ri + j) % 3 === 1 ? 'cr_barrel' : 'cr_crate';
      const spr = this.add.image(0, 0, tex).setOrigin(0.5, 1).setDepth(2.6); spr.bsx = spr.bsy = 1.5; spr.pixSnap = true;
      const th = wrap(TOY.towerTh + k * W);
      T.blocks.push({ spr, theta: th, h: ri * 30, home: { theta: th, h: ri * 30 }, vt: 0, vh: 0, rot: 0, vr: 0, fly: false, hp: 2, flash: 0 });
    }));
    T.calmT = 0; T.goneT = 0; T.cheer = false;
  },
  towerKnock(b, vt, vh) {
    b.fly = true; b.vt += vt; b.vh = Math.max(b.vh, vh); b.vr += (Math.sign(vt) || 1) * rnd(4, 9);
  },
  // a crate bursts: planks everywhere, a golden crumb (up to a dozen a visit), and a cheer for the first one
  towerSmash(b, dir) {
    const T = this.tower, i = T.blocks.indexOf(b); if (i < 0) return;
    T.blocks.splice(i, 1);
    for (let k = 0; k < 7; k++) { const im = this.add.image(0, 0, 'ty_plank').setDepth(2.7); im.bsx = im.bsy = rnd(1.1, 1.7); this.parts.push({ theta: b.theta, h: b.h + rnd(6, 26), vt: (dir || 0) * rnd(40, 160) + rnd(-140, 140), vh: rnd(120, 360), life: rnd(0.6, 1), spr: im, rot: rnd(0, 6), rv: rnd(-14, 14) }); }
    this.burst(b.theta, b.h + 16, 'crumb', 6, 0.8); this.burst(b.theta, b.h + 16, 'puff', 3, 0.5); Sound.sfx('crash'); this.cameras.main.shake(70, 0.004);
    b.spr.destroy();
    if (T.paid < 12 && typeof Meta !== 'undefined') { T.paid++; Meta.addCrumbs(1); this.popup(b.theta, b.h + 44, '+1 CRUMB', '#ffd23f'); if (this.campCrumbT) this.campCrumbT.setText(String(Meta.crumbs())); Sound.sfx('pickup'); }
    if (!T.cheer) { T.cheer = true; this.popup(TOY.towerTh, 120, 'SMASH!', '#ffd23f', true); }
    if (!T.goneT) T.goneT = 0.001;
  },
  // the height of whatever's underneath a crate here (the ground, or a crate that's sitting still)
  towerFloor(b) {
    let f = 0;
    for (const o of this.tower.blocks) if (o !== b && !o.fly && Math.abs(angDiff(o.theta, b.theta)) * R < 20 && o.h + 30 <= b.h + 10) f = Math.max(f, o.h + 30);
    return f;
  },
  towerUpdate(dt) {
    const T = this.tower, B = this.ball, P = this.pl; if (!this.toyOpen('tower')) return;
    for (const b of T.blocks) {
      b.flash = Math.max(0, b.flash - dt); if (b.flash > 0) b.spr.setTintFill(0xffffff); else b.spr.clearTint();
      if (!b.fly) {
        // nothing underneath any more: down it comes
        if (b.h > 1 && this.towerFloor(b) < b.h - 4) this.towerKnock(b, rnd(-40, 40), 20);
        // the beach ball barrelling into it
        if (B && Math.abs(angDiff(B.theta, b.theta)) * R < 24 && B.h - BALL.r < b.h + 30 && B.h + BALL.r > b.h && Math.hypot(B.vt, B.vh) > 160) { this.towerKnock(b, B.vt * 0.8, 200 + Math.abs(B.vh) * 0.3); B.vt *= -0.4; }
        continue;
      }
      b.vh -= 900 * dt; b.h += b.vh * dt; b.theta = wrap(b.theta + b.vt / R * dt); b.rot += b.vr * dt;
      const fl = this.towerFloor(b);
      if (b.h <= fl) {
        b.h = fl;
        if (b.vh < -150) { b.vh = -b.vh * 0.3; b.vt *= 0.7; b.vr *= 0.6; Sound.sfx('clunk'); this.burst(b.theta, fl + 4, 'crumb', 3, 0.4); }
        else { b.vh = 0; b.vt *= Math.max(0, 1 - dt * 10); b.vr = 0; b.rot += (Math.round(b.rot / (Math.PI / 2)) * Math.PI / 2 - b.rot) * Math.min(1, dt * 12);
          if (Math.abs(b.vt) < 10) { b.fly = false; b.vt = 0; b.rot = Math.round(b.rot / (Math.PI / 2)) * Math.PI / 2; } }
      }
    }
    for (const b of T.blocks) this.place(b.spr, b.theta, b.h, b.rot);
    // rebuilt a minute after the first crate goes; or, if it's only been knocked about, once you've wandered off
    if (T.goneT) { T.goneT += dt; if (T.goneT > 60) { for (const k of [-1, 0, 1]) this.burst(wrap(TOY.towerTh + k * 27 / R), 20, 'puff', 4, 0.6); Sound.sfx('reveal'); this.towerBuild(); } return; }
    const messy = T.blocks.some(b => Math.abs(angDiff(b.theta, b.home.theta)) * R > 6 || Math.abs(b.h - b.home.h) > 3), calm = T.blocks.every(b => !b.fly), away = Math.abs(angDiff(P.theta, TOY.towerTh)) * R > 160;
    T.calmT = messy && calm && away ? T.calmT + dt : 0;
    if (T.calmT > 5) { for (const b of T.blocks) this.burst(b.theta, 14, 'puff', 4, 0.6); Sound.sfx('reveal'); this.towerBuild(); }
  },

  // ---- TIN CANS (v3.68): five on the fence rail. Shoot them off; all five = a clean sweep, timed
  cansReset(quiet) {
    const C = this.cans; if (!C) return;
    for (const c of C.list) { c.up = true; c.theta = wrap(TOY.cansTh + (c.i - 2) * 17 / R); c.h = TOY.railH; c.vt = c.vh = c.vr = 0; c.rot = 0; if (!quiet) this.burst(c.theta, c.h + 8, 'puff', 2, 0.4); }
    C.t0 = -1; C.doneT = 0; if (!quiet) Sound.sfx('reveal');
  },
  cansHit(c, dir, hard) {
    const C = this.cans; if (!c.up) return;
    c.up = false; c.vt = (dir || 1) * rnd(120, 240) * (hard ? 1.6 : 1); c.vh = rnd(200, 340) * (hard ? 1.3 : 1); c.vr = (dir || 1) * rnd(10, 22);
    Sound.sfx('tink'); this.burst(c.theta, c.h + 8, 'spark', 4, 0.6);
    if (C.t0 < 0) C.t0 = this.t; C.lastT = this.t;
    if (C.list.every(q => !q.up)) {                                                 // CLEAN SWEEP
      const tm = Math.round((this.t - C.t0) * 10) / 10, best = this.toyBest.cans;
      C.doneT = 2.5; Sound.sfx('chime'); this.popup(TOY.cansTh, 96, 'CLEAN SWEEP! ' + tm.toFixed(1) + 's', '#ffd23f', true);
      for (let k = 0; k < 2; k++) this.time.delayedCall(k * 140, () => this.burst(TOY.cansTh, 70, 'spark', 8, 1));
      if (!(best > 0) || tm < best) { this.toyBest.cans = tm; this.toySave(); this.popup(TOY.cansTh, 120, 'NEW BEST!', '#7dff8a'); }
    }
  },
  cansUpdate(dt) {
    const C = this.cans; if (!C) return;
    for (const c of C.list) {
      if (!c.up && (c.vh || c.h > 0)) {
        c.vh -= 900 * dt; c.h += c.vh * dt; c.theta = wrap(c.theta + c.vt / R * dt); c.rot += c.vr * dt;
        if (c.h <= 0) { c.h = 0; if (c.vh < -140) { c.vh = -c.vh * 0.38; c.vt *= 0.6; c.vr *= 0.6; Sound.sfx('tink', 0.5); } else { c.vh = 0; c.vt = 0; c.vr = 0; c.rot = Math.PI / 2; } }
      }
      this.place(c.spr, c.theta, c.h + (c.up ? 0 : 5), c.rot);
    }
    if (C.doneT > 0) { C.doneT -= dt; if (C.doneT <= 0) this.cansReset(); }
    else if (C.t0 >= 0 && this.t - C.lastT > 7) this.cansReset();                      // (gave up half way: they go back up)
    const t = this.screenPos(TOY.cansTh, 62); C.txt.setPosition(t.x, t.y).setText(this.toyBest.cans > 0 ? 'BEST ' + this.toyBest.cans.toFixed(1) + 's' : '').setVisible(t.vis).setScale(this.zoom);
  },

  // ---- shots and bashes on the toys (true = the shot's used up)
  toyShot(b) {
    for (const k of this.tower.blocks) if (Math.abs(angDiff(b.theta, k.theta)) * R < 16 && b.h > k.h && b.h < k.h + 32) {       // two shots and it's matchwood
      k.hp--; k.flash = 0.07; this.burst(k.theta, k.h + 16, 'spark', 3, 0.5);
      if (k.hp <= 0) this.towerSmash(k, Math.sign(b.vt || 1)); else Sound.sfx('clunk');
      return true;
    }
    if (this.cans) for (const c of this.cans.list) if (c.up && Math.abs(angDiff(b.theta, c.theta)) * R < 9 && b.h > c.h - 2 && b.h < c.h + 19) { this.cansHit(c, Math.sign(b.vt || 1), false); return true; }
    for (const w of this.clay.wheels) if (!w.dead && Math.hypot(angDiff(b.theta, w.theta) * R, b.h - w.h) < 18) { this.clayBreak(w, false); return true; }
    return false;
  },
  toyBash(dir, cy) {
    const P = this.pl, inFront = (th, reach) => { const a = angDiff(th, P.theta) * dir * R; return a > -12 && a < reach; };
    // the striker: hit the pad
    const S = this.striker;
    if (S && S.cd <= 0 && inFront(TOY.strikerTh, 64) && (P.h < 40 || P.spikeArm)) {
      let pw = P.upper ? 0.74 : P.spikeArm ? 0.62 + Math.min(0.36, Math.max(0, -(P.vhPre || P.vh || 0)) / 1400) : 0.42;
      pw += rnd(-0.06, 0.06); if (this.ctT > 0) pw *= 1.4; if (this.styleRank) pw += this.styleRank * 0.02;
      this.strikerHit(Math.max(0.12, pw));
    }
    // the crates
    for (const k of this.tower.blocks.slice()) if (inFront(k.theta, 70) && Math.abs(k.h + 15 - cy) < 46) this.towerSmash(k, dir);   // (one bash and it's matchwood)
    if (this.cans) for (const c of this.cans.list) if (c.up && inFront(c.theta, 64) && Math.abs(c.h + 8 - cy) < 44) this.cansHit(c, dir, true);
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
    if (!this.striker) return;
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
    const C = this.clay; if (C.on || !this.toyOpen('clay')) return;
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
    const B = this.ball, H = this.hoop; if (!B || !H) return;
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
    if (!this.toysOn) return;
    this.strikerUpdate(dt); this.clayUpdate(dt); this.towerUpdate(dt); this.cansUpdate(dt); this.hoopUpdate(dt);
  }
};
