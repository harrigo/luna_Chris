// (v3.81) THE PIXEL LOOK (trial, level 1): one pixel grid for the whole world, light and dark, single-pixel particles.
//  1. The world camera is snapped to a coarse grid (PX_BLOCK screen px = one art pixel) by a post pass, so the planet,
//     sprites, scenery and effects all share ONE pixel size. The HUD lives on its own camera on top and stays crisp.
//  2. A light map: the world is multiplied by a dim ambient, and light sources (Chris, the gun, shots, lava, glows,
//     pickups) punch stepped pools of light back into it.
//  3. Sparks, crumbs and splats become single grid pixels with gravity instead of little sprites.
// (v3.83) the GRID and the pixel particles are dropped for now (still there with ?pixlook to compare). The LIGHT MAP stays,
// softer, as "moody light" on level 1: menu LIGHTING: MOODY / CLASSIC, or ?classic in the URL.
const PX_BLOCK = (() => { const m = /[?&]pixlook=(\d)/.exec(location.search); return m ? Math.max(2, Math.min(4, +m[1])) : 2; })();
// (v3.84) MOODY LIGHT on every level, each with its own ambient (what the world is multiplied by) and Chris's light colour.
// (v3.89) A third number lifts the dimming off the sky at the top of the screen (0-1), for levels whose sky is already dark.
const MOOD = {
  1: [0x9894b8, 0xfff0d0],      // Gruyère Globe: purple night
  2: [0x8aa89c, 0xf0ffd8],      // Gorgonzola Gulch: swamp green gloom
  3: [0x9890c0, 0xf0e8ff],      // Brie-muda Triangle: ghostly violet
  4: [0xc09a8c, 0xffe0b8, 0.55], // Mount Mozzarella: red heat (the lava does the lighting); its sky is already dark, so leave it be
  5: [0x9c9caa, 0xfff0d8],      // the Great Grater: grey factory
  5.5: [0xac9cb4, 0xfff0d0],    // Fondue Fountain: carnival dusk
  6: [0xb8a290, 0xfff0d0, 0.6], // Cheddar Gorge: sunset
  7: [0x8e9ec4, 0xe0f0ff],      // Astro-Rat Armada: deep blue sea
  8: [0xb8b8c6, 0xfff0d8],      // Lactose Labyrinth: already dark underground, so only a touch
  9: [0xbaa692, 0xfff0d0, 0.5], // Parmesan Prime: warm city
  10: [0x9696b6, 0xfff0d0]      // the Royal Saucer: night
};
const pxLevelOK = s => !!(s.def && !s.camp && !s.training && !(s.def && s.def.cavern) && MOOD[s.levelId]);
const PX_HUD_DEPTH = 19;                                 // anything at or above this is HUD (crisp, unlit)
const PX_TEX = new Set(['spark', 'crumb', 'mm_splat', 'shard', 'flame', 'fdrop']);   // burst() textures that become single pixels

const PX_FRAG = `
precision mediump float;
uniform sampler2D uMainSampler;
uniform vec2 uRes;
uniform float uBlock;
varying vec2 outTexCoord;
void main() {
  vec2 p = (floor(outTexCoord * uRes / uBlock) + 0.5) * uBlock;      // the centre of this pixel's block
  gl_FragColor = texture2D(uMainSampler, p / uRes);
}`;
let PxPipe = null;
function pxPipeClass() {
  if (PxPipe) return PxPipe;
  PxPipe = class extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    constructor(game) { super({ game, name: 'LCPix', fragShader: PX_FRAG }); }
    onPreRender() { this.set2f('uRes', this.renderer.width, this.renderer.height); this.set1f('uBlock', PX_BLOCK); }
  };
  return PxPipe;
}

