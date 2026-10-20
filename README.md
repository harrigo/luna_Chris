# Luna_chris

Mobile-first Phaser 3 game. No build step: every push to `main` deploys to GitHub Pages.

## Deploy
1. Repo Settings > Pages > Source: **GitHub Actions** (one-time). Alternatively, add a `PAGES_TOKEN` Actions secret containing a token with `repo` scope or Pages write permission to let the workflow enable Pages automatically.
2. Push to `main`. The workflow in `.github/workflows/deploy.yml` publishes the site.
3. Open `https://harrigo.github.io/Luna_chris/` on your phone, and use Share > Add to Home Screen for fullscreen.

The version number in the top-right corner of the game (`BUILD` in `src/main.js`) tells you whether the phone has the latest deploy.

## Run locally
```
python3 -m http.server 8000
```

## Alternative host
Cloudflare Pages, Netlify or Vercel also work with no config: framework preset "None", build command empty, output directory `/`. These give a preview URL per branch.

See `GAME_DESIGN.md` for design notes and AI working rules.
