import { test } from '@playwright/test';
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
  await pm.onCarouselPage().clickAutoplayInput();
  await pm.onCarouselPage().fillDurationInput('2000');
  await pm.onCarouselPage().clickAutoplayInput();
  await page.waitForTimeout(2000);
  await pm.onCarouselPage().hasActiveCarouselItem(1);
});

test('turn off continuous with autoplay on', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().clickContinuousInput();
  await pm.onCarouselPage().clickAutoplayInput();
  await pm.onCarouselPage().fillDurationInput('500');
  await pm.onCarouselPage().clickAutoplayInput();
  await page.waitForTimeout(2000); // The last item should be active now
  await pm.onCarouselPage().hasActiveCarouselItem(3);
});

test('turn off continuous with autoplay off', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().clickContinuousInput();
  await pm.onCarouselPage().clickAutoplayInput();
  await pm.onCarouselPage().clickCarouselNavigationRight();
  await pm.onCarouselPage().clickCarouselNavigationRight();
  await pm.onCarouselPage().clickCarouselNavigationRight();
  await pm.onCarouselPage().hasNoCarouselNavigationRight();
  await pm.onCarouselPage().hasActiveCarouselItem(3);

  await pm.onCarouselPage().clickCarouselNavigationLeft();
  await pm.onCarouselPage().hasActiveCarouselItem(2);
});

test('turn off autoplay', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().clickAutoplayInput();
  await pm.onCarouselPage().fillDurationInput('500');
  await page.waitForTimeout(500);
  await pm.onCarouselPage().hasActiveCarouselItem(0);
});

test('turn on autoplay', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().clickAutoplayInput();
  await pm.onCarouselPage().fillDurationInput('500');
  await pm.onCarouselPage().clickAutoplayInput();
  await page.waitForTimeout(500);
  await pm.onCarouselPage().hasActiveCarouselItem(1);
});

test('turn off pagination', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().clickPaginationInput();
  await pm.onCarouselPage().hasNoCarouselPagination();
});

test('turn on pagination', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().clickPaginationInput();
  await pm.onCarouselPage().clickPaginationInput();
  await pm.onCarouselPage().hasCarouselPagination();

  await pm.onCarouselPage().clickCarouselPaginationItem(2);
  await pm.onCarouselPage().hasActiveCarouselItem(2);

  await pm.onCarouselPage().clickCarouselPaginationItem(3);
  await pm.onCarouselPage().hasActiveCarouselItem(3);
});

test('turn off navigation', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().clickNavigationInput();
  await pm.onCarouselPage().hasNoCarouselNavigationLeft();
  await pm.onCarouselPage().hasNoCarouselNavigationRight();
});

test('turn on navigation', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().clickNavigationInput();
  await pm.onCarouselPage().clickNavigationInput();
  await pm.onCarouselPage().hasCarouselNavigationLeft();
  await pm.onCarouselPage().hasCarouselNavigationRight();

  await pm.onCarouselPage().clickCarouselNavigationRight();
  await pm.onCarouselPage().clickCarouselNavigationRight();
  await pm.onCarouselPage().hasActiveCarouselItem(2);
});

test('select the third carousel item', async ({ page }) => {
  const pm = new PageManager(page);
  await pm.onCarouselPage().selectModelValue('2');
  await pm.onCarouselPage().hasActiveCarouselItem(2);
});
