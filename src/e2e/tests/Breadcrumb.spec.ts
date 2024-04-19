import { expect, test } from '@playwright/test';
import { PageManager } from '@/e2e/page-objects/PageManager';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  const pm = new PageManager(page);
  await pm.navigateTo().breadcrumbPage();
});

test('has title', async ({ page }) => {
  const pm = new PageManager(page);
  await expect(
    pm.onBreadcrumbPage().sbFrame().getByRole('heading', {
      name: 'Breadcrumb',
    }),
  ).toBeVisible();
});
