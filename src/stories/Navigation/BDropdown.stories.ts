import { BDropdown } from '@/components';
import type { BDropdownMenuProps } from '@/components/BDropdown/types.ts';
import { BDropdownPlacement, BDropdownTrigger } from '@/components/BDropdown/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

const meta = {
  title: 'Navigation/Dropdown',
  component: BDropdown,
  tags: ['autodocs'],
  argTypes: {
    trigger: {
      control: 'select',
      options: Object.values(BDropdownTrigger),
      description: 'The trigger mode that opens the dropdown.',
      table: { category: 'Props', defaultValue: { summary: BDropdownTrigger.Hover } },
    },
    placement: {
      control: 'select',
      options: Object.values(BDropdownPlacement),
      description: 'Placement of the popup menu.',
      table: { category: 'Props', defaultValue: { summary: BDropdownPlacement.BottomLeft } },
    },
    arrow: {
      control: 'boolean',
      description: 'Show the dropdown chevron indicator next to the trigger.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the dropdown menu.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    destroyOnHidden: {
      control: 'boolean',
      description: 'Destroy the popup when hidden.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    mouseEnterDelay: {
      control: 'number',
      description: 'Delay (ms) before showing on mouseenter.',
      table: { category: 'Props', defaultValue: { summary: '100' } },
    },
    mouseLeaveDelay: {
      control: 'number',
      description: 'Delay (ms) before hiding on mouseleave.',
      table: { category: 'Props', defaultValue: { summary: '100' } },
    },
    menu: {
      control: 'object',
      description: 'Menu definition (items, dividers, groups, selectable, etc.).',
      table: { category: 'Props' },
    },
    modelValue: {
      control: 'boolean',
      description: 'Controlled open state (bind with v-model).',
      table: { category: 'Two-Way Binding Props' },
    },
    default: {
      description: 'Trigger element. Receives `triggerProps` via slot scope.',
      table: { category: 'Slots' },
    },
    overlay: {
      description: 'Custom popup content. Replaces the default menu rendering.',
      table: { category: 'Slots' },
    },
    'onMenu-click': {
      description: 'Emitted when a menu item is clicked. Payload: `{ key, item, domEvent }`.',
      table: { category: 'Events' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BDropdown</code> component displays a dropdown menu triggered by user interaction.<br><br>' +
          'Supports hover, click, and context-menu triggers. Items can be grouped, ' +
          'include dividers, and support danger/disabled/selected states.<br>' +
          'Uses the native HTML <code>popover</code> attribute and CSS Anchor Positioning.',
      },
    },
  },
} satisfies Meta<typeof BDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Sample menus
// ─────────────────────────────────────────────
const basicMenu: BDropdownMenuProps = {
  items: [
    { key: '1', label: '1st menu item' },
    { key: '2', label: '2nd menu item' },
    { key: '3', label: '3rd menu item', disabled: true },
    { key: '4', label: '4th menu item', danger: true },
  ],
};

const groupedMenu: BDropdownMenuProps = {
  items: [
    {
      key: 'group1',
      label: '',
      type: 'group',
      title: 'Group 1',
      children: [
        { key: '1', label: 'Option 1' },
        { key: '2', label: 'Option 2' },
      ],
    },
    { key: 'div', label: '', type: 'divider' },
    {
      key: 'group2',
      label: '',
      type: 'group',
      title: 'Group 2',
      children: [
        { key: '3', label: 'Option 3' },
        { key: '4', label: 'Option 4' },
      ],
    },
  ],
};

