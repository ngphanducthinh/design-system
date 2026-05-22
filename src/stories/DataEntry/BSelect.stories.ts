import { BSelect } from '@/components/BSelect';
import {
  BSelectMode,
  BSelectStatus,
  BSelectVariant,
  type BSelectOption,
} from '@/components/BSelect/types.ts';
import { BCommonSize } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Data Entry/Select',
  component: BSelect,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'Current selected value (v-model).',
      table: { category: 'Two-Way Binding Props' },
    },
    options: {
      control: 'object',
      description: 'Data source for select options.',
    },
    size: {
      control: 'select',
      options: Object.values(BCommonSize),
      description: 'Size of the selector.',
      table: { defaultValue: { summary: BCommonSize.Medium } },
    },
    variant: {
      control: 'select',
      options: Object.values(BSelectVariant),
      description: 'Visual variant of the selector.',
      table: { defaultValue: { summary: BSelectVariant.Outlined } },
    },
    mode: {
      control: 'select',
      options: [undefined, ...Object.values(BSelectMode)],
      description: 'Selection mode (multiple or tags).',
    },
    status: {
      control: 'select',
      options: [undefined, ...Object.values(BSelectStatus)],
      description: 'Validation status.',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the component is disabled.',
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
    showSearch: {
      control: 'boolean',
      description: 'Enable search/filter in single mode.',
      table: { defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner.',
      table: { defaultValue: { summary: 'false' } },
    },
    listHeight: {
      control: 'number',
      description: 'Max height of dropdown in px.',
      table: { defaultValue: { summary: '256' } },
    },
    maxTagCount: {
      control: 'number',
      description: 'Max visible tags (multiple/tags mode).',
    },
    popupMatchSelectWidth: {
      control: 'boolean',
      description: 'Match dropdown width to selector.',
      table: { defaultValue: { summary: 'true' } },
    },
    defaultActiveFirstOption: {
      control: 'boolean',
      description: 'Auto-activate the first option.',
      table: { defaultValue: { summary: 'true' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          '<code>BSelect</code> provides a dropdown selection component supporting single and multiple selection, ' +
          'search/filter, tags mode, keyboard navigation, and full accessibility.<br><br>' +
          'Uses the native HTML <code>popover</code> attribute and CSS Anchor Positioning.',
      },
    },
  },
} satisfies Meta<typeof BSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Sample data
// ─────────────────────────────────────────────
const fruitOptions: BSelectOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Blueberry', value: 'blueberry' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Dragon Fruit', value: 'dragon-fruit' },
  { label: 'Elderberry', value: 'elderberry' },
  { label: 'Fig', value: 'fig' },
  { label: 'Grape', value: 'grape' },
];

const countryOptions: BSelectOption[] = [
  { label: 'United States', value: 'us' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Germany', value: 'de' },
  { label: 'France', value: 'fr' },
  { label: 'Japan', value: 'jp' },
  { label: 'Australia', value: 'au' },
  { label: 'Canada', value: 'ca' },
  { label: 'Brazil', value: 'br' },
];

const optionsWithDisabled: BSelectOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana', disabled: true },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Dragon Fruit', value: 'dragon-fruit', disabled: true },
  { label: 'Elderberry', value: 'elderberry' },
];

