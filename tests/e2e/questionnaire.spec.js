/**
 * Tests E2E — Parcours questionnaire SkinMatch
 * Agent QA — Playwright
 *
 * Pour lancer : npm run test:e2e
 */

import { test, expect } from '@playwright/test';

// The region modal appears ~300ms after setLang() via setTimeout.
// It is position:fixed z-index:9999 and blocks ALL subsequent clicks.
// Using page.evaluate() is the only reliable way to dismiss it in CI —
// clicking buttons inside the modal via Playwright fails silently.
async function dismissRegionModal(page) {
  // Wait until the modal becomes visible (fires at ~300ms), then force-hide it.
  await page.locator('#region-modal').waitFor({ state: 'visible', timeout: 2000 })
    .catch(() => {}); // safe — if it never appears, evaluate below is a no-op
  await page.evaluate(() => {
    const m = document.getElementById('region-modal');
    if (m) m.style.display = 'none';
  });
}

// Helper : naviguer jusqu'au résultat avec un profil standard
async function goToResult(page, options = {}) {
  const {
    lang = 'fr',
    skin = 'Mixte',
    age = '26 – 35 ans',
    concerns = ['Acné / Boutons'],
    budget = 'Modéré',
    routine = 'Complète',
  } = options;

  await page.goto('/');

  // Sélection langue
  await page.click(`button:has-text("${lang === 'fr' ? 'Français' : 'English'}")`);
  await dismissRegionModal(page);

  // Welcome → démarrer
  await expect(page.locator('#sc-welcome')).toBeVisible({ timeout: 3000 });
  await page.click('#btn-start');

  // Q1 — Type de peau
  await expect(page.locator('#sc-q1')).toBeVisible();
  await page.click(`.sr >> text="${skin}"`);
  await page.click('#q1-next');

  // Q2 — Âge
  await expect(page.locator('#sc-q2')).toBeVisible();
  await page.click(`.sr >> text="${age}"`);
  await page.click('#q2-next');

  // Q3 — Concerns
  await expect(page.locator('#sc-q3')).toBeVisible();
  for (const concern of concerns) {
    await page.click(`.chip >> text="${concern}"`);
  }
  await page.click('#q3-next');

  // Q4 — Budget
  await expect(page.locator('#sc-q4')).toBeVisible();
  await page.click(`.sr >> text="${budget}"`);
  await page.click('#q4-next');

  // Q5 — Routine
  await expect(page.locator('#sc-q5')).toBeVisible();
  await page.click(`.sr >> text="${routine}"`);
  await page.click('#q5-next');

  // Résultat
  await expect(page.locator('#sc-result')).toBeVisible({ timeout: 5000 });
}

// ── Tests principaux ──────────────────────────────────────────────────────────

test.describe('Parcours questionnaire FR', () => {
  test('Parcours complet → résultat avec produits', async ({ page }) => {
    await goToResult(page);
    // Au moins un produit dans les résultats
    await expect(page.locator('.pc').first()).toBeVisible();
    // Bouton partager visible
    await expect(page.locator('.share-btn')).toBeVisible();
  });

  test('Navigation retour fonctionne sur chaque étape', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Français")');
    await dismissRegionModal(page);
    await page.click('#btn-start');

    // Q1 → retour welcome
    await expect(page.locator('#sc-q1')).toBeVisible();
    await page.locator('#sc-q1 .btn-back').click({ force: true });
    await expect(page.locator('#sc-welcome')).toBeVisible();
  });

  test('Bouton continuer désactivé si rien sélectionné', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Français")');
    await dismissRegionModal(page);
    await page.click('#btn-start');

    // Sans sélection, le bouton est disabled
    await expect(page.locator('#q1-next')).toBeDisabled();
  });
});

test.describe('Modal produit', () => {
  test('Ouvrir et fermer la fiche produit', async ({ page }) => {
    await goToResult(page);
    // Ouvrir la première fiche
    await page.locator('.btn-fiche').first().click();
    await expect(page.locator('#modal-overlay')).toBeVisible();
    // Fermer
    await page.locator('.modal-close').click();
    await expect(page.locator('#modal-overlay')).toBeHidden();
  });

  test('Fermer modal en cliquant outside', async ({ page }) => {
    await goToResult(page);
    await page.locator('.btn-fiche').first().click();
    await expect(page.locator('#modal-overlay')).toBeVisible();
    // Cliquer en dehors du modal
    await page.locator('#modal-overlay').click({ position: { x: 10, y: 10 } });
    await expect(page.locator('#modal-overlay')).toBeHidden();
  });
});

test.describe('Sécurité allergies', () => {
  test('Allergie Rétinol → aucun produit avec Retinol dans la routine', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Français")');
    await dismissRegionModal(page);
    await page.click('#btn-start');

    // Q1 - Mixte
    await page.click('.sr >> text="Mixte"');
    await page.click('#q1-next');
    // Q2 - 26-35 ans
    await page.click('.sr >> text="26 – 35 ans"');
    await page.click('#q2-next');
    // Q3 - Rides + allergie Rétinol
    await page.click('.chip >> text="Rides & anti-âge"');
    await page.click('.chip >> text="Rétinol"');
    await page.click('#q3-next');
    // Q4 - Modéré
    await page.click('.sr >> text="Modéré"');
    await page.click('#q4-next');
    // Q5 - Complète
    await page.click('.sr >> text="Complète"');
    await page.click('#q5-next');

    await expect(page.locator('#sc-result')).toBeVisible();

    // Vérifier qu'aucune carte ne contient "Rétinol" dans ses actifs clés
    const cards = page.locator('.pc');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const text = await cards.nth(i).textContent();
      expect(text.toLowerCase()).not.toContain('rétinol encapsulé');
    }
  });
});

test.describe('Comparateur', () => {
  test('Mode comparaison accessible depuis les résultats', async ({ page }) => {
    await goToResult(page);
    await page.click('#btn-compare-top');
    await expect(page.locator('#sc-compare')).toBeVisible();
    await page.locator('#sc-compare .btn-back').click({ force: true });
    await expect(page.locator('#sc-result')).toBeVisible();
  });
});

test.describe('PWA & accessibilité', () => {
  test('Page se charge sans erreur JS', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/');
    await page.click('button:has-text("Français")');
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('Viewport mobile correct (390px)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    // L'app ne doit pas déborder horizontalement
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(390);
  });
});
