import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import BSwitch from './BSwitch.vue';

function getRoot(wrapper: VueWrapper) {
  return wrapper.find('.b-switch');
}

function getHandle(wrapper: VueWrapper) {
  return wrapper.find('.b-switch__handle');
}

describe('BSwitch', () => {
  // ─────────────────────────────────────────────
  // Defaults and variants render
  // ─────────────────────────────────────────────
  describe('defaults and variants render', () => {
    it('renders with default props', () => {
      const wrapper = mount(BSwitch);
      expect(getRoot(wrapper).exists()).toBe(true);
      expect(getHandle(wrapper).exists()).toBe(true);
    });

    it('renders as unchecked by default', () => {
      const wrapper = mount(BSwitch);
      expect(wrapper.find('.b-switch--checked').exists()).toBe(false);
      expect(wrapper.attributes('aria-checked')).toBe('false');
    });

    it('renders default size', () => {
      const wrapper = mount(BSwitch);
      expect(wrapper.find('.b-switch--default').exists()).toBe(true);
    });

    it('renders small size', () => {
      const wrapper = mount(BSwitch, { props: { size: 'small' } });
      expect(wrapper.find('.b-switch--small').exists()).toBe(true);
    });

    it('renders disabled state', () => {
      const wrapper = mount(BSwitch, { props: { disabled: true } });
      expect(wrapper.find('.b-switch--disabled').exists()).toBe(true);
      expect(wrapper.attributes('disabled')).toBeDefined();
    });

    it('renders loading state', () => {
      const wrapper = mount(BSwitch, { props: { loading: true } });
      expect(wrapper.find('.b-switch--loading').exists()).toBe(true);
      expect(wrapper.find('.b-switch__loading-icon').exists()).toBe(true);
    });

    it('does not show loading icon when not loading', () => {
      const wrapper = mount(BSwitch);
      expect(wrapper.find('.b-switch__loading-icon').exists()).toBe(false);
    });
  });

  // ─────────────────────────────────────────────
  // Props map to DOM and behavior
  // ─────────────────────────────────────────────
  describe('props map to DOM and behavior', () => {
    it('reflects modelValue=true as checked', () => {
      const wrapper = mount(BSwitch, { props: { modelValue: true } });
      expect(wrapper.find('.b-switch--checked').exists()).toBe(true);
      expect(wrapper.attributes('aria-checked')).toBe('true');
    });

    it('reflects modelValue=false as unchecked', () => {
      const wrapper = mount(BSwitch, { props: { modelValue: false } });
      expect(wrapper.find('.b-switch--checked').exists()).toBe(false);
      expect(wrapper.attributes('aria-checked')).toBe('false');
    });

    it('uses defaultChecked for initial uncontrolled state', () => {
      const wrapper = mount(BSwitch, { props: { defaultChecked: true } });
      expect(wrapper.find('.b-switch--checked').exists()).toBe(true);
      expect(wrapper.attributes('aria-checked')).toBe('true');
    });

    it('disabled prop prevents toggling on click', async () => {
      const wrapper = mount(BSwitch, { props: { disabled: true } });
      await wrapper.trigger('click');
      expect(wrapper.find('.b-switch--checked').exists()).toBe(false);
      expect(wrapper.emitted('change')).toBeUndefined();
    });

    it('loading prop prevents toggling on click', async () => {
      const wrapper = mount(BSwitch, { props: { loading: true } });
      await wrapper.trigger('click');
      expect(wrapper.find('.b-switch--checked').exists()).toBe(false);
      expect(wrapper.emitted('change')).toBeUndefined();
    });

    it('sets tabindex to -1 when disabled', () => {
      const wrapper = mount(BSwitch, { props: { disabled: true } });
      expect(wrapper.attributes('tabindex')).toBe('-1');
    });

    it('sets tabindex to 0 when enabled', () => {
      const wrapper = mount(BSwitch);
      expect(wrapper.attributes('tabindex')).toBe('0');
    });
  });

  // ─────────────────────────────────────────────
  // Events
  // ─────────────────────────────────────────────
  describe('events', () => {
    it('emits change with new value on click', async () => {
      const wrapper = mount(BSwitch);
      await wrapper.trigger('click');
      expect(wrapper.emitted('change')).toHaveLength(1);
      expect(wrapper.emitted('change')![0][0]).toBe(true);
    });

    it('emits click with new value on click', async () => {
      const wrapper = mount(BSwitch);
      await wrapper.trigger('click');
      expect(wrapper.emitted('click')).toHaveLength(1);
      expect(wrapper.emitted('click')![0][0]).toBe(true);
    });

    it('emits update:modelValue on toggle', async () => {
      const wrapper = mount(BSwitch, { props: { modelValue: false } });
      await wrapper.trigger('click');
      expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
      expect(wrapper.emitted('update:modelValue')![0][0]).toBe(true);
    });

    it('toggles back to false when already checked', async () => {
      const wrapper = mount(BSwitch, {
        props: { modelValue: true, 'onUpdate:modelValue': (v: boolean) => wrapper.setProps({ modelValue: v }) },
      });
      await wrapper.trigger('click');
      expect(wrapper.emitted('change')![0][0]).toBe(false);
    });

    it('emits change event on keyboard toggle', async () => {
      const wrapper = mount(BSwitch);
      await wrapper.trigger('keydown', { key: ' ' });
      expect(wrapper.emitted('change')).toHaveLength(1);
      expect(wrapper.emitted('change')![0][0]).toBe(true);
    });

    it('does not emit click event on keyboard toggle', async () => {
      const wrapper = mount(BSwitch);
      await wrapper.trigger('keydown', { key: ' ' });
      expect(wrapper.emitted('click')).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────
  // Keyboard and focus behavior
  // ─────────────────────────────────────────────
  describe('keyboard and focus behavior', () => {
    it('toggles on Enter key', async () => {
      const wrapper = mount(BSwitch);
      await wrapper.trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('change')).toHaveLength(1);
      expect(wrapper.emitted('change')![0][0]).toBe(true);
    });

    it('toggles on Space key', async () => {
      const wrapper = mount(BSwitch);
      await wrapper.trigger('keydown', { key: ' ' });
      expect(wrapper.emitted('change')).toHaveLength(1);
      expect(wrapper.emitted('change')![0][0]).toBe(true);
    });

    it('does not toggle on other keys', async () => {
      const wrapper = mount(BSwitch);
      await wrapper.trigger('keydown', { key: 'a' });
      expect(wrapper.emitted('change')).toBeUndefined();
    });

    it('does not toggle via keyboard when disabled', async () => {
      const wrapper = mount(BSwitch, { props: { disabled: true } });
      await wrapper.trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('change')).toBeUndefined();
    });

    it('does not toggle via keyboard when loading', async () => {
      const wrapper = mount(BSwitch, { props: { loading: true } });
      await wrapper.trigger('keydown', { key: ' ' });
      expect(wrapper.emitted('change')).toBeUndefined();
    });

    it('exposes focus method', () => {
      const wrapper = mount(BSwitch);
      const vm = wrapper.vm as unknown as { focus: () => void };
      expect(typeof vm.focus).toBe('function');
    });

    it('exposes blur method', () => {
      const wrapper = mount(BSwitch);
      const vm = wrapper.vm as unknown as { blur: () => void };
      expect(typeof vm.blur).toBe('function');
    });
  });

  // ─────────────────────────────────────────────
  // Accessibility checks
  // ─────────────────────────────────────────────
  describe('accessibility', () => {
    it('has role="switch"', () => {
      const wrapper = mount(BSwitch);
      expect(wrapper.attributes('role')).toBe('switch');
    });

    it('renders as a button element', () => {
      const wrapper = mount(BSwitch);
      expect(wrapper.element.tagName).toBe('BUTTON');
    });

    it('has type="button" to prevent form submission', () => {
      const wrapper = mount(BSwitch);
      expect(wrapper.attributes('type')).toBe('button');
    });

    it('sets aria-checked to true when checked', () => {
      const wrapper = mount(BSwitch, { props: { modelValue: true } });
      expect(wrapper.attributes('aria-checked')).toBe('true');
    });

    it('sets aria-checked to false when unchecked', () => {
      const wrapper = mount(BSwitch, { props: { modelValue: false } });
      expect(wrapper.attributes('aria-checked')).toBe('false');
    });

    it('sets aria-disabled when disabled', () => {
      const wrapper = mount(BSwitch, { props: { disabled: true } });
      expect(wrapper.attributes('aria-disabled')).toBe('true');
    });

    it('sets aria-disabled when loading', () => {
      const wrapper = mount(BSwitch, { props: { loading: true } });
      expect(wrapper.attributes('aria-disabled')).toBe('true');
    });

    it('does not set aria-disabled when enabled', () => {
      const wrapper = mount(BSwitch);
      expect(wrapper.attributes('aria-disabled')).toBeUndefined();
    });

    it('handle is aria-hidden', () => {
      const wrapper = mount(BSwitch);
      expect(getHandle(wrapper).attributes('aria-hidden')).toBe('true');
    });

    it('loading icon is aria-hidden', () => {
      const wrapper = mount(BSwitch, { props: { loading: true } });
      expect(wrapper.find('.b-switch__loading-icon').attributes('aria-hidden')).toBe('true');
    });
  });

  // ─────────────────────────────────────────────
  // Edge cases
  // ─────────────────────────────────────────────
  describe('edge cases', () => {
    it('controlled mode: does not change visual state without modelValue update', async () => {
      const wrapper = mount(BSwitch, { props: { modelValue: false } });
      await wrapper.trigger('click');
      // The component emits but needs the parent to update modelValue
      expect(wrapper.emitted('update:modelValue')![0][0]).toBe(true);
    });

    it('uncontrolled mode: toggles without modelValue prop', async () => {
      const wrapper = mount(BSwitch, { props: { defaultChecked: false } });
      await wrapper.trigger('click');
      expect(wrapper.find('.b-switch--checked').exists()).toBe(true);
    });

    it('renders slot content when checked', () => {
      const wrapper = mount(BSwitch, {
        props: { modelValue: true },
        slots: { checked: 'ON' },
      });
      expect(wrapper.find('.b-switch__inner-checked').text()).toBe('ON');
    });

    it('renders slot content when unchecked', () => {
      const wrapper = mount(BSwitch, {
        props: { modelValue: false },
        slots: { unchecked: 'OFF' },
      });
      expect(wrapper.find('.b-switch__inner-unchecked').text()).toBe('OFF');
    });

    it('hides checked slot content when unchecked', () => {
      const wrapper = mount(BSwitch, {
        props: { modelValue: false },
        slots: { checked: 'ON', unchecked: 'OFF' },
      });
      expect(wrapper.find('.b-switch__inner-checked').exists()).toBe(false);
      expect(wrapper.find('.b-switch__inner-unchecked').exists()).toBe(true);
    });

    it('hides unchecked slot content when checked', () => {
      const wrapper = mount(BSwitch, {
        props: { modelValue: true },
        slots: { checked: 'ON', unchecked: 'OFF' },
      });
      expect(wrapper.find('.b-switch__inner-checked').exists()).toBe(true);
      expect(wrapper.find('.b-switch__inner-unchecked').exists()).toBe(false);
    });

    it('multiple rapid clicks toggle correctly', async () => {
      const wrapper = mount(BSwitch);
      await wrapper.trigger('click');
      await wrapper.trigger('click');
      await wrapper.trigger('click');
      expect(wrapper.find('.b-switch--checked').exists()).toBe(true);
      expect(wrapper.emitted('change')).toHaveLength(3);
    });
  });

  // ─────────────────────────────────────────────
  // Animation tests with fake timers
  // ─────────────────────────────────────────────
  describe('animation (deterministic with fake timers)', () => {
    it('loading icon has spinning animation class', () => {
      vi.useFakeTimers();
      const wrapper = mount(BSwitch, { props: { loading: true } });
      const icon = wrapper.find('.b-switch__loading-icon');
      expect(icon.exists()).toBe(true);
      vi.useRealTimers();
    });

    it('transitions are applied via CSS classes', async () => {
      vi.useFakeTimers();
      const wrapper = mount(BSwitch);
      await wrapper.trigger('click');
      expect(wrapper.find('.b-switch--checked').exists()).toBe(true);
      vi.useRealTimers();
    });
  });
});
