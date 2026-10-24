// Luna Chris, the character rig: a chubby chef-astronaut built from separate parts that animate in code.
//
//   - waddle: legs swing and lift alternately while the whole body rolls side to side
//   - belly pokes out of the too-small suit; the "Kiss the Cook" apron covers the front
//   - jump: the apron spins edge-on and turns into a cape that streams behind him (and spins back on landing)
//   - chef's-hat helmet (a toque on a glass bubble) that lags behind the body and bounces
//   - gun arm recoils, the drill-bit auger spins, back arm swings, squash and stretch on landing / take-off
//
// Everything is drawn with code (outlined EWJ-ish look). Swap any texture for real art under the same key later.
// Local units: feet at (0,0), +x = the way he faces, -y = up. The whole rig is scaled by RIG_SCALE.

const RIG_SCALE = 0.95;

function makeChrisTextures(scene) {
  if (scene.textures.exists('c_head')) return;
  const OUT = 0x1a1020;
  const mk = (key, w, h, draw) => {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  };
  const rr = (g, x, y, w, h, r, fill, lw) => { g.fillStyle(fill, 1).fillRoundedRect(x, y, w, h, r); g.lineStyle(lw || 2, OUT, 1).strokeRoundedRect(x, y, w, h, r); };
  const el = (g, x, y, w, h, fill, lw) => { g.fillStyle(fill, 1).fillEllipse(x, y, w, h); g.lineStyle(lw || 2, OUT, 1).strokeEllipse(x, y, w, h); };
  const ci = (g, x, y, r, fill, lw) => { g.fillStyle(fill, 1).fillCircle(x, y, r); g.lineStyle(lw || 2, OUT, 1).strokeCircle(x, y, r); };

  mk('blank', 2, 2, () => {});

  // ---- Luna Chris in pixel art, styled after the title art: white/ice-blue suit with red and blue trim,
  // glass helmet over a furious red-nosed face with a big moustache, chef's toque, the "KISS THE COOK" apron.
  // Every part keeps its old size and pivot, so the rig animation is unchanged.
  const SUIT = [0xffffff, 0xd6e2f4, 0x93a8cc], SKIN = [0xffd9c4, 0xf2b593, 0xc9805e], BLUE = [0x8aa8ff, 0x4a6ad8, 0x2a3a90];
  const CREAM = [0xffffff, 0xfff1dc, 0xd8c4a8], RED = [0xff6a6a, 0xd62828, 0x8a1414], HAIR = 0x5a3216;
  const FONT3 = { K: ['1.1', '11.', '11.', '1.1', '1.1'], I: ['111', '.1.', '.1.', '.1.', '111'], S: ['111', '1..', '111', '..1', '111'],
    T: ['111', '.1.', '.1.', '.1.', '.1.'], H: ['1.1', '1.1', '111', '1.1', '1.1'], E: ['111', '1..', '11.', '1..', '111'], C: ['111', '1..', '1..', '1..', '111'], O: ['111', '1.1', '1.1', '1.1', '111'] };
  const word = (a, txt, x, y, col) => { for (const ch of txt) { (FONT3[ch] || []).forEach((row, j) => [...row].forEach((v, i) => { if (v === '1') a.px(x + i, y + j, col); })); x += 4; } };

  pixSprite(scene, 'c_boot', 24, 13, a => {
    a.rrect(1, 1, 22, 10, 4, BLUE);
    a.rect(2, 9, 21, 10, 0xd9d9e0); a.rect(2, 10, 21, 10, 0x8a8a98);                    // sole
    a.rect(14, 3, 17, 3, 0xc4d4ff);                                                     // toe shine
  });
  pixSprite(scene, 'c_welly', 24, 19, a => {                                         // green wellies (at home on the farm): a tall rubber shaft up the shin
    const G = [0x6ad05a, 0x2f8f2f, 0x1a5a1e];
    a.rrect(4, 0, 15, 15, 2, G);                                                        // the shaft
    a.rect(4, 0, 15, 1, 0x9af08a); a.rect(4, 2, 15, 2, 0x1a5a1e);                      // rolled top rim
    a.rrect(3, 9, 22, 17, 4, G);                                                        // the foot, a big round toe
    a.rect(7, 3, 7, 12, 0xb8ffa8);                                                      // rubbery shine
    a.rect(3, 16, 22, 18, 0x2a2018); for (let x = 4; x < 22; x += 3) a.px(x, 18, 0x4a3a2a);   // chunky tread
    a.rect(3, 13, 9, 15, 0x6a4424); a.px(18, 15, 0x6a4424); a.px(12, 14, 0x7a5030); a.px(5, 11, 0x6a4424);   // caked in mud
  });
  pixSprite(scene, 'c_sock', 24, 13, a => {                                          // woolly socks (between wellies and space boots)
    a.rrect(4, 3, 19, 10, 3, [0xf4ece0, 0xd8ccb8, 0xa89880]);
    a.rect(16, 6, 19, 10, 0xc04a3a); a.rect(4, 7, 6, 10, 0xc04a3a);                     // red toe and heel
  });
  const PANTS = [0x9ab4ff, 0x5a78d8, 0x2e3e8a];                                      // blue suit trousers
  pixSprite(scene, 'c_leg', 16, 18, a => {
    a.rrect(1, 0, 14, 17, 4, PANTS);
    a.rect(2, 10, 13, 10, 0xd62828); a.rect(2, 11, 13, 11, 0xc4d4ff);                   // red + white knee trim
  });
  // Chris's body: hand-pixelled (44x42, facing right, outline included). Edit the rows: each letter is a colour in the palette.
  pixArt(scene, 'c_body', {a: 0x1a1020, b: 0xffffff, c: 0xd6e2f4, d: 0xd52828, e: 0x8aa8fe, f: 0x4a69d7, g: 0x2a398f, h: 0x92a8cc, i: 0xf2b592, j: 0xf0ddd6, k: 0xfed9c4, l: 0xf2b593, m: 0xc8805e, n: 0x50211b, o: 0x37191c}, [
    '............................................',
    '............................................',
    '...........aaaaaaaaaaaaaaaaaaa..............',
    '.........aabbbbbbbbbbbbbbbbbbbaa............',
    '........abbbbbbbbbbbbbbbbbbbbbbca...........',
    '.......abbbbbbbbbbbbbbbbbbbbbcccca..........',
    '......abbbbbbbbbbbbbbbbbbbbbddddcca.........',
    '.....abbbbbbbbbbbbbbbbbbbbccddddccca........',
    '.....abbbbbbbbbbbbbbbbbbccccddddccca........',
    '....abbbbbbeeeebbbbbbbbcccccffffcccca.......',
    '....abbbbbeeeeffbbbbbcccccccffffcccca.......',
    '....abbbbeeeeffffbbccccccccccccccccca.......',
    '....abbbbeeefbffgbcccccccccccccccccha.......',
    '....abbbbeffbfbggcccccccccccccccchhha.......',
    '....abbbbffffigggcccccccccccccchhhhha.......',
    '....abbbbbffggggcccccccccccccchhhhhha.......',
    '....abbbbbbggggccccccccccccchhhhhhhha.......',
    '....abbbbccccccccccccccccchhhhhhhhhha.......',
    '....abbbccccccccccccccccchhhhhhhhhhha.......',
    '....abccccccccccccccccchhhhhhhhhhhhha.......',
    '....acccccccccccccccchhhhhhhhhhhhhhha.......',
    '....accccccccccccccchhhhhhhhhhhhhhhha.......',
    '.....accccccccccccccccccccccchhhhhha........',
    '.....accccccccccccccccccccccccccccha........',
    '......accccccccccccccccccccccccccccca.......',
    '.......accccccccccccccccccccccccccccca......',
    '........accccccccccccccccccccccccccccca.....',
    '........acccccccccccccccccccccccccccccca....',
    '.......acccccccccccccccccccccccddddddcca....',
    '.......accccccccccccccccccccdddddddddddda...',
    '......accccccccccccccccccdddddjjkkkkkkdda...',
    '......acccccccccccccccccdddlllllkkkkkkkma...',
    '......accccccccccccccdddddllllimmikkkkkka...',
    '......acccccccccccdddddlllllllmonmllkkkka...',
    '......acccccccccdddddlllllllllmnnillllkka...',
    '.......adddddddddddmmmllllllllikklllllla....',
    '......adddddddddmmmmmmmmllllllllllllllla....',
    '......aammmmmmmmmaammmmmmmlllllllllllla.....',
    '.......aammmmmmmmmaammmmmmmmlllaaaalla......',
    '........aaammmmaaa.aammmmmmmmaaa...aa.......',
    '..........aaaaaa....aaaaaaaaaa..............',
    '.............aa.............................'
  ]);
  // the apron: "KISS THE COOK", cream with red lettering and macaroni-cheese stains
  pixSprite(scene, 'c_apron', 28, 38, a => {
    a.poly([[8, 1], [20, 1], [24, 12], [27, 35], [1, 35], [4, 12]], CREAM);
    a.rect(8, 1, 20, 2, 0xd62828);                                                       // neck band
    word(a, 'KISS', 7, 12, 0xd62828); word(a, 'THE', 9, 18, 0xd62828); word(a, 'COOK', 7, 24, 0xd62828);
    for (const [x, y] of [[5, 30], [6, 30], [20, 29], [21, 30], [22, 16], [4, 21], [18, 32]]) a.px(x, y, 0xff9a2a);   // stains
    a.px(19, 9, 0xffd23f); a.px(9, 31, 0xffd23f);
  });
  // the apron split in two so the bottom half can flap: bib (KISS THE) and skirt (COOK + hem)
  pixSprite(scene, 'c_apronT', 24, 21, a => {
    a.poly([[6, 1], [17, 1], [21, 12], [22, 20], [1, 20], [2, 12]], CREAM);
    a.rect(6, 1, 17, 2, 0xd62828);                                                       // neck band
    word(a, 'KISS', 5, 9, 0xd62828); word(a, 'THE', 7, 15, 0xd62828);
    a.px(17, 7, 0xffd23f); a.px(4, 17, 0xff9a2a);
  });
  pixSprite(scene, 'c_apronB', 26, 17, a => {
    a.poly([[2, 0], [23, 0], [25, 15], [1, 15]], CREAM);
    word(a, 'COOK', 5, 3, 0xd62828);
    a.rect(1, 13, 25, 14, 0xd62828);                                                     // red hem
    for (const [x, y] of [[4, 10], [5, 10], [19, 9], [20, 10]]) a.px(x, y, 0xff9a2a);     // mac-cheese stains
  });
  // the cape, as 4 cloth strips that hang off a little physics chain (widening towards the hem)
  for (let i = 0; i < 4; i++) {
    const w = 13 + i * 3, last = i === 3;
    pixSprite(scene, 'c_capeS' + i, w + 2, last ? 15 : 13, a => {
      const t0 = i === 0 ? 3 : 1;
      a.poly([[t0 + 1, 0], [w - t0, 0], [w, 12], [1, 12]], [0xff6a6a, 0xd62828, 0x8a1414]);         // red cape cloth
      a.rect(Math.round(w / 2) + 1, 1, Math.round(w / 2) + 1, 11, 0xa01c1c);                           // a fold down the middle
      if (i === 0) a.rect(t0 + 1, 0, w - t0, 1, 0xff9a9a);                                             // shine at the shoulders
      if (last) { for (let x = 1; x <= w; x++) { const y = 12 + ((x >> 1) % 2); a.px(x, y, 0xffd23f); if ((x >> 1) % 2) a.px(x, y + 1, 0xd8901a); } }   // gold zig-zag hem
    });
  }
  // the knot that ties the cape on, sitting in FRONT of his neck so the cape wraps over him
  pixSprite(scene, 'c_collar', 16, 10, a => {
    a.poly([[1, 2], [7, 4], [7, 7], [1, 8]], [0xff6a6a, 0xd62828, 0x8a1414]);
    a.poly([[14, 2], [9, 4], [9, 7], [14, 8]], [0xff6a6a, 0xd62828, 0x8a1414]);
    a.ell(8, 5.5, 2.5, 2.5, [0xfff0a0, 0xffc83a, 0xb07a1a]);                              // gold clasp
  });
  // (old one-piece cape, kept for anything else that uses it)
  pixSprite(scene, 'c_cape', 50, 46, a => {
    const pts = [[48, 2], [48, 14], [22, 30], [14, 45], [8, 33], [1, 40], [5, 22], [24, 8]];
    a.poly(pts, CREAM);
    a.poly([[48, 8], [48, 14], [22, 30], [14, 45], [24, 26]], [0xf0e0c8, 0xd8c4a8, 0xb8a080]);          // fold in shadow
    a.line([[48, 13], [22, 29], [14, 44]], 0xd62828, 2);                                                // red hem
    word(a, 'KISS', 22, 12, 0xd62828);                                                                  // a ghost of the lettering
  });
  // head: glass helmet bubble round a furious face: one squint, one bulging eye, red nose, big moustache, gritted teeth
  const headArt = (a, glass) => {
    if (glass) a.ell(15, 15, 14, 14, [0xe8f8ff, 0xb8e0ff, 0x7ab0e0]);                   // helmet glass
    a.ell(15, 16, 11, 11.5, SKIN);                                                       // face
    a.line([[6, 8], [13, 11]], HAIR, 2); a.line([[24, 7], [17, 11]], HAIR, 2);           // angry brows
    a.rect(7, 12, 12, 12, 0x1a1020); a.px(8, 13, 0x1a1020);                              // squinting eye
    a.ell(20.5, 13, 3.2, 3.4, 0xffffff); a.rect(21, 12, 22, 14, 0x1a1020);                // bulging eye
    a.ell(16, 17.5, 3.4, 3, [0xff9a9a, 0xe03a3a, 0xa01818]); a.px(15, 16, 0xffffff);     // big red nose
    a.poly([[5, 22], [9, 19], [15, 20.5], [21, 19], [26, 21], [28, 18], [27, 23], [21, 23], [15, 22.5], [9, 23], [3, 24], [2, 20]], HAIR);   // handlebar moustache
    a.rect(10, 24, 20, 26, 0xffffff); a.rect(10, 25, 20, 25, 0x8a7a7a); a.px(13, 24, 0x8a7a7a); a.px(17, 24, 0x8a7a7a); a.px(13, 26, 0x8a7a7a); a.px(17, 26, 0x8a7a7a);   // gritted teeth
    if (glass) { a.px(5, 6, 0xffffff); a.px(6, 5, 0xffffff); a.px(7, 5, 0xffffff); a.px(4, 8, 0xffffff); }   // glass glint
  };
  pixSprite(scene, 'c_head', 30, 30, a => headArt(a, true));
  // game over: the helmet glass cracks... then shatters (the bare head is left, dazed: both eyes X'd out)
  pixSprite(scene, 'c_head_bare', 30, 30, a => {
    headArt(a, false);
    a.rect(6, 10, 13, 15, SKIN[1]); a.rect(18, 10, 24, 16, SKIN[1]);
    for (const [cx, cy] of [[9.5, 12.5], [21, 13]]) { a.line([[cx - 2, cy - 2], [cx + 2, cy + 2]], 0x1a1020); a.line([[cx - 2, cy + 2], [cx + 2, cy - 2]], 0x1a1020); }
  });
  pixSprite(scene, 'c_crack', 30, 30, a => {
    a.line([[4, 9], [9, 12], [8, 17], [13, 20]], 0xffffff); a.line([[9, 12], [14, 9], [18, 4]], 0xffffff);
    a.line([[22, 5], [21, 10], [26, 13]], 0xffffff); a.line([[21, 10], [17, 14]], 0xffffff); a.line([[24, 22], [20, 25], [21, 28]], 0xffffff);
  }, 0);
  pixSprite(scene, 'shard', 8, 8, a => { a.poly([[0, 0], [7, 2], [2, 7]], [0xffffff, 0xc8f0ff, 0x7ab0e0]); });
  // chef's toque
  pixSprite(scene, 'c_hat', 38, 30, a => {
    const W3 = [0xffffff, 0xeef2f8, 0xbcc6d6];
    a.ell(9, 17, 7.5, 7.5, W3); a.ell(29, 17, 7.5, 7.5, W3); a.ell(19, 11, 9.5, 9.5, W3); a.ell(19, 18, 8.5, 8, W3);
    // the band wraps round the round helmet, so its top and bottom edges curve down in the middle
    const curve = x => 3.2 * (1 - Math.pow((x + 0.5 - 18.5) / 12, 2));
    for (let x = 6; x <= 31; x++) {
      const c = curve(x), y0 = Math.round(19 + c * 0.6), y1 = Math.round(25 + c);
      for (let y = y0; y <= y1; y++) a.px(x, y, y === y0 ? 0xffffff : (y >= y1 - 1 ? 0xc4cede : (x > 24 ? 0xe2e8f0 : 0xf1f1f1)));
    }
    for (const x of [12, 18, 25]) { const c = curve(x); for (let y = Math.round(20 + c * 0.6); y <= Math.round(24 + c); y++) a.px(x, y, 0xbcc6d6); }   // pleats follow the curve
    a.line([[14, 6], [16, 13]], 0xbcc6d6); a.line([[24, 7], [22, 13]], 0xbcc6d6);
  });
  // The Spaghetti Spinner (pixel art): teal body, a big reel of spaghetti on top, loose strand, red nozzle
  pixSprite(scene, 'c_gun2', 34, 26, a => {
    const TL = [0x7af0e0, 0x2fa89a, 0x1a6a62], SP = [0xfff4b0, 0xffd23f, 0xc99a1a];
    a.rrect(10, 18, 16, 25, 2, [0xb07a40, 0x7a4a1a, 0x4a2a0a]);                                      // grip
    a.line([[17, 19], [20, 23], [16, 24]], 0x3b4252);
    a.rrect(3, 10, 28, 20, 4, TL);                                                                     // body
    a.rect(5, 17, 26, 18, 0x1a6a62); a.rect(6, 11, 22, 11, 0xb8fff4);                                   // under-shade + shine
    a.rrect(26, 12, 33, 18, 1, [0xdfe6f0, 0x9aa4b4, 0x5a6272]);                                        // barrel
    a.ell(13, 6, 7, 6.5, SP);                                                                          // the reel of spaghetti
    for (const r of [5, 3]) for (let k = 0; k < 16; k++) { const t = k / 16 * Math.PI * 2; a.px(13 + Math.cos(t) * r, 6 + Math.sin(t) * r * 0.9, 0xc99a1a); }   // coils
    a.ell(13, 6, 1.6, 1.6, 0x5a6272);                                                                  // hub
    a.line([[19, 9], [22, 7], [24, 9], [26, 7]], 0xffd23f);                                             // loose strand
    a.px(9, 2, 0xffffff); a.px(10, 2, 0xffffff);
  });
  pixSprite(scene, 'c_nozzle', 14, 12, a => {
    a.rrect(0, 2, 5, 9, 1, [0xdfe6f0, 0x9aa4b4, 0x5a6272]);
    a.poly([[5, 1], [13, 3], [13, 8], [5, 10]], [0xff8a8a, 0xe03030, 0x901818]);                        // flared red nozzle
    a.rect(12, 4, 13, 7, 0x1a1020);
  });
  // The Swiss-Shot (pixel art): a cheese cannon - wheel-of-Swiss barrel with holes, brass bands, a drum of cheese balls
  pixSprite(scene, 'c_gun3', 34, 26, a => {
    const CH = [0xfff09a, 0xffcf3a, 0xc9901a], BR = [0xffe0a0, 0xd0a040, 0x8a6018];
    a.rrect(10, 18, 16, 25, 2, [0xb07a40, 0x7a4a1a, 0x4a2a0a]);                                      // grip
    a.line([[17, 19], [20, 23], [16, 24]], 0x3b4252);
    a.rrect(2, 9, 33, 21, 5, CH);                                                                      // cheese barrel
    for (const [x, y, r] of [[8, 13, 1.8], [15, 17, 1.5], [21, 12, 2], [27, 16, 1.6], [12, 11, 1]]) a.ell(x, y, r, r, 0xa8701a);   // holes
    a.rect(5, 9, 6, 21, 0xc9901a); a.rect(5, 9, 5, 21, BR[1]); a.rect(24, 9, 25, 21, BR[1]); a.rect(30, 9, 31, 21, BR[1]);   // brass bands
    a.ell(10, 5, 6, 5, [0xb8c0cc, 0x7a8698, 0x4a5262]);                                                  // ammo drum
    for (const [x, y] of [[8, 3], [12, 3], [10, 6]]) { a.ell(x, y, 1.6, 1.6, 0xffd23f); }
    a.rect(4, 7, 16, 8, 0x4a5262);
  });
  pixSprite(scene, 'c_bell', 12, 18, a => {                                                            // flared brass muzzle
    a.poly([[0, 5], [6, 3], [11, 0], [11, 17], [6, 14], [0, 12]], [0xffe0a0, 0xd0a040, 0x8a6018]);
    a.rect(10, 3, 11, 14, 0x1a1020);
  });
  // the Swiss-Shot's ammo: a fat ball of Swiss cheese
  pixSprite(scene, 'swissball', 22, 22, a => {
    a.ell(11, 11, 10, 10, [0xfff09a, 0xffcf3a, 0xc9901a]);
    for (const [x, y, r] of [[7, 7, 2], [14, 9, 2.4], [8, 15, 1.6], [15, 15, 1.4], [11, 4, 1]]) { a.ell(x, y, r, r, 0xa8701a); a.px(x + 1, y + 1, 0xffe27a); }
    a.rect(5, 4, 6, 4, 0xffffff); a.px(4, 5, 0xffffff);
  });
  // the splat it leaves: a puddle of melted Swiss
  pixSprite(scene, 'swisssplat', 60, 16, a => {
    a.ell(30, 10, 28, 5.5, [0xfff09a, 0xffcf3a, 0xc9901a]);
    for (const [x, r] of [[8, 3], [18, 4], [42, 4], [53, 3]]) a.ell(x, 6, r, r, [0xfff09a, 0xffcf3a, 0xc9901a]);
    a.ell(22, 10, 2, 1.4, 0xa8701a); a.ell(38, 11, 2.4, 1.6, 0xa8701a);
  });
  // the projectile: a long wavy strand of spaghetti
  pixSprite(scene, 'spaghetti', 36, 9, a => {
    const pts = []; for (let x = 1; x <= 34; x++) pts.push([x, 4 + Math.round(Math.sin(x / 34 * Math.PI * 3) * 2.4)]);
    a.line(pts, 0xffd23f, 2);
    for (let x = 3; x <= 33; x += 5) a.px(x, 4 + Math.round(Math.sin(x / 34 * Math.PI * 3) * 2.4) - 1, 0xfff4b0);
  });
  // the belly: hangs out under the front of the suit (drawn behind the suit, so only the front-bottom shows)
  // a round, bare belly bulging out from under the stretched suit: the hem rides up over it (so it's clearly part of
  // him, not stuck on), the bulge pushes out a little past the front of the suit, navel and a shine
  pixSprite(scene, 'c_belly', 26, 16, a => {
    a.ell(14, 5.5, 11.5, 10, SKIN); a.ell(19, 6, 6, 7, [0xffe4d4, 0xf5bea0, 0xd08a68]);   // the bulge, rounder and pushing forward
    for (let x = 1; x <= 25; x++) {                                                     // the suit hem stretched over it, bowing down where it's tightest
      const bow = Math.round(Math.sin(Math.PI * Math.min(1, Math.max(0, (x - 1) / 24))) * 2);
      for (let y = 0; y <= bow; y++) a.px(x, y, SUIT[1]);
      a.px(x, bow + 1, 0xd62828); a.px(x, bow + 2, 0x93a8cc);                           // red hem trim + the stretched edge
      a.px(x, bow + 3, 0xc9805e);                                                       // a shadow where the hem digs in
    }
    a.px(17, 9, 0xb06a4a); a.px(17, 10, 0x8a4a34);                                      // navel
    a.rect(20, 6, 21, 7, 0xffe8dc); a.px(22, 8, 0xffe8dc);                              // shine on the curve
    a.line([[6, 13], [12, 14], [18, 13]], 0xc9805e);                                    // the underside crease
  });
  // gun arm: suit sleeve, red cuff, big white glove
  pixSprite(scene, 'c_arm', 18, 11, a => {
    a.rrect(0, 2, 10, 8, 2, SUIT); a.rect(8, 2, 9, 8, 0xd62828);
    a.ell(13, 5.5, 4.2, 4.2, [0xffffff, 0xeef2f8, 0xbcc6d6]);
  });
  // The Mac-Grinder (pixel art): chunky orange grinder body, glass hopper heaped with macaroni,
  // a crank with a red knob at the back, wooden grip and a steel barrel ring. The drill bit is a separate spinning part.
  pixSprite(scene, 'c_gun', 34, 26, a => {
    const OR = [0xffa04a, 0xff7a1a, 0xc4501a], STL = [0xdfe6f0, 0x9aa4b4, 0x5a6272];
    a.line([[4, 14], [1, 9]], 0x7a8698, 2); a.rrect(0, 5, 3, 8, 1, [0xff8a8a, 0xe03030, 0x901818]);   // crank + knob
    a.rrect(10, 18, 16, 25, 2, [0xb07a40, 0x7a4a1a, 0x4a2a0a]);                                      // grip
    a.line([[17, 19], [20, 23], [16, 24]], 0x3b4252);                                                  // trigger guard
    a.rrect(4, 10, 27, 20, 4, OR);                                                                     // body
    a.rect(6, 17, 25, 18, 0xc4501a); a.rect(7, 11, 22, 11, 0xffc890);                                   // under-shade + top shine
    a.ell(9, 15, 2.6, 2.6, STL); a.px(9, 15, 0x3b4252);                                                 // crank hub
    a.rrect(26, 11, 33, 19, 2, STL); a.rect(29, 11, 30, 19, 0x5a6272);                                  // barrel ring
    a.poly([[11, 10], [23, 10], [26, 2], [8, 2]], [0xeaf8ff, 0xb8e4ff, 0x6ab0e0]);                      // glass hopper
    a.rect(8, 0, 26, 2, [0xff8a8a, 0xe03030, 0x901818][1]);                                             // red rim
    for (const [x, y] of [[11, 4], [15, 3], [19, 4], [13, 6], [17, 6], [21, 6], [15, 8]]) { a.px(x, y, 0xffd23f); a.px(x + 1, y, 0xffa21a); a.px(x, y + 1, 0xffa21a); }   // macaroni
    a.px(10, 3, 0xffffff); a.px(10, 4, 0xffffff);                                                       // glass glint
  });
  // jetpack: twin white tanks with red caps and steel nozzles
  pixSprite(scene, 'c_tanks', 14, 28, a => {
    a.rrect(0, 1, 5, 20, 2, SUIT); a.rrect(7, 1, 12, 20, 2, SUIT);
    a.rect(0, 1, 5, 3, 0xd62828); a.rect(7, 1, 12, 3, 0xd62828);
    a.rect(1, 21, 4, 25, 0x5a6272); a.rect(8, 21, 11, 25, 0x5a6272); a.rect(1, 21, 4, 21, 0x9aa4b4); a.rect(8, 21, 11, 21, 0x9aa4b4);
  });
}

