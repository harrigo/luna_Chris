// ===== L9 PARMESAN PRIME: the art (v2.80) =====
// A richer pixel painter (5-tone ramps, ordered dithering, grain, crystal glints, cracks, ink outline) and everything
// drawn with it: the Parmesan planet itself (stamped rind lettering, crunchy crystals, strata, fissures to a molten
// core, grated scars), the ruined imperial city on its horizon (the great palace with its cracked gold onion dome,
// minarets, a triumphal arch, a temple, a colossal statue of the King), the mining machines chewing it up (drill rigs and
// a grater crawler), the props in the street, the marble balconies you stand on, and the mining mothership in the sky.

const PPR = {                                                         // ramps, light -> dark
  MARB: [0xfffcf4, 0xf2e8d6, 0xdcceb6, 0xb6a68c, 0x7c6e5a],
  VEIN: [0xd8c8b0, 0xb8a488, 0x948064, 0x6e5c44, 0x4a3c2c],
  GOLD: [0xfff8c0, 0xffdc50, 0xe8a822, 0xb06e12, 0x6e3e08],
  PARM: [0xfff4cc, 0xf2da92, 0xd6b66a, 0xaa8a4a, 0x705628],
  RIND: [0xe0b866, 0xc0923e, 0x9a6c28, 0x704a18, 0x4a2e0c],
  RED:  [0xff8a76, 0xe63e40, 0xb41c2c, 0x7c0c1a, 0x4c0610],
  BLUE: [0x8ab0ff, 0x4a6ad8, 0x2a40a0, 0x18246a, 0x0c1240],
  STONE:[0xb8a490, 0x8e7a68, 0x6a584a, 0x4a3c32, 0x2e2420],
  STEEL:[0xf2f6fc, 0xc4ccd8, 0x8e98aa, 0x5c6476, 0x343a48],
  RUST: [0xf0a866, 0xc0763e, 0x904c24, 0x5e2e14, 0x361a0a],
  FIRE: [0xffffff, 0xfff0a0, 0xffc040, 0xff7a1a, 0xc8300a],
  INK: 0x1a1020
};
const PP_BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16 - 0.5);

function ppPaint(scene, key, w, h, paint, opts) {
  opts = opts || {};
  if (typeof SPRITE_FILES !== 'undefined' && SPRITE_FILES.has(key)) return;
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const grid = new Int32Array(w * h).fill(-1);
  let seed = 1; for (const ch of key) seed = (seed * 31 + ch.charCodeAt(0)) % 2147483647;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const hash = (x, y) => { let n = (x * 374761393 + y * 668265263 + seed) | 0; n = (n ^ (n >>> 13)) * 1274126177 | 0; return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const set = (x, y, c) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < w && y < h) grid[y * w + x] = c; };
  const get = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? -1 : grid[y * w + x];
  // light l in [-1, 1] -> a dithered tone from the ramp
  const tone = (ramp, l, x, y, grain) => { const n = ramp.length; let t = (1 - l) / 2 * (n - 1) + PP_BAYER[(y & 3) * 4 + (x & 3)] * 0.9 + (grain ? (hash(x, y) - 0.5) * grain : 0); return ramp[Math.max(0, Math.min(n - 1, Math.round(t)))]; };
  const LX = -0.55, LY = -0.75;
  const api = {
    rnd, hash, set, get, tone,
    // a lit ellipse (a sphere-ish blob)
    ell(cx, cy, rx, ry, ramp, o) { o = o || {};
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry, d = nx * nx + ny * ny; if (d > 1) continue;
        if (!Array.isArray(ramp)) { set(x, y, ramp); continue; }
        const l = (LX * nx + LY * ny) * 0.9 + 0.35 * (1 - d) + (o.bias || 0); set(x, y, tone(ramp, l, x, y, o.grain));
      } },
    // a vertical cylinder (columns, towers): lit from the left
    cyl(x0, y0, x1, y1, ramp, o) { o = o || {};
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const nx = ((x + 0.5 - x0) / (x1 - x0 + 1)) * 2 - 1; const l = -0.85 * nx + 0.3 * (1 - nx * nx) - 0.15 + (o.bias || 0) + (o.vgrad ? -o.vgrad * (y - y0) / (y1 - y0 + 1) : 0); set(x, y, tone(ramp, l, x, y, o.grain)); } },
    // a flat face at a fixed light (with an optional top-to-bottom fade)
    box(x0, y0, x1, y1, ramp, l, o) { o = o || {}; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, tone(ramp, l - (o.vgrad || 0) * (y - y0) / Math.max(1, y1 - y0) + (o.hgrad || 0) * (x - x0) / Math.max(1, x1 - x0), x, y, o.grain)); },
    // a polygon lit by a fixed light (or by its own bounding-box normal when l is undefined)
    poly(pts, ramp, l, o) { o = o || {};
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, hw = Math.max(1, (x1 - x0) / 2), hh = Math.max(1, (y1 - y0) / 2);
      for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
        const px = x + 0.5, py = y + 0.5; let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside; }
        if (!inside) continue;
        if (!Array.isArray(ramp)) { set(x, y, ramp); continue; }
        const ll = l !== undefined ? l - (o.vgrad || 0) * (py - y0) / Math.max(1, y1 - y0) : (LX * (px - cx) / hw + LY * (py - cy) / hh) * 0.8 + 0.1;
        set(x, y, tone(ramp, ll, x, y, o.grain));
      } },
    // an onion dome: base at (cx, by), width 2*rx, height hgt
    dome(cx, by, rx, hgt, ramp, o) {
      const pts = []; for (let k = 0; k <= 24; k++) { const u = k / 24, yy = by - hgt * u, bulge = Math.sin(Math.min(1, u * 1.25) * Math.PI) * (u < 0.8 ? 1 : 1 - (u - 0.8) * 4.5); pts.push([cx - rx * Math.max(0.04, bulge * (u < 0.5 ? 0.8 + u * 0.4 : 1)), yy]); }
      const R2 = pts.map(([x, y]) => [2 * cx - x, y]).reverse(); api.poly(pts.concat(R2), ramp, undefined, o);
      api.line([[cx, by - hgt], [cx, by - hgt - 6]], ramp[3], 1); api.ell(cx, by - hgt - 7, 2, 2, PPR.GOLD);
    },
    line(pts, c, th) { th = th || 1;
      for (let i = 0; i < pts.length - 1; i++) { const [xa, ya] = pts[i], [xb, yb] = pts[i + 1], n = Math.max(1, Math.round(Math.max(Math.abs(xb - xa), Math.abs(yb - ya))));
        for (let k = 0; k <= n; k++) { const x = Math.round(xa + (xb - xa) * k / n), y = Math.round(ya + (yb - ya) * k / n); for (let dy = 0; dy < th; dy++) for (let dx = 0; dx < th; dx++) set(x + dx, y + dy, c); } } },
    // a jagged crack: dark, with a lit lower edge (only over what's already painted)
    crack(x, y, len, ang, o) { o = o || {}; let px = x, py = y, a = ang;
      for (let i = 0; i < len; i++) { if (get(px | 0, py | 0) >= 0) { set(px, py, o.c || 0x2a1a10); if (get((px | 0) + 1, (py | 0) + 1) >= 0 && hash(i, len) < 0.6) set(px + 1, py + 1, o.hi || 0xfff4dc); }
        a += (rnd() - 0.5) * 0.9; px += Math.cos(a); py += Math.sin(a);
        if (o.branch && rnd() < 0.06) api.crack(px, py, len * 0.4, a + (rnd() < 0.5 ? 1 : -1) * 0.9, { c: o.c, hi: o.hi }); } },
    // crystal glints: white flecks with a little cross
    glints(x0, y0, x1, y1, n) { for (let i = 0; i < n; i++) { const x = Math.round(x0 + rnd() * (x1 - x0)), y = Math.round(y0 + rnd() * (y1 - y0)); if (get(x, y) < 0) continue; set(x, y, 0xffffff); if (rnd() < 0.5) { for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (get(x + dx, y + dy) >= 0) set(x + dx, y + dy, 0xfff6d8); } } },
    // speckle what's painted in a rect with darker/lighter pits
    pits(x0, y0, x1, y1, n, dark, light) { for (let i = 0; i < n; i++) { const x = Math.round(x0 + rnd() * (x1 - x0)), y = Math.round(y0 + rnd() * (y1 - y0)); if (get(x, y) < 0) continue; set(x, y, dark); if (light && get(x + 1, y + 1) >= 0) set(x + 1, y + 1, light); } },
    // a glowing window: an arch of warm light with a dark frame
    window(x, y, ww, hh, lit) { api.poly([[x, y + hh], [x, y + ww / 2], [x + ww / 2, y], [x + ww, y + ww / 2], [x + ww, y + hh]], PPR.INK); const r = lit ? [0xfff6c0, 0xffd860, 0xffa830, 0xe86a18, 0xa83a0a] : [0x3a2a30, 0x2a1e26, 0x1e141c, 0x140c12, 0x0a0608]; api.box(x + 1, y + Math.ceil(ww / 2), x + ww - 1, y + hh - 1, r, lit ? 0.7 : 0, { vgrad: lit ? 1.2 : 0 }); api.poly([[x + 1, y + ww / 2 + 1], [x + ww / 2, y + 1], [x + ww - 1, y + ww / 2 + 1]], r[lit ? 1 : 2]); },
    // a little rat-crown emblem
    crown(cx, cy, s) { api.poly([[cx - 5 * s, cy], [cx - 5 * s, cy - 6 * s], [cx - 2.5 * s, cy - 3 * s], [cx, cy - 7 * s], [cx + 2.5 * s, cy - 3 * s], [cx + 5 * s, cy - 6 * s], [cx + 5 * s, cy]], PPR.GOLD); api.set(cx, cy - 4 * s, 0xd62828); },
  };
  paint(api, w, h);
  // ink outline
  for (let pass = 0; pass < (opts.outline === undefined ? 1 : opts.outline); pass++) {
    const src = grid.slice(), at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? -1 : src[y * w + x];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (src[y * w + x] < 0 && (at(x - 1, y) >= 0 || at(x + 1, y) >= 0 || at(x, y - 1) >= 0 || at(x, y + 1) >= 0)) grid[y * w + x] = PPR.INK;
  }
  const tex = scene.textures.createCanvas(key, w, h), ctx = tex.getContext(), img = ctx.createImageData(w, h), D = img.data;
  for (let i = 0; i < w * h; i++) { const c = grid[i]; if (c < 0) continue; D[i * 4] = (c >> 16) & 255; D[i * 4 + 1] = (c >> 8) & 255; D[i * 4 + 2] = c & 255; D[i * 4 + 3] = opts.alpha ? Math.round(opts.alpha * 255) : 255; }
  ctx.putImageData(img, 0, 0); tex.refresh();
}

