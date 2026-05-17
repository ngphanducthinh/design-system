import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import BMenu from './BMenu.vue';
import type { BMenuItemUnion } from './types';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const basicItems: BMenuItemUnion[] = [
  { key: '1', label: 'Item 1' },
  { key: '2', label: 'Item 2' },
  { key: '3', label: 'Item 3', disabled: true },
];

const nestedItems: BMenuItemUnion[] = [
  { key: '1', label: 'Item 1' },
  {
    key: 'sub1',
    label: 'SubMenu 1',
    children: [
      { key: 'sub1-1', label: 'Sub Item 1' },
      { key: 'sub1-2', label: 'Sub Item 2' },
    ],
  },
  { key: '2', label: 'Item 2' },
];

const groupedItems: BMenuItemUnion[] = [
  {
    type: 'group',
    key: 'group1',
    label: 'Group 1',
    children: [
      { key: 'g1-1', label: 'Group Item 1' },
      { key: 'g1-2', label: 'Group Item 2' },
    ],
  },
  { type: 'divider', key: 'div1' },
  { key: '1', label: 'Regular Item' },
];

const dangerItems: BMenuItemUnion[] = [
  { key: '1', label: 'Normal Item' },
  { key: '2', label: 'Danger Item', danger: true },
];

function mountMenu(props: Record<string, unknown> = {}, slots: Record<string, any> = {}) {
  return mount(BMenu, {
    props: { items: basicItems, ...props },
    slots,
    global: { stubs: {} },
  });
}

// ═════════════════════════════════════════════
//  Tests
// ═════════════════════════════════════════════

