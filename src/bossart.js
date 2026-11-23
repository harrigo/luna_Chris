// ================================================================= BOSS ART (v3.91)
// A small painter for big hand-drawn-looking sprites, and the bosses redrawn with it.
//
// BA.paint(scene, key, w, h, shapes, opts): shapes are drawn in order (later = in front). Each one is shaded as a round
// form lit from the top-left, quantised onto its colour ramp with a narrow dithered seam between tones (the 90s cartoon
// look: flat cel tones, soft edges between them), and outlined: a 1px dark ink line round the whole silhouette, and a
// line in the shape's own darkest tone wherever it overlaps something behind it. Shapes:
//   { e: [cx, cy, rx, ry], r: ramp }                  an ellipse (rot: radians)
//   { p: [[x, y], ...], r: ramp, bulge }              a polygon, shaded like a rounded slab (bulge 0..1, default 0.6)
//   { l: [[x, y], ...], c: colour, w: width }         a stroke (drawn after the shapes it follows, no shading)
//   { d: [[x, y], ...], c: colour }                   single pixels
// Coordinates are in WORLD units; opts.s scales them up (draw finer than 1 px per unit; the texture is then listed in
// TEX_DENS so it shows at the right size). opts.ox, opts.oy shift everything (so negative coordinates fit).
const BA = (() => {
  const INK = 0x1a1020;
  const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const hash = (x, y) => { let n = x * 374761393 + y * 668265263; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) & 1023) / 1023; };
  function inPoly(P, x, y) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
  function edgeDist(P, x, y) { let d = 1e9; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [ax, ay] = P[j], [bx, by] = P[i], dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1))); d = Math.min(d, Math.hypot(x - ax - t * dx, y - ay - t * dy)); } return d; }
  function paint(scene, key, w, h, shapes, opts) {
    opts = opts || {};
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const S = opts.s || 1, ox = opts.ox || 0, oy = opts.oy || 0, W = Math.ceil(w * S), H = Math.ceil(h * S);
    const col = new Int32Array(W * H).fill(-1), id = new Int16Array(W * H).fill(-1);
    const L = opts.light || [-0.55, -0.7];
    shapes.forEach((sh, si) => {
      if (sh.l || sh.d) return;
      const r = sh.r, n = r.length;
      let bx0, by0, bx1, by1, inside, lum;
      if (sh.e) {
        const [cx, cy, rx, ry] = sh.e, rot = sh.rot || 0, cr = Math.cos(rot), sr = Math.sin(rot);
        const R = Math.max(rx, ry); bx0 = cx - R; bx1 = cx + R; by0 = cy - R; by1 = cy + R;
        const loc = (x, y) => { const dx = x - cx, dy = y - cy; return [(dx * cr + dy * sr) / rx, (-dx * sr + dy * cr) / ry]; };
        inside = (x, y) => { const [u, v] = loc(x, y); return u * u + v * v <= 1; };
        lum = (x, y) => { const [u, v] = loc(x, y), z = Math.sqrt(Math.max(0, 1 - u * u - v * v)); const ux = u * cr - v * sr, vy = u * sr + v * cr; return 0.5 + 0.62 * (L[0] * ux + L[1] * vy) * 0.9 + 0.32 * (z - 0.5); };
      } else {
        const P = sh.p; bx0 = Math.min(...P.map(q => q[0])); bx1 = Math.max(...P.map(q => q[0])); by0 = Math.min(...P.map(q => q[1])); by1 = Math.max(...P.map(q => q[1]));
        const cx = (bx0 + bx1) / 2, cy = (by0 + by1) / 2, hw = Math.max(1, (bx1 - bx0) / 2), hh = Math.max(1, (by1 - by0) / 2), bulge = sh.bulge === undefined ? 0.6 : sh.bulge, ew = Math.max(2, Math.min(hw, hh) * 0.55);
        inside = (x, y) => inPoly(P, x, y);
        lum = (x, y) => { const e = Math.min(1, edgeDist(P, x, y) / ew), u = (x - cx) / hw, v = (y - cy) / hh; return 0.52 + 0.4 * (L[0] * u + L[1] * v) * 0.85 + bulge * 0.3 * (e - 0.6); };
      }
      const lift = sh.lift || 0;
      for (let Y = Math.max(0, Math.floor((by0 + oy) * S) - 1); Y <= Math.min(H - 1, Math.ceil((by1 + oy) * S) + 1); Y++)
        for (let X = Math.max(0, Math.floor((bx0 + ox) * S) - 1); X <= Math.min(W - 1, Math.ceil((bx1 + ox) * S) + 1); X++) {
          const x = (X + 0.5) / S - ox, y = (Y + 0.5) / S - oy;
          if (!inside(x, y)) continue;
          let v = Math.max(0, Math.min(0.999, lum(x, y) + lift + (hash(X, Y) - 0.5) * (sh.grain === undefined ? 0.06 : sh.grain)));
          const f = (1 - v) * (n - 0.001), b = Math.floor(f), fr = f - b, t = B4[(Y & 3) * 4 + (X & 3)] / 16;
          const k = Math.min(n - 1, fr > 0.38 && fr < 0.62 ? (fr - 0.38) / 0.24 > t ? b + 1 : b : (fr >= 0.62 ? b + 1 : b));   // flat tones, a dithered seam between them
          col[Y * W + X] = r[Math.min(n - 1, k)]; id[Y * W + X] = si;
        }
    });
    // lines: the silhouette in ink, and each shape's edge over whatever is behind it in its own darkest tone
    const out = col.slice();
    for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
      const i = Y * W + X, me = id[i]; if (me < 0 || shapes[me].noLine) continue;
      let edge = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const x2 = X + dx, y2 = Y + dy, o = (x2 < 0 || y2 < 0 || x2 >= W || y2 >= H) ? -1 : id[y2 * W + x2];
        if (o < 0) { edge = 2; break; }
        if (o < me && !shapes[me].soft) edge = Math.max(edge, 1);
      }
      if (edge === 2) out[i] = opts.ink === undefined ? INK : opts.ink;
      else if (edge === 1) { const r = shapes[me].r; out[i] = r[r.length - 1]; }
    }
    // strokes and pixels on top
    const put = (x, y, c) => { const X = Math.round((x + ox) * S - 0.5), Y = Math.round((y + oy) * S - 0.5); if (X >= 0 && Y >= 0 && X < W && Y < H) out[Y * W + X] = c; };
    for (const sh of shapes) {
      if (sh.d) for (const [x, y] of sh.d) put(x, y, sh.c);
      if (sh.l) {
        const P = sh.l, wd = sh.w || 1;
        for (let k = 0; k < P.length - 1; k++) {
          const [ax, ay] = P[k], [bx, by] = P[k + 1], len = Math.hypot(bx - ax, by - ay), n = Math.ceil(len * S * 2);
          for (let i = 0; i <= n; i++) { const x = ax + (bx - ax) * i / n, y = ay + (by - ay) * i / n;
            for (let q = -(wd - 1) / 2; q <= (wd - 1) / 2 + 0.01; q += 1 / S) for (let q2 = -(wd - 1) / 2; q2 <= (wd - 1) / 2 + 0.01; q2 += 1 / S) put(x + q, y + q2, sh.c); }
        }
      }
    }
    const t = scene.textures.createCanvas(key, W, H), ctx = t.getContext(), img = ctx.createImageData(W, H), D = img.data;
    for (let i = 0; i < W * H; i++) { const c = out[i]; if (c < 0) continue; D[i * 4] = (c >> 16) & 255; D[i * 4 + 1] = (c >> 8) & 255; D[i * 4 + 2] = c & 255; D[i * 4 + 3] = 255; }
    ctx.putImageData(img, 0, 0); t.refresh(); t.setFilter(Phaser.Textures.FilterMode.NEAREST);
    if (S !== 1 && typeof TEX_DENS !== 'undefined') TEX_DENS[key] = S;
    return { w: W, h: H, ox, oy, s: S };
  }
  return { paint, INK };
})();

