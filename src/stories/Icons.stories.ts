import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Icons from './Icons.vue';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Example/Icons',
  component: Icons,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Icons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args: any) => ({
    components: { Icons },
    setup() {
      return { args };
    },
    template: `
      <Icons />
    `,
  }),
};
