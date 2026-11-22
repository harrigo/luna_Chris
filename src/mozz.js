// LEVEL 4: MOUNT MOZZARELLA - "the Pizza Inferno". A charred pizza-crust planet with white-hot mozzarella pools,
// marinara geysers and a volcano on the horizon that keeps erupting.
//
//  VOLCANO       (v3.62) every 10-14 s in the waves the volcano behind the horizon erupts, and after a moment's warning
//                EITHER one pepperoni-crust BOULDER comes bouncing in (an arrow at the edge of the screen shows which
//                side: jump it, or shoot it to bits) OR two LAVA BOMBS drop where the target rings are. The boss sets
//                off MAD ERUPTIONS: a whole carpet of rings sweeping across, shown two seconds ahead, with a gap in it.
//  MARINARA      the geysers spew boiling marinara: blobs fly up and rain back down round the vent.
//  ANCHOVY SWARMERS  little metal fish in a shoal of five that circles round a point drifting after you, snapping;
//                every couple of seconds one darts straight at you, then rejoins the shoal.
//  TOASTY OVEN DRONE  a hovering mini oven: follows you overhead, flings homing pizza-cutter wheels, and every few
//                seconds shudders and SLAMS down onto the crust, sending shockwaves along the ground both ways.
//  BOSS: THE MOZZARELLA MAGMA-GOLEM  see magmagolem.js
//
// Mixed into Level1 (see main.js); level state in this.mz.

