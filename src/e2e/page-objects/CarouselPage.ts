import type { Page } from '@playwright/test';
import { HelperBase } from '@/e2e/page-objects/HelperBase';

export class CarouselPage extends HelperBase {
  constructor(page: Page) {
    super(page);
  }

  async hasHeading() {
    await super.hasHeading('Carousel');
  }

  getAutoplayInput() {
    return this.getInput('autoplay');
  }

  getDurationInput() {
    return this.getInput('duration');
  }

  getContinuousInput() {
    return this.getInput('continuous');
  }

  getPaginationInput() {
    return this.getInput('pagination');
  }

  getNavigationInput() {
    return this.getInput('navigation');
  }

  getModelValueSelect() {
    return this.frame()
      .getByRole('table')
      .locator('tr', { hasText: 'modelValue' })
      .locator('select[id="control-modelValue"]');
  }

  getCarouselPaginationItem(index: number) {
    return this.getCarouselPagination().locator('span').nth(index);
  }

  getCarouselItem(index: number) {
    return this.frame()
      .locator('.carousel-content')
      .locator('.carousel-item')
      .nth(index);
  }

  getCarouselNavigationLeft() {
    return this.frame().locator('.carousel-navigation--left');
  }

  getCarouselNavigationRight() {
    return this.frame().locator('.carousel-navigation--right');
  }

  getCarouselPagination() {
    return this.frame().locator('.carousel-pagination');
  }
}
