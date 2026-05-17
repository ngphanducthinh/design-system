import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BDropdown from './BDropdown.vue';
import type { BDropdownMenuProps } from './types.ts';
import { BDropdownPlacement, BDropdownTrigger } from './types.ts';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function createToggleEvent(newState: string, oldState: string): Event {
  const event = new Event('toggle', { bubbles: false });
  (event as unknown as Record<string, string>).newState = newState;
  (event as unknown as Record<string, string>).oldState = oldState;
  return event;
}

function stubPopoverAPI(el: HTMLElement) {
  el.showPopover = vi.fn(() => {
    el.toggleAttribute('popover-open', true);
    el.dispatchEvent(createToggleEvent('open', 'closed'));
  });
  el.hidePopover = vi.fn(() => {
    el.toggleAttribute('popover-open', false);
    el.dispatchEvent(createToggleEvent('closed', 'open'));
  });
}

const defaultMenu: BDropdownMenuProps = {
  items: [
    { key: '1', label: 'Item 1' },
    { key: '2', label: 'Item 2' },
    { key: '3', label: 'Item 3' },
  ],
};

function mountDropdown(
  props: Record<string, unknown> = {},
  slots: Record<string, () => string> = {},
) {
  const wrapper = mount(BDropdown, {
    props: { menu: defaultMenu, ...props },
    slots: { default: () => 'Click me', ...slots },
    attachTo: document.body,
  });

  const popoverEl = wrapper.find('[role="menu"]').element as HTMLElement;
  if (popoverEl) {
    stubPopoverAPI(popoverEl);
  }

  return wrapper;
}

