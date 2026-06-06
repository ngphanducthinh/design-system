import { BCheckbox, BCheckboxGroup } from '@/components/BCheckbox';
import type { BCheckboxOption } from '@/components/BCheckbox/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

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
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    indeterminate: {
      control: 'boolean',
      description: 'Indeterminate visual state (half-check).',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    value: {
      control: 'text',
      description: 'Value used when inside a BCheckboxGroup.',
      table: { category: 'Props' },
    },
    name: {
      control: 'text',
      description: 'The name attribute of the input element.',
      table: { category: 'Props' },
    },
    id: {
      control: 'text',
      description: 'Custom id attribute for the input.',
      table: { category: 'Props' },
    },
    default: {
      description: 'Label content for the checkbox.',
      table: { category: 'Slots' },
    },
    'onUpdate:modelValue': {
      description: 'Emitted when the checked state changes.',
      table: { category: 'Events' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          '<code>BCheckbox</code> is used to select multiple items from a set of options. ' +
          'Supports controlled/uncontrolled usage via <code>v-model</code>, indeterminate state, ' +
          'and group composition with <code>BCheckboxGroup</code>.',
      },
    },
  },
} satisfies Meta<typeof BCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

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

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

export const Default: Story = {
  args: { modelValue: false, disabled: false, indeterminate: false },
  parameters: { docs: { source: { code: `<BCheckbox v-model="checked">Remember me</BCheckbox>` } } },
  render: (args) => ({
    components: { BCheckbox },
    setup: () => {
      const checked = ref(args.modelValue);
      return { args, checked };
    },
    template: `<BCheckbox v-bind="args" v-model="checked">Remember me</BCheckbox>`,
  }),
};

export const Checked: Story = {
  parameters: { docs: { source: { code: `<BCheckbox :model-value="true">Checked</BCheckbox>` } } },
  render: () => ({
    components: { BCheckbox },
    template: `<BCheckbox :model-value="true">Checked</BCheckbox>`,
  }),
};

export const Indeterminate: Story = {
  parameters: { docs: { source: { code: `<BCheckbox :model-value="false" indeterminate>Indeterminate</BCheckbox>` } } },
  render: () => ({
    components: { BCheckbox },
    template: `<BCheckbox :model-value="false" indeterminate>Indeterminate</BCheckbox>`,
  }),
};

export const Disabled: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BCheckbox :model-value="false" disabled>Disabled unchecked</BCheckbox>
<BCheckbox :model-value="true" disabled>Disabled checked</BCheckbox>
        `,
      },
    },
  },
  render: () => ({
    components: { BCheckbox },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <BCheckbox :model-value="false" disabled>Disabled unchecked</BCheckbox>
        <BCheckbox :model-value="true" disabled>Disabled checked</BCheckbox>
        <BCheckbox :model-value="false" disabled indeterminate>Disabled indeterminate</BCheckbox>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

export const Group: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BCheckboxGroup v-model="selected" :options="fruitOptions" />`,
      },
    },
  },
  render: () => ({
    components: { BCheckboxGroup },
    setup: () => {
      const selected = ref<Array<string | number>>(['apple']);
      return { selected, fruitOptions };
    },
    template: `
      <div>
        <BCheckboxGroup v-model="selected" :options="fruitOptions" />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Selected: {{ selected }}</p>
      </div>
    `,
  }),
};

export const GroupDisabled: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BCheckboxGroup v-model="selected" :options="optionsWithDisabled" />`,
      },
    },
  },
  render: () => ({
    components: { BCheckboxGroup },
    setup: () => {
      const selected = ref<Array<string | number>>(['a']);
      return { selected, optionsWithDisabled };
    },
    template: `<BCheckboxGroup v-model="selected" :options="optionsWithDisabled" />`,
  }),
};

export const CheckAll: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Common "Select all / deselect all" pattern using a master checkbox driving an indeterminate state.',
      },
      source: {
        code: `
<BCheckbox :model-value="checkAll" :indeterminate="indeterminate" @update:model-value="onCheckAllChange">
  Check all
</BCheckbox>
<BCheckboxGroup v-model="selected" :options="fruitOptions" @change="onGroupChange" />
        `,
      },
    },
  },
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
      <div>
        <BCheckbox
          :model-value="checkAll"
          :indeterminate="indeterminate"
          @update:model-value="onCheckAllChange"
        >
          Check all
        </BCheckbox>
        <hr style="margin: 12px 0; border: none; border-top: 1px solid #eee;" />
        <BCheckboxGroup v-model="selected" :options="fruitOptions" @change="onGroupChange" />
      </div>
    `,
  }),
};

export const Composition: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BCheckboxGroup v-model="selected" name="hobbies">
  <BCheckbox value="reading">Reading</BCheckbox>
  <BCheckbox value="sports">Sports</BCheckbox>
  <BCheckbox value="music">Music</BCheckbox>
