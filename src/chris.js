// Luna Chris, the character rig: a chubby chef-astronaut built from separate parts that animate in code.
//
//   - waddle: legs swing and lift alternately while the whole body rolls side to side
//   - belly pokes out of the too-small suit; the "Kiss the Cook" apron covers the front
//   - jump: the apron spins edge-on and turns into a cape that streams behind him (and spins back on landing)
//   - chef's-hat helmet (a toque on a glass bubble) that lags behind the body and bounces
//   - gun arm recoils, the drill-bit auger spins, back arm swings, squash and stretch on landing / take-off
//
// Everything is drawn with code (outlined EWJ-ish look). Swap any texture for real art under the same key later.
// Local units: feet at (0,0), +x = the way he faces, -y = up. The whole rig is scaled by RIG_SCALE.

const RIG_SCALE = 0.78;

function makeChrisTextures(scene) {
  if (scene.textures.exists('c_head')) return;
  const OUT = 0x1a1020;
  const mk = (key, w, h, draw) => {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  };
  const rr = (g, x, y, w, h, r, fill, lw) => { g.fillStyle(fill, 1).fillRoundedRect(x, y, w, h, r); g.lineStyle(lw || 2, OUT, 1).strokeRoundedRect(x, y, w, h, r); };
  const el = (g, x, y, w, h, fill, lw) => { g.fillStyle(fill, 1).fillEllipse(x, y, w, h); g.lineStyle(lw || 2, OUT, 1).strokeEllipse(x, y, w, h); };
  const ci = (g, x, y, r, fill, lw) => { g.fillStyle(fill, 1).fillCircle(x, y, r); g.lineStyle(lw || 2, OUT, 1).strokeCircle(x, y, r); };

  mk('blank', 2, 2, () => {});

  mk('c_boot', 24, 13, g => {
    rr(g, 1, 1, 22, 11, 5, 0x3b4252);
    g.fillStyle(0xd9d9e0, 1).fillRect(3, 9, 18, 2);
  });
  mk('c_leg', 16, 14, g => {                                          // chunky suit legs
    rr(g, 1, 0, 14, 14, 5, 0xdfe6f0);
    g.lineStyle(2, 0xb9c3d6, 1).lineBetween(3, 9, 13, 9);             // knee crease
  });

  // suit torso with the belly hanging out the bottom
  mk('c_body', 44, 42, g => {
    rr(g, 5, 1, 34, 24, 11, 0xeef2f8);                                // too-small suit
    ci(g, 14, 11, 4, 0x1d4ed8, 2);                                    // mission patch
    el(g, 22, 29, 38, 25, 0xf6bfa3);                                  // the belly: hangs out in front of the suit
    g.fillStyle(0xffd9c4, 1).fillEllipse(17, 24, 12, 6);              // belly highlight
    g.lineStyle(2, 0xc9806a, 1).beginPath().arc(22, 31, 3, 0.4, Math.PI - 0.4, false).strokePath();   // belly button
    g.lineStyle(3, 0xb9c3d6, 1).lineBetween(7, 22, 15, 24).lineBetween(37, 22, 29, 24);              // suit straining at the seams
  });
  // the apron: "KISS THE COOK"
  mk('c_apron', 28, 38, g => {
    g.fillStyle(0xd62828, 1).fillPoints([{ x: 8, y: 1 }, { x: 20, y: 1 }, { x: 24, y: 12 }, { x: 27, y: 35 }, { x: 1, y: 35 }, { x: 4, y: 12 }], true);
    g.lineStyle(2, OUT, 1).strokePoints([{ x: 8, y: 1 }, { x: 20, y: 1 }, { x: 24, y: 12 }, { x: 27, y: 35 }, { x: 1, y: 35 }, { x: 4, y: 12 }], true);
    g.fillStyle(0xffffff, 1).fillRect(7, 15, 14, 2).fillRect(6, 21, 16, 2).fillRect(9, 27, 10, 2);
  });
  // the apron's other life: a cape
  mk('c_cape', 50, 46, g => {
    const pts = [{ x: 48, y: 2 }, { x: 48, y: 14 }, { x: 22, y: 30 }, { x: 14, y: 45 }, { x: 8, y: 33 }, { x: 1, y: 40 }, { x: 5, y: 22 }, { x: 24, y: 8 }];
    g.fillStyle(0xd62828, 1).fillPoints(pts, true);
    g.fillStyle(0xa31d1d, 1).fillPoints([{ x: 48, y: 8 }, { x: 48, y: 14 }, { x: 22, y: 30 }, { x: 14, y: 45 }, { x: 24, y: 26 }], true);
    g.lineStyle(2, OUT, 1).strokePoints(pts, true);
    g.fillStyle(0xffffff, 1).fillRect(26, 15, 2, 9).fillRect(32, 12, 2, 9);        // a ghost of the apron lettering
  });

  // head: glass helmet bubble, big eyes, handlebar mustache
  mk('c_head', 30, 30, g => {
    ci(g, 15, 15, 14, 0xf3c9a8, 2);                                  // face
    g.fillStyle(0xffffff, 1).fillEllipse(10.5, 12.5, 8, 10).fillEllipse(20.5, 12.5, 8, 10);
    g.lineStyle(1.5, OUT, 1).strokeEllipse(10.5, 12.5, 8, 10).strokeEllipse(20.5, 12.5, 8, 10);
    g.fillStyle(OUT, 1).fillCircle(12.5, 13, 2.2).fillCircle(22.5, 13, 2.2);                 // eyes look forward
    g.lineStyle(2.5, 0x4a2c10, 1).lineBetween(6, 6.5, 13, 8.5).lineBetween(24, 6.5, 17, 8.5);   // heavy brows
    g.fillStyle(0xf09a8a, 1).fillCircle(15.5, 17.5, 3);                                      // nose
    g.fillStyle(0x4a2c10, 1).fillEllipse(9.5, 21.5, 9, 4.5).fillEllipse(21.5, 21.5, 9, 4.5); // mustache
    g.lineStyle(2, OUT, 1).lineBetween(11, 25.5, 20, 25.5);                                  // grin
    g.lineStyle(3, 0xcfe3ff, 0.9).strokeCircle(15, 15, 13.5);                                // helmet rim
    g.fillStyle(0xffffff, 0.35).fillEllipse(9, 7, 7, 4);                                     // glass glint
  });
  // chef's toque
  mk('c_hat', 38, 30, g => {
    ci(g, 9, 17, 8, 0xffffff, 2); ci(g, 29, 17, 8, 0xffffff, 2); ci(g, 19, 11, 10, 0xffffff, 2); ci(g, 19, 18, 9, 0xffffff, 0);
    rr(g, 7, 21, 24, 8, 2, 0xf1f1f1);
    g.lineStyle(1.5, 0xb9c3d6, 1).lineBetween(13, 22, 13, 28).lineBetween(19, 22, 19, 28).lineBetween(25, 22, 25, 28);
    g.lineStyle(1.5, 0xb9c3d6, 1).lineBetween(14, 6, 16, 14).lineBetween(24, 7, 22, 14);
  });

  mk('c_arm', 18, 11, g => {
    rr(g, 0, 2, 11, 7, 3, 0xeef2f8);
    ci(g, 13, 5.5, 4.5, 0xffffff, 2);
  });
  mk('c_gun', 32, 14, g => {
    rr(g, 0, 2, 25, 10, 3, 0xff8c1a);
    g.fillStyle(0x7a3b00, 1).fillRect(13, 0, 6, 14);
    rr(g, 24, 4, 7, 6, 2, 0xffc36a);
  });
  mk('c_tanks', 14, 28, g => {
    rr(g, 0, 0, 6, 20, 2, 0xd9503a); rr(g, 7, 0, 6, 20, 2, 0xd9503a);
    g.fillStyle(0x555b6e, 1).fillRect(0, 20, 6, 6).fillRect(7, 20, 6, 6);
  });
}

