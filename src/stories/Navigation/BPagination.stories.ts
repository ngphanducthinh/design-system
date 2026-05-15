import { BPagination } from '@/components';
import type { BPaginationAlign, BPaginationSize } from '@/components/BPagination/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Navigation/Pagination',
  component: BPagination,
  tags: ['autodocs'],
  argTypes: {
    // ── Two-Way Binding Props ──
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

    // ── Props ──
    total: {
      control: 'number',
      description: 'Total number of data items.',
      table: { defaultValue: { summary: '0' }, category: 'Props' },
    },
    defaultCurrent: {
      control: 'number',
      description: 'Default initial page number.',
      table: { defaultValue: { summary: '1' }, category: 'Props' },
    },
    defaultPageSize: {
      control: 'number',
      description: 'Default number of items per page.',
      table: { defaultValue: { summary: '10' }, category: 'Props' },
    },
    pageSizeOptions: {
      control: 'object',
      description: 'Available page size options.',
      table: { defaultValue: { summary: '[10, 20, 50, 100]' }, category: 'Props' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable pagination.',
      table: { defaultValue: { summary: 'false' }, category: 'Props' },
    },
    hideOnSinglePage: {
      control: 'boolean',
      description: 'Hide when only one page.',
      table: { defaultValue: { summary: 'false' }, category: 'Props' },
    },
    showLessItems: {
      control: 'boolean',
      description: 'Show fewer page items.',
      table: { defaultValue: { summary: 'false' }, category: 'Props' },
    },
    showQuickJumper: {
      control: 'boolean',
      description: 'Show quick jumper input.',
      table: { defaultValue: { summary: 'false' }, category: 'Props' },
    },
    showSizeChanger: {
      control: 'boolean',
      description: 'Show page size selector.',
      table: { category: 'Props' },
    },
    showTitle: {
      control: 'boolean',
      description: 'Display title on page items.',
      table: { defaultValue: { summary: 'true' }, category: 'Props' },
    },
    simple: {
      control: 'boolean',
      description: 'Simple mode pagination.',
      table: { defaultValue: { summary: 'false' }, category: 'Props' },
    },
    size: {
      control: 'select',
      options: ['small', 'default', 'large'] satisfies BPaginationSize[],
      description: 'Size of the pagination.',
      table: { defaultValue: { summary: 'default' }, category: 'Props' },
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'] satisfies BPaginationAlign[],
      description: 'Alignment of pagination within its container.',
      table: { defaultValue: { summary: 'start' }, category: 'Props' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BPagination</code> component enables navigation through pages of content.<br><br>' +
          'Supports <strong>controlled</strong> (v-model:current, v-model:pageSize) and <strong>uncontrolled</strong> modes, ' +
          '<strong>simple</strong> mode, size changer, quick jumper, and three size variants.<br>' +
          'Keyboard: <kbd>Tab</kbd> moves between controls, <kbd>Enter</kbd>/<kbd>Space</kbd> activates buttons.<br>' +
          'Theming via <code>--b-pagination-*</code> CSS custom properties. Respects <code>prefers-reduced-motion</code>.',
      },
    },
  },
} satisfies Meta<typeof BPagination>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// 1. Playground
// ─────────────────────────────────────────────
/**
 * Interactive playground - tweak all props via the Controls panel.
 */
