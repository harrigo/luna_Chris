// ===== L8 THE LACTOSE LABYRINTH: the rooms (v2.97) =====
// The rat warren under the moon isn't just tunnels: every chamber of the maze is a room with its own identity - its own
// walls, furniture and light - so you can tell where you are and where you've been:
//   STOREROOM / BASEMENT  planks, stacked crates, sacks and barrels, cobwebs
//   KITCHEN               checkered tiles, an iron range with a bubbling pot, a chopping block, pans hanging
//   DINING HALL           red damask, a long table with a rotting feast, a chandelier, a portrait of the King
//   CHEESE CELLAR         brick vaults, shelves of ageing wheels, a giant mouldy wheel
//   BOILER ROOM           riveted plates, a boiler with a glowing firebox, pipes and gauges
//   BARRACKS              grey plaster, bunks with a snoring lump, footlockers, LONG LIVE THE KING posters
//   ARMOURY               stone blocks, racks of halberds, a suit of rat armour, cannonballs
//   GAMES ROOM            green baize and a wood dado, a pool table, a dartboard, a one-armed bandit (cheese symbols)
//   LIBRARY               panelled wood, bookcases, a desk with a green lamp
//   MILK TESTING LAB      white tiles, benches of bubbling flasks, a tank with something pickled in it, bare bulbs
// Each ring's def has rooms: { <wall angle the chamber starts at>: 'kind' | ['kind', 'NAME'] }. The chamber's name shows
// under the cheese gauge (big the first time you walk in), and the map colours the bits you've seen by their room.

const LAB_ROOMS = {
  store:    { name: 'THE STOREROOM',     wall: 0x2a1a0e, map: 0x8a6a3a, props: [['lb_crates', 0], ['lb_sacks', 0], ['lb_cobweb', 1]], lamp: 0xffb060 },
  kitchen:  { name: 'THE KITCHEN',       wall: 0x2e2620, map: 0xe0e0e0, props: [['lb_stove', 0], ['lb_block', 0], ['lb_pans', 1]], lamp: 0xffa040 },
  dining:   { name: 'THE DINING HALL',   wall: 0x3a0e12, map: 0xd0283a, props: [['lb_table', 0], ['lb_portrait', 2], ['lb_chand', 1]], lamp: 0xffd070 },
  cellar:   { name: 'THE CHEESE CELLAR', wall: 0x2e1a10, map: 0xffc23a, props: [['lb_shelf', 0], ['lb_wheel', 0], ['lb_cobweb', 1]], lamp: 0xffb060 },
  boiler:   { name: 'THE BOILER ROOM',   wall: 0x2a1c16, map: 0xff6a2a, props: [['lb_boiler', 0], ['lb_pipes', 2], ['lb_bulb', 1]], lamp: 0xff7a30 },
  barracks: { name: 'THE BARRACKS',      wall: 0x22261e, map: 0x8a9a6a, props: [['lb_bunk', 0], ['lb_locker', 0], ['lb_poster', 2]], lamp: 0xfff0b0 },
  armoury:  { name: 'THE ARMOURY',       wall: 0x1e1e26, map: 0x9aa8c0, props: [['lb_rack', 0], ['lb_armour', 0], ['lb_balls', 0]], lamp: 0xffa040 },
  games:    { name: 'THE GAMES ROOM',    wall: 0x0e2a1a, map: 0x3ac06a, props: [['lb_pool', 0], ['lb_dart', 2], ['lb_slot', 0]], lamp: 0xfff0a0 },
  library:  { name: 'THE LIBRARY',       wall: 0x2a160c, map: 0xb06a3a, props: [['lb_books', 0], ['lb_desk', 0], ['lb_cobweb', 1]], lamp: 0x9aff8a },
  lab:      { name: 'THE MILK TESTING LAB', wall: 0x26302c, map: 0x9fe8ff, props: [['lb_bench', 0], ['lb_tank', 0], ['lb_bulb', 1]], lamp: 0xd8fff0 },
};

