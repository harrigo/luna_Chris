// ================================================================= THE TRAINING GROUND (v3.16)
// Clank's obstacle course on a quiet little cheese moon: eleven short lessons, one move at a time, on target rats that
// don't fight back and a pea cannon that can't hurt you. RUN + JUMP, JETPACK, DODGE, SHOOT, BASH, BOWLING, JUGGLE, UPPERCUT, SPIKE, PARRY,
// then STYLE (mix it all up to rank B). A coach box at the top says what to do and ticks each one off.
// Where it lives:  the campaign offers it before Level 1 the first time (SKIP TRAINING any time) -  the main menu has
// TRAINING - and Moon Camp has a TRAINING DUMMY station. It goes back to wherever it came from.
const TRAIN_STEPS = [
  { title: 'RUN AND JUMP', text: 'Run left and right, then JUMP.', kb: 'A / D to run, SPACE to jump.', touch: 'Left thumb to run, push up to jump.', check: (T, P) => T.moved > 240 && T.jumped, prog: T => Math.min(100, Math.round(T.moved / 2.4)) + '%' },
  { title: 'JETPACK', text: 'In the air, HOLD jump to fire the jetpack. Fly up high!', check: (T, P) => P.h > 170 },
  { title: 'DODGE', text: 'Double-tap LEFT or RIGHT to DODGE: a quick dash nothing can hit. Dash through a pea at the last moment for a CLOSE CALL!', kb: 'Tap A-A or D-D (or the arrows) quickly.', touch: 'Flick the left thumb twice, quickly.', turret: true, check: T => T.ev.dash >= 2 && T.ev.close >= 1, prog: T => 'DODGES ' + Math.min(2, T.ev.dash || 0) + '/2  CLOSE CALL ' + Math.min(1, T.ev.close || 0) + '/1' },
  { title: 'SHOOT', text: 'Aim and fire at the target rats. Get all three.', kb: 'Mouse to aim, click to fire.', touch: 'Right thumb aims and fires.', dummies: [170, 240, 310], check: T => T.ev.kill >= 3, prog: T => (T.ev.kill || 0) + '/3' },
  { title: 'BASH', text: 'Get close and BASH. Small rats go FLYING.', kb: 'F, B or right-click to bash.', touch: 'The BASH button.', dummies: [80], keep: 1, check: T => T.ev.launch >= 1 },
  { title: 'BOWLING', text: 'Bash a rat INTO the others. Whatever a flying rat hits gets hurt - and launched too!', dummies: [70, 150, 190], keep: 3, check: T => T.ev.smash >= 1 },
  { title: 'JUGGLE', text: 'Bash a rat into the air, then SHOOT it while it flies to keep it up.', dummies: [80, 220], keep: 2, check: T => T.ev.juggle >= 1 },
  { title: 'UPPERCUT', text: 'Standing still (or jumping UP), hold DOWN and BASH: an UPPERCUT boshes a rat straight up into the air. Then shoot it to juggle!', kb: 'Hold S / DOWN, then F / B / right-click.', touch: 'Pull the left thumb down, then BASH.', dummies: [70, 200], keep: 2, check: T => T.ev.uppercut >= 1 },
  { title: 'SPIKE', text: 'Now on the way DOWN: jump, and as you FALL onto a rat hold DOWN and BASH to SPIKE it into the ground - and POGO off it.', kb: 'SPACE to jump, then hold S / DOWN and bash.', touch: 'Jump, pull the left thumb down, BASH.', dummies: [110, 250], keep: 2, check: T => T.ev.spike >= 1 },
  { title: 'PARRY', text: 'The pea cannon fires at you. BASH just as a pea reaches you to PARRY it back. Do it twice!', turret: true, check: T => T.ev.parry >= 2, prog: T => (T.ev.parry || 0) + '/2' },
  { title: 'STYLE', text: 'Mix it ALL up - shots, bashes, smashes, juggles, uppercuts, spikes, parries. Repeats earn less. Reach rank B!', turret: true, dummies: [120, 200, 280], keep: 3, check: (T, P, sc) => sc.styleRank >= 2, prog: (T, sc) => 'RANK ' + STYLE_RANKS[sc.styleRank].r }
];

function trainDef() {
  return Object.assign({}, LEVELS[1], { name: 'Training Ground', short: 'TRAINING GROUND', training: true, geysers: null, lava: 0, warp: null, waves: [], tip: '', music: 'title',
    ledges: [{ theta: 1.4, half: 0.09, h: 110 }, { theta: -1.3, half: 0.09, h: 140 }], props: [{ tex: 'p_tuft1', n: 8, sc: [0.8, 1.3], fg: true }] });
}

