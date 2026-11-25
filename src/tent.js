// ================================================================= THE TENT (v3.103): safe and snug
// The tent at Moon Camp is a station now: walk up, press DOWN, CRAWL IN. Inside, nothing to do but be cosy:
// a lantern swinging on its string, fairy lights along the canvas, Chris in his sleeping bag, Biscuit curled up at his
// feet, a mug of cocoa steaming, Bessie's photo pinned up, a little radio playing a lullaby, and through the tied-back
// flap the campfire glowing and the stars going over. Tap things to fiddle with them. CRAWL OUT to go back.
const TENT_SAYS = {
  chris: ['Five more minutes...', 'Is that a rat? ...No. Just Clank.', 'Bessie would love this tent.', 'Who needs a ranch when you\'ve got a moon?', 'Zzz... grate... zzz... cheddar... zzz...', 'Tomorrow. I\'ll save the galaxy tomorrow.'],
  dog: ['(Biscuit sighs happily and stretches all four legs at once.)', '(His tail thumps the groundsheet twice.)', '(He rolls over for a belly rub. The helmet makes it a slow roll.)', '(A tiny woof in his sleep. He\'s chasing something.)'],
  mug: ['Cocoa. With a slice of cheese in it. Don\'t judge.', 'Still warm. Fridge-o-tron charged me 40 cheddar for it.', '*slurp*'],
  photo: ['Miss you, old girl. Not long now.', 'Bessie. Best cow on any planet.', 'She\'s smiling in this one. She\'s always smiling.'],
  flap: ['The fire crackles. Zib is still out there toasting cheese.', 'Stars going over. A rat-ship, far away. Not tonight, lads.', 'Henrietta is clucking at the dark. Brave hen.'],
  book: ['THE GREAT GRATER: A CAUTIONARY TALE. Again? Fine.', 'Chapter 3: The Brie-muda Triangle. Spooky.', 'Someone has drawn a moustache on the Rat King.'],
  radio: ['A little lullaby on the moon station.', 'Click.']
};

function makeTentTextures(scene) {
  pixTex(scene, 'tent_lantern', 13, 19, put => {
    const r = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, c); };
    r(5, 0, 7, 1, 0x1a1020); r(3, 2, 9, 3, 0x1a1020); r(4, 2, 8, 2, 0x6a5a48);                 // the handle and cap
    r(1, 4, 11, 15, 0x1a1020); r(2, 5, 10, 14, 0xffe080); r(3, 6, 9, 13, 0xfff6c0);            // the glass, lit
    r(5, 8, 7, 12, 0xffb04a); put(6, 7, 0xffffff);                                               // the flame
    for (const x of [2, 6, 10]) r(x, 5, x, 14, 0x5a4838);                                        // the cage bars
    r(1, 16, 11, 18, 0x1a1020); r(2, 16, 10, 17, 0x6a5a48);                                     // the base
  });
}