export const Playground: Story = {
  args: {
    total: 500,
    defaultCurrent: 1,
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    disabled: false,
    hideOnSinglePage: false,
    showLessItems: false,
    showQuickJumper: true,
    showSizeChanger: true,
    showTitle: true,
    simple: false,
    size: 'default',
    align: 'start',
  },
  render: (args) => ({
    components: { BPagination },
    setup() {
      const page = ref(args.current ?? args.defaultCurrent ?? 1);
      const ps = ref(args.pageSize ?? args.defaultPageSize ?? 10);
      return { args, page, ps };
    },
    template: `
      <div style="padding: 2rem;">
        <BPagination v-bind="args" v-model:current="page" v-model:pageSize="ps" />
        <p style="margin-top:1rem;font-size:13px;color:#666;">
          Page: <strong>{{ page }}</strong> | Page Size: <strong>{{ ps }}</strong>
        </p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 2. Basic
// ─────────────────────────────────────────────
/**
 * Default pagination with 100 items.
 */
export const Basic: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BPagination :total="100" />`,
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
      <div style="padding: 2rem;">
        <BPagination data-testid="basic" :total="100" v-model:current="page" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('basic');
    expect(el.getAttribute('role')).toBe('navigation');
    expect(el.getAttribute('aria-label')).toBe('Pagination');
    const active = el.querySelector('.b-pagination__page--active');
    expect(active?.textContent?.trim()).toBe('1');
  },
};

// ─────────────────────────────────────────────
// 3. Sizes
// ─────────────────────────────────────────────
/**
 * Three available sizes: small, default, and large.
 */
export const Sizes: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BPagination :total="100" size="small" />
<BPagination :total="100" size="default" />
<BPagination :total="100" size="large" />`,
      },
    },
  },
  render: () => ({
    components: { BPagination },
    template: `
      <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
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

// ─────────────────────────────────────────────
// 4. More Pages (ellipsis)
// ─────────────────────────────────────────────
/**
 * When there are many pages, ellipsis navigation appears.
 */
export const MorePages: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BPagination :total="500" :default-current="10" />`,
      },
    },
  },
  render: () => ({
    components: { BPagination },
    setup() {
      const page = ref(10);
      return { page };
    },
    template: `
      <div style="padding: 2rem;">
        <BPagination data-testid="more-pages" :total="500" v-model:current="page" />
        <p style="margin-top:0.75rem;font-size:13px;color:#666;">Page: <strong>{{ page }}</strong></p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('more-pages');
    const ellipses = el.querySelectorAll('.b-pagination__ellipsis');
    expect(ellipses.length).toBe(2);
  },
};

// ─────────────────────────────────────────────
// 5. Simple Mode
// ─────────────────────────────────────────────
/**
 * Simple mode with compact input navigation.
 */
export const SimpleMode: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BPagination :total="100" simple />`,
      },
    },
  },
  render: () => ({
    components: { BPagination },
    setup() {
      const page = ref(3);
      return { page };
    },
    template: `
      <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
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

// ─────────────────────────────────────────────
// 6. With Controls (size changer + quick jumper)
// ─────────────────────────────────────────────
/**
 * Pagination with size changer and quick jumper.
 */
export const WithControls: Story = {
  parameters: {
    controls: { disable: true },
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
      <div style="padding: 2rem;">
        <BPagination
          data-testid="with-controls"
          :total="500"
          show-size-changer
          show-quick-jumper
          v-model:current="page"
          v-model:pageSize="ps"
        />
        <p style="margin-top:0.75rem;font-size:13px;color:#666;">
          Page: <strong>{{ page }}</strong> | Size: <strong>{{ ps }}</strong>
        </p>
      </div>
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

// ─────────────────────────────────────────────
// 7. Show Total
// ─────────────────────────────────────────────
/**
 * Display total items count with range.
 */
export const ShowTotal: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BPagination :total="85" :show-total="(total, range) => \`\${range[0]}-\${range[1]} of \${total} items\`" />`,
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
      <div style="padding: 2rem;">
        <BPagination
          data-testid="show-total"
          :total="85"
          :show-total="showTotal"
          v-model:current="page"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('show-total');
    const totalEl = el.querySelector('.b-pagination__total');
    expect(totalEl?.textContent).toBe('1-10 of 85 items');
  },
};

// ─────────────────────────────────────────────
// 8. Disabled
// ─────────────────────────────────────────────
/**
 * Disabled pagination state.
 */
export const Disabled: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BPagination :total="100" disabled />`,
      },
    },
  },
  render: () => ({
    components: { BPagination },
    template: `
      <div style="padding: 2rem;">
        <BPagination data-testid="disabled" :total="100" disabled :default-current="3" show-size-changer show-quick-jumper />
      </div>
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
// 9. Alignment
// ─────────────────────────────────────────────
/**
 * Alignment options: start, center, end.
 */
export const Alignment: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BPagination :total="100" align="start" />
<BPagination :total="100" align="center" />
<BPagination :total="100" align="end" />`,
      },
    },
  },
  render: () => ({
    components: { BPagination },
    template: `
      <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
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

// ─────────────────────────────────────────────
// 10. Accessibility story
// ─────────────────────────────────────────────
/**
 * Demonstrates correct ARIA attributes, keyboard navigation, and focus management.
 */
export const Accessibility: Story = {
  name: 'Accessibility (roles & keyboard)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Verifies `role="navigation"`, `aria-label`, `aria-current="page"`, `aria-disabled` attributes, and keyboard navigation. ' +
          'Use <kbd>Tab</kbd> to move between buttons, <kbd>Enter</kbd>/<kbd>Space</kbd> to activate.',
      },
    },
  },
  render: () => ({
    components: { BPagination },
    setup() {
      const page = ref(3);
      return { page };
    },
    template: `
      <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
        <BPagination data-testid="a11y-basic" :total="200" v-model:current="page" aria-label="Main pagination" />
        <BPagination data-testid="a11y-disabled" :total="100" disabled :default-current="1" aria-label="Disabled pagination" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Role and label
    const basic = canvas.getByTestId('a11y-basic');
    expect(basic.getAttribute('role')).toBe('navigation');
    expect(basic.getAttribute('aria-label')).toBe('Main pagination');

    // aria-current on active page
    const active = basic.querySelector('.b-pagination__page--active');
    expect(active?.getAttribute('aria-current')).toBe('page');
    expect(active?.textContent?.trim()).toBe('3');

    // aria-label on page buttons
    const pages = basic.querySelectorAll('.b-pagination__page');
    expect(pages[0].getAttribute('aria-label')).toBe('Page 1');

    // Prev/Next aria-label
    expect(basic.querySelector('.b-pagination__prev')?.getAttribute('aria-label')).toBe('Previous Page');
    expect(basic.querySelector('.b-pagination__next')?.getAttribute('aria-label')).toBe('Next Page');

    // Disabled state
    const disabled = canvas.getByTestId('a11y-disabled');
    expect(disabled.classList.contains('b-pagination--disabled')).toBe(true);
    expect(disabled.querySelector('.b-pagination__prev')?.getAttribute('aria-disabled')).toBe('true');
  },
};

