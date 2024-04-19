import { expect, test } from '@playwright/test';

test.describe('Carousel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Carousel' }).click();
  });

  test('has title', async ({ page }) => {
    const iframe = page.frameLocator(
      'iframe[title="storybook-preview-iframe"]',
    );

    await expect(
      iframe.getByRole('heading', {
        name: 'Carousel',
      }),
    ).toBeVisible();
  });

  test('toggle pagination', async ({ page }) => {
    const iframe = page.frameLocator(
      'iframe[title="storybook-preview-iframe"]',
    );

    const paginationToggle = iframe
      .getByRole('table')
      .locator('tr', { hasText: 'pagination' })
      .locator('input[id="control-pagination"]');
    const pagination = iframe.locator('.carousel-pagination');

    // Default
    await expect(pagination).toBeVisible();

    // Turn off
    await paginationToggle.click();
    await expect(pagination).toBeHidden();

    // Turn on
    await paginationToggle.click();
    await expect(pagination).toBeVisible();
  });

  test('toggle navigation', async ({ page }) => {
    const iframe = page.frameLocator(
      'iframe[title="storybook-preview-iframe"]',
    );

    const navigationToggle = iframe
      .getByRole('table')
      .locator('tr', { hasText: 'navigation' })
      .locator('input[id="control-navigation"]');
    const navigationLeft = iframe.locator('.carousel-navigation--left');
    const navigationRight = iframe.locator('.carousel-navigation--right');

    // Default
    await expect(navigationLeft).toBeVisible();
    await expect(navigationRight).toBeVisible();

    // Turn off
    await navigationToggle.click();
    await expect(navigationLeft).toBeHidden();
    await expect(navigationRight).toBeHidden();

    // Turn on
    await navigationToggle.click();
    await expect(navigationLeft).toBeVisible();
    await expect(navigationRight).toBeVisible();
  });
});
