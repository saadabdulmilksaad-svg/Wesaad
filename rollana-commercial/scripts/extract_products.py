"""Cut product elements out of the ORIGINAL wrapper photo.
No generation / redrawing: pixels come 1:1 from the original; only an alpha
mask is added and the crop is enlarged with Lanczos interpolation."""
import numpy as np
from PIL import Image, ImageFilter
from rembg import remove, new_session

SRC = 'assets/original/rollana-wrapper-original.png'
OUT = 'assets/products/'
im = Image.open(SRC).convert('RGB')
S = 4  # enlargement factor for crops

def ellipse_mask(w, h, cx, cy, rx, ry, feather):
    y, x = np.mgrid[0:h, 0:w]
    d = np.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2)
    return np.clip((1 - d) * (min(rx, ry) / feather) + 0.5, 0, 1)

def cut(box, name, sess, ell, use_seg=True):
    crop = im.crop(box)
    big = crop.resize((crop.width * S, crop.height * S), Image.LANCZOS)
    big = big.filter(ImageFilter.UnsharpMask(radius=2, percent=40, threshold=2))
    if use_seg:
        a = np.array(remove(big, session=sess, post_process_mask=True))[..., 3].astype(float) / 255
    else:  # segmentation nibbled the ball outline -> geometric mask keeps the true silhouette
        a = np.ones((big.height, big.width))
    # restrict to the ball area (keeps the printed ribbon out)
    cx, cy, rx, ry = [v * S for v in ell]
    a *= ellipse_mask(big.width, big.height, cx, cy, rx, ry, 6 * S)
    # remove ribbon pixels + pink ribbon reflections, only near the rim (never the almond/cream)
    rgb = np.array(big).astype(float)
    r_, g_, b_ = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    red = np.clip((r_ - g_ - 70) / 40, 0, 1)
    pink = np.clip(((r_ - g_) - 22 - 1.5 * np.maximum(0, g_ - b_)) / 20, 0, 1)
    red = np.maximum(red, pink)
    red = np.array(Image.fromarray((red * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(5))) / 255
    yy, xx = np.mgrid[0:big.height, 0:big.width]
    d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
    a *= 1 - red * np.clip((d - 0.72) / 0.12, 0, 1)
    out = np.dstack([np.array(big), (a * 255).astype(np.uint8)])
    Image.fromarray(out, 'RGBA').save(OUT + name)
    print(name, big.size)

sess = new_session('isnet-general-use')
# whole coconut ball (left on wrapper)
cut((132, 55, 368, 308), 'ball-whole.png', sess, ell=(120, 128, 94, 106), use_seg=False)
# cut ball showing almond / cream / wafer (right on wrapper)
cut((1035, 72, 1310, 345), 'ball-cut.png', sess, ell=(140, 136, 134, 132))

# full wrapper: separate the pack from the dark marble background (pixels untouched)
from scipy import ndimage
rgb = np.array(im).astype(float)
lum = rgb.mean(axis=2)
m = (lum > 58) | ((rgb[..., 0] > 120) & (rgb[..., 0] - rgb[..., 1] > 50))
m = ndimage.binary_opening(m, iterations=5)
lab, n = ndimage.label(m)
sizes = ndimage.sum(m, lab, range(1, n + 1))
m = lab == (np.argmax(sizes) + 1)
m = ndimage.binary_fill_holes(ndimage.binary_closing(m, iterations=4))
a = ndimage.gaussian_filter(m.astype(float), 1.0)
Image.fromarray(np.dstack([np.array(im), (a * 255).astype(np.uint8)]), 'RGBA').save(OUT + 'wrapper.png')
print('wrapper.png', im.size)

# single almond lifted from the cut ball (used as a floating ingredient)
cutb = Image.open(OUT + 'ball-cut.png').convert('RGB')
h, w = cutb.height, cutb.width
y, x = np.mgrid[0:h, 0:w]
cx, cy, rx, ry, ang = 445, 362, 262, 112, np.deg2rad(24)
xr = (x - cx) * np.cos(ang) + (y - cy) * np.sin(ang)
yr = -(x - cx) * np.sin(ang) + (y - cy) * np.cos(ang)
d = np.sqrt((xr / rx) ** 2 + (yr / ry) ** 2)
am = np.clip((1 - d) * 14, 0, 1)
alm = np.dstack([np.array(cutb), (am * 255).astype(np.uint8)])
Image.fromarray(alm, 'RGBA').crop((cx - rx - 10, cy - rx - 10, cx + rx + 10, cy + rx + 10)).save('assets/ingredients/almond.png')
print('almond.png')
