// LEVEL 3 BOSS: THE PHANTOM MILKMAID - a towering Victorian spectre with a rusted ghost-churn.
//
// She's built from parts so she can act: a translucent (dithered) gown + apron with a ribcage showing through the
// bodice, a head that changes face (hollow yellow eyes / eyes wide when she attacks / screaming maw when she's hit),
// and the churn in her hands, which tilts to pour and drips glowing whey.
//
// ACT 1 (full to half health), round robin with short breathers:
//   SPIRAL SOUR-RINGS  rings of curd that rotate as they spread (each bullet's path curls), plus "skimmers" sent off
//                      along the ground both ways: the one heading away goes right round the planet and comes back at
//                      you from BEHIND ~10 s later.
//   CHURN CASCADE      she rises high, tilts the churn and pours a column of curdled ghost-milk onto the planet. Where it
//                      lands a flood spreads round the curve both ways: a tall crest (jump it), then knee-deep milk for
//                      2 s behind it (jetpack, or stand on a bone ledge).
//   TRIANGULATION      neon-purple triangles fly out and lock into a laser cage round you: two walls and a lid that
//                      close in for 8 s. Touching the lasers hurts and throws you back in.
//   TELEPORT           she streaks across the sky to your other side, leaving fading after-images.
// ACT 2 "THE SOUR STAMPEDE" (below half): her bonnet shreds to show a spectral COW SKULL, she slams the churn into the
//   ground (big shake, CLANG, shockwaves), then adds GHOST-COW STAMPEDES: skeletal cows rise out of the ribcages in
//   the brie and gallop round the planet (jump them). Now her glowing red HEART is the weak spot: shots near it do
//   double-plus damage, the rest only scratch her.
//
// Mixed into Level1 (see main.js). Scene-level bits live in this.mm; her own state in e.mmS.

const MM = {
  head: [0, -57],       // offsets from the body sprite's centre, in texture pixels (y down)
  churn: [19, 20],
  mouth: [0, -17],      // the churn's mouth, from the churn's centre
  heart: [0, -25],
  top: 300,             // the cage lid height
  idleH: 140
};

