// Settings (saved on the device), a reusable pixel menu (touch / keyboard / controller), and the main menu scene.

const Settings = (() => {
  const load = (k, d) => { try { const v = localStorage.getItem('lc_set_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem('lc_set_' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } };
  const S = {
    gfx: /[?&]lowfx/.test(location.search) ? 'low' : load('gfx', 'high'),     // high | medium | low
    shake: load('shake', true),
    rumble: load('rumble', true),
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
    { label: () => 'GRAPHICS: ' + Settings.gfx.toUpperCase(), act: d => { Settings.cycleGfx(d); if (onGfx) onGfx(); } },
    { label: () => 'SOUND: ' + (Settings.soundOn() ? 'ON' : 'OFF'), act: () => Settings.toggleSound() },
    { label: () => 'SCREEN SHAKE: ' + (Settings.shake ? 'ON' : 'OFF'), act: () => Settings.set('shake', !Settings.shake) },
    { label: () => 'RUMBLE: ' + (Settings.rumble ? 'ON' : 'OFF'), act: () => { Settings.set('rumble', !Settings.rumble); if (Settings.rumble) buzzAll(120); } }
  ];
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
    const rowH = 26, w = Math.min(W - 40, opt.width || 330), h = 70 + items.length * rowH;
    const x = Math.round(opt.x !== undefined ? opt.x : (W - w) / 2), y = Math.round(opt.y !== undefined ? opt.y : (H - h) / 2);
    if (opt.dim !== false) c.add(scene.add.rectangle(0, 0, W, H, 0x000000, 0.55).setOrigin(0).setInteractive());   // swallow taps behind
    g = scene.add.graphics();
    g.fillStyle(0x1a1020, 1).fillRect(x - 3, y - 3, w + 6, h + 6).fillStyle(0xc9cde0, 1).fillRect(x - 1, y - 1, w + 2, h + 2).fillStyle(0x151b40, 0.96).fillRect(x, y, w, h);
    c.add(g);
    title = scene.add.text(x + w / 2, y + 14, opt.title || '', f(16, '#ffd23f')).setOrigin(0.5, 0); c.add(title);
    texts = items.map((it, i) => {
      const t = scene.add.text(x + w / 2, y + 52 + i * rowH, '', f(10, '#ffffff')).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
      t.on('pointerover', () => { sel = i; render(); });
      t.on('pointerup', () => { sel = i; Sound.sfx('pickup'); it.act(0); render(); });
      c.add(t); return t;
    });
    render();
  };
  let dead = false;
  const render = () => !dead && texts.forEach((t, i) => t.setText((i === sel ? '> ' : '  ') + items[i].label() + (i === sel ? ' <' : '  ')).setColor(i === sel ? '#ffd23f' : '#ffffff'));
  const move = d => { sel = (sel + d + items.length) % items.length; Sound.sfx('jump'); render(); };
  const act = d => { Sound.sfx(d ? 'jump' : 'pickup'); items[sel].act(d); render(); };
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
    setItems(list, ttl) { items = list; sel = 0; if (ttl !== undefined) opt.title = ttl; build(); },
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
    const main = () => [
      { label: () => 'PLAY', act: () => this.go() },
      { label: () => 'OPTIONS', act: () => this.menu.setItems(opts(), 'OPTIONS') }
    ];
    const opts = () => optionItems().concat([{ label: () => 'BACK', act: () => this.menu.setItems(main(), '') }]);
    this.menu = makeMenu(this, { items: main(), title: '', dim: false, y: Math.round(this.scale.height * 0.46), width: 300, depth: 5,
      onBack: () => this.menu.setItems(main(), '') });
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
