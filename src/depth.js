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

function makeDepthTextures(scene, id, Rw, cfg, res) {
  res = res || 1; const sfx = res > 1 ? 'hd' : '';                         // (v3.79) res 2: full resolution (the pixels match the sprites')
  if (res > 1) id = id + sfx;
  const S = Math.round(Rw * res), c = S / 2, L = cfg.light || [-0.55, -0.75, 0.45], Ln = Math.hypot(L[0], L[1], L[2]);
  const lx = L[0] / Ln, ly = L[1] / Ln, lz = L[2] / Ln, DK = cfg.dark || [20, 8, 30];
  // sphere shading (normal blend: dark pixels at four strengths, dithered between)
  depthCanvas(scene, 'dshade' + id, S, S, D => {
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const dx = (x + 0.5 - c) / c, dy = (y + 0.5 - c) / c, d2 = dx * dx + dy * dy;
      if (d2 > 1) continue;
      const nz = Math.sqrt(1 - d2), lam = Math.max(0, dx * lx + dy * ly + nz * lz);
      const q = (1 - lam) * 3.2, th = cfg.clean !== false ? (((x + y) & 1) ? 0.62 : 0.38) : DEPTH_BAYER[(y & 3) * 4 + (x & 3)], band = Math.min(3, Math.floor(q + th - 0.5));   // (clean, v3.75: flat bands, a checker only on the seams)
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
      else if (d > 1 && d < 1 + AW) { const k = (1 - (d - 1) / AW) * (0.4 + 0.6 * Math.max(0, face)); if (cfg.clean !== false ? (k > 0.55 || (k > 0.35 && ((x + y) & 1))) : k > th) { /* (clean: a solid inner ring, one checker ring outside it) */ D[i] = AT[0]; D[i + 1] = AT[1]; D[i + 2] = AT[2]; D[i + 3] = cfg.atmoA || 70; } }
    }
  });
  // parallax hill rings
  (cfg.ridges || []).forEach((rg, n) => {
    const outer = Rw + rg.off + rg.amp + ({ wrecks: 90, factory: 130, cogs: 50, tiers: 40, skyline: 150, machines: 160, reef: 140 }[rg.style] || 0) * (rg.size || 1), Sr = Math.round(outer * res), cr = Sr / 2;   // (room for the ships' masts)   // half resolution (like the planet)
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
      if (st === 'gorge') {                                                     // (v2.61) canyon country: flat-topped mesas in steps, sheer sides, slot canyons cut through, the odd needle butte
        const raw = 0.5 + 0.3 * Math.sin(a * 4 + n * 2) + 0.2 * Math.sin(a * 9 + n) + 0.3 * walk(a);
        let h = Math.round(Math.max(0.12, Math.min(1, raw)) * 4) / 4 + 0.02 * Math.sin(a * 60);
        for (const f of feats) { const d = Math.abs(dA(a, f.a)) / (f.w * 0.7);
          if (f.s < 0.4 && d < 1) h = Math.min(h, 0.06 + 0.2 * d * d);            // a slot canyon
          else if (f.s > 0.8 && d < 0.6) h = Math.max(h, f.h * (d < 0.35 ? 1 : 0.86)); }   // a needle
        return h;
      }
      if (st === 'reef') return 0.1 + 0.07 * Math.sin(a * 13 + n) + 0.05 * walk(a) + 0.05 * Math.max(0, Math.sin(a * 31 + n * 2));   // (v2.83) the seabed: rubble and brain-coral mounds
      if (st === 'skyline' || st === 'machines') return 0.12 + 0.08 * Math.sin(a * 11 + n) + 0.06 * walk(a);   // (v2.81) rubble between the buildings
      if (st === 'wrecks' || st === 'factory' || st === 'cogs' || st === 'tiers') return 0.16 + 0.1 * Math.sin(a * 6 + n) + 0.06 * walk(a);
      return 0.55 + 0.25 * Math.sin(a * 7 + n) + 0.15 * Math.sin(a * 19 + n * 2) + 0.35 * walk(a);   // jagged hills
    };
    // the lost ships of the Brie-muda Triangle, half sunk on the far dunes: a tilted hull, masts, crossbars, rags of sail
    // a factory city on the far horizon: blocks, chimneys, the odd crane, rows of lit windows (2 = a lit window)
    const factory = (a, dd) => {
      const Z = rg.size || 1, v = (dd - (Rw + rg.off)) / Z;
      for (const f of feats) {
        const u = dA(a, f.a) * Rw / Z, w = 16 + f.s * 34, hh = 26 + f.h * 64;
        if (Math.abs(u) < w / 2 && v < hh && v > -10) {
          if (v > 4 && v < hh - 5 && Math.abs(u) < w / 2 - 3 && (Math.floor(v) % 7) < 3 && (Math.floor(u + 50) % 6) < 3) {
            const lit = Math.sin(Math.floor((u + 50) / 6) * 12.9898 + Math.floor(v / 7) * 78.233 + f.a * 9) * 43758.5;
            if (lit - Math.floor(lit) < 0.35) return 2;
          }
          return 1;
        }
        if (f.s < 0.35 && Math.abs(u - w * 0.25) < 3 && v < hh + 26 + f.h * 18 && v > 0) return 1;           // chimney
        if (f.s > 0.85) {                                                                                    // gantry crane
          if (Math.abs(u + w * 0.6) < 2 && v < hh + 50 && v > 0) return 1;
          if (Math.abs(v - (hh + 48)) < 1.6 && u > -w * 0.6 - 4 && u < -w * 0.6 + 46) return 1;
          if (Math.abs(u - (-w * 0.6 + 40)) < 0.8 && v > hh + 22 && v < hh + 48) return 1;
        }
      }
      return 0;
    };
    // great half-buried cogwheels (teeth, a hub hole)
    const cogs = (a, dd) => {
      const Z = rg.size || 1, v = (dd - (Rw + rg.off)) / Z;
      for (const f of feats) {
        if (f.s > 0.55) continue;
        const rad = 16 + f.h * 26, u = dA(a, f.a) * Rw / Z, cy0 = rad * 0.35, q = Math.hypot(u, v - cy0);
        if (q > rad + 5) continue;
        if (q < rad * 0.28) return 0;
        const ang = Math.atan2(v - cy0, u), teeth = Math.round(rad / 3.2), tooth = ((ang / (2 * Math.PI) * teeth * 2 + 64) % 2) < 1;
        if (q < rad || (tooth && q < rad + 5)) return q > rad * 0.5 && q < rad * 0.62 ? 2 : 1;
      }
      return 0;
    };
    // gilded fountain tiers: stepped basins, cheese pouring off every lip (3 = cheese)
    const tiers = (a, dd) => {
      const Z = rg.size || 1, v = (dd - (Rw + rg.off)) / Z;
      for (const f of feats) {
        if (f.s > 0.5) continue;
        const u = dA(a, f.a) * Rw / Z, Wb = 34 + f.s * 60, hl = (24 + f.h * 26) / 3;
        if (Math.abs(u) > Wb + 8) continue;
        if (Math.abs(u) < 2.2 && v >= 3 * hl && v < 3 * hl + 14 + f.h * 10) return 3;                        // the spout on top
        for (let k = 2; k >= 0; k--) {
          const wk = Wb * (1 - k / 3.3), lo = k * hl, hi = (k + 1) * hl;
          if (Math.abs(u) < wk && v < hi && v >= lo - 1) return hi - v < 2 ? 2 : (hi - v < 4 && ((Math.floor(u) & 3) === 0) ? 3 : 1);
          if (Math.abs(u) >= wk && Math.abs(u) < wk + 2.6 && v < hi && v >= 0) return 3;   // a curtain pouring off the lip
        }
      }
      return 0;
    };
    // (v2.81) L9: the imperial city's skyline - domed palaces (some with a bite out of the dome), minarets (some
    // leaning), colonnades with snapped columns, arches; little lit windows (2) and a lit rim along the tops (3)
    const hsh = (x, y) => { let q = (Math.floor(x) * 374761393 + Math.floor(y) * 668265263 + n * 977) | 0; q = (q ^ (q >>> 13)) * 1274126177 | 0; return ((q ^ (q >>> 16)) >>> 0) / 4294967296; };
    const skyline = (a, dd) => {
      const Z = rg.size || 1, v = (dd - (Rw + rg.off)) / Z;
      for (const f of feats) {
        const u0 = dA(a, f.a) * Rw / Z; if (Math.abs(u0) > 70) continue;
        if (f.s < 0.3) {                                                       // a domed palace
          const Wb = 34 + f.h * 34, Hb = 26 + f.h * 34, rd = Wb * 0.34, u = u0;
          if (Math.abs(u) < Wb / 2 && v < Hb && v > -4) { const win = (Math.floor(u + 200) % 9) < 3 && (Math.floor(v) % 13) > 3 && (Math.floor(v) % 13) < 9; return win && hsh(u / 9, v / 13) < 0.7 ? 2 : (Hb - v < 1.5 ? 3 : 1); }
          if (f.s < 0.12 && Math.hypot(u - rd * 0.55, v - Hb - rd * 0.7) < rd * 0.55) continue;   // a bite out of the dome
          const dv = v - Hb; if (dv >= 0 && dv < rd * 1.5) { const half = rd * Math.sqrt(Math.max(0, 1 - Math.pow(dv / (rd * 1.5), 2))) * (dv < rd * 0.3 ? 0.9 + dv / rd : 1.2 - dv / (rd * 1.5) * 0.6); if (Math.abs(u) < half) return Math.abs(u) > half - 1.4 && u < 0 ? 3 : 1; }
          if (Math.abs(u) < 1.2 && v >= Hb + rd * 1.4 && v < Hb + rd * 1.5 + 12) return 1;                 // the spike on top
          for (const sx of [-Wb / 2 + 4, Wb / 2 - 4]) { const uu = u - sx; if (Math.abs(uu) < 4 && v < Hb + 18) return 1; if (v >= Hb + 18 && v < Hb + 26 && Math.abs(uu) < 4 * (1 - (v - Hb - 18) / 8) + 0.5) return 1; }   // corner turrets
        } else if (f.s < 0.48) {                                               // a minaret, maybe leaning
          const Hm = 70 + f.h * 70, u = u0 - v * f.tilt * 0.4, w = 3 + f.h * 2.5;
          if (v < 0) continue;
          if (v < Hm && Math.abs(u) < w) return (Math.floor(v) % 17) < 3 && Math.abs(u) < 1 ? 2 : (u < -w + 1.2 ? 3 : 1);
          for (const bh of [Hm * 0.55, Hm * 0.82]) if (Math.abs(v - bh) < 2 && Math.abs(u) < w + 3) return 1;   // balconies
          if (v >= Hm && v < Hm + 16 && Math.abs(u) < w * (1 - (v - Hm) / 16) + 0.4) return 1;                 // the point
        } else if (f.s < 0.66) {                                               // a colonnade, some columns snapped
          const Wc = 60, Hc = 30 + f.h * 12, u = u0;
          if (Math.abs(u) > Wc / 2 + 4 || v < 0) continue;
          const ci = Math.floor((u + Wc / 2) / 10), inCol = ((u + Wc / 2) % 10) < 4, broke = hsh(ci, f.a * 100) < 0.35;
          if (inCol && v < (broke ? Hc * (0.4 + hsh(ci, 7) * 0.4) : Hc)) return u - (ci * 10 - Wc / 2) < 1.2 ? 3 : 1;
          if (v >= Hc && v < Hc + 5 && Math.abs(u) < Wc / 2 + 3 && hsh(Math.floor(u / 12), 3) > 0.25) return v > Hc + 3.5 ? 3 : 1;   // the entablature (gaps where it's fallen)
          if (v >= Hc + 5 && v < Hc + 5 + 14 * (1 - Math.abs(u) / (Wc / 2 + 3)) && hsh(Math.floor(u / 12), 3) > 0.25) return 1;      // pediment
        } else if (f.s < 0.78) {                                               // a triumphal arch
          const Wa = 50, Ha = 46, u = u0;
          if (Math.abs(u) < Wa / 2 && v >= 0 && v < Ha) { if (Math.abs(u) < 10 && v < 24 + Math.sqrt(Math.max(0, 100 - u * u)) * 0.8) return 0; return Ha - v < 1.5 ? 3 : 1; }
        }
      }
      return 0;
    };
    // (v2.81) L9: the mining machines on the horizon - lattice drill rigs (a warning lamp on top), cranes with a grater
    // hanging off the jib, grater boxes on tracks
    const machines = (a, dd) => {
      const Z = rg.size || 1, v = (dd - (Rw + rg.off)) / Z;
      for (const f of feats) {
        const u = dA(a, f.a) * Rw / Z; if (Math.abs(u) > 80) continue;
        if (f.s < 0.35) {                                                      // drill rig
          const Ht = 80 + f.h * 70; if (v < -10 || v > Ht + 14) continue;
          const half = 14 * (1 - v / Ht) + 4;
          if (v >= 0 && v < Ht && (Math.abs(Math.abs(u) - half) < 1.6)) return 1;                                        // legs
          if (v >= 0 && v < Ht && Math.abs(u) < half && Math.abs(((v + u * (Math.floor(v / 14) % 2 ? 1 : -1) * 0.9) % 14)) < 1.2) return 1;   // bracing
          if (v >= Ht && v < Ht + 8 && Math.abs(u) < 8) return 1;
          if (v >= Ht + 8 && v < Ht + 12 && Math.abs(u) < 2.5) return 2;                                                  // warning lamp
          if (v < 0 && v > -10 && Math.abs(u) < 5 * (1 + v / 10)) return 1;
        } else if (f.s < 0.6) {                                                // crane
          const Hc = 90 + f.h * 50, J = 50 + f.h * 30, sd = f.tilt > 0 ? 1 : -1;
          if (v >= 0 && v < Hc && Math.abs(u) < 2.4) return 1;
          if (v >= Hc && v < Hc + 4 && u * sd > -10 && u * sd < J) return 1;
          if (Math.abs(u * sd - J + 6) < 0.8 && v < Hc && v > Hc - 30) return 1;                                         // cable
          const gu = u * sd - (J - 6), gv = v - (Hc - 46); if (Math.abs(gu) < 9 - gv * 0.1 && gv >= 0 && gv < 16) return ((Math.floor(gu + 20) % 4) === 0 && (Math.floor(gv) % 4) === 1) ? 2 : 1;   // the grater on the hook
        } else if (f.s < 0.75) {                                               // grater crawler
          if (v >= 0 && v < 8 && Math.abs(u) < 26) return 1;
          if (v >= 8 && v < 52 && Math.abs(u) < 20 - (v - 8) * 0.18) return ((Math.floor(u + 40) % 5) === 0 && (Math.floor(v) % 6) === 2) ? 2 : (u < -18 + (v - 8) * 0.18 + 1.2 ? 3 : 1);
        }
      }
      return 0;
    };
    // (v2.83) L7: the deep reef - branching coral towers, lacy sea fans, tall kelp ribbons with bladders, rock arches;
    // the coral tips and the anemones glow (2)
    const reef = (a, dd) => {
      const Z = rg.size || 1, v = (dd - (Rw + rg.off)) / Z;
      for (const f of feats) {
        const u = dA(a, f.a) * Rw / Z; if (Math.abs(u) > 70 || v < -4) continue;
        if (f.s < 0.28) {                                                      // a branching coral tower
          const Ht = 50 + f.h * 60; if (v > Ht + 30) continue;
          if (v < Ht && Math.abs(u) < 3.5 - v / Ht * 1.5) return 1;
          for (let b = 0; b < 4; b++) { const by = Ht * (0.3 + b * 0.18), sd = b % 2 ? 1 : -1, L = 18 + (3 - b) * 5 + f.h * 8;
            const t = (u * sd) / L; if (t < 0 || t > 1) continue; const cy = by + t * L * 0.9 + t * t * 6; if (Math.abs(v - cy) < 2.4 - t) return t > 0.93 ? 2 : 1;
            if (t > 0.94 && Math.hypot(u - sd * L, v - cy) < 2.6) return 2; }
          if (Math.hypot(u, v - Ht) < 3) return 2;
        } else if (f.s < 0.5) {                                                // a sea fan: a lacy half-disc on a stalk
          const Rf = 26 + f.h * 22, cy = 12;
          if (v < cy && Math.abs(u) < 1.6) return 1;
          const r = Math.hypot(u, (v - cy) * 1.05), an = Math.atan2(v - cy, u);
          if (v >= cy && r < Rf) { if (Math.abs(r - Rf) < 1.4) return 2; if ((Math.abs(((an * 9) % 1 + 1) % 1 - 0.5) > 0.42) || Math.abs(r % 7 - 3.5) > 3)return 1; }
        } else if (f.s < 0.78) {                                               // kelp: a tall wavy ribbon with bladders
          const Hk = 80 + f.h * 90; if (v > Hk) continue;
          const cx = Math.sin(v * 0.07 + f.a * 9) * 7 * (v / Hk), w = 2.2 + Math.sin(v * 0.31 + f.a) * 1.2;
          if (Math.abs(u - cx) < w) return 1;
          if ((Math.floor(v) % 22) > 15 && Math.abs(u - cx - (Math.floor(v / 22) % 2 ? 5 : -5)) < 2.6) return (Math.floor(v) % 22) === 19 ? 2 : 1;
        } else {                                                               // a rock arch
          const Wa = 34 + f.h * 20, Ha = 30 + f.h * 26;
          if (Math.abs(u) < Wa && v < Ha * (1 - Math.pow(u / Wa, 6)) && !(Math.abs(u) < Wa * 0.55 && v < Ha * 0.62 * Math.sqrt(Math.max(0, 1 - Math.pow(u / (Wa * 0.55), 2))))) return 1;
        }
      }
      return 0;
    };
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
    // (v3.75) shaded hills: a darker, cooler tone in the lower part of each hill, a crisp lit cap, shadowed hole lips
    const SH = rg.shade !== false ? [Math.round(C[0] * 0.72), Math.round(C[1] * 0.68), Math.round(Math.min(255, C[2] * 0.82 + 10))] : null;
    depthCanvas(scene, 'dridge' + id + '_' + n, Sr, Sr, D => {
      for (let y = 0; y < Sr; y++) for (let x = 0; x < Sr; x++) {
        const dx = x + 0.5 - cr, dy = y + 0.5 - cr, dd = Math.hypot(dx, dy) / cr * outer;   // distance in world units
        if (dd < Rw - 8) continue;
        const a = Math.atan2(dy, dx), top = Rw + rg.off + rg.amp * Math.max(0, Math.min(1, hill(a)));
        const i = (y * Sr + x) * 4, th = DEPTH_BAYER[(y & 3) * 4 + (x & 3)];
        let col = null;
        if (dd <= top) {
          col = top - dd < 3 && th < 0.6 ? TOP : C;
          if (SH) {
            const base = Rw + rg.off, k = (dd - base) / Math.max(1, top - base);
            col = top - dd < 2.5 ? TOP : (top - dd < 4 ? (th < 0.5 ? TOP : C) : (k < 0.42 ? SH : (k < 0.5 ? (th < 0.5 ? SH : C) : C)));
          }
          if (st === 'gorge' && top - dd >= 3) {                                    // banded strata, a lit cap, shadow under every ledge
            const band = Math.floor((dd - Rw - rg.off + 400 + 2.5 * Math.sin(a * 40)) / 7) % 3;
            col = band === 0 ? (rg.strata || C) : (band === 1 && th < 0.35 ? TOP : C);
            if (top - dd < 7 && th < 0.5) col = rg.strata || C;
          }
          if (holes) for (const H of holes) { const hu = dA(a, H.a) * Rw, hv = dd - (Rw + rg.off + rg.amp * H.d * 0.6), q = Math.hypot(hu, hv); if (q < H.r) { col = q > H.r - 1.6 ? (SH && hv > 0 ? SH : TOP) : null; break; } }
        } else if (st === 'wrecks') { const w = wreck(a, dd); if (w) col = w === 2 ? TOP : C; }
        else if (st === 'factory') { const w = factory(a, dd); if (w) col = w === 2 ? (rg.glow || TOP) : (dd - (Rw + rg.off) < 3 ? TOP : C); }
        else if (st === 'cogs') { const w = cogs(a, dd); if (w) col = w === 2 ? TOP : C; }
        else if (st === 'reef') { const w = reef(a, dd); if (w) col = w === 2 ? (rg.glow || TOP) : C; }
        else if (st === 'skyline' || st === 'machines') { const w = (st === 'skyline' ? skyline : machines)(a, dd); if (w) col = w === 2 ? (rg.glow || TOP) : (w === 3 ? TOP : C); }
        else if (st === 'tiers') { const w = tiers(a, dd); if (w) col = w === 3 ? (rg.cheese || TOP) : (w === 2 ? TOP : C); }
        if (!col) continue;
        D[i] = col[0]; D[i + 1] = col[1]; D[i + 2] = col[2]; D[i + 3] = 255;
        if (rg.glow && top - dd > 6 && th < 0.03 && rnd() < (rg.glowP || 0.08)) { D[i] = rg.glow[0]; D[i + 1] = rg.glow[1]; D[i + 2] = rg.glow[2]; }   // little lights in the hills (lava, spores, will-o'-wisps)
      }
    });
  });
  // foreground rocks: a strip along the bottom of the screen, mostly empty, a crag every so often
  if (cfg.fg) {
    const W = 640, H = 64, FC = cfg.fg.col, GL = cfg.fg.glow, rnd = rng(4242);
    const D = new Uint8ClampedArray(W * H * 4);                               // the strip, drawn first...
    (() => {
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
      } else if (st === 'girders') {                                            // factory floor: a leaning truss, hazard bollards, a pipe arch
        for (const [x0, len, ang] of [[20, 70, -0.9], [540, 64, -2.1]]) {
          const ex = x0 + Math.cos(ang) * len, ey = H - 1 + Math.sin(ang) * len;
          for (let t = 0; t <= 1; t += 0.006) for (const off of [-4, 4]) { const x = x0 + (ex - x0) * t - Math.sin(ang) * off, y = H - 1 + (ey - H + 1) * t + Math.cos(ang) * off; set(x, y, FC); set(x + 1, y, FC); }
          for (let k = 0; k < 6; k++) { const t0 = k / 6, t1 = (k + 1) / 6; for (let t = 0; t <= 1; t += 0.05) { const tt = t0 + (t1 - t0) * t, off = -4 + 8 * ((k % 2) ? t : 1 - t); set(x0 + (ex - x0) * tt - Math.sin(ang) * off, H - 1 + (ey - H + 1) * tt + Math.cos(ang) * off, FC); } }   // cross-bracing
        }
        for (const [x0, hh] of [[300, 26], [322, 20], [460, 30]]) for (let y = H - hh; y < H; y++) for (let x = x0; x < x0 + 7; x++) set(x, y, GL && ((y + x) >> 2) % 2 ? GL : FC);   // hazard bollards, striped
        for (let t = 0; t <= Math.PI; t += 0.004) for (let w = 0; w < 7; w++) set(150 + Math.cos(t) * (40 - w), H - 1 - Math.sin(t) * (34 - w), FC);   // pipe arch
        if (GL) for (let t = 0.2; t < Math.PI; t += 0.35) set(150 + Math.cos(t) * 40, H - 2 - Math.sin(t) * 34, GL);
      } else if (st === 'banquet') {                                            // a giant's banquet: a fondue fork stuck in, a kebab skewer, a goblet
        const thick = (x0, y0, x1, y1, w, c) => { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0)); for (let k = 0; k <= n; k++) { const t = k / n; for (let o = -w / 2; o < w / 2; o++) set(x0 + (x1 - x0) * t + o, y0 + (y1 - y0) * t, c); } };
        thick(40, H - 1, 96, 6, 5, FC); thick(96, 6, 104, -8, 3, FC); thick(90, 9, 82, -6, 3, FC); thick(84, 12, 104, 14, 4, FC);   // the fork: shaft, two prongs, a collar
        if (GL) { thick(41, H - 2, 95, 7, 1, GL); set(104, -7, GL); }
        thick(500, H - 1, 610, 18, 3, FC);                                                                  // the skewer...
        for (const [t, rw, rh] of [[0.22, 9, 8], [0.42, 7, 10], [0.62, 10, 7], [0.8, 6, 6]]) { const x = 500 + 110 * t, y = H - 1 - (H - 19) * t; for (let yy = -rh; yy <= rh; yy++) for (let xx = -rw; xx <= rw; xx++) if ((xx * xx) / (rw * rw) + (yy * yy) / (rh * rh) <= 1) set(x + xx, y + yy, FC); if (GL) set(x - rw * 0.5, y - rh * 0.6, GL); }   // ...with chunks on it
        for (let y = 0; y < 30; y++) { const half = y < 14 ? 13 - y * 0.55 : (y < 26 ? 2 : 2 + (y - 25) * 2.4); for (let x = -half; x <= half; x++) set(320 + x, H - 31 + y, FC); }   // a goblet
        if (GL) for (let x = -12; x <= 12; x++) set(320 + x, H - 31, GL);
      } else if (st === 'chips') {                                              // (v2.61) the gorge: giant tortilla chips stuck in at angles, a chilli cactus, rubble
        const tri = (x0, w, hh, lean) => { for (let y = 0; y < hh; y++) { const half = w * (y / hh) / 2, cx = x0 + lean * (hh - y); for (let x = -half; x <= half; x++) set(cx + x, H - hh + y, FC); if (GL) { set(cx + half, H - hh + y, GL); if (y % 9 === 4) set(cx + half * 0.3, H - hh + y, GL); } } };
        tri(40, 46, 58, 0.25); tri(78, 30, 36, -0.3); tri(18, 22, 26, 0.1); tri(520, 52, 62, -0.2); tri(566, 28, 34, 0.35); tri(300, 26, 30, 0.05);
        for (const [cx, hh] of [[430, 44], [150, 30]]) {                                                    // cacti
          for (let y = H - hh; y < H; y++) for (let x = cx - 3; x <= cx + 3; x++) set(x, y, FC);
          for (let y = H - hh * 0.75; y < H - hh * 0.4; y++) { for (let x = cx - 11; x <= cx - 8; x++) set(x, y, FC); for (let x = cx + 8; x <= cx + 11; x++) set(x, y - 5, FC); }
          for (let x = cx - 11; x <= cx + 11; x++) { set(x, H - hh * 0.4, FC); set(x, H - hh * 0.4 - 1, FC); }
          if (GL) { set(cx, H - hh - 1, GL); set(cx - 10, H - hh * 0.75 - 1, GL); set(cx + 10, H - hh * 0.75 - 6, GL); }
        }
        for (const [cx, w, hh] of [[230, 16, 9], [370, 22, 12], [610, 18, 10]]) for (let x = cx - w; x <= cx + w; x++) { const d = (x - cx) / w, y = Math.round(H - hh * Math.sqrt(Math.max(0, 1 - d * d))); for (let yy = y; yy < H; yy++) set(x, yy, FC); if (GL) set(x, y, GL); }
      } else if (st === 'coral') {                                              // (v2.83) L7: the reef, right up against the glass
        const disc = (cx, cy, rx, ry) => { for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) set(cx + x, cy + y, FC); };
        const thick = (x0, y0, x1, y1, w) => { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0)); for (let k = 0; k <= n; k++) { const t = k / n, ww = w * (1 - t * 0.35); for (let o = -ww / 2; o < ww / 2; o++) { set(x0 + (x1 - x0) * t + o, y0 + (y1 - y0) * t, FC); } } };
        const tips = [];
        const br = (x, y, ang, len, w, d) => { const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len; thick(x, y, ex, ey, w); if (d > 0) { br(ex, ey, ang - 0.5, len * 0.72, w * 0.7, d - 1); br(ex, ey, ang + 0.45, len * 0.68, w * 0.7, d - 1); } else tips.push([ex, ey]); };
        br(20, H, -1.75, 22, 7, 3); br(42, H, -1.25, 18, 6, 2);                      // staghorn coral, left
        disc(86, H - 4, 20, 13); disc(112, H - 2, 12, 8);                             // brain coral domes
        for (let k = 0; k < 9; k++) { const a = -Math.PI + 0.25 + k / 8 * (Math.PI - 0.5), L = 20 + (k % 3) * 6; thick(236, H - 6, 236 + Math.cos(a) * L, H - 6 + Math.sin(a) * L * 1.1, 3.5); tips.push([236 + Math.cos(a) * L, H - 6 + Math.sin(a) * L * 1.1]); }   // an anemone
        disc(236, H - 3, 9, 6);
        for (const [x0, hk] of [[330, 58], [344, 46], [358, 62], [600, 50], [612, 64]]) for (let k = 0; k < hk; k++) { const x = x0 + Math.sin(k * 0.12 + x0) * 4 * k / hk; set(x, H - 1 - k, FC); set(x + 1, H - 1 - k, FC); if (k % 14 > 9) { set(x + 2, H - 1 - k, FC); set(x - 1, H - 1 - k, FC); } }   // kelp
        for (let r = 6; r < 30; r += 1) for (let t = 0; t < Math.PI; t += 0.02) { const x = 450 + Math.cos(t) * r, y = H - 4 - Math.sin(t) * r * 1.1; if (r > 27 || (Math.round(t * 30) % 4 === 0) || r % 6 === 0) set(x, y, FC); }   // a sea fan
        for (let y = H - 6; y < H; y++) for (let x = 444; x < 457; x++) set(x, y, FC);
        for (const [cx, w, hh] of [[160, 26, 9], [520, 22, 11], [400, 16, 6]]) for (let x = cx - w; x <= cx + w; x++) { const d = (x - cx) / w, y = Math.round(H - hh * Math.sqrt(Math.max(0, 1 - d * d))); for (let yy = y; yy < H; yy++) set(x, yy, FC); }   // rocks
        if (GL) { for (const [x, y] of tips) { set(x, y, GL); set(x + 1, y, GL); set(x, y - 1, [255, 140, 220]); } for (let k = 0; k < 7; k++) set(80 + k * 5, H - 14 + (k % 2) * 3, GL); }
      } else if (st === 'ruins') {                                              // (v2.81) L9: the ruins of the imperial city, up close
        const disc = (cx, cy, rx, ry) => { for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) set(cx + x, cy + y, FC); };
        const thick = (x0, y0, x1, y1, w) => { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0)); for (let k = 0; k <= n; k++) { const t = k / n; for (let o = -w / 2; o < w / 2; o++) set(x0 + (x1 - x0) * t + o, y0 + (y1 - y0) * t, FC); } };
        // a snapped fluted column with a jagged top
        for (let x = 22; x <= 44; x++) { const top = 8 + Math.round(5 * Math.abs(Math.sin(x * 1.7)) + (x > 36 ? (x - 36) * 1.5 : 0)); for (let y = top; y < H; y++) set(x, y, FC); }
        for (let x = 16; x <= 50; x++) for (let y = H - 5; y < H; y++) set(x, y, FC);
        // its fallen drum, rolled away
        disc(66, H - 9, 9, 9);
        // the toppled marble head of the King, on its side, crown and all
        disc(120, H - 16, 20, 16); thick(134, H - 22, 160, H - 14, 9); disc(160, H - 13, 4, 4);
        for (const [x, h] of [[100, 10], [106, 16], [112, 9], [118, 15]]) thick(x, H - 30, x - 3, H - 30 - h, 4);
        // an ornate lamp post, its lantern still lit
        thick(232, H, 232, 6, 3); thick(232, 10, 244, 6, 2); for (let y = 6; y < 16; y++) for (let x = 241; x < 248; x++) set(x, y, FC);
        // rubble and a slab
        for (const [cx, w, hh] of [[300, 26, 10], [330, 14, 16], [352, 18, 8], [600, 22, 12], [624, 12, 18]]) for (let x = cx - w; x <= cx + w; x++) { const d = (x - cx) / w, y = Math.round(H - hh * Math.sqrt(Math.max(0, 1 - d * d)) - (x % 5 === 0 ? 2 : 0)); for (let yy = y; yy < H; yy++) set(x, yy, FC); }
        // a tattered royal banner on a pole
        thick(420, H, 420, 2, 3); for (let x = 422; x < 446; x++) { const bot = 30 + Math.round(6 * Math.sin(x * 0.9)) + ((x % 7) < 2 ? 8 : 0); for (let y = 4; y < bot; y++) set(x, y, FC); }
        // a shard of the gold dome, half buried, curving up
        for (let t = 0; t <= Math.PI * 0.6; t += 0.01) for (let w = 0; w < 6; w++) set(520 - Math.cos(t) * (40 - w), H + 4 - Math.sin(t) * (40 - w), FC);
        // the lit edges: every top edge catches the burning sky
        if (GL) { for (let x = 0; x < W; x++) { let y = 0; while (y < H && !D[(y * W + x) * 4 + 3]) y++; if (y < H) { set(x, y, GL); if (x & 1) set(x, y + 1, GL); } }
          for (let y = 7; y < 15; y++) for (let x = 242; x < 247; x++) set(x, y, [255, 230, 140]); }   // the lantern
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
    })();
    // ...then wrapped round a RING, so the foreground follows a curve just like the planet (convex: highest in the middle
    // of the screen, dropping away out of sight at the sides) instead of a flat strip that rose up at the screen edges
    const Rb = 700, reps = Math.max(1, Math.round(2 * Math.PI * Rb / W)), Sr = 2 * (Rb + H) + 2, cr = Sr / 2;
    depthCanvas(scene, 'dfg' + id, Sr, Sr, R2 => {
      for (let y = 0; y < Sr; y++) for (let x = 0; x < Sr; x++) {
        const dx = x + 0.5 - cr, dy = y + 0.5 - cr, dd = Math.hypot(dx, dy), v = Math.floor(H - (dd - Rb));
        if (v < 0 || v >= H) continue;
        const u = Math.floor(((Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI)) * reps * W) % W, j = (v * W + u) * 4;
        if (!D[j + 3]) continue;
        const i = (y * Sr + x) * 4; R2[i] = D[j]; R2[i + 1] = D[j + 1]; R2[i + 2] = D[j + 2]; R2[i + 3] = 255;
      }
    });
  }
  // a gilded, riveted rim with scrollwork round the edge of the planet (turns with it; normal blend)
  if (cfg.ornate) {
    const O = cfg.ornate, G0 = O.hi || [255, 240, 160], G1 = O.mid || [232, 182, 60], G2 = O.lo || [138, 92, 20], b0 = O.w || 0.05;
    depthCanvas(scene, 'dorn' + id, S, S, D => {
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const dx = x + 0.5 - c, dy = y + 0.5 - c, r = Math.hypot(dx, dy) / c;
        if (r > 1 || r < 1 - b0) continue;
        const a = Math.atan2(dy, dx), q = (1 - r) / b0, px = 1 / c / b0, i = (y * S + x) * 4;   // q: 0 at the lip, 1 at the inner edge
        let col = G1;
        if (q < 2.2 * px || q > 1 - 1.6 * px) col = G0;                                                      // bright lip and inner bead
        else if (q < 3.4 * px || q > 1 - 2.8 * px) col = G2;
        else {
          const per = 0.035, ph = ((a / per) % 1 + 1) % 1, rv = Math.hypot((ph - 0.5) * per * c, (q - 0.5) / px);   // rivets
          const sw = 0.5 + 0.28 * Math.sin(a / per * Math.PI * 2 + (ph < 0.5 ? 0 : Math.PI));                        // scrollwork
          if (rv < 2.3) col = rv < 1.1 ? G0 : G2;
          else if (Math.abs(q - sw) < 1.2 * px && Math.abs(ph - 0.5) > 0.12) col = G2;
          else if (Math.abs(q - sw) < 2.2 * px && Math.abs(ph - 0.5) > 0.12) col = G0;
        }
        D[i] = col[0]; D[i + 1] = col[1]; D[i + 2] = col[2]; D[i + 3] = 255;
      }
    });
  }
  // lava cracks under the crust, in the outer band (that's the bit you ever see)
  if (cfg.cracks) {
    const CC = cfg.cracks, rnd = rng(9090);
    depthCanvas(scene, 'dcrack' + id, S, S, D => {
      const put = (x, y, a) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= S || y >= S) return; const i = (y * S + x) * 4; D[i] = CC[0]; D[i + 1] = CC[1]; D[i + 2] = CC[2]; D[i + 3] = Math.max(D[i + 3], a); };
      if (cfg.crackStyle === 'seams') {                                         // machine plating: glowing seams round and across the deck, lights where they meet
        for (const f of [0.9, 0.82]) for (let a = 0; a < Math.PI * 2; a += 0.0015) if ((Math.floor(a * 40) % 5) !== 0) put(c + Math.cos(a) * c * f, c + Math.sin(a) * c * f, 150);
        for (let a = 0; a < Math.PI * 2; a += 0.11) { for (let f = 0.78; f < 0.95; f += 0.002) put(c + Math.cos(a) * c * f, c + Math.sin(a) * c * f, 130); for (const f of [0.9, 0.82]) for (let k = -1; k <= 1; k++) put(c + Math.cos(a) * c * f + k, c + Math.sin(a) * c * f, 255); }
        return;
      }
      const veins = cfg.crackStyle === 'veins';                                  // blue-cheese veins: longer, wandering, branching
      for (let n = 0; n < (veins ? 46 : 70); n++) {
        let a = rnd() * Math.PI * 2, r = c * (0.8 + rnd() * 0.16);
        for (let k = 0; k < (veins ? 30 : 14); k++) {
          if (veins) { a += (rnd() - 0.5) * 0.05; if (rnd() < 0.08) { let b = a, rr = r; for (let j = 0; j < 8; j++) { b += (rnd() - 0.5) * 0.06 + 0.012; rr -= 0.7 * res; put(c + Math.cos(b) * rr, c + Math.sin(b) * rr, 170); } } }
          const x = c + Math.cos(a) * r, y = c + Math.sin(a) * r;
          put(x, y, 255); if (rnd() < 0.5) put(x + 1, y, 160);
          a += (rnd() - 0.5) * 0.02 / res; r -= (0.6 + rnd() * 0.8) * res;
          if (rnd() < 0.15) { const b = a + (rnd() < 0.5 ? 0.01 : -0.01); put(c + Math.cos(b) * r, c + Math.sin(b) * r, 200); }
        }
      }
    });
  }
}

