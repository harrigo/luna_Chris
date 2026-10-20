# Luna Chris - Game Design

> Context file for AI sessions. Keep this up to date so every session knows what the game is.

## Story
Luna Chris was the galaxy's most decorated astronaut until the space race burned him out. Now he flips
intergalactic flapjacks on a dusty space-ranch in a "Kiss the Cook" apron slapped over his NASA suit, with his
best friend Bessie, a zero-gravity cow whose udders produce "Mad Cheese". The Roquefort Rodents (alien rats in
junk armour) crash through the barn roof and tractor-beam Bessie away, because she is the only cow who can
re-cheese their dying home world. Chris twists the pepper grinder on the mantle, the wall flips round, and he
grabs the Mac-Laster 3000.

## Weapons
- **Mac-Laster 3000** (built): drill + pasta extruder, fires a fast spiral stream of macaroni shells. Auto-aims.
- Swiss-Shot: aerated wide-spread cheese gun (planned)
- Fondue Flamethrower (planned)
- Gouda Grenade launcher: heavy hitter (planned)

## Gameplay
Run, jump and blast around small 360-degree spherical planets. Gravity always pulls toward the planet centre.
Dodge screen-filling waves of cheese-beast projectiles in a high-speed space chase.

**Landscape only** (installed PWA is locked to landscape; in a browser a "rotate your phone" prompt shows in portrait).
Touch controls: left thumb = run left / right, right thumb = JUMP.
- Guns **auto-fire** at the nearest on-screen enemy, auto-aimed with target leading.
- **Jetpack**: tap JUMP to hop (hold for a full jump), let go in the air, then HOLD JUMP again to thrust.
  Burns fuel (JET gauge, top-left, about 2s of thrust). Fuel refills while standing on the ground.
  Tuning is in `CFG` (`jet*` values).
Keyboard for desktop testing: A/D or arrows, Space/W/Up = jump + jet, Z/X = manual fire.

## Levels
1. **The Gruyere Globe** (built, v0.2): cheesy cratered moon. Waves of space-mice and Gouda-Golems, then boss
   **Crusty Croque Monsieur** (toasted-sandwich drop-ship raining hot ham; fans of toast crumbs in phase 2).
2. **Gorgonzola Gulch** (planned): toxic blue-cheese swamp. Mould spores change gravity (floaty jumps).
   Enemies: mutated fuzzy bacteria blobs.

## How the code works
- `src/main.js`: the whole level. Everything is in **polar coordinates** (`theta` = angle around planet,
  `h` = height above surface). The "camera" rotates so the player is always at the top of the screen.
  `place()` converts polar to screen. No Phaser Arcade physics.
- World scale: `zoom = min(1, H/470)` shrinks the world on short (landscape) screens; `place()` applies it.
- PWA: `manifest.webmanifest` (fullscreen, landscape), `sw.js` (no caching on purpose), `icons/`. Fullscreen + orientation lock
  are requested on the first tap (Android Chrome). iPhone Safari cannot do either, so use Add to Home Screen there.
- `src/textures.js`: all placeholder art, drawn with code. Replace by loading images under the same texture keys.
- Tuning numbers are in `CFG` at the top of `main.js`; waves are in `WAVES`.
- Planet radius `R` = 420 units. Per-level gravity can be changed via `CFG.gravity` (use for Gorgonzola Gulch).

## Rules for AI changes
- Plain JS + Phaser 3 (CDN). No build step, so a push deploys as-is.
- Touch controls first. Test at ~390x844 portrait.
- Placeholder art until gameplay is fun.
- Bump `BUILD` in `src/main.js` on every change so the version on screen confirms the new deploy.
- Keep the on-screen FPS counter and the error overlay in `index.html`.

## Backlog
- [ ] Playtest balance on a real phone (player speed, golem fire rate, boss HP 150)
- [ ] Weapon unlock + switch button (Swiss-Shot first)
- [ ] Level 2: Gorgonzola Gulch
- [ ] Sound effects and music
- [ ] Real art for Chris, Bessie and the cheese beasts
