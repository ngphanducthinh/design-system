import { BPagination } from '@/components';
import type { BPaginationAlign, BPaginationSize } from '@/components/BPagination/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ref } from 'vue';

const meta = {
  title: 'Navigation/Pagination',
  component: BPagination,
  tags: ['autodocs'],
  argTypes: {
    current: {
      control: 'number',
      description: 'Current page number (v-model:current).',
      table: { category: 'Two-Way Binding Props' },
    },
    pageSize: {
      control: 'number',
      description: 'Items per page (v-model:pageSize).',
      table: { category: 'Two-Way Binding Props' },
    },
    total: {
      control: 'number',
      description: 'Total number of data items.',
      table: { category: 'Props', defaultValue: { summary: '0' } },
    },
    defaultCurrent: {
      control: 'number',
      description: 'Initial page number (uncontrolled).',
      table: { category: 'Props', defaultValue: { summary: '1' } },
    },
    defaultPageSize: {
      control: 'number',
      description: 'Initial items per page (uncontrolled).',
      table: { category: 'Props', defaultValue: { summary: '10' } },
    },
    pageSizeOptions: {
      control: 'object',
      description: 'Available page size options.',
      table: { category: 'Props', defaultValue: { summary: '[10, 20, 50, 100]' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable pagination.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    hideOnSinglePage: {
      control: 'boolean',
      description: 'Hide when only one page.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    showLessItems: {
      control: 'boolean',
      description: 'Show fewer page items in the rail.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    showQuickJumper: {
      control: 'boolean',
      description: 'Show quick jumper input.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    showSizeChanger: {
      control: 'boolean',
      description: 'Show page size selector.',
      table: { category: 'Props' },
    },
    showTitle: {
      control: 'boolean',
      description: 'Display title attribute on page items.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    simple: {
      control: 'boolean',
      description: 'Simple-mode pagination (page input + total).',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    size: {
      control: 'select',
      options: ['small', 'default', 'large'] satisfies BPaginationSize[],
      description: 'Pagination size preset.',
      table: { category: 'Props', defaultValue: { summary: 'default' } },
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'] satisfies BPaginationAlign[],
      description: 'Alignment within the container.',
      table: { category: 'Props', defaultValue: { summary: 'start' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BPagination</code> component enables navigation through pages of content.<br><br>' +
          'Supports <strong>controlled</strong> (v-model:current, v-model:pageSize) and <strong>uncontrolled</strong> modes, ' +
          '<strong>simple</strong> mode, size changer, quick jumper, and three size variants.<br>' +
          'Keyboard: <kbd>Tab</kbd> moves between controls, <kbd>Enter</kbd>/<kbd>Space</kbd> activates buttons.',
      },
    },
  },
} satisfies Meta<typeof BPagination>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** The default pagination — 100 items, 10 per page. */
export const Default: Story = {
  args: {
    total: 100,
    defaultCurrent: 1,
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    disabled: false,
    hideOnSinglePage: false,
    showLessItems: false,
    showQuickJumper: false,
    showSizeChanger: false,
    showTitle: true,
    simple: false,
    size: 'default',
    align: 'start',
  },
  parameters: {
    docs: {
      source: {
        code: `<BPagination :total="100" v-model:current="page" />`,
      },
    },
  },
  render: (args) => ({
    components: { BPagination },
    setup() {
      const page = ref(args.current ?? args.defaultCurrent ?? 1);
      const ps = ref(args.pageSize ?? args.defaultPageSize ?? 10);
      return { args, page, ps };
    },
    template: `
      <div>
        <BPagination data-testid="default" v-bind="args" v-model:current="page" v-model:pageSize="ps" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('default');
    expect(el.getAttribute('role')).toBe('navigation');
    expect(el.getAttribute('aria-label')).toBe('Pagination');
    const active = el.querySelector('.b-pagination__page--active');
    expect(active?.textContent?.trim()).toBe('1');
  },
};

/** Three size variants — small, default, and large. */
export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BPagination :total="100" size="small" />
<BPagination :total="100" />
<BPagination :total="100" size="large" />
        `,
      },
    },
  },
  render: () => ({
    components: { BPagination },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <p style="font-size:12px;color:#666;margin:0 0 4px;">Small</p>
          <BPagination data-testid="size-small" :total="100" size="small" :default-current="1" aria-label="Small pagination" />
        </div>
        <div>
          <p style="font-size:12px;color:#666;margin:0 0 4px;">Default</p>
          <BPagination data-testid="size-default" :total="100" :default-current="1" aria-label="Default pagination" />
        </div>
        <div>
          <p style="font-size:12px;color:#666;margin:0 0 4px;">Large</p>
          <BPagination data-testid="size-large" :total="100" size="large" :default-current="1" aria-label="Large pagination" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByTestId('size-small').classList.contains('b-pagination--small')).toBe(true);
    expect(canvas.getByTestId('size-default').classList.contains('b-pagination--small')).toBe(false);
    expect(canvas.getByTestId('size-large').classList.contains('b-pagination--large')).toBe(true);
  },
};

/** Three alignments — start, center, end. */
export const Alignment: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BPagination :total="100" align="start" />
<BPagination :total="100" align="center" />
<BPagination :total="100" align="end" />
        `,
      },
    },
  },
  render: () => ({
    components: { BPagination },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <p style="font-size:12px;color:#666;margin:0 0 4px;">Start (default)</p>
          <BPagination data-testid="align-start" :total="100" align="start" :default-current="1" aria-label="Start aligned pagination" />
        </div>
        <div>
          <p style="font-size:12px;color:#666;margin:0 0 4px;">Center</p>
          <BPagination data-testid="align-center" :total="100" align="center" :default-current="1" aria-label="Center aligned pagination" />
        </div>
        <div>
          <p style="font-size:12px;color:#666;margin:0 0 4px;">End</p>
          <BPagination data-testid="align-end" :total="100" align="end" :default-current="1" aria-label="End aligned pagination" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByTestId('align-start').classList.contains('b-pagination--align-start')).toBe(true);
    expect(canvas.getByTestId('align-center').classList.contains('b-pagination--align-center')).toBe(true);
    expect(canvas.getByTestId('align-end').classList.contains('b-pagination--align-end')).toBe(true);
  },
};

/** When the page count is high, ellipses appear on either side of the current page. */
export const MorePages: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BPagination :total="500" :default-current="10" />`,
      },
    },
  },
  render: () => ({
    components: { BPagination },
    setup: () => ({ page: ref(10) }),
    template: `
      <BPagination data-testid="more-pages" :total="500" v-model:current="page" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('more-pages');
    const ellipses = el.querySelectorAll('.b-pagination__ellipsis');
    expect(ellipses.length).toBe(2);
  },
};

/** Disabled pagination — buttons are non-interactive. */
export const Disabled: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BPagination :total="100" disabled />`,
      },
    },
  },
  render: () => ({
    components: { BPagination },
    template: `
      <BPagination data-testid="disabled" :total="100" disabled :default-current="3" show-size-changer show-quick-jumper />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('disabled');
    expect(el.classList.contains('b-pagination--disabled')).toBe(true);
    const buttons = el.querySelectorAll('button');
    buttons.forEach((btn) => {
      expect(btn.disabled).toBe(true);
    });
  },
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Compact `simple` mode — a tiny input + total, ideal for cramped UIs. */
export const SimpleMode: Story = {
  parameters: {
    docs: {
      description: {
        story: '`simple` shows an editable page input. `simple: { readOnly: true }` makes it static.',
      },
      source: {
        code: `<BPagination :total="100" simple />`,
      },
    },
  },
  render: () => ({
    components: { BPagination },
    setup: () => ({ page: ref(3) }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <p style="font-size:12px;color:#666;margin:0 0 4px;">Simple (editable)</p>
          <BPagination data-testid="simple" :total="100" simple v-model:current="page" aria-label="Simple pagination" />
        </div>
        <div>
          <p style="font-size:12px;color:#666;margin:0 0 4px;">Simple (read-only)</p>
          <BPagination data-testid="simple-ro" :total="100" :simple="{ readOnly: true }" :default-current="5" aria-label="Read-only simple pagination" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const simple = canvas.getByTestId('simple');
    expect(simple.classList.contains('b-pagination--simple')).toBe(true);
    expect(simple.querySelector('.b-pagination__simple-input')).not.toBeNull();

    const ro = canvas.getByTestId('simple-ro');
    expect(ro.querySelector('.b-pagination__simple-input')).toBeNull();
    expect(ro.querySelector('.b-pagination__simple-current')).not.toBeNull();
  },
};

/** Pagination with size changer and quick jumper enabled. */
export const WithControls: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BPagination :total="500" show-size-changer show-quick-jumper />`,
      },
    },
  },
  render: () => ({
    components: { BPagination },
    setup() {
      const page = ref(1);
      const ps = ref(10);
      return { page, ps };
    },
    template: `
      <BPagination
        data-testid="with-controls"
        :total="500"
        show-size-changer
        show-quick-jumper
        v-model:current="page"
        v-model:pageSize="ps"
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('with-controls');
    expect(el.querySelector('.b-pagination__size-changer')).not.toBeNull();
    expect(el.querySelector('.b-pagination__quick-jumper')).not.toBeNull();
    expect(el.querySelector('.b-pagination__jumper-input')).not.toBeNull();
  },
};

/** Render a "1-10 of 85 items" range via the `show-total` prop. */
export const ShowTotal: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BPagination
  :total="85"
  :show-total="(total, range) => \`\${range[0]}-\${range[1]} of \${total} items\`"
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BPagination },
    setup() {
      const page = ref(1);
      const showTotal = (total: number, range: [number, number]) =>
        `${range[0]}-${range[1]} of ${total} items`;
      return { page, showTotal };
    },
    template: `
      <BPagination data-testid="show-total" :total="85" :show-total="showTotal" v-model:current="page" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('show-total');
    const totalEl = el.querySelector('.b-pagination__total');
    expect(totalEl?.textContent).toBe('1-10 of 85 items');
  },
};

