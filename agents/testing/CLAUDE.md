# Agent QA / Testing — SkinMatch

## Périmètre STRICT
- `tests/unit/`
- `tests/e2e/`
- `vitest.config.js`
- `playwright.config.js`

## État actuel — TESTS ÉCRITS ✅
```
tests/unit/algorithm.test.js  — 30+ tests actifs (scoreProduct, generateRoutine, hasConflict, isAllergic)
tests/unit/i18n.test.js       — 20+ tests actifs (t(), setLang, RTL, formatPrice, tList)
tests/e2e/questionnaire.spec.js — Tests E2E complets (parcours, allergies, comparateur, offline)
```

**Prérequis pour lancer les tests : Node.js doit être installé**
```bash
brew install node   # si pas encore fait
npm install         # installe vitest + playwright
npm run test:unit   # lance les tests unitaires
npm run test:e2e    # lance les tests E2E Playwright
```

## Stack de tests
- **Unit** : Vitest (CommonJS + ESM, compatible vanilla JS)
- **E2E** : Playwright (Chrome + Safari mobile)
- **Coverage** : Istanbul via Vitest (`--coverage`)

## Exports réels des modules à tester

### algorithm.js
```js
// Export navigateur
window.SkinMatchAlgo = { generateRoutine, scoreProduct, hasConflict, isAllergic }

// Export Node.js (Vitest)
module.exports = { generateRoutine, scoreProduct, hasConflict, isAllergic }

// ATTENTION: la fonction s'appelle hasConflict (pas checkConflicts)
// Signature: hasConflict(steps) → [{a, b, reason}]
```

### i18n.js
```js
// Export Node.js (Vitest)
module.exports = I18n
// I18n.init(lang), I18n.t(key, vars), I18n.setLang(lang), I18n.isRTL()
// I18n.tList(key), I18n.formatPrice(amount, currency), I18n.getSupportedLangs()
```

## Couverture minimale requise
| Module          | Coverage cible | Statut |
|-----------------|---------------|--------|
| algorithm.js    | 95%           | Tests écrits, lancer quand Node.js dispo |
| i18n.js         | 85%           | Tests écrits, lancer quand Node.js dispo |
| scan.js         | 70%           | Tests à écrire (Phase 1 testable sans caméra) |
| auth.js / db.js | 60%           | Tests à écrire (mocker Supabase) |
| ui.js           | 50%           | Tests E2E couvrent l'essentiel |

## Tests unitaires — algorithm.test.js (en place)
Couverture réelle :
- 15 combinaisons skin×budget → routine valide (5 types × 3 budgets)
- scoreProduct : bornes 0-100, score -999 pour allergènes, comparaison inter skin types
- Règles : SPF dernier, rétinol jamais AM, somme totalPrix
- Allergies : exclusion rétinol, AHA, multi-allergies, routine quand même générée
- hasConflict : détecte rétinol+vitC, ne détecte pas les combos sûres
- isAllergic : positif, négatif, allergies vides
- Multilangue FR+EN, 4 groupes d'âge

## Tests unitaires — i18n.test.js (en place)
Couverture réelle :
- init() charge les traductions, isLoaded() retourne true
- t() : clé pointée, fallback clé manquante, interpolation {vars}, var manquante
- setLang() : changement FR→EN, traduction change, fallback lang inconnue
- isRTL() : false pour FR, true pour AR
- tList() : retourne un tableau avec value+label
- formatPrice() : format €, GBP, monnaie invalide
- getSupportedLangs() : contient fr, en, ar

## Tests à écrire prochainement

### scan.js — sans caméra (Phase 1 testable)
```js
// Créer un canvas synthétique avec des couleurs connues
// Tester _analyzeZones, _inferSkinType, _inferMetrics
import { JSDOM } from 'jsdom'; // ou canvas npm package

it('peau grasse: zone nez très brillante → skinType=grasse', () => {
  const canvas = createOilyCanvas(); // canvas avec pixels jaunes/brillants
  // ...
});
```

### auth.js + db.js — avec mocks Supabase
```js
import { vi } from 'vitest';
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: { signInWithPassword: vi.fn(), signUp: vi.fn(), signOut: vi.fn() },
    from: () => ({ select: vi.fn().mockReturnThis(), single: vi.fn() }),
  })
}));
```

## Tests E2E — questionnaire.spec.js (en place)
Parcours couverts :
- FR complet : lang → welcome → Q1-Q5 → résultat avec produits
- EN complet : même flow en anglais
- Modal produit : ouverture/fermeture
- Allergie Rétinol : aucun produit allergène dans le résultat
- Compare mode : sélection 2 produits, tableau comparatif
- Offline : page offline affichée sans réseau
- Viewport : test à 375px (iPhone SE)

## Playwright config — tel que configuré
```js
// playwright.config.js
baseURL: 'http://localhost:3000'
viewport: { width: 390, height: 844 }  // iPhone 14 par défaut
projects: chromium (iPhone 14) + webkit (iPhone SE)
```

## Règles impératives
- Un test qui échoue = bloquer le déploiement (GitHub Actions le fait)
- Jamais de `test.skip()` ni `it.todo()` pour masquer un problème réel
- Chaque nouvelle feature → au moins 1 test ajouté dans la même PR
- Les tests de régression ne se suppriment jamais — on les corrige
- Tester à 375px minimum (iPhone SE) — c'est le plus petit écran supporté

## Interdictions
- Ne jamais modifier les fichiers hors périmètre (src/, scripts/, agents/)
- Ne jamais mocker l'algorithme principal dans les tests d'intégration
- Ne jamais désactiver la couverture pour atteindre un seuil artificiellement