class TentScene extends Phaser.Scene {
  constructor() { super('tent'); }
  create() {
    makeTextures(this); makeTentTextures(this);
    this.cameras.main.setBackgroundColor('#0a0608'); this.cameras.main.fadeIn(500, 0, 0, 0);
    Sound.init(); this.radio = true; Sound.music('tent');
    this.lamp = 1; this.lampTo = 1; this.t = 0; this.saysI = {}; this.parts = []; this.cap = null; this.going = false;
    if (typeof Ach !== 'undefined') Ach.unlock('snug');
    this.build();
    this.scale.on('resize', this.build, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.build, this));
    const kb = this.input.keyboard;
    if (kb) { kb.on('keydown-ESC', () => this.out()); kb.on('keydown-SPACE', () => this.tap('chris')); kb.on('keydown-L', () => this.tap('lantern')); kb.on('keydown-R', () => this.tap('radio')); }
    const padOff = typeof Pad !== 'undefined' ? Pad.on(b => { if (b === 'b' || b === 'y') this.out(); else if (b === 'a') this.tap('chris'); else if (b === 'x') this.tap('lantern'); }) : null;
    if (padOff) this.events.once('shutdown', padOff);
    this.input.on('pointerdown', p => { const h = (this.hits || []).find(q => p.x >= q.x && p.x <= q.x + q.w && p.y >= q.y && p.y <= q.y + q.h); if (h) this.tap(h.id); });
    this.time.delayedCall(900, () => this.say('Ahh. Safe and snug.'));
  }
  // ---- the painted interior: one canvas at whole art pixels (z), then the moving things on top
  build() {
    const W = this.scale.width, H = this.scale.height, z = Math.max(2, Math.floor(H / 125)), aw = Math.ceil(W / z), ah = Math.ceil(H / z);
    this.z = z; this.aw = aw; this.ah = ah;
    this.children.removeAll(true); this.parts = [];
    const cx = Math.round(aw * 0.44), fl = ah - 34, apex = 6, wide = Math.min(aw * 0.42, 130);
    this.geo = { cx, fl, apex, wide };
    const key = 'tent_bg';
    if (this.textures.exists(key)) this.textures.remove(key);
    pixTex(this, key, aw, ah, put => {
      const FAB = [0x24100a, 0x3a1a0c, 0x5a2a12, 0x7a3a16, 0x9a4c1a, 0xc0622a];
      const pick = (R, f, x, y) => { f = Math.max(0, Math.min(R.length - 1, f)); const i = Math.floor(f); return R[Math.min(R.length - 1, i + ((f - i) * 16 > bay(x, y) ? 1 : 0))]; };
      const rnd = rng(77), n1 = vnoise(rnd, 7);
      const fx = aw * 0.8, fy0 = 26, fy1 = fl - 2;                    // the flap opening on the right
      for (let y = 0; y < ah; y++) for (let x = 0; x < aw; x++) {
        const dx = x - cx, half = (y - apex) / (fl - apex) * wide;
        let c;
        if (y >= fl) {                                              // the groundsheet
          const d = Math.hypot((x - cx) / 58, (y - fl - 16) / 11);
          c = d < 1 ? ([0x5a1a2a, 0x8a2a2a, 0xc8902a, 0x8a2a2a, 0x5a1a2a][Math.min(4, Math.floor(d * 5))]) : pick([0x0e121e, 0x161c2c, 0x1e2638], 1.2 + (y - fl) / 30 + (n1(x / aw, y / ah) - 0.5), x, y);
        } else if (y >= apex && Math.abs(dx) <= half) {             // the back wall: lit canvas, seams running up to the apex
          const seam = Math.abs(((dx / Math.max(1, half)) * 3 + 6) % 1 - 0.5) < 0.04;
          c = pick(FAB, 2.0 - Math.abs(dx) / wide * 0.8 + (n1(x / aw * 2, y / ah * 2) - 0.5) * 0.7 - (y < apex + 10 ? 0.3 : 0), x, y);
          if (seam) c = FAB[1];
        } else {                                                    // the side walls, nearer and darker, sloping in
          const side = dx < 0 ? -1 : 1, k = (Math.abs(dx) - half) / (aw / 2);
          c = pick(FAB, 1.6 - k * 1.2 + (n1(x / aw * 3, y / ah) - 0.5) * 0.6, x, y);
          if (Math.abs(((y + Math.abs(dx) * 0.6) / 22) % 1 - 0.5) < 0.03 && (x + y) % 2) c = FAB[1];   // soft folds
          const inFlap = side > 0 && x > fx - (y - fy0) * 0.28 && x < aw - 4 && y > fy0 + (x - fx) * 0.1 && y < fy1;
          if (inFlap) {                                             // outside: the night, the moon's horizon, the fire's glow
            const hz = fy1 - 12 + Math.sin(x * 0.08) * 2;
            if (y > hz) c = pick([0x5a3a0a, 0x8a5a12, 0xc08a18], 1 + (y - hz) / 8, x, y);
            else c = pick([0x080a1c, 0x101844, 0x1e1438, 0x3a1a3a, 0x7a2a1a], (y - fy0) / (hz - fy0) * 3.2 + (x > aw - 30 ? 0.6 : 0), x, y);
          }
          if (side > 0 && Math.abs(x - (fx - (y - fy0) * 0.28)) < 1.2 && y > fy0 && y < fy1) c = 0x1a0a06;   // the opening's edge
        }
        put(x, y, c);
      }
      // the tied-back flap, folded on itself
      for (let y = fy0 - 4; y < fy1; y++) for (let x = Math.round(fx - (y - fy0) * 0.28) - 9; x < Math.round(fx - (y - fy0) * 0.28) - 1; x++) if ((x + y) % 7) put(x, y, y % 9 === 0 ? FAB[1] : FAB[4]);
      for (let x = Math.round(fx - 14); x < fx - 1; x++) put(x, Math.round(fy0 + 22), 0xd8c8a0);   // the tie
      // the tent pole up the back, and the pole's foot
      for (let y = apex; y < fl + 2; y++) { put(cx, y, 0x6a4a2a); put(cx + 1, y, 0x3a2418); }
      // Bessie's photo, pinned to the canvas (the picture is a sprite on top)
      const px = cx - 54, py = 40; for (let y = py; y < py + 22; y++) for (let x = px; x < px + 20; x++) put(x, y, (x === px || y === py || x === px + 19 || y === py + 21) ? 0x1a1020 : (y > py + 17 ? 0xf4ecd8 : 0x8ac8f0));
      put(px + 10, py, 0xd83a2a); put(px + 10, py - 1, 0xd83a2a);
      // the radio on a crate
      const rx = cx + 22, ry = fl - 16; for (let y = ry; y < fl; y++) for (let x = rx; x < rx + 22; x++) put(x, y, y < ry + 12 ? ((x === rx || x === rx + 21 || y === ry) ? 0x1a1020 : (x > rx + 12 && (x + y) % 2 ? 0x3a3448 : 0x8a2a2a)) : ((x - rx) % 6 === 0 ? 0x3a2418 : 0x6a4a2a));
      for (let k = 0; k < 10; k++) put(rx + 4 + k, ry - 1 - k, 0x9aa4b8);                         // the aerial
      for (let x = rx + 3; x < rx + 11; x++) put(x, ry + 6, 0xffd23f);                            // the dial
      // the sleeping bag (Chris's head is a sprite on the pillow)
      const bx = cx - 92, by = fl - 6, bw = 112, bh = 17;
      for (let y = by - 3; y < by + bh; y++) for (let x = bx - 16; x < bx; x++) { if (Math.hypot((x - bx + 8) / 9, (y - by - 5) / 8) <= 1) put(x, y, (x + y) % 5 ? 0xf4f0e0 : 0xd8d0c0); }   // the pillow
      for (let y = by; y < by + bh; y++) for (let x = bx; x < bx + bw; x++) {
        const e = Math.hypot(Math.max(0, x - (bx + bw - 10)) / 10, Math.max(0, Math.abs(y - by - bh / 2) - bh / 2 + 6) / 6);
        if (e > 1) continue;
        const tart = ((x - bx) % 10 < 2) || ((y - by) % 8 < 2) ? 0x5a0e1a : 0xb83040, top = y < by + 3;
        put(x, y, x === bx + bw - 1 || y === by + bh - 1 ? 0x1a1020 : top ? 0xd85a5a : tart);
      }
      for (let y = by; y < by + 6; y++) for (let x = bx; x < bx + 26; x++) put(x, y, (x + y) % 4 ? 0x5a8ac8 : 0x3a6aa8);   // the bag's turned-down top
      // the mug, the comic
      const mx = cx + 6, my = fl + 4; for (let y = my; y < my + 9; y++) for (let x = mx; x < mx + 8; x++) put(x, y, (x === mx || x === mx + 7 || y === my + 8) ? 0x1a1020 : y === my ? 0x5a2a12 : 0xf4f0e0);
      for (let y = my + 2; y < my + 6; y++) { put(mx + 8, y, 0x1a1020); put(mx + 9, y, y === my + 2 || y === my + 5 ? 0x1a1020 : 0xf4f0e0); }
      const kx = cx + 40, ky = fl + 14; for (let y = ky; y < ky + 8; y++) for (let x = kx; x < kx + 22; x++) put(x, y, x === kx + 11 ? 0x8a8478 : (x + y * 3) % 7 < 2 ? 0x3a6aa8 : (x < kx + 11 ? 0xf4ecd8 : 0xe8e0cc));
    });
    const bg = this.add.image(0, 0, key).setOrigin(0).setScale(z).setDepth(0);
    if (!this.textures.exists('tent_pool')) {                         // a soft round pool of light (and its inverse, the dark)
      const T = this.textures.createCanvas('tent_pool', 256, 256), c = T.getContext(), gr = c.createRadialGradient(128, 128, 0, 128, 128, 128);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.7, 'rgba(255,255,255,0.15)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = gr; c.fillRect(0, 0, 256, 256); T.refresh();
      const D = this.textures.createCanvas('tent_dark', 256, 256), d = D.getContext(), g2 = d.createRadialGradient(128, 128, 0, 128, 128, 128);
      g2.addColorStop(0, 'rgba(255,255,255,1)'); g2.addColorStop(0.45, 'rgba(200,170,150,1)'); g2.addColorStop(1, 'rgba(40,24,40,1)');
      d.fillStyle = g2; d.fillRect(0, 0, 256, 256); D.refresh();
    }
    // the moving parts
    const P = (ax, ay) => ({ x: ax * z, y: ay * z });
    this.lampIm = this.add.image(0, 0, 'tent_lantern').setScale(z).setDepth(3).setOrigin(0.5, 0);
    this.shade = this.add.image(0, 0, 'tent_dark').setDepth(1.4).setBlendMode(Phaser.BlendModes.MULTIPLY);   // dark away from the lantern
    this.glow = this.add.image(0, 0, 'tent_pool').setDepth(1.5).setBlendMode(Phaser.BlendModes.ADD).setTint(0x8a5020);
    this.glow2 = this.add.image(0, 0, 'tent_pool').setDepth(1.5).setBlendMode(Phaser.BlendModes.ADD).setTint(0x7a2a08);   // the fire, through the flap
    this.dark = this.add.graphics().setDepth(1.45);
    this.strG = this.add.graphics().setDepth(2.5);
    const head = this.textures.exists('c_head') ? 'c_head' : 'fm_wedge';
    this.head = this.add.image(P(cx - 100, fl - 1).x, P(cx - 100, fl - 1).y, head).setScale(z * 0.5).setRotation(-1.35).setDepth(3);
    this.dog = this.textures.exists('cf_dog0') ? this.add.image(P(cx + 4, fl - 1).x, P(cx + 4, fl - 1).y, 'cf_dog0').setOrigin(0.5, 1).setScale(z * 0.55).setFlipX(true).setDepth(3) : null;
    if (this.textures.exists('bessie')) this.add.image(P(cx - 44, 49).x, P(cx - 44, 49).y, 'bessie').setScale(z * 0.22).setDepth(1.2);
    this.fxG = this.add.graphics().setDepth(4);
    const f = { fontFamily: PIXEL, fontSize: Math.max(8, Math.round(z * 3)) + 'px', color: '#fff0c8', stroke: '#1a1020', strokeThickness: 4, align: 'center', wordWrap: { width: Math.min(W - 60, 520) } };
    this.capT = this.add.text(W / 2, H - 18, '', f).setOrigin(0.5, 1).setDepth(6).setAlpha(0);
    this.zT = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: Math.round(z * 3) + 'px', color: '#c8d4ff', stroke: '#1a1020', strokeThickness: 3 }).setDepth(5);
    const ob = this.add.text(W - 10, 10, 'CRAWL OUT', { fontFamily: PIXEL, fontSize: '9px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 3, backgroundColor: '#3a1a0c', padding: { x: 8, y: 6 } }).setOrigin(1, 0).setDepth(7);
    // what you can tap (screen boxes)
    const B = (id, ax, ay, aw2, ah2) => ({ id, x: ax * z, y: ay * z, w: aw2 * z, h: ah2 * z });
    this.hits = [
      { id: 'out', x: ob.x - ob.width, y: ob.y, w: ob.width, h: ob.height },
      B('lantern', cx - 14, 6, 28, 40), B('radio', cx + 20, fl - 28, 26, 30), B('photo', cx - 56, 38, 24, 26), B('mug', cx + 2, fl, 14, 14),
      B('book', cx + 38, fl + 10, 26, 14), B('dog', cx - 14, fl - 22, 32, 24), B('chris', cx - 112, fl - 18, 100, 26), B('flap', Math.round(aw * 0.8) - 20, 26, aw - Math.round(aw * 0.8) + 20, ah - 60)
    ];
    // fairy lights along the back wall's two edges
    this.bulbs = []; for (let k = 1; k < 14; k++) { const u = k / 14; for (const s of [-1, 1]) this.bulbs.push({ x: cx + s * u * wide * 0.92, y: apex + 3 + u * (fl - apex) * 0.92 - Math.sin(u * Math.PI * 3) * 1.5, c: [0xff6a6a, 0xffd23f, 0x7dff8a, 0x5ce1ff, 0xff6ad0][(k + (s > 0 ? 2 : 0)) % 5], ph: Math.random() * 6 }); }
    this.stars = []; for (let k = 0; k < 14; k++) this.stars.push({ x: aw * 0.8 + 6 + Math.random() * (aw * 0.2 - 12), y: 30 + Math.random() * (fl - 52), ph: Math.random() * 6 });
  }
  say(text) { this.capT.setText(text).setAlpha(0); this.cap = { t: 0, life: 3.6 + text.length * 0.03 }; }
  line(id) { const L = TENT_SAYS[id], i = (this.saysI[id] = ((this.saysI[id] === undefined ? -1 : this.saysI[id]) + 1) % L.length); return L[i]; }
  tap(id) {
    if (this.going) return;
    const z = this.z, G = this.geo;
    if (id === 'out') { this.out(); return; }
    if (id === 'lantern') { this.lampTo = this.lampTo > 0.5 ? 0.12 : 1; Sound.sfx('blip'); this.say(this.lampTo > 0.5 ? 'Light on.' : 'Lights low. Just the fairy lights now. Cosy.'); return; }
    if (id === 'radio') { this.radio = !this.radio; Sound.music(this.radio ? 'tent' : null); Sound.sfx('blip'); this.say(this.radio ? TENT_SAYS.radio[0] : 'Click. Just the fire crackling now.'); return; }
    if (id === 'dog') { Sound.sfx('pickup'); this.dogWag = 1.2; for (let k = 0; k < 5; k++) this.parts.push({ kind: 'heart', x: (G.cx + 2) * z, y: (G.fl - 16) * z, vx: (Math.random() - 0.5) * 30, vy: -30 - Math.random() * 30, life: 1.6 }); }
    if (id === 'mug') { Sound.sfx('squish'); for (let k = 0; k < 8; k++) this.parts.push({ kind: 'steam', x: (G.cx + 10) * z, y: G.fl * z, vx: (Math.random() - 0.5) * 12, vy: -20 - Math.random() * 20, life: 1.4 }); }
    if (id === 'chris') { this.headNod = 1; Sound.sfx('jump'); }
    if (id === 'flap') { this.shoot = { x: (this.aw - 6) * z, y: 34 * z, life: 0.9 }; Sound.sfx('chime'); }
    this.say(this.line(id));
  }
  out() {
    if (this.going) return; this.going = true; Sound.sfx('whoosh'); Sound.music(null); this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(430, () => this.scene.start('level1', { camp: true, at: -0.42 }));
  }
  update(time, delta) {
    const dt = Math.min(0.05, delta / 1000), z = this.z, G = this.geo, t = (this.t += dt);
    this.lamp += (this.lampTo - this.lamp) * Math.min(1, dt * 4);
    // the lantern swings gently on its string from the apex
    const sw = Math.sin(t * 1.1) * 0.12 + Math.sin(t * 0.37) * 0.05, len = 26, ax = G.cx * z + z, ay = G.apex * z;
    const lx = ax + Math.sin(sw) * len * z, ly = ay + Math.cos(sw) * len * z;
    this.lampIm.setPosition(lx, ly).setRotation(-sw).setAlpha(0.6 + this.lamp * 0.4);
    const s = this.strG; s.clear(); s.lineStyle(z, 0x1a1020, 1).lineBetween(ax, ay, lx, ly);
    const flick = 1 + Math.sin(t * 13) * 0.03 + Math.sin(t * 7.3) * 0.03;
    const W = this.scale.width, H = this.scale.height, pr = Math.max(W, H) * 1.5 / 256;
    this.shade.setPosition(lx, ly + 20 * z).setScale(pr * (0.75 + this.lamp * 0.35) * flick).setAlpha(1);
    this.glow.setPosition(lx, ly + 8 * z).setScale(W * 0.55 / 256 * flick * (0.4 + this.lamp * 0.6)).setAlpha(0.55 * this.lamp + 0.05);
    this.glow2.setPosition((this.aw - 16) * z, (G.fl - 2) * z).setScale(W * 0.22 / 256 * (1 + Math.sin(t * 9) * 0.06 + Math.sin(t * 4.1) * 0.05)).setAlpha(0.6);
    // the dark: deeper the further from the lantern (and all over when it's turned down)
    const d = this.dark; d.clear();
    d.fillStyle(0x05020a, 0.5 * (1 - this.lamp)).fillRect(0, 0, this.scale.width, this.scale.height);
    // breathing: Chris's head rises and falls, Biscuit too; Zzz drifting up
    this.headNod = Math.max(0, (this.headNod || 0) - dt * 2);
    this.head.setY((G.fl - 1) * z - Math.sin(t * 1.6) * z * 0.7).setRotation(-1.35 + Math.sin(this.headNod * 12) * 0.1 * this.headNod);
    if (this.dog) { this.dogWag = Math.max(0, (this.dogWag || 0) - dt); this.dog.setScale(z * 0.55 * (1 + Math.sin(t * 2.2) * 0.02), z * 0.55 * (1 + Math.sin(t * 2.2) * 0.04)).setRotation(this.dogWag ? Math.sin(t * 30) * 0.05 : 0); }
    const zc = (t * 0.5) % 1; this.zT.setText(zc < 0.33 ? 'z' : zc < 0.66 ? 'zZ' : 'zZz').setPosition((G.cx - 98) * z + zc * 10 * z, (G.fl - 14) * z - zc * 14 * z).setAlpha(Math.sin(zc * Math.PI) * 0.9);
    // fairy lights twinkling, stars through the flap, steam off the mug
    const fx = this.fxG; fx.clear();
    for (const b of this.bulbs) { const on = 0.55 + 0.45 * Math.sin(t * 2 + b.ph); fx.fillStyle(b.c, on * (0.12 + (1 - this.lamp) * 0.22)).fillRect(b.x * z - z, b.y * z - z, 3 * z, 3 * z); fx.fillStyle(b.c, 0.55 + on * 0.45).fillRect(b.x * z, b.y * z, z, z); fx.fillStyle(0x1a1020, 1).fillRect(b.x * z, b.y * z - z, z, z); }
    for (const st of this.stars) { const a = 0.5 + 0.5 * Math.sin(t * 2.5 + st.ph); fx.fillStyle(0xffffff, a * (0.6 + (1 - this.lamp) * 0.4)).fillRect(Math.round(st.x) * z, Math.round(st.y) * z, z, z); }
    if (this.shoot) { const q = this.shoot; q.life -= dt; q.x -= 160 * z * dt; q.y += 50 * z * dt; for (let k = 0; k < 6; k++) fx.fillStyle(k ? 0xb4d8ff : 0xffffff, Math.max(0, q.life) * (1 - k / 7)).fillRect(Math.round((q.x + k * 3 * z) / z) * z, Math.round((q.y - k * z) / z) * z, z, z); if (q.life <= 0) this.shoot = null; }
    if (Math.random() < dt * 2.5) this.parts.push({ kind: 'steam', x: (G.cx + 9 + Math.random() * 3) * z, y: (G.fl + 2) * z, vx: (Math.random() - 0.5) * 6, vy: -12 - Math.random() * 8, life: 1.6 });
    if (this.radio && Math.random() < dt * 0.8) this.parts.push({ kind: 'note', x: (G.cx + 30) * z, y: (G.fl - 18) * z, vx: 6 + Math.random() * 8, vy: -14, life: 2 });
    for (const p of this.parts) {
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; const a = Math.min(1, p.life);
      if (p.kind === 'steam') fx.fillStyle(0xf4f0e0, a * 0.35).fillRect(Math.round(p.x / z) * z, Math.round(p.y / z) * z, z, z * 2);
      else if (p.kind === 'heart') { fx.fillStyle(0xff6a8a, a).fillRect(p.x - z, p.y, z, z).fillRect(p.x + z, p.y, z, z).fillRect(p.x - z * 1.5, p.y + z, z * 4, z).fillRect(p.x - z * 0.5, p.y + 2 * z, z * 2, z); }
      else if (p.kind === 'note') { fx.fillStyle(0xffd23f, a * 0.8).fillRect(p.x, p.y, z, z * 3).fillRect(p.x - z, p.y + 2 * z, z * 2, z * 1.5).fillRect(p.x, p.y, z * 2, z); }
    }
    this.parts = this.parts.filter(p => p.life > 0);
    // the caption fades in and out
    if (this.cap) { this.cap.t += dt; const C = this.cap; this.capT.setAlpha(Math.min(1, C.t * 3, (C.life - C.t) * 2)); if (C.t > C.life) { this.cap = null; this.capT.setAlpha(0); } }
  }
}
