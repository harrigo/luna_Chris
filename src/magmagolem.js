// ================================================================= THE MOZZARELLA MAGMA-GOLEM (v3.62)
// The boss of Mount Mozzarella, rebuilt as a WALKING VOLCANO: a mound of molten cheese with a smoking crater for a
// crown, lava running down him, and a rig of separate parts so he moves properly:
//   legs    two fat bendy legs (ropes, like Chris's limbs) on great slab feet that are PLANTED on the crust. He walks by
//           really stepping: a foot lifts, swings ahead and thuds down, and the mound sags onto it.
//   arms    bendy, dripping, with boulder fists: they swing as he lumbers, haul back and hurl for the lob, go up
//           overhead and SLAM for the pound, and fling wide when he roars.
//   drips   cheese forever gathering under his fists and the hem of the mound, stretching, and falling off.
//   crater  smokes all the time, and spits fire when he's about to do something.
//
// His moves (v3.62): the stream of little globs is gone.
//   LOB     hurls two (three when boiling over) big lava bombs; a ring marks where each will land.
//   POUND   fists up... SLAM: a shockwave along the crust each way, and it sets off a MAD ERUPTION (see mozz.js):
//           the whole carpet of landing rings is shown a good two seconds ahead, with a gap in it to stand in.
//   WAVE    he rears back and heaves ONE great rolling wave of molten cheese along the ground. Jump it.
// Three crust plates still soak shots until they're broken off; below half health he boils over and speeds up.
//
// Mixed into Level1 after MozzMixin (main.js). Per-boss state in e.mgS; the rig in e.mgS.rig.

const MG = {
  plates: [{ key: 'mg_crust0', off: [0, -50], r: 26 }, { key: 'mg_crust1', off: [-46, -10], r: 24 }, { key: 'mg_crust2', off: [8, 26], r: 28 }],
  core: [0, 22],
  mouth: [0, -8],
  crater: [0, -58],
  footH: 96,                // his centre's height when he stands on the crust (texture half-height x scale)
  hip: [26, 34], shoulder: [42, -8], legLen: 21, armLen: 30
};

