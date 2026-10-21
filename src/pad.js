// Gamepad support (Xbox / standard-mapping controllers) using the browser Gamepad API.
// Pad.state  = buttons held right now (left/right/up/down/jump/fire/start/back...)
// Pad.on(fn) = fn(name) is called once when a button is first pressed; returns an "off" function.
// Note: browsers only reveal a controller after you press one of its buttons with the page focused.
const Pad = (() => {
  const BTN = { 0: 'a', 1: 'b', 2: 'x', 3: 'y', 4: 'lb', 5: 'rb', 6: 'lt', 7: 'rt', 8: 'back', 9: 'start', 12: 'up', 13: 'down', 14: 'left', 15: 'right' };
  const DEAD = 0.35;
  const state = { connected: false, id: '', left: false, right: false, up: false, down: false, jump: false, fire: false };
  let prev = {}, subs = [];
  const fire = n => { for (const f of subs.slice()) { try { f(n); } catch (e) { console.error(e); } } };
  function poll() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    let gp = null;
    for (const p of pads) if (p && p.connected) { gp = p; break; }
    const now = {};
    if (gp) {
      gp.buttons.forEach((b, i) => { if (BTN[i] && (b.pressed || b.value > 0.5)) now[BTN[i]] = true; });
      const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
      if (ax < -DEAD) now.left = true; if (ax > DEAD) now.right = true;
      if (ay < -DEAD) now.up = true; if (ay > DEAD) now.down = true;
    }
    for (const k in now) if (!prev[k]) fire(k);
    prev = now;
    state.connected = !!gp; state.id = gp ? gp.id : '';
    state.left = !!now.left; state.right = !!now.right; state.up = !!now.up; state.down = !!now.down;
    state.jump = !!(now.a || now.lb);
    state.fire = !!(now.x || now.b || now.rt || now.rb);
    state.held = now;
    requestAnimationFrame(poll);
  }
  requestAnimationFrame(poll);
  window.addEventListener('gamepadconnected', () => { if (typeof Sound !== 'undefined') Sound.init(); });
  // Rumble (Xbox / most controllers in Chrome & Edge): same patterns as navigator.vibrate - a number of ms,
  // or [on, off, on, ...]. Longer pulses rumble harder.
  function pad() { const ps = navigator.getGamepads ? navigator.getGamepads() : []; for (const p of ps) if (p && p.connected) return p; return null; }
  function pulse(ms, strong, weak) {
    const gp = pad(), act = gp && gp.vibrationActuator;
    if (!act || !act.playEffect) return;
    act.playEffect(act.type === 'vibration' ? 'vibration' : 'dual-rumble', { startDelay: 0, duration: ms, strongMagnitude: strong, weakMagnitude: weak }).catch(() => {});
  }
  function rumble(p) {
    const seq = Array.isArray(p) ? p : [p];
    let t = 0;
    seq.forEach((ms, i) => {
      if (i % 2 === 0 && ms > 0) {
        const strong = Math.min(1, 0.2 + ms / 160), weak = Math.min(1, 0.45 + ms / 200);
        if (t === 0) pulse(ms, strong, weak); else setTimeout(() => pulse(ms, strong, weak), t);
      }
      t += ms;
    });
  }
  return { state, rumble, pulse, on(fn) { subs.push(fn); return () => { subs = subs.filter(f => f !== fn); }; } };
})();
