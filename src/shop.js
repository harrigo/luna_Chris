// ---------------------------------------------------------------- THE SPACE SHOP (v2.23)
// Enemies pay out CHEDDAR. Between stages (a button on the route map) it buys things that last until GAME OVER:
//   * BLACK RIND armour (Mk I-IV): its own gauge, soaks hits before the cheese hearts do, turns Chris's suit gunmetal.
//     It does not mend itself: patch it up here. If the gauge empties it SHATTERS and has to be re-forged.
//   * MOON BOOTS (Lv 1-4): faster run, higher jump, thriftier jetpack.
//   * START CHIPS for each gun: the level that gun falls back to when a life is lost (instead of level 1).
//   * EXTRA LIVES.
// Everything lives in the registry under 'shop' and is wiped with the lives on game over.
const SHOP = {
  armHp: [0, 2, 3, 4, 5],                 // gauge size per mark
  armCost: [0, 150, 260, 400, 600],        // forging / upgrading TO this mark
  bootCost: [0, 120, 220, 350, 500],
  chipCost: [0, 180, 320, 500],            // chip 1 = that gun restarts at level 2, ... chip 3 = level 4
  setBonus: 75, lifeCost: 300, patchCost: 25, heartCost: [0, 350, 600]   // (v2.24: everything roughly 2.5x dearer)
};
// THE LUCKY WHEEL: each golden cheese wheel found is ONE spin, ever (spins used are remembered on the device). [label, weight, colour]
const SPIN = [['30', 22, 0xffb52a], ['PLATE', 14, 0x6c7690], ['60', 16, 0xff7a5a], ['RAT!', 10, 0x4a3a5a], ['30', 22, 0xffb52a], ['GUN +1', 10, 0x2ad0b8], ['500', 3, 0xff5a9a], ['LIFE', 2, 0x7dff8a]];
const Shop = {
  get(reg) { const s = reg.get('shop'); return s || { coins: SHOP.setBonus * this.goldenSets(),      // (a GOLDEN SET: every game starts with cheddar in hand)
      armMk: 0, armHp: 0, boots: 0, hearts: 0, spins: 0, chips: {} }; },
  set(reg, s) { reg.set('shop', Object.assign({}, s)); },
  reset(reg) { reg.set('shop', null); },
  earn(reg, n) { const s = this.get(reg); s.coins += n; this.set(reg, s); },
  spinsUsed() { try { return +(localStorage.getItem('lc_spins') || 0); } catch (e) { return 0; } },
  useSpin() { try { localStorage.setItem('lc_spins', String(this.spinsUsed() + 1)); } catch (e) { /* ignore */ } },
  spinsLeft() { let n = 0; for (let i = 1; i <= 9; i++) n += Progress.wheelCount(i); return Math.max(0, n - this.spinsUsed()); },
  goldenSets() { let n = 0; for (let i = 1; i <= 9; i++) if (Progress.wheelCount(i) >= 3) n++; return n; },   // levels with all 3 wheels found
  chip(reg, id) { return (this.get(reg).chips || {})[id] || 0; },
  // one hit on the armour: returns 'none' (no armour), 'held' or 'broke'
  hit(reg) {
    const s = this.get(reg); if (!(s.armHp > 0)) return 'none';
    s.armHp--; this.set(reg, s); return s.armHp > 0 ? 'held' : 'broke';
  }
};

// gunmetal copies of the suit parts: every pale, colourless pixel (the white suit, the hat) is re-shaded dark grey-blue
function makeArmourTextures(scene) {
  for (const key of ['c_tanks', 'c_leg', 'c_boot', 'c_body', 'c_arm', 'c_hat', 'c_collar']) {
    const ak = '__ar_' + key; if (scene.textures.exists(ak) || !scene.textures.exists(key)) continue;
    const fr = scene.textures.getFrame(key), w = fr.cutWidth, h = fr.cutHeight;
    const ct = scene.textures.createCanvas(ak, w, h), ctx = ct.getContext();
    ctx.drawImage(fr.source.image, fr.cutX, fr.cutY, w, h, 0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h), D = img.data;
    const ramp = [[0x10, 0x12, 0x1a], [0x1a, 0x1e, 0x2a], [0x26, 0x2b, 0x3b], [0x34, 0x3b, 0x50], [0x41, 0x4a, 0x64]];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4; if (D[i + 3] < 200) continue;
      const r = D[i], g = D[i + 1], b = D[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), lum = (r * 0.3 + g * 0.59 + b * 0.11) / 255;
      if (lum < 0.3 || (mx - mn) / (mx || 1) > 0.22) continue;            // outlines and anything coloured (skin, red, gold) stay
      const c = ramp[Math.min(4, Math.floor((lum - 0.3) / 0.7 * 5))];
      const edge = lum > 0.9 && (y === 0 || D[((y - 1) * w + x) * 4 + 3] < 200 || (D[((y - 1) * w + x) * 4] < 60 && D[((y - 1) * w + x) * 4 + 1] < 60));   // top edges catch a cold light
      D[i] = edge ? 0x7a : c[0]; D[i + 1] = edge ? 0x9a : c[1]; D[i + 2] = edge ? 0xc8 : c[2];
    }
    ctx.putImageData(img, 0, 0); ct.refresh(); ct.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
}
ChrisRig.prototype.setArmour = function (on) {
  if (!!on === !!this.armoured) return;
  this.armoured = !!on;
  const sc = this.root.scene; if (on) makeArmourTextures(sc);
  const set = (o, key) => { const ak = '__ar_' + key; o.setTexture(on && sc.textures.exists(ak) ? ak : key); };
  set(this.tanks, 'c_tanks'); set(this.legB, 'c_leg'); set(this.legF, 'c_leg'); set(this.bootB, 'c_boot'); set(this.bootF, 'c_boot');
  set(this.body, 'c_body'); set(this.armB, 'c_arm'); set(this.gArm, 'c_arm'); set(this.hat, 'c_hat'); set(this.collar, 'c_collar');
};

