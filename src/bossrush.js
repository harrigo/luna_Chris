// ================================================================= BOSS RUSH (v3.36)
// Every boss, back to back, against the clock. One life; hearts refill between bosses; a fixed kit so it's a fair race.
// Opens once you've won a run (the BOSS GATE at Moon Camp, round past the training dummy). Your best time and the
// furthest you've got are kept, and each boss down is worth golden crumbs.
const RUSH_ORDER = [1, 2, 3, 4, 5, 5.5, 6, 7, 10];
const RUSH_KIT = { coins: 0, armMk: 2, armHp: 3, boots: 3, hearts: 1, spins: 0, chips: {}, slowmo: 2, magnet: false };
const Rush = {
  on: false, idx: 0, t: 0, hits: 0,
  open() { return Meta.stats().wins > 0 || Progress.testMode; },
  best() { return Meta._j('lc_rush_best', null); },          // { time, n } - n bosses down (a full clear beats any part-clear)
  start(reg) {
    Run.on = false;
    this.on = true; this.idx = 0; this.t = 0; this.hits = 0;
    reg.set('shop', Object.assign({}, RUSH_KIT, { chips: {} })); reg.set('lives', 1);
    Meta._s('lc_rush_runs', (Meta._j('lc_rush_runs', 0) || 0) + 1);
  },
  level() { return RUSH_ORDER[this.idx]; },
  finish(how) {
    this.on = false;
    const n = this.idx, all = n >= RUSH_ORDER.length, b = this.best();
    const better = !b || n > b.n || (n === b.n && this.t < b.time);
    if (better && n > 0) Meta._s('lc_rush_best', { time: this.t, n });
    const crumbs = n * 15 + (all ? 60 : 0) + (better && n > 0 ? 25 : 0);
    if (crumbs) Meta.addCrumbs(crumbs);
    return { rush: true, how: all ? 'won' : how, n, total: RUSH_ORDER.length, time: this.t, hits: this.hits, newBest: better && n > 0, crumbs };
  },
  fmt(t) { const m = Math.floor(t / 60), s = (t % 60).toFixed(1).padStart(4, '0'); return m + ':' + s; }
};

function rushInstall(L) {
  const P = L.prototype;
  const init = P.init; P.init = function (data) {
    init.call(this, data);
    this.rushTxt = null; this.rushGoing = false;                      // (a fresh level: the old HUD text is gone)
    this.rushOn = Rush.on && !(data && (data.camp || data.training || data.cavern));
    if (this.rushOn) this.waves = [{ name: 'BOSS ' + (Rush.idx + 1) + ' OF ' + RUSH_ORDER.length, spawns: [{ type: 'boss', t: 0.8 }] }];
  };
  const update = P.update; P.update = function (time, delta) {
    update.call(this, time, delta);
    if (!this.rushOn) return;
    if (this.state === 'play' && !this.paused) Rush.t += Math.min(0.05, delta / 1000);
    if (!this.rushTxt) this.rushTxt = this.add.text(this.scale.width / 2, 46, '', { fontFamily: PIXEL, fontSize: '10px', color: '#ff9a7a', stroke: '#1a1020', strokeThickness: 4, align: 'center' }).setOrigin(0.5, 0).setDepth(25).setScrollFactor(0);
    this.rushTxt.setText('BOSS RUSH  ' + (Rush.idx + 1) + '/' + RUSH_ORDER.length + '\n' + Rush.fmt(Rush.t));
  };
  const hurt = P.hurt; P.hurt = function (...a) { const hp = this.pl && this.pl.hp; const r = hurt.apply(this, a); if (this.rushOn && this.pl && this.pl.hp < hp) Rush.hits++; return r; };
  const win = P.win; P.win = function () { if (this.rushOn) { this.rushWin(); return; } return win.call(this); };
  const wonNext = P.wonNext; P.wonNext = function () { if (this.rushOn) { this.rushNext(); return; } return wonNext.call(this); };
  const leaveGameOver = P.leaveGameOver; P.leaveGameOver = function () { if (this.rushOn) { this.rushEnd('died'); return; } return leaveGameOver.call(this); };
  const leaveTo = P.leaveTo; P.leaveTo = function (key) { if (this.rushOn) { this.rushEnd('quit'); return; } return leaveTo.call(this, key); };
  Object.assign(P, {
    rushWin() {
      if (this.state === 'won') return;
      this.state = 'won'; this.endT = this.t; Rush.idx++;
      Sound.say('woohoo', { force: true }); Sound.music('win');
      const last = Rush.idx >= RUSH_ORDER.length;
      this.showOverlay(last ? 'BOSS RUSH CLEARED!' : 'BOSS DOWN!', (last ? 'Every last one of them.' : 'Next up: ' + (LEVELS[Rush.level()].bossName || 'the next boss')) +
        '\n\nTIME ' + Rush.fmt(Rush.t) + '   HITS ' + Rush.hits + '\n\n' + (last ? 'Tap to head home' : 'Tap to go on'));
      this.time.delayedCall(last ? 3500 : 2600, () => this.rushNext());
    },
    rushNext() {
      if (this.rushGoing) return; this.rushGoing = true;
      if (Rush.idx >= RUSH_ORDER.length) { this.rushEnd('won'); return; }
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(320, () => this.scene.start('level1', { level: Rush.level(), direct: true, autostart: true }));
    },
    rushEnd(how) {
      if (this.leavingGO && how !== 'won') return; this.leavingGO = true;
      const sum = Rush.finish(how);
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.time.delayedCall(650, () => { Sound.music(null); this.scene.start('level1', { camp: true, sum }); });
    }
  });
}

