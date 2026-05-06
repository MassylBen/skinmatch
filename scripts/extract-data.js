#!/usr/bin/env node
/**
 * Script d'extraction des données depuis index.html
 * Extrait DB (produits), IMGS, ROUTE, T (traductions) → fichiers JSON
 */

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Utilitaire: extraire un bloc JS entre deux marqueurs
function extractBlock(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  if (start === -1) return null;
  let depth = 0;
  let i = source.indexOf('{', start);
  const begin = i;
  while (i < source.length) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(begin, i + 1);
    }
    i++;
  }
  return null;
}

// Évaluation sécurisée d'un objet JS (pas de require, pas d'exec)
function safeEval(src) {
  // Nettoyer les commentaires JS
  src = src.replace(/\/\/[^\n]*/g, '');
  // Remplacer les clés sans guillemets → avec guillemets (JSON valide)
  // Simple heuristique pour les clés d'objet
  try {
    return Function('"use strict"; return (' + src + ')')();
  } catch (e) {
    return null;
  }
}

console.log('📦 Extraction des données depuis index.html...\n');

// ─── 1. PRODUITS (DB + IMGS) ────────────────────────────────────────────────
const dbSrc = extractBlock(html, 'const DB = {', null);
const imgsSrc = extractBlock(html, 'const IMGS = {', null);
const routeSrc = extractBlock(html, 'const ROUTE = {', null);

const DB = safeEval(dbSrc);
const IMGS = safeEval(imgsSrc);
const ROUTE = safeEval(routeSrc);

if (DB && IMGS) {
  // Fusionner DB + IMGS en un seul catalogue enrichi
  const products = {};
  for (const [key, prod] of Object.entries(DB)) {
    products[key] = {
      id: key,
      ...prod,
      img: IMGS[key] || null,
      // Structure multi-devises (à enrichir)
      prix_structured: {
        fr: parseFloat((prod.prix || '0').replace('€', '').replace('~', '')) || 0,
        gb: null,
        us: null
      },
      // Structure multi-liens (à enrichir)
      link_structured: {
        fr: prod.link || null,
        gb: null,
        us: null
      }
    };
  }
  const outPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
  fs.writeFileSync(outPath, JSON.stringify(products, null, 2));
  console.log(`✅ ${Object.keys(products).length} produits → src/data/products.json`);
} else {
  console.error('❌ Impossible d\'extraire DB ou IMGS');
}

// ─── 2. TABLE DE ROUTAGE ────────────────────────────────────────────────────
if (ROUTE) {
  const outPath = path.join(__dirname, '..', 'src', 'data', 'routes.json');
  fs.writeFileSync(outPath, JSON.stringify(ROUTE, null, 2));
  console.log('✅ Table de routage → src/data/routes.json');
} else {
  console.error('❌ Impossible d\'extraire ROUTE');
}

