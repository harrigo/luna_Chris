// ================================================================= THE SECRET CAVERN (v3.41)
// Under Moon Camp, behind a cracked boulder you have to shoot or bash open (it wobbles now and then - something glints
// inside). Drop down the hole into a cavern that's dug fresh every visit: three rings of dark tunnel split into chambers
// by rock walls, holes in the floors dropping to the ring below, gold crumb piles in the corners, a few cave vermin, and
// at the very bottom a TREASURE CHEST. Open it and you're hauled back up to camp with the lot. Get knocked out and you
// crawl back up with whatever you'd found. The rats restock it after every run (one raid per run).
// Built on the Labyrinth's cave (labyrinth.js): the cavern is just a cave layout made up on the spot.
function makeCavernDef(seed) {
  const rnd = runMapRng(seed || Date.now()), TWO = Math.PI * 2;
  const pick = a => a[Math.floor(rnd() * a.length)], between = (a, b) => a + rnd() * (b - a);
  const RS = [900, 745, 590], rings = [{ hole: 0 }];
  for (let i = 0; i < RS.length; i++) {
    const last = i === RS.length - 1, RG = { R: RS[i], ceil: 120, walls: [], holes: [], loot: [], spawn: [] };
    if (!last) {
      // rock walls: 2-3 of them, well apart, never right on top of where you land
      const n = 2 + Math.floor(rnd() * 2);
      while (RG.walls.length < n) { const w = between(0.35, TWO - 0.35); if (RG.walls.every(o => Math.abs(o - w) > 0.8)) RG.walls.push(+w.toFixed(3)); }
      RG.walls.sort((a, b) => a - b);
      // every chamber gets a way down (so wherever you land, you can keep going), some get two
      const ws = RG.walls.concat([RG.walls[0] + TWO]);
      for (let k = 0; k < RG.walls.length; k++) {
        const lo = ws[k] + 0.15, hi = ws[k + 1] - 0.15, nh = hi - lo > 1.4 && rnd() < 0.5 ? 2 : 1;
        for (let j = 0; j < nh; j++) RG.holes.push(+((lo + (hi - lo) * (j + 0.3 + rnd() * 0.4) / nh) % TWO).toFixed(3));
      }
      RG.path = RG.holes[0];
    } else RG.bessie = +between(0, TWO).toFixed(3);                       // the bottom: one big vault, the chest somewhere in it
    // gold crumb piles and the odd cheese wedge, then the vermin
    for (let k = 0; k < 3 + Math.floor(rnd() * 3); k++) RG.loot.push(rnd() < 0.8 ? ['gold', +between(0, TWO).toFixed(3), 3 + Math.floor(rnd() * 6)] : ['heal', +between(0, TWO).toFixed(3)]);
    // (v3.43) treasure chests on every level: small ones up top, the big one (and a spare) in the vault
    const nc = last ? 1 : i === 0 ? 1 : 1 + Math.floor(rnd() * 2);
    for (let k = 0; k < nc; k++) RG.loot.push(['chest', +between(0.3, TWO - 0.3).toFixed(3), 8 + Math.floor(rnd() * 8) + i * 4, false]);
    if (last) RG.loot.push(['chest', RG.bessie, 30 + Math.floor(rnd() * 31), true]);
    for (let k = 0; k < 3 + i; k++) { const a = between(0.25, TWO - 0.25); RG.spawn.push([pick(['rindtick', 'gnawer', 'grub', 'mouse', 'mouse']), +a.toFixed(3)]); }
    rings.push(RG);
  }
  const L8 = LEVELS[8];
  return Object.assign({}, L8, {
    cavern: true, name: 'The Secret Cavern', short: 'SECRET CAVERN', bossName: '', tip: 'FIND THE TREASURE AT THE BOTTOM!',
    caveIntro: 'THE SECRET CAVERN\nFIND THE TREASURE!', caveLabel: 'SECRET CAVERN', waves: [],
    cave: { holeOff: 0.0001, fillT: 1e9, rings }          // (holeOff 0 would read as 'unset': the hole's right under you)
  });
}

