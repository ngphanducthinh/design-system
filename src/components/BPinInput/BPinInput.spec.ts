import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import BPinInput from './BPinInput.vue';

function getCells(wrapper: VueWrapper): HTMLInputElement[] {
  return wrapper.findAll('.b-pin-input__cell').map((w) => w.element as HTMLInputElement);
}

describe('BPinInput', () => {
  describe('defaults and rendering', () => {
    it('renders with default props (length=6, type=number, size=md)', () => {
      const wrapper = mount(BPinInput);
      expect(wrapper.find('.b-pin-input').exists()).toBe(true);
      expect(wrapper.find('.b-pin-input--md').exists()).toBe(true);
      expect(getCells(wrapper)).toHaveLength(6);
    });

    it('renders the configured number of cells', () => {
      const wrapper = mount(BPinInput, { props: { length: 4 } });
      expect(getCells(wrapper)).toHaveLength(4);
    });

    it('renders all size variants', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      sizes.forEach((size) => {
        const wrapper = mount(BPinInput, { props: { size } });
        expect(wrapper.find(`.b-pin-input--${size}`).exists()).toBe(true);
      });
    });

    it('uses inputmode="numeric" + pattern for type=number', () => {
      const wrapper = mount(BPinInput, { props: { type: 'number' } });
      const first = getCells(wrapper)[0];
      expect(first.getAttribute('inputmode')).toBe('numeric');
      expect(first.getAttribute('pattern')).toBe('[0-9]*');
    });

    it('uses inputmode="text" and no pattern for type=text', () => {
      const wrapper = mount(BPinInput, { props: { type: 'text' } });
      const first = getCells(wrapper)[0];
      expect(first.getAttribute('inputmode')).toBe('text');
      expect(first.getAttribute('pattern')).toBeNull();
    });

    it('uses type="password" when mask is true', () => {
      const wrapper = mount(BPinInput, { props: { mask: true } });
      expect(getCells(wrapper)[0].type).toBe('password');
    });

    it('uses type="text" when mask is false', () => {
      const wrapper = mount(BPinInput, { props: { mask: false } });
      expect(getCells(wrapper)[0].type).toBe('text');
    });

    it('every cell has maxlength=1', () => {
      const wrapper = mount(BPinInput);
      getCells(wrapper).forEach((cell) => {
        expect(cell.getAttribute('maxlength')).toBe('1');
      });
    });

    it('renders with custom id', () => {
      const wrapper = mount(BPinInput, { props: { id: 'my-pin' } });
      expect(wrapper.find('.b-pin-input').attributes('id')).toBe('my-pin');
    });

    it('generates a unique id when none provided', () => {
      const wrapper = mount(BPinInput);
      expect(wrapper.find('.b-pin-input').attributes('id')).toMatch(/^b-pin-input-/);
    });
  });

  describe('v-model and controlled/uncontrolled', () => {
    it('renders modelValue split across cells', () => {
      const wrapper = mount(BPinInput, { props: { modelValue: '123', length: 6 } });
      const cells = getCells(wrapper);
      expect(cells[0].value).toBe('1');
      expect(cells[1].value).toBe('2');
      expect(cells[2].value).toBe('3');
      expect(cells[3].value).toBe('');
    });

    it('updates model when typing in a cell', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BPinInput, {
        props: { 'onUpdate:modelValue': onUpdate, length: 4 },
      });
      const cells = getCells(wrapper);
      cells[0].value = '7';
      await wrapper.find('.b-pin-input__cell').trigger('input');
      expect(onUpdate).toHaveBeenCalledWith('7');
    });

    it('reflects external model changes', async () => {
      const wrapper = mount(BPinInput, { props: { modelValue: '12', length: 4 } });
      await wrapper.setProps({ modelValue: '789' });
      const cells = getCells(wrapper);
      expect(cells[0].value).toBe('7');
      expect(cells[1].value).toBe('8');
      expect(cells[2].value).toBe('9');
    });

    it('works uncontrolled with default empty value', () => {
      const wrapper = mount(BPinInput, { props: { length: 4 } });
      const cells = getCells(wrapper);
      expect(cells.every((c) => c.value === '')).toBe(true);
    });

    it('sanitizes external value against type=number', async () => {
      const onUpdate = vi.fn();
      mount(BPinInput, {
        props: { modelValue: 'a1b2', type: 'number', 'onUpdate:modelValue': onUpdate, length: 4 },
      });
      await nextTick();
      expect(onUpdate).toHaveBeenCalledWith('12');
    });

    it('truncates external value to length', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BPinInput, {
        props: {
          modelValue: '123456789',
          type: 'number',
          length: 4,
          'onUpdate:modelValue': onUpdate,
        },
      });
      await nextTick();
      expect(onUpdate).toHaveBeenCalledWith('1234');
      const cells = getCells(wrapper);
      expect(cells[3].value).toBe('4');
    });
  });

  describe('input filtering', () => {
    it('rejects non-digit input when type=number', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BPinInput, {
        props: { type: 'number', 'onUpdate:modelValue': onUpdate, length: 4 },
      });
      const cell = wrapper.find('.b-pin-input__cell');
      (cell.element as HTMLInputElement).value = 'a';
      await cell.trigger('input');
      expect((cell.element as HTMLInputElement).value).toBe('');
      // No model update fired with content
      const last = onUpdate.mock.calls[onUpdate.mock.calls.length - 1];
      // Either never called or called with empty string
      if (last) expect(last[0]).toBe('');
    });

    it('accepts only letters/digits for type=alphanumeric', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BPinInput, {
        props: { type: 'alphanumeric', 'onUpdate:modelValue': onUpdate, length: 4 },
      });
      const cell = wrapper.find('.b-pin-input__cell');
      (cell.element as HTMLInputElement).value = '!';
      await cell.trigger('input');
      expect((cell.element as HTMLInputElement).value).toBe('');

      (cell.element as HTMLInputElement).value = 'A';
      await cell.trigger('input');
      expect(onUpdate).toHaveBeenCalledWith('A');
    });

    it('accepts any single char for type=text', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BPinInput, {
        props: { type: 'text', 'onUpdate:modelValue': onUpdate, length: 4 },
      });
      const cell = wrapper.find('.b-pin-input__cell');
      (cell.element as HTMLInputElement).value = '!';
      await cell.trigger('input');
      expect(onUpdate).toHaveBeenCalledWith('!');
    });
  });

  describe('focus advancement', () => {
    it('advances focus to the next cell after typing', async () => {
      const wrapper = mount(BPinInput, { props: { length: 4 }, attachTo: document.body });
      const cells = getCells(wrapper);
      cells[0].focus();
      cells[0].value = '1';
      await wrapper.findAll('.b-pin-input__cell')[0].trigger('input');
      await nextTick();
      expect(document.activeElement).toBe(cells[1]);
      wrapper.unmount();
    });

    it('does not advance past the last cell', async () => {
      const wrapper = mount(BPinInput, { props: { length: 3 }, attachTo: document.body });
      const cells = getCells(wrapper);
      cells[2].focus();
      cells[2].value = '9';
      await wrapper.findAll('.b-pin-input__cell')[2].trigger('input');
      await nextTick();
      expect(document.activeElement).toBe(cells[2]);
      wrapper.unmount();
    });
  });

  describe('keyboard navigation', () => {
    it('Backspace on empty cell moves focus to previous cell and clears it', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BPinInput, {
        props: { modelValue: '12', length: 4, 'onUpdate:modelValue': onUpdate },
        attachTo: document.body,
      });
      const cells = getCells(wrapper);
      cells[2].focus();
      await wrapper.findAll('.b-pin-input__cell')[2].trigger('keydown', { key: 'Backspace' });
      await nextTick();
      expect(document.activeElement).toBe(cells[1]);
      expect(onUpdate).toHaveBeenCalledWith('1');
      wrapper.unmount();
    });

    it('Backspace on filled cell clears it but stays in place', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BPinInput, {
        props: { modelValue: '12', length: 4, 'onUpdate:modelValue': onUpdate },
        attachTo: document.body,
      });
      const cells = getCells(wrapper);
      cells[1].focus();
      await wrapper.findAll('.b-pin-input__cell')[1].trigger('keydown', { key: 'Backspace' });
      await nextTick();
      // Stayed put, no advancement
      expect(document.activeElement).toBe(cells[1]);
      expect(onUpdate).toHaveBeenCalledWith('1');
      wrapper.unmount();
    });

    it('ArrowLeft moves focus to previous cell', async () => {
      const wrapper = mount(BPinInput, { props: { length: 4 }, attachTo: document.body });
      const cells = getCells(wrapper);
      cells[2].focus();
      await wrapper.findAll('.b-pin-input__cell')[2].trigger('keydown', { key: 'ArrowLeft' });
      expect(document.activeElement).toBe(cells[1]);
      wrapper.unmount();
    });

    it('ArrowRight moves focus to next cell', async () => {
      const wrapper = mount(BPinInput, { props: { length: 4 }, attachTo: document.body });
      const cells = getCells(wrapper);
      cells[1].focus();
      await wrapper.findAll('.b-pin-input__cell')[1].trigger('keydown', { key: 'ArrowRight' });
      expect(document.activeElement).toBe(cells[2]);
      wrapper.unmount();
    });

    it('ArrowLeft at the first cell does nothing', async () => {
      const wrapper = mount(BPinInput, { props: { length: 4 }, attachTo: document.body });
      const cells = getCells(wrapper);
      cells[0].focus();
      await wrapper.findAll('.b-pin-input__cell')[0].trigger('keydown', { key: 'ArrowLeft' });
      expect(document.activeElement).toBe(cells[0]);
      wrapper.unmount();
    });

    it('Home jumps to first cell', async () => {
      const wrapper = mount(BPinInput, { props: { length: 4 }, attachTo: document.body });
      const cells = getCells(wrapper);
      cells[3].focus();
      await wrapper.findAll('.b-pin-input__cell')[3].trigger('keydown', { key: 'Home' });
      expect(document.activeElement).toBe(cells[0]);
      wrapper.unmount();
    });

    it('End jumps to last cell', async () => {
      const wrapper = mount(BPinInput, { props: { length: 4 }, attachTo: document.body });
      const cells = getCells(wrapper);
      cells[0].focus();
      await wrapper.findAll('.b-pin-input__cell')[0].trigger('keydown', { key: 'End' });
      expect(document.activeElement).toBe(cells[3]);
      wrapper.unmount();
    });
  });

  describe('paste handling', () => {
    it('distributes pasted chars across cells starting at the focused cell', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BPinInput, {
        props: { length: 6, type: 'number', 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.findAll('.b-pin-input__cell')[0].trigger('paste', {
        clipboardData: { getData: () => '123456' },
      });
      await nextTick();
      expect(onUpdate).toHaveBeenCalledWith('123456');
    });

    it('paste filters non-allowed chars based on type', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BPinInput, {
        props: { length: 4, type: 'number', 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.findAll('.b-pin-input__cell')[0].trigger('paste', {
        clipboardData: { getData: () => 'a1b2c3d4' },
      });
      await nextTick();
      expect(onUpdate).toHaveBeenCalledWith('1234');
    });

    it('paste at non-zero index distributes from that index', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BPinInput, {
        props: { modelValue: '9', length: 4, type: 'number', 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.findAll('.b-pin-input__cell')[1].trigger('paste', {
        clipboardData: { getData: () => '12' },
      });
      await nextTick();
      expect(onUpdate).toHaveBeenCalledWith('912');
    });
  });

  describe('complete event', () => {
    it('emits complete with joined value when all cells are filled', async () => {
      const wrapper = mount(BPinInput, {
        props: { length: 3, type: 'number' },
        attachTo: document.body,
      });
      const cellWrappers = wrapper.findAll('.b-pin-input__cell');
      const cellEls = getCells(wrapper);

      cellEls[0].value = '1';
      await cellWrappers[0].trigger('input');
      cellEls[1].value = '2';
      await cellWrappers[1].trigger('input');
      cellEls[2].value = '3';
      await cellWrappers[2].trigger('input');

      const events = wrapper.emitted('complete');
      expect(events).toBeTruthy();
      expect(events![events!.length - 1][0]).toBe('123');
      wrapper.unmount();
    });

    it('does not emit complete on partial fill', async () => {
      const wrapper = mount(BPinInput, { props: { length: 3, type: 'number' } });
      const cellWrappers = wrapper.findAll('.b-pin-input__cell');
      const cellEls = getCells(wrapper);
      cellEls[0].value = '1';
      await cellWrappers[0].trigger('input');
      expect(wrapper.emitted('complete')).toBeFalsy();
    });

    it('emits complete on paste filling all cells', async () => {
      const wrapper = mount(BPinInput, { props: { length: 4, type: 'number' } });
      await wrapper.findAll('.b-pin-input__cell')[0].trigger('paste', {
        clipboardData: { getData: () => '7890' },
      });
      await nextTick();
      const events = wrapper.emitted('complete');
      expect(events).toBeTruthy();
      expect(events![events!.length - 1][0]).toBe('7890');
    });
  });

  describe('disabled', () => {
    it('disables every cell when disabled prop is set', () => {
      const wrapper = mount(BPinInput, { props: { disabled: true, length: 4 } });
      getCells(wrapper).forEach((cell) => {
        expect(cell.disabled).toBe(true);
      });
      expect(wrapper.find('.b-pin-input--disabled').exists()).toBe(true);
    });

    it('sets aria-disabled on the group when disabled', () => {
      const wrapper = mount(BPinInput, { props: { disabled: true } });
      expect(wrapper.find('.b-pin-input').attributes('aria-disabled')).toBe('true');
    });
  });

  describe('autoFocus', () => {
    it('focuses the first cell on mount when autoFocus=true', async () => {
      vi.useFakeTimers();
      const wrapper = mount(BPinInput, {
        props: { autoFocus: true, length: 4 },
        attachTo: document.body,
      });
      await nextTick();
      vi.runAllTimers();
      await nextTick();
      const first = getCells(wrapper)[0];
      expect(document.activeElement).toBe(first);
      wrapper.unmount();
      vi.useRealTimers();
    });

    it('does not autoFocus by default', async () => {
      const wrapper = mount(BPinInput, { props: { length: 4 }, attachTo: document.body });
      await nextTick();
      const first = getCells(wrapper)[0];
      expect(document.activeElement).not.toBe(first);
      wrapper.unmount();
    });
  });

  describe('accessibility', () => {
    it('group has role="group"', () => {
      const wrapper = mount(BPinInput);
      expect(wrapper.find('.b-pin-input').attributes('role')).toBe('group');
    });

    it('group has default aria-label "PIN entry"', () => {
      const wrapper = mount(BPinInput);
      expect(wrapper.find('.b-pin-input').attributes('aria-label')).toBe('PIN entry');
    });

    it('group aria-label is configurable via prop', () => {
      const wrapper = mount(BPinInput, { props: { ariaLabel: 'Verification code' } });
      expect(wrapper.find('.b-pin-input').attributes('aria-label')).toBe('Verification code');
    });

    it('cells have "Digit N of M" aria-label when type=number', () => {
      const wrapper = mount(BPinInput, { props: { type: 'number', length: 4 } });
      const labels = wrapper.findAll('.b-pin-input__cell').map((c) => c.attributes('aria-label'));
      expect(labels).toEqual([
        'Digit 1 of 4',
        'Digit 2 of 4',
        'Digit 3 of 4',
        'Digit 4 of 4',
      ]);
    });

    it('cells have "Character N of M" aria-label when type=text', () => {
      const wrapper = mount(BPinInput, { props: { type: 'text', length: 3 } });
      const labels = wrapper.findAll('.b-pin-input__cell').map((c) => c.attributes('aria-label'));
      expect(labels).toEqual([
        'Character 1 of 3',
        'Character 2 of 3',
        'Character 3 of 3',
      ]);
    });

    it('first cell has autocomplete="one-time-code"', () => {
      const wrapper = mount(BPinInput);
      const cells = getCells(wrapper);
      expect(cells[0].getAttribute('autocomplete')).toBe('one-time-code');
      expect(cells[1].getAttribute('autocomplete')).toBe('off');
    });
  });

  describe('exposed methods', () => {
    it('exposes focus, clear, focusFirst, focusLast', () => {
      const wrapper = mount(BPinInput, { attachTo: document.body });
      expect(typeof wrapper.vm.focus).toBe('function');
      expect(typeof wrapper.vm.clear).toBe('function');
      expect(typeof wrapper.vm.focusFirst).toBe('function');
      expect(typeof wrapper.vm.focusLast).toBe('function');
      wrapper.unmount();
    });

    it('focus(index) focuses the specified cell', async () => {
      const wrapper = mount(BPinInput, { props: { length: 4 }, attachTo: document.body });
      wrapper.vm.focus(2);
      await nextTick();
      expect(document.activeElement).toBe(getCells(wrapper)[2]);
      wrapper.unmount();
    });

    it('focusFirst() focuses cell 0', async () => {
      const wrapper = mount(BPinInput, { props: { length: 4 }, attachTo: document.body });
      wrapper.vm.focusFirst();
      await nextTick();
      expect(document.activeElement).toBe(getCells(wrapper)[0]);
      wrapper.unmount();
    });

    it('focusLast() focuses the final cell', async () => {
      const wrapper = mount(BPinInput, { props: { length: 4 }, attachTo: document.body });
      wrapper.vm.focusLast();
      await nextTick();
      expect(document.activeElement).toBe(getCells(wrapper)[3]);
      wrapper.unmount();
    });

    it('clear() empties the value and refocuses first cell', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BPinInput, {
        props: { modelValue: '1234', length: 4, 'onUpdate:modelValue': onUpdate },
        attachTo: document.body,
      });
      wrapper.vm.clear();
      await nextTick();
      expect(onUpdate).toHaveBeenCalledWith('');
      wrapper.unmount();
    });

    it('focus() with no arg focuses first cell', async () => {
      const wrapper = mount(BPinInput, { props: { length: 4 }, attachTo: document.body });
      wrapper.vm.focus();
      await nextTick();
      expect(document.activeElement).toBe(getCells(wrapper)[0]);
      wrapper.unmount();
    });
  });

  describe('edge cases', () => {
    it('handles length=1 (single cell)', () => {
      const wrapper = mount(BPinInput, { props: { length: 1 } });
      expect(getCells(wrapper)).toHaveLength(1);
    });

    it('handles very long length (12)', () => {
      const wrapper = mount(BPinInput, { props: { length: 12 } });
      expect(getCells(wrapper)).toHaveLength(12);
    });

    it('mask + type=number renders password cells with numeric inputmode', () => {
      const wrapper = mount(BPinInput, { props: { mask: true, type: 'number' } });
      const first = getCells(wrapper)[0];
      expect(first.type).toBe('password');
      expect(first.getAttribute('inputmode')).toBe('numeric');
    });

    it('handles modelValue shorter than length', () => {
      const wrapper = mount(BPinInput, { props: { modelValue: '12', length: 6 } });
      const cells = getCells(wrapper);
      expect(cells[0].value).toBe('1');
      expect(cells[1].value).toBe('2');
      expect(cells[2].value).toBe('');
      expect(cells[5].value).toBe('');
    });

    it('typing in middle cell only fills that position (no shift)', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BPinInput, {
        props: { length: 4, 'onUpdate:modelValue': onUpdate },
      });
      const cellWrappers = wrapper.findAll('.b-pin-input__cell');
      (cellWrappers[2].element as HTMLInputElement).value = '5';
      await cellWrappers[2].trigger('input');
      // Cells 0,1 are empty; cell 2 has '5'. Joined string is "  5" with empties → '5'
      expect(onUpdate).toHaveBeenCalledWith('5');
    });
  });
});
