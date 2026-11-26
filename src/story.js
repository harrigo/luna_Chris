// ================================================================= THE STORY OF MOON CAMP (v3.132)
// Camp starts almost empty: the tent, the fire, the rocket, the way out, and Biscuit. Everything else is BROUGHT HOME
// by someone you find out on the runs:
//   - FRIDGE-O-TRON is met at the run's SHOP stop (on the road after planet 2 or 3). He brings THE LARDER.
//   - everyone else turns up at the END OF A PLANET in a run: the planet they've been stranded on. Each planet has a
//     queue (Gruyere Globe: Clank, then Zib; Gorgonzola Gulch: Henrietta, then Granny Gouda...), so who you meet, and in
//     what order, depends on the paths you take.
//   - at most ONE new arrival a run (and none until you've met Fridge-o-tron, so the first run is just the shop).
//   - what they bring isn't there straight away: it goes up as a CONSTRUCTION SITE (scaffolding, a sign) and is
//     finished at the end of your NEXT run - and only once CLANK is home to build it.
//   - BONUS STOPS on the road only start once Louise's Moon Bar is open (they're its arcade cabinets).
// State: lc_story { home: { id: run# }, building: [{ f, at }], built: { feature: true }, runN }
// Saves from before this existed that had already played runs get everyone home and everything built (legacy).
const STORY_CAST = [
  { id: 'fridge', via: 'shop', brings: ['larder'] },
  { id: 'bot', planet: 1, brings: ['train', 'tower'] },
  { id: 'kid', planet: 1, after: 'bot', brings: ['lunch', 'toys'] },
  { id: 'hen', planet: 2, brings: ['board', 'scope'] },
  { id: 'gouda', planet: 2, after: 'hen', brings: ['cave', 'garden'] },
  { id: 'louise', planet: 3, brings: ['bar'] },
  { id: 'dj', planet: 4, brings: ['juke'] },
  { id: 'sprocket', planet: 5, brings: ['clay'] },
  { id: 'stilton', planet: 6, brings: ['rush'] },
  { id: 'feta', planet: 7, brings: ['sky'] }
];
const STORY_FEATURE = { larder: 'THE LARDER', train: 'THE TRAINING DUMMY', tower: 'THE CRATE TOWER', lunch: 'THE LUNCHBOX', toys: 'THE CAMP TOYS', board: 'THE NOTICEBOARD',
  scope: 'THE TELESCOPE', cave: 'THE SECRET CAVERN', garden: 'THE CHEESE PATCH', bar: 'THE MOON BAR', juke: 'THE JUKEBOX', clay: 'THE CLAY CHEESE TRAP', rush: 'THE BOSS GATE', sky: 'A SECRET IN THE SKY' };