</BCheckboxGroup>
        `,
      },
    },
  },
  render: () => ({
    components: { BCheckbox, BCheckboxGroup },
    setup: () => {
      const selected = ref<Array<string | number>>([]);
      return { selected };
    },
    template: `
      <BCheckboxGroup v-model="selected" name="hobbies">
        <BCheckbox value="reading">Reading</BCheckbox>
        <BCheckbox value="sports">Sports</BCheckbox>
        <BCheckbox value="music">Music</BCheckbox>
        <BCheckbox value="cooking" disabled>Cooking (disabled)</BCheckbox>
      </BCheckboxGroup>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a native <code>&lt;input type="checkbox"&gt;</code>; <code>BCheckboxGroup</code> exposes <code>role="group"</code>. ' +
          'Reachable via <kbd>Tab</kbd>, toggle with <kbd>Space</kbd>.',
      },
    },
  },
  render: () => ({
    components: { BCheckbox, BCheckboxGroup },
    setup: () => {
      const single = ref(false);
      const group = ref<Array<string | number>>([]);
      return { single, group, fruitOptions };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <BCheckbox v-model="single" id="a11y-single">I agree to the terms</BCheckbox>
        <BCheckboxGroup v-model="group" :options="fruitOptions" name="a11y-group" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const singleInput = canvas.getByLabelText('I agree to the terms') as HTMLInputElement;
    expect(singleInput).toBeTruthy();
    expect(singleInput.getAttribute('type')).toBe('checkbox');
    expect(singleInput.checked).toBe(false);

    await userEvent.click(singleInput);
    await waitFor(() => {
      expect(singleInput.checked).toBe(true);
    });

    const groupEl = canvasElement.querySelector('[role="group"]');
    expect(groupEl).toBeTruthy();

    const groupInputs = groupEl!.querySelectorAll('input[type="checkbox"]');
    expect(groupInputs.length).toBe(4);
    groupInputs.forEach((input) => {
      expect(input.getAttribute('name')).toBe('a11y-group');
    });

    // Group interaction
    const appleCb = canvas.getByLabelText('Apple');
    await userEvent.click(appleCb);
    await waitFor(() => {
      expect((appleCb as HTMLInputElement).checked).toBe(true);
    });
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-checkbox-color-primary</code>, <code>--b-checkbox-size</code>, ' +
          'and <code>--b-checkbox-border-radius</code> on the component root.',
      },
      source: {
        code: `
<BCheckbox
  :model-value="true"
  style="
    --b-checkbox-color-primary: #22c55e;
    --b-checkbox-color-primary-hover: #16a34a;
    --b-checkbox-border-radius: 50%;
  "
>
  Green theme
</BCheckbox>
        `,
      },
    },
  },
  render: () => ({
    components: { BCheckbox },
    setup: () => {
      const a = ref(true);
      const b = ref(true);
      const c = ref(true);
      return { a, b, c };
    },
    template: `
      <div style="display: flex; gap: 32px; flex-wrap: wrap;">
        <BCheckbox v-model="a">Default</BCheckbox>
        <BCheckbox
          v-model="b"
          style="--b-checkbox-color-primary: #22c55e; --b-checkbox-color-primary-hover: #16a34a; --b-checkbox-border-radius: 50%;"
        >
          Green & round
        </BCheckbox>
        <BCheckbox
          v-model="c"
          style="--b-checkbox-size: 24px; --b-checkbox-border-radius: 6px; --b-checkbox-font-size: 18px;"
        >
          Large
        </BCheckbox>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  { token: '--b-checkbox-size', defaultValue: '16px', description: 'Width and height of the checkbox indicator.' },
  { token: '--b-checkbox-color-primary', defaultValue: '#1677ff', description: 'Primary color for checked / indeterminate states.' },
  { token: '--b-checkbox-color-primary-hover', defaultValue: '#4096ff', description: 'Primary color on hover.' },
  { token: '--b-checkbox-color-border', defaultValue: '#d9d9d9', description: 'Border color of the unchecked checkbox.' },
  { token: '--b-checkbox-color-bg-container', defaultValue: '#ffffff', description: 'Background of the unchecked checkbox.' },
  { token: '--b-checkbox-color-bg-container-disabled', defaultValue: 'rgba(0,0,0,0.04)', description: 'Background when disabled.' },
  { token: '--b-checkbox-color-text-disabled', defaultValue: 'rgba(0,0,0,0.25)', description: 'Text / check color when disabled.' },
  { token: '--b-checkbox-color-border-disabled', defaultValue: '#d9d9d9', description: 'Border color when disabled.' },
  { token: '--b-checkbox-border-radius', defaultValue: '4px', description: 'Border radius of the checkbox indicator.' },
  { token: '--b-checkbox-border-width', defaultValue: '1px', description: 'Border width of the checkbox indicator.' },
  { token: '--b-checkbox-font-size', defaultValue: '14px', description: 'Font size of the label text.' },
  { token: '--b-checkbox-line-height', defaultValue: '1.5714', description: 'Line height of the label text.' },
  { token: '--b-checkbox-check-color', defaultValue: '#fff', description: 'Color of the check mark / dash.' },
  { token: '--b-checkbox-transition-duration', defaultValue: '0.2s', description: 'Duration of color / state transitions.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'All scoped CSS variables exposed by <code>BCheckbox</code>. Override on the component root or any ancestor selector.',
      },
    },
  },
  render: () => ({
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:oklch(96% 0.002 260);">
            <th style="text-align:left;padding:10px 12px;">CSS Variable</th>
            <th style="text-align:left;padding:10px 12px;">Default</th>
            <th style="text-align:left;padding:10px 12px;">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in tokens" :key="t.token" style="border-bottom:1px solid oklch(94% 0.003 260);">
            <td style="padding:8px 12px;font-family:monospace;color:oklch(40% 0.18 280);"><code>{{ t.token }}</code></td>
            <td style="padding:8px 12px;font-family:monospace;color:#595959;">{{ t.defaultValue }}</td>
            <td style="padding:8px 12px;">{{ t.description }}</td>
          </tr>
        </tbody>
      </table>
    `,
  }),
};
