// Settings (saved on the device), a reusable pixel menu (touch / keyboard / controller), and the main menu scene.

const Settings = (() => {
  const load = (k, d) => { try { const v = localStorage.getItem('lc_set_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem('lc_set_' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } };
  const S = {
    gfx: /[?&]lowfx/.test(location.search) ? 'low' : load('gfx', 'high'),     // high | medium | low
    shake: load('shake', true),
    rumble: load('rumble', true),
    diff: load('diff', 'normal'),                    // easy | normal | hard
    padUpJump: load('padUpJump', false),
    moody: load('moody', true),                      // (v3.83) moody light map on level 1 (pixellook.js)
    cam: load('cam', load('camSwing', true) ? 'swing' : 'locked'),   // camera: locked on Chris | swing (lags a little behind) | full (up stays up: run right round, upside down at the bottom)             // controller: push the left stick up to jump (hold = jetpack), like touch
    cycleDiff(dir) { const o = ['easy', 'normal', 'hard'], i = o.indexOf(this.diff); this.set('diff', dir ? o[Math.max(0, Math.min(2, i + dir))] : o[(i + 1) % 3]); },
    get dk() { return { easy: { hp: 0.85, shot: 0.85, spd: 0.95, more: 0 }, normal: { hp: 1.2, shot: 1.1, spd: 1.1, more: 0.25 }, hard: { hp: 1.5, shot: 1.25, spd: 1.2, more: 0.4 } }[this.diff] || { hp: 1.2, shot: 1.1, spd: 1.1, more: 0.25 }; },   // (v3.33: everything up a notch - Chris got a lot more moves)
    get glow() { return this.gfx === 'high'; },      // shader glow on sprites
    get lights() { return this.gfx !== 'low'; },     // light halos + heat haze
    set(k, v) { this[k] = v; save(k, v); },
    cycleGfx(dir) { const o = ['low', 'medium', 'high'], i = o.indexOf(this.gfx); this.set('gfx', dir ? o[Math.max(0, Math.min(2, i + dir))] : o[(i + 1) % 3]); },   // left/right step, select cycles
    soundOn() { return typeof Sound === 'undefined' || !Sound.isMuted(); },
    toggleSound() { if (typeof Sound !== 'undefined') { Sound.init(); Sound.setMuted(!Sound.isMuted()); } }
  };
  return S;
})();

// a volume row: 0-10, left/right step it, select goes up one and wraps round to 0
function volItem(name, kind) {
  const get = () => (typeof Sound !== 'undefined' && Sound.getVolume ? Math.round(Sound.getVolume(kind) * 10) : 10);
  return {
    label: () => { const n = get(); return name + ' VOLUME: ' + '|'.repeat(n) + '.'.repeat(10 - n) + ' ' + n; },
    act: d => {
      if (typeof Sound === 'undefined' || !Sound.setVolume) return;
      Sound.init();
      const n = get(), m = d ? Math.max(0, Math.min(10, n + d)) : (n + 1) % 11;
      Sound.setVolume(kind, m / 10);
      if (kind === 'sfx') Sound.sfx('pickup');                    // hear how loud it is now
    }
  };
}
// options shared by the main menu and the pause menu
function optionItems(onGfx) {
  return [
    { label: () => 'DIFFICULTY: ' + Settings.diff.toUpperCase(), act: d => Settings.cycleDiff(d) },
    { label: () => 'GRAPHICS: ' + Settings.gfx.toUpperCase(), act: d => { Settings.cycleGfx(d); if (onGfx) onGfx(); } },
    { label: () => 'LIGHTING: ' + (Settings.moody ? 'MOODY (LV 1)' : 'CLASSIC'), act: () => { Settings.set('moody', !Settings.moody); if (onGfx) onGfx(); } },
    { label: () => 'SOUND: ' + (Settings.soundOn() ? 'ON' : 'OFF'), act: () => Settings.toggleSound() },
    volItem('MUSIC', 'music'),
    volItem('SFX', 'sfx'),
    { label: () => 'SCREEN SHAKE: ' + (Settings.shake ? 'ON' : 'OFF'), act: () => Settings.set('shake', !Settings.shake) },
    { label: () => 'RUMBLE: ' + (Settings.rumble ? 'ON' : 'OFF'), act: () => { Settings.set('rumble', !Settings.rumble); if (Settings.rumble) buzzAll(120); } },
    { label: () => 'CAMERA: ' + Settings.cam.toUpperCase() + (Settings.cam === 'full' ? ' (LV 1)' : ''), act: d => { const o = ['locked', 'swing', 'full'], i = o.indexOf(Settings.cam); Settings.set('cam', o[((d ? i + d : i + 1) % 3 + 3) % 3]); } },
    { label: () => 'PAD STICK-UP JUMP: ' + (Settings.padUpJump ? 'ON' : 'OFF'), act: () => Settings.set('padUpJump', !Settings.padUpJump) }
  ];
}
// what the player is using right now: the last thing they touched (kb = keyboard + mouse)
let LAST_INPUT = null;
function inputDevice() {
  if (LAST_INPUT) return LAST_INPUT;
  if (typeof Pad !== 'undefined' && Pad.state.connected) return 'pad';
  return ((navigator.maxTouchPoints || 0) > 0 || ('ontouchstart' in window)) ? 'touch' : 'kb';
}
window.addEventListener('keydown', () => { LAST_INPUT = 'kb'; }, true);
window.addEventListener('mousedown', () => { LAST_INPUT = 'kb'; }, true);
window.addEventListener('touchstart', () => { LAST_INPUT = 'touch'; }, { capture: true, passive: true });
if (typeof Pad !== 'undefined') Pad.on(() => { LAST_INPUT = 'pad'; });

// the controls for each way of playing (shared by the main menu, the pause menu and the level-start card)
const CONTROL_SETS = {
  kb: { title: 'KEYBOARD + MOUSE', lines: [
    ['A D / ARROWS', 'run'], ['SPACE / W', 'jump (hold = jetpack)'], ['SHIFT', 'jetpack right away'], ['S / DOWN', 'duck (in the air: dive)'],
    ['MOUSE', 'aim'], ['LEFT CLICK / J', 'fire (hold = charge Swiss)'], ['RIGHT CLICK / F / K', 'bash'],
    ['WHEEL / Q / E', 'swap gun'], ['1 2 3', 'pick a gun'], ['ESC / P', 'pause']] },
  pad: { title: 'CONTROLLER', lines: [
    ['LEFT STICK', 'run (down = duck)'], ['A', 'jump (hold = jetpack)'], ['STICK UP', 'jump too, if PAD STICK-UP JUMP is on'], ['LT', 'jetpack right away'], ['RIGHT STICK', 'aim + fire'],
    ['RT', 'fire (squeeze = stronger)'], ['B', 'bash'], ['Y', 'swap gun'], ['START', 'pause']] },
  touch: { title: 'TOUCH', lines: [
    ['LEFT: DRAG', 'run'], ['LEFT: TAP / UP', 'jump (hold up = jetpack)'], ['LEFT: PUSH TO TOP', 'jetpack right away'],
    ['RIGHT: DRAG', 'aim + fire (further = longer)'], ['BASH BUTTON', 'bash'], ['TAP GUN BOX', 'swap gun'], ['PAUSE BUTTON', 'pause']] }
};
function controlItems(dev, I) {
  const C = CONTROL_SETS[dev] || CONTROL_SETS.kb;
  return [I(C.title, '#ffd23f')].concat(C.lines.map(([key, text]) => ({ info: true, key, text }))).concat([
    I('Out of pasta? BASH them. Stomp heads to refuel the jet.', '#9fd8ff'),
    I('SWISS-SHOT: hold fire to charge, let go to throw', '#9fd8ff')]);
}

function buzzAll(ms) {
  safeVibrate(ms);
  try { if (typeof Pad !== 'undefined' && Pad.state.connected) Pad.rumble(ms); } catch (e) { /* ignore */ }
}

// A pixel-styled vertical menu. items: [{ label: () => string, act: dir => void }] (dir: 0 = select, -1/1 = left/right).
function makeMenu(scene, opt) {
  const W = scene.scale.width, H = scene.scale.height, depth = opt.depth || 40;
  const c = scene.add.container(0, 0).setDepth(depth);
  const f = (size, color) => ({ fontFamily: PIXEL, fontSize: size + 'px', color, stroke: '#1a1020', strokeThickness: 4 });
  let items = opt.items, sel = 0, texts = [], title = null, g = null;
  const build = () => {
    c.removeAll(true);
    // size the box to what's in it: no empty title band, width from the longest line
    const rowH = 26, infoH = 15, top = opt.title ? 50 : 14;
    const rows = items.map(it => it.info ? infoH : rowH), bodyH = rows.reduce((a, b) => a + b, 0);
    const longest = Math.max(...items.map(it => it.key ? Math.max(String(it.key).length, String(it.text).length) * 2 * 8.2 + 24 : (it.info ? String(it.text).length * 8.2 : (it.label().length + 6) * 10.4)), opt.title ? opt.title.length * 16 : 0);
    const w = Math.min(W - 24, Math.max(opt.minWidth || 200, Math.round(longest + 44))), h = top + bodyH + 6;
    const x = Math.round(opt.x !== undefined ? opt.x : (W - w) / 2);
    const y = Math.round(opt.y !== undefined ? Math.max(8, Math.min(opt.y, H - h - 10)) : (H - h) / 2);
    if (opt.dim !== false) c.add(scene.add.rectangle(0, 0, W, H, 0x000000, 0.55).setOrigin(0).setInteractive());   // swallow taps behind
    g = scene.add.graphics();
    g.fillStyle(0x1a1020, 1).fillRect(x - 3, y - 3, w + 6, h + 6).fillStyle(0xc9cde0, 1).fillRect(x - 1, y - 1, w + 2, h + 2).fillStyle(0x151b40, 0.96).fillRect(x, y, w, h);
    c.add(g);
    title = scene.add.text(x + w / 2, y + 14, opt.title || '', f(16, '#ffd23f')).setOrigin(0.5, 0); c.add(title);
    let yy = y + top;
    texts = items.map((it, i) => {
      const ty = yy; yy += rows[i];
      if (it.key) {                                        // a two-column line: KEY (right-aligned) | what it does (left-aligned)
        const k = scene.add.text(x + w / 2 - 8, ty, it.key, f(8, '#ffd23f')).setOrigin(1, 0).setStroke('#1a1020', 3);
        const t = scene.add.text(x + w / 2 + 8, ty, it.text, f(8, '#e8ecf8')).setOrigin(0, 0).setStroke('#1a1020', 3); c.add([k, t]); return t;
      }
      if (it.info) { const t = scene.add.text(x + w / 2, ty, it.text, f(8, it.color || '#c9cde0')).setOrigin(0.5, 0).setStroke('#1a1020', 3); c.add(t); return t; }   // a line of info, not selectable
      const t = scene.add.text(x + w / 2, ty, '', f(10, '#ffffff')).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
      t.on('pointerover', () => { sel = i; render(); });
      t.on('pointerup', () => { sel = i; Sound.sfx('pickup'); it.act(0); render(); });
      c.add(t); return t;
    });
    render();
  };
  let dead = false;
  const render = () => !dead && texts.forEach((t, i) => items[i].info || t.setText((i === sel ? '> ' : '  ') + items[i].label() + (i === sel ? ' <' : '  ')).setColor(i === sel ? '#ffd23f' : '#ffffff'));
  const move = d => { for (let k = 0; k < items.length; k++) { sel = (sel + d + items.length) % items.length; if (!items[sel].info) break; } Sound.sfx('jump'); render(); };
  const first = () => { sel = Math.max(0, items.findIndex(it => !it.info)); };
  const act = d => { if (items[sel].info) return; Sound.sfx(d ? 'jump' : 'pickup'); items[sel].act(d); render(); };
  const onKey = e => {
    const k = e.key;
    if (k === 'ArrowUp' || k === 'w' || k === 'W') move(-1);
    else if (k === 'ArrowDown' || k === 's' || k === 'S') move(1);
    else if (k === 'ArrowLeft' || k === 'a' || k === 'A') act(-1);
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') act(1);
    else if (k === 'Enter' || k === ' ' || k === 'x' || k === 'X' || k === 'z' || k === 'Z') act(0);
    else if ((k === 'Escape' || k === 'Backspace') && opt.onBack) opt.onBack();
  };
  window.addEventListener('keydown', onKey);
  const padOff = Pad.on(b => {
    if (b === 'up') move(-1); else if (b === 'down') move(1);
    else if (b === 'left') act(-1); else if (b === 'right') act(1);
    else if (b === 'a') act(0);
    else if ((b === 'b' || b === 'back') && opt.onBack) opt.onBack();
  });
  build();
  const api = {
    setItems(list, ttl) { items = list; first(); if (ttl !== undefined) opt.title = ttl; build(); },
    refresh: render,
    destroy() { dead = true; window.removeEventListener('keydown', onKey); padOff(); scene.scale.off('resize', build); c.destroy(); }
  };
  scene.scale.on('resize', build);
  scene.events.once('shutdown', () => { window.removeEventListener('keydown', onKey); padOff(); scene.scale.off('resize', build); });
  return api;
}

// ---------------------------------------------------------------- main menu (after the title / intro)
class MenuScene extends Phaser.Scene {
  constructor() { super('menu'); }
  create() {
    if (typeof Run !== 'undefined' && Run.on) Run.restore(this.registry);   // (v3.05) never leave a run's state lying about
    makeTextures(this); makeLevelTextures(this);
    this.cameras.main.setBackgroundColor('#0b1020').fadeIn(250, 0, 0, 0);
    Sound.init(); Sound.music('title');
    this.bg = null; this.backdrop = new TitleBackdrop(this, 0.08, 0);   // (v2.54: the pixel title scene, not the painted cover art)
    this.events.on('update', () => { if (this.backdrop) this.backdrop.update(); });
    this.logo = this.add.text(0, 0, 'LUNA CHRIS', { fontFamily: PIXEL, fontSize: '40px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 8 }).setOrigin(0.5);
    this.sub = this.add.text(0, 0, 'RETIRED CHEF, EX-ASTRONAUT, HERO', { fontFamily: PIXEL, fontSize: '10px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 4 }).setOrigin(0.5);
    this.fit();
    this.logo.setShadow(4, 5, '#000000', 0, true, true);
    this.tweens.add({ targets: this.logo, angle: { from: -2, to: 2 }, yoyo: true, repeat: -1, duration: 1400, ease: 'Sine.easeInOut' });   // (v3.37) a happy wobble
    this.scale.on('resize', this.fit, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.fit, this));
    this.going = false;
    // (v3.37) the main menu is three big cards - CAMPAIGN, RUN MODE, TRAINING - and a little row underneath for the rest.
    // The text menus are kept for the sub-screens (options, controls, the new-game check).
    const hasSave = () => { try { return Object.keys(localStorage).some(k => /^lc_(best|cbeat|found|sbeat_|gun_|rank_|wheels_|spins)/.test(k) && localStorage.getItem(k) && localStorage.getItem(k) !== '0'); } catch (e) { return false; } };
    const sub = (items, title) => { this.tilesShow(false); this.logo.setVisible(title !== 'NEW GAME?'); this.sub.setVisible(false); if (this.menu) this.menu.destroy();
      this.menu = makeMenu(this, { items, title, dim: false, y: Math.round(this.scale.height * 0.5), minWidth: 220, depth: 5, onBack: toMain }); };
    const toMain = () => { if (this.menu) { this.menu.destroy(); this.menu = null; } this.logo.setVisible(true); this.sub.setVisible(true); this.tilesShow(true); };
    const confirmNew = () => [
      { info: true, text: 'THIS WIPES ALL PROGRESS:', color: '#ff7a5a' },
      { info: true, text: 'LEVELS, GUNS, WHEELS, RANKS', color: '#ffffff' },
      { label: () => 'YES, START AGAIN', act: () => this.newGame() },
      { label: () => 'NO, GO BACK', act: toMain }];
    const opts = () => optionItems().concat([{ label: () => 'BACK', act: toMain }]);
    const I = (text, color) => ({ info: true, text, color });
    let dev = inputDevice();
    const controls = () => controlItems(dev, I).concat([
      { label: () => 'SHOW: ' + { kb: 'KEYBOARD', pad: 'CONTROLLER', touch: 'TOUCH' }[dev] + '  >', act: d => { const o = ['kb', 'pad', 'touch']; dev = o[(o.indexOf(dev) + (d || 1) + 3) % 3]; sub(controls(), 'CONTROLS'); } },
      { label: () => 'BACK', act: toMain }
    ]);
    const crumbs = typeof Meta !== 'undefined' ? Meta.crumbs() : 0, lv = Math.min(CFG.finalLevel || 10, Progress.best + 1);
    if (typeof makeCampTextures === 'function') makeCampTextures(this);
    this.menu = null;
    this.tileDefs = [
      { label: hasSave() ? 'CONTINUE' : 'PLAY', sub: hasSave() ? 'PLANET ' + lv : 'SAVE BESSIE!', head: 'CAMPAIGN', icon: 'bessie', col: 0x2a6ad8, act: () => this.go() },
      { label: 'RUN MODE', sub: crumbs ? crumbs + ' CRUMBS' : 'ONE LIFE. GO!', head: 'ROGUELITE', icon: 'cr_rocket', col: 0xd8402a, act: () => this.startRun() },
      { label: 'TRAINING', sub: 'LEARN THE MOVES', head: 'PRACTICE', icon: 'cr_dummy', col: 0x2a9a4a, act: () => { if (this.going) return; this.going = true; this.cameras.main.fadeOut(200, 0, 0, 0); this.time.delayedCall(230, () => this.scene.start('level1', { training: { from: 'menu' } })); } }
    ];
    // (v3.50) NEW GAME asks which to start again: the campaign, or Run Mode (they're kept separately)
    const confirmRun = () => [
      { info: true, text: 'THIS WIPES RUN MODE:', color: '#ff7a5a' },
      { info: true, text: 'GOLDEN CRUMBS, LARDER, STRENGTHS,', color: '#ffffff' },
      { info: true, text: 'CAMP UNLOCKS, BEST RUNS, BOSS RUSH', color: '#ffffff' },
      { label: () => 'YES, RESET RUN MODE', act: () => this.resetRuns() },
      { label: () => 'NO, GO BACK', act: toMain }];
    const which = () => [
      { label: () => 'NEW CAMPAIGN', act: () => sub(confirmNew(), 'NEW GAME?') },
      { label: () => 'RESET RUN MODE', act: () => sub(confirmRun(), 'RESET RUN MODE?') },
      { label: () => 'BACK', act: toMain }];
    this.pillDefs = [{ label: 'NEW GAME', act: () => sub(which(), 'START AGAIN') }].concat([
      { label: 'CONTROLS', act: () => sub(controls(), 'CONTROLS') },
      { label: 'OPTIONS', act: () => sub(opts(), 'OPTIONS') }
    ]).concat(Progress.best >= CFG.finalLevel ? [{ label: 'THE END', act: () => { if (!this.going) { this.going = true; this.cameras.main.fadeOut(300, 0, 0, 0); this.time.delayedCall(330, () => this.scene.start('ending')); } } }] : []);
    this.focus = 0; this.tilesOn = true;
    this.tilesBuild();
    this.scale.on('resize', this.tilesBuild, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.tilesBuild, this));
    // keys / pad: left-right along a row, up-down between the cards and the little row
    const nT = () => this.tileDefs.length, nAll = () => this.tileDefs.length + this.pillDefs.length;
    const move = (dx, dy) => {
      if (!this.tilesOn) return;
      let f = this.focus;
      if (dy > 0 && f < nT()) f = nT() + Math.min(this.pillDefs.length - 1, Math.round(f * (this.pillDefs.length - 1) / Math.max(1, nT() - 1)));
      else if (dy < 0 && f >= nT()) f = Math.min(nT() - 1, Math.round((f - nT()) * (nT() - 1) / Math.max(1, this.pillDefs.length - 1)));
      else if (dx) { const row0 = f < nT() ? 0 : nT(), rowN = f < nT() ? nT() : this.pillDefs.length; f = row0 + (((f - row0 + dx) % rowN) + rowN) % rowN; }
      if (f !== this.focus) { this.focus = f; Sound.sfx('jump'); this.tilesPop(f); }
    };
    const fire = () => { if (!this.tilesOn || this.going) return; const d = this.focus < nT() ? this.tileDefs[this.focus] : this.pillDefs[this.focus - nT()]; Sound.sfx('pickup'); this.tilesPop(this.focus, true); this.time.delayedCall(120, () => d.act()); };
    const onKey = e => {
      if (!this.tilesOn) return;
      const k = e.key;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') move(-1, 0); else if (k === 'ArrowRight' || k === 'd' || k === 'D') move(1, 0);
      else if (k === 'ArrowUp' || k === 'w' || k === 'W') move(0, -1); else if (k === 'ArrowDown' || k === 's' || k === 'S') move(0, 1);
      else if (k === 'Enter' || k === ' ' || k === 'z' || k === 'Z' || k === 'x' || k === 'X') fire();
    };
    window.addEventListener('keydown', onKey);
    const padOff = Pad.on(b => { if (!this.tilesOn) return; if (b === 'left') move(-1, 0); else if (b === 'right') move(1, 0); else if (b === 'up') move(0, -1); else if (b === 'down') move(0, 1); else if (b === 'a' || b === 'start') fire(); });
    this.events.once('shutdown', () => { window.removeEventListener('keydown', onKey); padOff(); });
    this.input.on('pointermove', p => { if (!this.tilesOn || p.wasTouch) return; const i = this.tileHit(p.x, p.y); if (i >= 0 && i !== this.focus) { this.focus = i; this.tilesPop(i); } });
    this.input.on('pointerup', p => { if (!this.tilesOn) return; const i = this.tileHit(p.x, p.y); if (i >= 0) { this.focus = i; fire(); } });
    this.events.on('update', () => this.tilesTick());
  }
  // ---- the cards
  tilesBuild() {
    if (this.tileC) this.tileC.destroy();
    const W = this.scale.width, H = this.scale.height, n = this.tileDefs.length, gap = Math.max(10, W * 0.02);
    const tw = Math.min(190, (W - 60 - gap * (n - 1)) / n), th = Math.min(170, H * 0.4, tw * 1.05), y0 = Math.round(H * 0.34), x0 = (W - (n * tw + (n - 1) * gap)) / 2;
    const c = this.tileC = this.add.container(0, 0).setDepth(5).setVisible(this.tilesOn !== false);
    const f = (sz, col) => ({ fontFamily: PIXEL, fontSize: sz + 'px', color: col, stroke: '#1a1020', strokeThickness: 4 });
    this.tiles = this.tileDefs.map((d, i) => {
      const x = x0 + i * (tw + gap), t = this.add.container(x + tw / 2, y0 + th / 2), g = this.add.graphics();
      g.fillStyle(0x1a1020, 1).fillRoundedRect(-tw / 2 - 4, -th / 2 - 4, tw + 8, th + 8, 10);
      g.fillStyle(d.col, 1).fillRoundedRect(-tw / 2, -th / 2, tw, th, 8);
      g.fillStyle(0x000000, 0.28).fillRoundedRect(-tw / 2 + 6, -th / 2 + 24, tw - 12, th * 0.52, 6);           // a dark window for the picture
      g.fillStyle(0xffffff, 0.16).fillRoundedRect(-tw / 2, -th / 2, tw, 6, { tl: 8, tr: 8, bl: 0, br: 0 });  // a shine along the top
      t.add(g);
      t.add(this.add.text(0, -th / 2 + 6, d.head, f(7, '#ffffff')).setOrigin(0.5, 0).setAlpha(0.8));
      let im = null;
      if (this.textures.exists(d.icon)) { im = this.add.image(0, -th / 2 + 24 + th * 0.26, d.icon); const fr = im.frame, s = Math.min((tw - 30) / fr.width, th * 0.46 / fr.height); im.setScale(s); im.baseS = s; t.add(im); }
      t.add(this.add.text(0, th / 2 - 34, d.label, f(Math.min(14, tw / 11), '#ffd23f')).setOrigin(0.5, 0));
      t.add(this.add.text(0, th / 2 - 14, d.sub, f(7, '#ffffff')).setOrigin(0.5, 0));
      const ring = this.add.graphics(); t.add(ring);
      c.add(t);
      return { t, im, ring, x, y: y0, w: tw, h: th, ph: i * 1.7 };
    });
    // the little row underneath
    const py = Math.min(H - 22, y0 + th + Math.max(26, H * 0.08));
    let px = 0; const pw = this.pillDefs.map(d => d.label.length * 8 + 26), pg2 = 10, total = pw.reduce((a, b) => a + b, 0) + pg2 * (pw.length - 1);
    px = (W - total) / 2;
    this.pills = this.pillDefs.map((d, i) => {
      const w = pw[i], h = 24, t = this.add.container(px + w / 2, py), g = this.add.graphics();
      g.fillStyle(0x1a1020, 0.85).fillRoundedRect(-w / 2, -h / 2, w, h, 12); t.add(g);
      t.add(this.add.text(0, 0, d.label, f(8, '#e8ecf8')).setOrigin(0.5));
      const ring = this.add.graphics(); t.add(ring); c.add(t);
      const o = { t, ring, x: px, y: py - h / 2, w, h, pill: true }; px += w + pg2; return o;
    });
    this.tilesPop(this.focus || 0);
  }
  tilesShow(on) { this.tilesOn = on; if (this.tileC) this.tileC.setVisible(on); }
  tileHit(x, y) {
    const all = (this.tiles || []).concat(this.pills || []);
    return all.findIndex(o => x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h);
  }
  tilesPop(i, press) {
    const all = (this.tiles || []).concat(this.pills || []), o = all[i]; if (!o) return;
    this.tweens.killTweensOf(o.t); o.t.setScale(press ? 0.9 : 1.12);
    this.tweens.add({ targets: o.t, scale: press ? 1.04 : 1.06, duration: press ? 160 : 260, ease: 'Back.easeOut' });
    for (const q of all) if (q !== o) { this.tweens.killTweensOf(q.t); this.tweens.add({ targets: q.t, scale: 1, duration: 160 }); }
  }
  tilesTick() {
    if (!this.tiles || !this.tilesOn) return;
    const t = this.time.now / 1000, all = this.tiles.concat(this.pills);
    all.forEach((o, i) => {
      const on = i === this.focus;
      if (!o.pill) { o.t.y = o.y + o.h / 2 + Math.sin(t * 2 + o.ph) * 3; if (o.im) { o.im.setRotation(on ? Math.sin(t * 6) * 0.06 : 0); o.im.setScale(o.im.baseS * (on ? 1.06 + 0.04 * Math.sin(t * 8) : 1)); } }
      o.ring.clear(); if (on) { o.ring.lineStyle(3, 0xffd23f, 0.7 + 0.3 * Math.sin(t * 6)); if (o.pill) o.ring.strokeRoundedRect(-o.w / 2 - 3, -o.h / 2 - 3, o.w + 6, o.h + 6, 14); else o.ring.strokeRoundedRect(-o.w / 2 - 6, -o.h / 2 - 6, o.w + 12, o.h + 12, 12); }
    });
  }

  fit() {
    const W = this.scale.width, H = this.scale.height;
    if (this.bg) this.bg.setPosition(W / 2, H / 2).setScale(Math.max(W / 1024, H / 572));
    const fs = Math.max(26, Math.min(48, W / 16));
    this.logo.setFontSize(fs).setPosition(W / 2, H * 0.13);
    this.sub.setPosition(W / 2, H * 0.13 + fs * 0.8);
  }
  newGame() {                                       // wipe the save (settings, volume and cheat mode stay) and the run in hand, then off to the map
    if (this.going) return;
    try { for (const k of Object.keys(localStorage)) if (/^lc_(best|cbeat|found|sbeat_|gun_|rank_|wheels_|spins|megaspins|weapon|testmode)/.test(k)) localStorage.removeItem(k); } catch (e) { /* ignore */ }
    this.registry.set('lives', CFG.startLives); this.registry.set('gunLv', {}); if (typeof Shop !== 'undefined') Shop.reset(this.registry);
    Sound.sfx('power'); this.go();
  }
  // (v3.50) wipe Run Mode only: crumbs, larder, kits, strengths, stats and bests, camp unlocks, the cavern, the Boss Rush, who's said what
  resetRuns() {
    if (this.going) return;
    try { for (const k of Object.keys(localStorage)) if (/^lc_(crumbs|larder|kit|run_|rush_|camp_seen|cave_|toys|talk)/.test(k)) localStorage.removeItem(k); } catch (e) { /* ignore */ }
    if (typeof Run !== 'undefined') Run.on = false;
    Sound.sfx('power'); this.cameras.main.flash(200, 255, 220, 160);
    this.scene.restart();
  }
  startRun() {                                      // (v3.05) a roguelite run (run.js): the campaign is put aside until it ends
    if (this.going) return; this.going = true;
    Sound.sfx('power');
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.time.delayedCall(230, () => this.scene.start('level1', { camp: true }));     // (v3.07) to the MOON CAMP (a real little planet)
  }
  go() {
    if (this.going) return; this.going = true;
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.time.delayedCall(230, () => this.scene.start('select'));
  }
}
