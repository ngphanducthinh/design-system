import { BMenu } from '@/components';
import type { BMenuItemUnion } from '@/components/BMenu/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

const meta = {
  title: 'Navigation/Menu',
  component: BMenu,
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: 'object',
      description: 'Menu items (with optional children, dividers, groups).',
      table: { category: 'Props' },
    },
    mode: {
      control: 'select',
      options: ['inline', 'vertical', 'horizontal'],
      description: 'Display mode.',
      table: { category: 'Props', defaultValue: { summary: 'inline' } },
    },
    theme: {
      control: 'select',
      options: ['light', 'dark'],
      description: 'Color theme.',
      table: { category: 'Props', defaultValue: { summary: 'light' } },
    },
    selectable: {
      control: 'boolean',
      description: 'Whether items can be selected.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    multiple: {
      control: 'boolean',
      description: 'Allow multiple items to be selected.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    inlineCollapsed: {
      control: 'boolean',
      description: 'Collapsed state in inline mode.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    inlineIndent: {
      control: 'number',
      description: 'Indent (px) per level for inline mode.',
      table: { category: 'Props', defaultValue: { summary: '24' } },
    },
    triggerSubMenuAction: {
      control: 'select',
      options: ['hover', 'click'],
      description: 'Action that triggers submenu open.',
      table: { category: 'Props', defaultValue: { summary: 'hover' } },
    },
    selectedKeys: {
      control: 'object',
      description: 'Currently selected keys.',
      table: { category: 'Two-Way Binding Props' },
    },
    openKeys: {
      control: 'object',
      description: 'Currently opened submenu keys.',
      table: { category: 'Two-Way Binding Props' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BMenu</code> component provides a navigation menu with support for inline, vertical, and horizontal modes. ' +
          'Supports nested submenus, item groups, dividers, and both controlled and uncontrolled patterns.<br><br>' +
          'Features: multi-level nesting, keyboard navigation, selection state, dark theme, collapsed mode.',
      },
    },
  },
} satisfies Meta<typeof BMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Sample data
// ─────────────────────────────────────────────
const basicItems: BMenuItemUnion[] = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'about', label: 'About', icon: '📖' },
  { key: 'contact', label: 'Contact', icon: '✉️' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

const nestedItems: BMenuItemUnion[] = [
  { key: 'home', label: 'Home', icon: '🏠' },
  {
    key: 'products',
    label: 'Products',
    icon: '📦',
    children: [
      { key: 'electronics', label: 'Electronics' },
      { key: 'clothing', label: 'Clothing' },
      {
        key: 'furniture',
        label: 'Furniture',
        children: [
          { key: 'tables', label: 'Tables' },
          { key: 'chairs', label: 'Chairs' },
        ],
      },
    ],
  },
  {
    key: 'services',
    label: 'Services',
    icon: '🔧',
    children: [
      { key: 'consulting', label: 'Consulting' },
      { key: 'development', label: 'Development' },
    ],
  },
  { key: 'contact', label: 'Contact', icon: '✉️' },
];

const groupedItems: BMenuItemUnion[] = [
  {
    type: 'group',
    key: 'general',
    label: 'General',
    children: [
      { key: 'dashboard', label: 'Dashboard', icon: '📊' },
      { key: 'analytics', label: 'Analytics', icon: '📈' },
    ],
  },
  { type: 'divider' },
  {
    type: 'group',
    key: 'settings',
    label: 'Settings',
    children: [
      { key: 'profile', label: 'Profile', icon: '👤' },
      { key: 'security', label: 'Security', icon: '🔒' },
      { key: 'notifications', label: 'Notifications', icon: '🔔' },
    ],
  },
];

const dangerItems: BMenuItemUnion[] = [
  { key: 'edit', label: 'Edit', icon: '✏️' },
  { key: 'duplicate', label: 'Duplicate', icon: '📋' },
  { type: 'divider' },
  { key: 'delete', label: 'Delete', icon: '🗑️', danger: true },
];

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** Default — inline mode with nested submenus and a default selection. */
export const Default: Story = {
  args: {
    mode: 'inline',
    theme: 'light',
    selectable: true,
    multiple: false,
    inlineCollapsed: false,
    inlineIndent: 24,
    items: nestedItems,
  },
  parameters: {
    docs: {
      source: {
        code: `<BMenu :items="items" v-model:selectedKeys="selected" v-model:openKeys="open" />`,
      },
    },
  },
  render: (args) => ({
    components: { BMenu },
    setup: () => {
      const selected = ref<string[]>(['home']);
      const open = ref<string[]>(['products']);
      return { args, selected, open };
    },
    template: `
      <div style="width: 256px;">
        <BMenu
          v-bind="args"
          v-model:selected-keys="selected"
          v-model:open-keys="open"
        />
      </div>
    `,
  }),
};

/** Horizontal — top-bar style navigation. Submenus open below. */
export const Horizontal: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BMenu mode="horizontal" :items="items" />`,
      },
    },
  },
  render: () => ({
    components: { BMenu },
    setup: () => {
      const selected = ref<string[]>(['home']);
      return { items: nestedItems, selected };
    },
    template: `<BMenu mode="horizontal" :items="items" v-model:selected-keys="selected" />`,
  }),
};

/** Vertical — sidebar style without auto-collapsing levels. */
export const Vertical: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BMenu mode="vertical" :items="items" />`,
      },
    },
  },
  render: () => ({
    components: { BMenu },
    setup: () => {
      const selected = ref<string[]>(['home']);
      return { items: nestedItems, selected };
    },
    template: `
      <div style="width: 256px;">
        <BMenu mode="vertical" :items="items" v-model:selected-keys="selected" />
      </div>
    `,
  }),
};