// light-map stamp: a solid core then three hard steps out to dark
function makePxTextures(scene) {
  const T = scene.textures;
  if (!T.exists('pxdot')) { const t = T.createCanvas('pxdot', 1, 1); const c = t.getContext(); c.fillStyle = '#fff'; c.fillRect(0, 0, 1, 1); t.refresh(); }
  if (!T.exists('pxsky')) {                                                   // (v3.89) white at the top, fading out by 60% of the way down
    const t = T.createCanvas('pxsky', 4, 64), c = t.getContext();
    for (let y = 0; y < 64; y++) { const a = Math.pow(Math.max(0, 1 - (y / 63) / 0.6), 1.2); c.fillStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')'; c.fillRect(0, y, 4, 1); }
    t.refresh(); t.setFilter(Phaser.Textures.FilterMode.LINEAR);
  }
  if (!T.exists('pxlight')) {
    const N = 256, t = T.createCanvas('pxlight', N, N), c = t.getContext(), img = c.createImageData(N, N), D = img.data;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const d = Math.hypot(x + 0.5 - N / 2, y + 0.5 - N / 2) / (N / 2), i = (y * N + x) * 4;
      const s = d >= 1 ? 0 : d < 0.4 ? 1 : d < 0.62 ? 0.72 : d < 0.82 ? 0.45 : 0.2;   // a solid core and three clean steps (v3.83: drawn big, so the edge is smooth at full resolution)
      D[i] = D[i + 1] = D[i + 2] = 255; D[i + 3] = Math.round(s * 255);   // (v3.89: see-through outside the pool, so lights drawn together can't leave a square)
    }
    c.putImageData(img, 0, 0); t.refresh(); t.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
}

