// (v3.99) GRAPHICS TWEAKS: a slider panel for tuning the whole picture by eye, live, while the game runs.
//   - brightness / contrast / saturation / hue: a CSS filter on the game canvas (the phone's compositor does it, so it's free)
//   - warmth, vignette, scanlines: see-through layers over the canvas
//   - mood darkness, light size, light strength: fed into the moody light map (pixellook.js)
// Everything is saved on the device. The CODE line at the bottom is the whole setup in one string: send that back and
// it becomes the new default (DEF below). The panel is a tuning tool for now; it gets cut back to a few options later.
const Tweak = (() => {
  const DEF = { bri: 100, con: 100, sat: 100, hue: 0, warm: 0, vig: 0, scan: 0, mood: 100, light: 100, glow: 100 };
  const ROWS = [
    ['bri', 'BRIGHT', 50, 150, 'B'], ['con', 'CONTRAST', 50, 160, 'C'], ['sat', 'COLOUR', 0, 200, 'S'], ['hue', 'HUE', -40, 40, 'H'],
    ['warm', 'WARMTH', -60, 60, 'W'], ['vig', 'VIGNETTE', 0, 100, 'V'], ['scan', 'SCANLINE', 0, 100, 'X'],
    ['mood', 'DARKNESS', 0, 170, 'M'], ['light', 'LIGHT SIZE', 50, 220, 'L'], ['glow', 'LIGHT GLOW', 40, 160, 'G']
  ];
  const PRESETS = { VIVID: { con: 112, sat: 135, mood: 85, glow: 115 }, MOODY: { bri: 95, con: 118, sat: 90, vig: 45, mood: 135, light: 85 }, SOFT: { con: 92, sat: 85, warm: 18, mood: 70 }, RETRO: { con: 110, sat: 115, scan: 40, vig: 30 } };
  const v = Object.assign({}, DEF);
  try { Object.assign(v, JSON.parse(localStorage.getItem('lc_tweak') || '{}')); } catch (e) { /* defaults */ }
  let panel = null, pill = null, warmEl = null, vigEl = null, scanEl = null, inputs = {}, outs = {}, codeEl = null;
  const save = () => { try { localStorage.setItem('lc_tweak', JSON.stringify(v)); } catch (e) { /* ignore */ } };
  const code = () => ROWS.map(r => r[4] + v[r[0]]).join(' ');
  const layer = z => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;pointer-events:none;z-index:' + z + ';display:none'; document.body.appendChild(d); return d; };
  function apply() {
    const cv = document.querySelector('#game canvas');
    if (cv) {
      const f = [];
      if (v.bri !== 100) f.push('brightness(' + v.bri + '%)'); if (v.con !== 100) f.push('contrast(' + v.con + '%)');
      if (v.sat !== 100) f.push('saturate(' + v.sat + '%)'); if (v.hue) f.push('hue-rotate(' + v.hue + 'deg)');
      cv.style.filter = f.join(' ');
    }
    if (v.warm || warmEl) { warmEl = warmEl || layer(20); warmEl.style.display = v.warm ? 'block' : 'none'; warmEl.style.background = v.warm > 0 ? '#ff9a3a' : '#3a8aff'; warmEl.style.mixBlendMode = 'soft-light'; warmEl.style.opacity = Math.abs(v.warm) / 100; }
    if (v.vig || vigEl) { vigEl = vigEl || layer(21); vigEl.style.display = v.vig ? 'block' : 'none'; vigEl.style.background = 'radial-gradient(ellipse at center, rgba(8,4,16,0) 45%, rgba(8,4,16,' + (v.vig / 100 * 0.9).toFixed(2) + ') 100%)'; }
    if (v.scan || scanEl) { scanEl = scanEl || layer(22); scanEl.style.display = v.scan ? 'block' : 'none'; scanEl.style.background = 'repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,' + (v.scan / 100 * 0.5).toFixed(2) + ') 2px, rgba(0,0,0,' + (v.scan / 100 * 0.5).toFixed(2) + ') 3px)'; }
    for (const r of ROWS) { if (inputs[r[0]]) inputs[r[0]].value = v[r[0]]; if (outs[r[0]]) outs[r[0]].textContent = v[r[0]]; }
    if (codeEl) codeEl.textContent = code();
  }
  const set = (k, x) => { v[k] = x; save(); apply(); };
  // the moody light map asks for these every frame
  const amb = c => {                                   // ambient colour: 0 = no darkening at all, 100 = as designed, more = darker
    const m = v.mood / 100; if (m === 1) return c;
    const ch = s => Math.max(0, Math.min(255, Math.round(255 - (255 - ((c >> s) & 255)) * m)));
    return (ch(16) << 16) | (ch(8) << 8) | ch(0);
  };
  function btn(txt, fn) { const b = document.createElement('button'); b.textContent = txt; b.style.cssText = 'font:inherit;color:#1a1020;background:#ffd23f;border:2px solid #1a1020;border-radius:4px;padding:6px 6px;margin:2px;cursor:pointer;touch-action:manipulation'; b.addEventListener('click', e => { e.stopPropagation(); fn(); }); return b; }
  function build() {
    panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;right:6px;top:6px;width:264px;max-height:calc(100% - 12px);overflow-y:auto;z-index:40;background:rgba(18,13,36,0.88);border:2px solid #ffd23f;border-radius:6px;padding:7px 8px;color:#fff;font:8px "Press Start 2P",monospace;line-height:1.5;box-sizing:border-box;touch-action:pan-y;user-select:none;-webkit-user-select:none';
    for (const ev of ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup', 'keydown', 'wheel']) panel.addEventListener(ev, e => e.stopPropagation());
    const head = document.createElement('div'); head.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;color:#ffd23f';
    head.appendChild(document.createTextNode('GRAPHICS TWEAKS'));
    const hb = document.createElement('span'); hb.appendChild(btn('HIDE', () => show(false, true))); hb.appendChild(btn('X', () => show(false))); head.appendChild(hb); panel.appendChild(head);
    for (const [k, name, lo, hi] of ROWS) {                           // one line each: name, -, slider, +, value
      const row = document.createElement('div'); row.style.cssText = 'display:flex;align-items:center;height:25px';
      const lab = document.createElement('span'); lab.style.cssText = 'width:74px;flex:none;font-size:7px'; lab.textContent = name;
      const o = document.createElement('span'); o.style.cssText = 'width:26px;flex:none;text-align:right;color:#ffd23f'; outs[k] = o;
      const inp = document.createElement('input'); inp.type = 'range'; inp.min = lo; inp.max = hi; inp.step = 1; inp.style.cssText = 'flex:1;min-width:0;height:22px;margin:0 2px;accent-color:#ffd23f';
      inp.addEventListener('input', () => set(k, +inp.value)); inputs[k] = inp;
      const m = btn('-', () => set(k, Math.max(lo, v[k] - 1))), pl = btn('+', () => set(k, Math.min(hi, v[k] + 1))); m.style.padding = pl.style.padding = '4px 6px'; m.style.margin = pl.style.margin = '0';
      row.appendChild(lab); row.appendChild(m); row.appendChild(inp); row.appendChild(pl); row.appendChild(o); panel.appendChild(row);
    }
    const pr = document.createElement('div'); pr.style.cssText = 'margin-top:7px'; 
    for (const n of Object.keys(PRESETS)) pr.appendChild(btn(n, () => { Object.assign(v, DEF, PRESETS[n]); save(); apply(); }));
    pr.appendChild(btn('RESET', () => { Object.assign(v, DEF); save(); apply(); })); panel.appendChild(pr);
    const cd = document.createElement('div'); cd.style.cssText = 'margin-top:4px;color:#9fa6c2'; cd.appendChild(document.createTextNode('CODE TO SEND BACK:'));
    codeEl = document.createElement('div'); codeEl.style.cssText = 'color:#fff;margin:4px 0;word-spacing:2px;user-select:text;-webkit-user-select:text'; cd.appendChild(codeEl);
    const cp = btn('COPY CODE', () => { try { navigator.clipboard.writeText(code()); cp.textContent = 'COPIED!'; } catch (e) { cp.textContent = 'READ IT ABOVE'; } setTimeout(() => { cp.textContent = 'COPY CODE'; }, 1500); });
    cd.appendChild(cp); panel.appendChild(cd);
    const note = document.createElement('div'); note.style.cssText = 'margin-top:6px;color:#9fa6c2'; note.textContent = 'DARKNESS AND LIGHT NEED A LEVEL, UNPAUSED.'; panel.appendChild(note);
    document.body.appendChild(panel);
    pill = btn('TWEAKS', () => show(true)); pill.style.cssText += ';position:fixed;right:6px;top:6px;z-index:40;font:8px "Press Start 2P",monospace;opacity:0.85;display:none';
    for (const ev of ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup']) pill.addEventListener(ev, e => e.stopPropagation());
    document.body.appendChild(pill);
  }
  // show(true): open the panel. show(false, true): fold it down to a small TWEAKS button. show(false): put it away.
  function show(on, keepPill) {
    if (!panel) build();
    panel.style.display = on ? 'block' : 'none'; pill.style.display = !on && keepPill ? 'block' : 'none';
    apply();
  }
  const boot = () => { apply(); if (/[?&]tweak\b/.test(location.search)) show(true); };
  if (typeof window !== 'undefined') { let n = 0; const iv = setInterval(() => { if (document.querySelector('#game canvas') || ++n > 100) { clearInterval(iv); boot(); } }, 200); }
  return { v, DEF, apply, set, show, amb, code, open: () => show(true), isOpen: () => !!panel && panel.style.display !== 'none' };
})();
