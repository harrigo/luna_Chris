// ================================================================= TIPSY (v3.121)
// A pint of moon ale from Clank at the Moon Bar. Each one: 30 seconds of Chris being a bit wobbly. Stacks up to four.
//   - the screen: the edges go blurry (a see-through layer over the page with a backdrop blur, masked so the middle
//     stays sharp) and the whole picture sways gently. Pure CSS, so it costs the game nothing and works in any scene.
//   - Chris: Tipsy.steer() bends his walking into a stagger (used at camp and in the bar). He wanders a bit even
//     when you stand still.
const Tipsy = (() => {
  const PER = 30000, MAX = 4;
  let end = 0, pints = 0, el = null, raf = 0;
  const now = () => Date.now();
  const left = () => Math.max(0, end - now());
  // how drunk, 0..1: grows with pints, eases off in the last ten seconds
  const level = () => { const l = left(); if (!l) return 0; return Math.min(1, 0.45 + 0.18 * (pints - 1)) * Math.min(1, l / 10000); };
  function frame() {
    const L = level(), cv = document.querySelector('#game canvas');
    if (!L) { if (el) el.style.display = 'none'; if (cv) cv.style.transform = ''; pints = 0; raf = 0; return; }
    const t = now() / 1000;
    if (!el) { el = document.createElement('div'); el.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;pointer-events:none;z-index:19'; document.body.appendChild(el); }
    const b = (2 + 5 * L) * (0.85 + 0.15 * Math.sin(t * 1.7)), inner = Math.round(48 - 22 * L);
    const mask = 'radial-gradient(ellipse at center, transparent ' + inner + '%, #000 ' + (inner + 26) + '%)';
    el.style.display = 'block'; el.style.backdropFilter = el.style.webkitBackdropFilter = 'blur(' + b.toFixed(1) + 'px) saturate(1.25)';
    el.style.maskImage = el.style.webkitMaskImage = mask;
    el.style.background = 'radial-gradient(ellipse at center, rgba(255,190,90,0) ' + inner + '%, rgba(255,170,60,' + (0.1 * L).toFixed(2) + ') 100%)';
    if (cv) cv.style.transform = 'rotate(' + (Math.sin(t * 0.9) * 0.9 * L).toFixed(2) + 'deg) translateX(' + (Math.sin(t * 0.63) * 6 * L).toFixed(1) + 'px) scale(' + (1 + 0.015 * L).toFixed(3) + ')';
    raf = requestAnimationFrame(frame);
  }
  return {
    PER, MAX, left, level,
    pints: () => (left() ? pints : 0),
    drink() { if (!left()) pints = 0; pints = Math.min(MAX, pints + 1); end = Math.min(now() + PER * MAX, Math.max(end, now()) + PER); if (!raf) raf = requestAnimationFrame(frame); return pints; },
    // a stagger on top of whatever left/right you're pressing (-1..1). Standing still, he still drifts about.
    steer(ax, ms) { const L = level(); if (!L) return ax; const w = Math.sin(ms / 700) * 0.6 + Math.sin(ms / 233 + 1) * 0.25; return Math.max(-1, Math.min(1, ax * (1 - 0.25 * L) + w * L * (ax ? 0.7 : 0.55))); },
    sway(ms) { return Math.sin(ms / 520) * 0.12 * level(); }
  };
})();
