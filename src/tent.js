// ================================================================= THE TENT (v3.103; v3.109: redrawn as a smooth illustration): safe and snug
// The tent at Moon Camp is a station now: walk up, press DOWN, CRAWL IN. Inside, nothing to do but be cosy:
// a lantern swinging on its string, fairy lights along the canvas, Chris in his sleeping bag, Biscuit curled up at his
// feet, a mug of cocoa steaming, Bessie's photo pinned up, a little radio playing a lullaby, and through the tied-back
// flap the campfire glowing and the stars going over. Tap things to fiddle with them. CRAWL OUT to go back.
const TENT_SAYS = {
  chris: ['Five more minutes...', 'Is that a rat? ...No. Just Clank.', 'Bessie would love this tent.', 'Who needs a ranch when you\'ve got a moon?', 'Zzz... grate... zzz... cheddar... zzz...', 'Tomorrow. I\'ll save the galaxy tomorrow.'],
  dog: ['(Biscuit sighs happily and stretches all four legs at once.)', '(His tail thumps the groundsheet twice.)', '(He rolls over for a belly rub. The helmet makes it a slow roll.)', '(A tiny woof in his sleep. He\'s chasing something.)'],
  mug: ['Cocoa. With a slice of cheese in it. Don\'t judge.', 'Still warm. Fridge-o-tron charged me 40 cheddar for it.', '*slurp*'],
  photo: ['Miss you, old girl. Not long now.', 'Bessie. Best cow on any planet.', 'She\'s smiling in this one. She\'s always smiling.'],
  flap: ['The fire crackles. Zib is still out there toasting cheese.', 'Stars going over. A rat-ship, far away. Not tonight, lads.', 'Henrietta is clucking at the dark. Brave hen.'],
  book: ['THE GREAT GRATER: A CAUTIONARY TALE. Again? Fine.', 'Chapter 3: The Brie-muda Triangle. Spooky.', 'Someone has drawn a moustache on the Rat King.'],
  radio: ['A little lullaby on the moon station.', 'Click.'],
  mobile: ['Mooo-bile. Zib made it.', 'Round and round go the Bessies.', 'Wheee! Four tiny cows!', 'One day the real one will be home.'],
  lantern: []
};

// ---------------------------------------------------------------- the art (v3.109)
// Not pixel art: a storybook illustration drawn with curves at the screen's own resolution (ink outlines, soft
// gradients), because a close-up in big pixels looked crude. Everything is in a 480-wide design space, scaled by k.
const TN = { ink: '#1a1020' };
// (v3.116) PIXELLED UP: every piece is still drawn as a smooth illustration, but small (TN_PX art pixels per design
// unit), then turned into pixel art and blown back up with square pixels:
//   - hard edges (no half-see-through pixels)
//   - its OWN small palette: the piece's most-used colours, kept apart from each other (so the painted colours stay,
//     but shading falls into a few flat cel bands). The background gets a light 4x4 ordered dither so its big
//     gradients band nicely; the characters get none, so they stay clean
const TN_PX = 0.46, TN_BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function tnCanvas(scene, key, w, h, k, draw) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const bg = key === 'tn_bg', N = bg ? 22 : 12, SEP = bg ? 26 : 34, DITH = bg ? 16 : 0;
  const lw = Math.ceil(w * TN_PX), lh = Math.ceil(h * TN_PX), low = document.createElement('canvas'); low.width = lw; low.height = lh;
  const c = low.getContext('2d', { willReadFrequently: true });
  c.scale(TN_PX, TN_PX); c.lineJoin = 'round'; c.lineCap = 'round'; draw(c);
  const im = c.getImageData(0, 0, lw, lh), D = im.data, hist = new Map();
  for (let i = 0; i < D.length; i += 4) { if (D[i + 3] < 128) continue; const q = ((D[i] >> 3) << 10) | ((D[i + 1] >> 3) << 5) | (D[i + 2] >> 3); hist.set(q, (hist.get(q) || 0) + 1); }
  const cand = [...hist.entries()].sort((p, q) => q[1] - p[1]).map(([q]) => [((q >> 10) & 31) * 8 + 4, ((q >> 5) & 31) * 8 + 4, (q & 31) * 8 + 4]), pal = [];
  const dist = (P, r, g, b) => (P[0] - r) * (P[0] - r) * 0.9 + (P[1] - g) * (P[1] - g) * 1.2 + (P[2] - b) * (P[2] - b) * 0.8;
  for (const q of cand) { if (pal.length >= N) break; if (pal.every(P => dist(P, q[0], q[1], q[2]) > SEP * SEP)) pal.push(q); }
  if (!pal.length) pal.push([0, 0, 0]);
  const memo = new Map();
  for (let y = 0, i = 0; y < lh; y++) for (let x = 0; x < lw; x++, i += 4) {
    if (D[i + 3] < 128) { D[i + 3] = 0; continue; }
    const d = DITH ? (TN_BAYER[(y & 3) * 4 + (x & 3)] / 15 - 0.5) * DITH : 0, r = D[i] + d, g = D[i + 1] + d, b = D[i + 2] + d;
    const kk = ((r >> 2) << 16) | ((g >> 2) << 8) | (b >> 2); let best = memo.get(kk);
    if (best === undefined) { let bd = 1e12; for (let j = 0; j < pal.length; j++) { const e = dist(pal[j], r, g, b); if (e < bd) { bd = e; best = j; } } memo.set(kk, best); }
    D[i] = pal[best][0]; D[i + 1] = pal[best][1]; D[i + 2] = pal[best][2]; D[i + 3] = 255;
  }
  c.putImageData(im, 0, 0);
  const T = scene.textures.createCanvas(key, Math.ceil(w * k), Math.ceil(h * k)), o = T.getContext();
  o.imageSmoothingEnabled = false; o.drawImage(low, 0, 0, lw, lh, 0, 0, w * k, h * k);
  T.refresh(); T.setFilter(Phaser.Textures.FilterMode.NEAREST);
}
// a closed smooth shape through points
function tnPath(c, pts) {
  const n = pts.length, m = i => [(pts[i % n][0] + pts[(i + 1) % n][0]) / 2, (pts[i % n][1] + pts[(i + 1) % n][1]) / 2];
  c.beginPath(); const s = m(0); c.moveTo(s[0], s[1]);
  for (let i = 1; i <= n; i++) { const p = pts[i % n], q = m(i); c.quadraticCurveTo(p[0], p[1], q[0], q[1]); }
  c.closePath();
}
// fill a shape, shade inside it (fn draws while clipped), then ink it
function tnBlob(c, pts, fill, shade, lw) {
  tnPath(c, pts); c.fillStyle = fill; c.fill();
  if (shade) { c.save(); tnPath(c, pts); c.clip(); shade(c); c.restore(); }
  if (lw !== 0) { tnPath(c, pts); c.lineWidth = lw || 2.2; c.strokeStyle = TN.ink; c.stroke(); }
}
const tnEll = (c, x, y, rx, ry, fill, a) => { c.save(); if (a !== undefined) c.globalAlpha = a; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 6.2832); c.fillStyle = fill; c.fill(); c.restore(); };
const tnLine = (c, pts, col, lw) => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); if (pts.length === 3) c.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]); else for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.strokeStyle = col; c.lineWidth = lw; c.stroke(); };

