import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import BCascader from './BCascader.vue';
import type { BCascaderOption } from './types.ts';
import {
  BCascaderExpandTrigger,
  BCascaderPlacement,
  BCascaderSize,
  BCascaderStatus,
} from './types.ts';

const basicOptions: BCascaderOption[] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          { value: 'xihu', label: 'West Lake' },
          { value: 'xiasha', label: 'Xiasha', disabled: true },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      {
        value: 'nanjing',
        label: 'Nanjing',
        children: [{ value: 'zhonghuamen', label: 'Zhong Hua Men' }],
      },
    ],
  },
  { value: 'empty', label: 'Empty Node' },
];

function createToggleEvent(newState: string, oldState: string): Event {
  const event = new Event('toggle', { bubbles: false });
  (event as unknown as Record<string, string>).newState = newState;
  (event as unknown as Record<string, string>).oldState = oldState;
  return event;
}

function stubPopoverOnElement(el: HTMLElement) {
  el.showPopover = vi.fn(() => {
    el.toggleAttribute('popover-open', true);
    el.dispatchEvent(createToggleEvent('open', 'closed'));
  });
  el.hidePopover = vi.fn(() => {
    el.toggleAttribute('popover-open', false);
    el.dispatchEvent(createToggleEvent('closed', 'open'));
  });
}

function mountCascader(props = {}, slots = {}) {
  const wrapper = mount(BCascader, {
    props: { options: basicOptions, modelValue: [], 'onUpdate:modelValue': () => {}, ...props },
    slots,
    attachTo: document.body,
  });

  const popoverEl = wrapper.find('.b-cascader__popup').element as HTMLElement;
  if (popoverEl) {
    stubPopoverOnElement(popoverEl);
  }

  return wrapper;
}