// ─── 3. TRADUCTIONS ─────────────────────────────────────────────────────────
// Extraction manuelle car T est trop complexe pour safeEval
// On crée un squelette propre à partir des clés connues
const translations = {
  fr: {
    welcome_title: "Votre routine.<br>Sur mesure.",
    welcome_desc: "Diagnostic de peau personnalisé selon votre profil, votre âge et votre budget.",
    btn_register: "Créer un compte",
    btn_login: "Se connecter",
    btn_guest: "Continuer sans compte",
    btn_start: "Commencer mon diagnostic",
    btn_scan: "Scanner ma peau avec l'IA",
    btn_continue: "Continuer",
    btn_generate: "Générer ma routine",
    btn_restart: "Recommencer",
    legal: "En continuant, vous acceptez nos conditions d'utilisation.",
    q1_title: "Type de peau",
    q1_sub: "Choisissez celui qui vous correspond le mieux.",
    q2_title: "Votre tranche d'âge",
    q2_sub: "Les besoins de votre peau évoluent avec l'âge.",
    q3_title: "Vos problèmes de peau",
    q3_sub: "Sélectionnez tout ce qui vous concerne.",
    q3_allergies: "Allergies / Ingrédients à éviter",
    q4_title: "Votre budget",
    q4_sub: "Par produit, en moyenne.",
    q5_title: "Type de routine",
    q5_sub: "Selon le temps que vous souhaitez y consacrer.",
    result_eyebrow: "Votre routine personnalisée",
    share_btn: "Partager ma routine",
    order_title: "Ordre d'application",
    tab_am: "☀️ Matin",
    tab_pm: "🌙 Soir",
    products_title: "Les produits sélectionnés",
    conseil_label: "💡 Conseil expert",
    allergy_title: "Allergies enregistrées",
    allergy_text: "Vérifiez la composition. Allergènes :",
    suivi_title: "Suivi à 4 semaines",
    suivi_text: "Votre peau évolue. Revenez dans 4 semaines pour ajuster votre routine.",
    suivi_btn: "Refaire le diagnostic",
    fiche_btn: "En savoir plus",
    note_yuka: "🥕 Note Yuka",
    budget_total: "Budget estimé :",
    buy_note: "Certifiée pharmacie française · Livraison offerte dès 49€",
    share_footer: "Généré par SkinMatch · Your Skin, Your Routine",
    skin_types: {
      seche: { label: "Sèche", sub: "Tiraillements, manque d'hydratation" },
      grasse: { label: "Grasse", sub: "Brillance, pores dilatés" },
      mixte: { label: "Mixte", sub: "Zone T grasse, joues normales" },
      normale: { label: "Normale", sub: "Équilibrée, peu de soucis" },
      sensible: { label: "Sensible", sub: "Réactive, rougeurs fréquentes" }
    },
    skin_labels: { seche: "sèche", grasse: "grasse", mixte: "mixte", normale: "normale", sensible: "sensible" },
    ages: [
      { id: "18-25", label: "18 – 25 ans", sub: "Prévention & éclat" },
      { id: "26-35", label: "26 – 35 ans", sub: "Maintien & correction" },
      { id: "36-45", label: "36 – 45 ans", sub: "Anti-âge précoce" },
      { id: "46+", label: "46 ans et +", sub: "Correction intense" }
    ],
    concerns: [
      { id: "acne", label: "Acné / Boutons" },
      { id: "taches", label: "Taches & hyperpigmentation" },
      { id: "rides", label: "Rides & anti-âge" },
      { id: "pores", label: "Pores dilatés" },
      { id: "rougeurs", label: "Rougeurs / Couperose" },
      { id: "cernes", label: "Cernes & poches" },
      { id: "eclat", label: "Teint terne / Éclat" },
      { id: "deshydratation", label: "Déshydratation" },
      { id: "imperfections", label: "Points noirs" },
      { id: "sensibilite", label: "Réactivité / Irritations" }
    ],
    concern_labels: {
      acne: "l'acné", taches: "les taches", rides: "les rides",
      pores: "les pores dilatés", rougeurs: "les rougeurs", cernes: "les cernes",
      eclat: "le manque d'éclat", deshydratation: "la déshydratation",
      imperfections: "les points noirs", sensibilite: "la réactivité"
    },
    budgets: [
      { id: "low", label: "Économique", sub: "< 15€ / produit", phrase: "Les meilleures formules ne coûtent pas forcément cher 💛" },
      { id: "mid", label: "Modéré", sub: "15€ – 50€ / produit", phrase: "Le bon équilibre entre efficacité et budget" },
      { id: "high", label: "Premium", sub: "> 50€ / produit", phrase: "La haute cosmétique au service de votre peau" },
      { id: "mix", label: "Flexible", sub: "Pas de limite", phrase: "On mixe le meilleur pour vous." }
    ],
    routines: [
      { id: "simple", label: "Essentielle", sub: "3 étapes, 5 minutes par jour" },
      { id: "complete", label: "Complète", sub: "Matin + soir, résultats optimaux" },
      { id: "specifique", label: "Ciblée", sub: "Un seul soin pour un problème précis" }
    ],
    allergies: [
      "Parfums / Fragrances", "Parabènes", "Alcool", "Sulfates (SLS/SLES)",
      "Silicones", "Huiles essentielles", "Acide salicylique", "Rétinol",
      "Vitamine C", "Acides (AHA/BHA)", "Aucune allergie connue"
    ],
    conseils: {
      acne: "Évitez de toucher votre visage. Changez votre taie d'oreiller chaque semaine. Introduisez les actifs progressivement.",
      taches: "Le SPF le matin est indispensable — sans lui, les taches s'aggravent au soleil.",
      rides: "Le rétinol se commence 2×/semaine le soir, on augmente progressivement. Toujours associé à un SPF.",
      eclat: "Hydratation interne et sommeil sont aussi importants que votre routine. 1,5L d'eau par jour minimum.",
      deshydratation: "Appliquez le sérum sur peau légèrement humide pour maximiser l'absorption de l'acide hyaluronique.",
      rougeurs: "Évitez l'eau trop chaude. Bannissez les produits avec alcool, parfum ou menthol.",
      pores: "La régularité du BHA et du niacinamide réduit visiblement les pores en 4 semaines.",
      imperfections: "N'exprimez jamais les points noirs à la main, utilisez un exfoliant BHA 2-3 fois par semaine.",
      sensibilite: "Introduisez un seul produit à la fois, attendez 2 semaines avant d'en ajouter un autre.",
      cernes: "Appliquez par tapotements doux, jamais en frottant. La tête légèrement surélevée la nuit aide."
    },
    intro_skin: { seche: "sèche", grasse: "grasse", mixte: "mixte", normale: "normale", sensible: "sensible" },
    intro_tpl: "Votre routine sur-mesure pour une peau {skin}{age}. Chaque produit sélectionné selon vos problématiques et votre budget.",
    why_prefix: "Sélectionné pour votre peau",
    why_against: "efficace contre"
  },
  en: {
    welcome_title: "Your routine.<br>Tailored for you.",
    welcome_desc: "Personalized skin diagnosis and recommendations based on your profile, age and budget.",
    btn_register: "Create an account",
    btn_login: "Sign in",
    btn_guest: "Continue without account",
    btn_start: "Start my diagnosis",
    btn_scan: "Scan my skin with AI",
    btn_continue: "Continue",
    btn_generate: "Generate my routine",
    btn_restart: "Restart",
    legal: "By continuing, you agree to our terms of use.",
    q1_title: "Skin type",
    q1_sub: "Choose the one that best describes your skin.",
    q2_title: "Your age group",
    q2_sub: "Your skin needs change as you age.",
    q3_title: "Your skin concerns",
    q3_sub: "Select everything that applies to you.",
    q3_allergies: "Allergies / Ingredients to avoid",
    q4_title: "Your budget",
    q4_sub: "Per product, on average.",
    q5_title: "Routine type",
    q5_sub: "Based on the time you want to dedicate.",
    result_eyebrow: "Your personalized routine",
    share_btn: "Share my routine",
    order_title: "Application order",
    tab_am: "☀️ Morning",
    tab_pm: "🌙 Evening",
    products_title: "Selected products",
    conseil_label: "💡 Expert tip",
    allergy_title: "Registered allergies",
    allergy_text: "Check the ingredients. Declared allergens:",
    suivi_title: "4-week follow-up",
    suivi_text: "Your skin evolves. Come back in 4 weeks to adjust your routine.",
    suivi_btn: "Redo the diagnosis",
    fiche_btn: "Learn more",
    note_yuka: "🥕 Yuka score",
    budget_total: "Estimated budget:",
    buy_note: "French certified pharmacy · Free delivery from €49",
    share_footer: "Generated by SkinMatch · Your Skin, Your Routine",
    skin_types: {
      seche: { label: "Dry", sub: "Tightness, lack of hydration" },
      grasse: { label: "Oily", sub: "Shine, enlarged pores" },
      mixte: { label: "Combination", sub: "Oily T-zone, normal cheeks" },
      normale: { label: "Normal", sub: "Balanced, few concerns" },
      sensible: { label: "Sensitive", sub: "Reactive, frequent redness" }
    },
    skin_labels: { seche: "dry", grasse: "oily", mixte: "combination", normale: "normal", sensible: "sensitive" },
    ages: [
      { id: "18-25", label: "18 – 25", sub: "Prevention & radiance" },
      { id: "26-35", label: "26 – 35", sub: "Maintenance & correction" },
      { id: "36-45", label: "36 – 45", sub: "Early anti-aging" },
      { id: "46+", label: "46+", sub: "Intensive correction" }
    ],
    concerns: [
      { id: "acne", label: "Acne / Blemishes" },
      { id: "taches", label: "Dark spots & hyperpigmentation" },
      { id: "rides", label: "Wrinkles & anti-aging" },
      { id: "pores", label: "Enlarged pores" },
      { id: "rougeurs", label: "Redness / Rosacea" },
      { id: "cernes", label: "Dark circles & puffiness" },
      { id: "eclat", label: "Dull complexion / Radiance" },
      { id: "deshydratation", label: "Dehydration" },
      { id: "imperfections", label: "Blackheads" },
      { id: "sensibilite", label: "Sensitivity / Irritations" }
    ],
    concern_labels: {
      acne: "acne", taches: "dark spots", rides: "wrinkles",
      pores: "enlarged pores", rougeurs: "redness", cernes: "dark circles",
      eclat: "dull complexion", deshydratation: "dehydration",
      imperfections: "blackheads", sensibilite: "sensitivity"
    },
    budgets: [
      { id: "low", label: "Budget-friendly", sub: "< €15 / product", phrase: "Great skincare doesn't have to break the bank 💛" },
      { id: "mid", label: "Mid-range", sub: "€15 – €50 / product", phrase: "The sweet spot between results and value" },
      { id: "high", label: "Premium", sub: "> €50 / product", phrase: "High-end formulas for exceptional skin" },
      { id: "mix", label: "Flexible", sub: "No limit", phrase: "We mix the best options just for you" }
    ],
    routines: [
      { id: "simple", label: "Essential", sub: "3 steps, 5 minutes a day" },
      { id: "complete", label: "Complete", sub: "Morning + evening, optimal results" },
      { id: "specifique", label: "Targeted", sub: "One treatment for one specific concern" }
    ],
    allergies: [
      "Fragrances / Perfumes", "Parabens", "Alcohol", "Sulfates (SLS/SLES)",
      "Silicones", "Essential oils", "Salicylic acid", "Retinol",
      "Vitamin C", "Acids (AHA/BHA)", "No known allergies"
    ],
    conseils: {
      acne: "Avoid touching your face. Change your pillowcase weekly. Introduce active ingredients gradually.",
      taches: "Morning SPF is essential — without it, dark spots worsen in the sun.",
      rides: "Start retinol 2x/week in the evening, gradually increase. Always pair with morning SPF.",
      eclat: "Internal hydration and sleep are as important as your routine. Drink 1.5L of water daily.",
      deshydratation: "Apply serum on slightly damp skin to maximize hyaluronic acid absorption.",
      rougeurs: "Avoid hot water. Ban products with alcohol, fragrance, or menthol.",
      pores: "Regular BHA and niacinamide visibly reduce pores in 4 weeks.",
      imperfections: "Never squeeze blackheads by hand, use a BHA exfoliant 2-3 times a week.",
      sensibilite: "Introduce one product at a time, wait 2 weeks before adding another.",
      cernes: "Apply with gentle tapping, never rubbing. Sleeping with head slightly elevated helps."
    },
    intro_skin: { seche: "dry", grasse: "oily", mixte: "combination", normale: "normal", sensible: "sensitive" },
    intro_tpl: "Your tailored routine for {skin} skin{age}. Each product selected based on your concerns and budget.",
    why_prefix: "Selected for your",
    why_against: "effective against"
  }
};

const transPath = path.join(__dirname, '..', 'src', 'data', 'translations.json');
fs.writeFileSync(transPath, JSON.stringify(translations, null, 2));
console.log('✅ Traductions FR+EN → src/data/translations.json');

console.log('\n✅ Extraction terminée. Vérifiez src/data/\n');