class ChrisRig {
  // swap the gun model: the Mac-Grinder has a spinning drill, the Spaghetti Spinner a fixed nozzle
  setWeapon(w) {
    this.gun.setTexture(w.gunTex);
    this.tipSpins = w.tipTex === 'auger';
    this.auger.setTexture(this.tipSpins ? 'auger0' : w.tipTex);
  }

  constructor(scene) {
    makeChrisTextures(scene);
    const img = (key, x, y, ox, oy) => scene.add.image(x, y, key).setOrigin(ox, oy);
    this.root = scene.add.container(0, 0).setDepth(7);

    this.capeS = [0, 1, 2, 3].map(i => img('c_capeS' + i, 0, 0, 0.5, 0));   // physics cape strips (behind everything)
    this.tanks = img('c_tanks', -16, -36, 0.5, 0.5);
    this.legB = img('c_leg', -6, -16, 0.5, 0);
    this.bootB = img('c_boot', -6, 0, 0.5, 1);
    this.torso = scene.add.container(0, -16);
    this.body = img('c_body', 0, 3, 0.5, 1);
    this.belly = img('c_belly', 8, -12, 0.5, 0).setVisible(false);   // (the belly is part of c_body now)
    this.armB = img('c_arm', -3, -22, 0, 0.5);
    this.apron = img('c_apronT', 5, -33, 0.5, 0);                    // the apron over the FRONT of the suit...
    this.apronB = img('c_apronB', 5, -14, 0.5, 0);                   // ...with a skirt that flaps on a spring
    this.collar = img('c_collar', -3, -37, 0.5, 0.5);                // the cape's knot, over the neck
    this.head = img('c_head', 2, -44, 0.5, 0.5);
    this.crack = img('c_crack', 2, -44, 0.5, 0.5).setVisible(false);  // game over: cracked glass
    this.hat = img('c_hat', 3, -54, 0.5, 1);
    this.torso.add([this.body, this.armB, this.apron, this.apronB, this.belly, this.collar, this.head, this.crack, this.hat]);
    this.legF = img('c_leg', 7, -16, 0.5, 0);
    this.bootF = img('c_boot', 7, 0, 0.5, 1);
    this.gunArm = scene.add.container(4, -42);
    this.gArm = img('c_arm', 0, 0, 0, 0.5);
    // the gun hangs off a pivot at the grip, so the melee bash can FLIP it round (butt first) without moving the arm
    const GX = 20, GY = 5;
    this.gunPivot = scene.add.container(GX, GY);
    this.gun = img('c_gun', 4 - GX, 1 - GY, 0, 15 / 26).setScale(1.25);   // barrel centre lines up with the arm; a big chunky gun
    this.auger = img('auger0', 44 - GX, 1 - GY, 0, 0.5).setScale(1.25);
    this.gunPivot.add([this.gun, this.auger]);
    this.gunArm.add([this.gArm, this.gunPivot]);
    this.root.add([...this.capeS, this.tanks, this.legB, this.bootB, this.legF, this.bootF, this.torso, this.gunArm]);   // (legs behind the torso, so the belly hangs over them)

    this.parts = [...this.capeS, this.tanks, this.legB, this.bootB, this.body, this.belly, this.armB, this.apron, this.apronB, this.collar, this.head, this.hat, this.legF, this.bootF, this.gArm, this.gun];
    this.tinted = false;
    this.wp = 0;          // waddle phase
    this.t = 0;
    this.cloth = null;    // cape chain points (local space), built on the first update
    this.flapA = 0; this.flapV = 0;    // apron skirt spring
    this.morph = -1;                   // apron -> cape spin (intro only); -1 = not spinning
    this.setChef(false);               // in battle he's an astronaut: cape on, no apron
    this.squash = 0;
    this.recoil = 0;
    this.wasGround = true;
    this.vhPrev = 0;
  }