const Story = {
  _st: null,
  st() {
    if (this._st) return this._st;
    let s = null; try { s = JSON.parse(localStorage.getItem('lc_story') || 'null'); } catch (e) { /* */ }
    if (!s) {
      s = { home: {}, building: [], built: {}, runN: 0 };
      const legacy = (Meta.stats().runs || 0) > 0 && !localStorage.getItem('lc_story_fresh');
      if (legacy) for (const c of STORY_CAST) { s.home[c.id] = 0; for (const f of c.brings) s.built[f] = true; }
      this._st = s; this.save();
    }
    return (this._st = s);
  },
  save() { try { localStorage.setItem('lc_story', JSON.stringify(this._st)); } catch (e) { /* */ } },
  reset() { this._st = { home: {}, building: [], built: {}, runN: 0 }; this.save(); try { localStorage.setItem('lc_story_fresh', '1'); } catch (e) { /* */ } },
  home(id) { return id === 'dog' || this.st().home[id] !== undefined; },
  built(f) { return typeof Progress !== 'undefined' && Progress.testMode ? true : !!this.st().built[f]; },
  building(f) { return this.st().building.some(b => b.f === f); },
  owner(f) { return STORY_CAST.find(c => c.brings.includes(f)); },
  // a character comes home: their things go up as construction sites (the Larder is a stall: he sets it up himself)
  bring(id) {
    const S = this.st(), c = STORY_CAST.find(q => q.id === id); if (!c || this.home(id)) return false;
    S.home[id] = S.runN;
    for (const f of c.brings) { if (id === 'fridge') S.built[f] = true; else S.building.push({ f, at: S.runN }); }
    if (typeof Run !== 'undefined') Run.arrived = id;
    this.save(); return true;
  },
  // the shop stop: meeting Fridge-o-tron (true = the first time)
  onShop() { return this.bring('fridge'); },
  // the end of a planet in a run: who's waiting there? (null = nobody new this time)
  arrival(levelId) {
    if (typeof Run === 'undefined' || !Run.on || Run.arrived || !this.home('fridge')) return null;
    const c = STORY_CAST.find(q => q.planet === levelId && !this.home(q.id) && (!q.after || this.home(q.after)));
    if (!c) return null;
    this.bring(c.id); return c.id;
  },
  // the end of a run: building work finishes on everything started BEFORE this run (if Clank's home to build it)
  runEnded() {
    const S = this.st(); S.runN++;
    if (this.home('bot')) { const done = S.building.filter(b => b.at < S.runN - 1); for (const b of done) S.built[b.f] = true; S.building = S.building.filter(b => !(b.at < S.runN - 1)); }
    this.save();
  },
  // things finished since you last looked (for the camp to announce)
  fresh() { const S = this.st(), seen = S.seen || {}, out = Object.keys(S.built).filter(f => !seen[f]); return out; },
  markSeen(fs) { const S = this.st(); S.seen = S.seen || {}; for (const f of fs) S.seen[f] = 1; this.save(); }
};

