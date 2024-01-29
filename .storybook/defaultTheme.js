import { create } from '@storybook/theming/create';
import packageJson from '../package.json';

export default create({
  base: 'dark',
  brandTitle: `Design System ${packageJson.version}`,
  // brandImage: 'logo.webp',
});