function makeTentArt(scene, k, LH) {
  const F0 = LH - 78, AX = 240, AY = -16;
  // ---- the tent itself: a little A-frame, the ridge just overhead, lit warm from the lantern
  tnCanvas(scene, 'tn_bg', 480, LH, k, c => {
    c.fillStyle = '#1c0d08'; c.fillRect(0, 0, 480, LH);
    const wall = (pts, g) => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fillStyle = g; c.fill(); };
    let g = c.createLinearGradient(0, 0, 240, 0); g.addColorStop(0, '#3a1a0c'); g.addColorStop(0.55, '#8a4a1c'); g.addColorStop(1, '#b8682a');
    wall([[AX, AY], [128, F0], [-70, LH + 12], [-70, AY]], g);
    g = c.createLinearGradient(480, 0, 240, 0); g.addColorStop(0, '#4a220e'); g.addColorStop(0.5, '#a05a22'); g.addColorStop(1, '#c87a30');
    wall([[AX, AY], [352, F0], [550, LH + 12], [550, AY]], g);
    g = c.createLinearGradient(0, 0, 0, F0); g.addColorStop(0, '#9a5420'); g.addColorStop(1, '#c47a32');
    wall([[AX, AY], [128, F0], [352, F0]], g);
    g = c.createLinearGradient(0, F0, 0, LH); g.addColorStop(0, '#2c3350'); g.addColorStop(1, '#161a2c');
    wall([[128, F0], [352, F0], [550, LH + 12], [-70, LH + 12]], g);
    // the canvas: seams fanning from the ridge, a soft sag, stitching along the floor
    c.globalAlpha = 0.35; for (const [x, y] of [[20, LH], [-40, 120], [70, F0 + 40], [460, LH], [520, 120], [410, F0 + 40], [190, F0], [290, F0]]) tnLine(c, [[AX, AY], [x, y]], '#4a1f0a', 1.4); c.globalAlpha = 1;
    tnLine(c, [[AX, AY], [128, F0]], '#5a2a10', 2); tnLine(c, [[AX, AY], [352, F0]], '#5a2a10', 2); tnLine(c, [[128, F0], [352, F0]], '#3a1a0c', 2.5);
    tnLine(c, [[128, F0], [-70, LH + 12]], '#1a1020', 2); tnLine(c, [[352, F0], [550, LH + 12]], '#1a1020', 2);
    c.setLineDash([3, 4]); tnLine(c, [[134, F0 - 4], [346, F0 - 4]], '#e8c080', 1); c.setLineDash([]);
    // the door: zipped most of the way, the bottom folded open on the night, the fire's glow low down
    tnLine(c, [[AX, 30], [AX, F0 - 62]], '#3a1a0c', 2); for (let y = 34; y < F0 - 62; y += 5) tnLine(c, [[AX - 2, y], [AX + 2, y]], '#e8c080', 1);
    c.save(); c.beginPath(); c.moveTo(AX, F0 - 64); c.quadraticCurveTo(AX - 6, F0 - 24, AX - 17, F0); c.lineTo(AX + 17, F0); c.quadraticCurveTo(AX + 6, F0 - 24, AX, F0 - 64); c.closePath(); c.clip();
    g = c.createLinearGradient(0, F0 - 64, 0, F0); g.addColorStop(0, '#0a0e2c'); g.addColorStop(0.7, '#2a1c44'); g.addColorStop(1, '#c8581a'); c.fillStyle = g; c.fillRect(AX - 20, F0 - 66, 40, 68);
    for (const [x, y, r] of [[-4, -44, 0.9], [5, -36, 0.7], [-2, -26, 0.6], [7, -50, 0.6], [-8, -18, 0.8], [3, -14, 0.5]]) tnEll(c, AX + x, F0 + y, r, r, '#ffffff');
    c.restore();
    c.beginPath(); c.moveTo(AX, F0 - 64); c.quadraticCurveTo(AX - 6, F0 - 24, AX - 17, F0); c.moveTo(AX, F0 - 64); c.quadraticCurveTo(AX + 6, F0 - 24, AX + 17, F0); c.strokeStyle = TN.ink; c.lineWidth = 2; c.stroke();
    for (const sx of [-1, 1]) tnBlob(c, [[AX + sx * 16, F0 - 22], [AX + sx * 25, F0 - 16], [AX + sx * 27, F0 - 3], [AX + sx * 17, F0 - 1]], '#d98a3a', null, 1.6);   // the rolled flaps
    // the fairy lights' wire (the bulbs glow on top)
    tnLine(c, [[AX, 6], [176, 70], [140, F0 - 16]], '#2a1408', 1.2); tnLine(c, [[AX, 6], [304, 70], [340, F0 - 16]], '#2a1408', 1.2);
    // Bessie's photo, taped up a bit wonky
    c.save(); c.translate(199, F0 - 50); c.rotate(-0.08);
    c.fillStyle = TN.ink; c.fillRect(-17, -21, 34, 42); c.fillStyle = '#faf4e6'; c.fillRect(-15.5, -19.5, 31, 39); c.fillStyle = '#9ad0f0'; c.fillRect(-12.5, -16.5, 25, 25); c.fillStyle = '#7ac070'; c.fillRect(-12.5, 2, 25, 6.5);
    tnBlob(c, [[-8, -4], [-6, -10], [3, -11], [8, -7], [8, 2], [-7, 3]], '#ffffff', q => { tnEll(q, 2, -6, 3, 2.5, '#2a2438'); tnEll(q, -5, 0, 2, 2, '#2a2438'); }, 1.2);
    tnBlob(c, [[-12, -9], [-7, -11], [-5, -5], [-9, -2], [-12, -4]], '#ffffff', null, 1.2); tnEll(c, -10.5, -4.5, 2, 1.4, '#f0a0b0'); tnEll(c, -9.5, -8, 0.6, 0.6, TN.ink);
    c.fillStyle = TN.ink; c.fillRect(-5, 2, 1.5, 4); c.fillRect(4, 2, 1.5, 4);
    c.fillStyle = '#d83a2a'; c.font = 'bold 5px sans-serif'; c.textAlign = 'center'; c.fillText('BESSIE', 0, 16);
    c.fillStyle = 'rgba(240,230,200,0.85)'; c.fillRect(-6, -24, 12, 5); c.restore();
    // by the door: his boots, and the pup's helmet (he doesn't need it in here)
    for (const bx of [286, 300]) tnBlob(c, [[bx, F0 - 2], [bx, F0 - 20], [bx + 9, F0 - 20], [bx + 10, F0 - 9], [bx + 17, F0 - 6], [bx + 17, F0 - 1]], '#f4f4fa', q => { q.fillStyle = '#d83a2a'; q.fillRect(bx - 1, F0 - 21, 12, 4); q.fillStyle = '#c8c8d8'; q.fillRect(bx - 1, F0 - 4, 20, 4); }, 1.6);
    c.globalAlpha = 0.9; tnEll(c, 324, F0 - 9, 10, 10, '#bfe6ff'); c.globalAlpha = 1; c.beginPath(); c.arc(324, F0 - 9, 10, 0, 6.2832); c.strokeStyle = TN.ink; c.lineWidth = 1.6; c.stroke(); tnEll(c, 320, F0 - 13, 3, 2, '#ffffff', 0.8); c.fillStyle = '#9aa4b8'; c.fillRect(316, F0 - 1.5, 16, 3);
    // the rag rug under it all
    tnBlob(c, [[60, LH - 44], [240, LH - 58], [430, LH - 44], [470, LH - 14], [240, LH + 6], [10, LH - 14]], '#8a2a34', q => { q.lineWidth = 5; for (const [col, d] of [['#c8902a', 10], ['#3a6aa8', 20], ['#e8d8b0', 30]]) { tnPath(q, [[60 + d, LH - 44 + d * 0.4], [240, LH - 58 + d * 0.5], [430 - d, LH - 44 + d * 0.4], [470 - d * 1.6, LH - 14], [240, LH + 6 - d * 0.6], [10 + d * 1.6, LH - 14]]); q.strokeStyle = col; q.stroke(); } }, 2);
    // cocoa and the little radio, down by his feet
    const rx = 424, ry = LH - 62;
    tnBlob(c, [[rx, ry + 30], [rx, ry + 6], [rx + 38, ry + 6], [rx + 38, ry + 30]], '#c83a3a', q => { tnEll(q, rx + 26, ry + 18, 8, 8, '#3a2a34'); for (let i = -6; i <= 6; i += 3) tnLine(q, [[rx + 20, ry + 18 + i], [rx + 32, ry + 18 + i]], '#6a5a64', 0.8); q.fillStyle = '#ffd23f'; q.fillRect(rx + 5, ry + 11, 9, 5); tnEll(q, rx + 9, ry + 23, 2.5, 2.5, '#f4ecd8'); }, 2);
    tnLine(c, [[rx + 8, ry + 6], [rx + 26, ry - 16]], '#9aa4b8', 1.6); tnEll(c, rx + 26, ry - 16, 1.6, 1.6, '#ffd23f');
    const mx = 398, my = LH - 40;
    tnBlob(c, [[mx, my + 16], [mx - 1, my], [mx + 14, my], [mx + 13, my + 16]], '#fbf6ea', q => { q.fillStyle = '#d83a2a'; q.fillRect(mx - 2, my + 6, 18, 3); tnEll(q, mx + 6.5, my + 1, 6.5, 2.2, '#6a3a1a'); }, 1.8);
    c.beginPath(); c.arc(mx + 15, my + 8, 4.5, -1.2, 1.2); c.strokeStyle = TN.ink; c.lineWidth = 3.6; c.stroke(); c.strokeStyle = '#fbf6ea'; c.lineWidth = 1.6; c.stroke();
    // dark corners
    g = c.createRadialGradient(250, LH * 0.55, 90, 250, LH * 0.55, 330); g.addColorStop(0, 'rgba(20,8,10,0)'); g.addColorStop(1, 'rgba(14,6,10,0.78)'); c.fillStyle = g; c.fillRect(0, 0, 480, LH);
  });
  // ---- Chris: on his side, fast asleep. Pillow, chef's hat still on, the big moustache, a puffy sleeping bag
  tnCanvas(scene, 'tn_chris', 410, 150, k, c => {
    tnEll(c, 210, 143, 200, 7, '#0a0810', 0.5);
    tnBlob(c, [[4, 122], [14, 92], [60, 82], [124, 88], [142, 112], [132, 138], [70, 144], [12, 140]], '#fbf7ee', q => { const g = q.createLinearGradient(0, 100, 0, 146); g.addColorStop(0, 'rgba(190,170,190,0)'); g.addColorStop(1, 'rgba(150,130,170,0.55)'); q.fillStyle = g; q.fillRect(0, 80, 150, 70); tnLine(q, [[20, 100], [40, 108], [30, 124]], 'rgba(150,130,170,0.5)', 1.5); });
    // (v3.110) the body first, so the head and the arm have something to join: a shoulder in white pyjamas poking out of
    // the bag, a neck up to the head; the bag's opening runs diagonally below the shoulder with its collar turned back
    tnBlob(c, [[116, 130], [120, 102], [136, 82], [160, 76], [178, 88], [182, 112], [164, 130], [136, 136]], '#ffffff', q => { const g = q.createLinearGradient(0, 76, 0, 136); g.addColorStop(0.35, 'rgba(170,170,210,0)'); g.addColorStop(1, 'rgba(150,150,200,0.75)'); q.fillStyle = g; q.fillRect(110, 70, 80, 70); tnLine(q, [[130, 96], [140, 108], [134, 122]], 'rgba(130,130,180,0.55)', 1.4); }, 2.2);
    tnBlob(c, [[102, 128], [114, 108], [132, 104], [136, 120], [124, 136], [108, 140]], '#eeb08a', q => tnEll(q, 122, 132, 16, 8, '#c98a68', 0.6), 2);
    const bag = [[108, 147], [118, 130], [138, 116], [166, 106], [188, 84], [200, 68], [262, 72], [322, 88], [376, 104], [404, 124], [398, 142], [370, 147], [140, 147]];
    tnBlob(c, bag, '#2f8a94', q => {
      let g = q.createLinearGradient(0, 60, 0, 150); g.addColorStop(0, 'rgba(160,240,230,0.45)'); g.addColorStop(0.35, 'rgba(160,240,230,0)'); g.addColorStop(1, 'rgba(10,30,60,0.55)'); q.fillStyle = g; q.fillRect(100, 50, 320, 110);
      for (let x = 176; x < 400; x += 36) { tnLine(q, [[x, 56], [x - 10, 104], [x - 4, 150]], 'rgba(12,50,70,0.75)', 2); tnLine(q, [[x + 3, 60], [x - 7, 104], [x - 1, 150]], 'rgba(170,240,230,0.28)', 1.5); }
      for (const [x, y] of [[212, 96], [250, 112], [286, 100], [322, 120], [356, 116], [232, 130]]) { q.fillStyle = '#ffd23f'; q.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - 1.57, r = i % 2 ? 2 : 4.6; q.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } q.fill(); }   // little stars on it
    }, 2.4);
    tnBlob(c, [[104, 147], [114, 128], [136, 112], [164, 102], [186, 80], [198, 64], [210, 70], [196, 94], [172, 116], [146, 124], [130, 136], [122, 147]], '#f6e2b4', q => { q.setLineDash([2.5, 3]); tnLine(q, [[116, 140], [140, 118], [170, 108]], '#d83a2a', 1.4); tnLine(q, [[170, 108], [190, 90], [202, 70]], '#d83a2a', 1.4); q.setLineDash([]); }, 2.2);
    // the head on top, tilted over on the pillow, chin tucked down towards his chest
    c.save(); c.translate(96, 110); c.rotate(-0.3); c.translate(-96, -110);
    // the chef's hat, squashed on the pillow
    tnBlob(c, [[54, 86], [34, 70], [34, 44], [52, 24], [78, 20], [100, 24], [118, 38], [126, 58], [118, 76], [98, 86]], '#ffffff', q => { const g = q.createLinearGradient(30, 20, 120, 90); g.addColorStop(0.3, 'rgba(180,180,215,0)'); g.addColorStop(1, 'rgba(160,160,205,0.7)'); q.fillStyle = g; q.fillRect(20, 10, 120, 90); for (const [a, b, d] of [[[58, 78], [50, 52], [58, 30]], [[78, 80], [74, 50], [80, 24]], [[98, 80], [100, 54], [102, 30]]]) tnLine(q, [a, b, d], 'rgba(120,120,170,0.6)', 1.5); }, 2.4);
    tnBlob(c, [[52, 92], [56, 76], [84, 70], [112, 74], [120, 88], [112, 96], [84, 92], [58, 98]], '#f0eef8', q => tnEll(q, 90, 96, 34, 6, '#b8b8d8', 0.6), 2.2);
    // the head
    tnBlob(c, [[56, 110], [60, 92], [78, 82], [100, 80], [120, 88], [130, 106], [126, 124], [110, 136], [88, 140], [68, 132]], '#f6bd96', q => { const g = q.createRadialGradient(84, 100, 10, 96, 112, 46); g.addColorStop(0, 'rgba(255,225,200,0.5)'); g.addColorStop(0.6, 'rgba(255,225,200,0)'); g.addColorStop(1, 'rgba(190,100,70,0.55)'); q.fillStyle = g; q.fillRect(50, 76, 90, 70); tnEll(q, 72, 118, 9, 6, '#ff8a8a', 0.45); tnEll(q, 120, 116, 8, 6, '#ff8a8a', 0.45); }, 2.4);
    tnBlob(c, [[54, 104], [50, 96], [56, 90], [62, 96], [62, 108]], '#eeb08a', q => tnEll(q, 57, 100, 2.4, 4, '#d08a6a'), 2);   // ear
    tnBlob(c, [[58, 96], [64, 86], [74, 82], [70, 92], [64, 100]], '#7a4a22', null, 1.6);                                    // a tuft of hair under the hat
    // sleeping eyes, bushy brows
    for (const ex of [82, 110]) { c.beginPath(); c.arc(ex, 101, 6, 0.25, Math.PI - 0.25); c.strokeStyle = TN.ink; c.lineWidth = 2.2; c.stroke(); for (const d of [-4, 0, 4]) tnLine(c, [[ex + d, 106.5 - Math.abs(d) * 0.3], [ex + d * 1.3, 109.5 - Math.abs(d) * 0.3]], TN.ink, 1.2); }
    tnBlob(c, [[72, 93], [80, 88], [91, 90], [90, 94], [80, 93]], '#6a3e1c', null, 1.4); tnBlob(c, [[102, 90], [112, 88], [121, 93], [112, 93], [103, 94]], '#6a3e1c', null, 1.4);
    // the nose, then (as its own sprite) the moustache
    tnBlob(c, [[88, 112], [90, 104], [98, 101], [106, 105], [107, 113], [98, 118]], '#f2a482', q => { tnEll(q, 95, 106, 3, 2, '#ffe0d0', 0.9); tnEll(q, 100, 116, 8, 3, '#d8805e', 0.5); }, 2);
    tnEll(c, 98, 131, 4.5, 3.4, '#5a1a1a'); c.beginPath(); c.ellipse(98, 131, 4.5, 3.4, 0, 0, 6.2832); c.strokeStyle = TN.ink; c.lineWidth = 1.6; c.stroke();
    c.restore();

  });
  tnCanvas(scene, 'tn_mo', 80, 30, k, c => {
    for (const s of [-1, 1]) { const X = x => 40 + s * x; tnBlob(c, [[X(0), 6], [X(10), 3], [X(24), 6], [X(34), 14], [X(37), 24], [X(28), 26], [X(18), 21], [X(8), 17], [X(0), 14]], '#8a5426', q => { tnLine(q, [[X(4), 8], [X(16), 8], [X(30), 18]], '#b87a3c', 2); tnLine(q, [[X(4), 13], [X(16), 15], [X(28), 23]], '#5e3614', 1.6); }, 2); }
  });
  // his arm, out of the bag and round the pup
  tnCanvas(scene, 'tn_arm', 120, 50, k, c => {
    tnBlob(c, [[4, 20], [12, 8], [40, 4], [74, 12], [98, 24], [96, 38], [70, 36], [38, 30], [10, 34]], '#ffffff', q => { const g = q.createLinearGradient(0, 4, 0, 40); g.addColorStop(0.4, 'rgba(170,170,210,0)'); g.addColorStop(1, 'rgba(150,150,200,0.7)'); q.fillStyle = g; q.fillRect(0, 0, 120, 50); tnLine(q, [[36, 8], [40, 20], [36, 30]], 'rgba(130,130,180,0.6)', 1.4); q.fillStyle = '#d83a2a'; q.beginPath(); q.moveTo(82, 12); q.lineTo(102, 22); q.lineTo(98, 42); q.lineTo(78, 34); q.fill(); }, 2.2);
    tnEll(c, 7, 21, 9, 11.5, '#ffffff');                                      // (no outline at the shoulder end: it runs into the shoulder)
    tnBlob(c, [[94, 24], [104, 22], [114, 28], [116, 38], [108, 44], [96, 40]], '#f6bd96', q => { tnLine(q, [[104, 30], [110, 34]], '#c98a68', 1.2); tnLine(q, [[102, 35], [108, 39]], '#c98a68', 1.2); }, 2);
  });
  // ---- Biscuit, curled up asleep in the crook of his arm (helmet off)
  tnCanvas(scene, 'tn_pup', 150, 96, k, c => {
    tnBlob(c, [[30, 78], [22, 52], [36, 28], [70, 16], [108, 20], [134, 40], [138, 68], [122, 86], [60, 90]], '#e0a45c', q => { const g = q.createLinearGradient(0, 16, 0, 92); g.addColorStop(0, 'rgba(255,225,170,0.55)'); g.addColorStop(0.4, 'rgba(255,225,170,0)'); g.addColorStop(1, 'rgba(120,60,20,0.6)'); q.fillStyle = g; q.fillRect(0, 0, 150, 96); tnEll(q, 96, 34, 20, 12, '#fff4dc', 0.9); tnEll(q, 74, 88, 36, 12, '#fff4dc', 0.9); tnLine(q, [[112, 44], [124, 60], [116, 80]], 'rgba(120,60,20,0.5)', 1.6); }, 2.4);
    tnBlob(c, [[62, 84], [66, 76], [80, 74], [90, 80], [86, 90], [70, 91]], '#fff4dc', q => tnLine(q, [[76, 80], [76, 88]], '#c8a880', 1), 1.8);    // a paw
    // the head, resting; a floppy ear; shut eye; wet nose
    tnBlob(c, [[4, 66], [8, 46], [24, 34], [46, 34], [60, 46], [62, 64], [50, 78], [26, 82], [8, 78]], '#e8b06a', q => { tnEll(q, 14, 70, 16, 12, '#fff4dc'); tnEll(q, 40, 44, 16, 8, '#ffe0a8', 0.6); tnEll(q, 34, 68, 6, 4, '#ff9a9a', 0.4); }, 2.4);
    tnBlob(c, [[40, 36], [56, 30], [68, 42], [68, 62], [58, 72], [50, 56], [44, 46]], '#9a6030', q => tnLine(q, [[52, 38], [62, 50], [60, 64]], '#6e3e18', 1.6), 2.2);
    c.beginPath(); c.arc(30, 54, 5, 0.3, Math.PI - 0.3); c.strokeStyle = TN.ink; c.lineWidth = 2; c.stroke();
    tnBlob(c, [[2, 62], [6, 58], [12, 60], [11, 67], [5, 68]], '#2a1c20', q => tnEll(q, 6, 61, 1.6, 1, '#ffffff', 0.8), 1.4);
    tnLine(c, [[10, 72], [16, 76], [24, 74]], TN.ink, 1.4);
  });
  tnCanvas(scene, 'tn_tail', 46, 30, k, c => tnBlob(c, [[4, 22], [8, 10], [22, 4], [38, 8], [42, 18], [34, 22], [22, 16], [12, 26]], '#e0a45c', q => tnEll(q, 38, 14, 8, 8, '#fff4dc'), 2.2));
  // ---- the lantern, a mobile cow, a dream bubble's bone
  tnCanvas(scene, 'tn_lamp', 40, 62, k, c => {
    c.beginPath(); c.arc(20, 14, 10, Math.PI, 0); c.strokeStyle = TN.ink; c.lineWidth = 2.4; c.stroke(); c.strokeStyle = '#b89060'; c.lineWidth = 1.2; c.stroke();
    tnBlob(c, [[10, 18], [14, 12], [26, 12], [30, 18]], '#8a6a48', null, 2);
    tnBlob(c, [[8, 50], [8, 20], [32, 20], [32, 50]], '#ffe9a0', q => { const g = q.createRadialGradient(20, 36, 2, 20, 36, 18); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#ffe080'); g.addColorStop(1, '#f0a040'); q.fillStyle = g; q.fillRect(4, 16, 32, 38); tnBlob(q, [[20, 44], [15, 38], [20, 26], [25, 38]], '#ff9a2a', null, 0); tnBlob(q, [[20, 43], [17.5, 39], [20, 32], [22.5, 39]], '#fff6c0', null, 0); }, 2.2);
    for (const x of [14, 26]) tnLine(c, [[x, 20], [x, 50]], '#6a5038', 1.6);
    tnBlob(c, [[6, 58], [8, 50], [32, 50], [34, 58]], '#8a6a48', null, 2);
  });
  tnCanvas(scene, 'tn_cow', 44, 34, k, c => {
    for (const x of [13, 19, 27, 33]) { c.fillStyle = TN.ink; c.fillRect(x - 2.5, 22, 5, 10); c.fillStyle = '#fbf7f0'; c.fillRect(x - 1.3, 22, 2.6, 8); }
    tnBlob(c, [[8, 22], [8, 10], [18, 6], [32, 7], [38, 14], [36, 24], [22, 27]], '#fbf7f0', q => { tnEll(q, 24, 11, 6, 4.5, '#2a2438'); tnEll(q, 33, 21, 4, 3.5, '#2a2438'); tnEll(q, 13, 22, 3, 3, '#2a2438'); }, 1.8);
    tnBlob(c, [[2, 12], [4, 5], [11, 4], [15, 9], [13, 17], [6, 18]], '#fbf7f0', q => tnEll(q, 6, 15, 5, 3.5, '#f4a8b8'), 1.8);
    tnEll(c, 7, 9, 1, 1.2, TN.ink); tnLine(c, [[38, 14], [42, 20]], TN.ink, 1.4);
  });
  tnCanvas(scene, 'tn_bone', 30, 16, k, c => { tnBlob(c, [[6, 6], [3, 3], [5, 1], [8, 3], [22, 3], [25, 1], [27, 3], [24, 6], [24, 10], [27, 13], [25, 15], [22, 13], [8, 13], [5, 15], [3, 13], [6, 10]], '#fbf7f0', null, 1.6); });
  return { F0, AX, AY };
}

class TentScene extends Phaser.Scene {
  constructor() { super('tent'); }
  create() {
    makeTextures(this);
    this.cameras.main.setBackgroundColor('#0a0608'); this.cameras.main.fadeIn(500, 0, 0, 0);
    Sound.init(); this.radio = true; Sound.music('tent');
    this.lamp = 1; this.lampTo = 1; this.t = 0; this.saysI = {}; this.parts = []; this.cap = null; this.going = false;
    this.mob = { a: 0, v: 0.5 }; this.snug = 0.35; this.maxed = false; this.snore = 0; this.wag = 0; this.dream = 0;
    try { this.cowsN = +(localStorage.getItem('lc_cows') || 0); } catch (e) { this.cowsN = 0; }
    if (typeof Ach !== 'undefined') Ach.unlock('snug');
    this.build();
    this.scale.on('resize', this.build, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.build, this));
    const kb = this.input.keyboard;
    if (kb) { kb.on('keydown-ESC', () => this.out()); kb.on('keydown-SPACE', () => this.tap('chris')); kb.on('keydown-M', () => this.tap('mobile')); kb.on('keydown-L', () => this.tap('lantern')); kb.on('keydown-R', () => this.tap('radio')); kb.on('keydown-C', () => this.tap('flap')); kb.on('keydown-D', () => this.tap('dog')); }
    const padOff = typeof Pad !== 'undefined' ? Pad.on(b => { const m = { b: 'out', back: 'out', a: 'chris', x: 'dog', y: 'mobile', lb: 'lantern', rb: 'radio', up: 'flap', left: 'photo', right: 'mug' }[b]; if (m) this.tap(m); }) : null;
    if (padOff) this.events.once('shutdown', padOff);
    this.input.on('pointerdown', p => { const h = (this.hits || []).find(q => p.x >= q.x && p.x <= q.x + q.w && p.y >= q.y && p.y <= q.y + q.h); if (h) this.tap(h.id); });
    this.time.delayedCall(900, () => this.say('Ahh. Safe and snug.'));
  }
  build() {
    const W = this.scale.width, H = this.scale.height, k = W / 480, LH = H / k;
    this.k = k; this.LH = LH; this.children.removeAll(true); this.parts = [];
    const G = this.geo = makeTentArt(this, k, LH), S = (x, y) => [x * k, y * k];
    this.add.image(0, 0, 'tn_bg').setOrigin(0).setDepth(0);
    if (!this.textures.exists('tent_pool')) {
      const T = this.textures.createCanvas('tent_pool', 256, 256), c = T.getContext(), gr = c.createRadialGradient(128, 128, 0, 128, 128, 128);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.7, 'rgba(255,255,255,0.15)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = gr; c.fillRect(0, 0, 256, 256); T.refresh();
    }
    // where things are (design space): Chris along the floor, the pup on the bag in front of his chest
    const CX = 36, CY = LH - 152; G.c = { x: CX, y: CY };
    this.chris = this.add.image(...S(CX, CY + 150), 'tn_chris').setOrigin(0, 1).setDepth(3);
    this.mo = this.add.image(...S(CX + 100, CY + 119), 'tn_mo').setOrigin(0.5, 0.35).setDepth(3.1);
    this.tail = this.add.image(...S(CX + 318, CY + 122), 'tn_tail').setOrigin(0.1, 0.8).setDepth(3.2);
    this.pup = this.add.image(...S(CX + 196, CY + 144), 'tn_pup').setOrigin(0, 1).setDepth(3.3);
    this.arm = this.add.image(...S(CX + 150, CY + 96), 'tn_arm').setOrigin(0.05, 0.4).setDepth(3.25);   // from the shoulder, round BEHIND the pup
    this.lampIm = this.add.image(0, 0, 'tn_lamp').setOrigin(0.5, 0.08).setDepth(4);
    this.cows = [0, 1, 2, 3].map(() => this.add.image(0, 0, 'tn_cow').setDepth(4.2));
    this.bone = this.add.image(0, 0, 'tn_bone').setDepth(5.2).setVisible(false);
    this.jump = this.add.image(0, 0, 'tn_cow').setDepth(0.5).setVisible(false);
    this.glow = this.add.image(0, 0, 'tent_pool').setDepth(4.5).setBlendMode(Phaser.BlendModes.ADD).setTint(0xb06a28);
    this.dark = this.add.graphics().setDepth(4.6);
    this.mobG = this.add.graphics().setDepth(4.1); this.fxG = this.add.graphics().setDepth(5); this.bulbG = this.add.graphics().setDepth(1);
    const f = (sz, col, o) => Object.assign({ fontFamily: PIXEL, fontSize: Math.max(8, Math.round(sz * k)) + 'px', color: col, stroke: '#1a1020', strokeThickness: 4 }, o || {});
    this.capT = this.add.text(W / 2, H - 8, '', f(6.5, '#fff0c8', { align: 'center', wordWrap: { width: Math.min(W - 60, 560) } })).setOrigin(0.5, 1).setDepth(6).setAlpha(0);
    this.zT = [0, 1, 2].map(i => this.add.text(0, 0, 'Z', f(7 + i * 3, '#dfe6ff')).setDepth(5.5).setOrigin(0.5));
    this.snugT = this.add.text(12, 10, '', f(5, '#ffd9a0')).setDepth(6); this.cowT = this.add.text(12, 10 + 22 * k, '', f(4.4, '#c8d4ff')).setDepth(6);
    const ob = this.add.text(W - 10, 10, 'CRAWL OUT (B)', { fontFamily: PIXEL, fontSize: '9px', color: '#ffffff', stroke: '#1a1020', strokeThickness: 3, backgroundColor: '#3a1a0c', padding: { x: 8, y: 6 } }).setOrigin(1, 0).setDepth(7);
    const B = (id, x, y, w, h) => ({ id, x: x * k, y: y * k, w: w * k, h: h * k });
    this.hits = [
      { id: 'out', x: ob.x - ob.width, y: ob.y, w: ob.width, h: ob.height },
      B('dog', CX + 196, CY + 50, 150, 96), B('chris', CX, CY + 16, 190, 134), B('lantern', 306, 0, 50, 80), B('mobile', 170, 0, 100, 62),
      B('photo', 178, G.F0 - 76, 44, 54), B('radio', 420, LH - 82, 50, 54), B('mug', 392, LH - 46, 26, 28), B('flap', 216, G.F0 - 70, 48, 72), B('chris', CX + 190, CY + 60, 220, 90)
    ];
    // the fairy lights: bulbs along the two wires
    this.bulbs = []; const bez = (p0, p1, p2, u) => [(1 - u) * (1 - u) * p0[0] + 2 * u * (1 - u) * p1[0] + u * u * p2[0], (1 - u) * (1 - u) * p0[1] + 2 * u * (1 - u) * p1[1] + u * u * p2[1]];
    for (const [p1, p2, o] of [[[176, 70], [140, G.F0 - 16], 0], [[304, 70], [340, G.F0 - 16], 2]]) for (let i = 1; i <= 7; i++) { const q = bez([240, 6], p1, p2, i / 7.4); this.bulbs.push({ x: q[0], y: q[1] + 3, c: [0xff6a6a, 0xffd23f, 0x7dff8a, 0x5ce1ff, 0xff8ad8][(i + o) % 5], ph: Math.random() * 6 }); }
  }
  say(text) { this.capT.setText(text).setAlpha(0); this.cap = { t: 0, life: 3.6 + text.length * 0.03 }; }
  line(id) { const L = TENT_SAYS[id], i = (this.saysI[id] = ((this.saysI[id] === undefined ? -1 : this.saysI[id]) + 1) % L.length); return L[i]; }
  tap(id) {
    if (this.going) return;
    const k = this.k, G = this.geo;
    if (id === 'out') { this.out(); return; }
    this.snug = Math.min(1, this.snug + 0.06);
    if (id === 'lantern') { this.lampTo = this.lampTo > 0.5 ? 0.18 : 1; Sound.sfx('blip'); this.say(this.lampTo > 0.5 ? 'Light on.' : 'Lights low. Just the fairy lights now.'); return; }
    if (id === 'radio') { this.radio = !this.radio; Sound.music(this.radio ? 'tent' : null); Sound.sfx('blip'); this.say(this.radio ? TENT_SAYS.radio[0] : 'Click. Just the fire crackling now.'); return; }
    if (id === 'mobile') { this.mob.v = Math.min(16, this.mob.v + 6); Sound.sfx('chime'); }
    if (id === 'dog') { Sound.sfx('pickup'); this.wag = 1.6; this.dream = 2.6; for (let i = 0; i < 5; i++) this.parts.push({ kind: 'heart', x: (G.c.x + 250 + Math.random() * 40) * k, y: (G.c.y + 60) * k, vx: (Math.random() - 0.5) * 30 * k, vy: (-24 - Math.random() * 20) * k, life: 1.6 }); }
    if (id === 'mug') { Sound.sfx('squish'); for (let i = 0; i < 10; i++) this.parts.push({ kind: 'steam', x: (404 + Math.random() * 6) * k, y: (this.LH - 42) * k, vx: (Math.random() - 0.5) * 8 * k, vy: (-14 - Math.random() * 12) * k, life: 1.6 }); }
    if (id === 'chris') { this.snore = 1.4; Sound.sfx('ribbit'); this.say(Math.random() < 0.5 ? 'HONK... shoooo...' : this.line('chris')); return; }
    if (id === 'flap') { if (this.jumpT > 0) return; this.jumpT = 1.1; this.cowsN++; try { localStorage.setItem('lc_cows', String(this.cowsN)); } catch (e) { /* ignore */ } Sound.sfx('jump'); this.say(this.cowsN % 10 === 0 ? this.cowsN + ' cows. Still awake? No. Definitely asleep.' : 'One more cow over the moon...'); return; }
    this.say(this.line(id));
  }
  out() {
    if (this.going) return; this.going = true; Sound.sfx('whoosh'); Sound.music(null); this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(430, () => this.scene.start('level1', { camp: true, at: -0.42 }));
  }
  update(time, delta) {
    const dt = Math.min(0.05, delta / 1000), k = this.k, G = this.geo, t = (this.t += dt), W = this.scale.width, H = this.scale.height, LH = this.LH, C = G.c;
    this.lamp += (this.lampTo - this.lamp) * Math.min(1, dt * 4);
    // the lantern swings on a hook under the ridge; its pool of light; the dark when it's turned down
    const sw = Math.sin(t * 1.2) * 0.07 + Math.sin(t * 0.43) * 0.03, lx = 330 * k, ly = 6 * k;
    this.lampIm.setPosition(lx, ly).setRotation(sw).setAlpha(0.65 + this.lamp * 0.35);
    const flick = 1 + Math.sin(t * 13) * 0.025 + Math.sin(t * 7.3) * 0.025;
    this.glow.setPosition(lx - Math.sin(sw) * 36 * k, ly + 36 * k).setScale(W * 0.85 / 256 * flick).setAlpha(0.5 * this.lamp + 0.03);
    this.dark.clear().fillStyle(0x08040e, 0.55 * (1 - this.lamp)).fillRect(0, 0, W, H);
    // breathing: Chris slow and deep, the pup quicker; the arm rides on the pup; the moustache flutters when he snores
    const br = Math.sin(t * 1.5) * 0.5 + 0.5, pb = Math.sin(t * 2.6) * 0.5 + 0.5;
    this.snore = Math.max(0, this.snore - dt); this.wag = Math.max(0, this.wag - dt); this.dream = Math.max(0, this.dream - dt);
    this.chris.setScale(1, 1 + br * 0.022);
    this.mo.setY((C.y + 119 - br * 2) * k).setRotation(-0.3 + Math.sin(t * (this.snore ? 34 : 1.5)) * (this.snore ? 0.09 : 0.02)).setScale(1 + (this.snore ? Math.sin(t * 30) * 0.05 : 0));
    this.pup.setScale(1, 1 + pb * 0.035); this.arm.setY((C.y + 96 - br * 1.5) * k).setRotation(-0.06 - pb * 0.012);
    this.tail.setRotation(this.wag ? Math.sin(t * 26) * 0.5 : Math.sin(t * 1.3) * 0.04);
    // Zzz drifting up from Chris; a dream bubble over the pup when you pet him
    this.zT.forEach((z, i) => { const u = ((t * 0.32 + i / 3) % 1), big = this.snore ? 1.5 : 1; z.setPosition((C.x + 128 + u * 44 + Math.sin(u * 9 + i) * 5) * k, (C.y + 84 - u * 70) * k).setAlpha(Math.sin(u * Math.PI) * 0.9).setScale((0.6 + u * 0.7) * big).setRotation(Math.sin(u * 6 + i) * 0.25); });
    const fx = this.fxG; fx.clear();
    if (this.dream > 0) { const a = Math.min(1, this.dream * 2, (2.6 - this.dream) * 4), bx = (C.x + 262) * k, by = (C.y + 22) * k; fx.fillStyle(0xffffff, 0.92 * a).fillEllipse(bx, by, 50 * k, 30 * k).fillCircle(bx - 16 * k, by + 20 * k, 4 * k).fillCircle(bx - 22 * k, by + 28 * k, 2.4 * k); this.bone.setVisible(true).setPosition(bx, by).setAlpha(a).setRotation(Math.sin(t * 5) * 0.2); } else this.bone.setVisible(false);
    // the cow mobile, turning under the ridge
    const M = this.mob; M.v += (0.5 - M.v) * Math.min(1, dt * 0.35); M.a += M.v * dt;
    const g = this.mobG; g.clear(); const hx = (218 + Math.sin(t * 0.9) * 1.5) * k, hy = 16 * k, rad = 34 * k;
    g.lineStyle(1.4 * k, 0xe8d8b0, 1).lineBetween(hx, 0, hx, hy); g.lineStyle(2.4 * k, 0x1a1020, 1).lineBetween(hx - rad, hy, hx + rad, hy); g.lineStyle(1.2 * k, 0xc89a5a, 1).lineBetween(hx - rad, hy, hx + rad, hy); g.fillStyle(0xffd23f, 1).fillCircle(hx, hy, 3 * k);
    [0, 1, 2, 3].map(i => { const a = M.a + i * Math.PI / 2; return { i, x: hx + Math.cos(a) * rad, d: Math.sin(a), len: (16 + (i % 2) * 8) * k, f: Math.cos(a) < 0 }; }).sort((a, b) => a.d - b.d).forEach((c, j) => {
      const sc = 0.62 + 0.2 * (c.d + 1) / 2, tilt = Math.min(0.5, M.v * 0.03) * (c.f ? 1 : -1), y = hy + c.len;
      g.lineStyle(1.1 * k, 0xe8d8b0, 0.9).lineBetween(c.x, hy, c.x, y);
      this.cows[c.i].setPosition(c.x, y + 9 * k * sc).setScale(c.f ? -sc : sc, sc).setRotation(tilt).setDepth(4.2 + j * 0.01).setAlpha(0.8 + 0.2 * (c.d + 1) / 2);
    });
    // a cow over the moon, out through the door
    if (this.jumpT > 0) { this.jumpT -= dt; const u = 1 - this.jumpT / 1.1; this.jump.setVisible(true).setScale(0.3).setPosition((228 + u * 24) * k, (G.F0 - 24 - Math.sin(u * Math.PI) * 26) * k).setRotation(-0.5 + u); } else this.jump.setVisible(false);
    // fairy lights: soft glowing bulbs
    const bg2 = this.bulbG; bg2.clear();
    for (const b of this.bulbs) { const on = 0.6 + 0.4 * Math.sin(t * 2 + b.ph), x = b.x * k, y = b.y * k; bg2.fillStyle(b.c, on * (0.1 + (1 - this.lamp) * 0.12)).fillCircle(x, y, 9 * k); bg2.fillStyle(b.c, on * 0.3).fillCircle(x, y, 5 * k); bg2.fillStyle(0x1a1020, 1).fillCircle(x, y, 3 * k); bg2.fillStyle(b.c, 1).fillCircle(x, y, 2.3 * k); bg2.fillStyle(0xffffff, 0.8 * on).fillCircle(x - 0.7 * k, y - 0.7 * k, 0.8 * k); }
    // steam off the cocoa, notes off the radio, hearts
    if (Math.random() < dt * 3) this.parts.push({ kind: 'steam', x: (402 + Math.random() * 8) * k, y: (LH - 42) * k, vx: (Math.random() - 0.5) * 5 * k, vy: (-9 - Math.random() * 6) * k, life: 1.8 });
    if (this.radio && Math.random() < dt * 0.9) this.parts.push({ kind: 'note', x: 450 * k, y: (LH - 70) * k, vx: (-6 - Math.random() * 8) * k, vy: -12 * k, life: 2.2 });
    for (const p of this.parts) {
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; const a = Math.min(1, p.life);
      if (p.kind === 'steam') fx.fillStyle(0xfff8ec, a * 0.22).fillCircle(p.x + Math.sin(p.life * 5) * 2 * k, p.y, (3 + (1.8 - p.life) * 2) * k);
      else if (p.kind === 'heart') { const r = 3.2 * k; fx.fillStyle(0xff6a8a, a).fillCircle(p.x - r * 0.55, p.y, r * 0.7).fillCircle(p.x + r * 0.55, p.y, r * 0.7).fillTriangle(p.x - r * 1.15, p.y + r * 0.25, p.x + r * 1.15, p.y + r * 0.25, p.x, p.y + r * 1.5); }
      else if (p.kind === 'note') { fx.fillStyle(0xffd23f, a * 0.9).fillCircle(p.x, p.y, 2.2 * k).fillRect(p.x + 1.4 * k, p.y - 8 * k, 1 * k, 8 * k).fillRect(p.x + 1.4 * k, p.y - 8 * k, 4 * k, 1.6 * k); }
    }
    this.parts = this.parts.filter(p => p.life > 0);
    // the SNUG-O-METER: creeps up on its own, every fiddle helps; splendidly pointless
    this.snug = Math.min(1, this.snug + dt * 0.012);
    const sx = 12, sy = 10 + 11 * k, swd = 90 * k;
    fx.fillStyle(0x1a1020, 0.9).fillRoundedRect(sx - 2, sy - 2, swd + 4, 7 * k + 4, 4 * k); fx.fillStyle(0x3a1a0c, 1).fillRoundedRect(sx, sy, swd, 7 * k, 3 * k); fx.fillStyle(this.snug >= 1 ? (Math.floor(t * 6) % 2 ? 0xfff0a0 : 0xffd23f) : 0xff9a4a, 1).fillRoundedRect(sx, sy, Math.max(6 * k, swd * this.snug), 7 * k, 3 * k);
    this.snugT.setText(this.snug >= 1 ? 'MAXIMUM SNUG' : 'SNUG-O-METER ' + Math.round(this.snug * 100) + '%'); this.cowT.setText(this.cowsN ? 'COWS COUNTED: ' + this.cowsN : '');
    if (this.snug >= 1 && !this.maxed) { this.maxed = true; Sound.sfx('power'); this.say('MAXIMUM SNUG ACHIEVED. Nothing happens. It\'s lovely.'); for (let i = 0; i < 16; i++) this.parts.push({ kind: 'heart', x: Math.random() * W, y: H * (0.5 + Math.random() * 0.4), vx: 0, vy: (-20 - Math.random() * 30) * k, life: 2 + Math.random() }); }
    if (this.cap) { this.cap.t += dt; const Cp = this.cap; this.capT.setAlpha(Math.min(1, Cp.t * 3, (Cp.life - Cp.t) * 2)); if (Cp.t > Cp.life) { this.cap = null; this.capT.setAlpha(0); } }
  }
}
