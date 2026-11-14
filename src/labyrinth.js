// ===== L8: THE LACTOSE LABYRINTH (v2.71) =====
// The surface is dead quiet: tumbleweeds, a warning sign, and a boulder plugging a hole that WOBBLES now and then (and
// something under it moos). Shoot it apart and drop in. Underneath, a maze of rotten-Swiss tunnels in rings, one inside the
// next: rock walls split each ring into chambers, and holes in the floor drop you into the ring below. Only one hole in each
// chamber leads on; the others drop you into sealed pockets (a rat nest, a cheddar stash) and you jet back up through the
// hole you fell from. It is DARK: you see by Chris's lamp, the glow of cheese veins, and the eyes of what's waiting.
// Bessie's feed pipes run along the ceilings of the chambers on the true route, and the cheese in them pulses TOWARDS the
// way on - follow the flow. New vermin: rind-ticks on the ceiling (they drop on you), wall-gnawers clinging to the rock
// walls (they leap), mould-grubs under the floor (they burst out). The core, Bessie's milking machine and the Milkmaster
// come next (part 2): for now, reaching Bessie in the core wins, as before.

function makeLabTextures(scene) {
  if (scene.game.__labTex) return; scene.game.__labTex = true;
  const INK = 0x1a1020, BONE = [0xfff4d8, 0xe0cfa0, 0x9a8458], PINK = [0xffb0c0, 0xe07a90, 0xa04a60], RED = [0xff6a4a, 0xd62828, 0x7a0a0a];
  const MOULD = [0xc8d88a, 0x8aa04a, 0x4a6020], RIND = [0xc8a860, 0x8a6a2a, 0x4a3410], ROT = [0x9aa08a, 0x6a7058, 0x3a3e2e], GRUB = [0xf4ecb0, 0xc8bc6a, 0x7a6e2a];
  // ---- RIND-TICK: a bloated, mouldy tick of a rat that lives on the ceiling (drawn standing; it hangs upside down)
  for (const f of [0, 1]) pixSprite(scene, 'rindtick' + (f ? '_b' : ''), 38, 26, a => {
    const legs = f ? [[6, 24], [12, 25], [26, 25], [33, 24]] : [[4, 23], [10, 25], [28, 25], [35, 23]];
    for (const [x, y] of legs) a.line([[x < 19 ? 12 : 26, 15], [x < 19 ? x + 3 : x - 3, 18], [x, y]], 0x3a2a20, 2);
    a.ell(18, 13, 13, 10, ROT); a.ell(15, 9, 7, 4, 0xb8c0a0);                                           // the swollen abdomen
    for (const [x, y, r] of [[11, 14, 3], [21, 8, 2.5], [24, 15, 3.5], [14, 18, 2]]) a.ell(x, y, r, r * 0.8, MOULD);   // mould blooms
    a.px(18, 4, 0xffffff); a.px(25, 11, 0xffffff);
    a.ell(31, 15, 5.5, 5, PINK); a.ell(36, 16, 2, 1.6, PINK[1]);                                         // a little rat head on the front
    a.ell(32, 13, 1.6, 1.6, 0xff2a1a); a.px(32, 12, 0xffffff);                                           // red eye
    a.line([[33, 19], [33, 22]], 0xfff4d8); a.line([[35, 19], [35, 21]], 0xfff4d8);                       // fangs
    a.line([[29, 10], [27, 5]], PINK[2]); a.ell(27, 5, 2, 2, PINK);                                       // a torn ear
  });
  // ---- WALL-GNAWER: a gaunt, hunched rat with huge hooked claws, ribs showing, one eye far bigger than the other
  for (const f of [0, 1]) pixSprite(scene, 'gnawer' + (f ? '_b' : ''), 46, 32, a => {
    a.line([[8, 22], [3, 17], [5, 10], [2, 4]], PINK[1], 2);                                             // tail
    a.line([[12, 24], [10, 29], [6, 30]], 0x4a4050, 2); a.line([[22, 25], [24, 30], [28, 30]], 0x4a4050, 2);
    a.ell(17, 18, 10, 7.5, [0x8a8098, 0x5a5068, 0x2e2838]);                                               // a bony hunch
    for (const x of [13, 16, 19, 22]) a.line([[x, 14], [x + 1, 22]], 0x3a3048);                           // ribs
    a.poly([[11, 12], [16, 7], [21, 11]], [0x8a8098, 0x5a5068, 0x2e2838]);                               // spine ridge
    const arm = f ? [[24, 16], [30, 10], [36, 6]] : [[24, 16], [31, 15], [38, 12]];
    a.line(arm, 0x5a5068, 3); const [hx, hy] = arm[2];
    for (let k = 0; k < 3; k++) a.line([[hx, hy], [hx + 4, hy - 3 + k * 3], [hx + 6, hy + k * 3]], 0xfff4d8, 1);   // hooked claws
    a.ell(30, 20, 7, 6, [0x8a8098, 0x5a5068, 0x2e2838]); a.poly([[33, 17], [43, 20], [43, 23], [34, 25]], [0x8a8098, 0x5a5068, 0x2e2838]);
    a.ell(43, 21.5, 1.6, 1.6, PINK);
    a.ell(31, 17, 3.2, 3.2, 0xfff4d8); a.ell(31.5, 17, 1.6, 1.6, 0xff2a1a); a.px(31, 16, 0xffffff);      // the BIG eye
    a.ell(36, 18, 1.2, 1.2, 0xff2a1a);                                                                    // the little one
    a.line([[34, 24], [40, 23]], INK); a.rect(37, 24, 38, 27, 0xfff4d8); a.rect(39, 24, 40, 26, 0xe0cfa0);
    a.ell(26, 12, 3, 4, PINK); a.px(25, 9, INK);
  });
  // ---- MOULD-GRUB: a fat maggot of blue-green mould with a round mouth ringed in teeth
  for (const f of [0, 1]) pixSprite(scene, 'grub' + (f ? '_b' : ''), 38, 28, a => {
    for (let k = 0; k < 4; k++) a.ell(6 + k * 6, 18 - k * 0.5 + (f && k % 2 ? -1 : 0), 6 - k * 0.2, 7 - k * 0.3, GRUB);
    for (let k = 0; k < 4; k++) a.line([[4 + k * 6, 12], [4 + k * 6, 24]], GRUB[2]);
    for (const [x, y] of [[7, 15], [15, 20], [20, 13]]) a.ell(x, y, 2, 1.6, [0x8ad0b0, 0x4a9a80, 0x1a5a48]);
    a.ell(30, 15, 8, f ? 9 : 8, GRUB);
    a.ell(32, 15, 4.5, f ? 6 : 4, 0x3a0a10); a.ell(32, 15, 3, f ? 4.5 : 2.6, 0x7a0a1a);                   // the mouth
    for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4; a.px(Math.round(32 + Math.cos(an) * 4.5), Math.round(15 + Math.sin(an) * (f ? 6 : 4)), 0xfff4d8); }
    a.px(27, 9, 0x1a1020); a.px(29, 8, 0x1a1020); a.px(26, 11, 0x1a1020);                                // little black eye-dots
  });
  // ---- the BOULDER plugging the hole: lumpy, cracked, mossy, a rat-skull scratched in it
  pixSprite(scene, 'labboulder', 72, 52, a => {
    a.ell(36, 30, 33, 22, [0x9a8a78, 0x6a5a4a, 0x3a3028]); a.ell(22, 22, 14, 10, [0xb0a090, 0x8a7a68, 0x5a4a3a]); a.ell(50, 34, 14, 11, [0x8a7a68, 0x6a5a4a, 0x3a3028]);
    a.line([[30, 12], [34, 24], [30, 32], [36, 44]], 0x2a2018); a.line([[34, 24], [44, 22]], 0x2a2018); a.line([[52, 26], [58, 36]], 0x2a2018);
    for (const [x, y, r] of [[12, 34, 5], [60, 22, 4], [26, 46, 6], [46, 46, 4]]) a.ell(x, y, r, r * 0.6, MOULD);
    a.ell(40, 34, 5, 4, 0x2a2018); a.ell(40, 34, 3.6, 2.6, [0x9a8a78, 0x6a5a4a, 0x3a3028]); a.px(38, 33, 0x2a2018); a.px(42, 33, 0x2a2018);   // scratched skull
    a.line([[37, 38], [43, 38]], 0x2a2018); a.line([[34, 31], [31, 27]], 0x2a2018); a.line([[46, 31], [49, 27]], 0x2a2018);
  });
  pixSprite(scene, 'boulderbit', 14, 12, a => a.poly([[1, 6], [5, 1], [12, 3], [13, 9], [6, 11]], [0x9a8a78, 0x6a5a4a, 0x3a3028]));
  // ---- a TUMBLEWEED: a scribbly ball of dry stalks
  pixSprite(scene, 'tumbleweed', 30, 30, a => {
    const c = [0xd8b878, 0xa8884a, 0x6a5428];
    for (let k = 0; k < 14; k++) { const a0 = k * 2.4, a1 = a0 + 2.1, r0 = 6 + (k * 7) % 8, r1 = 13 - (k % 3); a.line([[15 + Math.cos(a0) * r0, 15 + Math.sin(a0) * r0], [15 + Math.cos((a0 + a1) / 2) * r1, 15 + Math.sin((a0 + a1) / 2) * r1], [15 + Math.cos(a1) * r0, 15 + Math.sin(a1) * r0]], c[k % 3]); }
  }, false);
  // ---- the WARNING SIGN by the boulder: a rat skull nailed to a crooked post, a crude cross daubed under it
  pixSprite(scene, 'warnsign', 38, 58, a => {
    a.line([[19, 57], [18, 20]], 0x5a3a1a, 3); a.rect(5, 18, 33, 34, 0x8a6a3a); a.rect(6, 19, 32, 33, 0xa8884a); a.line([[6, 26], [32, 25]], 0x6a4a1a);
    a.line([[10, 21], [17, 31]], 0xa01818, 2); a.line([[17, 21], [10, 31]], 0xa01818, 2);                  // daubed X
    a.ell(26, 26, 4, 4, BONE); a.px(24, 25, INK); a.px(27, 25, INK); a.line([[24, 29], [28, 29]], INK);
    a.ell(19, 10, 7, 6, BONE); a.poly([[19, 14], [27, 13], [27, 16], [20, 18]], BONE);                     // rat skull on top
    a.ell(17, 9, 2, 2, INK); a.px(26, 15, INK); a.rect(22, 16, 23, 19, BONE[0]);
    a.px(19, 4, 0x5a5a5a);                                                                                // the nail
  });
  // ---- (v2.72) surface junk instead of the old cheese-wedge piles: a rusty feed pipe jutting out of the ground (a hint of
  // what's below), a half-buried rib cage, a tipped-over mine cart
  pixSprite(scene, 'labpipe', 46, 56, a => {
    const RU = [0xb8784a, 0x7a4a2a, 0x3e2414];
    a.rect(14, 26, 24, 55, RU[1]); a.rect(14, 26, 16, 55, RU[0]); a.rect(22, 26, 24, 55, RU[2]);
    a.ell(19, 22, 9, 9, RU); a.rect(19, 14, 40, 24, RU[1]); a.rect(19, 14, 40, 16, RU[0]); a.rect(19, 22, 40, 24, RU[2]);   // the elbow
    a.rect(38, 12, 44, 26, RU[2]); a.rect(39, 13, 43, 25, 0x2a1a0e);                                      // the open end
    a.rect(12, 34, 26, 37, 0x5a3a20); a.rect(12, 46, 26, 49, 0x5a3a20);                                   // bands
    a.ell(19, 6, 7, 2.5, 0x6a6a72); a.line([[19, 6], [19, 14]], 0x6a6a72, 2); a.line([[13, 6], [25, 6]], 0x9a9aa2);   // a seized valve wheel
    a.line([[44, 27], [44, 33]], 0xe8c860); a.px(44, 36, 0xe8c860);                                       // a last drip of cheese
    a.rect(4, 53, 34, 55, 0x54482e);
  });
  pixSprite(scene, 'labribs', 70, 40, a => {
    a.ell(35, 38, 33, 4, [0x6e6040, 0x54482e, 0x3a3224]);
    a.line([[6, 36], [62, 30]], 0xd8d0b8, 3);                                                              // spine
    for (let k = 0; k < 6; k++) { const x = 12 + k * 9; a.line([[x, 34 - k], [x - 4, 18 - k * 1.5], [x + 3, 6 + k]], 0xe8e0c8, 2); a.line([[x + 1, 34 - k], [x + 7, 22]], 0xb8b098, 1); }
    a.ell(64, 26, 7, 6, [0xf0e8d0, 0xd8d0b8, 0x9a9278]); a.poly([[64, 30], [70, 34], [66, 36]], [0xf0e8d0, 0xd8d0b8, 0x9a9278]); a.ell(65, 25, 2, 2, 0x1a1020);   // a rat-ish skull
  });
  pixSprite(scene, 'labcart', 54, 36, a => {
    const IR = [0x8a8a92, 0x5a5a62, 0x2e2e36];
    a.poly([[4, 8], [44, 2], [50, 26], [10, 32]], IR); a.poly([[8, 10], [42, 5], [46, 22], [12, 27]], 0x2a1a10);   // tipped on its side
    for (const [x, y] of [[8, 4], [46, 28]]) { a.ell(x, y + 2, 6, 6, [0x6a6a72, 0x3a3a42, 0x1a1a22]); a.ell(x, y + 2, 2, 2, 0x9a9aa2); }
    for (const [x, y] of [[20, 18], [28, 14], [34, 20], [24, 24]]) a.ell(x, y, 3, 2.5, [0xe8d890, 0xb8a860, 0x7a6a30]);   // spilled lumps of old rind
    a.line([[2, 34], [52, 34]], 0x6a6a72, 2); a.line([[4, 35], [50, 35]], 0x3a3a42);
  });
  pixSprite(scene, 'labmoon', 120, 120, a => {                                                            // the dead moon hanging in the sky
    a.ell(60, 60, 56, 56, [0xa8a4b8, 0x7a7690, 0x4a4660]);
    for (const [x, y, r] of [[38, 40, 10], [72, 30, 7], [80, 70, 13], [46, 82, 8], [62, 56, 5], [90, 48, 5]]) { a.ell(x, y, r, r, [0x6a6680, 0x5a5670, 0x3a3650]); a.ell(x + r * 0.2, y + r * 0.2, r * 0.7, r * 0.7, 0x4a4660); }
    a.line([[20, 54], [36, 60], [44, 74], [60, 76], [68, 96]], 0x2a2638, 2); a.line([[44, 74], [36, 90]], 0x2a2638);
    a.ell(36, 36, 14, 10, 0xc8c4d8);
  }, false);
  // ---- the LAMP light (erased out of the darkness): a soft white disc
  if (!scene.textures.exists('lamp')) {
    const tx = scene.textures.createCanvas('lamp', 128, 128), c = tx.getContext(), g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,0.85)'); g.addColorStop(0.75, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, 128, 128); tx.refresh();
  }
}

