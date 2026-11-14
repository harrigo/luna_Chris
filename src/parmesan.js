// ===== L9: PARMESAN PRIME (v2.78, part 1) =====
// The rats' homeworld: one colossal, ancient wheel of Parmesan, rock-hard and glittering with crunchy crystals, its rind
// stamped with giant dotted lettering. A decadent rat empire sits on top (gold domes, marble columns, banners, statues of
// the King), and it's all coming apart, because the rats have been grating their own planet for cheese.
//  * THE ROYAL RASP: a planet-sized grater blade on cables from a mining ship sweeps right round the world. A siren, a
//    warning on the side it's coming from and a red band at its height: LOW (jump it) or HIGH (duck under it). It shreds
//    any rat in its way, and every pass grates a layer off: the planet gets SMALLER all level (520 -> 380).
//  * The ground cracks and then falls away into chasms (down to the glowing core): fall in and you're hauled out a heart
//    lighter. They're refilled with rubble after a while.
//  * Palace rubble rains down (columns, statue heads, gold dome chunks), a shadow showing where.
//  * The Rat Empire's finest: ROYAL GUARDS (tower shield in front - shots plink off; slow to turn; halberd jab),
//    GRENADIERS (lob rind grenades that bounce once then go off), THE TAXMAN (snatches your cheddar and legs it - splat
//    him for a refund with interest) and COCKROACH CAVALRY (paw the ground, then charge straight through: jump it).
// Part 2 brings the Parmesan Colossus and the escape to the Royal Saucer.

