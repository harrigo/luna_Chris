// BONUS: the CENTRIFUGE FERMENTER. Chris is inside a huge spinning steel drum where the curds are separated. There's
// no gravity in here: the spin pins him to the inside of the wall, and "down" is always outwards, so the floor curves
// up all round him and the far side of the drum hangs upside down overhead.
//
// The fun is the real physics: in the air he flies in a STRAIGHT LINE (nothing pulls him) while the drum turns under
// him, so a jump lands further round than you'd think. Running WITH the spin makes you "heavier" and throws you
// forward; running AGAINST it cancels the spin out, so a jump goes straight across. The spin also rises and falls:
// when it slows, jumps sail right across the middle, which is the only way to reach the ingredients floating near the
// axle. HATCHES in the wall open now and then onto space: the air roars out and drags you towards them (get sucked
// out and you're thrown back in, 3 s down), and rats fly in through them on rocket packs and take pot-shots. Shoot
// them with the Mac-Grinder, or land on them feet first (touching them any other way hurts). Gaps tear open at random places and sizes (bigger = more robots, harder pull). SURVIVE
// 60 SECONDS and collect the ingredient in every porthole (14): then the prize gun pops out in the very middle of the drum, and you
// have to jump (or jetpack) right through the middle to grab it. 6 hits of armour; ingredients patch you up.
//
// Controls are the main game's: left/right run (his own left/right, like on a planet), jump (Space/Up/W, controller A;
// hold it in the air for the jetpack, which pushes you in towards the middle), fire (Z/X/J or the mouse, which aims;
// controller X/RT, right stick aims). Touch: the main game's twin sticks (left: run, tap/push up to jump, hold up to
// fly; right: drag to aim, touching fires; with no aim it picks the nearest rat).
// ---- the spin programme: fast, slow-downs, dead stops (gravity takes over: off the top you fall) and reverses.
// w = target spin (rad/s, + is clockwise on screen), t = how long it holds, msg = the shout when it starts
const CF_SPIN = [
  { w: 1.35, t: 7 },
  { w: 0.5, t: 4, msg: 'SLOWING DOWN: JUMP ACROSS!', col: '#9fd8ff' },
  { w: 1.35, t: 5, msg: 'SPIN UP!', col: '#ffb07a' },
  { w: 0, t: 3.5, msg: 'STOPPING... MIND THE DROP!', col: '#ff7a5a' },
  { w: -1.35, t: 7, msg: 'REVERSE SPIN!', col: '#ffd23f' },
  { w: -0.5, t: 4, msg: 'SLOWING DOWN: JUMP ACROSS!', col: '#9fd8ff' },
  { w: -1.35, t: 4, msg: 'SPIN UP!', col: '#ffb07a' },
  { w: 1.35, t: 6, msg: 'SLAM INTO REVERSE!', col: '#ffd23f' },
  { w: 0, t: 3.5, msg: 'STOPPING... MIND THE DROP!', col: '#ff7a5a' },
];
// ---- canvas-drawn cogs (smooth-filtered so they turn cleanly). Tooth 0 points along +x, so a cog's rotation is the
// angle of one of its teeth: that's what the meshing maths in update() relies on. Spoke holes are cut right through.
const CF_PAL = {
  brass: { body: '#b8893a', shade: '#6e4e1c', hi: '#f0d080', dark: '#2a1a08' },
  steel: { body: '#8a929e', shade: '#4a5260', hi: '#dfe6ef', dark: '#1a1e26' },
  far:   { body: '#1d2230', shade: '#161a24', hi: '#28303f', dark: '#0c0e13' },
};
function cfCog(scene, key, r, n, pal, S) {
  if (scene.textures.exists(key)) return key;
  S = S || 1.5;
  const ad = 8, size = Math.ceil((r + ad + 3) * 2 * S), c = size / 2, ct = scene.textures.createCanvas(key, size, size), x = ct.getContext(), st = Math.PI * 2 / n;
  x.save(); x.translate(c, c); x.scale(S, S);
  x.beginPath();
  for (let k = 0; k < n; k++) { const a = k * st; for (const [rr, da] of [[r - ad, -0.3], [r + ad, -0.16], [r + ad, 0.16], [r - ad, 0.3]]) x.lineTo(Math.cos(a + da * st) * rr, Math.sin(a + da * st) * rr); }
  x.closePath(); x.fillStyle = pal.body; x.fill(); x.lineWidth = 2; x.strokeStyle = pal.dark; x.stroke();
  const rw = r - ad - 5, rh = Math.max(10, r * 0.22);
  x.beginPath(); x.arc(0, 0, rw, 0, 7); x.fillStyle = pal.shade; x.fill();
  x.beginPath(); x.arc(0, 0, r - ad - 1, Math.PI * 1.05, Math.PI * 1.55); x.strokeStyle = pal.hi; x.lineWidth = 3; x.stroke();
  if (r > 70) {                                                   // lightening holes between the spokes
    const ns = r > 150 ? 6 : 5, hc = (rw + rh) / 2, hr = (rw - rh) * 0.36;
    x.globalCompositeOperation = 'destination-out';
    for (let k = 0; k < ns; k++) { const a = k / ns * Math.PI * 2 + st / 2; x.beginPath(); x.arc(Math.cos(a) * hc, Math.sin(a) * hc, hr, 0, 7); x.fill(); }
    x.globalCompositeOperation = 'source-over';
    for (let k = 0; k < ns; k++) { const a = k / ns * Math.PI * 2 + st / 2; x.beginPath(); x.arc(Math.cos(a) * hc, Math.sin(a) * hc, hr, 0, 7); x.strokeStyle = pal.dark; x.lineWidth = 3; x.stroke(); }
  }
  x.beginPath(); x.arc(0, 0, rh, 0, 7); x.fillStyle = pal.body; x.fill(); x.strokeStyle = pal.dark; x.lineWidth = 2; x.stroke();
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; x.beginPath(); x.arc(Math.cos(a) * rh * 0.66, Math.sin(a) * rh * 0.66, Math.max(1.5, rh * 0.09), 0, 7); x.fillStyle = pal.dark; x.fill(); }
  x.beginPath(); x.arc(0, 0, rh * 0.32, 0, 7); x.fillStyle = pal.dark; x.fill();
  x.fillStyle = pal.hi; x.fillRect(rh * 0.32, -1.5, rh * 0.3, 3);  // a key mark, so you can see it turn
  x.restore(); ct.refresh(); ct.setFilter(Phaser.Textures.FilterMode.LINEAR);
  return key;
}
// the drum's back plate, with glass portholes: they let the brass cogs behind show through, dimmed
function cfBackPlate(scene, RD, holes) {
  const key = 'cf_back'; if (scene.textures.exists(key)) return key;
  const S = 1.5, R = RD + 40, size = Math.ceil(R * 2 * S) + 4, c = size / 2, ct = scene.textures.createCanvas(key, size, size), x = ct.getContext();
  x.save(); x.translate(c, c); x.scale(S, S);
  x.fillStyle = '#1a120a'; x.beginPath(); x.arc(0, 0, R, 0, 7); x.fill();
  for (let i = 7; i > 0; i--) { x.fillStyle = `rgb(${30 + i * 6},${22 + i * 4},${14 + i * 2})`; x.beginPath(); x.arc(0, 0, RD * i / 7, 0, 7); x.fill(); }
  for (let i = 0; i < 40; i++) { const a = Math.random() * 6.3, r = 40 + Math.random() * (RD - 70); x.fillStyle = 'rgba(0,0,0,0.18)'; x.beginPath(); x.arc(Math.cos(a) * r, Math.sin(a) * r, 8 + Math.random() * 16, 0, 7); x.fill(); }
  x.globalCompositeOperation = 'destination-out';
  for (const h of holes) { x.fillStyle = 'rgba(0,0,0,0.6)'; x.beginPath(); x.arc(h.x, h.y, h.r, 0, 7); x.fill(); }
  x.globalCompositeOperation = 'source-over';
  for (const h of holes) {
    x.lineWidth = 8; x.strokeStyle = '#22262e'; x.beginPath(); x.arc(h.x, h.y, h.r + 3, 0, 7); x.stroke();
    x.lineWidth = 3; x.strokeStyle = '#8a929e'; x.beginPath(); x.arc(h.x, h.y, h.r + 3, 0, 7); x.stroke();
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; x.fillStyle = '#c8d0dc'; x.fillRect(h.x + Math.cos(a) * (h.r + 3) - 1.5, h.y + Math.sin(a) * (h.r + 3) - 1.5, 3, 3); }
    x.lineWidth = 3; x.strokeStyle = 'rgba(255,255,255,0.14)'; x.beginPath(); x.arc(h.x, h.y, h.r - 7, 3.7, 4.5); x.stroke();
  }
  x.restore(); ct.refresh(); ct.setFilter(Phaser.Textures.FilterMode.LINEAR);
  return key;
}
function cfVignette(scene) {
  const key = 'cf_vig'; if (scene.textures.exists(key)) return key;
  const ct = scene.textures.createCanvas(key, 256, 256), x = ct.getContext(), gr = x.createRadialGradient(128, 128, 60, 128, 128, 182);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.6)'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  ct.refresh(); ct.setFilter(Phaser.Textures.FilterMode.LINEAR); return key;
}

