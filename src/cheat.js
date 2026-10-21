// Cheat mode. Turn it on by typing "onlimey" on a keyboard (any screen) or shaking the phone three times quickly.
// While it's on: H, or a single shake, gives a heart. The setting is remembered on this device; type the code again to turn it off.
const Cheat = (() => {
  let on = false;
  try { on = localStorage.getItem('lc_cheat') === '1'; } catch (e) { /* storage blocked */ }
  const subs = [];
  const emit = (type) => { for (const f of subs.slice()) { try { f(type); } catch (e) { console.error(e); } } };
  function toast(text) {
    let el = document.getElementById('cheatToast');
    if (!el) {
      el = document.createElement('div'); el.id = 'cheatToast';
      el.style.cssText = "position:fixed;left:50%;top:38%;transform:translate(-50%,-50%);z-index:40;font:16px 'Press Start 2P',monospace;color:#ff4d8d;text-shadow:3px 3px 0 #1a1020,-2px -2px 0 #1a1020,2px -2px 0 #1a1020,-2px 2px 0 #1a1020;pointer-events:none;transition:opacity .4s;opacity:0;white-space:nowrap";
      document.body.appendChild(el);
    }
    el.textContent = text; el.style.opacity = '1';
    clearTimeout(el._t); el._t = setTimeout(() => { el.style.opacity = '0'; }, 1400);
  }
  function set(v) {
    on = v;
    try { localStorage.setItem('lc_cheat', v ? '1' : '0'); } catch (e) { /* ignore */ }
    toast(v ? 'CHEAT MODE!' : 'CHEAT MODE OFF');
    if (typeof Sound !== 'undefined') { Sound.init(); Sound.sfx(v ? 'power' : 'zing'); }
    try { if (navigator.vibrate) navigator.vibrate(v ? [40, 60, 40, 60, 120] : 60); } catch (e) { /* ignore */ }
    emit('mode');
  }
  // keyboard: the secret word, and H for a heart
  let buf = '';
  window.addEventListener('keydown', e => {
    const k = (e.key || '').toLowerCase();
    if (k.length !== 1) return;
    buf = (buf + k).slice(-7);
    if (buf === 'onlimey') { buf = ''; set(!on); return; }
    if (k === 'h' && on) emit('heart');
  });
  // phone shakes: three quick shakes turn it on; while on, each shake is a heart
  let shakes = [], lastShake = 0;
  function onMotion(e) {
    const a = e.acceleration && e.acceleration.x !== null ? e.acceleration : null;
    let mag;
    if (a) mag = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
    else { const g = e.accelerationIncludingGravity; if (!g) return; mag = Math.abs(Math.hypot(g.x || 0, g.y || 0, g.z || 0) - 9.81); }
    if (mag < 14) return;
    const now = performance.now();
    if (now - lastShake < 280) return;          // one shake = one burst of motion
    lastShake = now;
    if (on) { emit('heart'); return; }
    shakes = shakes.filter(t => now - t < 1600); shakes.push(now);
    if (shakes.length >= 3) { shakes = []; set(true); }
  }
  window.addEventListener('devicemotion', onMotion);
  // iPhone needs permission for motion: ask on the first tap (ignored elsewhere)
  window.addEventListener('pointerup', function ask() {
    window.removeEventListener('pointerup', ask);
    try { if (typeof DeviceMotionEvent !== 'undefined' && DeviceMotionEvent.requestPermission) DeviceMotionEvent.requestPermission().catch(() => {}); } catch (e) { /* ignore */ }
  });
  return { get on() { return on; }, set, on_(f) { subs.push(f); return () => { const i = subs.indexOf(f); if (i >= 0) subs.splice(i, 1); }; } };
})();