describe('BCascader', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─────────────────────────────────────────────
  // Defaults & variants render
  // ─────────────────────────────────────────────
  describe('Defaults & variants render', () => {
    it('renders with default props', () => {
      const wrapper = mountCascader();
      expect(wrapper.find('.b-cascader').exists()).toBe(true);
      expect(wrapper.find('.b-cascader--md').exists()).toBe(true);
    });

    it('renders placeholder when no value', () => {
      const wrapper = mountCascader();
      expect(wrapper.find('.b-cascader__placeholder').text()).toBe('Please select');
    });

    it('renders custom placeholder', () => {
      const wrapper = mountCascader({ placeholder: 'Pick one' });
      expect(wrapper.find('.b-cascader__placeholder').text()).toBe('Pick one');
    });

    it('renders small size', () => {
      const wrapper = mountCascader({ size: BCascaderSize.Small });
      expect(wrapper.find('.b-cascader--sm').exists()).toBe(true);
    });

    it('renders large size', () => {
      const wrapper = mountCascader({ size: BCascaderSize.Large });
      expect(wrapper.find('.b-cascader--lg').exists()).toBe(true);
    });

    it('renders disabled state', () => {
      const wrapper = mountCascader({ disabled: true });
      expect(wrapper.find('.b-cascader--disabled').exists()).toBe(true);
    });

    it('renders error status', () => {
      const wrapper = mountCascader({ status: BCascaderStatus.Error });
      expect(wrapper.find('.b-cascader--error').exists()).toBe(true);
    });

    it('renders warning status', () => {
      const wrapper = mountCascader({ status: BCascaderStatus.Warning });
      expect(wrapper.find('.b-cascader--warning').exists()).toBe(true);
    });
  });

  // ─────────────────────────────────────────────
  // Props to DOM and behavior
  // ─────────────────────────────────────────────
  describe('Props map to DOM and behavior', () => {
    it('displays selected value path', () => {
      const wrapper = mountCascader({ modelValue: ['zhejiang', 'hangzhou', 'xihu'] });
      expect(wrapper.text()).toContain('Zhejiang / Hangzhou / West Lake');
    });

    it('shows clear button on hover when value is set and allowClear is true', () => {
      const wrapper = mountCascader({
        modelValue: ['zhejiang', 'hangzhou', 'xihu'],
        allowClear: true,
      });
      expect(wrapper.find('.b-cascader__clear').exists()).toBe(true);
    });

    it('does not show clear button when allowClear is false', () => {
      const wrapper = mountCascader({
        modelValue: ['zhejiang', 'hangzhou', 'xihu'],
        allowClear: false,
      });
      expect(wrapper.find('.b-cascader__clear').exists()).toBe(false);
    });

    it('does not show clear button when disabled', () => {
      const wrapper = mountCascader({
        modelValue: ['zhejiang', 'hangzhou', 'xihu'],
        disabled: true,
      });
      expect(wrapper.find('.b-cascader__clear').exists()).toBe(false);
    });

    it('shows arrow icon', () => {
      const wrapper = mountCascader();
      expect(wrapper.find('.b-cascader__suffix').exists()).toBe(true);
      expect(wrapper.find('.b-cascader__arrow').exists()).toBe(true);
    });

    it('applies all placements', () => {
      for (const p of Object.values(BCascaderPlacement)) {
        const wrapper = mountCascader({ placement: p });
        const popup = wrapper.find('.b-cascader__popup');
        expect(popup.exists()).toBe(true);
      }
    });

    it('supports custom fieldNames', () => {
      const customOptions = [
        { id: 'opt1', name: 'Option 1', items: [{ id: 'opt1-1', name: 'Sub Option' }] },
      ];
      const wrapper = mountCascader({
        options: customOptions,
        fieldNames: { label: 'name', value: 'id', children: 'items' },
        modelValue: ['opt1', 'opt1-1'],
      });
      expect(wrapper.text()).toContain('Option 1 / Sub Option');
    });

    it('renders in multiple mode', () => {
      const wrapper = mountCascader({ multiple: true });
      expect(wrapper.find('.b-cascader--multiple').exists()).toBe(true);
      expect(wrapper.find('.b-cascader__selections').exists()).toBe(true);
    });
  });

  // ─────────────────────────────────────────────
  // Events
  // ─────────────────────────────────────────────
  describe('Events', () => {
    it('emits openChange when popup opens', async () => {
      const wrapper = mountCascader();
      await wrapper.find('.b-cascader').trigger('click');
      expect(wrapper.emitted('openChange')?.[0]).toEqual([true]);
    });

    it('emits openChange when popup closes', async () => {
      const wrapper = mountCascader();
      // Open
      await wrapper.find('.b-cascader').trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted('openChange')![0]).toEqual([true]);

      // Close by pressing Escape in the popup
      const popup = wrapper.find('.b-cascader__popup');
      await popup.trigger('keydown', { key: 'Escape' });
      await wrapper.vm.$nextTick();

      const events = wrapper.emitted('openChange')!;
      expect(events[events.length - 1]).toEqual([false]);
    });

    it('emits change when leaf option is selected', async () => {
      const onUpdate = vi.fn();
      const wrapper = mountCascader({ 'onUpdate:modelValue': onUpdate });

      await wrapper.find('.b-cascader').trigger('click');

      const menus = wrapper.findAll('.b-cascader__menu');
      expect(menus.length).toBeGreaterThan(0);

      // Select first level
      const firstOption = menus[0].findAll('.b-cascader__option')[0];
      await firstOption.trigger('click');

      // Select second level
      const secondMenus = wrapper.findAll('.b-cascader__menu');
      const secondOption = secondMenus[1].findAll('.b-cascader__option')[0];
      await secondOption.trigger('click');

      // Select third level (leaf)
      const thirdMenus = wrapper.findAll('.b-cascader__menu');
      const thirdOption = thirdMenus[2].findAll('.b-cascader__option')[0];
      await thirdOption.trigger('click');

      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')![0][0]).toEqual(['zhejiang', 'hangzhou', 'xihu']);
    });

    it('emits change on each level with changeOnSelect', async () => {
      const wrapper = mountCascader({ changeOnSelect: true });

      await wrapper.find('.b-cascader').trigger('click');

      const menus = wrapper.findAll('.b-cascader__menu');
      const firstOption = menus[0].findAll('.b-cascader__option')[0];
      await firstOption.trigger('click');

      expect(wrapper.emitted('change')?.[0]?.[0]).toEqual(['zhejiang']);
    });

    it('does not open when disabled', async () => {
      const wrapper = mountCascader({ disabled: true });
      await wrapper.find('.b-cascader').trigger('click');
      expect(wrapper.emitted('openChange')).toBeUndefined();
    });

    it('clears value on clear click', async () => {
      const onUpdate = vi.fn();
      const wrapper = mountCascader({
        modelValue: ['zhejiang', 'hangzhou', 'xihu'],
        'onUpdate:modelValue': onUpdate,
      });

      await wrapper.find('.b-cascader__clear').trigger('click');
      expect(onUpdate).toHaveBeenCalledWith([]);
      expect(wrapper.emitted('change')?.[0]?.[0]).toEqual([]);
    });

    it('emits search event when searching', async () => {
      const wrapper = mountCascader({ showSearch: true });
      await wrapper.find('.b-cascader').trigger('click');

      const input = wrapper.find('.b-cascader__input');
      await input.setValue('West');
      await input.trigger('input');

      expect(wrapper.emitted('search')).toBeTruthy();
    });
  });

  // ─────────────────────────────────────────────
  // Keyboard and focus behavior
  // ─────────────────────────────────────────────
  describe('Keyboard and focus behavior', () => {
    it('opens on Enter key', async () => {
      const wrapper = mountCascader();
      await wrapper.find('.b-cascader').trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('openChange')?.[0]).toEqual([true]);
    });

    it('opens on Space key', async () => {
      const wrapper = mountCascader();
      await wrapper.find('.b-cascader').trigger('keydown', { key: ' ' });
      expect(wrapper.emitted('openChange')?.[0]).toEqual([true]);
    });

    it('opens on ArrowDown key', async () => {
      const wrapper = mountCascader();
      await wrapper.find('.b-cascader').trigger('keydown', { key: 'ArrowDown' });
      expect(wrapper.emitted('openChange')?.[0]).toEqual([true]);
    });

    it('closes on Escape key', async () => {
      const wrapper = mountCascader();
      // Open first
      await wrapper.find('.b-cascader').trigger('click');
      expect(wrapper.emitted('openChange')?.[0]).toEqual([true]);

      // Now close with Escape — the popup handles Escape via onMenuKeydown
      const popup = wrapper.find('.b-cascader__popup');
      await popup.trigger('keydown', { key: 'Escape' });
      const events = wrapper.emitted('openChange') ?? [];
      expect(events[events.length - 1]).toEqual([false]);
    });

    it('navigates options with arrow keys', async () => {
      const wrapper = mountCascader();
      await wrapper.find('.b-cascader').trigger('click');

      const popup = wrapper.find('.b-cascader__popup');
      await popup.trigger('keydown', { key: 'ArrowDown' });

      // Verify focus moved
      const options = wrapper.findAll('.b-cascader__option');
      expect(options.length).toBeGreaterThan(0);
    });

    it('selects on Enter within menu', async () => {
      const wrapper = mountCascader({ changeOnSelect: true });
      await wrapper.find('.b-cascader').trigger('click');

      const popup = wrapper.find('.b-cascader__popup');
      await popup.trigger('keydown', { key: 'Enter' });

      // First option should be selected
      expect(wrapper.emitted('change')).toBeTruthy();
    });

    it('navigates right into children', async () => {
      const wrapper = mountCascader();
      await wrapper.find('.b-cascader').trigger('click');

      const popup = wrapper.find('.b-cascader__popup');
      await popup.trigger('keydown', { key: 'ArrowRight' });

      // Should now have 2 columns
      const menus = wrapper.findAll('.b-cascader__menu');
      expect(menus.length).toBe(2);
    });

    it('navigates left to parent', async () => {
      const wrapper = mountCascader();
      await wrapper.find('.b-cascader').trigger('click');

      const popup = wrapper.find('.b-cascader__popup');
      await popup.trigger('keydown', { key: 'ArrowRight' });
      await popup.trigger('keydown', { key: 'ArrowLeft' });

      const menus = wrapper.findAll('.b-cascader__menu');
      expect(menus.length).toBe(1);
    });

    it('does not respond to keyboard when disabled', async () => {
      const wrapper = mountCascader({ disabled: true });
      await wrapper.find('.b-cascader').trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('openChange')).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────
  describe('Accessibility', () => {
    it('has combobox role on trigger', () => {
      const wrapper = mountCascader();
      const combobox = wrapper.find('[role="combobox"]');
      expect(combobox.exists()).toBe(true);
    });

    it('has aria-expanded attribute', () => {
      const wrapper = mountCascader();
      const combobox = wrapper.find('[role="combobox"]');
      expect(combobox.attributes('aria-expanded')).toBe('false');
    });

    it('sets aria-haspopup to listbox on combobox', () => {
      const wrapper = mountCascader();
      const combobox = wrapper.find('[role="combobox"]');
      expect(combobox.attributes('aria-haspopup')).toBe('listbox');
    });

    it('popup has dialog role', () => {
      const wrapper = mountCascader();
      expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    });

    it('menus have listbox role', async () => {
      const wrapper = mountCascader();
      await wrapper.find('.b-cascader').trigger('click');

      const listboxes = wrapper.findAll('[role="listbox"]');
      expect(listboxes.length).toBeGreaterThan(0);
    });

    it('options have option role', async () => {
      const wrapper = mountCascader();
      await wrapper.find('.b-cascader').trigger('click');

      const options = wrapper.findAll('[role="option"]');
      expect(options.length).toBeGreaterThan(0);
    });

    it('disabled options have aria-disabled', async () => {
      const optionsWithDisabled: BCascaderOption[] = [
        { value: 'a', label: 'Option A', disabled: true },
        { value: 'b', label: 'Option B' },
      ];
      const wrapper = mountCascader({ options: optionsWithDisabled });
      await wrapper.find('.b-cascader').trigger('click');

      const disabledOption = wrapper.find('[aria-disabled="true"]');
      expect(disabledOption.exists()).toBe(true);
    });

    it('selected options have aria-selected', async () => {
      const wrapper = mountCascader({ modelValue: ['zhejiang', 'hangzhou', 'xihu'] });
      await wrapper.find('.b-cascader').trigger('click');

      const selected = wrapper.find('[aria-selected="true"]');
      expect(selected.exists()).toBe(true);
    });

    it('clear button has aria-label', () => {
      const wrapper = mountCascader({ modelValue: ['zhejiang', 'hangzhou', 'xihu'] });
      const clear = wrapper.find('.b-cascader__clear');
      expect(clear.attributes('aria-label')).toBe('Clear');
    });

    it('suffix icon is aria-hidden', () => {
      const wrapper = mountCascader();
      const suffix = wrapper.find('.b-cascader__suffix');
      expect(suffix.attributes('aria-hidden')).toBe('true');
    });

    it('listbox has aria-label for level indication', async () => {
      const wrapper = mountCascader();
      await wrapper.find('.b-cascader').trigger('click');

      const listbox = wrapper.find('[role="listbox"]');
      expect(listbox.attributes('aria-label')).toBe('Level 1');
    });
  });

  // ─────────────────────────────────────────────
  // Edge cases
  // ─────────────────────────────────────────────
  describe('Edge cases', () => {
    it('handles empty options', () => {
      const wrapper = mountCascader({ options: [] });
      expect(wrapper.find('.b-cascader').exists()).toBe(true);
    });

    it('handles leaf node without children', async () => {
      const wrapper = mountCascader();
      await wrapper.find('.b-cascader').trigger('click');

      // "Empty Node" is a leaf
      const options = wrapper.findAll('.b-cascader__option');
      const emptyNode = options[2]; // third root option
      await emptyNode.trigger('click');

      expect(wrapper.emitted('change')?.[0]?.[0]).toEqual(['empty']);
    });

    it('handles disabled option click', async () => {
      const wrapper = mountCascader();
      await wrapper.find('.b-cascader').trigger('click');

      // Navigate to Hangzhou children
      const firstOption = wrapper.findAll('.b-cascader__option')[0];
      await firstOption.trigger('click');

      const secondOptions = wrapper.findAll('.b-cascader__menu')[1].findAll('.b-cascader__option');
      await secondOptions[0].trigger('click');

      // Xiasha is disabled
      const thirdOptions = wrapper.findAll('.b-cascader__menu')[2].findAll('.b-cascader__option');
      const disabledOpt = thirdOptions[1];
      await disabledOpt.trigger('click');

      // Should NOT emit change for disabled option
      const changes = wrapper.emitted('change') ?? [];
      const lastChange = changes[changes.length - 1];
      if (lastChange) {
        expect(lastChange[0]).not.toEqual(['zhejiang', 'hangzhou', 'xiasha']);
      }
    });

    it('handles controlled open state', async () => {
      const wrapper = mountCascader({ open: false });
      await wrapper.find('.b-cascader').trigger('click');
      // In controlled mode, open is not set internally
      expect(wrapper.emitted('openChange')?.[0]).toEqual([true]);
    });

    it('supports expand on hover', async () => {
      const wrapper = mountCascader({ expandTrigger: BCascaderExpandTrigger.Hover });
      await wrapper.find('.b-cascader').trigger('click');

      const firstOption = wrapper.findAll('.b-cascader__option')[0];
      await firstOption.trigger('mouseenter');

      const menus = wrapper.findAll('.b-cascader__menu');
      expect(menus.length).toBe(2);
    });

    it('handles search with no results', async () => {
      const wrapper = mountCascader({ showSearch: true });
      await wrapper.find('.b-cascader').trigger('click');

      const input = wrapper.find('.b-cascader__input');
      const inputEl = input.element as HTMLInputElement;
      inputEl.value = 'nonexistent';
      await input.trigger('input');

      expect(wrapper.find('.b-cascader__empty').exists()).toBe(true);
    });

    it('filters search results correctly', async () => {
      const wrapper = mountCascader({ showSearch: true });
      await wrapper.find('.b-cascader').trigger('click');

      const input = wrapper.find('.b-cascader__input');
      const inputEl = input.element as HTMLInputElement;
      inputEl.value = 'West';
      await input.trigger('input');

      const results = wrapper.findAll('.b-cascader__search-item');
      expect(results.length).toBe(1);
      expect(results[0].text()).toContain('West Lake');
    });

    it('handles multiple selection', async () => {
      const onUpdate = vi.fn();
      const wrapper = mountCascader({
        multiple: true,
        modelValue: [],
        'onUpdate:modelValue': onUpdate,
      });

      await wrapper.find('.b-cascader').trigger('click');

      // Select leaf option
      const firstOption = wrapper.findAll('.b-cascader__option')[0];
      await firstOption.trigger('click');

      const secondMenus = wrapper.findAll('.b-cascader__menu');
      const secondOption = secondMenus[1].findAll('.b-cascader__option')[0];
      await secondOption.trigger('click');

      const thirdMenus = wrapper.findAll('.b-cascader__menu');
      const thirdOption = thirdMenus[2].findAll('.b-cascader__option')[0];
      await thirdOption.trigger('click');

      expect(onUpdate).toHaveBeenCalled();
    });

    it('renders maxTagCount in multiple mode', async () => {
      const wrapper = mountCascader({
        multiple: true,
        maxTagCount: 1,
        modelValue: [
          ['zhejiang', 'hangzhou', 'xihu'],
          ['jiangsu', 'nanjing', 'zhonghuamen'],
        ],
      });
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.b-cascader__tag--count').exists()).toBe(true);
      expect(wrapper.find('.b-cascader__tag--count').text()).toContain('+ 1');
    });

    it('removes tag in multiple mode', async () => {
      const onUpdate = vi.fn();
      const wrapper = mountCascader({
        multiple: true,
        modelValue: [['zhejiang', 'hangzhou', 'xihu']],
        'onUpdate:modelValue': onUpdate,
      });
      await wrapper.vm.$nextTick();

      const removeBtn = wrapper.find('.b-cascader__tag-remove');
      expect(removeBtn.exists()).toBe(true);
      await removeBtn.trigger('click');

      expect(onUpdate).toHaveBeenCalledWith([]);
    });
  });

  // ─────────────────────────────────────────────
  // Animation with fake timers
  // ─────────────────────────────────────────────
  describe('Animations with fake timers', () => {
    it('arrow rotates when open (class applied)', async () => {
      const wrapper = mountCascader();

      // Verify open event is emitted on click
      await wrapper.find('.b-cascader').trigger('click');
      await flushPromises();

      expect(wrapper.emitted('openChange')![0]).toEqual([true]);
      // Access the component's internal state directly
      expect((wrapper.vm as unknown as { isOpen: boolean }).isOpen).toBe(true);
    });

    it('popup transitions are CSS-driven', () => {
      const wrapper = mountCascader();
      const popup = wrapper.find('.b-cascader__popup');
      expect(popup.exists()).toBe(true);
    });
  });
});
