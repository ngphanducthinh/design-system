import { expect, type Page } from '@playwright/test';
import { HelperBase } from '@/e2e/page-objects/HelperBase';
import enUS from '@/locales/en-US.json';

export class DatePickerPage extends HelperBase {
  constructor(page: Page) {
    super(page);
  }

  async fillInputId(inputId: string) {
    await this.getTextarea('inputId').fill(inputId);
  }
  async hasCustomInputId(inputId: string) {
    const input = this.frame()
      .locator('.b-date-picker')
      .locator(`input[id="${inputId}"]`);
    await expect(input).toBeVisible();
  }

  async fillLabel(labelText: string) {
    await this.getTextarea('label').fill(labelText);
  }
  async hasCustomLabel(labelText: string) {
    const label = this.frame()
      .locator('.b-date-picker')
      .locator('label', { hasText: labelText });
    await expect(label).toBeVisible();
  }

  async fillPlaceholder(placeholderText: string) {
    await this.getTextarea('placeholder').fill(placeholderText);
  }
  async hasCustomPlaceholder(placeholderText: string) {
    this.frame()
      .locator('.b-date-picker')
      .getByLabel('Icon')
      .click({ force: true });
    this.frame().locator('.--selected').click();
    await this.page.waitForTimeout(500);
    this.frame().getByRole('button', { name: 'Confirm' }).click();
    const input = this.frame().locator('.b-date-picker').locator('input');
    await expect(input).toHaveValue('');
    await expect(input).toHaveAttribute('placeholder', placeholderText);
  }

  async clickRequired() {
    this.getInput('required').click();
  }
  async hasRequiredIcon() {
    const label = this.frame()
      .locator('.b-date-picker')
      .locator('label', { hasText: '*' });
    await expect(label).toBeVisible();
  }

  async clickDisabled() {
    await this.getInput('disabled').click();
  }
  async hasDisabledInputAndIcon() {
    const input = this.frame().locator('.b-date-picker').locator('input');
    await expect(input).toBeDisabled();
    const icon = this.frame()
      .locator('.b-date-picker')
      .locator('input + label');
    await icon.click();
    await expect(
      this.frame().locator('.b-date-picker__menu'),
    ).not.toBeVisible();
  }

  async fillInputCssClass(cssClass: string) {
    await this.getTextarea('inputCssClass').fill(cssClass);
  }
  async hasInputCssClass(cssClass: string) {
    const input = this.frame().locator('.b-date-picker').locator('input');
    expect(await input.getAttribute('class')).toContain(cssClass);
  }

  async selectDateFromToday(dateCount: number) {
    this.frame()
      .locator('.b-date-picker')
      .getByLabel('Icon')
      .click({ force: true });

    const date = new Date();
    date.setDate(date.getDate() + dateCount);

    if (dateCount > 0) {
      await this.lookForInOtherMonths(date, true);
    } else {
      await this.lookForInOtherMonths(date, false);
    }

    await this.page.waitForTimeout(500);
    this.frame().getByRole('button', { name: 'Confirm' }).click();
  }
  async hasSelectedDateFromToday(dateCount: number) {
    const date = new Date();
    date.setDate(date.getDate() + dateCount);
    const expectedHeadingText = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    const input = this.frame().locator('.b-date-picker').locator('input');
    await expect(input).toHaveValue(expectedHeadingText);
  }

  //#region Private Methods
  private async lookForInOtherMonths(date: Date, isNext: boolean) {
    const months = Object.values(enUS.ds.components.base.date_picker.months);
    const expectedHeadingText = `${months[date.getMonth()]} ${date.getFullYear()}`;

    const heading = this.frame()
      .locator('.b-date-picker__menu')
      .locator('[aria-label="heading"]');
    let headingText = await heading.textContent();

    while (!headingText?.includes(expectedHeadingText)) {
      const navButton = isNext
        ? this.frame()
            .locator('.b-date-picker__menu')
            .locator('[aria-label="Next"]')
        : this.frame()
            .locator('.b-date-picker__menu')
            .locator('[aria-label="Previous"]');
      navButton.click();
      await this.page.waitForTimeout(200);
      headingText = await heading.textContent();
    }

    if (date.getDate() < 15) {
      this.frame()
        .locator('.b-date-picker__menu')
        .getByText(date.getDate().toString(), { exact: true })
        .first()
        .click();
    } else {
      this.frame()
        .locator('.b-date-picker__menu')
        .getByText(date.getDate().toString(), { exact: true })
        .last()
        .click();
    }
  }
  //#endregion
}
