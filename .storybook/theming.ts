import { create } from 'storybook/theming';
import { version } from '../package.json';

export default create({
  base: 'dark',
  brandTitle: `7PMLabs DS <a href="https://www.npmjs.com/package/@7pmlabs/design-system" target="_blank" rel="noopener noreferrer" title="View on npm" style="display:inline-flex;align-items:center;margin-left:8px;padding:2px 6px;border-radius:6px;background:rgba(203,56,55,0.15);color:#ff6b6b;vertical-align:middle;text-decoration:none;"><svg width="20" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.665H5.334v-4H3.999v4H1.335V8.667h5.331v5.332zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.332zM10.665 10H12v2.667h-1.335V10z"/></svg></a><span style="margin-left:6px;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:500;background:rgba(255,255,255,0.1);color:#9ca3af;vertical-align:middle;">v${version}</span>`,
  // brandUrl: 'https://example.com',
  // brandImage: '/logo.png',
  brandTarget: '_self',
});
