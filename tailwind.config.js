/* eslint-disable no-undef */
module.exports = {
  prefix: 'ds-',
  theme: {
    extend: {
      colors: {
        error: '#ec3741',
        'gray-150': '#f2f2f2',
        'primary-f': 'rgb(var(--ds-colors-primary-f) / <alpha-value>)',
        'primary-t': 'rgb(var(--ds-colors-primary-t) / <alpha-value>)',
        focus: 'rgb(var(--ds-colors-focus) / <alpha-value>)',
      },
      dropShadow: {
        light: '0 1px 3px rgba(0, 0, 0, 0.11)',
      },
      boxShadow: {
        DEFAULT:
          '0px 5px 10px rgba(0, 0, 0, 0.04), 0px 1px 2px rgba(0, 0, 0, 0.06)',
      },
      gradientColorStopPositions: {
        'primary-f-stop': 'var(--ds-colors-primary-f-stop)',
        'primary-t-stop': 'var(--ds-colors-primary-t-stop)',
      },
      height: {
        4.5: '1.125rem',
      },
      width: {
        4.5: '1.125rem',
      },
      zIndex: {
        100: 100,
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
  content: ['./src/**/*.{html,ts,vue}', './public/index.html'],
  safelist: [],
};
