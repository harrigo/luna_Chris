// ================================================================= THE MASTER PALETTE (v3.74)
// The 16-bit way: every sprite in the game is drawn from ONE set of colour ramps, so it all looks like one artist did
// it. A ramp is a hue in six shades, dark to light, and the shades shift hue as they go (shadows cooler and more
// purple, highlights warmer), the way SNES-era artists shaded. A sprite's colours are each snapped to the nearest
// shade, taking care that colours which were different stay different (so a face doesn't lose its cheek): if two
// clearly different colours land on the same shade, the darker one steps down the ramp (or the lighter one up).
//
// Where it's applied (everything is snapped ONCE, as it's made):
//   - drawn-in-code sprites: pixSprite / pixArt (textures.js) snap their pixels before writing them
//   - other generated textures: Atlas.pack (atlas.js) snaps them as it copies them onto the sheet
//   - the PNG sprites in assets/sprites were snapped by the same code and saved back to the files (see GAME_DESIGN.md)
// Left alone on purpose: anything with soft see-through edges (glows, halos, shading layers, nebulae), the planets'
// surfaces, the sky, and very big pictures. PAL_SKIP lists the rest.
const PAL_RAMPS = {
  ink:    [0x0c0810, 0x1a1020],
  steel:  [0x2a2a40, 0x46485e, 0x6a7088, 0x9aa4b8, 0xcfd8e6, 0xffffff],
  stone:  [0x3a3030, 0x5e5048, 0x8a7a6a, 0xb8a890, 0xe6dcc4, 0xfff8e8],
  wood:   [0x2e1a14, 0x4e2a1a, 0x7a4424, 0xa86a34, 0xd4985a, 0xf0c490],
  cheese: [0x5a3410, 0x8a5a12, 0xc08a18, 0xf0c030, 0xffe070, 0xfff6c0],
  orange: [0x5a1c10, 0x922e14, 0xd0561e, 0xff8a2a, 0xffb860, 0xffe0a8],
  red:    [0x3a0a1c, 0x6e1224, 0xa81c28, 0xe0342e, 0xff6a50, 0xffa890],
  skin:   [0x5a2a28, 0x8e4a3a, 0xc27a5c, 0xe8a684, 0xffcfae, 0xffeedd],
  pink:   [0x46143e, 0x7a1e5c, 0xb43a86, 0xe866b0, 0xff9ed0, 0xffd6ec],
  purple: [0x1e1438, 0x34205e, 0x542e8e, 0x7c48c0, 0xa878e4, 0xd4b4ff],
  blue:   [0x101a44, 0x1a2c72, 0x2a4cac, 0x3e78e0, 0x6ea8ff, 0xb4d8ff],
  teal:   [0x0c2a34, 0x124a58, 0x1a7484, 0x2aa8b0, 0x5ad8d8, 0xb0f8f0],
  green:  [0x0e2a1c, 0x184a26, 0x267030, 0x40a03a, 0x78cc4a, 0xc0f080],
  olive:  [0x24281a, 0x3e4426, 0x5e6634, 0x84904a, 0xb0bc6a],
  cream:  [0x6a5034, 0x8a6a40, 0xb89a62, 0xdcc48a, 0xf2e0aa, 0xfff2cc],
  sage:   [0x1e2a26, 0x34463e, 0x50665a, 0x748c7e, 0xa0b8a8, 0xd0e4d4],
  slate:  [0x1c2430, 0x2e3a4a, 0x48586a, 0x6a7e92, 0x9cb0c2, 0xd2e0ea],
  mint:   [0x103a2e, 0x1a6048, 0x2a9068, 0x4ac890, 0x8af0c0, 0xd0ffe8]
};
const PAL_SKIP = /^(halo|titleArt|portrait|surf|shade|neb|sky|beam\d|puff|spark|bgstar|blob|go_spot|glow|.*_glow$|__)/;
const PAL_NOTEX = /^(fogbank|i_puff|ix_doorway|chris$|c_|hud_|gear$)/;   // (left plain: soft clouds, the night sky in a doorway, Chris's parts, the HUD)
const PAL_ON = (() => { try { return !/[?&]nopal\b/.test(location.search); } catch (e) { return true; } })();

