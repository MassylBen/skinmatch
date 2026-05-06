/**
 * SkinMatch — Service Worker
 * Agent Performance — public/sw.js
 *
 * Stratégies de cache:
 *   - Assets statiques (CSS/JS/HTML) → Cache First
 *   - Images produits                → Stale While Revalidate
 *   - Données JSON (products, etc.)  → Stale While Revalidate (1h)
 *   - Modèle TF.js                   → Cache First (30 jours)
 *   - API Supabase                   → Network First
 *   - Navigation offline             → Fallback page
 */

'use strict';

const CACHE_VERSION  = 'v3';
const CACHE_STATIC   = `skinmatch-static-${CACHE_VERSION}`;
const CACHE_IMAGES   = `skinmatch-images-${CACHE_VERSION}`;
const CACHE_DATA     = `skinmatch-data-${CACHE_VERSION}`;
const CACHE_MODEL    = `skinmatch-model-${CACHE_VERSION}`;

// Assets à précacher lors de l'installation
// Chemins correspondant aux routes Vercel (outputDirectory: ".")
const PRECACHE_ASSETS = [
  '/',
  '/css/styles.css',
  '/js/algorithm.js',
  '/js/ui.js',
  '/js/i18n.js',
  '/js/data-legacy.js',
  '/data/products.json',
  '/data/translations.json',
  '/data/routes.json',
  '/manifest.json',
  '/offline.html',
];

// Patterns pour identifier les types de requêtes
const PATTERNS = {
  static:  /\.(css|js|html|woff2?)$/,
  image:   /\.(jpg|jpeg|png|webp|avif|gif|svg)$/,
  data:    /\/data\/.*\.json$/,
  model:   /\/js\/models\//,
  supabase:/supabase\.co/,
};

// ─── Installation ─────────────────────────────────────────────────────────────

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => {
        // Précacher les assets essentiels (ignorer les erreurs individuelles)
        return Promise.allSettled(
          PRECACHE_ASSETS.map(url =>
            cache.add(url).catch(() => console.warn(`[SW] Précache échoué: ${url}`))
          )
        );
      })
      .then(() => {
        console.log(`[SW] Installé — version ${CACHE_VERSION}`);
        return self.skipWaiting(); // Activer immédiatement
      })
  );
});

// ─── Activation — Nettoyage anciens caches ────────────────────────────────────

self.addEventListener('activate', event => {
  const CURRENT_CACHES = [CACHE_STATIC, CACHE_IMAGES, CACHE_DATA, CACHE_MODEL];

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('skinmatch-') && !CURRENT_CACHES.includes(name))
            .map(name => {
              console.log(`[SW] Suppression ancien cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ─── Stratégies de cache ──────────────────────────────────────────────────────

/**
 * Cache First — Pour les assets qui ne changent pas souvent
 * Retourne depuis le cache si présent, sinon fetch et met en cache
 */
async function cacheFirst(request, cacheName = CACHE_STATIC) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match('/offline.html');
  }
}

/**
 * Stale While Revalidate — Retourne le cache immédiatement
 * et met à jour en arrière-plan
 */
async function staleWhileRevalidate(request, cacheName = CACHE_IMAGES) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      caches.open(cacheName).then(cache => cache.put(request, response.clone()));
    }
    return response;
  }).catch(() => null);

  return cached || fetchPromise;
}

/**
 * Network First — Pour les données temps réel (API Supabase)
 * Essaie le réseau, fallback sur le cache si offline
 */
async function networkFirst(request, cacheName = CACHE_DATA) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: 'offline' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ─── Interception des requêtes ────────────────────────────────────────────────

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET et les extensions browser
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Modèle TF.js — cache très long terme
  if (PATTERNS.model.test(url.pathname)) {
    event.respondWith(cacheFirst(request, CACHE_MODEL));
    return;
  }

  // API Supabase — network first
  if (PATTERNS.supabase.test(url.hostname)) {
    event.respondWith(networkFirst(request, CACHE_DATA));
    return;
  }

  // Données JSON locales — stale while revalidate (fraîcheur importante)
  if (PATTERNS.data.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_DATA));
    return;
  }

  // Images produits (CDN externes) — stale while revalidate
  if (PATTERNS.image.test(url.pathname) || url.hostname !== location.hostname) {
    event.respondWith(staleWhileRevalidate(request, CACHE_IMAGES));
    return;
  }

  // Assets statiques locaux — cache first
  if (PATTERNS.static.test(url.pathname)) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // Navigation — cache first avec fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      cacheFirst(request, CACHE_STATIC)
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Tout le reste — réseau simple
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

// ─── Messages depuis l'app ────────────────────────────────────────────────────

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }

  // Vider le cache à la demande (mise à jour forcée)
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then(names =>
      Promise.all(names.map(n => caches.delete(n)))
    ).then(() => {
      event.ports[0].postMessage({ cleared: true });
    });
  }
});
