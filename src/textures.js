// Placeholder art, drawn with code so no asset files are needed.
// Swap any of these for real images later by loading them under the same keys.

// Retro pixel font (Google Fonts "Press Start 2P", loaded in index.html; falls back to monospace offline).
const PIXEL = '"Press Start 2P", monospace';

// ---- pixel-sprite painter (shared): paint simple shapes onto a pixel grid, shade each in 3 tones
// (lit from the top-left), then add a dark outline automatically. Used for all the 16-bit enemies.
function pixSprite(scene, key, w, h, paint, outline) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const grid = new Array(w * h).fill(-1);
  const shade = (tones, nx, ny) => { const l = -0.6 * nx - 0.8 * ny; return l > 0.3 ? tones[0] : (l < -0.35 ? tones[2] : tones[1]); };
  const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < w && y < h) grid[y * w + x] = c; };
  const api = {
    ell(cx, cy, rx, ry, tones) { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry; if (nx * nx + ny * ny <= 1) set(x, y, Array.isArray(tones) ? shade(tones, nx, ny) : tones); } },
    rect(x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c); },
    rrect(x0, y0, x1, y1, r, tones) {
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, hw = (x1 - x0) / 2, hh = (y1 - y0) / 2;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const qx = Math.max(0, Math.abs(x + 0.5 - cx) - (hw - r)), qy = Math.max(0, Math.abs(y + 0.5 - cy) - (hh - r));
        if (qx * qx + qy * qy > r * r) continue;
        set(x, y, Array.isArray(tones) ? shade(tones, (x + 0.5 - cx) / hw, (y + 0.5 - cy) / hh) : tones);
      } },
    poly(pts, tones) {
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, hw = Math.max(1, (x1 - x0) / 2), hh = Math.max(1, (y1 - y0) / 2);
      for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
        const px = x + 0.5, py = y + 0.5; let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside; }
        if (inside) set(x, y, Array.isArray(tones) ? shade(tones, (px - cx) / hw, (py - cy) / hh) : tones);
      } },
    px(x, y, c) { set(x | 0, y | 0, c); },
    line(pts, c, th) {
      th = th || 1;
      for (let i = 0; i < pts.length - 1; i++) { const [xa, ya] = pts[i], [xb, yb] = pts[i + 1], n = Math.max(1, Math.round(Math.max(Math.abs(xb - xa), Math.abs(yb - ya))));
        for (let k = 0; k <= n; k++) { const x = Math.round(xa + (xb - xa) * k / n), y = Math.round(ya + (yb - ya) * k / n); for (let dy = 0; dy < th; dy++) for (let dx = 0; dx < th; dx++) set(x + dx - (th >> 1), y + dy - (th >> 1), c); } } }
  };
  paint(api);
  const OUTL = 0x1a1020;
  for (let pass = 0; pass < (outline || 1); pass++) {
    const src = grid.slice(), at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? -1 : src[y * w + x];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (src[y * w + x] < 0 && (at(x - 1, y) >= 0 || at(x + 1, y) >= 0 || at(x, y - 1) >= 0 || at(x, y + 1) >= 0)) grid[y * w + x] = OUTL;
  }
  const tex = scene.textures.createCanvas(key, w, h), ctx = tex.getContext(), img = ctx.createImageData(w, h), D = img.data;
  for (let i = 0; i < w * h; i++) { const c = grid[i]; if (c < 0) continue; D[i * 4] = (c >> 16) & 255; D[i * 4 + 1] = (c >> 8) & 255; D[i * 4 + 2] = c & 255; D[i * 4 + 3] = 255; }
  ctx.putImageData(img, 0, 0); tex.refresh();
}
const OUTPX = 0x1a1020;