function makeMilkmaidTextures(scene) {
  const GH = [0xf4fbff, 0xc8def6, 0x7e9cc8], GD = [0xc8d6ee, 0x8aa0c8, 0x52648c], AP = [0xffffff, 0xeef6ff, 0xb8cce6];
  const BONE = [0xfffaf0, 0xe8dcc0, 0xa89878], DARK = 0x0a0818;
  const dither = (from, to, dense) => (g, w, h) => {      // checkerboard holes: you see the stars and bones through her
    for (let y = from; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; if (g[i] < 0) continue;
      const hole = y >= dense ? (x % 2 || y % 2) : ((x + y) % 2 === 0);
      if (y < to ? ((x + y) % 2 === 0 && (y - from) % 4 < 2) : hole) g[i] = -2;
    }
  };

  // ---- the body: gown, apron, bodice with ribs showing, puffed sleeves, bony arms reaching for the churn
  pixSprite(scene, 'milkmaid', 112, 150, p => {
    const pts = [[38, 64], [74, 64], [88, 96], [106, 132]];
    for (let k = 12; k >= 0; k--) { const x = 6 + k * 100 / 12; pts.push([x, k % 2 ? 128 + (k % 4 === 1 ? 10 : 4) : 147 - (k % 3) * 5]); }
    pts.push([6, 132], [24, 96]);
    p.poly(pts, GD);                                                                       // the gown, ragged at the hem
    p.poly([[16, 136], [10, 149], [22, 140]], GD); p.poly([[90, 136], [100, 149], [96, 134]], GD);   // trailing wisps
    p.poly([[45, 66], [67, 66], [74, 122], [68, 130], [61, 122], [55, 131], [49, 122], [43, 130], [38, 122]], AP);   // apron
    for (const y of [82, 96, 110]) { const pts2 = []; for (let x = 44; x <= 68; x += 4) pts2.push([x, y + Math.round(Math.sin(x * 0.5 + y) * 2)]); p.line(pts2, 0xa8c4ea); }   // ectoplasm swirls
    p.rect(40, 62, 72, 66, 0xe8f0ff); p.line([[40, 64], [32, 74], [30, 84]], 0xe8f0ff, 2);  // waistband and apron tie
    p.poly([[42, 28], [70, 28], [74, 64], [38, 64]], GH);                                   // bodice
    for (let i = 0; i < 5; i++) { const y = 36 + i * 5; p.line([[54, y], [47, y + 2], [44, y + 5]], 0x6a7aa8); p.line([[58, y], [65, y + 2], [68, y + 5]], 0x6a7aa8); }   // ribs through the cloth
    p.line([[56, 34], [56, 60]], 0x6a7aa8);
    p.ell(56, 28, 11, 4, AP); for (let x = 46; x <= 66; x += 4) p.px(x, 31, 0xc8d8f0);      // lace collar
    p.ell(38, 35, 8, 7, GH); p.ell(74, 35, 8, 7, GH);                                       // puffed sleeves
    p.line([[34, 40], [38, 60], [60, 84]], GD[1], 5); p.line([[78, 40], [84, 62], [84, 80]], GD[1], 5);   // arms
    p.ell(62, 86, 4, 4, GH); p.ell(85, 83, 4, 4, GH);                                       // hands
    p.rect(52, 20, 60, 28, GH[1]);                                                          // neck
    for (const [x, y] of [[30, 100], [80, 104], [60, 120], [20, 118]]) p.px(x, y, 0xffffff);
  }, 1, dither(98, 112, 126));

  // ---- her head: a tattered bonnet and three faces (0 hollow-eyed, 1 eyes wide - attacking, 2 screaming - hit)
  const head = (key, v) => pixSprite(scene, key, 50, 50, p => {
    const BON = [0xe4dcf2, 0xb0a4cc, 0x6e6290], FR = [0xf6f2ff, 0xd4cce6, 0x8e84aa];
    p.ell(25, 14, 21, 11, BON);                                                             // the bonnet (a Victorian mob cap)
    p.line([[6, 16], [44, 16]], 0x8a6aaa, 2);                                                 // its band
    for (let k = 0; k < 13; k++) { const a = Math.PI * (0.05 + 0.9 * k / 12); p.ell(25 - Math.cos(a) * 19, 30 - Math.sin(a) * 15, 3, 3, FR); }   // the frilled brim, all round her face
    p.line([[9, 28], [5, 42]], 0xb090d0, 2); p.line([[41, 28], [45, 42]], 0xb090d0, 2);     // ribbons
    p.line([[14, 26], [11, 40]], 0xdde8f6, 2); p.line([[36, 26], [39, 40]], 0xdde8f6, 2);   // wisps of hair
    p.ell(25, 32, 11, 13, GH);                                                              // face
    if (v === 2) {                                                                          // SCREAM: eyes screwed up, maw agape
      p.line([[16, 28], [23, 31]], DARK, 2); p.line([[34, 28], [27, 31]], DARK, 2);
      p.px(19, 30, 0xffe24a); p.px(31, 30, 0xffe24a);
      p.ell(25, 40, 6, 7, DARK); p.ell(25, 43, 3, 3, 0x6a2a8a);
      for (const x of [21, 24, 27, 30]) p.px(x, 34, 0xffffff);
    } else {
      const ew = v === 1 ? 4.5 : 3.5, eh = v === 1 ? 5.5 : 4;
      p.ell(20, 30, ew, eh, DARK); p.ell(30, 30, ew, eh, DARK);                             // hollow sockets
      if (v === 1) { p.ell(20, 30, 2.5, 3, 0xffd23f); p.ell(30, 30, 2.5, 3, 0xffd23f); p.ell(20, 30, 1, 1.5, 0xfffbe0); p.ell(30, 30, 1, 1.5, 0xfffbe0); }
      else { p.rect(19, 30, 20, 31, 0xffe24a); p.rect(29, 30, 30, 31, 0xffe24a); p.px(20, 29, 0xfff6b0); p.px(30, 29, 0xfff6b0); }
      if (v === 1) p.ell(25, 40, 3, 4, DARK); else p.ell(25, 39, 2, 2.5, DARK);
    }
  }, 1, (g, w) => { for (const [x, y] of [[3, 12], [4, 13], [46, 10], [45, 11], [12, 4], [38, 5], [30, 3], [47, 18]]) g[y * w + x] = -2; });   // moth-eaten bonnet
  head('mm_head0', 0); head('mm_head1', 1); head('mm_head2', 2);

  // ---- act 2: a spectral cow skull (1 = eyes blazing red, jaw dropped)
  const skull = (key, v) => pixSprite(scene, key, 58, 54, p => {
    p.poly([[18, 12], [8, 10], [2, 2], [0, 8], [6, 16], [16, 18]], BONE); p.poly([[40, 12], [50, 10], [56, 2], [58, 8], [52, 16], [42, 18]], BONE);   // horns
    p.ell(29, 17, 15, 11, BONE);                                                            // cranium
    p.poly([[18, 20], [40, 20], [36, 48], [22, 48]], BONE);                                 // long snout
    p.ell(25, 45, 2, 2, DARK); p.ell(33, 45, 2, 2, DARK);                                   // nostrils
    p.line([[29, 8], [27, 16], [30, 22]], 0xa89878);                                        // a crack
    p.ell(22, 19, 5, 5, DARK); p.ell(36, 19, 5, 5, DARK);                                   // sockets
    const c = v ? [0xfff0c0, 0xff4a2a, 0x9a1010] : [0xfffbe0, 0xffe24a, 0xc89a1a];
    p.ell(22, 19, v ? 3 : 2, v ? 3 : 2, c); p.ell(36, 19, v ? 3 : 2, v ? 3 : 2, c);
    if (v) { p.rect(23, 49, 35, 52, DARK); p.poly([[22, 50], [36, 50], [34, 53], [24, 53]], BONE); }
  }, 1);
  skull('mm_skull0', 0); skull('mm_skull1', 1);

  // ---- the churn: rusted, with ghostly whey glowing at the rim
  pixSprite(scene, 'mm_churn', 36, 50, p => {
    const RU = [0xb89070, 0x7a5a48, 0x46302a];
    p.poly([[9, 10], [27, 10], [32, 47], [4, 47]], RU);
    for (const y of [17, 33, 44]) p.rect(5, y, 31, y + 1, 0x8aa0b8);
    for (const [x, y] of [[12, 24], [24, 28], [16, 39], [27, 21], [9, 36]]) { p.px(x, y, 0xc07a4a); p.px(x + 1, y, 0x5a3a2a); }   // rust
    p.line([[4, 20], [0, 26], [4, 32]], 0x8aa0b8, 2); p.line([[32, 20], [35, 26], [32, 32]], 0x8aa0b8, 2);   // handles
    p.ell(18, 9, 11, 3, [0xd8e2ee, 0x8aa0b8, 0x52648c]);                                    // rim
    p.ell(18, 9, 8, 2, [0xd8ffff, 0x7dfcff, 0x2ab8d8]);                                     // glowing whey
    for (const [x, l] of [[11, 7], [22, 4], [26, 9]]) p.line([[x, 10], [x, 10 + l]], 0x7dfcff);   // dribbling down the side
  }, 1);

  pixSprite(scene, 'mm_heart', 16, 15, p => {                                               // act 2's weak spot
    const RD = [0xffc0c0, 0xff3a4a, 0x9a1020];
    p.ell(5, 5, 4, 4, RD); p.ell(11, 5, 4, 4, RD); p.poly([[1, 6], [15, 6], [8, 14]], RD); p.px(4, 3, 0xffffff); p.px(5, 3, 0xffffff);
  }, 1);

  // ---- a skeletal ghost cow, two gallop frames (faces right)
  const cow = (key, f) => pixSprite(scene, key, 66, 42, p => {
    p.ell(30, 18, 21, 10, GH);                                                              // ghostly hide
    for (let x = 18; x <= 40; x += 5) p.line([[x, 11], [x - 1, 25]], 0x6a7aa8);             // ribs
    p.line([[10, 14], [50, 14]], 0x6a7aa8);                                                 // spine
    p.line([[10, 16], [3, 12], [1, 20]], GH[1], 2);                                         // tail
    const legs = f ? [[14, 26, 8, 40], [22, 26, 26, 40], [38, 26, 34, 40], [46, 26, 52, 40]] : [[14, 26, 18, 40], [22, 26, 16, 40], [38, 26, 44, 40], [46, 26, 42, 40]];
    for (const [x0, y0, x1, y1] of legs) p.line([[x0, y0], [x1, y1]], BONE[1], 3);
    p.poly([[48, 8], [62, 12], [64, 22], [58, 26], [50, 18]], BONE);                        // skull
    p.poly([[50, 7], [46, 0], [52, 4]], BONE); p.poly([[56, 8], [60, 0], [58, 8]], BONE);   // horns
    p.ell(56, 13, 2, 2, DARK); p.px(56, 13, 0x7dfcff);
  }, 1, (g, w, h) => { for (let y = 8; y < 29; y++) for (let x = 9; x < 52; x++) { const i = y * w + x; if (g[i] >= 0 && (x + y) % 2 === 0 && !(y > 10 && y < 26 && x % 5 === 3)) g[i] = -2; } });
  cow('ghostcow0', 0); cow('ghostcow1', 1);

  pixSprite(scene, 'curd', 12, 12, p => { p.ell(6, 6, 5, 5, [0xfffbe0, 0xffe68a, 0xd8b040]); }, 1, (g, w) => { for (const [x, y] of [[5, 5], [6, 5], [5, 6], [6, 6]]) g[y * w + x] = -2; });
  pixSprite(scene, 'mm_rag', 7, 6, p => { p.poly([[0, 1], [6, 0], [5, 5], [1, 4]], [0xf8f8ff, 0xd8dcec, 0x9aa0bc]); }, 1);
  pixSprite(scene, 'mm_splat', 6, 6, p => { p.ell(3, 3, 3, 3, [0xfff0c0, 0xffa040, 0xd0601a]); }, 1);
}

