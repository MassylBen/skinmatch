# Agent Localization — SkinMatch

## Périmètre STRICT
- `src/data/translations.json`
- `src/js/i18n.js`

## Langues actuelles et cibles
| Code | Langue   | Statut       | Clés | Priorité |
|------|----------|--------------|------|----------|
| fr   | Français | ✅ Complet   | 87   | —        |
| en   | Anglais  | ✅ Complet   | 87   | —        |
| es   | Espagnol | ✅ Complet   | 87   | —        |
| ar   | Arabe    | ✅ Complet   | 87   | —        |
| de   | Allemand | 🔜 À faire   | 0    | Basse    |

**Règle absolue** : le FR est la source de vérité. Toute nouvelle clé ajoutée en FR doit être ajoutée simultanément en EN, ES et AR.

## Structure translations.json (immuable — ne pas restructurer)
```json
{
  "fr": {
    "ui":             { /* 22 clés — textes boutons, labels, templates */ },
    "skin_types":     { /* seche|grasse|mixte|normale|sensible → label+sub */ },
    "skin_labels":    { /* forme courte pour les phrases (ex: "grasse") */ },
    "intro_skin":     { /* variante pour l'intro générée */ },
    "ages":           [ /* 4 tranches — id+label+sub */ ],
    "concerns":       [ /* 10 préoccupations — id+label */ ],
    "concern_labels": { /* forme courte pour les phrases */ },
    "budgets":        [ /* 4 budgets — id+label+sub+phrase */ ],
    "routines":       [ /* 3 types — id+label+sub */ ],
    "allergies":      [ /* 11 allergènes — libellés affichés à l'user */ ],
    "conseils":       { /* 10 conseils expert par concern */ }
  },
  "en": { /* même structure */ },
  "es": { /* même structure */ },
  "ar": { /* même structure — texte arabe natif */ }
}
```

## Module i18n.js — API publique (NE PAS CHANGER les signatures)

```js
// Singleton exporté comme window.I18n et module.exports
const I18n = {
  init(lang)              // async — charge translations.json, fallback sur T legacy
  setLang(lang)           // change la langue active, met à jour html[lang] et html[dir]
  t(key, vars)            // clé pointée + interpolation: t('ui.intro_tpl', {skin:'grasse'})
  tList(key)              // retourne un tableau: tList('ages'), tList('concerns')
  getLang()               // retourne la langue active
  isRTL()                 // true si lang === 'ar'
  isLoaded()              // true après init()
  getSupportedLangs()     // ['fr','en','es','ar','de']
  formatPrice(amount, currency) // Intl.NumberFormat selon la locale active
}
```

## Règles RTL (Arabe — lang="ar", dir="rtl")
Le CSS RTL est déjà dans `src/css/styles.css`. Ne pas dupliquer.
La font Noto Sans Arabic est chargée dynamiquement par `i18n.js` sur `setLang('ar')`.

```css
/* Déjà en place dans styles.css — vérifier si tu ajoutes des composants */
[dir="rtl"] .topbar   { flex-direction: row-reverse; }
[dir="rtl"] .btn-back { flex-direction: row-reverse; }
[dir="rtl"] .ph       { flex-direction: row-reverse; }
[dir="rtl"] .conseil  { text-align: right; }
```

## Ajouter l'allemand (DE) — workflow
1. Copier le bloc `"es"` dans translations.json comme base de structure
2. Traduire chaque valeur (ne pas utiliser traduction automatique brute — relire)
3. Vérifier avec `python3 scripts/validate-translations.py`
4. Ajouter `de: { dir: 'ltr', font: null }` dans SUPPORTED_LANGS de i18n.js
5. Mettre à jour ce CLAUDE.md (tableau langues + statut)

## Ajouter une nouvelle clé — workflow
1. Ajouter la clé en `fr` dans translations.json
2. Ajouter la clé en `en`, `es`, `ar` dans le même commit
3. Utiliser dans ui.js via `I18n.t('section.nouvelle_cle')`
4. Valider: `python3 scripts/validate-translations.py`

## Validation — script automatique
```bash
python3 scripts/validate-translations.py
# Vérifie: JSON valide, clés FR présentes en EN/ES/AR, aucune valeur vide en FR/EN
```

Le hook PostToolUse dans `.claude/settings.json` lance ce script automatiquement à chaque modification de translations.json.

## Interdictions
- Ne jamais hardcoder du texte visible dans `ui.js` — tout passe par `I18n.t()`
- Ne jamais supprimer une clé existante (ça casse toutes les langues)
- Ne jamais restructurer le JSON (les clés sont référencées par nom exact dans i18n.js et ui.js)
- Ne jamais modifier `src/js/ui.js` ni `src/css/styles.css` (hors périmètre)

## MCP Servers assignés

| Serveur | Usage dans ce périmètre |
|---------|------------------------|
| `filesystem` | Lire/écrire `translations.json` et `i18n.js` |
| `fetch` | Vérifier les termes skincare dans d'autres langues (dictionnaires INCI, terminologie beauté locale), consulter des refs linguistiques |
