import { BRadio, BRadioButton, BRadioGroup } from '@/components/BRadio';
import type { BRadioOption } from '@/components/BRadio/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Data Entry/Radio',
  component: BRadio,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'boolean',
      description: 'Whether the radio is checked.',
      table: { category: 'Two-Way Binding Props' },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the radio is disabled.',
      table: { defaultValue: { summary: 'false' } },
    },
    value: {
      control: 'text',
      description: 'Value used when inside a BRadioGroup.',
    },
    name: {
      control: 'text',
      description: 'The name attribute of the input element.',
    },
    id: {
      control: 'text',
      description: 'Custom id attribute for the input.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          '<code>BRadio</code> is used to select a single item from a set of options. ' +
          'Supports controlled/uncontrolled usage via <code>v-model</code>, ' +
          'and group composition with <code>BRadioGroup</code>.<br><br>' +
          'Supports button style via <code>BRadioButton</code> or <code>optionType="button"</code> on the group.<br><br>' +
          'Fully accessible with keyboard navigation (Tab + Arrow keys) and ARIA attributes.',
      },
    },
  },
} satisfies Meta<typeof BRadio>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Sample data
// ─────────────────────────────────────────────
const fruitOptions: BRadioOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Dragonfruit', value: 'dragonfruit' },
];

const optionsWithDisabled: BRadioOption[] = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B (disabled)', value: 'b', disabled: true },
  { label: 'Option C', value: 'c' },
];

