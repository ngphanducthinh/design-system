/* eslint-disable no-undef */

require('@rushstack/eslint-patch/modern-module-resolution');

// https://eslint.vuejs.org/rules/prefer-import-from-vue.html
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-strongly-recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
    'plugin:@intlify/vue-i18n/base',
    'plugin:storybook/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
      alias: {
        map: [['@', './src']],
        extensions: ['.ts', '.js', '.jsx', '.json'],
      },
    },
    'vue-i18n': {
      localeDir: './src/locales/*.{json,json5,yaml,yml}',
      messageSyntaxVersion: '^9.0.0',
    },
  },
  rules: {
    'vue/no-v-html': 'off',
    // DO NOT use the HTML content from end users and always sanitize the HTML content
    '@intlify/vue-i18n/no-missing-keys': 'error',
    '@intlify/vue-i18n/no-raw-text': 'warn',
  },
  // https://eslint.org/docs/latest/use/configure/ignore
  ignorePatterns: ['**/vendor/**'],
};
