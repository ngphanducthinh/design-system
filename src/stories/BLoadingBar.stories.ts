import { BLoadingBar } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta<typeof BLoadingBar> = {
  title: 'Components/LoadingBar',
  component: BLoadingBar,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  // argTypes: {},
  args: {
    height: '',
    borderRadius: '',
    absolute: false,
  },
};

export default meta;
type Story = StoryObj<typeof BLoadingBar>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BLoadingBar },
    setup() {
      return { args };
    },
    template: `
      <BLoadingBar v-bind="args" />
    `,
  }),
  args: {
    loading: true,
  },
};
