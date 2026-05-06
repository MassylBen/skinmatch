# Agent DevOps — SkinMatch

## Périmètre STRICT
- `.github/workflows/`
- `vercel.json`
- `.gitignore`
- `package.json`
- `scripts/` (scripts de build et validation)

## Stack infrastructure
- **Hosting** : Vercel (CDN global, previews automatiques par PR)
- **CI** : GitHub Actions
- **Monitoring erreurs** : Sentry
- **Analytics** : Vercel Analytics (privacy-first, sans cookies)
- **Uptime** : UptimeRobot (check toutes les 5 minutes)

## Pipeline CI/CD

```yaml
# .github/workflows/ci.yml
name: CI — SkinMatch

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    name: Validation données
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - name: Valider products.json
        run: python3 scripts/validate-products.py
      - name: Valider translations.json
        run: python3 scripts/validate-translations.py
      - name: Valider routes.json
        run: python3 scripts/validate-routes.py

  test:
    name: Tests
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - name: Tests unitaires
        run: npm run test:unit -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v4
      - name: Tests E2E
        run: |
          npx playwright install --with-deps chromium webkit
          npm run test:e2e

  lighthouse:
    name: Performance
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci && npm run build
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          configPath: '.lighthouserc.json'
          uploadArtifacts: true

  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    needs: [validate, test]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy sur Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Environments et branches
| Branche    | Environment  | URL                          |
|------------|--------------|------------------------------|
| `main`     | Production   | `skinmatch.app`              |
| `develop`  | Staging      | `staging.skinmatch.app`      |
| `feat/*`   | Preview      | `skinmatch-{hash}.vercel.app`|

## Secrets GitHub à configurer (Settings > Secrets)
```
VERCEL_TOKEN          → Token Vercel (Settings > Tokens)
VERCEL_ORG_ID         → ID de l'organisation Vercel
VERCEL_PROJECT_ID     → ID du projet Vercel
SUPABASE_URL          → URL du projet Supabase
SUPABASE_ANON_KEY     → Clé publique Supabase
SENTRY_DSN            → DSN Sentry pour les erreurs
```

## package.json

```json
{
  "name": "skinmatch",
  "version": "2.0.0",
  "description": "Personnalized skincare routine app",
  "scripts": {
    "dev":          "python3 -m http.server 3000 --directory .",
    "test:unit":    "vitest run",
    "test:unit:watch": "vitest",
    "test:e2e":     "playwright test",
    "test":         "npm run test:unit && npm run test:e2e",
    "validate":     "python3 scripts/validate-products.py && python3 scripts/validate-translations.py",
    "extract":      "python3 scripts/extract-products.py",
    "lint":         "echo 'Lint OK (vanilla JS, pas de linter configuré)'",
    "lighthouse":   "npx lighthouse http://localhost:3000 --output=json --output-path=reports/lighthouse.json --form-factor=mobile"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@playwright/test": "^1.40.0"
  }
}
```

## .gitignore

```
# Environnement
.env
.env.local
.env.*.local

# Node
node_modules/
npm-debug.log*

# Build
dist/
build/
.vercel/

# Reports
reports/
coverage/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/settings.json
.idea/

# Debug
src/data/db_raw_debug.js
```

## Lighthouse CI config

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance":    ["error", { "minScore": 0.90 }],
        "categories:accessibility":  ["error", { "minScore": 0.90 }],
        "categories:best-practices": ["error", { "minScore": 0.90 }],
        "categories:seo":            ["error", { "minScore": 0.85 }]
      }
    }
  }
}
```

## Monitoring Sentry

```js
// À ajouter dans index.html (avant les autres scripts, en production uniquement)
// Injecté par Vercel via les variables d'environnement
if (window.__SENTRY_DSN__) {
  Sentry.init({
    dsn: window.__SENTRY_DSN__,
    environment: window.__ENV__ || 'production',
    tracesSampleRate: 0.1,      // 10% des transactions tracées
    replaysSessionSampleRate: 0, // Pas de replay (vie privée)
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error exception captured',
    ]
  });
}
```

## Procédure de rollback
En cas de bug critique en production :
```bash
# 1. Identifier le dernier deploy stable
vercel ls --prod

# 2. Rollback vers ce deploy
vercel rollback [deployment-url]

# 3. Investiguer sur la branche develop
git checkout develop
git log --oneline -20
```

## Interdictions
- Jamais committer sur `main` directement (toujours via PR)
- Jamais déployer si les tests échouent
- Jamais committer les fichiers `.env`
- Jamais utiliser `--force` sur `main`
