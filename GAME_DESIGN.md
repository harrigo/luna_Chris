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

### v0.93 — L2: purple quicksand pits, contrast, dark rocks, composed skyline
- **Goop is purple** and redrawn as a **sunken pit:**
  - the glossy rippled surface sits flush with the ground;
  - the walls slope inwards to a flat bottom, with shadowed sides and a dark outline;
  - bubbles, splashes and the glow underneath are purple too.

  How deep Chris sinks now tapers to nothing over the outer quarter of each pool (`edgeK`), so his feet never poke out below the pit as he wades in or out.
- **More contrast:** a near-black sky, a darker slate planet and darker shading, a brighter neon rim, fewer dust blobs, and the skyline layer tinted darker so the bright foreground stands out.
- **Dark rocks:** two new mossy basalt boulders (`rock_dark`, `rock_dark2`). There are 10 behind Chris and 2 small ones in front.
- **Skyline composed by hand:** props can now take `at: [[theta, scale, flipX], ...]` instead of random spread. L2's skyline alternates tall mushroom, ribcage, small mushroom pair, skull and so on around the planet, so it reads as a rhythm rather than random clumps.

### v0.94 — Stomp → boost chains
- **Head-bounce refuel:** stomping an enemy (`stompBoost()`) adds half a tank of jet fuel, re-arms the jetpack and resets the hold timer. Keep holding jump through the bounce and the boots light as you rise. You can chain stomp, boost, stomp, boost across a crowd.
- Feedback for the refuel: a "BOOST!" pop-up, a `charged` chime and the fuel bar flashing white.
- **The jet never slows a bounce:** thrust can only add lift (`max(vh, ...)`), so a 440–520 bounce keeps its full height and the jet takes over as it slows.
- **Air trickle:** after half a second off the throttle in mid-air, fuel trickles back at 30% of the ground rate.

### v0.95 — The new rat-frog
- Redrawn after the reference sheet (`drawFrog` in src/levels.js):
  - a hunched, mottled olive body with a brown back, warts and a pale belly;
  - long green frog legs and feet;
  - a curly pink worm tail with rings;
  - a little pink ear;
  - a rat snout with a pink nose, whiskers and buck teeth;
  - a huge red-rimmed, bloodshot, bulging yellow eye.
- **Frames:** `frog` (idle), `frog_blink`, `frog_crouch` (just before a hop), `frog_leap` (stretched out with legs trailing), `frog_open` and `frog_open_c` (jaw dropped with tongue and drool; the crouched version is for the low-tongue tell).
- **Which frame shows when (`frogAI`):**
  - in the air or pouncing: leap;
  - about to hop: crouch;
  - tell, lash and grab: mouth open (crouched for a low tongue);
  - stunned: eyes shut;
  - idle: blinks every ~3s.

### v0.96 — The Great Grater becomes a cheese factory (first pass)
After the "Planet Grat'o-Cheese" concept art, in our 16-bit style (`makeFactoryTextures` in src/levels.js):
- **Planet:** a polished steel dome (`makeMetalPlanet`, via `surface.grater`):
  - brushed steel lit from the top-left;
  - concentric riveted panels and radial seams;
  - rings of almond-shaped grater holes, each with a sharp bright cutting lip;
  - a polished rim.
- **The grater floor** (the conveyor mechanic is unchanged): dark steel teeth with bright honed edges. Platforms are steel with yellow-and-black hazard stripes.
- **Sky (`bgDecor: 'factory'`):**
  - near-black, with big rusty and iron cogs (`cog_big`, `cog_mid`, `cog_small`, spoked, with bolts and rust) turning slowly in the dark at different depths;
  - the big cogs mesh with a smaller partner spinning the other way;
  - **the Claw:** a hydraulic arm with a hazard collar and three rusty prongs gripping a big block of Swiss. It hangs down towards the planet, sways, and sheds a stream of grated cheese that falls towards the planet (`radial` and `emit` support in the sky loop).
- **Skyline:** steel scaffold towers with hazard walkways, crates and beacons, plus stacked crates, standing behind the horizon.
- **On the deck:**
  - red and blue warning beacons flash alternately with real glow (new prop options `blink` and `blinkOff`);
  - steel drums with hazard bands, pipes, cones.
- **Gone:** the old scrap piles, bones, tyres, whisks, skulls and faint gears.
- **Enemies:**
  - **goggle-rats**, new: factory rats in boiler suits with hazard belts and green welding goggles (hp 3, run-and-hop rat AI). They join all three waves.
  - The **drone is now a flying pizza cutter:** a steel cutting wheel with an angry red hub-eye on a wooden handle, pushed along by a red rocket. It's used wherever drones appear.

### v0.97 — Planet Grat'o-Cheese gets teeth
Every new threat has a tell and a counter you can learn:
- **Welder rats** (`welderAI`; the goggle-rats now carry a riveted riot shield and a blowtorch):
  - the shield faces the way the rat faces, so shots from the front plink off (`hitK` = 0);
  - they plod towards Chris and are **slow to turn**: 0.7s after you get behind one, it swings round with a clunk. Jump over one, or go round the planet, and shoot its back;
  - close up in front: goggles down and blue sparks (0.5s tell), then a **blowtorch blast** (0.7s, 82px ahead). It drops its guard while torching;
  - stomps kill them, and bash ignores the shield.
- **Pizza-cutter drones lock on:**
  - hover, then a faint red **laser sight** tracks Chris (0.75s);
  - it **freezes and blinks** (lock, 0.4s);
  - it **dashes straight down the line** at 520 and carries on past;
  - if it hits the floor, it **jams in the grater** for 1.4s, wheel screaming and sparking, and takes ×2 damage. Sidestep the line, then punish.

  This applies wherever drones appear, ghost milkmaids included.
- **The Claw drops cheese blocks** (`clawDrops`, every 6–9s, max 3):
  - a pulsing red ring and a line from the sky mark the spot (1.2s, alarm);
  - the block slams down: it crushes Chris and squashes rats;
  - it then sits as a platform (`dynLedges`, which `floorAt` reads), which also keeps you off the grater blades;
  - shoot it apart (6 hp, 35% chance of a cheese wedge), or it crumbles after 12s.
- **Steam vents** (L3 geysers with `puff: 'steam'`, `vent: 'steamvent'`, `float`): hissing puffs warn (1.1s), then a scalding column of billowing steam (1.2s, 170 high). Puffs can float without gravity and grow (`noGrav`, `grow`).
- Waves have 8, 11 and 14 spawns, mixing welders, drones and slicers.

### v0.98 — L3 harder; no stomping saw-blades
- **Saw-blades can't be stomped:** landing on a slicer cuts Chris (a hit), flings him up and off, and shows "OUCH! NOT THE SAW!"
- **Saw-bots leap:**
  - they roll faster (135);
  - they throw discs more often (every 1.8–2.8s at 270);
  - every 2.8–4.2s within 90–320px they **rev up**: spinning faster, sparking, with a grinding whine (0.6s tell);
  - then they **leap** in an arc at where Chris is heading and land with a clang. Run under or away.
- **Welders:** turn after 0.45s (was 0.7), walk at 82 (was 58), torch reach 95 (was 82), torch cooldown 1.3s.
- **Drones:** aim 0.6s, lock 0.35s, dash at 620, back on the attack every 1.2–2.2s.
- **Claw drops:** every 3.5–5.5s, up to 4 blocks.
- **Steam vents:** 7 vents, erupting every 2.5–5s.
- **A new WAVE 4:** 17 spawns, a dense mix of welders, drones and saw-bots.

### v0.99 — Mount Mozzarella: the cosmic pizza oven (first pass)
Built from the "How to build Mount Mozzarella" brief (`makeOvenTextures`):
- **Terrain:**
  - a wood-fired pizza planet: a white mozzarella surface over a thick, ragged, charred crust band (new `rimD` option for crust depth);
  - burnt black patches and molten-cheese craters glowing orange;
  - an orange neon rim and a hot orange atmosphere glow.
- **String-cheese pits** (`goopMode: 'string'`, reusing the goop system with its own texture, bubbles and glow):
  - a crater of boiling mozzarella with a charred lip, dithering into the planet's cheese;
  - fall in and **stretchy strands grab Chris**: he can't move, and the strands are drawn and wobbling, thinner with every mash;
  - **mash jump ×3 to tear free** (the strands snap and fling him up with the jet armed);
  - every 1.3s stuck **burns** for a hit, with an orange flash as warning;
  - a brief grace after escaping so you don't re-stick.

  This is deliberately different from L2's goop, which slows you rather than grabbing.
- **Mozzarella Magma-Golem** (`mgolem`, replacing the gouda golem on L4):
  - a lumbering melting-mozzarella brute in crusty charred armour plates with glowing cracks;
  - the armour takes **half damage** and chips fly off;
  - below half health it cracks open ("ARMOUR CRACKED!", crash) into a molten form (`mgolem_hot`) with glowing veins that takes ×1.3;
  - it lobs arcing molten-cheese blobs.
- **Rocket rats** (`rocketrat`, replacing flyers on L4): amber blast goggles, oven mitts and a rocket pack. They park **right above Chris** and drop **sizzling pepperoni bombs** that blink as they fall, then burst on the crust into 6 arcs of greasy shrapnel.
- **Sky (`bgDecor: 'oven'`):**
  - deep oven-red to black;
  - 12 parallax layers of thick greasy black smoke (dithered `smokecloud` textures);
  - glowing embers rising across the whole screen;
  - the **rat UFO with Bessie in its beam** far off in the smoke, a constant reminder of the chase.
- **Unchanged:** the string-cheese whips (now every 2.6–4.5s) and the Pizza Oven boss.
- **Decided against:** a mechanical pizza-slicer mini-boss, since it would repeat L3's blades (Mega-Mandoline, saw-bots, pizza-cutter drones).

### v1.00 — The Brie-muda Triangle: graveyard of lost ships and cows (first pass)
Built from the brief (`makeBrieTextures`):
- **Terrain:**
  - a wheel of Brie: a powdery white rind crust (`rimD` 0.93) over a creamy paste, with a lilac neon rim;
  - **squishy ground (`squish`):** on the rind Chris is slidey and sluggish (run ×0.82, grip 2.4 instead of 12, so he slides on after letting go), sinks 5px into the fuzz and kicks up powder puffs when he lands. In the air and with the jet he moves normally, and ledges are firm.
- **Graveyard:**
  - huge bone-white ribcages and horned skulls of ancient space-livestock, half-swallowed by the Brie (new white variants `bone_ribcage` and `bone_skull`);
  - bone piles and skulls;
  - **giant femur platforms**: a new platform type, `bone`.
- **Atmosphere (`bgDecor: 'haze'`):**
  - a deep purple sky;
  - drifting background fog;
  - 34 glowing geometric **triangle anomalies** (`tri_p`, `tri_c`, `tri_k`) in purple, cyan and pink, spinning and twinkling;
  - **spectral lights**: coloured halos that sweep slowly over the pale ground;
  - **foreground fog banks** drifting IN FRONT of everything, sometimes hiding incoming hazards.
- **Phantom pirates** (`ghostpirate`, flyer AI): glowing green ghost rats in tricorn hats and tattered coats, with cutlasses. Their bolts (`tribolt`) **zig-zag in sharp triangular turns**, with the sideways push flipping every 0.25–0.42s while drifting at Chris.
- **Poltergeist wedges** (`polterwedge`, `polter` AI), spectral cheese slices with hollow eyes, in a cycle:
  1. **ghost** (faint, drifting): shots, blasts and the beam pass straight through, and it can't hurt you;
  2. **flicker** (0.4s tell);
  3. **solid** for 1.3s, swooping at you: hit it then.
- Waves are rebuilt around pirates and wedges, with some ghost milkmaids. The boss is still the Phantom Milkmaid for now.

### v1.01 — Cheddar Gorge: the chase (first pass)
Built from the brief (`makeGorgeTextures`):
- **The chase:**
  - On a tiny round planet a literal side-scrolling camera can't work, so the **Pepper Jack is the scroll**. It rolls after Chris without stopping and speeds up every wave, so standing still is never an option.
  - The wheel has a spinning rind (`jack_rind`) and a separate **upright furious face** (`jack_face`) that doesn't spin, like the concept.
  - **Run over:** lose 2 hearts, flung up and ahead ("FLATTENED!").
  - **Pinned** between the wheel and a tortilla chip: **instant crush** ("SQUASHED!"), costing a life.
  - It **spits spicy pepper shrapnel** up and forward (every 2.5–4s).
  - It **sends mini wheels** racing ahead (every 7–10s, max 3; `miniwheel` AI: flat-out rolling with hops, overshooting and turning).
- **Swapping matters:** a Swiss-Shot blast that catches the wheel **stuns it** for 1.8s ("STUNNED!", dizzy face, rolls back). It also smashes chips with double damage. Normal shots only slow the wheel a touch. The rhythm is: swap to Swiss to stun behind, swap back to clear the way ahead.
- **Tortilla-chip stalagmites (`chips`):**
  - 10 razor nachos (`nacho`) jutting from the crust, solid to Chris below 52px high;
  - shoot them apart (4 hp);
  - they regrow after 22s when you're not close;
  - a 30% chance to drop a Jalapeño Boost.
- **Craters (`craters`), drawn into the curved surface:**
  - **bottomless pits**: black voids with crusty lips. Fall in and Chris drops away ("AAAAARGH!") and is hauled out further along, a heart lighter. **Jet over them.**
  - **speed bumps**: shallow bowls where running drops to 45%.
- **The boss, the Core of the Wheel:**
  - the Pepper Jack's rind armour takes normal damage;
  - below 45% health **the rind cracks open** to show a gooey molten core with one big bloodshot eye (`jack_core`), and it rolls 25% slower;
  - normal shots barely scratch the core (×0.12). Only a **charged Swiss-Shot blast into the eye** does real damage (45, "BULLSEYE!").
- **Jalapeño Boost** (new power-up, from L6): a green-hot jet (×1.7 climb, unlimited fuel) with a flame trail that scorches enemies behind and below and **stalls the wheel** if it gets close.
- **Look:** small ruined citadel spires with lit windows on the skyline (`bg_spires`) and dark rocks. The orange pitted planet, cosmic sky and distant UFO stay.

### v1.02 — Better keyboard + mouse controls, context-aware controls help
- **New keyboard/mouse bindings:**
  - **SHIFT**: jetpack right away (like LT on a pad);
  - **E** / **Q**: swap gun forwards / backwards (C and the mouse wheel still work);
  - **1 2 3**: pick a gun directly;
  - **J**: fire and **K**: bash, for keyboard-only play (Z/X and F/V still work).

  The full set is A/D or arrows run, SPACE/W jump (hold = jet), S/down duck or dive, mouse aim, left click fire (hold = charge Swiss), right click bash, ESC/P pause.
- **Which device you're on:** `inputDevice()` remembers the last thing you used (key or mouse press, touch, or pad button), falling back to pad if one is connected, then touch if the device has a touchscreen, otherwise keyboard.
- **Pause > CONTROLS:** shows the scheme for that device as a tidy two-column list (keys in yellow, right-aligned; actions left-aligned), plus tips about bashing, stomp refuels and Swiss charging. A **SHOW** line flips between keyboard, controller and touch. The main menu's CONTROLS page works the same way (`CONTROL_SETS`, `controlItems`; `makeMenu` info lines can now take a `key`).
- **Level-start card:** shows the short version for your device and points to PAUSE > CONTROLS.

## v1.03 — Online high scores (onlimey.com)
- Each level has its own top 10 on the onlimey.com leaderboard (`luna-chris-1` … `luna-chris-9`, `luna-chris-5-5`), since the score starts from zero every level. Client: `src/board.js`.
- A run token is fetched when a level starts from scratch and kept through checkpoint retries, so the server can check the score was reachable in the time played.
- On LEVEL CLEAR (after the rank slams in) and on GAME OVER, a score that makes the top 10 pops a pixel name box over the game: the board with YOU? slotted in, a name field (remembered), SAVE / SKIP, then the updated board with your row highlighted. Controller: A saves (remembered name or CHRIS), B skips. Keys typed in the box don't reach the game or the cheat code; phones only get the keyboard when they tap the field.
- Cheat-mode scores are never offered. If the server can't be reached, nothing shows.

## v1.04 — Aim anywhere, music that builds wave by wave
- Twin-stick, mouse and touch aim now cover the full half-circle, straight down to straight up (was -34° to +72°). Shots aimed into the ground spark off it; the spaghetti beam stops at the ground and is hit-tested as a segment, so steep aims connect.
- Level tunes build with each wave: wave 1 is lead, bass and drums; wave 2 adds the arpeggio; wave 3 adds an octave-up sparkle on the lead and running hi-hats; wave 4 on lifts the key a whole tone, 6% faster, with an echo on the lead.
- Clearing a wave asks the music for a FILL: the tune carries on to the bar line that leaves room for one (12–27 steps away), the melody drops out under a snare roll and a tom run with a rising whoosh, a crash lands on the downbeat, the song restarts from the top at the next intensity, and the next wave launches on that beat. No fill before wave 1, into the end of the level, or with sound muted/off (then the old 1.4 s gap); a 6 s safety net if the music never answers.

