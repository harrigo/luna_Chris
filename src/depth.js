// DEPTH for the planets (neo-retro): switched on per level with `depth: {...}` in its LEVELS entry.
//
//  SPHERE SHADING  a screen-fixed overlay lights the planet from the top left: four dithered shade steps (SNES-style
//                  Bayer dither between them) so it reads as a ball, not a disc. Plus a warm rim light on the lit edge
//                  and a dithered atmosphere glow just outside it (ADD).
//  PARALLAX        rings of jagged hills behind the planet, hazier (closer to the sky colour) the further away they
//                  are, turning slower than the planet as you run - so they slide past at different speeds.
//  FOREGROUND      dark rock silhouettes right up against the camera along the bottom edge, scrolling faster than
//                  the planet (they pass in front of everything).
//  CRACKS          (hot planets) glowing lava cracks just under the crust that turn with the planet and pulse.
//
// cfg: { light: [x,y,z], dark: [r,g,b], rim: [r,g,b], atmo: [r,g,b], ridges: [{ off, amp, col: [r,g,b], k, depth, seed }],
//        fg: { col: [r,g,b], glow: [r,g,b] }, cracks: [r,g,b] }

const DEPTH_BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);

function depthCanvas(scene, key, w, h, fill) {
  if (scene.textures.exists(key)) return;                                   // (made once per level; the same every time)
  const tex = scene.textures.createCanvas(key, w, h), ctx = tex.getContext(), img = ctx.createImageData(w, h);
  fill(img.data);
  ctx.putImageData(img, 0, 0); tex.refresh(); tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

function makeDepthTextures(scene, id, Rw, cfg) {
  const S = Math.round(Rw), c = S / 2, L = cfg.light || [-0.55, -0.75, 0.45], Ln = Math.hypot(L[0], L[1], L[2]);
  const lx = L[0] / Ln, ly = L[1] / Ln, lz = L[2] / Ln, DK = cfg.dark || [20, 8, 30];
  // sphere shading (normal blend: dark pixels at four strengths, dithered between)
  depthCanvas(scene, 'dshade' + id, S, S, D => {
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const dx = (x + 0.5 - c) / c, dy = (y + 0.5 - c) / c, d2 = dx * dx + dy * dy;
      if (d2 > 1) continue;
      const nz = Math.sqrt(1 - d2), lam = Math.max(0, dx * lx + dy * ly + nz * lz);
      const q = (1 - lam) * 3.2, th = DEPTH_BAYER[(y & 3) * 4 + (x & 3)], band = Math.min(3, Math.floor(q + th - 0.5));
      if (band <= 0) continue;
      const i = (y * S + x) * 4; D[i] = DK[0]; D[i + 1] = DK[1]; D[i + 2] = DK[2]; D[i + 3] = (cfg.shadeA || [0, 70, 120, 165])[band];
    }
  });
  // rim light + atmosphere (ADD), a little bigger than the planet
  const AW = cfg.atmoW || 0.07, S2 = Math.round(S * (1.05 + AW)), c2 = S2 / 2, RIM = cfg.rim || [255, 220, 160], AT = cfg.atmo || RIM;
  depthCanvas(scene, 'drim' + id, S2, S2, D => {
    for (let y = 0; y < S2; y++) for (let x = 0; x < S2; x++) {
      const dx = (x + 0.5 - c2) / c, dy = (y + 0.5 - c2) / c, d = Math.hypot(dx, dy), th = DEPTH_BAYER[(y & 3) * 4 + (x & 3)];
      const face = (dx * lx + dy * ly) / (d || 1);                            // how much this edge faces the light
      const i = (y * S2 + x) * 4;
      if (d <= 1 && d > 0.982 && face > 0.05) { const a = Math.min(1, (face - 0.05) * 1.6); if (a > th * 0.9) { D[i] = RIM[0]; D[i + 1] = RIM[1]; D[i + 2] = RIM[2]; D[i + 3] = 200; } }
      else if (d > 1 && d < 1 + AW) { const k = (1 - (d - 1) / AW) * (0.4 + 0.6 * Math.max(0, face)); if (k > th) { D[i] = AT[0]; D[i + 1] = AT[1]; D[i + 2] = AT[2]; D[i + 3] = cfg.atmoA || 70; } }
    }
  });
  // parallax hill rings
  (cfg.ridges || []).forEach((rg, n) => {
    const outer = Rw + rg.off + rg.amp + (rg.style === 'wrecks' ? 90 * (rg.size || 1) : 0), Sr = Math.round(outer), cr = Sr / 2;   // (room for the ships' masts)   // half resolution (like the planet)
    const rnd = rng(rg.seed || (77 + n * 31)), steps = 720, prof = [];
    let v = 0; for (let i = 0; i < steps; i++) { v += (rnd() - 0.5) * 0.35; v *= 0.96; prof.push(v); }
    const walk = a => prof[Math.floor((a / (Math.PI * 2)) * steps + steps * 4) % steps];
    const st = rg.style || 'hills', dA = (a, b) => { let d = (a - b) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };
    // features dotted round the ring (spires, wrecks, holes), placed once
    const feats = []; for (let k = 0; k < (rg.n || 26); k++) feats.push({ a: rnd() * Math.PI * 2 - Math.PI, h: 0.4 + rnd() * 0.6, w: 0.007 + rnd() * 0.02, tilt: (rnd() - 0.5) * 0.5, s: rnd() });
    const hill = a => {
      if (st === 'rolling') return 0.45 + 0.28 * Math.sin(a * 5 + n) + 0.14 * Math.sin(a * 13 + n * 3) + 0.08 * walk(a);
      if (st === 'spires') {                                                    // mould spires: low mounds with tall thin spikes
        let h = 0.18 + 0.1 * Math.sin(a * 9 + n) + 0.05 * walk(a);
        for (const f of feats) { const d = Math.abs(dA(a, f.a)) / f.w; if (d < 1) h = Math.max(h, f.h * Math.pow(1 - d, 0.7)); }
        return h;
      }
      if (st === 'wrecks') return 0.16 + 0.1 * Math.sin(a * 6 + n) + 0.06 * walk(a);
      return 0.55 + 0.25 * Math.sin(a * 7 + n) + 0.15 * Math.sin(a * 19 + n * 2) + 0.35 * walk(a);   // jagged hills
    };
    // the lost ships of the Brie-muda Triangle, half sunk on the far dunes: a tilted hull, masts, crossbars, rags of sail
    const wreck = (a, dd) => {
      for (const f of feats) {
        if (f.s > 0.45) continue;                                               // (only some of them are ships)
        const Z = rg.size || 1, u = dA(a, f.a) * Rw / Z, v0 = (dd - (Rw + rg.off)) / Z, v = v0 + u * f.tilt;
        if (Math.abs(u) > 70) continue;
        if (v < 16 - (u * u) / 170 && v > -6 && Math.abs(u) < 52) return 1;                       // hull
        for (const [mx, mh] of [[-18, 52], [12, 68]]) {
          if (Math.abs(u - mx) < 1.6 && v < mh * f.h + 14 && v > 0) return 1;                     // mast
          if (Math.abs(v - (mh * f.h * 0.75 + 12)) < 1.3 && Math.abs(u - mx) < 13) return 1;     // yard
          if (u - mx > 1 && u - mx < 11 && v < mh * f.h * 0.75 + 11 && v > mh * f.h * 0.75 - 6 && ((Math.floor(u) + Math.floor(v)) & 3)) return 2;   // a tattered sail
        }
      }
      return 0;
    };
    const holes = rg.holes ? feats.map(f => ({ a: f.a, r: 9 + f.s * 16, d: 0.2 + f.h * 0.5 })) : null;   // gruyère holes in the hills
    const C = rg.col, TOP = rg.top || C.map(x => Math.min(255, x + 40));
    depthCanvas(scene, 'dridge' + id + '_' + n, Sr, Sr, D => {
      for (let y = 0; y < Sr; y++) for (let x = 0; x < Sr; x++) {
        const dx = x + 0.5 - cr, dy = y + 0.5 - cr, dd = Math.hypot(dx, dy) / cr * outer;   // distance in world units
        if (dd < Rw - 8) continue;
        const a = Math.atan2(dy, dx), top = Rw + rg.off + rg.amp * Math.max(0, Math.min(1, hill(a)));
        const i = (y * Sr + x) * 4, th = DEPTH_BAYER[(y & 3) * 4 + (x & 3)];
        let col = null;
        if (dd <= top) {
          col = top - dd < 3 && th < 0.6 ? TOP : C;
          if (holes) for (const H of holes) { const hu = dA(a, H.a) * Rw, hv = dd - (Rw + rg.off + rg.amp * H.d * 0.6), q = Math.hypot(hu, hv); if (q < H.r) { col = q > H.r - 1.6 ? TOP : null; break; } }
        } else if (st === 'wrecks') { const w = wreck(a, dd); if (w) col = w === 2 ? TOP : C; }
        if (!col) continue;
        D[i] = col[0]; D[i + 1] = col[1]; D[i + 2] = col[2]; D[i + 3] = 255;
        if (rg.glow && top - dd > 6 && th < 0.03 && rnd() < (rg.glowP || 0.08)) { D[i] = rg.glow[0]; D[i + 1] = rg.glow[1]; D[i + 2] = rg.glow[2]; }   // little lights in the hills (lava, spores, will-o'-wisps)
      }
    });
  });
  // foreground rocks: a strip along the bottom of the screen, mostly empty, a crag every so often
  if (cfg.fg) {
    const W = 640, H = 64, FC = cfg.fg.col, GL = cfg.fg.glow, rnd = rng(4242);
    depthCanvas(scene, 'dfg' + id, W, H, D => {
      const set = (x, y, c) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return; const i = (y * W + x) * 4; D[i] = c[0]; D[i + 1] = c[1]; D[i + 2] = c[2]; D[i + 3] = 255; };
      const clr = (x, y) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return; D[(y * W + x) * 4 + 3] = 0; };
      const st = cfg.fg.style || 'rocks';
      if (st === 'reeds') {                                                     // swamp: bent reeds and mould mushrooms with glowing spots
        for (const [x0, hgt, lean] of [[30, 44, 0.3], [38, 30, -0.2], [46, 52, 0.1], [300, 26, 0.25], [500, 48, -0.3], [512, 36, 0.15], [524, 58, 0.05]]) {
          for (let k = 0; k < hgt; k++) { const x = x0 + lean * k * k / hgt; set(x, H - 1 - k, FC); if (k > hgt * 0.4) set(x + 1, H - 1 - k, FC); }
          const tx = x0 + lean * hgt; for (let k = 0; k < 6; k++) { set(tx, H - hgt - k, FC); set(tx + 1, H - hgt - k, FC); }   // seed head
          if (GL) set(tx, H - hgt - 6, GL);
        }
        for (const [cx, w, hh] of [[80, 18, 22], [96, 11, 14], [540, 22, 26], [470, 12, 12]]) {
          for (let y = H - hh; y < H; y++) for (let x = cx - 2; x <= cx + 2; x++) set(x, y, FC);                  // stalk
          for (let y = 0; y < w * 0.7; y++) { const half = Math.sqrt(1 - Math.pow(y / (w * 0.7), 2)) * w; for (let x = -half; x <= half; x++) set(cx + x, H - hh - y, FC); }   // cap
          if (GL) for (let k = 0; k < 4; k++) set(cx - w * 0.6 + k * w * 0.4, H - hh - 3 - (k % 2) * 4, GL);
        }
      } else if (st === 'bones') {                                              // graveyard: great curved ribs and a broken grave post
        for (const [x0, span, hgt] of [[40, 60, 46], [500, 70, 52]]) for (let rib = 0; rib < 4; rib++) {
          const xs = x0 + rib * span / 4, hh = hgt * (1 - rib * 0.15);
          for (let t = 0; t <= 1; t += 0.01) { const x = xs + Math.sin(t * Math.PI * 0.7) * 16, y = H - 1 - t * hh; set(x, y, FC); set(x + 1, y, FC); set(x + 2, y, FC); if (GL && ((t * 100) | 0) % 9 === 0) set(x - 1, y, GL); }
        }
        for (const [x0, hh] of [[300, 30], [330, 22]]) { for (let y = H - hh; y < H; y++) for (let x = x0; x < x0 + 5; x++) set(x, y, FC); for (let x = x0 - 6; x < x0 + 11; x++) { set(x, H - hh + 6, FC); set(x, H - hh + 7, FC); } }
      } else {                                                                  // rocks (holey ones for a cheese planet)
        const crags = [[70, 40, 24], [100, 26, 16], [52, 22, 13], [330, 30, 14], [520, 46, 30], [556, 30, 20], [492, 24, 12]];
        const top = new Array(W).fill(H);
        for (const [cx, w, hh] of crags) for (let x = cx - w; x <= cx + w; x++) {
          const d = (x - cx) / w; if (Math.abs(d) >= 1) continue;
          const y = Math.round(H - hh * Math.sqrt(1 - d * d)); if (x >= 0 && x < W) top[x] = Math.min(top[x], y);
        }
        for (let x = 0; x < W; x++) {
          if (top[x] >= H) continue;
          for (let y = top[x]; y < H; y++) set(x, y, FC);
          if (GL) { set(x, top[x], GL); if ((x & 1) === 0) set(x, top[x] + 1, GL); }   // light catching the top edge
          if (GL && st === 'rocks' && rnd() < 0.03 && H - top[x] > 10) set(x, top[x] + 4 + Math.floor(rnd() * (H - top[x] - 8)), GL);
        }
        if (st === 'cheese') for (const [hx, hy, hr] of [[64, 54, 5], [84, 58, 3.5], [514, 50, 7], [540, 56, 4], [500, 58, 3], [330, 58, 3]]) {
          for (let y = -hr; y <= hr; y++) for (let x = -hr; x <= hr; x++) if (x * x + y * y <= hr * hr) clr(hx + x, hy + y);   // gruyère holes right through
          if (GL) for (let k = 0; k < 8; k++) { const q = k / 8 * Math.PI; set(hx + Math.cos(q + Math.PI) * hr, hy + Math.sin(q + Math.PI) * hr, GL); }   // lit lip
        }
      }
    });
  }
  // lava cracks under the crust, in the outer band (that's the bit you ever see)
  if (cfg.cracks) {
    const CC = cfg.cracks, rnd = rng(9090);
    depthCanvas(scene, 'dcrack' + id, S, S, D => {
      const put = (x, y, a) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= S || y >= S) return; const i = (y * S + x) * 4; D[i] = CC[0]; D[i + 1] = CC[1]; D[i + 2] = CC[2]; D[i + 3] = Math.max(D[i + 3], a); };
      const veins = cfg.crackStyle === 'veins';                                  // blue-cheese veins: longer, wandering, branching
      for (let n = 0; n < (veins ? 46 : 70); n++) {
        let a = rnd() * Math.PI * 2, r = c * (0.8 + rnd() * 0.16);
        for (let k = 0; k < (veins ? 30 : 14); k++) {
          if (veins) { a += (rnd() - 0.5) * 0.05; if (rnd() < 0.08) { let b = a, rr = r; for (let j = 0; j < 8; j++) { b += (rnd() - 0.5) * 0.06 + 0.012; rr -= 0.7; put(c + Math.cos(b) * rr, c + Math.sin(b) * rr, 170); } } }
          const x = c + Math.cos(a) * r, y = c + Math.sin(a) * r;
          put(x, y, 255); if (rnd() < 0.5) put(x + 1, y, 160);
          a += (rnd() - 0.5) * 0.02; r -= 0.6 + rnd() * 0.8;
          if (rnd() < 0.15) { const b = a + (rnd() < 0.5 ? 0.01 : -0.01); put(c + Math.cos(b) * r, c + Math.sin(b) * r, 200); }
        }
      }
    });
  }
}

