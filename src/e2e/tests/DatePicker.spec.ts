import { test } from '@/e2e/fixtures/Test';

test('adjust inputId', async ({ datePickerPage }) => {
  await datePickerPage.fillInputId('custom-id');
  await datePickerPage.hasCustomInputId('custom-id');
});

test('adjust label', async ({ datePickerPage }) => {
  await datePickerPage.fillLabel('Birthday');
  await datePickerPage.hasCustomLabel('Birthday');
});

test('adjust placeholder', async ({ datePickerPage }) => {
  await datePickerPage.fillPlaceholder('Please fill birthday...');
  await datePickerPage.hasCustomPlaceholder('Please fill birthday...');
});

test('turn on required', async ({ datePickerPage }) => {
  await datePickerPage.fillLabel('Birthday');
  await datePickerPage.clickRequired();
  await datePickerPage.hasRequiredIcon();
});

test('turn on disabled', async ({ datePickerPage }) => {
  await datePickerPage.clickDisabled();
  await datePickerPage.hasDisabledInputAndIcon();
});

test('adjust inputCssClass', async ({ datePickerPage }) => {
  await datePickerPage.fillInputCssClass('long-test-css-class');
  await datePickerPage.hasInputCssClass('long-test-css-class');
});

test('select any date after today', async ({ datePickerPage }) => {
  await datePickerPage.selectDateFromToday(35);
  await datePickerPage.hasSelectedDateFromToday(35);
});

test('select any date before today', async ({ datePickerPage }) => {
  await datePickerPage.selectDateFromToday(-23);
  await datePickerPage.hasSelectedDateFromToday(-23);
});

test('adjust minDate', async ({ datePickerPage, page }) => {
  // await datePickerPage
  //   .frame()
  //   .getByRole('table')
  //   .locator('tr', { hasText: 'minDate' })
  //   .locator(`input[id="control-minDate-date"]`)
  //   .fill('2020-02-02');
});

test('adjust maxDate', async ({ datePickerPage, page }) => {});

test('turn on range', async ({ datePickerPage, page }) => {});

test('turn on hideDetails', async ({ datePickerPage, page }) => {});

test('adjust view', async ({ datePickerPage, page }) => {});
