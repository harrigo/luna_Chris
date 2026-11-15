// ================================================================= RUN MODE (v3.05): a roguelite run, alongside the campaign
// ONE life. Five planets, with a fork at stages 2 and 4. Each planet is cut down to 3 waves (the first, one random
// middle one, the last) + its boss. Beat a boss -> pick 1 of 3 perks, then choose the next planet (and shop if you like).
// Cheddar, shop upgrades and perks last for this run only; the guns you've FOUND in the campaign come with you.
// The campaign's own lives / cheddar / shop / gun levels are put aside at the start and handed back at the end.
const RUN_ROUTE = [[1], [2, 3], [4], [5, 6], [7]];
const RUN_START_CHEDDAR = 60;

// the perk pool. can(s) = is it on offer, given the run's shop state s; act(s, reg) applies it (s = shop object, saved after)
const RUN_PERKS = [
  { id: 'boots',  name: 'ROCKET BOOTS', sub: 'FOREVER', icon: 'pu_boots', desc: 'The Rocket Boots power-up never wears off.', once: true },
  { id: 'sauce',  name: 'HOT SAUCE', sub: 'FOREVER', icon: 'pu_sauce', desc: 'Shots set rats alight and your gun barely runs dry.', once: true },
  { id: 'magnet', name: 'MAGNET FORK', sub: 'FOR KEEPS', icon: 'pu_magnet', desc: 'Cheddar flies to you from anywhere.', can: s => !s.magnet, act: s => { s.magnet = true; } },
  { id: 'heart',  name: '+1 HEART', sub: 'BIGGER BELLY', icon: 'hud_cheese', desc: 'One more cheese heart to lose.', can: (s, sc) => sc.hp < CFG.heartCap, act: s => { s.hearts = (s.hearts || 0) + 1; } },
  { id: 'armour', name: 'BLACK RIND', sub: '+1 MARK', icon: 'si_armour', desc: 'Armour plates that soak hits first. Fully mended.', can: s => (s.armMk || 0) < 4, act: s => { s.armMk = (s.armMk || 0) + 1; s.armHp = SHOP.armHp[s.armMk]; } },
  { id: 'mboots', name: 'MOON BOOTS', sub: '+1 LEVEL', icon: 'si_boots', desc: 'Run faster, jump higher, thriftier jetpack.', can: s => (s.boots || 0) < 4, act: s => { s.boots = (s.boots || 0) + 1; } },
  { id: 'tank',   name: 'JET TANK', sub: '+1 LEVEL', icon: 'si_tank', desc: 'A bigger jetpack tank that refills faster.', can: s => (s.tank || 0) < 3, act: s => { s.tank = (s.tank || 0) + 1; } },
  { id: 'chip',   name: 'GUN CHIP', sub: 'YOUR GUN +1', icon: null, desc: 'Your current gun starts a level higher.', can: s => !!runGun() && ((s.chips || {})[runGun().id] || 0) < 3, act: s => { const w = runGun(); s.chips = Object.assign({}, s.chips || {}); s.chips[w.id] = (s.chips[w.id] || 0) + 1; } },
  { id: 'wallet', name: 'FAT WALLET', sub: 'CHEDDAR x1.5', icon: 'cheddar', desc: 'Every bit of cheddar is worth half as much again.', once: true },
  { id: 'glass',  name: 'GLASS CHEESE', sub: 'RISKY', icon: 'wedge', desc: 'Hit 50% harder... but one heart fewer.', once: true, can: (s, sc) => sc.hp > 2 },
  { id: 'vamp',   name: 'CHEESE VAMPIRE', sub: 'MUNCH', icon: 'pu_ears', desc: 'Every 10 rats you squash mends a heart.', once: true },
  { id: 'life',   name: 'SECOND HELPING', sub: '+1 LIFE', icon: 'c_head', desc: 'One more go at a planet if you get grated.', can: (s, sc) => sc.lives < 2, act: (s, reg) => { reg.set('lives', (reg.get('lives') || 0) + 1); } }
];
function runGun() { let i = 0; try { i = +(localStorage.getItem('lc_weapon') || 0); } catch (e) { /* ignore */ } return WEAPONS[i] || WEAPONS[0]; }

