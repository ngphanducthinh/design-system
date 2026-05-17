import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BMentions from './BMentions.vue';
import { BMentionsStatus, BMentionsVariant } from './types';

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
  { label: 'Alice', value: 'alice' },
  { label: 'Bob', value: 'bob' },
  { label: 'Charlie', value: 'charlie' },
];

function getTextarea(wrapper: VueWrapper) {
  return wrapper.find('textarea');
}

function getMenu(wrapper: VueWrapper) {
  return wrapper.find('[role="listbox"]');
}

function getOptions(wrapper: VueWrapper) {
  return wrapper.findAll('[role="option"]');
}

async function triggerMentionInput(wrapper: VueWrapper, value: string) {
  const textarea = getTextarea(wrapper);
  const el = textarea.element as HTMLTextAreaElement;
  el.value = value;
  el.selectionStart = value.length;
  el.selectionEnd = value.length;
  await textarea.trigger('input');
}

describe('BMentions', () => {
  beforeEach(() => {
    stubPopoverAPI();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('defaults and variants render', () => {
    it('renders with default props', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
      });
      expect(wrapper.find('.b-mentions').exists()).toBe(true);
      expect(getTextarea(wrapper).exists()).toBe(true);
      expect(wrapper.find('.b-mentions__dropdown').exists()).toBe(false);
    });

    it('renders outlined variant by default', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
      });
      expect(wrapper.find('.b-mentions--outlined').exists()).toBe(true);
    });

    it('renders filled variant', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '', variant: BMentionsVariant.Filled },
      });
      expect(wrapper.find('.b-mentions--filled').exists()).toBe(true);
    });

    it('renders borderless variant', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '', variant: BMentionsVariant.Borderless },
      });
      expect(wrapper.find('.b-mentions--borderless').exists()).toBe(true);
    });

    it('applies small size class', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '', size: 'sm' },
      });
      expect(wrapper.find('.b-mentions--sm').exists()).toBe(true);
    });

    it('applies medium size class by default', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
      });
      expect(wrapper.find('.b-mentions--md').exists()).toBe(true);
    });

    it('applies large size class', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '', size: 'lg' },
      });
      expect(wrapper.find('.b-mentions--lg').exists()).toBe(true);
    });
  });

  describe('props map to DOM and behavior', () => {
    it('sets placeholder on textarea', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '', placeholder: 'Type @ to mention...' },
      });
      expect(getTextarea(wrapper).attributes('placeholder')).toBe('Type @ to mention...');
    });

    it('disables textarea when disabled prop is true', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '', disabled: true },
      });
      expect(getTextarea(wrapper).attributes('disabled')).toBeDefined();
      expect(wrapper.find('.b-mentions--disabled').exists()).toBe(true);
    });

    it('sets readonly attribute', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '', readOnly: true },
      });
      expect(getTextarea(wrapper).attributes('readonly')).toBeDefined();
    });

    it('applies error status class', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '', status: BMentionsStatus.Error },
      });
      expect(wrapper.find('.b-mentions--error').exists()).toBe(true);
    });

    it('applies warning status class', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '', status: BMentionsStatus.Warning },
      });
      expect(wrapper.find('.b-mentions--warning').exists()).toBe(true);
    });

    it('shows clear button when allowClear is true and input has value', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: 'hello', allowClear: true },
      });
      expect(wrapper.find('.b-mentions__clear').exists()).toBe(true);
    });

    it('hides clear button when input is empty', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '', allowClear: true },
      });
      expect(wrapper.find('.b-mentions__clear').exists()).toBe(false);
    });

    it('hides clear button when disabled', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: 'test', allowClear: true, disabled: true },
      });
      expect(wrapper.find('.b-mentions__clear').exists()).toBe(false);
    });

    it('sets rows attribute on textarea', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '', rows: 5 },
      });
      expect(getTextarea(wrapper).attributes('rows')).toBe('5');
    });

    it('opens dropdown when prefix character is typed', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@');
      expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
    });

    it('filters options based on text after prefix', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@al');
      const opts = getOptions(wrapper);
      expect(opts.length).toBe(1);
      expect(opts[0].text()).toContain('Alice');
    });

    it('supports custom prefix characters', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '', prefix: '#' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '#');
      expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
    });

    it('supports multiple prefix characters', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '', prefix: ['@', '#'] },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '#');
      expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
    });

    it('uses custom filter function when provided', async () => {
      const customFilter = (_search: string, option: { value: string }) =>
        option.value.startsWith('b');
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '', filterOption: customFilter },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@anything');
      const opts = getOptions(wrapper);
      expect(opts.length).toBe(1);
      expect(opts[0].text()).toContain('Bob');
    });

    it('shows all options when filterOption is false', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '', filterOption: false },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@xyz');
      expect(getOptions(wrapper).length).toBe(3);
    });

    it('shows notFoundContent when no options match', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '', notFoundContent: 'No results' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@zzz');
      expect(wrapper.find('.b-mentions__not-found').exists()).toBe(true);
      expect(wrapper.find('.b-mentions__not-found').text()).toBe('No results');
    });

    it('hides dropdown when notFoundContent is null and no matches', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '', notFoundContent: null },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@zzz');
      expect(getOptions(wrapper).length).toBe(0);
    });
  });

  describe('events', () => {
    it('emits change on input', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, 'hello');
      expect(wrapper.emitted('change')?.[0]).toEqual(['hello']);
    });

    it('emits search when prefix is detected', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@al');
      expect(wrapper.emitted('search')?.[0]).toEqual(['al', '@']);
    });

    it('emits select when an option is chosen', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@');
      const opts = getOptions(wrapper);
      await opts[1].trigger('mousedown');
      expect(wrapper.emitted('select')?.[0]).toEqual([defaultOptions[1], '@']);
    });

    it('emits clear when clear button is clicked', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: 'hello @alice', allowClear: true },
        attachTo: document.body,
      });
      await wrapper.find('.b-mentions__clear').trigger('mousedown');
      expect(wrapper.emitted('clear')).toBeTruthy();
      expect(wrapper.emitted('change')?.[0]).toEqual(['']);
    });

    it('emits focus on textarea focus', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await getTextarea(wrapper).trigger('focus');
      expect(wrapper.emitted('focus')).toBeTruthy();
    });

    it('emits blur on textarea blur', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await getTextarea(wrapper).trigger('focus');
      await getTextarea(wrapper).trigger('blur');
      expect(wrapper.emitted('blur')).toBeTruthy();
    });
  });

  describe('keyboard and focus behavior', () => {
    it('navigates down through options with ArrowDown', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@');
      await getTextarea(wrapper).trigger('keydown', { key: 'ArrowDown' });
      const activeOpt = wrapper.find('[data-active="true"]');
      expect(activeOpt.exists()).toBe(true);
    });

    it('navigates up through options with ArrowUp', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@');
      await getTextarea(wrapper).trigger('keydown', { key: 'ArrowDown' });
      await getTextarea(wrapper).trigger('keydown', { key: 'ArrowDown' });
      await getTextarea(wrapper).trigger('keydown', { key: 'ArrowUp' });
      const activeOpts = wrapper.findAll('[data-active="true"]');
      expect(activeOpts.length).toBe(1);
    });

    it('selects the active option on Enter', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@');
      await getTextarea(wrapper).trigger('keydown', { key: 'ArrowDown' });
      await getTextarea(wrapper).trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('select')).toBeTruthy();
    });

    it('closes dropdown on Escape', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@');
      await getTextarea(wrapper).trigger('keydown', { key: 'Escape' });
      expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
    });

    it('skips disabled options during keyboard navigation', async () => {
      const options = [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b', disabled: true },
        { label: 'C', value: 'c' },
      ];
      const wrapper = mount(BMentions, {
        props: { options, modelValue: '', filterOption: false },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@');
      // activeIndex starts at 0 (A) when dropdown opens
      await getTextarea(wrapper).trigger('keydown', { key: 'ArrowDown' });
      // Should skip B (disabled) and land on C
      const activeOpt = wrapper.find('[data-active="true"]');
      expect(activeOpt.text()).toContain('C');
    });

    it('wraps around when navigating past the last option', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '', filterOption: false },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@');
      // activeIndex starts at 0 (Alice); ArrowDown -> Bob -> Charlie -> wraps to Alice
      await getTextarea(wrapper).trigger('keydown', { key: 'ArrowDown' });
      await getTextarea(wrapper).trigger('keydown', { key: 'ArrowDown' });
      await getTextarea(wrapper).trigger('keydown', { key: 'ArrowDown' });
      const activeOpt = wrapper.find('[data-active="true"]');
      expect(activeOpt.text()).toContain('Alice');
    });

    it('adds focused class when textarea gains focus', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await getTextarea(wrapper).trigger('focus');
      expect(wrapper.find('.b-mentions--focused').exists()).toBe(true);
    });

    it('removes focused class when textarea loses focus', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await getTextarea(wrapper).trigger('focus');
      await getTextarea(wrapper).trigger('blur');
      expect(wrapper.find('.b-mentions--focused').exists()).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('has combobox role on wrapper', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
      });
      expect(wrapper.find('.b-mentions').attributes('role')).toBe('combobox');
    });

    it('has listbox role on dropdown when open', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@');
      expect(getMenu(wrapper).attributes('role')).toBe('listbox');
    });

    it('options have role="option"', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@');
      const opts = getOptions(wrapper);
      expect(opts.length).toBe(3);
      opts.forEach((opt) => {
        expect(opt.attributes('role')).toBe('option');
      });
    });

    it('sets aria-expanded on wrapper based on dropdown state', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      expect(wrapper.find('.b-mentions').attributes('aria-expanded')).toBe('false');
      await triggerMentionInput(wrapper, '@');
      expect(wrapper.find('.b-mentions').attributes('aria-expanded')).toBe('true');
    });

    it('sets aria-activedescendant on textarea when navigating', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@');
      await getTextarea(wrapper).trigger('keydown', { key: 'ArrowDown' });
      const textarea = getTextarea(wrapper);
      expect(textarea.attributes('aria-activedescendant')).toBeDefined();
      expect(textarea.attributes('aria-activedescendant')).toContain('option-');
    });

    it('has aria-autocomplete="list" on textarea', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
      });
      expect(getTextarea(wrapper).attributes('aria-autocomplete')).toBe('list');
    });

    it('has aria-haspopup="listbox" on wrapper', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
      });
      expect(wrapper.find('.b-mentions').attributes('aria-haspopup')).toBe('listbox');
    });

    it('sets aria-disabled on disabled options', async () => {
      const options = [
        { label: 'A', value: 'a', disabled: true },
        { label: 'B', value: 'b' },
      ];
      const wrapper = mount(BMentions, {
        props: { options, modelValue: '', filterOption: false },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@');
      const opts = getOptions(wrapper);
      expect(opts[0].attributes('aria-disabled')).toBe('true');
      expect(opts[1].attributes('aria-disabled')).toBe('false');
    });

    it('clear button has aria-label', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: 'test', allowClear: true },
      });
      expect(wrapper.find('.b-mentions__clear').attributes('aria-label')).toBe('Clear input');
    });

    it('dropdown has aria-label describing the mention prefix', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@');
      expect(getMenu(wrapper).attributes('aria-label')).toContain('@');
    });
  });

  describe('edge cases', () => {
    it('handles empty options array', () => {
      const wrapper = mount(BMentions, {
        props: { options: [], modelValue: '' },
      });
      expect(wrapper.find('.b-mentions').exists()).toBe(true);
      expect(getOptions(wrapper).length).toBe(0);
    });

    it('handles controlled v-model updates', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
      });
      await wrapper.setProps({ modelValue: 'hello @alice' });
      expect((getTextarea(wrapper).element as HTMLTextAreaElement).value).toBe('hello @alice');
    });

    it('does not select disabled options on click', async () => {
      const options = [
        { label: 'A', value: 'a', disabled: true },
        { label: 'B', value: 'b' },
      ];
      const wrapper = mount(BMentions, {
        props: { options, modelValue: '', filterOption: false },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@');
      await getOptions(wrapper)[0].trigger('mousedown');
      expect(wrapper.emitted('select')).toBeFalsy();
    });

    it('options without label use value as display text', async () => {
      const options = [{ value: 'rawvalue' }];
      const wrapper = mount(BMentions, {
        props: { options, modelValue: '' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@');
      expect(getOptions(wrapper)[0].text()).toContain('rawvalue');
    });

    it('exposes focus and blur methods', () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      expect(typeof wrapper.vm.focus).toBe('function');
      expect(typeof wrapper.vm.blur).toBe('function');
    });

    it('handles mention at the start of text', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@al');
      const opts = getOptions(wrapper);
      expect(opts.length).toBe(1);
      expect(opts[0].text()).toContain('Alice');
    });

    it('handles mention after a space', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, 'hello @b');
      const opts = getOptions(wrapper);
      expect(opts.length).toBe(1);
      expect(opts[0].text()).toContain('Bob');
    });

    it('does not trigger dropdown when prefix is mid-word', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, 'email@test');
      expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();
    });

    it('inserts mention value when selected', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@');
      const opts = getOptions(wrapper);
      await opts[0].trigger('mousedown');
      const emitted = wrapper.emitted('update:modelValue');
      expect(emitted).toBeTruthy();
      const lastValue = emitted![emitted!.length - 1][0];
      expect(lastValue).toContain('@alice');
    });
  });

  describe('animations (fake timers)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('uses CSS transitions for dropdown animation (no JS timers needed)', async () => {
      const wrapper = mount(BMentions, {
        props: { options: defaultOptions, modelValue: '' },
        attachTo: document.body,
      });
      await triggerMentionInput(wrapper, '@');
      const dropdown = getMenu(wrapper);
      expect(dropdown.classes()).toContain('b-mentions__dropdown');
    });
  });
});