const MilkmaidMixin = {
  // a point on her (texture px from the body centre) -> where it is on the planet (see mPt in mandoline.js)
  mmPt(e, ox, oy) { return this.mPt(e, ox, oy); },

  mmInit(e) {
    const S = e.mmS = { st: 'idle', t: 0, cd: 2.2, i: 0, p2: false, tilt: 0, tiltGoal: 0.12, wide: 0, scream: 0, ghosts: [], drips: [], dripT: 0, hsCd: 0, critCd: 0 };
    S.head = this.add.image(0, 0, 'mm_head0').setDepth(6.02);
    S.churn = this.add.image(0, 0, 'mm_churn').setDepth(6.03);
    S.heart = this.add.image(0, 0, 'mm_heart').setDepth(6.015).setAlpha(0);
    bakedGlow(S.heart, 0xff3a4a, 3, 8); bakedGlow(S.churn, 0x7dfcff, 1, 4);
    e.spr.setAlpha(0.9); bakedGlow(e.spr, 0x9fd8ff, 2, 8);           // a cold spectral glow
    if (!this.mm) this.mmScene();
    this.mm.boss = e;
    return S;
  },
  mmScene() {
    const M = this.mm = { g: this.add.graphics().setDepth(6.6), glow: this.add.graphics().setDepth(7.65).setBlendMode(Phaser.BlendModes.ADD), flood: null, arena: null, stream: null };
    return M;
  },

  // ---- her brain (called from the boss AI each frame)
  mmAI(e, dt, P, phase2) {
    const S = e.mmS || this.mmInit(e), M = this.mm;
    S.t += dt; S.wide = Math.max(0, S.wide - dt); S.scream = Math.max(0, S.scream - dt); S.hsCd -= dt; S.critCd -= dt;
    S.tilt += (S.tiltGoal - S.tilt) * Math.min(1, dt * 5);
    // ACT 2 begins
    if (phase2 && !S.p2 && S.st !== 'rage') { this.mmEnd(e); S.p2 = true; S.st = 'rage'; S.t = 0; e.mmLock = true; S.h0 = e.h; this.banner('THE SOUR STAMPEDE!\nSHOOT HER GLOWING HEART!'); Sound.sfx('wail'); }
    const arenaOn = M.arena && M.arena.st !== 'break';
    switch (S.st) {
      case 'idle': {
        e.mmLock = false; S.tiltGoal = 0.12 + Math.sin(this.t * 1.3) * 0.08;
        if (arenaOn) e.theta = this.mmClampIn(e.theta, 0.1);
        S.cd -= dt;
        if (S.cd <= 0) {
          const seq = S.p2 ? ['stampede', 'rings', 'teleport', 'cascade', 'stampede', 'triangle', 'rings', 'teleport'] : ['rings', 'cascade', 'teleport', 'rings', 'triangle', 'teleport'];
          let a = seq[S.i++ % seq.length];
          if (arenaOn && (a === 'cascade' || a === 'teleport' || a === 'triangle')) a = 'rings';    // inside the cage: keep it close
          this.mmStart(e, a, P);
        }
        break;
      }
      case 'rings': {                                  // three volleys of spinning curd rings, then skimmers both ways
        e.mmLock = false; S.wide = 0.2;
        if (S.t > 0.55 && S.n < 3 && S.t > 0.55 + S.n * 0.5) {
          const m = this.mmMouth(e), n = S.p2 ? 14 : 12, curl = (S.n % 2 ? -1 : 1) * (S.p2 ? 0.95 : 0.75), off = S.n * 0.2;
          for (let k = 0; k < n; k++) {
            const a = off + k * TAU / n, b = this.addEBullet('curd', m.theta, m.h, 155 * Math.sin(a), 155 * Math.cos(a), 7, 5.5);
            b.curl = curl; b.spinV = 9;
          }
          S.n++; Sound.sfx('fan'); S.tiltGoal = 0.5;
          if (S.n === 3) for (const sd of [-1, 1]) { const b = this.addEBullet('curd', e.theta, 26, sd * 300, 0, 8, 11); b.spinV = 14; b.spr.bsx = b.spr.bsy = 1.4; }   // round the world and back
        }
        if (S.t > 2.2) this.mmIdle(e);
        break;
      }
      case 'cascade': {                                // up high, tip the churn, pour: a flood rolls round the planet
        e.mmLock = true;
        if (S.t < 0.9) {
          S.wide = 0.2; const k = Math.min(1, dt * 3.5);
          e.h += (265 - e.h) * k; e.theta = wrap(e.theta + angDiff(S.tgt, e.theta) * k);
        } else if (S.t < 2.4) {
          S.tiltGoal = 2.05; S.wide = 0.2;
          if (S.t > 1.15) {
            const m = this.mmMouth(e);
            M.stream = { theta: m.theta, h: m.h, t: (M.stream && M.stream.t) || 0 };
            M.stream.t += dt;
            if (!M.flood && M.stream.t > 0.35) { M.flood = { theta: m.theta, t: 0 }; Sound.sfx('bigsplat'); Sound.sfx('churnclang'); this.cameras.main.shake(220, 0.01); this.burst(m.theta, 10, 'mm_splat', 16, 1.4); }
          }
        } else {
          M.stream = null; S.tiltGoal = 0.12;
          e.h += (MM.idleH - e.h) * Math.min(1, dt * 2);
          if (S.t > 3.2) this.mmIdle(e);
        }
        break;
      }
      case 'triangle': {                               // the cage: neon triangles lock into laser walls round Chris
        e.mmLock = false; S.wide = 0.2;
        if (!M.arena) { M.arena = { st: 'lock', t: 0, c: P.theta, half: 0.46, from: { theta: e.theta, h: e.h } }; Sound.sfx('alarm'); }
        if (S.t > 1.3) this.mmIdle(e, 0.6);
        break;
      }
      case 'teleport': {                               // streak across the sky to his far side, leaving after-images
        e.mmLock = true;
        const k = Math.min(1, S.t / 0.45), ease = k * k * (3 - 2 * k);
        e.theta = wrap(S.from + angDiff(S.tgt, S.from) * ease); e.h = S.h0 + (MM.idleH - S.h0) * ease + Math.sin(k * Math.PI) * 40;
        e.spr.setAlpha(0.35 + 0.55 * Math.abs(1 - 2 * k));
        if ((S.gT = (S.gT || 0) - dt) <= 0) { S.gT = 0.035; this.mmGhost(e); }
        if (k >= 1) { e.spr.setAlpha(0.9); this.mmIdle(e, 0.5); }
        break;
      }
      case 'stampede': {                               // skeletal cows rise from the ribcages and charge round the planet
        e.mmLock = false; S.wide = 0.2;
        if (!S.spawned) {
          S.spawned = true; Sound.sfx('wail');
          const ribs = ((this.def.props || []).find(q => q.tex === 'bone_ribcage') || { at: [] }).at.map(a => a[0]);
          let spots = ribs.filter(t => Math.abs(angDiff(t, P.theta)) < 1.3 && Math.abs(angDiff(t, P.theta)) > 0.18);
          if (spots.length < 2) spots = spots.concat([wrap(P.theta - rnd(0.8, 1.1)), wrap(P.theta + rnd(0.8, 1.1))]);
          spots = spots.slice(0, 3);
          spots.forEach((t, i) => { for (let j = 0; j < (S.n2 || 1); j++) this.time.delayedCall((i * 0.55 + j * 0.45) * 1000, () => { if (e.hp > 0 && this.state === 'play') this.mmCow(t, Math.sign(angDiff(P.theta, t)) || 1); }); });
          S.n2 = 2;
        }
        if (S.t > 2.4) this.mmIdle(e);
        break;
      }
      case 'rage': {                                   // act 2: the bonnet shreds, a cow skull, and THE SLAM
        e.mmLock = true;
        if (S.t < 1.0) {
          e.theta = wrap(e.theta + Math.sin(S.t * 70) * 3 / R * dt * 10); S.scream = 0.2;
          if (S.t > 0.3 && !S.shred) {
            S.shred = true; const hp = this.mmPt(e, MM.head[0], MM.head[1] - 12);
            for (let k = 0; k < 18; k++) { const im = this.add.image(0, 0, 'mm_rag').setDepth(6.1); im.bsx = im.bsy = rnd(1, 1.8); this.parts.push({ theta: hp.theta, h: hp.h, vt: rnd(-220, 220), vh: rnd(60, 300), life: rnd(0.8, 1.4), spr: im, rot: 0, rv: rnd(-10, 10) }); }
            Sound.sfx('crash'); this.cameras.main.flash(200, 200, 230, 255);
          }
        } else if (S.t < 1.35) {
          e.h -= 900 * dt; S.tiltGoal = -0.3;
          if (e.h <= 70 && !S.slammed) {
            S.slammed = true; e.h = 70;
            Sound.sfx('churnclang'); Sound.sfx('boom'); buzz([80, 40, 120]); this.cameras.main.shake(450, 0.022); this.camPunch(0.06); this.hitStop = 0.08;
            this.burst(e.theta, 6, 'mm_splat', 26, 1.8); this.bang(e.theta, 8, 50);
            for (const sd of [-1, 1]) this.addEBullet('crumb', wrap(e.theta + sd * 50 / R), 9, sd * 260, 0, 11, 2.6);
          }
        } else if (S.t < 2.4) {
          e.h += (MM.idleH - e.h) * Math.min(1, dt * 2.4); S.tiltGoal = 0.12;
        } else { S.i = 0; this.mmIdle(e, 0.3); }
        if (!S.slammed && S.t >= 1.35) S.t = 1.0;      // keep diving until she hits the ground
        break;
      }
    }
  },
  mmStart(e, a, P) {
    const S = e.mmS; S.st = a; S.t = 0; S.n = 0; S.spawned = false;
    if (a !== 'teleport') Sound.sfx('wail');
    if (a === 'cascade') S.tgt = wrap(P.theta + (Math.random() < 0.5 ? -1 : 1) * 0.1);
    if (a === 'teleport') { S.from = e.theta; S.h0 = e.h; S.tgt = wrap(P.theta - Math.sign(angDiff(e.theta, P.theta) || 1) * rnd(0.35, 0.5)); Sound.sfx('whoo'); }
  },
  mmIdle(e, cd) { const S = e.mmS; S.st = 'idle'; S.t = 0; S.cd = cd !== undefined ? cd : (S.p2 ? rnd(0.7, 1.1) : rnd(1.2, 1.7)); e.mmLock = false; },
  mmEnd(e) { const M = this.mm; if (M) { M.stream = null; } e.mmS.tiltGoal = 0.12; e.spr.setAlpha(0.9); },

  // where the churn's mouth is, on the planet
  mmMouth(e) {
    const S = e.mmS, a = S.tilt, [mx, my] = MM.mouth;
    return this.mmPt(e, MM.churn[0] + mx * Math.cos(a) - my * Math.sin(a), MM.churn[1] + mx * Math.sin(a) + my * Math.cos(a));
  },
  mmClampIn(theta, margin) {
    const A = this.mm.arena, d = angDiff(theta, A.c), lim = A.half - (margin || 0);
    return Math.abs(d) > lim ? wrap(A.c + Math.sign(d) * lim) : theta;
  },
  mmGhost(e) {                                         // a fading after-image
    const S = e.mmS, im = this.add.image(e.spr.x, e.spr.y, 'milkmaid').setDepth(5.9).setRotation(e.spr.rotation).setScale(e.spr.scaleX, e.spr.scaleY).setTint(0x6aa8ff).setAlpha(0.55).setBlendMode(Phaser.BlendModes.ADD);
    const hd = this.add.image(S.head.x, S.head.y, S.head.texture.key).setDepth(5.9).setRotation(S.head.rotation).setScale(S.head.scaleX, S.head.scaleY).setTint(0x6aa8ff).setAlpha(0.55).setBlendMode(Phaser.BlendModes.ADD);
    S.ghosts.push({ ims: [im, hd], life: 0.45 });
  },
  mmCow(theta, dir) {
    const b = this.addEBullet('ghostcow0', theta, 0, 0, 0, 18, 9);
    b.cow = { t: 0, dir, f: 0 }; b.r = -20; b.spr.bsx = b.spr.bsy = 1.25; b.spr.setAlpha(0);
    this.burst(theta, 4, 'crumb', 8, 0.8); Sound.sfx('whoo');
  },

  // ---- hits: act 2 the heart is the weak spot; juice on every hit
  mmHitK(e, th, h) {
    const S = e.mmS; if (!S || !S.p2) return 1;
    if (th === undefined) return 0.6;
    const hp = this.mmPt(e, MM.heart[0], MM.heart[1]);
    if (dist2(th, h, hp.theta, hp.h) < 24 * 24) {
      if (S.critCd <= 0) { S.critCd = 0.5; this.popup(hp.theta, hp.h + 20, 'HEART!', '#ff5a6a', true); }
      S.heartFlash = 0.12; return 2.4;
    }
    return 0.45;
  },
  mmOnHit(e, th, h) {
    const S = e.mmS; if (!S) return;
    S.scream = 0.28;
    for (let k = 0; k < 3; k++) { const s = this.add.image(0, 0, 'mm_splat').setDepth(6.2); s.bsx = s.bsy = rnd(0.8, 1.6); this.parts.push({ theta: th, h, vt: rnd(-160, 160), vh: rnd(40, 220), life: rnd(0.3, 0.55), spr: s, rot: 0, rv: rnd(-8, 8) }); }
    if (S.hsCd <= 0) { S.hsCd = 0.14; this.hitStop = Math.max(this.hitStop || 0, 0.022); }    // squishy micro-freeze
  },

  // ---- per frame in play: hazards (flood, pour, cage), cows, drips, after-images; tidy up when she's gone
  mmUpdate(dt) {
    const M = this.mm, P = this.pl;
    if (!M) return;
    const boss = this.enemies.find(e => e.ai === 'milkmaid' && e.hp > 0);
    if (!boss) { this.mmCleanup(); return; }
    const S = boss.mmS;
    // the flood
    if (M.flood) {
      M.flood.t += dt;
      if (M.flood.t > 6.6) M.flood = null;
      else if (P.invuln <= 0) {
        const L = this.mmFloodAt(P.theta);
        if (P.h < L - 4) { this.hurt(); P.vh = Math.max(P.vh, 420); }
      }
    }
    // the pour itself
    if (M.stream && P.invuln <= 0 && Math.abs(angDiff(P.theta, M.stream.theta)) * R < 20 && P.h < M.stream.h) this.hurt();
    // the cage
    const A = M.arena;
    if (A) {
      A.t += dt;
      if (A.st === 'lock' && A.t > 1.2) { A.st = 'on'; A.t = 0; Sound.sfx('zap'); this.cameras.main.shake(120, 0.006); }
      else if (A.st === 'on') {
        A.half = 0.46 - 0.16 * Math.min(1, A.t / 8);
        const d = angDiff(P.theta, A.c), lim = A.half - 14 / R;
        if (Math.abs(d) > lim) { if (P.invuln <= 0 && Math.abs(d) > A.half - 8 / R) this.hurt(); P.theta = wrap(A.c + Math.sign(d) * lim); P.vx = -Math.sign(d) * 160; }
        if (P.h > MM.top - 26) { if (P.invuln <= 0) this.hurt(); P.h = MM.top - 30; P.vh = Math.min(P.vh, -120); }
        if (A.t > 8) { A.st = 'break'; A.t = 0; Sound.sfx('crash'); this.burst(A.c, 150, 'spark', 20, 1.6); }
      } else if (A.st === 'break' && A.t > 0.5) M.arena = null;
    }
    // ghost cows: rise out of the ground, then gallop
    for (const b of this.eBullets) if (b.cow) {
      const C = b.cow; C.t += dt;
      if (C.t < 0.7) { const k = C.t / 0.7; b.vt = 0; b.h = 22 * k; b.r = -20; b.spr.sqy = 0.25 + 0.75 * k; b.spr.setAlpha(k * 0.9); }   // clambering up out of the ribcage
      else { b.spr.sqy = 1; b.vt = C.dir * 330; b.r = 18; b.h = 22 + Math.abs(Math.sin(C.t * 11)) * 7; b.spr.setAlpha(0.8 + 0.15 * Math.sin(C.t * 20)); if (b.life < 0.6) b.spr.setAlpha(b.life / 0.6); }
      C.f += dt; if (C.f > 0.11) { C.f = 0; b.spr.setTexture(b.spr.texture.key === 'ghostcow0' ? 'ghostcow1' : 'ghostcow0'); }
      b.spr.setFlipX(C.dir < 0);
    }
    // whey dripping off the churn
    S.dripT -= dt;
    if (S.dripT <= 0) { S.dripT = 0.12; const m = this.mmMouth(boss); S.drips.push({ theta: wrap(m.theta + rnd(-8, 8) / R), h: m.h - 6, vh: -40, life: 1.6 }); }
    for (let i = S.drips.length - 1; i >= 0; i--) { const d = S.drips[i]; d.vh -= 420 * dt; d.h += d.vh * dt; d.life -= dt; if (d.life <= 0 || d.h < 0) S.drips.splice(i, 1); }
    for (let i = S.ghosts.length - 1; i >= 0; i--) { const G = S.ghosts[i]; G.life -= dt; for (const im of G.ims) im.setAlpha(Math.max(0, G.life / 0.45 * 0.55)); if (G.life <= 0) { G.ims.forEach(im => im.destroy()); S.ghosts.splice(i, 1); } }
  },
  mmFloodAt(theta) {                                   // how deep the ghost-milk is here: a crest rolling out both ways, a pool behind it
    const F = this.mm.flood; if (!F) return 0;
    const t = F.t, v = 360, d = Math.abs(angDiff(theta, F.theta)) * R, s = v * t, amp = Math.max(0, 1 - t / 5);
    const crest = d < s + 120 ? 58 * amp * Math.exp(-Math.pow((d - s) / 46, 2)) : 0;
    const behind = d < s ? 34 * Math.max(0, Math.min(1, 1 - (t - d / v) / 2)) : 0;
    const L = Math.max(crest, behind);
    return L > 2 ? L + Math.sin(d / 14 - t * 7) * 2 : L;
  },
  mmCleanup() {
    const M = this.mm; if (!M) return;
    M.g.clear(); M.glow.clear(); M.flood = null; M.arena = null; M.stream = null;
    if (M.boss) this.mmParts(M.boss, false);
    for (const e of this.enemies) if (e.mmS) this.mmParts(e, false);
    for (const b of this.eBullets) if (b.cow) b.life = 0;
    this.mm = null; M.g.destroy(); M.glow.destroy();
  },
  mmParts(e, keep) {
    const S = e.mmS; if (!S || keep) return;
    for (const im of [S.head, S.churn, S.heart]) if (im) im.destroy();
    for (const G of S.ghosts) G.ims.forEach(im => im.destroy());
    S.ghosts = []; S.head = S.churn = S.heart = null;
  },

  // ---- drawing (from render, after she's been placed)
  mmDraw(e) {
    const S = e.mmS; if (!S || !S.head) return;
    const vis = e.spr.visible, rot = e.spr.rotation, sx = e.spr.scaleX, sy = e.spr.scaleY;
    if (e.mmS.st !== 'teleport') e.spr.setAlpha((S.p2 ? 0.82 : 0.88) + 0.08 * Math.sin(this.t * 3));
    const al = e.spr.alpha;
    const put = (im, off, extra, a) => { const p = this.mScreen(e, off); im.setPosition(p.x, p.y).setRotation(rot + (extra || 0)).setScale(sx, sy).setVisible(vis).setAlpha(a === undefined ? al : a); };
    const face = S.scream > 0 ? 2 : (S.wide > 0 ? 1 : 0);
    S.head.setTexture(S.p2 ? (face ? 'mm_skull1' : 'mm_skull0') : 'mm_head' + face);
    put(S.head, [MM.head[0], MM.head[1] + (S.p2 ? -2 : 0) + Math.sin(this.t * 2.2) * 1.5], Math.sin(this.t * 1.7) * 0.06);
    put(S.churn, MM.churn, S.tilt, Math.min(1, al + 0.1));
    S.heartFlash = Math.max(0, (S.heartFlash || 0) - (this.lastDt || 0.016));
    put(S.heart, MM.heart, 0, S.p2 ? 0.75 + 0.25 * Math.sin(this.t * 9) : 0);
    S.heart.setScale(sx * (1 + 0.15 * Math.sin(this.t * 9)) * (S.heartFlash > 0 ? 1.4 : 1), sy * (1 + 0.15 * Math.sin(this.t * 9)) * (S.heartFlash > 0 ? 1.4 : 1));
    if (S.heartFlash > 0) S.heart.setTintFill(0xffffff); else S.heart.clearTint();
    this.mmDrawHaz(e);
  },
  mmDrawHaz(e) {
    const M = this.mm; if (!M) return;
    const g = M.g, gl = M.glow, S = e.mmS, z = this.zoom, vt = this.viewT();
    g.clear(); gl.clear();
    // whey drips
    for (const d of S.drips) { const p = this.screenPos(d.theta, d.h); if (p.vis) gl.fillStyle(0x7dfcff, Math.min(1, d.life)).fillRect(p.x - 1.5 * z, p.y - 2 * z, 3 * z, 4 * z); }
    // the pour: a wobbling column of curdled ghost-milk from the churn's mouth to the ground
    if (M.stream) {
      const st = M.stream, n = 14, w0 = 10 * z, reach = Math.min(1, st.t / 0.35);
      const left = [], right = [];
      for (let k = 0; k <= n; k++) {
        const f = k / n, hh = st.h - st.h * f * reach, wob = Math.sin(this.t * 18 + f * 9) * 3, th = wrap(st.theta + (wob + f * 6) / R);
        const p = this.screenPos(th, hh), ang = angDiff(th, vt), wd = w0 * (0.7 + f * 0.6);
        left.push({ x: p.x - Math.cos(ang) * wd, y: p.y - Math.sin(ang) * wd }); right.push({ x: p.x + Math.cos(ang) * wd, y: p.y + Math.sin(ang) * wd });
      }
      g.fillStyle(0xeaf6ff, 0.9).fillPoints(left.concat(right.reverse()), true);
      gl.fillStyle(0x7dfcff, 0.25).fillPoints(left.concat(right), true);
    }
    // the flood: milk lying on the planet, foaming along the crest
    if (M.flood) {
      const step = 0.01, a0 = vt - 1.5;
      let prev = null;
      for (let k = 0; k <= 300; k++) {
        const th = wrap(a0 + k * step), L = this.mmFloodAt(th);
        if (L > 1.5) {
          const b0 = this.screenPos(th, -4), t0 = this.screenPos(th, L);
          if (prev) {
            g.fillStyle(0xe4f2ff, 0.86).fillPoints([prev.b, prev.t, t0, b0], true);
            g.lineStyle(2 * z, 0xffffff, 1).lineBetween(prev.t.x, prev.t.y, t0.x, t0.y);
            if (L > 30) gl.lineStyle(5 * z, 0x7dfcff, 0.3).lineBetween(prev.t.x, prev.t.y, t0.x, t0.y);
          }
          prev = { b: b0, t: t0 };
        } else prev = null;
      }
    }
    // the cage: neon triangles and laser walls
    const A = M.arena;
    if (A) {
      const k = A.st === 'lock' ? Math.min(1, A.t / 1.2) : 1, fade = A.st === 'break' ? Math.max(0, 1 - A.t / 0.5) : 1;
      const thL = wrap(A.c - A.half), thR = wrap(A.c + A.half), TOP = MM.top;
      const corners = [[thL, 6], [thL, TOP], [A.c, TOP], [thR, TOP], [thR, 6]];
      const tri = (th, h, r, a) => {
        const p = this.screenPos(th, h), pts = [0, 1, 2].map(i => { const q = a + i * TAU / 3; return { x: p.x + Math.cos(q) * r, y: p.y + Math.sin(q) * r }; });
        gl.fillStyle(0xc040ff, 0.35 * fade).fillPoints(pts, true); gl.lineStyle(3 * z, 0xe0a0ff, 0.95 * fade).strokePoints(pts, true);
        return p;
      };
      const pts = corners.map(([th, h], i) => {
        const T = k < 1 ? wrap(A.from.theta + angDiff(th, A.from.theta) * k) : th, H = k < 1 ? A.from.h + (h - A.from.h) * k : h;
        return tri(T, H, 15 * z * (1 + 0.15 * Math.sin(this.t * 8 + i)), this.t * 3 + i);
      });
      if (A.st === 'lock') {                         // targeting lines flickering between them
        if (Math.random() < 0.6) for (let i = 0; i < pts.length - 1; i++) gl.lineStyle(1 * z, 0xe0a0ff, 0.6).lineBetween(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y);
      } else {
        const beam = (pa, pb) => { gl.lineStyle(12 * z, 0xa020ff, 0.35 * fade).lineBetween(pa.x, pa.y, pb.x, pb.y); gl.lineStyle(4 * z, 0xf0d0ff, 0.95 * fade).lineBetween(pa.x, pa.y, pb.x, pb.y); };
        beam(pts[0], pts[1]); beam(pts[4], pts[3]);
        let last = pts[1];                                     // the lid follows the curve of the sky
        for (let i = 1; i <= 12; i++) { const q = this.screenPos(wrap(thL + 2 * A.half * i / 12), TOP); beam(last, q); last = q; }
      }
    }
  }
};
