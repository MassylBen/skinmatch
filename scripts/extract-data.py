#!/usr/bin/env python3
"""
Extraction des données depuis index.html → fichiers JSON
"""
import re, json, os

BASE = os.path.join(os.path.dirname(__file__), '..')
html = open(os.path.join(BASE, 'index.html'), encoding='utf-8').read()

def extract_js_object(src, marker):
    """Extrait un objet JS { ... } après un marqueur."""
    idx = src.find(marker)
    if idx == -1:
        return None
    start = src.index('{', idx)
    depth, i = 0, start
    while i < len(src):
        if src[i] == '{':
            depth += 1
        elif src[i] == '}':
            depth -= 1
            if depth == 0:
                return src[start:i+1]
        i += 1
    return None

def js_to_json(js_src):
    """Convertit du JS objet littéral en JSON parseable."""
    # Supprime commentaires // sur une ligne
    js_src = re.sub(r'//[^\n]*', '', js_src)
    # Supprime commentaires /* */
    js_src = re.sub(r'/\*.*?\*/', '', js_src, flags=re.DOTALL)
    # Trailing commas avant } ou ]
    js_src = re.sub(r',(\s*[}\]])', r'\1', js_src)
    # Clés sans guillemets → avec guillemets
    js_src = re.sub(r'([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$+-]*)(\s*:)', r'\1"\2"\3', js_src)
    # Guillemets simples → doubles (simple heuristique)
    # Gère les chaînes simples sans apostrophe interne
    def fix_quotes(m):
        inner = m.group(1)
        inner = inner.replace('"', '\\"')
        return '"' + inner + '"'
    js_src = re.sub(r"'([^'\\]*(?:\\.[^'\\]*)*)'", fix_quotes, js_src)
    return js_src

# ── 1. PRODUITS (DB) ──────────────────────────────────────────────────────────
print("📦 Extraction DB produits...")
db_raw = extract_js_object(html, 'const DB = {')
imgs_raw = extract_js_object(html, 'const IMGS = {')
route_raw = extract_js_object(html, 'const ROUTE = {')

products = {}
imgs_map = {}
route_map = {}

if db_raw and imgs_raw:
    try:
        db_json = js_to_json(db_raw)
        imgs_json = js_to_json(imgs_raw)
        DB = json.loads(db_json)
        IMGS = json.loads(imgs_json)
        imgs_map = IMGS

        for key, prod in DB.items():
            # Nettoyer les doublons de clé "video" (bug dans le source)
            prix_str = prod.get('prix', '0').replace('€','').replace('~','').strip()
            try:
                prix_num = float(prix_str)
            except:
                prix_num = 0

            products[key] = {
                "id": key,
                "nom": prod.get("nom", ""),
                "marque": prod.get("marque", ""),
                "prix": prod.get("prix", ""),
                "prix_num": prix_num,
                "prix_structured": {"fr": prix_num, "gb": None, "us": None},
                "link": prod.get("link", ""),
                "link_structured": {"fr": prod.get("link", ""), "gb": None, "us": None},
                "yuka": prod.get("yuka", 0),
                "yl": prod.get("yl", ""),
                "usage": prod.get("usage", ""),
                "texture": prod.get("texture", ""),
                "ak": prod.get("ak", []),
                "comp": prod.get("comp", []),
                "clean": prod.get("clean", False),
                "vegan": prod.get("vegan", False),
                "pq": prod.get("pq", ""),
                "ben": prod.get("ben", ""),
                "ben_en": prod.get("ben_en", ""),
                "app": prod.get("app", ""),
                "moment": prod.get("moment", "AM+PM"),
                "img": IMGS.get(key, None),
                "deprecated": False
            }
        print(f"  ✅ {len(products)} produits extraits")
    except Exception as e:
        print(f"  ❌ Erreur parsing DB: {e}")
        # Fallback: écrire le source brut pour debug
        with open(os.path.join(BASE, 'src/data/db_raw_debug.js'), 'w') as f:
            f.write(db_raw)
        print("  → db_raw_debug.js écrit pour inspection")

# ── 2. ROUTE ──────────────────────────────────────────────────────────────────
print("📦 Extraction table de routage...")
if route_raw:
    try:
        route_json = js_to_json(route_raw)
        route_map = json.loads(route_json)
        print(f"  ✅ Table de routage extraite")
    except Exception as e:
        print(f"  ❌ Erreur parsing ROUTE: {e}")
        route_map = {}

