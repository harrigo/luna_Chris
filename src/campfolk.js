// ================================================================= MOON CAMP FOLK (v3.08): the ranch has moved in
// The ranch folk from the intro have followed Chris to the moon. Walk up to one and press DOWN (or tap) to TALK:
//   BISCUIT     the space dog - follows Chris about, jumps, buries things
//   CLANK       the ranch robot - trundles about stacking crates, counts everything, deadpan
//   ZIB         the alien kid from next door - sits by the fire toasting cheese on a stick, hero-worships Chris
//   HENRIETTA   the space hen - pecks round the crates, thinks the rats are behind EVERYTHING
// Each has a first meeting, something to say after a death / a win / giving up, and a rotating set of chats (where
// they got to is remembered, lc_talk). Hades-style dialogue box: a portrait, a name plate, typewriter text; now and
// then they say something on their own in a little bubble.
const FOLK = {
  dog: { name: 'BISCUIT', title: 'SPACE DOG', tex: 'cf_dog', sc: 1.5, col: 0xa86a2a, theta: 0.14, home: [-0.6, 0.55], speed: 0.55,
    barks: ['ARF!', 'WOOF!', '*pant pant*', '*sniff*'],
    first: [['dog', 'WOOF! WOOF WOOF!'], ['chris', 'Biscuit! Who gave you a helmet? Good boy!'], ['dog', '(He drops a slobbery rat tail at your feet. It\'s a present.)']],
    died: [['dog', '(Biscuit licks your visor until you can\'t see a thing.)'], ['chris', 'Alright, alright! I\'m fine. Mostly.']],
    won: [['dog', 'AWOOOOOOOOO!'], ['chris', 'That\'s right, boy. We did it.']],
    quit: [['dog', '(He tilts his head. Even the dog knows you bottled it.)']],
    chat: [
      [['dog', '(Biscuit has buried something in the Gruyere. It looks like one of the Larder\'s jars.)'], ['chris', 'Don\'t tell Fridge-o-tron.']],
      [['dog', 'ARF! ARF!'], ['chris', 'No, you can\'t come. Rats are not for chasing. ...Well, they are. But not by you.']],
      [['dog', '(He tries to roll over. The helmet makes it very difficult.)']],
      [['dog', 'GRRRRR...'], ['chris', 'He growls every time a rat-ship goes over. Me too, mate. Me too.']],
      [['dog', '(Biscuit is chewing the noticeboard leg. Again.)']],
      [['dog', '*sniff sniff sniff*'], ['chris', 'He can smell Bessie on my suit. He misses her too.']]
    ] },
  bot: { name: 'CLANK', title: 'RANCH ROBOT', tex: 'cf_bot', sc: 1.5, col: 0xc8641a, theta: -2.05, home: [-2.15, -1.98], speed: 0.16,
    barks: ['BEEP.', 'STACKING.', '*WHIRRR*', 'COUNTING...'],
    first: [['bot', 'GREETINGS, CHRIS. I HAVE RELOCATED THE RANCH TO THIS MOON.'], ['chris', 'You moved the whole ranch?'], ['bot', 'I MOVED A TENT. THE RANCH EXCEEDED MY LIFTING CAPACITY.']],
    died: (c) => [['bot', 'STATUS: CHRIS. DECEASED ON ' + c.at + '. CURRENT STATUS: NOT DECEASED.'], ['bot', 'RECOMMENDATION: DIE LESS.']],
    won: [['bot', 'RUN RESULT: VICTORY.'], ['bot', 'I HAVE UPGRADED MY OPINION OF YOU FROM "ADEQUATE" TO "ADEQUATE PLUS".']],
    quit: [['bot', 'RUN RESULT: ABANDONED. I WILL LOG THIS AS "TACTICAL NAP".']],
    chat: [
      (c) => [['bot', 'RUNS ATTEMPTED: ' + c.runs + '. RUNS WON: ' + c.wins + '.'], ['bot', 'I AM NOT JUDGING. I AM COUNTING.']],
      [['bot', 'I HAVE STACKED THE CRATES. THEN UNSTACKED THEM. THEN STACKED THEM.'], ['chris', 'Are you bored, Clank?'], ['bot', 'I DO NOT GET BORED. I GET THOROUGH.']],
      [['bot', 'FRIDGE-O-TRON IS OVERCHARGING YOU BY 340 PERCENT.'], ['chris', 'Can you do anything about it?'], ['bot', 'NO. HE IS MY COUSIN.']],
      [['bot', 'THE HEN ASKED ME TO SCAN THE MOON FOR RATS.'], ['bot', 'RESULT: THE MOON IS MADE OF CHEESE. RAT RISK: HIGH.']],
      (c) => [['bot', 'YOU ARE CARRYING ' + c.crumbs + ' GOLDEN CRUMBS.'], ['bot', 'SPEND THEM OR I WILL FILE THEM.']],
      [['bot', 'WHEN BESSIE RETURNS I WILL MILK HER ON SCHEDULE. 06:00. 18:00.'], ['bot', 'I... HAVE MISSED THE SCHEDULE.']]
    ] },
  kid: { name: 'ZIB', title: 'KID FROM NEXT DOOR', tex: 'cf_kid', sc: 1.5, col: 0x3a9a2a, theta: 0.24, home: [0.24, 0.24], speed: 0, sit: true,
    barks: ['WHEEE!', 'PEW PEW!', 'Mister Chris!', 'Mmm, toasty.'],
    first: [['kid', 'MISTER CHRIS! Mum let me come to space camp!'], ['chris', 'Zib! Does your mum know the camp is on the MOON?'], ['kid', '...She knows it\'s a camp.']],
    died: (c) => [['kid', 'Did ' + c.boss + ' get you?! Was it SCARY?'], ['chris', 'Terrifying. Don\'t tell anyone.'], ['kid', 'I\'m telling EVERYONE.']],
    won: [['kid', 'YOU BEAT ALL OF THEM!'], ['kid', 'When I grow up I\'m gonna be a retired chef too!']],
    quit: [['kid', 'Are we having a rest day? I LOVE rest days.']],
    chat: [
      [['kid', 'I\'m toasting cheese on a stick! Want some?'], ['chris', 'It\'s on fire, Zib.'], ['kid', 'That\'s how I like it.']],
      (c) => [['kid', c.best ? 'You got to planet ' + c.best + '! That\'s like... more than one!' : 'Have you even been to a planet yet? I\'ve been to two. This one counts.']],
      [['kid', 'What\'s a Gorgonzola? Is it a monster?'], ['chris', 'Worse. It\'s a cheese.']],
      [['kid', 'Biscuit ate my homework. It was about space.'], ['chris', 'Then he\'s the cleverest dog in the galaxy.']],
      [['kid', 'Can I have your gun when you retire again?'], ['chris', 'Ask me in about forty years.']],
      [['kid', 'I drew the Rat King! ...It\'s a potato with a crown on.'], ['chris', 'That\'s honestly not far off.']]
    ] },
  hen: { name: 'HENRIETTA', title: 'SPACE HEN', tex: 'cf_hen', sc: 1.5, col: 0xb8b8c8, theta: 0.98, home: [0.9, 1.1], speed: 0.1,
    barks: ['Bawk.', 'BAWK?!', 'They\'re watching...', '*peck peck*'],
    first: [['hen', 'Bawk. They took the cow, Chris. The hens are next.'], ['chris', 'Henrietta, nobody wants to abduct a chicken.'], ['hen', 'That\'s what they WANT you to think.']],
    died: [['hen', 'Bawk! They got you too?! I KNEW it. It\'s all connected.']],
    won: [['hen', 'You won? ...Or is that what the rats WANT us to think?']],
    quit: [['hen', 'Smart. Lie low. They can\'t abduct what they can\'t find.']],
    chat: [
      [['hen', 'The moon is cheese. Who made it cheese, Chris? WHO?']],
      [['hen', 'I laid an egg in the rocket. For luck.'], ['chris', 'Right. Where in the rocket?'], ['hen', 'Don\'t sit down.']],
      [['hen', 'That fridge hums at night. Fridges don\'t hum.'], ['hen', '...Fridges DO hum. Never mind. Bawk.']],
      [['hen', 'I\'ve been tracking the rat ships. They go round. And round. It\'s a PATTERN.'], ['chris', 'That\'s called an orbit.'], ['hen', 'That\'s what they CALL it.']],
      [['hen', 'Bring Bessie home. She owes me a bucket of feed.']],
      [['hen', 'Bawk bawk.'], ['chris', '...'], ['hen', 'I just wanted to say bawk.']]
    ] }
};

