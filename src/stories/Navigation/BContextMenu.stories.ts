import { BContextMenu } from '@/components/BContextMenu';
import type { BContextMenuItem } from '@/components/BContextMenu';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

/**
 * BContextMenu — a right-click menu that opens at the cursor inside a trigger
 * area. The trigger wraps any content; the panel itself is teleported to
 * <body> and positioned via inline `top` / `left`.
 *
 * The story file follows the canonical format described in
 * `docs/STORY_FORMAT.md`:
 *   Usage  → Default + one story per visual variant (icons, dividers, etc.)
 *   Examples → Composed real-world recipes (file tree row, table row, programmatic)
 *   Accessibility → Roles + keyboard play function
 *   Theming → CSS-token overrides
 *   Design Tokens → reference table (LAST story)
 */
const meta = {
  title: 'Navigation/ContextMenu',
  component: BContextMenu,
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: 'object',
      description: 'Items to render. Items can be entries or `{ divider: true, key }` separators.',
      table: { category: 'Props' },
    },
    disabled: {
      control: 'boolean',
      description: 'When true the trigger ignores `contextmenu` — the menu cannot be opened.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    id: {
      control: 'text',
      description: 'Optional explicit id for the menu element.',
      table: { category: 'Props' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the menu.',
      table: { category: 'Props', defaultValue: { summary: 'Context menu' } },
    },
    default: {
      description: 'Trigger area. Right-click anywhere inside to open the menu.',
      table: { category: 'Slots' },
    },
    item: {
      description: 'Scoped slot to override item rendering. Receives `{ item, active }`.',
      table: { category: 'Slots' },
    },
    onSelect: {
      description: 'Emitted when an item is activated (click or Enter / Space).',
      table: { category: 'Events' },
    },
    onOpen: {
      description: 'Emitted when the menu opens.',
      table: { category: 'Events' },
    },
    onClose: {
      description: 'Emitted when the menu closes.',
      table: { category: 'Events' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BContextMenu</code> component renders a right-click menu at the cursor position within a trigger area.<br><br>' +
          'Items are passed via the <code>items</code> prop. Each item is either a regular entry (with <code>label</code>) or a divider (<code>{ divider: true, key }</code>). Items can carry <code>icon</code>, <code>disabled</code>, or <code>danger</code> flags.<br><br>' +
          'Keyboard: <kbd>ArrowUp</kbd> / <kbd>ArrowDown</kbd> cycle (skipping dividers and disabled items), <kbd>Home</kbd> / <kbd>End</kbd> jump, <kbd>Enter</kbd> / <kbd>Space</kbd> activate, <kbd>Escape</kbd> or <kbd>Tab</kbd> close.',
      },
    },
  },
} satisfies Meta<typeof BContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

// Reusable trigger styling for stories.
const TRIGGER_STYLE =
  'display:flex;align-items:center;justify-content:center;width:320px;height:140px;border:1px dashed oklch(80% 0.005 260);border-radius:8px;color:oklch(45% 0.005 260);background:oklch(98% 0.002 260);user-select:none;cursor:context-menu;';

const BASIC_ITEMS: BContextMenuItem[] = [
  { key: 'cut', label: 'Cut' },
  { key: 'copy', label: 'Copy' },
  { key: 'paste', label: 'Paste' },
];

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/**
 * Default — right-click anywhere inside the dashed area to open the menu.
 */
export const Default: Story = {
  args: {
    items: BASIC_ITEMS,
    ariaLabel: 'Context menu',
    disabled: false,
  },
  parameters: {
    docs: {
      source: {
        code: `
<BContextMenu :items="items">
  <div>Right-click me</div>
</BContextMenu>
        `,
      },
    },
  },
  render: (args) => ({
    components: { BContextMenu },
    setup: () => ({ args }),
    template: `
      <BContextMenu v-bind="args">
        <div style="${TRIGGER_STYLE}">Right-click anywhere in this area</div>
      </BContextMenu>
    `,
  }),
};

