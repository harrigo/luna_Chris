// BONUS II: the CERAMIC GRILL FREEFALL. Chris DIVES head-first down the inside of a giant ceramic kamado grill, from
// the lid to the hot coals, where the prize gun floats over the pizza stone. A trail of cheese marks the racing line
// through the gaps in the grill grates: follow it and each bit you snap up plays the next note up the scale (keep the
// chain going for a run of rising notes and bonus time). Bump a grate and you bounce off it and slide towards the
// nearest gap (no stopping dead); the glowing hot grates and the flare-ups cost 2 seconds.
// Hold JUMP to BRAKE: Chris flips flat, belly down, and spreads his cape like a wingsuit (flapping comically), which
// slows the fall right down; it costs nothing but time. Hold DOWN to BOOST: his jet boots (pointing up now) fire and
// drive him down faster, using the fuel bar.
//
// (v2.73) Rebuilt to feel like a HUGE kamado: a bowed, glossy, crazed and soot-streaked ceramic shaft with riveted steel
// bands, heavy cast-iron grates with burnt bits on them, a disc of daylight up at the lid shrinking as you fall, drifting
// smoke in front and behind, embers streaming up, the coals getting brighter and redder until the whole screen glows.
// Speed lines and a camera that pulls out when you're fast and in when you brake; every knock is a jolt, sparks, a squash
// and a comic word. New vermin and hazards: BACON RATS scuttling along the grates, burnt SAUSAGES rolling off them,
// a greasy PATTY stuck to the wall dripping streams of grease, GREASE FLARE-UPS bursting up through the bars. The
// second half is faster and busier, and the last stretch is a roaring plunge through the flames to the stone.
//
// Controls: left/right (keys, d-pad, stick); brake = jump (Space/Up/W/Z, controller A); boost = down (S/X, controller
// down). Touch: on-screen buttons: steer bottom left, BRAKE and BOOST bottom right.

