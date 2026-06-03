from PIL import Image, ImageDraw, ImageFont

GOLD = (216, 180, 134, 255)
OUT = "/Users/polatinceler/claude/nest-moment/images"
FONT = "/tmp/Bricolage.ttf"

# ---------- emblem (vector -> raster, supersampled) ----------
K = 8
ew, eh = 86, 92
em = Image.new("RGBA", (ew * K, eh * K), (0, 0, 0, 0))
ed = ImageDraw.Draw(em)

def cub(p0, p1, p2, p3, n=80):
    out = []
    for i in range(n + 1):
        t = i / n; mt = 1 - t
        x = mt*mt*mt*p0[0] + 3*mt*mt*t*p1[0] + 3*mt*t*t*p2[0] + t*t*t*p3[0]
        y = mt*mt*mt*p0[1] + 3*mt*mt*t*p1[1] + 3*mt*t*t*p2[1] + t*t*t*p3[1]
        out.append((x * K, y * K))
    return out

segs = [((37,35),(20,42),(16,64),(31,74)),
        ((31,74),(44,83),(65,78),(69,61)),
        ((69,61),(72,49),(64,41),(53,43)),
        ((53,43),(60,48),(60,57),(53,61)),
        ((53,61),(44,66),(36,59),(37,49))]
poly = []
for s in segs:
    poly += cub(*s)
ed.polygon(poly, fill=GOLD)
ed.ellipse([(33*K, 9*K), (63*K, 39*K)], fill=GOLD)

em = em.crop(em.getbbox())
EM_H = 168
ratio = EM_H / em.height
em = em.resize((max(1, int(em.width * ratio)), EM_H), Image.LANCZOS)

# ---------- wordmark ----------
font = ImageFont.truetype(FONT, 168)
try:
    font.set_variation_by_name("Bold")
except Exception as e:
    print("var:", e)
tmp = Image.new("RGBA", (10, 10)); td = ImageDraw.Draw(tmp)
bbox = td.textbbox((0, 0), "Nest Moment", font=font)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
txt = Image.new("RGBA", (tw + 20, th + 20), (0, 0, 0, 0))
ImageDraw.Draw(txt).text((-bbox[0] + 10, -bbox[1] + 10), "Nest Moment", font=font, fill=GOLD)
txt = txt.crop(txt.getbbox())

# ---------- compose ----------
GAP = 40
H = max(em.height, txt.height)
W = em.width + GAP + txt.width
canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
canvas.alpha_composite(em, (0, (H - em.height) // 2))
canvas.alpha_composite(txt, (em.width + GAP, (H - txt.height) // 2))
canvas = canvas.crop(canvas.getbbox())

pad = 40
final = Image.new("RGBA", (canvas.width + pad * 2, canvas.height + pad * 2), (0, 0, 0, 0))
final.alpha_composite(canvas, (pad, pad))
final.save(f"{OUT}/logo.png")

dark = Image.new("RGBA", final.size, (12, 10, 9, 255))
dark.alpha_composite(final)
dark.convert("RGB").save(f"{OUT}/logo-on-dark.png")
print("done", final.size)
