import { BMasonry } from '@/components';
import type { BMasonryItem, BMasonryLayoutChangePayload } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────

const meta = {
  title: 'DataDisplay/Masonry',
  component: BMasonry,
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: { type: 'number', min: 1, max: 6, step: 1 },
      description: 'Number of columns. Also accepts a responsive breakpoint map.',
      table: { defaultValue: { summary: '3' }, category: 'Props' },
    },
    gutter: {
      control: { type: 'number', min: 0, max: 48, step: 4 },
      description:
        'Gap between items (px). Accepts a number, [colGap, rowGap] tuple, or a responsive map.',
      table: { defaultValue: { summary: '0' }, category: 'Props' },
    },
    fresh: {
      control: 'boolean',
      description:
        'Monitor each item\'s size via ResizeObserver and reflow on change.',
      table: { defaultValue: { summary: 'false' }, category: 'Props' },
    },
    items: {
      control: 'object',
      description: 'Array of `BMasonryItem` objects to render.',
      table: { category: 'Props' },
    },
    classNames: {
      control: false,
      description:
        'Customise CSS classes on `root`, `column`, or `item` semantic elements.',
      table: { category: 'Props' },
    },
    styles: {
      control: false,
      description:
        'Customise inline styles on `root`, `column`, or `item` semantic elements.',
      table: { category: 'Props' },
    },
    onLayoutChange: {
      table: { category: 'Events' },
      description: 'Fires when the masonry layout recalculates.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BMasonry</code> component implements a Pinterest-style masonry layout. ' +
          'Items are distributed into columns using a "shortest column first" algorithm, ' +
          'ensuring the layout stays as balanced as possible.<br><br>' +
          'Accepts a fixed column count or a responsive breakpoint map. ' +
          'Supports per-item column pinning, custom gutter (col/row gaps), ' +
          'ResizeObserver-based re-flow (<code>fresh</code>), and full CSS variable theming.',
      },
    },
  },
} satisfies Meta<typeof BMasonry>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Fixture data helpers
// ─────────────────────────────────────────────

const COLORS = [
  'oklch(75% 0.15 20)',
  'oklch(80% 0.12 140)',
  'oklch(78% 0.14 260)',
  'oklch(82% 0.10 55)',
  'oklch(76% 0.13 310)',
  'oklch(80% 0.11 190)',
  'oklch(74% 0.16 30)',
  'oklch(79% 0.12 100)',
];

function makeItems(count: number, baseHeight = 80, spread = 160): BMasonryItem[] {
  return Array.from({ length: count }, (_, i) => ({
    key: i,
    height: baseHeight + Math.round(Math.sin(i * 1.5) * spread * 0.5 + spread * 0.5),
    data: { color: COLORS[i % COLORS.length], label: `Item ${i + 1}` },
  }));
}

/** Renders a coloured card to make heights visible. */
const cardTemplate = `
  <template #item="{ item }">
    <div
      :style="{
        background: item.data.color,
        height: item.height + 'px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'oklch(15% 0.02 260)',
        fontWeight: 600,
        fontSize: '14px',
      }"
    >
      {{ item.data.label }}
    </div>
  </template>
`;

// ─────────────────────────────────────────────
// Playground
// ─────────────────────────────────────────────