class CentrifugeScene extends Phaser.Scene {
  constructor() { super('centrifuge'); }

  create() {
    buildAllTextures(this);
    const RD = this.RD = 250, rnd = (a, b) => a + Math.random() * (b - a);
    this.cameras.main.setBackgroundColor('#0a0806').fadeIn(300, 0, 0, 0);
    Sound.init(); Sound.music('level7');
    this.leaving = false; this.done = false; this.axHeld = false; this.axFlip = 0; this.t = 0; this.timeLeft = 60; this.hp = this.hpMax = 6; this.survived = false; this.got = 0; this.penaltyT = 0; this.touchG = null; this.touchLbl = null; this.plateTxt = null; this.gaugeTxt = null;
    this.intro = 3.0; this.count = -1;
    // the drum: its angle D and spin w (radians/s), easing between fast and slow
    this.D = 0; this.w = 1.3; this.spinIdx = 0; this.segT = CF_SPIN[0].t; this.slide = 0;
    // Chris: on the wall (a = his angle IN THE DRUM, run = his running speed along it) or flying (pos/vel, inertial)
    this.onWall = true; this.a = Math.PI / 2; this.run = 0; this.pos = { x: 0, y: 0 }; this.vel = { x: 0, y: 0 };
    this.P = { h: 0, floor: 0, vh: 0, vx: 0, thrusting: false, firing: 0, aimA: 0, power: 0, duck: false, facing: 1 };
    this.fx = [];

    // ---- the factory round it (screen space, behind the drum): steel wall panels, pipes feeding the drum, a big SPIN
    // gauge on the left and a maker's plate on the right
    this.backG = this.add.graphics().setDepth(0); this.gaugeG = this.add.graphics().setDepth(0.5);
    // far cogs in the gloom on the back wall, light beams sweeping across it, steam and dust: all moving
    this.farCogs = [[0.02, 0.18, 0.5, 0.35], [0.98, 0.92, 0.62, -0.28], [0.5, 1.15, 0.42, 0.5], [0.97, 0.05, 0.3, 0.6]].map(([fx, fy, fr, sp]) =>
      ({ fx, fy, fr, sp, im: this.add.image(0, 0, cfCog(this, 'cf_cogfar', 200, 40, CF_PAL.far, 1)).setDepth(0.1) }));
    this.beamG = this.add.graphics().setDepth(0.2).setBlendMode(Phaser.BlendModes.ADD);
    this.steamG = this.add.graphics().setDepth(0.3);
    this.steam = []; this.steamT = 1; this.dust = Array.from({ length: 36 }, () => ({ x: Math.random(), y: Math.random(), v: 0.004 + Math.random() * 0.01, ph: Math.random() * 6 }));
    this.vig = this.add.image(0, 0, cfVignette(this)).setDepth(19).setOrigin(0);
    // ---- the world: everything inertial lives in this container, which is rotated/moved to make the camera
    this.world = this.add.container(0, 0).setDepth(1);
    this.drum = this.add.container(0, 0);                       // the drum and everything fixed to it, turned by D
    // ---- THE DRIVE: a pinion each side meshes with the ring of teeth round the drum; on the same axle, behind the drum,
    // a big brass cog (you see it through the portholes in the drum's back plate). An electric motor drives the left one.
    const ringR = this.ringR = 300, ringN = this.ringN = 72;          // tooth pitch 2π·300/72: every cog here shares it
    this.drive = [{ u: Math.PI + 0.44, bigR: 200, bigN: 48, motor: true }, { u: 0.44, bigR: 175, bigN: 42 }].map(d => {
      const cx = Math.cos(d.u) * (ringR + 50), cy = Math.sin(d.u) * (ringR + 50);
      d.cx = cx; d.cy = cy;
      d.big = this.add.image(cx, cy, cfCog(this, 'cf_big' + d.bigR, d.bigR, d.bigN, CF_PAL.brass)).setScale(1 / 1.5);
      this.world.add(d.big);
      if (d.motor) {                                                  // the motor's pinion, meshing the big cog, out to the left
        d.um = Math.PI - 0.32; d.mx = cx + Math.cos(d.um) * (d.bigR + 50); d.my = cy + Math.sin(d.um) * (d.bigR + 50);
        d.motorG = this.add.graphics(); this.world.add(d.motorG);
        d.mot = this.add.image(d.mx, d.my, cfCog(this, 'cf_pin50', 50, 12, CF_PAL.steel)).setScale(1 / 1.5); this.world.add(d.mot);
      }
      return d;
    });
    this.HOLES = Array.from({ length: 8 }, (_, k) => { const a = k / 8 * Math.PI * 2 + Math.PI / 8; return { x: Math.cos(a) * 184, y: Math.sin(a) * 184, r: 36 }; })
      .concat(Array.from({ length: 6 }, (_, k) => { const a = k / 6 * Math.PI * 2; return { x: Math.cos(a) * 96, y: Math.sin(a) * 96, r: 19 }; }));
    // a sun cog behind the middle of the drum (on its own bearing), turned by the left big cog: seen through the small holes
    this.sun = this.add.image(0, 0, cfCog(this, 'cf_sun150', 150, 36, CF_PAL.brass)).setScale(1 / 1.5);
    this.world.addAt(this.sun, 0);
    this.world.add(this.drum);
    this.buildDrum();
    for (const d of this.drive) { d.pin = this.add.image(d.cx, d.cy, cfCog(this, 'cf_pin50', 50, 12, CF_PAL.steel)).setScale(1 / 1.5); this.world.add(d.pin); }
    this.sheenG = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD); this.world.add(this.sheenG);   // light on the steel, spin streaks
    // gaps that tear open in the wall (fixed in the drum) at random places and sizes: see openGap()
    this.hatches = []; this.gapT = 2.5;
    this.padG = this.add.graphics(); this.drum.add(this.padG);
    this.ens = []; this.ebul = []; this.shots = []; this.fuel = 1; this.fireCd = 0; this.out = null;
    // ingredients, fixed in the drum: most near the wall-ish, a few floating near the axle (slow spin needed)
    const kinds = ['wedge', 'goldwheel', 'meatball', 'ix_pancake', 'pepper', 'chili'], glow = [0xffd23f, 0xffc23a, 0xff8a5a, 0xffb36a, 0x7dff8a, 0xff4a3a];
    this.items = [];
    for (let i = 0; i < this.HOLES.length; i++) {                   // one in the middle of every porthole in the drum
      const H0 = this.HOLES[i], x = H0.x, y = H0.y, ang = Math.atan2(y, x), r = Math.hypot(x, y), k = i % kinds.length;
      const im = this.add.image(x, y, kinds[k]).setScale(k === 3 ? 2.3 : 1.5);
      this.drum.add(im);
      this.items.push({ x, y, ang, r, im, got: false, col: glow[k], ph: rnd(0, 6) });
    }
    this.glowG = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD); this.drum.add(this.glowG);
    // the prize waits at the hub
    this.prize = ZeroGScene.prototype.pickPrize.call(this);
    // Chris
    this.rig = new ChrisRig(this); this.rig.setWeapon(WEAPONS[0]);
    this.world.add(this.rig.root);
    this.fxG = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD); this.world.add(this.fxG);
    this.camPhi = this.a + this.D; this.camK = 0.62;

    // ---- HUD
    const f = (s, c) => ({ fontFamily: PIXEL, fontSize: s + 'px', color: c, stroke: '#1a1020', strokeThickness: 4 });
    this.f = f;
    this.timeTxt = this.add.text(0, 0, '', f(16, '#ffd23f')).setOrigin(0.5, 0).setDepth(20);
    this.gotTxt = this.add.text(0, 0, '', f(9, '#ffffff')).setOrigin(0.5, 0).setDepth(20);
    this.spinTxt = this.add.text(0, 0, '', f(9, '#9fd8ff')).setOrigin(1, 0).setDepth(20);
    this.hudG = this.add.graphics().setDepth(20);
    this.msg = this.add.text(0, 0, 'CENTRIFUGE FERMENTER\nSURVIVE 60 SECONDS AND GRAB EVERY INGREDIENT\nKEEP AWAY FROM THE GAPS, SHOOT THE DRONES\nTHEN THE PRIZE APPEARS IN THE MIDDLE: JUMP FOR IT', Object.assign(f(10, '#ffcf9a'), { align: 'center', lineSpacing: 8 })).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: this.msg, alpha: 0, delay: 2600, duration: 500 });
    this.countTxt = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '40px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 8 }).setOrigin(0.5).setDepth(21);
    this.exitBtn = this.add.text(0, 0, '< MAP', Object.assign(f(10, '#ffffff'), { backgroundColor: '#2a1d10', padding: { x: 8, y: 7 } })).setDepth(25).setInteractive({ useHandCursor: true });
    this.exitBtn.on('pointerdown', () => this.leave());
    this.layout(); this.scale.on('resize', this.layout, this); this.events.once('shutdown', () => this.scale.off('resize', this.layout, this));
    this.isTouch = (navigator.maxTouchPoints || 0) > 0 || ('ontouchstart' in window);
    this.tapJumpT = 0; this.stickUp = false;
    this.input.on('pointerdown', p => { if (p.wasTouch) this.isTouch = true; });
    this.input.on('pointerup', p => {                                   // a quick tap on the MOVE side = jump, like the main game
      if (p.wasTouch && !this.done && p.downX < this.scale.width * 0.45 && p.downY >= this.scale.height * 0.2 && p.upTime - p.downTime < 230 && Math.hypot(p.upX - p.downX, p.upY - p.downY) < 16) this.tapJumpT = 0.2;
    });

    this.keys = this.input.keyboard ? this.input.keyboard.addKeys({ left: 'LEFT', right: 'RIGHT', up: 'UP', a: 'A', d: 'D', w: 'W', z: 'Z', x: 'X', j: 'J', space: 'SPACE' }) : null;
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

  // ---- the drum: a riveted stainless steel shell with portholes, a film of whey pinned to the wall, curd lumps, the hub
  buildDrum() {
    const RD = this.RD, g = this.add.graphics(), rnd = (a, b) => a + Math.random() * (b - a);
    this.drum.add(this.add.image(0, 0, cfBackPlate(this, RD, this.HOLES)).setScale(1 / 1.5));
    // the ring gear round the outside of the shell, that the pinions drive
    const n = this.ringN, st = Math.PI * 2 / n, R0 = this.ringR;
    for (let k = 0; k < n; k++) {
      const a = k * st, q = [[R0 - 8, -0.3], [R0 + 8, -0.16], [R0 + 8, 0.16], [R0 - 8, 0.3]].map(([rr, da]) => ({ x: Math.cos(a + da * st) * rr, y: Math.sin(a + da * st) * rr }));
      g.fillStyle(0x8a929e, 1).fillPoints(q, true); g.lineStyle(1.5, 0x1a1e26, 1).strokePoints(q, true);
    }
    g.lineStyle(14, 0x2a2e38, 1).strokeCircle(0, 0, RD + 40); g.lineStyle(2, 0x6a7080, 1).strokeCircle(0, 0, RD + 46);
    // the wall: steel shell, rivets, portholes with light coming through
    g.lineStyle(34, 0x6a7080, 1).strokeCircle(0, 0, RD + 17); g.lineStyle(6, 0xc8d0dc, 1).strokeCircle(0, 0, RD + 3); g.lineStyle(4, 0x2a2e38, 1).strokeCircle(0, 0, RD + 34);
    for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2; g.fillStyle(0x3a3e48, 1).fillCircle(Math.cos(a) * (RD + 20), Math.sin(a) * (RD + 20), 3); }
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * Math.PI * 2 + 0.3, x = Math.cos(a) * (RD + 18), y = Math.sin(a) * (RD + 18);
      g.fillStyle(0x2a2e38, 1).fillCircle(x, y, 13); g.fillStyle(0x9fd8ff, 1).fillCircle(x, y, 9); g.fillStyle(0xffffff, 0.8).fillCircle(x - 3, y - 3, 3);
    }
    // warning stripes round the inside of the wall, so you can see it whizz round
    for (let k = 0; k < 16; k++) { const a0 = k / 16 * Math.PI * 2, a1 = a0 + 0.12; g.fillStyle(k % 2 ? 0xffd23f : 0x1a1012, 1).fillPoints([{ x: Math.cos(a0) * (RD - 2), y: Math.sin(a0) * (RD - 2) }, { x: Math.cos(a1) * (RD - 2), y: Math.sin(a1) * (RD - 2) }, { x: Math.cos(a1) * (RD + 6), y: Math.sin(a1) * (RD + 6) }, { x: Math.cos(a0) * (RD + 6), y: Math.sin(a0) * (RD + 6) }], true); }
    // whey film along the wall, and lumps of curd stuck in it
    g.lineStyle(10, 0xf0ecd0, 0.45).strokeCircle(0, 0, RD - 4);
    for (let k = 0; k < 26; k++) { const a = rnd(0, 6.3), r = RD - rnd(4, 10); g.fillStyle(0xfff6d8, 1).fillCircle(Math.cos(a) * r, Math.sin(a) * r, rnd(4, 9)); g.fillStyle(0xd8ccaa, 1).fillCircle(Math.cos(a) * r + 2, Math.sin(a) * r + 2, 3); }
    // the hub: the axle, with the prize hanging off it
    g.fillStyle(0x3a3e48, 1).fillCircle(0, 0, 22); g.fillStyle(0xa8b0c0, 1).fillCircle(0, 0, 14); g.fillStyle(0x2a2e38, 1).fillCircle(0, 0, 5);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; g.fillStyle(0xa8b0c0, 1).fillRect(Math.cos(a) * 18 - 3, Math.sin(a) * 18 - 3, 6, 6); }
    this.drum.add(g);
  }

  drawFactory() {                                                 // the static back wall (the moving bits are in drawBack)
    const W = this.scale.width, H = this.scale.height, g = this.backG; g.clear();
    for (let i = 0; i < 16; i++) g.fillStyle(Phaser.Display.Color.GetColor(14 + i, 16 + i, 22 + i * 1.4), 1).fillRect(0, H * i / 16, W, H / 16 + 1);
    for (let x = 0; x < W; x += 96) { g.fillStyle(0x0a0c10, 0.5).fillRect(x, 0, 2, H); for (let y = 30; y < H; y += 80) g.fillStyle(0x2a303c, 1).fillCircle(x + 8, y, 1.5).fillCircle(x + 88, y, 1.5); }
    const sc = this.wsc(), cx = W / 2, cy = H * 0.53;
    for (const d of this.drive) g.fillStyle(0x000000, 0.35).fillCircle(cx + d.cx * sc + 10, cy + d.cy * sc + 12, (d.bigR + 8) * sc);    // cogs' shadows on the wall
    g.fillStyle(0x000000, 0.55).fillCircle(cx + 10, cy + 12, (this.RD + 48) * sc);                         // the drum's
    for (const f of this.farCogs) f.im.setPosition(W * f.fx, H * f.fy).setScale(H * f.fr / 208);
    this.vig.setDisplaySize(W, H);
  }
  wsc() { return this.scale.height * 0.47 / (this.RD + 60); }
  drawBack(dt) {                                                  // sweeping warning beams, steam vents, dust in the light
    const W = this.scale.width, H = this.scale.height, bg = this.beamG, open = this.hatches.some(h => h.st === 'open'), warn = this.hatches.some(h => h.st === 'warn');
    for (const f of this.farCogs) f.im.setRotation(this.D * f.sp);
    bg.clear();
    const col = open ? 0xff3a2a : warn ? 0xffb03a : 0xffd23f, al = open ? 0.11 : 0.05, spd = open ? 3 : 1.1;
    for (const [ox, dir] of [[-0.02, 1], [1.02, -1]]) {
      const a = Math.PI / 2 + dir * (0.55 + Math.sin(this.t * spd + (dir > 0 ? 0 : 2)) * 0.5), L = Math.hypot(W, H) * 1.2, wd = 0.13;
      const x0 = W * ox, y0 = -H * 0.05;
      for (const [k, m] of [[1, 1], [0.55, 0.6]]) bg.fillStyle(col, al * m).fillTriangle(x0, y0, x0 + Math.cos(a - wd * k) * L, y0 + Math.sin(a - wd * k) * L, x0 + Math.cos(a + wd * k) * L, y0 + Math.sin(a + wd * k) * L);
    }
    bg.fillStyle(0x9fb8ff, 0.035 + 0.02 * Math.sin(this.t * 1.3)).fillCircle(W / 2, H * 0.53, H * 0.62);     // a cold glow off the drum
    for (const p of this.dust) {
      p.y -= p.v * dt; p.x += Math.sin(this.t * 0.6 + p.ph) * 0.004 * dt; if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
      bg.fillStyle(0xfff0c8, 0.25 + 0.2 * Math.sin(this.t * 2 + p.ph)).fillRect(p.x * W, p.y * H, 2, 2);
    }
    // steam: the vents in the bottom corners blow off now and then (more when it's spinning hard)
    this.steamT -= dt;
    if (this.steamT <= 0) { this.steamT = 1.4 + Math.random() * 2.2 - (Math.abs(this.w) - 0.5) * 0.8; const sx = Math.random() < 0.5 ? W * 0.05 : W * 0.95; for (let i = 0; i < 9; i++) this.steam.push({ x: sx + (Math.random() - 0.5) * 16, y: H + 6, vx: (Math.random() - 0.5) * 30, vy: -60 - Math.random() * 70, r: 6 + Math.random() * 6, life: 1.6 + Math.random() * 0.8, max: 2.4 }); Sound.sfx('hiss'); }
    const sg = this.steamG; sg.clear();
    for (let i = this.steam.length - 1; i >= 0; i--) { const q = this.steam[i]; q.life -= dt; if (q.life <= 0) { this.steam.splice(i, 1); continue; } q.x += q.vx * dt; q.y += q.vy * dt; q.vy *= 1 - dt * 0.6; q.r += dt * 18; sg.fillStyle(0xdfe6ef, 0.16 * q.life / q.max).fillCircle(q.x, q.y, q.r); }
  }
  drawGauge() {                                                   // the SPIN gauge: a needle over a green / red dial
    const W = this.scale.width, H = this.scale.height, g = this.gaugeG, r = Math.max(28, Math.min(46, H * 0.1)), x = W - 16 - r, y = 34 + r; g.clear();
    g.fillStyle(0x0a0c10, 1).fillCircle(x, y, r + 6); g.fillStyle(0xd8dce4, 1).fillCircle(x, y, r + 2); g.fillStyle(0xf4f2ea, 1).fillCircle(x, y, r - 2);
    const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2;
    for (let k = 0; k <= 10; k++) { const a = a0 + (a1 - a0) * k / 10, m = Math.abs(k - 5); g.lineStyle(3, m < 2 ? 0x3aa040 : m < 4 ? 0xffb03a : 0xd62828, 1).lineBetween(x + Math.cos(a) * (r - 12), y + Math.sin(a) * (r - 12), x + Math.cos(a) * (r - 4), y + Math.sin(a) * (r - 4)); }
    const v = Math.max(0, Math.min(1, 0.5 + this.w / 3)), an = a0 + (a1 - a0) * v + Math.sin(this.t * 40) * 0.02 * Math.abs(this.w);
    g.lineStyle(4, 0x1a1012, 1).lineBetween(x, y, x + Math.cos(an) * (r - 8), y + Math.sin(an) * (r - 8)); g.fillStyle(0xd62828, 1).fillCircle(x, y, 5);
    this.gaugeTxt = this.gaugeTxt || this.add.text(0, 0, 'SPIN', { fontFamily: PIXEL, fontSize: '8px', color: '#1a1012' }).setOrigin(0.5).setDepth(0.6);
    this.gaugeTxt.setPosition(x, y + r * 0.45);
  }

  layout() {
    const W = this.scale.width, H = this.scale.height;
    if (this.backG) this.drawFactory();
    this.timeTxt.setPosition(W / 2, 8); this.gotTxt.setPosition(W / 2, 32); this.spinTxt.setPosition(W - 12, 12);
    this.msg.setPosition(W / 2, H * 0.36); this.countTxt.setPosition(W / 2, H * 0.6); this.exitBtn.setPosition(10, 10);
  }
  puff(x, y, n, col, spd, life, size) { ZeroGScene.prototype.puff.call(this, x, y, n, col, spd, life, size); }
  pop(x, y, txt, col) { ZeroGScene.prototype.pop.call(this, x, y, txt, col); }
  // ---- touch: the main game's twin sticks. LEFT half: a floating MOVE stick (drag to run, tap or push up to jump,
  // hold up for the jetpack). RIGHT half: a floating AIM+FIRE stick (touching fires, dragging aims).
  touchRest() { const W = this.scale.width, H = this.scale.height; return { move: { x: 92, y: H - 86, r: 52 }, aim: { x: W - 170, y: H - 86, r: 52 } }; }
  readTouch() {
    const st = { ax: 0, jump: false, fire: false, aim: null, move: null, aimS: null }, W = this.scale.width, H = this.scale.height;
    if (!this.isTouch) return st;
    let moveTouched = false;
    for (const p of this.input.manager.pointers) {
      if (!p || !p.isDown || (p === this.input.manager.mousePointer && !p.wasTouch)) continue;
      const ox = p.downX, oy = p.downY;
      if (oy < H * 0.2) continue;                                       // the HUD / MAP button area isn't a stick
      const rad = 46, vx = Math.max(-1, Math.min(1, (p.x - ox) / rad)), vy = Math.max(-1, Math.min(1, (p.y - oy) / rad));
      if (ox < W * 0.45) {
        st.move = { ox, oy, vx, vy }; moveTouched = true;
        if (vx < -0.3) st.ax = -1; else if (vx > 0.3) st.ax = 1;
        const upish = -vy > Math.abs(vx) * 0.6;
        if (this.stickUp) { if (vy > -0.3) this.stickUp = false; } else if (vy < -0.6 && upish) this.stickUp = true;
        if (this.stickUp) st.jump = true;
      } else {
        st.aimS = { ox, oy, vx, vy }; st.fire = true;
        if (Math.hypot(vx, vy) > 0.35) st.aim = { sx: vx, sy: vy };
      }
    }
    if (!moveTouched) this.stickUp = false;
    if (this.tapJumpT > 0) { this.tapJumpT -= 0.016; st.jump = true; }
    return st;
  }
  drawTouch(st) {
    const g = this.touchG || (this.touchG = this.add.graphics().setDepth(22)); g.clear();
    const show = this.isTouch && !(Pad.state.connected && typeof LAST_INPUT !== 'undefined' && LAST_INPUT !== 'touch') && !this.done;
    if (!this.touchLbl) { const lab = t => this.add.text(0, 0, t, { fontFamily: PIXEL, fontSize: '8px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 3 }).setOrigin(0.5).setDepth(23); this.touchLbl = this.add.container(0, 0).setDepth(23); this.touchLbl.add([lab('MOVE'), lab('AIM + FIRE')]); }
    this.touchLbl.setVisible(show);
    if (!show) return;
    const R = this.touchRest();
    this.touchLbl.list[0].setPosition(R.move.x, R.move.y + 64); this.touchLbl.list[1].setPosition(R.aim.x, R.aim.y + 64);
    const stick = (rest, live) => {                       // base ring where the thumb landed (or a ghost at rest) + the knob
      const bx = live ? live.ox : rest.x, by = live ? live.oy : rest.y;
      g.fillStyle(0xffffff, live ? 0.12 : 0.06).fillCircle(bx, by, rest.r);
      g.lineStyle(3, 0xffffff, live ? 0.6 : 0.25).strokeCircle(bx, by, rest.r);
      const kx = bx + (live ? live.vx * rest.r * 0.75 : 0), ky = by + (live ? live.vy * rest.r * 0.75 : 0);
      g.fillStyle(0xffffff, live ? 0.5 : 0.18).fillCircle(kx, ky, rest.r * 0.42);
      g.lineStyle(2, 0x1a1020, live ? 0.6 : 0.2).strokeCircle(kx, ky, rest.r * 0.42);
    };
    stick(R.move, st.move); stick(R.aim, st.aimS);
  }
  bonk(why, dmg) {
    if (this.penaltyT > 0 || this.done) return;
    dmg = dmg || 1;
    this.penaltyT = 0.8; this.hp = Math.max(0, this.hp - dmg);
    if (this.hp <= 0) this.time.delayedCall(this.out ? 1100 : 300, () => this.finish(false));
    Sound.sfx(['ouch1', 'ouch2', 'ouch3'][Math.floor(Math.random() * 3)]); this.cameras.main.shake(140, 0.008);
    this.pop(this.scale.width / 2, this.scale.height * 0.5, why + ' -' + dmg, '#ff7a5a');
  }
  launch(inward, tang) {                                         // leave the wall: inertial velocity = the wall's own speed + your run + the jump
    const phi = this.a + this.D, rx = Math.cos(phi), ry = Math.sin(phi), tx = -ry, ty = rx, vt = this.w * this.RD + tang;
    this.pos = { x: rx * this.RD, y: ry * this.RD };
    this.vel = { x: tx * vt - rx * inward, y: ty * vt - ry * inward };
    this.onWall = false;
  }

  update(time, dms) {
    const dt = Math.min(0.05, dms / 1000); this.t += dt;
    const P = this.P, W = this.scale.width, H = this.scale.height, RD = this.RD;
    this.penaltyT = Math.max(0, this.penaltyT - dt);
    // ---- the spin programme (CF_SPIN): eases from one setting to the next, so a reverse passes through a stop
    if (this.intro <= 0 && !this.done) {
      this.segT -= dt;
      if (this.segT <= 0) {
        this.spinIdx = (this.spinIdx + 1) % CF_SPIN.length; const sg = CF_SPIN[this.spinIdx]; this.segT = sg.t;
        if (sg.msg) { this.pop(W / 2, H * 0.3, sg.msg, sg.col); Sound.sfx(sg.w === 0 ? 'whoosh' : Math.abs(sg.w) < 1 ? 'whoosh' : 'charge'); }
      }
    }
    this.w += (CF_SPIN[this.spinIdx].w - this.w) * Math.min(1, dt * 1.2);
    this.D += this.w * dt;
    // gravity: drowned out by the spin, but it takes over as the drum stops (none at all above ~0.45 rad/s)
    const grav = this.grav = 560 * Math.max(0, 1 - Math.abs(this.w) / 0.45);
    // ---- input
    const k = this.keys, ts = this.readTouch();
    let ax = 0, jump = false, fire = false, aimAt = null;
    if (k) { ax = (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0); jump = k.up.isDown || k.w.isDown || k.space.isDown; fire = k.z.isDown || k.x.isDown || k.j.isDown; }
    if (Pad.state.connected) { if (Pad.state.left || Pad.state.lx < -0.3) ax = -1; if (Pad.state.right || Pad.state.lx > 0.3) ax = 1; if (Pad.state.jump) jump = true; if (Pad.state.fire) fire = true; if (Pad.state.aimOn) { fire = true; aimAt = { sx: Pad.state.aimX, sy: Pad.state.aimY }; } }
    if (Pad.state.connected) {
      if (Pad.state.jet) jump = true;
      if (Settings.padUpJump) { const ly = Pad.state.ly || 0, upish = -ly > Math.abs(Pad.state.lx || 0) * 0.6; if (this.padUp) { if (ly > -0.3) this.padUp = false; } else if (ly < -0.6 && upish) this.padUp = true; if (this.padUp) jump = true; }
    }
    if (ts.ax) ax = ts.ax; if (ts.jump) jump = true; if (ts.fire) fire = true; if (ts.aim) aimAt = ts.aim;
    const mp = this.input.mousePointer;
    if (!this.isTouch && mp && mp.leftButtonDown() && !this.exitBtn.getBounds().contains(mp.x, mp.y)) { fire = true; const q = this.world.pointToContainer({ x: mp.x, y: mp.y }); aimAt = { wx: q.x, wy: q.y }; }
    this.drawTouch(ts);
    if (this.intro > 0) {
      this.intro -= dt; ax = 0; jump = false;
      const show = this.intro > 0.6 ? String(Math.max(1, Math.ceil(this.intro - 0.6))) : 'GO!';
      if (show !== this.count) { this.count = show; Sound.sfx(show === 'GO!' ? 'power' : 'combo'); this.countTxt.setText(show).setScale(1.8).setAlpha(1).setColor(show === 'GO!' ? '#7dff8a' : '#ffd23f'); this.tweens.add({ targets: this.countTxt, scale: 1, duration: 260, ease: 'Back.out' }); if (show === 'GO!') this.tweens.add({ targets: this.countTxt, alpha: 0, delay: 450, duration: 300 }); }
    }
    if (this.done || this.out || this.intro > 0) { ax = 0; jump = false; fire = false; }
    // standard controls: left/right are HIS left/right (like running round a planet), so upside down over the top,
    // right runs screen-left. His right is the way the angle DEcreases round the drum.
    if (ax) P.facing = ax;
    const dirA = -ax;
    const jumpPress = jump && !this.jumpWas; this.jumpWas = jump;
    // ---- on the wall: run round it (the paddles creep round and shove you if you don't jump them)
    if (this.onWall) {
      this.run += (dirA * 230 - this.run) * Math.min(1, dt * 10);
      this.fuel = Math.min(1, this.fuel + dt * 0.8);
      this.a += this.run / RD * dt;
      if (grav > 0) {                                                // gravity along the wall: slide down to the bottom (damped)
        const phiW = this.a + this.D, vt = this.w * RD + this.run + this.slide;
        this.slide += grav * Math.cos(phiW) * dt; this.slide *= 1 - Math.min(1, dt * 1.6);
        this.a += this.slide / RD * dt;
        // off the wall when gravity pulls harder than the wall's turn holds you (the top, once it's slow enough)
        if (vt * vt / RD < -grav * Math.sin(phiW) - 1 && !jumpPress) { this.launch(0, this.run + this.slide); this.slide = 0; Sound.sfx('whoosh'); }
      } else this.slide *= 1 - Math.min(1, dt * 4);
      if (Math.abs(this.run) > 60 && Math.random() < dt * 14) { const phi = this.a + this.D; this.fx.push({ x: Math.cos(phi) * (RD - 4), y: Math.sin(phi) * (RD - 4), vx: -Math.sin(phi) * (this.w * RD) * 0.6 - Math.cos(phi) * 60, vy: Math.cos(phi) * (this.w * RD) * 0.6 - Math.sin(phi) * 60, life: 0.5, max: 0.5, col: 0xf0ecd0 }); }
      if (jumpPress) { this.launch(400 + 320 * Math.max(0, 1 - Math.abs(this.w) / 1.35), this.run);   // bigger jumps the slower it goes
        Sound.sfx('jump'); this.puff(Math.cos(this.a + this.D) * RD, Math.sin(this.a + this.D) * RD, 5, 0xf0ecd0, 100, 0.3, 2); }
    } else {
      // ---- flying: a dead straight line while it spins (gravity only as it stops), with a touch of air-steer along his own sideways
      const phi = Math.atan2(this.pos.y, this.pos.x), tx = -Math.sin(phi), ty = Math.cos(phi);
      this.vel.x += tx * dirA * 160 * dt; this.vel.y += ty * dirA * 160 * dt;
      if (jump && !jumpPress && this.fuel > 0) {                // JETPACK: hold jump in the air to push in towards the middle
        this.fuel = Math.max(0, this.fuel - dt / 1.6); const thr = 520 + grav * 0.6; this.vel.x -= Math.cos(phi) * thr * dt; this.vel.y -= Math.sin(phi) * thr * dt;   // (stronger once gravity's about) this.jetting = true;
        if (Math.random() < dt * 40) this.fx.push({ x: this.pos.x + Math.cos(phi) * 20, y: this.pos.y + Math.sin(phi) * 20, vx: Math.cos(phi) * 120, vy: Math.sin(phi) * 120, life: 0.3, max: 0.3, col: 0xffa21a });
      } else this.jetting = false;
      this.vel.y += grav * dt;                                      // (only once the drum's slowed right down)
      this.pos.x += this.vel.x * dt; this.pos.y += this.vel.y * dt;
      const r = Math.hypot(this.pos.x, this.pos.y);
      if (r >= RD) {                                             // touch down: back on the wall, wherever it's turned to
        const phi2 = Math.atan2(this.pos.y, this.pos.x);
        const hz = !(this.grace > 0) && this.hatches.find(h => h.open > 0.5 && Math.abs(angDiff(phi2 - this.D, h.a)) < h.half);
        if (hz) { this.suckOut(); return; }
        this.a = phi2 - this.D; this.onWall = true;
        const vt = this.vel.x * -Math.sin(phi2) + this.vel.y * Math.cos(phi2);
        this.run = Math.max(-260, Math.min(260, (vt - this.w * RD) * 0.35));   // the skid as the moving floor grabs you
        Sound.sfx('clunk'); this.puff(Math.cos(phi2) * RD, Math.sin(phi2) * RD, 8, 0xf0ecd0, 140, 0.35, 2);
      }
    }
    this.grace = Math.max(0, (this.grace || 0) - dt);
    // ---- hatches: closed, a flashing warning, then open onto space: the air roars out and drags you along the wall towards
    // it. Get to the gap and you're SUCKED OUT. A rat on a rocket pack flies in whenever one opens.
    if (this.intro <= 0 && !this.survived && !this.done) { this.gapT -= dt; if (this.gapT <= 0) { this.gapT = 1.4 + Math.random() * 2.4; this.openGap(); } }
    for (let i = this.hatches.length - 1; i >= 0; i--) {
      const h = this.hatches[i];
      h.t -= dt;
      if (h.t <= 0) {
        if (h.st === 'warn') {                                        // it tears open: robots pour in, more through a bigger gap
          h.st = 'open'; h.t = 2.6 + Math.random() * 2; Sound.sfx('hiss'); this.cameras.main.shake(120, 0.004 + h.half * 0.02);
          const n = h.half < 0.11 ? 1 : h.half < 0.19 ? 2 : 3;
          for (let k = 0; k < n; k++) this.time.delayedCall(k * 380, () => { if (h.st === 'open' && this.ens.length < 7 && !this.survived && !this.done) this.spawnBot(h); });
        } else if (h.st === 'open') { h.st = 'shut'; h.t = 1e9; }
      }
      h.open += ((h.st === 'open' ? 1 : 0) - h.open) * Math.min(1, dt * 6);
      h.vis += ((h.st === 'shut' && h.open < 0.05 ? 0 : 1) - h.vis) * Math.min(1, dt * 4);
      if (h.st === 'shut' && h.vis < 0.03) { this.hatches.splice(i, 1); continue; }
      if (h.open > 0.3 && !this.out && this.intro <= 0 && !this.done) {
        if (this.onWall && !(this.grace > 0)) {
          const d = angDiff(h.a, this.a), arc = Math.abs(d) * RD;
          const reach = 90 + h.half * 400;                              // a bigger gap pulls harder and from further off
          if (arc < reach) this.a += Math.sign(d) * (reach - arc) / reach * (0.7 + h.half * 3) * h.open * dt;   // the draught drags you towards it
          if (Math.abs(d) < h.half * h.open) { this.suckOut(); continue; }
        }
        if (Math.random() < dt * 30) { const ang = h.a + this.D + (Math.random() - 0.5) * 0.9, rr = RD - Math.random() * 120; this.fx.push({ x: Math.cos(ang) * rr, y: Math.sin(ang) * rr, vx: (Math.cos(h.a + this.D) * RD - Math.cos(ang) * rr) * 2, vy: (Math.sin(h.a + this.D) * RD - Math.sin(ang) * rr) * 2, life: 0.45, max: 0.45, col: 0xd8e8ff }); }
      }
    }
    if (this.out) {                                              // sucked out into space... and thrown back in at the bottom
      this.out.t += dt;
      if (this.out.t > 1.1) {                                   // back in at the bottom, clear of any open hatch, with a moment's grace
        let a = Math.PI / 2 - this.D;
        for (let k = 0; k < 8 && this.hatches.some(h => h.st !== 'shut' && Math.abs(angDiff(h.a, a)) < 0.9); k++) a += 0.5;
        this.out = null; this.onWall = true; this.a = a; this.run = 0; this.penaltyT = 1.2; this.grace = 1.8;
      }
    }
    // ---- the robots: in through an open hatch, they hover inside (they don't spin with the drum) and shoot lasers.
    // DRONES zip round and fire single bolts; RAT SAUCERS are tougher, slower, and fire a fan of three.
    const cp0 = this.chrisPos();
    for (let i = this.ens.length - 1; i >= 0; i--) {
      const e = this.ens[i], saucer = e.kind === 'ratship';
      e.t += dt; e.flash = Math.max(0, e.flash - dt);
      e.ha += (saucer ? 0.16 : 0.45) * e.dir * dt;
      const hr = e.hr + Math.sin(e.t * (saucer ? 0.8 : 2.1)) * (saucer ? 14 : 30);
      const tx = Math.cos(e.ha) * hr, ty = Math.sin(e.ha) * hr;
      e.x += (tx - e.x) * Math.min(1, dt * 1.6); e.y += (ty - e.y) * Math.min(1, dt * 1.6);
      e.cd -= dt;
      if (e.cd <= 0 && e.t > 1.2 && !this.done && !this.out && !this.survived) {
        e.cd = saucer ? 2.6 + Math.random() * 1 : 1.5 + Math.random() * 1.1;
        const base = Math.atan2(cp0.y - e.y, cp0.x - e.x);
        for (const da of saucer ? [-0.28, 0, 0.28] : [0]) this.ebul.push({ x: e.x, y: e.y, vx: Math.cos(base + da) * 250, vy: Math.sin(base + da) * 250, life: 3 });
        Sound.sfx('shoot');
      }
      e.im.setPosition(e.x, e.y + Math.sin(e.t * 5) * 2).setRotation(saucer ? Math.sin(e.t * 2) * 0.12 : Math.sin(e.t * 3) * 0.15).clearTint();
      if (!saucer) e.im.setFlipX(cp0.x < e.x);
      if (e.flash > 0) e.im.setTintFill(0xffffff);
      if (e.hp <= 0) {
        this.puff(e.x, e.y, 18, 0xffb03a, 240, 0.5, 3); this.puff(e.x, e.y, 10, 0x9aa4b4, 160, 0.6, 3); Sound.sfx('scrap');
        if (!e.quiet) this.pop(this.scale.width / 2, this.scale.height * 0.45, saucer ? 'SAUCER DOWN!' : 'DRONE DOWN!', '#7dff8a');
        e.im.destroy(); this.ens.splice(i, 1);
      }
    }
    // bumping into a robot hurts (and knocks you back), unless you come down on it FEET FIRST: then it's crushed and you
    // bounce off it. "Down" in here is outwards, towards the wall under your feet.
    if (!this.out && !this.done) {
      const pr = Math.atan2(cp0.y, cp0.x), rx = Math.cos(pr), ry = Math.sin(pr), bcx = cp0.x - rx * 28, bcy = cp0.y - ry * 28;
      for (const e of this.ens) {
        if (e.hp <= 0) continue;
        const dx = e.x - bcx, dy = e.y - bcy, d = Math.hypot(dx, dy), rr = (e.kind === 'ratship' ? 34 : 22) + 16;
        if (d > rr) continue;
        const below = dx * rx + dy * ry, vOut = this.onWall ? 0 : this.vel.x * rx + this.vel.y * ry;
        if (!this.onWall && vOut > 40 && below > 6) {                    // STOMP
          e.hp = 0; e.quiet = true; this.pop(this.scale.width / 2, this.scale.height * 0.45, 'STOMP!', '#ffd23f'); Sound.sfx('bonk');
          this.vel.x -= rx * (vOut + 320); this.vel.y -= ry * (vOut + 320); this.fuel = Math.min(1, this.fuel + 0.35);
        } else if (this.penaltyT <= 0) {                                 // OUCH: knocked away from it
          this.bonk(e.kind === 'ratship' ? 'RAMMED' : 'BUMPED', 1); this.puff(e.x, e.y, 8, 0xff6a3a, 160, 0.3, 2);
          const ux = -dx / (d || 1), uy = -dy / (d || 1);
          if (this.onWall) { const tx = -ry, ty = rx; this.run += Math.sign(ux * tx + uy * ty || 1) * 260; }
          else { this.vel.x += ux * 260; this.vel.y += uy * 260; }
          e.x -= ux * 30; e.y -= uy * 30;
        }
      }
    }
    for (let i = this.ebul.length - 1; i >= 0; i--) {
      const b = this.ebul[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      const hitC = !this.out && this.penaltyT <= 0 && !this.done && Math.hypot(b.x - cp0.x, b.y - cp0.y) < 20;
      if (hitC) { this.bonk('ZAPPED', 1); this.puff(b.x, b.y, 8, 0xff3a5a, 160, 0.3, 2); }
      if (hitC || b.life <= 0 || Math.hypot(b.x, b.y) > RD) this.ebul.splice(i, 1);
    }
    // ---- the Mac-Grinder: fires from the gun, aims at the mouse / right stick, or the nearest robot
    this.fireCd -= dt;
    let aimDir = null;
    if (aimAt && aimAt.wx !== undefined) { const dx = aimAt.wx - cp0.x, dy = aimAt.wy - cp0.y, L = Math.hypot(dx, dy) || 1; aimDir = { x: dx / L, y: dy / L }; }
    else if (aimAt) { const L = Math.hypot(aimAt.sx, aimAt.sy) || 1; aimDir = { x: aimAt.sx / L, y: aimAt.sy / L }; }
    else if (fire && this.ens.length) { let best = null, bd = 1e9; for (const e of this.ens) { const d = Math.hypot(e.x - cp0.x, e.y - cp0.y); if (d < bd) { bd = d; best = e; } } const dx = best.x - cp0.x, dy = best.y - cp0.y; aimDir = { x: dx / bd, y: dy / bd }; }
    const phiP = Math.atan2(cp0.y, cp0.x), up = { x: -Math.cos(phiP), y: -Math.sin(phiP) }, right = { x: Math.sin(phiP), y: -Math.cos(phiP) };
    if (aimDir) {
      const fwdS = aimDir.x * right.x + aimDir.y * right.y; if (Math.abs(fwdS) > 0.15) P.facing = fwdS > 0 ? 1 : -1;
      const fx2 = right.x * P.facing, fy2 = right.y * P.facing;
      P.aimA = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, Math.atan2(aimDir.x * up.x + aimDir.y * up.y, aimDir.x * fx2 + aimDir.y * fy2)));
    } else P.aimA = (P.aimA || 0) * Math.max(0, 1 - dt * 8);
    if (fire && this.fireCd <= 0 && this.muz) {
      this.fireCd = 0.11; P.firing = 0.12;
      const im = this.add.image(this.muz.x, this.muz.y, 'macaroni').setScale(1.2); this.world.add(im);
      this.shots.push({ x: this.muz.x, y: this.muz.y, vx: this.muz.dx * 720, vy: this.muz.dy * 720, im, life: 1 });
      Sound.sfx('shoot');
    }
    P.firing = Math.max(0, (P.firing || 0) - dt);
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const b = this.shots[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; b.im.setPosition(b.x, b.y).setRotation(b.im.rotation + dt * 12);
      let dead = b.life <= 0 || Math.hypot(b.x, b.y) > RD;
      for (const e of this.ens) if (!dead && Math.hypot(b.x - e.x, b.y - e.y) < (e.kind === 'ratship' ? 32 : 22)) { e.hp--; e.flash = 0.06; dead = true; Sound.sfx('tink'); }
      if (dead) { b.im.destroy(); this.shots.splice(i, 1); }
    }
    // ---- ingredients (in the drum's frame)
    const cp = this.chrisPos(), ca = Math.cos(-this.D), sa = Math.sin(-this.D);
    const lx = cp.x * ca - cp.y * sa, ly = cp.x * sa + cp.y * ca;          // Chris in drum coordinates
    for (const it of this.items) {
      if (it.got) continue;   // (all of them are needed, as well as the 60 s)
      it.im.setRotation(Math.sin(this.t * 1.4 + it.ph) * 0.3);
      if (!this.done && this.intro <= 0 && Math.hypot(lx - it.x, ly - it.y) < 40) {
        it.got = true; this.got++; Sound.sfx('pickup');
        this.tweens.add({ targets: it.im, scale: 0, angle: 360, duration: 250, onComplete: () => it.im.destroy() });
        if (this.hp < this.hpMax) { this.hp++; this.pop(W / 2, H * 0.42, 'PATCHED UP! +1', '#7dff8a'); } else this.pop(W / 2, H * 0.42, 'YUM!', '#7dff8a');
      }
    }
    // ---- clock
    const allGot = this.got >= this.items.length;
    if (!this.done && this.intro <= 0 && !this.survived) { this.timeLeft = Math.max(0, this.timeLeft - dt); if (this.timeLeft <= 0 && allGot) this.survive(); }
    if (this.survived) this.timeTxt.setText('GRAB IT!').setColor(Math.floor(this.t * 4) % 2 ? '#7dff8a' : '#ffd23f');
    else if (this.timeLeft <= 0) this.timeTxt.setText('SURVIVED').setColor('#7dff8a');
    else this.timeTxt.setText(String(Math.ceil(this.timeLeft))).setColor(this.timeLeft < 10 && Math.floor(this.t * 4) % 2 ? '#7dff8a' : '#ffd23f');
    this.gotTxt.setText(this.survived ? 'JUMP THROUGH THE MIDDLE!' : this.timeLeft <= 0 ? 'NOW GET THE LAST ' + (this.items.length - this.got) + '!' : 'ARMOUR');
    (this.goalHud || (this.goalHud = new GoalHud(this))).update([
      { label: 'SURVIVE 60s', frac: 1 - this.timeLeft / 60, right: this.timeLeft > 0 ? Math.ceil(this.timeLeft) + 's' : 'OK', done: this.timeLeft <= 0 },
      { label: 'INGREDIENTS', frac: this.got / this.items.length, right: this.got + '/' + this.items.length, done: allGot, hot: this.timeLeft <= 0 && !allGot },
      { label: 'GRAB THE GUN', locked: !this.survived, done: this.done && this.survived, hot: this.survived && !this.done }]);
    { const hg = this.hudG; hg.clear(); const n = this.hpMax, w = 14, x0 = W / 2 - n * (w + 4) / 2, y0 = 46;     // armour pips
      for (let k = 0; k < n; k++) { const x = x0 + k * (w + 4), on = k < this.hp; hg.fillStyle(0x1a1020, 1).fillRect(x - 1, y0 - 1, w + 2, 10); hg.fillStyle(on ? (this.hp <= 2 && Math.floor(this.t * 6) % 2 ? 0xff5a3a : 0x7dff8a) : 0x3a2a30, 1).fillRect(x, y0, w, 8); if (on) hg.fillStyle(0xffffff, 0.45).fillRect(x, y0, w, 2); } }
    if (this.prizeIm) {                                                       // the prize, bobbing in the middle: fly through it
      this.prizeIm.setRotation(Math.sin(this.t * 2) * 0.2).setY(Math.sin(this.t * 3) * 4);
      const pg2 = this.prizeG; pg2.clear();
      for (let k = 0; k < 3; k++) pg2.fillStyle(0xffd23f, 0.12 - k * 0.03).fillCircle(0, 0, 34 + k * 14 + Math.sin(this.t * 5) * 4);
      for (let k = 0; k < 8; k++) { const a = this.t * 1.5 + k * Math.PI / 4; pg2.fillStyle(0xfff6b0, 0.5).fillRect(Math.cos(a) * 52 - 2, Math.sin(a) * 52 - 2, 4, 4); }
      if (!this.done && Math.hypot(cp.x, cp.y) < 62) this.finish(true);
    }
    { const aw = Math.abs(this.w), rev = this.w < -0.05; this.spinTxt.setText(aw < 0.15 ? 'SPIN: STOPPED' : (rev ? 'REVERSE: ' : 'SPIN: ') + (aw < 0.8 ? 'SLOW' : 'FAST')).setColor(aw < 0.15 ? '#ff7a5a' : aw < 0.8 ? '#9fd8ff' : '#ffb07a'); }
    this.drawGauge();

    // ---- draw: the drum turns, items glow, the paddles
    this.drum.setRotation(this.D);
    // the gears: each pinion meshes the drum's ring; the big cog shares its axle; the motor pinion meshes the big cog.
    // mesh(): rotation of a cog B driven by A, with a gap of B's facing A's tooth along the line of centres u
    const mesh = (thA, u, rA, rB, nB) => -(rA / rB) * (thA - u) + u + Math.PI + Math.PI / nB;
    for (const d of this.drive) {
      const th = mesh(this.D, d.u, this.ringR, 50, 12); d.pin.setRotation(th); d.big.setRotation(th);
      if (d.motor) this.sun.setRotation(mesh(th, d.u + Math.PI, d.bigR, 150, 36));
      if (d.mot) {
        d.mot.setRotation(mesh(th, d.um, d.bigR, 50, 12));
        const mg = d.motorG, x = d.mx, y = d.my; mg.clear();                     // the motor: a finned drum with a hot lamp
        mg.fillStyle(0x0a0c10, 1).fillRoundedRect(x - 170, y - 52, 150, 104, 10); mg.fillStyle(0x3a5a3a, 1).fillRoundedRect(x - 166, y - 48, 142, 96, 8);
        for (let k = 0; k < 7; k++) mg.fillStyle(0x24382a, 1).fillRect(x - 158 + k * 19, y - 44, 9, 88);
        mg.fillStyle(0x8a929e, 1).fillRect(x - 26, y - 10, 26, 20);
        const hot = (Math.abs(this.w) - 0.4) / 1.0; mg.fillStyle(0xff5a2a, 0.4 + 0.6 * hot * (0.7 + 0.3 * Math.sin(this.t * 30))).fillCircle(x - 150, y - 32, 6);
      }
      if (Math.abs(this.w) > 1 && Math.random() < dt * 14 * (Math.abs(this.w) - 1)) {            // sparks where the teeth bite, when it's going hard
        const px = Math.cos(d.u) * this.ringR, py = Math.sin(d.u) * this.ringR;
        for (let i = 0; i < 3; i++) this.fx.push({ x: px, y: py, vx: (Math.random() - 0.5) * 260, vy: (Math.random() - 0.7) * 260, life: 0.3, max: 0.3, col: 0xffb03a });
      }
    }
    const sh = this.sheenG; sh.clear();                                       // light on the steel shell (it doesn't turn)...
    sh.lineStyle(10, 0xffffff, 0.12).beginPath(); sh.arc(0, 0, RD + 17, Math.PI * 1.08, Math.PI * 1.55); sh.strokePath();
    sh.lineStyle(4, 0xffffff, 0.1).beginPath(); sh.arc(0, 0, RD + 17, Math.PI * 0.1, Math.PI * 0.32); sh.strokePath();
    const sw = Math.max(0, Math.abs(this.w) - 0.6), sgn = this.w < 0 ? -1 : 1;                                     // ...and streaks whizzing round the wall
    if (sw > 0) for (let k = 0; k < 5; k++) { const a0 = this.D * 1.0 + k * 1.2566; sh.lineStyle(3, 0xfff6d8, 0.18 * sw).beginPath(); sh.arc(0, 0, RD - 16 - (k % 2) * 12, Math.min(a0, a0 - sgn * 0.45 * sw), Math.max(a0, a0 - sgn * 0.45 * sw)); sh.strokePath(); }
    this.drawBack(dt);
    const gg = this.glowG; gg.clear();
    for (const it of this.items) if (!it.got) gg.fillStyle(it.col, 0.16 + 0.08 * Math.sin(this.t * 4 + it.ph)).fillCircle(it.x, it.y, 26);
    const pg = this.padG; pg.clear();
    for (const h of this.hatches) {                                       // a hatch in the wall: a window onto space when open
      const n = 10, pts = (r0, r1, f) => { const o = []; for (let k = 0; k <= n; k++) { const a2 = h.a - h.half * f + 2 * h.half * f * k / n; o.push({ x: Math.cos(a2) * r0, y: Math.sin(a2) * r0 }); } for (let k = n; k >= 0; k--) { const a2 = h.a - h.half * f + 2 * h.half * f * k / n; o.push({ x: Math.cos(a2) * r1, y: Math.sin(a2) * r1 }); } return o; };
      const V = h.vis;
      if (h.st !== 'shut') pg.fillStyle(h.st === 'open' ? 0xff3a2a : 0xffd23f, h.st === 'open' ? 0.18 : (Math.floor(this.t * 8) % 2) * 0.22).fillPoints(pts(RD - 70, RD - 4, 1.5), true);   // danger glow on the floor
      pg.fillStyle(0x1a1012, V).fillPoints(pts(RD - 4, RD + 36, 1.25), true);
      if (h.open > 0.02) { pg.fillStyle(0x020208, 1).fillPoints(pts(RD - 4, RD + 36, h.open), true); for (let k = 0; k < 6; k++) { const a2 = h.a + (k / 5 - 0.5) * h.half * h.open * 1.6, rr = RD + 8 + (k * 7) % 22; pg.fillStyle(0xffffff, 0.8).fillRect(Math.cos(a2) * rr, Math.sin(a2) * rr, 2, 2); } }
      for (const sd of [-1, 1]) {                                         // the two doors, sliding apart
        const a0 = h.a + sd * h.half * h.open, a1 = h.a + sd * h.half * 1.25, q = [];
        for (let k = 0; k <= 6; k++) { const a2 = a0 + (a1 - a0) * k / 6; q.push({ x: Math.cos(a2) * (RD - 2), y: Math.sin(a2) * (RD - 2) }); }
        for (let k = 6; k >= 0; k--) { const a2 = a0 + (a1 - a0) * k / 6; q.push({ x: Math.cos(a2) * (RD + 34), y: Math.sin(a2) * (RD + 34) }); }
        if (Math.abs(a1 - a0) > 0.005) pg.fillStyle(0x8a929e, V).fillPoints(q, true);
      }
      const warn = h.st === 'warn' && Math.floor(this.t * 8) % 2, lightCol = h.st === 'open' ? 0xff3a2a : warn ? 0xffd23f : h.st === 'warn' ? 0x6a5020 : 0x3aa040;
      for (const sd of [-1, 1]) { const a2 = h.a + sd * h.half * 1.25 + sd * 0.05; pg.fillStyle(lightCol, V).fillCircle(Math.cos(a2) * (RD + 12), Math.sin(a2) * (RD + 12), 5); }
    }
    // Chris
    const phiC = Math.atan2(cp.y, cp.x);
    P.h = this.onWall ? 0 : 40; P.vh = this.onWall ? 0 : 1; P.vx = this.onWall ? -this.run : 0; P.thrusting = !!this.jetting;
    this.rig.update(P, dt, cp.x, cp.y, 1, this.penaltyT > 0 && Math.floor(this.t * 20) % 2 ? 0.4 : 1, 0);
    this.rig.root.setRotation(phiC - Math.PI / 2);                // feet to the wall (outwards)
    if (this.out) { const k2 = Math.min(1, this.out.t / 0.9); this.rig.root.setAlpha(1 - k2).setScale(this.rig.root.scaleX * (1 - k2 * 0.7), this.rig.root.scaleY * (1 - k2 * 0.7)).setPosition(this.out.x * (1 + k2 * 0.5), this.out.y * (1 + k2 * 0.5)).setRotation(this.out.t * 12); }
    { const tip = this.rig.auger, m = tip.getWorldTransformMatrix(), a1 = m.transformPoint(tip.width * (1 - tip.originX), 0), a0 = m.transformPoint(-tip.width * tip.originX, 0);
      const p1 = this.world.pointToContainer({ x: a1.x, y: a1.y }), p0 = this.world.pointToContainer({ x: a0.x, y: a0.y }), L = Math.hypot(p1.x - p0.x, p1.y - p0.y) || 1;
      this.muz = { x: p1.x, y: p1.y, dx: (p1.x - p0.x) / L, dy: (p1.y - p0.y) / L }; }
    const fg = this.fxG; fg.clear();
    if (!this.onWall && Math.random() < dt * 30) this.fx.push({ x: cp.x, y: cp.y, vx: 0, vy: 0, life: 0.4, max: 0.4, col: 0x9fd8ff });
    for (let i = this.fx.length - 1; i >= 0; i--) { const q = this.fx[i]; q.life -= dt; if (q.life <= 0) { this.fx.splice(i, 1); continue; } q.x += (q.vx || 0) * dt; q.y += (q.vy || 0) * dt; fg.fillStyle(q.col || 0x9fd8ff, q.life / q.max * 0.6).fillCircle(q.x, q.y, 4); }
    for (const b of this.ebul) {                                             // robot laser bolts: a hot streak with a white core
      const L = Math.hypot(b.vx, b.vy) || 1, ux = b.vx / L, uy = b.vy / L;
      fg.lineStyle(9, 0xff2a5a, 0.35).lineBetween(b.x - ux * 22, b.y - uy * 22, b.x, b.y);
      fg.lineStyle(4, 0xff6a8a, 0.9).lineBetween(b.x - ux * 16, b.y - uy * 16, b.x, b.y);
      fg.fillStyle(0xffffff, 1).fillCircle(b.x, b.y, 2.5);
    }
    // ---- camera: FIXED on the whole drum, so you SEE it spin and Chris get carried round it (upside down over the top)
    // like a hamster in a wheel. A faint judder that grows with the spin.
    const sc = this.wsc(), jud = Math.max(0, Math.abs(this.w) - 0.5) * 1.6;
    this.world.setScale(sc).setRotation(0).setPosition(W / 2 + (Math.random() - 0.5) * jud, H * 0.53 + (Math.random() - 0.5) * jud);
  }
  spawnBot(h) {                                                   // a robot flies in through the hatch: mostly drones, some saucers
    const kind = Math.random() < 0.3 ? 'ratship' : 'drone', ang = h.a + this.D;
    const im = this.add.image(Math.cos(ang) * this.RD, Math.sin(ang) * this.RD, kind).setScale(kind === 'ratship' ? 0.85 : 1.4); this.world.add(im);
    this.ens.push({ kind, x: Math.cos(ang) * this.RD, y: Math.sin(ang) * this.RD, ha: ang, dir: Math.random() < 0.5 ? -1 : 1, hr: kind === 'ratship' ? 70 + Math.random() * 50 : 90 + Math.random() * 80, hp: kind === 'ratship' ? 6 : 3, cd: 1.5, t: 0, flash: 0, im });
    Sound.sfx('whoosh');
  }
  openGap() {                                                     // a new gap in the wall: a random size, somewhere clear
    const live = this.hatches.length, big = this.hatches.filter(h => h.half > 0.19).length;
    if (live >= 4) return;
    const u = Math.random(), half = u < 0.4 ? 0.07 + Math.random() * 0.04 : u < 0.8 || big ? 0.12 + Math.random() * 0.06 : 0.2 + Math.random() * 0.07;
    for (let tries = 0; tries < 20; tries++) {
      const a = Math.random() * Math.PI * 2;
      if (this.hatches.some(h => Math.abs(angDiff(h.a, a)) < h.half * 1.3 + half * 1.3 + 0.12)) continue;
      if (Math.abs(angDiff(a, this.a)) < half + 0.45) continue;     // never right under your feet
      this.hatches.push({ a, half, st: 'warn', t: 1.1 + half * 2, open: 0, vis: 0 }); Sound.sfx('clunk'); return;
    }
  }
  survive() {                                                     // 60 s survived: robots blow, hatches seal, the prize pops out in the middle
    this.survived = true;
    for (const e of this.ens) { e.hp = 0; e.quiet = true; } this.ebul.length = 0;
    for (const h of this.hatches) { h.st = 'shut'; h.t = 1e9; }
    this.spinIdx = 3; this.segT = 6;                               // and the drum winds down, so you can make the jump
    const W = this.scale.width, H = this.scale.height;
    this.pop(W / 2, H * 0.3, 'SURVIVED! THE PRIZE IS OUT!', '#ffd23f'); Sound.sfx('power'); this.cameras.main.flash(250, 255, 240, 180);
    this.prizeG = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD); this.world.add(this.prizeG);
    this.prizeIm = this.add.image(0, 0, this.prize ? this.prize.gunTex : 'goldwheel').setScale(0); this.world.add(this.prizeIm);
    this.tweens.add({ targets: this.prizeIm, scale: this.prize ? 2 : 2.2, duration: 500, ease: 'Back.out' });
    this.puff(0, 0, 24, 0xffd23f, 260, 0.6, 3);
  }
  suckOut() {
    const cp = this.chrisPos();
    this.out = { t: 0, x: cp.x, y: cp.y }; this.onWall = true; this.run = 0;
    Sound.sfx('whoosh'); this.cameras.main.shake(300, 0.012);
    this.penaltyT = 0; this.bonk('SUCKED OUT!', 2);
  }
  chrisPos() {
    if (!this.onWall) return this.pos;
    const phi = this.a + this.D; return { x: Math.cos(phi) * this.RD, y: Math.sin(phi) * this.RD };
  }

  finish(won) {
    if (this.done) return;
    this.done = true; this.doneT = this.t;
    let body;
    if (won) {
      Sound.sfx('power'); Sound.music('win'); Sound.say('woohoo', { force: true });
      if (this.prizeIm) this.tweens.add({ targets: this.prizeIm, scale: 0, angle: 360, duration: 300 });
      if (this.prize) { Progress.giveGun(this.prize.id); body = 'SURVIVED THE SPIN!\n\nNEW GUN: ' + this.prize.name; }
      else { const lives = Math.min(CFG.maxLives, (this.registry.get('lives') || CFG.startLives) + 1); this.registry.set('lives', lives); body = 'SURVIVED THE SPIN!\n\n+1 LIFE'; }
    } else { Sound.music('lose'); body = 'WRECKED!\n\nYOU LASTED ' + Math.floor(60 - this.timeLeft) + 's OF 60'; }
    const W = this.scale.width, H = this.scale.height, D = 30;
    this.add.rectangle(0, 0, W, H, 0x000000, 0.55).setOrigin(0).setDepth(D);
    this.add.text(W / 2, H * 0.24, won ? 'BONUS CLEAR!' : 'KNOCKED OUT', { fontFamily: PIXEL, fontSize: '22px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 6 }).setOrigin(0.5).setDepth(D + 1);
    this.add.text(W / 2, H * 0.36, body, { fontFamily: PIXEL, fontSize: '10px', color: '#ffffff', align: 'center', lineSpacing: 8 }).setOrigin(0.5, 0).setDepth(D + 1);
    const pad = typeof inputDevice === 'function' && inputDevice() === 'pad';
    const btn = (x, label, fn, col) => {
      const b = this.add.text(x, H * 0.78, label, { fontFamily: PIXEL, fontSize: '11px', color: '#1a1020', backgroundColor: col, padding: { x: 12, y: 10 } }).setOrigin(0.5).setDepth(D + 2).setInteractive({ useHandCursor: true });
      b.on('pointerup', () => { if (this.t - this.doneT > 0.5) fn(); });
    };
    btn(W / 2 - 80, pad ? 'A: MAP' : 'MAP', () => this.leave(), '#ffd23f');
    btn(W / 2 + 80, pad ? 'X: AGAIN' : 'AGAIN', () => this.again(), '#ffb07a');
    this.exitBtn.setVisible(false);
  }
  again() { if (this.leaving) return; this.leaving = true; this.cameras.main.fadeOut(200, 0, 0, 0); this.time.delayedCall(220, () => this.scene.restart()); }
  leave() { if (this.leaving) return; this.leaving = true; this.cameras.main.fadeOut(250, 0, 0, 0); this.time.delayedCall(280, () => this.scene.start('select')); }
}
