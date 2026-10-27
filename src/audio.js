// Luna Chris - chiptune sound. Everything is synthesised with Web Audio, so there are no audio files.
//
//   Sound.sfx('jump')        one-shot effect (see SFX below)
//   Sound.music('level1')    start a looping track (null stops); Sound.jingle('win') plays a one-off
//   Sound.jet(true/false)    jetpack loop
//
// Browsers only allow audio after a tap, so the engine wakes up on the first tap (the "TAP TO PLAY" gate).
// Music is a tiny tracker: each channel is a string of "NOTE:LENGTH" tokens (length in 16th notes, '-' = rest).
// Note names (A4, C#5, Bb3) or raw MIDI numbers both work. Drum channels use k = kick, s = snare, h = hat.

const Sound = (() => {
  let ctx = null, master = null, sfxBus = null, musicBus = null, analyser = null, noiseBuf = null;
  let muted = false;
  try { muted = localStorage.getItem('lc_mute') === '1'; } catch (e) { /* storage blocked */ }
  const last = {};
  const pulses = {};
  let cur = null, timer = null, jetNode = null;
  const MIN_GAP = { shoot: 0.07, macshot: 0.07, hit: 0.07, squish: 0.07, tink: 0.07, kill: 0.05, splat: 0.05, scrap: 0.05, whoo: 0.08, cube: 0.05, flap: 0.2 };

  // ------------------------------------------------------------ setup
  function init() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try { ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { try { ctx = new AC(); } catch (e2) { return false; } }   // ask for the shortest output delay
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.knee.value = 20; comp.ratio.value = 6; comp.attack.value = 0.003; comp.release.value = 0.2;
      master = ctx.createGain(); master.gain.value = muted ? 0 : 0.9;
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9;
      musicBus = ctx.createGain(); musicBus.gain.value = 0.5;
      analyser = ctx.createAnalyser(); analyser.fftSize = 512;
      sfxBus.connect(comp); musicBus.connect(comp); comp.connect(master);
      master.connect(analyser); master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      timer = setInterval(tick, 40);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }

  function setMuted(m) {
    muted = m;
    try { localStorage.setItem('lc_mute', m ? '1' : '0'); } catch (e) { /* ignore */ }
    if (master) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.02);
    if (m) jet(false);
    const b = document.getElementById('mute');
    if (b) b.textContent = m ? '🔇' : '🔊';
  }

  // ------------------------------------------------------------ synth voices
  function pulseWave(duty) {
    const key = duty.toFixed(3);
    if (!pulses[key]) {
      const n = 48, real = new Float32Array(n), imag = new Float32Array(n);
      for (let k = 1; k < n; k++) real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
      pulses[key] = ctx.createPeriodicWave(real, imag);
    }
    return pulses[key];
  }

  // o: { type:'pulse'|'square'|'triangle'|'sawtooth'|'sine', duty, f, f2, dur, vol, atk, sustain, t, bus }
  function tone(o) {
    const t = o.t != null ? o.t : ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    if (o.type === 'pulse') osc.setPeriodicWave(pulseWave(o.duty || 0.5)); else osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(o.f, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f2), t + o.dur);
    const v = o.vol == null ? 0.2 : o.vol;
    const atk = o.atk || 0.004;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + atk);
    if (o.sustain) {
      g.gain.setValueAtTime(v, t + Math.max(atk, o.dur - 0.03));
      g.gain.linearRampToValueAtTime(0.0001, t + o.dur);
    } else {
      g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    }
    osc.connect(g); g.connect(o.bus || sfxBus);
    osc.start(t); osc.stop(t + o.dur + 0.05);
  }

  // o: { ft:'bandpass'|'highpass'|'lowpass', f1, f2, q, dur, vol, t, bus }
  function noise(o) {
    const t = o.t != null ? o.t : ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = o.ft || 'bandpass'; f.Q.value = o.q || 0.8;
    f.frequency.setValueAtTime(o.f1 || 1500, t);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + o.dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(o.vol == null ? 0.3 : o.vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(f); f.connect(g); g.connect(o.bus || sfxBus);
    src.start(t); src.stop(t + o.dur + 0.05);
  }

  // oscillator with vibrato + low-pass, for the moo and the tractor beam
  function wobble(o) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = o.type;
    osc.frequency.setValueAtTime(o.f, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + o.dur);
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = o.rate; lg.gain.value = o.depth;
    lfo.connect(lg); lg.connect(osc.frequency);
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = o.lp || 4000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(o.vol, t + 0.06);
    g.gain.setValueAtTime(o.vol, t + o.dur - 0.12);
    g.gain.linearRampToValueAtTime(0.0001, t + o.dur);
    osc.connect(filt); filt.connect(g); g.connect(sfxBus);
    osc.start(t); lfo.start(t);
    osc.stop(t + o.dur + 0.05); lfo.stop(t + o.dur + 0.05);
  }

  // ---- CHRIS'S VOICE: a little formant synth. A buzzy glottal source (sawtooth + vibrato) through three resonant
  // band-pass "mouth" filters that glide from vowel to vowel; 'm' is a hummed nasal, 'h'/'f' a puff of breath.
  // A phrase is a list of [sound, seconds, pitch multiplier at its end, loudness]. Chris is a big-voiced chef.
  const VOWEL = { a: [780, 1180, 2500], o: [520, 880, 2400], u: [340, 760, 2300], i: [300, 2250, 3000], e: [480, 1850, 2600], r: [460, 1300, 1700], m: [260, 1100, 2300], w: [320, 700, 2300] };
  function voice(phrase, o) {
    o = o || {};
    const t0 = ctx.currentTime + 0.01, f0 = (o.f0 || 128) * (0.94 + Math.random() * 0.12);
    const src = ctx.createOscillator(); src.type = 'sawtooth';
    const vib = ctx.createOscillator(), vg = ctx.createGain(); vib.frequency.value = 6.5; vg.gain.value = f0 * 0.025; vib.connect(vg); vg.connect(src.frequency);
    const amp = ctx.createGain(); amp.gain.setValueAtTime(0.0001, t0);
    const out = ctx.createGain(); out.gain.value = o.vol || 0.5;
    const F = [0, 1, 2].map(k => { const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = [7, 11, 13][k]; const g = ctx.createGain(); g.gain.value = [1, 0.55, 0.25][k]; amp.connect(f); f.connect(g); g.connect(out); return f; });
    src.connect(amp); out.connect(sfxBus);
    let t = t0, first = true;
    src.frequency.setValueAtTime(f0, t0);
    for (const [ph, d, pm, loud] of phrase) {
      if (ph === 'h' || ph === 'f') { noise({ ft: ph === 'f' ? 'highpass' : 'bandpass', f1: ph === 'f' ? 2600 : 1400, dur: d, vol: 0.16 * (loud || 1), t, q: 0.7 }); amp.gain.setTargetAtTime(0.0001, t, 0.01); t += d; continue; }
      const V = VOWEL[ph] || VOWEL.a, nasal = ph === 'm' || ph === 'w';
      F.forEach((f, k) => { if (first) f.frequency.setValueAtTime(V[k], t); else f.frequency.setTargetAtTime(V[k], t, 0.018); });
      amp.gain.setTargetAtTime((nasal ? 0.35 : 1) * (loud || 1), t, first ? 0.008 : 0.02);
      src.frequency.linearRampToValueAtTime(f0 * (pm || 1), t + d);
      t += d; first = false;
    }
    amp.gain.setTargetAtTime(0.0001, t, 0.035);
    src.start(t0); vib.start(t0); src.stop(t + 0.3); vib.stop(t + 0.3);
  }
  const PHRASES = {
    oof:   [['u', 0.05, 1.05, 0.7], ['o', 0.13, 0.8], ['f', 0.07]],
    ow:    [['a', 0.07, 1.35], ['o', 0.08, 1.25], ['u', 0.12, 0.85, 0.8]],
    ugh:   [['e', 0.05, 1], ['r', 0.16, 0.8, 0.9], ['h', 0.06]],
    oi:    [['o', 0.1, 1.2], ['i', 0.12, 1.45]],
    blimey: [['m', 0.03, 1.1, 0.6], ['i', 0.12, 1.35], ['m', 0.06, 1.2], ['a', 0.09, 1.25], ['i', 0.26, 0.85]],   // "BLIMEY!"
    woohoo:[['w', 0.07, 1], ['u', 0.12, 1.25], ['h', 0.04], ['u', 0.06, 1.5], ['o', 0.28, 1.75]],
    yum:   [['i', 0.04, 1.1, 0.8], ['u', 0.11, 1.2], ['m', 0.16, 1.0]],
    hup:   [['h', 0.03], ['u', 0.08, 1.3]]
  };
  function say(k, o) { if (!ctx || muted || ctx.state !== 'running' || !PHRASES[k]) return; const now = ctx.currentTime; if (last.__voice && now - last.__voice < 0.35 && !(o && o.force)) return; last.__voice = now; voice(PHRASES[k], o); }

  function arp(notes, step, o) {
    const t = ctx.currentTime;
    notes.forEach((f, i) => tone(Object.assign({ f, dur: step * 1.6, t: t + i * step }, o)));
  }

  // ------------------------------------------------------------ sound effects
  const SFX = {
    shoot:  () => tone({ type: 'pulse', duty: 0.25, f: 900, f2: 420, dur: 0.05, vol: 0.06 }),
    // the Mac-Grinder: a mincer crank. A clunk of the ratchet, a gritty grind of the auger, a little macaroni 'pip'
    macshot: () => {
      const t = ctx.currentTime;
      tone({ type: 'square', f: 130 + Math.random() * 20, f2: 70, dur: 0.05, vol: 0.22 });
      noise({ ft: 'bandpass', f1: 900, f2: 500, dur: 0.06, vol: 0.22, q: 2.5 });
      for (let i = 0; i < 3; i++) tone({ type: 'square', f: 210 - i * 25, dur: 0.012, vol: 0.11, t: t + 0.012 + i * 0.016 });
      tone({ type: 'pulse', duty: 0.25, f: 1100, f2: 700, dur: 0.03, vol: 0.06, t: t + 0.03 });
    },
    // Chris getting hurt: abstract chiptune 'owch' yelps (no words). A quick squeak up and a tumble down, three flavours,
    // and a bigger wobbling 'waa-waa' fall for the last heart / losing a life
    ouch1: () => { const t = ctx.currentTime; tone({ type: 'pulse', duty: 0.25, f: 520, f2: 980, dur: 0.05, vol: 0.16 }); tone({ type: 'pulse', duty: 0.25, f: 900, f2: 300, dur: 0.14, vol: 0.16, t: t + 0.05 }); },
    ouch2: () => { const t = ctx.currentTime; tone({ type: 'square', f: 700, f2: 1200, dur: 0.04, vol: 0.12 }); tone({ type: 'square', f: 1100, f2: 500, dur: 0.06, vol: 0.12, t: t + 0.045 }); tone({ type: 'square', f: 600, f2: 260, dur: 0.1, vol: 0.12, t: t + 0.11 }); },
    ouch3: () => { wobble({ type: 'square', f: 880, f2: 330, dur: 0.22, vol: 0.12, rate: 26, depth: 90, lp: 3000 }); },
    ouchBig: () => { const t = ctx.currentTime; [[660, 0], [520, 0.16], [380, 0.32]].forEach(([f, d]) => { tone({ type: 'pulse', duty: 0.25, f, f2: f * 0.8, dur: 0.14, vol: 0.15, t: t + d }); }); wobble({ type: 'square', f: 300, f2: 110, dur: 0.6, vol: 0.1, rate: 9, depth: 25, lp: 1600 }); },
    // cheesy, squishy enemies: a wet splat (hit) and a big plopping SPLAT (kill)
    squish: () => { tone({ type: 'sine', f: 260, f2: 110, dur: 0.08, vol: 0.22 }); noise({ ft: 'lowpass', f1: 900, f2: 200, dur: 0.07, vol: 0.2 }); },
    splat:  () => {
      noise({ ft: 'lowpass', f1: 1600, f2: 120, dur: 0.28, vol: 0.38 });
      wobble({ type: 'sine', f: 340, f2: 70, dur: 0.24, vol: 0.2, rate: 34, depth: 60, lp: 1200 });
      tone({ type: 'sine', f: 520, f2: 900, dur: 0.06, vol: 0.08, t: ctx.currentTime + 0.17 });                   // ...plop
    },
    bigsplat: () => { SFX.splat(); noise({ ft: 'lowpass', f1: 700, f2: 60, dur: 0.6, vol: 0.4 }); wobble({ type: 'sine', f: 160, f2: 45, dur: 0.5, vol: 0.25, rate: 20, depth: 30, lp: 600 }); },
    // metal ones: a tink, and a crunch of scrap with bolts rattling off
    tink:   () => { tone({ type: 'square', f: 1500 + Math.random() * 300, f2: 900, dur: 0.05, vol: 0.1 }); noise({ ft: 'highpass', f1: 5000, dur: 0.03, vol: 0.1 }); },
    scrap:  () => {
      const t = ctx.currentTime;
      noise({ f1: 3200, f2: 500, dur: 0.25, vol: 0.32, q: 1.2 }); tone({ type: 'square', f: 300, f2: 90, dur: 0.18, vol: 0.14 });
      for (let i = 0; i < 4; i++) tone({ type: 'square', f: 1200 + Math.random() * 900, f2: 700, dur: 0.035, vol: 0.06, t: t + 0.08 + i * 0.06 + Math.random() * 0.03 });
    },
    // ghosts: an airy 'whoo' that pops
    whoo:   () => { wobble({ type: 'sine', f: 700, f2: 300, dur: 0.35, vol: 0.12, rate: 9, depth: 50 }); noise({ ft: 'highpass', f1: 1800, f2: 6000, dur: 0.25, vol: 0.12 }); tone({ type: 'sine', f: 900, f2: 1600, dur: 0.05, vol: 0.1, t: ctx.currentTime + 0.3 }); },
    jump:   () => tone({ type: 'pulse', duty: 0.5, f: 260, f2: 640, dur: 0.16, vol: 0.16 }),
    hit:    () => tone({ type: 'square', f: 210, f2: 120, dur: 0.04, vol: 0.07 }),
    kill:   () => { noise({ f1: 3000, f2: 400, dur: 0.22, vol: 0.28 }); tone({ type: 'square', f: 420, f2: 90, dur: 0.2, vol: 0.18 }); },
    hurt:   () => { noise({ f1: 2400, f2: 300, dur: 0.28, vol: 0.38 }); tone({ type: 'sawtooth', f: 320, f2: 80, dur: 0.32, vol: 0.22 }); },
    pickup: () => arp([660, 880, 1320], 0.06, { type: 'square', vol: 0.16 }),
    cube:   () => tone({ type: 'pulse', duty: 0.125, f: 520, f2: 300, dur: 0.09, vol: 0.09 }),
    fan:    () => tone({ type: 'sawtooth', f: 200, f2: 760, dur: 0.3, vol: 0.13 }),
    power:  () => { arp([523, 659, 784, 1047, 1319], 0.055, { type: 'pulse', duty: 0.25, vol: 0.17 }); arp([262, 330, 392], 0.08, { type: 'triangle', vol: 0.2 }); },
    ribbit: () => { wobble({ type: 'square', f: 150, f2: 95, dur: 0.22, vol: 0.14, rate: 28, depth: 40, lp: 900 }); },
    zing:   () => { noise({ ft: 'highpass', f1: 2500, f2: 9000, dur: 0.18, vol: 0.14 }); tone({ type: 'sawtooth', f: 1400, f2: 500, dur: 0.14, vol: 0.07 }); },
    wave:   () => arp([440, 660], 0.08, { type: 'pulse', duty: 0.5, vol: 0.16 }),
    bossIn: () => { tone({ type: 'sawtooth', f: 74, f2: 46, dur: 1.5, vol: 0.4 }); noise({ ft: 'lowpass', f1: 400, f2: 80, dur: 1.5, vol: 0.4 }); },
    boom:   () => {
      noise({ f1: 2500, f2: 120, dur: 1.2, vol: 0.6 }); tone({ type: 'sawtooth', f: 120, f2: 30, dur: 1.0, vol: 0.5 });
      setTimeout(() => { if (ctx && !muted) noise({ f1: 1800, f2: 100, dur: 0.8, vol: 0.4 }); }, 220);
    },
    // cutscene
    flap:    () => tone({ type: 'triangle', f: 300, f2: 480, dur: 0.06, vol: 0.07 }),
    swish:   () => noise({ ft: 'highpass', f1: 1800, f2: 5200, dur: 0.12, vol: 0.18, q: 0.7 }),
    bonk:    () => { tone({ type: 'square', f: 240, f2: 70, dur: 0.14, vol: 0.32 }); noise({ f1: 900, f2: 120, dur: 0.12, vol: 0.4 }); },
    charge:  () => tone({ type: 'pulse', duty: 0.25, f: 300 + (SFX._ch || 0) * 700, f2: 340 + (SFX._ch || 0) * 760, dur: 0.07, vol: 0.07 }),   // pitch rises with the charge
    charged: () => arp([880, 1320, 1760], 0.04, { type: 'pulse', duty: 0.125, vol: 0.09 }),
    squelch: () => { wobble({ type: 'square', f: 110, f2: 60, dur: 0.25, vol: 0.16, rate: 30, depth: 25, lp: 700 }); noise({ ft: 'lowpass', f1: 500, f2: 120, dur: 0.2, vol: 0.2 }); },
    psy:     () => wobble({ type: 'sine', f: 600, f2: 1400, dur: 0.45, vol: 0.12, rate: 18, depth: 120 }),
    cackle:  () => { for (let i = 0; i < 6; i++) tone({ type: 'square', f: 520 - i * 40 + (i % 2) * 90, f2: 380 - i * 30, dur: 0.09, vol: 0.12, t: ctx.currentTime + i * 0.13 }); },   // "NYEH-HEH-HEH-HEH"
    growl:   () => { wobble({ type: 'sawtooth', f: 90, f2: 70, dur: 0.45, vol: 0.2, rate: 25, depth: 18, lp: 700 }); },
    beat:    () => { tone({ type: 'sine', f: 70, f2: 40, dur: 0.12, vol: 0.4 }); tone({ type: 'sine', f: 62, f2: 38, dur: 0.12, vol: 0.3, t: ctx.currentTime + 0.18 }); },   // low-health heartbeat
    combo:   () => arp([660, 990], 0.04, { type: 'pulse', duty: 0.25, vol: 0.08 }),
    blip:    () => tone({ type: 'pulse', duty: 0.5, f: 740 + Math.random() * 120, dur: 0.025, vol: 0.035 }),     // caption typewriter
    alarm:   () => { for (let i = 0; i < 3; i++) tone({ type: 'square', f: 880, f2: 620, dur: 0.18, vol: 0.09, t: ctx.currentTime + i * 0.24 }); },
    shine:   () => arp([1320, 1760, 2640], 0.05, { type: 'pulse', duty: 0.125, vol: 0.08 }),
    ufoFly:  () => tone({ type: 'sawtooth', f: 1100, f2: 180, dur: 0.85, vol: 0.1 }),
    crash:   () => { noise({ f1: 3200, f2: 90, dur: 0.9, vol: 0.6 }); tone({ type: 'sawtooth', f: 95, f2: 32, dur: 0.7, vol: 0.5 }); },
    squeak:  () => arp([1500, 2200], 0.05, { type: 'square', vol: 0.1 }),
    beam:    () => wobble({ type: 'sine', f: 330, f2: 520, dur: 1.3, vol: 0.16, rate: 9, depth: 70 }),
    moo:     () => wobble({ type: 'sawtooth', f: 150, f2: 98, dur: 1.0, vol: 0.22, rate: 6, depth: 7, lp: 900 }),
    whoosh:  () => noise({ f1: 400, f2: 4000, dur: 0.7, vol: 0.28, q: 0.5 }),
    sigh:    () => noise({ f1: 1400, f2: 260, dur: 0.9, vol: 0.14, q: 0.6 }),
    clang:   () => { tone({ type: 'square', f: 820, f2: 300, dur: 0.1, vol: 0.14 }); noise({ ft: 'highpass', f1: 4000, dur: 0.05, vol: 0.12 }); },
    stretch: () => tone({ type: 'sine', f: 180, f2: 900, dur: 0.32, vol: 0.2 }),
    grind:   () => { for (let i = 0; i < 7; i++) tone({ type: 'square', f: 140 + (i % 2) * 20, dur: 0.035, vol: 0.13, t: ctx.currentTime + i * 0.13 }); },
    hiss:    () => noise({ ft: 'highpass', f1: 3000, dur: 0.7, vol: 0.26, q: 0.4 }),
    clunk:   () => { tone({ type: 'triangle', f: 95, f2: 45, dur: 0.28, vol: 0.5 }); noise({ f1: 600, dur: 0.08, vol: 0.3 }); },
    reveal:  () => {
      arp([392, 494, 587, 784, 988], 0.09, { type: 'square', vol: 0.14 });
      [523, 659, 784].forEach(f => tone({ type: 'pulse', duty: 0.25, f, dur: 0.9, vol: 0.09, t: ctx.currentTime + 0.45, sustain: true }));
    }
  };

  function sfx(name, v) {
    if (v !== undefined) SFX._ch = v;
    if (!ctx || muted || ctx.state !== 'running') return;
    const now = ctx.currentTime, gap = MIN_GAP[name] || 0;
    if (gap && last[name] && now - last[name] < gap) return;
    last[name] = now;
    const fn = SFX[name];
    if (fn) fn();
  }

  function jet(on) {
    if (!ctx) return;
    const t = ctx.currentTime;
    if (on && !jetNode && !muted) {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuf; src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = 650; f.Q.value = 0.6;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.13, t + 0.05);
      src.connect(f); f.connect(g); g.connect(sfxBus); src.start(t);
      jetNode = { src, g };
    } else if (!on && jetNode) {
      jetNode.g.gain.cancelScheduledValues(t);
      jetNode.g.gain.setValueAtTime(Math.max(0.0001, jetNode.g.gain.value), t);
      jetNode.g.gain.linearRampToValueAtTime(0.0001, t + 0.08);
      jetNode.src.stop(t + 0.1);
      jetNode = null;
    }
  }

  // ------------------------------------------------------------ music (tiny tracker)
  const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  function midi(tok) {
    if (/^\d+$/.test(tok)) return +tok;
    const m = /^([A-G][#b]?)(-?\d)$/.exec(tok);
    return 12 * (+m[2] + 1) + NOTE[m[1]];
  }
  function parseNotes(str) {
    const events = [];
    let step = 0;
    for (const tok of str.trim().split(/\s+/)) {
      const [n, l] = tok.split(':');
      const len = +(l || 1);
      if (n !== '-') events.push({ step, note: midi(n), len });
      step += len;
    }
    return { events, steps: step };
  }
  function parseDrums(str) {
    const events = [];
    for (let i = 0; i < str.length; i++) if (str[i] !== '.') events.push({ step: i, d: str[i] });
    return { events, steps: str.length };
  }
  function build(def) {
    const chans = def.ch.map(c => {
      const p = c.drums ? parseDrums(c.p) : parseNotes(c.p);
      const by = {};
      p.events.forEach(e => { (by[e.step] = by[e.step] || []).push(e); });
      return Object.assign({}, c, { steps: p.steps, by });
    });
    return { bpm: def.bpm, loop: def.loop !== false, chans, total: Math.max(...chans.map(c => c.steps)) };
  }

  const J = (...a) => a.join(' ');
  const bassBar = r => `${r}:2 ${r}:2 ${r + 12}:2 ${r}:2 ${r}:2 ${r}:2 ${r + 12}:2 ${r}:2`;
  const arpBar = c => (`${c[0]}:1 ${c[1]}:1 ${c[2]}:1 ${c[1]}:1 `).repeat(4).trim();
  const Am = [57, 60, 64], F = [53, 57, 60], G = [55, 59, 62], E = [52, 56, 59], Em = [52, 55, 59], C = [48, 52, 55], D = [50, 54, 57];

  const TRACKS = {
    // Level 1: driving A-minor chase
    level1: build({ bpm: 142, ch: [
      { p: J('A4:2 C5:2 E5:2 A5:2 G5:4 E5:4', 'D5:2 E5:2 G5:2 E5:2 C5:4 -:4', 'C5:2 F5:2 A5:2 F5:2 E5:4 C5:4', 'B4:2 D5:2 G5:2 D5:2 B4:4 -:2 D5:2',
              'E5:2 E5:2 A5:2 B5:2 C6:4 A5:4', 'G5:2 A5:2 G5:2 E5:2 D5:4 C5:4', 'A5:2 G5:2 F5:2 E5:2 F5:4 A5:4', 'G#5:2 B5:2 E5:2 G#5:2 B5:4 -:4'),
        w: 'pulse', duty: 0.5, vol: 0.15, gate: 0.85 },
      { p: J(arpBar(Am), arpBar(Am), arpBar(F), arpBar(G), arpBar(Am), arpBar(Am), arpBar(F), arpBar(E)), w: 'pulse', duty: 0.25, vol: 0.07, pluck: true, gate: 1 },
      { p: J(bassBar(45), bassBar(45), bassBar(41), bassBar(43), bassBar(45), bassBar(45), bassBar(41), bassBar(40)), w: 'triangle', vol: 0.32, gate: 0.8 },
      { drums: true, p: 'k.h.s.h.kkh.s.h.', vol: 1 }
    ] }),

    // Boss: faster, nastier E minor
    boss: build({ bpm: 164, ch: [
      { p: J('E5:1 E5:1 -:1 G5:1 E5:2 B4:2 E5:1 E5:1 -:1 G5:1 F#5:2 D5:2', 'E5:1 E5:1 -:1 G5:1 B5:2 A5:2 G5:2 F#5:2 E5:2 -:2',
              'C5:1 C5:1 -:1 E5:1 C5:2 G4:2 C5:1 C5:1 -:1 E5:1 D5:2 B4:2', 'D5:1 D5:1 -:1 F#5:1 A5:2 F#5:2 D6:4 -:2 A5:2'),
        w: 'pulse', duty: 0.25, vol: 0.17, gate: 0.8 },
      { p: J(arpBar(Em), arpBar(Em), arpBar(C), arpBar(D)), w: 'pulse', duty: 0.125, vol: 0.07, pluck: true, gate: 1 },
      { p: J(bassBar(40), bassBar(40), bassBar(36), bassBar(38)), w: 'triangle', vol: 0.34, gate: 0.8 },
      { drums: true, p: 'k.hks.hkk.hks.hs', vol: 1 }
    ] }),

    // Stinger at the start of every level: the rats snatch Bessie. Rising chromatic dread, a moo-wobble, a stomp.
    stinger: build({ bpm: 152, loop: false, ch: [
      { p: 'A3:1 A#3:1 B3:1 C4:1 C#4:1 D4:1 D#4:1 E4:1 F4:1 F#4:1 G4:1 G#4:1 A4:4 E5:3 D#5:1 E5:3 D#5:1 E5:2 B4:2 A4:8',
        w: 'pulse', duty: 0.25, vol: 0.2, gate: 0.85 },
      { p: 'A4:1 A#4:1 B4:1 C5:1 C#5:1 D5:1 D#5:1 E5:1 F5:1 F#5:1 G5:1 G#5:1 A5:4 -:20', w: 'pulse', duty: 0.125, vol: 0.07, gate: 0.8 },
      { p: 'A2:2 A2:2 A2:2 A2:2 A2:2 A2:2 A2:2 A2:2 F2:4 E2:4 A2:12', w: 'triangle', vol: 0.36, gate: 0.85 },
      { drums: true, p: 'k.k.s.k.k.k.s.sk' + 'k.k.s.k.k.k.s.sk' + 'k...', vol: 0.9 }
    ] }),

    // Level 2: Gorgonzola Gulch, a woozy minor-key swamp
    level2: build({ bpm: 120, ch: [
      { p: J('D5:2 -:1 C#5:1 D5:2 F5:2 A5:4 G5:2 F5:2', 'E5:2 -:1 D#5:1 E5:2 G5:2 A#5:4 A5:2 G5:2', 'F5:2 -:1 E5:1 F5:2 A5:2 C6:4 A#5:2 A5:2', 'G5:2 F5:2 E5:2 D5:2 C#5:4 D5:4'),
        w: 'pulse', duty: 0.125, vol: 0.16, gate: 0.85 },
      { p: J(arpBar([50, 53, 57]), arpBar([52, 55, 59]), arpBar([53, 57, 60]), arpBar([55, 58, 62])), w: 'pulse', duty: 0.5, vol: 0.06, pluck: true, gate: 1 },
      { p: J(bassBar(38), bassBar(40), bassBar(41), bassBar(43)), w: 'triangle', vol: 0.34, gate: 0.8 },
      { drums: true, p: 'k...s...k.k.s...', vol: 0.85 }
    ] }),

    // Level 3: The Great Grater, clanking industrial E minor
    level3: build({ bpm: 134, ch: [
      { p: J('E5:1 -:1 E5:1 -:1 G5:2 E5:2 D5:1 -:1 D5:1 -:1 B4:2 -:2', 'E5:1 -:1 E5:1 -:1 G5:2 E5:2 F#5:1 -:1 F#5:1 -:1 A5:2 -:2',
              'C5:1 -:1 C5:1 -:1 E5:2 C5:2 B4:1 -:1 B4:1 -:1 G4:2 -:2', 'D5:1 -:1 D5:1 -:1 F#5:2 D5:2 B4:4 -:2 A4:2'),
        w: 'pulse', duty: 0.25, vol: 0.17, gate: 0.6 },
      { p: J(arpBar([52, 55, 59]), arpBar([52, 55, 59]), arpBar([48, 52, 55]), arpBar([50, 54, 57])), w: 'pulse', duty: 0.125, vol: 0.06, pluck: true, gate: 1 },
      { p: J(bassBar(40), bassBar(40), bassBar(36), bassBar(38)), w: 'triangle', vol: 0.34, gate: 0.75 },
      { drums: true, p: 'k.h.s.h.k.h.s.hh', vol: 1 }
    ] }),

    // Title screen: heroic fanfare in C major
    title: build({ bpm: 126, ch: [
      { p: J('C5:2 -:1 C5:1 G4:2 C5:2 E5:4 -:2 D5:2', 'E5:2 -:1 E5:1 D5:2 C5:2 G5:6 -:2',
              'A4:2 -:1 A4:1 C5:2 F5:2 A5:4 G5:2 F5:2', 'E5:2 D5:2 C5:2 D5:2 G4:6 G4:2 C5:8 -:8'),
        w: 'pulse', duty: 0.25, vol: 0.18, gate: 0.9 },
      { p: J(arpBar([48, 52, 55]), arpBar([48, 52, 55]), arpBar([53, 57, 60]), arpBar([55, 59, 62])), w: 'pulse', duty: 0.125, vol: 0.06, pluck: true, gate: 1 },
      { p: J(bassBar(36), bassBar(36), bassBar(41), bassBar(43)), w: 'triangle', vol: 0.32, gate: 0.8 },
      { drums: true, p: 'k...s...k.k.s...', vol: 0.9 }
    ] }),

    // Cutscene: jaunty space-ranch hoedown
    ranch: build({ bpm: 108, ch: [
      { p: J('G4:2 B4:2 D5:2 B4:2 G5:4 D5:2 B4:2', 'E5:2 G5:2 C6:2 G5:2 E5:4 C5:4', 'D5:2 F#5:2 A5:2 F#5:2 D5:4 A4:4', 'B4:2 D5:2 G5:2 D5:2 G4:8'),
        w: 'pulse', duty: 0.25, vol: 0.2, pluck: true, gate: 1 },
      { p: J(...[43, 48, 50, 43].map(r => `${r}:2 -:2 ${r + 7}:2 -:2 ${r}:2 -:2 ${r + 7}:2 -:2`)), w: 'triangle', vol: 0.3, gate: 0.7 },
      { drums: true, p: '..h...h...h...h.', vol: 0.5 }
    ] }),

    // Cutscene: something is coming
    tense: build({ bpm: 84, ch: [
      { p: J('-:8 E5:1 F5:1 E5:1 F5:1 E5:4', '-:8 D#5:1 E5:1 D#5:1 E5:1 D5:4'), w: 'pulse', duty: 0.5, vol: 0.11, gate: 0.9 },
      { p: J('33:8 -:4 34:4', '33:8 -:4 32:4'), w: 'triangle', vol: 0.36, gate: 0.95 },
      { drums: true, p: 'k.......k.......k.......k.s.....', vol: 0.8 }
    ] }),

    // Cutscene: creeping through the cabin
    sneak: build({ bpm: 110, ch: [
      { p: J('A2:1 -:1 A2:1 -:1 C3:1 -:1 A2:1 -:1 E3:1 -:1 A2:1 -:1 G2:1 -:1 A2:1 -:1'), w: 'triangle', vol: 0.3, gate: 0.6 },
      { p: J('-:4 E5:2 -:2 C5:2 -:2 A4:4', '-:4 D5:2 -:2 B4:2 -:2 G4:4'), w: 'pulse', duty: 0.125, vol: 0.1, pluck: true, gate: 1 },
      { drums: true, p: 'h.h.h.h.h.h.h.h.', vol: 0.35 }
    ] }),

    // Level 4: Mount Mozzarella - a fiery Italian tarantella in D harmonic minor
    level4: build({ bpm: 150, ch: [
      { p: J('D5:2 E5:2 F5:2 D5:2 A5:4 F5:4', 'G5:2 F5:2 E5:2 D5:2 C#5:4 A4:4', 'D5:2 F5:2 A5:2 D6:2 C6:2 A#5:2 A5:4', 'G5:2 A5:2 F5:2 E5:2 D5:8'),
        w: 'pulse', duty: 0.25, vol: 0.16, gate: 0.8 },
      { p: J(arpBar([50, 53, 57]), arpBar([45, 49, 52]), arpBar([46, 50, 53]), arpBar([50, 53, 57])), w: 'pulse', duty: 0.125, vol: 0.06, pluck: true, gate: 1 },
      { p: J(bassBar(38), bassBar(33), bassBar(34), bassBar(38)), w: 'triangle', vol: 0.34, gate: 0.75 },
      { drums: true, p: 'k.hsk.hsk.hsk.hs', vol: 0.95 }
    ] }),

    // Level 5: The Brie-muda Triangle - slow, spooky and echoey
    level5: build({ bpm: 100, ch: [
      { p: J('B4:4 C5:2 B4:2 G4:4 F#4:4', 'E4:4 G4:2 B4:2 D#5:8', 'C5:4 D5:2 C5:2 A4:4 G4:4', 'F#4:2 A4:2 C5:2 D#5:2 E5:8'), w: 'triangle', vol: 0.22, gate: 0.95 },
      { p: J('-:1 B4:4 C5:2 B4:2 G4:4 F#4:3', 'E4:4 G4:2 B4:2 D#5:8', 'C5:4 D5:2 C5:2 A4:4 G4:4', 'F#4:2 A4:2 C5:2 D#5:2 E5:8'), w: 'pulse', duty: 0.125, vol: 0.045, gate: 0.9 },   // a ghostly echo, one step behind
      { p: J(arpBar([52, 55, 59]), arpBar([47, 51, 54]), arpBar([48, 52, 55]), arpBar([47, 51, 54])), w: 'pulse', duty: 0.5, vol: 0.04, pluck: true, gate: 1 },
      { p: J(...[40, 35, 36, 35].map(r => `${r}:8 ${r + 12}:8`)), w: 'triangle', vol: 0.3, gate: 0.9 },
      { drums: true, p: 'k.......s.......', vol: 0.6 }
    ] }),

    // Level 6: Cheddar Gorge - breakneck punk, the Pepper Jack is right behind you
    level6: build({ bpm: 172, ch: [
      { p: J('G5:2 G5:1 G5:1 F#5:2 D5:2 E5:2 D5:2 B4:4', 'C5:2 C5:1 C5:1 D5:2 E5:2 D5:4 -:4', 'G5:2 G5:1 G5:1 A5:2 B5:2 C6:2 B5:2 A5:4', 'G5:2 F#5:2 E5:2 F#5:2 G5:8'),
        w: 'pulse', duty: 0.5, vol: 0.14, gate: 0.75 },
      { p: J(arpBar([55, 59, 62]), arpBar([48, 52, 55]), arpBar([55, 59, 62]), arpBar([50, 54, 57])), w: 'pulse', duty: 0.25, vol: 0.06, pluck: true, gate: 1 },
      { p: J(bassBar(43), bassBar(36), bassBar(43), bassBar(38)), w: 'triangle', vol: 0.34, gate: 0.7 },
      { drums: true, p: 'k.hsk.hskkhsk.hs', vol: 1 }
    ] }),

    // Level 7: The Astro-Rat Armada - a pompous rat military march
    level7: build({ bpm: 128, ch: [
      { p: J('C5:3 C5:1 C5:2 Eb5:2 G5:4 F5:2 Eb5:2', 'D5:3 D5:1 D5:2 F5:2 Ab5:4 G5:4', 'Eb5:3 Eb5:1 Eb5:2 G5:2 C6:4 Bb5:2 Ab5:2', 'G5:2 F5:2 Eb5:2 D5:2 C5:8'),
        w: 'pulse', duty: 0.25, vol: 0.17, gate: 0.85 },
      { p: J(arpBar([48, 51, 55]), arpBar([43, 47, 50]), arpBar([44, 48, 51]), arpBar([43, 47, 50])), w: 'pulse', duty: 0.125, vol: 0.06, pluck: true, gate: 1 },
      { p: J(bassBar(36), bassBar(31), bassBar(32), bassBar(31)), w: 'triangle', vol: 0.34, gate: 0.8 },
      { drums: true, p: 's.s.k...s.ssk...', vol: 0.9 }
    ] }),

    // Level 8: Lactose Labyrinth - creeping through the holes in the Swiss
    level8: build({ bpm: 118, ch: [
      { p: J('F5:2 -:2 Ab5:2 -:2 G5:2 F5:2 E5:4', 'C5:2 -:2 Db5:2 -:2 C5:2 Bb4:2 C5:4', 'F5:2 -:2 Ab5:2 -:2 Bb5:2 C6:2 Db6:4', 'C6:2 Bb5:2 Ab5:2 G5:2 F5:8'),
        w: 'pulse', duty: 0.125, vol: 0.16, gate: 0.7 },
      { p: J(arpBar([53, 56, 60]), arpBar([49, 53, 56]), arpBar([46, 49, 53]), arpBar([48, 52, 55])), w: 'pulse', duty: 0.5, vol: 0.06, pluck: true, gate: 1 },
      { p: J(bassBar(41), bassBar(37), bassBar(34), bassBar(36)), w: 'triangle', vol: 0.34, gate: 0.7 },
      { drums: true, p: 'k..hk..hs..hk.hh', vol: 0.85 }
    ] }),

    // Level 9: Parmesan Prime - the big one, eight bars of A-minor heroics
    level9: build({ bpm: 158, ch: [
      { p: J('A4:2 E5:2 A5:2 G5:2 F5:2 E5:2 D5:2 E5:2', 'F5:4 E5:2 D5:2 C5:4 B4:4', 'C5:2 G5:2 C6:2 B5:2 A5:2 G5:2 F5:2 G5:2', 'A5:4 G#5:2 F5:2 E5:8',
              'A5:2 A5:2 C6:2 A5:2 G5:2 G5:2 B5:2 G5:2', 'F5:2 F5:2 A5:2 F5:2 E5:4 D5:4', 'D5:2 F5:2 A5:2 D6:2 C6:2 B5:2 A5:2 G#5:2', 'A5:8 E5:4 A4:4'),
        w: 'pulse', duty: 0.25, vol: 0.16, gate: 0.85 },
      { p: J(arpBar(Am), arpBar(F), arpBar(C), arpBar(E), arpBar(Am), arpBar(F), arpBar([50, 53, 57]), arpBar(E)), w: 'pulse', duty: 0.125, vol: 0.06, pluck: true, gate: 1 },
      { p: J(bassBar(45), bassBar(41), bassBar(36), bassBar(40), bassBar(45), bassBar(41), bassBar(38), bassBar(40)), w: 'triangle', vol: 0.34, gate: 0.8 },
      { drums: true, p: 'k.hskkhsk.hskkss', vol: 1 }
    ] }),

    // Secret level 5.5: The Forbidden Fondue Fountain - a bouncy fondue party
    level55: build({ bpm: 140, ch: [
      { p: J('F5:2 A5:2 C6:2 A5:1 C6:1 D6:4 C6:4', 'Bb5:2 A5:2 G5:2 F5:2 G5:4 -:4', 'E5:2 G5:2 Bb5:2 G5:1 Bb5:1 C6:4 Bb5:4', 'A5:2 G5:2 F5:2 E5:2 F5:8'),
        w: 'pulse', duty: 0.5, vol: 0.15, pluck: true, gate: 1 },
      { p: J(arpBar([53, 57, 60]), arpBar([46, 50, 53]), arpBar([48, 52, 55]), arpBar([53, 57, 60])), w: 'pulse', duty: 0.25, vol: 0.06, pluck: true, gate: 1 },
      { p: J(...[41, 34, 36, 41].map(r => `${r}:3 ${r + 7}:1 ${r + 12}:2 ${r + 7}:2 ${r}:3 ${r + 7}:1 ${r + 12}:2 ${r + 7}:2`)), w: 'triangle', vol: 0.32, gate: 0.7 },
      { drums: true, p: 'k.hsh.k.hkh.s.hh', vol: 0.85 }
    ] }),

    // The final boss: the Grand Rat-King. Fastest thing in the game.
    final: build({ bpm: 176, ch: [
      { p: J('D5:1 D5:1 D6:2 A5:2 F5:2 D5:1 D5:1 C6:2 A5:2 F5:2', 'A#4:1 A#4:1 A#5:2 F5:2 D5:2 C5:1 C5:1 C6:2 G5:2 E5:2',
              'D5:1 D5:1 D6:2 A5:2 F5:2 D5:1 D5:1 C6:2 A5:2 F5:2', 'D5:2 F5:2 A5:2 C#6:2 D6:8'),
        w: 'pulse', duty: 0.25, vol: 0.17, gate: 0.8 },
      { p: J(arpBar([50, 53, 57]), arpBar([46, 50, 53]), arpBar([50, 53, 57]), arpBar([45, 49, 52])), w: 'pulse', duty: 0.125, vol: 0.07, pluck: true, gate: 1 },
      { p: J(bassBar(38), bassBar(34), bassBar(38), bassBar(33)), w: 'triangle', vol: 0.36, gate: 0.8 },
      { drums: true, p: 'kkhskkhskkhskshs', vol: 1 }
    ] }),

    win: build({ bpm: 132, loop: false, ch: [
      { p: 'C5:2 E5:2 G5:2 C6:6 -:2 G5:2 C6:2 E6:10', w: 'pulse', duty: 0.5, vol: 0.18, gate: 0.9 },
      { p: 'C3:8 G2:8 C3:12', w: 'triangle', vol: 0.34, gate: 0.9 }
    ] }),

    lose: build({ bpm: 88, loop: false, ch: [
      { p: 'E5:4 D#5:4 D5:4 C#5:8', w: 'pulse', duty: 0.5, vol: 0.16, gate: 0.95 },
      { p: 'A2:20', w: 'triangle', vol: 0.3, gate: 1 }
    ] })
  };

  function drum(kind, t, bus, v) {
    if (kind === 'c') { noise({ ft: 'highpass', f1: 5000, dur: 0.9, vol: 0.16 * v, t, bus }); tone({ type: 'sine', f: 150, f2: 45, dur: 0.16, vol: 0.55 * v, t, bus }); }   // crash + kick: the new wave's downbeat
    else if (kind === 't' || kind === 'm' || kind === 'l') tone({ type: 'triangle', f: { t: 260, m: 190, l: 130 }[kind], f2: { t: 150, m: 110, l: 70 }[kind], dur: 0.14, vol: 0.3 * v, t, bus });   // toms, high to low
    else if (kind === 'k') tone({ type: 'sine', f: 150, f2: 45, dur: 0.13, vol: 0.5 * v, t, bus });
    else if (kind === 's') { noise({ ft: 'highpass', f1: 1500, dur: 0.11, vol: 0.26 * v, t, bus }); tone({ type: 'triangle', f: 220, f2: 120, dur: 0.06, vol: 0.12 * v, t, bus }); }
    else if (kind === 'h') noise({ ft: 'highpass', f1: 7000, dur: 0.035, vol: 0.11 * v, t, bus });
  }

  // ---- wave progression for the level tracks. Three tiers (the game picks one per wave; the boss keeps its own tune):
  //   0, the first wave: lead, bass and drums only
  //   1, the middle waves: + the arpeggio and running 16th hi-hats
  //   2, the last wave before the boss: + a sparkly octave-up double on the lead and four-on-the-floor kicks
  // Same key and tempo throughout (layers, not a new song): the big change is saved for the boss's own tune.
  // When a wave is cleared the game asks for a FILL: the tune carries on to the bar line that leaves room for one,
  // the melody drops out under a snare roll and tom run, then a crash lands on the downbeat, the song restarts
  // from the top at the next intensity, and the game launches the next wave on that beat.
  let intensity = 0;
  const isLevelTrack = n => /^level|^final$/.test(n || '');
    const FILL_BAR = 'k.k.s.k.s.sks.ss';                                    // the run-in, if the fill gets a whole bar
  function fillDrum(left, at) {                                           // `left` steps before the downbeat
    if (left <= 4) return ['l', 'l', 'm', 't'][left - 1];               // toms tumbling down into the crash
    if (left <= 8) return 's';                                             // snare roll
    return FILL_BAR[at % 16] === '.' ? null : FILL_BAR[at % 16];
  }
  function playStep(c) {
    const t = c.next, lvl = c.level ? intensity : 2, F = c.fill;
    const inFill = F && c.step >= F.from && c.step < F.to, left = inFill ? F.to - c.step : 0;
    if (inFill) {
      const d = fillDrum(left, c.step);
      if (d) drum(d, t, c.bus, 0.7 + 0.5 * (1 - left / (F.to - F.from)));   // the roll swells into the downbeat
      if (left <= 4) noise({ ft: 'bandpass', f1: 600 + (5 - left) * 900, dur: c.dur * 1.1, vol: 0.05 + (5 - left) * 0.02, t, bus: c.bus });   // a rising whoosh
    }
    if (c.crash) { drum('c', t, c.bus, 1); c.crash = false; }
    const hats = c.level && lvl >= 1 && !inFill, floor = c.level && lvl >= 2 && !inFill;
    for (const ch of c.tr.chans) {
      const st = c.step % ch.steps, evs = ch.by[st];
      if (ch.drums) {
        if (inFill) continue;
        const has = d => evs && evs.some(e => e.d === d);
        if (evs) for (const e of evs) drum(e.d, t, c.bus, ch.vol || 1);
        if (floor && st % 4 === 0 && !has('k')) drum('k', t, c.bus, 0.85);           // four on the floor
        if (hats && !has('h') && !has('s')) drum('h', t, c.bus, st % 2 ? 0.6 : 0.85); // running 16ths
        continue;
      }
      if (!evs) continue;
      if (c.level && ch.pluck && lvl < 1) continue;                       // the arpeggio comes in on wave 2
      if (inFill && ch.w !== 'triangle') continue;                        // only the bass rides through the fill
      for (const e of evs) {
        const f = 440 * Math.pow(2, (e.note - 69) / 12), dur = Math.max(0.05, e.len * c.dur * (ch.gate || 0.9));
        tone({ type: ch.w, duty: ch.duty, f, dur, vol: ch.vol, t, bus: c.bus, sustain: !ch.pluck });
        if (!c.level || ch.pluck || ch.w === 'triangle' || ch !== c.lead) continue;
        if (lvl >= 2) tone({ type: 'pulse', duty: 0.125, f: f * 2, dur: Math.min(dur, c.dur * 1.5), vol: ch.vol * 0.3, t, bus: c.bus });   // sparkle on top
      }
    }
  }

  // Ask for a fill into the next wave. Calls `go` on the new wave's downbeat; false if there's no level tune to do it.
  // `end`: this is the run-in to the boss, so the downbeat is a lone crash and then silence until the boss tune.
  function fill(go, next, end) {
    if (!ctx || ctx.state !== 'running' || !cur || !cur.level || muted) return false;
    if (cur.fill && !cur.fill.done) { cur.fill.go = go; cur.fill.next = next; cur.fill.end = end; return true; }
    const s = cur.step;
    let to = Math.ceil(s / 16) * 16;
    if (to - s < 12) to += 16;                                             // room for at least most of a bar
    cur.fill = { from: Math.max(s, to - 16), to, go, next, end, done: false };
    return true;
  }
  function setIntensity(n) {
    n = Math.max(0, Math.min(2, n | 0));
    if (n === intensity) return;
    intensity = n;
  }

  function tick() {
    if (!ctx || !cur || ctx.state !== 'running') return;
    if (cur.next < ctx.currentTime - 0.1) cur.next = ctx.currentTime + 0.05;   // woke up late: don't burst
    const horizon = ctx.currentTime + 0.3;
    while (cur && cur.next < horizon) {
      playStep(cur);
      cur.step++;
      cur.next += cur.dur;
      const F = cur.fill;
      if (F && !F.done && cur.step >= F.to) {                              // the downbeat: back to the top, one notch up
        F.done = true; cur.fill = null;
        const go = F.go, wait = Math.max(0, (cur.next - ctx.currentTime) * 1000);
        if (go) setTimeout(go, wait);
        if (F.end) {                                                       // into the boss: one crash, let it ring, then hush
          const old = cur; cur = null;
          drum('c', old.next, old.bus, 1);
          old.bus.gain.setValueAtTime(1, old.next + 0.5); old.bus.gain.linearRampToValueAtTime(0.0001, old.next + 1.1);
          setTimeout(() => { try { old.bus.disconnect(); } catch (e) { /* gone */ } }, wait + 1600);
          break;
        }
        setIntensity(F.next); cur.step = 0; cur.crash = true;
      }
      if (!cur.tr.loop && cur.step >= cur.tr.total) {
        const old = cur;
        cur = null;
        setTimeout(() => { try { old.bus.disconnect(); } catch (e) { /* gone */ } }, 4000);
        if (old.then) music(old.then);
      }
    }
  }

  function stopCur(fade) {
    if (!cur) return;
    const old = cur;
    cur = null;
    const t = ctx.currentTime;
    old.bus.gain.cancelScheduledValues(t);
    old.bus.gain.setValueAtTime(old.bus.gain.value, t);
    old.bus.gain.linearRampToValueAtTime(0.0001, t + fade);
    setTimeout(() => { try { old.bus.disconnect(); } catch (e) { /* gone */ } }, (fade + 0.5) * 1000);
  }

  function music(name, then) {
    if (!ctx) return;
    if (cur && cur.name === name) return;
    stopCur(0.15);
    if (!name || !TRACKS[name]) return;
    const tr = TRACKS[name];
    const bus = ctx.createGain();
    bus.gain.value = 1;
    bus.connect(musicBus);
    const level = isLevelTrack(name);
    if (level) intensity = 0;
    cur = { name, tr, bus, then, step: 0, next: ctx.currentTime + 0.08, dur: 60 / tr.bpm / 4, level, lead: tr.chans.find(c => !c.drums && !c.pluck && c.w !== 'triangle') };
  }

  // ------------------------------------------------------------ browser plumbing
  ['pointerup', 'touchend', 'click', 'keydown'].forEach(ev => window.addEventListener(ev, () => init(), { passive: true }));
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();     // silence when the app is in the background
  });
  const btn = document.getElementById('mute');
  if (btn) {
    btn.textContent = muted ? '🔇' : '🔊';
    btn.addEventListener('click', e => { e.stopPropagation(); init(); setMuted(!muted); });
  }

  return {
    init, sfx, say, jet, music, fill, intensity: setIntensity,
    pause(on) { if (musicBus) musicBus.gain.setTargetAtTime(on ? 0.12 : 0.5, ctx.currentTime, 0.05); if (on) jet(false); },
    jingle: music,
    isMuted: () => muted,
    setMuted,
    // test helpers
    _rms: () => {
      if (!analyser) return -1;
      const a = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(a);
      let s = 0;
      for (let i = 0; i < a.length; i++) s += a[i] * a[i];
      return Math.sqrt(s / a.length);
    },
    _state: () => (ctx ? ctx.state : 'none'),
    _track: () => (cur ? cur.name : null),
    _music: () => (cur ? { step: cur.step, lvl: intensity, fill: cur.fill ? { from: cur.fill.from, to: cur.fill.to } : null, dur: cur.dur } : null)
  };
})();
