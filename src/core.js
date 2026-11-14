// ===== L8 part 2 (v2.86): THE CORE - THE MILKMASTER'S CHURN =====
// Down through the hatch at the bottom of the Lactose Labyrinth: the core of the moon is a vast spinning steel churn. The
// spin (centrifuge.js, run with data.core) pins Chris to the wall; there's NO gravity at all in here, so when it winds
// down to a dead stop a jump sails dead straight across the middle. Bessie hangs at the hub, strapped into a milking
// machine, a hose on her udders running to THE MILKMASTER: a mad rat scientist riding a hover-churn, a tank of her milk on
// his back. Her MILK bar drains while he's plugged in: let it run dry and it's over.
//  1  SHIELD: he orbits her inside a glass bubble, powered by 3 PUMPS on the drum wall. Run round the wall and smash them
//     (each one you bust slows the drain). He squirts milk and lobs curd bombs that burst.
//  2  The bubble pops. He rips the hose out and comes for you: hovers and sprays, then a red sight-line and a CHARGE right
//     across the drum. Calls in drones. Shots hurt him; landing on him feet first hurts him a lot.
//  3  MILK OVERDRIVE (below 40%): he plugs the hose into HIMSELF, swells up, glows, and spins rings of milk out round the
//     drum (jump through the gap). The drain starts again, faster. Finish him.
// Then grab Bessie... and the roof of the churn tears open: the Rat King's Royal Saucer beams her up and away, laughing.
// Back to the Labyrinth: level clear, on to Parmesan Prime.

const CORE_SPIN = [
  { w: 1.15, t: 8 },
  { w: 0.25, t: 5, msg: 'SPIN DOWN: FLOAT ACROSS!', col: '#9fd8ff' },
  { w: -1.15, t: 7, msg: 'REVERSE CHURN!', col: '#ffd23f' },
  { w: 0, t: 4, msg: 'DEAD STOP: ZERO-G!', col: '#ff7a5a' },
  { w: 1.4, t: 6, msg: 'FULL CHURN!', col: '#ffb07a' },
  { w: -0.3, t: 5, msg: 'SPIN DOWN: FLOAT ACROSS!', col: '#9fd8ff' },
];
const MM_HP = 150, MM_OD = 0.4;

