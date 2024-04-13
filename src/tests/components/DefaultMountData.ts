import { i18nOptions } from '@/locales';
import { createI18n } from 'vue-i18n';

/**
 * One possible reason for getting props undefined error when mounting with props is that your component has some dependency that is not mocked properly.
 * For example, if your component uses a translation function that is imported from another module, you need to mock that function before mounting the component with props.
 * Otherwise, the component will fail to render and you will get a false positive on props.
 */
const i18n = createI18n(i18nOptions);
const mountData = {
  global: {
    plugins: [i18n],
  },
};

export default mountData;
