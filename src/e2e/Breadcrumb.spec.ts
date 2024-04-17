import { expect, test } from '@playwright/test';

test.describe('Breadcrumb', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Breadcrumb' }).click();
  });

  test('has title', async ({ page }) => {
    await expect(
      page
        .frameLocator('iframe[title="storybook-preview-iframe"]')
        .getByRole('heading', {
          name: 'Breadcrumb',
        }),
    ).toBeVisible();
  });
});
