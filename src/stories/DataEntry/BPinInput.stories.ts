import { BPinInput } from '@/components/BPinInput';
import { BCommonSize } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ref } from 'vue';

/**
 * BPinInput — multi-cell OTP / PIN input where each cell holds a single character.
 *
 * Designed for verification codes, MFA prompts, and short numeric passwords.
 * Supports auto-advance, backspace navigation, paste-to-distribute, masking,
 * and full keyboard accessibility.
 */
const meta = {
  title: 'DataEntry/PinInput',
  component: BPinInput,
  tags: ['autodocs'],
  argTypes: {
    length: {
      control: { type: 'number', min: 1, max: 12 },
      description: 'Number of cells.',
      table: { category: 'Props', defaultValue: { summary: '6' } },
    },
    type: {
      control: 'select',
      options: ['number', 'text', 'alphanumeric'],
      description: 'Allowed character class.',
      table: { category: 'Props', defaultValue: { summary: 'number' } },
    },
    size: {
      control: 'select',
      options: Object.values(BCommonSize),
      description: 'Cell size preset.',
      table: { category: 'Props', defaultValue: { summary: 'md' } },
    },
    mask: {
      control: 'boolean',
      description: 'Render as bullets (uses `type="password"` on each cell).',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables every cell.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    autoFocus: {
      control: 'boolean',
      description: 'Focus the first non-disabled cell on mount.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the wrapping `role="group"` element.',
      table: { category: 'Props', defaultValue: { summary: 'PIN entry' } },
    },
    id: {
      control: 'text',
      description: 'HTML id for the wrapping group element.',
      table: { category: 'Props' },
    },
    modelValue: {
      control: 'text',
      description: 'The joined string of all cells.',
      table: { category: 'Two-Way Binding Props', defaultValue: { summary: "''" } },
    },
    onComplete: {
      description: 'Fired with the joined value once every cell is filled.',
      table: { category: 'Events' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BPinInput</code> component is a multi-cell input for one-time codes / PINs. ' +
          'Type to advance, Backspace to retreat, paste to distribute. ' +
          'Filtering by <code>type</code> keeps the value clean even when the user pastes garbage.',
      },
    },
  },
} satisfies Meta<typeof BPinInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** Default 6-digit numeric PIN input. */
export const Default: Story = {
  args: {
    length: 6,
    type: 'number',
    size: BCommonSize.Medium,
    mask: false,
    disabled: false,
    autoFocus: false,
  },
  parameters: { docs: { source: { code: `<BPinInput v-model="value" />` } } },
  render: (args) => ({
    components: { BPinInput },
    setup: () => {
      const value = ref('');
      return { args, value };
    },
    template: `
      <div>
        <BPinInput v-bind="args" v-model="value" />
        <div class="b:mt-3 b:text-sm b:text-gray-500">Value: <code>{{ value || '(empty)' }}</code></div>
      </div>
    `,
  }),
};

/** A 4-cell PIN — common for short numeric passcodes. */
export const Length4: Story = {
  name: 'Length: 4',
  parameters: { docs: { source: { code: `<BPinInput :length="4" />` } } },
  render: () => ({
    components: { BPinInput },
    template: `<BPinInput :length="4" />`,
  }),
};

/** A 6-cell PIN — typical OTP code length. */
export const Length6: Story = {
  name: 'Length: 6',
  parameters: { docs: { source: { code: `<BPinInput :length="6" />` } } },
  render: () => ({
    components: { BPinInput },
    template: `<BPinInput :length="6" />`,
  }),
};

/** Numeric — only digits 0-9 are accepted. Mobile keyboards open the number pad. */
export const TypeNumber: Story = {
  name: 'Type: number',
  parameters: { docs: { source: { code: `<BPinInput type="number" />` } } },
  render: () => ({
    components: { BPinInput },
    template: `<BPinInput type="number" />`,
  }),
};

/** Alphanumeric — letters and digits only. Useful for short invite codes. */
export const TypeAlphanumeric: Story = {
  name: 'Type: alphanumeric',
  parameters: { docs: { source: { code: `<BPinInput type="alphanumeric" :length="5" />` } } },
  render: () => ({
    components: { BPinInput },
    template: `<BPinInput type="alphanumeric" :length="5" />`,
  }),
};

/** Text — any single character per cell. */
export const TypeText: Story = {
  name: 'Type: text',
  parameters: { docs: { source: { code: `<BPinInput type="text" :length="4" />` } } },
  render: () => ({
    components: { BPinInput },
    template: `<BPinInput type="text" :length="4" />`,
  }),
};

/** Three sizes for different layout densities. */
export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BPinInput size="sm" :length="4" />
<BPinInput size="md" :length="4" />
<BPinInput size="lg" :length="4" />
        `,
      },
    },
  },
  render: () => ({
    components: { BPinInput },
    template: `
      <div class="b:flex b:flex-col b:gap-3">
        <BPinInput size="sm" :length="4" />
        <BPinInput size="md" :length="4" />
        <BPinInput size="lg" :length="4" />
      </div>
    `,
  }),
};

/** Mask — values render as bullets, suitable for sensitive PINs. */
export const Masked: Story = {
  parameters: { docs: { source: { code: `<BPinInput mask :length="4" model-value="1234" />` } } },
  render: () => ({
    components: { BPinInput },
    template: `<BPinInput mask :length="4" model-value="1234" />`,
  }),
};

/** Disabled — every cell is non-interactive and visually muted. */
export const Disabled: Story = {
  parameters: {
    docs: { source: { code: `<BPinInput disabled model-value="1234" />` } },
  },
  render: () => ({
    components: { BPinInput },
    template: `<BPinInput disabled model-value="1234" :length="4" />`,
  }),
};

/** AutoFocus — focuses the first cell as soon as the component mounts. */
export const AutoFocus: Story = {
  parameters: { docs: { source: { code: `<BPinInput auto-focus :length="4" />` } } },
  render: () => ({
    components: { BPinInput },
    template: `<BPinInput auto-focus :length="4" />`,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Listening to the `complete` event to fire verification logic. */
export const OnComplete: Story = {
  name: 'Reacting to complete',
  parameters: {
    docs: {
      source: {
        code: `
<BPinInput :length="4" @complete="onComplete" />

<script setup>
const onComplete = (value) => {
  console.log('PIN entered:', value);
};
</script>
        `,
      },
    },
  },
  render: () => ({
    components: { BPinInput },
    setup: () => {
      const status = ref('Waiting for input…');
      const onComplete = (value: string) => {
        status.value = `Submitted: ${value}`;
      };
      return { status, onComplete };
    },
    template: `
      <div class="b:flex b:flex-col b:gap-3">
        <BPinInput :length="4" @complete="onComplete" />
        <div class="b:text-sm b:text-gray-600">{{ status }}</div>
      </div>
    `,
  }),
};

/** A controlled PIN — the parent owns the value and renders it back live. */
export const Controlled: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BPinInput v-model="value" :length="6" />

<script setup>
const value = ref('');
</script>
        `,
      },
    },
  },
  render: () => ({
    components: { BPinInput },
    setup: () => {
      const value = ref('');
      return { value };
    },
    template: `
      <div class="b:flex b:flex-col b:gap-3">
        <BPinInput v-model="value" :length="6" />
        <div class="b:text-sm">Value: <code>{{ value || '(empty)' }}</code></div>
      </div>
    `,
  }),
};

