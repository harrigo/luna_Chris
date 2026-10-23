// Online high scores, kept by onlimey.com (server/scores.mjs in that repo). Each level has its own top 10
// ("luna-chris-1", "luna-chris-2", ...) because the score starts from zero on every level.
//
//   GET  /api/scores?game=luna-chris-1      the top 10
//   POST /api/scores/start {game}           a one-use run token, asked for as a level starts
//   POST /api/scores {game, token, name, score}
//
// The server only takes a score that was reachable in the time since its token was issued, so the token is
// fetched when a level starts from scratch and kept through checkpoint retries. If the server can't be
// reached nothing shows and the game carries on as before. Scores made in cheat mode are never sent.
const Board = (() => {
  const API = window.LC_SCORES_API || 'https://www.onlimey.com/api/scores';   // LC_SCORES_API: point a test page at a local server
  const NAME_KEY = 'lc_player_name';
  const SHOW = 10;
  const gameId = lvl => 'luna-chris-' + String(lvl).replace('.', '-');
  const boards = {};                       // game id -> top 10, once fetched
  const runs = {};                         // game id -> run token for the attempt in progress
  let panel = null, padOff = null;

  function api(path, body) {
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctl && setTimeout(() => ctl.abort(), 8000);
    const opts = body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : { cache: 'no-store' };
    if (ctl) opts.signal = ctl.signal;
    return fetch(API + path, opts).then(res => res.json().catch(() => ({})).then(d => {
      if (!res.ok) throw new Error(d.error || 'The leaderboard is having a moment');
      return d;
    })).finally(() => clearTimeout(timer));
  }
  const loadName = () => { try { return localStorage.getItem(NAME_KEY) || ''; } catch (e) { return ''; } };
  const saveName = n => { try { localStorage.setItem(NAME_KEY, n); } catch (e) { /* storage blocked */ } };
  const cheating = () => typeof Cheat !== 'undefined' && Cheat.on;

  function fetchBoard(lvl) {
    const g = gameId(lvl);
    return api('?game=' + encodeURIComponent(g)).then(d => (boards[g] = d.scores || [])).catch(() => null);
  }

  // A level begins. `fresh` is false when retrying from a checkpoint: that run keeps its token (and its score).
  function startRun(lvl, fresh) {
    const g = gameId(lvl);
    fetchBoard(lvl);
    if (!fresh && runs[g]) return;
    const run = runs[g] = { token: null };
    api('/start', { game: g }).then(d => { run.token = d.token; }).catch(() => {});
  }

  function qualifies(lvl, score) {
    const g = gameId(lvl), b = boards[g], run = runs[g];
    if (!b || !run || !run.token || !(score > 0) || cheating()) return false;
    return b.length < SHOW || score > b[b.length - 1].score;
  }

  // ---- the panel: an HTML box over the game, so phones get their own keyboard for the name

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad7 = n => String(n).padStart(7, '0');

  function css() {
    if (document.getElementById('lbStyle')) return;
    const st = document.createElement('style'); st.id = 'lbStyle';
    st.textContent = `
#lb { position: fixed; inset: 0; z-index: 45; display: flex; align-items: center; justify-content: center; background: rgba(8,6,20,.62); font-family: 'Press Start 2P', monospace; }
#lb .box { width: min(420px, calc(100vw - 32px)); max-height: calc(100vh - 24px); overflow: auto; box-sizing: border-box; padding: 14px 16px 16px;
  background: #1a1030; border: 4px solid #ffd23f; box-shadow: 0 0 0 4px #1a1020, 8px 8px 0 4px rgba(0,0,0,.5); color: #fff; text-align: center; image-rendering: pixelated; }
#lb h2 { margin: 0 0 6px; font-size: 14px; color: #ffd23f; text-shadow: 3px 3px 0 #5a0a0a; animation: lbBlink .6s steps(2) infinite; }
#lb .done h2 { animation: none; }
#lb .sub { font-size: 8px; color: #b9a8ff; margin: 0 0 10px; line-height: 1.6; }
#lb ol { list-style: none; margin: 0 0 12px; padding: 6px 8px; background: #0f0820; font-size: 8px; line-height: 1; text-align: left; }
#lb li { display: flex; gap: 8px; padding: 4px 2px; }
#lb li .r { width: 3ch; color: #8a7fb0; text-align: right; }
#lb li .n { flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
#lb li .s { color: #ffd23f; }
#lb li.me { background: #3a2470; color: #7dff8a; }
#lb li.me .r, #lb li.me .s { color: #7dff8a; }
#lb li.new .n { color: #7dff8a; animation: lbBlink .5s steps(2) infinite; }
#lb label { display: block; font-size: 8px; color: #fff; margin: 0 0 8px; }
#lb .row { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
#lb input { font: inherit; font-size: 12px; width: 13ch; padding: 8px; background: #0f0820; color: #7dff8a; border: 3px solid #b9a8ff; outline: none; text-transform: uppercase; text-align: center; }
#lb input:focus { border-color: #7dff8a; }
#lb button { font: inherit; font-size: 10px; padding: 9px 12px; cursor: pointer; border: 3px solid #1a1020; background: #ffd23f; color: #1a1020; box-shadow: 3px 3px 0 #1a1020; }
#lb button.alt { background: #4a3a78; color: #fff; }
#lb button:disabled { opacity: .5; cursor: default; }
#lb button:focus-visible { outline: 3px solid #7dff8a; outline-offset: 2px; }
#lb .msg { font-size: 8px; color: #ff9db8; min-height: 8px; margin: 10px 0 0; line-height: 1.6; }
#lb .hint { font-size: 7px; color: #8a7fb0; margin: 10px 0 0; }
@keyframes lbBlink { 50% { opacity: .35; } }`;
    document.head.appendChild(st);
  }

  function rows(list, mark) {
    if (!list.length) return '<li><span class="n">No scores yet. Be the first!</span></li>';
    return list.slice(0, SHOW).map((e, i) => '<li class="' + (e.cls || (mark && e.name.toLowerCase() === mark.toLowerCase() ? 'me' : '')) + '"><span class="r">' + (i + 1) + '</span><span class="n">' +
      esc(e.name) + '</span><span class="s">' + pad7(e.score) + '</span></li>').join('');
  }

  function close(silent) {
    if (!panel) return;
    const done = silent === true ? null : panel.onClose;
    panel.el.remove(); panel = null;
    if (padOff) { padOff(); padOff = null; }
    if (done) done();
  }

  // Offers the name box if `score` makes the level's top 10, then shows the new board. `onClose` runs when
  // the player is done with it (straight away if the score doesn't make it).
  function offer(lvl, score, title, onClose) {
    if (panel || !qualifies(lvl, score)) { if (onClose) onClose(); return false; }
    css();
    const g = gameId(lvl), run = runs[g], board = boards[g];
    const preview = board.filter(e => !(e.name.toLowerCase() === loadName().toLowerCase() && e.score >= score)).slice();
    let at = preview.findIndex(e => score > e.score); if (at < 0) at = preview.length;
    preview.splice(at, 0, { name: 'YOU?', score, cls: 'new' });

    const el = document.createElement('div'); el.id = 'lb';
    el.innerHTML = '<div class="box"><h2>NEW HIGH SCORE!</h2><p class="sub">' + esc(title) + '<br>' + pad7(score) + ' &middot; #' + (at + 1) + ' ON THE BOARD</p>' +
      '<ol>' + rows(preview) + '</ol>' +
      '<form><label for="lbName">ENTER YOUR NAME</label><div class="row"><input id="lbName" maxlength="16" autocomplete="nickname" enterkeyhint="done" spellcheck="false" placeholder="NAME" required>' +
      '<button type="submit">SAVE</button><button type="button" class="alt" data-skip>SKIP</button></div></form>' +
      '<p class="msg" aria-live="polite"></p><p class="hint">' + (typeof inputDevice === 'function' && inputDevice() === 'pad' ? 'A: SAVE &nbsp; B: SKIP' : 'onlimey.com leaderboard') + '</p></div>';
    (document.fullscreenElement || document.webkitFullscreenElement || document.body).appendChild(el);
    panel = { el, onClose };

    const form = el.querySelector('form'), input = el.querySelector('input'), msg = el.querySelector('.msg'), list = el.querySelector('ol');
    const saveBtn = el.querySelector('button[type=submit]'), skipBtn = el.querySelector('[data-skip]');
    input.value = loadName() || '';
    // keys typed into the box stay in the box: not Chris's controls, not the cheat code
    for (const t of ['keydown', 'keyup', 'keypress']) input.addEventListener(t, e => { e.stopPropagation(); if (t === 'keydown' && e.key === 'Escape') close(); });
    el.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') close(); });
    el.addEventListener('pointerdown', e => e.stopPropagation());
    skipBtn.addEventListener('click', () => close());
    let busy = false, finished = false;
    const finish = () => {
      finished = true;
      el.querySelector('.box').classList.add('done');
      form.remove();
      const ok = document.createElement('button'); ok.type = 'button'; ok.textContent = 'OK'; ok.style.marginTop = '12px';
      ok.addEventListener('click', () => close()); el.querySelector('.box').insertBefore(ok, el.querySelector('.hint'));
      el.querySelector('.hint').innerHTML = typeof inputDevice === 'function' && inputDevice() === 'pad' ? 'A: OK' : 'onlimey.com leaderboard';
      ok.focus();
    };
    const submit = () => {
      const name = input.value.trim().toUpperCase();
      if (busy || finished) return;
      if (!name) { msg.textContent = 'TYPE A NAME FIRST'; input.focus(); return; }
      busy = true; input.disabled = saveBtn.disabled = skipBtn.disabled = true; msg.style.color = '#b9a8ff'; msg.textContent = 'SAVING...';
      api('', { game: g, token: run.token, name, score }).then(d => {
        run.token = null; saveName(name); boards[g] = d.scores || boards[g];
        list.innerHTML = rows(boards[g], name);
        el.querySelector('h2').textContent = d.best > score ? 'NICE TRY!' : d.rank ? "YOU'RE #" + d.rank + '!' : 'SAVED!';
        msg.style.color = '#7dff8a';
        msg.textContent = d.best > score ? 'YOUR BEST IS STILL ' + d.best + ', AT #' + d.rank : 'SAVED TO THE LEADERBOARD';
        if (typeof Sound !== 'undefined') Sound.sfx('power');
        finish();
      }).catch(err => {
        busy = false; msg.style.color = '#ff9db8'; msg.textContent = String(err.message || err).toUpperCase();
        input.disabled = saveBtn.disabled = skipBtn.disabled = false;
        if (/saved|run/i.test(err.message || '')) { run.token = null; saveBtn.disabled = true; }   // the token's spent: no point trying again
      });
    };
    form.addEventListener('submit', e => { e.preventDefault(); submit(); });
    // a controller can't type, so A saves the remembered name (or CHRIS), B skips
    if (typeof Pad !== 'undefined') padOff = Pad.on(b => {
      if (!panel) return;
      if (finished) { if (b === 'a' || b === 'b' || b === 'start') close(); return; }
      if (b === 'b' || b === 'back') close();
      else if (b === 'a' || b === 'start') { if (!input.value.trim()) input.value = 'CHRIS'; submit(); }
    });
    // only grab focus with a keyboard; on a phone that would throw the keyboard over the game uninvited
    if (typeof inputDevice !== 'function' || inputDevice() === 'kb') setTimeout(() => { if (panel && panel.el === el) { input.focus(); input.select(); } }, 50);
    return true;
  }

  return { gameId, startRun, fetchBoard, qualifies, offer, close, get open() { return !!panel; } };
})();