// ---- the new folk: Granny Gouda, Sprocket, Captain Stilton, Madame Feta live round the camp; Louise and DJ
// Camembeat live in the Moon Bar (camp: false). Fridge-o-tron is the camp's shopkeeper (drawn by runhub.js).
Object.assign(FOLK, {
  fridge: { name: 'FRIDGE-O-TRON', title: 'TRAVELLING SHOPKEEPER', tex: 'shopbot', sc: 1.3, col: 0x3a8a9a, camp: false, sit: true,
    first: [['fridge', 'HALT, CUSTOMER! WELCOME TO FRIDGE-O-TRON\'S ROADSIDE EMPORIUM.'], ['chris', 'A shop. In the middle of space.'], ['fridge', 'LOCATION, LOCATION, LOCATION. I GO WHERE THE CHEDDAR GOES.'], ['fridge', 'I WILL ALSO BE FOLLOWING YOU HOME. FOR... BUSINESS REASONS.']] },
  louise: { name: 'LOUISE', title: 'THE HOSTESS', tex: 'lou_idle', sc: 1, col: 0xc8302a, camp: false, sit: true,
    first: [['louise', 'Well HELLO, sailor! Are you the cavalry?'], ['chris', 'Retired chef. Same thing, these days. What happened here?'], ['louise', 'This was the Lucky Lactose - finest showboat in the galaxy. The rats sank her for the slot machines.'],
      ['louise', 'I saved the best one. And Ridic Louise, darling, needs a BAR.'], ['chris', 'Camp\'s got a robot who builds things. Probably.']] },
  dj: { name: 'DJ CAMEMBEAT', title: 'PARTY RAT', tex: 'cf_dj', sc: 1.5, col: 0x8a3ac8, camp: false, sit: true,
    first: [['dj', 'YO YO YO! Don\'t shoot the DJ, man! I\'m out! I QUIT the rats!'], ['chris', 'A rat. Who quit.'], ['dj', 'They made me play VOLCANO TECHNO, dude. Fourteen hours. Same beat. Every day.'],
      ['dj', 'You got a bar back home? I got decks. And a jukebox I may have... borrowed.']] },
  gouda: { name: 'GRANNY GOUDA', title: 'CHEESE PROSPECTOR', tex: 'cf_gouda', sc: 1.5, col: 0xc8902a, theta: 1.5, home: [1.45, 1.58], speed: 0.06,
    barks: ['Hrmph.', 'There\'s cheese down there.', '*tap tap*', 'In MY day...'],
    first: [['gouda', 'Don\'t just STAND there, sonny, pull me OUT of this goop!'], ['chris', '...How long have you been stuck in there?'], ['gouda', 'Since Tuesday. Which Tuesday, I couldn\'t tell you.'],
      ['gouda', 'Sixty years I\'ve prospected cheese. Your moon\'s got a seam under it. I can smell it. I\'m coming with you.']],
    died: [['gouda', 'Back already? Hrmph. In my day we died PROPERLY. Once.']],
    won: [['gouda', 'Ha! Not bad, sonny. Not bad at all. Now help me with this pickaxe.']],
    quit: [['gouda', 'Gave up, did you? I once dug for nine years with a teaspoon.']],
    chat: [[['gouda', 'There\'s a cavern under this moon, chock full of rats and cheese. I dug us a way in.'], ['chris', 'Is that... safe?'], ['gouda', 'No.']],
      [['gouda', 'This cheese patch\'ll grow anything. Except patience. That\'s on you.']],
      [['gouda', 'Your hen thinks the rats are behind everything.'], ['gouda', 'She\'s not WRONG, mind.']],
      [['gouda', 'Found a fossil in the Gorgonzola once. Turned out to be a crouton.']]] },
  sprocket: { name: 'SPROCKET', title: 'RAT MECHANIC', tex: 'cf_sprocket', sc: 1.5, col: 0x6a7a8a, theta: -2.45, home: [-2.5, -2.32], speed: 0.1,
    barks: ['*clank*', 'Hold this.', 'Nearly...', 'Who touched my spanner?'],
    first: [['sprocket', 'Easy! EASY! I\'m a mechanic, not a fighter! I fix the grater, that\'s all!'], ['chris', 'You fix the thing that tried to grate me.'], ['sprocket', '...Yeah. Sorry about that.'],
      ['sprocket', 'Look, they don\'t pay me in cheese, they pay me in RIND. Take me with you. I can build you a trap that throws cheese.'], ['chris', 'Why would I want--'], ['sprocket', 'For SPORT.']],
    died: [['sprocket', 'You came back in bits? I can work with bits.']],
    won: [['sprocket', 'Rat King\'s gone? Then I\'m officially unemployed. BEST. DAY.']],
    quit: [['sprocket', 'Tactical retreat. Good. Gives me time to oil the trap.']],
    chat: [[['sprocket', 'The clay cheese trap\'s tuned to 40 miles an hour. Pull!'], ['chris', 'That seems fast.'], ['sprocket', 'It\'s CHEESE. It wants to be free.']],
      [['sprocket', 'Clank keeps calling me a "security risk".'], ['sprocket', 'I took apart his toaster ONE time.']],
      [['sprocket', 'Every rat ship runs on cheese engines. That\'s why they want Bessie, you know.'], ['chris', 'For MILK?'], ['sprocket', 'For the best fuel in the galaxy, mate.']]] },
  stilton: { name: 'CAPTAIN STILTON', title: 'RETIRED ACE', tex: 'cf_stilton', sc: 1.5, col: 0x2a5ac8, theta: -2.78, home: [-2.86, -2.72], speed: 0.05,
    barks: ['Tally ho.', 'Steady...', 'In formation!', '*salutes*'],
    first: [['stilton', 'Chris?! CHRIS from flight school?! It\'s me - Stilton! Mouldy Stilton!'], ['chris', 'Stilts! What are you doing in a CANYON?'], ['stilton', 'Racing the Pepper Jack. I lost. Twenty years ago.'],
      ['stilton', 'I know every boss the rats have got, old boy. Let me set you up a gauntlet. Fight \'em all, one after another.'], ['chris', 'That sounds awful.'], ['stilton', 'Splendid, isn\'t it?']],
    died: [['stilton', 'Shot down? Happens to the best of us. Happened to me nine times.']],
    won: [['stilton', 'Now THAT is flying, old boy! Medals all round!']],
    quit: [['stilton', 'No shame in it. I once landed in a lake on purpose. Twice.']],
    chat: [[['stilton', 'The Boss Gate\'s open. Every big rat, back to back. No rest, no shop. Just glory.']],
      [['stilton', 'You and I were the best pilots in our year, Chris.'], ['chris', 'There were two of us in our year.'], ['stilton', 'And we were the BEST.']],
      [['stilton', 'I\'ve been teaching the dog to salute.'], ['dog', '(Biscuit lies down.)'], ['stilton', 'Close enough.']]] },
  feta: { name: 'MADAME FETA', title: 'FORTUNE TELLER', tex: 'cf_feta', sc: 1.5, col: 0x8a2a8a, theta: 3.05, home: [3.05, 3.05], speed: 0, sit: true,
    barks: ['I see...', 'Mmmm.', 'The cards say cheese.', '*the ball glows*'],
    first: [['feta', 'I KNEW you would come, Chris. I saw it. In the brine.'], ['chris', 'You\'re the Rat King\'s prisoner?'], ['feta', 'His fortune teller. I told him he would lose. He did not like that.'],
      ['feta', 'Take me home. I see a secret above your camp. A golden one. Look UP, Chris. Always look up.']],
    died: [['feta', 'I saw that coming. I did not say anything. It is more fun this way.']],
    won: [['feta', 'As foretold. Mostly.']],
    quit: [['feta', 'The cards say: "try again". The cards always say that.']],
    chat: [[['feta', 'Above the bar. Higher than you think. Higher than THAT.']],
      [['feta', 'I see... a long journey. A cow. Many, many rats.'], ['chris', 'That\'s every day.'], ['feta', 'Then I am very accurate.']],
      [['feta', 'Your hen and I have an understanding. She sees the conspiracy. I see the future. Together we see far too much.']]] }
});
// (v3.132) how the original ranch folk are FOUND out on the runs (their camp 'first' lines are for meeting at camp)
Object.assign(FOLK.bot, { found: [['bot', 'CHRIS. THE RATS TOOK ME WITH THE COW. I HAVE BEEN STACKING THEIR CHEESE FOR SIX WEEKS.'], ['chris', 'Clank! Are you alright?'],
  ['bot', 'I HAVE STACKED 41,006 WHEELS. I REGRET NOTHING. EXCEPT ALL OF THEM.'], ['bot', 'YOU HAVE A CAMP? IT WILL REQUIRE BUILDING. I AM VERY GOOD AT BUILDING.']] });