function makeFolkTextures(scene) {
  if (scene.textures.exists('cf_dog0')) return;
  const FUR = [0xffd08a, 0xd0904a, 0x7a4a1a], GL = [0xf0faff, 0xc8eaff, 0x7ab0d8], ST = [0xeef2f8, 0x9aa4b4, 0x4a5262];
  // BISCUIT: a golden space dog in a bubble helmet - tail wag / tongue frames
  for (let f = 0; f < 2; f++) pixSprite(scene, 'cf_dog' + f, 44, 34, a => {
    a.line(f ? [[9, 18], [2, 9], [4, 5]] : [[9, 18], [3, 12], [1, 7]], FUR[1], 3);                                         // tail
    for (const [x, k] of [[11, 0], [16, 1], [26, 0], [31, 1]]) a.rect(x, 24 + (f && k ? -1 : 0), x + 3, 32 + (f && k ? -1 : 0), FUR[2]);   // legs
    a.ell(20, 20, 13, 8, FUR); a.ell(17, 18, 6, 3, 0xffe8c0); a.rect(13, 23, 30, 24, FUR[2]);                                  // body
    a.rect(28, 13, 33, 16, 0xd83a2a); a.ell(30, 17, 2, 2, 0xffd23f);                                                          // collar + tag
    a.ell(33, 10, 10, 9, GL); a.ell(33, 11, 7, 6, FUR); a.ell(38, 13, 3.5, 2.5, 0xffe8c0); a.ell(40.5, 12, 1.4, 1.2, 0x1a1020);    // helmet, head, snout
    a.ell(29, 8, 2.5, 4, FUR[2]); a.px(35, 9, 0x1a1020); a.px(34, 8, 0xffffff);                                               // ear, eye
    if (f) a.rect(37, 15, 38, 18, 0xff7a9a);                                                                                   // tongue
    a.px(30, 3, 0xffffff); a.px(29, 4, 0xffffff); a.rect(31, 18, 36, 19, ST[1]);                                               // shine, helmet ring
  });
  // CLANK: a boxy orange ranch robot on tank treads, one red eye, a milk churn under its arm
  for (let f = 0; f < 2; f++) pixSprite(scene, 'cf_bot' + f, 40, 52, a => {
    a.line([[20, 1], [20, 7]], ST[2]); a.ell(20, 2, 2, 2, f ? 0xff7070 : 0xff2020);
    a.rrect(9, 6, 31, 20, 3, ST); a.rect(12, 10, 28, 15, 0x1a1020); a.rect(17 + f * 2, 11, 21 + f * 2, 14, 0xff3030); a.px(18 + f * 2, 11, 0xffb0b0);
    a.rect(14, 20, 26, 22, ST[2]);
    a.rrect(6, 22, 34, 40, 4, [0xffb060, 0xff8a1a, 0xa8480a]); a.rect(11, 26, 29, 31, 0xffe27a); a.rect(13, 27, 15, 30, 0x2a8a2a); a.rect(18, 27, 20, 30, 0xd83a2a); a.rect(23, 27, 27, 30, 0x3a68d8);
    a.rect(10, 34, 30, 35, 0xa8480a);
    a.rrect(31, 24, 38, 38, 2, ST); a.rect(31, 27, 38, 28, ST[2]); a.rect(33, 22, 36, 24, ST[1]);                              // churn
    a.rect(1, 26, 6, 29, ST[1]); a.rect(0, 29, 3, 33, ST[2]);                                                                    // arm
    a.rrect(4, 40, 36, 50, 5, [0x5a6270, 0x3a3e4c, 0x1a1e28]); for (let x = 7 + f * 2; x < 34; x += 5) a.rect(x, 42, x + 1, 48, 0x6a7080);   // treads
  });
  // ZIB: the green alien kid in blue dungarees, sat cross-legged, toasting cheese on a stick (the cheese flickers)
  for (let f = 0; f < 2; f++) pixSprite(scene, 'cf_kid' + f, 40, 40, a => {
    a.line([[10, 6], [7, 1]], 0x2f8a1a); a.line([[18, 6], [21, 1]], 0x2f8a1a); a.ell(7, 1, 1.5, 1.5, 0xffd23f); a.ell(21, 1, 1.5, 1.5, 0xffd23f);
    a.ell(14, 12, 9, 8, [0xc8ffa0, 0x6fd84a, 0x2f8a1a]);
    a.ell(10.5, 12, 2.4, 3.2, 0x1a1020); a.ell(17.5, 12, 2.4, 3.2, 0x1a1020); a.px(10, 10, 0xffffff); a.px(17, 10, 0xffffff);
    a.line([[11, 17], [17, 17]], 0x1a5a0a); a.px(10, 16, 0x1a5a0a); a.px(18, 16, 0x1a5a0a);
    a.rrect(7, 20, 21, 32, 3, [0x8aacff, 0x4a6ae0, 0x24348a]); a.rect(9, 20, 10, 23, 0xffd23f); a.rect(18, 20, 19, 23, 0xffd23f);
    a.ell(6, 35, 7, 3, [0x8aacff, 0x4a6ae0, 0x24348a]); a.ell(22, 35, 7, 3, [0x8aacff, 0x4a6ae0, 0x24348a]); a.ell(1, 36, 2, 2, 0x2f8a1a); a.ell(27, 36, 2, 2, 0x2f8a1a);   // crossed legs
    a.ell(23, 25, 2.5, 2.5, 0x6fd84a); a.line([[24, 24], [37, 12]], 0x8a5a2a, 2);                                               // hand + stick
    a.ell(37, 11, 3, 2.6, f ? [0xffe890, 0xffb030, 0xa86a0a] : [0xfff0a0, 0xffc83a, 0xb87a10]); if (f) a.px(38, 8, 0xff8a1a);
  });
  // HENRIETTA: a white space hen in a fishbowl helmet - peck frame
  for (let f = 0; f < 2; f++) pixSprite(scene, 'cf_hen' + f, 30, 30, a => {
    a.line([[11, 22], [9, 29]], 0xff8a1a); a.line([[16, 22], [17, 29]], 0xff8a1a); a.rect(7, 28, 10, 29, 0xff8a1a); a.rect(16, 28, 19, 29, 0xff8a1a);
    a.ell(13, 17, 9, 7, [0xffffff, 0xe0e4ee, 0x9aa0b4]); a.ell(6, 14, 4, 4, [0xe0e4ee, 0xb8bccc, 0x7a8090]); a.ell(14, 18, 5, 3, 0xd8dce8);
    const hx = f ? 21 : 20, hy = f ? 14 : 8;
    a.ell(hx, hy, 6.5, 6.5, GL); a.ell(hx, hy + 1, 4, 4, [0xffffff, 0xe0e4ee, 0x9aa0b4]);
    a.rect(hx - 1, hy - 4, hx + 1, hy - 3, 0xe63946); a.rect(hx + 3, hy + 1, hx + 5, hy + 2, 0xffa21a); a.px(hx + 1, hy, 0x1a1020); a.px(hx - 3, hy - 4, 0xffffff);
  });
}