const selectableMenu: BDropdownMenuProps = {
  items: [
    { key: '1', label: 'Option A' },
    { key: '2', label: 'Option B' },
    { key: '3', label: 'Option C' },
  ],
  selectable: true,
  selectedKeys: ['2'],
};

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** Default — opens on hover at `bottomLeft`. */
export const Default: Story = {
  args: {
    trigger: 'hover' as const,
    placement: 'bottomLeft' as const,
    arrow: false,
    disabled: false,
    destroyOnHidden: false,
    mouseEnterDelay: 100,
    mouseLeaveDelay: 100,
    menu: basicMenu,
  },
  parameters: {
    docs: {
      source: {
        code: `
<BDropdown :menu="menu" v-slot="{ triggerProps }">
  <a href="#" @click.prevent v-bind="triggerProps">Hover me</a>
</BDropdown>
        `,
      },
    },
  },
  render: (args) => ({
    components: { BDropdown },
    setup: () => ({ args }),
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <BDropdown v-bind="args" v-slot="{ triggerProps }">
          <a href="#" @click.prevent v-bind="triggerProps">Hover me</a>
        </BDropdown>
      </div>
    `,
  }),
};

/** Open via click — common when the trigger needs deliberate activation. */
export const ClickTrigger: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BDropdown trigger="click" :menu="menu" v-slot="{ triggerProps }">
  <button v-bind="triggerProps">Click me</button>
</BDropdown>
        `,
      },
    },
  },
  render: () => ({
    components: { BDropdown },
    setup: () => ({ menu: basicMenu }),
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <BDropdown trigger="click" :menu="menu" v-slot="{ triggerProps }">
          <button type="button" v-bind="triggerProps">Click me</button>
        </BDropdown>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText('Click me');
    await userEvent.click(trigger);
    await waitFor(() => {
      const menu = document.querySelector('[role="menu"]');
      expect(menu).toBeTruthy();
      expect(menu?.querySelector('[role="menuitem"]')).toBeTruthy();
    });
  },
};

/** Open via right-click. Useful for table rows / canvas surfaces. */
export const ContextMenuTrigger: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BDropdown trigger="contextMenu" :menu="menu" v-slot="{ triggerProps }">
  <div v-bind="triggerProps" role="button" tabindex="0">Right-click me</div>
</BDropdown>
        `,
      },
    },
  },
  render: () => ({
    components: { BDropdown },
    setup: () => ({ menu: basicMenu }),
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <BDropdown trigger="contextMenu" :menu="menu" v-slot="{ triggerProps }">
          <div v-bind="triggerProps" role="button" tabindex="0" style="padding: 40px; border: 2px dashed #ccc; border-radius: 8px; text-align: center; color: #666;">
            Right-click this area
          </div>
        </BDropdown>
      </div>
    `,
  }),
};

/** Visualises every supported placement. */
export const AllPlacements: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BDropdown placement="bottomLeft" trigger="click" :menu="menu" />`,
      },
    },
  },
  render: () => ({
    components: { BDropdown },
    setup: () => ({
      placements: Object.values(BDropdownPlacement),
      menu: basicMenu,
    }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 60px; padding: 120px 80px;">
        <div v-for="p in placements" :key="p" style="display: flex; justify-content: center;">
          <BDropdown :placement="p" trigger="click" :menu="menu" v-slot="{ triggerProps }">
            <button type="button" v-bind="triggerProps" style="min-width: 120px;">{{ p }}</button>
          </BDropdown>
        </div>
      </div>
    `,
  }),
};

/** A small chevron arrow points from the popup to the trigger. */
export const WithArrow: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BDropdown arrow trigger="click" :menu="menu">…</BDropdown>`,
      },
    },
  },
  render: () => ({
    components: { BDropdown },
    setup: () => ({ menu: basicMenu }),
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <BDropdown arrow trigger="click" :menu="menu" v-slot="{ triggerProps }">
          <button type="button" v-bind="triggerProps">With Arrow</button>
        </BDropdown>
      </div>
    `,
  }),
};

