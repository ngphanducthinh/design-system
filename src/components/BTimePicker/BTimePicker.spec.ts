import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BTimePicker from './BTimePicker.vue';

// Mock the Popover API
beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn();
  HTMLElement.prototype.hidePopover = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('BTimePicker', () => {
  describe('Rendering defaults', () => {
    it('renders with default props', () => {
      const wrapper = mount(BTimePicker);
      expect(wrapper.find('.b-time-picker').exists()).toBe(true);
      expect(wrapper.find('.b-time-picker--md').exists()).toBe(true);
      expect(wrapper.find('.b-time-picker--outlined').exists()).toBe(true);
    });

    it('renders input with placeholder', () => {
      const wrapper = mount(BTimePicker, { props: { placeholder: 'Pick a time' } });
      const input = wrapper.find('input');
      expect(input.attributes('placeholder')).toBe('Pick a time');
    });

    it('renders clock icon when no value', () => {
      const wrapper = mount(BTimePicker);
      expect(wrapper.find('.b-time-picker__icon').exists()).toBe(true);
    });
  });

  describe('Size variants', () => {
    it.each(['sm', 'md', 'lg'] as const)('renders %s size', (size) => {
      const wrapper = mount(BTimePicker, { props: { size } });
      expect(wrapper.find(`.b-time-picker--${size}`).exists()).toBe(true);
    });
  });

  describe('Visual variants', () => {
    it.each(['outlined', 'filled', 'borderless', 'underlined'] as const)('renders %s variant', (variant) => {
      const wrapper = mount(BTimePicker, { props: { variant } });
      expect(wrapper.find(`.b-time-picker--${variant}`).exists()).toBe(true);
    });
  });

  describe('Status', () => {
    it('applies error status class', () => {
      const wrapper = mount(BTimePicker, { props: { status: 'error' } });
      expect(wrapper.find('.b-time-picker--error').exists()).toBe(true);
    });

    it('applies warning status class', () => {
      const wrapper = mount(BTimePicker, { props: { status: 'warning' } });
      expect(wrapper.find('.b-time-picker--warning').exists()).toBe(true);
    });
  });

  describe('Disabled state', () => {
    it('applies disabled class and attribute', () => {
      const wrapper = mount(BTimePicker, { props: { disabled: true } });
      expect(wrapper.find('.b-time-picker--disabled').exists()).toBe(true);
      expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });

    it('does not open panel when disabled', async () => {
      const wrapper = mount(BTimePicker, { props: { disabled: true } });
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      expect(wrapper.find('.b-time-picker--open').exists()).toBe(false);
    });
  });

  describe('Panel interaction', () => {
    it('opens panel on input click', async () => {
      const wrapper = mount(BTimePicker);
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      expect(wrapper.find('.b-time-picker--open').exists()).toBe(true);
      expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
    });

    it('closes panel on second click', async () => {
      const wrapper = mount(BTimePicker);
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      expect(wrapper.find('.b-time-picker--open').exists()).toBe(false);
    });

    it('emits openChange event', async () => {
      const wrapper = mount(BTimePicker);
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      expect(wrapper.emitted('openChange')).toEqual([[true]]);
    });

    it('renders hour/minute/second columns', async () => {
      const wrapper = mount(BTimePicker);
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      const columns = wrapper.findAll('.b-time-picker__column');
      expect(columns.length).toBe(3);
    });

    it('renders 24 hours by default', async () => {
      const wrapper = mount(BTimePicker);
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      const columns = wrapper.findAll('.b-time-picker__column');
      const hourCells = columns[0].findAll('.b-time-picker__cell');
      expect(hourCells.length).toBe(24);
    });

    it('renders 12 hours when use12Hours', async () => {
      const wrapper = mount(BTimePicker, { props: { use12Hours: true } });
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      const columns = wrapper.findAll('.b-time-picker__column');
      const hourCells = columns[0].findAll('.b-time-picker__cell');
      expect(hourCells.length).toBe(12);
      // AM/PM column should exist
      expect(columns.length).toBe(4);
    });
  });

  describe('Time selection', () => {
    it('selects time and emits change on OK', async () => {
      const wrapper = mount(BTimePicker, { props: { needConfirm: true } });
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');

      const columns = wrapper.findAll('.b-time-picker__column');
      // Select hour 10
      await columns[0].findAll('.b-time-picker__cell')[10].trigger('click');
      // Select minute 30
      await columns[1].findAll('.b-time-picker__cell')[30].trigger('click');
      // Select second 45
      await columns[2].findAll('.b-time-picker__cell')[45].trigger('click');

      // Click OK
      await wrapper.find('.b-time-picker__ok-btn').trigger('click');

      const changeEvents = wrapper.emitted('change');
      expect(changeEvents).toBeTruthy();
      const [time, timeString] = changeEvents![changeEvents!.length - 1] as [Date, string];
      expect(time.getHours()).toBe(10);
      expect(time.getMinutes()).toBe(30);
      expect(time.getSeconds()).toBe(45);
      expect(timeString).toBe('10:30:45');
    });

    it('auto-closes when needConfirm is false', async () => {
      const wrapper = mount(BTimePicker, { props: { needConfirm: false } });
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');

      const columns = wrapper.findAll('.b-time-picker__column');
      await columns[0].findAll('.b-time-picker__cell')[8].trigger('click');
      await columns[1].findAll('.b-time-picker__cell')[15].trigger('click');
      await columns[2].findAll('.b-time-picker__cell')[0].trigger('click');

      expect(wrapper.find('.b-time-picker--open').exists()).toBe(false);
    });

    it('highlights selected cells', async () => {
      const date = new Date();
      date.setHours(14, 30, 0, 0);
      const wrapper = mount(BTimePicker, { props: { modelValue: date } });
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');

      const columns = wrapper.findAll('.b-time-picker__column');
      const hourSelected = columns[0].find('.b-time-picker__cell--selected');
      expect(hourSelected.text()).toBe('14');

      const minuteSelected = columns[1].find('.b-time-picker__cell--selected');
      expect(minuteSelected.text()).toBe('30');
    });
  });

  describe('v-model', () => {
    it('supports v-model binding', async () => {
      const date = new Date();
      date.setHours(9, 0, 0, 0);
      const wrapper = mount(BTimePicker, {
        props: { modelValue: date, 'onUpdate:modelValue': (v: any) => wrapper.setProps({ modelValue: v }) },
      });

      expect(wrapper.find('input').element.value).toBe('09:00:00');
    });

    it('updates display when modelValue changes externally', async () => {
      const date1 = new Date();
      date1.setHours(9, 0, 0, 0);
      const wrapper = mount(BTimePicker, { props: { modelValue: date1 } });
      expect(wrapper.find('input').element.value).toBe('09:00:00');

      const date2 = new Date();
      date2.setHours(15, 45, 30, 0);
      await wrapper.setProps({ modelValue: date2 });
      expect(wrapper.find('input').element.value).toBe('15:45:30');
    });
  });

  describe('Clear', () => {
    it('shows clear button when value exists and allowClear', async () => {
      const date = new Date();
      date.setHours(10, 0, 0, 0);
      const wrapper = mount(BTimePicker, { props: { modelValue: date, allowClear: true } });
      expect(wrapper.find('.b-time-picker__clear').exists()).toBe(true);
    });

    it('clears value on clear click', async () => {
      const date = new Date();
      date.setHours(10, 0, 0, 0);
      const wrapper = mount(BTimePicker, {
        props: { modelValue: date, allowClear: true },
      });
      await wrapper.find('.b-time-picker__clear').trigger('click');
      expect(wrapper.emitted('change')).toEqual([[null, '']]);
    });

    it('does not show clear button when allowClear is false', () => {
      const date = new Date();
      date.setHours(10, 0, 0, 0);
      const wrapper = mount(BTimePicker, { props: { modelValue: date, allowClear: false } });
      expect(wrapper.find('.b-time-picker__clear').exists()).toBe(false);
    });
  });

  describe('Now button', () => {
    it('renders Now button when showNow is true', async () => {
      const wrapper = mount(BTimePicker, { props: { showNow: true } });
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      expect(wrapper.find('.b-time-picker__now-btn').exists()).toBe(true);
    });

    it('does not render Now button when showNow is false', async () => {
      const wrapper = mount(BTimePicker, { props: { showNow: false, needConfirm: true } });
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      expect(wrapper.find('.b-time-picker__now-btn').exists()).toBe(false);
    });
  });

  describe('Step props', () => {
    it('respects hourStep', async () => {
      const wrapper = mount(BTimePicker, { props: { hourStep: 2 } });
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      const columns = wrapper.findAll('.b-time-picker__column');
      const hourCells = columns[0].findAll('.b-time-picker__cell');
      expect(hourCells.length).toBe(12); // 0,2,4,6,8,10,12,14,16,18,20,22
    });

    it('respects minuteStep', async () => {
      const wrapper = mount(BTimePicker, { props: { minuteStep: 15 } });
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      const columns = wrapper.findAll('.b-time-picker__column');
      const minuteCells = columns[1].findAll('.b-time-picker__cell');
      expect(minuteCells.length).toBe(4); // 0,15,30,45
    });

    it('respects secondStep', async () => {
      const wrapper = mount(BTimePicker, { props: { secondStep: 10 } });
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      const columns = wrapper.findAll('.b-time-picker__column');
      const secondCells = columns[2].findAll('.b-time-picker__cell');
      expect(secondCells.length).toBe(6); // 0,10,20,30,40,50
    });
  });

  describe('Column visibility', () => {
    it('hides hour column when showHour is false', async () => {
      const wrapper = mount(BTimePicker, { props: { showHour: false } });
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      const columns = wrapper.findAll('.b-time-picker__column');
      expect(columns.length).toBe(2); // minute + second
    });

    it('hides minute column when showMinute is false', async () => {
      const wrapper = mount(BTimePicker, { props: { showMinute: false } });
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      const columns = wrapper.findAll('.b-time-picker__column');
      expect(columns.length).toBe(2); // hour + second
    });

    it('hides second column when showSecond is false', async () => {
      const wrapper = mount(BTimePicker, { props: { showSecond: false } });
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      const columns = wrapper.findAll('.b-time-picker__column');
      expect(columns.length).toBe(2); // hour + minute
    });
  });

  describe('Disabled time', () => {
    it('marks disabled hours', async () => {
      const disabledTime = () => ({ disabledHours: () => [0, 1, 2, 3, 4, 5] });
      const wrapper = mount(BTimePicker, { props: { disabledTime } });
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      const columns = wrapper.findAll('.b-time-picker__column');
      const disabledCells = columns[0].findAll('.b-time-picker__cell--disabled');
      expect(disabledCells.length).toBe(6);
    });

    it('prevents selecting disabled hours', async () => {
      const disabledTime = () => ({ disabledHours: () => [10] });
      const wrapper = mount(BTimePicker, { props: { disabledTime, needConfirm: true } });
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      const columns = wrapper.findAll('.b-time-picker__column');
      await columns[0].findAll('.b-time-picker__cell')[10].trigger('click');
      // Should not have a selected cell at hour 10
      const cell = columns[0].findAll('.b-time-picker__cell')[10];
      expect(cell.classes()).not.toContain('b-time-picker__cell--selected');
    });

    it('hides disabled options when hideDisabledOptions is true', async () => {
      const disabledTime = () => ({ disabledHours: () => [0, 1, 2] });
      const wrapper = mount(BTimePicker, { props: { disabledTime, hideDisabledOptions: true } });
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      const columns = wrapper.findAll('.b-time-picker__column');
      const hourCells = columns[0].findAll('.b-time-picker__cell');
      expect(hourCells.length).toBe(21); // 24 - 3
    });
  });

  describe('Format', () => {
    it('displays formatted time in input', () => {
      const date = new Date();
      date.setHours(14, 30, 0, 0);
      const wrapper = mount(BTimePicker, { props: { modelValue: date, format: 'HH:mm' } });
      expect(wrapper.find('input').element.value).toBe('14:30');
    });

    it('displays 12-hour format', () => {
      const date = new Date();
      date.setHours(14, 30, 0, 0);
      const wrapper = mount(BTimePicker, { props: { modelValue: date, use12Hours: true } });
      expect(wrapper.find('input').element.value).toBe('02:30:00 PM');
    });
  });

  describe('Keyboard navigation', () => {
    it('opens panel on Enter key', async () => {
      const wrapper = mount(BTimePicker);
      await wrapper.find('input').trigger('keydown', { key: 'Enter' });
      expect(wrapper.find('.b-time-picker--open').exists()).toBe(true);
    });

    it('opens panel on Space key', async () => {
      const wrapper = mount(BTimePicker);
      await wrapper.find('input').trigger('keydown', { key: ' ' });
      expect(wrapper.find('.b-time-picker--open').exists()).toBe(true);
    });

    it('closes panel on Escape key', async () => {
      const wrapper = mount(BTimePicker);
      await wrapper.find('input').trigger('keydown', { key: 'Enter' });
      expect(wrapper.find('.b-time-picker--open').exists()).toBe(true);
      await wrapper.find('input').trigger('keydown', { key: 'Escape' });
      expect(wrapper.find('.b-time-picker--open').exists()).toBe(false);
    });

    it('closes panel on panel Escape keydown', async () => {
      const wrapper = mount(BTimePicker);
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      await wrapper.find('.b-time-picker__panel').trigger('keydown', { key: 'Escape' });
      expect(wrapper.find('.b-time-picker--open').exists()).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('has combobox role on input', () => {
      const wrapper = mount(BTimePicker);
      expect(wrapper.find('input').attributes('role')).toBe('combobox');
    });

    it('has aria-expanded reflecting panel state', async () => {
      const wrapper = mount(BTimePicker);
      expect(wrapper.find('input').attributes('aria-expanded')).toBe('false');
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      expect(wrapper.find('input').attributes('aria-expanded')).toBe('true');
    });

    it('has aria-haspopup on input', () => {
      const wrapper = mount(BTimePicker);
      expect(wrapper.find('input').attributes('aria-haspopup')).toBe('dialog');
    });

    it('panel has dialog role', () => {
      const wrapper = mount(BTimePicker);
      expect(wrapper.find('.b-time-picker__panel').attributes('role')).toBe('dialog');
    });

    it('panel has aria-modal', () => {
      const wrapper = mount(BTimePicker);
      expect(wrapper.find('.b-time-picker__panel').attributes('aria-modal')).toBe('true');
    });

    it('columns have listbox role', async () => {
      const wrapper = mount(BTimePicker);
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      const columns = wrapper.findAll('.b-time-picker__column');
      columns.forEach((col) => {
        expect(col.attributes('role')).toBe('listbox');
      });
    });

    it('cells have option role', async () => {
      const wrapper = mount(BTimePicker);
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      const cells = wrapper.findAll('.b-time-picker__cell');
      cells.forEach((cell) => {
        expect(cell.attributes('role')).toBe('option');
      });
    });

    it('disabled cells have aria-disabled', async () => {
      const disabledTime = () => ({ disabledHours: () => [5] });
      const wrapper = mount(BTimePicker, { props: { disabledTime } });
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      const columns = wrapper.findAll('.b-time-picker__column');
      const cell = columns[0].findAll('.b-time-picker__cell')[5];
      expect(cell.attributes('aria-disabled')).toBe('true');
    });

    it('clear button has aria-label', () => {
      const date = new Date();
      date.setHours(10, 0, 0, 0);
      const wrapper = mount(BTimePicker, { props: { modelValue: date } });
      expect(wrapper.find('.b-time-picker__clear').attributes('aria-label')).toBe('Clear time');
    });

    it('clock icon is aria-hidden', () => {
      const wrapper = mount(BTimePicker);
      expect(wrapper.find('.b-time-picker__icon').attributes('aria-hidden')).toBe('true');
    });
  });

  describe('Input text editing', () => {
    it('parses valid time string on blur', async () => {
      const wrapper = mount(BTimePicker);
      const input = wrapper.find('input');
      await input.setValue('14:30:00');
      await input.trigger('blur');
      expect(wrapper.emitted('change')).toBeTruthy();
      const [time] = wrapper.emitted('change')![0] as [Date, string];
      expect(time.getHours()).toBe(14);
      expect(time.getMinutes()).toBe(30);
    });

    it('reverts invalid time string on blur', async () => {
      const date = new Date();
      date.setHours(10, 0, 0, 0);
      const wrapper = mount(BTimePicker, { props: { modelValue: date } });
      const input = wrapper.find('input');
      await input.setValue('invalid');
      await input.trigger('blur');
      expect(input.element.value).toBe('10:00:00');
    });
  });

  describe('Expose methods', () => {
    it('exposes focus method', () => {
      const wrapper = mount(BTimePicker);
      expect((wrapper.vm as any).focus).toBeInstanceOf(Function);
    });

    it('exposes blur method', () => {
      const wrapper = mount(BTimePicker);
      expect((wrapper.vm as any).blur).toBeInstanceOf(Function);
    });
  });

  describe('12-hour mode', () => {
    it('renders AM/PM column', async () => {
      const wrapper = mount(BTimePicker, { props: { use12Hours: true } });
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      expect(wrapper.find('.b-time-picker__column--ampm').exists()).toBe(true);
    });

    it('formats time with AM/PM', () => {
      const date = new Date();
      date.setHours(14, 30, 0, 0);
      const wrapper = mount(BTimePicker, { props: { modelValue: date, use12Hours: true } });
      expect(wrapper.find('input').element.value).toContain('PM');
    });

    it('correctly converts between 12h and 24h', async () => {
      const wrapper = mount(BTimePicker, { props: { use12Hours: true, needConfirm: true } });
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');

      const columns = wrapper.findAll('.b-time-picker__column');
      // Select hour 2, minute 0, second 0, PM
      await columns[0].findAll('.b-time-picker__cell')[1].trigger('click'); // hour 2
      await columns[1].findAll('.b-time-picker__cell')[0].trigger('click'); // minute 0
      await columns[2].findAll('.b-time-picker__cell')[0].trigger('click'); // second 0
      // Select PM
      const ampmCol = wrapper.find('.b-time-picker__column--ampm');
      await ampmCol.findAll('.b-time-picker__cell')[1].trigger('click'); // PM

      await wrapper.find('.b-time-picker__ok-btn').trigger('click');

      const changeEvents = wrapper.emitted('change');
      expect(changeEvents).toBeTruthy();
      const [time] = changeEvents![changeEvents!.length - 1] as [Date, string];
      expect(time.getHours()).toBe(14); // 2 PM = 14
    });
  });

  describe('Controlled open', () => {
    it('respects controlled open prop', async () => {
      const wrapper = mount(BTimePicker, { props: { open: true } });
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.b-time-picker--open').exists()).toBe(true);
    });
  });

  describe('Default value', () => {
    it('uses defaultValue for uncontrolled mode', () => {
      const date = new Date();
      date.setHours(16, 45, 30, 0);
      const wrapper = mount(BTimePicker, { props: { defaultValue: date } });
      expect(wrapper.find('input').element.value).toBe('16:45:30');
    });
  });

  describe('Animation - reduced motion', () => {
    it('renders without transition artifacts', async () => {
      vi.useFakeTimers();
      const wrapper = mount(BTimePicker);
      await wrapper.find('.b-time-picker__input-wrap').trigger('click');
      vi.advanceTimersByTime(300);
      expect(wrapper.find('.b-time-picker--open').exists()).toBe(true);
      vi.useRealTimers();
    });
  });
});
