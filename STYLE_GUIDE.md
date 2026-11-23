# Luna Chris: style guide (the pixel look)

One page of rules for art, so new sprites, levels and effects all look like they belong in the same game.
The aim is the Noita feel: simple shapes, one pixel size, light doing the heavy lifting.

## 1. One pixel size
- The world is drawn on a single grid: **one art pixel = 2 screen pixels** (`PX_BLOCK` in `src/pixellook.js`).
- Draw sprites at the size they will appear. Don't draw big and scale down: the grid throws the detail away.
- Never smooth-scale art. No soft gradients in sprites; if it needs a gradient, use 3–4 flat steps.
- The HUD (depth 19 and above) is the exception: it stays crisp at screen resolution.

## 2. Colour
- Only colours from the master palette (`PAL_RAMPS` in `src/palette.js`). Pick from a ramp, don't invent.
- Each object uses **one ramp plus a dark outline**: 3–4 shades, dark at the bottom, light at the top-left.
- Light comes from the top-left everywhere (the planet, sprites, scenery).
- Saturated colour is for things that matter: Chris, enemies, shots, pickups, hazards.
  Backgrounds and scenery use the duller, darker ends of their ramps.

## 3. Light and dark
- Levels sit in a dim ambient light (`def.pxAmbient`, default `0x6e6a8c`).
- Light comes from things in the world, not from the screen: Chris's pool, the gun, shots, lava, geysers, pickups, the boss.
- Light pools fall off in **five hard bands**, never a smooth gradient.
- Use colour in light to tell the player things: warm = friendly or fire, red-orange = enemy shots, pale yellow = power.
- Don't paint glows into sprites. Give the object a light instead (`addLight`, or a source in `pxLights()`).

## 4. Effects
- Sparks, crumbs, splats and drops are **single grid pixels** with gravity, coloured from the thing that broke.
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

## Checklist for a new sprite
1. Drawn at final size, on the grid.
2. One ramp from the master palette, plus outline.
3. Lit from the top-left.
4. Reads as a silhouette.
5. If it glows, it emits a light instead of having a painted glow.
