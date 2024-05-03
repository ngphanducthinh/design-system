import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/e2e/tests',
  fullyParallel: true,
  retries: 2,
  reporter: 'html',
  use: {
    baseURL: 'https://ngphanducthinh.github.io/7pmlabs-design-system/',
    trace: 'on-first-retry',
    actionTimeout: 10 * 1000,
    navigationTimeout: 8 * 1000,
  },
  expect: {
    timeout: 10 * 1000,
  },

  projects: [
    {
      name: 'Chrome/Edge',
      use: {
        browserName: 'chromium',
        viewport: {
          width: 1280,
          height: 1024,
        },
      },
    },
  ],
});
