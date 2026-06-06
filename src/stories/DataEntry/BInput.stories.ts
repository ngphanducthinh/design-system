import { BInput } from '@/components/BInput';
import { BInputStatus, BInputVariant } from '@/components/BInput/types.ts';
import { BCommonSize } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

const meta = {
  title: 'Data Entry/Input',
  component: BInput,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'Current input value (v-model).',
      table: { category: 'Two-Way Binding Props' },
    },
    size: {
      control: 'select',
      options: Object.values(BCommonSize),
      description: 'Size of the input.',
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
    type: {
      control: 'text',
      description: 'HTML input type.',
      table: { category: 'Props', defaultValue: { summary: 'text' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the input is read-only.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text.',
      table: { category: 'Props' },
    },
    maxLength: {
      control: 'number',
      description: 'Maximum character length.',
      table: { category: 'Props' },
    },
    allowClear: {
      control: 'boolean',
      description: 'Show clear button.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    showCount: {
      control: 'boolean',
      description: 'Display character count.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    prefix: { description: 'Content placed before the input value.', table: { category: 'Slots' } },
    suffix: { description: 'Content placed after the input value.', table: { category: 'Slots' } },
    addonBefore: { description: 'Addon rendered before the input.', table: { category: 'Slots' } },
    addonAfter: { description: 'Addon rendered after the input.', table: { category: 'Slots' } },
    'onUpdate:modelValue': { description: 'Emitted when the input value changes.', table: { category: 'Events' } },
    onPressEnter: { description: 'Emitted when Enter is pressed.', table: { category: 'Events' } },
  },
  parameters: {
    docs: {
      description: {
        component:
          '<code>BInput</code> is a text input field supporting multiple variants, ' +
          'sizes, prefix/suffix slots, addons, clear button, character counting, ' +
          'password visibility toggle, and validation states.',
      },
    },
  },
} satisfies Meta<typeof BInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

export const Default: Story = {
  args: { placeholder: 'Enter text...', size: 'md', variant: 'outlined', allowClear: true },
  parameters: { docs: { source: { code: `<BInput v-model="value" placeholder="Enter text..." />` } } },
  render: (args) => ({
    components: { BInput },
    setup: () => {
      const value = ref('');
      return { args, value };
    },
    template: `<div style="max-width: 320px;"><BInput v-bind="args" v-model="value" /></div>`,
  }),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BInput size="sm" placeholder="Small" />
<BInput size="md" placeholder="Medium" />
<BInput size="lg" placeholder="Large" />
        `,
      },
    },
  },
  render: () => ({
    components: { BInput },
    setup: () => {
      const sm = ref('');
      const md = ref('');
      const lg = ref('');
      return { sm, md, lg };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 320px;">
        <BInput v-model="sm" size="sm" placeholder="Small input" />
        <BInput v-model="md" size="md" placeholder="Medium input" />
        <BInput v-model="lg" size="lg" placeholder="Large input" />
      </div>
    `,
  }),
};

export const Outlined: Story = {
  parameters: { docs: { source: { code: `<BInput variant="outlined" placeholder="Outlined" />` } } },
  render: () => ({
    components: { BInput },
    setup: () => ({ value: ref('') }),
    template: `<div style="max-width: 320px;"><BInput v-model="value" variant="outlined" placeholder="Outlined" /></div>`,
  }),
};

export const Filled: Story = {
  parameters: { docs: { source: { code: `<BInput variant="filled" placeholder="Filled" />` } } },
  render: () => ({
    components: { BInput },
    setup: () => ({ value: ref('') }),
    template: `<div style="max-width: 320px;"><BInput v-model="value" variant="filled" placeholder="Filled" /></div>`,
  }),
};

export const Borderless: Story = {
  parameters: { docs: { source: { code: `<BInput variant="borderless" placeholder="Borderless" />` } } },
  render: () => ({
    components: { BInput },
    setup: () => ({ value: ref('') }),
    template: `<div style="max-width: 320px;"><BInput v-model="value" variant="borderless" placeholder="Borderless" /></div>`,
  }),
};

export const Underlined: Story = {
  parameters: { docs: { source: { code: `<BInput variant="underlined" placeholder="Underlined" />` } } },
  render: () => ({
    components: { BInput },
    setup: () => ({ value: ref('') }),
    template: `<div style="max-width: 320px;"><BInput v-model="value" variant="underlined" placeholder="Underlined" /></div>`,
  }),
};

