import { BRadio, BRadioButton, BRadioGroup } from '@/components/BRadio';
import type { BRadioOption } from '@/components/BRadio/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

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
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    value: {
      control: 'text',
      description: 'Value used when inside a BRadioGroup.',
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
      description: 'Label content for the radio.',
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
          '<code>BRadio</code> is used to select a single item from a set of options. ' +
          'Supports controlled/uncontrolled usage via <code>v-model</code>, ' +
          'group composition with <code>BRadioGroup</code>, and button style via <code>BRadioButton</code> ' +
          'or <code>optionType="button"</code> on the group.',
      },
    },
  },
} satisfies Meta<typeof BRadio>;

export default meta;
type Story = StoryObj<typeof meta>;

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

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

export const Default: Story = {
  args: { modelValue: false, disabled: false },
  parameters: { docs: { source: { code: `<BRadio v-model="checked">Option A</BRadio>` } } },
  render: (args) => ({
    components: { BRadio },
    setup: () => {
      const checked = ref(args.modelValue);
      return { args, checked };
    },
    template: `<BRadio v-bind="args" v-model="checked">Option A</BRadio>`,
  }),
};

export const Checked: Story = {
  parameters: { docs: { source: { code: `<BRadio :model-value="true">Checked</BRadio>` } } },
  render: () => ({
    components: { BRadio },
    template: `<BRadio :model-value="true">Checked</BRadio>`,
  }),
};

export const Disabled: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BRadio :model-value="false" disabled>Disabled unchecked</BRadio>
<BRadio :model-value="true" disabled>Disabled checked</BRadio>
        `,
      },
    },
  },
  render: () => ({
    components: { BRadio },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <BRadio :model-value="false" disabled>Disabled unchecked</BRadio>
        <BRadio :model-value="true" disabled>Disabled checked</BRadio>
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
      source: { code: `<BRadioGroup v-model="selected" :options="fruitOptions" />` },
    },
  },
  render: () => ({
    components: { BRadioGroup },
    setup: () => {
      const selected = ref<string | number>('apple');
      return { selected, fruitOptions };
    },
    template: `
      <div>
        <BRadioGroup v-model="selected" :options="fruitOptions" />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Selected: {{ selected }}</p>
      </div>
    `,
  }),
};

export const GroupDisabled: Story = {
  parameters: {
    docs: { source: { code: `<BRadioGroup v-model="selected" :options="fruitOptions" disabled />` } },
  },
  render: () => ({
    components: { BRadioGroup },
    setup: () => {
      const selected = ref('apple');
      return { selected, fruitOptions };
    },
    template: `<BRadioGroup v-model="selected" :options="fruitOptions" disabled />`,
  }),
};

export const GroupWithDisabledOption: Story = {
  parameters: {
    docs: { source: { code: `<BRadioGroup v-model="selected" :options="optionsWithDisabled" />` } },
  },
  render: () => ({
    components: { BRadioGroup },
    setup: () => {
      const selected = ref<string | number>('a');
      return { selected, optionsWithDisabled };
    },
    template: `<BRadioGroup v-model="selected" :options="optionsWithDisabled" />`,
  }),
};

export const ButtonStyle: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Render the group as connected buttons via <code>option-type="button"</code>; use <code>button-style="solid"</code> for filled selection.',
      },
      source: {
        code: `