function makeParmTextures(scene) {
  if (scene.game.__parmTex) return; scene.game.__parmTex = true;
  const INK = 0x1a1020, FUR = [0xc4c8dc, 0x868ca6, 0x4a4f6a], PINK = [0xffb0c0, 0xe07a90, 0xa04a60], GOLD = [0xfff0a0, 0xffc83a, 0xb07a1a],
    RED = [0xff5a4a, 0xc81e2a, 0x6a0a14], MARB = [0xfff8ec, 0xe0d8c8, 0x9a9282], STEEL = [0xe8eef8, 0xa8b0c0, 0x5a6272], ROACH = [0xb8703a, 0x7a3e18, 0x3a1a08];
  const ratHead = (a, x, y, f) => {                                    // a rat's head facing right (x,y = skull centre)
    a.ell(x, y, 7, 6, FUR); a.poly([[x + 4, y - 3], [x + 13, y + 1], [x + 4, y + 5]], FUR); a.ell(x + 13, y + 1, 1.8, 1.6, PINK);
    a.ell(x + 2, y - 1, 1.8, 1.8, 0xff2a1a); a.px(x + 2, y - 2, 0xffffff); a.rect(x + 8, y + 4, x + 9, y + 6, 0xfff4d8);
    for (let k = 0; k < 3; k++) a.line([[x + 11, y + 1], [x + 17, y - 1 + k * 2]], 0x2a2030);
  };
  // ---- ROYAL GUARD: plumed helmet, red tunic, a tower shield in front embossed with the rat crown, a halberd behind
  for (const f of [0, 1]) pixSprite(scene, 'ppguard' + (f ? '_b' : ''), 52, 60, a => {
    a.line([[10, 58], [12, 4]], 0x6a4a2a, 3); a.poly([[8, 10], [12, 0], [18, 8], [12, 14]], STEEL); a.poly([[12, 8], [20, 6], [18, 14]], STEEL);   // halberd
    const lg = f ? [[18, 59], [26, 57]] : [[16, 57], [27, 59]]; for (const [x, y] of lg) a.rect(x - 2, 44, x + 2, y, 0x3a2a40);
    a.ell(22, 36, 11, 12, RED); a.rect(14, 40, 30, 43, GOLD[1]);                                           // tunic + belt
    ratHead(a, 22, 20, f); a.poly([[14, 16], [22, 6], [30, 16]], STEEL); a.rect(14, 15, 30, 17, GOLD[1]);   // helmet
    a.poly([[20, 7], [26, 0], [30, 2], [24, 9]], RED);                                                     // plume
    a.rrect(31, 18, 49, 56, 3, [0xd8b850, 0xa88420, 0x5a420a]); a.rrect(34, 22, 46, 52, 2, RED);            // tower shield
    a.poly([[36, 32], [38, 26], [40, 30], [42, 26], [44, 32]], GOLD); a.rect(36, 32, 44, 34, GOLD[1]);     // the crown on it
    for (const [x, y] of [[33, 20], [47, 20], [33, 54], [47, 54]]) a.px(x, y, 0xfff4c0);
  });
  // ---- GRENADIER: a towering bearskin hat, a bandolier of rind grenades; frame b winds up to throw
  for (const f of [0, 1]) pixSprite(scene, 'ppgren' + (f ? '_b' : ''), 44, 52, a => {
    a.rect(14, 38, 18, 51, 0x3a2a40); a.rect(23, 38, 27, 51, 0x3a2a40);
    a.ell(20, 30, 10, 11, [0x5a7ad8, 0x2a4aa8, 0x142a5a]); a.line([[12, 22], [28, 40]], 0x6a4a2a, 3);
    for (const [x, y] of [[15, 26], [20, 31], [25, 36]]) a.ell(x, y, 2.5, 2.5, [0xe8d8a0, 0xb8a060, 0x6a5a2a]);
    ratHead(a, 20, 16, f); a.rrect(11, -1, 29, 14, 4, [0x4a3a3a, 0x2a1e1e, 0x120a0a]); a.rect(11, 11, 29, 13, RED[1]);   // bearskin
    if (f) { a.line([[26, 26], [34, 14], [36, 8]], FUR[1], 3); a.ell(37, 6, 3.5, 3.5, [0xe8d8a0, 0xb8a060, 0x6a5a2a]); a.px(39, 3, 0xffd23f); }
    else a.line([[26, 26], [32, 32]], FUR[1], 3);
  });
  // ---- THE TAXMAN: a fat rat in a top hat and monocle, a sack over his shoulder
  for (const f of [0, 1]) pixSprite(scene, 'pptax' + (f ? '_b' : ''), 50, 50, a => {
    const lg = f ? [[17, 49], [27, 47]] : [[15, 47], [29, 49]]; for (const [x, y] of lg) a.rect(x - 2, 40, x + 2, y, 0x2a2030);
    a.ell(10, 24, 9, 10, [0xd8b878, 0xa8884a, 0x6a5428]); a.line([[8, 18], [12, 16]], 0x6a5428); a.rect(6, 26, 13, 28, 0x6a5428);   // the sack (with a coin mark)
    a.ell(9, 27, 3, 3, GOLD);
    a.ell(23, 32, 13, 11, [0x5a5a6a, 0x3a3a4a, 0x1e1e2a]); a.rect(21, 22, 25, 40, 0xf0f0f0); a.px(23, 26, RED[1]); a.px(23, 30, RED[1]);   // waistcoat
    a.line([[16, 33], [28, 34]], GOLD[1]);                                                                 // watch chain
    ratHead(a, 25, 15, f);
    a.line([[25, 11], [29, 11]], GOLD[1]); a.ell(27, 14, 2.6, 2.6, 0xbfe8ff); a.line([[29, 15], [29, 20]], GOLD[1]);   // monocle
    a.rect(17, -1, 30, 7, 0x1a1a22); a.rect(14, 7, 33, 9, 0x1a1a22); a.rect(17, 5, 30, 6, RED[1]);          // top hat
  });
  // ---- COCKROACH CAVALRY: a rat in a little crown riding a giant greasy cockroach, lance couched
  for (const f of [0, 1]) pixSprite(scene, 'ppcav' + (f ? '_b' : ''), 76, 52, a => {
    for (let k = 0; k < 3; k++) { const x = 18 + k * 14, s = (k + f) % 2 ? 4 : -4; a.line([[x, 38], [x + s, 44], [x + s * 2, 51]], 0x2a1408, 2); }
    a.ell(36, 36, 26, 9, ROACH); a.ell(30, 33, 14, 4, 0xd8904a); a.line([[12, 36], [60, 36]], 0x3a1a08);   // glossy shell + its seam
    a.ell(64, 38, 8, 6, ROACH); a.line([[68, 34], [76, 22]], 0x3a1a08); a.line([[66, 34], [72, 20]], 0x3a1a08);   // head + antennae
    a.ell(66, 37, 1.5, 1.5, 0xfff4c0);
    a.ell(32, 22, 8, 8, RED); ratHead(a, 33, 10, f); a.poly([[27, 5], [29, 0], [32, 3], [35, 0], [38, 3], [40, 0], [40, 5]], GOLD);   // rider + crown
    a.line([[30, 24], [64, 16]], 0x6a4a2a, 2); a.poly([[62, 14], [72, 15], [62, 19]], STEEL);              // lance
  });
  pixSprite(scene, 'ppgrenade', 14, 16, a => { a.ell(7, 10, 6, 6, [0xe8d8a0, 0xb8a060, 0x6a5a2a]); for (const [x, y] of [[5, 8], [9, 12]]) a.ell(x, y, 1.2, 1, 0x8a7a40); a.rect(6, 1, 8, 4, 0x6a6a72); a.px(7, 0, 0xffd23f); });
  // ---- palace rubble that rains down
  pixSprite(scene, 'pp_column', 26, 46, a => { a.rect(4, 2, 22, 44, MARB[1]); for (const x of [7, 11, 15, 19]) a.line([[x, 4], [x, 42]], MARB[2]); a.rect(2, 0, 24, 5, MARB); a.poly([[2, 40], [24, 38], [22, 46], [4, 46]], MARB); a.line([[6, 20], [14, 26], [10, 32]], 0x5a5242); });
  pixSprite(scene, 'pp_head', 40, 36, a => {                                     // a marble statue head of the Rat-King, crown and all
    a.ell(16, 20, 13, 12, MARB); a.poly([[24, 14], [40, 22], [24, 28]], MARB); a.ell(39, 22, 2, 2, MARB[2]);
    a.poly([[6, 10], [8, 2], [12, 7], [16, 1], [20, 7], [24, 2], [26, 10]], GOLD); a.ell(16, 18, 3, 3, MARB[2]); a.line([[4, 26], [12, 30], [8, 34]], 0x5a5242);
  });
  pixSprite(scene, 'pp_dome', 40, 26, a => { a.ell(20, 22, 19, 16, GOLD); a.rect(0, 22, 40, 26, 0x1a1020); a.line([[8, 10], [12, 20]], GOLD[2]); a.line([[20, 6], [20, 20]], GOLD[2]); a.line([[32, 10], [28, 20]], GOLD[2]); a.ell(14, 12, 3, 2, 0xffffff); });
  // ---- the ruined empire on the surface
  pixSprite(scene, 'ppstatue', 50, 92, a => {                                     // a statue of the King, cracked, an arm gone
    a.rect(6, 78, 44, 91, MARB[2]); a.rect(4, 74, 46, 80, MARB); a.rect(14, 82, 36, 86, GOLD[1]);
    a.ell(25, 54, 13, 20, MARB); a.poly([[13, 70], [37, 70], [40, 76], [10, 76]], MARB); a.line([[34, 44], [44, 30], [46, 22]], MARB[1], 5);   // robe, sceptre arm
    a.ell(46, 20, 3, 3, GOLD); ratHead(a, 25, 27, 0); a.poly([[17, 20], [19, 12], [23, 17], [27, 11], [31, 17], [33, 20]], GOLD);
    a.line([[20, 40], [28, 52], [24, 64]], 0x5a5242, 2); a.line([[28, 52], [34, 56]], 0x5a5242); a.ell(12, 44, 3, 2, 0x5a5242);   // cracks, a stump
  });
  pixSprite(scene, 'ppcol', 28, 80, a => { a.rect(4, 74, 24, 79, MARB); a.rect(6, 18, 22, 74, MARB[1]); for (const x of [9, 13, 17]) a.line([[x, 18], [x, 72]], MARB[2]); a.poly([[6, 18], [10, 8], [15, 14], [19, 4], [22, 18]], MARB); a.line([[10, 40], [16, 48]], 0x5a5242); });
  pixSprite(scene, 'ppbanner', 34, 90, a => {
    a.line([[4, 89], [4, 2]], 0x6a4a2a, 3); a.ell(4, 2, 2.5, 2.5, GOLD);
    a.poly([[6, 6], [32, 6], [30, 40], [24, 34], [20, 48], [14, 36], [6, 44]], RED); a.rect(6, 6, 32, 9, GOLD[1]);
    a.poly([[13, 22], [15, 16], [18, 20], [21, 16], [24, 22]], GOLD); a.rect(13, 22, 24, 24, GOLD[1]);
  });
}

