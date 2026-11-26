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
  { id: 'mboots', name: 'MOON BOOTS', sub: '+1 LEVEL', icon: 'si_boots', desc: 'Run faster, jump higher, and a jetpack that burns slower and refills faster.', can: s => (s.boots || 0) < SHOP.bootMax, act: s => { s.boots = (s.boots || 0) + 1; } },
  { id: 'chip',   name: 'GUN CHIP', sub: 'YOUR GUN +1', icon: null, desc: 'Your current gun starts a level higher.', can: s => !!runGun() && ((s.chips || {})[runGun().id] || 0) < 3, act: s => { const w = runGun(); s.chips = Object.assign({}, s.chips || {}); s.chips[w.id] = (s.chips[w.id] || 0) + 1; } },
  { id: 'wallet', name: 'FAT WALLET', sub: 'CHEDDAR x1.5', icon: 'cheddar', desc: 'Every bit of cheddar is worth half as much again.', once: true },
  { id: 'glass',  name: 'GLASS CHEESE', sub: 'RISKY', icon: 'wedge', desc: 'Hit 50% harder... but one heart fewer.', once: true, can: (s, sc) => sc.hp > 2 },
  { id: 'vamp',   name: 'CHEESE VAMPIRE', sub: 'MUNCH', icon: 'pu_ears', desc: 'Every 10 rats you squash mends a heart.', once: true },
];
// ---------------------------------------------------------------- MOON CAMP meta-progression (v3.06)
// GOLDEN CRUMBS are earned at the end of every run (win or lose) and kept for good. Fridge-o-tron trades them at camp
// for LARDER upgrades that every future run starts with. The LUNCHBOX packs one starter perk for the next run.
const LARDER = [
  { id: 'hearty', name: 'HEARTY BREAKFAST', desc: 'Start every run with +1 heart.', cost: [30, 80] },
  { id: 'purse',  name: 'NEST EGG',         desc: 'Start every run with +40 cheddar.', cost: [15, 35, 60] },
  { id: 'rind',   name: 'THICK RIND',       desc: 'Start every run in Black Rind Mk I.', cost: [45] },
  { id: 'toque',  name: 'SPARE TOQUE',      desc: 'Once a run, a fatal hit leaves you on half hearts.', cost: [50, 120] },
  { id: 'dice',   name: 'LUCKY DICE',       desc: 'Reroll a perk offer once per run.', cost: [25, 60] },
  { id: 'menu4',  name: 'BIGGER MENU',      desc: 'Perk offers show 4 cards, not 3.', cost: [100] }
];
const KITS = [
  { id: 'none',   name: 'NOTHING',            desc: 'Travel light.', need: 0 },
  { id: 'sauce',  name: 'SPICY SANDWICH',     desc: 'Start with HOT SAUCE forever.', perk: 'sauce', need: 0 },
  { id: 'boots',  name: 'SPRING-LOADED SOCKS', desc: 'Start with ROCKET BOOTS forever.', perk: 'boots', need: 0 },
  { id: 'wallet', name: 'PIGGY PURSE',        desc: 'Start with FAT WALLET.', perk: 'wallet', need: 1 },
  { id: 'magnet', name: 'LUCKY FORK',         desc: 'Start with the MAGNET FORK.', perk: 'magnet', need: 2 },
  { id: 'vamp',   name: "BESSIE'S BELL",      desc: 'Start as a CHEESE VAMPIRE.', perk: 'vamp', need: 3 },
  { id: 'glass',  name: 'GLASS FLASK',        desc: 'Start with GLASS CHEESE. Brave.', perk: 'glass', need: 4 }
];
const Meta = {
  _j(k, d) { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (e) { return d; } },
  _s(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  crumbs() { return this._j('lc_crumbs', 0); },
  addCrumbs(n) { this._s('lc_crumbs', Math.max(0, this.crumbs() + n)); },
  larder() { return this._j('lc_larder', {}); },
  lv(id) { return this.larder()[id] || 0; },
  buy(u) { const L = this.larder(), lv = L[u.id] || 0, c = u.cost[lv]; if (c === undefined || this.crumbs() < c) return false; this.addCrumbs(-c); L[u.id] = lv + 1; this._s('lc_larder', L); return true; },
  stats() { return this._j('lc_run_stats', { runs: 0, wins: 0, kills: 0, planets: 0 }); },
  bestPlanets() { const b = Run.best(); return b ? b.planets : 0; },
  kitOk(k) { return this.bestPlanets() >= k.need; },
  kit() { const id = this._j('lc_kit', 'none'), k = KITS.find(q => q.id === id); return k && this.kitOk(k) ? k : KITS[0]; },
  setKit(id) { this._s('lc_kit', id); }
};

const PERK_KIND = { boots: 'MOVE', mboots: 'MOVE', sauce: 'ATTACK', glass: 'ATTACK', chip: 'ATTACK', heart: 'DEFENCE', armour: 'DEFENCE', life: 'DEFENCE', vamp: 'DEFENCE', magnet: 'LOOT', wallet: 'LOOT' };
const KIND_COL = { MOVE: 0x2a5aaa, ATTACK: 0xaa3a1a, DEFENCE: 0x2a8a5a, LOOT: 0xa8801a };
// LEGENDARY perks (v3.11): only from winning a BONUS STOP on a run - bigger versions and combos
const RUN_GOLD = [
  { id: 'g_hearts', name: 'BIG BREAKFAST', sub: '+2 HEARTS', icon: 'hud_cheese', desc: 'Two more cheese hearts, and they\'re full.', act: s => { s.hearts = (s.hearts || 0) + 2; } },
  { id: 'g_rind', name: 'DRAGON RIND', sub: '+2 ARMOUR MARKS', icon: 'si_armour', desc: 'Black Rind up two marks, fully mended.', can: s => (s.armMk || 0) < 4, act: s => { s.armMk = Math.min(4, (s.armMk || 0) + 2); s.armHp = SHOP.armHp[s.armMk]; } },
  { id: 'g_toque', name: 'GOLDEN TOQUE', sub: 'CHEAT DEATH', icon: 'c_head', desc: 'Once this run, a fatal hit leaves you on half hearts.', act: () => { Run.toques = (Run.toques || 0) + 1; } },
  { id: 'g_chips', name: 'ARMOURER', sub: 'ALL GUNS +1', icon: 'si_chip', desc: 'Every gun you own starts a level higher this run.', act: s => { s.chips = Object.assign({}, s.chips || {}); for (const w of WEAPONS) if (weaponUnlocked(w, 99)) s.chips[w.id] = Math.min(3, (s.chips[w.id] || 0) + 1); } },
  { id: 'g_combo', name: 'SPICY BOOTS', sub: 'TWO FOREVERS', icon: 'pu_sauce', desc: 'Hot Sauce AND Rocket Boots, all run long.', can: () => !(Run.perks.sauce && Run.perks.boots), act: () => { Run.perks.sauce = 1; Run.perks.boots = 1; } },
  { id: 'g_vamp', name: 'NOSFERATU', sub: 'BIG MUNCH', icon: 'pu_ears', desc: 'Every 5 rats you squash mends a heart.', once: true, act: () => { Run.perks.vamp = 1; Run.vampN = 5; } },
  { id: 'g_cash', name: 'JACKPOT', sub: '+300 CHEDDAR', icon: 'cheddar', desc: 'A wheelbarrow of cheddar for the ship shop.', act: s => { s.coins += 300; } },
  { id: 'g_glass', name: 'DIAMOND CHEESE', sub: 'HIT x1.5, NO DOWNSIDE', icon: 'wedge', desc: 'Glass Cheese without the missing heart.', can: () => !Run.perks.glass, once: true, act: () => { Run.perks.diamond = 1; } }
];
function runGun() { let i = 0; try { i = +(localStorage.getItem('lc_weapon') || 0); } catch (e) { /* ignore */ } return WEAPONS[i] || WEAPONS[0]; }

// CHEESE STRENGTH (v3.10): Slay the Spire's Ascension / Hades' Heat, in cheese. Win a run to unlock the next strength.
// Every run is already tougher than the campaign (rats x1.2, +8% more each planet you clear); each strength piles on.
const STRENGTHS = [
  { name: 'MILD',         col: 0xd8b84a, hp: 0,   more: 0.1,  crumbs: 1,    desc: 'The standard run. Rats a fifth tougher than the campaign.' },
  { name: 'MEDIUM',       col: 0xe0901a, hp: 0.2, more: 0.2,  crumbs: 1.25, desc: 'Rats +20% tougher, more of them. Crumbs x1.25.' },
  { name: 'MATURE',       col: 0xd8601a, hp: 0.4, more: 0.35, crumbs: 1.5,  desc: 'Rats +40% tougher, crowds of them. Crumbs x1.5.' },
  { name: 'EXTRA MATURE', col: 0xc8301a, hp: 0.6, more: 0.5,  crumbs: 1.75, noHeal: true, boss: 0.2, desc: '+60% tougher, bosses +20%, no cheese wedges between waves. Crumbs x1.75.' },
  { name: 'VINTAGE',      col: 0x8a1a3a, hp: 0.8, more: 0.65, crumbs: 2,    noHeal: true, boss: 0.4, heart: 1, desc: '+80% tougher, bosses +40%, no wedges, one heart fewer. Crumbs x2.' }
];
const RUN_BONUS = ['zerog', 'freefall', 'centrifuge'];
const RUN_BONUS_NAME = { zerog: 'ZERO-G ROOM', freefall: 'THE BIG DROP', centrifuge: 'THE CENTRIFUGE' };
const Run = {
  on: false, idx: 0, done: [], perks: {}, score: 0, earned: 0, kills: 0, t0: 0, saved: null, picked: [],
  best() { try { return JSON.parse(localStorage.getItem('lc_run_best') || 'null'); } catch (e) { return null; } },
  start(reg) {
    if (typeof Ach !== 'undefined') Ach.unlock('run');   // (v3.92) trophy
    const keep = {}; for (const k of Object.keys(reg.getAll())) if (k.startsWith('oneup_')) keep[k] = reg.get(k);
    this.saved = { shop: reg.get('shop'), lives: reg.get('lives'), gunLv: reg.get('gunLv'), bonusHeart: reg.get('bonusHeart'), oneups: keep };
    for (const k of Object.keys(keep)) reg.remove(k);
    const L = Meta.larder();
    reg.set('shop', { coins: RUN_START_CHEDDAR + 40 * (L.purse || 0), armMk: L.rind ? 1 : 0, armHp: L.rind ? SHOP.armHp[1] : 0, boots: 0, tank: 0, hearts: L.hearty || 0, spins: 0, chips: {} });
    reg.set('lives', 1); reg.set('gunLv', {}); reg.set('bonusHeart', false);
    const shopAt = 2 + Math.floor(Math.random() * 2), bAts = [1, 2, 3].filter(k => k !== shopAt);   // (v3.131) the SHOP stop: after planet 2 or 3; the BONUS stop somewhere else on the line
    const barOpen = typeof Story === 'undefined' || Story.built('bar');                                     // (v3.132) ...but only once the Moon Bar's open
    Object.assign(this, { styleS: 0, shopAt, shopDone: false, arrived: null, bonusAt: barOpen ? bAts[Math.floor(Math.random() * bAts.length)] : -1, vampN: 10, tier: this.tierSel(), bonusDone: {}, bonusOffer: {}, freePerk: false, atLv: 0, on: true, idx: 0, done: [], perks: {}, score: 0, earned: 0, kills: 0, t0: Date.now(), picked: [], toques: L.toque || 0, dice: L.dice || 0, cards: 3 + (L.menu4 ? 1 : 0) });
    const kit = Meta.kit(), kp = kit.perk && RUN_PERKS.find(q => q.id === kit.perk);   // the LUNCHBOX's starter perk
    if (kp) this.take(reg, kp);
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
  // (v3.131) the stop on the line before stage idx that you must pass through first: 'shop', a bonus id, or null
  stopAt(idx) {
    if (idx === undefined) idx = this.idx;
    if (idx === this.shopAt && !this.shopDone) return 'shop';
    if (idx === this.bonusAt && !this.bonusDone[idx]) { if (this.bonusOffer[idx] === undefined) this.bonusOffer[idx] = RUN_BONUS[Math.floor(Math.random() * RUN_BONUS.length)]; return this.bonusOffer[idx]; }
    return null;
  },
  // the run's summary, and the best run on this device ({ planets, score })
  finish(reg, how) {
    try { localStorage.setItem('lc_cave_ready', '1'); } catch (e) { /* ignore */ }   // (v3.41) the rats restock the secret cavern after every run
    if (how === 'won' && typeof Ach !== 'undefined') Ach.unlock('runwin');
    const sum = { how, at: this.atLv || 0, planets: this.done.length, done: this.done.slice(), score: this.score, earned: this.earned, kills: this.kills, time: (Date.now() - this.t0) / 1000, perks: this.picked.slice() };
    const b = this.best();
    sum.newBest = !b || sum.planets > b.planets || (sum.planets === b.planets && sum.score > b.score);
    if (sum.newBest && how !== 'quit') try { localStorage.setItem('lc_run_best', JSON.stringify({ planets: sum.planets, score: sum.score })); } catch (e) { /* ignore */ }
    if (how === 'quit') sum.newBest = false;
    // GOLDEN CRUMBS for the camp: 8 a planet, a crumb per 10 rats, one per 50 cheddar, +20 for the lot
    sum.crumbs = Math.round((sum.planets * 8 + Math.floor(sum.kills / 10) + Math.floor(sum.earned / 50) + (how === 'won' ? 20 : 0)) * this.str().crumbs);
    sum.crumbs += (this.styleS || 0) * 3; sum.styleS = this.styleS || 0;
    sum.tier = this.tier || 0;
    if (how === 'won' && (this.tier || 0) >= this.tierMax() && this.tier < STRENGTHS.length - 1) { Meta._s('lc_run_tiermax', this.tier + 1); sum.unlocked = STRENGTHS[this.tier + 1].name; }
    Meta.addCrumbs(sum.crumbs);
    if (typeof Story !== 'undefined') Story.runEnded();                  // (v3.132) the builders work while you're away
    const st = Meta.stats(); st.runs++; if (how === 'won') st.wins++; st.kills += sum.kills; st.planets += sum.planets; Meta._s('lc_run_stats', st);
    Meta._s('lc_run_last', { how, planets: sum.planets, at: sum.at || 0 });
    if (how !== 'quit' || sum.planets > 0) {                 // (v3.11) every run hands you a new gun, until you have them all
      const g = WEAPONS.find(w => w.unlock > 1 && !Progress.hasGun(w.id));
      if (g) { Progress.giveGun(g.id); sum.newGun = g.name; }
    }
    this.restore(reg);
    return sum;
  },
  // a stage's sub-set of waves: the first, one random middle wave, the last
  trimWaves(ws) {
    if (ws.length <= 3) return ws.slice();
    return [ws[0], ws[1 + Math.floor(Math.random() * (ws.length - 2))], ws[ws.length - 1]].map((w, i) => /^WAVE \d+$/.test(w.name) ? Object.assign({}, w, { name: 'WAVE ' + (i + 1) }) : w);
  },
  hpPenalty() { return this.on ? (this.perks.glass ? 1 : 0) + (this.str().heart || 0) : 0; },
  str() { return STRENGTHS[this.tier || 0]; },
  tierMax() { return Math.min(STRENGTHS.length - 1, Meta._j('lc_run_tiermax', 0)); },
  tierSel() { return Math.min(this.tierMax(), Meta._j('lc_run_tier', 0)); },
  // enemy toughness on a run: one-hit fodder stays one-hit (there's just more of it), everything else scales
  hpK(type, st) {
    if (!this.on || (type !== 'boss' && st.hp < 2)) return 1;
    const S = this.str();
    return (1.2 + 0.08 * this.idx + S.hp) * (type === 'boss' ? 1 + (S.boss || 0) : 1);
  },
  // more rats per wave: copies of some of the wave's spawns, a beat after the originals
  moreSpawns(q) {
    if (!this.on) return q;
    const k = this.str().more + 0.05 * this.idx, out = q.slice();
    for (const s of q) if (s.type !== 'boss' && Math.random() < k) out.push(Object.assign({}, s, { t: s.t + 0.4 + Math.random() * 1.2 }));
    return out.sort((a, b) => a.t - b.t);
  },
  // 3 random perks on offer (never one that can't do anything)
  offer(reg, gold) {
    const s = Shop.get(reg), lv = { hp: Math.min(CFG.heartCap, CFG.maxHp + (s.hearts || 0) + (s.burgers || 0)) - this.hpPenalty(), lives: reg.get('lives') || 0 };
    const pool = (gold ? RUN_GOLD : RUN_PERKS).filter(p => !(p.once && this.perks[p.id]) && (!p.can || p.can(s, lv)));
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    return pool.slice(0, this.cards || 3);
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
  P.hitK = function (e, th, h) { const k = hitK.call(this, e, th, h); return Run.on && (Run.perks.glass || Run.perks.diamond) ? k * 1.5 : k; };
  Object.assign(P, {
    runKill(e) {
      Run.kills++;
      if (!Run.perks.vamp || e.type === 'boss') return;
      this.vampN = (this.vampN || 0) + 1;
      if (this.vampN >= (Run.vampN || 10)) {
        this.vampN = 0;
        if (this.pl.hp < this.maxHp) { this.pl.hp++; this.updateHearts(); Sound.sfx('power'); this.popup(this.pl.theta, this.pl.h + 60, '+1 HEART', '#ff9db8', true); }
      }
    },
    // the boss is down and Bessie's safe: no ranks, no unlocks, no leaderboard - on to the next pick
    runWin() {
      Sound.say('woohoo', { force: true });
      this.state = 'won';
      Run.score += this.score; Run.done.push(this.levelId); Run.idx++;
      { const seen = Meta._j('lc_run_seen', []); if (!seen.includes(this.levelId)) Meta._s('lc_run_seen', seen.concat([this.levelId])); }   // (v3.13) the camp talks about it
      Sound.music('win'); this.endT = this.t;
      const last = Run.idx >= Run.stages();
      const mm = Math.floor(this.t / 60), ss = String(Math.floor(this.t % 60)).padStart(2, '0');
      this.showOverlay(last ? 'RUN COMPLETE!' : 'PLANET CLEAR!',
        (last ? 'Bessie is safe. One life. ' + Run.str().name + '. Legend.' : this.def.win) + '\n\nTIME ' + mm + ':' + ss + '   HITS ' + this.hurtCount + '   SCORE ' + this.score +
        '\nRUN SCORE ' + Run.score + '   CHEDDAR ' + Shop.get(this.registry).coins + '\n\n' + (last ? 'Tap for the run summary' : 'Tap to pick a perk'));
    },
    // after LEVEL CLEAR: a run goes to its perk pick; the campaign hears from camp first (v3.14)
    wonNext() {
      if (Run.on) {                                     // (v3.132) someone stranded here? They come home with you
        const who = typeof Story !== 'undefined' && this.storyShownAt !== this.endT ? Story.arrival(this.levelId) : null;
        if (!who) { this.scene.start('runpick', { phase: 'perk' }); return; }
        this.storyShownAt = this.endT; this.state = 'wonchat'; this.hideOverlay();
        const seen = Meta._j('lc_talk', {}); seen[who] = Object.assign(seen[who] || { i: 0 }, { met: true }); Meta._s('lc_talk', seen);
        const D = FOLK[who], brings = STORY_CAST.find(c => c.id === who).brings.map(f => STORY_FEATURE[f]).join(' AND ');
        Sound.sfx('reveal');
        chatBar(this, (D.found || D.first).concat([['chris', 'Right. Into the rocket. Camp\'s this way.']]), { header: 'FOUND ON ' + (this.def.short || this.def.name).toUpperCase(),
          onClose: () => { this.banner(D.name + ' IS COMING HOME!\nBRINGING ' + brings); this.time.delayedCall(2200, () => this.scene.start('runpick', { phase: 'perk' })); } });
        return;
      }
      const id = this.levelId, st = typeof STORY !== 'undefined' && STORY[id], who = st && STORY_RADIO[id];
      if (!who || !st[who] || this.storyShownAt === this.endT) { this.scene.start('select'); return; }
      this.storyShownAt = this.endT; this.state = 'wonchat'; this.hideOverlay();
      const seen = Meta._j('lc_talk', {}), me = seen[who] || { met: false, i: 0 };
      if (!(me.story || []).includes(id)) me.story = (me.story || []).concat([id]);
      seen[who] = me; Meta._s('lc_talk', seen);
      chatBar(this, st[who], { header: 'MESSAGE FROM MOON CAMP', onClose: () => this.scene.start('select') });
    },
    runLost() {
      if (this.leavingGO) return; this.leavingGO = true;
      Run.score += this.score;
      Run.atLv = this.levelId; const sum = Run.finish(this.registry, 'died');
      this.cameras.main.fadeOut(900, 0, 0, 0);
      this.time.delayedCall(950, () => { Sound.music(null); this.scene.start('level1', { camp: true, sum }); });
    },
    // SPARE TOQUE (camp larder): once a run, a fatal hit leaves him on half his hearts instead. true = saved
    runToque() {
      if (!Run.on || !(Run.toques > 0) || this.state !== 'play') return false;
      Run.toques--;
      const P = this.pl; P.hp = Math.max(1, Math.ceil(this.maxHp / 2)); P.invuln = 2.5; this.updateHearts();
      Sound.sfx('power'); this.cameras.main.flash(250, 255, 240, 200); this.slowT = 0.6;
      this.banner('SPARE TOQUE!' + (Run.toques ? '\n(' + Run.toques + ' LEFT)' : ''));
      return true;
    },
    // leave the level for 'select' / 'menu' - or, mid-run, give the run up
    leaveTo(key) {
      if (this.training) { this.trainExit(true); return; }
      if (!Run.on) { this.scene.start(this.camp ? 'menu' : key); return; }
      Run.score += this.score;
      Run.atLv = this.levelId; const sum = Run.finish(this.registry, 'quit');
      Sound.music(null); this.scene.start('level1', { camp: true, sum });
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
  card(g, x, y, w, h, tone, band, dim) {
    g.fillStyle(0x1a1020, 1).fillRect(x - 3, y - 3, w + 6, h + 6);
    g.fillStyle(dim ? 0x3a4060 : 0x9aa4c8, 1).fillRect(x - 1, y - 1, w + 2, h + 2);
    g.fillStyle(0x1c2452, 1).fillRect(x, y, w, h);
    for (let yy = y + band + 2; yy < y + h; yy += 4) for (let xx = x + ((yy >> 2) % 2) * 2; xx < x + w; xx += 4) g.fillStyle(0x222c60, 1).fillRect(xx, yy, 1, 1);
    g.fillStyle(tone, 1).fillRect(x, y, w, band); g.fillStyle(0xffffff, 0.14).fillRect(x, y, w, 2); g.fillStyle(0x000000, 0.25).fillRect(x, y + band - 2, w, 2);
  },
  btn(scene, ui, x, y, w, h, label, col, txtCol) {
    const g = scene.add.graphics(); ui.add(g);
    g.fillStyle(0x1a1020, 1).fillRect(x - 2, y - 2, w + 4, h + 4); g.fillStyle(col, 1).fillRect(x - 1, y - 1, w + 2, h + 2); g.fillStyle(0x1d2a5a, 1).fillRect(x + 1, y + 1, w - 2, h - 2); g.fillStyle(0xffffff, 0.1).fillRect(x + 1, y + 1, w - 2, 3);
    ui.add(scene.add.text(x + w / 2, y + h / 2, label, RUN_UI.f(9, txtCol || '#ffd23f', { strokeThickness: 3 })).setOrigin(0.5));
  },
  stars(scene) {
    const s = []; for (let i = 0; i < 110; i++) s.push({ x: Math.random(), y: Math.random(), z: 1 + Math.floor(Math.random() * 2), tw: Math.random() * 6 });
    return s;
  },
  drawStars(g, stars, W, H, t) {
    g.clear();
    const bands = [0x070a26, 0x0b1036, 0x111546, 0x1a1a56, 0x261c62, 0x34206a];
    bands.forEach((c, i) => g.fillStyle(c, 1).fillRect(0, Math.floor(H * i / bands.length), W, Math.ceil(H / bands.length) + 1));
    for (const [x, y, r, c] of [[0.2, 0.3, 0.22, 0x5a2a9a], [0.75, 0.55, 0.26, 0x2a3a9a], [0.5, 0.9, 0.3, 0x7a2a7a]]) for (let k = 4; k > 0; k--) g.fillStyle(c, 0.035).fillCircle(x * W + Math.sin(t * 0.1 + x * 9) * 10, y * H, r * Math.max(W, H) * k / 4);
    for (const s of stars) { const a = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.9 + s.tw)); g.fillStyle(0xffffff, a * 0.8).fillRect(Math.round(s.x * W), Math.round(s.y * H), s.z, s.z); }
  },
  planetImg(scene, id, x, y, r) {
    const ocean = LEVELS[id] && LEVELS[id].ocean && scene.textures.exists('oceanglobe');
    const L = LEVELS[id], out = [];
    const g = scene.add.graphics(); g.fillStyle(L.planet ? L.planet.glow : 0xffffff, 0.2).fillCircle(x, y, r + 7); out.push(g);
    if (levelIcon(scene, id) === 'ratship') { out.push(fitIcon(scene.add.image(x, y, 'ratship'), r * 2.5, r * 1.8)); return out; }   // (v3.99f) the Royal Saucer, side on
    out.push(scene.add.image(x, y, ocean ? 'oceanglobe' : 'surf' + id).setDisplaySize(r * 2, r * 2));
    if (scene.textures.exists('map_shade')) out.push(scene.add.image(x, y, 'map_shade').setDisplaySize(r * 2 + 1, r * 2 + 1));
    const rim = scene.add.graphics(); rim.lineStyle(2, L.planet ? L.planet.rim : 0xffffff, 0.9).strokeCircle(x, y, r); out.push(rim);
    return out;
  },
  iconFor(scene, p) {
    if (p.id === 'chip') { const w = runGun(); return w && scene.textures.exists(w.gunTex) ? w.gunTex : 'si_tank'; }
    return scene.textures.exists(p.icon) ? p.icon : 'cheddar';
  },
  fit(img, box) { const s = Math.min(box / img.width, box / img.height); img.setScale(s < 1 ? s : Math.floor(s * 2) / 2); return img; }   // (v3.36: big pictures shrink to fit)
};

class RunScene extends Phaser.Scene {
  constructor() { super('runpick'); }
  init(data) { this.phase = (data && data.phase) || (Run.idx > 0 ? 'perk' : 'route'); if (this.phase === 'perk' && Run.idx > 0 && !Run.freePerk && Run.lastPerkAt === Run.idx) this.phase = 'route'; }
  create() {
    makeTextures(this); makeLevelTextures(this); makeShopTextures(this); makePowerupTextures(this);
    Sound.init();
    if (!Run.on) { this.scene.start('menu'); return; }
    if (Run.idx >= Run.stages()) { this.scene.start('level1', { camp: true, sum: Run.finish(this.registry, 'won') }); return; }
    this.cameras.main.fadeIn(220, 0, 0, 0);
    this.going = false; this.sel = 0; this.t = 0;
    this.gold = this.phase === 'perk' && Run.freePerk === 'gold';
    if (this.phase === 'perk') { this.offer = Run.offer(this.registry, this.gold); if (!this.offer.length) this.phase = 'route'; }
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
    this.input.on('pointermove', p => {                                  // (v3.41) on the map, pointing at a planet describes it
      if (this.phase !== 'route' || p.wasTouch) return;
      const i = (this.hits || []).findIndex(r => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
      if (i >= 0 && i !== this.sel) { this.sel = i; if (this.mapShowInfo) this.mapShowInfo(); }
    });
  }
  move(d) { const n = (this.hits || []).length; if (!n || this.going) return; this.sel = (this.sel + d + n) % n; Sound.sfx('jump'); if (this.mapShowInfo && this.phase === 'route') this.mapShowInfo(); }
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
    this.ui.removeAll(true); this.hits = []; this.mapInfo = null; this.mapRocket = null; this.cards = null;
    const s = Shop.get(this.registry), small = H < 430;
    // top bar: the route so far
    const stg = Run.stages(), top = small ? 8 : 14;
    { const tg = this.add.graphics(); this.ui.add(tg); const tw = Math.min(W - 20, 420), tx = (W - tw) / 2, th = small ? 24 : 30;
      tg.fillStyle(0x1a1020, 1).fillRect(tx - 3, top - 5, tw + 6, th + 6); tg.fillStyle(0xc8962a, 1).fillRect(tx - 1, top - 3, tw + 2, th + 2); tg.fillStyle(0x5a140a, 1).fillRect(tx, top - 2, tw, th); tg.fillStyle(0x8a2a1a, 1).fillRect(tx, top - 2, tw, 3);
      tg.fillStyle(0xffd23f, 1).fillRect(tx + 6, top + th / 2 - 4, 4, 4).fillRect(tx + tw - 10, top + th / 2 - 4, 4, 4); }
    this.ui.add(this.add.text(W / 2, top + 1, this.phase === 'perk' ? (this.gold ? 'BONUS! A LEGENDARY PERK' : 'BOSS DOWN! PICK A PERK') : (Run.idx === 0 ? 'RUN MODE' : 'WHERE NEXT?'), f(small ? 14 : 18, '#ffd23f', { stroke: '#5a0a0a', strokeThickness: 5 })).setOrigin(0.5, 0));
    const rowY = top + (small ? 30 : 40), gap = Math.min(70, (W - 80) / stg);
    const rg = this.add.graphics(); this.ui.add(rg);
    for (let i = 0; i < stg; i++) {
      const x = W / 2 + (i - (stg - 1) / 2) * gap, y = rowY + 8;
      if (i < stg - 1) { rg.fillStyle(i < Run.idx ? 0xffd23f : 0x3a4270, 1).fillRect(x + 9, y - 1, gap - 18, 3); }
      if (i < Run.done.length) { { const ik = levelIcon(this, Run.done[i]), im = this.add.image(x, y, ik); if (ik === 'ratship') fitIcon(im, 22, 16); else im.setDisplaySize(16, 16); this.ui.add(im); } rg.lineStyle(2, 0x7dff8a, 1).strokeCircle(x, y, 9); }
      else { rg.fillStyle(i === Run.idx ? 0xffd23f : 0x2a3058, 1).fillCircle(x, y, i === Run.idx ? 7 : 5); if (RUN_ROUTE[i].length > 1) { rg.fillStyle(0x9aa4c8, 1).fillRect(x - 1, y + 10, 3, 3); rg.fillRect(x - 5, y + 13, 3, 3); rg.fillRect(x + 3, y + 13, 3, 3); } }
    }
    // bottom bar: cheddar, hearts, lives, perks
    const by = H - (small ? 22 : 30);
    cheddarBadge(this, o => this.ui.add(o), SAFE_X, 10, s.coins);      // (v3.46) up top-left, in from the curved edge
    let px = SAFE_X;
    for (const id of Object.keys(Run.perks)) {
      const p = RUN_PERKS.concat(RUN_GOLD).find(q => q.id === id); if (!p) continue;
      const im = RUN_UI.fit(this.add.image(px, by, RUN_UI.iconFor(this, p)), 22); this.ui.add(im);
      if (Run.perks[id] > 1) this.ui.add(this.add.text(px + 10, by + 6, 'x' + Run.perks[id], f(7, '#ffffff', { strokeThickness: 3 })).setOrigin(0, 0.5));
      px += 30;
    }
    const lives = this.registry.get('lives') || 0;
    this.ui.add(this.add.text(W - 14, by, Run.str().name + '   RUN SCORE ' + Run.score, f(9, '#e8ecf8')).setOrigin(1, 0.5));
    const midT = rowY + (small ? 30 : 44), midB = by - (small ? 22 : 30);
    if (this.phase === 'perk') this.buildPerks(W, midT, midB, small);
    else this.buildRouteMap(W, midT, midB, small);                      // (v3.41) the star map (runmap.js)
    this.sel = Math.min(this.sel, this.hits.length - 1);
  }
  buildPerks(W, y0, y1, small) {
    const f = RUN_UI.f, n = this.offer.length, cw = Math.min(210, (W - 40 - (n - 1) * 16) / n), ch = Math.min(230, y1 - y0 - (Run.dice > 0 ? 40 : 0));
    const x0 = W / 2 - (n * cw + (n - 1) * 16) / 2;
    this.cards = [];
    this.offer.forEach((p, i) => {
      const x = x0 + i * (cw + 16), y = y0, g = this.add.graphics(); this.ui.add(g);
      const kind = this.gold ? 'LEGENDARY' : PERK_KIND[p.id] || 'LOOT', tone = this.gold ? 0xc8961a : KIND_COL[kind];
      RUN_UI.card(g, x, y, cw, ch, tone, 18);
      this.ui.add(this.add.text(x + 7, y + 5, kind, f(7, '#ffffff', { strokeThickness: 2 })));
      const cy = y + 18 + ch * 0.2, cr = Math.min(36, ch * 0.17);
      g.fillStyle(tone, 0.35).fillCircle(x + cw / 2, cy, cr + 6); g.fillStyle(tone, 0.6).fillCircle(x + cw / 2, cy, cr); g.fillStyle(0xffffff, 0.1).fillCircle(x + cw / 2 - cr * 0.3, cy - cr * 0.3, cr * 0.45);
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; g.fillStyle(0xffd23f, 0.5).fillRect(x + cw / 2 + Math.cos(a) * (cr + 11) - 1, cy + Math.sin(a) * (cr + 11) - 1, 3, 3); }
      const icon = RUN_UI.fit(this.add.image(x + cw / 2, cy, RUN_UI.iconFor(this, p)), Math.min(56, cr * 1.6)); this.ui.add(icon);
      this.ui.add(this.add.text(x + cw / 2, y + ch * 0.48, p.name, f(cw < 170 ? 9 : 11, '#ffffff', { align: 'center', wordWrap: { width: cw - 12 } })).setOrigin(0.5, 0));
      this.ui.add(this.add.text(x + cw / 2, y + ch * 0.48 + (cw < 170 ? 16 : 20), p.sub, f(7, '#ffd23f', { strokeThickness: 3 })).setOrigin(0.5, 0));
      this.ui.add(this.add.text(x + cw / 2, y + ch * 0.48 + (cw < 170 ? 32 : 40), p.desc, f(8, '#c9cde0', { strokeThickness: 3, align: 'center', wordWrap: { width: cw - 16 }, lineSpacing: 4 })).setOrigin(0.5, 0));
      this.ui.add(this.add.text(x + cw - 7, y + 5, String(i + 1), f(7, '#ffffff', { strokeThickness: 2 })).setOrigin(1, 0));
      this.cards.push({ x, y, w: cw, h: ch, icon, iy: icon.y });
      this.hits.push({ x, y, w: cw, h: ch, act: () => this.pickPerk(p, i) });
    });
    if (Run.dice > 0) {                                  // LUCKY DICE (camp larder)
      const bw = 170, bh = 22, bx = W / 2 - bw / 2, by = y0 + ch + 12;
      RUN_UI.btn(this, this.ui, bx, by, bw, bh, 'REROLL (' + Run.dice + ')', 0x7dff8a);
      this.hits.push({ x: bx, y: by, w: bw, h: bh, act: () => { if (this.going) return; Run.dice--; Sound.sfx('zing'); this.offer = Run.offer(this.registry, this.gold); this.build(); } });
    }
  }
  pickPerk(p, i) {
    if (this.going) return;
    Run.take(this.registry, p); Run.freePerk = false; Run.lastPerkAt = Run.idx;
    Sound.sfx('power'); this.cameras.main.flash(150, 255, 230, 160);
    const c = this.cards && this.cards[i];
    if (c) this.tweens.add({ targets: c.icon, scale: c.icon.scale * 1.5, yoyo: true, duration: 140 });
    this.going = true;
    this.time.delayedCall(420, () => { this.going = false; this.phase = 'route'; this.sel = 0; this.build(); });
  }
  buildRoute(W, y0, y1, small) {
    if (Run.bonusOffer[Run.idx] === undefined) Run.bonusOffer[Run.idx] = Run.idx === Run.bonusAt ? RUN_BONUS[Math.floor(Math.random() * RUN_BONUS.length)] : null;   // (v3.12) one bonus stop every run
    const bonus = !Run.bonusDone[Run.idx] && Run.bonusOffer[Run.idx];
    const f = RUN_UI.f, opts = RUN_ROUTE[Run.idx].concat(bonus ? [bonus] : []), n = opts.length;
    const btnH = small ? 26 : 30, area = y1 - y0 - btnH - 10;
    const cw = Math.min(330, (W - 40 - (n - 1) * 20) / n), ch = Math.max(90, Math.min(area, 200));
    const x0 = W / 2 - (n * cw + (n - 1) * 20) / 2;
    this.cards = [];
    if (Run.idx === 0) {     // the rules, once
      this.ui.add(this.add.text(W / 2, y0 - 4, 'ONE LIFE. ' + Run.str().name + ' STRENGTH. A PERK AFTER EVERY BOSS.\nCHEDDAR AND UPGRADES ARE FOR THIS RUN ONLY.', f(7, '#c9cde0', { strokeThickness: 3, align: 'center', lineSpacing: 4 })).setOrigin(0.5, 0));
    }
    const rules = Run.idx === 0 ? 30 : 0, chh = Math.min(ch, area - rules), yy = y0 + rules + Math.max(0, (area - rules - chh) / 2);
    opts.forEach((id, i) => {
      if (typeof id === 'string') {                     // a BONUS STOP: one go, a gun (or a free perk) for winning
        const x = x0 + i * (cw + 20), g = this.add.graphics(); this.ui.add(g);
        RUN_UI.card(g, x, yy, cw, chh, 0xa8801a, 18);
        this.ui.add(this.add.text(x + 7, yy + 5, 'BONUS STOP', f(7, '#ffffff', { strokeThickness: 2 })));
        const cx = x + Math.min(chh * 0.3, cw * 0.17, 46) + 16, cy = yy + 9 + chh / 2, r = Math.min(chh * 0.26, cw * 0.15, 40);
        const pts = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr }); }
        g.fillStyle(0xffd23f, 0.2).fillCircle(cx, cy, r + 8); g.fillStyle(0x1a1020, 1).fillPoints(pts.map(q => ({ x: q.x + 2, y: q.y + 2 })), true); g.fillStyle(0xffd23f, 1).fillPoints(pts, true);
        const tx = x + Math.min(chh * 0.3, cw * 0.17, 46) * 2 + 30, tw = cw - (tx - x) - 10, next = WEAPONS.find(w => w.unlock > 1 && !Progress.hasGun(w.id));
        this.ui.add(this.add.text(tx, yy + chh / 2 - 30, RUN_BONUS_NAME[id], f(cw < 260 ? 9 : 11, '#ffd23f', { wordWrap: { width: tw } })).setOrigin(0, 0.5));
        this.ui.add(this.add.text(tx, yy + chh / 2 - 12, 'ONE GO. NO DANGER.', f(7, '#ff9d3a', { strokeThickness: 3 })).setOrigin(0, 0));
        this.ui.add(this.add.text(tx, yy + chh / 2 + 10, 'Win it for a LEGENDARY perk: bigger, better, rarer.', f(7, '#c9cde0', { strokeThickness: 3, wordWrap: { width: tw }, lineSpacing: 4 })).setOrigin(0, 0));
        this.hits.push({ x, y: yy, w: cw, h: chh, act: () => { Sound.sfx('power'); Run.bonusDone[Run.idx] = true; this.go(id, id === 'zerog' ? { room: 'zerog' } : undefined); } });
        return;
      }
      const L = LEVELS[id], x = x0 + i * (cw + 20), g = this.add.graphics(); this.ui.add(g);
      RUN_UI.card(g, x, yy, cw, chh, RUN_ROUTE[Run.idx].length > 1 ? 0x6a2a8a : 0x2a5aaa, 18);
      this.ui.add(this.add.text(x + 7, yy + 5, RUN_ROUTE[Run.idx].length > 1 ? 'FORK: PICK ONE' : 'NEXT STOP', f(7, '#ffffff', { strokeThickness: 2 })));
      const r = Math.min(chh * 0.3, cw * 0.17, 46);
      const bt = L.boss && L.boss.tex;
      if (bt && this.textures.exists(bt)) { const bi = this.add.image(x + cw - 8, yy + chh - 6, bt).setOrigin(1, 1).setTint(0x2a1a4a).setAlpha(0.85); RUN_UI.fit(bi, Math.min(chh * 0.5, 70)); this.ui.add(bi); }
      for (const o of RUN_UI.planetImg(this, id, x + r + 16, yy + 9 + chh / 2, r)) this.ui.add(o);
      const tx = x + r * 2 + 30, tw = cw - (r * 2 + 40);
      this.ui.add(this.add.text(tx, yy + chh / 2 - 30, L.short || L.name, f(cw < 260 ? 9 : 11, '#ffffff', { wordWrap: { width: tw } })).setOrigin(0, 0.5));
      this.ui.add(this.add.text(tx, yy + chh / 2 - 12, 'BOSS: ' + L.bossName, f(7, '#ff9d3a', { strokeThickness: 3, wordWrap: { width: tw }, lineSpacing: 3 })).setOrigin(0, 0));
      this.ui.add(this.add.text(tx, yy + chh / 2 + 10, (L.blurb || '').replace(/\n/g, ' '), f(7, '#c9cde0', { strokeThickness: 3, wordWrap: { width: tw }, lineSpacing: 4 })).setOrigin(0, 0));
      this.hits.push({ x, y: yy, w: cw, h: chh, act: () => { Sound.sfx('power'); this.go('level1', { level: id, direct: true }); } });     // (v3.10: the gun is chosen at camp)
    });
    if (Progress.testMode) {                                         // (v3.25) TEST MODE: run cheddar on tap
      const tb = this.add.text(W - SAFE_X, 12, '+2000 CHEDDAR (TEST)', f(6, '#1a1020', { strokeThickness: 0, backgroundColor: '#ffd23f', padding: { x: 5, y: 4 } })).setOrigin(1, 0).setInteractive({ useHandCursor: true });
      tb.on('pointerup', () => { const s = Shop.get(this.registry); s.coins += 2000; s.slowmo = 3; Shop.set(this.registry, s); Sound.sfx('power'); this.build(); }); this.ui.add(tb);
    }
    // buttons: SHOP / GIVE UP
    const bw = small ? 120 : 140, by = y1 - btnH + 4;
    [['SHOP', () => { Sound.sfx('wave'); this.go('shop'); }], ['GIVE UP', () => { if (this.going) return; this.going = true; const sum = Run.finish(this.registry, 'quit'); this.cameras.main.fadeOut(220, 0, 0, 0); this.time.delayedCall(250, () => this.scene.start('level1', { camp: true, sum })); }]].forEach(([lab, act], i) => {
      const x = W / 2 + (i ? 12 : -12 - bw);
      RUN_UI.btn(this, this.ui, x, by, bw, btnH - 6, lab, i ? 0xd86a8a : 0xffd23f, i ? '#ff9db8' : '#ffd23f');
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
      if (h.map) g.lineStyle(3, 0xffd23f, 0.75 + 0.25 * Math.sin(this.t * 6)).strokeCircle(h.map.x, h.map.y, h.map.r + 7 + Math.sin(this.t * 6) * 2);   // (v3.41) a ring round the planet
      else g.lineStyle(3, 0xffd23f, 0.75 + 0.25 * Math.sin(this.t * 6)).strokeRect(h.x - 5, h.y - 5, h.w + 10, h.h + 10);
    }
    if (this.mapRocket && this.mapRocket.im.active) this.mapRocket.im.y = this.mapRocket.y + Math.sin(this.t * 3) * 3;
    if (this.cards) this.cards.forEach((c, i) => { if (c.icon && c.iy !== undefined) c.icon.y = c.iy + (i === this.sel ? Math.sin(this.t * 4) * 3 : 0); });
  }
}
