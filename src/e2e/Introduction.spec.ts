import { expect, test } from '@playwright/test';

test.describe('Introduction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.getByRole('link', { name: 'Introduction' }).click();
  });

  test('has section titles', async ({ page }) => {
    const iframe = page.frameLocator(
      'iframe[title="storybook-preview-iframe"]',
    );

    await expect(
      iframe.getByRole('heading', {
        name: 'Getting started',
      }),
    ).toBeVisible();

    await expect(
      iframe.getByRole('heading', {
        name: 'Usage',
      }),
    ).toBeVisible();

    await expect(
      iframe.getByRole('heading', {
        name: 'Color Customization',
      }),
    ).toBeVisible();
  });

  test('has install command', async ({ page }) => {
    await expect(
      page
        .frameLocator('iframe[title="storybook-preview-iframe"]')
        .locator('span')
        .filter({ hasText: 'npm i @7pmlabs/design-system' }),
    ).toBeVisible();
  });
});
