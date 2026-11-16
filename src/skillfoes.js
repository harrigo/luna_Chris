// ================================================================= SKILL FOES (v3.35): enemies that need Chris's moves
// Three rats that turn the skill moves from optional extras into the way you win:
//   SHIELD RAT   a big cheese-grater shield always turned to face you. Shots and a plain bash just CLANG off it.
//                UPPERCUT (DOWN + BASH on the ground) knocks the shield up out of its paws: it's dazed and wide open
//                for a few seconds. Or get round the back of it (it's slow to turn).
//   RIND BEETLE  a beetle in a red wax rind shell, like a mini cheese. Nothing gets through the wax - until you
//                SPIKE it (DOWN + BASH in the air), ground-pound it, or bowl a launched rat into it. Then it's
//                soft and squishy. It curls up and rolls at you now and then (dodge through it).
//   BRIE SNIPER  hovers out of reach, a polished parmesan plate bouncing your shots off. A laser sight, a lock-on
//                blink... and a slow glowing brie bolt. PARRY it (bash just as it arrives) and it flies home and
//                knocks the sniper clean out. It blinks away if you get close, but a bash or stomp still lands.
const SF_KINDS = ['shieldrat', 'shellbug', 'sniper'];
Object.assign(ENEMY, {
  shieldrat: { hp: 4, r: 15, ch: 13, tex: 'sf_shield', oy: 0.95, drop: 0.35, ai: 'shieldrat', big: true, k: 1.22 },
  shellbug:  { hp: 4, r: 17, ch: 11, tex: 'sf_bug',    oy: 0.9,  drop: 0.35, ai: 'shellbug',  big: true, k: 1.25 },
  sniper:    { hp: 3, r: 15, ch: 4,  tex: 'sf_sniper', oy: 0.62, drop: 0.45, ai: 'sniper',   k: 1.2 }
});
const SF_TIPS = {
  shieldrat: 'SHIELD RAT!\nUPPERCUT IT (DOWN + BASH) TO FLIP ITS SHIELD',
  shellbug: 'RIND BEETLE!\nSPIKE IT (DOWN + BASH IN THE AIR) TO CRACK THE WAX',
  sniper: 'BRIE SNIPER!\nPARRY ITS SHOT (BASH AS IT ARRIVES) TO SEND IT HOME'
};
// where they turn up: [level, first wave index, how many per wave]
const SF_PLACES = { 1: [['shieldrat', 1, 2]], 2: [['shieldrat', 0, 2], ['shellbug', 1, 2]], 3: [['shellbug', 0, 2], ['sniper', 1, 1]],
  4: [['shieldrat', 0, 2], ['sniper', 1, 2]], 5: [['shellbug', 0, 2], ['sniper', 0, 1], ['shieldrat', 1, 2]], 6: [['shieldrat', 0, 2], ['shellbug', 1, 2], ['sniper', 1, 1]],
  5.5: [['sniper', 0, 2], ['shellbug', 1, 2]] };
(function sfAddToWaves() {
  for (const id in SF_PLACES) {
    const L = LEVELS[id]; if (!L || !L.waves) continue;
    for (const [type, from, n] of SF_PLACES[id]) L.waves.forEach((w, i) => {
      if (i < from || !w.spawns || !w.spawns.length) return;
      const end = Math.max(...w.spawns.map(s => s.t));
      for (let k = 0; k < n; k++) w.spawns.push(S(type, +(end * (k + 1) / (n + 1) + 0.3).toFixed(2)));
      w.spawns.sort((a, b) => a.t - b.t);
    });
  }
})();

