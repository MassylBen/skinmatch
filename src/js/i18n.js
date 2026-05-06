/**
 * SkinMatch — Module d'internationalisation
 * Agent Localization — src/js/i18n.js
 *
 * Remplace l'objet T inline par un chargement depuis translations.json
 * Supporte: fr, en | Prévu: ar (RTL), es, de
 */

'use strict';

const I18n = (function () {

  let _lang = 'fr';
  let _translations = {};
  let _loaded = false;

  // Langues supportées et sens d'écriture
  const SUPPORTED_LANGS = {
    fr: { dir: 'ltr', font: null },
    en: { dir: 'ltr', font: null },
    ar: { dir: 'rtl', font: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap' },
    es: { dir: 'ltr', font: null },
    de: { dir: 'ltr', font: null },
  };

  // ── Chargement ──────────────────────────────────────────────────────────────

  /**
   * Initialise le module depuis translations.json
   * À appeler au démarrage de l'app, avant tout rendu UI
   */
  async function init(lang) {
    try {
      const response = await fetch('/src/data/translations.json');
      if (!response.ok) throw new Error('translations.json introuvable');
      _translations = await response.json();
      _loaded = true;
    } catch (err) {
      console.warn('[i18n] Chargement JSON échoué, fallback sur objet T inline:', err.message);
      // Fallback: utiliser l'objet T défini dans data-legacy.js si disponible
      if (typeof T !== 'undefined') {
        _translations = T;
        _loaded = true;
      }
    }

    if (lang) setLang(lang);
    return _loaded;
  }

  // ── Changement de langue ────────────────────────────────────────────────────

  /**
   * Change la langue active et met à jour le DOM
   */
  function setLang(lang) {
    if (!SUPPORTED_LANGS[lang]) {
      console.warn(`[i18n] Langue '${lang}' non supportée, fallback 'fr'`);
      lang = 'fr';
    }

    // Vérifier que la traduction existe
    if (_loaded && !_translations[lang]) {
      console.warn(`[i18n] Traduction '${lang}' absente, fallback 'fr'`);
      lang = 'fr';
    }

    _lang = lang;

    // Mettre à jour le HTML
    const config = SUPPORTED_LANGS[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir  = config.dir;

    // Charger la font spéciale si nécessaire (ex: arabe)
    if (config.font && !document.querySelector(`link[href="${config.font}"]`)) {
      const link = document.createElement('link');
      link.rel  = 'stylesheet';
      link.href = config.font;
      document.head.appendChild(link);
    }

    // Notifier l'UI pour re-render
    document.dispatchEvent(new CustomEvent('skinmatch:langchange', {
      detail: { lang, dir: config.dir }
    }));
  }

  // ── Traduction ──────────────────────────────────────────────────────────────

  /**
   * Récupère une valeur de traduction par clé pointée
   *
   * @param {string} key   — clé en notation pointée: 'ui.btn_start', 'skin_types.grasse.label'
   * @param {Object} vars  — variables à interpoler: { skin: 'grasse', age: '26-35' }
   * @returns {string}
   *
   * @example
   * t('ui.btn_start')                           → "Commencer mon diagnostic"
   * t('ui.intro_tpl', { skin: 'grasse' })       → "Votre routine sur-mesure pour une peau grasse..."
   * t('skin_types.grasse.label')                → "Grasse"
   */
  function t(key, vars = {}) {
    const keys    = key.split('.');
    const langData = _translations[_lang] || _translations['fr'] || {};
    const frData   = _translations['fr']  || {};

    // Chercher dans la langue active, puis fallback FR
    function resolve(obj, ks) {
      let v = obj;
      for (const k of ks) {
        if (v == null) return undefined;
        v = v[k];
      }
      return v;
    }

    let value = resolve(langData, keys);
    if (value === undefined) value = resolve(frData, keys);
    if (value === undefined) {
      console.warn(`[i18n] Clé manquante: '${key}' (lang: ${_lang})`);
      return key; // Retourner la clé comme fallback visible
    }

    if (typeof value !== 'string') return value;

    // Interpolation des variables: {skin}, {age}, etc.
    return value.replace(/\{(\w+)\}/g, (_, k) => {
      return vars[k] !== undefined ? vars[k] : `{${k}}`;
    });
  }

  /**
   * Récupère une section entière (array ou objet)
   * Utile pour les listes: ages, concerns, budgets, routines
   *
   * @param {string} key — ex: 'ages', 'concerns', 'budgets'
   * @returns {Array|Object}
   */
  function tList(key) {
    const langData = _translations[_lang] || _translations['fr'] || {};
    const frData   = _translations['fr']  || {};
    return langData[key] ?? frData[key] ?? [];
  }

  // ── Helpers raccourcis ──────────────────────────────────────────────────────

  function getLang()           { return _lang; }
  function isRTL()             { return SUPPORTED_LANGS[_lang]?.dir === 'rtl'; }
  function isLoaded()          { return _loaded; }
  function getSupportedLangs() { return Object.keys(SUPPORTED_LANGS); }

  /**
   * Formate un prix selon la locale
   */
  function formatPrice(amount, currency = 'EUR') {
    const localeMap = { fr: 'fr-FR', en: 'en-GB', ar: 'ar-SA', es: 'es-ES', de: 'de-DE' };
    const locale = localeMap[_lang] || 'fr-FR';
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency', currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${amount}€`;
    }
  }

  // ── Export public ───────────────────────────────────────────────────────────

  return { init, setLang, t, tList, getLang, isRTL, isLoaded, formatPrice, getSupportedLangs };

})();

// ── Intégration avec l'app existante ─────────────────────────────────────────
// Remplace la fonction globale t() utilisée partout dans ui.js
// On wrappe pour compatibilité : si I18n est chargé on l'utilise, sinon l'ancien T
if (typeof window !== 'undefined') {
  window.I18n = I18n;

  // Surcharge de la fonction t() globale legacy
  // (définie dans data-legacy.js comme: function t(key){ return T[LANG][key] ... })
  // On attend que le DOM soit prêt avant de surcharger
  document.addEventListener('DOMContentLoaded', function () {
    // Initialiser I18n avec la langue courante
    const currentLang = (typeof LANG !== 'undefined') ? LANG : 'fr';
    I18n.init(currentLang).then(function (loaded) {
      if (loaded) {
        console.log(`[i18n] Initialisé — langue: ${I18n.getLang()}, RTL: ${I18n.isRTL()}`);
      }
    });
  });
}

// Export Node.js (pour les tests Vitest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18n;
}
