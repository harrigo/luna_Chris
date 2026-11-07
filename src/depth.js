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
  if (scene.textures.exists(key)) scene.textures.remove(key);
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
      const i = (y * S + x) * 4; D[i] = DK[0]; D[i + 1] = DK[1]; D[i + 2] = DK[2]; D[i + 3] = [0, 70, 120, 165][band];
    }
  });
  // rim light + atmosphere (ADD), a little bigger than the planet
  const S2 = Math.round(S * 1.12), c2 = S2 / 2, RIM = cfg.rim || [255, 220, 160], AT = cfg.atmo || RIM;
  depthCanvas(scene, 'drim' + id, S2, S2, D => {
    for (let y = 0; y < S2; y++) for (let x = 0; x < S2; x++) {
      const dx = (x + 0.5 - c2) / c, dy = (y + 0.5 - c2) / c, d = Math.hypot(dx, dy), th = DEPTH_BAYER[(y & 3) * 4 + (x & 3)];
      const face = (dx * lx + dy * ly) / (d || 1);                            // how much this edge faces the light
      const i = (y * S2 + x) * 4;
      if (d <= 1 && d > 0.982 && face > 0.05) { const a = Math.min(1, (face - 0.05) * 1.6); if (a > th * 0.9) { D[i] = RIM[0]; D[i + 1] = RIM[1]; D[i + 2] = RIM[2]; D[i + 3] = 200; } }
      else if (d > 1 && d < 1.07) { const k = (1 - (d - 1) / 0.07) * (0.4 + 0.6 * Math.max(0, face)); if (k > th) { D[i] = AT[0]; D[i + 1] = AT[1]; D[i + 2] = AT[2]; D[i + 3] = 70; } }
    }
  });
  // parallax hill rings
  (cfg.ridges || []).forEach((rg, n) => {
    const outer = Rw + rg.off + rg.amp, Sr = Math.round(outer), cr = Sr / 2;   // half resolution (like the planet)
    const rnd = rng(rg.seed || (77 + n * 31)), steps = 720, prof = [];
    let v = 0; for (let i = 0; i < steps; i++) { v += (rnd() - 0.5) * 0.35; v *= 0.96; prof.push(v); }
    const hill = a => {                                                         // jagged hills: a couple of octaves + the random walk
      const i = Math.floor((a / (Math.PI * 2)) * steps + steps) % steps;
      return 0.55 + 0.25 * Math.sin(a * 7 + n) + 0.15 * Math.sin(a * 19 + n * 2) + 0.35 * prof[i];
    };
    const C = rg.col, TOP = rg.top || C.map(x => Math.min(255, x + 40));
    depthCanvas(scene, 'dridge' + id + '_' + n, Sr, Sr, D => {
      for (let y = 0; y < Sr; y++) for (let x = 0; x < Sr; x++) {
        const dx = x + 0.5 - cr, dy = y + 0.5 - cr, dd = Math.hypot(dx, dy) / cr * outer;   // distance in world units
        if (dd < Rw - 8) continue;
        const a = Math.atan2(dy, dx), top = Rw + rg.off + rg.amp * Math.max(0, Math.min(1, hill(a)));
        if (dd > top) continue;
        const i = (y * Sr + x) * 4, th = DEPTH_BAYER[(y & 3) * 4 + (x & 3)], edge = top - dd < 3 && th < 0.6;
        const col = edge ? TOP : C;
        D[i] = col[0]; D[i + 1] = col[1]; D[i + 2] = col[2]; D[i + 3] = 255;
        if (rg.glow && top - dd > 6 && th < 0.03 && rnd() < 0.08) { D[i] = rg.glow[0]; D[i + 1] = rg.glow[1]; D[i + 2] = rg.glow[2]; }   // little lava lights in the hills
      }
    });
  });
  // foreground rocks: a strip along the bottom of the screen, mostly empty, a crag every so often
  if (cfg.fg) {
    const W = 640, H = 64, FC = cfg.fg.col, GL = cfg.fg.glow, rnd = rng(4242);
    depthCanvas(scene, 'dfg' + id, W, H, D => {
      // a few chunky boulders (two or three lumps each), low enough to keep out of the way, lit by the lava on top
      const crags = [[70, 40, 24], [100, 26, 16], [52, 22, 13], [330, 30, 14], [520, 46, 30], [556, 30, 20], [492, 24, 12]];
      const set = (x, y, c) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const i = (y * W + x) * 4; D[i] = c[0]; D[i + 1] = c[1]; D[i + 2] = c[2]; D[i + 3] = 255; };
      const top = new Array(W).fill(H);
      for (const [cx, w, hh] of crags) for (let x = cx - w; x <= cx + w; x++) {
        const d = (x - cx) / w; if (Math.abs(d) >= 1) continue;
        const y = Math.round(H - hh * Math.sqrt(1 - d * d)); if (x >= 0 && x < W) top[x] = Math.min(top[x], y);
      }
      for (let x = 0; x < W; x++) {
        if (top[x] >= H) continue;
        for (let y = top[x]; y < H; y++) set(x, y, FC);
        if (GL) { set(x, top[x], GL); if ((x & 1) === 0) set(x, top[x] + 1, GL); }           // lava light catching the top edge
        if (GL && rnd() < 0.03 && H - top[x] > 10) set(x, top[x] + 4 + Math.floor(rnd() * (H - top[x] - 8)), GL);
      }
    });
  }
  // lava cracks under the crust, in the outer band (that's the bit you ever see)
  if (cfg.cracks) {
    const CC = cfg.cracks, rnd = rng(9090);
    depthCanvas(scene, 'dcrack' + id, S, S, D => {
      const put = (x, y, a) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= S || y >= S) return; const i = (y * S + x) * 4; D[i] = CC[0]; D[i + 1] = CC[1]; D[i + 2] = CC[2]; D[i + 3] = Math.max(D[i + 3], a); };
      for (let n = 0; n < 70; n++) {
        let a = rnd() * Math.PI * 2, r = c * (0.8 + rnd() * 0.16);
        for (let k = 0; k < 14; k++) {
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
    if (F.crack) F.crack.setPosition(cx, cy).setScale(ps).setRotation(-unwV).setAlpha(0.55 + 0.3 * Math.sin(this.t * 1.7));
    for (const r of F.ridges) r.im.setPosition(cx, cy).setScale(ps).setRotation(-unwV * r.k);   // same pixels-per-unit as the planet: same scale
    if (F.fg) {
      const W = this.scale.width, H = this.scale.height, k = Math.max(1, this.zoom * 1.6);
      F.fg.setPosition(0, H + 2).setSize(W, 64 * k).setTileScale(k).setTilePosition(unwV * R * this.zoom * 1.5 / k, 0);
    }
  }
};
