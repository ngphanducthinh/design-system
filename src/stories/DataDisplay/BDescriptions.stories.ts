import { BDescriptions, BDescriptionsItem } from '@/components';
import type { BDescriptionsItem as BDescriptionsItemData } from '@/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'DataDisplay/Descriptions',
  component: BDescriptions,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Title of the descriptions block.',
      table: { category: 'Props' },
    },
    extra: {
      control: 'text',
      description: 'Extra content in the top-right corner.',
      table: { category: 'Props' },
    },
    bordered: {
      control: 'boolean',
      description: 'Whether to show border around the table.',
      table: { defaultValue: { summary: 'false' }, category: 'Props' },
    },
    colon: {
      control: 'boolean',
      description: 'Whether to show colon after the label.',
      table: { defaultValue: { summary: 'true' }, category: 'Props' },
    },
    column: {
      control: { type: 'number', min: 1, max: 6 },
      description: 'Number of columns per row.',
      table: { defaultValue: { summary: '3' }, category: 'Props' },
    },
    layout: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout direction of description items.',
      table: { defaultValue: { summary: 'horizontal' }, category: 'Props' },
    },
    size: {
      control: 'select',
      options: ['default', 'middle', 'small'],
      description: 'Size of the component.',
      table: { defaultValue: { summary: 'default' }, category: 'Props' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BDescriptions</code> component displays a list of label–value pairs in a structured layout.<br><br>' +
          'Supports <strong>bordered</strong> and non-bordered modes, <strong>horizontal</strong> and <strong>vertical</strong> layouts, ' +
          '<strong>column</strong> control, <strong>span</strong> for items, and three <strong>size</strong> variants.<br>' +
          'Items can be provided via the <code>items</code> prop or as <code>BDescriptionsItem</code> slot children.<br>' +
          'Theming via <code>--b-descriptions-*</code> CSS custom properties. Respects <code>prefers-reduced-motion</code>.',
      },
    },
  },
} satisfies Meta<typeof BDescriptions>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Sample data
// ─────────────────────────────────────────────
const sampleItems: BDescriptionsItemData[] = [
  { label: 'UserName', children: 'Zhou Maomao' },
  { label: 'Telephone', children: '1810000000' },
  { label: 'Live', children: 'Hangzhou, Zhejiang' },
  { label: 'Remark', children: 'Empty' },
  { label: 'Address', children: 'No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China' },
];

// ─────────────────────────────────────────────
// 1. Playground (all controls)
// ─────────────────────────────────────────────
/**
 * Interactive playground — tweak all props via the Controls panel.
 */
export const Playground: Story = {
  args: {
    title: 'User Info',
    bordered: false,
    colon: true,
    column: 3,
    layout: 'horizontal',
    size: 'default',
  },
  render: (args) => ({
    components: { BDescriptions },
    setup() {
      return { args, sampleItems };
    },
    template: `
      <BDescriptions v-bind="args" :items="sampleItems">
        <template #extra><a href="#">Edit</a></template>
      </BDescriptions>
    `,
  }),
};

// ─────────────────────────────────────────────
// 2. Basic
// ─────────────────────────────────────────────
/**
 * Simple descriptions with title and items.
 */
export const Basic: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BDescriptions title="User Info" :items="items" />
        `,
      },
    },
  },
  render: () => ({
    components: { BDescriptions },
    setup() {
      return { sampleItems };
    },
    template: `
      <BDescriptions data-testid="basic" title="User Info" :items="sampleItems" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('basic');
    expect(el.querySelector('.b-descriptions__title')?.textContent).toBe('User Info');
    expect(el.querySelector('.b-descriptions__item-label')?.textContent).toContain('UserName');
    expect(el.querySelector('.b-descriptions__item-content')?.textContent).toContain('Zhou Maomao');
    expect(el.classList.contains('b-descriptions--colon')).toBe(true);
  },
};

// ─────────────────────────────────────────────
// 3. Bordered
// ─────────────────────────────────────────────
/**
 * Descriptions with borders around cells.
 */
export const Bordered: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BDescriptions title="User Info" bordered :items="items" />
        `,
      },
    },
  },
  render: () => ({
    components: { BDescriptions },
    setup() {
      return { sampleItems };
    },
    template: `
      <BDescriptions data-testid="bordered" title="User Info" bordered :items="sampleItems" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('bordered');
    expect(el.classList.contains('b-descriptions--bordered')).toBe(true);
    expect(el.querySelectorAll('th.b-descriptions__item-label--bordered').length).toBeGreaterThan(0);
    expect(el.querySelectorAll('td.b-descriptions__item-content--bordered').length).toBeGreaterThan(0);
  },
};

// ─────────────────────────────────────────────
// 4. Sizes
// ─────────────────────────────────────────────
/**
 * Size variants: default, middle, small.
 */
