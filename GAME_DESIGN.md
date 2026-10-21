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

## Mac-Laster gauge and Power-Ups
MAC gauge (under JET): each shot costs pasta, it refills ~0.35s after you let off FIRE. Run dry and the gun jams (red) until it recovers to 30%.
**Parmesan Power-Up** (`power` pickup): dropped by the first Gouda-Golem you kill and ~30% of later ones. triple-spread shot and unlimited pasta that lasts
until Chris is hit (it absorbs that hit instead of a heart; gauge shows gold). Tuning in `CFG` (`ammo*`). More power-ups (Swiss-Shot, etc.) can reuse the pickup `kind` field.

## Bessie in every level
Each level opens with a rat-ship tractor-beaming Bessie and scuttling off (with the `stinger` tune, `startNap`), and ends with her
narrow escape from the boss's wreck (`startRescue`, state `rescue`) before the CLEAR screen. Reuse for Level 2 onwards.

## End-of-level bonus
After the boss and Bessie's escape, a cheeseburger drops and floats to Chris: bonus heart (burger icon next to the hearts, `registry 'bonusHeart'`
saved for Level 2 to read).

## Levels (all open from the level-select screen; data lives in `src/levels.js`)
1. **The Gruyere Globe**: cheesy cratered moon. Space-mice, jetpack mice, Gouda-Golems; boss **Crusty Croque Monsieur** (ham rain, toast fans).
2. **Gorgonzola Gulch**: blue-cheese swamp. Green spore clouds = low gravity, purple = heavy (`zones`, `gAt()`). Fuzzy germs (split in two when
   shot), leaping rat-frogs; boss **Baron von Blue** (spore rain, spore rings, calls in germs in phase 2).
3. **The Great Grater**: the floor is a scrolling grater (`conveyor`): bare blades hurt, safe platforms ride along; the treadmill carries Chris
   backwards. Slicer bots (throw floor discs) and diving cheese-slicing drones; boss **The Mega-Mandoline** (floor discs at several heights, drones).
Each level: Bessie snatched at the start (stinger), narrow escape + cheeseburger after the boss. Add a level by adding an entry to `LEVELS`
(waves, palette, music, boss, optional `zones` / `conveyor` + `platforms`) and, if needed, new enemies in `ENEMY` + `makeEnemy`/`updateEnemies`.

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

## Luna Chris the character (`src/chris.js`)
Chubby chef-astronaut rig built from parts (toque-on-a-helmet, mustache, belly out of a too-small suit, "Kiss the Cook" apron). Animated in code:
waddle run (legs alternate, body rolls), idle breathing/belly jiggle, apron spins edge-on into a cape when airborne and back on landing,
hat lags/bounces, squash and stretch, gun recoil, spinning drill-bit. Swap any `c_*` texture for real art under the same key.

## Look and feel
- Pixel font: `PIXEL` ("Press Start 2P" from Google Fonts, loaded in index.html; falls back to monospace offline). The game waits up to 2.5s for it before starting.
- Particles (Phaser emitters in `Level1.create`): `fxJet` (jetpack flames), `fxBang` (explosions, muzzle flash), `fxGlint` (power-up / Bessie sparkles). Use `this.bang(theta, h, n)`.
- Phone vibration via `buzz()` (Android): hits, power-up, kills, boss, burger.
- Sky: parallax layers (milky-way dust, far/mid/near stars, shooting stars) using an unwrapped angle so it never jumps.

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
- [x] Level 2 and 3 (first pass, needs playtesting and balance)
- [ ] Level 4+, per-level boss music, level unlocks / stars
- [x] Sound effects and music (v0.5, synthesised chiptune in `src/audio.js`)
- [ ] Tune/compose better tracks, add Level 2 music
- [ ] Real art for Chris, Bessie and the cheese beasts

## Art direction
Target: Earthworm Jim-style hand-drawn cartoon: bold dark outlines, saturated colours, exaggerated squash-and-stretch
(the stretchy arm gag in the intro), big expressive faces. Keep the silhouettes readable at phone size.
Priority order for real art: Chris (idle/run/jump/shoot/jetpack), Bessie, Gouda-Golem, space-mouse, Croque Monsieur ship,
planet surface tiles/props, then cutscene backgrounds.