function makeLabRoomTextures(scene) {
  if (scene.game.__labRooms) return; scene.game.__labRooms = true;
  const DARK = 0x1a1018, WOOD = [0xc89058, 0x8a5a2a, 0x4e3014], WOODD = [0x8a5a2a, 0x5e3a1a, 0x341e0c], STEEL = [0xeaf2ff, 0x9aa8c0, 0x4a5670], IRON = [0x6a6878, 0x46444e, 0x24222a];
  const GOLD = [0xfff0a0, 0xf0b828, 0x9a6410], RED = [0xe0503a, 0xa82418, 0x5e0c0c], CHEESE = [0xfff4c0, 0xf2d27a, 0xb8903a], MOULD = [0xb8e070, 0x6a9a3a, 0x3a5a1a];
  const GLASS = [0xe8f8ff, 0xa8d8e8, 0x5a8aa0], MILK = [0xffffff, 0xeef4ff, 0xc8d4e4], GREEN = [0xd8ffd0, 0x7ae86a, 0x2a9a3a], CLOTH = [0xe8dcc0, 0xb8a888, 0x786a50];
  const BAIZE = [0x5ad08a, 0x2a8a4a, 0x14502a], FUR = [0xc8bcb4, 0x8e7e76, 0x54443e], PINK = [0xffc0cc, 0xf08aa0, 0xb04a68], GLOW = [0xfff6a0, 0xffb030, 0xe0501a];
  const P = (k, w, h, fn) => pixSprite(scene, k, w, h, fn);

  // ---- store
  P('lb_crates', 70, 66, a => {
    const crate = (x, y, w, h) => { a.rect(x, y, x + w, y + h, WOOD[1]); a.rect(x, y, x + w, y + 2, WOOD[0]); a.rect(x, y + h - 2, x + w, y + h, WOOD[2]); a.line([[x + 2, y + 2], [x + w - 2, y + h - 2]], WOOD[2], 2); a.rect(x, y, x + 2, y + h, WOOD[0]); a.rect(x + w - 2, y, x + w, y + h, WOOD[2]); };
    crate(2, 34, 32, 30); crate(36, 40, 30, 24); crate(14, 6, 30, 28);
    a.rect(18, 16, 40, 22, RED[1]); for (const x of [20, 25, 30, 35]) a.rect(x, 18, x + 2, 20, 0xffffff);                                        // FRAGILE
    a.ell(54, 34, 3, 2, CHEESE); a.px(10, 30, CHEESE[0]);
  });
  P('lb_sacks', 64, 50, a => {
    a.ell(48, 30, 13, 17, WOOD); a.rect(36, 13, 60, 16, WOOD[2]); a.rect(36, 24, 60, 26, IRON[1]); a.rect(36, 38, 60, 40, IRON[1]);                    // a barrel
    for (const [x, y, r] of [[14, 38, 12], [30, 42, 10], [22, 24, 10]]) { a.ell(x, y, r, r * 0.85, CLOTH); a.poly([[x - 3, y - r * 0.8], [x + 3, y - r * 0.8], [x, y - r - 4]], CLOTH); a.px(x, y - r * 0.8, CLOTH[2]); }
    a.rect(18, 36, 22, 38, 0x5a3a1a); a.ell(8, 46, 3, 2, CHEESE);                                                                                  // gnawed; spilling
  });
  P('lb_cobweb', 54, 36, a => {
    for (let k = 0; k < 7; k++) { const an = k / 6 * Math.PI; a.line([[27, 0], [27 + Math.cos(an) * 26, Math.sin(an) * 34]], 0xd8d8e8); }
    for (const r of [8, 16, 24]) { const pts = []; for (let k = 0; k <= 6; k++) { const an = k / 6 * Math.PI; pts.push([27 + Math.cos(an) * r, Math.sin(an) * r * 1.3 + 2 * Math.sin(k * 2)]); } a.line(pts, 0xb8b8c8); }
    a.ell(34, 22, 3, 3, DARK); for (const d of [-1, 1]) { a.line([[31, 21], [28, 18 + d * 3]], DARK); a.line([[37, 21], [40, 18 + d * 3]], DARK); } a.px(33, 21, 0xff3a1a); a.px(35, 21, 0xff3a1a);
  });
  // ---- kitchen
  P('lb_stove', 74, 76, a => {
    a.rect(4, 30, 70, 74, IRON[1]); a.rect(4, 30, 70, 32, IRON[0]); a.rect(68, 30, 70, 74, IRON[2]);
    a.rect(10, 44, 34, 66, IRON[2]); a.rect(13, 47, 31, 63, GLOW[1]); a.rect(13, 47, 31, 49, GLOW[0]); for (const x of [16, 21, 26]) a.rect(x, 47, x + 1, 63, IRON[2]);   // the firebox
    a.rect(40, 42, 64, 70, IRON[1]); a.rect(42, 54, 46, 56, GOLD[1]);                                                                              // oven door
    a.rect(52, 0, 60, 30, IRON[1]); a.rect(52, 0, 54, 30, IRON[0]);                                                                                // flue
    a.ell(26, 22, 16, 8, IRON); a.rect(10, 14, 42, 22, IRON[1]); a.ell(26, 14, 16, 4, GREEN); a.ell(22, 13, 3, 2, GREEN[0]); a.ell(31, 12, 2, 1.6, GREEN[0]);   // a pot of something green
    a.ell(20, 10, 2, 2, FUR); a.line([[24, 11], [27, 4], [29, 2]], FUR[1]);                                                                         // a tail poking out of it
    a.line([[10, 18], [4, 16]], IRON[2], 2); a.line([[42, 18], [48, 16]], IRON[2], 2);
  });
  P('lb_block', 60, 52, a => {
    a.rect(8, 22, 52, 34, WOOD[1]); a.rect(8, 22, 52, 23, WOOD[0]); for (const x of [10, 48]) a.rect(x, 34, x + 4, 50, WOODD[1]);                    // the block on legs
    a.line([[10, 26], [50, 28]], WOOD[2]); a.rect(14, 30, 18, 31, RED[2]); a.rect(30, 31, 36, 32, RED[2]);
    a.poly([[30, 6], [44, 6], [44, 20], [30, 20]], STEEL); a.rect(30, 6, 44, 7, STEEL[0]); a.rect(44, 10, 52, 13, WOODD[1]); a.ell(33, 9, 1.2, 1.2, DARK);     // a cleaver, buried in it
    a.line([[12, 21], [26, 19]], 0xe8e0d0, 1); for (let x = 14; x < 25; x += 3) a.line([[x, 18], [x + 1, 22]], 0xe8e0d0); a.poly([[8, 18], [12, 21], [8, 23]], 0xe8e0d0); a.ell(26, 19, 2.4, 2, 0xe8e0d0);   // a fish skeleton
  });
  P('lb_pans', 70, 50, a => {
    a.rect(0, 2, 70, 5, IRON[1]); a.rect(10, 0, 12, 3, IRON[2]); a.rect(58, 0, 60, 3, IRON[2]);
    for (const [x, kind] of [[8, 0], [22, 1], [36, 2], [50, 0], [62, 1]]) {
      a.line([[x, 5], [x, 10]], IRON[2]);
      if (kind === 0) { a.rect(x - 1, 10, x + 1, 24, IRON[1]); a.ell(x, 32, 8, 8, IRON); a.ell(x - 2, 30, 3, 2.4, IRON[0]); }
      else if (kind === 1) { a.rect(x - 1, 10, x + 1, 20, WOODD[1]); a.poly([[x - 6, 20], [x + 4, 20], [x + 4, 36], [x - 6, 36]], STEEL); a.rect(x - 6, 20, x + 4, 21, STEEL[0]); }
      else { a.rect(x - 1, 10, x + 1, 28, IRON[1]); a.ell(x, 32, 5, 4, STEEL); }
    }
  });
  // ---- dining
  P('lb_table', 110, 54, a => {
    a.rect(4, 30, 106, 36, WOOD[1]); a.rect(4, 30, 106, 31, WOOD[0]); a.rect(4, 34, 106, 40, RED[1]); for (let x = 6; x < 104; x += 8) a.poly([[x, 40], [x + 4, 44], [x + 8, 40]], RED[1]);   // cloth
    for (const x of [10, 96]) a.rect(x, 40, x + 4, 52, WOODD[1]);
    a.ell(24, 24, 11, 7, CHEESE); a.ell(24, 24, 4, 3, CHEESE[2]); for (const [x, y] of [[20, 22], [28, 26]]) a.ell(x, y, 2, 1.6, MOULD[1]);              // a cheese wheel gone green
    a.ell(58, 24, 13, 7, [0xd88a4a, 0xa8521e, 0x5e2a0c]); a.line([[66, 22], [74, 14]], 0xf0e8d8, 2); a.ell(75, 13, 2, 2, 0xf0e8d8); a.line([[50, 22], [44, 15]], 0xf0e8d8, 2);   // a roast, picked to the bone
    for (const [x, y] of [[54, 20], [62, 19]]) a.px(x, y, 0x2a2a1a);                                                                                // flies
    a.rect(84, 22, 88, 30, GOLD[1]); a.rect(78, 20, 94, 22, GOLD[1]); for (const x of [78, 86, 94]) { a.rect(x - 1, 10, x + 1, 20, 0xf8f0e0); a.px(x, 8, GLOW[0]); a.px(x, 7, GLOW[1]); }   // a candelabra
    a.ell(40, 28, 4, 2, 0xe8f0f8); a.rect(39, 22, 41, 28, 0xe8f0f8); a.ell(100, 27, 3, 2, 0xe8f0f8);                                                   // goblets
  });
  P('lb_portrait', 44, 54, a => {
    a.rect(0, 0, 44, 54, GOLD[1]); a.rect(0, 0, 44, 2, GOLD[0]); a.rect(42, 0, 44, 54, GOLD[2]); a.rect(0, 52, 44, 54, GOLD[2]);
    a.rect(5, 5, 39, 49, 0x2a1418); a.ell(22, 44, 14, 10, RED); a.rect(10, 36, 34, 40, 0xffffff);
    a.ell(22, 26, 10, 10, FUR); a.poly([[26, 24], [36, 27], [36, 30], [26, 31]], FUR); a.ell(14, 17, 3, 4, PINK); a.ell(30, 17, 3, 4, PINK);
    a.ell(22, 24, 3.5, 3.5, 0xffffff); a.ell(23, 24, 1.4, 1.4, DARK); a.line([[18, 21], [26, 20]], DARK);
    a.poly([[14, 17], [14, 10], [18, 14], [22, 8], [26, 14], [30, 10], [30, 17]], GOLD);
    a.line([[8, 10], [36, 46]], 0x9a6a5a); a.line([[36, 10], [28, 20]], 0x9a6a5a);                                                                    // someone's slashed it
  });
  P('lb_chand', 60, 46, a => {
    a.line([[30, 0], [30, 14]], IRON[1]); a.ell(30, 18, 6, 4, GOLD);
    a.line([[6, 30], [18, 22], [30, 20], [42, 22], [54, 30]], GOLD[1], 2); a.line([[12, 34], [30, 24], [48, 34]], GOLD[2]);
    for (const x of [6, 18, 30, 42, 54]) { a.rect(x - 1, 22 + Math.abs(x - 30) * 0.3, x + 1, 30 + Math.abs(x - 30) * 0.3, 0xf8f0e0); a.ell(x, 20 + Math.abs(x - 30) * 0.3, 2, 3, GLOW); }
    for (const x of [12, 30, 48]) { a.line([[x, 34], [x, 40]], GLASS[1]); a.ell(x, 42, 2, 3, GLASS); }
    a.line([[48, 30], [52, 44]], DARK);                                                                                                             // one arm hanging loose
  });
  // ---- cellar
  P('lb_shelf', 76, 80, a => {
    for (const x of [2, 72]) a.rect(x, 0, x + 3, 80, WOODD[1]);
    for (const y of [24, 50, 76]) { a.rect(2, y, 75, y + 3, WOOD[1]); a.rect(2, y, 75, y, WOOD[0]); }
    for (const [y, n] of [[24, 4], [50, 3], [76, 4]]) for (let k = 0; k < n; k++) { const x = 13 + k * (60 / n) + (y % 7), mould = (k + y) % 3 === 0;
      a.ell(x, y - 7, 8, 7, CHEESE); a.ell(x, y - 7, 8, 2, CHEESE[2]); if (mould) { a.ell(x - 2, y - 9, 3, 2, MOULD[1]); a.px(x + 3, y - 5, MOULD[0]); } a.rect(x - 3, y - 8, x + 3, y - 7, CHEESE[0]); }
    a.rect(30, 10, 46, 14, 0xf0e8d0); a.rect(31, 11, 33, 13, DARK); a.rect(36, 11, 38, 13, DARK); a.rect(41, 11, 43, 13, DARK);                         // a little label
  });
  P('lb_wheel', 64, 50, a => {
    a.ell(32, 30, 30, 20, CHEESE); a.ell(32, 22, 30, 12, [0xfff8d8, 0xfff4c0, 0xf2d27a]); a.line([[2, 28], [62, 28]], CHEESE[2]);
    for (const [x, y, r] of [[20, 20, 5], [40, 24, 4], [48, 18, 3], [14, 36, 3], [44, 38, 5]]) { a.ell(x, y, r, r * 0.8, MOULD); a.px(x - 1, y - 1, MOULD[0]); }
    a.poly([[52, 12], [62, 18], [56, 24]], -1); a.poly([[50, 14], [56, 24], [52, 24]], CHEESE[2]);                                                   // a bite out of it
    for (const [x, y] of [[54, 8], [57, 4], [60, 9]]) a.px(x, y, MOULD[0]);                                                                           // spores
  });
  // ---- boiler
  P('lb_boiler', 70, 92, a => {
    a.ell(32, 46, 26, 40, [0xb8742a, 0x8a4e1a, 0x4e2a0c]); for (const y of [16, 36, 56, 76]) { a.rect(8, y, 56, y + 2, IRON[1]); for (let x = 10; x < 56; x += 6) a.px(x, y + 1, IRON[0]); }
    a.ell(32, 60, 11, 11, IRON[2]); a.ell(32, 60, 9, 9, GLOW); a.ell(32, 60, 4, 4, 0xffffff); for (let k = 0; k < 4; k++) a.rect(23 + k * 5, 52, 24 + k * 5, 68, IRON[2]);   // the firebox
    a.ell(48, 30, 7, 7, GOLD); a.ell(48, 30, 5, 5, 0xffffff); a.line([[48, 30], [52, 26]], RED[1]); a.rect(50, 26, 53, 27, RED[1]);                    // gauge in the red
    a.rect(26, 0, 34, 8, IRON[1]); a.rect(56, 40, 70, 46, IRON[1]); a.rect(64, 40, 70, 90, IRON[1]);
    a.ell(62, 34, 4, 3, [0xffffff, 0xe0e0e8, 0xa0a0b0]); a.ell(66, 28, 5, 4, [0xffffff, 0xe0e0e8, 0xa0a0b0]);                                            // a jet of steam from a leak
    a.rect(10, 86, 54, 90, IRON[2]);
  });
  P('lb_pipes', 60, 60, a => {
    for (const [y, c] of [[8, IRON], [22, [0xb8742a, 0x8a4e1a, 0x4e2a0c]], [40, IRON]]) { a.rect(0, y, 60, y + 6, c[1]); a.rect(0, y, 60, y + 1, c[0]); a.rect(0, y + 5, 60, y + 6, c[2]); }
    a.rect(30, 8, 36, 60, IRON[1]); a.rect(30, 8, 31, 60, IRON[0]); a.ell(33, 32, 6, 6, RED); for (let k = 0; k < 4; k++) { const an = k * Math.PI / 2; a.line([[33, 32], [33 + Math.cos(an) * 7, 32 + Math.sin(an) * 7]], RED[2]); }   // a valve wheel
    a.ell(12, 18, 5, 5, GOLD); a.ell(12, 18, 3.4, 3.4, 0xffffff); a.line([[12, 18], [14, 16]], DARK); a.px(48, 47, 0x9fe8ff); a.px(48, 50, 0x9fe8ff);  // a drip
  });
  P('lb_bulb', 20, 46, a => { a.line([[10, 0], [10, 30]], IRON[2]); a.rect(7, 30, 13, 34, IRON[1]); a.ell(10, 39, 6, 7, [0xffffff, 0xfff6c0, 0xffd860]); a.px(8, 37, 0xffffff); });
  // ---- barracks
  P('lb_bunk', 86, 82, a => {
    for (const x of [2, 80]) a.rect(x, 0, x + 4, 82, IRON[1]);
    for (const y of [30, 70]) { a.rect(2, y, 84, y + 4, IRON[1]); a.rect(6, y - 8, 80, y, CLOTH[1]); a.rect(6, y - 8, 80, y - 7, CLOTH[0]); a.ell(14, y - 10, 7, 4, 0xf0f0f0); }
    a.ell(48, 20, 22, 8, [0x8a9a6a, 0x5a6a42, 0x34401e]); a.line([[30, 18], [66, 18]], [0x34401e][0]);                                                 // a snoring lump under the blanket
    a.ell(26, 18, 5, 4, FUR); a.ell(22, 14, 2.4, 3, PINK); a.line([[70, 22], [80, 26], [82, 34]], PINK[1], 2);                                       // its head and tail
    a.ell(48, 58, 22, 6, [0x8a9a6a, 0x5a6a42, 0x34401e]);
    for (const [x, y] of [[34, 6], [38, 2], [42, -1]]) a.rect(x, y, x + 3, y + 1, 0xffffff);                                                        // z z z
  });
  P('lb_locker', 56, 40, a => {
    a.rect(4, 14, 44, 38, [0x5a6a42][0]); a.rect(4, 14, 44, 16, 0x8a9a6a); a.rect(4, 36, 44, 38, 0x34401e); a.rect(20, 20, 28, 26, GOLD[1]); a.rect(23, 22, 25, 24, DARK);
    for (const x of [44, 50]) { a.rect(x, 26, x + 5, 38, DARK); a.rect(x, 34, x + 8, 38, DARK); }                                                   // boots
    a.rect(8, 6, 30, 14, RED[1]); a.rect(8, 6, 30, 7, RED[0]);                                                                                       // a folded tunic
  });
  P('lb_poster', 36, 50, a => {
    a.rect(0, 0, 36, 50, 0xe8dcb0); a.rect(0, 0, 36, 1, 0xfff0d0); a.rect(2, 2, 34, 12, RED[1]);
    for (let x = 5; x < 32; x += 4) a.rect(x, 5, x + 2, 9, 0xffffff);
    a.ell(18, 28, 10, 10, FUR); a.poly([[22, 26], [32, 29], [22, 33]], FUR); a.ell(18, 26, 3, 3, 0xffffff); a.ell(19, 26, 1.2, 1.2, DARK);
    a.poly([[11, 20], [11, 13], [15, 17], [18, 11], [21, 17], [25, 13], [25, 20]], GOLD); a.rect(4, 42, 32, 46, RED[1]); a.poly([[30, 48], [36, 50], [36, 44]], 0xb8a888);   // a torn corner
  });
  // ---- armoury
  P('lb_rack', 66, 84, a => {
    a.rect(2, 64, 64, 70, WOODD[1]); a.rect(2, 20, 64, 24, WOODD[1]); a.rect(4, 70, 8, 84, WOODD[1]); a.rect(58, 70, 62, 84, WOODD[1]);
    for (let k = 0; k < 5; k++) { const x = 10 + k * 11; a.rect(x, 4, x + 1, 66, WOOD[1]); if (k % 2) { a.poly([[x - 4, 6], [x + 5, 8], [x + 5, 14], [x - 4, 12]], STEEL); a.poly([[x, 0], [x + 2, 6], [x - 1, 6]], STEEL); } else a.poly([[x - 2, 6], [x + 1, -2], [x + 4, 6]], STEEL); }
  });
  P('lb_armour', 44, 84, a => {
    a.rect(20, 76, 24, 84, WOODD[1]); a.rect(10, 80, 34, 84, WOODD[1]);
    for (const x of [14, 26]) { a.rect(x, 54, x + 6, 76, STEEL[1]); a.rect(x, 54, x + 1, 76, STEEL[0]); }
    a.ell(22, 40, 13, 16, STEEL); a.line([[22, 26], [22, 54]], STEEL[2]); a.ell(22, 50, 14, 4, GOLD);
    for (const x of [6, 36]) a.ell(x, 30, 6, 5, STEEL);
    a.ell(22, 16, 10, 11, STEEL); a.poly([[26, 12], [40, 16], [40, 20], [26, 22]], STEEL); a.rect(14, 14, 36, 16, DARK); a.ell(14, 6, 3, 5, STEEL); a.ell(30, 6, 3, 5, STEEL);   // a rat-snouted helm, visor slit
    a.poly([[18, 4], [22, -2], [26, 4]], RED);
  });
  P('lb_balls', 50, 30, a => { for (const [x, y] of [[10, 22], [22, 22], [34, 22], [16, 12], [28, 12], [22, 3]]) { a.ell(x, y, 6, 6, IRON); a.px(x - 2, y - 2, IRON[0]); } a.rect(40, 18, 48, 28, WOODD[1]); a.rect(41, 17, 47, 18, DARK); });
  // ---- games
  P('lb_pool', 96, 46, a => {
    a.rect(4, 16, 92, 28, WOOD[1]); a.rect(8, 14, 88, 22, BAIZE[1]); a.rect(8, 14, 88, 15, BAIZE[0]); for (const x of [8, 48, 88]) a.ell(x, 16, 2.4, 2, DARK);
    for (const x of [10, 82]) { a.rect(x, 28, x + 5, 44, WOODD[1]); a.ell(x + 2, 44, 4, 2, WOODD[1]); }
    for (const [x, c] of [[30, RED], [36, GOLD], [33, 0xffffff], [62, [0x6a8aff, 0x2a40c0, 0x101a60]], [70, DARK]]) a.ell(x, 12, 2.4, 2.4, c);
    a.line([[0, 4], [40, 12]], WOOD[0], 2); a.rect(0, 2, 6, 6, WOODD[1]);
  });
  P('lb_dart', 36, 40, a => {
    a.ell(18, 18, 16, 16, DARK); a.ell(18, 18, 14, 14, [0xe8dcc0, 0xe8dcc0, 0xb8a888]);
    for (let k = 0; k < 10; k++) { const an = k / 10 * Math.PI * 2, b = an + Math.PI / 10; a.poly([[18, 18], [18 + Math.cos(an) * 13, 18 + Math.sin(an) * 13], [18 + Math.cos(b) * 13, 18 + Math.sin(b) * 13]], k % 2 ? RED[1] : DARK); }
    a.ell(18, 18, 3, 3, GREEN[1]); a.ell(18, 18, 1.2, 1.2, RED[1]);
    for (const [x, y] of [[12, 12], [22, 24], [26, 8]]) { a.line([[x, y], [x + 5, y - 3]], WOOD[1]); a.px(x + 5, y - 3, RED[0]); }
    a.ell(8, 30, 4, 4, FUR); a.ell(9, 30, 1.4, 1.4, DARK);                                                                                            // ...it's a rat's face on the bull
  });
  P('lb_slot', 40, 76, a => {
    a.rect(4, 14, 34, 76, RED[1]); a.rect(4, 14, 34, 16, RED[0]); a.rect(32, 14, 34, 76, RED[2]); a.ell(19, 14, 15, 8, GOLD);
    a.rect(8, 26, 30, 40, 0xffffff); for (const x of [9, 16, 23]) { a.rect(x, 27, x + 6, 39, x === 16 ? 0xfff6e0 : 0xffffff); a.ell(x + 3, 33, 2.4, 2.4, CHEESE); a.px(x + 3, 33, CHEESE[2]); }
    a.rect(8, 44, 30, 48, DARK); a.rect(10, 56, 28, 62, GOLD[2]); for (const x of [12, 18, 24]) a.ell(x, 64, 2, 1.6, GOLD);
    a.rect(34, 24, 37, 28, IRON[1]); a.line([[37, 26], [38, 10]], IRON[1], 2); a.ell(38, 8, 3, 3, RED);                                            // the arm
    for (const [x, y] of [[6, 4], [19, 2], [32, 4]]) a.ell(x, y, 2, 2, GLOW);
  });
  // ---- library
  P('lb_books', 70, 90, a => {
    a.rect(0, 0, 70, 90, WOODD[2]); a.rect(0, 0, 4, 90, WOODD[1]); a.rect(66, 0, 70, 90, WOODD[1]); a.rect(0, 0, 70, 4, WOODD[1]);
    const cols = [RED[1], 0x3a5aa0, GREEN[2], GOLD[2], 0x6a3a8a, WOOD[1], 0x2a6a6a];
    for (const y of [26, 52, 78]) { a.rect(4, y, 66, y + 4, WOODD[1]); let x = 5, k = (y / 26) * 3;
      while (x < 64) { const w = 3 + (k * 7) % 4, h = 15 + (k * 5) % 7; if ((k * 11) % 9 !== 0) { a.rect(x, y - h, x + w, y, cols[k % cols.length]); a.rect(x, y - h + 3, x + w, y - h + 4, GOLD[1]); } else if ((k * 3) % 2) a.poly([[x, y], [x + 2, y], [x + 12, y - 14], [x + 10, y - 15]], cols[(k + 2) % cols.length]); x += w + 1; k++; } }
    a.ell(54, 12, 3, 4, 0xe8e0d0); a.px(53, 12, DARK); a.px(55, 12, DARK);                                                                           // a skull on a shelf
  });
  P('lb_desk', 70, 62, a => {
    a.rect(4, 30, 66, 36, WOOD[1]); a.rect(4, 30, 66, 31, WOOD[0]); a.rect(6, 36, 20, 60, WOODD[1]); a.rect(50, 36, 64, 60, WOODD[1]); for (const y of [42, 50]) a.rect(8, y, 18, y + 1, GOLD[1]);
    a.rect(44, 18, 46, 30, GOLD[2]); a.poly([[36, 18], [54, 18], [50, 10], [40, 10]], GREEN); a.ell(45, 20, 6, 2, [0xffffff, 0xfff6c0, 0xffd860]);   // the green lamp
    for (const [x, y] of [[10, 26], [16, 24], [22, 27]]) a.rect(x, y, x + 10, y + 3, 0xf0e8d0); a.line([[12, 25], [20, 25]], DARK);
    a.rect(28, 20, 32, 30, DARK); a.line([[30, 20], [34, 12]], 0xffffff);                                                                           // ink and a quill
    a.ell(24, 46, 10, 10, WOODD); a.rect(16, 52, 32, 56, WOODD[1]);                                                                                  // the chair
  });
  // ---- the milk testing lab
  P('lb_bench', 90, 60, a => {
    a.rect(2, 30, 88, 36, 0xe8eef0); a.rect(2, 30, 88, 31, 0xffffff); a.rect(4, 36, 86, 60, 0x9aa8b0); a.rect(4, 36, 86, 37, 0xc8d4dc); for (const x of [30, 58]) a.rect(x, 38, x + 1, 58, 0x6a7880);
    for (const [x, h, c] of [[10, 18, MILK], [22, 12, GREEN], [34, 22, MILK], [64, 14, [0xffd8ff, 0xd88aff, 0x8a3ab8]], [78, 16, MILK]]) {
      a.poly([[x - 5, 30], [x + 5, 30], [x + 2, 30 - h * 0.6], [x + 2, 30 - h], [x - 2, 30 - h], [x - 2, 30 - h * 0.6]], GLASS); a.poly([[x - 4, 29], [x + 4, 29], [x + 1.6, 30 - h * 0.45], [x - 1.6, 30 - h * 0.45]], c);
      a.px(x, 30 - h - 2, c[0]); a.px(x + 1, 30 - h - 5, c[0]);                                                                                    // bubbling over
    }
    a.rect(44, 18, 58, 30, IRON[1]); a.ell(51, 16, 6, 3, GLASS); a.rect(48, 22, 54, 26, GREEN[1]);                                                   // a centrifuge
    for (const x of [46, 50, 54]) a.px(x, 20, 0xff3a1a);
  });
  P('lb_tank', 50, 84, a => {
    a.rect(4, 76, 46, 84, IRON[1]); a.rect(4, 0, 46, 6, IRON[1]); a.rect(6, 6, 44, 76, GLASS[1]); a.rect(8, 16, 42, 75, [0xd8f0e0][0]);
    a.ell(25, 46, 12, 18, [0xe8c8c0, 0xc09a94, 0x8a6660]); a.ell(25, 26, 8, 7, [0xe8c8c0, 0xc09a94, 0x8a6660]); a.poly([[29, 24], [38, 27], [29, 31]], [0xe8c8c0, 0xc09a94, 0x8a6660]);   // something pickled: a hairless rat
    a.ell(23, 23, 3, 3, 0xffffff); a.ell(23, 23, 1, 1, DARK); a.line([[16, 60], [10, 70], [14, 74]], 0xc09a94, 2);
    for (const [x, y] of [[14, 30], [34, 50], [20, 66], [36, 22]]) a.ell(x, y, 1.6, 1.6, 0xffffff);
    a.rect(8, 8, 10, 74, 0xffffff); a.rect(14, 80, 36, 82, GREEN[1]);
  });
}

