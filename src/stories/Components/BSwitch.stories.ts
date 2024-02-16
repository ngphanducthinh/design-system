import { BSwitch } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';

// More on how to set up stories at: https://storybook.js.org/docs/vue/writing-stories/introduction
const meta: Meta<typeof BSwitch> = {
  title: 'Components/Switch',
  parameters: {
    docs: {
      description: {
        component: `The <code>BSwitch</code> component provides users the ability to choose between two distinct values. These are very similar to a toggle, or on/off switch, though aesthetically different from a checkbox.`,
      },
    },
  },
  component: BSwitch,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/vue/writing-docs/autodocs
  tags: ['autodocs'],
  argTypes: {},
  args: {
    inputId: '',
    modelValue: false,
    label: '',
    labelOrphan: false,
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof BSwitch>;
export const Medium: Story = {
  render: (args: any) => ({
    components: { BSwitch },
    setup() {
      return { args };
    },
    template: `
      <BSwitch v-bind="args">
        {{ args.label || 'Switch/Toggle' }}
      </BSwitch>`,
  }),
  args: {},
};
