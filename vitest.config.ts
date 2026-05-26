import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Drop the design-system plugin during tests — it scans src/ for static
// `<BIcon>` usages and inlines them, which would replace the BIcon module's
// sentinel literal with a populated map and break the runtime-fetch tests
// in BIcon.spec.ts. The plugin itself is exercised by the integration tests.
const viteConfigForTest = {
  ...viteConfig,
  plugins: viteConfig.plugins?.filter(
    (p) => !p || typeof p !== 'object' || !('name' in p) || p.name !== '@7pmlabs/design-system',
  ),
}

export default mergeConfig(
  viteConfigForTest,
  defineConfig({
    test: {
      projects: [
        // Unit tests (jsdom, @vue/test-utils)
        {
          extends: true,
          test: {
            name: 'unit',
            environment: 'jsdom',
            include: ['src/**/*.spec.ts'],
            exclude: [...configDefaults.exclude, 'e2e/**'],
            root: fileURLToPath(new URL('./', import.meta.url)),
          },
        },
        // Storybook stories as browser-based component tests
        // https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
        {
          extends: true,
          plugins: [
            storybookTest({
              configDir: join(__dirname, '.storybook'),
              // Auto-start Storybook in watch mode; prevents
              // "No existing state found for follower" errors.
              storybookScript: 'npx storybook dev -p 6006 --no-open',
            }),
          ],
          test: {
            name: 'storybook',
            browser: {
              enabled: true,
              headless: true,
              provider: 'playwright',
              instances: [{ browser: 'chromium' }],
            },
          },
        },
      ],
    },
  }),
)