## v1.05 — Plough the small fry, bounce off the big ones
- Stomping a little enemy (mice, flyers, germs, drones...) squashes it and Chris keeps falling (faster in a ground-pound) straight into the next one: no bounce. It still refuels and re-arms the jetpack, and gives 0.3 s of safety so landing in a pack doesn't hurt.
- Big enemies (golems, frogs, magma golems, paladins) bounce Chris back up and away (a sideways shove so he doesn't drop straight back on), always take two stomps (a ground-pound only hits harder), and each has a 0.45 s stomp cooldown so one landing can never count twice.

## v1.06 — Music tiers retuned
- Three arrangements instead of four, picked by the wave's place in the level (`musicTier`): the first wave is lead, bass and drums; the middle waves bring in the arpeggio, the octave-up sparkle on the lead, running 16th hats and four-on-the-floor kicks all at once (a clear lift); the last wave before the boss gets the key change (+2 semitones), 6% tempo and the echo. The boss keeps its own unchanged tune.

## v1.07 — Big-enemy bounce can't be cancelled
- Holding down (drop / ground-pound) used to clamp Chris to falling every frame, which swallowed the bounce off a big enemy. A big-enemy stomp now sets a 0.45 s bounce window in which diving is off, and the bounce is a bit stronger (480, 560 from a ground-pound).

## v1.08 — Music: layers, not a new song
- Dropped the key change, tempo bump and echo. Same key and tempo all level; the waves only add layers: wave 1 lead/bass/drums, middle waves + arpeggio and running 16th hats, last wave + octave sparkle on the lead and four-on-the-floor kicks. The climax is left to the boss's own tune.
- The fill into the boss ends on a lone crash that rings out into silence; the boss now spawns 0.6 s into its wave (was 1.5 s), so its tune hits right after the hush.

## v1.09 — Where are they? Edge arrows + planet radar
- Every enemy off screen gets a chunky pixel arrow on the side it's coming from, at the height it's flying (a flyer up high shows near the top, a ground rat near the horizon). Closer = bigger and brighter; about to come into view = blinking. Yellow = small fry, orange = big ones, red = the boss.
- Landscape screens also get a little planet radar under the cow track: the planet in its own colour, Chris blinking on top, the slice of the world you can see lit cyan on the rim, and a dot for every enemy round the world (further out the higher it flies, bigger for big ones and the boss).

## v1.10 — HUD speaker + planet mini-maps
- The floating emoji sound button is gone. Sound is a little pixel speaker in the HUD, top right above MENU (tap or click it; red cross when muted), and still SOUND in the pause and main menus.
- The radar now sits in a chunky HUD panel, and its planet is drawn in each level's style, spinning as Chris walks: L1 a lumpy yellow cheese moon with holes, L2 slate with blue veins, a neon moss rim and glowing mushrooms, L3 a steel cog with grater slots, L4 a pizza (crust, sauce, mozzarella, pepperoni) with a smoking volcano, L5 a soft, slightly squashed brie wheel in purple haze with its triangle. Other levels keep the plain planet for now.

## v1.11 — Tidier top right
- Sound lives only in the pause menu (and main menu): the HUD speaker is gone.
- The radar moves into the top-right corner (a 58px panel); the cow track shifts left to make room, MENU and PAUSE sit under the radar, and the version number moves to the bottom-right corner.

## v1.12 — The Croque Monsieur in three acts; shootable missiles
- Act 1 (full to 2/3 health) is the old fight: slow drift, side-cannon meatballs, belly crumb fan, body slam if you camp underneath.
- At 2/3 it ROARS (shakes, flashes red, screen shake, banner), cracks and turns redder. Act 2: it hunts, racing across the sky to get over Chris's head, shudders (0.5 s tell) and slams; shockwaves and a meatball spray on landing, then it sits low (the window to hit it) and fires both cannons while it recovers. It doesn't shoot while it's hunting. The halfway cheese wedge now drops here.
- At 1/3 it roars again and starts falling apart: more cracks, glowing and smoking. Act 3: triple-spread cannons, a 7-crumb belly fan, a pair of homing toast missiles from the top hatches every 3.4 s, and it still hunts and slams (a little slower).
- The toast missiles can be shot down (+100). Ordinary bullets still can't: dodging them is the game; only the big, slow, homing things are targets.
- Radar panel now mirrors Chris's portrait box (48 px, 10 px in from the corner). Banners drop below the boss health bar during a boss fight.

## v1.13 — Level 2: three-act Baron, three waves, goop-stuck frogs, visible ricochets
- Level 2 drops its fourth wave (three waves, then the Baron), like level 1.
- Baron von Blue gets the same three acts as the Croque. At 2/3 health he roars (jaw wide, green flashing, shake), cracks with mouldy fissures and goes greener; act 2 he hunts, racing over Chris's head, shudders and BELLY-FLOPS: a spore wash skims the floor both ways (jump it) and spores spray up and rain down, then he sits in the muck for a second (hit him). No flail or spitting while he's diving in. At 1/3 he roars again and the cracks glow; act 3 adds double flail throws, a five-spore spit, pals, and a pair of homing mould rockets every 3.6 s that you can shoot down (+100).
- Rat-frogs and goop: a frog that lands in a goop pool hops straight back out, unless Chris is shooting, when it panics and gets STUCK for 1.8 s, sunk to the armpits and struggling, with no slime shield (double damage). First time: "STUCK IN THE GOOP!" banner.
- Shields are obvious now: a shot that hits a shield ricochets back the way it came and up, turned pale green and harmless, and a ring of shield flashes round the enemy, with the clang.

## v1.14 — Level 3 fix and trim
- Fixed a crash ("face.destroy is not a function") when a welder rat died: its `face` is the way it's looking (a number), not a sprite, and the clean-up tried to destroy it.
- Level 3 drops its fourth wave: three waves, then the Mega-Mandoline.

## v1.15 — Level 2 harder: frogs that keep their distance
- Rat-frogs retreat properly again: if Chris gets within 150 px they hop back out to their spot (and further if needed), faster hops; rush one mid-tell (under 95 px) and it bails and hops away. Up close with its pounce ready it still POUNCES.
- The goop trap is now what was asked: only a frog that's RUNNING AWAY from Chris while he's shooting lands badly in a pool and gets stuck (1.3 s). Otherwise frogs hop straight out of goop.
- Tougher: frog hp 5 → 6; their open moments (tongue out, pounce, stuck) now take 1.5x instead of 2x (flipped over still 2x); the pack lashes a little more often; an extra frog in wave 2 and two in wave 3; Baron hp 160 → 175.

## v1.16 — Goop that's part of the planet
- The goop pools (L2 purple quicksand, L4 string cheese) are no longer a flat sprite laid on the curve: each is drawn every frame along the planet's curve as a pit cut into the ground (dark banks level with the ground, flat bottom, steep sides) filled with layered murk and a glossy skin that sits just below ground level and meets it flush at both ends.
- The surface is alive: a slow swell all the time, a churning wobble round anything standing in it, and rings that spread out when something splashes in or wades about (Chris, frogs, germs...; bigger for big enemies). Murky swirls drift in the depths and glints slide along the top.

## v1.17 — A bit more British
- Title and menu subtitle: "RETIRED CHEF, EX-ASTRONAUT, HERO" (was "SPACE-RANCH HERO").
- The ranch is a farm: "SPACE FARM NO. 9" in the intro and ending, "the whole farm is overflowing".
- Chris flips burgers, not flapjacks: the flipped (and helmet-landing) pancake is now a sizzling burger with a drip of cheese, the telly's cooking show flips a burger, the ending's stack is burgers, and the credits have a BURGER CONSULTANT.
- The cabin's homelier: a brown betty teapot in a red, white and blue knitted cosy (steaming) on the coffee table, a mug of tea instead of cocoa, red-white-and-blue bunting along the beams, a dartboard, a biscuit tin on the bookshelf, green wellies by the stove, and a Union Jack cushion on the sofa.

## v1.18 — Hints, not flags
- No Union Jack: the sofa's back to two cow-print cushions, the tea cosy is mustard with cream and green stripes, and the bunting is a faded village-fete mix.
- A back door on the right of the cabin with a waxed jacket on the hook, and muddy green wellies kicked off in front of it, with muddy footprints.

## v1.19 — In through the back door
- The cabin scene starts with the back door swinging open (night sky outside) and Chris walking in from the right in his muddy green wellies. He kicks them off by the door (they stay there, by the muddy footprints) and pads over to the fireplace in red-toed woolly socks.
- His space boots are in the armoury behind the fireplace with the guns: when it spins round they hop out onto his feet ("ON GO THE SPACE BOOTS..."), then he grabs the Mac-Grinder.
- Narration now matches the animation: "AND THE APRON SPINS ROUND... INTO A CAPE!"

## v1.20 — Proper wellies, a dog that keeps its words
- Wellies redrawn as wellies: tall green rubber shafts up the shin with a rolled rim, round toes, chunky tread, a rubbery shine and mud caked round the feet (on Chris at home, and the pair by the back door, one slouching).
- Speech bubbles can follow whoever's talking: the dog's ARF! / WOOF! WOOF! (intro and ending) now stay over the dog as it bounds about.
- The "rotate your phone" screen says RETIRED CHEF, EX-ASTRONAUT, HERO too.

## v1.22 — Baron von Blue, rotten
- New look: a lopsided mass of fuzzy, rotting blue cheese (a swollen lump on one side, a knot of mould on the other, a belly that sags), cratered mould pits with teal mould in them, pulsing purple-pink veins, slime dripping off his underside (and constantly dripping as he moves), a rusty jagged tin-can lid smashed into his head at an angle with its ring pull sticking up, one huge bulging bloodshot eye that stares at Chris and one tiny squinting one that twitches, and broken yellowed bone-chunk teeth (and a rusty shard) at awkward angles in all three mouths.
- He jiggles: the whole body wobbles and warps like jelly, sloshes when he moves, squashes when he flops, swells when he inhales.
- The spiked flail is gone. He has two grotesque mutated rat claws on long, elastic, bubbling strands of mould: they hover at his sides; one pulls back and trembles (the tell), then PUNCHES out at where Chris is heading and snaps back like a rubber band (in act 2+ the other claw follows straight after). Only a punching claw hurts.
- INHALE... COUGH replaces the spore spit: he sucks in (a sigh, and he visibly swells), then hacks out 2/3/4 (by act) big bubbling globes of toxic blue cheese that lob over and SPLAT into pools of acid on the ground for 5-6 s. Standing in one hurts: jetpack over them. First time: "ACID! JETPACK OVER IT!"
- The SCREAM replaces the spore ring (every 11/9/7 s by act): jaw wide, a big shake, the giant ribcages and skulls on the skyline rattle, and 5-7 chunks of bone rain down near Chris, each throwing a shadow that grows as it falls (first time: "WATCH FOR THE SHADOWS!").
- Still has the three acts, the hunt-and-belly-flop and the shootable mould rockets.

## v1.23 — No stragglers after the boss
- When a boss dies, every other enemy still about pops with it (and germs no longer split once the boss is down), its acid pools dry up, and the level completes straight away. Before, the Baron's act-3 pals (germs that split into mini-germs, stink-flies) could be left over and had to be hunted down before the level would finish.

## v1.24 — The rat-frogs, mangier
- Redrawn as mangy mutant swamp rats that pop off the dark ground: lighter purple-brown fur with a toxic neon-green rim light and spiky mangy fur along the spine and head, glowing purple veins, raw bald patches with green pustules, a long naked pink tail, claws dug into the turf, yellow buck teeth and fangs, ropes of drool, and a HUGE red-veined yellow eye that glows (a halo behind it, brighter when it attacks). Open-mouthed it lunges forward with its snout thrust out.
- While it reels Chris in, its pin-prick pupil twitches about and its body strains (hunched and trembling).
- The tongue is fat, wet and elastic: thick at the mouth tapering to a sticky blob, rippling as it shoots out and sagging under its own weight, taut and trembling while it reels you in, with a wet shine and drool dripping off it.

## v1.25 — Tongue out of the mouth
- The tongue is drawn BEHIND the rat and starts inside its open mouth, rising from the mouth to strike height, so the open jaw unveils it as it shoots out (before, it sat on top of the rat and read as the rat bloating).
- The swelling throat-sac circle in the tell is gone; the tell is now the open mouth plus the posture (squats flat for a low lash, rears up tall for a high one).

## v1.26 — Caught on a tongue
- When a rat grabs Chris with its tongue his gun is out of action: it won't fire (or charge), and he waves it about hysterically, flapping his other arm too, so it's obvious.
- Break free with a DOUBLE JUMP (two jump presses): he tears loose, springs up with the jetpack re-armed, and the rat flops over stunned. The banner says "GRABBED! DOUBLE JUMP!". (Shooting it in the mouth no longer makes it let go: you can't shoot.)

## v1.27 — The rat goes head over heels
- When Chris double-jumps free, the tongue snaps back and yanks the rat clean off its feet: it's flung up and backwards, somersaults one and a half times (spinning round its middle), and lands flat on its back with a squelch, a puff of dirt and a squash. It lies there rocking with its legs kicking in the air and dizzy stars over it for about 1.9 s (shots do double damage), then rolls back onto its feet with a hop.

## v1.28 — Snappier escape
- Breaking free now happens the instant the second jump is pressed (handled right in the jump input, not on the rat's next update).
- The flip is quicker: a lower toss, the somersault done in 0.5 s, and about 1.15 s stunned in all before it's back on its feet.

## v1.29 — Stick-up jump for controllers
- New option PAD STICK-UP JUMP (pause menu and main menu options, off by default, saved on the device): pushing the left stick clearly up jumps, holding it up keeps the jetpack going, and pushing it right to the top fires the jetpack straight away, just like the touch stick. It needs a clear upward push (not a sloppy diagonal while running) and has hysteresis, so wobbling the stick can't double-jump. A still works as normal.
- The controller page of CONTROLS lists it.

## v1.30 — The belly, attached
- Chris's belly is now a round, bare belly bulging out from under his stretched suit: the hem (white, red trim) is part of the belly sprite and bows down over it where it's tightest, with a shadow where it digs in, a navel, a shine and an underside crease, pushing a little past the front of the suit. It's a bit smaller than the reference.
- It jiggles from the hem down but no longer slides about, so it stays attached; and the legs are now drawn behind the torso, so the belly hangs over them instead of being hidden by the front leg.

## v1.31 — Hand-pixelled body
- Chris's body is now hand-pixelled (44x42, facing right, outline included) and stored in src/chris.js as rows of palette letters (pixArt in src/textures.js draws it as-is, no automatic outline). A long white top with the red hem running unbroken from the back, rising over a small round belly at the front, with a 2x2 belly button faded into the skin. The belly is part of the body: no separate belly sprite and no wobble; the running bounce on the body is gone too.
- Legs are blue trousers with a red-and-white knee stripe, drawn behind the torso.
- To change it: edit the letters, or send a 44x42 PNG/GIF (pure black or transparent background) and it gets converted.

## v1.32 — Editable sprites folder
- assets/sprites/ now holds 284 sprites as PNGs (all the characters, enemies, bosses, props, pickups, HUD bits, intro scenery...), plus index.json listing them and a README. A PNG there replaces the drawn-in-code sprite with the same name; delete it to fall back to the code version. The big procedural textures (planet surfaces, nebulae, skies) and the auto-made glow variants stay generated.
- The deploy workflow packs them into one sprite sheet (tools/pack_sprites.py, Pillow: sheet0.png + sheet.json with a content hash for caching), so the live game loads them in two requests and adopts each frame straight onto the shared texture sheet. Without a sheet (running from the repo), each PNG is loaded on its own.
- Generators skip any sprite that came from a file (SPRITE_FILES / madeTex in textures.js), which also cut start-up texture generation roughly in half.

## v1.33 — Safe after the boss
- Once a boss is beaten, nothing can hurt or kill Chris for the rest of the level (volcano blasts, geysers, falling debris, pits, being squashed...): hurt() and die() both bail out while the boss is down. Before, a stray hazard could kill him between the boss dying and the rescue.

## v1.34 — Controller on a phone hides the touch controls
- With a gamepad connected to a phone, the on-screen sticks, BASH button and their labels are hidden as long as the controller is what's being used (any button or stick press). Touch the screen and they come straight back; press the controller again and they go. Touch input itself always keeps working.

## v1.35 — TEST: the cave under level 8 (Bessie's pump)
- A first feel-test for the cave idea, on level 8 (its waves and boss are switched off while `cave` is set in its level definition).
- On the surface, a glowing hole with a bobbing DROP IN! marker sits just ahead. Walk into it and Chris drops into a tunnel ring inside the planet (the world radius shrinks to the tunnel's, the surface is hidden): Swiss-cheese rock with holes above and below, a dark tunnel 170 high, and Bessie wired into a milking rig on the far side of the ring (two hoses up into the roof, a throbbing pump).
- The pump THUMPS on the beat (118 bpm, every 4 beats far away, every 2 close up, with doubles near Bessie). Each thump sends a wave of molten cheese rolling round the tunnel both ways: LOW (jump it) or HIGH (duck it). A beat before, the tunnel glows where the wave will be (orange low, cyan high) with a blip.
- The pumped cheese fills the planet: it rises from the floor (slow at first, then faster; full in ~150 s). Wading slows you; in over the knees it burns. A gauge at the top shows PLANET FILLING WITH CHEESE %. When it's full: "THE PLANET'S FULL!" and you lose a life.
- Six red valves hang from the roof: three shots each to vent one (+500, knocks ~22 s off the fill).
- Reach Bessie: BESSIE UNPLUGGED! (moo), the cheese drains, level clear. An arrow at the screen edge points the way to her.
- Placeholder art throughout; no enemies yet.

## v1.36 — TEST: the cave becomes a labyrinth
- No warp or fade: the hole in the surface is just a gap you fall down, and the camera slides down with you (and back up when you jetpack up a shaft).
- Level 8's planet is much bigger (radius 1100), so the tunnels run off both edges of the screen like corridors, and you can see the ring above and the ring below at the same time.
- Three levels underground, nested: tunnel ring 1, tunnel ring 2, then the core chamber. Each floor has a hole down to the next; you can jetpack back up through them. Rock walls block each tunnel so the way on is round the other way: LEFT in ring 1, back RIGHT in ring 2, then on to Bessie in the core.
- Each ring has its own pump outlet in the roof sending the jump/duck cheese waves (every 4 beats in ring 1, every 2 in ring 2, doubles in the core); walls stop the waves (and your shots).
- The cheese now fills the CORE ("BESSIE'S DROWNING IN CHEESE %", ~200 s); vent valves hang in the roofs of rings 1 and 2.
- An arrow at the screen edge points the open way to the next hole (or Bessie), and a bouncing marker sits over the hole when it's on screen. The corner map becomes a cave map: the rings, the walls (white), the holes (cyan), Bessie (flashing) and Chris.

## v1.37 — Route map + Zero-G Recoil Room
- The level select is now a Star Fox style ROUTE TO BESSIE map: planets joined by dotted routes with dots marching along them. 1 -> 2 -> 3, then the route splits: the main road (4, 5, 6) along the top, or the bonus route along the bottom (the BONUS star: the Zero-G Recoil Room, then the WARP portal: the Fondue Fountain), meeting again at 7 -> 8 -> 9. Every stop is open for now (testing). Tap a stop to see its name, blurb, rank and golden wheels in the panel along the bottom; tap it again to go. Arrows/D-pad move between stops along the map, Enter/A goes.
- BONUS: the Zero-G Recoil Room (src/zerog.js, its own scene). No gravity, no running or jetpack: the only way to move is the kick of the gun, so you fly AWAY from where you shoot (touch: hold/drag towards where to shoot; mouse: point + click; keys: arrows/WASD shoot that way; controller: right stick). A big panelled hangar (1500x900, the camera follows) with bouncing walls and seven round cheese bumpers that kick you like a pinball. Grab all 12 floating ingredients in 50 seconds for +1 LIFE; then back to the map.

### v1.38 — Zero-G Recoil Room, take 2
- **A way out:** an always-on `< MAP` button (top left; pressing it never fires the gun), plus ESC / controller BACK. The end screen has big MAP and AGAIN buttons (A / X on a pad, Enter / R on keys).
- **Shots leave the barrel:** each macaroni spawns at the rig's real gun tip (the auger's world transform), travelling the way the barrel points, with a muzzle flash and a puff of smoke.
- **The gun crate:** a padlocked crate floats in the middle of the room with the prize ghosted above it. Grab all 12 ingredients and it bursts open: the first gun not yet won here is yours for good (`Progress.hasGun/giveGun`, checked by `weaponUnlocked`). Once every gun is won, the prize is +1 life. (CFG.allWeapons is still on for testing, so the unlock only bites once that's switched off.)
- **Livelier:** parallax star layers and nebula glow behind the glass, a ringed gas giant, a scanline sweeping the floor grid, chase lights round the walls that flare where Chris hits, spinning cheese bumpers (two roam on loops) that pop and spark with BOING! text, glowing, twinkling ingredients, a blue drift trail, pickup bursts, +1s per ingredient and COMBO popups for quick chains, and the faster level-6 track.

### v1.39 — power-ups on the clock, and actually dropping
- **Parmesan Power-Up is timed:** 15 s (`CFG.powerT`), still knocked off early by a hit. `P.power` now holds seconds left.
- **HUD timer chips** under the portrait: one per thing running (Parmesan, then the timed power-up). A coloured ring round the icon empties as it runs down, seconds left underneath (shield also shows charges), flashing in the last quarter.
- **Drops:** the first big enemy still always gives the Parmesan. Every wave's first medium/big kill now always drops a timed power-up (then 1 in 4), picking ones you haven't had this level first. They no longer wait for the Parmesan to have dropped.
- **Earlier introductions:** Hot Sauce, Rocket Boots, Magnet Fork from L1; Fondue Shield and Gouda Gigantism from L2; Slow-Mo Brie and Rat Disguise from L3; Moo Bomb from L4; Jalapeno Boost stays on L6 (it's for the wheel chase).

### v1.40 — game over in mid-air
- If the last life goes while Chris is airborne, he drops to the floor first (heavy gravity, thud, dust, shake); the push-in, spotlight and helmet crack (`gameOverSeq`) only start once he's landed.

### v1.41 — loading screen
- A plain-HTML loading screen in `index.html` (#boot) is up the instant the page opens, before Phaser or any game script arrives: bobbing cheese moon, LUNA CHRIS logo, a chunky striped progress bar and a status line.
- `LCBoot.set(f, msg)` moves it: Phaser loaded (20%), each game script in `boot.js` (to 60%), the intro's asset/sprite-sheet load progress (to 82%), then "COOKING THE SPRITES" while `buildAllTextures` runs (IntroScene.create defers itself one tick so the bar can paint first). `LCBoot.done()` fades it out once the title is ready.

### v1.42 — Level 3: the Mega-Mandoline rebuilt (src/mandoline.js)
- **No more cheese falling:** the Claw's cheese-block drops and the background claw shedding gratings are gone.
- **It lurks overhead during the waves:** a dark Mega-Mandoline hangs high over the factory (red eye glowing, arms swaying) and attacks from above, alternating: a laser **ping** (a sight line tracks Chris, locks, then a short fat beam) and a slicer **blade** flung from its slot at a red target ring (sticks in the deck sparking, then yanked back up; it slices rats too).
- **New look:** a proper box grater: carry handle, tapered body, rows of raised grater holes, a serrated slicer slot, a big red laser eye in a chrome bezel under angry brow plates, a brass cog, wires, rivets, dents. Two jointed robot **arms** (pistons, red/blue hoses, hooked pincer claws) solved with 2-bone IK on screen.
- **Boss in three acts** (HP 150): 1) pings, claw **slams** (an arm reaches over Chris's spot, opens over a red ring, smashes down; the body dips to reach) and floor discs. 2) at 2/3 the eye charges and **sweeps**: a red strip shows the path, then the burning point runs along the floor, leaving scorch marks. Only where it meets the deck hurts: jump it as it passes. 3) at 1/3 it cracks, glows and sparks: sweeps go there and back, pings come in threes, both arms slam one after the other, discs at two heights.
- New sprite files: `mandoline.png` (120×128, replaces the old one) and `mblade.png`.

### v1.43 — route map: progression, test buttons, d-pad, Chris
- **Only level 1 starts open.** Beating a level opens the next (`Progress.best`); the BONUS Zero-G room opens after level 3 and rejoins at 4; the WARP (Fondue Fountain, 5.5) opens once its black hole is found on level 5, and beating it opens 7 (`Progress.secretBeat`). Locked stops are dark padlocked spheres, their routes faint; they can't be picked or played.
- **TEST buttons** (top right, green): OPEN LEVEL n (the next locked one), OPEN SECRET … (shows when the picked level has a warp in it), LOCK ALL (back to just level 1).
- **D-pad follows the routes:** left/right go to the previous/next stop along a route (main road first at a fork), up/down switch between the road and a detour.
- **Luna Chris jetpacks between stops,** bobbing over the picked one with a flickering flame, tilting as he flies.

### v1.44 — route map spiced up
- Nebula backdrop with twinkling four-point sparkles; ROUTE TO BESSIE in a framed gold banner.
- Each stop is the level's own pixel planet (its `surf` texture), sphere-shaded, with a glow; locked ones are darkened with a padlock and read LV. n / ???.
- World touches: flames on Mount Mozzarella, a ring round the Brie-muda Triangle, goop drips on Gorgonzola, a rat ship orbiting the Armada, and Bessie in the rat UFO's beam hovering over Parmesan Prime (the goal).
- Routes are chunky gold dots on gentle curves with a pulse marching along (orange on detours, faint while locked), starting at the planets' edges.
- **Secret stops are hidden** (no node, no route) until found: the bonus room after level 3 is beaten, the warp once its black hole is found.
- Bottom panels: the picked world (thumbnail, name, blurb, rank, its 3 wheels) and LIVES + total golden WHEELS found / 27.

### v1.45 — warp moves to level 3, three bonus rooms, boosting between stops
- **The warp's black hole is now on level 3** (The Great Grater), out of the ghost level. Smash the three relics, warp to the Fondue Fountain (5.5), come out at 7: skipping 4, 5 and 6.
- **Route map back to the arc layout:** the main road arcs along the top; bonus rooms sit above it after 3 and after 6 (each rejoins at the next level); the warp route runs along the bottom: 3 -> Fondue Fountain -> warp bonus room -> 7.
- **Three Zero-G rooms** (`ZeroGScene` with `{ room }`): `zerog` (after 3), `zerog2` (after 6: twin roaming bumpers, 48 s, purple), `zerog3` (on the warp route: four orbiting bumpers, 45 s, red, the Fondue tune). Each opens when you pass that point (best >= 3, best >= 6, Fondue Fountain beaten).
- **Secret-exit hint on the map:** a level with an undiscovered warp shows a stub of orange route fading off into the dark, with a pulsing '?'.
- **Chris boosts between stops:** he flies along the route's own curve with a big flame and a trail of puffs, arcing up a little mid-flight.
- Fixed: a Zero-G room entered a second time couldn't be left (`leaving` was never reset).

### v1.46 — Brie-muda Triangle is level 3; the Triangle warp; test buttons for the secret route
- **Levels 3 and 5 swapped:** The Brie-muda Triangle (ghosts, the Phantom Milkmaid) is now level 3, The Great Grater (the Mega-Mandoline) level 5. Story lines between levels updated to match (3 -> volcano, 4 -> grinding asteroid, 5 -> cheddar moon); the radar's mini-planet styles and the map's ring follow the levels.
- **The Grater no longer has a warp.** Level 3's secret is new: **the Triangle**. Three ghostly ship's lanterns drift high over the wreckage; shoot them out and a **triangular rift** (`w_tri`) tears open in the sky ("THE TRIANGLE HAS OPENED!"), a warp to the Fondue Fountain -> warp bonus room -> level 7. Data: `warp.style: 'triangle'` swaps the black hole and junk for the rift and lanterns (`w_lantern`).
- **TEST: CLEAR …** button for the stop you've picked (a main level or the Fondue Fountain): marks it beaten, opening whatever comes after, including the secret route's bonus room and level 7.

### v1.47 — expressive audio
- **Chris has a voice** (`Sound.say`): a small formant synth in audio.js (a buzzy sawtooth "throat" with vibrato through three gliding vowel filters, hummed 'm's and breathy 'h'/'f' puffs). Phrases: oof / ow / ugh / oi! (random grunts when hit), **"BLIMEY!"** (down to the last heart, 1 in 4 hits, and every lost life, deeper), "woo-hoo!" (level clear), "yum!" (cheese wedge), "hup!" (breaking free of a tongue). One line at a time (0.35 s gap).
- **Enemies sound like what they're made of** (`matOf`): cheese and critters squish when hit and SPLAT with a wet plop when killed (big ones a bigger, deeper splat); drones, slicers and paladins tink and crunch into rattling scrap; ghosts go "whoo" and pop. Bosses: the boom plus a giant splat or a scrap crash.
- **Mac-Grinder** shots are a mincer crank: a ratchet clunk, a gritty auger grind and a little macaroni pip.

### v1.48
- Chris's big yelp is "BLIMEY!" (a British chef), not the borrowed catchphrase.

### v1.49
- Mac-Grinder back to its original shot sound (the crank-and-grind 'macshot' is still in audio.js, unused, if wanted later).

### v1.50
- Hurt yelps are abstract chiptune 'owch' blips again (ouch1-3: a squeak up and a tumble down; ouchBig: a falling waa-waa on the last heart and when a life is lost). The spoken grunts/BLIMEY are out of hurt (still in audio.js).
- Audio context asks for the 'interactive' (shortest) output latency. Bluetooth headphones add their own delay (often 150-300 ms) on top, which no web game can remove.

### v1.51 — crouch-walk
- Holding down + left/right on the ground now waddles along crouched at 38% speed (still a small target, still shooting low), instead of stopping dead. The rig takes short quick steps: the body rocks side to side and bobs, the knees shuffle, the feet lift a little higher, the hat wobbles.

### v1.52 — boots that look like feet
- New `c_boot`: a white moon-boot with a red ankle cuff set back over a short heel, a long bulbous toe out front, a crease where it bends, and a thick dark tread sole on the very bottom row so it sits flat on the floor. White against the blue trousers, so legs and feet no longer blur into one blue blob.
- `c_leg` tapers a little to the ankle (tucks into the cuff), with a shine line. Both PNGs re-exported to assets/sprites.
- Crouch-waddle rocking roughly halved.

### v1.53 — a clean crouch
- The crouch used to bend the squashed trouser legs out sideways from under the belly (the broken-looking blue bits) with the boots hidden behind the body. Now he sits down on his heels: the legs fold out of sight and both boots come out in front of the body, planted wide, toes under the belly (they shuffle a little as he waddles). Standing up puts everything back.

### v1.54 — Bonus II: Ceramic Grill Freefall (src/freefall.js)
- Replaces Zero-G Room II on the map (the bonus after level 6; opens when level 6 is beaten). A green kamado-egg icon on the route map.
- Chris drops down the inside of a giant ceramic grill (glazed green walls with crackle and riveted steel bands, soot getting hotter towards the bottom), from the lid to the pizza stone over the coals. 40 s.
- **Grates** every ~450 px with one or two gaps; some gaps **slide**; land on a grate and you have to walk off it (costs time). Lower down some grates are **hot** (glowing): touching one bounces you and costs 2 s.
- **Flare-ups** roar out of side vents (they glow first), knocking you across the shaft (-2 s).
- **Brake:** hold JUMP to fire the jetpack against the fall (blue fuel bar, refills while standing on a grate). Depth meter on the right.
- 12 ingredients down the shaft (+1 s each); reach the stone with all 12 and the gun crate opens (same prize as the Zero-G rooms: the next gun not yet won, else +1 life). Touch: hold anywhere; Chris steers towards your finger, holding above him brakes.

### v1.55 — Freefall reworked (it was too hard)
- **Chris dives head first, no gun** (arms reaching down; the jet points up and fires against the fall when braking).
- **The cheese trail**: a line of cheese bits marks the racing line from the lid through every main gap down to the prize. Each bit snapped up plays the next note up a major-pentatonic scale (`chime`), so following it plays a rising run; every 8 in a chain = +1 s. The line's gap in each grate glows faintly.
- **Gentler grates:** wider gaps (170-200), fewer rows, placed so the line flows; bumping a grate bounces you and slides you towards the nearest gap (no stopping, no time lost unless it's a hot one). Fewer flare-ups, and they fire from the side away from the line.
- **Brake lasts much longer** (6 s of fuel) and refills slowly all the time.
- **The prize gun floats over the pizza stone** at the bottom: reach it in time and it's yours (no ingredient count needed; +1 life once every gun's won). Steering is snappier.
- Tested with an autopilot that just follows the trail: all three runs got every bit and reached the gun with time to spare.

### v1.56 — Freefall: the middle ground
- **The cage:** the prize gun sits in a cage that only opens once you've collected **3/4 of the cheese trail** (HUD: CHEESE n / needed, "CAGE OPEN!" with a chime when you get there). Reaching the bottom without it = "SO CLOSE!".
- **27 s**, faster fall (470), brake fuel 3.5 s with a slow refill; chain bonus only every 20 bits.
- **Grates:** narrower gaps (124-150), closer together, the line swings 120-300 px between gaps; 40% slide (faster, wider). Bumping one now costs 1 s ("BONK -1s"). Hot grates from 35% depth, more of them.
- **Flare-ups:** up to 10, and half fire right across the line: wait for them or brake.
- Bot check: a perfect line-follower (brakes for flare-ups) wins 5/5 with 8-13 s left; a sloppy one that only aims for the nearest gap reaches the bottom with ~1/3 of the cheese and the cage stays shut.

### v1.57 — Freefall: touch buttons, and braking that matters
- **On-screen buttons on phones:** ◀ ▶ bottom left to steer, a big BRAKE button bottom right (multi-touch, light up when pressed; hidden while a controller is in use).
- **Switchbacks:** every third grate sits close under the last one with its gap right over on the far side. At full speed you can't get across: the trail into it is **blue cheese** with a pulsing **BRAKE!** sign. Miss it and you bonk the grate.
- The cage now needs **85%** of the cheese.
- Bot check: braking line-follower wins with 1-14 s left; a perfect steerer that never brakes bonks 6-8 times and scrapes through or runs out of time.

### v1.58 — Freefall: wingsuit brake, jet-boot boost
- **BRAKE (jump / BRAKE button) is now a wingsuit:** Chris swings round flat, belly down, and his cape stretches out into two flapping red membranes either side of him (with cloth flaps and rushing air). It's free: braking only costs time. No more jets firing the wrong way.
- **BOOST (down / S / X / controller down / BOOST button):** the jet boots, pointing up while he dives, fire and drive him down faster (up to 720), using the fuel bar (2.2 s, refills slowly). Handy for making up time on the straights.
- Touch: a smaller BOOST button joins BRAKE bottom right.

### v1.59
- The wingsuit is just Chris's own cape now: braking stretches the four cape strips flat along his back and out wide either side of him, each rippling on its own beat. The extra red membranes are gone.

### v1.60
- Wingsuit cape spread halved (strips widen to ~3x instead of ~6x).

### v1.61 — Freefall intro
- A 3-2-1-GO! countdown: Chris glides in from above on autopilot with his cape-wings out, lining up with the start of the cheese trail; your controls and the clock start on GO (beeps on each number, a fanfare on GO). The walls now reach above the top so the glide-in isn't over a void.

### v1.62 — Freefall: fewer grates, more going on
- **About half the grates** (700-860 apart instead of 440-540). The pattern runs normal, normal, switchback (BRAKE, blue cheese), **foil**.
- **Foil sheets:** a sheet of crinkly kitchen foil right across the shaft, no gap. Hit it **boosting** (fall speed 560+) and you burst through it ("RIIIP!"; it hangs torn at the sides); any slower and you bounce off (-1 s). The trail into it is **orange cheese** under a pulsing BOOST! sign.
- **In between the grates**, one of:
  - a **kebab skewer** spinning on a bolt across the line (meat, pepper, onion, tomato): touch it and you're knocked aside, -1 s ("SKEWERED");
  - a giant **spatula** on an arm swinging out of the wall over the line ("THWACK", -1 s);
  - a **smoke cloud** that holds you up (unless boosting), drifts you sideways and hides the trail.
- Fewer flare-up vents (up to 6), never at a switchback or foil.
- Bot check: a line-follower that brakes on blue and boosts on orange wins 5/5 (6-16 s left); a sloppy one gets a third of the cheese.

### v1.63
- Foil sheets removed (rows are back to normal, normal, switchback). The foil code stays but nothing makes a foil row. Boost is just for making up time again.

### v1.64 — swinging camera (the middle ground)
- New option **CAMERA: SWING / LOCKED** (main menu + pause menu options; SWING by default). With SWING the camera's angle round the planet (`viewT()`, `camT`) eases after Chris instead of being glued to him: run and he moves off-centre along the curve, leaning with it, while the planet turns under him and catches up (never more than ~150 units behind; settles back when he stops). Off in the cave.
- Everything drawn through `screenPos`/`place` follows the camera angle; the planet and sky layers turn with it; Chris's rig leans by the lag; boss/mandoline attachment maths and aiming (stick/mouse) account for it.
- LOCKED is exactly the old behaviour.

### v1.65 — CAMERA: FULL (level 1 only, to try)
- The camera option now cycles **LOCKED / SWING / FULL**. FULL works on levels marked `fullCam` (just level 1 for now; elsewhere it behaves like SWING).
- FULL: "up" stays up on the screen. The camera angle is fixed where Chris starts and the view slides after him (`updateCamera`), framing him with room above his own head, so he runs right round the planet: on the side, upside down underneath.
- **Controls follow the screen:** left/right are decided when you press (by which way the ground under him faces on screen) and kept while held, so you can run on round the sides and underneath without flip-flopping. Release and press again to re-map.
- Visibility culling is by distance from Chris (not from the camera) in FULL; the muzzle maths uses the camera angle. Known rough edges: off-screen enemy arrows still assume Chris is on top; bosses/cutscenes untested in FULL.

### v1.66
- SWING camera is a springy, under-damped follow now (K 30, damping 4) instead of a linear ease: it catches up faster, swings a little past Chris when he starts or stops and settles back, so it feels bouncy rather than linear.

### v1.67
- FULL camera controls: holding a direction keeps Chris running the same way round (as before). A fresh press on a SIDE of the planet (where there's no screen-left/right) now has a fixed meaning: LEFT climbs back up towards the top, RIGHT carries on down underneath, on either side. On the top half and underneath, left/right are screen-left/right.

### v1.68
- FULL camera: on a side of the planet, holding DOWN walks Chris down it (away from the top, the same as RIGHT there) instead of crouching, and keeps going while held, on round underneath.

### v1.69
- Fixed the FULL-camera background suddenly snapping to a different arrangement: as Chris passed underneath the planet the camera lag wrapped from +180 to -180 degrees, jumping the parallax layers (which turn at fractional speeds) a whole turn. The lag is now tracked unwrapped (`lagU`). Measured: biggest frame-to-frame background jump going right round went from ~2000 px to 0.

### v1.70
- Freefall turning: changing direction is now a MIRROR, not a spin. The pose is computed as if facing right (head down, leaning into the steer; flat for the wingsuit) and mirrored for left; turning squeezes Chris edge-on and out the other side (scale X eases +1 -> 0 -> -1) with the swap happening at the edge-on instant, so there's no somersault the long way round. The pose itself is eased too (tilts and opening the wingsuit are smooth).

### v1.71
- Freefall turning, done the way falling games usually do it: DIVING he never turns round; he stays head-down and banks up to ~30 degrees into the steer (head leading). The WINGSUIT faces the way he's travelling when it opens; steering the other way while it's open flips him round instantly (the classic 16-bit turn) with a swish and a cape flutter. The paper-squeeze turn is gone.

### v1.72 — Bonus: the Centrifuge Fermenter (src/centrifuge.js)
- Replaces the warp route's Zero-G Room III (Fondue Fountain -> **Centrifuge** -> 7; opens when the Fondue Fountain is beaten). A steel drum icon on the map.
- Inside a huge spinning steel drum (riveted shell, portholes, a film of whey and curd lumps on the wall, the axle at the centre). No gravity: the spin pins Chris to the wall, "down" is outwards, and the camera turns the world so his feet always point down the screen with the drum curving up round him.
- **Real centrifuge physics:** on the wall he's carried round with it; in the air he flies in a straight line (inertial frame, nothing pulls him) while the drum turns under him, landing further round than expected (a little air-steer). Running against the spin cancels it, so a jump goes straight across.
- **Spin cycle** (14 s): fast (1.35 rad/s: short, thrown-forward hops) and slow (0.55: "SPIN DOWN: JUMP ACROSS!" — jumps sail through the middle). Four of the 12 ingredients float near the axle and need a slow-spin jump across.
- **Stirring paddles** (3) creep round the wall; touching one knocks you off it (-2 s, "PADDLED"): jump them.
- 50 s, +1 s per ingredient, all 12 = the prize (next gun, else +1 life). 3-2-1-GO intro, touch buttons (◀ ▶ JUMP), < MAP, MAP/AGAIN at the end.
- Physics check: in slow spin, running against it and jumping passes right through the axle (closest 0); standing still in fast spin, a jump only gets ~85 units off the wall.

### v1.73 — Centrifuge: you can SEE it spin
- The camera no longer turns with Chris (which made the drum look still). It's fixed on the whole drum, so it visibly whizzes round and carries Chris with it, up the side and upside down over the top, like a hamster in a wheel; run against the spin to stay at the bottom. A faint judder grows with the spin.
- Drum a bit smaller (radius 250) so it fills the screen height; yellow/black warning stripes round the wall; whey sprays off the wall as he runs.
- Left/right follow the screen (decided when pressed, kept while held), as in the FULL camera.
- A factory round it: steel wall panels, copper and steel pipes feeding the drum, a big SPIN gauge (green/amber/red, needle trembling with the spin) and a "FERMENTER No. 9" maker's plate. HUD: SPIN: FAST / SLOW.
- Chris starts at the bottom with the paddles well away from him.

### v1.74 — Centrifuge: hatches, rats, standard controls
- Standard controls in the centrifuge: left/right are Chris's own (like running round a planet), jump + hold for the jetpack (pushes in towards the axle), fire with Z/X/J, mouse (aims) or pad X/RT/right stick. Touch: ◀ ▶ JUMP FIRE (fire auto-aims at the nearest rat).
- The stirring paddles are gone. Three hatches in the drum wall cycle closed → flashing warning (amber floor glow) → open onto space (red glow, air streaming out). An open hatch drags you along the wall towards it; reach the gap (or land in it) and you're SUCKED OUT: -3 s, then thrown back in at the bottom away from open hatches, with a short grace.
- Every opening hatch lets in a rocket rat (max 4) that hovers inside and lobs pepperoni at you (-2 s a hit). 3 macaroni hits each; a kill is +1 s.

### v1.75 — Centrifuge: gear drive and a living backdrop
- The drum now has a ring of teeth round its shell, driven by a steel pinion each side. Each pinion shares an axle with a big brass cog behind the drum, and the left one is driven by a finned green motor (its lamp glows hotter with the spin). All the cogs share a tooth pitch and mesh properly, so they speed up and slow down with the drum. Sparks fly where the teeth bite at high spin.
- The drum's back plate has 8 glass portholes, dimmed (60% cut), through which the brass cogs behind can be glimpsed turning — visible without pulling focus.
- Straight pipes removed. The back wall now has huge dark cogs turning in the gloom, warning beams sweeping in from the top corners (amber, flashing orange on a hatch warning, fast red while one is open), steam vents blowing off from the bottom corners, drifting dust, a cold glow off the drum, a light sheen and spin streaks on the steel, and a vignette. The maker's plate moved to the top right.

### v1.76 — Centrifuge: twin-stick touch controls, inner portholes
- Touch now uses the main game's controls: floating MOVE stick on the left (drag to run, tap or push up to jump, hold up for the jetpack) and floating AIM + FIRE stick on the right (touching fires, dragging aims; without a drag it picks the nearest rat). Controller: the "push left stick up to jump" option and the jet button now work here too.
- Six small portholes nearer the middle of the drum. Behind them sits a brass sun cog (r150) on its own bearing, meshed with and turned by the left big cog, so you see it turning through the inner holes (and the edge of it through the big ones).
- The SPIN gauge is smaller and moved to the top left, out of the move stick's way.

### v1.77 — Centrifuge: slow-downs, dead stops, reverses, gravity
- The spin follows a programme (CF_SPIN, ~51 s loop): fast, slow down, spin up, STOP, reverse fast, reverse slow, spin up, slam into reverse (passing through a stop), STOP. Each change is shouted on screen; it eases between settings so a reversal passes through zero.
- Gravity fades in as the drum stops (none above 0.45 rad/s, 560 at a dead stop). On the wall you slide down to the bottom; if the wall's turn can no longer hold you (v²/R < -g·sinφ — the top first) you drop off and fall to the bottom. The jetpack gets stronger with gravity so you can still fly when it's stopped.
- The SPIN gauge now has zero in the middle (reverse to the left) and the label reads SPIN / REVERSE: FAST / SLOW, or STOPPED. Cogs, sparks, streaks, steam and judder all follow the spin's size and direction.

### v1.78 — Centrifuge: bigger jumps as it slows
- Jump speed off the wall scales with the spin: 400 at full speed, rising to 720 at a dead stop (400 + 320·(1 − |w|/1.35)). Measured from the bottom: closest approach to the axle 161 at full spin, 101 at 0.9, 51 at 0.5; stopped, a jump goes right up past the middle to near the top (2.5 s in the air).

### v1.79 — Centrifuge: survive 60 s, robots, prize in the middle
- Goal changed: SURVIVE 60 SECONDS (countdown from 60). Chris has 6 armour pips (HUD under the timer): a laser hit costs 1, being sucked out costs 2; at 0 it's KNOCKED OUT. Ingredients now patch 1 pip back.
- Rats swapped for existing techy enemies flying in through the open hatches: DRONES (hp 3, orbit fast with a bob, single laser bolts every ~1.5–2.6 s) and RAT SAUCERS (`ratship`, 30%, hp 6, slow orbit, a fan of three bolts every ~2.6–3.6 s). Lasers are drawn as hot pink streaks with white cores.
- At 0: SURVIVED! — every robot blows up, the hatches seal, the drum winds down to a stop, and the prize gun pops out (glowing, bobbing) in the very middle. Jump or jetpack through the middle (within 62 units) to grab it and clear the bonus. If you already own every gun, the prize is a gold wheel worth +1 life.
- Map blurb updated.

### v1.80 — Centrifuge: random gaps, ingredients in the portholes
- The three fixed hatches are replaced by gaps that tear open at random places in the wall every ~1.4–3.8 s (up to 4 at once, never right under Chris, never overlapping). Sizes are random: small (40%), medium (40%) or huge (20%, only one at a time). Each flashes a warning (longer for bigger ones), opens for 2.6–4.6 s, then seals and fades away.
- Bigger gaps let more robots in (1 / 2 / 3, staggered; up to 7 robots in the drum), pull harder and from further away, and give a bigger shake.
- An ingredient now sits in the middle of every porthole in the drum (14: 8 outer, 6 inner). To finish you need ALL of them as well as surviving 60 s. If the clock runs out first it reads SURVIVED and the HUD says NOW GET THE LAST n!; the prize appears once both are done. Ingredients still patch 1 armour.

### v1.81 — Bonus GOAL panel; centrifuge robots hurt on contact (stomp them)
- New shared `GoalHud` (zerog.js) on all three bonus levels: a plain dark panel top-left under MAP listing the goals with tick boxes, progress bars and counts, greying out what's not unlocked yet and flashing what to do now.
  - Centrifuge: SURVIVE 60s → INGREDIENTS n/14 → GRAB THE GUN.
  - Zero-G: INGREDIENTS n/12, BEFORE THE CLOCK, OPEN THE CRATE.
  - Freefall: CHEESE TRAIL n/need, DIVE TO THE BOTTOM %, BEFORE THE CLOCK.
- Centrifuge: touching a drone or rat saucer now hurts (1 armour, knocks you away) unless you come down on it feet first (moving outwards, it below your feet): a STOMP crushes it, bounces you back up and refills a bit of jetpack.
- Centrifuge: SPIN gauge moved to the top right; the maker's plate is gone to make room.

### v1.82 — Swiss-Shot fires where it was aimed, not where you're running
- Bug: the Swiss-Shot fires on RELEASE, and letting go of the aim stick (touch right stick / controller right stick) is the release. That same frame the aim was gone, so Chris turned to face his running direction and the ball went that way. Now the aim (facing + angle) is remembered while charging and used for the shot if the aim was let go within the last 0.4 s. Tested: running right, aiming left, release → ball now goes left (before: right).

### v1.83 — Fix: bonus levels crashed on a second visit
- Phaser reuses the scene object, so the GOAL panel (and the centrifuge's prize image) from the last run survived into the next one as destroyed objects → "Cannot read properties of null (reading 'cut')". create() now resets them (plus the centrifuge's jet/jump/grace/slide state) in all three bonus scenes. Tested: centrifuge, zero-G and freefall each entered, left and re-entered, and AGAIN — no errors.

### v1.84 — Centrifuge: the main game's jetpack
- Jetpack now follows the main-game rules: keep holding jump after take-off and it lights after 0.28 s; let go and press again in mid-air to light it at once; SHIFT / controller LT (jet) / touch stick pushed right to the top / left stick fully up (padUpJump) light it straight away. Thrust 2400 up to 300 u/s "up" (= in towards the axle; both rise with gravity when the drum stops), never slowing you. Tank = 2 s (drain 0.5/s), refills 0.7/s on the wall, trickles back at 0.21/s after 0.5 s off it. Jet loop sound on/off; flames now actually show (a stray comment had swallowed `this.jetting = true`).
- Main-game JET bar (17 chunky blocks, red flash when low) under the armour pips. Stomping a robot is a BOOST!: full tank, re-armed, bar flashes white.
- Measured at slow spin from the bottom: tap jump 0.8 s in the air, hold jump 3.1 s (jet 2 s, tank empty).

### v1.85 — Multiplayer, step 1: see each other
- `server/`: a Node WebSocket relay (`ws`), rooms of up to 4, keeps each player's latest state and sends each room one snapshot of who changed at 60 Hz; health check on GET /; Dockerfile; README with hosting notes (needs wss:// behind a TLS reverse proxy since the game is on https).
- `src/net.js` (`Net`): connects when the address has `?mp=<wss url>&room=<name>&name=<you>` (`?mp=local` = ws://host:8787, `?mp=off` to stop; remembered on the device), auto-reconnects, sends my state each frame throttled to 60/s: [level, theta, h, vx, vh, facing, aimA, flags(duck/jet/fire/power/ground), weapon]. Remote players are rendered 100 ms in the past, interpolated between snapshots on a local clock (theta the short way round).
- Level: `netTick()` sends my state and draws every other player on the same planet as a full ChrisRig (tinted per player, with their weapon, name tag over the head, standing square to the planet, camera-aware), plus a status line along the bottom (ONLINE ROOM X 2 PLAYERS / joins / leaves). No effect when multiplayer is off.
- Tested: relay delivers 58 states/s at a median 4 ms locally; two browsers in one room see each other move.
- Not yet: shared enemies/pickups/boss (host-owned), shots/hits seen by others (`Net.event` relay is in place), bonus levels, a menu to join a room.

### v1.86 — Boss rework: THE PHANTOM MILKMAID (Brie-muda Triangle)
New `src/milkmaid.js` (MilkmaidMixin, like mandoline.js); boss ai `milkmaid`, hp 200, scale 1.25. Old sheet-ghost sprite replaced.
- **Look**: a towering Victorian spectre built from parts. Body (`milkmaid`, 112x150): ragged gown with checkerboard-dithered translucency that gets denser towards the hem (you see stars and bones through it), ectoplasm-swirl apron, ribs showing through the bodice, puffed sleeves, bony arms holding the churn; cold blue glow. Head: lavender mob cap with a frilled brim and moth holes, three faces (`mm_head0` hollow yellow eyes / `mm_head1` eyes wide when attacking / `mm_head2` screaming maw when hit). Act 2: a spectral cow skull (`mm_skull0`/`1`, red blazing eyes). A rusted churn (`mm_churn`) with glowing whey at the rim that tilts to pour and drips whey. A red heart (`mm_heart`) shows in act 2. All exported as editable PNGs. `pixSprite` gained a `post` hook (holes = -2, not outlined) for the dithering.
- **Act 1** round robin: SPIRAL SOUR-RINGS (3 volleys of 12 curd bullets whose paths curl, alternating direction, so the rings spin as they spread; then two skimmers along the ground, the far one going right round the planet to hit you from behind ~10 s later), CHURN CASCADE (rises high, tips the churn, a pour column hurts; where it lands a flood rolls round the curve both ways: a 58-tall crest, then 34-deep milk for 2 s behind it - jump, jetpack or stand on a bone ledge; ~6.5 s total), BRIE-MUDA TRIANGULATION (neon-purple triangles fly out and lock into a laser cage round Chris: two walls + a curved lid that close in from ±0.46 to ±0.30 rad over 8 s; touching hurts and throws you back in; she stays inside it), TELEPORT (streaks to your other side leaving fading blue after-images).
- **Act 2 THE SOUR STAMPEDE** (<50%): bonnet shreds into rags, cow skull, she dives and SLAMS the churn into the ground (CLANG, big shake, hit-stop, shockwaves both ways). Adds GHOST-COW STAMPEDES: skeletal dithered cows clamber out of the ribcages near you and gallop round the planet at 330 (jump them). The heart is the weak spot: shots within 24 units of it do 2.4x ("HEART!"), elsewhere 0.45x (blasts with no position 0.6x).
- **Juice**: orange milk splatters and a squishy micro hit-stop on hits (throttled), screaming face, after-images, new SFX `wail` (warbling 16-bit square wail on every attack), `churnclang` (heavy metal clang), `zap` (cage locks).
- Generic: enemy bullets support `curl` (turning velocity); `hitK(e, theta, h)` can take where the hit landed.

### v1.87 — Volume options
- OPTIONS (main menu and pause menu) now has MUSIC VOLUME and SFX VOLUME, 0-10 shown as a bar. Left/right step it, select goes up one and wraps to 0; changing SFX plays a pickup blip at the new level. Saved on the device (`lc_vol_music`, `lc_vol_sfx`); `Sound.setVolume(kind, 0..1)` / `Sound.getVolume(kind)` scale the music and SFX buses (the pause duck keeps the music volume). SOUND ON/OFF still mutes everything. Tested: music level measured 0.094 RMS at 7/10 and 0 at 0/10.

### v1.88 — Poltergeist wedges no longer look like health
- The L3 poltergeist wedge was a yellow cheese wedge, too close to the health wedge pickup. Redrawn (36x30, editable PNG): ghoulish ghost-green body with a rotten purple rind, mould spots, angry brows, glowing red eyes, a fanged grin and a wispy ghost tail. The health wedge stays plain yellow.

### v1.89 — Mount Mozzarella becomes the PIZZA INFERNO; new boss: the Mozzarella Magma-Golem
New `src/mozz.js` (MozzMixin, level flag `mozz: true`).
- **Look**: charred, cratered pizza-crust planet (golden baked to burnt black, lava-light rim), deeper orange sky, white-hot molten mozzarella pools (6 now), and a volcano on the left horizon with glowing lava rivers. Marinara geysers (red puff, `marinara: true`).
- **Cheese pull**: the string-cheese pits still grab you (mash jump x3 to tear free); now HOLDING jump also burns jetpack fuel to rip out.
- **Marinara geysers**: erupting vents fling boiling marinara blobs that arc up and rain back down round the vent.
- **Volcanic eruptions**: every 8-12 s (and on the boss's ground pound) the volcano flares and spits lava, then 1-3 (3 when the boss triggers it) pepperoni-crust BOULDERS fall in over the horizon, bounce and roll at you (210-260/s). Jump them or shoot them (3 hits; shootable eBullets now support `hp`).
- **Enemies**: Pepperoni Pyros = the existing goggled, oven-mitted rocket rats; their Pepp-Grenades now BOUNCE once before bursting into greasy shrapnel. New ANCHOVY SWARMERS (shoals of five tin fish with snipping jaws circling a point that drifts after you; one darts at you every ~2 s). New TOASTY OVEN DRONE (the old oven sprite at 0.55: hovers over you, flings homing pizza-cutter wheels, shudders and SLAMS onto the crust with shockwaves both ways). Magma-golems unchanged (crust armour already). Frogs dropped from L4's waves. Enemy defs can now set their own scale `k`.
- **Boss: THE MOZZARELLA MAGMA-GOLEM** (hp 240, replaces the Pizza Oven of Doom): a lumbering giant of molten cheese (fanged glowing maw, burning eyes, drips, charred spots) that walks after you on the crust. Three charred CRUST PLATES (helmet, shoulder, belly; 12 hits each) soak shots; until all three are off the rest of him takes 0.3x, then his CORE glows and he takes 1.25x. Attacks: MAGMA LOB (3 aimed globs that leave burning puddles for 3 s), GROUND POUND (fists up, slam: shockwaves both ways, sets off the volcano), CHEESE BREATH (a sweep of molten blobs from above his head down to your feet). Below half he BOILS OVER: remaining plates blow off, he glows hotter, moves faster, double shockwaves, and MAGMA RAIN (6 target rings, globs drop on them). All new sprites exported as editable PNGs.

### v1.90 — Mount Mozzarella: mountains of molten mozzarella
- The yellow triangular "rind pile" props on L4 are replaced by six different MOZZARELLA MOUNTAINS (`mozzmtn0`-`5`, generated in mozz.js from a table: 1-3 rounded gooey domes with soft lumps, hand-shaded and dithered from the top left, glossy melted top edge, white drips running down, browned blisters and glossy bubbles, a charred crust foot; some with a bubbling lava crater, some with cheese strings stretched between peaks). 11 placed round the planet at different sizes and flips, warm-tinted. Near Chris their peaks steam and spit cheese bubbles. Exported as editable PNGs.

### v1.91 — Planet depth (neo-retro), first on Mount Mozzarella
New `src/depth.js` (DepthMixin), switched on per level with `depth: {...}` in LEVELS (L4 only so far):
- **Sphere shading**: a screen-fixed overlay lights the planet from the top left in four dithered shade steps; a thin warm rim light on the lit edge and a dithered atmosphere glow just outside it (ADD).
- **Parallax hills**: two rings of jagged crust hills behind the planet (far one hazier/lighter, with tiny lava lights), turning at 0.45x and 0.7x the planet's speed so they slide past at different rates as you run.
- **Foreground rocks**: a low strip of chunky dark boulders along the bottom edge, lava light catching their tops, scrolling at 1.5x (they pass in front of everything).
- **Lava cracks**: glowing cracks under the crust that turn with the planet and pulse.
- L4 now has 6 mozzarella mountains (one of each), not 11.

### v1.92 — Depth on levels 1-3, each to its own vibe
depth.js gained styles: shade strengths (`shadeA`), atmosphere width/strength (`atmoW`/`atmoA`), ridge styles (`rolling`, `spires`, `wrecks`, default jagged `hills`; `holes` for Gruyère holes; `glow`/`glowP` lights; `size`), foreground styles (`rocks`, `cheese` holey boulders, `reeds` reeds + glowing toadstools, `bones` ribs + grave posts), crack style `veins` with `crackPulse`/`crackA`. Textures are made once per level.
- **L1 Gruyère Globe** (bright, cheerful cheese moon in cosmic blue-purple): warm sun from the top left, shadows tinted space-purple and kept fairly light, pale golden halo; far holey Gruyère hills gone lavender in the haze, nearer muted-gold holey hills; holey cheese boulders in the foreground with golden lips.
- **L2 Gorgonzola Gulch** (dark stinking swamp): the heaviest shadow, sickly green rim and a thick green fog; glowing blue-cheese VEINS creeping (slow pulse) under the surface; tall mould spires lost in the murk, swamp mounds with spore lights; bent reeds and glowing toadstools in front of the camera.
- **L3 Brie-muda Triangle** (pale, ghostly): cold moonlight from the top RIGHT, soft light lavender shadows, a wide violet mist; the lost ships of the Triangle (tilted hulls, masts, yards, tattered sails) half-sunk on the far dunes with the odd will-o'-wisp, nearer brie dunes; great ribs and broken grave posts close to the camera.

### v1.93 — Foreground follows the curve; mozzarella mountains sit into the planet
- The foreground depth layer was a flat strip along the screen bottom, so with the planet curving away it rose up at the screen edges, looking concave/fish-eye and detached. It is now drawn into a RING (the strip is wrapped round a circle) centred below the screen, 1.25x the planet's on-screen radius, its base just under the bottom edge, turning at 1.5x the planet's surface speed: convex like the planet, highest mid-screen and dropping out of sight at the sides.
- Mozzarella mountains: their feet now follow the planet's curvature (the foot runs down at the ends by u²·1.4/(2·440) px, into 12 extra rows below the base), with cheese oozing over the crust at their feet; the texture's origin sits at the base row (`customData.oy`, honoured by the prop code), so the middle stays on the surface and the ends no longer hang in the air. PNGs re-exported.

### v1.94 — Depth on the Great Grater
New depth.js styles: ridge `factory` (a city of blocks with rows of randomly lit windows, chimneys, gantry cranes), ridge `cogs` (great half-buried cogwheels with teeth, a hub hole and an inner ring), foreground `girders` (leaning cross-braced trusses, striped hazard bollards, a pipe arch with lights), crack style `seams` (glowing seams round and across the deck plating with lights where they cross).
- **L5 The Great Grater** (grim industrial asteroid): hard cold floodlight from almost straight above, deep blue-black shadow, steel-white rim, a thin haze of sodium-orange smog; pulsing cyan seams in the deck; the factory city on the far horizon with warm lit windows (0.4x), big cogs nearer (0.66x); truss, hazard bollards and pipe arch in front of the camera.

### v1.95 — Foreground layer grounded and calmer
- The foreground ring was sized from the planet (1.25x its screen radius). On small planets (the Grater, R300) that ring was narrower than the screen, so it curled UP at the sides and its pieces floated above the bottom edge. It's now a fixed big ring (radius 700 strip px, scale max(1, zoom*1.4)) whose base sits 6 px BELOW the bottom edge: a gentle curve on every level, with everything standing on the screen's bottom edge.
- It slides past at 1.2x the planet surface's speed (was 1.5x).

### v1.96 — Baron von Blue: spore crown + daze window (no more stomp-farming)
- He now wears a SPORE CROWN (`baron_crown`, mouldy blue caps with spores, on top of his head). Landing on him normally bursts it in your face: no damage to him, it hurts you and throws you off (first time: "SPORE CROWN! SHOOT HIM... STOMP ONLY WHEN HE'S DAZED").
- After every BELLY-FLOP he lies DAZED in the muck for 2 s (1.7 s in act 3): crown squashed flat and greyed, stars spinning round his head ("HE'S DAZED - STOMP HIM!"). A stomp then does 15 (22 with a dive), a hit-stop and "SQUELCH!", and wakes him up (one big stomp per flop).
- Act 1 now has belly-flops too (every 6.5-8.5 s when you're within ~170 of him), so there's a daze window from the start. The usual hovering is locked out while he flops.
- Tested: a normal stomp did 0 to him and cost Chris 1; a dazed stomp did 15 and cost nothing.

## v1.97 - The Forbidden Fondue Fountain, rebuilt (level 5.5, src/fondue.js)
- LOOK: purple party-nebula sky, a polished gold fountain-basin planet with a gilded riveted scrollwork rim (depth.js `ornate`), party lights strung and swaying across the sky, rat bunting on poles, goblets and mushrooms, a towering tiered fountain spire spurting cheese on the horizon, stepped fountain tiers pouring cheese in the distance (depth.js ridge style `tiers`), and a giant's banquet up against the camera - a fork, a kebab skewer, a goblet (fg style `banquet`). The bones are gone.
- CHEESE CURTAINS: waterfalls of hot cheese at six fixed spots - a trickle (warning), a heavy pour (burns, knocks you back), then a gap to run through. A BASH swipe next to one parts it for ~1 s.
- SOGGY CROUTONS over the six fondue pools: stand on one ~1 s and it sinks into the pool, popping back up 3 s later. Skewer ledges between them are solid.
- ENEMIES: Fork Fanatics (pole-vault right over you, land, lance-charge), the Dipped (haul themselves out of the pools, lob soggy lumps, burst into STICKY puddles that drag at you), Kamikaze Croutons (lock on, dive into the fondue - a wave rolls round the planet both ways: jump it), Skimmers (orbit you firing spirals of curling cheese drops).
- BOSS: LE GRAND FROMAGE (hp 190) - a pompous rat in a top hat and monocle riding a copper fondue pot. Act 1: fork lance (aim, glint, thrust - the tip hurts), tips the pot (a pour, then a flood wave round the planet), crouton rain. The boiling pot hurts if you stomp it. Act 2 (half health): the pot shatters (big wave) and he fights on foot - fork charges, leaping slams with shockwaves, crouton rain, lances - and now he CAN be stomped.

## v1.98 - fix
- Fondue Fountain crashed on a fresh start ("reading 'theta'"): fdInit runs in create before Chris exists; it now picks up his position on the first update.

## v1.99 - Fondue Fountain polish
- PLANET: no more cratered rock - its own texture (makeFountainPlanet, fondue.js): two rows of riveted gold and silver panels, a channel of bubbling fondue between bronze posts just under the gilded rim, engraved bronze rings deeper in.
- POOLS: wading through a fondue pool sends ripples out from Chris's legs, with splashes.
- CURTAINS: now pour from golden spouts hanging on chains (h 245) instead of from nowhere. WARNING phase (1 s): an alarm, the spout's mouth glows and pulses red, sparks spit out, a red target pulses on the ground. POURING: a continuous splash of drops and rising steam at the splash zone. You're safe above the spout.
- READABILITY: the Dipped are now mouldy green with dark rot spots, toxic blisters and a purple toadstool cap; Fork Fanatics wear purple bandanas; Dipped, Fork Fanatics and Kamikaze Croutons have a 2px dark outline.
- SKEWER ZIPLINES: skewers are longer (and lower, h 135). Jump up into one from underneath and Chris grabs it and slides along to the end the way he's facing, keeping his speed when he lets go. Jump to let go early, down to drop.
- BOUNCY CROUTONS: land on one and it squishes and springs you up higher than a jump (P.springT stops the short-hop cap cutting it), but each bounce soaks it more (3 bounces and it sinks). Hold down to land softly.

## v2.00 - Circus big tops on the Fondue Fountain
- Three big red-and-white striped circus tops (p_bigtop: purple pennant, scalloped valance with gold trim, striped drum walls, gold stars, a rat-face sign, entrance curtains tied back with gold rope) and three smaller tents (p_tent, gold pennant), behind Chris (depth 2.4), placed clear of the fondue pools. Prop `oy` sits their base row on the crust with a skirt below for the planet's curve.

## v2.01 - The circus moves to the horizon
- The six ground tents are gone. Instead ONE circus cluster sits way off on the horizon, left of the fountain spire (screen space, behind the planet, slightly hazed): a big blue/yellow/orange striped top with a red cap, orange scalloped valance with coloured bulbs, orange and blue wall panels with red medallions, blue curtains over red - flanked by two red-and-white tents, with lantern poles and bunting strung between. The walls run on below the horizon so the cluster never floats where the planet curves away (fcircus, fondue.js drawTent).

## v2.02 - Spire and circus come round with the planet
- The fountain spire and the circus now stand on the planet's far rim and turn with it (at the far fountain tiers' parallax rate, FD_FAR_K 0.45), rotated to the curve with their bases tucked behind the edge, instead of being stuck to the screen. The spire's spurts launch along its tilt. Both a little smaller (spire 1.4x, circus 1.2x).
- Circus re-laid out: wider, the two red-and-white tents taller and further out so both show; the big top's door is smaller.

## v2.03 - Neo-retro lighting on every level (src/fx.js, FxMixin)
- BLOOM (graphics HIGH, WebGL): a custom one-pass camera post pipeline ('LCBloom'). Only pixels brighter than a threshold bleed (two/three little rings of taps added back on top), so the pixel art stays crisp - Phaser's built-in bloom FX blurs the whole frame, so it isn't used. Strength 0.6 by default; `def.bloom` turns it down on levels with a very bright planet (L3 0.28, L5.5 0.42). Follows the GRAPHICS option live (applyGfx -> fxApply).
- VIGNETTE (MEDIUM+): an image under the HUD (depth 19.5), tinted with the level's shadow colour.
- GROUND SHADOWS (all settings): a pooled dark blob under Chris and every enemy, placed on the floor beneath them (ledge or ground); shrinks and fades with height. `e.noShadow` opts an enemy out.
- RIM LIGHT (MEDIUM+): each level's light (def.depth.light direction, rim/atmo colour) puts a thin coloured edge on the lit side of Chris (every rig part) and every enemy: a pooled copy of each sprite, tint-filled with the light colour, just behind it and nudged 1.4px towards the light. Skipped for see-through sprites. `e.noRim` opts out.
- SHADE (MEDIUM+): enemy sprites fall off into the level's shadow colour on the side away from the light (a 4-corner gradient tint worked out from the sprite's rotation); left alone whenever game code is tinting or flashing the sprite.
- Not done: recolouring the black outlines per level - the sprites all share one packed sheet, so that would need a copy of the sheet per level.
- Bonus scenes (zero-g, freefall, centrifuge) don't have these yet.

## v2.04 - Cleaner sprite edges
- Rim light: the light-coloured copy is now nudged by exactly one of the sprite's OWN pixels along its own pixel grid (the axes that face the light) instead of 1.4 screen px - the old way left a ragged, uneven cream sliver round rotated sprites. Slightly fainter (0.8).
- Fondue enemies (Fork Fanatic, Dipped, Kamikaze Crouton) back to the same 1px outline as every other sprite - the 2px one looked heavy and odd next to the rest. Skimmers skip the rim light (their dithered wings showed it through).
- The shadow-side shade on enemies is gentler (it was turning dark sprites into blobs).

## v2.05 - Rat-frog jump legs
- The rat-frog's leap frame had stick legs (single thin lines). Redrawn with proper frog limbs: a big thigh, a thick shin, long webbed feet with three clawed toes, a far leg and arm in shadow behind, a belly. Two air frames now: `frog_leap` going up (hind legs kicked out behind, arms reaching) and a new `frog_fall` coming down (legs swung forward under it, arms braced, tail whipping up), picked from its vertical speed.

## v2.06 - Chris's strange outline
- The bloom lit up plain WHITE as well as coloured light, so Chris's chef whites (and the HUD text) glowed: a milky halo all round him that also washed out the detail on his hat and face. The bloom now only takes bright AND colourful pixels (a saturation gate in the shader's `hot()`), so shots, lava, fondue and lights still bleed but whites stay crisp.
- Chris no longer gets the rim-light copy (on a white suit it read as a second cream outline). Enemies keep theirs.

## v2.07 - The cartoon pass (src/toons.js): 90s grotesque-slapstick enemies, levels 1-5
- TOON MOTION (every enemy, not bosses): squash-and-stretch worked out from how each one is actually moving - walkers bounce along a gait cycle and lean into the run, jumpers stretch along the jump and tip nose-up / nose-down, landings squash and spring back, fliers wobble and bank into turns, anything hit judders like jelly. place() multiplies in spr.tqx / tqy and adds spr.trot. TOON_SKIP (frog, saw blades, oven, anchovies) keeps its own animation.
- FRAMES: `ENEMY.<type>.frames` plays a 2-frame walk / flap cycle (in step with the gait for walkers, `fps` for fliers); left alone while an AI shows a different frame.
- EYE POP: `ENEMY.<type>.eyes = [[x, y, r], ...]` - hit it and bloodshot eyeballs bulge out of its head for a moment (pooled `toon_eye` images).
- REDRAWN, grotesque (bulging mismatched eyes with pin-prick pupils, crooked teeth, drool, scrawny limbs), all with 2 frames:
  L1 space-mouse (run cycle), jetpack rat (flying cap, brass goggles), Gouda-Golem (stomp cycle, vast bloodshot eye, lolling tongue, gold tooth);
  L2 germ and mini-germ (pulsing, waving cilia), stink-fly (wing flap, dribbling proboscis); L3 phantom dairy-maid (hollow sockets, wailing, billowing skirts), ghost pirate (eyepatch, hook, snaggle teeth);
  L5.5 Fork Fanatic (run cycle + vault), Skimmer (wing flap, compound eyes), Kamikaze Crouton (screaming, flame flicker).
- Still the old art (they get the toon motion only): L4 Magma-Golem enemy, rocket rat, oven drone, anchovies; L5 welder rat, drone, slicer; L3 poltergeist wedge; all bosses.
- The old painters for the redrawn sprites were removed from textures.js / levels.js / fondue.js.

## v2.08 - No more highlighted outline on enemies
- Dropped the rim-light copy behind enemies too (fx.js): at game size it read as a pale highlighted outline round every sprite. Enemies keep the gentle shadow-side shading and ground shadows; nothing now draws a copy behind any sprite.

## v2.09 - The rat saucer, redrawn and animated (toons.js)
- `ratship` (the saucer that carries Bessie off; also in the intro, the map, the ending, level backgrounds and the centrifuge) is now a battered junk-heap saucer in the grotesque cartoon style: a scowling bug-eyed rat in a red bandana at the levers under a big cracked glass dome (sticking plaster over the crack), dented tin hull patched with a rust plate and a nailed-on plank, a cheese-and-crossbones, a bent aerial, a tail-pipe.
- SIX frames (`ratship`, `ratship1`..`ratship5`, 84x64): rim lights chase round, the pilot bounces, his eyes dart left and right and blink, the lever waggles, his bandana knot and drool flap, the aerial sways and its bulb winks, the tail-pipe belches smoke, the thrusters gutter, the tractor lens pulses, slime drips off the rim.
- `shipAnim(game)`: one game-wide ticker (game 'poststep', ~10 fps) flips every image showing a ratship frame to the next - so every scene's saucer animates with no per-scene code.
- The pale baked-glow halo on the saucer is gone (it blurred the art).

## v2.10 - Jetpack rat: four frames
- `flyer`, `flyer_b`, `flyer_c`, `flyer_d` (9 fps): legs pedalling the air through three poses, the tail cracking like a whip, the tank rattling up and down on its straps with a puff of steam off the valve, the cap strap flapping, eyes rolling down at the drop, sweat, drool, and a blink. toonRat gained poses 3 / 4 and `tail`, `look`, `lookY`, `blink`, `flap`, `drool` options.

## v2.11 - Level 2's big mushrooms stand on the planet
- `bg_shroom` / `bg_shroom2` used to sit see-through (alpha 0.7) behind the horizon with their stems fading into the haze, so they read as floating. Now they are solid, stand ON the surface behind everything else on it (depth 2.38 / 2.39, h -1), a little smaller, and each has a flared rooty foot in a mound of moss, with rows below the base row (prop `oy`) so the foot wraps the planet's curve. The small pair share one mound.

## v2.12 - Level 2's blue mushrooms grow out of the ground
- `p_shroom` was an old flat sprite with a dark border right round it, including along the bottom of the stem - it sat on the ground like a sticker. Redrawn (34x42, pixSprite): shaded blue cap with gills and glowing spots, a skirt, a stem that flares into the ground, moss and grass blades round the foot, and NO outline along the bottom (a post hook strips it and leaves the foot ragged). Prop `oy` 36/42.
- The big mushrooms from v2.11 had a dark rectangular slab under each foot (the rows below the base showed in front of the planet): replaced with the same ragged, unoutlined mossy foot (shroomNoEdge).
- Still old flat sprites with a bottom border: the reeds (`p_reed`) and crystal stalks (`p_stalk`).

## v2.13 - Goo pits blended into the planet (drawGoop)
- COLOUR: level 2's pits were the default purple; they now use the level's own palette - a murky bioluminescent teal like the mushrooms (`goopPal`, `goopGlow`, teal `swampbub` bubbles), still clearly different from the yellow-green ground.
- RAGGED BANKS (all goo levels): clumps of the level's own ground colours (surface.rim) hang over both edges of each pool, a few blades stand up on the lip - seeded per pit so no two are alike.
- SHADING: two soft dark skirts round each hole, wider than the pool, so the ground reads as dipping into it.
- DRIPS: goo slopped over the rim, running down the outside in four slow drips with a bead on the end.
- Applies to level 2, Pizza Inferno's mozzarella pits and the Fondue Fountain's pools. Not done yet: dithered depth fade in place of the three flat bands; glow spilling onto the ground.

## v2.14 - Goo pits, finished
- DITHERED DEPTH: the three flat colour bands are now seven steps from bright at the surface to dark at the floor, each boundary broken up with a stipple of the lighter step (like the planet shading).
- GLOW SPILL (graphics MEDIUM+): each pool washes the banks beside it with a soft, slowly pulsing light of its own colour and throws a faint shaft upward (additive `goopGl` layer under the goo).
- Bubbles and splashes already used `goopBub`; level 2's are teal now, and the jetpack-in-goo bubbles follow it too.

## v2.15 - Baron Von Blue (level 2 boss) tuned
- HP 175 -> 166 (5% less).
- SHOTS: his spores are now `bspore` - angry acid-yellow spiky puffballs with one bloodshot eye, pulsing over 3 frames, 1.15x, leaving a trail of sparks. His toxic cheese globes have a face in them that gurgles (3 frames: bubbles swell and pop, mouth opens and shuts), 1.4x, and drip teal bubbles behind them. FX_ANIM in main.js drives animated enemy shots (frames, fps, trail, scale); they skip the baked glow (the bloom lights them).
- CLAW TELL: the wind-up before a punch now shakes hard and harder (3 -> 11 px), the claw wobbles, swells up to 25% and flashes red, and slobbers mould bubbles.

## v2.16 - More pasta before the guns run dry
- About 60% more firing per tank on every gun: Mac-Grinder ammo per shot 0.022 -> 0.014 (about 70 shots, was 45); Spaghetti Spinner drain 0.45 -> 0.29 per second (about 3.4 s of stream, was 2.2 s); Swiss-Shot 0.12 -> 0.075 per ball (13 lobs, was 8).
- Refills a little quicker (0.5 -> 0.6 per second) and a dry gun un-jams sooner (0.3 -> 0.25 of the gauge).

## v2.17 - The Spaghetti Spinner is a whip
- WHIP (beamSim): the stream is a chain of 18 links. The first leaves the nozzle along the aim; each one after is sprung to the one before, slightly under-damped and looser towards the tip - so swinging the aim makes the stream lag, bow and whip round after it, and the tip overshoots. It tapers from fat at the nozzle to thin at the tip, droops, and drags along the ground.
- CRACK: when the tip is moving fast (> 1500 px/s) it cracks - a flash ring and sparks at the tip, a snap sound, a tiny shake, and the tip's hit radius is 1.8x for that moment. Sauce flies off the tip while it swings.
- REACH follows how hard you push: range 250 -> 320 at full push, `reachMin` 0.4 -> 0.3; on touch the stick's drag now maps over the whole range (0.12..1, was 0.5..1), so a light push is a short lash (~105) and a full push the whole 320. Pad trigger pressure as before; keyboard / mouse is always full reach.
- LIGHTSABRE HITS (beamHit, every frame, not every 0.1 s): each enemy is tested against the whole length of the stream AND the path every link swept since the last frame, so a fast sweep can't skip anything. Each enemy is hit at most once per tick (`e.beamCd`), so damage per second is unchanged (non-bosses die on contact, bosses 25/s). Tested: one half-circle sweep through nine hovering jetpack rats took out all nine.

## v2.18 Swiss-Shot overhaul
- Charge is quicker (0.8s, was 1.1s) and only slows Chris by 30% (was 55%).
- The ball BOUNCES: once, or twice above ~55% charge, with a small splat blast on each bounce (half radius, 45% damage) and the full blast on the last impact.
- CLUSTER: above 70% charge the final blast throws out 4 bomblets (6 at full charge), each with its own small blast.
- While charging, a dotted arc shows the flight and bounces, with a pulsing ring where it first lands; sparks streak into the ball.
- In flight the ball spins, stretches along its path, squashes on a bounce, and leaves fading ghost images and drips.
- Blast effect: sagging strings of molten cheese fling out and snap back, Swiss holes pop open, steam rolls up, more chunks; a screen flash on charged shots. Bounce splats and bomblets use a lighter version.
- Particles can now fade (`fade` on a part).

## v2.19 Swiss-Shot: push = distance
- How hard the aim stick / trigger is pushed sets how far the ball is thrown (42% to 100% of the throw speed), like the Spaghetti Spinner's reach. The aim arc shows it live.
- Charge now builds with time alone (the trigger no longer changes the charge rate).
- The push eases down slowly (`P.throwK`), so letting go of the stick to fire keeps the throw you had.

## v2.20 Mac-Grinder shots
- New shot sprites `mac0..2` (toons.js): a tumbling elbow of macaroni under molten cheese, flipped at 20 fps. The old `macaroni` texture is still used by the cutscenes and bonus stages.
- Each shot strings a glowing sauce ribbon behind it (`drawMacTrails`, additive layer `macG`) with a hot halo at the head, and sheds drips (`macDrip`) that fall and fade.
- Hits splat (`macSplat`): a star of cheese, flung drips and a pop of light. Shots that run out of range fizzle with a small splat.
- The muzzle flickers with warm light and spits sauce.
- Parts with `fade` now fade over that time (optional `a0` start alpha); `chargeG` and `macG` are reset on scene restart.

## v2.21 Fondue Shield
- The three orbiting dots are replaced by `drawShield`: a wobbling bubble of molten cheese round Chris (far wall behind him, skin and rim in front), sheen arcs sliding round the rim, drips that swell and fall from the bottom, a soft glow.
- The three charges are gobs on a tilted orbit that pass behind and in front of him, each with a tail.
- A hit (`shieldHit`) wobbles the bubble hard, flashes the rim, throws a ripple ring and a ring of cheese drips, and pops one gob. It blinks for the last 2.5s and pops in when picked up.

## v2.22 Gun levels (Space Megaforce style)
- Each gun has its own level 1-4 (`registry.gunLv`, `this.lv`, `gunLvUp`). Parmesan no longer gives 15s of triple shot / free ammo / a free hit: it raises the HELD gun one level (and refills the gauge). At max it scores +1500.
- Levels last across stages; losing a life (or a fresh game) puts every gun back to 1. Hits cost hearts as normal.
- Mac-Grinder: 1 single stream (12% slower), 2 twin helix (0.75 dmg each), 3 triple spread (0.72 each), 4 triple that pierces one enemy (0.8 each).
- Spaghetti Spinner: reach 82/92/100/106%; damage per tick 3/6/99/99 (boss 2/2.25/2.5/2.8); level 2+ the tip CRACK hurts (8, boss 4, radius 46); level 4 forks into two whips.
- Swiss-Shot: blast 85/100/100/110%; second bounce from level 2; cluster of 4 at level 3; cluster of 6 whose bomblets bounce at level 4.
- HOT SAUCE is now the shared one: every gun's gauge drains 2.5x slower and refills 2x faster for 10s, and everything hit burns (Swiss blasts included). It no longer doubles fire rate.
- HUD: `LV n` under the gun icon, flashes on level-up.

## v2.23 The space shop (src/shop.js)
- CHEDDAR: every kill pays (score/50, minimum 1; bosses 50). Shown under the score and on the route map.
- FRIDGE-O-TRON'S SPACE SHOP: `ShopScene` ('shop'), opened from the SPACE SHOP button on the route map (left of the title; key S, pad Y). Tap a row to buy.
- Everything bought lives in `registry.shop` ({coins, armMk, armHp, boots, chips}) and is wiped on GAME OVER along with the cheddar. Losing a life keeps it.
- BLACK RIND armour Mk I-IV (60/100/150/220): 2/3/4/5 plates on its own HUD gauge (RIND, under MAC). Plates soak hits before hearts and don't regenerate. PATCH UP costs 10 a plate. At zero it SHATTERS (suit goes back to white) and must be RE-FORGED (30 + 10 per mark).
- While worn, Chris's suit and hat are recoloured charcoal (`makeArmourTextures`, `ChrisRig.setArmour`): pale colourless pixels are remapped, colours and the helmet stay.
- MOON BOOTS Lv 1-4 (50/90/140/200): +5% run, +3.5% jump, -8% jet fuel use per level.
- START CHIPS per gun (70/120/180): the level that gun starts at and falls back to when a life is lost.
- EXTRA LIFE: 120.

## v2.24 Harder: 3 hearts, dearer shop, Milkmaid's horns
- Chris starts with 3 hearts (`CFG.maxHp` 3; `this.maxHp` adds shop hearts, up to 5). The health icons are yellow cheese HEARTS (`hud_cheese`, 13x11) instead of wedges.
- Shop prices roughly 2.5x: armour 150/260/400/600, patch 25 a plate, re-forge 80 + 30 per mark, boots 120/220/350/500, start chips 180/320/500, life 300. New: EXTRA HEART 350 then 600.
- The Milkmaid in act 2 (horns out, `mmS.p2`) can't be stomped: landing on her hurts Chris and throws him off.

## v2.25 Shop on the route map
- The SPACE SHOP button beside the title is replaced by a hovering orbital kiosk (`shopship`, with a SUPPLIES sign, striped awning, blinking beacon and thruster) over the start of the route. It bobs and tilts; tap it to go in. The cheddar total sits under it.

## v2.26 Route map status panel
- The bottom-right panel is wider and shows Chris as he stands: hearts, lives, cheddar, wheels; each gun and its level (or LOCKED); armour mark and plates (or SHATTERED / NO ARMOUR) and boots. The cheddar count under the shop kiosk is gone.

## v2.27 The Lucky Wheel
- In the shop: one spin per game for every golden cheese wheel ever found (`Shop.spinsLeft`; spins used are stored in `registry.shop.spins` and come back after GAME OVER).
- Eight slices, weighted (`SPIN`): 30 cheddar x2 (22% each), 60 (16%), armour plate (14%; 50 cheddar if nothing to mend), GUN +1 on a random gun (10%), RAT = nothing (10%), 120 (4%), extra life (2%).
- Button in the shop's left panel (key L, pad X/Y).

## v2.28 Cheddar spills, one-off spins, golden sets
- Cheddar is no longer banked on the kill: it spills out as coins (`spillCheddar`, pickups of kind 'cheddar') that scatter, bounce and roll. They last 10 seconds and blink for the last 3. The Magnet Fork pulls them in.
- Lucky Wheel spins are one-off: each golden wheel found is one spin EVER (`lc_spins` in localStorage), not a per-game allowance.
- Wheel: the 120 slice is now 500 (3% chance). GUN +1 lets you choose which unlocked gun goes up.
- GOLDEN SET (all 3 wheels on a level): 100 cheddar spills out on the spot, and every new game starts with +75 cheddar per completed set (`Shop.goldenSets`, `SHOP.setBonus`).

## v2.29 Lucky Wheel, fairground style
- `drawSpin` redrawn: rusty cog rim that turns with the wheel, 18 chasing bulbs, cyan and flickering pink neon frame, cables, sirens that whirl while it spins, a bracketed pointer kicked by each peg with sparks, the result on a bulb-lit marquee on posts, confetti on a win.
- Slices carry pictures (`wi_30`, `wi_60`, `wi_500`, `wi_rat`, `wi_plate`, `wi_gun`, `wi_life`) with a small value by the hub.

## v2.30 Half hearts and heavy hits
- Hearts take two ordinary hits: `hurt()` costs half a heart, `hurt(true)` (HEAVY) a whole one with a CRUNCH! pop, a stop-frame and a bigger shake. New icon `hud_cheese_half`.
- Heavy: touching / being landed on by any boss, the Baron's claw, the Mandoline's blade slams, Le Grand Fromage's lance, falling slam blocks, the Milkmaid's horns, being squashed.
- Everything else (shots, small enemies, hazards, goo, flames) is half a heart. Cheese wedges still heal a whole heart. An armour plate still soaks one hit of either kind.

## v2.31 Magnet light and the permanent Magnet Fork
- Anything the magnet has hold of is joined to Chris by a crackling blue-white thread with a halo and motes streaming in (`drawMagnet`, additive layer `magG`); a spark and a small flash as each one lands.
- Shop: MAGNET FORK, FOR KEEPS (450 cheddar, until game over; `shop.magnet`, `this.magOwned`). It pulls pick-ups from 250px (the timed power-up reaches 420px and also bends shots away). With it owned, a Magnet Fork power-up pays 40 cheddar instead.
- Shop rows keep their descriptions down to 26px tall (nine rows now).

## v2.32 Cheese jam
- When a gun's gauge runs dry it JAMS (show only: the gun stopped anyway). `gunJam`: the motor chokes (sfx `jam`), a JAMMED! pop, a splat, sparks and drips. While jammed (`jamUpdate`, `drawJam`): a plug of cheese (`jamblob`) wobbles on the muzzle, steam and drips come off it, a warning triangle blinks, pulling the trigger makes it cough and judder (`jamclick`), and a ring round the plug fills red to green as the gauge recovers to the restart point.
- When it clears: the plug pops off the end with a flash, CLEAR! and sfx `unjam`.

## v2.33 Cheese jam, simplified
- The jam is now just smoke, recoil and dripping cheese: no JAMMED / CLEAR text, plug, pressure ring, warning triangle, trigger click or clear sound.
- On the jam the gun arm bucks back and up (`P.jamKick` in the rig) with a belch of smoke, a gob of cheese and sparks, and the one choking sound (`jam`). While it recovers it smokes, drips and gives a smaller cough every half second or so; one last cough as it clears.

## v2.34 Chris loses his temper with a jammed gun
- While the gun is clogged Chris alternates a furious shake (gun arm, head and hat rattle; `P.jamShake`) with a THUMP (`P.jamBang`): a big gloved fist (`c_fist`, made on demand in the rig) goes up and comes down on the hopper. The gun dips, smoke, sparks, crumbs and drips fly, with a clunk and a tiny shake. About 0.85s a cycle until the gauge recovers. No gameplay change.

## v2.36 Jam: shake then a slow double thump
- The jam routine is now half a second of shaking, then two deliberate thumps of half a second each, a breath, and round again (1.9s cycle).
- The gun stays jammed for at least 1.6s so the shake and both thumps always play (it used to clear as soon as the gauge reached the restart point, roughly a second sooner).

## v2.37 Milkmaid: white milk, no stomping, a cage you can shoot down
- Her milk (the pour, the flood, the drips and the whey on the churn) is white with a faint cream glow, not cyan.
- She can't be stomped at all: in act 1 Chris's boots go through the ghost and he is shrugged off unharmed (one-off banner); in act 2 the horns still gore him.
- The laser cage is a little bigger (half-width 0.54 shrinking to 0.37, lid at 335) and has 8 hit points: each Mac shot or whip lash on a wall or the lid takes 1 (a Swiss ball 4) and makes it flash white; it flickers when nearly through and shatters at zero. It still falls after 8 seconds.

## v2.38 Cheddar: sucks in, lasts longer, worth more
- Cheddar coins home in on Chris by themselves (no magnet needed) once he's within ~140px, or anywhere in a column 80px either side of him up to 300px above or below, so coins under a jetpacking Chris come up to him. Once one starts coming it keeps coming, faster and faster, with the magnet's light thread.
- Coins last 29s (was 10), blinking for the last 5.
- Worth 5x: an enemy spills score/10 (minimum 5; a mouse 10, a golem 40), a boss 250, a golden set 300.
- Collecting shows one yellow '+N CHEDDAR' over Chris for each burst of coins picked up together.

## v2.39 Playtest setup
- Only the Mac-Grinder to start (`CFG.allWeapons` false). The Spaghetti Spinner and Swiss-Shot come only from the bonus rooms' crates (Zero-G after level 3, Grill Freefall after 6, Centrifuge after the Fondue Fountain); they are no longer unlocked by reaching a level.
- One-off fresh start on every device (`lc_fresh_239`): level progress, secret routes and won guns are wiped once. Golden wheels, Lucky Wheel spins and ranks are kept.
- UNLOCK ALL (TEST MODE) switch top right of the route map (`Progress.testMode`, `lc_testmode`): opens every level, bonus room and gun while on. Progress isn't recorded while it's on (beating levels, finding warps and winning guns are ignored), so switching it off puts things back as they were. The old green TEST buttons only show in cheat mode.

## v2.40 Cheddar tamed, Centrifuge moved onto the warp road
- Cheddar: without a magnet it only gets a small tug along the ground (within 55px, both on or near the ground). The big pull (140px, and the column above / below) now comes with the shop's MAGNET FORK, FOR KEEPS (or the timed Magnet Fork power-up).
- Cheddar values cut by about 69%: an enemy spills score x 0.031 (minimum 2; a mouse 3, a golem 12), a boss 80, a Golden Set 100.
- Warp road is now Triangle (level 3) -> CENTRIFUGE -> Fondue Fountain -> level 7. Breaking into the warp on level 3 drops you in the Centrifuge first (until it's been beaten, `lc_cbeat`); winning it carries straight on into the Fondue Fountain. Map: the Centrifuge opens once the warp is found, the Fondue Fountain once the Centrifuge is beaten.
- Centrifuge: survive 30s (was 60), only 10 robots come in all told (`CF_TIME`, `CF_BOTS`). The end screen has no AGAIN: grabbing the gun gives ON THROUGH THE WARP; losing gives MAP (it can be played again from the map).

## v2.41 Power-ups clearly temporary; more enemies on levels 2 and 3
- Every timed power-up is shorter: Hot Sauce 7s (was 10), Rocket Boots 8, Magnet Fork 8, Fondue Shield 10, Gouda Gigantism 6, Slow-Mo 5, Rat Disguise 7, Jalapeno 6.
- Showing it's temporary: the pick-up banner says how many seconds; a draining bar with the icon and seconds rides over Chris's head (red and flashing in the last 3s); a big 3, 2, 1 pops over him with a blip; '... WORN OFF' when it ends. The HUD ring timer stays too.
- Fewer of them: after each wave's first power-up drop the chance of another is 1 in 12 (was 1 in 4), and none drops while one is running.
- Levels 2 and 3: every wave has about half as many enemies again (a copy of every other spawn slipped in 0.35s after it) and a new 18-enemy WAVE 4 mixing the level's whole cast. Level 2: 18/26/30/18 (was 12/17/20), level 3: 12/17/21/18 (was 8/11/14).

## v2.42 Zero-G controls like the main game; cheese wheels
- Zero-G rooms on touch: the main game's AIM+FIRE thumbstick. A ghost stick rests bottom right; a thumb down anywhere (below the HUD, not on MAP) becomes the stick's centre, and pushing it past the deadzone fires that way (a resting thumb doesn't fire, since every shot kicks you). Mouse, keys and controller unchanged.
- 'Ingredients' are gone: the Zero-G rooms' 12 and the Centrifuge's 14 collectables are all CHEESE WHEELS (`miniwheel_c`: a small red-waxed truckle with a wedge cut out, so they don't look like the golden wheels). Text, goal panels and map blurbs updated.

## v2.43 Continue / New Game
- Title menu: CONTINUE and NEW GAME when this device has a save (any level beaten, warp found, gun won, rank, golden wheel or spin used); just NEW GAME when it doesn't.
- NEW GAME (after a 'this wipes all progress' check) clears levels, secret routes, the Centrifuge, won guns, ranks, golden wheels, Lucky Wheel spins, the remembered gun and test mode, and resets the run in hand (lives, gun levels, the shop and its cheddar). Settings, volume and cheat mode are kept.

## v2.44 Zero-G rooms: shorter, obstacles, fly into the gun
- Clocks 20s shorter: 30 / 28 / 25 (was 50 / 48 / 45). Each cheese wheel still buys back a second.
- Obstacles: ZAP-BARS (electrified spokes turning round a hub; room 1 has one, rooms 2 and 3 two) fling you off and cost 2s. RAT MINES (spiky floating rat heads, 3 / 4 / 5 per room) drift slowly after you; a shot pops one (it comes back 4s later), touching one goes BANG, throws you across the room and costs 2s. Room 3 also has GUSTS that blow across the whole room every few seconds, with flashing streaks as a warning.
- Getting all 12 no longer wins outright: the clock STOPS, the crate bursts, the mines go off, and the gun hangs spinning in the middle in a green beacon. Shoot yourself into it to clear the room and win the gun.

## v2.45 Slower scaling
- Level 2 back near where it was: each wave only gets a copy of every 4th spawn (15/22/25, was 18/26/30 in v2.41 and 12/17/20 before), and no 4th wave. Level 3 keeps its v2.41 waves.
- Cheddar about 30% less again: an enemy spills score x 0.022 (minimum 1; a mouse 2, a flyer 3, a golem 9), a boss 60.
- Parmesan (gun level-ups) after the first: later big enemies drop one 1 time in 8 (was 3 in 10).

## v2.46 Parmesan is temporary; fewer frogs
- PARMESAN POWER now gives +1 gun level for 15 seconds (`P.power`, `gunLvBase` + 1), not for good. Banner 'MAC LEVEL 2 FOR 15s!', the timer bar over Chris and the HUD ring, a 3-2-1 countdown, then 'GUN BACK TO LEVEL n'. It no longer gives free ammo or soaks a hit. At max level it's 1500 points.
- Lasting gun levels only come from the shop's START CHIPS (and the Lucky Wheel's GUN +1).
- Level 2: half the rat-frogs taken out of every wave (waves 14/17/20; frogs 1/4/4).

## v2.47 Brie-muda: easier padding, a hidden warp, a fairer Milkmaid; the cheeseburger heart carries over
- Level 3 is back to 3 waves (12/17/21): one EASY enemy (alternately a ghost pirate and a phantom) slipped in after every other spawn, instead of copies and a 4th wave.
- Milkmaid TELEPORT: slower (0.7s, was 0.45) and she's harmless while she streaks across - it used to ram Chris for a whole heart with no way to dodge.
- The warp is hidden: no lanterns and no dull rift in the sky any more. Beat the Milkmaid and, instead of the cheeseburger, her CHURN drops and hangs there glowing ('HER CHURN IS GLOWING...'). Shoot it (6 hits) and it bursts in a splash of milk and the Triangle opens where it was. Bessie's rescue waits up to 12s while it's open. Going in counts level 3 as beaten (`Progress.beat`) and takes you to the Centrifuge.
- Cheeseburger heart: picking it up at the end of a level now really gives you an extra heart (shown as the burger after the cheese hearts) for the NEXT level, on top of your usual hearts. It used to be just an icon that disappeared. It's used up when you lose it or the level ends; game over clears it.

## v2.48 — Bonus rooms use the real Mac-Grinder
- The Centrifuge and the Zero-G rooms now fire the same Mac-Grinder as the planets: its level (shop start chips / Lucky Wheel), single → twin helix → triple spread → piercing triple, the animated `mac` shots and the sauce ribbons. Shared helpers `bonusMacLv/Volley/Step/Draw` in zerog.js. Parmesan's 15 s boost does not carry into a bonus room.

## v2.49 — Burgers for keeps, quieter churn, wheel chips, thinner Gorgonzola
- Level 2: each wave is 20% shorter, all the cut ones being little germs.
- Lucky Wheel GUN +1 now counts as that gun's start chip, so the shop moves on to the next chip instead of selling the same level again.
- The end-of-level cheeseburger falls on every level (L3 too) and gives +1 max heart for the rest of the game (one per level per game, cap 8 hearts, lost at game over). It also refills your hearts. The old carry-over "bonus heart" is gone.
- L3's churn no longer glows or gets a banner: it's small, tossed up high behind you, with a quick glint every few seconds. The rat-ship waits until 8.5 s while it's still there.

## v2.50 — Mouse + keyboard everywhere
- The Centrifuge and Zero-G rooms now work like the planets on PC: as soon as a real mouse moves, the gun follows the pixel crosshair (no click needed to aim), left click fires, the system cursor is hidden and the right-click menu is off. A touch-screen laptop no longer locks the mouse out (touch sticks hide while the mouse is in use; a touch switches back).
- Planets: the crosshair also shows during the after-boss rescue (for the churn), and the touch buttons hide while the mouse is in use.

## v2.51 — Mount Mozzarella: bigger targets, volcano tantrums
- Rocket rats are twice the size (k 2.44, hit radius 30) and hover a little higher over you; the Oven Drone's homing pizza-cutter wheels are twice the size and can now be shot down (+100).
- The whipping string-cheese strands are gone.
- New: VOLCANO TANTRUMS. Every 17–24 s (not during the boss) the volcano rumbles for 2 s, then for 5.5 s molten boulders rain round Chris, each with a red shadow on the ground. 60% land in one piece and sit there cooling for 7 s: crack one (3 hits, shots/bash/spaghetti/blasts) for 3 cheddar and a 12% chance of a cheese wedge.

## v2.52 — Milkmaid: MILK SPOUTS
- New attack, in both acts (twice per cycle). She dips low and rams the churn's dasher down; a row of foaming rings appears along the ground ALL AT ONCE (so you can read the whole pattern), each brightening as its turn comes, then they burst one after another (0.24 s apart) into knee-high spouts of milk (0.4 s each) marching at you.
- Act 1: one row from her, through Chris and beyond: hop each spout as it reaches you (it's below jump height), or back off.
- Act 2: two rows march in from both sides and stop short of a two-spout gap near Chris with no ring in it: stand in the gap.
- Not used while the laser cage is up.

## v2.53 — Shop tiles, the lever, Chris at the wheel, a cleaner map
- Shop shelves are a grid of tiles: a big pixel picture on a dark plinth (new icons: Black Rind breastplate, welding torch, moon boots, the gun with a chip on it, the cheese heart, Chris's head for a life, the magnet), level pips, and a price tag. Hover (mouse) or tap shows the name and blurb in the left panel; click (or tap again) buys.
- Lucky Wheel: a pull LEVER beside it. Pulling starts the spin; once it's stopped the lever glows and RESPIN pulls again (uses another spin) without leaving the wheel. SPACE / pad A pulls, ESC / ENTER / tap elsewhere leaves.
- Chris stands beside the wheel: trembling, sweating, wide-eyed while it spins; then jumping about with his gun up (good prize), a glum face (30 / plate), or sat down under a little rain cloud (the rat). New head textures c_head_hope / c_head_joy / c_head_sad.
- Rugged look: no neon frame, sirens, rainbow bulbs or confetti. A bolted steel housing with rust, caged amber work lamps (slow chase while spinning, strobe on a win, dead on the rat), rotating amber beacons on a gantry, a steel clapper, weathered slice paint, a riveted sign plate, a hazard-chevron plinth and welding sparks on a good prize.
- Route map: the ROUTE TO BESSIE banner is gone (the map starts higher), the shop kiosk moved to the empty top-middle sky, and the '?' stubs that gave away hidden warps are removed.

## v2.54 — Pixel title screen
- The painted cover art (assets/title.jpg) is no longer loaded or shown (the file stays in the repo). The title gate and the main menu now share TitleBackdrop (intro.js): a stepped night sky, twinkling stars, a ringed planet, shooting stars, and the curve of the Gruyere Globe with drifting Gruyere holes, Chris standing on it (cape flapping, the odd blast of the gun).

## v2.55 — Leave the wheel, JET TANK, dearer chips, map and title nudges
- Lucky Wheel: fixed not being able to leave (the "finished" timer never ran once it stopped). Now there's a proper < LEAVE button bottom-left (plus tap anywhere / ESC / ENTER / pad B once it's stopped).
- New shop item JET TANK Lv 1-3 (160 / 300 / 460): the jetpack burns 12% slower per level and refills 15% faster. Fills the 5x2 shelf.
- Gun start chips cost 50% more: 270 / 480 / 750.
- Route map: the shop kiosk is back on the left (top corner of the sky), and the whole map sits a few pixels lower.
- Title gate: LUNA CHRIS and the subtitle up in the sky to the right, TAP TO START below them, Chris on the moon to the left (nothing overlaps him); the ringed planet moved lower right.

## v2.56 — Title text centred
- LUNA CHRIS, the subtitle and TAP TO START are centred again (still up in the sky, clear of Chris).

## v2.57 — Mount Mozzarella: anchovies bigger, rats back, a grubbier oven drone that throws pizzas
- Rocket rats back to their old size (v2.51's doubling undone). The anchovy "missiles" are 20% bigger instead (k 1.38, hit radius 11).
- The Toasty Oven Drone has its own sprite ('ovendrone', 110x88, k 1.3, about 75% bigger than before): a brick dome blackened with dithered soot (heaviest round the chimney), a sooty steel chimney, a riveted iron band, glaring furnace eyes, a roaring mouth with a pizza cooking in it, a base plate and three little thrusters. It trails greasy smoke from the chimney and spits embers.
- Every other throw is now a hot PIZZA lobbed in an arc at Chris (trailing smoke, splats on the crust); it can be shot down. The homing pizza cutters alternate with it.

## v2.58 — Rocket rat redrawn
- The L4 rocket rat is redrawn in the cartoon style (toons.js), four frames at 11 fps: the bug-eyed space-rat in a scorched flying cap and brass goggles, straddling a dented red missile with a shark snarl painted on its steel nose, an oven mitt clutching a fizzing pepperoni bomb. The flame gutters and forks, the rocket rattles, his legs pedal, tail cracks, eyes roll down at you, he blinks and sweats, his ear smokes. Eye-pop on hit.

## v2.59 — Chris, the grotesque pass
- THE FACE ACTS: six heads (c_head angry / _blink / _fire gritted with bulging bloodshot eyes and a temple vein / _hurt eyes out, screaming / _grin smug with a gold tooth after a kill / _puff cheeks blown out on the jetpack). The rig picks one every frame (rig.ouch(heavy), rig.grin(), rig.setFace(key) for forced faces: the shop wheel, the bare game-over head). Stubble, a sweaty sheen, a crooked yellow tooth, a bag under the big eye, a scratched and dinged helmet that sits a touch crooked.
- The moustache is its own part (c_tache): it twitches now and then and bristles (bigger, shaking) when he fires or is hit.
- Hands: a hairy wrist and a big cartoon glove (c_arm), white-knuckled fingers wrapped round the gun's grip (c_grip), and the free hand splays open (c_hand_open) when he falls, is hit or is grabbed.
- Smears and impact: the gun arm stretches along the recoil; a hit squashes him for a beat, the helmet rattles, three stars circle his head, and on a HEAVY hit his eyes shoot out on stalks (c_eyepop) and snap back.
- Wonkier, worn: stubby bowed legs with a hand-stitched patch, bigger scuffed clompy boots (28x15), scorched and dented jetpack tanks, popped stitches and a gravy stain over the belly (c_wear overlay; the hand-drawn c_body is untouched).
- The toque is bigger and floppier (42x36, slumped over backwards, greasy, darned) and flops on its own spring: lags when he runs, whips forward when he stops, bobs on landing, sits crooked.

## v2.60 — BLACK RIND, properly drawn
- The armour is no longer a grey recolour. Blue-black lacquered plate with trim by mark (I steel, II bronze, III gold, IV gold with molten studs): the mission badge becomes a pulsing cheese REACTOR (additive glow), an ember seam and panel lines across the chest, rivets, a pauldron rim; a studded gauntlet (and dark grip fingers / open hand), greaves with big knee cops, sabatons with a capped toe and a glowing sole, black tanks with hot vents, a bolted ring round the helmet glass, and a black studded band with a cheese-wedge badge on the toque (which stays white). The belly still hangs out; the cape stays red.
- rig.setArmour(on, mk); textures '__ar<mk>_<key>' built on demand from the suit's own pixels (body, hat) or drawn fresh (arm, leg, boot, tanks, helm ring, glow).

## v2.61 — Cheddar Gorge rebuilt (src/gorge.js)
- THE WHEEL IS THE LEVEL. Three laps = three layers of rind (the wheel's sprite cracks further each lap: jack_rind / 1 / 2). Shots STAGGER it (12 damage: it reels back dizzy for 1.7 s, then 3.2 s before it can be staggered again) and every stagger, and every new lap, flings shards of rind over Chris's head that stick in the ground AHEAD of him as tortilla chips. Only four chips to start; no regrowing; at most eight standing.
- Stumble, don't stall: clipping a chip shatters it and trips Chris (0.5 s slowed, a little hop, "OOF!", no damage); the old pinned-and-squashed instant death is gone. The jalapeno ploughs straight through.
- Rubber band: the wheel runs 16% slower within 170 px of him and 30% faster beyond 520 px.
- The boss is the same wheel: it arrives where the chaser was, wearing the ruined rind; the cracked-core charged-shot finisher is unchanged.
- A jalapeno floats ahead of Chris every 15-21 s (as well as the 30% drop from chips).
- New creatures (grotesque style): CHIP BANDITO (rat in a sombrero, poncho and chilli bandolier, 4 frames), PEPPER WASP (bloated jalapeno wasp, drips hot sauce), SALSA SNAPPER (lives in every other pit: the salsa boils for half a second, then it leaps jaws-first; shoot it out of the air for 200 and cheddar; back in 9 s). Mini wheels redrawn as bug-eyed pups (2 frames).
- The Pepper Jack redrawn: mismatched bloodshot eyes, girder brows, yellow tombstone teeth, drool, pepper warts; it gnashes (2 frames), goes spiral-eyed when stunned, yelps when shot; a veined molten-lidded eye for the core.
- Identity: sunset canyon. depth.js gets a 'gorge' ridge style (stepped flat-topped mesas, banded strata, slot canyons, needles) and a 'chips' foreground (giant tortilla chips, chilli cacti); salsa veins glow in the crust; the pits are full of bubbling salsa; props are cheddar rock arches, chip spires and chilli cacti; the razor chip itself is redrawn (blistered, salted, salsa sliding down it).

## v2.62 — The Rat King's Saucer, stage 1 (src/saucer.js; level 10, open on the map for testing)
- The finale's arena: the curved top deck of the Royal Saucer. Still the polar world underneath (radius 1100) but only +-560 px of it is deck; no planet is drawn, saucerDraw draws the hull (edge plate, bowl, panel seams, rivets, hazard-striped rims, rim lights, thrusters), a hyperspace-streak sky and Parmesan Prime burning in the distance.
- Fall off either rim: OVERBOARD, a heart, dropped back on board near that edge. Deck crew who end up past the rim go overboard too (and count as kills).
- HE STEERS: every 7-11 s (sooner in later waves) the Rat King throws the ship over. 1.3 s warning (alarm, banner, chevrons running along the deck the way you'll slide, the far thruster firing, the King and his knotted lever-rat leaning in), then ~3 s of everything on deck sliding that way (Chris 118 px/s on deck, 60 in the air; crew 95).
- HATCHES: four flaps in the deck; the crew climb out of one away from Chris.
- STRAFING RUN (wave 2 on): an escort fighter crosses overhead and eight bolts walk along the deck, each marked by a red ring for a second first.
- THE CREW (posh): STEWARD (tailcoat, bow tie, monocle, silver cloche), ADMIRAL (bicorne and plume, navy coat, epaulettes, sash, sabre; 9 hp), TOFF (top hat, monocle, cravat, floats under a striped parasol on rocket spats, pops champagne corks you can shoot down).
- The dome sits in the middle with a first sketch of the Grand Rat-King at the yoke (background for now: you run in front of it; a gantry platform sits over it).
- Stand-in boss: Parmesan Prime's mech, until stage 2 (the real Rat King fight with his knotted minions for limbs), then stage 3 (Bessie in the dome, the ending, credits).
- Fix: the Chip Bandito (L6) had no behaviour assigned and stood still; it now walks like the other ground rats.

## v2.63 — The Astro-Rat Armada is an OCEAN WORLD (src/armada.js)
- Two rings: a small rock core (radius 210, the seabed) under a thick translucent ocean up to the waterline (WL 170), open space above for breaches. The view sits lower on this level (def.viewY) and the jet ceiling is 330.
- Swimming: under water gravity is 20% and everything drags. Tap JUMP for a stroke, hold it to swim up, hold DOWN to dive; horizontal speed capped at 75%; no jetpack under water (the tank refills instead). Break the surface holding JUMP and he's kicked out at speed with the jet lit: BREACH! Splashes on the way in and out.
- IRONCLADS sail the waterline (riveted rusty hulls, boot-topping stripe, lit portholes, funnel smoke, turrets, a skull-and-forks flag, rats at the rail). Arcing cannonballs (shootable) that splash and sink slowly once they hit the water; spiky depth charges dropped on anyone swimming underneath (blink, blow up near him or on the seabed). Shots spark off the iron ("TOO THICK! HIT THE KEEL!"): only the glowing yellow KEEL under the waterline can be hurt.
- TORPEDO RATS: rats in diving goggles strapped to propeller torpedoes. They cruise near him, shudder and stream bubbles while they line up, then dart in a straight line.
- Boss: THE RAT DREADNOUGHT (replaces the flagship here): the biggest ironclad, three keels (each a third of its health, "A KEEL IS BREACHED!"), broadsides of three, depth charges in pairs, launches torpedo rats.
- The ocean: depth-banded water, swaying light shafts, a faint wash over everything under the surface, a foamy white wave crest, bubbles off his shots and helmet and up from the seabed. The seabed has kelp, a sunken wreck, giant clams and scrap. Floating wreckage ledges high above the waves. Drones and jetpack rats fly above the water.

## v2.64 — Armada: a deeper ocean, Nibblers, bubbles not buzzing
- Fixed the buzz when swimming up: the jetpack flicked on and off every frame under water. The jet can't light under water now, and swimming makes bubbly sine blips instead (each stroke, and every so often while moving).
- Deeper ocean: seabed radius 170, waterline 270 (was 210 / 170); floating wreckage at ~350; the whole ring is drawn.
- NIBBLERS: shoals of little bug-eyed buck-toothed puffers (orange or blue, 1 hp, 50 pts) that swarm round Chris, each keeping its own spot, and dart in for a peck when he's close. They go POP: a juicy pop sound, a ring of bubbles, a flash. Schools of 5-8 come in every wave, and the Dreadnought sends them too.
- More enemies per wave (schools, more torpedo rats). The Dreadnought is lighter: 90 hp (30 per keel), was 150.

## v2.65 — The Rat King's Saucer, stage 2: he breaks out (src/saucer.js)
- After the three waves the Rat King shudders in the dome, cracks spread across the glass, and he SMASHES out (glass everywhere, the dome left a jagged stub). Nobody's at the wheel: the saucer DIVES.
- The dive: the ship never sits level (a constant wobble on top of the pitches), pitches come every 2.5-4.5 s with only 0.7 s of warning, and FREE FALL (gravity x0.35, you float off the deck) / PULL UP (x1.55, a crushing lurch) spells alternate with plain diving. Streaks rush up past, Parmesan Prime swells below, flames stream off the rims.
- THE GRAND RAT-KING (new body, 3 poses): a bloated mangy rat in a tattered robe and ermine collar, a dented crown, the one huge bloodshot eye, a sagging belly - and for arms, two writhing KNOTS of his own minions, tails tangled, a fist of a rat on the end. 200 hp; faster below half.
  - KNOT SWEEP: a wind-up (red warning band, "JUMP!" or "DUCK!"), then the knot sweeps across in front of him, low or high.
  - MINION TOSS: he plucks Stewards off his arm and lobs them across the deck.
  - BELLY SLAM: a crouch, a huge leap at Chris, and a shockwave running both ways along the deck (jump it); the ship pitches toward the impact.
  - He slides with the deck too, but hangs on at the rim.
- Gravity is now scaled per-scene (this.gravMul, reset on every level start).

## v2.66 — Armada: air, shark rats, Star Fox keels
- AIR: 15 s under water, refilled in 2.5 s above it. A ring of five bubbles over his head while it's below full; red, shaking and beeping in the last third ("AIR! GET TO THE SURFACE!"). Out of air: a heart every 1.4 s until he surfaces.
- More danger above the water: while Chris is above the waterline the ships fire twice as often and lead their shots.
- SHARK RATS (5 hp, 350): a scarred grey shark body with a rat's head where the snout should be, ringed with shark teeth. They circle him, twitch, then lunge with their jaws wide; when he's above water the fin cuts along the surface after him. 1-2 per wave.
- Keels, Star Fox style (ironclads and the Dreadnought): each is its own plate sprite now, tinted green -> amber -> red as it takes damage, cracking at two-thirds, smoking and flashing at a third; blown off, it leaves a ragged smoking hole that leaks bubbles and embers (and the hitbox is gone). Smaller hit circle (11 px x scale). Damage is clamped per keel, and the boss's health is always the keels' total, so it spreads evenly across the three.

## v2.67 — Royal Saucer: laser turrets, a proper breakout
- LASER TURRETS (new deck enemy, saucer.js): an armoured base bolted to the deck (hazard stripes), a glass bubble with a goggled rat gunner, and a twin-barrelled gun that tracks Chris. It takes aim (a flickering red sight line, 0.55 s), then fires. They come up through the hatches, don't slide, and every wave they're tougher and quicker: wave 1 4 hp, one bolt every 2.4 s at 380; wave 2 7 hp, bursts of 2 every 1.85 s at 490; wave 3 10 hp, bursts of 3 every 1.3 s at 600; they track faster too. 2 in wave 1, 3 in wave 2, 4 in wave 3.
- The Rat King's breakout now takes ~4.3 s: eight blows on the glass, coming faster and harder. Each one: he throws himself at it (lunge and squash), a flash, a thud, a shake that grows, a spray of shards, and a new starburst of cracks (the earlier ones keep spreading). After the third: "THE GLASS IS GIVING WAY...". Then the final smash. His full-size body stays hidden until he's out.

### v2.68 — King's breakout: 3 s, fists, wrecked dome
- Breakout shortened to ~3 s (8 blows at 0.3–2.75 s, out at 3.0 s).
- The King now visibly pounds the glass with his fists ('kfist': mangy clawed fist, signet ring, ermine cuff) on robe-sleeve arms, alternating left/right: each fist winds back (G.windup over 0.28 s before a blow) then slams out to the crack point and swells toward the camera. Drawn above the crack layer so every punch reads.
- Each blow: big comic word (BANG!/THUD!/CRACK!/WHAM!/CRUNCH!/SMASH!), white flash + shock ring + speed lines at the impact, hit-stop, harder shake, crash sfx.
- 'sdome_broken' redrawn: jagged glass teeth all round the rim, buckled snapped ribs, scorched open interior, smashed console with bent yoke and hanging wires. After he leaves the wreck smokes and sparks, and glass litters the deck around it.

### v2.69 — Playtest recorder (balancing groundwork)
- New src/telemetry.js (loaded after shop.js). Every level attempt is logged on the device (localStorage 'lc_tel_v1', last 80): level, difficulty, build, Chris's kit on arrival (gun levels, chips, max hearts, armour mark/plates, boots, tank, magnet, burgers, lives, cheddar), result (won / died / quit), and per segment (W1..W3, BOSS): time, hearts lost, armour plates lost, kills, cheddar picked up, average and peak enemies on screen and enemy shots in flight, gun level in/out, boss HP and how much was left.
- ?tel in the URL shows a small panel (live wave stats + EXPORT / CLEAR / HIDE); it stays on until ?tel=0 or HIDE. EXPORT shares the JSON file on phones, downloads it on desktop, and copies it to the clipboard.
- Hooks: Tel.begin in create, Tel.tick in update, Tel.kill on enemy death, Tel.end on die()/startRescue(); Shop.earn is wrapped to count cheddar.
- The Balance Lab (an artifact) models Chris's expected power per level from the shop and cheddar income, scores every enemy's threat, compares each level's wave pressure to a target curve (power × "surpass"), and reads these exports.

### v2.70 — First balance pass (from the Balance Lab model)
- Levels 1-4: waves moved at most 10% towards the target curve. L2 has ~10% fewer enemies (still the hardest early level by the model); L3 and L4 slightly busier.
- Levels 5-10: moved onto the target. Split two ways so phones cope: enemies get tougher (new level `hpMul`: 1.58 on L5-9, 1.7 on L10; applied in makeEnemy via hpMul(); enemies with 1 HP, ironclads and laser turrets are exempt), and wave counts rise for the rest (roughly 2-3x; big jumps also stretch the wave up to 1.5x longer). No extra turrets or ironclads were added. Kills per minute now climbs through the game.
- Bosses: L1 155->170, L3 200->220, L4 240->265, L5 150->300, L8 180->360, L9 240->480, L10 200->300. L2 Baron (was a slog), L6 Pepper Jack (stagger mechanic) and L7 Dreadnought (keels) unchanged.
- Shop: every price 10% cheaper (armour, boots, chips, tank, hearts, magnet, life, patch).
- Note: L8 (Lactose Labyrinth) currently runs as the cave test with no waves, so its new waves don't play yet.
- Generated by scratchpad rebal.py from the Lab's model (surpass 10%, ramp ±12%); retune from playtest exports.

### v2.71 — Lactose Labyrinth rebuild, part 1 (src/labyrinth.js)
- Surface: dead and quiet. Grey-violet sky, a dusty grey Swiss surface, no ledges, skulls; the music cuts out; tumbleweeds blow through. A boulder ('labboulder') plugs the hole next to a rat-skull warning sign; every few seconds it WOBBLES (dust, a clunk) and every third wobble something under it moos. 10 shots break it ("...A WAY DOWN."), then the hole is open. The music starts when you drop in.
- Underground: 3 tunnel rings + the core (R 950 / 800 / 650 / 480, ceil 112, core 140). Rock walls split rings into chambers; floor holes drop to the ring below; only `path` leads on. Ring 1 has 3 holes (2 drop into dead-end pockets in ring 2: a rat nest with a 60-cheddar hoard, a grub pit with a cheese wedge). Ring 2's route chamber drops to ring 3; from ring 3 you can jet UP into a hidden ring-2 hoard (120 cheddar + wedge). Dead ends are escaped by jetting up through the hole you fell in.
- Darkness: a RenderTexture over the world (depth 14), 93% black underground / 50% on the surface; Chris's lamp (bigger the way he faces), shots, cheese surges, cheese veins, loot, valves, the pump outlet and pipe pulses are erased out of it. Enemies' red eyes glint in the dark beyond the lamp, and blink.
- Look: rotten Swiss rock with mould-rimmed holes and glinting cheese veins; floor crust with bones, skulls and mould; stalactites like rotten teeth dripping whey; rock walls as fleshy pillars with teeth and a skull; shafts with dripping edges. Bessie's FEED PIPES run along the roofs of the route chambers only, and the cheese pulses flow TOWARDS the way on (and drips down into the right hole) - the wayfinding. The arrow HUD is gone; the corner map only shows what you've explored.
- New vermin (ENEMY, labAI): RIND-TICK walks the ceiling upside down, drops on you when you pass under, then scuttles; WALL-GNAWER clings to a rock wall, crawling up and down, and leaps at you when you're on its side; MOULD-GRUB hides under the floor (the crust twitches), bursts out when you're close, then lunges in short dashes. Paladins remain the floor heavies. Each ring's vermin are spawned when you enter and remembered (dead stay dead) when you leave.
- Still to come (part 2): the core rebuilt - Bessie strapped into the milking machine, and the Milkmaster boss.

### v2.72 — Labyrinth fixes
- Fixed: dying in the Labyrinth and retrying crashed (the darkness RenderTexture and other L8 objects were kept across the scene restart). create() now clears them.
- The cheese surges along the tunnels (the yellow waves you jumped/ducked) are gone: no `outlet` on any ring.
- Ring changes are one continuous fall/climb: Chris keeps his spot in space and is re-measured from the new ring when he's halfway through the shaft (labGap), and the camera glides after him (camSlide eases at 3.2/s, was 7).
- Surface: the old cheese-wedge piles (pile_rind) replaced with new props - rusty feed pipes jutting from the ground with a valve wheel and a last cheese drip, half-buried rib cages, a tipped-over mine cart. A big dead cracked moon hangs in the sky (labmoon, slow parallax), dead spires and wreck silhouettes on the horizon (depth ridges), dark crags in front, sphere shading on the planet. Tumbleweeds kick up dust. All of it hides underground (drawDepth skips when the cave ring > 0).

### v2.73 — Ceramic Grill Freefall rebuilt (src/freefall.js)
- Art: pixel-art canvas tiles (shown 2x). The back of the shaft is a bowed glazed egg (darker at the sides, a wet sheen down it), crazed glaze, soot dribbling from riveted steel bands that bow across, grease streaks. The side walls sweep round towards the camera with a bright lip highlight and chips. It gets warmer and redder the deeper you go (ADD heat bands), then a screen heat haze.
- Grates: tiled cast-iron bars (lit top, char, burnt grease) with burnt sausages and coals stuck on them; hot grates glow orange with heat shimmer; sliding grates use a pool of tile sprites. The way through each grate glows from below.
- Bottom: a bed of 70 coals breathing orange, flames licking up (3-frame ffflame, ADD), the pizza stone.
- Feel: speed lines rushing up (more and longer the faster), the camera looks further ahead at speed, smoke drifting behind and in front with parallax, embers streaming up, daylight from the lid fading above. Every knock: hit-stop, screen jolt, sparks, a squash on Chris, eye-pop (rig.ouch) and a comic word (BONK!/CLANG!/DOINK!/SKEWERED!...). Faces: gritted teeth boosting, cheeks blown out braking/fast; the hat flaps on its spring, arms shake, cape ripples; the wingsuit snaps open with a whump.
- Sprites redrawn hand-drawn: cheese wedges (trail), a kebab skewer with meat/pepper/onion/tomato, a greasy steel spatula on a wooden arm.
- Hazards: BACON RATS patrol the grates (35%/60% of rows), burnt SAUSAGES roll off grates ahead and tumble down, a greasy PATTY on the wall drips streams of grease (GREASED, -1s), GREASE FLARE-UPS sizzle then burst up through a grate (-2s). The second half has faster sliding grates and skewers, more flare-ups and vents.
- Finale: the last 15% is THE PLUNGE - cruise speed up, flames off the walls, roaring, stronger heat haze.
- The foil sheets and the BOOST! sign were removed (unused).

### v2.74 — Freefall: standard controls, no confusing bands, SPLAT deaths
- Controls match the main game: touch is one floating MOVE stick wherever the thumb lands (steer left/right, push UP = brake like jumping/jetting, pull DOWN = boost like ducking); the old custom circle buttons and mouse click-steering are gone. Keyboard and pad unchanged (jump = brake, down = boost; LT jetpack also brakes).
- The grey steel bands across the walls (they read like grates) are gone: glossy glaze runs and soot dribbles on the back wall, a vertical rivet seam on the side walls.
- Hazards now KILL: skewer, spatula, bacon rat, sausage, grate flare-up, wall flare-up vent, hot grate. Chris goes SPLAT: hit-stop, red flash, big shake, a burst of sauce (ffsplat) on the spot with drips running down, his hat, head, moustache, boots, an arm, a hand, a leg and his apron tumbling away, two eyeballs bouncing (ffeye), a splat on the lens that slides off, "SPLAT!", then a SPLATTED! results screen naming what got him (AGAIN / MAP). Plain grates still just bounce you (-1s); grease drips just slick you sideways (-1s); smoke just slows you.

### v2.75 — Freefall: the grates are deadly
- Missing the gap in a grate (plain or hot) is now a SPLAT death like the other hazards ("GRATED!", "GRILLED!", "SLICED BY THE BARS!", "CHAR-MARKED!", hot: "SIZZLED ON A HOT GRATE!"). The gap test is a little more forgiving at the edges (8 px each side, was 12). Grease drips and smoke still don't kill.

### v2.76 — Freefall made flyable (bot-tested)
- Tuned with a bot that only reacts to what's on screen, with a ~0.2 s reaction delay (scratchpad botff.py, 14 runs each): reaching the bottom went 1/14 -> 8/14; grate deaths 4/14 -> ~0.
- See further: on short (landscape phone) screens the world camera zooms out (zoom = H/600) so ~2 grates are visible; the HUD is drawn by its own unzoomed camera (objects are sorted onto a camera by scroll factor in 'prerender'). Chris rides high on the screen (24% down, higher at speed).
- WHERE NEXT: chevrons mark the next grate's gap (blue on BRAKE rows); while it's still below the screen they sit on the bottom edge right above it, with a faint second marker for the grate after.
- Turn in time: steering 300 -> 370 px/s and snappier; cruise fall 470 -> 410 (plunge 560 -> 480), boost cap 760 -> 700. Gaps wider (124-150 -> 142-168); switchbacks have more room (270-300 -> 330-360 below).
- Lethal hazards made fair: skewers sit BESIDE the line (150-190 px off it), shorter (len 105) and a bit slower, so their tips sweep across it; spatulas slower and shorter; wall flare-ups warn for 1.1 s (was 0.8) and reach 230 (was 270); sausages rarer and slower. The cage needs 75% of the cheese (was 85%).
- Fixed: AGAIN after a splat left Chris frozen (splat state now reset in create).

### v2.77 — Bonus rooms: 3 tries
- Each bonus room (Zero-G, Grill Freefall, Centrifuge) gives 3 goes at its prize gun. A go is counted when the room starts (quitting out still uses it). Progress: lc_btry_<id> (goes used), lc_bwon_<id> (cleared); Progress.bonusLocked(id) = not cleared and 3 used. Shared rules in the Bonus helper (main.js).
- Clear it with goes to spare and each spare go is +50 cheddar (first try = +100). Fail the 3rd and the room LOCKS: the results screen says the gun is gone, there's no AGAIN, and the map node shows a red cross and LOCKED (tapping it just clunks).
- The intro message shows TRY n OF 3 (LAST CHANCE! on the 3rd). The map shows TRIES n/3, CLEARED or LOCKED under each bonus room.
- A cleared room can be replayed as a practice run: no prize, no tries used.
- Centrifuge: if it's locked, the Triangle's warp goes straight on to the Fondue Fountain (and the Fountain opens on the map once found), so the warp road isn't lost - only the gun.
- Test mode never uses up tries.

### v2.78 — Parmesan Prime part 1 (src/parmesan.js)
- The rats' homeworld, rebuilt: giant dotted "PARMESAN PRIME" rind lettering stamped round the planet under the surface, glinting crystals, a ruined rat empire on top (cracked statues of the King, broken marble columns, torn royal banners), a molten red sky with palace spires and wrecks on the horizon (depth ridges).
- THE ROYAL RASP: a planet-sized grater face on cables from a mining ship sweeps right round the planet every 11-15 s. A 2 s warning (siren, blips, an arrow on the side it's coming from, a red band at its height and JUMP!/DUCK!): LOW (h 0-36, jump it) or HIGH (h 24-118, duck under it). It shreds any rat in its path (+150 each). Each full lap grates ~13 units off: THE PLANET SHRINKS (R 520 -> min 380). Retrying from a checkpoint starts it already grated down (45 per wave).
- Crumbling ground: cracks spread ahead of Chris for 1.7 s (glowing), then the ground falls away into a chasm down to the glowing core (a 'pit' crater: fall in and you're hauled out a heart lighter) for 10-13 s before rubble fills it. At most 2 at a time.
- Palace rubble rains down (columns, marble King heads, gold dome chunks) with the shadow warning (def.debris.tex).
- New enemies (ENEMY + parmAI):
  - ROYAL GUARD (hp 9): tower shield in front - shots from the front plink off (ppHitK), 1.5x from behind; slow to turn (0.6 s); halberd JAB when close (0.45 s wind-up flash, then a thrust).
  - GRENADIER (hp 5): keeps 230-380 away, lobs rind grenades that bounce once and go off after 1.5 s (58 radius).
  - THE TAXMAN (hp 6): runs at you and snatches up to 40 cheddar (no damage; noTouch), then legs it for 6.5 s. Splat him for a TAX REFUND of double; let him go and it's gone. If you're broke he slaps you instead.
  - COCKROACH CAVALRY (hp 7): paws the ground (0.75 s, dust), then charges at 400 straight through; jump it. Skids, turns, again.
- New waves built round them; the old Rat-King boss stays for now (part 2: the Parmesan Colossus and the escape).

### v2.79 — Parmesan Prime part 2: the Colossus, the escape, the finale joined up
- Story: L8 the King's saucer snatches Bessie from the milking machine (part 2 of the Labyrinth to show it) -> L9 chase them to the rat homeworld, beat his statue, grab his saucer as it flees -> L10 the real fight on board. CFG.finalLevel = 10: the ending plays after the Saucer; L10 opens only once L9 is beaten (test mode still opens it); the map joins 9 -> 10 and Bessie's UFO marker sits over 10.
- THE PARMESAN COLOSSUS (boss ai 'colossus', textures colossus/colossus_b/colhead/colrubble, hp 480): wakes for 2.2 s (shots plink off). Phase 1: plods after you, STOMP (a foot lifts and wobbles 0.6 s, then a shockwave ridge runs round the ground both ways - jump it) and CROWN LASER (red sight line 0.85 s, then a beam sweeps across the ground through you). Phase 2 (<65%): cracks open, three glowing crystals (knee/chest/crown, h 40/95/150): 1.6x near a crystal, 0.3x elsewhere; faster stomps, double lasers. Phase 3 (<30%): the head snaps off (the body stays as a crumbled heap) and bounces after you in big arcs - a shockwave each landing, a fan of 3 rubble lumps every 1.4-2 s, crown laser.
- THE ESCAPE (win() on L9 -> parmEscape): the King swoops in on the Royal Saucer laughing ("A STATUE?! HA HA HA!"), Bessie in the dome; the planet SPLITS. A collapse front chases you (a black rift to the core behind it; rubber-banded 170-260), chasms open ahead (0.9 s warning), palace rubble rains. The saucer pulls away at 150 (you run 230) with a ladder dangling: touch the bottom rung to grab it. Caught by the front = a heart (never the last) and you're thrown clear. Grab -> the saucer climbs away, the planet cracks apart, white-out, Level 10 starts straight away (beat + rank recorded for L9; no results screen) with "HANGING ON BY A RUNG...".
- Ending: opens "IN THE SMOKING WRECK OF THE ROYAL SAUCER..."; credits add CLAUDE and GEMINI under "CODE, ART AND CHEESE WRANGLING".

### v2.80 — Parmesan Prime art pass (src/parmart.js)
- A richer pixel painter, ppPaint: 5-tone ramps with ordered dithering and grain, sphere / cylinder / flat / polygon lighting from the upper left, onion domes, jagged cracks with a lit edge, crystal glints, pitting, glowing arched windows, the rat-crown emblem, ink outline. Shared ramps PPR (marble, vein, gold, parmesan, rind, royal red, blue, stone, steel, rust, fire).
- The planet is painted (makeParmPlanet via surface.parm): a thick rind with the giant dotted "PARMESAN PRIME" lettering stamped right round it (dark pits with lit lower lips), hard granular paste with crunchy white crystals and strata, sectors grated into grooves by the Rasp, fissures glowing as they near a molten core. (The live dot lettering is gone.)
- The city on the horizon (behind the planet's curve, rotating with it): the GREAT PALACE (marble hall on steps, glowing arched windows, towers, the great gold onion dome cracked with a bite out of it showing iron ribs, banners, a fallen corner), MINARETS (one blown open, a chain dangling), the TRIUMPHAL ARCH (the King in relief, its attic broken away), the TEMPLE (snapped columns, a fallen beam, a bite out of the pediment), the COLOSSAL STATUE (scaffolded, an arm gone). A dusky far skyline behind. The mining machines chewing it up: DRILL RIGS (rusty girder towers, smokestacks, hazard stripes, the bit turning and sparking) and a GRATER CRAWLER shaving a hill into a pile of shavings. The mining mothership hangs in the sky.
- The street: statues of the King (an arm on the ground), fluted columns with gold acanthus capitals, snapped columns, tattered embroidered banners with tassels, a broken fountain spouting cheese, rubble with gold dome shards, gold tripod braziers burning (animated flames + glow). Ledges are marble balconies (PLATFORMS.marble).
- Gone: the gear backdrop, the triangle spire/crag ridges, the lava pools, the old scrap/skull props and crystal/energy/girder ledges.
- Repainted with ppPaint: the Royal Guard, Grenadier, Taxman, Cockroach Cavalry, the grenade, and the Colossus (flaking red paint over the cheese, ermine, crown and sceptre; cracked version blazing with crystals), its head and rubble.
- Sky: wine-dark to burning orange.

### v2.81 - Parmesan Prime: proper depth
- L9 now layers like the early levels. Far parallax ring 'skyline' (depth.js): domed palaces with bites out of the domes, leaning minarets, colonnades with snapped columns, triumphal arches, lit windows. Nearer ring 'machines': lattice drill rigs with warning lamps, cranes swinging graters, grater crawlers.
- Giant dark statues of the King and snapped columns loom behind the horizon (L2-style composed props); rubble and broken columns sit in front of the camera.
- New fg strip 'ruins': a snapped column, the King's toppled head, a lit lamp post, a tattered banner, a shard of the gold dome - top edges lit by the burning sky.
- A burning wine/orange nebula. The near city sprites now parallax slightly; the old flat far-city sprite layer is gone.

### v2.82 - the King's statues, sculpted
- New `ppSculpt` painter (parmart.js): smooth canvas curves and gradients, crushed to the game palette with ordered dithering, carved dark contours and an ink outline.
- `ppKingStatue`: the fat Rat King on a plinth - porphyry cape with ermine hem, gold-leaf crown/belt/teeth, sceptre raised, blank carved eyes under a heavy cruel lid, a wart, sagging jowls; tail draped over a laurel-and-crown relief panel. Weathered: grime streaks, gold leaf flaking, cracks, a chunk knocked out of the plinth, a chipped ear, pigeon mess on the crown.
- Variants: ppstatue2 (intact), ppstatue3 (sceptre arm snapped off and lying on the step, Parmesan showing through the break, crown slipped), ppstatue_big (the big background silhouettes), ppb_statue (the colossal one in the city, broken and scaffolded with a ladder and jib).

### v2.83 - the Armada goes deep
- New src/seaart.js: sculpted (ppSculpt) deep-sea props in a sea palette - orange and pink staghorn coral with lit polyps, a lacy purple sea fan, brain coral, an anemone with glowing tentacle tips, tall kelp with gold bladders, a giant clam with a glowing pearl, and a sunken rat ironclad snapped in two (rusting rivets, ghostly cyan portholes, toppled funnel, drooping gun, a gilded crowned rat figurehead, coral and barnacles growing over it). Replaces the old kelp/wreck/clam/scrap pixel sprites.
- Deep-sea parallax (depth.js): a far 'reef' ring (coral towers, sea fans, kelp ribbons, rock arches, glowing tips), sunken ships nearer, a nearer reef with pink glows; the water bands wash over them so the far layers fade blue. Big blue-tinted wrecks and coral loom behind the core. New fg strip 'coral' in front of the camera.
- The map node and the HUD radar now show L7 as an ocean world (oceanglobe texture; drawMiniPlanet id 7).
- ppSculpt takes an optional palette (opts.pal).

### v2.84 - Armada: the green flash, and calmer
- Fixed the green screen flash on L7: the ironclads' keel glow multiplied its own scale by 1.2 every frame; while a ship was round the far side place() didn't reset it, so it grew to millions of pixels and washed the screen green when it came back. Now scaled from its base scale, and hidden round the far side.
- The ocean bands are drawn as quad strips instead of one big ring polygon (safer triangulation).
- Toned down: fewer, smaller seabed props, nothing parked in front of the camera, dimmer reef glows and light shafts, fainter background coral.

### v2.85 - Parmesan Prime: steady city, a fairer Rasp
- Fixed the city flicking round: the near buildings' parallax used the WRAPPED view angle, which jumps by a full lap at 0/2pi, so the city snapped 0.9 rad sideways every lap. Now uses the unwrapped one.
- The Royal Rasp: warning 2.6 s (was 2), starts further off, and rumbles in at 470 px/s near Chris (was 820) - it only hurries round the back of the planet. While it's off screen and coming at him, an edge arrow grows and pulses faster as it closes, with JUMP!/DUCK! and a distance in metres, blipping.
- Visible grating: curls and flakes of Parmesan (ppshave/ppshave2) peel off the cutting edge in a constant spray, arc up and back, land and lie there; cheese dust puffs; a raw freshly-shaved strip glows on the ground behind it.

### v2.86 - Lactose Labyrinth part 2: deeper, and THE CORE
- A fourth maze ring, THE ROT (R 515): three floor holes, two drop into sealed pockets of the ring below (a rat nest, hoards), the middle one leads on. Rings re-spaced (950/805/660/515/370). The bottom ring is now an antechamber with walls and pockets, and a shuddering steel HATCH in the floor with milk pipes plunging into it and light leaking round it.
- Stand on the hatch: it gives way, level1 sleeps, and THE CORE runs in the centrifuge scene (data.core; src/core.js mixes into CentrifugeScene). No gravity at all; its own spin programme (dead stops = float straight across).
- THE MILKMASTER: a mad rat scientist on a hover-churn (goggles, wild hair, syringe of milk, milk tank on his back), hosed to Bessie's udders at the hub in a milking cradle. BESSIE'S MILK bar drains while he's plugged in (dry = lose).
  1 Shield bubble powered by 3 pumps on the drum wall (each bust slows the drain); milk squirts and curd bombs that burst into rings.
  2 Bubble pops: hover + 5-way spray, red sight-line then a CHARGE across the drum, drones. Stomp him for big damage.
  3 MILK OVERDRIVE (<40%): hose into himself, swells and glows, spinning rings of milk with a gap; the drain resumes, faster.
- Beat him, grab Bessie... the churn's roof tears open and the Rat King's saucer beams her away ("MWAHAHA! THE COW IS MINE!"). Back up to the labyrinth: level clear, on to Parmesan Prime. Losing in the core = a death in the labyrinth.

### v2.87 - The Core looks like a core, and has gravity again
- Gravity is back in the core: the centrifuge rules (the spin pins you to the wall; as it winds down to a stop, gravity takes over and you fall).
- New look (core.js): the churn is a ring of pitted rind crust and craggy rock hung in the molten heart of the moon - glowing veins of molten cheese running out from the hub, tyrosine crystal clusters, glowing crystal studs round the wall (to read the spin), hot cracks in the outer rock, a film of milk spun against the wall. Behind it, the moon's heart: a throbbing white-hot glow, rough rings of strata, molten rivers running inwards, boulders and crystal shards drifting round, embers rising. The cogs, motor and factory are hidden.

### v2.88 - The Core uses Chris's real hearts
- No more separate 8-pip armour in the core: Chris's cheese hearts come down from the labyrinth, a hit costs half a heart (as everywhere else), and whatever's left goes back up with him. The bonus centrifuge keeps its armour pips.

### v2.89 - The Lactose Labyrinth is a real maze
- Rebuilt the 4 rings as a chamber maze: rock walls split each ring into chambers, floor holes join a chamber to the one below (jet back up through them). The true route: down 3 rings, back UP 3, down 2, up 2, then down 4 to the hatch - 14 drops/climbs and ~7,800px of tunnel (checked with a shortest-path script and a scripted run through every hole).
- Dead ends: a pocket by the start, a rat nest at the bottom of ring 4, and a secret shaft by the start that plunges three rings to a big hoard (+ another stash off it). Hoards and wedges in the pockets.
- The roof pipes on the true route pulse towards the way on; the compass now points at the hatch to the core, NOT at the exit of the chamber (that solved the maze for you).
- No more pump surges or valves. Many more vermin: ~16/21/17/19 per ring + the antechamber. Bessie's drowning clock 520 s (was 330) for the longer route.

### v2.90 - Parmesan Prime: the collapsing layers
- The planet now caves in, layer by layer. After wave 1 the crust gives way: the ground quakes harder and harder, rubble (columns, domes, the King's head) rains down, the city sinks and tilts, then the ground splits under Chris - AAAAARGH - the screen goes dark with rubble whooshing up past, and he drops onto THE MINES (radius 420): raw grated paste, timber pit-props with lanterns, mine carts heaped with grated cheese, grater-wheel gantries, crystal seams. After wave 2 the mines cave in too: THE CRYSTAL CORE (radius 320) - a crust of crystal facets, great glowing crystal clusters, a bigger molten core - for wave 3 and the boss.
- Underground: a dark sheet over the sky (no skyline), the cavern roof far overhead (the underside of the layer above: jagged, dripping old cheese, crystals glinting) with the holes you fell through and shafts of light coming down them.
- Molten-cheese geysers in the mines (3) and the core (5): they bubble (1.3 s warning), then blast a scalding column 230 high for 1.5 s. Kills vermin too.
- The Rasp keeps grinding each layer down (~30 units a lap, up to 70 below the layer's size), so it never stops shrinking. Cracks/sinkholes keep opening (up to 3 at once down below).
- Fewer rats: the waves are about half the size (8/12/13), the hazards do more of the work.
- Planet texture variants (makeParmPlanet layer 1/2), new sculpted props (makeParmDeep), shading re-made for each size. Fixed: when R shrank, the planet's centre wasn't re-anchored (layout() only sets it on resize), so the ground slid down the screen; parmDraw now re-anchors it every frame.
- Checkpoint retries start on the right layer.

### v2.91 - Parmesan Prime: a crowd for every layer, everyone repainted, one more drop
- src/parmfolk.js: every L9 enemy re-sculpted (ppSculpt, 1.5x density, k/r/ch rescaled to keep the hit boxes): palace guard (gold breastplate, plumed helm, crown shield, halberd), grenadier (shako, bomb belt; a lit bomb raised), the Taxman (top hat, monocle, gold waistcoat, money sack), cavalry (a helmed knight with a lance on an armoured, caparisoned war-rat).
- New folk, each with its own AI (parmAI) and their own layer:
  THE MINES: miner (burrows under you as a moving mound, bursts up beneath you, swings a pickaxe, digs off again), dynamiter (lobs a lit stick with a long fuse: a bigger blast that blows a sinkhole in the ground), runaway mine cart (charges round and round the planet with a goggled rat driver - jump it).
  THE CRYSTAL CORE: crystal mite (hops at you, bursts into falling crystal shards when killed), molten slug (oozes after you leaving a burning trail), crystal golem (rises out of the crystal, slams the ground: shockwaves run both ways - jump them).
- Waves back up to 14-15 each, themed per layer (city / mines / core).
- A third drop: clearing wave 3 cracks the core open into THE MOLTEN HEART (radius 250, a planet that's mostly glowing molten core) - the boss's arena.

### v2.92 - The Rasp no longer clears your waves
- The Royal Rasp used to flatten every enemy it passed, wiping wave 1 for you. It's the Empire's own machine: the rats now hop the low pass (or flatten under the high one) and carry on. It only hurts Chris.

### v2.93 - Parmesan Prime's folk redrawn in the house style
- src/parmfolk.js rewritten with pixSprite (hard pixels, 3 flat tones, dark outline) to match the rest of the cast instead of the smooth dithered sculpts: huge mismatched bloodshot eyes in dark sockets with pin-prick pupils, a heavy scowl, a long warty snout, a maw of crooked teeth, a lolling tongue, drool that stretches and drips, scrawny limbs, pot belly, kinked whip tail.
- Everyone has a 4-frame cycle (key, _w1.._w3: legs scissor, body bobs, tail cracks, tongue flaps) plus action frames: ppgren_b (lit bomb wound back), ppminer_r / ppminer_b (pick raised / buried, sparks), ppdyna_b (lit stick held high), ppgolem_b (fists up). ENEMY.eyes set so their eyes pop on a hit.
- Guard (dented gold breastplate, plumed helm, crown shield, halberd), grenadier (shako, bomb belt), Taxman (top hat, monocle, straining gold waistcoat, sack of cheddar shedding coins), cavalry (tin-pot knight on a slobbering bug-eyed war-rat), miner, dynamiter, mine cart (goggled driver, tongue streaming back, spinning spokes), crystal mite, molten slug (eyes on stalks), crystal golem (crystal fangs).

### v2.94 - The Parmesan Colossus redrawn: the King's statue, alive
- src/parmboss.js (makeColossus3): the boss is now the same fat marble Rat King as the city's statues, alive and grotesque in the house pixel style - one huge bloodshot eyeball rolling in a marble socket, the other a blank cracked stone eye (it glows once he's wrecked), a stone scowl, a long warty snout, a maw of crooked gold teeth with a slab of tongue and molten cheese dribbling, big round rat ears (one chipped), a flaking gold crown with pigeon mess, porphyry cape with ermine hem, gold belt, sceptre for a walking stick. 132x180 at 1.35.
- Animated: a 4-frame lumbering walk (footfalls shake the screen), a stomp wind-up (leg hauled up, sceptre raised like a club), a laser frame (maw wide, the eye blazing white-hot - the beam now comes from the eye). Phase 2 has its own full set: an arm snapped off to a crystal stump, glowing fissures, crystal clusters bursting out at the three weak points. Phase 3 head: two frames (screams through the air and when spitting). New rubble heap (cape, a leg sole-up, the sceptre).

### v2.95 - Parmesan Prime city: layering pass
- Nothing parked in front of the camera any more (the big foreground rubble and columns hid the enemies): the only foreground is the thin parallax ruins silhouette at the bottom.
- Street furniture smaller and fewer (statues 0.62-0.7, columns, banners, rubble) so it reads as set-dressing behind the action.
- The palaces behind the horizon are dimmer and sit behind a band of orange heat-haze (ppHaze, depth 1.02), so the street and the fight stand out in front.
- The blimp flies: it cruises across the sky, slides with the camera, bobs, noses up and down, trails smoke, and turns round when it's gone off the side. A second, smaller, darker one flies the other way far off.
- New fountain in the house pixel style, sat flat on the street, 4 frames: a rat cherub spitting an arc of molten cheese, ripples, splash, the cracked rim dribbling.

### v2.96 - Parmesan Prime's buildings redrawn (parmcity.js)
- All the horizon set-pieces in the house pixel style, and an EMPIRE's capital rather than temples: THE ROYAL PALACE (grand stair with a red carpet, colonnade, tall lit windows, banners, a pediment with the royal crest, a rotunda roofed with a colossal gold crown - a bite out of it, scaffolded - wing towers roofed with giant wedges of holey cheese, flags; the right wing split open), THE VICTORY COLUMN (gold spiral, the King in gold on top), THE TRIUMPHAL ARCH (sky through it, reliefs of the King, a gold cheese-wheel chariot on top), THE ROYAL TREASURY (a great round vault door ajar, gold pouring down the steps), the drill derrick and the grater crawler.
- The Colossus monuments (ppstatue_big behind the horizon, ppb_statue scaffolded in the city) now use the boss's own sprite with stone eyes, on a plinth with a crown-and-laurel plaque - solid, not see-through.

### v2.97 - The Labyrinth's rooms, and a TEST LAB switch
- src/labrooms.js: every chamber of the maze is now a room with its own walls, furniture and light, so you can tell where you are and where you've been: STOREROOM/BASEMENT (planks, crates, sacks, cobwebs), KITCHEN/SCULLERY (checkered tiles, a range with something's tail in the pot, a chopping block, hanging pans), DINING HALL (red damask, a rotting feast, a chandelier, a slashed portrait of the King), CHEESE CELLAR/LARDER/AGEING VAULT/KING'S HOARD (brick vaults, shelves of wheels, a mouldy wheel), BOILER/PUMP ROOM (riveted plates, a boiler with a glowing firebox), BARRACKS/GUARDROOM (bunks with a snoring lump, footlockers, LONG LIVE THE KING posters), ARMOURY/GUN ROOM (stone blocks, the King's banners, halberd racks, rat armour, cannonballs), GAMES ROOM (baize panels, pool table, a dartboard with a rat on the bull, a one-armed bandit), LIBRARY/RECORDS (panelling, bookcases, a green-lamp desk), MILK TESTING LAB/CULTURE ROOM/MILKING LAB (white tiles, benches of bubbling flasks, a tank with a pickled rat). Each has wall lamps and lit furniture through the dark.
- Rings declare rooms: { <wall angle the chamber starts at>: 'kind' | ['kind', 'NAME'] }. The room's name flashes up the first time you walk in and stays small under the cheese gauge; the map colours the bits you've seen by their room. The old stalactites/bones/mould are gone from the rooms.
- Map: a TEST LAB switch next to UNLOCK ALL turns the in-game telemetry panel on/off (no more ?tel in the URL).

### v2.98 - Enemies don't move as one
- Every non-boss enemy now has a personality (main.js updateEnemies): its own walking pace (0.68-1.3x of its AI's speed) that drifts on its own rhythm, an occasional dawdle (slows to 20% for a moment every few seconds), and its OWN spot to home on near Chris (up to ~65px either side, wandering) instead of his exact position. Mice also get their own hop strength. No active avoidance - they just stop moving in lockstep, so a crowd strings out instead of collapsing into one stompable heap.
- Measured (8 mice released on L1, Chris standing still, headless): the biggest pile within 24px averaged about 30% smaller.

### v2.99 - Sprites no longer vanish after switching apps
- Cause: all art is drawn on canvases (packed onto 2048px atlas pages). Phaser's pixel-art canvases are created with willReadFrequently: false, so phones put them on the GPU - and a GPU-backed 2D canvas is discarded when the app is backgrounded; on return Phaser re-uploads blank canvases.
- Fix (src/canvasfix.js, loaded first): TextureManager.createCanvas makes a fresh canvas with willReadFrequently: true, which stays in ordinary memory and survives backgrounding. Safety net: on WebGL context restore, every canvas texture is re-uploaded. Tested: forced WebGL context loss + restore (WEBGL_lose_context) - everything redraws.

### v3.00 - No more vibrate warning on Chrome Android
- Chrome blocks navigator.vibrate (and logs an [Intervention] warning) until the page has been tapped, and while it's hidden. All vibration now goes through safeVibrate() (pad.js), which skips it before the first tap (navigator.userActivation.hasBeenActive) and while document.hidden. Used by buzz() (main.js), buzzAll() (menu.js) and the cheat toggle.

### v3.01 - Pits: a better look, and a smooth way out
- drawPit (main.js): every pit (L6 Cheddar Gorge, L9 Parmesan Prime's chasms, any 'pit' crater) is now a crumbling well - a ragged lip with chunks hanging over, rubble at the edges, five layers of strata wall going down into the dark, crumbs trickling in; Parmesan chasms glow molten at the bottom, Gorge pits keep their salsa (now a proper pool across the bowl).
- pitUpdate (main.js) replaces the old sink-then-teleport: FALL (he slides to the middle and drops in, fading into the dark), BOTTOM (a thud, dust puffs out of the hole, a heart lighter, he glows red-hot), POP (rocket boots fire and he blasts out in one eased arc, a somersault at the top, fire trailing, landing smoothly on the far side - the way he was heading - with a moment's grace). The Saucer's overboard fall is unchanged.

### v3.02 - Balance: L1-4 harder, fewer gun power-ups, dearer shop
- Levels 1-4 were too easy: enemy HP x1.2 / 1.25 / 1.3 / 1.35 (def.hpMul; one-hit fodder stays one-hit), bosses +~15% (Croque 195, Baron 195, Milkmaid 255, Magma Golem 305).
- The Parmesan Power-Up (the gun's temporary level-up) lasts 10 s (was 15); after the guaranteed first one, later big enemies drop one 1 in 20 (was 1 in 8).
- Timed power-ups: a wave's first medium/big kill now drops one only half the time (was always); 1 in 25 after that (was 1 in 12).
- Shop prices +20% (armour 160/280/430/650, boots 130/240/380/540, chips 295/515/810, tanks 175/325/500, magnet 485, life 325, patch 25, hearts 380/650).

### v3.03 - The Magma Golem: no free stomps, a fair breath, and he moves
- Jumping on his head no longer hurts him: he GRABS Chris, hoists him overhead (shaking), and after a second THROWS him (half a heart, flung away) - "GRABBED! DON'T JUMP ON HIS HEAD!" the first time. Shoot the crust plates, then the core.
- The breath (the stream of magma globs sweeping high to low) never comes down to the floor any more: it bottoms out just above crouching height, so DUCK under it - or get in close, where the whole sweep goes over your head. A "DUCK! OR GET IN CLOSE!" hint the first time.
- He's animated: a lumbering 4-frame walk (legs lift, body bobs, arms swing, each step shakes the ground and kicks up crumbs), fists raised overhead for the pound wind-up and while holding Chris, and the maw gaping wide for the breath and the roar.

### v3.04 - TEST LAB panel: out of the way on phones
- The telemetry panel moved from halfway down the left edge (over the movement stick) to the top-left just under the HUD (top 88px, respects the notch), slightly smaller.
- It stays on between levels (the switch is remembered on the device until you HIDE it or flip TEST LAB off on the map) - and now refreshes as soon as a new level starts, instead of showing the last level's result until the first wave.

### v3.04 - Boss loot, gun locks, test panel
- After a boss dies his cheddar now flies to Chris (it homes in from the air, ~0.7 s after it spills), and the rescue waits for it to land in your pocket (up to 5 s). Coins still about when the rescue starts keep coming (updatePickups runs in the rescue too) instead of freezing in mid-air.
- Locked guns: the weapon screen no longer says "UNLOCKS AT LEVEL 2/3" (they come out of the bonus rooms): a locked card is just ??? / "Out there somewhere..." / LOCKED. The shop's START CHIP for a gun you haven't found is LOCKED and can't be bought ("FIND THE GUN FIRST. THEN WE TALK.").
- The TEST LAB telemetry panel sits top-centre under the score (it was over the d-pad); it stays on between levels (it's a saved setting) until HIDE or the map switch.

### v3.05 - RUN MODE (roguelite MVP)
- New main-menu entry RUN MODE (src/run.js). The campaign's lives / cheddar / shop / gun levels are put aside at the start and handed back untouched when the run ends (also restored if the menu is ever reached mid-run).
- ONE life, no checkpoints, no secret warps / bonus rooms, no ranks / unlocks / leaderboards. Starts with 60 cheddar and a bare shop.
- Route: 1 -> (2 or 3) -> 4 -> (5 or 6) -> 7. Each planet is cut to 3 waves (its first, one random middle wave, its last) + the boss.
- After each boss: pick 1 of 3 perks - Rocket Boots forever, Hot Sauce forever, Magnet Fork, +1 Heart, Black Rind +1 mark, Moon Boots +1, Jet Tank +1, Gun Chip (current gun +1), Fat Wallet (cheddar x1.5), Glass Cheese (hit 50% harder, one heart fewer), Cheese Vampire (10 squashes = a heart), Second Helping (+1 life).
- Between planets: choose the next planet at the forks, visit the shop (no lucky wheel, no extra lives on sale), or give up.
- Run summary on death / victory / quit: planets cleared, score, rats, cheddar, time, perks; best run kept on the device (lc_run_best).
- Found guns come with you; cheddar, upgrades and perks are for that run only.

### v3.06 - MOON CAMP (run mode's home)
- RUN MODE now opens on MOON CAMP (src/runhub.js): the title screen's world made walkable - the top of the Gruyere Globe under the purple sky, the run's planets hanging in the sky. Walk with left/right (or tap where to go / tap a station); UP / E / ENTER / pad A uses the station you're at, SPACE jumps.
- Stations: SIGNPOST (main menu), NOTICEBOARD (best run, runs, wins, last run), LUNCHBOX (pack a starter perk: Spicy Sandwich = Hot Sauce, Spring-Loaded Socks = Rocket Boots, then Piggy Purse / Lucky Fork / Bessie's Bell / Glass Flask unlock as your best run reaches planets 2-5), CAMPFIRE (how runs work), FRIDGE-O-TRON (the Larder), CHEESE ROCKET (launch: he climbs in, it shakes and blasts off).
- GOLDEN CRUMBS (kept for good, lc_crumbs): every run pays 8 per planet + 1 per 10 rats + 1 per 50 cheddar (+20 for winning). Spent at FRIDGE-O-TRON'S LARDER on permanent run upgrades: Hearty Breakfast (+1 heart, x2), Nest Egg (+40 cheddar, x3), Thick Rind (start in Black Rind Mk I), Spare Toque (once a run a fatal hit leaves you on half hearts, x2), Lucky Dice (perk reroll, x2), Bigger Menu (4 perk cards).
- Every run ends back at camp: Chris drops out of the sky by the fire with a thump and the run's summary card pops up (planets, score, rats, cheddar, time, perks, crumbs counting up). The old separate summary screen is gone.

### v3.07 - Moon Camp is a real planet + dressed-up choices
- MOON CAMP is now the level scene itself in 'camp' mode (runhub.js CampMixin): a little Gruyere moon you run, jump, jet and shoot round with the normal controls and touch sticks. No waves, no HUD (just golden crumbs), nothing can hurt you.
- Round the moon: tent + fondue-cauldron campfire (sparks, smoke, glow), strings of fairy lights on lamp posts, picnic table (LUNCHBOX), the CHEESE ROCKET on its red launch gantry, a noticeboard with a WANTED rat poster and route map, FRIDGE-O-TRON at his LARDER stall by his ship, a satellite dish, cheese wheel stack, crates, barrels, a flag, and round the back Bessie's empty pen (MISSING poster) and the signpost home. All new hard-pixel sprites.
- Stand at a station and press DOWN (S / pad down / pull the stick down) or tap the yellow prompt over Chris's head.
- Every station opens a card shelf (makeShelf): a gold-framed panel with a red title plate and illustrated cards (icon on a disc, coloured header band, level pips, crumb prices) - Larder, Lunchbox, Noticeboard, Campfire (how runs work), and the rocket's LAUNCH loadout (lunch, hearts, cheddar, larder kit -> BLAST OFF). The rocket now shakes, smokes and lifts off from the gantry.
- Run screens restyled to match: purple title-sky background, title plate, perk cards coloured by kind (MOVE blue, ATTACK red, DEFENCE green, LOOT gold) with a glowing icon disc, route cards with the planet and its boss's silhouette, framed buttons.

### v3.08 - Camp folk + grounded props
- The ranch folk from the intro have moved to Moon Camp (src/campfolk.js), redrawn bigger with idle/walk frames: BISCUIT the space dog (follows Chris about, hops), CLANK the ranch robot (trundles by the noticeboard with a churn, deadpan, counts everything), ZIB the alien kid from next door (sits by the fire toasting cheese on a stick), HENRIETTA the space hen (pecks round the crates, rat conspiracy theorist).
- Walk up to one and press DOWN / tap the prompt to TALK: a Hades-style dialogue box (portrait well, name plate, typewriter text, Chris answering with his portrait). Each has a first meeting, a reaction to how your last run ended (died / won / gave up - Clank and Zib name the planet and boss), then six rotating chats (some use your stats: runs, wins, best, crumbs). Progress through their chats is remembered (lc_talk). They also pipe up with little bubbles now and then when you're near.
- Wide camp props (tent, pen, stall, launch pad, picnic table...) now sink by the moon's curve so their ends sit on the ground instead of floating off it.

### v3.09 - Lives made rare (none on a run) + Dreadnought keels fixed
- RUN MODE has no lives at all now (a proper roguelite): the SECOND HELPING perk is gone, no 1UPs float in run levels, no score bonus lives, and the lives counter is hidden on a run. The camp's SPARE TOQUE (Larder) is the only cheat-death, Hades-style.
- Campaign: lives are rarer - a score bonus life every 100,000 points (was 40,000), the shop's EXTRA LIFE costs 600 (was 325), and you can hold at most 5 (was 9).
- THE RAT DREADNOUGHT (L7 boss): its three keel weak points were placed using the seabed radius instead of the waterline's, so on the big hull they floated way off either end of the boat. They now sit under the hull where they're drawn (same fix for its broadside guns, depth-charge drops, funnel smoke and the "shots ring off the iron" hull check).

### v3.10 - Run difficulty, cheese strengths, gun rack, bonus stops
- Every run is tougher than the campaign: rats with 2+ HP x1.2 (bosses too), +8% more per planet cleared, and +10% extra spawns (+5% per planet) - copies of a wave's spawns arriving a beat later. One-hit fodder stays one-hit; there's just more of it.
- CHEESE STRENGTH (our Ascension / Heat): MILD -> MEDIUM -> MATURE -> EXTRA MATURE -> VINTAGE. Win a run to unlock the next one; pick it at the rocket ("CHOOSE YOUR STRENGTH"). Each piles on rat HP (+20% a step), more spawns, then bosses +20/40%, no cheese wedges between waves, and VINTAGE takes a heart. Crumbs x1.25 .. x2. Shown in the camp HUD, the level banner and the run screens; the summary card says when a new strength unlocks.
- GUN RACK station at camp: pick the gun you take on the run (found guns; others ???). Runs no longer stop at the weapon screen between planets; swap mid-level with any others you own.
- BONUS STOPS: from the second stop to the second-last, a 50% chance the route also offers a bonus stage (Zero-G room / The Big Drop / The Centrifuge). One go, no danger, no campaign tries used. Win it: the next gun you haven't found (kept for good) or, if you have them all, a free perk; +60 cheddar either way.
- Fewer numbers: no "PLANET 2/5", "RUN 1/5" or "FIVE PLANETS" - stops are NEXT STOP / FORK / BONUS STOP, the best run says planets cleared.

### v3.11 - Legendary perks from bonus stops, a gun every run
- A run's BONUS STOP no longer gives guns: win it for a LEGENDARY perk pick (gold cards, "BONUS! A LEGENDARY PERK"), from a pool of bigger versions and combos: BIG BREAKFAST (+2 hearts), DRAGON RIND (+2 armour marks), GOLDEN TOQUE (an extra cheat-death), ARMOURER (every gun you own +1 level), SPICY BOOTS (Hot Sauce + Rocket Boots forever), NOSFERATU (a heart every 5 squashes), JACKPOT (+300 cheddar), DIAMOND CHEESE (hit x1.5 with no heart lost). Still +60 cheddar too; Lucky Dice rerolls work on these as well.
- Every run you finish (a death or a win - or giving up after clearing at least one planet) brings the next gun you haven't found home for good: the summary card says NEW GUN and it's on the camp's GUN RACK (and in the campaign).

### v3.12 - A bonus stop on every run
- Every run now has exactly one BONUS STOP (was a 50% chance at each middle stop): it turns up alongside the planets at a random stop between the first and the last, and which bonus stage it is (Zero-G room / The Big Drop / The Centrifuge) is random too.

### v3.13 - The camp talks about the story
- Every planet Chris clears (campaign or run - runs remember theirs in lc_run_seen) gives each camp character something new to say about it (STORY in campfolk.js). Talk order: first hello -> reaction to the run you just came back from -> the oldest planet they haven't talked about yet -> their rotating chats. A gold "!" bobs over anyone with something new.
- The arc they piece together: why would rats want a COW? (Gruyere) -> the swamp was FARMED (Gorgonzola) -> a graveyard of 212 stolen cows (Brie-muda) -> planets being filled with cheese from the inside, Bessie found in the middle of it (Mozzarella) -> a factory grating whole planets into snacks (Grater) -> a moon eaten down to a ring (Cheddar Gorge) -> a fleet of empty tankers waiting for a cargo of milk (Armada) -> THE REVEAL: the Labyrinth is a moon-sized tank of Bessie's milk curdling into new cheese - they're using her to grow planets (Labyrinth) -> the rats have grated their own homeworld down to 40% - they're running out of world, that's why they need Bessie (Parmesan Prime) -> the King's beaten, Bessie's not home yet (Royal Saucer).
- Clank does the maths, Henrietta was right all along (and says so), Zib asks the big questions (and feels a bit sorry for the rats), Biscuit just does dog things that say it all. Fridge-o-tron's greeting picks up the latest news half the time (cheese prices, tankers, "THEY ATE THEIR OWN HOMEWORLD. TERRIBLE FOR BUSINESS.").

### v3.14 - Camp radios in during the campaign
- After a campaign LEVEL CLEAR, tapping on no longer goes straight to the map: first a MESSAGE FROM MOON CAMP comes up in the bottom bar - the same Hades-style dialogue box as at camp - with one of the camp folk's story conversation about that planet (Zib for the Gruyere Globe, Clank for the Labyrinth's milk tank, Henrietta for the Grater and the Armada...). Tap through it, then it's the level select. That character's line is then marked heard, so at camp they move on to the next thing (the others still have theirs).
- The dialogue box is now a shared chatBar(scene, lines, opts) any scene can use.

### v3.15 - Smash launches + a proper overboard on the Royal Saucer
- SMASH (src/smash.js): a BASH now LAUNCHES small fry, Smash Bros style - spinning, flashing, trailing sparks and smoke. Most go skimming low and fast across the ground; anything they fly into takes a 4-damage whack (bosses 3) and, if it's small too, gets launched in turn, so one bash can bowl down a line ("SMASH!", "SMASH x2!", +60 x chain points). A finished-off rat goes out on impact or when it lands; 30% of them are home runs that fly off the top of the screen with a star-twinkle "K.O.!" (+150, a chime). One that survived the bash bounces once and gets back up. Too heavy to launch (they still get the shove): bosses, big ones (golems, frogs, admirals, paladins...), turrets, ironclads, oven drones, shark-rats, poltergeists.
- L10 ROYAL SAUCER - OVERBOARD reworked: the curved rim is now standable deck (Chris sinks down its slope as you walk out on it) and you only go over past the lip (rats too) - no more falling off while still visibly on the ship. Going over: he slips off the lip and tumbles away down past the hull, spinning; the ship's green TRACTOR BEAM (a light cone with rings running up it) catches him from under the rim - that's the heart - and hauls him back up, still turning, and sets him down on deck. No more sinking into thin air; his ground shadow no longer hangs in space while he falls.

### v3.16 - Skill moves, the style meter, the Training Ground
- PARRY (style.js): BASH just as an enemy shot reaches you (the first ~0.16s of the swing, in front of you, within reach) and it's swatted back at the nearest enemy in front, faster than it came: slow-mo flash, "PARRY!", your gun's heat cleared and topped up, +100. Returned shots hit for 5 (bosses 6) and launch small fry ("RETURN TO SENDER!"). Works on boss shots too; not on falling rocks, bombs or anything bigger than a fist.
- JUGGLE: shoot a rat that's been bashed into the air and it's knocked back up (and done for): JUGGLE xN, more points each time.
- SPIKE: in the air, hold DOWN + BASH: rats below/in front are driven into the ground (a SHOCKWAVE knocks and launches the rats round where it lands) and you POGO back up (jetpack topped up).
- AIR CHAIN: stomps, spikes and juggles strung together before you land: AIR x2, x3...
- STYLE METER (under PAUSE, right side): D DULL -> C COOL -> B BRUTAL -> A AWESOME -> S SMOKIN' CHEF! Points for shots, bashes, smashes, K.O.s, stomps, spikes, juggles, air chains, parries, returned shots - each repeat of the same move in your last six earns less; it drains after 1.6s idle (faster at higher ranks); a hit knocks you down two ranks. Rank multiplies cheddar picked up (x1, 1.1, 1.25, 1.5, 2). On a run, each wave where you hit S is +3 golden crumbs.
- TRAINING GROUND (training.js): Clank's nine lessons on a quiet moon with target rats that just stand there and a pea cannon that can't hurt you: RUN+JUMP, JETPACK, SHOOT, BASH, BOWLING, JUGGLE, SPIKE, PARRY (twice), STYLE (reach B). Coach box at the top (lesson, instructions, controls for your device, progress, SKIP TRAINING). No damage, no cheddar. Offered automatically the first time you start Level 1 in the campaign (skippable; lc_trained), on the main menu (TRAINING), and at Moon Camp (the TRAINING DUMMY station). It returns to wherever it came from.
- Fix: the dialogue bar no longer keeps ticking after its scene restarts.

### v3.17 - DOWN + BASH is now an UPPERCUT
- Replaces v3.16's air SPIKE. Hold DOWN and BASH - on the ground or in the air - and Chris springs up into a rising gun-butt uppercut (spark trail, a Shoryuken-style follow-through hop that holding DOWN can't cut short). Everything in front of and above him takes bash damage +1 and small fry get BOSHED nearly straight up (high, little sideways drift) - set up for juggling with shots. Big ones get a shove and a lift; bosses take 4. "BOSH!" / "UPPERCUT!" / "BOSH x2!", +80 a rat, style points, counts toward the air chain.
- Training Ground lesson 7 is now UPPERCUT ("hold DOWN and BASH... then shoot it to juggle!").

### v3.18 - Uppercut AND spike
- DOWN + BASH on the ground = the UPPERCUT (v3.17); DOWN + BASH in the air = the SPIKE is back (v3.16: drive the rats below into the ground, shockwave round where they land, pogo back up). Which one you get is decided as the swing starts, so a spike still lands even if a ground-pound has you on the deck by the time the hit connects.
- Training Ground: ten lessons now - UPPERCUT (on the ground) then SPIKE (in the air).

### v3.19 - Uppercut or spike by momentum
- DOWN + BASH now follows Chris's vertical momentum as the swing starts (read before that frame's dive kicks in, so pressing DOWN+BASH together while rising still uppercuts): falling (in the air, moving down) = SPIKE; standing, or rising through a jump = UPPERCUT (an air uppercut keeps him going up). Training lesson text updated to match.

### v3.20 - DODGE (double-tap a direction)
- Double-tap LEFT or RIGHT (keys, d-pad/stick, or two quick flicks of the touch stick) for a quick dash that way: ~0.2s burst that eases off, pale streaks behind him, nothing can hit him while it lasts (shots pass straight through, enemy contact does nothing). Works on the ground and once per jump in the air (he holds his height). 0.5s cooldown.
- CLOSE CALL: dash through a shot or an enemy at the last moment - slow-mo, a blue flash, "CLOSE CALL!", +120, a bit of ammo back, style points ('dodge').
- Training Ground: new lesson 3/11 DODGE (two dodges and a close call through the pea cannon).

### v3.21 - Dodge only on a real double tap
- The dodge was firing by accident: any off-on flicker of a direction within 0.27s counted - a thumb wobbling round the touch stick's 30% edge, or letting go and re-pressing while running. Now it needs a proper double TAP: two short presses (each let go within 0.22s), a clean gap of 30-230ms between them, and any press the other way cancels a half-done tap. Off-flickers shorter than 45ms are treated as the same press. On the touch stick it reads the raw stick: a flick has to go past 60% and come back inside 25% to count as let go.

### v3.22 - Uppercut has its own swing
- The uppercut no longer reuses the forward gun-butt bash animation: he cocks the gun down and back by his hip (crouching into it), then whips it UP past his face with the arm high and the butt leading, leaning back, holds it overhead for a beat, then eases back. No forward lunge (the hop does the work).

### v3.23 - CHEESE TIME (slow-mo upgrade)
- New shop upgrade (cheesetime.js): the STOPWATCH. Level I (450 cheddar): one charge a LEVEL. Level II (700): recharges at the start of every WAVE ("STOPWATCH READY").
- Use it: C on keyboard, X on a pad, or the round SLOW button under BASH on touch. 6 seconds where enemies, their shots and the hazards run at 35% speed while Chris moves at full speed; his hits land x1.5 and the parry window nearly doubles (0.16s -> 0.28s). The colours drain (camera colour matrix), a violet haze closes in round the edges, streaks trail off him, "CHEESE TIME!". HUD: a stopwatch under the style meter with a countdown ring / [C] SLOW-MO / USED / NEXT WAVE. Pressing it with no charge says when it's back.
- It's in Fridge-o-tron's ship shop (campaign keeps it like other upgrades; on a run it's run-only).

### v3.24 - Cheese Time comes from SLOW-MO CHEESE (no stopwatch)
- The Stopwatch upgrade is gone. CHEESE TIME is now fuelled by SLOW-MO CHEESE, a collectible you carry (up to 3, shown under the style meter with a count): C / pad X / touch SLOW eats one for 6s of slow-mo (same effect as v3.23).
- Where you get them: one floats up high somewhere round every level (jump or jet for it; once you've had a level's one it doesn't come back on a retry - on a run it's per run); the SLOW-MO BRIE power-up drop now turns up from Level 1 and goes in your pocket instead of going off straight away (if your pocket's full, it goes off as before); and Fridge-o-tron sells them, 150 cheddar each.
- Campaign: they carry over like your upgrades. On a run: run-only, like the run's cheddar.

### v3.25 - TEST MODE: +CHEESE buttons
- With TEST MODE on, the level map has a yellow +CHEESE button (next to TEST LAB): +5000 cheddar, a full pocket of Slow-Mo Cheese (3) and +500 golden crumbs.
- Moon Camp shows "+500 CRUMBS (TEST)" under the crumbs counter, and a run's "where next" screen shows "+2000 CHEDDAR (TEST)" (run cheddar, plus a full Slow-Mo pocket) - both only in test mode.

## v3.26: Moon Boots + Jet Tank merged; deeper Cheese Time
- MOON BOOTS is now one 5-level upgrade (150/280/430/600/800): +5% run and +3.5% jump per level, the jetpack burns 10% less per level (half at Lv 5) and refills 12% faster per level. The JET TANK shop item and run perk are gone; old saves fold any Jet Tank levels into Moon Boots (capped at 5).
- Cheese Time slows the world to 10% speed (was 35%), so things move about 10x slower while Chris stays full speed.
- Fixed a crash when a level ended or restarted during Cheese Time (camera gone at shutdown).

## v3.27: Chris slows a little in Cheese Time
- During Cheese Time Chris and his shots run at 60% speed (CT.chris), while the world runs at 10%, so he's still about 6x quicker than everything else but it reads as slow-mo for him too.

## v3.28: controller fixes
- CHEESE TIME moved to RB on the pad. X is fire, and was also eating Slow-Mo Cheese every time you shot. RB no longer fires (X and RT do).
- Mouse aim only steers Chris while firing. Otherwise he faces the way he walks. Touching the pad switches mouse aim off completely, so a nudged mouse can't stop the stick turning him round.
- Pad dodge reads the raw stick: it needs a strong flick (past 85%) and back to near centre (under 25%), twice. Easing off the stick while walking no longer dashes.

## v3.29: dodge flicks must match
- On a stick (pad or touch), the two dodge flicks must point the same way, within 10 degrees of each other, and be roughly sideways (under ~34 degrees from flat). So up-and-a-bit-right then right is just movement, while right-right is a dodge. Keyboard and d-pad double taps are unchanged.

## v3.30: dodge window
- The whole double tap must happen within 0.3s, from the first press to the second (DODGE_WIN in style.js). This applies on top of the existing rules: each tap is short, the gap is under 0.23s, and stick flicks match within 10 degrees.

## v3.31: roomier camp, selling, shop panel fix
- Moon Camp is spread right round the moon, roughly 40% further apart. Stations: training dummy -2.35, larder -1.6, noticeboard -0.85, fire 0, lunchbox 0.72, gun rack 1.3, rocket 2.0, sign at PI. Clank stands by the training dummy (he runs the lessons), Fridge-o-tron by his larder, and Henrietta by the gun rack. Decor, lamps, bulb strings and ledges all moved to match.
- SELLING in Fridge-o-tron's shop, in both modes: the SELL button (Q / pad LB) flips the shelves to a buy-back list. Each sale returns half (SHOP.sellK) of what that level cost: armour marks, Moon Boots levels, Slow-Mo cheeses, the Magnet Fork, gun start chips, and extra hearts. Lives can't be sold.
- On short screens (<560px tall) the shop's Chris and Fridge-o-tron are drawn smaller, so they no longer stand on the item description.

## v3.32: beach ball and a better-behaved Biscuit
- Moon Camp has an unpoppable stripy BEACH BALL (beachball.js).
  - Shots nudge it, a bash belts it along the ground, an uppercut sends it sky-high, and a spike hammers it down to bounce.
  - Walking into it dribbles it along; landing on it bounces Chris up.
  - It bounces off the moon and the ledges with squash and spin.
- Biscuit no longer clings to Chris. He roams round the fire and chases the ball whenever it's moving, nosing it about.
- Now and then, when Chris comes up to him, Biscuit tags along at his heels for 5-10 seconds, then wanders off (8-15s before he'll do it again). His heel side only changes when Chris walks, so he no longer flicks left and right when you stand on him.
- DOWN goes to the station first: Biscuit only gets the TALK prompt when nothing else is in reach. Other folk still win if they're nearer than the station.

## v3.33: tougher rats; slow-mo Chris at 80%
- All three difficulties moved up a notch, now that Chris has the dodge, parry, uppercut, spike and Cheese Time. Changes from v3.32:

  | Setting | Health | Bullet speed | Enemy speed (new) |
  |---|---|---|---|
  | Easy | 0.7 → 0.85 | 0.75 → 0.85 | 0.95 |
  | Normal | 1.0 → 1.2 | 1.0 → 1.1 | 1.1 |
  | Hard | 1.3 → 1.5 | 1.15 → 1.25 | 1.2 |

  Enemy speed scales how fast regular enemies move and attack. Bosses' own special attacks are not affected. Run mode's strength multipliers stack on top.
- During Cheese Time Chris now runs at 80% speed (CT.chris), up from 60%.
- (v3.34) MORE RATS: each regular spawn in a wave may bring a mate, landing 0.5-1.9s later. The chance is set per difficulty (Settings.dk.more): Easy 0, Normal 25%, Hard 40%. Bosses never double and training is untouched. Run mode's own extra spawns stack on top.

## v3.35: SKILL FOES - enemies that need Chris's moves (skillfoes.js)
- SHIELD RAT: a cheese-grater shield always turned to face Chris (slow to turn, 0.6s). Shots and a plain bash CLANG off it and push both apart. An UPPERCUT, a parried shot or a bowled rat knocks the shield away: dazed for 3.2s and taking 1.5x damage. Hits from behind do 1.25x. Its tell is a brace (flashing) before a shield-charge.
- RIND BEETLE: a red wax shell; shots and bashes ping off and stomps bounce off. A SPIKE, a ground-pound, a bowled rat, a spike shockwave or a parried shot CRACKS it, leaving it soft and taking 1.5x damage. Its tell is a shiver; then it curls into a ball and rolls at Chris for 1.5s (dodge through it).
- BRIE SNIPER: hovers 220-330px away and blinks off when Chris gets within 90px. Its polished parmesan plate deflects every shot. It aims with a laser sight (1.1s), blinks on lock (0.3s), then fires a slow pink brie bolt. PARRY the bolt and it homes back on its own sniper: an instant knock-out. Bash and stomp still land if you catch it.
- They're added to waves in levels 1-6 and 5.5 (SF_PLACES), so both modes get them. Each shows a how-to banner the first time it appears in a level (the sniper only the very first time ever).

## v3.36: Moon Camp grows, and the BOSS RUSH
- CAMP GROWS (campgrow.js): milestones add things round the moon. Fridge-o-tron announces each one with a sparkle the first time you're back at camp after earning it:

  | Unlock | Earned by |
  |---|---|
  | Biscuit's kennel | Finish a run |
  | Cheese plant patch | Clear 2 planets in a run |
  | Telescope | Clear 3 planets in a run |
  | Fondue hot tub | Clear 4 planets in a run |
  | Golden trophy | Win a run |
  | Target board | Own 3 guns |
  | Bessie in the pen | Beat the campaign |
  | Crown on the Boss Gate | Clear the Boss Rush |

- BOSS RUSH (bossrush.js): the BOSS GATE station at camp (-2.95), open once you've won a run (always in test mode).
  - All 9 bosses back to back (L1, 2, 3, 4, 5, 5.5, 6, 7, 10) against the clock, each level cut to just its boss wave. L8 (no boss wave) and L9 (layered escape) are left out.
  - One life, with hearts refilling between bosses, and a fixed kit: Black Rind Mk II, Moon Boots 3, +1 heart, 2 Slow-Mo.
  - The record is furthest boss reached, then fastest time. Rewards: 15 crumbs a boss, +60 for a full clear, +25 for a new record.
  - Win sequences are skipped (straight on to the next boss); death or quitting goes back to camp with a result card.
- RUN_UI.fit now shrinks pictures bigger than their box (it only ever scaled up before).

## v3.37: a more fun front end
- The main menu is now three big bobbing cards: CAMPAIGN (Continue/Play, with your planet), RUN MODE (your crumbs) and TRAINING. A small row underneath holds New Game, Controls, Options (and The End). Keys/pad move left-right and up-down; mouse hovers and clicks; touch taps. The focused card wiggles and gets a gold ring. Sub-screens still use the text menu.
- The logo wobbles. The title backdrop, used by the splash and the menu, plays little scenes: a rat scurries in and Chris blasts it into orbit (K.O.!), or Biscuit gallops past chasing the beach ball.

## v3.38: precise parry; glowing enemy shots
- PARRY tightened (PARRY in style.js). The shot must reach a sweet spot 22px in front of Chris (radius 18px plus the shot's size) within 0.1s of the swing (0.18s in Cheese Time). It used to be anywhere within ~80px for 0.16s.
  - The check sweeps the shot's path over the frame, so fast shots can't skip through.
  - Swinging too soon at an incoming shot shows a grey MISS, and the shot carries on and hits you.
- Every enemy shot now has an additive glow in its own colour: a breathing three-ring halo, a hot white core, a 12-point comet trail and the odd twinkle. Shots with radius 8 or more also light the ground as they pass. All drawn on one graphics layer (bulletFx), so it stays cheap. Parried shots glow pink.

## v3.39: the Phantom Milkmaid - ghost-fire and the churn whack
- Her rings are now purple GHOST-FIRE WISPS (mm_wisp0-2: flickering spirit flames with a white-hot head and hollow eyes, flying head-first with a purple glow and spark trail) instead of curds.
- Fewer of them: 2 rings of 8 (10 in act 2), 0.7s apart, offset so the gaps don't line up. That's 18 shots per attack, down from 38 (44 in act 2). The two ground skimmers stay, also as wisps.
- CHURN WHACK: get within ~105px of her while she's idle and she swoops down to your level. The tell is 0.42s of flashing violet with the churn drawn back. Then she swings: a big arc in front of her, aimed at wherever you are when she lets go. A hit does heavy damage and knocks you back hard. 2.6s cooldown.

## v3.40: getting hit is getting hit
- A hit gives a small flinch (vh 150, was 300) and sets P.hurtHop, so no stomps count until he's back on his feet. Before, the pop-up after a hit often dropped him onto the rat that hit him and squashed it.
- Small fry (mouse, flyer, minigerm, drone, phantom) no longer blow themselves up when they touch Chris. They bump back and come again, so doing nothing keeps costing you hearts.
- Invulnerability after a hit is 10% shorter: CFG.invuln 1.44s (was 1.6).

## v3.41: the run map, and the Secret Cavern
- RUN MAP (runmap.js): the route screen is a little random star map, seeded from the run's start so it stays put all run.
  - Moon Camp on the left, then one column per stage (two planets at a fork), joined by bowed dotted gold paths that wander up and down. The bonus stop is a star hanging off the path.
  - Cleared planets get a green ring and a tick, roads not taken go grey, stops ahead are dim. A bobbing rocket marks where you are, and the final boss is labelled.
  - Pointing at (or keying to) a stop fills the panel underneath with its name, boss and blurb. SHOP and GIVE UP sit in the panel. The perk-pick screen is unchanged.
- SECRET CAVERN (cavern.js), at camp 1.65 (the wheels decor went to make room):
  - Finding it: a wobbling boulder that now and then glints gold. Shoot or bash it open (6 hits; a bash counts double) and a hole with a rope ladder appears; Fridge-o-tron points it out. Stand on it and press DOWN to drop in.
  - The layout is generated fresh each visit and reuses the Labyrinth's cave engine: 3 rings of dark tunnel, each split into chambers by 2-3 rock walls. Every chamber has at least one hole down, so wherever you land you can keep going. Gold crumb piles (3-8 golden crumbs each, banked straight away) and the odd cheese wedge, plus 3-5 vermin per ring (rind-ticks, gnawers, grubs, mice).
  - The bottom ring is one big vault with a TREASURE CHEST: 30-60 golden crumbs, then you're hauled back up and pop out of the hole at camp. Knocked out, you crawl back up with whatever you'd found. No lives or cheddar involved.
  - One raid per run: the cavern is picked clean until the next run finishes (lc_cave_ready).

## v3.42: camp toys (camptoys.js)
- HIGH STRIKER (-0.7): bash its pad and the puck flies up the tower.
  - A plain bash scores ~40%, an UPPERCUT ~75%, and a SPIKE 62-98% depending on how fast you're falling. CHEESE TIME multiplies by 1.4 and your style rank adds a little.
  - 100% rings the bell (DING!, or RINGER!! for well over). Your best % shows above the tower.
- CLAY CHEESE (station at -2.55, Clank's trap; press DOWN for "PULL!"): 8 cheese wheels lobbed in slow arcs over ~12s. A shot scores 1; bashing one as it arrives PARRIES it for 2. Clank calls the score and the best is kept.
- CRATE TOWER (2.4, replacing the old crate decor): a 3-2-1 stack of crates and barrels with simple physics.
  - Shots, bashes (an uppercut throws them high), the beach ball at speed, flying crates and Chris barging at a run all knock blocks loose. Anything left unsupported falls.
  - It rebuilds itself 6s after everything's down. TIMBER!
- HOOP (0.86): a side-on basketball hoop with a rim ~58px wide (the ball is 44px). Its two ends are solid and clang the ball off. Ball through the middle going down scores SWISH!, Biscuit jumps for joy, and a streak counts if you keep scoring within 12s. Best streak kept.
- Bests saved in lc_toys. The barrel at -2.6 went to make room.

## v3.43: solid crates, a proper cavern raid, toys that turn up over time
- CRATE TOWER: crates are solid.
  - Walk into one and you shove it along at about half your walking speed (with a scrape), and it pushes the row in front of it in order, so nothing overlaps.
  - Anything left without support tips off towards the overhang. Loose crates land on top of each other, bounce a little and settle square.
  - It restacks once it's been messed about, everything's still, and you've wandered 160px+ away for 5s.
- SECRET CAVERN:
  - The boulder rolls back over the hole every restock. Shoot or bash it open, then just walk over the hole and you drop in (no button). Picked clean: the boarded-up hole says so.
  - More treasure: 3-5 gold piles per level, a small chest on level 1 (8-15), 1-2 on level 2 (12-19), one in the vault (16-23) plus the BIG chest (30-60). No chest ends the visit; the banner says when you've found them all.
  - Leaving: jet back up out of the entry hole, or the BACK TO CAMP button (H / pad SELECT) under the minimap. Getting knocked out still sends you home with your haul.
- TOYS ARRIVE OVER TIME (TOY_UNLOCK), counted in runs finished, won or lost: hoop after 1, high striker 2, crate tower 3, Clank's clay trap 4, the cavern boulder 5. Test mode has everything. Fridge-o-tron announces the new ones with a sparkle (lc_toys_seen).

## v3.44: softer shot glow with a muzzle flash, clean fade-outs, golem volleys
- Enemy shot glow is 20% dimmer. Each shot gets a bright white-and-colour MUZZLE FLASH that blooms for its first 0.12s, then settles to the dimmer glow.
- Shots fade out over their last 0.35s of life (sprite, glow and trail together) instead of blinking out.
- Anything that wipes the screen (Moo Bomb, boss down, a ring change, etc.) makes each shot swell and fade with a wisp of sparks over 0.22s (ebFade) rather than vanish.
- Gouda Golems (L1) and the L4 golems fire their volley one shot at a time, DOM... DOM... DOM, every 0.4-0.52s, each at a slightly random height and speed, with a recoil squash.

## v3.45: the spike needs timing; easier L1/L2 bosses; aimed stink flies
- SPIKE (SPIKE in style.js): only a rat whose head is within 34px below your boots (and 44px in front / 24px behind) gets the full SPIKE. That's ONE rat, slammed into the ground; its landing shockwave still does the crowd damage.
  - Mistimed (the old big box, up to 130px below): a light 1-damage TAP on the nearest rat and a small hop, like a normal stomp. A Rind Beetle's wax ignores taps.
  - It used to hit everything in that big box at once.
- L1 Croque Monsieur and L2 Baron: boss hp 195 -> 166 (15% less).
- L2 STINK FLIES aim their spores at Chris (leading him a little, 170px/s, light gravity) instead of dropping them, and fire from up to 320px away (was 230).

## v3.46: a readable cheddar badge
- The SHOP, the RUN screens (map and perk pick) and the CAMPAIGN MAP show cheddar in one shared badge (cheddarBadge in shop.js): a dark pill with a gold rim, a bigger cheddar icon and 11px text.
- It sits on the left, 34px in from the edge (SAFE_X), because curved phone screens were eating the old corner counters.
  - Shop and run screens: top-left.
  - Campaign map: just above the info panel on the left, clear of the space shop ship. Its small cheddar line in the stats panel is gone.
- The run screen's test-mode +2000 CHEDDAR button moved to the top right to make room. In-level HUD unchanged.

## v3.47: slower levelling, pricier chips, a proper shop grid
- 20% less cheddar from every drop: CHEDDAR_K = 0.8, applied in spillCheddar, so it covers enemies, bosses, hoards, golden wheels and tax refunds. The hoard and refund banners show the real amount.
- Gun START CHIPS cost 50% more: 445 / 775 / 1215 (were 295 / 515 / 810).
- The Lucky Wheel's GUN +1 wedge is gone, replaced by SLOW-MO (a Slow-Mo cheese, or 75 cheddar if your pocket's full).
- Shop navigation is a grid: left/right moves along a shelf, up/down between shelves (keys, WASD and d-pad). It used to be a single list where up/down stepped sideways.

## v3.48: more time in the Zero-G rooms
- +10s on every Zero-G bonus room: Zero-G Recoil Room 40s (was 30), Zero-G Room II 38s (28), Warp Bonus Room 35s (25). Campaign and run mode share the definitions, so both get it (run mode always uses the first room).

## v3.49: the MEGA WHEEL
- Every GOLDEN SET (all 3 golden wheels on a level) is one MEGA SPIN, tracked separately from normal spins (lc_megaspins).
- The MEGA WHEEL button sits under the Lucky Wheel in Fridge-o-tron's shop once you've ever finished a golden set. M key / pad RB / tap. Not on runs, same as the Lucky Wheel.
- Same wheel and lever, gold paint, NO RAT:

  | Prize | Weight | What you get |
  |---|---|---|
  | 120 (x2 wedges) | 20 each | 120 cheddar |
  | 250 | 14 | 250 cheddar |
  | 1000 | 5 | 1000 cheddar |
  | PLATE+ | 12 | Full armour repair (200 cheddar if it's fine) |
  | SLOW x3 | 12 | Fills your Slow-Mo pocket |
  | POWER | 16 | Next level starts with a random power-up, ~3s in: rocket boots, hot sauce, fondue shield, gouda gigantism, jalapeno or magnet fork |
  | 2X | 12 | Double cheddar for the whole next level |
  | LIFE x2 | 7 | Two lives (cheddar for any over the cap) |

- POWER and 2X carry to the next level via the registry (startBuff, cheddarX2) and are used up when it starts.

## v3.50: reset Run Mode; Rat Disguise retired
- NEW GAME (main menu) now asks which to start again: NEW CAMPAIGN (the old wipe, now also clearing Mega Spins) or RESET RUN MODE.
  - Reset Run Mode clears golden crumbs, larder, kits, strengths, run stats and bests, camp unlocks and announcements, the cavern, the Boss Rush record and who's said what.
  - The campaign is untouched. Guns are shared with the campaign, so they stay.
  - The NEW GAME button now always shows.
- RAT DISGUISE power-up retired: BUFFS.disguise has off: true, so it never drops. The code stays in case it's ever wanted back.

## v3.51: the Baron's claws are dodgeable
- The Baron's rat-claw punch is 20% slower: wind-up tell 0.96s (0.72s angry, were 0.8 / 0.6) and the punch out 0.3s (was 0.24). Hold and snap-back unchanged.

## v3.52: bosses reel from bashes
- Every bash on a boss now knocks it back: a normal bash shoves it away from Chris, an uppercut lifts it (and it settles back down), a side spike drives it sideways and down.
- After a bash the boss can't hurt Chris by touch for 0.8s, and Chris bounces back a little, so a hit is a chance to get clear.
- Boss bash damage 3 → 4, with a damage number, a small shake and hit-stop.
- The giant bosses (Dreadnought, Saucer King, Colossus) get the grace and damage but aren't shoved.

## v3.53: real arms
- Chris's arms are now jointed (shoulder, elbow, glove) and solved every frame with two-bone IK, so both hands stay on the gun through aiming, recoil, running, bashes and uppercuts.
- Gun hand: a glove wrapped round the grip. Support hand: cupped under the front of the gun, on a slightly darker far arm.
- The far hand lets go to thump a jammed gun, flail when grabbed or hit, and swing during a bash. With no gun, the near arm hangs at his side.
- The gun sits a little further back and lower, at belly height, so both arms reach it. Hold points per gun are in GUN_HOLD (chris.js); the spatula in the intro is one-handed.
- Black Rind armour has its own plated versions of the new arm parts.

## v3.54: fatter, whiter arms
- The arms are thicker and suit-white, with a puffy shoulder ball. The mission badge now sits on the shoulder, and the shoulder joint sits right over the suit's own badge, so the arm covers the back of the body.
- The gun sits a touch further back (BK -5) and the arms are longer (near 14+14, far 16+16) to reach it.
- Black Rind armour: plated versions of the bigger parts, with a reactor disc on the pauldron.

## v3.55: smaller gloves
- Both arm gloves (grip fist and support hand) drawn at 80% size.

## v3.56: gloves smaller again
- Gloves now drawn at 70% size.

## v3.57: lighter arms
- Arm sleeve shading a touch lighter (near and far) so the arms sit in with the suit.

## v3.58: new toque, slim legs, softer arm outline
- Hat (assets/sprites/c_hat.png, now 42x44): a proper tall chef's toque, with a big puffy top leaning back over a pleated column and the same curved band at the bottom. The Black Rind band recolour is offset to match (shop.js).
- Legs (c_leg.png): slim white suit legs with a knee crease, replacing the stubby blue trousers. The armoured greave is slimmer to match.
- Arm sleeves get a soft slate outline (0x6a7896) instead of black, so the shoulder doesn't ring the suit in black. The gloves keep their dark ink.

## v3.59: smaller toque
- The hat is drawn at 82% (HAT_K in chris.js), shrinking from the band up.

## v3.60: bendy limbs (arms, legs, boots)
- Arms and legs are no longer hinged segments. Each limb is one long sprite laid along a curve (a Phaser Rope) from shoulder through elbow to hand, or hip through knee to ankle, so it flexes and stretches like hand-drawn rubber. Painters and sizes are in LIMB / chrisArmPaint / chrisLegPaint / chrisBootPaint at the top of chris.js; the Black Rind armour re-skins the same shapes (shop.js). On a canvas-only device the limbs fall back to straight stretched images.
- Arm art: a round shoulder with the mission badge, a sleeve pinching in to the elbow, a fat forearm, a red cuff ring, gloves drawn at their real size. Two hard cel tones (white, cool slate shadow), a soft outline round the shoulder inking up to black by the cuff.
- Arm acting: the elbows trail on a spring (back when he runs, down when he lands, out when he fires), the gun pumps a beat behind his stride and sways at rest, recoil kicks harder and he braces back. The far arm lets go to thump a jam (it now reaches up to the big fist), flail when grabbed, hit or falling, and fling out behind a bash; when it is free it is drawn behind the body.
- Legs: he stands 6px taller on thin bow legs you can see (front knee forward, back knee out behind). Running, each foot rides a loop (back along the floor, lifted and swung through heel first) and the legs back-pedal when he moves backwards while aiming. Knees tuck going up, legs dangle and pedal coming down, trail in the jetpack wash, and bow on a landing. Standing has a small knee bounce.
- Boots: smaller, rounder moon boots (22x12, drawn in code; the old c_boot.png is gone) so there is leg above them.

## v3.61: the guns, alive
- Squash and stretch: every shot squeezes the gun like a tube (long and thin, then fat, then settled) on a spring; the Swiss-Shot swells as it charges and shakes at full charge; the Spinner throbs while the beam is on. The hands follow the gun as it stretches.
- The tank shows on the gun: macaroni sits in the Mac-Grinder's glass hopper to the level of the ammo, stays level as the gun tilts, and sloshes on shots, landings and running. The Spinner's reel shrinks as it unwinds. The Swiss-Shot's drum empties ball by ball.
- Working parts: the Mac-Grinder's crank turns and the Spinner's reel spins (four drawn turns) while firing, winding up fast and running down slowly; the loose strand whips about.
- Heat: as the tank runs down the tip turns orange and glows. Under about a fifth of a tank while firing, the gun rattles and vents steam fast as a jam warning. After a long burst it steams in wisps as it cools (puffs are left behind in the world).
- How: chrisGunParts() in chris.js splits the gun sprites at run time ('c_gun_e' = empty hopper, no crank; 'c_gun2_e' = no reel), so it works on the PNGs and the drawn-in-code guns alike; updateGunFx() draws the live parts each frame.

## v3.62: the Magma-Golem rebuilt, fairer eruptions
- The boss is a rig now (src/magmagolem.js), not one sprite with four frames: a mound of molten cheese with a crater crown, two bendy legs on slab feet that are planted on the crust and really step (lift, swing, thud, the mound sags), two bendy dripping arms with boulder fists on springs, cheese drips that gather, stretch and fall, lava veins that pulse, and a crater that smokes and spits fire before a move. He stands taller (footH 96) so the legs show. The old magmagolem.png is gone; the body is drawn in code.
- Moves: the breath (a stream of about 23 small globs) is removed. WAVE replaces it: he rears back for 0.8s, then heaves one rolling wave of molten cheese along the ground to jump (two when boiling over). LOB is two big bombs (three when boiling over), each with a landing ring. POUND keeps its two shockwaves and sets off a mad eruption. The phase 2 magma rain is folded into the mad eruption.
- Eruptions (mozz.js): in the waves, every 10 to 14s, alternating between one slower boulder (an arrow at the screen edge shows the side for 1.6s first) and two lava bombs on rings shown 1.7s and 2.05s ahead. No ambient eruptions during the boss fight. The boss's MAD ERUPTION lays a carpet of 8 rings (10 when boiling over) across the ground, first impact 2.1s (1.75s) after the warning, sweeping along, with a two-slot gap to stand in. Rings stay lit until the bomb lands; bombs leave a 2.2s burning puddle.

## v3.63: CAPE UP, the start-of-level intro
- Every level now opens zoomed in on Chris in his cook's apron. He sets a determined face (a new derived head, c_head_det: heavy brows, narrowed eye, tongue out), spins the apron into his cape (the rig's spinToCape), poses with a grin, the camera pulls back and a shout pops up (GO!, LET'S COOK!, ORDER UP!, CAPE ON!, DINNER TIME!). About 2.3s; tap or press A to skip.
- Four versions, picked at random and never the same twice running (lc_cape_last): twirl (spins on the spot), jump (leaps and spins in the air, lands in dust), top (spins like a top, hat flying, comes out dizzy), slow (a long squint with the moustache twitching, then one sudden whip).
- Not played on a retry after a death, from a checkpoint, after a warp, or in Boss Rush, the cavern, camp or training. Code: src/capeintro.js (state 'capeup'); it reuses the game-over camera push-in (goCam).

## v3.64: CAPE UP reworked - you see the cloth
- Chris no longer flips left and right during the intro; he stays facing forward. The apron itself now comes off as a cloth that whirls round him with a trail (round his middle, right round him in a jump, lassoed over his head, or one fast flick), turning from white to cape-red as it goes, his free hand following it.
- It lands on his shoulders as the cape with a springy pop, a white flash on the cloth, a billow and sparks. The camera holds on him for three quarters of a second before pulling back for the shout. Total about 3s (2.4s for the quick flick); still skippable.

## v3.65: the grade - one palette, more contrast
- Every scene's camera now runs one post pass (fx.js, `fxGrade`): bloom (graphics HIGH only, default strength down from 0.6 to 0.45, Mount Mozzarella 0.28), then an S-curve for contrast and a touch more saturation, then a PALETTE LOCK that snaps every pixel to the nearest of 48 master colours with a fine 4x4 ordered dither. Graphics LOW turns the whole pass off.
- The master palette (FX_PALETTE) was built from raw screenshots of all 11 levels plus the shop, map, camp and menu: colours bucketed per image (so one level's sky cannot swamp the rest), weighted k-means to 48, with ink (0x1a1020), white, black and Chris's key colours pinned. To rebuild it: capture the levels at graphics MEDIUM with the lock off, and re-run the k-means.
- Because the lock is on the finished frame it covers PNG sprites, drawn-in-code sprites, graphics, glows and the HUD alike; soft glows become dithered bands rather than a blur.
- Grounding: a puff of dust where Chris lands, and a skid of dust when he turns at a run (`dustPuff`, tinted by `def.dustTint`).
- Not done: matching pixel sizes. On a phone the world is drawn at about 83% (zoom = height / 470), so sprite pixels are not all one screen pixel. Fixing it means raising the logical height to 470 and scaling the HUD and touch controls up to compensate.

## v3.66: the palette lock dialled back
- The hard 48-colour snap with dither (v3.65) banded gradients and broke up small dim text, so the menus, map and shop looked wrong. It is now off for every scene except the levels, and in the levels it is a gentle pull: each pixel moves 30% of the way to its nearest master colour, with no dither. The contrast curve and the lower bloom stay (levels only).

## v3.67: no UFO over the camp
- The rat UFO beaming Bessie up (the reminder that hangs in the level 1 sky) no longer shows at Moon Camp.

## v3.68: smashable crates, tin cans
- Crate tower: the crates no longer block or shove. Chris walks straight past them. Two shots or one bash bursts a crate into planks and gives one golden crumb (at most 12 per camp visit); whatever was resting on it falls. The stack is rebuilt 60s after the first crate goes. The beach ball still knocks them about.
- Tin cans (new toy, unlocks after 1 run, at -1.9 beside the larder): five tins on a fence rail. Shoot or bash them off. All five down is a CLEAN SWEEP, timed from the first hit; the best time is saved (lc_toys.cans) and shown on the post. They stand back up 2.5s after a sweep, or 7s after the last hit if you stop part way.

## v3.69: easier start
- Croque Monsieur (level 1 boss) health 166 -> 149 (10% less).
- Timed power-ups drop a little more often: the first medium or big enemy killed in a wave drops one 70% of the time (was 50%), and later ones 7% of the time (was 4%). Still only one at a time, and never while one is running.

## v3.70: level 1 gives a taste of the power
- Level 1 only: the first medium or big enemy killed in every wave always drops a timed power-up (other levels 70%), and later ones 15% of the time (other levels 7%).
- Level 1 only: about 2 seconds after the Croque Monsieur arrives, a random power-up falls in just ahead of Chris (if he has none running). Not in Boss Rush.

## v3.71: level 2 eased
- Baron Von Blue (level 2 boss) health 166 -> 149 (10% less).
- His claw punch 20% slower again: the wind-up tell 0.96s -> 1.15s (phase 2: 0.72 -> 0.86), the punch out 0.3 -> 0.36s, the snap back 0.42 -> 0.5s.

## v3.72: spiral fungi on level 2
- p_stalk.png (the blue cone spikes in the Brie-muda swamp) redrawn as a clump of spiral fungus: three thin twisting tendrils that unroll into open fiddlehead curls, shelf gills and glowing spore dots, on a mossy bulb (38x48, was 22x40). Drawn by a script in the session scratchpad (fungi/draw2.py).

## v3.73: swamp trees on level 2
- The ribcages, beast skulls and bone piles are gone from level 2 (bones belong to the Brie-muda Triangle). In their place, two creepy swamp trees stand behind the horizon: bg_swamptree (112x132) and bg_swamptree2 (92x112, snapped top). Gnarled S-bent trunks on arching mangrove roots, drooping boughs ending in hooked claws, ragged curtains of Spanish moss, and a knot-hole face with glowing green eyes. They shake when the Baron slams, as the bones did. Drawn by trees/draw.py in the session scratchpad.

## v3.74: one master palette for every sprite
- New src/palette.js: 18 colour ramps (ink, steel, stone, wood, cheese, orange, red, skin, pink, purple, blue, teal, green, olive, cream, sage, slate, mint), mostly six shades each, with hue-shifted shadows and highlights. Every sprite is snapped onto them, matching colours in a perceptual space (OKLab, hue weighted above lightness). Colours that were clearly different but land on the same shade are pushed a step apart along their ramp, so faces and highlights keep their detail.
- Drawn-in-code sprites are snapped as they are made (pixSprite and pixArt in textures.js; other generated textures when Atlas.pack copies them to the sheet). The 380 PNG sprites in assets/sprites were snapped by the same code and saved back to the files, so the game does no work for them at load. Left alone: anything with soft see-through edges (glows, halos, shading layers), planet surfaces, nebulae, sky, very big pictures, and keys matching PAL_SKIP.
- Texture for basic sprites: a sprite that is mostly large flat single-colour areas (Pal.texture) gets a lit rim on each area's top-left edge, a shadow on its bottom-right, and sparse flecks inside, all from its own ramp. Opt-outs in PAL_NOTEX (soft clouds, Chris's parts, the HUD).
- To check or redo it: ?nopal turns the palette off; ?palfiles re-snaps the PNGs live from their originals (git history). The before/after contact sheets were made by exporting every texture from a test browser with each setting.

## v3.75: level 1 hand-shaded the 16-bit way (the big textures)
- Opt-in flags so each level can be converted one at a time:
  - `surface.clean` (makePlanetTexture): broad flat areas of one tone, with a checker dither only along the seam between two tones instead of noise dither everywhere; a third of the scattered crumb specks.
  - `skyClean` (makeSkyDither): flat sky bands, with the dither only in the strip where one band meets the next.
  - `depth.clean` (depth.js): the sphere shading in flat bands with checker seams; the atmosphere as one solid ring plus one checker ring instead of a Bayer fade.
  - `ridge.shade` (depth.js): hills get a crisp lit cap, a darker, cooler lower part, and shadowed hole lips.
- Level 1 has all four turned on.

## v3.76: smoke and glows the 16-bit way
- Smoke (`puff`): a chunky cel-shaded pixel cloud (2x2 pixels, three greys lit from the top left) instead of a soft see-through blob; the old puff.png is gone. As it goes it breaks up through puff_1..puff_3 (lobes shrinking, splitting into wisps) instead of fading: updateParticles swaps the frame by remaining life. Callers' tints and alphas still apply.
- Baked glows on shots and pickups (bakedGlow / makeGlowTexture): solid stepped rings instead of a blurred fade (a solid ring hugging the sprite, a checker ring, a sparse dot ring).
- The light halo (`halo`): a bright core, two solid rings and a faint checker ring, in chunky 2x2 pixels with nearest filtering, instead of a smooth radial gradient. Used for lights, mushroom glows, lava and geyser glows.
- The bloom pass (graphics HIGH) is unchanged.

## v3.77: glows slightly stepped (neo-retro)
- The hard rings and dither patterns of v3.76 looked odd round floating power-ups. Baked glows are soft again, but quantised to five even steps of strength. The light halo has its original soft fall-off (bright core, long tail) in eight even bands. Pixel-art smoke stays.

## v3.78: the hand-shaded pass on every level
- surface.clean, skyClean, depth.clean and ridge shade are now on by default for every level (set any of them to false in a level's def to opt out). The special planets (the grater, the fountain, the Parmesan wheel) draw their own surfaces and are unchanged.

## v3.79: pixel size, step 1 - the ground at full resolution
- Planets and their depth layers (sphere shading, atmosphere ring, parallax hills, cracks, gilded rim) used to be generated at half resolution and shown at 2x, so the ground's pixels were twice the size of the sprites'. For planets up to radius 620 (PIX_HD_R) that draw the standard way, play now uses full-resolution copies ('surfhd'/'shadehd' + id, depth layers with an 'hd' suffix), with crater and hole sizes and speck counts scaled so they look the same, just in finer pixels. This applies to levels 1, 2, 3, 4, 6 and 7. The half-size versions are still made at boot for the maps. Only the current planet's full-resolution layers are kept in memory. It costs about a second of extra generation the first time each level loads on a slow device.
- Still to do: the big planets (levels 5, 8, 10), the special planets (the fountain 5.5, the Parmesan wheel 9), sprites drawn at in-between scales (1.25, 1.5), and the world zoom of about 0.83 on phones.

## v3.80: pixel size, step 2 - scenery snapped to whole pixels
- Scenery drawn at in-between scales (1.3x, 1.6x...) had some art pixels one screen pixel wide and some two. Objects with `pixSnap` set are now drawn at the nearest whole number of screen pixels per art pixel (1x, 2x, 3x; tiny ones under 0.75x are left alone), in place() (main.js, pixSnap()). Squash, stretch and hit effects still multiply on top.
- On: level props and decor, the camp's stations, decorations and grown-in things, the tin-can fence and the crates. Off: the hoop and high striker (their rim and puck are lined up with the art in world units), enemies (at about 1.0x on a phone already), Chris (a rig of rotated, stretched parts), and anything a hitbox depends on.
- Side effect: random-sized scenery now comes in two sizes instead of a smooth range, so some props are a bit smaller and some a bit bigger than before.

## v3.81: the pixel look (trial, level 1 only)
A step towards the Noita look, behind a switch (menu: LOOK: PIXEL (LV 1) / CLASSIC; URL ?pixlook, ?pixlook=3, ?classic). Code: src/pixellook.js (PixelLookMixin).
- One pixel grid: a post pass (LCPix) snaps the world camera to 2-screen-pixel blocks, so planet, sprites, scenery and effects share one pixel size. The HUD (depth 19+) moves to its own camera and stays crisp.
- Light and dark: a light map (MULTIPLY render texture at depth 9.65) dims the world to def.pxAmbient (default 0x6e6a8c); Chris, the gun, shots, enemy shots, pickups, lava, geysers, the boss and every addLight punch banded pools (5 hard steps) back in.
- Single-pixel particles: burst() of spark/crumb/mm_splat/shard/flame/fdrop becomes twice as many grid pixels coloured from the source sprite; the hit-spark emitter uses pixels too.
- STYLE_GUIDE.md: the rules for new art.

## v3.82: pixel look, crisper light
The v3.81 pool round Chris read as a blur (a big soft pool stacked on the old halos and the bloom). Now: the light stamp is a solid core plus three hard steps; Chris's pool is half the size (95, 120 powered); the soft halos and bloom are off while the pixel look is on, so the light map is the only lighting layer; shots, the muzzle flash (flickering), enemy shots and spark bursts carry more of the light.

## v3.83: grid parked; moody light; consistency pass (level 1 cast)
- The pixel grid and single-pixel particles are parked (only with ?pixlook). Full resolution is back.
- The light map stays on level 1 as MOODY lighting (menu: LIGHTING: MOODY (LV 1) / CLASSIC; ?classic): ambient 0x9894b8 (def.moodAmbient), Chris's pool 140 (170 powered), a 256px stamp with a solid core and three clean steps, bloom on, the old soft halos off.
- Consistency: one pixel density for the cast. Measured on screen, Chris drew at 0.95 world units per art pixel, the planet at 1.0, mice 1.1 and golems/flyers 1.22. Now Chris RIG_SCALE = 1 and the mouse, flyer and golem PNGs are redrawn finer (resampled smooth, snapped to their own colours, a clean 1px outline) by 1.1 / 1.22 / 1.22. TEX_DENS (main.js) shrinks them back in place() so they're the same size on screen and hitboxes are unchanged; eye-pop positions are scaled to match.

## v3.84: one pixel size for every enemy and boss, moody light on every level, the HUD pass
- Pixel size: every enemy drawn at scale k >= 1.1 now shows a finer redraw so 1 art px = 1 world unit (Chris and the ground). 53 PNGs were redrawn offline (resampled smooth, snapped to their own colours, clean 1px outline); everything code-drawn is redrawn the same way at runtime the first time place() meets it (densTex, cached as key+'@d'), whatever frame the AI puts on it. Bosses: baron 1.35, milkmaid 1.25, kingboss 1.15 (BOSS_DENS). Eye-pop positions, shadows and the baron's crown offset follow. Hitboxes unchanged.
- Moody light on every level (not camp, training or the cavern), each with its own ambient and Chris-light colour (MOOD in pixellook.js). Menu: LIGHTING: MOODY / CLASSIC.
- HUD: one panel style (hudBox: dark outline, top-left-lit bevel, dark fill) for the portrait, gun box, JET bar, cow track, radar, boss bar (now in blocks like the JET bar), the style meter bar and the camp crumbs box (its yellow top stripe is gone). Soft plates (hudPlate) behind Chris's readouts, the cow track and the style meter. MENU and PAUSE are buttons. The boss bar moved down to 104 so it no longer covers the gun's LV.

## v3.85: hitboxes fitted to the art; Chris's legs keep up with the ground
- Measured every enemy's hit circle against its sprite: shots missed big parts of many of them (the Parmesan soldiers, Toffs, rocket rats, drones and the flying types only had 53-73% of their art inside the circle; the circle sat above the flyers' bodies). Player shots now hit the old circle OR an ellipse fitted to the sprite's solid pixels (shotHits, texShape), so anything that visibly hits counts. Never harder to hit than before. Contact damage on Chris is unchanged (still the tight circle).
- Enemy shots against Chris: their hit radius is now never bigger than what you can see of them (eShotR: 90% of the solid pixels). Most were 1.2-1.5x their visible size, so shots hit you before they touched you.
- ?hitbox draws every hitbox (yellow = shot circle, cyan = fitted ellipse, red = contact, orange = enemy shots, green = Chris).
- Walk cycle: the boots swung 7.5 units at a fixed 8 rad/s at full speed, so the planted foot moved at about a quarter of his speed and skated. Now each boot swings STRIDE = 10 and the cadence follows the speed (speed / stride), so the planted boot keeps up with the floor: a quicker, scurrying cartoon run.

## v3.86: playability quick wins
- After a hit: 1.44 -> 1.7 s of flashing invulnerability. You can stomp while flashing: the no-stomp flinch (hurtHop) now ends 0.4 s after the hit even in the air, not only on landing.
- Pickups: grab radius 30 -> 36; without the magnet, cheddar tugs in from 70 all round (was a narrow strip along the ground).
- Boss tells: bossWarn(e, dur) puts a big blinking '!' over the boss (with a zing) for the length of a wind-up. On: the Croque's slam, the Baron's claw punch, the Grand Paladin's sword waves and charge (which had no tell), the Colossus's stomp, the Rat King's toss and slam (his slam crouch is longer too, 0.5 -> 0.75 s).

## v3.87: level 10's boss banner said THE PARMESAN COLOSSUS (copied from level 9): now THE RAT KING

## v3.88: performance (Mount Mozzarella slowdowns)
Measured the GPU work per frame (headless, counting WebGL calls). The new light map was the problem: RenderTexture.draw() switches the GPU to the map and back for every light, and Mount Mozzarella has 40+ lights (lava, geysers, shots), so 54 render-target switches a frame (mobile GPUs hate these). Fixes:
- Light map: all lights in one beginDraw / batchDraw / endDraw pass (same picture, checked pixel for pixel): 54 -> 16 switches a frame on L4.
- Geyser vents: dropped their per-sprite shader glow (extra passes each, every frame); the lights already light them. L4 now 11 switches a frame.
- Labyrinth (L8): its darkness RT was a different size from the light map, so the GPU rebuilt its drawing target twice a frame (two 800px texture uploads a frame). Now the same size (W+64 x H+64), and the lamps are rubbed out in one pass (gathered, then endDraw(true)): 31 -> 19 switches, 741k px of uploads a frame -> 0.
- Text: the gun LV and the style rank re-rendered and re-uploaded their text every frame (setColor); now only when they change. 4 uploads a frame -> ~0.
- Enemy redraws (densTex) are made a couple a frame while the level starts, not in the middle of a fight; and their nearest-colour search is cached.
- AUTO QUALITY (perfTick): if play runs under ~45 fps for 3 s, the level steps down (moody light map off, then bloom off, then the light halos) until it's smooth. Off with ?noauto (and in test browsers).

## v3.89: Mount Mozzarella's sky, the HUD backdrops gone, light map squares
- HUD: the soft dark plates behind the readouts (v3.84) are gone; the panels, buttons and bars keep the shared style.
- Mount Mozzarella: the sky ran to near-black at the top (0x160302) and the moody light darkened it further. Sky is now 0x36100a -> 0x9a2c0a, and MOOD can lift the dimming off the top of the screen (third number; L4 0.9, L6 0.6, L9 0.5) with a soft white gradient drawn into the light map first.
- The greasy smoke clouds were cut off square at the texture edges (hard straight edges when scaled up 3-4x) and near-black: they now thin out to nothing at their edges, in ember browns, a little more see-through.
- The background volcano was three flat bands split by hard straight lines: redrawn in code with rounded shading lit from the left, rough rock, warmed by the crater and lava rivers, sinking into the haze at its foot (the PNG override is gone).
- Light map: with the lights drawn in one pass (v3.88), the ADD blend's dest-alpha factor dimmed a square round each light where the sky lift was. The stamp is now see-through outside its pool and drawn with SCREEN, so nothing outside a pool changes.

## v3.90: Mount Mozzarella a touch moodier: sky 0x22080a -> 0x8e280a (one smooth gradient), sky lift 0.9 -> 0.55

## v3.91: the Grand Paladin redrawn and rigged (src/bossart.js)
- BA.paint: a painter for big sprites: shapes (ellipses, polygons, strokes, pixels) in world units, each shaded as a round form lit from the top-left, quantised onto its ramp with a narrow dithered seam between tones, a 1px ink silhouette and a line in the shape's darkest tone over whatever's behind it. Replaces the flat three-band poly shading (the hard diagonal splits) for the bosses being redrawn.
- The Grand Paladin (L8, "the Milkmaster"): a rat knight in white enamel plate on a hovering milk churn that puffs milk vapour; helmet with ears through it, a long snarling snout, red plume, tattered cape, broadsword, kite shield with a cheese wedge. Parts: churn, cape, tail, body, head (snarl / roar / hurt), plume, sword arm, shield (gpSetup / gpDraw). He bobs; the cape and plume stream; the tail lashes; the sword hauls up overhead during the '!' tell and slashes through as the sword wave goes out; the shield comes up and shakes before the charge, and he leans into it. Hit flashes and tints copy to every part. The charge now swoops no lower than 62 so the churn doesn't sink into the floor.

## v3.92: trophies, multi-kills, bowling sounds, a metal Great Grater
- TROPHIES (src/achieve.js): 36 achievements, kept for good in localStorage 'lc_ach' (a new game doesn't wipe them; cheats and test mode don't earn them). Rat totals, multi-kills, bowling strikes, KOs, parries, S style rank, a x20 combo, a flawless planet, an S rank, cheddar totals, the shop, every boss by name, the ending, deaths, the secret cavern, Run Mode. A toast slides down at the top of whatever's on screen with a fanfare (queued). The main menu's TROPHIES button opens the list (TrophyScene): unlocked first, then the nearest to done, with progress bars; drag / wheel / arrows to scroll.
- MULTI-KILLS (multiKill): kills within 0.6 s of each other add up: DOUBLE KILL, TRIPLE KILL, QUAD KILL, MEGA KILL, CHEESEPOCALYPSE, big in the middle of the screen, with a fanfare that climbs with the count while the music ducks under it (Sound.duck), and bonus score and style.
- BOWLING SOUNDS: every rat a smashed rat bowls into rings a note further up a scale (bowlPin), plus what it's made of: armour and machines CLANG (bowlMetal), flyers BOING, ghosts wooo, the rest squeak.
- METAL: the Great Grater (level 5) plays 'levelmetal': 172 bpm E minor, palm-muted power-chord chugs on a distorted rhythm guitar (guitar(): detuned saws, drive, tanh clipper, cab low-pass; short notes palm-muted), a wailing lead, tremolo picking on wave 2+, double-kick drums. Same loudness as the other tracks.

## v3.93: the moonwalk
When the lucky wheel lands on a good one, Chris now celebrates one of two ways at random (S.joyKind): the old bounce with the gun in the air, or THE MOONWALK (shop.js moonwalk): he glides backwards away from the wheel while facing it (the rig's backing walk), twirls, goes up on his toes with the gun up and a "HEE-HEE!" (a new voice phrase), glides back the other way facing away, twirls again, and round. Sparkles skate off his boots.
