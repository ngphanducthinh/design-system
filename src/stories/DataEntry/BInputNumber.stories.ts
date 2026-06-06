import { BInputStatus, BInputVariant } from '@/components/BInput/types.ts';
import { BInputNumber } from '@/components/BInputNumber';
import { BCommonSize } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

const meta = {
  title: 'Data Entry/InputNumber',
  component: BInputNumber,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'number',
      description: 'Current numeric value (v-model).',
      table: { category: 'Two-Way Binding Props' },
    },
    size: {
      control: 'select',
      options: Object.values(BCommonSize),
      description: 'Size of the input number.',
      table: { category: 'Props', defaultValue: { summary: BCommonSize.Medium } },
    },
    variant: {
      control: 'select',
      options: Object.values(BInputVariant),
      description: 'Visual variant.',
      table: { category: 'Props', defaultValue: { summary: BInputVariant.Outlined } },
    },
    status: {
      control: 'select',
      options: [undefined, ...Object.values(BInputStatus)],
      description: 'Validation status.',
      table: { category: 'Props' },
    },
    min: {
      control: 'number',
      description: 'Minimum value.',
      table: { category: 'Props', defaultValue: { summary: 'Number.MIN_SAFE_INTEGER' } },
    },
    max: {
      control: 'number',
      description: 'Maximum value.',
      table: { category: 'Props', defaultValue: { summary: 'Number.MAX_SAFE_INTEGER' } },
    },
    step: {
      control: 'number',
      description: 'Increment / decrement step.',
      table: { category: 'Props', defaultValue: { summary: '1' } },
    },
    precision: {
      control: 'number',
      description: 'Decimal precision for display.',
      table: { category: 'Props' },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input number is disabled.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the input number is read-only.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    controls: {
      control: 'boolean',
      description: 'Whether to show +/- step controls.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    keyboard: {
      control: 'boolean',
      description: 'Whether keyboard arrows change value.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    changeOnBlur: {
      control: 'boolean',
      description: 'Whether to commit value on blur.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    changeOnWheel: {
      control: 'boolean',
      description: 'Whether mouse wheel changes value.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text.',
      table: { category: 'Props' },
    },
    prefix: { description: 'Inline prefix slot (e.g. currency symbol).', table: { category: 'Slots' } },
    suffix: { description: 'Inline suffix slot (e.g. percent sign).', table: { category: 'Slots' } },
    'onUpdate:modelValue': {
      description: 'Emitted when the numeric value changes.',
      table: { category: 'Events' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          '<code>BInputNumber</code> is a numeric input field supporting step controls, ' +
          'min/max constraints, precision, formatting, keyboard navigation, and validation states.',
      },
    },
  },
} satisfies Meta<typeof BInputNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

