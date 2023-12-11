import { BErrorMessage } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta<typeof BErrorMessage> = {
  title: 'Components/ErrorMessage',
  component: BErrorMessage,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  // argTypes: {},
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
      <BErrorMessage v-bind="args"  />
    `,
  }),
  args: {},
};
