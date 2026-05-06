# TASKS.md — Tableau de bord des agents SkinMatch

> Format: [AGENT] [STATUS] [FICHIER] Description
> Status: TODO | IN_PROGRESS | DONE | BLOCKED

---

## Sprint 1 — Infrastructure & Données

[DEVOPS]     [DONE]  [/]                   Structure projet créée (10 agents configurés)
[PRODUCTS]   [DONE]  [products.json]        115 produits extraits + enrichis (skinTypes/concerns/ageGroups/budgetTier)
[ALGORITHM]  [DONE]  [routes.json]          Table de routage extraite
[LOCALIZE]   [DONE]  [translations.json]    Traductions FR+EN créées (87 clés)

## Sprint 2 — Moteur de scoring

[PRODUCTS]   [DONE]  [products.json]        Enrichissement: skinTypes, concerns, ageGroups, budgetTier, allergenes, stepType
[ALGORITHM]  [DONE]  [algorithm.js]         Moteur de scoring multidimensionnel (150/150 combinaisons ✅)
[ALGORITHM]  [DONE]  [algorithm.js]         Détection conflits ingrédients (rétinol/vitC, AHA/BHA, etc.)
[ALGORITHM]  [DONE]  [algorithm.js]         Rétinol forcé en PM, SPF forcé en AM
[QA]         [DONE]  [tests/unit/algorithm.test.js]  Tests unitaires algorithme (150 combinaisons, allergies, SPF, rétinol PM)
[QA]         [DONE]  [tests/unit/i18n.test.js]       Tests unitaires i18n (t(), setLang, RTL, formatPrice, tList)

## Sprint 3 — Frontend Refactoring