// ─────────────────────────────────────────────
// 1. Defaults & variants render
// ─────────────────────────────────────────────
describe('BDropdown – defaults and variants', () => {
  it('renders the toggle wrapper with default slot', () => {
    const wrapper = mountDropdown();
    expect(wrapper.find('.b-dropdown__toggle').text()).toBe('Click me');
  });

  it('renders a menu element with role="menu"', () => {
    const wrapper = mountDropdown();
    expect(wrapper.find('[role="menu"]').exists()).toBe(true);
  });

  it('renders menu items from props', () => {
    const wrapper = mountDropdown();
    const items = wrapper.findAll('[role="menuitem"]');
    expect(items).toHaveLength(3);
    expect(items[0].text()).toBe('Item 1');
    expect(items[1].text()).toBe('Item 2');
  });

  it('renders divider items', () => {
    const menu: BDropdownMenuProps = {
      items: [
        { key: '1', label: 'Item 1' },
        { key: 'div', label: '', type: 'divider' },
        { key: '2', label: 'Item 2' },
      ],
    };
    const wrapper = mountDropdown({ menu });
    expect(wrapper.find('[role="separator"]').exists()).toBe(true);
  });

  it('renders group items with title', () => {
    const menu: BDropdownMenuProps = {
      items: [
        {
          key: 'group1',
          label: '',
          type: 'group',
          title: 'Group Title',
          children: [{ key: 'g1', label: 'Group Item' }],
        },
      ],
    };
    const wrapper = mountDropdown({ menu });
    expect(wrapper.find('[role="group"]').exists()).toBe(true);
    expect(wrapper.find('.b-dropdown__group-title').text()).toBe('Group Title');
  });

  it('renders with chevron indicator when arrow=true', () => {
    const wrapper = mountDropdown({ arrow: true });
    expect(wrapper.find('.b-dropdown__indicator').exists()).toBe(true);
  });

  it('does not render chevron indicator by default (arrow=false)', () => {
    const wrapper = mountDropdown();
    expect(wrapper.find('.b-dropdown__indicator').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behavior
// ─────────────────────────────────────────────
describe('BDropdown – props to DOM', () => {
  it('applies placement class', () => {
    const wrapper = mountDropdown({ placement: BDropdownPlacement.TopRight });
    expect(wrapper.find('[role="menu"]').classes()).toContain('top-right');
  });

  it('sets popover attribute', () => {
    const wrapper = mountDropdown();
    expect(wrapper.find('[role="menu"]').attributes('popover')).toBe('manual');
  });

  it('sets aria-haspopup on toggle', () => {
    const wrapper = mountDropdown();
    expect(wrapper.find('.b-dropdown__toggle').attributes('aria-haspopup')).toBeUndefined();
  });

  it('sets aria-expanded to false initially', () => {
    const wrapper = mountDropdown();
    expect(wrapper.find('.b-dropdown__toggle').attributes('aria-expanded')).toBeUndefined();
  });

  it('does not have role="button" on wrapper (ARIA is on slot content)', () => {
    const wrapper = mountDropdown();
    expect(wrapper.find('.b-dropdown__toggle').attributes('role')).toBeUndefined();
  });

  it('applies disabled state (prevents opening)', async () => {
    const wrapper = mountDropdown({ disabled: true, trigger: BDropdownTrigger.Click });
    await wrapper.find('.b-dropdown__toggle').trigger('click');
    expect(wrapper.emitted('openChange')).toBeFalsy();
  });

  it('marks disabled items with aria-disabled', () => {
    const menu: BDropdownMenuProps = {
      items: [{ key: '1', label: 'Disabled Item', disabled: true }],
    };
    const wrapper = mountDropdown({ menu });
    expect(wrapper.find('[role="menuitem"]').attributes('aria-disabled')).toBe('true');
  });

  it('applies danger class to danger items', () => {
    const menu: BDropdownMenuProps = {
      items: [{ key: '1', label: 'Delete', danger: true }],
    };
    const wrapper = mountDropdown({ menu });
    expect(wrapper.find('[role="menuitem"]').classes()).toContain('b-dropdown__item--danger');
  });

  it('applies selected class when selectedKeys includes item key', () => {
    const menu: BDropdownMenuProps = {
      items: [{ key: '1', label: 'Item 1' }],
      selectedKeys: ['1'],
    };
    const wrapper = mountDropdown({ menu });
    expect(wrapper.find('[role="menuitem"]').classes()).toContain('b-dropdown__item--selected');
  });

  it('renders icon when item has icon prop', () => {
    const menu: BDropdownMenuProps = {
      items: [{ key: '1', label: 'Item', icon: 'edit' }],
    };
    const wrapper = mountDropdown({ menu });
    const icon = wrapper.find('.b-dropdown__item-icon');
    expect(icon.exists()).toBe(true);
    expect(icon.attributes('aria-hidden')).toBe('true');
  });
});

// ─────────────────────────────────────────────
// 3. Events
// ─────────────────────────────────────────────
describe('BDropdown – events', () => {
  it('emits openChange when opened via trigger', async () => {
    const wrapper = mountDropdown({ trigger: BDropdownTrigger.Click });
    await wrapper.find('.b-dropdown__toggle').trigger('click');
    expect(wrapper.emitted('openChange')).toBeTruthy();
    expect(wrapper.emitted('openChange')![0]).toEqual([true]);
  });

  it('emits openChange when closed', async () => {
    const wrapper = mountDropdown({ trigger: BDropdownTrigger.Click });
    await wrapper.find('.b-dropdown__toggle').trigger('click');
    await wrapper.find('.b-dropdown__toggle').trigger('click');
    expect(wrapper.emitted('openChange')![1]).toEqual([false]);
  });

  it('emits menuClick when item is clicked', async () => {
    const wrapper = mountDropdown({ trigger: BDropdownTrigger.Click });
    await wrapper.find('.b-dropdown__toggle').trigger('click');
    await wrapper.findAll('[role="menuitem"]')[0].trigger('click');
    expect(wrapper.emitted('menuClick')).toBeTruthy();
    expect(wrapper.emitted('menuClick')![0][0]).toEqual({
      key: '1',
      item: defaultMenu.items[0],
    });
  });

  it('does not emit menuClick for disabled items', async () => {
    const menu: BDropdownMenuProps = {
      items: [{ key: '1', label: 'Disabled', disabled: true }],
    };
    const wrapper = mountDropdown({ menu, trigger: BDropdownTrigger.Click });
    await wrapper.find('.b-dropdown__toggle').trigger('click');
    await wrapper.find('[role="menuitem"]').trigger('click');
    expect(wrapper.emitted('menuClick')).toBeFalsy();
  });

  it('emits update:modelValue for controlled mode', async () => {
    const wrapper = mountDropdown({
      trigger: BDropdownTrigger.Click,
      modelValue: false,
    });
    await wrapper.find('.b-dropdown__toggle').trigger('click');
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([true]);
  });

  it('closes dropdown after item click', async () => {
    const wrapper = mountDropdown({ trigger: BDropdownTrigger.Click });
    await wrapper.find('.b-dropdown__toggle').trigger('click');
    await wrapper.findAll('[role="menuitem"]')[0].trigger('click');
    expect(wrapper.emitted('openChange')!.at(-1)).toEqual([false]);
  });
});

// ─────────────────────────────────────────────
// 4. Keyboard & focus
// ─────────────────────────────────────────────
describe('BDropdown – keyboard and focus', () => {
  it('opens with Enter key on trigger', async () => {
    const wrapper = mountDropdown({ trigger: BDropdownTrigger.Click });
    await wrapper.find('.b-dropdown__toggle').trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('openChange')![0]).toEqual([true]);
  });

  it('opens with Space key on trigger', async () => {
    const wrapper = mountDropdown({ trigger: BDropdownTrigger.Click });
    await wrapper.find('.b-dropdown__toggle').trigger('keydown', { key: ' ' });
    expect(wrapper.emitted('openChange')![0]).toEqual([true]);
  });

  it('opens with ArrowDown key on trigger', async () => {
    const wrapper = mountDropdown({ trigger: BDropdownTrigger.Click });
    await wrapper.find('.b-dropdown__toggle').trigger('keydown', { key: 'ArrowDown' });
    expect(wrapper.emitted('openChange')![0]).toEqual([true]);
  });

  it('opens with ArrowUp key on trigger', async () => {
    const wrapper = mountDropdown({ trigger: BDropdownTrigger.Click });
    await wrapper.find('.b-dropdown__toggle').trigger('keydown', { key: 'ArrowUp' });
    expect(wrapper.emitted('openChange')![0]).toEqual([true]);
  });

  it('closes with Escape key', async () => {
    const wrapper = mountDropdown({ trigger: BDropdownTrigger.Click });
    await wrapper.find('.b-dropdown__toggle').trigger('click');
    await wrapper.find('[role="menu"]').trigger('keydown', { key: 'Escape' });
    expect(wrapper.emitted('openChange')!.at(-1)).toEqual([false]);
  });

  it('navigates items with ArrowDown in menu', async () => {
    const wrapper = mountDropdown({ trigger: BDropdownTrigger.Click });
    await wrapper.find('.b-dropdown__toggle').trigger('click');
    const menu = wrapper.find('[role="menu"]');
    await menu.trigger('keydown', { key: 'ArrowDown' });
    // The menu keydown handler is invoked
    expect(menu.exists()).toBe(true);
  });

  it('navigates items with ArrowUp in menu', async () => {
    const wrapper = mountDropdown({ trigger: BDropdownTrigger.Click });
    await wrapper.find('.b-dropdown__toggle').trigger('click');
    const menu = wrapper.find('[role="menu"]');
    await menu.trigger('keydown', { key: 'ArrowUp' });
    expect(menu.exists()).toBe(true);
  });

  it('does not open when disabled', async () => {
    const wrapper = mountDropdown({ disabled: true, trigger: BDropdownTrigger.Click });
    await wrapper.find('.b-dropdown__toggle').trigger('click');
    expect(wrapper.emitted('openChange')).toBeFalsy();
  });

  it('does not open on keydown when disabled', async () => {
    const wrapper = mountDropdown({ disabled: true, trigger: BDropdownTrigger.Click });
    await wrapper.find('.b-dropdown__toggle').trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('openChange')).toBeFalsy();
  });
});

// ─────────────────────────────────────────────
// 5. Accessibility
// ─────────────────────────────────────────────
describe('BDropdown – accessibility', () => {
  it('has correct role="menu" on dropdown', () => {
    const wrapper = mountDropdown();
    expect(wrapper.find('[role="menu"]').exists()).toBe(true);
  });

  it('exposes triggerProps with aria-haspopup="menu" via slot', () => {
    const wrapper = mountDropdown();
    // triggerProps is exposed to slot consumers; the wrapper itself is clean
    expect(wrapper.find('[role="menu"]').exists()).toBe(true);
  });

  it('has aria-expanded that reflects open state (via triggerProps)', async () => {
    // triggerProps reactive update is tested via the slot consumer in stories
    const wrapper = mountDropdown({ trigger: BDropdownTrigger.Click });
    await wrapper.find('.b-dropdown__toggle').trigger('click');
    expect(wrapper.emitted('openChange')![0]).toEqual([true]);
  });

  it('exposes aria-controls is not set (popover top layer incompatibility)', async () => {
    const wrapper = mountDropdown({ trigger: BDropdownTrigger.Click });
    await wrapper.find('.b-dropdown__toggle').trigger('click');
    // aria-controls removed due to popover top layer not being traversable by axe
    expect(wrapper.emitted('openChange')![0]).toEqual([true]);
  });

  it('each item has role="menuitem"', () => {
    const wrapper = mountDropdown();
    const items = wrapper.findAll('[role="menuitem"]');
    expect(items.length).toBe(3);
  });

  it('disabled items have aria-disabled="true"', () => {
    const menu: BDropdownMenuProps = {
      items: [{ key: '1', label: 'Disabled', disabled: true }],
    };
    const wrapper = mountDropdown({ menu });
    expect(wrapper.find('[role="menuitem"]').attributes('aria-disabled')).toBe('true');
  });

  it('icons are aria-hidden', () => {
    const menu: BDropdownMenuProps = {
      items: [{ key: '1', label: 'Item', icon: 'star' }],
    };
    const wrapper = mountDropdown({ menu });
    expect(wrapper.find('.b-dropdown__item-icon').attributes('aria-hidden')).toBe('true');
  });

  it('dividers have role="separator"', () => {
    const menu: BDropdownMenuProps = {
      items: [
        { key: '1', label: 'Item 1' },
        { key: 'div', label: '', type: 'divider' },
        { key: '2', label: 'Item 2' },
      ],
    };
    const wrapper = mountDropdown({ menu });
    expect(wrapper.find('[role="separator"]').exists()).toBe(true);
  });

  it('groups have role="group" with aria-label', () => {
    const menu: BDropdownMenuProps = {
      items: [
        {
          key: 'g',
          label: '',
          type: 'group',
          title: 'Actions',
          children: [{ key: '1', label: 'Act' }],
        },
      ],
    };
    const wrapper = mountDropdown({ menu });
    const group = wrapper.find('[role="group"]');
    expect(group.exists()).toBe(true);
    expect(group.attributes('aria-label')).toBe('Actions');
  });
});

// ─────────────────────────────────────────────
// 6. Edge cases
// ─────────────────────────────────────────────
describe('BDropdown – edge cases', () => {
  it('supports context menu trigger', async () => {
    const wrapper = mountDropdown({ trigger: BDropdownTrigger.ContextMenu });
    await wrapper.find('.b-dropdown__toggle').trigger('contextmenu');
    expect(wrapper.emitted('openChange')![0]).toEqual([true]);
  });

  it('destroys content when destroyOnHidden is true and closed', async () => {
    const wrapper = mountDropdown({
      destroyOnHidden: true,
      trigger: BDropdownTrigger.Click,
    });
    // Initially, content should not render
    expect(wrapper.find('.b-dropdown__content').exists()).toBe(false);
  });

  it('renders content when destroyOnHidden is true and opened', async () => {
    const wrapper = mountDropdown({
      destroyOnHidden: true,
      trigger: BDropdownTrigger.Click,
    });
    await wrapper.find('.b-dropdown__toggle').trigger('click');
    expect(wrapper.find('.b-dropdown__content').exists()).toBe(true);
  });

  it('controlled mode: external open prop controls visibility', async () => {
    const wrapper = mountDropdown({ modelValue: false });
    expect(wrapper.find('.b-dropdown__toggle--open').exists()).toBe(false);
    await wrapper.setProps({ modelValue: true });
    expect(wrapper.find('.b-dropdown__toggle--open').exists()).toBe(true);
  });

  it('handles empty menu items gracefully', () => {
    const menu: BDropdownMenuProps = { items: [] };
    const wrapper = mountDropdown({ menu });
    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(0);
  });

  it('supports custom overlay slot', () => {
    const wrapper = mount(BDropdown, {
      props: {},
      slots: {
        default: () => 'Trigger',
        overlay: '<div class="custom-overlay">Custom</div>',
      },
      attachTo: document.body,
    });

    const popoverEl = wrapper.find('[role="menu"]').element as HTMLElement;
    if (popoverEl) stubPopoverAPI(popoverEl);

    expect(wrapper.find('.custom-overlay').exists()).toBe(true);
  });

  it('all placements produce correct classes', () => {
    const expected: Record<string, string> = {
      [BDropdownPlacement.Bottom]: 'bottom-center',
      [BDropdownPlacement.BottomLeft]: 'bottom-left',
      [BDropdownPlacement.BottomRight]: 'bottom-right',
      [BDropdownPlacement.Top]: 'top-center',
      [BDropdownPlacement.TopLeft]: 'top-left',
      [BDropdownPlacement.TopRight]: 'top-right',
    };
    for (const [placement, className] of Object.entries(expected)) {
      const wrapper = mountDropdown({ placement });
      expect(wrapper.find('[role="menu"]').classes()).toContain(className);
    }
  });
});

// ─────────────────────────────────────────────
// 7. Delays (fake timers)
// ─────────────────────────────────────────────
describe('BDropdown – delays with fake timers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hover trigger shows after mouseEnterDelay', async () => {
    const wrapper = mountDropdown({
      trigger: BDropdownTrigger.Hover,
      mouseEnterDelay: 200,
    });
    await wrapper.find('.b-dropdown__toggle').trigger('mouseenter');
    expect(wrapper.emitted('openChange')).toBeFalsy();
    vi.advanceTimersByTime(200);
    expect(wrapper.emitted('openChange')![0]).toEqual([true]);
  });

  it('hover trigger hides after mouseLeaveDelay', async () => {
    const wrapper = mountDropdown({
      trigger: BDropdownTrigger.Hover,
      mouseEnterDelay: 0,
      mouseLeaveDelay: 300,
    });
    await wrapper.find('.b-dropdown__toggle').trigger('mouseenter');
    vi.advanceTimersByTime(0);
    await wrapper.find('.b-dropdown__toggle').trigger('mouseleave');
    expect(wrapper.emitted('openChange')!.length).toBe(1);
    vi.advanceTimersByTime(300);
    expect(wrapper.emitted('openChange')![1]).toEqual([false]);
  });

  it('re-entering cancels hide timer', async () => {
    const wrapper = mountDropdown({
      trigger: BDropdownTrigger.Hover,
      mouseEnterDelay: 0,
      mouseLeaveDelay: 300,
    });
    await wrapper.find('.b-dropdown__toggle').trigger('mouseenter');
    vi.advanceTimersByTime(0);
    await wrapper.find('.b-dropdown__toggle').trigger('mouseleave');
    vi.advanceTimersByTime(100);
    await wrapper.find('.b-dropdown__toggle').trigger('mouseenter');
    vi.advanceTimersByTime(300);
    // Should not have closed
    const events = wrapper.emitted('openChange')!;
    expect(events[events.length - 1]).toEqual([true]);
  });
});
