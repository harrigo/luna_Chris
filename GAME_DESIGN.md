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
- Hold **FIRE** (left of JUMP) to shoot; shots fly straight the way Chris faces (aim by jumping / jetpacking to the enemy's height). `CFG.aimAssist` = homing, `CFG.autoFire` = hands-free.
- Enemies: space-mice, **jetpack mice** (hover at height, drop cheese bombs), Gouda-Golems, boss.
- **Jetpack**: tap JUMP to hop (hold for a full jump), let go in the air, then HOLD JUMP again to thrust.
  Burns fuel (JET gauge, top-left, about 2s of thrust). Fuel refills while standing on the ground.
  Tuning is in `CFG` (`jet*` values).
Keyboard for desktop testing: A/D or arrows, Space/W/Up = jump + jet, Z/X = manual fire.

## Intro cutscene (`src/intro.js`)
Tap to start (this first tap also goes fullscreen + landscape) -> logo + title fanfare (~3s) -> ~20s comic-style cutscene -> Level 1. Tap any time to skip.
Beats: retired hero flipping flapjacks with Bessie -> the Roquefort Rodents' junk UFO crashes through the barn roof and
tractor-beams Bessie -> Chris sighs, stretches an arm to twist the pepper grinder -> wall flips to reveal the armoury
(Mac-Laster, Swiss-Shot, Fondue Flamethrower, Gouda Grenade). Art is placeholder, drawn with code in `makeIntroTextures()`.
Add `?skipintro` to the URL to go straight to Level 1 while testing.

## Bessie in every level
Each level opens with a rat-ship tractor-beaming Bessie and scuttling off (with the `stinger` tune, `startNap`), and ends with her
narrow escape from the boss's wreck (`startRescue`, state `rescue`) before the CLEAR screen. Reuse for Level 2 onwards.

## Levels
1. **The Gruyere Globe** (built): cheesy cratered moon. Waves of space-mice and Gouda-Golems, then boss
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
- `index.html` loads `src/boot.js` with a cache-buster, and `boot.js` loads the other scripts in order. **Add new script files to the list in `boot.js`**, not index.html (Pages can serve a cached index.html for 10 minutes).
- `src/textures.js`: all placeholder art, drawn with code. Replace by loading images under the same texture keys.
- Tuning numbers are in `CFG` at the top of `main.js`; waves are in `WAVES`.
- Planet radius `R` = 420 units. Per-level gravity can be changed via `CFG.gravity` (use for Gorgonzola Gulch).

## Sound (`src/audio.js`)
Global `Sound`: all audio is synthesised with Web Audio (pulse/triangle/noise), no files. Starts on the first tap.
`Sound.sfx(name)`, `Sound.music(name|null)` (tracks: ranch, tense, sneak, level1, boss; jingles: win, lose), `Sound.jet(bool)`.
Tracks are tracker-style strings in `TRACKS` ("A4:2" = note, length in 16ths). Mute button (top right) saves to localStorage.

## Rules for AI changes
- Plain JS + Phaser 3 (CDN). No build step, so a push deploys as-is.
- Touch controls first. Test at ~844x390 landscape (phone).
- Placeholder art until gameplay is fun.
- Bump `BUILD` in `src/main.js` on every change so the version on screen confirms the new deploy.
- Keep the on-screen FPS counter and the error overlay in `index.html`.

## Backlog
- [ ] Commission/draw real art in the Earthworm Jim style (see art notes below) and swap in under the same texture keys
- [ ] Playtest balance on a real phone (player speed, golem fire rate, boss HP 150)
- [ ] Weapon unlock + switch button (Swiss-Shot first)
- [ ] Level 2: Gorgonzola Gulch
- [x] Sound effects and music (v0.5, synthesised chiptune in `src/audio.js`)
- [ ] Tune/compose better tracks, add Level 2 music
- [ ] Real art for Chris, Bessie and the cheese beasts

## Art direction
Target: Earthworm Jim-style hand-drawn cartoon: bold dark outlines, saturated colours, exaggerated squash-and-stretch
(the stretchy arm gag in the intro), big expressive faces. Keep the silhouettes readable at phone size.
Priority order for real art: Chris (idle/run/jump/shoot/jetpack), Bessie, Gouda-Golem, space-mouse, Croque Monsieur ship,
planet surface tiles/props, then cutscene backgrounds.