// the Hades-style dialogue box, for any scene: lines = [[who, text], ...] (who = 'chris' or a FOLK id)
function chatBar(scene, lines, opts) {
  opts = opts || {};
  makeFolkTextures(scene);
  const W = scene.scale.width, H = scene.scale.height, f = RUN_UI.f, small = H < 430, c = scene.add.container(0, 0).setDepth(60);
  const bw = Math.min(W - 16, 640), bh = small ? 96 : 120, bx = (W - bw) / 2, by = H - bh - (small ? 8 : 16), ps = bh - 20;
  const g = scene.add.graphics(); c.add(g);
  // the box: ink, gold frame, deep blue; a portrait well on the left; a name plate sitting on the top edge
  g.fillStyle(0x1a1020, 1).fillRect(bx - 4, by - 4, bw + 8, bh + 8); g.fillStyle(0xc8962a, 1).fillRect(bx - 2, by - 2, bw + 4, bh + 4); g.fillStyle(0xffd23f, 1).fillRect(bx - 2, by - 2, bw + 4, 2);
  g.fillStyle(0x121838, 0.97).fillRect(bx, by, bw, bh);
  for (let yy = by + 2; yy < by + bh; yy += 4) for (let xx = bx + ((yy >> 2) % 2) * 2; xx < bx + bw; xx += 4) g.fillStyle(0x1a2250, 1).fillRect(xx, yy, 1, 1);
  const pwell = scene.add.graphics(); c.add(pwell);
  const portrait = scene.add.image(bx + 10 + ps / 2, by + 10 + ps / 2, 'cf_dog0'); c.add(portrait);
  const plate = scene.add.graphics(); c.add(plate);
  const nameT = scene.add.text(0, 0, '', f(small ? 9 : 10, '#ffd23f', { stroke: '#2a0606', strokeThickness: 4 })); c.add(nameT);
  const titleT = scene.add.text(0, 0, '', f(6, '#ffd8b0', { strokeThickness: 2 })); c.add(titleT);
  const tx = bx + ps + 24, tw = bw - ps - 36;
  const body = scene.add.text(tx, by + (small ? 14 : 18), '', f(small ? 8 : 9, '#ffffff', { strokeThickness: 3, wordWrap: { width: tw }, lineSpacing: small ? 5 : 7 })); c.add(body);
  if (opts.header) c.add(scene.add.text(bx + bw - 10, by - 4, opts.header, f(7, '#7dff8a', { strokeThickness: 3 })).setOrigin(1, 1));
  const more = scene.add.text(bx + bw - 10, by + bh - 8, '', f(7, '#ffd23f', { strokeThickness: 3 })).setOrigin(1, 1); c.add(more);
  const chris = scene.textures.exists('portrait');
  let li = -1, shown = 0, full = '', dead = false;
  const show = () => {
    li++; if (li >= lines.length) { close(); return; }
    const [who, txt] = lines[li], isChris = who === 'chris', D = isChris ? null : FOLK[who] || FOLK.dog;
    full = txt; shown = 0; body.setText('');
    const tone = isChris ? 0x2a4a8a : D.col;
    pwell.clear(); pwell.fillStyle(0x1a1020, 1).fillRect(bx + 8, by + 8, ps + 4, ps + 4); pwell.fillStyle(tone, 1).fillRect(bx + 10, by + 10, ps, ps);
    pwell.fillStyle(0x000000, 0.25).fillRect(bx + 10, by + 10 + ps * 0.62, ps, ps * 0.38); pwell.fillStyle(0xffffff, 0.12).fillRect(bx + 10, by + 10, ps, 3);
    if (isChris) { portrait.setTexture(chris ? 'portrait' : 'c_head').setFlipX(false); RUN_UI.fit(portrait, ps * 0.92); }
    else { portrait.setTexture(D.tex + (D.sit ? 0 : 1)).setFlipX(false); RUN_UI.fit(portrait, ps * 0.86); }
    const nm = isChris ? 'CHRIS' : D.name, tl = isChris ? 'RETIRED CHEF' : D.title;
    nameT.setText(nm); titleT.setText(tl);
    const pw = Math.max(nameT.width, titleT.width) + 20, px = tx - 6, py = by - 14;
    plate.clear(); plate.fillStyle(0x1a1020, 1).fillRect(px - 2, py - 2, pw + 4, 26); plate.fillStyle(0xc8962a, 1).fillRect(px - 1, py - 1, pw + 2, 24); plate.fillStyle(0x5a140a, 1).fillRect(px, py, pw, 22); plate.fillStyle(0x8a2a1a, 1).fillRect(px, py, pw, 2);
    nameT.setPosition(px + 10, py + 2); titleT.setPosition(px + 10, py + 14);
    Sound.sfx(isChris ? 'jump' : (who === 'dog' ? 'flap' : 'pickup'));
    if (opts.onLine) opts.onLine(who);
  };
  const next = () => { if (dead || scene.time.now - opened < 250) return; if (shown < full.length) { shown = full.length; body.setText(full); return; } show(); };
  const close = () => { if (dead) return; dead = true; window.removeEventListener('keydown', onKey); padOff(); scene.input.off('pointerup', next); scene.events.off('update', tick);
    scene.tweens.add({ targets: c, alpha: 0, duration: 150, onComplete: () => c.destroy() });
    if (opts.onClose) opts.onClose(); };
  const onKey = e => { if (['Enter', ' ', 'ArrowDown', 's', 'S', 'z', 'Z', 'x', 'X'].includes(e.key)) next(); else if (e.key === 'Escape') close(); };
  const tick = (time, dms) => {
    if (dead) return;
    if (shown < full.length) { shown = Math.min(full.length, shown + dms / 1000 * 55); body.setText(full.slice(0, Math.floor(shown))); if (Math.floor(shown) % 4 === 0) { /* (quiet blips) */ } }
    more.setText(shown >= full.length ? (li < lines.length - 1 ? 'NEXT >' : 'DONE') : '').setAlpha(0.6 + 0.4 * Math.sin(time / 150));
  };
  const opened = scene.time.now, padOff = Pad.on(b => { if (b === 'a' || b === 'down') next(); else if (b === 'b' || b === 'back') close(); });
  window.addEventListener('keydown', onKey); scene.input.on('pointerup', next); scene.events.on('update', tick);
  scene.events.once('shutdown', () => { if (!dead) { dead = true; window.removeEventListener('keydown', onKey); padOff(); scene.events.off('update', tick); scene.input.off('pointerup', next); } });
  c.setAlpha(0); scene.tweens.add({ targets: c, alpha: 1, duration: 150 });
  show();
  return { close };
}

