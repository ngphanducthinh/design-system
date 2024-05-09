import { expect, type Page } from '@playwright/test';
import { HelperBase } from '@/e2e/page-objects/HelperBase';
import enUS from '@/locales/en-US.json';
import { BDatePickerView } from '@/constants/Enums';

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
    await this.frame().locator('.b-date-picker').getByLabel('Icon').click();
    await this.frame().locator('.--selected').click();
    await this.frame().getByRole('button', { name: 'Confirm' }).click();
    const input = this.frame().locator('.b-date-picker').locator('input');
    await expect(input).toHaveValue('');
    await expect(input).toHaveAttribute('placeholder', placeholderText);
  }

  async clickRequired() {
    await this.getInput('required').click();
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

  async openDatePickerMenu() {
    await this.frame().locator('.b-date-picker').getByLabel('Icon').click();
  }
  async selectDateFromToday(dateCount: number, clickConfirm: boolean = true) {
    const date = new Date();
    date.setDate(date.getDate() + dateCount);

    await this.goToDesiredDateGrid(date);
    if (date.getDate() < 15) {
      await this.frame()
        .locator('.b-date-picker__menu')
        .getByText(date.getDate().toString(), { exact: true })
        .first()
        .click();
    } else {
      await this.frame()
        .locator('.b-date-picker__menu')
        .getByText(date.getDate().toString(), { exact: true })
        .last()
        .click();
    }

    if (clickConfirm) {
      await this.frame().getByRole('button', { name: 'Confirm' }).click();
    }
  }
  async hasSelectedDateFromToday(dateCount: number) {
    const date = new Date();
    date.setDate(date.getDate() + dateCount);
    const expectedHeadingText = this.getDateMonthYearText(date, '/');
    const input = this.frame().locator('.b-date-picker').locator('input');
    await expect(input).toHaveValue(expectedHeadingText);
  }

  async fillMinDateFromToday(dateCount: number) {
    const date = new Date();
    date.setDate(date.getDate() + dateCount);

    await this.frame()
      .getByRole('table')
      .locator('tr', { hasText: 'minDate' })
      .locator(`input[id="control-minDate-date"]`)
      .fill(this.getYearMonthDateText(date, '-'));
  }
  async fillMaxDateFromToday(dateCount: number) {
    const date = new Date();
    date.setDate(date.getDate() + dateCount);

    await this.frame()
      .getByRole('table')
      .locator('tr', { hasText: 'maxDate' })
      .locator(`input[id="control-maxDate-date"]`)
      .fill(this.getYearMonthDateText(date, '-'));
  }
  async hasDisabledDateFromToday(dateCount: number) {
    await this.frame().locator('.b-date-picker').getByLabel('Icon').click();

    const date = new Date();
    date.setDate(date.getDate() + dateCount);

    await this.goToDesiredDateGrid(date);
    if (date.getDate() < 15) {
      await expect(
        this.frame()
          .locator('.b-date-picker__menu')
          .getByText(date.getDate().toString(), { exact: true })
          .first(),
      ).toBeDisabled();
    } else {
      await expect(
        this.frame()
          .locator('.b-date-picker__menu')
          .getByText(date.getDate().toString(), { exact: true })
          .last(),
      ).toBeDisabled();
    }
  }

  async clickRange() {
    await this.getInput('range').click();
  }
  async hasSelectedDatesInRage(startCount: number, endCount: number) {
    const startDate = new Date(
      new Date().setDate(new Date().getDate() + startCount),
    );
    const endDate = new Date(
      new Date().setDate(new Date().getDate() + endCount),
    );
    const expectedHeadingText = `${this.getDateMonthYearText(startDate, '/')} - ${this.getDateMonthYearText(endDate, '/')}`;
    const input = this.frame().locator('.b-date-picker').locator('input');
    await expect(input).toHaveValue(expectedHeadingText);
  }

  async selectView(view: BDatePickerView) {
    await this.frame()
      .getByRole('table')
      .locator('tr', { hasText: 'view' })
      .locator('select[id="control-view"]')
      .selectOption(view);
  }
  async hasViewAsDefaultWhenOpenMenu(view: BDatePickerView) {
    await this.frame().locator('.b-date-picker').getByLabel('Icon').click();
    const viewClasses: Record<BDatePickerView, string> = {
      [BDatePickerView.Years]: '.b-date-picker__grid-year',
      [BDatePickerView.Months]: '.b-date-picker__grid-month',
      [BDatePickerView.Dates]: '.b-date-picker__grid-date',
    };
    await expect(this.frame().locator(viewClasses[view])).toBeVisible();

    await this.frame().getByRole('button', { name: 'Cancel' }).click();
  }

  //#region Private Methods
  private getDateMonthYearText = (date: Date, delimiter: string): string =>
    `${date.getDate().toString().padStart(2, '0')}${delimiter}${(date.getMonth() + 1).toString().padStart(2, '0')}${delimiter}${date.getFullYear()}`;
  private getYearMonthDateText = (date: Date, delimiter: string): string =>
    `${date.getFullYear()}${delimiter}${(date.getMonth() + 1).toString().padStart(2, '0')}${delimiter}${date.getDate().toString().padStart(2, '0')}`;
  private async goToDesiredDateGrid(date: Date) {
    const heading = this.frame()
      .locator('.b-date-picker__menu')
      .locator('[aria-label="heading"]');

    await heading.click();

    await heading.click();

    const [startYear, endYear] = (await heading.textContent())!.split(' - ');
    const expectedYear = date.getFullYear();
    while (expectedYear < +startYear) {
      await this.frame()
        .locator('.b-date-picker__menu')
        .locator('[aria-label="Previous"]')
        .click();
    }
    while (expectedYear > +endYear) {
      await this.frame()
        .locator('.b-date-picker__menu')
        .locator('[aria-label="Next"]')
        .click();
    }

    await this.frame()
      .locator('.b-date-picker__menu')
      .getByText(expectedYear.toString(), { exact: true })
      .first()
      .click();

    const monthsShort = Object.values(
      enUS.ds.components.base.date_picker.months_short,
    );
    await this.frame()
      .locator('.b-date-picker__menu')
      .getByText(monthsShort[date.getMonth()].toString(), { exact: true })
      .click();

    const months = Object.values(enUS.ds.components.base.date_picker.months);
    const expectedHeadingText = `${months[date.getMonth()]} ${date.getFullYear()}`;
    expect(
      await this.frame()
        .locator('.b-date-picker__menu')
        .locator('[aria-label="heading"]')
        .textContent(),
    ).toEqual(expectedHeadingText);
  }
  //#endregion
}