const Run = {
  on: false, idx: 0, done: [], perks: {}, score: 0, earned: 0, kills: 0, t0: 0, saved: null, picked: [],
  best() { try { return JSON.parse(localStorage.getItem('lc_run_best') || 'null'); } catch (e) { return null; } },
  start(reg) {
    const keep = {}; for (const k of Object.keys(reg.getAll())) if (k.startsWith('oneup_')) keep[k] = reg.get(k);
    this.saved = { shop: reg.get('shop'), lives: reg.get('lives'), gunLv: reg.get('gunLv'), bonusHeart: reg.get('bonusHeart'), oneups: keep };
    for (const k of Object.keys(keep)) reg.remove(k);
    reg.set('shop', { coins: RUN_START_CHEDDAR, armMk: 0, armHp: 0, boots: 0, tank: 0, hearts: 0, spins: 0, chips: {} });
    reg.set('lives', 1); reg.set('gunLv', {}); reg.set('bonusHeart', false);
    Object.assign(this, { on: true, idx: 0, done: [], perks: {}, score: 0, earned: 0, kills: 0, t0: Date.now(), picked: [] });
  },
  // hand the campaign back exactly as it was
  restore(reg) {
    if (!this.on) return;
    this.on = false;
    const S = this.saved || {};
    for (const k of Object.keys(reg.getAll())) if (k.startsWith('oneup_')) reg.remove(k);
    reg.set('shop', S.shop || null); reg.set('lives', S.lives || 0); reg.set('gunLv', S.gunLv || {}); reg.set('bonusHeart', !!S.bonusHeart);
    for (const k of Object.keys(S.oneups || {})) reg.set(k, S.oneups[k]);
    this.saved = null;
  },
  stages() { return RUN_ROUTE.length; },
  // the run's summary, and the best run on this device ({ planets, score })
  finish(reg, how) {
    const sum = { how, planets: this.done.length, done: this.done.slice(), score: this.score, earned: this.earned, kills: this.kills, time: (Date.now() - this.t0) / 1000, perks: this.picked.slice() };
    const b = this.best();
    sum.newBest = !b || sum.planets > b.planets || (sum.planets === b.planets && sum.score > b.score);
    if (sum.newBest && how !== 'quit') try { localStorage.setItem('lc_run_best', JSON.stringify({ planets: sum.planets, score: sum.score })); } catch (e) { /* ignore */ }
    if (how === 'quit') sum.newBest = false;
    this.restore(reg);
    return sum;
  },
  // a stage's sub-set of waves: the first, one random middle wave, the last
  trimWaves(ws) {
    if (ws.length <= 3) return ws.slice();
    return [ws[0], ws[1 + Math.floor(Math.random() * (ws.length - 2))], ws[ws.length - 1]].map((w, i) => /^WAVE \d+$/.test(w.name) ? Object.assign({}, w, { name: 'WAVE ' + (i + 1) }) : w);
  },
  hpPenalty() { return this.on && this.perks.glass ? 1 : 0; },
  // 3 random perks on offer (never one that can't do anything)
  offer(reg) {
    const s = Shop.get(reg), lv = { hp: Math.min(CFG.heartCap, CFG.maxHp + (s.hearts || 0) + (s.burgers || 0)) - this.hpPenalty(), lives: reg.get('lives') || 0 };
    const pool = RUN_PERKS.filter(p => !(p.once && this.perks[p.id]) && (!p.can || p.can(s, lv)));
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    return pool.slice(0, 3);
  },
  take(reg, p) {
    this.perks[p.id] = (this.perks[p.id] || 0) + 1; this.picked.push(p.id);
    if (p.act) { const s = Shop.get(reg); p.act(s, reg); Shop.set(reg, s); }
  }
};

// FAT WALLET + the run's cheddar tally
(function () {
  const earn = Shop.earn;
  Shop.earn = function (reg, n) {
    if (Run.on && n > 0) { if (Run.perks.wallet) n = Math.round(n * 1.5); Run.earned += n; }
    return earn.call(this, reg, n);
  };
})();