// mountains of molten mozzarella on the horizon: six different heaps (one to three lumpy peaks, drips running down,
// browned blisters, a charred crust foot, some with a bubbling lava crater or cheese strings stretched between peaks).
// MOZZ_PEAKS[key] = the tops (px from the bottom centre) where steam and bubbles come off them.
const MOZZ_PEAKS = {};
const MOZZ_MTNS = [
  { w: 112, h: 78, peaks: [[0.5, 1, 0.34]], crater: true },
  { w: 132, h: 70, peaks: [[0.32, 0.95, 0.24], [0.7, 0.72, 0.22]], strings: true },
  { w: 92, h: 92, peaks: [[0.48, 1, 0.26], [0.72, 0.55, 0.16]] },
  { w: 150, h: 60, peaks: [[0.25, 0.75, 0.2], [0.52, 1, 0.22], [0.8, 0.6, 0.16]], crater: true },
  { w: 84, h: 64, peaks: [[0.5, 1, 0.36]], slump: true },
  { w: 124, h: 86, peaks: [[0.4, 1, 0.22], [0.66, 0.85, 0.2]], strings: true, crater: true }
];
function makeMozzMountains(scene) {
  MOZZ_MTNS.forEach((M, idx) => {
    const key = 'mozzmtn' + idx, W = M.w, H = M.h, base = H - 1, r = rng(900 + idx * 37);
    // the planet curves away under a wide flat-bottomed sprite, leaving its ends in the air: so the foot runs DOWN at the
    // ends to follow the curve (at the scale they're shown, ~1.4 world units a pixel on an R440 planet), into extra rows
    // below the base, and the texture's origin sits at the base row (see customData.oy, used by the prop code)
    const PAD = 12, sag = x => Math.min(PAD, Math.pow(x - W / 2, 2) * 1.4 / (2 * 440)), bot = x => Math.round(base + sag(x));
    const MOZ = [0xfffbe8, 0xf4dea0, 0xc89650];
    const top = x => {                                          // the silhouette: lumpy rounded peaks + a wobble
      let y = 0;
      for (const [c, hh, wd] of M.peaks) { const d = (x / W - c) / (wd * 1.5); y = Math.max(y, hh * (d * d < 1 ? Math.pow(1 - d * d, 0.6) : 0)); }   // round, gooey domes
      y += 0.045 * Math.sin(x * 0.13 + idx * 2) * Math.min(1, y * 4);                               // a few soft lumps
      if (M.slump) y *= 1 - 0.25 * Math.max(0, x / W - 0.55);
      return base - y * (H - 10);
    };
    const tops = []; for (let x = 0; x <= W; x += 2) tops.push([x, top(x)]);
    MOZZ_PEAKS[key] = M.peaks.map(([c, hh]) => [Math.round(c * W - W / 2), Math.round(hh * (H - 10))]);
    pixSprite(scene, key, W, H + PAD, p => {
      // the heap of cheese, shaded by hand: lit from the top left, shadowed on slopes facing right and low down, dithered
      const T5 = [0xffffff, 0xfff4d0, 0xf0d898, 0xd8b068, 0xa87a3a];
      for (let x = 0; x < W; x++) {
        const y0 = Math.round(top(x)), sl = (top(x + 4) - top(x - 4)) / 2.6;
        for (let y = y0; y <= bot(x); y++) {
          const t = (y - y0) / Math.max(4, bot(x) - y0);
          let k = 2 + (sl < -0.6 ? -1 : sl > 0.6 ? 1 : 0) + (t > 0.62 ? 1 : 0) + (t > 0.88 ? 1 : 0);
          if (y - y0 < 2) k -= 1;
          const edge = (sl < -0.6 || sl > 0.6) && Math.abs(Math.abs(sl) - 0.6) < 0.35;            // dither where the shading changes
          if (edge && (x + y) % 2) k += sl > 0 ? -1 : 1;
          p.px(x, y, T5[Math.max(0, Math.min(4, k))]);
        }
      }
      for (let k = 0; k < Math.round(W / 14); k++) {                                               // little glossy bubbles on the surface
        const x = 6 + r() * (W - 12), y = top(x) + 4 + r() * Math.max(1, (base - top(x)) * 0.5);
        if (y < base - 10) { p.ell(x, y, 2, 2, 0xfff6d8); p.px(Math.round(x) - 1, Math.round(y) - 1, 0xffffff); }
      }
      for (let x = 3; x < W - 3; x += 2) { const y0 = Math.round(top(x)); p.px(x, y0 + 1, 0xffffff); }   // glossy melted top edge
      for (let k = 0; k < Math.round(W / 16); k++) {                                               // drips running down
        const x = 6 + Math.floor(r() * (W - 12)), y0 = Math.round(top(x)) + 2, len = 6 + Math.floor(r() * (H * 0.45));
        p.line([[x, y0], [x, Math.min(base - 6, y0 + len)]], 0xffffff, 2); p.ell(x, Math.min(base - 6, y0 + len) + 1, 1.6, 1.8, 0xfff6d8);
        p.line([[x + 1, y0 + 2], [x + 1, Math.min(base - 7, y0 + len - 1)]], 0xe8c880);
      }
      for (let k = 0; k < Math.round(W / 10); k++) {                                               // browned, blistered spots
        const x = 6 + r() * (W - 12), y = top(x) + 6 + r() * (base - top(x) - 14);
        if (y < base - 8) p.ell(x, y, 1.5 + r() * 2.5, 1 + r() * 1.5, r() < 0.5 ? [0xe0a050, 0xb86a24, 0x7a3a10] : [0xa05a20, 0x6a3010, 0x3a1808]);
      }
      for (let x = 0; x < W; x++) {                                                                 // charred crust foot, following the curve
        const b = bot(x), f = 4 + Math.round(3 * Math.abs(Math.sin(x * 0.21 + idx)));
        if (Math.round(top(x)) > b - 1) continue;
        for (let y = b - f; y <= b; y++) p.px(x, y, y > b - 2 ? 0x1a0804 : y > b - f + 1 ? 0x4a200c : 0x8a4a1c);
      }
      for (const sd of [-1, 1]) for (let k = 0; k < 10; k++) {                                       // cheese oozing out over the crust at its feet
        const x = Math.round(W / 2 + sd * (W / 2 - 4 - k * 1.5)); if (x < 0 || x >= W) continue;
        const b = bot(x), y0 = Math.round(top(x)); if (y0 > b - 3) continue;
        p.px(x, b - 5 - (k % 3), 0xf4dea0); p.px(x, b - 4 - (k % 3), 0xfff4d0);
      }
      if (M.crater) {                                                                               // a bubbling lava crater on the top peak
        const [c] = M.peaks.reduce((a, b) => (b[1] > a[1] ? b : a)), cx = c * W, cy = top(cx) + 3;
        p.ell(cx, cy, 7, 2.5, [0xffe080, 0xff7a1a, 0xc02a0a]); p.px(cx - 2, cy - 1, 0xffffff);
        p.line([[cx + 3, cy + 2], [cx + 6, cy + 9], [cx + 4, cy + 16]], 0xff6a1a);
      }
      if (M.strings && M.peaks.length > 1) {                                                        // stretchy cheese strings between two peaks
        const [a, b] = M.peaks, xa = a[0] * W, xb = b[0] * W, ya = top(xa) + 4, yb = top(xb) + 4;
        for (let s = 0; s < 3; s++) { const sag = 8 + s * 5, pts = []; for (let t = 0; t <= 1.001; t += 0.1) pts.push([xa + (xb - xa) * t, ya + (yb - ya) * t + Math.sin(t * Math.PI) * sag]); p.line(pts, s === 1 ? 0xfff6d8 : 0xffffff); }
      }
    }, 1);
    const T = scene.textures.get(key); if (T && T.customData) T.customData.oy = H / (H + PAD);   // base row, not the texture bottom
  });
}

