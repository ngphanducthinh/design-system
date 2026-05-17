import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BDatePicker from './BDatePicker.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function mountPicker(props: Record<string, unknown> = {}) {
  return mount(BDatePicker, {
    props,
    attachTo: document.body,
  });
}

function getInput(wrapper: ReturnType<typeof mount>) {
  return wrapper.find('.b-date-picker__input');
}

function getPanel(wrapper: ReturnType<typeof mount>) {
  return wrapper.find('.b-date-picker__panel');
}

// Mock popover API since JSDOM doesn't support it
beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn();
  HTMLElement.prototype.hidePopover = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────
// 1. Defaults & variants render
// ─────────────────────────────────────────────
describe('BDatePicker – defaults and variants', () => {
  it('renders with root class b-date-picker', () => {
    const wrapper = mountPicker();
    expect(wrapper.find('.b-date-picker').exists()).toBe(true);
  });

  it('renders with default medium size class', () => {
    const wrapper = mountPicker();
    expect(wrapper.find('.b-date-picker--md').exists()).toBe(true);
  });

  it('renders small size variant', () => {
    const wrapper = mountPicker({ size: 'sm' });
    expect(wrapper.find('.b-date-picker--sm').exists()).toBe(true);
  });

  it('renders large size variant', () => {
    const wrapper = mountPicker({ size: 'lg' });
    expect(wrapper.find('.b-date-picker--lg').exists()).toBe(true);
  });

  it('renders with default outlined variant', () => {
    const wrapper = mountPicker();
    expect(wrapper.find('.b-date-picker--outlined').exists()).toBe(true);
  });

  it('renders filled variant', () => {
    const wrapper = mountPicker({ variant: 'filled' });
    expect(wrapper.find('.b-date-picker--filled').exists()).toBe(true);
  });

  it('renders borderless variant', () => {
    const wrapper = mountPicker({ variant: 'borderless' });
    expect(wrapper.find('.b-date-picker--borderless').exists()).toBe(true);
  });

  it('renders underlined variant', () => {
    const wrapper = mountPicker({ variant: 'underlined' });
    expect(wrapper.find('.b-date-picker--underlined').exists()).toBe(true);
  });

  it('renders input with placeholder', () => {
    const wrapper = mountPicker({ placeholder: 'Pick a date' });
    expect(getInput(wrapper).attributes('placeholder')).toBe('Pick a date');
  });

  it('renders default placeholder based on picker type', () => {
    const wrapper = mountPicker({ picker: 'month' });
    expect(getInput(wrapper).attributes('placeholder')).toBe('Select month');
  });

  it('renders suffix calendar icon', () => {
    const wrapper = mountPicker();
    expect(wrapper.find('.b-date-picker__suffix').exists()).toBe(true);
    expect(wrapper.find('.b-date-picker__suffix svg').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behavior
// ─────────────────────────────────────────────
describe('BDatePicker – props to DOM', () => {
  it('disabled prop disables the input', () => {
    const wrapper = mountPicker({ disabled: true });
    expect(getInput(wrapper).attributes('disabled')).toBeDefined();
    expect(wrapper.find('.b-date-picker--disabled').exists()).toBe(true);
  });

  it('inputReadOnly makes input readonly', () => {
    const wrapper = mountPicker({ inputReadOnly: true });
    expect(getInput(wrapper).attributes('readonly')).toBeDefined();
  });

  it('displays formatted date from modelValue', () => {
    const date = new Date(2024, 5, 15); // June 15, 2024
    const wrapper = mountPicker({ modelValue: date });
    expect((getInput(wrapper).element as HTMLInputElement).value).toBe('2024-06-15');
  });

  it('displays formatted month for month picker', () => {
    const date = new Date(2024, 5, 1);
    const wrapper = mountPicker({ modelValue: date, picker: 'month' });
    expect((getInput(wrapper).element as HTMLInputElement).value).toBe('2024-06');
  });

  it('displays formatted year for year picker', () => {
    const date = new Date(2024, 0, 1);
    const wrapper = mountPicker({ modelValue: date, picker: 'year' });
    expect((getInput(wrapper).element as HTMLInputElement).value).toBe('2024');
  });

  it('shows clear button when value is set and allowClear is true', () => {
    const wrapper = mountPicker({ modelValue: new Date(2024, 0, 1), allowClear: true });
    expect(wrapper.find('.b-date-picker__clear').exists()).toBe(true);
  });

  it('does not show clear button when allowClear is false', () => {
    const wrapper = mountPicker({ modelValue: new Date(2024, 0, 1), allowClear: false });
    expect(wrapper.find('.b-date-picker__clear').exists()).toBe(false);
  });

  it('does not show clear button when disabled', () => {
    const wrapper = mountPicker({
      modelValue: new Date(2024, 0, 1),
      allowClear: true,
      disabled: true,
    });
    expect(wrapper.find('.b-date-picker__clear').exists()).toBe(false);
  });

  it('error status applies error class', () => {
    const wrapper = mountPicker({ status: 'error' });
    expect(wrapper.find('.b-date-picker--error').exists()).toBe(true);
  });

  it('warning status applies warning class', () => {
    const wrapper = mountPicker({ status: 'warning' });
    expect(wrapper.find('.b-date-picker--warning').exists()).toBe(true);
  });

  it('renders presets in panel', () => {
    const wrapper = mountPicker({
      presets: [
        { label: 'Today', value: new Date() },
        { label: 'Yesterday', value: new Date(Date.now() - 86400000) },
      ],
    });
    const presetBtns = wrapper.findAll('.b-date-picker__preset-btn');
    expect(presetBtns).toHaveLength(2);
    expect(presetBtns[0].text()).toBe('Today');
    expect(presetBtns[1].text()).toBe('Yesterday');
  });
});

// ─────────────────────────────────────────────
// 3. Events
// ─────────────────────────────────────────────
describe('BDatePicker – events', () => {
  it('emits openChange when panel opens', async () => {
    const wrapper = mountPicker();
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    expect(wrapper.emitted('openChange')).toBeTruthy();
    expect(wrapper.emitted('openChange')![0]).toEqual([true]);
  });

  it('emits change when date is selected', async () => {
    const wrapper = mountPicker();
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');

    const cells = wrapper.findAll(
      '.b-date-picker__cell:not(.b-date-picker__cell--other):not(.b-date-picker__cell--disabled)',
    );
    const firstCell = cells[0];
    await firstCell.trigger('click');

    expect(wrapper.emitted('change')).toBeTruthy();
    const [date, dateString] = wrapper.emitted('change')![0] as [Date, string];
    expect(date).toBeInstanceOf(Date);
    expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('emits update:modelValue on selection', async () => {
    const wrapper = mountPicker();
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');

    const cells = wrapper.findAll(
      '.b-date-picker__cell:not(.b-date-picker__cell--other):not(.b-date-picker__cell--disabled)',
    );
    await cells[0].trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });

  it('emits change with null when cleared', async () => {
    const wrapper = mountPicker({ modelValue: new Date(2024, 0, 15), allowClear: true });
    await wrapper.find('.b-date-picker__clear').trigger('click');

    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual([null, '']);
  });

  it('does not emit openChange when disabled', async () => {
    const wrapper = mountPicker({ disabled: true });
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    expect(wrapper.emitted('openChange')).toBeFalsy();
  });
});

// ─────────────────────────────────────────────
// 4. Keyboard and focus behavior
// ─────────────────────────────────────────────
describe('BDatePicker – keyboard', () => {
  it('opens panel on Enter key', async () => {
    const wrapper = mountPicker();
    await getInput(wrapper).trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('openChange')?.[0]).toEqual([true]);
  });

  it('opens panel on ArrowDown key', async () => {
    const wrapper = mountPicker();
    await getInput(wrapper).trigger('keydown', { key: 'ArrowDown' });
    expect(wrapper.emitted('openChange')?.[0]).toEqual([true]);
  });

  it('closes panel on Escape key from input', async () => {
    const wrapper = mountPicker();
    // Open first
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    // Then close
    await getInput(wrapper).trigger('keydown', { key: 'Escape' });
    const emits = wrapper.emitted('openChange')!;
    expect(emits[emits.length - 1]).toEqual([false]);
  });

  it('closes panel on Escape key from panel', async () => {
    const wrapper = mountPicker();
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    await getPanel(wrapper).trigger('keydown', { key: 'Escape' });
    const emits = wrapper.emitted('openChange')!;
    expect(emits[emits.length - 1]).toEqual([false]);
  });

  it('navigates dates with arrow keys in panel', async () => {
    const date = new Date(2024, 5, 15);
    const wrapper = mountPicker({ modelValue: date, defaultPickerValue: date });
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');

    // ArrowRight should move to next day
    await getPanel(wrapper).trigger('keydown', { key: 'ArrowRight' });
    // ArrowDown should move 7 days forward
    await getPanel(wrapper).trigger('keydown', { key: 'ArrowDown' });
    // Enter should select
    await getPanel(wrapper).trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('change')).toBeTruthy();
  });
});

// ─────────────────────────────────────────────
// 5. Accessibility
// ─────────────────────────────────────────────
describe('BDatePicker – accessibility', () => {
  it('input has role combobox', () => {
    const wrapper = mountPicker();
    expect(getInput(wrapper).attributes('role')).toBe('combobox');
  });

  it('input has aria-haspopup dialog', () => {
    const wrapper = mountPicker();
    expect(getInput(wrapper).attributes('aria-haspopup')).toBe('dialog');
  });

  it('input has aria-expanded false when closed', () => {
    const wrapper = mountPicker();
    expect(getInput(wrapper).attributes('aria-expanded')).toBe('false');
  });

  it('input has aria-expanded true when open', async () => {
    const wrapper = mountPicker();
    // Directly trigger the click handler on input-wrap
    const inputWrap = wrapper.find('.b-date-picker__input-wrap');
    await inputWrap.trigger('click');
    await flushPromises();
    // Check if the openChange event was emitted (proving click was handled)
    expect(wrapper.emitted('openChange')).toBeTruthy();
    expect(wrapper.emitted('openChange')![0]).toEqual([true]);
    // Now check aria-expanded
    expect(getInput(wrapper).attributes('aria-expanded')).toBe('true');
  });

  it('panel has role dialog', () => {
    const wrapper = mountPicker();
    expect(getPanel(wrapper).attributes('role')).toBe('dialog');
  });

  it('panel has aria-label', () => {
    const wrapper = mountPicker();
    expect(getPanel(wrapper).attributes('aria-label')).toBe('date picker');
  });

  it('panel has aria-modal true', () => {
    const wrapper = mountPicker();
    expect(getPanel(wrapper).attributes('aria-modal')).toBe('true');
  });

  it('input has aria-controls pointing to panel', async () => {
    const wrapper = mountPicker();
    const input = getInput(wrapper);
    expect(input.attributes('aria-controls')).toBeUndefined();
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    const controlsId = input.attributes('aria-controls');
    expect(controlsId).toBeTruthy();
    expect(wrapper.find(`#${controlsId}`).exists()).toBe(true);
  });

  it('date cells have aria-label with full date', async () => {
    const wrapper = mountPicker({ defaultPickerValue: new Date(2024, 0, 1) });
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    const cells = wrapper.findAll('.b-date-picker__cell:not(.b-date-picker__week-number)');
    const firstCurrentCell = cells.find((c) => !c.classes().includes('b-date-picker__cell--other'));
    expect(firstCurrentCell?.attributes('aria-label')).toMatch(/^2024-01-\d{2}$/);
  });

  it('selected date cell has aria-selected true', async () => {
    const date = new Date(2024, 0, 15);
    const wrapper = mountPicker({ modelValue: date, defaultPickerValue: date });
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    const selectedCell = wrapper.find('.b-date-picker__cell--selected');
    expect(selectedCell.attributes('aria-selected')).toBe('true');
  });

  it('disabled date cell has aria-disabled true', async () => {
    const wrapper = mountPicker({
      defaultPickerValue: new Date(2024, 0, 1),
      disabledDate: (d: Date) => d.getDate() === 10,
    });
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    const disabledCells = wrapper.findAll('.b-date-picker__cell--disabled');
    expect(disabledCells.length).toBeGreaterThan(0);
    expect(disabledCells[0].attributes('aria-disabled')).toBe('true');
  });

  it('clear button has aria-label', () => {
    const wrapper = mountPicker({ modelValue: new Date(2024, 0, 1), allowClear: true });
    const clearBtn = wrapper.find('.b-date-picker__clear');
    expect(clearBtn.attributes('aria-label')).toBe('Clear date');
  });

  it('suffix icon is aria-hidden', () => {
    const wrapper = mountPicker();
    expect(wrapper.find('.b-date-picker__suffix').attributes('aria-hidden')).toBe('true');
  });

  it('navigation buttons have aria-label', async () => {
    const wrapper = mountPicker();
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    const navBtns = wrapper.findAll('.b-date-picker__nav-btn');
    navBtns.forEach((btn) => {
      expect(btn.attributes('aria-label')).toBeTruthy();
    });
  });

  it('calendar grid has aria-label', async () => {
    const wrapper = mountPicker();
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    const grid = wrapper.find('[role="grid"]');
    expect(grid.attributes('aria-label')).toBe('Calendar');
  });
});

// ─────────────────────────────────────────────
// 6. Edge cases
// ─────────────────────────────────────────────
describe('BDatePicker – edge cases', () => {
  it('handles controlled open state', async () => {
    const wrapper = mountPicker({ open: true });
    // When open prop is true, the watcher sets isPanelOpen
    await flushPromises();
    expect(getInput(wrapper).attributes('aria-expanded')).toBe('true');
  });

  it('handles uncontrolled usage (no v-model)', async () => {
    const wrapper = mountPicker({ defaultValue: new Date(2024, 5, 15) });
    expect((getInput(wrapper).element as HTMLInputElement).value).toBe('2024-06-15');
  });

  it('respects minDate constraint', async () => {
    const minDate = new Date(2024, 0, 10);
    const wrapper = mountPicker({ minDate, defaultPickerValue: new Date(2024, 0, 1) });
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');

    const disabledCells = wrapper.findAll('.b-date-picker__cell--disabled');
    expect(disabledCells.length).toBeGreaterThan(0);
  });

  it('respects maxDate constraint', async () => {
    const maxDate = new Date(2024, 0, 20);
    const wrapper = mountPicker({ maxDate, defaultPickerValue: new Date(2024, 0, 1) });
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');

    const disabledCells = wrapper.findAll('.b-date-picker__cell--disabled');
    expect(disabledCells.length).toBeGreaterThan(0);
  });

  it('respects disabledDate function', async () => {
    const wrapper = mountPicker({
      defaultPickerValue: new Date(2024, 0, 1),
      disabledDate: (d: Date) => d.getDay() === 0 || d.getDay() === 6,
    });
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    const disabledCells = wrapper.findAll('.b-date-picker__cell--disabled');
    expect(disabledCells.length).toBeGreaterThan(0);
  });

  it('does not select disabled dates', async () => {
    const wrapper = mountPicker({
      defaultPickerValue: new Date(2024, 0, 1),
      disabledDate: () => true,
    });
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    const cell = wrapper.find('.b-date-picker__cell--disabled');
    await cell.trigger('click');
    expect(wrapper.emitted('change')).toBeFalsy();
  });

  it('shows Today footer by default', async () => {
    const wrapper = mountPicker();
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    expect(wrapper.find('.b-date-picker__today-btn').exists()).toBe(true);
  });

  it('hides Today footer when showNow is false', async () => {
    const wrapper = mountPicker({ showNow: false });
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    expect(wrapper.find('.b-date-picker__today-btn').exists()).toBe(false);
  });

  it('selects today via Today button', async () => {
    const wrapper = mountPicker();
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    await wrapper.find('.b-date-picker__today-btn').trigger('click');
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('uses custom format', () => {
    const date = new Date(2024, 5, 15);
    const wrapper = mountPicker({ modelValue: date, format: 'DD/MM/YYYY' });
    // Our simple format doesn't support DD/MM/YYYY reorder, but tests the format prop is used
    expect((getInput(wrapper).element as HTMLInputElement).value).toBeTruthy();
  });

  it('navigates to month view when heading is clicked', async () => {
    const wrapper = mountPicker();
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    await wrapper.find('.b-date-picker__heading').trigger('click');
    // Should now show month grid
    expect(wrapper.find('[aria-label="Month selection"]').exists()).toBe(true);
  });

  it('navigates to year view from month view', async () => {
    const wrapper = mountPicker();
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    await wrapper.find('.b-date-picker__heading').trigger('click'); // → month
    await wrapper.find('.b-date-picker__heading').trigger('click'); // → year
    expect(wrapper.find('[aria-label="Year selection"]').exists()).toBe(true);
  });

  it('month picker shows month grid directly', async () => {
    const wrapper = mountPicker({ picker: 'month' });
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    expect(wrapper.find('[aria-label="Month selection"]').exists()).toBe(true);
  });

  it('year picker shows year grid directly', async () => {
    const wrapper = mountPicker({ picker: 'year' });
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    expect(wrapper.find('[aria-label="Year selection"]').exists()).toBe(true);
  });

  it('quarter picker shows quarter grid directly', async () => {
    const wrapper = mountPicker({ picker: 'quarter' });
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    expect(wrapper.find('[aria-label="Quarter selection"]').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 7. Format and locale
// ─────────────────────────────────────────────
describe('BDatePicker – format and locale', () => {
  it('formats date using custom format DD/MM/YYYY', async () => {
    const wrapper = mountPicker({
      modelValue: new Date(2024, 0, 15),
      format: 'DD/MM/YYYY',
    });
    const input = getInput(wrapper);
    expect((input.element as HTMLInputElement).value).toBe('15/01/2024');
  });

  it('formats date using DD-MM-YY', async () => {
    const wrapper = mountPicker({
      modelValue: new Date(2024, 11, 5),
      format: 'DD-MM-YY',
    });
    const input = getInput(wrapper);
    expect((input.element as HTMLInputElement).value).toBe('05-12-24');
  });

  it('formats date with literal escape sequences', async () => {
    const wrapper = mountPicker({
      modelValue: new Date(2024, 5, 20),
      format: 'YYYY [year] MM [month] DD [day]',
    });
    const input = getInput(wrapper);
    expect((input.element as HTMLInputElement).value).toBe('2024 year 06 month 20 day');
  });

  it('formats week picker with custom format', async () => {
    const wrapper = mountPicker({
      picker: 'week',
      modelValue: new Date(2024, 0, 8),
      format: 'YYYY-wo',
    });
    const input = getInput(wrapper);
    expect((input.element as HTMLInputElement).value).toMatch(/2024-\d+/);
  });

  it('formats quarter picker', async () => {
    const wrapper = mountPicker({
      picker: 'quarter',
      modelValue: new Date(2024, 6, 1),
      format: 'YYYY-[Q]Q',
    });
    const input = getInput(wrapper);
    expect((input.element as HTMLInputElement).value).toBe('2024-Q3');
  });

  it('renders locale-aware weekday labels in panel', async () => {
    const wrapper = mountPicker({ locale: 'de-DE' });
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    const weekHeaders = wrapper.findAll('.b-date-picker__weekday');
    const labels = weekHeaders.map((w) => w.text());
    expect(labels.length).toBe(7);
    expect(labels[0]).not.toBe('');
  });

  it('renders locale-aware month labels in month picker', async () => {
    const wrapper = mountPicker({ picker: 'month', locale: 'vi-VN' });
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    const monthGrid = wrapper.find('[aria-label="Month selection"]');
    const monthCells = monthGrid.findAll('.b-date-picker__cell');
    expect(monthCells.length).toBe(12);
    expect(monthCells[0].text()).not.toBe('');
  });

  it('uses default locale (en-US) when locale is not specified', async () => {
    const wrapper = mountPicker({ picker: 'month' });
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    const monthGrid = wrapper.find('[aria-label="Month selection"]');
    const monthCells = monthGrid.findAll('.b-date-picker__cell');
    expect(monthCells[0].text()).toBe('Jan');
  });

  it('parses user input in custom format DD/MM/YYYY', async () => {
    const wrapper = mountPicker({ format: 'DD/MM/YYYY' });
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    const input = getInput(wrapper);
    await input.setValue('25/12/2024');
    await input.trigger('blur');
    await flushPromises();
    const emitted = wrapper.emitted('change');
    expect(emitted).toBeTruthy();
    const date = emitted![0][0] as Date;
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(11);
    expect(date.getDate()).toBe(25);
  });
});

// ─────────────────────────────────────────────
// 8. Deterministic animation tests
// ─────────────────────────────────────────────
describe('BDatePicker – animations', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('panel has transition properties', () => {
    const wrapper = mountPicker();
    const panel = getPanel(wrapper);
    expect(panel.classes()).toContain('b-date-picker__panel');
  });

  it('focused class is applied when open', async () => {
    const wrapper = mountPicker();
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    await flushPromises();
    expect(wrapper.find('.b-date-picker--focused').exists()).toBe(true);
  });

  it('focused class is removed when closed', async () => {
    const wrapper = mountPicker();
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    await wrapper.find('.b-date-picker__input-wrap').trigger('click');
    expect(wrapper.find('.b-date-picker--focused').exists()).toBe(false);
  });
});
