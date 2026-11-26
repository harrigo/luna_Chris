// ================================================================= TIPSY (v3.121)
// A pint of moon ale from Clank at the Moon Bar. Each one: 30 seconds of Chris being a bit wobbly. Stacks up to four.
//   - the screen: the edges go blurry (a see-through layer over the page with a backdrop blur, masked so the middle
//     stays sharp) and the whole picture sways gently. Pure CSS, so it costs the game nothing and works in any scene.
//   - Chris: Tipsy.steer() bends his walking into a stagger (used at camp and in the bar). He wanders a bit even
//     when you stand still.
const Tipsy = (() => {
  const PER = 30000, MAX = 4;
  let end = 0, pints = 0, el = null, raf = 0, held = false, heldL = 0;
  const now = () => Date.now();
  const left = () => Math.max(0, end - now());
  // how drunk, 0..1: grows with pints, eases off in the last ten seconds
  const level = () => { if (held) return heldL; const l = left(); if (!l) return 0; return Math.min(1, 0.45 + 0.18 * (pints - 1)) * Math.min(1, l / 10000); };
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
    if (cv) cv.style.transform = 'rotate(' + (Math.sin(t * 0.7) * 0.22 * L).toFixed(2) + 'deg) scale(' + (1 + 0.008 * L).toFixed(3) + ')';   // (v3.123) a much gentler sway
    raf = requestAnimationFrame(frame);
  }
  return {
    PER, MAX, left, level,
    // (v3.122) blast off tipsy and it lasts the whole level (LEGLESS LUNATIC): hold() freezes it, release() lets it fade
    held: () => held,
    hold() { const L = level(); if (!L) return false; heldL = Math.max(0.6, L); held = true; if (!raf) raf = requestAnimationFrame(frame); return true; },
    release() { if (!held) return; held = false; end = now() + 10000; pints = Math.max(1, pints); if (!raf) raf = requestAnimationFrame(frame); },
    pints: () => (left() ? pints : 0),
    drink() { if (!left()) pints = 0; pints = Math.min(MAX, pints + 1); end = Math.min(now() + PER * MAX, Math.max(end, now()) + PER); if (!raf) raf = requestAnimationFrame(frame); return pints; },
    // a stagger on top of whatever left/right you're pressing (-1..1). Standing still, he still drifts about.
    // (v3.123) the stagger is in his legs, not the stick: walking goes in a stop-start rhythm (lurch, lurch, wobble...)
    // and only a slight drift. Standing still he barely moves.
    steer(ax, ms) { const L = level(); if (!L) return ax; if (!ax) return Math.sin(ms / 1300) * 0.08 * L;
      const beat = (ms / 520) % 1, go = beat < 0.55 ? 1 : beat < 0.7 ? 1 - (beat - 0.55) / 0.15 * (0.85 * L) : 1 - 0.85 * L;
      return Math.max(-1, Math.min(1, ax * go + Math.sin(ms / 900) * 0.12 * L)); },
    // a lean and sway on his feet, in time with the lurches
    sway(ms) { const L = level(); if (!L) return 0; const beat = (ms / 520) % 1; return (Math.sin(ms / 640) * 0.07 + Math.sin(beat * Math.PI * 2) * 0.04) * L; }
  };
})();
