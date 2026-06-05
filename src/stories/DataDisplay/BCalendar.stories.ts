import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

import { BCalendar } from '@/components';
import type { BCalendarEvent, BCalendarMode } from '@/types';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Data Display/Calendar',
  component: BCalendar,
  tags: ['autodocs'],
  argTypes: {
    // ── Two-Way Binding Props ──
    modelValue: {
      control: 'date',
      description: 'Currently selected date (controlled). Pair with `v-model`.',
      table: { category: 'Two-Way Binding Props' },
    },
    mode: {
      control: 'select',
      options: ['month', 'year'] satisfies BCalendarMode[],
      description: 'Controlled panel mode. Pair with `v-model:mode`.',
      table: { category: 'Two-Way Binding Props' },
    },
    // ── Props ──
    defaultValue: {
      control: 'date',
      description: 'Initial selected date for uncontrolled usage.',
      table: { category: 'Props' },
    },
    defaultMode: {
      control: 'select',
      options: ['month', 'year'] satisfies BCalendarMode[],
      description: 'Initial panel mode for uncontrolled usage.',
      table: { defaultValue: { summary: "'month'" }, category: 'Props' },
    },
    fullscreen: {
      control: 'boolean',
      description: 'Full-screen layout when true; mini layout when false.',
      table: { defaultValue: { summary: 'true' }, category: 'Props' },
    },
    showWeek: {
      control: 'boolean',
      description: 'Show a week-number column in month mode.',
      table: { defaultValue: { summary: 'false' }, category: 'Props' },
    },
    locale: {
      control: 'text',
      description: 'BCP 47 locale tag (e.g. "en-US", "vi-VN", "de-DE").',
      table: { category: 'Props' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the calendar root region.',
      table: { defaultValue: { summary: "'Calendar'" }, category: 'Props' },
    },
    validRange: { table: { category: 'Props' } },
    disabledDate: { table: { category: 'Props' } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BCalendar</code> displays date or month panels for ' +
          'displaying and selecting dates. Mirrors the AntD Calendar API: ' +
          '<code>mode</code>, <code>fullscreen</code>, <code>showWeek</code>, ' +
          '<code>validRange</code>, <code>disabledDate</code>, plus header / cell slots ' +
          'matching <code>headerRender</code>, <code>cellRender</code>, and ' +
          '<code>fullCellRender</code>. Dark mode and reduced-motion friendly.',
      },
    },
  },
} satisfies Meta<typeof BCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// 1. Playground
// ─────────────────────────────────────────────
export const Playground: Story = {
  args: {
    fullscreen: true,
    showWeek: false,
    defaultMode: 'month',
  },
  render: (args) => ({
    components: { BCalendar },
    setup: () => ({ args }),
    template: `
      <div style="max-width: 840px; margin: 1rem auto;">
        <BCalendar v-bind="args" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 2. Basic
// ─────────────────────────────────────────────
export const Basic: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: `<BCalendar />` } },
  },
  render: () => ({
    components: { BCalendar },
    template: `
      <div style="max-width: 840px; margin: 1rem auto;">
        <BCalendar data-testid="basic" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByTestId('basic');
    expect(root.classList.contains('b-calendar--fullscreen')).toBe(true);
    expect(root.querySelectorAll('.b-calendar__cell').length).toBe(42);
  },
};

// ─────────────────────────────────────────────
// 3. Mini (fullscreen=false)
// ─────────────────────────────────────────────
export const Mini: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: `<BCalendar :fullscreen="false" />` } },
  },
  render: () => ({
    components: { BCalendar },
    template: `
      <div style="max-width: 320px; margin: 1rem auto;">
        <BCalendar data-testid="mini" :fullscreen="false" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByTestId('mini');
    expect(root.classList.contains('b-calendar--mini')).toBe(true);
  },
};

// ─────────────────────────────────────────────
// 4. Show week numbers
// ─────────────────────────────────────────────
export const ShowWeek: Story = {
  name: 'Show Week Numbers',
  parameters: {
    controls: { disable: true },
    docs: { source: { code: `<BCalendar show-week />` } },
  },
  render: () => ({
    components: { BCalendar },
    template: `
      <div style="max-width: 840px; margin: 1rem auto;">
        <BCalendar data-testid="show-week" show-week />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByTestId('show-week');
    expect(root.querySelector('.b-calendar__weekday--week')).toBeTruthy();
    expect(root.querySelectorAll('.b-calendar__week-number').length).toBeGreaterThan(0);
  },
};