function makeCoreTextures(scene) {
  if (scene.game.__coreTex || typeof ppSculpt !== 'function') return; scene.game.__coreTex = true;
  const STEEL = [0xe8eef8, 0xaab4c4, 0x6e7a8e, 0x3e4658, 0x1e2230], COAT = [0xffffff, 0xe8e4dc, 0xbab4a8, 0x7a7468, 0x3e3a34],
    PINK = [0xffd8e0, 0xf09aaa, 0xc86a80, 0x8a3a52, 0x4a1a2a], BRASS = [0xfff0a0, 0xf0c040, 0xb88420, 0x7a5010, 0x3e2808],
    GREEN = [0xe0ffd8, 0x8aff7a, 0x3ac04a, 0x1a7a2a, 0x0a3a14], FUR = [0xe8e0e8, 0xb0a8b8, 0x7a7088, 0x4a4458, 0x26222e],
    MILK = [0xffffff, 0xf4f8ff, 0xd8e4f4, 0xa8b8d0, 0x6a7a94], RED = [0xff8a6a, 0xe0302a, 0x8a1010, 0x5a0808, 0x2a0404], INK = 0x1a1020;
  const pal = [].concat(STEEL, COAT, PINK, BRASS, GREEN, FUR, MILK, RED, [INK, 0xffd23f, 0x5ad0e8]);
  // THE MILKMASTER on his hover-churn, facing right
  const draw = (H, od) => {
    const g = H.g; H.ink = INK;
    // the milk tank on his back: a glass cylinder, sloshing white, bubbles; the hose comes out of the bottom
    H.shape([[10, 34], [28, 30], [30, 76], [12, 80]], MILK, 'cyl'); H.line([[11, 50], [29, 47]], MILK[3], 1);
    for (const [x, y] of [[16, 60], [22, 68], [18, 44], [24, 54]]) H.ell(x, y, 1.6, 1.6, 0xffffff);
    H.shape([[8, 30], [30, 26], [31, 32], [9, 36]], BRASS, 'down'); H.shape([[10, 78], [31, 74], [31, 80], [11, 84]], BRASS, 'down');
    H.tube([[16, 84], [12, 92], [6, 96]], 5, 4, [0xff8a6a, 0xe0302a, 0xa01a1a, 0x6a0a0a, 0x3a0404]);
    // the hover-churn: a dented steel milk churn, brass bands, rivets, a gauge, two jets under it
    H.shape([[30, 54], [94, 54], [98, 62], [96, 104], [32, 106], [26, 62]], STEEL, 'cyl');
    for (const y of [60, 96]) H.shape([[27, y], [97, y], [97, y + 5], [27, y + 5]], BRASS, 'down');
    for (let x = 32; x < 96; x += 6) { H.ell(x, 62.5, 0.9, 0.9, BRASS[0]); H.ell(x, 98.5, 0.9, 0.9, BRASS[0]); }
    H.ell(78, 80, 7, 7, BRASS, 'round'); H.ell(78, 80, 5, 5, 0xffffff); H.line([[78, 80], [81, 76]], RED[1], 1);   // a gauge in the red
    H.shape([[40, 74], [60, 72], [62, 88], [42, 90]], 0xffd23f, 'flat'); H.line([[44, 77], [50, 85], [56, 77]], INK, 1.6);   // "M" on a hazard plate
    H.crack(88, 66, 14, 1.9);
    for (const x of [44, 82]) { H.shape([[x - 6, 104], [x + 6, 104], [x + 4, 112], [x - 4, 112]], STEEL, 'cyl'); H.ell(x, 112, 4, 1.6, INK); }
    // the doctor himself, rising out of the churn
    const big = od ? 1.25 : 1;
    // lab coat (stained with milk and blood), arms
    H.shape([[42, 56], [40, 36], [50, 26], [72, 26], [80, 36], [80, 56]], COAT, 'round');
    H.line([[61, 30], [60, 56]], COAT[3], 1); H.ell(54, 46, 3, 2.2, MILK[2]); H.ell(70, 50, 2.6, 1.6, RED[2]); H.ell(66, 40, 1.6, 1.2, RED[1]);
    if (od) { H.line([[48, 32], [52, 46], [47, 54]], RED[2], 0.8, true); H.flecks(42, 28, 80, 56, 8, PINK[2], 1.4); }      // the coat bursting
    // left arm: a bony claw on a big brass lever
    H.tube([[44, 34], [36 - (od ? 4 : 0), 44], [34, 54]], 7 * big, 6 * big, COAT); H.ell(34, 55, 3.6 * big, 3.2 * big, PINK, 'round');
    H.line([[34, 56], [30, 46]], BRASS[2], 2.2); H.ell(30, 45, 2.6, 2.6, RED, 'round');
    // right arm: brandishing a giant syringe full of milk
    H.tube([[76, 32], [86, 30], [92, 22]], 7 * big, 6 * big, COAT); H.ell(93, 21, 3.8 * big, 3.4 * big, PINK, 'round');
    g.save(); g.translate(94, 20); g.rotate(-0.5);
    H.shape([[-4, -3], [22, -3], [22, 3], [-4, 3]], [0xffffff, 0xeef4ff, 0xc8d8ec, 0x8a9ab4, 0x4a5a74], 'down'); H.shape([[0, -2], [16, -2], [16, 2], [0, 2]], MILK, 'down');
    H.line([[22, 0], [32, 0]], STEEL[1], 1); H.shape([[-8, -5], [-4, -5], [-4, 5], [-8, 5]], STEEL, 'cyl'); H.shape([[-14, -1.5], [-8, -1.5], [-8, 1.5], [-14, 1.5]], STEEL, 'cyl');
    g.restore();
    // the head: wild white hair, a long pink snout, huge brass goggles with glowing green lenses, a manic grin
    for (const [x, y, a] of [[48, 10, -2.3], [52, 4, -1.9], [60, 0, -1.6], [68, 2, -1.2], [44, 16, -2.8], [46, 22, 2.8]]) { H.shape([[x, y + 6], [x + Math.cos(a) * 12, y + Math.sin(a) * 12], [x + 6, y + 4]], [0xffffff, 0xf4f0f4, 0xd8d0d8, 0xa8a0b0, 0x6a6278], 'round'); }
    H.ell(46, 12, 6, 7.5, PINK, 'round', -0.3);                                                        // ear
    H.ell(60, 18, 14, 12, FUR, 'round');
    H.shape([[66, 14], [80, 17], [90, 22], [92, 26], [84, 29], [70, 30], [62, 27]], FUR, 'round');      // the snout
    H.ell(92, 24, 2.6, 2.4, PINK, 'round');
    H.shape([[68, 26], [86, 26], [80, 33], [70, 32]], 0x3a0a10, 'flat');                                 // the grin
    for (let x = 70; x < 85; x += 3) H.shape([[x, 26], [x + 2.4, 26], [x + 1.2, 29]], 0xfff4d8, 'flat');
    H.shape([[78, 30], [81, 30], [80.5, 35], [78.5, 35]], 0xfff4d8, 'flat');                              // a buck tooth
    H.line([[48, 13], [76, 13]], INK, 2.4);                                                              // the goggle strap
    for (const [x, r] of [[64, 6.4], [76, 5.2]]) { H.ell(x, 14, r, r, BRASS, 'round'); H.ell(x, 14, r - 1.8, r - 1.8, GREEN, 'round'); H.ell(x - 1.4, 12.6, 1.2, 1.2, 0xffffff); }
    for (const [x, y] of [[84, 20], [86, 24], [85, 28]]) H.line([[x, y], [x + 9, y - 2 + (y - 24) * 0.3]], FUR[3], 0.6);
    if (od) for (const [x, y] of [[52, 34], [60, 42], [72, 38]]) H.line([[x, y], [x + 3, y + 5], [x + 1, y + 9]], GREEN[2], 1, true);   // glowing veins
  };
  ppSculpt(scene, 'milkmaster', 116, 118, 1, H => { H.g.translate(2, 6); draw(H, false); }, { pal });
  ppSculpt(scene, 'milkmaster_od', 116, 118, 1, H => { H.g.translate(2, 6); draw(H, true); }, { pal });
  // a milk pump on the drum wall: a glass tank of milk with a brass piston and a red warning lamp
  ppSculpt(scene, 'mm_pump', 44, 60, 1, H => {
    H.ink = INK;
    H.shape([[4, 52], [40, 52], [40, 60], [4, 60]], STEEL, 'cyl');
    H.shape([[8, 16], [36, 16], [36, 52], [8, 52]], [0xeef4ff, 0xc8d8ec, 0x9aaac4, 0x6a7a94, 0x3a4a64], 'cyl');
    H.shape([[10, 26], [34, 26], [34, 51], [10, 51]], MILK, 'cyl');
    for (const [x, y] of [[14, 40], [22, 34], [28, 44], [18, 30]]) H.ell(x, y, 1.4, 1.4, 0xffffff);
    H.shape([[6, 10], [38, 10], [38, 17], [6, 17]], BRASS, 'down'); H.shape([[19, 0], [25, 0], [25, 10], [19, 10]], STEEL, 'cyl');
    H.ell(22, 3, 4.5, 3, RED, 'round');
  }, { pal });
  ppSculpt(scene, 'mm_pump_bust', 44, 60, 1, H => {
    H.ink = INK;
    H.shape([[4, 52], [40, 52], [40, 60], [4, 60]], STEEL, 'cyl');
    H.shape([[8, 52], [8, 34], [13, 40], [17, 30], [22, 38], [27, 28], [31, 40], [36, 33], [36, 52]], [0xeef4ff, 0xc8d8ec, 0x9aaac4, 0x6a7a94, 0x3a4a64], 'cyl');
    H.shape([[10, 51], [10, 46], [34, 45], [34, 51]], MILK, 'cyl');
    H.shape([[12, 12], [30, 18], [28, 22], [10, 16]], BRASS, 'down');
  }, { pal });
}