function makeMagmaGolemTextures(scene) {
  if (scene.textures.exists('mg_leg')) return;
  const MOL = [0xfff6d0, 0xffc25a, 0xd0601a], CR = [0x7a4422, 0x40200e, 0x1c0c06], DARK = 0x2a0804, EYE = [0xffffd0, 0xff8a1a, 0xc02a0a], HOT = [0xfff6d0, 0xffb040, 0xe0501a];
  const STREAMS = [[[66, 11], [62, 24], [54, 40], [50, 58]], [[86, 11], [92, 26], [100, 44], [104, 62]], [[75, 13], [76, 24]]];
  const CRACKS = [[[60, 76], [66, 86], [62, 98]], [[96, 74], [90, 86], [96, 98], [92, 106]], [[34, 72], [28, 86]], [[118, 72], [126, 84]]];
  const noInk = g => { for (let i = 0; i < g.length; i++) if (g[i] === 0x1a1020) g[i] = -1; };
  // ---- the mound: body and head in one, no limbs (they're separate parts now)
  const body = (key, gape) => pixSprite(scene, key, 150, 132, p => {
    for (const [x, y, rx, ry] of [[26, 106, 10, 9], [44, 112, 11, 10], [64, 110, 10, 11], [86, 113, 12, 10], [106, 110, 11, 10], [124, 105, 10, 9]]) p.ell(x, y, rx, ry, MOL);   // a hem of gathering drips
    p.poly([[18, 106], [12, 88], [20, 66], [34, 46], [48, 26], [58, 10], [92, 10], [102, 26], [116, 46], [130, 66], [138, 88], [132, 106], [75, 114]], MOL);   // the mound
    p.ell(28, 58, 15, 13, MOL); p.ell(122, 58, 15, 13, MOL);                                                        // shoulders
    p.poly([[50, 26], [58, 8], [92, 8], [100, 26], [94, 32], [86, 26], [78, 34], [70, 27], [62, 33], [56, 27]], CR);   // charred crust round the crater, lava breaking through it
    for (const [x, y] of [[60, 16], [88, 14], [72, 22], [92, 24]]) p.px(x, y, 0xff7a1a);
    p.ell(75, 9, 15, 4.5, [0xffffd0, 0xffa030, 0xe0401a]);                                                           // the crater
    for (const pts of STREAMS) { p.line(pts, 0xff7a1a, 3); p.line(pts, 0xffe080, 1); const e = pts[pts.length - 1]; p.ell(e[0], e[1] + 1, 3, 3, HOT); }   // lava running down from it
    for (const [x, y, r] of [[44, 78, 4], [106, 96, 5], [62, 104, 3], [114, 76, 3], [36, 98, 3], [84, 108, 3], [24, 86, 2], [128, 92, 3]]) p.ell(x, y, r, r * 0.8, [0x8a3a14, 0x5a2008, 0x2a0c04]);   // charred spots
    for (const pts of CRACKS) p.line(pts, 0xff6a1a, 1);
    for (const [x, y] of [[40, 60], [112, 56], [70, 96], [54, 88], [100, 84]]) p.ell(x, y, 2, 1.5, 0xffffff);          // bubbles on the cheese
    p.poly([[48, 30], [68, 38], [66, 42], [46, 35]], DARK); p.poly([[102, 30], [82, 38], [84, 42], [104, 35]], DARK); // furious brows
    p.ell(59, 44, 6, 4.5, DARK); p.ell(91, 44, 6, 4.5, DARK); p.ell(59, 44.5, 4, 3, EYE); p.ell(91, 44.5, 4, 3, EYE);  // burning eyes, deep set
    const my = 58 + gape * 0.5;
    p.ell(75, my, 19 + gape * 0.4, 8 + gape, DARK); p.ell(75, my + 3 + gape * 0.5, 11 + gape * 0.4, 4 + gape * 0.5, [0xffe080, 0xff7a1a, 0xc02a0a]);   // the maw, glowing inside
    for (const x of [61, 68, 75, 82, 89]) p.poly([[x - 2.5, my - 7 - gape * 0.8], [x + 2.5, my - 7 - gape * 0.8], [x, my - 1 - gape * 0.8]], 0xfff8e8);
    for (const x of [65, 75, 85]) p.poly([[x - 2.5, my + 7 + gape * 0.9], [x + 2.5, my + 7 + gape * 0.9], [x, my + 2 + gape * 0.9]], 0xfff8e8);
  });
  body('magmagolem', 0); body('magmagolem_roar', 8);
  // the lava on its own, to glow and pulse over the mound
  pixSprite(scene, 'mg_veins', 150, 132, p => {
    p.ell(75, 9, 14, 4, 0xffa030); p.ell(75, 9, 9, 2.5, 0xffe9a0);
    for (const pts of STREAMS) { p.line(pts, 0xc8501a, 3); p.line(pts, 0xffd070, 1); }
    for (const pts of CRACKS) p.line(pts, 0xc8501a, 1);
    p.ell(59, 44.5, 4, 3, 0xff8a1a); p.ell(91, 44.5, 4, 3, 0xff8a1a);
  }, 1, noInk);
  // ---- limbs: long sprites that are bent along a curve (see LIMB in chris.js). Top of the sprite = the limb's left-hand side
  const tube = (key, w, h, cy, R, extra) => pixSprite(scene, key, w, h, p => {
    for (let x = 0; x < w; x++) { const r = R(x);
      for (let y = Math.ceil(cy - r - 0.5); y <= Math.floor(cy + r - 0.5); y++) { const k = (y + 0.5 - cy) / r; p.px(x, y, k < -0.55 ? MOL[0] : k > 0.3 ? MOL[2] : MOL[1]); } }
    if (extra) extra(p);
  });
  tube('mg_leg', 48, 30, 14.5, x => 12.5 - 2.6 * Math.sin(x / 48 * Math.PI) + Math.sin(x * 0.55) * 0.9, p => {
    p.ell(14, 17, 3, 2.4, [0x8a3a14, 0x5a2008, 0x2a0c04]); p.ell(36, 12, 2.5, 2, [0x8a3a14, 0x5a2008, 0x2a0c04]); p.line([[22, 8], [26, 13], [23, 19]], 0xff6a1a); p.ell(30, 20, 1.6, 1.2, 0xffffff);
  });
  tube('mg_arm', 60, 34, 12.5, x => x < 40 ? 11 - 3.6 * Math.sin(x / 40 * Math.PI * 0.5) : 7.4 + 3.4 * Math.sin((x - 40) / 20 * Math.PI * 0.6), p => {
    for (const [x, l] of [[12, 5], [27, 8], [43, 6], [52, 4]]) { p.line([[x, 21], [x, 21 + l]], MOL[1], 2); p.ell(x, 22 + l, 2, 2, HOT); }                    // cheese hanging off the underside
    p.ell(20, 12, 2.6, 2, [0x8a3a14, 0x5a2008, 0x2a0c04]); p.line([[34, 7], [38, 12]], 0xff6a1a); p.ell(48, 9, 1.6, 1.2, 0xffffff);
  });
  pixSprite(scene, 'mg_foot', 48, 26, p => {                           // a great slab of a foot: three lumpy toes, a charred sole, flat on the crust
    p.ell(22, 13, 19, 10, MOL); p.ell(37, 15, 9, 8, MOL); p.ell(30, 17, 7, 7, MOL); p.ell(9, 16, 8, 7, MOL);
    p.rect(3, 21, 45, 23, MOL[2]); p.rect(2, 23, 46, 24, 0x5a2008);
    for (const x of [8, 16, 26, 34, 42]) p.px(x, 24, 0xff7a1a);
    p.line([[30, 9], [33, 14]], 0xff6a1a); p.ell(14, 10, 2, 1.5, [0x8a3a14, 0x5a2008, 0x2a0c04]); p.ell(38, 11, 1.6, 1.2, 0xffffff);
  });
  pixSprite(scene, 'mg_fist', 40, 38, p => {                           // a boulder of a fist: knuckle lumps, scorch marks
    p.ell(18, 19, 15, 15, MOL); p.ell(29, 10, 7, 6, MOL); p.ell(33, 19, 6.5, 6, MOL); p.ell(29, 28, 7, 6, MOL); p.ell(9, 28, 6, 6, MOL);
    p.ell(14, 14, 3, 2.4, [0x8a3a14, 0x5a2008, 0x2a0c04]); p.ell(22, 26, 2.4, 2, [0x8a3a14, 0x5a2008, 0x2a0c04]); p.line([[20, 9], [24, 15], [21, 21]], 0xff6a1a);
    p.line([[26, 14], [30, 15]], MOL[2]); p.line([[26, 23], [30, 23]], MOL[2]); p.ell(10, 10, 2, 1.5, 0xffffff);
  });
  pixSprite(scene, 'mg_drip', 8, 16, p => { p.rect(3, 0, 4, 9, MOL[1]); p.rect(3, 0, 3, 9, MOL[0]); p.ell(4, 11, 2.8, 3.4, HOT); });
  pixSprite(scene, 'mg_bomb', 26, 26, p => { p.ell(13, 13, 11, 11, [0xfff6d0, 0xffa030, 0xc8380e]); p.ell(9, 9, 3, 2.4, 0xffffff); p.ell(17, 16, 3, 2.4, [0x8a3a14, 0x5a2008, 0x2a0c04]); p.ell(11, 18, 2, 1.6, [0x8a3a14, 0x5a2008, 0x2a0c04]); });
}

