from PIL import Image, ImageDraw

# Icône : coche dans un rond bleu, sur fond dégradé bleu nuit.
def fond(size):
    img = Image.new("RGB", (size, size))
    haut, bas = (30, 42, 68), (16, 20, 31)
    d = ImageDraw.Draw(img)
    for y in range(size):
        t = y / size
        d.line([(0, y), (size, y)], fill=tuple(int(haut[i] + (bas[i] - haut[i]) * t) for i in range(3)))
    return img

def icone(size, echelle, maskable):
    img = fond(size).convert("RGBA")
    d = ImageDraw.Draw(img)
    cx, cy = size / 2, size / 2
    r = size * 0.30 * echelle
    bleu = (79, 140, 255, 255)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=bleu)
    # Coche blanche.
    ep = max(3, int(size * 0.045 * echelle))
    p1 = (cx - r * 0.5, cy + r * 0.05)
    p2 = (cx - r * 0.1, cy + r * 0.45)
    p3 = (cx + r * 0.55, cy - r * 0.4)
    d.line([p1, p2, p3], fill=(255, 255, 255, 255), width=ep, joint="curve")
    for p in (p1, p2, p3):
        d.ellipse([p[0] - ep / 2, p[1] - ep / 2, p[0] + ep / 2, p[1] + ep / 2], fill=(255, 255, 255, 255))
    if not maskable:
        masque = Image.new("L", (size, size), 0)
        ImageDraw.Draw(masque).rounded_rectangle([0, 0, size - 1, size - 1], radius=size * 0.22, fill=255)
        sortie = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        sortie.paste(img, (0, 0), masque)
        return sortie
    return img

for s in (192, 512):
    icone(s, 1.0, False).save(f"icons/icon-{s}.png")
    icone(s, 0.78, True).save(f"icons/icon-{s}-maskable.png")
icone(256, 1.0, False).save("icons/rappels.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
print("icons ok")
