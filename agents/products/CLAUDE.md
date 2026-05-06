# Agent Products — SkinMatch

## Périmètre STRICT
- `src/data/products.json` (115 produits — objet JSON, clé = ID slug)

## Mission
Maintenir, enrichir et étendre le catalogue produits. Tu es le gardien de la qualité des données.

## Structure réelle du fichier
```json
{
  "cs-power": { ... },
  "lrp-effgel": { ... },
  ...
}
```
C'est un **objet** (pas un tableau). La clé est l'ID slug du produit.

## Schéma complet — CHAQUE produit DOIT avoir ces champs

```json
{
  "id":           "marque-slug",
  "nom":          "Nom Commercial",
  "marque":       "Marque",
  "prix":         "19€",
  "prix_num":     19,
  "prix_structured": { "fr": 19, "gb": null, "us": null },
  "link":         "url-principale-fr",
  "link_structured": {
    "fr": "https://easypara.fr/...",
    "gb": null,
    "us": null
  },
  "yuka":    74,
  "yl":      "Bon",
  "usage":   "Description courte de l'usage",
  "texture": "Crème légère",
  "moment":  "AM+PM",
  "clean":   false,
  "vegan":   false,
  "ak":      ["Actif 1 + concentration", "Actif 2"],
  "comp":    ["INCI Name 1", "INCI Name 2"],
  "pq":      "Pour qui: description du profil cible",
  "ben":     "Bénéfice principal en français",
  "ben_en":  "Main benefit in English",
  "app":     "Comment l'appliquer (FR)",
  "img":     "https://url-image.jpg",
  "deprecated": false,

  "skinTypes":   ["seche", "normale", "sensible"],
  "concerns":    ["deshydratation", "rides"],
  "ageGroups":   ["26-35", "36-45", "plus-45"],
  "budgetTier":  "mid",
  "allergenes":  ["parfum"],
  "stepType":    "hydratant"
}
```

## Valeurs autorisées pour chaque champ

| Champ | Valeurs |
|-------|---------|
| `moment` | `"AM"` \| `"PM"` \| `"AM+PM"` |
| `budgetTier` | `"low"` \| `"mid"` \| `"high"` |
| `stepType` | `"nettoyant"` \| `"tonique"` \| `"serum"` \| `"contour_yeux"` \| `"hydratant"` \| `"spf"` \| `"masque"` \| `"exfoliant"` |
| `skinTypes` | sous-ensemble de `["seche","grasse","mixte","normale","sensible"]` |
| `ageGroups` | sous-ensemble de `["moins-25","26-35","36-45","plus-45"]` |
| `yuka` | entier 0-100 |

## Fourchettes budgetTier
| Tier | Prix |
|------|------|
| low  | < 20€ |
| mid  | 20€ – 60€ |
| high | > 60€ |

## Priorité d'enrichissement (champs manquants sur certains produits)

1. `ben_en` — bénéfice en anglais (vide sur ~60% des produits)
2. `link_structured.gb` — lien Boots/LookFantastic UK
3. `link_structured.us` — lien Sephora/Dermstore US
4. `prix_structured.gb` et `prix_structured.us` — prix locaux

## Sources de vérification (utiliser WebSearch/WebFetch)
| Marché | Sites de référence |
|--------|-------------------|
| France | easypara.fr, pharmacielevillage.com, para-club.fr, sephora.fr |
| UK | boots.com, lookfantastic.com, feelunique.com |
| US | sephora.com, dermstore.com, amazon.com |
| INCI | incidecoder.com, cosdna.com |
| Scores | yuka.io (app mobile), notino.fr |

## Workflow ajout d'un nouveau produit
1. Vérifier que l'ID n'existe pas (chercher dans products.json)
2. Construire l'ID : `{marque-abrégée}-{slug-produit}` (ex: `lrp-effgel`)
3. WebSearch → récupérer prix, INCI, description officiels
4. Remplir TOUS les champs du schéma (pas de champs manquants)
5. Valider : `python3 scripts/validate-products.py`
6. Mettre à jour TASKS.md

## Validation automatique
Le hook PostToolUse dans `.claude/settings.json` lance automatiquement
`python3 scripts/validate-products.py` à chaque modification du fichier.

Vérifications effectuées :
- JSON valide
- Tous les champs requis présents
- `moment` dans les valeurs autorisées
- `yuka` entre 0 et 100
- `budgetTier` dans low/mid/high
- `prix_num` positif

## Règles métier
- Ne jamais supprimer un produit → mettre `"deprecated": true`
- Si le prix change de plus de 20% → vérifier sur 2 sources minimum
- `comp` (INCI) en anglais uniquement (standard international INCI)
- `ak` (actifs clés) en français pour le marché FR
- Toujours inclure la concentration dans les `ak` si connue (ex: `"Niacinamide 5%"`)
- `yuka` : score officiel si disponible, sinon estimation basée sur la formule INCI

## Interdictions
- Ne jamais modifier `src/data/routes.json` (périmètre Agent Algorithm)
- Ne jamais ajouter de logique JS dans products.json (c'est de la data pure)
- Ne jamais mettre de `prix_num` négatif ou nul pour un produit actif
- Ne jamais changer la structure de l'objet (clé = ID slug) en tableau
