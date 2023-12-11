import type { App } from 'vue';
import type { I18n } from 'vue-i18n';
import enUS from './locales/en-US.json';
import viVN from './locales/vi-VN.json';

export default {
  install: (app: App<Element>, options: { i18n: I18n }) => {
    if (options?.i18n) {
      const { mergeLocaleMessage } = options.i18n.global;
      mergeLocaleMessage('vi-VN', viVN);
      mergeLocaleMessage('en-US', enUS);
    }
  },
};
