import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import BRadio from './BRadio.vue';
import BRadioButton from './BRadioButton.vue';
import BRadioGroup from './BRadioGroup.vue';

function getInput(wrapper: VueWrapper) {
  return wrapper.find('input[type="radio"]');
}

function getInner(wrapper: VueWrapper) {
  return wrapper.find('.b-radio__inner');
}

function getLabel(wrapper: VueWrapper) {
  return wrapper.find('.b-radio__label');
}

describe('BRadio', () => {
  // ─────────────────────────────────────────────
  // Defaults and variants render
  // ─────────────────────────────────────────────
  describe('defaults and variants render', () => {
    it('renders with default props', () => {
      const wrapper = mount(BRadio);
      expect(wrapper.find('.b-radio').exists()).toBe(true);
      expect(getInput(wrapper).exists()).toBe(true);
      expect(getInner(wrapper).exists()).toBe(true);
    });

    it('renders unchecked by default', () => {
      const wrapper = mount(BRadio);
      expect((getInput(wrapper).element as HTMLInputElement).checked).toBe(false);
    });

    it('renders checked when modelValue is true', () => {
      const wrapper = mount(BRadio, { props: { modelValue: true } });
      expect((getInput(wrapper).element as HTMLInputElement).checked).toBe(true);
      expect(wrapper.find('.b-radio__indicator--checked').exists()).toBe(true);
    });

    it('renders disabled state', () => {
      const wrapper = mount(BRadio, { props: { disabled: true } });
      expect(wrapper.find('.b-radio--disabled').exists()).toBe(true);
      expect(getInput(wrapper).attributes('disabled')).toBeDefined();
      expect(wrapper.find('.b-radio__indicator--disabled').exists()).toBe(true);
    });

    it('renders slot content as label', () => {
      const wrapper = mount(BRadio, {
        slots: { default: 'Option A' },
      });
      expect(getLabel(wrapper).exists()).toBe(true);
      expect(getLabel(wrapper).text()).toBe('Option A');
    });

    it('does not render label span when no slot content', () => {
      const wrapper = mount(BRadio);
      expect(getLabel(wrapper).exists()).toBe(false);
    });
  });

  // ─────────────────────────────────────────────
  // Props map to DOM and behavior
  // ─────────────────────────────────────────────
  describe('props map to DOM and behavior', () => {
    it('applies custom id to the input', () => {
      const wrapper = mount(BRadio, { props: { id: 'my-radio' } });
      expect(getInput(wrapper).attributes('id')).toBe('my-radio');
    });

    it('generates unique id when id prop is not provided', () => {
      const wrapper = mount(BRadio);
      const id = getInput(wrapper).attributes('id');
      expect(id).toMatch(/^b-radio-/);
    });

    it('label for attribute matches input id', () => {
      const wrapper = mount(BRadio, { props: { id: 'test-radio' } });
      const label = wrapper.find('label.b-radio');
      expect(label.attributes('for')).toBe('test-radio');
    });

    it('applies name attribute', () => {
      const wrapper = mount(BRadio, { props: { name: 'gender' } });
      expect(getInput(wrapper).attributes('name')).toBe('gender');
    });

    it('applies value attribute', () => {
      const wrapper = mount(BRadio, { props: { value: 'option-a' } });
      expect(getInput(wrapper).attributes('value')).toBe('option-a');
    });

    it('native checked property reflects checked state', () => {
      const wrapper = mount(BRadio, { props: { modelValue: true } });
      expect((getInput(wrapper).element as HTMLInputElement).checked).toBe(true);
    });
  });

  // ─────────────────────────────────────────────
  // Events
  // ─────────────────────────────────────────────
  describe('events', () => {
    it('emits update:modelValue when selected', async () => {
      const wrapper = mount(BRadio, { props: { modelValue: false } });
      const input = getInput(wrapper);
      await input.trigger('change');
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
    });

    it('emits change event with checked state', async () => {
      const wrapper = mount(BRadio, { props: { modelValue: false } });
      const input = getInput(wrapper);
      await input.trigger('change');
      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')![0][0]).toBe(true);
    });

    it('does not emit events when disabled', async () => {
      const wrapper = mount(BRadio, { props: { modelValue: false, disabled: true } });
      const input = getInput(wrapper);
      await input.trigger('change');
      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  // ─────────────────────────────────────────────
  // Keyboard and focus behavior
  // ─────────────────────────────────────────────
  describe('keyboard and focus behavior', () => {
    it('radio input is focusable via tab', () => {
      const wrapper = mount(BRadio, { attachTo: document.body });
      const input = getInput(wrapper);
      expect(input.attributes('tabindex')).not.toBe('-1');
      wrapper.unmount();
    });

    it('disabled radio is not interactive', () => {
      const wrapper = mount(BRadio, { props: { disabled: true } });
      expect(getInput(wrapper).attributes('disabled')).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────
  describe('accessibility', () => {
    it('has radio input type', () => {
      const wrapper = mount(BRadio);
      expect(getInput(wrapper).attributes('type')).toBe('radio');
    });

    it('inner decoration is aria-hidden', () => {
      const wrapper = mount(BRadio);
      expect(getInner(wrapper).attributes('aria-hidden')).toBe('true');
    });

    it('checked state is communicated via native checked property', () => {
      const unchecked = mount(BRadio, { props: { modelValue: false } });
      expect((getInput(unchecked).element as HTMLInputElement).checked).toBe(false);

      const checked = mount(BRadio, { props: { modelValue: true } });
      expect((getInput(checked).element as HTMLInputElement).checked).toBe(true);
    });

    it('label wraps the input for accessible click target', () => {
      const wrapper = mount(BRadio, { props: { id: 'a11y-test' } });
      const rootLabel = wrapper.find('label.b-radio');
      expect(rootLabel.exists()).toBe(true);
      expect(rootLabel.attributes('for')).toBe('a11y-test');
    });
  });

  // ─────────────────────────────────────────────
  // Edge cases
  // ─────────────────────────────────────────────
  describe('edge cases', () => {
    it('controlled mode: reflects prop changes', async () => {
      const wrapper = mount(BRadio, { props: { modelValue: false } });
      expect((getInput(wrapper).element as HTMLInputElement).checked).toBe(false);
      await wrapper.setProps({ modelValue: true });
      expect((getInput(wrapper).element as HTMLInputElement).checked).toBe(true);
    });

    it('long label text does not break layout', () => {
      const longText = 'A'.repeat(200);
      const wrapper = mount(BRadio, {
        slots: { default: longText },
      });
      expect(getLabel(wrapper).text()).toBe(longText);
      expect(wrapper.find('.b-radio').classes()).toContain('b:inline-flex');
    });
  });
});

// ═════════════════════════════════════════════
// BRadioGroup
// ═════════════════════════════════════════════
describe('BRadioGroup', () => {
  const defaultOptions = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
  ];

  // ─────────────────────────────────────────────
  // Defaults and rendering
  // ─────────────────────────────────────────────
  describe('defaults and rendering', () => {
    it('renders with role="radiogroup"', () => {
      const wrapper = mount(BRadioGroup, { props: { options: defaultOptions } });
      expect(wrapper.find('[role="radiogroup"]').exists()).toBe(true);
    });

    it('renders radios from options array', () => {
      const wrapper = mount(BRadioGroup, { props: { options: defaultOptions } });
      const inputs = wrapper.findAll('input[type="radio"]');
      expect(inputs.length).toBe(3);
    });

    it('renders radios from string array options', () => {
      const wrapper = mount(BRadioGroup, {
        props: { options: ['Red', 'Green', 'Blue'] },
      });
      const labels = wrapper.findAll('.b-radio__label');
      expect(labels.length).toBe(3);
      expect(labels[0].text()).toBe('Red');
    });

    it('renders radios from number array options', () => {
      const wrapper = mount(BRadioGroup, {
        props: { options: [1, 2, 3] },
      });
      const labels = wrapper.findAll('.b-radio__label');
      expect(labels.length).toBe(3);
      expect(labels[0].text()).toBe('1');
    });

    it('renders slot content when no options provided', () => {
      const wrapper = mount(BRadioGroup, {
        slots: { default: '<div class="custom-slot">Custom</div>' },
      });
      expect(wrapper.find('.custom-slot').exists()).toBe(true);
    });
  });

  // ─────────────────────────────────────────────
  // Value binding
  // ─────────────────────────────────────────────
  describe('value binding', () => {
    it('checks the radio matching modelValue', () => {
      const wrapper = mount(BRadioGroup, {
        props: { options: defaultOptions, modelValue: 'banana' },
      });
      const inputs = wrapper.findAll('input[type="radio"]');
      expect((inputs[0].element as HTMLInputElement).checked).toBe(false);
      expect((inputs[1].element as HTMLInputElement).checked).toBe(true);
      expect((inputs[2].element as HTMLInputElement).checked).toBe(false);
    });

    it('emits update:modelValue when an option is selected', async () => {
      const wrapper = mount(BRadioGroup, {
        props: { options: defaultOptions, modelValue: 'apple' },
      });
      const inputs = wrapper.findAll('input[type="radio"]');
      await inputs[1].trigger('change');
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['banana']);
    });

    it('emits change event when an option is selected', async () => {
      const wrapper = mount(BRadioGroup, {
        props: { options: defaultOptions, modelValue: 'apple' },
      });
      const inputs = wrapper.findAll('input[type="radio"]');
      await inputs[2].trigger('change');
      expect(wrapper.emitted('change')?.[0]).toEqual(['cherry']);
    });
  });

  // ─────────────────────────────────────────────
  // Disabled state
  // ─────────────────────────────────────────────
  describe('disabled state', () => {
    it('disables all radios when group is disabled', () => {
      const wrapper = mount(BRadioGroup, {
        props: { options: defaultOptions, disabled: true },
      });
      const inputs = wrapper.findAll('input[type="radio"]');
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
      const wrapper = mount(BRadioGroup, { props: { options } });
      const inputs = wrapper.findAll('input[type="radio"]');
      expect(inputs[0].attributes('disabled')).toBeUndefined();
      expect(inputs[1].attributes('disabled')).toBeDefined();
      expect(inputs[2].attributes('disabled')).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────
  // Name attribute
  // ─────────────────────────────────────────────
  describe('name attribute', () => {
    it('applies name to all radios in the group', () => {
      const wrapper = mount(BRadioGroup, {
        props: { options: defaultOptions, name: 'fruits' },
      });
      const inputs = wrapper.findAll('input[type="radio"]');
      inputs.forEach((input) => {
        expect(input.attributes('name')).toBe('fruits');
      });
    });
  });

  // ─────────────────────────────────────────────
  // Group with BRadio children (provide/inject)
  // ─────────────────────────────────────────────
  describe('group with BRadio children (provide/inject)', () => {
    it('BRadio inside group reflects group value', () => {
      const wrapper = mount(BRadioGroup, {
        props: { modelValue: 'opt1' },
        slots: {
          default: `
            <BRadio value="opt1">Option 1</BRadio>
            <BRadio value="opt2">Option 2</BRadio>
          `,
        },
        global: { components: { BRadio } },
      });
      const inputs = wrapper.findAll('input[type="radio"]');
      expect((inputs[0].element as HTMLInputElement).checked).toBe(true);
      expect((inputs[1].element as HTMLInputElement).checked).toBe(false);
    });

    it('BRadio inside group emits through group', async () => {
      const wrapper = mount(BRadioGroup, {
        props: { modelValue: 'opt1' },
        slots: {
          default: `
            <BRadio value="opt1">Option 1</BRadio>
            <BRadio value="opt2">Option 2</BRadio>
          `,
        },
        global: { components: { BRadio } },
      });
      const inputs = wrapper.findAll('input[type="radio"]');
      await inputs[1].trigger('change');
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['opt2']);
    });

    it('group disabled cascades to BRadio children', () => {
      const wrapper = mount(BRadioGroup, {
        props: { modelValue: 'opt1', disabled: true },
        slots: {
          default: `
            <BRadio value="opt1">Option 1</BRadio>
          `,
        },
        global: { components: { BRadio } },
      });
      const input = wrapper.find('input[type="radio"]');
      expect(input.attributes('disabled')).toBeDefined();
    });

    it('group name cascades to BRadio children', () => {
      const wrapper = mount(BRadioGroup, {
        props: { modelValue: 'opt1', name: 'group-name' },
        slots: {
          default: `
            <BRadio value="opt1">Option 1</BRadio>
          `,
        },
        global: { components: { BRadio } },
      });
      const input = wrapper.find('input[type="radio"]');
      expect(input.attributes('name')).toBe('group-name');
    });
  });

  // ─────────────────────────────────────────────
  // Button style rendering
  // ─────────────────────────────────────────────
  describe('button style rendering', () => {
    it('renders BRadioButton when optionType is button', () => {
      const wrapper = mount(BRadioGroup, {
        props: { options: defaultOptions, optionType: 'button' },
      });
      expect(wrapper.findAll('.b-radio-button').length).toBe(3);
    });

    it('applies block class when block prop is true', () => {
      const wrapper = mount(BRadioGroup, {
        props: { options: defaultOptions, block: true },
      });
      expect(wrapper.find('.b-radio-group--block').exists()).toBe(true);
    });
  });
});

// ═════════════════════════════════════════════
// BRadioButton
// ═════════════════════════════════════════════
describe('BRadioButton', () => {
  it('renders with default props', () => {
    const wrapper = mount(BRadioButton);
    expect(wrapper.find('.b-radio-button').exists()).toBe(true);
    expect(wrapper.find('input[type="radio"]').exists()).toBe(true);
  });

  it('renders slot content as label', () => {
    const wrapper = mount(BRadioButton, {
      slots: { default: 'Button A' },
    });
    expect(wrapper.find('.b-radio-button__label').text()).toBe('Button A');
  });

  it('renders checked state', () => {
    const wrapper = mount(BRadioButton, { props: { modelValue: true } });
    expect(wrapper.find('.b-radio-button--checked').exists()).toBe(true);
  });

  it('renders disabled state', () => {
    const wrapper = mount(BRadioButton, { props: { disabled: true } });
    expect(wrapper.find('.b-radio-button--disabled').exists()).toBe(true);
    expect(wrapper.find('input[type="radio"]').attributes('disabled')).toBeDefined();
  });

  it('emits update:modelValue when selected', async () => {
    const wrapper = mount(BRadioButton, { props: { modelValue: false } });
    await wrapper.find('input[type="radio"]').trigger('change');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
  });

  it('does not emit events when disabled', async () => {
    const wrapper = mount(BRadioButton, { props: { modelValue: false, disabled: true } });
    await wrapper.find('input[type="radio"]').trigger('change');
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('applies size class from group context', () => {
    const wrapper = mount(BRadioGroup, {
      props: { options: [{ label: 'A', value: 'a' }], optionType: 'button', size: 'large' },
    });
    expect(wrapper.find('.b-radio-button--large').exists()).toBe(true);
  });

  it('applies solid button style from group context', () => {
    const wrapper = mount(BRadioGroup, {
      props: { options: [{ label: 'A', value: 'a' }], optionType: 'button', buttonStyle: 'solid' },
    });
    expect(wrapper.find('.b-radio-button--solid').exists()).toBe(true);
  });
});