const MagmaMixin = {
  mgInit(e) {
    const z = this.mz || this.mzInit(), dp = e.spr.depth || 6;
    const S = e.mgS = { st: 'walk', t: 0, cd: 2.5, i: 0, p2: false, lean: 0, mouth: 0 };
    S.plates = MG.plates.map(q => ({ key: q.key, off: q.off, r: q.r, hp: 12, im: this.add.image(0, 0, q.key).setDepth(dp + 0.03) }));
    S.core = this.add.image(0, 0, 'mg_core').setDepth(dp + 0.01).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
    z.boss = e; e.mmLock = true; e.h = MG.footH; e.side = 1;
    // ---- the rig
    const webgl = this.game.renderer.type === Phaser.WEBGL;
    const limb = (key, n, d) => { const o = webgl ? this.add.rope(0, 0, key, null, n, true) : this.add.image(0, 0, key).setOrigin(0, 0.5); o.limbN = n; o.isRope = webgl; return o.setDepth(d); };
    const G = S.rig = { t: 0, sq: 0, sqv: 0, bob: 0, lastTh: e.theta, vel: 0, smokeT: 0, wph: 0, flare: 0 };
    G.halo = this.textures.exists('halo') ? this.add.image(0, 0, 'halo').setDepth(dp - 0.06).setBlendMode(Phaser.BlendModes.ADD).setTint(0xff7a1a) : null;
    G.veins = this.add.image(0, 0, 'mg_veins').setDepth(dp + 0.005).setBlendMode(Phaser.BlendModes.ADD);
    G.legs = [-1, 1].map(s => ({ s, rope: limb('mg_leg', 9, dp - 0.04), foot: this.add.image(0, 0, 'mg_foot').setOrigin(0.5, 0.94).setDepth(dp - 0.03), th: wrap(e.theta + s * MG.hip[0] * 1.25 / R), lift: 0, step: null }));
    G.arms = [-1, 1].map(s => ({ s, rope: limb('mg_arm', 11, dp + 0.035), fist: this.add.image(0, 0, 'mg_fist').setDepth(dp + 0.04), x: s * 58, y: 30, vx: 0, vy: 0 }));
    G.drips = [{ arm: 0 }, { arm: 1 }, { at: [-30, 46] }, { at: [30, 48] }, { at: [0, 50] }, { at: [-52, 14] }, { at: [54, 12] }, { at: [-14, 50] }, { at: [16, 50] }]
      .map(d => Object.assign(d, { im: this.add.image(0, 0, 'mg_drip').setOrigin(0.5, 0).setDepth(dp + 0.045).setVisible(false), t: 0, wait: rnd(0.2, 2.4), T: rnd(0.7, 1.3) }));
    return S;
  },

  mgAI(e, dt, P, phase2) {
    const S = e.mgS || this.mgInit(e), G = S.rig;
    S.t += dt; S.mouth = Math.max(0, S.mouth - dt); S.walking = false;
    const d = angDiff(P.theta, e.theta);
    if (phase2 && !S.p2) {                                                      // BOILING OVER
      S.p2 = true; S.st = 'roar'; S.t = 0;
      for (const pl of S.plates) if (pl.hp > 0) this.mgBreak(e, pl, true);
      e.baseTint = 0xffd0a0; e.spr.setTint(e.baseTint);
      this.banner('HE\'S BOILING OVER!'); Sound.sfx('crash'); Sound.sfx('boom'); this.cameras.main.shake(500, 0.016);
    }
    const walk = (spd) => {                                                     // lumber after Chris, keeping a little way off
      const want = wrap(P.theta - Math.sign(d || 1) * 150 / R), dd = angDiff(want, e.theta);
      e.theta = wrap(e.theta + Math.sign(dd) * Math.min(Math.abs(dd), spd / R * dt));
      e.dir = Math.sign(d) || 1; S.walking = true;
    };
    e.h = MG.footH + G.bob;                                                     // (the rig's legs carry him: see mgRig)
    switch (S.st) {
      case 'walk': {
        walk(S.p2 ? 85 : 55);
        S.cd -= dt;
        if (S.cd <= 0) {
          const seq = S.p2 ? ['pound', 'wave', 'lob', 'wave', 'pound', 'lob'] : ['lob', 'pound', 'wave', 'lob', 'wave', 'pound'];
          S.st = seq[S.i++ % seq.length]; S.t = 0; S.n = 0; e.dir = Math.sign(d) || 1;
        }
        break;
      }
      case 'lob': {                                                             // hauls back and HURLS big lava bombs; a ring shows where each will land
        const gap = 0.45, n = S.p2 ? 3 : 2;
        S.lean = -0.16 * Math.min(1, S.t / 0.5);
        if (S.t > 0.7 && S.n < n && S.t > 0.7 + S.n * gap) {
          const dir = e.dir || 1, hand = this.mPt(e, dir * 84, -8), T = 1.15, gv = 700, k = Settings.dk.shot;
          const tx = angDiff(P.theta, hand.theta) * R + rnd(-40, 40) + (P.vx || 0) * 0.3 + S.n * dir * -46;
          const vt = tx / T, vh = (0 - hand.h + 0.5 * gv * T * T) / T;
          const b = this.addEBullet('mg_bomb', hand.theta, hand.h, vt, vh, 13, 3.5);
          b.grav = gv; b.lava = true; b.spinV = 5; S.n++; Sound.sfx('fan'); G.sqv -= 1.5;
          const T2 = (vh * k + Math.sqrt(vh * vh * k * k + 2 * gv * hand.h)) / gv;      // (shot speed scales with the difficulty: work out where it really lands)
          this.mz.rings.push({ theta: wrap(hand.theta + vt * k * T2 / R), t: T2, max: T2 });
        }
        if (S.t > 0.9 + n * gap) { S.lean = 0; this.mgWalk(e); }
        break;
      }
      case 'pound': {                                                           // fists up... SLAM: shockwaves, and the volcano goes MAD
        if (S.t < 0.8) { e.theta = wrap(e.theta + Math.sin(S.t * 60) * 1.2 / R); S.lean = 0.06; G.flare = 1; }
        else if (!S.n) {
          S.n = 1; S.lean = -0.05; G.sqv += 6;
          Sound.sfx('churnclang'); Sound.sfx('boom'); buzz([60, 30, 100]); this.cameras.main.shake(380, 0.02); this.camPunch(0.05); this.hitStop = 0.06;
          this.burst(e.theta, 6, 'crumb', 22, 1.6); this.bang(e.theta, 8, 40);
          for (const sd of [-1, 1]) this.addEBullet('crumb', wrap(e.theta + sd * 70 / R), 10, sd * 270, 0, 11, 2.6);
          this.mozzErupt(true);
        }
        if (S.t > 1.9) { S.lean = 0; this.mgWalk(e); }
        break;
      }
      case 'wave': {                                                            // rears back, then heaves ONE great rolling wave of molten cheese along the crust: JUMP it
        const dir = e.dir || 1, tell = 0.8;
        if (S.t < 0.05 && !this.mgWaveTip) { this.mgWaveTip = true; this.banner('JUMP THE LAVA WAVE!'); }
        if (S.t < tell) { S.mouth = 0.2; S.lean = -0.2 * Math.min(1, S.t / 0.4); G.flare = 0.6; if (Math.random() < 0.5) { const m = this.mPt(e, MG.mouth[0], MG.mouth[1]); this.burst(m.theta, m.h, 'spark', 1, 0.3); } }
        else if (S.n < (S.p2 ? 2 : 1) && S.t > tell + S.n * 0.7) {
          S.mouth = 0.5; S.lean = 0.16; G.sqv += 3;
          this.mozzWave(wrap(e.theta + dir * 62 / R), dir, S.n ? 330 : (S.p2 ? 290 : 250));
          S.n++; Sound.sfx('whoosh'); Sound.sfx('hiss'); this.cameras.main.shake(160, 0.008);
        }
        if (S.t > tell + (S.p2 ? 1.5 : 0.9)) { S.lean = 0; this.mgWalk(e); }
        break;
      }
      case 'grab': {                                                            // he caught Chris on his head: hoisted overhead... and THROWN
        const hold = this.mPt(e, 0, -96);
        P.theta = hold.theta; P.h = Math.max(0, hold.h + Math.sin(S.t * 40) * 2); P.vh = 0; P.vx = 0; P.invuln = Math.max(P.invuln, 0.2);
        e.theta = wrap(e.theta + Math.sin(S.t * 50) * 1 / R);
        if (S.t > 0.25 && !S.n) { S.n = 1; Sound.sfx('boom'); }
        if (S.t > 0.95) {
          const dir = (Math.sign(angDiff(P.theta, e.theta)) || S.throwDir || 1);
          P.invuln = 0; this.hurt(); P.vx = dir * 520; P.vh = 520; P.jetArmed = false; P.h = Math.max(P.h, hold.h);
          this.cameras.main.shake(220, 0.012); Sound.sfx('whoosh'); buzz([40, 20, 80]); this.popup(P.theta, P.h + 40, 'YEEEET!', '#ff8a3a', true);
          this.mgWalk(e, 1.2);
        }
        break;
      }
      case 'roar': {
        S.mouth = 0.2; G.flare = 1; e.theta = wrap(e.theta + Math.sin(S.t * 70) * 2 / R);
        if (S.t > 1.4) { S.i = 0; this.mgWalk(e, 0.4); }
        break;
      }
    }
  },
  // landing on his head: no free stomp - he grabs you
  mgGrab(e) {
    const S = e.mgS; if (!S || S.st === 'grab' || S.st === 'roar') return false;
    S.st = 'grab'; S.t = 0; S.n = 0; S.lean = 0; S.throwDir = this.pl.facing || 1;
    Sound.sfx('squelch'); this.cameras.main.shake(120, 0.008);
    if (!this.mgGrabTip) { this.mgGrabTip = true; this.banner('GRABBED! DON\'T JUMP ON HIS HEAD!'); }
    return true;
  },
  mgWalk(e, cd) { const S = e.mgS; S.st = 'walk'; S.t = 0; S.cd = cd !== undefined ? cd : (S.p2 ? rnd(0.9, 1.4) : rnd(1.4, 2)); S.lean = 0; },
  mgBreak(e, pl, quiet) {
    pl.hp = 0;
    const w = this.mPt(e, pl.off[0], pl.off[1]);
    for (let k = 0; k < 10; k++) { const im = this.add.image(0, 0, 'db_rock').setDepth(6.2).setTint(0x3a1e0e); im.bsx = im.bsy = rnd(0.8, 1.6); this.parts.push({ theta: w.theta, h: w.h, vt: rnd(-220, 220), vh: rnd(80, 320), life: rnd(0.6, 1.1), spr: im, rot: 0, rv: rnd(-10, 10) }); }
    this.burst(w.theta, w.h, 'spark', 10, 1); Sound.sfx('crash');
    if (pl.im) { pl.im.destroy(); pl.im = null; }
    const left = e.mgS.plates.filter(q => q.hp > 0).length;
    if (!quiet) this.banner(left ? 'CRUST CRACKED! ' + left + ' TO GO' : 'CORE EXPOSED!\nBLAST IT!');
  },
  // where a shot landed: a crust plate soaks it (and chips away); once they're gone the core takes the lot
  mgHitK(e, th, h) {
    const S = e.mgS; if (!S) return 1;
    const alive = S.plates.filter(q => q.hp > 0);
    if (!alive.length) return 1.25;
    if (th === undefined) return 0.3;
    for (const pl of alive) {
      const w = this.mPt(e, pl.off[0], pl.off[1]);
      if (dist2(th, h, w.theta, w.h) < (pl.r * 1.25 + 8) * (pl.r * 1.25 + 8)) {
        pl.hp -= 1; pl.flash = 0.06;
        this.burst(th, h, 'crumb', 2, 0.5);
        if (pl.hp <= 0) this.mgBreak(e, pl);
        return 0.15;
      }
    }
    return 0.3;
  },
  mgOnHit(e, th, h) {
    const S = e.mgS; if (!S) return;
    if (!S.plates.some(q => q.hp > 0)) { for (let k = 0; k < 2; k++) { const s = this.add.image(0, 0, 'mg_glob').setDepth(6.2); s.bsx = s.bsy = rnd(0.3, 0.6); this.parts.push({ theta: th, h, vt: rnd(-150, 150), vh: rnd(60, 220), life: 0.4, spr: s, rot: 0, rv: 0 }); } }
    if (S.rig) S.rig.sqv += 0.8;                                                 // he wobbles when he's hit
    if (!(S.hsT > this.t)) { S.hsT = this.t + 0.14; this.hitStop = Math.max(this.hitStop || 0, 0.02); }
  },

  // ---- where each fist wants to be (in his own space: x right, y down, from his middle), and how hard the arm snaps there
  mgArmGoal(e, S, G, s) {
    const t = G.t, dir = e.dir || 1, st = S.st, shake = Math.sin(t * 55 + s) * 2;
    if (st === 'pound') {
      if (S.t < 0.8) return [s * 34, -98 + shake - 6 * Math.min(1, S.t / 0.5), 160];
      if (S.t < 1.35) return [s * 50, 60, 900];                                // SLAM
    }
    if (st === 'grab') return [s * 20, -92 + shake * 0.5, 300];
    if (st === 'roar') return [s * 74, -44 + shake, 200];
    if (st === 'wave') return S.t < 0.8 ? [s * 72, -34 - 10 * Math.min(1, S.t / 0.5), 140] : [s * 64, 26, 500];   // flung back, then heaved down and forward
    if (st === 'lob') {
      if (s !== dir) return [s * 56, 36, 140];                                 // the other arm braces
      if (S.t < 0.7) return [s * 50, -84 * Math.min(1, S.t / 0.45), 160];       // haul back
      const u = ((S.t - 0.7) / 0.45) % 1;
      return u < 0.4 ? [s * 86, -8, 700] : [s * 50, -84, 220];                  // HURL, then back up for the next
    }
    const sw = S.walking ? Math.sin(G.wph) : 0;                                 // lumbering: the arms swing against the legs
    return [s * 58 - s * Math.abs(sw) * 3, 30 + s * sw * 9 + Math.sin(t * 2.2 + s) * 2, 110];
  },

  // ---- the rig: step the feet, spring the arms, drip, smoke. Called from mgDraw every frame
  mgRig(e, S, dt) {
    const G = S.rig, k = e.spr.bsx || 1.25, z = this.zoom, sc = k * z, P = this.pl, rot = e.spr.rotation, fast = S.p2 ? 1.35 : 1;
    const play = this.state === 'play' && !this.paused && dt > 0;
    if (play) {
      G.t += dt;
      G.vel += (angDiff(e.theta, G.lastTh) * R / dt - G.vel) * Math.min(1, dt * 8); G.lastTh = e.theta;
      // FEET: each is planted on the crust. When the mound has moved far enough off one, it lifts, swings ahead and thuds down
      const vdir = Math.abs(G.vel) > 8 ? Math.sign(G.vel) : 0;
      for (const L of G.legs) {
        const other = G.legs[L.s < 0 ? 1 : 0], home = wrap(e.theta + L.s * MG.hip[0] * k / R), off = angDiff(L.th, home) * R;
        if (Math.abs(off) > 150) { L.th = home; L.step = null; L.lift = 0; }       // (thrown a long way: catch up)
        if (!L.step && !other.step && Math.abs(off) > (vdir ? 24 : 9)) L.step = { from: L.th, to: wrap(home + vdir * 22 / R), t: 0, T: 0.3 / fast };
        if (L.step) {
          const St = L.step; St.t += dt; const q = Math.min(1, St.t / St.T), qe = q * q * (3 - 2 * q);
          L.th = wrap(St.from + angDiff(St.to, St.from) * qe); L.lift = Math.sin(q * Math.PI) * 15 * k;
          if (q >= 1) {                                                           // THUD
            L.step = null; L.lift = 0; G.sqv += 2.4; G.wph += Math.PI;
            if (Math.abs(angDiff(L.th, P.theta)) < this.visHalf + 0.2) { this.cameras.main.shake(70, 0.0035); this.burst(L.th, 2, 'crumb', 3, 0.5); this.burst(L.th, 3, 'mg_glob', 2, 0.35); }
          }
        }
      }
      // the mound: it sags and wobbles on a spring, breathes, and sits lower when his legs are spread
      G.sqv += (-G.sq * 190 - G.sqv * 11) * dt; G.sq = Math.max(-1, Math.min(1.4, G.sq + G.sqv * dt));
      const spread = Math.abs(angDiff(G.legs[1].th, G.legs[0].th)) * R - 2 * MG.hip[0] * k;
      const rise = S.st === 'pound' && S.t < 0.8 ? 14 * Math.min(1, S.t / 0.5) : S.st === 'grab' ? 6 : 0;
      G.bob += (-Math.max(0, spread) * 0.12 + (G.legs[0].lift + G.legs[1].lift) * 0.2 - G.sq * 3 + rise - G.bob) * Math.min(1, dt * 14);
      // ARMS: sprung towards where the move wants the fists
      for (const A of G.arms) {
        const g = this.mgArmGoal(e, S, G, A.s), kk = g[2], h = Math.min(0.033, dt);
        A.vx += ((g[0] - A.x) * kk - A.vx * 2 * Math.sqrt(kk) * 0.62) * h; A.vy += ((g[1] - A.y) * kk - A.vy * 2 * Math.sqrt(kk) * 0.62) * h;
        A.x += A.vx * h; A.y += A.vy * h;
      }
      // DRIPS: gather, stretch, fall
      for (const D of G.drips) {
        if (D.wait > 0) { D.wait -= dt * fast; D.t = 0; continue; }
        D.t += dt * fast;
        if (D.t >= D.T) {
          const a = D.arm !== undefined ? [G.arms[D.arm].x, G.arms[D.arm].y + 16] : D.at, w = this.mPt(e, a[0], a[1] + 12);
          if (Math.abs(angDiff(w.theta, P.theta)) < this.visHalf + 0.2) { const im = this.add.image(0, 0, 'mg_glob').setDepth(e.spr.depth + 0.046); im.bsx = im.bsy = rnd(0.28, 0.42); this.parts.push({ theta: w.theta, h: w.h, vt: G.vel * 0.3, vh: -20, life: Math.sqrt(Math.max(0.02, w.h) / 450), spr: im, rot: 0, rv: 0 }); }
          D.wait = rnd(0.3, 1.8); D.T = rnd(0.7, 1.3);
        }
      }
      // THE CRATER: always smoking; spitting fire when he's winding something up
      G.flare = Math.max(0, G.flare - dt * 1.5); G.smokeT -= dt;
      if (G.smokeT <= 0 && e.spr.visible) {
        G.smokeT = G.flare > 0.2 ? 0.05 : 0.2;
        const c = this.mPt(e, MG.crater[0] + rnd(-8, 8), MG.crater[1]);
        if (G.flare > 0.2) { const im = this.add.image(0, 0, Math.random() < 0.5 ? 'mg_glob' : 'spark').setDepth(e.spr.depth + 0.05); im.bsx = im.bsy = rnd(0.35, 0.7); this.parts.push({ theta: c.theta, h: c.h, vt: rnd(-90, 90), vh: rnd(200, 420), life: rnd(0.5, 0.9), spr: im, rot: 0, rv: 0 }); }
        else { const im = this.add.image(0, 0, 'puff').setDepth(e.spr.depth - 0.07).setAlpha(0.4).setTint(Math.random() < 0.3 ? 0xffa050 : 0x5a3a2a); im.bsx = im.bsy = rnd(0.25, 0.4); this.parts.push({ theta: c.theta, h: c.h, vt: rnd(-14, 14) - G.vel * 0.2, vh: rnd(40, 70), life: rnd(0.9, 1.5), noGrav: true, grow: 0.45, spr: im }); }
      }
    }
    // ---- lay it all out on screen
    const vis = e.spr.visible, al = e.spr.alpha, tinted = e.spr.isTinted, tf = e.spr.tintFill, tc = e.spr.tintTopLeft;
    const dress = o => { o.setVisible(vis).setAlpha(al); if (o.isRope) { o.setColors(tinted ? tc : 0xffffff); o.tintFill = !!(tinted && tf); } else if (tinted) { o.setTint(tc); o.tintFill = tf; } else o.clearTint(); };
    const bend = ChrisRig.prototype.bendLimb, joint = ChrisRig.prototype.limbJoint;
    e.spr.sqx = 1 + 0.07 * G.sq + Math.sin(G.t * 2.2) * 0.012; e.spr.sqy = 1 - 0.07 * G.sq - Math.sin(G.t * 2.2) * 0.012;
    for (const L of G.legs) {
      const hp = this.mScreen(e, [L.s * MG.hip[0], MG.hip[1]]), fd = angDiff(L.th, this.viewT()), fp = this.screenPos(L.th, L.lift), ak = this.screenPos(L.th, L.lift + 15 * k);
      L.foot.setPosition(fp.x, fp.y).setRotation(fd - (L.step ? L.s * 0 + Math.sin(L.step.t / L.step.T * Math.PI) * 0.25 * Math.sign(angDiff(L.step.to, L.step.from) || 1) : 0)).setScale(sc * L.s, sc); dress(L.foot);
      const A = [hp.x / sc, hp.y / sc], B = [ak.x / sc, ak.y / sc];
      L.rope.setScale(L.rope.isRope ? sc : 1); if (!L.rope.isRope) { A[0] *= sc; A[1] *= sc; B[0] *= sc; B[1] *= sc; }
      bend(L.rope, A, joint(A, B, MG.legLen * (L.rope.isRope ? 1 : sc), MG.legLen * (L.rope.isRope ? 1 : sc), L.s < 0 ? 1 : -1), B, 0, 4); dress(L.rope);
    }
    for (const A of G.arms) {
      const sp = this.mScreen(e, [A.s * MG.shoulder[0], MG.shoulder[1]]), fp = this.mScreen(e, [A.x, A.y]);
      const a = [sp.x / sc, sp.y / sc], b = [fp.x / sc, fp.y / sc], rp = A.rope.isRope;
      A.rope.setScale(rp ? sc : 1); if (!rp) { a[0] *= sc; a[1] *= sc; b[0] *= sc; b[1] *= sc; }
      const up = A.y < -30;                                                    // arm raised: the elbow goes out sideways; hanging: out and down
      bend(A.rope, a, joint(a, b, MG.armLen * (rp ? 1 : sc), MG.armLen * (rp ? 1 : sc), (A.s < 0 ? 1 : -1) * (up ? -1 : 1)), b, 0, 5); dress(A.rope);
      A.fist.setPosition(fp.x, fp.y).setRotation(rot + A.s * (up ? -0.9 : 0.25)).setScale(sc * A.s, sc); dress(A.fist);
    }
    for (const D of G.drips) {
      const on = vis && D.wait <= 0, a = D.arm !== undefined ? [G.arms[D.arm].x, G.arms[D.arm].y + 16] : D.at;
      D.im.setVisible(on); if (!on) continue;
      const p = this.mScreen(e, a), g = Math.min(1, D.t / D.T);
      D.im.setPosition(p.x, p.y).setRotation(rot).setScale(sc * (1.1 - 0.3 * g), sc * (0.15 + 1.25 * g * g)).setAlpha(al);
    }
    const hot = (S.p2 ? 0.3 : 0) + G.flare * 0.4;
    G.veins.setPosition(e.spr.x, e.spr.y).setRotation(rot).setScale(e.spr.scaleX, e.spr.scaleY).setVisible(vis).setAlpha(Math.min(1, 0.4 + 0.25 * Math.sin(G.t * 3) + hot));
    if (G.halo) G.halo.setPosition(e.spr.x, e.spr.y).setScale(sc * (2.2 + 0.2 * Math.sin(G.t * 2.4) + hot)).setVisible(vis).setAlpha(0.22 + 0.06 * Math.sin(G.t * 2.4) + hot * 0.3);
  },

  mgDraw(e) {
    const S = e.mgS; if (!S) return;
    const vis = e.spr.visible, rot = e.spr.rotation, dt = this.lastDt || 0.016;
    e.spr.setRotation(rot + (S.lean || 0) * (e.dir || 1));
    const fr = S.mouth > 0 || S.st === 'roar' ? 'magmagolem_roar' : 'magmagolem';
    if (e.spr.texture.key !== fr) e.spr.setTexture(fr);
    if (S.rig) this.mgRig(e, S, dt);
    const sx = e.spr.scaleX, sy = e.spr.scaleY;
    for (const pl of S.plates) if (pl.im) {
      const p = this.mScreen(e, pl.off); pl.flash = Math.max(0, (pl.flash || 0) - dt);
      pl.im.setPosition(p.x, p.y).setRotation(e.spr.rotation).setScale(sx, sy).setVisible(vis);
      if (pl.flash > 0) pl.im.setTintFill(0xffffff); else pl.im.clearTint();
    }
    const exposed = !S.plates.some(q => q.hp > 0), c = this.mScreen(e, MG.core);
    S.core.setPosition(c.x, c.y).setScale(sx * (1 + 0.15 * Math.sin(this.t * 8)), sy * (1 + 0.15 * Math.sin(this.t * 8))).setVisible(vis).setAlpha(exposed ? 0.85 : 0);
    const gl = this.mz.gl;
    if (S.mouth > 0 && vis) { const m = this.mScreen(e, MG.mouth); gl.fillStyle(0xffa030, 0.35 + 0.2 * Math.random()).fillCircle(m.x, m.y, 16 * this.zoom); }
  },
  mgParts(e) {
    const S = e.mgS; if (!S) return;
    for (const pl of S.plates) if (pl.im) pl.im.destroy();
    if (S.core) S.core.destroy();
    const G = S.rig;
    if (G) { for (const L of G.legs) { L.rope.destroy(); L.foot.destroy(); } for (const A of G.arms) { A.rope.destroy(); A.fist.destroy(); } for (const D of G.drips) D.im.destroy(); G.veins.destroy(); if (G.halo) G.halo.destroy(); S.rig = null; }
    S.plates = []; S.core = null;
    if (this.mz) { this.mz.rings = []; this.mz.puddles = []; this.mz.waves = []; }
  }
};
