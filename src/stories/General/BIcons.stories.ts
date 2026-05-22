import BIcon from '@/components/BIcon/BIcon.vue';
import { BIconSize, BIconVariant } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Icons from './Icons.vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'General/Icons',
  component: BIcon,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: 'text',
      description: 'Icon identifier - matches the SVG filename (e.g. `"home"`, `"arrow-right"`).',
      table: { category: 'Props' },
    },
    variant: {
      control: 'select',
      options: Object.values(BIconVariant),
      description: 'Visual style of the icon.',
      table: { defaultValue: { summary: 'regular' }, category: 'Props' },
    },
    size: {
      control: 'select',
      options: Object.values(BIconSize),
      description: 'Preset size of the icon.',
      table: { defaultValue: { summary: 'md' }, category: 'Props' },
    },
    color: {
      control: 'text',
      description:
        'Theme token (`primary`, `success`, `failure`, `warning`, `info`, `secondary`) or any CSS color value. Defaults to `currentColor`.',
      table: { defaultValue: { summary: 'currentColor' }, category: 'Props' },
    },
    rotate: {
      control: 'number',
      description: 'Rotation angle in degrees applied via CSS `transform`.',
      table: { defaultValue: { summary: '0' }, category: 'Props' },
    },
    width: {
      control: 'text',
      description: 'Override width, e.g. `"2rem"`, `"24px"`. Takes precedence over `size`.',
      table: { category: 'Props' },
    },
    height: {
      control: 'text',
      description: 'Override height, e.g. `"2rem"`, `"24px"`. Takes precedence over `size`.',
      table: { category: 'Props' },
    },
    brand: {
      control: 'boolean',
      description: 'Set `true` to load from the `brands/` folder (`BIconBrandName` values).',
      table: { defaultValue: { summary: 'false' }, category: 'Props' },
    },
    decorative: {
      control: 'boolean',
      description:
        'When `true`, sets `aria-hidden="true"` (icon is purely visual). Set `false` and provide `ariaLabel` for meaningful icons.',
      table: { defaultValue: { summary: 'true' }, category: 'Props' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label when the icon is meaningful (`decorative: false`).',
      table: { category: 'Props' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BIcon</code> component renders SVG icons fetched at runtime from the static assets folder - icons are <strong>not</strong> bundled as JS chunks.<br><br>' +
          'Icons come in <strong>9 variants</strong>: <code>regular</code>, <code>solid</code>, <code>light</code>, <code>thin</code>, <code>duotone</code>, ' +
          '<code>sharp-light</code>, <code>sharp-regular</code>, <code>sharp-solid</code>, <code>sharp-thin</code>.<br>' +
          'Colors accept <strong>theme tokens</strong> (<code>primary</code>, <code>success</code>…) or any CSS color value.<br>' +
          'Use <code>decorative: false</code> + <code>ariaLabel</code> for icons that convey meaning to screen-reader users.',
      },
    },
  },
} satisfies Meta<typeof BIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

// Shared fallback so non-playground stories satisfy the required `icon` arg.
const baseArgs = { icon: 'house' as any };

// ─────────────────────────────────────────────
// 1. Default (Playground)
// ─────────────────────────────────────────────
/**
 * Interactive playground - tweak all props via the Controls panel.
 */
export const Default: Story = {
  args: {
    icon: 'house' as any,
    variant: BIconVariant.Regular,
    size: BIconSize.XLarge,
    color: 'currentColor',
    rotate: 0,
    brand: false,
    decorative: true,
  },
  render: (args) => ({
    components: { BIcon },
    setup() {
      return { args };
    },
    template: `<BIcon v-bind="args" />`,
  }),
};

// ─────────────────────────────────────────────
// 2. Sizes
// ─────────────────────────────────────────────
/**
 * All six preset sizes from `xs` to `xxl`.
 */
