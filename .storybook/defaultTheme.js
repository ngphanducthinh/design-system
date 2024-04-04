import { create } from '@storybook/theming/create';

const BRAND_TITLE = 'Design System';

async function getLatestVersion(packageName) {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}`);
    const data = await response.json();
    const latestVersion = data['dist-tags'].latest;

    const headerTitleEl = document.querySelector('.sidebar-header div a');
    if (headerTitleEl) {
      headerTitleEl.textContent = `${BRAND_TITLE} ${latestVersion}`;
    }
    return latestVersion;
  } catch (error) {
    console.error('Error fetching package version:', error.message);
  }
}
getLatestVersion('@7pmlabs/design-system');

// https://storybook.js.org/docs/configure/theming
export default create({
  base: 'dark',
  brandTitle: `${BRAND_TITLE}`,
  // brandImage: 'logo.webp',

  // UI
  appBg: '#111827',
  appContentBg: '#1F2937',
  // appPreviewBg: '#1F2937',

  // Toolbar default and active colors
  barBg: '#111827',
});
