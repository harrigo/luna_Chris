// Settings (saved on the device), a reusable pixel menu (touch / keyboard / controller), and the main menu scene.

const Settings = (() => {
  const load = (k, d) => { try { const v = localStorage.getItem('lc_set_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem('lc_set_' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } };
  const S = {
    gfx: /[?&]lowfx/.test(location.search) ? 'low' : load('gfx', 'high'),     // high | medium | low
    shake: load('shake', true),
    rumble: load('rumble', true),
    diff: load('diff', 'normal'),                    // easy | normal | hard
    cycleDiff(dir) { const o = ['easy', 'normal', 'hard'], i = o.indexOf(this.diff); this.set('diff', dir ? o[Math.max(0, Math.min(2, i + dir))] : o[(i + 1) % 3]); },
    get dk() { return { easy: { hp: 0.7, shot: 0.75 }, normal: { hp: 1, shot: 1 }, hard: { hp: 1.3, shot: 1.15 } }[this.diff] || { hp: 1, shot: 1 }; },
    get glow() { return this.gfx === 'high'; },      // shader glow on sprites
    get lights() { return this.gfx !== 'low'; },     // light halos + heat haze
    set(k, v) { this[k] = v; save(k, v); },
    cycleGfx(dir) { const o = ['low', 'medium', 'high'], i = o.indexOf(this.gfx); this.set('gfx', dir ? o[Math.max(0, Math.min(2, i + dir))] : o[(i + 1) % 3]); },   // left/right step, select cycles
    soundOn() { return typeof Sound === 'undefined' || !Sound.isMuted(); },
    toggleSound() { if (typeof Sound !== 'undefined') { Sound.init(); Sound.setMuted(!Sound.isMuted()); } }
  };
  return S;
})();

// options shared by the main menu and the pause menu
function optionItems(onGfx) {
  return [
    { label: () => 'DIFFICULTY: ' + Settings.diff.toUpperCase(), act: d => Settings.cycleDiff(d) },
    { label: () => 'GRAPHICS: ' + Settings.gfx.toUpperCase(), act: d => { Settings.cycleGfx(d); if (onGfx) onGfx(); } },
    { label: () => 'SOUND: ' + (Settings.soundOn() ? 'ON' : 'OFF'), act: () => Settings.toggleSound() },
    { label: () => 'SCREEN SHAKE: ' + (Settings.shake ? 'ON' : 'OFF'), act: () => Settings.set('shake', !Settings.shake) },
    { label: () => 'RUMBLE: ' + (Settings.rumble ? 'ON' : 'OFF'), act: () => { Settings.set('rumble', !Settings.rumble); if (Settings.rumble) buzzAll(120); } }
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
    ['LEFT STICK', 'run (down = duck)'], ['A', 'jump (hold = jetpack)'], ['LT', 'jetpack right away'], ['RIGHT STICK', 'aim + fire'],
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
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* ignore */ }
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
    makeTextures(this); makeLevelTextures(this);
    this.cameras.main.setBackgroundColor('#0b1020').fadeIn(250, 0, 0, 0);
    Sound.init(); Sound.music('title');
    this.bg = this.textures.exists('titleArt') ? this.add.image(0, 0, 'titleArt').setAlpha(0.45) : null;
    this.logo = this.add.text(0, 0, 'LUNA CHRIS', { fontFamily: PIXEL, fontSize: '40px', color: '#ffd23f', stroke: '#1a1020', strokeThickness: 8 }).setOrigin(0.5);
    this.sub = this.add.text(0, 0, 'SPACE-RANCH HERO', { fontFamily: PIXEL, fontSize: '10px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 4 }).setOrigin(0.5);
    this.fit();
    this.scale.on('resize', this.fit, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.fit, this));
    this.going = false;
    const toMain = () => { this.logo.setVisible(true); this.sub.setVisible(true); this.menu.setItems(main(), ''); };
    const main = () => [
      { label: () => 'PLAY', act: () => this.go() },
      { label: () => 'CONTROLS', act: () => { this.logo.setVisible(false); this.sub.setVisible(false); this.menu.setItems(controls(), 'CONTROLS'); } },
      { label: () => 'OPTIONS', act: () => this.menu.setItems(opts(), 'OPTIONS') }
    ].concat(Progress.best >= CFG.finalLevel ? [{ label: () => 'THE END', act: () => { if (!this.going) { this.going = true; this.cameras.main.fadeOut(300, 0, 0, 0); this.time.delayedCall(330, () => this.scene.start('ending')); } } }] : []);
    const opts = () => optionItems().concat([{ label: () => 'BACK', act: toMain }]);
    const I = (text, color) => ({ info: true, text, color });
    let dev = inputDevice();
    const controls = () => controlItems(dev, I).concat([
      { label: () => 'SHOW: ' + { kb: 'KEYBOARD', pad: 'CONTROLLER', touch: 'TOUCH' }[dev] + '  >', act: d => { const o = ['kb', 'pad', 'touch']; dev = o[(o.indexOf(dev) + (d || 1) + 3) % 3]; this.menu.setItems(controls(), 'CONTROLS'); } },
      { label: () => 'BACK', act: toMain }
    ]);
    this.menu = makeMenu(this, { items: main(), title: '', dim: false, y: Math.round(this.scale.height * 0.5), minWidth: 220, depth: 5,
      onBack: toMain });
  }
  fit() {
    const W = this.scale.width, H = this.scale.height;
    if (this.bg) this.bg.setPosition(W / 2, H / 2).setScale(Math.max(W / 1024, H / 572));
    const fs = Math.max(26, Math.min(48, W / 16));
    this.logo.setFontSize(fs).setPosition(W / 2, H * 0.2);
    this.sub.setPosition(W / 2, H * 0.2 + fs * 0.85);
  }
  go() {
    if (this.going) return; this.going = true;
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.time.delayedCall(230, () => this.scene.start('select'));
  }
}
