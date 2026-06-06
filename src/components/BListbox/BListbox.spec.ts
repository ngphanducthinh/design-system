import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import BListbox from './BListbox.vue';

const fruits = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' },
];

const fruitsWithDisabled = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana', disabled: true },
  { label: 'Cherry', value: 'cherry' },
];

const grouped = [
  { label: 'Apple', value: 'apple', group: 'Fruits' },
  { label: 'Banana', value: 'banana', group: 'Fruits' },
  { label: 'Carrot', value: 'carrot', group: 'Veggies' },
  { label: 'Daikon', value: 'daikon', group: 'Veggies' },
];

function getListbox(wrapper: VueWrapper): HTMLUListElement {
  return wrapper.find('.b-listbox').element as HTMLUListElement;
}

describe('BListbox', () => {
  describe('defaults and rendering', () => {
    it('renders with default props', () => {
      const wrapper = mount(BListbox, { props: { options: fruits } });
      expect(wrapper.find('.b-listbox').exists()).toBe(true);
      expect(wrapper.find('.b-listbox--md').exists()).toBe(true);
      expect(wrapper.findAll('[role="option"]')).toHaveLength(4);
    });

    it('renders empty when no options', () => {
      const wrapper = mount(BListbox);
      expect(wrapper.find('.b-listbox').exists()).toBe(true);
      expect(wrapper.findAll('[role="option"]')).toHaveLength(0);
    });

    it('renders all size variants', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      sizes.forEach((size) => {
        const wrapper = mount(BListbox, { props: { options: fruits, size } });
        expect(wrapper.find(`.b-listbox--${size}`).exists()).toBe(true);
      });
    });

    it('renders with custom id', () => {
      const wrapper = mount(BListbox, { props: { id: 'my-listbox', options: fruits } });
      expect(getListbox(wrapper).id).toBe('my-listbox');
    });

    it('generates a unique id when none is provided', () => {
      const wrapper = mount(BListbox, { props: { options: fruits } });
      expect(getListbox(wrapper).id).toMatch(/^b-listbox-/);
    });

    it('option ids derive from listbox id', () => {
      const wrapper = mount(BListbox, { props: { id: 'lb', options: fruits } });
      const opts = wrapper.findAll('[role="option"]');
      expect(opts[0].attributes('id')).toBe('lb-option-0');
      expect(opts[1].attributes('id')).toBe('lb-option-1');
    });

    it('renders option labels using labelKey', () => {
      const items = [
        { name: 'Foo', value: 'foo', label: '' },
        { name: 'Bar', value: 'bar', label: '' },
      ];
      const wrapper = mount(BListbox, { props: { options: items, labelKey: 'name' } });
      const opts = wrapper.findAll('[role="option"]');
      expect(opts[0].text()).toBe('Foo');
      expect(opts[1].text()).toBe('Bar');
    });

    it('uses custom valueKey when provided', async () => {
      const items = [
        { label: 'A', value: 'wrong', id: 'a' },
        { label: 'B', value: 'wrong', id: 'b' },
      ];
      const onUpdate = vi.fn();
      const wrapper = mount(BListbox, {
        props: { options: items, valueKey: 'id', 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.findAll('[role="option"]')[0].trigger('click');
      expect(onUpdate).toHaveBeenCalledWith('a');
    });
  });

  describe('ARIA attributes', () => {
    it('root has role="listbox"', () => {
      const wrapper = mount(BListbox, { props: { options: fruits } });
      expect(getListbox(wrapper).getAttribute('role')).toBe('listbox');
    });

    it('root has tabindex="0" by default', () => {
      const wrapper = mount(BListbox, { props: { options: fruits } });
      expect(getListbox(wrapper).getAttribute('tabindex')).toBe('0');
    });

    it('root has tabindex="-1" when disabled', () => {
      const wrapper = mount(BListbox, { props: { options: fruits, disabled: true } });
      expect(getListbox(wrapper).getAttribute('tabindex')).toBe('-1');
    });

    it('does not set aria-multiselectable in single mode', () => {
      const wrapper = mount(BListbox, { props: { options: fruits } });
      expect(getListbox(wrapper).getAttribute('aria-multiselectable')).toBeNull();
    });

    it('sets aria-multiselectable="true" when multiple', () => {
      const wrapper = mount(BListbox, { props: { options: fruits, multiple: true } });
      expect(getListbox(wrapper).getAttribute('aria-multiselectable')).toBe('true');
    });

    it('sets aria-disabled when disabled', () => {
      const wrapper = mount(BListbox, { props: { options: fruits, disabled: true } });
      expect(getListbox(wrapper).getAttribute('aria-disabled')).toBe('true');
    });

    it('option has role="option" and aria-selected', () => {
      const wrapper = mount(BListbox, { props: { options: fruits, modelValue: 'apple' } });
      const opt = wrapper.findAll('[role="option"]')[0];
      expect(opt.attributes('role')).toBe('option');
      expect(opt.attributes('aria-selected')).toBe('true');
    });

    it('disabled option has aria-disabled="true"', () => {
      const wrapper = mount(BListbox, { props: { options: fruitsWithDisabled } });
      const opts = wrapper.findAll('[role="option"]');
      expect(opts[1].attributes('aria-disabled')).toBe('true');
    });

    it('aria-activedescendant is unset before focus', () => {
      const wrapper = mount(BListbox, { props: { options: fruits } });
      expect(getListbox(wrapper).getAttribute('aria-activedescendant')).toBeNull();
    });

    it('aria-activedescendant points to active option after focus', async () => {
      const wrapper = mount(BListbox, { props: { options: fruits }, attachTo: document.body });
      await wrapper.find('.b-listbox').trigger('focus');
      const activeId = getListbox(wrapper).getAttribute('aria-activedescendant');
      expect(activeId).toBe(`${getListbox(wrapper).id}-option-0`);
      wrapper.unmount();
    });
  });

  describe('selection (single)', () => {
    it('selects an option on click and emits change', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BListbox, {
        props: { options: fruits, 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.findAll('[role="option"]')[1].trigger('click');
      expect(onUpdate).toHaveBeenCalledWith('banana');
      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')![0][0]).toBe('banana');
    });

    it('selecting another option replaces the value', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BListbox, {
        props: { options: fruits, modelValue: 'apple', 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.findAll('[role="option"]')[2].trigger('click');
      expect(onUpdate).toHaveBeenLastCalledWith('cherry');
    });

    it('reflects external modelValue changes', async () => {
      const wrapper = mount(BListbox, { props: { options: fruits, modelValue: 'apple' } });
      expect(wrapper.findAll('[role="option"]')[0].attributes('aria-selected')).toBe('true');
      await wrapper.setProps({ modelValue: 'banana' });
      expect(wrapper.findAll('[role="option"]')[0].attributes('aria-selected')).toBe('false');
      expect(wrapper.findAll('[role="option"]')[1].attributes('aria-selected')).toBe('true');
    });

    it('does not select disabled options on click', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BListbox, {
        props: { options: fruitsWithDisabled, 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.findAll('[role="option"]')[1].trigger('click');
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('does nothing when listbox is disabled', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BListbox, {
        props: { options: fruits, disabled: true, 'onUpdate:modelValue': onUpdate },
      });
      await wrapper.findAll('[role="option"]')[0].trigger('click');
      expect(onUpdate).not.toHaveBeenCalled();
    });
  });

  describe('selection (multiple)', () => {
    it('toggles values into an array', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BListbox, {
        props: {
          options: fruits,
          multiple: true,
          modelValue: [],
          'onUpdate:modelValue': onUpdate,
        },
      });
      await wrapper.findAll('[role="option"]')[0].trigger('click');
      expect(onUpdate).toHaveBeenLastCalledWith(['apple']);
    });

    it('removes value from array on second click', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BListbox, {
        props: {
          options: fruits,
          multiple: true,
          modelValue: ['apple', 'banana'],
          'onUpdate:modelValue': onUpdate,
        },
      });
      await wrapper.findAll('[role="option"]')[0].trigger('click');
      expect(onUpdate).toHaveBeenLastCalledWith(['banana']);
    });

    it('marks multiple options aria-selected="true"', () => {
      const wrapper = mount(BListbox, {
        props: { options: fruits, multiple: true, modelValue: ['apple', 'cherry'] },
      });
      const opts = wrapper.findAll('[role="option"]');
      expect(opts[0].attributes('aria-selected')).toBe('true');
      expect(opts[1].attributes('aria-selected')).toBe('false');
      expect(opts[2].attributes('aria-selected')).toBe('true');
    });

    it('emits change with array', async () => {
      const wrapper = mount(BListbox, {
        props: { options: fruits, multiple: true, modelValue: [] },
      });
      await wrapper.findAll('[role="option"]')[0].trigger('click');
      expect(wrapper.emitted('change')![0][0]).toEqual(['apple']);
    });
  });

  describe('keyboard navigation', () => {
    it('ArrowDown moves active descendant to next enabled', async () => {
      const wrapper = mount(BListbox, { props: { options: fruits }, attachTo: document.body });
      await wrapper.find('.b-listbox').trigger('focus');
      await wrapper.find('.b-listbox').trigger('keydown', { key: 'ArrowDown' });
      const id = getListbox(wrapper).getAttribute('aria-activedescendant');
      expect(id).toBe(`${getListbox(wrapper).id}-option-1`);
      wrapper.unmount();
    });

    it('ArrowDown skips disabled options', async () => {
      const wrapper = mount(BListbox, {
        props: { options: fruitsWithDisabled },
        attachTo: document.body,
      });
      await wrapper.find('.b-listbox').trigger('focus');
      // active=0; ArrowDown should skip disabled at index 1 → index 2
      await wrapper.find('.b-listbox').trigger('keydown', { key: 'ArrowDown' });
      const id = getListbox(wrapper).getAttribute('aria-activedescendant');
      expect(id).toBe(`${getListbox(wrapper).id}-option-2`);
      wrapper.unmount();
    });

    it('ArrowDown wraps to first enabled at end', async () => {
      const wrapper = mount(BListbox, {
        props: { options: fruits, modelValue: 'date' },
        attachTo: document.body,
      });
      await wrapper.find('.b-listbox').trigger('focus');
      // active starts at selected (3); ArrowDown wraps to 0
      await wrapper.find('.b-listbox').trigger('keydown', { key: 'ArrowDown' });
      const id = getListbox(wrapper).getAttribute('aria-activedescendant');
      expect(id).toBe(`${getListbox(wrapper).id}-option-0`);
      wrapper.unmount();
    });

    it('ArrowUp moves active descendant up', async () => {
      const wrapper = mount(BListbox, {
        props: { options: fruits, modelValue: 'cherry' },
        attachTo: document.body,
      });
      await wrapper.find('.b-listbox').trigger('focus');
      await wrapper.find('.b-listbox').trigger('keydown', { key: 'ArrowUp' });
      const id = getListbox(wrapper).getAttribute('aria-activedescendant');
      expect(id).toBe(`${getListbox(wrapper).id}-option-1`);
      wrapper.unmount();
    });

    it('Home jumps to first enabled', async () => {
      const wrapper = mount(BListbox, {
        props: { options: fruits, modelValue: 'date' },
        attachTo: document.body,
      });
      await wrapper.find('.b-listbox').trigger('focus');
      await wrapper.find('.b-listbox').trigger('keydown', { key: 'Home' });
      const id = getListbox(wrapper).getAttribute('aria-activedescendant');
      expect(id).toBe(`${getListbox(wrapper).id}-option-0`);
      wrapper.unmount();
    });

    it('End jumps to last enabled', async () => {
      const wrapper = mount(BListbox, { props: { options: fruits }, attachTo: document.body });
      await wrapper.find('.b-listbox').trigger('focus');
      await wrapper.find('.b-listbox').trigger('keydown', { key: 'End' });
      const id = getListbox(wrapper).getAttribute('aria-activedescendant');
      expect(id).toBe(`${getListbox(wrapper).id}-option-3`);
      wrapper.unmount();
    });

    it('Enter selects active option', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BListbox, {
        props: { options: fruits, 'onUpdate:modelValue': onUpdate },
        attachTo: document.body,
      });
      await wrapper.find('.b-listbox').trigger('focus');
      await wrapper.find('.b-listbox').trigger('keydown', { key: 'ArrowDown' });
      await wrapper.find('.b-listbox').trigger('keydown', { key: 'Enter' });
      expect(onUpdate).toHaveBeenLastCalledWith('banana');
      wrapper.unmount();
    });

    it('Space toggles selection in multiple mode', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BListbox, {
        props: {
          options: fruits,
          multiple: true,
          modelValue: [],
          'onUpdate:modelValue': onUpdate,
        },
        attachTo: document.body,
      });
      await wrapper.find('.b-listbox').trigger('focus');
      await wrapper.find('.b-listbox').trigger('keydown', { key: ' ' });
      expect(onUpdate).toHaveBeenLastCalledWith(['apple']);
      wrapper.unmount();
    });

    it('disabled listbox ignores keyboard', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BListbox, {
        props: { options: fruits, disabled: true, 'onUpdate:modelValue': onUpdate },
        attachTo: document.body,
      });
      await wrapper.find('.b-listbox').trigger('keydown', { key: 'Enter' });
      expect(onUpdate).not.toHaveBeenCalled();
      wrapper.unmount();
    });
  });

  describe('type-ahead', () => {
    it('jumps to option starting with typed letter', async () => {
      vi.useFakeTimers();
      const wrapper = mount(BListbox, { props: { options: fruits }, attachTo: document.body });
      await wrapper.find('.b-listbox').trigger('focus');
      await wrapper.find('.b-listbox').trigger('keydown', { key: 'c' });
      const id = getListbox(wrapper).getAttribute('aria-activedescendant');
      expect(id).toBe(`${getListbox(wrapper).id}-option-2`);
      wrapper.unmount();
      vi.useRealTimers();
    });

    it('debounces and resets buffer after 500ms', async () => {
      vi.useFakeTimers();
      const wrapper = mount(BListbox, { props: { options: fruits }, attachTo: document.body });
      await wrapper.find('.b-listbox').trigger('focus');
      await wrapper.find('.b-listbox').trigger('keydown', { key: 'b' });
      // After timeout, buffer resets — pressing 'd' jumps to "Date"
      vi.advanceTimersByTime(600);
      await wrapper.find('.b-listbox').trigger('keydown', { key: 'd' });
      const id = getListbox(wrapper).getAttribute('aria-activedescendant');
      expect(id).toBe(`${getListbox(wrapper).id}-option-3`);
      wrapper.unmount();
      vi.useRealTimers();
    });

    it('skips disabled options during type-ahead', async () => {
      vi.useFakeTimers();
      const wrapper = mount(BListbox, {
        props: { options: fruitsWithDisabled },
        attachTo: document.body,
      });
      await wrapper.find('.b-listbox').trigger('focus');
      await wrapper.find('.b-listbox').trigger('keydown', { key: 'b' });
      // Banana is disabled — active should not jump there
      const id = getListbox(wrapper).getAttribute('aria-activedescendant');
      expect(id).not.toBe(`${getListbox(wrapper).id}-option-1`);
      wrapper.unmount();
      vi.useRealTimers();
    });
  });

  describe('groups', () => {
    it('renders presentation wrappers and group ARIA labels', () => {
      const wrapper = mount(BListbox, { props: { options: grouped } });
      const groups = wrapper.findAll('[role="group"]');
      expect(groups).toHaveLength(2);
      expect(groups[0].attributes('aria-label')).toBe('Fruits');
      expect(groups[1].attributes('aria-label')).toBe('Veggies');
    });

    it('group wrappers have role="presentation"', () => {
      const wrapper = mount(BListbox, { props: { options: grouped } });
      const presentation = wrapper.findAll('li[role="presentation"]');
      expect(presentation).toHaveLength(2);
    });

    it('grouped options remain selectable by index', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BListbox, {
        props: { options: grouped, 'onUpdate:modelValue': onUpdate },
      });
      const opts = wrapper.findAll('[role="option"]');
      expect(opts).toHaveLength(4);
      await opts[2].trigger('click');
      expect(onUpdate).toHaveBeenCalledWith('carrot');
    });
  });

  describe('focus management', () => {
    it('exposes focus()', () => {
      const wrapper = mount(BListbox, { props: { options: fruits }, attachTo: document.body });
      expect(typeof wrapper.vm.focus).toBe('function');
      wrapper.vm.focus();
      expect(document.activeElement).toBe(getListbox(wrapper));
      wrapper.unmount();
    });

    it('exposes focusOption(value)', async () => {
      const wrapper = mount(BListbox, { props: { options: fruits }, attachTo: document.body });
      wrapper.vm.focusOption('cherry');
      await wrapper.vm.$nextTick();
      const id = getListbox(wrapper).getAttribute('aria-activedescendant');
      expect(id).toBe(`${getListbox(wrapper).id}-option-2`);
      expect(document.activeElement).toBe(getListbox(wrapper));
      wrapper.unmount();
    });

    it('focus selects pre-selected option as initial active descendant', async () => {
      const wrapper = mount(BListbox, {
        props: { options: fruits, modelValue: 'cherry' },
        attachTo: document.body,
      });
      await wrapper.find('.b-listbox').trigger('focus');
      const id = getListbox(wrapper).getAttribute('aria-activedescendant');
      expect(id).toBe(`${getListbox(wrapper).id}-option-2`);
      wrapper.unmount();
    });

    it('individual options are not in tab order', () => {
      const wrapper = mount(BListbox, { props: { options: fruits } });
      const opts = wrapper.findAll('[role="option"]');
      opts.forEach((o) => {
        // No tabindex attribute on options — they're not focusable, only aria-activedescendant.
        expect(o.attributes('tabindex')).toBeUndefined();
      });
    });
  });

  describe('edge cases', () => {
    it('handles long option lists', () => {
      const many = Array.from({ length: 200 }, (_, i) => ({
        label: `Item ${i}`,
        value: `item-${i}`,
      }));
      const wrapper = mount(BListbox, { props: { options: many } });
      expect(wrapper.findAll('[role="option"]')).toHaveLength(200);
    });

    it('handles option list change resetting invalid active index', async () => {
      const wrapper = mount(BListbox, {
        props: { options: fruits },
        attachTo: document.body,
      });
      await wrapper.find('.b-listbox').trigger('focus');
      await wrapper.find('.b-listbox').trigger('keydown', { key: 'End' });
      // active is 3; shrink list to 2 entries — active should reset
      await wrapper.setProps({ options: fruits.slice(0, 2) });
      // No assertion on internal state needed: rendering should not error and aria-activedescendant
      // should not point to a non-existent option.
      const id = getListbox(wrapper).getAttribute('aria-activedescendant');
      expect(id === null || id === `${getListbox(wrapper).id}-option-0` || id === `${getListbox(wrapper).id}-option-1`).toBe(true);
      wrapper.unmount();
    });

    it('controlled mode does not mutate external array', async () => {
      const initial = ['apple'] as const;
      const onUpdate = vi.fn();
      const wrapper = mount(BListbox, {
        props: {
          options: fruits,
          multiple: true,
          modelValue: initial as unknown as string[],
          'onUpdate:modelValue': onUpdate,
        },
      });
      await wrapper.findAll('[role="option"]')[1].trigger('click');
      expect(initial).toEqual(['apple']); // untouched
      expect(onUpdate).toHaveBeenCalledWith(['apple', 'banana']);
    });
  });
});
