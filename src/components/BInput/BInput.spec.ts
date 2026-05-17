import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import BInput from './BInput.vue';

function getInput(wrapper: VueWrapper): HTMLInputElement {
  return wrapper.find('.b-input__input').element as HTMLInputElement;
}

describe('BInput', () => {
  describe('defaults and variants', () => {
    it('renders with default props', () => {
      const wrapper = mount(BInput);
      expect(wrapper.find('.b-input').exists()).toBe(true);
      expect(wrapper.find('.b-input--md').exists()).toBe(true);
      expect(wrapper.find('.b-input--outlined').exists()).toBe(true);
      expect(wrapper.find('.b-input__input').exists()).toBe(true);
    });

    it('renders all size variants', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      sizes.forEach((size) => {
        const wrapper = mount(BInput, { props: { size } });
        expect(wrapper.find(`.b-input--${size}`).exists()).toBe(true);
      });
    });

    it('renders all visual variants', () => {
      const variants = ['outlined', 'filled', 'borderless', 'underlined'] as const;
      variants.forEach((variant) => {
        const wrapper = mount(BInput, { props: { variant } });
        expect(wrapper.find(`.b-input--${variant}`).exists()).toBe(true);
      });
    });

    it('renders placeholder text', () => {
      const wrapper = mount(BInput, { props: { placeholder: 'Enter value' } });
      expect(getInput(wrapper).placeholder).toBe('Enter value');
    });

    it('renders with custom id', () => {
      const wrapper = mount(BInput, { props: { id: 'my-input' } });
      expect(getInput(wrapper).id).toBe('my-input');
    });

    it('generates a unique id when none is provided', () => {
      const wrapper = mount(BInput);
      expect(getInput(wrapper).id).toMatch(/^b-input-/);
    });
  });

  describe('v-model and controlled/uncontrolled', () => {
    it('supports v-model binding', async () => {
      const wrapper = mount(BInput, {
        props: { modelValue: 'hello', 'onUpdate:modelValue': vi.fn() },
      });
      expect(getInput(wrapper).value).toBe('hello');
    });

    it('updates v-model on input', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInput, { props: { modelValue: '', 'onUpdate:modelValue': onUpdate } });
      await wrapper.find('.b-input__input').setValue('test');
      expect(onUpdate).toHaveBeenCalledWith('test');
    });

    it('works uncontrolled with default empty value', async () => {
      const wrapper = mount(BInput);
      await wrapper.find('.b-input__input').setValue('typed');
      expect(getInput(wrapper).value).toBe('typed');
    });

    it('reflects external model value changes', async () => {
      const wrapper = mount(BInput, { props: { modelValue: 'a' } });
      expect(getInput(wrapper).value).toBe('a');
      await wrapper.setProps({ modelValue: 'b' });
      expect(getInput(wrapper).value).toBe('b');
    });
  });

  describe('props mapping to DOM', () => {
    it('applies disabled attribute and class', () => {
      const wrapper = mount(BInput, { props: { disabled: true } });
      expect(getInput(wrapper).disabled).toBe(true);
      expect(wrapper.find('.b-input--disabled').exists()).toBe(true);
    });

    it('applies readonly attribute and class', () => {
      const wrapper = mount(BInput, { props: { readOnly: true } });
      expect(getInput(wrapper).readOnly).toBe(true);
      expect(wrapper.find('.b-input--readonly').exists()).toBe(true);
    });

    it('applies maxlength attribute', () => {
      const wrapper = mount(BInput, { props: { maxLength: 10 } });
      expect(getInput(wrapper).maxLength).toBe(10);
    });

    it('applies type attribute', () => {
      const wrapper = mount(BInput, { props: { type: 'email' } });
      expect(getInput(wrapper).type).toBe('email');
    });

    it('applies error status class', () => {
      const wrapper = mount(BInput, { props: { status: 'error' } });
      expect(wrapper.find('.b-input--error').exists()).toBe(true);
    });

    it('applies warning status class', () => {
      const wrapper = mount(BInput, { props: { status: 'warning' } });
      expect(wrapper.find('.b-input--warning').exists()).toBe(true);
    });
  });

  describe('events', () => {
    it('emits change event on input', async () => {
      const wrapper = mount(BInput);
      await wrapper.find('.b-input__input').setValue('x');
      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')![0][0]).toBe('x');
    });

    it('emits pressEnter event on Enter key', async () => {
      const wrapper = mount(BInput);
      await wrapper.find('.b-input__input').trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('pressEnter')).toBeTruthy();
    });

    it('emits focus event', async () => {
      const wrapper = mount(BInput);
      await wrapper.find('.b-input__input').trigger('focus');
      expect(wrapper.emitted('focus')).toBeTruthy();
    });

    it('emits blur event', async () => {
      const wrapper = mount(BInput);
      await wrapper.find('.b-input__input').trigger('blur');
      expect(wrapper.emitted('blur')).toBeTruthy();
    });

    it('emits clear event when clear button is clicked', async () => {
      const wrapper = mount(BInput, {
        props: { modelValue: 'text', allowClear: true, 'onUpdate:modelValue': vi.fn() },
      });
      await wrapper.find('.b-input__clear').trigger('mousedown');
      expect(wrapper.emitted('clear')).toBeTruthy();
      expect(wrapper.emitted('change')![0][0]).toBe('');
    });
  });

  describe('allowClear', () => {
    it('shows clear button when allowClear is true and has value', () => {
      const wrapper = mount(BInput, { props: { modelValue: 'hello', allowClear: true } });
      expect(wrapper.find('.b-input__clear').exists()).toBe(true);
    });

    it('hides clear button when value is empty', () => {
      const wrapper = mount(BInput, { props: { modelValue: '', allowClear: true } });
      expect(wrapper.find('.b-input__clear').exists()).toBe(false);
    });

    it('hides clear button when disabled', () => {
      const wrapper = mount(BInput, {
        props: { modelValue: 'hello', allowClear: true, disabled: true },
      });
      expect(wrapper.find('.b-input__clear').exists()).toBe(false);
    });

    it('hides clear button when readOnly', () => {
      const wrapper = mount(BInput, {
        props: { modelValue: 'hello', allowClear: true, readOnly: true },
      });
      expect(wrapper.find('.b-input__clear').exists()).toBe(false);
    });

    it('clears value and refocuses input on clear click', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInput, {
        props: { modelValue: 'text', allowClear: true, 'onUpdate:modelValue': onUpdate },
        attachTo: document.body,
      });
      await wrapper.find('.b-input__clear').trigger('mousedown');
      expect(onUpdate).toHaveBeenCalledWith('');
      wrapper.unmount();
    });
  });

  describe('password toggle', () => {
    it('renders password toggle for type=password', () => {
      const wrapper = mount(BInput, { props: { type: 'password' } });
      expect(wrapper.find('.b-input__password-toggle').exists()).toBe(true);
    });

    it('does not render password toggle for other types', () => {
      const wrapper = mount(BInput, { props: { type: 'text' } });
      expect(wrapper.find('.b-input__password-toggle').exists()).toBe(false);
    });

    it('toggles input type on click', async () => {
      const wrapper = mount(BInput, { props: { type: 'password' }, attachTo: document.body });
      expect(getInput(wrapper).type).toBe('password');
      await wrapper.find('.b-input__password-toggle').trigger('mousedown');
      expect(getInput(wrapper).type).toBe('text');
      await wrapper.find('.b-input__password-toggle').trigger('mousedown');
      expect(getInput(wrapper).type).toBe('password');
      wrapper.unmount();
    });

    it('has correct aria-label for password toggle', async () => {
      const wrapper = mount(BInput, { props: { type: 'password' } });
      const btn = wrapper.find('.b-input__password-toggle');
      expect(btn.attributes('aria-label')).toBe('Show password');
      await btn.trigger('mousedown');
      expect(btn.attributes('aria-label')).toBe('Hide password');
    });
  });

  describe('showCount', () => {
    it('shows character count when showCount is true', () => {
      const wrapper = mount(BInput, { props: { modelValue: 'hello', showCount: true } });
      expect(wrapper.find('.b-input__count').exists()).toBe(true);
      expect(wrapper.find('.b-input__count').text()).toBe('5');
    });

    it('shows count with maxLength', () => {
      const wrapper = mount(BInput, {
        props: { modelValue: 'hi', showCount: true, maxLength: 10 },
      });
      expect(wrapper.find('.b-input__count').text()).toBe('2 / 10');
    });

    it('shows over-count class when exceeding max', () => {
      const wrapper = mount(BInput, {
        props: { modelValue: 'hello world', showCount: true, maxLength: 5 },
      });
      expect(wrapper.find('.b-input__count--over').exists()).toBe(true);
    });

    it('supports custom formatter function', () => {
      const formatter = ({
        count,
        maxLength,
      }: {
        value: string;
        count: number;
        maxLength?: number;
      }) => `${count}/${maxLength ?? '∞'}`;
      const wrapper = mount(BInput, {
        props: { modelValue: 'ab', showCount: formatter, maxLength: 5 },
      });
      expect(wrapper.find('.b-input__count').text()).toBe('2/5');
    });

    it('supports count config with custom strategy', () => {
      const wrapper = mount(BInput, {
        props: {
          modelValue: '👋🌍',
          count: { strategy: (val: string) => [...val].length, show: true },
        },
      });
      expect(wrapper.find('.b-input__count').text()).toBe('2');
    });
  });

  describe('slots', () => {
    it('renders prefix slot', () => {
      const wrapper = mount(BInput, { slots: { prefix: '<span class="test-prefix">$</span>' } });
      expect(wrapper.find('.b-input__prefix').exists()).toBe(true);
      expect(wrapper.find('.test-prefix').text()).toBe('$');
    });

    it('renders suffix slot', () => {
      const wrapper = mount(BInput, { slots: { suffix: '<span class="test-suffix">kg</span>' } });
      expect(wrapper.find('.b-input__suffix').exists()).toBe(true);
      expect(wrapper.find('.test-suffix').text()).toBe('kg');
    });

    it('renders addonBefore slot', () => {
      const wrapper = mount(BInput, { slots: { addonBefore: 'http://' } });
      expect(wrapper.find('.b-input__addon--before').exists()).toBe(true);
      expect(wrapper.find('.b-input__addon--before').text()).toBe('http://');
      expect(wrapper.find('.b-input--has-addon-before').exists()).toBe(true);
    });

    it('renders addonAfter slot', () => {
      const wrapper = mount(BInput, { slots: { addonAfter: '.com' } });
      expect(wrapper.find('.b-input__addon--after').exists()).toBe(true);
      expect(wrapper.find('.b-input__addon--after').text()).toBe('.com');
      expect(wrapper.find('.b-input--has-addon-after').exists()).toBe(true);
    });

    it('prefix has aria-hidden', () => {
      const wrapper = mount(BInput, { slots: { prefix: 'icon' } });
      expect(wrapper.find('.b-input__prefix').attributes('aria-hidden')).toBe('true');
    });

    it('suffix has aria-hidden', () => {
      const wrapper = mount(BInput, { slots: { suffix: 'icon' } });
      expect(wrapper.find('.b-input__suffix').attributes('aria-hidden')).toBe('true');
    });
  });

  describe('keyboard and focus', () => {
    it('adds focused class on focus', async () => {
      const wrapper = mount(BInput);
      await wrapper.find('.b-input__input').trigger('focus');
      expect(wrapper.find('.b-input--focused').exists()).toBe(true);
    });

    it('removes focused class on blur', async () => {
      const wrapper = mount(BInput);
      await wrapper.find('.b-input__input').trigger('focus');
      await wrapper.find('.b-input__input').trigger('blur');
      expect(wrapper.find('.b-input--focused').exists()).toBe(false);
    });

    it('does not emit pressEnter for other keys', async () => {
      const wrapper = mount(BInput);
      await wrapper.find('.b-input__input').trigger('keydown', { key: 'a' });
      expect(wrapper.emitted('pressEnter')).toBeFalsy();
    });
  });

  describe('accessibility', () => {
    it('sets aria-invalid when status is error', () => {
      const wrapper = mount(BInput, { props: { status: 'error' } });
      expect(getInput(wrapper).getAttribute('aria-invalid')).toBe('true');
    });

    it('does not set aria-invalid when no error', () => {
      const wrapper = mount(BInput);
      expect(getInput(wrapper).getAttribute('aria-invalid')).toBeNull();
    });

    it('sets aria-describedby pointing to count when showCount is true', () => {
      const wrapper = mount(BInput, { props: { showCount: true, modelValue: 'x' } });
      const input = getInput(wrapper);
      const countEl = wrapper.find('.b-input__count');
      expect(input.getAttribute('aria-describedby')).toBe(countEl.attributes('id'));
    });

    it('count element has aria-live polite', () => {
      const wrapper = mount(BInput, { props: { showCount: true, modelValue: 'x' } });
      expect(wrapper.find('.b-input__count').attributes('aria-live')).toBe('polite');
    });

    it('clear button has aria-label', () => {
      const wrapper = mount(BInput, { props: { modelValue: 'val', allowClear: true } });
      expect(wrapper.find('.b-input__clear').attributes('aria-label')).toBe('Clear input');
    });

    it('clear button has tabindex -1 (not in tab order)', () => {
      const wrapper = mount(BInput, { props: { modelValue: 'val', allowClear: true } });
      expect(wrapper.find('.b-input__clear').attributes('tabindex')).toBe('-1');
    });
  });

  describe('exposed methods', () => {
    it('exposes focus method', () => {
      const wrapper = mount(BInput, { attachTo: document.body });
      expect(typeof wrapper.vm.focus).toBe('function');
      wrapper.unmount();
    });

    it('exposes blur method', () => {
      const wrapper = mount(BInput, { attachTo: document.body });
      expect(typeof wrapper.vm.blur).toBe('function');
      wrapper.unmount();
    });

    it('focus with cursor option "end" places cursor at end', async () => {
      const wrapper = mount(BInput, { props: { modelValue: 'hello' }, attachTo: document.body });
      wrapper.vm.focus({ cursor: 'end' });
      const input = getInput(wrapper);
      expect(input.selectionStart).toBe(5);
      expect(input.selectionEnd).toBe(5);
      wrapper.unmount();
    });

    it('focus with cursor option "start" places cursor at start', async () => {
      const wrapper = mount(BInput, { props: { modelValue: 'hello' }, attachTo: document.body });
      wrapper.vm.focus({ cursor: 'start' });
      const input = getInput(wrapper);
      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(0);
      wrapper.unmount();
    });

    it('focus with cursor option "all" selects all text', async () => {
      const wrapper = mount(BInput, { props: { modelValue: 'hello' }, attachTo: document.body });
      wrapper.vm.focus({ cursor: 'all' });
      const input = getInput(wrapper);
      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(5);
      wrapper.unmount();
    });
  });

  describe('edge cases', () => {
    it('handles empty string modelValue', () => {
      const wrapper = mount(BInput, { props: { modelValue: '' } });
      expect(getInput(wrapper).value).toBe('');
    });

    it('handles very long content', () => {
      const longText = 'a'.repeat(10000);
      const wrapper = mount(BInput, { props: { modelValue: longText } });
      expect(getInput(wrapper).value).toBe(longText);
    });

    it('does not show clear when allowClear is false even with value', () => {
      const wrapper = mount(BInput, { props: { modelValue: 'text', allowClear: false } });
      expect(wrapper.find('.b-input__clear').exists()).toBe(false);
    });

    it('count config exceedFormatter trims value', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInput, {
        props: {
          modelValue: '',
          'onUpdate:modelValue': onUpdate,
          count: {
            max: 5,
            exceedFormatter: (val: string, { max }: { max: number }) => val.slice(0, max),
          },
        },
      });
      const input = wrapper.find('.b-input__input');
      const el = input.element as HTMLInputElement;
      el.value = 'hello world';
      await input.trigger('input');
      expect(onUpdate).toHaveBeenCalledWith('hello');
    });
  });
});
