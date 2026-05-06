#!/usr/bin/env python3
"""
Génère toutes les icônes PWA pour SkinMatch.
Couleurs : rose terracotta #C4726A (fond) + crème #FDF8F5 (texte)
"""

import os
import math
from PIL import Image, ImageDraw

# Couleurs SkinMatch
TERRACOTTA = (196, 114, 106, 255)   # #C4726A
CREAM      = (253, 248, 245, 255)   # #FDF8F5
DARK       = (80, 40, 36, 255)      # brun foncé pour les détails

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICONS_DIR  = os.path.join(BASE, "public", "icons")
SHOTS_DIR  = os.path.join(BASE, "public", "screenshots")
os.makedirs(ICONS_DIR, exist_ok=True)
os.makedirs(SHOTS_DIR, exist_ok=True)


def rounded_rect_mask(size, radius_pct=0.20):
    """Crée un masque RGBA avec coins arrondis."""
    w, h = size, size
    radius = int(w * radius_pct)
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
    return mask


def draw_leaf(draw, cx, cy, size, color):
    """Dessine une feuille stylisée (ovale penché)."""
    hw = size * 0.28
    hh = size * 0.45
    angle = -30
    # Approximation polygonale d'une ellipse pivotée
    pts = []
    for i in range(32):
        t = 2 * math.pi * i / 32
        x = hw * math.cos(t)
        y = hh * math.sin(t)
        rad = math.radians(angle)
        rx = x * math.cos(rad) - y * math.sin(rad)
        ry = x * math.sin(rad) + y * math.cos(rad)
        pts.append((cx + rx, cy + ry))
    draw.polygon(pts, fill=color)


def draw_drop(draw, cx, cy, size, color):
    """Dessine une goutte d'eau."""
    r = size * 0.18
    tip_y = cy - size * 0.30
    body_top = cy - r * 0.5
    # Corps circulaire
    draw.ellipse([cx - r, body_top, cx + r, body_top + r * 2], fill=color)
    # Pointe
    draw.polygon([
        (cx - r * 0.6, body_top + r * 0.5),
        (cx + r * 0.6, body_top + r * 0.5),
        (cx, tip_y),
    ], fill=color)


def make_icon(size):
    """Génère une icône carrée de `size`×`size` pixels."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Fond arrondi terracotta
    mask = rounded_rect_mask(size, radius_pct=0.22)
    bg = Image.new("RGBA", (size, size), TERRACOTTA)
    img.paste(bg, mask=mask)
    draw = ImageDraw.Draw(img)

    cx, cy = size / 2, size / 2

    if size >= 96:
        # Feuille crème (symbolise la nature / skincare)
        draw_leaf(draw, cx - size * 0.08, cy - size * 0.05, size, CREAM)
        # Goutte crème (symbolise l'hydratation)
        draw_drop(draw, cx + size * 0.14, cy + size * 0.06, size, (253, 248, 245, 200))
        # Petit cercle décoratif
        r_dot = size * 0.04
        draw.ellipse([
            cx - size * 0.25 - r_dot, cy + size * 0.22 - r_dot,
            cx - size * 0.25 + r_dot, cy + size * 0.22 + r_dot,
        ], fill=(253, 248, 245, 160))
    else:
        # Petite taille : juste une goutte centrée
        draw_drop(draw, cx, cy, size, CREAM)

    return img


def make_shortcut_icon(size=96):
    """Icône pour le shortcut 'Nouveau diagnostic' — fond plus clair."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    mask = rounded_rect_mask(size, radius_pct=0.22)
    # Fond légèrement plus clair
    bg = Image.new("RGBA", (size, size), (220, 140, 132, 255))
    img.paste(bg, mask=mask)
    draw = ImageDraw.Draw(img)
    cx, cy = size / 2, size / 2
    # Croix "+" (nouveau)
    bar = size * 0.06
    arm = size * 0.22
    draw.rectangle([cx - bar, cy - arm, cx + bar, cy + arm], fill=CREAM)
    draw.rectangle([cx - arm, cy - bar, cx + arm, cy + bar], fill=CREAM)
    return img


def make_screenshot(width, height, label, bg_color):
    """Génère un screenshot placeholder branded."""
    img = Image.new("RGBA", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Bande supérieure terracotta
    draw.rectangle([0, 0, width, int(height * 0.12)], fill=TERRACOTTA)

    # Titre centré dans la bande
    txt = "SkinMatch"
    # Taille de texte approximative (sans freetype on dessine des blocs)
    bw, bh = int(width * 0.55), int(height * 0.04)
    bx = (width - bw) // 2
    by = int(height * 0.04)
    draw.rectangle([bx, by, bx + bw, by + bh], fill=CREAM)

    # Zone de contenu (blocs simulant l'UI)
    margin = int(width * 0.08)
    y = int(height * 0.18)
    for i in range(5):
        h_block = int(height * 0.07)
        alpha = 200 - i * 20
        draw.rectangle(
            [margin, y, width - margin, y + h_block],
            fill=(*TERRACOTTA[:3], alpha),
        )
        y += h_block + int(height * 0.025)

    # Bouton CTA en bas
    btn_w = int(width * 0.6)
    btn_h = int(height * 0.065)
    bx = (width - btn_w) // 2
    by = int(height * 0.80)
    draw.rounded_rectangle([bx, by, bx + btn_w, by + btn_h], radius=btn_h // 2, fill=TERRACOTTA)
    # Texte simulé dans le bouton
    tw = int(btn_w * 0.5)
    th = int(btn_h * 0.35)
    draw.rectangle([(bx + btn_w // 2 - tw // 2), (by + btn_h // 2 - th // 2),
                    (bx + btn_w // 2 + tw // 2), (by + btn_h // 2 + th // 2)], fill=CREAM)

    # Icône coin bas droit
    icon_s = int(width * 0.12)
    icon = make_icon(icon_s)
    img.paste(icon, (width - icon_s - margin // 2, height - icon_s - margin // 2), icon)

    return img


# ── Génération des icônes ────────────────────────────────────────────────────

SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

print("Génération des icônes PWA...")
for s in SIZES:
    icon = make_icon(s)
    path = os.path.join(ICONS_DIR, f"icon-{s}.png")
    icon.save(path, "PNG", optimize=True)
    print(f"  ✅ icon-{s}.png  ({os.path.getsize(path) // 1024} KB)")

# Icône shortcut
shortcut = make_shortcut_icon(96)
path = os.path.join(ICONS_DIR, "shortcut-diagnostic.png")
shortcut.save(path, "PNG", optimize=True)
print(f"  ✅ shortcut-diagnostic.png  ({os.path.getsize(path) // 1024} KB)")

# ── Screenshots placeholder ──────────────────────────────────────────────────
print("\nGénération des screenshots placeholder...")
for name, label, bg in [
    ("welcome", "Accueil", (253, 248, 245, 255)),
    ("results", "Résultats", (248, 240, 236, 255)),
]:
    shot = make_screenshot(390, 844, label, bg)
    path = os.path.join(SHOTS_DIR, f"{name}.png")
    shot.save(path, "PNG", optimize=True)
    print(f"  ✅ screenshots/{name}.png  ({os.path.getsize(path) // 1024} KB)")

print("\nTerminé — tous les assets PWA sont générés.")
