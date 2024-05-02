import type { Page } from '@playwright/test';

export class NavigationPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async introductionPage() {
    await this.page.goto('./');
    await this.page
      .getByRole('link', { name: 'Introduction', exact: true })
      .click();
  }

  async breadcrumbPage() {
    await this.page.goto('./');
    await this.page
      .getByRole('button', { name: 'Breadcrumb', exact: true })
      .click();
  }

  async carouselPage() {
    await this.page.goto('./');
    await this.page
      .getByRole('button', { name: 'Carousel', exact: true })
      .click();
  }

  async datePickerPage() {
    await this.page.goto('./');
    await this.page
      .getByRole('button', { name: 'DatePicker', exact: true })
      .click();
  }
}
