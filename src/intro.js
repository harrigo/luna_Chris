// Luna Chris - title screen + opening cutscene, in the game's own 16-bit pixel style.
// The title is the painted key art. The story that follows is composed on a 200-pixel-tall grid (VIEW_H) and scaled to
// fit, using the real in-game sprites: the Chris rig, the rat-ship and its tractor beam, the rats and Bessie.
// Tap once to start (needed for fullscreen + sound), tap again at any time to skip. ?skipintro jumps straight to Level 1.

const INK = 0x1a1020;
const VIEW_H = 200;                       // logical height of the cutscene view; (0,0) is the middle of the view
const GY = 62;                            // ground line
const BX = 205;                           // the barn (the rat-ship crashes into it)

// soft glow + steam puff, used by the painted title art
function makeIntroTextures(scene) {
  if (scene.textures.exists('i_glow')) return;
  const mk = (key, w, h, draw) => { const g = scene.make.graphics({ x: 0, y: 0, add: false }); draw(g); g.generateTexture(key, w, h); g.destroy(); };
  mk('i_glow', 180, 180, g => { for (let i = 0; i < 10; i++) g.fillStyle(0xffb347, 0.07).fillCircle(90, 90, 90 - i * 8.5); });
  mk('i_puff', 48, 48, g => { g.fillStyle(0xf3ead6, 1).fillCircle(24, 24, 22); g.fillStyle(0xffffff, 0.5).fillCircle(18, 18, 10); });
}

