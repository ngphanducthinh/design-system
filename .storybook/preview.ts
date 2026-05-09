import type { Preview } from '@storybook/vue3-vite';
import '../src/assets/main.css';

function applyColorScheme(scheme: 'light' | 'dark') {
  // Set data-prefers-color on <html> - the single source of truth.
  // main.css maps this to color-scheme: light/dark for native browser UI.
  // Component styles use [data-prefers-color='dark'] ancestor selectors.
  document.documentElement.setAttribute('data-prefers-color', scheme);
}

const preview: Preview = {
  globalTypes: {
    colorScheme: {
      description: 'Color scheme',
      toolbar: {
        title: 'Color scheme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    colorScheme: 'light',
  },
  decorators: [
    (story, context) => {
      applyColorScheme((context.globals.colorScheme ?? 'light') as 'light' | 'dark');
      return story();
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      codePanel: true,
    },
    options: {
      // https://storybook.js.org/docs/writing-stories/naming-components-and-hierarchy#sorting-stories
      storySort: {
        order: ['General', 'Data Display', 'Feedback'],
      },
    },
    // Accessibility testing: automatically run axe-core on every story.
    // 'error' makes violations fail the test; use 'todo' for known issues.
    // https://storybook.js.org/docs/writing-tests/accessibility-testing
    a11y: {
      test: 'error',
      // Exclude Vue DevTools anchor button (injected by vite-plugin-vue-devtools)
      // which has aria-label on a div without a valid role.
      context: {
        exclude: ['.vue-devtools__anchor'],
      },
    },
  },
};

export default preview;
