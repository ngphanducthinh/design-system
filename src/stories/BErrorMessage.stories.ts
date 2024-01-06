import { BErrorMessage } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta<typeof BErrorMessage> = {
  title: 'Components/ErrorMessage',
  parameters: {
    docs: {
      description: {
        component: `The <code>BErrorMessage</code> component is used for displaying error message.`,
      },
    },
  },
  component: BErrorMessage,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    default: {
      control: 'text',
      description: 'Error message',
    },
  },
  args: {
    errorMessage: 'This is an error message.',
  },
};

export default meta;
type Story = StoryObj<typeof BErrorMessage>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BErrorMessage },
    setup() {
      return { args };
    },
    template: `
      <BErrorMessage v-if="args.default" v-bind="args">
        <span v-html="args.default" />
      </BErrorMessage>
      <BErrorMessage v-else v-bind="args" />
    `,
  }),
  args: {},
};