<BRadioGroup v-model="selected" :options="fruitOptions" option-type="button" />
<BRadioGroup v-model="selected" :options="fruitOptions" option-type="button" button-style="solid" />
        `,
      },
    },
  },
  render: () => ({
    components: { BRadioGroup },
    setup: () => {
      const outline = ref<string | number>('apple');
      const solid = ref<string | number>('banana');
      return { outline, solid, fruitOptions };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <BRadioGroup v-model="outline" :options="fruitOptions" option-type="button" />
        <BRadioGroup v-model="solid" :options="fruitOptions" option-type="button" button-style="solid" />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BRadioGroup option-type="button" size="large" :options="fruitOptions" />
<BRadioGroup option-type="button" size="middle" :options="fruitOptions" />
<BRadioGroup option-type="button" size="small" :options="fruitOptions" />
        `,
      },
    },
  },
  render: () => ({
    components: { BRadioGroup },
    setup: () => {
      const large = ref<string | number>('apple');
      const middle = ref<string | number>('apple');
      const small = ref<string | number>('apple');
      return { large, middle, small, fruitOptions };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <BRadioGroup v-model="large" :options="fruitOptions" option-type="button" size="large" />
        <BRadioGroup v-model="middle" :options="fruitOptions" option-type="button" size="middle" />
        <BRadioGroup v-model="small" :options="fruitOptions" option-type="button" size="small" />
      </div>
    `,
  }),
};

export const Composition: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BRadioGroup v-model="selected" name="hobbies">
  <BRadio value="reading">Reading</BRadio>
  <BRadio value="sports">Sports</BRadio>
  <BRadio value="music">Music</BRadio>
</BRadioGroup>
        `,
      },
    },
  },
  render: () => ({
    components: { BRadio, BRadioGroup },
    setup: () => {
      const selected = ref<string | number>('');
      return { selected };
    },
    template: `
      <BRadioGroup v-model="selected" name="hobbies">
        <BRadio value="reading">Reading</BRadio>
        <BRadio value="sports">Sports</BRadio>
        <BRadio value="music">Music</BRadio>
        <BRadio value="cooking" disabled>Cooking (disabled)</BRadio>
      </BRadioGroup>
    `,
  }),
};

export const ButtonComposition: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BRadioGroup v-model="selected" name="city">
  <BRadioButton value="hangzhou">Hangzhou</BRadioButton>
  <BRadioButton value="shanghai">Shanghai</BRadioButton>
  <BRadioButton value="beijing">Beijing</BRadioButton>
