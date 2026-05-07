/**
 * Tests unitaires — Agent Algorithm + QA
 * Agent QA — tests/unit/algorithm.test.js
 *
 * Pour lancer: npm run test:unit (nécessite Node.js + vitest)
 * Couverture: scoreProduct, generateRoutine, hasConflict, isAllergic
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Imports des modules à tester
let generateRoutine, scoreProduct, hasConflict, isAllergic;
let products, routes;

beforeAll(async () => {
  // Charger algorithm.js (module CommonJS)
  const algo = require('../../src/js/algorithm.js');
  generateRoutine = algo.generateRoutine;
  scoreProduct    = algo.scoreProduct;
  hasConflict     = algo.hasConflict;
  isAllergic      = algo.isAllergic;

  // Charger les données
  products = require('../../src/data/products.json');
  routes   = require('../../src/data/routes.json');
});

// ─── Données de test ──────────────────────────────────────────────────────────

const PROFILE_BASE = {
  skinType:  'normale',
  ageGroup:  '26-35',
  concerns:  ['deshydratation'],
  allergies: [],
  budget:    'mid',
  routine:   'simple',
};

const SKIN_TYPES = ['seche', 'grasse', 'mixte', 'normale', 'sensible'];
const BUDGETS    = ['low', 'mid', 'high'];
const ROUTINES   = ['simple', 'complete', 'specifique'];
const AGE_GROUPS = ['moins-25', '26-35', '36-45', 'plus-45'];

// ─── 1. Intégrité des données ─────────────────────────────────────────────────

describe('Données — products.json', () => {
  it('contient au moins 100 produits', () => {
    const count = Array.isArray(products) ? products.length : Object.keys(products).length;
    expect(count).toBeGreaterThanOrEqual(100);
  });

  it('chaque produit a les champs obligatoires', () => {
    const list = Array.isArray(products) ? products : Object.values(products);
    list.forEach(p => {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('nom');
      expect(p).toHaveProperty('prix_num');
      expect(typeof p.prix_num).toBe('number');
    });
  });

  it('aucun produit avec prix_num négatif', () => {
    const list = Array.isArray(products) ? products : Object.values(products);
    list.forEach(p => {
      expect(p.prix_num).toBeGreaterThanOrEqual(0);
    });
  });

  it('yuka entre 0 et 100 pour tous les produits notés', () => {
    const list = Array.isArray(products) ? products : Object.values(products);
    list.forEach(p => {
      if (p.yuka != null) {
        expect(p.yuka).toBeGreaterThanOrEqual(0);
        expect(p.yuka).toBeLessThanOrEqual(100);
      }
    });
  });
});

describe('Données — routes.json', () => {
  it('contient les 4 étapes (net, hyd, ser, spf)', () => {
    expect(routes).toHaveProperty('net');
    expect(routes).toHaveProperty('hyd');
    expect(routes).toHaveProperty('ser');
    expect(routes).toHaveProperty('spf');
  });

  it('les sous-clés des étapes contiennent des chaînes non vides', () => {
    Object.entries(routes).forEach(([step, skins]) => {
      Object.entries(skins).forEach(([skin, budgets]) => {
        Object.entries(budgets).forEach(([budget, productId]) => {
          if (productId !== null) {
            expect(typeof productId).toBe('string');
            expect(productId.length).toBeGreaterThan(0);
          }
        });
      });
    });
  });
});

// ─── 2. scoreProduct ─────────────────────────────────────────────────────────

describe('scoreProduct — Scoring multidimensionnel', () => {
  let sampleProduct;

  beforeAll(() => {
    const list = Array.isArray(products) ? products : Object.values(products);
    sampleProduct = list[0];
  });

  it('retourne un score entre 0 et 100 pour un profil standard', () => {
    const score = scoreProduct(sampleProduct, PROFILE_BASE);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('retourne -999 pour un produit allergène', () => {
    const list = Array.isArray(products) ? products : Object.values(products);
    // Trouver un produit avec rétinol
    const retinolProduct = list.find(p =>
      (p.comp || []).some(c => c.toLowerCase().includes('retinol')) ||
      (p.ak   || []).some(a => a.toLowerCase().includes('rétinol'))
    );
    if (retinolProduct) {
      const score = scoreProduct(retinolProduct, { ...PROFILE_BASE, allergies: ['Rétinol'] });
      expect(score).toBe(-999);
    }
  });

  it('un produit conçu pour peaux grasses score mieux pour peau grasse que sèche', () => {
    const list = Array.isArray(products) ? products : Object.values(products);
    // Find a product specific to grasse (not also covering seche) for a meaningful comparison
    const grasse = list.find(p => {
      const st = p.skinTypes || [];
      return st.includes('grasse') && !st.includes('seche') && !st.includes('normale');
    });
    if (grasse) {
      const scoreGrasse = scoreProduct(grasse, { ...PROFILE_BASE, skinType: 'grasse' });
      const scoreSeche  = scoreProduct(grasse, { ...PROFILE_BASE, skinType: 'seche' });
      expect(scoreGrasse).toBeGreaterThan(scoreSeche);
    }
  });
});

// ─── 3. generateRoutine — Couverture combinaisons ─────────────────────────────

describe('generateRoutine — Couverture 5 types × 3 budgets', () => {
  SKIN_TYPES.forEach(skinType => {
    BUDGETS.forEach(budget => {
      it(`génère une routine valide pour ${skinType}/${budget}`, () => {
        const result = generateRoutine(
          { ...PROFILE_BASE, skinType, budget },
          products,
          'fr'
        );
        expect(result).toBeDefined();
        expect(result.steps).toBeDefined();
        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('generateRoutine — Types de routine', () => {
  it('routine "simple" retourne exactement 3 étapes (net+hyd+spf)', () => {
    const result = generateRoutine({ ...PROFILE_BASE, routine: 'simple' }, products, 'fr');
    expect(result.steps.length).toBe(3);
  });

  it('routine "complete" retourne au moins 4 étapes', () => {
    const result = generateRoutine({ ...PROFILE_BASE, routine: 'complete' }, products, 'fr');
    expect(result.steps.length).toBeGreaterThanOrEqual(4);
  });

  it('routine "specifique" retourne au moins 1 étape (soin ciblé)', () => {
    const result = generateRoutine(
      { ...PROFILE_BASE, routine: 'specifique', concerns: ['rides', 'taches'] },
      products, 'fr'
    );
    expect(result.steps.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── 4. Règles métier critiques ───────────────────────────────────────────────

describe('generateRoutine — Règles métier SPF / Rétinol', () => {
  it('SPF toujours en dernière position', () => {
    SKIN_TYPES.forEach(skinType => {
      const result = generateRoutine({ ...PROFILE_BASE, skinType, routine: 'complete' }, products, 'fr');
      const last = result.steps[result.steps.length - 1];
      const hasSpf = last && (
        (last.stepType || '').toLowerCase().includes('spf') ||
        (last.nom       || '').toLowerCase().includes('spf') ||
        (last.etape     || '').toLowerCase().includes('solaire')
      );
      expect(hasSpf).toBe(true);
    });
  });

  it('aucun produit avec rétinol en moment AM', () => {
    const result = generateRoutine(
      { ...PROFILE_BASE, routine: 'complete', concerns: ['rides'], ageGroup: 'plus-45' },
      products, 'fr'
    );
    const amProducts = result.steps.filter(s => s.moment === 'AM');
    amProducts.forEach(p => {
      const hasRetinol = (p.comp || []).some(c => c.toLowerCase().includes('retinol')) ||
                         (p.ak   || []).some(a => a.toLowerCase().includes('rétinol'));
      expect(hasRetinol).toBe(false);
    });
  });

  it('chaque étape a un nom et un prix', () => {
    const result = generateRoutine(PROFILE_BASE, products, 'fr');
    result.steps.forEach(step => {
      expect(step.nom).toBeTruthy();
      expect(typeof step.prix_num).toBe('number');
    });
  });

  it('totalPrix = somme des prix des étapes', () => {
    const result = generateRoutine(PROFILE_BASE, products, 'fr');
    const sum = result.steps.reduce((acc, s) => acc + (s.prix_num || 0), 0);
    expect(Math.abs(result.totalPrix - sum)).toBeLessThan(0.01);
  });
});

// ─── 5. Allergies ─────────────────────────────────────────────────────────────

describe('generateRoutine — Exclusion allergènes', () => {
  it('exclut les produits avec rétinol si allergie Rétinol déclarée', () => {
    const result = generateRoutine(
      { ...PROFILE_BASE, routine: 'complete', allergies: ['Rétinol'], concerns: ['rides'] },
      products, 'fr'
    );
    result.steps.forEach(step => {
      const hasRetinol = (step.comp || []).some(c => c.toLowerCase().includes('retinol')) ||
                         (step.ak   || []).some(a => a.toLowerCase().includes('rétinol'));
      expect(hasRetinol).toBe(false);
    });
  });

  it('exclut les produits avec acide glycolique si allergie AHA déclarée', () => {
    const result = generateRoutine(
      { ...PROFILE_BASE, routine: 'complete', allergies: ['AHA'], concerns: ['taches'] },
      products, 'fr'
    );
    result.steps.forEach(step => {
      const hasAha = (step.comp || []).some(c =>
        c.toLowerCase().includes('glycolic acid') ||
        c.toLowerCase().includes('lactic acid')
      );
      expect(hasAha).toBe(false);
    });
  });

  it('génère quand même une routine même si allergies réduisent les choix', () => {
    const result = generateRoutine(
      { ...PROFILE_BASE, routine: 'complete', allergies: ['Rétinol', 'AHA', 'Parfums'] },
      products, 'fr'
    );
    expect(result.steps.length).toBeGreaterThan(0);
  });
});

// ─── 6. hasConflict / isAllergic ─────────────────────────────────────────────

describe('hasConflict — Détection conflits ingrédients', () => {
  it('détecte le conflit rétinol + vitamine C', () => {
    const productA = { comp: ['retinol', 'glycerin'], moment: 'AM' };
    const productB = { comp: ['ascorbic acid', 'niacinamide'], moment: 'AM' };
    expect(hasConflict(productA, productB)).toBe(true);
  });

  it('ne détecte pas de conflit dans une routine sans incompatibilités', () => {
    const productA = { comp: ['hyaluronic acid', 'glycerin'], moment: 'AM' };
    const productB = { comp: ['niacinamide', 'panthenol'], moment: 'AM' };
    expect(hasConflict(productA, productB)).toBe(false);
  });
});

describe('isAllergic — Vérification allergènes', () => {
  it('retourne true pour un produit contenant retinol avec allergie Rétinol', () => {
    const product = { comp: ['retinol', 'glycerin'], ak: [] };
    expect(isAllergic(product, ['Rétinol'])).toBe(true);
  });

  it('retourne false pour un produit sans ingrédients allergènes', () => {
    const product = { comp: ['hyaluronic acid', 'glycerin'], ak: [] };
    expect(isAllergic(product, ['Rétinol'])).toBe(false);
  });

  it('retourne false si la liste allergies est vide', () => {
    const product = { comp: ['retinol', 'ascorbic acid'], ak: ['rétinol'] };
    expect(isAllergic(product, [])).toBe(false);
  });
});

// ─── 7. Internationalisation ──────────────────────────────────────────────────

describe('generateRoutine — Support multilangue', () => {
  ['fr', 'en'].forEach(lang => {
    it(`génère une routine avec intro en ${lang}`, () => {
      const result = generateRoutine(PROFILE_BASE, products, lang);
      expect(result.intro).toBeTruthy();
      expect(typeof result.intro).toBe('string');
    });
  });
});

// ─── 8. Groupes d'âge ────────────────────────────────────────────────────────

describe('generateRoutine — Groupes d\'âge', () => {
  AGE_GROUPS.forEach(ageGroup => {
    it(`génère une routine pour le groupe ${ageGroup}`, () => {
      const result = generateRoutine({ ...PROFILE_BASE, ageGroup }, products, 'fr');
      expect(result.steps.length).toBeGreaterThan(0);
    });
  });
});