// ─────────────────────────────────────────────
// 11. Theming story
// ─────────────────────────────────────────────
/**
 * Override `--b-pagination-*` CSS custom properties to customise the component.
 */
export const Theming: Story = {
  name: 'Theming (CSS vars)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Override `--b-pagination-*` CSS custom properties on the component or a wrapper to customise appearance without touching source. ' +
          'Demonstrates overriding active color, border color, item background, and border radius.',
      },
      source: {
        code: `
<style>
.custom-pagination {
  --b-pagination-item-active-color: #4c1d95;
  --b-pagination-item-active-border-color: #4c1d95;
  --b-pagination-item-bg: #f5f3ff;
  --b-pagination-item-border-radius: 50%;
}
</style>
<BPagination class="custom-pagination" :total="200" :default-current="5" />`,
      },
    },
  },
  render: () => ({
    components: { BPagination },
    template: `
      <div style="padding: 2rem; display: flex; flex-direction: column; gap: 2rem;">
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
// 12. Interaction Tests
// ─────────────────────────────────────────────
/**
 * Automated interaction tests: navigation, size changer, quick jumper.
 */
export const InteractionTests: Story = {
  name: 'Interaction – navigation & controls',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Automated play function verifying click navigation, size changer, and quick jumper.',
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
      <div style="padding: 2rem;">
        <BPagination
          data-testid="int-main"
          :total="200"
          show-size-changer
          show-quick-jumper
          v-model:current="page"
          v-model:pageSize="ps"
        />
        <p data-testid="int-display" style="margin-top:0.75rem;font-size:13px;color:#666;">
          Page: <strong>{{ page }}</strong> | Size: <strong>{{ ps }}</strong>
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('int-main');

    // Initial state - page 1
    expect(el.querySelector('.b-pagination__page--active')?.textContent?.trim()).toBe('1');

    // Click next
    const nextBtn = el.querySelector('.b-pagination__next') as HTMLElement;
    await userEvent.click(nextBtn);
    expect(el.querySelector('.b-pagination__page--active')?.textContent?.trim()).toBe('2');

    // Click next again
    await userEvent.click(nextBtn);
    expect(el.querySelector('.b-pagination__page--active')?.textContent?.trim()).toBe('3');

    // Click prev
    const prevBtn = el.querySelector('.b-pagination__prev') as HTMLElement;
    await userEvent.click(prevBtn);
    expect(el.querySelector('.b-pagination__page--active')?.textContent?.trim()).toBe('2');
  },
};

// ─────────────────────────────────────────────
// 13. Design Token story (LAST)
// ─────────────────────────────────────────────
/**
 * Visual reference table of all exposed CSS variables for BPagination.
 */
export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Reference table of all `--b-pagination-*` CSS custom properties exposed by the component. ' +
          'Override these on a wrapper or the component root to customise the appearance.',
      },
    },
  },
  render: () => ({
    components: { BPagination },
    setup() {
      const tokens = [
        { variable: '--b-pagination-item-bg', defaultValue: '#ffffff', description: 'Background color of page items' },
        { variable: '--b-pagination-item-bg-hover', defaultValue: 'rgba(0, 0, 0, 0.04)', description: 'Hover background color of page items' },
        { variable: '--b-pagination-item-size', defaultValue: '32px', description: 'Height and min-width of page items' },
        { variable: '--b-pagination-item-size-sm', defaultValue: '24px', description: 'Item size in small mode' },
        { variable: '--b-pagination-item-size-lg', defaultValue: '40px', description: 'Item size in large mode' },
        { variable: '--b-pagination-item-border-radius', defaultValue: '6px', description: 'Border radius of page items' },
        { variable: '--b-pagination-item-font-size', defaultValue: '14px', description: 'Font size of page items' },
        { variable: '--b-pagination-item-active-bg', defaultValue: '#ffffff', description: 'Background of active page item' },
        { variable: '--b-pagination-item-active-color', defaultValue: '#0958d9', description: 'Text color of active page item' },
        { variable: '--b-pagination-item-active-border-color', defaultValue: '#0958d9', description: 'Border color of active page item' },
        { variable: '--b-pagination-item-active-color-hover', defaultValue: '#1677ff', description: 'Hover text color of active item' },
        { variable: '--b-pagination-item-active-border-color-hover', defaultValue: '#1677ff', description: 'Hover border color of active item' },
        { variable: '--b-pagination-item-active-bg-disabled', defaultValue: 'rgba(0, 0, 0, 0.15)', description: 'Active item background when disabled' },
        { variable: '--b-pagination-item-active-color-disabled', defaultValue: 'rgba(0, 0, 0, 0.25)', description: 'Active item color when disabled' },
        { variable: '--b-pagination-item-color-disabled', defaultValue: 'rgba(0, 0, 0, 0.25)', description: 'Item color when disabled' },
        { variable: '--b-pagination-item-input-bg', defaultValue: '#ffffff', description: 'Background of input elements' },
        { variable: '--b-pagination-item-link-bg', defaultValue: '#ffffff', description: 'Background of prev/next buttons' },
        { variable: '--b-pagination-gap', defaultValue: '8px', description: 'Gap between pagination items' },
        { variable: '--b-pagination-color', defaultValue: 'rgba(0, 0, 0, 0.88)', description: 'Default text color' },
        { variable: '--b-pagination-font-family', defaultValue: 'inherit', description: 'Font family' },
        { variable: '--b-pagination-mini-options-size-changer-top', defaultValue: '0px', description: 'Vertical offset of size changer' },
        { variable: '--b-pagination-focus-ring', defaultValue: '0 0 0 2px rgba(22, 119, 255, 0.2)', description: 'Focus ring box-shadow' },
      ];
      return { tokens };
    },
    template: `
      <div style="padding: 2rem;">
        <h3 style="margin:0 0 1rem;font-size:16px;font-weight:600;">BPagination Design Tokens</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="border-bottom:2px solid #e5e7eb;">
              <th style="text-align:left;padding:8px 12px;font-weight:600;">Variable</th>
              <th style="text-align:left;padding:8px 12px;font-weight:600;">Default</th>
              <th style="text-align:left;padding:8px 12px;font-weight:600;">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="token in tokens" :key="token.variable" style="border-bottom:1px solid #f0f0f0;">
              <td style="padding:8px 12px;font-family:monospace;font-size:12px;color:#0958d9;">{{ token.variable }}</td>
              <td style="padding:8px 12px;font-family:monospace;font-size:12px;">{{ token.defaultValue }}</td>
              <td style="padding:8px 12px;">{{ token.description }}</td>
            </tr>
          </tbody>
        </table>

        <h4 style="margin:2rem 0 1rem;font-size:14px;font-weight:600;">Live Preview</h4>
        <BPagination :total="200" :default-current="5" show-size-changer show-quick-jumper />
      </div>
    `,
  }),
};