Object.assign(CampMixin, {
  campFolkInit() {
    makeFolkTextures(this);
    this.campFolk = Object.keys(FOLK).map(id => {
      const d = FOLK[id], spr = this.add.image(0, 0, d.tex + '0').setOrigin(0.5, 1).setDepth(2.55); spr.bsx = spr.bsy = d.sc;
      const a = { spr, theta: d.theta + (d.sit ? 0 : rnd(-0.05, 0.05)), h: 0, rot: 0 }; this.actors.push(a);
      const bub = this.add.text(0, 0, '', RUN_UI.f(7, '#1a1020', { stroke: '#1a1020', strokeThickness: 0, backgroundColor: '#ffffff', padding: { x: 4, y: 3 } })).setOrigin(0.5, 1).setDepth(18).setVisible(false);
      return { id, d, a, spr, bub, bubT: 0, dir: 1, tgt: a.theta, wait: rnd(0.5, 2), vh: 0, name: d.name, verb: 'TALK', folk: true };
    });
    this.campBarkT = rnd(3, 6); this.campTalked = {};
    for (const F of this.campFolk) F.mark = this.add.text(0, 0, '!', RUN_UI.f(14, '#ffd23f', { stroke: '#5a0a0a', strokeThickness: 5 })).setOrigin(0.5, 1).setDepth(18);
    this.campFolkNews();
  },
  campCtx() {
    const S = this.campSum, st = Meta.stats(), b = Run.best(), at = S && LEVELS[S.at];
    return { runs: st.runs, wins: st.wins, best: b ? b.planets : 0, crumbs: Meta.crumbs(), at: at ? (at.short || at.name).toUpperCase() : 'A ROCK', boss: at ? at.bossName.toLowerCase().replace(/(^|\s)\S/g, m => m.toUpperCase()) : 'a rat' };
  },
  campFolkUpdate(dt) {
    const P = this.pl, talking = this.campChat;
    for (const F of this.campFolk) {
      const d = F.d, A = F.a;
      if (talking && talking.F === F) { F.dir = Math.sign(angDiff(A.theta, P.theta)) || F.dir; }
      else if (d.speed > 0) {
        // (v3.32) Biscuit no longer glues himself to Chris (he got underfoot, and flicked about when you stood on him):
        // he roams round the fire, and when the beach ball's near he chases it and noses it about
        // ...and now and then, when you come up to him, he tags along at your heels for 5-10 seconds, then wanders off
        let bt = F.id === 'dog' && !this.campGo && this.ballDogTarget ? this.ballDogTarget(F) : null;
        if (F.id === 'dog' && bt === null && !this.campGo) {
          F.followCd = Math.max(0, (F.followCd || 0) - dt);
          if (F.followT > 0) {
            F.followT -= dt; if (F.followT <= 0) { F.followCd = rnd(8, 15); F.wait = 0; F.tgt = A.theta; }
            if (Math.abs(P.vx || 0) > 25 || F.heel === undefined) F.heel = P.facing || 1;          // (which side to sit only changes when you walk - no flip-flopping)
            bt = wrap(P.theta - F.heel * 0.12);
          } else if (F.followCd <= 0 && Math.abs(angDiff(A.theta, P.theta)) < 0.3) {
            if (Math.random() < 0.5) { F.followT = rnd(5, 10); F.vh = 260; } else F.followCd = rnd(4, 8);
          }
        }
        if (bt !== null) { F.tgt = bt; F.wait = rnd(1, 2.5); }
        else if ((F.wait -= dt) <= 0 && Math.abs(angDiff(F.tgt, A.theta)) < 0.01) { F.tgt = d.home[0] + Math.random() * (d.home[1] - d.home[0]); F.wait = rnd(1.5, 4); }
        const df = angDiff(F.tgt, A.theta);
        if (Math.abs(df) > (bt !== null && F.followT > 0 ? 0.03 : 0.01)) { const sp = d.speed * (F.id === 'dog' && (Math.abs(df) > 0.3 || bt !== null) ? 1.8 : 1); A.theta = wrap(A.theta + Math.sign(df) * Math.min(Math.abs(df), sp * dt)); F.dir = Math.sign(df); F.moving = true; }
        else F.moving = false;
        if (F.id === 'dog' && A.h <= 0 && Math.random() < dt * 0.25) F.vh = 260;          // a happy hop now and then
      }
      if (F.vh || A.h > 0) { F.vh -= 900 * dt; A.h = Math.max(0, A.h + F.vh * dt); if (A.h === 0) F.vh = 0; }
      if (F.bubT > 0) { F.bubT -= dt; if (F.bubT <= 0) F.bub.setVisible(false); }
    }
    // a bark now and then from whoever's close
    if (!talking && (this.campBarkT -= dt) <= 0) {
      this.campBarkT = rnd(5, 9);
      const near = this.campFolk.filter(F => Math.abs(angDiff(F.a.theta, P.theta)) < 0.75);
      if (near.length) { const F = near[Math.floor(Math.random() * near.length)]; F.bub.setText(F.d.barks[Math.floor(Math.random() * F.d.barks.length)]).setVisible(true); F.bubT = 2; if (F.id === 'dog') Sound.sfx('flap'); }
    }
  },
  campFolkDraw() {
    const t = this.t;
    for (const F of this.campFolk) {
      const fr = F.id === 'kid' ? Math.floor(t * 3) % 2 : F.id === 'hen' ? (F.moving ? Math.floor(t * 6) % 2 : (Math.sin(t * 1.7 + 2) > 0.7 ? 1 : 0)) : F.id === 'bot' ? (F.moving ? Math.floor(t * 8) % 2 : Math.floor(t * 1.5) % 2) : (F.moving || this.campChat && this.campChat.F === F ? Math.floor(t * 10) % 2 : Math.floor(t * 4) % 2);
      F.spr.setTexture(F.d.tex + fr).setFlipX(F.dir < 0);
      if (F.bub.visible) { const b = F.spr.getBounds(); F.bub.setPosition(b.centerX, b.y - 4).setAlpha(F.spr.visible ? 1 : 0); }
      { const b = F.spr.getBounds(), on = F.news && !F.bub.visible && !(this.campChat && this.campChat.F === F); F.mark.setVisible(on).setPosition(b.centerX, b.y - 4 + Math.sin(t * 6 + F.a.theta * 9) * 3); }
    }
  },
  campFolkNear() {
    const P = this.pl; let best = null, bd = 1e9;
    for (const F of this.campFolk) { const d = Math.abs(angDiff(P.theta, F.a.theta)) * R; if (d < bd) { bd = d; best = F; } }
    return bd < 34 && P.h < 60 ? { F: best, d: bd } : null;
  },
  // ---- the conversation
  campTalk(F) {
    const d = F.d, c = this.campCtx(), S = this.campSum, seen = Meta._j('lc_talk', {}), me = seen[F.id] || { met: false, i: 0 };
    let lines;
    const news = storyNext(F.id);
    if (!me.met) lines = d.first;
    else if (S && !this.campTalked[F.id]) lines = d[S.how] || d.chat[0];
    else if (news) { lines = STORY[news][F.id]; me.story = (me.story || []).concat([news]); }     // (v3.13) something new to say about a planet
    else { lines = d.chat[me.i % d.chat.length]; me.i++; }
    me.met = true; seen[F.id] = me; Meta._s('lc_talk', seen); this.campTalked[F.id] = true;
    if (typeof lines === 'function') lines = lines(c);
    F.bub.setVisible(false);
    this.campChatOpen(F, lines);
    this.campFolkNews();
  },
  // who has something new to say: a first hello, a reaction to the last run, or a planet they've not talked about yet
  campFolkNews() {
    const seen = Meta._j('lc_talk', {});
    for (const F of this.campFolk) F.news = !(seen[F.id] && seen[F.id].met) || (this.campSum && !this.campTalked[F.id]) || !!storyNext(F.id);
  },
  campChatOpen(F, lines) {
    this.state = 'campmenu'; this.pl.vx = 0; this.pl.firing = 0;
    const bar = chatBar(this, lines, {
      onLine: who => { if (who !== 'chris') { const P = this.pl; P.facing = Math.sign(angDiff(F.a.theta, P.theta)) || P.facing; } },
      onClose: () => { this.campChat = null; this.state = 'play'; this.campCool = 0.4; this.campDownHeld = true; }
    });
    this.campChat = { F, close: bar.close };
  }
});

