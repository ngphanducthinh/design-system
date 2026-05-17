import { BSwitch } from '@/components/BSwitch';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Data Entry/Switch',
  component: BSwitch,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'boolean',
      description: 'The checked state of the switch.',
      table: { category: 'Two-Way Binding Props' },
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Initial checked state for uncontrolled usage.',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the switch is disabled.',
      table: { defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Whether to show a loading spinner on the handle.',
      table: { defaultValue: { summary: 'false' } },
    },
    size: {
      control: 'select',
      options: ['default', 'small'],
      description: 'Size of the switch.',
      table: { defaultValue: { summary: "'default'" } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          '<code>BSwitch</code> is a toggle control for switching between two states. ' +
          'It supports controlled (<code>v-model</code>) and uncontrolled usage, loading state, ' +
          'custom checked/unchecked content via slots, and full keyboard accessibility.<br><br>' +
          'Use <code>role="switch"</code> with proper <code>aria-checked</code> state for screen readers.',
      },
    },
  },
} satisfies Meta<typeof BSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

// ═════════════════════════════════════════════
//   STORIES
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 1. Playground
// ─────────────────────────────────────────────
export const Playground: Story = {
  args: {
    modelValue: false,
    disabled: false,
    loading: false,
    size: 'default',
  },
  render: (args) => ({
    components: { BSwitch },
    setup: () => {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div style="padding: 40px;">
        <BSwitch v-bind="args" v-model="value" aria-label="Toggle switch" />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Value: {{ value }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');
    await expect(switchEl).toBeInTheDocument();
    await expect(switchEl).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(switchEl);
    await waitFor(() => {
      expect(switchEl).toHaveAttribute('aria-checked', 'true');
    });
  },
};

// ─────────────────────────────────────────────
// 2. Sizes
// ─────────────────────────────────────────────
export const Sizes: Story = {
  render: () => ({
    components: { BSwitch },
    setup: () => {
      const v1 = ref(true);
      const v2 = ref(true);
      return { v1, v2 };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="display: inline-block; width: 80px; font-size: 12px; color: #666;">Default:</span>
          <BSwitch v-model="v1" size="default" aria-label="Default size switch" />
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="display: inline-block; width: 80px; font-size: 12px; color: #666;">Small:</span>
          <BSwitch v-model="v2" size="small" aria-label="Small size switch" />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 3. Disabled
// ─────────────────────────────────────────────
export const Disabled: Story = {
  render: () => ({
    components: { BSwitch },
    setup: () => {
      const v1 = ref(false);
      const v2 = ref(true);
      return { v1, v2 };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 12px; color: #666;">Disabled (off):</span>
          <BSwitch v-model="v1" disabled aria-label="Disabled off switch" />
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 12px; color: #666;">Disabled (on):</span>
          <BSwitch v-model="v2" disabled aria-label="Disabled on switch" />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 4. Loading
// ─────────────────────────────────────────────
export const Loading: Story = {
  render: () => ({
    components: { BSwitch },
    setup: () => {
      const v1 = ref(false);
      const v2 = ref(true);
      return { v1, v2 };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 12px; color: #666;">Loading (off):</span>
          <BSwitch v-model="v1" loading aria-label="Loading off switch" />
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 12px; color: #666;">Loading (on):</span>
          <BSwitch v-model="v2" loading aria-label="Loading on switch" />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 5. With Text
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
  },
  render: () => ({
    components: { BSwitch },
    setup: () => {
      const v1 = ref(true);
      const v2 = ref(true);
      return { v1, v2 };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 12px; color: #666;">Text:</span>
          <BSwitch v-model="v1" aria-label="Text switch">
            <template #checked>ON</template>
            <template #unchecked>OFF</template>
          </BSwitch>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 12px; color: #666;">Icons:</span>
          <BSwitch v-model="v2" aria-label="Icon switch">
            <template #checked>✓</template>
            <template #unchecked>✕</template>
          </BSwitch>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 6. Accessibility
// ─────────────────────────────────────────────
export const Accessibility: Story = {
  render: () => ({
    components: { BSwitch },
    setup: () => {
      const value = ref(false);
      return { value };
    },
    template: `
      <div style="padding: 40px;">
        <h3 style="margin-bottom: 16px; font-size: 14px;">Keyboard Navigation Demo</h3>
        <p style="margin-bottom: 12px; font-size: 12px; color: #666;">
          Tab to focus, then use Enter or Space to toggle.
        </p>
        <BSwitch v-model="value" aria-label="Enable notifications" />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Value: {{ value }}</p>
      </div>
    `,
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
// 7. Theming
// ─────────────────────────────────────────────
export const Theming: Story = {
  render: () => ({
    components: { BSwitch },
    setup: () => {
      const v1 = ref(true);
      const v2 = ref(true);
      const v3 = ref(true);
      return { v1, v2, v3 };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 24px;">
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Custom checked color (green)</p>
          <BSwitch
            v-model="v1"
            aria-label="Green themed switch"
            style="--b-switch-track-bg-checked: #389e0d;"
          />
        </div>
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Custom handle size & track</p>
          <BSwitch
            v-model="v2"
            aria-label="Large handle switch"
            style="--b-switch-handle-size: 24px; --b-switch-track-height: 28px; --b-switch-track-min-width: 56px;"
          />
        </div>
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Custom handle color & no shadow</p>
          <BSwitch
            v-model="v3"
            aria-label="Custom handle switch"
            style="--b-switch-handle-bg: #e6f4ff; --b-switch-handle-shadow: none; --b-switch-track-bg-checked: #0958d9;"
          />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 8. Design Tokens
// ─────────────────────────────────────────────
export const DesignTokens: Story = {
  render: () => ({
    components: { BSwitch },
    setup: () => {
      const tokens = [
        {
          variable: '--b-switch-handle-bg',
          default: '#fff',
          description: 'Background color of the switch handle',
        },
        {
          variable: '--b-switch-handle-shadow',
          default: '0 2px 4px 0 rgba(0,35,11,0.2)',
          description: 'Box shadow of the switch handle',
        },
        {
          variable: '--b-switch-handle-size',
          default: '18px',
          description: 'Width and height of the switch handle',
        },
        {
          variable: '--b-switch-track-height',
          default: '22px',
          description: 'Height of the switch track',
        },
        {
          variable: '--b-switch-track-min-width',
          default: '44px',
          description: 'Minimum width of the switch track',
        },
        {
          variable: '--b-switch-track-padding',
          default: '2px',
          description: 'Padding between the handle and the track edge',
        },
        {
          variable: '--b-switch-track-bg',
          default: 'rgba(0, 0, 0, 0.25)',
          description: 'Background color of the track when unchecked',
        },
        {
          variable: '--b-switch-track-bg-checked',
          default: '#1565d8',
          description: 'Background color of the track when checked',
        },
        {
          variable: '--b-switch-track-bg-disabled',
          default: 'rgba(0, 0, 0, 0.04)',
          description: 'Background color of the track when disabled',
        },
        {
          variable: '--b-switch-inner-max-margin',
          default: '24px',
          description: 'Maximum margin for inner content area',
        },
        {
          variable: '--b-switch-inner-min-margin',
          default: '9px',
          description: 'Minimum margin for inner content area',
        },
        {
          variable: '--b-switch-loading-color',
          default: '#1565d8',
          description: 'Color of the loading spinner',
        },
      ];
      const value = ref(true);
      return { tokens, value };
    },
    template: `
      <div style="padding: 40px;">
        <h3 style="margin-bottom: 16px; font-size: 16px; font-weight: 600;">BSwitch Design Tokens</h3>
        <p style="margin-bottom: 16px; font-size: 12px; color: #666;">
          Override these CSS custom properties on <code>.b-switch</code> or via inline styles to theme the component.
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 2px solid #eee; text-align: left;">
              <th style="padding: 8px 12px;">Variable</th>
              <th style="padding: 8px 12px;">Default</th>
              <th style="padding: 8px 12px;">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="token in tokens" :key="token.variable" style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 8px 12px; font-family: monospace; color: #d4380d;">{{ token.variable }}</td>
              <td style="padding: 8px 12px; font-family: monospace;">{{ token.default }}</td>
              <td style="padding: 8px 12px;">{{ token.description }}</td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top: 24px; padding: 16px; background: #fafafa; border-radius: 8px;">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Live preview (default tokens):</p>
          <BSwitch v-model="value" aria-label="Preview switch" />
        </div>
      </div>
    `,
  }),
};