// the vermin (hp is before the level's hpMul)
Object.assign(ENEMY, {
  rindtick: { hp: 3, r: 14, ch: 11, tex: 'rindtick', oy: 0.92, drop: 0.25, ai: 'rindtick', k: 1.2, frames: ['rindtick', 'rindtick_b'], fps: 10 },
  gnawer:   { hp: 4, r: 16, ch: 13, tex: 'gnawer',   oy: 0.94, drop: 0.3,  ai: 'gnawer',   k: 1.2, frames: ['gnawer', 'gnawer_b'], fps: 7 },
  grub:     { hp: 3, r: 15, ch: 11, tex: 'grub',     oy: 0.9,  drop: 0.25, ai: 'grub',     k: 1.25, frames: ['grub', 'grub_b'], fps: 5 },
});

const LabMixin = {
  caveRing(i) { return this.def.cave.rings[i]; },
  caveAbs(o) { return wrap(this.caveHole.theta + o); },
  // the chamber a point of a ring sits in: [lo, hi] (relative angles, between the walls either side; the whole ring if none)
  labChamber(ri, rel) {
    const ws = (this.caveRing(ri).walls || []).map(w => ((w % TAU) + TAU) % TAU).sort((a, b) => a - b), x = ((rel % TAU) + TAU) % TAU;
    if (!ws.length) return null;
    let lo = ws[ws.length - 1] - TAU, hi = ws[0];
    for (let i = 0; i < ws.length; i++) if (x >= ws[i] && (i === ws.length - 1 || x < ws[i + 1])) { lo = ws[i]; hi = i === ws.length - 1 ? ws[0] + TAU : ws[i + 1]; }
    return [lo, hi];
  },
  labRel(theta) { return angDiff(theta, this.caveHole.theta); },
  labInChamber(ri, relA, relB) { const c = this.labChamber(ri, relA); if (!c) return true; const x = ((relB - c[0]) % TAU + TAU) % TAU; return x <= c[1] - c[0]; },

  updateCave(dt) {
    const P = this.pl, CV = this.def.cave;
    if (!this.caveHole) this.caveHole = { theta: wrap(P.theta + (CV.holeOff || 0.32)), half: 30 / R };
    if (!this.cave) {
      this.cave = { ring: 0, t: 0, vent: 0, fill: 0, cheeseH: 0, beatT: 0, beatN: 0, next: null, won: false, alive: {}, seen: {},
        rock: { hp: 10, alive: true, wob: 0, nextWob: 1.5, flash: 0 }, tw: [], twT: 2,
        valves: CV.rings.flatMap((rg, ri) => (rg.valves || []).map(o => ({ ring: ri, theta: this.caveAbs(o), hp: 3, alive: true }))),
        loot: CV.rings.flatMap((rg, ri) => (rg.loot || []).map(([kind, o, val]) => ({ ring: ri, theta: this.caveAbs(o), kind, val, taken: false }))) };
      CV.rings.forEach((rg, ri) => { this.cave.alive[ri] = (rg.spawn || []).map((s, i) => i); });
    }
    const C = this.cave, ring = C.ring, RG = this.caveRing(ring);
    this.camSlide = (this.camSlide || 0) * Math.max(0, 1 - dt * 3.2); if (Math.abs(this.camSlide) < 0.5) this.camSlide = 0;   // (v2.72: an easy glide after a ring change)
    { const Rz = R * this.zoom; this.cy = this.groundY + Rz + this.camSlide;
      this.visHalf = Math.min(Math.asin(Math.min(1, (this.W / 2) / Rz)), Math.acos(Math.max(-1, Math.min(1, (this.cy - this.H) / Rz)))); this.visArc = R * this.visHalf; }
    if (ring === 0) { this.labSurface(dt); if (P.h < -this.labGap(0) * 0.5 && P.vh <= 0) this.caveMove(1); return; }
    C.t += dt;
    const core = CV.rings[CV.rings.length - 1];
    if (C.won) C.vent += dt * 25;
    const f = Math.max(0, Math.min(1, (C.t - C.vent) / CV.fillT)) ** 1.6;
    C.fill = f; C.cheeseH = f * (core.ceil - 55);
    // (v2.72) one continuous fall/climb through the shaft: we swap rings halfway down it, and nothing jumps
    if (ring < CV.rings.length - 1 && P.h < -this.labGap(ring) * 0.5 && P.vh <= 0) { this.caveMove(ring + 1); return; }
    if (ring > 0 && P.h > RG.ceil + this.labGap(ring - 1) * 0.5 && P.vh > 0 && this.caveHoleAt(ring - 1, P.theta)) { this.caveMove(ring - 1); return; }
    // rock walls: nothing gets through them
    for (const w of (RG.walls || [])) {
      const wt = this.caveAbs(w), d = angDiff(P.theta, wt) * R;
      if (Math.abs(d) < 20) { P.theta = wrap(wt + Math.sign(d || -(P.vx || 1)) * 20 / R); P.vx = 0; }
      for (const e of this.enemies) { if (e.type === 'boss' || (e.ls && e.ls.st === 'climb')) continue; const de = angDiff(e.theta, wt) * R; if (Math.abs(de) < 18) e.theta = wrap(wt + Math.sign(de || 1) * 18 / R); }
    }
    // loot in the dead ends: it bursts out when you get close (so it doesn't time out before you arrive)
    for (const L of C.loot) {
      if (L.taken || L.ring !== ring || Math.abs(angDiff(P.theta, L.theta)) * R > 150) continue;
      L.taken = true;
      if (L.kind === 'stash') { this.spillCheddar(L.theta, 26, L.val); Sound.sfx('power'); this.banner('A RAT\'S HOARD! +' + L.val + ' CHEDDAR'); }
      else if (L.kind === 'heal') { this.pickups.push({ kind: 'heal', theta: L.theta, h: 40, vh: 200, life: 30, spr: this.add.image(0, 0, 'wedge').setDepth(6) }); Sound.sfx('shine'); }
    }
    // the pump's beat: surges of molten cheese out of the outlet in this chamber
    const beat = 60 / 118, every = RG.every || 4;
    if (!C.won && RG.outlet !== undefined && this.labInChamber(ring, RG.outlet, this.labRel(P.theta))) {
      C.beatT += dt;
      if (C.beatT >= beat) {
        C.beatT -= beat; C.beatN++;
        if (C.next && C.beatN === C.next.at) {
          for (const dir of [-1, 1]) this.caveWave(C.next.kind, dir);
          if (C.next.double) { const k2 = C.next.kind === 'low' ? 'high' : 'low'; this.time.delayedCall(330, () => { if (this.cave && !this.cave.won) for (const dir of [-1, 1]) this.caveWave(k2, dir); }); }
          Sound.sfx('beat'); Sound.sfx('squelch'); this.cameras.main.shake(70, 0.004); buzz(15);
          C.thump = 1; C.next = null;
        }
        if (!C.next && C.beatN % every === every - 1) { C.next = { at: C.beatN + 1, kind: Math.random() < 0.5 ? 'low' : 'high', double: !!RG.doubles && Math.random() < 0.45 }; Sound.sfx('blip'); }
      }
    }
    C.thump = Math.max(0, (C.thump || 0) - dt * 4);
    // remember which bits of the maze you've been through (the map fills in)
    const vb = (C.seen[ring] = C.seen[ring] || {}); vb[Math.floor(((this.labRel(P.theta) % TAU) + TAU) % TAU / TAU * 48)] = 1;
    if (RG.core) {
      if (P.h < C.cheeseH) { P.vx *= Math.max(0, 1 - dt * 6); if (P.vh < 0) P.vh *= 0.92; if (C.cheeseH - P.h > 14) this.hurt(); }
      if (!C.won && Math.abs(angDiff(P.theta, this.caveAbs(RG.bessie))) * R < 40) {
        C.won = true; this.clearEBullets(); this.bossDown = true;
        Sound.sfx('moo'); Sound.sfx('power'); this.cameras.main.flash(300, 255, 240, 180);
        this.banner('BESSIE UNPLUGGED!\nTHE CHEESE IS DRAINING...');
        this.time.delayedCall(2600, () => { if (this.state === 'play') this.finishWin(); });
      }
    }
    if (!C.won && f >= 1 && !C.flooded) {
      C.flooded = true; this.banner('BESSIE\'S UNDER THE CHEESE!'); Sound.sfx('crash'); this.cameras.main.shake(600, 0.02);
      this.time.delayedCall(900, () => { if (this.state === 'play') { P.invuln = 0; P.hp = 0; this.die(); } });
    }
  },

  // ---- up top: too quiet. Tumbleweeds. The boulder wobbles; something under it moos.
  labSurface(dt) {
    const C = this.cave, K = C.rock, P = this.pl, t = this.t;
    if (!C.hushed && this.state === 'play') { C.hushed = true; Sound.music(null); }
    if (!this.labRock) {
      this.labRock = this.add.image(0, 0, 'labboulder').setOrigin(0.5, 0.92).setDepth(6.3); this.labRock.bsx = this.labRock.bsy = 1.15;
      this.labSign = this.add.image(0, 0, 'warnsign').setOrigin(0.5, 1).setDepth(5.5); this.labSign.bsx = this.labSign.bsy = 1.1;
    }
    if (K.alive) {
      K.nextWob -= dt;
      if (K.nextWob <= 0) {
        K.nextWob = rnd(2.4, 4.6); K.wob = 0.7;
        this.burst(this.caveHole.theta, 6, 'crumb', 5, 0.5); Sound.sfx('clunk'); buzz(10);
        K.n = (K.n || 0) + 1; if (K.n % 3 === 2) this.time.delayedCall(350, () => { if (this.cave && this.cave.rock.alive) Sound.sfx('moo'); });   // ...was that a moo?
      }
      K.wob = Math.max(0, K.wob - dt); K.flash = Math.max(0, K.flash - dt);
      const w = K.wob > 0 ? Math.sin(t * 38) * 0.07 * (K.wob / 0.7) + Math.sin(t * 9) * 0.03 : 0;
      this.place(this.labRock, this.caveHole.theta, K.wob > 0 ? Math.abs(Math.sin(t * 19)) * 4 * K.wob : 0, w);
      if (K.flash > 0) this.labRock.setTintFill(0xffffff); else this.labRock.clearTint();
    } else this.labRock.setVisible(false);
    this.place(this.labSign, wrap(this.caveHole.theta - 130 / R), 0, -0.12);
    if (!this.labMoon) { this.labMoon = this.add.image(0, 0, 'labmoon').setDepth(0.3).setScrollFactor(0).setAlpha(0.85); }
    this.labMoon.setVisible(true).setPosition(this.W * 0.78 - angDiff(P.theta, 0) * 22, this.H * 0.26).setScale(this.zoom * 1.6).setRotation(t * 0.01);
    // tumbleweeds blow through every so often
    C.twT -= dt;
    if (C.twT <= 0 && C.tw.length < 2) {
      C.twT = rnd(3, 7); const dir = Math.random() < 0.5 ? 1 : -1;
      const s = this.add.image(0, 0, 'tumbleweed').setDepth(5.7); s.bsx = s.bsy = rnd(1, 1.6);
      C.tw.push({ s, theta: wrap(P.theta - dir * (this.visHalf + 0.08)), h: 0, vh: 0, v: dir * rnd(110, 170), r: 0, life: 14 });
    }
    for (let i = C.tw.length - 1; i >= 0; i--) {
      const T = C.tw[i]; T.life -= dt; T.theta = wrap(T.theta + T.v / R * dt); T.r += T.v / 14 * dt;
      T.vh -= 900 * dt; T.h += T.vh * dt; if (T.h <= 0) { T.h = 0; T.vh = rnd(120, 260); this.burst(T.theta, 4, 'crumb', 3, 0.4); }
      this.place(T.s, T.theta, T.h + 14, T.r);
      if (T.life <= 0) { T.s.destroy(); C.tw.splice(i, 1); }
    }
  },

  caveHoleAt(ri, theta) {
    if (ri === 0) return !this.cave.rock.alive && Math.abs(angDiff(theta, this.caveHole.theta)) < this.caveHole.half;
    const RG = this.caveRing(ri); if (!RG.holes || ri >= this.def.cave.rings.length - 1) return false;
    return RG.holes.some(h => Math.abs(angDiff(theta, this.caveAbs(h))) < 30 / RG.R);
  },
  labGap(ri) { const CV = this.def.cave, top = ri === 0 ? (this.def.radius || 420) : CV.rings[ri].R, nx = CV.rings[ri + 1]; return Math.max(10, top - (nx.R + nx.ceil)); },
  caveMove(to) {
    const P = this.pl, C = this.cave, from = C.ring, CV = this.def.cave;
    const Rf = from === 0 ? (this.def.radius || 420) : CV.rings[from].R, Rt = to === 0 ? (this.def.radius || 420) : CV.rings[to].R;
    // the vermin of the ring we're leaving stay (unless they're dead), frozen until we come back
    if (from > 0) C.alive[from] = this.enemies.filter(e => e.lcid !== undefined && e.hp > 0).map(e => e.lcid);
    for (const e of this.enemies) if (e.type !== 'boss') { e.quietKill = true; e.hp = 0; }
    for (const q of this.pickups) if (q.spr) q.spr.destroy(); this.pickups.length = 0;
    C.ring = to; R = Rt;
    P.h = P.h + Rf - Rt;                                                     // (v2.72) the same spot in space, measured from the new ring
    this.camSlide = (to > from ? 1 : -1) * Math.abs(Rf - Rt) * this.zoom + (this.camSlide || 0);
    this.clearEBullets(); C.next = null;
    const under = to > 0;
    if (this.planetImg) this.planetImg.setVisible(!under);
    for (const q of this.props) { q.hidden = under; q.spr.setVisible(!under); if (q.halo) q.halo.setVisible(!under); }
    for (const q of this.ledgeSprs || []) { if (q.spr) q.spr.setVisible(!under); for (const x of (q.extras || [])) if (x.setVisible) x.setVisible(!under); }
    if (this.labSign) this.labSign.setVisible(!under); if (this.labMoon) this.labMoon.setVisible(!under);
    for (const T of C.tw) T.s.setVisible(!under);
    if (!this.caveBessie) { this.caveBessie = this.add.image(0, 0, 'bessie').setOrigin(0.5, 1).setDepth(6.2); this.caveBessie.bsx = this.caveBessie.bsy = 0.9; }
    if (to > 0) this.labSpawn(to);
    if (from === 0 && to === 1 && !C.musicOn) { C.musicOn = true; Sound.music(this.def.music); }
    Sound.sfx(to > from ? 'whoosh' : 'jump');
    if (to > from && !C['seen' + to]) { C['seen' + to] = true; this.banner(CV.rings[to].core ? 'THE CORE!\nGET TO BESSIE!' : (to === 1 ? 'IT\'S DARK DOWN HERE...\nFOLLOW THE PIPES' : 'DEEPER...')); }
  },
  labSpawn(ri) {
    const RG = this.caveRing(ri), C = this.cave;
    for (const i of (C.alive[ri] || [])) {
      const [type, o] = RG.spawn[i], th = this.caveAbs(o), e = this.makeEnemy(type, th, 1);
      e.lcid = i; this.enemies.push(e); this.labInit(e);
    }
  },
  labInit(e) {
    const RG = this.caveRing(this.cave.ring), ai = ENEMY[e.type] && ENEMY[e.type].ai;
    if (ai === 'rindtick') { e.ls = { st: 'ceil' }; e.ch0 = e.ch; e.ch = -e.ch0; e.h = RG.ceil; e.roll = Math.PI; e.noStomp = true; }
    else if (ai === 'gnawer') {
      const rel = this.labRel(e.theta); let best = null;
      for (const w of (RG.walls || [])) { const d = angDiff(this.caveAbs(w), e.theta); if (!best || Math.abs(d) < Math.abs(best.d)) best = { w, d }; }
      const side = best ? -Math.sign(best.d) || 1 : 1;
      e.ls = { st: 'climb', wall: best ? this.caveAbs(best.w) : e.theta, side, cd: rnd(0.5, 1.5) }; e.noStomp = true;
      e.theta = wrap(e.ls.wall + side * 26 / R); e.h = 40; e.roll = -side * Math.PI / 2;
    }
    else if (ai === 'grub') { e.ls = { st: 'under' }; e.phased = true; e.h = -26; e.spr.setAlpha(0); e.noStomp = true; }
  },
  // ---- the vermin's brains
  labAI(e, dt, P, dirP) {
    const L = e.ls || (this.labInit(e), e.ls), RG = this.caveRing(this.cave.ring), toP = angDiff(P.theta, e.theta), distP = Math.abs(toP) * R, g = this.gAt(e.theta);
    L.t = (L.t || 0) + dt;
    const walker = sp => {                                                        // on the floor: scuttle at Chris in hops
      e.theta = wrap(e.theta + dirP * sp / R * dt); e.dir = dirP;
      e.hopCd = (e.hopCd || 0) - dt; if (e.h <= 0 && e.hopCd <= 0) { e.vh = rnd(200, 320); e.hopCd = rnd(0.6, 1.3); }
      e.vh -= g * dt; e.h += e.vh * dt; if (e.h <= 0) { e.h = 0; if (e.vh < 0) e.vh = 0; }
    };
    if (e.type === 'rindtick') {
      if (L.st === 'ceil') {
        e.h = RG.ceil; e.roll = Math.PI + Math.sin(e.t * 9) * 0.05;
        if (distP < 380) { e.theta = wrap(e.theta + Math.sign(toP) * 75 / R * dt); } else e.theta = wrap(e.theta + Math.sin(e.t * 0.7 + e.seed) * 20 / R * dt);
        e.dir = -Math.sign(toP) || 1;                                          // (upside down, so facing flips)
        if (distP < 16 && P.h < RG.ceil - 40) { L.st = 'drop'; L.t = 0; e.vh = -60; Sound.sfx('squeak'); }
      } else if (L.st === 'drop') {
        e.vh -= g * dt; e.h += e.vh * dt;
        const k = Math.min(1, L.t / 0.3); e.roll = Math.PI * (1 - k) * (e.dir || 1); e.ch = e.ch0 * (k > 0.5 ? 1 : -1);
        if (e.h <= 0) { e.h = 0; e.vh = 0; e.roll = 0; e.ch = e.ch0; L.st = 'walk'; e.noStomp = false; this.burst(e.theta, 4, 'crumb', 6, 0.6); Sound.sfx('squelch'); }
      } else walker(115);
    } else if (e.type === 'gnawer') {
      if (L.st === 'climb') {
        const top = RG.ceil - 30; L.cd -= dt;
        e.h = 30 + (top - 30) * (0.5 + 0.5 * Math.sin(e.t * 1.1 + e.seed)); e.theta = wrap(L.wall + L.side * 26 / R);
        e.roll = -L.side * Math.PI / 2 + Math.sin(e.t * 12) * 0.06; e.dir = L.side;
        if (L.cd <= 0 && distP < 320 && Math.sign(toP) === L.side) { L.st = 'leap'; L.t = 0; L.vt = L.side * Math.min(330, distP * 1.6 + 60); e.vh = 180; Sound.sfx('squeak'); this.burst(e.theta, e.h, 'crumb', 4, 0.5); }
      } else if (L.st === 'leap') {
        e.theta = wrap(e.theta + L.vt / R * dt); e.vh -= g * dt; e.h += e.vh * dt;
        e.roll = -L.side * Math.PI / 2 * Math.max(0, 1 - L.t / 0.35);
        if (e.h <= 0) { e.h = 0; e.vh = 0; e.roll = 0; L.st = 'run'; e.noStomp = false; }
      } else walker(140);
    } else if (e.type === 'grub') {
      if (L.st === 'under') {
        e.h = -26; e.spr.setAlpha(0);
        if (distP < 130) { L.st = 'burst'; L.t = 0; e.phased = false; e.spr.setAlpha(1); e.vh = 430; this.burst(e.theta, 2, 'crumb', 14, 1); this.cameras.main.shake(90, 0.005); Sound.sfx('squelch'); Sound.sfx('crash'); }
      } else if (L.st === 'burst') {
        e.vh -= g * dt; e.h += e.vh * dt; e.dir = dirP; e.roll = Math.sin(L.t * 20) * 0.3;
        if (e.h <= 0 && e.vh < 0) { e.h = 0; e.vh = 0; e.roll = 0; L.st = 'crawl'; L.dash = 0.6; e.noStomp = false; }
      } else {
        L.dash -= dt; const lunge = L.dash < 0 && L.dash > -0.28;
        if (L.dash < -0.28) L.dash = rnd(0.9, 1.6);
        e.theta = wrap(e.theta + dirP * (lunge ? 300 : 45) / R * dt); e.dir = dirP;
        e.vh -= g * dt; e.h += e.vh * dt; if (e.h <= 0) { e.h = 0; e.vh = 0; }
      }
    }
  },

  caveWave(kind, dir) {
    const RG = this.caveRing(this.cave.ring), o = this.caveAbs(RG.outlet);
    const b = this.addEBullet('cwave', wrap(o + dir * 24 / R), kind === 'low' ? 8 : 40, dir * 230, 0, 10, 7);
    b.spr.setFlipX(dir < 0); b.spinV = 0; b.caveWave = kind;
  },
  caveWallHit(theta) { for (const w of (this.caveRing(this.cave.ring).walls || [])) if (Math.abs(angDiff(theta, this.caveAbs(w))) * R < 14) return true; return false; },
  caveValveHit(b) {
    const C = this.cave; if (!C) return false;
    if (C.ring === 0) {                                                       // the boulder: shoot it to bits
      const K = C.rock; if (!K.alive) return false;
      if (Math.abs(angDiff(b.theta, this.caveHole.theta)) * R > 40 || b.h > 64) return false;
      K.hp -= Math.max(1, b.dmg || 1) >= 5 ? 3 : 1; K.flash = 0.06; K.wob = Math.max(K.wob, 0.25);
      this.burst(b.theta, b.h, 'spark', 3, 0.5); Sound.sfx('clang');
      for (let k = 0; k < 2; k++) { const im = this.add.image(0, 0, 'boulderbit').setDepth(6); im.bsx = im.bsy = rnd(0.5, 0.9); this.parts.push({ theta: b.theta, h: b.h, vt: rnd(-120, 120), vh: rnd(100, 260), life: rnd(0.5, 0.8), spr: im, rot: 0, rv: rnd(-10, 10) }); }
      if (K.hp <= 0) {
        K.alive = false; this.cameras.main.shake(350, 0.014); Sound.sfx('crash'); Sound.sfx('boom'); buzz([60, 30, 90]);
        for (let k = 0; k < 22; k++) { const im = this.add.image(0, 0, 'boulderbit').setDepth(8); im.bsx = im.bsy = rnd(0.8, 2); this.parts.push({ theta: this.caveHole.theta, h: rnd(10, 50), vt: rnd(-300, 300), vh: rnd(200, 520), life: rnd(0.8, 1.3), spr: im, rot: 0, rv: rnd(-12, 12) }); }
        this.burst(this.caveHole.theta, 20, 'crumb', 24, 1.4);
        this.time.delayedCall(700, () => { Sound.sfx('moo'); this.banner('...A WAY DOWN.'); });
      }
      return true;
    }
    if (this.caveWallHit(b.theta)) { this.burst(b.theta, b.h, 'spark', 2, 0.4); return true; }
    const ceil = this.caveRing(C.ring).ceil;
    for (const V of C.valves) {
      if (!V.alive || V.ring !== C.ring || dist2(b.theta, b.h, V.theta, ceil - 16) > 20 * 20) continue;
      V.hp--; this.burst(V.theta, ceil - 16, 'spark', 4, 0.5); Sound.sfx('clang');
      if (V.hp <= 0) { V.alive = false; C.vent += 22; this.burst(V.theta, ceil - 16, 'spark', 16, 1.2); Sound.sfx('hiss'); this.banner('VALVE VENTED!\nTHE CHEESE DROPS'); this.addScore(500); }
      return true;
    }
    return false;
  },
  caveTarget() { const C = this.cave, RG = this.caveRing(C.ring); return { theta: this.caveAbs(RG.core ? RG.bessie : (RG.path || 0)), dir: 1 }; },

  // ================= drawing =================
  drawCave() {
    if (!this.caveG) {
      this.caveG = this.add.graphics().setDepth(4.5); this.caveFg = this.add.graphics().setDepth(7.65);
      this.caveTxt = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '8px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 3 }).setOrigin(0.5).setDepth(20);
    }
    const g = this.caveG, fg = this.caveFg, z = this.zoom, P = this.pl, t = this.t, cx = this.cx, cy = this.cy, C = this.cave, CV = this.def.cave;
    g.clear(); fg.clear(); this.caveTxt.setVisible(false);
    this.labLights = [];
    if (!C || !this.caveHole) return;
    const ring = C.ring, vt = this.viewT(), vh = this.visHalf + 0.12;
    const pol = (th, rad) => { const d = angDiff(th, vt); return { x: cx + rad * z * Math.sin(d), y: cy - rad * z * Math.cos(d) }; };
    const inView = th => Math.abs(angDiff(th, vt)) < vh;
    const band = (r0, r1, a0, a1, col, al) => {                                  // a slice of an annulus, from angle a0 to a1 (absolute)
      const n = Math.max(4, Math.ceil(Math.abs(angDiff(a1, a0)) * r1 / 18)), pts = [], span = angDiff(a1, a0);
      for (let k = 0; k <= n; k++) pts.push(pol(a0 + span * k / n, r1));
      for (let k = n; k >= 0; k--) pts.push(pol(a0 + span * k / n, r0));
      g.fillStyle(col, al === undefined ? 1 : al).fillPoints(pts, true);
    };
    const A0 = wrap(vt - vh), A1 = wrap(vt + vh);
    if (ring === 0) {                                                           // up top: once the boulder's gone, the hole
      if (!C.rock.alive) {
        const H = this.caveHole, pts = [], n = 12;
        for (let k = 0; k <= n; k++) pts.push(this.screenPos(wrap(H.theta + (k / n * 2 - 1) * H.half), 1));
        for (let k = n; k >= 0; k--) pts.push(this.screenPos(wrap(H.theta + (k / n * 2 - 1) * H.half * 0.85), -30 * Math.sin(k / n * Math.PI) - 6));
        fg.fillStyle(0x0a0402, 1).fillPoints(pts, true);
        for (let k = 0; k < 5; k++) { const p = this.screenPos(wrap(H.theta + (k - 2) * H.half * 0.35), -8 - ((t * 30 + k * 13) % 20)); fg.fillStyle(0xffb52a, 0.5).fillCircle(p.x, p.y, 1.5 * z); }   // a faint glow down there
      }
      return;
    }
    // ---- the rock: rotten Swiss, sweaty and mouldy
    g.fillStyle(0x3e2812, 1).fillRect(0, 0, this.W, this.H);
    const Rs = this.def.radius || 1100;
    for (let k = 0; k < 1400; k++) {
      const th = (k * 0.6180339887 * TAU) % TAU; if (!inView(th)) continue;
      const rr = Rs - 10 - (k * 53) % (Rs - 120), r2 = (5 + (k * 13) % 20) * z, p = pol(th, rr);
      if (CV.rings.some((RGx, i) => i && rr > RGx.R - 4 && rr < RGx.R + RGx.ceil + 4)) continue;
      g.fillStyle(0x24160a, 1).fillCircle(p.x, p.y, r2); g.fillStyle(0x140a04, 1).fillCircle(p.x + r2 * 0.25, p.y + r2 * 0.25, r2 * 0.68);
      if (k % 5 === 0) g.lineStyle(1.5 * z, 0x4a6a1a, 0.8).strokeCircle(p.x, p.y, r2);                       // a mould rim
      if (k % 7 === 0) { g.fillStyle(0xffb52a, 0.9).fillCircle(p.x - r2 * 0.5, p.y + r2 * 0.4, 1.6 * z); this.labLights.push([p.x, p.y, 34 * z, 0.45]); }   // a cheese vein glints
    }
    // ---- every ring's tunnel (the one we're in is a touch lighter)
    CV.rings.forEach((RG, ri) => {
      if (!ri) return;
      const top = RG.R + RG.ceil;
      band(RG.R, top, A0, A1, ri === ring ? 0x1e1209 : 0x0e0704);
      band(RG.R - 8, RG.R, A0, A1, ri === ring ? 0x6a4a1a : 0x3a2810);         // the floor crust
      band(top, top + 7, A0, A1, ri === ring ? 0x4a3010 : 0x2a1a08);           // the roof crust
      if (RG.core && C.cheeseH > 0.5) { band(RG.R, RG.R + C.cheeseH, A0, A1, 0xffb52a); band(RG.R + C.cheeseH - 2, RG.R + C.cheeseH, A0, A1, 0xfff0a0); }
      if (ri !== ring) return;
      // stalactites like rotten teeth, dripping whey; lumps, bones and the odd skull on the floor
      for (let k = 0; k < 220; k++) {
        const th = this.caveAbs(k * TAU / 220 + Math.sin(k * 7.3) * 0.006); if (!inView(th)) continue;
        const len = 8 + Math.abs(Math.sin(k * 3.7)) * 26, w = (3 + Math.abs(Math.sin(k * 5.1)) * 5) / RG.R;
        const a = pol(wrap(th - w), top), b = pol(wrap(th + w), top), c = pol(th, top - len);
        g.fillStyle(k % 4 ? 0x5a3e18 : 0xd8c8a0, 1).fillTriangle(a.x, a.y, b.x, b.y, c.x, c.y);
        if (k % 6 === 0) { const d = (t * 50 + k * 17) % (top - RG.R); const q = pol(th, top - len - d * 0.9); g.fillStyle(0xf4ecc8, 0.8).fillCircle(q.x, q.y, 1.5 * z); }
        if (k % 9 === 0) { const q = pol(wrap(th + 0.004), RG.R + 3); g.fillStyle(0xe8dcc0, 1).fillEllipse(q.x, q.y, 9 * z, 3.5 * z); if (k % 27 === 0) { const s = pol(wrap(th + 0.004), RG.R + 9); g.fillStyle(0xf0e4c8, 1).fillCircle(s.x, s.y, 5 * z); g.fillStyle(0x1a0e04, 1).fillCircle(s.x - 2 * z, s.y, 1.4 * z).fillCircle(s.x + 2 * z, s.y, 1.4 * z); } }
        if (k % 5 === 2) { const q = pol(th, RG.R + 1); g.fillStyle(0x4a6a1a, 1).fillEllipse(q.x, q.y, 14 * z, 5 * z); }   // mould on the floor
      }
    });
    // ---- shafts: the holes between rings (each ring's floor holes, down to the ring below)
    CV.rings.forEach((RG, ri) => {
      if (!ri || !RG.holes || ri >= CV.rings.length - 1) return;
      const below = CV.rings[ri + 1];
      for (const h of RG.holes) {
        const th = this.caveAbs(h); if (!inView(th)) continue;
        band(below.R + below.ceil - 2, RG.R + 1, wrap(th - 28 / RG.R), wrap(th + 28 / RG.R), ri === ring || ri + 1 === ring ? 0x120804 : 0x0a0503);
        for (const sd of [-1, 1]) { const a = pol(wrap(th + sd * 30 / RG.R), RG.R), b = pol(wrap(th + sd * 30 / RG.R), below.R + below.ceil); g.lineStyle(3 * z, 0xc89a3a, 0.7).lineBetween(a.x, a.y, b.x, b.y); }
        const q = pol(th, RG.R - 20); this.labLights.push([q.x, q.y, 40 * z, 0.35]);
      }
    });
    // ---- the rock walls splitting the rings: fleshy pillars of rind with teeth and a skull pressed into them
    const RG = this.caveRing(ring);
    CV.rings.forEach((RGx, ri) => {
      if (!ri) return;
      for (const w of (RGx.walls || [])) {
        const th = this.caveAbs(w); if (!inView(th)) continue;
        band(RGx.R - 4, RGx.R + RGx.ceil + 6, wrap(th - 15 / RGx.R), wrap(th + 15 / RGx.R), 0x3a2410);
        band(RGx.R, RGx.R + RGx.ceil, wrap(th - 10 / RGx.R), wrap(th + 10 / RGx.R), ri === ring ? 0x6a4a1e : 0x3a2810);
        if (ri !== ring) continue;
        for (let k = 0; k < 6; k++) { const hh = RGx.R + 12 + k * (RGx.ceil - 20) / 5, sd = k % 2 ? 1 : -1, a = pol(wrap(th + sd * 10 / RGx.R), hh), b = pol(wrap(th + sd * 18 / RGx.R), hh + 4), c = pol(wrap(th + sd * 10 / RGx.R), hh + 8); g.fillStyle(0xf0e4c8, 1).fillTriangle(a.x, a.y, b.x, b.y, c.x, c.y); }
        const s = pol(th, RGx.R + RGx.ceil * 0.55); g.fillStyle(0xe8dcc0, 1).fillCircle(s.x, s.y, 6 * z); g.fillStyle(0x1a0e04, 1).fillCircle(s.x - 2.4 * z, s.y - 1, 1.8 * z).fillCircle(s.x + 2.4 * z, s.y - 1, 1.8 * z); g.fillRect(s.x - 2 * z, s.y + 3 * z, 4 * z, 1.5 * z);
        for (let k = 0; k < 3; k++) { const q = pol(wrap(th + (k - 1) * 5 / RGx.R), RGx.R + 20 + k * 27); g.fillStyle(0x4a6a1a, 1).fillCircle(q.x, q.y, (3 + k) * z); }
      }
    });
    // ---- Bessie's feed pipes, along the roof of the chambers on the true route: the cheese pulses towards the way on
    for (const [a0, a1, to] of (RG.pipes || [])) {
      const pa = wrap(this.caveAbs(a0)), span = a1 - a0, top = RG.R + RG.ceil;
      const s0 = Math.max(-vh, angDiff(pa, vt)), s1 = Math.min(vh, angDiff(pa, vt) + span); if (s1 <= s0) continue;
      band(top - 16, top - 4, wrap(vt + s0), wrap(vt + s1), 0x6a5a2a); band(top - 14, top - 11, wrap(vt + s0), wrap(vt + s1), 0xb8a060);
      for (let x = Math.ceil(a0 * RG.R / 50) * 50; x < a1 * RG.R; x += 50) { const th = this.caveAbs(x / RG.R); if (!inView(th)) continue; const p = pol(th, top - 10); g.fillStyle(0x3a2e14, 1).fillRect(p.x - 2 * z, p.y - 7 * z, 4 * z, 14 * z); }
      for (const [from, sd] of [[a0, 1], [a1, -1]]) {                         // pulses, flowing towards `to` from both ends
        const Ls = Math.abs(to - from) * RG.R; if (Ls < 20) continue;
        for (let k = 0; k * 70 < Ls; k++) {
          const x = from * RG.R + sd * ((t * 90 + k * 70) % Ls), th = this.caveAbs(x / RG.R); if (!inView(th)) continue;
          const p = pol(th, top - 10); g.fillStyle(0xffb52a, 1).fillEllipse(p.x, p.y, 13 * z, 10 * z); g.fillStyle(0xfff0a0, 1).fillCircle(p.x + sd * 3 * z, p.y - 2 * z, 2 * z);
          if (k % 2 === 0) this.labLights.push([p.x, p.y, 46 * z, 0.5]);
        }
      }
      { const th = this.caveAbs(to); if (inView(th)) { const p = pol(th, top - 10), q = pol(th, top - 30); g.lineStyle(6 * z, 0x6a5a2a, 1).lineBetween(p.x, p.y, q.x, q.y); g.fillStyle(0xffb52a, 0.9).fillCircle(q.x, q.y + 4 * z, (3 + Math.sin(t * 8)) * z); this.labLights.push([q.x, q.y, 60 * z, 0.7]); } }   // it drips down into the hole
    }
    // ---- the pump outlet and its next surge (a warning band low or high)
    if (C.next) { const low = C.next.kind === 'low', p0 = RG.R + (low ? 0 : 30), p1 = p0 + 24; band(p0, p1, A0, A1, low ? 0xff8a2a : 0x5ce1ff, 0.12 + 0.1 * Math.sin(t * 30)); }
    if (RG.outlet !== undefined) { const o = this.caveAbs(RG.outlet), p = this.screenPos(o, RG.ceil - 10), q = this.screenPos(o, RG.ceil + 6), pul = 1 + (C.thump || 0) * 0.4; if (p.vis) { fg.lineStyle(9 * z * pul, 0x3a3a48, 1).lineBetween(q.x, q.y, p.x, p.y); fg.fillStyle(0xffb52a, 1).fillCircle(p.x, p.y + 3 * z, 6 * z * pul); this.labLights.push([p.x, p.y, 70 * z, 0.8]); } }
    // ---- loot glinting in the dead ends
    for (const L of C.loot) if (!L.taken && L.ring === ring && inView(L.theta)) {
      const p = this.screenPos(L.theta, 8);
      if (L.kind === 'stash') { for (let k = 0; k < 7; k++) { g.fillStyle(k % 2 ? 0xffd23f : 0xffb52a, 1).fillEllipse(p.x + (k - 3) * 5 * z, p.y - (3 - Math.abs(k - 3)) * 4 * z, 9 * z, 6 * z); } }
      else { g.fillStyle(0xffe27a, 1).fillTriangle(p.x - 8 * z, p.y + 4 * z, p.x + 8 * z, p.y + 4 * z, p.x, p.y - 8 * z); }
      if (Math.floor(t * 3 + L.theta * 9) % 3 === 0) { g.fillStyle(0xffffff, 1).fillRect(p.x + 4 * z, p.y - 10 * z, 2 * z, 2 * z); }
      this.labLights.push([p.x, p.y, 60 * z, 0.7]);
    }
    // ---- grubs under the floor: the crust twitches
    for (const e of this.enemies) if (e.ls && e.ls.st === 'under' && inView(e.theta)) { const p = this.screenPos(e.theta, 2 + Math.abs(Math.sin(t * 6 + e.seed)) * 3); g.fillStyle(0x6a4a1a, 1).fillEllipse(p.x, p.y, 22 * z, 8 * z); g.fillStyle(0x8a6a2a, 1).fillEllipse(p.x, p.y - 2 * z, 14 * z, 4 * z); }
    // ---- valves
    for (const V of C.valves) {
      if (!V.alive || V.ring !== ring) continue;
      const p = this.screenPos(V.theta, RG.ceil - 16), q = this.screenPos(V.theta, RG.ceil); if (!p.vis) continue;
      fg.lineStyle(5 * z, 0x5a6272, 1).lineBetween(q.x, q.y, p.x, p.y);
      fg.fillStyle(0x1a1020, 1).fillCircle(p.x, p.y, 10 * z); fg.fillStyle(V.hp === 3 ? 0xd62828 : 0xff8a5a, 1).fillCircle(p.x, p.y, 8 * z);
      fg.lineStyle(2 * z, 0xffffff, 0.9).lineBetween(p.x - 6 * z, p.y, p.x + 6 * z, p.y).lineBetween(p.x, p.y - 6 * z, p.x, p.y + 6 * z);
      this.labLights.push([p.x, p.y, 40 * z, 0.5]);
    }
    // ---- Bessie in the core (part 2 rebuilds this room)
    const core = CV.rings[CV.rings.length - 1], bth = this.caveAbs(core.bessie);
    if (ring === CV.rings.length - 1) {
      this.caveBessie.setVisible(true); this.place(this.caveBessie, bth, C.won ? Math.abs(Math.sin(t * 8)) * 10 : Math.min(30, C.cheeseH * 0.4), 0);
      const pp = this.screenPos(bth, 40); if (pp.vis) this.labLights.push([pp.x, pp.y, 160 * z, 1]);
      if (pp.vis && !C.won) for (const o of [-14, 14]) { const a2 = this.screenPos(wrap(bth + o / R), 30), b2 = this.screenPos(wrap(bth + o * 2.5 / R), core.ceil); fg.lineStyle(6 * z, 0x3a3a48, 1).lineBetween(a2.x, a2.y, b2.x, b2.y); fg.lineStyle(3 * z, 0xffd23f, 0.8).lineBetween(a2.x, a2.y, b2.x, b2.y); }
    } else if (this.caveBessie) this.caveBessie.setVisible(false);
  },

  // ---- the dark: a black sheet over everything, with Chris's lamp (and every glow) rubbed out of it
  labDark() {
    const C = this.cave; if (!C || !this.def.cave) return;
    const W = this.W, H = this.H, z = this.zoom, t = this.t;
    if (!this.labRT) { this.labRT = this.add.renderTexture(0, 0, W, H).setOrigin(0).setDepth(14).setScrollFactor(0); this.labStamp = this.make.image({ key: 'lamp', add: false }); this.labEyes = this.add.graphics().setDepth(14.2); }
    if (this.labRT.width !== W || this.labRT.height !== H) this.labRT.setSize(W, H);
    const RT = this.labRT, S = this.labStamp, eg = this.labEyes; eg.clear();
    const under = C.ring > 0, dark = this.state === 'play' || this.state === 'dead' || this.paused ? (under ? 0.93 : 0.5) : (under ? 0.93 : 0.35);
    RT.clear(); RT.fill(under ? 0x05030a : 0x0a0614, dark); this.labLights = (this.labLights || []).slice(0, 26);
    const rub = (x, y, r, a) => { S.setPosition(x, y).setScale(r * 2 / 128).setAlpha(a); RT.erase(S); };
    const P = this.pl, me = this.screenPos(P.theta, P.h + 26), fl = 1 + Math.sin(t * 13) * 0.02 + Math.sin(t * 31) * 0.015;
    rub(me.x, me.y, (under ? 200 : 330) * z * fl, 1); rub(me.x + (P.facing || 1) * 80 * z, me.y, (under ? 140 : 200) * z, 0.8);   // the lamp, throwing a bit further the way he faces
    if (under) {
      for (const [x, y, r, a] of (this.labLights || [])) rub(x, y, r, a);
      for (const b of this.pBullets.slice(0, 14)) { const q = this.screenPos(b.theta, b.h); rub(q.x, q.y, 46 * z, 0.6); }
      for (const b of this.eBullets) if (b.caveWave) { const q = this.screenPos(b.theta, b.h); rub(q.x, q.y, 70 * z, 0.8); }
      // eyes in the dark
      for (const e of this.enemies) {
        if (e.phased || e.hp <= 0) continue; const q = this.screenPos(e.theta, e.h + (e.ch || 0) * 0.7); if (!q.vis) continue;
        const d = Math.hypot(q.x - me.x, q.y - me.y) / z; if (d < 150) continue;
        if (Math.floor(t * 0.9 + e.seed * 3) % 5 === 0 && (t * 0.9 + e.seed * 3) % 1 < 0.12) continue;   // a blink
        eg.fillStyle(0xff3a1a, 0.9).fillCircle(q.x - 3 * z, q.y, 1.8 * z).fillCircle(q.x + 3 * z, q.y, 1.8 * z);
      }
    }
  },

  drawCaveHud() {
    const C = this.cave; if (!C || !this.caveG) return;
    this.labDark();
    if (C.ring > 0) {
      const bw = 170, bx = this.W / 2 - bw / 2, by = 42, hg = this.hudG, t = this.t;
      hg.fillStyle(0x1a1020, 1).fillRect(bx - 2, by - 2, bw + 4, 12); hg.fillStyle(0xc9cde0, 1).fillRect(bx - 1, by - 1, bw + 2, 10); hg.fillStyle(0x0c0a24, 1).fillRect(bx, by, bw, 8);
      hg.fillStyle(C.fill > 0.75 && Math.floor(t * 6) % 2 ? 0xff5a3a : 0xffb52a, 1).fillRect(bx, by, bw * C.fill, 8);
      this.caveTxt.setVisible(true).setText(C.won ? 'DRAINING!' : 'BESSIE\'S DROWNING IN CHEESE  ' + Math.round(C.fill * 100) + '%').setPosition(this.W / 2, by + 18);
    }
    this.drawCaveMap();
  },
  // the map: only the bits you've been through show up
  drawCaveMap() {
    if (!this.landscape || this.cave.ring === 0) return;
    const g = this.hudG, C = this.cave, CV = this.def.cave, P = this.pl, t = this.t;
    const bx = this.W - 58, by = 10, rx = bx + 24, ry = by + 24, Rs = (this.def.radius || 420), k = 22 / Rs;
    g.fillStyle(0x1a1020, 1).fillRect(bx - 2, by - 2, 52, 52); g.fillStyle(0xc9cde0, 1).fillRect(bx - 1, by - 1, 50, 50); g.fillStyle(0x0c0806, 1).fillRect(bx, by, 48, 48);
    const rot = -P.theta, pt = (th, rad) => [rx + rad * k * Math.sin(th + rot), ry - rad * k * Math.cos(th + rot)];
    CV.rings.forEach((RG, ri) => {
      if (!ri) return; const vb = C.seen[ri] || {};
      for (const b in vb) { const th = this.caveAbs((+b + 0.5) / 48 * TAU), [x, y] = pt(th, RG.R + RG.ceil * 0.5); g.fillStyle(ri === C.ring ? 0xc8a050 : 0x6a5028, 1).fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3); }
    });
    const myR = this.caveRing(C.ring).R + 10, [cxx, cyy] = pt(P.theta, myR);
    g.fillStyle(0x1a1020, 1).fillRect(Math.round(cxx) - 3, Math.round(cyy) - 3, 6, 6); g.fillStyle(Math.floor(t * 4) % 2 ? 0xffd23f : 0xffffff, 1).fillRect(Math.round(cxx) - 2, Math.round(cyy) - 2, 4, 4);
  },
};
