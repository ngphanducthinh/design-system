import { expect, test } from '@playwright/test';
import { PageManager } from '@/e2e/page-objects/PageManager';

test.beforeEach(async ({ page }) => {
  const pm = new PageManager(page);
  await pm.navigateTo().carouselPage();
});

test('has heading', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().hasHeading();
});

test('adjust duration', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().getAutoplayInput().click();
  await pm.onCarouselPage().getDurationInput().fill('2000');
  await pm.onCarouselPage().getAutoplayInput().click();
  await page.waitForTimeout(2000);
  await expect(pm.onCarouselPage().getCarouselItem(1)).toHaveClass(/active/);
});

test('turn off continuous with autoplay on', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().getContinuousInput().click();
  await pm.onCarouselPage().getAutoplayInput().click();
  await pm.onCarouselPage().getDurationInput().fill('500'); // 1s
  await pm.onCarouselPage().getAutoplayInput().click();
  await page.waitForTimeout(2000); // The last item should be active now
  await expect(pm.onCarouselPage().getCarouselItem(3)).toHaveClass(/active/);
});

test('turn off continuous with autoplay off', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().getContinuousInput().click();
  await pm.onCarouselPage().getAutoplayInput().click();
  await pm.onCarouselPage().getCarouselNavigationRight().click();
  await pm.onCarouselPage().getCarouselNavigationRight().click();
  await pm.onCarouselPage().getCarouselNavigationRight().click();
  await expect(pm.onCarouselPage().getCarouselNavigationRight()).toBeHidden();
  await expect(pm.onCarouselPage().getCarouselItem(3)).toHaveClass(/active/);
});

test('turn off autoplay', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().getAutoplayInput().click();
  await pm.onCarouselPage().getDurationInput().fill('500');
  await page.waitForTimeout(500);
  await expect(pm.onCarouselPage().getCarouselItem(1)).not.toHaveClass(
    /active/,
  );
});

test('turn on autoplay', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().getAutoplayInput().click();
  await pm.onCarouselPage().getDurationInput().fill('500');
  await pm.onCarouselPage().getAutoplayInput().click();
  await page.waitForTimeout(500);
  await expect(pm.onCarouselPage().getCarouselItem(1)).toHaveClass(/active/);
});

test('turn off pagination', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().getPaginationInput().click();
  await expect(pm.onCarouselPage().getCarouselPagination()).toBeHidden();
});

test('turn on pagination', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().getPaginationInput().click();
  await pm.onCarouselPage().getPaginationInput().click();
  await expect(pm.onCarouselPage().getCarouselPagination()).toBeVisible();

  await pm.onCarouselPage().getCarouselPaginationItem(2).click();
  await expect(pm.onCarouselPage().getCarouselItem(2)).toHaveClass(/active/);

  await pm.onCarouselPage().getCarouselPaginationItem(3).click();
  await expect(pm.onCarouselPage().getCarouselItem(3)).toHaveClass(/active/);
});

test('turn off navigation', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().getNavigationInput().click();
  await expect(pm.onCarouselPage().getCarouselNavigationLeft()).toBeHidden();
  await expect(pm.onCarouselPage().getCarouselNavigationRight()).toBeHidden();
});

test('turn on navigation', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().getNavigationInput().click();
  await pm.onCarouselPage().getNavigationInput().click();
  await expect(pm.onCarouselPage().getCarouselNavigationLeft()).toBeVisible();
  await expect(pm.onCarouselPage().getCarouselNavigationRight()).toBeVisible();

  await pm.onCarouselPage().getCarouselNavigationRight().click();
  await pm.onCarouselPage().getCarouselNavigationRight().click();
  await expect(pm.onCarouselPage().getCarouselItem(2)).toHaveClass(/active/);
});

test('select the third carousel item', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().getModelValueSelect().selectOption('2');
  await expect(pm.onCarouselPage().getCarouselItem(2)).toHaveClass(/active/);
});
