import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { BInput } from '../components';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Example/Input',
  component: BInput,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      name: 'v-model',
      description: 'Model for the input field.',
      type: { name: 'string', required: true },
      control: { type: 'text' },
      table: {
        category: 'Props - Two-Way Binding',
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BButton</code> component is a versatile button component that supports various colors, sizes, and variants.<br><br>' +
          '🔵 Primary button: used for the main action, there can be at most one primary button in a section.<br>' +
          '⚪️ Secondary button: used for a series of actions without priority.<br>' +
          '😶 Dashed button: commonly used for adding more actions.<br>' +
          '🔤 Text button: used for the most secondary action.<br>' +
          '🔗 Link button: used for external links.',
      },
    },
  },
} satisfies Meta<typeof BInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * This story demonstrates the default usage of the BInput component.
 */
export const Default: Story = {
  render: (args: any) => ({
    components: { BInput },
    setup() {
      return { args };
    },
    template: `
      <BInput v-bind="args" />
    `,
  }),
};
