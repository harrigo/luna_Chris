// Loads the game scripts in order. The list lives here, not in index.html, because GitHub Pages lets
// browsers cache index.html for up to 10 minutes: a stale copy would load the new scripts but miss a
// newly added file (that's how "Sound is not defined" happened in v0.5). index.html always fetches this
// file fresh, so add new scripts here.
(function () {
  var files = ['src/pad.js', 'src/cheat.js', 'src/board.js', 'src/audio.js', 'src/textures.js', 'src/intro.js', 'src/ending.js', 'src/chris.js', 'src/levels.js', 'src/menu.js', 'src/atlas.js', 'src/zerog.js', 'src/main.js'], q = '?t=' + Date.now();
  (function next(i) {
    if (i >= files.length) return;
    var s = document.createElement('script');
    s.src = files[i] + q;
    s.onload = function () { next(i + 1); };
    s.onerror = function () { var b = document.getElementById('err'); b.style.display = 'block'; b.textContent += 'Failed to load ' + files[i] + '\n'; };
    document.body.appendChild(s);
  })(0);
})();
