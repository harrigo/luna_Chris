// Gamepad support (Xbox / standard-mapping controllers) using the browser Gamepad API.
// Pad.state  = buttons held right now (left/right/up/down/jump/fire/start/back...)
// Pad.on(fn) = fn(name) is called once when a button is first pressed; returns an "off" function.
// Note: browsers only reveal a controller after you press one of its buttons with the page focused.
const Pad = (() => {
  const BTN = { 0: 'a', 1: 'b', 2: 'x', 3: 'y', 4: 'lb', 5: 'rb', 6: 'lt', 7: 'rt', 8: 'back', 9: 'start', 12: 'up', 13: 'down', 14: 'left', 15: 'right' };
  const DEAD = 0.35;
  const state = { connected: false, id: '', left: false, right: false, up: false, down: false, jump: false, fire: false };
  let prev = {}, subs = [], activeIdx = -1, announced = false;
  const canRumble = p => !!(p && ((p.vibrationActuator && p.vibrationActuator.playEffect) || (p.hapticActuators && p.hapticActuators.length)));
  function toast(text) {
    let el = document.getElementById('padToast');
    if (!el) {
      el = document.createElement('div'); el.id = 'padToast';
      el.style.cssText = "position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:40;font:10px 'Press Start 2P',monospace;color:#9fd8ff;background:rgba(11,16,32,.8);padding:6px 10px;border:2px solid #3a4266;pointer-events:none;transition:opacity .5s;white-space:nowrap";
      document.body.appendChild(el);
    }
    el.textContent = text; el.style.opacity = '1';
    clearTimeout(el._t); el._t = setTimeout(() => { el.style.opacity = '0'; }, 3200);
  }
  function announce(p) {                         // first time a controller is used: say whether rumble works, and give a test buzz
    if (announced) return; announced = true;
    const ok = canRumble(p);
    toast(ok ? 'CONTROLLER READY - RUMBLE ON' : 'CONTROLLER READY - NO RUMBLE IN THIS BROWSER (USE CHROME OR EDGE)');
    if (ok) setTimeout(() => pulse(220, 0.7, 0.9), 50);
  }
  const fire = n => { for (const f of subs.slice()) { try { f(n); } catch (e) { console.error(e); } } };
  function poll() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    // use the pad that is actually being pressed (PCs often list ghost / virtual devices first)
    let gp = null;
    for (const p of pads) if (p && p.connected && p.index === activeIdx) gp = p;
    for (const p of pads) {
      if (!p || !p.connected) continue;
      const busy = p.buttons.some(b => b.pressed) || p.axes.some(a => Math.abs(a) > 0.5);
      if (busy && p.index !== activeIdx) { activeIdx = p.index; gp = p; announce(p); break; }
      if (!gp) gp = p;
    }
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
    state.fire = !!(now.x || now.rt || now.rb);
    state.melee = !!now.b;
    // trigger pressure (analog RT), 1 for the digital fire buttons: light pull = gentler shots
    { const rt = gp && gp.buttons[7] ? gp.buttons[7].value || 0 : 0; state.fireP = (now.x || now.rb) ? 1 : (rt > 0.05 ? Math.min(1, rt) : 0); }                         // B = gun-butt bash (Halo style)
    // right stick = twin-stick aim: push it to aim and fire that way while the left stick moves
    const rx = gp ? (gp.axes[2] || 0) : 0, ry = gp ? (gp.axes[3] || 0) : 0, rm = Math.hypot(rx, ry);
    state.aimOn = rm > 0.45; state.aimX = rx; state.aimY = ry;
    state.held = now;
    requestAnimationFrame(poll);
  }
  requestAnimationFrame(poll);
  window.addEventListener('gamepadconnected', () => { if (typeof Sound !== 'undefined') Sound.init(); });
  // Rumble (Xbox / most controllers in Chrome & Edge): same patterns as navigator.vibrate - a number of ms,
  // or [on, off, on, ...]. Longer pulses rumble harder.
  function pad() {
    const ps = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of ps) if (p && p.connected && p.index === activeIdx && canRumble(p)) return p;
    for (const p of ps) if (p && p.connected && canRumble(p)) return p;
    return null;
  }
  function pulse(ms, strong, weak) {
    if (typeof Settings !== 'undefined' && !Settings.rumble) return;
    const gp = pad(); if (!gp) return;
    ms = Math.max(90, ms);                                     // very short pulses are hard to feel on Xbox pads
    const act = gp.vibrationActuator;
    try {
      if (act && act.playEffect) {
        const types = act.effects || [];
        const type = types.includes ? (types.includes('dual-rumble') || !types.length ? 'dual-rumble' : types[0]) : 'dual-rumble';
        act.playEffect(type, { startDelay: 0, duration: ms, strongMagnitude: strong, weakMagnitude: weak }).catch(() => {});
      } else if (gp.hapticActuators && gp.hapticActuators[0] && gp.hapticActuators[0].pulse) {
        gp.hapticActuators[0].pulse(Math.max(strong, weak), ms);   // older Firefox-style API
      }
    } catch (e) { /* not supported */ }
  }
  function rumble(p) {
    const seq = Array.isArray(p) ? p : [p];
    let t = 0;
    seq.forEach((ms, i) => {
      if (i % 2 === 0 && ms > 0) {
        const strong = Math.min(1, 0.45 + ms / 120), weak = Math.min(1, 0.65 + ms / 150);
        if (t === 0) pulse(ms, strong, weak); else setTimeout(() => pulse(ms, strong, weak), t);
      }
      t += ms;
    });
  }
  return { state, rumble, pulse, on(fn) { subs.push(fn); return () => { subs = subs.filter(f => f !== fn); }; } };
})();
