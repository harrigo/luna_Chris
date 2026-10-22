# Luna Chris - Game Design

> Context file for AI sessions. Keep this up to date so every session knows what the game is.

## Story
Luna Chris was the galaxy's most decorated astronaut until the space race burned him out. Now he flips
intergalactic flapjacks on a dusty space-ranch in a "Kiss the Cook" apron slapped over his NASA suit, with his
best friend Bessie, a zero-gravity cow whose udders produce "Mad Cheese". The Parmesan Pirates (alien rats in
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
Beats: retired hero flipping flapjacks with Bessie -> the Parmesan Pirates' junk UFO crashes through the barn roof and
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

## v0.55 the Swiss-Shot
- Third weapon (unlock level 3; unlocked for now): a pixel cheese cannon — Swiss-wheel barrel with holes, brass bands, a drum of cheese balls and a flared brass bell muzzle.
- Lobs fat Swiss cheese balls (`swissball`) up at ~46° (speed 360, gravity 900), landing ~160 units ahead. On hitting the ground or an enemy it bursts (`swissBlast`): 7 damage within 64 units (60% at the edge), crumbs, sparks, shake, boom. Slow (0.45s), ~8 shots per tank. Parmesan Power = 3 balls in a spread. Great for groups and anything low or behind cover.
- All guns' shots now start exactly at their real muzzle (the rig's tip sprite), like the spaghetti stream.
- v0.56 Swiss-Shot buffed: balls are 22px drawn at 2.2x; blast radius 64 → 130 and 20 damage (60% at the edge) — anything near the middle dies, golems included; the boss takes 12. The splat: an expanding shockwave ring, 26 crumbs, 6 flying cheese chunks, sparks, a melted-cheese puddle (`swisssplat`) left on the ground that fades after ~2.5s, a heavy shake and a double rumble.

## v0.57 "next-gen" light & feel layer (sprites stay pixel art)
- Light & glow (WebGL `preFX.addGlow`, off with `?lowfx`): glow on lava pools, geyser vents (pulses on warning, blazes on eruption), the UFO beam and ship, the spaghetti stream, Swiss-Shot balls, enemy bullets (spores green, blades white, cubes amber) and Parmesan power-ups.
- Light halos (`drawLights`): soft additive halos that brighten whatever is near a light — lava pools, warning/erupting geysers, the muzzle while firing, Chris under Parmesan Power, power-ups, the UFO beam, plus short flashes from kills and Swiss blasts (`addLight`).
- Heat haze: warm shimmering plumes rise off the geysers (`fxHaze`), heavier while they warn/erupt.
- Game feel: hit-stop freezes (35ms small kills, 70ms big kills, 60ms stomps, 80ms Swiss blasts, 300ms boss kill); impact frames (enemies flash solid white with a squash/stretch pop on every hit); camera kick (springy directional knock on stomps / when hurt) and zoom punch (big kills, blasts, boss); boss kill = white flash + 1.4s slow-motion easing back to full speed.