export const Default: Story = {
  args: {
    placeholder: 'Number',
    size: 'md',
    variant: 'outlined',
    disabled: false,
    controls: true,
    step: 1,
    min: 0,
    max: 100,
  },
  parameters: {
    docs: {
      source: { code: `<BInputNumber v-model="value" :min="0" :max="100" :step="1" />` },
    },
  },
  render: (args) => ({
    components: { BInputNumber },
    setup: () => {
      const value = ref<number | null>(null);
      return { args, value };
    },
    template: `
      <div style="max-width: 200px;">
        <BInputNumber v-bind="args" v-model="value" />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Value: {{ value }}</p>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BInputNumber size="sm" />
<BInputNumber size="md" />
<BInputNumber size="lg" />
        `,
      },
    },
  },
  render: () => ({
    components: { BInputNumber },
    setup: () => {
      const sm = ref<number | null>(1);
      const md = ref<number | null>(2);
      const lg = ref<number | null>(3);
      return { sm, md, lg };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 200px;">
        <div>
          <label for="size-sm" style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Small</label>
          <BInputNumber v-model="sm" size="sm" id="size-sm" />
        </div>
        <div>
          <label for="size-md" style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Medium (default)</label>
          <BInputNumber v-model="md" size="md" id="size-md" />
        </div>
        <div>
          <label for="size-lg" style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Large</label>
          <BInputNumber v-model="lg" size="lg" id="size-lg" />
        </div>
      </div>
    `,
  }),
};

export const Variants: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BInputNumber variant="outlined" />
<BInputNumber variant="filled" />
<BInputNumber variant="borderless" />
<BInputNumber variant="underlined" />
        `,
      },
    },
  },
  render: () => ({
    components: { BInputNumber },
    setup: () => {
      const outlined = ref<number | null>(10);
      const filled = ref<number | null>(20);
      const borderless = ref<number | null>(30);
      const underlined = ref<number | null>(40);
      return { outlined, filled, borderless, underlined };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 200px;">
        <div>
          <label for="variant-outlined" style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Outlined (default)</label>
          <BInputNumber v-model="outlined" variant="outlined" id="variant-outlined" />
        </div>
        <div>
          <label for="variant-filled" style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Filled</label>
          <BInputNumber v-model="filled" variant="filled" id="variant-filled" />
        </div>
        <div>
          <label for="variant-borderless" style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Borderless</label>
          <BInputNumber v-model="borderless" variant="borderless" id="variant-borderless" />
        </div>
        <div>
          <label for="variant-underlined" style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Underlined</label>
          <BInputNumber v-model="underlined" variant="underlined" id="variant-underlined" />
        </div>
      </div>
    `,
  }),
};

export const Status: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BInputNumber status="error" />
<BInputNumber status="warning" />
        `,
      },
    },
  },
  render: () => ({
    components: { BInputNumber },
    setup: () => {
      const err = ref<number | null>(null);
      const warn = ref<number | null>(null);
      return { err, warn };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 200px;">
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Error</p>
          <BInputNumber v-model="err" status="error" placeholder="Error state" />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Warning</p>
          <BInputNumber v-model="warn" status="warning" placeholder="Warning state" />
        </div>
      </div>
    `,
  }),
};

export const DisabledReadOnly: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BInputNumber :model-value="42" disabled />
<BInputNumber :model-value="99" read-only />
        `,
      },
    },
  },
  render: () => ({
    components: { BInputNumber },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 200px;">
        <div>
          <label for="disabled-input" style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Disabled</label>
          <BInputNumber :model-value="42" disabled id="disabled-input" />
        </div>
        <div>
          <label for="readonly-input" style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Read-only</label>
          <BInputNumber :model-value="99" read-only id="readonly-input" />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

export const MinMaxStep: Story = {
  parameters: {
    docs: {
      description: { story: 'Constrain the value with <code>min</code>/<code>max</code> and adjust the increment with <code>step</code>.' },
      source: { code: `<BInputNumber v-model="value" :min="0" :max="1" :step="0.1" :precision="1" />` },
    },
  },
  render: () => ({
    components: { BInputNumber },
    setup: () => {
      const v1 = ref<number | null>(5);
      const v2 = ref<number | null>(0);
      const v3 = ref<number | null>(1.0);
      return { v1, v2, v3 };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 200px;">
        <div>
          <label for="minmax-1" style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Min: 1, Max: 10, Step: 1</label>
          <BInputNumber v-model="v1" :min="1" :max="10" :step="1" id="minmax-1" />
        </div>
        <div>
          <label for="minmax-2" style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Min: 0, Max: 1, Step: 0.1</label>
          <BInputNumber v-model="v2" :min="0" :max="1" :step="0.1" :precision="1" id="minmax-2" />
        </div>
        <div>
          <label for="minmax-3" style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Step: 5</label>
          <BInputNumber v-model="v3" :step="5" id="minmax-3" />
        </div>
      </div>
    `,
  }),
};

export const FormatterParser: Story = {
  parameters: {
    docs: {
      description: { story: 'Format the displayed value via <code>:formatter</code>; reverse via <code>:parser</code>.' },
      source: {
        code: `
<BInputNumber
  v-model="amount"
  :formatter="(v) => '$ ' + v.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',')"
  :parser="(v) => v.replace(/\\$\\s?|(,*)/g, '')"
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BInputNumber },
    setup: () => {
      const currency = ref<number | null>(1000);
      const percent = ref<number | null>(50);
      const formatter1 = (val: string | number) => `$ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      const parser1 = (val: string) => val.replace(/\$\s?|(,*)/g, '');
      const formatter2 = (val: string | number) => `${val}%`;
      const parser2 = (val: string) => val.replace('%', '');
      return { currency, percent, formatter1, parser1, formatter2, parser2 };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 200px;">
        <div>
          <label for="fmt-currency" style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Currency formatter</label>
          <BInputNumber v-model="currency" :formatter="formatter1" :parser="parser1" id="fmt-currency" />
        </div>
        <div>
          <label for="fmt-percent" style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">Percentage formatter</label>
          <BInputNumber v-model="percent" :min="0" :max="100" :formatter="formatter2" :parser="parser2" id="fmt-percent" />
        </div>
      </div>
    `,
  }),
};

export const PrefixSuffix: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BInputNumber v-model="amount">
  <template #prefix>$</template>
</BInputNumber>
<BInputNumber v-model="percent">
  <template #suffix>%</template>
</BInputNumber>
        `,
      },
    },
  },
  render: () => ({
    components: { BInputNumber },
    setup: () => {
      const v1 = ref<number | null>(100);
      const v2 = ref<number | null>(25);
      return { v1, v2 };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 200px;">
        <div>
          <label for="prefix-input" style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">With prefix</label>
          <BInputNumber v-model="v1" :controls="false" id="prefix-input">
            <template #prefix>$</template>
          </BInputNumber>
        </div>
        <div>
          <label for="suffix-input" style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">With suffix</label>
          <BInputNumber v-model="v2" :controls="false" :min="0" :max="100" id="suffix-input">
            <template #suffix>%</template>
          </BInputNumber>
        </div>
      </div>
    `,
  }),
};

