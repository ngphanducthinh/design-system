import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import BInputTags from './BInputTags.vue';

function getInput(wrapper: VueWrapper): HTMLInputElement {
  return wrapper.find('.b-input-tags__input').element as HTMLInputElement;
}

async function typeAndCommit(wrapper: VueWrapper, value: string, key = 'Enter') {
  const input = wrapper.find('.b-input-tags__input');
  await input.setValue(value);
  await input.trigger('keydown', { key });
}

describe('BInputTags', () => {
  describe('defaults and rendering', () => {
    it('renders with default props', () => {
      const wrapper = mount(BInputTags);
      expect(wrapper.find('.b-input-tags').exists()).toBe(true);
      expect(wrapper.find('.b-input-tags--md').exists()).toBe(true);
      expect(wrapper.find('.b-input-tags__input').exists()).toBe(true);
    });

    it('renders all size variants', () => {
      (['sm', 'md', 'lg'] as const).forEach((size) => {
        const wrapper = mount(BInputTags, { props: { size } });
        expect(wrapper.find(`.b-input-tags--${size}`).exists()).toBe(true);
      });
    });

    it('renders placeholder', () => {
      const wrapper = mount(BInputTags, { props: { placeholder: 'Add tag…' } });
      expect(getInput(wrapper).placeholder).toBe('Add tag…');
    });

    it('uses custom id when provided', () => {
      const wrapper = mount(BInputTags, { props: { id: 'my-tags' } });
      expect(getInput(wrapper).id).toBe('my-tags');
    });

    it('generates a unique id when none is provided', () => {
      const wrapper = mount(BInputTags);
      expect(getInput(wrapper).id).toMatch(/^b-input-tags-/);
    });

    it('renders initial tags from modelValue', () => {
      const wrapper = mount(BInputTags, { props: { modelValue: ['a', 'b'] } });
      const tags = wrapper.findAll('.b-input-tags__tag');
      expect(tags).toHaveLength(2);
      expect(tags[0].text()).toContain('a');
      expect(tags[1].text()).toContain('b');
    });
  });

  describe('v-model and uncontrolled', () => {
    it('emits update:modelValue when a tag is added', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputTags, {
        props: { modelValue: [], 'onUpdate:modelValue': onUpdate },
      });
      await typeAndCommit(wrapper, 'foo');
      expect(onUpdate).toHaveBeenCalledWith(['foo']);
    });

    it('reflects external model value changes', async () => {
      const wrapper = mount(BInputTags, { props: { modelValue: ['x'] } });
      expect(wrapper.findAll('.b-input-tags__tag')).toHaveLength(1);
      await wrapper.setProps({ modelValue: ['x', 'y', 'z'] });
      expect(wrapper.findAll('.b-input-tags__tag')).toHaveLength(3);
    });

    it('works uncontrolled (no model passed)', async () => {
      const wrapper = mount(BInputTags);
      await typeAndCommit(wrapper, 'apple');
      await nextTick();
      expect(wrapper.findAll('.b-input-tags__tag')).toHaveLength(1);
      expect(wrapper.find('.b-input-tags__tag').text()).toContain('apple');
    });
  });

  describe('add behavior', () => {
    it('emits add event with the trimmed value', async () => {
      const wrapper = mount(BInputTags);
      await typeAndCommit(wrapper, '  hello  ');
      const addEvents = wrapper.emitted('add');
      expect(addEvents).toBeTruthy();
      expect(addEvents![0]).toEqual(['hello']);
    });

    it('clears the input after adding', async () => {
      const wrapper = mount(BInputTags);
      await typeAndCommit(wrapper, 'foo');
      expect(getInput(wrapper).value).toBe('');
    });

    it('does not add empty / whitespace-only values', async () => {
      const wrapper = mount(BInputTags);
      await typeAndCommit(wrapper, '   ');
      expect(wrapper.emitted('add')).toBeFalsy();
      expect(wrapper.findAll('.b-input-tags__tag')).toHaveLength(0);
    });

    it('commits on blur when delimiter is enter', async () => {
      const wrapper = mount(BInputTags, { props: { delimiter: 'enter' } });
      const input = wrapper.find('.b-input-tags__input');
      await input.setValue('xyz');
      await input.trigger('blur');
      expect(wrapper.emitted('add')).toBeTruthy();
      expect(wrapper.emitted('add')![0]).toEqual(['xyz']);
    });
  });

  describe('delimiter prop', () => {
    it('commits on Enter by default', async () => {
      const wrapper = mount(BInputTags);
      await typeAndCommit(wrapper, 'one', 'Enter');
      expect(wrapper.emitted('add')).toBeTruthy();
    });

    it('commits on comma key by default', async () => {
      const wrapper = mount(BInputTags);
      const input = wrapper.find('.b-input-tags__input');
      await input.setValue('foo');
      await input.trigger('keydown', { key: ',' });
      expect(wrapper.emitted('add')).toBeTruthy();
      expect(wrapper.emitted('add')![0]).toEqual(['foo']);
    });

    it('does not commit on comma when delimiter is enter only', async () => {
      const wrapper = mount(BInputTags, { props: { delimiter: 'enter' } });
      const input = wrapper.find('.b-input-tags__input');
      await input.setValue('foo');
      await input.trigger('keydown', { key: ',' });
      expect(wrapper.emitted('add')).toBeFalsy();
    });

    it('commits on space when delimiter includes space', async () => {
      const wrapper = mount(BInputTags, { props: { delimiter: ['space'] } });
      const input = wrapper.find('.b-input-tags__input');
      await input.setValue('foo');
      await input.trigger('keydown', { key: ' ' });
      expect(wrapper.emitted('add')).toBeTruthy();
      expect(wrapper.emitted('add')![0]).toEqual(['foo']);
    });

    it('supports a regex delimiter triggered while typing', async () => {
      const wrapper = mount(BInputTags, { props: { delimiter: /;/ } });
      const input = wrapper.find('.b-input-tags__input');
      await input.setValue('one;');
      // input event triggers on setValue
      expect(wrapper.emitted('add')).toBeTruthy();
      expect(wrapper.emitted('add')![0]).toEqual(['one']);
    });
  });

  describe('remove behavior', () => {
    it('removes a tag when its remove button is clicked', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputTags, {
        props: { modelValue: ['a', 'b', 'c'], 'onUpdate:modelValue': onUpdate },
      });
      const removeButtons = wrapper.findAll('.b-input-tags__remove');
      await removeButtons[1].trigger('click');
      expect(onUpdate).toHaveBeenCalledWith(['a', 'c']);
      const removeEvents = wrapper.emitted('remove');
      expect(removeEvents).toBeTruthy();
      expect(removeEvents![0]).toEqual(['b', 1]);
    });

    it('removes the last tag when Backspace is pressed in an empty input', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputTags, {
        props: { modelValue: ['a', 'b'], 'onUpdate:modelValue': onUpdate },
      });
      const input = wrapper.find('.b-input-tags__input');
      await input.trigger('keydown', { key: 'Backspace' });
      expect(onUpdate).toHaveBeenCalledWith(['a']);
      expect(wrapper.emitted('remove')![0]).toEqual(['b', 1]);
    });

    it('does NOT remove a tag when Backspace is pressed with text in the input', async () => {
      const wrapper = mount(BInputTags, { props: { modelValue: ['a', 'b'] } });
      const input = wrapper.find('.b-input-tags__input');
      await input.setValue('hi');
      await input.trigger('keydown', { key: 'Backspace' });
      expect(wrapper.emitted('remove')).toBeFalsy();
    });

    it('does not remove when disabled', async () => {
      const wrapper = mount(BInputTags, {
        props: { modelValue: ['a'], disabled: true },
      });
      await wrapper.find('.b-input-tags__remove').trigger('click');
      expect(wrapper.emitted('remove')).toBeFalsy();
    });
  });

  describe('validation', () => {
    it('rejects duplicates by default', async () => {
      const wrapper = mount(BInputTags, { props: { modelValue: ['foo'] } });
      await typeAndCommit(wrapper, 'foo');
      expect(wrapper.emitted('add')).toBeFalsy();
      const invalid = wrapper.emitted('invalid');
      expect(invalid).toBeTruthy();
      expect(invalid![0]).toEqual(['foo', 'duplicate']);
    });

    it('allows duplicates when allowDuplicate is true', async () => {
      const wrapper = mount(BInputTags, {
        props: { modelValue: ['foo'], allowDuplicate: true },
      });
      await typeAndCommit(wrapper, 'foo');
      expect(wrapper.emitted('add')).toBeTruthy();
      expect(wrapper.emitted('invalid')).toBeFalsy();
    });

    it('respects max prop and emits invalid', async () => {
      const wrapper = mount(BInputTags, {
        props: { modelValue: ['a', 'b'], max: 2 },
      });
      await typeAndCommit(wrapper, 'c');
      expect(wrapper.emitted('add')).toBeFalsy();
      expect(wrapper.emitted('invalid')![0]).toEqual(['c', 'max-reached']);
    });

    it('marks the input readonly when max is reached', () => {
      const wrapper = mount(BInputTags, { props: { modelValue: ['a', 'b'], max: 2 } });
      expect(getInput(wrapper).readOnly).toBe(true);
      expect(wrapper.find('.b-input-tags--max-reached').exists()).toBe(true);
    });

    it('runs custom validate returning false (silent reject)', async () => {
      const validate = (v: string) => v.length >= 3;
      const wrapper = mount(BInputTags, { props: { validate } });
      await typeAndCommit(wrapper, 'no');
      expect(wrapper.emitted('add')).toBeFalsy();
      expect(wrapper.emitted('invalid')![0]).toEqual(['no', 'invalid']);
    });

    it('runs custom validate returning a string (used as reason)', async () => {
      const validate = (v: string) => (v.includes('@') ? true : 'must contain @');
      const wrapper = mount(BInputTags, { props: { validate } });
      await typeAndCommit(wrapper, 'plain');
      expect(wrapper.emitted('invalid')![0]).toEqual(['plain', 'must contain @']);
    });

    it('accepts when validate returns true', async () => {
      const validate = (v: string) => v.length >= 3;
      const wrapper = mount(BInputTags, { props: { validate } });
      await typeAndCommit(wrapper, 'okay');
      expect(wrapper.emitted('add')).toBeTruthy();
    });
  });

  describe('disabled state', () => {
    it('applies disabled class', () => {
      const wrapper = mount(BInputTags, { props: { disabled: true } });
      expect(wrapper.find('.b-input-tags--disabled').exists()).toBe(true);
      expect(getInput(wrapper).disabled).toBe(true);
    });

    it('disables remove buttons', () => {
      const wrapper = mount(BInputTags, {
        props: { modelValue: ['a'], disabled: true },
      });
      const btn = wrapper.find('.b-input-tags__remove').element as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });

    it('does not commit on Enter when disabled', async () => {
      const wrapper = mount(BInputTags, { props: { disabled: true } });
      await typeAndCommit(wrapper, 'foo');
      expect(wrapper.emitted('add')).toBeFalsy();
    });
  });

  describe('focus / keyboard', () => {
    it('adds focused class on focus', async () => {
      const wrapper = mount(BInputTags);
      await wrapper.find('.b-input-tags__input').trigger('focus');
      expect(wrapper.find('.b-input-tags--focused').exists()).toBe(true);
    });

    it('removes focused class on blur', async () => {
      const wrapper = mount(BInputTags);
      const input = wrapper.find('.b-input-tags__input');
      await input.trigger('focus');
      await input.trigger('blur');
      expect(wrapper.find('.b-input-tags--focused').exists()).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('wrapper has role="group"', () => {
      const wrapper = mount(BInputTags);
      expect(wrapper.find('.b-input-tags').attributes('role')).toBe('group');
    });

    it('wrapper has aria-label (default "Add tag")', () => {
      const wrapper = mount(BInputTags);
      expect(wrapper.find('.b-input-tags').attributes('aria-label')).toBe('Add tag');
    });

    it('inner input has aria-label', () => {
      const wrapper = mount(BInputTags);
      expect(getInput(wrapper).getAttribute('aria-label')).toBe('Add tag');
    });

    it('inputAriaLabel prop overrides default', () => {
      const wrapper = mount(BInputTags, { props: { inputAriaLabel: 'Tags' } });
      expect(getInput(wrapper).getAttribute('aria-label')).toBe('Tags');
      expect(wrapper.find('.b-input-tags').attributes('aria-label')).toBe('Tags');
    });

    it('remove button has descriptive aria-label per tag', () => {
      const wrapper = mount(BInputTags, { props: { modelValue: ['hello'] } });
      expect(wrapper.find('.b-input-tags__remove').attributes('aria-label')).toBe(
        'Remove tag hello',
      );
    });

    it('aria-disabled is set when disabled', () => {
      const wrapper = mount(BInputTags, { props: { disabled: true } });
      expect(wrapper.find('.b-input-tags').attributes('aria-disabled')).toBe('true');
    });
  });

  describe('exposed methods', () => {
    it('exposes focus()', () => {
      const wrapper = mount(BInputTags, { attachTo: document.body });
      expect(typeof (wrapper.vm as unknown as { focus: () => void }).focus).toBe('function');
      (wrapper.vm as unknown as { focus: () => void }).focus();
      wrapper.unmount();
    });

    it('exposes clear()', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BInputTags, {
        props: { modelValue: ['a', 'b'], 'onUpdate:modelValue': onUpdate },
      });
      (wrapper.vm as unknown as { clear: () => void }).clear();
      expect(onUpdate).toHaveBeenCalledWith([]);
    });
  });

  describe('edge cases', () => {
    it('handles many tags (long content)', () => {
      const many = Array.from({ length: 50 }, (_, i) => `tag-${i}`);
      const wrapper = mount(BInputTags, { props: { modelValue: many } });
      expect(wrapper.findAll('.b-input-tags__tag')).toHaveLength(50);
    });

    it('handles a single very long tag value', () => {
      const long = 'x'.repeat(500);
      const wrapper = mount(BInputTags, { props: { modelValue: [long] } });
      expect(wrapper.find('.b-input-tags__tag-label').text()).toBe(long);
    });

    it('does not strip leading/trailing spaces inside a duplicate check (trimmed)', async () => {
      const wrapper = mount(BInputTags, { props: { modelValue: ['hi'] } });
      await typeAndCommit(wrapper, '  hi  ');
      expect(wrapper.emitted('invalid')![0]).toEqual(['hi', 'duplicate']);
    });

    it('Backspace on empty input with no tags is a no-op', async () => {
      const wrapper = mount(BInputTags);
      await wrapper.find('.b-input-tags__input').trigger('keydown', { key: 'Backspace' });
      expect(wrapper.emitted('remove')).toBeFalsy();
    });
  });
});