export const Playground: Story = {
  args: {
    columns: 3,
    gutter: 16,
    items: makeItems(9),
  },
  render: (args) => ({
    components: { BMasonry },
    setup() {
      return { args };
    },
    template: `
      <div style="padding: 24px; background: #f5f5f5; border-radius: 12px;">
        <BMasonry v-bind="args">${cardTemplate}</BMasonry>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Responsive columns
// ─────────────────────────────────────────────

export const ResponsiveColumns: Story = {
  name: 'Responsive Columns',
  parameters: {
    docs: {
      description: {
        story:
          'Pass a breakpoint map to `columns` to change the column count at different viewport widths.',
      },
    },
  },
  render: () => ({
    components: { BMasonry },
    setup() {
      const items = makeItems(8);
      const columns = { xs: 1, sm: 2, md: 3, lg: 4 };
      return { items, columns };
    },
    template: `
      <div style="padding: 24px; background: #f5f5f5; border-radius: 12px;">
        <p style="margin-bottom: 16px; font-size: 13px; color: #666;">
          Columns: xs=1 / sm=2 / md=3 / lg=4 — resize the preview panel to see changes.
        </p>
        <BMasonry :columns="columns" :gutter="12" :items="items">${cardTemplate}</BMasonry>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Gutter variants
// ─────────────────────────────────────────────

export const GutterVariants: Story = {
  name: 'Gutter Variants',
  parameters: {
    docs: {
      description: {
        story:
          'Show `gutter` as a fixed number, a `[colGap, rowGap]` tuple, or zero.',
      },
    },
  },
  render: () => ({
    components: { BMasonry },
    setup() {
      return { itemsA: makeItems(6), itemsB: makeItems(6), itemsC: makeItems(6) };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 32px; padding: 24px;">
        <div>
          <h4 style="margin-bottom:8px">gutter=0 (default)</h4>
          <BMasonry :columns="3" :gutter="0" :items="itemsA">${cardTemplate}</BMasonry>
        </div>
        <div>
          <h4 style="margin-bottom:8px">gutter=16 (uniform)</h4>
          <BMasonry :columns="3" :gutter="16" :items="itemsB">${cardTemplate}</BMasonry>
        </div>
        <div>
          <h4 style="margin-bottom:8px">gutter=[24, 8] (col=24, row=8)</h4>
          <BMasonry :columns="3" :gutter="[24, 8]" :items="itemsC">${cardTemplate}</BMasonry>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Column pinning
// ─────────────────────────────────────────────

export const ColumnPinning: Story = {
  name: 'Column Pinning',
  parameters: {
    docs: {
      description: {
        story:
          'Use the `column` property on an item (1-based) to pin it to a specific column, ' +
          'regardless of column heights.',
      },
    },
  },
  render: () => ({
    components: { BMasonry },
    setup() {
      const items: BMasonryItem[] = [
        { key: 1, height: 120, data: { color: COLORS[0], label: 'Pinned col 1' }, column: 1 },
        { key: 2, height: 80, data: { color: COLORS[1], label: 'Auto col' } },
        { key: 3, height: 160, data: { color: COLORS[2], label: 'Pinned col 3' }, column: 3 },
        { key: 4, height: 100, data: { color: COLORS[3], label: 'Auto col' } },
        { key: 5, height: 90, data: { color: COLORS[4], label: 'Pinned col 1' }, column: 1 },
        { key: 6, height: 130, data: { color: COLORS[5], label: 'Auto col' } },
      ];
      return { items };
    },
    template: `
      <div style="padding: 24px; background: #f5f5f5; border-radius: 12px;">
        <BMasonry :columns="3" :gutter="16" :items="items">${cardTemplate}</BMasonry>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// layoutChange event
// ─────────────────────────────────────────────

export const LayoutChangeEvent: Story = {
  name: 'layoutChange Event',
  parameters: {
    docs: {
      description: {
        story:
          'The `layoutChange` event fires with `{ columns, columnMap }` after each layout calculation.',
      },
    },
  },
  render: () => ({
    components: { BMasonry },
    setup() {
      const items = makeItems(6);
      const lastPayload = ref<BMasonryLayoutChangePayload | null>(null);
      function onLayoutChange(p: BMasonryLayoutChangePayload) {
        lastPayload.value = p;
      }
      return { items, lastPayload, onLayoutChange };
    },
    template: `
      <div style="padding: 24px;">
        <BMasonry :columns="3" :gutter="12" :items="items" @layout-change="onLayoutChange">${cardTemplate}</BMasonry>
        <pre style="margin-top: 16px; padding: 12px; background: #1e1e1e; color: #d4d4d4; border-radius: 8px; font-size: 12px; overflow: auto;">{{ JSON.stringify(lastPayload, null, 2) }}</pre>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

export const Accessibility: Story = {
  name: 'Accessibility',
  parameters: {
    docs: {
      description: {
        story:
          'Verify ARIA roles: the root carries `role="list"`, columns carry `role="presentation"`, ' +
          'and each item carries `role="listitem"`. Tab through items to confirm focusability of inner content.',
      },
    },
  },
  render: () => ({
    components: { BMasonry },
    setup() {
      return { items: makeItems(4) };
    },
    template: `
      <div style="padding: 24px;">
        <BMasonry :columns="2" :gutter="16" :items="items">
          <template #item="{ item }">
            <div
              role="img"
              tabindex="0"
              :style="{
                background: item.data.color,
                height: item.height + 'px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'oklch(15% 0.02 260)',
                fontWeight: 600,
                fontSize: '14px',
              }"
              :aria-label="item.data.label"
            >
              {{ item.data.label }}
            </div>
          </template>
        </BMasonry>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // Root has role=list
    const list = canvasElement.querySelector('[role="list"]');
    expect(list).toBeTruthy();
    expect(list?.getAttribute('aria-label')).toBeTruthy();

    // Each item wrapper has role=listitem
    const listItems = canvasElement.querySelectorAll('[role="listitem"]');
    expect(listItems.length).toBe(4);

    // Columns have role=presentation (not exposed to AT)
    const cols = canvasElement.querySelectorAll('[role="presentation"]');
    expect(cols.length).toBeGreaterThan(0);

    // Tab through focusable items
    await userEvent.tab();
    const focused = document.activeElement;
    expect(focused?.getAttribute('aria-label')).toBeTruthy();
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

export const Theming: Story = {
  name: 'Theming (CSS Variables)',
  parameters: {
    docs: {
      description: {
        story:
          'Override the scoped CSS variables on `.b-masonry` to customise the layout. ' +
          'This story overrides `--b-masonry-item-border-radius`, `--b-masonry-item-transition-duration`, ' +
          'and `--b-masonry-item-bg`.',
      },
    },
  },
  render: () => ({
    components: { BMasonry },
    setup() {
      return { items: makeItems(6) };
    },
    template: `
      <div style="padding: 24px; background: #0f0f0f; border-radius: 12px;">
        <BMasonry
          :columns="3"
          :gutter="20"
          :items="items"
          :styles="{
            root: {
              '--b-masonry-item-border-radius': '16px',
              '--b-masonry-item-transition-duration': '400ms',
              '--b-masonry-item-bg': 'oklch(25% 0.03 260)',
            }
          }"
        >
          <template #item="{ item }">
            <div
              :style="{
                height: item.height + 'px',
                borderRadius: 'var(--b-masonry-item-border-radius)',
                background: 'var(--b-masonry-item-bg)',
                border: '1px solid oklch(40% 0.05 260)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: item.data.color,
                fontWeight: 700,
                fontSize: '13px',
              }"
            >
              {{ item.data.label }}
            </div>
          </template>
        </BMasonry>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Interaction tests
// ─────────────────────────────────────────────

export const InteractionTests: Story = {
  name: 'Interaction Tests',
  args: {
    columns: 3,
    gutter: 16,
    items: makeItems(9),
  },
  render: (args) => ({
    components: { BMasonry },
    setup() {
      const layoutPayload = ref<BMasonryLayoutChangePayload | null>(null);
      return {
        args,
        layoutPayload,
        onLayoutChange: (p: BMasonryLayoutChangePayload) => {
          layoutPayload.value = p;
        },
      };
    },
    template: `
      <div>
        <BMasonry v-bind="args" @layout-change="onLayoutChange">
          <template #item="{ item }">
            <div
              :data-testid="'item-' + item.key"
              :style="{
                background: item.data.color,
                height: item.height + 'px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'oklch(15% 0.02 260)',
                fontWeight: 600,
              }"
            >{{ item.data.label }}</div>
          </template>
        </BMasonry>
        <div data-testid="layout-output" style="display:none">{{ JSON.stringify(layoutPayload) }}</div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // ── 1. Correct item count ─────────────────────────────────────────────────
    const items = canvasElement.querySelectorAll('[role="listitem"]');
    expect(items.length).toBe(9);

    // ── 2. Three columns rendered ─────────────────────────────────────────────
    const cols = canvasElement.querySelectorAll('[role="presentation"]');
    expect(cols.length).toBe(3);

    // ── 3. Each item is visible ───────────────────────────────────────────────
    for (const item of Array.from(items)) {
      expect(item).toBeVisible();
    }

    // ── 4. ARIA list structure ────────────────────────────────────────────────
    const list = canvasElement.querySelector('[role="list"]');
    expect(list).toBeTruthy();

    // ── 5. data-masonry-key set on each listitem ──────────────────────────────
    const withKey = canvasElement.querySelectorAll('[data-masonry-key]');
    expect(withKey.length).toBe(9);

    // ── 6. CSS vars injected on root ──────────────────────────────────────────
    const rootStyle = (list as HTMLElement)?.getAttribute('style') ?? '';
    expect(rootStyle).toContain('--b-masonry-columns');
    expect(rootStyle).toContain('--b-masonry-col-gap');
  },
};