// called from main.js once Level1 exists
function runInstall(L) {
  const P = L.prototype, buffOn = P.buffOn, hitK = P.hitK;
  P.buffOn = function (k) { return buffOn.call(this, k) || !!(Run.on && (k === 'boots' || k === 'sauce') && Run.perks[k]); };
  P.hitK = function (e, th, h) { const k = hitK.call(this, e, th, h); return Run.on && Run.perks.glass ? k * 1.5 : k; };
  Object.assign(P, {
    runKill(e) {
      Run.kills++;
      if (!Run.perks.vamp || e.type === 'boss') return;
      this.vampN = (this.vampN || 0) + 1;
      if (this.vampN >= 10) {
        this.vampN = 0;
        if (this.pl.hp < this.maxHp) { this.pl.hp++; this.updateHearts(); Sound.sfx('power'); this.popup(this.pl.theta, this.pl.h + 60, '+1 HEART', '#ff9db8', true); }
      }
    },
    // the boss is down and Bessie's safe: no ranks, no unlocks, no leaderboard - on to the next pick
    runWin() {
      Sound.say('woohoo', { force: true });
      this.state = 'won';
      Run.score += this.score; Run.done.push(this.levelId); Run.idx++;
      Sound.music('win'); this.endT = this.t;
      const last = Run.idx >= Run.stages();
      const mm = Math.floor(this.t / 60), ss = String(Math.floor(this.t % 60)).padStart(2, '0');
      this.showOverlay(last ? 'RUN COMPLETE!' : 'PLANET ' + Run.idx + '/' + Run.stages() + ' CLEAR!',
        (last ? 'Every planet. One life. Legend.' : this.def.win) + '\n\nTIME ' + mm + ':' + ss + '   HITS ' + this.hurtCount + '   SCORE ' + this.score +
        '\nRUN SCORE ' + Run.score + '   CHEDDAR ' + Shop.get(this.registry).coins + '\n\n' + (last ? 'Tap for the run summary' : 'Tap to pick a perk'));
    },
    runLost() {
      if (this.leavingGO) return; this.leavingGO = true;
      Run.score += this.score;
      const sum = Run.finish(this.registry, 'died'); sum.at = this.levelId;
      this.cameras.main.fadeOut(900, 0, 0, 0);
      this.time.delayedCall(950, () => { Sound.music(null); this.scene.start('runover', sum); });
    },
    // leave the level for 'select' / 'menu' - or, mid-run, give the run up
    leaveTo(key) {
      if (!Run.on) { this.scene.start(key); return; }
      Run.score += this.score;
      const sum = Run.finish(this.registry, 'quit'); sum.at = this.levelId;
      Sound.music(null); this.scene.start('runover', sum);
    }
  });
}

// ---------------------------------------------------------------- the between-planets screen: pick a perk, then a planet
const RUN_UI = {
  f: (size, color, extra) => Object.assign({ fontFamily: PIXEL, fontSize: size + 'px', color, stroke: '#1a1020', strokeThickness: 4 }, extra || {}),
  // a framed panel: dark ink outline, a full light frame (all four sides), dark fill
  panel(g, x, y, w, h, frame, fill, a) {
    g.fillStyle(0x1a1020, 1).fillRect(x - 3, y - 3, w + 6, h + 6);
    g.fillStyle(frame, 1).fillRect(x - 1, y - 1, w + 2, h + 2);
    g.fillStyle(fill, a === undefined ? 0.96 : a).fillRect(x, y, w, h);
  },
  stars(scene) {
    const s = []; for (let i = 0; i < 110; i++) s.push({ x: Math.random(), y: Math.random(), z: 1 + Math.floor(Math.random() * 2), tw: Math.random() * 6 });
    return s;
  },
  drawStars(g, stars, W, H, t) {
    g.clear(); g.fillStyle(0x070a1c, 1).fillRect(0, 0, W, H);
    for (const s of stars) { const a = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.9 + s.tw)); g.fillStyle(0xffffff, a * 0.8).fillRect(Math.round(s.x * W), Math.round(s.y * H), s.z, s.z); }
  },
  planetImg(scene, id, x, y, r) {
    const ocean = LEVELS[id] && LEVELS[id].ocean && scene.textures.exists('oceanglobe');
    const L = LEVELS[id], out = [];
    const g = scene.add.graphics(); g.fillStyle(L.planet ? L.planet.glow : 0xffffff, 0.2).fillCircle(x, y, r + 7); out.push(g);
    out.push(scene.add.image(x, y, ocean ? 'oceanglobe' : 'surf' + id).setDisplaySize(r * 2, r * 2));
    if (scene.textures.exists('map_shade')) out.push(scene.add.image(x, y, 'map_shade').setDisplaySize(r * 2 + 1, r * 2 + 1));
    const rim = scene.add.graphics(); rim.lineStyle(2, L.planet ? L.planet.rim : 0xffffff, 0.9).strokeCircle(x, y, r); out.push(rim);
    return out;
  },
  iconFor(scene, p) {
    if (p.id === 'chip') { const w = runGun(); return w && scene.textures.exists(w.gunTex) ? w.gunTex : 'si_tank'; }
    return scene.textures.exists(p.icon) ? p.icon : 'cheddar';
  },
  fit(img, box) { const s = Math.min(box / img.width, box / img.height); img.setScale(Math.max(1, Math.floor(s * 2) / 2)); return img; }
};