export const Status: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BInput status="error" placeholder="Error" />
<BInput status="warning" placeholder="Warning" />
        `,
      },
    },
  },
  render: () => ({
    components: { BInput },
    setup: () => {
      const err = ref('');
      const warn = ref('');
      return { err, warn };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 320px;">
        <BInput v-model="err" status="error" placeholder="Error state" />
        <BInput v-model="warn" status="warning" placeholder="Warning state" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  parameters: { docs: { source: { code: `<BInput model-value="Disabled input" disabled />` } } },
  render: () => ({
    components: { BInput },
    template: `<div style="max-width: 320px;"><BInput model-value="Disabled input" disabled placeholder="Disabled" /></div>`,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

export const WithPrefixSuffix: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BInput v-model="amount" placeholder="Amount">
  <template #prefix>$</template>
  <template #suffix>USD</template>
</BInput>
        `,
      },
    },
  },
  render: () => ({
    components: { BInput },
    setup: () => {
      const v1 = ref('');
      const v2 = ref('');
      const v3 = ref('');
      return { v1, v2, v3 };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 360px;">
        <BInput v-model="v1" placeholder="Amount">
          <template #prefix>$</template>
        </BInput>
        <BInput v-model="v2" placeholder="Weight">
          <template #suffix>kg</template>
        </BInput>
        <BInput v-model="v3" placeholder="Website">
          <template #prefix>🔗</template>
          <template #suffix>.com</template>
        </BInput>
      </div>
    `,
  }),
};

export const WithAddons: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BInput v-model="url" placeholder="Enter URL">
  <template #addonBefore>https://</template>
  <template #addonAfter>.com</template>
</BInput>
        `,
      },
    },
  },
  render: () => ({
    components: { BInput },
    setup: () => ({ url: ref('mysite') }),
    template: `
      <div style="max-width: 400px;">
        <BInput v-model="url" placeholder="Enter URL">
          <template #addonBefore>https://</template>
          <template #addonAfter>.com</template>
        </BInput>
      </div>
    `,
  }),
};

export const PasswordWithToggle: Story = {
  parameters: {
    docs: { source: { code: `<BInput v-model="pwd" type="password" placeholder="Enter password" />` } },
  },
  render: () => ({
    components: { BInput },
    setup: () => ({ pwd: ref('') }),
    template: `<div style="max-width: 320px;"><BInput v-model="pwd" type="password" placeholder="Enter password" /></div>`,
  }),
};

