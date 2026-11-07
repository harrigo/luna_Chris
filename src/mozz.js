// LEVEL 4: MOUNT MOZZARELLA - "the Pizza Inferno". A charred pizza-crust planet with white-hot mozzarella pools,
// marinara geysers and a volcano on the horizon that keeps erupting.
//
//  VOLCANO       every 8-12 s (and whenever the boss pounds the ground) the volcano behind the horizon erupts: the
//                crater flares, lava spits into the sky, and 1-3 pepperoni-crust BOULDERS come bouncing in over the curve
//                and roll at you. Jump them, or shoot them to bits (3 hits).
//  MARINARA      the geysers spew boiling marinara: blobs fly up and rain back down round the vent.
//  ANCHOVY SWARMERS  little metal fish in a shoal of five that circles round a point drifting after you, snapping;
//                every couple of seconds one darts straight at you, then rejoins the shoal.
//  TOASTY OVEN DRONE  a hovering mini oven: follows you overhead, flings homing pizza-cutter wheels, and every few
//                seconds shudders and SLAMS down onto the crust, sending shockwaves along the ground both ways.
//  BOSS: THE MOZZARELLA MAGMA-GOLEM  a giant of molten cheese in charred crust armour. Three crust plates (head,
//                shoulder, belly) soak up shots; break them off to expose his core (until then the rest of him only
//                takes a third). Attacks: lobbed magma globs that leave burning puddles, a two-fisted GROUND POUND
//                (shockwaves + it sets the volcano off), and a sweeping molten-cheese BREATH. Below half he BOILS
//                OVER: any crust left blows off, he speeds up and calls down a magma rain (watch the target rings).
//
// Mixed into Level1 (see main.js); level state in this.mz.

const MG = {
  plates: [{ key: 'mg_crust0', off: [0, -50], r: 26 }, { key: 'mg_crust1', off: [-50, -20], r: 24 }, { key: 'mg_crust2', off: [8, 26], r: 28 }],
  core: [0, 2],
  mouth: [0, -24],
  footH: 82                // his centre's height when he stands on the crust (texture half-height x scale)
};

