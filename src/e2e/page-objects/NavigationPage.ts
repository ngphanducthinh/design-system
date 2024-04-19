import type { Page } from '@playwright/test';

export class NavigationPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async introductionPage() {
    await this.page.getByRole('link', { name: 'Introduction' }).click();
  }

  async breadcrumbPage() {
    await this.page.getByRole('button', { name: 'Breadcrumb' }).click();
  }

  async carouselPage() {
    await this.page.getByRole('button', { name: 'Carousel' }).click();
  }
}
