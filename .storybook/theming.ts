import { create } from 'storybook/theming';
import { version } from '../package.json';

export default create({
  base: 'dark',
  brandTitle: `Thinh's DS <span style="margin-left:8px;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:500;background:rgba(255,255,255,0.1);color:#9ca3af;vertical-align:middle;">v${version}</span>`,
  // brandUrl: 'https://example.com',
  // brandImage: '/logo.png',
  brandTarget: '_self',
});
