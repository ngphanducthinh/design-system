import { BAutoComplete } from '@/components/BAutoComplete';
import {
  BAutoCompleteStatus,
  BAutoCompleteVariant,
  type BAutoCompleteOption,
} from '@/components/BAutoComplete/types.ts';
import { BCommonSize } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Data Entry/AutoComplete',
  component: BAutoComplete,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'Current input value (v-model).',
      table: { category: 'Two-Way Binding Props' },
    },
    options: {
      control: 'object',
      description: 'Data source for autocomplete suggestions.',
      table: { category: 'Props' },
    },
    size: {
      control: 'select',
      options: Object.values(BCommonSize),
      description: 'Size of the input.',
      table: { category: 'Props', defaultValue: { summary: BCommonSize.Medium } },
    },
    variant: {
      control: 'select',
      options: Object.values(BAutoCompleteVariant),
      description: 'Visual variant of the input.',
      table: { category: 'Props', defaultValue: { summary: BAutoCompleteVariant.Outlined } },
    },
    status: {
      control: 'select',
      options: [undefined, ...Object.values(BAutoCompleteStatus)],
      description: 'Validation status.',
      table: { category: 'Props' },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the component is disabled.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input.',
      table: { category: 'Props' },
    },
    allowClear: {
      control: 'boolean',
      description: 'Show clear button.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    backfill: {
      control: 'boolean',
      description: 'Populate input with highlighted option value on keyboard navigation.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    defaultActiveFirstOption: {
      control: 'boolean',
      description: 'Auto-activate the first option.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    popupMatchSelectWidth: {
      control: 'boolean',
      description: 'Match dropdown width to input.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    'onUpdate:modelValue': {
      description: 'Emitted when the input value changes.',
      table: { category: 'Events' },
    },
    onSelect: {
      description: 'Emitted when an option is selected.',
      table: { category: 'Events' },
    },
    onSearch: {
      description: 'Emitted when the user types (use to populate options).',
      table: { category: 'Events' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          '<code>BAutoComplete</code> provides autocomplete functionality for text input. ' +
          'It filters suggestions as the user types and supports keyboard navigation, ' +
          'custom filtering, and controlled/uncontrolled usage.<br><br>' +
          'Uses the native HTML <code>popover</code> attribute and CSS Anchor Positioning.',
      },
    },
  },
} satisfies Meta<typeof BAutoComplete>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Sample data
// ─────────────────────────────────────────────
const fruitOptions: BAutoCompleteOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Apricot', value: 'apricot' },
  { label: 'Banana', value: 'banana' },
  { label: 'Blueberry', value: 'blueberry' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Cranberry', value: 'cranberry' },
  { label: 'Dragon Fruit', value: 'dragon-fruit' },
  { label: 'Elderberry', value: 'elderberry' },
];

const emailSuffixes = ['@gmail.com', '@outlook.com', '@yahoo.com', '@icloud.com'];

