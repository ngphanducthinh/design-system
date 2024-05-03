import { expect, type Page } from '@playwright/test';

export class HelperBase {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  frame() {
    return this.page.frameLocator('iframe[title="storybook-preview-iframe"]');
  }

  async hasHeading(heading: string) {
    await expect(
      this.frame().getByRole('heading', {
        name: heading,
        exact: true,
      }),
    ).toBeVisible();
  }
  async wait() {
    await this.page.waitForTimeout(300);
  }

  getInput(name: string) {
    return this.frame()
      .getByRole('table')
      .locator('tr', { hasText: name })
      .locator(`input[id="control-${name}"]`);
  }

  getTextarea(name: string) {
    return this.frame()
      .getByRole('table')
      .locator('tr', { hasText: name })
      .locator(`textarea[id="control-${name}"]`);
  }
}