Object.assign(FOLK.kid, { found: [['kid', 'MISTER CHRIS! SURPRISE! I hid in a cheese crate! I\'m a STOWAWAY!'], ['chris', 'Zib?! Does your mum know where you are?!'],
  ['kid', 'She thinks I\'m at a sleepover. ...On the moon. Kind of true!'], ['kid', 'Can I come to the camp? I brought my toys! And a lunchbox! It\'s got a sandwich in it. Mostly.']] });
Object.assign(FOLK.hen, { found: [['hen', 'BAWK! Keep your voice down, Chris. I\'m UNDERCOVER.'], ['chris', 'Henrietta, you\'re covered in blue mould.'], ['hen', 'It\'s a DISGUISE. I\'ve been tailing the rats for weeks.'],
  ['hen', 'I\'ve got evidence. Photos. String. I need a BOARD, Chris. And a telescope. They\'re WATCHING us.']] });
// what Clank says at a construction site
const STORY_SITE = ['CLANK: CONSTRUCTION IN PROGRESS. ESTIMATED COMPLETION: ONE (1) RUN.', 'CLANK: DO NOT TOUCH THE SCAFFOLDING. IT IS LOAD-BEARING. AND SENTIMENTAL.', 'CLANK: I AM BUILDING. YOU ARE STANDING. ONE OF US IS BEING USEFUL.'];
const STORY_NOCLANK = 'THE MATERIALS ARE HERE, BUT NOBODY TO BUILD IT. FIND CLANK - THE RANCH ROBOT - ON THE GRUYERE GLOBE.';

