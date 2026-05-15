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
    },
    size: {
      control: 'select',
      options: Object.values(BCommonSize),
      description: 'Size of the input.',
      table: { defaultValue: { summary: BCommonSize.Medium } },
    },
    variant: {
      control: 'select',
      options: Object.values(BAutoCompleteVariant),
      description: 'Visual variant of the input.',
      table: { defaultValue: { summary: BAutoCompleteVariant.Outlined } },
    },
    status: {
      control: 'select',
      options: [undefined, ...Object.values(BAutoCompleteStatus)],
      description: 'Validation status.',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the component is disabled.',
      table: { defaultValue: { summary: 'false' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input.',
    },
    allowClear: {
      control: 'boolean',
      description: 'Show clear button.',
      table: { defaultValue: { summary: 'false' } },
    },
    backfill: {
      control: 'boolean',
      description: 'Populate input with highlighted option value on keyboard navigation.',
      table: { defaultValue: { summary: 'false' } },
    },
    defaultActiveFirstOption: {
      control: 'boolean',
      description: 'Auto-activate the first option.',
      table: { defaultValue: { summary: 'true' } },
    },
    popupMatchSelectWidth: {
      control: 'boolean',
      description: 'Match dropdown width to input.',
      table: { defaultValue: { summary: 'true' } },
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
// 1. Playground
// ─────────────────────────────────────────────
export const Playground: Story = {
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

// ─────────────────────────────────────────────
// 2. Sizes
// ─────────────────────────────────────────────
export const Sizes: Story = {
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

// ─────────────────────────────────────────────
// 3. Variants
// ─────────────────────────────────────────────
export const Variants: Story = {
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

// ─────────────────────────────────────────────
// 4. Dynamic options (email example)
// ─────────────────────────────────────────────
export const DynamicOptions: Story = {
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

// ─────────────────────────────────────────────
// 5. Backfill
// ─────────────────────────────────────────────
export const Backfill: Story = {
  args: {
    options: fruitOptions,
    backfill: true,
    placeholder: 'Use arrow keys to backfill...',
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

// ─────────────────────────────────────────────
// 6. Status (validation)
// ─────────────────────────────────────────────
export const Status: Story = {
  render: () => ({
    components: { BAutoComplete },
    setup: () => {
      const err = ref('');
      const warn = ref('');
      return { err, warn, fruitOptions };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
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

// ─────────────────────────────────────────────
// 7. Accessibility
// ─────────────────────────────────────────────
export const Accessibility: Story = {
  args: {
    options: fruitOptions,
    placeholder: 'Accessible autocomplete',
  },
  render: (args) => ({
    components: { BAutoComplete },
    setup: () => {
      const value = ref('');
      return { args, value };
    },
    template: `
      <div style="padding: 40px; max-width: 320px;">
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
// 8. Theming (CSS vars override)
// ─────────────────────────────────────────────
export const Theming: Story = {
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
// 9. Interaction test
// ─────────────────────────────────────────────
export const InteractionTest: Story = {
  args: {
    options: fruitOptions,
    placeholder: 'Type to search...',
    allowClear: true,
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
      <div style="padding: 40px; max-width: 320px;">
        <BAutoComplete v-bind="args" v-model="value" @select="onSelect" />
        <p data-testid="selected-value" style="margin-top: 12px; font-size: 12px; color: #666;">Selected: {{ selected }}</p>
        <p data-testid="current-value" style="font-size: 12px; color: #666;">Value: "{{ value }}"</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // Type to filter
    await userEvent.type(input, 'ban');

    // Verify filtered options appear
    await waitFor(() => {
      const options = document.querySelectorAll('[role="option"]');
      expect(options.length).toBe(1);
      expect(options[0].textContent).toContain('Banana');
    });

    // Select with Enter
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');

    // Verify selection
    await waitFor(() => {
      expect(canvas.getByTestId('selected-value').textContent).toContain('banana');
      expect((input as HTMLInputElement).value).toBe('banana');
    });

    // Clear
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
// 10. Disabled
// ─────────────────────────────────────────────
export const Disabled: Story = {
  args: {
    options: fruitOptions,
    disabled: true,
    placeholder: 'Disabled autocomplete',
    modelValue: 'Apple',
  },
  render: (args) => ({
    components: { BAutoComplete },
    setup: () => ({ args }),
    template: `
      <div style="padding: 40px; max-width: 320px;">
        <BAutoComplete v-bind="args" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 11. Design Token Reference
// ─────────────────────────────────────────────
export const DesignTokens: Story = {
  render: () => ({
    template: `
      <div style="padding: 40px; font-family: monospace; font-size: 13px; max-width: 800px;">
        <h3 style="margin-bottom: 16px; font-size: 16px; font-family: sans-serif;">BAutoComplete Design Tokens</h3>
        <p style="margin-bottom: 16px; font-size: 13px; font-family: sans-serif; color: #666;">
          Override these CSS variables on <code>.b-auto-complete</code> or an ancestor to customize the component appearance.
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
              <td style="padding: 8px 12px;">--b-auto-complete-active-border-color</td>
              <td style="padding: 8px 12px;">#1677ff</td>
              <td style="padding: 8px 12px;">Border color when input is focused</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-auto-complete-active-outline-color</td>
              <td style="padding: 8px 12px;">rgba(5,145,255,0.1)</td>
              <td style="padding: 8px 12px;">Outline/glow color on focus</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-auto-complete-hover-border-color</td>
              <td style="padding: 8px 12px;">#4096ff</td>
              <td style="padding: 8px 12px;">Border color on hover</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-auto-complete-border-color</td>
              <td style="padding: 8px 12px;">#d9d9d9</td>
              <td style="padding: 8px 12px;">Default border color</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-auto-complete-clear-bg</td>
              <td style="padding: 8px 12px;">#ffffff</td>
              <td style="padding: 8px 12px;">Background of the clear button</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-auto-complete-selector-bg</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.04)</td>
              <td style="padding: 8px 12px;">Background of input in filled variant</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-auto-complete-option-active-bg</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.04)</td>
              <td style="padding: 8px 12px;">Background of highlighted/hovered option</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-auto-complete-option-font-size</td>
              <td style="padding: 8px 12px;">14px</td>
              <td style="padding: 8px 12px;">Font size of option text</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-auto-complete-option-height</td>
              <td style="padding: 8px 12px;">32px</td>
              <td style="padding: 8px 12px;">Height of each option item</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-auto-complete-option-line-height</td>
              <td style="padding: 8px 12px;">1.5714</td>
              <td style="padding: 8px 12px;">Line height of option text</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-auto-complete-option-padding-x</td>
              <td style="padding: 8px 12px;">12px</td>
              <td style="padding: 8px 12px;">Horizontal padding of options</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-auto-complete-option-padding-y</td>
              <td style="padding: 8px 12px;">5px</td>
              <td style="padding: 8px 12px;">Vertical padding of options</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-auto-complete-option-selected-bg</td>
              <td style="padding: 8px 12px;">#e6f4ff</td>
              <td style="padding: 8px 12px;">Background of the selected option</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-auto-complete-option-selected-color</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.88)</td>
              <td style="padding: 8px 12px;">Text color of the selected option</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-auto-complete-option-selected-font-weight</td>
              <td style="padding: 8px 12px;">600</td>
              <td style="padding: 8px 12px;">Font weight of the selected option</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px;">--b-auto-complete-z-index-popup</td>
              <td style="padding: 8px 12px;">1050</td>
              <td style="padding: 8px 12px;">z-index of the dropdown popup</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
};
