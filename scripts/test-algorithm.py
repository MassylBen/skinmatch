#!/usr/bin/env python3
"""
Test rapide de l'algorithme en Python (simule la logique JS)
Valide que pour chaque combinaison skin×budget, on obtient des produits pertinents
"""
import json, os

BASE = os.path.join(os.path.dirname(__file__), '..')
products = json.load(open(f'{BASE}/src/data/products.json', encoding='utf-8'))

SKIN_TYPES = ['seche', 'grasse', 'mixte', 'normale', 'sensible']
BUDGETS    = ['low', 'mid', 'high']
CONCERNS   = ['acne','taches','rides','pores','rougeurs','cernes','eclat','deshydratation','imperfections','sensibilite']

SKIN_PROXIMITY = {
    'seche':    {'seche':1,'grasse':0,'mixte':0.3,'normale':0.5,'sensible':0.4},
    'grasse':   {'seche':0,'grasse':1,'mixte':0.7,'normale':0.4,'sensible':0.2},
    'mixte':    {'seche':0.3,'grasse':0.7,'mixte':1,'normale':0.5,'sensible':0.3},
    'normale':  {'seche':0.5,'grasse':0.4,'mixte':0.5,'normale':1,'sensible':0.6},
    'sensible': {'seche':0.4,'grasse':0.2,'mixte':0.3,'normale':0.6,'sensible':1},
}

def score(p, skin, budget, concern, age='26-35'):
    s = 0
    # Skin type (30 pts)
    types = p.get('skinTypes', [])
    if skin in types:
        s += 30
    else:
        prox = SKIN_PROXIMITY.get(skin, {})
        max_prox = max((prox.get(t, 0) for t in types), default=0)
        s += round(max_prox * 20)
    # Concern (25 pts)
    concerns = p.get('concerns', [])
    if concern in concerns: s += 25
    # Budget (20 pts)
    eff_budget = 'mid' if budget == 'mix' else budget
    bt = p.get('budgetTier', 'mid')
    if bt == eff_budget: s += 20
    elif eff_budget == 'high': s += 15
    elif eff_budget == 'mid' and bt == 'low': s += 10
    elif eff_budget == 'low' and bt == 'mid': s += 5
    # Age (15 pts)
    if age in p.get('ageGroups', []): s += 15
    # Qualité (10 pts)
    if p.get('clean'): s += 4
    if p.get('vegan'): s += 3
    if p.get('yuka', 0) >= 80: s += 3
    return min(100, max(0, s))

def pick_best(step_type, skin, budget, concern, age, used_ids):
    candidates = [
        (pid, p, score(p, skin, budget, concern, age))
        for pid, p in products.items()
        if p.get('stepType') == step_type and pid not in used_ids and not p.get('deprecated')
    ]
    candidates.sort(key=lambda x: -x[2])
    return candidates[0] if candidates else None

errors = []
ok = 0
tested = 0

print("🧪 Test algorithme — toutes les combinaisons skin × budget × concern\n")

for skin in SKIN_TYPES:
    for budget in BUDGETS:
        for concern in CONCERNS:
            tested += 1
            used = set()

            # Routine simple: nettoyant + hydratant + SPF
            nettoyant = pick_best('nettoyant', skin, budget, concern, '26-35', used)
            hydratant  = pick_best('hydratant',  skin, budget, concern, '26-35', used)
            spf        = pick_best('protection_solaire', skin, budget, concern, '26-35', used)

            if not nettoyant:
                errors.append(f"❌ Aucun nettoyant pour {skin}/{budget}/{concern}")
            if not hydratant:
                errors.append(f"❌ Aucun hydratant pour {skin}/{budget}/{concern}")
            if not spf:
                errors.append(f"❌ Aucun SPF pour {skin}/{budget}/{concern}")

            # Sérum pour le concern
            serum = pick_best('serum', skin, budget, concern, '26-35', used)
            if not serum:
                # Fallback: n'importe quel hydratant
                serum = pick_best('hydratant', skin, budget, concern, '26-35', used)

            if nettoyant and hydratant and spf:
                ok += 1

print(f"✅ {ok}/{tested} combinaisons génèrent une routine complète")
if errors:
    print(f"\n⚠️  {len(errors)} problèmes détectés:")
    for e in errors[:10]:
        print(f"   {e}")
else:
    print("✅ Aucune combinaison ne retourne 0 produits")

# Test allergie
print("\n🔒 Test sécurité allergies:")
retinol_products = [(pid, p) for pid, p in products.items()
                    if any('retinol' in c.lower() for c in p.get('comp', []))]
print(f"   Produits contenant du rétinol: {len(retinol_products)}")
print(f"   Exemple: {retinol_products[0][1]['nom'] if retinol_products else 'aucun'}")

# Test conflits
print("\n⚡ Test conflits ingrédients:")
CONFLICTS = [
    ('retinol', 'ascorbic acid'),
    ('glycolic acid', 'salicylic acid'),
]
for ingA, ingB in CONFLICTS:
    prods_A = [p['nom'] for p in products.values() if ingA in ' '.join(p.get('comp',[])).lower()]
    prods_B = [p['nom'] for p in products.values() if ingB in ' '.join(p.get('comp',[])).lower()]
    print(f"   {ingA} ({len(prods_A)} produits) vs {ingB} ({len(prods_B)} produits) → à vérifier en runtime")

# Afficher une routine exemple
print("\n📋 Exemple routine — peau grasse, budget mid, concern acné:")
used = set()
ex_skin, ex_budget, ex_concern = 'grasse', 'mid', 'acne'
for step in ['nettoyant', 'serum', 'hydratant', 'protection_solaire']:
    result = pick_best(step, ex_skin, ex_budget, ex_concern, '26-35', used)
    if result:
        pid, p, sc = result
        used.add(pid)
        print(f"   [{step:20}] {p['nom']:35} ({p['marque']}) — score: {sc}")
