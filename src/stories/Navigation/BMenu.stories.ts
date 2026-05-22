import { BMenu } from '@/components';
import type { BMenuItemUnion } from '@/components/BMenu/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Navigation/Menu',
  component: BMenu,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['inline', 'vertical', 'horizontal'],
      description: 'Menu display mode.',
      table: { defaultValue: { summary: 'inline' } },
    },
    theme: {
      control: 'select',
      options: ['light', 'dark'],
      description: 'Color theme.',
      table: { defaultValue: { summary: 'light' } },
    },
    selectable: {
      control: 'boolean',
      description: 'Whether items can be selected.',
      table: { defaultValue: { summary: 'true' } },
    },
    multiple: {
      control: 'boolean',
      description: 'Allow multiple items to be selected.',
      table: { defaultValue: { summary: 'false' } },
    },
    inlineCollapsed: {
      control: 'boolean',
      description: 'Collapsed state in inline mode.',
      table: { defaultValue: { summary: 'false' } },
    },
    inlineIndent: {
      control: 'number',
      description: 'Indent (px) per level for inline mode.',
      table: { defaultValue: { summary: '24' } },
    },
    triggerSubMenuAction: {
      control: 'select',
      options: ['hover', 'click'],
      description: 'Action to trigger submenu open.',
      table: { defaultValue: { summary: 'hover' } },
    },
    selectedKeys: {
      control: 'object',
      description: 'Currently selected keys (controlled).',
      table: { category: 'Two-Way Binding Props' },
    },
    openKeys: {
      control: 'object',
      description: 'Currently opened submenu keys (controlled).',
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

// ═════════════════════════════════════════════
//   STORIES
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 1. Playground
// ─────────────────────────────────────────────
export const Playground: Story = {
  args: {
    mode: 'inline',
    theme: 'light',
    selectable: true,
    multiple: false,
    inlineCollapsed: false,
    inlineIndent: 24,
    items: nestedItems,
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
      <p style="margin-top: 12px; font-size: 12px; color: #666;">
        Selected: {{ selected.join(', ') }} | Open: {{ open.join(', ') }}
      </p>
    `,
  }),
};

// ─────────────────────────────────────────────
// 2. Horizontal mode
// ─────────────────────────────────────────────
export const Horizontal: Story = {
  args: {
    mode: 'horizontal',
    items: nestedItems,
  },
  render: (args) => ({
    components: { BMenu },
    setup: () => {
      const selected = ref<string[]>(['home']);
      return { args, selected };
    },
    template: `
      <BMenu v-bind="args" v-model:selected-keys="selected" />
      <p style="margin-top: 12px; font-size: 12px; color: #666;">Selected: {{ selected.join(', ') }}</p>
    `,
  }),
};

// ─────────────────────────────────────────────
// 3. Vertical mode
// ─────────────────────────────────────────────
export const Vertical: Story = {
  args: {
    mode: 'vertical',
    items: nestedItems,
  },
  render: (args) => ({
    components: { BMenu },
    setup: () => {
      const selected = ref<string[]>(['home']);
      return { args, selected };
    },
    template: `
      <div style="width: 256px;">
        <BMenu v-bind="args" v-model:selected-keys="selected" />
      </div>
      <p style="margin-top: 12px; font-size: 12px; color: #666;">Selected: {{ selected.join(', ') }}</p>
    `,
  }),
};

// ─────────────────────────────────────────────
// 4. Collapsed mode
// ─────────────────────────────────────────────
export const Collapsed: Story = {
  render: () => ({
    components: { BMenu },
    setup: () => {
      const collapsed = ref(false);
      const selected = ref<string[]>(['home']);
      const items = nestedItems;
      return { collapsed, selected, items };
    },
    template: `
      <div>
        <button @click="collapsed = !collapsed" style="margin-bottom: 16px; padding: 4px 12px; cursor: pointer;">
          {{ collapsed ? 'Expand' : 'Collapse' }}
        </button>
        <div :style="{ width: collapsed ? '80px' : '256px', transition: 'width 200ms' }">
          <BMenu
            mode="inline"
            :inline-collapsed="collapsed"
            :items="items"
            v-model:selected-keys="selected"
          />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 5. Item groups
// ─────────────────────────────────────────────
export const ItemGroups: Story = {
  args: {
    items: groupedItems,
  },
  render: (args) => ({
    components: { BMenu },
    setup: () => ({ args }),
    template: `
      <div style="width: 256px;">
        <BMenu v-bind="args" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 6. Danger items
// ─────────────────────────────────────────────
export const DangerItems: Story = {
  args: {
    items: dangerItems,
  },
  render: (args) => ({
    components: { BMenu },
    setup: () => ({ args }),
    template: `
      <div style="width: 256px;">
        <BMenu v-bind="args" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 8. Multiple selection
// ─────────────────────────────────────────────
export const MultipleSelection: Story = {
  args: {
    multiple: true,
    items: basicItems,
    defaultSelectedKeys: ['home', 'about'],
  },
  render: (args) => ({
    components: { BMenu },
    setup: () => {
      const selected = ref<string[]>(['home', 'about']);
      return { args, selected };
    },
    template: `
      <div style="width: 256px;">
        <BMenu v-bind="args" v-model:selected-keys="selected" />
        <p style="margin-top: 12px; font-size: 12px; color: #666;">Selected: {{ selected.join(', ') }}</p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 9. Accessibility story
// ─────────────────────────────────────────────
export const Accessibility: Story = {
  args: {
    items: nestedItems,
    defaultSelectedKeys: ['home'],
  },
  render: (args) => ({
    components: { BMenu },
    setup: () => ({ args }),
    template: `
      <div style="width: 256px;">
        <BMenu v-bind="args" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // Verify menu role
    const menu = canvasElement.querySelector('[role="menu"]');
    expect(menu).toBeTruthy();
    expect(menu?.getAttribute('aria-orientation')).toBe('vertical');

    // Verify menu items have correct role (menuitemradio when selectable)
    const items = canvasElement.querySelectorAll('[role="menuitemradio"]');
    expect(items.length).toBeGreaterThan(0);

    // Verify tabindex on non-disabled items
    const firstItem = items[0] as HTMLElement;
    expect(firstItem.getAttribute('tabindex')).toBe('0');

    // Verify selected item has aria-checked
    const selectedItem = canvasElement.querySelector('[aria-checked="true"]');
    expect(selectedItem).toBeTruthy();

    // Verify submenu title has aria-haspopup and aria-expanded
    const submenuTitle = canvasElement.querySelector('[aria-haspopup="true"]');
    expect(submenuTitle).toBeTruthy();
    expect(submenuTitle?.getAttribute('aria-expanded')).toBe('false');

    // Open submenu via keyboard
    if (submenuTitle) {
      await userEvent.click(submenuTitle as HTMLElement);
      await waitFor(() => {
        expect(submenuTitle?.getAttribute('aria-expanded')).toBe('true');
      });
    }

    // Verify nested menu also has role="menu"
    await waitFor(() => {
      const nestedMenus = canvasElement.querySelectorAll('[role="menu"]');
      expect(nestedMenus.length).toBeGreaterThan(1);
    });
  },
};

// ─────────────────────────────────────────────
// 10. Theming story (CSS var overrides)
// ─────────────────────────────────────────────
export const Theming: Story = {
  args: {
    items: basicItems,
    defaultSelectedKeys: ['home'],
  },
  render: (args) => ({
    components: { BMenu },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; gap: 40px; flex-wrap: wrap;">
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Default</p>
          <div style="width: 220px;">
            <BMenu v-bind="args" />
          </div>
        </div>

        <div class="custom-menu-theme-1">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Purple accent</p>
          <div style="width: 220px;">
            <BMenu v-bind="args" />
          </div>
        </div>

        <div class="custom-menu-theme-2">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Rounded & warm</p>
          <div style="width: 220px;">
            <BMenu v-bind="args" />
          </div>
        </div>

        <div class="custom-menu-theme-3">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Compact</p>
          <div style="width: 180px;">
            <BMenu v-bind="args" />
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
// 11. Interaction test: full flow
// ─────────────────────────────────────────────
export const InteractionTest: Story = {
  args: {
    items: nestedItems,
  },
  render: (args) => ({
    components: { BMenu },
    setup: () => {
      const selected = ref<string[]>([]);
      const openKeys = ref<string[]>([]);
      return { args, selected, openKeys };
    },
    template: `
      <div style="width: 256px;">
        <BMenu v-bind="args" v-model:selected-keys="selected" v-model:open-keys="openKeys" />
        <p data-testid="selected">Selected: {{ selected.join(', ') }}</p>
        <p data-testid="open">Open: {{ openKeys.join(', ') }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Initially nothing selected
    expect(canvas.getByTestId('selected').textContent).toContain('Selected:');

    // Click first item
    const homeItem = canvasElement.querySelector('[data-menu-key="home"]') as HTMLElement;
    expect(homeItem).toBeTruthy();
    await userEvent.click(homeItem);

    await waitFor(() => {
      expect(canvas.getByTestId('selected').textContent).toContain('home');
    });

    // Open submenu
    const productsTitle = canvasElement.querySelector(
      '[data-menu-key="products"] .b-menu-submenu__title',
    ) as HTMLElement;
    expect(productsTitle).toBeTruthy();
    await userEvent.click(productsTitle);

    await waitFor(() => {
      expect(canvas.getByTestId('open').textContent).toContain('products');
    });

    // Select nested item
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
// 12. Disabled items
// ─────────────────────────────────────────────
export const DisabledItems: Story = {
  args: {
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
    ],
  },
  render: (args) => ({
    components: { BMenu },
    setup: () => ({ args }),
    template: `
      <div style="width: 256px;">
        <BMenu v-bind="args" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens reference (last story)
// ─────────────────────────────────────────────
export const DesignTokens: Story = {
  render: () => ({
    setup: () => {
      const tokens = [
        { variable: '--b-menu-item-bg', default: '#ffffff', description: 'Menu item background' },
        {
          variable: '--b-menu-item-color',
          default: 'rgba(0,0,0,0.88)',
          description: 'Menu item text color',
        },
        {
          variable: '--b-menu-item-hover-bg',
          default: 'rgba(0,0,0,0.06)',
          description: 'Item background on hover',
        },
        {
          variable: '--b-menu-item-hover-color',
          default: 'rgba(0,0,0,0.88)',
          description: 'Item text color on hover',
        },
        {
          variable: '--b-menu-item-active-bg',
          default: '#e6f4ff',
          description: 'Item background when active',
        },
        {
          variable: '--b-menu-item-selected-bg',
          default: '#e6f4ff',
          description: 'Selected item background',
        },
        {
          variable: '--b-menu-item-selected-color',
          default: '#0958d9',
          description: 'Selected item text color',
        },
        {
          variable: '--b-menu-item-disabled-color',
          default: 'rgba(0,0,0,0.25)',
          description: 'Disabled item text color',
        },
        { variable: '--b-menu-item-height', default: '40px', description: 'Menu item height' },
        {
          variable: '--b-menu-item-border-radius',
          default: '8px',
          description: 'Menu item border radius',
        },
        {
          variable: '--b-menu-item-margin-block',
          default: '4px',
          description: 'Vertical margin between items',
        },
        {
          variable: '--b-menu-item-margin-inline',
          default: '4px',
          description: 'Horizontal margin of items',
        },
        {
          variable: '--b-menu-item-padding-inline',
          default: '16px',
          description: 'Horizontal padding inside items',
        },
        { variable: '--b-menu-icon-size', default: '14px', description: 'Icon size' },
        {
          variable: '--b-menu-icon-margin-inline-end',
          default: '10px',
          description: 'Spacing between icon and label',
        },
        {
          variable: '--b-menu-group-title-color',
          default: 'rgba(0,0,0,0.65)',
          description: 'Group title text color',
        },
        {
          variable: '--b-menu-group-title-font-size',
          default: '14px',
          description: 'Group title font size',
        },
        {
          variable: '--b-menu-group-title-line-height',
          default: '1.5714',
          description: 'Group title line height',
        },
        {
          variable: '--b-menu-danger-item-color',
          default: '#cf1322',
          description: 'Danger item text color',
        },
        {
          variable: '--b-menu-danger-item-hover-color',
          default: '#cf1322',
          description: 'Danger item hover color',
        },
        {
          variable: '--b-menu-danger-item-active-bg',
          default: '#fff2f0',
          description: 'Danger item active background',
        },
        {
          variable: '--b-menu-danger-item-selected-bg',
          default: '#fff2f0',
          description: 'Danger item selected background',
        },
        {
          variable: '--b-menu-danger-item-selected-color',
          default: '#cf1322',
          description: 'Danger item selected color',
        },
        {
          variable: '--b-menu-sub-menu-item-bg',
          default: 'rgba(0,0,0,0.02)',
          description: 'Submenu content background',
        },
        {
          variable: '--b-menu-sub-menu-item-border-radius',
          default: '4px',
          description: 'Submenu item border radius',
        },
        {
          variable: '--b-menu-sub-menu-item-selected-color',
          default: '#0958d9',
          description: 'Submenu title color when child selected',
        },
        { variable: '--b-menu-popup-bg', default: '#ffffff', description: 'Popup menu background' },
        {
          variable: '--b-menu-popup-shadow',
          default: '0 6px 16px ...',
          description: 'Popup box shadow',
        },
        {
          variable: '--b-menu-popup-border-radius',
          default: '8px',
          description: 'Popup border radius',
        },
        { variable: '--b-menu-popup-z-index', default: '1050', description: 'Popup z-index' },
        {
          variable: '--b-menu-dropdown-width',
          default: '160px',
          description: 'Popup menu min-width',
        },
        {
          variable: '--b-menu-collapsed-width',
          default: '80px',
          description: 'Menu width when collapsed',
        },
        {
          variable: '--b-menu-collapsed-icon-size',
          default: '16px',
          description: 'Icon size when collapsed',
        },
        {
          variable: '--b-menu-active-bar-height',
          default: '2px',
          description: 'Horizontal mode active indicator height',
        },
        {
          variable: '--b-menu-active-bar-width',
          default: '3px',
          description: 'Vertical mode active indicator width',
        },
        {
          variable: '--b-menu-horizontal-line-height',
          default: '46px',
          description: 'Horizontal menu item line height',
        },
        {
          variable: '--b-menu-horizontal-item-hover-bg',
          default: 'transparent',
          description: 'Horizontal item hover background',
        },
        {
          variable: '--b-menu-horizontal-item-hover-color',
          default: '#0958d9',
          description: 'Horizontal item hover color',
        },
        {
          variable: '--b-menu-horizontal-item-selected-bg',
          default: 'transparent',
          description: 'Horizontal item selected background',
        },
        {
          variable: '--b-menu-horizontal-item-selected-color',
          default: '#0958d9',
          description: 'Horizontal item selected color',
        },
        {
          variable: '--b-menu-horizontal-item-border-radius',
          default: '0',
          description: 'Horizontal item border radius',
        },
        {
          variable: '--b-menu-transition-duration',
          default: '200ms',
          description: 'Animation transition duration',
        },
      ];
      return { tokens };
    },
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600;">BMenu Design Tokens</h3>
        <p style="margin: 0 0 16px; font-size: 13px; color: #555;">
          Override these CSS variables on <code>.b-menu</code> or an ancestor to customize the menu appearance.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:oklch(96% 0.002 260);">
              <th style="text-align:left;padding:10px 12px;border-bottom:1px solid oklch(85% 0.005 260);">Variable</th>
              <th style="text-align:left;padding:10px 12px;border-bottom:1px solid oklch(85% 0.005 260);">Default</th>
              <th style="text-align:left;padding:10px 12px;border-bottom:1px solid oklch(85% 0.005 260);">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="token in tokens" :key="token.variable" style="border-bottom:1px solid oklch(94% 0.003 260);">
              <td style="padding:8px 12px;font-family:monospace;font-size:12px;color:#86198f;white-space:nowrap;"><code>{{ token.variable }}</code></td>
              <td style="padding:8px 12px;font-family:monospace;font-size:12px;color:#595959;">{{ token.default }}</td>
              <td style="padding:8px 12px;color:#555;">{{ token.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
};
