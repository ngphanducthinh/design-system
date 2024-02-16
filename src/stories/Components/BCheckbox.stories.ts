import { BCheckbox } from '@/components';
import { BCheckboxSize } from '@/constants/Enums';
import type { Meta, StoryObj } from '@storybook/vue3';

// More on how to set up stories at: https://storybook.js.org/docs/vue/writing-stories/introduction
const meta: Meta<typeof BCheckbox> = {
  title: 'Components/Checkbox',
  parameters: {
    docs: {
      description: {
        component: `The <code>BCheckbox</code> component provides users the ability to choose between two distinct values. These are very similar to a switch and can be used in complex forms and checklists.`,
      },
    },
  },
  component: BCheckbox,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/vue/writing-docs/autodocs
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: Object.values(BCheckboxSize) as string[],
    },
  },
  args: {
    inputId: '',
    modelValue: false,
    label: '',
    labelOrphan: false,
    disabled: false,
    size: BCheckboxSize.Medium,
  },
};

export default meta;

type Story = StoryObj<typeof BCheckbox>;
export const Medium: Story = {
  render: (args: any) => ({
    components: { BCheckbox },
    setup() {
      return { args };
    },
    template: `
      <BCheckbox v-bind="args">
        {{ args.label || 'Medium' }}
      </BCheckbox>`,
  }),
  args: {
    size: BCheckboxSize.Medium,
  },
};

export const Small: Story = {
  render: (args: any) => ({
    components: { BCheckbox },
    setup() {
      return { args };
    },
    template: `
      <BCheckbox v-bind="args">
        {{ args.label || 'Small' }}
      </BCheckbox>`,
  }),
  args: {
    size: BCheckboxSize.Small,
  },
};
