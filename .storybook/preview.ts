import type { Preview } from '@storybook/vue3';
// Locales
import { setup } from '@storybook/vue3';
// CSS
import '../src/assets/styles/main.scss';
// Icon
import '../src/assets/styles-demo/icon.css';
import { createI18n } from 'vue-i18n';
// @ts-ignore
import { i18nOptions } from '../src/locales';

setup((app) => {
  const i18n = createI18n({
    ...i18nOptions,
    locale: 'en-US',
    fallbackLocale: 'en-US',
  });
  app.use(i18n);
});

const preview: Preview = {
  parameters: {
    // https://storybook.js.org/docs/essentials/actions#via-storybooktest-fn-spy-function
    actions: { argTypesRegex: '^on.*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
