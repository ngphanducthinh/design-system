import { BDropdown } from '@/components';
import type { BDropdownMenuProps } from '@/components/BDropdown/types.ts';
import { BDropdownPlacement, BDropdownTrigger } from '@/components/BDropdown/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Navigation/Dropdown',
  component: BDropdown,
  tags: ['autodocs'],
  argTypes: {
    trigger: {
      control: 'select',
      options: Object.values(BDropdownTrigger),
      description: 'The trigger mode which executes the dropdown action.',
      table: { defaultValue: { summary: BDropdownTrigger.Hover } },
    },
    placement: {
      control: 'select',
      options: Object.values(BDropdownPlacement),
      description: 'Placement of popup menu.',
      table: { defaultValue: { summary: BDropdownPlacement.BottomLeft } },
    },
    arrow: {
      control: 'boolean',
      description: 'Whether to show the dropdown chevron indicator next to the trigger.',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the dropdown menu is disabled.',
      table: { defaultValue: { summary: 'false' } },
    },
    destroyOnHidden: {
      control: 'boolean',
      description: 'Whether to destroy popup on hide.',
      table: { defaultValue: { summary: 'false' } },
    },
    mouseEnterDelay: {
      control: 'number',
      description: 'Delay in ms before showing on mouseenter.',
      table: { defaultValue: { summary: '100' } },
    },
    mouseLeaveDelay: {
      control: 'number',
      description: 'Delay in ms before hiding on mouseleave.',
      table: { defaultValue: { summary: '100' } },
    },
    modelValue: {
      control: 'boolean',
      description: 'Controlled open state (bind with v-model).',
      table: { category: 'Two-Way Binding Props' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BDropdown</code> component displays a dropdown menu triggered by user interaction.<br><br>' +
          'Supports hover, click, and context menu triggers. Menu items can be grouped, ' +
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

// ═════════════════════════════════════════════
//   STORIES
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 1. Playground
// ─────────────────────────────────────────────
export const Playground: Story = {
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

// ─────────────────────────────────────────────
// 2. Click trigger
// ─────────────────────────────────────────────
export const ClickTrigger: Story = {
  args: {
    trigger: 'click' as const,
    menu: basicMenu,
  },
  render: (args) => ({
    components: { BDropdown },
    setup: () => ({ args }),
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <BDropdown v-bind="args" v-slot="{ triggerProps }">
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

// ─────────────────────────────────────────────
// 3. Context menu trigger
// ─────────────────────────────────────────────
export const ContextMenuTrigger: Story = {
  args: {
    trigger: 'contextMenu' as const,
    menu: basicMenu,
  },
  render: (args) => ({
    components: { BDropdown },
    setup: () => ({ args }),
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <BDropdown v-bind="args" v-slot="{ triggerProps }">
          <div v-bind="triggerProps" role="button" tabindex="0" style="padding: 40px; border: 2px dashed #ccc; border-radius: 8px; text-align: center; color: #666;">
            Right-click this area
          </div>
        </BDropdown>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 4. All placements
// ─────────────────────────────────────────────
export const AllPlacements: Story = {
  render: () => ({
    components: { BDropdown },
    setup: () => {
      const placements = Object.values(BDropdownPlacement);
      const menu = basicMenu;
      return { placements, menu };
    },
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

// ─────────────────────────────────────────────
// 5. With arrow
// ─────────────────────────────────────────────
export const WithArrow: Story = {
  args: {
    arrow: true,
    trigger: 'click' as const,
    menu: basicMenu,
  },
  render: (args) => ({
    components: { BDropdown },
    setup: () => ({ args }),
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <BDropdown v-bind="args" v-slot="{ triggerProps }">
          <button type="button" v-bind="triggerProps">With Arrow</button>
        </BDropdown>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 6. Grouped menu
// ─────────────────────────────────────────────
export const GroupedMenu: Story = {
  args: {
    trigger: 'click' as const,
    menu: groupedMenu,
  },
  render: (args) => ({
    components: { BDropdown },
    setup: () => ({ args }),
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <BDropdown v-bind="args" v-slot="{ triggerProps }">
          <button type="button" v-bind="triggerProps">Grouped Items</button>
        </BDropdown>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 7. Selectable menu
// ─────────────────────────────────────────────
export const SelectableMenu: Story = {
  args: {
    trigger: 'click' as const,
    menu: selectableMenu,
  },
  render: (args) => ({
    components: { BDropdown },
    setup: () => ({ args }),
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <BDropdown v-bind="args" v-slot="{ triggerProps }">
          <button type="button" v-bind="triggerProps">Selectable</button>
        </BDropdown>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 8. Accessibility story
// ─────────────────────────────────────────────
export const Accessibility: Story = {
  args: {
    trigger: 'click' as const,
    menu: basicMenu,
  },
  render: (args) => ({
    components: { BDropdown },
    setup: () => ({ args }),
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <BDropdown v-bind="args" v-slot="{ triggerProps }">
          <button type="button" v-bind="triggerProps">Accessible Dropdown</button>
        </BDropdown>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText('Accessible Dropdown');

    // Verify ARIA attributes on the trigger element itself
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    // Open via click
    await userEvent.click(trigger);

    await waitFor(() => {
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });

    // Verify menu element exists with correct role
    await waitFor(() => {
      const menu = document.querySelector('[role="menu"]');
      expect(menu).toBeTruthy();
    });

    // Verify menu items have correct roles
    await waitFor(() => {
      const items = document.querySelectorAll('[role="menuitem"]');
      expect(items.length).toBeGreaterThan(0);

      // Disabled item has aria-disabled
      const disabledItem = Array.from(items).find(
        (el) => el.getAttribute('aria-disabled') === 'true',
      );
      expect(disabledItem).toBeTruthy();
    });
  },
};

// ─────────────────────────────────────────────
// 9. Theming story (CSS vars override)
// ─────────────────────────────────────────────
export const Theming: Story = {
  args: {
    trigger: 'click' as const,
    menu: basicMenu,
  },
  render: (args) => ({
    components: { BDropdown },
    setup: () => ({ args }),
    template: `
      <div style="padding: 100px; display: flex; gap: 40px; flex-wrap: wrap;">
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Default</p>
          <BDropdown v-bind="args" v-slot="{ triggerProps }">
            <button type="button" v-bind="triggerProps">Default Theme</button>
          </BDropdown>
        </div>

        <div class="custom-dropdown-theme-1">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Custom: Purple accent</p>
          <BDropdown v-bind="args" v-slot="{ triggerProps }">
            <button type="button" v-bind="triggerProps">Purple Theme</button>
          </BDropdown>
        </div>

        <div class="custom-dropdown-theme-2">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Custom: Compact</p>
          <BDropdown v-bind="args" v-slot="{ triggerProps }">
            <button type="button" v-bind="triggerProps">Compact Theme</button>
          </BDropdown>
        </div>

        <div class="custom-dropdown-theme-3">
          <p style="margin-bottom: 8px; font-size: 12px; color: #666;">Custom: Large rounded</p>
          <BDropdown v-bind="args" v-slot="{ triggerProps }">
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
// 10. Interaction test: full flow
// ─────────────────────────────────────────────
export const InteractionTest: Story = {
  args: {
    trigger: 'click' as const,
    menu: basicMenu,
  },
  render: (args) => ({
    components: { BDropdown },
    setup: () => {
      const lastClicked = ref('none');
      const onMenuClick = (info: { key: string | number }) => {
        lastClicked.value = String(info.key);
      };
      return { args, lastClicked, onMenuClick };
    },
    template: `
      <div style="padding: 100px; display: flex; flex-direction: column; align-items: center; gap: 16px;">
        <BDropdown v-bind="args" @menu-click="onMenuClick" v-slot="{ triggerProps }">
          <button type="button" data-testid="dropdown-trigger" v-bind="triggerProps">Open Menu</button>
        </BDropdown>
        <p data-testid="last-clicked">Last clicked: {{ lastClicked }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('dropdown-trigger');

    // Initially closed
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    // Open
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });

    // Click first item
    await waitFor(async () => {
      const items = document.querySelectorAll('[role="menuitem"]');
      expect(items.length).toBeGreaterThan(0);
      await userEvent.click(items[0] as HTMLElement);
    });

    // Verify event fired and menu closed
    await waitFor(() => {
      expect(canvas.getByTestId('last-clicked').textContent).toContain('1');
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });
  },
};

// ─────────────────────────────────────────────
// 11. Disabled state
// ─────────────────────────────────────────────
export const Disabled: Story = {
  args: {
    trigger: 'click' as const,
    disabled: true,
    menu: basicMenu,
  },
  render: (args) => ({
    components: { BDropdown },
    setup: () => ({ args }),
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <BDropdown v-bind="args" v-slot="{ triggerProps }">
          <button type="button" v-bind="triggerProps">Disabled Dropdown</button>
        </BDropdown>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 12. Custom overlay slot
// ─────────────────────────────────────────────
export const CustomOverlay: Story = {
  args: {
    trigger: 'click' as const,
  },
  render: (args) => ({
    components: { BDropdown },
    setup: () => ({ args }),
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <BDropdown v-bind="args">
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