// ═════════════════════════════════════════════
//   STORIES
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────
export const Default: Story = {
  args: {
    options: fruitOptions,
    placeholder: 'Type a fruit name...',
    size: 'md',
    variant: 'outlined',
    disabled: false,
    allowClear: true,
    backfill: false,
    defaultActiveFirstOption: true,
    popupMatchSelectWidth: true,
  },
  parameters: {
    docs: {
      source: {
        code: `<BAutoComplete v-model="value" :options="options" placeholder="Type..." />`,
      },
    },
  },
  render: (args) => ({
    components: { BAutoComplete },
    setup: () => {
      const value = ref('');
      return { args, value };
    },
    template: `
      <div style="padding: 40px; max-width: 320px;">
        <BAutoComplete v-bind="args" v-model="value" />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Value: "{{ value }}"</p>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BAutoComplete size="sm" :options="options" />
<BAutoComplete size="md" :options="options" />
<BAutoComplete size="lg" :options="options" />
        `,
      },
    },
  },
  render: () => ({
    components: { BAutoComplete },
    setup: () => {
      const sm = ref('');
      const md = ref('');
      const lg = ref('');
      return { sm, md, lg, fruitOptions };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Small</p>
          <BAutoComplete v-model="sm" :options="fruitOptions" size="sm" placeholder="Small" />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Medium (default)</p>
          <BAutoComplete v-model="md" :options="fruitOptions" size="md" placeholder="Medium" />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Large</p>
          <BAutoComplete v-model="lg" :options="fruitOptions" size="lg" placeholder="Large" />
        </div>
      </div>
    `,
  }),
};

export const Variants: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BAutoComplete variant="outlined" :options="options" />
<BAutoComplete variant="filled" :options="options" />
<BAutoComplete variant="borderless" :options="options" />
        `,
      },
    },
  },
  render: () => ({
    components: { BAutoComplete },
    setup: () => {
      const outlined = ref('');
      const filled = ref('');
      const borderless = ref('');
      return { outlined, filled, borderless, fruitOptions };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Outlined (default)</p>
          <BAutoComplete v-model="outlined" :options="fruitOptions" variant="outlined" placeholder="Outlined" />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Filled</p>
          <BAutoComplete v-model="filled" :options="fruitOptions" variant="filled" placeholder="Filled" />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Borderless</p>
          <BAutoComplete v-model="borderless" :options="fruitOptions" variant="borderless" placeholder="Borderless" />
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
<BAutoComplete status="error" :options="options" />
<BAutoComplete status="warning" :options="options" />
        `,
      },
    },
  },
  render: () => ({
    components: { BAutoComplete },
    setup: () => {
      const err = ref('');
      const warn = ref('');
      return { err, warn, fruitOptions };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Error</p>
          <BAutoComplete v-model="err" :options="fruitOptions" status="error" placeholder="Error state" />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Warning</p>
          <BAutoComplete v-model="warn" :options="fruitOptions" status="warning" placeholder="Warning state" />
        </div>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BAutoComplete disabled :options="options" model-value="Apple" />`,
      },
    },
  },
  render: () => ({
    components: { BAutoComplete },
    setup: () => ({ fruitOptions }),
    template: `
      <div style="max-width: 320px;">
        <BAutoComplete :options="fruitOptions" disabled aria-label="Disabled autocomplete" model-value="Apple" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────
export const DynamicOptions: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Populate options reactively in response to <code>@search</code>. Common pattern for email/username completion.',
      },
      source: {
        code: `
<BAutoComplete
  v-model="value"
  :options="options"
  :filter-option="false"
  @search="handleSearch"
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BAutoComplete },
    setup: () => {
      const value = ref('');
      const options = ref<BAutoCompleteOption[]>([]);
      const handleSearch = (val: string) => {
        if (!val || val.includes('@')) {
          options.value = [];
        } else {
          options.value = emailSuffixes.map((suffix) => ({
            label: `${val}${suffix}`,
            value: `${val}${suffix}`,
          }));
        }
      };
      return { value, options, handleSearch };
    },
    template: `
      <div style="padding: 40px; max-width: 320px;">
        <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Type a username to get email suggestions</p>
        <BAutoComplete
          v-model="value"
          :options="options"
          :filter-option="false"
          placeholder="Enter email"
          allow-clear
          @search="handleSearch"
        />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Value: "{{ value }}"</p>
      </div>
    `,
  }),
};

export const Backfill: Story = {
  args: {
    options: fruitOptions,
    backfill: true,
    placeholder: 'Use arrow keys to backfill...',
  },
  parameters: {
    docs: {
      source: {
        code: `<BAutoComplete v-model="value" :options="options" backfill />`,
      },
    },
  },
  render: (args) => ({
    components: { BAutoComplete },
    setup: () => {
      const value = ref('');
      return { args, value };
    },
    template: `
      <div style="padding: 40px; max-width: 320px;">
        <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Arrow keys populate the input with the highlighted option</p>
        <BAutoComplete v-bind="args" v-model="value" />
      </div>
    `,
  }),
};

