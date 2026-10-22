// One shared texture sheet for every sprite.
//
// All the art is generated in code. At boot, buildAllTextures() runs every generator once, then Atlas.pack()
// copies each sprite onto shared 2048x2048 pages and re-points its texture key at that patch of the page.
// Game code keeps using the same keys ('mouse', 'c_gun', ...), but everything now draws from one or two GPU
// textures, so sprites batch together instead of switching textures.
//
// GOING FORWARD: any new sprite generator must be called from buildAllTextures() (generators skip work when
// their keys already exist, so it is safe for scenes to keep calling them too). Anything made later still
// works, it just isn't on the sheet.
// Kept OFF the sheet on purpose: smooth-filtered textures (the light halo), big photos (title art), and the
// sky gradients that are regenerated when the screen size changes.

const Atlas = (() => {
  const PAGE = 2048, PAD = 2, MAX = 1024;
  const SKIP = new Set(['titleArt', 'halo']);
  const pages = [], packed = new Set();
  let page = null;

  function newPage(mgr) {
    const key = '__atlas' + pages.length, ct = mgr.createCanvas(key, PAGE, PAGE), ctx = ct.getContext();
    ctx.imageSmoothingEnabled = false;
    page = { key, ct, ctx, x: PAD, y: PAD, rowH: 0, dirty: false };
    pages.push(page);
    packed.add(key);
  }

  function eligible(mgr, key) {
    if (packed.has(key) || SKIP.has(key) || key.startsWith('__') || key.startsWith('skyd')) return null;
    const t = mgr.list[key];
    if (!t || t.frameTotal !== 1 || t.source.length !== 1) return null;            // single-image textures only
    const src = t.source[0], img = src.image;
    if (!img || src.isRenderTexture || src.isGLTexture) return null;
    if (src.scaleMode === Phaser.ScaleModes.LINEAR) return null;                    // smooth-filtered: keep separate
    const w = src.width, h = src.height;
    if (!w || !h || w > MAX || h > MAX) return null;
    return { key, img, w, h };
  }

  // a texture whose only frame is a patch of a shared page (sharing the page's GPU texture)
  function proxy(mgr, key, pg, x, y, w, h) {
    const T = Phaser.Textures.Texture;
    const t = new T(mgr, key, [], w, h);
    t.source.push(pg.ct.source[0]);
    t.add('__BASE', 0, x, y, w, h);
    t.destroy = function () { this.source = []; T.prototype.destroy.call(this); };   // never destroy the shared page
    return t;
  }

  function pack(scene) {
    const mgr = scene.textures, items = [];
    for (const key of Object.keys(mgr.list)) { const it = eligible(mgr, key); if (it) items.push(it); }
    if (!items.length) return 0;
    items.sort((a, b) => b.h - a.h || b.w - a.w);                                    // shelf packing, tallest first
    if (!page) newPage(mgr);
    for (const it of items) {
      if (page.x + it.w + PAD > PAGE) { page.x = PAD; page.y += page.rowH + PAD; page.rowH = 0; }
      if (page.y + it.h + PAD > PAGE) newPage(mgr);
      it.pg = page; it.x = page.x; it.y = page.y;
      page.ctx.drawImage(it.img, it.x, it.y);
      page.x += it.w + PAD; page.rowH = Math.max(page.rowH, it.h); page.dirty = true;
    }
    for (const pg of pages) if (pg.dirty) { pg.ct.refresh(); pg.ct.setFilter(Phaser.Textures.FilterMode.NEAREST); pg.dirty = false; }
    for (const it of items) {
      mgr.remove(it.key);                                                            // frees the old standalone texture
      mgr.list[it.key] = proxy(mgr, it.key, it.pg, it.x, it.y, it.w, it.h);
      packed.add(it.key);
    }
    return items.length;
  }

  return { pack, pages, has: k => packed.has(k) };
})();

// Run every sprite generator once, then pack them all onto the sheet. Called at boot, before any sprite exists.
function buildAllTextures(scene) {
  if (scene.registry.get('atlasBuilt')) return;
  const t0 = performance.now();
  makeIntroTextures(scene); makeTextures(scene); makeLevelTextures(scene); makeChrisTextures(scene); makeHudTextures(scene);
  makeCosmicTextures(scene); makeWarpTextures(scene); makePlatformTextures(scene); makeRoadmapTextures(scene); makePowerupTextures(scene); makeIntroPix(scene); makeEndingPix(scene); makeHalo(scene);
  for (const id of Object.keys(LEVELS)) {                                            // the pixel planets
    const d = LEVELS[id];
    if (d.surface) { makePlanetTexture(scene, 'surf' + id, d.radius || 420, d.surface.pal, d.surface.seed, d.surface); makePlanetShade(scene, 'shade' + id, d.radius || 420, d.surface.rimLight, d.surface.dark); }
    if (d.nebula) for (let i = 0; i < d.nebula.n; i++) if (!scene.textures.exists('neb' + id + '_' + i)) makeNebula(scene, 'neb' + id + '_' + i, 900 + i * 41, d.nebula.pal);
  }
  // pre-made glow versions (see bakedGlow in main.js) so they live on the sheet too
  for (const [k, c, s, d] of [['lava_pool', 0xff7a1a, 3, 6], ['swissball', 0xffe27a, 2, 6], ['power', 0xfff3a0, 3, 8], ['ratship', 0x9fd8ff, 1, 6],
    ['spore', 0x7dff8a, 2, 6], ['blade', 0xdfe6f0, 2, 6], ['crumb', 0xffc040, 2, 6], ['cube', 0xffc040, 2, 6], ['meatball', 0xffc040, 2, 6],
    ['pepper', 0xff6a3a, 2, 6], ['ghostorb', 0x9fd8ff, 2, 6], ['chili', 0xff4a2a, 2, 6], ['psyorb', 0xc080ff, 2, 6]]) {
    if (scene.textures.exists(k)) makeGlowTexture(scene, k, c, s, d);
  }
  const n = Atlas.pack(scene);
  scene.registry.set('atlasBuilt', true);
  console.log('[atlas] packed ' + n + ' sprites onto ' + Atlas.pages.length + ' sheet(s) in ' + Math.round(performance.now() - t0) + 'ms');
}
