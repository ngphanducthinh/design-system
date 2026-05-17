import { BSlider } from '@/components/BSlider';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Data Entry/Slider',
  component: BSlider,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Current slider value (number or [number, number] for range).',
      table: { category: 'Two-Way Binding Props' },
    },
    min: {
      control: { type: 'number' },
      description: 'Minimum value.',
      table: { defaultValue: { summary: '0' } },
    },
    max: {
      control: { type: 'number' },
      description: 'Maximum value.',
      table: { defaultValue: { summary: '100' } },
    },
    step: {
      control: { type: 'number' },
      description: 'Step granularity. null = marks only.',
      table: { defaultValue: { summary: '1' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the slider is disabled.',
      table: { defaultValue: { summary: 'false' } },
    },
    vertical: {
      control: 'boolean',
      description: 'Whether the slider is vertical.',
      table: { defaultValue: { summary: 'false' } },
    },
    range: {
      control: 'boolean',
      description: 'Whether to enable range mode (dual handles).',
      table: { defaultValue: { summary: 'false' } },
    },
    reverse: {
      control: 'boolean',
      description: 'Whether to reverse the slider direction.',
      table: { defaultValue: { summary: 'false' } },
    },
    dots: {
      control: 'boolean',
      description: 'Whether to show step dots.',
      table: { defaultValue: { summary: 'false' } },
    },
    included: {
      control: 'boolean',
      description: 'Whether to show the track fill.',
      table: { defaultValue: { summary: 'true' } },
    },
    keyboard: {
      control: 'boolean',
      description: 'Whether keyboard interaction is enabled.',
      table: { defaultValue: { summary: 'true' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          '<code>BSlider</code> is a slider input for selecting a value or range from a fixed set. ' +
          'Supports single and range modes, marks, dots, vertical orientation, tooltips, and full keyboard navigation.<br><br>' +
          'Accessible with ARIA slider roles, keyboard support (Arrow keys, Home, End), and focus management.',
      },
    },
  },
} satisfies Meta<typeof BSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

// ═════════════════════════════════════════════
//   STORIES
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 1. Playground
// ─────────────────────────────────────────────
export const Playground: Story = {
  args: {
    modelValue: 30,
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    vertical: false,
    range: false,
    reverse: false,
    dots: false,
    included: true,
    keyboard: true,
  },
  render: (args) => ({
    components: { BSlider },
    setup: () => {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div style="padding: 40px; width: 400px;">
        <BSlider v-bind="args" v-model="value" />
        <p style="margin-top: 16px; font-size: 12px; color: #666;">Value: {{ value }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider');
    await expect(slider).toBeInTheDocument();
    await expect(slider).toHaveAttribute('aria-valuenow', '30');
    await expect(slider).toHaveAttribute('aria-valuemin', '0');
    await expect(slider).toHaveAttribute('aria-valuemax', '100');
  },
};

// ─────────────────────────────────────────────
// 2. Range
// ─────────────────────────────────────────────
export const Range: Story = {
  render: () => ({
    components: { BSlider },
    setup: () => {
      const value = ref<[number, number]>([20, 70]);
      return { value };
    },
    template: `
      <div style="padding: 40px; width: 400px;">
        <BSlider :range="true" v-model="value" />
        <p style="margin-top: 16px; font-size: 12px; color: #666;">Value: {{ value }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sliders = canvas.getAllByRole('slider');
    await expect(sliders).toHaveLength(2);
    await expect(sliders[0]).toHaveAttribute('aria-valuenow', '20');
    await expect(sliders[1]).toHaveAttribute('aria-valuenow', '70');
  },
};

// ─────────────────────────────────────────────
// 3. With Marks
// ─────────────────────────────────────────────
export const WithMarks: Story = {
  render: () => ({
    components: { BSlider },
    setup: () => {
      const value = ref(37);
      const marks = { 0: '0°C', 25: '25°C', 50: '50°C', 75: '75°C', 100: '100°C' };
      return { value, marks };
    },
    template: `
      <div style="padding: 40px 40px 60px; width: 400px;">
        <BSlider v-model="value" :marks="marks" :step="null" />
        <p style="margin-top: 24px; font-size: 12px; color: #666;">Value: {{ value }}</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 4. Steps with Dots
// ─────────────────────────────────────────────
export const StepsWithDots: Story = {
  render: () => ({
    components: { BSlider },
    setup: () => {
      const value = ref(40);
      return { value };
    },
    template: `
      <div style="padding: 40px; width: 400px;">
        <BSlider v-model="value" :step="20" :dots="true" />
        <p style="margin-top: 16px; font-size: 12px; color: #666;">Value: {{ value }}</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 5. Vertical
// ─────────────────────────────────────────────
export const Vertical: Story = {
  render: () => ({
    components: { BSlider },
    setup: () => {
      const single = ref(40);
      const range = ref<[number, number]>([20, 60]);
      const marks = { 0: '0°C', 25: '25°C', 50: '50°C', 75: '75°C', 100: '100°C' };
      return { single, range, marks };
    },
    template: `
      <div style="padding: 40px; display: flex; gap: 80px; height: 300px;">
        <BSlider v-model="single" :vertical="true" />
        <BSlider v-model="range" :vertical="true" :range="true" />
        <BSlider v-model="single" :vertical="true" :marks="marks" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 6. Disabled
// ─────────────────────────────────────────────
export const Disabled: Story = {
  render: () => ({
    components: { BSlider },
    setup: () => {
      const value = ref(50);
      return { value };
    },
    template: `
      <div style="padding: 40px; width: 400px;">
        <BSlider v-model="value" :disabled="true" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider');
    await expect(slider).toHaveAttribute('aria-disabled', 'true');
    await expect(slider).toHaveAttribute('tabindex', '-1');
  },
};

// ─────────────────────────────────────────────
// 7. Custom Tooltip
// ─────────────────────────────────────────────
export const CustomTooltip: Story = {
  render: () => ({
    components: { BSlider },
    setup: () => {
      const value = ref(50);
      const tooltip = { formatter: (v: number) => `${v}%`, open: true };
      return { value, tooltip };
    },
    template: `
      <div style="padding: 60px 40px 40px; width: 400px;">
        <BSlider v-model="value" :tooltip="tooltip" />
        <p style="margin-top: 16px; font-size: 12px; color: #666;">Tooltip always visible with custom format</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 8. Reversed
// ─────────────────────────────────────────────
export const Reversed: Story = {
  render: () => ({
    components: { BSlider },
    setup: () => {
      const value = ref(30);
      return { value };
    },
    template: `
      <div style="padding: 40px; width: 400px;">
        <BSlider v-model="value" :reverse="true" />
        <p style="margin-top: 16px; font-size: 12px; color: #666;">Value: {{ value }} (reversed)</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 9. Accessibility
// ─────────────────────────────────────────────
export const Accessibility: Story = {
  render: () => ({
    components: { BSlider },
    setup: () => {
      const single = ref(40);
      const range = ref<[number, number]>([25, 75]);
      return { single, range };
    },
    template: `
      <div style="padding: 40px; width: 400px; display: flex; flex-direction: column; gap: 32px;">
        <div>
          <h4 style="margin-bottom: 12px; font-size: 13px;">Single Slider (Tab + Arrow keys)</h4>
          <BSlider v-model="single" aria-label="Temperature" />
          <p style="margin-top: 8px; font-size: 12px; color: #666;">Value: {{ single }}</p>
        </div>
        <div>
          <h4 style="margin-bottom: 12px; font-size: 13px;">Range Slider (Tab between handles)</h4>
          <BSlider v-model="range" :range="true" aria-label="Price range" />
          <p style="margin-top: 8px; font-size: 12px; color: #666;">Value: {{ range }}</p>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sliders = canvas.getAllByRole('slider');

    // First slider - single
    await expect(sliders[0]).toHaveAttribute('aria-label', 'Temperature');
    await expect(sliders[0]).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(sliders[0]).toHaveAttribute('aria-valuenow', '40');
    await expect(sliders[0]).toHaveAttribute('tabindex', '0');

    // Range sliders
    await expect(sliders[1]).toHaveAttribute('aria-label', 'Price range - minimum');
    await expect(sliders[2]).toHaveAttribute('aria-label', 'Price range');

    // Keyboard navigation
    await userEvent.tab();
    await waitFor(() => expect(sliders[0]).toHaveFocus());

    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(sliders[0]).toHaveAttribute('aria-valuenow', '41'));

    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(sliders[0]).toHaveAttribute('aria-valuenow', '40'));
  },
};

// ─────────────────────────────────────────────
// 10. Theming
// ─────────────────────────────────────────────
export const Theming: Story = {
  render: () => ({
    components: { BSlider },
    setup: () => {
      const v1 = ref(60);
      const v2 = ref(40);
      const v3 = ref<[number, number]>([20, 80]);
      return { v1, v2, v3 };
    },
    template: `
      <div style="padding: 60px 40px 40px; display: flex; flex-direction: column; gap: 40px; width: 400px;">
        <div>
          <p style="margin-bottom: 12px; font-size: 12px; color: #666;">Custom track & handle (green)</p>
          <BSlider
            v-model="v1"
            :tooltip="{ open: true }"
            style="--b-slider-track-bg: #52c41a; --b-slider-track-hover-bg: #73d13d; --b-slider-handle-color: #52c41a; --b-slider-handle-active-color: #389e0d; --b-slider-handle-active-outline-color: rgba(82, 196, 26, 0.2);"
          />
        </div>
        <div>
          <p style="margin-bottom: 12px; font-size: 12px; color: #666;">Larger handle & rail (purple)</p>
          <BSlider
            v-model="v2"
            style="--b-slider-handle-size: 16px; --b-slider-handle-size-hover: 20px; --b-slider-rail-size: 8px; --b-slider-track-bg: #722ed1; --b-slider-track-hover-bg: #9254de; --b-slider-handle-color: #722ed1; --b-slider-handle-active-color: #531dab;"
          />
        </div>
        <div>
          <p style="margin-bottom: 12px; font-size: 12px; color: #666;">Custom rail & dot colors (orange range)</p>
          <BSlider
            v-model="v3"
            :range="true"
            :dots="true"
            :step="20"
            style="--b-slider-rail-bg: rgba(250, 140, 22, 0.08); --b-slider-rail-hover-bg: rgba(250, 140, 22, 0.15); --b-slider-track-bg: #fa8c16; --b-slider-track-hover-bg: #ffa940; --b-slider-handle-color: #fa8c16; --b-slider-handle-active-color: #d46b08; --b-slider-dot-active-border-color: #fa8c16;"
          />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 11. Design Tokens
// ─────────────────────────────────────────────
export const DesignTokens: Story = {
  render: () => ({
    components: { BSlider },
    setup: () => {
      const tokens = [
        { variable: '--b-slider-rail-bg', default: 'rgba(0, 0, 0, 0.04)', description: 'Background color of the rail' },
        { variable: '--b-slider-rail-hover-bg', default: 'rgba(0, 0, 0, 0.06)', description: 'Background color of the rail on hover' },
        { variable: '--b-slider-rail-size', default: '4px', description: 'Height (or width if vertical) of the rail' },
        { variable: '--b-slider-track-bg', default: '#91caff', description: 'Background color of the track (filled portion)' },
        { variable: '--b-slider-track-bg-disabled', default: 'rgba(0, 0, 0, 0.04)', description: 'Track background when disabled' },
        { variable: '--b-slider-track-hover-bg', default: '#69b1ff', description: 'Track background on hover' },
        { variable: '--b-slider-handle-color', default: '#91caff', description: 'Border color of the handle' },
        { variable: '--b-slider-handle-color-disabled', default: '#bfbfbf', description: 'Handle border color when disabled' },
        { variable: '--b-slider-handle-active-color', default: '#1677ff', description: 'Handle border color when active/focused' },
        { variable: '--b-slider-handle-active-outline-color', default: 'rgba(22, 119, 255, 0.2)', description: 'Outline (box-shadow) color when handle is active' },
        { variable: '--b-slider-handle-line-width', default: '2px', description: 'Border width of the handle' },
        { variable: '--b-slider-handle-line-width-hover', default: '2.5px', description: 'Border width of the handle on hover' },
        { variable: '--b-slider-handle-size', default: '10px', description: 'Size of the handle (diameter)' },
        { variable: '--b-slider-handle-size-hover', default: '12px', description: 'Size of the handle on hover' },
        { variable: '--b-slider-dot-border-color', default: '#f0f0f0', description: 'Border color of step dots' },
        { variable: '--b-slider-dot-active-border-color', default: '#91caff', description: 'Border color of active step dots' },
        { variable: '--b-slider-dot-size', default: '8px', description: 'Size of step dots' },
        { variable: '--b-slider-control-size', default: '10px', description: 'Overall control height reference' },
      ];
      const value = ref(50);
      return { tokens, value };
    },
    template: `
      <div style="padding: 40px;">
        <h3 style="margin-bottom: 16px; font-size: 16px; font-weight: 600;">BSlider Design Tokens</h3>
        <p style="margin-bottom: 16px; font-size: 12px; color: #666;">
          Override these CSS custom properties on <code>.b-slider</code> or via inline styles to theme the component.
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
              <td style="padding: 8px 12px; font-family: monospace; color: #d4380d;">{{ token.variable }}</td>
              <td style="padding: 8px 12px; font-family: monospace;">{{ token.default }}</td>
              <td style="padding: 8px 12px;">{{ token.description }}</td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top: 24px; padding: 16px; background: #fafafa; border-radius: 8px;">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Live preview (default tokens):</p>
          <BSlider v-model="value" />
        </div>
      </div>
    `,
  }),
};
