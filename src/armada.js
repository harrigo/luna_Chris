// L7: THE ASTRO-RAT ARMADA, an OCEAN WORLD (v2.63).
//
//   TWO RINGS       a small cratered rock core (the seabed, R) and a thick translucent cyan ocean on top of it, up to the
//                   waterline at WL. Open space above that for jetpack breaches.
//   SWIMMING        under the water gravity is light and everything drags: tap JUMP for a stroke, hold it to swim up,
//                   hold DOWN to dive. No jetpack under water (the tank refills instead). Hold JUMP as you break the
//                   surface and the jet lights at once: a BREACH.
//   IRONCLADS       rusty rat ironclads sail the waterline, lobbing arcing cannonballs (they splash and slow right down
//                   in the water) and dropping spiky depth charges on anyone swimming beneath. Their iron is too thick
//                   to shoot through: dive under and hit the glowing yellow KEEL.
//   TORPEDO RATS    rats strapped to propeller torpedoes: they circle, line up (a shudder, a stream of bubbles) and dart.
//   THE DREADNOUGHT the boss: the biggest ironclad, three keels, broadsides, depth-charge barrages, torpedo rats.

const WL = 170;                                        // the waterline, px above the seabed

function makeArmadaTextures(scene, toonRat) {
  if (scene.game.__armadaTex) return; scene.game.__armadaTex = true;
  const INK = 0x1a1020, IRON = [0x8a7a72, 0x5a4a44, 0x2e2420], RUST = [0xd8803a, 0xa8501a, 0x6a2a0c], STEEL = [0xdfe6f0, 0x8a94a6, 0x4a5262];
  const FUR = [0xc4c8dc, 0x868ca6, 0x4a4f6a], PINK = [0xffb0c0, 0xe07a90, 0xa04a60], GLOW = [0xfff6c0, 0xffd23f, 0xd8901a];
  // ---- an IRONCLAD: a riveted rusty hull riding low (waterline at y 52 of 80), a red boot-topping stripe, portholes,
  // a squat funnel, a deck gun in a turret, a bridge, a skull-and-crossforks flag, three rats at the rail, the keel glowing.
  const hull = (key, W2, H2, wl, keels, big) => pixSprite(scene, key, W2, H2, p => {
    const r = rng(W2 * 7 + H2);
    const x0 = 4, x1 = W2 - 5, bow = x1 - (big ? 26 : 18);
    // hull below the waterline (darker, weeded) and above it
    p.poly([[x0, wl - 16], [x1, wl - 18], [x1 - 6, wl + 2], [bow - 6, wl + 14], [x0 + 22, wl + 16], [x0 + 6, wl + 6]], IRON);
    p.poly([[x0 + 6, wl + 2], [x1 - 7, wl], [bow - 6, wl + 14], [x0 + 22, wl + 16]], [0x4a5a3a, 0x2e3a24, 0x1a2414]);                   // below the line: dark and weedy
    p.rect(x0 + 4, wl - 4, x1 - 6, wl - 1, 0xc8301a); p.rect(x0 + 4, wl - 4, x1 - 6, wl - 4, 0xff6a4a);                                 // boot-topping stripe
    for (let x = x0 + 8; x < x1 - 8; x += 7) { p.px(x, wl - 12, 0xd8c8b8); p.px(x + 1, wl - 11, INK); p.px(x, wl + 6, 0x8a9a6a); }      // rivets
    for (let k = 0; k < (big ? 9 : 5); k++) { const x = x0 + 16 + k * (big ? 22 : 20); p.ell(x, wl - 9, 2.4, 2.4, [0xfff0b0, 0xffc23a, 0x8a5a10]); p.px(x - 1, wl - 10, 0xffffff); }   // portholes, lit
    for (let k = 0; k < 14; k++) { const x = x0 + 8 + r() * (x1 - x0 - 16), y = wl - 15 + r() * 12; p.rect(x, y, x + 2, y + 1, RUST[1]); p.px(x, y, RUST[0]); }   // rust streaks
    for (let k = 0; k < 8; k++) { const x = x0 + 24 + r() * (x1 - x0 - 50); p.line([[x, wl + 2], [x + 1, wl + 7 + r() * 5]], 0x3a8a3a); }   // weed
    // the keels: glowing yellow plates (the weak points)
    for (const kx of keels) { p.ell(kx, wl + 12, 7, 4, GLOW); p.px(kx - 2, wl + 11, 0xffffff); for (const dx of [-5, 5]) p.px(kx + dx, wl + 9, INK); }
    // the deck
    p.rect(x0 + 2, wl - 19, x1 - 2, wl - 17, IRON[2]); p.line([[x0 + 2, wl - 20], [x1 - 2, wl - 20]], 0xb8a898);
    for (let x = x0 + 4; x < x1 - 4; x += 5) p.line([[x, wl - 25], [x, wl - 20]], 0x6a5a54); p.line([[x0 + 4, wl - 25], [x1 - 4, wl - 25]], 0x8a7a72);   // the rail
    // superstructure: bridge, funnel, turret
    const bx = big ? 60 : 34;
    p.rrect(bx, wl - 40, bx + (big ? 38 : 26), wl - 20, 2, IRON); for (let x = bx + 4; x < bx + (big ? 34 : 22); x += 6) p.rect(x, wl - 35, x + 3, wl - 32, 0x9fd8ff);   // bridge windows
    p.rrect(bx + 4, wl - 46, bx + (big ? 28 : 18), wl - 40, 1, RUST);
    const fx = big ? 116 : 70;
    p.rrect(fx, wl - (big ? 62 : 52), fx + (big ? 14 : 11), wl - 20, 2, [0x5a5a6a, 0x3a3a48, 0x1e1e2c]); p.rect(fx, wl - (big ? 58 : 48), fx + (big ? 14 : 11), wl - (big ? 55 : 45), 0xc8301a); p.rect(fx + 1, wl - (big ? 62 : 52), fx + (big ? 13 : 10), wl - (big ? 61 : 51), INK);   // funnel
    for (const tx of big ? [24, bow - 10] : [bow - 12]) {                                                                                  // turrets, guns cocked up
      p.ell(tx, wl - 22, 10, 6, IRON); p.rect(tx - 10, wl - 22, tx + 10, wl - 20, IRON[1]); p.line([[tx + 4, wl - 26], [tx + 18, wl - 34]], 0x3a3a48, 4); p.line([[tx + 4, wl - 27], [tx + 18, wl - 35]], 0x8a8a98, 1); p.ell(tx + 18, wl - 34, 2, 2, INK);
    }
    // the flag: a rat skull over crossed forks
    const fpx = bx + 10;
    p.line([[fpx, wl - 46], [fpx, wl - (big ? 78 : 68)]], 0x3a2a1a, 1);
    p.rect(fpx + 1, wl - (big ? 78 : 68), fpx + 16, wl - (big ? 68 : 58), INK); p.ell(fpx + 8, wl - (big ? 74 : 64), 3, 2.6, 0xfffbe8); p.px(fpx + 7, wl - (big ? 74 : 64), INK); p.px(fpx + 9, wl - (big ? 74 : 64), INK);
    p.line([[fpx + 3, wl - (big ? 70 : 60)], [fpx + 13, wl - (big ? 76 : 66)]], 0xdfe6f0); p.line([[fpx + 3, wl - (big ? 76 : 66)], [fpx + 13, wl - (big ? 70 : 60)]], 0xdfe6f0);
    // the crew at the rail: grubby rat heads, one in a bosun's cap, one with a spyglass
    for (const [hx, cap, glass] of big ? [[20, 0, 0], [46, 1, 0], [104, 0, 1], [160, 1, 0]] : [[18, 0, 0], [96, 1, 0], [110, 0, 1]]) {
      p.ell(hx, wl - 28, 4.5, 4, FUR); p.ell(hx - 3, wl - 33, 2.2, 2.6, PINK); p.ell(hx + 3, wl - 33, 2.2, 2.6, PINK); p.px(hx + 4, wl - 28, PINK[1]);
      p.ell(hx + 1, wl - 29, 1.8, 1.8, 0xffffff); p.px(hx + 2, wl - 29, INK); p.px(hx, wl - 25, 0xfffbe8);
      if (cap) { p.rect(hx - 4, wl - 34, hx + 3, wl - 32, 0x2a3478); p.rect(hx - 1, wl - 33, hx + 6, wl - 32, INK); }
      if (glass) { p.line([[hx + 3, wl - 30], [hx + 11, wl - 32]], GLOW[2], 2); p.px(hx + 11, wl - 32, 0x9fd8ff); }
    }
  });
  hull('ironclad', 140, 82, 58, [70], false);
  hull('dreadnought', 230, 104, 76, [60, 115, 170], true);
  pixSprite(scene, 'keelglow', 24, 16, a => { a.ell(12, 8, 11, 7, 0xd8901a); a.ell(12, 8, 7, 4.5, 0xffd23f); a.ell(12, 8, 3.5, 2.2, 0xfff6c0); }, 0);
  // ---- TORPEDO RAT: a rat in diving goggles, strapped to a dented torpedo, propeller whirring (two frames), bubbles
  [0, 1].forEach(f => pixSprite(scene, 'torprat' + (f ? '_b' : ''), 54, 30, a => {
    a.poly([[2, f ? 9 : 13], [8, 15], [2, f ? 21 : 17]], STEEL); a.poly([[8, 15], [3, f ? 13 : 9], [3, f ? 17 : 21]], [0xb8c0cc, 0x6a7280, 0x3a4250]);   // the prop
    a.rect(8, 13, 11, 17, STEEL[2]);
    a.rrect(10, 10, 46, 20, 5, [0x7a8aa8, 0x4a5a78, 0x2a3450]); a.poly([[45, 10], [52, 15], [45, 20]], [0xff7a5a, 0xd8301a, 0x8a1408]);   // body, a red warhead
    a.line([[12, 12], [42, 12]], 0xa8b8d8); a.rect(28, 10, 29, 20, 0x2a3450); a.px(49, 14, 0xffd0c0);
    a.poly([[14, 10], [20, 4], [22, 10]], [0x7a8aa8, 0x4a5a78, 0x2a3450]); a.poly([[14, 20], [20, 26], [22, 20]], [0x7a8aa8, 0x4a5a78, 0x2a3450]);   // fins
    for (const x of [16, 24, 34, 40]) a.px(x, 18, 0xd8c8b8);
    // the rat lying along it, arms round it, goggles
    a.ell(30, 7, 9, 4.5, FUR); a.ell(38, 6, 5, 4, FUR); a.ell(35, 2, 2.4, 2.6, PINK); a.ell(43, 7, 1.8, 1.4, PINK);
    a.ell(39, 5, 2.6, 2.4, 0x2a3450); a.ell(39, 5, 1.8, 1.6, 0x9fe8ff); a.px(39, 4, 0xffffff); a.line([[35, 4], [41, 4]], 0x2a3450);
    a.rect(41, 8, 42, 9, 0xfffbe8);
    a.line([[28, 10], [31, 12]], FUR[1]); a.line([[34, 10], [36, 12]], FUR[1]);                                                         // paws round it
    a.line([[21, 7], [16, 4], [12, 6]], PINK[1]);                                                                                       // the tail, streaming back
    if (f) { a.px(0, 8, 0xc8f0ff); a.px(1, 23, 0x9fd8ff); }
  }));
  // ---- cannonball (a fizzing fuse) and a depth charge (a spiky sea mine, a blinking red light)
  pixSprite(scene, 'cannonball', 14, 14, a => { a.ell(7, 8, 6, 6, [0x6a6a7a, 0x3a3a48, 0x141420]); a.px(5, 6, 0xc8c8d8); a.line([[9, 3], [11, 1]], 0x8a6a3a); a.px(12, 0, 0xffd23f); });
  pixSprite(scene, 'dcharge', 26, 26, a => {
    for (let k = 0; k < 8; k++) { const t = k / 8 * 6.283; a.line([[13 + Math.cos(t) * 8, 13 + Math.sin(t) * 8], [13 + Math.cos(t) * 12, 13 + Math.sin(t) * 12]], 0x2a2a38, 2); a.px(Math.round(13 + Math.cos(t) * 12), Math.round(13 + Math.sin(t) * 12), 0x8a8a9a); }
    a.ell(13, 13, 8.5, 8.5, [0x5a5a6a, 0x2e2e3c, 0x141420]); a.line([[6, 13], [20, 13]], 0x6a6a7a); a.px(10, 9, 0xb8b8c8); a.px(11, 9, 0xb8b8c8);
    a.ell(13, 13, 2, 2, [0xff9a8a, 0xff2a1a, 0x8a0a04]);
  });
  pixSprite(scene, 'bubl', 8, 8, a => { for (let k = 0; k < 16; k++) { const t = k / 16 * 6.283; a.px(Math.round(3.5 + Math.cos(t) * 3), Math.round(3.5 + Math.sin(t) * 3), 0xc8f4ff); } a.px(2, 2, 0xffffff); }, 0);
  pixSprite(scene, 'wdrop', 6, 6, a => { a.ell(3, 3, 2.6, 2.6, [0xffffff, 0xc8f4ff, 0x6ad0ff]); }, 0);
  // ---- the seabed: kelp, a sunken wreck, a giant clam
  pixSprite(scene, 'kelp', 20, 60, a => {
    for (let y = 59; y > 2; y--) { const x = 10 + Math.sin(y * 0.18) * 4; a.rect(Math.round(x) - 1, y, Math.round(x) + 1, y, y % 9 < 2 ? 0x2a6a2a : 0x3a8a3a); if (y % 9 === 4) { a.ell(x + (y % 18 ? 4 : -4), y, 3.5, 1.6, [0x6ac85a, 0x3a8a3a, 0x1a4a1a]); } }
  });
  pixSprite(scene, 'wreck', 90, 44, a => {
    a.poly([[4, 43], [10, 22], [40, 18], [60, 28], [86, 26], [80, 43]], [0x6a5a4a, 0x3a2e24, 0x1a140e]);
    for (let x = 14; x < 78; x += 8) a.line([[x, 24 + (x % 3)], [x - 2, 42]], 0x2a201a);
    a.line([[30, 19], [26, 2]], 0x3a2e24, 2); a.line([[26, 6], [38, 10]], 0x3a2e24); a.poly([[27, 4], [40, 9], [30, 14]], [0x8a7a6a, 0x5a4a3a, 0x3a2e24]);   // a broken mast, a tattered sail
    for (const [x, y] of [[20, 30], [52, 32], [68, 34]]) a.ell(x, y, 2.6, 2.6, 0x0a0806);
    a.line([[10, 22], [12, 30], [8, 38]], 0x3a8a3a); a.line([[60, 28], [64, 36]], 0x3a8a3a);
  });
  pixSprite(scene, 'clam', 36, 24, a => {
    a.poly([[2, 22], [6, 10], [18, 4], [30, 10], [34, 22]], [0xd8b8c8, 0xa8889a, 0x6a4a5a]); for (const x of [10, 18, 26]) a.line([[18, 5], [x, 22]], 0x6a4a5a);
    a.ell(18, 21, 15, 3, [0xffe0f0, 0xd8a8c0, 0x8a5a70]); a.ell(18, 19, 3, 2.6, [0xffffff, 0xe8f0ff, 0xb8c8e0]); a.px(17, 18, 0xffffff);
  });
}