</BRadioGroup>
        `,
      },
    },
  },
  render: () => ({
    components: { BRadioButton, BRadioGroup },
    setup: () => {
      const selected = ref<string | number>('hangzhou');
      return { selected };
    },
    template: `
      <BRadioGroup v-model="selected" name="city">
        <BRadioButton value="hangzhou">Hangzhou</BRadioButton>
        <BRadioButton value="shanghai">Shanghai</BRadioButton>
        <BRadioButton value="beijing">Beijing</BRadioButton>
        <BRadioButton value="chengdu">Chengdu</BRadioButton>
      </BRadioGroup>
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
          'Renders native <code>&lt;input type="radio"&gt;</code>; <code>BRadioGroup</code> exposes <code>role="radiogroup"</code>. ' +
          'Reachable via <kbd>Tab</kbd>, options selected with <kbd>Arrow</kbd> keys.',
      },
    },
  },
  render: () => ({
    components: { BRadio, BRadioGroup },
    setup: () => {
      const single = ref(false);
      const group = ref<string | number>('');
      return { single, group, fruitOptions };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <BRadio v-model="single" id="a11y-single">I agree to the terms</BRadio>
        <BRadioGroup v-model="group" :options="fruitOptions" name="a11y-group" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const singleInput = canvas.getByLabelText('I agree to the terms') as HTMLInputElement;
    expect(singleInput).toBeTruthy();
    expect(singleInput.getAttribute('type')).toBe('radio');
    expect(singleInput.checked).toBe(false);

    await userEvent.click(singleInput);
    await waitFor(() => {
      expect(singleInput.checked).toBe(true);
    });

    const groupEl = canvasElement.querySelector('[role="radiogroup"]');
    expect(groupEl).toBeTruthy();

    const groupInputs = groupEl!.querySelectorAll('input[type="radio"]');
    expect(groupInputs.length).toBe(4);
    groupInputs.forEach((input) => {
      expect(input.getAttribute('name')).toBe('a11y-group');
    });

    const appleRadio = canvas.getByLabelText('Apple');
    const bananaRadio = canvas.getByLabelText('Banana');
    await userEvent.click(appleRadio);
    await waitFor(() => {
      expect((appleRadio as HTMLInputElement).checked).toBe(true);
    });
    await userEvent.click(bananaRadio);
    await waitFor(() => {
      expect((bananaRadio as HTMLInputElement).checked).toBe(true);
      expect((appleRadio as HTMLInputElement).checked).toBe(false);
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
          'Override <code>--b-radio-color-primary</code>, <code>--b-radio-size</code>, ' +
          'and <code>--b-radio-dot-size</code> on the component root.',
      },
      source: {
        code: `
<BRadio
  :model-value="true"
  style="
    --b-radio-color-primary: #22c55e;
    --b-radio-color-primary-hover: #16a34a;
    --b-radio-dot-size: 10px;
  "
>
  Green
</BRadio>
        `,
      },
    },
  },
  render: () => ({
    components: { BRadio },
    setup: () => {
      const a = ref(true);
      const b = ref(true);
      const c = ref(true);
      return { a, b, c };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <BRadio v-model="a">Default</BRadio>
        <BRadio
          v-model="b"
          style="--b-radio-color-primary: #22c55e; --b-radio-color-primary-hover: #16a34a; --b-radio-dot-size: 10px;"
        >
          Green
        </BRadio>
        <BRadio
          v-model="c"
          style="--b-radio-size: 24px; --b-radio-dot-size: 12px; --b-radio-font-size: 18px;"
        >
          Large
        </BRadio>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  { token: '--b-radio-size', defaultValue: '16px', description: 'Width and height of the radio indicator.' },
  { token: '--b-radio-dot-size', defaultValue: '8px', description: 'Size of the inner dot when checked.' },
  { token: '--b-radio-color-primary', defaultValue: '#1677ff', description: 'Primary color for checked state (border + dot).' },
  { token: '--b-radio-color-primary-hover', defaultValue: '#4096ff', description: 'Border color on hover.' },
  { token: '--b-radio-color-border', defaultValue: '#d9d9d9', description: 'Border color of the unchecked radio.' },
  { token: '--b-radio-color-bg-container', defaultValue: '#ffffff', description: 'Background of the unchecked radio.' },
  { token: '--b-radio-color-bg-container-disabled', defaultValue: 'rgba(0,0,0,0.04)', description: 'Background when disabled.' },
  { token: '--b-radio-color-text-disabled', defaultValue: 'rgba(0,0,0,0.25)', description: 'Label text color when disabled.' },
  { token: '--b-radio-color-border-disabled', defaultValue: '#d9d9d9', description: 'Border color when disabled.' },
  { token: '--b-radio-dot-color-disabled', defaultValue: 'rgba(0,0,0,0.25)', description: 'Dot color when disabled and checked.' },
  { token: '--b-radio-border-width', defaultValue: '1px', description: 'Border width of the radio indicator.' },
  { token: '--b-radio-font-size', defaultValue: '14px', description: 'Font size of the label text.' },
  { token: '--b-radio-line-height', defaultValue: '1.5714', description: 'Line height of the label text.' },
  { token: '--b-radio-wrapper-margin-inline-end', defaultValue: '8px', description: 'Right margin between radio items.' },
  { token: '--b-radio-transition-duration', defaultValue: '0.2s', description: 'Duration of color / state transitions.' },
  { token: '--b-radio-button-bg', defaultValue: '#ffffff', description: 'Background color of radio button.' },
  { token: '--b-radio-button-checked-bg', defaultValue: '#ffffff', description: 'Background color of checked radio button.' },
  { token: '--b-radio-button-color', defaultValue: 'rgba(0,0,0,0.88)', description: 'Text color of radio button.' },
  { token: '--b-radio-button-color-primary', defaultValue: '#1677ff', description: 'Primary color for checked outline style.' },
  { token: '--b-radio-button-solid-checked-bg', defaultValue: '#1677ff', description: 'Background of checked solid button.' },
  { token: '--b-radio-button-solid-checked-color', defaultValue: '#fff', description: 'Text color of checked solid button.' },
  { token: '--b-radio-button-padding-inline', defaultValue: '15px', description: 'Horizontal padding of radio button.' },
  { token: '--b-radio-button-border-width', defaultValue: '1px', description: 'Border width of radio button.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'All scoped CSS variables exposed by <code>BRadio</code> and <code>BRadioButton</code>. Override on the component root or any ancestor selector.',
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
