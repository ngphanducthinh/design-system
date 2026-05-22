import { BMentions } from '@/components/BMentions';
import { BMentionsStatus, BMentionsVariant } from '@/components/BMentions/types.ts';
import { BCommonSize } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

const defaultOptions = [
  { label: 'Alice', value: 'alice' },
  { label: 'Bob', value: 'bob' },
  { label: 'Charlie', value: 'charlie' },
  { label: 'David', value: 'david' },
  { label: 'Eve', value: 'eve' },
];

const meta = {
  title: 'Data Entry/Mentions',
  component: BMentions,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'Current textarea value (v-model).',
      table: { category: 'Two-Way Binding Props' },
    },
    size: {
      control: 'select',
      options: Object.values(BCommonSize),
      description: 'Size of the textarea.',
      table: { defaultValue: { summary: BCommonSize.Medium } },
    },
    variant: {
      control: 'select',
      options: Object.values(BMentionsVariant),
      description: 'Visual variant.',
      table: { defaultValue: { summary: BMentionsVariant.Outlined } },
    },
    status: {
      control: 'select',
      options: [undefined, ...Object.values(BMentionsStatus)],
      description: 'Validation status.',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled.',
      table: { defaultValue: { summary: 'false' } },
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the textarea is read-only.',
      table: { defaultValue: { summary: 'false' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text.',
    },
    allowClear: {
      control: 'boolean',
      description: 'Show clear button.',
      table: { defaultValue: { summary: 'false' } },
    },
    rows: {
      control: 'number',
      description: 'Number of visible text lines.',
      table: { defaultValue: { summary: '3' } },
    },
    prefix: {
      control: 'text',
      description: 'Trigger character(s) for mention lookup.',
      table: { defaultValue: { summary: '"@"' } },
    },
    notFoundContent: {
      control: 'text',
      description: 'Content shown when no results match.',
      table: { defaultValue: { summary: '"Not Found"' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          '<code>BMentions</code> is a textarea component that triggers a suggestions dropdown ' +
          'when a configurable prefix character (e.g., <code>@</code>) is typed. Supports multiple ' +
          'prefix triggers, filtering, keyboard navigation, and accessibility.',
      },
    },
  },
} satisfies Meta<typeof BMentions>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// 1. Playground
// ─────────────────────────────────────────────
export const Playground: Story = {
  args: {
    placeholder: 'Type @ to mention someone...',
    size: 'md',
    variant: 'outlined',
    disabled: false,
    allowClear: true,
    rows: 3,
  },
  render: (args) => ({
    components: { BMentions },
    setup: () => {
      const value = ref('');
      const options = defaultOptions;
      return { args, value, options };
    },
    template: `
      <div style="padding: 40px; max-width: 400px;">
        <BMentions v-bind="args" v-model="value" :options="options" />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Value: "{{ value }}"</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 2. Variants
// ─────────────────────────────────────────────
export const Variants: Story = {
  render: () => ({
    components: { BMentions },
    setup: () => {
      const outlined = ref('');
      const filled = ref('');
      const borderless = ref('');
      const options = defaultOptions;
      return { outlined, filled, borderless, options };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Outlined (default)</p>
          <BMentions v-model="outlined" variant="outlined" :options="options" placeholder="Type @..." />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Filled</p>
          <BMentions v-model="filled" variant="filled" :options="options" placeholder="Type @..." />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Borderless</p>
          <BMentions v-model="borderless" variant="borderless" :options="options" placeholder="Type @..." />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 4. Multiple Prefixes
// ─────────────────────────────────────────────
export const MultiplePrefixes: Story = {
  render: () => ({
    components: { BMentions },
    setup: () => {
      const value = ref('');
      const options = defaultOptions;
      return { value, options };
    },
    template: `
      <div style="padding: 40px; max-width: 400px;">
        <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Supports @ and # prefixes</p>
        <BMentions v-model="value" :prefix="['@', '#']" :options="options" placeholder="Type @ or # ..." />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Value: "{{ value }}"</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 5. Status
// ─────────────────────────────────────────────
export const Status: Story = {
  render: () => ({
    components: { BMentions },
    setup: () => {
      const err = ref('');
      const warn = ref('');
      const options = defaultOptions;
      return { err, warn, options };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Error</p>
          <BMentions v-model="err" status="error" :options="options" placeholder="Error state" />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Warning</p>
          <BMentions v-model="warn" status="warning" :options="options" placeholder="Warning state" />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 6. Disabled
// ─────────────────────────────────────────────
export const Disabled: Story = {
  render: () => ({
    components: { BMentions },
    setup: () => {
      const options = defaultOptions;
      return { options };
    },
    template: `
      <div style="padding: 40px; max-width: 400px;">
        <BMentions model-value="Hello @alice, this is disabled" disabled :options="options" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 7. Accessibility
// ─────────────────────────────────────────────
export const Accessibility: Story = {
  render: () => ({
    components: { BMentions },
    setup: () => {
      const value = ref('');
      const options = defaultOptions;
      return { value, options };
    },
    template: `
      <div style="padding: 40px; max-width: 400px;">
        <label for="mentions-a11y" style="display: block; margin-bottom: 4px; font-size: 14px;">Mention someone</label>
        <BMentions v-model="value" id="mentions-a11y" :options="options" placeholder="Type @ to mention..." />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const combobox = canvasElement.querySelector('[role="combobox"]')!;
    const textarea = canvas.getByRole('textbox') as HTMLTextAreaElement;

    expect(combobox.getAttribute('aria-haspopup')).toBe('listbox');
    expect(textarea.getAttribute('aria-autocomplete')).toBe('list');
    expect(combobox.getAttribute('aria-expanded')).toBe('false');

    await userEvent.type(textarea, '@');
    await waitFor(() => {
      expect(combobox.getAttribute('aria-expanded')).toBe('true');
    });

    const listbox = canvasElement.querySelector('[role="listbox"]');
    expect(listbox).toBeTruthy();

    const options = canvasElement.querySelectorAll('[role="option"]');
    expect(options.length).toBeGreaterThan(0);

    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(textarea.getAttribute('aria-activedescendant')).toBeTruthy();
    });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(combobox.getAttribute('aria-expanded')).toBe('false');
    });
  },
};

// ─────────────────────────────────────────────
// 8. Theming
// ─────────────────────────────────────────────
export const Theming: Story = {
  render: () => ({
    components: { BMentions },
    setup: () => {
      const v1 = ref('');
      const v2 = ref('');
      const v3 = ref('');
      const options = defaultOptions;
      return { v1, v2, v3, options };
    },
    template: `
      <div style="padding: 40px; display: flex; gap: 40px; flex-wrap: wrap;">
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Default</p>
          <BMentions v-model="v1" :options="options" placeholder="Default theme" />
        </div>

        <div class="custom-mentions-theme-purple">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Purple accent</p>
          <BMentions v-model="v2" :options="options" placeholder="Purple theme" />
        </div>

        <div class="custom-mentions-theme-green">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Green accent</p>
          <BMentions v-model="v3" :options="options" placeholder="Green theme" />
        </div>
      </div>

      <style>
        .custom-mentions-theme-purple .b-mentions {
          --b-mentions-active-border-color: #7c3aed;
          --b-mentions-hover-border-color: #a78bfa;
          --b-mentions-active-shadow: 0 0 0 2px rgba(124, 58, 237, 0.12);
          --b-mentions-border-radius: 12px;
        }
        .custom-mentions-theme-green .b-mentions {
          --b-mentions-active-border-color: #16a34a;
          --b-mentions-hover-border-color: #4ade80;
          --b-mentions-active-shadow: 0 0 0 2px rgba(22, 163, 74, 0.12);
          --b-mentions-option-active-bg: rgba(22, 163, 74, 0.08);
        }
      </style>
    `,
  }),
};

// ─────────────────────────────────────────────
// 9. Interaction Test
// ─────────────────────────────────────────────
export const InteractionTest: Story = {
  args: {
    placeholder: 'Type @ to mention...',
    allowClear: true,
  },
  render: (args) => ({
    components: { BMentions },
    setup: () => {
      const value = ref('');
      const options = defaultOptions;
      return { args, value, options };
    },
    template: `
      <div style="padding: 40px; max-width: 400px;">
        <BMentions v-bind="args" v-model="value" :options="options" />
        <p data-testid="current-value" style="margin-top: 12px; font-size: 12px; color: #666;">Value: "{{ value }}"</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox') as HTMLTextAreaElement;

    // Type text with a prefix trigger
    await userEvent.type(textarea, 'Hello @');
    await waitFor(() => {
      const options = canvasElement.querySelectorAll('[role="option"]');
      expect(options.length).toBeGreaterThan(0);
    });

    // First item (Alice) is already active on open - Enter selects it
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(canvas.getByTestId('current-value').textContent).toContain('@alice');
    });

    // Type another mention with filter
    await userEvent.type(textarea, ' @b');
    await waitFor(() => {
      const options = canvasElement.querySelectorAll('[role="option"]');
      expect(options.length).toBe(1);
    });

    // First (only) filtered option is active - Enter selects Bob
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(canvas.getByTestId('current-value').textContent).toContain('@bob');
    });
  },
};

// ─────────────────────────────────────────────
// 10. Design Tokens (LAST)
// ─────────────────────────────────────────────
export const DesignTokens: Story = {
  render: () => ({
    template: `
      <div style="padding: 40px; font-family: monospace; font-size: 13px; max-width: 900px;">
        <h3 style="margin-bottom: 16px; font-size: 16px; font-family: sans-serif;">BMentions Design Tokens</h3>
        <p style="margin-bottom: 16px; font-size: 13px; font-family: sans-serif; color: #666;">
          Override these CSS variables on <code>.b-mentions</code> or an ancestor to customize the component appearance.
        </p>
        <table style="width: 100%; border-collapse: collapse; background: #ffffff;">
          <thead>
            <tr style="border-bottom: 2px solid #e5e7eb;">
              <th style="text-align: left; padding: 8px 12px;">Variable</th>
              <th style="text-align: left; padding: 8px 12px;">Default</th>
              <th style="text-align: left; padding: 8px 12px;">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-active-bg</td>
              <td style="padding: 8px 12px;">#ffffff</td>
              <td style="padding: 8px 12px;">Background when textarea is focused</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-active-border-color</td>
              <td style="padding: 8px 12px;">#1677ff</td>
              <td style="padding: 8px 12px;">Border color when focused</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-active-shadow</td>
              <td style="padding: 8px 12px;">0 0 0 2px rgba(5,145,255,0.1)</td>
              <td style="padding: 8px 12px;">Box-shadow when focused</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-hover-bg</td>
              <td style="padding: 8px 12px;">#ffffff</td>
              <td style="padding: 8px 12px;">Background on hover</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-hover-border-color</td>
              <td style="padding: 8px 12px;">#4096ff</td>
              <td style="padding: 8px 12px;">Border color on hover</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-border-color</td>
              <td style="padding: 8px 12px;">#d9d9d9</td>
              <td style="padding: 8px 12px;">Default border color</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-bg</td>
              <td style="padding: 8px 12px;">#ffffff</td>
              <td style="padding: 8px 12px;">Default background color</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-color</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.88)</td>
              <td style="padding: 8px 12px;">Text color</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-placeholder-color</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.25)</td>
              <td style="padding: 8px 12px;">Placeholder text color</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-font-size</td>
              <td style="padding: 8px 12px;">14px</td>
              <td style="padding: 8px 12px;">Standard font size</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-font-size-lg</td>
              <td style="padding: 8px 12px;">16px</td>
              <td style="padding: 8px 12px;">Large variant font size</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-font-size-sm</td>
              <td style="padding: 8px 12px;">14px</td>
              <td style="padding: 8px 12px;">Small variant font size</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-padding-block</td>
              <td style="padding: 8px 12px;">4px</td>
              <td style="padding: 8px 12px;">Vertical padding (medium)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-padding-block-lg</td>
              <td style="padding: 8px 12px;">7px</td>
              <td style="padding: 8px 12px;">Vertical padding (large)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-padding-block-sm</td>
              <td style="padding: 8px 12px;">0px</td>
              <td style="padding: 8px 12px;">Vertical padding (small)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-padding-inline</td>
              <td style="padding: 8px 12px;">11px</td>
              <td style="padding: 8px 12px;">Horizontal padding (medium)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-padding-inline-lg</td>
              <td style="padding: 8px 12px;">11px</td>
              <td style="padding: 8px 12px;">Horizontal padding (large)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-padding-inline-sm</td>
              <td style="padding: 8px 12px;">7px</td>
              <td style="padding: 8px 12px;">Horizontal padding (small)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-border-radius</td>
              <td style="padding: 8px 12px;">6px</td>
              <td style="padding: 8px 12px;">Border radius</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-disabled-bg</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.04)</td>
              <td style="padding: 8px 12px;">Background when disabled</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-disabled-color</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.25)</td>
              <td style="padding: 8px 12px;">Text color when disabled</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-error-border-color</td>
              <td style="padding: 8px 12px;">#ff4d4f</td>
              <td style="padding: 8px 12px;">Border color for error status</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-error-active-shadow</td>
              <td style="padding: 8px 12px;">0 0 0 2px rgba(255,38,5,0.06)</td>
              <td style="padding: 8px 12px;">Shadow during error state focus</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-warning-border-color</td>
              <td style="padding: 8px 12px;">#faad14</td>
              <td style="padding: 8px 12px;">Border color for warning status</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-warning-active-shadow</td>
              <td style="padding: 8px 12px;">0 0 0 2px rgba(255,215,5,0.1)</td>
              <td style="padding: 8px 12px;">Shadow during warning state focus</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-dropdown-bg</td>
              <td style="padding: 8px 12px;">#ffffff</td>
              <td style="padding: 8px 12px;">Dropdown popup background</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-dropdown-shadow</td>
              <td style="padding: 8px 12px;">0 6px 16px 0 rgba(0,0,0,0.08)...</td>
              <td style="padding: 8px 12px;">Dropdown box-shadow</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-dropdown-height</td>
              <td style="padding: 8px 12px;">250px</td>
              <td style="padding: 8px 12px;">Maximum dropdown height</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-option-active-bg</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.04)</td>
              <td style="padding: 8px 12px;">Background of active/hovered option</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-option-font-size</td>
              <td style="padding: 8px 12px;">14px</td>
              <td style="padding: 8px 12px;">Option font size</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-mentions-clear-color</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.25)</td>
              <td style="padding: 8px 12px;">Clear button icon color</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px;">--b-mentions-z-index-popup</td>
              <td style="padding: 8px 12px;">1050</td>
              <td style="padding: 8px 12px;">z-index of dropdown popup</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
};