function makeCavernTextures(scene) {
  if (scene.textures.exists('cv_hole')) return;
  const WD = [0xd09050, 0x9a5c26, 0x5a3212], GOLD = [0xfff0a0, 0xf2c040, 0x9a6a10], ROPE = 0xc8a060;
  pixSprite(scene, 'cv_hole', 56, 40, a => {
    a.ell(28, 34, 26, 7, [0x3a2a1a, 0x1a1008, 0x050302]);                                         // the pit
    a.ell(28, 35, 20, 4.5, 0x000000);
    a.rect(6, 4, 9, 34, WD[1]); a.rect(47, 4, 50, 34, WD[1]); a.rect(4, 2, 52, 6, WD[0]);           // a little wooden frame over it
    a.line([[28, 6], [28, 36]], ROPE, 2); for (let y = 10; y < 34; y += 6) a.line([[24, y], [32, y]], ROPE, 1);   // rope ladder
    a.rect(12, 8, 22, 14, 0xffd23f); a.px(17, 11, 0x1a1020); a.px(15, 11, 0x1a1020); a.px(19, 11, 0x1a1020);    // a sign: "..."
  });
  for (const open of [0, 1]) pixSprite(scene, 'cv_chest' + open, 40, 34, a => {
    a.rrect(3, 14, 37, 33, 2, WD); for (const x of [10, 30]) a.rect(x, 14, x + 2, 33, 0x4a5262);  // the box, iron bands
    if (open) { a.poly([[3, 14], [7, 2], [33, 2], [37, 14]], [0x7a4a1a, 0x5a3212, 0x3a2008]); a.ell(20, 14, 15, 4, GOLD); for (const [x, y] of [[12, 11], [20, 9], [27, 12]]) a.ell(x, y, 2.5, 2, 0xfffbe0); }
    else { a.rrect(3, 5, 37, 15, 4, WD); a.rect(3, 13, 37, 15, 0x4a5262); for (const x of [10, 30]) a.rect(x, 5, x + 2, 15, 0x4a5262); }
    a.rect(17, open ? 15 : 12, 23, open ? 20 : 18, GOLD[1]); a.px(20, open ? 17 : 15, 0x1a1020);     // the lock
  });
  pixSprite(scene, 'cv_gold', 22, 12, a => { a.ell(11, 9, 10, 3.5, GOLD); for (const [x, y] of [[6, 6], [11, 4], [16, 6], [9, 8], [14, 8]]) a.ell(x, y, 2.4, 2, GOLD); a.px(10, 3, 0xffffff); });
}

