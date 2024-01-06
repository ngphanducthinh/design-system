import { BLabel } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta<typeof BLabel> = {
  title: 'Components/Label',
  parameters: {
    docs: {
      description: {
        component: `The <code>BLabel</code> component is used for displaying label of field.`,
      },
    },
  },
  component: BLabel,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  // argTypes: {},
  args: {
    id: '',
    label: '',
    required: false,
  },
};

export default meta;
type Story = StoryObj<typeof BLabel>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BLabel },
    setup() {
      return { args };
    },
    template: `
      <BLabel v-bind="args" ></BLabel>
    `,
  }),
  args: {
    label: 'Label',
  },
};

export const DefaultSlot: Story = {
  render: (args: any) => ({
    components: { BLabel },
    setup() {
      return { args };
    },
    template: `
      <BLabel v-bind="args"> Label from default slot </BLabel>
    `,
  }),
  args: {},
};
