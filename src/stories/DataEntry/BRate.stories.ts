import { BRate } from '@/components/BRate';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

const meta = {
  title: 'Data Entry/Rate',
  component: BRate,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: { type: 'number', min: 0, max: 5, step: 0.5 },
      description: 'The current rating value.',
      table: { category: 'Two-Way Binding Props' },
    },
    count: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Total number of stars.',
      table: { category: 'Props', defaultValue: { summary: '5' } },
    },
    allowHalf: {
      control: 'boolean',
      description: 'Whether to allow half-star selection.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    allowClear: {
      control: 'boolean',
      description: 'Whether to allow clearing the value by clicking the same star again.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    disabled: {
      control: 'boolean',
      description: 'If true, the component is read-only.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    keyboard: {
      control: 'boolean',
      description: 'Whether keyboard navigation is enabled.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
      description: 'Size of the stars.',
      table: { category: 'Props', defaultValue: { summary: "'default'" } },
    },
    tooltips: {
      control: 'object',
      description: 'Tooltip text for each star.',
      table: { category: 'Props' },
    },
    character: {
      control: 'text',
      description: 'Custom character to use instead of stars.',
      table: { category: 'Props' },
    },
    'onUpdate:modelValue': {
      description: 'Emitted when the rating changes.',
      table: { category: 'Events' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          '<code>BRate</code> is used for rating content. It supports full and half star selections, ' +
          'custom characters, keyboard navigation, and controlled/uncontrolled usage via <code>v-model</code>.<br><br>' +
          'Fully accessible with keyboard navigation (Arrow keys, Tab) and ARIA attributes.',
      },
    },
  },
} satisfies Meta<typeof BRate>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

export const Default: Story = {
  args: {
    modelValue: 3,
    count: 5,
    allowHalf: false,
    allowClear: true,
    disabled: false,
    keyboard: true,
    size: 'default',
  },
  parameters: { docs: { source: { code: `<BRate v-model="value" />` } } },
  render: (args) => ({
    components: { BRate },
    setup: () => {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div>
        <BRate v-bind="args" v-model="value" />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Value: {{ value }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rate = canvas.getByRole('slider');
    await expect(rate).toBeInTheDocument();
    await expect(rate).toHaveAttribute('aria-valuenow', '3');
  },
};

export const HalfStars: Story = {
  parameters: { docs: { source: { code: `<BRate v-model="value" allow-half />` } } },
  render: () => ({
    components: { BRate },
    setup: () => {
      const value = ref(2.5);
      return { value };
    },
    template: `
      <div>
        <BRate v-model="value" allow-half />
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
<BRate size="small" />
<BRate size="default" />
<BRate size="large" />
        `,
      },
    },
  },
  render: () => ({
    components: { BRate },
    setup: () => {
      const small = ref(3);
      const medium = ref(3);
      const large = ref(3);
      return { small, medium, large };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <span style="display: inline-block; width: 80px; font-size: 12px; color: #666;">Small:</span>
          <BRate v-model="small" size="small" />
        </div>
        <div>
          <span style="display: inline-block; width: 80px; font-size: 12px; color: #666;">Default:</span>
          <BRate v-model="medium" size="default" />
        </div>
        <div>
          <span style="display: inline-block; width: 80px; font-size: 12px; color: #666;">Large:</span>
          <BRate v-model="large" size="large" />
        </div>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  parameters: { docs: { source: { code: `<BRate :model-value="3" disabled />` } } },
  render: () => ({
    components: { BRate },
    template: `<BRate :model-value="3" disabled />`,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

export const CustomCharacter: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BRate v-model="value" character="♥" />
<BRate v-model="value" character="A" />
        `,
      },
    },
  },
  render: () => ({
    components: { BRate },
    setup: () => {
      const heart = ref(3);
      const letter = ref(4);
      return { heart, letter };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <span style="display: inline-block; width: 100px; font-size: 12px; color: #666;">Heart:</span>
          <BRate v-model="heart" character="♥" />
        </div>
        <div>
          <span style="display: inline-block; width: 100px; font-size: 12px; color: #666;">Letter A:</span>
          <BRate v-model="letter" character="A" />
        </div>
      </div>
    `,
  }),
};

export const Tooltips: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BRate
  v-model="value"
  :tooltips="['Terrible', 'Bad', 'Normal', 'Good', 'Wonderful']"
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BRate },
    setup: () => {
      const value = ref(3);
      const tooltips = ['Terrible', 'Bad', 'Normal', 'Good', 'Wonderful'];
      return { value, tooltips };
    },
    template: `
      <div>
        <BRate v-model="value" :tooltips="tooltips" />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">
          {{ tooltips[value - 1] || 'No rating' }}
        </p>
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
          'Renders <code>role="slider"</code> with <code>aria-valuenow</code>/<code>aria-valuemin</code>/<code>aria-valuemax</code>. ' +
          'Reachable via <kbd>Tab</kbd>; arrow keys change the value.',
      },
    },
  },
  render: () => ({
    components: { BRate },
    setup: () => {
      const value = ref(2);
      return { value };
    },
    template: `
      <div>
        <BRate v-model="value" aria-label="Product rating" />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Value: {{ value }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rate = canvas.getByRole('slider');

    await expect(rate).toHaveAttribute('aria-label', 'Product rating');
    await expect(rate).toHaveAttribute('aria-valuenow', '2');
    await expect(rate).toHaveAttribute('aria-valuemin', '0');
    await expect(rate).toHaveAttribute('aria-valuemax', '5');
    await expect(rate).toHaveAttribute('tabindex', '0');

    await userEvent.tab();
    await waitFor(() => {
      expect(rate).toHaveFocus();
    });

    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => {
      expect(rate).toHaveAttribute('aria-valuenow', '3');
    });

    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => {
      expect(rate).toHaveAttribute('aria-valuenow', '2');
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
          'Override <code>--b-rate-star-color</code>, <code>--b-rate-star-bg</code>, ' +
          '<code>--b-rate-star-size</code>, and <code>--b-rate-star-hover-scale</code> on the component root.',
      },
      source: {
        code: `
<BRate
  v-model="value"
  style="--b-rate-star-color: #ff4d4f; --b-rate-star-bg: rgba(255, 77, 79, 0.15);"
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BRate },
    setup: () => {
      const v1 = ref(4);
      const v2 = ref(3);
      const v3 = ref(5);
      return { v1, v2, v3 };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Custom color (red)</p>
          <BRate
            v-model="v1"
            style="--b-rate-star-color: #ff4d4f; --b-rate-star-bg: rgba(255, 77, 79, 0.15);"
          />
        </div>
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Custom size (32px) & color (blue)</p>
          <BRate
            v-model="v2"
            style="--b-rate-star-color: #1677ff; --b-rate-star-size: 32px; --b-rate-star-bg: rgba(22, 119, 255, 0.1);"
          />
        </div>
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">No hover scale</p>
          <BRate
            v-model="v3"
            style="--b-rate-star-hover-scale: scale(1); --b-rate-star-color: #52c41a;"
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
  { token: '--b-rate-star-bg', defaultValue: 'rgba(0, 0, 0, 0.06)', description: 'Background color of unselected stars.' },
  { token: '--b-rate-star-color', defaultValue: '#fadb14', description: 'Color of selected / active stars.' },
  { token: '--b-rate-star-hover-scale', defaultValue: 'scale(1.1)', description: 'Transform applied on star hover.' },
  { token: '--b-rate-star-size', defaultValue: '20px', description: 'Size of each star (width and height).' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'All scoped CSS variables exposed by <code>BRate</code>. Override on the component root or any ancestor selector.',
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
