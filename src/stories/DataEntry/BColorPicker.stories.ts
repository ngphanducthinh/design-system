import { BColorPicker } from '@/components';
import {
  BColorPickerFormat,
  BColorPickerPlacement,
  BColorPickerSize,
  BColorPickerTrigger,
} from '@/components/BColorPicker/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Data Entry/ColorPicker',
  component: BColorPicker,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'color',
      description: 'Current color value (v-model).',
      table: { category: 'Two-Way Binding Props' },
    },
    open: {
      control: 'boolean',
      description: 'Controlled open state (v-model:open).',
      table: { category: 'Two-Way Binding Props' },
    },
    defaultValue: {
      control: 'color',
      description: 'Default color when uncontrolled.',
      table: { defaultValue: { summary: '#1677ff' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the picker is disabled.',
      table: { defaultValue: { summary: 'false' } },
    },
    size: {
      control: 'select',
      options: Object.values(BColorPickerSize),
      description: 'Size of the trigger.',
      table: { defaultValue: { summary: BColorPickerSize.Medium } },
    },
    trigger: {
      control: 'select',
      options: Object.values(BColorPickerTrigger),
      description: 'How the popup is triggered.',
      table: { defaultValue: { summary: BColorPickerTrigger.Click } },
    },
    placement: {
      control: 'select',
      options: Object.values(BColorPickerPlacement),
      description: 'Popup placement.',
      table: { defaultValue: { summary: BColorPickerPlacement.BottomLeft } },
    },
    format: {
      control: 'select',
      options: Object.values(BColorPickerFormat),
      description: 'Controlled color format.',
    },
    defaultFormat: {
      control: 'select',
      options: Object.values(BColorPickerFormat),
      description: 'Default color format.',
      table: { defaultValue: { summary: BColorPickerFormat.Hex } },
    },
    disabledAlpha: {
      control: 'boolean',
      description: 'Disable the alpha channel slider.',
      table: { defaultValue: { summary: 'false' } },
    },
    disabledFormat: {
      control: 'boolean',
      description: 'Disable format switching.',
      table: { defaultValue: { summary: 'false' } },
    },
    showText: {
      control: 'boolean',
      description: 'Show color value text next to swatch.',
      table: { defaultValue: { summary: 'false' } },
    },
    allowClear: {
      control: 'boolean',
      description: 'Allow clearing the selected color.',
      table: { defaultValue: { summary: 'false' } },
    },
    arrow: {
      control: 'boolean',
      description: 'Whether the popup has an arrow.',
      table: { defaultValue: { summary: 'true' } },
    },
    destroyOnHidden: {
      control: 'boolean',
      description: 'Destroy popup DOM when closed.',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BColorPicker</code> component provides a rich color selection interface ' +
          'with saturation panel, hue/alpha sliders, format switching, and preset colors.<br><br>' +
          'Supports hex, RGB, HSL, and HSB formats. Full keyboard and screen-reader accessible.',
      },
    },
  },
} satisfies Meta<typeof BColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// ═════════════════════════════════════════════
// 1. Playground
// ═════════════════════════════════════════════
export const Playground: Story = {
  args: {
    defaultValue: '#1677ff',
    disabled: false,
    size: 'md' as const,
    trigger: 'click' as const,
    placement: 'bottom-left' as const,
    defaultFormat: 'hex' as const,
    disabledAlpha: false,
    disabledFormat: false,
    showText: false,
    allowClear: false,
    arrow: true,
    destroyOnHidden: false,
  },
  render: (args) => ({
    components: { BColorPicker },
    setup() {
      const color = ref(args.defaultValue);
      return { args, color };
    },
    template: `
      <div style="padding: 40px 40px 300px;">
        <BColorPicker v-bind="args" v-model="color" />
        <p style="margin-top: 16px; font-size: 14px; color: #666;">Selected: {{ color }}</p>
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 2. Sizes
// ═════════════════════════════════════════════
export const Sizes: Story = {
  render: () => ({
    components: { BColorPicker },
    template: `
      <div style="display: flex; gap: 16px; align-items: center; padding: 40px 40px 300px;">
        <BColorPicker size="sm" default-value="#1677ff" />
        <BColorPicker size="md" default-value="#52c41a" />
        <BColorPicker size="lg" default-value="#faad14" />
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 3. With Text
// ═════════════════════════════════════════════
export const WithText: Story = {
  render: () => ({
    components: { BColorPicker },
    template: `
      <div style="padding: 40px 40px 300px;">
        <BColorPicker default-value="#1677ff" :show-text="true" />
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 4. Presets
// ═════════════════════════════════════════════
export const Presets: Story = {
  render: () => ({
    components: { BColorPicker },
    setup() {
      const presets = [
        {
          label: 'Recommended',
          colors: [
            '#F5222D', '#FA8C16', '#FADB14', '#8BBB11',
            '#52C41A', '#13A8A8', '#1677FF', '#2F54EB',
            '#722ED1', '#EB2F96',
          ],
        },
        {
          label: 'Recent',
          colors: ['#F5222D', '#1677FF', '#52C41A'],
        },
      ];
      return { presets };
    },
    template: `
      <div style="padding: 40px 40px 300px;">
        <BColorPicker default-value="#1677ff" :presets="presets" />
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 5. Disabled
// ═════════════════════════════════════════════
export const Disabled: Story = {
  render: () => ({
    components: { BColorPicker },
    template: `
      <div style="padding: 40px 40px 300px;">
        <BColorPicker default-value="#1677ff" disabled />
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 6. Formats
// ═════════════════════════════════════════════
export const Formats: Story = {
  render: () => ({
    components: { BColorPicker },
    setup() {
      const hexColor = ref('#1677ff');
      const rgbColor = ref('#52c41a');
      const hslColor = ref('#faad14');
      return { hexColor, rgbColor, hslColor };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 40px 40px 300px;">
        <div>
          <span style="display: inline-block; width: 60px; font-size: 14px;">HEX:</span>
          <BColorPicker v-model="hexColor" default-format="hex" :show-text="true" />
        </div>
        <div>
          <span style="display: inline-block; width: 60px; font-size: 14px;">RGB:</span>
          <BColorPicker v-model="rgbColor" default-format="rgb" :show-text="true" />
        </div>
        <div>
          <span style="display: inline-block; width: 60px; font-size: 14px;">HSL:</span>
          <BColorPicker v-model="hslColor" default-format="hsl" :show-text="true" />
        </div>
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 7. Allow Clear
// ═════════════════════════════════════════════
export const AllowClear: Story = {
  render: () => ({
    components: { BColorPicker },
    template: `
      <div style="padding: 40px 40px 300px;">
        <BColorPicker default-value="#1677ff" allow-clear :show-text="true" />
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 8. Controlled v-model
// ═════════════════════════════════════════════
export const Controlled: Story = {
  render: () => ({
    components: { BColorPicker },
    setup() {
      const color = ref('#1677ff');
      const events: string[] = [];
      const onChange = (val: string) => {
        events.push(`change: ${val}`);
      };
      const onComplete = (val: string) => {
        events.push(`complete: ${val}`);
      };
      return { color, events, onChange, onComplete };
    },
    template: `
      <div style="padding: 40px 40px 300px;">
        <BColorPicker
          v-model="color"
          :show-text="true"
          @change="onChange"
          @change-complete="onComplete"
        />
        <div style="margin-top: 16px;">
          <input type="color" v-model="color" aria-label="Native color input" style="margin-right: 8px;" />
          <code>{{ color }}</code>
        </div>
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 9. Accessibility
// ═════════════════════════════════════════════
export const Accessibility: Story = {
  render: () => ({
    components: { BColorPicker },
    template: `
      <div style="padding: 40px 120px 300px;">
        <BColorPicker
          default-value="#1677ff"
          :show-text="true"
          :presets="[{ label: 'Brand', colors: ['#1677ff', '#52c41a', '#faad14'] }]"
          data-testid="a11y-picker"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button');

    // Verify trigger accessibility
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('tabindex', '0');
    expect(trigger.getAttribute('aria-label')).toMatch(/^Color picker:/);

    // Focus the trigger, then open via keyboard
    trigger.focus();
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    // Panel has dialog role
    const panel = canvasElement.querySelector('[role="dialog"]');
    expect(panel).toBeTruthy();
    expect(panel).toHaveAttribute('aria-label', 'Color picker');

    // Sliders have proper roles
    const sliders = canvasElement.querySelectorAll('[role="slider"]');
    expect(sliders.length).toBeGreaterThanOrEqual(2);

    // Close via Escape
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

// ═════════════════════════════════════════════
// 10. Interaction Tests
// ═════════════════════════════════════════════
export const Interactions: Story = {
  render: () => ({
    components: { BColorPicker },
    setup() {
      const color = ref('#1677ff');
      return { color };
    },
    template: `
      <div style="padding: 40px 120px 300px;">
        <BColorPicker v-model="color" :show-text="true" allow-clear />
        <p data-testid="color-display" style="margin-top: 8px;">{{ color }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button');

    // Click to open
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    // Panel is visible
    const panel = canvasElement.querySelector('.b-color-picker__panel--open');
    expect(panel).toBeTruthy();

    // Format button exists and is clickable
    const formatBtn = canvasElement.querySelector('.b-color-picker__format-btn');
    expect(formatBtn).toBeTruthy();
    if (formatBtn) {
      await userEvent.click(formatBtn);
    }

    // Close via Escape (focus panel first so keydown is dispatched correctly)
    const panelEl = canvasElement.querySelector('.b-color-picker__panel') as HTMLElement;
    panelEl?.focus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

// ═════════════════════════════════════════════
// 11. Theming (CSS variable overrides)
// ═════════════════════════════════════════════
export const Theming: Story = {
  render: () => ({
    components: { BColorPicker },
    template: `
      <div style="padding: 40px 40px 300px;">
        <h4 style="margin-bottom: 16px; font-size: 14px; color: #666;">Default</h4>
        <BColorPicker default-value="#1677ff" />

        <h4 style="margin: 24px 0 16px; font-size: 14px; color: #666;">Custom Tokens</h4>
        <div
          class="b-color-picker"
          style="
            --b-color-picker-border-radius: 12px;
            --b-color-picker-trigger-height: 48px;
            --b-color-picker-swatch-size: 28px;
            --b-color-picker-bg: #fafafa;
            --b-color-picker-border-color: #91caff;
            --b-color-picker-shadow: 0 4px 12px rgba(22, 119, 255, 0.15);
          "
        >
          <BColorPicker default-value="#722ed1" />
        </div>

        <h4 style="margin: 24px 0 16px; font-size: 14px; color: #666;">Dark-style Override</h4>
        <div
          class="b-color-picker"
          style="
            --b-color-picker-bg: #1f1f1f;
            --b-color-picker-border-color: #424242;
            --b-color-picker-text-color: rgba(255, 255, 255, 0.88);
            --b-color-picker-input-bg: #141414;
            --b-color-picker-input-border: #424242;
          "
        >
          <BColorPicker default-value="#52c41a" :show-text="true" />
        </div>
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
// 12. Design Tokens
// ═════════════════════════════════════════════
export const DesignTokens: Story = {
  render: () => ({
    setup() {
      const tokens = [
        { variable: '--b-color-picker-width', default: '234px', description: 'Width of the color picker panel' },
        { variable: '--b-color-picker-handler-size', default: '16px', description: 'Size of the saturation/slider handles' },
        { variable: '--b-color-picker-handler-size-sm', default: '12px', description: 'Small handle size' },
        { variable: '--b-color-picker-slider-height', default: '8px', description: 'Height of hue/alpha sliders' },
        { variable: '--b-color-picker-preview-size', default: '28px', description: 'Size of the color preview circle' },
        { variable: '--b-color-picker-alpha-input-width', default: '44px', description: 'Width of the alpha percentage input' },
        { variable: '--b-color-picker-border-width', default: '1px', description: 'Border width for trigger and inputs' },
        { variable: '--b-color-picker-border-radius', default: '6px', description: 'Border radius for trigger and panel' },
        { variable: '--b-color-picker-border-radius-sm', default: '4px', description: 'Small border radius for inner elements' },
        { variable: '--b-color-picker-font-size', default: '14px', description: 'Base font size' },
        { variable: '--b-color-picker-line-height', default: '1.5714', description: 'Base line height' },
        { variable: '--b-color-picker-bg', default: '#ffffff', description: 'Panel and trigger background' },
        { variable: '--b-color-picker-border-color', default: '#d9d9d9', description: 'Border color for trigger and dividers' },
        { variable: '--b-color-picker-shadow', default: '0 6px 16px 0 rgba(0,0,0,0.08), …', description: 'Panel box shadow' },
        { variable: '--b-color-picker-trigger-height', default: '32px', description: 'Default trigger height' },
        { variable: '--b-color-picker-trigger-height-sm', default: '24px', description: 'Small trigger height' },
        { variable: '--b-color-picker-trigger-height-lg', default: '40px', description: 'Large trigger height' },
        { variable: '--b-color-picker-swatch-size', default: '16px', description: 'Color swatch size in trigger' },
        { variable: '--b-color-picker-swatch-size-sm', default: '12px', description: 'Small swatch size' },
        { variable: '--b-color-picker-swatch-size-lg', default: '20px', description: 'Large swatch size' },
        { variable: '--b-color-picker-panel-padding', default: '12px', description: 'Panel internal padding' },
        { variable: '--b-color-picker-saturation-height', default: '160px', description: 'Height of the saturation picker area' },
        { variable: '--b-color-picker-color-block-border-radius', default: '4px', description: 'Border radius for preset color blocks' },
        { variable: '--b-color-picker-input-bg', default: '#ffffff', description: 'Input field background' },
        { variable: '--b-color-picker-input-border', default: '#d9d9d9', description: 'Input field border color' },
        { variable: '--b-color-picker-text-color', default: 'rgba(0,0,0,0.88)', description: 'Primary text color' },
        { variable: '--b-color-picker-text-color-secondary', default: 'rgba(0,0,0,0.65)', description: 'Secondary text color' },
        { variable: '--b-color-picker-gap', default: '8px', description: 'Spacing between panel sections' },
        { variable: '--b-color-picker-transition-duration', default: '200ms', description: 'Transition duration for animations' },
      ];
      return { tokens };
    },
    template: `
      <div style="padding: 24px; font-family: -apple-system, sans-serif;">
        <h3 style="margin-bottom: 16px; font-size: 18px;">BColorPicker Design Tokens</h3>
        <p style="margin-bottom: 16px; font-size: 14px; color: #666;">
          All CSS custom properties are scoped to <code>.b-color-picker</code>. Override them on an ancestor to customize.
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 2px solid #eee; text-align: left;">
              <th style="padding: 8px 12px;">Variable</th>
              <th style="padding: 8px 12px;">Default</th>
              <th style="padding: 8px 12px;">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="token in tokens" :key="token.variable" style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 8px 12px; font-family: monospace; color: #c41d7f;">{{ token.variable }}</td>
              <td style="padding: 8px 12px; font-family: monospace;">{{ token.default }}</td>
              <td style="padding: 8px 12px;">{{ token.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
};
