#!/usr/bin/env python3
"""
Agent Products — Enrichissement des 115 produits
Ajoute: skinTypes, concerns, ageGroups, budgetTier, allergenes
Basé sur: usage, pq, ak, comp, prix_num, marque
"""
import json, re, os

BASE = os.path.join(os.path.dirname(__file__), '..')
path = os.path.join(BASE, 'src', 'data', 'products.json')

products = json.load(open(path, encoding='utf-8'))

# ── Tables de référence ────────────────────────────────────────────────────────

SKIN_KEYWORDS = {
    'seche':    ['sèche','dry','xerose','très sèche','dessèchement','lipid','cold cream','karité','urea','urée','baume','nourrissant','riche'],
    'grasse':   ['grasse','oily','sébum','sebum','sebacée','matif','purifiant','zinc','acide salicylique','salicylic','bha','niacinamide','pores','imperfection','acné','acne','purif'],
    'mixte':    ['mixte','combination','zone t','t-zone','équilibr','sebacée','reequilibr'],
    'normale':  ['normale','normal','équilibr','balanced'],
    'sensible': ['sensible','sensitive','réactiv','reactive','rougeur','couperose','rosacea','intoler','hypersensibl','thermale','avène','uriage','bioderma','cica','apaisant','apaise','tolérance'],
}

CONCERN_KEYWORDS = {
    'acne':           ['acné','acne','bouton','imperfection','blemish','purifi','purifiant','sebum','sébum','comedogen','point noir','blackhead','antiseptique'],
    'taches':         ['tache','spot','hyperpigment','dépigment','unifiant','éclat','vitamine c','niacinamide','kojique','tranexamique','melascreen','depiwhite','discolor','viniférine'],
    'rides':          ['ride','ridule','wrinkle','anti-âge','antiage','liftant','fermete','fermeté','retinol','rétinol','proxylane','peptide','collagène','collagen','hyaluronique','repulpe','redensifie','raffermit'],
    'pores':          ['pore','bha','acide salicylique','salicylic','niacinamide','zinc','matif','séborégulateu','sebologique'],
    'rougeurs':       ['rougeur','redness','couperose','rosacea','apaisant','apaise','calmant','roséliane','rosaliac','sensibio','toleriane','cica','bisabolol','madecassoside','panthenol'],
    'cernes':         ['cerne','dark circle','poche','eye','yeux','contour','caffeine','caféine','décongestionnant'],
    'eclat':          ['éclat','glow','teint','illumin','vitamine c','niacinamide','exfoliant','glycolique','glycolic','aha','masque','culte','vinoperfect','brighten'],
    'deshydratation': ['hydrat','hyaluronic','hyaluronique','moisture','aqua','repulp','déshydrat','sérum bleu','h2o','eau','boost'],
    'imperfections':  ['point noir','blackhead','bha','acide salicylique','salicylic','pore','comedogen','purifi'],
    'sensibilite':    ['sensible','sensitive','réactiv','reactive','apaise','apaisant','thermal','thermale','cica','barrier','barrière','tolérance','hypersensibl'],
}

AGE_KEYWORDS = {
    '18-25': ['prévention','jeune','young','éclat','légère','light','purifi','acné','acne','imperfection','blemish'],
    '26-35': ['maintien','correction','premières rides','first wrinkle','niacinamide','vitamine c','hydrat'],
    '36-45': ['anti-âge','antiage','rides','fermeté','rides profondes','retinol','rétinol','proxylane','lifting'],
    '46+':   ['mature','matur','rides profondes','intense','correcteur','redensifi','repulp','proxylane','collagène','collagen','raffermis','liftant','sérum le power','absolue','renergie'],
}

ALLERGEN_INCI = {
    'parfum':           ['parfum','fragrance','linalool','limonene','citronellol','geraniol','eugenol','coumarin'],
    'paraben':          ['methylparaben','ethylparaben','propylparaben','butylparaben'],
    'alcool':           ['alcohol denat','ethanol','sd alcohol'],
    'sulfate':          ['sodium lauryl sulfate','sodium laureth sulfate','sls','sles','ammonium lauryl'],
    'silicone':         ['dimethicone','cyclopentasiloxane','cyclohexasiloxane','trimethicone','amodimethicone'],
    'salicylic_acid':   ['salicylic acid'],
    'retinol':          ['retinol','retinyl palmitate','encapsulated retinol','retinaldehyde'],
    'ascorbic_acid':    ['ascorbic acid','l-ascorbic acid','3-o-ethyl ascorbic acid','sodium ascorbyl phosphate'],
    'aha':              ['glycolic acid','lactic acid','mandelic acid','citric acid','tartaric acid'],
    'huile_essentielle':['lavandula','mentha','eucalyptus','rosmarinus','tea tree','melaleuca'],
}

def text_contains(text, keywords):
    t = text.lower()
    return any(kw.lower() in t for kw in keywords)

def infer_skin_types(p):
    combined = ' '.join([
        p.get('pq',''), p.get('usage',''), p.get('ben',''),
        ' '.join(p.get('ak',[])), p.get('texture','')
    ]).lower()

    # Règle 1: si "tous types de peau" → tous
    if 'tous types' in combined or 'all skin' in combined:
        return ['seche','grasse','mixte','normale','sensible']

    types = []
    for skin, kws in SKIN_KEYWORDS.items():
        if text_contains(combined, kws):
            types.append(skin)

    # Règle 2: si SPF → tous types (usage universel)
    if p.get('moment') == 'AM' and 'spf' in combined.lower():
        types = ['seche','grasse','mixte','normale','sensible']

    # Règle 3: nettoyant générique → tous
    if not types and 'nettoyant' in combined and 'doux' in combined:
        types = ['seche','grasse','mixte','normale','sensible']

    return types if types else ['normale']

