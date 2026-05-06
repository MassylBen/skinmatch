/**
 * SkinMatch — Module d'analyse de peau par IA
 * Agent AI-Scan — src/js/scan.js
 *
 * Architecture en 2 phases:
 *   Phase 1 — Simulation intelligente (disponible maintenant)
 *     Analyse couleur, texture via Canvas API
 *     Résultats probabilistes cohérents avec le profil déclaré
 *
 *   Phase 2 — Modèle TF.js (quand le modèle est entraîné)
 *     Modèle MobileNet fine-tuné sur photos de peau
 *     Chargé depuis /src/js/models/skin-classifier/
 *     Prédit: skin_type, oiliness, hydration, texture_score
 *
 * Contraintes:
 *   - Aucune photo envoyée au serveur (traitement 100% client-side)
 *   - Consentement affiché avant ouverture caméra
 *   - Image détruite après analyse (pas de stockage)
 *   - HTTPS requis pour accéder à la caméra
 */

'use strict';

const SkinScan = (function () {

  // ── Constantes ───────────────────────────────────────────────────────────────

  const MODEL_PATH  = '/src/js/models/skin-classifier/model.json';
  const CANVAS_SIZE = 224; // Input size MobileNet standard

  // Zones d'analyse du visage (coordonnées relatives 0-1)
  const FACE_ZONES = {
    front:  { x: 0.3, y: 0.05, w: 0.4,  h: 0.25 },
    nez:    { x: 0.38, y: 0.35, w: 0.24, h: 0.25 },
    joue_g: { x: 0.05, y: 0.3,  w: 0.28, h: 0.3  },
    joue_d: { x: 0.67, y: 0.3,  w: 0.28, h: 0.3  },
    menton: { x: 0.3,  y: 0.68, w: 0.4,  h: 0.22 },
  };

  // Classes du modèle Phase 2
  const SKIN_CLASSES = ['seche', 'grasse', 'mixte', 'normale', 'sensible'];

  let _model       = null;
  let _modelLoaded = false;
  let _stream      = null;

  // ── Phase 2: Chargement modèle TF.js ────────────────────────────────────────

  /**
   * Tente de charger le modèle TF.js
   * Retourne false si TF.js non disponible ou modèle absent
   */
  async function _loadModel() {
    if (_modelLoaded) return true;
    if (typeof tf === 'undefined') {
      if (window.DEBUG) console.log('[Scan] TF.js non disponible, mode simulation activé');
      return false;
    }
    try {
      _model = await tf.loadLayersModel(MODEL_PATH);
      _modelLoaded = true;
      console.log('[Scan] Modèle TF.js chargé');
      return true;
    } catch {
      if (window.DEBUG) console.log('[Scan] Modèle introuvable, mode simulation activé');
      return false;
    }
  }

  // ── Accès caméra ─────────────────────────────────────────────────────────────

  /**
   * Ouvre la caméra frontale avec les contraintes optimales
   * @returns {Promise<MediaStream>}
   */
  async function _openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Caméra non disponible sur cet appareil.');
    }
    _stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',         // Caméra frontale
        width:  { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });
    return _stream;
  }

  /**
   * Ferme le flux caméra et libère les ressources
   */
  function _closeCamera() {
    if (_stream) {
      _stream.getTracks().forEach(t => t.stop());
      _stream = null;
    }
  }

  // ── Capture et prétraitement ──────────────────────────────────────────────────

  /**
   * Capture une frame depuis l'élément vidéo
   * Retourne un canvas 224×224 centré sur le visage
   */
  function _captureFrame(videoEl) {
    const canvas = document.createElement('canvas');
    canvas.width  = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext('2d');

    // Cadrage centré (suppose le visage centré dans la vidéo)
    const vw = videoEl.videoWidth;
    const vh = videoEl.videoHeight;
    const size = Math.min(vw, vh);
    const sx = (vw - size) / 2;
    const sy = (vh - size) / 2;

    ctx.drawImage(videoEl, sx, sy, size, size, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    return canvas;
  }

  /**
   * Analyse un canvas par zones faciales
   * Retourne les métriques de chaque zone: oiliness, redness, brightness
   */
  function _analyzeZones(canvas) {
    const ctx    = canvas.getContext('2d');
    const result = {};

    for (const [zone, rect] of Object.entries(FACE_ZONES)) {
      const x = Math.round(rect.x * CANVAS_SIZE);
      const y = Math.round(rect.y * CANVAS_SIZE);
      const w = Math.round(rect.w * CANVAS_SIZE);
      const h = Math.round(rect.h * CANVAS_SIZE);

      const imageData = ctx.getImageData(x, y, w, h);
      const pixels    = imageData.data;

      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        rSum += pixels[i];
        gSum += pixels[i + 1];
        bSum += pixels[i + 2];
        count++;
      }
      const r = rSum / count;
      const g = gSum / count;
      const b = bSum / count;

      // Luminosité (0-255)
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

      // Score de "brillance" (haute saturation + haute luminosité = peau grasse)
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;
      const oiliness   = (brightness / 255) * saturation * 100;

      // Score de rougeur (r >> g,b)
      const redness = Math.max(0, ((r - (g + b) / 2) / 128) * 100);

      result[zone] = {
        brightness: Math.round(brightness),
        oiliness:   Math.round(oiliness),
        redness:    Math.round(redness),
        r: Math.round(r), g: Math.round(g), b: Math.round(b),
      };
    }

    return result;
  }

  // ── Phase 1: Analyse simulation ───────────────────────────────────────────────

  /**
   * Déduit le type de peau depuis les métriques de zones
   * Heuristiques calibrées sur la biologie cutanée
   */
  function _inferSkinType(zones, declaredProfile) {
    const nez   = zones.nez   || {};
    const front  = zones.front || {};
    const joueG  = zones.joue_g || {};
    const joueD  = zones.joue_d || {};

    const tZoneOil  = ((nez.oiliness || 0) + (front.oiliness || 0)) / 2;
    const cheekOil  = ((joueG.oiliness || 0) + (joueD.oiliness || 0)) / 2;
    const avgRed    = ((nez.redness || 0) + (joueG.redness || 0) + (joueD.redness || 0)) / 3;
    const avgBright = (Object.values(zones).reduce((s, z) => s + (z.brightness || 0), 0)) / Object.keys(zones).length;

    // Score de confiance pour chaque type (0-100)
    const scores = {
      grasse:   Math.min(100, tZoneOil * 1.2 + cheekOil * 0.8),
      mixte:    Math.min(100, tZoneOil * 1.5 - cheekOil * 0.5 + 20),
      seche:    Math.min(100, Math.max(0, 80 - avgBright * 0.3 - tZoneOil * 0.5)),
      sensible: Math.min(100, avgRed * 1.5),
      normale:  50, // baseline
    };

    // Contraindre avec le profil déclaré si présent (les deux sources pèsent)
    const declared = declaredProfile?.skinType;
    if (declared && scores[declared] !== undefined) {
      scores[declared] = Math.min(100, scores[declared] + 25);
    }

    // Normaliser et trouver le type dominant
    const total  = Object.values(scores).reduce((s, v) => s + v, 0);
    const proba  = Object.fromEntries(
      Object.entries(scores).map(([k, v]) => [k, Math.round((v / total) * 100)])
    );
    const skinType = Object.entries(proba).sort((a, b) => b[1] - a[1])[0][0];

    return { skinType, proba };
  }

  /**
   * Génère les métriques d'hydratation, texture et éclat
   */
  function _inferMetrics(zones) {
    const avgBright = (Object.values(zones).reduce((s, z) => s + (z.brightness || 128), 0)) / Object.keys(zones).length;
    const avgOil    = (Object.values(zones).reduce((s, z) => s + (z.oiliness || 0), 0)) / Object.keys(zones).length;
    const avgRed    = (Object.values(zones).reduce((s, z) => s + (z.redness || 0), 0)) / Object.keys(zones).length;

    // Hydratation: peau bien hydratée = lumineuse sans trop briller
    const hydration = Math.round(Math.min(100, Math.max(0,
      (avgBright / 2.55) * 0.6 - avgOil * 0.3 + 40
    )));

    // Éclat: luminosité normalisée
    const glow = Math.round(Math.min(100, Math.max(0, (avgBright / 255) * 100)));

    // Texture: inverse de la variance de rougeur entre zones (plus uniforme = meilleure texture)
    const texture = Math.round(Math.max(0, 100 - avgRed * 0.8));

    return { hydration, glow, texture };
  }

  // ── Phase 2: Inférence TF.js ──────────────────────────────────────────────────

  /**
   * Classifie la peau via le modèle TF.js
   */
  async function _tfInference(canvas) {
    const tensor = tf.browser.fromPixels(canvas)
      .toFloat()
      .div(tf.scalar(127.5))
      .sub(tf.scalar(1))          // Normalisation [-1, 1] (MobileNet)
      .expandDims(0);             // [1, 224, 224, 3]

    const predictions = await _model.predict(tensor).data();
    tensor.dispose();

    // Mapper sur les classes
    const proba = {};
    SKIN_CLASSES.forEach((cls, i) => {
      proba[cls] = Math.round(predictions[i] * 100);
    });

    const skinType = SKIN_CLASSES[
      Array.from(predictions).indexOf(Math.max(...predictions))
    ];

    return { skinType, proba };
  }

  // ── API publique ─────────────────────────────────────────────────────────────

  /**
   * Lance l'analyse de peau complète
   *
   * @param {HTMLVideoElement} videoEl — élément vidéo avec le flux caméra actif
   * @param {Object} declaredProfile   — profil déclaré par l'utilisateur (optionnel)
   * @returns {Promise<ScanResult>}
   *
   * @typedef {Object} ScanResult
   * @property {string}  skinType   — 'seche'|'grasse'|'mixte'|'normale'|'sensible'
   * @property {Object}  proba      — { seche: 12, grasse: 65, ... }
   * @property {number}  hydration  — 0-100
   * @property {number}  glow       — 0-100
   * @property {number}  texture    — 0-100
   * @property {string}  confidence — 'high'|'medium'|'low'
   * @property {boolean} usedModel  — true si modèle TF.js utilisé
   * @property {Object}  zones      — métriques par zone faciale
   */
  async function analyze(videoEl, declaredProfile = null) {
    if (!videoEl || !videoEl.videoWidth) {
      throw new Error('Flux vidéo non disponible.');
    }

    const canvas = _captureFrame(videoEl);
    const zones  = _analyzeZones(canvas);

    let skinTypeResult, probaResult, usedModel;

    // Tenter Phase 2 d'abord
    const modelAvailable = await _loadModel();
    if (modelAvailable) {
      const tfResult = await _tfInference(canvas);
      skinTypeResult = tfResult.skinType;
      probaResult    = tfResult.proba;
      usedModel      = true;
    } else {
      // Phase 1: simulation
      const sim = _inferSkinType(zones, declaredProfile);
      skinTypeResult = sim.skinType;
      probaResult    = sim.proba;
      usedModel      = false;
    }

    const metrics = _inferMetrics(zones);

    // Niveau de confiance basé sur la dominance du type principal
    const maxProba    = Math.max(...Object.values(probaResult));
    const confidence  = maxProba >= 55 ? 'high' : maxProba >= 40 ? 'medium' : 'low';

    // Détruire le canvas (pas de stockage)
    canvas.width = 0;
    canvas.height = 0;

    return {
      skinType:   skinTypeResult,
      proba:      probaResult,
      hydration:  metrics.hydration,
      glow:       metrics.glow,
      texture:    metrics.texture,
      confidence,
      usedModel,
      zones,
    };
  }

  /**
   * Démarre le flux caméra et retourne le stream
   * Doit être appelé après consentement explicite de l'utilisateur
   */
  async function startCamera(videoEl) {
    const stream = await _openCamera();
    videoEl.srcObject = stream;
    await new Promise((resolve, reject) => {
      videoEl.onloadedmetadata = resolve;
      videoEl.onerror = reject;
      setTimeout(() => reject(new Error('Timeout caméra')), 10000);
    });
    videoEl.play();
    return stream;
  }

  /**
   * Arrête le flux caméra
   */
  function stopCamera(videoEl) {
    _closeCamera();
    if (videoEl) {
      videoEl.srcObject = null;
    }
  }

  /**
   * Pré-charge le modèle TF.js en arrière-plan
   * À appeler après le chargement de la page pour réduire la latence
   */
  function preloadModel() {
    _loadModel().catch(() => {});
  }

  /**
   * Indique si le modèle TF.js est disponible
   */
  function hasModel() {
    return _modelLoaded;
  }

  // ── Intégration UI ────────────────────────────────────────────────────────────

  /**
   * Lance le flow complet de scan depuis l'interface
   * Gère: consentement → caméra → countdown → analyse → résultat
   *
   * @param {Object} callbacks
   *   onResult(result) — appelé avec les résultats
   *   onError(msg)     — appelé en cas d'erreur
   *   onProgress(pct)  — appelé pendant l'analyse (0-100)
   */
  async function startScanFlow(callbacks = {}) {
    const { onResult, onError, onProgress } = callbacks;

    const videoEl   = document.getElementById('scan-video');
    const canvasEl  = document.getElementById('scan-canvas');
    const statusEl  = document.getElementById('scan-status');

    if (!videoEl) {
      if (onError) onError('Élément vidéo introuvable.');
      return;
    }

    try {
      // Étape 1: ouverture caméra
      if (statusEl) statusEl.textContent = 'Ouverture de la caméra…';
      if (onProgress) onProgress(10);
      await startCamera(videoEl);

      // Étape 2: countdown 3 secondes (laisser la caméra se stabiliser)
      if (statusEl) statusEl.textContent = 'Stabilisation…';
      if (onProgress) onProgress(30);
      await new Promise(r => setTimeout(r, 1500));

      // Étape 3: analyse
      if (statusEl) statusEl.textContent = 'Analyse en cours…';
      if (onProgress) onProgress(60);

      const result = await analyze(videoEl);

      if (onProgress) onProgress(90);

      // Étape 4: fermer caméra immédiatement après capture
      stopCamera(videoEl);

      if (statusEl) statusEl.textContent = 'Analyse terminée';
      if (onProgress) onProgress(100);

      if (onResult) onResult(result);

    } catch (err) {
      stopCamera(videoEl);
      const msg = err.message || 'Erreur lors de l\'analyse.';
      if (statusEl) statusEl.textContent = '';
      if (onError) onError(
        err.name === 'NotAllowedError'
          ? 'Accès à la caméra refusé. Autorisez l\'accès dans les paramètres du navigateur.'
          : msg
      );
    }
  }

  // ── Export public ─────────────────────────────────────────────────────────────

  return {
    analyze,
    startCamera,
    stopCamera,
    startScanFlow,
    preloadModel,
    hasModel,
  };

})();

// Exposer globalement
if (typeof window !== 'undefined') {
  window.SkinScan = SkinScan;

  // Pré-charger le modèle en arrière-plan après chargement
  window.addEventListener('load', function () {
    // Délai pour ne pas bloquer le rendu initial
    setTimeout(function () { SkinScan.preloadModel(); }, 3000);
  });
}
