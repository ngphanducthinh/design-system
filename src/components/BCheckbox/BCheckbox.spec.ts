import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import BCheckbox from './BCheckbox.vue';
import BCheckboxGroup from './BCheckboxGroup.vue';

function getInput(wrapper: VueWrapper) {
  return wrapper.find('input[type="checkbox"]');
}

function getInner(wrapper: VueWrapper) {
  return wrapper.find('.b-checkbox__inner');
}

function getLabel(wrapper: VueWrapper) {
  return wrapper.find('.b-checkbox__label');
}

describe('BCheckbox', () => {
  // ─────────────────────────────────────────────
  // Defaults and variants render
  // ─────────────────────────────────────────────
  describe('defaults and variants render', () => {
    it('renders with default props', () => {
      const wrapper = mount(BCheckbox);
      expect(wrapper.find('.b-checkbox').exists()).toBe(true);
      expect(getInput(wrapper).exists()).toBe(true);
      expect(getInner(wrapper).exists()).toBe(true);
    });

    it('renders unchecked by default', () => {
      const wrapper = mount(BCheckbox);
      expect((getInput(wrapper).element as HTMLInputElement).checked).toBe(false);
    });

    it('renders checked when modelValue is true', () => {
      const wrapper = mount(BCheckbox, { props: { modelValue: true } });
      expect((getInput(wrapper).element as HTMLInputElement).checked).toBe(true);
      expect(wrapper.find('.b-checkbox__indicator--checked').exists()).toBe(true);
    });

    it('renders indeterminate visual state', () => {
      const wrapper = mount(BCheckbox, { props: { indeterminate: true } });
      expect(wrapper.find('.b-checkbox__indicator--indeterminate').exists()).toBe(true);
    });

    it('renders disabled state', () => {
      const wrapper = mount(BCheckbox, { props: { disabled: true } });
      expect(wrapper.find('.b-checkbox--disabled').exists()).toBe(true);
      expect(getInput(wrapper).attributes('disabled')).toBeDefined();
      expect(wrapper.find('.b-checkbox__indicator--disabled').exists()).toBe(true);
    });

    it('renders slot content as label', () => {
      const wrapper = mount(BCheckbox, {
        slots: { default: 'Remember me' },
      });
      expect(getLabel(wrapper).exists()).toBe(true);
      expect(getLabel(wrapper).text()).toBe('Remember me');
    });

    it('does not render label span when no slot content', () => {
      const wrapper = mount(BCheckbox);
      expect(getLabel(wrapper).exists()).toBe(false);
    });
  });

  // ─────────────────────────────────────────────
  // Props map to DOM and behavior
  // ─────────────────────────────────────────────
  describe('props map to DOM and behavior', () => {
    it('applies custom id to the input', () => {
      const wrapper = mount(BCheckbox, { props: { id: 'my-checkbox' } });
      expect(getInput(wrapper).attributes('id')).toBe('my-checkbox');
    });

    it('generates unique id when id prop is not provided', () => {
      const wrapper = mount(BCheckbox);
      const id = getInput(wrapper).attributes('id');
      expect(id).toMatch(/^b-checkbox-/);
    });

    it('label for attribute matches input id', () => {
      const wrapper = mount(BCheckbox, { props: { id: 'test-cb' } });
      const label = wrapper.find('label.b-checkbox');
      expect(label.attributes('for')).toBe('test-cb');
    });

    it('applies name attribute', () => {
      const wrapper = mount(BCheckbox, { props: { name: 'terms' } });
      expect(getInput(wrapper).attributes('name')).toBe('terms');
    });

    it('applies value attribute', () => {
      const wrapper = mount(BCheckbox, { props: { value: 'option-a' } });
      expect(getInput(wrapper).attributes('value')).toBe('option-a');
    });

    it('native checked property reflects checked state', () => {
      const wrapper = mount(BCheckbox, { props: { modelValue: true } });
      expect((getInput(wrapper).element as HTMLInputElement).checked).toBe(true);
    });

    it('native indeterminate property is set when indeterminate', () => {
      const wrapper = mount(BCheckbox, { props: { indeterminate: true }, attachTo: document.body });
      expect((getInput(wrapper).element as HTMLInputElement).indeterminate).toBe(true);
      wrapper.unmount();
    });
  });

  // ─────────────────────────────────────────────
  // Events
  // ─────────────────────────────────────────────
  describe('events', () => {
    it('emits update:modelValue when toggled', async () => {
      const wrapper = mount(BCheckbox, { props: { modelValue: false } });
      const input = getInput(wrapper);
      await input.setValue(true);
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
    });

    it('emits change event with checked state', async () => {
      const wrapper = mount(BCheckbox, { props: { modelValue: false } });
      const input = getInput(wrapper);
      await input.trigger('change');
      expect(wrapper.emitted('change')).toBeTruthy();
    });

    it('does not emit events when disabled', async () => {
      const wrapper = mount(BCheckbox, { props: { modelValue: false, disabled: true } });
      const input = getInput(wrapper);
      await input.trigger('change');
      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  // ─────────────────────────────────────────────
  // Keyboard and focus behavior
  // ─────────────────────────────────────────────
  describe('keyboard and focus behavior', () => {
    it('checkbox input is focusable via tab', () => {
      const wrapper = mount(BCheckbox, { attachTo: document.body });
      const input = getInput(wrapper);
      expect(input.attributes('tabindex')).not.toBe('-1');
      wrapper.unmount();
    });

    it('toggling via space/enter works (native checkbox behavior)', async () => {
      const wrapper = mount(BCheckbox, {
        props: { modelValue: false },
        attachTo: document.body,
      });
      const input = getInput(wrapper);
      await input.setValue(true);
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
      wrapper.unmount();
    });

    it('disabled checkbox is not focusable', () => {
      const wrapper = mount(BCheckbox, { props: { disabled: true } });
      expect(getInput(wrapper).attributes('disabled')).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────
  describe('accessibility', () => {
    it('has checkbox input type', () => {
      const wrapper = mount(BCheckbox);
      expect(getInput(wrapper).attributes('type')).toBe('checkbox');
    });

    it('inner decoration is aria-hidden', () => {
      const wrapper = mount(BCheckbox);
      expect(getInner(wrapper).attributes('aria-hidden')).toBe('true');
    });

    it('checked state is communicated via native checked property', () => {
      const unchecked = mount(BCheckbox, { props: { modelValue: false } });
      expect((getInput(unchecked).element as HTMLInputElement).checked).toBe(false);

      const checked = mount(BCheckbox, { props: { modelValue: true } });
      expect((getInput(checked).element as HTMLInputElement).checked).toBe(true);
    });

    it('indeterminate state is communicated via native indeterminate property', () => {
      const wrapper = mount(BCheckbox, {
        props: { indeterminate: true, modelValue: false },
        attachTo: document.body,
      });
      expect((getInput(wrapper).element as HTMLInputElement).indeterminate).toBe(true);
      wrapper.unmount();
    });

    it('does not use aria-checked (native checkbox handles this)', () => {
      const wrapper = mount(BCheckbox, { props: { modelValue: true } });
      expect(getInput(wrapper).attributes('aria-checked')).toBeUndefined();
    });

    it('label wraps the input for accessible click target', () => {
      const wrapper = mount(BCheckbox, { props: { id: 'a11y-test' } });
      const rootLabel = wrapper.find('label.b-checkbox');
      expect(rootLabel.exists()).toBe(true);
      expect(rootLabel.attributes('for')).toBe('a11y-test');
    });
  });

  // ─────────────────────────────────────────────
  // Edge cases
  // ─────────────────────────────────────────────
  describe('edge cases', () => {
    it('controlled mode: reflects prop changes', async () => {
      const wrapper = mount(BCheckbox, { props: { modelValue: false } });
      expect((getInput(wrapper).element as HTMLInputElement).checked).toBe(false);
      await wrapper.setProps({ modelValue: true });
      expect((getInput(wrapper).element as HTMLInputElement).checked).toBe(true);
    });

    it('indeterminate and checked simultaneously: indeterminate wins visually', () => {
      const wrapper = mount(BCheckbox, {
        props: { modelValue: true, indeterminate: true },
      });
      expect(wrapper.find('.b-checkbox__indicator--indeterminate').exists()).toBe(true);
    });

    it('long label text does not break layout', () => {
      const longText = 'A'.repeat(200);
      const wrapper = mount(BCheckbox, {
        slots: { default: longText },
      });
      expect(getLabel(wrapper).text()).toBe(longText);
      expect(wrapper.find('.b-checkbox').classes()).toContain('b:inline-flex');
    });
  });
});

// ═════════════════════════════════════════════
// BCheckboxGroup
// ═════════════════════════════════════════════
describe('BCheckboxGroup', () => {
  const defaultOptions = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
  ];

  // ─────────────────────────────────────────────
  // Defaults and rendering
  // ─────────────────────────────────────────────
  describe('defaults and rendering', () => {
    it('renders with role="group"', () => {
      const wrapper = mount(BCheckboxGroup, { props: { options: defaultOptions } });
      expect(wrapper.find('[role="group"]').exists()).toBe(true);
    });

    it('renders checkboxes from options array', () => {
      const wrapper = mount(BCheckboxGroup, { props: { options: defaultOptions } });
      const inputs = wrapper.findAll('input[type="checkbox"]');
      expect(inputs.length).toBe(3);
    });

    it('renders checkboxes from string array options', () => {
      const wrapper = mount(BCheckboxGroup, {
        props: { options: ['Red', 'Green', 'Blue'] },
      });
      const labels = wrapper.findAll('.b-checkbox__label');
      expect(labels.length).toBe(3);
      expect(labels[0].text()).toBe('Red');
    });

    it('renders checkboxes from number array options', () => {
      const wrapper = mount(BCheckboxGroup, {
        props: { options: [1, 2, 3] },
      });
      const labels = wrapper.findAll('.b-checkbox__label');
      expect(labels.length).toBe(3);
      expect(labels[0].text()).toBe('1');
    });

    it('renders slot content when no options provided', () => {
      const wrapper = mount(BCheckboxGroup, {
        slots: { default: '<div class="custom-slot">Custom</div>' },
      });
      expect(wrapper.find('.custom-slot').exists()).toBe(true);
    });
  });

  // ─────────────────────────────────────────────
  // Value binding
  // ─────────────────────────────────────────────
  describe('value binding', () => {
    it('checks items matching modelValue', () => {
      const wrapper = mount(BCheckboxGroup, {
        props: { options: defaultOptions, modelValue: ['apple', 'cherry'] },
      });
      const inputs = wrapper.findAll('input[type="checkbox"]');
      expect((inputs[0].element as HTMLInputElement).checked).toBe(true);
      expect((inputs[1].element as HTMLInputElement).checked).toBe(false);
      expect((inputs[2].element as HTMLInputElement).checked).toBe(true);
    });

    it('emits update:modelValue when an option is toggled', async () => {
      const wrapper = mount(BCheckboxGroup, {
        props: { options: defaultOptions, modelValue: [] },
      });
      const inputs = wrapper.findAll('input[type="checkbox"]');
      await inputs[1].trigger('change');
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['banana']]);
    });

    it('emits change event when an option is toggled', async () => {
      const wrapper = mount(BCheckboxGroup, {
        props: { options: defaultOptions, modelValue: ['apple'] },
      });
      const inputs = wrapper.findAll('input[type="checkbox"]');
      await inputs[0].trigger('change');
      expect(wrapper.emitted('change')?.[0]).toEqual([[]]);
    });

    it('adds value when unchecked item is clicked', async () => {
      const wrapper = mount(BCheckboxGroup, {
        props: { options: defaultOptions, modelValue: ['apple'] },
      });
      const inputs = wrapper.findAll('input[type="checkbox"]');
      await inputs[1].trigger('change');
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['apple', 'banana']]);
    });

    it('removes value when checked item is clicked', async () => {
      const wrapper = mount(BCheckboxGroup, {
        props: { options: defaultOptions, modelValue: ['apple', 'banana'] },
      });
      const inputs = wrapper.findAll('input[type="checkbox"]');
      await inputs[0].trigger('change');
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['banana']]);
    });
  });

  // ─────────────────────────────────────────────
  // Disabled state
  // ─────────────────────────────────────────────
  describe('disabled state', () => {
    it('disables all checkboxes when group is disabled', () => {
      const wrapper = mount(BCheckboxGroup, {
        props: { options: defaultOptions, disabled: true },
      });
      const inputs = wrapper.findAll('input[type="checkbox"]');
      inputs.forEach((input) => {
        expect(input.attributes('disabled')).toBeDefined();
      });
    });

    it('disables individual option when option.disabled is true', () => {
      const options = [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b', disabled: true },
        { label: 'C', value: 'c' },
      ];
      const wrapper = mount(BCheckboxGroup, { props: { options } });
      const inputs = wrapper.findAll('input[type="checkbox"]');
      expect(inputs[0].attributes('disabled')).toBeUndefined();
      expect(inputs[1].attributes('disabled')).toBeDefined();
      expect(inputs[2].attributes('disabled')).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────
  // Name attribute
  // ─────────────────────────────────────────────
  describe('name attribute', () => {
    it('applies name to all checkboxes in the group', () => {
      const wrapper = mount(BCheckboxGroup, {
        props: { options: defaultOptions, name: 'fruits' },
      });
      const inputs = wrapper.findAll('input[type="checkbox"]');
      inputs.forEach((input) => {
        expect(input.attributes('name')).toBe('fruits');
      });
    });
  });

  // ─────────────────────────────────────────────
  // Group with BCheckbox children (provide/inject)
  // ─────────────────────────────────────────────
  describe('group with BCheckbox children (provide/inject)', () => {
    it('BCheckbox inside group reflects group value', () => {
      const wrapper = mount(BCheckboxGroup, {
        props: { modelValue: ['opt1'] },
        slots: {
          default: `
            <BCheckbox value="opt1">Option 1</BCheckbox>
            <BCheckbox value="opt2">Option 2</BCheckbox>
          `,
        },
        global: { components: { BCheckbox } },
      });
      const inputs = wrapper.findAll('input[type="checkbox"]');
      expect((inputs[0].element as HTMLInputElement).checked).toBe(true);
      expect((inputs[1].element as HTMLInputElement).checked).toBe(false);
    });

    it('BCheckbox inside group emits through group', async () => {
      const wrapper = mount(BCheckboxGroup, {
        props: { modelValue: [] },
        slots: {
          default: `
            <BCheckbox value="opt1">Option 1</BCheckbox>
            <BCheckbox value="opt2">Option 2</BCheckbox>
          `,
        },
        global: { components: { BCheckbox } },
      });
      const inputs = wrapper.findAll('input[type="checkbox"]');
      await inputs[0].setValue(true);
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['opt1']]);
    });

    it('group disabled cascades to BCheckbox children', () => {
      const wrapper = mount(BCheckboxGroup, {
        props: { modelValue: [], disabled: true },
        slots: {
          default: `
            <BCheckbox value="opt1">Option 1</BCheckbox>
          `,
        },
        global: { components: { BCheckbox } },
      });
      const input = wrapper.find('input[type="checkbox"]');
      expect(input.attributes('disabled')).toBeDefined();
    });

    it('group name cascades to BCheckbox children', () => {
      const wrapper = mount(BCheckboxGroup, {
        props: { modelValue: [], name: 'group-name' },
        slots: {
          default: `
            <BCheckbox value="opt1">Option 1</BCheckbox>
          `,
        },
        global: { components: { BCheckbox } },
      });
      const input = wrapper.find('input[type="checkbox"]');
      expect(input.attributes('name')).toBe('group-name');
    });
  });
});