/** Toggle the `inline-collapsed` prop to shrink the inline menu to icons. */
export const Collapsed: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BMenu mode="inline" :inline-collapsed="true" :items="items" />`,
      },
    },
  },
  render: () => ({
    components: { BMenu },
    setup: () => {
      const collapsed = ref(false);
      const selected = ref<string[]>(['home']);
      return { collapsed, selected, items: nestedItems };
    },
    template: `
      <div>
        <button @click="collapsed = !collapsed" style="margin-bottom: 16px; padding: 4px 12px; cursor: pointer;">
          {{ collapsed ? 'Expand' : 'Collapse' }}
        </button>
        <div :style="{ width: collapsed ? '80px' : '256px', transition: 'width 200ms' }">
          <BMenu mode="inline" :inline-collapsed="collapsed" :items="items" v-model:selected-keys="selected" />
        </div>
      </div>
    `,
  }),
};

/** When `multiple: true`, multiple items can be selected at once. */
export const MultipleSelection: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BMenu multiple :items="items" :default-selected-keys="['home', 'about']" />`,
      },
    },
  },
  render: () => ({
    components: { BMenu },
    setup: () => {
      const selected = ref<string[]>(['home', 'about']);
      return { items: basicItems, selected };
    },
    template: `
      <div style="width: 256px;">
        <BMenu multiple :items="items" v-model:selected-keys="selected" />
      </div>
    `,
  }),
};

/** Items can carry `disabled: true` — both leaf items and submenus. */
export const DisabledItems: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BMenu :items="[
  { key: 'active', label: 'Active' },
  { key: 'disabled', label: 'Disabled', disabled: true },
  { key: 'sub', label: 'Disabled SubMenu', disabled: true, children: [...] },
]" />
        `,
      },
    },
  },
  render: () => ({
    components: { BMenu },
    setup: () => ({
      items: [
        { key: 'active', label: 'Active Item' },
        { key: 'disabled1', label: 'Disabled Item', disabled: true },
        {
          key: 'sub-disabled',
          label: 'Disabled SubMenu',
          disabled: true,
          children: [{ key: 'child', label: 'Child' }],
        },
        { key: 'normal', label: 'Normal Item' },
      ] satisfies BMenuItemUnion[],
    }),
    template: `
      <div style="width: 256px;">
        <BMenu :items="items" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Settings-style navigation with grouped sections separated by a divider. */