  // chef mode (the intro / ending at home): "Kiss the Cook" apron, no cape. Battle mode: just the cape.
  setChef(on) {
    this.chef = on; this.morph = -1;
    this.apron.setVisible(on).setScale(1); this.apronB.setVisible(on);
    for (const c of this.capeS) c.setVisible(!on).setScale(1);
    this.collar.setVisible(!on).setScale(1);
  }
  // the transformation: the apron whips round and round on the spot and turns into the cape
  spinToCape() { if (this.chef) this.morph = 0; }

  setPowered(on) {
    if (on === this.tinted) return;
    this.tinted = on;
    for (const p of this.parts) { if (on) p.setTint(0xffe9a0); else p.clearTint(); }
  }

  // ---- the cape: a 5-point chain hanging off the back of the neck. Simulated in the rig's own (facing-right) space:
  // gravity pulls it down, and "air" blowing against Chris's movement drags it back when he runs, down when he jumps,
  // up when he falls, with a flutter that grows with speed. Strips snap to 1/12-turn angles so it stays sprite-y.
  updateCloth(P, dt, grounded, fly) {
    const N = 5, SEG = 9.5, fc = P.facing < 0 ? -1 : 1;
    const tr = this.torso.rotation, tx = this.torso.x, ty = this.torso.y;
    const ax = tx + (-9) * Math.cos(tr) - (-36) * Math.sin(tr), ay = ty + (-9) * Math.sin(tr) + (-36) * Math.cos(tr);   // anchor: back of the neck
    if (!this.cloth) { this.cloth = []; for (let i = 0; i < N; i++) this.cloth.push({ x: ax - i * 1.5, y: ay + i * SEG, vx: 0, vy: 0 }); }
    const C = this.cloth, airX = -(P.vx || 0) * fc * 0.65, airY = (P.vh || 0) * 0.55 + (fly ? 140 : 0);   // jetting: the exhaust blows it down and back
    const sp = Math.hypot(airX, airY), nSub = Math.min(6, Math.max(2, Math.ceil(dt * 120))), h = Math.min(0.05, dt) / nSub;   // more steps on slow frames, so it moves at the same speed on any phone
    for (let sub = 0; sub < nSub; sub++) {
      C[0].x = ax; C[0].y = ay;
      for (let i = 1; i < N; i++) {
        const p = C[i], fl = Math.sin(this.t * (16 + sp * 0.02) + i * 1.4) * Math.min(260, sp * 0.9) * (i / N);   // flutter, worst at the hem
        const nx = -airY / (sp || 1), ny = airX / (sp || 1);
        p.vx += ((airX - p.vx) * 3.5 + nx * fl - 6) * h;               // (a slight backwards bias so it never hangs dead straight)
        p.vy += (900 + (airY - p.vy) * 3.5 + ny * fl) * h;
        p.ox = p.x; p.oy = p.y; p.x += p.vx * h; p.y += p.vy * h;
      }
      for (let it = 0; it < 3; it++) {
        C[0].x = ax; C[0].y = ay;
        for (let i = 1; i < N; i++) {
          const a = C[i - 1], b = C[i], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, k = (d - SEG) / d;
          if (i === 1) { b.x -= dx * k; b.y -= dy * k; } else { a.x += dx * k * 0.5; a.y += dy * k * 0.5; b.x -= dx * k * 0.5; b.y -= dy * k * 0.5; }
          const back = ax - 3.2 * i;                                  // drapes out in a cone behind him, so it shows even standing still
          if (b.x > back) b.x = back;
          if (grounded && b.y > -1) b.y = -1;                          // and never through the floor
        }
      }
      for (let i = 1; i < N; i++) { const p = C[i]; p.vx = (p.x - p.ox) / h; p.vy = (p.y - p.oy) / h; }
    }
    const STEP = Math.PI / 12;
    for (let i = 0; i < 4; i++) {
      const a = C[i], b = C[i + 1], ang = Math.atan2(b.y - a.y, b.x - a.x) - Math.PI / 2;
      this.capeS[i].setPosition(Math.round(a.x), Math.round(a.y)).setRotation(Math.round(ang / STEP) * STEP);
    }
    // apron skirt: a springy hinge at the waist. Swings back when running, flips up when falling, wobbles on landing
    const tgt = Math.max(-1.1, Math.min(0.5, -(P.vx || 0) * fc * 0.0022 + Math.min(0, P.vh || 0) * 0.0016 * (grounded ? 0 : 1)));
    this.flapV += ((tgt - this.flapA) * 160 - this.flapV * 9) * dt;
    if (this.squash > 0.9) this.flapV -= 6;                          // landing whump
    this.flapA = Math.max(-1.3, Math.min(0.7, this.flapA + this.flapV * dt));
    const fq = Math.round(this.flapA / (Math.PI / 16)) * (Math.PI / 16);
    this.apronB.setRotation(fq);
    if (this.morph < 0) this.apronB.setScale(1, Math.max(0.7, Math.cos(fq) * 0.9 + 0.1));
  }