# ── 3. ÉCRITURE DES FICHIERS ──────────────────────────────────────────────────
data_dir = os.path.join(BASE, 'src', 'data')
os.makedirs(data_dir, exist_ok=True)

# products.json
with open(os.path.join(data_dir, 'products.json'), 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)
print(f"\n✅ src/data/products.json ({len(products)} produits)")

# routes.json
with open(os.path.join(data_dir, 'routes.json'), 'w', encoding='utf-8') as f:
    json.dump(route_map, f, ensure_ascii=False, indent=2)
print("✅ src/data/routes.json")

# ── 4. TRADUCTIONS ────────────────────────────────────────────────────────────
print("📦 Création translations.json...")
translations = {
  "fr": {
    "ui": {
      "welcome_title": "Votre routine.<br>Sur mesure.",
      "welcome_desc": "Diagnostic de peau personnalisé selon votre profil, votre âge et votre budget.",
      "btn_register": "Créer un compte",
      "btn_login": "Se connecter",
      "btn_guest": "Continuer sans compte",
      "btn_start": "Commencer mon diagnostic",
      "btn_scan": "Scanner ma peau avec l'IA",
      "btn_continue": "Continuer",
      "btn_generate": "Générer ma routine",
      "btn_restart": "Recommencer",
      "legal": "En continuant, vous acceptez nos conditions d'utilisation.",
      "result_eyebrow": "Votre routine personnalisée",
      "share_btn": "Partager ma routine",
      "order_title": "Ordre d'application",
      "tab_am": "☀️ Matin",
      "tab_pm": "🌙 Soir",
      "products_title": "Les produits sélectionnés",
      "conseil_label": "💡 Conseil expert",
      "allergy_title": "Allergies enregistrées",
      "allergy_text": "Vérifiez la composition. Allergènes :",
      "suivi_title": "Suivi à 4 semaines",
      "suivi_text": "Votre peau évolue. Revenez dans 4 semaines pour ajuster votre routine.",
      "suivi_btn": "Refaire le diagnostic",
      "fiche_btn": "En savoir plus",
      "note_yuka": "🥕 Note Yuka",
      "budget_total": "Budget estimé :",
      "buy_note": "Certifiée pharmacie française · Livraison offerte dès 49€",
      "share_footer": "Généré par SkinMatch · Your Skin, Your Routine",
      "why_prefix": "Sélectionné pour votre peau",
      "why_against": "efficace contre",
      "intro_tpl": "Votre routine sur-mesure pour une peau {skin}{age}. Chaque produit sélectionné selon vos problématiques et votre budget."
    },
    "skin_types": {
      "seche":   { "label": "Sèche",    "sub": "Tiraillements, manque d'hydratation" },
      "grasse":  { "label": "Grasse",   "sub": "Brillance, pores dilatés" },
      "mixte":   { "label": "Mixte",    "sub": "Zone T grasse, joues normales" },
      "normale": { "label": "Normale",  "sub": "Équilibrée, peu de soucis" },
      "sensible":{ "label": "Sensible", "sub": "Réactive, rougeurs fréquentes" }
    },
    "skin_labels": { "seche": "sèche", "grasse": "grasse", "mixte": "mixte", "normale": "normale", "sensible": "sensible" },
    "intro_skin": { "seche": "sèche", "grasse": "grasse", "mixte": "mixte", "normale": "normale", "sensible": "sensible" },
    "ages": [
      { "id": "18-25", "label": "18 – 25 ans", "sub": "Prévention & éclat" },
      { "id": "26-35", "label": "26 – 35 ans", "sub": "Maintien & correction" },
      { "id": "36-45", "label": "36 – 45 ans", "sub": "Anti-âge précoce" },
      { "id": "46+",   "label": "46 ans et +", "sub": "Correction intense" }
    ],
    "concerns": [
      { "id": "acne",          "label": "Acné / Boutons" },
      { "id": "taches",        "label": "Taches & hyperpigmentation" },
      { "id": "rides",         "label": "Rides & anti-âge" },
      { "id": "pores",         "label": "Pores dilatés" },
      { "id": "rougeurs",      "label": "Rougeurs / Couperose" },
      { "id": "cernes",        "label": "Cernes & poches" },
      { "id": "eclat",         "label": "Teint terne / Éclat" },
      { "id": "deshydratation","label": "Déshydratation" },
      { "id": "imperfections", "label": "Points noirs" },
      { "id": "sensibilite",   "label": "Réactivité / Irritations" }
    ],
    "concern_labels": {
      "acne": "l'acné", "taches": "les taches", "rides": "les rides",
      "pores": "les pores dilatés", "rougeurs": "les rougeurs", "cernes": "les cernes",
      "eclat": "le manque d'éclat", "deshydratation": "la déshydratation",
      "imperfections": "les points noirs", "sensibilite": "la réactivité"
    },
    "budgets": [
      { "id": "low",  "label": "Économique", "sub": "< 15€ / produit",      "phrase": "Les meilleures formules ne coûtent pas forcément cher 💛" },
      { "id": "mid",  "label": "Modéré",     "sub": "15€ – 50€ / produit",  "phrase": "Le bon équilibre entre efficacité et budget" },
      { "id": "high", "label": "Premium",    "sub": "> 50€ / produit",       "phrase": "La haute cosmétique au service de votre peau" },
      { "id": "mix",  "label": "Flexible",   "sub": "Pas de limite",         "phrase": "On mixe le meilleur pour vous." }
    ],
    "routines": [
      { "id": "simple",     "label": "Essentielle", "sub": "3 étapes, 5 minutes par jour" },
      { "id": "complete",   "label": "Complète",    "sub": "Matin + soir, résultats optimaux" },
      { "id": "specifique", "label": "Ciblée",      "sub": "Un seul soin pour un problème précis" }
    ],
    "allergies": [
      "Parfums / Fragrances", "Parabènes", "Alcool", "Sulfates (SLS/SLES)",
      "Silicones", "Huiles essentielles", "Acide salicylique", "Rétinol",
      "Vitamine C", "Acides (AHA/BHA)", "Aucune allergie connue"
    ],
    "conseils": {
      "acne":          "Évitez de toucher votre visage. Changez votre taie d'oreiller chaque semaine. Introduisez les actifs progressivement.",
      "taches":        "Le SPF le matin est indispensable — sans lui, les taches s'aggravent au soleil.",
      "rides":         "Le rétinol se commence 2×/semaine le soir, on augmente progressivement. Toujours associé à un SPF.",
      "eclat":         "Hydratation interne et sommeil sont aussi importants que votre routine. 1,5L d'eau par jour minimum.",
      "deshydratation":"Appliquez le sérum sur peau légèrement humide pour maximiser l'absorption de l'acide hyaluronique.",
      "rougeurs":      "Évitez l'eau trop chaude. Bannissez les produits avec alcool, parfum ou menthol.",
      "pores":         "La régularité du BHA et du niacinamide réduit visiblement les pores en 4 semaines.",
      "imperfections": "N'exprimez jamais les points noirs à la main, utilisez un exfoliant BHA 2-3 fois par semaine.",
      "sensibilite":   "Introduisez un seul produit à la fois, attendez 2 semaines avant d'en ajouter un autre.",
      "cernes":        "Appliquez par tapotements doux, jamais en frottant. La tête légèrement surélevée la nuit aide."
    }
  },
  "en": {
    "ui": {
      "welcome_title": "Your routine.<br>Tailored for you.",
      "welcome_desc": "Personalized skin diagnosis and recommendations based on your profile, age and budget.",
      "btn_register": "Create an account",
      "btn_login": "Sign in",
      "btn_guest": "Continue without account",
      "btn_start": "Start my diagnosis",
      "btn_scan": "Scan my skin with AI",
      "btn_continue": "Continue",
      "btn_generate": "Generate my routine",
      "btn_restart": "Restart",
      "legal": "By continuing, you agree to our terms of use.",
      "result_eyebrow": "Your personalized routine",
      "share_btn": "Share my routine",
      "order_title": "Application order",
      "tab_am": "☀️ Morning",
      "tab_pm": "🌙 Evening",
      "products_title": "Selected products",
      "conseil_label": "💡 Expert tip",
      "allergy_title": "Registered allergies",
      "allergy_text": "Check the ingredients. Declared allergens:",
      "suivi_title": "4-week follow-up",
      "suivi_text": "Your skin evolves. Come back in 4 weeks to adjust your routine.",
      "suivi_btn": "Redo the diagnosis",
      "fiche_btn": "Learn more",
      "note_yuka": "🥕 Yuka score",
      "budget_total": "Estimated budget:",
      "buy_note": "French certified pharmacy · Free delivery from €49",
      "share_footer": "Generated by SkinMatch · Your Skin, Your Routine",
      "why_prefix": "Selected for your",
      "why_against": "effective against",
      "intro_tpl": "Your tailored routine for {skin} skin{age}. Each product selected based on your concerns and budget."
    },
    "skin_types": {
      "seche":   { "label": "Dry",         "sub": "Tightness, lack of hydration" },
      "grasse":  { "label": "Oily",        "sub": "Shine, enlarged pores" },
      "mixte":   { "label": "Combination", "sub": "Oily T-zone, normal cheeks" },
      "normale": { "label": "Normal",      "sub": "Balanced, few concerns" },
      "sensible":{ "label": "Sensitive",   "sub": "Reactive, frequent redness" }
    },
    "skin_labels": { "seche": "dry", "grasse": "oily", "mixte": "combination", "normale": "normal", "sensible": "sensitive" },
    "intro_skin": { "seche": "dry", "grasse": "oily", "mixte": "combination", "normale": "normal", "sensible": "sensitive" },
    "ages": [
      { "id": "18-25", "label": "18 – 25", "sub": "Prevention & radiance" },
      { "id": "26-35", "label": "26 – 35", "sub": "Maintenance & correction" },
      { "id": "36-45", "label": "36 – 45", "sub": "Early anti-aging" },
      { "id": "46+",   "label": "46+",     "sub": "Intensive correction" }
    ],
    "concerns": [
      { "id": "acne",          "label": "Acne / Blemishes" },
      { "id": "taches",        "label": "Dark spots & hyperpigmentation" },
      { "id": "rides",         "label": "Wrinkles & anti-aging" },
      { "id": "pores",         "label": "Enlarged pores" },
      { "id": "rougeurs",      "label": "Redness / Rosacea" },
      { "id": "cernes",        "label": "Dark circles & puffiness" },
      { "id": "eclat",         "label": "Dull complexion / Radiance" },
      { "id": "deshydratation","label": "Dehydration" },
      { "id": "imperfections", "label": "Blackheads" },
      { "id": "sensibilite",   "label": "Sensitivity / Irritations" }
    ],
    "concern_labels": {
      "acne": "acne", "taches": "dark spots", "rides": "wrinkles",
      "pores": "enlarged pores", "rougeurs": "redness", "cernes": "dark circles",
      "eclat": "dull complexion", "deshydratation": "dehydration",
      "imperfections": "blackheads", "sensibilite": "sensitivity"
    },
    "budgets": [
      { "id": "low",  "label": "Budget-friendly", "sub": "< €15 / product",    "phrase": "Great skincare doesn't have to break the bank 💛" },
      { "id": "mid",  "label": "Mid-range",       "sub": "€15 – €50 / product", "phrase": "The sweet spot between results and value" },
      { "id": "high", "label": "Premium",         "sub": "> €50 / product",     "phrase": "High-end formulas for exceptional skin" },
      { "id": "mix",  "label": "Flexible",        "sub": "No limit",            "phrase": "We mix the best options just for you" }
    ],
    "routines": [
      { "id": "simple",     "label": "Essential",  "sub": "3 steps, 5 minutes a day" },
      { "id": "complete",   "label": "Complete",   "sub": "Morning + evening, optimal results" },
      { "id": "specifique", "label": "Targeted",   "sub": "One treatment for one specific concern" }
    ],
    "allergies": [
      "Fragrances / Perfumes", "Parabens", "Alcohol", "Sulfates (SLS/SLES)",
      "Silicones", "Essential oils", "Salicylic acid", "Retinol",
      "Vitamin C", "Acids (AHA/BHA)", "No known allergies"
    ],
    "conseils": {
      "acne":          "Avoid touching your face. Change your pillowcase weekly. Introduce active ingredients gradually.",
      "taches":        "Morning SPF is essential — without it, dark spots worsen in the sun.",
      "rides":         "Start retinol 2x/week in the evening, gradually increase. Always pair with morning SPF.",
      "eclat":         "Internal hydration and sleep are as important as your routine. Drink 1.5L of water daily.",
      "deshydratation":"Apply serum on slightly damp skin to maximize hyaluronic acid absorption.",
      "rougeurs":      "Avoid hot water. Ban products with alcohol, fragrance, or menthol.",
      "pores":         "Regular BHA and niacinamide visibly reduce pores in 4 weeks.",
      "imperfections": "Never squeeze blackheads by hand, use a BHA exfoliant 2-3 times a week.",
      "sensibilite":   "Introduce one product at a time, wait 2 weeks before adding another.",
      "cernes":        "Apply with gentle tapping, never rubbing. Sleeping with head slightly elevated helps."
    }
  }
}

with open(os.path.join(data_dir, 'translations.json'), 'w', encoding='utf-8') as f:
    json.dump(translations, f, ensure_ascii=False, indent=2)
print("✅ src/data/translations.json")

print("\n✅ Extraction terminée !")
