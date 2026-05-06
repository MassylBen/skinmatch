/**
 * SkinMatch — Moteur de recommandation
 * Agent Algorithm — src/js/algorithm.js
 *
 * Remplace la lookup table ROUTE par un moteur de scoring multidimensionnel.
 * Export: generateRoutine(profile) → { steps, intro, conseil, totalPrix }
 */

'use strict';

// ─── Constantes ───────────────────────────────────────────────────────────────

const STEP_ORDER = [
  'nettoyant',
  'tonique',
  'serum_yeux',
  'serum',
  'masque',
  'hydratant',
  'protection_solaire',
];

// Conflits ingrédients: ne jamais mettre ces paires au même moment AM ou PM
// Format: [motif_A, motif_B, raison]
const INGREDIENT_CONFLICTS = [
  ['retinol',        'ascorbic acid',   'irritation'],
  ['retinol',        'glycolic acid',   'irritation'],
  ['retinol',        'lactic acid',     'irritation'],
  ['retinol',        'salicylic acid',  'irritation'],
  ['retinol',        'benzoyl peroxide','irritation'],
  ['glycolic acid',  'salicylic acid',  'sur-exfoliation'],
  ['glycolic acid',  'retinol',         'irritation'],
  ['vitamin c',      'benzoyl peroxide','oxydation'],
  ['niacinamide',    'ascorbic acid',   'flush'],
];

// Rétinol uniquement le soir
const PM_ONLY_INGREDIENTS = ['retinol', 'retinaldehyde', 'encapsulated retinol'];

// Mapping allergies utilisateur → mots-clés INCI à bloquer
const ALLERGY_INCI_MAP = {
  'Parfums / Fragrances':  ['parfum', 'fragrance', 'linalool', 'limonene', 'citronellol'],
  'Fragrances / Perfumes': ['parfum', 'fragrance', 'linalool', 'limonene'],
  'Parabènes':             ['methylparaben', 'propylparaben', 'ethylparaben', 'butylparaben'],
  'Parabens':              ['methylparaben', 'propylparaben', 'ethylparaben'],
  'Alcool':                ['alcohol denat', 'ethanol', 'sd alcohol'],
  'Alcohol':               ['alcohol denat', 'ethanol', 'sd alcohol'],
  'Sulfates (SLS/SLES)':   ['sodium lauryl sulfate', 'sodium laureth sulfate', 'sls', 'sles'],
  'Silicones':             ['dimethicone', 'cyclopentasiloxane', 'cyclohexasiloxane', 'trimethicone'],
  'Huiles essentielles':   ['lavandula', 'mentha', 'eucalyptus', 'tea tree', 'melaleuca'],
  'Essential oils':        ['lavandula', 'mentha', 'eucalyptus', 'tea tree'],
  'Acide salicylique':     ['salicylic acid'],
  'Salicylic acid':        ['salicylic acid'],
  'Rétinol':               ['retinol', 'retinyl palmitate', 'encapsulated retinol', 'retinaldehyde'],
  'Retinol':               ['retinol', 'retinyl palmitate', 'encapsulated retinol'],
  'Vitamine C':            ['ascorbic acid', 'l-ascorbic acid', '3-o-ethyl ascorbic acid', 'sodium ascorbyl phosphate'],
  'Vitamin C':             ['ascorbic acid', 'l-ascorbic acid', '3-o-ethyl ascorbic acid'],
  'Acides (AHA/BHA)':      ['glycolic acid', 'lactic acid', 'salicylic acid', 'mandelic acid'],
  'Acids (AHA/BHA)':       ['glycolic acid', 'lactic acid', 'salicylic acid'],
  'Aucune allergie connue':[], 'No known allergies': [],
};

