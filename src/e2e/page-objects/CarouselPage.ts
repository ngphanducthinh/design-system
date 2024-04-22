import { expect, type Page } from '@playwright/test';
import { HelperBase } from '@/e2e/page-objects/HelperBase';

export class CarouselPage extends HelperBase {
  constructor(page: Page) {
    super(page);
  }

  async hasHeading() {
    await super.hasHeading('Carousel');
  }

  async clickAutoplayInput() {
    await this.getInput('autoplay').click();
  }

  async fillDurationInput(duration: string) {
    await this.getInput('duration').fill(duration);
  }

  async clickContinuousInput() {
    await this.getInput('continuous').click();
  }

  async clickNavigationInput() {
    await this.getInput('navigation').click();
  }

  async clickPaginationInput() {
    await this.getInput('pagination').click();
  }

  async selectModelValue(option: string) {
    await this.frame()
      .getByRole('table')
      .locator('tr', { hasText: 'modelValue' })
      .locator('select[id="control-modelValue"]')
      .selectOption(option);
  }

  async hasActiveCarouselItem(index: number) {
    const carouselItem = this.frame()
      .locator('.carousel-content')
      .locator('.carousel-item')
      .nth(index);
    await expect(carouselItem).toHaveClass(/active/);
  }

  async clickCarouselPaginationItem(index: number) {
    await this.frame()
      .locator('.carousel-pagination')
      .locator('span')
      .nth(index)
      .click();
  }

  async hasCarouselPagination() {
    const carouselPagination = this.frame().locator('.carousel-pagination');
    await expect(carouselPagination).toBeVisible();
  }

  async hasNoCarouselPagination() {
    const carouselPagination = this.frame().locator('.carousel-pagination');
    await expect(carouselPagination).toBeHidden();
  }

  async hasCarouselNavigationLeft() {
    const carouselNavigationLeft = this.frame().locator(
      '.carousel-navigation--left',
    );
    await expect(carouselNavigationLeft).toBeVisible();
  }

  async hasNoCarouselNavigationLeft() {
    const carouselNavigationLeft = this.frame().locator(
      '.carousel-navigation--left',
    );
    await expect(carouselNavigationLeft).toBeHidden();
  }

  async clickCarouselNavigationLeft() {
    await this.frame().locator('.carousel-navigation--left').click();
  }

  async hasCarouselNavigationRight() {
    const carouselNavigationLeft = this.frame().locator(
      '.carousel-navigation--right',
    );
    await expect(carouselNavigationLeft).toBeVisible();
  }

  async hasNoCarouselNavigationRight() {
    const carouselNavigationLeft = this.frame().locator(
      '.carousel-navigation--right',
    );
    await expect(carouselNavigationLeft).toBeHidden();
  }

  async clickCarouselNavigationRight() {
    await this.frame().locator('.carousel-navigation--right').click();
  }
}