class ChrisRig {
  constructor(scene) {
    makeChrisTextures(scene);
    const img = (key, x, y, ox, oy) => scene.add.image(x, y, key).setOrigin(ox, oy);
    this.root = scene.add.container(0, 0).setDepth(7);

    this.cape = img('c_cape', -6, -42, 1, 0.08);
    this.tanks = img('c_tanks', -16, -36, 0.5, 0.5);
    this.legB = img('c_leg', -6, -12, 0.5, 0);
    this.bootB = img('c_boot', -6, 0, 0.5, 1);
    this.torso = scene.add.container(0, -12);
    this.body = img('c_body', 0, 3, 0.5, 1);
    this.armB = img('c_arm', -3, -22, 0, 0.5);
    this.apron = img('c_apron', -7, -30, 0.5, 0);
    this.head = img('c_head', 2, -41, 0.5, 0.5);
    this.hat = img('c_hat', 3, -51, 0.5, 1);
    this.torso.add([this.apron, this.body, this.armB, this.head, this.hat]);     // apron hangs BEHIND him so the belly is on show
    this.legF = img('c_leg', 7, -12, 0.5, 0);
    this.bootF = img('c_boot', 7, 0, 0.5, 1);
    this.gunArm = scene.add.container(4, -42);
    this.gArm = img('c_arm', 0, 0, 0, 0.5);
    this.gun = img('c_gun', 6, 1, 0, 0.5);
    this.auger = img('auger0', 27, 1, 0, 0.5);
    this.gunArm.add([this.gArm, this.gun, this.auger]);
    this.root.add([this.cape, this.tanks, this.legB, this.bootB, this.torso, this.legF, this.bootF, this.gunArm]);

    this.parts = [this.cape, this.tanks, this.legB, this.bootB, this.body, this.armB, this.apron, this.head, this.hat, this.legF, this.bootF, this.gArm, this.gun];
    this.tinted = false;
    this.wp = 0;          // waddle phase
    this.t = 0;
    this.c = 0;           // 0 = apron, 1 = cape
    this.squash = 0;
    this.recoil = 0;
    this.wasGround = true;
    this.vhPrev = 0;
  }