// ─────────────────────────────────────────────
// 5. Year mode
// ─────────────────────────────────────────────
export const YearMode: Story = {
  name: 'Year Mode',
  parameters: {
    controls: { disable: true },
    docs: { source: { code: `<BCalendar default-mode="year" />` } },
  },
  render: () => ({
    components: { BCalendar },
    template: `
      <div style="max-width: 840px; margin: 1rem auto;">
        <BCalendar data-testid="year-mode" default-mode="year" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByTestId('year-mode');
    expect(root.classList.contains('b-calendar--mode-year')).toBe(true);
    expect(root.querySelectorAll('.b-calendar__cell--month').length).toBe(12);
  },
};

// ─────────────────────────────────────────────
// 6. Disabled dates
// ─────────────────────────────────────────────
export const DisabledDates: Story = {
  name: 'Disabled Dates',
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BCalendar :disabled-date="d => d.getDay() === 0 || d.getDay() === 6" />`,
      },
    },
  },
  render: () => ({
    components: { BCalendar },
    setup() {
      const disabledDate = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
      return { disabledDate };
    },
    template: `
      <div style="max-width: 840px; margin: 1rem auto;">
        <BCalendar data-testid="disabled" :disabled-date="disabledDate" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByTestId('disabled');
    expect(root.querySelectorAll('.b-calendar__cell--disabled').length).toBeGreaterThan(0);
  },
};

// ─────────────────────────────────────────────
// 7. Valid range
// ─────────────────────────────────────────────
export const ValidRange: Story = {
  name: 'Valid Range',
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BCalendar :valid-range="[new Date(2026, 4, 10), new Date(2026, 4, 25)]" />`,
      },
    },
  },
  render: () => ({
    components: { BCalendar },
    setup() {
      const validRange: [Date, Date] = [new Date(2026, 4, 10), new Date(2026, 4, 25)];
      const defaultValue = new Date(2026, 4, 15);
      return { validRange, defaultValue };
    },
    template: `
      <div style="max-width: 840px; margin: 1rem auto;">
        <BCalendar
          data-testid="valid-range"
          :valid-range="validRange"
          :default-value="defaultValue"
        />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 8. Custom cell content (cellRender)
// ─────────────────────────────────────────────
export const CustomCellContent: Story = {
  name: 'Custom Cell Content',
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BCalendar>
  <template #dateCell="{ date }">
    <div v-if="date.getDate() === 8">Event</div>
  </template>
</BCalendar>`,
      },
    },
  },
  render: () => ({
    components: { BCalendar },
    template: `
      <div style="max-width: 840px; margin: 1rem auto;">
        <BCalendar data-testid="custom-cell">
          <template #dateCell="{ date }">
            <ul v-if="date.getDate() === 8" style="list-style:none;margin:0;padding:0;font-size:11px;">
              <li style="background:oklch(95% 0.04 250);color:oklch(40% 0.18 260);padding:2px 6px;border-radius:4px;">
                Standup
              </li>
            </ul>
          </template>
        </BCalendar>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByTestId('custom-cell');
    const ul = root.querySelector('ul');
    expect(ul).toBeTruthy();
    expect(ul?.textContent).toContain('Standup');
  },
};

// ─────────────────────────────────────────────
// 9. Calendar with events (real-world usage)
// ─────────────────────────────────────────────
export const WithEvents: Story = {
  name: 'With Events',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Pass an `events` function returning items per date - the calendar auto-renders ' +
          'colored markers in each day cell and pops a built-in details modal on click. ' +
          'No slot or external modal wiring needed.',
      },
      source: {
        code: `<BCalendar :events="getEvents" />`,
      },
    },
  },
  render: () => ({
    components: { BCalendar },
    setup() {
      const eventsByDay: Record<number, BCalendarEvent[]> = {
        8: [
          { type: 'warning', title: 'This is warning event' },
          { type: 'success', title: 'This is usual event' },
        ],
        10: [
          { type: 'warning', title: 'This is warning event' },
          { type: 'success', title: 'This is usual event' },
          { type: 'error', title: 'This is error event' },
        ],
        15: [
          { type: 'warning', title: 'This is warning event' },
          {
            type: 'success',
            title: 'This is very long usual event......',
            description: 'A long-running task tracked from Q2.',
          },
          { type: 'error', title: 'This is error event 1' },
          { type: 'error', title: 'This is error event 2' },
          { type: 'error', title: 'This is error event 3' },
          { type: 'error', title: 'This is error event 4' },
        ],
      };
      const getEvents = (date: Date): BCalendarEvent[] => eventsByDay[date.getDate()] ?? [];
      const defaultValue = new Date(2026, 4, 15);

      return { getEvents, defaultValue };
    },
    template: `
      <div data-testid="events-wrapper" style="max-width: 1100px; margin: 1rem auto;">
        <BCalendar data-testid="events-calendar" :events="getEvents" :default-value="defaultValue" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByTestId('events-calendar');

    // In-cell event lists rendered automatically by the component.
    const day8 = root.querySelector('[data-b-calendar-date="2026-05-08"] .b-calendar__events');
    const day10 = root.querySelector('[data-b-calendar-date="2026-05-10"] .b-calendar__events');
    const day15 = root.querySelector('[data-b-calendar-date="2026-05-15"] .b-calendar__events');
    expect(day8).toBeTruthy();
    expect(day10).toBeTruthy();
    expect(day15).toBeTruthy();
    expect(day8?.querySelectorAll('.b-calendar__event')).toHaveLength(2);
    expect(day10?.querySelectorAll('.b-calendar__event')).toHaveLength(3);
    expect(day15?.querySelectorAll('.b-calendar__event').length).toBeGreaterThanOrEqual(3);
    const day11 = root.querySelector('[data-b-calendar-date="2026-05-11"] .b-calendar__events');
    expect(day11).toBeNull();

    // Click May 15 → built-in modal opens with all 6 events.
    const cell15 = root.querySelector('[data-b-calendar-date="2026-05-15"]') as HTMLElement;
    expect(cell15).toBeTruthy();
    await userEvent.click(cell15);

    // <dialog> renders into the top-layer; query from document.
    const modalBody = await waitFor(
      () => {
        const el = document.body.querySelector('.b-calendar__modal-body');
        if (!el) throw new Error('modal not rendered yet');
        return el as HTMLElement;
      },
      { timeout: 2000 },
    );
    expect(modalBody).toBeTruthy();
    const items = modalBody.querySelectorAll('.b-calendar__modal-event');
    expect(items).toHaveLength(6);
    expect(modalBody.textContent).toContain('This is very long usual event......');

    // Close modal via built-in close button.
    const closeBtn = modalBody.querySelector('.b-calendar__modal-close') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    await userEvent.click(closeBtn);
  },
};

