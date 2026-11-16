// ================================================================= MOON CAMP GROWS (v3.36)
// The camp fills up as you get further: each milestone adds something new round the moon, and the first time you
// land back at camp after earning one, Fridge-o-tron points it out (with a sparkle on the new thing).
const CAMP_GROW = [
  { id: 'kennel', tex: 'cr_kennel', theta: 0.55,  sc: 1.6, say: 'A KENNEL FOR BISCUIT!',     need: () => Meta.stats().runs >= 1,     how: 'Finish a run' },
  { id: 'garden', tex: 'cr_garden', theta: -1.0,  sc: 1.6, say: 'A CHEESE PLANT PATCH!',     need: () => rushBestPlanets() >= 2,       how: 'Clear 2 planets in a run' },
  { id: 'scope',  tex: 'cr_scope',  theta: 1.8,   sc: 1.7, say: 'A TELESCOPE, FOR SPOTTING RATS!', need: () => rushBestPlanets() >= 3, how: 'Clear 3 planets in a run' },
  { id: 'tub',    tex: 'cr_tub',    theta: 1.15,  sc: 1.6, say: 'A FONDUE HOT TUB!',          need: () => rushBestPlanets() >= 4,       how: 'Clear 4 planets in a run' },
  { id: 'trophy', tex: 'cr_trophy', theta: 2.6,   sc: 1.7, say: 'THE GOLDEN TROPHY!',         need: () => Meta.stats().wins >= 1,     how: 'Win a run' },
  { id: 'target', tex: 'cr_target', theta: -2.2,  sc: 1.6, say: 'A TARGET BOARD!',            need: () => WEAPONS.filter(w => Progress.hasGun(w.id)).length >= 3, how: 'Own 3 guns' },
  { id: 'bessie', tex: 'bessie',    theta: 2.8,   sc: 0.9, say: 'BESSIE MOVED IN!',           need: () => Progress.best >= 10,        how: 'Beat the campaign' },
  { id: 'crown',  tex: 'cr_crown',  theta: -2.95, sc: 1.4, h: 118, say: 'A CROWN FOR THE BOSS GATE!', need: () => { const b = Rush.best(); return !!(b && b.n >= RUSH_ORDER.length); }, how: 'Clear the Boss Rush' }
];
function rushBestPlanets() { const b = Run.best(); return b ? b.planets || 0 : 0; }

