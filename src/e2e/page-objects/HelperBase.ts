import type { Page } from '@playwright/test';

export class HelperBase {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  sbFrame() {
    return this.page.frameLocator('iframe[title="storybook-preview-iframe"]');
  }
}
