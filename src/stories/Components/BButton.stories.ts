import { BButton } from '../../components';
import { BButtonSize, BButtonType } from '../../constants/Enums';
import type { Meta, StoryObj } from '@storybook/vue3';

// More on how to set up stories at: https://storybook.js.org/docs/vue/writing-stories/introduction
const meta: Meta<typeof BButton> = {
  title: 'Components/Button',
  parameters: {
    docs: {
      description: {
        component: `The <code>BButton</code> component with multitude of options replaces the standard html button.`,
      },
    },
  },
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
    prependIcon: {
      control: 'text',
      description: 'Prepend icon',
    },
    default: {
      control: 'text',
      description: "Button's content",
    },
    appendIcon: {
      control: 'text',
      description: 'Append icon',
    },
  },
  args: {
    type: BButtonType.Primary,
  }, // default value
};

export default meta;

type Story = StoryObj<typeof BButton>;
export const Primary: Story = {
  render: (args: any) => ({
    components: { BButton },
    setup() {
      return { args };
    },
    template: `
      <BButton v-bind="args">
        <template v-if="args.prependIcon" #prependIcon><span v-html="args.prependIcon" /></template>
        <span v-html="args.default" />
        <template v-if="args.appendIcon" #appendIcon><span v-html="args.appendIcon" /></template>
      </BButton>
      <div style="font-size: 0.75rem; color: gray; margin-top: 1rem">
        <b>FontAwesome v6.1.0 - Solid</b> has been imported already & can be used for demo.
      </div>
    `,
  }),
  args: {
    type: 'primary',
    default: 'Primary',
    prependIcon: '',
    appendIcon: '<i class="fa-solid fa-floppy-disk" />',
  },
};

export const Secondary: Story = {
  render: (args: any) => ({
    components: { BButton },
    setup() {
      return { args };
    },
    template: `
      <BButton v-bind="args">
        <template v-if="args.prependIcon" #prependIcon><span v-html="args.prependIcon" /></template>
        <span v-html="args.default" />
        <template v-if="args.appendIcon" #appendIcon><span v-html="args.appendIcon" /></template>
      </BButton>`,
  }),
  args: {
    type: 'secondary',
    default: 'Secondary',
  },
};

export const Additional: Story = {
  render: (args: any) => ({
    components: { BButton },
    setup() {
      return { args };
    },
    template: `
      <BButton v-bind="args">
        <template v-if="args.prependIcon" #prependIcon><span v-html="args.prependIcon" /></template>
        <span v-html="args.default" />
        <template v-if="args.appendIcon" #appendIcon><span v-html="args.appendIcon" /></template>
      </BButton>`,
  }),
  args: {
    type: 'additional',
    default: 'Additional',
  },
};

export const Clear: Story = {
  render: (args: any) => ({
    components: { BButton },
    setup() {
      return { args };
    },
    template: `
      <BButton v-bind="args">
        <template v-if="args.prependIcon" #prependIcon><span v-html="args.prependIcon" /></template>
        <span v-html="args.default" />
        <template v-if="args.appendIcon" #appendIcon><span v-html="args.appendIcon" /></template>
      </BButton>`,
  }),
  args: {
    type: 'clear',
    default: 'Clear',
  },
};

export const Icon: Story = {
  render: (args: any) => ({
    components: { BButton },
    setup() {
      return { args };
    },
    template: `
      <BButton v-bind="args">
        <template v-if="args.prependIcon" #prependIcon><span v-html="args.prependIcon" /></template>
        <span v-html="args.default" />
        <template v-if="args.appendIcon" #appendIcon><span v-html="args.appendIcon" /></template>
      </BButton>`,
  }),
  args: {
    type: 'icon',
    default: '<i class="fa-solid fa-circle-check" />',
  },
};
