import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BAutoComplete from './BAutoComplete.vue';
import { BAutoCompleteStatus, BAutoCompleteVariant } from './types';

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

function getInput(wrapper: VueWrapper) {
  return wrapper.find('input');
}

function getMenu(wrapper: VueWrapper) {
  return wrapper.find('[role="listbox"]');
}

function getOptions(wrapper: VueWrapper) {
  return wrapper.findAll('[role="option"]');
}

describe('BAutoComplete', () => {
  beforeEach(() => {
    stubPopoverAPI();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─────────────────────────────────────────────
  // Defaults & variants render
  // ─────────────────────────────────────────────
  describe('defaults and variants render', () => {
    it('renders with default props', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
      });
      expect(wrapper.find('.b-auto-complete').exists()).toBe(true);
      expect(getInput(wrapper).exists()).toBe(true);
      expect(getMenu(wrapper).exists()).toBe(true);
    });

    it('renders outlined variant by default', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
      });
      const input = getInput(wrapper);
      expect(input.classes()).toContain('b:rounded-lg');
    });

    it('renders filled variant', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '', variant: BAutoCompleteVariant.Filled },
      });
      const input = getInput(wrapper);
      expect(input.classes().join(' ')).toContain('b:bg-[var(--b-auto-complete-selector-bg)]');
    });

    it('renders borderless variant', () => {
      const wrapper = mount(BAutoComplete, {
        props: {
          options: defaultOptions,
          modelValue: '',
          variant: BAutoCompleteVariant.Borderless,
        },
      });
      const input = getInput(wrapper);
      expect(input.classes()).toContain('b:border-none');
    });

    it('applies small size classes', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '', size: 'sm' },
      });
      expect(getInput(wrapper).classes()).toContain('b:h-6');
    });

    it('applies medium size classes by default', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
      });
      expect(getInput(wrapper).classes()).toContain('b:h-8');
    });

    it('applies large size classes', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '', size: 'lg' },
      });
      expect(getInput(wrapper).classes()).toContain('b:h-10');
    });
  });

  // ─────────────────────────────────────────────
  // Props map to DOM and behavior
  // ─────────────────────────────────────────────
  describe('props map to DOM and behavior', () => {
    it('sets placeholder on input', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '', placeholder: 'Search...' },
      });
      expect(getInput(wrapper).attributes('placeholder')).toBe('Search...');
    });

    it('disables input when disabled prop is true', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '', disabled: true },
      });
      expect(getInput(wrapper).attributes('disabled')).toBeDefined();
      expect(wrapper.find('.b-auto-complete--disabled').exists()).toBe(true);
    });

    it('applies error status class', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '', status: BAutoCompleteStatus.Error },
      });
      expect(getInput(wrapper).classes().join(' ')).toContain('b:border-red-500!');
    });

    it('applies warning status class', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '', status: BAutoCompleteStatus.Warning },
      });
      expect(getInput(wrapper).classes().join(' ')).toContain('b:border-yellow-500!');
    });

    it('shows clear button when allowClear is true and input has value', async () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: 'test', allowClear: true },
      });
      expect(wrapper.find('.b-auto-complete__clear').exists()).toBe(true);
    });

    it('hides clear button when input is empty', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '', allowClear: true },
      });
      expect(wrapper.find('.b-auto-complete__clear').exists()).toBe(false);
    });

    it('hides clear button when disabled', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: 'test', allowClear: true, disabled: true },
      });
      expect(wrapper.find('.b-auto-complete__clear').exists()).toBe(false);
    });

    it('filters options based on input value with default filter', async () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      const input = getInput(wrapper);
      await input.setValue('app');
      await input.trigger('input');
      // Open the menu
      await input.trigger('focus');
      const opts = getOptions(wrapper);
      expect(opts.length).toBe(1);
      expect(opts[0].text()).toContain('Apple');
    });

    it('uses custom filter function when provided', async () => {
      const customFilter = (_input: string, option: { value: string }) =>
        option.value.startsWith('b');
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '', filterOption: customFilter },
        attachTo: document.body,
      });
      const input = getInput(wrapper);
      await input.setValue('anything');
      await input.trigger('input');
      await input.trigger('focus');
      const opts = getOptions(wrapper);
      expect(opts.length).toBe(1);
      expect(opts[0].text()).toContain('Banana');
    });

    it('shows all options when filterOption is false', async () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '', filterOption: false },
        attachTo: document.body,
      });
      const input = getInput(wrapper);
      await input.setValue('xyz');
      await input.trigger('input');
      await input.trigger('focus');
      expect(getOptions(wrapper).length).toBe(3);
    });
  });

  // ─────────────────────────────────────────────
  // Events
  // ─────────────────────────────────────────────
  describe('events', () => {
    it('emits change and search on input', async () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      const input = getInput(wrapper);
      await input.setValue('test');
      await input.trigger('input');
      expect(wrapper.emitted('change')?.[0]).toEqual(['test']);
      expect(wrapper.emitted('search')?.[0]).toEqual(['test']);
    });

    it('emits select and change when an option is selected', async () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      const input = getInput(wrapper);
      await input.trigger('focus');
      const opts = getOptions(wrapper);
      await opts[1].trigger('mousedown');
      expect(wrapper.emitted('select')?.[0]).toEqual(['banana', defaultOptions[1]]);
      expect(wrapper.emitted('change')).toBeTruthy();
    });

    it('emits clear when clear button is clicked', async () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: 'apple', allowClear: true },
        attachTo: document.body,
      });
      await wrapper.find('.b-auto-complete__clear').trigger('mousedown');
      expect(wrapper.emitted('clear')).toBeTruthy();
      expect(wrapper.emitted('change')?.[0]).toEqual(['']);
    });

    it('emits focus on input focus', async () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await getInput(wrapper).trigger('focus');
      expect(wrapper.emitted('focus')).toBeTruthy();
    });

    it('emits openChange when dropdown opens', async () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await getInput(wrapper).trigger('focus');
      expect(wrapper.emitted('openChange')?.[0]).toEqual([true]);
    });

    it('emits inputKeyDown on keydown', async () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await getInput(wrapper).trigger('keydown', { key: 'a' });
      expect(wrapper.emitted('inputKeyDown')).toBeTruthy();
    });
  });

  // ─────────────────────────────────────────────
  // Keyboard and focus behavior
  // ─────────────────────────────────────────────
  describe('keyboard and focus behavior', () => {
    it('opens dropdown on ArrowDown when closed', async () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await getInput(wrapper).trigger('keydown', { key: 'ArrowDown' });
      expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
    });

    it('navigates down through options with ArrowDown', async () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await getInput(wrapper).trigger('focus');
      await getInput(wrapper).trigger('keydown', { key: 'ArrowDown' });
      const activeOpt = wrapper.find('[data-active="true"]');
      expect(activeOpt.exists()).toBe(true);
    });

    it('navigates up through options with ArrowUp', async () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await getInput(wrapper).trigger('focus');
      await getInput(wrapper).trigger('keydown', { key: 'ArrowDown' });
      await getInput(wrapper).trigger('keydown', { key: 'ArrowDown' });
      await getInput(wrapper).trigger('keydown', { key: 'ArrowUp' });
      const activeOpts = wrapper.findAll('[data-active="true"]');
      expect(activeOpts.length).toBe(1);
    });

    it('selects the active option on Enter', async () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await getInput(wrapper).trigger('focus');
      await getInput(wrapper).trigger('keydown', { key: 'ArrowDown' });
      await getInput(wrapper).trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('select')).toBeTruthy();
    });

    it('closes dropdown on Escape', async () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await getInput(wrapper).trigger('focus');
      await getInput(wrapper).trigger('keydown', { key: 'Escape' });
      expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
    });

    it('backfills input with active option value when backfill is true', async () => {
      const wrapper = mount(BAutoComplete, {
        props: {
          options: defaultOptions,
          modelValue: '',
          backfill: true,
          defaultActiveFirstOption: false,
        },
        attachTo: document.body,
      });
      await getInput(wrapper).trigger('focus');
      await getInput(wrapper).trigger('keydown', { key: 'ArrowDown' });
      expect((getInput(wrapper).element as HTMLInputElement).value).toBe('apple');
    });

    it('skips disabled options during keyboard navigation', async () => {
      const options = [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b', disabled: true },
        { label: 'C', value: 'c' },
      ];
      const wrapper = mount(BAutoComplete, {
        props: { options, modelValue: '', backfill: true },
        attachTo: document.body,
      });
      await getInput(wrapper).trigger('focus');
      await getInput(wrapper).trigger('keydown', { key: 'ArrowDown' });
      await getInput(wrapper).trigger('keydown', { key: 'ArrowDown' });
      expect((getInput(wrapper).element as HTMLInputElement).value).toBe('c');
    });
  });

  // ─────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────
  describe('accessibility', () => {
    it('has combobox role on input', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
      });
      expect(getInput(wrapper).attributes('role')).toBe('combobox');
    });

    it('has listbox role on dropdown', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
      });
      expect(getMenu(wrapper).attributes('role')).toBe('listbox');
    });

    it('options have role="option"', async () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await getInput(wrapper).trigger('focus');
      const opts = getOptions(wrapper);
      expect(opts.length).toBe(3);
      opts.forEach((opt) => {
        expect(opt.attributes('role')).toBe('option');
      });
    });

    it('sets aria-expanded based on dropdown state', async () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      expect(getInput(wrapper).attributes('aria-expanded')).toBe('false');
      await getInput(wrapper).trigger('focus');
      expect(getInput(wrapper).attributes('aria-expanded')).toBe('true');
    });

    it('sets aria-activedescendant when navigating', async () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await getInput(wrapper).trigger('focus');
      await getInput(wrapper).trigger('keydown', { key: 'ArrowDown' });
      const input = getInput(wrapper);
      expect(input.attributes('aria-activedescendant')).toBeDefined();
      expect(input.attributes('aria-activedescendant')).toContain('option-');
    });

    it('has aria-autocomplete="list"', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
      });
      expect(getInput(wrapper).attributes('aria-autocomplete')).toBe('list');
    });

    it('has aria-haspopup="listbox"', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
      });
      expect(getInput(wrapper).attributes('aria-haspopup')).toBe('listbox');
    });

    it('sets aria-disabled on disabled options', async () => {
      const options = [
        { label: 'A', value: 'a', disabled: true },
        { label: 'B', value: 'b' },
      ];
      const wrapper = mount(BAutoComplete, {
        props: { options, modelValue: '', filterOption: false },
        attachTo: document.body,
      });
      await getInput(wrapper).trigger('focus');
      const opts = getOptions(wrapper);
      expect(opts[0].attributes('aria-disabled')).toBe('true');
      expect(opts[1].attributes('aria-disabled')).toBe('false');
    });

    it('sets aria-selected on selected option', async () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: 'banana', filterOption: false },
        attachTo: document.body,
      });
      await getInput(wrapper).trigger('focus');
      const opts = getOptions(wrapper);
      expect(opts[1].attributes('aria-selected')).toBe('true');
    });

    it('clear button has aria-label', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: 'test', allowClear: true },
      });
      expect(wrapper.find('.b-auto-complete__clear').attributes('aria-label')).toBe('Clear input');
    });
  });

  // ─────────────────────────────────────────────
  // Edge cases
  // ─────────────────────────────────────────────
  describe('edge cases', () => {
    it('handles empty options array', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: [], modelValue: '' },
      });
      expect(wrapper.find('.b-auto-complete').exists()).toBe(true);
      expect(getOptions(wrapper).length).toBe(0);
    });

    it('handles controlled v-model updates', async () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
      });
      await wrapper.setProps({ modelValue: 'cherry' });
      expect((getInput(wrapper).element as HTMLInputElement).value).toBe('cherry');
    });

    it('does not select disabled options on click', async () => {
      const options = [
        { label: 'A', value: 'a', disabled: true },
        { label: 'B', value: 'b' },
      ];
      const wrapper = mount(BAutoComplete, {
        props: { options, modelValue: '' },
        attachTo: document.body,
      });
      await getInput(wrapper).trigger('focus');
      await getOptions(wrapper)[0].trigger('mousedown');
      expect(wrapper.emitted('select')).toBeFalsy();
    });

    it('options without label use value as display text', async () => {
      const options = [{ value: 'rawvalue' }];
      const wrapper = mount(BAutoComplete, {
        props: { options, modelValue: '' },
        attachTo: document.body,
      });
      await getInput(wrapper).trigger('focus');
      expect(getOptions(wrapper)[0].text()).toContain('rawvalue');
    });

    it('exposes focus and blur methods', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      expect(typeof wrapper.vm.focus).toBe('function');
      expect(typeof wrapper.vm.blur).toBe('function');
    });

    it('wraps around when navigating past the last option', async () => {
      const wrapper = mount(BAutoComplete, {
        props: {
          options: defaultOptions,
          modelValue: '',
          backfill: true,
          defaultActiveFirstOption: false,
        },
        attachTo: document.body,
      });
      await getInput(wrapper).trigger('focus');
      // Navigate from -1: ArrowDown -> 0 (apple), -> 1 (banana), -> 2 (cherry), -> 0 (wrap to apple)
      await getInput(wrapper).trigger('keydown', { key: 'ArrowDown' });
      await getInput(wrapper).trigger('keydown', { key: 'ArrowDown' });
      await getInput(wrapper).trigger('keydown', { key: 'ArrowDown' });
      await getInput(wrapper).trigger('keydown', { key: 'ArrowDown' });
      expect((getInput(wrapper).element as HTMLInputElement).value).toBe('apple');
    });
  });

  // ─────────────────────────────────────────────
  // Animation with fake timers
  // ─────────────────────────────────────────────
  describe('animations (fake timers)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('uses CSS transitions for dropdown animation (no JS timers needed)', () => {
      const wrapper = mount(BAutoComplete, {
        props: { options: defaultOptions, modelValue: '' },
      });
      const dropdown = getMenu(wrapper);
      expect(dropdown.classes()).toContain('b-auto-complete__dropdown');
    });
  });
});
