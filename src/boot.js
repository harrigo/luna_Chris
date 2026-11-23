// Loads the game scripts in order. The list lives here, not in index.html, because GitHub Pages lets
// browsers cache index.html for up to 10 minutes: a stale copy would load the new scripts but miss a
// newly added file (that's how "Sound is not defined" happened in v0.5). index.html always fetches this
// file fresh, so add new scripts here.
(function () {
  var files = ['src/canvasfix.js', 'src/pad.js', 'src/cheat.js', 'src/board.js', 'src/audio.js', 'src/palette.js', 'src/textures.js', 'src/intro.js', 'src/ending.js', 'src/chris.js', 'src/levels.js', 'src/menu.js', 'src/atlas.js', 'src/zerog.js', 'src/freefall.js', 'src/centrifuge.js', 'src/core.js', 'src/mandoline.js', 'src/milkmaid.js', 'src/mozz.js', 'src/magmagolem.js', 'src/gorge.js', 'src/saucer.js', 'src/armada.js', 'src/labyrinth.js', 'src/labrooms.js', 'src/parmart.js', 'src/seaart.js', 'src/parmesan.js', 'src/parmfolk.js', 'src/parmboss.js', 'src/parmcity.js', 'src/fondue.js', 'src/depth.js', 'src/fx.js', 'src/pixellook.js', 'src/toons.js', 'src/shop.js', 'src/telemetry.js', 'src/net.js', 'src/smash.js', 'src/style.js', 'src/skillfoes.js', 'src/cheesetime.js', 'src/training.js', 'src/run.js', 'src/runmap.js', 'src/cavern.js', 'src/camptoys.js', 'src/runhub.js', 'src/campfolk.js', 'src/beachball.js', 'src/campgrow.js', 'src/bossrush.js', 'src/capeintro.js', 'src/main.js'], q = '?t=' + Date.now();
  (function next(i) {
    if (window.LCBoot) LCBoot.set(0.2 + 0.4 * i / files.length, i < files.length / 2 ? 'UNPACKING THE SHOPPING' : 'SHARPENING THE MAC-GRINDER');
    if (i >= files.length) return;
    var s = document.createElement('script');
    s.src = files[i] + q;
    s.onload = function () { next(i + 1); };
    s.onerror = function () { var b = document.getElementById('err'); b.style.display = 'block'; b.textContent += 'Failed to load ' + files[i] + '\n'; };
    document.body.appendChild(s);
  })(0);
})();
