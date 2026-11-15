// (v2.99) SPRITES VANISHING AFTER SWITCHING APPS. All the art is drawn in code onto canvases (and packed onto 2048px
// atlas pages, atlas.js). Phaser makes those canvases in pixel-art mode with willReadFrequently: false, which lets the
// browser put them on the GPU - and a GPU-backed 2D canvas is thrown away when the app goes to the background on a phone.
// When the game comes back, Phaser re-uploads the (now blank) canvases and the sprites are gone.
// Fix: every canvas texture gets its own canvas with willReadFrequently: true, which keeps it in ordinary memory where
// it survives being backgrounded. As a safety net, if the WebGL context itself is lost and restored, every canvas
// texture is re-uploaded from its canvas.
(function () {
  if (typeof Phaser === 'undefined') return;
  const TM = Phaser.Textures.TextureManager.prototype;
  TM.createCanvas = function (key, width, height) {
    if (width === undefined) width = 256; if (height === undefined) height = 256;
    if (!this.checkKey(key)) return null;
    const cv = document.createElement('canvas'); cv.width = width; cv.height = height;
    const ctx = cv.getContext('2d', { willReadFrequently: true }); ctx.imageSmoothingEnabled = false;
    return this.addCanvas(key, cv);
  };
  window.LCCanvasFix = {
    hook(game) {
      const r = game.renderer; if (!r || !r.on || r.__lcFix) return; r.__lcFix = true;
      r.on(Phaser.Renderer.Events.RESTORE_WEBGL, () => {
        for (const k in game.textures.list) { const t = game.textures.list[k]; if (t && t.refresh && t.canvas) { try { t.refresh(); } catch (e) { /* ignore */ } } }
      });
    },
  };
  const iv = setInterval(() => { const g = window.game; if (g && g.renderer && g.renderer.on) { LCCanvasFix.hook(g); clearInterval(iv); } }, 500);
})();
