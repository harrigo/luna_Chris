// ================================================================= ACHIEVEMENTS (v3.92)
// Trophies for things worth showing off. They're kept for good (a new game doesn't wipe them), in localStorage 'lc_ach':
//   { got: { id: time }, n: { stat: count }, best: { stat: best } }
// The game reports what happens (Ach.stat('kills'), Ach.best('multi', 3), Ach.unlock('flawless')); anything that crosses a
// line pops a toast at the top of the screen with a fanfare. The menu's TROPHIES button opens the list (TrophyScene).
const ACH_LIST = [
  // ---- rats
  { id: 'kills1', name: 'FIRST BITE', desc: 'Squash your first rat', stat: 'kills', at: 1 },
  { id: 'kills100', name: 'PEST CONTROL', desc: 'Squash 100 rats', stat: 'kills', at: 100 },
  { id: 'kills1000', name: 'RAT RACE WINNER', desc: 'Squash 1,000 rats', stat: 'kills', at: 1000 },
  { id: 'kills5000', name: 'THE PIED PIPER', desc: 'Squash 5,000 rats', stat: 'kills', at: 5000 },
  // ---- multi-kills
  { id: 'multi2', name: 'DOUBLE CHEESE', desc: 'Get a DOUBLE KILL', best: 'multi', at: 2 },
  { id: 'multi3', name: 'TRIPLE DECKER', desc: 'Get a TRIPLE KILL', best: 'multi', at: 3 },
  { id: 'multi4', name: 'QUATTRO FORMAGGI', desc: 'Get a QUAD KILL', best: 'multi', at: 4 },
  { id: 'multi6', name: 'CHEESEPOCALYPSE', desc: 'Take out 6 rats in one go', best: 'multi', at: 6 },
  // ---- bashing
  { id: 'strike', name: 'STRIKE!', desc: 'Bowl 3 rats over with one smashed rat', best: 'strike', at: 3 },
  { id: 'ko1', name: 'HOME RUN', desc: 'Smash a rat clean off the screen', stat: 'kos', at: 1 },
  { id: 'ko25', name: 'OUT OF THE PARK', desc: 'Smash 25 rats off the screen', stat: 'kos', at: 25 },
  { id: 'sweet1', name: 'SWEET SPOT', desc: 'Land a bash right on the sweet spot', stat: 'sweets', at: 1 },
  { id: 'sweet100', name: 'CHEESE WHISPERER', desc: 'Land 100 sweet-spot bashes', stat: 'sweets', at: 100 },
  { id: 'parry', name: 'NOT TODAY', desc: 'Parry a shot back', stat: 'parries', at: 1 },
  { id: 'parry50', name: 'RETURN TO SENDER', desc: 'Parry 50 shots', stat: 'parries', at: 50 },
  // ---- skill
  { id: 'style', name: "SMOKIN' CHEF", desc: 'Reach S style rank', best: 'style', at: 4 },
  { id: 'combo', name: 'ON A ROLL', desc: 'Hit a x20 combo', best: 'combo', at: 20 },
  { id: 'flawless', name: 'UNTOUCHABLE', desc: 'Clear a planet without being hit' },
  { id: 'ranks', name: 'S-CLASS CUISINE', desc: 'Get an S rank on a planet' },
  // ---- cheddar
  { id: 'ched1k', name: 'BIG CHEESE', desc: 'Collect 1,000 cheddar', stat: 'cheddar', at: 1000 },
  { id: 'ched10k', name: 'CHEESE MOGUL', desc: 'Collect 10,000 cheddar', stat: 'cheddar', at: 10000 },
  { id: 'shop', name: 'RETAIL THERAPY', desc: 'Buy something in the space shop' },
  // ---- the bosses
  { id: 'boss1', name: 'CROQUE OFF', desc: 'Beat the Crusty Croque Monsieur', lv: 1 },
  { id: 'boss2', name: 'FEELING BLUE', desc: 'Beat Baron von Blue', lv: 2 },
  { id: 'boss3', name: 'SPILT MILK', desc: 'Beat the Phantom Milkmaid', lv: 3 },
  { id: 'boss4', name: 'COLD SHOULDER', desc: 'Beat the Mozzarella Magma-Golem', lv: 4 },
  { id: 'boss5', name: 'GRATE EXPECTATIONS', desc: 'Beat the Mega-Mandoline', lv: 5 },
  { id: 'boss55', name: 'FONDUE FAREWELL', desc: 'Beat Le Grand Fromage', lv: 5.5 },
  { id: 'boss6', name: 'HIT THE ROAD, JACK', desc: 'Beat the Great Pepper Jack', lv: 6 },
  { id: 'boss7', name: 'SUNK!', desc: 'Beat the Rat Dreadnought', lv: 7 },
  { id: 'boss8', name: 'KNIGHT-NIGHT', desc: 'Beat the Milkmaster', lv: 8 },
  { id: 'boss9', name: 'TOPPLED', desc: 'Beat the Parmesan Colossus', lv: 9 },
  { id: 'boss10', name: 'LONG LIVE THE CHEF', desc: 'Beat the Rat King', lv: 10 },
  { id: 'theend', name: "BESSIE'S HOME", desc: 'Finish the game' },
  // ---- odds and ends
  { id: 'deaths10', name: 'TOASTED', desc: 'Get toasted 10 times', stat: 'deaths', at: 10 },
  { id: 'cavern', name: 'SPELUNKER', desc: 'Find the secret cavern' },
  { id: 'run', name: 'ONE LIFE', desc: 'Start a run in Run Mode' },
  { id: 'runwin', name: 'LEGEND OF THE RUN', desc: 'Win a run' }
];