function makeMozzTextures(scene) {
  const MOL = [0xfff6d0, 0xffc25a, 0xd0601a], CR = [0x7a4422, 0x40200e, 0x1c0c06], DARK = 0x2a0804;
  const crackIt = (p, pts) => p.line(pts, 0xff6a1a, 1);
  // ---- the boss: a lumpy giant of molten mozzarella, fanged maw, burning eyes, dripping arms
  pixSprite(scene, 'magmagolem', 150, 132, p => {
    p.ell(52, 122, 17, 10, MOL); p.ell(98, 122, 17, 10, MOL);                                       // stumpy legs
    p.ell(75, 74, 52, 48, MOL);                                                                     // the body
    p.poly([[30, 50], [12, 70], [6, 86], [22, 90], [36, 72]], MOL); p.ell(14, 90, 14, 12, MOL);      // left arm and fist
    p.poly([[120, 48], [138, 60], [146, 76], [130, 80], [114, 66]], MOL); p.ell(136, 80, 14, 12, MOL);   // right arm and fist
    p.ell(75, 34, 33, 27, MOL);                                                                     // head
    for (const [x, y, r] of [[48, 70, 4], [100, 92, 5], [62, 100, 3], [110, 60, 3], [40, 96, 3], [86, 112, 3], [20, 92, 2], [132, 84, 3]]) p.ell(x, y, r, r * 0.8, [0x8a3a14, 0x5a2008, 0x2a0c04]);   // charred spots
    crackIt(p, [[60, 60], [66, 72], [62, 84]]); crackIt(p, [[96, 66], [90, 78], [96, 90], [92, 100]]); crackIt(p, [[34, 64], [26, 76]]); crackIt(p, [[118, 62], [128, 72]]);
    for (const [x, y, l] of [[10, 100, 10], [20, 100, 6], [132, 90, 12], [140, 90, 7], [56, 110, 8], [92, 116, 6], [74, 120, 9]]) { p.line([[x, y], [x, y + l]], MOL[1], 2); p.ell(x, y + l + 1, 2, 2, MOL); }   // drips
    p.poly([[50, 22], [68, 30], [66, 34], [48, 28]], DARK); p.poly([[100, 22], [82, 30], [84, 34], [102, 28]], DARK);   // furious brows
    p.ell(60, 33, 5, 4, [0xffffd0, 0xff8a1a, 0xc02a0a]); p.ell(90, 33, 5, 4, [0xffffd0, 0xff8a1a, 0xc02a0a]);     // burning eyes
    p.ell(75, 48, 18, 11, DARK); p.ell(75, 52, 11, 6, [0xffe080, 0xff7a1a, 0xc02a0a]);              // the maw, glowing inside
    for (const x of [61, 68, 75, 82, 89]) p.poly([[x - 2, 38], [x + 2, 38], [x, 44]], 0xfff8e8);    // top fangs
    for (const x of [65, 75, 85]) p.poly([[x - 2, 59], [x + 2, 59], [x, 54]], 0xfff8e8);            // bottom fangs
    for (const [x, y] of [[50, 16], [96, 14], [36, 44], [112, 40], [70, 90]]) p.ell(x, y, 2, 1.5, 0xffffff);   // bubbles on the cheese
  });
  // ---- his charred crust armour plates (break them to expose the core)
  const plate = (key, w, h, shape) => pixSprite(scene, key, w, h, p => {
    p.poly(shape, [0xb8743a, 0x6a3418, 0x2a1008]);                                                   // baked golden on top, burnt black underneath
    const r = rng(key.length * 77 + w);
    for (let k = 0; k < 9; k++) { const x = 4 + r() * (w - 8) | 0, y = 3 + r() * (h - 6) | 0; p.line([[x, y], [x + 3, y + 2], [x + 2, y + 5], [x + 5, y + 7]], 0xffa040); p.px(x + 3, y + 2, 0xfff0a0); }   // embers glowing in the cracks
    for (let k = 0; k < 10; k++) { const x = 4 + r() * (w - 8) | 0, y = 3 + r() * (h - 6) | 0; p.ell(x, y, 1.5, 1, 0x1a0804); }   // charred blisters
  });
  plate('mg_crust0', 60, 26, [[2, 24], [6, 8], [18, 2], [42, 1], [54, 8], [58, 24], [44, 18], [30, 22], [16, 18]]);   // a burnt brow-helmet
  plate('mg_crust1', 40, 36, [[2, 30], [4, 10], [16, 2], [34, 4], [38, 18], [30, 34], [14, 34]]);                     // shoulder pauldron
  plate('mg_crust2', 58, 42, [[2, 10], [14, 2], [44, 2], [56, 12], [54, 32], [40, 40], [16, 40], [4, 30]]);           // belly plate
  pixSprite(scene, 'mg_core', 26, 26, p => { p.ell(13, 13, 12, 12, [0xffffff, 0xffd060, 0xff5a1a]); p.ell(13, 13, 6, 6, 0xffffff); });
  pixSprite(scene, 'mg_glob', 16, 16, p => { p.ell(8, 8, 7, 7, [0xfff0b0, 0xffa030, 0xd04010]); p.px(5, 5, 0xffffff); p.px(6, 5, 0xffffff); });
  // ---- the level's own bits
  pixSprite(scene, 'boulder', 28, 28, p => {                                                     // a pepperoni-crust boulder
    p.ell(14, 14, 13, 13, [0xd08a40, 0x8a4a1c, 0x4a2008]);
    for (const [x, y] of [[9, 9], [19, 12], [11, 20], [20, 20]]) { p.ell(x, y, 3.5, 3.5, [0xff7a6a, 0xd0301a, 0x8a1a10]); p.px(x - 1, y - 1, 0xffb0a0); }
    p.line([[5, 15], [9, 14]], 0xff8a2a); p.line([[16, 5], [18, 8]], 0xff8a2a);
  });
  pixSprite(scene, 'marinara', 12, 12, p => { p.ell(6, 6, 5, 5, [0xff7a5a, 0xd8200e, 0x7a0a06]); p.px(4, 4, 0xffd0c0); p.px(8, 7, 0xffc040); });
  const fish = (key, open) => pixSprite(scene, key, 30, 12, p => {                                // a tin anchovy: metal fish with scissor jaws
    const ST = [0xf0f6ff, 0x9aa8c0, 0x4a5468];
    p.poly([[4, 6], [10, 2], [22, 2], [26, 5], [22, 9], [10, 10]], ST);
    p.poly([[0, 1], [5, 6], [0, 11]], ST);                                                        // tail
    for (const x of [10, 14, 18]) p.line([[x, 3], [x, 9]], 0x6a7488);                             // rivets / scales
    p.px(22, 4, 0xff3a3a);                                                                        // red eye
    if (open) { p.line([[25, 5], [29, 2]], ST[1], 1); p.line([[25, 7], [29, 10]], ST[1], 1); }    // jaws open
    else p.line([[25, 6], [29, 6]], ST[1], 1);
  });
  fish('anchovy0', true); fish('anchovy1', false);
  pixSprite(scene, 'pizzacutter', 18, 18, p => {
    p.ell(9, 9, 8, 8, [0xf4f8ff, 0xb0bccc, 0x5a6478]); p.ell(9, 9, 3, 3, [0xd04a2a, 0x9a2a14, 0x5a1408]);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; p.line([[9 + Math.cos(a) * 4, 9 + Math.sin(a) * 4], [9 + Math.cos(a) * 7, 9 + Math.sin(a) * 7]], 0x6a7488); }
  });
  // the volcano on the horizon (drawn at 2x so it holds up big)
  pixSprite(scene, 'volcano', 260, 180, p => {                     // (its foot runs on down out of sight behind the planet)
    p.poly([[0, 180], [20, 150], [70, 34], [92, 22], [128, 22], [150, 34], [210, 150], [250, 180]], [0x5a2a18, 0x2a1008, 0x120604]);
    p.poly([[88, 24], [132, 24], [124, 30], [96, 30]], [0xffe080, 0xff7a1a, 0xc02a0a]);            // the glowing crater
    for (const pts of [[[100, 30], [94, 50], [86, 66], [80, 90]], [[118, 30], [124, 52], [132, 70], [140, 98]], [[110, 30], [108, 46]]]) p.line(pts, 0xff5a1a, 2);   // lava rivers
    for (const [x, y] of [[60, 80], [160, 84], [40, 104], [180, 108], [104, 70]]) p.ell(x, y, 6, 3, [0x7a3a1c, 0x4a2010, 0x2a1008]);
  });
}

