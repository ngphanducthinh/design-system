import { BSteps } from '@/components';
import {
  BCommonSize,
  BStepsDirection,
  BStepsLabelPlacement,
  BStepsStatus,
  BStepsType,
} from '@/types.ts';
import { expect, userEvent, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

const meta = {
  title: 'Navigation/Steps',
  component: BSteps,
  tags: ['autodocs'],
  argTypes: {
    current: { control: 'number' },
    direction: { control: 'select', options: Object.values(BStepsDirection) },
    labelPlacement: { control: 'select', options: Object.values(BStepsLabelPlacement) },
    size: { control: 'select', options: Object.values(BCommonSize) },
    status: { control: 'select', options: Object.values(BStepsStatus) },
    type: { control: 'select', options: Object.values(BStepsType) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BSteps</code> component is used to display progress through a sequence of steps.',
      },
    },
  },
} satisfies Meta<typeof BSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    current: 1,
    direction: BStepsDirection.Horizontal,
    labelPlacement: BStepsLabelPlacement.Horizontal,
    size: BCommonSize.Medium,
    status: BStepsStatus.Process,
    type: BStepsType.Default,
    items: [
      {
        title: 'Verify email',
        description: 'Confirm your email address to proceed.',
      },
      {
        title: 'Profile setup',
        description: 'Fill in the essential profile details.',
      },
      {
        title: 'Finish',
        description: 'Review and submit.',
      },
    ],
  },
  argTypes: {
    current: {
      table: { category: 'Two-Way Binding Props' },
    },
  },
  render: (args: any) => ({
    components: { BSteps },
    setup() {
      const current = ref(args.current);
      return { args, current };
    },
    template: `
      <BSteps v-bind="args" v-model:current="current" />
    `,
  }),
};

export const Interactive: Story = {
  args: {
    current: 0,
    direction: BStepsDirection.Horizontal,
    labelPlacement: BStepsLabelPlacement.Horizontal,
    size: BCommonSize.Medium,
    status: BStepsStatus.Process,
    type: BStepsType.Navigation,
    items: [
      { title: 'Verify email' },
      { title: 'Profile setup' },
      { title: 'Finish' },
    ],
  },
  render: (args: any) => ({
    components: { BSteps },
    setup() {
      const current = ref(args.current);
      return { args, current };
    },
    template: `
      <BSteps v-bind="args" v-model:current="current" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const profileStep = await canvas.findByText('Profile setup');

    await userEvent.click(profileStep);

    const activeStep = canvasElement.querySelector('[aria-current="step"]');
    expect(activeStep).toBeTruthy();
    expect(activeStep?.textContent).toContain('Profile setup');
  },
};

export const Vertical: Story = {
  args: {
    current: 1,
    direction: BStepsDirection.Vertical,
    labelPlacement: BStepsLabelPlacement.Horizontal,
    size: BCommonSize.Medium,
    status: BStepsStatus.Process,
    type: BStepsType.Default,
    items: [
      {
        title: 'Choose plan',
        description: 'Select the plan that fits your team.',
      },
      {
        title: 'Billing info',
        description: 'Add your payment details.',
      },
      {
        title: 'Launch',
        description: 'Invite teammates and go live.',
      },
    ],
  },
  render: (args: any) => ({
    components: { BSteps },
    setup() {
      const current = ref(args.current);
      return { args, current };
    },
    template: `
      <div class="b:max-w-md">
        <BSteps v-bind="args" v-model:current="current" />
      </div>
    `,
  }),
};

export const LabelVertical: Story = {
  args: {
    current: 0,
    direction: BStepsDirection.Horizontal,
    labelPlacement: BStepsLabelPlacement.Vertical,
    size: BCommonSize.Medium,
    status: BStepsStatus.Process,
    type: BStepsType.Default,
    items: [
      { title: 'Draft', description: 'Write the first version.' },
      { title: 'Review', description: 'Collect feedback.' },
      { title: 'Publish', description: 'Share with the team.' },
    ],
  },
  render: (args: any) => ({
    components: { BSteps },
    setup() {
      const current = ref(args.current);
      return { args, current };
    },
    template: `
      <BSteps v-bind="args" v-model:current="current" />
    `,
  }),
};

export const Navigation: Story = {
  args: {
    current: 0,
    direction: BStepsDirection.Horizontal,
    labelPlacement: BStepsLabelPlacement.Horizontal,
    size: BCommonSize.Medium,
    status: BStepsStatus.Process,
    type: BStepsType.Navigation,
    items: [
      { title: 'Shipping', description: 'Address and delivery.' },
      { title: 'Payment', description: 'Select a method.' },
      { title: 'Confirm', description: 'Review order details.' },
    ],
  },
  render: (args: any) => ({
    components: { BSteps },
    setup() {
      const current = ref(args.current);
      return { args, current };
    },
    template: `
      <BSteps v-bind="args" v-model:current="current" />
    `,
  }),
};

export const Inline: Story = {
  args: {
    current: 2,
    direction: BStepsDirection.Horizontal,
    labelPlacement: BStepsLabelPlacement.Horizontal,
    size: BCommonSize.Small,
    status: BStepsStatus.Process,
    type: BStepsType.Inline,
    items: [
      { title: 'Plan' },
      { title: 'Build' },
      { title: 'Ship' },
    ],
  },
  render: (args: any) => ({
    components: { BSteps },
    setup() {
      const current = ref(args.current);
      return { args, current };
    },
    template: `
      <BSteps v-bind="args" v-model:current="current" />
    `,
  }),
};

export const ErrorState: Story = {
  args: {
    current: 1,
    direction: BStepsDirection.Horizontal,
    labelPlacement: BStepsLabelPlacement.Horizontal,
    size: BCommonSize.Medium,
    status: BStepsStatus.Error,
    type: BStepsType.Default,
    items: [
      { title: 'Details', description: 'Provide project info.' },
      { title: 'Review', description: 'Resolve validation errors.' },
      { title: 'Submit', description: 'Finish and send.' },
    ],
  },
  render: (args: any) => ({
    components: { BSteps },
    setup() {
      const current = ref(args.current);
      return { args, current };
    },
    template: `
      <BSteps v-bind="args" v-model:current="current" />
    `,
  }),
};