// textures: the four new camp folk + DJ Camembeat (2 frames each), and the construction site
function makeStoryTextures(scene) {
  if (scene.textures.exists('cf_gouda0')) return;
  const SK = [0xffd8b8, 0xe8a878, 0xa86a3a], GL = [0xf0faff, 0xc8eaff, 0x7ab0d8], ST = [0xeef2f8, 0x9aa4b4, 0x4a5262], RAT = [0xc8c0d0, 0x9a90a8, 0x5a5068];
  // GRANNY GOUDA: a tiny old prospector in a red wax-rind coat, a miner's lamp hat and a pickaxe over her shoulder
  for (let f = 0; f < 2; f++) pixSprite(scene, 'cf_gouda' + f, 36, 44, a => {
    a.line([[25, 8], [33, 26]], 0x8a5a2a, 2); a.poly([[30, 6], [36, 10], [33, 12], [27, 9]], ST);                                    // pickaxe
    a.rrect(9, 18, 27, 38, 4, [0xff6a5a, 0xd8302a, 0x7a1010]); a.rect(17, 19, 18, 37, 0x7a1010); a.rect(9, 30, 27, 31, 0x5a3a1a);    // rind coat, belt
    a.rect(11, 38, 15, 42, 0x5a3a1a); a.rect(21, 38, 25, 42, 0x5a3a1a); a.rect(10, 41, 16, 43, 0x2a1a10); a.rect(20, 41, 26, 43, 0x2a1a10);
    a.ell(18, 13, 7, 6.5, SK); a.ell(15.5, 13, 1.2, 1.2, 0x1a1020); a.ell(20.5, 13, 1.2, 1.2, 0x1a1020); a.ell(14, 14, 3, 2, 0xffffff); a.ell(21, 14, 3, 2, 0xffffff);   // specs
    a.px(15, 13, 0x1a1020); a.px(21, 13, 0x1a1020); a.line([[16, 17], [20, 17]], 0xa86a3a);
    a.ell(11, 14, 2.5, 3.5, 0xf4f4f8); a.ell(25, 14, 2.5, 3.5, 0xf4f4f8);                                                           // white hair tufts
    a.rrect(10, 3, 26, 9, 3, [0xffd23f, 0xc8902a, 0x7a5a10]); a.rect(8, 8, 28, 9, 0x7a5a10); a.ell(18, 5, 2.5, 2, f ? 0xffffff : 0xfff0a0);   // lamp hat
    a.ell(29, 24, 2.5, 2.5, SK);
  });
  // SPROCKET: a skinny grey rat in blue overalls and goggles, a big spanner
  for (let f = 0; f < 2; f++) pixSprite(scene, 'cf_sprocket' + f, 40, 44, a => {
    a.line([[6, 34], [1, 30], [2, 25]], 0xe8a0a8, 2);                                                                                 // tail
    a.rrect(10, 20, 26, 38, 3, [0x6a9aff, 0x3a5ad8, 0x1a2a7a]); a.rect(12, 20, 13, 26, 0xffd23f); a.rect(23, 20, 24, 26, 0xffd23f); a.rect(15, 26, 21, 30, 0x2a3a9a);
    a.rect(12, 38, 15, 42, RAT[2]); a.rect(21, 38, 24, 42, RAT[2]); a.rect(11, 41, 16, 43, 0x2a1a10); a.rect(20, 41, 25, 43, 0x2a1a10);
    a.ell(20, 12, 8, 7, RAT); a.ell(28, 14, 4, 3, RAT); a.ell(31.5, 14, 1.5, 1.5, 0xff8aa0);                                         // head, snout, nose
    a.ell(14, 5, 4, 4, RAT); a.ell(14, 5, 2.5, 2.5, 0xffb0c0); a.ell(24, 4, 4, 4, RAT); a.ell(24, 4, 2.5, 2.5, 0xffb0c0);             // ears
    a.rect(14, 9, 27, 11, 0x5a3a1a); a.ell(18, 10, 2.6, 2.4, GL); a.ell(24, 10, 2.6, 2.4, GL); a.px(18, 10, 0x1a1020); a.px(24, 10, 0x1a1020);   // goggles
    for (const [dx, dy] of [[27, 17], [28, 18], [26, 18]]) a.px(dx, dy, 0xffffff);
    const sx = 28, sy = f ? 22 : 24; a.ell(sx - 2, sy + 4, 2.5, 2.5, RAT); a.line([[sx, sy + 3], [sx + 8, sy - 6]], ST[1], 2); a.ell(sx + 9, sy - 7, 3, 3, ST); a.ell(sx + 9, sy - 7, 1.2, 1.2, 0x1a1020);   // spanner
  });
  // CAPTAIN STILTON: a big old pilot in a leather jacket, white scarf, flying helmet and goggles, an enormous moustache
  for (let f = 0; f < 2; f++) pixSprite(scene, 'cf_stilton' + f, 40, 48, a => {
    a.rrect(8, 20, 30, 40, 5, [0xb8783a, 0x8a5a2a, 0x4a2a10]); a.rect(18, 21, 19, 39, 0x4a2a10); a.rect(10, 26, 16, 32, 0x2a5ac8);   // jacket, a badge patch
    a.poly([[12, 19], [27, 19], [29, 24], f ? [36, 30] : [35, 26], [26, 23], [12, 23]], [0xffffff, 0xe8ecf4, 0xb8c0d0]);              // scarf (flapping)
    a.rect(11, 40, 16, 45, 0x3a4250); a.rect(22, 40, 27, 45, 0x3a4250); a.rect(10, 45, 17, 47, 0x1a1020); a.rect(21, 45, 28, 47, 0x1a1020);
    a.ell(19, 12, 8, 8, SK); a.ell(19, 7, 8.5, 5, [0xa8743a, 0x7a4a1a, 0x3a2008]); a.rect(10, 9, 28, 11, 0x7a4a1a);                  // leather helmet
    a.ell(15, 8, 2.8, 2.5, GL); a.ell(22, 8, 2.8, 2.5, GL); a.rect(17, 8, 19, 8, 0x5a3a1a);                                           // goggles up
    a.px(16, 12, 0x1a1020); a.px(22, 12, 0x1a1020); a.ell(19, 14, 1.6, 1.4, 0xd88a6a);
    a.poly([[11, 16], [19, 15], [27, 16], [29, 19], [24, 17], [19, 18], [14, 17], [9, 19]], [0xffffff, 0xe0e0e8, 0xa0a0b0]);          // the moustache (white, enormous)
  });
  // MADAME FETA: a fortune teller in a purple headscarf with gold coins, sat behind a little table with a crystal ball
  for (let f = 0; f < 2; f++) pixSprite(scene, 'cf_feta' + f, 44, 42, a => {
    a.rrect(8, 16, 26, 32, 4, [0xc86ad8, 0x8a2a9a, 0x4a0a5a]);                                                                     // robe
    a.ell(17, 10, 7, 7, SK); a.poly([[9, 9], [17, 1], [26, 9], [27, 14], [24, 10], [10, 10], [7, 14]], [0xc86ad8, 0x8a2a9a, 0x4a0a5a]);   // face, headscarf
    for (let k = 0; k < 5; k++) a.ell(10 + k * 3.5, 10, 1, 1, 0xffd23f);                                                              // coins
    a.line([[14, 11], [16, 11]], 0x1a1020); a.line([[19, 11], [21, 11]], 0x1a1020); a.ell(17.5, 15, 1.4, 0.8, 0xc83a5a);                // knowing eyes, red lips
    a.ell(5, 16, 1.5, 1.5, 0xffd23f);                                                                                                 // a big hoop earring
    a.rect(4, 28, 40, 30, 0x5a2a6a); a.rect(6, 30, 38, 41, 0x3a1a4a); for (let x = 7; x < 38; x += 4) a.rect(x, 30, x + 1, 33, 0xffd23f);   // the table and its fringe
    a.ell(31, 22, 6.5, 6.5, f ? [0xe0f8ff, 0x8ad8ff, 0x3a6aa8] : [0xd0c8ff, 0x9a8aff, 0x4a3aa8]); a.px(29, 19, 0xffffff); a.px(28, 20, 0xffffff);   // crystal ball
    a.rect(27, 27, 35, 28, 0xc8902a);
    a.ell(24, 24, 2.5, 2, SK); a.ell(37, 24, 2.5, 2, SK);                                                                             // hands round the ball
  });
  // DJ CAMEMBEAT: a white party rat in shades and big headphones, a gold chain, a record
  for (let f = 0; f < 2; f++) pixSprite(scene, 'cf_dj' + f, 40, 44, a => {
    const W2 = [0xffffff, 0xe0e0ec, 0x9a98b0];
    a.line([[8, 36], [2, 33], [3, 27]], 0xe8a0a8, 2);
    a.rrect(10, 20, 27, 38, 4, [0xff6ad0, 0xc82a9a, 0x6a0a4a]); a.line([[13, 21], [19, 27], [25, 21]], 0xffd23f); a.ell(19, 28, 1.5, 1.5, 0xffd23f);   // hoodie, chain
    a.rect(12, 38, 15, 42, W2[2]); a.rect(22, 38, 25, 42, W2[2]); a.rect(11, 41, 16, 43, 0xffffff); a.rect(21, 41, 26, 43, 0xffffff);   // trainers
    a.ell(20, 12, 8, 7, W2); a.ell(28, 14, 4, 3, W2); a.ell(31.5, 14, 1.5, 1.5, 0xff8aa0);
    a.ell(14, 5, 4, 4, W2); a.ell(14, 5, 2.5, 2.5, 0xffb0c0); a.ell(24, 4, 4, 4, W2); a.ell(24, 4, 2.5, 2.5, 0xffb0c0);
    a.rect(15, 9, 27, 12, 0x1a1020); a.rect(16, 10, 19, 11, 0x6a3aa8); a.rect(22, 10, 26, 11, 0x6a3aa8);                              // shades
    a.line([[12, 7], [20, 1], [27, 6]], 0x3a3a4a, 2); a.ell(12, 10, 2.5, 3, 0x3a3a4a); a.ell(27, 9, 2.5, 3, 0x3a3a4a);                // headphones
    const ry = f ? 23 : 25; a.ell(32, ry, 6, 6, 0x1a1020); a.ell(32, ry, 2.5, 2.5, 0xff6ad0); a.px(32, ry, 0x1a1020); a.ell(27, ry + 2, 2.5, 2.5, W2);   // the record
  });
  // the CONSTRUCTION SITE: scaffolding poles and planks, a tarp, and a COMING SOON sign
  pixSprite(scene, 'cr_build', 60, 56, a => {
    const W = [0xd09050, 0x9a5c26, 0x5a3212], P = ST;
    for (const x of [6, 28, 50]) a.rect(x, 4, x + 2, 55, P[1]);
    for (const y of [14, 30, 46]) a.rect(3, y, 56, y + 2, W[1]);
    a.line([[8, 46], [28, 16]], P[2]); a.line([[30, 46], [50, 16]], P[2]);
    a.rect(10, 31, 26, 44, 0x3a68d8); a.rect(10, 31, 26, 33, 0x6a9aff);                                                              // blue tarp
    a.rrect(30, 18, 56, 28, 2, [0xffe070, 0xffd23f, 0xc8902a]); for (let x = 32; x < 55; x += 6) a.rect(x, 19, x + 2, 27, 0x1a1020);   // hazard sign
    a.rect(34, 48, 44, 55, 0xffb03a); a.rect(36, 46, 42, 48, 0xffe070);                                                            // a cone-ish bucket
  });
}
