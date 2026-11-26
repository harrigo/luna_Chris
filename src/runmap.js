// ================================================================= THE RUN MAP (v3.41)
// The route screen is a little star map, like the campaign's but smaller and different every run: Moon Camp on the
// left, then one column per stage - a planet, or two at a fork - joined by dotted gold paths that wander up and down.
// The bonus stop hangs off the path as a gold star. Planets you've beaten light up, roads not taken go grey, the stops
// ahead are dim. A rocket shows where you are; the panel underneath describes whatever you're pointing at.
// The layout is seeded from the run's start time, so it stays put all run (and through a save/restore).
function runMapRng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function runMapLayout() {
  if (Run.map && Run.map.t0 === Run.t0) return Run.map;
  const rnd = runMapRng(Math.floor(Run.t0 / 7) || 12345), n = RUN_ROUTE.length, cols = [];
  let y = 0.5;
  for (let i = 0; i < n; i++) {
    const opts = RUN_ROUTE[i], x = (i + 1) / (n + 1) + (rnd() - 0.5) * 0.04;
    y = Math.max(0.3, Math.min(0.7, y + (rnd() - 0.5) * 0.45));
    if (opts.length === 1) cols.push([{ id: opts[0], x, y }]);
    else { const s = 0.17 + rnd() * 0.06; cols.push(opts.map((id, k) => ({ id, x: x + (rnd() - 0.5) * 0.02, y: Math.max(0.14, Math.min(0.86, y + (k ? s : -s))) }))); }
  }
  // (v3.131) the STOPS sit ON the line, half way between the stage before and their own stage: the bonus (a star) and
  // the shop (Fridge-o-tron's stall). Everyone passes through them.
  const camp0 = { x: 0.5 / (n + 1), y: 0.5 }, mid = c => c.reduce((a, q) => a + q.y, 0) / c.length;
  const stopPos = i => { const a = i ? cols[i - 1] : [camp0], b = cols[i]; return { x: (a[0].x + b[0].x) / 2, y: (mid(a) + mid(b)) / 2 }; };
  const bonus = Run.bonusAt >= 0 ? stopPos(Run.bonusAt) : null, shop = Run.shopAt !== undefined ? stopPos(Run.shopAt) : null;
  const deco = []; for (let i = 0; i < 14; i++) deco.push({ x: rnd(), y: rnd(), r: 2 + rnd() * 6, k: rnd() < 0.3 ? 'rock' : 'dust', c: [0x6a4a9a, 0x3a5a9a, 0x9a4a6a][Math.floor(rnd() * 3)] });
  Run.map = { t0: Run.t0, cols, bonus, shop, deco, camp: camp0 };
  return Run.map;
}

