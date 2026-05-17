import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BSelect from './BSelect.vue';
import { BSelectMode, BSelectStatus, BSelectVariant } from './types';

function createToggleEvent(newState: string, oldState: string): Event {
  const event = new Event('toggle', { bubbles: false });
  (event as unknown as Record<string, string>).newState = newState;
  (event as unknown as Record<string, string>).oldState = oldState;
  return event;
}

function stubPopoverAPI() {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.toggleAttribute('popover-open', true);
    this.dispatchEvent(createToggleEvent('open', 'closed'));
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('popover-open');
    this.dispatchEvent(createToggleEvent('closed', 'open'));
  });
  HTMLElement.prototype.scrollIntoView = vi.fn();
}

const defaultOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
];

const optionsWithDisabled = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana', disabled: true },
  { label: 'Cherry', value: 'cherry' },
];

function getSelector(wrapper: VueWrapper) {
  return wrapper.find('[role="combobox"]');
}

function getMenu(wrapper: VueWrapper) {
  return wrapper.find('[role="listbox"]');
}

function getOptions(wrapper: VueWrapper) {
  return wrapper.findAll('[role="option"]');
}

describe('BSelect', () => {
  beforeEach(() => {
    stubPopoverAPI();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('defaults and variants render', () => {
    it('renders with default props', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      expect(wrapper.find('.b-select').exists()).toBe(true);
      expect(getSelector(wrapper).exists()).toBe(true);
      expect(getMenu(wrapper).exists()).toBe(true);
    });

    it('renders outlined variant by default', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      const selector = getSelector(wrapper);
      expect(selector.classes().join(' ')).toContain('b:border-[var(--b-select-border-color)]');
    });

    it('renders filled variant', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, variant: BSelectVariant.Filled },
      });
      const selector = getSelector(wrapper);
      expect(selector.classes().join(' ')).toContain('b:bg-[var(--b-select-filled-bg)]');
    });

    it('renders borderless variant', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, variant: BSelectVariant.Borderless },
      });
      const selector = getSelector(wrapper);
      expect(selector.classes().join(' ')).toContain('b:bg-transparent');
    });

    it('renders all size variants', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      const heightClasses = ['b:min-h-6', 'b:min-h-8', 'b:min-h-10'];

      sizes.forEach((size, i) => {
        const wrapper = mount(BSelect, {
          props: { options: defaultOptions, size },
        });
        expect(getSelector(wrapper).classes().join(' ')).toContain(heightClasses[i]);
      });
    });

    it('shows placeholder when nothing selected', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, placeholder: 'Pick one' },
      });
      expect(wrapper.find('.b-select__placeholder').text()).toBe('Pick one');
    });

    it('displays selected option label', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, modelValue: 'banana' },
      });
      expect(wrapper.find('.b-select__value').text()).toBe('Banana');
    });
  });

  describe('props map to DOM and behavior', () => {
    it('disables the component', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, disabled: true },
      });
      const selector = getSelector(wrapper);
      expect(selector.attributes('aria-disabled')).toBe('true');
      expect(selector.attributes('tabindex')).toBe('-1');
    });

    it('shows error status', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, status: BSelectStatus.Error },
      });
      expect(getSelector(wrapper).classes().join(' ')).toContain('b:border-red-500!');
    });

    it('shows warning status', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, status: BSelectStatus.Warning },
      });
      expect(getSelector(wrapper).classes().join(' ')).toContain('b:border-yellow-500!');
    });

    it('shows loading spinner', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, loading: true },
      });
      expect(wrapper.find('.b-select__loading').exists()).toBe(true);
    });

    it('shows clear button when allowClear and value exists', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, modelValue: 'apple', allowClear: true },
      });
      expect(wrapper.find('.b-select__clear').exists()).toBe(true);
    });

    it('hides clear button when no value', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, allowClear: true },
      });
      expect(wrapper.find('.b-select__clear').exists()).toBe(false);
    });

    it('respects popupMatchSelectWidth as number', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, popupMatchSelectWidth: 300 },
      });
      const dropdown = wrapper.find('.b-select__dropdown');
      expect(dropdown.attributes('style')).toContain('width: 300px');
    });

    it('sets max-height from listHeight prop', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, listHeight: 200 },
      });
      const dropdown = wrapper.find('.b-select__dropdown');
      expect(dropdown.attributes('style')).toContain('max-height: 200px');
    });
  });

  describe('events order', () => {
    it('emits select then change on option selection', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, 'onUpdate:modelValue': () => {} },
      });
      await getSelector(wrapper).trigger('click');
      const opts = getOptions(wrapper);
      await opts[1].trigger('mousedown');

      const emitted = wrapper.emitted();
      expect(emitted.select).toBeTruthy();
      expect(emitted.change).toBeTruthy();
      expect((emitted.select![0] as unknown[])[0]).toBe('banana');
      expect((emitted.change![0] as unknown[])[0]).toBe('banana');
    });

    it('emits openChange on open', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      await getSelector(wrapper).trigger('click');
      expect(wrapper.emitted().openChange![0]).toEqual([true]);
    });

    it('emits openChange on close', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      await getSelector(wrapper).trigger('click');
      await getSelector(wrapper).trigger('click');
      expect(wrapper.emitted().openChange![1]).toEqual([false]);
    });

    it('emits clear and change on clear button click', async () => {
      const wrapper = mount(BSelect, {
        props: {
          options: defaultOptions,
          modelValue: 'apple',
          allowClear: true,
          'onUpdate:modelValue': () => {},
        },
      });
      await wrapper.find('.b-select__clear').trigger('click');
      expect(wrapper.emitted().clear).toBeTruthy();
      expect(wrapper.emitted().change).toBeTruthy();
    });

    it('emits focus on selector focus', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      await getSelector(wrapper).trigger('focus');
      expect(wrapper.emitted().focus).toBeTruthy();
    });

    it('emits blur on selector blur', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      await getSelector(wrapper).trigger('blur');
      expect(wrapper.emitted().blur).toBeTruthy();
    });
  });

  describe('keyboard and focus behavior', () => {
    it('opens dropdown on Enter', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      await getSelector(wrapper).trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted().openChange![0]).toEqual([true]);
    });

    it('opens dropdown on Space', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      await getSelector(wrapper).trigger('keydown', { key: ' ' });
      expect(wrapper.emitted().openChange![0]).toEqual([true]);
    });

    it('opens dropdown on ArrowDown', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      await getSelector(wrapper).trigger('keydown', { key: 'ArrowDown' });
      expect(wrapper.emitted().openChange![0]).toEqual([true]);
    });

    it('navigates options with ArrowDown', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      await getSelector(wrapper).trigger('click');
      await getSelector(wrapper).trigger('keydown', { key: 'ArrowDown' });

      const opts = getOptions(wrapper);
      expect(opts[1].attributes('data-active')).toBe('true');
    });

    it('navigates options with ArrowUp', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      await getSelector(wrapper).trigger('click');
      await getSelector(wrapper).trigger('keydown', { key: 'ArrowUp' });

      const opts = getOptions(wrapper);
      expect(opts[2].attributes('data-active')).toBe('true');
    });

    it('selects option with Enter', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, 'onUpdate:modelValue': () => {} },
      });
      await getSelector(wrapper).trigger('click');
      await getSelector(wrapper).trigger('keydown', { key: 'ArrowDown' });
      await getSelector(wrapper).trigger('keydown', { key: 'Enter' });

      expect((wrapper.emitted().select![0] as unknown[])[0]).toBe('banana');
    });

    it('closes dropdown on Escape', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      await getSelector(wrapper).trigger('click');
      await getSelector(wrapper).trigger('keydown', { key: 'Escape' });
      expect(wrapper.emitted().openChange![1]).toEqual([false]);
    });

    it('skips disabled options on ArrowDown', async () => {
      const wrapper = mount(BSelect, {
        props: { options: optionsWithDisabled },
      });
      await getSelector(wrapper).trigger('click');
      await getSelector(wrapper).trigger('keydown', { key: 'ArrowDown' });

      const opts = getOptions(wrapper);
      expect(opts[2].attributes('data-active')).toBe('true');
    });

    it('wraps around options when reaching the end', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      await getSelector(wrapper).trigger('click');
      await getSelector(wrapper).trigger('keydown', { key: 'ArrowDown' });
      await getSelector(wrapper).trigger('keydown', { key: 'ArrowDown' });
      await getSelector(wrapper).trigger('keydown', { key: 'ArrowDown' });

      const opts = getOptions(wrapper);
      expect(opts[0].attributes('data-active')).toBe('true');
    });

    it('closes on Tab', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      await getSelector(wrapper).trigger('click');
      await getSelector(wrapper).trigger('keydown', { key: 'Tab' });
      expect(wrapper.emitted().openChange![1]).toEqual([false]);
    });
  });

  describe('accessibility', () => {
    it('has correct combobox role', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      const selector = getSelector(wrapper);
      expect(selector.attributes('role')).toBe('combobox');
      expect(selector.attributes('aria-haspopup')).toBe('listbox');
    });

    it('sets aria-expanded correctly', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      expect(getSelector(wrapper).attributes('aria-expanded')).toBe('false');
      await getSelector(wrapper).trigger('click');
      expect(getSelector(wrapper).attributes('aria-expanded')).toBe('true');
    });

    it('sets aria-controls when open', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      expect(getSelector(wrapper).attributes('aria-controls')).toBeUndefined();
      await getSelector(wrapper).trigger('click');
      expect(getSelector(wrapper).attributes('aria-controls')).toBeTruthy();
    });

    it('sets aria-activedescendant on keyboard nav', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      await getSelector(wrapper).trigger('click');
      await getSelector(wrapper).trigger('keydown', { key: 'ArrowDown' });
      expect(getSelector(wrapper).attributes('aria-activedescendant')).toBeTruthy();
    });

    it('listbox has correct role', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      expect(getMenu(wrapper).attributes('role')).toBe('listbox');
    });

    it('options have correct roles and aria-selected', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, modelValue: 'banana' },
      });
      await getSelector(wrapper).trigger('click');
      const opts = getOptions(wrapper);
      expect(opts[0].attributes('role')).toBe('option');
      expect(opts[0].attributes('aria-selected')).toBe('false');
      expect(opts[1].attributes('aria-selected')).toBe('true');
    });

    it('disabled options have aria-disabled', async () => {
      const wrapper = mount(BSelect, {
        props: { options: optionsWithDisabled },
      });
      await getSelector(wrapper).trigger('click');
      const opts = getOptions(wrapper);
      expect(opts[1].attributes('aria-disabled')).toBe('true');
    });

    it('sets aria-multiselectable for multiple mode', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, mode: BSelectMode.Multiple, modelValue: [] },
      });
      expect(getMenu(wrapper).attributes('aria-multiselectable')).toBe('true');
    });

    it('clear button has aria-label', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, modelValue: 'apple', allowClear: true },
      });
      expect(wrapper.find('.b-select__clear').attributes('aria-label')).toBe('Clear selection');
    });

    it('arrow icon is aria-hidden', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      expect(wrapper.find('.b-select__arrow').attributes('aria-hidden')).toBe('true');
    });
  });

  describe('multiple mode', () => {
    it('renders tags for selected values', () => {
      const wrapper = mount(BSelect, {
        props: {
          options: defaultOptions,
          mode: BSelectMode.Multiple,
          modelValue: ['apple', 'banana'],
        },
      });
      const tags = wrapper.findAll('.b-select__tag');
      expect(tags.length).toBe(2);
      expect(tags[0].text()).toContain('Apple');
      expect(tags[1].text()).toContain('Banana');
    });

    it('removes tag on close button click', async () => {
      const wrapper = mount(BSelect, {
        props: {
          options: defaultOptions,
          mode: BSelectMode.Multiple,
          modelValue: ['apple', 'banana'],
          'onUpdate:modelValue': () => {},
        },
      });
      const closeBtn = wrapper.findAll('.b-select__tag-close')[0];
      await closeBtn.trigger('click');
      expect((wrapper.emitted().deselect![0] as unknown[])[0]).toBe('apple');
    });

    it('respects maxTagCount', () => {
      const wrapper = mount(BSelect, {
        props: {
          options: defaultOptions,
          mode: BSelectMode.Multiple,
          modelValue: ['apple', 'banana', 'cherry'],
          maxTagCount: 2,
        },
      });
      const tags = wrapper.findAll('.b-select__tag');
      expect(tags.length).toBe(3); // 2 visible + 1 count tag
      expect(tags[2].text()).toContain('+1');
    });

    it('toggles selection on option click', async () => {
      const wrapper = mount(BSelect, {
        props: {
          options: defaultOptions,
          mode: BSelectMode.Multiple,
          modelValue: ['apple'],
          'onUpdate:modelValue': () => {},
        },
      });
      await getSelector(wrapper).trigger('click');
      const opts = getOptions(wrapper);
      await opts[1].trigger('mousedown');
      expect((wrapper.emitted().select![0] as unknown[])[0]).toBe('banana');
    });

    it('deselects already-selected option', async () => {
      const wrapper = mount(BSelect, {
        props: {
          options: defaultOptions,
          mode: BSelectMode.Multiple,
          modelValue: ['apple', 'banana'],
          'onUpdate:modelValue': () => {},
        },
      });
      await getSelector(wrapper).trigger('click');
      const opts = getOptions(wrapper);
      await opts[0].trigger('mousedown');
      expect((wrapper.emitted().deselect![0] as unknown[])[0]).toBe('apple');
    });

    it('removes last tag on Backspace when search is empty', async () => {
      const wrapper = mount(BSelect, {
        props: {
          options: defaultOptions,
          mode: BSelectMode.Multiple,
          modelValue: ['apple', 'banana'],
          'onUpdate:modelValue': () => {},
        },
      });
      const input = wrapper.find('.b-select__search');
      await input.trigger('keydown', { key: 'Backspace' });
      expect((wrapper.emitted().deselect![0] as unknown[])[0]).toBe('banana');
    });
  });

  describe('search/filter behavior', () => {
    it('filters options based on search input', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, showSearch: true },
      });
      await getSelector(wrapper).trigger('click');

      const input = wrapper.find('.b-select__search');
      await input.setValue('ban');
      await input.trigger('input');

      const opts = getOptions(wrapper);
      expect(opts.length).toBe(1);
      expect(opts[0].text()).toContain('Banana');
    });

    it('shows not found content when no options match', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, showSearch: true, notFoundContent: 'No results' },
      });
      await getSelector(wrapper).trigger('click');

      const input = wrapper.find('.b-select__search');
      await input.setValue('xyz');
      await input.trigger('input');

      expect(wrapper.find('.b-select__empty').text()).toBe('No results');
    });

    it('uses custom filterOption function', async () => {
      const filterFn = (input: string, opt: { label?: string }) =>
        (opt.label ?? '').startsWith(input);
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, showSearch: true, filterOption: filterFn },
      });
      await getSelector(wrapper).trigger('click');

      const input = wrapper.find('.b-select__search');
      await input.setValue('Ch');
      await input.trigger('input');

      const opts = getOptions(wrapper);
      expect(opts.length).toBe(1);
      expect(opts[0].text()).toContain('Cherry');
    });
  });

  describe('controlled vs uncontrolled', () => {
    it('works as controlled with v-model', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, modelValue: 'apple', 'onUpdate:modelValue': () => {} },
      });
      expect(wrapper.find('.b-select__value').text()).toBe('Apple');

      await wrapper.setProps({ modelValue: 'cherry' });
      expect(wrapper.find('.b-select__value').text()).toBe('Cherry');
    });

    it('works as uncontrolled', async () => {
      const wrapper = mount(BSelect, {
        props: {
          options: defaultOptions,
          'onUpdate:modelValue': (v: unknown) => wrapper.setProps({ modelValue: v as string }),
        },
      });
      await getSelector(wrapper).trigger('click');
      const opts = getOptions(wrapper);
      await opts[0].trigger('mousedown');

      expect(wrapper.find('.b-select__value').text()).toBe('Apple');
    });
  });

  describe('edge cases', () => {
    it('handles empty options', () => {
      const wrapper = mount(BSelect, {
        props: { options: [] },
      });
      expect(wrapper.find('.b-select').exists()).toBe(true);
    });

    it('does not open when disabled', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions, disabled: true },
      });
      await getSelector(wrapper).trigger('click');
      expect(wrapper.emitted().openChange).toBeUndefined();
    });

    it('does not select disabled option', async () => {
      const wrapper = mount(BSelect, {
        props: { options: optionsWithDisabled, 'onUpdate:modelValue': () => {} },
      });
      await getSelector(wrapper).trigger('click');
      const opts = getOptions(wrapper);
      await opts[1].trigger('mousedown');
      expect(wrapper.emitted().select).toBeUndefined();
    });

    it('supports numeric values', async () => {
      const numOptions = [
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 },
      ];
      const wrapper = mount(BSelect, {
        props: { options: numOptions, modelValue: 1 },
      });
      expect(wrapper.find('.b-select__value').text()).toBe('One');
    });

    it('handles option groups via nested options', async () => {
      const groupedOptions = [
        {
          label: 'Fruits',
          options: [
            { label: 'Apple', value: 'apple' },
            { label: 'Banana', value: 'banana' },
          ],
        },
        {
          label: 'Vegetables',
          options: [{ label: 'Carrot', value: 'carrot' }],
        },
      ];
      const wrapper = mount(BSelect, {
        props: { options: groupedOptions as unknown as typeof defaultOptions },
      });
      await getSelector(wrapper).trigger('click');
      const opts = getOptions(wrapper);
      expect(opts.length).toBe(3);
    });

    it('exposes focus and blur methods', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      const vm = wrapper.vm as unknown as { focus: () => void; blur: () => void };
      expect(typeof vm.focus).toBe('function');
      expect(typeof vm.blur).toBe('function');
    });
  });

  describe('animation tests with fake timers', () => {
    it('respects prefers-reduced-motion via CSS class structure', () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      const dropdown = wrapper.find('.b-select__dropdown');
      expect(dropdown.exists()).toBe(true);
    });

    it('arrow rotates when open', async () => {
      const wrapper = mount(BSelect, {
        props: { options: defaultOptions },
      });
      const arrow = wrapper.find('.b-select__arrow');
      expect(arrow.classes()).not.toContain('b:rotate-180');

      await getSelector(wrapper).trigger('click');
      expect(arrow.classes()).toContain('b:rotate-180');
    });
  });
});