  // P = player state, (x, y) = screen position of his feet, z = world zoom, alpha = hit flicker, augerFrame = 0..3
  update(P, dt, x, y, z, alpha, augerFrame) {
    this.t += dt;
    const t = this.t;
    const grounded = P.h <= (P.floor || 0) + 0.5 && P.vh <= 0;
    const spd = Math.abs(P.vx);
    const run = grounded ? Math.min(1, spd / 140) : 0;

    // ---- phases
    if (grounded && spd > 10) this.wp += dt * (spd / 230) * 8;
    if (!this.wasGround && grounded) { this.squash = 1; this.bv = (this.bv || 0) + 5; }   // landing squash (and a belly wobble)
    if (this.wasGround && !grounded && P.vh > 200) this.squash = -0.8;   // take-off stretch
    this.wasGround = grounded;
    this.squash += (0 - this.squash) * Math.min(1, dt * 9);
    const sq = this.squash;
    const sw = Math.sin(this.wp);
    const air = grounded ? 0 : 1;
    const fly = P.thrusting ? 1 : 0;


    // ---- CROUCH: a springy 0..1 (with a little overshoot going in and popping back up). Instead of squashing the
    // whole sprite, the knees bend out and the legs compress, the boots stay planted, and the body DROPS onto them.
    this.dv = (this.dv || 0) + (((P.duck ? 1 : 0) - (this.duckA || 0)) * 320 - (this.dv || 0) * 24) * dt;
    this.duckA = Math.max(-0.1, Math.min(1.12, (this.duckA || 0) + this.dv * dt));
    const dk = Math.max(0, this.duckA), DROP = 13.5 * dk;

    // ---- waddle: legs, boots and body roll
    const legAmp = 0.38 * run;
    const rotF = (sw * legAmp + air * (0.45 + fly * 0.1 * Math.sin(t * 22))) * (1 - dk) - 1.05 * dk;   // crouch: front knee out forward...
    const rotB = (-sw * legAmp - air * (0.3 + fly * 0.1 * Math.cos(t * 22))) * (1 - dk) + 0.95 * dk;   // ...back knee out behind
    const L = 16, hipY = -16 + DROP, Le = L * (1 - 0.36 * dk);
    const place = (leg, boot, hipX, rot, liftPhase) => {
      leg.setRotation(rot).setScale(1 + 0.2 * dk, 1 - 0.36 * dk);                  // bent + compressed (a bit chunkier)
      const lift = run > 0 ? Math.max(0, liftPhase) * 3.2 * run : 0;
      boot.setPosition(hipX - Math.sin(rot) * Le, Math.min(air ? 99 : 0.5, hipY + Math.cos(rot) * Le) - lift + air * -3);   // boots stay on the ground
      boot.setRotation(rot * 0.35 * (1 - dk)).setScale(1 + 0.06 * dk, 1);
      leg.setPosition(hipX, hipY - lift * 0.6);
    };
    place(this.legF, this.bootF, 7, rotF, sw);
    place(this.legB, this.bootB, -6, rotB, -sw);

    const idle = (1 - run) * (1 - air);
    this.torso.setPosition(sw * 1.9 * run + 1.5 * dk, -16 - (1 - Math.cos(this.wp * 2)) * 0.9 * run + Math.sin(t * 2.6) * 0.7 * idle + DROP);
    this.torso.setRotation(sw * 0.1 * run + 0.06 * run - P.vh * 0.00022 * air + (P.bashLean || 0) + 0.13 * dk);  // leans in when crouched
    this.updateCloth(P, dt, grounded, fly);
    if (this.morph >= 0) {                                       // ~0.9s: the apron spins (faster and faster), then the cape unfurls
      this.morph = Math.min(1, this.morph + dt / 0.9);
      const m = this.morph, spinK = Math.min(1, m / 0.6), sx = Math.cos(spinK * spinK * Math.PI * 7);
      this.apron.setVisible(m < 0.6).setScale(sx, 1); this.apronB.setVisible(m < 0.6).setScale(sx, 1);
      const cp = Math.max(0, (m - 0.5) / 0.5);
      for (const c of this.capeS) c.setVisible(cp > 0).setScale(cp, 0.4 + 0.6 * cp);
      this.collar.setVisible(cp > 0).setScale(Math.min(1, cp * 2));
      if (m >= 1) { this.chef = false; this.morph = -1; for (const c of this.capeS) c.setScale(1); this.collar.setScale(1); }
    }
    const stretchY = air ? 1 + Math.max(-0.1, Math.min(0.12, P.vh / 2000)) : 1;
    this.torso.setScale(1 + 0.16 * Math.max(0, sq) - 0.08 * Math.max(0, -sq) + Math.sin(t * 2.6) * 0.012 * idle,
      stretchY - 0.18 * Math.max(0, sq) + 0.1 * Math.max(0, -sq) + Math.sin(t * 2.6 + 1) * 0.018 * idle);
    if (dk > 0) this.torso.setScale(this.torso.scaleX * (1 + 0.04 * dk), this.torso.scaleY * (1 - 0.05 * dk));   // only a hint of squash

    // belly jiggle on every footfall

    // belly jiggle: a little spring driven by the waddle and by landings
    this.bo = this.bo || 0; this.bv = this.bv || 0;
    const drive = run * Math.sin(this.wp * 2) * 3;
    this.bv += (-this.bo * 170 - this.bv * 8 + drive * 55) * dt;
    this.bo = Math.max(-1.4, Math.min(1.4, this.bo + this.bv * dt));
    // (no belly wobble)

    // ---- chef-hat helmet lags behind
    const vyLag = Math.max(-7, Math.min(8, P.vh * 0.011));
    this.hat.setPosition(3 - sw * 2.2 * run, -54 + vyLag * 0.6 + Math.sin(t * 5) * 0.5);
    this.hat.setRotation(-sw * 0.16 * run - P.vh * 0.0004 - 0.04 * Math.sin(t * 5));
    this.hat.setScale(1 + vyLag * -0.006, 1 + vyLag * 0.012 + Math.sin(t * 5.5) * 0.015);
    this.head.setPosition(2 + sw * 0.6 * run, -44 + vyLag * 0.2); this.crack.setPosition(this.head.x, this.head.y);

    // ---- arms
    this.armB.setRotation(-sw * 0.8 * run + 0.35 + Math.sin(t * 2.2) * 0.07 * idle - air * 1.2 + (P.grabbed ? Math.sin(t * 23 + 1) * 1.2 - 1 : 0));   // (and flapping the other arm)
    if (P.firing > 0.09) this.recoil = 1;
    this.recoil = Math.max(0, this.recoil - dt * 9);
    this.gunArm.setPosition(this.torso.x + 4 - this.recoil * 3 + (P.bashX || 0), this.torso.y - 26 + sw * 0.6 * run + (P.bashY || 0));
    const flail = P.grabbed ? Math.sin(this.t * 26) * 1.1 + Math.sin(this.t * 41) * 0.35 - 0.6 : 0;      // grabbed: waving the useless gun about hysterically
    this.gunArm.setRotation(-this.recoil * 0.07 + sw * 0.03 * run + this.torso.rotation * 0.4 - (P.aimA || 0) + (P.bashA || 0) + flail);   // + melee swing
    this.gunPivot.setRotation(P.bashSpin || 0);                                                     // melee: the gun flips round, butt first   // twin-stick aim tilts the gun
    if (this.tipSpins !== false) this.auger.setTexture('auger' + augerFrame);
    this.tanks.setPosition(this.torso.x - 16, this.torso.y - 24);

    this.setPowered(P.power > 0);
    this.root.setPosition(x, y).setScale(z * RIG_SCALE * (P.facing < 0 ? -1 : 1), z * RIG_SCALE).setAlpha(alpha);   // (no whole-body squash: the crouch is in the legs)
  }
}