/** A masked 4-digit numeric PIN — what a bank-style "enter your PIN" screen looks like. */
export const SensitivePin: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BPinInput mask :length="4" type="number" aria-label="Enter PIN" />`,
      },
    },
  },
  render: () => ({
    components: { BPinInput },
    template: `
      <div class="b:flex b:flex-col b:gap-2">
        <label class="b:text-sm b:font-medium">Enter your 4-digit PIN</label>
        <BPinInput mask :length="4" type="number" aria--label="Enter PIN" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * BPinInput is wrapped in `role="group"` with an accessible `aria-label`.
 * Each cell exposes a numbered label ("Digit N of M" / "Character N of M").
 * Keyboard support: Tab between cells, ArrowLeft / ArrowRight to navigate,
 * Backspace to clear and retreat, paste to distribute.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The wrapper carries <code>role="group"</code> + <code>aria-label="PIN entry"</code>. ' +
          'Each cell has a numbered ARIA label, and typing auto-advances through the cells.',
      },
    },
  },
  render: () => ({
    components: { BPinInput },
    template: `<BPinInput :length="4" type="number" />`,
  }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const group = c.getByRole('group');
    expect(group).toHaveAttribute('aria-label', 'PIN entry');

    const cells = c.getAllByLabelText(/Digit \d of 4/);
    expect(cells).toHaveLength(4);
    expect(cells[0]).toHaveAttribute('aria-label', 'Digit 1 of 4');

    // Type advances focus.
    cells[0].focus();
    await userEvent.keyboard('1');
    expect(cells[1]).toHaveFocus();

    await userEvent.keyboard('2');
    expect(cells[2]).toHaveFocus();

    // ArrowLeft retreats.
    await userEvent.keyboard('{ArrowLeft}');
    expect(cells[1]).toHaveFocus();

    // Backspace on filled cell clears it.
    await userEvent.keyboard('{Backspace}');
    expect((cells[1] as HTMLInputElement).value).toBe('');

    // Backspace on empty cell retreats and clears prior.
    await userEvent.keyboard('{Backspace}');
    expect(cells[0]).toHaveFocus();
    expect((cells[0] as HTMLInputElement).value).toBe('');
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override the scoped `--b-pin-input-*` tokens on the component root to retheme
 * cell appearance — size, gap, radius, colors are all individually addressable.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-pin-input-cell-size</code>, <code>--b-pin-input-cell-radius</code>, <code>--b-pin-input-cell-border-color-focus</code>, <code>--b-pin-input-cell-bg</code>, and <code>--b-pin-input-cell-fg</code> on the component root.',
      },
      source: {
        code: `
<BPinInput
  :length="4"
  style="
    --b-pin-input-cell-size: 3.5rem;
    --b-pin-input-cell-radius: 999px;
    --b-pin-input-cell-border-color-focus: oklch(55% 0.2 290);
    --b-pin-input-cell-bg: oklch(96% 0.02 290);
    --b-pin-input-cell-fg: oklch(40% 0.2 290);
    --b-pin-input-cell-shadow-focus: 0 0 0 3px oklch(85% 0.1 290);
  "
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BPinInput },
    template: `
      <BPinInput
        :length="4"
        style="
          --b-pin-input-cell-size: 3.5rem;
          --b-pin-input-cell-radius: 999px;
          --b-pin-input-cell-border-color-focus: oklch(55% 0.2 290);
          --b-pin-input-cell-bg: oklch(96% 0.02 290);
          --b-pin-input-cell-fg: oklch(40% 0.2 290);
          --b-pin-input-cell-shadow-focus: 0 0 0 3px oklch(85% 0.1 290);
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
  {
    token: '--b-pin-input-cell-size',
    defaultValue: '2.5rem',
    description: 'Width and height of each cell. Sizes scale via size preset.',
  },
  {
    token: '--b-pin-input-cell-gap',
    defaultValue: '0.5rem',
    description: 'Horizontal gap between cells.',
  },
  {
    token: '--b-pin-input-cell-bg',
    defaultValue: '#ffffff',
    description: 'Background color of an idle cell.',
  },
  {
    token: '--b-pin-input-cell-border-color',
    defaultValue: '#d9d9d9',
    description: 'Border color of an idle cell.',
  },
  {
    token: '--b-pin-input-cell-border-color-focus',
    defaultValue: '#1677ff',
    description: 'Border color of a focused or hovered cell.',
  },
  {
    token: '--b-pin-input-cell-radius',
    defaultValue: '6px',
    description: 'Corner radius of each cell.',
  },
  {
    token: '--b-pin-input-cell-font-size',
    defaultValue: '1.125rem',
    description: 'Typography size of the character inside each cell.',
  },
  {
    token: '--b-pin-input-cell-fg',
    defaultValue: 'rgba(0, 0, 0, 0.88)',
    description: 'Text color of the character inside each cell.',
  },
  {
    token: '--b-pin-input-cell-shadow-focus',
    defaultValue: '0 0 0 2px rgba(5, 145, 255, 0.15)',
    description: 'Outer focus ring shown on the active cell.',
  },
  {
    token: '--b-pin-input-cell-disabled-bg',
    defaultValue: 'rgba(0, 0, 0, 0.04)',
    description: 'Background color of a cell when the component is disabled.',
  },
  {
    token: '--b-pin-input-cell-disabled-fg',
    defaultValue: 'rgba(0, 0, 0, 0.25)',
    description: 'Text color of a cell when the component is disabled.',
  },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'All scoped CSS variables exposed by <code>BPinInput</code>. ' +
          'Override on the component root or any ancestor selector to retheme the cells.',
      },
    },
  },
  render: () => ({
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BPinInput — Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          Scoped CSS variables exposed by <code>BPinInput</code>.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:oklch(96% 0.002 260);">
              <th style="text-align:left;padding:10px 12px;border-bottom:1px solid oklch(85% 0.005 260);">CSS Variable</th>
              <th style="text-align:left;padding:10px 12px;border-bottom:1px solid oklch(85% 0.005 260);">Default</th>
              <th style="text-align:left;padding:10px 12px;border-bottom:1px solid oklch(85% 0.005 260);">Description</th>
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
      </div>
    `,
  }),
};
