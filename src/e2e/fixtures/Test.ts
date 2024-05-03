import { test as base } from '@playwright/test';
import { PageManager } from '@/e2e/page-objects/PageManager';
import type { DatePickerPage } from '@/e2e/page-objects/DatePickerPage';

interface TestOptions {
  datePickerPage: DatePickerPage;
  pm: PageManager;
}

export const test = base.extend<TestOptions>({
  datePickerPage: async ({ page }, use) => {
    const pageManger = new PageManager(page);
    await pageManger.navigateTo().datePickerPage();
    await use(pageManger.onDatePickerPage());
  },
  pm: async ({ page }, use) => {
    const pageManger = new PageManager(page);
    await use(pageManger);
  },
});