## v0.58 burger boss cannons + twin-stick
- Crusty Croque Monsieur is now a flying cheeseburger: sesame top bun (armoured), melting cheese slice dripping over a char-grilled beef patty, lettuce frill, bottom bun — with a cannon on each side and a turret underneath. No more ham falling out of the sky: the side cannon facing Chris fires aimed **meatballs** (`meatball`) and the belly turret fires the downward crumb spread; each shot leaves the real cannon (`bossGun`) with a muzzle flash and light (`muzzleFlash`). Boss health bar moved below the HUD.
- Twin-stick: the right stick aims and fires (Pad `aimOn/aimX/aimY`). Chris faces the aim direction whatever way he runs; the gun arm tilts with the aim (up to ~70° up, ~35° down) and shots go that way. The spaghetti stream tilts with it; the Swiss-Shot's lob angle shifts with the aim.
- v0.59 mobile twin-sticks replace the ◀ ▶ and FIRE buttons. Floating sticks are based wherever the thumb first lands (ghost rings show the rest positions; anything in the top ~28% of the screen is HUD, not a stick). MOVE (left 45% of the screen): left/right to run, pull down to duck / drop fast, push up to jump (hold for the jetpack). AIM+FIRE (right side): touching fires straight ahead, dragging aims and fires that way (same twin-stick aiming as the controller's right stick). The JUMP button stays, moved up the right edge.
- v0.60 move stick: pushing up past ~45% jumps; pushing to the top (~90%) lights the jetpack immediately (no hold delay), and works on diagonals so you can fly while steering.
- v0.61 belly reduced to a slight overhang: a thin crescent of skin (22x9) peeking out under the front of the hem with a shadow crease, navel and shine; smaller jiggle.
- v0.62 chef's hat band is curved (bows down in the middle as it wraps round the helmet); the pleats follow the curve.

### v0.63 — Main menu, pause menu and settings
- After the title: a main menu with PLAY and OPTIONS. Level select has a "< MENU" back button (ESC / B work too).
- Pause (START / P / ESC / PAUSE button) opens a menu: RESUME, the options, and QUIT TO MENU.
- Options, saved on the device:
  - GRAPHICS: HIGH = glow + light halos + heat haze; MEDIUM = light halos only; LOW = no effects. `?lowfx` forces LOW.
  - SOUND on/off.
  - SCREEN SHAKE on/off.
  - RUMBLE on/off.
- Menus work by touch, keyboard (arrows/WASD, Enter/Space) and controller (d-pad, A, B).
- In menus, left/right change a setting and select toggles it.

### v0.64 — Bessie is never safe (until level 9)
- Story arc: on every level before the last (`CFG.finalLevel = 9`), the rescue is a fake-out.
  - Bessie lands and the banner says "...Bessie is safe!".
  - You get the cheeseburger heart.
  - Then a rat-ship dives out of the sky, tractor-beams her up and races off round the planet.
  - The banner reads "THEY'VE GOT BESSIE AGAIN!" and the level-clear text sets up the chase.
- Only on level 9 does the rescue stick.

### v0.65 — Intro rebuilt in the 16-bit style
- The painted title screen stays. The story after it is now pixel art on a 200px-tall grid, scaled to fit.
- It uses the real game sprites: the Chris rig, the rat-ship, the tractor beam, the rats and Bessie.
- Shots:
  1. Dusk on the Gruyère Globe. The camera pans down from the stars to the ranch, where Chris flips pancakes with a spatula and Bessie grazes.
  2. Alarm. The rat-ship crashes through the barn, rats pour out and the ship beams Bessie away. A pancake lands on Chris's helmet.
  3. A comic close-up panel with speed lines: "NOBODY TAKES MY COW."
  4. The cabin. A pepper-grinder twist spins the fireplace round to reveal the armoury, and the Mac-Grinder flies into his hand.
  5. Night. He jet-boots up into the stars and the LUNA CHRIS logo appears.
- Typewriter captions in a pixel panel, pixel speech bubbles, cinematic bars. Skip with tap, A or Enter.

### v0.66 — Secret warp: Level 3 → Fondue Fountain (level 6)
- Level 3 has a small, dim, grey black hole high in the sky (θ 2.55, h 238) that passes for background scenery.
- Three bits of floating junk ("sieve-satellites" with a blinking red light) hover high up, above the high platforms. Any weapon can hit them (6 HP each).
  - Each one destroyed makes the hole flash purple, thrum and grow.
  - When all three are gone it wakes up: full colour, purple glow, spinning, sparks spiralling in, "A WARP HOLE HAS OPENED!".
- Jet into the open hole and Chris is sucked in, spinning and shrinking. A white-out follows, then "WARP ZONE! FONDUE FOUNTAIN".
- Level 6, Fondue Fountain:
  - A molten-cheese moon: dithered red sky, 11 fondue geysers, 14 lava pools.
  - A tougher enemy mix.
  - Boss: Le Grand Fromage, currently a heat-tinted, tougher Croque.
- Once found, it is saved (`lc_found6`) and appears on level select as "* WARP: FONDUE FOUNTAIN *" (tap, Y or the 6 key).
- Secret levels don't count towards `lc_best`.
- Data-driven: any level can get a `warp: { to, theta, h, relics: [...] }` entry.

### v0.67 — Performance pass (no visual changes)
- Profiled: game JavaScript is under 1% of frame time. The real cost was GPU work from per-object shader glows. No leaks: the object count stays flat over long play, and listeners are cleaned up on restart.
- `bakedGlow()` pre-draws the glow halo into a cached texture once, for things whose texture never changes: lava pools, enemy shots, swiss balls, the power-up and the rat-ships. It looks the same as the shader glow and costs nothing per frame. Switching graphics to LOW mid-level undoes it.
  - Live shader glow is kept only on animated things: the tractor beams and the pulsing geyser vents.
  - Level 2 boss fight: offscreen render passes 42 → 1 per frame, draw calls 40 → 9. Level 1: 46 → 17 passes.
- `makePlanetTexture` stamps craters and holes over their own bounding boxes instead of testing all 115 at every pixel. Output is byte-identical; about 450ms → 30ms per planet, which removes the start-of-level hitch on levels 1 and 6.
- Removed the unused PAUSED text (replaced by the pause menu).

## ROADMAP — the full campaign (from Harri, v0.68)
Bessie is snatched back at the end of every level until Level 9.

- **Level 1: The Gruyère Globe** *(built)*
- **Level 2: Gorgonzola Gulch** *(built)*
- **Level 3: The Great Grater** *(built)*
- **Level 4: Mount Mozzarella** *(first pass built v0.77)* — A highly volatile volcanic planet. Instead of lava, elastic strands of boiling string cheese snap and whip across the screen. Boss: a giant pizza oven spitting homing pepperoni discs.
- **Level 5: The Brie-muda Triangle** *(first pass built v0.77; hosts the warp hole to 5.5)* — A spectral, pale pocket dimension covered in powdery rind. Enemy bullets move in bizarre geometric patterns while ghostly dairy-maid phantoms try to ram you off the planet's curve.
- **Level 5.5 (Secret Detour): The Forbidden Fondue Fountain** *(first version built as the warp level)* — A luxurious, multi-tiered party planet made of spinning metallic rings pumping cascades of scalding Alpine cheese. Enemies: Kamikaze Croutons and rats pole-vaulting on giant fondue forks. Boss: the Triple-Tiered Terror, a colossal fountain engine acting as a bullet-hell sprinkler system.
  - *Still to do:* spinning ring scenery, croutons, fork-vault rats and the Triple-Tiered Terror boss. Its current boss is a placeholder (a tinted Croque).
- **Level 6: Cheddar Gorge** *(first pass built v0.77)* — A high-speed pursuit on a tiny planetoid. You're constantly arcing forward, chased by a gargantuan rolling wheel of Spicy Pepper Jack that takes up half the screen.
- **Level 7: The Astro-Rat Armada** *(first pass built v0.77)* — Platforming across a fleet of rusted, spherical rat spaceships locked in orbit. Destroy their engines to make them crash into each other while dodging the flagship's sweeping lasers.
- **Level 8: Lactose Labyrinth** *(first pass built v0.77)* — A claustrophobic puzzle-shooter inside a hollowed-out block of Swiss cheese. Tight spherical chambers full of ricocheting Mac-Laster bullets and heavily armoured Rat-Paladins.
- **Level 9: Parmesan Prime** *(first pass built v0.77)* — The collapsing rat homeworld. Fight to the core to rescue Bessie from a massive dairy-extraction machine, then the final showdown with the Grand Rat-King in his rusty, cheese-powered mech suit. (The only level where the rescue sticks.)

### v0.68 — Intro fix, single sprite sheet, Fondue Fountain → Level 5.5
- **Intro fix:** pressing during the title logo used to skip the whole story. Now:
  - A press on the title goes straight into the story.
  - In the story, the first press shows "TAP AGAIN TO SKIP", and a second press within about 2 seconds skips.
- **Sprite sheet (`src/atlas.js`) — the technique for ALL sprites from now on:**
  - At boot, `buildAllTextures()` runs every generator once (planets, space backdrops and pre-made glows included).
  - `Atlas.pack()` then shelf-packs everything onto shared 2048×2048 pages and re-points each key at its patch, so game code keeps using the same names.
  - 161 sprites currently use about two-thirds of one page.
  - Texture switches per frame: L1 102 → 44, L2 53 → 8, L3 55 → 6, L5.5 107 → 50.
  - **Rule:** any new sprite generator must be called from `buildAllTextures()`.
  - Kept off the sheet: the smooth light halo, the title photo, and the resize-dependent sky gradients.
- **Renumbering:** Fondue Fountain is now Level 5.5, the secret detour, per the roadmap. Its warp still lives on Level 3 until Level 5 exists. Earlier "found" saves carry over.

### v0.69 — Melee bash (Halo style)
- Chris clubs enemies with the gun: wind back, swing forward and down with a short lunge, recover. About 0.32s, 0.5s cooldown.
- **Triggers:**
  - Keep holding FIRE when the gun is out of pasta (overheated). This works on touch, keys and pad.
  - Bash any time with **B** on a controller (B is no longer a fire button; X/RT/RB still fire) or **F / V** on the keyboard.
- **Hit:** reaches about 64 units in front.
  - Does 4 damage, which one-shots mice, flyers, germs and drones and takes two hits on frogs and slicers. Bosses take 3.
  - Knocks enemies back, with sparks, a short impact freeze, a camera kick, a "bonk" sound and rumble.
  - Also smashes the warp-hole junk.
- The first time you run dry in a level: "OUT OF PASTA - BASH 'EM!".
- The rig gets `P.bashA/bashX/bashY` offsets on the gun arm. Tune them in `CFG.bash*`.

### v0.70 — Pressure-sensitive guns + charged Swiss-Shot
- Controller RT is read as analog pressure (`Pad.state.fireP`). The X / RB fire buttons count as full pressure, as do keys and touch.
- **Mac-Grinder:** a light trigger pull fires slower and shorter. At ~30% pull, speed and range are about 70% and the fire rate about 60%. A full pull is unchanged.
- **Spaghetti Spinner:** reach = 40–100% of the full range from trigger pressure. On touch, drag the aim stick further for a longer stream.
- **Swiss-Shot = hold and release:**
  - Holding fire grows a glowing, wobbling cheese ball on the nozzle with sizzling sparks and a rising charge tone. Rumble builds, and Chris slows to about 45% move speed.
  - Full charge (about 1.1s; a harder trigger pull charges faster) gives a "ding" and the ball flashes.
  - Releasing lobs it: speed ×0.65–1.4, size ×0.45–1.4, blast radius ×0.45–1.3, blast damage ×0.4–1.4, same for the boss.
  - A big charge kicks Chris back and shakes the screen harder, and costs more pasta (×0.5–1.4 of a normal shot).
  - Bashing or swapping weapons cancels the charge.

### v0.71–v0.72 — Controls overhaul, aimed Swiss-Shot, curved blasts
- **Platformer feel:**
  - Jumps fire on the press (no auto-bunny-hop while held), with a 0.12s jump buffer and 0.1s coyote time.
  - Hold jump in the air = jetpack, as before.
- **Touch:**
  - LEFT: drag to run. Tap, or a clear push UP, to jump. A push-up must be mostly vertical, with hysteresis (no accidental jumps while running or from thumb wobble). Hold up = jetpack.
  - RIGHT: drag to aim + fire. The big right-hand button is now **BASH** (it reacts on the press). There is no separate jump button.
- **PC:** the mouse aims (pixel crosshair replaces the cursor), left-click fires, right-click bashes, the wheel swaps guns. WASD/arrows + SPACE as before.
- **Controller:** LT = jetpack. The full layout is on the start-of-level card and the new **CONTROLS** menu page.
- **Menus:** boxes size to their contents (no empty title band). Main menu: PLAY / CONTROLS / OPTIONS.
- **Swiss-Shot:**
  - Fires along the barrel at the angle you aim, with lighter gravity (420).
  - It ploughs THROUGH enemies, damaging each once (3–9 damage with charge). Every hit shrinks the ball and cuts its final blast (×0.82, or ×0.72 if the enemy survives).
  - Worn down to under about a third of its size, it pops early. It still bursts on bosses and the ground.
- **Blasts drawn in planet coordinates** (`drawBlastFx`): the shockwave dome bends with the surface and is clipped at the ground. A ripple runs along the curve, and a molten-cheese smear hugs the surface, tapers and fades. This replaces the flat ring and flat puddle sprite.
- **Range +25%:** Mac-Grinder life 0.6→0.75s, Spaghetti 200→250, Swiss launch speed ×1.118 (≈ +25% ballistic range).
- **Weapon select:** stats sit low and centred in each card and never overlap the description.

### v0.73 — Gun-flip bash
- The gun now sits on a pivot at the grip (`rig.gunPivot`), so it can spin independently of the arm.
- The bash is about 0.42s, in three beats:
  1. **Flip:** the gun spins anticlockwise round the grip until the butt faces forward, overshooting slightly, with the arm drawn back.
  2. **Strike:** the spin snaps level as the butt drives forward (+29px), Chris leans in and lunges. The hit lands here.
  3. **Flip back:** it keeps spinning the same way to complete a full turn into firing position.
- Motion-blur trails follow the barrel tip (white) and the butt (gold) through the spin.
- On a hit: a spinning pixel-star flash plus a comic word (BONK! / THWACK! / BOP! / WHAM!) that pops and drifts off, on top of the sparks, freeze, kick, sound and rumble.

### v0.74 — Livelier ranch intro, Parmesan Pirates, snappier bash
- The rat villains are now **the Parmesan Pirates** (previously the Roquefort Rodents).
- **Intro ranch, now busier:**
  - **The Mad Cheese stockpile:** an overflowing wooden water tower full of cheese, with heaped cheese, drips, a puddle, a "MAD CHEESE" sign and a constant bulge. Plus milk churns oozing cheese, one tipped over and spilling.
  - **The ranch folk:**
    - a robot farmhand trundling a churn back and forth;
    - a space dog in a bubble helmet bounding round Chris ("ARF!");
    - two helmeted space chickens pecking;
    - the alien kid from next door on a hay bale, who waves "HI CHRIS!".
  - A new caption pans to the tower: "HER MAD CHEESE IS SO GOOD THE WHOLE RANCH IS OVERFLOWING WITH IT."
  - **On the alarm:** the dog barks and hides behind Chris shivering, the chickens bolt off in a puff of feathers, the robot spins out and drops its churn, and the kid ducks behind the hay.
  - The barn moved to x 205 (`BX`) and the layout was spread out to fit everyone. The night launch shot shows the tower too.
- **Bash, revised:** a quick ~120° anticlockwise swing round the grip (barrel up and back, butt forward into the enemy) with a lunge and lean, a short beat at the hit, then a snap back to normal. 0.3s total, 0.45s cooldown. The trails and BONK pops stay.

### v0.75 — Real crouch instead of a squash
- The whole-sprite squash (root scaleY 0.58) is gone, and so is the gun counter-scale.
- The crouch is now built from the rig:
  - a springy 0..1 value with a little overshoot going in and popping up;
  - knees bend out (front leg -1.05 rad, back leg +0.95), and the legs compress (scaleY ×0.64, chunkier ×1.2);
  - the boots stay planted on the ground;
  - the body drops 13.5px onto the legs, with only a hint of squash, and leans in 0.13 rad;
  - the belly sags (+16%), and the cape follows the body down.
- The gun drops with the body, so shots leave from crouch height (fallback gun height 29). Hitboxes are unchanged.

### v0.76 — Varied platforms
- Five platform types (`PLATFORMS` + `makePlatformTextures` in levels.js, all on the sprite sheet). Each is drawn 124px wide and scaled evenly to its ledge; `top` = the row you stand on.
  - **energy:** a glowing cyan tube between metal caps, with lightning crackling across 3 flickering frames and a humming glow.
  - **girder:** a riveted steel beam with diagonal hazard stripes and drooping cables, a dangling cable end and a chain underneath. A red siren on top blinks with a glow.
  - **panini:** grill-marked toasted bread with an oozing cheese layer and drips. Real cheese blobs drop off now and then, with a warm glow.
  - **crystal:** a craggy floating rock with purple/cyan crystal clusters on its ends, glowing specks, hanging roots, twinkles and a purple glow.
  - **carnival:** a gold riveted bar with scroll ends, two swags of purple star pennants, and stars on strings.
- Per-level mixes via `ledgeTypes`:
  - L1: panini / crystal / carnival / energy.
  - L2: crystal / girder / panini.
  - L3: girder / energy.
  - L5.5: carnival / panini / energy.
- A ledge can also force `type`. Without types, the old slab is used.

### v0.77 — First pass of levels 4-9 (the whole campaign is now playable)
- **Level select** is now a 3×3 grid of cards: a planet icon, the number and name, and a star once beaten. It works with touch, arrows + Enter, the d-pad, and keys 1–9. The 5.5 warp link sits underneath once found.
- **New enemies** (they reuse existing behaviours via `ENEMY[type].ai`):
  - **phantom:** a ghostly dairy-maid with drone AI (hovers, then rams) and an alpha flicker;
  - **paladin:** an armoured Rat-Paladin with mouse AI, 8 HP, counted as big.
- **New shots:**
  - **pepper:** a pepperoni disc that homes on Chris (`b.home` / `b.homeV`);
  - **ghostorb:** pale orbs used in geometric patterns;
  - **chili:** arcing flakes that fall back down (`b.grav`).
- **Hazards** (`updateHazards` / `drawHazards`):
  - **strands (L4):** string cheese stretches faintly for 1s, then SNAPS taut and whips for 0.55s. Touching it hurts.
  - **chaser (L6):** a 1.5× Pepper Jack wheel rolls after Chris all level, getting faster each wave. It flattens and bounces him, rumbles when near, and shooting it slows it a little. It's removed for the boss.
  - **sweep (L7):** red warning lines, then sky lasers sweep across the deck.
  - **ricochet (L8):** player shots bounce off the floor and ceiling up to twice.
  - **debris (L9):** rocks fall from the sky, with a growing red shadow showing where they'll land.
- **Bosses** (all 96px tall so `bossGun` works):
  - **L4 Pizza Oven of Doom:** homing pepperoni from its side chutes, plus a fan of molten cheese from its mouth. Armoured top.
  - **L5 Phantom Milkmaid:** spinning 3-arm (later 4-arm) pinwheel orb patterns; she blinks across the sky and summons phantoms.
  - **L6 Great Pepper Jack:** a giant wheel that rolls at Chris, overshoots, turns slowly (jump it) and spits arcing chilli flakes.
  - **L7 Rat Flagship:** aimed side cannons, a belly laser that sweeps the ground, and launches drones.
  - **L8 Grand Paladin:** sword waves at two heights, and shield-first charges at Chris's height. Summons paladins.
  - **L9 Grand Rat-King mech:** arm cannons, reactor orb rings and homing pepperoni in phase 2. Summons paladins and phantoms. Beating it is the real rescue: no snatch.
- The 5.5 warp hole moved from Level 3 to Level 5, per the roadmap.
- **Still to refine per level:**
  - unique enemy art (e.g. L4 lava rats, L7 ship rats);
  - level-specific music;
  - L6 forced forward momentum;
  - L7 destroyable rat ships that crash into each other;
  - L8 tight chambers / ceiling;
  - L9 dairy-extraction machine and finale cutscene;
  - L5.5 rings, croutons, fork-vault rats and the Triple-Tiered Terror.

### v0.78 — The ending (src/ending.js)
- `EndingScene` extends `IntroScene`, so it reuses the same pixel-cutscene engine: stage, bars, typewriter captions, pixel bubbles and the real Chris rig.
- It plays automatically after beating Level 9 ("YOU DID IT!", then fade). Once the game is beaten it's on the main menu as **THE END**, and `?ending` in the URL opens it directly.
- Beats (all very silly):
  1. **Ruins of Parmesan Prime:** Chris jets down, finds Bessie sulking in a glass extraction tank, macaroni-blasts it, and the glass shatters ("THE GLASS NEVER STOOD A CHANCE.").
  2. **Slow-motion run:** dreamy sparkles, "BEEEEESSSSIIIIEEEEE..." / "MOOOOOOOOOOOO...". Then a wide shot: "IT WAS A VERY, VERY BIG FIELD."
  3. **The crash-hug:** a heart explosion, pink flash, "SLUUUURP!", "...I MISSED YOU TOO, GIRL.", "(SHE LICKED HIS VISOR. IT WILL NEVER BE CLEAN AGAIN.)"
  4. **The Rat-King** crawls out of his smoking mech in polka-dot pants: "CURSE YOU, LUNA CHRIS!", then *RUMBLE* "...WE ONLY WANTED SOME CHEESE." Bessie drops him a glowing wheel of Mad Cheese, he takes one bite, and the planet is cured: the red sky fades to blue, flowers pop up and the rats dance. "...IS THIS GOUDA?" "MOO!!"
  5. **Party at the ranch:**
     - a "WELCOME HOME BESSIE!" bunting sign, Bessie in a crown, and the Rat-King in an apron flipping burgers;
     - a rat conga line, fireworks, and Chris flipping pancakes onto an ever-growing stack;
     - "EVEN THE RATS CAME. THEY BROUGHT CRACKERS.";
     - then a tiny UFO beams up the pancake stack: "OH, COME ON!!"
  6. **THE END ?** with silly scrolling credits ("PANCAKE CONSULTANT: THE DOG AGAIN", "NO RATS WERE HARMED / MOST OF THEM WERE CURED", "MADE BY HARRIGO", "MOO.") while Bessie floats past waving. Tap to continue to the menu.
- New pixel art (`makeEndingPix`, on the sprite sheet): ruined and cured skies, the extraction tank, glass shards, the pants-wearing Rat-King, an apron, hearts, flowers, a crown and bunting.

### v0.79 — Power-ups (`BUFFS` in src/levels.js)
- Timed pick-ups dropped by medium and bigger enemies (ENEMY hp ≥ 3, not bosses). Each kill has a 25% chance, and only one power-up can be on the ground at a time. Drops start after the first weapon power has been collected.
- The pool grows as you progress (each buff has a `from` level), so early levels only get the plain ones:

| Power-up | From | Time | Effect |
|---|---|---|---|
| Hot Sauce | L1 | 10s | Fires twice as fast, beam ticks faster, hits set enemies burning |
| Rocket Boots | L1 | 10s | Faster jetpack, unlimited fuel |
| Magnet Fork | L2 | 12s | Pulls pickups in and pushes enemy bullets away |
| Fondue Shield | L3 | 14s | Orbiting shield that soaks 3 hits (ends early once they are used) |
| Slow-Mo Brie | L4 | 6s | Enemies, their bullets and hazards run at 40% speed |
| Gouda Gigantism | L5 | 8s | Chris grows to nearly 2x, is invulnerable and stomps enemies |
| Moo Bomb | L6 | instant | Bessie-shaped shockwave that wipes the screen |
| Rat Disguise | L7 | 10s | Ears on the hat, and normal enemies ignore you (bosses aren't fooled) |

- HUD: the icon and a draining timer bar sit next to the weapon card. There's also a name banner on pickup.
- Visuals: Slow-Mo adds a pulsing blue wash, and Giant scales the whole rig. All the art is on the sprite sheet (`makePowerupTextures`).

### v0.80 — Review-readiness pass: feel, retries, music, replay value
- **Game feel:**
  - Hits shove enemies back. Bullets nudge them, the Swiss-Shot plough and blasts shove harder, and bash knocks hardest. Big enemies only budge a little and bosses don't move (`knock()`, `e.kb`).
  - Killed enemies flash white, then tumble off spinning with a little poof when they land, instead of vanishing.
  - Floating score numbers on every kill (pooled text, `popup()`).
  - **Kill combos:** kills within 1.6s of each other chain. The HUD shows "N COMBO". 5+ doubles the score, 10+ triples it and 15+ quadruples it. A banner shows when a big combo ends.
  - **Low health:** on the last cheese, a red vignette pulses at the screen edges along with a heartbeat sound.
  - **Boss name card:** a fighting-game-style banner slides in with the boss's name ("WARNING! BOSS APPROACHING").
- **Checkpoints and fast retries:**
  - Checkpoints are halfway through the waves and just before the boss. On Easy, every wave is a checkpoint.
  - Dying offers an instant retry from the checkpoint (wave and score restored). Retry is available 0.5s after dying.
  - Death screen quips rotate.
- **Music:** every level now has its own chiptune track:
  - L4 Italian tarantella (D harmonic minor);
  - L5 spooky echoes;
  - L6 breakneck punk;
  - L7 rat military march;
  - L8 creeping maze;
  - L9 eight-bar finale;
  - 5.5 fondue party.

  The Rat-King also gets his own faster final-boss theme (`bossMusic: 'final'`).
- **Golden cheese wheels:** 3 hidden per level, saved on the device (`Progress.wheels`). A wheel already found on an earlier run shows as a faint ghost.
  1. On the highest ledge, or floating mid-air if the level has none.
  2. Right up at the jetpack ceiling on the far side of the planet.
  3. Only drops when you finish off a medium-or-bigger enemy with a BASH.
- **Level ranks (S/A/B/C/D):**
  - Scored from hearts lost, deaths, time over par, and best combo.
  - The rank letter slams onto the clear screen with time, hits, best combo and wheels found. The best rank is saved and shown on the level-select card, along with the 3 wheel icons.
- **Difficulty (Options and pause menu):**
  - Easy: enemies have 70% health and their shots move at 75% speed; checkpoints every wave; rank capped at A.
  - Hard: 130% health and 115% shot speed; no healing wedge between waves; rank bonus.

### v0.81 — Tougher Level 1 boss, much tougher Level 2
- **Crusty Croque Monsieur (L1 boss):**
  - Health raised from 110 to 190.
  - The side cannon fires faster (0.62s, 0.42s when angry) and leads Chris slightly. In phase 2 both cannons fire together.
  - The crumb fan is wider and comes more often (5 crumbs every 3.8s, then 7 every 2.6s).
  - **Body slam** when Chris camps underneath it (1.4s, or 0.9s in phase 2). The tell: it shudders, flashes pink and lifts about 30px, then drops straight down. Landing sends crumb shockwaves along the floor both ways (jump them). In phase 2 it also sprays meatballs up that rain back down. It sits low for a moment afterwards, which is the window to punish it.
- **Gorgonzola Gulch (L2):**
  - Now 4 waves, denser, with more frogs.
  - **Stink-fly** (new enemy, uses the flyer behaviour): a bloated mouldy fly that lobs spore bombs leading Chris, plus a stink puff either side.
  - **Germs** spit an arcing spore glob at Chris every 2–3s. A red flash warns first.
  - **Rat-frogs** aim their leaps at where Chris is heading, wait less between leaps, and splash two spores along the ground on landing.
  - **Baron von Blue:**
    - Health raised from 120 to 200.
    - Spore rain leads Chris (4–5 globs).
    - Bigger spore rings, and a second staggered ring in phase 2.
    - New aimed triple-spit.
    - Summons germs, and stink-flies in phase 2.

### v0.82 — No more accidental bashes on mobile
- The out-of-pasta auto-bash (holding FIRE with an overheated gun) now only fires when an enemy or relic is within bash reach (`bashTargetNear()`). On a phone, aiming counts as holding FIRE, so an empty gun used to bash over and over just from aiming.
- The touch BASH button moved up the right edge (out of where the thumb lands to aim right) and is a bit smaller (r 32). It only triggers if the press *starts* on the button (hit area 1.05× the button, down from 1.3×). Dragging the aim stick across it never bashes.

### v0.83 — Auto-bash removed, physics cape and front apron
- **Auto-bash removed:** a bash only ever happens when you press BASH (B, F/V, right-click or the touch button). The level-start hint now says "Out of pasta? BASH them!"
- **The cape** (src/chris.js `updateCloth`):
  - A red cape with a gold zig-zag hem, made of 4 pixel strips (`c_capeS0-3`) riding a 5-point chain from the back of the neck.
  - The chain is simulated in the rig's own facing-right space:
    - gravity pulls it down;
    - "air" blowing against Chris's movement drags it back when running, down when jumping and up when falling;
    - the jetpack blows it down and back;
    - a flutter grows with speed, strongest at the hem.
  - A cone constraint keeps it draping out behind him, so it shows even when standing still. It never passes through his body or the floor.
  - Strips snap to 1/12-turn angles and whole pixels, so it reads as sprite animation rather than smooth cloth.
  - Substeps scale with frame time, so it moves the same on slow phones.
- **Cape knot:** a red bow with a gold clasp (`c_collar`) sits in front of the neck, so the cape wraps over him.
- **The apron** now sits over the FRONT of the suit instead of hiding behind it. It's split into a bib ("KISS THE") and a skirt ("COOK"). The skirt hangs on a springy hinge: it swings back when running, flips up when falling and whumps on landing, with angles snapped to 1/32-turn steps.
- The old apron-to-cape swap on jumping is gone: he now wears both all the time.

### v0.84 — Lives, GAME OVER, rebalance, chef-to-astronaut in the intro, a homely cabin
- **Rebalance (v0.81 went too far):**
  - Croque Monsieur: health 140; cannon every 0.85s, or 0.7s with both cannons when angry; crumb fan of 4–5; the slam needs 1.7s under it (1.2s angry); fewer meatballs and shockwaves.
  - L2 enemies: germs spit every 3.4–5s within 280px; frogs pause longer and only splash half the time; stink-flies bomb every 2–3s with no side puffs.
  - Baron von Blue: health 160; lighter spore rain; smaller rings; slower spit.
- **Battle Chris has no apron:** the rig has chef mode (apron, no cape) and battle mode (cape and knot, no apron). Battle mode is the default; cutscene Chris with the spatula is in chef mode.
- **Intro transformation:** in the cabin, after he grabs the Mac-Grinder he hops and the apron whips round faster and faster on the spot and becomes the cape ("OFF COMES THE APRON... ON GOES THE CAPE!"). Handled by `ChrisRig.spinToCape()`.
- **The cabin is a home now:**
  - kitchen corner: a chef's range with a steaming pot of cheese sauce, and pans on a rail;
  - a potted plant, a squashy sofa with cow-print cushions and a coffee table (cocoa, cheese magazine);
  - a "HOME" cross-stitch and a cuckoo clock with a swinging pendulum;
  - a CRT telly with rabbit ears flicking between a cooking show, a cow documentary and static, casting a blue glow;
  - a fringed floor lamp with a warm glow, a bookshelf (books, a jar of Mad Cheese, a trophy, a model rocket);
  - the space dog asleep on the hearth with floating z's.
- **Lives:**
  - 3 lives per game, kept for the session (`registry.lives`), shown as "x3" on the portrait.
  - A death costs a life; the death screen shows LIVES LEFT. While lives remain, retry continues from the checkpoint.
  - **1UP:** one floats high above the second-highest ledge of each level (it takes the jetpack). Once taken it's gone until GAME OVER.
  - A bonus life every 40,000 points. The cap is 9 lives.
- **GAME OVER** when the last life goes:
  1. The camera pushes in on Chris (zoom 1.9) and everything goes dark around him in a spotlight.
  2. His helmet glass cracks, cracks more, then shatters (glass shards; the bare head has X'd-out eyes).
  3. He keels over backwards onto his back with stars circling, and his gun clatters away.
  4. Small and far off in the sky, the rat UFO whisks Bessie away ("moooo...").
  5. The screen cuts to black and a red-and-gold GAME OVER drops in letter by letter, with "BESSIE IS STILL OUT THERE..." and the final score.
  6. It fades to black and returns to the main menu with lives reset to 3. Tapping once the text is up skips ahead.

### v0.85 — Game-over crash fix
- Fixed a crash ("Cannot read properties of undefined (reading 'home')") when an enemy bullet took the last life. GAME OVER cleared the bullet list while the bullet loop was still running. The loop now stops once the game has ended, skips missing entries, and the clear is deferred to the next tick.
- Croque Monsieur health is now 155 (+10%).

### v0.86 — No cheese in the L1 sky
- The floating cheese chunks in Level 1's orbital debris layer are gone (rocks, satellites and bolts only). They looked too much like the cheese-wedge heart pickups.

### v0.87 — Gorgonzola Gulch: quicksand goop, psychic rat-frogs, no tyres
- **Goop pools (`def.goop`):** 5 green quicksand pools on L2.
  - They're drawn in front of Chris, so he visibly sinks in (up to 18px, waist-deep) with bubbles plopping up.
  - In goop, running drops to 20% speed.
  - Getting out: the first 2 jumps only squelch him up a little (42% height). Jump twice more, or hop and hold to light the jetpack and fly out.
  - The first time you get stuck, a banner explains: "STUCK IN THE GOOP! JUMP JUMP - OR JET OUT!"
  - New sounds: `squelch`, plus goop splash particles.
- **Rat-frogs are faster and psychic:**
  - Shorter pauses between leaps, and leaps up to 430 units/s, still aimed at where Chris is heading.
  - Every 3.5–5.5s, within 380px, a frog stops and crouches, its eyes flash purple (0.55s warning, with a `psy` sound), then it fires a **telekinesis ray**: 10 psychic orbs streamed 45ms apart along one big lobbed arc that lands where Chris will be. The orb gravity scales with difficulty so the arc still lands on Easy and Hard.
- **Tyre piles removed** from L2. Giant mushrooms looming in the background, plus more mushrooms, reeds and stalks, replace them.

### v0.88 — Rat-frog pack: tongues, pounces, a pattern you can learn
The telekinesis ray is **saved for later**: `psyRayStart(e, toP)` and `psyRayUpdate(e, dt)` can be called from any enemy AI. The rat-frogs (`frogAI`) now work like this:
- **Slime shield:** sitting or approaching frogs take no damage. Shots plink off with a glint (`hitK()` = 0, `deflect()`). A one-time banner explains: "SLIME SHIELD! HIT THEM WHILE THEY ATTACK - OR BASH!"
- **Pack spacing:** each frog stays on its own side of Chris, 170px out plus 55px for each frog ahead of it in the queue, hopping to reposition.
- **Taking turns:** only one frog lashes at a time (`frogNextLash`, 1s apart), and the pack alternates low and high tongues.
- **The tell (0.65s):**
  - **Low:** squats flat with a GREEN throat sac. The tongue skims the floor (h 14), so JUMP.
  - **High:** rears up tall with a PINK throat sac. The tongue is at chest height (h 32), so DUCK.
- **Lash:** the tongue shoots out 245px in 0.16s, holds 0.22s and retracts in 0.3s. It's pink, drawn along the planet's curve.
- **Grab:** if it touches Chris, it reels him in at 175 units/s. Escapes:
  - mash JUMP 3 times to break free (the frog is stunned);
  - shoot the open mouth for 2+ damage and it lets go.

  Reeled all the way in means a CHOMP: one hit and Chris is spat out.
- **Pounce:** if Chris gets within 105px, the frog leaps at where he's going (3s cooldown). On landing it splashes spores both ways, then flips belly-up, stunned for 0.95s, with no contact damage while stunned.
- **Damage:** mouth open (lash or grab), mid-pounce and stunned frogs take ×2 damage. A BASH always lands full damage and stuns for 1.1s. Hot Sauce burns them at half rate.

### v0.89 — Goop grips the jet boots
- **Suction zone:** within 46px above a goop pool, the muck clings to the jet boots:
  - jet thrust ×0.85;
  - max climb speed ×0.3 (78 instead of 260);
  - an extra 320/s² of drag pulling down;
  - sideways speed ×0.4;
  - goop drips off the boots.
- Jetting out takes about a second and burns about 40% of the fuel tank. The two weak jumps are usually the better way out.
- A hop out of the goop arms the jetpack at once, so holding jump starts the slow struggle straight away instead of never lighting.

### v0.90 — Baron von Blue rebuilt
- **Gone:** the spore rain falling from the sky. Every attack now comes from the Baron himself.
- **Bigger:** boss scale 1.35, up from 1.12 (`boss.scale`).
- **Fast:** he hunts Chris at 225 units/s (270 when angry, about Chris's own run speed), weaving over his head at a lower height (165). You can't stand off and plink him.
- **Evil animated face (overlays, `drawBaron`):**
  - 3 mouth frames: `baron_m0` hooked-up sneer with fangs, `baron_m1` snarl, `baron_m2` dropped-jaw ROAR with long fangs, tongue, uvula and drool;
  - red slit pupils (`baron_pupil`) that follow Chris;
  - green drool dripping;
  - he CACKLES every 4.5–7s ("nyeh-heh-heh", jaw flapping) and after landing a flail hit;
  - he growls and ROARS wide 0.45s before spitting (the tell).
- **Spiked flail** (`spikeball` on a drawn chain):
  - **Hang:** swings like a pendulum 95px under his fist. It clips you standing but misses you ducked, so duck under it or keep moving.
  - **Whirl (tell):** 0.85s (0.65s angry) of whirling it over his head, faster and faster with swishes.
  - **Throw:** hurled straight at where Chris is heading (up to 300px), a clang at full reach, then reeled back. When angry he throws twice in a row.
- **Other attacks:**
  - roar-telegraphed aimed spore triple from the mouth (every 3.4s, 2.4s angry);
  - a spore ring every 6.5s (5s angry);
  - germ and stink-fly pals only in phase 2.

### v0.91 — Gorgonzola Gulch's new look
- **Planet:** a pixel surface (`surface`) in dark slate-blue tones with green moss spots in place of holes, and a ragged mossy-green crust round the edge. This uses the new `makePlanetTexture` options `rim` and `spot`; the shading overlay takes `rimLight` and `dark` colours.
- **Neon rim:** `rimGlow` draws a pulsing green glow ring and a bright highlight line round the planet's edge.
- **Sky:** darker. `nebula` adds 4 big swirling turquoise pixel nebulae (`neb2_0..3`, made at boot onto the sheet) drifting slowly overhead, plus 26 four-point sparkle stars in white, mint and cyan.
- **Glow:** props can now take `glow`/`glowA` for a soft pulsing additive halo. Mushrooms (cyan-tinted), the big background mushrooms and crystal spikes glow. Goop pools get a green glow underneath. All glows are off on LOW graphics.

### v0.92 — L2 skyline
- New pixel art:
  - `bg_ribcage`: a dead space-beast's arched spine with ribs hanging to the ground, near and far ribs shaded;
  - `bg_skull`: a horned beast skull with teeth and a faint glow deep in the eye socket;
  - `bg_shroom`: a tall curvy bioluminescent mushroom with gills and glowing spots;
  - `bg_shroom2`: a smaller pair of mushrooms.
- They stand on L2's skyline at depth 0.95, below the planet surface (1.05), and sunk 18–30px. They rise from **behind** the curve of the horizon, tinted and faded into the haze so they read as distant. The mushrooms carry the soft cyan glow halos.
- The cartoon bone piles are cut from 5 to 2.