Object.assign(ENEMY, {
  ppguard: { hp: 9, r: 18, ch: 26, tex: 'ppguard', oy: 0.97, drop: 0.4, ai: 'ppguard', k: 1.25, frames: ['ppguard', 'ppguard_b'], fps: 5 },
  ppgren:  { hp: 5, r: 15, ch: 22, tex: 'ppgren',  oy: 0.97, drop: 0.35, ai: 'ppgren', k: 1.2, frames: ['ppgren', 'ppgren'], fps: 4 },
  pptax:   { hp: 6, r: 17, ch: 22, tex: 'pptax',   oy: 0.97, drop: 0.2, ai: 'pptax', k: 1.25, frames: ['pptax', 'pptax_b'], fps: 9 },
  ppcav:   { hp: 7, r: 24, ch: 20, tex: 'ppcav',   oy: 0.97, drop: 0.4, ai: 'ppcav', k: 1.25, frames: ['ppcav', 'ppcav_b'], fps: 10 },
});

const PP_RMIN = 380;
const ParmMixin = {
  parmInit() {
    this.pp = { rasp: { st: 'idle', t: 9, theta: 0, dir: 1, kind: 'low', hitDone: false, passes: 0, run: 0 }, cracks: [], crackT: 7, nades: [], taxmen: [], R0: R, sparkle: 0 };
    if (this.cp && this.cp.wave) R = Math.max(PP_RMIN, R - 45 * this.cp.wave);   // (a retry from a checkpoint: the planet's already been grated down)
    this.ppG = this.add.graphics().setDepth(7.7); this.ppBack = this.add.graphics().setDepth(2.9); this.ppHud = this.add.graphics().setDepth(19);
  },
  parmUpdate(dt, bossUp) {
    const S = this.pp, P = this.pl; if (!S || this.state !== 'play') return;
    // ---- THE ROYAL RASP
    const RS = S.rasp; RS.t -= dt;
    if (RS.st === 'idle' && RS.t <= 0 && !bossUp && R > PP_RMIN + 2) {
      RS.st = 'warn'; RS.t = 2; RS.dir = Math.random() < 0.5 ? 1 : -1; RS.kind = RS.passes % 3 === 2 ? 'high' : (Math.random() < 0.6 ? 'low' : 'high'); RS.hitDone = false;
      Sound.sfx('alarm'); if (!RS.passes) this.banner('THE ROYAL RASP!\nIT\'S GRATING THE PLANET!'); else this.banner(RS.kind === 'low' ? 'RASP! JUMP!' : 'RASP! DUCK!');
    } else if (RS.st === 'warn') {
      if (Math.floor(RS.t * 4) !== Math.floor((RS.t + dt) * 4)) Sound.sfx('blip');
      if (RS.t <= 0) { RS.st = 'pass'; RS.theta = wrap(P.theta - RS.dir * (this.visHalf + 0.5)); RS.run = 0; Sound.sfx('grind'); Sound.sfx('crash'); }
    } else if (RS.st === 'pass') {
      const sp = 820 / R; RS.theta = wrap(RS.theta + RS.dir * sp * dt); RS.run += sp * dt;
      R = Math.max(PP_RMIN, R - 13 * (sp * dt) / TAU);                  // every lap grates ~13 units off the planet
      const near = Math.abs(angDiff(P.theta, RS.theta)) * R;
      if (near < 500 && Math.random() < dt * 12) { this.cameras.main.shake(60, 0.006); if (Math.random() < 0.3) Sound.sfx('grind'); }
      const [h0, h1] = RS.kind === 'low' ? [0, 36] : [24, 118];
      if (!RS.hitDone && near < 150) {
        const top = P.h + (P.duck ? 19 : 34), bot = P.h + (P.duck ? 1 : 10);
        if (bot < h1 && top > h0 && P.invuln <= 0) { RS.hitDone = true; this.hurt(); this.popup(P.theta, P.h + 70, 'GRATED!', '#ffd23f'); P.vh = 300; }
      }
      for (const e of this.enemies) if (e.type !== 'boss' && !e.phased && e.hp > 0 && Math.abs(angDiff(e.theta, RS.theta)) * R < 150 && e.h < h1 && e.h + (e.ch || 20) > h0) {
        e.hp = 0; this.burst(e.theta, e.h + 20, 'crumb', 16, 1.3); this.addScore(150); Sound.sfx('splat');
      }
      if (RS.run >= TAU) { RS.st = 'idle'; RS.t = rnd(11, 15); RS.passes++; this.popup(P.theta, P.h + 90, 'THE PLANET SHRANK!', '#ffb07a'); }
    }
    // ---- the ground cracks... then falls away into a chasm
    S.crackT -= dt;
    const open = S.cracks.filter(c => c.st !== 'gone').length;
    if (S.crackT <= 0 && open < 2 && !bossUp) {
      S.crackT = rnd(5.5, 9);
      const th = wrap(P.theta + (P.facing || 1) * rnd(0.12, 0.45) + rnd(-0.08, 0.08));
      if (!this.craters.some(c => Math.abs(angDiff(c.theta, th)) < 0.2) && !S.cracks.some(c => c.st !== 'gone' && Math.abs(angDiff(c.theta, th)) < 0.25)) {
        S.cracks.push({ theta: th, half: 36 / R, st: 'crack', t: 1.7 }); Sound.sfx('clunk'); Sound.sfx('grind');
      }
    }
    for (const C of S.cracks) {
      C.t -= dt;
      if (C.st === 'crack' && C.t <= 0) {
        C.st = 'open'; C.t = rnd(10, 13); C.cr = { theta: C.theta, half: C.half, kind: 'pit', pp: true }; this.craters.push(C.cr);
        this.burst(C.theta, 6, 'crumb', 22, 1.4); this.bang(C.theta, 4, 26); this.cameras.main.shake(220, 0.012); Sound.sfx('crash'); buzz([40, 20, 60]);
        for (let k = 0; k < 6; k++) { const im = this.add.image(0, 0, 'db_rock').setDepth(6).setTint(0xc8b080); im.bsx = im.bsy = rnd(0.8, 1.6); this.parts.push({ theta: wrap(C.theta + rnd(-1, 1) * C.half), h: 2, vt: rnd(-40, 40), vh: rnd(-260, -80), life: 0.8, spr: im }); }
      } else if (C.st === 'open' && C.t <= 0) {
        C.st = 'gone'; const i = this.craters.indexOf(C.cr); if (i >= 0) this.craters.splice(i, 1);
        this.burst(C.theta, 4, 'crumb', 12, 1); Sound.sfx('clunk');
      }
    }
    S.cracks = S.cracks.filter(c => c.st !== 'gone' || c.t > -1);
    // ---- grenades: bounce once, then go off
    for (let i = S.nades.length - 1; i >= 0; i--) {
      const N = S.nades[i]; N.fuse -= dt; N.vh -= this.gAt(N.theta) * dt; N.h += N.vh * dt; N.theta = wrap(N.theta + N.vt / R * dt); N.rot += N.vt / 30 * dt;
      if (N.h <= 0) { N.h = 0; if (N.vh < -80 && !N.bounced) { N.vh = -N.vh * 0.4; N.vt *= 0.5; N.bounced = true; Sound.sfx('tink'); } else { N.vh = 0; N.vt *= Math.max(0, 1 - dt * 6); } }
      this.place(N.spr, N.theta, N.h + 6, N.rot);
      if (N.fuse <= 0) {
        this.bang(N.theta, N.h + 6, 30); this.burst(N.theta, N.h + 6, 'spark', 12, 1); this.burst(N.theta, N.h + 6, 'crumb', 10, 1); Sound.sfx('boom'); this.cameras.main.shake(120, 0.008);
        if (dist2(N.theta, N.h, P.theta, P.h + 20) < 58 * 58 && P.invuln <= 0) this.hurt();
        N.spr.destroy(); S.nades.splice(i, 1);
      }
    }
    // ---- taxmen who died with your money: refund with interest
    for (const e of S.taxmen) if (!e.refunded && e.hp <= 0) {
      e.refunded = true;
      if (e.escaped) continue;
      if (e.loot > 0) { this.spillCheddar(e.theta, e.h + 30, e.loot * 2); this.banner('TAX REFUND!\n+' + e.loot * 2 + ' CHEDDAR'); Sound.sfx('power'); }
    }
    S.taxmen = S.taxmen.filter(e => !e.refunded);
    S.sparkle += dt;
  },
  // ---- the empire's finest
  parmAI(e, dt, P, dirP) {
    const toP = angDiff(P.theta, e.theta), distP = Math.abs(toP) * R, side = Math.sign(toP) || 1, g = this.gAt(e.theta);
    const ground = () => { e.vh = (e.vh || 0) - g * dt; e.h += e.vh * dt; if (e.h <= 0) { e.h = 0; if (e.vh < 0) e.vh = 0; } };
    e.cd = (e.cd || 0) - dt; e.st = e.st || 'walk'; e.stT = (e.stT || 0) + dt;
    const set = s => { e.st = s; e.stT = 0; };
    if (e.type === 'ppguard') {
      if (e.face === undefined) e.face = side;
      if (side !== e.face && e.st === 'walk') { e.turnT = (e.turnT || 0) + dt; if (e.turnT > 0.6) { e.face = side; e.turnT = 0; Sound.sfx('clunk'); } } else e.turnT = 0;
      e.dir = e.face;
      if (e.st === 'walk') {
        if (distP > 55) e.theta = wrap(e.theta + e.face * 55 / R * dt);
        if (distP < 85 && side === e.face && e.cd <= 0 && P.h < 60) { set('wind'); Sound.sfx('swish'); }
      } else if (e.st === 'wind') { if (e.stT > 0.45) { set('jab'); Sound.sfx('swish'); e.theta = wrap(e.theta + e.face * 14 / R); } }
      else if (e.st === 'jab') {
        if (!e.jabbed && distP < 100 && side === e.face && P.h < 50 && P.invuln <= 0) { e.jabbed = true; this.hurt(); }
        if (e.stT > 0.25) { set('walk'); e.cd = 1.5; e.jabbed = false; }
      }
      ground();
    } else if (e.type === 'ppgren') {
      e.dir = side;
      if (e.st === 'walk') {
        if (distP < 230) e.theta = wrap(e.theta - side * 70 / R * dt); else if (distP > 380) e.theta = wrap(e.theta + side * 60 / R * dt);
        if (e.cd <= 0 && distP < 520) { set('wind'); e.spr.setTexture('ppgren_b'); }
      } else if (e.st === 'wind' && e.stT > 0.45) {
        const vt = side * Math.max(120, Math.min(380, distP * 0.95)), im = this.add.image(0, 0, 'ppgrenade').setDepth(6.2); im.bsx = im.bsy = 1.5;
        this.pp.nades.push({ theta: e.theta, h: e.h + 46, vt, vh: 420, fuse: 1.5, rot: 0, spr: im }); Sound.sfx('swish');
        set('walk'); e.cd = rnd(2.2, 3); e.spr.setTexture('ppgren');
      }
      ground();
    } else if (e.type === 'pptax') {
      if (!e.taxInit) { e.taxInit = true; e.loot = 0; this.pp.taxmen.push(e); }
      if (e.st === 'walk') {
        e.noTouch = true; e.dir = side; e.theta = wrap(e.theta + side * 175 / R * dt);
        if (distP < 26 && P.h < 40) {
          const sh = Shop.get(this.registry), take = Math.min(40, sh.coins || 0);
          if (take >= 5) { sh.coins -= take; Shop.set(this.registry, sh); e.loot = take; this.popup(P.theta, P.h + 70, 'TAXED! -' + take, '#ff9a5a'); Sound.sfx('cackle'); this.banner('THE TAXMAN!\nSPLAT HIM FOR A REFUND!'); }
          else { this.hurt(); Sound.sfx('cackle'); }
          set('flee'); e.fleeDir = -side;
        }
      } else if (e.st === 'flee') {
        e.dir = e.fleeDir; e.theta = wrap(e.theta + e.fleeDir * 215 / R * dt);
        if (Math.random() < dt * 8) this.burst(e.theta, 10, 'crumb', 1, 0.3);
        if (e.stT > 6.5) { e.escaped = true; e.quietKill = true; e.hp = 0; this.burst(e.theta, 30, 'spark', 14, 1); Sound.sfx('whoosh'); if (e.loot) this.popup(e.theta, 80, 'HE GOT AWAY WITH IT!', '#ff9a5a'); }
      }
      if (e.h <= 0 && Math.random() < dt * 3) e.vh = 120;
      ground();
    } else if (e.type === 'ppcav') {
      if (e.st === 'walk') {
        e.dir = side; e.theta = wrap(e.theta + side * 45 / R * dt);
        if (e.cd <= 0 && distP < 430 && distP > 90 && P.h < 120) { set('paw'); e.chDir = side; Sound.sfx('squeak'); }
      } else if (e.st === 'paw') {
        e.dir = e.chDir; if (Math.random() < dt * 14) this.burst(wrap(e.theta - e.chDir * 22 / R), 2, 'crumb', 1, 0.4);
        if (e.stT > 0.75) { set('charge'); Sound.sfx('growl'); }
      } else if (e.st === 'charge') {
        e.theta = wrap(e.theta + e.chDir * 400 / R * dt); if (Math.random() < dt * 20) this.burst(e.theta, 2, 'crumb', 1, 0.5);
        if (e.stT > 1.4 || (angDiff(P.theta, e.theta) * e.chDir < -220 / R)) { set('skid'); Sound.sfx('scrap'); }
      } else if (e.st === 'skid') { e.theta = wrap(e.theta + e.chDir * 400 * Math.max(0, 1 - e.stT * 2.2) / R * dt); if (e.stT > 0.55) { set('walk'); e.cd = rnd(2, 3); } }
      ground();
    }
  },
  // the guard's shield: shots from in front plink off (unless he's mid-jab), from behind they bite
  ppHitK(e) {
    if (e.type !== 'ppguard') return 1;
    const from = Math.sign(angDiff(this.pl.theta, e.theta)) || 1;
    if (from === e.face && e.st !== 'jab') return 0;
    return from === e.face ? 0.8 : 1.5;
  },

  parmDraw() {
    const S = this.pp; if (!S) return;
    const g = this.ppG, bg = this.ppBack, hg = this.ppHud, z = this.zoom, t = this.t, P = this.pl, vt = this.viewT(), vh = this.visHalf + 0.15;
    g.clear(); bg.clear(); hg.clear();
    const inView = th => Math.abs(angDiff(th, vt)) < vh;
    // ---- the rind's giant dotted lettering, stamped round the planet just under the surface; crystals glinting
    const FONT = { P: ['1110', '1001', '1110', '1000', '1000'], A: ['0110', '1001', '1111', '1001', '1001'], R: ['1110', '1001', '1110', '1010', '1001'], M: ['10001', '11011', '10101', '10001', '10001'],
      E: ['1111', '1000', '1110', '1000', '1111'], S: ['0111', '1000', '0110', '0001', '1110'], N: ['1001', '1101', '1011', '1001', '1001'], I: ['1', '1', '1', '1', '1'], ' ': ['00', '00', '00', '00', '00'] };
    const word = 'PARMESAN PRIME   ', dot = 14;
    let cols = []; for (const ch of word) { const F = FONT[ch]; for (let c = 0; c < F[0].length; c++) cols.push(F.map(r => r[c] === '1')); cols.push([false, false, false, false, false]); }
    const span = cols.length * dot;
    for (let x = Math.floor((angDiff(vt, 0) - vh) * R / dot) * dot; x < (angDiff(vt, 0) + vh) * R; x += dot) {
      const ci = ((Math.round(x / dot) % cols.length) + cols.length) % cols.length, col = cols[ci], th = wrap(x / R);
      for (let r = 0; r < 5; r++) if (col[r]) { const p = this.screenPos(th, -18 - r * dot); bg.fillStyle(0x5a3a10, 0.9).fillCircle(p.x, p.y, 5 * z); bg.fillStyle(0x8a6a2a, 1).fillCircle(p.x + 0.6 * z, p.y + 0.6 * z, 3.4 * z); bg.fillStyle(0xf0dca0, 0.7).fillCircle(p.x - 1.4 * z, p.y - 1.4 * z, 1.4 * z); }
    }
    for (let k = 0; k < 90; k++) {
      const th = wrap(k * 0.0698 + Math.sin(k * 7.1) * 0.02); if (!inView(th)) continue;
      const tw = Math.sin(t * 3 + k * 1.7); if (tw < 0.6) continue;
      const p = this.screenPos(th, -4 - (k * 13) % 40), s = (tw - 0.6) * 6 * z;
      bg.fillStyle(0xffffff, 0.9).fillRect(p.x - s, p.y - 0.6 * z, s * 2, 1.2 * z).fillRect(p.x - 0.6 * z, p.y - s, 1.2 * z, s * 2);
    }
    // ---- cracks spreading before the ground gives way; the chasms' glowing core
    for (const C of S.cracks) {
      if (!inView(C.theta)) continue;
      if (C.st === 'crack') {
        const k = 1 - Math.max(0, C.t) / 1.7, n = 6;
        for (let i = 0; i < n; i++) { const a0 = wrap(C.theta + (i / (n - 1) * 2 - 1) * C.half * k), a = this.screenPos(C.theta, 1), b = this.screenPos(a0, -14 * k - (i % 2) * 8), c2 = this.screenPos(wrap(a0 + 0.01), 0.5); g.lineStyle(2.5 * z, 0x2a1406, 1).lineBetween(a.x, a.y, b.x, b.y).lineBetween(b.x, b.y, c2.x, c2.y); }
        if (Math.floor(t * 10) % 2) { const p = this.screenPos(C.theta, 2); g.fillStyle(0xff6a2a, 0.4 * k).fillEllipse(p.x, p.y, 60 * z * k, 8 * z); }
      } else if (C.st === 'open') {
        const p = this.screenPos(C.theta, -40); g.fillStyle(0xff5a1a, 0.35 + 0.15 * Math.sin(t * 4)).fillEllipse(p.x, p.y, C.half * R * 1.4 * z, 26 * z);
        g.fillStyle(0xffd23f, 0.3).fillEllipse(p.x, p.y + 4 * z, C.half * R * 0.8 * z, 10 * z);
      }
    }
    // ---- grenades' fuses fizz
    for (const N of S.nades) { const p = this.screenPos(N.theta, N.h + 14); if (Math.floor(t * 16) % 2) g.fillStyle(0xffd23f, 1).fillCircle(p.x, p.y, 2.5 * z); }
    // ---- the guards' halberd jab
    for (const e of this.enemies) if (e.type === 'ppguard' && (e.st === 'wind' || e.st === 'jab')) {
      const reach = e.st === 'jab' ? 70 : 10, a = this.screenPos(e.theta, e.h + 34), b = this.screenPos(wrap(e.theta + e.face * (20 + reach) / R), e.h + 34);
      g.lineStyle(4 * z, 0x6a4a2a, 1).lineBetween(a.x, a.y, b.x, b.y); g.fillStyle(0xe8eef8, 1).fillCircle(b.x, b.y, 4 * z);
      if (e.st === 'wind' && Math.floor(t * 14) % 2) g.fillStyle(0xffffff, 0.8).fillCircle(b.x, b.y, 6 * z);
    }
    // ---- THE ROYAL RASP: a vast curved grater face hung on cables, rasp holes rushing past, shavings spraying off it
    const RS = S.rasp, W = this.W, H = this.H;
    const [h0, h1] = RS.kind === 'low' ? [0, 36] : [24, 118];
    if (RS.st === 'warn') {                                       // where it's coming from and at what height
      const a = 0.4 + 0.4 * Math.sin(t * 20), sx = RS.dir > 0 ? 0 : W;
      const band = [], n = 24;
      for (let k = 0; k <= n; k++) band.push(this.screenPos(wrap(vt + (k / n * 2 - 1) * vh), h1));
      for (let k = n; k >= 0; k--) band.push(this.screenPos(wrap(vt + (k / n * 2 - 1) * vh), h0));
      g.fillStyle(0xff2a1a, 0.12 + 0.12 * Math.sin(t * 20)).fillPoints(band, true);
      hg.fillStyle(0xff3a1a, a).fillTriangle(sx + (RS.dir > 0 ? 8 : -8), H * 0.5, sx + (RS.dir > 0 ? 44 : -44), H * 0.5 - 30, sx + (RS.dir > 0 ? 44 : -44), H * 0.5 + 30);
      if (!this.ppWarnTxt) this.ppWarnTxt = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '12px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 4 }).setOrigin(0.5).setDepth(20);
      this.ppWarnTxt.setVisible(true).setText(RS.kind === 'low' ? 'JUMP!' : 'DUCK!').setPosition(RS.dir > 0 ? 80 : W - 80, H * 0.5 - 44).setAlpha(0.6 + 0.4 * Math.sin(t * 20));
    } else if (this.ppWarnTxt) this.ppWarnTxt.setVisible(false);
    if (RS.st === 'pass' && inView(RS.theta)) {
      const half = 150 / R, n = 18, top = [], bot = [];
      for (let k = 0; k <= n; k++) { const th = wrap(RS.theta + (k / n * 2 - 1) * half); top.push(this.screenPos(th, h1)); bot.unshift(this.screenPos(th, h0)); }
      g.fillStyle(0x1a1020, 1).fillPoints(top.concat(bot), true);
      const inner = []; for (let k = 0; k <= n; k++) inner.push(this.screenPos(wrap(RS.theta + (k / n * 2 - 1) * half * 0.98), h1 - 3)); for (let k = n; k >= 0; k--) inner.push(this.screenPos(wrap(RS.theta + (k / n * 2 - 1) * half * 0.98), h0 + 3));
      g.fillStyle(0x9aa4b4, 1).fillPoints(inner, true);
      g.lineStyle(3 * z, 0xeef4ff, 1).strokePoints(top.slice(1, -1), false);
      const rows = RS.kind === 'low' ? 2 : 5, scroll = (t * 600) % 26;
      for (let r = 0; r < rows; r++) for (let x = -150 + scroll + (r % 2) * 13; x < 150; x += 26) {         // the rasp holes, rushing past
        const th = wrap(RS.theta + x / R), hh = h0 + 8 + r * ((h1 - h0 - 16) / Math.max(1, rows - 1)), p = this.screenPos(th, hh);
        g.fillStyle(0x2a2e38, 1).fillEllipse(p.x, p.y, 9 * z, 5 * z); g.fillStyle(0xffffff, 0.9).fillRect(p.x - 4 * z, p.y - 3.5 * z, 8 * z, 1.4 * z);
      }
      for (const sd of [-1, 1]) {                                  // cables up to the mining ship
        const a = this.screenPos(wrap(RS.theta + sd * half * 0.85), h1), b = this.screenPos(wrap(RS.theta + sd * half * 0.5), 700);
        g.lineStyle(5 * z, 0x1a1020, 1).lineBetween(a.x, a.y, b.x, b.y); g.lineStyle(2 * z, 0x8a94a6, 1).lineBetween(a.x, a.y, b.x, b.y);
      }
      const lead = wrap(RS.theta + RS.dir * half);                // the cutting edge: sparks and parmesan shavings spraying off
      for (let k = 0; k < 6; k++) { const q = this.screenPos(wrap(lead - RS.dir * rnd(0, 40) / R), rnd(h0, h1)); g.fillStyle(k % 2 ? 0xfff4c0 : 0xffd23f, 0.9).fillEllipse(q.x, q.y, rnd(4, 10) * z, rnd(2, 4) * z); }
      if (Math.random() < 0.5) this.burst(wrap(RS.theta - RS.dir * half), rnd(h0, h1), 'crumb', 2, 0.6);
    }
  },
};