// ---------------------------------------------------------------- pixel art for the cutscene
function makeIntroPix(scene) {
  if (scene.textures.exists('ix_barn')) return;
  const W = 760;

  // skies: tall, so the camera can start up in the stars and pan down to the ranch
  const sky = (key, cols, starsTo, seed) => pixTex(scene, key, W, 360, put => {
    const n = cols.length - 1, r = rng(seed);
    for (let y = 0; y < 360; y++) {
      const v = Math.pow(y / 359, 1.3) * n, lo = Math.floor(v), f = v - lo;
      for (let x = 0; x < W; x++) put(x, y, cols[Math.min(n, lo + (f > bay(x, y) ? 1 : 0))]);
    }
    const sc = [0xffffff, 0xbfe4ff, 0xfff1a0, 0xffc0f0];
    for (let i = 0; i < 300; i++) {
      const x = r() * W | 0, y = Math.pow(r(), 1.5) * starsTo | 0, c = sc[i % 4];
      put(x, y, c);
      if (i % 19 === 0) { put(x - 1, y, c); put(x + 1, y, c); put(x, y - 1, c); put(x, y + 1, c); }
    }
  });
  sky('ix_sky_dusk', [0x0b1020, 0x131838, 0x1e1c4c, 0x2e2060, 0x48267a, 0x6e2e82, 0xa23c7e, 0xd25a6c, 0xee8452, 0xf8b04a], 230, 31);
  sky('ix_sky_night', [0x05070f, 0x090d1c, 0x0e1530, 0x141c44, 0x1c2456, 0x262c68], 330, 77);

  // horizon hills: a far purple range and a nearer cheesy one, with a lit rim and dithered shading
  const hills = (key, h, seed, amp, rim, body, low) => pixTex(scene, key, W, h, put => {
    const r = rng(seed), n = vnoise(r, 14), n2 = vnoise(r, 40);
    for (let x = 0; x < W; x++) {
      const top = Math.round(h * 0.15 + (1 - n(x / W, 0.3)) * amp + n2(x / W, 0.7) * 4);
      for (let y = top; y < h; y++) {
        const d = (y - top) / (h - top);
        put(x, y, y === top ? rim : (d > 0.45 + bay(x, y) * 0.5 ? low : body));
      }
    }
  });
  hills('ix_hills_far', 50, 5, 30, 0x8a4a9a, 0x4a2a6e, 0x34205a);
  hills('ix_hills_mid', 40, 9, 22, 0xe0a040, 0xa8681c, 0x84501a);

  // the cheese-moon ground: bumpy rim, dithered depth bands, craters and swiss holes
  pixTex(scene, 'ix_ground', W, 64, put => {
    const r = rng(13), n = vnoise(r, 60), tones = [0xffd84a, 0xf0bc36, 0xd89a26, 0xb4781c, 0x8a5a14];
    const top = []; for (let x = 0; x < W; x++) top.push(Math.round(2 + n(x / W, 0.5) * 3));
    for (let x = 0; x < W; x++) for (let y = top[x]; y < 64; y++) {
      if (y === top[x]) { put(x, y, 0xfff1a0); continue; }
      const v = Math.min(tones.length - 1, Math.floor((y - top[x]) / 64 * 4.2 + bay(x, y) * 0.9));
      put(x, y, tones[v]);
    }
    for (let i = 0; i < 26; i++) {                                  // craters: dark bowl, lit lower lip
      const cx = r() * W, cy = 10 + r() * 46, rx = 5 + r() * 12, ry = rx * 0.32;
      for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
        const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
        if (d < 0.85) put(x, y, (y < cy) ? 0x8a5a14 : 0xb4781c);
        else if (d < 1.15 && y > cy) put(x, y, 0xfff1a0);
      }
    }
    for (let i = 0; i < 40; i++) { const x = r() * W | 0, y = 8 + r() * 52 | 0; put(x, y, 0x7a4a10); put(x + 1, y, 0x7a4a10); put(x, y + 1, 0xa8701c); }
  });

  // ---- the ranch
  const barn = broken => (p => {
    p.rrect(8, 40, 95, 91, 1, [0xe0503a, 0xc23a2c, 0x8e2a22]);
    for (let x = 14; x < 92; x += 7) p.line([[x, 44], [x, 90]], 0x8e2a22);
    const xl = y => (y < 18 ? 52 - 34 * (y - 4) / 14 : 18 - 16 * (y - 18) / 26);
    p.poly([[2, 44], [18, 18], [52, 4], [86, 18], [102, 44]], [0x8a6a5a, 0x5e4438, 0x3e2a24]);
    for (let y = 10; y < 44; y += 5) p.line([[Math.ceil(xl(y)) + 1, y], [Math.floor(104 - xl(y)) - 1, y]], 0x3e2a24);
    p.rect(45, 24, 58, 35, 0x2a1a10); p.rect(46, 25, 57, 34, 0x4a2a1a);
    p.rrect(30, 54, 73, 91, 1, [0xfff1d0, 0xe9dcb5, 0xb8a880]);
    p.rect(33, 57, 50, 89, 0xa8302a); p.rect(53, 57, 70, 89, 0xa8302a);
    for (const [a, b] of [[33, 50], [53, 70]]) { p.line([[a, 57], [b, 89]], 0xe9dcb5, 2); p.line([[b, 57], [a, 89]], 0xe9dcb5, 2); }
    if (broken) {
      p.poly([[36, 8], [44, 20], [52, 6], [58, 18], [68, 10], [66, 30], [40, 30]], 0x120a14);
      for (const [x, y] of [[36, 8], [52, 6], [68, 10], [44, 20], [58, 18], [39, 12], [65, 14]]) { p.px(x, y, 0xc9955a); p.px(x + 1, y - 1, 0xc9955a); }
    }
  });
  pixSprite(scene, 'ix_barn', 104, 92, barn(false));
  pixSprite(scene, 'ix_barn_x', 104, 92, barn(true));

  pixSprite(scene, 'ix_cabin', 88, 72, p => {
    p.rrect(60, 2, 71, 26, 1, [0xa0a4b0, 0x7b7f8c, 0x50545f]);
    for (let y = 6; y < 26; y += 4) p.line([[61, y], [70, y]], 0x50545f);
    p.poly([[0, 30], [44, 6], [88, 30]], [0xa0503a, 0x7a3b2a, 0x4e2418]);
    p.rrect(6, 28, 81, 71, 1, [0x8a6040, 0x6b4a2f, 0x4a321e]);
    for (let y = 33; y < 71; y += 6) p.line([[7, y], [80, y]], 0x4a321e);
    p.rect(13, 39, 34, 56, 0x2a1a10); p.rect(15, 41, 32, 54, 0xffd23f); p.rect(15, 41, 22, 46, 0xfff1a0);
    p.line([[23, 41], [23, 54]], 0x2a1a10); p.line([[15, 47], [32, 47]], 0x2a1a10);
    p.rrect(48, 44, 63, 71, 1, [0x6b4326, 0x4a2f1a, 0x2e1c10]); p.px(60, 58, 0xffd23f);
  });

  pixSprite(scene, 'ix_fence', 140, 22, p => {
    for (let x = 2; x < 140; x += 22) p.rrect(x, 2, x + 4, 21, 1, [0xb07a4a, 0x8a5a3a, 0x5e3a22]);
    p.rect(0, 7, 139, 8, 0x8a5a3a); p.rect(0, 14, 139, 15, 0x8a5a3a);
    p.line([[0, 7], [139, 7]], 0xb07a4a); p.line([[0, 14], [139, 14]], 0xb07a4a);
  });

  pixSprite(scene, 'ix_grill', 30, 26, p => {
    p.line([[7, 14], [3, 25]], 0x50545f, 2); p.line([[23, 14], [27, 25]], 0x50545f, 2); p.line([[15, 16], [15, 25]], 0x50545f, 2);
    p.poly([[1, 6], [29, 6], [24, 16], [6, 16]], [0x5a5e6c, 0x3a3e4c, 0x24262e]);
    p.rect(1, 5, 29, 6, 0x2a2a35);
    for (const x of [6, 11, 17, 22]) { p.px(x, 7, 0xff8a1a); p.px(x + 1, 8, 0xffd23f); }
  });

  pixSprite(scene, 'ix_pancake', 13, 6, p => { p.ell(6.5, 3, 6, 2.3, [0xa8643a, 0x7a3e1e, 0x4a200c]); p.line([[3, 2], [5, 4]], 0x3a1608); p.line([[7, 2], [9, 4]], 0x3a1608); p.px(10, 4, 0xffd23f); p.px(10, 5, 0xffd23f); p.px(5, 1, 0xd08a5a); });   // a sizzling burger (with a drip of cheese)

  // the spatula sits in the gun slot of the Chris rig (same 34x26 canvas, handle centred on row 15)
  pixSprite(scene, 'ix_spatula', 34, 26, p => {
    p.rrect(1, 13, 16, 17, 1, [0x9a6a4a, 0x6b4326, 0x4a2f1a]);
    p.line([[17, 15], [22, 15]], 0x9aa3b2, 2);
    p.rrect(22, 7, 32, 21, 1, [0xf0f4fa, 0xb8c0cc, 0x7a8290]);
    p.line([[25, 10], [25, 18]], 0x5a6270); p.line([[29, 10], [29, 18]], 0x5a6270);
  });

  pixSprite(scene, 'ix_plank', 14, 5, p => p.rrect(1, 1, 12, 3, 1, [0xd09060, 0xa86a3a, 0x7a4a26]));
  pixSprite(scene, 'ix_dust', 12, 12, p => p.ell(6, 6, 5, 5, [0xfff6e0, 0xe8d8b0, 0xb8a888]));
  pixSprite(scene, 'ix_smoke', 12, 12, p => p.ell(6, 6, 5, 5, [0x8a8a9e, 0x5e5e72, 0x40404e]));

  // ---- the cabin interior
  pixTex(scene, 'ix_wall', W, 210, put => {
    const r = rng(21), cols = [0x6b4a2f, 0x62432a];
    for (let y = 0; y < 210; y++) {
      const row = (y / 13) | 0, seamY = y % 13 === 0, off = (row * 97) % 140;
      for (let x = 0; x < W; x++) {
        let c = cols[row % 2];
        if (seamY || (x + off) % 140 === 0) c = 0x3a2616;
        else if (((x * 7 + row * 13) % 23 === 0) && r() < 0.6) c = 0x553a24;
        const d = Math.abs(x - W / 2) / (W / 2);                        // dithered vignette towards the edges
        if (d > 0.55 && (d - 0.55) * 2.6 > bay(x, y)) c = c === 0x3a2616 ? 0x24160c : 0x3e2a1a;
        put(x, y, c);
      }
    }
  });
  pixTex(scene, 'ix_floor', W, 48, put => {
    for (let y = 0; y < 48; y++) for (let x = 0; x < W; x++) {
      let c = y === 0 ? 0x2a1a10 : (y < 3 ? 0x7a5236 : ((y / 9 | 0) % 2 ? 0x4a321e : 0x553a24));
      if (y > 2 && (x + ((y / 9 | 0) * 53)) % 90 === 0) c = 0x2a1a10;
      if (y > 20 && (y - 20) / 28 > bay(x, y) + 0.2) c = 0x2a1a10;
      put(x, y, c);
    }
  });
  pixTex(scene, 'ix_rug', 130, 16, put => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 130; x++) {
      const d = Math.hypot((x - 64.5) / 64, (y - 7.5) / 7.5); if (d > 1) continue;
      put(x, y, d > 0.86 ? INK : (d > 0.72 ? 0xffd23f : ((x + y) % 6 < 3 && d < 0.5 ? 0xe63946 : 0xb8222e)));
    }
  });
  pixSprite(scene, 'ix_fireplace', 112, 98, p => {
    p.rrect(4, 26, 107, 97, 2, [0xa0a4b0, 0x7b7f8c, 0x50545f]);
    for (let y = 30; y < 97; y += 8) { p.line([[5, y], [106, y]], 0x50545f); for (let x = 8 + ((y / 8) % 2) * 9; x < 106; x += 18) p.line([[x, y], [x, y + 7]], 0x50545f); }
    p.rrect(28, 44, 83, 97, 5, 0x120a0a);
    p.rrect(36, 86, 74, 92, 2, [0x8a5a3a, 0x6b4326, 0x4a2f1a]);
    p.rrect(0, 18, 111, 27, 1, [0xa07050, 0x6b4326, 0x4a2f1a]);
  });
  pixSprite(scene, 'ix_armory', 112, 98, p => {
    p.rrect(4, 18, 107, 97, 2, [0x6a7a9a, 0x3e4a66, 0x262e44]);
    p.rect(10, 24, 101, 91, 0x121828);
    p.line([[10, 24], [101, 24]], 0x39d0c8); p.line([[10, 91], [101, 91]], 0x39d0c8);
    for (const y of [50, 78]) { p.rect(12, y, 99, y + 2, 0x8a929c); p.line([[12, y], [99, y]], 0xd8dfe8); }
    for (let x = 12; x < 100; x += 6) { p.line([[x, 93], [x + 3, 96]], 0xffd23f, 2); }
    for (const [x, y] of [[8, 22], [103, 22], [8, 93], [103, 93]]) p.px(x, y, 0xd8dfe8);
  });
  pixSprite(scene, 'ix_window', 40, 36, p => {
    p.rrect(1, 1, 38, 34, 1, [0x8a6040, 0x6b4a2f, 0x4a321e]);
    p.rect(5, 5, 34, 30, 0x10173a);
    for (const [x, y, c] of [[9, 9, 0xffffff], [27, 8, 0xbfe4ff], [15, 22, 0xfff1a0], [30, 26, 0xffffff], [21, 12, 0xffc0f0]]) p.px(x, y, c);
    p.ell(26, 15, 4, 4, [0xfff6c0, 0xf0d070, 0xb89a40]);
    p.line([[19, 5], [19, 30]], 0x4a321e, 2); p.line([[5, 17], [34, 17]], 0x4a321e, 2);
  });
  pixSprite(scene, 'ix_frame', 28, 24, p => {
    p.rrect(1, 1, 26, 22, 1, [0xffe27a, 0xd9aa30, 0x9a7020]);
    p.rect(4, 4, 23, 19, 0x9fd8ff); p.rect(4, 15, 23, 19, 0x6fcf5a);
  });
  pixSprite(scene, 'ix_grinder', 9, 20, p => {
    p.ell(4.5, 2.5, 2, 2, [0xd8dfe8, 0x9aa3b2, 0x5a6270]);
    p.rrect(1, 4, 7, 17, 2, [0xa07050, 0x6b4326, 0x4a2f1a]);
    p.rect(1, 17, 7, 19, 0x9aa3b2);
  });

  // ---- making the cabin a home: telly, sofa, lamp, bookshelf, kitchen corner, plant, clock, sampler
  const WD = [0xb07a4a, 0x8a5a3a, 0x5e3a22], DK = [0x6a4a30, 0x4a321e, 0x2e1e12], MET = [0xd8dfe8, 0x9aa3b2, 0x5a6270];
  pixSprite(scene, 'ix_tv', 40, 44, p => {                         // chunky old CRT telly on spindly legs, rabbit-ear aerial
    p.line([[16, 9], [8, 0]], 0x9aa3b2); p.line([[24, 9], [33, 1]], 0x9aa3b2); p.px(8, 0, 0xff6a6a); p.px(33, 1, 0xff6a6a);
    p.rrect(2, 9, 38, 36, 3, WD);
    p.rrect(5, 12, 29, 33, 3, 0x1a1a24);                             // screen bezel (picture drawn over it)
    p.ell(33, 17, 2, 2, MET); p.ell(33, 24, 2, 2, MET); p.rect(31, 29, 35, 30, DK[1]); p.rect(31, 31, 35, 32, DK[1]);   // knobs + speaker grille
    p.line([[8, 37], [5, 43]], DK[1], 2); p.line([[32, 37], [35, 43]], DK[1], 2);
  });
  const scr = (key, draw) => pixSprite(scene, key, 22, 19, p => { p.rect(0, 0, 21, 18, 0x0a0a14); draw(p); });
  scr('ix_tv0', p => {                                              // a cooking show: a burger flipping over a pan
    p.rect(1, 1, 20, 17, 0x3a6ad8); p.rect(1, 13, 20, 17, 0x8a5a3a);
    p.ell(11, 13, 6, 2, MET); p.line([[17, 13], [21, 12]], 0x1a1020, 2);
    p.ell(11, 6, 4, 1.6, [0xa8643a, 0x7a3e1e, 0x4a200c]);
  });
  scr('ix_tv1', p => {                                              // a cow documentary
    p.rect(1, 1, 20, 10, 0x9fd8ff); p.rect(1, 11, 20, 17, 0x6fcf5a);
    p.ell(10, 10, 5, 3.4, [0xffffff, 0xf0f0f0, 0xb8b8c0]); p.ell(8, 9, 1.5, 1.2, 0x1a1020); p.ell(12, 11, 1.3, 1, 0x1a1020);
    p.ell(15.5, 8.5, 2.3, 2, [0xffd0d8, 0xffa8b8, 0xc07080]); p.rect(7, 13, 7, 15, 0x1a1020); p.rect(12, 13, 12, 15, 0x1a1020);
  });
  scr('ix_tv2', p => {                                              // static
    const r = rng(77); for (let y = 1; y < 18; y++) for (let x = 1; x < 21; x++) { const v = r(); p.px(x, y, v < 0.33 ? 0xffffff : (v < 0.66 ? 0x8a8a9e : 0x2a2a3a)); }
  });
  pixSprite(scene, 'ix_sofa', 76, 34, p => {                         // a squashy brown sofa with cow-print cushions
    const SF = [0xc0704a, 0x9a4e32, 0x66301e];
    p.rrect(6, 2, 70, 22, 6, SF);                                    // back
    p.rrect(1, 12, 15, 30, 4, SF); p.rrect(61, 12, 75, 30, 4, SF);   // arms
    p.rrect(12, 18, 64, 30, 3, [0xd88a5e, 0xb0603e, 0x7a3a22]);      // seat
    p.line([[38, 19], [38, 29]], 0x7a3a22);
    { const cx = 22; p.rrect(cx - 7, 9, cx + 7, 20, 3, [0xffffff, 0xf0f0f0, 0xb8b8c0]); p.ell(cx - 2, 13, 2, 1.6, 0x1a1020); p.ell(cx + 3, 16, 1.6, 1.3, 0x1a1020); }
    { const x0 = 47, y0 = 9, w = 14, h = 11;                       // a Union Jack cushion
      p.rect(x0, y0, x0 + w, y0 + h, 0x1a3a8a);
      for (let i = 0; i <= w; i++) { const y = Math.round(y0 + i * h / w), y2 = Math.round(y0 + h - i * h / w); p.px(x0 + i, y, 0xffffff); p.px(x0 + i, y - 1, 0xffffff); p.px(x0 + i, y2, 0xffffff); p.px(x0 + i, y2 + 1, 0xffffff); p.px(x0 + i, y, 0xd8202a); p.px(x0 + i, y2, 0xd8202a); }
      p.rect(x0 + 5, y0, x0 + 9, y0 + h, 0xffffff); p.rect(x0, y0 + 4, x0 + w, y0 + 7, 0xffffff);
      p.rect(x0 + 6, y0, x0 + 8, y0 + h, 0xd8202a); p.rect(x0, y0 + 5, x0 + w, y0 + 6, 0xd8202a); }
    p.rect(4, 30, 7, 33, DK[2]); p.rect(69, 30, 72, 33, DK[2]);
  });
  pixSprite(scene, 'ix_table', 40, 16, p => {                        // coffee table: a mug of tea and a cheese magazine
    p.rect(2, 6, 37, 8, WD[1]); p.rect(2, 6, 37, 6, WD[0]); p.rect(4, 9, 6, 15, DK[1]); p.rect(33, 9, 35, 15, DK[1]);
    p.rrect(8, 0, 14, 6, 1, [0xff8a8a, 0xe03030, 0x901818]); p.px(15, 2, 0xe03030); p.px(15, 3, 0xe03030); p.rect(9, 0, 13, 0, 0xc08a5a);
    p.rect(20, 4, 31, 5, 0xffd23f); p.rect(22, 4, 26, 4, 0xe03030);
  });
  pixSprite(scene, 'ix_lamp', 22, 64, p => {                          // floor lamp with a fringed shade
    p.poly([[5, 2], [17, 2], [21, 16], [1, 16]], [0xfff0b0, 0xffd27a, 0xc8903a]);
    for (let x = 2; x <= 20; x += 2) p.px(x, 17, 0xc8903a);
    p.rect(10, 17, 11, 60, DK[1]); p.rrect(4, 59, 17, 63, 2, DK);
  });
  pixSprite(scene, 'ix_shelf', 48, 66, p => {                         // bookshelf: books, a cheese jar, a trophy, a model rocket
    p.rrect(1, 1, 46, 65, 1, WD); p.rect(4, 4, 43, 62, DK[2]);
    for (const y of [22, 42, 62]) p.rect(3, y, 44, y + 1, WD[0]);
    const BK = [0xe03030, 0x3a6ad8, 0xffd23f, 0x4ac040, 0xa05ad8, 0xff8a3a];
    let x = 5; for (let i = 0; i < 9; i++) { const h = 12 + (i * 5) % 6; p.rect(x, 21 - h, x + 2, 21, BK[i % 6]); x += 4; }
    p.rrect(6, 30, 16, 41, 2, [0xeaf8ff, 0xb8e4ff, 0x6ab0e0]); p.rect(8, 33, 14, 40, 0xffd23f); p.rect(6, 29, 16, 30, 0xe03030);     // jar of Mad Cheese
    p.poly([[24, 30], [32, 30], [30, 36], [26, 36]], [0xfff0a0, 0xffc83a, 0xb07a1a]); p.rect(27, 36, 29, 39, 0xb07a1a); p.rect(25, 40, 31, 41, DK[1]);   // trophy
    p.poly([[38, 26], [41, 33], [41, 41], [35, 41], [35, 33]], MET); p.px(38, 34, 0x3a6ad8); p.rect(34, 39, 35, 41, 0xe03030); p.rect(41, 39, 42, 41, 0xe03030);   // model rocket
    x = 5; for (let i = 0; i < 6; i++) { p.rect(x, 50, x + 4, 61, BK[(i + 3) % 6]); x += 6; }
  });
  pixSprite(scene, 'ix_stove', 42, 44, p => {                         // a proper chef's range with a bubbling pot
    p.rrect(1, 12, 41, 43, 2, MET); p.rect(4, 22, 38, 40, 0x3a3a48); p.rect(6, 24, 36, 38, 0x1a1a24); p.rect(8, 26, 34, 27, 0x5a5a6a);
    for (const x of [8, 16, 24, 32]) p.ell(x, 17, 2, 2, [0xff8a8a, 0xe03030, 0x901818]);
    p.rrect(6, 1, 24, 12, 2, [0xd8dfe8, 0x9aa3b2, 0x5a6270]); p.rect(7, 0, 23, 2, 0xffd23f); p.line([[24, 5], [30, 4]], 0x1a1020, 2);   // pot full of cheese sauce
  });
  pixSprite(scene, 'ix_pans', 50, 26, p => {                          // pans hanging off a rail
    p.rect(0, 1, 49, 2, DK[1]);
    for (const [x, r] of [[8, 6], [24, 8], [40, 5]]) { p.line([[x, 2], [x, 6]], 0x5a6270); p.ell(x, 8 + r, r, r, [0xffd0a0, 0xd08a5a, 0x8a5a3a]); p.ell(x, 8 + r, r - 2, r - 2, 0x8a5a3a); }
  });
  pixSprite(scene, 'ix_plant', 18, 26, p => {
    p.ell(9, 8, 7, 7, [0x8af06a, 0x4ac040, 0x2a8a20]); p.ell(4, 12, 4, 4, [0x8af06a, 0x4ac040, 0x2a8a20]); p.ell(14, 12, 4, 4, [0x8af06a, 0x4ac040, 0x2a8a20]);
    p.poly([[3, 16], [15, 16], [13, 25], [5, 25]], [0xe08a5a, 0xc0603a, 0x8a3a1a]);
  });
  pixSprite(scene, 'ix_clock', 18, 30, p => {                          // cuckoo clock, pendulum drawn separately
    p.poly([[9, 0], [18, 8], [0, 8]], DK); p.rrect(2, 8, 16, 22, 1, WD); p.ell(9, 15, 5, 5, [0xfff6e0, 0xf0e0c0, 0xb8a080]);
    p.line([[9, 15], [9, 12]], 0x1a1020); p.line([[9, 15], [11, 15]], 0x1a1020); p.rect(7, 23, 8, 29, 0xffd23f); p.rect(10, 23, 11, 27, 0xffd23f);
  });
  // ---- British home comforts: a teapot in a knitted cosy, bunting, a dartboard, a biscuit tin, wellies
  pixSprite(scene, 'ix_teapot', 22, 16, p => {
    p.ell(10, 10, 8, 6, [0x9a5a3a, 0x6e3a22, 0x4a2214]);           // a brown betty
    p.line([[17, 9], [21, 5]], 0x6e3a22, 2); p.ell(2, 9, 2, 3, 0x6e3a22); p.ell(2, 9, 1, 2, -1);   // spout and handle
    p.rect(3, 15, 17, 15, 0x4a2214);
    p.ell(10, 7, 7, 5, [0xff8a8a, 0xd8202a, 0x8a1018]);              // the knitted cosy: red, white and blue stripes
    for (const [y, c] of [[4, 0xffffff], [6, 0x1a3a8a], [8, 0xffffff]]) for (let x = 4; x <= 16; x++) if (Math.hypot((x - 10) / 7, (y - 7) / 5) < 0.95) p.px(x, y, c);
    p.ell(10, 2, 2, 1.6, [0xffffff, 0xe8e8f0, 0xb8b8c0]);             // pom-pom
  });
  pixSprite(scene, 'ix_ukbunting', 160, 14, p => {                      // red, white and blue bunting
    for (let x = 0; x < 160; x++) p.px(x, Math.round(2 + 3 * Math.sin(x / 159 * Math.PI)), 0xe8e0d0);
    const C = [0xd8202a, 0xffffff, 0x1a3a8a];
    for (let i = 0; i < 13; i++) { const x = 4 + i * 12, y = Math.round(2 + 3 * Math.sin(x / 159 * Math.PI)); p.poly([[x, y], [x + 8, y], [x + 4, y + 8]], C[i % 3]); }
  });
  pixSprite(scene, 'ix_darts', 22, 22, p => {                         // a dartboard with a couple of darts in it
    p.ell(11, 11, 10, 10, 0x1a1020);
    for (let a = 0; a < 20; a++) { const a0 = a / 20 * Math.PI * 2, a1 = (a + 1) / 20 * Math.PI * 2, c = a % 2 ? 0xf0e0b0 : 0x1a1a1a;
      p.poly([[11, 11], [11 + 9 * Math.cos(a0), 11 + 9 * Math.sin(a0)], [11 + 9 * Math.cos(a1), 11 + 9 * Math.sin(a1)]], c); }
    for (const r of [8.6, 5]) for (let a = 0; a < 40; a++) { const t = a / 40 * Math.PI * 2; p.px(11 + r * Math.cos(t), 11 + r * Math.sin(t), (a >> 1) % 2 ? 0xd8202a : 0x2a9a3a); }
    p.ell(11, 11, 1.5, 1.5, 0xd8202a);
    p.line([[13, 9], [17, 5]], 0x9aa3b2); p.px(17, 4, 0xffd23f); p.line([[8, 13], [5, 17]], 0x9aa3b2); p.px(4, 18, 0x3a6ad8);
  });
  pixSprite(scene, 'ix_biscuits', 16, 10, p => {                      // a tin of biscuits (lid ajar)
    p.rrect(1, 3, 14, 9, 2, [0x5a8ad8, 0x2a5ab0, 0x1a3a7a]); p.rect(2, 5, 13, 6, 0xffd23f);
    p.rrect(0, 0, 13, 3, 1, [0x6a9ae8, 0x3a6ac0, 0x1a3a7a]); p.ell(12, 2, 2.4, 1.6, [0xe8b070, 0xc08a4a, 0x8a5a2a]);
  });
  pixSprite(scene, 'ix_wellies', 20, 18, p => {                       // muddy green wellies by the door
    for (const x of [1, 10]) { p.rrect(x + 1, 0, x + 6, 15, 1, [0x5ac04a, 0x2a8a2a, 0x1a5a1a]); p.rrect(x, 12, x + 9, 17, 2, [0x5ac04a, 0x2a8a2a, 0x1a5a1a]); p.rect(x, 15, x + 9, 17, 0x5a3a20); }
  });
  pixSprite(scene, 'ix_sampler', 34, 22, p => {                       // "HOME" cross-stitch with a little cow
    p.rrect(0, 0, 33, 21, 1, WD); p.rect(3, 3, 30, 18, 0xfff6e0);
    const L = { H: ['1.1', '111', '1.1'], O: ['111', '1.1', '111'], M: ['1.1', '111', '1.1'], E: ['11', '1.', '11'] };
    let x = 6; for (const ch of 'HOME') { L[ch].forEach((row, j) => [...row].forEach((v, i) => { if (v === '1') p.px(x + i, 6 + j, 0xe03030); })); x += ch === 'E' ? 3 : 4; }
    p.ell(16, 14, 3, 2, [0xffffff, 0xf0f0f0, 0xb8b8c0]); p.px(15, 14, 0x1a1020); p.px(19, 13, 0xffa8b8);
    for (let k = 4; k < 30; k += 3) { p.px(k, 4, 0x4ac040); p.px(k, 17, 0x4ac040); }
  });

  // ---- the Mad Cheese stockpile: an overflowing wooden water tower full of cheese, and milk churns oozing it
  const CH = [0xffe27a, 0xf0bc36, 0xb8801c], WOOD = [0xb07a4a, 0x8a5a3a, 0x5e3a22], TIN = [0xf0f4fa, 0xb8c0cc, 0x7a8290];
  pixSprite(scene, 'ix_tower', 68, 112, p => {
    for (const [a, b] of [[[16, 62], [9, 110]], [[52, 62], [59, 110]], [[27, 64], [25, 110]], [[41, 64], [43, 110]]]) p.line([a, b], 0x6e4a32, 3);   // stilts
    p.line([[12, 86], [56, 86]], 0x6e4a32, 2); p.line([[14, 72], [54, 100]], 0x5e3a22, 1); p.line([[54, 72], [14, 100]], 0x5e3a22, 1);              // braces
    p.rrect(6, 24, 61, 64, 5, WOOD);                                                                                 // the barrel tank
    for (let x = 12; x < 60; x += 7) p.line([[x, 27], [x, 62]], 0x6e4a32);
    for (const y of [32, 46, 58]) { p.rect(6, y, 61, y + 1, 0x7a8290); p.line([[7, y], [60, y]], 0xb8c0cc); }        // iron hoops
    p.ell(34, 22, 31, 9, CH);                                                                                        // heaped cheese bulging over the rim
    p.ell(26, 15, 12, 6, CH); p.ell(43, 16, 10, 5, CH);
    for (const [x, len] of [[8, 22], [17, 30], [29, 14], [47, 26], [58, 18]]) p.rrect(x - 2, 24, x + 2, 24 + len, 2, CH);   // drips down the sides
    for (const [x, y] of [[24, 13], [40, 18], [33, 22], [14, 22], [52, 21]]) { p.px(x, y, 0xb8801c); p.px(x + 1, y, 0xb8801c); }   // holes
    p.rrect(18, 40, 50, 52, 2, [0xf6e8c8, 0xe9dcb5, 0xb8a880]);                                                      // the sign...
    for (let x = 22; x < 48; x += 4) p.rect(x, 44, x + 2, 48, x % 8 ? 0xe63946 : 0x1a1020);                          // ...squiggly "MAD CHEESE" lettering
  });
  pixSprite(scene, 'ix_churn', 16, 26, p => {
    p.rrect(2, 9, 13, 25, 3, TIN); p.rect(5, 4, 10, 9, TIN[1]); p.rrect(3, 2, 12, 5, 1, TIN);
    p.line([[2, 14], [13, 14]], 0x7a8290); p.line([[2, 21], [13, 21]], 0x7a8290);
    p.ell(8, 2, 5, 2, CH); p.rrect(3, 2, 5, 10, 1, CH); p.rrect(10, 2, 12, 7, 1, CH);                                // cheese oozing out under the lid
  });
  pixSprite(scene, 'ix_spill', 34, 8, p => { p.ell(17, 4, 16, 3, CH); p.ell(9, 3, 5, 2, CH); });
  pixSprite(scene, 'ix_hay', 30, 16, p => {
    p.rrect(1, 2, 28, 15, 3, [0xffe6a0, 0xe8c060, 0xb08a30]);
    for (let x = 5; x < 27; x += 4) p.line([[x, 4], [x + 1, 13]], 0xb08a30);
    p.line([[1, 7], [28, 7]], 0x8a5a3a);
  });
  // ---- the ranch folk
  pixSprite(scene, 'ix_bot', 24, 30, p => {                       // ranch robot: boxy, one red eye, little wheels
    p.line([[12, 1], [12, 5]], 0x7a8290); p.ell(12, 1, 1.5, 1.5, 0xff4040);
    p.rrect(6, 5, 18, 13, 2, [0xd8dfe8, 0x9aa3b2, 0x5a6270]); p.rect(9, 8, 15, 10, 0x1a1020); p.rect(11, 8, 13, 10, 0xff4040);
    p.rrect(4, 13, 20, 24, 3, [0xffb060, 0xff8a1a, 0xb8501a]); p.rect(8, 16, 16, 18, 0xffe27a);
    p.ell(7, 26, 3, 3, [0x5a6270, 0x3a3e4c, 0x24262e]); p.ell(17, 26, 3, 3, [0x5a6270, 0x3a3e4c, 0x24262e]);
  });
  pixSprite(scene, 'ix_dog', 30, 22, p => {                       // space dog in a bubble helmet
    const FUR = [0xf0c080, 0xc08a4a, 0x7a4a20];
    p.line([[5, 10], [1, 4]], 0xc08a4a, 2);                       // tail up
    for (const x of [7, 11, 16, 19]) p.rect(x, 15, x + 1, 20, 0x7a4a20);
    p.ell(12, 12, 8, 5, FUR); p.ell(10, 11, 3, 2, 0xffe6c0);
    p.ell(22, 8, 7, 6, [0xeaf8ff, 0xcfeeff, 0x8ac0e0]);          // helmet
    p.ell(22, 9, 4.5, 3.5, FUR); p.ell(25, 10, 2, 1.5, 0xffe6c0); p.px(27, 9, 0x1a1020);
    p.ell(20, 6, 1.5, 2.5, 0x7a4a20); p.px(22, 8, 0x1a1020); p.px(21, 3, 0xffffff);
  });
  pixSprite(scene, 'ix_chick', 16, 16, p => {                     // space chicken (also in a helmet)
    p.line([[6, 12], [5, 15]], 0xff8a1a); p.line([[9, 12], [10, 15]], 0xff8a1a);
    p.ell(7, 9, 5, 4, [0xffffff, 0xe0e4ee, 0xa0a8b8]); p.ell(4, 8, 2, 2, [0xe0e4ee, 0xa0a8b8, 0x707888]);
    p.ell(11, 5, 4, 4, [0xeaf8ff, 0xcfeeff, 0x8ac0e0]); p.ell(11, 5, 2.5, 2.5, [0xffffff, 0xe0e4ee, 0xa0a8b8]);
    p.px(11, 2, 0xe63946); p.px(12, 2, 0xe63946); p.px(13, 5, 0xffa21a); p.px(14, 5, 0xffa21a); p.px(11, 5, 0x1a1020);
  });
  pixSprite(scene, 'ix_kid', 18, 28, p => {                       // little alien neighbour in dungarees
    p.line([[6, 3], [4, 0]], 0x2f8a1a); p.line([[12, 3], [14, 0]], 0x2f8a1a); p.px(4, 0, 0xffd23f); p.px(14, 0, 0xffd23f);
    p.ell(9, 8, 6, 5.5, [0xb4ff8a, 0x6fd84a, 0x2f8a1a]);
    p.ell(6.5, 8, 1.6, 2.2, 0x1a1020); p.ell(11.5, 8, 1.6, 2.2, 0x1a1020); p.px(6, 7, 0xffffff); p.px(11, 7, 0xffffff);
    p.line([[7, 11], [11, 11]], 0x2f8a1a);
    p.rrect(5, 14, 13, 23, 2, [0x7a9cff, 0x4a6ae0, 0x24348a]); p.rect(6, 14, 7, 16, 0xffd23f); p.rect(11, 14, 12, 16, 0xffd23f);
    p.line([[5, 15], [2, 20]], 0x6fd84a, 2);
    p.rect(6, 23, 7, 27, 0x2f8a1a); p.rect(11, 23, 12, 27, 0x2f8a1a);
  });
  pixSprite(scene, 'ix_kidarm', 6, 10, p => { p.line([[1, 9], [4, 1]], 0x6fd84a, 2); p.ell(4, 1, 1.5, 1.5, 0x6fd84a); });

  // ---- the comic close-up: speed lines behind Chris's portrait
  pixTex(scene, 'ix_speed', 150, 104, put => {
    for (let y = 0; y < 104; y++) for (let x = 0; x < 150; x++) {
      const edge = x < 2 || y < 2 || x > 147 || y > 101, inner = x < 3 || y < 3 || x > 146 || y > 100;
      if (edge) { put(x, y, INK); continue; }
      if (inner) { put(x, y, 0xffffff); continue; }
      const a = Math.atan2(y - 52, x - 52), d = Math.hypot(x - 52, y - 52) / 90;
      const band = Math.floor((a + Math.PI) / (Math.PI * 2) * 28) % 2;
      put(x, y, band ? (d + bay(x, y) * 0.35 > 0.75 ? 0xd0302a : 0xff8a1a) : (d + bay(x, y) * 0.35 > 0.8 ? 0xff8a1a : 0xffd23f));
    }
  });
}