const CavernMixin = {
  cavernInit(data) {
    this.levelId = 8; this.def = makeCavernDef(data.cavern); R = this.def.radius || 420; this.waves = [];
    this.cvCrumbs = 0; this.cvDone = false; this.cvChest = null; this.cvGold = []; this.cvLbl = false; this.cvEntered = false; this.cvHomeBtn = null;
  },
  // a gold pile found: crumbs straight into the jar (they're yours even if you get knocked out)
  cavernLoot(L) {
    if (L.kind !== 'gold') return false;
    Meta.addCrumbs(L.val); this.cvCrumbs += L.val;
    for (let k = 0; k < 8; k++) { const im = this.add.image(0, 0, 'crumb').setDepth(9).setTint(0xffd23f); im.bsx = im.bsy = rnd(1, 1.6); this.parts.push({ theta: L.theta, h: 16, vt: rnd(-160, 160), vh: rnd(160, 360), life: 0.8, spr: im, rot: 0, rv: rnd(-10, 10) }); }
    Sound.sfx('pickup'); this.popup(L.theta, 60, '+' + L.val + ' GOLDEN CRUMBS', '#ffd23f', true);
    return true;
  },
  cavernUpdate(dt) {
    const C = this.cave, CV = this.def.cave; if (!C) return;
    makeCavernTextures(this);
    if (this.distText && !this.cvLbl) { this.cvLbl = true; this.distText.setText('TO THE TREASURE'); }
    if (C.rock && C.rock.alive) { C.rock.alive = false; if (this.labRock) this.labRock.setVisible(false); }   // the way in's already open
    // the gold piles sit on the floor until you reach them (the Labyrinth's loot handler pops them)
    for (const L of C.loot) {
      if (L.kind !== 'gold') continue;
      if (!L.spr) { L.spr = this.add.image(0, 0, 'cv_gold').setOrigin(0.5, 1).setDepth(5.6); L.spr.bsx = L.spr.bsy = 1.4; }
      const show = !L.taken && L.ring === C.ring; L.spr.setVisible(show); if (show) this.place(L.spr, L.theta, 0, 0);
    }
    // (v3.43) the treasure chests: one or two on every level, the BIG one in the vault. None of them ends the visit.
    if (C.ring > 0) this.cvEntered = true;
    if (this.cvEntered && C.ring === 0 && !this.cvLeaving) { this.banner('BACK UP TOP!'); this.cavernLeave(false); return; }   // jetted out of the hole: home
    for (const L of C.loot) {
      if (L.kind !== 'chest') continue;
      if (!L.spr) { L.spr = this.add.image(0, 0, 'cv_chest0').setOrigin(0.5, 1).setDepth(5.7); L.spr.bsx = L.spr.bsy = L.big ? 1.8 : 1.2; }
      const show = L.ring === C.ring; L.spr.setVisible(show); if (!show) continue;
      this.place(L.spr, L.theta, L.taken ? 0 : Math.abs(Math.sin(this.t * 2.5 + L.theta * 7)) * 2, 0);
      if (!L.taken && Math.random() < dt * (L.big ? 5 : 2)) this.burst(L.theta, L.big ? 34 : 22, 'spark', 1, 0.5);
      const P = this.pl;
      if (!L.taken && P.h < 40 && Math.abs(angDiff(P.theta, L.theta)) * R < (L.big ? 36 : 26)) this.cavernOpen(L);
    }
    this.cavernHud();
  },
  cavernOpen(L) {
    L.taken = true; L.spr.setTexture('cv_chest1');
    const n = L.val, th = L.theta; Meta.addCrumbs(n); this.cvCrumbs += n;
    Sound.sfx(L.big ? 'reveal' : 'shine'); Sound.sfx('power');
    if (L.big) { this.cameras.main.flash(250, 255, 230, 140); this.camPunch(0.05); }
    for (let k = 0; k < (L.big ? 30 : 12); k++) this.time.delayedCall(k * 40, () => { const im = this.add.image(0, 0, 'crumb').setDepth(9).setTint(k % 3 ? 0xffd23f : 0xffffff); im.bsx = im.bsy = rnd(1.2, 2); this.parts.push({ theta: th, h: 30, vt: rnd(-200, 200), vh: rnd(300, 560), life: 1.2, spr: im, rot: 0, rv: rnd(-12, 12) }); });
    const left = this.cave.loot.filter(q => q.kind === 'chest' && !q.taken).length;
    this.banner((L.big ? 'THE BIG ONE!\n+' : 'TREASURE! +') + n + ' GOLDEN CRUMBS' + (left ? '' : '\nALL THE CHESTS FOUND!'));
  },
  // the haul so far, and the way home
  cavernHud() {
    if (!this.cvHomeBtn) {
      const dev = typeof inputDevice === 'function' ? inputDevice() : 'kb';
      this.cvHomeBtn = this.add.text(0, 0, 'BACK TO CAMP' + (dev === 'pad' ? ' (SELECT)' : dev === 'touch' ? '' : ' [H]'), { fontFamily: PIXEL, fontSize: '8px', color: '#1a1020', backgroundColor: '#ffd23f', padding: { x: 6, y: 5 } })
        .setOrigin(1, 0).setDepth(30).setScrollFactor(0).setInteractive({ useHandCursor: true });
      this.cvHomeBtn.on('pointerup', () => this.cavernLeave(false));
      if (this.input.keyboard) this.input.keyboard.on('keydown-H', () => this.cavernLeave(false));
      this.cvPadOff = Pad.on(b => { if (b === 'back' || b === 'select') this.cavernLeave(false); });
      this.events.once('shutdown', () => { if (this.cvPadOff) this.cvPadOff(); this.cvPadOff = null; this.cvHomeBtn = null; });
    }
    this.cvHomeBtn.setPosition(this.W - 12, 96);
  },
  cavernLeave(died) {
    if (this.cvLeaving) return; this.cvLeaving = true;
    try { localStorage.setItem('lc_cave_ready', '0'); } catch (e) { /* ignore */ }
    this.cvChest = { taken: this.cave && this.cave.loot.some(q => q.kind === 'chest' && q.big && q.taken) };
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(530, () => { Sound.music(null); this.scene.start('level1', { camp: true, sum: { cavern: true, died, crumbs: this.cvCrumbs, chest: !!(this.cvChest && this.cvChest.taken) } }); });
  },
  // ---- at camp: the boulder, the hole, and the result card
  // (v3.43) the boulder rolls back over the hole every time the rats restock the cavern: shoot or bash it open, then just
  // walk over the hole and you drop in. Picked clean: the hole's there, boarded over, until the next run's done.
  campCaveInit() {
    makeCavernTextures(this);
    let found = false, ready = true; try { found = localStorage.getItem('lc_cave_found') === '1'; ready = localStorage.getItem('lc_cave_ready') !== '0'; } catch (e) { /* ignore */ }
    this.cvFound = found; this.cvReady = ready;
    const st = this.campSt.find(q => q.id === 'cave'); if (!st) return;
    const open = !this.toyOpen || this.toyOpen('cave');
    this.campCave = { st, hp: 6, wob: 0, next: 2, rock: null, open: false, on: open };
    this.cvStation = open && !ready;                                         // (only to say it's picked clean)
    st.a.spr.setVisible(open && (!ready || false));
    if (open && ready && this.textures.exists('labboulder')) { const r = this.add.image(0, 0, 'labboulder').setOrigin(0.5, 0.92).setDepth(2.5); r.bsx = r.bsy = 1.1; this.campCave.rock = { spr: r, theta: st.theta, h: 0, rot: 0 }; this.actors.push(this.campCave.rock); }
  },
  campCaveTick(dt) {
    const K = this.campCave; if (!K || !K.on) return;
    if (K.open) {                                                            // the hole's open: walk over it and down you go
      const P = this.pl;
      if (!this.campGo && P.h <= 2 && Math.abs(angDiff(P.theta, K.st.theta)) * R < 16) { P.theta = K.st.theta; P.vh = -200; this.campCaveGo(); }
      return;
    }
    if (!K.rock) return;
    K.next -= dt; if (K.next <= 0) { K.next = rnd(2.5, 5); K.wob = 0.6; this.burst(K.st.theta, 6, 'crumb', 4, 0.5); Sound.sfx('clunk'); if (Math.random() < 0.5) this.burst(K.st.theta, 30, 'spark', 3, 0.6); }   // ...a glint of gold?
    K.wob = Math.max(0, K.wob - dt); K.rock.rot = K.wob > 0 ? Math.sin(this.t * 38) * 0.07 * (K.wob / 0.6) : 0;
    K.flash = Math.max(0, (K.flash || 0) - dt); if (K.flash > 0) K.rock.spr.setTintFill(0xffffff); else K.rock.spr.clearTint();
  },
  campCaveHit(n) {
    const K = this.campCave; if (!K || !K.rock || K.open) return;
    K.hp -= n; K.flash = 0.06; K.wob = 0.3; Sound.sfx('clunk'); this.burst(K.st.theta, 30, 'crumb', 5, 0.7);
    if (K.hp <= 0) {
      K.open = true; K.rock.spr.setVisible(false); K.st.a.spr.setVisible(true);
      Sound.sfx('crash'); this.cameras.main.shake(300, 0.012); for (let k = 0; k < 4; k++) this.burst(K.st.theta, 20 + k * 10, 'crumb', 10, 1.2);
      const first = !this.cvFound; this.cvFound = true; try { localStorage.setItem('lc_cave_found', '1'); } catch (e) { /* ignore */ }
      this.time.delayedCall(500, () => { this.campSay(first ? 'A SECRET CAVERN! JUMP DOWN THE HOLE... IF YOU DARE.' : 'THE CAVERN\'S BEEN RESTOCKED! IN YOU GO.', 4); Sound.sfx('reveal'); });
    }
  },
  campCaveShot(b) {
    const K = this.campCave; if (!K || !K.rock || K.open) return false;
    if (Math.abs(angDiff(b.theta, K.st.theta)) * R > 28 || b.h > 70) return false;
    this.campCaveHit(1); return true;
  },
  campCaveBash(dir, cy) {
    const K = this.campCave; if (!K || !K.rock || K.open) return;
    const a = angDiff(K.st.theta, this.pl.theta) * dir * R; if (a < -10 || a > 70 || this.pl.h > 60) return;
    this.campCaveHit(2);
  },
  campCaveGo() {
    if (!this.cvReady) { this.campSay('IT\'S BEEN PICKED CLEAN. THE RATS RESTOCK IT AFTER EVERY RUN.', 4); Sound.sfx('clunk'); return; }
    if (this.campGo) return; this.campGo = { leave: true, t: 0 }; Sound.sfx('whoosh');
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(430, () => this.scene.start('level1', { cavern: Date.now(), autostart: true }));
  },
  cavernCard(S) {
    const lines = S.chest ? 'YOU FOUND THE TREASURE!' : S.died ? 'KNOCKED OUT - YOU CRAWLED BACK UP.' : 'BACK UP TOP.';
    this.campSay(lines + '  +' + S.crumbs + ' GOLDEN CRUMBS', 5);
    if (this.campCrumbT) this.campCrumbT.setText(String(Meta.crumbs()));
    Sound.sfx(S.chest ? 'reveal' : 'clunk');
  }
};