// ---------------------------------------------------------------- the planet itself
function makeParmPlanet(scene, key, Rw) {
  if (scene.textures.exists(key)) return;
  const S = Math.round(Rw), c = S / 2, rad = S / 2 - 1;
  const tex = scene.textures.createCanvas(key, S, S), ctx = tex.getContext(), img = ctx.createImageData(S, S), D = img.data;
  let sd = 9191; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const hash = (x, y) => { let n = (x * 374761393 + y * 668265263 + 777) | 0; n = (n ^ (n >>> 13)) * 1274126177 | 0; return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const G = 40, grid = []; for (let i = 0; i < (G + 1) * (G + 1); i++) grid.push(rnd());
  const noise = (x, y, f) => { const fx = x / S * G * f % G, fy = y / S * G * f % G, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy, g = (a, b) => grid[(b % G) * (G + 1) + (a % G)];
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty); return (g(ix, iy) * (1 - sx) + g(ix + 1, iy) * sx) * (1 - sy) + (g(ix, iy + 1) * (1 - sx) + g(ix + 1, iy + 1) * sx) * sy; };
  const hx = v => [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  const PARM = PPR.PARM.map(hx), RIND = PPR.RIND.map(hx), CORE = [0xfff6c0, 0xffd860, 0xffa030, 0xe8601a, 0xa8300a].map(hx);
  const FONT = { P: ['111', '101', '111', '100', '100'], A: ['010', '101', '111', '101', '101'], R: ['110', '101', '110', '101', '101'], M: ['10001', '11011', '10101', '10001', '10001'],
    E: ['111', '100', '110', '100', '111'], S: ['111', '100', '111', '001', '111'], N: ['1001', '1101', '1011', '1001', '1001'], I: ['1', '1', '1', '1', '1'], O: ['111', '101', '101', '101', '111'], ' ': ['00', '00', '00', '00', '00'] };
  const cols = []; for (const ch of 'PARMESAN PRIME  ') { const F = FONT[ch]; for (let k = 0; k < F[0].length; k++) cols.push(F.map(r => r[k] === '1')); cols.push([0, 0, 0, 0, 0].map(() => false)); }
  const RB = 30, pitch = 4.6;                                         // rind band depth, dot pitch (texture px)
  const ring = 2 * Math.PI * (rad - RB / 2), reps = Math.max(1, Math.round(ring / (cols.length * pitch))), pitchA = 2 * Math.PI / (cols.length * reps);
  // grated scars: a few sectors where the rasp has shaved the paste into grooves
  const scars = []; for (let i = 0; i < 6; i++) scars.push([rnd() * Math.PI * 2, 0.12 + rnd() * 0.18]);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = x + 0.5 - c, dy = y + 0.5 - c, r = Math.hypot(dx, dy); if (r > rad) continue;
    const d = rad - r, a = Math.atan2(dy, dx), b = PP_BAYER[(y & 3) * 4 + (x & 3)], i = (y * S + x) * 4;
    let col;
    if (d < RB) {                                                     // the RIND, with the stamped dotted lettering
      const n = noise(x, y, 3);
      let t = 1.3 + (d < 3 ? -1.2 : 0) + (n - 0.5) * 1.6 + b * 0.9 + (hash(x, y) < 0.06 ? 1.2 : 0);
      const ci = Math.floor(((a + Math.PI) / pitchA)) % cols.length, aC = (Math.floor((a + Math.PI) / pitchA) + 0.5) * pitchA - Math.PI;
      const row = Math.floor((d - 5) / pitch);
      if (row >= 0 && row < 5 && cols[ci] && cols[ci][4 - row]) {
        const dc = (row + 0.5) * pitch + 5, ddx = (a - aC) * r, ddy = d - dc, dd = Math.hypot(ddx, ddy);
        if (dd < 1.9) t = dd < 1 ? 4 : (ddy > 0 ? 0.3 : 3.4);           // a stamped dot: dark pit, a lit lower lip
      }
      if (d > RB - 3) t += 0.8;
      col = RIND[Math.max(0, Math.min(4, Math.round(t)))];
    } else if (r < 64) {                                              // the molten core
      const t = r / 64 * 3.4 + (noise(x, y, 6) - 0.5) * 1.2 + b; col = CORE[Math.max(0, Math.min(4, Math.round(t)))];
    } else {                                                          // the hard, granular paste
      const n = noise(x, y, 2), n2 = noise(x + 300, y, 7);
      let t = 1.4 + (n - 0.5) * 2 + (n2 - 0.5) * 1.2 + b * 0.9 + (hash(x, y) - 0.5) * 0.9;
      if (Math.abs(((d - RB) % 26) - 13) < 0.7) t += 0.7;               // strata
      for (const [sa, sw] of scars) { const da = Math.abs(((a - sa + Math.PI * 3) % (Math.PI * 2)) - Math.PI); if (da < sw && d < RB + 34) { t = 1 + ((Math.floor(d) % 3) === 0 ? 2.2 : 0) + b * 0.6; } }
      if (r < 96) t += (96 - r) / 32 * 1.5 * (1 - b * 0.3);               // darkening towards the core
      col = PARM[Math.max(0, Math.min(4, Math.round(t)))];
      if (r < 90 && hash(x, y) < (90 - r) / 400) col = CORE[3];
      const h = hash(x * 3, y * 7);
      if (h < 0.0045) col = [255, 255, 255]; else if (h < 0.009) col = [255, 246, 214];   // crunchy crystals
    }
    D[i] = col[0]; D[i + 1] = col[1]; D[i + 2] = col[2]; D[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  // fissures from the core towards the surface, glowing deep down
  ctx.lineCap = 'square';
  for (let k = 0; k < 16; k++) {
    let a = rnd() * Math.PI * 2, r0 = 66 + rnd() * 20, len = 60 + rnd() * (rad - RB - 110);
    let px = c + Math.cos(a) * r0, py = c + Math.sin(a) * r0;
    for (let s = 0; s < len; s += 3) {
      const nx = px + Math.cos(a) * 3, ny = py + Math.sin(a) * 3, rr = Math.hypot(nx - c, ny - c), hot = Math.max(0, 1 - (rr - 60) / 120);
      ctx.strokeStyle = hot > 0.1 ? `rgba(255,${Math.round(120 + 100 * hot)},40,${0.5 + 0.5 * hot})` : 'rgba(74,46,12,0.9)'; ctx.lineWidth = hot > 0.3 ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(Math.round(px), Math.round(py)); ctx.lineTo(Math.round(nx), Math.round(ny)); ctx.stroke();
      px = nx; py = ny; a += (rnd() - 0.5) * 0.5;
    }
  }
  tex.refresh();
}

// ---------------------------------------------------------------- the city, the machines, the props
function makeParmArt(scene) {
  if (scene.game.__parmArt) return; scene.game.__parmArt = true;
  const P = PPR;
  // --- THE GREAT PALACE: a wide hall of marble on steps, arched windows still glowing, two towers, and the great gold
  // onion dome - cracked, a chunk bitten out of it showing the iron ribs - with the rat crown on top. A corner's fallen.
  ppPaint(scene, 'ppb_palace', 220, 230, (a) => {
    a.box(10, 206, 210, 228, P.MARB, 0.1, { vgrad: 0.8 }); for (let y = 210; y < 228; y += 6) a.line([[10, y], [210, y]], P.MARB[3]);       // steps
    a.box(26, 120, 194, 206, P.MARB, 0.25, { vgrad: 0.5, grain: 0.6 });                                                                // the hall
    for (let x = 34; x < 190; x += 22) { a.cyl(x, 124, x + 8, 204, P.MARB, { grain: 0.4 }); a.box(x - 2, 120, x + 10, 124, P.MARB, 0.6); a.box(x - 2, 200, x + 10, 204, P.MARB, 0.2); }   // pilasters
    for (let x = 44; x < 180; x += 22) a.window(x, 140, 10, 26, ((x / 22) | 0) % 3 !== 1);
    a.box(20, 108, 200, 120, P.MARB, 0.5); for (let x = 22; x < 200; x += 5) a.box(x, 116, x + 2, 120, P.MARB, -0.4);                   // cornice + dentils
    a.box(20, 104, 200, 108, P.GOLD, 0.3);
    for (const tx of [26, 170]) {                                                                                                         // the towers
      a.cyl(tx, 60, tx + 24, 120, P.MARB, { grain: 0.4 }); a.window(tx + 7, 74, 10, 20, true); a.box(tx - 3, 56, tx + 27, 62, P.GOLD, 0.2);
      a.dome(tx + 12, 56, 13, 34, P.GOLD, { grain: 0.3 });
    }
    a.cyl(84, 70, 136, 108, P.MARB, { grain: 0.3 }); for (let x = 88; x < 134; x += 9) a.window(x, 80, 6, 20, true);                    // the drum
    a.box(80, 64, 140, 70, P.GOLD, 0.3);
    a.dome(110, 64, 44, 66, P.GOLD, { grain: 0.35 });                                                                                     // THE DOME
    a.poly([[122, 20], [142, 34], [148, 56], [130, 50], [126, 36]], 0x1e1410);                                                            // a bite out of it...
    for (const [x0, y0, x1, y1] of [[124, 24, 134, 52], [132, 30, 140, 54], [128, 40, 146, 44]]) a.line([[x0, y0], [x1, y1]], 0x6a5a50, 1);   // ...iron ribs inside
    a.crown(110, 2 + 8, 1.4);
    a.crack(96, 30, 30, 1.9, { c: 0x6e3e08, hi: 0xfff8c0 }); a.crack(80, 52, 18, 0.5, { c: 0x6e3e08, hi: 0xfff8c0 });
    a.poly([[180, 120], [194, 120], [194, 206], [170, 206], [176, 170]], 0x1e1410);                                                      // the fallen corner
    for (const [x, y, s] of [[176, 210, 8], [190, 214, 6], [200, 220, 9], [160, 216, 5]]) a.poly([[x - s, y + s / 2], [x - s / 2, y - s / 2], [x + s, y - s / 3], [x + s / 2, y + s / 2]], P.MARB);
    a.crack(60, 126, 40, 1.6, { branch: true, c: 0x5a4c3c }); a.crack(150, 130, 30, 1.4, { c: 0x5a4c3c });
    for (const bx of [58, 152]) { a.line([[bx, 104], [bx, 86]], 0x5a3a1a, 1); a.poly([[bx + 1, 86], [bx + 14, 86], [bx + 12, 102], [bx + 7, 98], [bx + 2, 104]], P.RED, 0.2); a.crown(bx + 7, 95, 0.5); }   // banners
    a.glints(80, 10, 140, 64, 18);
  });
  // --- a MINARET: tall, slender, lantern balconies; a section's blown out and a chain dangles from it
  ppPaint(scene, 'ppb_minaret', 60, 250, (a) => {
    a.box(8, 228, 52, 249, P.MARB, 0.1, { vgrad: 0.6 });
    a.cyl(16, 70, 44, 228, P.MARB, { grain: 0.4 });
    for (const y of [190, 130]) { a.box(10, y, 50, y + 6, P.GOLD, 0.3); for (let x = 12; x < 50; x += 5) a.box(x, y + 6, x + 1, y + 12, P.GOLD, -0.2); a.box(10, y + 12, 50, y + 14, P.GOLD, 0); }
    for (const y of [150, 204, 96]) a.window(25, y, 10, 18, y !== 96);
    a.poly([[16, 100], [30, 92], [44, 104], [44, 118], [16, 112]], 0x1e1410); a.line([[30, 112], [32, 124], [29, 136]], 0x8a8a92, 1);    // blown out; a chain
    a.box(12, 64, 48, 70, P.GOLD, 0.3); a.cyl(20, 40, 40, 64, P.MARB); a.window(26, 46, 8, 14, true);
    a.poly([[18, 40], [30, 2], [42, 40]], P.GOLD, undefined, { grain: 0.3 }); a.crown(30, 6, 0.6);
    a.crack(22, 160, 40, 1.4, { c: 0x5a4c3c }); a.glints(18, 4, 42, 40, 8);
  });
  // --- the TRIUMPHAL ARCH, a relief of the King on it, its top half broken away
  ppPaint(scene, 'ppb_arch', 180, 160, (a) => {
    a.box(6, 30, 174, 158, P.MARB, 0.25, { vgrad: 0.6, grain: 0.5 });
    a.poly([[56, 158], [56, 96], [90, 62], [124, 96], [124, 158]], 0x1e1410);                                                            // the archway
    a.poly([[60, 158], [60, 98], [90, 68], [120, 98], [120, 158]], [0x3a1e18, 0x2e1812, 0x24120e, 0x1a0c0a, 0x120806], 0);
    for (const x of [16, 36, 136, 156]) { a.cyl(x, 40, x + 10, 156, P.MARB, { grain: 0.3 }); a.box(x - 3, 36, x + 13, 42, P.GOLD, 0.3); }
    a.box(60, 34, 120, 58, P.VEIN, 0.3); a.ell(90, 46, 9, 9, P.MARB); a.crown(90, 38, 0.9); a.poly([[96, 44], [110, 48], [96, 52]], P.MARB);   // the King in relief
    a.box(4, 22, 176, 34, P.GOLD, 0.25); for (let x = 6; x < 176; x += 6) a.box(x, 30, x + 3, 34, P.GOLD, -0.5);
    a.poly([[4, 22], [4, 6], [30, 2], [50, 14], [64, 6], [70, 22]], P.MARB, 0.2); a.poly([[110, 22], [118, 10], [140, 14], [150, 4], [176, 10], [176, 22]], P.MARB, 0.2);   // what's left of the attic
    a.crack(40, 60, 50, 1.3, { branch: true, c: 0x5a4c3c }); a.crack(150, 50, 40, 1.8, { c: 0x5a4c3c });
  });
  // --- the TEMPLE: a pediment with the rat crown, six columns - two snapped - and a fallen roof beam
  ppPaint(scene, 'ppb_temple', 220, 150, (a) => {
    a.box(4, 132, 216, 149, P.MARB, 0.1, { vgrad: 0.7 });
    a.box(24, 52, 196, 132, [0x6a4a3a, 0x4a3228, 0x34221c, 0x241612, 0x160c0a], 0.2);                                                    // the dark inside
    for (let i = 0; i < 6; i++) { const x = 20 + i * 34, broke = i === 2 || i === 4, top = broke ? 92 + i * 3 : 52; a.cyl(x, top, x + 14, 132, P.MARB, { grain: 0.4 }); for (let f = x + 3; f < x + 13; f += 3) a.line([[f, top + 2], [f, 130]], P.MARB[3]);
      if (broke) a.poly([[x, top], [x + 4, top - 6], [x + 9, top - 2], [x + 14, top - 8], [x + 14, top]], P.MARB); else { a.box(x - 3, 46, x + 17, 52, P.GOLD, 0.3); a.ell(x + 7, 50, 8, 3, P.GOLD); } }
    a.poly([[10, 46], [110, 8], [210, 46]], P.MARB, 0.3); a.poly([[26, 42], [110, 14], [194, 42]], P.VEIN, 0.1); a.crown(110, 34, 1.3);
    a.box(8, 44, 212, 48, P.GOLD, 0.3);
    a.poly([[150, 46], [210, 46], [214, 58], [160, 60]], 0x1e1410);                                                                       // a bite out of the roof
    a.poly([[96, 132], [168, 116], [170, 122], [98, 138]], P.MARB, 0.2);                                                                  // a fallen beam
    a.crack(60, 20, 40, 0.3, { c: 0x5a4c3c }); a.glints(20, 40, 200, 52, 10);
  });
  // --- the COLOSSAL STATUE of the King, scaffolded, an arm gone, a miner's ladder up it
  ppPaint(scene, 'ppb_statue', 130, 260, (a) => {
    a.box(14, 226, 116, 259, P.MARB, 0.15, { vgrad: 0.6 }); a.box(10, 220, 120, 228, P.GOLD, 0.3); a.box(30, 236, 100, 246, P.GOLD, 0.0);
    a.poly([[30, 220], [38, 110], [92, 110], [100, 220]], P.RED, undefined, { grain: 0.3 }); a.poly([[30, 220], [38, 110], [48, 110], [44, 220]], P.MARB); a.poly([[100, 220], [92, 110], [82, 110], [86, 220]], P.MARB);
    for (let y = 120; y < 216; y += 12) a.set(40 + (y % 3), y, P.INK);
    a.ell(65, 92, 26, 28, P.MARB, { grain: 0.3 }); a.ell(66, 60, 22, 20, P.PARM, { grain: 0.4 }); a.poly([[78, 52], [110, 64], [78, 74]], P.PARM); a.ell(110, 64, 4, 3, 0xd89a8a);
    a.ell(52, 40, 8, 10, P.PARM); a.ell(74, 56, 4, 4, 0x2a1a10); a.set(75, 55, 0xffffff);
    a.poly([[44, 44], [46, 26], [56, 36], [66, 20], [76, 36], [86, 26], [88, 44]], P.GOLD); a.set(66, 30, 0xd62828);
    a.line([[90, 96], [116, 70], [124, 40]], P.PARM[1], 7); a.ell(124, 36, 6, 6, P.GOLD);                                                 // the pointing arm
    a.poly([[34, 110], [24, 132], [30, 136], [40, 118]], P.PARM); a.poly([[24, 132], [20, 140], [30, 142]], 0x1e1410);                     // the other one: snapped off
    for (const x of [8, 120]) { a.line([[x, 258], [x, 90]], P.RUST[2], 2); for (let y = 100; y < 250; y += 16) a.line([[x, y], [x + (x < 60 ? 16 : -16), y + 8]], P.RUST[3], 1); }   // scaffolding
    for (let y = 120; y < 220; y += 20) a.box(4, y, 26, y + 2, P.RUST, 0.2);
    a.crack(60, 70, 30, 1.6, { c: 0x6e5428 }); a.crack(70, 140, 50, 1.4, { branch: true, c: 0x5a1020 }); a.glints(44, 40, 90, 70, 10);
  });
  // --- a MINING DRILL RIG: a rusty girder tower, smokestacks, hazard stripes, the King's crown on it, and the great drill
  // bit chewing into the ground (2 frames: the spiral turning)
  for (const f of [0, 1]) ppPaint(scene, 'ppb_drill' + (f ? '_b' : ''), 120, 220, (a) => {
    for (const x of [14, 100]) a.box(x, 30, x + 6, 168, P.RUST, 0.1, { grain: 0.5 });
    for (let y = 40; y < 166; y += 18) { a.line([[18, y], [102, y + 16]], P.RUST[2], 2); a.line([[102, y], [18, y + 16]], P.RUST[3], 2); }
    a.box(8, 20, 112, 34, P.STEEL, 0.2); for (let x = 10; x < 112; x += 8) a.poly([[x, 34], [x + 4, 34], [x + 8, 20], [x + 4, 20]], 0xffd23f); a.crown(60, 30, 0.9);
    a.cyl(20, 0, 32, 20, P.STEEL); a.cyl(84, 4, 96, 20, P.STEEL); a.box(18, 0, 34, 3, P.RUST, 0); a.box(82, 4, 98, 7, P.RUST, 0);   // smokestacks
    a.box(30, 120, 90, 150, P.STEEL, 0.15); a.window(40, 126, 10, 18, true); a.window(70, 126, 10, 18, true);                        // the engine house
    a.cyl(50, 150, 70, 170, P.STEEL); a.poly([[34, 170], [86, 170], [60, 219]], P.STEEL, undefined);                                  // the drill bit
    for (let k = 0; k < 6; k++) { const y = 172 + k * 8 + f * 4; const hw = 26 * (1 - (y - 170) / 49); a.line([[60 - hw, y], [60 + hw, y + 6]], P.STEEL[4], 2); }
    a.ell(60, 216, 20, 5, P.PARM);
  });
  // --- a GRATER CRAWLER: a box grater the size of a house on caterpillar tracks, shaving a hill, shavings piling up
  ppPaint(scene, 'ppb_grater', 200, 150, (a) => {
    a.ell(40, 140, 40, 18, P.PARM, { grain: 0.6 }); for (let i = 0; i < 26; i++) { const x = 10 + a.rnd() * 60, y = 124 + a.rnd() * 20; a.line([[x, y], [x + 3, y - 2], [x + 5, y]], P.PARM[0]); }   // the pile of shavings
    a.box(70, 112, 196, 146, P.STEEL, 0.1); for (let x = 74; x < 196; x += 12) a.ell(x + 4, 129, 6, 6, P.STEEL); a.box(70, 112, 196, 116, P.RUST, 0.3);   // tracks
    a.poly([[80, 112], [100, 14], [170, 14], [190, 112]], P.STEEL, undefined, { grain: 0.2 });                                        // the grater body
    for (let y = 24; y < 106; y += 10) for (let x = 0; x < 6; x++) { const xx = 96 + x * 14 - (y - 24) * 0.06, yy = y; a.ell(xx, yy, 3.5, 2.2, 0x2a2e38); a.line([[xx - 3, yy - 2], [xx + 3, yy - 2]], 0xffffff); }
    a.box(118, 2, 152, 14, P.RUST, 0.2); a.crown(135, 12, 0.9);
    a.poly([[78, 100], [40, 118], [46, 124], [84, 108]], P.STEEL);                                                                    // the chute
    a.glints(96, 20, 176, 104, 14);
  });
  // --- the MINING MOTHERSHIP in the sky: rusty, crowned, its belly lit, cables hanging down to the Rasp
  ppPaint(scene, 'ppb_ship', 280, 110, (a) => {
    a.ell(140, 60, 136, 30, P.RUST, { grain: 0.5 }); a.ell(140, 50, 110, 18, P.STEEL, { grain: 0.3 });
    a.poly([[4, 60], [30, 44], [30, 76]], P.GOLD); a.crown(70, 40, 1.4); a.crown(210, 40, 1.4);
    for (let x = 40; x < 250; x += 18) a.window(x, 62, 8, 12, true);
    a.box(110, 82, 170, 96, P.STEEL, 0.1); a.ell(140, 98, 14, 8, [0xfff6c0, 0xffd860, 0xffa830, 0xe86a18, 0xa83a0a]);
    for (const x of [116, 164]) a.line([[x, 96], [x - 6, 109]], 0x5a6272, 2);
    a.crack(60, 70, 30, 0.2, { c: 0x361a0a }); a.crack(220, 64, 20, 0.6, { c: 0x361a0a });
  });
  // ---- the street: props you walk past
  ppPaint(scene, 'ppstatue2', 70, 130, (a) => {                                    // a statue of the King on a plinth, an arm off, cracked
    a.box(8, 104, 62, 129, P.MARB, 0.15, { vgrad: 0.6 }); a.box(4, 98, 66, 106, P.GOLD, 0.3); a.box(18, 112, 52, 118, P.GOLD, 0);
    a.poly([[18, 98], [22, 50], [48, 50], [52, 98]], P.MARB, undefined, { grain: 0.4 }); a.poly([[22, 98], [24, 60], [30, 60], [28, 98]], P.MARB[1]);
    a.ell(35, 38, 13, 13, P.MARB, { grain: 0.3 }); a.poly([[42, 32], [58, 38], [42, 44]], P.MARB); a.ell(30, 26, 4, 6, P.MARB); a.ell(38, 35, 2, 2, P.MARB[4]);
    a.poly([[24, 30], [26, 18], [31, 25], [35, 14], [39, 25], [44, 18], [46, 30]], P.GOLD); a.set(35, 20, 0xd62828);
    a.line([[48, 58], [62, 44], [64, 30]], P.MARB[1], 4); a.ell(64, 26, 4, 4, P.GOLD);
    a.poly([[18, 58], [12, 66], [16, 70], [22, 62]], P.MARB); a.ell(10, 120, 6, 4, P.MARB);                                    // stump; the arm on the ground
    a.crack(30, 50, 40, 1.5, { branch: true, c: 0x5a4c3c }); a.glints(26, 18, 46, 32, 6);
  });
  ppPaint(scene, 'ppcol2', 36, 110, (a) => {                                       // a fluted column, gold acanthus capital, cracked
    a.box(2, 100, 34, 109, P.MARB, 0.2); a.box(4, 94, 32, 100, P.MARB, 0.5);
    a.cyl(7, 24, 29, 94, P.MARB, { grain: 0.3 }); for (let x = 10; x < 28; x += 4) a.line([[x, 26], [x, 92]], P.MARB[3]);
    a.box(2, 16, 34, 24, P.GOLD, 0.3); for (let x = 4; x < 34; x += 6) a.ell(x, 14, 4, 5, P.GOLD); a.box(0, 6, 36, 10, P.MARB, 0.4);
    a.crack(18, 40, 40, 1.6, { c: 0x5a4c3c, branch: true });
  });
  ppPaint(scene, 'ppcolbroke', 40, 70, (a) => {                                    // a snapped column with its drum fallen beside it
    a.box(2, 60, 30, 69, P.MARB, 0.2); a.cyl(6, 20, 26, 60, P.MARB, { grain: 0.3 }); for (let x = 9; x < 25; x += 4) a.line([[x, 22], [x, 58]], P.MARB[3]);
    a.poly([[6, 20], [10, 12], [15, 18], [20, 8], [26, 20]], P.MARB); a.ell(33, 63, 7, 6, P.MARB);
  });
  ppPaint(scene, 'ppbanner2', 46, 120, (a) => {                                    // a royal banner on a gold pole, tattered, embroidered crest, tassels
    a.line([[6, 119], [6, 6]], P.GOLD[3], 3); a.ell(7, 5, 4, 4, P.GOLD);
    a.box(8, 10, 44, 14, P.GOLD, 0.3);
    a.poly([[9, 14], [43, 14], [42, 70], [36, 62], [32, 84], [26, 66], [20, 90], [16, 70], [9, 78]], P.RED, undefined, { grain: 0.4 });
    a.ell(26, 36, 9, 10, P.GOLD); a.ell(26, 36, 6, 7, P.RED); a.crown(26, 40, 0.8);
    for (const [x, y] of [[12, 78], [42, 70]]) { a.line([[x, y], [x, y + 8]], P.GOLD[2]); a.ell(x, y + 9, 2, 2, P.GOLD); }
    a.poly([[30, 20], [38, 28], [34, 30]], 0x1e1410);                                                                           // a moth hole
  });
  for (let f = 0; f < 3; f++) ppPaint(scene, 'ppflame' + f, 16, 26, (a) => { const sw = [0, 2, -2][f]; a.poly([[8 + sw, 0], [15, 15], [13, 24], [8, 25], [3, 24], [1, 15]], [0xff8a2a, 0xff6a1a, 0xe8401a, 0xc0300a, 0xa01a0a], undefined); a.poly([[8 - sw, 8], [12, 17], [10, 24], [6, 24], [4, 17]], [0xffffff, 0xfff0a0, 0xffd23f, 0xffb030, 0xff9020]); }, { outline: 0 });
  ppPaint(scene, 'ppbrazier', 34, 48, (a) => {                                     // a gold tripod brazier (its flame is a separate sprite)
    a.line([[6, 47], [14, 22]], P.GOLD[3], 2); a.line([[28, 47], [20, 22]], P.GOLD[3], 2); a.line([[17, 47], [17, 22]], P.GOLD[2], 2);
    a.ell(17, 18, 15, 7, P.GOLD); a.ell(17, 14, 13, 3, [0xffd860, 0xffa830, 0xe86a18, 0xa83a0a, 0x6a1a06]);
    a.ell(4, 18, 3, 3, P.GOLD); a.ell(30, 18, 3, 3, P.GOLD); a.ell(17, 25, 4, 3, P.GOLD); a.set(17, 24, 0xd62828);
  });
  ppPaint(scene, 'ppfountain', 100, 64, (a) => {                                   // a broken fountain: a rat statue spouting, the bowl cracked, cheese pooled
    a.ell(50, 54, 46, 9, P.MARB); a.ell(50, 50, 40, 6, [0xfff0a0, 0xffd860, 0xe8b030, 0xb07a18, 0x7a4a08]);
    a.box(44, 26, 56, 50, P.MARB, 0.2); a.ell(50, 24, 10, 6, P.MARB);
    a.ell(50, 14, 7, 7, P.MARB); a.poly([[55, 12], [66, 16], [55, 19]], P.MARB); a.ell(46, 7, 3, 4, P.MARB); a.line([[66, 16], [72, 22], [74, 40]], 0xffd860, 2);
    a.poly([[84, 50], [96, 52], [92, 60], [80, 58]], 0x1e1410); a.crack(30, 52, 20, 0.1, { c: 0x5a4c3c });
  });
  ppPaint(scene, 'pprubble', 90, 36, (a) => {                                      // marble blocks, a gold dome shard, a column drum
    a.poly([[4, 35], [10, 18], [30, 14], [36, 35]], P.MARB, undefined, { grain: 0.4 }); a.poly([[30, 35], [40, 10], [60, 16], [64, 35]], P.MARB, undefined, { grain: 0.4 });
    a.poly([[56, 35], [64, 22], [82, 20], [88, 35]], P.GOLD); a.ell(22, 30, 8, 6, P.MARB); a.crack(46, 20, 12, 1.3, { c: 0x5a4c3c }); a.glints(40, 12, 86, 34, 6);
  });
  // ---- the marble balcony slabs you stand on: cornice, gold trim, dentils, a broken end
  ppPaint(scene, 'pl_marble', 124, 34, (a) => {
    a.box(2, 0, 122, 6, P.MARB, 0.6); a.box(0, 6, 124, 10, P.GOLD, 0.35); a.box(4, 10, 118, 20, P.MARB, 0.15, { vgrad: 0.4 });
    for (let x = 6; x < 118; x += 7) a.box(x, 20, x + 3, 25, P.MARB, -0.2);
    for (let x = 12; x < 118; x += 26) { a.ell(x, 15, 3, 3, P.GOLD); }
    a.poly([[100, 20], [118, 20], [114, 32], [106, 26]], P.MARB, 0.1); a.poly([[110, 0], [124, 0], [124, 10], [116, 12]], 0x1e1410);
    a.crack(30, 12, 30, 0.1, { c: 0x5a4c3c });
  });
}

// ---------------------------------------------------------------- (v2.80) the Rat Empire's finest + the Colossus, repainted
function makeParmFolk(scene) {
  if (scene.game.__parmFolk) return; scene.game.__parmFolk = true; scene.game.__colTex = true;   // (blocks the old flat versions)
  const P = PPR, FUR = [0xeef0f8, 0xc8cce0, 0x9ea4bc, 0x747a94, 0x4c5068], PINK = [0xffd6dc, 0xffacbc, 0xe27c92, 0xb05a70, 0x783a4a],
    BLK = [0x6a5a5a, 0x4a3e3e, 0x32282a, 0x221a1c, 0x140e10], TEAL = [0x8ae0d8, 0x3aa8a8, 0x1e7878, 0x0e4a4e, 0x062a2e], ROACH = [0xf0b070, 0xc0763a, 0x8a4a1e, 0x5a2a0e, 0x341606];
  // a rat's head facing right; (x,y) = the skull's centre
  const rat = (a, x, y, o) => { o = o || {};
    a.ell(x - 5, y - 7, 4, 5, PINK); a.ell(x - 5, y - 7, 2, 3, PINK[2]);                                   // ear
    a.ell(x, y, 8, 7, FUR, { grain: 0.4 }); a.poly([[x + 3, y - 4], [x + 15, y + 1], [x + 3, y + 6]], FUR, 0.1); a.ell(x + 15, y + 1, 2.2, 2, PINK);
    a.ell(x + 3, y - 2, 2.4, 2.4, o.eye || 0xff2a1a); a.set(x + 2, y - 3, 0xffffff); a.line([[x, y - 5], [x + 5, y - 4]], 0x2a2030);   // eye, a mean brow
    a.box(x + 9, y + 4, x + 10, y + 7, 0xfff8e0, 0.9); a.line([[x + 6, y + 4], [x + 12, y + 4]], 0x3a2030);
    for (let k = 0; k < 3; k++) a.line([[x + 13, y + 1], [x + 19, y - 2 + k * 2]], 0x4a4058);
  };
  // ---- ROYAL GUARD: plumed steel helmet with a gold crest, a red tunic trimmed in gold with the crown on it, chainmail
  // sleeves, a great gold-and-red tower shield, a halberd over the shoulder
  for (const f of [0, 1]) ppPaint(scene, 'ppguard' + (f ? '_b' : ''), 52, 60, (a) => {
    a.line([[9, 59], [12, 4]], 0x6a4a2a, 2); a.poly([[7, 10], [12, 0], [19, 8], [12, 15]], P.STEEL); a.poly([[12, 8], [21, 5], [19, 15]], P.STEEL);
    const lg = f ? [[17, 59], [27, 56]] : [[15, 56], [27, 59]]; for (const [x, y] of lg) { a.box(x - 2, 44, x + 2, y - 3, BLK, 0.2); a.box(x - 3, y - 3, x + 3, y, BLK, -0.3); }
    a.ell(21, 36, 11, 12, P.RED, { grain: 0.3 }); a.box(12, 41, 30, 43, P.GOLD, 0.3); a.crown(21, 36, 0.6);
    a.ell(14, 30, 4, 5, P.STEEL); a.pits(10, 26, 18, 34, 10, 0x5c6476);                                    // chainmail shoulder
    rat(a, 22, 20);
    a.poly([[13, 17], [15, 9], [22, 6], [29, 9], [31, 17]], P.STEEL); a.box(13, 15, 31, 17, P.GOLD, 0.3);  // helmet
    a.poly([[19, 7], [24, -1], [31, 0], [27, 7]], P.RED); a.poly([[22, 7], [26, 1], [29, 2], [25, 7]], P.RED[0]);   // plume
    a.ell(33, 44, 2.5, 2.5, FUR);                                                                          // the hand on the shield
    a.poly([[31, 17], [50, 17], [50, 47], [40, 57], [31, 47]], P.GOLD, undefined, { grain: 0.2 }); a.poly([[34, 21], [47, 21], [47, 45], [40, 52], [34, 45]], P.RED, undefined, { grain: 0.3 });
    a.crown(40.5, 36, 0.8); a.line([[34, 27], [47, 27]], P.GOLD[2]); for (const [x, y] of [[33, 19], [48, 19], [33, 45], [48, 45]]) a.set(x, y, 0xfff8c0);
    a.glints(31, 17, 50, 30, 3);
  });
  // ---- GRENADIER: a towering shaggy bearskin with a red plume, a blue coat with gold buttons, a white crossbelt, a
  // bandolier of rind grenades; frame b has one wound back to throw, its fuse fizzing
  for (const f of [0, 1]) ppPaint(scene, 'ppgren' + (f ? '_b' : ''), 44, 52, (a) => {
    for (const x of [16, 25]) { a.box(x - 2, 38, x + 2, 49, BLK, 0.2); a.box(x - 3, 48, x + 3, 51, BLK, -0.4); }
    a.ell(20, 30, 10, 11, P.BLUE, { grain: 0.3 }); for (const y of [24, 29, 34]) a.ell(16, y, 1.3, 1.3, P.GOLD);
    a.line([[12, 21], [28, 39]], 0xf0f0f0, 2); a.line([[12, 22], [28, 40]], 0xb8b8c0);
    for (const [x, y] of [[23, 27], [26, 31]]) a.ell(x, y, 2.6, 2.6, P.RIND);
    rat(a, 20, 16);
    a.ell(20, 4, 10, 9, BLK, { grain: 0.8 }); a.box(11, 4, 29, 11, BLK, 0, { grain: 0.8 }); a.box(11, 10, 29, 12, P.GOLD, 0.2);   // bearskin
    a.poly([[27, 2], [31, -2], [32, 6]], P.RED);
    if (f) { a.line([[26, 26], [33, 15], [36, 9]], FUR[2], 3); a.ell(37, 7, 4, 4, P.RIND, { grain: 0.5 }); a.line([[38, 3], [40, 0]], 0x6a6a72); a.set(41, 0, 0xffe060); a.set(40, -1, 0xffffff); }
    else { a.line([[26, 26], [31, 33]], FUR[2], 3); a.ell(32, 35, 2.5, 2.5, FUR); }
  });
  ppPaint(scene, 'ppgrenade', 14, 16, (a) => { a.ell(7, 10, 6, 6, P.RIND, { grain: 0.7 }); a.pits(2, 5, 12, 15, 5, P.RIND[4]); a.box(6, 1, 8, 4, P.STEEL, 0.2); a.set(7, 0, 0xffe060); });
  // ---- THE TAXMAN: fat, sneering, a tall top hat, a monocle on a gold chain, a pinstripe waistcoat with a watch chain,
  // a bulging sack of stolen cheddar, a ledger under his arm
  for (const f of [0, 1]) ppPaint(scene, 'pptax' + (f ? '_b' : ''), 50, 50, (a) => {
    const lg = f ? [[18, 49], [28, 46]] : [[15, 46], [30, 49]]; for (const [x, y] of lg) { a.box(x - 2, 40, x + 2, y - 2, BLK, 0.2); a.box(x - 3, y - 2, x + 4, y, 0x140e10); }
    a.ell(10, 25, 9, 10, [0xf0d8a0, 0xd8b878, 0xb0904e, 0x806430, 0x544018], { grain: 0.6 }); a.line([[7, 17], [13, 15]], 0x6a5428);   // the sack
    for (const [x, y] of [[6, 30], [11, 33], [14, 27]]) a.ell(x, y, 2.4, 2, P.GOLD);
    a.ell(24, 32, 14, 12, [0x6a6a7e, 0x4c4c60, 0x363648, 0x242432, 0x161620], { grain: 0.2 });          // the coat
    a.ell(25, 33, 8, 9, [0xf0e0c0, 0xd8c098, 0xb89c70, 0x8a7048, 0x5a4428]); for (let x = 19; x < 31; x += 3) a.line([[x, 25], [x, 41]], 0x8a7048);   // waistcoat, pinstripes
    a.line([[19, 34], [31, 35]], P.GOLD[1]); a.ell(31, 35, 2, 2, P.GOLD);
    a.poly([[34, 30], [44, 28], [44, 40], [34, 41]], [0x8a3a2a, 0x6a2a1e, 0x4a1a12, 0x2e0e0a, 0x1a0606], 0.1); a.line([[36, 32], [42, 31]], 0xf0e0c0);   // the ledger
    rat(a, 25, 15, { eye: 0xffd23f });
    a.ell(28, 13, 3.2, 3.2, 0xbfe8ff); a.set(27, 12, 0xffffff); a.line([[28, 16], [27, 24]], P.GOLD[1]);   // monocle
    a.box(17, -1, 31, 7, BLK, 0.2); a.box(17, 4, 31, 6, P.RED, 0.2); a.box(13, 7, 35, 9, BLK, 0);       // top hat
    a.glints(17, -1, 31, 7, 2);
  });
  // ---- COCKROACH CAVALRY: a giant glossy cockroach (wing cases, spiky legs, waving feelers) with a rat in a little gold
  // crown and a red cape riding it, lance couched
  for (const f of [0, 1]) ppPaint(scene, 'ppcav' + (f ? '_b' : ''), 76, 52, (a) => {
    for (let k = 0; k < 3; k++) { const x = 18 + k * 14, s = (k + f) % 2 ? 4 : -4; a.line([[x, 38], [x + s, 44], [x + s * 2, 51]], 0x2a1408, 2); a.set(x + s, 45, 0x8a4a1e); }
    a.ell(36, 36, 26, 9, ROACH, { grain: 0.25 }); a.poly([[14, 34], [36, 27], [58, 34], [36, 38]], ROACH, 0.5); a.line([[36, 28], [36, 44]], 0x341606);
    a.ell(26, 31, 8, 2, 0xffe0b0);                                                                            // the gloss
    a.ell(64, 38, 8, 6, ROACH); a.line([[68, 34], [74, 24], [70, 16]], 0x341606); a.line([[66, 34], [70, 22], [64, 14]], 0x341606); a.ell(67, 37, 1.6, 1.6, 0xfff4c0);
    a.poly([[24, 22], [34, 16], [38, 36], [20, 34]], P.RED, undefined, { grain: 0.3 });                     // cape
    a.ell(32, 23, 7, 8, P.STEEL); rat(a, 33, 10);
    a.poly([[27, 4], [29, -1], [32, 2], [35, -1], [38, 2], [40, -1], [40, 4]], P.GOLD);
    a.line([[30, 24], [66, 15]], 0x6a4a2a, 2); a.poly([[64, 12], [75, 15], [64, 19]], P.STEEL); a.poly([[44, 21], [50, 16], [50, 24]], P.RED);   // lance + pennant
  });
  // ---- THE PARMESAN COLOSSUS: the King carved from marble and Parmesan, his robe once painted red (flaking), an ermine
  // trim, a gold crown and sceptre; b = cracked open, three crystals blazing through
  const statue = (a, cracked) => {
    a.box(16, 146, 104, 159, P.MARB, 0.15, { vgrad: 0.6 }); a.box(12, 140, 108, 147, P.GOLD, 0.3); a.box(30, 150, 90, 154, P.GOLD, 0);
    for (const x of [38, 66]) { a.cyl(x, 112, x + 14, 140, P.PARM, { grain: 0.5 }); a.ell(x + 7, 140, 12, 5, P.PARM); }
    a.poly([[28, 58], [92, 58], [102, 122], [18, 122]], P.RED, undefined, { grain: 0.5 }); a.pits(22, 62, 98, 120, 60, P.PARM[1], P.PARM[3]);   // painted robe, flaking to the cheese
    a.poly([[24, 64], [34, 58], [42, 122], [24, 122]], P.MARB, undefined, { grain: 0.3 }); a.poly([[96, 64], [86, 58], [78, 122], [96, 122]], P.MARB, undefined, { grain: 0.3 });
    for (let y = 66; y < 120; y += 9) { a.set(30, y, P.INK); a.set(90, y + 4, P.INK); }
    a.line([[88, 70], [104, 50], [108, 28]], P.PARM[2], 7); a.ell(108, 24, 7, 7, P.GOLD); a.set(106, 21, 0xffffff);
    a.line([[32, 70], [20, 90], [24, 104]], P.PARM[2], 7); a.ell(24, 106, 5, 5, P.PARM);
    a.ell(56, 40, 22, 19, P.PARM, { grain: 0.6 }); a.poly([[68, 32], [98, 44], [68, 54]], P.PARM, 0.2); a.ell(98, 44, 4, 3.5, 0xd8a090);   // the head
    a.ell(46, 22, 8, 10, P.PARM); a.ell(46, 22, 4, 6, P.PARM[3]);
    a.ell(62, 36, 5, 4, 0x2a1a10); a.ell(63, 36, 2.6, 2.6, cracked ? 0xff3a1a : 0xc8a050); a.line([[58, 31], [67, 33]], 0x6e5428, 2);
    a.box(86, 48, 88, 53, 0xfff8e0, 0.8); a.line([[80, 48], [92, 48]], 0x6e5428);
    a.pits(36, 26, 92, 56, 30, P.PARM[3], P.PARM[0]);
    a.poly([[34, 22], [36, 6], [43, 14], [50, 0], [57, 14], [64, 6], [66, 22]], P.GOLD, undefined, { grain: 0.2 }); a.box(34, 19, 66, 23, P.GOLD, 0.2); a.ell(50, 9, 2.5, 2.5, 0xd62828);
    a.glints(36, 0, 66, 22, 6); a.glints(30, 30, 90, 140, 16);
    if (cracked) {
      for (const [x, y] of [[44, 120], [62, 78], [50, 16]]) { a.poly([[x - 9, y], [x - 3, y - 10], [x + 5, y - 8], [x + 9, y + 2], [x + 2, y + 10], [x - 7, y + 7]], P.FIRE, undefined); a.set(x - 2, y - 4, 0xffffff); }
      a.crack(30, 64, 40, 1.2, { branch: true, c: 0x3a2a10, hi: 0xffd860 }); a.crack(84, 66, 36, 1.9, { c: 0x3a2a10, hi: 0xffd860 }); a.crack(60, 26, 22, 1.2, { c: 0x3a2a10, hi: 0xffd860 }); a.crack(46, 112, 20, 2, { c: 0x3a2a10, hi: 0xffd860 });
    } else { a.crack(34, 70, 16, 1.2, { c: 0x6e5428 }); a.crack(82, 72, 16, 1.8, { c: 0x6e5428 }); }
  };
  ppPaint(scene, 'colossus', 120, 160, (a) => statue(a, false));
  ppPaint(scene, 'colossus_b', 120, 160, (a) => statue(a, true));
  ppPaint(scene, 'colhead', 84, 70, (a) => {
    a.ell(26, 16, 8, 10, P.PARM); a.ell(26, 16, 4, 6, P.PARM[3]);
    a.ell(32, 36, 22, 19, P.PARM, { grain: 0.6 }); a.poly([[44, 28], [76, 40], [44, 50]], P.PARM, 0.2); a.ell(76, 40, 4, 3.5, 0xd8a090);
    a.ell(40, 32, 5, 4, 0x2a1a10); a.ell(41, 32, 3, 3, 0xff3a1a); a.set(40, 31, 0xffffff); a.line([[35, 26], [46, 29]], 0x6e5428, 2);
    a.box(62, 44, 64, 50, 0xfff8e0, 0.8); a.pits(14, 22, 70, 52, 24, P.PARM[3], P.PARM[0]);
    a.poly([[12, 20], [14, 4], [21, 12], [28, 0], [35, 12], [42, 4], [44, 20]], P.GOLD); a.box(12, 17, 44, 21, P.GOLD, 0.2); a.ell(28, 8, 2.5, 2.5, 0xd62828);
    a.poly([[8, 50], [14, 60], [24, 55], [32, 66], [42, 58], [48, 64], [52, 50]], P.FIRE); a.crack(18, 30, 16, 1.2, { c: 0x3a2a10, hi: 0xffd860 }); a.glints(12, 0, 44, 20, 5);
  });
  ppPaint(scene, 'colrubble', 120, 70, (a) => {
    a.box(20, 56, 100, 69, P.MARB, 0.15); a.box(16, 52, 104, 58, P.GOLD, 0.3);
    a.poly([[24, 52], [34, 22], [52, 30], [60, 12], [78, 26], [92, 18], [100, 52]], P.PARM, undefined, { grain: 0.6 });
    a.poly([[36, 44], [48, 34], [58, 46]], P.RED); a.pits(28, 20, 98, 50, 30, P.PARM[3], P.PARM[0]);
    a.poly([[54, 18], [60, 10], [66, 18], [60, 26]], P.FIRE); a.crack(70, 30, 18, 1.4, { c: 0x3a2a10 });
  });
}