// ---- at camp: the gate, its panel, and the result card
const RushCampMixin = {
  campRush() {
    const b = Rush.best(), open = Rush.open();
    const cards = RUSH_ORDER.map((id, i) => ({ icon: null, planet: id, name: (LEVELS[id].bossName || 'BOSS ' + (i + 1)), desc: (LEVELS[id].short || LEVELS[id].name), col: b && i < b.n ? 0x2a6a3a : 0x3a2a5a, tag: 'BOSS ' + (i + 1), tagCol: b && i < b.n ? '#7dff8a' : '#c9cde0' }));
    this.campOpen({
      title: 'THE BOSS GATE', sub: open ? (b ? 'BEST: ' + b.n + '/' + RUSH_ORDER.length + ' IN ' + Rush.fmt(b.time) : 'EVERY BOSS, BACK TO BACK. ONE LIFE. GO!') : 'WIN A RUN TO OPEN THE GATE',
      cards: cards.map((c, i) => Object.assign(c, { icon: (LEVELS[RUSH_ORDER[i]].boss && this.textures.exists(LEVELS[RUSH_ORDER[i]].boss.tex)) ? LEVELS[RUSH_ORDER[i]].boss.tex : 'cr_skull', dim: !open })), cols: this.scale.width >= 800 ? 5 : 3,
      buttons: open ? [{ label: 'START THE RUSH', act: () => this.campRushGo() }, { label: 'NOT YET', act: () => this.campPanel.close() }] : [{ label: 'OK', act: () => this.campPanel.close() }]
    });
  },
  campRushGo() {
    if (this.campGo) return;
    this.campPanel.close(); Rush.start(this.registry);
    this.campGo = { leave: true, t: 0 }; Sound.sfx('bossIn'); this.cameras.main.flash(200, 255, 80, 60);
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(530, () => this.scene.start('level1', { level: Rush.level(), direct: true, autostart: true }));
  },
  rushCard(S) {
    this.state = 'campmenu';
    const W = this.scale.width, H = this.scale.height, f = RUN_UI.f, c = this.add.container(0, 0).setDepth(60);
    const w = Math.min(W - 30, 420), x = (W - w) / 2, y = H < 430 ? 30 : 70, hh = 190;
    c.add(this.add.rectangle(0, 0, W, H, 0x05030c, 0.5).setOrigin(0));
    const g = this.add.graphics(); c.add(g);
    g.fillStyle(0x1a1020, 1).fillRect(x - 4, y - 4, w + 8, hh + 8); g.fillStyle(0xc8962a, 1).fillRect(x - 2, y - 2, w + 4, hh + 4);
    g.fillStyle(0x121838, 1).fillRect(x, y, w, hh); g.fillStyle(S.how === 'won' ? 0x5a4a0a : 0x5a140a, 1).fillRect(x, y, w, 36);
    const title = S.how === 'won' ? 'BOSS RUSH CLEARED!' : S.how === 'quit' ? 'RUSH ABANDONED' : 'RUSH OVER';
    c.add(this.add.text(W / 2, y + 9, title, f(18, S.how === 'won' ? '#ffd23f' : '#ff9a7a', { stroke: '#2a0606', strokeThickness: 6 })).setOrigin(0.5, 0));
    c.add(this.add.text(W / 2, y + 54, 'BOSSES DOWN  ' + S.n + ' / ' + S.total + '\n\nTIME  ' + Rush.fmt(S.time) + '      HITS  ' + S.hits, f(10, '#ffffff', { align: 'center' })).setOrigin(0.5, 0));
    if (S.newBest) c.add(this.add.text(W / 2, y + 122, 'NEW RECORD!', f(10, '#7dff8a')).setOrigin(0.5, 0));
    c.add(this.add.text(W / 2, y + 146, '+' + S.crumbs + ' GOLDEN CRUMBS', f(10, '#ffd23f')).setOrigin(0.5, 0));
    c.add(this.add.text(W / 2, y + hh - 6, 'TAP / PRESS A KEY', f(6, '#9aa4c8', { strokeThickness: 3 })).setOrigin(0.5, 1));
    if (this.campCrumbT) this.campCrumbT.setText(String(Meta.crumbs()));
    c.setAlpha(0); this.tweens.add({ targets: c, alpha: 1, duration: 250 });
    this.campCard = c; Sound.sfx(S.how === 'won' ? 'reveal' : 'clunk');
    const opened = this.time.now;
    const close = () => { if (!this.campCard || this.time.now - opened < 900) return; this.campCard = null; window.removeEventListener('keydown', close); padOff(); this.input.off('pointerup', close); c.destroy(); this.state = 'play'; this.campCool = 0.4; };
    const padOff = Pad.on(() => close());
    window.addEventListener('keydown', close); this.input.on('pointerup', close);
    this.events.once('shutdown', () => { window.removeEventListener('keydown', close); padOff(); });
  }
};