// ═════════════════════════════════════════════
//   STORIES
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 1. Playground
// ─────────────────────────────────────────────
export const Playground: Story = {
  args: {
    modelValue: false,
    disabled: false,
  },
  render: (args) => ({
    components: { BRadio },
    setup: () => {
      const checked = ref(args.modelValue);
      return { args, checked };
    },
    template: `
      <div style="padding: 40px;">
        <BRadio v-bind="args" v-model="checked">
          Option A
        </BRadio>
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Checked: {{ checked }}</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 2. States
// ─────────────────────────────────────────────
export const States: Story = {
  render: () => ({
    components: { BRadio },
    setup: () => {
      const checked = ref(true);
      const unchecked = ref(false);
      return { checked, unchecked };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px;">
        <BRadio v-model="unchecked">Unchecked</BRadio>
        <BRadio v-model="checked">Checked</BRadio>
        <BRadio :model-value="false" disabled>Disabled unchecked</BRadio>
        <BRadio :model-value="true" disabled>Disabled checked</BRadio>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 3. Group with options
// ─────────────────────────────────────────────
export const Group: Story = {
  render: () => ({
    components: { BRadioGroup },
    setup: () => {
      const selected = ref<string | number>('apple');
      return { selected, fruitOptions };
    },
    template: `
      <div style="padding: 40px;">
        <BRadioGroup v-model="selected" :options="fruitOptions" />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Selected: {{ selected }}</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 4. Group disabled
// ─────────────────────────────────────────────
export const GroupDisabled: Story = {
  render: () => ({
    components: { BRadioGroup },
    setup: () => {
      const selected = ref('apple');
      return { selected, fruitOptions };
    },
    template: `
      <div style="padding: 40px;">
        <BRadioGroup v-model="selected" :options="fruitOptions" disabled />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Selected: {{ selected }}</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 5. Group with individually disabled options
// ─────────────────────────────────────────────
export const GroupWithDisabledOption: Story = {
  render: () => ({
    components: { BRadioGroup },
    setup: () => {
      const selected = ref<string | number>('a');
      return { selected, optionsWithDisabled };
    },
    template: `
      <div style="padding: 40px;">
        <BRadioGroup v-model="selected" :options="optionsWithDisabled" />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Selected: {{ selected }}</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 6. Button style
// ─────────────────────────────────────────────
export const ButtonStyle: Story = {
  render: () => ({
    components: { BRadioGroup },
    setup: () => {
      const outline = ref<string | number>('apple');
      const solid = ref<string | number>('banana');
      return { outline, solid, fruitOptions };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 24px;">
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Outline (default)</p>
          <BRadioGroup v-model="outline" :options="fruitOptions" option-type="button" />
        </div>
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Solid</p>
          <BRadioGroup v-model="solid" :options="fruitOptions" option-type="button" button-style="solid" />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 7. Sizes (button style)
// ─────────────────────────────────────────────
export const Sizes: Story = {
  render: () => ({
    components: { BRadioGroup },
    setup: () => {
      const large = ref<string | number>('apple');
      const middle = ref<string | number>('apple');
      const small = ref<string | number>('apple');
      return { large, middle, small, fruitOptions };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 24px;">
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Large</p>
          <BRadioGroup v-model="large" :options="fruitOptions" option-type="button" size="large" />
        </div>
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Middle (default)</p>
          <BRadioGroup v-model="middle" :options="fruitOptions" option-type="button" size="middle" />
        </div>
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Small</p>
          <BRadioGroup v-model="small" :options="fruitOptions" option-type="button" size="small" />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 8. Composition (slot children)
// ─────────────────────────────────────────────
export const Composition: Story = {
  render: () => ({
    components: { BRadio, BRadioGroup },
    setup: () => {
      const selected = ref<string | number>('');
      return { selected };
    },
    template: `
      <div style="padding: 40px;">
        <BRadioGroup v-model="selected" name="hobbies">
          <BRadio value="reading">Reading</BRadio>
          <BRadio value="sports">Sports</BRadio>
          <BRadio value="music">Music</BRadio>
          <BRadio value="cooking" disabled>Cooking (disabled)</BRadio>
        </BRadioGroup>
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Selected: {{ selected }}</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 9. Button Composition (slot children)
// ─────────────────────────────────────────────
export const ButtonComposition: Story = {
  render: () => ({
    components: { BRadioButton, BRadioGroup },
    setup: () => {
      const selected = ref<string | number>('hangzhou');
      return { selected };
    },
    template: `
      <div style="padding: 40px;">
        <BRadioGroup v-model="selected" name="city">
          <BRadioButton value="hangzhou">Hangzhou</BRadioButton>
          <BRadioButton value="shanghai">Shanghai</BRadioButton>
          <BRadioButton value="beijing">Beijing</BRadioButton>
          <BRadioButton value="chengdu">Chengdu</BRadioButton>
        </BRadioGroup>
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Selected: {{ selected }}</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 10. Accessibility
// ─────────────────────────────────────────────
export const Accessibility: Story = {
  render: () => ({
    components: { BRadio, BRadioGroup },
    setup: () => {
      const single = ref(false);
      const group = ref<string | number>('');
      return { single, group, fruitOptions };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 24px;">
        <div>
          <h4 style="margin-bottom: 8px; font-size: 14px;">Single radio</h4>
          <BRadio v-model="single" id="a11y-single">I agree to the terms</BRadio>
        </div>
        <div>
          <h4 style="margin-bottom: 8px; font-size: 14px;">Radio group</h4>
          <BRadioGroup v-model="group" :options="fruitOptions" name="a11y-group" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Single radio
    const singleInput = canvas.getByLabelText('I agree to the terms') as HTMLInputElement;
    expect(singleInput).toBeTruthy();
    expect(singleInput.getAttribute('type')).toBe('radio');
    expect(singleInput.checked).toBe(false);

    // Toggle via click
    await userEvent.click(singleInput);
    await waitFor(() => {
      expect(singleInput.checked).toBe(true);
    });

    // Group has role="radiogroup"
    const groupEl = canvasElement.querySelector('[role="radiogroup"]');
    expect(groupEl).toBeTruthy();

    // Group radios have name attribute
    const groupInputs = groupEl!.querySelectorAll('input[type="radio"]');
    expect(groupInputs.length).toBe(4);
    groupInputs.forEach((input) => {
      expect(input.getAttribute('name')).toBe('a11y-group');
    });
  },
};

// ─────────────────────────────────────────────
// 11. Theming (CSS vars override)
// ─────────────────────────────────────────────
export const Theming: Story = {
  render: () => ({
    components: { BRadio, BRadioGroup },
    setup: () => {
      const a = ref<string | number>('yes');
      const b = ref<string | number>('yes');
      const c = ref<string | number>('yes');
      return { a, b, c };
    },
    template: `
      <div style="padding: 40px; display: flex; gap: 48px; flex-wrap: wrap;">
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Default</p>
          <BRadioGroup v-model="a" :options="[{label: 'Yes', value: 'yes'}, {label: 'No', value: 'no'}]" />
        </div>

        <div class="custom-radio-theme-green">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Green accent</p>
          <BRadioGroup v-model="b" :options="[{label: 'Yes', value: 'yes'}, {label: 'No', value: 'no'}]" />
        </div>

        <div class="custom-radio-theme-large">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Large radio</p>
          <BRadioGroup v-model="c" :options="[{label: 'Yes', value: 'yes'}, {label: 'No', value: 'no'}]" />
        </div>
      </div>

      <style>
        .custom-radio-theme-green .b-radio {
          --b-radio-color-primary: #22c55e;
          --b-radio-color-primary-hover: #16a34a;
          --b-radio-dot-size: 10px;
        }
        .custom-radio-theme-large .b-radio {
          --b-radio-size: 24px;
          --b-radio-dot-size: 12px;
          --b-radio-font-size: 18px;
        }
      </style>
    `,
  }),
};

// ─────────────────────────────────────────────
// 12. Interaction test
// ─────────────────────────────────────────────
export const InteractionTest: Story = {
  render: () => ({
    components: { BRadio, BRadioGroup },
    setup: () => {
      const single = ref(false);
      const group = ref<string | number>('');
      return { single, group, fruitOptions };
    },
    template: `
      <div style="padding: 40px;">
        <div style="margin-bottom: 24px;">
          <BRadio v-model="single" id="interaction-single">Toggle me</BRadio>
          <p data-testid="single-value" style="margin-top: 8px; font-size: 12px; color: #666;">Single: {{ single }}</p>
        </div>
        <div>
          <BRadioGroup v-model="group" :options="fruitOptions" name="interaction-group" />
          <p data-testid="group-value" style="margin-top: 8px; font-size: 12px; color: #666;">Group: {{ group }}</p>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test single radio toggle
    const singleRadio = canvas.getByLabelText('Toggle me');
    expect((singleRadio as HTMLInputElement).checked).toBe(false);

    await userEvent.click(singleRadio);
    await waitFor(() => {
      expect((singleRadio as HTMLInputElement).checked).toBe(true);
      expect(canvas.getByTestId('single-value').textContent).toContain('true');
    });

    // Test group radios — selecting different options
    const appleRadio = canvas.getByLabelText('Apple');
    const bananaRadio = canvas.getByLabelText('Banana');

    await userEvent.click(appleRadio);
    await waitFor(() => {
      expect(canvas.getByTestId('group-value').textContent).toContain('apple');
    });

    await userEvent.click(bananaRadio);
    await waitFor(() => {
      expect(canvas.getByTestId('group-value').textContent).toContain('banana');
      expect((appleRadio as HTMLInputElement).checked).toBe(false);
      expect((bananaRadio as HTMLInputElement).checked).toBe(true);
    });
  },
};

// ─────────────────────────────────────────────
// 13. Design Token Reference (MUST BE LAST)
// ─────────────────────────────────────────────
export const DesignTokens: Story = {
  render: () => ({
    template: `
      <div style="padding: 40px; font-family: monospace; font-size: 13px; max-width: 1000px;">
        <h3 style="margin-bottom: 16px; font-size: 16px; font-family: sans-serif;">BRadio Design Tokens</h3>
        <p style="margin-bottom: 16px; font-size: 13px; font-family: sans-serif; color: #666;">
          Override these CSS variables on <code>.b-radio</code> or an ancestor to customize the component appearance.
        </p>
        <table style="width: 100%; border-collapse: collapse; background: #ffffff;">
          <thead>
            <tr style="border-bottom: 2px solid #e5e7eb;">
              <th style="text-align: left; padding: 8px 12px;">Variable</th>
              <th style="text-align: left; padding: 8px 12px;">Default</th>
              <th style="text-align: left; padding: 8px 12px;">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-size</td>
              <td style="padding: 8px 12px;">16px</td>
              <td style="padding: 8px 12px;">Width and height of the radio indicator</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-dot-size</td>
              <td style="padding: 8px 12px;">8px</td>
              <td style="padding: 8px 12px;">Size of the inner dot when checked</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-color-primary</td>
              <td style="padding: 8px 12px;">#1677ff</td>
              <td style="padding: 8px 12px;">Primary color for checked state (border + dot)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-color-primary-hover</td>
              <td style="padding: 8px 12px;">#4096ff</td>
              <td style="padding: 8px 12px;">Border color on hover</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-color-border</td>
              <td style="padding: 8px 12px;">#d9d9d9</td>
              <td style="padding: 8px 12px;">Border color of the unchecked radio</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-color-bg-container</td>
              <td style="padding: 8px 12px;">#ffffff</td>
              <td style="padding: 8px 12px;">Background of the unchecked radio</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-color-bg-container-disabled</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.04)</td>
              <td style="padding: 8px 12px;">Background when disabled</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-color-text-disabled</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.25)</td>
              <td style="padding: 8px 12px;">Label text color when disabled</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-color-border-disabled</td>
              <td style="padding: 8px 12px;">#d9d9d9</td>
              <td style="padding: 8px 12px;">Border color when disabled</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-dot-color-disabled</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.25)</td>
              <td style="padding: 8px 12px;">Dot color when disabled and checked</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-border-width</td>
              <td style="padding: 8px 12px;">1px</td>
              <td style="padding: 8px 12px;">Border width of the radio indicator</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-font-size</td>
              <td style="padding: 8px 12px;">14px</td>
              <td style="padding: 8px 12px;">Font size of the label text</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-line-height</td>
              <td style="padding: 8px 12px;">1.5714</td>
              <td style="padding: 8px 12px;">Line height of the label text</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-wrapper-margin-inline-end</td>
              <td style="padding: 8px 12px;">8px</td>
              <td style="padding: 8px 12px;">Right margin between radio items</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px;">--b-radio-transition-duration</td>
              <td style="padding: 8px 12px;">0.2s</td>
              <td style="padding: 8px 12px;">Duration of color/state transitions</td>
            </tr>
          </tbody>
        </table>

        <h3 style="margin-top: 32px; margin-bottom: 16px; font-size: 16px; font-family: sans-serif;">BRadioButton Design Tokens</h3>
        <p style="margin-bottom: 16px; font-size: 13px; font-family: sans-serif; color: #666;">
          Override these CSS variables on <code>.b-radio-button</code> or an ancestor to customize the button style appearance.
        </p>
        <table style="width: 100%; border-collapse: collapse; background: #ffffff;">
          <thead>
            <tr style="border-bottom: 2px solid #e5e7eb;">
              <th style="text-align: left; padding: 8px 12px;">Variable</th>
              <th style="text-align: left; padding: 8px 12px;">Default</th>
              <th style="text-align: left; padding: 8px 12px;">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-button-bg</td>
              <td style="padding: 8px 12px;">#ffffff</td>
              <td style="padding: 8px 12px;">Background color of radio button</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-button-checked-bg</td>
              <td style="padding: 8px 12px;">#ffffff</td>
              <td style="padding: 8px 12px;">Background color of checked radio button</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-button-color</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.88)</td>
              <td style="padding: 8px 12px;">Text color of radio button</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-button-color-primary</td>
              <td style="padding: 8px 12px;">#1677ff</td>
              <td style="padding: 8px 12px;">Primary color for checked outline style</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-button-solid-checked-bg</td>
              <td style="padding: 8px 12px;">#1677ff</td>
              <td style="padding: 8px 12px;">Background of checked solid button</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-button-solid-checked-color</td>
              <td style="padding: 8px 12px;">#fff</td>
              <td style="padding: 8px 12px;">Text color of checked solid button</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-radio-button-padding-inline</td>
              <td style="padding: 8px 12px;">15px</td>
              <td style="padding: 8px 12px;">Horizontal padding of radio button</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px;">--b-radio-button-border-width</td>
              <td style="padding: 8px 12px;">1px</td>
              <td style="padding: 8px 12px;">Border width of radio button</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
};