class IntroScene extends Phaser.Scene {
  constructor(key) { super(key || 'intro'); }

  preload() {
    this.load.image('titleArt', 'assets/title.jpg?v=1');
    this.load.image('portrait', 'assets/portrait.png?v=2');
  }

  // Animated title screen: the painted key art, slowly drifting, with effects layered on top
  // (muzzle flash, macaroni flying out of the drill, steam from the hopper, pulsing UFO beam, twinkles).
  // Positions are in the art's own pixels (1024 x 572).
  buildTitleArt() {
    if (!this.textures.exists('titleArt')) return;
    const A = this.add.container(0, 0).setDepth(9);
    this.art = A;
    const P = (x, y) => [x - 512, y - 286];
    A.add(this.add.image(0, 0, 'titleArt'));

    A.add(this.add.particles(...P(560, 95), 'i_puff', {                               // steam from the hopper
      lifespan: 2600, speedX: { min: 4, max: 22 }, speedY: { min: -38, max: -20 }, scale: { start: 0.25, end: 0.9 },
      alpha: { start: 0.45, end: 0 }, tint: 0xe8dcc8, frequency: 260
    }));
    A.add(this.add.particles(...P(765, 205), 'spark', {                               // drill sparks
      lifespan: 450, speed: { min: 80, max: 260 }, angle: { min: -60, max: 60 }, scale: { start: 1.6, end: 0 },
      blendMode: 'ADD', frequency: 45
    }));
    const flash = this.add.image(...P(752, 205), 'i_glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffd27a);
    A.add(flash);
    this.time.addEvent({ delay: 70, loop: true, callback: () => flash.setScale(Phaser.Math.FloatBetween(0.7, 1.5)).setAlpha(Phaser.Math.FloatBetween(0.5, 1)) });
    A.add(this.add.particles(...P(505, 425), 'flame', {                               // jet boots
      lifespan: 380, speedX: { min: -30, max: 30 }, speedY: { min: 60, max: 140 }, scale: { start: 2.2, end: 0 },
      blendMode: 'ADD', frequency: 50
    }));
    for (let i = 0; i < 14; i++) {                                                   // twinkling stars in the sky
      const st = this.add.image(...P(Phaser.Math.Between(20, 1000), Phaser.Math.Between(10, 170)), 'spark').setBlendMode(Phaser.BlendModes.ADD).setScale(0);
      A.add(st);
      this.tweens.add({ targets: st, scale: Phaser.Math.FloatBetween(1.2, 2.4), yoyo: true, repeat: -1, duration: Phaser.Math.Between(500, 1100), delay: Phaser.Math.Between(0, 3000), repeatDelay: Phaser.Math.Between(400, 2500) });
    }
    const shade = this.add.graphics();                                               // darken the bottom so the title reads
    shade.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.7, 0.7).fillRect(-512, 90, 1024, 196);
    A.add(shade);
    this.time.addEvent({ delay: 16, loop: true, callback: () => this.fitArt() });
  }

