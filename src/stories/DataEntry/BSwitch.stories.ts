import { BSwitch } from '@/components/BSwitch';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

const meta = {
  title: 'Data Entry/Switch',
  component: BSwitch,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'boolean',
      description: 'The checked state of the switch (controlled).',
      table: { category: 'Two-Way Binding Props' },
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Initial checked state for uncontrolled usage.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the switch is disabled.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Whether to show a loading spinner on the handle.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    size: {
      control: 'select',
      options: ['default', 'small'],
      description: 'Size of the switch.',
      table: { category: 'Props', defaultValue: { summary: 'default' } },
    },
    checked: {
      description: 'Content displayed when checked.',
      table: { category: 'Slots' },
    },
    unchecked: {
      description: 'Content displayed when unchecked.',
      table: { category: 'Slots' },
    },
    'onUpdate:modelValue': {
      description: 'Emitted when the checked state changes.',
      table: { category: 'Events' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          '<code>BSwitch</code> is a toggle control for switching between two states. ' +
          'It supports controlled (<code>v-model</code>) and uncontrolled usage, loading state, ' +
          'custom checked/unchecked content via slots, and full keyboard accessibility.',
      },
    },
  },
} satisfies Meta<typeof BSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

export const Default: Story = {
  args: {
    modelValue: false,
    disabled: false,
    loading: false,
    size: 'default',
  },
  parameters: { docs: { source: { code: `<BSwitch v-model="value" aria-label="Toggle" />` } } },
  render: (args) => ({
    components: { BSwitch },
    setup: () => {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `<BSwitch v-bind="args" v-model="value" aria-label="Toggle switch" />`,
  }),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BSwitch size="default" />
<BSwitch size="small" />
        `,
      },
    },
  },
  render: () => ({
    components: { BSwitch },
    setup: () => {
      const v1 = ref(true);
      const v2 = ref(true);
      return { v1, v2 };
    },
    template: `
      <div style="display: flex; align-items: center; gap: 16px;">
        <BSwitch v-model="v1" size="default" aria-label="Default size switch" />
        <BSwitch v-model="v2" size="small" aria-label="Small size switch" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  parameters: { docs: { source: { code: `<BSwitch disabled />` } } },
  render: () => ({
    components: { BSwitch },
    setup: () => {
      const v1 = ref(false);
      const v2 = ref(true);
      return { v1, v2 };
    },
    template: `
      <div style="display: flex; align-items: center; gap: 16px;">
        <BSwitch v-model="v1" disabled aria-label="Disabled off switch" />
        <BSwitch v-model="v2" disabled aria-label="Disabled on switch" />
      </div>
    `,
  }),
};

export const Loading: Story = {
  parameters: { docs: { source: { code: `<BSwitch loading />` } } },
  render: () => ({
    components: { BSwitch },
    setup: () => {
      const v1 = ref(false);
      const v2 = ref(true);
      return { v1, v2 };
    },
    template: `
      <div style="display: flex; align-items: center; gap: 16px;">
        <BSwitch v-model="v1" loading aria-label="Loading off switch" />
        <BSwitch v-model="v2" loading aria-label="Loading on switch" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

export const WithText: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            selector: '*:not(.b-switch__inner-checked):not(.b-switch__inner-unchecked)',
          },
        ],
      },
    },
    docs: {
      source: {
        code: `
<BSwitch v-model="enabled">
  <template #checked>ON</template>
  <template #unchecked>OFF</template>
</BSwitch>
        `,
      },
    },
  },
  render: () => ({
    components: { BSwitch },
    setup: () => {
      const v1 = ref(true);
      const v2 = ref(true);
      return { v1, v2 };
    },
    template: `
      <div style="display: flex; align-items: center; gap: 16px;">
        <BSwitch v-model="v1" aria-label="Text switch">
          <template #checked>ON</template>
          <template #unchecked>OFF</template>
        </BSwitch>
        <BSwitch v-model="v2" aria-label="Icon switch">
          <template #checked>✓</template>
          <template #unchecked>✕</template>
        </BSwitch>
      </div>
    `,
  }),
};

export const InsideForm: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<form>
  <label style="display: flex; align-items: center; gap: 8px;">
    <BSwitch v-model="emailNotif" />
    Email notifications
  </label>
  <label style="display: flex; align-items: center; gap: 8px;">
    <BSwitch v-model="smsNotif" />
    SMS notifications
  </label>
</form>
        `,
      },
    },
  },
  render: () => ({
    components: { BSwitch },
    setup: () => {
      const email = ref(true);
      const sms = ref(false);
      return { email, sms };
    },
    template: `
      <form style="display: flex; flex-direction: column; gap: 12px;">
        <label style="display: flex; align-items: center; gap: 8px;">
          <BSwitch v-model="email" aria-label="Email" />
          Email notifications
        </label>
        <label style="display: flex; align-items: center; gap: 8px;">
          <BSwitch v-model="sms" aria-label="SMS" />
          SMS notifications
        </label>
      </form>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders <code>role="switch"</code> with <code>aria-checked</code>. ' +
          'Reachable via <kbd>Tab</kbd>, toggles on <kbd>Enter</kbd> or <kbd>Space</kbd>.',
      },
    },
  },
  render: () => ({
    components: { BSwitch },
    setup: () => {
      const value = ref(false);
      return { value };
    },
    template: `<BSwitch v-model="value" aria-label="Enable notifications" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    await expect(switchEl).toHaveAttribute('aria-label', 'Enable notifications');
    await expect(switchEl).toHaveAttribute('aria-checked', 'false');
    await expect(switchEl).toHaveAttribute('tabindex', '0');
    await expect(switchEl).toHaveAttribute('type', 'button');

    await userEvent.tab();
    await waitFor(() => {
      expect(switchEl).toHaveFocus();
    });

    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(switchEl).toHaveAttribute('aria-checked', 'true');
    });

    await userEvent.keyboard(' ');
    await waitFor(() => {
      expect(switchEl).toHaveAttribute('aria-checked', 'false');
    });
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-switch-track-bg-checked</code>, <code>--b-switch-handle-size</code>, ' +
          'and <code>--b-switch-track-height</code> on the component root.',
      },
      source: {
        code: `
<BSwitch
  v-model="value"
  style="
    --b-switch-track-bg-checked: oklch(60% 0.18 145);
    --b-switch-handle-size: 24px;
    --b-switch-track-height: 28px;
    --b-switch-track-min-width: 56px;
  "
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BSwitch },
    setup: () => {
      const v1 = ref(true);
      const v2 = ref(true);
      const v3 = ref(true);
      return { v1, v2, v3 };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <BSwitch
          v-model="v1"
          aria-label="Green"
          style="--b-switch-track-bg-checked: oklch(60% 0.18 145);"
        />
        <BSwitch
          v-model="v2"
          aria-label="Larger"
          style="--b-switch-handle-size: 24px; --b-switch-track-height: 28px; --b-switch-track-min-width: 56px;"
        />
        <BSwitch
          v-model="v3"
          aria-label="Custom handle"
          style="--b-switch-handle-bg: #e6f4ff; --b-switch-handle-shadow: none; --b-switch-track-bg-checked: oklch(50% 0.2 260);"
        />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  { token: '--b-switch-handle-bg', defaultValue: '#fff', description: 'Background color of the switch handle.' },
  { token: '--b-switch-handle-shadow', defaultValue: '0 2px 4px 0 rgba(0,35,11,0.2)', description: 'Box shadow of the switch handle.' },
  { token: '--b-switch-handle-size', defaultValue: '18px', description: 'Width and height of the switch handle.' },
  { token: '--b-switch-track-height', defaultValue: '22px', description: 'Height of the switch track.' },
  { token: '--b-switch-track-min-width', defaultValue: '44px', description: 'Minimum width of the switch track.' },
  { token: '--b-switch-track-padding', defaultValue: '2px', description: 'Padding between the handle and the track edge.' },
  { token: '--b-switch-track-bg', defaultValue: 'rgba(0, 0, 0, 0.25)', description: 'Background color of the track when unchecked.' },
  { token: '--b-switch-track-bg-checked', defaultValue: '#1565d8', description: 'Background color of the track when checked.' },
  { token: '--b-switch-track-bg-disabled', defaultValue: 'rgba(0, 0, 0, 0.04)', description: 'Background color of the track when disabled.' },
  { token: '--b-switch-inner-max-margin', defaultValue: '24px', description: 'Maximum margin for inner content area.' },
  { token: '--b-switch-inner-min-margin', defaultValue: '9px', description: 'Minimum margin for inner content area.' },
  { token: '--b-switch-loading-color', defaultValue: '#1565d8', description: 'Color of the loading spinner.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'All scoped CSS variables exposed by <code>BSwitch</code>. Override on the component root or any ancestor selector.',
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