function makeGrowTextures(scene) {
  if (scene.textures.exists('cr_kennel')) return;
  const WD = [0xd09050, 0x9a5c26, 0x5a3212], RED = [0xff7a6a, 0xd83a2a, 0x7a1410], ST = [0xeef2f8, 0x9aa4b4, 0x4a5262], GOLD = [0xfff0a0, 0xf2c040, 0x9a6a10],
    STONE = [0xb8b0c8, 0x7a7090, 0x3a3450], CH = [0xfff0a0, 0xf2c040, 0xa8700c];
  pixSprite(scene, 'cr_kennel', 44, 40, a => {
    a.rect(6, 18, 38, 39, WD[1]); for (let y = 21; y < 39; y += 4) a.rect(6, y, 38, y, WD[2]);           // planks
    a.poly([[2, 20], [22, 3], [42, 20]], RED); a.rect(2, 19, 42, 21, 0x7a1410);                           // roof
    a.ell(22, 32, 7, 8, 0x1a1020); a.rect(15, 32, 29, 39, 0x1a1020);                                      // doorway
    a.rect(12, 13, 32, 17, WD[0]); for (let x = 14; x < 31; x += 3) a.px(x, 15, 0x5a3212);                // name plank (BISCUIT, in squiggles)
    a.ell(40, 37, 4, 2, [0xff8a8a, 0xd83a2a, 0x7a1410]); a.ell(40, 36, 2.5, 1, 0xd8b070);                 // his bowl
  });
  pixSprite(scene, 'cr_garden', 56, 30, a => {
    a.rect(0, 22, 55, 29, 0x6a4a2a); a.rect(0, 22, 55, 23, 0x8a6a3a);                                   // soil
    for (const [x, h] of [[7, 14], [17, 18], [28, 12], [38, 17], [48, 13]]) {
      a.line([[x, 22], [x, 22 - h]], 0x3a9a2a, 2); a.ell(x - 3, 22 - h * 0.5, 3, 1.5, 0x5ac83a);           // stems, leaves
      a.poly([[x - 4, 22 - h], [x + 4, 22 - h], [x, 22 - h - 7]], CH);                                    // a cheese wedge flower
    }
  });
  pixSprite(scene, 'cr_scope', 40, 56, a => {
    a.line([[20, 34], [8, 55]], 0x5a3212, 2); a.line([[20, 34], [32, 55]], 0x5a3212, 2); a.line([[20, 34], [20, 55]], 0x5a3212, 2);   // tripod
    a.poly([[6, 30], [32, 6], [37, 12], [11, 36]], GOLD);                                                 // brass tube
    a.ell(35, 9, 4, 4, [0xbff0ff, 0x4aa0d8, 0x1a4a7a]); a.rect(14, 26, 19, 31, 0x9a6a10);                  // lens, band
  });
  pixSprite(scene, 'cr_tub', 52, 34, a => {
    a.rrect(2, 10, 50, 33, 4, WD); for (const x of [10, 26, 42]) a.rect(x, 10, x + 1, 33, 0x5a3212);       // the barrel tub
    a.rect(2, 16, 50, 18, ST[1]); a.rect(2, 27, 50, 29, ST[1]);                                            // hoops
    a.ell(26, 10, 23, 5, CH); for (const [x, y] of [[14, 9], [30, 8], [40, 10]]) a.ell(x, y, 2.5, 1.5, 0xfff8d0);   // bubbling fondue
  });
  pixSprite(scene, 'cr_trophy', 36, 50, a => {
    a.rrect(6, 40, 30, 49, 1, STONE); a.rect(4, 38, 32, 41, STONE[0]);                                         // plinth
    a.rrect(14, 30, 22, 38, 1, GOLD); a.rect(16, 25, 20, 31, GOLD[1]);                                         // stem
    a.poly([[6, 4], [30, 4], [27, 20], [18, 26], [9, 20]], GOLD);                                         // cup
    a.line([[6, 7], [1, 10], [6, 17]], GOLD[1], 2); a.line([[30, 7], [35, 10], [30, 17]], GOLD[1], 2);      // handles
    a.rect(10, 6, 12, 18, 0xfffbe0);                                                                       // shine
  });
  pixSprite(scene, 'cr_target', 40, 56, a => {
    a.rect(18, 36, 22, 55, WD[2]); a.line([[20, 50], [10, 55]], WD[2], 2); a.line([[20, 50], [30, 55]], WD[2], 2);
    a.ell(20, 20, 17, 17, [0xffffff, 0xeeeeee, 0xb0b0b0]); a.ell(20, 20, 13, 13, RED); a.ell(20, 20, 9, 9, [0xffffff, 0xeeeeee, 0xb0b0b0]); a.ell(20, 20, 5, 5, RED);
    a.ell(26, 15, 1.5, 1.5, 0x1a1020); a.ell(13, 24, 1.5, 1.5, 0x1a1020);                                 // a couple of hits
  });
  pixSprite(scene, 'cr_crown', 30, 22, a => {
    a.poly([[2, 20], [2, 6], [9, 13], [15, 2], [21, 13], [28, 6], [28, 20]], GOLD);
    for (const [x, y, c] of [[15, 8, 0xff3a5a], [8, 16, 0x3ad8ff], [22, 16, 0x7dff8a]]) a.ell(x, y, 2, 2, c);
  });
  // the BOSS GATE: a stone arch with a red glow inside and a rat skull on the keystone
  pixSprite(scene, 'cr_gate', 60, 72, a => {
    a.rrect(4, 14, 16, 71, 1, STONE); a.rrect(44, 14, 56, 71, 1, STONE);                                           // pillars
    a.ell(30, 18, 26, 16, STONE); a.ell(30, 22, 15, 12, 0x2a0a10);                                         // arch top, opening
    a.rrect(16, 22, 44, 71, 1, [0x5a0a1a, 0x3a0610, 0x1a0208]);                                                // the dark doorway
    a.ell(30, 46, 10, 18, [0xff6a5a, 0xc8202a, 0x5a0a10]);                                                 // red glow
    for (let y = 18; y < 70; y += 9) { a.rect(4, y, 16, y, STONE[2]); a.rect(44, y, 56, y, STONE[2]); }   // stone courses
    a.ell(30, 7, 6, 5, [0xfff8e8, 0xd8d0c0, 0x8a8070]); a.px(28, 6, 0x1a1020); a.px(32, 6, 0x1a1020); a.rect(28, 10, 32, 11, 0x1a1020);   // rat skull
  });
  pixSprite(scene, 'cr_skull', 20, 18, a => { a.ell(10, 8, 8, 7, [0xfff8e8, 0xd8d0c0, 0x8a8070]); a.ell(7, 8, 2, 2, 0x1a1020); a.ell(13, 8, 2, 2, 0x1a1020); a.rect(7, 13, 13, 15, 0x1a1020); });
}

const CampGrowMixin = {
  campGrowInit() {
    let seen = []; try { seen = JSON.parse(localStorage.getItem('lc_camp_seen') || '[]'); } catch (e) { /* ignore */ }
    const fresh = [];
    this.campGrown = [];
    for (const G of CAMP_GROW) {
      if (!G.need() || !this.textures.exists(G.tex)) continue;
      const spr = this.add.image(0, 0, G.tex).setOrigin(0.5, 1).setDepth(2.4); spr.bsx = spr.bsy = G.sc;
      if (G.id === 'bessie') spr.setFlipX(true);
      const a = { spr, theta: G.theta, h: (G.h || 0) - (G.h ? 0 : this.campSink(spr, G.sc)), rot: 0 };
      this.actors.push(a); this.campGrown.push({ G, a });
      if (!seen.includes(G.id)) fresh.push({ G, a });
    }
    if (fresh.length) {
      try { localStorage.setItem('lc_camp_seen', JSON.stringify(seen.concat(fresh.map(f => f.G.id)))); } catch (e) { /* ignore */ }
      this.time.delayedCall(this.campSum ? 3800 : 1600, () => {
        this.campSay('NEW AT CAMP: ' + fresh.map(f => f.G.say).join(' '), 5);
        for (const f of fresh) for (let k = 0; k < 4; k++) this.time.delayedCall(k * 250, () => this.burst(f.a.theta, 30, 'spark', 8, 1));
        Sound.sfx('reveal');
      });
    }
  },
  // the bits still to come, for the noticeboard
  campGrowNext() { return CAMP_GROW.filter(G => !G.need()).map(G => G.how + ': ' + G.say.replace(/!$/, '').toLowerCase()); }
};