// ---------------------------------------------------------------- the story, as camp talk (v3.13)
// Every planet Chris clears - in the campaign or on a run - gives each of the folk something new to say about it, and
// the whole camp slowly works out what the rats want with Bessie: from "why a COW?", through ghost cows, planets filled
// from the inside and grated for snacks, to the Labyrinth (a moon-sized tank of Bessie's milk curdling into new cheese)
// and Parmesan Prime (the rats have eaten their own homeworld - they're running out of world). A gold "!" bobs over
// anyone with something new to say. Fridge-o-tron's greeting picks up the latest news too.
const STORY = {
  1: { kid: [['kid', 'You beat the Croque Monsieur?! Was he crunchy?'], ['chris', 'Very. Then a rat-ship snatched Bessie right out from under me.'], ['kid', 'But why would rats want a COW?']],
       hen: [['hen', 'A cow. Out of every animal on that ranch, they took the cow.'], ['hen', 'Think about that, Chris.'], ['chris', 'I\'m trying very hard not to.']],
       bot: [['bot', 'ANALYSIS: RATS DO NOT DRINK MILK IN THESE QUANTITIES.'], ['bot', 'THEIR INTEREST IN BESSIE IS... ILLOGICAL. I DO NOT LIKE ILLOGICAL.']],
       dog: [['dog', '(Biscuit sniffs the Croque crumbs on your boots, then howls at the patch of sky the rat-ship went through.)']],
       fridge: 'RATS STEALING COWS NOW? WHAT NEXT, FRIDGES?' },
  2: { bot: [['bot', 'THE BARON\'S SWAMP WAS FARMED, CHRIS. ROWS. DITCHES. IRRIGATION.'], ['bot', 'THE RATS ARE NOT JUST EATING CHEESE. THEY ARE GROWING IT.']],
       hen: [['hen', 'Blue mould. That\'s how it starts.'], ['hen', 'First the mould. Then the cows. Then the HENS.']],
       kid: [['kid', 'Mum says blue cheese is just cheese that went wrong.'], ['chris', 'Your mum\'s right about the Baron.']],
       fridge: 'GORGONZOLA PRICES ARE UP. SOMEBODY\'S BUYING IN BULK.' },
  3: { kid: [['kid', 'Was the Brie-muda Triangle really full of ghost COWS?'], ['chris', 'Old ones. From farms all over the galaxy.'], ['kid', '...So Bessie isn\'t the first.']],
       bot: [['bot', 'SHIP LOGS RECOVERED FROM THE BRIE: 212 COWS ABDUCTED. 0 RETURNED.'], ['bot', 'I HAVE STOPPED COUNTING.'], ['bot', '...NO. I HAVE NOT.']],
       hen: [['hen', 'A graveyard. Of COWS. I said it. I SAID it.'], ['hen', 'Nobody ever listens to a hen.']],
       dog: [['dog', '(Biscuit sleeps with one eye open tonight. He keeps whimpering at the brie on your boots.)']] },
  4: { bot: [['bot', 'THE VOLCANO WAS ERUPTING MOZZARELLA. NOT ROCK.'], ['bot', 'SOMEBODY HAS BEEN FILLING THESE PLANETS WITH CHEESE. FROM THE INSIDE.']],
       kid: [['kid', 'Bessie was INSIDE the cheese?'], ['chris', 'Right in the middle of it. Like they\'d been... topping the planet up with her.'], ['kid', 'Ew. And also: whoa.']],
       dog: [['dog', '(Biscuit is licking melted mozzarella off your suit. He thinks the volcano was the best day of his life.)']],
       fridge: 'MOZZARELLA ON TAP FROM A VOLCANO? I WANT A CUT.' },
  5: { bot: [['bot', 'THE GREAT GRATER WAS A FACTORY. INPUT: WHOLE PLANETS. OUTPUT: RAT SNACKS.'], ['bot', 'THROUGHPUT: ALARMING.']],
       hen: [['hen', 'They grate PLANETS, Chris. If they\'ll grate a planet, what d\'you think they\'d do to a hen?'], ['chris', '...Grate you?'], ['hen', 'GRATE ME.']],
       kid: [['kid', 'If they grate whole planets... what happens when they run out?'], ['chris', 'Good question, Zib. Really good question.']],
       fridge: 'PARMESAN\'S DOUBLED IN PRICE. SOMEONE\'S RUNNING SHORT.' },
  6: { kid: [['kid', 'The whole moon was one big canyon? Who dug it?'], ['chris', 'Nobody dug it, Zib. It got eaten.']],
       bot: [['bot', 'CHEDDAR GORGE: 70 PERCENT OF THE MOON CONSUMED.'], ['bot', 'THE RATS DO NOT FARM PLANETS. THEY FINISH THEM.']],
       hen: [['hen', 'Eat a moon down to a ring, then go looking for another one. That\'s a pattern, Chris.'], ['chris', 'For once I think you might be right.']],
       dog: [['dog', '(Biscuit buries a chunk of cheddar canyon by the tent. Saving it. Just in case.)']] },
  7: { bot: [['bot', 'THE ARMADA WAS A SUPPLY FLEET. THE HOLDS WERE EMPTY. WAITING.'], ['bot', 'WAITING FOR A CARGO OF... MILK?']],
       hen: [['hen', 'A whole navy. You don\'t build a navy for one cow, Chris.'], ['hen', 'You build it to carry everything that cow MAKES.']],
       dog: [['dog', '(Biscuit is wearing a little rat sailor\'s hat. You decide not to ask where he got it.)']],
       kid: [['kid', 'Did you really dive under a battleship?'], ['chris', 'Three times. Hit it in the keel.'], ['kid', 'I\'m gonna be SO good at swimming.']],
       fridge: 'A WHOLE FLEET OF EMPTY TANKERS. SOMEONE\'S EXPECTING A DELIVERY.' },
  8: { bot: [['bot', 'THE LABYRINTH WAS NOT A MOON, CHRIS. IT WAS A TANK.'], ['bot', 'PIPES. PUMPS. ALL OF IT FULL OF BESSIE\'S MILK, CURDLING INTO NEW CHEESE.'], ['bot', 'CONCLUSION: THEY ARE NOT EATING HER. THEY ARE USING HER TO GROW PLANETS.']],
       hen: [['hen', 'Pumping a whole moon full of Bessie\'s milk.'], ['hen', 'I\'d say I told you so, Chris.'], ['chris', 'Go on then.'], ['hen', 'I TOLD YOU SO. Bawk.']],
       kid: [['kid', 'So Bessie\'s milk makes... planets?'], ['chris', 'Best milk in the galaxy. One cow, a whole moon of Swiss.'], ['kid', 'That\'s the coolest and the saddest thing I ever heard.']],
       dog: [['dog', '(Biscuit won\'t leave the tent tonight. He\'s lying with his nose on Bessie\'s old bell.)']],
       fridge: 'A MOON FULL OF MILK. HOLY COW. NO, REALLY. HOLY COW.' },
  9: { bot: [['bot', 'PARMESAN PRIME. THE RAT HOMEWORLD. GRATED DOWN TO 40 PERCENT OF ITS SIZE.'], ['bot', 'THEY HAVE BEEN EATING THEIR OWN PLANET, CHRIS.'], ['bot', 'THAT IS WHY THEY NEED BESSIE. THEY ARE RUNNING OUT OF WORLD.']],
       kid: [['kid', 'Their whole planet was falling to bits...'], ['kid', 'Is it bad that I feel a bit sorry for the rats?'], ['chris', 'No, Zib. That makes you a better chef than most.']],
       hen: [['hen', 'They ate their OWN planet.'], ['hen', '...Bawk. Even I didn\'t see that one coming.']],
       dog: [['dog', '(Biscuit growls at the parmesan dust on your boots. Then sneezes. Then growls again, more quietly.)']],
       fridge: 'THEY ATE THEIR OWN HOMEWORLD. TERRIBLE FOR BUSINESS.' },
  10: { kid: [['kid', 'You beat the RAT KING! Is Bessie coming home now?'], ['chris', 'Soon, Zib. Soon.']],
        bot: [['bot', 'RAT KING: DEFEATED. BESSIE: STILL NOT ON SCHEDULE.'], ['bot', '06:00. 18:00. I WILL WAIT.']],
        hen: [['hen', 'The King\'s beaten. But who was the King working for, Chris?'], ['chris', 'Henrietta...'], ['hen', 'Just saying.']],
        dog: [['dog', '(Biscuit has dug up Bessie\'s bell and taken it to the rocket. He\'s sitting next to it. Waiting.)']],
        fridge: 'THE KING\'S GONE? WHO\'S GOING TO PAY THEIR TAB?' }
};
// who radios in from camp after each campaign planet (their camp line about it is then 'heard')
const STORY_RADIO = { 1: 'kid', 2: 'bot', 3: 'kid', 4: 'bot', 5: 'hen', 6: 'kid', 7: 'hen', 8: 'bot', 9: 'bot', 10: 'dog' };
// the planets Chris has cleared: the campaign's, and any cleared on a run
function storySeen() {
  const s = new Set(Meta._j('lc_run_seen', []));
  for (let i = 1; i <= Math.min(10, Progress.best); i++) s.add(i);
  return [...s].filter(id => STORY[id]).sort((a, b) => a - b);
}
function storyNext(fid) {
  const me = Meta._j('lc_talk', {})[fid] || {}, done = me.story || [];
  return storySeen().find(id => STORY[id][fid] && !done.includes(id));
}
