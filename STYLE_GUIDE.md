# Luna Chris: style guide

One page of rules for art, so new sprites, levels and effects all look like they belong in the same game.
The aim: a 90s grotesque cartoon in pixels. Consistent art, detailed characters, quiet backgrounds, light for mood.

## 1. One pixel size
- Characters, enemies and the ground share one pixel density: **one art pixel = one world unit**
  (Chris's rig at `RIG_SCALE = 1`, the full-resolution planets, enemies at their display scale).
- If a sprite has to be bigger on screen, redraw it with more pixels rather than scaling it up.
  Sprites redrawn finer are listed in `TEX_DENS` (main.js) so they keep their size on screen. Enemies drawn at scale k ≥ 1.1
  (and the bosses in `BOSS_DENS`) are shown with a finer redraw of every frame automatically (`densTex`).
- Never smooth-scale art. No soft gradients in sprites; if it needs a gradient, use 3–4 flat steps.
- Far background (sky, nebulae, distant ships) may be chunkier or finer: distance is allowed to break the rule.
- The pixel grid post-pass (`?pixlook`) is parked; the game runs at full resolution.

## 2. Colour
- Only colours from the master palette (`PAL_RAMPS` in `src/palette.js`). Pick from a ramp, don't invent.
- Each object uses **one ramp plus a dark outline**: 3–4 shades, dark at the bottom, light at the top-left.
- Light comes from the top-left everywhere (the planet, sprites, scenery).
- Saturated colour is for things that matter: Chris, enemies, shots, pickups, hazards.
  Backgrounds and scenery use the duller, darker ends of their ramps.

## 3. Light and dark
- Every level sits in a gently dimmed ambient light with its own tint (`MOOD` in `src/pixellook.js`; `def.moodAmbient` overrides), so lit things stand out.
- Light comes from things in the world, not from the screen: Chris's pool, the gun, shots, lava, geysers, pickups, the boss.
- Light pools are a solid core plus three clean steps, never a smooth gradient.
- Use colour in light to tell the player things: warm = friendly or fire, red-orange = enemy shots, pale yellow = power.
- Don't paint glows into sprites. Give the object a light instead (`addLight`, or a source in `pxLights()`).

## 4. Effects
- Sparks, crumbs, splats and drops are small and plentiful, coloured from the thing that broke.
- Hot things (sparks, flames) are additive; solid debris is not.
- More, smaller pieces beat fewer, bigger sprites. Cap a burst at about 40.
- Smoke and dust stay as chunky puff frames that break apart, not soft fades.

## 5. Shapes and outlines
- Readable silhouette first: you should know what it is from the black shape alone.
- 1-pixel dark outline (the darkest shade of the object's ramp, not pure black) on characters and pickups.
  Scenery and backgrounds can drop the outline so the characters stand out.
- Characters: big head and hands, thin limbs (the 90s grotesque look). Hand-drawn wobble is good; perfect circles are not.

## 6. Movement
- Squash and stretch on landings, hits and shots. Hold key poses; skip the in-betweens.
- Animate at low frame counts (2–4 frames) and let the motion carry it.

## 7. HUD
- Every box is the same panel (`hudBox`): 2px dark outline, a 1px bevel lit from the top-left, dark fill.
- Groups of readouts sit on a soft dark plate (`hudPlate`), never on bare background.
- Buttons are panels with white text. Bars fill in chunky blocks with a light top edge.
- No coloured stripe down one side of a box.

## Checklist for a new sprite
1. Drawn at final size, on the grid.
2. One ramp from the master palette, plus outline.
3. Lit from the top-left.
4. Reads as a silhouette.
5. If it glows, it emits a light instead of having a painted glow.
