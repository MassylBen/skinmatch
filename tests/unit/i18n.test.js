/**
 * Tests unitaires — Module i18n
 * Agent QA — tests/unit/i18n.test.js
 *
 * Teste: init, setLang, t, tList, formatPrice, isRTL
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';

// Mock fetch pour les tests (pas de serveur HTTP)
const MOCK_TRANSLATIONS = {
  fr: {
    ui: {
      btn_start:  'Commencer mon diagnostic',
      intro_tpl:  'Votre routine sur-mesure pour une peau {skin}.',
      btn_retry:  'Réessayer',
    },
    skin_types: {
      grasse:  { label: 'Grasse',  desc: 'Excès de sébum' },
      seche:   { label: 'Sèche',   desc: 'Manque de lipides' },
      mixte:   { label: 'Mixte',   desc: 'Zone T grasse' },
      normale: { label: 'Normale', desc: 'Équilibrée' },
    },
    ages: [
      { value: 'moins-25', label: 'Moins de 25 ans' },
      { value: '26-35',    label: '26–35 ans' },
    ],
  },
  en: {
    ui: {
      btn_start: 'Start my diagnostic',
      intro_tpl: 'Your personalized routine for {skin} skin.',
      btn_retry: 'Retry',
    },
    skin_types: {
      grasse:  { label: 'Oily',   desc: 'Excess sebum' },
      seche:   { label: 'Dry',    desc: 'Lacks lipids' },
      mixte:   { label: 'Combo',  desc: 'T-zone oily' },
      normale: { label: 'Normal', desc: 'Balanced' },
    },
    ages: [
      { value: 'moins-25', label: 'Under 25' },
      { value: '26-35',    label: '26–35' },
    ],
  },
};

// Simuler un environnement browser minimal pour i18n.js
globalThis.window    = globalThis;
globalThis.document  = {
  documentElement: { lang: 'fr', dir: 'ltr' },
  createElement: () => ({ rel: '', href: '', rel: '' }),
  head: { appendChild: vi.fn() },
  addEventListener:  vi.fn(),
  dispatchEvent:     vi.fn(),
  querySelector:     vi.fn(() => null),
};

// Mock fetch
globalThis.fetch = vi.fn(() => Promise.resolve({
  ok:   true,
  json: () => Promise.resolve(MOCK_TRANSLATIONS),
}));

let I18n;

beforeAll(async () => {
  // Charger i18n.js (CommonJS export)
  const { createRequire } = await import('module');
  const req = createRequire(import.meta.url);
  I18n = req('../../src/js/i18n.js');
  await I18n.init('fr');
});

// ─── init ─────────────────────────────────────────────────────────────────────

describe('I18n.init', () => {
  it('marque le module comme chargé après init', () => {
    expect(I18n.isLoaded()).toBe(true);
  });

  it('définit la langue par défaut à fr', () => {
    expect(I18n.getLang()).toBe('fr');
  });
});

// ─── t() — traduction simple ──────────────────────────────────────────────────

describe('I18n.t — Traduction clés simples', () => {
  it('résout une clé pointée profonde', () => {
    const val = I18n.t('ui.btn_start');
    expect(val).toBe('Commencer mon diagnostic');
  });

  it('résout une clé dans skin_types', () => {
    const val = I18n.t('skin_types.grasse.label');
    expect(val).toBe('Grasse');
  });

  it('retourne la clé si absente (fallback visible)', () => {
    const val = I18n.t('ui.cle_inexistante');
    expect(val).toBe('ui.cle_inexistante');
  });
});

// ─── t() — interpolation ──────────────────────────────────────────────────────

describe('I18n.t — Interpolation variables', () => {
  it('interpole {skin} dans le template', () => {
    const val = I18n.t('ui.intro_tpl', { skin: 'grasse' });
    expect(val).toBe('Votre routine sur-mesure pour une peau grasse.');
  });

  it('laisse {var} intact si variable manquante', () => {
    const val = I18n.t('ui.intro_tpl', {});
    expect(val).toContain('{skin}');
  });
});

// ─── Changement de langue ─────────────────────────────────────────────────────

describe('I18n.setLang', () => {
  it('change la langue active', () => {
    I18n.setLang('en');
    expect(I18n.getLang()).toBe('en');
    // Remettre en fr pour ne pas polluer les autres tests
    I18n.setLang('fr');
  });

  it('après changement en EN, t() retourne la traduction anglaise', () => {
    I18n.setLang('en');
    const val = I18n.t('ui.btn_start');
    expect(val).toBe('Start my diagnostic');
    I18n.setLang('fr');
  });

  it('fallback sur fr si langue inconnue', () => {
    I18n.setLang('zh');
    expect(I18n.getLang()).toBe('fr');
  });
});

// ─── RTL ──────────────────────────────────────────────────────────────────────

describe('I18n.isRTL', () => {
  it('retourne false pour le français', () => {
    I18n.setLang('fr');
    expect(I18n.isRTL()).toBe(false);
  });

  it('retourne true pour l\'arabe', () => {
    I18n.setLang('ar');
    expect(I18n.isRTL()).toBe(true);
    I18n.setLang('fr');
  });
});

// ─── tList ────────────────────────────────────────────────────────────────────

describe('I18n.tList', () => {
  it('retourne le tableau ages pour fr', () => {
    I18n.setLang('fr');
    const ages = I18n.tList('ages');
    expect(Array.isArray(ages)).toBe(true);
    expect(ages.length).toBeGreaterThan(0);
    expect(ages[0]).toHaveProperty('value');
    expect(ages[0]).toHaveProperty('label');
  });
});

// ─── formatPrice ──────────────────────────────────────────────────────────────

describe('I18n.formatPrice', () => {
  it('formate un prix en euros pour le français', () => {
    I18n.setLang('fr');
    const str = I18n.formatPrice(29);
    expect(str).toMatch(/29/);
    expect(str).toMatch(/€|EUR/);
  });

  it('formate un prix en GBP pour l\'anglais (GB)', () => {
    I18n.setLang('en');
    const str = I18n.formatPrice(29, 'GBP');
    expect(str).toMatch(/29/);
    I18n.setLang('fr');
  });

  it('fallback sur "29€" si Intl échoue (format invalide)', () => {
    I18n.setLang('fr');
    const str = I18n.formatPrice(29, 'INVALID_CURRENCY');
    expect(str).toContain('29');
  });
});

// ─── getSupportedLangs ────────────────────────────────────────────────────────

describe('I18n.getSupportedLangs', () => {
  it('retourne au moins fr et en', () => {
    const langs = I18n.getSupportedLangs();
    expect(langs).toContain('fr');
    expect(langs).toContain('en');
  });

  it('retourne ar (pour le support RTL)', () => {
    const langs = I18n.getSupportedLangs();
    expect(langs).toContain('ar');
  });
});
