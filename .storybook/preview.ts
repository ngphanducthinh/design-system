import type { Preview } from '@storybook/vue3-vite';
import '../src/assets/main.css';

const preview: Preview = {
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
  },
};

export default preview;