function makeSkillFoeTextures(scene) {
  if (scene.textures.exists('sf_shield')) return;
  const FUR = [0xa89480, 0x7a6450, 0x4a3828], PINK = 0xe9a8b8, NOSE = [0xffb0c0, 0xe0607a, 0x9a3048], STEEL = [0xe8eef6, 0x9aa6b8, 0x4e5868],
    GOLD = [0xfff0a0, 0xf2c040, 0x9a6a10], WAX = [0xff7a6a, 0xd8281a, 0x6a0a08], EYE = [0xffffff, 0xffffff, 0x1a1020];
  const rat = (p, armsUp) => {
    p.line([[5, 30], [2, 24], [3, 17]], PINK, 2);                                                       // tail
    p.ell(15, 26, 10, 8, FUR);                                                                          // body
    p.rrect(8, 31, 14, 35, 2, [0x6a5040, 0x4a3828, 0x2a1a10]); p.rrect(17, 31, 23, 35, 2, [0x6a5040, 0x4a3828, 0x2a1a10]);   // feet
    p.ell(22, 15, 9, 8, FUR); p.poly([[26, 12], [34, 16], [32, 19], [26, 20]], FUR);                     // head + snout
    p.ell(33, 16, 1.6, 1.6, NOSE);
    p.ell(16, 8, 4, 4.5, FUR); p.ell(16, 8, 2, 2.5, PINK);                                               // ear
    p.ell(25, 13, 2.4, 2.6, EYE); p.px(26, 13, 0x1a1020);
    p.rect(19, 6, 29, 8, 0x3a4a2a); p.rect(18, 8, 30, 9, 0x2a3a1a);                                      // a little army helmet
    if (armsUp) { p.line([[12, 22], [8, 12]], FUR[1], 3); p.line([[20, 22], [24, 10]], FUR[1], 3); }
  };
  // SHIELD RAT: a big square cheese-grater held up in front
  pixSprite(scene, 'sf_shield', 50, 36, p => {
    rat(p, false);
    p.line([[18, 24], [30, 22]], FUR[1], 3);                                                            // arm to the handle
    p.rrect(31, 2, 47, 35, 2, STEEL);                                                                   // the grater
    for (let y = 6; y < 33; y += 4) for (let x = 34; x < 46; x += 4) { p.rect(x, y, x + 1, y + 1, 0x2a3240); p.px(x + 2, y + 1, 0xffffff); }   // grating holes
    p.rect(31, 2, 47, 3, 0xffffff); p.rect(37, 0, 41, 2, GOLD[1]);                                       // rim + handle top
  });
  // ...knocked off: arms flailing, no shield
  pixSprite(scene, 'sf_shield_off', 50, 36, p => { rat(p, true); });
  pixSprite(scene, 'sf_grater', 18, 34, p => {
    p.rrect(1, 1, 17, 33, 2, STEEL);
    for (let y = 5; y < 31; y += 4) for (let x = 4; x < 16; x += 4) p.rect(x, y, x + 1, y + 1, 0x2a3240);
  });
  // RIND BEETLE: a red wax dome on little black legs
  const legs = p => { for (const x of [10, 18, 26, 34]) { p.line([[x, 25], [x - 3, 29]], 0x1a1020, 2); } };
  pixSprite(scene, 'sf_bug', 46, 30, p => {
    p.ell(22, 16, 18, 10, WAX); p.rect(4, 19, 40, 22, 0x6a0a08);                                         // the wax dome, its lip
    legs(p);
    p.line([[22, 6], [22, 20]], 0x9a1a10, 1);                                                           // wing-case seam
    p.ell(15, 11, 4, 2, 0xffb0a0); p.px(13, 10, 0xffffff);                                               // shine
    p.ell(40, 18, 5, 5, [0x4a3a3a, 0x2a1a1a, 0x100808]);                                                 // head
    p.ell(42, 16, 1.6, 1.6, 0xffe27a); p.line([[42, 13], [45, 8]], 0x1a1020, 1);                          // eye, feeler
  });
  pixSprite(scene, 'sf_bug_soft', 46, 30, p => {
    p.ell(22, 17, 16, 8, [0xfff4c0, 0xf2d070, 0xb08a30]);                                               // the soft cheesy body
    legs(p);
    for (const [x, y] of [[14, 15], [22, 13], [29, 17]]) p.ell(x, y, 2, 1.5, 0xc89a40);                  // holes
    p.poly([[6, 14], [12, 10], [10, 16]], WAX); p.poly([[30, 9], [36, 12], [32, 15]], WAX);              // bits of wax left
    p.ell(40, 18, 5, 5, [0x4a3a3a, 0x2a1a1a, 0x100808]); p.ell(42, 16, 1.6, 1.6, 0xffe27a);
    p.px(41, 21, 0xffffff); p.px(43, 21, 0xffffff);                                                     // worried teeth
  });
  pixSprite(scene, 'sf_bug_ball', 28, 28, p => {
    p.ell(14, 14, 12.5, 12.5, WAX); p.line([[3, 14], [25, 14]], 0x6a0a08, 2); p.line([[14, 3], [14, 25]], 0x9a1a10, 1);
    p.ell(9, 8, 3, 2, 0xffb0a0); p.px(8, 7, 0xffffff);
  });
  // BRIE SNIPER: a rat on a hover-disc, a long rifle, a polished parmesan breastplate
  pixSprite(scene, 'sf_sniper', 54, 40, p => {
    p.ell(22, 33, 16, 4, [0xc8d0dc, 0x6a7488, 0x2a3240]); for (const x of [12, 22, 32]) p.px(x, 34, 0x7affff);   // hover disc + lights
    p.ell(20, 22, 9, 9, FUR);
    p.ell(21, 23, 7, 7, [0xfff8d8, 0xe8d8a0, 0x9a8a50]);                                                 // parmesan plate
    p.ell(19, 21, 2, 1.5, 0xffffff);
    p.ell(26, 11, 8, 7, FUR); p.poly([[30, 9], [37, 12], [35, 15], [30, 16]], FUR); p.ell(36, 12, 1.5, 1.5, NOSE);
    p.ell(21, 5, 3.5, 4, FUR); p.ell(21, 5, 1.8, 2.2, PINK);
    p.rect(23, 8, 33, 10, 0x1a1020); p.ell(30, 10, 2.4, 2.4, [0xff8ad8, 0xd030a0, 0x601040]);            // eyepatch + scope eye
    p.rect(20, 18, 52, 20, 0x6a4a2a); p.rect(44, 17, 53, 18, 0x3a2a1a);                                 // the rifle
    p.rrect(28, 14, 38, 17, 1, [0x9aa6b8, 0x4e5868, 0x2a3240]); p.px(37, 15, 0xff8ad8);                   // scope
  });
  pixSprite(scene, 'sf_bolt', 16, 16, p => {
    p.ell(8, 8, 7, 7, [0xffe8f8, 0xff8ad8, 0xb03090]); p.ell(8, 8, 4, 4, [0xffffff, 0xffe8f8, 0xff8ad8]);
  });
}

