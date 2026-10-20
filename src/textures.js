// Placeholder art, drawn with code so no asset files are needed.
// Swap any of these for real images later by loading them under the same keys.

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
    g.fillStyle(0xb8c2d3, 1).fillRoundedRect(1, 18, 9, 20, 3);            // backpack
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
  mk('mouse', 34, 24, g => {
    g.lineStyle(2, 0xd9a5b3, 1).lineBetween(5, 17, 0, 10);                 // tail
    g.fillStyle(0x9aa3b2, 1).fillEllipse(16, 15, 24, 14);                  // body
    g.fillStyle(0x8b5a2b, 1).fillRect(8, 9, 10, 6);                        // armour plate
    g.fillStyle(0x9aa3b2, 1).fillCircle(27, 13, 7);                        // head
    g.fillStyle(0xf4a6b8, 1).fillCircle(25, 6, 4).fillCircle(33, 14, 2);   // ear, nose
    g.fillStyle(0x111111, 1).fillCircle(28, 11, 1.6);                      // eye
    g.fillStyle(0x555b6e, 1).fillRect(10, 20, 4, 4).fillRect(20, 20, 4, 4);// feet
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

  mk('crater', 70, 16, g => {
    g.fillStyle(0xc99a2a, 1).fillEllipse(35, 8, 70, 16);
    g.fillStyle(0xb5851c, 1).fillEllipse(35, 9, 56, 11);
  });

  mk('hole', 40, 40, g => {
    g.fillStyle(0xe0b73c, 1).fillCircle(20, 20, 20);
    g.fillStyle(0xcfa22f, 1).fillCircle(22, 22, 15);
  });
}