const Pal = (() => {
  const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const oklab = (r, g, b) => {
    r = lin(r); g = lin(g); b = lin(b);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
  };
  const dist = (p, q) => { const dl = p[0] - q[0], da = p[1] - q[1], db = p[2] - q[2]; return Math.sqrt(dl * dl * 0.9 + (da * da + db * db) * 1.5); };   // (hue errors count for more than lightness ones)
  const shades = [];                                                   // every shade: { c, lab, ramp, i }
  const rampLen = {};
  for (const [name, R] of Object.entries(PAL_RAMPS)) { rampLen[name] = R.length; R.forEach((c, i) => shades.push({ c, lab: oklab(c >> 16 & 255, c >> 8 & 255, c & 255), ramp: name, i })); }
  const byRamp = {}; for (const s of shades) (byRamp[s.ramp] = byRamp[s.ramp] || [])[s.i] = s;
  const exact = new Set(shades.map(s => s.c));
  const nearCache = new Map();
  const nearest = c => {
    let r = nearCache.get(c); if (r) return r;
    const lab = oklab(c >> 16 & 255, c >> 8 & 255, c & 255); let best = null, bd = 1e9;
    for (const s of shades) { const d = dist(lab, s.lab); if (d < bd) { bd = d; best = s; } }
    r = { s: best, d: bd, lab }; nearCache.set(c, r); return r;
  };
  // snap an RGBA buffer in place. Returns how many colours it had and has now.
  function snap(D) {
    const count = new Map();
    for (let i = 0; i < D.length; i += 4) if (D[i + 3] > 0) { const c = D[i] << 16 | D[i + 1] << 8 | D[i + 2]; count.set(c, (count.get(c) || 0) + 1); }
    const map = new Map(), groups = {};
    for (const [c, n] of count) {
      const N = nearest(c), it = { c, n, lab: N.lab, ramp: N.s.ramp, i: N.s.i, fixed: exact.has(c) };
      map.set(c, it); (groups[it.ramp] = groups[it.ramp] || []).push(it);
    }
    // keep different colours different: within a ramp, walk them dark to light and spread any that collide
    for (const [ramp, list] of Object.entries(groups)) {
      if (ramp === 'ink') continue;
      list.sort((a, b) => a.lab[0] - b.lab[0]);
      const L = rampLen[ramp];
      for (let k = 1; k < list.length; k++) {
        const a = list[k - 1], b = list[k];
        if (a.i !== b.i || a.n < 3 || b.n < 3 || dist(a.lab, b.lab) < 0.055) continue;
        if (!b.fixed && b.i < L - 1 && dist(b.lab, byRamp[ramp][b.i + 1].lab) < 0.16) b.i++;
        else if (!a.fixed && a.i > 0 && dist(a.lab, byRamp[ramp][a.i - 1].lab) < 0.16) a.i--;
      }
    }
    const out = new Map(); for (const [c, it] of map) out.set(c, byRamp[it.ramp][it.i].c);
    for (let i = 0; i < D.length; i += 4) if (D[i + 3] > 0) { const c = out.get(D[i] << 16 | D[i + 1] << 8 | D[i + 2]); D[i] = c >> 16 & 255; D[i + 1] = c >> 8 & 255; D[i + 2] = c & 255; }
    return { from: count.size, to: new Set(out.values()).size };
  }
  // (v3.74) TEXTURE for the plain ones: a sprite that's mostly big flat areas of one colour (it looks basic) gets
  // hand-shading the 16-bit way, all from its own ramps: a lit rim along the top-left edge of each flat area, a shadow
  // along the bottom-right, and a scatter of small flecks (mostly a shade darker, a few a shade lighter) inside.
  const shadeOf = new Map(); for (const sh of shades) shadeOf.set(sh.c, sh);
  const hash = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function texture(D, w, h) {
    const N = w * h, col = new Int32Array(N);
    for (let i = 0; i < N; i++) col[i] = D[i * 4 + 3] >= 250 ? (D[i * 4] << 16 | D[i * 4 + 1] << 8 | D[i * 4 + 2]) : -1;
    const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? -1 : col[y * w + x];
    // how flat is it? (pixels whose whole 3x3 is one colour, out of the solid inside ones)
    let inner = 0, flat = 0; const area = new Map();
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const c = col[y * w + x]; if (c < 0) continue;
      if (at(x - 1, y) < 0 || at(x + 1, y) < 0 || at(x, y - 1) < 0 || at(x, y + 1) < 0) continue;
      inner++; let same = true;
      for (let dy = -1; dy <= 1 && same; dy++) for (let dx = -1; dx <= 1; dx++) if (at(x + dx, y + dy) !== c) { same = false; break; }
      if (same) { flat++; area.set(c, (area.get(c) || 0) + 1); }
    }
    if (inner < 300 || flat / inner < 0.5) return false;
    const out = col.slice();
    const step = (c, k) => { const sh = shadeOf.get(c); if (!sh || sh.ramp === 'ink') return c; const R = byRamp[sh.ramp], j = Math.max(0, Math.min(R.length - 1, sh.i + k)); return R[j].c; };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = col[y * w + x]; if (c < 0 || !((area.get(c) || 0) >= 40)) continue;
      const tl = at(x - 1, y) !== c || at(x, y - 1) !== c, br = at(x + 1, y) !== c || at(x, y + 1) !== c || at(x + 1, y + 1) !== c;
      if (tl && !br) { out[y * w + x] = step(c, 1); continue; }                     // rim light
      if (br && !tl) { out[y * w + x] = step(c, -1); continue; }                    // shadow
      if (tl || br) continue;
      let deep = true;                                                                // flecks only well inside the area
      for (let dy = -2; dy <= 2 && deep; dy++) for (let dx = -2; dx <= 2; dx++) if (at(x + dx, y + dy) !== c) { deep = false; break; }
      if (!deep) continue;
      const r = hash(x >> 1, y), r2 = hash(x, y >> 1);
      if (r < 0.06) out[y * w + x] = step(c, -1); else if (r2 > 0.975) out[y * w + x] = step(c, 1);
    }
    for (let i = 0; i < N; i++) if (out[i] !== col[i] && out[i] >= 0) { D[i * 4] = out[i] >> 16 & 255; D[i * 4 + 1] = out[i] >> 8 & 255; D[i * 4 + 2] = out[i] & 255; }
    return true;
  }
  // should this texture be snapped? (glows, soft shading layers and big pictures aren't)
  function wants(key, D, w, h) {
    if (!PAL_ON || PAL_SKIP.test(key) || w * h > 90000) return false;
    let opaque = 0, soft = 0;
    for (let i = 3; i < D.length; i += 4) { const a = D[i]; if (a > 0) { if (a >= 250) opaque++; else soft++; } }
    return opaque > 0 && soft <= (opaque + soft) * 0.15;
  }
  // snap a canvas (a generated texture) in place
  function snapCanvas(key, cv) {
    const ctx = cv.getContext('2d'), w = cv.width, h = cv.height; if (!w || !h) return false;
    const img = ctx.getImageData(0, 0, w, h);
    if (!wants(key, img.data, w, h)) return false;
    snap(img.data); if (!PAL_NOTEX.test(key)) texture(img.data, w, h); ctx.putImageData(img, 0, 0); return true;
  }
  // snap a pixSprite grid (colour ints, -1 = empty) in place
  function snapGrid(key, grid, w, h) {
    if (!PAL_ON || PAL_SKIP.test(key)) return;
    const D = new Uint8ClampedArray(grid.length * 4);
    for (let i = 0; i < grid.length; i++) { const c = grid[i]; if (c < 0) continue; D[i * 4] = c >> 16 & 255; D[i * 4 + 1] = c >> 8 & 255; D[i * 4 + 2] = c & 255; D[i * 4 + 3] = 255; }
    snap(D); if (!PAL_NOTEX.test(key)) texture(D, w, h);
    for (let i = 0; i < grid.length; i++) if (grid[i] >= 0) grid[i] = D[i * 4] << 16 | D[i * 4 + 1] << 8 | D[i * 4 + 2];
  }
  return { snap, texture, wants, snapCanvas, snapGrid, nearest, shades, done: new Set() };
})();
