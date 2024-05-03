import { test } from '@/e2e/fixtures/Test';
import { BDatePickerView } from '@/constants/Enums';

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
  await datePickerPage.openDatePickerMenu();
  await datePickerPage.selectDateFromToday(35);
  await datePickerPage.hasSelectedDateFromToday(35);
});

test('select any date before today', async ({ datePickerPage }) => {
  await datePickerPage.openDatePickerMenu();
  await datePickerPage.selectDateFromToday(-23);
  await datePickerPage.hasSelectedDateFromToday(-23);
});

test('adjust minDate', async ({ datePickerPage }) => {
  await datePickerPage.fillMinDateFromToday(-20);
  await datePickerPage.hasDisabledDateFromToday(-22); // The day before "minDate" will be disabled
});

test('adjust maxDate', async ({ datePickerPage }) => {
  await datePickerPage.fillMaxDateFromToday(25);
  await datePickerPage.hasDisabledDateFromToday(26); // The day after "maxDate" will be disabled
});

test('turn on range', async ({ datePickerPage }) => {
  await datePickerPage.clickRange();
  await datePickerPage.openDatePickerMenu();
  await datePickerPage.selectDateFromToday(-3, false);
  await datePickerPage.selectDateFromToday(5);
  await datePickerPage.hasSelectedDatesInRage(-3, 5);
});

test('adjust view', async ({ datePickerPage }) => {
  await datePickerPage.selectView(BDatePickerView.Years);
  await datePickerPage.hasViewAsDefaultWhenOpenMenu(BDatePickerView.Years);
  await datePickerPage.selectView(BDatePickerView.Months);
  await datePickerPage.hasViewAsDefaultWhenOpenMenu(BDatePickerView.Months);
  await datePickerPage.selectView(BDatePickerView.Dates);
  await datePickerPage.hasViewAsDefaultWhenOpenMenu(BDatePickerView.Dates);
});
