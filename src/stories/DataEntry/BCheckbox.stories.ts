import { BCheckbox, BCheckboxGroup } from '@/components/BCheckbox';
import type { BCheckboxOption } from '@/components/BCheckbox/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Data Entry/Checkbox',
  component: BCheckbox,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'boolean',
      description: 'Whether the checkbox is checked.',
      table: { category: 'Two-Way Binding Props' },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled.',
      table: { defaultValue: { summary: 'false' } },
    },
    indeterminate: {
      control: 'boolean',
      description: 'Indeterminate visual state (half-check).',
      table: { defaultValue: { summary: 'false' } },
    },
    value: {
      control: 'text',
      description: 'Value used when inside a BCheckboxGroup.',
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
          '<code>BCheckbox</code> is used to select multiple items from a set of options. ' +
          'Supports controlled/uncontrolled usage via <code>v-model</code>, indeterminate state, ' +
          'and group composition with <code>BCheckboxGroup</code>.<br><br>' +
          'Fully accessible with keyboard navigation (Tab + Space) and ARIA attributes.',
      },
    },
  },
} satisfies Meta<typeof BCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Sample data
// ─────────────────────────────────────────────
const fruitOptions: BCheckboxOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Dragonfruit', value: 'dragonfruit' },
];

const optionsWithDisabled: BCheckboxOption[] = [
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
    indeterminate: false,
  },
  render: (args) => ({
    components: { BCheckbox },
    setup: () => {
      const checked = ref(args.modelValue);
      return { args, checked };
    },
    template: `
      <div style="padding: 40px;">
        <BCheckbox v-bind="args" v-model="checked">
          Remember me
        </BCheckbox>
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
    components: { BCheckbox },
    setup: () => {
      const checked = ref(true);
      const unchecked = ref(false);
      return { checked, unchecked };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px;">
        <BCheckbox v-model="unchecked">Unchecked</BCheckbox>
        <BCheckbox v-model="checked">Checked</BCheckbox>
        <BCheckbox :model-value="false" indeterminate>Indeterminate</BCheckbox>
        <BCheckbox :model-value="false" disabled>Disabled unchecked</BCheckbox>
        <BCheckbox :model-value="true" disabled>Disabled checked</BCheckbox>
        <BCheckbox :model-value="false" disabled indeterminate>Disabled indeterminate</BCheckbox>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 3. Group with options
// ─────────────────────────────────────────────
export const Group: Story = {
  render: () => ({
    components: { BCheckboxGroup },
    setup: () => {
      const selected = ref<Array<string | number>>(['apple']);
      return { selected, fruitOptions };
    },
    template: `
      <div style="padding: 40px;">
        <BCheckboxGroup v-model="selected" :options="fruitOptions" />
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
    components: { BCheckboxGroup },
    setup: () => {
      const selected = ref(['apple']);
      return { selected, fruitOptions };
    },
    template: `
      <div style="padding: 40px;">
        <BCheckboxGroup v-model="selected" :options="fruitOptions" disabled />
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
    components: { BCheckboxGroup },
    setup: () => {
      const selected = ref<Array<string | number>>(['a']);
      return { selected, optionsWithDisabled };
    },
    template: `
      <div style="padding: 40px;">
        <BCheckboxGroup v-model="selected" :options="optionsWithDisabled" />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Selected: {{ selected }}</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 6. Check All / Indeterminate pattern
// ─────────────────────────────────────────────
export const CheckAll: Story = {
  render: () => ({
    components: { BCheckbox, BCheckboxGroup },
    setup: () => {
      const allValues = fruitOptions.map((o) => o.value);
      const selected = ref<Array<string | number>>(['apple', 'banana']);
      const checkAll = ref(false);
      const indeterminate = ref(true);

      const onCheckAllChange = (val: boolean) => {
        selected.value = val ? [...allValues] : [];
        indeterminate.value = false;
        checkAll.value = val;
      };

      const onGroupChange = (vals: Array<string | number>) => {
        checkAll.value = vals.length === allValues.length;
        indeterminate.value = vals.length > 0 && vals.length < allValues.length;
      };

      return { selected, checkAll, indeterminate, fruitOptions, onCheckAllChange, onGroupChange };
    },
    template: `
      <div style="padding: 40px;">
        <BCheckbox
          :model-value="checkAll"
          :indeterminate="indeterminate"
          @update:model-value="onCheckAllChange"
        >
          Check all
        </BCheckbox>
        <hr style="margin: 12px 0; border: none; border-top: 1px solid #eee;" />
        <BCheckboxGroup
          v-model="selected"
          :options="fruitOptions"
          @change="onGroupChange"
        />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Selected: {{ selected }}</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 7. Group with BCheckbox children (composition)
// ─────────────────────────────────────────────
export const Composition: Story = {
  render: () => ({
    components: { BCheckbox, BCheckboxGroup },
    setup: () => {
      const selected = ref<Array<string | number>>([]);
      return { selected };
    },
    template: `
      <div style="padding: 40px;">
        <BCheckboxGroup v-model="selected" name="hobbies">
          <BCheckbox value="reading">Reading</BCheckbox>
          <BCheckbox value="sports">Sports</BCheckbox>
          <BCheckbox value="music">Music</BCheckbox>
          <BCheckbox value="cooking" disabled>Cooking (disabled)</BCheckbox>
        </BCheckboxGroup>
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Selected: {{ selected }}</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 8. Accessibility
// ─────────────────────────────────────────────
export const Accessibility: Story = {
  render: () => ({
    components: { BCheckbox, BCheckboxGroup },
    setup: () => {
      const single = ref(false);
      const group = ref<Array<string | number>>([]);
      return { single, group, fruitOptions };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 24px;">
        <div>
          <h4 style="margin-bottom: 8px; font-size: 14px;">Single checkbox</h4>
          <BCheckbox v-model="single" id="a11y-single">I agree to the terms</BCheckbox>
        </div>
        <div>
          <h4 style="margin-bottom: 8px; font-size: 14px;">Checkbox group</h4>
          <BCheckboxGroup v-model="group" :options="fruitOptions" name="a11y-group" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Single checkbox
    const singleInput = canvas.getByLabelText('I agree to the terms') as HTMLInputElement;
    expect(singleInput).toBeTruthy();
    expect(singleInput.getAttribute('type')).toBe('checkbox');
    expect(singleInput.checked).toBe(false);

    // Toggle via click
    await userEvent.click(singleInput);
    await waitFor(() => {
      expect(singleInput.checked).toBe(true);
    });

    // Group has role="group"
    const groupEl = canvasElement.querySelector('[role="group"]');
    expect(groupEl).toBeTruthy();

    // Group checkboxes have name attribute
    const groupInputs = groupEl!.querySelectorAll('input[type="checkbox"]');
    expect(groupInputs.length).toBe(4);
    groupInputs.forEach((input) => {
      expect(input.getAttribute('name')).toBe('a11y-group');
    });
  },
};

// ─────────────────────────────────────────────
// 9. Theming (CSS vars override)
// ─────────────────────────────────────────────
export const Theming: Story = {
  render: () => ({
    components: { BCheckbox },
    setup: () => {
      const a = ref(true);
      const b = ref(true);
      const c = ref(true);
      return { a, b, c };
    },
    template: `
      <div style="padding: 40px; display: flex; gap: 48px; flex-wrap: wrap;">
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Default</p>
          <BCheckbox v-model="a">Default theme</BCheckbox>
        </div>

        <div class="custom-cb-theme-green">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Green accent</p>
          <BCheckbox v-model="b">Green theme</BCheckbox>
        </div>

        <div class="custom-cb-theme-large">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Large checkbox</p>
          <BCheckbox v-model="c">Large theme</BCheckbox>
        </div>
      </div>

      <style>
        .custom-cb-theme-green .b-checkbox {
          --b-checkbox-color-primary: #22c55e;
          --b-checkbox-color-primary-hover: #16a34a;
          --b-checkbox-border-radius: 50%;
        }
        .custom-cb-theme-large .b-checkbox {
          --b-checkbox-size: 24px;
          --b-checkbox-border-radius: 6px;
          --b-checkbox-font-size: 18px;
        }
      </style>
    `,
  }),
};

// ─────────────────────────────────────────────
// 10. Interaction test
// ─────────────────────────────────────────────
export const InteractionTest: Story = {
  render: () => ({
    components: { BCheckbox, BCheckboxGroup },
    setup: () => {
      const single = ref(false);
      const group = ref<Array<string | number>>([]);
      return { single, group, fruitOptions };
    },
    template: `
      <div style="padding: 40px;">
        <div style="margin-bottom: 24px;">
          <BCheckbox v-model="single" id="interaction-single">Toggle me</BCheckbox>
          <p data-testid="single-value" style="margin-top: 8px; font-size: 12px; color: #666;">Single: {{ single }}</p>
        </div>
        <div>
          <BCheckboxGroup v-model="group" :options="fruitOptions" name="interaction-group" />
          <p data-testid="group-value" style="margin-top: 8px; font-size: 12px; color: #666;">Group: {{ group }}</p>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test single checkbox toggle
    const singleCb = canvas.getByLabelText('Toggle me');
    expect((singleCb as HTMLInputElement).checked).toBe(false);

    await userEvent.click(singleCb);
    await waitFor(() => {
      expect((singleCb as HTMLInputElement).checked).toBe(true);
      expect(canvas.getByTestId('single-value').textContent).toContain('true');
    });

    await userEvent.click(singleCb);
    await waitFor(() => {
      expect((singleCb as HTMLInputElement).checked).toBe(false);
      expect(canvas.getByTestId('single-value').textContent).toContain('false');
    });

    // Test group checkboxes
    const appleCb = canvas.getByLabelText('Apple');
    const bananaCb = canvas.getByLabelText('Banana');

    await userEvent.click(appleCb);
    await waitFor(() => {
      expect(canvas.getByTestId('group-value').textContent).toContain('apple');
    });

    await userEvent.click(bananaCb);
    await waitFor(() => {
      expect(canvas.getByTestId('group-value').textContent).toContain('banana');
    });

    // Uncheck apple
    await userEvent.click(appleCb);
    await waitFor(() => {
      const text = canvas.getByTestId('group-value').textContent!;
      expect(text).not.toContain('apple');
      expect(text).toContain('banana');
    });
  },
};

// ─────────────────────────────────────────────
// 11. Design Token Reference (MUST BE LAST)
// ─────────────────────────────────────────────
export const DesignTokens: Story = {
  render: () => ({
    template: `
      <div style="padding: 40px; font-family: monospace; font-size: 13px; max-width: 900px;">
        <h3 style="margin-bottom: 16px; font-size: 16px; font-family: sans-serif;">BCheckbox Design Tokens</h3>
        <p style="margin-bottom: 16px; font-size: 13px; font-family: sans-serif; color: #666;">
          Override these CSS variables on <code>.b-checkbox</code> or an ancestor to customize the component appearance.
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
              <td style="padding: 8px 12px;">--b-checkbox-size</td>
              <td style="padding: 8px 12px;">16px</td>
              <td style="padding: 8px 12px;">Width and height of the checkbox indicator</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-checkbox-color-primary</td>
              <td style="padding: 8px 12px;">#1677ff</td>
              <td style="padding: 8px 12px;">Primary color for checked/indeterminate states</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-checkbox-color-primary-hover</td>
              <td style="padding: 8px 12px;">#4096ff</td>
              <td style="padding: 8px 12px;">Primary color on hover</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-checkbox-color-border</td>
              <td style="padding: 8px 12px;">#d9d9d9</td>
              <td style="padding: 8px 12px;">Border color of the unchecked checkbox</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-checkbox-color-bg-container</td>
              <td style="padding: 8px 12px;">#ffffff</td>
              <td style="padding: 8px 12px;">Background of the unchecked checkbox</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-checkbox-color-bg-container-disabled</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.04)</td>
              <td style="padding: 8px 12px;">Background when disabled</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-checkbox-color-text-disabled</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.25)</td>
              <td style="padding: 8px 12px;">Text/check color when disabled</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-checkbox-color-border-disabled</td>
              <td style="padding: 8px 12px;">#d9d9d9</td>
              <td style="padding: 8px 12px;">Border color when disabled</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-checkbox-border-radius</td>
              <td style="padding: 8px 12px;">4px</td>
              <td style="padding: 8px 12px;">Border radius of the checkbox indicator</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-checkbox-border-width</td>
              <td style="padding: 8px 12px;">1px</td>
              <td style="padding: 8px 12px;">Border width of the checkbox indicator</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-checkbox-font-size</td>
              <td style="padding: 8px 12px;">14px</td>
              <td style="padding: 8px 12px;">Font size of the label text</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-checkbox-line-height</td>
              <td style="padding: 8px 12px;">1.5714</td>
              <td style="padding: 8px 12px;">Line height of the label text</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-checkbox-check-color</td>
              <td style="padding: 8px 12px;">#fff</td>
              <td style="padding: 8px 12px;">Color of the check mark / dash</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px;">--b-checkbox-transition-duration</td>
              <td style="padding: 8px 12px;">0.2s</td>
              <td style="padding: 8px 12px;">Duration of color/state transitions</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
};
