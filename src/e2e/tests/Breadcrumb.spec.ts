import { test } from '@playwright/test';
import { PageManager } from '@/e2e/page-objects/PageManager';

test.beforeEach(async ({ page }) => {
  const pm = new PageManager(page);
  await pm.navigateTo().breadcrumbPage();
});

test('has title', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onBreadcrumbPage().hasHeading();
});