function makeTextures(scene) {
  if (scene.textures.exists('chris')) return;

  const mk = (key, w, h, draw) => {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  };

  mk('bgstar', 3, 3, g => { g.fillStyle(0xffffff, 1).fillRect(0, 0, 3, 3); });

  // Luna Chris: bulky NASA suit, "Kiss the Cook" apron, Mac-Grinder 3000. Faces right.
  mk('chris', 54, 60, g => {
    g.fillStyle(0xd9503a, 1).fillRoundedRect(0, 15, 5, 22, 2).fillRoundedRect(5, 15, 5, 22, 2); // jetpack tanks
    g.fillStyle(0x555b6e, 1).fillRect(0.5, 37, 4, 4).fillRect(5.5, 37, 4, 4);                  // jet nozzles
    g.fillStyle(0xdfe6f0, 1).fillRoundedRect(10, 36, 24, 20, 5);           // suit legs
    g.fillStyle(0xd62828, 1).fillRoundedRect(12, 38, 20, 16, 3);           // apron
    g.fillStyle(0xffffff, 1).fillRect(16, 43, 12, 2).fillRect(16, 47, 12, 2); // "KISS THE COOK"
    g.fillStyle(0x555b6e, 1).fillRoundedRect(9, 54, 12, 6, 2).fillRoundedRect(23, 54, 12, 6, 2); // boots
    g.fillStyle(0xeef2f8, 1).fillRoundedRect(7, 16, 30, 24, 6);            // torso
    g.fillStyle(0x1d4ed8, 1).fillCircle(14, 25, 3.5);                      // mission patch
    g.fillStyle(0xffffff, 1).fillCircle(24, 12, 12);                       // helmet
    g.fillStyle(0x1b2b4a, 1).fillEllipse(29, 12, 14, 10);                  // visor
    g.fillStyle(0x6fa8ff, 1).fillEllipse(31, 10, 5, 3);                    // visor glint
    g.fillStyle(0xeef2f8, 1).fillRoundedRect(24, 24, 14, 6, 3);            // arm
    g.fillStyle(0xff8c1a, 1).fillRoundedRect(34, 22, 16, 9, 3);            // Mac-Grinder body
    g.fillStyle(0x7a3b00, 1).fillRect(40, 24, 3, 5);                       // extruder
    g.fillStyle(0xffc36a, 1).fillRect(48, 24, 4, 5);                       // muzzle
  });

  // Space-mouse in junk armour. Faces right.
  const FUR = [0xb4b8cc, 0x868ca6, 0x5a5e78], ARM = [0xd08a4a, 0x9a5a2a, 0x6a3a1a], STEEL = [0xeaf2ff, 0x8eaad6, 0x56709e], PINK = 0xf49ab0, DPINK = 0xc0607a;
  const rat = (a, ox, oy, goggles) => {
    a.line([[ox + 9, oy + 16], [ox + 5, oy + 15], [ox + 2, oy + 12], [ox + 1, oy + 9]], DPINK);       // tail
    a.ell(ox + 24, oy + 7, 3, 3, PINK); a.px(ox + 24, oy + 7, DPINK);                                    // ear
    a.ell(ox + 16, oy + 15, 9, 6, FUR);                                                               // body
    a.ell(ox + 14, oy + 11.5, 6.5, 3.6, ARM);                                                         // armour shell
    a.px(ox + 11, oy + 11, 0xf0c080); a.px(ox + 15, oy + 10, 0xf0c080);                                // rivets
    a.ell(ox + 26, oy + 13, 6, 5, FUR);                                                               // head
    a.ell(ox + 30.5, oy + 15, 2.6, 2, FUR);                                                           // snout
    a.ell(ox + 25.5, oy + 9.5, 5, 2.4, STEEL);                                                        // helmet
    a.px(ox + 33, oy + 14, PINK);                                                                     // nose
    if (goggles) { a.ell(ox + 28, oy + 12, 2.4, 2.2, 0x6ad8ff); a.px(ox + 28, oy + 12, 0xff3030); a.px(ox + 27, oy + 11, 0xffffff); }
    else { a.rect(ox + 27, oy + 11, ox + 28, oy + 12, 0xffffff); a.px(ox + 28, oy + 12, 0xff2020); } // mean red eye
    a.px(ox + 31, oy + 17, 0xffffff); a.px(ox + 30, oy + 17, 0xffffff);                                // buck teeth
    a.rect(ox + 11, oy + 20, ox + 13, oy + 21, 0x4a4e62); a.rect(ox + 19, oy + 20, ox + 21, oy + 21, 0x4a4e62);   // feet
  };
  // Space-mouse: walks the surface. Faces right; feet at y=22 (origin oy 22/24).
  pixSprite(scene, 'mouse', 34, 24, a => rat(a, 0, 0, false));
  // animated jet flame for the flying rats: 3 flickering frames (origin at the top)
  [[6, 2.6], [8, 3], [5, 2.2]].forEach(([len, wd], i) => pixSprite(scene, 'ratjet' + i, 9, 13, a => {
    a.poly([[4.5 - wd, 0], [4.5 + wd, 0], [4.5 + (i === 1 ? 1 : -1), len + 4]], [0xffb24a, 0xff7a1a, 0xd8401a]);
    a.poly([[4.5 - wd * 0.5, 0], [4.5 + wd * 0.5, 0], [4.5, len]], 0xffe27a);
    a.px(4, 0, 0xffffff);
  }));
  // Jetpack space-mouse (flies). Faces right.
  pixSprite(scene, 'flyer', 38, 36, a => {
    a.rect(7, 13, 14, 25, 0x9a2a1a); a.rect(8, 13, 13, 24, 0xd9503a); a.rect(8, 14, 9, 22, 0xff8a6a); // jet tank
    rat(a, 3, 1, true);
  });

  // Bessie, the zero-gravity cow. Faces right. Origin at her hooves.
  mk('bessie', 64, 46, g => {
    g.fillStyle(0xf4f0e6, 1).fillRoundedRect(8, 8, 40, 24, 10);             // body
    g.fillStyle(0x2b2b33, 1).fillCircle(20, 16, 6).fillCircle(34, 22, 5).fillCircle(40, 12, 4);  // patches
    g.fillStyle(0xf4a6b8, 1).fillRoundedRect(22, 30, 14, 7, 3);             // udder
    g.fillStyle(0xf4f0e6, 1).fillRoundedRect(12, 30, 6, 14, 2).fillRoundedRect(38, 30, 6, 14, 2);   // legs
    g.fillStyle(0x2b2b33, 1).fillRect(12, 42, 6, 3).fillRect(38, 42, 6, 3); // hooves
    g.lineStyle(2, 0x2b2b33, 1).lineBetween(8, 14, 2, 22);                  // tail
    g.fillStyle(0xf4f0e6, 1).fillRoundedRect(44, 6, 18, 18, 6);             // head
    g.fillStyle(0xf4a6b8, 1).fillRoundedRect(52, 14, 11, 10, 4);            // snout
    g.fillStyle(0x111111, 1).fillCircle(50, 12, 1.8);                       // eye
    g.fillStyle(0xd8c07a, 1).fillTriangle(46, 7, 44, 0, 50, 6).fillTriangle(58, 7, 60, 0, 54, 6);   // horns
    g.fillStyle(0x7ad7ff, 0.35).fillCircle(52, 14, 16);                     // little space-helmet bubble
  });

  // Rodent rescue-snatcher ship (small, seen at the start of a level).
  mk('ratship', 84, 40, g => {
    g.fillStyle(0x6f7a8c, 1).fillEllipse(42, 28, 82, 20);                   // saucer
    g.fillStyle(0x8b5a2b, 1).fillRect(10, 26, 10, 4).fillRect(60, 24, 12, 5);  // junk plates
    g.fillStyle(0x7ad7ff, 0.9).fillEllipse(42, 16, 28, 20);                 // dome
    g.fillStyle(0x9aa3b2, 1).fillCircle(42, 18, 7);                         // rat pilot
    g.fillStyle(0xf4a6b8, 1).fillCircle(37, 11, 3).fillCircle(47, 11, 3);
    g.fillStyle(0xff8c1a, 1).fillCircle(20, 34, 3).fillCircle(42, 36, 3).fillCircle(64, 34, 3);   // lights
  });

  // Gouda-Golem
  // Gouda-Golem: a walking block of cheese with holes and a furious face
  pixSprite(scene, 'golem', 60, 64, a => {
    const CH = [0xffe896, 0xffc83d, 0xd9961a];
    a.rect(10, 56, 23, 63, 0x9a6a0c); a.rect(36, 56, 49, 63, 0x9a6a0c); a.rect(10, 56, 23, 57, 0xc48a1a); a.rect(36, 56, 49, 57, 0xc48a1a);   // stubby feet
    a.rrect(4, 5, 55, 59, 7, CH);
    for (const [x, y, r] of [[14, 15, 5], [46, 13, 3.5], [48, 46, 6], [15, 49, 4.5], [32, 55, 2.5], [7, 32, 2.5]]) { a.ell(x, y, r, r, 0xb8800f); a.ell(x - 0.6, y - 0.8, r * 0.7, r * 0.6, 0x8a5a08); }
    for (const [x, y] of [[26, 12], [38, 52], [52, 30], [9, 40]]) a.px(x, y, 0xfff4c4);
    a.ell(22, 28, 7, 7, 0xffffff); a.ell(39, 28, 7, 7, 0xffffff);
    a.rect(22, 27, 25, 31, OUTPX); a.rect(36, 27, 39, 31, OUTPX); a.px(23, 28, 0xffffff); a.px(37, 28, 0xffffff);
    a.line([[13, 18], [27, 24]], 0x6a3a00, 3); a.line([[47, 18], [33, 24]], 0x6a3a00, 3);              // angry brows
    a.rrect(19, 41, 42, 50, 3, 0x6a3a00); a.rect(22, 41, 25, 44, 0xffffff); a.rect(30, 41, 33, 44, 0xffffff); a.rect(36, 47, 39, 50, 0xffffff);   // jagged teeth
  }, 1);

  mk('cube', 14, 14, g => {
    g.fillStyle(0xffd23f, 1).fillRoundedRect(0, 0, 14, 14, 3);
    g.fillStyle(0xe3a21a, 1).fillCircle(4, 4, 2).fillCircle(10, 9, 2.5);
  });

  mk('ham', 28, 16, g => {
    g.fillStyle(0xff8fa3, 1).fillRoundedRect(0, 0, 28, 16, 6);
    g.fillStyle(0xffd1d9, 1).fillRoundedRect(2, 2, 24, 4, 2);
    g.fillStyle(0xd9566f, 1).fillRect(6, 9, 16, 3);
  });

  mk('crumb', 10, 10, g => { g.fillStyle(0xe0a548, 1).fillCircle(5, 5, 5); g.fillStyle(0x8a5a1f, 1).fillCircle(4, 4, 1.6); });
  mk('flame', 9, 9, g => { g.fillStyle(0xff7a1a, 1).fillCircle(4.5, 4.5, 4.5); g.fillStyle(0xffe27a, 1).fillCircle(4.5, 4.5, 2.2); });
  mk('spark', 6, 6, g => { g.fillStyle(0xffe27a, 1).fillCircle(3, 3, 3); });

  // Mac-Grinder macaroni shell
  mk('macaroni', 16, 9, g => {
    g.fillStyle(0xff9a1f, 1).fillEllipse(8, 4.5, 16, 9);
    g.lineStyle(1.5, 0xb84e00, 1).strokeEllipse(8, 4.5, 9, 4);
  });

  // Crusty Croque Monsieur drop-ship: a flying cheeseburger with cannons on both sides and a turret underneath
  pixSprite(scene, 'croque', 160, 96, a => {
    const BREAD = [0xf0c070, 0xd9a04f, 0x9a6a2a], STL = [0xdfe6f0, 0x8c98ab, 0x4a5262];
    a.poly([[38, 72], [56, 72], [47, 92]], [0xffe27a, 0xff8a1a, 0xd04a10]); a.poly([[104, 72], [122, 72], [113, 92]], [0xffe27a, 0xff8a1a, 0xd04a10]);   // thrusters
    a.rrect(70, 70, 90, 84, 4, STL); a.rect(76, 84, 84, 93, 0x4a5262); a.rect(77, 84, 83, 92, 0x8c98ab); a.rect(76, 92, 84, 93, 0x1a1020);   // belly turret
    a.rrect(0, 50, 16, 62, 3, STL); a.rect(0, 52, 3, 60, 0x1a1020); a.rect(5, 50, 6, 62, 0x4a5262);                                // left cannon
    a.rrect(144, 50, 160, 62, 3, STL); a.rect(157, 52, 160, 60, 0x1a1020); a.rect(154, 50, 155, 62, 0x4a5262);                      // right cannon
    a.rrect(12, 56, 148, 74, 9, BREAD);                                                                         // bottom bun
    a.px(30, 64, 0x8b5a2b); a.px(31, 64, 0x8b5a2b); a.px(124, 66, 0x8b5a2b);                                     // scorch
    for (let x = 12; x < 148; x += 8) a.poly([[x, 56], [x + 4, 51], [x + 8, 56], [x + 4, 59]], [0x9aff6a, 0x4fcf4a, 0x2a8a2a]);   // lettuce frill
    a.rrect(10, 42, 150, 56, 6, [0x9a5a2a, 0x6a3a1a, 0x3a200c]);                                               // the beef patty
    for (let y = 44; y < 55; y++) for (let x = 12; x < 148; x++) if (((x * 7 + y * 13) % 11) === 0) a.px(x, y, 0x4a2a10);   // dithered char texture
    for (const x of [30, 58, 86, 114]) a.line([[x, 46], [x + 10, 52]], 0x2a1608, 2);                            // grill marks
    a.poly([[8, 36], [152, 36], [152, 44], [128, 44], [122, 54], [116, 44], [84, 44], [78, 58], [72, 44], [42, 44], [36, 52], [30, 44], [8, 44]], [0xfff09a, 0xffd23f, 0xd9a51a]);   // melting cheese slice
    a.rect(10, 37, 150, 37, 0xfff8c0);
    a.rrect(14, 11, 145, 39, 11, BREAD);                                                                        // top bun
    for (const [x, y] of [[30, 16], [44, 22], [60, 15], [104, 16], [118, 23], [132, 15]]) { a.rect(x, y, x + 2, y + 1, 0xfff4d8); }   // sesame seeds
    a.ell(80, 18, 15, 15, [0xd8f4ff, 0x7fd3ff, 0x3a8ac0]);                                                    // cockpit
    a.ell(73, 13, 4, 4, 0xf49ab0); a.ell(87, 13, 4, 4, 0xf49ab0);
    a.ell(80, 21, 8, 7, [0xc4c8da, 0x868ca6, 0x5a5e78]);                                                      // rat pilot
    a.rect(76, 19, 77, 21, 0xff2020); a.rect(83, 19, 84, 21, 0xff2020); a.rect(79, 25, 81, 26, 0xffffff);
    a.line([[69, 9], [75, 6]], 0xffffff, 2);                                                                     // glass glint
    // armour: riveted steel plates bolted over the top slice + a cage over the cockpit (stomp-proof)
    const ARM = [0xeef2f8, 0xa8b0bc, 0x5a6272];
    a.poly([[16, 20], [20, 9], [62, 7], [64, 20]], ARM); a.poly([[96, 20], [98, 7], [140, 9], [144, 20]], ARM);
    a.rect(16, 19, 64, 21, 0x3b4252); a.rect(96, 19, 144, 21, 0x3b4252);
    for (const x of [24, 36, 48, 58, 102, 114, 126, 138]) { a.px(x, 12, 0x3b4252); a.px(x, 16, 0x3b4252); a.px(x - 1, 11, 0xffffff); }   // rivets
    for (const [x0, x1] of [[20, 62], [98, 140]]) for (let x = x0; x <= x1; x += 6) a.poly([[x, 8], [x + 3, 3], [x + 6, 8]], ARM);   // stubby ridge
    a.line([[66, 18], [70, 6], [80, 2], [90, 6], [94, 18]], 0x5a6272, 2);                                         // cockpit cage
    a.line([[80, 2], [80, 33]], 0x5a6272, 2); a.line([[67, 12], [93, 12]], 0x5a6272, 1);
  }, 2);

  // the burger boss's cannon shot: a sizzling meatball
  pixSprite(scene, 'meatball', 14, 14, a => {
    a.ell(7, 7, 6, 6, [0xb06a3a, 0x7a3a1a, 0x4a200c]);
    a.px(5, 5, 0xd08a5a); a.px(8, 9, 0x3a1808); a.px(4, 9, 0x3a1808); a.px(9, 4, 0xffc070);
  });
  mk('wedge', 22, 18, g => {
    g.fillStyle(0xffd23f, 1).fillTriangle(0, 17, 22, 17, 22, 2);
    g.fillStyle(0xe3a21a, 1).fillCircle(15, 12, 2.5).fillCircle(9, 15, 1.5);
  });

  // Parmesan Power-Up: a glowing wedge of parmesan with a sparkle
  mk('power', 30, 30, g => {
    g.fillStyle(0xfff3a0, 0.28).fillCircle(15, 15, 15);
    g.fillStyle(0xf6e27a, 1).fillRoundedRect(4, 10, 22, 14, 3);
    g.fillStyle(0xe8cb4f, 1).fillRect(4, 18, 22, 6);
    g.fillStyle(0xc99a2a, 1).fillCircle(10, 16, 1.8).fillCircle(18, 21, 1.8).fillCircle(22, 14, 1.4);
    g.fillStyle(0xffffff, 1).fillTriangle(15, 0, 17, 7, 13, 7).fillTriangle(15, 14, 17, 7, 13, 7);   // sparkle
    g.lineStyle(2, 0x7a5a00, 1).strokeRoundedRect(4, 10, 22, 14, 3);
  });

  // Cheeseburger: the end-of-level bonus heart
  mk('burger', 34, 30, g => {
    g.fillStyle(0xe0a458, 1).fillRoundedRect(2, 2, 30, 12, 6);               // top bun
    g.fillStyle(0xfff3c4, 1).fillRect(10, 5, 2, 2).fillRect(18, 4, 2, 2).fillRect(24, 7, 2, 2);   // sesame
    g.fillStyle(0x59b34a, 1).fillRoundedRect(1, 13, 32, 4, 2);               // lettuce
    g.fillStyle(0xffd23f, 1).fillTriangle(1, 16, 33, 16, 17, 24);            // melting cheese
    g.fillStyle(0x7a3b12, 1).fillRoundedRect(3, 16, 28, 6, 3);               // patty
    g.fillStyle(0xe0a458, 1).fillRoundedRect(2, 22, 30, 7, 4);               // bottom bun
    g.lineStyle(2, 0x5a3a12, 1).strokeRoundedRect(2, 2, 30, 12, 6).strokeRoundedRect(2, 22, 30, 7, 4);
  });

  // Mac-Grinder drill-bit: 4 pixel frames of a spinning spiral screw (the threads shift each frame)
  for (let f = 0; f < 4; f++) {
    pixSprite(scene, 'auger' + f, 24, 16, a => {
      a.rect(0, 2, 2, 13, 0xd9631a); a.rect(0, 2, 2, 3, 0xffa04a);                                  // orange collar
      a.poly([[3, 1.5], [23.5, 8], [3, 14.5]], [0xf2f6fc, 0xb7bfcc, 0x7a8698]);                    // steel cone
      for (let i = -1; i < 5; i++) {                                                               // slanted threads
        const x = 3 + i * 5 + f * 1.25, hh = t => 6.5 * (1 - (t - 3) / 21) + 0.5;
        if (x < 3 || x > 20) continue;
        a.line([[x, 8 - hh(x)], [x + 3, 8 + hh(x + 3)]], 0x4a5163);
      }
      a.px(5, 4, 0xffffff); a.px(6, 4, 0xffffff);                                                  // glint
    });
  }

  // soft round glow, tinted at runtime: used for the milky-way dust bands
  mk('blob', 96, 96, g => { for (let i = 0; i < 12; i++) g.fillStyle(0xffffff, 0.07).fillCircle(48, 48, 48 - i * 3.8); });

  mk('crater', 70, 16, g => {
    g.fillStyle(0xc99a2a, 1).fillEllipse(35, 8, 70, 16);
    g.fillStyle(0xb5851c, 1).fillEllipse(35, 9, 56, 11);
  });

  mk('hole', 40, 40, g => {
    g.fillStyle(0xe0b73c, 1).fillCircle(20, 20, 20);
    g.fillStyle(0xcfa22f, 1).fillCircle(22, 22, 15);
  });
}