def infer_concerns(p):
    combined = ' '.join([
        p.get('usage',''), p.get('ben',''), p.get('ben_en',''),
        ' '.join(p.get('ak',[])), ' '.join(p.get('comp',[])),
        p.get('pq',''), p.get('nom','')
    ]).lower()

    concerns = []
    for concern, kws in CONCERN_KEYWORDS.items():
        if text_contains(combined, kws):
            concerns.append(concern)

    # Tout produit hydratant → déshydratation
    if 'hydrat' in combined and 'deshydratation' not in concerns:
        concerns.append('deshydratation')

    return concerns if concerns else ['deshydratation']

def infer_age_groups(p):
    combined = ' '.join([
        p.get('usage',''), p.get('pq',''), p.get('ben',''),
        ' '.join(p.get('ak',[])), p.get('nom','')
    ]).lower()

    prix = p.get('prix_num', 0)

    groups = []
    for age, kws in AGE_KEYWORDS.items():
        if text_contains(combined, kws):
            groups.append(age)

    # Inférence par prix (heuristique)
    if not groups:
        if prix < 20:
            groups = ['18-25', '26-35']
        elif prix < 60:
            groups = ['26-35', '36-45']
        else:
            groups = ['36-45', '46+']

    # Correction: si anti-âge intense → pas recommandé 18-25
    if 'rides profondes' in combined or 'mature' in combined:
        groups = [g for g in groups if g != '18-25']

    return groups if groups else ['26-35', '36-45']

def infer_budget_tier(p):
    prix = p.get('prix_num', 0)
    if prix <= 20:   return 'low'
    elif prix <= 60: return 'mid'
    else:            return 'high'

def infer_allergenes(p):
    comp_lower = ' '.join(p.get('comp', [])).lower()
    found = []
    for allergen, inci_list in ALLERGEN_INCI.items():
        for inci in inci_list:
            if inci.lower() in comp_lower:
                found.append(allergen)
                break
    return found

def infer_step_type(p):
    """Détermine l'étape de la routine."""
    combined = (p.get('usage','') + ' ' + p.get('nom','') + ' ' + p.get('texture','')).lower()
    if any(k in combined for k in ['nettoyant','moussant','micellaire','démaquillant','lait nettoyant','gel nettoyant','mousse nettoyant']):
        return 'nettoyant'
    if any(k in combined for k in ['spf','solaire','protection solaire','uv']):
        return 'protection_solaire'
    if any(k in combined for k in ['contour des yeux','eye sérum','eye therapy','patch yeux','yeux']):
        return 'serum_yeux'
    if any(k in combined for k in ['sérum','serum','elixir','élixir','booster']):
        return 'serum'
    if any(k in combined for k in ['masque','mask']):
        return 'masque'
    if any(k in combined for k in ['lotion','tonique','toner','eau thermale']):
        return 'tonique'
    if any(k in combined for k in ['crème','creme','gel-crème','émulsion','baume','lait hydratant','fluide hydratant']):
        return 'hydratant'
    if any(k in combined for k in ['huile','oil']):
        return 'serum'
    return 'hydratant'

# ── Enrichissement ────────────────────────────────────────────────────────────

print(f"🔧 Enrichissement de {len(products)} produits...\n")

enriched = 0
for pid, p in products.items():
    changed = False

    # skinTypes
    if 'skinTypes' not in p or not p['skinTypes']:
        p['skinTypes'] = infer_skin_types(p)
        changed = True

    # concerns
    if 'concerns' not in p or not p['concerns']:
        p['concerns'] = infer_concerns(p)
        changed = True

    # ageGroups
    if 'ageGroups' not in p or not p['ageGroups']:
        p['ageGroups'] = infer_age_groups(p)
        changed = True

    # budgetTier
    if 'budgetTier' not in p:
        p['budgetTier'] = infer_budget_tier(p)
        changed = True

    # allergenes
    if 'allergenes' not in p:
        p['allergenes'] = infer_allergenes(p)
        changed = True

    # stepType (étape dans la routine)
    if 'stepType' not in p:
        p['stepType'] = infer_step_type(p)
        changed = True

    if changed:
        enriched += 1

# ── Écriture ──────────────────────────────────────────────────────────────────
with open(path, 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

# ── Stats ─────────────────────────────────────────────────────────────────────
print(f"✅ {enriched} produits enrichis\n")

budget_dist = {'low':0,'mid':0,'high':0}
step_dist   = {}
for p in products.values():
    t = p.get('budgetTier','?')
    budget_dist[t] = budget_dist.get(t,0) + 1
    st = p.get('stepType','?')
    step_dist[st] = step_dist.get(st,0) + 1

print("📊 Répartition budget:")
for tier, n in budget_dist.items():
    print(f"   {tier}: {n} produits")

print("\n📊 Répartition étapes:")
for step, n in sorted(step_dist.items(), key=lambda x: -x[1]):
    print(f"   {step}: {n} produits")

print("\n📊 Échantillon produit enrichi (cs-power):")
cs = products.get('cs-power',{})
print(f"   skinTypes:  {cs.get('skinTypes')}")
print(f"   concerns:   {cs.get('concerns')}")
print(f"   ageGroups:  {cs.get('ageGroups')}")
print(f"   budgetTier: {cs.get('budgetTier')}")
print(f"   stepType:   {cs.get('stepType')}")
print(f"   allergenes: {cs.get('allergenes')}")