const SkillFoeMixin = {
  sfIs(e) { return e && SF_KINDS.includes(e.kind); },
  sfSide(e) { return Math.sign(angDiff(this.pl.theta, e.theta)) || 1; },
  sfTip(type) {
    this.sfTips = this.sfTips || {};
    if (this.sfTips[type] || this.training || this.camp) return;
    this.sfTips[type] = true; this.banner(SF_TIPS[type]);
  },
  // ---- shots: what gets through
  sfHitK(e) {
    if (e.kind === 'shieldrat') return e.dazeT > 0 ? 1.5 : (this.sfSide(e) === e.face ? 0 : 1.25);
    if (e.kind === 'shellbug') return e.cracked ? 1.5 : 0;
    if (e.kind === 'sniper') return 0;
    return 1;
  },
  // ---- a plain bash: the shield and the wax just clang (true = blocked)
  sfBashBlock(e, dir) {
    const P = this.pl;
    const blocked = (e.kind === 'shieldrat' && !(e.dazeT > 0) && this.sfSide(e) === e.face) || (e.kind === 'shellbug' && !e.cracked);
    if (!blocked) return false;
    this.deflect(e, e.theta, e.h + e.ch, null);
    this.knock(e, P.theta, 240); P.vx = -dir * 220;
    this.popup(e.theta, e.h + e.ch + 28, 'CLANG!', '#9fffb0');
    this.sfTip(e.kind);
    return true;
  },
  // ---- the UPPERCUT flips a shield rat's shield (and just pings off the wax)
  sfUpper(e) {
    if (e.kind === 'shieldrat' && !(e.dazeT > 0)) { this.sfDaze(e); return false; }
    if (e.kind === 'shellbug' && !e.cracked) { this.deflect(e, e.theta, e.h + e.ch, null); this.knock(e, this.pl.theta, 200); return true; }
    return false;
  },
  sfDaze(e) {
    e.dazeT = 3.2; e.spr.setTexture('sf_shield_off'); e.state = 'daze';
    const g = this.add.image(0, 0, 'sf_grater').setDepth(6); g.bsx = g.bsy = 1.2;
    this.parts.push({ theta: e.theta, h: e.h + 30, vt: -e.face * rnd(40, 90), vh: rnd(420, 520), life: 1.4, spr: g, rot: 0, rv: rnd(-12, 12) });
    Sound.sfx('clang'); Sound.sfx('squeak'); this.popup(e.theta, e.h + e.ch + 40, 'SHIELD FLIPPED!', '#ffd23f', true);
    this.styleAdd('flip', 35); this.addScore(100);
  },
  // ---- the wax cracks: a SPIKE, a ground-pound, a bowled rat, a shockwave or a parried shot
  sfCrack(e) {
    if (e.kind !== 'shellbug' || e.cracked) return;
    e.cracked = true; e.state = 'crawl'; e.spr.setTexture('sf_bug_soft').setOrigin(0.5, ENEMY.shellbug.oy); e.roll = 0; e.lift = 0;
    for (let k = 0; k < 6; k++) { const im = this.add.image(0, 0, 'sf_bug_ball').setDepth(6).setScale(0.3); im.bsx = im.bsy = rnd(0.25, 0.45); this.parts.push({ theta: e.theta, h: e.h + 16, vt: rnd(-160, 160), vh: rnd(200, 380), life: 0.9, spr: im, rot: 0, rv: rnd(-10, 10) }); }
    Sound.sfx('crash'); this.cameras.main.shake(90, 0.006); this.hitStop = Math.max(this.hitStop || 0, 0.06);
    this.popup(e.theta, e.h + e.ch + 34, 'CRACKED!', '#ffd23f', true);
    this.styleAdd('crack', 40); this.addScore(100);
  },
  // ---- stomping: the wax just bounces you off (a ground-pound cracks it)
  sfStomp(e, top) {
    if (e.kind !== 'shellbug' || e.cracked) return false;
    const P = this.pl;
    if (P.diving && P.vh < -380) { this.sfCrack(e); return false; }
    P.vh = 400; P.h = top + 1; P.jetArmed = false; P.invuln = Math.max(P.invuln, 0.2);
    P.vx = (Math.sign(angDiff(P.theta, e.theta)) || P.facing || 1) * 160;
    this.burst(P.theta, top, 'spark', 8, 0.9); Sound.sfx('clang'); this.sfTip('shellbug');
    return true;
  },
  // ---- a parried shot coming home
  sfReflect(e) {
    if (e.kind === 'sniper') { e.hp = 0; this.popup(e.theta, e.h + e.ch + 44, 'SNIPED!', '#ff8ad8', true); this.styleAdd('snipe', 60); this.addScore(200); }
    if (e.kind === 'shellbug') this.sfCrack(e);
    if (e.kind === 'shieldrat' && !(e.dazeT > 0)) this.sfDaze(e);
  },

  sfAI(e, dt, toP, distP, dirP, fooled) {
    const P = this.pl, side = Math.sign(toP) || 1;
    if (e.kind === 'shieldrat') {
      if (e.face === undefined) { e.face = side; e.state = 'walk'; e.turnT = 0; e.cd = rnd(1, 2); }
      const grounded = e.h <= 0 && e.vh <= 0;
      if (e.dazeT > 0) {                                                       // dazed: stars round its head, then it picks the shield back up
        e.dazeT -= dt; e.roll = Math.sin(e.t * 14) * 0.12;
        if (Math.random() < dt * 6) this.burst(e.theta, e.h + e.ch + 22, 'spark', 1, 0.3);
        if (e.dazeT <= 0) { e.spr.setTexture('sf_shield'); e.state = 'walk'; e.face = side; e.roll = 0; Sound.sfx('clunk'); }
      } else {
        if (side !== e.face && !fooled) { e.turnT += dt; if (e.turnT > 0.6 && e.state === 'walk') { e.face = side; e.turnT = 0; Sound.sfx('clunk'); e.spr.hsq = 1; } }
        else e.turnT = 0;
        e.cd -= dt;
        if (e.state === 'walk') {
          if (grounded && distP > 40) e.theta = wrap(e.theta + e.face * 70 / R * dt);
          if (!fooled && side === e.face && distP < 95 && e.cd <= 0 && P.h < 60) { e.state = 'brace'; e.tT = 0.4; Sound.sfx('charge'); }
        } else if (e.state === 'brace') {                                      // the tell: it crouches behind the shield
          e.tT -= dt; e.spr.setTint(Math.floor(e.t * 16) % 2 ? 0xffd0a0 : 0xffffff);
          if (e.tT <= 0) { e.state = 'shove'; e.tT = 0.3; e.spr.clearTint(); Sound.sfx('whoosh'); }
        } else if (e.state === 'shove') {                                      // a shield-charge
          e.tT -= dt; e.theta = wrap(e.theta + e.face * 300 / R * dt);
          if (e.tT <= 0) { e.state = 'walk'; e.cd = rnd(1.6, 2.6); }
        }
      }
      e.dir = e.face;
      e.vh -= this.gAt(e.theta) * dt; e.h += e.vh * dt; if (e.h <= 0) { e.h = 0; if (e.vh < 0) e.vh = 0; }
      return;
    }
    if (e.kind === 'shellbug') {
      if (e.state === undefined) { e.state = 'crawl'; e.cd = rnd(2, 3.5); }
      const sp = e.cracked ? 75 : 48;
      e.cd -= dt;
      if (e.state === 'crawl') {
        e.theta = wrap(e.theta + dirP * sp / R * dt); e.dir = dirP; e.roll = 0;
        if (!e.cracked && !fooled && e.cd <= 0 && distP < 300) { e.state = 'curl'; e.tT = 0.55; Sound.sfx('charge'); e.rollDir = side; }
      } else if (e.state === 'curl') {                                         // the tell: it shivers and tucks in
        e.tT -= dt; e.roll = Math.sin(e.t * 40) * 0.12;
        if (e.tT <= 0) { e.state = 'rolling'; e.tT = 1.5; e.spr.setTexture('sf_bug_ball'); e.spr.setOrigin(0.5, 0.5); e.lift = 14 * 1.25; Sound.sfx('whoosh'); }
      } else if (e.state === 'rolling') {                                      // bowling at you
        e.tT -= dt; e.theta = wrap(e.theta + e.rollDir * 340 / R * dt); e.roll = (e.roll || 0) + e.rollDir * dt * 16; e.dir = e.rollDir;
        if (Math.random() < dt * 20) this.burst(e.theta, 2, 'puff', 1, 0.3);
        if (e.tT <= 0) { e.state = 'crawl'; e.cd = rnd(2.4, 3.8); e.roll = 0; e.spr.setTexture(e.cracked ? 'sf_bug_soft' : 'sf_bug'); e.spr.setOrigin(0.5, ENEMY.shellbug.oy); e.lift = 0; }
      }
      e.vh -= this.gAt(e.theta) * dt; e.h += e.vh * dt; if (e.h <= 0) { e.h = 0; if (e.vh < 0) e.vh = 0; }
      return;
    }
    if (e.kind === 'sniper') {
      if (e.state === undefined) { e.state = 'hover'; e.cd = rnd(1.8, 2.6); e.blinkCd = 0; e.baseH = rnd(150, 210); e.h = e.baseH; }
      const want = e.baseH + Math.sin(e.t * 1.6 + e.seed) * 12;
      e.h += (want - e.h) * Math.min(1, dt * 3);
      e.blinkCd -= dt;
      if (!fooled && distP < 90 && e.blinkCd <= 0) {                          // too close: BLINK away
        this.burst(e.theta, e.h, 'puff', 8, 0.8); Sound.sfx('psy');
        e.theta = wrap(P.theta - side * rnd(240, 300) / R); e.blinkCd = 2.4; e.state = 'hover'; e.cd = Math.max(e.cd, 0.8);
        this.burst(e.theta, e.h, 'puff', 8, 0.8);
      }
      if (e.state !== 'lock') {                                                // keep a sniper's distance
        const mv = distP < 220 ? -1 : (distP > 330 ? 1 : 0);
        e.theta = wrap(e.theta + mv * side * 110 / R * dt);
      }
      e.dir = side;
      e.cd -= dt;
      if (e.state === 'hover' && e.cd <= 0 && !fooled && distP < 460) { e.state = 'aim'; e.tT = 1.1; Sound.sfx('charge'); }
      else if (e.state === 'aim') { e.tT -= dt; e.tx = P.theta; e.ty = P.h + 24; if (e.tT <= 0) { e.state = 'lock'; e.tT = 0.3; Sound.sfx('alarm'); } }
      else if (e.state === 'lock') {
        e.tT -= dt;
        if (e.tT <= 0) {
          const dx = angDiff(e.tx, e.theta) * R, dy = e.ty - (e.h + e.ch), L = Math.hypot(dx, dy) || 1, sp = 300;
          const b = this.addEBullet('sf_bolt', e.theta, e.h + e.ch, dx / L * sp, dy / L * sp, 9, 3.2); b.sniperBolt = true; b.from = e;
          Sound.sfx('zap'); e.spr.hsq = 1; e.state = 'hover'; e.cd = rnd(2.6, 3.6);
          this.sfTip('sniper');
        }
      }
      return;
    }
  },
  // the sniper's laser sight
  sfDraw() {
    if (!this.sfG) this.sfG = this.add.graphics().setDepth(7.56);
    const g = this.sfG, z = this.zoom; g.clear();
    for (const e of this.enemies) {
      if (e.kind !== 'sniper' || (e.state !== 'aim' && e.state !== 'lock') || e.hp <= 0) continue;
      const a = this.screenPos(e.theta, e.h + e.ch), b = this.screenPos(e.tx, e.ty); if (!a.vis) continue;
      const lock = e.state === 'lock';
      if (!lock || Math.floor(this.t * 16) % 2) {
        g.lineStyle((lock ? 2.5 : 1.2) * z, 0xff8ad8, lock ? 0.95 : 0.5).lineBetween(a.x, a.y, b.x, b.y);
        g.lineStyle(2 * z, 0xff8ad8, lock ? 1 : 0.7).strokeCircle(b.x, b.y, (lock ? 7 : 10) * z);
      }
    }
  }
};