class RunScene extends Phaser.Scene {
  constructor() { super('runpick'); }
  init(data) { this.phase = (data && data.phase) || (Run.idx > 0 ? 'perk' : 'route'); }
  create() {
    makeTextures(this); makeLevelTextures(this); makeShopTextures(this); makePowerupTextures(this);
    Sound.init();
    if (!Run.on) { this.scene.start('menu'); return; }
    if (Run.idx >= Run.stages()) { this.scene.start('runover', Run.finish(this.registry, 'won')); return; }
    this.cameras.main.fadeIn(220, 0, 0, 0);
    this.going = false; this.sel = 0; this.t = 0;
    if (this.phase === 'perk') { this.offer = Run.offer(this.registry); if (!this.offer.length) this.phase = 'route'; }
    this.starsD = RUN_UI.stars(this);
    this.bg = this.add.graphics().setDepth(0);
    this.ui = this.add.container(0, 0).setDepth(1);
    this.selG = this.add.graphics().setDepth(2);
    this.build();
    this.scale.on('resize', this.build, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.build, this));
    const kb = this.input.keyboard;
    if (kb) {
      kb.on('keydown-LEFT', () => this.move(-1)); kb.on('keydown-RIGHT', () => this.move(1));
      kb.on('keydown-UP', () => this.move(-1)); kb.on('keydown-DOWN', () => this.move(1));
      kb.on('keydown-A', () => this.move(-1)); kb.on('keydown-D', () => this.move(1));
      kb.on('keydown-ENTER', () => this.choose(this.sel)); kb.on('keydown-SPACE', () => this.choose(this.sel));
      ['ONE', 'TWO', 'THREE'].forEach((k, i) => kb.on('keydown-' + k, () => this.choose(i)));
    }
    const padOff = Pad.on(b => {
      if (b === 'left' || b === 'up') this.move(-1); else if (b === 'right' || b === 'down') this.move(1);
      else if (b === 'a') this.choose(this.sel);
    });
    this.events.once('shutdown', padOff);
    this.input.on('pointerup', p => {
      const i = (this.hits || []).findIndex(r => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
      if (i < 0) return;
      if (this.sel === i || this.phase === 'route') this.choose(i); else { this.sel = i; Sound.sfx('jump'); }
    });
  }
  move(d) { const n = (this.hits || []).length; if (!n || this.going) return; this.sel = (this.sel + d + n) % n; Sound.sfx('jump'); }
  choose(i) {
    if (this.going || !this.hits || !this.hits[i]) return;
    this.sel = i; this.hits[i].act();
  }
  go(key, data) {
    if (this.going) return; this.going = true;
    this.cameras.main.fadeOut(220, 0, 0, 0);
    this.time.delayedCall(250, () => this.scene.start(key, data));
  }
  build() {
    const W = this.scale.width, H = this.scale.height, f = RUN_UI.f;
    this.ui.removeAll(true); this.hits = [];
    const s = Shop.get(this.registry), small = H < 430;
    // top bar: the route so far
    const stg = Run.stages(), top = small ? 8 : 14;
    this.ui.add(this.add.text(W / 2, top, this.phase === 'perk' ? 'BOSS DOWN! PICK A PERK' : (Run.idx === 0 ? 'RUN MODE' : 'WHERE NEXT?'), f(small ? 14 : 18, '#ffd23f', { stroke: '#5a0a0a', strokeThickness: 5 })).setOrigin(0.5, 0));
    const rowY = top + (small ? 30 : 40), gap = Math.min(70, (W - 80) / stg);
    const rg = this.add.graphics(); this.ui.add(rg);
    for (let i = 0; i < stg; i++) {
      const x = W / 2 + (i - (stg - 1) / 2) * gap, y = rowY + 8;
      if (i < stg - 1) { rg.fillStyle(i < Run.idx ? 0xffd23f : 0x3a4270, 1).fillRect(x + 9, y - 1, gap - 18, 3); }
      if (i < Run.done.length) { this.ui.add(this.add.image(x, y, LEVELS[Run.done[i]].ocean && this.textures.exists('oceanglobe') ? 'oceanglobe' : 'surf' + Run.done[i]).setDisplaySize(16, 16)); rg.lineStyle(2, 0x7dff8a, 1).strokeCircle(x, y, 9); }
      else { rg.fillStyle(i === Run.idx ? 0xffd23f : 0x2a3058, 1).fillCircle(x, y, i === Run.idx ? 7 : 5); if (RUN_ROUTE[i].length > 1) { rg.fillStyle(0x9aa4c8, 1).fillRect(x - 1, y + 10, 3, 3); rg.fillRect(x - 5, y + 13, 3, 3); rg.fillRect(x + 3, y + 13, 3, 3); } }
    }
    // bottom bar: cheddar, hearts, lives, perks
    const by = H - (small ? 22 : 30);
    this.ui.add(this.add.image(18, by, 'cheddar').setScale(2));
    this.ui.add(this.add.text(32, by, String(s.coins), f(10, '#ffd23f')).setOrigin(0, 0.5));
    let px = 100;
    for (const id of Object.keys(Run.perks)) {
      const p = RUN_PERKS.find(q => q.id === id); if (!p) continue;
      const im = RUN_UI.fit(this.add.image(px, by, RUN_UI.iconFor(this, p)), 22); this.ui.add(im);
      if (Run.perks[id] > 1) this.ui.add(this.add.text(px + 10, by + 6, 'x' + Run.perks[id], f(7, '#ffffff', { strokeThickness: 3 })).setOrigin(0, 0.5));
      px += 30;
    }
    const lives = this.registry.get('lives') || 0;
    this.ui.add(this.add.text(W - 14, by, 'LIVES ' + lives + '   SCORE ' + Run.score, f(9, '#e8ecf8')).setOrigin(1, 0.5));
    const midT = rowY + (small ? 30 : 44), midB = by - (small ? 22 : 30);
    if (this.phase === 'perk') this.buildPerks(W, midT, midB, small);
    else this.buildRoute(W, midT, midB, small);
    this.sel = Math.min(this.sel, this.hits.length - 1);
  }
  buildPerks(W, y0, y1, small) {
    const f = RUN_UI.f, n = this.offer.length, cw = Math.min(210, (W - 40 - (n - 1) * 16) / n), ch = Math.min(230, y1 - y0);
    const x0 = W / 2 - (n * cw + (n - 1) * 16) / 2;
    this.cards = [];
    this.offer.forEach((p, i) => {
      const x = x0 + i * (cw + 16), y = y0, g = this.add.graphics(); this.ui.add(g);
      RUN_UI.panel(g, x, y, cw, ch, 0xc9cde0, 0x151b40);
      const icon = RUN_UI.fit(this.add.image(x + cw / 2, y + ch * 0.27, RUN_UI.iconFor(this, p)), Math.min(64, ch * 0.3)); this.ui.add(icon);
      this.ui.add(this.add.text(x + cw / 2, y + ch * 0.48, p.name, f(cw < 170 ? 9 : 11, '#ffffff', { align: 'center', wordWrap: { width: cw - 12 } })).setOrigin(0.5, 0));
      this.ui.add(this.add.text(x + cw / 2, y + ch * 0.48 + (cw < 170 ? 16 : 20), p.sub, f(7, '#ffd23f', { strokeThickness: 3 })).setOrigin(0.5, 0));
      this.ui.add(this.add.text(x + cw / 2, y + ch * 0.48 + (cw < 170 ? 32 : 40), p.desc, f(8, '#c9cde0', { strokeThickness: 3, align: 'center', wordWrap: { width: cw - 16 }, lineSpacing: 4 })).setOrigin(0.5, 0));
      this.ui.add(this.add.text(x + 8, y + 6, String(i + 1), f(8, '#5a6290', { strokeThickness: 0 })));
      this.cards.push({ x, y, w: cw, h: ch, icon, iy: icon.y });
      this.hits.push({ x, y, w: cw, h: ch, act: () => this.pickPerk(p, i) });
    });
  }
  pickPerk(p, i) {
    if (this.going) return;
    Run.take(this.registry, p);
    Sound.sfx('power'); this.cameras.main.flash(150, 255, 230, 160);
    const c = this.cards && this.cards[i];
    if (c) this.tweens.add({ targets: c.icon, scale: c.icon.scale * 1.5, yoyo: true, duration: 140 });
    this.going = true;
    this.time.delayedCall(420, () => { this.going = false; this.phase = 'route'; this.sel = 0; this.build(); });
  }
  buildRoute(W, y0, y1, small) {
    const f = RUN_UI.f, opts = RUN_ROUTE[Run.idx], n = opts.length;
    const btnH = small ? 26 : 30, area = y1 - y0 - btnH - 10;
    const cw = Math.min(330, (W - 40 - (n - 1) * 20) / n), ch = Math.max(90, Math.min(area, 200));
    const x0 = W / 2 - (n * cw + (n - 1) * 20) / 2;
    this.cards = [];
    if (Run.idx === 0) {     // the rules, once
      this.ui.add(this.add.text(W / 2, y0 - 4, 'ONE LIFE. FIVE PLANETS. A PERK AFTER EVERY BOSS.\nCHEDDAR AND UPGRADES ARE FOR THIS RUN ONLY.', f(7, '#c9cde0', { strokeThickness: 3, align: 'center', lineSpacing: 4 })).setOrigin(0.5, 0));
    }
    const rules = Run.idx === 0 ? 30 : 0, chh = Math.min(ch, area - rules), yy = y0 + rules + Math.max(0, (area - rules - chh) / 2);
    opts.forEach((id, i) => {
      const L = LEVELS[id], x = x0 + i * (cw + 20), g = this.add.graphics(); this.ui.add(g);
      RUN_UI.panel(g, x, yy, cw, chh, 0xc9cde0, 0x151b40);
      const r = Math.min(chh * 0.3, cw * 0.17, 46);
      for (const o of RUN_UI.planetImg(this, id, x + r + 16, yy + chh / 2, r)) this.ui.add(o);
      const tx = x + r * 2 + 30, tw = cw - (r * 2 + 40);
      this.ui.add(this.add.text(tx, yy + chh / 2 - 30, L.short || L.name, f(cw < 260 ? 9 : 11, '#ffffff', { wordWrap: { width: tw } })).setOrigin(0, 0.5));
      this.ui.add(this.add.text(tx, yy + chh / 2 - 12, 'BOSS: ' + L.bossName, f(7, '#ff9d3a', { strokeThickness: 3, wordWrap: { width: tw }, lineSpacing: 3 })).setOrigin(0, 0));
      this.ui.add(this.add.text(tx, yy + chh / 2 + 10, (L.blurb || '').replace(/\n/g, ' '), f(7, '#c9cde0', { strokeThickness: 3, wordWrap: { width: tw }, lineSpacing: 4 })).setOrigin(0, 0));
      this.hits.push({ x, y: yy, w: cw, h: chh, act: () => { Sound.sfx('power'); this.go('weapons', { level: id }); } });
    });
    // buttons: SHOP / GIVE UP
    const bw = small ? 120 : 140, by = y1 - btnH + 4;
    [['SHOP', () => { Sound.sfx('wave'); this.go('shop'); }], ['GIVE UP', () => { if (this.going) return; this.going = true; const sum = Run.finish(this.registry, 'quit'); this.cameras.main.fadeOut(220, 0, 0, 0); this.time.delayedCall(250, () => this.scene.start('runover', sum)); }]].forEach(([lab, act], i) => {
      const x = W / 2 + (i ? 12 : -12 - bw), g = this.add.graphics(); this.ui.add(g);
      RUN_UI.panel(g, x, by, bw, btnH - 6, i ? 0x8a5a6a : 0xc9cde0, i ? 0x2a1424 : 0x1d2a5a);
      this.ui.add(this.add.text(x + bw / 2, by + (btnH - 6) / 2, lab, f(9, i ? '#ff9db8' : '#ffd23f', { strokeThickness: 3 })).setOrigin(0.5));
      this.hits.push({ x, y: by, w: bw, h: btnH - 6, act });
    });
  }
  update(time, dms) {
    const dt = Math.min(0.05, dms / 1000); this.t += dt;
    const W = this.scale.width, H = this.scale.height;
    RUN_UI.drawStars(this.bg, this.starsD, W, H, this.t);
    const g = this.selG; g.clear();
    const h = this.hits && this.hits[this.sel];
    if (h) {
      const a = 0.6 + 0.4 * Math.sin(this.t * 6);
      g.lineStyle(3, 0xffd23f, 0.75 + 0.25 * Math.sin(this.t * 6)).strokeRect(h.x - 5, h.y - 5, h.w + 10, h.h + 10);
    }
    if (this.cards) this.cards.forEach((c, i) => { if (c.icon && c.iy !== undefined) c.icon.y = c.iy + (i === this.sel ? Math.sin(this.t * 4) * 3 : 0); });
  }
}

