# SkinMatch — Règles globales pour tous les agents

## Contexte projet
Application web mobile-first de recommandation skincare personnalisée.
Single HTML file transformée en projet structuré avec agents spécialisés.
Stack: HTML/CSS/JS vanilla + Supabase (backend) + TensorFlow.js (AI scan) + Vercel (deploy)

## Ownership des fichiers — RÈGLE ABSOLUE
Chaque fichier appartient à UN SEUL agent. Ne jamais toucher un fichier hors de ton périmètre.

| Fichier / Dossier         | Agent propriétaire     |
|---------------------------|------------------------|
| src/js/algorithm.js       | Agent Algorithm        |
| src/data/products.json    | Agent Products         |
| src/data/routes.json      | Agent Algorithm        |
| src/js/scan.js            | Agent AI-Scan          |
| src/css/styles.css        | Agent Frontend         |
| src/index.html            | Agent Frontend         |
| src/js/ui.js              | Agent Frontend         |
| src/js/i18n.js            | Agent Localization     |
| src/data/translations.json| Agent Localization     |
| tests/                    | Agent QA               |
| .github/                  | Agent DevOps           |
| supabase/                 | Agent Backend          |

## Workflow obligatoire avant toute modification
1. Lire le fichier cible EN ENTIER
2. Vérifier TASKS.md → personne d'autre ne travaille dessus
3. Modifier UNIQUEMENT ce qui est dans ton périmètre
4. Mettre à jour TASKS.md après modification
5. Relancer les tests de ton périmètre

## Format TASKS.md
```
[AGENT] [STATUS] [FICHIER] Description courte
Status: TODO | IN_PROGRESS | DONE | BLOCKED
Exemple: [ALGORITHM] [DONE] [algorithm.js] Scoring système implémenté
```

## Sécurité — NON NÉGOCIABLE
- Jamais de clé API en dur dans le code → utiliser les variables d'environnement
- Jamais de données utilisateur loggées en clair
- Jamais de photo uploadée côté serveur sans consentement explicite affiché
- RLS (Row Level Security) activé sur toutes les tables Supabase

## Qualité code
- Pas de commentaires évidents ("// incrémenter le compteur")
- Pas de console.log en production (uniquement en dev avec flag DEBUG)
- Pas de magic numbers → constantes nommées
- Mobile-first toujours (tester à 375px minimum)

## Structure des données produit (référence)
```json
{
  "id": "string (slug unique)",
  "nom": "string",
  "marque": "string",
  "prix": "string (ex: '19€')",
  "prix_num": "number",
  "prix_structured": { "fr": number, "gb": number|null, "us": number|null },
  "link_structured": { "fr": "url", "gb": "url|null", "us": "url|null" },
  "yuka": "number (0-100)",
  "moment": "AM | PM | AM+PM",
  "clean": "boolean",
  "vegan": "boolean",
  "ak": ["actif 1", "actif 2"],
  "comp": ["INCI 1", "INCI 2"],
  "img": "url|null",
  "deprecated": "boolean"
}
```