/** Items can carry an `icon` name forwarded to BIcon. */
export const WithIcons: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BContextMenu :items="[
  { key: 'cut',   label: 'Cut',   icon: 'scissors' },
  { key: 'copy',  label: 'Copy',  icon: 'copy' },
  { key: 'paste', label: 'Paste', icon: 'clipboard' },
]">
  <div>Right-click me</div>
</BContextMenu>
        `,
      },
    },
  },
  render: () => ({
    components: { BContextMenu },
    setup: () => ({
      items: [
        { key: 'cut', label: 'Cut', icon: 'scissors' },
        { key: 'copy', label: 'Copy', icon: 'copy' },
        { key: 'paste', label: 'Paste', icon: 'clipboard' },
      ] as BContextMenuItem[],
    }),
    template: `
      <BContextMenu :items="items">
        <div style="${TRIGGER_STYLE}">Right-click — items have icons</div>
      </BContextMenu>
    `,
  }),
};

/** Use `{ divider: true, key }` items to visually group entries. */
export const WithDividers: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BContextMenu :items="[
  { key: 'cut',    label: 'Cut' },
  { key: 'copy',   label: 'Copy' },
  { key: 'd1',     divider: true },
  { key: 'paste',  label: 'Paste' },
]">
  <div>Right-click me</div>
</BContextMenu>
        `,
      },
    },
  },
  render: () => ({
    components: { BContextMenu },
    setup: () => ({
      items: [
        { key: 'cut', label: 'Cut' },
        { key: 'copy', label: 'Copy' },
        { key: 'd1', divider: true },
        { key: 'paste', label: 'Paste' },
        { key: 'd2', divider: true },
        { key: 'select-all', label: 'Select all' },
      ] as BContextMenuItem[],
    }),
    template: `
      <BContextMenu :items="items">
        <div style="${TRIGGER_STYLE}">Right-click — divided sections</div>
      </BContextMenu>
    `,
  }),
};

/** Disabled items are visually muted, not activatable, and skipped by keyboard nav. */
export const WithDisabledItem: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BContextMenu :items="[
  { key: 'cut',   label: 'Cut' },
  { key: 'copy',  label: 'Copy', disabled: true },
  { key: 'paste', label: 'Paste' },
]">
  <div>Right-click me</div>
