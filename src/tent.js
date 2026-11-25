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
  radio: ['A little lullaby on the moon station.', 'Click.'],
  mobile: ['Mooo-bile. Zib made it.', 'Round and round go the Bessies.', 'Wheee! Four tiny cows!', 'One day the real one will be home.'],
  lantern: []
};

function makeTentTextures(scene) {
  const rect = (put, x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, c); };
  pixTex(scene, 'tent_lantern', 11, 15, put => {                 // a little camping lantern (it sits on the crate)
    rect(put, 4, 0, 6, 1, 0x1a1020); rect(put, 2, 2, 8, 3, 0x1a1020); rect(put, 3, 2, 7, 2, 0x8a6a48);
    rect(put, 1, 4, 9, 11, 0x1a1020); rect(put, 2, 5, 8, 10, 0xffe080); rect(put, 3, 6, 7, 9, 0xfff6c0); rect(put, 4, 7, 6, 9, 0xffb04a); put(5, 6, 0xffffff);
    for (const x of [2, 5, 8]) rect(put, x, 5, x, 10, 0x5a4838);
    rect(put, 1, 12, 9, 14, 0x1a1020); rect(put, 2, 12, 8, 13, 0x8a6a48);
  });
  pixTex(scene, 'tent_chris', 30, 20, put => {                   // Chris asleep on his pillow, chef's hat worn as a nightcap
    const INK = 0x1a1020, SK = [0xc07858, 0xe8a07a, 0xffc8a0], HAT = [0xc8c4d4, 0xf4f0f8, 0xffffff], MO = [0x3a2010, 0x6a3a1a, 0x8a5a2a];
    for (let y = 0; y < 20; y++) for (let x = 0; x < 30; x++) {
      const face = Math.hypot((x - 17) / 8.5, (y - 12) / 7.5) <= 1, hat = Math.hypot((x - 9) / 9, (y - 7) / 6.5) <= 1 && x < 16, tip = Math.hypot(x - 2.5, y - 14) <= 2.4;
      if (tip) { put(x, y, Math.hypot(x - 2, y - 13.5) < 1.2 ? 0xfff6c0 : 0xffd23f); continue; }
      if (hat) { put(x, y, (x + y) % 5 === 0 ? HAT[0] : x + y < 12 ? HAT[2] : HAT[1]); continue; }
      if (face) { put(x, y, y < 9 ? SK[2] : x > 21 ? SK[0] : SK[1]); continue; }
    }
    rect(put, 15, 10, 18, 10, INK); rect(put, 21, 10, 23, 10, INK);           // closed eyes
    rect(put, 18, 9, 19, 9, SK[0]); put(25, 12, SK[0]); put(26, 13, SK[0]);    // brow, nose
    rect(put, 22, 15, 24, 15, 0xff8a8a);                                        // rosy cheek
    for (let x = 14; x < 27; x++) { const h = 2 - Math.abs(x - 20) / 4; rect(put, x, Math.round(15 - h / 2), x, Math.round(15 + h), x < 16 || x > 25 ? MO[0] : MO[(x % 3 === 0) ? 2 : 1]); }   // THE moustache
  });
}

