// (v2.69) PLAYTEST RECORDER. Quietly logs every level attempt, wave by wave, on this device, so the game can be
// balanced from real play instead of feel. Turn the on-screen panel on with ?tel in the URL (it stays on; ?tel=0 hides it).
// Each attempt: the level, Chris's kit on arrival (gun levels, chips, hearts, armour, boots, tank...), and for each wave
// and the boss: time taken, hearts and armour plates lost, kills, cheddar picked up, how many enemies and enemy shots
// were on screen on average and at worst, gun level before and after. EXPORT copies/downloads it all as JSON.
const Tel = {
  K: 'lc_tel_v1', run: null, seg: null, sc: null, sampleT: 0, saveT: 0,
  load() { try { return JSON.parse(localStorage.getItem(this.K)) || []; } catch (e) { return []; } },
  store(runs) { try { localStorage.setItem(this.K, JSON.stringify(runs.slice(-80))); } catch (e) {} },
  hudOn() {
    try { const q = new URLSearchParams(location.search); if (q.has('tel')) localStorage.setItem('lc_tel_hud', q.get('tel') === '0' ? '0' : '1'); return localStorage.getItem('lc_tel_hud') === '1'; } catch (e) { return false; }
  },
  kit(sc) {
    const q = Shop.get(sc.registry);
    return { gunLv: Object.assign({}, sc.registry.get('gunLv') || {}), chips: Object.assign({}, q.chips || {}), maxHp: sc.maxHp, armMk: q.armMk || 0, armHp: q.armHp || 0,
      boots: q.boots || 0, tank: q.tank || 0, magnet: !!q.magnet, burgers: q.burgers || 0, lives: sc.registry.get('lives'), coins: q.coins || 0 };
  },
  // a level scene has started (a new attempt: a fresh go, or a retry from a checkpoint after a death)
  begin(sc) {
    if (this.run && !this.run.result) this.end(this.sc, 'quit');
    if (!sc.def || sc.def.cave) { this.run = null; return; }
    this.sc = sc; this.seg = null; this.hpPrev = null; this.armPrev = null;
    this.run = { build: typeof BUILD !== 'undefined' ? BUILD : '?', at: new Date().toISOString(), level: sc.def.id, name: sc.def.short || sc.def.name,
      diff: (typeof Settings !== 'undefined' && Settings.diff) || 'normal', kit: null, segs: [], result: null, t: 0 };
    this.push();
  },
  label(sc) { const n = sc.waves ? sc.waves.length : 0; return sc.waveIdx >= n - 1 ? 'BOSS' : 'W' + (sc.waveIdx + 1); },
  open(sc) {
    const P = sc.pl, boss = sc.enemies.find(e => e.type === 'boss');
    this.seg = { id: this.label(sc), wave: sc.waveIdx, t: 0, hpLost: 0, plates: 0, kills: 0, coins: 0, aliveSum: 0, aliveMax: 0, shotSum: 0, shotMax: 0, n: 0,
      gun: sc.weapon ? sc.weapon.id : '', lvIn: sc.lv, lvOut: sc.lv, hpIn: P ? P.hp : 0, hpOut: 0, bossHp: boss ? boss.maxHp || boss.hp : 0, done: false };
    this.run.segs.push(this.seg);
  },
  close(sc, how) {
    const s = this.seg; if (!s) return;
    s.lvOut = sc.lv; s.hpOut = sc.pl ? sc.pl.hp : 0; s.done = how;
    s.alive = +(s.aliveSum / Math.max(1, s.n)).toFixed(2); s.shots = +(s.shotSum / Math.max(1, s.n)).toFixed(2); s.t = +s.t.toFixed(2);
    delete s.aliveSum; delete s.shotSum; delete s.n;
    this.seg = null; this.push();
  },
  tick(sc, dt) {
    if (!this.run || sc !== this.sc || this.run.result) return;
    if (!this.run.kit && sc.pl && sc.state === 'play') this.run.kit = this.kit(sc);
    if (sc.state !== 'play' || !sc.pl || sc.paused) return;
    if (!this.seg || this.seg.wave !== sc.waveIdx) { if (this.seg) this.close(sc, 'clear'); if (sc.waveIdx >= 0) this.open(sc); }
    const s = this.seg; if (!s) return;
    this.run.t += dt; s.t += dt;
    if (s.id === 'BOSS') { const bb = sc.enemies.find(e => e.type === 'boss'); if (bb) { if (!s.bossHp) s.bossHp = bb.maxHp || bb.hp; s.bossLeft = Math.max(0, Math.round(bb.hp)); } }
    const P = sc.pl;
    if (this.hpPrev != null && P.hp < this.hpPrev) s.hpLost += this.hpPrev - P.hp;
    this.hpPrev = P.hp;
    this.sampleT -= dt;
    if (this.sampleT <= 0) {                               // 10x a second: what's on screen, armour
      this.sampleT = 0.1;
      const a = sc.enemies.filter(e => !e.phased && e.type !== 'boss').length, b = sc.eBullets ? sc.eBullets.length : 0;
      s.aliveSum += a; s.shotSum += b; s.n++; s.aliveMax = Math.max(s.aliveMax, a); s.shotMax = Math.max(s.shotMax, b);
      const ah = Shop.get(sc.registry).armHp || 0; if (this.armPrev != null && ah < this.armPrev) s.plates += this.armPrev - ah; this.armPrev = ah;
    }
    this.saveT -= dt; if (this.saveT <= 0) { this.saveT = 2; this.push(); }
    this.hud(sc);
  },
  kill(e) { if (this.seg && e.type !== 'boss') this.seg.kills++; },
  coins(n) { if (this.seg && n > 0) this.seg.coins += n; },
  end(sc, result) {
    if (!this.run || this.run.result) return;
    if (sc && this.seg) this.close(sc, result === 'won' ? 'clear' : result);
    this.run.result = result; this.run.t = +this.run.t.toFixed(2);
    if (sc && sc.pl) this.run.kitOut = this.kit(sc);
    this.push(); this.hud(sc, true);
  },
  push() {                                                 // (re)write this attempt into the device log
    if (!this.run) return;
    const runs = this.load(), i = runs.findIndex(r => r.at === this.run.at && r.level === this.run.level);
    if (i >= 0) runs[i] = this.run; else runs.push(this.run);
    this.store(runs);
  },
  // ---- the panel (plain HTML over the game, only with ?tel)
  hudT: 0,
  hud(sc, force) {
    if (!this.hudOn()) { if (this.el) this.el.style.display = 'none'; return; }
    this.hudT -= sc && sc.lastDt || 0.016; if (this.hudT > 0 && !force) return; this.hudT = 0.25;
    if (!this.el) this.build();
    this.el.style.display = 'block';
    const s = this.seg, r = this.run;
    this.body.textContent = r ? ('L' + r.level + ' ' + (s ? s.id : '-') + (r.result ? ' [' + r.result.toUpperCase() + ']' : '') +
      (s ? '\n' + s.t.toFixed(1) + 's  hit ' + s.hpLost + (s.plates ? '+' + s.plates + 'arm' : '') + '  kills ' + s.kills + '  ch ' + s.coins +
        '\nalive ' + (s.aliveSum / Math.max(1, s.n)).toFixed(1) + ' (max ' + s.aliveMax + ')  shots ' + (s.shotSum / Math.max(1, s.n)).toFixed(1) + ' (max ' + s.shotMax + ')' : '') +
      '\nlogged ' + this.load().length + ' attempts') : 'no level running';
  },
  build() {
    const el = this.el = document.createElement('div');
    el.style.cssText = 'position:fixed;left:6px;top:46%;z-index:50;font:10px/1.35 monospace;color:#e8ffe8;background:rgba(10,16,24,.78);padding:5px 7px;border-radius:6px;white-space:pre;pointer-events:auto;max-width:46vw';
    this.body = document.createElement('div'); el.appendChild(this.body);
    const row = document.createElement('div'); row.style.cssText = 'margin-top:4px;display:flex;gap:5px';
    const btn = (t, f) => { const b = document.createElement('button'); b.textContent = t; b.style.cssText = 'font:bold 10px monospace;padding:3px 6px;border:0;border-radius:4px;background:#ffd23f;color:#1a1020'; b.onclick = e => { e.stopPropagation(); f(b); }; row.appendChild(b); return b; };
    btn('EXPORT', b => this.exportAll(b));
    btn('CLEAR', b => { if (b.dataset.sure) { this.store([]); b.textContent = 'CLEARED'; delete b.dataset.sure; } else { b.dataset.sure = 1; b.textContent = 'SURE?'; setTimeout(() => { delete b.dataset.sure; b.textContent = 'CLEAR'; }, 2500); } });
    btn('HIDE', () => { try { localStorage.setItem('lc_tel_hud', '0'); } catch (e) {} el.style.display = 'none'; });
    el.appendChild(row);
    ['pointerdown', 'touchstart', 'mousedown'].forEach(ev => el.addEventListener(ev, e => e.stopPropagation()));
    document.body.appendChild(el);
  },
  exportAll(b) {
    const txt = JSON.stringify({ game: 'luna-chris', exported: new Date().toISOString(), runs: this.load() }), name = 'luna-playtest-' + new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-') + '.json';
    try { navigator.clipboard && navigator.clipboard.writeText(txt); } catch (e) {}
    try {
      const f = typeof File !== 'undefined' ? new File([txt], name, { type: 'application/json' }) : null;
      if (f && navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], title: 'Luna Chris playtest' }).catch(() => {}); }
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
    } catch (e) {}
    if (b) { b.textContent = 'COPIED'; setTimeout(() => { b.textContent = 'EXPORT'; }, 2000); }
  }
};
// cheddar picked up: counted where it lands in the shop's purse
if (typeof Shop !== 'undefined') { const earn0 = Shop.earn; Shop.earn = function (reg, n) { Tel.coins(n); return earn0.call(this, reg, n); }; }