function makeShopTextures(scene) {
  if (scene.textures.exists('shopbot')) return;
  // FRIDGE-O-TRON, the shopkeeper: a battered vending fridge with a face, a bow tie and a till drawer
  pixSprite(scene, 'shopbot', 56, 76, a => {
    const ST = [0xdfe6f0, 0x9aa4b4, 0x5a6272], DK = [0x4a5262, 0x30364a, 0x1c2030];
    a.rect(12, 70, 20, 75, 0x30364a); a.rect(36, 70, 44, 75, 0x30364a);                       // feet
    a.rrect(6, 8, 50, 71, 5, ST);                                                               // the fridge
    a.rect(8, 34, 48, 35, 0x5a6272);                                                            // door seam
    a.rrect(11, 12, 45, 31, 3, DK); a.rect(13, 14, 43, 29, 0x0c2a30);                           // screen
    a.ell(21, 21, 4, 5, 0x5cffe0); a.ell(35, 21, 4, 5, 0x5cffe0); a.px(20, 19, 0xffffff); a.px(34, 19, 0xffffff);   // eyes
    a.line([[19, 27], [23, 28.5], [33, 28.5], [37, 27]], 0x5cffe0, 1);                          // smile
    a.poly([[28, 37], [20, 33], [20, 41]], [0xff5a4a, 0xd0302a, 0x8a1a1a]); a.poly([[28, 37], [36, 33], [36, 41]], [0xff5a4a, 0xd0302a, 0x8a1a1a]); a.ell(28, 37, 2, 2, 0xffd23f);   // bow tie
    a.rrect(13, 46, 43, 60, 2, DK); for (let k = 0; k < 3; k++) for (let j = 0; j < 2; j++) a.rect(16 + k * 9, 49 + j * 5, 21 + k * 9, 51 + j * 5, [0xffd23f, 0xff7a5a, 0x7dff8a][k]);   // goods behind glass
    a.rect(16, 63, 40, 67, 0x30364a); a.rect(26, 64, 30, 66, 0xffd23f);                         // till drawer
    a.line([[28, 8], [28, 2]], 0x5a6272, 2); a.ell(28, 2, 2.5, 2.5, 0xff5a4a);                  // aerial
    a.rect(2, 30, 6, 44, 0x9aa4b4); a.rect(50, 30, 54, 44, 0x9aa4b4);                           // arms
  }, true);
  // the shop as seen from the route map: a tubby orbital kiosk with a striped awning, a sign board, crates and a dish
  pixSprite(scene, 'shopship', 84, 62, a => {
    const ST = [0xdfe6f0, 0x9aa4b4, 0x5a6272], DK = [0x5a6272, 0x3a4052, 0x232838], TL = [0x8affea, 0x2ad0b8, 0x148a80];
    a.line([[16, 20], [10, 6]], 0x5a6272, 2); a.ell(9, 5, 5, 3, ST); a.px(9, 4, 0xff5a4a);                    // dish
    a.line([[68, 20], [72, 8]], 0x5a6272, 2); a.ell(72, 7, 2.5, 2.5, 0xff5a4a);                               // beacon mast
    a.rrect(8, 20, 76, 46, 8, ST);                                                                            // hull
    a.rect(10, 40, 74, 43, 0x5a6272); a.rect(8, 30, 76, 31, 0xc8d0dc);
    a.rrect(14, 8, 70, 22, 3, DK); a.rect(16, 10, 68, 20, 0x10202c);                                          // sign board (the word goes on top)
    for (let k = 0; k < 7; k++) a.poly([[10 + k * 9.2, 24], [19.2 + k * 9.2, 24], [19.2 + k * 9.2, 30], [14.6 + k * 9.2, 33], [10 + k * 9.2, 30]], k % 2 ? [0xffffff, 0xdfe6f0, 0x9aa4b4] : [0xff7a6a, 0xe0403a, 0x9a1a1a]);   // awning
    a.rrect(22, 34, 62, 44, 2, DK); a.rect(24, 35, 60, 43, 0x2a1a30);                                         // the hatch, lit and stocked
    for (let k = 0; k < 4; k++) a.rect(26 + k * 9, 37, 31 + k * 9, 42, [0xffd23f, 0x7dff8a, 0xff7a5a, 0x5ce1ff][k]);
    a.rrect(0, 28, 10, 40, 3, TL); a.rrect(74, 28, 84, 40, 3, TL);                                            // side pods
    a.poly([[24, 46], [60, 46], [52, 54], [32, 54]], DK);                                                     // keel
    a.rect(36, 54, 48, 56, 0x232838);
  }, true);
  for (let f = 0; f < 2; f++) pixSprite(scene, 'shopflame' + f, 14, 12, a => { a.poly([[1, 0], [13, 0], [7, f ? 11 : 8]], [0xfff6c0, 0xffb52a, 0xff6a1a]); a.poly([[4, 0], [10, 0], [7, f ? 6 : 4]], 0xffffff); }, false);
  // prize pictures for the lucky wheel
  { const CH = [0xfff09a, 0xffc83a, 0xd08a12], ST = [0xdfe6f0, 0x9aa4b4, 0x5a6272];
    const wedge = (a, x, y) => { a.poly([[x, y + 6], [x + 9, y], [x + 13, y + 5], [x + 13, y + 11], [x, y + 11]], CH); a.poly([[x, y + 6], [x + 9, y], [x + 13, y + 5]], 0xfff6c0); a.px(x + 4, y + 8, 0xd08a12); a.px(x + 9, y + 9, 0xd08a12); a.px(x + 7, y + 7, 0xd08a12); };
    pixSprite(scene, 'wi_30', 30, 26, a => { wedge(a, 2, 12); wedge(a, 14, 12); wedge(a, 8, 2); }, true);
    pixSprite(scene, 'wi_60', 30, 26, a => { wedge(a, 0, 14); wedge(a, 9, 14); wedge(a, 17, 14); wedge(a, 4, 6); wedge(a, 13, 6); wedge(a, 9, 0); }, true);
    pixSprite(scene, 'wi_500', 34, 30, a => { for (const [x, y] of [[0, 18], [10, 18], [20, 18], [5, 11], [15, 11], [10, 4]]) wedge(a, x, y); a.poly([[9, 4], [12, -1], [15, 3], [18, -1], [21, 3], [24, -1], [26, 4], [26, 7], [9, 7]], [0xffe27a, 0xffb52a, 0xb86a08]); a.px(12, 4, 0xff4a3a); a.px(18, 4, 0x5cffe0); a.px(23, 4, 0xff4a3a); }, true);
    pixSprite(scene, 'wi_rat', 30, 28, a => {
      a.ell(15, 14, 11, 11, [0xc8f0ff, 0x8ac8e8, 0x4a88b0]);                                             // space helmet
      a.ell(8, 8, 4, 4, [0xc0b4c8, 0x8a7e96, 0x5a5066]); a.ell(22, 8, 4, 4, [0xc0b4c8, 0x8a7e96, 0x5a5066]); a.ell(8, 8, 2, 2, 0xff9db8); a.ell(22, 8, 2, 2, 0xff9db8);
      a.ell(15, 15, 7, 7, [0xc0b4c8, 0x8a7e96, 0x5a5066]);
      a.line([[9, 11], [13, 13]], 0x1a1020, 2); a.line([[21, 11], [17, 13]], 0x1a1020, 2); a.px(12, 14, 0xff3a2a); a.px(18, 14, 0xff3a2a);   // angry eyes
      a.ell(15, 18, 2, 1.5, 0xff7a9a); a.rect(13, 20, 14, 22, 0xffffff); a.rect(16, 20, 17, 22, 0xffffff);
      a.ell(11, 9, 2, 1, 0xffffff);
    }, true);
    pixSprite(scene, 'wi_plate', 28, 28, a => { a.poly([[14, 1], [27, 14], [14, 27], [1, 14]], ST); a.poly([[14, 5], [23, 14], [14, 23], [5, 14]], [0x9aa4b4, 0x7a8494, 0x5a6272]); a.line([[8, 14], [20, 14]], 0x5a6272, 1); a.line([[14, 8], [14, 20]], 0x5a6272, 1); for (const [x, y] of [[14, 4], [24, 14], [14, 24], [4, 14]]) a.ell(x, y, 1.5, 1.5, 0x3a4052); }, true);
    pixSprite(scene, 'wi_gun', 32, 24, a => {
      a.rrect(4, 8, 22, 16, 3, [0xffa040, 0xf07a1a, 0xa84a08]); a.rect(8, 16, 13, 22, 0x8a4a1a); a.rect(9, 17, 12, 21, 0xb86a2a);    // body and grip
      a.rrect(10, 2, 20, 8, 2, [0xff6a5a, 0xd0302a, 0x8a1a1a]); a.rect(12, 4, 18, 7, 0xfff6c0);                                 // hopper
      a.poly([[22, 8], [31, 12], [22, 16]], ST); a.line([[24, 10], [24, 14]], 0x5a6272, 1); a.line([[27, 11], [27, 13]], 0x5a6272, 1);   // drill
      a.ell(6, 12, 2, 2, 0x5cffe0);
    }, true);
    pixSprite(scene, 'wi_life', 28, 28, a => {
      a.ell(8, 9, 6, 6, [0xffffff, 0xdfe6f0, 0xaab4c8]); a.ell(14, 6, 7, 6, [0xffffff, 0xdfe6f0, 0xaab4c8]); a.ell(20, 9, 6, 6, [0xffffff, 0xdfe6f0, 0xaab4c8]);   // chef's hat
      a.rect(7, 10, 21, 19, 0xffffff); a.rect(7, 19, 21, 23, 0xdfe6f0); a.rect(7, 22, 21, 23, 0xaab4c8); a.line([[11, 12], [11, 18]], 0xdfe6f0, 1); a.line([[17, 12], [17, 18]], 0xdfe6f0, 1);
    }, true); }
  pixSprite(scene, 'cheddar', 12, 12, a => { a.ell(6, 6, 5, 5, [0xffe27a, 0xffb52a, 0xb86a08]); a.rect(5, 3, 6, 8, 0xfff6c0); a.px(8, 4, 0xfff6c0); }, true);
}