</BContextMenu>
        `,
      },
    },
  },
  render: () => ({
    components: { BContextMenu },
    setup: () => ({
      items: [
        { key: 'cut', label: 'Cut' },
        { key: 'copy', label: 'Copy', disabled: true },
        { key: 'paste', label: 'Paste' },
      ] as BContextMenuItem[],
    }),
    template: `
      <BContextMenu :items="items">
        <div style="${TRIGGER_STYLE}">Right-click — Copy is disabled</div>
      </BContextMenu>
    `,
  }),
};

/** Items with `danger: true` render in destructive (red) styling. */
export const WithDangerItem: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BContextMenu :items="[
  { key: 'open',   label: 'Open' },
  { key: 'd1',     divider: true },
  { key: 'delete', label: 'Delete', danger: true },
]">
  <div>Right-click me</div>
</BContextMenu>
        `,
      },
    },
  },
  render: () => ({
    components: { BContextMenu },
    setup: () => ({
      items: [
        { key: 'open', label: 'Open' },
        { key: 'rename', label: 'Rename' },
        { key: 'd1', divider: true },
        { key: 'delete', label: 'Delete', danger: true },
      ] as BContextMenuItem[],
    }),
    template: `
      <BContextMenu :items="items">
        <div style="${TRIGGER_STYLE}">Right-click — destructive Delete</div>
      </BContextMenu>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Each row in a tree gets its own context menu (Copy / Rename / Delete). */
export const FileTree: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A typical file-tree node with a per-row right-click menu. The trigger is the row itself.',
      },
      source: {
        code: `
<BContextMenu :items="items" @select="onSelect">
  <div class="row">📄 README.md</div>
</BContextMenu>
        `,
      },
    },
  },
  render: () => ({
    components: { BContextMenu },
    setup() {
      const lastAction = ref<string>('');
      const items: BContextMenuItem[] = [
        { key: 'open', label: 'Open' },
        { key: 'copy', label: 'Copy path', icon: 'copy' },
        { key: 'rename', label: 'Rename' },
        { key: 'd1', divider: true },
        { key: 'delete', label: 'Delete', danger: true },
      ];
      const onSelect = (item: BContextMenuItem) => {
        lastAction.value = item.label ?? item.key;
      };
      return { items, onSelect, lastAction };
    },
    template: `
      <div style="font-family:ui-sans-serif,system-ui;width:340px;">
        <p style="margin:0 0 8px;color:oklch(45% 0.005 260);font-size:13px;">Right-click on any row.</p>
        <div role="list" style="padding:0;margin:0;border:1px solid oklch(92% 0.004 286);border-radius:8px;overflow:hidden;">
          <BContextMenu :items="items" @select="onSelect">
            <div role="listitem" style="padding:10px 12px;border-bottom:1px solid oklch(94% 0.003 286);cursor:context-menu;">📄 README.md</div>
          </BContextMenu>
          <BContextMenu :items="items" @select="onSelect">
            <div role="listitem" style="padding:10px 12px;border-bottom:1px solid oklch(94% 0.003 286);cursor:context-menu;">📄 package.json</div>
          </BContextMenu>
          <BContextMenu :items="items" @select="onSelect">
            <div role="listitem" style="padding:10px 12px;cursor:context-menu;">📁 src/</div>
          </BContextMenu>
        </div>
        <p style="margin:8px 0 0;font-size:12px;color:oklch(50% 0.005 260);">Last action: <strong>{{ lastAction || '—' }}</strong></p>
      </div>
    `,
  }),
};

/** A table row whose right-click menu offers Edit / Duplicate / Delete. */
export const TableRow: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Right-click any row to edit, duplicate, or delete it.',
      },
      source: {
        code: `
<BContextMenu :items="rowItems" @select="onSelect">
  <tr>...</tr>
</BContextMenu>
        `,
      },
    },
  },
  render: () => ({
    components: { BContextMenu },
    setup() {
      const lastAction = ref<string>('');
      const rowItems: BContextMenuItem[] = [
        { key: 'edit', label: 'Edit', icon: 'pen-line' },
        { key: 'dup', label: 'Duplicate' },
        { key: 'd1', divider: true },
        { key: 'delete', label: 'Delete', danger: true },
      ];
      const onSelect = (item: BContextMenuItem) => {
        lastAction.value = item.label ?? item.key;
      };
      const rows = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
        { id: 3, name: 'Carol', email: 'carol@example.com' },
      ];
      return { rowItems, onSelect, lastAction, rows };
    },
    template: `
      <div style="font-family:ui-sans-serif,system-ui;">
        <table style="border-collapse:collapse;width:420px;border:1px solid oklch(92% 0.004 286);border-radius:8px;overflow:hidden;">
          <thead style="background:oklch(96% 0.002 260);">
            <tr>
              <th style="text-align:left;padding:8px 12px;">Name</th>
              <th style="text-align:left;padding:8px 12px;">Email</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="row in rows" :key="row.id">
              <BContextMenu :items="rowItems" @select="onSelect">
                <tr style="border-top:1px solid oklch(94% 0.003 286);cursor:context-menu;">
                  <td style="padding:8px 12px;">{{ row.name }}</td>
                  <td style="padding:8px 12px;">{{ row.email }}</td>
                </tr>
              </BContextMenu>
            </template>
          </tbody>
        </table>
        <p style="margin:8px 0 0;font-size:12px;color:oklch(50% 0.005 260);">Last action: <strong>{{ lastAction || '—' }}</strong></p>
      </div>
    `,
  }),
};

/** Open the menu programmatically via the exposed `open(x, y)` method. */
export const Programmatic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'You can open the menu without a right-click by grabbing a template ref and calling <code>open(x, y)</code>. Useful for keyboard-triggered context menus or per-row buttons.',
      },
      source: {
        code: `
<BContextMenu ref="menuRef" :items="items">
  <div>Trigger area</div>
</BContextMenu>
<button @click="menuRef.open(200, 200)">Open menu</button>
        `,
      },
    },
  },
  render: () => ({
    components: { BContextMenu },
    setup() {
      const menuRef = ref<InstanceType<typeof BContextMenu> | null>(null);
      const items: BContextMenuItem[] = [
        { key: 'a', label: 'Action A' },
        { key: 'b', label: 'Action B' },
        { key: 'c', label: 'Action C', danger: true },
      ];
      const openAt = (e: MouseEvent) => {
        // Open the menu near the button.
        menuRef.value?.open(e.clientX, e.clientY);
      };
      return { menuRef, items, openAt };
    },
    template: `
      <div>
        <BContextMenu ref="menuRef" :items="items">
          <div style="${TRIGGER_STYLE}">Right-click here OR press the button</div>
        </BContextMenu>
        <button
          type="button"
          style="margin-top:12px;padding:6px 12px;border-radius:6px;border:1px solid oklch(80% 0.005 260);background:white;cursor:pointer;"
          @click="openAt"
        >
          Open menu programmatically
        </button>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * The menu carries <code>role="menu"</code>, the trigger fires <code>contextmenu</code>,
 * and items expose <code>role="menuitem"</code> with <code>aria-disabled</code> when
 * unavailable. Arrow keys move the active item; Escape closes.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Drives the trigger via a real <code>contextmenu</code> event, asserts the menu role + aria-label, walks <kbd>ArrowDown</kbd>, then closes via <kbd>Escape</kbd>.',
      },
    },
  },
  render: () => ({
    components: { BContextMenu },
    setup: () => ({
      items: [
        { key: 'open', label: 'Open' },
        { key: 'copy', label: 'Copy' },
        { key: 'd1', divider: true },
        { key: 'delete', label: 'Delete', danger: true },
      ] as BContextMenuItem[],
    }),
    template: `
      <BContextMenu :items="items" aria-label="Row actions">
        <div data-testid="ctx-trigger" style="${TRIGGER_STYLE}">Right-click me</div>
      </BContextMenu>
    `,
  }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const trigger = c.getByTestId('ctx-trigger');

    // Dispatch a real contextmenu event at the trigger.
    trigger.dispatchEvent(
      new MouseEvent('contextmenu', { clientX: 50, clientY: 50, bubbles: true, cancelable: true }),
    );

    // The menu is teleported to body — query the document.
    const doc = within(document.body);
    const menu = await waitFor(() => doc.getByRole('menu'));
    expect(menu).toHaveAttribute('aria-label', 'Row actions');
    expect(menu).toHaveAttribute('aria-orientation', 'vertical');

    const items = doc.getAllByRole('menuitem');
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toHaveClass('b-context-menu__item--active');

    // ArrowDown moves the active item.
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(items[1]).toHaveClass('b-context-menu__item--active'));

    // Escape closes the menu.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(doc.queryByRole('menu')).toBeNull());
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override <code>--b-context-menu-bg</code>, <code>--b-context-menu-fg</code>,
 * <code>--b-context-menu-radius</code>, <code>--b-context-menu-item-bg-active</code>,
 * and <code>--b-context-menu-item-fg-danger</code> on the trigger or any
 * ancestor to retheme the menu.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override at least five of the scoped <code>--b-context-menu-*</code> tokens — background, foreground, corner radius, active item background, and danger color.',
      },
      source: {
        code: `
<BContextMenu
  :items="items"
  style="
    --b-context-menu-bg: oklch(22% 0.05 290);
    --b-context-menu-fg: oklch(96% 0.005 290);
    --b-context-menu-radius: 16px;
    --b-context-menu-item-bg-active: oklch(40% 0.18 290);
    --b-context-menu-item-fg-danger: oklch(70% 0.2 25);
    --b-context-menu-divider-color: oklch(40% 0.05 290);
    --b-context-menu-min-width: 220px;
  "
>
  <div>Themed area</div>
</BContextMenu>
        `,
      },
    },
  },
  render: () => ({
    components: { BContextMenu },
    setup: () => ({
      items: [
        { key: 'open', label: 'Open' },
        { key: 'rename', label: 'Rename' },
        { key: 'd1', divider: true },
        { key: 'delete', label: 'Delete', danger: true },
      ] as BContextMenuItem[],
    }),
    template: `
      <BContextMenu
        :items="items"
        style="
          --b-context-menu-bg: oklch(22% 0.05 290);
          --b-context-menu-fg: oklch(96% 0.005 290);
          --b-context-menu-radius: 16px;
          --b-context-menu-item-bg-active: oklch(40% 0.18 290);
          --b-context-menu-item-fg-danger: oklch(70% 0.2 25);
          --b-context-menu-divider-color: oklch(40% 0.05 290);
          --b-context-menu-min-width: 220px;
        "
      >
        <div style="${TRIGGER_STYLE}">Right-click — themed menu</div>
      </BContextMenu>
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  { token: '--b-context-menu-bg', defaultValue: 'oklch(100% 0 0)', description: 'Panel background color.' },
  { token: '--b-context-menu-fg', defaultValue: 'oklch(20% 0.005 286)', description: 'Default foreground (text) color.' },
  { token: '--b-context-menu-border-color', defaultValue: 'oklch(92% 0.004 286.32)', description: 'Panel border color.' },
  { token: '--b-context-menu-radius', defaultValue: '8px', description: 'Panel border-radius.' },
  { token: '--b-context-menu-shadow', defaultValue: '0 6px 16px ... oklch(0% 0 0 / 0.05)', description: 'Panel drop shadow.' },
  { token: '--b-context-menu-padding', defaultValue: '4px', description: 'Inner padding around the items list.' },
  { token: '--b-context-menu-min-width', defaultValue: '180px', description: 'Minimum panel width.' },
  { token: '--b-context-menu-item-padding-x', defaultValue: '12px', description: 'Horizontal padding inside each item.' },
  { token: '--b-context-menu-item-padding-y', defaultValue: '6px', description: 'Vertical padding inside each item.' },
  { token: '--b-context-menu-item-bg-hover', defaultValue: 'oklch(96% 0.003 286)', description: 'Background color on hover.' },
  { token: '--b-context-menu-item-bg-active', defaultValue: 'oklch(94% 0.02 240)', description: 'Background color of the keyboard-active item.' },
  { token: '--b-context-menu-item-fg-disabled', defaultValue: 'oklch(70% 0.005 286)', description: 'Foreground for disabled items.' },
  { token: '--b-context-menu-item-fg-danger', defaultValue: 'oklch(55% 0.22 25.331)', description: 'Foreground color for items with `danger: true`.' },
  { token: '--b-context-menu-divider-color', defaultValue: 'oklch(92% 0.004 286.32)', description: 'Divider line color.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'All scoped CSS variables exposed by <code>BContextMenu</code>. Override on the component root or any ancestor selector to retheme.',
      },
    },
  },
  render: () => ({
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BContextMenu — Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          The list below documents every scoped <code>--b-context-menu-*</code> CSS variable
          exposed by the component. Override on the trigger root, the panel, or any ancestor.
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
      </div>
    `,
  }),
};
