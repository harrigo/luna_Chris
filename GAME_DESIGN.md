# Luna_chris - Game Design

> Context file for AI sessions. Keep this up to date so every session knows what the game is.

## Concept
(Describe the game in 2-3 sentences. Currently a placeholder: tap/drag to move a moon, collect stars, dodge rocks.)

## Controls
Touch only: tap or drag anywhere. Must work on a phone in portrait.

## Current state
- v0.1: starter scene in `src/main.js`, placeholder art drawn at runtime.

## Backlog
- [ ] Decide the real game concept
- [ ] ...

## Rules for AI changes
- Plain JS + Phaser 3 (CDN). No build step, so a push deploys as-is.
- Touch controls first. Test at ~390x844 portrait.
- Placeholder art (generated shapes or Kenney.nl packs) until gameplay is fun.
- Bump `BUILD` in `src/main.js` on every change so the version on screen confirms the new deploy.
- Keep the on-screen FPS counter and the error overlay in `index.html`.