// ---------------------------------------------------------------- THE GRAND PALADIN (Lactose Labyrinth, "the Milkmaster")
// A rat knight in milk-white enamel plate, riding a hovering steel milk churn that jets milk vapour. A raised visor shows a
// snarling rat face; a red plume, a tattered red cape, a great broadsword and a kite shield with a cheese-wedge on it.
// Rigged from parts so he moves: bobs on the churn, the cape and plume stream, the tail lashes, the sword arm hauls back
// before each sword wave and slashes through, the shield comes up and he leans in for the charge.
const GP_S = 1.12;                // drawn at the boss's display scale: one art pixel per world unit, like Chris
const GP_RAMP = {
  steel: [0xf4f6ff, 0xc8d0e4, 0x8e9ab8, 0x5a6482, 0x323a52],
  gold: [0xfff2a0, 0xffd23f, 0xd09a1a, 0x8a5a0a],
  red: [0xff7a5a, 0xe03a2a, 0xa01a1a, 0x5a0a14],
  fur: [0xe0c8b8, 0xb09080, 0x7a5e5a, 0x463440],   // warm, so the face stands out from the steel
  pink: [0xffc0c8, 0xf08aa0, 0xb85a78],
  cheese: [0xfff0a0, 0xffd23f, 0xe09a20],
  dark: [0x4a3a56, 0x2a1e38, 0x1a1020],
  milk: [0xffffff, 0xe8f0ff, 0xb8c8e8]
};
function makeGrandPaladinTextures(scene) {
  if (scene.textures.exists('gp_body') && scene.textures.exists('gp_head_hurt')) return;
  const R = GP_RAMP, S = GP_S;
  // the churn he rides (centre at its middle)
  BA.paint(scene, 'gp_churn', 56, 52, [
    { p: [[-18, -20], [18, -20], [22, -10], [22, 14], [16, 22], [-16, 22], [-22, 14], [-22, -10]], r: R.steel },
    { p: [[-23, -6], [23, -6], [23, -1], [-23, -1]], r: R.gold, bulge: 0.2 },
    { p: [[-23, 10], [23, 10], [23, 14], [-23, 14]], r: R.gold, bulge: 0.2 },
    { e: [-23, -12, 4, 6], r: R.steel }, { e: [23, -12, 4, 6], r: R.steel },
    { p: [[-8, 22], [8, 22], [6, 26], [-6, 26]], r: R.dark },
    { l: [[-12, -16], [-14, 18]], c: 0xffffff, w: 1 }
  ], { s: S, ox: 28, oy: 24 });
  // the body: breastplate, pauldrons, the red tabard with its cheese wedge
  BA.paint(scene, 'gp_body', 84, 66, [
    { e: [0, 2, 26, 24], r: R.steel },
    { p: [[-14, -4], [14, -4], [16, 24], [0, 30], [-16, 24]], r: R.red, bulge: 0.4 },
    { p: [[-6, 4], [7, 9], [-6, 15]], r: R.cheese, bulge: 0.2 },
    { d: [[-3, 8], [-1, 11]], c: 0xe09a20 },
    { e: [-26, -14, 15, 12], r: R.steel, rot: -0.3 },
    { e: [26, -14, 15, 12], r: R.steel, rot: 0.3 },
    { l: [[-36, -10], [-18, -22]], c: 0xd09a1a, w: 1.5 }, { l: [[36, -10], [18, -22]], c: 0xd09a1a, w: 1.5 },
    { e: [0, -20, 9, 5], r: R.steel }
  ], { s: S, ox: 42, oy: 34 });
  // the head: a rat in a helmet with the visor up. f: 0 snarl, 1 roar, 2 hurt
  const dome = []; for (let a = Math.PI; a <= 2 * Math.PI + 0.01; a += Math.PI / 12) dome.push([Math.cos(a) * 21, -5 + Math.sin(a) * 17]);
  dome.push([21, -3], [10, -2], [6, 4], [2, -2], [-21, -3]);           // the helmet: a cap down to the brow, with a nasal guard
  const head = (key, f) => BA.paint(scene, key, 84, 64, [
    { e: [-13, -22, 7, 11], r: R.fur, rot: -0.3 }, { e: [-12, -21, 3.5, 7], r: R.pink, rot: -0.3, noLine: true },   // ears out through the helmet
    { e: [13, -23, 7, 11], r: R.fur, rot: 0.3 }, { e: [12, -22, 3.5, 7], r: R.pink, rot: 0.3, noLine: true },
    { e: [0, 4, 19, 16], r: R.fur },                                                    // the head
    { p: [[2, -2], [26, 2], [38, 8], [36, 14], [24, 17], [4, 16]], r: R.fur },          // a long rat snout
    { e: [38, 9, 4.5, 4], r: R.pink },                                                  // nose
    f === 1 ? { p: [[10, 12], [33, 14], [30, 24], [12, 22]], r: [0x8a1a2a, 0x5a0a14, 0x2a0410] } : { p: [[12, 13], [32, 14], [28, 17], [13, 17]], r: [0x5a0a14, 0x2a0410] },   // mouth
    f === 1 ? { d: [[14, 13], [17, 13], [20, 14], [23, 14], [26, 14], [29, 15], [15, 22], [19, 22], [23, 22], [27, 21]], c: 0xfff8e0 } : { d: [[16, 14], [19, 14], [22, 15], [25, 15], [28, 15]], c: 0xfff8e0 },
    f === 2 ? { l: [[8, 1], [16, 4], [8, 7]], c: 0x1a1020, w: 1.5 } : { e: [12, 3, 6, 5.5], r: [0xffffff, 0xe8e0f0] },          // a big eye
    f === 2 ? { d: [] } : { e: [14, 4, 2.6, 2.6], r: [0xff3a2a, 0xa01a1a] },
    f === 2 ? { d: [] } : { d: [[13, 2]], c: 0xffffff },
    { p: dome, r: R.steel },
    { l: [[4, f === 1 ? -3 : -1], [20, f === 1 ? 1 : 0]], c: 0x1a1020, w: 2 },          // the brow, furious
    { l: [[-16, -8], [-4, -12]], c: 0xffffff, w: 1 },                                   // shine on the helmet
    { l: [[36, 12], [48, 8]], c: 0xe8e0f0, w: 1 }, { l: [[36, 13], [48, 16]], c: 0xe8e0f0, w: 1 }   // whiskers
  ], { s: S, ox: 30, oy: 36 });
  head('gp_head', 0); head('gp_head_roar', 1); head('gp_head_hurt', 2);
  // the plume (base at 0,0)
  BA.paint(scene, 'gp_plume', 40, 34, [
    { p: [[-2, 0], [2, 0], [-2, -14], [-12, -24], [-22, -26], [-12, -20], [-8, -12]], r: R.red, bulge: 0.5 },
    { p: [[0, 0], [4, -2], [6, -16], [-2, -26], [-8, -28], [-2, -18]], r: R.red, bulge: 0.5 }
  ], { s: S, ox: 26, oy: 31 });
  // the cape (hangs from 0,0)
  BA.paint(scene, 'gp_cape', 56, 70, [
    { p: [[-10, 0], [12, 0], [18, 30], [14, 50], [6, 44], [0, 56], [-8, 46], [-16, 54], [-20, 34]], r: R.red, bulge: 0.5 }
  ], { s: S, ox: 26, oy: 4 });
  // the sword arm (pivot at the shoulder, 0,0; the arm points along +x, the blade beyond the fist)
  BA.paint(scene, 'gp_sword', 112, 30, [
    { e: [8, 0, 11, 7], r: R.steel },
    { e: [20, 0, 7, 6], r: R.gold },
    { p: [[24, -2], [92, -3], [100, 0], [92, 3], [24, 2]], r: [0xffffff, 0xe0e8f8, 0xa8b4cc, 0x6a7896], bulge: 0.3 },   // the blade
    { l: [[28, 0], [88, 0]], c: 0xffffff, w: 1 },
    { p: [[22, -9], [26, -9], [26, 9], [22, 9]], r: R.gold, bulge: 0.2 },                // crossguard
    { e: [16, 0, 4, 4], r: R.gold }
  ], { s: S, ox: 10, oy: 15 });
  // the shield (centre)
  BA.paint(scene, 'gp_shield', 36, 48, [
    { p: [[-14, -19], [14, -19], [14, 3], [0, 21], [-14, 3]], r: R.gold, bulge: 0.3 },
    { p: [[-11, -16], [11, -16], [11, 2], [0, 17], [-11, 2]], r: R.red, bulge: 0.5 },
    { p: [[-6, -7], [8, -2], [-6, 4]], r: R.cheese, bulge: 0.2 },
    { d: [[-3, -4], [-1, 0], [2, -2]], c: 0xe09a20 }
  ], { s: S, ox: 18, oy: 23 });
  // the tail
  BA.paint(scene, 'gp_tail', 54, 30, [
    { l: [[0, 0], [-10, 6], [-22, 8], [-32, 2], [-40, -8], [-46, -12]], c: 0xb85a78, w: 3.5 },
    { l: [[0, 0], [-10, 6], [-22, 8], [-32, 2], [-40, -8], [-46, -12]], c: 0xf08aa0, w: 2 }
  ], { s: S, ox: 50, oy: 16 });
}