// ---------------------------------------------------------------- the run summary
class RunOverScene extends Phaser.Scene {
  constructor() { super('runover'); }
  init(data) { this.sum = data || {}; }
  create() {
    makeTextures(this); makeLevelTextures(this); makeShopTextures(this); makePowerupTextures(this);
    Sound.init();
    this.cameras.main.fadeIn(300, 0, 0, 0);
    this.t = 0; this.going = false; this.starsD = RUN_UI.stars(this);
    this.bg = this.add.graphics().setDepth(0); this.ui = this.add.container(0, 0).setDepth(1); this.selG = this.add.graphics().setDepth(2);
    this.sel = 0;
    const S = this.sum;
    if (S.how === 'won') { Sound.music('win'); Sound.say('woohoo', { force: true }); }
    this.build(); this.scale.on('resize', this.build, this); this.events.once('shutdown', () => this.scale.off('resize', this.build, this));
    const kb = this.input.keyboard;
    if (kb) { kb.on('keydown-LEFT', () => this.move(-1)); kb.on('keydown-RIGHT', () => this.move(1)); kb.on('keydown-ENTER', () => this.hits[this.sel].act()); kb.on('keydown-SPACE', () => this.hits[this.sel].act()); kb.on('keydown-ESC', () => this.hits[1].act()); }
    const padOff = Pad.on(b => { if (b === 'left' || b === 'up') this.move(-1); else if (b === 'right' || b === 'down') this.move(1); else if (b === 'a') this.hits[this.sel].act(); else if (b === 'b') this.hits[1].act(); });
    this.events.once('shutdown', padOff);
    this.input.on('pointerup', p => { const i = this.hits.findIndex(r => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h); if (i >= 0) { this.sel = i; this.hits[i].act(); } });
  }
  move(d) { this.sel = (this.sel + d + 2) % 2; Sound.sfx('jump'); }
  build() {
    const W = this.scale.width, H = this.scale.height, f = RUN_UI.f, S = this.sum, small = H < 430;
    this.ui.removeAll(true); this.hits = [];
    const title = S.how === 'won' ? 'RUN COMPLETE!' : S.how === 'quit' ? 'RUN ABANDONED' : 'GRATED!';
    this.ui.add(this.add.text(W / 2, small ? 14 : 30, title, f(small ? 20 : 26, S.how === 'won' ? '#ffd23f' : '#ff7a5a', { stroke: '#1a1020', strokeThickness: 6 })).setOrigin(0.5, 0));
    const sub = S.how === 'won' ? 'Five planets, one life. Bessie salutes you.' : S.how === 'quit' ? 'Chris heads home for a nap.' : 'The run ends on ' + ((LEVELS[S.at] && (LEVELS[S.at].short || LEVELS[S.at].name)) || 'a cold rock') + '.';
    this.ui.add(this.add.text(W / 2, small ? 44 : 66, sub, f(8, '#e8ecf8', { strokeThickness: 3 })).setOrigin(0.5, 0));
    // the planets cleared
    const n = RUN_ROUTE.length, gap = Math.min(64, (W - 60) / n), py = small ? 84 : 116;
    const g = this.add.graphics(); this.ui.add(g);
    for (let i = 0; i < n; i++) {
      const x = W / 2 + (i - (n - 1) / 2) * gap, id = (S.done || [])[i];
      if (id) { for (const o of RUN_UI.planetImg(this, id, x, py, 18)) this.ui.add(o); }
      else { g.lineStyle(2, 0x3a4270, 1).strokeCircle(x, py, 18); this.ui.add(this.add.text(x, py, '?', f(10, '#3a4270', { strokeThickness: 0 })).setOrigin(0.5)); }
    }
    const mm = Math.floor((S.time || 0) / 60), ss = String(Math.floor((S.time || 0) % 60)).padStart(2, '0');
    const best = Run.best();
    const lines = ['PLANETS  ' + (S.planets || 0) + '/' + n, 'SCORE  ' + (S.score || 0), 'RATS SQUASHED  ' + (S.kills || 0) + '     CHEDDAR  ' + (S.earned || 0), 'TIME  ' + mm + ':' + ss,
      S.newBest ? 'NEW BEST RUN!' : (best ? 'BEST: ' + best.planets + ' PLANETS, ' + best.score : '')];
    let y = py + (small ? 30 : 40);
    lines.forEach((l, i) => { this.ui.add(this.add.text(W / 2, y, l, f(i === 4 ? 9 : 8, i === 4 ? (S.newBest ? '#7dff8a' : '#9aa4c8') : '#ffffff', { strokeThickness: 3 })).setOrigin(0.5, 0)); y += small ? 15 : 19; });
    // the perks taken
    const pk = S.perks || [];
    if (pk.length) {
      const pw = 28, x0 = W / 2 - (pk.length - 1) * pw / 2;
      pk.forEach((id, i) => { const p = RUN_PERKS.find(q => q.id === id); if (p) this.ui.add(RUN_UI.fit(this.add.image(x0 + i * pw, y + 10, RUN_UI.iconFor(this, p)), 22)); });
      y += 26;
    }
    const bw = 150, bh = 24, by = Math.min(H - bh - 10, y + 10);
    [['RUN AGAIN', () => this.again()], ['MENU', () => this.toMenu()]].forEach(([lab, act], i) => {
      const x = W / 2 + (i ? 10 : -10 - bw), gg = this.add.graphics(); this.ui.add(gg);
      RUN_UI.panel(gg, x, by, bw, bh, 0xc9cde0, 0x1d2a5a);
      this.ui.add(this.add.text(x + bw / 2, by + bh / 2, lab, f(9, '#ffd23f', { strokeThickness: 3 })).setOrigin(0.5));
      this.hits.push({ x, y: by, w: bw, h: bh, act });
    });
  }
  again() { if (this.going) return; this.going = true; Sound.sfx('power'); Run.start(this.registry); this.cameras.main.fadeOut(220, 0, 0, 0); this.time.delayedCall(250, () => this.scene.start('runpick', { phase: 'route' })); }
  toMenu() { if (this.going) return; this.going = true; Sound.music(null); this.cameras.main.fadeOut(220, 0, 0, 0); this.time.delayedCall(250, () => this.scene.start('menu')); }
  update(time, dms) {
    this.t += Math.min(0.05, dms / 1000);
    RUN_UI.drawStars(this.bg, this.starsD, this.scale.width, this.scale.height, this.t);
    const g = this.selG, h = this.hits && this.hits[this.sel]; g.clear();
    if (h) g.lineStyle(3, 0xffd23f, 0.75 + 0.25 * Math.sin(this.t * 6)).strokeRect(h.x - 5, h.y - 5, h.w + 10, h.h + 10);
  }
}