describe('BMenu', () => {
  // ─────────────────────────────────────────────
  // Rendering
  // ─────────────────────────────────────────────
  describe('rendering', () => {
    it('renders with default props', () => {
      const wrapper = mountMenu();
      expect(wrapper.find('.b-menu').exists()).toBe(true);
      expect(wrapper.find('.b-menu--inline').exists()).toBe(true);
      expect(wrapper.find('.b-menu--light').exists()).toBe(true);
    });

    it('renders items from items prop', () => {
      const wrapper = mountMenu();
      const items = wrapper.findAll('.b-menu-item');
      expect(items).toHaveLength(3);
      expect(items[0].text()).toContain('Item 1');
      expect(items[1].text()).toContain('Item 2');
      expect(items[2].text()).toContain('Item 3');
    });

    it('renders in horizontal mode', () => {
      const wrapper = mountMenu({ mode: 'horizontal' });
      expect(wrapper.find('.b-menu--horizontal').exists()).toBe(true);
    });

    it('renders in vertical mode', () => {
      const wrapper = mountMenu({ mode: 'vertical' });
      expect(wrapper.find('.b-menu--vertical').exists()).toBe(true);
    });

    it('renders with dark theme', () => {
      const wrapper = mountMenu({ theme: 'dark' });
      expect(wrapper.find('.b-menu--dark').exists()).toBe(true);
      expect(wrapper.find('.b-menu').attributes('data-theme')).toBe('dark');
    });

    it('renders collapsed state in inline mode', () => {
      const wrapper = mountMenu({ inlineCollapsed: true });
      expect(wrapper.find('.b-menu--collapsed').exists()).toBe(true);
    });

    it('renders dividers', () => {
      const wrapper = mountMenu({ items: groupedItems });
      expect(wrapper.find('.b-menu-divider').exists()).toBe(true);
      expect(wrapper.find('[role="separator"]').exists()).toBe(true);
    });

    it('renders dashed dividers', () => {
      const items: BMenuItemUnion[] = [
        { key: '1', label: 'A' },
        { type: 'divider', dashed: true },
        { key: '2', label: 'B' },
      ];
      const wrapper = mountMenu({ items });
      expect(wrapper.find('.b-menu-divider--dashed').exists()).toBe(true);
    });

    it('renders item groups', () => {
      const wrapper = mountMenu({ items: groupedItems });
      expect(wrapper.find('.b-menu-item-group').exists()).toBe(true);
      expect(wrapper.find('.b-menu-item-group__title').text()).toContain('Group 1');
    });

    it('renders submenus', () => {
      const wrapper = mountMenu({ items: nestedItems });
      expect(wrapper.find('.b-menu-submenu').exists()).toBe(true);
      expect(wrapper.find('.b-menu-submenu__title').text()).toContain('SubMenu 1');
    });

    it('renders danger items', () => {
      const wrapper = mountMenu({ items: dangerItems });
      expect(wrapper.find('.b-menu-item--danger').exists()).toBe(true);
    });

    it('renders disabled items', () => {
      const wrapper = mountMenu();
      const disabledItem = wrapper.findAll('.b-menu-item')[2];
      expect(disabledItem.classes()).toContain('b-menu-item--disabled');
      expect(disabledItem.attributes('aria-disabled')).toBe('true');
      expect(disabledItem.attributes('tabindex')).toBe('-1');
    });

    it('renders item with icon', () => {
      const items: BMenuItemUnion[] = [{ key: '1', label: 'Home', icon: '🏠' }];
      const wrapper = mountMenu({ items });
      expect(wrapper.find('.b-menu-item__icon').exists()).toBe(true);
      expect(wrapper.find('.b-menu-item__icon').text()).toBe('🏠');
    });

    it('renders item with extra content', () => {
      const items: BMenuItemUnion[] = [{ key: '1', label: 'File', extra: 'Ctrl+N' }];
      const wrapper = mountMenu({ items });
      expect(wrapper.find('.b-menu-item__extra').text()).toBe('Ctrl+N');
    });

    it('hides labels when collapsed', () => {
      const wrapper = mountMenu({ inlineCollapsed: true });
      expect(wrapper.find('.b-menu-item__label').exists()).toBe(false);
    });
  });

  // ─────────────────────────────────────────────
  // Selection
  // ─────────────────────────────────────────────
  describe('selection', () => {
    it('selects item on click (uncontrolled)', async () => {
      const wrapper = mountMenu();
      const item = wrapper.findAll('.b-menu-item')[0];
      await item.trigger('click');
      expect(item.classes()).toContain('b-menu-item--selected');
    });

    it('emits select and click events', async () => {
      const wrapper = mountMenu();
      const item = wrapper.findAll('.b-menu-item')[0];
      await item.trigger('click');
      expect(wrapper.emitted('click')).toBeTruthy();
      expect(wrapper.emitted('select')).toBeTruthy();
      expect(wrapper.emitted('click')![0][0]).toMatchObject({ key: '1' });
    });

    it('emits update:selectedKeys', async () => {
      const wrapper = mountMenu();
      await wrapper.findAll('.b-menu-item')[0].trigger('click');
      expect(wrapper.emitted('update:selectedKeys')![0][0]).toEqual(['1']);
    });

    it('supports controlled selectedKeys', async () => {
      const wrapper = mountMenu({ selectedKeys: ['2'] });
      const items = wrapper.findAll('.b-menu-item');
      expect(items[1].classes()).toContain('b-menu-item--selected');
      expect(items[0].classes()).not.toContain('b-menu-item--selected');
    });

    it('supports defaultSelectedKeys (uncontrolled)', () => {
      const wrapper = mountMenu({ defaultSelectedKeys: ['1'] });
      expect(wrapper.findAll('.b-menu-item')[0].classes()).toContain('b-menu-item--selected');
    });

    it('supports multiple selection', async () => {
      const wrapper = mountMenu({ multiple: true });
      const items = wrapper.findAll('.b-menu-item');

      await items[0].trigger('click');
      await items[1].trigger('click');

      expect(items[0].classes()).toContain('b-menu-item--selected');
      expect(items[1].classes()).toContain('b-menu-item--selected');
    });

    it('emits deselect on second click in multiple mode', async () => {
      const wrapper = mountMenu({ multiple: true, defaultSelectedKeys: ['1'] });
      await wrapper.findAll('.b-menu-item')[0].trigger('click');
      expect(wrapper.emitted('deselect')).toBeTruthy();
    });

    it('does not select when selectable is false', async () => {
      const wrapper = mountMenu({ selectable: false });
      await wrapper.findAll('.b-menu-item')[0].trigger('click');
      expect(wrapper.emitted('select')).toBeUndefined();
      expect(wrapper.emitted('click')).toBeTruthy();
    });

    it('does not select disabled items', async () => {
      const wrapper = mountMenu();
      const disabledItem = wrapper.findAll('.b-menu-item')[2];
      await disabledItem.trigger('click');
      expect(wrapper.emitted('click')).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────
  // SubMenu open/close
  // ─────────────────────────────────────────────
  describe('submenu', () => {
    it('opens submenu on title click (inline mode)', async () => {
      const wrapper = mountMenu({ items: nestedItems });
      const title = wrapper.find('.b-menu-submenu__title');
      await title.trigger('click');
      expect(wrapper.find('.b-menu-submenu__inline--open').exists()).toBe(true);
    });

    it('emits openChange when submenu opens', async () => {
      const wrapper = mountMenu({ items: nestedItems });
      await wrapper.find('.b-menu-submenu__title').trigger('click');
      expect(wrapper.emitted('openChange')).toBeTruthy();
      expect(wrapper.emitted('openChange')![0][0]).toContain('sub1');
    });

    it('emits update:openKeys when submenu opens', async () => {
      const wrapper = mountMenu({ items: nestedItems });
      await wrapper.find('.b-menu-submenu__title').trigger('click');
      expect(wrapper.emitted('update:openKeys')![0][0]).toContain('sub1');
    });

    it('supports defaultOpenKeys', () => {
      const wrapper = mountMenu({ items: nestedItems, defaultOpenKeys: ['sub1'] });
      expect(wrapper.find('.b-menu-submenu__inline--open').exists()).toBe(true);
    });

    it('supports controlled openKeys', () => {
      const wrapper = mountMenu({ items: nestedItems, openKeys: ['sub1'] });
      expect(wrapper.find('.b-menu-submenu__inline--open').exists()).toBe(true);
    });

    it('closes submenu on second title click', async () => {
      const wrapper = mountMenu({ items: nestedItems, defaultOpenKeys: ['sub1'] });
      await wrapper.find('.b-menu-submenu__title').trigger('click');
      expect(wrapper.find('.b-menu-submenu__inline--open').exists()).toBe(false);
    });

    it('disabled submenu does not open', async () => {
      const items: BMenuItemUnion[] = [
        {
          key: 'sub',
          label: 'Disabled Sub',
          disabled: true,
          children: [{ key: '1', label: 'Child' }],
        },
      ];
      const wrapper = mountMenu({ items });
      await wrapper.find('.b-menu-submenu__title').trigger('click');
      expect(wrapper.find('.b-menu-submenu__inline--open').exists()).toBe(false);
    });

    it('highlights submenu title when child is selected', () => {
      const wrapper = mountMenu({ items: nestedItems, selectedKeys: ['sub1-1'] });
      expect(wrapper.find('.b-menu-submenu__title--selected').exists()).toBe(true);
    });
  });

  // ─────────────────────────────────────────────
  // Keyboard
  // ─────────────────────────────────────────────
  describe('keyboard', () => {
    it('selects item on Enter key', async () => {
      const wrapper = mountMenu();
      const item = wrapper.findAll('.b-menu-item')[0];
      await item.trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('click')).toBeTruthy();
    });

    it('selects item on Space key', async () => {
      const wrapper = mountMenu();
      const item = wrapper.findAll('.b-menu-item')[0];
      await item.trigger('keydown', { key: ' ' });
      expect(wrapper.emitted('click')).toBeTruthy();
    });

    it('does not activate disabled item on Enter', async () => {
      const wrapper = mountMenu();
      const disabledItem = wrapper.findAll('.b-menu-item')[2];
      await disabledItem.trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('click')).toBeUndefined();
    });

    it('opens submenu on Enter key', async () => {
      const wrapper = mountMenu({ items: nestedItems });
      const title = wrapper.find('.b-menu-submenu__title');
      await title.trigger('keydown', { key: 'Enter' });
      expect(wrapper.find('.b-menu-submenu__inline--open').exists()).toBe(true);
    });

    it('opens submenu on Space key', async () => {
      const wrapper = mountMenu({ items: nestedItems });
      const title = wrapper.find('.b-menu-submenu__title');
      await title.trigger('keydown', { key: ' ' });
      expect(wrapper.find('.b-menu-submenu__inline--open').exists()).toBe(true);
    });

    it('closes submenu on Escape key', async () => {
      const wrapper = mountMenu({ items: nestedItems, defaultOpenKeys: ['sub1'] });
      const title = wrapper.find('.b-menu-submenu__title');
      await title.trigger('keydown', { key: 'Escape' });
      expect(wrapper.find('.b-menu-submenu__inline--open').exists()).toBe(false);
    });
  });

  // ─────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────
  describe('accessibility', () => {
    it('has role="menu" on root', () => {
      const wrapper = mountMenu();
      expect(wrapper.find('.b-menu').attributes('role')).toBe('menu');
    });

    it('has aria-orientation based on mode', () => {
      const horizontal = mountMenu({ mode: 'horizontal' });
      expect(horizontal.find('.b-menu').attributes('aria-orientation')).toBe('horizontal');

      const vertical = mountMenu({ mode: 'vertical' });
      expect(vertical.find('.b-menu').attributes('aria-orientation')).toBe('vertical');
    });

    it('menu items have role="menuitemradio" when selectable', () => {
      const wrapper = mountMenu();
      const items = wrapper.findAll('[role="menuitemradio"]');
      expect(items.length).toBeGreaterThan(0);
    });

    it('menu items have role="menuitemcheckbox" when multiple', () => {
      const wrapper = mountMenu({ multiple: true });
      const items = wrapper.findAll('[role="menuitemcheckbox"]');
      expect(items.length).toBeGreaterThan(0);
    });

    it('menu items have role="menuitem" when not selectable', () => {
      const wrapper = mountMenu({ selectable: false });
      const items = wrapper.findAll('.b-menu-item');
      expect(items[0].attributes('role')).toBe('menuitem');
    });

    it('items have correct tabindex', () => {
      const wrapper = mountMenu();
      const items = wrapper.findAll('.b-menu-item');
      expect(items[0].attributes('tabindex')).toBe('0');
      expect(items[2].attributes('tabindex')).toBe('-1'); // disabled
    });

    it('submenu title has aria-haspopup and aria-expanded', () => {
      const wrapper = mountMenu({ items: nestedItems });
      const title = wrapper.find('.b-menu-submenu__title');
      expect(title.attributes('aria-haspopup')).toBe('true');
      expect(title.attributes('aria-expanded')).toBe('false');
    });

    it('submenu title aria-expanded updates when opened', async () => {
      const wrapper = mountMenu({ items: nestedItems });
      const title = wrapper.find('.b-menu-submenu__title');
      await title.trigger('click');
      expect(title.attributes('aria-expanded')).toBe('true');
    });

    it('selected item has aria-checked', () => {
      const wrapper = mountMenu({ selectedKeys: ['1'] });
      const item = wrapper.findAll('.b-menu-item')[0];
      expect(item.attributes('aria-checked')).toBe('true');
    });

    it('divider has role="separator"', () => {
      const wrapper = mountMenu({ items: groupedItems });
      expect(wrapper.find('[role="separator"]').exists()).toBe(true);
    });

    it('group list has role="group" and aria-label', () => {
      const wrapper = mountMenu({ items: groupedItems });
      const groupList = wrapper.find('[role="group"]');
      expect(groupList.exists()).toBe(true);
      expect(groupList.attributes('aria-label')).toBe('Group 1');
    });

    it('icon has aria-hidden', () => {
      const items: BMenuItemUnion[] = [{ key: '1', label: 'Home', icon: '🏠' }];
      const wrapper = mountMenu({ items });
      expect(wrapper.find('.b-menu-item__icon').attributes('aria-hidden')).toBe('true');
    });
  });

  // ─────────────────────────────────────────────
  // Modes
  // ─────────────────────────────────────────────
  describe('modes', () => {
    it('inline mode renders submenu inline', () => {
      const wrapper = mountMenu({ items: nestedItems, defaultOpenKeys: ['sub1'] });
      expect(wrapper.find('.b-menu-submenu__inline').exists()).toBe(true);
      expect(wrapper.find('.b-menu-submenu__popup').exists()).toBe(false);
    });

    it('vertical mode renders submenu as popup', () => {
      const wrapper = mountMenu({ items: nestedItems, mode: 'vertical' });
      expect(wrapper.find('.b-menu-submenu__popup').exists()).toBe(true);
      expect(wrapper.find('.b-menu-submenu__inline').exists()).toBe(false);
    });

    it('horizontal mode renders submenu as popup', () => {
      const wrapper = mountMenu({ items: nestedItems, mode: 'horizontal' });
      expect(wrapper.find('.b-menu-submenu__popup').exists()).toBe(true);
    });

    it('collapsed inline mode renders popup submenu', () => {
      const wrapper = mountMenu({ items: nestedItems, inlineCollapsed: true });
      expect(wrapper.find('.b-menu-submenu__popup').exists()).toBe(true);
    });
  });

  // ─────────────────────────────────────────────
  // Edge cases
  // ─────────────────────────────────────────────
  describe('edge cases', () => {
    it('handles empty items array', () => {
      const wrapper = mountMenu({ items: [] });
      expect(wrapper.find('.b-menu').exists()).toBe(true);
      expect(wrapper.findAll('.b-menu-item')).toHaveLength(0);
    });

    it('renders via slot instead of items prop', () => {
      const wrapper = mount(BMenu, {
        slots: {
          default: `<li class="custom-item">Custom</li>`,
        },
      });
      expect(wrapper.find('.custom-item').exists()).toBe(true);
    });

    it('data-menu-key attribute is set on items', () => {
      const wrapper = mountMenu();
      const item = wrapper.findAll('.b-menu-item')[0];
      expect(item.attributes('data-menu-key')).toBe('1');
    });

    it('emits correct keyPath for nested items', async () => {
      const wrapper = mountMenu({ items: nestedItems, defaultOpenKeys: ['sub1'] });
      const subItems = wrapper.findAll('.b-menu-item');
      // Find the sub-item (Sub Item 1 with key sub1-1)
      const subItem = subItems.find((el) => el.attributes('data-menu-key') === 'sub1-1');
      expect(subItem).toBeTruthy();
      await subItem!.trigger('click');
      const clickEvent = wrapper.emitted('click')![0][0] as { keyPath: string[] };
      expect(clickEvent.keyPath).toContain('sub1');
      expect(clickEvent.keyPath).toContain('sub1-1');
    });
  });
});