export const InteractionTest: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Types a value, uses arrow keys to nudge, clicks the up handle, and verifies max-clamping.',
      },
      source: { code: `<BInputNumber v-model="value" :min="0" :max="10" :step="1" />` },
    },
  },
  args: {
    placeholder: 'Number',
    min: 0,
    max: 10,
    step: 1,
  },
  render: (args) => ({
    components: { BInputNumber },
    setup: () => {
      const value = ref<number | null>(null);
      return { args, value };
    },
    template: `
      <div style="max-width: 200px;">
        <label for="interaction-num" style="display: block; margin-bottom: 4px; font-size: 14px;">Test</label>
        <BInputNumber v-bind="args" v-model="value" id="interaction-num" />
        <p data-testid="current-value" style="margin-top: 12px; font-size: 12px; color: #666;">Value: {{ value }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton') as HTMLInputElement;

    await userEvent.click(input);
    await userEvent.type(input, '5');
    await userEvent.tab();
    await waitFor(() => {
      expect(canvas.getByTestId('current-value').textContent).toContain('5');
    });

    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => {
      expect(canvas.getByTestId('current-value').textContent).toContain('6');
    });

    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(canvas.getByTestId('current-value').textContent).toContain('4');
    });

    const upBtn = canvasElement.querySelector('.b-input-number__handler--up')!;
    await userEvent.click(upBtn);
    await waitFor(() => {
      expect(canvas.getByTestId('current-value').textContent).toContain('5');
    });

    await userEvent.clear(input);
    await userEvent.type(input, '15');
    await userEvent.tab();
    await waitFor(() => {
      expect(canvas.getByTestId('current-value').textContent).toContain('10');
    });
  },
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders <code>role="spinbutton"</code> with <code>aria-valuenow</code>/<code>min</code>/<code>max</code>. ' +
          'Step handlers are <code>aria-hidden</code> with <code>tabindex="-1"</code> so keyboard users use arrow keys directly.',
      },
    },
  },
  render: () => ({
    components: { BInputNumber },
    setup: () => {
      const value = ref<number | null>(5);
      return { value };
    },
    template: `
      <div style="max-width: 200px;">
        <label for="a11y-input-number" style="display: block; margin-bottom: 4px; font-size: 14px;">Quantity</label>
        <BInputNumber v-model="value" id="a11y-input-number" :min="0" :max="20" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton') as HTMLInputElement;

    expect(input.id).toBe('a11y-input-number');
    expect(input.getAttribute('role')).toBe('spinbutton');
    expect(input.getAttribute('aria-valuenow')).toBe('5');
    expect(input.getAttribute('aria-valuemin')).toBe('0');
    expect(input.getAttribute('aria-valuemax')).toBe('20');

    await userEvent.clear(input);
    await userEvent.type(input, '10');
    await userEvent.tab();
    await waitFor(() => {
      expect(input.getAttribute('aria-valuenow')).toBe('10');
    });

    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => {
      expect(input.getAttribute('aria-valuenow')).toBe('11');
    });

    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(input.getAttribute('aria-valuenow')).toBe('10');
    });

    const handlerWrap = canvasElement.querySelector('.b-input-number__handler-wrap');
    expect(handlerWrap?.getAttribute('aria-hidden')).toBe('true');

    const upHandler = canvasElement.querySelector('.b-input-number__handler--up');
    expect(upHandler?.getAttribute('aria-label')).toBe('Increase value');
    expect(upHandler?.getAttribute('tabindex')).toBe('-1');
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
          'Override <code>--b-input-number-active-border-color</code>, <code>--b-input-number-handle-hover-color</code>, ' +
          '<code>--b-input-number-active-shadow</code>, and <code>--b-input-number-control-width</code> on the component root.',
      },
      source: {
        code: `
<BInputNumber
  v-model="value"
  style="
    --b-input-number-active-border-color: #7c3aed;
    --b-input-number-hover-border-color: #a78bfa;
    --b-input-number-handle-hover-color: #7c3aed;
  "
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BInputNumber },
    setup: () => {
      const v1 = ref<number | null>(10);
      const v2 = ref<number | null>(20);
      const v3 = ref<number | null>(30);
      return { v1, v2, v3 };
    },
    template: `
      <div style="display: flex; gap: 40px; flex-wrap: wrap;">
        <div>
          <label for="theme-default" style="display: block; margin-bottom: 8px; font-size: 12px; color: #666;">Default</label>
          <BInputNumber v-model="v1" id="theme-default" />
        </div>

        <div class="custom-input-number-purple">
          <label for="theme-purple" style="display: block; margin-bottom: 8px; font-size: 12px; color: #666;">Purple accent</label>
          <BInputNumber v-model="v2" id="theme-purple" />
        </div>

        <div class="custom-input-number-green">
          <label for="theme-green" style="display: block; margin-bottom: 8px; font-size: 12px; color: #666;">Green accent + wide</label>
          <BInputNumber v-model="v3" id="theme-green" />
        </div>
      </div>

      <style>
        .custom-input-number-purple .b-input-number {
          --b-input-number-active-border-color: #7c3aed;
          --b-input-number-hover-border-color: #a78bfa;
          --b-input-number-active-shadow: 0 0 0 2px rgba(124, 58, 237, 0.12);
          --b-input-number-handle-hover-color: #7c3aed;
        }
        .custom-input-number-green .b-input-number {
          --b-input-number-active-border-color: #16a34a;
          --b-input-number-hover-border-color: #4ade80;
          --b-input-number-active-shadow: 0 0 0 2px rgba(22, 163, 74, 0.12);
          --b-input-number-control-width: 140px;
        }
      </style>
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  { token: '--b-input-number-active-bg', defaultValue: '#ffffff', description: 'Background when focused.' },
  { token: '--b-input-number-active-border-color', defaultValue: '#1677ff', description: 'Border color when focused.' },
  { token: '--b-input-number-active-shadow', defaultValue: '0 0 0 2px rgba(5,145,255,0.1)', description: 'Box-shadow when focused.' },
  { token: '--b-input-number-addon-bg', defaultValue: 'rgba(0,0,0,0.02)', description: 'Background of addon elements.' },
  { token: '--b-input-number-control-width', defaultValue: '90px', description: 'Default width of the component.' },
  { token: '--b-input-number-error-active-shadow', defaultValue: '0 0 0 2px rgba(255,38,5,0.06)', description: 'Shadow during error state focus.' },
  { token: '--b-input-number-filled-handle-bg', defaultValue: '#f0f0f0', description: 'Handle background in filled variant.' },
  { token: '--b-input-number-handle-active-bg', defaultValue: 'rgba(0,0,0,0.02)', description: 'Handle background on click.' },
  { token: '--b-input-number-handle-bg', defaultValue: '#ffffff', description: 'Handle default background.' },
  { token: '--b-input-number-handle-border-color', defaultValue: '#d9d9d9', description: 'Handle border color.' },
  { token: '--b-input-number-handle-font-size', defaultValue: '7px', description: 'Handle icon size.' },
  { token: '--b-input-number-handle-hover-color', defaultValue: '#1677ff', description: 'Handle icon color on hover.' },
  { token: '--b-input-number-handle-width', defaultValue: '22px', description: 'Width of step handler column.' },
  { token: '--b-input-number-hover-bg', defaultValue: '#ffffff', description: 'Background on hover.' },
  { token: '--b-input-number-hover-border-color', defaultValue: '#4096ff', description: 'Border color on hover.' },
  { token: '--b-input-number-font-size', defaultValue: '14px', description: 'Standard font size.' },
  { token: '--b-input-number-font-size-lg', defaultValue: '16px', description: 'Large variant font size.' },
  { token: '--b-input-number-font-size-sm', defaultValue: '14px', description: 'Small variant font size.' },
  { token: '--b-input-number-padding-block', defaultValue: '4px', description: 'Vertical padding (medium).' },
  { token: '--b-input-number-padding-block-lg', defaultValue: '7px', description: 'Vertical padding (large).' },
  { token: '--b-input-number-padding-block-sm', defaultValue: '0px', description: 'Vertical padding (small).' },
  { token: '--b-input-number-padding-inline', defaultValue: '11px', description: 'Horizontal padding (medium).' },
  { token: '--b-input-number-padding-inline-lg', defaultValue: '11px', description: 'Horizontal padding (large).' },
  { token: '--b-input-number-padding-inline-sm', defaultValue: '7px', description: 'Horizontal padding (small).' },
  { token: '--b-input-number-warning-active-shadow', defaultValue: '0 0 0 2px rgba(255,215,5,0.1)', description: 'Shadow during warning state focus.' },
  { token: '--b-input-number-border-color', defaultValue: '#d9d9d9', description: 'Default border color.' },
  { token: '--b-input-number-bg', defaultValue: '#ffffff', description: 'Default background.' },
  { token: '--b-input-number-color', defaultValue: 'rgba(0,0,0,0.88)', description: 'Text color.' },
  { token: '--b-input-number-placeholder-color', defaultValue: 'rgba(0,0,0,0.25)', description: 'Placeholder color.' },
  { token: '--b-input-number-border-radius', defaultValue: '6px', description: 'Border radius.' },
  { token: '--b-input-number-disabled-bg', defaultValue: 'rgba(0,0,0,0.04)', description: 'Background when disabled.' },
  { token: '--b-input-number-disabled-color', defaultValue: 'rgba(0,0,0,0.25)', description: 'Text color when disabled.' },
  { token: '--b-input-number-error-border-color', defaultValue: '#ff4d4f', description: 'Border for error status.' },
  { token: '--b-input-number-error-hover-border-color', defaultValue: '#ff7875', description: 'Hover border for error.' },
  { token: '--b-input-number-warning-border-color', defaultValue: '#faad14', description: 'Border for warning status.' },
  { token: '--b-input-number-warning-hover-border-color', defaultValue: '#ffc53d', description: 'Hover border for warning.' },
  { token: '--b-input-number-filled-bg', defaultValue: 'rgba(0,0,0,0.04)', description: 'Background for filled variant.' },
  { token: '--b-input-number-filled-hover-bg', defaultValue: 'rgba(0,0,0,0.04)', description: 'Hover background for filled variant.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'All scoped CSS variables exposed by <code>BInputNumber</code>. Override on the component root or any ancestor selector.',
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