[FRONTEND]   [DONE]  [styles.css]           CSS extrait du HTML (182 lignes)
[FRONTEND]   [DONE]  [ui.js]                JS UI extrait (2228 lignes)
[FRONTEND]   [DONE]  [data-legacy.js]       Données temporaires extraites (447 lignes)
[FRONTEND]   [DONE]  [src/index.html]       HTML propre (443 lignes, sans inline JS/CSS)
[FRONTEND]   [DONE]  [ui.js]                Connexion nouveau moteur generateRoutine()
[FRONTEND]   [DONE]  [public/manifest.json] PWA manifest (8 tailles d'icônes, 2 shortcuts)
[FRONTEND]   [DONE]  [public/sw.js]         Service Worker (4 stratégies de cache)
[FRONTEND]   [DONE]  [public/offline.html]  Page offline PWA

## Sprint 4 — Backend

[BACKEND]    [DONE]  [supabase/migrations/001_initial_schema.sql]  Schéma DB (profiles, routines, tracking + vue dashboard)
[BACKEND]    [DONE]  [supabase/migrations/002_rls_policies.sql]    RLS + trigger auto-profil + anonymisation RGPD
[BACKEND]    [DONE]  [src/js/auth.js]   Auth Supabase (email/password + Google OAuth + reset pwd)
[BACKEND]    [DONE]  [src/js/db.js]     CRUD Profiles/Routines/Tracking + autoSaveRoutine()
[BACKEND]    [DONE]  [vercel.json]      Config Vercel (routes + cache headers + security headers)
[FRONTEND]   [DONE]  [ui.js]           skinmatch:auth event branché (SIGNED_IN/OUT + chargement profil Supabase + auto-save routine)

## Sprint 5 — AI Scan

[AI-SCAN]    [DONE]  [scan.js]         Phase 1: analyse Canvas API par zones faciales (front/nez/joues/menton)
[AI-SCAN]    [DONE]  [scan.js]         Phase 2: inférence TF.js MobileNet (chargé depuis /src/js/models/ si dispo)
[AI-SCAN]    [DONE]  [scan.js]         startScanFlow() → consentement → caméra → countdown → analyse → résultat
[AI-SCAN]    [TODO]  [src/js/models/]  Entraîner et exporter le modèle MobileNet (nécessite dataset photos de peau)

## Sprint 6 — Tests & Deploy

[QA]         [DONE]  [tests/e2e/questionnaire.spec.js]  Parcours complet + allergies + comparateur + offline + viewport
[DEVOPS]     [DONE]  [.github/workflows/ci.yml]       Pipeline CI/CD (validate → unit → e2e → deploy)
[DEVOPS]     [DONE]  [vercel.json]                    Config Vercel (routes, cache headers, security headers)
[PERF]       [DONE]  [vercel.json]     Audit #1 Lighthouse 2026-05-06: Perf 96, A11y 74, BP 96, SEO 100
[PERF]       [DONE]  [manifest.json]  Corrigé chemins icônes (/public/icons/ → /icons/) + ajout maskable
[PERF]       [DONE]  [public/icons/]  Créé icon-192-maskable.png et icon-512-maskable.png (PIL)
[PERF]       [DONE]  [sw.js]          Corrigé chemins offline.html + manifest.json (v1→v2)
[PERF]       [DONE]  [vercel.json]    Ajout HSTS, CORP, COOP, Content-Type manifest+json
[PERF]       [DONE]  [vercel.json]    Audit #2 Lighthouse 2026-05-06: Perf 98, A11y 74, BP 96, SEO 100
[PERF]       [DONE]  [vercel.json]    Fix critique: outputDirectory:"." + routes explicites CSS/JS/data (routes /public/* → 404 car Vercel servait src/ comme racine)
[PERF]       [DONE]  [sw.js]          Bump v2→v3, corrigé PRECACHE_ASSETS (/src/css/→/css/ etc.) + PATTERNS data/model
[PERF]       [BLOCKED] [/]            A11y 74→95 bloqué: correctifs requis dans src/index.html (périmètre Agent Frontend)
[FRONTEND]   [DONE]   [index.html + styles.css] Corrections accessibilité A11y (viewport, contraste, manifest paths, SW path)

## Sprint 7 — Internationalisation

[LOCALIZE]   [DONE]  [translations.json] Espagnol (87 clés — skin types, concerns, budgets, conseils)
[LOCALIZE]   [DONE]  [translations.json] Arabe RTL (87 clés — texte arabe natif, direction RTL déjà supportée par i18n.js)
[PRODUCTS]   [TODO]  [products.json]   Prix UK/US pour tous les produits
[PRODUCTS]   [TODO]  [products.json]   Liens achat UK (Boots, LookFantastic)
[PRODUCTS]   [TODO]  [products.json]   Liens achat US (Sephora, Dermstore)

---

## Notes bloquantes

### [PERF→FRONTEND] Correctifs accessibilité urgents (A11y actuel: 74/100, cible: 95+)

**Audit Lighthouse #2 — 2026-05-06 — Scores confirmés: Perf 98, A11y 74, BP 96, SEO 100**
**Seuls 2 audits A11y échouent: `meta-viewport` (poids 10) et `color-contrast` (poids 7)**

**Fichier: `src/index.html`**

1. **Ligne 5 — meta-viewport** (CONFIRME par Lighthouse — impact -15pts A11y, WCAG 1.4.4)
   - AVANT: `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">`
   - APRÈS: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
   - Raison: `maximum-scale=1.0` < 5 bloque le zoom — Lighthouse audit `meta-viewport` score=0

2. **Ligne 18 — lien manifest** (CONFIRME par Lighthouse — 404 console, Best Practices score 96→100)
   - AVANT: `<link rel="manifest" href="/public/manifest.json">`
   - APRÈS: `<link rel="manifest" href="/manifest.json">`
   - Raison: 5 erreurs console détectées (`/public/manifest.json` → 404). Route Vercel `/manifest.json` → `/public/manifest.json` est correcte.

3. **Ligne 59 — couleur faible contraste** (CONFIRME — ratio 3.3:1, min WCAG AA = 4.5:1)
   - AVANT: `<div style="font-size:12px;color:#9A8A85;margin-top:2px">France · Belgique · Suisse</div>`
   - APRÈS: `<div style="font-size:12px;color:#6B5A55;margin-top:2px">France · Belgique · Suisse</div>`

4. **Ligne 67 — couleur faible contraste** (CONFIRME — même problème, même fix)
   - AVANT: `<div style="font-size:12px;color:#9A8A85;margin-top:2px">UK · US · International</div>`
   - APRÈS: `<div style="font-size:12px;color:#6B5A55;margin-top:2px">UK · US · International</div>`

5. **Ligne 15 — chemin icône OG** (chemin /public/ invalide, 404)
   - AVANT: `<meta property="og:image" content="/public/icons/icon-512.png">`
   - APRÈS: `<meta property="og:image" content="/icons/icon-512.png">`

6. **Ligne 19 — chemin apple-touch-icon** (chemin /public/ invalide)
   - AVANT: `<link rel="apple-touch-icon" href="/public/icons/icon-192.png">`
   - APRÈS: `<link rel="apple-touch-icon" href="/icons/icon-192.png">`

7. **Ligne 435 — Service Worker path** (CRITIQUE — SW ne s'enregistre jamais)
   - AVANT: `navigator.serviceWorker.register('/public/sw.js', { scope: '/' })`
   - APRÈS: `navigator.serviceWorker.register('/sw.js', { scope: '/' })`
   - Raison: Vercel route `/sw.js` → `/public/sw.js`. L'URL `/public/sw.js` retourne 404.

**Fichier: `src/css/styles.css`**

8. **Ligne 76 — classe .legal** (contraste insuffisant, même problème que #3 et #4)
   - AVANT: `.legal{font-size:12px;color:#9A8A85;text-align:center;...}`
   - APRÈS: `.legal{font-size:12px;color:#6B5A55;text-align:center;...}`

### [PERF→FRONTEND] Correctifs performance (Perf actuel: 98/100, cible: 99+)

**Fichier: `src/index.html`**

9. **Lignes 423-429 — scripts render-blocking** (Lighthouse: -620ms FCP estimé, wasted 362ms/js)
   - `data-legacy.js` et `ui.js` sont chargés sans `defer` et bloquent le rendu
   - AVANT (lignes 423-429):
     ```html
     <script src="/js/data-legacy.js"></script>
     <script src="/js/i18n.js"></script>
     <script src="/js/algorithm.js"></script>
     <script src="/js/auth.js" defer></script>
     <script src="/js/db.js" defer></script>
     <script src="/js/scan.js" defer></script>
     <script src="/js/ui.js"></script>
     ```
   - APRÈS: ajouter `defer` sur data-legacy.js, i18n.js, algorithm.js et ui.js:
     ```html
     <script src="/js/data-legacy.js" defer></script>
     <script src="/js/i18n.js" defer></script>
     <script src="/js/algorithm.js" defer></script>
     <script src="/js/auth.js" defer></script>
     <script src="/js/db.js" defer></script>
     <script src="/js/scan.js" defer></script>
     <script src="/js/ui.js" defer></script>
     ```
   - ATTENTION: le bloc inline ligne 413-417 (`window.SKINMATCH_*`) doit rester sans `defer`.
     Vérifier que `ui.js` et `i18n.js` n'accèdent pas au DOM avant `DOMContentLoaded`.

10. **Ligne 32 — Google Fonts render-blocking** (Lighthouse: wasted 898ms)
    - AVANT: `<link href="https://fonts.googleapis.com/..." rel="stylesheet">`
    - APRÈS: Charger en non-bloquant:
      ```html
      <link rel="preload" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
      <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap"></noscript>
      ```
