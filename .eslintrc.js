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
  },
  rules: {
    'vue/no-v-html': 'off', // DO NOT use the HTML content from end users and always sanitize the HTML content
  },
  // https://eslint.org/docs/latest/use/configure/ignore
  ignorePatterns: ['**/vendor/**'],
};
