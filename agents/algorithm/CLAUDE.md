# Agent Algorithm — SkinMatch

## Périmètre STRICT (tu ne touches QU'À CES FICHIERS)
- `src/js/algorithm.js`
- `src/data/routes.json`
- `tests/unit/algorithm.test.js`

## État actuel — IMPLÉMENTÉ ✅
Le moteur de scoring multidimensionnel est opérationnel depuis Sprint 2.
Ne pas réécrire depuis zéro — améliorer l'existant.

## Signature des fonctions exportées (NE PAS CHANGER sans prévenir l'Orchestrateur)

```js
// Export navigateur
window.SkinMatchAlgo = { generateRoutine, scoreProduct, hasConflict, isAllergic };

// Export Node.js (pour Vitest)
module.exports = { generateRoutine, scoreProduct, hasConflict, isAllergic };

/**
 * @param {Object} profile
 *   skinType:  'seche'|'grasse'|'mixte'|'normale'|'sensible'
 *   ageGroup:  'moins-25'|'26-35'|'36-45'|'plus-45'
 *   concerns:  string[]  — ex: ['rides','taches']
 *   allergies: string[]  — ex: ['Rétinol','Parfums']
 *   budget:    'low'|'mid'|'high'
 *   routine:   'simple'|'complete'|'specifique'
 * @param {Object} allProducts — objet products.json (clé: id slug)
 * @param {string} lang — 'fr'|'en'|'es'|'ar'
 * @returns {{ steps, intro, conseil, totalPrix }}
 */
function generateRoutine(profile, allProducts, lang) { ... }

/**
 * @returns {number} score 0-100, ou -999 si produit allergène
 */
function scoreProduct(product, profile) { ... }

/**
 * @param {Object[]} steps — liste des étapes de la routine
 * @returns {Array} conflits détectés [{a, b, reason}]
 */
function hasConflict(steps) { ... }

/**
 * @param {Object} product
 * @param {string[]} allergies — labels utilisateur (ex: 'Rétinol')
 * @returns {boolean}
 */
function isAllergic(product, allergies) { ... }
```

## Système de scoring — 5 dimensions (total 100 pts)

| Dimension | Points max | Critère |
|-----------|-----------|---------|
| Type de peau | 30 | Exact match skinType → 30pts, voisin → 15pts, incompatible → -10pts |
| Concerns | 25 | +5pts par concern de l'user couvert par le produit (max 5 concerns) |
| Budget | 20 | Prix dans la fourchette budget → 20pts, hors fourchette → 0-10pts |
| Âge | 15 | AgeGroup dans ageGroups du produit → 15pts, sinon 0-8pts |
| Formule | 10 | clean +5, vegan +3, yuka≥80 +2 |
| Allergie | — | Si allergène détecté → score = **-999** (produit exclu absolument) |

## Règles métier — ABSOLUES

```
✅ SPF toujours en DERNIER dans la routine (STEP_ORDER)
✅ Rétinol → moment forcé PM (jamais AM)
✅ Rétinaldéhyde, Encapsulated Retinol → idem PM
✅ Masque → forcé PM
✅ Conflits ingrédients → retirer le produit avec le score le plus bas
```

## Conflits ingrédients actifs (INGREDIENT_CONFLICTS dans algorithm.js)
```
retinol + ascorbic acid  → irritation
retinol + glycolic acid  → irritation
retinol + salicylic acid → irritation
glycolic acid + salicylic acid → sur-exfoliation
niacinamide + ascorbic acid   → réaction niacine (controverse — garder pour sécurité)
vitamin c + benzoyl peroxide  → oxydation
AHA + BHA (même moment)       → sur-exfoliation
```

## Map allergies → INCI (ALLERGY_INCI_MAP dans algorithm.js)
```js
'Rétinol'            → ['retinol', 'retinyl palmitate', 'retinaldehyde', 'encapsulated retinol']
'AHA'                → ['glycolic acid', 'lactic acid', 'mandelic acid', 'citric acid']
'Acide salicylique'  → ['salicylic acid', 'beta hydroxy acid']
'Vitamine C'         → ['ascorbic acid', 'l-ascorbic acid', '3-o-ethyl ascorbic acid']
'Parfums'            → ['parfum', 'fragrance', 'limonene', 'linalool']
'Parabènes'          → ['methylparaben', 'propylparaben', 'ethylparaben', 'butylparaben']
'Alcool'             → ['alcohol denat', 'ethanol', 'sd alcohol']
'Sulfates'           → ['sodium lauryl sulfate', 'sodium laureth sulfate']
'Silicones'          → ['dimethicone', 'cyclopentasiloxane', 'cyclohexasiloxane']
```

## Tests à maintenir (tests/unit/algorithm.test.js)
- ✅ 15 combinaisons skin×budget retournent des routines valides
- ✅ Score -999 pour produits allergènes
- ✅ SPF toujours dernier
- ✅ Rétinol jamais en AM
- ✅ totalPrix = somme des prix des étapes
- ✅ Routine simple = exactement 3 étapes
- ✅ hasConflict détecte rétinol+vitC
- ✅ isAllergic retourne false si allergies=[]

## Interface avec les autres agents
- Lit `src/data/products.json` (Agent Products écrit, toi tu lis — lecture seule)
- `generateRoutine()` appelé par `ui.js` (Agent Frontend) via `window.SkinMatchAlgo`
- `generateRoutine()` appelé par les tests Vitest via `module.exports`
- Toute modification de signature → prévenir Orchestrateur + mettre à jour ui.js

## Interdictions
- Ne jamais modifier `src/data/products.json` (périmètre Agent Products)
- Ne jamais modifier `src/js/ui.js` (périmètre Agent Frontend)
- Ne jamais hardcoder de nom de produit — utiliser uniquement les IDs slugs
- Ne pas changer les noms des 4 exports publics (`generateRoutine`, `scoreProduct`, `hasConflict`, `isAllergic`)