const LabRoomsMixin = {
  // the room a point of a ring sits in: { kind, name, theme, key }
  labRoomAt(ri, rel) {
    const RG = this.caveRing(ri); if (!RG || !RG.rooms) return null;
    const c = this.labChamber(ri, rel); if (!c) return null;
    const k = (((c[0] % TAU) + TAU) % TAU).toFixed(2); let v = null;
    for (const key in RG.rooms) if ((((+key % TAU) + TAU) % TAU).toFixed(2) === k) v = RG.rooms[key];
    if (!v) return null;
    const [kind, name] = Array.isArray(v) ? v : [v, null], th = LAB_ROOMS[kind]; if (!th) return null;
    return { kind, name: name || th.name, theme: th, key: ri + ':' + k, lo: c[0], hi: c[1] };
  },
  // (re)build the furniture for the ring we've just moved into
  labRoomsBuild(ri) {
    makeLabRoomTextures(this);
    for (const q of this.labFurn || []) q.im.destroy(); this.labFurn = [];
    const RG = this.caveRing(ri); if (!ri || !RG || !RG.rooms) return;
    const ws = (RG.walls || []).map(w => ((w % TAU) + TAU) % TAU).sort((a, b) => a - b);
    const holes = (RG.holes || []).map(h => ((h % TAU) + TAU) % TAU), above = this.caveRing(ri - 1), upHoles = ri > 1 && above ? (above.holes || []).map(h => ((h % TAU) + TAU) % TAU) : [];
    const CV = this.def.cave, hatch = ri === CV.rings.length - 1 ? (((CV.rings[ri].bessie % TAU) + TAU) % TAU) : null;
    const loot = (RG.loot || []).map(L => ((L[1] % TAU) + TAU) % TAU);
    const clear = (x, px) => { const d = (u, v) => Math.abs(((u - v) % TAU + TAU + Math.PI) % TAU - Math.PI) * RG.R; return ![...holes, ...upHoles].some(h => d(x, h) < 46 + px / 2) && !ws.some(w => d(x, w) < 22 + px / 2) && !(hatch !== null && d(x, hatch) < 70 + px / 2) && !loot.some(l => d(x, l) < 24); };
    ws.forEach((lo, i) => {
      const hi = i === ws.length - 1 ? ws[0] + TAU : ws[i + 1], R0 = this.labRoomAt(ri, (lo + hi) / 2); if (!R0) return;
      const len = (hi - lo) * RG.R, nProps = Math.max(1, Math.floor(len / 150)), list = R0.theme.props;
      for (let k = 0; k < nProps; k++) {
        const [tex, kind] = list[k % list.length], f = (k + 0.5) / nProps, x = lo + (hi - lo) * f, w = this.textures.getFrame(tex).width;
        let at = null; for (const dx of [0, 0.05, -0.05, 0.1, -0.1]) { const xx = lo + (hi - lo) * Math.min(0.95, Math.max(0.05, f + dx)); if (clear(xx, w)) { at = xx; break; } }
        if (at === null) continue;
        const im = this.add.image(0, 0, tex).setDepth(kind === 2 ? 4.55 : 4.6).setOrigin(0.5, kind === 1 ? 0 : 1); im.bsx = im.bsy = 1.25; if ((k + i) % 2 && kind === 0) im.setFlipX(true);
        this.labFurn.push({ im, theta: this.caveAbs(at), h: kind === 1 ? RG.ceil - 2 : kind === 2 ? 52 : 0, kind, lamp: R0.theme.lamp, tex });
      }
    });
  },
  // the walls of each room (behind everything), and the furniture
  labRoomsDraw(g, pol, inView, vt, vh) {
    const C = this.cave, ri = C.ring, RG = this.caveRing(ri), z = this.zoom, t = this.t; if (!ri || !RG || !RG.rooms) return;
    const top = RG.R + RG.ceil, vrel = this.labRel(vt), ws = (RG.walls || []).map(w => ((w % TAU) + TAU) % TAU).sort((a, b) => a - b);
    const quad = (a0, a1, r0, r1, col, al) => { const p1 = pol(this.caveAbs(a0), r0), p2 = pol(this.caveAbs(a1), r0), p3 = pol(this.caveAbs(a1), r1), p4 = pol(this.caveAbs(a0), r1); g.fillStyle(col, al === undefined ? 1 : al).fillPoints([p1, p2, p3, p4], true); };
    const arc = (a0, a1, r, col, w) => { const n = Math.max(2, Math.ceil((a1 - a0) * r / 24)); const pts = []; for (let k = 0; k <= n; k++) pts.push(pol(this.caveAbs(a0 + (a1 - a0) * k / n), r)); g.lineStyle(w * z, col, 1).strokePoints(pts); };
    const vline = (a, r0, r1, col, w) => { const p = pol(this.caveAbs(a), r0), q = pol(this.caveAbs(a), r1); g.lineStyle(w * z, col, 1).lineBetween(p.x, p.y, q.x, q.y); };
    ws.forEach((lo0, i) => {
      const hi0 = i === ws.length - 1 ? ws[0] + TAU : ws[i + 1];
      // the overlap of this chamber with the view, in relative angle (trying the chamber shifted a lap either way)
      let a0 = null, a1 = null;
      for (const sh of [-TAU, 0, TAU]) { const lo = lo0 + sh, hi = hi0 + sh, s = Math.max(lo + 10 / RG.R, vrel - vh), e = Math.min(hi - 10 / RG.R, vrel + vh); if (e > s) { a0 = s; a1 = e; break; } }
      if (a0 === null) return;
      const room = this.labRoomAt(ri, (lo0 + hi0) / 2); if (!room) return;
      const T = room.kind, th = room.theme, mid = RG.R + RG.ceil * 0.42, step = px => px / RG.R;
      quad(a0, a1, RG.R, top, th.wall);
      const from = px => Math.ceil(a0 / step(px)) * step(px);
      if (T === 'store' || T === 'library') {                                     // planks / panelling
        if (T === 'store') for (let r = RG.R + 12; r < top; r += 12) arc(a0, a1, r, 0x1a0e06, 1.4); else for (let a = from(16); a < a1; a += step(16)) vline(a, RG.R, top, 0x1a0c06, 1.4);
        if (T === 'library') { quad(a0, a1, RG.R, RG.R + 26, 0x3a2010); arc(a0, a1, RG.R + 26, 0x8a5a2a, 2); }
      } else if (T === 'kitchen' || T === 'lab') {                                // tiles: checkered in the kitchen, white in the lab
        const s = 12, rTop = T === 'kitchen' ? RG.R + 48 : top;
        for (let r = RG.R, row = 0; r < rTop; r += s, row++) for (let a = from(s), col = 0; a < a1; a += step(s), col++) { const on = T === 'kitchen' ? ((Math.round(a / step(s)) + row) % 2 === 0) : true; if (on) quad(a, Math.min(a1, a + step(s) - step(1.5)), r, Math.min(rTop, r + s - 1.5), T === 'kitchen' ? 0xd8d0c0 : 0xb8c8c4, T === 'kitchen' ? 0.55 : 0.35); }
        if (T === 'kitchen') { quad(a0, a1, RG.R + 48, top, 0x4a3a2a); arc(a0, a1, RG.R + 48, 0x8a7a5a, 2); for (let a = from(60); a < a1; a += step(60)) { const p = pol(this.caveAbs(a + step(30)), RG.R + 80); g.fillStyle(0x2a1e12, 0.6).fillEllipse(p.x, p.y, 18 * z, 30 * z); } }   // grease stains
        else for (let a = from(90); a < a1; a += step(90)) { const p = pol(this.caveAbs(a), RG.R + 70); g.fillStyle(0x3a6a3a, 0.5).fillCircle(p.x, p.y, 6 * z); }                                                    // mould spots
      } else if (T === 'dining') {                                                // damask: little gold diamonds on red, a dark wainscot, a gold rail
        for (let r = RG.R + 40, row = 0; r < top - 8; r += 16, row++) for (let a = from(18) + (row % 2) * step(9); a < a1; a += step(18)) { const p = pol(this.caveAbs(a), r); g.fillStyle(0xa8722a, 0.55).fillTriangle(p.x, p.y - 4 * z, p.x + 3 * z, p.y, p.x - 3 * z, p.y).fillTriangle(p.x, p.y + 4 * z, p.x + 3 * z, p.y, p.x - 3 * z, p.y); }
        quad(a0, a1, RG.R, RG.R + 30, 0x2a0a0c); arc(a0, a1, RG.R + 30, 0xd8a440, 2.5);
      } else if (T === 'cellar') {                                                // brick: courses with the joints staggered, arched alcoves
        for (let r = RG.R + 9, row = 0; r < top; r += 9, row++) { arc(a0, a1, r, 0x1a0c06, 1.2); for (let a = from(20) + (row % 2) * step(10); a < a1; a += step(20)) vline(a, r - 9, r, 0x1a0c06, 1.2); }
        for (let a = from(110); a < a1; a += step(110)) { const p = pol(this.caveAbs(a + step(55)), RG.R + 52); g.fillStyle(0x140804, 0.7).fillEllipse(p.x, p.y, 40 * z, 60 * z); }
      } else if (T === 'boiler') {                                                // riveted plates, rust streaks
        for (let r = RG.R + 28; r < top; r += 28) arc(a0, a1, r, 0x120a06, 2);
        for (let a = from(40); a < a1; a += step(40)) { vline(a, RG.R, top, 0x120a06, 2); for (let r = RG.R + 6; r < top; r += 14) { const p = pol(this.caveAbs(a + step(4)), r); g.fillStyle(0x6a4a3a, 1).fillCircle(p.x, p.y, 1.2 * z); } const s0 = pol(this.caveAbs(a + step(18)), top - 4), s1 = pol(this.caveAbs(a + step(18)), top - 50); g.lineStyle(3 * z, 0x6a2a0e, 0.5).lineBetween(s0.x, s0.y, s1.x, s1.y); }
      } else if (T === 'barracks') {                                              // plaster with a dado line, damp patches
        quad(a0, a1, RG.R, RG.R + 36, 0x1a1e16); arc(a0, a1, RG.R + 36, 0x5a6a42, 2);
        for (let a = from(130); a < a1; a += step(130)) { const p = pol(this.caveAbs(a + step(40)), RG.R + 80); g.fillStyle(0x161a12, 0.7).fillEllipse(p.x, p.y, 34 * z, 18 * z); }
      } else if (T === 'armoury') {                                               // big stone blocks, a banner of the King now and then
        for (let r = RG.R + 22, row = 0; r < top; r += 22, row++) { arc(a0, a1, r, 0x0e0e14, 1.6); for (let a = from(36) + (row % 2) * step(18); a < a1; a += step(36)) vline(a, r - 22, r, 0x0e0e14, 1.6); }
        for (let a = from(200); a < a1; a += step(200)) { const c = this.caveAbs(a + step(100)), p1 = pol(wrap(c - step(10)), top - 6), p2 = pol(wrap(c + step(10)), top - 6), p3 = pol(wrap(c + step(10)), top - 50), p4 = pol(c, top - 42), p5 = pol(wrap(c - step(10)), top - 50); g.fillStyle(0x8a1818, 1).fillPoints([p1, p2, p3, p4, p5], true); const q = pol(c, top - 24); g.fillStyle(0xd8a440, 1).fillCircle(q.x, q.y, 3.5 * z); }
      } else if (T === 'games') {                                                 // green baize panels in wood frames, a wood dado
        quad(a0, a1, RG.R, RG.R + 30, 0x3a200e); arc(a0, a1, RG.R + 30, 0x8a5a2a, 2.5); arc(a0, a1, top - 8, 0x8a5a2a, 2);
        for (let a = from(70); a < a1; a += step(70)) vline(a, RG.R + 30, top - 8, 0x5a3a1a, 3);
      }
      // a couple of wall lamps in every room, so you can see it (lights: labDark)
      for (let a = from(240) + step(120); a < a1; a += step(240)) { const p = pol(this.caveAbs(a), RG.R + RG.ceil * 0.66); g.fillStyle(0x2a1a0e, 1).fillRect(p.x - 2 * z, p.y, 4 * z, 8 * z); g.fillStyle(th.lamp, 1).fillCircle(p.x, p.y - 1 * z, 3.4 * z); this.labLights.unshift([p.x, p.y, 120 * z, 0.55]); }
    });
    for (const q of this.labFurn || []) {
      const vis = inView(q.theta); q.im.setVisible(vis); if (!vis) continue;
      this.place(q.im, q.theta, q.h, 0);
      if (q.tex === 'lb_chand' || q.tex === 'lb_bulb' || q.tex === 'lb_slot' || q.tex === 'lb_boiler' || q.tex === 'lb_stove' || q.tex === 'lb_desk' || q.tex === 'lb_bench') {
        const p = this.screenPos(q.theta, q.kind === 1 ? q.h - 30 : 30); this.labLights.unshift([p.x, p.y, (q.kind === 1 ? 150 : 110) * z, 0.8 + 0.1 * Math.sin(t * 9 + q.theta * 20)]);
      }
    }
  },
  // the name of the room he's in: big the first time, small under the cheese gauge after that
  labRoomsHud() {
    const C = this.cave, P = this.pl; if (!C || !C.ring) { if (this.roomTxt) this.roomTxt.setVisible(false); if (this.roomBig) this.roomBig.setVisible(false); return; }
    if (!this.roomTxt) {
      this.roomTxt = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '7px', color: '#c8a050', stroke: '#1a1020', strokeThickness: 3 }).setOrigin(0.5).setDepth(20).setScrollFactor(0);
      this.roomBig = this.add.text(0, 0, '', { fontFamily: PIXEL, fontSize: '14px', color: '#ffe8a0', stroke: '#1a1020', strokeThickness: 5, align: 'center' }).setOrigin(0.5).setDepth(20).setScrollFactor(0).setVisible(false);
      C.rooms = C.rooms || {};
    }
    const r = this.labRoomAt(C.ring, this.labRel(P.theta));
    this.roomTxt.setVisible(!!r).setPosition(this.W / 2, 72).setText(r ? r.name : '');
    if (r && r.key !== C.roomKey) {
      C.roomKey = r.key;
      if (!C.rooms[r.key]) { C.rooms[r.key] = true; this.roomBigT = 2.2; this.roomBig.setText(r.name).setColor('#' + r.theme.map.toString(16).padStart(6, '0')); Sound.sfx('blip'); }
    }
    if (this.roomBigT > 0) { this.roomBigT -= this.lastDt || 0.016; const a = Math.min(1, this.roomBigT * 2, (2.2 - this.roomBigT) * 6); this.roomBig.setVisible(true).setPosition(this.W / 2, this.H * 0.3).setAlpha(a).setScale(1 + Math.max(0, 0.15 - (2.2 - this.roomBigT) * 0.6)); }
    else this.roomBig.setVisible(false);
  },
};

