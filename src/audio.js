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
  const MIN_GAP = { shoot: 0.07, hit: 0.07, kill: 0.05, cube: 0.05, flap: 0.2 };

  // ------------------------------------------------------------ setup
  function init() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try { ctx = new AC(); } catch (e) { return false; }
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

  function arp(notes, step, o) {
    const t = ctx.currentTime;
    notes.forEach((f, i) => tone(Object.assign({ f, dur: step * 1.6, t: t + i * step }, o)));
  }

  // ------------------------------------------------------------ sound effects
  const SFX = {
    shoot:  () => tone({ type: 'pulse', duty: 0.25, f: 900, f2: 420, dur: 0.05, vol: 0.06 }),
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
    if (kind === 'k') tone({ type: 'sine', f: 150, f2: 45, dur: 0.13, vol: 0.5 * v, t, bus });
    else if (kind === 's') { noise({ ft: 'highpass', f1: 1500, dur: 0.11, vol: 0.26 * v, t, bus }); tone({ type: 'triangle', f: 220, f2: 120, dur: 0.06, vol: 0.12 * v, t, bus }); }
    else if (kind === 'h') noise({ ft: 'highpass', f1: 7000, dur: 0.035, vol: 0.11 * v, t, bus });
  }

  function playStep(c) {
    const t = c.next;
    for (const ch of c.tr.chans) {
      const evs = ch.by[c.step % ch.steps];
      if (!evs) continue;
      for (const e of evs) {
        if (ch.drums) { drum(e.d, t, c.bus, ch.vol || 1); continue; }
        tone({
          type: ch.w, duty: ch.duty, f: 440 * Math.pow(2, (e.note - 69) / 12),
          dur: Math.max(0.05, e.len * c.dur * (ch.gate || 0.9)), vol: ch.vol, t, bus: c.bus, sustain: !ch.pluck
        });
      }
    }
  }

  function tick() {
    if (!ctx || !cur || ctx.state !== 'running') return;
    if (cur.next < ctx.currentTime - 0.1) cur.next = ctx.currentTime + 0.05;   // woke up late: don't burst
    const horizon = ctx.currentTime + 0.3;
    while (cur && cur.next < horizon) {
      playStep(cur);
      cur.step++;
      cur.next += cur.dur;
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
    cur = { name, tr, bus, then, step: 0, next: ctx.currentTime + 0.08, dur: 60 / tr.bpm / 4 };
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
    init, sfx, jet, music,
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
    _track: () => (cur ? cur.name : null)
  };
})();
