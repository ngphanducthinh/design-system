import { expect, test } from '@playwright/test';
import { PageManager } from '@/e2e/page-objects/PageManager';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  const pm = new PageManager(page);
  await pm.navigateTo().carouselPage();
});

test('has title', async ({ page }) => {
  const pm = new PageManager(page);
  await expect(
    pm.onCarouselPage().sbFrame().getByRole('heading', {
      name: 'Carousel',
    }),
  ).toBeVisible();
});

test('toggle pagination', async ({ page }) => {
  const pm = new PageManager(page);

  const paginationToggle = pm
    .onCarouselPage()
    .sbFrame()
    .getByRole('table')
    .locator('tr', { hasText: 'pagination' })
    .locator('input[id="control-pagination"]');
  const pagination = pm
    .onCarouselPage()
    .sbFrame()
    .locator('.carousel-pagination');

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
  const pm = new PageManager(page);

  const navigationToggle = pm
    .onCarouselPage()
    .sbFrame()
    .getByRole('table')
    .locator('tr', { hasText: 'navigation' })
    .locator('input[id="control-navigation"]');
  const navigationLeft = pm
    .onCarouselPage()
    .sbFrame()
    .locator('.carousel-navigation--left');
  const navigationRight = pm
    .onCarouselPage()
    .sbFrame()
    .locator('.carousel-navigation--right');

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
