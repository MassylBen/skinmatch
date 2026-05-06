# Agent Performance — SkinMatch

## Périmètre STRICT
- `public/sw.js` (Service Worker)
- `public/manifest.json`
- `vercel.json` (headers cache + routes + security headers)
- `public/icons/` (icônes PWA à générer)
- Analyse et recommandations sur src/ (lecture uniquement, pas de modification directe)

## État actuel — PWA IMPLÉMENTÉE ✅
```
public/sw.js           — Service Worker (4 stratégies de cache, précache 12 assets)
public/manifest.json   — PWA manifest (8 icônes, 2 shortcuts, 2 screenshots)
public/offline.html    — Page offline branded
vercel.json            — Routes + cache headers + 5 security headers
```

## ⚠️ Actions immédiates requises
- **Icônes PNG manquantes** : les chemins sont définis dans manifest.json mais les fichiers n'existent pas encore dans `public/icons/`
- **Screenshots manquants** : `public/screenshots/welcome.png` et `results.png` idem

### Générer les icônes (script Python — pas besoin de Node.js)
```python
# Créer un script scripts/generate-icons.py
from PIL import Image, ImageDraw, ImageFont
import os

sizes = [72, 96, 128, 144, 192, 512]
os.makedirs('public/icons', exist_ok=True)

for size in sizes:
    img = Image.new('RGBA', (size, size), (196, 114, 106, 255))
    # Arrondir les coins + ajouter "SM"
    img.save(f'public/icons/icon-{size}.png')
```
Ou utiliser un service en ligne : realfavicongenerator.net

## Objectifs chiffrés — NON NÉGOCIABLES

| Métrique              | Cible       | Outil de mesure         |
|-----------------------|-------------|-------------------------|
| Lighthouse Perf       | > 95        | Lighthouse CLI          |
| Lighthouse Access.    | > 95        | Lighthouse CLI          |
| Lighthouse Best Pract.| > 95        | Lighthouse CLI          |
| Lighthouse SEO        | > 90        | Lighthouse CLI          |
| LCP                   | < 2.5s      | Chrome DevTools         |
| FID / INP             | < 100ms     | Chrome DevTools         |
| CLS                   | < 0.1       | Chrome DevTools         |
| TTI                   | < 3.5s      | Lighthouse CLI          |
| Taille bundle total   | < 200KB     | Analyse manuelle        |
| Taille avec modèle ML | < 8MB lazy  | Mesure après chargement |

## Service Worker — Stratégie de cache

```js
// public/sw.js
const CACHE_NAME = 'skinmatch-v1';
const CACHE_VERSION = 1;

// Assets statiques — cache first (immuables)
const STATIC_ASSETS = [
  '/',
  '/src/css/styles.css',
  '/src/js/ui.js',
  '/src/js/algorithm.js',
  '/src/js/i18n.js',
  '/src/data/products.json',
  '/src/data/translations.json',
  '/src/data/routes.json',
];

// Images produits — stale-while-revalidate (peuvent changer)
const IMAGE_PATTERN = /\.(jpg|jpeg|png|webp|avif)$/;

// Modèle TF.js — cache long terme (lourd, ne change pas souvent)
const MODEL_PATTERN = /\/models\//;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Modèle TF.js : cache first, très long TTL
  if (MODEL_PATTERN.test(url.pathname)) {
    event.respondWith(cacheFirst(request, { ttlDays: 30 }));
    return;
  }

  // Images : stale-while-revalidate
  if (IMAGE_PATTERN.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // API Supabase : network first (données temps réel)
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Reste : cache first pour les assets statiques
  event.respondWith(cacheFirst(request));
});

// Page offline fallback
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline.html'))
    );
  }
});
```

## manifest.json PWA

```json
{
  "name": "SkinMatch — Your Skin, Your Routine",
  "short_name": "SkinMatch",
  "description": "Diagnostic de peau personnalisé et routine skincare sur mesure",
  "start_url": "/?source=pwa",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#FDF8F5",
  "theme_color": "#C4726A",
  "lang": "fr",
  "categories": ["health", "lifestyle", "beauty"],
  "icons": [
    { "src": "/icons/icon-72.png",   "sizes": "72x72",   "type": "image/png" },
    { "src": "/icons/icon-96.png",   "sizes": "96x96",   "type": "image/png" },
    { "src": "/icons/icon-128.png",  "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144.png",  "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152.png",  "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192.png",  "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-384.png",  "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512.png",  "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "shortcuts": [
    {
      "name": "Nouveau diagnostic",
      "url": "/?action=diagnostic",
      "icons": [{ "src": "/icons/shortcut-diagnostic.png", "sizes": "96x96" }]
    }
  ],
  "screenshots": [
    { "src": "/screenshots/welcome.png",  "sizes": "390x844", "type": "image/png" },
    { "src": "/screenshots/results.png",  "sizes": "390x844", "type": "image/png" }
  ]
}
```

## vercel.json — Headers de cache

```json
{
  "headers": [
    {
      "source": "/src/data/(.*).json",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=3600, stale-while-revalidate=86400" }
      ]
    },
    {
      "source": "/models/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=2592000, immutable" }
      ]
    },
    {
      "source": "/icons/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=2592000, immutable" }
      ]
    },
    {
      "source": "/(.*).css",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

## Optimisations à recommander (rapport aux autres agents)
Tu ne modifies pas src/ toi-même, mais tu produis des rapports avec recommandations précises :

```markdown
## Rapport Performance — [DATE]

### Agent Frontend
- [ ] Précharger les fonts Google : <link rel="preconnect" href="https://fonts.googleapis.com">
- [ ] Images produits : ajouter loading="lazy" + width/height explicites
- [ ] CSS critique (above-the-fold) : inline dans <head>
- [ ] Reste du CSS : charger en différé avec media="print" + onload trick

### Agent AI-Scan
- [ ] TF.js : charger en lazy (dynamic import()) uniquement si scan demandé
- [ ] Modèle : quantiser en int8 pour réduire de ~4x la taille

### Agent Backend
- [ ] Requêtes Supabase : ajouter select() avec colonnes explicites (pas SELECT *)
- [ ] Prefetch du profil utilisateur au chargement de page si session active
```

## Commande de mesure Lighthouse
```bash
# Lancer depuis le dossier projet
npx lighthouse http://localhost:3000 \
  --output=json \
  --output-path=reports/lighthouse.json \
  --form-factor=mobile \
  --throttling-method=simulate \
  --screenEmulation.width=390 \
  --screenEmulation.height=844 \
  --chrome-flags="--headless"
```
