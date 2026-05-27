import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  staticDirs: [
    './public',
    // Serve BIcon SVGs at the same URL the runtime fetch expects, both in dev
    // and in the built `storybook-static/`. The designSystem Vite plugin's
    // emit path is bypassed here because the project's vite.config.ts is in
    // lib mode, which short-circuits the plugin's closeBundle hook.
    { from: '../src/assets/icons', to: '/_design-system/icons' },
  ],
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  // Honor STORYBOOK_BASE_PATH (set by the deploy workflow for GitHub Pages)
  // so the built site references assets under the project subpath.
  // Storybook v10 has no `--base-path` CLI flag for `build`, hence viteFinal.
  async viteFinal(config) {
    if (process.env.STORYBOOK_BASE_PATH) {
      config.base = process.env.STORYBOOK_BASE_PATH
    }
    return config
  },
}
export default config