  setPowered(on) {
    if (on === this.tinted) return;
    this.tinted = on;
    for (const p of this.parts) { if (on) p.setTint(0xffe9a0); else p.clearTint(); }
  }

  // P = player state, (x, y) = screen position of his feet, z = world zoom, alpha = hit flicker, augerFrame = 0..3
  update(P, dt, x, y, z, alpha, augerFrame) {
    this.t += dt;
    const t = this.t;
    const grounded = P.h <= 0.5 && P.vh <= 0;
    const spd = Math.abs(P.vx);
    const run = grounded ? Math.min(1, spd / 140) : 0;

    // ---- phases
    if (grounded && spd > 10) this.wp += dt * (spd / 230) * 8;
    if (!this.wasGround && grounded) this.squash = 1;           // landing squash
    if (this.wasGround && !grounded && P.vh > 200) this.squash = -0.8;   // take-off stretch
    this.wasGround = grounded;
    this.squash += (0 - this.squash) * Math.min(1, dt * 9);
    const sq = this.squash;
    const sw = Math.sin(this.wp);
    const air = grounded ? 0 : 1;
    const fly = P.thrusting ? 1 : 0;

    // ---- cape / apron swap (the apron spins edge-on, then the cape unfurls)
    const target = (!grounded || P.thrusting) ? 1 : 0;
    this.c += (target - this.c) * Math.min(1, dt * 10);
    const c = this.c;
    this.apron.setScale(1.15 * Math.cos(Math.min(c, 0.5) * Math.PI), 0.95).setVisible(c < 0.5);
    const cp = Math.max(0, Math.min(1, (c - 0.3) / 0.7));
    this.cape.setVisible(cp > 0.02).setScale(cp, 0.6 + 0.4 * cp).setAlpha(cp);
    this.cape.setRotation(0.25 * cp + Math.sin(t * 17) * 0.09 * cp * (1 + fly) - P.vh * 0.00035);

    // ---- waddle: legs, boots and body roll
    const legAmp = 0.38 * run;
    const rotF = sw * legAmp + air * (0.45 + fly * 0.1 * Math.sin(t * 22));
    const rotB = -sw * legAmp - air * (0.3 + fly * 0.1 * Math.cos(t * 22));
    const L = 12;
    const place = (leg, boot, hipX, rot, liftPhase) => {
      leg.setRotation(rot);
      const lift = run > 0 ? Math.max(0, liftPhase) * 3.2 * run : 0;
      boot.setPosition(hipX - Math.sin(rot) * L, -12 + Math.cos(rot) * L - lift + air * -3);
      boot.setRotation(rot * 0.35);
      leg.setPosition(hipX, -12 - lift * 0.6);
    };
    place(this.legF, this.bootF, 7, rotF, sw);
    place(this.legB, this.bootB, -6, rotB, -sw);

    const idle = (1 - run) * (1 - air);
    this.torso.setPosition(sw * 1.9 * run, -12 - (1 - Math.cos(this.wp * 2)) * 0.9 * run + Math.sin(t * 2.6) * 0.7 * idle);
    this.torso.setRotation(sw * 0.1 * run + 0.06 * run - P.vh * 0.00022 * air);
    const stretchY = air ? 1 + Math.max(-0.1, Math.min(0.12, P.vh / 2000)) : 1;
    this.torso.setScale(1 + 0.16 * Math.max(0, sq) - 0.08 * Math.max(0, -sq) + Math.sin(t * 2.6) * 0.012 * idle,
      stretchY - 0.18 * Math.max(0, sq) + 0.1 * Math.max(0, -sq) + Math.sin(t * 2.6 + 1) * 0.018 * idle);

    // belly jiggle on every footfall
    this.body.setScale(1, 1 + Math.abs(Math.cos(this.wp)) * 0.05 * run);

    // ---- chef-hat helmet lags behind
    const vyLag = Math.max(-7, Math.min(8, P.vh * 0.011));
    this.hat.setPosition(3 - sw * 2.2 * run, -51 + vyLag * 0.6 + Math.sin(t * 5) * 0.5);
    this.hat.setRotation(-sw * 0.16 * run - P.vh * 0.0004 - 0.04 * Math.sin(t * 5));
    this.hat.setScale(1 + vyLag * -0.006, 1 + vyLag * 0.012 + Math.sin(t * 5.5) * 0.015);
    this.head.setPosition(2 + sw * 0.6 * run, -41 + vyLag * 0.2);

    // ---- arms
    this.armB.setRotation(-sw * 0.8 * run + 0.35 + Math.sin(t * 2.2) * 0.07 * idle - air * 1.2);
    if (P.firing > 0.09) this.recoil = 1;
    this.recoil = Math.max(0, this.recoil - dt * 9);
    this.gunArm.setPosition(this.torso.x + 4 - this.recoil * 3, this.torso.y - 30 + sw * 0.6 * run);
    this.gunArm.setRotation(-this.recoil * 0.07 + sw * 0.03 * run + this.torso.rotation * 0.4);
    this.auger.setTexture('auger' + augerFrame);
    this.tanks.setPosition(this.torso.x - 16, this.torso.y - 24);

    this.setPowered(P.power > 0);
    this.root.setPosition(x, y).setScale(z * RIG_SCALE * (P.facing < 0 ? -1 : 1), z * RIG_SCALE).setAlpha(alpha);
  }
}