class TentScene extends Phaser.Scene {
  constructor() { super('tent'); }
  create() {
    makeTextures(this); makeTentTextures(this); if (typeof makeFruityTextures === 'function') makeFruityTextures(this);
    this.cameras.main.setBackgroundColor('#0a0608'); this.cameras.main.fadeIn(500, 0, 0, 0);
    Sound.init(); this.radio = true; Sound.music('tent');
    this.lamp = 1; this.lampTo = 1; this.t = 0; this.saysI = {}; this.parts = []; this.cap = null; this.going = false;
    this.mob = { a: 0, v: 0.5 };                                   // the cow mobile: angle and spin
    if (typeof Ach !== 'undefined') Ach.unlock('snug');
    this.build();
    this.scale.on('resize', this.build, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.build, this));
    const kb = this.input.keyboard;
    if (kb) { kb.on('keydown-ESC', () => this.out()); kb.on('keydown-SPACE', () => this.tap('mobile')); kb.on('keydown-L', () => this.tap('lantern')); kb.on('keydown-R', () => this.tap('radio')); }
    const padOff = typeof Pad !== 'undefined' ? Pad.on(b => { if (b === 'b' || b === 'back') this.out(); else if (b === 'a') this.tap('chris'); else if (b === 'x') this.tap('mobile'); else if (b === 'y') this.tap('lantern'); else if (b === 'lb' || b === 'rb') this.tap('radio'); else if (b === 'left' || b === 'right') this.tap('dog'); }) : null;
    if (padOff) this.events.once('shutdown', padOff);
    this.input.on('pointerdown', p => { const h = (this.hits || []).find(q => p.x >= q.x && p.x <= q.x + q.w && p.y >= q.y && p.y <= q.y + q.h); if (h) this.tap(h.id); });
    this.time.delayedCall(900, () => this.say('Ahh. Safe and snug.'));
  }
  // ---- a little pup tent: big chunky pixels, the canvas sloping in from both edges, a low ridge
  build() {
    const W = this.scale.width, H = this.scale.height, z = Math.max(3, Math.floor(H / 96)), aw = Math.ceil(W / z), ah = Math.ceil(H / z);
    this.z = z; this.aw = aw; this.ah = ah;
    this.children.removeAll(true); this.parts = [];
    const cx = Math.round(aw / 2), fl = ah - 22, apex = 3, back = Math.round(Math.min(aw * 0.2, 46));   // the back wall's half-width at the floor
    this.geo = { cx, fl, apex, back };
    const key = 'tent_bg'; if (this.textures.exists(key)) this.textures.remove(key);
    pixTex(this, key, aw, ah, put => {
      const FAB = [0x24100a, 0x3a1a0c, 0x5a2a12, 0x7a3a16, 0x9a4c1a, 0xc0622a];
      const pick = (R, f, x, y) => { f = Math.max(0, Math.min(R.length - 1, f)); const i = Math.floor(f); return R[Math.min(R.length - 1, i + ((f - i) * 16 > bay(x, y) ? 1 : 0))]; };
      const rnd = rng(77), n1 = vnoise(rnd, 6);
      const dW = 9, dTop = 18;                                       // the zipped-back door in the back wall
      for (let y = 0; y < ah; y++) for (let x = 0; x < aw; x++) {
        const dx = x - cx, bh = (y - apex) / (fl - apex) * back, sw = (y - apex) / (fl - apex) * (aw * 0.62);
        let c;
        if (y >= fl) c = pick([0x10141e, 0x181e2c, 0x222a3a], 1.1 + (y - fl) / 14 + (n1(x / aw * 2, y / ah) - 0.5) * 0.8, x, y);   // groundsheet
        else if (y >= apex && Math.abs(dx) <= bh) {                 // the back wall
          c = pick(FAB, 2.1 - Math.abs(dx) / back * 0.6 + (n1(x / aw * 3, y / ah * 2) - 0.5) * 0.6, x, y);
          const dh = (y - dTop) / (fl - dTop) * dW;                  // the door: a triangle of night, the fire low down
          if (y > dTop && Math.abs(dx) < dh) c = y > fl - 5 ? pick([0x7a2a08, 0xc05a12, 0xffa030], 2.4 - (fl - y) * 0.5 + Math.sin(x) * 0.3, x, y) : pick([0x080a1c, 0x101844, 0x2a1a3a, 0x5a2a1a], (y - dTop) / (fl - dTop) * 3.4, x, y);
          else if (y > dTop - 1 && Math.abs(Math.abs(dx) - dh) < 1.4) c = 0x1a0a06;   // the zip
        } else if (y >= apex && Math.abs(dx) <= sw) {               // the two side walls, close, sloping in
          const k = (Math.abs(dx) - bh) / Math.max(1, sw - bh);
          c = pick(FAB, 2.4 - k * 1.7 + (n1(x / aw * 4, y / ah * 1.5) - 0.5) * 0.7, x, y);
          if (Math.abs(((Math.abs(dx) - bh) / 9 + y / 30) % 1 - 0.5) < 0.04) c = FAB[1];   // seams
        } else c = pick(FAB, 0.4 + (n1(x / aw, y / ah) - 0.5), x, y);   // right up close: the canvas in shadow
        put(x, y, c);
      }
      for (let x = cx - 2; x <= cx + 2; x++) put(x, apex, 0x6a4a2a);  // the ridge pole's end
      // Bessie's photo pinned to the back wall (the picture's a sprite)
      const px = cx - back + 10, py = 26; for (let y = py; y < py + 14; y++) for (let x = px; x < px + 12; x++) put(x, y, (x === px || y === py || x === px + 11 || y === py + 13) ? 0x1a1020 : (y > py + 10 ? 0xf4ecd8 : 0x8ac8f0)); put(px + 6, py - 1, 0xd83a2a);
      // the camp bed: legs, a mattress, a patchwork quilt, a plump pillow
      const bx = Math.round(aw * 0.14), bw = Math.round(aw * 0.52), by = fl - 13;
      for (let y = by + 10; y < fl + 4; y++) for (const lx of [bx + 2, bx + bw - 4]) { put(lx, y, 0x3a2418); put(lx + 1, y, 0x6a4a2a); }
      for (let y = by + 8; y < by + 11; y++) for (let x = bx; x < bx + bw; x++) put(x, y, y === by + 10 ? 0x1a1020 : 0xe8e0cc);          // mattress edge
      for (let y = by - 4; y < by + 6; y++) for (let x = bx - 2; x < bx + 18; x++) if (Math.hypot((x - bx - 8) / 10, (y - by - 1) / 5.5) <= 1) put(x, y, Math.hypot((x - bx - 8) / 10, (y - by - 1) / 5.5) > 0.86 ? 0xb8b0c4 : (x + y) % 6 ? 0xfaf6ee : 0xe4dcd0);   // pillow
      const Q = [[0xffd23f, 0xc8902a], [0x3a6aa8, 0x2a4a80], [0xd83a2a, 0x8a1a1a], [0xf4ecd8, 0xc8bfa8], [0x2aa04a, 0x1a6a2a]];
      for (let y = by - 1; y < by + 9; y++) for (let x = bx + 14; x < bx + bw; x++) {               // the quilt, tucked over him
        const top = y < by + 1 + Math.sin((x - bx) * 0.25) * 0.6, cell = Q[(Math.floor((x - bx) / 7) + Math.floor((y - by + 1) / 5) * 2) % 5];
        if (top) { put(x, y, x === bx + bw - 1 ? 0x1a1020 : cell[0] === 0xf4ecd8 ? 0xffffff : cell[0]); continue; }
        put(x, y, x === bx + bw - 1 || y === by + 8 ? 0x1a1020 : ((x - bx) % 7 === 0 || (y - by + 1) % 5 === 0) ? 0xf4ecd8 : (x + y) % 2 ? cell[0] : cell[1]);
      }
      for (let x = bx + 14; x < bx + 30; x++) put(x, by - 1, 0x1a1020);
      // the crate by the bed (the lantern sits on it), the radio, the mug, the comic
      const kx = bx + bw + 8, ky = fl - 12; for (let y = ky; y < fl + 2; y++) for (let x = kx; x < kx + 16; x++) put(x, y, (x === kx || x === kx + 15 || y === ky || y === fl + 1) ? 0x1a1020 : (y - ky) % 4 === 0 ? 0x3a2418 : 0x8a6a48);
      const rx = kx + 20, ry = fl - 6; for (let y = ry; y < fl + 2; y++) for (let x = rx; x < rx + 13; x++) put(x, y, (x === rx || x === rx + 12 || y === ry || y === fl + 1) ? 0x1a1020 : (x > rx + 6 && (x + y) % 2) ? 0x3a3448 : 0x8a2a2a);
      for (let k = 0; k < 6; k++) put(rx + 3 + k, ry - 1 - k, 0x9aa4b8); for (let x = rx + 2; x < rx + 6; x++) put(x, ry + 3, 0xffd23f);
      const mx = kx + 11, my = ky - 5; for (let y = my; y < ky; y++) for (let x = mx; x < mx + 4; x++) put(x, y, (x === mx || x === mx + 3) ? 0x1a1020 : y === my ? 0x5a2a12 : 0xf4f0e0); put(mx + 4, my + 2, 0x1a1020);
      for (let y = fl + 3; y < ah; y++) for (let x = bx + 4; x < bx + bw + 30; x++) { const d = Math.hypot((x - bx - bw / 2 - 12) / (bw / 2 + 14), (y - fl - 10) / 8); if (d <= 1) put(x, y, [0x5a1a2a, 0x8a3a2a, 0xc8902a, 0x8a3a2a, 0x3a6aa8, 0x5a1a2a][Math.min(5, Math.floor(d * 6))]); }   // a rag rug
      const ox = bx + 16, oy = fl + 7; for (let y = oy; y < oy + 5; y++) for (let x = ox; x < ox + 14; x++) put(x, y, x === ox + 7 ? 0x8a8478 : (x + y * 3) % 7 < 2 ? 0x3a6aa8 : 0xf4ecd8);
      this.geo.bed = { bx, bw, by }; this.geo.crate = { kx, ky }; this.geo.radio = { rx, ry }; this.geo.mug = { mx, my }; this.geo.photo = { px, py };
    });
    this.add.image(0, 0, key).setOrigin(0).setScale(z).setDepth(0);
    if (!this.textures.exists('tent_pool')) {
      const T = this.textures.createCanvas('tent_pool', 256, 256), c = T.getContext(), gr = c.createRadialGradient(128, 128, 0, 128, 128, 128);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.7, 'rgba(255,255,255,0.15)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = gr; c.fillRect(0, 0, 256, 256); T.refresh();
      const D = this.textures.createCanvas('tent_dark', 256, 256), d = D.getContext(), g2 = d.createRadialGradient(128, 128, 0, 128, 128, 128);
      g2.addColorStop(0, 'rgba(255,255,255,1)'); g2.addColorStop(0.45, 'rgba(200,170,150,1)'); g2.addColorStop(1, 'rgba(40,24,40,1)');
      d.fillStyle = g2; d.fillRect(0, 0, 256, 256); D.refresh();
    }
    const G = this.geo, P = (ax, ay) => [ax * z, ay * z];
    this.shade = this.add.image(0, 0, 'tent_dark').setDepth(1.4).setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.glow = this.add.image(0, 0, 'tent_pool').setDepth(1.5).setBlendMode(Phaser.BlendModes.ADD).setTint(0x8a5020);
    this.glow2 = this.add.image(0, 0, 'tent_pool').setDepth(1.5).setBlendMode(Phaser.BlendModes.ADD).setTint(0x7a2a08);
    this.dark = this.add.graphics().setDepth(1.45);
    this.lampIm = this.add.image(...P(G.crate.kx + 5, G.crate.ky), 'tent_lantern').setOrigin(0.5, 1).setScale(z).setDepth(3);
    this.head = this.add.image(...P(G.bed.bx + 11, G.bed.by + 3), 'tent_chris').setOrigin(0.5, 1).setScale(Math.max(2, z - 1)).setDepth(3);
    this.dog = this.textures.exists('cf_dog0') ? this.add.image(...P(G.bed.bx + G.bed.bw - 10, G.bed.by + 2), 'cf_dog0').setOrigin(0.5, 1).setScale(z * 0.4).setFlipX(true).setDepth(3) : null;
    if (this.textures.exists('bessie')) this.add.image(...P(G.photo.px + 6, G.photo.py + 6), 'bessie').setScale(z * 0.13).setDepth(1.2);
    this.mobG = this.add.graphics().setDepth(3.6); this.cows = [0, 1, 2, 3].map(() => this.add.image(0, 0, 'fm_bessie').setDepth(3.7));
    this.fxG = this.add.graphics().setDepth(4);
    const f = { fontFamily: PIXEL, fontSize: Math.max(8, Math.round(z * 2.4)) + 'px', color: '#fff0c8', stroke: '#1a1020', strokeThickness: 4, align: 'center', wordWrap: { width: Math.min(W - 60, 520) } };
    this.capT = this.add.text(W / 2, H - 10, '', f).setOrigin(0.5, 1).setDepth(6).setAlpha(0);
    this.zT = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: Math.round(z * 2.4) + 'px', color: '#c8d4ff', stroke: '#1a1020', strokeThickness: 3 }).setDepth(5);
    const ob = this.add.text(W - 10, 10, 'CRAWL OUT (B)', { fontFamily: PIXEL, fontSize: '9px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 3, backgroundColor: '#3a1a0c', padding: { x: 8, y: 6 } }).setOrigin(1, 0).setDepth(7);
    const B = (id, ax, ay, w2, h2) => ({ id, x: ax * z, y: ay * z, w: w2 * z, h: h2 * z });
    this.hits = [
      { id: 'out', x: ob.x - ob.width, y: ob.y, w: ob.width, h: ob.height },
      B('mobile', G.cx - 22, G.apex, 44, 34), B('lantern', G.crate.kx, G.crate.ky - 16, 12, 16), B('mug', G.mug.mx - 2, G.mug.my - 2, 8, 8), B('radio', G.radio.rx - 2, G.radio.ry - 8, 16, 16),
      B('photo', G.photo.px - 2, G.photo.py - 2, 16, 18), B('book', G.bed.bx + 14, G.fl + 5, 18, 9), B('dog', G.bed.bx + G.bed.bw - 22, G.bed.by - 12, 24, 16),
      B('chris', G.bed.bx - 4, G.bed.by - 18, G.bed.bw - 20, 30), B('flap', G.cx - 10, 18, 20, G.fl - 18)
    ];
    // fairy lights along the back wall's two roof edges
    this.bulbs = []; for (let k = 1; k < 11; k++) { const u = k / 11; for (const sd of [-1, 1]) this.bulbs.push({ x: G.cx + sd * u * G.back * 0.95, y: G.apex + 2 + u * (G.fl - G.apex) * 0.95, c: [0xff6a6a, 0xffd23f, 0x7dff8a, 0x5ce1ff, 0xff6ad0][(k + (sd > 0 ? 2 : 0)) % 5], ph: Math.random() * 6 }); }
    this.stars = []; for (let k = 0; k < 6; k++) this.stars.push({ x: G.cx + (Math.random() - 0.5) * 8, y: 26 + Math.random() * (G.fl - 40), ph: Math.random() * 6 });
  }
  say(text) { this.capT.setText(text).setAlpha(0); this.cap = { t: 0, life: 3.6 + text.length * 0.03 }; }
  line(id) { const L = TENT_SAYS[id], i = (this.saysI[id] = ((this.saysI[id] === undefined ? -1 : this.saysI[id]) + 1) % L.length); return L[i]; }
  tap(id) {
    if (this.going) return;
    const z = this.z, G = this.geo;
    if (id === 'out') { this.out(); return; }
    if (id === 'lantern') { this.lampTo = this.lampTo > 0.5 ? 0.15 : 1; Sound.sfx('blip'); this.say(this.lampTo > 0.5 ? 'Light on.' : 'Lights low. Just the fairy lights now. Cosy.'); return; }
    if (id === 'radio') { this.radio = !this.radio; Sound.music(this.radio ? 'tent' : null); Sound.sfx('blip'); this.say(this.radio ? TENT_SAYS.radio[0] : 'Click. Just the fire crackling now.'); return; }
    if (id === 'mobile') { this.mob.v = Math.min(14, this.mob.v + 5); Sound.sfx('chime'); this.time.delayedCall(150, () => Sound.sfx('blip')); }
    if (id === 'dog') { Sound.sfx('pickup'); this.dogWag = 1.2; for (let k = 0; k < 5; k++) this.parts.push({ kind: 'heart', x: this.dog ? this.dog.x : 0, y: this.dog ? this.dog.y - 10 * z : 0, vx: (Math.random() - 0.5) * 30, vy: -30 - Math.random() * 30, life: 1.6 }); }
    if (id === 'mug') { Sound.sfx('squish'); for (let k = 0; k < 8; k++) this.parts.push({ kind: 'steam', x: (G.mug.mx + 2) * z, y: G.mug.my * z, vx: (Math.random() - 0.5) * 12, vy: -20 - Math.random() * 20, life: 1.4 }); }
    if (id === 'chris') { this.headNod = 1; Sound.sfx('jump'); }
    if (id === 'flap') { this.shoot = { x: (G.cx + 6) * z, y: 24 * z, life: 0.7 }; Sound.sfx('chime'); }
    this.say(this.line(id));
  }
  out() {
    if (this.going) return; this.going = true; Sound.sfx('whoosh'); Sound.music(null); this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(430, () => this.scene.start('level1', { camp: true, at: -0.42 }));
  }
  update(time, delta) {
    const dt = Math.min(0.05, delta / 1000), z = this.z, G = this.geo, t = (this.t += dt), W = this.scale.width, H = this.scale.height;
    this.lamp += (this.lampTo - this.lamp) * Math.min(1, dt * 4);
    // the light: a warm pool from the lantern on the crate, dark in the corners, the fire glowing in the doorway
    const lx = this.lampIm.x, ly = this.lampIm.y - 7 * z, flick = 1 + Math.sin(t * 13) * 0.03 + Math.sin(t * 7.3) * 0.03;
    this.lampIm.setAlpha(0.6 + this.lamp * 0.4);
    this.shade.setPosition(lx - 20 * z, ly).setScale(Math.max(W, H) * 1.4 / 256 * (0.75 + this.lamp * 0.35) * flick);
    this.glow.setPosition(lx, ly).setScale(W * 0.5 / 256 * flick * (0.4 + this.lamp * 0.6)).setAlpha(0.6 * this.lamp + 0.05);
    this.glow2.setPosition(G.cx * z, (G.fl - 2) * z).setScale(W * 0.14 / 256 * (1 + Math.sin(t * 9) * 0.06 + Math.sin(t * 4.1) * 0.05)).setAlpha(0.6);
    this.dark.clear().fillStyle(0x05020a, 0.5 * (1 - this.lamp)).fillRect(0, 0, W, H);
    // breathing: Chris rises and falls, Biscuit too; Zzz
    this.headNod = Math.max(0, (this.headNod || 0) - dt * 2);
    this.head.setY((G.bed.by + 3) * z - Math.round(Math.sin(t * 1.6) * 0.6 + 0.5) * z).setRotation(Math.sin(this.headNod * 12) * 0.08 * this.headNod);
    if (this.dog) { this.dogWag = Math.max(0, (this.dogWag || 0) - dt); this.dog.setScale(z * 0.4, z * 0.4 * (1 + Math.sin(t * 2.2) * 0.04)).setRotation(this.dogWag ? Math.sin(t * 30) * 0.05 : 0); }
    const zc = (t * 0.5) % 1; this.zT.setText(zc < 0.33 ? 'z' : zc < 0.66 ? 'zZ' : 'zZz').setPosition((G.bed.bx + 24) * z + zc * 8 * z, (G.bed.by - 10) * z - zc * 12 * z).setAlpha(Math.sin(zc * Math.PI) * 0.9);
    // the cow mobile: a hub on a string from the ridge, four arms, a little Bessie on each, turning (and swaying)
    const M = this.mob; M.v += (0.5 - M.v) * Math.min(1, dt * 0.35); M.a += M.v * dt;
    const g = this.mobG; g.clear();
    const hx = G.cx * z + Math.sin(t * 0.9) * z, hy = (G.apex + 10) * z, rad = 15 * z;
    g.lineStyle(Math.max(1, z / 2), 0xd8c8a0, 1).lineBetween(G.cx * z, (G.apex + 1) * z, hx, hy);
    const cs = [0, 1, 2, 3].map(k => { const a = M.a + k * Math.PI / 2; return { k, x: hx + Math.cos(a) * rad, d: Math.sin(a), len: (7 + (k % 2) * 4) * z }; }).sort((a, b) => a.d - b.d);
    g.lineStyle(z, 0x8a6a48, 1).lineBetween(hx - rad, hy, hx + rad, hy); g.fillStyle(0xffd23f, 1).fillRect(hx - z, hy - z, 2 * z, 2 * z);
    cs.forEach((c, i) => {
      const sc = z * 0.36 * (0.8 + 0.2 * (c.d + 1) / 2), y = hy + c.len + Math.sin(t * 2 + c.k) * z * 0.5;
      g.lineStyle(Math.max(1, z / 2), 0xd8c8a0, 0.9).lineBetween(c.x, hy, c.x, y - 8 * sc);
      this.cows[c.k].setPosition(Math.round(c.x), Math.round(y)).setScale(sc).setDepth(3.7 + i * 0.01).setAlpha(0.75 + 0.25 * (c.d + 1) / 2).setFlipX(Math.cos(M.a + c.k * Math.PI / 2) < 0);
    });
    // fairy lights, stars in the doorway, steam, music notes, a shooting star
    const fx = this.fxG; fx.clear();
    for (const b of this.bulbs) { const on = 0.55 + 0.45 * Math.sin(t * 2 + b.ph); fx.fillStyle(b.c, on * (0.12 + (1 - this.lamp) * 0.22)).fillRect(b.x * z - z, b.y * z - z, 3 * z, 3 * z); fx.fillStyle(b.c, 0.55 + on * 0.45).fillRect(b.x * z, b.y * z, z, z); fx.fillStyle(0x1a1020, 1).fillRect(b.x * z, b.y * z - z, z, z); }
    for (const st of this.stars) { const a = 0.5 + 0.5 * Math.sin(t * 2.5 + st.ph), dh = (st.y - 18) / (G.fl - 18) * 9; if (Math.abs(st.x - G.cx) < dh - 1) fx.fillStyle(0xffffff, a * (0.6 + (1 - this.lamp) * 0.4)).fillRect(Math.round(st.x) * z, Math.round(st.y) * z, z, z); }
    if (this.shoot) { const q = this.shoot; q.life -= dt; q.x -= 40 * z * dt; q.y += 30 * z * dt; fx.fillStyle(0xffffff, Math.max(0, q.life)).fillRect(Math.round(q.x / z) * z, Math.round(q.y / z) * z, 2 * z, z); if (q.life <= 0) this.shoot = null; }
    if (Math.random() < dt * 2.5) this.parts.push({ kind: 'steam', x: (G.mug.mx + 1 + Math.random() * 2) * z, y: G.mug.my * z, vx: (Math.random() - 0.5) * 6, vy: -12 - Math.random() * 8, life: 1.4 });
    if (this.radio && Math.random() < dt * 0.8) this.parts.push({ kind: 'note', x: (G.radio.rx + 8) * z, y: (G.radio.ry - 8) * z, vx: 6 + Math.random() * 8, vy: -14, life: 2 });
    for (const p of this.parts) {
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; const a = Math.min(1, p.life);
      if (p.kind === 'steam') fx.fillStyle(0xf4f0e0, a * 0.35).fillRect(Math.round(p.x / z) * z, Math.round(p.y / z) * z, z, z * 2);
      else if (p.kind === 'heart') fx.fillStyle(0xff6a8a, a).fillRect(p.x - z, p.y, z, z).fillRect(p.x + z, p.y, z, z).fillRect(p.x - z * 1.5, p.y + z, z * 4, z).fillRect(p.x - z * 0.5, p.y + 2 * z, z * 2, z);
      else if (p.kind === 'note') fx.fillStyle(0xffd23f, a * 0.8).fillRect(p.x, p.y, z, z * 3).fillRect(p.x - z, p.y + 2 * z, z * 2, z * 1.5).fillRect(p.x, p.y, z * 2, z);
    }
    this.parts = this.parts.filter(p => p.life > 0);
    if (this.cap) { this.cap.t += dt; const C = this.cap; this.capT.setAlpha(Math.min(1, C.t * 3, (C.life - C.t) * 2)); if (C.t > C.life) { this.cap = null; this.capT.setAlpha(0); } }
  }
}
