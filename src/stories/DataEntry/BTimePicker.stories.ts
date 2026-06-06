import { BTimePicker } from '@/components';
import {
  BTimePickerPlacement,
  BTimePickerSize,
  BTimePickerStatus,
  BTimePickerVariant,
} from '@/components/BTimePicker/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Data Entry/TimePicker',
  component: BTimePicker,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'date',
      description: 'Current time value (v-model).',
      table: { category: 'Two-Way Binding Props' },
    },
    size: {
      control: 'select',
      options: Object.values(BTimePickerSize),
      description: 'Size of the input.',
      table: { category: 'Props', defaultValue: { summary: 'md' } },
    },
    variant: {
      control: 'select',
      options: Object.values(BTimePickerVariant),
      description: 'Visual variant.',
      table: { category: 'Props', defaultValue: { summary: 'outlined' } },
    },
    status: {
      control: 'select',
      options: [undefined, ...Object.values(BTimePickerStatus)],
      description: 'Validation status.',
      table: { category: 'Props' },
    },
    placement: {
      control: 'select',
      options: Object.values(BTimePickerPlacement),
      description: 'Popup placement.',
      table: { category: 'Props', defaultValue: { summary: 'bottom-left' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the picker is disabled.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    allowClear: {
      control: 'boolean',
      description: 'Show clear button.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    showNow: {
      control: 'boolean',
      description: 'Show Now button in footer.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    use12Hours: {
      control: 'boolean',
      description: 'Use 12-hour format with AM/PM.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    needConfirm: {
      control: 'boolean',
      description: 'Require OK button to confirm selection.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    showHour: {
      control: 'boolean',
      description: 'Show hour column.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    showMinute: {
      control: 'boolean',
      description: 'Show minute column.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    showSecond: {
      control: 'boolean',
      description: 'Show second column.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    hourStep: {
      control: { type: 'number', min: 1, max: 12 },
      description: 'Hour step interval.',
      table: { category: 'Props', defaultValue: { summary: '1' } },
    },
    minuteStep: {
      control: { type: 'number', min: 1, max: 30 },
      description: 'Minute step interval.',
      table: { category: 'Props', defaultValue: { summary: '1' } },
    },
    secondStep: {
      control: { type: 'number', min: 1, max: 30 },
      description: 'Second step interval.',
      table: { category: 'Props', defaultValue: { summary: '1' } },
    },
    inputReadOnly: {
      control: 'boolean',
      description: 'Make input read-only.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input.',
      table: { category: 'Props' },
    },
    format: {
      control: 'text',
      description: 'Time format string (e.g., HH:mm:ss, hh:mm a).',
      table: { category: 'Props' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BTimePicker</code> component provides a time selection interface with hour, minute, and second columns. ' +
          'Supports 12/24-hour formats, step intervals, disabled time ranges, and keyboard navigation. ' +
          'Uses the Popover API for panel positioning.',
      },
    },
  },
} satisfies Meta<typeof BTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// ═════════════════════════════════════════════
// 1. Playground
// ═════════════════════════════════════════════
export const Playground: Story = {
  args: {
    size: 'md' as const,
    variant: 'outlined' as const,
    disabled: false,
    allowClear: true,
    showNow: true,
    needConfirm: true,
    use12Hours: false,
    showHour: true,
    showMinute: true,
    showSecond: true,
  },
  render: (args) => ({
    components: { BTimePicker },
    setup() {
      const time = ref<Date | null>(null);
      return { args, time };
    },
    template: `
      <div style="padding: 40px 40px 320px;">
        <BTimePicker v-bind="args" v-model="time" />
        <p style="margin-top: 16px; font-size: 14px; color: #666;">
          Selected: {{ time ? time.toLocaleTimeString() : 'none' }}
        </p>
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 2. Sizes
// ═════════════════════════════════════════════
export const Sizes: Story = {
  render: () => ({
    components: { BTimePicker },
    template: `
      <div style="display: flex; gap: 16px; align-items: center; padding: 40px 40px 320px;">
        <BTimePicker size="sm" placeholder="Small" />
        <BTimePicker size="md" placeholder="Medium" />
        <BTimePicker size="lg" placeholder="Large" />
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 3. Variants
// ═════════════════════════════════════════════
export const Variants: Story = {
  render: () => ({
    components: { BTimePicker },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 40px 40px 320px;">
        <BTimePicker variant="outlined" placeholder="Outlined" />
        <BTimePicker variant="filled" placeholder="Filled" />
        <BTimePicker variant="borderless" placeholder="Borderless" />
        <BTimePicker variant="underlined" placeholder="Underlined" />
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 4. Status
// ═════════════════════════════════════════════
export const Status: Story = {
  render: () => ({
    components: { BTimePicker },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 40px 40px 320px;">
        <label style="display: block;">
          <span style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Error status</span>
          <BTimePicker status="error" placeholder="Error status" />
        </label>
        <label style="display: block;">
          <span style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Warning status</span>
          <BTimePicker status="warning" placeholder="Warning status" />
        </label>
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 5. 12-Hour Format
// ═════════════════════════════════════════════
export const TwelveHourFormat: Story = {
  render: () => ({
    components: { BTimePicker },
    setup() {
      const time = ref<Date | null>(null);
      return { time };
    },
    template: `
      <div style="padding: 40px 40px 320px;">
        <BTimePicker v-model="time" :use12Hours="true" placeholder="Select time (12h)" />
        <p style="margin-top: 16px; font-size: 14px; color: #666;">
          Selected: {{ time ? time.toLocaleTimeString() : 'none' }}
        </p>
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 6. Step Intervals
// ═════════════════════════════════════════════
export const StepIntervals: Story = {
  render: () => ({
    components: { BTimePicker },
    setup() {
      const time = ref<Date | null>(null);
      return { time };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 40px 40px 320px;">
        <div>
          <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Hour step: 2, Minute step: 15, Second step: 10</label>
          <BTimePicker v-model="time" :hour-step="2" :minute-step="15" :second-step="10" />
        </div>
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 7. Disabled
// ═════════════════════════════════════════════
export const Disabled: Story = {
  render: () => ({
    components: { BTimePicker },
    setup() {
      const time = ref<Date | null>((() => { const d = new Date(); d.setHours(9, 30, 0, 0); return d; })());
      return { time };
    },
    template: `
      <div style="padding: 40px;">
        <BTimePicker v-model="time" disabled />
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 8. Disabled Time
// ═════════════════════════════════════════════
export const DisabledTime: Story = {
  render: () => ({
    components: { BTimePicker },
    setup() {
      const time = ref<Date | null>(null);
      const disabledTime = () => ({
        disabledHours: () => [0, 1, 2, 3, 4, 5, 22, 23],
        disabledMinutes: (hour: number) => (hour === 12 ? [0, 30] : []),
        disabledSeconds: () => [] as number[],
      });
      return { time, disabledTime };
    },
    template: `
      <div style="padding: 40px 40px 320px;">
        <p style="margin-bottom: 8px; font-size: 14px; color: #666;">Hours 0-5, 22-23 disabled; minutes 0,30 disabled at noon</p>
        <BTimePicker v-model="time" :disabled-time="disabledTime" />
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 9. Hide Seconds
// ═════════════════════════════════════════════
export const HideSeconds: Story = {
  render: () => ({
    components: { BTimePicker },
    setup() {
      const time = ref<Date | null>(null);
      return { time };
    },
    template: `
      <div style="padding: 40px 40px 320px;">
        <BTimePicker v-model="time" :show-second="false" format="HH:mm" placeholder="HH:mm" />
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 10. Without Confirm (auto-close)
// ═════════════════════════════════════════════
export const WithoutConfirm: Story = {
  render: () => ({
    components: { BTimePicker },
    setup() {
      const time = ref<Date | null>(null);
      return { time };
    },
    template: `
      <div style="padding: 40px 40px 320px;">
        <p style="margin-bottom: 8px; font-size: 14px; color: #666;">Panel auto-closes after all columns are selected</p>
        <BTimePicker v-model="time" :need-confirm="false" />
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 11. Accessibility
// ═════════════════════════════════════════════
export const Accessibility: Story = {
  render: () => ({
    components: { BTimePicker },
    setup() {
      const time = ref<Date | null>(null);
      return { time };
    },
    template: `
      <div style="padding: 40px 40px 320px;">
        <label id="time-label" style="display: block; margin-bottom: 8px; font-size: 14px;">Select a meeting time:</label>
        <BTimePicker v-model="time" placeholder="Click or press Enter" />
        <ul style="margin-top: 16px; font-size: 13px; color: #666;">
          <li>Tab: move focus to the picker input</li>
          <li>Enter/Space: open the panel</li>
          <li>Arrow Up/Down: navigate within column</li>
          <li>Tab/Shift+Tab: move between columns</li>
          <li>Escape: close the panel</li>
          <li>Enter: confirm selection</li>
        </ul>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // Verify ARIA attributes
    expect(input).toHaveAttribute('aria-haspopup', 'dialog');
    expect(input).toHaveAttribute('aria-expanded', 'false');

    // Open panel
    await userEvent.click(input);
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    // Verify panel accessibility
    const panel = canvasElement.querySelector('[role="dialog"]');
    expect(panel).toHaveAttribute('aria-modal', 'true');
    expect(panel).toHaveAttribute('aria-label', 'Time picker');

    // Verify columns have listbox role
    const listboxes = canvasElement.querySelectorAll('[role="listbox"]');
    expect(listboxes.length).toBe(3);

    // Verify cells have option role
    const options = canvasElement.querySelectorAll('[role="option"]');
    expect(options.length).toBeGreaterThan(0);

    // Close with Escape
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

// ═════════════════════════════════════════════
// 12. Theming (CSS Variable Overrides)
// ═════════════════════════════════════════════
export const Theming: Story = {
  render: () => ({
    components: { BTimePicker },
    setup() {
      const time = ref<Date | null>(null);
      return { time };
    },
    template: `
      <div style="padding: 40px 40px 320px;">
        <h4 style="margin-bottom: 16px; font-size: 14px;">Custom themed TimePicker (overriding CSS variables)</h4>
        <div
          class="b-time-picker-themed"
          style="
            --b-time-picker-active-border-color: #722ed1;
            --b-time-picker-active-shadow: 0 0 0 2px rgba(114, 46, 209, 0.15);
            --b-time-picker-cell-selected-bg: #f9f0ff;
            --b-time-picker-hover-border-color: #9254de;
            --b-time-picker-border-radius: 12px;
            --b-time-picker-panel-border-radius: 12px;
          "
        >
          <BTimePicker v-model="time" placeholder="Purple themed" />
        </div>
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 13. Interaction Test
// ═════════════════════════════════════════════
export const InteractionTest: Story = {
  render: () => ({
    components: { BTimePicker },
    setup() {
      const time = ref<Date | null>(null);
      return { time };
    },
    template: `
      <div style="padding: 40px 40px 320px;">
        <BTimePicker v-model="time" :need-confirm="true" />
        <p data-testid="result" style="margin-top: 16px; font-size: 14px; color: #666;">
          {{ time ? time.toLocaleTimeString('en-US', { hour12: false }) : 'none' }}
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');

    // Open picker
    await userEvent.click(input);

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    // Select hour 10
    const columns = canvasElement.querySelectorAll('.b-time-picker__column');
    const hourCells = columns[0].querySelectorAll('.b-time-picker__cell');
    await userEvent.click(hourCells[10]);

    // Select minute 30
    const minuteCells = columns[1].querySelectorAll('.b-time-picker__cell');
    await userEvent.click(minuteCells[30]);

    // Select second 0
    const secondCells = columns[2].querySelectorAll('.b-time-picker__cell');
    await userEvent.click(secondCells[0]);

    // Confirm
    const okBtn = canvasElement.querySelector('.b-time-picker__ok-btn') as HTMLElement;
    await userEvent.click(okBtn);

    // Verify panel closed
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    // Verify input value
    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe('10:30:00');
    });
  },
};

// ═════════════════════════════════════════════
// 14. Design Tokens
// ═════════════════════════════════════════════
export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'All scoped CSS variables exposed by <code>BTimePicker</code>. Override on the component root or any ancestor selector.',
      },
    },
  },
  render: () => ({
    setup() {
      const tokens = [
        { variable: '--b-time-picker-input-font-size', default: '14px', description: 'Input font size' },
        { variable: '--b-time-picker-input-font-size-lg', default: '16px', description: 'Input font size (large)' },
        { variable: '--b-time-picker-input-font-size-sm', default: '14px', description: 'Input font size (small)' },
        { variable: '--b-time-picker-padding-block', default: '4px', description: 'Vertical padding of input' },
        { variable: '--b-time-picker-padding-block-lg', default: '7px', description: 'Vertical padding (large)' },
        { variable: '--b-time-picker-padding-block-sm', default: '0px', description: 'Vertical padding (small)' },
        { variable: '--b-time-picker-padding-inline', default: '11px', description: 'Horizontal padding of input' },
        { variable: '--b-time-picker-padding-inline-lg', default: '11px', description: 'Horizontal padding (large)' },
        { variable: '--b-time-picker-padding-inline-sm', default: '7px', description: 'Horizontal padding (small)' },
        { variable: '--b-time-picker-border-color', default: '#d9d9d9', description: 'Border color' },
        { variable: '--b-time-picker-hover-border-color', default: '#4096ff', description: 'Hover border color' },
        { variable: '--b-time-picker-active-border-color', default: '#1677ff', description: 'Active border color' },
        { variable: '--b-time-picker-active-shadow', default: '0 0 0 2px rgba(5,145,255,0.1)', description: 'Box-shadow when active' },
        { variable: '--b-time-picker-error-active-shadow', default: '0 0 0 2px rgba(255,38,5,0.06)', description: 'Box-shadow when active (error)' },
        { variable: '--b-time-picker-warning-active-shadow', default: '0 0 0 2px rgba(255,215,5,0.1)', description: 'Box-shadow when active (warning)' },
        { variable: '--b-time-picker-bg', default: '#ffffff', description: 'Input background color' },
        { variable: '--b-time-picker-hover-bg', default: '#ffffff', description: 'Input hover background' },
        { variable: '--b-time-picker-active-bg', default: '#ffffff', description: 'Input active background' },
        { variable: '--b-time-picker-text-color', default: 'rgba(0,0,0,0.88)', description: 'Text color' },
        { variable: '--b-time-picker-placeholder-color', default: 'rgba(0,0,0,0.25)', description: 'Placeholder color' },
        { variable: '--b-time-picker-icon-color', default: 'rgba(0,0,0,0.25)', description: 'Suffix icon color' },
        { variable: '--b-time-picker-clear-color', default: 'rgba(0,0,0,0.25)', description: 'Clear icon color' },
        { variable: '--b-time-picker-clear-hover-color', default: 'rgba(0,0,0,0.45)', description: 'Clear icon hover color' },
        { variable: '--b-time-picker-disabled-bg', default: 'rgba(0,0,0,0.04)', description: 'Disabled background' },
        { variable: '--b-time-picker-disabled-color', default: 'rgba(0,0,0,0.25)', description: 'Disabled text color' },
        { variable: '--b-time-picker-panel-bg', default: '#ffffff', description: 'Panel background color' },
        { variable: '--b-time-picker-panel-shadow', default: '0 6px 16px 0 rgba(0,0,0,0.08)...', description: 'Panel box shadow' },
        { variable: '--b-time-picker-cell-height', default: '28px', description: 'Height of time cell' },
        { variable: '--b-time-picker-cell-width', default: '56px', description: 'Width of time cell' },
        { variable: '--b-time-picker-cell-hover-bg', default: 'rgba(0,0,0,0.04)', description: 'Cell hover background' },
        { variable: '--b-time-picker-cell-selected-bg', default: '#e6f4ff', description: 'Cell selected background' },
        { variable: '--b-time-picker-cell-disabled-bg', default: 'rgba(0,0,0,0.04)', description: 'Cell disabled background' },
        { variable: '--b-time-picker-cell-disabled-color', default: 'rgba(0,0,0,0.25)', description: 'Cell disabled text color' },
        { variable: '--b-time-picker-column-height', default: '224px', description: 'Height of time column' },
        { variable: '--b-time-picker-column-width', default: '56px', description: 'Width of time column' },
        { variable: '--b-time-picker-footer-bg', default: '#ffffff', description: 'Footer background color' },
        { variable: '--b-time-picker-border-radius', default: '6px', description: 'Input border radius' },
        { variable: '--b-time-picker-panel-border-radius', default: '8px', description: 'Panel border radius' },
        { variable: '--b-time-picker-transition-duration', default: '0.2s', description: 'Transition duration' },
        { variable: '--b-time-picker-z-index-popup', default: '1050', description: 'Panel z-index' },
      ];
      return { tokens };
    },
    template: `
      <div style="padding: 24px;">
        <h3 style="margin-bottom: 16px; font-size: 18px; font-weight: 600;">BTimePicker Design Tokens</h3>
        <p style="margin-bottom: 16px; font-size: 14px; color: #666;">
          Override these CSS variables on the <code>.b-time-picker</code> selector or any ancestor element to customize the appearance.
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 2px solid #f0f0f0;">
              <th style="text-align: left; padding: 8px 12px; font-weight: 600;">Variable</th>
              <th style="text-align: left; padding: 8px 12px; font-weight: 600;">Default</th>
              <th style="text-align: left; padding: 8px 12px; font-weight: 600;">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(token, index) in tokens" :key="token.variable" :style="{ background: index % 2 === 0 ? '#fafafa' : '#fff' }">
              <td style="padding: 6px 12px; font-family: monospace; font-size: 12px; color: #0958d9;">{{ token.variable }}</td>
              <td style="padding: 6px 12px; font-family: monospace; font-size: 12px;">{{ token.default }}</td>
              <td style="padding: 6px 12px;">{{ token.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
};