export const Sizes: Story = {
  args: baseArgs,
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BIcon icon="star" size="xs" />
<BIcon icon="star" size="sm" />
<BIcon icon="star" />
<BIcon icon="star" size="lg" />
<BIcon icon="star" size="xl" />
<BIcon icon="star" size="xxl" />`,
      },
    },
  },
  render: () => ({
    components: { BIcon },
    setup() {
      return { sizes: Object.values(BIconSize) };
    },
    template: `
      <div style="display:flex;align-items:flex-end;gap:1.5rem;padding:2rem;flex-wrap:wrap;">
        <div v-for="s in sizes" :key="s" style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;">
          <BIcon icon="star" :size="s" />
          <span style="font-size:11px;color:#595959;">{{ s }}</span>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 3. Variants
// ─────────────────────────────────────────────
/**
 * All nine icon variants on the same icon for direct comparison.
 */
export const Variants: Story = {
  args: baseArgs,
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BIcon icon="bookmark" variant="regular" />
<BIcon icon="bookmark" variant="solid" />
<BIcon icon="bookmark" variant="light" />
<BIcon icon="bookmark" variant="thin" />
<BIcon icon="bookmark" variant="duotone" />`,
      },
    },
  },
  render: () => ({
    components: { BIcon },
    setup() {
      return { variants: Object.values(BIconVariant) };
    },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:2rem;padding:2rem;">
        <div v-for="v in variants" :key="v" style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;">
          <BIcon icon="bookmark" :variant="v" size="xl" />
          <span style="font-size:11px;color:#595959;">{{ v }}</span>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 4. Colors
// ─────────────────────────────────────────────
/**
 * Theme tokens and custom CSS color values.
 */
export const Colors: Story = {
  args: baseArgs,
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BIcon icon="circle-check" color="primary" size="xl" />
<BIcon icon="circle-check" color="success" size="xl" />
<BIcon icon="circle-check" color="failure" size="xl" />
<BIcon icon="circle-check" color="warning" size="xl" />
<BIcon icon="circle-check" color="info" size="xl" />
<BIcon icon="circle-check" color="#f97316" size="xl" />`,
      },
    },
  },
  render: () => ({
    components: { BIcon },
    setup() {
      const tokens = ['primary', 'secondary', 'success', 'failure', 'warning', 'info'];
      const custom = ['#f97316', 'oklch(60% 0.2 180)', '#8b5cf6'];
      return { tokens, custom };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem;padding:2rem;">
        <div>
          <p style="font-size:12px;color:#595959;margin:0 0 8px;">Theme tokens</p>
          <div style="display:flex;gap:1.5rem;flex-wrap:wrap;align-items:center;">
            <div v-for="c in tokens" :key="c" style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;">
              <BIcon icon="circle-check" :color="c" size="xl" variant="solid" />
              <span style="font-size:11px;color:#595959;">{{ c }}</span>
            </div>
          </div>
        </div>
        <div>
          <p style="font-size:12px;color:#595959;margin:0 0 8px;">Custom CSS colors</p>
          <div style="display:flex;gap:1.5rem;flex-wrap:wrap;align-items:center;">
            <div v-for="c in custom" :key="c" style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;">
              <BIcon icon="circle-check" :color="c" size="xl" variant="solid" />
              <span style="font-size:11px;color:#595959;">{{ c }}</span>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 5. Rotate
// ─────────────────────────────────────────────
/**
 * Use `rotate` to spin an icon to any angle - useful for directional icons.
 */
export const Rotate: Story = {
  args: baseArgs,
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BIcon icon="arrow-right" :rotate="0" />
<BIcon icon="arrow-right" :rotate="90" />
<BIcon icon="arrow-right" :rotate="180" />
<BIcon icon="arrow-right" :rotate="270" />`,
      },
    },
  },
  render: () => ({
    components: { BIcon },
    setup() {
      return { angles: [0, 45, 90, 135, 180, 225, 270, 315] };
    },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:2rem;padding:2rem;align-items:center;">
        <div v-for="a in angles" :key="a" style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;">
          <BIcon icon="arrow-right" size="xl" :rotate="a" />
          <span style="font-size:11px;color:#595959;">{{ a }}°</span>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 6. List of Icons
// ─────────────────────────────────────────────
/**
 * Browse and search the full icon library. Click any icon to copy its name to the clipboard.
 */
export const ListOfIcons: Story = {
  name: 'List of Icons',
  args: baseArgs,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Browse the full icon library. Use the search box to filter by name and the dropdowns to preview different variants and sizes. ' +
          '<strong>Click any icon</strong> to copy its name to the clipboard.',
      },
    },
  },
  render: () => ({
    components: { Icons },
    template: `<Icons />`,
  }),
};