Object.assign(RunScene.prototype, {
  buildRouteMap(W, y0, y1, small) {
    if (Run.bonusOffer[Run.idx] === undefined) Run.bonusOffer[Run.idx] = Run.idx === Run.bonusAt ? RUN_BONUS[Math.floor(Math.random() * RUN_BONUS.length)] : null;
    if (typeof makeCampTextures === 'function') makeCampTextures(this);
    const f = RUN_UI.f, M = runMapLayout(), panH = small ? 62 : 82, mx0 = 20, mx1 = W - 20, my0 = y0 + 4, my1 = y1 - panH - 10;
    const X = q => mx0 + q.x * (mx1 - mx0), Y = q => my0 + q.y * (my1 - my0);
    const g = this.add.graphics(); this.ui.add(g);
    // a faint nebula and some drifting rocks, so it feels like a place
    g.fillStyle(0x3a2a6a, 0.18).fillEllipse((mx0 + mx1) / 2, (my0 + my1) / 2, (mx1 - mx0) * 0.9, (my1 - my0) * 0.95);
    for (const d of M.deco) { const x = mx0 + d.x * (mx1 - mx0), y = my0 + d.y * (my1 - my0); if (d.k === 'rock') { g.fillStyle(0x2a2440, 1).fillCircle(x + 1, y + 1, d.r); g.fillStyle(0x4a4268, 1).fillCircle(x, y, d.r); g.fillStyle(0x6a6290, 1).fillCircle(x - d.r * 0.3, y - d.r * 0.3, d.r * 0.4); } else g.fillStyle(d.c, 0.25).fillCircle(x, y, d.r * 3); }
    const dots = (ax, ay, bx, by, col, a, lit) => {                            // a dotted path, gently bowed
      const L = Math.hypot(bx - ax, by - ay), n = Math.max(2, Math.floor(L / 10)), bow = Math.min(18, L * 0.12);
      for (let k = 1; k < n; k++) { const t = k / n, x = ax + (bx - ax) * t, y = ay + (by - ay) * t - Math.sin(t * Math.PI) * bow; g.fillStyle(0x1a1020, a).fillRect(x - 1, y - 1, lit ? 5 : 4, lit ? 5 : 4); g.fillStyle(col, a).fillRect(x - 2, y - 2, lit ? 4 : 3, lit ? 4 : 3); }
    };
    // where you've actually been, stage by stage (the camp, then each planet you picked)
    const at = i => (i < 0 ? M.camp : M.cols[i].find(q => q.id === Run.done[i]) || M.cols[i][0]);
    const stopOf = i => i === Run.bonusAt ? M.bonus : i === Run.shopAt ? M.shop : null;
    for (let i = 0; i < M.cols.length; i++) {
      const froms = i === 0 ? [M.camp] : (i - 1 < Run.idx ? [at(i - 1)] : M.cols[i - 1]), S = stopOf(i);
      const stDone = S && (i === Run.shopAt ? Run.shopDone || Run.idx > i : Run.bonusDone[i] || Run.idx > i);
      if (S) for (const a of froms) { const walked = i <= Run.idx && (i < Run.idx || stDone); dots(X(a), Y(a), X(S), Y(S), walked || i === Run.idx ? 0xffd23f : 0x6a7090, walked ? 1 : i === Run.idx ? 0.85 : 0.45, walked); }
      for (const a of S ? [S] : froms) for (const b of M.cols[i]) {
        const walked = i < Run.idx && b.id === Run.done[i], next = i === Run.idx && (!S || stDone), gone = i < Run.idx && b.id !== Run.done[i];
        dots(X(a), Y(a), X(b), Y(b), walked ? 0xffd23f : next ? 0xffd23f : 0x6a7090, walked ? 1 : next ? 0.85 : gone ? 0.25 : 0.45, walked);
      }
    }
    const stopNow = Run.stopAt(), bonusLive = stopNow && stopNow !== 'shop', shopLive = stopNow === 'shop';
    // Moon Camp
    { const x = X(M.camp), y = Y(M.camp); g.fillStyle(0xffd23f, 0.15).fillCircle(x, y, 18); g.fillStyle(0xd8c890, 1).fillCircle(x, y, 13); g.fillStyle(0xb8a870, 1).fillCircle(x + 4, y + 3, 4); g.fillStyle(0xb8a870, 1).fillCircle(x - 5, y - 2, 3);
      if (this.textures.exists('cr_tent')) { const t = RUN_UI.fit(this.add.image(x, y - 12, 'cr_tent'), 18); this.ui.add(t); }
      this.ui.add(this.add.text(x, y + 18, 'CAMP', f(6, '#c9cde0', { strokeThickness: 3 })).setOrigin(0.5, 0)); }
    // the planets
    const opts = [];
    const rBig = Math.max(14, Math.min(30, (mx1 - mx0) / (M.cols.length + 1) * 0.26, (my1 - my0) * 0.13)), rSmall = rBig * 0.62;
    M.cols.forEach((col, i) => col.forEach(q => {
      const done = i < Run.idx && q.id === Run.done[i], gone = i < Run.idx && !done, cur = i === Run.idx, x = X(q), y = Y(q), r = cur ? rBig : done ? rBig * 0.8 : rSmall;
      const objs = RUN_UI.planetImg(this, q.id, x, y, r);
      for (const o of objs) { if (gone) { if (o.setTint) o.setTint(0x555566); o.setAlpha(0.35); } else if (!cur && !done) o.setAlpha(0.6); this.ui.add(o); }
      if (done) { g.lineStyle(2, 0x7dff8a, 1).strokeCircle(x, y, r + 3); this.ui.add(this.add.text(x + r * 0.7, y - r * 0.9, '✓', f(9, '#7dff8a')).setOrigin(0.5)); }
      if (i === M.cols.length - 1) this.ui.add(this.add.text(x, y - r - 12, 'FINAL BOSS', f(6, '#ff9d3a', { strokeThickness: 3 })).setOrigin(0.5));
      if (cur) { this.ui.add(this.add.text(x, y + r + 6, LEVELS[q.id].short || LEVELS[q.id].name, f(small ? 6 : 7, '#ffffff', { strokeThickness: 3 })).setOrigin(0.5, 0)); if (!stopNow) opts.push({ id: q.id, x, y, r }); }
    }));
    // the bonus star
    if (M.bonus) { const x = X(M.bonus), y = Y(M.bonus), r = bonusLive ? rBig * 0.85 : rSmall * 0.8, done = Run.bonusDone[Run.bonusAt] || Run.idx > Run.bonusAt;
      const pts = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; pts.push({ x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr }); }
      g.fillStyle(0xffd23f, bonusLive ? 0.25 : 0.1).fillCircle(x, y, r + 8); g.fillStyle(0x1a1020, 1).fillPoints(pts.map(q => ({ x: q.x + 2, y: q.y + 2 })), true);
      g.fillStyle(done ? 0x7dff8a : 0xffd23f, bonusLive || done ? 1 : 0.45).fillPoints(pts, true);
      this.ui.add(this.add.text(x, y + r + 4, done ? 'BONUS DONE' : 'BONUS', f(6, done ? '#7dff8a' : '#ffd23f', { strokeThickness: 3 })).setOrigin(0.5, 0));
      if (bonusLive) opts.push({ bonus: stopNow, x, y, r }); }
    // (v3.131) the SHOP stop: Fridge-o-tron's stall, on the line
    if (M.shop) { const x = X(M.shop), y = Y(M.shop), done = Run.shopDone || Run.idx > Run.shopAt, r = shopLive ? rBig * 0.85 : rSmall * 0.8;
      g.fillStyle(0x7dff8a, shopLive ? 0.25 : 0.1).fillCircle(x, y, r + 8); g.fillStyle(0x1a1020, 1).fillCircle(x + 2, y + 2, r); g.fillStyle(done ? 0x2a6a3a : 0x2a8a5a, shopLive || done ? 1 : 0.5).fillCircle(x, y, r);
      if (this.textures.exists('cr_stall')) { const im = RUN_UI.fit(this.add.image(x, y + 2, 'cr_stall'), r * 1.5); if (!shopLive && !done) im.setAlpha(0.55); this.ui.add(im); }
      this.ui.add(this.add.text(x, y + r + 4, done ? 'SHOP DONE' : 'SHOP', f(6, done ? '#7dff8a' : '#7dff8a', { strokeThickness: 3 })).setOrigin(0.5, 0));
      if (shopLive) opts.push({ shop: true, x, y, r }); }
    // the rocket: you are here
    { const here = Run.idx === 0 ? M.camp : at(Run.idx - 1);
      if (this.textures.exists('cr_rocket')) { const rk = RUN_UI.fit(this.add.image(X(here) + 10, Y(here) - 20, 'cr_rocket'), 26).setRotation(0.6); this.ui.add(rk); this.mapRocket = { im: rk, y: rk.y }; } }
    // the panel underneath: what you're pointing at, plus SHOP / GIVE UP
    const px = 14, pw = W - 28, py = y1 - panH;
    RUN_UI.card(g, px, py, pw, panH, 0x2a3a7a, 0);
    this.mapInfo = {
      title: this.add.text(px + 12, py + 8, '', f(small ? 10 : 12, '#ffd23f')), sub: this.add.text(px + 12, py + (small ? 24 : 28), '', f(7, '#ff9d3a', { strokeThickness: 3 })),
      body: this.add.text(px + 12, py + (small ? 36 : 44), '', f(7, '#c9cde0', { strokeThickness: 3, wordWrap: { width: pw - 290 }, lineSpacing: 3 }))
    };
    for (const k in this.mapInfo) this.ui.add(this.mapInfo[k]);
    this.mapOpts = opts;
    opts.forEach(o => this.hits.push({ x: o.x - o.r - 6, y: o.y - o.r - 6, w: o.r * 2 + 12, h: o.r * 2 + 12, map: o,
      act: () => { if (o.shop) { if (this.going || this.chatting) return; Sound.sfx('wave'); Run.shopDone = true; Meta._s('lc_shop_met', 1);
        if (typeof Story !== 'undefined' && Story.onShop()) { this.chatting = true; const seen = Meta._j('lc_talk', {}); seen.fridge = { met: true, i: 0 }; Meta._s('lc_talk', seen); chatBar(this, FOLK.fridge.first, { header: 'SOMEONE NEW!', onClose: () => { this.chatting = false; this.go('shop'); } }); return; }
        this.go('shop'); return; } if (o.bonus) { Sound.sfx('power'); Run.bonusDone[Run.idx] = true; this.go(o.bonus, o.bonus === 'zerog' ? { room: 'zerog' } : undefined); } else { Sound.sfx('power'); this.go('level1', { level: o.id, direct: true }); } } }));
    const bw = small ? 96 : 116, bh = small ? 20 : 24, bx = px + pw - bw - 12, bby = py + panH / 2 - bh / 2;
    [['GIVE UP', () => { if (this.going) return; this.going = true; const sum = Run.finish(this.registry, 'quit'); this.cameras.main.fadeOut(220, 0, 0, 0); this.time.delayedCall(250, () => this.scene.start('level1', { camp: true, sum })); }]].forEach(([lab, act], i) => {
      const x = bx + i * (bw + 10);
      RUN_UI.btn(this, this.ui, x, bby, bw, bh, lab, i ? 0xd86a8a : 0xffd23f, i ? '#ff9db8' : '#ffd23f');
      this.hits.push({ x, y: bby, w: bw, h: bh, act });
    });
    if (Progress.testMode) {
      const tb = this.add.text(W - SAFE_X, 12, '+2000 CHEDDAR (TEST)', f(6, '#1a1020', { strokeThickness: 0, backgroundColor: '#ffd23f', padding: { x: 5, y: 4 } })).setOrigin(1, 0).setInteractive({ useHandCursor: true });
      tb.on('pointerup', () => { const s = Shop.get(this.registry); s.coins += 2000; s.slowmo = 3; Shop.set(this.registry, s); Sound.sfx('power'); this.build(); }); this.ui.add(tb);
    }
    this.mapShowInfo();
  },
  mapShowInfo() {
    const I = this.mapInfo, h = this.hits && this.hits[this.sel]; if (!I) return;
    const o = h && h.map;
    if (!o) { I.title.setText(Run.idx === 0 ? 'WHERE TO FIRST?' : 'WHERE NEXT?'); I.sub.setText(''); I.body.setText('Pick a planet on the map. ' + (this.mapOpts.length > 1 ? 'A fork: you only get to visit one.' : '')); return; }
    if (o.shop) { I.title.setText('THE SHOP: FRIDGE-O-TRON'); I.sub.setText('A STOP ON THE ROAD.'); I.body.setText('Spend this run\'s cheddar on upgrades before the next planet. Once you\'ve found him, he sets up shop at camp too.'); return; }
    if (o.bonus) { I.title.setText('BONUS STOP: ' + RUN_BONUS_NAME[o.bonus]); I.sub.setText('ONE GO. NO DANGER.'); I.body.setText('On the road, so everyone plays it. Win it for a LEGENDARY perk: bigger, better, rarer.'); return; }
    const L = LEVELS[o.id]; I.title.setText(L.short || L.name); I.sub.setText('BOSS: ' + L.bossName); I.body.setText((L.blurb || '').replace(/\n/g, ' '));
  }
});