const ArmadaMixin = {
  armadaInit() {
    const A = this.az = { t: 0, rays: [0.3, 1.4, 2.6, 3.7, 4.9, 5.8].map(a => ({ a, w: rnd(0.05, 0.12), ph: rnd(0, 6) })), bub: 0 };
    A.back = this.add.graphics().setDepth(1.15);                  // the ocean, behind everything that lives in it
    A.front = this.add.graphics().setDepth(7.45);                 // a faint wash over everything under the water
    A.foam = this.add.graphics().setDepth(7.5);                   // the foamy wave line
  },
  // new enemies on an ocean world: ships on the waterline, flyers above it, swimmers below
  armadaSetup(e, kind) {
    if (kind === 'ironclad' || (e.type === 'boss' && e.ai === 'dreadnought')) {
      const big = e.type === 'boss';
      e.h = WL; e.phased = true; e.noStomp = true; e.ship = { big, dir: Math.random() < 0.5 ? -1 : 1, fireCd: rnd(1.5, 2.6), chargeCd: rnd(1, 2), torpCd: 6, smoke: 0, bob: rnd(0, 6) };
      const keelX = big ? [60, 115, 170] : [70], w = big ? 230 : 140, wl = big ? 76 : 58;
      e.keels = keelX.map(x => ({ dx: (x - w / 2), dh: -(12 + 2) , hp: big ? e.maxHp / 3 : e.maxHp, flash: 0, dead: false }));
      e.spr.setOrigin(0.5, wl / (big ? 104 : 82)).setDepth(4.9);
      e.ov = e.ov || {};
      e.keels.forEach((K, i) => { const g = this.add.image(0, 0, 'keelglow').setDepth(5.0).setBlendMode(Phaser.BlendModes.ADD); e.ov['keel' + i] = g; K.spr = g; });
    } else if (kind === 'torprat') {
      e.h = rnd(40, WL - 40); e.tp = { st: 'cruise', t: rnd(1.2, 2.2), off: rnd(-1, 1) * 140, vt: 0, vh: 0 };
    } else if (kind === 'flyer' || kind === 'drone') {
      e.h = e.baseH = WL + rnd(70, 170);
    }
  },
  armadaAI(e, dt, P) {
    const k = e.spr.bsx || 1, under = P.h < WL - 10;
    if (e.ship) {
      const S = e.ship, toP = angDiff(P.theta, e.theta), dist = Math.abs(toP) * R;
      // sail: close in when he's far, drift and turn round when he's close; ride the swell
      if (dist > (S.big ? 160 : 260)) S.dir = Math.sign(toP) || 1; else if (Math.random() < dt * 0.15) S.dir = -S.dir;
      e.theta = wrap(e.theta + S.dir * (S.big ? 26 : 38) / R * dt);
      S.bob += dt; e.h = WL + Math.sin(S.bob * 1.6) * 2.5; e.spr.rotation = Math.sin(S.bob * 1.1) * 0.03;
      e.spr.setFlipX(S.dir < 0);
      const fl = S.dir < 0 ? -1 : 1;
      if ((S.smoke -= dt) <= 0) { S.smoke = 0.12; const im = this.add.image(0, 0, 'puff').setDepth(4.8).setTint(Math.random() < 0.5 ? 0x3a3a48 : 0x6a6a7a).setAlpha(0.6); im.bsx = im.bsy = rnd(0.25, 0.4); this.parts.push({ theta: wrap(e.theta + fl * ((S.big ? 1 : -1) * (S.big ? 8 : 6)) * k / R), h: e.h + (S.big ? 62 : 52) * k, vt: -S.dir * 30, vh: rnd(30, 55), life: rnd(1, 1.6), noGrav: true, grow: 1.8, spr: im }); }
      // keels: follow the hull, pulse
      for (const K of e.keels) { K.flash = Math.max(0, K.flash - dt); K.theta = wrap(e.theta + fl * K.dx * k / R); K.h = e.h + K.dh * k; if (K.spr) { K.spr.setVisible(!K.dead); this.place(K.spr, K.theta, K.h, 0); K.spr.setAlpha(K.flash > 0 ? 1 : 0.55 + 0.35 * Math.sin(this.t * 6)).setScale(K.spr.scaleX * (K.flash > 0 ? 1.4 : 1)); } }
      if (this.state !== 'play') return;
      // the deck guns: an arcing cannonball at him (a broadside of three from the Dreadnought)
      if ((S.fireCd -= dt) <= 0 && dist < 520) {
        S.fireCd = S.big ? rnd(2.4, 3.2) : rnd(2.6, 3.6);
        const n = S.big ? 3 : 1;
        for (let i = 0; i < n; i++) {
          const gx = wrap(e.theta + fl * (S.big ? (i - 1) * 50 : 52) * k / R), gh = e.h + 34 * k, tx = angDiff(P.theta, gx) * R + (i - (n - 1) / 2) * 60, T = 1.25 + i * 0.12, g = 430;
          const tgtH = Math.max(WL + 4, P.h + 20), vh = ((tgtH - gh) + 0.5 * g * T * T) / T;
          const b = this.addEBullet('cannonball', gx, gh, tx / T, vh, 9, 6); b.grav = g; b.cball = true; b.shootable = true; b.spr.bsx = b.spr.bsy = 1.4;
          this.muzzleFlash(gx, gh); this.burst(gx, gh, 'spark', 4, 0.6);
        }
        Sound.sfx('crash'); this.cameras.main.shake(70, 0.003);
      }
      // depth charges on anyone swimming underneath
      if (under && (S.chargeCd -= dt) <= 0 && dist < (S.big ? 260 : 160)) {
        S.chargeCd = S.big ? 1.6 : 2.4;
        for (let i = 0; i < (S.big ? 2 : 1); i++) { const b = this.addEBullet('dcharge', wrap(e.theta + (S.big ? (i ? 40 : -40) : 0) * k / R), e.h - 20 * k, rnd(-15, 15), -40, 13, 12); b.dcharge = true; b.spinV = 0.8; b.shootable = true; }
        Sound.sfx('clunk'); this.burst(e.theta, e.h - 14, 'bubl', 6, 0.8);
      }
      // the Dreadnought launches torpedo rats
      if (S.big && (S.torpCd -= dt) <= 0 && this.enemies.length < 6) { S.torpCd = rnd(6, 8); this.spawnEnemy('torprat'); }
      return;
    }
    if (e.tp) {                                          // TORPEDO RAT
      const T = e.tp, prev = { th: e.theta, h: e.h };
      T.t -= dt;
      if (T.st === 'cruise') {
        const tth = wrap(P.theta + T.off / R), th = under ? Math.max(30, Math.min(WL - 30, P.h + 20)) : WL - 50;
        e.theta = wrap(e.theta + Math.max(-1, Math.min(1, angDiff(tth, e.theta) * R / 80)) * 90 / R * dt); e.h += Math.max(-1, Math.min(1, (th - e.h) / 40)) * 70 * dt;
        if (T.t <= 0 && under) { T.st = 'aim'; T.t = 0.55; T.lock = { th: P.theta, h: P.h + 22 }; Sound.sfx('charge'); }
      } else if (T.st === 'aim') {                        // lining up: it shudders, the prop spins up, bubbles stream back
        e.theta = wrap(e.theta + Math.sin(this.t * 60) * 0.6 / R);
        if (Math.random() < dt * 30) this.burst(e.theta, e.h, 'bubl', 1, 0.5);
        if (T.t <= 0) { T.st = 'dash'; T.t = 1.1; const ex = angDiff(T.lock.th, e.theta) * R, ey = T.lock.h - e.h, L = Math.hypot(ex, ey) || 1; T.vt = ex / L * 330; T.vh = ey / L * 330; Sound.sfx('whoosh'); }
      } else {                                            // DASH
        e.theta = wrap(e.theta + T.vt / R * dt); e.h += T.vh * dt;
        if (Math.random() < dt * 40) { const im = this.add.image(0, 0, 'bubl').setDepth(4.7); im.bsx = im.bsy = rnd(0.6, 1.2); this.parts.push({ theta: e.theta, h: e.h, vt: -T.vt * 0.1 + rnd(-20, 20), vh: rnd(10, 40), life: rnd(0.5, 0.9), noGrav: true, spr: im }); }
        if (T.t <= 0 || e.h < 12 || e.h > WL - 8) { T.st = 'cruise'; T.t = rnd(1.4, 2.4); T.off = rnd(-1, 1) * 150; e.h = Math.max(14, Math.min(WL - 10, e.h)); }
      }
      const mv = angDiff(e.theta, prev.th) * R, mh = e.h - prev.h;
      if (Math.abs(mv) > 0.2) e.spr.setFlipX(mv < 0);
      e.spr.rotation = (mv < 0 ? -1 : 1) * Math.atan2(mh, Math.abs(mv) + 0.01) * 0.6;
    }
  },
  // a player shot against the ironclads: the keel takes it, the iron above just rings
  armadaHit(theta, h, rad, dmg) {
    for (const e of this.enemies) {
      if (!e.ship || e.hp <= 0) continue;
      for (const K of e.keels) {
        if (K.dead || K.theta === undefined) continue;
        if (dist2(theta, h, K.theta, K.h) > (16 + rad) * (16 + rad)) continue;
        K.hp -= dmg; K.flash = 0.08; e.hp -= dmg; e.flash = 0.06; Sound.sfx('tink'); this.burst(theta, h, 'spark', 4, 0.6);
        if (K.hp <= 0) {                                  // a keel blown open: flooding, a list, a burst of bubbles
          K.dead = true; this.bang(K.theta, K.h, 26); this.burst(K.theta, K.h, 'bubl', 22, 1.6); Sound.sfx('crash'); this.cameras.main.shake(160, 0.008);
          if (e.ship.big && e.keels.some(q => !q.dead)) this.banner('A KEEL IS BREACHED! ' + e.keels.filter(q => !q.dead).length + ' TO GO');
        }
        if (e.keels.every(q => q.dead)) e.hp = 0;
        return true;
      }
      const k = e.spr.bsx || 1, half = (e.ship.big ? 104 : 62) * k;          // the hull: shots spark off the iron
      if (Math.abs(angDiff(theta, e.theta)) * R < half && h > e.h - 14 * k && h < e.h + (e.ship.big ? 50 : 40) * k) {
        this.burst(theta, h, 'spark', 3, 0.5); if (Math.random() < 0.3) Sound.sfx('tink');
        if (!this.keelTip && h > WL) { this.keelTip = true; this.popup(e.theta, e.h + 80, 'TOO THICK! HIT THE KEEL!', '#ffd23f'); }
        return true;
      }
    }
    return false;
  },
  armadaUpdate(dt) {
    const A = this.az, P = this.pl; if (!A) return;
    A.t += dt;
    // enemy shots meeting the water: a splash, then they slow right down and sink. Depth charges go off near him.
    for (const b of this.eBullets) {
      if (b.h < WL && !b.wet) { b.wet = true; this.waterSplash(b.theta, 6); b.vt *= 0.35; b.vh *= 0.25; b.grav = (b.grav || 0) * 0.12; b.life = Math.min(b.life, 4); }
      if (b.dcharge) {
        b.spr.setTint(Math.floor(this.t * 6) % 2 ? 0xffffff : 0xff8a7a);
        const near = dist2(b.theta, b.h, P.theta, P.h + 22) < 46 * 46;
        if (near || b.h <= 12 || b.life <= 0.05) {
          b.life = 0; this.bang(b.theta, b.h, 30); this.burst(b.theta, b.h, 'bubl', 20, 1.5); Sound.sfx('crash'); this.cameras.main.shake(140, 0.008);
          if (dist2(b.theta, b.h, P.theta, P.h + 22) < 64 * 64 && P.invuln <= 0 && this.state === 'play') this.hurt();
        }
      }
    }
    // bubbles off his shots under water
    for (const b of this.pBullets) if (b.h < WL && Math.random() < dt * 30) { const im = this.add.image(0, 0, 'bubl').setDepth(7.6); im.bsx = im.bsy = rnd(0.4, 0.8); this.parts.push({ theta: b.theta, h: b.h, vt: rnd(-15, 15), vh: rnd(20, 50), life: rnd(0.4, 0.8), noGrav: true, spr: im }); }
    // and off Chris, and the odd stream from the seabed
    if (P.h < WL - 20 && Math.random() < dt * 4) { const im = this.add.image(0, 0, 'bubl').setDepth(7.6); this.parts.push({ theta: wrap(P.theta + (P.facing || 1) * 8 / R), h: P.h + 52, vt: rnd(-8, 8), vh: rnd(40, 70), life: 1.2, noGrav: true, spr: im }); }
    if ((A.bub -= dt) <= 0) { A.bub = rnd(0.08, 0.2); const im = this.add.image(0, 0, 'bubl').setDepth(1.2); im.bsx = im.bsy = rnd(0.4, 1.1); this.parts.push({ theta: wrap(P.theta + rnd(-1, 1) * this.visHalf), h: rnd(0, 30), vt: rnd(-6, 6), vh: rnd(25, 60), life: rnd(2.5, 3.5), noGrav: true, spr: im }); }
  },
  // swimming (called from updatePlayer, before gravity): sets P.swim
  oceanSwim(P, inp, dt) {
    const was = !!P.swim; P.swim = P.h < WL - 4;
    if (P.swim !== was) {
      this.waterSplash(P.theta, 10); Sound.sfx('splat');
      if (P.swim) { P.vh *= 0.35; } else if (P.vh > 120 && inp.jump) { P.vh = Math.max(P.vh, 440); P.jetArmed = true; P.holdT = 99; this.banner('BREACH!'); }   // out of the water with a kick
    }
    if (!P.swim) return;
    P.thrusting = false; if (this.jetOn) { this.jetOn = false; Sound.jet(false); }
    P.fuel = Math.min(1, P.fuel + CFG.jetRegen * 0.6 * dt);
    if (inp.jump && !P.swimJ) { P.vh = Math.max(P.vh, 0) + 230; Sound.sfx('jump'); this.burst(P.theta, P.h + 10, 'bubl', 5, 0.7); }   // a stroke
    P.swimJ = !!inp.jump;
    if (inp.jump) P.vh = Math.max(P.vh, Math.min(P.vh + 520 * dt, 210));                // hold it: swim up
    if (inp.down) P.vh = Math.min(P.vh, Math.max(P.vh - 520 * dt, -210));               // hold DOWN: dive
    P.vh *= Math.exp(-2.6 * dt);                                                       // the water drags
    P.vh = Math.max(-260, Math.min(P.vh, 420));
    const cap = CFG.runSpeed * 0.75; P.vx = Math.max(-cap, Math.min(cap, P.vx));
    P.jetArmed = true; P.holdT = 99;                                                   // (so the jet lights the moment he breaks the surface)
    P.diving = false;
  },
  waterSplash(theta, n) {
    for (let k = 0; k < n; k++) { const im = this.add.image(0, 0, 'wdrop').setDepth(7.7); im.bsx = im.bsy = rnd(0.6, 1.3); this.parts.push({ theta: wrap(theta + rnd(-6, 6) / R), h: WL + 2, vt: rnd(-90, 90), vh: rnd(140, 320), life: rnd(0.4, 0.7), spr: im }); }
  },
  // the ocean: a translucent ring from the seabed to the waterline, light shafts, a wash in front, a foamy wave crest
  armadaDraw() {
    const A = this.az; if (!A) return;
    const z = this.zoom, t = this.t, vt = this.viewT ? this.viewT() : this.pl.theta, span = this.visHalf + 0.35, N = 56;
    const band = (h0, h1) => { const out = [], inn = []; for (let k = 0; k <= N; k++) { const th = vt - span + 2 * span * k / N; out.push(this.screenPos(th, h1 + Math.sin(th * 18 + t * 2.2) * 2)); inn.push(this.screenPos(th, h0)); } return out.concat(inn.reverse()); };
    const g = A.back; g.clear();
    g.fillStyle(0x0a3a7a, 0.55).fillPoints(band(0, WL * 0.4), true);
    g.fillStyle(0x1a7ac8, 0.42).fillPoints(band(WL * 0.4, WL * 0.75), true);
    g.fillStyle(0x3ad0f0, 0.38).fillPoints(band(WL * 0.75, WL), true);
    for (const r of A.rays) {                                   // shafts of light from the surface, swaying
      const th = r.a + Math.sin(t * 0.4 + r.ph) * 0.04; if (Math.abs(angDiff(th, vt)) > span) continue;
      const a = this.screenPos(th - r.w * 0.5, WL), b = this.screenPos(th + r.w * 0.5, WL), c = this.screenPos(th + r.w * 0.9 + 0.05, 10), d = this.screenPos(th + r.w * 0.2 + 0.05, 10);
      g.fillStyle(0xc8f8ff, 0.07 + 0.03 * Math.sin(t * 1.3 + r.ph)).fillPoints([a, b, c, d], true);
    }
    const f = A.front; f.clear(); f.fillStyle(0x3ad0f0, 0.12).fillPoints(band(0, WL), true);
    const fo = A.foam; fo.clear();                              // the wave line: a white crest, foam blobs riding it
    const top = []; for (let k = 0; k <= N * 2; k++) { const th = vt - span + 2 * span * k / (N * 2); top.push(this.screenPos(th, WL + Math.sin(th * 18 + t * 2.2) * 2 + Math.sin(th * 41 - t * 3.1) * 1.2)); }
    fo.lineStyle(7 * z, 0xffffff, 0.35).strokePoints(top, false); fo.lineStyle(3.5 * z, 0xffffff, 1).strokePoints(top, false); fo.lineStyle(1.5 * z, 0x9fe8ff, 1).strokePoints(top.map(q => ({ x: q.x, y: q.y + 3 * z })), false);
    for (let k = 0; k < 40; k++) { const th = vt - span + 2 * span * ((k * 0.618 + t * 0.03) % 1), q = this.screenPos(th, WL + 2 + Math.sin(th * 18 + t * 2.2) * 2); fo.fillStyle(0xffffff, 0.85).fillCircle(q.x, q.y, (1.5 + (k % 3)) * z); }
  }
};