const GrandPaladinMixin = {
  gpSetup(e) {
    makeGrandPaladinTextures(this);
    e.spr.setTexture('gp_body').setOrigin(0.5, 0.5);
    const mk = (k, d, ox, oy) => this.add.image(0, 0, k).setDepth(d).setOrigin(ox, oy);
    const tex = k => this.textures.getFrame(k);
    const org = (k, x, y) => { const f = tex(k); return [x * GP_S / f.width, y * GP_S / f.height]; };   // origin from the painter's offsets
    const G = e.gp = { t: 0, swingT: 0, lastRain: 0, hurtT: 0, lean: 0, raise: 0 };
    G.cape = mk('gp_cape', 5.9, ...org('gp_cape', 26, 4));
    G.tail = mk('gp_tail', 5.91, ...org('gp_tail', 50, 16));
    G.churn = mk('gp_churn', 5.95, ...org('gp_churn', 28, 24));
    G.sword = mk('gp_sword', 6.04, ...org('gp_sword', 10, 15));
    G.head = mk('gp_head', 6.06, ...org('gp_head', 30, 36));
    G.plume = mk('gp_plume', 6.05, ...org('gp_plume', 26, 31));
    G.shield = mk('gp_shield', 6.08, ...org('gp_shield', 18, 23));
    G.parts = [G.cape, G.tail, G.churn, G.sword, G.head, G.plume, G.shield];
    for (const p of G.parts) p.bsx = p.bsy = e.spr.bsx || 1.12;
  },
  gpDraw(e) {
    const G = e.gp; if (!G) return;
    const dt = this.lastDt || 0.016, P = this.pl, t = e.t || 0, k = e.spr.bsx || 1.12;
    if (e.hp <= 0 || !e.spr.visible) { for (const p of G.parts) p.setVisible(false); return; }
    G.t += dt;
    const fl = angDiff(P.theta, e.theta) >= 0 ? 1 : -1, ph2 = e.hp < e.maxHp * 0.5;
    if ((e.rainCd || 0) > G.lastRain + 0.2) G.swingT = 0.28;              // a sword wave just went out: the slash
    G.lastRain = e.rainCd || 0; G.swingT = Math.max(0, G.swingT - dt);
    const windup = e.rainWarn ? 1 : 0, charging = e.charge > 0 ? 1 : 0, bracing = e.fanWarn ? 1 : 0;
    G.lean += ((charging ? 0.32 : bracing ? -0.12 : 0) - G.lean) * Math.min(1, dt * 8);
    G.raise += ((windup ? 1 : 0) - G.raise) * Math.min(1, dt * 10);
    if (e.flash > 0) G.hurtT = 0.25; G.hurtT = Math.max(0, G.hurtT - dt);
    const rot = G.lean * fl + Math.sin(t * 1.3) * 0.04;
    e.spr.setFlipX(fl < 0); e.spr.trot = rot;
    // place a part at body-local (x, y) (world units, art facing right), rotated with the body
    const at = (o, x, y, r) => {
      const c = Math.cos(rot), s = Math.sin(rot), lx = x * fl, ly = y, rx = lx * c - ly * s, ry = lx * s + ly * c;
      this.place(o, wrap(e.theta + rx * k / (R + e.h)), e.h - ry * k, rot + (r || 0) * fl);
      o.setFlipX(fl < 0);
    };
    const bob = Math.sin(t * 3.1) * 1.5, jet = Math.sin(t * 40) > 0;
    at(G.churn, 0, 40 + bob * 0.5, Math.sin(t * 2) * 0.05);
    at(G.cape, -10, -12, (charging ? 0.55 : 0.12) + Math.sin(t * 2.4) * 0.12 * (charging ? 0.3 : 1));
    at(G.tail, -14, 50 + bob * 0.5, Math.sin(t * 3.5) * 0.35);
    const shake = bracing ? Math.sin(G.t * 60) * 0.08 : 0;
    at(G.head, 2, -36 + bob, Math.sin(t * 2.2) * 0.05 + shake);
    G.head.setTexture(G.hurtT > 0 ? 'gp_head_hurt' : (windup || charging || bracing || ph2 && Math.sin(t * 1.7) > 0.7) ? 'gp_head_roar' : 'gp_head');
    at(G.plume, -2, -54 + bob, Math.sin(t * 2.7) * 0.18 - (charging ? 0.5 : 0));
    const swing = G.swingT > 0 ? 1 - G.swingT / 0.28 : 0;                   // the slash: from raised overhead, down and through
    const sa = G.swingT > 0 ? -2.1 + swing * 2.8 : -0.35 - G.raise * 1.75 + Math.sin(t * 1.9) * 0.06 + (charging ? 0.5 : 0);
    at(G.sword, 18, -14 + bob, sa);
    at(G.shield, 24 + (charging || bracing ? 6 : 0), 6 + bob, (charging || bracing ? -0.15 : 0.05) + shake);
    // copy the hit flash and fades from the body to every part
    const fill = e.spr.tintFill, tnt = e.spr.tintTopLeft, a = e.spr.alpha;
    for (const p of G.parts) { p.setVisible(true).setAlpha(a); if (fill) p.setTintFill(tnt); else if (tnt !== 0xffffff) p.setTint(tnt); else p.clearTint(); }
    G.puffT = (G.puffT || 0) - dt;
    if (G.puffT <= 0) { G.puffT = 0.09;                                     // little puffs of milk vapour from the churn's jet
      const im = this.add.image(0, 0, 'puff').setDepth(5.8); im.bsx = im.bsy = rnd(0.22, 0.34);
      this.parts.push({ theta: wrap(e.theta + rnd(-4, 4) / R), h: e.h - 64 * k, vt: rnd(-20, 20), vh: rnd(-90, -50), life: rnd(0.35, 0.55), noGrav: true, grow: 0.5, spr: im }); }
  },
  gpClear(e) { if (e && e.gp) { for (const p of e.gp.parts) p.destroy(); e.gp = null; } }
};