const PixelLookMixin = {
  pxWanted() {                                          // the light map
    if (!pxLevelOK(this)) return false;
    if (/[?&]classic/.test(location.search)) return false;
    if (/[?&]pixlook/.test(location.search)) return true;
    return Settings.moody !== false;
  },
  pxGridWanted() { return this.pxWanted() && /[?&]pixlook/.test(location.search); },   // the pixel grid + pixel particles
  pxInit() {
    this.px = null;
    if (!pxLevelOK(this)) return;
    const rn = this.game.renderer; if (!rn || rn.type !== Phaser.WEBGL) return;
    makePxTextures(this);
    const W = this.scale.width, H = this.scale.height, main = this.cameras.main;
    const X = this.px = { on: false, cols: {}, amb: this.def.pxAmbient || 0x6e6a8c, grid: false };
    X.hud = this.cameras.add(0, 0, W, H); X.hud.transparent = true;
    X.rt = this.add.renderTexture(0, 0, W + 64, H + 64).setOrigin(0).setPosition(-32, -32).setScrollFactor(0).setDepth(9.65).setBlendMode(Phaser.BlendModes.MULTIPLY);
    // fades and flashes on the world camera: do the HUD too, so the screen still goes to black at the end
    for (const k of ['fadeOut', 'fadeIn']) { const f = main[k].bind(main); main[k] = (...a) => { if (X.on) X.hud[k](...a); return f(...a); }; }
    const onResize = () => { X.hud.setSize(this.scale.width, this.scale.height); X.rt.resize(this.scale.width + 64, this.scale.height + 64); };
    this.scale.on('resize', onResize);
    // which camera draws what: HUD depths on the HUD camera, everything else on the world camera
    const split = () => {
      const m = main.id, h = X.hud.id;
      for (const o of this.children.list) o.cameraFilter = X.grid ? (o.depth >= PX_HUD_DEPTH ? m : h) : h;
    };
    this.events.on('prerender', split);
    this.events.once('shutdown', () => { this.events.off('prerender', split); this.scale.off('resize', onResize); this.px = null; });
    this.pxApply();
  },
  // turn the look on or off to match the setting (also called when the graphics setting changes)
  pxApply() {
    const X = this.px; if (!X) return;
    const on = this.pxWanted(), main = this.cameras.main, rn = this.game.renderer;
    X.on = on; X.grid = this.pxGridWanted(); X.amb = X.grid ? (this.def.pxAmbient || 0x6e6a8c) : (this.def.moodAmbient || MOOD[this.levelId][0]);
    const grid = X.grid;
    try {
      if (!rn.pipelines.getPostPipeline('LCPix')) rn.pipelines.addPostPipeline('LCPix', pxPipeClass());
      const has = main.getPostPipeline('LCPix'), there = Array.isArray(has) ? has.length > 0 : !!has;
      if (grid && !there) main.setPostPipeline('LCPix');
      if (!grid && there) main.removePostPipeline('LCPix');
    } catch (e) { /* no post pipelines: the light map and particles still work */ }
    try {                                                 // (v3.82) no bloom under the pixel look: the light map is the only light
      const bp = main.getPostPipeline('LCBloom'), b = Array.isArray(bp) ? bp[0] : bp;
      if (b) { if (b.lcStrClassic === undefined) b.lcStrClassic = b.lcStr; b.lcStr = grid ? 0 : b.lcStrClassic; }
    } catch (e) { /* ignore */ }
    X.hud.setVisible(grid);
    X.rt.setVisible(on);
    if (this.fxBang) {                                    // the hit-spark emitter: single pixels, no shrink
      if (grid) { this.fxBang.setTexture('pxdot'); this.fxBang.setParticleScale(PX_BLOCK, PX_BLOCK); }
      else { this.fxBang.setTexture('spark'); this.fxBang.setParticleScale(1.5, 0); }
    }
  },

  // a few colours picked out of a sprite, so its debris pixels match it
  pxColours(tex) {
    const X = this.px; if (X.cols[tex]) return X.cols[tex];
    const out = [], T = this.textures;
    try {
      const fr = T.getFrame(tex), w = fr.width, h = fr.height;
      for (let i = 0; i < 60 && out.length < 8; i++) {
        const c = T.getPixel(Math.floor(Math.random() * w), Math.floor(Math.random() * h), tex);
        if (c && c.alpha > 200) out.push(c.color);
      }
    } catch (e) { /* ignore */ }
    return (X.cols[tex] = out.length ? out : [0xffffff]);
  },
  // burst(), the pixel way: twice as many, each one grid pixel, bright ones additive
  pxBurst(theta, h, tex, n, spd) {
    const cols = this.pxColours(tex), z = this.zoom || 1, glow = tex === 'spark' || tex === 'flame';
    const m = Math.min(40, Math.round(n * 2));
    for (let i = 0; i < m; i++) {
      const spr = this.add.image(0, 0, 'pxdot').setDepth(9).setTint(cols[(Math.random() * cols.length) | 0]);
      if (glow) spr.setBlendMode(Phaser.BlendModes.ADD);
      spr.bsx = spr.bsy = PX_BLOCK / z;
      this.parts.push({ theta, h, vt: rnd(-200, 200) * spd, vh: rnd(40, 360) * spd, life: rnd(0.35, 0.9), spr });
    }
    if (glow) this.addLight(theta, h, 30 + m * 3, 0xffc060, 0.9, 0.18);          // sparks light the area for a moment
  },

  // ---- the light map, redrawn every frame
  pxLights() {
    const X = this.px; if (!X || !X.on) return;
    const rt = X.rt, cam = this.cameras.main, P = this.pl, z = this.zoom, L = [];
    const add = (theta, h, r, col, a) => { if (a > 0.02) L.push([theta, h, r, col, a]); };
    // Chris carries a warm pool of light, a little bigger when powered up
    if (P && this.state !== 'dead') add(P.theta, P.h + 34, X.grid ? (P.power > 0 ? 120 : 95) : (P.power > 0 ? 170 : 140), MOOD[this.levelId] ? MOOD[this.levelId][1] : 0xfff0d0, 0.85);
    for (const l of this.lights) add(l.theta, l.h, l.r * 1.6, l.col, Math.min(1, l.a * 1.3) * (l.life / l.max));
    if (this.muzzle && (P.firing > 0 || P.beamOn)) add(this.muzzle.theta, this.muzzle.h, 110 + Math.random() * 30, 0xffd27a, 1);   // muzzle flash flickers
    for (const b of this.pBullets) add(b.theta, b.h, 64, 0xffe08a, 0.9);
    for (const b of this.eBullets) add(b.theta, b.h, 52, 0xff8a5a, 0.75);
    for (const pk of this.pickups) add(pk.theta, pk.h + 8, pk.kind === 'power' ? 90 : 50, pk.kind === 'power' ? 0xfff3a0 : 0xffd86a, 0.7);
    for (const lv of (this.lavas || [])) add(lv.theta, lv.h + 6, 110, 0xff7a1a, 0.7);
    for (const G of (this.geysers || [])) if (G.st !== 'idle') add(G.theta, G.st === 'erupt' ? 60 : 10, G.st === 'erupt' ? 190 : 90, 0xff9a2a, G.st === 'erupt' ? 1 : 0.5);
    for (const e of this.enemies) if (e.type === 'boss' && e.hp > 0) add(e.theta, e.h + (e.ch || 30), 150, 0xc8b0ff, 0.35);
    const A = this.abduct; if (A && A.theta !== undefined && A.a > 0.05) add(A.theta, A.h - 70, 160, 0xffd23f, 0.8 * A.a);
    const ox = cam.scrollX - 32, oy = cam.scrollY - 32;          // the map sits 32px outside the screen on each side
    if (!X.stamp) X.stamp = this.make.image({ key: 'pxlight', add: false }).setOrigin(0.5).setBlendMode(Phaser.BlendModes.SCREEN);   // (v3.89: SCREEN, not ADD - ADD's dest-alpha factor dimmed a square round each light)
    const st = X.stamp;
    // (v3.88) all the lights in ONE pass over the map: draw() on its own switches the GPU to the map and back for every
    // light (40+ switches a frame on Mount Mozzarella, which is what was slowing phones down); batchDraw inside one
    // begin/end does them all in a single switch
    // (v3.101) the ambient fill is drawn INSIDE the one pass (stretched over the whole map at full alpha): fill() on its
    // own switched the GPU to the map and back
    // (a tint is ignored when drawing into the map, so the colour lives in a tiny texture, repainted only when it changes)
    const ac = typeof Tweak !== 'undefined' ? Tweak.amb(X.amb) : X.amb;
    if (!this.textures.exists('pxamb')) this.textures.createCanvas('pxamb', 4, 4);
    if (X.ambC !== ac) { const T = this.textures.get('pxamb'), cx2 = T.getContext(); cx2.fillStyle = '#' + ac.toString(16).padStart(6, '0'); cx2.fillRect(0, 0, 4, 4); T.refresh(); X.ambC = ac; }
    if (!X.base || !X.base.scene) X.base = this.make.image({ key: 'pxamb', add: false }).setOrigin(0, 0);
    X.base.setPosition(0, 0).setDisplaySize(rt.width, rt.height).setAlpha(1);
    rt.clear();                                                                  // (needed: without it the batch never lands)
    rt.beginDraw();
    rt.batchDraw(X.base);
    const lift = !X.grid && MOOD[this.levelId] && MOOD[this.levelId][2];
    if (lift) {                                                                  // (v3.89) keep the sky's own colour
      if (!X.sky) X.sky = this.make.image({ key: 'pxsky', add: false }).setOrigin(0, 0);
      X.sky.setPosition(0, 0).setDisplaySize(rt.width, rt.height).setAlpha(lift);
      rt.batchDraw(X.sky);
    }
    const tw = typeof Tweak !== 'undefined' ? Tweak.v : null, tl = tw ? tw.light / 100 : 1, tg = tw ? tw.glow / 100 : 1;   // (v3.99) the tweak sliders
    for (const l of L) {
      const sp = this.screenPos(l[0], l[1]); if (!sp.vis) continue;
      st.setPosition(sp.x - ox, sp.y - oy).setScale((l[2] * tl * 2 * z) / 256).setTint(l[3]).setAlpha(Math.min(1, l[4] * tg));
      rt.batchDraw(st);
    }
    rt.endDraw();
  }
};
