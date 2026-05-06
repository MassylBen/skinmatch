# Agent Frontend — SkinMatch

## Périmètre STRICT
- `src/index.html`
- `src/css/styles.css`
- `src/js/ui.js`
- `public/manifest.json`
- `public/sw.js`
- `public/offline.html`
- `public/icons/` (icônes PWA)

## État actuel — REFACTORING TERMINÉ ✅
Le monolithe HTML a été découpé. Ne pas revenir en arrière.

```
src/index.html          — HTML sémantique + chargement des scripts
src/css/styles.css      — CSS complet (variables, composants, RTL, animations)
src/js/ui.js            — Logique UI, navigation, rendu (2300+ lignes)
src/js/data-legacy.js   — Données temporaires (migration progressive vers JSON)
public/manifest.json    — PWA manifest (8 icônes, 2 shortcuts)
public/sw.js            — Service Worker (4 stratégies de cache)
public/offline.html     — Page fallback offline
```

## Ordre de chargement des scripts dans index.html — NE PAS MODIFIER
```html
<!-- 1. Config env (variables Supabase injectées) -->
<script> window.SKINMATCH_SUPABASE_URL = ...; window.DEBUG = ...; </script>

<!-- 2. Supabase SDK -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/..." defer></script>

<!-- 3. Données et logique métier -->
<script src="/src/js/data-legacy.js"></script>
<script src="/src/js/i18n.js"></script>
<script src="/src/js/algorithm.js"></script>

<!-- 4. Backend + IA (defer = non bloquants) -->
<script src="/src/js/auth.js" defer></script>
<script src="/src/js/db.js" defer></script>
<script src="/src/js/scan.js" defer></script>

<!-- 5. UI (dernier — dépend de tout le reste) -->
<script src="/src/js/ui.js"></script>
```

## Intégration Auth — Écouter l'event skinmatch:auth
```js
// Déjà implémenté dans ui.js — NE PAS DUPLIQUER
document.addEventListener('skinmatch:auth', function(e) {
  const { event, user } = e.detail;
  if (event === 'SIGNED_IN') { ST.user = { id, name, email }; _updateAuthUI(true); }
  if (event === 'SIGNED_OUT') { ST.user = null; _updateAuthUI(false); }
});

// Éléments UI attendus dans index.html pour l'auth :
// id="btn-login"         — bouton Se connecter (caché si connecté)
// id="btn-logout"        — bouton Déconnexion (caché si non connecté)
// id="user-badge"        — badge avec nom utilisateur (display:flex si connecté)
// id="user-name-display" — span affichant ST.user.name
```

## Système de design SkinMatch — NE JAMAIS DÉVIER

### Variables CSS (toutes dans :root — src/css/styles.css)
```css
:root {
  --bg: #FDF8F5;         /* fond général */
  --surf: #FFFFFF;        /* surfaces cartes */
  --pri: #3D2B1F;         /* texte principal */
  --acc: #D4A5A0;         /* accent clair */
  --acc2: #B07C77;        /* accent moyen */
  --mut: #B0958F;         /* texte secondaire */
  --bdr: #EDD9D4;         /* bordures */
  --tag: #FAF0ED;         /* tags fond */
  --err: #C0392B;         /* erreurs */
  --rose: #F2C4BC;        /* rose pâle */
  --blush: #FBE8E4;       /* blush pâle */
  --sage: #B5C4B1;        /* vert sauge */
  --cream: #FFF9F6;       /* crème */
  --brand: #C4726A;       /* couleur principale */
  --brand-dark: #A85A52;  /* principal foncé */
  --serif: 'Cormorant Garamond', Georgia, serif;
  --sans:  'Outfit', 'Helvetica Neue', sans-serif;
}
```

### Règles CSS impératives
- Toutes les couleurs via variables CSS — zéro hex en dur dans le CSS
- Mobile-first : `max-width: 460px; margin: 0 auto;`
- Tester à 375px (iPhone SE) et 390px (iPhone 14)
- `!important` interdit sauf `.hidden { display: none !important; }`
- Animations : toujours `@media (prefers-reduced-motion: reduce)` en miroir
- Pas de dark mode (color-scheme: light only sur html)

### Support RTL (Arabe) — déjà dans styles.css
```css
[dir="rtl"] .topbar    { flex-direction: row-reverse; }
[dir="rtl"] .btn-back  { flex-direction: row-reverse; }
[dir="rtl"] .ph        { flex-direction: row-reverse; }
[dir="rtl"] .conseil   { text-align: right; }
```

## État de l'app — objet ST (global dans ui.js)
```js
// Objet d'état global — ne pas renommer, d'autres modules y accèdent
const ST = {
  skinType:  null,    // 'seche'|'grasse'|'mixte'|'normale'|'sensible'
  ageGroup:  null,    // 'moins-25'|'26-35'|'36-45'|'plus-45'
  concerns:  [],      // ['acne','rides',...]
  allergies: [],      // ['Rétinol','Parfums',...]
  budget:    null,    // 'low'|'mid'|'high'
  routine:   null,    // 'simple'|'complete'|'specifique'
  result:    null,    // { steps, intro, conseil, totalPrix }
  user:      null,    // { id, name, email } ou null
  showShare: false,
};
```

## Accessibilité (WCAG AA minimum)
- Tous les boutons icône : `aria-label` obligatoire
- Contraste texte : minimum 4.5:1
- Focus visible sur tous les éléments interactifs
- Images : `alt` descriptif toujours présent

## PWA — Checklist
- ✅ manifest.json lié dans `<head>` avec `rel="manifest"`
- ✅ `theme-color` meta dans `<head>`
- ✅ `apple-mobile-web-app-capable` meta
- ✅ SW enregistré dans le `<body>` avec scope "/"
- ✅ 8 tailles d'icônes (72 → 512), versions maskable incluses
- ⚠️ Icônes PNG à générer dans `public/icons/` (actuellement chemins définis, fichiers manquants)

## Interdictions
- Pas de framework CSS (Tailwind, Bootstrap… — zéro)
- Pas de jQuery
- Pas d'images base64 dans le CSS
- Pas de `z-index > 1000` (sauf modales existantes)
- Pas de `setTimeout` pour masquer des éléments UI (utiliser CSS transitions)
- Ne jamais modifier les fichiers hors périmètre (`algorithm.js`, `auth.js`, `db.js`, `scan.js`, `i18n.js`)

## MCP Servers assignés

| Serveur | Usage dans ce périmètre |
|---------|------------------------|
| `filesystem` | Lire/écrire `index.html`, `styles.css`, `ui.js`, `public/` |
| `playwright` | Vérifier visuellement les changements UI à 375px et 390px, tester les interactions (modales, navigation, animations) |