// Similarité entre types de peau (pour le scoring partiel)
const SKIN_PROXIMITY = {
  seche:    { seche:1,    grasse:0,   mixte:0.3,  normale:0.5, sensible:0.4 },
  grasse:   { seche:0,    grasse:1,   mixte:0.7,  normale:0.4, sensible:0.2 },
  mixte:    { seche:0.3,  grasse:0.7, mixte:1,    normale:0.5, sensible:0.3 },
  normale:  { seche:0.5,  grasse:0.4, mixte:0.5,  normale:1,   sensible:0.6 },
  sensible: { seche:0.4,  grasse:0.2, mixte:0.3,  normale:0.6, sensible:1   },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function compLower(product) {
  return (product.comp || []).join(' ').toLowerCase();
}

function akLower(product) {
  return (product.ak || []).join(' ').toLowerCase();
}

function usageLower(product) {
  return (product.usage || '').toLowerCase() + ' ' + (product.pq || '').toLowerCase();
}

function containsAny(text, keywords) {
  const t = text.toLowerCase();
  return keywords.some(k => t.includes(k.toLowerCase()));
}

/**
 * Vérifie si un produit contient un ingrédient allergène pour l'utilisateur
 */
function isAllergic(product, userAllergies) {
  if (!userAllergies || userAllergies.length === 0) return false;
  const comp = compLower(product);
  for (const allergy of userAllergies) {
    const inci = ALLERGY_INCI_MAP[allergy] || [];
    if (inci.some(i => comp.includes(i.toLowerCase()))) return true;
  }
  return false;
}

/**
 * Vérifie si un produit doit être réservé au soir (PM only)
 */
function isPmOnly(product) {
  const comp = compLower(product);
  return PM_ONLY_INGREDIENTS.some(i => comp.includes(i));
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

/**
 * Score un produit contre un profil utilisateur (0-100)
 * Retourne -999 si le produit est incompatible (allergie ou step hors périmètre)
 */
function scoreProduct(product, profile, targetStep) {
  // Allergie → exclusion absolue
  if (isAllergic(product, profile.allergies)) return -999;

  // Si le produit n'est pas du bon type d'étape → pas pertinent
  if (targetStep && product.stepType !== targetStep) {
    // Exception: pour "serum", accepter aussi "serum_yeux" si c'est une étape yeux
    if (!(targetStep === 'serum_yeux' && product.stepType === 'serum_yeux')) {
      if (product.stepType !== targetStep) return -999;
    }
  }

  let score = 0;

  // 1. Compatibilité type de peau (max 30 pts)
  const skinTypes = product.skinTypes || [];
  if (skinTypes.includes(profile.skinType)) {
    score += 30;
  } else {
    // Proximité partielle
    const proximity = SKIN_PROXIMITY[profile.skinType] || {};
    const maxProx = Math.max(...skinTypes.map(s => proximity[s] || 0));
    score += Math.round(maxProx * 20);
  }

  // 2. Efficacité sur les concerns (max 25 pts)
  const productConcerns = product.concerns || [];
  const userConcerns = profile.concerns || [];
  const matchingConcerns = userConcerns.filter(c => productConcerns.includes(c));
  score += Math.min(25, matchingConcerns.length * 10);

  // Bonus si concern principal (premier) directement adressé
  if (userConcerns.length > 0 && productConcerns.includes(userConcerns[0])) {
    score += 8;
  }

  // 3. Budget (max 20 pts)
  const effectiveBudget = profile.budget === 'mix' ? 'mid' : profile.budget;
  if (product.budgetTier === effectiveBudget) {
    score += 20;
  } else if (effectiveBudget === 'high') {
    score += 15; // high accepte tout
  } else if (effectiveBudget === 'mid' && product.budgetTier === 'low') {
    score += 10; // mid peut prendre low
  } else if (effectiveBudget === 'low' && product.budgetTier === 'mid') {
    score += 5;  // low peut déborder un peu
  }

  // 4. Compatibilité âge (max 15 pts)
  const ageGroups = product.ageGroups || [];
  if (ageGroups.includes(profile.ageGroup)) {
    score += 15;
  } else if (ageGroups.length > 0) {
    score += 4;
  }

  // 5. Qualité formule (max 10 pts)
  if (product.clean)    score += 4;
  if (product.vegan)    score += 3;
  if (product.yuka >= 80) score += 3;
  else if (product.yuka >= 60) score += 1;

  // Bonus rétinol le soir pour anti-âge 36+
  if (['36-45','46+'].includes(profile.ageGroup) &&
      profile.concerns.includes('rides') &&
      isPmOnly(product)) {
    score += 5;
  }

  // Malus: produit réservé PM si moment demandé AM
  // (sera géré dans l'assignation du moment, pas ici)

  return Math.min(100, Math.max(0, score));
}

// ─── Sélection des meilleurs produits par étape ───────────────────────────────

/**
 * Parmi tous les produits disponibles, retourne le meilleur pour une étape donnée
 * Exclut les produits déjà utilisés (usedIds)
 */
function pickBest(allProducts, profile, stepType, usedIds) {
  const candidates = Object.values(allProducts)
    .filter(p => !p.deprecated)
    .filter(p => p.stepType === stepType)
    .filter(p => !usedIds.has(p.id))
    .map(p => ({ product: p, score: scoreProduct(p, profile, stepType) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score);

  return candidates.length > 0 ? candidates[0].product : null;
}

// ─── Détection et résolution des conflits ingrédients ─────────────────────────

/**
 * Vérifie si deux produits ont un conflit d'ingrédients
 */
function hasConflict(productA, productB) {
  const compA = compLower(productA);
  const compB = compLower(productB);

  for (const [ingA, ingB] of INGREDIENT_CONFLICTS) {
    const aHasA = compA.includes(ingA);
    const aHasB = compA.includes(ingB);
    const bHasA = compB.includes(ingA);
    const bHasB = compB.includes(ingB);

    // Conflit si A contient ingA et B contient ingB, ou vice-versa
    if ((aHasA && bHasB) || (aHasB && bHasA)) return true;
    // Conflit si un seul produit contient les deux
    if ((aHasA && aHasB) || (bHasA && bHasB)) return true;
  }
  return false;
}

/**
 * Retourne les conflits dans une liste de produits par moment (AM ou PM)
 * Retourne les IDs des produits à retirer
 */
function findConflictsInMoment(products) {
  const toRemove = new Set();
  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      if (hasConflict(products[i], products[j])) {
        // Retirer le produit avec le score Yuka le plus bas
        if ((products[i].yuka || 0) < (products[j].yuka || 0)) {
          toRemove.add(products[i].id);
        } else {
          toRemove.add(products[j].id);
        }
      }
    }
  }
  return toRemove;
}

/**
 * Assigne le moment (AM / PM / AM+PM) à chaque produit de la routine
 * - SPF → toujours AM
 * - Rétinol → toujours PM
 * - Masque → PM
 * - Reste → AM+PM ou selon moment original du produit
 */
function assignMoments(steps) {
  return steps.map(step => {
    let moment = step.moment || 'AM+PM';

    // SPF toujours en AM
    if (step.stepType === 'protection_solaire') {
      moment = 'AM';
    }
    // Rétinol toujours PM
    else if (isPmOnly(step)) {
      moment = 'PM';
    }
    // Masque → PM
    else if (step.stepType === 'masque') {
      moment = 'PM';
    }

    return { ...step, moment };
  });
}

// ─── Assemblage de la routine ──────────────────────────────────────────────────

/**
 * Construit la liste d'étapes selon le type de routine
 */
function buildSteps(allProducts, profile) {
  const usedIds = new Set();
  const steps = [];

  function add(stepType, label) {
    const p = pickBest(allProducts, profile, stepType, usedIds);
    if (!p) return;
    usedIds.add(p.id);
    steps.push({ ...p, etape: label, scoreReason: buildScoreReason(p, profile) });
  }

  if (profile.routine === 'simple') {
    add('nettoyant',         'Nettoyant');
    add('hydratant',         'Hydratant');
    add('protection_solaire','Protection solaire');
  }

  else if (profile.routine === 'complete') {
    add('nettoyant',         'Nettoyant');

    // Sérums: jusqu'à 2 selon les concerns
    const primaryConcern   = profile.concerns[0] || 'deshydratation';
    const secondaryConcern = profile.concerns[1] || null;

    // Sérum principal (concern 1)
    const serum1 = pickBestForConcern(allProducts, profile, primaryConcern, usedIds);
    if (serum1) {
      usedIds.add(serum1.id);
      steps.push({ ...serum1, etape: 'Sérum', scoreReason: buildScoreReason(serum1, profile) });
    }

    // Sérum secondaire (concern 2) si différent
    if (secondaryConcern && secondaryConcern !== primaryConcern) {
      const serum2 = pickBestForConcern(allProducts, profile, secondaryConcern, usedIds);
      if (serum2) {
        usedIds.add(serum2.id);
        steps.push({ ...serum2, etape: 'Sérum ciblé', scoreReason: buildScoreReason(serum2, profile) });
      }
    }

    // Contour des yeux si concern cernes
    if (profile.concerns.includes('cernes')) {
      add('serum_yeux', 'Contour des yeux');
    }

    add('hydratant',         'Hydratant');
    add('protection_solaire','Protection solaire');
  }

  else if (profile.routine === 'specifique') {
    const primaryConcern = profile.concerns[0] || 'deshydratation';
    const targetStep = concernToStep(primaryConcern);
    const p = pickBest(allProducts, profile, targetStep, usedIds);
    if (p) {
      usedIds.add(p.id);
      steps.push({ ...p, etape: 'Soin ciblé', scoreReason: buildScoreReason(p, profile) });
    }
  }

  return steps;
}

/**
 * Choisit le meilleur produit pour un concern spécifique (parmi les sérums)
 */
function pickBestForConcern(allProducts, profile, concern, usedIds) {
  const targetStep = concernToStep(concern);

  const candidates = Object.values(allProducts)
    .filter(p => !p.deprecated)
    .filter(p => p.stepType === targetStep || p.stepType === 'serum')
    .filter(p => !usedIds.has(p.id))
    .filter(p => !isAllergic(p, profile.allergies))
    .filter(p => (p.concerns || []).includes(concern))
    .map(p => ({ product: p, score: scoreProduct(p, profile, targetStep) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score);

  return candidates.length > 0 ? candidates[0].product : pickBest(allProducts, profile, 'serum', usedIds);
}

/**
 * Détermine le type d'étape le plus pertinent pour un concern
 */
function concernToStep(concern) {
  const map = {
    cernes:          'serum_yeux',
    deshydratation:  'serum',
    rides:           'serum',
    taches:          'serum',
    acne:            'serum',
    eclat:           'serum',
    pores:           'serum',
    rougeurs:        'hydratant',
    sensibilite:     'hydratant',
    imperfections:   'serum',
  };
  return map[concern] || 'serum';
}

/**
 * Génère une explication humaine du choix du produit
 */
function buildScoreReason(product, profile) {
  const skinLabel = {
    seche:'sèche', grasse:'grasse', mixte:'mixte', normale:'normale', sensible:'sensible'
  }[profile.skinType] || profile.skinType;

  const matchedConcerns = (profile.concerns || [])
    .filter(c => (product.concerns || []).includes(c));

  let reason = `Sélectionné pour votre peau ${skinLabel}`;
  if (matchedConcerns.length > 0) {
    const labels = {
      acne:'l\'acné', taches:'les taches', rides:'les rides', pores:'les pores dilatés',
      rougeurs:'les rougeurs', cernes:'les cernes', eclat:'le manque d\'éclat',
      deshydratation:'la déshydratation', imperfections:'les points noirs', sensibilite:'la réactivité'
    };
    reason += ` — efficace contre ${matchedConcerns.slice(0,2).map(c => labels[c]||c).join(' et ')}`;
  }
  if (product.ben) {
    reason += `. ${product.ben.split('.')[0]}.`;
  }
  return reason;
}

// ─── Tri final et vérification ─────────────────────────────────────────────────

/**
 * Trie les étapes dans l'ordre logique d'application
 * SPF toujours en dernier
 */
function sortSteps(steps) {
  return [...steps].sort((a, b) => {
    const ia = STEP_ORDER.indexOf(a.stepType);
    const ib = STEP_ORDER.indexOf(b.stepType);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

/**
 * Résout les conflits d'ingrédients dans la routine finale
 * En retirant le produit avec le Yuka le plus faible en cas de conflit
 */
function resolveConflicts(steps, allProducts, profile) {
  const amSteps = steps.filter(s => s.moment === 'AM' || s.moment === 'AM+PM');
  const pmSteps = steps.filter(s => s.moment === 'PM' || s.moment === 'AM+PM');

  const amConflicts = findConflictsInMoment(amSteps);
  const pmConflicts = findConflictsInMoment(pmSteps);

  const allConflicts = new Set([...amConflicts, ...pmConflicts]);

  if (allConflicts.size === 0) return steps;

  // Retirer les produits en conflit
  const resolved = steps.filter(s => !allConflicts.has(s.id));

  return resolved;
}

// ─── Conseil expert ───────────────────────────────────────────────────────────

const CONSEILS = {
  acne:          "Évitez de toucher votre visage. Changez votre taie d'oreiller chaque semaine. Introduisez les actifs progressivement.",
  taches:        "Le SPF le matin est indispensable — sans lui, les taches s'aggravent au soleil.",
  rides:         "Le rétinol se commence 2×/semaine le soir, on augmente progressivement. Toujours associé à un SPF.",
  eclat:         "Hydratation interne et sommeil sont aussi importants que votre routine. 1,5L d'eau par jour minimum.",
  deshydratation:"Appliquez le sérum sur peau légèrement humide pour maximiser l'absorption de l'acide hyaluronique.",
  rougeurs:      "Évitez l'eau trop chaude. Bannissez les produits avec alcool, parfum ou menthol.",
  pores:         "La régularité du BHA et du niacinamide réduit visiblement les pores en 4 semaines.",
  imperfections: "N'exprimez jamais les points noirs à la main, utilisez un exfoliant BHA 2-3 fois par semaine.",
  sensibilite:   "Introduisez un seul produit à la fois, attendez 2 semaines avant d'en ajouter un autre.",
  cernes:        "Appliquez par tapotements doux, jamais en frottant. La tête légèrement surélevée la nuit aide.",
};

// ─── Fonction principale exportée ────────────────────────────────────────────

/**
 * Génère une routine personnalisée complète
 *
 * @param {Object} profile
 * @param {string}   profile.skinType   — seche|grasse|mixte|normale|sensible
 * @param {string}   profile.ageGroup   — 18-25|26-35|36-45|46+
 * @param {string[]} profile.concerns   — [acne, taches, rides, ...]
 * @param {string[]} profile.allergies  — labels allergies utilisateur
 * @param {string}   profile.budget     — low|mid|high|mix
 * @param {string}   profile.routine    — simple|complete|specifique
 * @param {Object}   allProducts        — catalogue products.json
 * @param {string}   [lang]             — fr|en
 *
 * @returns {{ steps, intro, conseil, totalPrix }}
 */
function generateRoutine(profile, allProducts, lang = 'fr') {
  // Normaliser le budget
  const normalizedProfile = {
    ...profile,
    budget: profile.budget === 'mix' ? 'mid' : profile.budget,
    concerns: profile.concerns.length > 0 ? profile.concerns : ['deshydratation'],
  };

  // 1. Construire les étapes
  let steps = buildSteps(allProducts, normalizedProfile);

  // 2. Assigner les moments (AM/PM/AM+PM)
  steps = assignMoments(steps);

  // 3. Résoudre les conflits d'ingrédients
  steps = resolveConflicts(steps, allProducts, normalizedProfile);

  // 4. Trier dans l'ordre logique d'application
  steps = sortSteps(steps);

  // 5. Prix total
  const totalPrix = steps.reduce((sum, s) => sum + (s.prix_num || 0), 0);

  // 6. Introduction personnalisée
  const skinLabels = {
    fr: { seche:'sèche', grasse:'grasse', mixte:'mixte', normale:'normale', sensible:'sensible' },
    en: { seche:'dry',   grasse:'oily',   mixte:'combination', normale:'normal', sensible:'sensitive' },
  };
  const skinLabel = (skinLabels[lang] || skinLabels.fr)[profile.skinType] || profile.skinType;
  const ageStr = profile.ageGroup ? (lang === 'fr' ? ` (${profile.ageGroup} ans)` : ` (${profile.ageGroup})`) : '';

  const introTpl = lang === 'en'
    ? `Your tailored routine for {skin} skin{age}. Each product selected based on your concerns and budget.`
    : `Votre routine sur-mesure pour une peau {skin}{age}. Chaque produit sélectionné selon vos problématiques et votre budget.`;

  const intro = introTpl.replace('{skin}', skinLabel).replace('{age}', ageStr);

  // 7. Conseil expert (basé sur le premier concern)
  const primaryConcern = normalizedProfile.concerns[0];
  const conseil = CONSEILS[primaryConcern] ||
    "Une routine simple appliquée chaque jour surpasse une routine complexe abandonnée.";

  return { steps, intro, conseil, totalPrix };
}

// ─── Export (compatible browser + module) ────────────────────────────────────

if (typeof module !== 'undefined' && module.exports) {
  // Node.js / Vitest
  module.exports = {
    generateRoutine,
    scoreProduct,
    hasConflict,
    isAllergic,
    isPmOnly,
    assignMoments,
    resolveConflicts,
    sortSteps,
    INGREDIENT_CONFLICTS,
    ALLERGY_INCI_MAP,
    STEP_ORDER,
  };
} else {
  // Browser global
  window.SkinMatchAlgo = {
    generateRoutine,
    scoreProduct,
    hasConflict,
    isAllergic,
  };
}
