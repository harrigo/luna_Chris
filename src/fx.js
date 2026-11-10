// NEO-RETRO LIGHTING for every level (mixed into Level1):
//
//  BLOOM     (graphics HIGH) a soft bloom on the camera: shots, lava, fondue and lights bleed a little.
//  VIGNETTE  (MEDIUM+) the corners of the screen fall away into the level's shadow colour, under the HUD.
//  SHADOWS   (all) a soft blob of shadow on the ground under Chris and every enemy; it shrinks and fades as they
//            climb, so heights read at a glance.
//  RIM LIGHT (MEDIUM+) every level has a light (def.depth.light / .rim - the same one that shades the planet). NOT Chris (he
//            stays clean: on his white suit it read as a strange second outline) - but
//            the enemies get a thin edge of that light's colour on the side facing it: a copy of each sprite, filled
//            with the light colour, tucked just behind it and nudged towards the light. Enemies also fall off into the
//            level's shadow colour on the far side (a gradient tint, left alone while anything else tints them).

function makeFxTextures(scene) {
  if (!scene.textures.exists('gshadow')) {                          // (dithered, not smooth: it's pixel art)
    const w = 40, h = 12, ct = scene.textures.createCanvas('gshadow', w, h), ctx = ct.getContext(), img = ctx.createImageData(w, h), D = img.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const d = Math.hypot((x + 0.5 - w / 2) / (w / 2), (y + 0.5 - h / 2) / (h / 2)), th = BAYER4[(y & 3) * 4 + (x & 3)];
      if (d < 1 && (d < 0.8 || 1 - (d - 0.8) / 0.2 > th)) D[(y * w + x) * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0); ct.refresh(); ct.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
  if (!scene.textures.exists('__vignette')) {                       // smooth; kept off the sprite sheet ('__')
    const w = 256, h = 128, ct = scene.textures.createCanvas('__vignette', w, h), ctx = ct.getContext(), img = ctx.createImageData(w, h), D = img.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const d = Math.hypot((x + 0.5 - w / 2) / (w / 2), (y + 0.5 - h / 2) / (h / 2)) / 1.41, a = Math.max(0, (d - 0.5) / 0.5), i = (y * w + x) * 4;
      D[i] = D[i + 1] = D[i + 2] = 255; D[i + 3] = Math.round(255 * a * a);
    }
    ctx.putImageData(img, 0, 0); ct.refresh(); ct.setFilter(Phaser.Textures.FilterMode.LINEAR);
  }
}

// The bloom: one pass over the finished frame. Only the BRIGHT pixels bleed (a threshold), sampled on two little rings
// and added back on top, so the pixel art itself stays crisp. (Phaser's own bloom FX blurs the whole picture.)
const FX_BLOOM_FRAG = `
precision mediump float;
uniform sampler2D uMainSampler;
uniform vec2 uTexel;
uniform float uStr;
varying vec2 outTexCoord;
// (only bright AND colourful pixels: plain white - Chris's chef whites, the HUD text - gave everything a milky halo)
vec3 hot(vec2 uv) { vec3 c = texture2D(uMainSampler, uv).rgb; float l = max(c.r, max(c.g, c.b)), lo = min(c.r, min(c.g, c.b)); return c * smoothstep(0.74, 1.0, l) * smoothstep(0.18, 0.5, (l - lo) / max(l, 0.001)); }
void main() {
  vec4 base = texture2D(uMainSampler, outTexCoord);
  vec3 g = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.7853982;
    vec2 d = vec2(cos(a), sin(a)) * uTexel;
    g += hot(outTexCoord + d * 2.5) + hot(outTexCoord + d * 6.0) * 0.6 + hot(outTexCoord + d * 11.0) * 0.3;
  }
  gl_FragColor = vec4(base.rgb + g * (uStr / 15.2), base.a);
}`;
let FxBloomPipe = null, FX_BLOOM_STR = 0.6;          // (a level with a very bright planet turns it down: def.bloom)
function fxBloomClass() {
  if (FxBloomPipe) return FxBloomPipe;
  FxBloomPipe = class extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    constructor(game) { super({ game, name: 'LCBloom', fragShader: FX_BLOOM_FRAG }); }
    onPreRender() { this.set2f('uTexel', 1 / this.renderer.width, 1 / this.renderer.height); this.set1f('uStr', FX_BLOOM_STR); }
  };
  return FxBloomPipe;
}