export const InteractionTest: Story = {
  args: {
    options: fruitOptions,
    placeholder: 'Type to search...',
    allowClear: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Types into the input, picks the filtered result with keyboard, then clears.',
      },
      source: {
        code: `<BAutoComplete v-model="value" :options="options" allow-clear @select="onSelect" />`,
      },
    },
  },
  render: (args) => ({
    components: { BAutoComplete },
    setup: () => {
      const value = ref('');
      const selected = ref('none');
      const onSelect = (val: string) => {
        selected.value = val;
      };
      return { args, value, selected, onSelect };
    },
    template: `
      <div style="max-width: 320px;">
        <BAutoComplete v-bind="args" v-model="value" @select="onSelect" />
        <p data-testid="selected-value" style="margin-top: 12px; font-size: 12px; color: #666;">Selected: {{ selected }}</p>
        <p data-testid="current-value" style="font-size: 12px; color: #666;">Value: "{{ value }}"</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    await userEvent.type(input, 'ban');

    await waitFor(() => {
      const options = document.querySelectorAll('[role="option"]');
      expect(options.length).toBe(1);
      expect(options[0].textContent).toContain('Banana');
    });

    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(canvas.getByTestId('selected-value').textContent).toContain('banana');
      expect((input as HTMLInputElement).value).toBe('banana');
    });

    const clearBtn = canvasElement.querySelector('.b-auto-complete__clear');
    if (clearBtn) {
      await userEvent.click(clearBtn);
      await waitFor(() => {
        expect((input as HTMLInputElement).value).toBe('');
      });
    }
  },
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────
export const Accessibility: Story = {
  args: {
    options: fruitOptions,
    placeholder: 'Accessible autocomplete',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders <code>role="combobox"</code> with <code>aria-haspopup="listbox"</code>, <code>aria-expanded</code>, ' +
          '<code>aria-autocomplete="list"</code>, and <code>aria-activedescendant</code> as the user navigates.',
      },
    },
  },
  render: (args) => ({
    components: { BAutoComplete },
    setup: () => {
      const value = ref('');
      return { args, value };
    },
    template: `
      <div style="max-width: 320px;">
        <label id="ac-label" style="display: block; margin-bottom: 4px; font-size: 14px;">Fruit search</label>
        <BAutoComplete v-bind="args" v-model="value" aria-labelledby="ac-label" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // Verify ARIA attributes before opening
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-haspopup')).toBe('listbox');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');

    // Focus to open
    await userEvent.click(input);
    await userEvent.type(input, 'a');

    await waitFor(() => {
      expect(input.getAttribute('aria-expanded')).toBe('true');
    });

    // Verify listbox exists
    await waitFor(() => {
      const listbox = document.querySelector('[role="listbox"]');
      expect(listbox).toBeTruthy();
    });

    // Verify options have correct role
    await waitFor(() => {
      const options = document.querySelectorAll('[role="option"]');
      expect(options.length).toBeGreaterThan(0);
    });

    // Navigate with keyboard to verify aria-activedescendant
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(input.getAttribute('aria-activedescendant')).toBeTruthy();
    });

    // Escape closes
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(input.getAttribute('aria-expanded')).toBe('false');
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
          'Override <code>--b-auto-complete-active-border-color</code>, <code>--b-auto-complete-option-selected-bg</code>, ' +
          '<code>--b-auto-complete-option-padding-x</code>, and friends on the component root.',
      },
      source: {
        code: `
<BAutoComplete
  v-model="value"
  :options="options"
  style="
    --b-auto-complete-active-border-color: #7c3aed;
    --b-auto-complete-hover-border-color: #a78bfa;
    --b-auto-complete-option-selected-bg: #f3e8ff;
  "
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BAutoComplete },
    setup: () => {
      const v1 = ref('');
      const v2 = ref('');
      const v3 = ref('');
      return { v1, v2, v3, fruitOptions };
    },
    template: `
      <div style="padding: 40px; display: flex; gap: 40px; flex-wrap: wrap;">
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Default</p>
          <BAutoComplete v-model="v1" :options="fruitOptions" placeholder="Default theme" />
        </div>

        <div class="custom-ac-theme-purple">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Purple accent</p>
          <BAutoComplete v-model="v2" :options="fruitOptions" placeholder="Purple theme" />
        </div>

        <div class="custom-ac-theme-compact">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Compact options</p>
          <BAutoComplete v-model="v3" :options="fruitOptions" placeholder="Compact theme" />
        </div>
      </div>

      <style>
        .custom-ac-theme-purple .b-auto-complete {
          --b-auto-complete-active-border-color: #7c3aed;
          --b-auto-complete-hover-border-color: #a78bfa;
          --b-auto-complete-active-outline-color: rgba(124, 58, 237, 0.12);
          --b-auto-complete-option-selected-bg: #f3e8ff;
          --b-auto-complete-option-active-bg: #faf5ff;
        }
        .custom-ac-theme-compact .b-auto-complete {
          --b-auto-complete-option-padding-x: 8px;
          --b-auto-complete-option-padding-y: 2px;
          --b-auto-complete-option-font-size: 12px;
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
  { token: '--b-auto-complete-active-border-color', defaultValue: '#1677ff', description: 'Border color when input is focused.' },
  { token: '--b-auto-complete-active-outline-color', defaultValue: 'rgba(5,145,255,0.1)', description: 'Outline / glow color on focus.' },
  { token: '--b-auto-complete-hover-border-color', defaultValue: '#4096ff', description: 'Border color on hover.' },
  { token: '--b-auto-complete-border-color', defaultValue: '#d9d9d9', description: 'Default border color.' },
  { token: '--b-auto-complete-clear-bg', defaultValue: '#ffffff', description: 'Background of the clear button.' },
  { token: '--b-auto-complete-selector-bg', defaultValue: 'rgba(0,0,0,0.04)', description: 'Background of input in filled variant.' },
  { token: '--b-auto-complete-option-active-bg', defaultValue: 'rgba(0,0,0,0.04)', description: 'Background of highlighted / hovered option.' },
  { token: '--b-auto-complete-option-font-size', defaultValue: '14px', description: 'Font size of option text.' },
  { token: '--b-auto-complete-option-height', defaultValue: '32px', description: 'Height of each option item.' },
  { token: '--b-auto-complete-option-line-height', defaultValue: '1.5714', description: 'Line height of option text.' },
  { token: '--b-auto-complete-option-padding-x', defaultValue: '12px', description: 'Horizontal padding of options.' },
  { token: '--b-auto-complete-option-padding-y', defaultValue: '5px', description: 'Vertical padding of options.' },
  { token: '--b-auto-complete-option-selected-bg', defaultValue: '#e6f4ff', description: 'Background of the selected option.' },
  { token: '--b-auto-complete-option-selected-color', defaultValue: 'rgba(0,0,0,0.88)', description: 'Text color of the selected option.' },
  { token: '--b-auto-complete-option-selected-font-weight', defaultValue: '600', description: 'Font weight of the selected option.' },
  { token: '--b-auto-complete-z-index-popup', defaultValue: '1050', description: 'z-index of the dropdown popup.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'All scoped CSS variables exposed by <code>BAutoComplete</code>. Override on the component root or any ancestor selector.',
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
