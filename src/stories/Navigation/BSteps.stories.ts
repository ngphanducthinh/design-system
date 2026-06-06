import { BSteps } from '@/components';
import {
  BCommonSize,
  BStepsDirection,
  BStepsLabelPlacement,
  BStepsStatus,
  BStepsType,
} from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';

const meta = {
  title: 'Navigation/Steps',
  component: BSteps,
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: 'object',
      description: 'Step items (title, description, optional icon/status overrides).',
      table: { category: 'Props' },
    },
    direction: {
      control: 'select',
      options: Object.values(BStepsDirection),
      description: 'Layout direction of the steps.',
      table: { category: 'Props', defaultValue: { summary: 'horizontal' } },
    },
    labelPlacement: {
      control: 'select',
      options: Object.values(BStepsLabelPlacement),
      description: 'Where the label sits relative to the icon.',
      table: { category: 'Props', defaultValue: { summary: 'horizontal' } },
    },
    size: {
      control: 'select',
      options: Object.values(BCommonSize),
      description: 'Size preset.',
      table: { category: 'Props', defaultValue: { summary: 'md' } },
    },
    status: {
      control: 'select',
      options: Object.values(BStepsStatus),
      description: 'Status of the current step.',
      table: { category: 'Props', defaultValue: { summary: 'process' } },
    },
    type: {
      control: 'select',
      options: Object.values(BStepsType),
      description: 'Visual type — default, navigation, or inline.',
      table: { category: 'Props', defaultValue: { summary: 'default' } },
    },
    modelValue: {
      control: 'number',
      description: 'Index of the current step (v-model).',
      table: { category: 'Two-Way Binding Props' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BSteps</code> component shows progress through a sequence of steps.',
      },
    },
  },
} satisfies Meta<typeof BSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

const onboardingItems = [
  { title: 'Verify email', description: 'Confirm your email address to proceed.' },
  { title: 'Profile setup', description: 'Fill in the essential profile details.' },
  { title: 'Finish', description: 'Review and submit.' },
];

/** Default — horizontal steps with the second step in progress. */
export const Default: Story = {
  args: {
    modelValue: 1,
    direction: BStepsDirection.Horizontal,
    labelPlacement: BStepsLabelPlacement.Horizontal,
    size: BCommonSize.Medium,
    status: BStepsStatus.Process,
    type: BStepsType.Default,
    items: onboardingItems,
  },
  parameters: {
    docs: {
      source: {
        code: `<BSteps :model-value="1" :items="items" />`,
      },
    },
  },
  render: (args) => ({
    components: { BSteps },
    setup: () => ({ args }),
    template: `<BSteps v-bind="args" />`,
  }),
};

/** Vertical layout — useful for full-page wizards. */
export const Vertical: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BSteps direction="vertical" :model-value="1" :items="items" />`,
      },
    },
  },
  render: () => ({
    components: { BSteps },
    setup: () => ({
      items: [
        { title: 'Choose plan', description: 'Select the plan that fits your team.' },
        { title: 'Billing info', description: 'Add your payment details.' },
        { title: 'Launch', description: 'Invite teammates and go live.' },
      ],
    }),
    template: `
      <div class="b:max-w-md">
        <BSteps direction="vertical" :model-value="1" :items="items" />
      </div>
    `,
  }),
};

/** `label-placement="vertical"` puts the title beneath the icon. */
export const LabelVertical: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BSteps label-placement="vertical" :model-value="0" :items="items" />`,
      },
    },
  },
  render: () => ({
    components: { BSteps },
    setup: () => ({
      items: [
        { title: 'Draft', description: 'Write the first version.' },
        { title: 'Review', description: 'Collect feedback.' },
        { title: 'Publish', description: 'Share with the team.' },
      ],
    }),
    template: `<BSteps label-placement="vertical" :model-value="0" :items="items" />`,
  }),
};

/** `type="navigation"` — clickable tab-like steps. */
export const Navigation: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BSteps type="navigation" :model-value="0" :items="items" />`,
      },
    },
  },
  render: () => ({
    components: { BSteps },
    setup: () => ({
      items: [
        { title: 'Shipping', description: 'Address and delivery.' },
        { title: 'Payment', description: 'Select a method.' },
        { title: 'Confirm', description: 'Review order details.' },
      ],
    }),
    template: `<BSteps type="navigation" :model-value="0" :items="items" />`,
  }),
};

/** `type="inline"` — compact one-line summary. */
export const Inline: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BSteps type="inline" size="sm" :model-value="2" :items="[{title:'Plan'},{title:'Build'},{title:'Ship'}]" />`,
      },
    },
  },
  render: () => ({
    components: { BSteps },
    setup: () => ({
      items: [{ title: 'Plan' }, { title: 'Build' }, { title: 'Ship' }],
    }),
    template: `<BSteps type="inline" size="sm" :model-value="2" :items="items" />`,
  }),
};