export const WithCharacterCount: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BInput v-model="value" :show-count="true" :max-length="20" placeholder="Max 20 chars" />`,
      },
    },
  },
  render: () => ({
    components: { BInput },
    setup: () => {
      const v1 = ref('');
      const v2 = ref('');
      return { v1, v2 };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 320px;">
        <BInput v-model="v1" :show-count="true" placeholder="Type something" aria-label="Counted input" />
        <BInput v-model="v2" :show-count="true" :max-length="20" placeholder="Max 20 chars" aria-label="Counted with limit" />
      </div>
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
          'Renders a native <code>&lt;input&gt;</code> with <code>role="textbox"</code>. ' +
          'When <code>showCount</code> is on, the count region is announced via <code>aria-live="polite"</code>.',
      },
    },
  },
  render: () => ({
    components: { BInput },
    setup: () => {
      const value = ref('');
      return { value };
    },
    template: `
      <div style="max-width: 320px;">
        <label for="username-input" style="display: block; margin-bottom: 4px; font-size: 14px;">Username</label>
        <BInput v-model="value" id="username-input" placeholder="Enter username" :show-count="true" :max-length="20" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox') as HTMLInputElement;

    expect(input.id).toBe('username-input');
    expect(input.getAttribute('aria-describedby')).toBeTruthy();

    await userEvent.type(input, 'testuser');
    await waitFor(() => {
      expect(input.value).toBe('testuser');
    });

    const count = canvasElement.querySelector('.b-input__count');
    expect(count).toBeTruthy();
    expect(count!.getAttribute('aria-live')).toBe('polite');

    await userEvent.keyboard('{Enter}');

    await userEvent.clear(input);
    await userEvent.tab();
    await waitFor(() => {
      const wrapper = canvasElement.querySelector('.b-input');
      expect(wrapper!.classList.contains('b-input--focused')).toBe(false);
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
          'Override <code>--b-input-active-border-color</code>, <code>--b-input-hover-border-color</code>, ' +
          '<code>--b-input-active-shadow</code>, and <code>--b-input-border-radius</code> on the component root.',
      },
      source: {
        code: `
<BInput
  v-model="value"
  placeholder="Purple theme"
  style="
    --b-input-active-border-color: #7c3aed;
    --b-input-hover-border-color: #a78bfa;
    --b-input-active-shadow: 0 0 0 2px rgba(124, 58, 237, 0.12);
    --b-input-border-radius: 12px;
  "
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BInput },
    setup: () => {
      const v1 = ref('');
      const v2 = ref('');
      const v3 = ref('');
      return { v1, v2, v3 };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 360px;">
        <BInput v-model="v1" placeholder="Default" />
        <BInput
          v-model="v2"
          placeholder="Purple"
          style="--b-input-active-border-color: #7c3aed; --b-input-hover-border-color: #a78bfa; --b-input-active-shadow: 0 0 0 2px rgba(124, 58, 237, 0.12); --b-input-border-radius: 12px;"
        />
        <BInput
          v-model="v3"
          variant="filled"
          placeholder="Green filled"
          style="--b-input-active-border-color: #16a34a; --b-input-hover-border-color: #4ade80; --b-input-filled-bg: rgba(22, 163, 74, 0.06);"
        />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  { token: '--b-input-bg', defaultValue: '#ffffff', description: 'Default background color.' },
  { token: '--b-input-color', defaultValue: 'rgba(0,0,0,0.88)', description: 'Text color.' },
  { token: '--b-input-placeholder-color', defaultValue: 'rgba(0,0,0,0.25)', description: 'Placeholder text color.' },
  { token: '--b-input-border-color', defaultValue: '#d9d9d9', description: 'Default border color.' },
  { token: '--b-input-border-radius', defaultValue: '6px', description: 'Border radius.' },
  { token: '--b-input-active-bg', defaultValue: '#ffffff', description: 'Background when focused.' },
  { token: '--b-input-active-border-color', defaultValue: '#1677ff', description: 'Border color when focused.' },
  { token: '--b-input-active-shadow', defaultValue: '0 0 0 2px rgba(5,145,255,0.1)', description: 'Box shadow when focused.' },
  { token: '--b-input-hover-bg', defaultValue: '#ffffff', description: 'Background on hover.' },
  { token: '--b-input-hover-border-color', defaultValue: '#4096ff', description: 'Border color on hover.' },
  { token: '--b-input-disabled-bg', defaultValue: 'rgba(0,0,0,0.04)', description: 'Background when disabled.' },
  { token: '--b-input-disabled-color', defaultValue: 'rgba(0,0,0,0.25)', description: 'Text color when disabled.' },
  { token: '--b-input-error-border-color', defaultValue: '#ff4d4f', description: 'Border color for error status.' },
  { token: '--b-input-error-hover-border-color', defaultValue: '#ff7875', description: 'Hover border color for error.' },
  { token: '--b-input-error-active-shadow', defaultValue: '0 0 0 2px rgba(255,38,5,0.06)', description: 'Shadow during error focus.' },
  { token: '--b-input-warning-border-color', defaultValue: '#faad14', description: 'Border color for warning status.' },
  { token: '--b-input-warning-hover-border-color', defaultValue: '#ffc53d', description: 'Hover border color for warning.' },
  { token: '--b-input-warning-active-shadow', defaultValue: '0 0 0 2px rgba(255,215,5,0.1)', description: 'Shadow during warning focus.' },
  { token: '--b-input-filled-bg', defaultValue: 'rgba(0,0,0,0.04)', description: 'Background for filled variant.' },
  { token: '--b-input-filled-hover-bg', defaultValue: 'rgba(0,0,0,0.04)', description: 'Hover background for filled variant.' },
  { token: '--b-input-addon-bg', defaultValue: 'rgba(0,0,0,0.02)', description: 'Background of addon elements.' },
  { token: '--b-input-clear-color', defaultValue: 'rgba(0,0,0,0.25)', description: 'Clear button icon color.' },
  { token: '--b-input-clear-hover-color', defaultValue: 'rgba(0,0,0,0.45)', description: 'Clear button hover color.' },
  { token: '--b-input-count-color', defaultValue: 'rgba(0,0,0,0.45)', description: 'Character count text color.' },
  { token: '--b-input-font-size', defaultValue: '14px', description: 'Standard font size.' },
  { token: '--b-input-font-size-lg', defaultValue: '16px', description: 'Large variant font size.' },
  { token: '--b-input-font-size-sm', defaultValue: '14px', description: 'Small variant font size.' },
  { token: '--b-input-padding-block', defaultValue: '4px', description: 'Vertical padding (medium).' },
  { token: '--b-input-padding-block-lg', defaultValue: '7px', description: 'Vertical padding (large).' },
  { token: '--b-input-padding-block-sm', defaultValue: '0px', description: 'Vertical padding (small).' },
  { token: '--b-input-padding-inline', defaultValue: '11px', description: 'Horizontal padding (medium).' },
  { token: '--b-input-padding-inline-lg', defaultValue: '11px', description: 'Horizontal padding (large).' },
  { token: '--b-input-padding-inline-sm', defaultValue: '7px', description: 'Horizontal padding (small).' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'All scoped CSS variables exposed by <code>BInput</code>. Override on the component root or any ancestor selector.',
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