function makeMozzTextures(scene) {
  makeMozzMountains(scene);
  const MOL = [0xfff6d0, 0xffc25a, 0xd0601a], CR = [0x7a4422, 0x40200e, 0x1c0c06], DARK = 0x2a0804;
  const crackIt = (p, pts) => p.line(pts, 0xff6a1a, 1);
  makeMagmaGolemTextures(scene);                                    // the boss himself: magmagolem.js
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
  // (v2.57) the TOASTY OVEN DRONE, redrawn bigger and grubbier: a brick dome blackened with soot, a sooty steel chimney,
  // riveted iron band, a roaring mouth with a pizza in it, glaring furnace eyes, little thrusters underneath
  pixSprite(scene, 'ovendrone', 110, 88, p => {
    const BR = [0xd8805a, 0xa04a2a, 0x5a2414], SOOT = [0x4a3a36, 0x2a201e, 0x141010], IRON = [0x9aa0aa, 0x5a606a, 0x2a2e36];
    p.rrect(70, 0, 82, 26, 2, IRON); p.rect(68, 0, 84, 4, 0x2a2e36); p.rect(72, 4, 80, 14, 0x2a201e);                 // chimney, black at the top
    p.ell(55, 44, 50, 34, BR);                                                                                      // the dome
    for (let y = 16; y < 64; y += 7) { const hw = Math.sqrt(Math.max(0, 1 - Math.pow((y - 44) / 34, 2))) * 48;      // bricks
      p.line([[55 - hw, y], [55 + hw, y]], 0x6a2a16); for (let x = 55 - hw + ((y / 7) % 2) * 6; x < 55 + hw; x += 12) p.line([[x, y], [x, y + 6]], 0x6a2a16); }
    { let sd = 7; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;          // soot: a dithered blackening, heaviest at the top and round the chimney
      for (let y = 10; y < 46; y++) for (let x = 8; x < 102; x++) {
        const dx = (x - 55) / 50, dy = (y - 44) / 34; if (dx * dx + dy * dy > 0.98) continue;
        const k = Math.max(0, (40 - y) / 30) * 0.8 + Math.max(0, 1 - Math.hypot(x - 76, y - 12) / 16) * 0.7;
        if (r() < k * 0.75) p.px(x, y, r() < 0.5 ? 0x2a1814 : 0x3e241a);
      } }
    for (const [x, y] of [[24, 30], [88, 34], [34, 20], [70, 20], [46, 12]]) { p.px(x, y, 0x141010); p.px(x + 1, y, 0x2a201e); }
    p.rrect(4, 56, 106, 66, 3, IRON); for (let x = 10; x < 104; x += 10) { p.px(x, 59, 0xdfe6f0); p.px(x + 1, 60, 0x1a1020); }   // the iron band, riveted
    p.ell(55, 62, 24, 14, 0x140808); p.rect(31, 62, 79, 74, 0x140808);                                               // the mouth
    p.ell(55, 70, 20, 5, [0xffe27a, 0xff8a1a, 0xc0301a]);                                                           // fire
    p.ell(55, 64, 12, 4, [0xfff0b0, 0xf0c050, 0xa86a20]); for (const x of [49, 55, 61]) p.ell(x, 64, 2, 1.5, [0xff7a6a, 0xd0301a, 0x8a1a10]);   // a pizza cooking
    p.poly([[28, 38], [46, 43], [44, 49], [28, 45]], [0xffe27a, 0xffb020, 0xc05a10]); p.poly([[82, 38], [64, 43], [66, 49], [82, 45]], [0xffe27a, 0xffb020, 0xc05a10]);   // furnace eyes
    p.line([[26, 34], [46, 40]], 0x141010, 2); p.line([[84, 34], [64, 40]], 0x141010, 2);                                  // scowl
    p.rrect(16, 74, 94, 80, 2, IRON);                                                                               // the base plate
    for (const x of [24, 55, 86]) { p.rrect(x - 6, 79, x + 6, 84, 2, IRON); p.poly([[x - 4, 84], [x + 4, 84], [x, 88]], [0xfff6c0, 0xffb52a, 0xff6a1a]); }   // thrusters
    p.px(12, 50, 0xffd0a0); p.px(98, 50, 0xffd0a0);
  });
  pixSprite(scene, 'pizza', 22, 22, p => {                                     // (v2.57) a hot pizza, flung like a frisbee
    p.ell(11, 11, 10, 10, [0xf0b060, 0xc07a30, 0x7a4418]); p.ell(11, 11, 8, 8, [0xfff0b0, 0xf8d860, 0xd8a030]);
    for (const [x, y] of [[8, 7], [14, 8], [7, 13], [13, 14], [11, 11]]) p.ell(x, y, 2, 2, [0xff7a6a, 0xd0301a, 0x8a1a10]);
    p.px(16, 12, 0x3a8a2a); p.px(6, 10, 0x3a8a2a); p.line([[11, 3], [11, 19]], 0xd8a030); p.line([[3, 11], [19, 11]], 0xd8a030);
  });
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
    const z = this.mz = { boulderCd: rnd(6, 9), erupt: null, shards: [], puddles: [], rings: [], waves: [], warn: null, eruptN: 0, t: 0 };
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
    if (!this.enemies.some(q => q.type === 'boss')) z.boulderCd -= dt;                    // (in the boss fight only HE sets it off)
    if (z.boulderCd <= 0 && !this.bossDown) { z.boulderCd = rnd(10, 14); this.mozzErupt(); }
    if (z.erupt) {
      z.erupt.t += dt;
      if (z.erupt.t > 1.3 && !z.erupt.sent) {
        z.erupt.sent = true;
        if (z.erupt.boulder && this.state === 'play') this.mozzBoulder(z.erupt.boulder);
      }
      if (z.erupt.t > 2.2) z.erupt = null;
    }
    if (z.warn) { z.warn.t -= dt; if (z.warn.t <= 0) z.warn = null; }
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
    for (const b of this.eBullets) if (b.lava && b.h <= 6) { b.life = 0; this.mozzPuddle(b.theta, 2.4); }
    // the boss's rolling lava wave: one big thing to JUMP
    for (let i = z.waves.length - 1; i >= 0; i--) {
      const Wv = z.waves[i]; Wv.life -= dt; Wv.theta = wrap(Wv.theta + Wv.dir * Wv.v / R * dt);
      if (Wv.life <= 0) { z.waves.splice(i, 1); continue; }
      const hh = Wv.hh * Math.min(1, Wv.life / 0.4) * Math.min(1, (Wv.max - Wv.life) / 0.15 + 0.4);
      if (this.state === 'play' && P.invuln <= 0 && P.h < hh - 5 && !(P.floor > 0) && Math.abs(angDiff(P.theta, Wv.theta)) * R < 20) { this.hurt(); Sound.sfx('hiss'); }
      if (Math.random() < 0.5) this.burst(wrap(Wv.theta - Wv.dir * 14 / R), rnd(4, hh), 'spark', 1, 0.3);
    }
    // landing rings: a lava bomb is on its way down to each (they stay lit until it lands)
    for (let i = z.rings.length - 1; i >= 0; i--) {
      const Rg = z.rings[i]; Rg.t -= dt;
      if (Rg.bomb && !Rg.sent && Rg.t <= 0.55) {                                    // the bomb itself, dropping in for the last half second
        Rg.sent = true;
        const im = this.add.image(0, 0, 'mg_bomb').setDepth(8); im.bsx = im.bsy = 1.5;
        this.parts.push({ theta: Rg.theta, h: 460, vt: 0, vh: (-460 + 450 * 0.55 * 0.55) / 0.55, life: 0.55, spr: im, rot: 0, rv: 7 });
      }
      if (Rg.t <= 0) {
        z.rings.splice(i, 1);
        if (Rg.bomb) {
          this.mozzPuddle(Rg.theta, 2.2); this.bang(Rg.theta, 10, 18);
          if (Math.abs(angDiff(Rg.theta, P.theta)) < this.visHalf + 0.1) this.cameras.main.shake(90, 0.006);
          if (this.state === 'play' && P.invuln <= 0 && P.h < 46 && Math.abs(angDiff(P.theta, Rg.theta)) * R < 30) this.hurt();
        }
      }
    }
    // the mozzarella mountains steam and blip
    z.steamT = (z.steamT || 0) - dt;
    if (z.steamT <= 0) {
      z.steamT = 0.12;
      const near = this.props.filter(q => q.spr.texture && /^mozzmtn/.test(q.spr.texture.key) && Math.abs(angDiff(q.theta, P.theta)) < this.visHalf + 0.1);
      const q = near[Math.floor(Math.random() * near.length)];
      if (q) {
        const pk = MOZZ_PEAKS[q.spr.texture.key], [px, py] = pk[Math.floor(Math.random() * pk.length)], fl = q.spr.flipX ? -1 : 1;
        const th = wrap(q.theta + px * fl * q.spr.bsx / R), h = q.h + py * q.spr.bsy - 4;
        if (Math.random() < 0.6) { const im = this.add.image(0, 0, 'puff').setDepth(2.45).setAlpha(0.35).setTint(0xfff0d0); im.bsx = im.bsy = rnd(0.2, 0.35); this.parts.push({ theta: th, h, vt: rnd(-12, 12), vh: rnd(30, 60), life: rnd(1, 1.6), noGrav: true, grow: 0.5, spr: im }); }
        else { const im = this.add.image(0, 0, 'cheesebub').setDepth(2.55); im.bsx = im.bsy = rnd(0.6, 1); this.parts.push({ theta: th, h, vt: rnd(-40, 40), vh: rnd(90, 160), life: 0.5, spr: im }); }
      }
    }
    // the boss's parts go when he does
    if (z.boss && !this.enemies.includes(z.boss)) { this.mgParts(z.boss); z.boss = null; }
  },
  // the volcano goes off. In the waves: one boulder OR two lava bombs, turn about. mad (the boss's doing): a carpet of
  // bombs sweeping across the ground, every ring shown well ahead, with a gap in the carpet to stand in.
  mozzErupt(mad) {
    const z = this.mz || this.mzInit(), P = this.pl;
    if (z.erupt) return;
    z.erupt = { t: 0, mad: !!mad };
    Sound.sfx('boom'); this.cameras.main.shake(mad ? 600 : 300, mad ? 0.012 : 0.006);
    if (mad) {
      const boss = z.boss, p2 = !!(boss && boss.mgS && boss.mgS.p2), n = p2 ? 10 : 8, sp = 62, first = p2 ? 1.75 : 2.1, each = p2 ? 0.14 : 0.17;
      const dir = Math.random() < 0.5 ? -1 : 1, gap = 1 + Math.floor(Math.random() * (n - 3));       // two slots side by side stay clear
      for (let k = 0; k < n; k++) {
        if (k === gap || k === gap + 1) continue;
        const t = first + k * each;
        z.rings.push({ theta: wrap(P.theta + dir * (k - (n - 1) / 2) * sp / R), t, max: t, bomb: true });
      }
      this.banner('MAD ERUPTION!\nFIND THE GAP, OR GET CLEAR!'); Sound.sfx('alarm');
      return;
    }
    if (!this.eruptTip) { this.eruptTip = true; this.banner('ERUPTION!\nWATCH FOR THE RINGS AND THE BOULDERS!'); }
    if (z.eruptN++ % 2 === 0) { const side = Math.random() < 0.5 ? -1 : 1; z.erupt.boulder = side; z.warn = { side, t: 1.6 }; }
    else {
      const ahead = Math.sign(P.vx || 0) || (Math.random() < 0.5 ? -1 : 1);
      z.rings.push({ theta: P.theta, t: 1.7, max: 1.7, bomb: true });
      z.rings.push({ theta: wrap(P.theta + ahead * rnd(120, 170) / R), t: 2.05, max: 2.05, bomb: true });
    }
  },
  mozzBoulder(side) {
    const P = this.pl, b = this.addEBullet('boulder', wrap(P.theta + side * (this.visHalf + 0.12)), 300, -side * rnd(170, 210), -60, 15, 9);
    b.boulder = true; b.grav = 650; b.shootable = true; b.hp = 3; b.spr.bsx = b.spr.bsy = 1.3;
  },
  mozzPuddle(theta, life) {
    const z = this.mz || this.mzInit(); life = life || 3;
    z.puddles.push({ theta, half: 30 / R, life, max: life });
    this.burst(theta, 6, 'mg_glob', 6, 0.7); this.bang(theta, 6, 14); Sound.sfx('squelch');
  },
  mozzWave(theta, dir, v) {
    const z = this.mz || this.mzInit();
    z.waves.push({ theta, dir, v, life: 2.1, max: 2.1, hh: 34 });
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
    for (const Rg of z.rings) {                                                    // where a lava bomb will land: the ring closes in as it falls
      const p = this.screenPos(Rg.theta, 3), k = Math.max(0, Math.min(1, 1 - Rg.t / Rg.max)), d = angDiff(Rg.theta, this.viewT()), fl = Math.floor(this.t * (8 + 10 * k)) % 2;
      const rw = 30 * zm * 2, rh = 9 * zm * 2;
      gl.save(); gl.translateCanvas(p.x, p.y); gl.rotateCanvas(d);
      gl.fillStyle(Rg.bomb ? 0xff3a10 : 0xffa020, 0.16 + 0.22 * k).fillEllipse(0, 0, rw, rh);
      gl.lineStyle(2 * zm, 0xff5a1a, 0.6 + 0.4 * fl).strokeEllipse(0, 0, rw, rh);
      gl.lineStyle(2 * zm, 0xffe080, 0.9).strokeEllipse(0, 0, rw * (1 - 0.85 * k), rh * (1 - 0.85 * k));
      gl.restore();
    }
    for (const Wv of z.waves) {                                                    // the rolling lava wave: a fat curling crest
      const hh = Wv.hh * Math.min(1, Wv.life / 0.4) * Math.min(1, (Wv.max - Wv.life) / 0.15 + 0.4), n = 12, top = [], bot = [], in2 = [];
      for (let k = 0; k <= n; k++) {
        const u = k / n * 2 - 1, x = u * 30, lean = Wv.dir * 10 * Math.exp(-u * u * 3), hgt = hh * Math.exp(-u * u * 2.6) + Math.sin(this.t * 14 + k * 1.3) * 1.6;
        top.push(this.screenPos(wrap(Wv.theta + (x + lean) / R), hgt)); in2.push(this.screenPos(wrap(Wv.theta + (x * 0.7 + lean) / R), hgt * 0.55)); bot.push(this.screenPos(wrap(Wv.theta + x / R), -3));
      }
      g.fillStyle(0xe0501a, 1).fillPoints(top.concat(bot.slice().reverse()), true);
      g.fillStyle(0xffa030, 1).fillPoints(in2.concat(bot.slice().reverse()), true);
      g.lineStyle(3 * zm, 0xfff0a0, 1).strokePoints(top, false);
      gl.fillStyle(0xff8a1a, 0.25); const c = this.screenPos(Wv.theta, hh * 0.5); gl.fillCircle(c.x, c.y, 34 * zm);
    }
    if (z.warn && Math.floor(this.t * 8) % 2) {                                     // a boulder's on its way in: an arrow at that edge of the screen
      const sd = z.warn.side, x = sd < 0 ? 26 : W - 26, y = H * 0.56, s = 12;
      gl.fillStyle(0xff3a10, 0.95).fillTriangle(x - sd * s, y - s, x - sd * s, y + s, x + sd * s * 0.8, y);
      gl.fillStyle(0xffe080, 0.95).fillRect(x - sd * s - sd * 8 - 2, y - s, 4, s * 1.3).fillRect(x - sd * s - sd * 8 - 2, y + s * 0.6, 4, 4);
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
      // (v2.57) soot: a column of greasy smoke from the chimney, embers from the mouth
      if (Math.random() < dt * 9) { const im = this.add.image(0, 0, 'puff').setDepth(5.8).setTint(Math.random() < 0.5 ? 0x5a4a44 : 0x7a6a62).setAlpha(0.32); im.bsx = im.bsy = rnd(0.18, 0.3); this.parts.push({ theta: wrap(e.theta + (e.spr.flipX ? -1 : 1) * 27 / R), h: e.h + 56, vt: rnd(-15, 15), vh: rnd(40, 70), life: rnd(1, 1.6), noGrav: true, grow: 1.6, spr: im }); }
      if (Math.random() < dt * 4) this.burst(e.theta, e.h - 14, 'spark', 1, 0.5);
      if (e.cutCd <= 0 && (e.shots = (e.shots || 0) + 1) % 2 === 0) {           // every other throw: a hot PIZZA, lobbed in an arc (shoot it down, or dodge where it lands)
        e.cutCd = rnd(2.2, 3);
        const dx = angDiff(P.theta, e.theta) * R, air = 1.1, vt = Math.max(-260, Math.min(260, dx / air)), b = this.addEBullet('pizza', e.theta, e.h - 18, vt, 120, 14, 3);
        b.grav = 2 * (120 * air + (e.h - 18 - 6)) / (air * air); b.pizza = true; b.spinV = 9; b.shootable = true; b.spr.bsx = b.spr.bsy = 1.5;
        Sound.sfx('whoosh'); this.muzzleFlash(e.theta, e.h - 18); e.spr.hsq = 0.6;
      } else if (e.cutCd <= 0) {                                                 // a homing pizza-cutter wheel
        e.cutCd = rnd(2.2, 3);
        const b = this.addEBullet('pizzacutter', e.theta, e.h - 20, dirP * 120, -60, 14, 4); b.home = 2.4; b.homeV = 165; b.spinV = 16; b.spr.bsx = b.spr.bsy = 2; b.shootable = true;   // (v2.51: twice the size, and you can shoot them down)
        Sound.sfx('zing'); this.muzzleFlash(e.theta, e.h - 20);
      }
      if (e.cd <= 0 && Math.abs(d) * R < 140) { e.st = 'tell'; e.cd = 0.6; Sound.sfx('alarm'); }
    } else if (e.st === 'tell') {                                                // shudder, glow red
      e.cd -= dt; e.theta = wrap(e.theta + Math.sin(e.t * 70) * 2 / R);
      e.spr.setTint(Math.floor(e.t * 14) % 2 ? 0xff9a7a : 0xffffff);
      if (e.cd <= 0) { e.st = 'drop'; e.vh = 0; e.spr.clearTint(); }
    } else if (e.st === 'drop') {
      e.vh -= 2400 * dt; e.h += e.vh * dt;
      if (e.h <= 48) {
        e.h = 48; e.st = 'sit'; e.cd = 0.9;
        Sound.sfx('boom'); this.cameras.main.shake(220, 0.012); this.burst(e.theta, 6, 'crumb', 12, 1.2);
        for (const sd of [-1, 1]) this.addEBullet('crumb', wrap(e.theta + sd * 40 / R), 9, sd * 240, 0, 10, 2.2);
      }
    } else if (e.st === 'sit') { e.cd -= dt; if (e.cd <= 0) { e.st = 'rise'; } }
    else if (e.st === 'rise') { e.h += 220 * dt; if (e.h >= 190) { e.st = 'hover'; e.cd = rnd(3.5, 5); } }
    e.dir = dirP;
  }
};