const TrainingMixin = {
  trainInit(data) {
    this.training = Object.assign({ from: 'menu' }, data.training); this.levelId = 1; this.def = trainDef(); R = this.def.radius;
    this.waves = []; this.autostart = true;
  },
  trainStart() {
    this.hideOverlay(); this.state = 'play'; Sound.init(); Sound.music('title');
    makeFolkTextures(this);
    const T = this.training;
    Object.assign(T, { i: -1, ev: {}, moved: 0, jumped: false, lastTh: this.pl.theta, doneT: 0, turretT: 1.5, dummies: [], spawnQ: 0, ended: false });
    T.home = this.pl.theta;
    // the pea cannon (scenery: it isn't an enemy you can hurt)
    const tk = this.textures.exists('lturret') ? 'lturret' : 'drone';
    T.cannon = { spr: this.add.image(0, 0, tk).setOrigin(0.5, 1).setDepth(2.4).setVisible(false), theta: wrap(T.home + 330 / R), h: 0, rot: 0 }; T.cannon.spr.bsx = T.cannon.spr.bsy = 1.3; this.actors.push(T.cannon);
    // the coach box
    const W = this.W, f = RUN_UI.f, bw = Math.min(W - 24, 560), bh = 64, bx = (W - bw) / 2, by = 64;
    const c = T.box = this.add.container(0, 0).setDepth(22);
    const g = this.add.graphics(); c.add(g);
    g.fillStyle(0x1a1020, 1).fillRect(bx - 3, by - 3, bw + 6, bh + 6); g.fillStyle(0xc8962a, 1).fillRect(bx - 1, by - 1, bw + 2, bh + 2); g.fillStyle(0x121838, 0.95).fillRect(bx, by, bw, bh);
    g.fillStyle(0xc8641a, 1).fillRect(bx + 6, by + 6, 52, 52); g.fillStyle(0x000000, 0.25).fillRect(bx + 6, by + 38, 52, 20);
    c.add(RUN_UI.fit(this.add.image(bx + 32, by + 32, 'cf_bot0'), 46));
    T.head = this.add.text(bx + 66, by + 6, '', f(9, '#ffd23f', { strokeThickness: 3 })); c.add(T.head);
    T.body = this.add.text(bx + 66, by + 22, '', f(7, '#ffffff', { strokeThickness: 3, wordWrap: { width: bw - 140 }, lineSpacing: 4 })); c.add(T.body);
    T.hint = this.add.text(bx + 66, by + bh - 6, '', f(6, '#9aa4c8', { strokeThickness: 2 })).setOrigin(0, 1); c.add(T.hint);
    T.prog = this.add.text(bx + bw - 10, by + 8, '', f(9, '#7dff8a', { strokeThickness: 3 })).setOrigin(1, 0); c.add(T.prog);
    T.skip = this.add.text(bx + bw - 10, by + bh - 6, 'SKIP TRAINING >>', f(7, '#ff9db8', { strokeThickness: 3 })).setOrigin(1, 1).setInteractive({ useHandCursor: true }); c.add(T.skip);
    T.skip.on('pointerup', () => this.trainExit(true));
    T.bw = bw; T.bx = bx; T.by = by;
    this.trainKey = e => { if (e.key === 'Escape' || e.key === 'Backspace') { e.preventDefault && e.preventDefault(); } };
    chatBar(this, [['bot', 'WELCOME TO THE TRAINING GROUND, CHRIS. I HAVE BUILT TARGET RATS.'], ['bot', 'THEY ARE NOT REAL RATS. PLEASE DO NOT EAT THEM.'], ['chris', 'No promises.']],
      { header: 'TRAINING GROUND', onClose: () => this.trainNext() });
    T.body.setText('...');
  },
  trainNext() {
    const T = this.training; if (T.ended) return;
    T.i++; T.ev = {}; T.doneT = 0; T.moved = 0; T.jumped = false;
    for (const e of T.dummies) if (e.hp > 0) { e.hp = 0; e.quietKill = true; }
    T.dummies = [];
    if (T.i >= TRAIN_STEPS.length) { this.trainDone(); return; }
    const S = TRAIN_STEPS[T.i], P = this.pl, dev = inputDevice();
    T.head.setText('LESSON ' + (T.i + 1) + '/' + TRAIN_STEPS.length + ':  ' + S.title);
    T.full = S.text; T.shown = 0;
    T.hint.setText(dev === 'touch' ? (S.touch || '') : dev === 'pad' ? (S.pad || '') : (S.kb || ''));
    T.cannon.spr.setVisible(!!S.turret);
    if (S.turret) T.cannon.theta = wrap(P.theta + 300 / R);
    for (const d of S.dummies || []) this.trainDummy(wrap(P.theta + (P.facing || 1) * d / R));
    Sound.sfx('blip');
  },
  trainDummy(theta) {
    const e = this.spawnEnemy('mouse'); if (!e) return null;
    e.theta = theta; e.h = 0; e.dummy = true; e.hp = Math.max(e.hp, 2); e.noDrop = true;
    this.burst(theta, 10, 'puff', 6, 0.6);
    this.training.dummies.push(e);
    return e;
  },
  trainEvent(kind) {
    const T = this.training; if (!T || T.i < 0) return;
    T.ev[kind] = (T.ev[kind] || 0) + 1;
  },
  trainingUpdate(dt, inp) {
    const T = this.training; if (!T || T.i < 0 || T.ended) return;
    const P = this.pl, S = TRAIN_STEPS[T.i];
    T.moved += Math.abs(angDiff(P.theta, T.lastTh)) * R; T.lastTh = P.theta;
    if (P.h > 20) T.jumped = true;
    // typewriter
    if (T.shown < T.full.length) { T.shown = Math.min(T.full.length, T.shown + dt * 60); T.body.setText(T.full.slice(0, Math.floor(T.shown))); }
    // keep the target rats topped up
    T.dummies = T.dummies.filter(e => e.hp > 0 && this.enemies.includes(e));
    if (S.keep && T.dummies.length < S.keep && !T.doneT) { T.spawnQ += dt; if (T.spawnQ > 1.1) { T.spawnQ = 0; this.trainDummy(wrap(P.theta + (P.facing || 1) * rnd(90, 260) / R)); } }
    // the pea cannon: slow peas, aimed at you
    if (S.turret && !T.doneT) {
      T.turretT -= dt;
      if (T.turretT <= 0) {
        T.turretT = 1.7;
        const C = T.cannon, ex = angDiff(P.theta, C.theta) * R, ey = P.h + 34 - 40, L = Math.hypot(ex, ey) || 1;
        const b = this.addEBullet('pepper', C.theta, 40, ex / L * 200, ey / L * 200, 7, 5); b.spr.setTint(0xff8ad8);
        Sound.sfx('zing'); this.muzzleFlash && this.muzzleFlash(C.theta, 40);
      }
    }
    if (S.prog) T.prog.setText(S.prog(T, this)); else T.prog.setText('');
    if (!T.doneT && S.check(T, P, this)) {
      T.doneT = 0.001; T.prog.setText('DONE!'); Sound.sfx('power'); this.cameras.main.flash(100, 160, 255, 160);
      this.popup(P.theta, P.h + 90, ['NICE!', 'GOT IT!', 'LOVELY!', 'TEXTBOOK!'][T.i % 4], '#7dff8a', true);
    }
    if (T.doneT) { T.doneT += dt; if (T.doneT > 1.3) this.trainNext(); }
  },
  trainDone() {
    const T = this.training; T.ended = true; T.cannon.spr.setVisible(false);
    T.head.setText('TRAINING COMPLETE!'); T.body.setText('That\'s every move. Go and show the rats.'); T.prog.setText(TRAIN_STEPS.length + '/' + TRAIN_STEPS.length);
    try { localStorage.setItem('lc_trained', '1'); } catch (e) { /* ignore */ }
    Sound.sfx('reveal');
    chatBar(this, [['bot', 'TRAINING COMPLETE. YOU ARE NOW 14 PERCENT LESS LIKELY TO BE GRATED.'], ['chris', 'Only fourteen?'], ['bot', 'I AM AN OPTIMIST.']],
      { header: 'TRAINING GROUND', onClose: () => this.trainExit(false) });
  },
  trainExit(skipped) {
    const T = this.training; if (!T || T.leaving) return; T.leaving = true;
    try { localStorage.setItem('lc_trained', '1'); } catch (e) { /* ignore */ }
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(330, () => {
      if (T.from === 'camp') this.scene.start('level1', { camp: true });
      else if (T.from === 'campaign' && T.next) this.scene.start('level1', T.next);
      else this.scene.start('menu');
    });
  }
};