/** Click prev/next to navigate; the active page indicator updates. */
export const NavigationFlow: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Automated test of click-to-navigate and prev/next behavior.',
      },
      source: {
        code: `<BPagination :total="200" v-model:current="page" />`,
      },
    },
  },
  render: () => ({
    components: { BPagination },
    setup() {
      const page = ref(1);
      return { page };
    },
    template: `
      <div>
        <BPagination data-testid="nav" :total="200" v-model:current="page" />
        <p style="margin-top: 0.75rem; font-size: 13px; color: #666;">Page: <strong>{{ page }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('nav');

    expect(el.querySelector('.b-pagination__page--active')?.textContent?.trim()).toBe('1');

    const nextBtn = el.querySelector('.b-pagination__next') as HTMLElement;
    await userEvent.click(nextBtn);
    expect(el.querySelector('.b-pagination__page--active')?.textContent?.trim()).toBe('2');

    await userEvent.click(nextBtn);
    expect(el.querySelector('.b-pagination__page--active')?.textContent?.trim()).toBe('3');

    const prevBtn = el.querySelector('.b-pagination__prev') as HTMLElement;
    await userEvent.click(prevBtn);
    expect(el.querySelector('.b-pagination__page--active')?.textContent?.trim()).toBe('2');
  },
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * BPagination renders as `<nav role="navigation" aria-label="Pagination">`. The active
 * page carries `aria-current="page"`. Disabled pagination sets `aria-disabled` on prev/next.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Verifies <code>role="navigation"</code>, <code>aria-label</code>, <code>aria-current="page"</code>, and per-button <code>aria-label</code>.',
      },
      source: {
        code: `<BPagination :total="200" v-model:current="page" aria-label="Main pagination" />`,
      },
    },
  },
  render: () => ({
    components: { BPagination },
    setup: () => ({ page: ref(3) }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <BPagination data-testid="a11y-basic" :total="200" v-model:current="page" aria-label="Main pagination" />
        <BPagination data-testid="a11y-disabled" :total="100" disabled :default-current="1" aria-label="Disabled pagination" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const basic = canvas.getByTestId('a11y-basic');
    expect(basic.getAttribute('role')).toBe('navigation');
    expect(basic.getAttribute('aria-label')).toBe('Main pagination');

    const active = basic.querySelector('.b-pagination__page--active');
    expect(active?.getAttribute('aria-current')).toBe('page');
    expect(active?.textContent?.trim()).toBe('3');

    const pages = basic.querySelectorAll('.b-pagination__page');
    expect(pages[0].getAttribute('aria-label')).toBe('Page 1');

    expect(basic.querySelector('.b-pagination__prev')?.getAttribute('aria-label')).toBe('Previous Page');
    expect(basic.querySelector('.b-pagination__next')?.getAttribute('aria-label')).toBe('Next Page');

    const disabled = canvas.getByTestId('a11y-disabled');
    expect(disabled.classList.contains('b-pagination--disabled')).toBe(true);
    expect(disabled.querySelector('.b-pagination__prev')?.getAttribute('aria-disabled')).toBe('true');
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override `--b-pagination-item-active-color`, `--b-pagination-item-active-border-color`,
 * and `--b-pagination-item-bg` (plus extras) to retheme the pagination.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-pagination-item-active-color</code>, <code>--b-pagination-item-active-border-color</code>, <code>--b-pagination-item-bg</code>, and <code>--b-pagination-item-border-radius</code> on the component (or any ancestor) to retheme.',
      },
      source: {
        code: `
<BPagination
  :total="200"
  style="
    --b-pagination-item-active-color: oklch(35% 0.18 290);
    --b-pagination-item-active-border-color: oklch(35% 0.18 290);
    --b-pagination-item-bg: oklch(97% 0.03 290);
    --b-pagination-item-border-radius: 50%;
  "
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BPagination },
    template: `
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <div>
          <p style="font-size:12px;color:#666;margin:0 0 4px;">Default theme</p>
          <BPagination :total="200" :default-current="5" aria-label="Default theme pagination" />
        </div>
        <div>
          <p style="font-size:12px;color:#666;margin:0 0 4px;">Purple theme</p>
          <BPagination
            :total="200"
            :default-current="5"
            aria-label="Purple theme pagination"
            style="--b-pagination-item-active-color:#4c1d95;--b-pagination-item-active-border-color:#4c1d95;--b-pagination-item-active-color-hover:#6d28d9;--b-pagination-item-active-border-color-hover:#6d28d9;--b-pagination-focus-ring:0 0 0 2px rgba(114,46,209,0.2);"
          />
        </div>
        <div>
          <p style="font-size:12px;color:#666;margin:0 0 4px;">Rounded pill + green theme</p>
          <BPagination
            :total="200"
            :default-current="5"
            aria-label="Green theme pagination"
            style="--b-pagination-item-active-color:#166534;--b-pagination-item-active-border-color:#166534;--b-pagination-item-border-radius:50%;--b-pagination-item-bg:#f0fdf4;"
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
  { token: '--b-pagination-item-bg', defaultValue: '#ffffff', description: 'Background color of page items.' },
  { token: '--b-pagination-item-bg-hover', defaultValue: 'rgba(0, 0, 0, 0.04)', description: 'Hover background of page items.' },
  { token: '--b-pagination-item-size', defaultValue: '32px', description: 'Height and min-width of page items.' },
  { token: '--b-pagination-item-size-sm', defaultValue: '24px', description: 'Item size in small mode.' },
  { token: '--b-pagination-item-size-lg', defaultValue: '40px', description: 'Item size in large mode.' },
  { token: '--b-pagination-item-border-radius', defaultValue: '6px', description: 'Border radius of page items.' },
  { token: '--b-pagination-item-font-size', defaultValue: '14px', description: 'Font size of page items.' },
  { token: '--b-pagination-item-active-bg', defaultValue: '#ffffff', description: 'Background of active page item.' },
  { token: '--b-pagination-item-active-color', defaultValue: '#0958d9', description: 'Text color of active page item.' },
  { token: '--b-pagination-item-active-border-color', defaultValue: '#0958d9', description: 'Border color of active page item.' },
  { token: '--b-pagination-item-active-color-hover', defaultValue: '#1677ff', description: 'Hover text color of active item.' },
  { token: '--b-pagination-item-active-border-color-hover', defaultValue: '#1677ff', description: 'Hover border color of active item.' },
  { token: '--b-pagination-item-active-bg-disabled', defaultValue: 'rgba(0, 0, 0, 0.15)', description: 'Active item background when disabled.' },
  { token: '--b-pagination-item-active-color-disabled', defaultValue: 'rgba(0, 0, 0, 0.25)', description: 'Active item color when disabled.' },
  { token: '--b-pagination-item-color-disabled', defaultValue: 'rgba(0, 0, 0, 0.25)', description: 'Item color when disabled.' },
  { token: '--b-pagination-item-input-bg', defaultValue: '#ffffff', description: 'Background of input elements.' },
  { token: '--b-pagination-item-link-bg', defaultValue: '#ffffff', description: 'Background of prev/next buttons.' },
  { token: '--b-pagination-gap', defaultValue: '8px', description: 'Gap between pagination items.' },
  { token: '--b-pagination-color', defaultValue: 'rgba(0, 0, 0, 0.88)', description: 'Default text color.' },
  { token: '--b-pagination-font-family', defaultValue: 'inherit', description: 'Font family.' },
  { token: '--b-pagination-mini-options-size-changer-top', defaultValue: '0px', description: 'Vertical offset of size changer.' },
  { token: '--b-pagination-focus-ring', defaultValue: '0 0 0 2px rgba(22, 119, 255, 0.2)', description: 'Focus ring box-shadow.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'All scoped CSS variables exposed by <code>BPagination</code>. Override on the component root or any ancestor.',
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
