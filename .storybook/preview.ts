import type { Preview } from '@storybook/vue3-vite';
import '../src/assets/resetUAS.css';
import '../src/assets/tailwind.css';

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
  },
};

export default preview;