class ShopScene extends Phaser.Scene {
  constructor() { super('shop'); }
  create() {
    makeTextures(this); makeLevelTextures(this); makeChrisTextures(this); makeShopTextures(this);
    this.cameras.main.setBackgroundColor('#0b1020'); this.cameras.main.fadeIn(200, 0, 0, 0);
    Sound.init();
    this.going = false; this.sel = 0; this.t0 = 0; this.msg = 'WELCOME! EVERYTHING MUST GO.'; this.msgT = 0; this.flashRow = -1; this.flashT = 0;
    this.stars = []; for (let i = 0; i < 90; i++) this.stars.push({ x: Math.random(), y: Math.random(), s: 1 + Math.floor(Math.random() * 3), tw: Math.random() * 6 });
    this.bg = this.add.graphics().setDepth(0);
    this.ui = this.add.container(0, 0).setDepth(1);
    this.selG = this.add.graphics().setDepth(2);
    this.rig = new ChrisRig(this); this.rig.root.setDepth(3); this.rig.setWeapon(WEAPONS[0]);
    this.rigP = { h: 0, floor: 0, vh: 0, vx: 0, thrusting: false, firing: 0, aimA: 0, power: 0, duck: false, facing: 1 };
    this.bot = this.add.image(0, 0, 'shopbot').setDepth(3);
    this.build();
    this.scale.on('resize', this.build, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.build, this));
    const kb = this.input.keyboard;
    if (kb) {
      kb.on('keydown-UP', () => this.move(-1)); kb.on('keydown-DOWN', () => this.move(1)); kb.on('keydown-W', () => this.move(-1)); kb.on('keydown-S', () => this.move(1));
      kb.on('keydown-ENTER', () => this.buy(this.sel)); kb.on('keydown-SPACE', () => this.buy(this.sel)); kb.on('keydown-X', () => this.buy(this.sel));
      kb.on('keydown-ESC', () => this.back());
    }
    const padOff = Pad.on(b => { if (this.spin) { const S = this.spin; if (S.pick) { const i = { x: 0, a: 1, b: 2, left: 0, down: 1, right: 2 }[b]; if (S.pick[i]) this.pickGun(S.pick[i]); else if (b === 'a') this.pickGun(S.pick[0]); } else if (S.done) this.endSpin(); return; } if (b === 'y' || b === 'x') { this.startSpin(); return; } if (b === 'up' || b === 'down') this.move(b === 'up' ? -1 : 1); else if (b === 'a') this.buy(this.sel); else if (b === 'b' || b === 'back' || b === 'start') this.back(); });
    this.events.once('shutdown', padOff);
    this.spin = null; this.spinG = this.add.graphics().setDepth(10); this.spinT = []; this.spinI = []; this.spinB = [];
    if (kb) { kb.on('keydown-L', () => this.startSpin()); ['ONE', 'TWO', 'THREE'].forEach((k, i) => kb.on('keydown-' + k, () => { if (this.spin && this.spin.pick && this.spin.pick[i]) this.pickGun(this.spin.pick[i]); })); }
    this.input.on('pointerdown', p => {
      if (this.spin) {
        const S = this.spin;
        if (S.pick) { const hit = (S.pickBoxes || []).find(q => p.x >= q.x && p.x <= q.x + q.w && p.y >= q.y && p.y <= q.y + q.h); if (hit) this.pickGun(hit.gun); return; }
        if (S.done && S.t > S.dur + 0.5) this.endSpin(); return; }
      if (this.spinBox && p.x >= this.spinBox.x && p.x <= this.spinBox.x + this.spinBox.w && p.y >= this.spinBox.y && p.y <= this.spinBox.y + this.spinBox.h) { this.startSpin(); return; }
      if (this.backBox && p.x >= this.backBox.x && p.x <= this.backBox.x + this.backBox.w && p.y >= this.backBox.y && p.y <= this.backBox.y + this.backBox.h) { this.back(); return; }
      const i = (this.rows || []).findIndex(r => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
      if (i >= 0) { if (this.sel === i || !this.touchSel) { this.sel = i; this.buy(i); } else this.sel = i; }
    });
  }
  // what's on the shelves right now (it depends on what is owned): { name, desc, cost, can, why, act }
  items() {
    const reg = this.registry, s = Shop.get(reg), L = [], lives = reg.get('lives') || 0;
    const mk = ['', 'Mk I', 'Mk II', 'Mk III', 'Mk IV'];
    if (s.armMk > 0 && s.armHp <= 0) {
      const c = 80 + s.armMk * 30;
      L.push({ name: 'RE-FORGE BLACK RIND ' + mk[s.armMk], desc: 'It shattered. Forge it again: ' + SHOP.armHp[s.armMk] + ' plates.', cost: c, act: q => { q.armHp = SHOP.armHp[q.armMk]; } });
    } else if (s.armMk < 4) {
      const n = s.armMk + 1;
      L.push({ name: (s.armMk ? 'UPGRADE TO ' : 'FORGE ') + 'BLACK RIND ' + mk[n], desc: SHOP.armHp[n] + ' armour plates that soak hits before your cheese does.', cost: SHOP.armCost[n], act: q => { q.armMk = n; q.armHp = SHOP.armHp[n]; } });
    } else L.push({ name: 'BLACK RIND Mk IV', desc: 'The best there is.', cost: 0, max: true });
    const miss = s.armMk > 0 && s.armHp > 0 ? SHOP.armHp[s.armMk] - s.armHp : 0;
    L.push({ name: 'PATCH UP ARMOUR', desc: miss > 0 ? 'Weld on the ' + miss + ' missing plate' + (miss > 1 ? 's' : '') + '.' : (s.armHp > 0 ? 'Not a scratch on it.' : 'Nothing to patch.'), cost: miss * SHOP.patchCost, max: miss <= 0, act: q => { q.armHp = SHOP.armHp[q.armMk]; } });
    if (s.boots < 4) L.push({ name: 'MOON BOOTS LV ' + (s.boots + 1), desc: 'Run faster, jump higher, and the jetpack sips less fuel.', cost: SHOP.bootCost[s.boots + 1], act: q => { q.boots++; } });
    else L.push({ name: 'MOON BOOTS LV 4', desc: 'Fully sprung.', cost: 0, max: true });
    for (const w of WEAPONS) {
      const c = (s.chips || {})[w.id] || 0;
      if (c < 3) L.push({ name: w.short + ' START CHIP ' + (c + 1), desc: 'Starts at LEVEL ' + (c + 2) + ', and falls back to it when a life is lost.', cost: SHOP.chipCost[c + 1], act: q => { q.chips = Object.assign({}, q.chips); q.chips[w.id] = c + 1; } });
      else L.push({ name: w.short + ' START CHIP 3', desc: 'Always starts at LEVEL 4.', cost: 0, max: true });
    }
    { const hN = s.hearts || 0;
      if (hN < 2) L.push({ name: 'EXTRA HEART ' + (hN + 1), desc: 'You start with ' + CFG.maxHp + '. This makes it ' + (CFG.maxHp + hN + 1) + '.', cost: SHOP.heartCost[hN + 1], act: q => { q.hearts = hN + 1; } });
      else L.push({ name: 'EXTRA HEART 2', desc: 'Five hearts is your lot.', cost: 0, max: true }); }
    L.push({ name: 'EXTRA LIFE', desc: 'You have ' + lives + '. (' + CFG.maxLives + ' at most.)', cost: SHOP.lifeCost, max: lives >= CFG.maxLives, act: () => { reg.set('lives', Math.min(CFG.maxLives, (reg.get('lives') || 0) + 1)); } });
    return L;
  }
  // ---- the lucky wheel
  startSpin() {
    if (this.going || this.spin) return;
    const reg = this.registry, s = Shop.get(reg);
    if (Shop.spinsLeft() <= 0) { Sound.sfx('clunk'); this.say('NO SPINS LEFT. EVERY GOLDEN WHEEL YOU FIND IS ONE SPIN.'); return; }
    Shop.useSpin();
    let tot = 0; for (const q of SPIN) tot += q[1];
    let r = Math.random() * tot, idx = 0; for (let i = 0; i < SPIN.length; i++) { r -= SPIN[i][1]; if (r <= 0) { idx = i; break; } }
    const seg = Math.PI * 2 / SPIN.length, a0 = this.spinA || 0;
    let a1 = -Math.PI / 2 - (idx + 0.5 + (Math.random() - 0.5) * 0.6) * seg; while (a1 < a0 + Math.PI * 9) a1 += Math.PI * 2;
    this.spin = { idx, a0, a1, t: 0, dur: 3.6, done: false, lastSeg: 0, msg: '' };
    Sound.sfx('whoosh');
  }
  prize(idx) {
    const reg = this.registry, s = Shop.get(reg), k = SPIN[idx][0];
    let msg;
    if (k === 'RAT!') { msg = 'A RAT! IT ATE YOUR PRIZE.'; Sound.sfx('clunk'); this.cameras.main.shake(140, 0.006); return msg; }
    if (k === 'PLATE') {
      if (s.armHp > 0 && s.armHp < SHOP.armHp[s.armMk]) { s.armHp++; msg = 'AN ARMOUR PLATE, WELDED ON!'; }
      else { s.coins += 50; msg = 'A SPARE PLATE. NO USE TO YOU: 50 CHEDDAR FOR SCRAP.'; }
    } else if (k === 'GUN +1') {                         // you choose which gun
      const can = WEAPONS.filter(w => this.gunLvOf(w) < 4 && weaponUnlocked(w, Progress.best + 1));
      if (can.length) { this.spin.pick = can; Sound.sfx('power'); return 'GUN +1! CHOOSE YOUR GUN'; }
      s.coins += 80; msg = 'GUNS ALL MAXED: 80 CHEDDAR INSTEAD.';
    } else if (k === 'LIFE') {
      if ((reg.get('lives') || 0) < CFG.maxLives) { reg.set('lives', (reg.get('lives') || 0) + 1); msg = 'JACKPOT! AN EXTRA LIFE!'; }
      else { s.coins += 150; msg = 'LIVES FULL: 150 CHEDDAR INSTEAD.'; }
    } else { s.coins += +k; msg = k + ' CHEDDAR!'; }
    Shop.set(reg, s); Sound.sfx('power'); this.cameras.main.flash(160, 255, 230, 160);
    return msg;
  }
  gunLvOf(w) { const g = this.registry.get('gunLv') || {}, s = Shop.get(this.registry); return Math.max(g[w.id] || 1, 1 + ((s.chips || {})[w.id] || 0)); }
  pickGun(w) {
    const S = this.spin; if (!S || !S.pick || !S.pick.includes(w)) return;
    const g = Object.assign({}, this.registry.get('gunLv') || {}); g[w.id] = this.gunLvOf(w) + 1; this.registry.set('gunLv', g);
    S.pick = null; S.msg = w.name + ' UP TO LEVEL ' + g[w.id] + '!'; S.dur = S.t; this.say(S.msg);
    Sound.sfx('power'); this.cameras.main.flash(160, 255, 230, 160);
  }
  endSpin() { this.spinA = this.spin.a1 % (Math.PI * 2); this.spin = null; this.spinG.clear(); this.spinT.forEach(t => t.setVisible(false)); (this.spinB || []).forEach(t => t.setVisible(false)); (this.spinI || []).forEach(t => t.setVisible(false)); this.build(); }
  // THE LUCKY WHEEL, fairground style: a rusty cog of a rim with chasing bulbs, a neon frame, prize pictures on the slices,
  // sparks off the pointer, sirens while it spins, and the result up in lights on a marquee with confetti.
  drawSpin(dt, t) {
    const S = this.spin, g = this.spinG, W = this.scale.width, H = this.scale.height, n = SPIN.length, seg = Math.PI * 2 / n;
    S.t += dt;
    const u = Math.min(1, S.t / S.dur), e = 1 - Math.pow(1 - u, 3.2), ang = S.a0 + (S.a1 - S.a0) * e;
    S.sparks = S.sparks || []; S.conf = S.conf || [];
    const cx = W / 2, R0 = Math.min(H * 0.32, W * 0.2), cy = Math.max(R0 + 30, H * 0.45), RG = R0 + 13;
    const sN = Math.floor((ang + Math.PI / 2) / seg);
    if (sN !== S.lastSeg && !S.done) { S.lastSeg = sN; Sound.sfx('blip'); S.kick = 1;
      for (let k = 0; k < 5; k++) S.sparks.push({ x: cx, y: cy - R0 - 2, vx: (Math.random() - 0.3) * 190, vy: -Math.random() * 170 - 20, l: 0.25 + Math.random() * 0.2 }); }
    if (u >= 1 && !S.done) {
      S.done = true; S.msg = this.prize(S.idx); this.say(S.msg);
      if (SPIN[S.idx][0] !== 'RAT!') for (let k = 0; k < 70; k++) S.conf.push({ x: cx + (Math.random() - 0.5) * R0 * 2.4, y: cy + R0 * 0.6 + Math.random() * 30, vx: (Math.random() - 0.5) * 260, vy: -Math.random() * 330 - 60, c: [0xff5a9a, 0x5cffe0, 0xffd23f, 0x7dff8a, 0xff7a5a, 0xffffff][k % 6], r: Math.random() * 6, l: 1.6 + Math.random() * 1.2 });
    }
    S.kick = Math.max(0, (S.kick || 0) - dt * 9);
    g.clear(); g.fillStyle(0x05060f, 0.86).fillRect(0, 0, W, H);
    // cables looping up out of the top of the screen, and the two posts the marquee stands on
    const cable = (x0, x1, sag, col) => { const pts = []; for (let i = 0; i <= 14; i++) { const q = i / 14; pts.push({ x: x0 + (x1 - x0) * q, y: -6 + (cy - RG * 0.2 + 6) * q * q + Math.sin(q * Math.PI) * sag }); } g.lineStyle(4, 0x05060f, 1).strokePoints(pts); g.lineStyle(2, col, 1).strokePoints(pts); };
    cable(cx + RG * 1.6, cx + RG + 14, 26, 0xd0403a); cable(cx + RG * 1.25, cx + RG + 10, -14, 0x3a8ad0); cable(cx - RG * 1.5, cx - RG - 12, 22, 0x4ac06a); cable(cx + RG * 1.9, cx + RG + 16, 44, 0xe0b030);
    g.fillStyle(0x2a2e3a, 1).fillRect(cx - R0 * 0.62 - 4, cy + R0 * 0.5, 8, H); g.fillRect(cx + R0 * 0.62 - 4, cy + R0 * 0.5, 8, H);
    // the neon frame behind it (two tubes, the pink one flickers)
    const fw = RG * 2 + 38, fh = RG * 2 + 22, fx = cx - fw / 2, fy = cy - fh / 2, flick = Math.sin(t * 31) > -0.86 ? 1 : 0.35;
    g.fillStyle(0x0c1024, 1).fillRoundedRect(fx, fy, fw, fh, 14);
    g.lineStyle(7, 0x5cffe0, 0.16).strokeRoundedRect(fx, fy, fw, fh, 14); g.lineStyle(3, 0x5cffe0, 0.95).strokeRoundedRect(fx, fy, fw, fh, 14);
    g.lineStyle(7, 0xff5ad0, 0.14 * flick).strokeRoundedRect(fx + 6, fy + 6, fw - 12, fh - 12, 10); g.lineStyle(2, 0xff5ad0, 0.9 * flick).strokeRoundedRect(fx + 6, fy + 6, fw - 12, fh - 12, 10);
    // the rim: a rusty cog (it turns with the wheel), riveted, with rust blooms
    for (let k = 0; k < 20; k++) {
      const a = ang * 0.5 + k * Math.PI / 10, c = Math.cos(a), sn = Math.sin(a), w2 = 0.085;
      const P4 = [[RG - 2, -w2], [RG + 9, -w2 * 0.7], [RG + 9, w2 * 0.7], [RG - 2, w2]].map(([r, da]) => ({ x: cx + Math.cos(a + da) * r, y: cy + Math.sin(a + da) * r }));
      g.fillStyle(0x1a1020, 1).fillPoints(P4.map(q => ({ x: q.x + c * 2, y: q.y + sn * 2 })), true); g.fillStyle(k % 3 ? 0x6a5a52 : 0x8a4a2a, 1).fillPoints(P4, true);
    }
    g.fillStyle(0x1a1020, 1).fillCircle(cx, cy, RG + 2); g.fillStyle(0x5a4e4a, 1).fillCircle(cx, cy, RG); g.fillStyle(0x7a6a60, 1).fillCircle(cx - 1, cy - 1, RG - 3);
    for (let k = 0; k < 9; k++) { const a = k * 2.4 + 0.5; g.fillStyle(k % 2 ? 0x9a4a22 : 0x7a3a1a, 0.9).fillCircle(cx + Math.cos(a) * (RG - 6), cy + Math.sin(a) * (RG - 6), 3 + (k % 3) * 1.6); }
    g.fillStyle(0x1a1020, 1).fillCircle(cx, cy, R0 + 2);
    // the slices and their pictures
    this.spinI = this.spinI || [];
    for (let i = 0; i < n; i++) {
      const a = ang + i * seg, win = S.done && i === S.idx && Math.floor(t * 8) % 2, am = a + seg / 2, key = SPIN[i][0];
      g.fillStyle(win ? 0xffffff : SPIN[i][2], 1).slice(cx, cy, R0, a, a + seg, false).fillPath();
      g.fillStyle(0x000000, 0.12).slice(cx, cy, R0, a, a + seg * 0.18, false).fillPath();                                   // a bit of shading down one edge
      g.lineStyle(3, 0x1a1020, 1).lineBetween(cx, cy, cx + Math.cos(a) * R0, cy + Math.sin(a) * R0);
      g.fillStyle(0xdfe6f0, 1).fillCircle(cx + Math.cos(a) * (R0 - 5), cy + Math.sin(a) * (R0 - 5), 2.5); g.fillStyle(0x5a6272, 1).fillCircle(cx + Math.cos(a) * (R0 - 5) + 1, cy + Math.sin(a) * (R0 - 5) + 1, 1.2);   // peg
      let im = this.spinI[i]; if (!im) im = this.spinI[i] = this.add.image(0, 0, 'wi_30').setDepth(10.1);
      const isNum = /^\d+$/.test(key), tex = isNum ? (key === '500' ? 'wi_500' : key === '60' ? 'wi_60' : 'wi_30') : key === 'RAT!' ? 'wi_rat' : key === 'PLATE' ? 'wi_plate' : key === 'GUN +1' ? 'wi_gun' : 'wi_life';
      const isc = Math.max(1, R0 / 76) * (win ? 1.15 : 1);
      im.setTexture(tex).setPosition(cx + Math.cos(am) * R0 * 0.62, cy + Math.sin(am) * R0 * 0.62).setRotation(am + Math.PI / 2).setScale(isc).setVisible(true);
      let tx = this.spinT[i]; if (!tx) tx = this.spinT[i] = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '8px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 4 }).setOrigin(0.5).setDepth(10.15);
      tx.setText(isNum ? key : key === 'GUN +1' ? '+1' : key === 'LIFE' ? '1-UP' : '').setPosition(cx + Math.cos(am) * R0 * 0.33, cy + Math.sin(am) * R0 * 0.33).setRotation(am + Math.PI / 2).setVisible(true);
    }
    // hub: a golden cheese wheel on a steel boss
    g.fillStyle(0x1a1020, 1).fillCircle(cx, cy, R0 * 0.2); g.fillStyle(0x7a8494, 1).fillCircle(cx, cy, R0 * 0.18); g.fillStyle(0xffd23f, 1).fillCircle(cx, cy, R0 * 0.13); g.fillStyle(0xfff3a0, 1).fillCircle(cx - 2, cy - 2, R0 * 0.07);
    g.fillStyle(0xb86a08, 1).fillCircle(cx + 3, cy - 2, R0 * 0.03); g.fillCircle(cx - 4, cy + 3, R0 * 0.025);
    // bulbs round the rim: chasing while it spins, all flashing on a win
    const NB = 18, chase = Math.floor(t * (S.done ? 5 : 14));
    for (let k = 0; k < NB; k++) {
      const a = k * Math.PI * 2 / NB - Math.PI / 2 + Math.PI / NB, on = S.done ? chase % 2 === 0 : (k + chase) % 3 === 0, bx = cx + Math.cos(a) * (RG - 6), by = cy + Math.sin(a) * (RG - 6);
      if (on) g.fillStyle(0xffe27a, 0.22).fillCircle(bx, by, 8);
      g.fillStyle(0x1a1020, 1).fillCircle(bx, by, 4.5); g.fillStyle(on ? 0xfff6c0 : 0x6a5a2a, 1).fillCircle(bx, by, 3.2); if (on) g.fillStyle(0xffffff, 1).fillCircle(bx - 1, by - 1, 1.2);
    }
    // the pointer on its bracket, kicked by every peg
    { const py = cy - R0, kx = S.kick * 5;
      g.fillStyle(0x1a1020, 1).fillRect(cx - 9, py - 30, 18, 16); g.fillStyle(0x7a8494, 1).fillRect(cx - 7, py - 28, 14, 12); g.fillStyle(0xdfe6f0, 1).fillRect(cx - 7, py - 28, 14, 2); g.fillStyle(0x3a4052, 1).fillCircle(cx, py - 22, 2.5);
      g.fillStyle(0x1a1020, 1).fillTriangle(cx - 12 + kx, py - 18, cx + 12 + kx, py - 18, cx + kx * 0.3, py + 12);
      g.fillStyle(0xff4a3a, 1).fillTriangle(cx - 9 + kx, py - 16, cx + 9 + kx, py - 16, cx + kx * 0.3, py + 8); g.fillStyle(0xff9a8a, 1).fillTriangle(cx - 9 + kx, py - 16, cx - 2 + kx, py - 16, cx + kx * 0.3, py + 8); }
    for (let i = S.sparks.length - 1; i >= 0; i--) { const q = S.sparks[i]; q.l -= dt; if (q.l <= 0) { S.sparks.splice(i, 1); continue; } q.vy += 500 * dt; const x0 = q.x, y0 = q.y; q.x += q.vx * dt; q.y += q.vy * dt;
      g.lineStyle(2, q.l > 0.2 ? 0xffffff : 0xffb52a, Math.min(1, q.l * 5)).lineBetween(x0, y0, q.x, q.y); }
    // sirens in the corner: they whirl while it spins
    for (let k = 0; k < 4; k++) {
      const x = 22 + k * 26, y = 22, on = !S.done && Math.floor(t * 9 + k) % 2 === 0, col = k % 2 ? 0xff4a3a : 0xffb52a;
      if (on) { g.fillStyle(col, 0.2).fillCircle(x, y - 3, 15); g.fillStyle(col, 0.5).fillTriangle(x, y - 4, x - 16, y - 16 + Math.sin(t * 20 + k) * 6, x - 16, y + 4 + Math.sin(t * 20 + k) * 6); }
      g.fillStyle(0x1a1020, 1).fillRect(x - 9, y + 4, 18, 6); g.fillStyle(0x5a6272, 1).fillRect(x - 8, y + 5, 16, 4);
      g.fillStyle(0x1a1020, 1).fillRoundedRect(x - 7, y - 11, 14, 16, 4); g.fillStyle(on ? col : 0x4a2a2a, 1).fillRoundedRect(x - 5.5, y - 9.5, 11, 14, 3); if (on) g.fillStyle(0xffffff, 0.9).fillRect(x - 3, y - 8, 2, 5);
    }
    // gun choice
    this.spinB = this.spinB || [];
    for (let i = 0; i < 3; i++) {
      let bt = this.spinB[i]; if (!bt) bt = this.spinB[i] = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '9px', color: '#1a1020', backgroundColor: '#5cffe0', padding: { x: 10, y: 9 }, align: 'center' }).setOrigin(0.5).setDepth(10.3);
      const w = S.pick && S.pick[i];
      if (!w) { bt.setVisible(false); continue; }
      const bw = Math.min(190, W * 0.28), bx = cx + (i - (S.pick.length - 1) / 2) * (bw + 12);
      bt.setText(w.short + '  LV ' + this.gunLvOf(w) + ' > ' + (this.gunLvOf(w) + 1)).setPosition(bx, cy).setVisible(true).setScale(1 + 0.04 * Math.sin(t * 6 + i));
    }
    S.pickBoxes = S.pick ? S.pick.map((w, i) => { const bt = this.spinB[i]; return { gun: w, x: bt.x - bt.width / 2 - 6, y: bt.y - bt.height / 2 - 6, w: bt.width + 12, h: bt.height + 12 }; }) : null;
    // the marquee: the result up in lights
    let tt = this.spinT[n]; if (!tt) tt = this.spinT[n] = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '12px', color: '#ffb52a', stroke: '#5a0a0a', strokeThickness: 5, align: 'center', wordWrap: { width: Math.min(W - 60, 520) } }).setOrigin(0.5).setDepth(10.2);
    tt.setText(S.done ? S.msg : 'THE LUCKY WHEEL').setVisible(true).setRotation(0).setColor(S.done && Math.floor(t * 6) % 2 ? '#fff6c0' : '#ffb52a');
    const mw = Math.max(200, tt.width + 44), mh = tt.height + 22, my = Math.min(H - mh / 2 - 6, cy + RG + mh / 2 + 2), mx = cx - mw / 2;
    tt.setPosition(cx, my);
    g.fillStyle(0x1a1020, 1).fillRoundedRect(mx - 4, my - mh / 2 - 4, mw + 8, mh + 8, 8); g.fillStyle(0xd0403a, 1).fillRoundedRect(mx - 2, my - mh / 2 - 2, mw + 4, mh + 4, 7);
    g.fillStyle(0x2a0a1a, 1).fillRoundedRect(mx + 3, my - mh / 2 + 3, mw - 6, mh - 6, 5); g.lineStyle(2, 0xffd23f, 1).strokeRoundedRect(mx + 3, my - mh / 2 + 3, mw - 6, mh - 6, 5);
    for (let k = 0, nb = Math.floor(mw / 16); k <= nb; k++) for (const yy of [my - mh / 2, my + mh / 2]) { const on = (k + chase) % 2 === 0; g.fillStyle(on ? 0xfff6c0 : 0x7a5a1a, 1).fillCircle(mx + k * (mw / nb), yy, 2.4); }
    let hint = this.spinT[n + 1]; if (!hint) hint = this.spinT[n + 1] = this.add.text(0, 0, 'TAP TO CARRY ON', { fontFamily: PIXEL, fontSize: '7px', color: '#9fa6c2', stroke: '#1a1020', strokeThickness: 3 }).setOrigin(1, 1).setDepth(10.2);
    hint.setPosition(W - 10, H - 8).setRotation(0).setVisible(S.done && !S.pick && S.t > S.dur + 0.5 && Math.floor(t * 3) % 2 === 0);
    for (let i = S.conf.length - 1; i >= 0; i--) { const q = S.conf[i]; q.l -= dt; if (q.l <= 0 || q.y > H + 10) { S.conf.splice(i, 1); continue; } q.vy += 420 * dt; q.vx *= 1 - dt; q.x += q.vx * dt; q.y += q.vy * dt; q.r += dt * 9;
      g.fillStyle(q.c, Math.min(1, q.l * 2)).fillRect(q.x, q.y, 2 + 3 * Math.abs(Math.cos(q.r)), 3); }
  }
  move(d) { const n = (this.rows || []).length; if (n) { this.sel = ((this.sel + d) % n + n) % n; Sound.sfx('jump'); } }
  say(m) { this.msg = m; this.msgT = 0; if (this.msgText) this.msgText.setText(m); }
  buy(i) {
    if (this.going || this.spin) return;
    const it = this.items()[i], reg = this.registry, s = Shop.get(reg); if (!it) return;
    if (it.max) { Sound.sfx('clunk'); this.say('NOTHING MORE TO SELL YOU THERE.'); return; }
    if (s.coins < it.cost) { Sound.sfx('zing'); this.cameras.main.shake(90, 0.004); this.say('NOT ENOUGH CHEDDAR. THAT IS ' + it.cost + '.'); return; }
    s.coins -= it.cost; it.act(s); Shop.set(reg, s);
    Sound.sfx('power'); this.cameras.main.flash(120, 255, 230, 160);
    this.flashRow = i; this.flashT = 0.4;
    this.say(['PLEASURE DOING BUSINESS.', 'A FINE CHOICE.', 'NO REFUNDS.', 'MIND THE RATS.'][Math.floor(Math.random() * 4)]);
    this.build();
  }
  back() { if (!this.going) { this.going = true; Sound.sfx('wave'); this.cameras.main.fadeOut(180, 0, 0, 0); this.time.delayedCall(200, () => this.scene.start('select')); } }
  build() {
    const W = this.scale.width, H = this.scale.height, s = Shop.get(this.registry);
    this.ui.removeAll(true);
    const f = (size, color, extra) => Object.assign({ fontFamily: PIXEL, fontSize: size + 'px', color }, extra || {});
    const ink = { stroke: '#1a1020', strokeThickness: 4 };
    this.ui.add(this.add.text(W / 2, Math.max(8, H * 0.03), "FRIDGE-O-TRON'S SPACE SHOP", f(Math.min(16, W / 30), '#ffd23f', { stroke: '#5a0a0a', strokeThickness: 5 })).setOrigin(0.5, 0));
    this.ui.add(this.add.image(W - 118, 20, 'cheddar').setScale(2));
    this.ui.add(this.add.text(W - 102, 13, 'CHEDDAR ' + s.coins, f(10, '#ffe27a', ink)));
    // the counter on the left: Chris (in whatever he's wearing) and the shopkeeper
    const lw = Math.min(210, W * 0.27), top = Math.max(40, H * 0.13), bot = H - 12;
    const g = this.add.graphics();
    g.fillStyle(0x1a1020, 1).fillRect(10, top, lw, bot - top); g.fillStyle(0x151b40, 1).fillRect(12, top + 2, lw - 4, bot - top - 4);
    g.fillStyle(0x2a2050, 1).fillRect(12, bot - 50, lw - 4, 48); g.fillStyle(0x4a3a7a, 1).fillRect(12, bot - 52, lw - 4, 3);     // the floor
    this.ui.add(g);
    this.stage = { x: 12 + (lw - 4) * 0.3, bx: 12 + (lw - 4) * 0.74, y: bot - 26 };
    this.msgText = this.add.text(12 + lw / 2, top + 10, this.msg, f(8, '#5cffe0', { align: 'center', wordWrap: { width: lw - 24 }, lineSpacing: 4 })).setOrigin(0.5, 0);
    this.ui.add(this.msgText);
    const arm = s.armMk > 0 ? (s.armHp > 0 ? 'BLACK RIND ' + ['', 'Mk I', 'Mk II', 'Mk III', 'Mk IV'][s.armMk] + '  ' + s.armHp + '/' + SHOP.armHp[s.armMk] : 'BLACK RIND: SHATTERED') : 'NO ARMOUR';
    this.ui.add(this.add.text(12 + lw / 2, top + 44, arm + '\nBOOTS LV ' + s.boots + '   LIVES ' + (this.registry.get('lives') || 0), f(8, '#c9cde0', { align: 'center', lineSpacing: 5 })).setOrigin(0.5, 0));
    this.rig.setArmour(s.armHp > 0);
    { const left = Shop.spinsLeft(), bx = 22, bw2 = lw - 24, by2 = top + 78, bh2 = 34, sg = this.add.graphics();    // the LUCKY WHEEL button
      sg.fillStyle(0x1a1020, 1).fillRect(bx - 2, by2 - 2, bw2 + 4, bh2 + 4); sg.fillStyle(left > 0 ? 0x4a2a10 : 0x14141c, 1).fillRect(bx, by2, bw2, bh2);
      if (left > 0) sg.lineStyle(2, 0xffd23f, 1).strokeRect(bx, by2, bw2, bh2);
      this.ui.add(sg);
      this.ui.add(this.add.image(bx + 17, by2 + bh2 / 2, 'goldwheel').setScale(0.8).setAlpha(left > 0 ? 1 : 0.3));
      this.ui.add(this.add.text(bx + 34, by2 + 7, 'LUCKY WHEEL', f(8, left > 0 ? '#ffd23f' : '#6b7390', ink)));
      this.ui.add(this.add.text(bx + 34, by2 + 20, left > 0 ? left + ' SPIN' + (left > 1 ? 'S' : '') + ' LEFT' : 'NO SPINS LEFT', f(7, left > 0 ? '#ffffff' : '#4a5070')));
      this.spinBox = { x: bx, y: by2, w: bw2, h: bh2 }; }
    // the shelves
    const items = this.items(), x0 = lw + 22, rw = W - x0 - 12, backH = 24, n = items.length, gap = 4;
    const rh = Math.min(46, (bot - top - backH - 8 - gap * (n - 1)) / n);
    this.rows = [];
    items.forEach((it, i) => {
      const y = top + i * (rh + gap), afford = !it.max && s.coins >= it.cost, gg = this.add.graphics();
      gg.fillStyle(0x1a1020, 1).fillRect(x0 - 2, y - 2, rw + 4, rh + 4); gg.fillStyle(it.max ? 0x14141c : 0x151b40, 1).fillRect(x0, y, rw, rh);
      this.ui.add(gg);
      const one = rh < 30;
      this.ui.add(this.add.text(x0 + 8, y + (one ? rh / 2 - 4 : 6), it.name, f(8, it.max ? '#6b7390' : '#ffffff', ink)));
      if (!one) this.ui.add(this.add.text(x0 + 8, y + rh - 14, it.desc, f(7, it.max ? '#4a5070' : '#9fa6c2')).setScale(Math.min(1, (rw - 110) / Math.max(1, it.desc.length * 7))));
      const pt = this.add.text(x0 + rw - 8, y + rh / 2, it.max ? 'SOLD OUT' : String(it.cost), f(10, it.max ? '#6b7390' : afford ? '#ffe27a' : '#ff7a5a', ink)).setOrigin(1, 0.5);
      this.ui.add(pt);
      if (!it.max) this.ui.add(this.add.image(pt.x - pt.width - 10, y + rh / 2, 'cheddar').setScale(1.5));
      this.rows.push({ x: x0, y, w: rw, h: rh });
    });
    const by = bot - backH, bw = 120;
    const bgx = this.add.graphics(); bgx.fillStyle(0x1a1020, 1).fillRect(W - 12 - bw - 2, by - 2, bw + 4, backH + 4); bgx.fillStyle(0x3a1a2a, 1).fillRect(W - 12 - bw, by, bw, backH);
    this.ui.add(bgx); this.ui.add(this.add.text(W - 12 - bw / 2, by + backH / 2, 'BACK TO MAP', f(8, '#ffffff', ink)).setOrigin(0.5));
    this.backBox = { x: W - 12 - bw, y: by, w: bw, h: backH };
    this.ui.add(this.add.text(x0, by + backH / 2, 'TAP AN ITEM TO BUY. LASTS UNTIL GAME OVER.', f(7, '#6b7390')).setOrigin(0, 0.5));
    if (this.sel >= n) this.sel = n - 1;
  }
  update(time, delta) {
    const W = this.scale.width, H = this.scale.height, t = time / 1000, dt = Math.min(0.05, delta / 1000);
    this.bg.clear();
    for (const s of this.stars) { this.bg.fillStyle(0xffffff, 0.3 + 0.5 * Math.abs(Math.sin(t * 1.5 + s.tw))).fillRect(Math.round(s.x * W), Math.round(s.y * H), s.s, s.s); }
    if (this.spin) this.drawSpin(dt, t);
    const S = this.stage; if (!S) return;
    this.rig.update(this.rigP, dt, Math.round(S.x), Math.round(S.y), 1.5, 1, Math.floor(t * 8) % 4);
    this.bot.setPosition(S.bx, S.y - 76 * 0.75 + Math.sin(t * 3) * 1.5).setScale(1.5).setRotation(Math.sin(t * 1.7) * 0.03);
    this.flashT = Math.max(0, this.flashT - dt);
    const r = this.rows[this.sel]; this.selG.clear();
    if (r) { this.selG.lineStyle(2, this.flashT > 0 ? 0xffffff : 0xffd23f, 0.6 + 0.4 * Math.sin(t * 6)).strokeRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6); }
    if (this.flashT > 0 && this.rows[this.flashRow]) { const q = this.rows[this.flashRow]; this.selG.fillStyle(0xffffff, this.flashT).fillRect(q.x, q.y, q.w, q.h); }
  }
}
