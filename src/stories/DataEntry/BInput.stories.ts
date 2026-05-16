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
      table: { defaultValue: { summary: BCommonSize.Medium } },
    },
    variant: {
      control: 'select',
      options: Object.values(BInputVariant),
      description: 'Visual variant.',
      table: { defaultValue: { summary: BInputVariant.Outlined } },
    },
    status: {
      control: 'select',
      options: [undefined, ...Object.values(BInputStatus)],
      description: 'Validation status.',
    },
    type: {
      control: 'text',
      description: 'HTML input type.',
      table: { defaultValue: { summary: 'text' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled.',
      table: { defaultValue: { summary: 'false' } },
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the input is read-only.',
      table: { defaultValue: { summary: 'false' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text.',
    },
    maxLength: {
      control: 'number',
      description: 'Maximum character length.',
    },
    allowClear: {
      control: 'boolean',
      description: 'Show clear button.',
      table: { defaultValue: { summary: 'false' } },
    },
    showCount: {
      control: 'boolean',
      description: 'Display character count.',
      table: { defaultValue: { summary: 'false' } },
    },
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
// 1. Playground
// ─────────────────────────────────────────────
export const Playground: Story = {
  args: {
    placeholder: 'Enter text...',
    size: 'md',
    variant: 'outlined',
    disabled: false,
    allowClear: true,
    showCount: false,
  },
  render: (args) => ({
    components: { BInput },
    setup: () => {
      const value = ref('');
      return { args, value };
    },
    template: `
      <div style="padding: 40px; max-width: 320px;">
        <BInput v-bind="args" v-model="value" />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Value: "{{ value }}"</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 2. Sizes
// ─────────────────────────────────────────────
export const Sizes: Story = {
  render: () => ({
    components: { BInput },
    setup: () => {
      const sm = ref('');
      const md = ref('');
      const lg = ref('');
      return { sm, md, lg };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Small</p>
          <BInput v-model="sm" size="sm" placeholder="Small input" />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Medium (default)</p>
          <BInput v-model="md" size="md" placeholder="Medium input" />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Large</p>
          <BInput v-model="lg" size="lg" placeholder="Large input" />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 3. Variants
// ─────────────────────────────────────────────
export const Variants: Story = {
  render: () => ({
    components: { BInput },
    setup: () => {
      const outlined = ref('');
      const filled = ref('');
      const borderless = ref('');
      const underlined = ref('');
      return { outlined, filled, borderless, underlined };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Outlined (default)</p>
          <BInput v-model="outlined" variant="outlined" placeholder="Outlined" />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Filled</p>
          <BInput v-model="filled" variant="filled" placeholder="Filled" />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Borderless</p>
          <BInput v-model="borderless" variant="borderless" placeholder="Borderless" />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Underlined</p>
          <BInput v-model="underlined" variant="underlined" placeholder="Underlined" />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 4. Prefix & Suffix
// ─────────────────────────────────────────────
export const PrefixSuffix: Story = {
  render: () => ({
    components: { BInput },
    setup: () => {
      const v1 = ref('');
      const v2 = ref('');
      const v3 = ref('');
      return { v1, v2, v3 };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; max-width: 360px;">
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">With prefix</p>
          <BInput v-model="v1" placeholder="Amount">
            <template #prefix>$</template>
          </BInput>
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">With suffix</p>
          <BInput v-model="v2" placeholder="Weight">
            <template #suffix>kg</template>
          </BInput>
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Both prefix and suffix</p>
          <BInput v-model="v3" placeholder="Website">
            <template #prefix>🔗</template>
            <template #suffix>.com</template>
          </BInput>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 5. Addons
// ─────────────────────────────────────────────
export const Addons: Story = {
  render: () => ({
    components: { BInput },
    setup: () => {
      const url = ref('mysite');
      return { url };
    },
    template: `
      <div style="padding: 40px; max-width: 400px;">
        <p style="margin-bottom: 4px; font-size: 12px; color: #666;">URL with addons</p>
        <BInput v-model="url" placeholder="Enter URL">
          <template #addonBefore>https://</template>
          <template #addonAfter>.com</template>
        </BInput>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 6. Password
// ─────────────────────────────────────────────
export const Password: Story = {
  render: () => ({
    components: { BInput },
    setup: () => {
      const pwd = ref('');
      return { pwd };
    },
    template: `
      <div style="padding: 40px; max-width: 320px;">
        <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Password with visibility toggle</p>
        <BInput v-model="pwd" type="password" placeholder="Enter password" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 7. Character Count
// ─────────────────────────────────────────────
export const CharacterCount: Story = {
  render: () => ({
    components: { BInput },
    setup: () => {
      const v1 = ref('');
      const v2 = ref('');
      return { v1, v2 };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
        <div>
          <label for="count-basic" style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">With showCount</label>
          <BInput v-model="v1" id="count-basic" :show-count="true" placeholder="Type something" />
        </div>
        <div>
          <label for="count-max" style="display: block; margin-bottom: 4px; font-size: 12px; color: #666;">With showCount + maxLength</label>
          <BInput v-model="v2" id="count-max" :show-count="true" :max-length="20" placeholder="Max 20 chars" />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 8. Status
// ─────────────────────────────────────────────
export const Status: Story = {
  render: () => ({
    components: { BInput },
    setup: () => {
      const err = ref('');
      const warn = ref('');
      return { err, warn };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Error</p>
          <BInput v-model="err" status="error" placeholder="Error state" />
        </div>
        <div>
          <p style="margin-bottom: 4px; font-size: 12px; color: #666;">Warning</p>
          <BInput v-model="warn" status="warning" placeholder="Warning state" />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 9. Disabled
// ─────────────────────────────────────────────
export const Disabled: Story = {
  render: () => ({
    components: { BInput },
    template: `
      <div style="padding: 40px; max-width: 320px;">
        <BInput model-value="Disabled input" disabled placeholder="Disabled" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 10. Accessibility
// ─────────────────────────────────────────────
export const Accessibility: Story = {
  render: () => ({
    components: { BInput },
    setup: () => {
      const value = ref('');
      return { value };
    },
    template: `
      <div style="padding: 40px; max-width: 320px;">
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
// 11. Theming
// ─────────────────────────────────────────────
export const Theming: Story = {
  render: () => ({
    components: { BInput },
    setup: () => {
      const v1 = ref('');
      const v2 = ref('');
      const v3 = ref('');
      return { v1, v2, v3 };
    },
    template: `
      <div style="padding: 40px; display: flex; gap: 40px; flex-wrap: wrap;">
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Default</p>
          <BInput v-model="v1" placeholder="Default theme" />
        </div>

        <div class="custom-input-theme-purple">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Purple accent</p>
          <BInput v-model="v2" placeholder="Purple theme" />
        </div>

        <div class="custom-input-theme-green">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Green accent</p>
          <BInput v-model="v3" placeholder="Green theme" />
        </div>
      </div>

      <style>
        .custom-input-theme-purple .b-input {
          --b-input-active-border-color: #7c3aed;
          --b-input-hover-border-color: #a78bfa;
          --b-input-active-shadow: 0 0 0 2px rgba(124, 58, 237, 0.12);
          --b-input-border-radius: 12px;
        }
        .custom-input-theme-green .b-input {
          --b-input-active-border-color: #16a34a;
          --b-input-hover-border-color: #4ade80;
          --b-input-active-shadow: 0 0 0 2px rgba(22, 163, 74, 0.12);
          --b-input-filled-bg: rgba(22, 163, 74, 0.06);
        }
      </style>
    `,
  }),
};

// ─────────────────────────────────────────────
// 12. Interaction Test
// ─────────────────────────────────────────────
export const InteractionTest: Story = {
  args: {
    placeholder: 'Type here...',
    allowClear: true,
    showCount: true,
    maxLength: 20,
  },
  render: (args) => ({
    components: { BInput },
    setup: () => {
      const value = ref('');
      const entered = ref(false);
      const onPressEnter = () => {
        entered.value = true;
      };
      return { args, value, entered, onPressEnter };
    },
    template: `
      <div style="padding: 40px; max-width: 320px;">
        <label for="interaction-input" style="display: block; margin-bottom: 4px; font-size: 14px;">Test input</label>
        <BInput v-bind="args" v-model="value" id="interaction-input" @press-enter="onPressEnter" />
        <p data-testid="current-value" style="margin-top: 12px; font-size: 12px; color: #666;">Value: "{{ value }}"</p>
        <p data-testid="enter-pressed" style="font-size: 12px; color: #666;">Enter: {{ entered }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox') as HTMLInputElement;

    await userEvent.type(input, 'Hello World');
    await waitFor(() => {
      expect(input.value).toBe('Hello World');
      expect(canvas.getByTestId('current-value').textContent).toContain('Hello World');
    });

    const count = canvasElement.querySelector('.b-input__count');
    expect(count!.textContent!.trim()).toBe('11 / 20');

    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(canvas.getByTestId('enter-pressed').textContent).toContain('true');
    });

    const clearBtn = canvasElement.querySelector('.b-input__clear');
    expect(clearBtn).toBeTruthy();
    await userEvent.click(clearBtn!);
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  },
};

// ─────────────────────────────────────────────
// 13. Design Tokens (LAST)
// ─────────────────────────────────────────────
export const DesignTokens: Story = {
  render: () => ({
    template: `
      <div style="padding: 40px; font-family: monospace; font-size: 13px; max-width: 900px;">
        <h3 style="margin-bottom: 16px; font-size: 16px; font-family: sans-serif;">BInput Design Tokens</h3>
        <p style="margin-bottom: 16px; font-size: 13px; font-family: sans-serif; color: #666;">
          Override these CSS variables on <code>.b-input</code> or an ancestor to customize the component appearance.
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
              <td style="padding: 8px 12px;">--b-input-active-bg</td>
              <td style="padding: 8px 12px;">#ffffff</td>
              <td style="padding: 8px 12px;">Background when input is focused</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-active-border-color</td>
              <td style="padding: 8px 12px;">#1677ff</td>
              <td style="padding: 8px 12px;">Border color when focused</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-active-shadow</td>
              <td style="padding: 8px 12px;">0 0 0 2px rgba(5,145,255,0.1)</td>
              <td style="padding: 8px 12px;">Box-shadow when focused</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-addon-bg</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.02)</td>
              <td style="padding: 8px 12px;">Background of addon elements</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-error-active-shadow</td>
              <td style="padding: 8px 12px;">0 0 0 2px rgba(255,38,5,0.06)</td>
              <td style="padding: 8px 12px;">Shadow during error state focus</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-hover-bg</td>
              <td style="padding: 8px 12px;">#ffffff</td>
              <td style="padding: 8px 12px;">Background on hover</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-hover-border-color</td>
              <td style="padding: 8px 12px;">#4096ff</td>
              <td style="padding: 8px 12px;">Border color on hover</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-font-size</td>
              <td style="padding: 8px 12px;">14px</td>
              <td style="padding: 8px 12px;">Standard font size</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-font-size-lg</td>
              <td style="padding: 8px 12px;">16px</td>
              <td style="padding: 8px 12px;">Large variant font size</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-font-size-sm</td>
              <td style="padding: 8px 12px;">14px</td>
              <td style="padding: 8px 12px;">Small variant font size</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-padding-block</td>
              <td style="padding: 8px 12px;">4px</td>
              <td style="padding: 8px 12px;">Vertical padding (medium)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-padding-block-lg</td>
              <td style="padding: 8px 12px;">7px</td>
              <td style="padding: 8px 12px;">Vertical padding (large)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-padding-block-sm</td>
              <td style="padding: 8px 12px;">0px</td>
              <td style="padding: 8px 12px;">Vertical padding (small)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-padding-inline</td>
              <td style="padding: 8px 12px;">11px</td>
              <td style="padding: 8px 12px;">Horizontal padding (medium)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-padding-inline-lg</td>
              <td style="padding: 8px 12px;">11px</td>
              <td style="padding: 8px 12px;">Horizontal padding (large)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-padding-inline-sm</td>
              <td style="padding: 8px 12px;">7px</td>
              <td style="padding: 8px 12px;">Horizontal padding (small)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-warning-active-shadow</td>
              <td style="padding: 8px 12px;">0 0 0 2px rgba(255,215,5,0.1)</td>
              <td style="padding: 8px 12px;">Shadow during warning state focus</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-border-color</td>
              <td style="padding: 8px 12px;">#d9d9d9</td>
              <td style="padding: 8px 12px;">Default border color</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-bg</td>
              <td style="padding: 8px 12px;">#ffffff</td>
              <td style="padding: 8px 12px;">Default background color</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-color</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.88)</td>
              <td style="padding: 8px 12px;">Text color</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-placeholder-color</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.25)</td>
              <td style="padding: 8px 12px;">Placeholder text color</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-border-radius</td>
              <td style="padding: 8px 12px;">6px</td>
              <td style="padding: 8px 12px;">Border radius</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-clear-color</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.25)</td>
              <td style="padding: 8px 12px;">Clear button icon color</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-clear-hover-color</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.45)</td>
              <td style="padding: 8px 12px;">Clear button hover color</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-count-color</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.45)</td>
              <td style="padding: 8px 12px;">Character count text color</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-disabled-bg</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.04)</td>
              <td style="padding: 8px 12px;">Background when disabled</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-disabled-color</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.25)</td>
              <td style="padding: 8px 12px;">Text color when disabled</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-error-border-color</td>
              <td style="padding: 8px 12px;">#ff4d4f</td>
              <td style="padding: 8px 12px;">Border color for error status</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-error-hover-border-color</td>
              <td style="padding: 8px 12px;">#ff7875</td>
              <td style="padding: 8px 12px;">Hover border color for error</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-warning-border-color</td>
              <td style="padding: 8px 12px;">#faad14</td>
              <td style="padding: 8px 12px;">Border color for warning status</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-warning-hover-border-color</td>
              <td style="padding: 8px 12px;">#ffc53d</td>
              <td style="padding: 8px 12px;">Hover border color for warning</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 12px;">--b-input-filled-bg</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.04)</td>
              <td style="padding: 8px 12px;">Background for filled variant</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px;">--b-input-filled-hover-bg</td>
              <td style="padding: 8px 12px;">rgba(0,0,0,0.04)</td>
              <td style="padding: 8px 12px;">Hover background for filled variant</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
};