const FxMixin = {
  fxInit() {
    makeFxTextures(this);
    const dp = this.def.depth || {}, L = dp.light || [-0.5, -0.8, 0.4], n = Math.hypot(L[0], L[1]) || 1;
    const rgb = a => Phaser.Display.Color.GetColor(a[0], a[1], a[2]);
    const dk = dp.dark || [30, 20, 70], mx = Math.max(40, dk[0], dk[1], dk[2]);
    const X = this.fx = {
      lx: L[0] / n, ly: L[1] / n,
      rim: dp.rim ? rgb(dp.atmo ? dp.rim.map((v, i) => Math.round(v * 0.6 + dp.atmo[i] * 0.4)) : dp.rim) : (this.def.rimGlow || 0xfff0c0),
      shade: [0, 1, 2].map(i => Math.round(255 * 0.62 + (dk[i] / mx) * 255 * 0.38)),      // the far side of a sprite is multiplied by this
      shadows: [], rims: [], tmp: new Phaser.GameObjects.Components.TransformMatrix(), bloom: null
    };
    X.vig = this.add.image(0, 0, '__vignette').setOrigin(0).setDepth(19.5).setScrollFactor(0)
      .setTint(Phaser.Display.Color.GetColor(Math.round(dk[0] * 0.5), Math.round(dk[1] * 0.5), Math.round(dk[2] * 0.5))).setAlpha(0.8);
    FX_BLOOM_STR = this.def.bloom !== undefined ? this.def.bloom : 0.6;
    this.fxApply();
  },
  // the bloom follows the graphics setting (called when it changes, too)
  fxApply() {
    const X = this.fx; if (!X) return;
    const cam = this.cameras.main;
    try {
      const rn = this.game.renderer;
      if (rn && rn.pipelines && rn.type === Phaser.WEBGL) {          // (not the canvas renderer)
        if (Settings.glow && !X.bloom) { if (!rn.pipelines.getPostPipeline('LCBloom')) rn.pipelines.addPostPipeline('LCBloom', fxBloomClass()); cam.setPostPipeline('LCBloom'); X.bloom = true; }
        else if (!Settings.glow && X.bloom) { cam.removePostPipeline('LCBloom'); X.bloom = null; }
      }
    } catch (e) { X.bloom = null; }
    X.vig.setVisible(Settings.lights);
  },

  fxDraw() {
    const X = this.fx; if (!X) return;
    const z = this.zoom, P = this.pl;
    X.vig.setDisplaySize(this.scale.width, this.scale.height);
    // ---- SHADOWS on the ground
    let ns = 0;
    const shadow = (theta, h, floor, wWorld, onLedge) => {
      const dh = Math.max(0, h - floor), k = 1 / (1 + dh / 150);
      if (dh > 520 || wWorld < 6) return;
      let s = X.shadows[ns]; if (!s) s = X.shadows[ns] = this.add.image(0, 0, 'gshadow').setTint(0x000000);
      ns++;
      s.bsx = wWorld * (0.55 + 0.45 * k) / 40; s.bsy = Math.max(0.8, s.bsx * 1.4); s.sqx = s.sqy = 1; s.hsq = 0;
      this.place(s, theta, floor - 2);
      s.setAlpha(0.62 * k).setDepth(onLedge ? 3.3 : 2.3);
    };
    if (this.state !== 'intro' && P && P.spr && P.spr.visible !== false && !P.pitFall && !this.cave) {
      const fl = Math.max(0, P.floor || 0);
      if (!(P.goop && fl === 0)) shadow(P.theta, P.h, fl, 46, fl > 0);
    }
    for (const e of this.enemies) {
      if (!e.spr || !e.spr.visible || e.hp <= 0 || e.noShadow || e.h < -6) continue;
      shadow(e.theta, e.h - (e.type === 'boss' ? e.r * 0.8 : 0), 0, Math.min(170, e.spr.width * (e.spr.bsx || 1) * 0.8), false);
    }
    for (let i = ns; i < X.shadows.length; i++) X.shadows[i].setVisible(false);
    // ---- RIM LIGHT: light-coloured copies tucked behind, nudged towards the light
    let nr = 0;
    if (Settings.lights) {
      const copy = (o, depth, alpha) => {
        if (!o.texture || !o.frame || o.__glowBase || o.texture.key === '__DEFAULT' || o.texture.key === '__MISSING') return;
        let r = X.rims[nr]; if (!r) r = X.rims[nr] = this.add.image(0, 0, o.texture.key);
        nr++;
        if (r.texture !== o.texture || r.frame !== o.frame) r.setTexture(o.texture.key, o.frame.name);
        const d = o.getWorldTransformMatrix(X.tmp).decomposeMatrix();
        r.setDisplayOrigin(o.displayOriginX, o.displayOriginY);
        // nudged by exactly ONE of the sprite's own pixels along its own pixel grid (whichever of its axes face the
        // light), so the lit edge is a clean one-pixel line however the sprite is turned - never a ragged sliver
        const c = Math.cos(d.rotation), sn = Math.sin(d.rotation), ax = (X.lx * c + X.ly * sn) * Math.sign(d.scaleX || 1), ay = (-X.lx * sn + X.ly * c) * Math.sign(d.scaleY || 1);
        const tx = Math.abs(ax) > 0.38 ? Math.sign(ax) * Math.abs(d.scaleX) : 0, ty = Math.abs(ay) > 0.38 ? Math.sign(ay) * Math.abs(d.scaleY) : 0;
        r.setPosition(d.translateX + c * tx * Math.sign(d.scaleX || 1) - sn * ty * Math.sign(d.scaleY || 1), d.translateY + sn * tx * Math.sign(d.scaleX || 1) + c * ty * Math.sign(d.scaleY || 1))
          .setRotation(d.rotation).setScale(d.scaleX, d.scaleY).setFlip(o.flipX, o.flipY);
        r.setTintFill(X.rim).setAlpha(alpha).setDepth(depth).setVisible(true);
      };
      for (const e of this.enemies) {
        const s = e.spr; if (!s || !s.visible || e.hp <= 0 || e.noRim) continue;
        // (no rim-light copy any more: at game size it read as a highlighted outline round every enemy)
        // ...and the far side falls off into the level's shadow colour (unless something else is tinting it)
        if (s.tintFill || (s.isTinted && !(s.__fxT && s.tintTopLeft === s.__fxT[0] && s.tintTopRight === s.__fxT[1] && s.tintBottomLeft === s.__fxT[2] && s.tintBottomRight === s.__fxT[3]))) continue;
        const c = Math.cos(s.rotation), sn = Math.sin(s.rotation), fx = s.flipX ? -1 : 1, T = [];
        for (const [ux, uy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {            // each corner: how much does it face the light?
          const wx = ux * fx * c - uy * sn, wy = ux * fx * sn + uy * c, f = Math.max(0, Math.min(0.6, 0.3 - (wx * X.lx + wy * X.ly) * 0.34));
          T.push(Phaser.Display.Color.GetColor(Math.round(255 + (X.shade[0] - 255) * f), Math.round(255 + (X.shade[1] - 255) * f), Math.round(255 + (X.shade[2] - 255) * f)));
        }
        s.setTint(T[0], T[1], T[2], T[3]);
        s.__fxT = [s.tintTopLeft, s.tintTopRight, s.tintBottomLeft, s.tintBottomRight];
      }
    }
    for (let i = nr; i < X.rims.length; i++) X.rims[i].setVisible(false);
  }
};
