import sys
import numpy as np
from PIL import Image, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
thr = int(sys.argv[3]) if len(sys.argv) > 3 else 240
dil = int(sys.argv[4]) if len(sys.argv) > 4 else 1

im = Image.open(src).convert("RGBA")
arr = np.array(im)
rgb = arr[:, :, :3].astype(np.int32)
mn = rgb.min(axis=2)
mx = rgb.max(axis=2)
# near-white & low color spread => background candidate
white = (mn > thr) & ((mx - mn) < 16)

from scipy import ndimage
lbl, n = ndimage.label(white)
border = np.concatenate([lbl[0, :], lbl[-1, :], lbl[:, 0], lbl[:, -1]])
border_labels = set(np.unique(border).tolist())
border_labels.discard(0)
bg = np.isin(lbl, list(border_labels))
if dil > 0:
    bg = ndimage.binary_dilation(bg, iterations=dil)

alpha = np.where(bg, 0, 255).astype(np.uint8)
arr[:, :, 3] = alpha
out = Image.fromarray(arr, "RGBA")
# feather edges
a = out.split()[3].filter(ImageFilter.GaussianBlur(1.1))
out.putalpha(a)
out.save(dst)
print("saved", dst, "bg pixels:", int(bg.sum()), "of", bg.size)
