import { BButton } from '@/components';
import { BButtonSize, BButtonType } from '@/constants/Enums';
import type { Meta, StoryObj } from '@storybook/vue3';

// More on how to set up stories at: https://storybook.js.org/docs/vue/writing-stories/introduction
const meta: Meta<typeof BButton> = {
  title: 'Components/Button',
  component: BButton,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/vue/writing-docs/autodocs
  // https://storybook.js.org/blog/storybook-7-docs/
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: Object.values(BButtonType) as string[],
    },
    size: {
      control: 'select',
      options: Object.values(BButtonSize) as string[],
    },
  },
  args: { type: 'primary' }, // default value
};

export default meta;

type Story = StoryObj<typeof BButton>;
export const Primary: Story = {
  render: (args: any) => ({
    components: { BButton },
    setup() {
      return { args };
    },
    template: '<BButton v-bind="args">Primary</BButton>',
  }),
  args: {
    type: 'primary',
  },
};

export const Secondary: Story = {
  render: (args: any) => ({
    components: { BButton },
    setup() {
      return { args };
    },
    template: '<BButton v-bind="args">Secondary</BButton>',
  }),
  args: {
    type: 'secondary',
  },
};

export const Additional: Story = {
  render: (args: any) => ({
    components: { BButton },
    setup() {
      return { args };
    },
    template: '<BButton v-bind="args">Additional</BButton>',
  }),
  args: {
    type: 'additional',
  },
};

export const Clear: Story = {
  render: (args: any) => ({
    components: { BButton },
    setup() {
      return { args };
    },
    template: '<BButton v-bind="args">Clear</BButton>',
  }),
  args: {
    type: 'clear',
  },
};

export const Icon: Story = {
  render: (args: any) => ({
    components: { BButton },
    setup() {
      return { args };
    },
    template:
      '<BButton v-bind="args"><i class="fa-solid fa-circle-check" /></BButton>',
  }),
  args: {
    type: 'icon',
  },
};
