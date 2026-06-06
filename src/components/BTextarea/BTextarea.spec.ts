import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import BTextarea from './BTextarea.vue';

function getTextarea(wrapper: VueWrapper): HTMLTextAreaElement {
  return wrapper.find('.b-textarea__textarea').element as HTMLTextAreaElement;
}

describe('BTextarea', () => {
  describe('defaults and variants', () => {
    it('renders with default props (size md, variant outlined, rows 3)', () => {
      const wrapper = mount(BTextarea);
      expect(wrapper.find('.b-textarea').exists()).toBe(true);
      expect(wrapper.find('.b-textarea--md').exists()).toBe(true);
      expect(wrapper.find('.b-textarea--outlined').exists()).toBe(true);
      const ta = getTextarea(wrapper);
      expect(ta.rows).toBe(3);
    });

    it('renders all size variants', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      sizes.forEach((size) => {
        const wrapper = mount(BTextarea, { props: { size } });
        expect(wrapper.find(`.b-textarea--${size}`).exists()).toBe(true);
      });
    });

    it('renders all visual variants', () => {
      const variants = ['outlined', 'filled', 'borderless', 'underlined'] as const;
      variants.forEach((variant) => {
        const wrapper = mount(BTextarea, { props: { variant } });
        expect(wrapper.find(`.b-textarea--${variant}`).exists()).toBe(true);
      });
    });

    it('honors custom rows prop', () => {
      const wrapper = mount(BTextarea, { props: { rows: 8 } });
      expect(getTextarea(wrapper).rows).toBe(8);
    });
  });

  describe('props mapping to DOM', () => {
    it('renders placeholder text', () => {
      const wrapper = mount(BTextarea, { props: { placeholder: 'Enter description' } });
      expect(getTextarea(wrapper).placeholder).toBe('Enter description');
    });

    it('renders with custom id', () => {
      const wrapper = mount(BTextarea, { props: { id: 'my-textarea' } });
      expect(getTextarea(wrapper).id).toBe('my-textarea');
    });

    it('generates a unique id when none is provided', () => {
      const wrapper = mount(BTextarea);
      expect(getTextarea(wrapper).id).toMatch(/^b-textarea-/);
    });

    it('applies disabled attribute and class', () => {
      const wrapper = mount(BTextarea, { props: { disabled: true } });
      expect(getTextarea(wrapper).disabled).toBe(true);
      expect(wrapper.find('.b-textarea--disabled').exists()).toBe(true);
    });

    it('applies readonly attribute and class', () => {
      const wrapper = mount(BTextarea, { props: { readOnly: true } });
      expect(getTextarea(wrapper).readOnly).toBe(true);
      expect(wrapper.find('.b-textarea--readonly').exists()).toBe(true);
    });

    it('applies maxlength attribute', () => {
      const wrapper = mount(BTextarea, { props: { maxLength: 50 } });
      expect(getTextarea(wrapper).maxLength).toBe(50);
    });
  });

  describe('status', () => {
    it('applies error status class and aria-invalid', () => {
      const wrapper = mount(BTextarea, { props: { status: 'error' } });
      expect(wrapper.find('.b-textarea--error').exists()).toBe(true);
      expect(getTextarea(wrapper).getAttribute('aria-invalid')).toBe('true');
    });

    it('applies warning status class but does not set aria-invalid', () => {
      const wrapper = mount(BTextarea, { props: { status: 'warning' } });
      expect(wrapper.find('.b-textarea--warning').exists()).toBe(true);
      expect(getTextarea(wrapper).getAttribute('aria-invalid')).toBeNull();
    });

    it('does not set aria-invalid when no status', () => {
      const wrapper = mount(BTextarea);
      expect(getTextarea(wrapper).getAttribute('aria-invalid')).toBeNull();
    });
  });

  describe('v-model and controlled/uncontrolled', () => {
    it('supports v-model binding (controlled)', () => {
      const wrapper = mount(BTextarea, {
        props: { modelValue: 'hello', 'onUpdate:modelValue': vi.fn() },
      });
      expect(getTextarea(wrapper).value).toBe('hello');
    });

    it('updates v-model on input', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BTextarea, {
        props: { modelValue: '', 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.find('.b-textarea__textarea').setValue('typed');
      expect(onUpdate).toHaveBeenCalledWith('typed');
    });

    it('works uncontrolled with default empty value', async () => {
      const wrapper = mount(BTextarea);
      await wrapper.find('.b-textarea__textarea').setValue('uncontrolled');
      expect(getTextarea(wrapper).value).toBe('uncontrolled');
    });

    it('reflects external model value changes', async () => {
      const wrapper = mount(BTextarea, { props: { modelValue: 'a' } });
      expect(getTextarea(wrapper).value).toBe('a');
      await wrapper.setProps({ modelValue: 'b' });
      expect(getTextarea(wrapper).value).toBe('b');
    });
  });

  describe('events', () => {
    it('emits change event on input with (value, event)', async () => {
      const wrapper = mount(BTextarea);
      await wrapper.find('.b-textarea__textarea').setValue('x');
      const change = wrapper.emitted('change');
      expect(change).toBeTruthy();
      expect(change![0][0]).toBe('x');
      expect(change![0][1]).toBeInstanceOf(Event);
    });

    it('emits pressEnter on Enter without Shift', async () => {
      const wrapper = mount(BTextarea);
      await wrapper
        .find('.b-textarea__textarea')
        .trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('pressEnter')).toBeTruthy();
    });

    it('does NOT emit pressEnter on Shift+Enter', async () => {
      const wrapper = mount(BTextarea);
      await wrapper
        .find('.b-textarea__textarea')
        .trigger('keydown', { key: 'Enter', shiftKey: true });
      expect(wrapper.emitted('pressEnter')).toBeFalsy();
    });

    it('does not emit pressEnter for other keys', async () => {
      const wrapper = mount(BTextarea);
      await wrapper.find('.b-textarea__textarea').trigger('keydown', { key: 'a' });
      expect(wrapper.emitted('pressEnter')).toBeFalsy();
    });

    it('emits focus event', async () => {
      const wrapper = mount(BTextarea);
      await wrapper.find('.b-textarea__textarea').trigger('focus');
      expect(wrapper.emitted('focus')).toBeTruthy();
    });

    it('emits blur event', async () => {
      const wrapper = mount(BTextarea);
      await wrapper.find('.b-textarea__textarea').trigger('blur');
      expect(wrapper.emitted('blur')).toBeTruthy();
    });
  });

  describe('allowClear', () => {
    it('shows clear button when allowClear is true and has value', () => {
      const wrapper = mount(BTextarea, {
        props: { modelValue: 'hello', allowClear: true },
      });
      expect(wrapper.find('.b-textarea__clear').exists()).toBe(true);
    });

    it('hides clear button when value is empty', () => {
      const wrapper = mount(BTextarea, {
        props: { modelValue: '', allowClear: true },
      });
      expect(wrapper.find('.b-textarea__clear').exists()).toBe(false);
    });

    it('hides clear button when disabled', () => {
      const wrapper = mount(BTextarea, {
        props: { modelValue: 'hello', allowClear: true, disabled: true },
      });
      expect(wrapper.find('.b-textarea__clear').exists()).toBe(false);
    });

    it('hides clear button when readOnly', () => {
      const wrapper = mount(BTextarea, {
        props: { modelValue: 'hello', allowClear: true, readOnly: true },
      });
      expect(wrapper.find('.b-textarea__clear').exists()).toBe(false);
    });

    it('does not show clear when allowClear is false even with value', () => {
      const wrapper = mount(BTextarea, {
        props: { modelValue: 'text', allowClear: false },
      });
      expect(wrapper.find('.b-textarea__clear').exists()).toBe(false);
    });

    it('clears value, emits clear and change("") on click', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BTextarea, {
        props: { modelValue: 'text', allowClear: true, 'onUpdate:modelValue': onUpdate },
        attachTo: document.body,
      });
      await wrapper.find('.b-textarea__clear').trigger('mousedown');
      expect(onUpdate).toHaveBeenCalledWith('');
      expect(wrapper.emitted('clear')).toBeTruthy();
      const change = wrapper.emitted('change');
      expect(change).toBeTruthy();
      expect(change![0][0]).toBe('');
      wrapper.unmount();
    });
  });

  describe('showCount', () => {
    it('renders count text when showCount is true', () => {
      const wrapper = mount(BTextarea, {
        props: { modelValue: 'hello', showCount: true },
      });
      expect(wrapper.find('.b-textarea__count').exists()).toBe(true);
      expect(wrapper.find('.b-textarea__count').text()).toBe('5');
    });

    it('shows count with maxLength as "n / max"', () => {
      const wrapper = mount(BTextarea, {
        props: { modelValue: 'hi', showCount: true, maxLength: 10 },
      });
      expect(wrapper.find('.b-textarea__count').text()).toBe('2 / 10');
    });

    it('applies over-count class when exceeding maxLength', () => {
      const wrapper = mount(BTextarea, {
        props: { modelValue: 'hello world', showCount: true, maxLength: 5 },
      });
      expect(wrapper.find('.b-textarea__count--over').exists()).toBe(true);
      expect(wrapper.find('.b-textarea--over-count').exists()).toBe(true);
    });

    it('uses showCount function return value when provided', () => {
      const formatter = ({
        count,
        maxLength,
      }: {
        value: string;
        count: number;
        maxLength?: number;
      }) => `${count}/${maxLength ?? '∞'}`;
      const wrapper = mount(BTextarea, {
        props: { modelValue: 'ab', showCount: formatter, maxLength: 5 },
      });
      expect(wrapper.find('.b-textarea__count').text()).toBe('2/5');
    });

    it('does not render count when showCount is false', () => {
      const wrapper = mount(BTextarea, { props: { modelValue: 'x' } });
      expect(wrapper.find('.b-textarea__count').exists()).toBe(false);
    });
  });

  describe('autosize', () => {
    it('sets b-textarea--autosize class when autosize is true', () => {
      const wrapper = mount(BTextarea, { props: { autosize: true } });
      expect(wrapper.find('.b-textarea--autosize').exists()).toBe(true);
    });

    it('does NOT set b-textarea--autosize class when autosize is an object', () => {
      const wrapper = mount(BTextarea, {
        props: { autosize: { minRows: 2, maxRows: 6 } },
      });
      expect(wrapper.find('.b-textarea--autosize').exists()).toBe(false);
    });

    it('does NOT set b-textarea--autosize class when autosize is false (default)', () => {
      const wrapper = mount(BTextarea);
      expect(wrapper.find('.b-textarea--autosize').exists()).toBe(false);
    });

    it('adjusts height on input when autosize is an object', async () => {
      // Mock getComputedStyle so jsdom returns numeric paddings/border/lineHeight.
      const realGCS = window.getComputedStyle;
      const gcsSpy = vi
        .spyOn(window, 'getComputedStyle')
        .mockImplementation((el: Element, pseudo?: string | null) => {
          if (
            el instanceof HTMLTextAreaElement &&
            el.classList.contains('b-textarea__textarea')
          ) {
            return {
              lineHeight: '20px',
              paddingTop: '4px',
              paddingBottom: '4px',
              borderTopWidth: '1px',
              borderBottomWidth: '1px',
            } as unknown as CSSStyleDeclaration;
          }
          return realGCS.call(window, el, pseudo ?? null);
        });

      const wrapper = mount(BTextarea, {
        props: { autosize: { minRows: 2, maxRows: 6 } },
        attachTo: document.body,
      });

      const ta = getTextarea(wrapper);
      // Force scrollHeight large enough that the clamp computes a value.
      Object.defineProperty(ta, 'scrollHeight', {
        configurable: true,
        get: () => 80,
      });

      await wrapper.find('.b-textarea__textarea').setValue('line1\nline2\nline3');
      await nextTick();
      await nextTick();

      expect(ta.style.height).not.toBe('');
      expect(ta.style.height).toMatch(/px$/);

      gcsSpy.mockRestore();
      wrapper.unmount();
    });
  });

  describe('slots', () => {
    it('renders prefix slot', () => {
      const wrapper = mount(BTextarea, {
        slots: { prefix: '<span class="test-prefix">$</span>' },
      });
      expect(wrapper.find('.b-textarea__prefix').exists()).toBe(true);
      expect(wrapper.find('.test-prefix').text()).toBe('$');
    });

    it('renders suffix slot', () => {
      const wrapper = mount(BTextarea, {
        slots: { suffix: '<span class="test-suffix">kg</span>' },
      });
      expect(wrapper.find('.b-textarea__suffix').exists()).toBe(true);
      expect(wrapper.find('.test-suffix').text()).toBe('kg');
    });

    it('prefix has aria-hidden', () => {
      const wrapper = mount(BTextarea, { slots: { prefix: 'icon' } });
      expect(wrapper.find('.b-textarea__prefix').attributes('aria-hidden')).toBe(
        'true',
      );
    });

    it('suffix has aria-hidden', () => {
      const wrapper = mount(BTextarea, { slots: { suffix: 'icon' } });
      expect(wrapper.find('.b-textarea__suffix').attributes('aria-hidden')).toBe(
        'true',
      );
    });
  });

  describe('exposed methods', () => {
    it('exposes focus, blur, select methods callable via wrapper.vm', () => {
      const wrapper = mount(BTextarea, { attachTo: document.body });
      expect(typeof wrapper.vm.focus).toBe('function');
      expect(typeof wrapper.vm.blur).toBe('function');
      expect(typeof wrapper.vm.select).toBe('function');
      // Should not throw when invoked.
      expect(() => wrapper.vm.focus()).not.toThrow();
      expect(() => wrapper.vm.blur()).not.toThrow();
      expect(() => wrapper.vm.select()).not.toThrow();
      wrapper.unmount();
    });

    it('focus() actually focuses the underlying textarea', () => {
      const wrapper = mount(BTextarea, { attachTo: document.body });
      wrapper.vm.focus();
      expect(document.activeElement).toBe(getTextarea(wrapper));
      wrapper.unmount();
    });
  });

  describe('edge cases', () => {
    it('handles empty string modelValue', () => {
      const wrapper = mount(BTextarea, { props: { modelValue: '' } });
      expect(getTextarea(wrapper).value).toBe('');
    });

    it('handles very long content (10000 chars) without throwing', () => {
      const longText = 'a'.repeat(10000);
      expect(() => {
        const wrapper = mount(BTextarea, { props: { modelValue: longText } });
        expect(getTextarea(wrapper).value).toBe(longText);
      }).not.toThrow();
    });
  });
});
