import { createI18n, type I18nOptions } from 'vue-i18n';
import enUS from './en-US.json';
import viVN from './vi-VN.json';

const messages = {
  'vi-VN': viVN,
  'en-US': enUS,
} as I18nOptions['messages'];

export const i18nOptions = {
  messages,
  locale: 'vi-VN',
  availableLocales: ['vi-VN', 'en-US'],
  fallbackLocale: 'vi-VN',
  legacy: false,
  globalInjection: true,
  warnHtmlMessage: false,
};

export default createI18n(i18nOptions);
