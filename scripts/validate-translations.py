#!/usr/bin/env python3
"""
Validation du fichier translations.json
Vérifie que toutes les clés FR existent dans chaque autre langue
"""
import json, sys, os

path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'translations.json')

try:
    with open(path, encoding='utf-8') as f:
        data = json.load(f)
except json.JSONDecodeError as e:
    print(f"❌ JSON invalide : {e}")
    sys.exit(1)

def get_all_keys(obj, prefix=''):
    """Récupère toutes les clés d'un objet imbriqué en notation pointée."""
    keys = set()
    if isinstance(obj, dict):
        for k, v in obj.items():
            full_key = f"{prefix}.{k}" if prefix else k
            keys.add(full_key)
            keys |= get_all_keys(v, full_key)
    return keys

fr_keys = get_all_keys(data.get('fr', {}))
errors = []
warnings = []

for lang in data:
    if lang == 'fr':
        continue
    lang_keys = get_all_keys(data[lang])
    missing = fr_keys - lang_keys
    extra = lang_keys - fr_keys

    if missing:
        for key in sorted(missing):
            errors.append(f"[{lang}] Clé manquante: '{key}'")
    if extra:
        for key in sorted(extra):
            warnings.append(f"[{lang}] Clé extra (pas dans FR): '{key}'")

    print(f"  {lang}: {len(lang_keys)} clés ({len(missing)} manquantes, {len(extra)} extras)")

print(f"\n📊 Langues disponibles: {list(data.keys())}")
print(f"   Clés de référence (FR): {len(fr_keys)}")

if warnings:
    print(f"\n⚠️  {len(warnings)} warnings:")
    for w in warnings[:5]:
        print(f"   {w}")

if errors:
    print(f"\n❌ {len(errors)} erreurs:")
    for e in errors[:20]:
        print(f"   {e}")
    sys.exit(1)
else:
    print(f"\n✅ translations.json valide\n")
