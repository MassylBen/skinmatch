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
[PERF]       [TODO]  [/]               Lighthouse score > 95 (mesurer après deploy Vercel)

## Sprint 7 — Internationalisation

[LOCALIZE]   [DONE]  [translations.json] Espagnol (87 clés — skin types, concerns, budgets, conseils)
[LOCALIZE]   [DONE]  [translations.json] Arabe RTL (87 clés — texte arabe natif, direction RTL déjà supportée par i18n.js)
[PRODUCTS]   [TODO]  [products.json]   Prix UK/US pour tous les produits
[PRODUCTS]   [TODO]  [products.json]   Liens achat UK (Boots, LookFantastic)
[PRODUCTS]   [TODO]  [products.json]   Liens achat US (Sephora, Dermstore)

---

## Notes bloquantes
_Ajouter ici les blocages inter-agents_
