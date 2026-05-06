#!/usr/bin/env python3
"""
Extraction robuste des produits depuis index.html
Gère les clés dupliquées (video x2), caractères spéciaux, etc.
"""
import re, json, os

BASE = os.path.join(os.path.dirname(__file__), '..')
html = open(os.path.join(BASE, 'index.html'), encoding='utf-8').read()

# Extraire le bloc DB brut
db_start = html.index('const DB = {') + len('const DB = ')
depth, i = 0, db_start
while i < len(html):
    if html[i] == '{': depth += 1
    elif html[i] == '}':
        depth -= 1
        if depth == 0:
            db_raw = html[db_start:i+1]
            break
    i += 1

# Extraire le bloc IMGS brut
imgs_start = html.index('const IMGS = {') + len('const IMGS = ')
depth, i = 0, imgs_start
while i < len(html):
    if html[i] == '{': depth += 1
    elif html[i] == '}':
        depth -= 1
        if depth == 0:
            imgs_raw = html[imgs_start:i+1]
            break
    i += 1

# ── Parser IMGS (simple: "key": "url") ─────────────────────────────────────
imgs = {}
for m in re.finditer(r'"([^"]+)"\s*:\s*"(https?://[^"]+)"', imgs_raw):
    imgs[m.group(1)] = m.group(2)
print(f"✅ {len(imgs)} images extraites")

# ── Parser DB produit par produit ──────────────────────────────────────────
# Chaque produit: "key": { ... }
# On extrait les produits un par un en suivant les accolades

def extract_products_from_block(src):
    products = {}
    # Trouver toutes les clés produits (entre { et : {)
    # Format: "cs-power": {nom:...}
    pattern = re.compile(r'"([a-z0-9\-]+)"\s*:\s*\{')

    matches = list(pattern.finditer(src))
    for idx, m in enumerate(matches):
        key = m.group(1)
        # Trouver la fin de cet objet
        start = m.end() - 1  # position du {
        depth, i = 0, start
        while i < len(src):
            if src[i] == '{': depth += 1
            elif src[i] == '}':
                depth -= 1
                if depth == 0:
                    obj_src = src[start:i+1]
                    prod = parse_product_obj(obj_src)
                    if prod:
                        products[key] = prod
                    break
            i += 1
    return products

def parse_product_obj(src):
    """Parse un objet produit JS en dict Python."""
    prod = {}

    def get_str(field):
        # Cherche: field:"value" ou field: "value"
        m = re.search(rf'{field}\s*:\s*"((?:[^"\\]|\\.)*)"', src)
        if m:
            return m.group(1).replace('\\"', '"').replace('\\n', '\n')
        # Guillemets simples
        m = re.search(rf"{field}\s*:\s*'((?:[^'\\]|\\.)*)'", src)
        if m:
            return m.group(1)
        return None

    def get_bool(field):
        m = re.search(rf'{field}\s*:\s*(true|false)', src)
        return m.group(1) == 'true' if m else False

    def get_int(field):
        m = re.search(rf'{field}\s*:\s*(\d+)', src)
        return int(m.group(1)) if m else 0

    def get_array(field):
        m = re.search(rf'{field}\s*:\s*\[([^\]]*)\]', src)
        if not m: return []
        items_src = m.group(1)
        items = re.findall(r'"((?:[^"\\]|\\.)*)"', items_src)
        if not items:
            items = re.findall(r"'((?:[^'\\]|\\.)*)'", items_src)
        return items

    prod['nom']     = get_str('nom') or ''
    prod['marque']  = get_str('marque') or ''
    prod['prix']    = get_str('prix') or '0€'
    prod['link']    = get_str('link') or ''
    prod['yuka']    = get_int('yuka')
    prod['yl']      = get_str('yl') or ''
    prod['usage']   = get_str('usage') or ''
    prod['texture'] = get_str('texture') or ''
    prod['pq']      = get_str('pq') or ''
    prod['ben']     = get_str('ben') or ''
    prod['ben_en']  = get_str('ben_en') or ''
    prod['app']     = get_str('app') or ''
    prod['moment']  = get_str('moment') or 'AM+PM'
    prod['clean']   = get_bool('clean')
    prod['vegan']   = get_bool('vegan')
    prod['ak']      = get_array('ak')
    prod['comp']    = get_array('comp')

    # Prix numérique
    prix_str = prod['prix'].replace('€','').replace('~','').strip()
    try:
        prix_num = float(prix_str)
    except:
        prix_num = 0

    prod['prix_num'] = prix_num
    prod['prix_structured'] = {'fr': prix_num, 'gb': None, 'us': None}
    prod['link_structured'] = {'fr': prod['link'], 'gb': None, 'us': None}
    prod['deprecated'] = False

    return prod

# ── Lancer l'extraction ─────────────────────────────────────────────────────
products_raw = extract_products_from_block(db_raw)
print(f"✅ {len(products_raw)} produits parsés")

# Fusionner avec les images
products = {}
for key, prod in products_raw.items():
    products[key] = {
        'id': key,
        **prod,
        'img': imgs.get(key, None)
    }

# Écriture
data_dir = os.path.join(BASE, 'src', 'data')
os.makedirs(data_dir, exist_ok=True)

out_path = os.path.join(data_dir, 'products.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

# Validation
with open(out_path, encoding='utf-8') as f:
    loaded = json.load(f)
print(f"✅ JSON valide — {len(loaded)} produits écrits dans src/data/products.json")

# Afficher quelques stats
brands = {}
for p in loaded.values():
    brands[p['marque']] = brands.get(p['marque'], 0) + 1
print("\n📊 Répartition par marque:")
for brand, count in sorted(brands.items(), key=lambda x: -x[1]):
    print(f"   {brand}: {count} produit(s)")
