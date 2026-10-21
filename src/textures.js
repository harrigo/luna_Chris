// Placeholder art, drawn with code so no asset files are needed.
// Swap any of these for real images later by loading them under the same keys.

// Retro pixel font (Google Fonts "Press Start 2P", loaded in index.html; falls back to monospace offline).
const PIXEL = '"Press Start 2P", monospace';

function makeTextures(scene) {
  if (scene.textures.exists('chris')) return;

  const mk = (key, w, h, draw) => {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  };

  mk('bgstar', 3, 3, g => { g.fillStyle(0xffffff, 1).fillRect(0, 0, 3, 3); });

  // Luna Chris: bulky NASA suit, "Kiss the Cook" apron, Mac-Laster 3000. Faces right.
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
    g.fillStyle(0xff8c1a, 1).fillRoundedRect(34, 22, 16, 9, 3);            // Mac-Laster body
    g.fillStyle(0x7a3b00, 1).fillRect(40, 24, 3, 5);                       // extruder
    g.fillStyle(0xffc36a, 1).fillRect(48, 24, 4, 5);                       // muzzle
  });

  // Space-mouse in junk armour. Faces right.
  // ---- pixel-art rats: shapes painted onto a pixel grid, shaded in 3 tones (lit from top-left), then auto-outlined
  const pixSprite = (key, w, h, paint) => {
    const grid = new Array(w * h).fill(-1);
    const shade = (tones, nx, ny) => { const l = -0.6 * nx - 0.8 * ny; return l > 0.3 ? tones[0] : (l < -0.35 ? tones[2] : tones[1]); };
    const api = {
      ell(cx, cy, rx, ry, tones) { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry; if (nx * nx + ny * ny <= 1 && x >= 0 && y >= 0 && x < w && y < h) grid[y * w + x] = Array.isArray(tones) ? shade(tones, nx, ny) : tones; } },
      rect(x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (x >= 0 && y >= 0 && x < w && y < h) grid[y * w + x] = c; },
      px(x, y, c) { if (x >= 0 && y >= 0 && x < w && y < h) grid[y * w + x] = c; },
      line(pts, c) { for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let k = 0; k <= n; k++) api.px(Math.round(x0 + (x1 - x0) * k / n), Math.round(y0 + (y1 - y0) * k / n), c); } }
    };
    paint(api);
    const tex = scene.textures.createCanvas(key, w, h), ctx = tex.getContext(), img = ctx.createImageData(w, h), D = img.data;
    const OUTL = 0x1a1020, at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? -1 : grid[y * w + x];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let c = grid[y * w + x];
      if (c < 0) { if (at(x - 1, y) >= 0 || at(x + 1, y) >= 0 || at(x, y - 1) >= 0 || at(x, y + 1) >= 0) c = OUTL; else continue; }
      const i = (y * w + x) * 4; D[i] = (c >> 16) & 255; D[i + 1] = (c >> 8) & 255; D[i + 2] = c & 255; D[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0); tex.refresh();
  };
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
  pixSprite('mouse', 34, 24, a => rat(a, 0, 0, false));
  // Jetpack space-mouse (flies). Faces right.
  pixSprite('flyer', 38, 36, a => {
    a.ell(11, 31, 2.5, 4.5, [0xffe27a, 0xff9a2a, 0xff5a1a]);                                          // jet flame
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
  mk('golem', 60, 64, g => {
    g.fillStyle(0xffc83d, 1).fillRoundedRect(4, 6, 52, 56, 8);
    g.fillStyle(0xe3a21a, 1).fillCircle(14, 16, 6).fillCircle(46, 14, 4).fillCircle(48, 46, 7).fillCircle(16, 50, 5);
    g.fillStyle(0xffffff, 1).fillCircle(22, 28, 7).fillCircle(40, 28, 7);
    g.fillStyle(0x222222, 1).fillCircle(23, 29, 3).fillCircle(39, 29, 3);
    g.lineStyle(3, 0x7a4a00, 1).lineBetween(14, 20, 27, 25).lineBetween(48, 20, 35, 25);  // angry brows
    g.fillStyle(0x7a4a00, 1).fillRoundedRect(20, 42, 22, 8, 3);            // mouth
    g.fillStyle(0xb8800f, 1).fillRect(10, 58, 14, 6).fillRect(36, 58, 14, 6);
  });

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

  // Mac-Laster macaroni shell
  mk('macaroni', 16, 9, g => {
    g.fillStyle(0xff9a1f, 1).fillEllipse(8, 4.5, 16, 9);
    g.lineStyle(1.5, 0xb84e00, 1).strokeEllipse(8, 4.5, 9, 4);
  });

  // Crusty Croque Monsieur drop-ship
  mk('croque', 160, 96, g => {
    g.fillStyle(0xff6b1a, 1).fillTriangle(38, 74, 58, 74, 48, 94).fillTriangle(102, 74, 122, 74, 112, 94); // thrusters
    g.fillStyle(0xd9a04f, 1).fillRoundedRect(10, 52, 140, 22, 10);        // bottom bread
    g.fillStyle(0xffd23f, 1).fillRect(14, 45, 132, 8).fillTriangle(30, 53, 44, 53, 37, 64).fillTriangle(100, 53, 116, 53, 108, 66); // cheese drips
    g.fillStyle(0xff8fa3, 1).fillRoundedRect(6, 36, 148, 11, 5);          // ham
    g.fillStyle(0xd9a04f, 1).fillRoundedRect(14, 12, 132, 28, 12);        // top bread
    g.lineStyle(3, 0x8a5a1f, 1).lineBetween(30, 18, 50, 36).lineBetween(70, 16, 90, 36).lineBetween(112, 18, 132, 36); // toast marks
    g.fillStyle(0x7fd3ff, 1).fillCircle(80, 18, 15);                       // cockpit
    g.fillStyle(0x9aa3b2, 1).fillCircle(80, 21, 8).fillCircle(73, 13, 4).fillCircle(87, 13, 4); // rat pilot
    g.fillStyle(0x111111, 1).fillCircle(77, 20, 1.6).fillCircle(83, 20, 1.6);
    g.fillStyle(0x8b5a2b, 1).fillRect(24, 56, 16, 8).fillRect(118, 58, 14, 7);   // rust patches
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

  // Mac-Laster drill-bit / pasta-auger: 4 frames of a spinning spiral screw (frames cycle to look like it's grinding)
  for (let f = 0; f < 4; f++) {
    mk('auger' + f, 30, 18, g => {
      const hh = x => 7.5 * (1 - x / 32) + 1.5;                   // half-height at x: tapers to the tip
      g.fillStyle(0xb7bfcc, 1).fillTriangle(0, 9 - 8.5, 0, 9 + 8.5, 30, 9);
      g.lineStyle(3, 0x4a5163, 1);
      for (let i = -1; i < 5; i++) {
        const x = i * 7.5 + f * 1.9;
        if (x < 0 || x > 27) continue;
        g.lineBetween(x, 9 - hh(x), x + 4, 9 + hh(x + 4));        // slanted thread: shifts each frame
      }
      g.lineStyle(2, 0x2d3345, 1).strokeTriangle(0, 0.5, 0, 17.5, 30, 9);
      g.fillStyle(0xff8c1a, 1).fillRect(0, 2, 3, 14);              // collar
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