const DepthMixin = {
  depthInit() {
    const cfg = this.def.depth; if (!cfg || !this.planetImg) return;
    const id = this.camp ? 77 : this.levelId;   // (v3.142) the camp's own ridges
    const res = this.pixRes || 1, did = res > 1 ? id + 'hd' : id;
    makeDepthTextures(this, id, R, cfg, res);
    const F = this.depthFx = { cfg, ridges: [], res };
    (cfg.ridges || []).forEach((rg, n) => F.ridges.push({ im: this.add.image(0, 0, 'dridge' + did + '_' + n).setDepth(rg.depth || 0.36), k: rg.k || 0.6 }));
    F.shade = this.add.image(0, 0, 'dshade' + did).setDepth(1.108);
    F.rim = this.add.image(0, 0, 'drim' + did).setDepth(1.115).setBlendMode(Phaser.BlendModes.ADD);
    if (cfg.cracks) F.crack = this.add.image(0, 0, 'dcrack' + did).setDepth(1.06).setBlendMode(Phaser.BlendModes.ADD);
    if (cfg.ornate) F.orn = this.add.image(0, 0, 'dorn' + did).setDepth(1.125);
    if (cfg.fg) { F.fg = this.add.image(0, 0, 'dfg' + did).setDepth(8.45).setScrollFactor(0); F.fgRb = 700; }
  },
  drawDepth(cx, cy, Rz, unwV) {
    const F = this.depthFx; if (!F) return;
    { const under = !!(this.cave && this.cave.ring > 0);                       // (v2.72) down in the L8 labyrinth: none of it
      for (const o of [F.shade, F.rim, F.crack, F.orn, F.fg, ...F.ridges.map(r => r.im)]) if (o) o.setVisible(!under);
      if (this.pp && this.pp.layer > 0) for (const o of [F.fg, F.rim, F.shade, F.crack, F.orn, ...F.ridges.map(r => r.im)]) if (o) o.setVisible(false);   // (v2.90) under Parmesan Prime's crust: no skyline
      if (under) return; }
    const S = F.shade.width, ps = (2 * Rz) / S;
    F.shade.setPosition(cx, cy).setScale(ps);
    F.rim.setPosition(cx, cy).setScale(ps);
    if (F.crack) F.crack.setPosition(cx, cy).setScale(ps).setRotation(-unwV).setAlpha((F.cfg.crackA || 0.55) + 0.3 * Math.sin(this.t * (F.cfg.crackPulse || 1.7)));
    if (F.orn) F.orn.setPosition(cx, cy).setScale(ps).setRotation(-unwV);
    for (const r of F.ridges) r.im.setPosition(cx, cy).setScale(ps).setRotation(-unwV * r.k);   // same pixels-per-unit as the planet: same scale
    if (F.fg) {
      // a ring a bit bigger than the planet on screen (gentler curve, closer to us), its base just under the bottom edge,
      // turning faster than the planet (parallax: it's nearer)
      // a big ring (radius 700 strip px, not tied to the planet - on a small planet like the Grater a planet-sized ring
      // curled up at the screen sides and its rocks floated), its base just BELOW the bottom edge so they stand on it,
      // sliding past only a little faster than the planet's surface (1.2x)
      const H = this.scale.height, k = Math.max(1, this.zoom * 1.4), Rs = F.fgRb * k;
      F.fg.setPosition(cx, H + 6 + Rs + (this.camLiftPx || 0) * 1.3).setScale(k).setRotation(-unwV * 1.2 * (Rz / Rs));
    }
  }
};