export const ItemGroups: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BMenu :items="[
  { type: 'group', key: 'g1', label: 'General', children: [
    { key: 'dashboard', label: 'Dashboard' },
  ]},
  { type: 'divider' },
  { type: 'group', key: 'g2', label: 'Settings', children: [
    { key: 'profile', label: 'Profile' },
  ]},
]" />
        `,
      },
    },
  },
  render: () => ({
    components: { BMenu },
    setup: () => ({ items: groupedItems }),
    template: `
      <div style="width: 256px;">
        <BMenu :items="items" />
      </div>
    `,
  }),
};

/** Context-menu pattern with a destructive `danger: true` item at the bottom. */
export const DangerItems: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BMenu :items="[
  { key: 'edit', label: 'Edit' },
  { type: 'divider' },
  { key: 'delete', label: 'Delete', danger: true },
]" />
        `,
      },
    },
  },
  render: () => ({
    components: { BMenu },
    setup: () => ({ items: dangerItems }),
    template: `
      <div style="width: 256px;">
        <BMenu :items="items" />
      </div>
    `,
  }),
};

/** Click flow — open a submenu, select a leaf, observe the bound v-models. */
export const InteractionFlow: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Click `home`, open `products`, select `electronics` — both v-models update.',
      },
      source: {
        code: `<BMenu :items="items" v-model:selected-keys="selected" v-model:open-keys="open" />`,
      },
    },
  },
  render: () => ({
    components: { BMenu },
    setup: () => {
      const selected = ref<string[]>([]);
      const openKeys = ref<string[]>([]);
      return { items: nestedItems, selected, openKeys };
    },
    template: `
      <div style="width: 256px;">
        <BMenu :items="items" v-model:selected-keys="selected" v-model:open-keys="openKeys" />
        <p data-testid="selected">Selected: {{ selected.join(', ') }}</p>
        <p data-testid="open">Open: {{ openKeys.join(', ') }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByTestId('selected').textContent).toContain('Selected:');

    const homeItem = canvasElement.querySelector('[data-menu-key="home"]') as HTMLElement;
    expect(homeItem).toBeTruthy();
    await userEvent.click(homeItem);

    await waitFor(() => {
      expect(canvas.getByTestId('selected').textContent).toContain('home');
    });

    const productsTitle = canvasElement.querySelector(
      '[data-menu-key="products"] .b-menu-submenu__title',
    ) as HTMLElement;
    expect(productsTitle).toBeTruthy();
    await userEvent.click(productsTitle);

    await waitFor(() => {
      expect(canvas.getByTestId('open').textContent).toContain('products');
    });

    await waitFor(async () => {
      const electronicsItem = canvasElement.querySelector(
        '[data-menu-key="electronics"]',
      ) as HTMLElement;
      expect(electronicsItem).toBeTruthy();
      await userEvent.click(electronicsItem);
    });

    await waitFor(() => {
      expect(canvas.getByTestId('selected').textContent).toContain('electronics');
    });
  },
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * BMenu uses `role="menu"` with vertical orientation. Items use `role="menuitemradio"`
 * (selectable) and the selected item carries `aria-checked="true"`. Submenu titles
 * carry `aria-haspopup` and `aria-expanded`.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '<code>role="menu"</code>; selectable items use <code>role="menuitemradio"</code> with <code>aria-checked</code>; submenu titles use <code>aria-haspopup</code> and <code>aria-expanded</code>.',
      },
      source: {
        code: `<BMenu :items="items" :default-selected-keys="['home']" />`,
      },
    },
  },
  render: () => ({
    components: { BMenu },
    setup: () => ({ items: nestedItems }),
    template: `
      <div style="width: 256px;">
        <BMenu :items="items" :default-selected-keys="['home']" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const menu = canvasElement.querySelector('[role="menu"]');
    expect(menu).toBeTruthy();
    expect(menu?.getAttribute('aria-orientation')).toBe('vertical');

    const items = canvasElement.querySelectorAll('[role="menuitemradio"]');
    expect(items.length).toBeGreaterThan(0);

    const firstItem = items[0] as HTMLElement;
    expect(firstItem.getAttribute('tabindex')).toBe('0');

    const selectedItem = canvasElement.querySelector('[aria-checked="true"]');
    expect(selectedItem).toBeTruthy();

    const submenuTitle = canvasElement.querySelector('[aria-haspopup="true"]');
    expect(submenuTitle).toBeTruthy();
    expect(submenuTitle?.getAttribute('aria-expanded')).toBe('false');

    if (submenuTitle) {
      await userEvent.click(submenuTitle as HTMLElement);
      await waitFor(() => {
        expect(submenuTitle?.getAttribute('aria-expanded')).toBe('true');
      });
    }

    await waitFor(() => {
      const nestedMenus = canvasElement.querySelectorAll('[role="menu"]');
      expect(nestedMenus.length).toBeGreaterThan(1);
    });
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override `--b-menu-item-selected-bg`, `--b-menu-item-selected-color`, and
 * `--b-menu-item-hover-bg` (plus extras) to retheme menus.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-menu-item-selected-bg</code>, <code>--b-menu-item-selected-color</code>, and <code>--b-menu-item-hover-bg</code> on <code>.b-menu</code> (or via a wrapping selector).',
      },
      source: {
        code: `
<BMenu
  :items="items"
  style="
    --b-menu-item-selected-bg: oklch(95% 0.05 290);
    --b-menu-item-selected-color: oklch(50% 0.18 290);
    --b-menu-item-hover-bg: oklch(97% 0.03 290);
  "
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BMenu },
    setup: () => ({ items: basicItems }),
    template: `
      <div style="display: flex; gap: 40px; flex-wrap: wrap;">
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Default</p>
          <div style="width: 220px;">
            <BMenu :items="items" :default-selected-keys="['home']" />
          </div>
        </div>

        <div class="custom-menu-theme-1">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Purple accent</p>
          <div style="width: 220px;">
            <BMenu :items="items" :default-selected-keys="['home']" />
          </div>
        </div>

        <div class="custom-menu-theme-2">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Rounded &amp; warm</p>
          <div style="width: 220px;">
            <BMenu :items="items" :default-selected-keys="['home']" />
          </div>
        </div>

        <div class="custom-menu-theme-3">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Compact</p>
          <div style="width: 180px;">
            <BMenu :items="items" :default-selected-keys="['home']" />
          </div>
        </div>
      </div>

      <style>
        .custom-menu-theme-1 .b-menu {
          --b-menu-item-selected-bg: #f3e8ff;
          --b-menu-item-selected-color: #7c3aed;
          --b-menu-item-hover-bg: #faf5ff;
        }
        .custom-menu-theme-2 .b-menu {
          --b-menu-item-border-radius: 20px;
          --b-menu-item-selected-bg: #fff7ed;
          --b-menu-item-selected-color: #ea580c;
          --b-menu-item-hover-bg: #fffbeb;
        }
        .custom-menu-theme-3 .b-menu {
          --b-menu-item-height: 32px;
          --b-menu-item-border-radius: 4px;
          --b-menu-item-margin-block: 2px;
          --b-menu-item-padding-inline: 12px;
        }
      </style>
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  { token: '--b-menu-item-bg', defaultValue: '#ffffff', description: 'Menu item background.' },
  { token: '--b-menu-item-color', defaultValue: 'rgba(0,0,0,0.88)', description: 'Menu item text color.' },
  { token: '--b-menu-item-hover-bg', defaultValue: 'rgba(0,0,0,0.06)', description: 'Item background on hover.' },
  { token: '--b-menu-item-hover-color', defaultValue: 'rgba(0,0,0,0.88)', description: 'Item text color on hover.' },
  { token: '--b-menu-item-active-bg', defaultValue: '#e6f4ff', description: 'Item background when active.' },
  { token: '--b-menu-item-selected-bg', defaultValue: '#e6f4ff', description: 'Selected item background.' },
  { token: '--b-menu-item-selected-color', defaultValue: '#0958d9', description: 'Selected item text color.' },
  { token: '--b-menu-item-disabled-color', defaultValue: 'rgba(0,0,0,0.25)', description: 'Disabled item text color.' },
  { token: '--b-menu-item-height', defaultValue: '40px', description: 'Menu item height.' },
  { token: '--b-menu-item-border-radius', defaultValue: '8px', description: 'Menu item border radius.' },
  { token: '--b-menu-item-margin-block', defaultValue: '4px', description: 'Vertical margin between items.' },
  { token: '--b-menu-item-margin-inline', defaultValue: '4px', description: 'Horizontal margin of items.' },
  { token: '--b-menu-item-padding-inline', defaultValue: '16px', description: 'Horizontal padding inside items.' },
  { token: '--b-menu-icon-size', defaultValue: '14px', description: 'Icon size.' },
  { token: '--b-menu-icon-margin-inline-end', defaultValue: '10px', description: 'Spacing between icon and label.' },
  { token: '--b-menu-group-title-color', defaultValue: 'rgba(0,0,0,0.65)', description: 'Group title text color.' },
  { token: '--b-menu-group-title-font-size', defaultValue: '14px', description: 'Group title font size.' },
  { token: '--b-menu-group-title-line-height', defaultValue: '1.5714', description: 'Group title line height.' },
  { token: '--b-menu-danger-item-color', defaultValue: '#cf1322', description: 'Danger item text color.' },
  { token: '--b-menu-danger-item-hover-color', defaultValue: '#cf1322', description: 'Danger item hover color.' },
  { token: '--b-menu-danger-item-active-bg', defaultValue: '#fff2f0', description: 'Danger item active background.' },
  { token: '--b-menu-danger-item-selected-bg', defaultValue: '#fff2f0', description: 'Danger item selected background.' },
  { token: '--b-menu-danger-item-selected-color', defaultValue: '#cf1322', description: 'Danger item selected color.' },
  { token: '--b-menu-sub-menu-item-bg', defaultValue: 'rgba(0,0,0,0.02)', description: 'Submenu content background.' },
  { token: '--b-menu-sub-menu-item-border-radius', defaultValue: '4px', description: 'Submenu item border radius.' },
  { token: '--b-menu-sub-menu-item-selected-color', defaultValue: '#0958d9', description: 'Submenu title color when child selected.' },
  { token: '--b-menu-popup-bg', defaultValue: '#ffffff', description: 'Popup menu background.' },
  { token: '--b-menu-popup-shadow', defaultValue: '0 6px 16px ...', description: 'Popup box shadow.' },
  { token: '--b-menu-popup-border-radius', defaultValue: '8px', description: 'Popup border radius.' },
  { token: '--b-menu-popup-z-index', defaultValue: '1050', description: 'Popup z-index.' },
  { token: '--b-menu-dropdown-width', defaultValue: '160px', description: 'Popup menu min-width.' },
  { token: '--b-menu-collapsed-width', defaultValue: '80px', description: 'Menu width when collapsed.' },
  { token: '--b-menu-collapsed-icon-size', defaultValue: '16px', description: 'Icon size when collapsed.' },
  { token: '--b-menu-active-bar-height', defaultValue: '2px', description: 'Horizontal mode active indicator height.' },
  { token: '--b-menu-active-bar-width', defaultValue: '3px', description: 'Vertical mode active indicator width.' },
  { token: '--b-menu-horizontal-line-height', defaultValue: '46px', description: 'Horizontal menu item line height.' },
  { token: '--b-menu-horizontal-item-hover-bg', defaultValue: 'transparent', description: 'Horizontal item hover background.' },
  { token: '--b-menu-horizontal-item-hover-color', defaultValue: '#0958d9', description: 'Horizontal item hover color.' },
  { token: '--b-menu-horizontal-item-selected-bg', defaultValue: 'transparent', description: 'Horizontal item selected background.' },
  { token: '--b-menu-horizontal-item-selected-color', defaultValue: '#0958d9', description: 'Horizontal item selected color.' },
  { token: '--b-menu-horizontal-item-border-radius', defaultValue: '0', description: 'Horizontal item border radius.' },
  { token: '--b-menu-transition-duration', defaultValue: '200ms', description: 'Animation transition duration.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'All scoped CSS variables exposed by <code>BMenu</code>. Override on <code>.b-menu</code> or any ancestor selector.',
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