  fitArt() {
    if (!this.art) return;
    // cover the whole screen every frame (size can change: fullscreen, rotation, PC window), with a slow drift + zoom
    const W = this.scale.width, H = this.scale.height, t = this.time.now / 1000;
    const s = Math.max(W / 1024, H / 572) * (1.04 + 0.03 * Math.sin(t * 0.5));
    const slackX = (1024 * s - W) / 2, slackY = (572 * s - H) / 2;
    this.art.setScale(s).setPosition(W / 2 + Math.sin(t * 0.6) * slackX * 0.6, H / 2 + slackY * (0.6 + 0.3 * Math.sin(t * 0.45)));
  }

  create() {
    buildAllTextures(this);                                    // every sprite, generated once and packed onto the shared sheet
    if (/[?&]skipintro/.test(window.location.search)) { this.scene.start('level1'); return; }
    if (/[?&]ending/.test(window.location.search)) { this.scene.start('ending'); return; }
    this.cameras.main.setBackgroundColor('#000000');
    this.phase = 'gate';            // gate (waiting for first tap) -> title -> play -> leaving
    this.wantFs = false;
    this.leaving = false;
    this.rig = null; this.shot = null; this.acts = [];

    this.stage = this.add.container(0, 0).setDepth(1).setVisible(false);
    this.buildTitleArt();

    // cinematic bars + caption box (screen space, drawn over the stage)
    this.bars = this.add.graphics().setDepth(8).setVisible(false);
    this.caption = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '11px', color: '#ffffff', lineSpacing: 7 }).setDepth(10).setVisible(false);
    this.chapter = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '8px', color: '#ffd23f' }).setDepth(10).setVisible(false);
    this.skipText = this.add.text(0, 0, 'SKIP >>', { fontFamily: PIXEL, fontSize: '8px', color: '#9fa6c2' }).setOrigin(1, 0.5).setDepth(10).setVisible(false);
    this.flashRect = this.add.rectangle(0, 0, 10, 10, 0xffffff, 0).setOrigin(0).setDepth(9);

    // title gate
    this.capText = this.add.text(0, 0, 'TAP TO START', { fontFamily: PIXEL, fontSize: '13px', color: '#ffffff', align: 'center', stroke: '#1a1020', strokeThickness: 4 }).setOrigin(0.5).setDepth(12);
    this.gateTitle = this.add.text(0, 0, 'LUNA CHRIS', { fontFamily: PIXEL, fontSize: '46px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 10 }).setOrigin(0.5).setDepth(12);
    this.gateSub = this.add.text(0, 0, 'RETIRED CHEF, EX-ASTRONAUT, HERO', { fontFamily: PIXEL, fontSize: '10px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 4 }).setOrigin(0.5).setDepth(12);
    this.gateTitle.setShadow(4, 5, '#000000', 0, true, true).setScale(0);
    this.tweens.add({ targets: this.gateTitle, scale: 1, duration: 650, delay: 350, ease: 'Back.easeOut' });
    this.tweens.add({ targets: this.gateTitle, angle: { from: -2, to: 2 }, yoyo: true, repeat: -1, duration: 1400, ease: 'Sine.easeInOut', delay: 1000 });
    this.pulse = this.tweens.add({ targets: this.capText, alpha: 0.35, yoyo: true, repeat: -1, duration: 700 });

    this.fit();
    this.scale.on('resize', this.fit, this);
    const lockLandscape = () => { try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* not supported */ } };
    this.scale.on('enterfullscreen', lockLandscape);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.fit, this);
      this.scale.off('enterfullscreen', lockLandscape);
      Sound.jet(false);
    });

    const padOff = Pad.on(b => {                       // controller: any face button / Start
      if (!['a', 'b', 'x', 'y', 'start'].includes(b)) return;
      Sound.init(); this.press();
    });
    this.events.once('shutdown', padOff);
    if (this.input.keyboard) this.input.keyboard.on('keydown', e => {
      if (!['Enter', ' ', 'Escape', 'x', 'X', 'z', 'Z'].includes(e.key)) return;
      Sound.init(); this.press();
    });
    this.input.on('pointerdown', () => {
      if (this.phase === 'gate') this.wantFs = true;
      else this.press();
    });
    // Fullscreen needs a tap *release* (user activation), so it is requested on pointerup.
    this.input.on('pointerup', () => {
      if (!this.wantFs) return;
      this.wantFs = false;
      const standalone = window.matchMedia && (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches);
      try { if (!standalone && !this.scale.isFullscreen) this.scale.startFullscreen({ navigationUI: 'hide' }); } catch (e) { /* e.g. iPhone Safari */ }
      if (this.phase === 'gate') this.startShow();
    });
  }

  // ------------------------------------------------------------- layout
  fit() {
    const W = this.scale.width, H = this.scale.height;
    this.W = W; this.H = H;
    const top = Math.max(18, Math.round(H * 0.07)), bot = Math.max(58, Math.round(H * 0.2));
    const vh = H - top - bot;
    const s = Math.max(vh / VIEW_H, W / 720);
    this.s = s;
    this.stage.setScale(s).setPosition(Math.round(W / 2), Math.round(top + vh / 2));
    this.flashRect.setSize(W, H);

    const g = this.bars; g.clear();
    g.fillStyle(0x000000, 1).fillRect(0, 0, W, top).fillRect(0, H - bot, W, bot);
    const px = 10, py = H - bot + 8, pw = W - 20, ph = bot - 16;                   // caption panel: dark, full pixel outline
    g.fillStyle(INK, 1).fillRect(px - 3, py - 3, pw + 6, ph + 6);
    g.fillStyle(0xc9cde0, 1).fillRect(px - 1, py - 1, pw + 2, ph + 2);
    g.fillStyle(0x151b40, 1).fillRect(px, py, pw, ph);
    g.fillStyle(0x222a5a, 1).fillRect(px, py, pw, 2);
    const fs = Math.max(9, Math.min(15, Math.round(W / 62)));
    this.caption.setFontSize(fs).setLineSpacing(Math.round(fs * 0.7)).setPosition(px + 14, py + 12).setWordWrapWidth(pw - 28);
    this.chapter.setPosition(12, Math.round(top / 2 - 4));
    this.skipText.setOrigin(1, 1).setPosition(px + pw - 10, py + ph - 8);

    this.capText.setPosition(W / 2, H - 34).setWordWrapWidth(W - 40);
    this.fitArt();
    const tfs = Math.max(24, Math.min(50, W / 17));
    this.gateTitle.setFontSize(tfs).setPosition(W / 2, H * 0.74);
    this.gateSub.setFontSize(Math.max(8, Math.min(13, W / 75))).setPosition(W / 2, H * 0.74 + tfs * 0.8);
  }

  // any tap / key / button: start -> straight into the story -> (tap twice) skip the story
  press() {
    if (this.leaving) return;
    if (this.phase === 'gate') { this.startShow(); return; }
    if (this.phase === 'title') { if (this.titleT) this.titleT.remove(); this.story(); return; }
    if (this.phase === 'play') {
      if (this.skipArmed) { this.leave(); return; }
      this.skipArmed = true;
      this.skipText.setText('TAP AGAIN TO SKIP >>').setColor('#ffd23f');
      this.time.delayedCall(2200, () => { this.skipArmed = false; if (this.skipText.active) this.skipText.setText('SKIP >>').setColor('#9fa6c2'); });
    }
  }

  at(ms, fn) { return this.time.delayedCall(ms, () => { if (!this.leaving) fn(); }); }
  shake(d, i) { if (typeof Settings === 'undefined' || Settings.shake) this.cameras.main.shake(d, i); }
  flash(a, ms) { this.flashRect.setAlpha(a); this.tweens.add({ targets: this.flashRect, alpha: 0, duration: ms || 300 }); }
  add2(o) { this.shot.add(o); return o; }
  img(x, y, key, ox = 0.5, oy = 1) { return this.add2(this.add.image(x, y, key).setOrigin(ox, oy)); }

  // typewriter caption with a little blip
  say(text) {
    if (this.typer) this.typer.remove();
    this.caption.setText('');
    let i = 0;
    this.typer = this.time.addEvent({ delay: 28, repeat: text.length - 1, callback: () => {
      i++; this.caption.setText(text.slice(0, i));
      if (i % 2 === 0 && text[i - 1] !== ' ') Sound.sfx('blip');
    } });
  }

  // pixel speech bubble, in shot coordinates
  bubble(x, y, txt, life = 1500, col = '#1a1020') {
    const t = this.add.text(0, -1, txt, { fontFamily: PIXEL, fontSize: '8px', color: col }).setOrigin(0.5).setResolution(Math.max(2, Math.ceil(this.s * 1.5)));
    const w = Math.ceil(t.width / 2) * 2 + 12, h = 16, L = -w / 2, T = -h / 2;
    const g = this.add.graphics();
    g.fillStyle(INK, 1).fillRect(L + 1, T, w - 2, h).fillRect(L, T + 1, w, h - 2).fillRect(-5, T + h - 1, 8, 3).fillRect(-4, T + h + 2, 5, 2).fillRect(-3, T + h + 4, 2, 2);
    g.fillStyle(0xffffff, 1).fillRect(L + 2, T + 1, w - 4, h - 2).fillRect(L + 1, T + 2, w - 2, h - 4).fillRect(-4, T + h - 2, 6, 3).fillRect(-3, T + h + 1, 3, 2);
    g.fillStyle(0xdde3f0, 1).fillRect(L + 2, T + h - 3, w - 4, 1);
    const c = this.add2(this.add.container(Math.round(x), Math.round(y), [g, t])).setScale(0);
    this.tweens.add({ targets: c, scale: 1, duration: 180, ease: 'Back.easeOut' });
    this.tweens.add({ targets: c, y: c.y - 3, yoyo: true, repeat: -1, duration: 500, ease: 'Sine.easeInOut' });
    this.at(life, () => this.tweens.add({ targets: c, scale: 0, duration: 140, onComplete: () => c.destroy() }));
    return c;
  }

  dust(x, y, n, key = 'ix_dust', spread = 30, up = 30) {
    for (let i = 0; i < n; i++) {
      const p = this.img(x + Phaser.Math.Between(-spread, spread), y + Phaser.Math.Between(-6, 2), key, 0.5, 0.5).setScale(Phaser.Math.FloatBetween(0.6, 1.2));
      this.tweens.add({ targets: p, x: p.x + Phaser.Math.Between(-20, 20), y: p.y - Phaser.Math.Between(up * 0.4, up), scale: 0, duration: Phaser.Math.Between(500, 900), ease: 'Quad.easeOut', onComplete: () => p.destroy() });
    }
  }

  // ------------------------------------------------------------- the show
  // The first tap lands here: the title fanfare starts (browsers only allow sound after a tap) and the logo gets its moment.
  startShow() {
    this.phase = 'title';
    Sound.init(); Sound.music('title');
    this.pulse.stop();
    this.capText.setText('').setAlpha(1);
    this.tweens.add({ targets: [this.gateTitle, this.gateSub], scale: 1.12, yoyo: true, repeat: 3, duration: 330, ease: 'Sine.easeInOut' });
    this.titleT = this.at(this.art ? 4400 : 1500, () => this.story());
  }

  story() {
    if (this.phase === 'play') return;
    this.phase = 'play'; this.skipArmed = false;
    Sound.music('ranch');
    this.tweens.add({ targets: [this.gateTitle, this.gateSub, this.capText], alpha: 0, duration: 400 });
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (this.leaving) return;
      if (this.art) { this.art.destroy(); this.art = null; }
      [this.gateTitle, this.gateSub, this.capText].forEach(o => o.setVisible(false));
      this.stage.setVisible(true);
      [this.bars, this.caption, this.chapter, this.skipText].forEach(o => o.setVisible(true));
      this.shotRanch();
      this.cameras.main.fadeIn(500, 0, 0, 0);
    });
  }

  // swap to a new shot with a quick fade through black
  cut(build) {
    this.cameras.main.fadeOut(220, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (this.leaving) return;
      this.clearShot();
      build.call(this);
      this.cameras.main.fadeIn(280, 0, 0, 0);
    });
  }

  clearShot() {
    this.acts = []; this.hop = false; this.thrustAcc = 0; this.walkTo = null;
    if (this.rig) { this.rig.root.destroy(); this.rig = null; }
    if (this.shot) this.shot.destroy();
    this.shot = this.add.container(0, 0);
    this.stage.add(this.shot);
    this.camY = 0; this.camX = 0;
  }

  // the real in-game Chris, driven by a fake player state
  makeChris(x, facing, tool) {
    this.rig = new ChrisRig(this);
    this.shot.add(this.rig.root);
    this.P = { h: 0, floor: 0, vh: 0, vx: 0, thrusting: false, firing: 0, aimA: 0, power: 0, duck: false, facing };
    this.cx = x; this.walkTo = null;
    if (tool === 'spatula') { this.rig.gun.setTexture('ix_spatula'); this.rig.auger.setVisible(false); this.rig.setChef(true); }   // at home he's a chef in his apron
    else this.rig.setWeapon(WEAPONS[0]);
    this.rigUpdate(0.016);
  }

  rigUpdate(dt) {
    const P = this.P, r = this.rig;
    if (this.walkTo !== null) {                                   // simple walk-to
      const d = this.walkTo - this.cx, sp = this.walkSpeed || 70;
      if (Math.abs(d) < 1) { this.cx = this.walkTo; this.walkTo = null; P.vx = 0; }
      else { P.vx = Math.sign(d) * sp * 2; P.facing = Math.sign(d); this.cx += Math.sign(d) * Math.min(Math.abs(d), sp * dt); }
    }
    if (this.hop) {                                               // little ballistic hop / jet climb
      P.vh -= (P.thrusting ? -(this.thrustAcc || 260) : 520) * dt;
      P.h += P.vh * dt;
      if (P.h <= 0 && !P.thrusting) { P.h = 0; P.vh = 0; this.hop = false; this.dust(this.cx, GY, 3, 'ix_dust', 8, 10); }
    }
    this.augF = ((this.augF || 0) + dt * 30) % 4;
    r.update(P, dt, Math.round(this.cx), Math.round(GY - P.h), 1, 1, this.augF | 0);
    P.firing = Math.max(0, P.firing - dt);
  }

  // a point on the tool in Chris's hand (gun-arm local coordinates) -> shot coordinates
  handPoint(lx, ly) {
    const ga = this.rig.gunArm, root = this.rig.root, r = ga.rotation;
    const x = ga.x + lx * ga.scaleX * Math.cos(r) - ly * ga.scaleY * Math.sin(r);
    const y = ga.y + lx * ga.scaleX * Math.sin(r) + ly * ga.scaleY * Math.cos(r);
    return { x: root.x + x * root.scaleX, y: root.y + y * root.scaleY };
  }
  headPoint() { const root = this.rig.root, t = this.rig.torso, h = this.rig.hat; return { x: root.x + (t.x + h.x) * root.scaleX, y: root.y + (t.y + h.y - 15) * root.scaleY }; }

  update(time, delta) {
    if (this.phase !== 'play' || !this.shot) return;
    const dt = Math.min(0.05, delta / 1000);
    if (this.rig) this.rigUpdate(dt);
    for (const a of this.acts) a(dt);
    this.shot.y = Math.round(this.camY); this.shot.x = -Math.round(this.camX || 0);
  }

  sky(key, tint) {
    this.img(0, GY + 12, key).setTint(tint || 0xffffff);
  }

  // ============================================================= SHOT 1: the ranch at dusk
  shotRanch() {
    this.clearShot();
    this.bessieTaken = false; this.flipping = false;
    this.chapter.setText('THE GRUYERE GLOBE  -  SPACE FARM NO. 9');
    const T = (ms, fn) => this.at(ms, fn);

    // parallax backdrop
    this.sky('ix_sky_dusk');
    const neb = this.img(-170, -150, 'c_galaxy', 0.5, 0.5).setScale(0.55).setAlpha(0.8);
    const planet = this.img(150, -46, 'c_ringed', 0.5, 0.5).setScale(0.75);
    const far = this.img(0, GY + 2, 'ix_hills_far');
    const mid = this.img(0, GY + 4, 'ix_hills_mid');
    this.twinkles(-360, 360, -280, 0);

    // the ranch
    const cabin = this.img(-190, GY + 3, 'ix_cabin');
    const glowW = this.img(-210, GY - 26, 'puff', 0.5, 0.5).setScale(0.6).setTint(0xffb347).setAlpha(0.35).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glowW, alpha: 0.2, yoyo: true, repeat: -1, duration: 900 });
    const chimney = this.add2(this.add.particles(-164, GY - 70, 'ix_smoke', { lifespan: 2400, speedX: { min: 4, max: 12 }, speedY: { min: -16, max: -9 }, scale: { start: 0.5, end: 1.3 }, alpha: { start: 0.8, end: 0 }, frequency: 340 }));
    this.barn = this.img(BX, GY + 2, 'ix_barn');
    this.buildStockpile();
    this.img(112, GY + 2, 'ix_fence');
    this.img(0, GY - 1, 'ix_ground', 0.5, 0);
    for (const [x, k] of [[-260, 'p_tuft1'], [-110, 'p_tuft2'], [-14, 'p_tuft1'], [118, 'p_tuft2'], [252, 'p_tuft1'], [300, 'p_tuft2']]) this.img(x, GY + 2, k);

    // Chris at the griddle, Bessie grazing
    this.img(-50, GY + 1, 'ix_grill');
    const coals = this.add2(this.add.particles(-50, GY - 20, 'spark', { lifespan: 500, speedY: { min: -30, max: -12 }, speedX: { min: -6, max: 6 }, scale: { start: 0.8, end: 0 }, blendMode: 'ADD', frequency: 160, tint: 0xff8a1a }));
    this.bessie = this.img(26, GY + 1, 'bessie').setFlipX(true);
    this.buildRanchFolk();
    this.makeChris(-86, 1, 'spatula');
    this.pancake = this.img(0, 0, 'ix_pancake', 0.5, 0.5);
    const pc = this.pcake = { mode: 'held', x: 0, y: 0, vx: 0, vy: 0, rot: 0 };
    this.flipT = 0.8;
    this.acts.push(dt => {                                         // pancake flipping + Bessie chewing
      const P = this.P;
      if (pc.mode === 'held') {
        const b = this.handPoint(37, -8); pc.x = b.x; pc.y = b.y - 3; pc.rot *= 0.8;
        this.flipT -= dt;
        if (this.flipT <= 0 && this.flipping) {
          this.flipT = 1.6; P.aimA = 0.9; this.at(120, () => { if (this.P) this.P.aimA = 0; });
          pc.mode = 'air'; pc.vy = -150; pc.vx = 0; Sound.sfx('flap');
        }
      } else if (pc.mode === 'air') {
        pc.vy += 420 * dt; pc.x += pc.vx * dt; pc.y += pc.vy * dt; pc.rot += dt * 14;
        const b = this.handPoint(37, -8);
        if (pc.vy > 0 && pc.y >= b.y - 3) { pc.mode = 'held'; pc.rot = 0; Sound.sfx('cube'); }
      } else if (pc.mode === 'head') {
        const h = this.headPoint(); pc.x = h.x; pc.y = h.y; pc.rot = 0.15;
      }
      this.pancake.setPosition(Math.round(pc.x), Math.round(pc.y)).setRotation(pc.rot);
      if (this.bessie.active && !this.bessieTaken) {
        const k = Math.sin(this.time.now / 260);
        this.bessie.setScale(1, 1 + Math.max(0, k) * 0.03);
      }
    });
    this.flipping = true;

    // the camera starts up in the stars and drifts down to the ranch
    this.camY = 170;
    this.tweens.add({ targets: this, camY: 0, duration: 3000, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: [neb, planet], y: '+=30', duration: 3000, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: far, y: GY - 2, duration: 3000, ease: 'Sine.easeInOut' });

    this.say('THE GRUYERE GLOBE. A QUIET LITTLE CHEESE MOON ON THE EDGE OF THE GALAXY...');
    T(3400, () => this.say('HOME OF LUNA CHRIS: ONCE THE GALAXY\'S MOST DECORATED ASTRONAUT.'));
    T(4600, () => this.bubble(this.cx + 4, GY - 104, 'ANOTHER STACK!', 1500));
    T(6600, () => this.say('RETIRED NOW. HE FLIPS BURGERS AND MINDS HIS BEST PAL, BESSIE THE COW.'));
    T(7600, () => { Sound.sfx('moo'); this.bubble(40, GY - 60, 'MOO <3', 1400); });
    T(9200, () => { this.say('HER MAD CHEESE IS SO GOOD THE WHOLE FARM IS OVERFLOWING WITH IT.'); this.tweens.add({ targets: this, camX: 60, duration: 1400, yoyo: true, hold: 600, ease: 'Sine.easeInOut' }); });

    // ---- the rats arrive
    T(12400, () => {
      this.say('THEN THE PARMESAN PIRATES CAME CALLING...');
      this.folkPanic();
      Sound.music('tense'); Sound.sfx('alarm');
      this.flipping = false;
      this.tweens.add({ targets: this.flashRect.setFillStyle(0xff2030, 1), alpha: { from: 0, to: 0.25 }, yoyo: true, repeat: 2, duration: 160, onComplete: () => this.flashRect.setFillStyle(0xffffff, 1).setAlpha(0) });
    });
    T(12900, () => this.shipCrash());
  }

  // the Mad Cheese stockpile: an overflowing cheese water tower (behind the fence), dripping into a puddle
  buildStockpile() {
    this.img(120, GY + 4, 'ix_spill').setScale(1.5, 1.2);
    this.tower = this.img(120, GY + 2, 'ix_tower');
    this.tweens.add({ targets: this.tower, scaleY: 1.02, scaleX: 0.99, yoyo: true, repeat: -1, duration: 800, ease: 'Sine.easeInOut' });   // it's so full it bulges
    this.add2(this.add.particles(120, GY - 86, 'fondue', { x: { min: -30, max: 30 }, lifespan: 800, speedY: { min: 10, max: 40 }, gravityY: 260, scale: { start: 0.55, end: 0.3 }, frequency: 180 }));
  }

  // the ranch folk: a robot farmhand rolling churns, a space dog, two space chickens and the alien kid from next door
  buildRanchFolk() {
    const F = this.folk = { panic: false };
    F.kid = this.img(-128, GY - 9, 'ix_kid');
    F.arm = this.img(-123, GY - 23, 'ix_kidarm', 0.2, 0.9);
    this.img(-128, GY + 2, 'ix_hay');
    this.tweens.add({ targets: F.kid, y: F.kid.y - 1, yoyo: true, repeat: -1, duration: 500 });
    this.img(92, GY + 4, 'ix_spill');
    this.img(94, GY - 3, 'ix_churn', 0.5, 0.5).setAngle(78);                            // one's tipped over, oozing
    F.churns = [this.img(160, GY + 2, 'ix_churn'), this.img(174, GY + 3, 'ix_churn')];
    F.bot = this.img(70, GY + 2, 'ix_bot'); F.botChurn = this.img(70, GY - 26, 'ix_churn').setScale(0.85); F.botDir = 1;
    F.dog = this.img(-30, GY + 1, 'ix_dog'); F.dogDir = 1; F.dogX = -30;
    F.chicks = [-6, 52].map((x, i) => {
      const c = this.img(x, GY + 1, 'ix_chick').setFlipX(i === 0);
      this.tweens.add({ targets: c, angle: { from: 0, to: c.flipX ? -28 : 28 }, yoyo: true, repeat: -1, duration: 140, repeatDelay: 600 + i * 450, delay: i * 300 });   // peck peck
      return c;
    });
    this.acts.push(dt => {
      const t = this.time.now / 1000;
      if (!F.panic) {                                                                // robot trundles to and fro with a churn
        F.bot.x += F.botDir * 26 * dt;
        if (F.bot.x > 150) F.botDir = -1; else if (F.bot.x < 62) F.botDir = 1;
        F.bot.setFlipX(F.botDir < 0).y = GY + 2 - Math.abs(Math.sin(t * 12)) * 1;
        F.botChurn.setPosition(F.bot.x, F.bot.y - 27);
        F.dogX += F.dogDir * 60 * dt;                                                 // dog bounds about by Chris
        if (F.dogX > 4) F.dogDir = -1; else if (F.dogX < -66) F.dogDir = 1;
        F.dog.setFlipX(F.dogDir < 0).setPosition(Math.round(F.dogX), GY + 1 - Math.abs(Math.sin(t * 9)) * 5);
      }
    });
    this.at(2600, () => {                                                            // the kid waves hello
      if (F.panic) return;
      this.bubble(-124, GY - 50, 'HI CHRIS!', 1500);
      this.tweens.add({ targets: F.arm, angle: { from: -30, to: 30 }, yoyo: true, repeat: 5, duration: 140 });
    });
    this.at(5400, () => { if (!F.panic) { Sound.sfx('flap'); this.bubble(F.dog.x + 4, GY - 32, 'ARF!', 900); } });
  }

  // everyone reacts when the alarm goes off
  folkPanic() {
    const F = this.folk; if (!F) return;
    F.panic = true;
    this.bubble(F.dog.x + 4, GY - 32, 'WOOF! WOOF!', 1600);
    this.tweens.add({ targets: F.dog, x: this.cx - 34, duration: 500, ease: 'Quad.easeOut', onComplete: () => this.tweens.add({ targets: F.dog, x: F.dog.x + 1.5, yoyo: true, repeat: -1, duration: 40 }) });   // hides behind Chris, shivering
    F.dog.setFlipX(true);
    F.chicks.forEach((c, i) => {                                                     // chickens bolt off, feathers everywhere
      this.tweens.killTweensOf(c);
      c.setFlipX(true);
      this.dust(c.x, GY - 4, 4, 'ix_dust', 6, 14);
      this.tweens.add({ targets: c, x: -330, duration: 1300 + i * 200, ease: 'Quad.easeIn' });
      this.tweens.add({ targets: c, y: GY - 10, yoyo: true, repeat: 8, duration: 80 });
    });
    this.bubble(F.bot.x, GY - 44, '!?', 1400, '#d0302a');                           // robot spins out and drops its churn
    this.tweens.add({ targets: F.bot, angle: 720, duration: 900, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: F.botChurn, y: GY - 2, angle: 95, x: F.botChurn.x + 14, duration: 450, ease: 'Bounce.easeOut' });
    this.tweens.killTweensOf([F.arm, F.kid]);                                        // the kid ducks behind the hay bale
    this.tweens.add({ targets: [F.kid, F.arm], y: '+=30', duration: 260, delay: 200, ease: 'Quad.easeIn' });
  }

  twinkles(x0, x1, y0, y1) {
    for (let i = 0; i < 26; i++) {
      const st = this.img(Phaser.Math.Between(x0, x1), Phaser.Math.Between(y0, y1), 'spark', 0.5, 0.5).setBlendMode(Phaser.BlendModes.ADD).setScale(0).setTint([0xffffff, 0xbfe4ff, 0xfff1a0][i % 3]);
      this.tweens.add({ targets: st, scale: Phaser.Math.FloatBetween(0.6, 1.3), yoyo: true, repeat: -1, duration: Phaser.Math.Between(400, 900), delay: Phaser.Math.Between(0, 2500), repeatDelay: Phaser.Math.Between(300, 2200) });
    }
  }

  shipCrash() {
    Sound.sfx('ufoFly');
    const ship = this.ship = this.img(-430, -190, 'ratship', 0.5, 0.5).setScale(1.1).setRotation(0.5);
    const smoke = this.add2(this.add.particles(0, 0, 'ix_smoke', { lifespan: 900, speed: { min: 6, max: 20 }, scale: { start: 0.7, end: 1.4 }, alpha: { start: 0.9, end: 0 }, frequency: 30 }));
    const fire = this.add2(this.add.particles(0, 0, 'flame', { lifespan: 300, speed: { min: 10, max: 40 }, scale: { start: 1.6, end: 0 }, blendMode: 'ADD', frequency: 25 }));
    smoke.startFollow(ship, -30, 0); fire.startFollow(ship, -34, 2);
    this.shipFx = [smoke, fire];
    this.tweens.add({ targets: ship, x: BX + 8, y: GY - 70, rotation: 0.25, duration: 950, ease: 'Quad.easeIn', onComplete: () => this.impact() });
    this.at(500, () => { if (this.rig) { this.P.facing = 1; this.bubble(this.cx + 2, GY - 104, '!', 1800, '#d0302a'); } });
  }

  impact() {
    const ship = this.ship;
    Sound.sfx('crash');
    this.shake(420, 0.016); this.flash(0.8, 380);
    this.barn.setTexture('ix_barn_x');
    ship.setVisible(false); this.shipFx.forEach(e => e.stop());
    for (let i = 0; i < 12; i++) {                                    // planks and bolts everywhere
      const p = this.img(BX + Phaser.Math.Between(-16, 16), GY - 76, i % 3 ? 'ix_plank' : 'db_bolt', 0.5, 0.5);
      const tx = p.x + Phaser.Math.Between(-150, 120), peak = p.y - Phaser.Math.Between(30, 90);
      this.tweens.add({ targets: p, x: tx, duration: 900, ease: 'Linear' });
      this.tweens.add({ targets: p, y: peak, duration: 380, ease: 'Quad.easeOut', onComplete: () => this.tweens.add({ targets: p, y: GY, duration: 520, ease: 'Quad.easeIn', onComplete: () => this.tweens.add({ targets: p, alpha: 0, delay: 1400, duration: 300 }) }) });
      this.tweens.add({ targets: p, rotation: Phaser.Math.FloatBetween(-12, 12), duration: 900 });
    }
    this.dust(BX, GY - 70, 10, 'ix_dust', 30, 40);
    this.dust(BX, GY, 8, 'ix_dust', 50, 20);
    this.barnSmoke = this.add2(this.add.particles(BX, GY - 80, 'ix_smoke', { lifespan: 2000, speedX: { min: -6, max: 8 }, speedY: { min: -26, max: -12 }, scale: { start: 0.6, end: 1.6 }, alpha: { start: 0.85, end: 0 }, frequency: 140 }));
    // the pancake goes flying... and lands on his helmet
    const pc = this.pcake; pc.mode = 'air2';
    const h = this.headPoint();
    this.tweens.add({ targets: pc, x: h.x, duration: 700, ease: 'Linear' });
    this.tweens.add({ targets: pc, y: pc.y - 50, duration: 330, ease: 'Quad.easeOut', yoyo: true, onUpdate: () => { pc.rot += 0.35; },
      onComplete: () => { pc.mode = 'head'; Sound.sfx('flap'); } });

    // rats spill out of the barn door
    this.rats = [];
    [[150, -1], [176, -1], [226, 1], [240, 1]].forEach(([x, dir], i) => this.at(450 + i * 230, () => {
      Sound.sfx('squeak');
      const r = this.img(BX, GY + 1, 'mouse').setScale(0.2).setFlipX(dir < 0);
      this.rats.push(r);
      this.tweens.add({ targets: r, x, scale: 1, duration: 520, ease: 'Quad.easeOut' });
      this.tweens.add({ targets: r, y: GY - 22, duration: 260, yoyo: true, ease: 'Quad.easeOut', onComplete: () => {
        this.tweens.add({ targets: r, y: GY - 6, duration: 160, yoyo: true, repeat: -1, ease: 'Quad.easeOut', delay: i * 70 });
      } });
    }));
    this.at(1500, () => this.bubble(222, GY - 40, 'SQUEAK!', 1200));
    this.at(2300, () => this.abduct());
  }

  abduct() {
    const ship = this.ship, bx = this.bessie.x;
    Sound.sfx('beam'); this.say('THEIR HOME WORLD IS ROTTING. ONLY BESSIE\'S MAD CHEESE CAN SAVE IT.');
    ship.setVisible(true).setPosition(BX, GY - 82).setRotation(0);
    this.shipFx.forEach(e => e.start());
    this.shipFx[1].stop();
    this.tweens.add({ targets: ship, x: bx, y: GY - 112, duration: 900, ease: 'Sine.easeInOut', onComplete: () => this.shipFx[0].stop() });
    this.tweens.add({ targets: ship, rotation: { from: -0.08, to: 0.08 }, yoyo: true, repeat: -1, duration: 420, ease: 'Sine.easeInOut' });
    const beam = this.img(bx, GY - 100, 'beam0', 0.5, 0).setAlpha(0).setScale(1.6, (GY + 2 - (GY - 100)) / 84);
    let bf = 0, bt = 0;
    this.acts.push(dt => {
      bt += dt; if (bt > 0.08) { bt = 0; bf = (bf + 1) % 4; beam.setTexture('beam' + bf); }
      beam.setPosition(ship.x, ship.y + 12).setScale(1.6, Math.max(0.1, (GY + 2 - ship.y - 12) / 84));
    });
    this.at(900, () => {
      this.tweens.add({ targets: beam, alpha: 0.9, duration: 250 });
      this.bessieTaken = true;
      Sound.sfx('moo'); this.bubble(bx + 24, GY - 66, 'MOOOOO!', 1500);
      this.tweens.add({ targets: this.bessie, y: GY - 76, duration: 1600, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: this.bessie, angle: { from: -14, to: 14 }, yoyo: true, repeat: 5, duration: 260, ease: 'Sine.easeInOut' });
      this.rats.forEach((r, i) => this.at(300 + i * 180, () => {               // the rats hop into the beam and float up
        this.tweens.killTweensOf(r);
        Sound.sfx('squeak');
        this.tweens.add({ targets: r, x: ship.x + (i - 1.5) * 4, y: ship.y + 20, scale: 0.3, alpha: 0, angle: 360, duration: 900, ease: 'Quad.easeIn' });
      }));
      // Chris drops everything and runs for her
      this.walkSpeed = 80; this.walkTo = this.cx + 46;
    });
    this.at(2700, () => {                                         // ...and they're off
      Sound.sfx('whoosh');
      this.tweens.add({ targets: beam, alpha: 0, duration: 200 });
      this.tweens.killTweensOf(ship);
      this.shipFx[1].start();
      const B = this.bessie;
      this.acts.push(() => { B.setPosition(ship.x, ship.y + 50); });
      this.tweens.add({ targets: ship, x: 520, y: -260, rotation: -0.3, duration: 1000, ease: 'Quad.easeIn' });
      this.tweens.add({ targets: B, angle: -40, duration: 1000 });
    });
    this.at(3200, () => { this.shake(160, 0.004); this.bubble(this.cx + 2, GY - 104, 'BESSIE!!!', 1500, '#d0302a'); });
    this.at(4700, () => this.closeUp());
  }

  // comic-book close-up: Chris's face on a burst of speed lines
  closeUp() {
    Sound.sfx('clang'); this.shake(200, 0.008);
    const panel = this.add2(this.add.container(-60, -8)).setScale(0).setAngle(-4);
    panel.add(this.add.image(0, 0, 'ix_speed'));
    const face = this.add.image(-22, 4, 'portrait').setScale(3.6);
    panel.add(face);
    const pcake = this.add.image(-24, -42, 'ix_pancake').setScale(3).setAngle(10);       // the pancake is still on his head
    panel.add(pcake);
    this.tweens.add({ targets: panel, scale: 1, duration: 260, ease: 'Back.easeOut' });
    this.tweens.add({ targets: face, x: -20, yoyo: true, repeat: -1, duration: 45 });
    this.at(400, () => this.bubble(-6, -72, 'NOBODY TAKES MY COW.', 2200));
    this.say('CHRIS SWORE HE\'D NEVER FLY AGAIN. BUT NOBODY... NOBODY... TAKES HIS COW.');
    this.at(1700, () => { Sound.sfx('flap'); this.tweens.add({ targets: pcake, y: 70, angle: 90, duration: 600, ease: 'Quad.easeIn' }); });
    this.at(3400, () => this.cut(this.shotCabin));
  }

  // ============================================================= SHOT 2: the cabin, and the armoury behind the fireplace
  shotCabin() {
    Sound.music('sneak');
    this.chapter.setText('CHRIS\'S CABIN');
    this.img(0, GY + 4, 'ix_wall');
    this.img(0, GY, 'ix_floor', 0.5, 0);
    this.img(-150, -34, 'ix_window', 0.5, 0.5);
    // home comforts
    this.img(-104, -42, 'ix_sampler', 0.5, 0.5);
    this.img(-38, -46, 'ix_clock', 0.5, 0.5);
    const pendG = this.add2(this.add.graphics());
    this.acts.push(() => { const a = Math.sin(this.time.now / 500) * 0.4; pendG.clear().lineStyle(1, 0xffd23f, 1).lineBetween(-38, -32, -38 + Math.sin(a) * 10, -32 + Math.cos(a) * 10).fillStyle(0xffd23f, 1).fillCircle(-38 + Math.sin(a) * 10, -32 + Math.cos(a) * 10, 2); });
    this.img(-212, -58, 'ix_pans', 0.5, 0.5);
    this.img(-212, GY + 1, 'ix_stove');
    const steam = this.add2(this.add.particles(-220, GY - 44, 'ix_smoke', { lifespan: 1600, speedY: { min: -18, max: -8 }, speedX: { min: -4, max: 4 }, scale: { start: 0.3, end: 0.9 }, alpha: { start: 0.5, end: 0 }, frequency: 300, tint: 0xffffff }));
    this.img(-158, GY + 1, 'ix_plant');
    this.img(-104, GY + 1, 'ix_sofa');
    this.img(-14, GY + 9, 'ix_rug');
    this.img(-92, GY + 6, 'ix_table');
    this.img(-84, GY - 4, 'ix_teapot');                                 // tea's brewing
    const teaSteam = this.add2(this.add.particles(-74, GY - 16, 'ix_smoke', { lifespan: 1400, speedY: { min: -14, max: -6 }, speedX: { min: -3, max: 3 }, scale: { start: 0.15, end: 0.45 }, alpha: { start: 0.45, end: 0 }, frequency: 420 }));
    this.img(-30, -80, 'ix_ukbunting', 0.5, 0); this.img(130, -80, 'ix_ukbunting', 0.5, 0).setFlipX(true);   // red, white and blue bunting along the beams
    this.img(122, -40, 'ix_darts', 0.5, 0.5);
    this.img(176, GY + 1 - 66, 'ix_biscuits');                          // biscuit tin on top of the bookshelf
    this.img(-182, GY + 1, 'ix_wellies');
    // the telly, angled at the sofa, flicking between a cooking show, a cow documentary and static
    this.img(-42, GY + 1, 'ix_tv').setFlipX(true);
    const tvScr = this.img(-39, GY - 10, 'ix_tv0', 0.5, 1).setFlipX(true);
    const tvGlow = this.img(-42, GY - 18, 'puff', 0.5, 0.5).setScale(1.3).setTint(0x7ab8ff).setAlpha(0.22).setBlendMode(Phaser.BlendModes.ADD);
    let ch = 0, chT = 0, zT = 0;
    this.acts.push(dt => {
      chT += dt; if (chT > 1.1) { chT = 0; ch = (ch + 1) % 5; tvScr.setTexture(['ix_tv0', 'ix_tv2', 'ix_tv1', 'ix_tv0', 'ix_tv1'][ch]); tvGlow.setTint(ch === 1 ? 0xffffff : 0x7ab8ff); }
      zT += dt; if (zT > 1.4) {                                        // the sleeping dog's Zzz
        zT = 0; const z = this.add2(this.add.text(46, GY - 10, 'z', { fontFamily: PIXEL, fontSize: '6px', color: '#ffffff' }).setResolution(3));
        this.tweens.add({ targets: z, y: GY - 34, x: 54, alpha: 0, duration: 1600, onComplete: () => z.destroy() });
      }
    });
    this.tweens.add({ targets: tvGlow, alpha: 0.12, yoyo: true, repeat: -1, duration: 90 });
    this.img(-8, GY + 1, 'ix_lamp');
    const lampGlow = this.img(-8, GY - 54, 'puff', 0.5, 0.5).setScale(1.5).setTint(0xffc060).setAlpha(0.3).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: lampGlow, alpha: 0.24, yoyo: true, repeat: -1, duration: 1400 });
    this.img(170, GY + 1, 'ix_shelf');
    const dog = this.cabinDog = this.img(40, GY + 8, 'ix_dog').setFlipX(true).setScale(0.9);   // (on the warm hearth)       // the space dog, fast asleep on the rug
    this.tweens.add({ targets: dog, scaleY: 0.84, yoyo: true, repeat: -1, duration: 900 });

    const FX = 64;                                                       // the fireplace
    const glow = this.img(FX, GY - 22, 'puff', 0.5, 0.5).setScale(1.6).setTint(0xff7a2a).setAlpha(0.35).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0.22, scale: 1.4, yoyo: true, repeat: -1, duration: 160 });
    this.fire = this.add2(this.add.particles(FX, GY - 10, 'flame', { lifespan: 520, speedY: { min: -46, max: -20 }, speedX: { min: -8, max: 8 }, x: { min: -14, max: 14 }, scale: { start: 2, end: 0 }, blendMode: 'ADD', frequency: 22 }));
    this.embers = this.add2(this.add.particles(FX, GY - 20, 'spark', { lifespan: 800, speedY: { min: -40, max: -20 }, speedX: { min: -12, max: 12 }, scale: { start: 0.7, end: 0 }, blendMode: 'ADD', frequency: 180, tint: 0xffb347 }));
    this.fireplace = this.img(FX, GY + 1, 'ix_fireplace');
    this.armory = this.img(FX, GY + 1, 'ix_armory').setScale(0, 1);
    this.shot.bringToTop(this.cabinDog);                                 // the dog snoozes in front of the hearth
    const mantleY = GY + 1 - 98 + 18;
    this.grinder = this.img(FX + 46, mantleY, 'ix_grinder');
    for (let i = 0; i < 3; i++) this.img(FX - 40 + i * 12, mantleY, 'c_star', 0.5, 1).setScale(0.36).setTint(0xffd23f);     // his old medals
    const frame = this.img(FX, mantleY - 30, 'ix_frame', 0.5, 0.5);
    this.img(FX, mantleY - 25, 'bessie', 0.5, 1).setScale(0.28);
    this.tweens.add({ targets: frame, angle: { from: -1, to: 1 }, yoyo: true, repeat: -1, duration: 1500 });

    // the guns behind the wall
    this.guns = [['c_gun', FX - 24, GY - 36], ['c_gun2', FX + 24, GY - 36], ['c_gun3', FX, GY - 8]].map(([k, x, y]) => {
      const g = this.img(x, y, k, 0.5, 1).setScale(0, 1).setVisible(false);
      return g;
    });

    this.makeChris(-300, 1, 'spatula');
    this.walkSpeed = 90; this.walkTo = FX + 72;
    this.say('BACK AT THE CABIN, CHRIS STARES AT THE PHOTO OF HIS BEST FRIEND...');
    this.at(2300, () => { this.P.facing = -1; Sound.sfx('sigh'); this.bubble(this.cx, GY - 96, '*SIGH*', 1300); });
    this.at(3600, () => { this.say('...THEN GIVES THE OLD PEPPER GRINDER A TWIST.'); this.hop = true; this.P.vh = 210; Sound.sfx('jump'); });
    this.at(3950, () => {
      Sound.sfx('grind');
      this.tweens.add({ targets: this.grinder, angle: { from: -28, to: 28 }, yoyo: true, repeat: 4, duration: 110, onComplete: () => this.grinder.setAngle(0) });
    });
    this.at(5000, () => this.flipWall());
    this.at(7200, () => this.grabGun());
    this.at(11000, () => this.cut(this.shotLaunch));
  }

  flipWall() {
    const FX = this.fireplace.x;
    Sound.sfx('hiss'); this.at(250, () => Sound.sfx('clunk')); this.at(520, () => Sound.sfx('reveal'));
    this.shake(300, 0.007);
    this.dust(FX - 50, GY, 5, 'ix_dust', 6, 26); this.dust(FX + 50, GY, 5, 'ix_dust', 6, 26);
    this.say('THE FIREPLACE SPINS ROUND... TO REVEAL HIS OLD ARMOURY!');
    this.tweens.add({ targets: [this.fireplace, this.grinder], scaleX: 0, duration: 260, ease: 'Cubic.easeIn', onComplete: () => {
      this.fire.stop(); this.embers.stop();
      this.tweens.add({ targets: this.armory, scaleX: 1, duration: 300, ease: 'Cubic.easeOut' });
      this.guns.forEach((g, i) => { g.setVisible(true); this.tweens.add({ targets: g, scaleX: 1, duration: 300, delay: 60 + i * 40, ease: 'Cubic.easeOut' }); });
      this.flash(0.85, 450);
      const shine = this.img(FX, GY - 40, 'puff', 0.5, 0.5).setScale(2).setTint(0x39d0c8).setAlpha(0.3).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: shine, alpha: 0.12, scale: 2.4, yoyo: true, repeat: -1, duration: 700 });
      this.add2(this.add.particles(FX, GY - 40, 'spark', { lifespan: 900, speed: { min: 20, max: 60 }, x: { min: -46, max: 46 }, y: { min: -30, max: 30 }, scale: { start: 1, end: 0 }, blendMode: 'ADD', frequency: 90, tint: [0xffd23f, 0x39d0c8, 0xffffff] }));
    } });
  }

  grabGun() {
    const g = this.guns[0], to = this.handPoint(20, 0);
    this.say('TIME TO DUST OFF THE MAC-GRINDER 3000.');
    Sound.sfx('stretch');
    this.tweens.add({ targets: g, x: to.x, duration: 600, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: g, y: g.y - 26, duration: 300, yoyo: true, ease: 'Quad.easeOut', onComplete: () => {
      g.setVisible(false);
      this.rig.setWeapon(WEAPONS[0]); this.rig.auger.setVisible(true);
      this.P.power = 1; this.flash(0.6, 300);
      Sound.sfx('power'); this.shake(150, 0.005);
      this.dust(this.cx, GY - 40, 6, 'ix_dust', 16, 20);
      this.hop = true; this.P.vh = 300;                              // a triumphant hop, and the apron whips round into a CAPE
      this.rig.spinToCape(); Sound.sfx('swish'); this.at(300, () => Sound.sfx('swish')); this.at(600, () => { Sound.sfx('shine'); this.flash(0.4, 250); });
      this.say('OFF COMES THE APRON... ON GOES THE CAPE!');
      this.at(700, () => { this.P.power = 0; });
      this.at(900, () => {
        this.P.facing = 1;
        this.bubble(this.cx + 6, GY - 104, 'LET\'S GET MOOOVING!', 1800);
        for (let i = 0; i < 4; i++) this.at(i * 110, () => {                         // a quick test burst
          this.P.firing = 0.12; Sound.sfx('shoot');
          const m = this.handPoint(58, 0);
          const b = this.img(m.x, m.y, 'macaroni', 0.5, 0.5).setRotation(Math.random() * 6);
          this.tweens.add({ targets: b, x: m.x + 260, rotation: '+=8', duration: 500, onComplete: () => b.destroy() });
        });
      });
    } });
  }

  // ============================================================= SHOT 3: night launch
  shotLaunch() {
    Sound.music('stinger', 'title');
    this.chapter.setText('THAT NIGHT...');
    this.sky('ix_sky_night');
    this.twinkles(-360, 360, -300, 0);
    this.img(-150, -150, 'c_galaxy', 0.5, 0.5).setScale(0.6).setAlpha(0.7);
    const shipFar = this.img(240, -70, 'ratship', 0.5, 0.5).setScale(0.3);
    const beamFar = this.img(240, -66, 'beam0', 0.5, 0).setScale(0.3, 0.25).setAlpha(0.8);
    this.tweens.add({ targets: [shipFar, beamFar], x: 300, y: '-=30', duration: 6000 });
    this.tweens.add({ targets: shipFar, alpha: 0.4, yoyo: true, repeat: -1, duration: 300 });
    this.img(0, GY + 2, 'ix_hills_far').setTint(0x6a6aa0);
    this.img(0, GY + 4, 'ix_hills_mid').setTint(0x5a5a8a);
    this.img(-190, GY + 3, 'ix_cabin').setTint(0x8080b0);
    this.img(BX, GY + 2, 'ix_barn_x').setTint(0x8080b0);
    this.img(120, GY + 2, 'ix_tower').setTint(0x8080b0);
    this.img(112, GY + 2, 'ix_fence').setTint(0x7070a0);
    this.add2(this.add.particles(BX, GY - 80, 'ix_smoke', { lifespan: 2400, speedY: { min: -20, max: -10 }, scale: { start: 0.6, end: 1.4 }, alpha: { start: 0.6, end: 0 }, frequency: 220, tint: 0x9090c0 }));
    this.img(0, GY - 1, 'ix_ground', 0.5, 0).setTint(0x8a90c8);

    this.makeChris(-20, 1, 'gun');
    this.say('SO LUNA CHRIS STRAPS ON HIS JET BOOTS FOR ONE LAST MISSION...');
    const jets = [0, 1].map(() => this.add2(this.add.particles(0, 0, 'flame', { lifespan: 320, speedY: { min: 60, max: 140 }, speedX: { min: -16, max: 16 }, scale: { start: 2.2, end: 0 }, blendMode: 'ADD', frequency: 22, emitting: false })));
    this.acts.push(() => {
      if (!this.rig) return;
      const root = this.rig.root, sx = root.scaleX, sy = root.scaleY;
      jets[0].setPosition(root.x + (this.rig.bootF.x) * sx, root.y + 2 * sy);
      jets[1].setPosition(root.x + (this.rig.bootB.x) * sx, root.y + 2 * sy);
      if (this.P.h > 40) this.camY = Math.min(180, this.P.h - 40);          // follow him up into the stars
    });
    this.at(1300, () => { this.P.duck = true; Sound.sfx('stretch'); });
    this.at(1700, () => {
      this.P.duck = false; this.P.thrusting = true; this.hop = true; this.P.vh = 40; this.thrustAcc = 44;
      jets.forEach(j => j.start()); Sound.jet(true);
      this.dust(this.cx, GY, 10, 'ix_dust', 26, 14); this.shake(300, 0.006);
      this.walkSpeed = 24; this.walkTo = this.cx + 120;
    });
    this.at(3000, () => this.say('TIME TO GET BESSIE BACK!'));
    this.at(5200, () => {
      Sound.jet(false); Sound.sfx('shine');
      jets.forEach(j => j.stop());
      const p = this.rig ? { x: this.rig.root.x, y: Math.max(this.rig.root.y - 30, -84 - this.camY) } : { x: 0, y: -100 };
      if (this.rig) this.rig.root.setVisible(false);
      const st = this.img(p.x, p.y, 'c_star', 0.5, 0.5).setScale(0).setTint(0xfff1a0);
      this.tweens.add({ targets: st, scale: 0.8, angle: 180, yoyo: true, duration: 300 });
      const t = this.add.text(0, 0, 'LUNA CHRIS', { fontFamily: PIXEL, fontSize: '26px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 6 }).setOrigin(0.5).setResolution(Math.max(2, Math.ceil(this.s))).setScale(0);
      const sub = this.add.text(0, 22, 'MISSION: RESCUE BESSIE', { fontFamily: PIXEL, fontSize: '8px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 3 }).setOrigin(0.5).setResolution(Math.max(2, Math.ceil(this.s))).setAlpha(0);
      const logo = this.add.container(0, -20, [t, sub]);
      this.stage.add(logo);
      this.tweens.add({ targets: t, scale: 1, duration: 500, delay: 250, ease: 'Back.easeOut' });
      this.tweens.add({ targets: sub, alpha: 1, duration: 400, delay: 700 });
    });
    this.at(8200, () => this.leave());
  }

  leave() {
    if (this.leaving) return;
    this.leaving = true;
    Sound.jet(false); Sound.music(null);
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.time.delayedCall(380, () => this.scene.start('menu'));
  }
}
