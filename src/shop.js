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
  armCost: [0, 135, 235, 360, 540],        // forging / upgrading TO this mark
  bootCost: [0, 110, 200, 315, 450],
  chipCost: [0, 245, 430, 675],            // chip 1 = that gun restarts at level 2, ... chip 3 = level 4  (v2.55: +50%)
  tankCost: [0, 145, 270, 415],            // (v2.55) JET TANK: the jetpack burns slower and refills faster
  magnetCost: 405, setBonus: 75, lifeCost: 270, patchCost: 20, heartCost: [0, 315, 540]   // (v2.24: everything roughly 2.5x dearer; v2.70: 10% off)
};
// THE LUCKY WHEEL: each golden cheese wheel found is ONE spin, ever (spins used are remembered on the device). [label, weight, colour]
const SPIN = [['30', 22, 0xb8862a], ['PLATE', 14, 0x4e5664], ['60', 16, 0xa4532a], ['RAT!', 10, 0x241e2a], ['30', 22, 0xb8862a], ['GUN +1', 10, 0x2a7a72], ['500', 3, 0x8a2a36], ['LIFE', 2, 0x4a7a36]];   // (v2.53: weathered paint, not sweet-shop colours)
const Shop = {
  get(reg) { const s = reg.get('shop'); return s || { coins: SHOP.setBonus * this.goldenSets(),      // (a GOLDEN SET: every game starts with cheddar in hand)
      armMk: 0, armHp: 0, boots: 0, tank: 0, hearts: 0, spins: 0, chips: {} }; },
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

// BLACK RIND armour (v2.60: properly drawn, not a recolour). Blue-black lacquered plate with trim that gets richer
// with every mark (I steel, II bronze, III gold, IV gold with molten studs), ember-orange seams and a glowing cheese reactor
// where the mission badge was, a gauntlet, knee cops, sabatons with a glowing sole, black tanks with hot vents, a studded
// black band and a cheese-wedge badge on the toque (which stays white), and a bolted steel ring round the helmet glass.
// The belly still won't fit in it. Textures are '__ar<mk>_<key>'.
const AR_TRIM = [null, [0xeef2f8, 0x9aa4b4, 0x5a6272], [0xf6b878, 0xb8703a, 0x6a3a18], [0xfff0a0, 0xffc83a, 0xb07a1a], [0xfff6c0, 0xffd23f, 0xc0801a]];
function makeArmourTextures(scene, mk) {
  mk = Math.max(1, Math.min(4, mk || 1));
  const K = k => '__ar' + mk + '_' + k;
  if (scene.textures.exists(K('c_body'))) return;
  const PL = [0x55618a, 0x2a3048, 0x12141e], HI = 0x9ab0e0, TR = AR_TRIM[mk], EM = [0xfff0a0, 0xff9a2a, 0xc0501a], INKC = 0x1a1020;
  const hot = mk >= 4;
  // ---- parts drawn from scratch (same sizes and pivots as the suit's)
  pixSprite(scene, K('c_arm'), 22, 13, a => {                               // pauldron sleeve, dark mail wrist, a studded gauntlet
    a.rrect(0, 2, 10, 10, 3, PL); a.rect(8, 2, 9, 10, TR[1]); a.px(8, 2, TR[0]); a.line([[2, 4], [6, 4]], HI); a.line([[2, 7], [6, 7]], EM[1]);
    a.rect(10, 4, 12, 8, 0x1e2230); a.px(10, 5, 0x3a4058); a.px(12, 7, 0x3a4058); a.px(11, 4, 0x3a4058);
    a.rrect(13, 1, 21, 11, 4, PL); a.line([[14, 2], [19, 2]], HI);
    for (const [x, y] of [[16, 4], [18, 4], [20, 5]]) a.px(x, y, hot ? EM[0] : TR[0]);
    a.ell(16, 9.5, 2.6, 1.8, PL); a.rect(13, 2, 13, 10, TR[1]);
  });
  pixSprite(scene, K('c_grip'), 9, 12, a => { for (let k = 0; k < 4; k++) { a.rrect(1, k * 3, 7, k * 3 + 2, 1, PL); a.px(6, k * 3, HI); a.px(3, k * 3 + 1, hot ? EM[1] : TR[1]); } });
  pixSprite(scene, K('c_hand_open'), 17, 17, a => {
    for (const [x, y] of [[13, 2], [15, 6], [15, 11], [11, 15]]) { a.line([[6, 8], [x, y]], PL[1], 3); a.ell(x, y, 1.6, 1.6, PL); a.px(x, y, TR[0]); }
    a.line([[5, 7], [3, 2]], PL[1], 3); a.ell(3, 2, 1.6, 1.6, PL); a.ell(6, 8.5, 4.6, 4.6, PL); a.ell(3, 9, 2, 3.6, PL); a.px(6, 8, EM[1]);
  });
  pixSprite(scene, K('c_leg'), 16, 18, a => {                               // a greave, a big knee cop
    a.poly([[2, 0], [14, 0], [15, 7], [13, 17], [4, 17], [1, 8]], PL);
    a.line([[5, 1], [4, 6]], HI); a.line([[6, 13], [11, 13]], EM[1]); a.rect(4, 16, 13, 17, TR[1]);
    a.ell(8.5, 9, 5.5, 3.6, TR); a.px(8, 8, TR[0]); a.px(9, 10, TR[2]); a.px(8, 9, hot ? EM[0] : TR[0]);
  });
  pixSprite(scene, K('c_boot'), 28, 15, a => {                              // sabatons: a trimmed cuff, a capped toe, the sole glowing
    a.rrect(5, 0, 16, 6, 2, PL); a.rect(6, 1, 15, 1, TR[1]); a.px(6, 1, TR[0]);
    a.poly([[3, 5], [16, 5], [20, 7], [26, 8], [27, 12], [1, 12], [1, 8]], PL); a.line([[4, 7], [14, 7]], HI);
    a.ell(22, 9, 5.5, 3.8, TR); a.rect(21, 6, 23, 6, TR[0]); a.line([[16, 6], [17, 11]], PL[2]);
    a.rect(0, 12, 27, 14, 0x12141e); a.rect(1, 12, 26, 12, EM[1]); for (let x = 2; x < 27; x += 3) a.px(x, 12, EM[0]);
  });
  pixSprite(scene, K('c_tanks'), 14, 28, a => {                             // black tanks, trimmed caps, vents glowing hot
    a.rrect(0, 1, 5, 20, 2, PL); a.rrect(7, 1, 12, 20, 2, PL); a.rect(0, 1, 5, 3, TR[1]); a.rect(7, 1, 12, 3, TR[1]); a.px(1, 1, TR[0]); a.px(8, 1, TR[0]);
    a.line([[1, 6], [1, 16]], HI); a.line([[8, 6], [8, 16]], HI);
    for (const y of [9, 12, 15]) { a.rect(2, y, 4, y, EM[1]); a.rect(9, y, 11, y, EM[1]); a.px(3, y, EM[0]); a.px(10, y, EM[0]); }
    a.rect(1, 21, 4, 25, 0x3a4052); a.rect(8, 21, 11, 25, 0x3a4052); a.rect(1, 21, 4, 21, TR[1]); a.rect(8, 21, 11, 21, TR[1]); a.rect(2, 25, 3, 25, EM[0]); a.rect(9, 25, 10, 25, EM[0]);
  });
  pixSprite(scene, K('c_helm'), 30, 30, a => {                              // a bolted steel ring round the helmet glass, a fin at the back
    for (let y = 0; y < 30; y++) for (let x = 0; x < 30; x++) { const d = Math.hypot(x + 0.5 - 15, y + 0.5 - 15); if (d > 12.6 && d <= 14.4) a.px(x, y, (x + y < 24) ? PL[0] : (x + y > 36 ? PL[2] : PL[1])); }
    for (const an of [-2.4, -0.75, 0.75, 2.4]) a.px(Math.round(15 + Math.cos(an) * 13.5 - 0.5), Math.round(15 + Math.sin(an) * 13.5 - 0.5), hot ? EM[0] : TR[0]);
    a.rect(1, 13, 2, 17, TR[1]); a.px(1, 13, TR[0]); a.rect(13, 28, 17, 28, TR[1]);
  }, 0);
  pixSprite(scene, K('c_glow'), 11, 11, a => { a.ell(5.5, 5.5, 5, 5, 0xff8a2a); a.ell(5.5, 5.5, 3, 3, 0xffd23f); a.ell(5.5, 5.5, 1.4, 1.4, 0xfff6c0); }, 0);
  // ---- parts repainted from the suit's own pixels (so the hand-drawn body, belly and all, keeps its shape)
  const copy = (key, fn) => {
    if (!scene.textures.exists(key)) return;
    const fr = scene.textures.getFrame(key), w = fr.cutWidth, h = fr.cutHeight;
    const ct = scene.textures.createCanvas(K(key), w, h), ctx = ct.getContext();
    ctx.drawImage(fr.source.image, fr.cutX, fr.cutY, w, h, 0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h), D = img.data;
    const get = (x, y) => { const i = (y * w + x) * 4; return x < 0 || y < 0 || x >= w || y >= h || D[i + 3] < 200 ? null : [D[i], D[i + 1], D[i + 2]]; };
    const put = (x, y, c) => { if (x < 0 || y < 0 || x >= w || y >= h) return; const i = (y * w + x) * 4; if (D[i + 3] < 200) return; D[i] = (c >> 16) & 255; D[i + 1] = (c >> 8) & 255; D[i + 2] = c & 255; };
    fn(get, put, w, h);
    ctx.putImageData(img, 0, 0); ct.refresh(); ct.setFilter(Phaser.Textures.FilterMode.NEAREST);
  };
  const kind = c => { if (!c) return ''; const [r, g, b] = c, mx = Math.max(r, g, b), mn = Math.min(r, g, b), lum = (r * 0.3 + g * 0.59 + b * 0.11) / 255;
    if (lum < 0.22) return 'ink'; if (r > 170 && g < 90 && b < 90) return 'red'; if (b > r + 30 && b > 120 && (mx - mn) > 50) return 'blue'; if ((mx - mn) / (mx || 1) <= 0.22 && lum >= 0.3) return 'pale'; return 'other'; };
  copy('c_body', (get, put, w, h) => {
    const pale = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = get(x, y), k = kind(c); if (!k) continue;
      if (k === 'pale') { const lum = (c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11) / 255; pale.push([x, y]); put(x, y, lum > 0.93 ? PL[0] : lum > 0.8 ? PL[1] : PL[2]); }
      else if (k === 'red') put(x, y, y > 24 ? TR[1] : TR[0]);                 // the hem and shoulder flash become trim
      else if (k === 'blue') { const d = Math.hypot(x - 12.5, y - 12.5); put(x, y, d < 1.8 ? EM[0] : d < 3.4 ? 0xffd23f : EM[1]); }   // the badge becomes a glowing cheese reactor
    }
    const isP = new Set(pale.map(([x, y]) => x + ',' + y)), on = (x, y) => isP.has(x + ',' + y);
    for (const [x, y] of pale) {                                                // a lit top edge, panel lines, an ember seam, rivets
      if (!on(x, y - 1) && kind(get(x, y - 1)) === 'ink' && y < 14) put(x, y, HI);
      if (y === 17 && x > 6 && x < 30) put(x, y, PL[2]);
      if (y === 18 && x > 6 && x < 30) put(x, y, x % 3 ? EM[1] : EM[0]);
      if (x === 21 && y > 4 && y < 17) put(x, y, PL[2]);
      if (y === 22 && x > 8 && x < 26 && x % 4 === 0) put(x, y, TR[0]);
      if (y === 7 && (x === 8 || x === 18 || x === 25)) put(x, y, TR[0]);
      if (y === 6 && x > 23 && x < 34) put(x, y, TR[1]);                        // a pauldron rim over the shoulder
      if (y === 10 && x > 26 && x < 35) put(x, y, TR[2]);
    }
    if (hot) for (const [x, y] of [[9, 20], [15, 20], [24, 20], [29, 14]]) if (on(x, y)) put(x, y, EM[0]);
  });
  copy('c_hat', (get, put, w, h) => {                                           // the toque stays white: a black studded band, a cheese-wedge badge
    const curve = x => 3.2 * (1 - Math.pow((x + 0.5 - 20.5) / 12, 2));
    for (let x = 8; x <= 33; x++) { const c = curve(x), y0 = Math.round(25 + c * 0.6), y1 = Math.round(31 + c);
      for (let y = y0; y <= y1; y++) put(x, y, y === y0 ? TR[1] : y === y1 ? TR[2] : (y === y0 + 1 ? PL[0] : PL[1]));
      if (x % 4 === 2) put(x, Math.round((y0 + y1) / 2), hot ? EM[0] : TR[0]); }
    for (const [x, y, c] of [[20, 26, TR[0]], [19, 27, TR[0]], [20, 27, TR[1]], [21, 27, TR[0]], [18, 28, TR[1]], [19, 28, EM[1]], [20, 28, TR[1]], [21, 28, TR[1]], [22, 28, TR[0]], [18, 29, TR[2]], [19, 29, TR[2]], [20, 29, TR[2]], [21, 29, TR[2]], [22, 29, TR[2]]]) put(x, y + 1, c);
  });
}
ChrisRig.prototype.setArmour = function (on, mk) {
  mk = Math.max(1, Math.min(4, mk || this.armourMk || 1));
  if (!!on === !!this.armoured && (!on || mk === this.armourMk)) return;
  this.armoured = !!on; this.armourMk = mk;
  const sc = this.root.scene; if (on) makeArmourTextures(sc, mk);
  const set = (o, key) => { const ak = '__ar' + mk + '_' + key; o.setTexture(on && sc.textures.exists(ak) ? ak : key); };
  set(this.tanks, 'c_tanks'); set(this.legB, 'c_leg'); set(this.legF, 'c_leg'); set(this.bootB, 'c_boot'); set(this.bootF, 'c_boot');
  set(this.body, 'c_body'); set(this.armB, 'c_arm'); set(this.gArm, 'c_arm'); set(this.hat, 'c_hat'); set(this.grip, 'c_grip'); set(this.handB, 'c_hand_open');
  this.wear.setVisible(!on);                                                    // (the popped stitches are under the plate)
  if (on && !this.helm) {                                                       // the helmet ring, and the reactor's glow
    this.helm = sc.add.image(0, 0, 'blank').setOrigin(0.5); this.arGlow = sc.add.image(-9.5, -26.5, 'blank').setOrigin(0.5).setBlendMode(Phaser.BlendModes.ADD);
    this.torso.addAt(this.helm, this.torso.getIndex(this.hat)); this.torso.addAt(this.arGlow, this.torso.getIndex(this.body) + 1);
  }
  if (this.helm) { this.helm.setVisible(on); this.arGlow.setVisible(on); if (on) { this.helm.setTexture('__ar' + mk + '_c_helm'); this.arGlow.setTexture('__ar' + mk + '_c_glow'); } }
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
  // (v2.53) Chris's faces at the wheel: on the edge of his seat, over the moon, gutted
  { const SKIN = [0xffd9c4, 0xf2b593, 0xc9805e], HAIR = 0x5a3216, INK = 0x1a1020;
    const base = (a, mouth) => {
      a.ell(15, 15, 14, 14, [0xe8f8ff, 0xb8e0ff, 0x7ab0e0]); a.ell(15, 16, 11, 11.5, SKIN);
      a.ell(16, 17.5, 3.4, 3, [0xff9a9a, 0xe03a3a, 0xa01818]); a.px(15, 16, 0xffffff);
      mouth(a);
      a.px(5, 6, 0xffffff); a.px(6, 5, 0xffffff); a.px(7, 5, 0xffffff); a.px(4, 8, 0xffffff);
    };
    const tache = (a, droop) => a.poly([[5, 22 + droop], [9, 19], [15, 20.5], [21, 19], [26, 21 + droop], [28, 18 + droop * 2], [27, 23 + droop], [21, 23], [15, 22.5], [9, 23], [3, 24 + droop], [2, 20 + droop * 2]], HAIR);
    pixSprite(scene, 'c_head_hope', 30, 30, a => base(a, a => {          // wide eyes glued to the wheel, brows up, teeth clenched
      a.line([[6, 7], [12, 6]], HAIR, 2); a.line([[18, 5], [24, 6]], HAIR, 2);
      a.ell(9.5, 12, 3, 3.2, 0xffffff); a.ell(20.5, 12, 3.2, 3.4, 0xffffff); a.rect(11, 11, 12, 12, INK); a.rect(22, 11, 23, 12, INK);
      tache(a, 0); a.rect(11, 24, 19, 26, 0xffffff); a.line([[11, 25], [19, 25]], 0x8a7a7a);
    }));
    pixSprite(scene, 'c_head_joy', 30, 30, a => base(a, a => {            // eyes squeezed shut, huge open grin
      a.line([[6, 6], [12, 5]], HAIR, 2); a.line([[18, 4], [24, 6]], HAIR, 2);
      a.line([[7, 12], [9.5, 9.5], [12, 12]], INK, 2); a.line([[18, 12], [20.5, 9.5], [23, 12]], INK, 2);
      a.ell(15, 25, 6, 4, [0x8a1a2a, 0x5a0a14, 0x3a0510]); a.rect(10, 22, 20, 23, 0xffffff); a.ell(15, 27, 3, 1.5, 0xff7a8a);
      tache(a, -1);
    }));
    pixSprite(scene, 'c_head_sad', 30, 30, a => base(a, a => {            // brows up in the middle, droopy eyes, a tear, the tache sags
      a.line([[6, 11], [12, 8]], HAIR, 2); a.line([[18, 8], [24, 11]], HAIR, 2);
      a.rect(7, 13, 12, 13, INK); a.rect(18, 13, 23, 13, INK); a.px(8, 14, INK); a.px(22, 14, INK);
      a.rect(23, 15, 23, 17, 0x7ad0ff); a.px(23, 18, 0xc8f0ff);
      tache(a, 2); a.line([[11, 27], [15, 25.5], [19, 27]], INK, 1);
    })); }
  // (v2.53) shelf icons
  pixSprite(scene, 'si_armour', 30, 30, a => {                           // BLACK RIND: a riveted gunmetal breastplate
    const GM = [0x6a7a98, 0x3a4256, 0x1c2030];
    a.poly([[4, 6], [11, 3], [15, 6], [19, 3], [26, 6], [27, 18], [21, 27], [15, 29], [9, 27], [3, 18]], GM);
    a.poly([[15, 6], [19, 3], [26, 6], [27, 18], [21, 27], [15, 29]], [0x4a546c, 0x2a3044, 0x161a26]);
    a.line([[15, 7], [15, 27]], 0x8a9ab8); a.line([[6, 12], [13, 13]], 0x8a9ab8); a.line([[17, 13], [24, 12]], 0x5a6680);
    for (const [x, y] of [[7, 8], [23, 8], [6, 17], [24, 17], [15, 24]]) { a.px(x, y, 0xc8d4ea); a.px(x + 1, y + 1, 0x10141e); }
    a.line([[9, 20], [12, 22]], 0x10141e); a.px(20, 9, 0xffb052);
  }, true);
  pixSprite(scene, 'si_patch', 30, 30, a => {                            // a welding torch on a steel plate, sparks
    a.rrect(3, 14, 21, 27, 2, [0x8a96aa, 0x5a6272, 0x30364a]); for (const [x, y] of [[5, 16], [19, 16], [5, 25], [19, 25]]) a.px(x, y, 0x1a1020);
    a.line([[9, 20], [16, 21]], 0xffb052, 2);
    a.rrect(16, 4, 27, 9, 2, [0xff7a5a, 0xc8402a, 0x7a1a10]); a.line([[16, 7], [10, 15]], 0x9aa4b4, 3); a.line([[16, 7], [10, 15]], 0x5a6272, 1);
    a.ell(9, 16, 2, 2, 0xffffff); for (const [x, y] of [[6, 12], [5, 17], [12, 12], [7, 10]]) a.px(x, y, 0xffd23f);
  }, true);
  pixSprite(scene, 'si_boots', 30, 28, a => {                            // a pair of chunky moon boots with spring soles
    const BT = [0xdfe6f0, 0x9aa4b4, 0x5a6272], SP = 0xffb052;
    for (const ox of [0, 11]) {
      a.rrect(3 + ox, 4, 12 + ox, 16, 2, BT); a.rrect(2 + ox, 13, 17 + ox, 19, 3, BT); a.rect(3 + ox, 7, 12 + ox, 8, 0x2a7a72);
      for (let k = 0; k < 3; k++) a.line([[4 + ox, 21 + k * 2], [15 + ox, 21 + k * 2]], SP);
    }
  }, true);
  pixSprite(scene, 'si_tank', 26, 30, a => {                            // (v2.55) a jetpack tank: two steel cylinders, a gauge, flames
    const ST = [0xdfe6f0, 0x9aa4b4, 0x5a6272];
    a.rrect(3, 3, 11, 23, 4, ST); a.rrect(14, 3, 22, 23, 4, ST); a.rect(3, 10, 22, 13, 0x2a7a72); a.rect(11, 6, 14, 20, 0x5a6272);
    a.ell(12.5, 11.5, 3, 3, [0xffffff, 0xdfe6f0, 0x9aa4b4]); a.line([[12.5, 11.5], [14, 10]], 0xd0302a);
    a.poly([[4, 23], [10, 23], [7, 29]], [0xfff6c0, 0xffb52a, 0xff6a1a]); a.poly([[15, 23], [21, 23], [18, 29]], [0xfff6c0, 0xffb52a, 0xff6a1a]);
    a.px(5, 5, 0xffffff); a.px(16, 5, 0xffffff);
  }, true);
  pixSprite(scene, 'si_chip', 14, 14, a => {                             // a little circuit chip (goes on the gun)
    a.rect(2, 2, 11, 11, 0x1a1020); a.rect(3, 3, 10, 10, 0x2a7a72); a.rect(5, 5, 8, 8, 0x5cffe0);
    for (let k = 3; k <= 10; k += 2) { a.px(k, 0, 0xffd23f); a.px(k, 13, 0xffd23f); a.px(0, k, 0xffd23f); a.px(13, k, 0xffd23f); }
  }, true);
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
      kb.on('keydown-ESC', () => { if (!this.spin) this.back(); });
    }
    const padOff = Pad.on(b => { if (this.spin) { const S = this.spin; if (S.pick) { const i = { x: 0, a: 1, b: 2, left: 0, down: 1, right: 2 }[b]; if (S.pick[i]) this.pickGun(S.pick[i]); else if (b === 'a') this.pickGun(S.pick[0]); } else if (b === 'y' || b === 'x' || b === 'a') this.pullLever(); else if (b === 'b' || b === 'back' || b === 'start') this.endSpin(); return; } if (b === 'y' || b === 'x') { this.startSpin(); return; } if (b === 'up' || b === 'down') this.move(b === 'up' ? -1 : 1); else if (b === 'a') this.buy(this.sel); else if (b === 'b' || b === 'back' || b === 'start') this.back(); });
    this.events.once('shutdown', padOff);
    this.spin = null; this.spinG = this.add.graphics().setDepth(10); this.moodG = this.add.graphics().setDepth(11.5); this.spinT = []; this.spinI = []; this.spinB = [];
    if (kb) { kb.on('keydown-L', () => this.startSpin()); kb.on('keydown-SPACE', () => { if (this.spin) this.pullLever(); }); kb.on('keydown-ESC', () => { if (this.spin) this.endSpin(); }); kb.on('keydown-ENTER', () => { if (this.spin) this.endSpin(); }); ['ONE', 'TWO', 'THREE'].forEach((k, i) => kb.on('keydown-' + k, () => { if (this.spin && this.spin.pick && this.spin.pick[i]) this.pickGun(this.spin.pick[i]); })); }
    this.input.on('pointermove', p => { if (this.spin || p.wasTouch) return; const i = (this.rows || []).findIndex(r => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h); if (i >= 0 && i !== this.sel) { this.sel = i; this.showInfo(); } });
    this.input.on('pointerdown', p => {
      if (this.spin) {
        const S = this.spin;
        if (S.pick) { const hit = (S.pickBoxes || []).find(q => p.x >= q.x && p.x <= q.x + q.w && p.y >= q.y && p.y <= q.y + q.h); if (hit) this.pickGun(hit.gun); return; }
        const L = this.leverBox; if (L && p.x >= L.x && p.x <= L.x + L.w && p.y >= L.y && p.y <= L.y + L.h) { this.pullLever(); return; }
        const B = this.leaveBox; if (B && p.x >= B.x && p.x <= B.x + B.w && p.y >= B.y && p.y <= B.y + B.h) { this.endSpin(); return; }
        if ((S.done && S.doneT > 0.4) || S.idle) this.endSpin(); return; }
      if (this.spinBox && p.x >= this.spinBox.x && p.x <= this.spinBox.x + this.spinBox.w && p.y >= this.spinBox.y && p.y <= this.spinBox.y + this.spinBox.h) { this.startSpin(); return; }
      if (this.backBox && p.x >= this.backBox.x && p.x <= this.backBox.x + this.backBox.w && p.y >= this.backBox.y && p.y <= this.backBox.y + this.backBox.h) { this.back(); return; }
      const i = (this.rows || []).findIndex(r => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
      if (i >= 0) { if (this.sel === i) this.buy(i); else { this.sel = i; Sound.sfx('jump'); this.showInfo(); } }      // (v2.53: tap a tile to see what it is, tap again to buy)
    });
  }
  // what's on the shelves right now (it depends on what is owned): { name, desc, cost, can, why, act }
  items() {
    const reg = this.registry, s = Shop.get(reg), L = [], lives = reg.get('lives') || 0;
    const mk = ['', 'Mk I', 'Mk II', 'Mk III', 'Mk IV'];
    if (s.armMk > 0 && s.armHp <= 0) {
      const c = 80 + s.armMk * 30;
      L.push({ name: 'RE-FORGE BLACK RIND ' + mk[s.armMk], label: 'RE-FORGE', icon: 'si_armour', pips: [s.armMk, 4], desc: 'It shattered. Forge it again: ' + SHOP.armHp[s.armMk] + ' plates.', cost: c, act: q => { q.armHp = SHOP.armHp[q.armMk]; } });
    } else if (s.armMk < 4) {
      const n = s.armMk + 1;
      L.push({ name: (s.armMk ? 'UPGRADE TO ' : 'FORGE ') + 'BLACK RIND ' + mk[n], label: 'BLACK RIND', icon: 'si_armour', pips: [s.armMk, 4], desc: SHOP.armHp[n] + ' armour plates that soak hits before your cheese does.', cost: SHOP.armCost[n], act: q => { q.armMk = n; q.armHp = SHOP.armHp[n]; } });
    } else L.push({ name: 'BLACK RIND Mk IV', label: 'BLACK RIND', icon: 'si_armour', pips: [4, 4], desc: 'The best there is.', cost: 0, max: true });
    const miss = s.armMk > 0 && s.armHp > 0 ? SHOP.armHp[s.armMk] - s.armHp : 0;
    L.push({ name: 'PATCH UP ARMOUR', label: 'PATCH UP', icon: 'si_patch', desc: miss > 0 ? 'Weld on the ' + miss + ' missing plate' + (miss > 1 ? 's' : '') + '.' : (s.armHp > 0 ? 'Not a scratch on it.' : 'Nothing to patch.'), cost: miss * SHOP.patchCost, max: miss <= 0, act: q => { q.armHp = SHOP.armHp[q.armMk]; } });
    if (s.boots < 4) L.push({ name: 'MOON BOOTS LV ' + (s.boots + 1), label: 'MOON BOOTS', icon: 'si_boots', pips: [s.boots, 4], desc: 'Run faster, jump higher, and the jetpack sips less fuel.', cost: SHOP.bootCost[s.boots + 1], act: q => { q.boots++; } });
    else L.push({ name: 'MOON BOOTS LV 4', label: 'MOON BOOTS', icon: 'si_boots', pips: [4, 4], desc: 'Fully sprung.', cost: 0, max: true });
    { const k = s.tank || 0;
      if (k < 3) L.push({ name: 'JET TANK LV ' + (k + 1), label: 'JET TANK', icon: 'si_tank', pips: [k, 3], desc: 'A bigger jetpack tank: burns ' + (12 * (k + 1)) + '% slower and refills faster.', cost: SHOP.tankCost[k + 1], act: q => { q.tank = (q.tank || 0) + 1; } });
      else L.push({ name: 'JET TANK LV 3', label: 'JET TANK', icon: 'si_tank', pips: [3, 3], desc: 'As big as they come.', cost: 0, max: true }); }
    if (!s.magnet) L.push({ name: 'MAGNET FORK, FOR KEEPS', label: 'MAGNET FORK', icon: 'pu_magnet', desc: 'Cheddar flies up to you, even from below. Spare forks pay 40.', cost: SHOP.magnetCost, act: q => { q.magnet = true; } });
    else L.push({ name: 'MAGNET FORK, FOR KEEPS', label: 'MAGNET FORK', icon: 'pu_magnet', desc: 'Yours. Spare forks you find pay 40 cheddar.', cost: 0, max: true });
    for (const w of WEAPONS) {
      const c = Math.max((s.chips || {})[w.id] || 0, this.gunLvOf(w) - 1);   // (v2.49: a level won on the Lucky Wheel counts too, so you can't buy it again)
      if (c < 3) L.push({ name: w.short + ' START CHIP ' + (c + 1), label: w.short + ' CHIP', icon: w.gunTex, chip: true, pips: [c, 3], desc: 'Starts at LEVEL ' + (c + 2) + ', and falls back to it when a life is lost.', cost: SHOP.chipCost[c + 1], act: q => { q.chips = Object.assign({}, q.chips); q.chips[w.id] = c + 1; } });
      else L.push({ name: w.short + ' START CHIP 3', label: w.short + ' CHIP', icon: w.gunTex, chip: true, pips: [3, 3], desc: 'Always starts at LEVEL 4.', cost: 0, max: true });
    }
    { const hN = s.hearts || 0;
      if (hN < 2) L.push({ name: 'EXTRA HEART ' + (hN + 1), label: 'EXTRA HEART', icon: 'hud_cheese', pips: [hN, 2], desc: 'You have ' + (CFG.maxHp + hN + (s.burgers || 0)) + '. This makes it ' + (CFG.maxHp + hN + (s.burgers || 0) + 1) + '. (Cheeseburgers add more.)', cost: SHOP.heartCost[hN + 1], act: q => { q.hearts = hN + 1; } });
      else L.push({ name: 'EXTRA HEART 2', label: 'EXTRA HEART', icon: 'hud_cheese', pips: [2, 2], desc: 'Sold out. Eat cheeseburgers for more.', cost: 0, max: true }); }
    L.push({ name: 'EXTRA LIFE', label: 'EXTRA LIFE', icon: 'c_head', desc: 'You have ' + lives + '. (' + CFG.maxLives + ' at most.)', cost: SHOP.lifeCost, max: lives >= CFG.maxLives, act: () => { reg.set('lives', Math.min(CFG.maxLives, (reg.get('lives') || 0) + 1)); } });
    return L;
  }
  // ---- the lucky wheel (v2.53: a lever, respins, Chris sweating it out, and a rugged look: caged work lamps, steel, rust)
  startSpin() {                                          // open the wheel and pull the lever straight away
    if (this.going) return;
    if (!this.spin) {
      if (Shop.spinsLeft() <= 0) { Sound.sfx('clunk'); this.say('NO SPINS LEFT. EVERY GOLDEN WHEEL YOU FIND IS ONE SPIN.'); return; }
      this.spin = { idx: 0, a0: this.spinA || 0, a1: this.spinA || 0, t: 0, dur: 3.6, done: false, idle: true, lastSeg: 0, msg: '', lever: 0, mood: 'hope', moodT: 0 };
    }
    this.pullLever();
  }
  pullLever() {
    const S = this.spin; if (!S || S.pull || S.pick || (!S.idle && !S.done)) return;
    if (Shop.spinsLeft() <= 0) { Sound.sfx('clunk'); S.lever = 0.25; S.msg = 'NO SPINS LEFT'; S.mood = 'sad'; S.moodT = 0; return; }
    Shop.useSpin(); Sound.sfx('clang');
    let tot = 0; for (const q of SPIN) tot += q[1];
    let r = Math.random() * tot, idx = 0; for (let i = 0; i < SPIN.length; i++) { r -= SPIN[i][1]; if (r <= 0) { idx = i; break; } }
    const seg = Math.PI * 2 / SPIN.length, a0 = S.done ? S.a1 % (Math.PI * 2) : S.a0;
    let a1 = -Math.PI / 2 - (idx + 0.5 + (Math.random() - 0.5) * 0.6) * seg; while (a1 < a0 + Math.PI * 9) a1 += Math.PI * 2;
    Object.assign(S, { idx, a0, a1, t: 0, dur: 3.6, done: false, idle: false, pull: 0.001, msg: '', mood: 'hope', moodT: 0, sparks: [], conf: [] });
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
    Shop.set(reg, s); Sound.sfx('power'); this.cameras.main.flash(160, 255, 200, 120);
    return msg;
  }
  // how Chris takes it: 'joy' (a good one), 'meh' (small change), 'sad' (the rat)
  moodOf(idx) { const k = SPIN[idx][0]; return k === 'RAT!' ? 'sad' : (k === '30' || k === 'PLATE') ? 'meh' : 'joy'; }
  gunLvOf(w) { const g = this.registry.get('gunLv') || {}, s = Shop.get(this.registry); return Math.max(g[w.id] || 1, 1 + ((s.chips || {})[w.id] || 0)); }
  pickGun(w) {
    const S = this.spin; if (!S || !S.pick || !S.pick.includes(w)) return;
    const g = Object.assign({}, this.registry.get('gunLv') || {}); g[w.id] = this.gunLvOf(w) + 1; this.registry.set('gunLv', g);
    { const q = Shop.get(this.registry); q.chips = Object.assign({}, q.chips); q.chips[w.id] = Math.max(q.chips[w.id] || 0, g[w.id] - 1); Shop.set(this.registry, q); }   // (it's a start chip: the shop moves on to the next one)
    S.pick = null; S.msg = w.name + ' UP TO LEVEL ' + g[w.id] + '!'; S.dur = Math.min(S.dur, S.t); this.say(S.msg);
    Sound.sfx('power'); this.cameras.main.flash(160, 255, 200, 120);
  }
  endSpin() {
    const S = this.spin; if (!S || S.pick || S.pull || (!S.done && !S.idle)) return;
    this.spinA = (S.done ? S.a1 : S.a0) % (Math.PI * 2); this.spin = null; this.spinG.clear(); this.moodG.clear();
    this.spinT.forEach(t => t.setVisible(false)); (this.spinB || []).forEach(t => t.setVisible(false)); (this.spinI || []).forEach(t => t.setVisible(false));
    this.rig.setFace(null); this.rig.root.setDepth(3); Object.assign(this.rigP, { h: 0, vh: 0, duck: false, aimA: 0, facing: 1 });
    this.build();
  }
  spinGeom() {
    const W = this.scale.width, H = this.scale.height, R0 = Math.min(H * 0.3, W * 0.19), cx = W * 0.52, cy = Math.max(R0 + 34, H * 0.44);
    return { W, H, R0, cx, cy, RG: R0 + 14, lx: cx + R0 + 62, ly: cy + 6 };
  }
  drawSpin(dt, t) {
    const S = this.spin, g = this.spinG, n = SPIN.length, seg = Math.PI * 2 / n;
    const { W, H, R0, cx, cy, RG, lx, ly } = this.spinGeom();
    // the lever: yanked down, then it springs back. The wheel lets go as it bottoms out.
    if (S.pull) { S.pull += dt; S.lever = S.pull < 0.28 ? S.pull / 0.28 : Math.max(0, 1 - (S.pull - 0.28) / 0.35); if (S.pull > 0.3 && !S.go) { S.go = true; Sound.sfx('whoosh'); this.cameras.main.shake(90, 0.004); } if (S.pull > 0.63) { S.pull = 0; S.go = false; } }
    else S.lever = Math.max(0, (S.lever || 0) - dt * 3);
    const spinning = !S.idle && !S.done && (!S.pull || S.go);
    if (spinning) S.t += dt;
    const u = S.idle ? 0 : Math.min(1, S.t / S.dur), e = 1 - Math.pow(1 - u, 3.2), ang = S.idle ? S.a0 : S.a0 + (S.a1 - S.a0) * e;
    S.sparks = S.sparks || []; S.conf = S.conf || []; S.moodT += dt;
    const sN = Math.floor((ang + Math.PI / 2) / seg);
    if (sN !== S.lastSeg && spinning) { S.lastSeg = sN; Sound.sfx('blip'); S.kick = 1;
      for (let k = 0; k < 4; k++) S.sparks.push({ x: cx, y: cy - R0 - 2, vx: (Math.random() - 0.3) * 190, vy: -Math.random() * 170 - 20, l: 0.25 + Math.random() * 0.2 }); }
    if (!S.idle && u >= 1 && !S.done) {
      S.done = true; S.doneT = 0; S.msg = this.prize(S.idx); this.say(S.msg); S.mood = this.moodOf(S.idx); S.moodT = 0;
      if (S.mood === 'joy') for (let k = 0; k < 60; k++) S.conf.push({ x: cx + (Math.random() - 0.5) * R0 * 0.6, y: cy - R0 * 0.3, vx: (Math.random() - 0.5) * 420, vy: -Math.random() * 380 - 80, l: 0.7 + Math.random() * 0.9 });   // a shower of welding sparks
      if (S.mood === 'sad') Sound.sfx('clunk');
    }
    S.kick = Math.max(0, (S.kick || 0) - dt * 9); if (S.done) S.doneT = (S.doneT || 0) + dt;
    g.clear(); g.fillStyle(0x05060a, 0.9).fillRect(0, 0, W, H);
    const lit = S.done ? (S.mood === 'sad' ? (Math.random() < 0.08 ? 0.5 : 0.05) : (S.mood === 'joy' ? 0.75 + 0.25 * Math.sin(t * 22) : 0.6)) : 1;   // the lamps: on a win they strobe, the rat kills them
    // girders behind it, and the stand
    g.fillStyle(0x14161c, 1).fillRect(cx - RG * 1.55, cy - RG - 24, 12, H); g.fillRect(cx + RG * 1.55 - 12, cy - RG - 24, 12, H);
    for (let y = cy - RG - 24; y < H; y += 26) { g.lineStyle(2, 0x1c1f28, 1).lineBetween(cx - RG * 1.55 + 2, y, cx - RG * 1.55 + 10, y + 26); g.lineBetween(cx + RG * 1.55 - 10, y, cx + RG * 1.55 - 2, y + 26); }
    g.fillStyle(0x1a1c24, 1).fillRect(cx - RG * 1.55, cy - RG - 30, RG * 3.1, 10);
    g.fillStyle(0x0c0d12, 1).fillRect(cx - R0 * 0.5, cy + R0 * 0.6, R0, H);                                                     // the plinth
    for (let x = cx - R0 * 0.5; x < cx + R0 * 0.5; x += 14) g.fillStyle(0xc8902a, 0.85).fillTriangle(x, cy + RG + 8, x + 7, cy + RG + 8, x + 14, cy + RG + 18);   // hazard chevrons
    g.fillStyle(0x0c0d12, 1).fillRect(cx - R0 * 0.5, cy + RG + 18, R0, 4);
    // the housing: a heavy steel ring, bolted, scuffed
    g.fillStyle(0x0a0b10, 1).fillCircle(cx, cy, RG + 12); g.fillStyle(0x2c3038, 1).fillCircle(cx, cy, RG + 10); g.fillStyle(0x3a3f4a, 1).fillCircle(cx - 1.5, cy - 1.5, RG + 7);
    g.fillStyle(0x23262e, 1).fillCircle(cx, cy, RG + 1);
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6 + 0.26, bx = cx + Math.cos(a) * (RG + 6), by = cy + Math.sin(a) * (RG + 6); g.fillStyle(0x0a0b10, 1).fillCircle(bx + 1, by + 1, 2.6); g.fillStyle(0x8a929e, 1).fillCircle(bx, by, 2.2); }
    for (let k = 0; k < 7; k++) { const a = k * 2.1 + 0.7; g.fillStyle(0x5a3018, 0.55).fillCircle(cx + Math.cos(a) * (RG + 4), cy + Math.sin(a) * (RG + 4), 2 + (k % 3)); }   // rust
    g.fillStyle(0x0a0b10, 1).fillCircle(cx, cy, R0 + 2);
    // the slices: weathered paint, scuffs, a stencilled prize picture
    this.spinI = this.spinI || [];
    for (let i = 0; i < n; i++) {
      const a = ang + i * seg, win = S.done && i === S.idx, am = a + seg / 2, key = SPIN[i][0];
      g.fillStyle(SPIN[i][2], 1).slice(cx, cy, R0, a, a + seg, false).fillPath();
      if (win && S.mood !== 'sad') g.fillStyle(0xfff0c0, 0.25 + 0.2 * Math.sin(t * 16)).slice(cx, cy, R0, a, a + seg, false).fillPath();
      g.fillStyle(0x000000, 0.22).slice(cx, cy, R0, a, a + seg * 0.2, false).fillPath();
      g.fillStyle(0x000000, 0.18).slice(cx, cy, R0 * 0.36, a, a + seg, false).fillPath();
      for (let k = 0; k < 3; k++) { const ra = R0 * (0.45 + ((i * 7 + k * 5) % 9) / 20), aa = a + seg * (0.2 + ((i * 3 + k * 4) % 7) / 10); g.lineStyle(1, 0x000000, 0.3).lineBetween(cx + Math.cos(aa) * ra, cy + Math.sin(aa) * ra, cx + Math.cos(aa + 0.06) * (ra + 6), cy + Math.sin(aa + 0.06) * (ra + 6)); }
      g.lineStyle(3, 0x0a0b10, 1).lineBetween(cx, cy, cx + Math.cos(a) * R0, cy + Math.sin(a) * R0);
      g.fillStyle(0x9aa2ae, 1).fillCircle(cx + Math.cos(a) * (R0 - 5), cy + Math.sin(a) * (R0 - 5), 2.5); g.fillStyle(0x30343e, 1).fillCircle(cx + Math.cos(a) * (R0 - 5) + 1, cy + Math.sin(a) * (R0 - 5) + 1, 1.2);   // peg
      let im = this.spinI[i]; if (!im) im = this.spinI[i] = this.add.image(0, 0, 'wi_30').setDepth(10.1);
      const isNum = /^\d+$/.test(key), tex = isNum ? (key === '500' ? 'wi_500' : key === '60' ? 'wi_60' : 'wi_30') : key === 'RAT!' ? 'wi_rat' : key === 'PLATE' ? 'wi_plate' : key === 'GUN +1' ? 'wi_gun' : 'wi_life';
      const isc = Math.max(1, R0 / 76) * (win ? 1.15 : 1);
      im.setTexture(tex).setPosition(cx + Math.cos(am) * R0 * 0.64, cy + Math.sin(am) * R0 * 0.64).setRotation(am + Math.PI / 2).setScale(isc).setVisible(true).setAlpha(S.done && !win ? 0.55 : 1);
      let tx = this.spinT[i]; if (!tx) tx = this.spinT[i] = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '8px', color: '#f4e6c8', stroke: '#0a0b10', strokeThickness: 4 }).setOrigin(0.5).setDepth(10.15);
      tx.setText(isNum ? key : key === 'GUN +1' ? '+1' : key === 'LIFE' ? '1-UP' : '').setPosition(cx + Math.cos(am) * R0 * 0.35, cy + Math.sin(am) * R0 * 0.35).setRotation(am + Math.PI / 2).setVisible(true);
    }
    // hub: a big hex bolt through a gold cheese wheel
    g.fillStyle(0x0a0b10, 1).fillCircle(cx, cy, R0 * 0.21); g.fillStyle(0xc8902a, 1).fillCircle(cx, cy, R0 * 0.19); g.fillStyle(0xe8b850, 1).fillCircle(cx - 2, cy - 2, R0 * 0.12);
    { const hx = []; for (let k = 0; k < 6; k++) { const a = ang + k * Math.PI / 3; hx.push({ x: cx + Math.cos(a) * R0 * 0.1, y: cy + Math.sin(a) * R0 * 0.1 }); } g.fillStyle(0x0a0b10, 1).fillPoints(hx.map(q => ({ x: q.x + 1, y: q.y + 1 })), true); g.fillStyle(0x7a828e, 1).fillPoints(hx, true); g.fillStyle(0xb8c0cc, 1).fillCircle(cx - 1, cy - 1, R0 * 0.035); }
    // caged work lamps round the rim: tungsten amber, a slow chase while it spins
    const NB = 16, chase = Math.floor(t * 10);
    for (let k = 0; k < NB; k++) {
      const a = k * Math.PI * 2 / NB - Math.PI / 2 + Math.PI / NB, bx = cx + Math.cos(a) * (RG + 6), by = cy + Math.sin(a) * (RG + 6);
      let on = S.done ? lit * (0.85 + 0.15 * Math.sin(t * 40 + k * 3)) : spinning ? ((k + chase) % 4 < 2 ? 1 : 0.18) : 0.55 + 0.1 * Math.sin(t * 2 + k);
      if (S.done && S.mood === 'sad') on = Math.random() < 0.04 ? 0.6 : 0.05;
      if (on > 0.4) { g.fillStyle(0xff9a2a, 0.1 * on).fillCircle(bx, by, 16); g.fillStyle(0xffb04a, 0.18 * on).fillCircle(bx, by, 9); }
      g.fillStyle(0x0a0b10, 1).fillCircle(bx, by, 6); g.fillStyle(0x2c3038, 1).fillCircle(bx, by, 5);
      g.fillStyle(Phaser.Display.Color.GetColor(Math.round(70 + 185 * on), Math.round(40 + 150 * on), Math.round(14 + 70 * on)), 1).fillCircle(bx, by, 3.6);
      if (on > 0.6) g.fillStyle(0xfff4d8, on).fillCircle(bx - 0.8, by - 0.8, 1.3);
      g.lineStyle(1, 0x0a0b10, 1).strokeCircle(bx, by, 4.6); const c = Math.cos(a), sn = Math.sin(a);       // the wire cage
      g.lineBetween(bx - c * 5, by - sn * 5, bx + c * 5, by + sn * 5); g.lineBetween(bx + sn * 5, by - c * 5, bx - sn * 5, by + c * 5);
    }
    // rotating beacons up on the gantry, sweeping amber beams while it spins (and after a good one)
    for (const sd of [-1, 1]) {
      const bx = cx + sd * RG * 1.55 + (sd < 0 ? 6 : -6), by = cy - RG - 36, sweep = (spinning || (S.done && S.mood === 'joy'));
      if (sweep) { const ba = t * 7 * sd; for (const off of [0, Math.PI]) { const a1 = ba + off, c = Math.cos(a1); if (c > -0.2) { const len = 80 + 120 * c; g.fillStyle(0xffa030, 0.07 + 0.05 * c).fillTriangle(bx, by, bx + Math.sin(a1) * len - 14, by + len * 0.5, bx + Math.sin(a1) * len + 14, by + len * 0.5); } } }
      g.fillStyle(0x0a0b10, 1).fillRect(bx - 8, by + 4, 16, 6); g.fillStyle(0x3a3f4a, 1).fillRect(bx - 7, by + 5, 14, 4);
      g.fillStyle(0x0a0b10, 1).fillRoundedRect(bx - 7, by - 10, 14, 15, 4);
      const bOn = sweep ? (Math.sin(t * 14 * sd) > 0 ? 1 : 0.55) : (S.done && S.mood === 'sad' ? 0 : 0.2);
      g.fillStyle(Phaser.Display.Color.GetColor(Math.round(90 + 165 * bOn), Math.round(50 + 120 * bOn), 20), 1).fillRoundedRect(bx - 5.5, by - 8.5, 11, 12, 3);
      g.lineStyle(1, 0x0a0b10, 1).lineBetween(bx - 6, by - 4, bx + 6, by - 4); g.lineBetween(bx - 6, by, bx + 6, by); g.lineBetween(bx, by - 9, bx, by + 4);
    }
    // the pointer: a heavy steel clapper, knocked by every peg
    { const py = cy - R0, kx = S.kick * 5;
      g.fillStyle(0x0a0b10, 1).fillRect(cx - 10, py - 32, 20, 18); g.fillStyle(0x4a505c, 1).fillRect(cx - 8, py - 30, 16, 14); g.fillStyle(0x8a929e, 1).fillRect(cx - 8, py - 30, 16, 2); g.fillStyle(0x0a0b10, 1).fillCircle(cx, py - 23, 2.5);
      g.fillStyle(0x0a0b10, 1).fillTriangle(cx - 12 + kx, py - 18, cx + 12 + kx, py - 18, cx + kx * 0.3, py + 12);
      g.fillStyle(0x6a707c, 1).fillTriangle(cx - 9 + kx, py - 16, cx + 9 + kx, py - 16, cx + kx * 0.3, py + 8); g.fillStyle(0xa8b0bc, 1).fillTriangle(cx - 9 + kx, py - 16, cx - 3 + kx, py - 16, cx + kx * 0.3, py + 8);
      g.fillStyle(0xffb04a, 1).fillCircle(cx + kx * 0.3, py + 3, 1.6); }
    for (let i = S.sparks.length - 1; i >= 0; i--) { const q = S.sparks[i]; q.l -= dt; if (q.l <= 0) { S.sparks.splice(i, 1); continue; } q.vy += 500 * dt; const x0 = q.x, y0 = q.y; q.x += q.vx * dt; q.y += q.vy * dt;
      g.lineStyle(2, q.l > 0.2 ? 0xffffff : 0xffb52a, Math.min(1, q.l * 5)).lineBetween(x0, y0, q.x, q.y); }
    // THE LEVER: a slot in a steel box, a shaft with a black knob. Pull it to spin; it glows when there's a spin left.
    { const ready = (S.idle || (S.done && !S.pick)) && !S.pull, left = Shop.spinsLeft(), a = -1.05 + 2.0 * (S.lever || 0) + (ready && left ? Math.sin(t * 5) * 0.04 : 0);
      g.fillStyle(0x0a0b10, 1).fillRoundedRect(lx - 16, ly - 34, 32, 76, 5); g.fillStyle(0x2c3038, 1).fillRoundedRect(lx - 14, ly - 32, 28, 72, 4); g.fillStyle(0x3a3f4a, 1).fillRect(lx - 14, ly - 32, 28, 3);
      for (const [x, y] of [[-10, -28], [10, -28], [-10, 36], [10, 36]]) { g.fillStyle(0x8a929e, 1).fillCircle(lx + x, ly + y, 1.8); }
      g.fillStyle(0x0a0b10, 1).fillRoundedRect(lx - 3, ly - 24, 6, 56, 3);
      const L = 58, kx = lx + Math.cos(a) * L * 0.55, ky = ly + 4 + Math.sin(a) * L;
      g.lineStyle(7, 0x0a0b10, 1).lineBetween(lx, ly + 4, kx, ky); g.lineStyle(4, 0x9aa2ae, 1).lineBetween(lx, ly + 4, kx, ky); g.lineStyle(1, 0xd8dee8, 1).lineBetween(lx - 1, ly + 3, kx - 1, ky - 1);
      g.fillStyle(0x0a0b10, 1).fillCircle(lx, ly + 4, 6); g.fillStyle(0x6a707c, 1).fillCircle(lx, ly + 4, 4.5);
      if (ready && left) { g.fillStyle(0xff9a2a, 0.12 + 0.08 * Math.sin(t * 6)).fillCircle(kx, ky, 20); }
      g.fillStyle(0x0a0b10, 1).fillCircle(kx, ky, 10); g.fillStyle(0x7a1a18, 1).fillCircle(kx, ky, 8.5); g.fillStyle(0xb83a2a, 1).fillCircle(kx - 2, ky - 2, 5); g.fillStyle(0xffd0b8, 1).fillCircle(kx - 3.5, ky - 3.5, 1.6);
      this.leverBox = { x: lx - 34, y: ly - 70, w: 68, h: 130 };
      let lt = this.spinT[n + 2]; if (!lt) lt = this.spinT[n + 2] = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '7px', color: '#ffb04a', stroke: '#0a0b10', strokeThickness: 4, align: 'center' }).setOrigin(0.5, 0).setDepth(10.2);
      lt.setText(left > 0 ? (S.done ? 'RESPIN' : 'PULL') + '\n' + left + ' LEFT' : 'NO SPINS\nLEFT').setColor(left > 0 ? '#ffb04a' : '#5a6070').setPosition(lx, ly + 46).setRotation(0).setVisible(true).setAlpha(ready || !left ? 1 : 0.4); }
    // gun choice: stamped steel tags
    this.spinB = this.spinB || [];
    for (let i = 0; i < 3; i++) {
      let bt = this.spinB[i]; if (!bt) bt = this.spinB[i] = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '9px', color: '#1a1206', backgroundColor: '#d8a040', padding: { x: 10, y: 9 }, align: 'center' }).setOrigin(0.5).setDepth(10.3);
      const w = S.pick && S.pick[i];
      if (!w) { bt.setVisible(false); continue; }
      const bw = Math.min(190, W * 0.28), bx = cx + (i - (S.pick.length - 1) / 2) * (bw + 12);
      bt.setText(w.short + '  LV ' + this.gunLvOf(w) + ' > ' + (this.gunLvOf(w) + 1)).setPosition(bx, cy).setVisible(true).setScale(1 + 0.04 * Math.sin(t * 6 + i));
    }
    S.pickBoxes = S.pick ? S.pick.map((w, i) => { const bt = this.spinB[i]; return { gun: w, x: bt.x - bt.width / 2 - 6, y: bt.y - bt.height / 2 - 6, w: bt.width + 12, h: bt.height + 12 }; }) : null;
    // the sign: a riveted steel plate, the result stencilled on it
    let tt = this.spinT[n]; if (!tt) tt = this.spinT[n] = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '12px', color: '#ffb04a', stroke: '#0a0b10', strokeThickness: 5, align: 'center', wordWrap: { width: Math.min(W - 60, 520) } }).setOrigin(0.5).setDepth(10.2);
    const col = !S.done ? '#d8a040' : S.mood === 'sad' ? '#c8503a' : S.mood === 'joy' ? (Math.floor(t * 8) % 2 ? '#fff0c0' : '#ffb04a') : '#d8c8a0';
    tt.setText(S.done || S.msg ? S.msg : S.idle ? 'PULL THE LEVER' : 'THE LUCKY WHEEL').setVisible(true).setRotation(0).setColor(col);
    const mw = Math.max(200, tt.width + 44), mh = tt.height + 22, my = Math.min(H - mh / 2 - 6, cy + RG + 22 + mh / 2), mx = cx - mw / 2;
    tt.setPosition(cx, my);
    g.fillStyle(0x0a0b10, 1).fillRect(mx - 3, my - mh / 2 - 3, mw + 6, mh + 6); g.fillStyle(0x30343e, 1).fillRect(mx, my - mh / 2, mw, mh); g.fillStyle(0x3e434e, 1).fillRect(mx, my - mh / 2, mw, 3);
    for (const [x, y] of [[mx + 5, my - mh / 2 + 5], [mx + mw - 5, my - mh / 2 + 5], [mx + 5, my + mh / 2 - 5], [mx + mw - 5, my + mh / 2 - 5]]) { g.fillStyle(0x0a0b10, 1).fillCircle(x + 0.8, y + 0.8, 2.2); g.fillStyle(0x9aa2ae, 1).fillCircle(x, y, 1.8); }
    let hint = this.spinT[n + 1]; if (!hint) hint = this.spinT[n + 1] = this.add.text(0, 0, 'TAP TO CARRY ON', { fontFamily: PIXEL, fontSize: '7px', color: '#8a8f9e', stroke: '#0a0b10', strokeThickness: 3 }).setOrigin(1, 1).setDepth(10.2);
    hint.setVisible(false);
    { const can = (S.done && !S.pick && S.doneT > 0.4 && !S.pull) || (S.idle && !S.pull), bw = 104, bh = 26, bx = 12, by = H - bh - 10;   // (v2.55) a proper LEAVE button
      g.fillStyle(0x0a0b10, 1).fillRect(bx - 2, by - 2, bw + 4, bh + 4); g.fillStyle(can ? 0x3a1a2a : 0x1a1418, 1).fillRect(bx, by, bw, bh); if (can) g.lineStyle(2, 0xc8902a, 1).strokeRect(bx, by, bw, bh);
      let lb = this.spinT[n + 3]; if (!lb) lb = this.spinT[n + 3] = this.add.text(0, 0, '< LEAVE', { fontFamily: PIXEL, fontSize: '9px', color: '#ffffff', stroke: '#0a0b10', strokeThickness: 3 }).setOrigin(0.5).setDepth(10.2);
      lb.setPosition(bx + bw / 2, by + bh / 2).setRotation(0).setVisible(true).setAlpha(can ? 1 : 0.35);
      this.leaveBox = { x: bx, y: by, w: bw, h: bh }; }
    for (let i = S.conf.length - 1; i >= 0; i--) { const q = S.conf[i]; q.l -= dt; if (q.l <= 0 || q.y > H + 10) { S.conf.splice(i, 1); continue; } q.vy += 600 * dt; const x0 = q.x, y0 = q.y; q.x += q.vx * dt; q.y += q.vy * dt;
      g.lineStyle(2, q.l > 0.5 ? 0xfff4d8 : 0xff9a2a, Math.min(1, q.l * 2)).lineBetween(x0, y0, q.x, q.y); }
    this.drawMood(dt, t);
  }
  // Chris beside the wheel: hands clasped, trembling, sweating... then leaping about, or sat on the floor under a cloud
  drawMood(dt, t) {
    const S = this.spin, mg = this.moodG, P = this.rigP, { cx, cy, RG, H } = this.spinGeom();
    mg.clear();
    const x = Math.max(60, cx - RG - 86), y = Math.min(H - 20, cy + RG + 4);
    const mood = (S.done || S.msg === 'NO SPINS LEFT') ? S.mood : 'hope';
    S.cx = x; S.gy = y;
    if (mood === 'joy') {                                 // bouncing, gun in the air
      if (P.h <= 0 && P.vh <= 0) { P.vh = 420; Sound.sfx('jump'); }
      P.vh -= 1500 * dt; P.h = Math.max(0, P.h + P.vh * dt); P.aimA = 1.2; P.duck = false; P.firing = Math.floor(t * 8) % 2 ? 0.1 : 0;
      for (let k = 0; k < 3; k++) { const a = t * 3 + k * 2.1, r = 34 + 6 * Math.sin(t * 5 + k); mg.fillStyle(0xffd23f, 0.9).fillRect(x + Math.cos(a) * r - 1.5, y - 70 - P.h * 1.5 + Math.sin(a) * r * 0.5 - 1.5, 3, 3); }
    } else if (mood === 'sad' || mood === 'meh') {         // slumped; the rat gets a little rain cloud
      P.h = 0; P.vh = 0; P.aimA = -0.35; P.duck = mood === 'sad'; P.firing = 0;
      if (mood === 'sad') {
        const k = Math.min(1, S.moodT / 0.6), cy2 = y - 150 + 10 * (1 - k);
        for (const [ox, oy, r] of [[-16, 2, 12], [0, -4, 15], [16, 2, 12], [6, 6, 11], [-8, 6, 11]]) { mg.fillStyle(0x0a0b10, 0.9 * k).fillCircle(x + ox, cy2 + oy + 1, r + 1); mg.fillStyle(0x4a505c, 0.95 * k).fillCircle(x + ox, cy2 + oy, r); }
        for (let i = 0; i < 6; i++) { const ry = (t * 160 + i * 31) % 70; mg.lineStyle(1.5, 0x7ab0e0, 0.8 * k).lineBetween(x - 18 + i * 7, cy2 + 12 + ry, x - 20 + i * 7, cy2 + 18 + ry); }
      }
    } else {                                               // on the edge of his seat: a tremble, a bead of sweat, leaning in
      P.h = 0; P.vh = 0; P.duck = false; P.firing = 0; P.aimA = 0.2 + 0.1 * Math.sin(t * 9);
      const sx = x + 18 + Math.sin(t * 2) * 2, sy = y - 88 + ((S.moodT * 40) % 30);
      mg.fillStyle(0x0a0b10, 1).fillCircle(sx, sy + 1, 3.6); mg.fillStyle(0x9fd8ff, 1).fillCircle(sx, sy, 3); mg.fillTriangle(sx - 2.6, sy - 1, sx + 2.6, sy - 1, sx, sy - 7);
      if (!S.idle && !S.done) for (let k = 0; k < 2; k++) { const a = t * 6 + k * Math.PI; mg.lineStyle(2, 0xffffff, 0.6).lineBetween(x - 22 + k * 44, y - 80, x - 26 + k * 52 + Math.sin(a) * 3, y - 86); }   // shake lines
    }
    this.rig.setFace(mood === 'joy' ? 'c_head_joy' : (mood === 'sad' || mood === 'meh') ? 'c_head_sad' : 'c_head_hope');
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
    this.rig.setArmour(s.armHp > 0, s.armMk);
    { const left = Shop.spinsLeft(), bx = 22, bw2 = lw - 24, by2 = top + 78, bh2 = 34, sg = this.add.graphics();    // the LUCKY WHEEL button: a steel plate with the gold wheel
      sg.fillStyle(0x0a0b10, 1).fillRect(bx - 2, by2 - 2, bw2 + 4, bh2 + 4); sg.fillStyle(left > 0 ? 0x30343e : 0x14141c, 1).fillRect(bx, by2, bw2, bh2);
      if (left > 0) { sg.fillStyle(0x3e434e, 1).fillRect(bx, by2, bw2, 3); sg.lineStyle(2, 0xc8902a, 1).strokeRect(bx, by2, bw2, bh2); }
      this.ui.add(sg);
      this.ui.add(this.add.image(bx + 17, by2 + bh2 / 2, 'goldwheel').setScale(0.8).setAlpha(left > 0 ? 1 : 0.3));
      this.ui.add(this.add.text(bx + 34, by2 + 7, 'LUCKY WHEEL', f(8, left > 0 ? '#ffb04a' : '#6b7390', ink)));
      this.ui.add(this.add.text(bx + 34, by2 + 20, left > 0 ? left + ' SPIN' + (left > 1 ? 'S' : '') + ' LEFT' : 'NO SPINS LEFT', f(7, left > 0 ? '#ffffff' : '#4a5070')));
      this.spinBox = { x: bx, y: by2, w: bw2, h: bh2 }; }
    // (v2.53) the shelves: a grid of tiles, each a big picture, its name, level pips and a price tag
    const items = this.items(), x0 = lw + 22, rw = W - x0 - 12, backH = 24, n = items.length, gap = 6;
    const cols = Math.min(n, Math.max(3, Math.floor((rw + gap) / 104))), rowsN = Math.ceil(n / cols);
    const tw = (rw - gap * (cols - 1)) / cols, th = Math.min(150, (bot - top - backH - 8 - gap * (rowsN - 1)) / rowsN);
    this.rows = []; this.tileIcons = [];
    items.forEach((it, i) => {
      const c = i % cols, r = Math.floor(i / cols), x = x0 + c * (tw + gap), y = top + r * (th + gap), afford = !it.max && s.coins >= it.cost, gg = this.add.graphics();
      gg.fillStyle(0x0a0b10, 1).fillRect(x - 2, y - 2, tw + 4, th + 4);
      gg.fillStyle(it.max ? 0x15161c : 0x1c2030, 1).fillRect(x, y, tw, th); gg.fillStyle(it.max ? 0x1a1b22 : 0x262b3e, 1).fillRect(x, y, tw, 3);
      const iy = y + th * 0.4;
      gg.fillStyle(it.max ? 0x111218 : 0x111420, 1).fillCircle(x + tw / 2, iy, Math.min(tw, th) * 0.28);                     // a dark plinth behind the picture
      if (afford) gg.fillStyle(0xffb04a, 0.08).fillCircle(x + tw / 2, iy, Math.min(tw, th) * 0.32);
      for (const [px, py] of [[x + 4, y + 6], [x + tw - 4, y + 6], [x + 4, y + th - 4], [x + tw - 4, y + th - 4]]) gg.fillStyle(0x4a505c, 1).fillCircle(px, py, 1.4);
      // price tag along the bottom
      const ph = Math.min(18, th * 0.17), py = y + th - ph - 4;
      gg.fillStyle(0x0a0b10, 1).fillRect(x + 6, py, tw - 12, ph); gg.fillStyle(it.max ? 0x15161c : afford ? 0x3a2a12 : 0x2a1416, 1).fillRect(x + 7, py + 1, tw - 14, ph - 2);
      // level pips
      if (it.pips) { const [have, mx] = it.pips, pw = 8, pg = 3, tot = mx * pw + (mx - 1) * pg, pxs = x + tw / 2 - tot / 2, pyy = py - 9;
        for (let k = 0; k < mx; k++) { gg.fillStyle(0x0a0b10, 1).fillRect(pxs + k * (pw + pg) - 1, pyy - 1, pw + 2, 6); gg.fillStyle(k < have ? 0xffb04a : (k === have && !it.max ? 0x5a4a2a : 0x2a2e38), 1).fillRect(pxs + k * (pw + pg), pyy, pw, 4); } }
      this.ui.add(gg);
      const tex = this.textures.exists(it.icon) ? it.icon : 'cheddar', fr = this.textures.getFrame(tex), sc = Math.min((tw * 0.5) / fr.width, (th * 0.36) / fr.height, 4);
      const im = this.add.image(x + tw / 2, iy, tex).setScale(sc).setAlpha(it.max ? 0.35 : afford ? 1 : 0.7);
      if (it.max) im.setTint(0x9098a8);
      this.ui.add(im); this.tileIcons.push({ im, y: iy, sc });
      if (it.chip) this.ui.add(this.add.image(x + tw / 2 + fr.width * sc * 0.32, iy + fr.height * sc * 0.3, 'si_chip').setScale(Math.max(1.5, sc * 0.75)).setAlpha(it.max ? 0.4 : 1));
      this.ui.add(this.add.text(x + tw / 2, y + 8, it.label || it.name, f(7, it.max ? '#5a6070' : '#e8e0d0', ink)).setOrigin(0.5, 0));
      const pt = this.add.text(x + tw / 2 + (it.max ? 0 : 7), py + ph / 2, it.max ? 'MAXED' : String(it.cost), f(8, it.max ? '#5a6070' : afford ? '#ffe27a' : '#ff7a5a', ink)).setOrigin(0.5);
      this.ui.add(pt);
      if (!it.max) this.ui.add(this.add.image(pt.x - pt.width / 2 - 8, py + ph / 2, 'cheddar').setScale(1.2));
      this.rows.push({ x, y, w: tw, h: th });
    });
    const by = bot - backH, bw = 120;
    const bgx = this.add.graphics(); bgx.fillStyle(0x0a0b10, 1).fillRect(W - 12 - bw - 2, by - 2, bw + 4, backH + 4); bgx.fillStyle(0x3a1a2a, 1).fillRect(W - 12 - bw, by, bw, backH);
    this.ui.add(bgx); this.ui.add(this.add.text(W - 12 - bw / 2, by + backH / 2, 'BACK TO MAP', f(8, '#ffffff', ink)).setOrigin(0.5));
    this.backBox = { x: W - 12 - bw, y: by, w: bw, h: backH };
    this.ui.add(this.add.text(x0, by + backH / 2, (this.sys.game.device.input.touch ? 'TAP TO LOOK, TAP AGAIN TO BUY.' : 'CLICK TO BUY.') + ' LASTS UNTIL GAME OVER.', f(7, '#6b7390')).setOrigin(0, 0.5));
    if (this.sel >= n) this.sel = n - 1;
    // what the selected thing is: name and blurb in the panel on the left
    this.infoT = this.add.text(12 + lw / 2, top + 120, '', f(7, '#c9cde0', { align: 'center', wordWrap: { width: lw - 28 }, lineSpacing: 4 })).setOrigin(0.5, 0);
    this.ui.add(this.infoT); this.showInfo();
  }
  showInfo() {
    const it = this.items()[this.sel]; if (!it || !this.infoT) return;
    this.infoT.setText(it.name + '\n' + it.desc + (it.max ? '' : '\n' + it.cost + ' CHEDDAR'));
  }
  update(time, delta) {
    const W = this.scale.width, H = this.scale.height, t = time / 1000, dt = Math.min(0.05, delta / 1000);
    this.bg.clear();
    for (const s of this.stars) { this.bg.fillStyle(0xffffff, 0.3 + 0.5 * Math.abs(Math.sin(t * 1.5 + s.tw))).fillRect(Math.round(s.x * W), Math.round(s.y * H), s.s, s.s); }
    if (this.spin) this.drawSpin(dt, t);
    const S = this.stage; if (!S) return;
    if (this.spin && this.spin.cx !== undefined) {           // Chris comes to the wheel (over the dark), and sweats it out
      const sp = this.spin, shake = !sp.done && !sp.idle ? Math.sin(t * 60) * 1.2 : 0;
      this.rig.root.setDepth(11); this.rigP.facing = 1;
      this.rig.update(this.rigP, dt, Math.round(sp.cx + shake), Math.round(sp.gy - this.rigP.h * 1.6), 2, 1, Math.floor(t * 8) % 4);
    } else this.rig.update(this.rigP, dt, Math.round(S.x), Math.round(S.y), 1.5, 1, Math.floor(t * 8) % 4);
    if (this.tileIcons) this.tileIcons.forEach((q, i) => { const on = i === this.sel && !this.spin; q.im.setY(q.y + (on ? Math.sin(t * 5) * 2.5 : 0)).setScale(q.sc * (on ? 1.08 : 1)); });
    this.bot.setPosition(S.bx, S.y - 76 * 0.75 + Math.sin(t * 3) * 1.5).setScale(1.5).setRotation(Math.sin(t * 1.7) * 0.03);
    this.flashT = Math.max(0, this.flashT - dt);
    const r = this.rows[this.sel]; this.selG.clear();
    if (r) { this.selG.lineStyle(2, this.flashT > 0 ? 0xffffff : 0xffd23f, 0.6 + 0.4 * Math.sin(t * 6)).strokeRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6); }
    if (this.flashT > 0 && this.rows[this.flashRow]) { const q = this.rows[this.flashRow]; this.selG.fillStyle(0xffffff, this.flashT).fillRect(q.x, q.y, q.w, q.h); }
  }
}