// ═════════════════════════════════════════════
//   STORIES
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 1. Playground
// ─────────────────────────────────────────────
export const Playground: Story = {
  args: {
    options: fruitOptions,
    placeholder: 'Select a fruit...',
    size: 'md',
    variant: 'outlined',
    disabled: false,
    allowClear: true,
    showSearch: false,
    loading: false,
    defaultActiveFirstOption: true,
    popupMatchSelectWidth: true,
    listHeight: 256,
  },
  render: (args) => ({
    components: { BSelect },
    setup: () => {
      const value = ref<string | undefined>(undefined);
      return { args, value };
    },
    template: `
      <div style="padding: 40px; max-width: 320px;">
        <BSelect v-bind="args" v-model="value" />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Value: {{ JSON.stringify(value) }}</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 2. Sizes
// ─────────────────────────────────────────────
export const Sizes: Story = {
  render: () => ({
    components: { BSelect },
    setup: () => {
      const sm = ref<string | undefined>(undefined);
      const md = ref<string | undefined>(undefined);
      const lg = ref<string | undefined>(undefined);
      return { sm, md, lg, fruitOptions };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Small</p>
          <BSelect v-model="sm" :options="fruitOptions" size="sm" placeholder="Small" />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Medium (default)</p>
          <BSelect v-model="md" :options="fruitOptions" size="md" placeholder="Medium" />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Large</p>
          <BSelect v-model="lg" :options="fruitOptions" size="lg" placeholder="Large" />
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
    components: { BSelect },
    setup: () => {
      const outlined = ref<string | undefined>(undefined);
      const filled = ref<string | undefined>(undefined);
      const borderless = ref<string | undefined>(undefined);
      return { outlined, filled, borderless, fruitOptions };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Outlined (default)</p>
          <BSelect v-model="outlined" :options="fruitOptions" variant="outlined" placeholder="Outlined" />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Filled</p>
          <BSelect v-model="filled" :options="fruitOptions" variant="filled" placeholder="Filled" />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Borderless</p>
          <BSelect v-model="borderless" :options="fruitOptions" variant="borderless" placeholder="Borderless" />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 4. Multiple Mode
// ─────────────────────────────────────────────
export const MultipleMode: Story = {
  render: () => ({
    components: { BSelect },
    setup: () => {
      const value = ref<string[]>(['apple', 'cherry']);
      return { value, fruitOptions };
    },
    template: `
      <div style="padding: 40px; max-width: 400px;">
        <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Select multiple items</p>
        <BSelect v-model="value" :options="fruitOptions" mode="multiple" placeholder="Select fruits..." allow-clear />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Value: {{ JSON.stringify(value) }}</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 5. Tags Mode
// ─────────────────────────────────────────────
export const TagsMode: Story = {
  render: () => ({
    components: { BSelect },
    setup: () => {
      const value = ref<string[]>([]);
      return { value, fruitOptions };
    },
    template: `
      <div style="padding: 40px; max-width: 400px;">
        <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Tags mode - type to create custom tags</p>
        <BSelect v-model="value" :options="fruitOptions" mode="tags" placeholder="Type or select..." allow-clear />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Value: {{ JSON.stringify(value) }}</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 6. Searchable
// ─────────────────────────────────────────────
export const Searchable: Story = {
  render: () => ({
    components: { BSelect },
    setup: () => {
      const value = ref<string | undefined>(undefined);
      return { value, countryOptions };
    },
    template: `
      <div style="padding: 40px; max-width: 320px;">
        <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Type to filter options</p>
        <BSelect v-model="value" :options="countryOptions" show-search placeholder="Search countries..." allow-clear />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Value: {{ JSON.stringify(value) }}</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 7. Status (validation)
// ─────────────────────────────────────────────
export const Status: Story = {
  render: () => ({
    components: { BSelect },
    setup: () => {
      const err = ref<string | undefined>(undefined);
      const warn = ref<string | undefined>(undefined);
      return { err, warn, fruitOptions };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Error</p>
          <BSelect v-model="err" :options="fruitOptions" status="error" placeholder="Error state" />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Warning</p>
          <BSelect v-model="warn" :options="fruitOptions" status="warning" placeholder="Warning state" />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 8. Disabled Options
// ─────────────────────────────────────────────
export const DisabledOptions: Story = {
  render: () => ({
    components: { BSelect },
    setup: () => {
      const value = ref<string | undefined>(undefined);
      return { value, optionsWithDisabled };
    },
    template: `
      <div style="padding: 40px; max-width: 320px;">
        <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Banana and Dragon Fruit are disabled</p>
        <BSelect v-model="value" :options="optionsWithDisabled" placeholder="Select..." />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 9. Max Tag Count
// ─────────────────────────────────────────────
export const MaxTagCount: Story = {
  render: () => ({
    components: { BSelect },
    setup: () => {
      const value = ref<string[]>(['apple', 'banana', 'cherry', 'elderberry']);
      return { value, fruitOptions };
    },
    template: `
      <div style="padding: 40px; max-width: 400px;">
        <p style="margin-bottom: 8px; font-size: 12px; color: #666;">maxTagCount=2 - remaining shown as +N</p>
        <BSelect v-model="value" :options="fruitOptions" mode="multiple" :max-tag-count="2" placeholder="Select..." />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 10. Accessibility
// ─────────────────────────────────────────────
export const Accessibility: Story = {
  args: {
    options: fruitOptions,
    placeholder: 'Accessible select',
  },
  render: (args) => ({
    components: { BSelect },
    setup: () => {
      const value = ref<string | undefined>(undefined);
      return { args, value };
    },
    template: `
      <div style="padding: 40px; max-width: 320px;">
        <label id="select-label" style="display: block; margin-bottom: 4px; font-size: 14px;">Choose a fruit</label>
        <BSelect v-bind="args" v-model="value" aria-labelledby="select-label" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selector = canvas.getByRole('combobox');

    expect(selector.getAttribute('role')).toBe('combobox');
    expect(selector.getAttribute('aria-haspopup')).toBe('listbox');
    expect(selector.getAttribute('aria-expanded')).toBe('false');

    await userEvent.click(selector);

    await waitFor(() => {
      expect(selector.getAttribute('aria-expanded')).toBe('true');
    });

    await waitFor(() => {
      const listbox = document.querySelector('[role="listbox"]');
      expect(listbox).toBeTruthy();
    });

    await waitFor(() => {
      const options = document.querySelectorAll('[role="option"]');
      expect(options.length).toBeGreaterThan(0);
    });

    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(selector.getAttribute('aria-activedescendant')).toBeTruthy();
    });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(selector.getAttribute('aria-expanded')).toBe('false');
    });
  },
};

// ─────────────────────────────────────────────
// 11. Theming (CSS vars override)
// ─────────────────────────────────────────────
export const Theming: Story = {
  render: () => ({
    components: { BSelect },
    setup: () => {
      const v1 = ref<string | undefined>(undefined);
      const v2 = ref<string | undefined>(undefined);
      const v3 = ref<string | undefined>(undefined);
      return { v1, v2, v3, fruitOptions };
    },
    template: `
      <div style="padding: 40px; display: flex; gap: 40px; flex-wrap: wrap;">
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Default</p>
          <BSelect v-model="v1" :options="fruitOptions" placeholder="Default theme" />
        </div>

        <div class="custom-select-theme-purple">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Purple accent</p>
          <BSelect v-model="v2" :options="fruitOptions" placeholder="Purple theme" />
        </div>

        <div class="custom-select-theme-compact">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Compact options</p>
          <BSelect v-model="v3" :options="fruitOptions" placeholder="Compact theme" />
        </div>
      </div>

      <style>
        .custom-select-theme-purple .b-select {
          --b-select-active-border-color: #7c3aed;
          --b-select-hover-border-color: #a78bfa;
          --b-select-active-outline-color: rgba(124, 58, 237, 0.12);
          --b-select-option-selected-bg: #f3e8ff;
          --b-select-option-active-bg: #faf5ff;
        }
        .custom-select-theme-compact .b-select {
          --b-select-option-padding-x: 8px;
          --b-select-option-padding-y: 2px;
          --b-select-option-font-size: 12px;
        }
      </style>
    `,
  }),
};

// ─────────────────────────────────────────────
// 12. Interaction Test
// ─────────────────────────────────────────────
export const InteractionTest: Story = {
  args: {
    options: fruitOptions,
    placeholder: 'Select a fruit...',
    allowClear: true,
  },
  render: (args) => ({
    components: { BSelect },
    setup: () => {
      const value = ref<string | undefined>(undefined);
      return { args, value };
    },
    template: `
      <div style="padding: 40px; max-width: 320px;">
        <BSelect v-bind="args" v-model="value" />
        <p data-testid="selected-value" style="margin-top: 12px; font-size: 12px; color: #666;">Selected: {{ value ?? 'none' }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selector = canvas.getByRole('combobox');

    // Open dropdown
    await userEvent.click(selector);

    // Verify options appear
    await waitFor(() => {
      const options = document.querySelectorAll('[role="option"]');
      expect(options.length).toBe(8);
    });

    // Navigate and select with keyboard
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');

    // Verify selection
    await waitFor(() => {
      expect(canvas.getByTestId('selected-value').textContent).toContain('banana');
    });

    // Clear selection
    const clearBtn = canvasElement.querySelector('.b-select__clear');
    if (clearBtn) {
      await userEvent.click(clearBtn);
      await waitFor(() => {
        expect(canvas.getByTestId('selected-value').textContent).toContain('none');
      });
    }

    // Reopen to verify options still render
    await userEvent.click(selector);
    await waitFor(() => {
      const options = document.querySelectorAll('[role="option"]');
      expect(options.length).toBe(8);
    });

    // Close dropdown so axe scans a clean state
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(selector.getAttribute('aria-expanded')).toBe('false');
    });
  },
};

// ─────────────────────────────────────────────
// 13. Disabled
// ─────────────────────────────────────────────
export const Disabled: Story = {
  args: {
    options: fruitOptions,
    disabled: true,
    placeholder: 'Disabled select',
    modelValue: 'apple',
  },
  render: (args) => ({
    components: { BSelect },
    setup: () => ({ args }),
    template: `
      <div style="padding: 40px; max-width: 320px;">
        <BSelect v-bind="args" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 14. Design Token Reference (LAST)
// ─────────────────────────────────────────────
export const DesignTokens: Story = {
  render: () => ({
    template: `
      <div style="padding: 40px; font-family: monospace; font-size: 13px; max-width: 900px;">
        <h3 style="margin-bottom: 16px; font-size: 16px; font-family: sans-serif;">BSelect Design Tokens</h3>
        <p style="margin-bottom: 16px; font-size: 13px; font-family: sans-serif; color: #666;">
          Override these CSS variables on <code>.b-select</code> or an ancestor to customize the component appearance.
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
              <td style="padding: 8px 12px;">--b-select-active-border-color</td>
              <td style="padding: 8px 12px;">#1677ff</td>
              <td style="padding: 8px 12px;">Border color when focused/active</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-select-active-outline-color</td>
              <td style="padding: 8px 12px;">rgba(5,145,255,0.1)</td>
              <td style="padding: 8px 12px;">Outline/glow on focus</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-select-hover-border-color</td>
              <td style="padding: 8px 12px;">#4096ff</td>
              <td style="padding: 8px 12px;">Border color on hover</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-select-border-color</td>
              <td style="padding: 8px 12px;">#d9d9d9</td>
              <td style="padding: 8px 12px;">Default border color</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-select-color</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.88)</td>
              <td style="padding: 8px 12px;">Text color of selected value</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-select-clear-bg</td>
              <td style="padding: 8px 12px;">#ffffff</td>
              <td style="padding: 8px 12px;">Background of clear button</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-select-selector-bg</td>
              <td style="padding: 8px 12px;">#ffffff</td>
              <td style="padding: 8px 12px;">Background of the selector</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-select-filled-bg</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.04)</td>
              <td style="padding: 8px 12px;">Background in filled variant</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-select-multiple-item-bg</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.06)</td>
              <td style="padding: 8px 12px;">Background of tag items</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-select-multiple-item-border-color</td>
              <td style="padding: 8px 12px;">transparent</td>
              <td style="padding: 8px 12px;">Border color of tag items</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-select-option-active-bg</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.04)</td>
              <td style="padding: 8px 12px;">Background of highlighted option</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-select-option-font-size</td>
              <td style="padding: 8px 12px;">14px</td>
              <td style="padding: 8px 12px;">Font size of options</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-select-option-height</td>
              <td style="padding: 8px 12px;">32px</td>
              <td style="padding: 8px 12px;">Height of each option item</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-select-option-line-height</td>
              <td style="padding: 8px 12px;">1.5714</td>
              <td style="padding: 8px 12px;">Line height of option text</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-select-option-padding-x</td>
              <td style="padding: 8px 12px;">12px</td>
              <td style="padding: 8px 12px;">Horizontal padding of options</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-select-option-padding-y</td>
              <td style="padding: 8px 12px;">5px</td>
              <td style="padding: 8px 12px;">Vertical padding of options</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-select-option-selected-bg</td>
              <td style="padding: 8px 12px;">#e6f4ff</td>
              <td style="padding: 8px 12px;">Background of selected option</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-select-option-selected-color</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.88)</td>
              <td style="padding: 8px 12px;">Text color of selected option</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-select-option-selected-font-weight</td>
              <td style="padding: 8px 12px;">600</td>
              <td style="padding: 8px 12px;">Font weight of selected option</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px;">--b-select-z-index-popup</td>
              <td style="padding: 8px 12px;">1050</td>
              <td style="padding: 8px 12px;">z-index of dropdown popup</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
};