/** Disabled trigger — no popup will open and pointer feedback is suppressed. */
export const Disabled: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BDropdown disabled trigger="click" :menu="menu">…</BDropdown>`,
      },
    },
  },
  render: () => ({
    components: { BDropdown },
    setup: () => ({ menu: basicMenu }),
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <BDropdown disabled trigger="click" :menu="menu" v-slot="{ triggerProps }">
          <button type="button" v-bind="triggerProps">Disabled Dropdown</button>
        </BDropdown>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Items grouped under titles, separated by dividers. */
export const GroupedMenu: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BDropdown trigger="click" :menu="{
  items: [
    { type: 'group', key: 'g1', title: 'Group 1', children: [
      { key: '1', label: 'Option 1' },
      { key: '2', label: 'Option 2' },
    ]},
    { type: 'divider' },
    { type: 'group', key: 'g2', title: 'Group 2', children: [
      { key: '3', label: 'Option 3' },
    ]},
  ],
}" />
        `,
      },
    },
  },
  render: () => ({
    components: { BDropdown },
    setup: () => ({ menu: groupedMenu }),
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <BDropdown trigger="click" :menu="menu" v-slot="{ triggerProps }">
          <button type="button" v-bind="triggerProps">Grouped Items</button>
        </BDropdown>
      </div>
    `,
  }),
};

/** When `selectable: true`, clicking an item toggles its checkmark. */
export const SelectableMenu: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BDropdown trigger="click" :menu="{
  items: [{ key: '1', label: 'A' }, { key: '2', label: 'B' }],
  selectable: true,
  selectedKeys: ['2'],
}" />
        `,
      },
    },
  },
  render: () => ({
    components: { BDropdown },
    setup: () => ({ menu: selectableMenu }),
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <BDropdown trigger="click" :menu="menu" v-slot="{ triggerProps }">
          <button type="button" v-bind="triggerProps">Selectable</button>
        </BDropdown>
      </div>
    `,
  }),
};

/** Use the `#overlay` slot to render arbitrary content instead of a menu. */
export const CustomOverlay: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BDropdown trigger="click">
  <template #default="{ triggerProps }">
    <button v-bind="triggerProps">Custom Content</button>
  </template>
  <template #overlay>
    <div style="padding: 16px;">
      <h4>Custom Overlay</h4>
      <button>Action</button>
    </div>
  </template>
</BDropdown>
        `,
      },
    },
  },
  render: () => ({
    components: { BDropdown },
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <BDropdown trigger="click">
          <template #default="{ triggerProps }">
            <button type="button" v-bind="triggerProps">Custom Content</button>
          </template>
          <template #overlay>
            <div style="padding: 16px; min-width: 200px;">
              <h4 style="margin: 0 0 8px;">Custom Overlay</h4>
              <p style="margin: 0; color: #666;">This is custom dropdown content using the overlay slot.</p>
              <button type="button" style="margin-top: 12px;">Action</button>
            </div>
          </template>
        </BDropdown>
      </div>
    `,
  }),
};

