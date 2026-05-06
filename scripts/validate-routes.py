#!/usr/bin/env python3
"""
Validation du fichier routes.json
Vérifie que toutes les références de produits existent dans products.json
"""
import json, sys, os

BASE = os.path.dirname(__file__) + '/..'

try:
    routes   = json.load(open(f'{BASE}/src/data/routes.json', encoding='utf-8'))
    products = json.load(open(f'{BASE}/src/data/products.json', encoding='utf-8'))
except (json.JSONDecodeError, FileNotFoundError) as e:
    print(f"❌ Erreur lecture fichiers: {e}")
    sys.exit(1)

product_ids = set(products.keys())
errors = []

REQUIRED_SECTIONS = ['net', 'hyd', 'ser', 'spf']
SKIN_TYPES = ['seche', 'grasse', 'mixte', 'normale', 'sensible']
BUDGETS    = ['low', 'mid', 'high']
CONCERNS   = ['acne', 'taches', 'rides', 'eclat', 'deshydratation',
               'rougeurs', 'pores', 'imperfections', 'sensibilite', 'cernes']

def check_product_ref(section, path, pid):
    if pid and pid not in product_ids:
        errors.append(f"[{section}] {path} → '{pid}' introuvable dans products.json")

# Vérifier structure de base
for section in REQUIRED_SECTIONS:
    if section not in routes:
        errors.append(f"Section manquante dans routes.json: '{section}'")

# Vérifier net (nettoyants)
for skin in SKIN_TYPES:
    for budget in BUDGETS:
        pid = routes.get('net', {}).get(skin, {}).get(budget)
        if not pid:
            errors.append(f"[net] Route manquante: net.{skin}.{budget}")
        else:
            check_product_ref('net', f"net.{skin}.{budget}", pid)

# Vérifier hyd (hydratants)
for skin in SKIN_TYPES:
    for budget in BUDGETS:
        pid = routes.get('hyd', {}).get(skin, {}).get(budget)
        if not pid:
            errors.append(f"[hyd] Route manquante: hyd.{skin}.{budget}")
        else:
            check_product_ref('hyd', f"hyd.{skin}.{budget}", pid)

# Vérifier ser (sérums par concern)
for concern in CONCERNS:
    for budget in BUDGETS:
        pid = routes.get('ser', {}).get(concern, {}).get(budget)
        if not pid:
            errors.append(f"[ser] Route manquante: ser.{concern}.{budget}")
        else:
            check_product_ref('ser', f"ser.{concern}.{budget}", pid)

# Vérifier spf
for budget in BUDGETS:
    pid = routes.get('spf', {}).get(budget)
    if not pid:
        errors.append(f"[spf] Route manquante: spf.{budget}")
    else:
        check_product_ref('spf', f"spf.{budget}", pid)

# Résumé
total_routes = (len(SKIN_TYPES) * len(BUDGETS) * 2) + (len(CONCERNS) * len(BUDGETS)) + len(BUDGETS)
print(f"\n📊 {total_routes} routes vérifiées")
print(f"   Produits disponibles: {len(product_ids)}")

if errors:
    print(f"\n❌ {len(errors)} erreurs:")
    for e in errors:
        print(f"   {e}")
    sys.exit(1)
else:
    print(f"\n✅ routes.json valide — tous les produits référencés existent\n")