function makeFreefallTextures(scene) {
  if (scene.game.__ffTex) return; scene.game.__ffTex = true;
  const hex = n => '#' + n.toString(16).padStart(6, '0');
  const canvas = (key, w, h, draw) => {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const t = scene.textures.createCanvas(key, w, h), c = t.getContext(); c.imageSmoothingEnabled = false;
    draw(c, w, h); t.refresh(); t.setFilter(Phaser.Textures.FilterMode.NEAREST);
  };
  const R = (() => { let s = 4242; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
  const mix = (a, b, k) => [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * k));
  // ---- the back of the shaft (shown 2x): curved glaze, darker towards the sides, a wet sheen down it, crazing, soot,
  // grease stains, and a riveted steel band bowing across the top of each tile
  canvas('ffback', 300, 450, (c, w, h) => {
    const img = c.createImageData(w, h), D = img.data, TONES = [[8, 18, 12], [16, 34, 22], [26, 52, 34], [40, 74, 48], [62, 104, 70]];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const u = x / w, curve = Math.pow(Math.sin(Math.PI * u), 0.7), sheen = 0.9 * Math.exp(-Math.pow((x - 92) / 10, 2)) + 0.35 * Math.exp(-Math.pow((x - 215) / 22, 2));
      const lv = Math.min(4, Math.max(0, curve * 2.6 + sheen * 1.4 + BAY[(y & 3) * 4 + (x & 3)] - 0.3)), col = TONES[Math.floor(lv)], i = (y * w + x) * 4;
      D[i] = col[0]; D[i + 1] = col[1]; D[i + 2] = col[2]; D[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    for (let k = 0; k < 7; k++) { const x = R() * w, y = 30 + R() * (h - 60), r = 10 + R() * 24; for (let q = 0; q < 6; q++) { c.fillStyle = 'rgba(60,40,14,0.22)'; c.beginPath(); c.ellipse(x + (R() - 0.5) * r, y + q * r * 0.35, r * (0.5 + R() * 0.5), r * 0.25, 0, 0, 7); c.fill(); } c.fillStyle = 'rgba(40,26,8,0.4)'; c.fillRect(Math.round(x), Math.round(y), 2, Math.round(r * 2.4)); }
    for (let k = 0; k < 46; k++) {                                       // crazing in the glaze
      let x = R() * w, y = R() * h; c.strokeStyle = k % 3 ? 'rgba(6,14,8,0.8)' : 'rgba(120,170,128,0.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(Math.round(x), Math.round(y));
      for (let s = 0; s < 4; s++) { x += (R() - 0.5) * 26; y += (R() - 0.5) * 26; c.lineTo(Math.round(x), Math.round(y)); } c.stroke();
    }
    for (let k = 0; k < 16; k++) {                                       // soot dribbling down from the band
      const x = Math.round(R() * w), len = 30 + R() * 190, ww = 1 + Math.round(R() * 3);
      c.fillStyle = 'rgba(4,6,4,0.75)'; c.fillRect(x, 14, ww, len); c.fillRect(x - 1, 14 + len - 2, ww + 2, 4);
      if (R() < 0.5) { c.fillStyle = 'rgba(4,6,4,0.5)'; c.fillRect(x + ww, 14, 1, len * 0.6); }
    }
    for (let x = 0; x < w; x++) {                                          // the steel band, bowing down in the middle
      const yb = Math.round(3 + 7 * Math.sin(Math.PI * x / w));
      c.fillStyle = '#1a1012'; c.fillRect(x, yb - 1, 1, 11); c.fillStyle = '#6a7080'; c.fillRect(x, yb, 1, 9); c.fillStyle = '#b8c0cc'; c.fillRect(x, yb, 1, 2); c.fillStyle = '#3a3e48'; c.fillRect(x, yb + 7, 1, 2);
      if (x % 18 === 9) { c.fillStyle = '#2a2e38'; c.fillRect(x - 1, yb + 3, 3, 3); c.fillStyle = '#d8dce6'; c.fillRect(x - 1, yb + 3, 1, 1); }
    }
  });
  // ---- the side wall sweeping round towards us (the left one; the right is the same flipped): dark at the far edge,
  // the glaze catching the light near the inner lip, a fat highlight, chips, the band carrying on round
  canvas('ffside', 220, 450, (c, w, h) => {
    const img = c.createImageData(w, h), D = img.data, TONES = [[6, 14, 9], [14, 30, 19], [24, 50, 32], [40, 78, 50], [72, 124, 84], [150, 210, 160]];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const u = x / w, hl = Math.exp(-Math.pow((x - 196) / 6, 2)) * 1.8 + Math.exp(-Math.pow((x - 170) / 24, 2)) * 0.8;
      let lv = u * 2.4 + hl + BAY[(y & 3) * 4 + (x & 3)] - 0.4; if (x >= 212) lv = x >= 216 ? 0 : 1;
      const col = TONES[Math.max(0, Math.min(5, Math.floor(lv)))], i = (y * w + x) * 4; D[i] = col[0]; D[i + 1] = col[1]; D[i + 2] = col[2]; D[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    for (let k = 0; k < 30; k++) { let x = R() * 200, y = R() * h; c.strokeStyle = k % 2 ? 'rgba(4,10,6,0.85)' : 'rgba(160,210,170,0.4)'; c.beginPath(); c.moveTo(Math.round(x), Math.round(y)); for (let s = 0; s < 4; s++) { x += (R() - 0.5) * 30; y += R() * 24; c.lineTo(Math.round(x), Math.round(y)); } c.stroke(); }
    for (let k = 0; k < 5; k++) { const y = Math.round(R() * h); c.fillStyle = '#2a1a10'; c.fillRect(210, y, 6, 3 + Math.round(R() * 4)); c.fillStyle = '#c8b090'; c.fillRect(211, y + 1, 3, 2); }   // chips in the lip
    for (let x = 0; x < w; x++) { const yb = Math.round(3 + 4 * Math.pow(x / w, 3));
      c.fillStyle = '#1a1012'; c.fillRect(x, yb - 1, 1, 13); c.fillStyle = '#6a7080'; c.fillRect(x, yb, 1, 11); c.fillStyle = '#d0d6e0'; c.fillRect(x, yb, 1, 2); c.fillStyle = '#3a3e48'; c.fillRect(x, yb + 8, 1, 3);
      if (x % 22 === 11) { c.fillStyle = '#2a2e38'; c.fillRect(x - 2, yb + 3, 4, 4); c.fillStyle = '#e8ecf4'; c.fillRect(x - 2, yb + 3, 2, 1); } }
  });
  // ---- cast-iron grate bars (shown 2x): a thick slab with a lit top, char, burnt-on grease; and a red-hot one
  const grate = (key, hot) => canvas(key, 32, 15, (c, w, h) => {
    const T = hot ? ['#3a0a04', '#ffe08a', '#ffb03a', '#e8601a', '#a8280a', '#5a1006'] : ['#140c0e', '#c8ccd6', '#8a8a96', '#5e5c68', '#3e3c46', '#221e26'];
    c.fillStyle = T[0]; c.fillRect(0, 0, w, h);
    c.fillStyle = T[1]; c.fillRect(0, 1, w, 2); c.fillStyle = T[2]; c.fillRect(0, 3, w, 3); c.fillStyle = T[3]; c.fillRect(0, 6, w, 4); c.fillStyle = T[4]; c.fillRect(0, 10, w, 3); c.fillStyle = T[5]; c.fillRect(0, 13, w, 1);
    for (const x of [3, 15, 27]) { c.fillStyle = T[5]; c.fillRect(x, 6, 2, 6); c.fillStyle = T[2]; c.fillRect(x, 5, 2, 1); }      // bar ends
    for (let k = 0; k < 6; k++) { c.fillStyle = hot ? '#fff4c0' : (k % 2 ? '#2a1a12' : '#4a2e14'); c.fillRect(Math.floor(R() * 30), 2 + Math.floor(R() * 9), 2, 1 + Math.floor(R() * 2)); }
    if (!hot) { c.fillStyle = '#6a4a1a'; c.fillRect(8, 13, 2, 2); c.fillRect(22, 13, 1, 2); }                                          // grease about to drip
  });
  grate('ffgrate', false); grate('ffgrate_hot', true);
  // ---- the little sprites (hand-drawn pixel, ink outline)
  const INK = 0x1a1020, FUR = [0xc4c8dc, 0x868ca6, 0x4a4f6a], PINK = [0xffb0c0, 0xe07a90, 0xa04a60], CHED = [0xfff0a0, 0xffd23f, 0xd8901a];
  pixSprite(scene, 'ffcheese', 18, 15, a => { a.poly([[1, 13], [9, 2], [17, 13]], CHED); a.rect(1, 12, 17, 13, 0xd8901a); a.ell(7, 10, 1.6, 1.4, 0xc87a10); a.ell(12, 8, 1.3, 1.2, 0xc87a10); a.ell(10, 12, 1, 0.8, 0xc87a10); a.px(8, 4, 0xffffff); a.px(7, 5, 0xffffff); });
  for (const f of [0, 1]) pixSprite(scene, 'ffbaconrat' + (f ? '_b' : ''), 40, 22, a => {
    a.line([[6, 15], [2, 12], [3, 6], [1, 2]], PINK[1], 2);
    const lg = f ? [[12, 20], [16, 21], [24, 21], [28, 20]] : [[10, 21], [17, 20], [23, 20], [30, 21]]; for (const [x, y] of lg) a.line([[x, 15], [x, y]], PINK[1], 2);
    a.ell(18, 13, 11, 6.5, FUR);
    for (let k = 0; k < 3; k++) { const x0 = 10 + k * 7; a.poly([[x0, 6], [x0 + 5, 6], [x0 + 3, 20], [x0 - 2, 20]], k % 2 ? [0xffd0c0, 0xf0a090, 0xc06a5a] : [0xe85a4a, 0xb8302a, 0x7a1414]); }   // wrapped in bacon
    a.ell(31, 12, 6, 5, FUR); a.poly([[34, 9], [40, 12], [34, 15]], FUR); a.ell(39.5, 12, 1.4, 1.4, PINK);
    a.ell(31, 10, 1.6, 1.6, 0xff2a1a); a.px(31, 9, 0xffffff); a.ell(28, 6, 2.5, 3, PINK); a.rect(36, 14, 37, 16, 0xfff4d8);
  });
  pixSprite(scene, 'ffsausage', 28, 12, a => { a.ell(14, 6, 12.5, 4.8, [0xc8703a, 0x8a3a18, 0x4a1a08]); for (const x of [7, 12, 17, 22]) a.line([[x, 3], [x - 2, 9]], 0x2a0a04); a.ell(1.5, 6, 1.5, 1.5, 0x5a2a10); a.ell(26.5, 6, 1.5, 1.5, 0x5a2a10); a.line([[6, 3], [20, 3]], 0xe89a5a); });
  pixSprite(scene, 'ffpatty', 46, 20, a => { a.ell(23, 9, 21, 7.5, [0x9a6a4a, 0x6a3a1e, 0x34180a]); for (const x of [10, 18, 26, 34]) a.line([[x, 4], [x - 4, 14]], 0x1a0a04, 2); a.ell(16, 6, 6, 1.6, 0xd8b070); a.ell(30, 16, 2, 3, [0xf0d890, 0xc8a050, 0x8a6a20]); a.ell(30, 19, 1.3, 1.3, 0xc8a050); });
  pixSprite(scene, 'ffskewer', 150, 16, a => {
    a.line([[0, 8], [148, 8]], 0x8a94a6, 2); a.line([[0, 7], [148, 7]], 0xdfe6f0); a.poly([[146, 6], [150, 8], [146, 10]], 0xdfe6f0); a.ell(3, 8, 3, 4, [0xdfe6f0, 0x8a94a6, 0x4a5262]);
    const chunk = [(x) => { a.rrect(x - 6, 2, x + 6, 14, 2, [0xa86a3a, 0x7a3e1a, 0x3e1a08]); a.line([[x - 4, 4], [x + 2, 12]], 0x1a0a04); }, (x) => a.ell(x, 8, 5, 6, [0x7ad84a, 0x3a9a2a, 0x1a5a14]),
      (x) => { a.ell(x, 8, 5, 6, [0xfff4e8, 0xe0d0c0, 0xa89880]); a.ell(x, 8, 2.5, 3.5, [0xe8dcc8, 0xc8b8a0, 0x8a7a68]); }, (x) => a.ell(x, 8, 5.5, 6, [0xff6a4a, 0xd62828, 0x7a0a0a])];
    for (let k = 0; k < 9; k++) if (k !== 4) chunk[k % 4](18 + k * 14);
    a.ell(74, 8, 4, 4, [0x8a94a6, 0x5a6272, 0x2e3240]);
  });
  pixSprite(scene, 'ffspatula', 64, 30, a => {
    a.rrect(10, 2, 63, 28, 3, [0xeef2f8, 0xb0b8c6, 0x6a7080]); for (const y of [8, 15, 22]) a.rect(24, y - 1, 56, y + 1, 0x2a2e38);
    a.ell(40, 5, 8, 1.5, 0xd8c070); a.ell(50, 25, 5, 1.6, 0xb89a50); a.rect(0, 12, 11, 18, 0x4a5262); a.ell(6, 15, 2, 2, 0xdfe6f0);
  });
  for (let v = 0; v < 3; v++) pixSprite(scene, 'ffcoal' + v, 24, 18, a => {
    a.poly([[2, 14], [5, 4 + v], [12, 1], [20, 3 + v], [23, 12], [16, 17], [6, 17]], [0x4a3e3e, 0x2a2222, 0x120c0c]);
    a.line([[6, 8 + v], [11, 10], [14, 6], [18, 12]], 0xff7a1a, 1); a.line([[9, 14], [13, 11]], 0xffd23f, 1); a.px(16, 9, 0xfff4c0);
  });
  for (let f = 0; f < 3; f++) pixSprite(scene, 'ffflame' + f, 18, 32, a => {
    const sw = [0, 2, -2][f];
    a.poly([[9 + sw, 0], [16, 18], [14, 28], [9, 31], [4, 28], [2, 18]], [0xff8a2a, 0xe8401a, 0xa01a0a]);
    a.poly([[9 - sw, 9], [13, 20], [11, 28], [7, 28], [5, 20]], [0xfff0a0, 0xffd23f, 0xffa020]);
    a.ell(9, 25, 2.5, 3, 0xffffff);
  }, false);
  pixSprite(scene, 'ffstone', 150, 18, a => { a.rrect(0, 2, 149, 16, 4, [0xf0dcb4, 0xc8a878, 0x7a5a30]); for (const [x, r] of [[30, 6], [74, 9], [112, 5], [130, 4]]) a.ell(x, 9, r, 3, [0x6a4a20, 0x4a3010, 0x2a1a08]); a.line([[6, 4], [140, 4]], 0xfff4dc); });
  pixSprite(scene, 'ffvent', 44, 44, a => { a.ell(22, 22, 21, 21, [0xf4f8ff, 0xc8dcff, 0x8ab0e0]); a.ell(22, 22, 12, 12, 0xffffff); for (const x of [10, 18, 26, 34]) a.rect(x, 2, x + 2, 42, 0x2a2e38); });
}

class FreefallScene extends Phaser.Scene {
  constructor() { super('freefall'); }

  create() {
    buildAllTextures(this); makeFreefallTextures(this);
    const SW = this.SW = 600, SH = this.SH = 7000, rnd = (a, b) => a + Math.random() * (b - a);
    this.cameras.main.setBackgroundColor('#06100a').fadeIn(300, 0, 0, 0);
    Sound.init(); Sound.music('level4');
    this.goalHud = null; this.leaving = false; this.done = false; this.cageOpen = false; this.touchG = null; this.touchLbl = null; this.wingK = 0; this.wingOn = false; this.faceS = undefined; this.wingWas = false; this.poseL = undefined; this.smokeG = null; this.t = 0; this.timeLeft = 27; this.timeMax = 27; this.fuel = 1; this.penaltyT = 0;
    this.chain = 0; this.chainT = 0; this.gotCheese = 0; this.hitStop = 0; this.squash = 0; this.zoomK = 1; this.plungeOn = false; this.roarT = 0;
    this.P = { h: 60, floor: 0, vh: -200, vx: 0, thrusting: false, firing: 0, aimA: 0, power: 0, duck: false, facing: 1 };
    this.pos = { x: SW / 2, y: -260 }; this.vel = { x: 0, y: 140 };
    this.intro = 3.6; this.count = -1;                                // the intro: he glides in on autopilot, wings out, while it counts 3, 2, 1, GO
    this.fx = [];

    // ---- the grill: grate rows with wide gaps (a few slide slowly, faster in the second half); some hot ones lower down
    this.rows = [];
    let lastGap = SW / 2;
    for (let y = 560, i = 0; y < SH - 360; i++) {
      const w = rnd(124, 150), deepHalf = y > SH * 0.5;
      // every third grate is a SWITCHBACK: close under the last one and right over on the far side. At full speed you
      // can't get across in time: brake (the trail there is blue cheese, and a BRAKE! sign hangs over it)
      const sw = i % 3 === 2;
      if (sw) y = this.rows[this.rows.length - 1].y + rnd(270, 300);
      let gx = sw ? (lastGap > SW / 2 ? rnd(25, 60) : SW - w - rnd(25, 60))
        : Math.max(30, Math.min(SW - w - 30, lastGap + (Math.random() < 0.5 ? -1 : 1) * rnd(120, 300) - w / 2));
      const gaps = [{ x: gx, w }];
      if (Math.random() < 0.25) { const ox = gx > SW / 2 ? rnd(30, gx - w - 40) : rnd(gx + w + 40, SW - w - 30); if (ox > 20 && ox < SW - w - 20) gaps.push({ x: ox, w: w * 0.8 }); }
      const slide = !sw && i > 2 && Math.random() < (deepHalf ? 0.55 : 0.4);
      if (slide) { const g = gaps[0]; g.amp = rnd(60, 110); g.sp = rnd(0.9, 1.4) * (deepHalf ? 1.4 : 1); g.ph = rnd(0, 6); g.x0 = Math.max(g.amp + 10, Math.min(SW - g.w - g.amp - 10, g.x)); }
      lastGap = (gaps[0].x0 !== undefined ? gaps[0].x0 : gaps[0].x) + w / 2;
      this.rows.push({ y, gaps, hot: !sw && y > SH * 0.35 && Math.random() < 0.5, slide, sw, lineX: lastGap });
      y += rnd(700, 860);
    }
    this.vents = [];
    for (let k = 0; k < 9; k++) {
      const row = this.rows[1 + Math.floor(Math.random() * (this.rows.length - 2))], y = row.y - rnd(200, 300);
      if (row.sw || (k >= 6 && y < SH * 0.5)) continue;                                // (the extra ones only in the second half)
      if (this.vents.some(v => Math.abs(v.y - y) < 240)) continue;
      const lineX = this.lineXAt(y);
      this.vents.push({ y, side: Math.random() < 0.5 ? (lineX > SW / 2 ? -1 : 1) : (lineX > SW / 2 ? 1 : -1), t: rnd(0, 3), st: 'idle', hitDone: false });
    }
    // ---- THE CHEESE TRAIL: the racing line, from the lid through every main gap down to the gun
    this.trail = [];
    let prev = { x: SW / 2, y: 140 };
    const pts = this.rows.map(r => ({ x: r.lineX, y: r.y, sw: r.sw })).concat([{ x: SW / 2, y: SH - 90 }]);
    for (const q of pts) {
      const d = q.y - prev.y, n = Math.floor(d / 46);
      if (q.sw) { const t = this.add.text((prev.x + q.x) / 2, prev.y + 50, 'BRAKE!', { fontFamily: PIXEL, fontSize: '13px', color: '#9fd8ff', stroke: '#1a1020', strokeThickness: 5 }).setOrigin(0.5).setDepth(3.5); this.tweens.add({ targets: t, scale: 1.15, yoyo: true, repeat: -1, duration: 300 }); }
      for (let k = 1; k <= n; k++) {
        const u = k / n, e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        const x = prev.x + (q.x - prev.x) * Math.min(1, e * 1.15), y = prev.y + d * u;
        if (Math.abs(y - q.y) < 30) continue;
        const im = this.add.image(x, y, 'ffcheese').setDepth(3).setScale(1.5);
        if (q.sw) im.setTint(0x7ad8ff);                                                               // blue cheese = brake here
        this.trail.push({ x, y, im, got: false, ph: (x + y) * 0.02, sw: !!q.sw });
      }
      prev = q;
    }
    // ---- the in-between hazards: spinning KEBAB SKEWERS, a SPATULA swinging out of the wall, SMOKE clouds that hold you
    // up (and hide the trail), and (v2.73) a greasy PATTY stuck to the wall that drips streams of grease
    this.haz = [];
    for (let i = 0; i < this.rows.length; i++) {
      const a = i ? this.rows[i - 1].y : 200, b = this.rows[i];
      if (b.sw || b.y - a < 560 || Math.random() < 0.12) continue;
      const y = (a + b.y) / 2 + rnd(-40, 40), lx = this.lineXAt(y), type = ['spin', 'swing', 'smoke', 'spin', 'swing', 'patty'][Math.floor(Math.random() * 6)];
      if (this.vents.some(v => Math.abs(v.y - y) < 160)) continue;
      if (type === 'spin') this.haz.push({ type, x: Math.max(150, Math.min(SW - 150, lx + rnd(-50, 50))), y, len: 140, ang: rnd(0, 6), w: (Math.random() < 0.5 ? -1 : 1) * rnd(1.3, 1.9) * (y > SH / 2 ? 1.25 : 1) });
      else if (type === 'swing') { const side = lx > SW / 2 ? 1 : -1; this.haz.push({ type, side, y, px: side < 0 ? 0 : SW, py: y - 230, len: 300, ph: rnd(0, 6), sp: rnd(1.5, 2) }); }
      else if (type === 'patty') { const side = lx > SW / 2 ? -1 : 1; this.haz.push({ type, side, y: y - 120, x: side < 0 ? 30 : SW - 30, on: false, t: rnd(0, 1.5) }); }
      else this.haz.push({ type, x: rnd(150, SW - 150), y, r: 150, ph: rnd(0, 6) });
    }
    this.drops = [];                                                         // grease drops in flight
    // ---- (v2.73) vermin on the grates: BACON RATS scuttling along the bars; burnt SAUSAGES that roll off and drop
    this.rats = []; this.sausages = []; this.sausT = 1.5; this.flares = [];
    for (const r of this.rows) {
      if (r.slide || r.sw || r.y < 900 || Math.random() > (r.y > SH / 2 ? 0.6 : 0.35)) continue;
      const seg = this.solidSegs(r).filter(([a2, b2]) => b2 - a2 > 120).sort(() => Math.random() - 0.5)[0]; if (!seg) continue;
      const im = this.add.sprite(0, 0, 'ffbaconrat').setOrigin(0.5, 1).setDepth(3.2).setScale(1.4);
      this.rats.push({ r, a: seg[0] + 20, b: seg[1] - 20, x: rnd(seg[0] + 20, seg[1] - 20), v: (Math.random() < 0.5 ? -1 : 1) * rnd(90, 150), im });
    }
    this.isTouch = (navigator.maxTouchPoints || 0) > 0 || ('ontouchstart' in window);
    this.need = Math.ceil(this.trail.length * 0.85);
    this.buildShaft();

    // ---- the prize: a gun floating over the pizza stone at the bottom (an extra life once every gun's won)
    this.prize = ZeroGScene.prototype.pickPrize.call(this);
    this.gunY = SH - 80;
    this.gunImg = this.add.image(SW / 2, this.gunY, this.prize ? this.prize.gunTex : 'burger').setDepth(3).setScale(2.2);
    this.cage = this.add.graphics().setDepth(3.1);
    this.gunGlow = this.add.image(SW / 2, this.gunY, 'puff').setDepth(2.9).setBlendMode(Phaser.BlendModes.ADD).setTint(0xffd23f).setScale(3).setAlpha(0.5);

    // Chris, diving head first: no gun in his hands, arms out in front
    this.rig = new ChrisRig(this); this.rig.root.setDepth(5); this.rig.setWeapon(WEAPONS[0]);
    this.rig.gunArm.setVisible(false);
    this.dynG = this.add.graphics().setDepth(3.05);
    this.fxG = this.add.graphics().setDepth(6).setBlendMode(Phaser.BlendModes.ADD);
    this.lineG = this.add.graphics().setDepth(6.2);
    // depth layers: the daylight at the lid, smoke behind and in front, the heat haze over the screen
    this.vent = this.add.image(0, 0, 'ffvent').setScrollFactor(0).setDepth(-0.95).setScale(2);
    this.ventGlow = this.add.image(0, 0, 'puff').setScrollFactor(0).setDepth(-0.96).setBlendMode(Phaser.BlendModes.ADD).setTint(0xc8dcff);
    this.smokeB = []; this.smokeF = [];
    for (let i = 0; i < 9; i++) this.smokeB.push({ im: this.add.image(0, 0, 'puff').setDepth(-0.5).setTint(0x2a2a2e).setAlpha(0.35), x: rnd(-100, SW + 100), y: rnd(0, 1), s: rnd(3, 6), v: rnd(-14, 14) });
    for (let i = 0; i < 5; i++) this.smokeF.push({ im: this.add.image(0, 0, 'puff').setDepth(7).setTint(0x4a4448).setAlpha(0.22), x: rnd(-100, SW + 100), y: rnd(0, 1), s: rnd(5, 9), v: rnd(-20, 20) });
    this.heat = this.add.rectangle(0, 0, 10, 10, 0xff4a10, 0).setOrigin(0).setScrollFactor(0).setDepth(8).setBlendMode(Phaser.BlendModes.ADD);

    // HUD
    const f = (s, c) => ({ fontFamily: PIXEL, fontSize: s + 'px', color: c, stroke: '#1a1020', strokeThickness: 4 });
    this.f = f;
    this.timeTxt = this.add.text(0, 0, '', f(16, '#ffd23f')).setOrigin(0.5, 0).setScrollFactor(0).setDepth(20);
    this.gotTxt = this.add.text(0, 0, '', f(9, '#ffffff')).setOrigin(0.5, 0).setScrollFactor(0).setDepth(20);
    this.depthG = this.add.graphics().setScrollFactor(0).setDepth(20);
    this.msg = this.add.text(0, 0, 'CERAMIC GRILL FREEFALL\nFOLLOW THE CHEESE TRAIL DOWN!\nMOST OF IT OPENS THE CAGE AT THE BOTTOM\nBLUE CHEESE = BRAKE   DOWN = BOOST',
      Object.assign(f(11, '#ffcf9a'), { align: 'center', lineSpacing: 8 })).setOrigin(0.5).setScrollFactor(0).setDepth(20);
    this.tweens.add({ targets: this.msg, alpha: 0, delay: 2800, duration: 500 });
    this.countTxt = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '40px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 8 }).setOrigin(0.5).setScrollFactor(0).setDepth(21);
    this.exitBtn = this.add.text(0, 0, '< MAP', Object.assign(f(10, '#ffffff'), { backgroundColor: '#3a1a1a', padding: { x: 8, y: 7 } })).setScrollFactor(0).setDepth(25).setInteractive({ useHandCursor: true });
    this.exitBtn.on('pointerdown', () => this.leave());
    this.layout(); this.scale.on('resize', this.layout, this); this.events.once('shutdown', () => this.scale.off('resize', this.layout, this));

    this.keys = this.input.keyboard ? this.input.keyboard.addKeys({ left: 'LEFT', right: 'RIGHT', up: 'UP', down: 'DOWN', a: 'A', d: 'D', w: 'W', s: 'S', x: 'X', z: 'Z', space: 'SPACE' }) : null;
    const padOff = Pad.on(b => {
      if (b === 'back') return this.leave();
      if (this.done && this.t - this.doneT > 0.8) { if (b === 'x' || b === 'y') this.again(); else if (b === 'a' || b === 'b' || b === 'start') this.leave(); }
    });
    this.events.once('shutdown', padOff);
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => this.leave());
      this.input.keyboard.on('keydown', e => { if (!this.done || this.t - this.doneT < 0.8) return; if (e.key === 'r' || e.key === 'R') this.again(); else if (e.key === 'Enter') this.leave(); });
    }
  }
  // where the racing line is at a given depth (the next main gap's centre)
  lineXAt(y) { const r = this.rows.find(q => q.y > y) || this.rows[this.rows.length - 1]; return r.lineX; }
  solidSegs(r, t) {
    const out = []; let x = 0;
    for (const gp of this.gapsAt(r, t || 0).slice().sort((a, b) => a.x - b.x)) { if (gp.x > x) out.push([x, gp.x]); x = Math.max(x, gp.x + gp.w); }
    if (x < this.SW) out.push([x, this.SW]);
    return out;
  }
  // every knock: a jolt, a squash, sparks, a clang and a comic word
  smack(x, y, word, col, heavy) {
    this.hitStop = heavy ? 0.08 : 0.05; this.squash = 1; this.rig.ouch(!!heavy);
    this.cameras.main.shake(heavy ? 200 : 130, heavy ? 0.014 : 0.009);
    this.puff(x, y, 10, 0xfff4c0, 260, 0.3, 2.5); this.puff(x, y, 6, 0xffffff, 160, 0.2, 2);
    const t = this.add.text(x + (Math.random() - 0.5) * 40, y - 50, word, { fontFamily: PIXEL, fontSize: heavy ? '20px' : '16px', color: col || '#ffffff', stroke: '#1a1020', strokeThickness: 6 }).setOrigin(0.5).setDepth(12).setRotation((Math.random() - 0.5) * 0.5).setScale(0.2);
    this.tweens.add({ targets: t, scale: 1.25, duration: 110, ease: 'Back.out', yoyo: false, onComplete: () => this.tweens.add({ targets: t, scale: 1, y: t.y - 30, alpha: 0, delay: 250, duration: 450, onComplete: () => t.destroy() }) });
  }
  bonk(x, y, why, pushX) {
    if (this.penaltyT > 0 || this.done) return;
    this.penaltyT = 0.6; this.timeLeft = Math.max(0, this.timeLeft - 1); this.chain = 0;
    Sound.sfx('bonk'); Sound.sfx('clang'); this.smack(x, y, why + '!', '#ffe0a0'); this.pop(x, y - 10, '-1s', '#ffb07a');
    if (pushX) { this.vel.x = pushX; this.slideT = 0.25; }
  }

  // ---- the shaft: a bowed, glazed ceramic egg (tiled pixel art), getting hotter towards the coals at the bottom
  buildShaft() {
    const SW = this.SW, SH = this.SH, rnd = (a, b) => a + Math.random() * (b - a);
    this.add.tileSprite(0, -900, SW, SH + 1300, 'ffback').setOrigin(0).setTileScale(2).setDepth(-1);
    const heat = this.add.graphics().setDepth(-0.9).setBlendMode(Phaser.BlendModes.ADD);    // warmer and warmer the deeper you go
    for (let y = SH * 0.25; y < SH + 200; y += 100) { const k = Math.max(0, (y - SH * 0.25) / (SH * 0.75)); heat.fillStyle(0xff4a10, 0.38 * k * k).fillRect(0, y, SW, 101); }
    for (const side of [-1, 1]) {
      const ts = this.add.tileSprite(side < 0 ? -440 : SW, -900, 440, SH + 1300, 'ffside').setOrigin(0).setTileScale(2).setDepth(4);
      if (side > 0) ts.setFlipX(true);
      const hs = this.add.graphics().setDepth(4.01).setBlendMode(Phaser.BlendModes.ADD);
      for (let y = SH * 0.25; y < SH + 200; y += 100) { const k = Math.max(0, (y - SH * 0.25) / (SH * 0.75)); hs.fillStyle(0xff4a10, 0.3 * k * k).fillRect(side < 0 ? -440 : SW, y, 440, 101); }
    }
    const wall = this.add.graphics().setDepth(4.02);
    for (const v of this.vents) {                                             // the flare-up vents: soot-blackened slots with a grille
      const x = v.side < 0 ? -26 : SW;
      wall.fillStyle(0x0a0404, 1).fillRect(x, v.y - 20, 26, 40); wall.lineStyle(3, 0x3a3e48, 1).strokeRect(x, v.y - 20, 26, 40);
      for (let k = -12; k <= 12; k += 8) wall.fillStyle(0x6a7080, 1).fillRect(x, v.y + k, 26, 3);
      wall.fillStyle(0x050302, 0.6).fillRect(x + (v.side < 0 ? -30 : 26), v.y - 26, 30, 70);
    }
    // the static grates: tiled cast iron, with burnt bits stuck on top
    for (const r of this.rows) if (!r.slide) {
      for (const [a, b] of this.solidSegs(r)) {
        this.add.tileSprite(a, r.y - 4, b - a, 30, r.hot ? 'ffgrate_hot' : 'ffgrate').setOrigin(0).setTileScale(2).setDepth(2);
        if (b - a > 60 && Math.random() < 0.6) { const im = this.add.image(rnd(a + 20, b - 20), r.y - 4, Math.random() < 0.5 ? 'ffsausage' : 'ffcoal' + Math.floor(rnd(0, 3))).setOrigin(0.5, 0.9).setDepth(2.05).setScale(1.1).setRotation(rnd(-0.2, 0.2)); if (r.hot) im.setTint(0xff9a6a); }
      }
    }
    // sliding grates: a pool of tiled bars repositioned every frame
    for (const r of this.rows) if (r.slide) r.segIm = [0, 1, 2].map(() => this.add.tileSprite(0, r.y - 4, 10, 30, r.hot ? 'ffgrate_hot' : 'ffgrate').setOrigin(0).setTileScale(2).setDepth(2).setVisible(false));
    // the bottom: the coal bed glowing, flames licking up, the pizza stone
    const gb = this.add.graphics().setDepth(1.9); gb.fillStyle(0x1a0804, 1).fillRect(-440, SH - 20, SW + 880, 400);
    this.coals = [];
    for (let i = 0; i < 70; i++) { const im = this.add.image(rnd(-60, SW + 60), SH + rnd(-14, 60), 'ffcoal' + (i % 3)).setDepth(1.95).setScale(rnd(1.6, 2.6)).setRotation(rnd(-0.6, 0.6)); this.coals.push({ im, ph: rnd(0, 6) }); }
    this.flames = [];
    for (let i = 0; i < 14; i++) this.flames.push({ im: this.add.image(rnd(10, SW - 10), SH + rnd(-6, 20), 'ffflame0').setOrigin(0.5, 1).setDepth(2.1).setScale(rnd(1.8, 2.8)).setBlendMode(Phaser.BlendModes.ADD), ph: rnd(0, 6), sp: rnd(9, 15) });
    this.add.image(SW / 2, SH - 4, 'ffstone').setOrigin(0.5, 1).setScale(2).setDepth(2.2);
  }
  drawSlidingGrates() {
    for (const r of this.rows) if (r.slide) {
      const near = Math.abs(r.y - this.pos.y) < this.scale.height * 1.6, segs = near ? this.solidSegs(r, this.t) : [];
      r.segIm.forEach((im, i) => { const s = segs[i]; if (!s) { im.setVisible(false); return; } im.setVisible(true).setPosition(s[0], r.y - 4).setSize(s[1] - s[0], 30); im.tilePositionX = -s[0] / 2; });
    }
  }
  gapsAt(r, t) { return r.slide ? r.gaps.map(g => g.x0 !== undefined ? { x: g.x0 + Math.sin(t * g.sp + g.ph) * g.amp, w: g.w } : g) : r.gaps; }
  inGap(r, x, half) { return this.gapsAt(r, this.t).some(g => x - half >= g.x && x + half <= g.x + g.w); }
  nearestGapX(r, x) { let best = null, bd = 1e9; for (const g of this.gapsAt(r, this.t)) { const c = g.x + g.w / 2, d = Math.abs(c - x); if (d < bd) { bd = d; best = c; } } return best; }

  // on-screen buttons for phones: steer left / right (bottom left), BRAKE (bottom right). Hidden when a controller's in use.
  touchBtns() {
    const W = this.scale.width, H = this.scale.height, r = Math.max(28, Math.min(44, H * 0.1));
    return { r, L: { x: 20 + r, y: H - 20 - r }, Rt: { x: 20 + r * 3.4, y: H - 20 - r }, B: { x: W - 30 - r * 2.2, y: H - 20 - r * 1.2 }, D: { x: W - 30 - r * 4.6, y: H - 20 - r * 0.9 } };
  }
  drawTouch(state) {
    const g = this.touchG || (this.touchG = this.add.graphics().setScrollFactor(0).setDepth(22)), T = this.touchBtns();
    g.clear();
    const show = this.isTouch && !(Pad.state.connected && typeof LAST_INPUT !== 'undefined' && LAST_INPUT !== 'touch') && !this.done;
    if (this.touchLbl) this.touchLbl.forEach(t => t.setVisible(show));
    if (!show) return;
    const btn = (p, on, col, rr) => { g.fillStyle(0x000000, 0.35).fillCircle(p.x + 3, p.y + 3, rr); g.fillStyle(on ? col : 0x1a1020, on ? 0.85 : 0.5).fillCircle(p.x, p.y, rr); g.lineStyle(3, col, 0.9).strokeCircle(p.x, p.y, rr); };
    btn(T.L, state.l, 0xffd23f, T.r); btn(T.Rt, state.r, 0xffd23f, T.r); btn(T.B, state.b, 0xff5a5a, T.r * 1.25); btn(T.D, state.d, 0x39c6ff, T.r * 0.85);
    const tri = (p, d) => g.fillStyle(0xffffff, 1).fillTriangle(p.x + d * T.r * 0.45, p.y, p.x - d * T.r * 0.3, p.y - T.r * 0.45, p.x - d * T.r * 0.3, p.y + T.r * 0.45);
    tri(T.L, -1); tri(T.Rt, 1);
    const lab = t => this.add.text(0, 0, t, { fontFamily: PIXEL, fontSize: '9px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0).setDepth(23);
    if (!this.touchLbl) this.touchLbl = [lab('BRAKE'), lab('BOOST')];
    this.touchLbl[0].setPosition(T.B.x, T.B.y); this.touchLbl[1].setPosition(T.D.x, T.D.y);
  }
  readTouch() {
    const T = this.touchBtns(), st = { l: false, r: false, b: false, d: false };
    if (!this.isTouch) return st;
    for (const p of this.input.manager.pointers) {
      if (!p.isDown) continue;
      if (Math.hypot(p.x - T.L.x, p.y - T.L.y) < T.r * 1.3) st.l = true;
      else if (Math.hypot(p.x - T.Rt.x, p.y - T.Rt.y) < T.r * 1.3) st.r = true;
      else if (Math.hypot(p.x - T.B.x, p.y - T.B.y) < T.r * 1.5) st.b = true;
      else if (Math.hypot(p.x - T.D.x, p.y - T.D.y) < T.r * 1.1) st.d = true;
    }
    return st;
  }

  layout() {
    const W = this.scale.width, H = this.scale.height;
    this.timeTxt.setPosition(W / 2, 8); this.gotTxt.setPosition(W / 2, 32); this.msg.setPosition(W / 2, H * 0.36);
    if (this.countTxt) this.countTxt.setPosition(W / 2, H * 0.68);
    this.exitBtn.setPosition(10, 10);
    if (this.heat) this.heat.setSize(W, H);
  }
  puff(x, y, n, col, spd, life, size) { ZeroGScene.prototype.puff.call(this, x, y, n, col, spd, life, size); }
  pop(x, y, txt, col) { ZeroGScene.prototype.pop.call(this, x, y, txt, col); }
  penalty(x, y, why) {
    if (this.penaltyT > 0 || this.done) return;
    this.penaltyT = 0.8; this.timeLeft = Math.max(0, this.timeLeft - 2); this.chain = 0;
    Sound.sfx(['ouch1', 'ouch2', 'ouch3'][Math.floor(Math.random() * 3)]); Sound.sfx('hiss');
    this.smack(x, y, why, '#ff9a5a', true); this.pop(x, y - 10, '-2s', '#ff7a5a'); this.puff(x, y, 14, 0xff7a1a, 220, 0.45, 3);
  }

  update(time, dms) {
    let dt = Math.min(0.05, dms / 1000); this.t += dt;
    if (this.hitStop > 0) { this.hitStop -= dt; dt *= 0.08; }               // a beat of freeze on every knock
    const P = this.P, cam = this.cameras.main, k = this.keys, W = this.scale.width, H = this.scale.height, SW = this.SW, SH = this.SH;
    this.penaltyT = Math.max(0, this.penaltyT - dt);
    // ---- input: steer + brake
    let ax = 0, brake = false, boost = false;
    if (k) { ax += (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0); brake = k.up.isDown || k.w.isDown || k.z.isDown || k.space.isDown; boost = (k.down && k.down.isDown) || (k.s && k.s.isDown) || (k.x && k.x.isDown); }
    if (Pad.state.connected) { if (Pad.state.left || Pad.state.lx < -0.3) ax = -1; if (Pad.state.right || Pad.state.lx > 0.3) ax = 1; if (Pad.state.jump) brake = true; if (Pad.state.down || Pad.state.ly > 0.5) boost = true; }
    const ts = this.readTouch();
    if (ts.l) ax = -1; if (ts.r) ax = 1; if (ts.b) brake = true; if (ts.d) boost = true;
    this.drawTouch(ts);
    const ptr = this.input.activePointer, eb = this.exitBtn.getBounds();
    if (ptr.isDown && !this.done && !eb.contains(ptr.downX, ptr.downY) && !this.isTouch) {
      const wp = cam.getWorldPoint(ptr.x, ptr.y), dx = wp.x - this.pos.x;
      ax = Math.abs(dx) > 14 ? Math.max(-1, Math.min(1, dx / 60)) : 0;
      if (wp.y < this.pos.y - 50) brake = true;
    }
    if (this.done) { ax = 0; brake = false; boost = false; }
    if (this.intro > 0) {
      this.intro -= dt;
      const c = this.trail.find(q => !q.got && q.y > this.pos.y - 10), tx = c ? c.x : SW / 2;
      ax = Math.max(-1, Math.min(1, (tx - this.pos.x) / 40)); brake = true; boost = false;
      const n = Math.ceil(this.intro - 0.6);
      const show = this.intro > 0.6 ? String(Math.max(1, n)) : 'GO!';
      if (show !== this.count) {
        this.count = show; Sound.sfx(show === 'GO!' ? 'power' : 'combo');
        this.countTxt.setText(show).setScale(1.8).setAlpha(1).setColor(show === 'GO!' ? '#7dff8a' : '#ffd23f');
        this.tweens.add({ targets: this.countTxt, scale: 1, duration: 260, ease: 'Back.out' });
        if (show === 'GO!') this.tweens.add({ targets: this.countTxt, alpha: 0, delay: 450, duration: 300 });
      }
    }
    const deep = Math.max(0, this.pos.y / SH), plunge = deep > 0.85 && !this.done;
    if (plunge && !this.plungeOn) { this.plungeOn = true; Sound.sfx('fan'); Sound.sfx('crash'); this.cameras.main.shake(400, 0.01); this.pop(this.pos.x, this.pos.y + 80, 'THE COALS! PLUNGE!', '#ffb03a'); }
    // ---- move: snappy steering, a fall you can control
    if (this.slideT > 0) this.slideT -= dt;
    else this.vel.x += (ax * 300 - this.vel.x) * Math.min(1, dt * 10);
    if (ax) P.facing = ax > 0 ? 1 : -1;
    const braking = brake, boosting = !brake && boost && this.fuel > 0, cruise = plunge ? 560 : 470;
    if (braking && !this.wingOn) { Sound.sfx('swish'); Sound.sfx('flap'); this.puff(this.pos.x, this.pos.y - 40, 8, 0xffffff, 200, 0.25, 2); }   // the cape snaps open: WHUMP
    this.wingOn = braking;
    this.wingK = (this.wingK || 0) + ((braking ? 1 : 0) - (this.wingK || 0)) * Math.min(1, dt * 9);
    if (braking) this.vel.y = Math.max(110, this.vel.y - 1300 * dt);
    else if (boosting) { this.fuel = Math.max(0, this.fuel - dt / 2.2); this.vel.y = Math.min(760, this.vel.y + 1500 * dt); }
    else this.vel.y = this.vel.y > cruise ? Math.max(cruise, this.vel.y - 600 * dt) : Math.min(cruise, this.vel.y + 900 * dt);
    if (!boosting) this.fuel = Math.min(1, this.fuel + dt * 0.1);
    if (braking && Math.random() < dt * 6) Sound.sfx('flap');
    const prevY = this.pos.y;
    this.pos.x = Math.max(16, Math.min(SW - 16, this.pos.x + this.vel.x * dt));
    this.pos.y += this.vel.y * dt;
    // ---- grates: bump one and you bounce off it and SLIDE towards the nearest gap
    for (const r of this.rows) {
      if (prevY <= r.y && this.pos.y >= r.y && !this.inGap(r, this.pos.x, 12)) {
        this.pos.y = r.y - 1; this.vel.y = -200;
        const gx = this.nearestGapX(r, this.pos.x); this.vel.x = Math.sign(gx - this.pos.x) * 200; this.slideT = 0.25;
        if (r.hot) this.penalty(this.pos.x, r.y, 'SIZZLE!');
        else { Sound.sfx('bonk'); Sound.sfx('clang'); this.chain = 0; this.timeLeft = Math.max(0, this.timeLeft - 1); this.smack(this.pos.x, r.y, ['BONK!', 'CLANG!', 'DOINK!'][Math.floor(Math.random() * 3)], '#ffe0a0'); this.pop(this.pos.x, r.y - 20, '-1s', '#ffb07a'); this.puff(this.pos.x, r.y, 8, 0xffd23f, 220, 0.25, 2); }
        break;
      }
    }
    // ---- flare-up vents in the walls
    for (const v of this.vents) {
      v.t -= dt;
      if (v.t <= 0) {
        if (v.st === 'idle') { v.st = 'warn'; v.t = 0.8; }
        else if (v.st === 'warn') { v.st = 'fire'; v.t = 0.8; v.hitDone = false; if (Math.abs(v.y - this.pos.y) < H) { Sound.sfx('fan'); this.cameras.main.shake(120, 0.005); } }
        else { v.st = 'idle'; v.t = (v.y > SH / 2 ? 1.8 : 2.5) + Math.random() * 2; }
      }
      if (v.st === 'fire' && !v.hitDone) {
        const reach = 270, inX = v.side < 0 ? this.pos.x < reach : this.pos.x > SW - reach;
        if (inX && Math.abs(this.pos.y - v.y) < 40) { v.hitDone = true; this.vel.x = -v.side * 360; this.slideT = 0.3; this.penalty(this.pos.x, this.pos.y, 'FLARE-UP!'); }
      }
    }
    // ---- skewers, spatulas, smoke, greasy patties
    const cy = this.pos.y - 30;
    for (const h of this.haz) {
      if (Math.abs(h.y - this.pos.y) > H * 1.3) continue;
      if (h.type === 'spin') {
        h.ang += h.w * dt;
        const dx = Math.cos(h.ang), dy = Math.sin(h.ang), rx = this.pos.x - h.x, ry = cy - h.y, along = Math.max(-h.len, Math.min(h.len, rx * dx + ry * dy));
        if (Math.hypot(rx - dx * along, ry - dy * along) < 20) this.bonk(this.pos.x, cy, 'SKEWERED', Math.sign(rx - dx * along || 1) * 260);
      } else if (h.type === 'swing') {
        const a = 0.65 + 0.6 * Math.sin(this.t * h.sp + h.ph);
        h.hx = h.px - h.side * Math.sin(a) * h.len; h.hy = h.py + Math.cos(a) * h.len; h.a = a;
        if (Math.hypot(this.pos.x - h.hx, cy - h.hy) < 38) this.bonk(this.pos.x, cy, 'THWACK', h.side * -300);
      } else if (h.type === 'patty') {
        h.t -= dt; if (h.t <= 0) { h.on = !h.on; h.t = h.on ? 1.3 : 1.6; if (h.on && Math.abs(h.y - this.pos.y) < H) Sound.sfx('squelch'); }
        if (h.on && Math.random() < dt * 22) this.drops.push({ x: h.x - h.side * (14 + Math.random() * 40), y: h.y + 14, vy: 120 + Math.random() * 60 });
      } else if (h.type === 'smoke' && Math.hypot(this.pos.x - h.x, cy - h.y) < h.r && !boosting) { this.vel.y = Math.max(150, this.vel.y - 1000 * dt); this.vel.x += Math.sin(this.t * 3 + h.ph) * 300 * dt; }
    }
    for (let i = this.drops.length - 1; i >= 0; i--) {                    // grease drops: slick you off the line
      const d = this.drops[i]; d.vy += 500 * dt; d.y += d.vy * dt;
      if (d.y > this.pos.y + H || d.y < cam.scrollY - 100) { this.drops.splice(i, 1); continue; }
      if (Math.abs(d.x - this.pos.x) < 20 && Math.abs(d.y - cy) < 34) { this.drops.splice(i, 1); this.bonk(this.pos.x, cy, 'GREASED', (Math.random() < 0.5 ? -1 : 1) * 240); Sound.sfx('squelch'); }
    }
    // ---- bacon rats scuttling along the grates
    for (const R2 of this.rats) {
      R2.x += R2.v * dt; if (R2.x < R2.a || R2.x > R2.b) { R2.v = -R2.v; R2.x = Math.max(R2.a, Math.min(R2.b, R2.x)); }
      R2.im.setPosition(R2.x, R2.r.y - 2).setFlipX(R2.v < 0).setTexture(Math.floor(this.t * 12 + R2.a) % 2 ? 'ffbaconrat_b' : 'ffbaconrat');
      if (Math.abs(R2.x - this.pos.x) < 30 && Math.abs(R2.r.y - 14 - cy) < 40) this.bonk(this.pos.x, cy, 'NIBBLED', Math.sign(this.pos.x - R2.x || 1) * 260);
    }
    // ---- burnt sausages: roll off the grates ahead and tumble down
    this.sausT -= dt;
    if (this.sausT <= 0 && !this.done && this.sausages.length < 7) {
      this.sausT = (deep > 0.5 ? 0.9 : 1.6) + Math.random();
      const r = this.rows.find(q => q.y > this.pos.y + H * 0.35 && q.y < this.pos.y + H * 1.2 && !q.slide);
      if (r) { const sd = Math.random() < 0.5 ? -1 : 1; this.sausages.push({ x: sd < 0 ? 20 : SW - 20, y: r.y - 6, vx: -sd * (110 + Math.random() * 60), vy: 0, rot: 0, im: this.add.image(0, 0, 'ffsausage').setDepth(3.3).setScale(1.6) }); }
    }
    for (let i = this.sausages.length - 1; i >= 0; i--) {
      const S = this.sausages[i];
      S.vy += 900 * dt; S.x += S.vx * dt; const py = S.y; S.y += S.vy * dt; S.rot += S.vx / 14 * dt;
      if (S.x < 12 || S.x > SW - 12) { S.vx = -S.vx; S.x = Math.max(12, Math.min(SW - 12, S.x)); }
      for (const r of this.rows) if (py <= r.y - 6 && S.y >= r.y - 6 && !this.inGap(r, S.x, 10)) { S.y = r.y - 6; S.vy = 0; break; }
      S.im.setPosition(S.x, S.y).setRotation(S.rot);
      if (Math.abs(S.x - this.pos.x) < 28 && Math.abs(S.y - cy) < 34) { this.bonk(this.pos.x, cy, 'SAUSAGED', Math.sign(this.pos.x - S.x || 1) * 260); S.vy = -260; S.vx = -S.vx; }
      if (S.y < cam.scrollY - 200 || S.y > SH) { S.im.destroy(); this.sausages.splice(i, 1); }
    }
    // ---- grease flare-ups through the grates just ahead: a sizzle, then a sheet of flame up through the bars
    if (!this.done && Math.random() < dt * (deep > 0.5 ? 0.9 : 0.45) && this.flares.length < 3) {
      const r = this.rows.find(q => q.y > this.pos.y + 160 && q.y < this.pos.y + H * 0.9 && !q.slide && !q.sw);
      if (r) { const segs = this.solidSegs(r).filter(([a, b]) => b - a > 90); const s = segs[Math.floor(Math.random() * segs.length)]; if (s) { const w = Math.min(150, s[1] - s[0] - 20), x = s[0] + 10 + Math.random() * (s[1] - s[0] - 20 - w); this.flares.push({ r, x, w, st: 'warn', t: 0.7, hit: false }); Sound.sfx('hiss'); } }
    }
    for (let i = this.flares.length - 1; i >= 0; i--) {
      const F = this.flares[i]; F.t -= dt;
      if (F.t <= 0) { if (F.st === 'warn') { F.st = 'fire'; F.t = 0.55; Sound.sfx('fan'); } else { this.flares.splice(i, 1); continue; } }
      if (F.st === 'fire' && !F.hit && this.pos.x > F.x - 8 && this.pos.x < F.x + F.w + 8 && cy > F.r.y - 150 && cy < F.r.y + 10) { F.hit = true; this.vel.y = -260; this.penalty(this.pos.x, cy, 'FLAMBEED!'); }
    }
    // ---- the cheese trail: each bit is the next note up the scale while the chain lasts
    this.chainT -= dt; if (this.chainT <= 0) this.chain = 0;
    for (const c of this.trail) {
      if (c.got) continue;
      if (c.y < this.pos.y - 200 || c.y > this.pos.y + 220) continue;
      c.im.setScale(1.5 + 0.15 * Math.sin(this.t * 6 + c.ph)).setRotation(Math.sin(this.t * 3 + c.ph) * 0.15);
      if (!this.done && Math.abs(this.pos.x - c.x) < 34 && Math.abs(this.pos.y - c.y) < 40) {
        c.got = true; this.gotCheese++; this.chain++; this.chainT = 0.9;
        Sound.sfx('chime', this.chain);
        if (this.chain % 20 === 0) { this.timeLeft += 1; this.pop(c.x, c.y - 20, 'CHAIN ' + this.chain + '! +1s', '#7dff8a'); Sound.sfx('combo'); }
        this.puff(c.x, c.y, 7, 0xffd23f, 160, 0.35, 2.5); this.puff(c.x, c.y, 3, 0xffffff, 90, 0.2, 2);
        this.tweens.add({ targets: c.im, scale: 2.6, alpha: 0, y: c.y - 20, duration: 160, onComplete: () => c.im.destroy() });
      }
    }
    // ---- the bottom: grab the gun
    if (!this.done && this.pos.y >= SH - 20) { this.pos.y = SH - 20; this.vel.y = 0; this.cameras.main.shake(300, 0.015); this.puff(this.pos.x, SH - 20, 30, 0xff9a3a, 300, 0.6, 3); this.finish(this.gotCheese >= this.need, true); }
    if (!this.done && !(this.intro > 0)) { this.timeLeft -= dt; if (this.timeLeft <= 0) { this.timeLeft = 0; this.finish(false, false); } }
    this.timeTxt.setText(String(Math.ceil(this.timeLeft))).setColor(this.timeLeft < 10 && Math.floor(this.t * 4) % 2 ? '#ff5a3a' : '#ffd23f');
    { const deep2 = Math.min(1, deep), ok = this.gotCheese >= this.need;
      (this.goalHud || (this.goalHud = new GoalHud(this))).update([
        { label: 'CHEESE TRAIL', frac: this.gotCheese / this.need, right: this.gotCheese + '/' + this.need, done: ok },
        { label: 'DIVE TO THE BOTTOM', frac: deep2, right: Math.round(deep2 * 100) + '%', done: this.done && ok },
        { label: 'BEFORE THE CLOCK', frac: this.timeLeft / this.timeMax, right: Math.ceil(this.timeLeft) + 's', hot: this.timeLeft < 8 }]); }
    this.gotTxt.setText('CHEESE ' + this.gotCheese + ' / ' + this.need + (this.gotCheese >= this.need ? '  CAGE OPEN!' : ' TO OPEN THE CAGE') + (this.chain > 2 ? '   x' + this.chain : '')).setColor(this.gotCheese >= this.need ? '#7dff8a' : '#ffffff');
    if (this.gotCheese >= this.need && !this.cageOpen) { this.cageOpen = true; Sound.sfx('shine'); this.pop(this.pos.x, this.pos.y + 40, 'CAGE OPEN!', '#7dff8a'); }

    // ---- camera: Chris in the upper third, looking further ahead the faster he falls
    // (the faster you go, the further ahead the camera looks; braking lets it settle back)
    const lead = this.done ? 0 : Math.min(130, Math.max(0, this.vel.y - 150) * 0.28);
    this.zoomK = 1; cam.scrollX = SW / 2 - W / 2;
    const ty = this.pos.y - H * 0.32 + lead;
    cam.scrollY += (ty - cam.scrollY) * Math.min(1, dt * 7);
    const viewTop = cam.scrollY + H / 2 - H / 2 / this.zoomK, viewH = H / this.zoomK;

    // ---- draw
    this.drawSlidingGrates();
    const dg = this.dynG; dg.clear();
    const sm = this.smokeG || (this.smokeG = this.add.graphics().setDepth(4.6)); sm.clear();
    for (const h of this.haz) {
      if (Math.abs(h.y - this.pos.y) > H * 1.3) { if (h.im) h.im.setVisible(false); if (h.arm) h.arm.setVisible(false); continue; }
      if (h.type === 'spin') {
        if (!h.im) h.im = this.add.image(h.x, h.y, 'ffskewer').setDepth(3.1).setScale(2 * h.len / 150, 2);
        h.im.setVisible(true).setRotation(h.ang);
        dg.fillStyle(0x1a1012, 1).fillCircle(h.x, h.y, 12); dg.fillStyle(0x6a7080, 1).fillCircle(h.x, h.y, 9); dg.fillStyle(0xd8dce6, 1).fillCircle(h.x - 2, h.y - 2, 3);
      } else if (h.type === 'swing' && h.hx !== undefined) {
        dg.lineStyle(12, 0x1a1012, 1).lineBetween(h.px, h.py, h.hx, h.hy); dg.lineStyle(7, 0x8a5a2a, 1).lineBetween(h.px, h.py, h.hx, h.hy); dg.lineStyle(2, 0xc88a4a, 1).lineBetween(h.px, h.py - 2, h.hx, h.hy - 2);
        if (!h.im) h.im = this.add.image(0, 0, 'ffspatula').setOrigin(0.05, 0.5).setDepth(3.1).setScale(1.7);
        h.im.setVisible(true).setPosition(h.hx, h.hy).setRotation(Math.atan2(h.hy - h.py, h.hx - h.px));
        dg.fillStyle(0x3a3e48, 1).fillCircle(h.px, h.py, 14); dg.fillStyle(0x8a94a6, 1).fillCircle(h.px, h.py, 8);
      } else if (h.type === 'patty') {
        if (!h.im) h.im = this.add.image(h.x, h.y, 'ffpatty').setDepth(3.15).setScale(2).setFlipX(h.side > 0).setRotation(h.side * 0.15);
        h.im.setVisible(true).setScale(2 + (h.on ? Math.sin(this.t * 20) * 0.05 : 0));
        if (h.on) { dg.fillStyle(0xd8b050, 0.5).fillRect(h.x - h.side * 12 - 2, h.y + 10, 4, 12); }
      } else if (h.type === 'smoke') {
        for (let k2 = 0; k2 < 9; k2++) { const a = this.t * 0.5 + k2 * 0.7 + h.ph, rr = h.r * (0.35 + 0.45 * ((k2 * 37) % 10) / 10); sm.fillStyle(k2 % 2 ? 0x4a4248 : 0x6a6268, 0.38).fillCircle(h.x + Math.cos(a) * rr * 0.6, h.y + Math.sin(a * 1.3) * rr * 0.5, h.r * 0.5); }
      }
    }
    for (const d of this.drops) { dg.fillStyle(0x1a1012, 1).fillEllipse(d.x, d.y, 9, 14); dg.fillStyle(0xe8c860, 1).fillEllipse(d.x, d.y, 6, 11); dg.fillStyle(0xfff4c0, 1).fillRect(d.x - 1, d.y - 3, 2, 2); }
    const g = this.fxG; g.clear();
    for (const r of this.rows) if (Math.abs(r.y - this.pos.y) < H * 1.5) {
      if (r.hot) { g.fillStyle(0xff5a1a, 0.22 + 0.1 * Math.sin(this.t * 6 + r.y)).fillRect(0, r.y - 30, SW, 50); for (let q = 0; q < 3; q++) { const hx = (this.t * 60 + q * 200 + r.y) % SW; g.fillStyle(0xffd23f, 0.12).fillEllipse(hx, r.y - 20 - (this.t * 40 + q * 13) % 40, 30, 8); } }   // heat shimmer
      const gp = this.gapsAt(r, this.t)[0]; if (gp) { const a = (this.chain > 4 ? 0.2 : 0.12) + 0.06 * Math.sin(this.t * 4 + r.y); g.fillStyle(0xffb030, a).fillEllipse(gp.x + gp.w / 2, r.y + 8, gp.w * 0.9, 34); g.fillStyle(0xfff0a0, a).fillEllipse(gp.x + gp.w / 2, r.y + 8, gp.w * 0.5, 14); }   // the way through glows from below
    }
    for (const c of this.trail) if (!c.got && Math.abs(c.y - this.pos.y) < H) g.fillStyle(c.sw ? 0x39c6ff : 0xffd23f, (c.sw ? 0.35 : 0.2) + (this.chain > 4 ? 0.15 : 0)).fillCircle(c.x, c.y, c.sw ? 15 : 13);
    for (const F of this.flares) {
      if (F.st === 'warn') { g.fillStyle(0xff7a1a, 0.3 + 0.3 * Math.sin(this.t * 40)).fillRect(F.x, F.r.y - 10, F.w, 16); if (Math.random() < 0.5) this.fx.push({ x: F.x + Math.random() * F.w, y: F.r.y - 6, vx: 0, vy: -80, life: 0.3, max: 0.3, col: 0xffd23f, size: 2 }); }
      else for (let q = 0; q < 10; q++) { const u = q / 10, x = F.x + F.w * ((q * 0.37 + this.t * 3) % 1), hh = 140 * (0.6 + 0.4 * Math.sin(this.t * 30 + q)); g.fillStyle(q % 3 ? 0xff7a1a : 0xffd23f, 0.7).fillEllipse(x, F.r.y - hh / 2, 26, hh); g.fillStyle(0xffffff, 0.5).fillEllipse(x, F.r.y - hh * 0.25, 10, hh * 0.4); }
    }
    for (const v of this.vents) {
      if (Math.abs(v.y - this.pos.y) > H * 1.5) continue;
      const x0 = v.side < 0 ? 0 : SW;
      if (v.st === 'warn') { g.fillStyle(0xff7a1a, 0.3 + 0.3 * Math.sin(this.t * 30)).fillCircle(x0, v.y, 30); if (Math.random() < 0.4) this.fx.push({ x: x0 - v.side * 10, y: v.y + (Math.random() - 0.5) * 30, vx: -v.side * 60, vy: -40, life: 0.4, max: 0.4, col: 0xffa020, size: 2 }); }
      if (v.st === 'fire') for (let i = 0; i < 12; i++) {
        const u = i / 12, len = 270 * (0.85 + 0.15 * Math.sin(this.t * 40 + i)), x = x0 - v.side * len * u, r = 16 + 22 * u;
        g.fillStyle(u < 0.25 ? 0xffffff : u < 0.55 ? 0xffd23f : 0xff5a1a, 0.8 - u * 0.45).fillCircle(x, v.y + Math.sin(this.t * 30 + i) * 6 * u, r);
      }
    }
    // embers streaming up, more the deeper you go; jet flame; wind off his boots
    if (Math.random() < dt * (14 + 60 * deep)) this.fx.push({ x: Math.random() * SW, y: viewTop + viewH + 10, vx: (Math.random() - 0.5) * 40, vy: -90 - Math.random() * 140, life: 3, max: 3, col: Math.random() < 0.5 ? 0xff7a1a : 0xffd23f, size: 2 + Math.random() * 1.5 });
    if (boosting && Math.random() < dt * 50) this.fx.push({ x: this.pos.x + (Math.random() - 0.5) * 10, y: this.pos.y - 92, vx: (Math.random() - 0.5) * 50, vy: -200, life: 0.35, max: 0.35, col: 0xffa21a, size: 4 });
    if (plunge && Math.random() < dt * 40) { const sd = Math.random() < 0.5 ? 0 : SW; this.fx.push({ x: sd + (sd ? -1 : 1) * Math.random() * 60, y: viewTop + viewH * Math.random(), vx: (sd ? -1 : 1) * 80, vy: -260, life: 0.6, max: 0.6, col: 0xff7a1a, size: 6 }); }
    for (let i = this.fx.length - 1; i >= 0; i--) {
      const q = this.fx[i]; q.life -= dt; if (q.life <= 0) { this.fx.splice(i, 1); continue; }
      q.x += q.vx * dt; q.y += q.vy * dt; const k2 = q.life / q.max;
      g.fillStyle(q.col, k2 * 0.9).fillCircle(q.x, q.y, q.size * (0.5 + k2));
    }
    // SPEED LINES: streaks rushing up past the screen, thicker and more of them the faster you're going
    const lg = this.lineG; lg.clear();
    const spd = Math.max(0, this.vel.y - 200) / 560, nL = Math.floor(spd * spd * 26 + (plunge ? 10 : 0));
    for (let i = 0; i < nL; i++) {
      const sx = ((i * 97.13 + Math.floor(this.t * 9 + i * 0.37) * 53.7) % (SW + 300)) - 150, ph = (this.t * (2.2 + spd * 2) + i * 0.137) % 1;
      const y = viewTop + viewH * (1 - ph), len = 40 + 160 * spd;
      lg.lineStyle(i % 4 ? 1.5 : 3, plunge && i % 2 ? 0xffa060 : 0xffffff, (0.15 + 0.35 * spd) * Math.sin(ph * Math.PI)).lineBetween(sx, y, sx, y + len);
    }
    // the lid's daylight up above, shrinking away; smoke drifting behind and in front; the heat haze over everything
    const vy = 300 - cam.scrollY * 0.5;                                     // daylight from the lid's vent, way up above, fading as you drop
    this.vent.setVisible(false);
    this.ventGlow.setPosition(W / 2, Math.min(0, vy - 300)).setScale(10, 5).setAlpha(Math.max(0, 0.45 - Math.max(0, -vy) / 900)).setVisible(vy > -400);
    for (const s of this.smokeB) { s.x += s.v * dt; const yy = viewTop + (((s.y * 2400 - cam.scrollY * 0.45) % (viewH + 600)) + viewH + 600) % (viewH + 600) - 300; s.im.setPosition(s.x, yy).setScale(s.s).setTint(deep > 0.6 ? 0x3a1a14 : 0x2a2a2e); if (s.x < -200) s.x = SW + 200; if (s.x > SW + 200) s.x = -200; }
    for (const s of this.smokeF) { s.x += s.v * dt; const yy = viewTop + (((s.y * 3000 - cam.scrollY * 1.35) % (viewH + 800)) + viewH + 800) % (viewH + 800) - 400; s.im.setPosition(s.x, yy).setScale(s.s); if (s.x < -300) s.x = SW + 300; if (s.x > SW + 300) s.x = -300; }
    this.heat.setFillStyle(0xff3a08, Math.min(0.26, 0.18 * deep * deep + (plunge ? 0.05 + 0.04 * Math.sin(this.t * 13) : 0)));
    if (plunge) { this.roarT -= dt; if (this.roarT <= 0) { this.roarT = 0.9; Sound.sfx('fan'); } }
    // the coals breathe; flames lick up off them
    if (Math.abs(this.pos.y - SH) < H * 2) {
      for (const c of this.coals) c.im.setTint(Phaser.Display.Color.GetColor(255, 150 + Math.floor(70 * Math.sin(this.t * 2 + c.ph)), 120 + Math.floor(60 * Math.sin(this.t * 2 + c.ph))));
      for (const F of this.flames) F.im.setTexture('ffflame' + (Math.floor(this.t * F.sp + F.ph) % 3)).setScale(2.2 + 0.5 * Math.sin(this.t * 7 + F.ph), 2.2 + 0.9 * Math.sin(this.t * 5 + F.ph));
    }
    g.fillStyle(0xff4a1a, 0.3 + 0.12 * Math.sin(this.t * 3)).fillRect(-200, SH - 80, SW + 400, 90);
    // the prize gun bobs over the stone
    this.cage.clear();
    if (!this.cageOpen && !this.done) { const cx = SW / 2, cy2 = this.gunY; this.cage.lineStyle(5, 0x1a1020, 1).strokeRect(cx - 54, cy2 - 40, 108, 80); for (let x = cx - 42; x <= cx + 42; x += 14) { this.cage.lineStyle(5, 0x1a1020, 1).lineBetween(x, cy2 - 40, x, cy2 + 40); this.cage.lineStyle(2, 0xa8b0c0, 1).lineBetween(x, cy2 - 40, x, cy2 + 40); } }
    if (!this.done) { this.gunImg.setY(this.gunY + Math.sin(this.t * 2) * 8).setRotation(Math.sin(this.t * 1.3) * 0.2); this.gunGlow.setY(this.gunImg.y).setAlpha(0.4 + 0.2 * Math.sin(this.t * 4)); }
    // Chris DIVING: head first, feet up, arms reaching down. Braking he swings round flat, belly down, and his cape
    // stretches out wide either side of him like a wingsuit, flapping like mad; boosting, the boots fire upwards.
    P.thrusting = false; P.vh = -this.vel.y; P.h = 60; P.vx = this.vel.x * 0.5;
    const wk = this.wingK || 0;
    if (this.faceS === undefined) this.faceS = 1;
    if (braking && !this.wingWas) this.faceS = Math.abs(this.vel.x) > 30 ? Math.sign(this.vel.x) : (ax ? Math.sign(ax) : this.faceS);
    else if (braking && ax && Math.sign(ax) !== this.faceS) { this.faceS = Math.sign(ax); Sound.sfx('swish'); this.puff(this.pos.x, this.pos.y - 40, 6, 0xffffff, 140, 0.25, 2); }
    this.wingWas = braking;
    this.rig.setFace(this.penaltyT > 0 ? null : boosting ? 'c_head_fire' : (braking || this.vel.y > 500) ? 'c_head_puff' : null);   // gritted teeth boosting; cheeks blown out by the wind
    const sgn = this.faceS, bank = Math.max(-0.5, Math.min(0.5, this.vel.x / 560));
    const Lt = Math.PI - bank * sgn * (1 - wk) - Math.PI / 2 * wk + (wk > 0.5 ? Math.sin(this.t * 13) * 0.08 : 0) + Math.sin(this.t * 23) * 0.03 * spd;
    this.poseL = this.poseL === undefined ? Lt : this.poseL + (Lt - this.poseL) * Math.min(1, dt * 10);
    const rot = this.poseL * sgn;
    const rx = this.pos.x - 40 * Math.sin(rot), ry = this.pos.y - 40 + 40 * Math.cos(rot);
    this.rig.update(P, dt, Math.round(rx), Math.round(ry), 1, this.penaltyT > 0 && Math.floor(this.t * 20) % 2 ? 0.4 : 1, 0);
    this.rig.root.setRotation(rot);
    this.squash = Math.max(0, this.squash - dt * 5);
    const sy = Math.abs(this.rig.root.scaleY), sq = this.squash;
    this.rig.root.setScale(sy * sgn * (1 + 0.3 * sq), sy * (1 - 0.25 * sq));
    // the wind tearing at him: the hat flapping on its spring, the arms shaking
    this.rig.hat.rotation += Math.sin(this.t * 34) * (0.08 + 0.18 * spd); this.rig.hat.y += Math.sin(this.t * 29) * 2 * spd;
    this.rig.armB.setRotation(-2.2 * (1 - wk) + (-1.3 + Math.sin(this.t * 18) * 0.25) * wk + Math.sin(this.t * 10 + spd * 6) * (0.1 + 0.12 * spd));
    if (wk > 0.05) {
      this.rig.capeS.forEach((c, i) => {
        const fl = Math.sin(this.t * 20 + i * 1.3);
        c.setPosition(-2 + fl * 1.5 * wk, -58 + i * 11).setRotation(fl * 0.05 * wk).setScale(1 + 2.1 * wk * (1 + 0.12 * fl), 1 + 0.35 * wk);
      });
      if (Math.random() < dt * 30) this.fx.push({ x: this.pos.x + (Math.random() - 0.5) * 70, y: this.pos.y - 20, vx: 0, vy: -200, life: 0.25, max: 0.25, col: 0xffffff, size: 1.5 });
    } else this.rig.capeS.forEach((c, i) => { const fl = Math.sin(this.t * 26 + i * 1.7); c.setScale(1 + 0.15 * spd * fl, 1 + 0.3 * spd); });
    if (boosting) { const jx = this.pos.x, jy = this.pos.y - 92, fl = 1 + 0.3 * Math.sin(this.t * 40); g.fillStyle(0xff7a1a, 0.9).fillTriangle(jx - 8, jy, jx + 8, jy, jx, jy - 40 * fl); g.fillStyle(0xffe27a, 1).fillTriangle(jx - 4, jy, jx + 4, jy, jx, jy - 22 * fl); }
    // depth meter + jet fuel (right edge)
    const dgh = this.depthG; dgh.clear();
    const mx = W - 18, my = 60, mh = H - 120;
    dgh.fillStyle(0x1a1020, 0.8).fillRect(mx - 4, my - 4, 12, mh + 8); dgh.fillStyle(0x3a2030, 1).fillRect(mx - 1, my, 6, mh);
    dgh.fillStyle(0xff7a1a, 1).fillRect(mx - 1, my, 6, mh * Math.min(1, deep));
    dgh.fillStyle(0xffffff, 1).fillRect(mx - 4, my + mh * Math.min(1, deep) - 2, 12, 4);
    dgh.fillStyle(0x1a1020, 0.8).fillRect(mx - 26, my - 4, 12, mh * 0.4 + 8); dgh.fillStyle(0x39c6ff, 1).fillRect(mx - 23, my + mh * 0.4 * (1 - this.fuel), 6, mh * 0.4 * this.fuel);
  }

  finish(won, bottom) {
    if (this.done) return;
    this.done = true; this.doneT = this.t;
    let body;
    if (won) {
      Sound.sfx('power'); Sound.music('win'); Sound.say('woohoo', { force: true });
      if (this.prize) { Progress.giveGun(this.prize.id); body = 'GOT IT!\n\nNEW GUN: ' + this.prize.name; }
      else { const lives = Math.min(CFG.maxLives, (this.registry.get('lives') || CFG.startLives) + 1); this.registry.set('lives', lives); body = 'MADE IT TO THE BOTTOM!\n\n+1 LIFE'; }
      body += '\n\nCHEESE ' + this.gotCheese + ' / ' + this.trail.length + '   (' + Math.ceil(this.timeLeft) + 's TO SPARE)';
      this.puff(this.gunImg.x, this.gunImg.y, 40, 0xffd23f, 320, 0.8, 4);
      this.tweens.add({ targets: this.gunImg, y: this.gunY - 90, scale: 3, angle: 360, duration: 800, ease: 'Back.out' });
    } else if (bottom) { Sound.music('lose'); body = 'THE CAGE IS STILL SHUT!\n\nCHEESE ' + this.gotCheese + ' / ' + this.need + ': FOLLOW THE TRAIL'; }
    else { Sound.music('lose'); body = 'OUT OF TIME!\n\nSO CLOSE TO THE BOTTOM...'; }
    const W = this.scale.width, H = this.scale.height, D = 30;
    this.add.rectangle(0, 0, W, H, 0x000000, 0.55).setOrigin(0).setScrollFactor(0).setDepth(D);
    this.add.text(W / 2, H * 0.22, won ? 'BONUS CLEAR!' : bottom ? 'SO CLOSE!' : 'TIME UP', { fontFamily: PIXEL, fontSize: '22px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 6 }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1);
    this.add.text(W / 2, H * 0.34, body, { fontFamily: PIXEL, fontSize: '10px', color: '#ffffff', align: 'center', lineSpacing: 8 }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(D + 1);
    const pad = typeof inputDevice === 'function' && inputDevice() === 'pad';
    const btn = (x, label, fn, col) => {
      const b = this.add.text(x, H * 0.8, label, { fontFamily: PIXEL, fontSize: '11px', color: '#1a1020', backgroundColor: col, padding: { x: 12, y: 10 } }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 2).setInteractive({ useHandCursor: true });
      b.on('pointerup', () => { if (this.t - this.doneT > 0.5) fn(); });
    };
    btn(W / 2 - 80, pad ? 'A: MAP' : 'MAP', () => this.leave(), '#ffd23f');
    btn(W / 2 + 80, pad ? 'X: AGAIN' : 'AGAIN', () => this.again(), '#ffb07a');
    this.exitBtn.setVisible(false);
  }
  again() { if (this.leaving) return; this.leaving = true; this.cameras.main.fadeOut(200, 0, 0, 0); this.time.delayedCall(220, () => this.scene.restart()); }
  leave() { if (this.leaving) return; this.leaving = true; this.cameras.main.fadeOut(250, 0, 0, 0); this.time.delayedCall(280, () => this.scene.start('select')); }
}