/** Click an item and observe the `@menu-click` event payload. */
export const InteractionFlow: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Open the dropdown, click an item, observe the `menu-click` event payload.',
      },
      source: {
        code: `
<BDropdown trigger="click" :menu="menu" @menu-click="onMenuClick">
  <button>Open Menu</button>
</BDropdown>
        `,
      },
    },
  },
  render: () => ({
    components: { BDropdown },
    setup: () => {
      const lastClicked = ref('none');
      const onMenuClick = (info: { key: string | number }) => {
        lastClicked.value = String(info.key);
      };
      return { menu: basicMenu, lastClicked, onMenuClick };
    },
    template: `
      <div style="padding: 100px; display: flex; flex-direction: column; align-items: center; gap: 16px;">
        <BDropdown trigger="click" :menu="menu" @menu-click="onMenuClick" v-slot="{ triggerProps }">
          <button type="button" data-testid="dropdown-trigger" v-bind="triggerProps">Open Menu</button>
        </BDropdown>
        <p data-testid="last-clicked">Last clicked: {{ lastClicked }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('dropdown-trigger');

    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    await userEvent.click(trigger);
    await waitFor(() => {
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });

    await waitFor(async () => {
      const items = document.querySelectorAll('[role="menuitem"]');
      expect(items.length).toBeGreaterThan(0);
      await userEvent.click(items[0] as HTMLElement);
    });

    await waitFor(() => {
      expect(canvas.getByTestId('last-clicked').textContent).toContain('1');
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });
  },
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * The trigger gets `aria-haspopup="menu"` and `aria-expanded`. The popup uses
 * `role="menu"` with `role="menuitem"` items; disabled items carry `aria-disabled`.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Trigger exposes <code>aria-haspopup="menu"</code> and <code>aria-expanded</code>; popup uses <code>role="menu"</code>; disabled items use <code>aria-disabled="true"</code>.',
      },
      source: {
        code: `<BDropdown trigger="click" :menu="menu">…</BDropdown>`,
      },
    },
  },
  render: () => ({
    components: { BDropdown },
    setup: () => ({ menu: basicMenu }),
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <BDropdown trigger="click" :menu="menu" v-slot="{ triggerProps }">
          <button type="button" v-bind="triggerProps">Accessible Dropdown</button>
        </BDropdown>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText('Accessible Dropdown');

    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    await userEvent.click(trigger);
    await waitFor(() => {
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });

    await waitFor(() => {
      const menu = document.querySelector('[role="menu"]');
      expect(menu).toBeTruthy();
    });

    await waitFor(() => {
      const items = document.querySelectorAll('[role="menuitem"]');
      expect(items.length).toBeGreaterThan(0);
      const disabledItem = Array.from(items).find(
        (el) => el.getAttribute('aria-disabled') === 'true',
      );
      expect(disabledItem).toBeTruthy();
    });
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override `--b-dropdown-item-selected-bg`, `--b-dropdown-item-hover-bg`, and
 * `--b-dropdown-border-radius` (plus extras) to retheme dropdowns.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-dropdown-item-selected-bg</code>, <code>--b-dropdown-item-hover-bg</code>, and <code>--b-dropdown-border-radius</code> on <code>.b-dropdown</code> (or via a wrapping selector) to retheme the popup.',
      },
      source: {
        code: `
<BDropdown trigger="click" :menu="menu">
  <button
    style="
      --b-dropdown-item-selected-bg: oklch(95% 0.05 290);
      --b-dropdown-item-selected-color: oklch(50% 0.18 290);
      --b-dropdown-item-hover-bg: oklch(97% 0.03 290);
      --b-dropdown-border-radius: 12px;
    "
  >Themed</button>
</BDropdown>
        `,
      },
    },
  },
  render: () => ({
    components: { BDropdown },
    setup: () => ({ menu: basicMenu }),
    template: `
      <div style="padding: 100px; display: flex; gap: 40px; flex-wrap: wrap;">
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Default</p>
          <BDropdown trigger="click" :menu="menu" v-slot="{ triggerProps }">
            <button type="button" v-bind="triggerProps">Default Theme</button>
          </BDropdown>
        </div>

        <div class="custom-dropdown-theme-1">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Purple accent</p>
          <BDropdown trigger="click" :menu="menu" v-slot="{ triggerProps }">
            <button type="button" v-bind="triggerProps">Purple Theme</button>
          </BDropdown>
        </div>

        <div class="custom-dropdown-theme-2">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Compact</p>
          <BDropdown trigger="click" :menu="menu" v-slot="{ triggerProps }">
            <button type="button" v-bind="triggerProps">Compact Theme</button>
          </BDropdown>
        </div>

        <div class="custom-dropdown-theme-3">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Large rounded</p>
          <BDropdown trigger="click" :menu="menu" v-slot="{ triggerProps }">
            <button type="button" v-bind="triggerProps">Large Rounded</button>
          </BDropdown>
        </div>
      </div>

      <style>
        .custom-dropdown-theme-1 .b-dropdown {
          --b-dropdown-item-selected-bg: #f3e8ff;
          --b-dropdown-item-selected-color: #7c3aed;
          --b-dropdown-item-hover-bg: #faf5ff;
        }
        .custom-dropdown-theme-2 .b-dropdown {
          --b-dropdown-padding-block: 2px;
          --b-dropdown-item-padding-y: 2px;
          --b-dropdown-item-padding-x: 8px;
          --b-dropdown-font-size: 12px;
          --b-dropdown-border-radius: 4px;
        }
        .custom-dropdown-theme-3 .b-dropdown {
          --b-dropdown-border-radius: 16px;
          --b-dropdown-item-border-radius: 12px;
          --b-dropdown-item-padding-y: 10px;
          --b-dropdown-font-size: 16px;
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
  { token: '--b-dropdown-padding-block', defaultValue: '0.25rem', description: 'Vertical padding of the dropdown menu container.' },
  { token: '--b-dropdown-z-index', defaultValue: '1050', description: 'z-index of the dropdown popup.' },
  { token: '--b-dropdown-bg', defaultValue: 'oklch(100% 0 0)', description: 'Background color of the dropdown menu.' },
  { token: '--b-dropdown-color', defaultValue: 'oklch(20% 0.005 260 / 88%)', description: 'Default text color of menu items.' },
  { token: '--b-dropdown-border-radius', defaultValue: '0.5rem', description: 'Corner radius of the dropdown container.' },
  { token: '--b-dropdown-shadow', defaultValue: '0 6px 16px 0 oklch(0% 0 0 / 8%)', description: 'Box shadow under the dropdown.' },
  { token: '--b-dropdown-min-width', defaultValue: '8rem', description: 'Minimum width of the dropdown.' },
  { token: '--b-dropdown-max-width', defaultValue: '20rem', description: 'Maximum width of the dropdown.' },
  { token: '--b-dropdown-font-size', defaultValue: '0.875rem', description: 'Font size of menu items.' },
  { token: '--b-dropdown-line-height', defaultValue: '1.5', description: 'Line height of menu items.' },
  { token: '--b-dropdown-gap', defaultValue: '0.25rem', description: 'Gap between trigger and dropdown popup.' },
  { token: '--b-dropdown-item-padding-x', defaultValue: '0.75rem', description: 'Horizontal padding of menu items.' },
  { token: '--b-dropdown-item-padding-y', defaultValue: '0.375rem', description: 'Vertical padding of menu items.' },
  { token: '--b-dropdown-item-border-radius', defaultValue: '0.375rem', description: 'Corner radius of menu items.' },
  { token: '--b-dropdown-item-color', defaultValue: 'oklch(20% 0.005 260 / 88%)', description: 'Text color of menu items.' },
  { token: '--b-dropdown-item-hover-bg', defaultValue: 'oklch(0% 0 0 / 4%)', description: 'Background when hovering a menu item.' },
  { token: '--b-dropdown-item-active-bg', defaultValue: 'oklch(0% 0 0 / 6%)', description: 'Background when activating a menu item.' },
  { token: '--b-dropdown-item-selected-bg', defaultValue: 'oklch(95% 0.04 240)', description: 'Background of the selected menu item.' },
  { token: '--b-dropdown-item-selected-color', defaultValue: 'oklch(62.3% 0.214 259.815)', description: 'Text color of the selected menu item.' },
  { token: '--b-dropdown-item-disabled-color', defaultValue: 'oklch(20% 0.005 260 / 25%)', description: 'Text color of disabled menu items.' },
  { token: '--b-dropdown-item-danger-color', defaultValue: 'oklch(60% 0.22 25)', description: 'Text color of danger menu items.' },
  { token: '--b-dropdown-item-danger-hover-bg', defaultValue: 'oklch(95% 0.04 25)', description: 'Hover background of danger menu items.' },
  { token: '--b-dropdown-item-icon-size', defaultValue: '1rem', description: 'Size of icons inside menu items.' },
  { token: '--b-dropdown-item-icon-margin-right', defaultValue: '0.5rem', description: 'Margin between icon and label.' },
  { token: '--b-dropdown-divider-color', defaultValue: 'oklch(0% 0 0 / 6%)', description: 'Color of menu dividers.' },
  { token: '--b-dropdown-divider-margin', defaultValue: '0.25rem 0', description: 'Margin around menu dividers.' },
  { token: '--b-dropdown-group-title-color', defaultValue: 'oklch(20% 0.005 260 / 45%)', description: 'Text color of menu group titles.' },
  { token: '--b-dropdown-group-title-font-size', defaultValue: '0.75rem', description: 'Font size of menu group titles.' },
  { token: '--b-dropdown-group-title-padding', defaultValue: '0.25rem 0.75rem', description: 'Padding of menu group titles.' },
  { token: '--b-dropdown-transition-duration', defaultValue: '200ms', description: 'Open/close animation duration.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'All scoped CSS variables exposed by <code>BDropdown</code>. Override on <code>.b-dropdown</code> (or any ancestor selector) to retheme the popup.',
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
