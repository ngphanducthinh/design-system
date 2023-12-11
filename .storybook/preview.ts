import type { Preview } from '@storybook/vue3';
// CSS
import '../src/assets/styles/main.scss';
// Icons
import '7pmlabs-icons/style.css';
// Locales
import { setup } from '@storybook/vue3';
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
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
