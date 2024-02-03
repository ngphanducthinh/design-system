import { create } from '@storybook/theming/create';
import packageJson from '../package.json';

// https://storybook.js.org/docs/configure/theming
export default create({
  base: 'dark',
  brandTitle: `Design System ${packageJson.version}`,
  // brandImage: 'logo.webp',

  // UI
  appBg: '#111827',
  appContentBg: '#1F2937',
  // appPreviewBg: '#1F2937',

  // Toolbar default and active colors
  barBg: '#111827',
});