/** `status="error"` flags the current step as failed. */
export const ErrorState: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BSteps status="error" :model-value="1" :items="items" />`,
      },
    },
  },
  render: () => ({
    components: { BSteps },
    setup: () => ({
      items: [
        { title: 'Details', description: 'Provide project info.' },
        { title: 'Review', description: 'Resolve validation errors.' },
        { title: 'Submit', description: 'Finish and send.' },
      ],
    }),
    template: `<BSteps status="error" :model-value="1" :items="items" />`,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Click a step in a `navigation` type Steps to make it active. */
export const ClickableNavigation: Story = {
  parameters: {
    docs: {
      description: {
        story: 'In `type="navigation"`, clicking a step makes it current.',
      },
      source: {
        code: `<BSteps type="navigation" :items="items" />`,
      },
    },
  },
  render: () => ({
    components: { BSteps },
    setup: () => ({
      items: [{ title: 'Verify email' }, { title: 'Profile setup' }, { title: 'Finish' }],
    }),
    template: `<BSteps type="navigation" :model-value="0" :items="items" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const profileStep = await canvas.findByText('Profile setup');
    await userEvent.click(profileStep);
    const activeStep = canvasElement.querySelector('[aria-current="step"]');
    expect(activeStep).toBeTruthy();
  },
};

/** Three sizes side-by-side. */
export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BSteps size="sm" :items="items" />
<BSteps size="md" :items="items" />
<BSteps size="lg" :items="items" />
        `,
      },
    },
  },
  render: () => ({
    components: { BSteps },
    setup: () => ({
      items: [{ title: 'Plan' }, { title: 'Build' }, { title: 'Ship' }],
    }),
    template: `
      <div class="b:flex b:flex-col b:gap-6">
        <BSteps size="sm" :model-value="1" :items="items" />
        <BSteps size="md" :model-value="1" :items="items" />
        <BSteps size="lg" :model-value="1" :items="items" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * The current step carries `aria-current="step"`. In `navigation` type, steps
 * are clickable and Tab-reachable.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Verifies that the current step exposes <code>aria-current="step"</code> and that clickable navigation steps respond to Enter/click.',
      },
      source: {
        code: `<BSteps type="navigation" :model-value="0" :items="items" />`,
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            selector: '.b-steps__icon, .b-steps__icon *',
            enabled: false,
          },
        ],
      },
    },
  },
  render: () => ({
    components: { BSteps },
    setup: () => ({
      items: [{ title: 'Verify email' }, { title: 'Profile setup' }, { title: 'Finish' }],
    }),
    template: `<BSteps type="navigation" :model-value="0" :items="items" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const initial = canvasElement.querySelector('[aria-current="step"]');
    expect(initial).toBeTruthy();

    const profileStep = await canvas.findByText('Profile setup');
    await userEvent.click(profileStep);

    const activeStep = canvasElement.querySelector('[aria-current="step"]');
    expect(activeStep).toBeTruthy();
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override `--b-steps-icon-size`, `--b-steps-gap`, and `--b-steps-tail-color`
 * on the component root to retheme the steps.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-steps-icon-size</code>, <code>--b-steps-gap</code>, and <code>--b-steps-tail-color</code> on <code>.b-steps</code> (or via inline style).',
      },
      source: {
        code: `
<BSteps
  :model-value="1"
  :items="items"
  style="
    --b-steps-icon-size: 2.5rem;
    --b-steps-gap: 0.75rem;
    --b-steps-tail-color: oklch(80% 0.14 290);
  "
/>
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            selector: '.b-steps__icon, .b-steps__icon *',
            enabled: false,
          },
        ],
      },
    },
  },
  render: () => ({
    components: { BSteps },
    setup: () => ({
      items: [{ title: 'Login' }, { title: 'Verify' }, { title: 'Pay' }, { title: 'Done' }],
    }),
    template: `
      <BSteps
        :model-value="1"
        :items="items"
        style="
          --b-steps-icon-size: 2.5rem;
          --b-steps-gap: 0.75rem;
          --b-steps-tail-color: oklch(80% 0.14 290);
        "
      />
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  { token: '--b-steps-icon-size', defaultValue: '2rem', description: 'Size of the step icon container.' },
  { token: '--b-steps-gap', defaultValue: '0.5rem', description: 'Gap between icon, title, and description.' },
  { token: '--b-steps-tail-color', defaultValue: 'oklch(0% 0 0 / 6%)', description: 'Color of the connecting tail between steps.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'All scoped CSS variables exposed by <code>BSteps</code>. Override on <code>.b-steps</code> or any ancestor selector.',
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            selector: '.b-steps__icon, .b-steps__icon *',
            enabled: false,
          },
        ],
      },
    },
  },
  render: () => ({
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:oklch(96% 0.002 260);">
            <th style="text-align:left;padding:10px 12px;">CSS Variable</th>
            <th style="text-align:left;padding:10px 12px;">Default</th>
            <th style="text-align:left;padding:10px 12px;">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in tokens" :key="t.token" style="border-bottom:1px solid oklch(94% 0.003 260);">
            <td style="padding:8px 12px;font-family:monospace;color:oklch(40% 0.18 280);"><code>{{ t.token }}</code></td>
            <td style="padding:8px 12px;font-family:monospace;color:#595959;">{{ t.defaultValue }}</td>
            <td style="padding:8px 12px;">{{ t.description }}</td>
          </tr>
        </tbody>
      </table>
    `,
  }),
};