export const Sizes: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BDescriptions title="Default" size="default" bordered :items="items" />
<BDescriptions title="Middle" size="middle" bordered :items="items" />
<BDescriptions title="Small" size="small" bordered :items="items" />
        `,
      },
    },
  },
  render: () => ({
    components: { BDescriptions },
    setup() {
      return { sampleItems };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:2rem;">
        <BDescriptions data-testid="size-default" title="Default" size="default" bordered :items="sampleItems" />
        <BDescriptions data-testid="size-middle" title="Middle" size="middle" bordered :items="sampleItems" />
        <BDescriptions data-testid="size-small" title="Small" size="small" bordered :items="sampleItems" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const mid = canvas.getByTestId('size-middle');
    expect(mid.classList.contains('b-descriptions--middle')).toBe(true);
    const sm = canvas.getByTestId('size-small');
    expect(sm.classList.contains('b-descriptions--small')).toBe(true);
  },
};

// ─────────────────────────────────────────────
// 5. Vertical layout
// ─────────────────────────────────────────────
/**
 * Vertical layout places labels above content.
 */
export const VerticalLayout: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BDescriptions title="Vertical" layout="vertical" :items="items" />
<BDescriptions title="Vertical Bordered" layout="vertical" bordered :items="items" />
        `,
      },
    },
  },
  render: () => ({
    components: { BDescriptions },
    setup() {
      return { sampleItems };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:2rem;">
        <BDescriptions data-testid="vert" title="Vertical" layout="vertical" :items="sampleItems" />
        <BDescriptions data-testid="vert-bordered" title="Vertical Bordered" layout="vertical" bordered :items="sampleItems" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('vert');
    expect(el.classList.contains('b-descriptions--vertical')).toBe(true);
    const bordered = canvas.getByTestId('vert-bordered');
    expect(bordered.classList.contains('b-descriptions--bordered')).toBe(true);
    expect(bordered.classList.contains('b-descriptions--vertical')).toBe(true);
  },
};

// ─────────────────────────────────────────────
// 6. Slot-based usage with BDescriptionsItem
// ─────────────────────────────────────────────
/**
 * Using BDescriptionsItem children instead of the `items` prop.
 */
export const SlotBasedItems: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BDescriptions title="User Info">
  <BDescriptionsItem label="UserName">Zhou Maomao</BDescriptionsItem>
  <BDescriptionsItem label="Telephone">1810000000</BDescriptionsItem>
  <BDescriptionsItem label="Live">Hangzhou, Zhejiang</BDescriptionsItem>
</BDescriptions>
        `,
      },
    },
  },
  render: () => ({
    components: { BDescriptions, BDescriptionsItem },
    template: `
      <BDescriptions data-testid="slot-items" title="User Info">
        <BDescriptionsItem label="UserName">Zhou Maomao</BDescriptionsItem>
        <BDescriptionsItem label="Telephone">1810000000</BDescriptionsItem>
        <BDescriptionsItem label="Live">Hangzhou, Zhejiang</BDescriptionsItem>
        <BDescriptionsItem label="Remark">Empty</BDescriptionsItem>
        <BDescriptionsItem label="Address" :span="2">
          No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China
        </BDescriptionsItem>
      </BDescriptions>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('slot-items');
    const labels = el.querySelectorAll('.b-descriptions__item-label');
    expect(labels.length).toBeGreaterThanOrEqual(5);
    expect(labels[0].textContent).toContain('UserName');
  },
};

// ─────────────────────────────────────────────
// 7. Custom span
// ─────────────────────────────────────────────
/**
 * Items can span multiple columns using the `span` property.
 */
export const CustomSpan: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BDescriptions title="Custom Span" bordered :column="3" :items="items" />
        `,
      },
    },
  },
  render: () => ({
    components: { BDescriptions },
    setup() {
      const items: BDescriptionsItemData[] = [
        { label: 'Product', children: 'Cloud Database' },
        { label: 'Billing Mode', children: 'Prepaid' },
        { label: 'Automatic Renewal', children: 'YES' },
        { label: 'Order time', children: '2018-04-24 18:00:00' },
        { label: 'Usage Time', children: '2019-04-24 18:00:00', span: 2 },
        { label: 'Status', children: 'Running', span: 3 },
        { label: 'Negotiated Amount', children: '$80.00' },
        { label: 'Discount', children: '$20.00' },
        { label: 'Official Receipts', children: '$60.00' },
        { label: 'Config Info', children: 'Data disk type: MongoDB | Database version: 3.4 | Package: dds.mongo.mid', span: 3 },
      ];
      return { items };
    },
    template: `
      <BDescriptions data-testid="custom-span" title="Custom Span" bordered :column="3" :items="items" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('custom-span');
    expect(el.classList.contains('b-descriptions--bordered')).toBe(true);
    const labels = el.querySelectorAll('th.b-descriptions__item-label--bordered');
    expect(labels.length).toBeGreaterThan(0);
  },
};

// ─────────────────────────────────────────────
// 8. Accessibility story
// ─────────────────────────────────────────────
/**
 * Accessibility features:
 * - Table has `role="presentation"` (layout table, not data)
 * - Bordered mode uses `th` for labels (semantic emphasis)
 * - `td` for content cells
 * - Proper heading in title
 */