## v0.19 changes
- Level select fixed (scene state reset on each visit; start uses a timer).
- Slicers roll like wheels with an occasional coin-flip spin; enemies keep facing near Chris (no flip flicker); hit flash is rate-limited.
- Each level has its own planet radius (L1 420, L2 580, L3 300), sky gradient, star tint, and background decor (spore motes on L2, slow gears on L3).

## v0.20 changes
- One-way floating ledges per level (`def.ledges`: theta, half-width, height): jump up through them, land on top. Low ones (~85-95) are a normal jump; high ones (~165-175) need the jetpack. On level 3 they are also safe from the grater blades.
- Scenery props per level (`def.props`): rocks/cheese wedges/flag (L1), blue-cheese mushrooms/reeds/stalagmites (L2), pipes/whisks/crates (L3), plus small foreground tufts/cones drawn in front of Chris.

## v0.21 changes (Earthworm Jim-style junk heaps)
- Big dark piles of junk standing on each planet, in two layers: a huge faded/tinted far layer (depth 1.6) and a nearer layer. Props now accept `depth`, `tint`, `alpha`, `h`.
- Gets nastier per level: L1 cheese-rind heaps + a few skulls, L2 tyre heaps + bone piles, L3 scrap metal + bone piles + tyres + skulls with glowing red eyes.
- Ledges restyled as chunky slabs with a ragged rocky underside, one texture per level (`def.ledgeTex`).

## v0.22 controller support
- Xbox / standard gamepads via the browser Gamepad API (`src/pad.js`, loaded first). Left stick or D-pad = move, A (or LB) = jump / hold for jetpack, X / B / RT / RB = fire, Start or A = start / retry / continue, View = level menu.
- Level select: left/right highlights a card, A or Start plays it. Intro: any face button or Start skips.
- Browsers only expose a controller after one of its buttons is pressed while the page has focus.

## v0.23 screen scaling
- The game is laid out at ~430px logical height on every screen (`DESIGN_H` in main.js) and scaled up with `scale.setZoom`, so a big PC monitor shows the same framing as a phone instead of a tiny planet. Canvas upscaling is smooth (`image-rendering: auto`).
- On-screen touch buttons are hidden on devices without a touchscreen; they appear if a touch ever happens.

## v0.24 pause, duck, wider view
- Pause: Start (controller), P or Esc (keyboard), or the PAUSE label under MENU (touch). Freezes the game, timers and tweens and turns the music down; Start / P / A / tap resumes.
- Duck: Down on stick/D-pad, Down arrow or S. Only on the ground; Chris squashes down, stops walking (left/right just turns), fires from 22 instead of 40 height and has a smaller, lower hitbox, so chest-high shots fly over. No touch control for it yet.
- Big screens show ~20% more of the world (`DESIGN_H` 430 → 516). Phones are unchanged.
- v0.26: Duck in mid-air = tuck and drop: cuts the jetpack, triple gravity (capped at 900/s), you can still steer left/right, shoots low, and a hard landing does a little ground-pound shake.

## v0.27 animated title art
- Title / "tap to start" screen uses painted key art (`assets/title.jpg`, 1024x572) with code effects layered on top in `IntroScene.buildTitleArt()`: slow drift + zoom, flickering muzzle glow and sparks at the drill, macaroni spraying out, steam from the hopper, jet-boot flames, pulsing UFO beam, twinkling stars, bottom shade for the logo. The logo slams in and wobbles. The art fades out when the story starts.
- Effect positions are in the art's own pixels, so swapping in a new picture means updating those coordinates.
- To make Chris himself move (arm recoil, breathing), the art would need to be split into layers (background / Chris / gun / UFO).

