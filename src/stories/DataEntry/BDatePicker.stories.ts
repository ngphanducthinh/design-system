import { BDatePicker } from '@/components';
import {
  BDatePickerPlacement,
  BDatePickerSize,
  BDatePickerStatus,
  BDatePickerType,
  BDatePickerVariant,
} from '@/components/BDatePicker/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Data Entry/DatePicker',
  component: BDatePicker,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'date',
      description: 'Current date value (v-model).',
      table: { category: 'Two-Way Binding Props' },
    },
    picker: {
      control: 'select',
      options: Object.values(BDatePickerType),
      description: 'Type of picker: date, week, month, quarter, year.',
      table: { defaultValue: { summary: 'date' } },
    },
    size: {
      control: 'select',
      options: Object.values(BDatePickerSize),
      description: 'Size of the input.',
      table: { defaultValue: { summary: 'md' } },
    },
    variant: {
      control: 'select',
      options: Object.values(BDatePickerVariant),
      description: 'Visual variant.',
      table: { defaultValue: { summary: 'outlined' } },
    },
    status: {
      control: 'select',
      options: [undefined, ...Object.values(BDatePickerStatus)],
      description: 'Validation status.',
    },
    placement: {
      control: 'select',
      options: Object.values(BDatePickerPlacement),
      description: 'Popup placement.',
      table: { defaultValue: { summary: 'bottom-left' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the picker is disabled.',
      table: { defaultValue: { summary: 'false' } },
    },
    allowClear: {
      control: 'boolean',
      description: 'Show clear button.',
      table: { defaultValue: { summary: 'true' } },
    },
    showNow: {
      control: 'boolean',
      description: 'Show Today button in footer.',
      table: { defaultValue: { summary: 'true' } },
    },
    showWeek: {
      control: 'boolean',
      description: 'Show week number column.',
      table: { defaultValue: { summary: 'false' } },
    },
    inputReadOnly: {
      control: 'boolean',
      description: 'Make input read-only.',
      table: { defaultValue: { summary: 'false' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input.',
    },
    format: {
      control: 'text',
      description: 'Date format string (e.g., YYYY-MM-DD, DD/MM/YYYY).',
    },
    locale: {
      control: 'select',
      options: [
        'en-US',
        'en-GB',
        'de-DE',
        'fr-FR',
        'es-ES',
        'it-IT',
        'pt-BR',
        'ja-JP',
        'ko-KR',
        'zh-CN',
        'zh-TW',
        'vi-VN',
        'th-TH',
        'ar-SA',
        'ru-RU',
        'nl-NL',
        'pl-PL',
        'tr-TR',
      ],
      description: 'BCP 47 locale tag for weekday/month labels.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BDatePicker</code> component provides a calendar-based date selection interface. ' +
          'Supports date, week, month, quarter, and year picking modes. ' +
          'Full keyboard navigation and screen-reader accessible. ' +
          'Uses the Popover API for panel positioning.',
      },
    },
  },
} satisfies Meta<typeof BDatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// ═════════════════════════════════════════════
// 1. Playground
// ═════════════════════════════════════════════
export const Playground: Story = {
  args: {
    picker: 'date' as const,
    size: 'md' as const,
    variant: 'outlined' as const,
    disabled: false,
    allowClear: true,
    showNow: true,
    showWeek: false,
    inputReadOnly: false,
  },
  render: (args) => ({
    components: { BDatePicker },
    setup() {
      const date = ref<Date | null>(null);
      return { args, date };
    },
    template: `
      <div style="padding: 40px 40px 350px;">
        <BDatePicker v-bind="args" v-model="date" />
        <p style="margin-top: 16px; font-size: 14px; color: #666;">
          Selected: {{ date ? date.toISOString().split('T')[0] : 'none' }}
        </p>
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 2. Picker Types
// ═════════════════════════════════════════════
export const PickerTypes: Story = {
  render: () => ({
    components: { BDatePicker },
    setup() {
      const date = ref<Date | null>(null);
      const week = ref<Date | null>(null);
      const month = ref<Date | null>(null);
      const quarter = ref<Date | null>(null);
      const year = ref<Date | null>(null);
      return { date, week, month, quarter, year };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 40px 40px 350px;">
        <div>
          <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Date Picker</label>
          <BDatePicker v-model="date" picker="date" />
        </div>
        <div>
          <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Week Picker</label>
          <BDatePicker v-model="week" picker="week" :show-week="true" />
        </div>
        <div>
          <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Month Picker</label>
          <BDatePicker v-model="month" picker="month" />
        </div>
        <div>
          <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Quarter Picker</label>
          <BDatePicker v-model="quarter" picker="quarter" />
        </div>
        <div>
          <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Year Picker</label>
          <BDatePicker v-model="year" picker="year" />
        </div>
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 3. Sizes
// ═════════════════════════════════════════════
export const Sizes: Story = {
  render: () => ({
    components: { BDatePicker },
    template: `
      <div style="display: flex; gap: 16px; align-items: center; padding: 40px 40px 350px;">
        <BDatePicker size="sm" placeholder="Small" />
        <BDatePicker size="md" placeholder="Medium" />
        <BDatePicker size="lg" placeholder="Large" />
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 4. Variants
// ═════════════════════════════════════════════
export const Variants: Story = {
  render: () => ({
    components: { BDatePicker },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 40px 40px 350px;">
        <BDatePicker variant="outlined" placeholder="Outlined" />
        <BDatePicker variant="filled" placeholder="Filled" />
        <BDatePicker variant="borderless" placeholder="Borderless" />
        <BDatePicker variant="underlined" placeholder="Underlined" />
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 5. Status
// ═════════════════════════════════════════════
export const Status: Story = {
  render: () => ({
    components: { BDatePicker },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 40px 40px 350px;">
        <BDatePicker status="error" placeholder="Error status" />
        <BDatePicker status="warning" placeholder="Warning status" />
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 6. Disabled
// ═════════════════════════════════════════════
export const Disabled: Story = {
  render: () => ({
    components: { BDatePicker },
    setup() {
      return { date: ref(new Date(2024, 5, 15)) };
    },
    template: `
      <div style="padding: 40px;">
        <BDatePicker v-model="date" disabled />
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 7. Disabled Dates
// ═════════════════════════════════════════════
export const DisabledDates: Story = {
  render: () => ({
    components: { BDatePicker },
    setup() {
      const date = ref<Date | null>(null);
      const disabledDate = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
      return { date, disabledDate };
    },
    template: `
      <div style="padding: 40px 40px 350px;">
        <p style="margin-bottom: 8px; font-size: 14px; color: #666;">Weekends disabled</p>
        <BDatePicker v-model="date" :disabled-date="disabledDate" />
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 8. Min/Max Date
// ═════════════════════════════════════════════
export const MinMaxDate: Story = {
  render: () => ({
    components: { BDatePicker },
    setup() {
      const date = ref<Date | null>(null);
      const minDate = new Date(2024, 0, 10);
      const maxDate = new Date(2024, 0, 25);
      return { date, minDate, maxDate };
    },
    template: `
      <div style="padding: 40px 40px 350px;">
        <p style="margin-bottom: 8px; font-size: 14px; color: #666;">Only Jan 10-25 selectable</p>
        <BDatePicker v-model="date" :min-date="minDate" :max-date="maxDate" :default-picker-value="minDate" />
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 9. Presets
// ═════════════════════════════════════════════
export const Presets: Story = {
  render: () => ({
    components: { BDatePicker },
    setup() {
      const date = ref<Date | null>(null);
      const presets = [
        { label: 'Today', value: () => new Date() },
        {
          label: 'Yesterday',
          value: () => {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            return d;
          },
        },
        {
          label: 'Last Week',
          value: () => {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            return d;
          },
        },
      ];
      return { date, presets };
    },
    template: `
      <div style="padding: 40px 40px 350px;">
        <BDatePicker v-model="date" :presets="presets" />
        <p style="margin-top: 8px; font-size: 14px; color: #666;">
          {{ date ? date.toLocaleDateString() : 'No date selected' }}
        </p>
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 10. Controlled
// ═════════════════════════════════════════════
export const Controlled: Story = {
  render: () => ({
    components: { BDatePicker },
    setup() {
      const date = ref<Date | null>(new Date(2024, 5, 15));
      const events: string[] = [];
      const onChange = (d: Date | null, str: string) => events.push(`change: ${str}`);
      const onOpenChange = (open: boolean) => events.push(`openChange: ${open}`);
      return { date, events, onChange, onOpenChange };
    },
    template: `
      <div style="padding: 40px 40px 350px;">
        <BDatePicker v-model="date" @change="onChange" @open-change="onOpenChange" />
        <div style="margin-top: 16px;">
          <code>Value: {{ date ? date.toISOString().split('T')[0] : 'null' }}</code>
          <div style="margin-top: 8px; font-size: 12px; color: #888; max-height: 100px; overflow: auto;">
            <div v-for="(e, i) in events" :key="i">{{ e }}</div>
          </div>
        </div>
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 11. Accessibility
// ═════════════════════════════════════════════
export const Accessibility: Story = {
  render: () => ({
    components: { BDatePicker },
    setup() {
      return { date: ref<Date | null>(null) };
    },
    template: `
      <div style="padding: 40px 120px 350px;">
        <BDatePicker v-model="date" data-testid="a11y-picker" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // Verify input accessibility attributes
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-haspopup', 'dialog');
    expect(input).toHaveAttribute('role', 'combobox');

    // Open picker via click
    await userEvent.click(input.closest('.b-date-picker__input-wrap')!);

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    // Panel has dialog role
    const panel = canvasElement.querySelector('[role="dialog"]');
    expect(panel).toBeTruthy();
    expect(panel).toHaveAttribute('aria-modal', 'true');

    // Calendar grid has proper role
    const grid = canvasElement.querySelector('[role="grid"]');
    expect(grid).toBeTruthy();
    expect(grid).toHaveAttribute('aria-label', 'Calendar');

    // Cells have aria-label with date
    const cells = canvasElement.querySelectorAll('.b-date-picker__cell[aria-label]');
    expect(cells.length).toBeGreaterThan(0);

    // Close via Escape
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

// ═════════════════════════════════════════════
// 12. Interaction Tests
// ═════════════════════════════════════════════
export const Interactions: Story = {
  render: () => ({
    components: { BDatePicker },
    setup() {
      const date = ref<Date | null>(null);
      return { date };
    },
    template: `
      <div style="padding: 40px 120px 350px;">
        <BDatePicker v-model="date" />
        <p data-testid="date-display" style="margin-top: 8px; font-size: 14px;">
          {{ date ? date.toISOString().split('T')[0] : 'none' }}
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // Click to open
    await userEvent.click(input.closest('.b-date-picker__input-wrap')!);

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    // Click a date cell (first current month cell)
    const cells = canvasElement.querySelectorAll(
      '.b-date-picker__cell:not(.b-date-picker__cell--other):not(.b-date-picker__cell--disabled)',
    );
    expect(cells.length).toBeGreaterThan(0);
    await userEvent.click(cells[0]);

    // Verify date was selected
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
      const display = canvas.getByTestId('date-display');
      expect(display.textContent?.trim()).not.toBe('none');
    });

    // Reopen and test navigation
    await userEvent.click(input.closest('.b-date-picker__input-wrap')!);
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    // Click heading to go to month view
    const heading = canvasElement.querySelector('.b-date-picker__heading');
    expect(heading).toBeTruthy();
    await userEvent.click(heading!);

    // Should show month grid
    await waitFor(() => {
      const monthGrid = canvasElement.querySelector('[aria-label="Month selection"]');
      expect(monthGrid).toBeTruthy();
    });

    // Close via Escape
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

// ═════════════════════════════════════════════
// 13. Locale & Format
// ═════════════════════════════════════════════
export const LocaleAndFormat: Story = {
  render: () => ({
    components: { BDatePicker },
    setup() {
      const date = ref<Date | null>(new Date(2024, 5, 15));
      return { date };
    },
    template: `
      <div style="padding: 40px 40px 350px; display: flex; flex-direction: column; gap: 24px;">
        <div>
          <h4 style="margin-bottom: 8px; font-size: 14px; color: #666;">Default (YYYY-MM-DD, en-US)</h4>
          <BDatePicker v-model="date" />
        </div>
        <div>
          <h4 style="margin-bottom: 8px; font-size: 14px; color: #666;">DD/MM/YYYY format</h4>
          <BDatePicker v-model="date" format="DD/MM/YYYY" />
        </div>
        <div>
          <h4 style="margin-bottom: 8px; font-size: 14px; color: #666;">MM-DD-YYYY format</h4>
          <BDatePicker v-model="date" format="MM-DD-YYYY" />
        </div>
        <div>
          <h4 style="margin-bottom: 8px; font-size: 14px; color: #666;">DD.MM.YY format (German locale)</h4>
          <BDatePicker v-model="date" format="DD.MM.YY" locale="de-DE" />
        </div>
        <div>
          <h4 style="margin-bottom: 8px; font-size: 14px; color: #666;">Vietnamese locale (vi-VN)</h4>
          <BDatePicker v-model="date" locale="vi-VN" />
        </div>
        <div>
          <h4 style="margin-bottom: 8px; font-size: 14px; color: #666;">Japanese locale (ja-JP)</h4>
          <BDatePicker v-model="date" locale="ja-JP" />
        </div>
        <div>
          <h4 style="margin-bottom: 8px; font-size: 14px; color: #666;">Literal escape: YYYY [year] MM [month] DD [day]</h4>
          <BDatePicker v-model="date" format="YYYY [year] MM [month] DD [day]" />
        </div>
        <div>
          <h4 style="margin-bottom: 8px; font-size: 14px; color: #666;">Quarter with format YYYY-[Q]Q</h4>
          <BDatePicker v-model="date" picker="quarter" format="YYYY-[Q]Q" />
        </div>
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 14. Theming (CSS variable overrides)
// ═════════════════════════════════════════════
export const Theming: Story = {
  render: () => ({
    components: { BDatePicker },
    template: `
      <div style="padding: 40px 40px 350px;">
        <h4 style="margin-bottom: 16px; font-size: 14px; color: #666;">Default</h4>
        <BDatePicker placeholder="Default theme" />

        <h4 style="margin: 24px 0 16px; font-size: 14px; color: #666;">Custom Tokens</h4>
        <div
          class="b-date-picker"
          style="
            --b-date-picker-active-border-color: #722ed1;
            --b-date-picker-selected-bg: #722ed1;
            --b-date-picker-today-border-color: #722ed1;
            --b-date-picker-border-radius: 12px;
            --b-date-picker-hover-border-color: #9254de;
          "
        >
          <BDatePicker placeholder="Purple theme" />
        </div>

        <h4 style="margin: 24px 0 16px; font-size: 14px; color: #666;">Dark-style Override</h4>
        <div
          class="b-date-picker"
          style="
            --b-date-picker-bg: #1f1f1f;
            --b-date-picker-border-color: #424242;
            --b-date-picker-text-color: rgba(255, 255, 255, 0.88);
            --b-date-picker-text-color-secondary: rgba(255, 255, 255, 0.45);
            --b-date-picker-panel-bg: #2a2a2a;
          "
        >
          <BDatePicker placeholder="Dark override" />
        </div>
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 15. Design Tokens (MUST BE LAST)
// ═════════════════════════════════════════════
export const DesignTokens: Story = {
  render: () => ({
    setup() {
      const tokens = [
        {
          variable: '--b-date-picker-active-bg',
          default: '#ffffff',
          description: 'Background color when input is activated',
        },
        {
          variable: '--b-date-picker-active-border-color',
          default: '#1677ff',
          description: 'Border color when input is focused',
        },
        {
          variable: '--b-date-picker-active-shadow',
          default: '0 0 0 2px rgba(5,145,255,0.1)',
          description: 'Box-shadow when active',
        },
        {
          variable: '--b-date-picker-hover-bg',
          default: '#ffffff',
          description: 'Background color on hover',
        },
        {
          variable: '--b-date-picker-hover-border-color',
          default: '#4096ff',
          description: 'Border color on hover',
        },
        {
          variable: '--b-date-picker-cell-active-with-range-bg',
          default: '#e6f4ff',
          description: 'Background of cell in range',
        },
        {
          variable: '--b-date-picker-cell-bg-disabled',
          default: 'rgba(0,0,0,0.04)',
          description: 'Background of disabled cell',
        },
        {
          variable: '--b-date-picker-cell-height',
          default: '24px',
          description: 'Height of date cell',
        },
        {
          variable: '--b-date-picker-cell-width',
          default: '36px',
          description: 'Width of date cell',
        },
        {
          variable: '--b-date-picker-cell-hover-bg',
          default: 'rgba(0,0,0,0.04)',
          description: 'Background of hovered cell',
        },
        {
          variable: '--b-date-picker-cell-hover-with-range-bg',
          default: '#c8dfff',
          description: 'Background of hovered cell in range',
        },
        {
          variable: '--b-date-picker-cell-range-border-color',
          default: '#82b4f9',
          description: 'Border color of cell in range',
        },
        {
          variable: '--b-date-picker-error-active-shadow',
          default: '0 0 0 2px rgba(255,38,5,0.06)',
          description: 'Box-shadow in error status',
        },
        {
          variable: '--b-date-picker-warning-active-shadow',
          default: '0 0 0 2px rgba(255,215,5,0.1)',
          description: 'Box-shadow in warning status',
        },
        {
          variable: '--b-date-picker-input-font-size',
          default: '14px',
          description: 'Input font size (medium)',
        },
        {
          variable: '--b-date-picker-input-font-size-lg',
          default: '16px',
          description: 'Input font size (large)',
        },
        {
          variable: '--b-date-picker-input-font-size-sm',
          default: '12px',
          description: 'Input font size (small)',
        },
        {
          variable: '--b-date-picker-padding-block',
          default: '4px',
          description: 'Vertical padding of input',
        },
        {
          variable: '--b-date-picker-padding-block-lg',
          default: '7px',
          description: 'Vertical padding (large)',
        },
        {
          variable: '--b-date-picker-padding-block-sm',
          default: '0px',
          description: 'Vertical padding (small)',
        },
        {
          variable: '--b-date-picker-padding-inline',
          default: '11px',
          description: 'Horizontal padding of input',
        },
        {
          variable: '--b-date-picker-presets-width',
          default: '120px',
          description: 'Width of presets area',
        },
        {
          variable: '--b-date-picker-presets-max-width',
          default: '200px',
          description: 'Max width of presets area',
        },
        {
          variable: '--b-date-picker-text-height',
          default: '40px',
          description: 'Height of text cell',
        },
        {
          variable: '--b-date-picker-without-time-cell-height',
          default: '66px',
          description: 'Height of month/year/quarter cell',
        },
        {
          variable: '--b-date-picker-z-index-popup',
          default: '1050',
          description: 'z-index of popup panel',
        },
        {
          variable: '--b-date-picker-bg',
          default: '#ffffff',
          description: 'Input background color',
        },
        {
          variable: '--b-date-picker-border-color',
          default: '#d9d9d9',
          description: 'Input border color',
        },
        { variable: '--b-date-picker-border-radius', default: '6px', description: 'Border radius' },
        {
          variable: '--b-date-picker-text-color',
          default: 'rgba(0,0,0,0.88)',
          description: 'Primary text color',
        },
        {
          variable: '--b-date-picker-text-color-secondary',
          default: 'rgba(0,0,0,0.45)',
          description: 'Secondary text color',
        },
        {
          variable: '--b-date-picker-text-color-disabled',
          default: 'rgba(0,0,0,0.25)',
          description: 'Disabled text color',
        },
        {
          variable: '--b-date-picker-panel-bg',
          default: '#ffffff',
          description: 'Panel background',
        },
        {
          variable: '--b-date-picker-panel-shadow',
          default: '0 6px 16px 0 rgba(0,0,0,0.08), ...',
          description: 'Panel box shadow',
        },
        {
          variable: '--b-date-picker-selected-bg',
          default: '#1677ff',
          description: 'Selected cell background',
        },
        {
          variable: '--b-date-picker-selected-color',
          default: '#ffffff',
          description: 'Selected cell text color',
        },
        {
          variable: '--b-date-picker-today-border-color',
          default: '#1677ff',
          description: 'Today cell border color',
        },
        {
          variable: '--b-date-picker-transition-duration',
          default: '200ms',
          description: 'Transition duration for animations',
        },
      ];
      return { tokens };
    },
    template: `
      <div style="padding: 24px; font-family: -apple-system, sans-serif;">
        <h3 style="margin-bottom: 16px; font-size: 18px;">BDatePicker Design Tokens</h3>
        <p style="margin-bottom: 16px; font-size: 14px; color: #666;">
          All CSS custom properties are scoped to <code>.b-date-picker</code>. Override them on an ancestor to customize.
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
              <td style="padding: 8px 12px; font-family: monospace; color: #c41d7f;">{{ token.variable }}</td>
              <td style="padding: 8px 12px; font-family: monospace;">{{ token.default }}</td>
              <td style="padding: 8px 12px;">{{ token.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
};
