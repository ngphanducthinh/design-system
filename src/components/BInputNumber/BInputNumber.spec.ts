import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import BInputNumber from './BInputNumber.vue';

function getInput(wrapper: VueWrapper): HTMLInputElement {
  return wrapper.find('.b-input-number__input').element as HTMLInputElement;
}

describe('BInputNumber', () => {
  describe('defaults and variants', () => {
    it('renders with default props', () => {
      const wrapper = mount(BInputNumber);
      expect(wrapper.find('.b-input-number').exists()).toBe(true);
      expect(wrapper.find('.b-input-number--md').exists()).toBe(true);
      expect(wrapper.find('.b-input-number--outlined').exists()).toBe(true);
      expect(wrapper.find('.b-input-number__input').exists()).toBe(true);
    });

    it('renders all size variants', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      sizes.forEach((size) => {
        const wrapper = mount(BInputNumber, { props: { size } });
        expect(wrapper.find(`.b-input-number--${size}`).exists()).toBe(true);
      });
    });

    it('renders all visual variants', () => {
      const variants = ['outlined', 'filled', 'borderless', 'underlined'] as const;
      variants.forEach((variant) => {
        const wrapper = mount(BInputNumber, { props: { variant } });
        expect(wrapper.find(`.b-input-number--${variant}`).exists()).toBe(true);
      });
    });

    it('renders placeholder text', () => {
      const wrapper = mount(BInputNumber, { props: { placeholder: 'Enter number' } });
      expect(getInput(wrapper).placeholder).toBe('Enter number');
    });

    it('renders with custom id', () => {
      const wrapper = mount(BInputNumber, { props: { id: 'my-num' } });
      expect(getInput(wrapper).id).toBe('my-num');
    });

    it('generates a unique id when none is provided', () => {
      const wrapper = mount(BInputNumber);
      expect(getInput(wrapper).id).toMatch(/^b-input-number-/);
    });

    it('renders controls by default', () => {
      const wrapper = mount(BInputNumber);
      expect(wrapper.find('.b-input-number__handler-wrap').exists()).toBe(true);
      expect(wrapper.find('.b-input-number__handler--up').exists()).toBe(true);
      expect(wrapper.find('.b-input-number__handler--down').exists()).toBe(true);
    });

    it('hides controls when controls=false', () => {
      const wrapper = mount(BInputNumber, { props: { controls: false } });
      expect(wrapper.find('.b-input-number__handler-wrap').exists()).toBe(false);
    });
  });

  describe('v-model and controlled/uncontrolled', () => {
    it('supports v-model binding', () => {
      const wrapper = mount(BInputNumber, {
        props: { modelValue: 5, 'onUpdate:modelValue': vi.fn() },
      });
      expect(getInput(wrapper).value).toBe('5');
    });

    it('displays formatted value with precision', () => {
      const wrapper = mount(BInputNumber, { props: { modelValue: 3.1, precision: 2 } });
      expect(getInput(wrapper).value).toBe('3.10');
    });

    it('works uncontrolled with null default', () => {
      const wrapper = mount(BInputNumber);
      expect(getInput(wrapper).value).toBe('');
    });

    it('reflects external model value changes', async () => {
      const wrapper = mount(BInputNumber, { props: { modelValue: 1 } });
      expect(getInput(wrapper).value).toBe('1');
      await wrapper.setProps({ modelValue: 2 });
      expect(getInput(wrapper).value).toBe('2');
    });

    it('displays null as empty string', () => {
      const wrapper = mount(BInputNumber, { props: { modelValue: null } });
      expect(getInput(wrapper).value).toBe('');
    });
  });

  describe('props mapping to DOM', () => {
    it('applies disabled attribute and class', () => {
      const wrapper = mount(BInputNumber, { props: { disabled: true } });
      expect(getInput(wrapper).disabled).toBe(true);
      expect(wrapper.find('.b-input-number--disabled').exists()).toBe(true);
    });

    it('applies readonly attribute and class', () => {
      const wrapper = mount(BInputNumber, { props: { readOnly: true } });
      expect(getInput(wrapper).readOnly).toBe(true);
      expect(wrapper.find('.b-input-number--readonly').exists()).toBe(true);
    });

    it('applies error status class', () => {
      const wrapper = mount(BInputNumber, { props: { status: 'error' } });
      expect(wrapper.find('.b-input-number--error').exists()).toBe(true);
    });

    it('applies warning status class', () => {
      const wrapper = mount(BInputNumber, { props: { status: 'warning' } });
      expect(wrapper.find('.b-input-number--warning').exists()).toBe(true);
    });

    it('sets inputmode to decimal', () => {
      const wrapper = mount(BInputNumber);
      expect(getInput(wrapper).getAttribute('inputmode')).toBe('decimal');
    });
  });

  describe('step behavior', () => {
    it('increments value on up button click', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: 5, step: 1, 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.find('.b-input-number__handler--up').trigger('mousedown');
      expect(onUpdate).toHaveBeenCalledWith(6);
    });

    it('decrements value on down button click', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: 5, step: 1, 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.find('.b-input-number__handler--down').trigger('mousedown');
      expect(onUpdate).toHaveBeenCalledWith(4);
    });

    it('respects custom step amount', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: 10, step: 5, 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.find('.b-input-number__handler--up').trigger('mousedown');
      expect(onUpdate).toHaveBeenCalledWith(15);
    });

    it('clamps at max on increment', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: 9, step: 2, max: 10, 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.find('.b-input-number__handler--up').trigger('mousedown');
      expect(onUpdate).toHaveBeenCalledWith(10);
    });

    it('clamps at min on decrement', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: 1, step: 2, min: 0, 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.find('.b-input-number__handler--down').trigger('mousedown');
      expect(onUpdate).toHaveBeenCalledWith(0);
    });

    it('disables up handler at max', () => {
      const wrapper = mount(BInputNumber, { props: { modelValue: 10, max: 10 } });
      expect(
        wrapper.find('.b-input-number__handler--up.b-input-number__handler--disabled').exists(),
      ).toBe(true);
    });

    it('disables down handler at min', () => {
      const wrapper = mount(BInputNumber, { props: { modelValue: 0, min: 0 } });
      expect(
        wrapper.find('.b-input-number__handler--down.b-input-number__handler--disabled').exists(),
      ).toBe(true);
    });

    it('emits step event on increment', async () => {
      const wrapper = mount(BInputNumber, {
        props: { modelValue: 5, step: 1, 'onUpdate:modelValue': vi.fn() },
      });
      await wrapper.find('.b-input-number__handler--up').trigger('mousedown');
      expect(wrapper.emitted('step')).toBeTruthy();
      expect(wrapper.emitted('step')![0]).toEqual([6, { offset: 1, type: 'up' }]);
    });

    it('emits step event on decrement', async () => {
      const wrapper = mount(BInputNumber, {
        props: { modelValue: 5, step: 1, 'onUpdate:modelValue': vi.fn() },
      });
      await wrapper.find('.b-input-number__handler--down').trigger('mousedown');
      expect(wrapper.emitted('step')).toBeTruthy();
      expect(wrapper.emitted('step')![0]).toEqual([4, { offset: 1, type: 'down' }]);
    });

    it('starts from 0 when value is null', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: null, 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.find('.b-input-number__handler--up').trigger('mousedown');
      expect(onUpdate).toHaveBeenCalledWith(1);
    });

    it('respects precision on step', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: 1.1, step: 0.1, precision: 1, 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.find('.b-input-number__handler--up').trigger('mousedown');
      expect(onUpdate).toHaveBeenCalledWith(1.2);
    });
  });

  describe('events', () => {
    it('emits change event when value is committed', async () => {
      const wrapper = mount(BInputNumber, {
        props: { modelValue: null, 'onUpdate:modelValue': vi.fn() },
      });
      const input = wrapper.find('.b-input-number__input');
      const el = input.element as HTMLInputElement;
      el.value = '42';
      await input.trigger('input');
      await input.trigger('blur');
      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')![0][0]).toBe(42);
    });

    it('emits pressEnter event on Enter key', async () => {
      const wrapper = mount(BInputNumber, {
        props: { modelValue: 5, 'onUpdate:modelValue': vi.fn() },
      });
      await wrapper.find('.b-input-number__input').trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('pressEnter')).toBeTruthy();
    });

    it('emits focus event', async () => {
      const wrapper = mount(BInputNumber);
      await wrapper.find('.b-input-number__input').trigger('focus');
      expect(wrapper.emitted('focus')).toBeTruthy();
    });

    it('emits blur event', async () => {
      const wrapper = mount(BInputNumber);
      await wrapper.find('.b-input-number__input').trigger('blur');
      expect(wrapper.emitted('blur')).toBeTruthy();
    });
  });

  describe('keyboard behavior', () => {
    it('increments on ArrowUp when keyboard=true', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: 5, 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.find('.b-input-number__input').trigger('keydown', { key: 'ArrowUp' });
      expect(onUpdate).toHaveBeenCalledWith(6);
    });

    it('decrements on ArrowDown when keyboard=true', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: 5, 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.find('.b-input-number__input').trigger('keydown', { key: 'ArrowDown' });
      expect(onUpdate).toHaveBeenCalledWith(4);
    });

    it('does not step on ArrowUp when keyboard=false', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: 5, keyboard: false, 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.find('.b-input-number__input').trigger('keydown', { key: 'ArrowUp' });
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('commits value on Enter', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: null, 'onUpdate:modelValue': onUpdate },
      });
      const input = wrapper.find('.b-input-number__input');
      const el = input.element as HTMLInputElement;
      el.value = '99';
      await input.trigger('input');
      await input.trigger('keydown', { key: 'Enter' });
      expect(onUpdate).toHaveBeenCalledWith(99);
    });

    it('adds focused class on focus', async () => {
      const wrapper = mount(BInputNumber);
      await wrapper.find('.b-input-number__input').trigger('focus');
      expect(wrapper.find('.b-input-number--focused').exists()).toBe(true);
    });

    it('removes focused class on blur', async () => {
      const wrapper = mount(BInputNumber);
      await wrapper.find('.b-input-number__input').trigger('focus');
      await wrapper.find('.b-input-number__input').trigger('blur');
      expect(wrapper.find('.b-input-number--focused').exists()).toBe(false);
    });
  });

  describe('min/max constraints', () => {
    it('clamps value to max on blur', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: null, max: 10, 'onUpdate:modelValue': onUpdate },
      });
      const input = wrapper.find('.b-input-number__input');
      const el = input.element as HTMLInputElement;
      el.value = '999';
      await input.trigger('input');
      await input.trigger('blur');
      expect(onUpdate).toHaveBeenCalledWith(10);
    });

    it('clamps value to min on blur', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: null, min: 0, 'onUpdate:modelValue': onUpdate },
      });
      const input = wrapper.find('.b-input-number__input');
      const el = input.element as HTMLInputElement;
      el.value = '-5';
      await input.trigger('input');
      await input.trigger('blur');
      expect(onUpdate).toHaveBeenCalledWith(0);
    });
  });

  describe('changeOnBlur', () => {
    it('commits value on blur when changeOnBlur=true (default)', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: null, 'onUpdate:modelValue': onUpdate },
      });
      const input = wrapper.find('.b-input-number__input');
      const el = input.element as HTMLInputElement;
      el.value = '7';
      await input.trigger('input');
      await input.trigger('blur');
      expect(onUpdate).toHaveBeenCalledWith(7);
    });

    it('does not commit value on blur when changeOnBlur=false', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: null, changeOnBlur: false, 'onUpdate:modelValue': onUpdate },
      });
      const input = wrapper.find('.b-input-number__input');
      const el = input.element as HTMLInputElement;
      el.value = '7';
      await input.trigger('input');
      await input.trigger('blur');
      expect(onUpdate).not.toHaveBeenCalled();
    });
  });

  describe('formatter and parser', () => {
    it('displays formatted value', () => {
      const formatter = (val: string | number) => `$ ${val}`;
      const wrapper = mount(BInputNumber, { props: { modelValue: 1000, formatter } });
      expect(getInput(wrapper).value).toBe('$ 1000');
    });

    it('parses formatted input back to number', async () => {
      const onUpdate = vi.fn();
      const formatter = (val: string | number) => `$ ${val}`;
      const parser = (val: string) => val.replace(/\$\s?/g, '');
      const wrapper = mount(BInputNumber, {
        props: { modelValue: null, formatter, parser, 'onUpdate:modelValue': onUpdate },
      });
      const input = wrapper.find('.b-input-number__input');
      const el = input.element as HTMLInputElement;
      el.value = '$ 500';
      await input.trigger('input');
      await input.trigger('blur');
      expect(onUpdate).toHaveBeenCalledWith(500);
    });
  });

  describe('decimalSeparator', () => {
    it('displays decimal with custom separator', () => {
      const wrapper = mount(BInputNumber, { props: { modelValue: 3.14, decimalSeparator: ',' } });
      expect(getInput(wrapper).value).toBe('3,14');
    });

    it('parses input with custom separator', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: null, decimalSeparator: ',', 'onUpdate:modelValue': onUpdate },
      });
      const input = wrapper.find('.b-input-number__input');
      const el = input.element as HTMLInputElement;
      el.value = '2,5';
      await input.trigger('input');
      await input.trigger('blur');
      expect(onUpdate).toHaveBeenCalledWith(2.5);
    });
  });

  describe('precision', () => {
    it('displays value with specified precision', () => {
      const wrapper = mount(BInputNumber, { props: { modelValue: 1, precision: 2 } });
      expect(getInput(wrapper).value).toBe('1.00');
    });

    it('rounds step to precision', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: 1.0, step: 0.01, precision: 2, 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.find('.b-input-number__handler--up').trigger('mousedown');
      expect(onUpdate).toHaveBeenCalledWith(1.01);
    });
  });

  describe('slots', () => {
    it('renders prefix slot', () => {
      const wrapper = mount(BInputNumber, {
        slots: { prefix: '<span class="test-prefix">$</span>' },
      });
      expect(wrapper.find('.b-input-number__prefix').exists()).toBe(true);
      expect(wrapper.find('.test-prefix').text()).toBe('$');
    });

    it('renders suffix slot', () => {
      const wrapper = mount(BInputNumber, {
        slots: { suffix: '<span class="test-suffix">%</span>' },
      });
      expect(wrapper.find('.b-input-number__suffix').exists()).toBe(true);
      expect(wrapper.find('.test-suffix').text()).toBe('%');
    });

    it('prefix has aria-hidden', () => {
      const wrapper = mount(BInputNumber, { slots: { prefix: '$' } });
      expect(wrapper.find('.b-input-number__prefix').attributes('aria-hidden')).toBe('true');
    });

    it('suffix has aria-hidden', () => {
      const wrapper = mount(BInputNumber, { slots: { suffix: '%' } });
      expect(wrapper.find('.b-input-number__suffix').attributes('aria-hidden')).toBe('true');
    });
  });

  describe('accessibility', () => {
    it('has role=spinbutton', () => {
      const wrapper = mount(BInputNumber);
      expect(getInput(wrapper).getAttribute('role')).toBe('spinbutton');
    });

    it('sets aria-valuenow to current value', () => {
      const wrapper = mount(BInputNumber, { props: { modelValue: 42 } });
      expect(getInput(wrapper).getAttribute('aria-valuenow')).toBe('42');
    });

    it('does not set aria-valuenow when null', () => {
      const wrapper = mount(BInputNumber, { props: { modelValue: null } });
      expect(getInput(wrapper).getAttribute('aria-valuenow')).toBeNull();
    });

    it('sets aria-valuemin when min is specified', () => {
      const wrapper = mount(BInputNumber, { props: { min: 0 } });
      expect(getInput(wrapper).getAttribute('aria-valuemin')).toBe('0');
    });

    it('sets aria-valuemax when max is specified', () => {
      const wrapper = mount(BInputNumber, { props: { max: 100 } });
      expect(getInput(wrapper).getAttribute('aria-valuemax')).toBe('100');
    });

    it('does not set aria-valuemin for default (MIN_SAFE_INTEGER)', () => {
      const wrapper = mount(BInputNumber);
      expect(getInput(wrapper).getAttribute('aria-valuemin')).toBeNull();
    });

    it('does not set aria-valuemax for default (MAX_SAFE_INTEGER)', () => {
      const wrapper = mount(BInputNumber);
      expect(getInput(wrapper).getAttribute('aria-valuemax')).toBeNull();
    });

    it('sets aria-invalid when status is error', () => {
      const wrapper = mount(BInputNumber, { props: { status: 'error' } });
      expect(getInput(wrapper).getAttribute('aria-invalid')).toBe('true');
    });

    it('does not set aria-invalid when no error', () => {
      const wrapper = mount(BInputNumber);
      expect(getInput(wrapper).getAttribute('aria-invalid')).toBeNull();
    });

    it('up handler has aria-label', () => {
      const wrapper = mount(BInputNumber);
      expect(wrapper.find('.b-input-number__handler--up').attributes('aria-label')).toBe(
        'Increase value',
      );
    });

    it('down handler has aria-label', () => {
      const wrapper = mount(BInputNumber);
      expect(wrapper.find('.b-input-number__handler--down').attributes('aria-label')).toBe(
        'Decrease value',
      );
    });

    it('handler-wrap has aria-hidden', () => {
      const wrapper = mount(BInputNumber);
      expect(wrapper.find('.b-input-number__handler-wrap').attributes('aria-hidden')).toBe('true');
    });

    it('handlers have tabindex -1', () => {
      const wrapper = mount(BInputNumber);
      expect(wrapper.find('.b-input-number__handler--up').attributes('tabindex')).toBe('-1');
      expect(wrapper.find('.b-input-number__handler--down').attributes('tabindex')).toBe('-1');
    });

    it('sets aria-disabled on handlers at boundaries', () => {
      const wrapper = mount(BInputNumber, { props: { modelValue: 10, max: 10 } });
      expect(wrapper.find('.b-input-number__handler--up').attributes('aria-disabled')).toBe('true');
    });
  });

  describe('exposed methods', () => {
    it('exposes focus method', () => {
      const wrapper = mount(BInputNumber, { attachTo: document.body });
      expect(typeof wrapper.vm.focus).toBe('function');
      wrapper.unmount();
    });

    it('exposes blur method', () => {
      const wrapper = mount(BInputNumber, { attachTo: document.body });
      expect(typeof wrapper.vm.blur).toBe('function');
      wrapper.unmount();
    });

    it('focus with cursor option "end" places cursor at end', () => {
      const wrapper = mount(BInputNumber, { props: { modelValue: 123 }, attachTo: document.body });
      wrapper.vm.focus({ cursor: 'end' });
      const input = getInput(wrapper);
      expect(input.selectionStart).toBe(3);
      expect(input.selectionEnd).toBe(3);
      wrapper.unmount();
    });

    it('focus with cursor option "start" places cursor at start', () => {
      const wrapper = mount(BInputNumber, { props: { modelValue: 123 }, attachTo: document.body });
      wrapper.vm.focus({ cursor: 'start' });
      const input = getInput(wrapper);
      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(0);
      wrapper.unmount();
    });

    it('focus with cursor option "all" selects all text', () => {
      const wrapper = mount(BInputNumber, { props: { modelValue: 123 }, attachTo: document.body });
      wrapper.vm.focus({ cursor: 'all' });
      const input = getInput(wrapper);
      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(3);
      wrapper.unmount();
    });
  });

  describe('edge cases', () => {
    it('handles NaN input gracefully by reverting to current value display', async () => {
      const wrapper = mount(BInputNumber, {
        props: { modelValue: 5, 'onUpdate:modelValue': vi.fn() },
      });
      const input = wrapper.find('.b-input-number__input');
      const el = input.element as HTMLInputElement;
      el.value = 'abc';
      await input.trigger('input');
      await input.trigger('blur');
      expect(el.value).toBe('5');
    });

    it('handles empty string as null', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: 5, 'onUpdate:modelValue': onUpdate },
      });
      const input = wrapper.find('.b-input-number__input');
      const el = input.element as HTMLInputElement;
      el.value = '';
      await input.trigger('input');
      await input.trigger('blur');
      expect(onUpdate).toHaveBeenCalledWith(null);
    });

    it('does not step when disabled', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: 5, disabled: true, 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.find('.b-input-number__input').trigger('keydown', { key: 'ArrowUp' });
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('does not step when readOnly', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: 5, readOnly: true, 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.find('.b-input-number__input').trigger('keydown', { key: 'ArrowUp' });
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('handles floating point step precision', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputNumber, {
        props: { modelValue: 0.1, step: 0.2, 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.find('.b-input-number__handler--up').trigger('mousedown');
      expect(onUpdate).toHaveBeenCalledWith(0.3);
    });
  });
});