const MozzMixin = {
  mzInit() {
    const z = this.mz = { boulderCd: rnd(5, 8), erupt: null, shards: [], puddles: [], rings: [], t: 0 };
    z.volc = this.add.image(0, 0, 'volcano').setDepth(0.35).setOrigin(110 / 260, 120 / 180);
    z.vg = this.add.graphics().setDepth(0.36).setBlendMode(Phaser.BlendModes.ADD);   // crater glow + lava spitting (screen space)
    z.g = this.add.graphics().setDepth(2.9);                                          // burning puddles on the crust
    z.gl = this.add.graphics().setDepth(7.62).setBlendMode(Phaser.BlendModes.ADD);    // target rings, core glow
    return z;
  },

  // ---- per frame (play)
  mozzUpdate(dt) {
    const z = this.mz || this.mzInit(), P = this.pl;
    z.t += dt;
    // the volcano
    z.boulderCd -= dt;
    if (z.boulderCd <= 0 && !this.bossDown) { z.boulderCd = rnd(8, 12); this.mozzErupt(); }
    if (z.erupt) {
      z.erupt.t += dt;
      if (z.erupt.t > 1.3 && !z.erupt.sent) {
        z.erupt.sent = true;
        const n = z.erupt.n;
        for (let k = 0; k < n; k++) this.time.delayedCall(k * 420, () => { if (this.state === 'play') this.mozzBoulder(Math.random() < 0.5 ? -1 : 1); });
      }
      if (z.erupt.t > 2.2) z.erupt = null;
    }
    // boulders: fall in over the horizon, bounce, roll
    for (const b of this.eBullets) if (b.boulder) {
      if (b.h <= b.r) {
        b.h = b.r;
        if (b.vh < -160) { b.vh = -b.vh * 0.38; if (Math.abs(angDiff(b.theta, P.theta)) < 1) { Sound.sfx('clunk'); this.cameras.main.shake(60, 0.004); } this.burst(b.theta, 4, 'crumb', 3, 0.5); }
        else b.vh = 0;
      }
      b.spinV = b.vt / b.r;
    }
    // burning puddles from the golem's magma globs
    for (let i = z.puddles.length - 1; i >= 0; i--) {
      const D = z.puddles[i]; D.life -= dt;
      if (D.life <= 0) { z.puddles.splice(i, 1); continue; }
      if (this.state === 'play' && P.invuln <= 0 && P.h < 6 && !(P.floor > 0) && Math.abs(angDiff(P.theta, D.theta)) < D.half * 0.9) { this.hurt(); Sound.sfx('hiss'); }
    }
    for (const b of this.eBullets) if (b.lava && b.h <= 6) { b.life = 0; this.mozzPuddle(b.theta); }
    // magma rain target rings
    for (let i = z.rings.length - 1; i >= 0; i--) {
      const Rg = z.rings[i]; Rg.t -= dt;
      if (Rg.t <= 0) { z.rings.splice(i, 1); const b = this.addEBullet('mg_glob', Rg.theta, 420, 0, -620, 12, 3); b.lava = true; b.spr.bsx = b.spr.bsy = 1.5; }
    }
    // the boss's parts go when he does
    if (z.boss && !this.enemies.includes(z.boss)) { this.mgParts(z.boss); z.boss = null; }
  },
  mozzErupt(big) {
    const z = this.mz || this.mzInit();
    if (z.erupt) return;
    z.erupt = { t: 0, n: big ? 3 : (Math.random() < 0.5 ? 1 : 2) };
    Sound.sfx('boom'); this.cameras.main.shake(300, 0.006);
    if (!this.eruptTip) { this.eruptTip = true; this.banner('ERUPTION! BOULDERS INCOMING:\nJUMP THEM OR SHOOT THEM!'); }
  },
  mozzBoulder(side) {
    const P = this.pl, b = this.addEBullet('boulder', wrap(P.theta + side * (this.visHalf + 0.12)), 300, -side * rnd(210, 260), -60, 15, 9);
    b.boulder = true; b.grav = 650; b.shootable = true; b.hp = 3; b.spr.bsx = b.spr.bsy = 1.3;
  },
  mozzPuddle(theta) {
    const z = this.mz || this.mzInit();
    z.puddles.push({ theta, half: 30 / R, life: 3, max: 3 });
    this.burst(theta, 6, 'mg_glob', 6, 0.7); this.bang(theta, 6, 14); Sound.sfx('squelch');
  },

  // ---- drawing (from render)
  mozzDraw() {
    const z = this.mz; if (!z) return;
    const W = this.scale.width, H = this.scale.height, zm = this.zoom, Rz = R * zm;
    // the volcano sits back on the left of the horizon
    const vs = zm * 2, vx = this.cx - Rz * 0.55, vy = this.cy - Rz * 0.835 + 22 * vs;   // its foot tucked just behind the curve
    z.volc.setPosition(vx, vy).setScale(vs);
    const vg = z.vg; vg.clear();
    const cx = vx, cy = vy - 98 * vs, E = z.erupt, pulse = 0.18 + 0.08 * Math.sin(this.t * 3);
    vg.fillStyle(0xff6a1a, pulse).fillEllipse(cx, cy, 30 * vs, 12 * vs);
    if (E) { const k = Math.max(0, 1 - E.t / 2.2); vg.fillStyle(0xffa030, 0.5 * k).fillEllipse(cx, cy - 10 * vs, 46 * vs, 30 * vs); vg.fillStyle(0xffffff, 0.35 * k).fillEllipse(cx, cy, 18 * vs, 8 * vs); }
    if (E && Math.random() < 0.8) z.shards.push({ x: cx + rnd(-10, 10) * vs, y: cy, vx: rnd(-90, 90) * vs, vy: rnd(-260, -160) * vs, life: rnd(0.8, 1.4) });
    const dt = this.lastDt || 0.016;
    for (let i = z.shards.length - 1; i >= 0; i--) {
      const s = z.shards[i]; s.life -= dt; s.vy += 260 * vs * dt; s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.life <= 0) { z.shards.splice(i, 1); continue; }
      vg.fillStyle(0xffb03a, Math.min(1, s.life)).fillRect(s.x - 2 * vs, s.y - 2 * vs, 4 * vs, 4 * vs);
    }
    // puddles of burning cheese on the crust
    const g = z.g; g.clear();
    for (const D of z.puddles) {
      const a = Math.min(1, D.life / 0.6), n = 10, top = [], bot = [];
      for (let k = 0; k <= n; k++) { const th = wrap(D.theta - D.half + 2 * D.half * k / n), bump = Math.sin(k / n * Math.PI); top.push(this.screenPos(th, 3 + bump * 5 + Math.sin(this.t * 8 + k) * 1.5)); bot.push(this.screenPos(th, -3)); }
      g.fillStyle(0xff8a1a, 0.9 * a).fillPoints(top.concat(bot.reverse()), true);
      g.lineStyle(2 * zm, 0xffe080, a).strokePoints(top, false);
    }
    const gl = z.gl; gl.clear();
    for (const Rg of z.rings) {                                                    // magma rain: where it'll land
      const p = this.screenPos(Rg.theta, 4), k = 1 - Rg.t / Rg.max;
      gl.lineStyle(2 * zm, 0xff4a1a, 0.5 + 0.5 * (Math.floor(this.t * 12) % 2)).strokeEllipse(p.x, p.y, (34 - 18 * k) * zm * 2, (10 - 4 * k) * zm * 2);
    }
    if (z.boss) this.mgDraw(z.boss);
  },

  // ---- ANCHOVY SWARMERS
  anchovySwarm(e) {
    const S = { theta: e.theta, h: 150, t: 0, dartCd: 2 };
    e.swarm = S; e.ph = 0;
    for (let k = 1; k < 5; k++) { const f = this.makeEnemy('anchovy', e.theta, 1); f.swarm = S; f.ph = k * TAU / 5; this.enemies.push(f); }
  },
  anchovyAI(e, dt, P) {
    const S = e.swarm || (e.swarm = { theta: e.theta, h: 150, t: 0, dartCd: 2 });
    if (S.lastT !== this.t) {                                                    // move the shoal once per frame
      S.lastT = this.t; S.t += dt;
      const d = angDiff(P.theta, S.theta);
      S.theta = wrap(S.theta + Math.sign(d) * Math.min(Math.abs(d), 95 / R * dt));
      S.h = 130 + Math.sin(S.t * 0.8) * 50;
      S.dartCd -= dt;
      if (S.dartCd <= 0) {                                                       // one of them darts at you
        S.dartCd = rnd(1.6, 2.6);
        const fishes = this.enemies.filter(f => f.swarm === S && !f.dart && f.hp > 0);
        const f = fishes[Math.floor(Math.random() * fishes.length)];
        if (f) { const ex = angDiff(P.theta, f.theta) * R, ey = P.h + 20 - f.h, L = Math.hypot(ex, ey) || 1; f.dart = { t: 0.65, vx: ex / L * 400, vy: ey / L * 400 }; Sound.sfx('zing'); }
      }
    }
    if (e.dart) {
      e.dart.t -= dt; e.theta = wrap(e.theta + e.dart.vx / R * dt); e.h = Math.max(8, e.h + e.dart.vy * dt);
      e.dir = Math.sign(e.dart.vx) || 1;
      if (e.dart.t <= 0) e.dart = null;
    } else {
      const a = S.t * 2.6 + e.ph, tx = Math.cos(a) * 55, ty = Math.sin(a) * 30;
      const wantT = wrap(S.theta + tx / R), wantH = S.h + ty;
      const dT = angDiff(wantT, e.theta);
      e.theta = wrap(e.theta + dT * Math.min(1, dt * 5)); e.h += (wantH - e.h) * Math.min(1, dt * 5);
      e.dir = -Math.sin(a) >= 0 ? 1 : -1;
    }
    e.spr.setTexture(Math.floor(this.t * 10 + e.ph * 3) % 2 ? 'anchovy0' : 'anchovy1');      // snip snip
    e.spr.setFlipX(e.dir < 0);
  },

  // ---- TOASTY OVEN DRONE
  ovenDroneAI(e, dt, P, dirP) {
    e.st = e.st || 'hover'; e.cd = e.cd === undefined ? 2.5 : e.cd; e.cutCd = e.cutCd === undefined ? 1.5 : e.cutCd;
    if (e.st === 'hover') {
      const d = angDiff(P.theta, e.theta);
      e.theta = wrap(e.theta + Math.sign(d) * Math.min(Math.abs(d), 120 / R * dt));
      e.h += (200 + Math.sin(e.t * 1.6) * 18 - e.h) * Math.min(1, dt * 2);
      e.cutCd -= dt; e.cd -= dt;
      if (e.cutCd <= 0) {                                                        // a homing pizza-cutter wheel
        e.cutCd = rnd(2.2, 3);
        const b = this.addEBullet('pizzacutter', e.theta, e.h - 20, dirP * 120, -60, 9, 4); b.home = 2.4; b.homeV = 165; b.spinV = 16;
        Sound.sfx('zing'); this.muzzleFlash(e.theta, e.h - 20);
      }
      if (e.cd <= 0 && Math.abs(d) * R < 140) { e.st = 'tell'; e.cd = 0.6; Sound.sfx('alarm'); }
    } else if (e.st === 'tell') {                                                // shudder, glow red
      e.cd -= dt; e.theta = wrap(e.theta + Math.sin(e.t * 70) * 2 / R);
      e.spr.setTint(Math.floor(e.t * 14) % 2 ? 0xff9a7a : 0xffffff);
      if (e.cd <= 0) { e.st = 'drop'; e.vh = 0; e.spr.clearTint(); }
    } else if (e.st === 'drop') {
      e.vh -= 2400 * dt; e.h += e.vh * dt;
      if (e.h <= 40) {
        e.h = 40; e.st = 'sit'; e.cd = 0.9;
        Sound.sfx('boom'); this.cameras.main.shake(220, 0.012); this.burst(e.theta, 6, 'crumb', 12, 1.2);
        for (const sd of [-1, 1]) this.addEBullet('crumb', wrap(e.theta + sd * 40 / R), 9, sd * 240, 0, 10, 2.2);
      }
    } else if (e.st === 'sit') { e.cd -= dt; if (e.cd <= 0) { e.st = 'rise'; } }
    else if (e.st === 'rise') { e.h += 220 * dt; if (e.h >= 190) { e.st = 'hover'; e.cd = rnd(3.5, 5); } }
    e.dir = dirP;
  },

  // ---- THE MOZZARELLA MAGMA-GOLEM (boss)
  mgInit(e) {
    const z = this.mz || this.mzInit();
    const S = e.mgS = { st: 'walk', t: 0, cd: 2.5, i: 0, p2: false, lean: 0, mouth: 0 };
    S.plates = MG.plates.map(q => ({ key: q.key, off: q.off, r: q.r, hp: 12, im: this.add.image(0, 0, q.key).setDepth(6.03) }));
    S.core = this.add.image(0, 0, 'mg_core').setDepth(6.01).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
    z.boss = e; e.mmLock = true; e.h = MG.footH; e.side = 1;
    bakedGlow(e.spr, 0xff7a1a, 2, 8);
    return S;
  },
  mgAI(e, dt, P, phase2) {
    const S = e.mgS || this.mgInit(e);
    S.t += dt; S.mouth = Math.max(0, S.mouth - dt);
    const d = angDiff(P.theta, e.theta), dist = Math.abs(d) * R;
    if (phase2 && !S.p2) {                                                      // BOILING OVER
      S.p2 = true; S.st = 'roar'; S.t = 0;
      for (const pl of S.plates) if (pl.hp > 0) this.mgBreak(e, pl, true);
      e.baseTint = 0xffd0a0; e.spr.setTint(e.baseTint);
      this.banner('HE\'S BOILING OVER!\nWATCH THE SKY!'); Sound.sfx('crash'); Sound.sfx('boom'); this.cameras.main.shake(500, 0.016);
    }
    const walk = (spd) => {                                                     // lumber after Chris, keeping a little way off
      const want = wrap(P.theta - Math.sign(d || 1) * 150 / R), dd = angDiff(want, e.theta);
      e.theta = wrap(e.theta + Math.sign(dd) * Math.min(Math.abs(dd), spd / R * dt));
      e.h = MG.footH + Math.abs(Math.sin(S.t * 3.2)) * 5;
      e.dir = Math.sign(d) || 1;
    };
    switch (S.st) {
      case 'walk': {
        walk(S.p2 ? 85 : 55);
        S.cd -= dt;
        if (S.cd <= 0) {
          const seq = S.p2 ? ['pound', 'rain', 'lob', 'breath', 'rain', 'pound', 'lob'] : ['lob', 'pound', 'breath', 'lob', 'breath', 'pound'];
          S.st = seq[S.i++ % seq.length]; S.t = 0; S.n = 0;
        }
        break;
      }
      case 'lob': {                                                             // wind up, then hurl magma globs that leave burning puddles
        S.lean = -0.18 * Math.min(1, S.t / 0.5);
        if (S.t > 0.6 && S.n < (S.p2 ? 5 : 3) && S.t > 0.6 + S.n * 0.18) {
          const hand = this.mPt(e, (e.dir || 1) * 60, -10), T = 1.05, gv = 700;
          const tx = angDiff(P.theta, hand.theta) * R + rnd(-50, 50) + (P.vx || 0) * 0.35;
          const b = this.addEBullet('mg_glob', hand.theta, hand.h, tx / T, (0 - hand.h + 0.5 * gv * T * T) / T, 10, 3);
          b.grav = gv; b.lava = true; b.spinV = 6; S.n++; Sound.sfx('fan');
        }
        if (S.t > 1.6) { S.lean = 0; this.mgWalk(e); }
        break;
      }
      case 'pound': {                                                           // fists up... SLAM: shockwaves and the volcano goes off
        if (S.t < 0.8) { e.h = MG.footH + 24 * Math.min(1, S.t / 0.5); e.theta = wrap(e.theta + Math.sin(S.t * 60) * 1.5 / R); S.lean = 0.08; }
        else if (!S.n) {
          S.n = 1; e.h = MG.footH; S.lean = -0.05;
          Sound.sfx('churnclang'); Sound.sfx('boom'); buzz([60, 30, 100]); this.cameras.main.shake(380, 0.02); this.camPunch(0.05); this.hitStop = 0.06;
          this.burst(e.theta, 6, 'crumb', 22, 1.6); this.bang(e.theta, 8, 40);
          for (const sd of [-1, 1]) this.addEBullet('crumb', wrap(e.theta + sd * 70 / R), 10, sd * 270, 0, 11, 2.6);
          if (S.p2) this.time.delayedCall(380, () => { if (e.hp > 0) for (const sd of [-1, 1]) this.addEBullet('crumb', wrap(e.theta + sd * 70 / R), 10, sd * 230, 0, 11, 2.6); });
          this.mozzErupt(true);
        }
        if (S.t > 1.7) { S.lean = 0; this.mgWalk(e); }
        break;
      }
      case 'breath': {                                                          // a sweep of molten cheese from his maw, high to low
        S.mouth = 0.2;
        if (S.t < 0.6) { if (Math.random() < 0.5) { const m = this.mPt(e, MG.mouth[0], MG.mouth[1]); this.burst(m.theta, m.h, 'spark', 1, 0.3); } }
        else if (S.t < 2.0) {
          S.bt = (S.bt || 0) - dt;
          if (S.bt <= 0) {
            S.bt = 0.06;
            const k = (S.t - 0.6) / 1.4, m = this.mPt(e, MG.mouth[0], MG.mouth[1]), dir = Math.sign(d) || 1;
            const a = (0.75 - 1.15 * k), v = 330;                                // from above his head down to the ground at your feet
            const b = this.addEBullet('mg_glob', m.theta, m.h, dir * v * Math.cos(a), v * Math.sin(a), 8, 2.2);
            b.spr.bsx = b.spr.bsy = 0.75;
            if (Math.random() < 0.3) Sound.sfx('hiss');
          }
        } else { S.bt = 0; this.mgWalk(e); }
        break;
      }
      case 'rain': {                                                            // act 2: magma raining down on target rings
        const z = this.mz;
        if (!S.n) { S.n = 1; Sound.sfx('alarm'); for (let k = 0; k < 6; k++) z.rings.push({ theta: wrap(P.theta + rnd(-0.38, 0.38) + (k === 0 ? 0 : 0)), t: 0.9 + k * 0.22, max: 0.9 + k * 0.22 }); z.rings[z.rings.length - 6].theta = P.theta; }
        walk(40);
        if (S.t > 2.4) this.mgWalk(e);
        break;
      }
      case 'roar': {
        S.mouth = 0.2; e.theta = wrap(e.theta + Math.sin(S.t * 70) * 2 / R);
        if (S.t > 1.4) { S.i = 0; this.mgWalk(e, 0.4); }
        break;
      }
    }
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
    S.hsCd = (S.hsCd || 0) - 0;
    if (!(S.hsT > this.t)) { S.hsT = this.t + 0.14; this.hitStop = Math.max(this.hitStop || 0, 0.02); }
  },
  mgDraw(e) {
    const S = e.mgS; if (!S) return;
    const vis = e.spr.visible, rot = e.spr.rotation, sx = e.spr.scaleX, sy = e.spr.scaleY;
    e.spr.setRotation(rot + (S.lean || 0) * (e.dir || 1));
    const dt = this.lastDt || 0.016;
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
    S.plates = []; S.core = null;
    if (this.mz) { this.mz.rings = []; this.mz.puddles = []; }
  }
};
