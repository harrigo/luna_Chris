#!/usr/bin/env python3
"""Pack assets/sprites/*.png (the editable sprites listed in assets/sprites/index.json) into one or two sprite sheets
for the game to load in two requests instead of hundreds.

    python3 tools/pack_sprites.py [out_dir]      (default out_dir: assets/sprites)

Writes sheet0.png (sheet1.png...) and sheet.json:  {"v": <content hash>, "pages": [...], "frames": {key: [page, x, y, w, h]}}
The deploy workflow runs this, so after editing a PNG you only commit the PNG. Needs Pillow.
"""
import hashlib, json, os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'assets', 'sprites')
OUT = sys.argv[1] if len(sys.argv) > 1 else SRC
PAGE, PAD = 2048, 2

index = json.load(open(os.path.join(SRC, 'index.json')))
items, h = [], hashlib.sha1()
for key in index['sprites']:
    path = os.path.join(SRC, key + '.png')
    if not os.path.exists(path):
        print('missing, skipped:', key); continue
    raw = open(path, 'rb').read(); h.update(key.encode()); h.update(raw)
    im = Image.open(path).convert('RGBA')
    items.append((key, im))
items.sort(key=lambda it: (-it[1].height, -it[1].width))          # shelf packing, tallest first

pages, frames = [], {}
def new_page():
    pages.append(Image.new('RGBA', (PAGE, PAGE), (0, 0, 0, 0))); return [PAD, PAD, 0]
cur = new_page()
for key, im in items:
    w, hh = im.size
    if cur[0] + w + PAD > PAGE: cur[0] = PAD; cur[1] += cur[2] + PAD; cur[2] = 0
    if cur[1] + hh + PAD > PAGE: cur = new_page()
    pages[-1].paste(im, (cur[0], cur[1]))
    frames[key] = [len(pages) - 1, cur[0], cur[1], w, hh]
    cur[0] += w + PAD; cur[2] = max(cur[2], hh)

os.makedirs(OUT, exist_ok=True)
names = []
for i, pg in enumerate(pages):
    used = pg.getbbox() or (0, 0, 1, 1)
    pg = pg.crop((0, 0, min(PAGE, used[2] + PAD), min(PAGE, used[3] + PAD)))   # trim the empty space
    name = 'sheet%d.png' % i; pg.save(os.path.join(OUT, name), optimize=True); names.append(name)
json.dump({'v': h.hexdigest()[:12], 'pages': names, 'frames': frames}, open(os.path.join(OUT, 'sheet.json'), 'w'), separators=(',', ':'))
print('packed %d sprites onto %d sheet(s) -> %s' % (len(frames), len(names), OUT))
