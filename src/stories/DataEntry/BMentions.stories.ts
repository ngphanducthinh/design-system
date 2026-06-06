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
      table: { category: 'Props', defaultValue: { summary: BCommonSize.Medium } },
    },
    variant: {
      control: 'select',
      options: Object.values(BMentionsVariant),
      description: 'Visual variant.',
      table: { category: 'Props', defaultValue: { summary: BMentionsVariant.Outlined } },
    },
    status: {
      control: 'select',
      options: [undefined, ...Object.values(BMentionsStatus)],
      description: 'Validation status.',
      table: { category: 'Props' },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the textarea is read-only.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text.',
      table: { category: 'Props' },
    },
    allowClear: {
      control: 'boolean',
      description: 'Show clear button.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    rows: {
      control: 'number',
      description: 'Number of visible text lines.',
      table: { category: 'Props', defaultValue: { summary: '3' } },
    },
    prefix: {
      control: 'text',
      description: 'Trigger character(s) for mention lookup.',
      table: { category: 'Props', defaultValue: { summary: '"@"' } },
    },
    notFoundContent: {
      control: 'text',
      description: 'Content shown when no results match.',
      table: { category: 'Props', defaultValue: { summary: '"Not Found"' } },
    },
    'onUpdate:modelValue': {
      description: 'Emitted when the value changes.',
      table: { category: 'Events' },
    },
    onSelect: {
      description: 'Emitted when a mention option is selected.',
      table: { category: 'Events' },
    },
    onSearch: {
      description: 'Emitted while the user is typing inside a prefix trigger.',
      table: { category: 'Events' },
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
// Usage
// ─────────────────────────────────────────────

export const Default: Story = {
  args: {
    placeholder: 'Type @ to mention someone...',
    size: 'md',
    variant: 'outlined',
    disabled: false,
    allowClear: true,
    rows: 3,
  },
  parameters: {
    docs: {
      source: { code: `<BMentions v-model="value" :options="options" placeholder="Type @..." />` },
    },
  },
  render: (args) => ({
    components: { BMentions },
    setup: () => {
      const value = ref('');
      const options = defaultOptions;
      return { args, value, options };
    },
    template: `
      <div style="max-width: 400px;">
        <BMentions v-bind="args" v-model="value" :options="options" />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Value: "{{ value }}"</p>
      </div>
    `,
  }),
};

export const Variants: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BMentions variant="outlined" :options="options" />
<BMentions variant="filled" :options="options" />
<BMentions variant="borderless" :options="options" />
        `,
      },
    },
  },
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
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
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

export const Status: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BMentions status="error" :options="options" />
<BMentions status="warning" :options="options" />
        `,
      },
    },
  },
  render: () => ({
    components: { BMentions },
    setup: () => {
      const err = ref('');
      const warn = ref('');
      const options = defaultOptions;
      return { err, warn, options };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
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

export const Disabled: Story = {
  parameters: {
    docs: { source: { code: `<BMentions disabled model-value="Hello @alice" :options="options" />` } },
  },
  render: () => ({
    components: { BMentions },
    setup: () => ({ options: defaultOptions }),
    template: `
      <div style="max-width: 400px;">
        <BMentions model-value="Hello @alice, this is disabled" disabled :options="options" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

export const MultiplePrefixes: Story = {
  parameters: {
    docs: {
      description: { story: 'Configure multiple trigger characters via the <code>prefix</code> array.' },
      source: { code: `<BMentions v-model="value" :prefix="['@', '#']" :options="options" />` },
    },
  },
  render: () => ({
    components: { BMentions },
    setup: () => {
      const value = ref('');
      const options = defaultOptions;
      return { value, options };
    },
    template: `
      <div style="max-width: 400px;">
        <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Supports @ and # prefixes</p>
        <BMentions v-model="value" :prefix="['@', '#']" :options="options" placeholder="Type @ or # ..." />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Value: "{{ value }}"</p>
      </div>
    `,
  }),
};

export const InteractionTest: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Types a prefix, picks the first option with Enter, then types another prefix and selects again.',
      },
      source: { code: `<BMentions v-model="value" :options="options" allow-clear />` },
    },
  },
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
      <div style="max-width: 400px;">
        <BMentions v-bind="args" v-model="value" :options="options" />
        <p data-testid="current-value" style="margin-top: 12px; font-size: 12px; color: #666;">Value: "{{ value }}"</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox') as HTMLTextAreaElement;

    await userEvent.type(textarea, 'Hello @');
    await waitFor(() => {
      const options = canvasElement.querySelectorAll('[role="option"]');
      expect(options.length).toBeGreaterThan(0);
    });

    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(canvas.getByTestId('current-value').textContent).toContain('@alice');
    });

    await userEvent.type(textarea, ' @b');
    await waitFor(() => {
      const options = canvasElement.querySelectorAll('[role="option"]');
      expect(options.length).toBe(1);
    });

    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(canvas.getByTestId('current-value').textContent).toContain('@bob');
    });
  },
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The wrapper has <code>role="combobox"</code> with <code>aria-haspopup="listbox"</code> and <code>aria-expanded</code>. ' +
          'The textarea has <code>aria-autocomplete="list"</code> and updates <code>aria-activedescendant</code>.',
      },
    },
  },
  render: () => ({
    components: { BMentions },
    setup: () => {
      const value = ref('');
      const options = defaultOptions;
      return { value, options };
    },
    template: `
      <div style="max-width: 400px;">
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
// Theming
// ─────────────────────────────────────────────

export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-mentions-active-border-color</code>, <code>--b-mentions-active-shadow</code>, ' +
          '<code>--b-mentions-border-radius</code>, and friends on the component root.',
      },
      source: {
        code: `
<BMentions
  v-model="value"
  :options="options"
  style="
    --b-mentions-active-border-color: #7c3aed;
    --b-mentions-hover-border-color: #a78bfa;
    --b-mentions-border-radius: 12px;
  "
/>
        `,
      },
    },
  },
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
      <div style="display: flex; gap: 40px; flex-wrap: wrap;">
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
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  { token: '--b-mentions-active-bg', defaultValue: '#ffffff', description: 'Background when textarea is focused.' },
  { token: '--b-mentions-active-border-color', defaultValue: '#1677ff', description: 'Border color when focused.' },
  { token: '--b-mentions-active-shadow', defaultValue: '0 0 0 2px rgba(5,145,255,0.1)', description: 'Box-shadow when focused.' },
  { token: '--b-mentions-hover-bg', defaultValue: '#ffffff', description: 'Background on hover.' },
  { token: '--b-mentions-hover-border-color', defaultValue: '#4096ff', description: 'Border color on hover.' },
  { token: '--b-mentions-border-color', defaultValue: '#d9d9d9', description: 'Default border color.' },
  { token: '--b-mentions-bg', defaultValue: '#ffffff', description: 'Default background color.' },
  { token: '--b-mentions-color', defaultValue: 'rgba(0,0,0,0.88)', description: 'Text color.' },
  { token: '--b-mentions-placeholder-color', defaultValue: 'rgba(0,0,0,0.25)', description: 'Placeholder text color.' },
  { token: '--b-mentions-font-size', defaultValue: '14px', description: 'Standard font size.' },
  { token: '--b-mentions-font-size-lg', defaultValue: '16px', description: 'Large variant font size.' },
  { token: '--b-mentions-font-size-sm', defaultValue: '14px', description: 'Small variant font size.' },
  { token: '--b-mentions-padding-block', defaultValue: '4px', description: 'Vertical padding (medium).' },
  { token: '--b-mentions-padding-block-lg', defaultValue: '7px', description: 'Vertical padding (large).' },
  { token: '--b-mentions-padding-block-sm', defaultValue: '0px', description: 'Vertical padding (small).' },
  { token: '--b-mentions-padding-inline', defaultValue: '11px', description: 'Horizontal padding (medium).' },
  { token: '--b-mentions-padding-inline-lg', defaultValue: '11px', description: 'Horizontal padding (large).' },
  { token: '--b-mentions-padding-inline-sm', defaultValue: '7px', description: 'Horizontal padding (small).' },
  { token: '--b-mentions-border-radius', defaultValue: '6px', description: 'Border radius.' },
  { token: '--b-mentions-disabled-bg', defaultValue: 'rgba(0,0,0,0.04)', description: 'Background when disabled.' },
  { token: '--b-mentions-disabled-color', defaultValue: 'rgba(0,0,0,0.25)', description: 'Text color when disabled.' },
  { token: '--b-mentions-error-border-color', defaultValue: '#ff4d4f', description: 'Border color for error status.' },
  { token: '--b-mentions-error-active-shadow', defaultValue: '0 0 0 2px rgba(255,38,5,0.06)', description: 'Shadow during error state focus.' },
  { token: '--b-mentions-warning-border-color', defaultValue: '#faad14', description: 'Border color for warning status.' },
  { token: '--b-mentions-warning-active-shadow', defaultValue: '0 0 0 2px rgba(255,215,5,0.1)', description: 'Shadow during warning state focus.' },
  { token: '--b-mentions-dropdown-bg', defaultValue: '#ffffff', description: 'Dropdown popup background.' },
  { token: '--b-mentions-dropdown-shadow', defaultValue: '0 6px 16px 0 rgba(0,0,0,0.08)', description: 'Dropdown box-shadow.' },
  { token: '--b-mentions-dropdown-height', defaultValue: '250px', description: 'Maximum dropdown height.' },
  { token: '--b-mentions-option-active-bg', defaultValue: 'rgba(0,0,0,0.04)', description: 'Background of active / hovered option.' },
  { token: '--b-mentions-option-font-size', defaultValue: '14px', description: 'Option font size.' },
  { token: '--b-mentions-clear-color', defaultValue: 'rgba(0,0,0,0.25)', description: 'Clear button icon color.' },
  { token: '--b-mentions-z-index-popup', defaultValue: '1050', description: 'z-index of dropdown popup.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'All scoped CSS variables exposed by <code>BMentions</code>. Override on the component root or any ancestor selector.',
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