const Ach = (() => {
  const KEY = 'lc_ach';
  let S = { got: {}, n: {}, best: {} };
  try { const j = JSON.parse(localStorage.getItem(KEY) || 'null'); if (j) S = Object.assign(S, j); } catch (e) { /* storage blocked */ }
  let dirty = false, saveT = null;
  const save = () => { dirty = true; if (saveT) return; saveT = setTimeout(() => { saveT = null; if (!dirty) return; dirty = false; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }, 400); };
  const queue = [];
  let showing = false;
  const testing = () => (typeof Progress !== 'undefined' && Progress.testMode) || (typeof Cheat !== 'undefined' && Cheat.on);

  function unlock(id) {
    if (S.got[id]) return false;
    const a = ACH_LIST.find(x => x.id === id); if (!a) return false;
    if (testing()) return false;                         // (cheats and test mode don't earn trophies)
    S.got[id] = Date.now(); save();
    queue.push(a); pump();
    return true;
  }
  function check(kind, key, v) {
    for (const a of ACH_LIST) if (a[kind] === key && v >= a.at) unlock(a.id);
  }
  function stat(key, n) { S.n[key] = (S.n[key] || 0) + (n === undefined ? 1 : n); save(); check('stat', key, S.n[key]); }
  function best(key, v) { if (v > (S.best[key] || 0)) { S.best[key] = v; save(); } check('best', key, v); }
  function bossBeaten(lv) { const a = ACH_LIST.find(x => x.lv === lv); if (a) unlock(a.id); }
  function progress(a) {                                 // [have, need] for the counted ones, or null
    if (a.stat) return [Math.min(a.at, S.n[a.stat] || 0), a.at];
    if (a.best) return [Math.min(a.at, S.best[a.best] || 0), a.at];
    return null;
  }

  // ---- the toast: slides down at the top of whatever's on screen
  function pump() {
    if (showing || !queue.length || typeof game === 'undefined' || !game.scene) return;
    const scenes = game.scene.getScenes(true); const sc = scenes[scenes.length - 1];
    if (!sc || !sc.add) { setTimeout(pump, 500); return; }
    showing = true;
    const a = queue.shift();
    achTextures(sc);
    const W = sc.scale.width, w = Math.min(W - 24, 300), h = 46, x = Math.round(W / 2 - w / 2);
    const c = sc.add.container(x, -h - 10).setDepth(5000).setScrollFactor(0);
    const g = sc.add.graphics();
    if (typeof hudBox === 'function') hudBox(g, 2, 2, w - 4, h - 4, 0x2a1f5a); else g.fillStyle(0x2a1f5a, 1).fillRect(0, 0, w, h);
    const f = (sz, col) => ({ fontFamily: PIXEL, fontSize: sz + 'px', color: col, stroke: '#1a1020', strokeThickness: 3 });
    c.add([g, sc.add.image(24, h / 2, 'ach_cup').setScale(1),
      sc.add.text(46, 9, 'TROPHY UNLOCKED!', f(7, '#9fd8ff')),
      sc.add.text(46, 21, a.name, f(10, '#ffd23f')),
      sc.add.text(46, 34, a.desc.toUpperCase(), f(6, '#ffffff')).setAlpha(0.85)]);
    const shine = sc.add.image(24, h / 2, 'spark').setBlendMode(Phaser.BlendModes.ADD).setTint(0xfff0a0).setScale(0.2);
    c.add(shine);
    sc.tweens.add({ targets: shine, scale: 2.4, alpha: 0, angle: 90, duration: 700, delay: 300 });
    if (sc.cameras && sc.hudCam) { /* (the pixel look's HUD camera picks it up by depth) */ }
    if (typeof Sound !== 'undefined') Sound.sfx('achieve');
    sc.tweens.add({ targets: c, y: 8, duration: 320, ease: 'Back.easeOut' });
    sc.tweens.add({ targets: c, y: -h - 10, duration: 260, delay: 2900, ease: 'Cubic.easeIn', onComplete: () => { c.destroy(); showing = false; pump(); } });
    sc.events.once('shutdown', () => { if (showing) { showing = false; setTimeout(pump, 300); } });
  }

  return { list: ACH_LIST, unlock, stat, best, bossBeaten, progress, has: id => !!S.got[id], count: () => Object.keys(S.got).length, _S: () => S };
})();

