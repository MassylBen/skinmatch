#!/usr/bin/env python3
"""
Validation du fichier products.json
Utilisé par le CI et le hook PostEdit
"""
import json, sys, os

path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'products.json')

try:
    with open(path, encoding='utf-8') as f:
        products = json.load(f)
except json.JSONDecodeError as e:
    print(f"❌ JSON invalide dans products.json : {e}")
    sys.exit(1)
except FileNotFoundError:
    print(f"❌ Fichier introuvable : {path}")
    sys.exit(1)

REQUIRED_FIELDS = ['id', 'nom', 'marque', 'prix_num', 'moment', 'yuka', 'clean', 'vegan', 'ak', 'comp']
VALID_MOMENTS   = ['AM', 'PM', 'AM+PM']
VALID_BUDGETS   = ['low', 'mid', 'high', None]

errors = []
warnings = []

for pid, p in products.items():
    # ID cohérent
    if p.get('id') != pid:
        errors.append(f"[{pid}] id interne '{p.get('id')}' ≠ clé '{pid}'")

    # Champs requis
    for field in REQUIRED_FIELDS:
        if field not in p:
            errors.append(f"[{pid}] Champ requis manquant: '{field}'")

    # Types
    if 'prix_num' in p and not isinstance(p['prix_num'], (int, float)):
        errors.append(f"[{pid}] prix_num doit être un nombre, reçu: {type(p['prix_num'])}")

    if 'yuka' in p:
        if not isinstance(p['yuka'], (int, float)) or not (0 <= p['yuka'] <= 100):
            errors.append(f"[{pid}] yuka doit être entre 0 et 100, reçu: {p['yuka']}")

    if 'moment' in p and p['moment'] not in VALID_MOMENTS:
        errors.append(f"[{pid}] moment invalide: '{p['moment']}' (attendu: {VALID_MOMENTS})")

    if 'budgetTier' in p and p['budgetTier'] not in VALID_BUDGETS:
        warnings.append(f"[{pid}] budgetTier inconnu: '{p['budgetTier']}'")

    if 'clean' in p and not isinstance(p['clean'], bool):
        errors.append(f"[{pid}] clean doit être boolean")

    if 'vegan' in p and not isinstance(p['vegan'], bool):
        errors.append(f"[{pid}] vegan doit être boolean")

    # Champs vides
    if not p.get('nom', '').strip():
        errors.append(f"[{pid}] nom est vide")
    if not p.get('marque', '').strip():
        errors.append(f"[{pid}] marque est vide")

    # Listes
    if 'ak' in p and not isinstance(p['ak'], list):
        errors.append(f"[{pid}] ak doit être une liste")
    if 'comp' in p and not isinstance(p['comp'], list):
        errors.append(f"[{pid}] comp doit être une liste")

    # Champs enrichis (warnings si absents)
    for optional in ['skinTypes', 'concerns', 'ageGroups', 'img', 'ben_en']:
        if optional not in p:
            warnings.append(f"[{pid}] Champ optionnel manquant: '{optional}'")

# Résumé
print(f"\n📊 {len(products)} produits analysés")
print(f"   Marques: {len(set(p['marque'] for p in products.values()))}")
print(f"   Avec image: {sum(1 for p in products.values() if p.get('img'))}")
print(f"   Clean: {sum(1 for p in products.values() if p.get('clean'))}")
print(f"   Vegan: {sum(1 for p in products.values() if p.get('vegan'))}")

if warnings:
    print(f"\n⚠️  {len(warnings)} warnings (non bloquants):")
    # Grouper les warnings par type pour ne pas noyer la sortie
    shown = warnings[:10]
    for w in shown:
        print(f"   {w}")
    if len(warnings) > 10:
        print(f"   ... et {len(warnings) - 10} autres warnings")

if errors:
    print(f"\n❌ {len(errors)} erreurs (bloquantes):")
    for e in errors:
        print(f"   {e}")
    sys.exit(1)
else:
    print(f"\n✅ products.json valide — aucune erreur critique\n")