const CoreMixin = {
  coreCreate() {
    makeCoreTextures(this);
    const RD = this.RD;
    this.hpMax = this.hp = 8;
    this.exitBtn.setVisible(false);
    this.cr = { st: 'fight', t: 0, milk: 1, phase: 1, score: 0, snatch: null, freed: false };
    // the pumps, fixed to the drum wall (drum coordinates)
    this.pumps = [0.4, 2.5, 4.6].map(a => ({ a, hp: 16, alive: true, flash: 0, im: null }));
    this.pumpG = this.add.graphics(); this.drum.add(this.pumpG);
    for (const p of this.pumps) { p.im = this.add.image(Math.cos(p.a) * (RD - 28), Math.sin(p.a) * (RD - 28), 'mm_pump').setRotation(p.a + Math.PI / 2).setScale(1.25); this.drum.add(p.im); }
    // Bessie at the hub, in the milking machine (she hangs still on a bearing while the drum turns round her)
    this.mmBackG = this.add.graphics(); this.world.addAt(this.mmBackG, this.world.getIndex(this.drum) + 1);
    this.cow = this.add.image(0, 6, 'bessie').setScale(1.6); this.world.add(this.cow);
    this.mmG = this.add.graphics(); this.world.add(this.mmG);
    // the Milkmaster
    const M = this.mm = { x: 0, y: -120, vx: 0, vy: 0, hp: MM_HP, ang: -Math.PI / 2, dir: 1, st: 'orbit', t: 0, cd: 2.2, shield: 1, tether: true, flash: 0, dropT: 7, od: false, dead: false };
    M.im = this.add.image(M.x, M.y, 'milkmaster').setScale(1.05); this.world.add(M.im);
    this.mmTopG = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD); this.world.add(this.mmTopG);
    this.coreHud = this.add.graphics().setDepth(20);
    const f = this.f;
    this.mmName = this.add.text(0, 0, 'THE MILKMASTER', f(9, '#ffffff')).setOrigin(0.5, 0).setDepth(20);
    this.milkLbl = this.add.text(0, 0, "BESSIE'S MILK", f(7, '#ffffff')).setOrigin(0.5, 0).setDepth(20);
    this.coreLayout = () => { const W = this.scale.width; this.mmName.setPosition(W / 2, this.scale.height - 38); this.milkLbl.setPosition(W / 2, H0()); };
    const H0 = () => 76;
    this.coreLayout(); this.scale.on('resize', this.coreLayout, this); this.events.once('shutdown', () => this.scale.off('resize', this.coreLayout, this));
    this.time.delayedCall(900, () => this.pop(this.scale.width / 2, this.scale.height * 0.22, 'MWEE-HEE-HEE! MORE MILK!', '#8aff7a'));
    Sound.sfx('moo');
  },

  // ---- (v2.87) THE CORE OF THE MOON. The churn is a ring of rind crust and rock hung in the molten heart of the moon:
  // round it, glowing strata of rock and cheese, rivers of molten cheese running inwards, crystals, floating boulders,
  // embers rising through the heat. (The centrifuge's cogs and motor are hidden.)
  coreBuildDrum() {
    const RD = this.RD, key = 'core_drum';
    if (!this.textures.exists(key)) {
      const S = 1.5, Ro = RD + 66, size = Math.ceil(Ro * 2 * S) + 4, c = size / 2, ct = this.textures.createCanvas(key, size, size), x = ct.getContext();
      let sd = 77; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      x.save(); x.translate(c, c); x.scale(S, S);
      // the craggy outer rock of the ring: spikes and boulders, lit from the molten core behind
      x.beginPath(); for (let k = 0; k <= 120; k++) { const a = k / 120 * Math.PI * 2, r = RD + 40 + Math.abs(Math.sin(k * 1.7)) * 14 + (k % 7 === 0 ? 14 : 0) + rnd() * 6; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath();
      let gr = x.createRadialGradient(0, 0, RD, 0, 0, RD + 66); gr.addColorStop(0, '#5a3418'); gr.addColorStop(0.5, '#3a200e'); gr.addColorStop(1, '#1a0c06'); x.fillStyle = gr; x.fill();
      x.lineWidth = 3; x.strokeStyle = '#ff9a2a'; x.globalAlpha = 0.55; x.stroke(); x.globalAlpha = 1;
      // the back of the churn: dark rock, glowing veins of molten cheese running out from the hub, crystal clusters
      gr = x.createRadialGradient(0, 0, 20, 0, 0, RD + 4); gr.addColorStop(0, '#3a1e0e'); gr.addColorStop(0.6, '#24120a'); gr.addColorStop(1, '#140a06');
      x.fillStyle = gr; x.beginPath(); x.arc(0, 0, RD + 4, 0, 7); x.fill();
      for (let k = 0; k < 70; k++) { const a = rnd() * 6.3, r = 30 + rnd() * (RD - 40); x.fillStyle = 'rgba(0,0,0,0.25)'; x.beginPath(); x.ellipse(Math.cos(a) * r, Math.sin(a) * r, 6 + rnd() * 18, 4 + rnd() * 10, a, 0, 7); x.fill(); }
      for (let k = 0; k < 9; k++) {                                              // the veins
        let a = k / 9 * Math.PI * 2 + rnd() * 0.3, r = 40; x.beginPath(); x.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        while (r < RD - 10) { r += 10 + rnd() * 10; a += (rnd() - 0.5) * 0.25; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        for (const [w, col, al] of [[9, '#ff6a1a', 0.25], [5, '#ffa82a', 0.7], [2, '#fff0a0', 1]]) { x.lineWidth = w; x.strokeStyle = col; x.globalAlpha = al; x.lineJoin = 'round'; x.stroke(); }
        x.globalAlpha = 1;
      }
      for (let k = 0; k < 14; k++) {                                             // crystal clusters of cheese (tyrosine)
        const a = rnd() * 6.3, r = 70 + rnd() * (RD - 110), cx = Math.cos(a) * r, cy = Math.sin(a) * r;
        for (let q = 0; q < 4; q++) { const b = a + Math.PI + (q - 1.5) * 0.4, L = 8 + rnd() * 12, w = 3 + rnd() * 2;
          x.beginPath(); x.moveTo(cx + Math.cos(b + 1.57) * w, cy + Math.sin(b + 1.57) * w); x.lineTo(cx + Math.cos(b) * L, cy + Math.sin(b) * L); x.lineTo(cx - Math.cos(b + 1.57) * w, cy - Math.sin(b + 1.57) * w); x.closePath();
          x.fillStyle = q % 2 ? '#fff4c0' : '#e8c060'; x.fill(); x.strokeStyle = '#3a200e'; x.lineWidth = 1; x.stroke(); }
      }
      // the rind crust you run on: layered, pitted, a pale worn lip on the inside
      for (const [r0, r1, col] of [[RD + 2, RD + 40, '#8a5a24'], [RD + 10, RD + 22, '#a8743a'], [RD + 26, RD + 32, '#6a4018']]) { x.lineWidth = r1 - r0; x.strokeStyle = col; x.beginPath(); x.arc(0, 0, (r0 + r1) / 2, 0, 7); x.stroke(); }
      for (let k = 0; k < 90; k++) { const a = rnd() * 6.3, r = RD + 6 + rnd() * 30; x.fillStyle = '#3a200e'; x.beginPath(); x.arc(Math.cos(a) * r, Math.sin(a) * r, 1.5 + rnd() * 3, 0, 7); x.fill(); }
      x.lineWidth = 5; x.strokeStyle = '#e8c890'; x.beginPath(); x.arc(0, 0, RD + 2, 0, 7); x.stroke();
      // glowing crystal studs round the inside of the wall, so you can see it whizz round
      for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, px = Math.cos(a) * (RD - 1), py = Math.sin(a) * (RD - 1);
        x.fillStyle = 'rgba(255,170,40,0.35)'; x.beginPath(); x.arc(px, py, 9, 0, 7); x.fill();
        x.beginPath(); x.moveTo(px + Math.cos(a + 1.57) * 4, py + Math.sin(a + 1.57) * 4); x.lineTo(px - Math.cos(a) * 10, py - Math.sin(a) * 10); x.lineTo(px - Math.cos(a + 1.57) * 4, py - Math.sin(a + 1.57) * 4); x.closePath(); x.fillStyle = k % 2 ? '#fff4c0' : '#ffb52a'; x.fill(); x.strokeStyle = '#3a200e'; x.lineWidth = 1.2; x.stroke(); }
      // hot cracks seeping through the outer rock
      for (let k = 0; k < 12; k++) { const a = rnd() * 6.3; x.beginPath(); let r = RD + 34; x.moveTo(Math.cos(a) * r, Math.sin(a) * r); let b = a; while (r < RD + 58) { r += 5; b += (rnd() - 0.5) * 0.06; x.lineTo(Math.cos(b) * r, Math.sin(b) * r); } x.lineWidth = 2; x.strokeStyle = '#ffb52a'; x.stroke(); }
      x.restore(); ct.refresh(); ct.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
    this.drum.add(this.add.image(0, 0, key).setScale(1 / 1.5));
    const g = this.add.graphics(); g.lineStyle(8, 0xf4f8ff, 0.35).strokeCircle(0, 0, RD - 5);    // a film of milk spun against the wall
    for (let k = 0; k < 20; k++) { const a = Math.random() * 6.3, r = RD - 4 - Math.random() * 6; g.fillStyle(0xffffff, 0.8).fillCircle(Math.cos(a) * r, Math.sin(a) * r, 2 + Math.random() * 4); }
    this.drum.add(g);
  },

  coreBack() {
    const W = this.scale.width, H = this.scale.height, g = this.backG, cx = W / 2, cy = H * 0.53, sc = this.wsc(), Rm = Math.hypot(W, H);
    if (!this.coreBg) {                                                          // the molten heart, as a smooth canvas (radial glow + strata)
      const key = 'core_bg', w = 512, h = 512;
      if (!this.textures.exists(key)) {
        const ct = this.textures.createCanvas(key, w, h), x = ct.getContext(); let sd = 31; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
        const gr = x.createRadialGradient(256, 256, 30, 256, 256, 360); gr.addColorStop(0, '#fff0a0'); gr.addColorStop(0.18, '#ffb52a'); gr.addColorStop(0.38, '#c8501a'); gr.addColorStop(0.62, '#5a1c0e'); gr.addColorStop(1, '#140608');
        x.fillStyle = gr; x.fillRect(0, 0, w, h);
        for (let k = 0; k < 9; k++) {                                            // rough rings of strata round the heart, darker outwards
          const r = 150 + k * 26 + rnd() * 10; x.beginPath(); for (let q = 0; q <= 90; q++) { const a = q / 90 * Math.PI * 2, rr = r + Math.sin(q * 0.7 + k) * 6 + rnd() * 5; x.lineTo(256 + Math.cos(a) * rr, 256 + Math.sin(a) * rr); } x.closePath();
          x.lineWidth = 10 + rnd() * 10; x.strokeStyle = `rgba(${20 + k * 2},${8 + k},${6},${0.25 + k * 0.05})`; x.stroke();
          x.lineWidth = 1.5; x.strokeStyle = `rgba(255,${150 - k * 10},40,${0.35 - k * 0.03})`; x.stroke();
        }
        for (let k = 0; k < 16; k++) {                                           // molten rivers running in to the heart
          let a = k / 16 * Math.PI * 2 + rnd() * 0.2, r = 360; x.beginPath(); x.moveTo(256 + Math.cos(a) * r, 256 + Math.sin(a) * r);
          while (r > 120) { r -= 12; a += (rnd() - 0.5) * 0.12; x.lineTo(256 + Math.cos(a) * r, 256 + Math.sin(a) * r); }
          x.lineWidth = 6; x.strokeStyle = 'rgba(255,120,30,0.35)'; x.stroke(); x.lineWidth = 2; x.strokeStyle = 'rgba(255,220,120,0.7)'; x.stroke();
        }
        ct.refresh(); ct.setFilter(Phaser.Textures.FilterMode.LINEAR);
      }
      this.coreBg = this.add.image(0, 0, key).setDepth(-0.5);
      // floating boulders and crystal shards drifting round the heart
      this.rocks = Array.from({ length: 14 }, (_, k) => ({ a: k / 14 * Math.PI * 2 + Math.random() * 0.3, r: 0.55 + Math.random() * 0.45, s: 6 + Math.random() * 16, sp: (Math.random() < 0.5 ? -1 : 1) * (0.02 + Math.random() * 0.05), ph: Math.random() * 6, cr: Math.random() < 0.35 }));
      this.embers = Array.from({ length: 50 }, () => ({ x: Math.random(), y: Math.random(), v: 0.03 + Math.random() * 0.06, ph: Math.random() * 6 }));
      for (const d of this.drive) { for (const o of [d.big, d.pin, d.mot, d.motorG]) if (o) o.setVisible(false); }
      if (this.sun) this.sun.setVisible(false);
      for (const f of this.farCogs) f.im.setVisible(false);
    }
    this.coreBg.setPosition(cx, cy).setDisplaySize(Rm * 1.15, Rm * 1.15);
    g.fillStyle(0x000000, 0.5).fillCircle(cx + 10, cy + 14, (this.RD + 66) * sc);       // the churn's shadow
    this.vig.setDisplaySize(W, H);
  },
  coreBackAnim(dt) {
    const W = this.scale.width, H = this.scale.height, cx = W / 2, cy = H * 0.53, Rm = Math.hypot(W, H) * 0.5, t = this.t, bg = this.beamG, sg = this.steamG;
    bg.clear(); sg.clear();
    bg.fillStyle(0xffb52a, 0.06 + 0.03 * Math.sin(t * 1.7)).fillCircle(cx, cy, Rm * 0.75);   // the heart throbs
    bg.fillStyle(0xfff0a0, 0.05 + 0.03 * Math.sin(t * 2.3 + 1)).fillCircle(cx, cy, Rm * 0.45);
    for (const r of this.rocks || []) {                                           // boulders drifting round in the heat
      r.a += r.sp * dt; const rr = r.r * Rm, x = cx + Math.cos(r.a) * rr, y = cy + Math.sin(r.a) * rr * 0.8 + Math.sin(t + r.ph) * 4, s = r.s * (H / 390);
      if (r.cr) { sg.fillStyle(0x1a0c06, 1).fillTriangle(x - s * 0.4, y + s * 0.5, x + s * 0.4, y + s * 0.5, x, y - s); sg.fillStyle(0xffd27a, 0.9).fillTriangle(x - s * 0.25, y + s * 0.35, x + s * 0.1, y + s * 0.35, x, y - s * 0.75); }
      else { sg.fillStyle(0x1a0c06, 1).fillEllipse(x, y, s * 2, s * 1.5); sg.fillStyle(0x4a2a14, 1).fillEllipse(x - s * 0.2, y - s * 0.2, s * 1.4, s * 0.9); sg.fillStyle(0xff8a2a, 0.8).fillEllipse(x + s * 0.4, y + s * 0.4, s * 0.6, s * 0.3); }
    }
    for (const e of this.embers || []) {                                          // embers rising through the heat
      e.y -= e.v * dt; e.x += Math.sin(t * 1.3 + e.ph) * 0.01 * dt; if (e.y < -0.02) { e.y = 1.02; e.x = Math.random(); }
      bg.fillStyle(Math.sin(e.ph * 3) > 0 ? 0xffb52a : 0xff6a1a, 0.5 + 0.4 * Math.sin(t * 5 + e.ph)).fillRect(e.x * W, e.y * H, 2, 2);
    }
  },

  pumpWorld(p) { const r = this.RD - 28, x = Math.cos(p.a) * r, y = Math.sin(p.a) * r, c = Math.cos(this.D), s = Math.sin(this.D); return { x: x * c - y * s, y: x * s + y * c }; },

  // a Mac-Grinder shot: pumps, the shield, the doctor. true = the shot's used up
  coreShot(b) {
    const M = this.mm, C = this.cr;
    for (const p of this.pumps) {
      if (!p.alive) continue; const q = this.pumpWorld(p);
      if (Math.hypot(b.x - q.x, b.y - q.y) < 30) {
        p.hp--; p.flash = 0.06; Sound.sfx('tink'); this.puff(b.x, b.y, 4, 0xf4f8ff, 120, 0.3, 3);
        if (p.hp <= 0) this.bustPump(p);
        return true;
      }
    }
    if (M.dead || C.st !== 'fight') return false;
    const d = Math.hypot(b.x - M.x, b.y - M.y);
    if (M.shield > 0.05 && d < 70) { Sound.sfx('clunk'); this.puff(b.x, b.y, 4, 0x8aff7a, 140, 0.25, 2); return true; }   // pings off the bubble
    if (d < (M.od ? 52 : 42)) { this.mmHurt(1, b.x, b.y); return true; }
    return false;
  },
  bustPump(p) {
    p.alive = false; p.im.setTexture('mm_pump_bust');
    const q = this.pumpWorld(p), W = this.scale.width, H = this.scale.height;
    this.puff(q.x, q.y, 30, 0xffffff, 300, 0.8, 4); this.puff(q.x, q.y, 12, 0x9aaac4, 200, 0.5, 3);
    Sound.sfx('crash'); Sound.sfx('squelch'); this.cameras.main.shake(200, 0.01);
    this.cr.score += 1000;
    const left = this.pumps.filter(x => x.alive).length;
    this.pop(W / 2, H * 0.3, left ? 'PUMP BUST! ' + left + ' TO GO' : 'ALL PUMPS BUST!', '#7dff8a');
    if (!left) this.time.delayedCall(500, () => this.mmPhase2());
  },
  mmPhase2() {
    const M = this.mm, W = this.scale.width, H = this.scale.height; if (M.dead) return;
    M.shield = 0; M.tether = false; this.cr.phase = 2; M.st = 'hover'; M.t = 0; M.cd = 1;
    this.puff(M.x, M.y, 40, 0x8aff7a, 360, 0.7, 3); Sound.sfx('scrap'); Sound.sfx('crash'); this.cameras.main.flash(200, 200, 255, 200);
    this.pop(W / 2, H * 0.26, 'MY BUBBLE! YOU\'LL PAY FOR THAT!', '#8aff7a');
  },
  mmHurt(n, x, y) {
    const M = this.mm, W = this.scale.width, H = this.scale.height;
    if (M.dead || M.shield > 0.05) return;
    M.hp -= n; M.flash = 0.06; Sound.sfx('tink'); this.puff(x, y, 5, 0xffc23a, 160, 0.25, 3); this.cr.score += 20;
    if (!M.od && M.hp <= MM_HP * MM_OD) {                                       // MILK OVERDRIVE
      M.od = true; M.tether = true; this.cr.phase = 3; M.st = 'plug'; M.t = 0; M.im.setTexture('milkmaster_od');
      this.pop(W / 2, H * 0.26, 'MILK OVERDRIIIVE!', '#8aff7a'); Sound.sfx('charge'); Sound.sfx('moo'); this.cameras.main.shake(400, 0.012);
    }
    if (M.hp <= 0) this.mmDie();
  },
  mmDie() {
    const M = this.mm, W = this.scale.width, H = this.scale.height;
    M.dead = true; M.tether = false; M.st = 'die'; M.t = 0; this.cr.score += 5000;
    for (const e of this.ens) { e.hp = 0; e.quiet = true; } this.ebul.length = 0;
    this.pop(W / 2, H * 0.26, 'NOOO! MY BEAUTIFUL MILK!', '#8aff7a'); Sound.sfx('boom'); Sound.sfx('crash');
    this.spinIdx = 3; this.segT = 99;                                            // the churn winds down to a dead stop
  },
  coreSpawnDrone() {
    if (this.ens.length >= 3) return;
    const M = this.mm, kind = 'drone', im = this.add.image(M.x, M.y, kind).setScale(1.4); this.world.add(im);
    this.ens.push({ kind, x: M.x, y: M.y, ha: Math.atan2(M.y, M.x), dir: Math.random() < 0.5 ? -1 : 1, hr: 100 + Math.random() * 60, hp: 3, cd: 1.6, t: 0, flash: 0, im });
    Sound.sfx('whoosh');
  },
  milkShot(x, y, a, sp, opt) { this.ebul.push(Object.assign({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 4, milk: true, r: 7 }, opt || {})); },

  coreUpdate(dt, cp) {
    const C = this.cr, M = this.mm, RD = this.RD, W = this.scale.width, H = this.scale.height;
    C.t += dt;
    for (const p of this.pumps) p.flash = Math.max(0, p.flash - dt);
    M.flash = Math.max(0, M.flash - dt); M.t += dt;
    const live = this.intro <= 0 && C.st === 'fight' && !this.done;
    // ---- Bessie's milk drains while he's plugged in (each bust pump slows it; overdrive drains it fast)
    if (live && M.tether && !M.dead) {
      const rate = M.od ? 0.016 : 0.004 + 0.0045 * this.pumps.filter(p => p.alive).length;
      C.milk = Math.max(0, C.milk - rate * dt);
      if (C.milk <= 0) { C.dry = true; this.pop(W / 2, H * 0.4, 'BESSIE\'S BEEN MILKED DRY!', '#ff7a5a'); this.coreFinish(false); return; }
    }
    // the curd bombs burst into a ring of milk
    for (const b of this.ebul) if (b.fuse !== undefined && (b.fuse -= dt) <= 0) { b.life = 0; b.fuse = undefined; for (let k = 0; k < 7; k++) this.milkShot(b.x, b.y, k / 7 * TAU + C.t, 150); this.puff(b.x, b.y, 10, 0xffffff, 160, 0.4, 3); Sound.sfx('squelch'); }
    if (!live && C.st !== 'fight') return this.coreSnatch(dt, cp);
    if (M.dead) {                                                                 // spiralling down, popping
      M.t += 0; M.vx *= 0.97; M.vy *= 0.97; M.x += M.vx * dt; M.y += M.vy * dt; M.im.setRotation(M.im.rotation + dt * 6);
      if (Math.random() < dt * 10) { this.puff(M.x + (Math.random() - 0.5) * 50, M.y + (Math.random() - 0.5) * 50, 10, Math.random() < 0.5 ? 0xffb03a : 0xffffff, 200, 0.5, 3); Sound.sfx('scrap'); }
      if (M.t > 2.2 && M.im.visible) { M.im.setVisible(false); this.puff(M.x, M.y, 50, 0xffffff, 380, 0.9, 4); this.puff(M.x, M.y, 30, 0xffb03a, 300, 0.7, 4); Sound.sfx('crash'); this.cameras.main.shake(400, 0.016);
        C.freed = true; this.pop(W / 2, H * 0.3, 'BESSIE\'S FREE! GRAB HER!', '#ffd23f'); Sound.sfx('moo'); }
      if (C.freed && Math.hypot(cp.x, cp.y - 6) < 60) { C.st = 'snatch'; C.snatch = { t: 0 }; Sound.sfx('power'); this.pop(W / 2, H * 0.3, 'GOT YOU, GIRL!', '#ffd23f'); }
      return;
    }
    if (this.intro > 0) { M.im.setPosition(M.x, M.y); return; }
    const toC = Math.atan2(cp.y - M.y, cp.x - M.x);
    M.shield += ((M.shield > 0 && this.pumps.some(p => p.alive) ? 1 : 0) - M.shield) * Math.min(1, dt * 5);
    // ---- the AI
    if (M.st === 'orbit') {                                                       // phase 1: circling Bessie inside the bubble
      M.ang += 0.45 * M.dir * dt; if (Math.random() < dt * 0.15) M.dir *= -1;
      const tx = Math.cos(M.ang) * 118, ty = Math.sin(M.ang) * 118;
      M.x += (tx - M.x) * Math.min(1, dt * 2); M.y += (ty - M.y) * Math.min(1, dt * 2);
      if ((M.cd -= dt) <= 0) {
        M.cd = 1.5 + Math.random() * 0.6;
        if (Math.random() < 0.55) { for (const da of [-0.22, 0, 0.22]) this.milkShot(M.x, M.y, toC + da, 230); Sound.sfx('squelch'); }
        else { this.milkShot(M.x, M.y, toC, 140, { fuse: 1.0, r: 12, bomb: true }); Sound.sfx('shoot'); }
      }
    } else if (M.st === 'hover') {                                                // phase 2: drift, spray, then line up a charge
      if (!M.tx || M.t < 0.05) { const a = Math.random() * TAU, r = 60 + Math.random() * 110; M.tx = Math.cos(a) * r; M.ty = Math.sin(a) * r; }
      M.x += (M.tx - M.x) * Math.min(1, dt * 1.6); M.y += (M.ty - M.y) * Math.min(1, dt * 1.6);
      if ((M.cd -= dt) <= 0) { M.cd = 1.1; for (let k = -2; k <= 2; k++) this.milkShot(M.x, M.y, toC + k * 0.18, 240); Sound.sfx('squelch'); }
      if ((M.dropT -= dt) <= 0) { M.dropT = 9; this.coreSpawnDrone(); this.coreSpawnDrone(); }
      if (M.t > 2.6) { M.st = 'aim'; M.t = 0; M.aimA = toC; Sound.sfx('charge'); }
    } else if (M.st === 'aim') {
      M.aimA += angDiff(toC, M.aimA) * Math.min(1, dt * 4) * (M.t < 0.5 ? 1 : 0);
      M.x += (Math.random() - 0.5) * 3; M.y += (Math.random() - 0.5) * 3;
      if (M.t > 0.8) { M.st = 'charge'; M.t = 0; M.vx = Math.cos(M.aimA) * 560; M.vy = Math.sin(M.aimA) * 560; Sound.sfx('whoosh'); }
    } else if (M.st === 'charge') {
      M.x += M.vx * dt; M.y += M.vy * dt;
      if (Math.hypot(M.x, M.y) > RD - 50 || M.t > 0.9) { M.st = 'hover'; M.t = 0; M.tx = null; this.cameras.main.shake(120, 0.008); Sound.sfx('clunk'); if (Math.hypot(M.x, M.y) > RD - 50) { const r = Math.hypot(M.x, M.y); M.x *= (RD - 52) / r; M.y *= (RD - 52) / r; } }
    } else if (M.st === 'plug') {                                                 // phase 3: back to Bessie, hose in himself, swelling
      M.x += (Math.cos(M.ang) * 95 - M.x) * Math.min(1, dt * 3); M.y += (Math.sin(M.ang) * 95 - M.y) * Math.min(1, dt * 3);
      if (M.t > 1.6) { M.st = 'od'; M.t = 0; M.cd = 0.5; M.ringA = 0; }
    } else if (M.st === 'od') {                                                   // rings of milk, spinning, with a gap to jump through
      M.ang += 0.7 * M.dir * dt; const tx = Math.cos(M.ang) * 95, ty = Math.sin(M.ang) * 95;
      M.x += (tx - M.x) * Math.min(1, dt * 2.5); M.y += (ty - M.y) * Math.min(1, dt * 2.5);
      if ((M.cd -= dt) <= 0) {
        M.cd = 1.25; M.ringA = (M.ringA || 0) + 0.45; const n = 16, gap = Math.floor(Math.random() * n);
        for (let k = 0; k < n; k++) if (k !== gap && k !== (gap + 1) % n) this.milkShot(M.x, M.y, M.ringA + k / n * TAU, 170);
        Sound.sfx('squelch');
      }
      if ((M.dropT -= dt) <= 0) { M.dropT = 11; this.coreSpawnDrone(); }
    }
    // ---- touching him: feet first = a STOMP that hurts him; any other way hurts you
    if (!this.done) {
      const pr = Math.atan2(cp.y, cp.x), rx = Math.cos(pr), ry = Math.sin(pr), bcx = cp.x - rx * 28, bcy = cp.y - ry * 28;
      const dx = M.x - bcx, dy = M.y - bcy, d = Math.hypot(dx, dy), rr = (M.od ? 58 : 46) + 14;
      if (M.shield > 0.5 && d < 74 && this.penaltyT <= 0) { this.bonk('ZAPPED BY THE BUBBLE', 1); if (!this.onWall) { this.vel.x -= dx / (d || 1) * 300; this.vel.y -= dy / (d || 1) * 300; } }
      else if (d < rr) {
        const below = dx * rx + dy * ry, vOut = this.onWall ? 0 : this.vel.x * rx + this.vel.y * ry;
        if (!this.onWall && vOut > 40 && below > 6 && M.shield < 0.05) {
          this.mmHurt(10, M.x, M.y); this.pop(W / 2, H * 0.45, 'STOMP!', '#ffd23f'); Sound.sfx('bonk');
          this.vel.x -= rx * (vOut + 340); this.vel.y -= ry * (vOut + 340); this.fuel = 1; this.jetArmed = true; this.fuelFlash = 0.35;
          M.x += dx / (d || 1) * 40; M.y += dy / (d || 1) * 40; if (M.st === 'charge') { M.st = 'hover'; M.t = 0; M.tx = null; }
        } else if (this.penaltyT <= 0) {
          this.bonk(M.st === 'charge' ? 'RAMMED' : 'BUMPED', 1);
          const ux = -dx / (d || 1), uy = -dy / (d || 1);
          if (this.onWall) { const tx = -ry, ty = rx; this.run += Math.sign(ux * tx + uy * ty || 1) * 260; } else { this.vel.x += ux * 260; this.vel.y += uy * 260; }
        }
      }
    }
    M.im.setPosition(M.x, M.y + Math.sin(C.t * 4) * 3).setFlipX(cp.x < M.x).setRotation(M.st === 'charge' ? Math.sin(C.t * 30) * 0.08 : Math.sin(C.t * 2) * 0.06).setScale(M.od ? 1.3 + Math.sin(C.t * 9) * 0.03 : 1.05);
    if (M.flash > 0) M.im.setTintFill(0xffffff); else if (M.od) M.im.setTint(0xe8ffe0); else M.im.clearTint();
  },

  // ---- the snatch: the churn's roof tears open, the Royal Saucer beams Bessie up and away, the King laughing
  coreSnatch(dt, cp) {
    const S = this.cr.snatch, RD = this.RD, W = this.scale.width, H = this.scale.height; S.t += dt;
    if (!S.ship) {
      S.ship = this.add.image(0, -RD - 260, 'ratship').setScale(2.2); this.world.add(S.ship);
      this.cameras.main.shake(600, 0.02); Sound.sfx('crash'); Sound.sfx('ufoFly');
      this.time.delayedCall(300, () => this.pop(W / 2, H * 0.2, 'NOT SO FAST, CHEF!', '#ffd23f'));
      this.time.delayedCall(1800, () => this.pop(W / 2, H * 0.2, 'MWAHAHA! THE COW IS MINE!', '#ffd23f'));
      this.time.delayedCall(3200, () => this.pop(W / 2, H * 0.24, 'TO PARMESAN PRIME!', '#ffb07a'));
    }
    const k = Math.min(1, S.t / 1.2);
    S.ship.setPosition(Math.sin(S.t * 1.3) * 10, -RD - 260 + 170 * k).setRotation(Math.sin(S.t * 2) * 0.06);
    if (S.t > 1.3) { const u = Math.min(1, (S.t - 1.3) / 2.2); this.cow.setPosition(0, 6 - (RD + 60) * u * u).setRotation(Math.sin(S.t * 6) * 0.3 * u).setScale(1.6 * (1 - 0.5 * u)); if (Math.random() < dt * 6) Sound.sfx('moo'); }
    if (S.t > 3.6) S.ship.y -= (S.t - 3.6) * 600 * dt * 3, this.cow.y = S.ship.y + 40;
    // Chris is pushed back off her by the beam
    if (!this.onWall) { const r = Math.hypot(cp.x, cp.y) || 1; this.vel.x += cp.x / r * 300 * dt; this.vel.y += cp.y / r * 300 * dt; }
    if (S.t > 5 && !S.done) { S.done = true; this.coreFinish(true); }
  },

  coreDraw(dt, cp) {
    const C = this.cr, M = this.mm, RD = this.RD, t = this.t, W = this.scale.width, H = this.scale.height;
    // ---- the pumps' feed pipes, along the back plate to the hub (they turn with the drum); bust ones spurt milk
    const pg = this.pumpG; pg.clear();
    for (const p of this.pumps) {
      const ca = Math.cos(p.a), sa = Math.sin(p.a), r0 = 40, r1 = RD - 48;
      pg.lineStyle(9, 0x1a1020, 1).lineBetween(ca * r0, sa * r0, ca * r1, sa * r1);
      pg.lineStyle(5, p.alive ? 0xd8e4f4 : 0x5a6272, 1).lineBetween(ca * r0, sa * r0, ca * r1, sa * r1);
      if (p.alive) { const u = (t * 0.8 + p.a) % 1; for (let k = 0; k < 4; k++) { const f = ((u + k / 4) % 1), r = r1 - (r1 - r0) * f; pg.fillStyle(0xffffff, 1).fillCircle(ca * r, sa * r, 3); } }   // milk flowing in to the hub
      else if (Math.random() < 0.7) { const q = { x: ca * (RD - 40), y: sa * (RD - 40) }; this.fx.push({ x: q.x * Math.cos(this.D) - q.y * Math.sin(this.D), y: q.x * Math.sin(this.D) + q.y * Math.cos(this.D), vx: (Math.random() - 0.5) * 120, vy: (Math.random() - 0.5) * 120, life: 0.5, max: 0.5, col: 0xffffff }); }
      if (p.im) { if (p.flash > 0) p.im.setTintFill(0xffffff); else p.im.clearTint(); }
      if (p.alive) { const lamp = Math.floor(t * 4 + p.a) % 2; pg.fillStyle(0xff3a1a, lamp ? 0.5 : 0.15).fillCircle(ca * (RD - 58), sa * (RD - 58), 9); }
    }
    // ---- the milking machine round Bessie: a steel cradle, straps, the clamps on her udders, the hose to the doctor
    const g = this.mmBackG; g.clear();
    if (!C.snatch) {
      g.lineStyle(10, 0x1a1020, 1).strokeCircle(0, 6, 56); g.lineStyle(6, 0x8a929e, 1).strokeCircle(0, 6, 56);
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; g.lineStyle(6, 0x1a1020, 1).lineBetween(Math.cos(a) * 56, 6 + Math.sin(a) * 56, Math.cos(a) * 22, 6 + Math.sin(a) * 22); g.lineStyle(3, 0xb8842a, 1).lineBetween(Math.cos(a) * 56, 6 + Math.sin(a) * 56, Math.cos(a) * 22, 6 + Math.sin(a) * 22); }
    }
    const mg = this.mmG; mg.clear();
    const ud = { x: this.cow.x + 2, y: this.cow.y + 22 * (this.cow.scaleY / 1.35) };
    if (!C.freed) { for (const o of [-8, 8]) { mg.fillStyle(0x1a1020, 1).fillRect(ud.x + o - 4, ud.y - 2, 8, 9); mg.fillStyle(0x8a929e, 1).fillRect(ud.x + o - 3, ud.y - 1, 6, 7); } }
    if (M.tether && !M.dead) {                                                    // the hose, sagging and pulsing with milk
      const hx = M.x + (M.im.flipX ? 12 : -12) * (M.od ? 1.3 : 1), hy = M.y + 30, mx = (ud.x + hx) / 2 + Math.sin(t * 2) * 20, my = (ud.y + hy) / 2 + 40;
      const pts = []; for (let k = 0; k <= 16; k++) { const u = k / 16, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u; pts.push({ x: a * ud.x + b * mx + c * hx, y: a * (ud.y + 6) + b * my + c * hy }); }
      mg.lineStyle(9, 0x1a1020, 1).strokePoints(pts); mg.lineStyle(5, 0xe0302a, 1).strokePoints(pts);
      for (let k = 0; k < 3; k++) { const i = Math.floor(((t * 1.6 + k / 3) % 1) * 16); mg.fillStyle(0xffffff, 1).fillCircle(pts[i].x, pts[i].y, 3.5); }
    }
    // ---- his bubble shield, milk blobs, the charge sight-line, the snatch beam
    const tg = this.mmTopG; tg.clear();
    if (M.shield > 0.05 && !M.dead) { tg.lineStyle(3, 0x8aff7a, 0.5 * M.shield + 0.2 * Math.sin(t * 9)).strokeCircle(M.x, M.y, 66); tg.fillStyle(0x8aff7a, 0.08 * M.shield).fillCircle(M.x, M.y, 66); tg.lineStyle(2, 0xffffff, 0.35 * M.shield).beginPath(); tg.arc(M.x, M.y, 60, 3.6, 4.6); tg.strokePath(); }
    if (M.st === 'aim') { const L = 600, fl = Math.floor(t * 16) % 2; tg.lineStyle(fl ? 4 : 2, 0xff2a1a, 0.7).lineBetween(M.x, M.y, M.x + Math.cos(M.aimA) * L, M.y + Math.sin(M.aimA) * L); }
    if (M.od && !M.dead) tg.fillStyle(0x8aff7a, 0.12 + 0.06 * Math.sin(t * 9)).fillCircle(M.x, M.y, 70);
    for (const b of this.ebul) if (b.milk) { const r = b.r || 7; this.fxG.fillStyle(0x1a1020, 1).fillCircle(b.x, b.y, r + 2); this.fxG.fillStyle(0xffffff, 1).fillCircle(b.x, b.y, r); this.fxG.fillStyle(0xd8e4f4, 1).fillCircle(b.x + r * 0.3, b.y + r * 0.3, r * 0.5); if (b.bomb && Math.floor(t * 10) % 2) this.fxG.fillStyle(0xffd23f, 1).fillCircle(b.x, b.y, 3); }
    if (C.snatch && C.snatch.ship && C.snatch.t > 1.1 && C.snatch.t < 4.2) {
      const s = C.snatch.ship, a = 0.25 + 0.1 * Math.sin(t * 20);
      tg.fillStyle(0xffd23f, a).fillTriangle(s.x, s.y + 30, this.cow.x - 60, this.cow.y + 40, this.cow.x + 60, this.cow.y + 40);
      tg.fillStyle(0xffffff, a * 0.6).fillTriangle(s.x, s.y + 30, this.cow.x - 26, this.cow.y + 40, this.cow.x + 26, this.cow.y + 40);
    }
    if (C.snatch && C.snatch.t > 0) {                                             // the torn roof of the churn
      const hg = this.mmTopG; for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.12; hg.fillStyle(0x020208, 1).fillTriangle(Math.cos(a - 0.08) * (RD + 40), Math.sin(a - 0.08) * (RD + 40), Math.cos(a + 0.08) * (RD + 40), Math.sin(a + 0.08) * (RD + 40), Math.cos(a) * (RD - 30 - (k % 2) * 30), Math.sin(a) * (RD - 30 - (k % 2) * 30)); }
    }
    this.cow.setFlipX(cp.x < this.cow.x);
    // ---- HUD: his health bar, and Bessie's milk
    const hg = this.coreHud; hg.clear();
    const bw = Math.min(300, W * 0.4), bx = W / 2 - bw / 2;
    const by = H - 22; hg.fillStyle(0x1a1020, 1).fillRect(bx - 2, by - 2, bw + 4, 12); hg.fillStyle(0x3a2a30, 1).fillRect(bx, by, bw, 8);
    hg.fillStyle(M.shield > 0.05 ? 0x8aff7a : M.od ? 0xff5a3a : 0xffd23f, 1).fillRect(bx, by, bw * Math.max(0, M.hp) / MM_HP, 8);
    if (M.shield > 0.05) for (let k = 0; k < bw; k += 8) hg.fillStyle(0xffffff, 0.3).fillRect(bx + k, by, 3, 8);
    const mw = 130, mx = W / 2 - mw / 2, my = 88, low = C.milk < 0.3 && Math.floor(t * 6) % 2;
    hg.fillStyle(0x1a1020, 1).fillRect(mx - 2, my - 2, mw + 4, 10); hg.fillStyle(0x2a3040, 1).fillRect(mx, my, mw, 6);
    hg.fillStyle(low ? 0xff5a3a : 0xffffff, 1).fillRect(mx, my, mw * C.milk, 6);
    this.milkLbl.setPosition(W / 2, my - 11);
  },

  coreFinish(won) {
    if (this.done) return; this.done = true; this.doneT = this.t;
    this.jetting = false; Sound.jet(false);
    const lvl = this.scene.get('level1'), score = this.cr.score;
    const back = () => {
      this.cameras.main.fadeOut(500, won ? 255 : 0, won ? 255 : 0, won ? 255 : 0);
      this.time.delayedCall(560, () => { this.scene.stop(); this.scene.wake('level1'); if (lvl && lvl.labCoreDone) lvl.labCoreDone(won, score, this.cr.dry); });
    };
    if (won) { Sound.music('win'); this.time.delayedCall(400, back); }
    else { Sound.music('lose'); this.pop(this.scale.width / 2, this.scale.height * 0.5, this.cr.dry ? 'BESSIE\'S BEEN MILKED DRY!' : 'KNOCKED OUT!', '#ff7a5a'); this.time.delayedCall(1600, back); }
  },
};
Object.assign(CentrifugeScene.prototype, CoreMixin);
