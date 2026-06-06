import { BSlider } from '@/components/BSlider';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

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
      table: { category: 'Props', defaultValue: { summary: '0' } },
    },
    max: {
      control: { type: 'number' },
      description: 'Maximum value.',
      table: { category: 'Props', defaultValue: { summary: '100' } },
    },
    step: {
      control: { type: 'number' },
      description: 'Step granularity. null = marks only.',
      table: { category: 'Props', defaultValue: { summary: '1' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the slider is disabled.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    vertical: {
      control: 'boolean',
      description: 'Whether the slider is vertical.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    range: {
      control: 'boolean',
      description: 'Whether to enable range mode (dual handles).',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    reverse: {
      control: 'boolean',
      description: 'Whether to reverse the slider direction.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    dots: {
      control: 'boolean',
      description: 'Whether to show step dots.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    included: {
      control: 'boolean',
      description: 'Whether to show the track fill.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    keyboard: {
      control: 'boolean',
      description: 'Whether keyboard interaction is enabled.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    'onUpdate:modelValue': {
      description: 'Emitted continuously while the slider value changes.',
      table: { category: 'Events' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          '<code>BSlider</code> is a slider input for selecting a value or range from a fixed set. ' +
          'Supports single and range modes, marks, dots, vertical orientation, tooltips, and full keyboard navigation.',
      },
    },
  },
} satisfies Meta<typeof BSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

export const Default: Story = {
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
  parameters: { docs: { source: { code: `<BSlider v-model="value" />` } } },
  render: (args) => ({
    components: { BSlider },
    setup: () => {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div style="width: 400px;">
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

export const Range: Story = {
  parameters: { docs: { source: { code: `<BSlider :range="true" v-model="value" />` } } },
  render: () => ({
    components: { BSlider },
    setup: () => {
      const value = ref<[number, number]>([20, 70]);
      return { value };
    },
    template: `
      <div style="width: 400px;">
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

export const Vertical: Story = {
  parameters: { docs: { source: { code: `<BSlider v-model="value" :vertical="true" />` } } },
  render: () => ({
    components: { BSlider },
    setup: () => {
      const single = ref(40);
      const range = ref<[number, number]>([20, 60]);
      const marks = { 0: '0°C', 25: '25°C', 50: '50°C', 75: '75°C', 100: '100°C' };
      return { single, range, marks };
    },
    template: `
      <div style="display: flex; gap: 80px; height: 300px;">
        <BSlider v-model="single" :vertical="true" />
        <BSlider v-model="range" :vertical="true" :range="true" />
        <BSlider v-model="single" :vertical="true" :marks="marks" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  parameters: { docs: { source: { code: `<BSlider v-model="value" :disabled="true" />` } } },
  render: () => ({
    components: { BSlider },
    setup: () => {
      const value = ref(50);
      return { value };
    },
    template: `
      <div style="width: 400px;">
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

export const Reversed: Story = {
  parameters: { docs: { source: { code: `<BSlider v-model="value" :reverse="true" />` } } },
  render: () => ({
    components: { BSlider },
    setup: () => {
      const value = ref(30);
      return { value };
    },
    template: `
      <div style="width: 400px;">
        <BSlider v-model="value" :reverse="true" />
        <p style="margin-top: 16px; font-size: 12px; color: #666;">Value: {{ value }} (reversed)</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

export const WithMarks: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BSlider
  v-model="value"
  :marks="{ 0: '0°C', 25: '25°C', 50: '50°C', 75: '75°C', 100: '100°C' }"
  :step="null"
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BSlider },
    setup: () => {
      const value = ref(37);
      const marks = { 0: '0°C', 25: '25°C', 50: '50°C', 75: '75°C', 100: '100°C' };
      return { value, marks };
    },
    template: `
      <div style="padding-bottom: 32px; width: 400px;">
        <BSlider v-model="value" :marks="marks" :step="null" />
        <p style="margin-top: 24px; font-size: 12px; color: #666;">Value: {{ value }}</p>
      </div>
    `,
  }),
};

export const StepsWithDots: Story = {
  parameters: {
    docs: {
      source: { code: `<BSlider v-model="value" :step="20" :dots="true" />` },
    },
  },
  render: () => ({
    components: { BSlider },
    setup: () => {
      const value = ref(40);
      return { value };
    },
    template: `
      <div style="width: 400px;">
        <BSlider v-model="value" :step="20" :dots="true" />
        <p style="margin-top: 16px; font-size: 12px; color: #666;">Value: {{ value }}</p>
      </div>
    `,
  }),
};

export const CustomTooltip: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BSlider v-model="value" :tooltip="{ formatter: (v) => v + '%', open: true }" />`,
      },
    },
  },
  render: () => ({
    components: { BSlider },
    setup: () => {
      const value = ref(50);
      const tooltip = { formatter: (v: number) => `${v}%`, open: true };
      return { value, tooltip };
    },
    template: `
      <div style="padding-top: 32px; width: 400px;">
        <BSlider v-model="value" :tooltip="tooltip" />
        <p style="margin-top: 16px; font-size: 12px; color: #666;">Tooltip always visible with custom format</p>
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
          'Each handle has <code>role="slider"</code> with <code>aria-valuenow</code>/<code>min</code>/<code>max</code>/<code>orientation</code>. ' +
          'Reachable via <kbd>Tab</kbd>; arrow keys nudge the value.',
      },
    },
  },
  render: () => ({
    components: { BSlider },
    setup: () => {
      const single = ref(40);
      const range = ref<[number, number]>([25, 75]);
      return { single, range };
    },
    template: `
      <div style="width: 400px; display: flex; flex-direction: column; gap: 32px;">
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

    await expect(sliders[0]).toHaveAttribute('aria-label', 'Temperature');
    await expect(sliders[0]).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(sliders[0]).toHaveAttribute('aria-valuenow', '40');
    await expect(sliders[0]).toHaveAttribute('tabindex', '0');

    await expect(sliders[1]).toHaveAttribute('aria-label', 'Price range - minimum');
    await expect(sliders[2]).toHaveAttribute('aria-label', 'Price range');

    await userEvent.tab();
    await waitFor(() => expect(sliders[0]).toHaveFocus());

    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(sliders[0]).toHaveAttribute('aria-valuenow', '41'));

    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(sliders[0]).toHaveAttribute('aria-valuenow', '40'));
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
          'Override <code>--b-slider-track-bg</code>, <code>--b-slider-handle-color</code>, ' +
          '<code>--b-slider-handle-size</code>, and friends on the component root.',
      },
      source: {
        code: `
<BSlider
  v-model="value"
  style="
    --b-slider-track-bg: #52c41a;
    --b-slider-handle-color: #52c41a;
    --b-slider-handle-active-color: #389e0d;
  "
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BSlider },
    setup: () => {
      const v1 = ref(60);
      const v2 = ref(40);
      const v3 = ref<[number, number]>([20, 80]);
      return { v1, v2, v3 };
    },
    template: `
      <div style="padding-top: 32px; display: flex; flex-direction: column; gap: 40px; width: 400px;">
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
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  { token: '--b-slider-rail-bg', defaultValue: 'rgba(0, 0, 0, 0.04)', description: 'Background color of the rail.' },
  { token: '--b-slider-rail-hover-bg', defaultValue: 'rgba(0, 0, 0, 0.06)', description: 'Background color of the rail on hover.' },
  { token: '--b-slider-rail-size', defaultValue: '4px', description: 'Height (or width if vertical) of the rail.' },
  { token: '--b-slider-track-bg', defaultValue: '#91caff', description: 'Background color of the track (filled portion).' },
  { token: '--b-slider-track-bg-disabled', defaultValue: 'rgba(0, 0, 0, 0.04)', description: 'Track background when disabled.' },
  { token: '--b-slider-track-hover-bg', defaultValue: '#69b1ff', description: 'Track background on hover.' },
  { token: '--b-slider-handle-color', defaultValue: '#91caff', description: 'Border color of the handle.' },
  { token: '--b-slider-handle-color-disabled', defaultValue: '#bfbfbf', description: 'Handle border color when disabled.' },
  { token: '--b-slider-handle-active-color', defaultValue: '#1677ff', description: 'Handle border color when active / focused.' },
  { token: '--b-slider-handle-active-outline-color', defaultValue: 'rgba(22, 119, 255, 0.2)', description: 'Outline (box-shadow) color when handle is active.' },
  { token: '--b-slider-handle-line-width', defaultValue: '2px', description: 'Border width of the handle.' },
  { token: '--b-slider-handle-line-width-hover', defaultValue: '2.5px', description: 'Border width of the handle on hover.' },
  { token: '--b-slider-handle-size', defaultValue: '10px', description: 'Size of the handle (diameter).' },
  { token: '--b-slider-handle-size-hover', defaultValue: '12px', description: 'Size of the handle on hover.' },
  { token: '--b-slider-dot-border-color', defaultValue: '#f0f0f0', description: 'Border color of step dots.' },
  { token: '--b-slider-dot-active-border-color', defaultValue: '#91caff', description: 'Border color of active step dots.' },
  { token: '--b-slider-dot-size', defaultValue: '8px', description: 'Size of step dots.' },
  { token: '--b-slider-control-size', defaultValue: '10px', description: 'Overall control height reference.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'All scoped CSS variables exposed by <code>BSlider</code>. Override on the component root or any ancestor selector.',
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