// hook the foes into the existing hit code
function sfInstall(L) {
  const P = L.prototype;
  const hitK = P.hitK; P.hitK = function (e, th, h) { return this.sfIs(e) ? this.sfHitK(e) : hitK.call(this, e, th, h); };
  const deflect = P.deflect; P.deflect = function (e, th, h, b) {                  // (no "SLIME SHIELD" tip for these - they have their own)
    if (!this.sfIs(e)) return deflect.call(this, e, th, h, b);
    const s = this.slimeTip; this.slimeTip = true; deflect.call(this, e, th, h, b); this.slimeTip = s; this.sfTip(e.kind);
  };
  const makeEnemy = P.makeEnemy; P.makeEnemy = function (type, theta, side) { if (SF_KINDS.includes(type)) makeSkillFoeTextures(this); return makeEnemy.call(this, type, theta, side); };
  const spawnEnemy = P.spawnEnemy; P.spawnEnemy = function (type) {
    const r = spawnEnemy.call(this, type);
    if (SF_KINDS.includes(type)) { let first = false; try { const k = 'lc_sf_' + type; first = !localStorage.getItem(k); localStorage.setItem(k, '1'); } catch (x) { /* ignore */ } if (first || type !== 'sniper') this.sfTip(type); }
    return r;
  };
  Object.assign(P, SkillFoeMixin);
}
