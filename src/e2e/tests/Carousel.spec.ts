import { expect, test } from '@playwright/test';
import { PageManager } from '@/e2e/page-objects/PageManager';

test.beforeEach(async ({ page }) => {
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

test('adjust duration', async ({ page }) => {
  const pm = new PageManager(page);

  const autoplayToggle = pm
    .onCarouselPage()
    .sbFrame()
    .getByRole('table')
    .locator('tr', { hasText: 'autoplay' })
    .locator('input[id="control-autoplay"]');
  await autoplayToggle.click();

  const durationInput = pm
    .onCarouselPage()
    .sbFrame()
    .getByRole('table')
    .locator('tr', { hasText: 'duration' })
    .locator('input[id="control-duration"]');

  await durationInput.fill('3000');
  await autoplayToggle.click();
  await page.waitForTimeout(3000);
  const carouselItems = pm
    .onCarouselPage()
    .sbFrame()
    .locator('.carousel-content .carousel-item');
  await expect(carouselItems.nth(1)).toHaveClass(/active/);
});

test('toggle continuous with autoplay on', async ({ page }) => {
  const pm = new PageManager(page);

  const continuousToggle = pm
    .onCarouselPage()
    .sbFrame()
    .getByRole('table')
    .locator('tr', { hasText: 'continuous' })
    .locator('input[id="control-continuous"]');
  await continuousToggle.click();

  const autoplayToggle = pm
    .onCarouselPage()
    .sbFrame()
    .getByRole('table')
    .locator('tr', { hasText: 'autoplay' })
    .locator('input[id="control-autoplay"]');
  await autoplayToggle.click();

  const durationInput = pm
    .onCarouselPage()
    .sbFrame()
    .getByRole('table')
    .locator('tr', { hasText: 'duration' })
    .locator('input[id="control-duration"]');

  await durationInput.fill('1000'); // 1s
  await autoplayToggle.click();

  await page.waitForTimeout(4000); // After 4 item switches
  const carouselItems = pm
    .onCarouselPage()
    .sbFrame()
    .locator('.carousel-content .carousel-item');
  await expect(carouselItems.nth(3)).toHaveClass(/active/);
});

test('toggle continuous with autoplay off', async ({ page }) => {
  const pm = new PageManager(page);

  const continuousToggle = pm
    .onCarouselPage()
    .sbFrame()
    .getByRole('table')
    .locator('tr', { hasText: 'continuous' })
    .locator('input[id="control-continuous"]');
  await continuousToggle.click();

  const autoplayToggle = pm
    .onCarouselPage()
    .sbFrame()
    .getByRole('table')
    .locator('tr', { hasText: 'autoplay' })
    .locator('input[id="control-autoplay"]');
  await autoplayToggle.click();

  const navigationRight = pm
    .onCarouselPage()
    .sbFrame()
    .locator('.carousel-navigation--right');
  await navigationRight.click();
  await navigationRight.click();
  await navigationRight.click();

  await expect(navigationRight).toBeHidden();
  const carouselItems = pm
    .onCarouselPage()
    .sbFrame()
    .locator('.carousel-content .carousel-item');
  await expect(carouselItems.nth(3)).toHaveClass(/active/);
});

test('toggle autoplay', async ({ page }) => {
  const pm = new PageManager(page);

  const autoplayToggle = pm
    .onCarouselPage()
    .sbFrame()
    .getByRole('table')
    .locator('tr', { hasText: 'autoplay' })
    .locator('input[id="control-autoplay"]');
  await autoplayToggle.click();

  await page.waitForTimeout(6000);
  const carouselItems = pm
    .onCarouselPage()
    .sbFrame()
    .locator('.carousel-content .carousel-item');
  await expect(carouselItems.nth(1)).not.toHaveClass(/active/);
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

  const paginationItems = pagination.locator('span');
  await paginationItems.nth(2).click();
  const carouselItems = pm
    .onCarouselPage()
    .sbFrame()
    .locator('.carousel-content .carousel-item');
  await expect(carouselItems.nth(2)).toHaveClass(/active/);
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

  await navigationRight.click();
  await navigationRight.click();
  const carouselItems = pm
    .onCarouselPage()
    .sbFrame()
    .locator('.carousel-content .carousel-item');
  await expect(carouselItems.nth(2)).toHaveClass(/active/);
});

test('select the third carousel item', async ({ page }) => {
  const pm = new PageManager(page);

  const modelValueSelect = pm
    .onCarouselPage()
    .sbFrame()
    .getByRole('table')
    .locator('tr', { hasText: 'modelValue' })
    .locator('select[id="control-modelValue"]');
  await modelValueSelect.selectOption('2');

  const carouselItems = pm
    .onCarouselPage()
    .sbFrame()
    .locator('.carousel-content .carousel-item');
  await expect(carouselItems.nth(2)).toHaveClass(/active/);
});
