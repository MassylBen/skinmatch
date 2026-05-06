# Agent AI-Scan — SkinMatch

## Périmètre STRICT
- `src/js/scan.js`
- `src/js/models/` (modèles TensorFlow.js)

## État actuel — Phase 1 IMPLÉMENTÉE ✅, Phase 2 PRÊTE ⏳
```
src/js/scan.js — 458 lignes
  Phase 1 : analyse Canvas API par zones faciales (opérationnelle)
  Phase 2 : inférence TF.js (code prêt, attend le modèle entraîné)
```

## Architecture en place

```
[Flux caméra frontale getUserMedia()]
       ↓ startCamera(videoEl)
[Frame capturée 224×224 via Canvas API]
       ↓ _captureFrame(videoEl)
[Analyse 5 zones faciales]
   front / nez / joue_g / joue_d / menton
       ↓ _analyzeZones(canvas)
   → brightness, oiliness, redness par zone

[Si TF.js + modèle disponibles]  [Sinon: Phase 1]
       ↓ _tfInference()               ↓ _inferSkinType()
[Prediction 5 classes]         [Heuristiques couleur]
       ↓
[Métriques globales: hydration, glow, texture]
       ↓ _inferMetrics()
[Résultat ScanResult]
       ↓ stopCamera()  ← caméra fermée immédiatement
[canvas.width=0] ← pixels détruits
```

## API publique — window.SkinScan (NE PAS CHANGER les signatures)

```js
/**
 * @typedef {Object} ScanResult
 * @property {string}  skinType    — 'seche'|'grasse'|'mixte'|'normale'|'sensible'
 * @property {Object}  proba       — { seche:12, grasse:65, mixte:15, normale:5, sensible:3 }
 * @property {number}  hydration   — 0-100
 * @property {number}  glow        — 0-100
 * @property {number}  texture     — 0-100
 * @property {string}  confidence  — 'high'|'medium'|'low'
 * @property {boolean} usedModel   — true si TF.js utilisé, false si Phase 1
 * @property {Object}  zones       — métriques brutes par zone
 */

SkinScan.analyze(videoEl, declaredProfile)  // → Promise<ScanResult>
SkinScan.startCamera(videoEl)               // → Promise<MediaStream>
SkinScan.stopCamera(videoEl)                // → void (libère la caméra)
SkinScan.startScanFlow(callbacks)           // → flow complet avec progression
SkinScan.preloadModel()                     // → void (préchargement background)
SkinScan.hasModel()                         // → boolean
```

## startScanFlow — callbacks attendus
```js
SkinScan.startScanFlow({
  onResult:   (result) => { /* ScanResult */ },
  onError:    (msg)    => { /* string lisible par l'user */ },
  onProgress: (pct)   => { /* 0-100 */ },
});

// Éléments HTML attendus dans index.html:
// id="scan-video"    — <video autoplay playsinline>
// id="scan-canvas"   — <canvas> (optionnel, pour visualisation)
// id="scan-status"   — <div> affichant l'état
```

## Phase 2 — Entraîner le modèle TF.js

Le code d'inférence est prêt dans _tfInference(). Il attend un modèle à :
```
/src/js/models/skin-classifier/model.json
/src/js/models/skin-classifier/weights.bin
```

### Specs du modèle
- Architecture : MobileNetV2 fine-tuné (transfer learning)
- Input : 224×224×3, normalisé [-1, 1]
- Output : 5 classes softmax (seche / grasse / mixte / normale / sensible)
- Taille cible : < 8MB (quantisation int8)
- Performances cibles : < 2s d'inférence sur mobile mid-range

### Dataset recommandé
- Kaggle "Skin Type Classification Dataset" (photos selfies labellisées)
- Minimum 500 images par classe (2500 total)
- Augmentation : flip horizontal, rotation ±15°, brightness ±20%

### Conversion pour TF.js
```python
# Après entraînement avec Keras/Python:
import tensorflowjs as tfjs
tfjs.converters.save_keras_model(model, '/src/js/models/skin-classifier/')
```

## Contraintes privacy — NON NÉGOCIABLES
1. Aucun envoi réseau de l'image — vérifier: aucun fetch avec données binaires
2. Canvas détruit après analyse : canvas.width = 0; canvas.height = 0;
3. Caméra fermée immédiatement après la capture (pas de stream persistant)
4. Disclaimer affiché AVANT ouverture caméra (à implémenter côté UI)

## Performance cible
| Métrique | Cible |
|----------|-------|
| Chargement modèle | < 3s sur 4G |
| Analyse Phase 1 | < 500ms |
| Analyse Phase 2 (TF.js) | < 2s |
| Empreinte mémoire TF | < 50MB |

## Interdictions
- Aucun fetch/XHR avec des données d'image (zéro upload)
- Aucun localStorage de pixels ou résultats d'analyse
- Jamais bloquer le thread principal — toujours async/await
- Ne jamais modifier src/js/ui.js, src/js/auth.js, src/js/db.js (hors périmètre)

## MCP Servers assignés

| Serveur | Usage dans ce périmètre |
|---------|------------------------|
| `filesystem` | Lire/écrire `scan.js` et `src/js/models/` |
| `fetch` | Consulter la doc TF.js, télécharger des specs de modèles MobileNetV2, chercher des datasets Kaggle |
| `sequential-thinking` | Raisonner sur l'architecture ML (choix quantisation, pipeline d'inférence, seuils de confiance) |
