"""Deterministic PNG extraction; no generative edits. Run from any directory."""
from pathlib import Path
from collections import deque
import json
import zipfile
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / 'source-wordmark.png'
OUT = ROOT / 'logos' / 'png-v1'
OUT.mkdir(parents=True, exist_ok=True)
im = Image.open(SOURCE).convert('RGB')
rgb = np.asarray(im)
# The lettering is dark; the baked-in checkerboard is substantially lighter.
mask = rgb.max(axis=2) < 80
seen = np.zeros(mask.shape, dtype=bool)
components = []
h, w = mask.shape
for y, x in zip(*np.where(mask)):
    if seen[y, x]:
        continue
    queue = deque([(int(y), int(x))])
    seen[y, x] = True
    pixels = []
    while queue:
        cy, cx = queue.pop()
        pixels.append((cy, cx))
        for ny, nx in ((cy-1,cx),(cy+1,cx),(cy,cx-1),(cy,cx+1)):
            if 0 <= ny < h and 0 <= nx < w and mask[ny,nx] and not seen[ny,nx]:
                seen[ny,nx] = True
                queue.append((ny,nx))
    if len(pixels) > 600:
        components.append(pixels)
clean = np.zeros(mask.shape, dtype=np.uint8)
for pixels in components:
    yy, xx = zip(*pixels)
    clean[yy, xx] = 255
alpha = Image.fromarray(clean).filter(ImageFilter.MedianFilter(3))
alpha = alpha.crop(alpha.getbbox())
# Split the word at the first fully empty column after F, deriving the icon
# from the same master shape instead of a separately generated drawing.
occupied = np.asarray(alpha).max(axis=0) > 0
split = next(i for i in range(20, len(occupied)) if not occupied[i])
symbol = alpha.crop((0, 0, split, alpha.height))
symbol = symbol.crop(symbol.getbbox())
colors = {'black': '#171717', 'white': '#FFFFFF', 'blue': '#168CCD'}
records = []
def render(master, kind, size, name, color):
    if kind == 'wordmark':
        padding = round(size * .025)
        iw = size - 2 * padding
        ih = round(master.height * iw / master.width)
        canvas_size = (size, ih + 2 * padding)
    else:
        padding = round(size * .1)
        scale = (size - 2*padding) / max(master.size)
        iw, ih = round(master.width*scale), round(master.height*scale)
        canvas_size = (size, size)
    a = master.resize((iw, ih), Image.Resampling.LANCZOS)
    canvas_alpha = Image.new('L', canvas_size, 0)
    canvas_alpha.paste(a, ((canvas_size[0]-iw)//2, (canvas_size[1]-ih)//2))
    result = Image.new('RGBA', canvas_size, color)
    result.putalpha(canvas_alpha)
    path = OUT / f'flekout-{kind}-{name}-{size}.png'
    result.save(path, optimize=True)
    assert result.getchannel('A').getextrema() == (0,255)
    records.append({'file': path.name, 'size': canvas_size, 'color': color})
for name, color in colors.items():
    for size in (2048, 1024):
        render(alpha, 'wordmark', size, name, color)
    for size in (1024, 512, 128, 32):
        render(symbol, 'symbol', size, name, color)
# Verify pixel-identical alpha across color variants.
for kind, sizes in [('wordmark',(2048,1024)), ('symbol',(1024,512,128,32))]:
    for size in sizes:
        aa = [Image.open(OUT/f'flekout-{kind}-{name}-{size}.png').getchannel('A').tobytes() for name in colors]
        assert aa[0] == aa[1] == aa[2]
# Preview on explicit backgrounds, separate from transparent deliverables.
preview = Image.new('RGB', (1200, 780), '#e9ecef')
for row, (name, background) in enumerate([('black','#ffffff'),('white','#24272a'),('blue','#ffffff')]):
    tile = Image.new('RGBA', (1160,230), background)
    logo = Image.open(OUT/f'flekout-wordmark-{name}-1024.png')
    logo.thumbnail((870,170),Image.Resampling.LANCZOS)
    tile.alpha_composite(logo,(250, (230-logo.height)//2))
    icon = Image.open(OUT/f'flekout-symbol-{name}-512.png')
    icon.thumbnail((190,190),Image.Resampling.LANCZOS)
    tile.alpha_composite(icon,(20,20))
    preview.paste(tile.convert('RGB'),(20,20+row*255))
preview.save(ROOT/'logos-preview.png')
(OUT/'manifest.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
with zipfile.ZipFile(ROOT/'flekout-transparent-logos-v1.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for p in sorted(OUT.iterdir()):
        archive.write(p, p.name)
print(f'Exported {len(records)} transparent PNGs. Identical masks across colors verified.')
