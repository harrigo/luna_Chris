# Editable sprites

Every PNG in this folder is a sprite in the game. Edit one, commit it, and the next deploy uses it.

- **The file name is the sprite's name** (`frog.png` is the rat-frog sitting, `c_body.png` is Chris's body, `baron.png` is the level 2 boss...). Keep the name.
- **Keep the size** (or exactly double/triple it if you must; the game draws it at the file's size, so a bigger file means a bigger sprite).
- **Transparent background**, facing **right** for characters (the game flips them).
- Characters have their **dark outline drawn in** the PNG; the game doesn't add one.
- Some things are built from several sprites (Chris is `c_body`, `c_head`, `c_leg`, `c_boot`, `c_arm`, the cape strips...; animations are numbered or suffixed: `frog`, `frog_blink`, `frog_leap`, `frog_open`...).
- **Brand-new names** need adding to `index.json` too (and the game has to use them).
- **Delete a PNG** (and its line in `index.json`) and the game goes back to the original drawn-in-code version.

On the live site the deploy packs all of these into one sheet (`tools/pack_sprites.py` makes `sheet0.png` + `sheet.json`), so the game downloads them in two requests. Locally, without a sheet, it loads each PNG on its own.
