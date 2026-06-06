import type { BMasonryItem, BMasonryLayoutChangePayload } from '@/components';
import { BMasonry } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent } from 'storybook/test';
import { ref } from 'vue';

/**
 * BMasonry — Pinterest-style masonry layout. Items distribute into columns
 * using a "shortest column first" algorithm to keep heights balanced.
 *
 * Story file follows `docs/STORY_FORMAT.md`:
 *   Default → per-prop Usage → Examples → Accessibility → Theming → Design Tokens (LAST)
 */
const meta = {
  title: 'Layout/Masonry',
  component: BMasonry,
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: { type: 'number', min: 1, max: 6, step: 1 },
      description: 'Number of columns. Also accepts a responsive breakpoint map.',
      table: { category: 'Props', defaultValue: { summary: '3' } },
    },
    gutter: {
      control: { type: 'number', min: 0, max: 48, step: 4 },
      description:
        'Gap between items (px). Accepts a number, [colGap, rowGap] tuple, or a responsive map.',
      table: { category: 'Props', defaultValue: { summary: '0' } },
    },
    fresh: {
      control: 'boolean',
      description: "Monitor each item's size via ResizeObserver and reflow on change.",
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    items: {
      control: 'object',
      description: 'Array of `BMasonryItem` objects to render.',
      table: { category: 'Props' },
    },
    classNames: {
      control: false,
      description: 'Customise CSS classes on `root`, `column`, or `item` semantic elements.',
      table: { category: 'Props' },
    },
    styles: {
      control: false,
      description: 'Customise inline styles on `root`, `column`, or `item` semantic elements.',
      table: { category: 'Props' },
    },
    item: {
      description: 'Scoped slot rendered for each item. Receives `{ item, index, column }`.',
      table: { category: 'Slots' },
    },
    default: {
      description: 'Fallback slot used when no `items` prop is provided — raw children only.',
      table: { category: 'Slots' },
    },
    onLayoutChange: {
      description: 'Fires with `{ columns, columnMap }` after each layout calculation.',
      table: { category: 'Events' },
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
// Usage
// ─────────────────────────────────────────────

/** Default 3-column masonry with a uniform gutter. */
export const Default: Story = {
  args: {
    columns: 3,
    gutter: 16,
    items: makeItems(9),
  },
  parameters: {
    docs: {
      source: {
        code: `
<BMasonry :columns="3" :gutter="16" :items="items">
  <template #item="{ item }">
    <Card :data="item.data" />
  </template>
</BMasonry>
        `,
      },
    },
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

/** Pass a breakpoint map to `columns` to vary column count by viewport width. */
export const ResponsiveColumns: Story = {
  name: 'Responsive Columns',
  parameters: {
    docs: {
      description: {
        story:
          'Pass a breakpoint map to `columns` to change the column count at different viewport widths.',
      },
      source: {
        code: `<BMasonry :columns="{ xs: 1, sm: 2, md: 3, lg: 4 }" :gutter="12" :items="items" />`,
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

/** `gutter` accepts a number, a `[colGap, rowGap]` tuple, or a responsive map. */
export const GutterVariants: Story = {
  name: 'Gutter Variants',
  parameters: {
    docs: {
      description: {
        story: 'Show `gutter` as zero, a uniform number, or a `[colGap, rowGap]` tuple.',
      },
      source: {
        code: `
<BMasonry :columns="3" :gutter="0" :items="items" />
<BMasonry :columns="3" :gutter="16" :items="items" />
<BMasonry :columns="3" :gutter="[24, 8]" :items="items" />
        `,
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

/** Use the per-item `column` property (1-based) to pin an item to a specific column. */
export const ColumnPinning: Story = {
  name: 'Column Pinning',
  parameters: {
    docs: {
      description: {
        story:
          'Use the `column` property on an item (1-based) to pin it to a specific column, regardless of column heights.',
      },
      source: {
        code: `
const items = [
  { key: 1, height: 120, column: 1 }, // pinned to column 1
  { key: 2, height: 80 },              // auto
  { key: 3, height: 160, column: 3 }, // pinned to column 3
];
        `,
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
// Examples
// ─────────────────────────────────────────────

/** Listen for `layoutChange` to react to column / column-map updates. */
export const LayoutChangeEvent: Story = {
  name: 'Listen To Layout Changes',
  parameters: {
    docs: {
      description: {
        story:
          'The `layoutChange` event fires with `{ columns, columnMap }` after each layout calculation.',
      },
      source: {
        code: `
<BMasonry
  :columns="3"
  :gutter="12"
  :items="items"
  @layout-change="(p) => console.log(p)"
/>
        `,
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

/** Image gallery — a typical real-world masonry use-case. */
export const ImageGallery: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A typical Pinterest-style image gallery rendered with mixed-height cards. ' +
          'Set `fresh` to true if your media loads asynchronously.',
      },
      source: {
        code: `
<BMasonry :columns="{ xs: 1, sm: 2, md: 3 }" :gutter="12" :items="photos" fresh>
  <template #item="{ item }">
    <figure>
      <img :src="item.data.src" :alt="item.data.alt" />
      <figcaption>{{ item.data.caption }}</figcaption>
    </figure>
  </template>
</BMasonry>
        `,
      },
    },
  },
  render: () => ({
    components: { BMasonry },
    setup() {
      const photos: BMasonryItem[] = Array.from({ length: 9 }, (_, i) => ({
        key: i,
        height: 140 + ((i * 53) % 180),
        data: {
          color: COLORS[i % COLORS.length],
          caption: `Photo ${i + 1}`,
        },
      }));
      return { photos };
    },
    template: `
      <div style="padding: 24px; background: #fafafa; border-radius: 12px;">
        <BMasonry :columns="{ xs: 1, sm: 2, md: 3 }" :gutter="12" :items="photos">
          <template #item="{ item }">
            <figure
              style="margin:0;border-radius:8px;overflow:hidden;background:#fff;box-shadow:0 1px 3px oklch(0% 0 0 / 0.08);"
            >
              <div :style="{
                background: item.data.color,
                height: item.height + 'px',
              }" />
              <figcaption style="padding:8px 12px;font-size:12px;color:#595959;">
                {{ item.data.caption }}
              </figcaption>
            </figure>
          </template>
        </BMasonry>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * Root carries `role="list"`, columns carry `role="presentation"`, and each
 * item wrapper carries `role="listitem"`. Item content remains focusable.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Verify ARIA roles: the root carries <code>role="list"</code>, columns carry <code>role="presentation"</code>, ' +
          'and each item carries <code>role="listitem"</code>. Tab through items to confirm focusability of inner content.',
      },
      source: {
        code: `
<BMasonry :columns="2" :gutter="16" :items="items">
  <template #item="{ item }">
    <div role="img" tabindex="0" :aria-label="item.data.label">
      {{ item.data.label }}
    </div>
  </template>
</BMasonry>
        `,
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

    // data-masonry-key set on each listitem
    const withKey = canvasElement.querySelectorAll('[data-masonry-key]');
    expect(withKey.length).toBe(4);

    // CSS vars injected on root
    const rootStyle = (list as HTMLElement)?.getAttribute('style') ?? '';
    expect(rootStyle).toContain('--b-masonry-columns');
    expect(rootStyle).toContain('--b-masonry-col-gap');
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override `--b-masonry-item-border-radius`, `--b-masonry-item-transition-duration`,
 * and `--b-masonry-item-bg` on the component (or any ancestor) to retheme.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override the scoped CSS variables on <code>.b-masonry</code> to customise the layout. ' +
          'This story overrides <code>--b-masonry-item-border-radius</code>, <code>--b-masonry-item-transition-duration</code>, ' +
          'and <code>--b-masonry-item-bg</code>.',
      },
      source: {
        code: `
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
/>
        `,
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
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  // BMasonry has no AntD equivalent — all tokens are local extras.
  {
    token: '--b-masonry-columns',
    defaultValue: '3',
    description: 'Number of columns (also driven by the `columns` prop).',
  },
  {
    token: '--b-masonry-col-gap',
    defaultValue: '1rem',
    description: 'Horizontal gap between columns.',
  },
  {
    token: '--b-masonry-row-gap',
    defaultValue: '1rem',
    description: 'Vertical gap between items within a column.',
  },
  {
    token: '--b-masonry-item-bg',
    defaultValue: 'transparent',
    description: 'Background color of individual items.',
  },
  {
    token: '--b-masonry-item-border-radius',
    defaultValue: '0',
    description: 'Corner radius of individual items.',
  },
  {
    token: '--b-masonry-item-transition-duration',
    defaultValue: '300ms',
    description: 'Duration of item enter/move/leave transitions.',
  },
  {
    token: '--b-masonry-item-transition-timing',
    defaultValue: 'cubic-bezier(0.4, 0, 0.2, 1)',
    description: 'Easing curve of item transitions.',
  },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Reference table of every <code>--b-masonry-*</code> CSS custom property ' +
          'consumers can override to retheme the component. ' +
          'BMasonry has no AntD equivalent; all tokens are local.',
      },
    },
  },
  render: () => ({
    components: { BMasonry },
    setup() {
      const items = Array.from({ length: 6 }).map((_, i) => ({
        key: String(i + 1),
        height: 60 + ((i * 23) % 80),
      }));
      return { tokens: DESIGN_TOKENS, items };
    },
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BMasonry — Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          All tokens scoped to <code>.b-masonry</code>. Override inline or via a CSS class.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:oklch(96% 0.002 260);">
              <th style="text-align:left;padding:10px 12px;border-bottom:1px solid oklch(85% 0.005 260);">CSS Variable</th>
              <th style="text-align:left;padding:10px 12px;border-bottom:1px solid oklch(85% 0.005 260);">Default</th>
              <th style="text-align:left;padding:10px 12px;border-bottom:1px solid oklch(85% 0.005 260);">Description</th>
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

        <h3 style="margin:32px 0 12px;">Override example</h3>
        <p style="margin:0 0 12px;color:#595959;font-size:13px;">
          Two tokens overridden inline (item bg, border radius).
        </p>
        <BMasonry
          :columns="3"
          :gutter="16"
          :items="items"
          style="
            --b-masonry-item-bg: oklch(96% 0.04 290);
            --b-masonry-item-border-radius: 12px;
          "
        >
          <template #item="{ item }">
            <div :style="{ height: item.height + 'px', padding: '12px', color: 'oklch(35% 0.18 290)' }">
              Item {{ item.key }}
            </div>
          </template>
        </BMasonry>
      </div>
    `,
  }),
};