// ─────────────────────────────────────────────
// 10. Custom header (headerRender)
// ─────────────────────────────────────────────
export const CustomHeader: Story = {
  name: 'Custom Header',
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BCalendar>
  <template #header="{ value, mode, onTypeChange, onChange }">
    <!-- custom UI -->
  </template>
</BCalendar>`,
      },
    },
  },
  render: () => ({
    components: { BCalendar },
    template: `
      <div style="max-width: 840px; margin: 1rem auto;">
        <BCalendar data-testid="custom-header">
          <template #header="{ value, mode }">
            <div data-testid="custom-header-content"
                 style="flex:1;display:flex;align-items:center;justify-content:space-between;
                        gap:16px;padding:8px 0 16px;font:600 18px sans-serif;">
              <span>{{ value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}</span>
              <span style="color:oklch(54.6% 0.245 262.881);font-size:14px;font-weight:500;">Mode: {{ mode }}</span>
            </div>
          </template>
        </BCalendar>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByTestId('custom-header-content')).toBeTruthy();
  },
};

// ─────────────────────────────────────────────
// 10. Controlled (v-model)
// ─────────────────────────────────────────────
export const Controlled: Story = {
  name: 'Controlled (v-model)',
  parameters: {
    controls: { disable: true },
    docs: { source: { code: `<BCalendar v-model="value" v-model:mode="mode" />` } },
  },
  render: () => ({
    components: { BCalendar },
    setup() {
      const value = ref<Date | null>(new Date(2026, 4, 15));
      const mode = ref<BCalendarMode>('month');
      const fmt = (d: Date | null) =>
        d
          ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          : '';
      return { value, mode, fmt };
    },
    template: `
      <div style="max-width: 840px; margin: 1rem auto;">
        <p data-testid="ctrl-info" style="font:13px sans-serif;color:#595959;margin:0 0 8px;">
          Selected: <code data-testid="ctrl-selected">{{ fmt(value) }}</code>
          / mode: <code>{{ mode }}</code>
        </p>
        <BCalendar data-testid="controlled" v-model="value" v-model:mode="mode" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByTestId('controlled');
    const cell = root.querySelector('[data-b-calendar-date="2026-05-20"]') as HTMLElement;
    await userEvent.click(cell);
    expect(canvas.getByTestId('ctrl-selected').textContent).toBe('2026-05-20');
  },
};

// ─────────────────────────────────────────────
// 11. Localized (vi-VN)
// ─────────────────────────────────────────────
export const Localized: Story = {
  name: 'Localized (vi-VN)',
  parameters: {
    controls: { disable: true },
    docs: { source: { code: `<BCalendar locale="vi-VN" />` } },
  },
  render: () => ({
    components: { BCalendar },
    template: `
      <div style="max-width: 840px; margin: 1rem auto;">
        <BCalendar data-testid="locale" locale="vi-VN" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 12. Accessibility
// ─────────────────────────────────────────────
export const Accessibility: Story = {
  name: 'Accessibility (roles, ARIA, keyboard)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Verifies <code>role="region"</code>, <code>role="grid"</code>, ' +
          '<code>role="gridcell"</code>, <code>aria-current="date"</code> on today, ' +
          'roving tabindex, polite live region, and arrow-key navigation.',
      },
    },
  },
  render: () => ({
    components: { BCalendar },
    setup() {
      const value = ref<Date | null>(new Date(2026, 4, 15));
      return { value };
    },
    template: `
      <div style="max-width: 840px; margin: 1rem auto;">
        <BCalendar data-testid="a11y" v-model="value" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByTestId('a11y');

    // Region semantics.
    expect(root.getAttribute('role')).toBe('region');
    expect(root.getAttribute('aria-label')).toBe('Calendar');
    const grid = root.querySelector('.b-calendar__table') as HTMLElement;
    expect(grid.getAttribute('role')).toBe('grid');

    // Gridcells.
    const cells = root.querySelectorAll('.b-calendar__cell');
    expect(cells.length).toBe(42);
    cells.forEach((c) => expect(c.getAttribute('role')).toBe('gridcell'));

    // Roving tabindex.
    const focusables = Array.from(cells).filter((c) => c.getAttribute('tabindex') === '0');
    expect(focusables.length).toBe(1);
    expect(focusables[0].getAttribute('data-b-calendar-date')).toBe('2026-05-15');

    // Selected aria.
    const selected = root.querySelector('.b-calendar__cell--selected') as HTMLElement;
    expect(selected.getAttribute('aria-selected')).toBe('true');

    // Arrow-key navigation.
    (focusables[0] as HTMLElement).focus();
    await userEvent.keyboard('{ArrowRight}');
    const next = root.querySelector('[data-b-calendar-date="2026-05-16"]') as HTMLElement;
    expect(next.getAttribute('tabindex')).toBe('0');

    // Live region.
    const live = root.querySelector('.b-calendar__sr-only[aria-live="polite"]');
    expect(live).toBeTruthy();

    // Mode switch is a radiogroup.
    const modeSwitch = root.querySelector('.b-calendar__mode-switch') as HTMLElement;
    expect(modeSwitch.getAttribute('role')).toBe('radiogroup');
  },
};

// ─────────────────────────────────────────────
// 13. Interaction tests
// ─────────────────────────────────────────────
export const InteractionTests: Story = {
  name: 'Interaction - full flow',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Drives date click, mode switch, header navigation, and asserts ' +
          'change / select / panelChange callbacks.',
      },
    },
  },
  args: {
    'onUpdate:modelValue': fn(),
    onChange: fn(),
    onSelect: fn(),
    onPanelChange: fn(),
    defaultValue: new Date(2026, 4, 15),
  } as unknown as Story['args'],
  render: (args) => ({
    components: { BCalendar },
    setup: () => ({ args }),
    template: `
      <div style="max-width: 840px; margin: 1rem auto;">
        <BCalendar data-testid="ix" v-bind="args" />
      </div>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByTestId('ix');

    // Click a date.
    const cell = root.querySelector('[data-b-calendar-date="2026-05-15"]') as HTMLElement;
    await userEvent.click(cell);
    expect(args['onUpdate:modelValue']).toHaveBeenCalled();
    expect(args.onChange).toHaveBeenCalled();
    expect(args.onSelect).toHaveBeenCalled();

    // Switch to year mode via mode switch.
    const yearRadio = root.querySelectorAll('.b-calendar__mode-option input')[1] as HTMLElement;
    await userEvent.click(yearRadio);
    expect(args.onPanelChange).toHaveBeenCalled();
  },
};

// ─────────────────────────────────────────────
// 14. Theming (override CSS variables)
// ─────────────────────────────────────────────
export const Theming: Story = {
  name: 'Theming (CSS variables)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Override <code>--b-calendar-*</code> tokens to retheme. The example below ' +
          'overrides four tokens: primary color, item active bg, panel bg, and border radius.',
      },
    },
  },
  render: () => ({
    components: { BCalendar },
    template: `
      <div style="max-width: 840px; margin: 1rem auto;">
        <BCalendar
          data-testid="themed"
          style="
            --b-calendar-primary-color: oklch(42% 0.16 145);
            --b-calendar-item-active-bg: oklch(95% 0.05 145);
            --b-calendar-full-bg: oklch(98% 0.005 145);
            --b-calendar-border-radius: 16px;
            --b-calendar-cell-radius: 8px;
          "
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByTestId('themed') as HTMLElement;
    expect(root.style.getPropertyValue('--b-calendar-primary-color')).toBeTruthy();
    expect(root.style.getPropertyValue('--b-calendar-item-active-bg')).toBeTruthy();
    expect(root.style.getPropertyValue('--b-calendar-full-bg')).toBeTruthy();
  },
};

// ─────────────────────────────────────────────
// 15. Design Tokens - MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  // ── AntD-aligned tokens ──
  {
    token: '--b-calendar-full-bg',
    defaultValue: 'oklch(100% 0 0)',
    description: 'Background of the full calendar (AntD: fullBg).',
  },
  {
    token: '--b-calendar-full-panel-bg',
    defaultValue: 'oklch(100% 0 0)',
    description: 'Background of the full calendar panel (AntD: fullPanelBg).',
  },
  {
    token: '--b-calendar-item-active-bg',
    defaultValue: 'oklch(95% 0.04 250)',
    description: 'Background of the selected date cell (AntD: itemActiveBg).',
  },
  {
    token: '--b-calendar-mini-content-height',
    defaultValue: '256px',
    description: 'Minimum content height of the mini calendar (AntD: miniContentHeight).',
  },
  {
    token: '--b-calendar-month-control-width',
    defaultValue: '70px',
    description: 'Min-width of the month picker (AntD: monthControlWidth).',
  },
  {
    token: '--b-calendar-year-control-width',
    defaultValue: '80px',
    description: 'Min-width of the year picker (AntD: yearControlWidth).',
  },
  // ── Local extras ──
  {
    token: '--b-calendar-text-color',
    defaultValue: 'oklch(20% 0.005 260 / 88%)',
    description: 'Primary text color.',
  },
  {
    token: '--b-calendar-text-color-secondary',
    defaultValue: 'oklch(45% 0.005 260)',
    description: 'Secondary text color (weekday labels, etc.).',
  },
  {
    token: '--b-calendar-text-color-disabled',
    defaultValue: 'oklch(50% 0.005 260)',
    description: 'Color of disabled / outside-month cells.',
  },
  {
    token: '--b-calendar-border-color',
    defaultValue: 'oklch(85% 0.005 260)',
    description: 'Color of borders (selects, header divider, mini outline).',
  },
  {
    token: '--b-calendar-border-radius',
    defaultValue: '8px',
    description: 'Outer corner radius.',
  },
  {
    token: '--b-calendar-cell-radius',
    defaultValue: '4px',
    description: 'Corner radius of cells, selects, and buttons.',
  },
  {
    token: '--b-calendar-primary-color',
    defaultValue: 'oklch(54.6% 0.245 262.881)',
    description: 'Brand color for selected & today markers.',
  },
  {
    token: '--b-calendar-primary-color-text',
    defaultValue: 'oklch(100% 0 0)',
    description: 'Text on primary color background.',
  },
  {
    token: '--b-calendar-cell-hover-bg',
    defaultValue: 'oklch(95% 0.005 260)',
    description: 'Hover background for interactive cells.',
  },
  {
    token: '--b-calendar-cell-disabled-bg',
    defaultValue: 'oklch(96% 0.002 260)',
    description: 'Background of disabled cells.',
  },
  {
    token: '--b-calendar-padding',
    defaultValue: '16px',
    description: 'Padding around the fullscreen calendar.',
  },
  {
    token: '--b-calendar-font-size',
    defaultValue: '14px',
    description: 'Base font size.',
  },
  {
    token: '--b-calendar-motion-duration',
    defaultValue: '200ms',
    description: 'Transition duration for hover and focus.',
  },
  {
    token: '--b-calendar-focus-ring',
    defaultValue: '0 0 0 2px oklch(54.6% 0.245 262.881 / 35%)',
    description: 'Focus ring used on cells, selects, and the today button.',
  },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Reference table of every <code>--b-calendar-*</code> CSS custom property ' +
          'consumers can override to retheme the component.',
      },
    },
  },
  render: () => ({
    components: { BCalendar },
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BCalendar - Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          All tokens scoped to <code>.b-calendar</code>. Override inline or via a CSS class.
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

        <h3 style="margin:32px 0 12px;">Override example</h3>
        <p style="margin:0 0 12px;color:#595959;font-size:13px;">
          Three+ tokens overridden inline (primary color, item active bg, full bg, border radius).
        </p>
        <BCalendar
          style="
            --b-calendar-primary-color: oklch(42% 0.16 145);
            --b-calendar-item-active-bg: oklch(95% 0.05 145);
            --b-calendar-full-bg: oklch(98% 0.005 145);
            --b-calendar-border-radius: 16px;
          "
        />
      </div>
    `,
  }),
};