## v0.28 Level 1 cosmic sky
- Bright blue-violet sky gradient. Deep-space layer (`bgDecor: 'cosmic'`): spiral galaxies, two black holes (spinning accretion swirl + pulsing core), ringed planets, then chunky outlined 5-point stars in six colours, spinning and twinkling. Each layer has its own parallax speed and the whole sky drifts slowly even when standing still.
- Bubbling cheese-lava craters on the surface (`lava: 9`): glowing pools that spit droplets when near the player.
- v0.30: Level 1 decluttered (rind heaps, rocks, cheese wedges and flags removed; a few skulls and grass tufts kept). Lava craters now sit inside the planet at random depths with a swelling/popping bubble instead of spitting droplets.

## v0.31 Gruyère Globe surface + fondue geysers
- `def.surface`: the planet is a generated pixel-art texture (`makePlanetTexture` in levels.js): value-noise cheese tones dithered with a 4x4 Bayer matrix, crusty rind at the edge, 70 shaded craters (dark bowl, lit lower lip), 45 Gruyère holes, and thousands of crumbs, grit specks and little rock chunks. Built at half resolution and drawn at 2x with nearest filtering (fat 16-bit pixels); it rotates with the world. A fixed dithered overlay (`makePlanetShade`) darkens deeper into the planet and adds a rim light.
- `def.geysers`: 7 fondue geysers around the moon (none at the start position). Cycle: idle 3.5–7s → warn 1.1s (vent glows and shakes, bubbles, zing) → erupt 1.3s (screen shake, boom, column of molten cheese blobs ~175 high). Standing in the column during an eruption hurts.

## v0.32 16-bit pass + parallax space (Level 1)
- `pixelArt: true` in the Phaser config: every texture is drawn with hard-edged nearest-neighbour pixels.
- Sky pieces are now real pixel art generated into small canvases (`pixTex` in levels.js), dithered with a 4x4 Bayer matrix, all pixels opaque (transparency comes from dithering), shown at 2–3x:
  - dithered banded sky (`skyCols`, regenerated at 1/3 screen size on resize)
  - 5 swirling nebulae (domain-warped noise, purple/magenta/blue palettes) — slowest layer
  - 4 pixel spiral galaxies, 6 glowing star clusters, 2 black holes, ringed planets
  - chunky pixel stars (tinted, twinkling)
  - orbital debris (rocks, satellites, bolts, cheese chunks) tumbling past on the nearest, fastest layer
- The rat UFO hangs in the sky beaming Bessie up (animated 4-frame dithered tractor beam, Bessie slowly spinning in it, ship bobbing with a little parallax sway). Hidden during the level-start snatch and the rescue.