export const Accessibility: Story = {
  name: 'Accessibility (roles & semantics)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The descriptions table uses `role="presentation"` since it is a layout table. ' +
          'In bordered mode, labels are `<th>` elements for semantic weight. ' +
          'All text content remains accessible to screen readers.',
      },
    },
  },
  render: () => ({
    components: { BDescriptions },
    setup() {
      return { sampleItems };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:2rem;">
        <BDescriptions data-testid="a11y-basic" title="Non-bordered" :items="sampleItems" />
        <BDescriptions data-testid="a11y-bordered" title="Bordered" bordered :items="sampleItems" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Non-bordered: table role=presentation
    const basic = canvas.getByTestId('a11y-basic');
    const table1 = basic.querySelector('.b-descriptions__table');
    expect(table1?.getAttribute('role')).toBe('presentation');

    // Bordered: th for labels, td for content
    const bordered = canvas.getByTestId('a11y-bordered');
    const table2 = bordered.querySelector('.b-descriptions__table');
    expect(table2?.getAttribute('role')).toBe('presentation');
    expect(bordered.querySelectorAll('th.b-descriptions__item-label--bordered').length).toBe(5);
    expect(bordered.querySelectorAll('td.b-descriptions__item-content--bordered').length).toBe(5);
  },
};

// ─────────────────────────────────────────────
// 9. Theming story (CSS vars)
// ─────────────────────────────────────────────
/**
 * Override `--b-descriptions-*` CSS custom properties to customize appearance.
 */
export const Theming: Story = {
  name: 'Theming (CSS vars)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Override `--b-descriptions-*` CSS custom properties on the component root to customise appearance ' +
          'without touching the component source.',
      },
      source: {
        code: `
<style>
.custom-descriptions {
  --b-descriptions-title-color: #1d39c4;
  --b-descriptions-label-color: #531dab;
  --b-descriptions-label-bg: #f9f0ff;
  --b-descriptions-border-color: #d3adf7;
}
</style>

<BDescriptions class="custom-descriptions" title="Custom Theme" bordered :items="items" />
        `,
      },
    },
  },
  render: () => ({
    components: { BDescriptions },
    setup() {
      return { sampleItems };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:2rem;">
        <BDescriptions title="Default Theme" bordered :items="sampleItems" />
        <BDescriptions
          title="Purple Theme"
          bordered
          :items="sampleItems"
          style="--b-descriptions-title-color:#531dab;--b-descriptions-label-color:#531dab;--b-descriptions-label-bg:#f9f0ff;--b-descriptions-border-color:#d3adf7;"
        />
        <BDescriptions
          title="Blue Compact"
          bordered
          size="small"
          :items="sampleItems"
          style="--b-descriptions-title-color:#1d39c4;--b-descriptions-label-bg:#f0f5ff;--b-descriptions-border-color:#adc6ff;--b-descriptions-border-radius:16px;"
        />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 10. Interaction tests
// ─────────────────────────────────────────────
/**
 * Automated interaction tests: verify rendering, structure, and variants.
 */
export const InteractionTests: Story = {
  name: 'Interaction – rendering & structure',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Automated play function: verifies item rendering, bordered structure, vertical layout, and size modifiers.',
      },
    },
  },
  render: () => ({
    components: { BDescriptions },
    setup() {
      return { sampleItems };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:2rem;">
        <BDescriptions
          data-testid="int-basic"
          title="Basic"
          :items="sampleItems"
        />
        <BDescriptions
          data-testid="int-bordered"
          title="Bordered"
          bordered
          :items="sampleItems"
        />
        <BDescriptions
          data-testid="int-vertical"
          title="Vertical"
          layout="vertical"
          :items="sampleItems"
        />
        <BDescriptions
          data-testid="int-small"
          title="Small"
          size="small"
          bordered
          :items="sampleItems"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Basic rendering
    const basic = canvas.getByTestId('int-basic');
    expect(basic.querySelector('.b-descriptions__title')?.textContent).toBe('Basic');
    expect(basic.querySelectorAll('.b-descriptions__item-label').length).toBeGreaterThanOrEqual(5);
    expect(basic.querySelectorAll('.b-descriptions__item-content').length).toBeGreaterThanOrEqual(5);
    expect(basic.classList.contains('b-descriptions--horizontal')).toBe(true);
    expect(basic.classList.contains('b-descriptions--colon')).toBe(true);

    // Bordered structure
    const bordered = canvas.getByTestId('int-bordered');
    expect(bordered.classList.contains('b-descriptions--bordered')).toBe(true);
    expect(bordered.querySelectorAll('th').length).toBeGreaterThan(0);
    expect(bordered.querySelectorAll('td').length).toBeGreaterThan(0);

    // Vertical layout
    const vertical = canvas.getByTestId('int-vertical');
    expect(vertical.classList.contains('b-descriptions--vertical')).toBe(true);

    // Small size
    const small = canvas.getByTestId('int-small');
    expect(small.classList.contains('b-descriptions--small')).toBe(true);
  },
};