// the little gold cup (and a grey locked one)
function achTextures(scene) {
  if (scene.textures.exists('ach_cup') || typeof BA === 'undefined') return;
  const cup = (key, r, dark) => BA.paint(scene, key, 30, 30, [
    { e: [-9, -6, 5, 6], r, noLine: false }, { e: [9, -6, 5, 6], r },
    { e: [-9, -6, 2.4, 3.2], r: [dark] , noLine: true }, { e: [9, -6, 2.4, 3.2], r: [dark], noLine: true },
    { p: [[-9, -12], [9, -12], [7, 0], [3, 4], [-3, 4], [-7, 0]], r },
    { p: [[-2, 4], [2, 4], [2, 8], [-2, 8]], r },
    { p: [[-7, 8], [7, 8], [8, 12], [-8, 12]], r },
    { l: [[-5, -9], [-4, -2]], c: 0xffffff, w: 1 }
  ], { s: 1, ox: 15, oy: 15 });
  cup('ach_cup', [0xfff2a0, 0xffd23f, 0xd09a1a, 0x8a5a0a], 0x5a3a08);
  cup('ach_lock', [0x8a8aa0, 0x6a6a82, 0x4a4a62, 0x323248], 0x22222e);
}

// ---------------------------------------------------------------- the TROPHIES screen
class TrophyScene extends Phaser.Scene {
  constructor() { super('trophies'); }
  create() {
    makeTextures(this); achTextures(this);
    this.cameras.main.setBackgroundColor('#0b1020').fadeIn(200, 0, 0, 0);
    const W = this.scale.width, H = this.scale.height, f = (sz, col) => ({ fontFamily: PIXEL, fontSize: sz + 'px', color: col, stroke: '#1a1020', strokeThickness: 4 });
    const L = Ach.list, got = Ach.count();
    this.add.text(W / 2, 16, 'TROPHIES', f(18, '#ffd23f')).setOrigin(0.5, 0).setDepth(10);
    this.add.text(W / 2, 40, got + ' / ' + L.length + ' UNLOCKED', f(8, '#9fd8ff')).setOrigin(0.5, 0).setDepth(10);
    const head = this.add.graphics().setDepth(9); head.fillStyle(0x0b1020, 1).fillRect(0, 0, W, 56);
    // two columns of cards (one on a narrow screen), in a container that scrolls
    const cols = W >= 560 ? 2 : 1, gap = 10, cw = Math.min(330, (W - 30 - gap * (cols - 1)) / cols), ch = 44, x0 = (W - (cols * cw + (cols - 1) * gap)) / 2;
    const list = this.add.container(0, 64);
    // unlocked first, then the nearest to done
    const order = L.slice().sort((a, b) => { const ga = Ach.has(a.id) ? 1 : 0, gb = Ach.has(b.id) ? 1 : 0; if (ga !== gb) return gb - ga; const pa = Ach.progress(a), pb = Ach.progress(b); return (pb ? pb[0] / pb[1] : 0) - (pa ? pa[0] / pa[1] : 0); });
    order.forEach((a, i) => {
      const x = x0 + (i % cols) * (cw + gap), y = Math.floor(i / cols) * (ch + 8), on = Ach.has(a.id), g = this.add.graphics();
      hudBox(g, x + 2, y + 2, cw - 4, ch - 4, on ? 0x2a1f5a : 0x1a1630);
      list.add(g);
      list.add(this.add.image(x + 22, y + ch / 2, on ? 'ach_cup' : 'ach_lock').setAlpha(on ? 1 : 0.7));
      list.add(this.add.text(x + 42, y + 8, a.name, f(9, on ? '#ffd23f' : '#8a8aa8')));
      list.add(this.add.text(x + 42, y + 22, a.desc.toUpperCase(), f(6, on ? '#ffffff' : '#9aa0bc')));
      const pr = Ach.progress(a);
      if (pr && !on) {                                     // how far along
        const bw = cw - 56, bx = x + 42, by = y + ch - 10;
        g.fillStyle(0x0c0a24, 1).fillRect(bx, by, bw, 4); g.fillStyle(0x7dc8ff, 1).fillRect(bx, by, Math.round(bw * pr[0] / pr[1]), 4);
        list.add(this.add.text(x + cw - 10, y + 8, pr[0] + '/' + pr[1], f(6, '#7dc8ff')).setOrigin(1, 0));
      }
    });
    const rows = Math.ceil(order.length / cols), contentH = rows * (ch + 8), viewH = H - 64 - 40;
    this.scrollY = 0; const maxS = Math.max(0, contentH - viewH);
    const setS = v => { this.scrollY = Math.max(0, Math.min(maxS, v)); list.y = 64 - this.scrollY; };
    // BACK
    const back = this.add.container(W / 2, H - 20).setDepth(10), bg = this.add.graphics();
    const foot = this.add.graphics().setDepth(9); foot.fillStyle(0x0b1020, 1).fillRect(0, H - 40, W, 40);
    hudBox(bg, -40, -9, 80, 18, 0x2a1f5a); back.add([bg, this.add.text(0, 0, 'BACK', f(9, '#ffffff')).setOrigin(0.5)]);
    const leave = () => { if (this.leaving) return; this.leaving = true; Sound.sfx('jump'); this.cameras.main.fadeOut(180, 0, 0, 0); this.time.delayedCall(200, () => this.scene.start('menu')); };
    this.leaving = false;
    let drag = null, moved = 0;
    this.input.on('pointerdown', p => { drag = p.y; moved = 0; });
    this.input.on('pointermove', p => { if (drag === null || !p.isDown) return; const d = p.y - drag; moved += Math.abs(d); drag = p.y; setS(this.scrollY - d); });
    this.input.on('pointerup', p => { if (moved < 8 && p.y > H - 40) leave(); drag = null; });
    this.input.on('wheel', (p, o, dx, dy) => setS(this.scrollY + dy * 0.6));
    const onKey = e => { const k = e.key; if (k === 'ArrowDown' || k === 's' || k === 'S') setS(this.scrollY + 40); else if (k === 'ArrowUp' || k === 'w' || k === 'W') setS(this.scrollY - 40); else if (k === 'Escape' || k === 'Backspace' || k === 'Enter' || k === 'x' || k === 'X') leave(); };
    window.addEventListener('keydown', onKey);
    const padOff = typeof Pad !== 'undefined' ? Pad.on(b => { if (b === 'down') setS(this.scrollY + 40); else if (b === 'up') setS(this.scrollY - 40); else if (b === 'back' || b === 'a' || b === 'b' || b === 'start') leave(); }) : () => {};
    this.events.once('shutdown', () => { window.removeEventListener('keydown', onKey); padOff(); });
  }
}