## v0.33 16-bit HUD + score
- Top-left: framed pixel portrait of Chris (`assets/portrait.png`, 32x32 cut from the title art), CHRIS name, health as pixel cheese wedges (grey when lost; cheeseburger bonus after them), segmented JET bar with shine, MAC ammo as 7 macaroni icons (gold flashing on Parmesan Power, red flashing when jammed).
- Top-centre: big WAVE n/3 (or BOSS) and a rolling 7-digit SCORE. Boss health bar sits below.
- Top-right: DISTANCE TO COW track = progress through the level (one segment per wave + boss), with a mini Chris marker sliding towards Bessie.
- Scoring: mouse 100, flyer 150, golem 400, germ 150, minigerm 50, frog 200, drone 250, slicer 200, boss 5000; wave clear 1000; cheese wedge 50; Parmesan Power 500; end-of-level cheeseburger 1000. Score resets each level attempt.
- v0.34 stomp: landing on an enemy's head (falling, feet near the top of its body) hurts it instead of you and bounces Chris up (440, or 520 after a ground-pound), with a short 0.2s safety window. Small enemies die in one stomp; big ones (golem, frog, slicer) need two stomps, or one ground-pound (duck in mid-air, falling fast). The boss takes 6 per stomp, 12 per ground-pound. +50 score per stomp.
- v0.35 controller rumble: every phone-vibration event (hits, stomps, ground-pounds, geysers, power-ups, boss death...) also rumbles the gamepad via `vibrationActuator.playEffect('dual-rumble')` (Chrome/Edge; Firefox/Safari don't support it). Vibration patterns map to pulses; longer pulses rumble harder. Firing gives a light buzz in the weak motor.
- v0.36 rats are pixel art: `pixSprite` in textures.js paints simple shapes on a pixel grid, shades each in 3 tones (lit from top-left) and adds a 1px dark outline automatically. Walker: armour shell, steel helmet, red eye, buck teeth; flyer adds a jet tank + flame and goggles. Same sizes/origins as before, so hitboxes are unchanged. The same helper can redo the other enemies.
- v0.37 every enemy and boss is pixel art via the shared `pixSprite` painter (textures.js): ellipses, rounded rects, polygons and thick lines on a pixel grid, 3-tone shading lit from the top-left, automatic 1px dark outline (2px for the bosses). Golem, germ, minigerm, frog, drone, slicer, Crusty Croque Monsieur, Baron von Blue and the Mega-Mandoline were redrawn at their original sizes, so hitboxes and origins are unchanged.
- v0.38 the Bessie UFO lives in the world (~215 up) instead of being pinned to the screen. Hover: holds its spot with a slow wander, so running towards it you visibly gain on it. If Chris gets within ~0.14 rad it flees (whoosh) to ~0.5 rad ahead of him — usually away, sometimes swooping over to the other side — and keeps that distance while you chase. If left far behind (>0.8 rad) it drifts back into view at 0.3 rad/s (slower than Chris runs). It tilts with its speed, the beam follows the tilt, and Bessie swings behind on the beam.
- v0.39 flying rats have an animated jet: 3 pixel flame frames (`ratjet0-2`) flickering under the tank, wobbling side to side and stretching, plus a thin exhaust particle stream (`fxRatJet`). The flame was removed from the baked `flyer` texture.
- v0.40 chunkier HUD: portrait is 24x24 shown at 2x; JET bar fills/empties in 17 blocky 8px cells with a shine; DISTANCE TO COW fills in 6px blocks (alternating gold tones) and the Chris marker snaps block to block; HUD text uses 8px/16px pixel-font sizes only. The tractor beam's lower 45% dithers away to nothing.

## v0.41 the Mac-Grinder 3000
- The gun is renamed the **Mac-Grinder 3000** (was Mac-Laster / Mac-Blaster) everywhere, including the intro line.
- New pixel-art gun (`c_gun`, 34x26 via `pixSprite`) based on the concept sheet / title art: orange grinder body with shine and under-shade, glass hopper heaped with macaroni and a red rim, crank with a red knob at the back, wooden grip and trigger guard, steel barrel ring. The drill bit is 4 pixel frames (`auger0-3`) whose threads shift as it spins. Both are drawn 1.25x on Chris; macaroni now leaves the drill tip (70 units ahead) and the muzzle sparkle moved to match.
- v0.43 Luna Chris is pixel art, styled after the title art (all rig parts via `pixSprite`, same sizes/pivots so the animation is unchanged): white/ice-blue suit with red + blue knee and hem trim, mission patch and shoulder flag; glass helmet over a furious face (one squint, one bulging eye, heavy brows, big red nose, handlebar moustache, gritted teeth); puffy chef's toque; cream "KISS THE COOK" apron with red 3x5-pixel lettering and cheese stains, which becomes a cream cape with a red hem; white jet tanks with red caps; blue boots; big white gloves with red cuffs.
- v0.44 hold-to-jet: keep holding jump after take-off and the jetpack lights by itself after `CFG.jetHoldDelay` (0.28s). Release-and-press again in mid-air still lights it instantly. Tapping jump is still a short hop.
- v0.45 jump vs down no longer fight: while both are held, the most recently pressed one wins (the other is ignored until released), so holding jump and pressing down dives and then stays crouched instead of bouncing. Down + jump while standing on a ledge drops you through it (0.35s of ignoring ledges); that jump press is "eaten" until you let go.

## v0.46 cheat mode
- `src/cheat.js`: type **onlimey** on a keyboard (any screen, including the title) or shake the phone **three times within ~1.6s** to turn cheat mode on — a pink "CHEAT MODE!" toast, a jingle and a buzz. Typing the code again turns it off. Remembered on the device (localStorage `lc_cheat`).
- While on: **H** or a **single shake** gives +1 cheese wedge (or the bonus burger heart if already full). A small pink CHEAT tag sits under the HUD panel.
- Shake = device acceleration over 14 m/s² (debounced 280ms). iPhone asks for motion permission on the first tap.
- v0.47 belly: now its own rig part (`c_belly`) tucked behind the front of the suit so it only hangs out at the front-bottom (no more ring all the way round). It jiggles on a little spring driven by the waddle and kicked by landings (squash/stretch + bob).

## v0.48 weapons + progression
- `WEAPONS` table in main.js; each weapon has a gun model, muzzle part, projectile, fire rate, speed, range, ammo cost, damage, wobble and pierce count, plus an `unlock` level.
  - **Mac-Grinder 3000** (unlock 1): fast macaroni stream, corkscrew wobble, 1 damage, ~45 shots per tank.
  - **Spaghetti Spinner** (unlock 2): teal gun with a spaghetti reel and red nozzle. Slower (0.24s), faster & longer-range noodles, 2 damage, each noodle pierces up to 4 enemies, ~16 shots per tank.
- Swap: Q or C (keyboard), Y (controller), tap the weapon box in the HUD. A banner shows the name, the HUD box shows the gun and the ammo label changes (MAC / SPG). The last weapon used is remembered.
- Progression: `Progress.beat(level)` records the best level beaten (localStorage `lc_best`); a weapon is owned once you reach its unlock level. `CFG.allWeapons = true` for now, so every weapon is available on every level.
- v0.49 Crusty Croque Monsieur has armour on top: riveted steel plates with a stubby ridge over the top slice and a cage over the cockpit (`armouredTop: true` on Level 1's boss). Stomping or ground-pounding him just bounces Chris off with sparks and a "CLANG!", no damage. Bullets still hurt him as normal.

## v0.50 weapon select screen
- New `WeaponScene` ('weapons') between level select and the level: "CHOOSE YOUR WEAPON" with a card per weapon — big pixel gun (drill spins / bobs on the selected card), name, one-line blurb, POWER / RATE / RANGE / PIERCE bars (from `WEAPONS[i].stats`). Locked weapons are greyed with a padlock and "UNLOCKS AT LEVEL n".
- Controls: tap a card; keys 1/2 or arrows/A/D + Enter/Space/X, Esc back; controller D-pad + A, B back. The choice is saved and the level starts with it; in-level swapping (Q/C/Y/tap) still works.
- v0.51 rumble fixes: the active controller is whichever one is actually being pressed (PCs often list ghost/virtual gamepads first, which have no motors); rumble goes to a pad that has motors. Pulses are at least 90ms and stronger. The first time a controller is used, a toast says "CONTROLLER READY - RUMBLE ON" with a test buzz, or "NO RUMBLE IN THIS BROWSER (USE CHROME OR EDGE)". Older Firefox-style `hapticActuators` are also tried.
- v0.52 the Spaghetti Spinner is now a constant stream (`beam: true`): hold fire and a wobbly noodle runs ~330 units along the curve of the planet at gun height, hitting every enemy in line for 1.5 damage every 0.1s (15/s each). It drains the tank in ~2.2s (`drain: 0.45`/s), then jams like the Mac-Grinder until it refills. Parmesan Power makes it thicker/wider and stops the drain.
- v0.53 the spaghetti stream starts exactly at the nozzle: each frame the nozzle sprite's world transform gives the muzzle point (after recoil, crouch and facing), converted back to planet coordinates (`this.muzzle`). The stream is pinned there (no wobble at the root) and the damage line uses the same start point and height.
- v0.54 Spinner stream: range 330 → 200; the noodle droops (sags up to 46 units by the tip) and the last ~40% crumbles into flickering, shrinking bits that shed falling noodle crumbs (`fxNoodle`). Anything the stream touches is taken out (`dmg: 99`); the boss takes 2.5 per tick (25/s) instead. The hit check follows the droop curve.