const DepthMixin = {
  depthInit() {
    const cfg = this.def.depth; if (!cfg || !this.planetImg) return;
    const id = this.levelId;
    makeDepthTextures(this, id, R, cfg);
    const F = this.depthFx = { cfg, ridges: [] };
    (cfg.ridges || []).forEach((rg, n) => F.ridges.push({ im: this.add.image(0, 0, 'dridge' + id + '_' + n).setDepth(rg.depth || 0.36), k: rg.k || 0.6 }));
    F.shade = this.add.image(0, 0, 'dshade' + id).setDepth(1.108);
    F.rim = this.add.image(0, 0, 'drim' + id).setDepth(1.115).setBlendMode(Phaser.BlendModes.ADD);
    if (cfg.cracks) F.crack = this.add.image(0, 0, 'dcrack' + id).setDepth(1.06).setBlendMode(Phaser.BlendModes.ADD);
    if (cfg.fg) F.fg = this.add.tileSprite(0, 0, 10, 64, 'dfg' + id).setOrigin(0, 1).setDepth(8.45).setScrollFactor(0);
  },
  drawDepth(cx, cy, Rz, unwV) {
    const F = this.depthFx; if (!F) return;
    const S = F.shade.width, ps = (2 * Rz) / S;
    F.shade.setPosition(cx, cy).setScale(ps);
    F.rim.setPosition(cx, cy).setScale(ps);
    if (F.crack) F.crack.setPosition(cx, cy).setScale(ps).setRotation(-unwV).setAlpha((F.cfg.crackA || 0.55) + 0.3 * Math.sin(this.t * (F.cfg.crackPulse || 1.7)));
    for (const r of F.ridges) r.im.setPosition(cx, cy).setScale(ps).setRotation(-unwV * r.k);   // same pixels-per-unit as the planet: same scale
    if (F.fg) {
      const W = this.scale.width, H = this.scale.height, k = Math.max(1, this.zoom * 1.6);
      F.fg.setPosition(0, H + 2).setSize(W, 64 * k).setTileScale(k).setTilePosition(unwV * R * this.zoom * 1.5 / k, 0);
    }
  }
};
