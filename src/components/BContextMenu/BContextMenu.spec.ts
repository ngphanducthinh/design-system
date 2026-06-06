import { mount, flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import BContextMenu from './BContextMenu.vue';
import type { BContextMenuItem } from './types';

/**
 * BContextMenu renders its panel through `<Teleport to="body">`. We mount with
 * `attachTo: document.body` so the teleport target is available and DOM
 * queries can find the menu list.
 *
 * jsdom doesn't perform layout, so any test that depends on
 * `getBoundingClientRect` mocks the element's bounding box.
 */
function makeItems(spy: ReturnType<typeof vi.fn> = vi.fn()): BContextMenuItem[] {
  return [
    { key: 'copy', label: 'Copy', icon: 'copy' },
    { key: 'paste', label: 'Paste', onSelect: spy },
    { key: 'd1', divider: true },
    { key: 'rename', label: 'Rename', disabled: true },
    { key: 'delete', label: 'Delete', danger: true },
  ];
}

type MenuApi = { open: (x: number, y: number) => void; close: () => void };

/**
 * Mount BContextMenu inside a wrapper component that renders a slotted
 * trigger area — the component listens for `contextmenu` on its outer wrapper
 * which already contains the slot, so we just need a child to right-click.
 */
function mountWithTrigger(props: Record<string, unknown> = {}) {
  return mount(
    defineComponent({
      components: { BContextMenu },
      props: { p: { type: Object, default: () => ({}) } },
      setup(p, { emit, expose }) {
        const menuRef = ref<unknown>(null);
        expose({ menuRef });
        return () =>
          h(
            BContextMenu as unknown as ReturnType<typeof defineComponent>,
            {
              ...(p.p as Record<string, unknown>),
              ref: menuRef,
              onSelect: (item: BContextMenuItem, event: Event) =>
                emit('select', item, event),
              onOpen: (e: MouseEvent) => emit('open', e),
              onClose: () => emit('close'),
            },
            {
              default: () => h('div', { class: 'trigger-area' }, 'Right-click me'),
            },
          );
      },
    }),
    { props: { p: props }, attachTo: document.body },
  );
}

describe('BContextMenu', () => {
  const wrappers: Array<{ unmount: () => void }> = [];

  const track = <T extends { unmount: () => void }>(w: T): T => {
    wrappers.push(w);
    return w;
  };

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    while (wrappers.length) {
      try {
        wrappers.pop()!.unmount();
      } catch {
        // ignore
      }
    }
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  describe('rendering & defaults', () => {
    it('renders the trigger but no menu when closed', () => {
      track(mountWithTrigger({ items: makeItems() }));
      expect(document.querySelector('.b-context-menu')).not.toBeNull();
      expect(document.querySelector('[role="menu"]')).toBeNull();
    });

    it('contextmenu event opens the menu at cursor coordinates', async () => {
      track(mountWithTrigger({ items: makeItems() }));
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(
        new MouseEvent('contextmenu', { clientX: 50, clientY: 80, bubbles: true, cancelable: true }),
      );
      await flushPromises();
      const menu = document.querySelector<HTMLElement>('[role="menu"]');
      expect(menu).not.toBeNull();
      expect(menu!.style.left).toBe('50px');
      expect(menu!.style.top).toBe('80px');
    });

    it('uses the default aria-label', async () => {
      track(mountWithTrigger({ items: makeItems() }));
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 0, clientY: 0, bubbles: true, cancelable: true }));
      await flushPromises();
      const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
      expect(menu.getAttribute('aria-label')).toBe('Context menu');
      expect(menu.getAttribute('aria-orientation')).toBe('vertical');
    });

    it('honours a custom aria-label', async () => {
      track(mountWithTrigger({ items: makeItems(), ariaLabel: 'File actions' }));
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 0, clientY: 0, bubbles: true, cancelable: true }));
      await flushPromises();
      const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
      expect(menu.getAttribute('aria-label')).toBe('File actions');
    });

    it('renders an item per non-divider entry plus dividers', async () => {
      track(mountWithTrigger({ items: makeItems() }));
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 0, clientY: 0, bubbles: true, cancelable: true }));
      await flushPromises();
      const items = document.querySelectorAll('[role="menuitem"]');
      expect(items).toHaveLength(4);
      const dividers = document.querySelectorAll('[role="separator"]');
      expect(dividers).toHaveLength(1);
    });

    it('renders danger styling on items with `danger: true`', async () => {
      track(mountWithTrigger({ items: makeItems() }));
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 0, clientY: 0, bubbles: true, cancelable: true }));
      await flushPromises();
      const danger = document.querySelector('.b-context-menu__item--danger');
      expect(danger).not.toBeNull();
      expect(danger?.textContent).toContain('Delete');
    });

    it('renders disabled items with aria-disabled="true"', async () => {
      track(mountWithTrigger({ items: makeItems() }));
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 0, clientY: 0, bubbles: true, cancelable: true }));
      await flushPromises();
      const disabled = Array.from(document.querySelectorAll('[role="menuitem"]')).find(
        (el) => el.textContent?.includes('Rename'),
      );
      expect(disabled).toBeTruthy();
      expect(disabled!.getAttribute('aria-disabled')).toBe('true');
    });

    it('does not open when `disabled` prop is true', async () => {
      track(mountWithTrigger({ items: makeItems(), disabled: true }));
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 0, clientY: 0, bubbles: true, cancelable: true }));
      await flushPromises();
      expect(document.querySelector('[role="menu"]')).toBeNull();
    });

    it('handles an empty items array (renders empty menu)', async () => {
      track(mountWithTrigger({ items: [] as BContextMenuItem[] }));
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 0, clientY: 0, bubbles: true, cancelable: true }));
      await flushPromises();
      const menu = document.querySelector<HTMLElement>('[role="menu"]');
      expect(menu).not.toBeNull();
      expect(menu!.querySelectorAll('[role="menuitem"]')).toHaveLength(0);
    });
  });

  describe('keyboard navigation', () => {
    it('first activatable item is active on open', async () => {
      track(mountWithTrigger({ items: makeItems() }));
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 0, clientY: 0, bubbles: true, cancelable: true }));
      await flushPromises();
      const items = document.querySelectorAll<HTMLElement>('[role="menuitem"]');
      // Items in DOM order: Copy, Paste, Rename(disabled), Delete
      expect(items[0]?.classList.contains('b-context-menu__item--active')).toBe(true);
    });

    it('ArrowDown skips dividers and disabled items', async () => {
      track(mountWithTrigger({ items: makeItems() }));
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 0, clientY: 0, bubbles: true, cancelable: true }));
      await flushPromises();
      const menu = document.querySelector<HTMLElement>('[role="menu"]')!;

      // Start: Copy active.
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await flushPromises();
      let items = document.querySelectorAll<HTMLElement>('[role="menuitem"]');
      // Order: Copy, Paste, Rename(disabled), Delete → ArrowDown lands on Paste.
      expect(items[1]?.classList.contains('b-context-menu__item--active')).toBe(true);

      // ArrowDown again — skips divider + disabled Rename → lands on Delete.
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await flushPromises();
      items = document.querySelectorAll<HTMLElement>('[role="menuitem"]');
      expect(items[3]?.classList.contains('b-context-menu__item--active')).toBe(true);

      // ArrowDown wraps to Copy.
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await flushPromises();
      items = document.querySelectorAll<HTMLElement>('[role="menuitem"]');
      expect(items[0]?.classList.contains('b-context-menu__item--active')).toBe(true);
    });

    it('ArrowUp wraps to last activatable from first', async () => {
      track(mountWithTrigger({ items: makeItems() }));
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 0, clientY: 0, bubbles: true, cancelable: true }));
      await flushPromises();
      const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      await flushPromises();
      const items = document.querySelectorAll<HTMLElement>('[role="menuitem"]');
      // Last activatable in DOM is Delete (index 3 in menuitem list).
      expect(items[3]?.classList.contains('b-context-menu__item--active')).toBe(true);
    });

    it('Home goes to first activatable, End to last', async () => {
      track(mountWithTrigger({ items: makeItems() }));
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 0, clientY: 0, bubbles: true, cancelable: true }));
      await flushPromises();
      const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      await flushPromises();
      let items = document.querySelectorAll<HTMLElement>('[role="menuitem"]');
      expect(items[3]?.classList.contains('b-context-menu__item--active')).toBe(true);

      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      await flushPromises();
      items = document.querySelectorAll<HTMLElement>('[role="menuitem"]');
      expect(items[0]?.classList.contains('b-context-menu__item--active')).toBe(true);
    });
  });

  describe('selection', () => {
    it('Enter activates the active item, calls onSelect, emits select, closes', async () => {
      const onSelect = vi.fn();
      const items: BContextMenuItem[] = [
        { key: 'paste', label: 'Paste', onSelect },
        { key: 'copy', label: 'Copy' },
      ];
      const wrapper = track(mountWithTrigger({ items }));
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 0, clientY: 0, bubbles: true, cancelable: true }));
      await flushPromises();
      const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await flushPromises();

      expect(onSelect).toHaveBeenCalledTimes(1);
      const selectEv = wrapper.emitted('select');
      expect(selectEv).toBeTruthy();
      expect((selectEv![0]![0] as BContextMenuItem).key).toBe('paste');
      expect(wrapper.emitted('close')).toBeTruthy();
      expect(document.querySelector('[role="menu"]')).toBeNull();
    });

    it('Space activates like Enter', async () => {
      const onSelect = vi.fn();
      const wrapper = track(
        mountWithTrigger({
          items: [{ key: 'a', label: 'Alpha', onSelect }],
        }),
      );
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 0, clientY: 0, bubbles: true, cancelable: true }));
      await flushPromises();
      const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      await flushPromises();
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(wrapper.emitted('select')).toBeTruthy();
    });

    it('clicking an item activates it', async () => {
      const onSelect = vi.fn();
      const wrapper = track(
        mountWithTrigger({
          items: [
            { key: 'a', label: 'Alpha' },
            { key: 'b', label: 'Beta', onSelect },
          ],
        }),
      );
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 0, clientY: 0, bubbles: true, cancelable: true }));
      await flushPromises();
      const items = document.querySelectorAll<HTMLElement>('[role="menuitem"]');
      items[1]?.click();
      await flushPromises();
      expect(onSelect).toHaveBeenCalledTimes(1);
      const selectEv = wrapper.emitted('select');
      expect(selectEv).toBeTruthy();
      expect((selectEv![0]![0] as BContextMenuItem).key).toBe('b');
    });

    it('clicking a disabled item is a no-op', async () => {
      const onSelect = vi.fn();
      const wrapper = track(
        mountWithTrigger({
          items: [
            { key: 'a', label: 'Alpha', disabled: true, onSelect },
            { key: 'b', label: 'Beta' },
          ],
        }),
      );
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 0, clientY: 0, bubbles: true, cancelable: true }));
      await flushPromises();
      const items = document.querySelectorAll<HTMLElement>('[role="menuitem"]');
      items[0]?.click();
      await flushPromises();
      expect(onSelect).not.toHaveBeenCalled();
      expect(wrapper.emitted('select')).toBeUndefined();
    });
  });

  describe('open / close behaviour', () => {
    it('Escape closes the menu and emits close', async () => {
      const wrapper = track(mountWithTrigger({ items: makeItems() }));
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 0, clientY: 0, bubbles: true, cancelable: true }));
      await flushPromises();
      const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await flushPromises();
      expect(document.querySelector('[role="menu"]')).toBeNull();
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('Tab closes the menu', async () => {
      const wrapper = track(mountWithTrigger({ items: makeItems() }));
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 0, clientY: 0, bubbles: true, cancelable: true }));
      await flushPromises();
      const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      await flushPromises();
      expect(document.querySelector('[role="menu"]')).toBeNull();
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('mousedown outside the menu closes it', async () => {
      const wrapper = track(mountWithTrigger({ items: makeItems() }));
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 0, clientY: 0, bubbles: true, cancelable: true }));
      await flushPromises();
      expect(document.querySelector('[role="menu"]')).not.toBeNull();

      // Synthesize an outside click on document.body itself.
      document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      await flushPromises();
      expect(document.querySelector('[role="menu"]')).toBeNull();
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('mousedown inside the menu does not close it', async () => {
      const wrapper = track(mountWithTrigger({ items: makeItems() }));
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 0, clientY: 0, bubbles: true, cancelable: true }));
      await flushPromises();
      const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
      menu.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      await flushPromises();
      expect(document.querySelector('[role="menu"]')).not.toBeNull();
      expect(wrapper.emitted('close')).toBeUndefined();
    });

    it('open emits with a MouseEvent argument', async () => {
      const wrapper = track(mountWithTrigger({ items: makeItems() }));
      const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
      wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 7, clientY: 11, bubbles: true, cancelable: true }));
      await flushPromises();
      const openEv = wrapper.emitted('open');
      expect(openEv).toBeTruthy();
      expect(openEv![0]![0]).toBeInstanceOf(MouseEvent);
    });
  });

  describe('programmatic open / close', () => {
    it('exposes open(x, y) and close()', async () => {
      const wrapper = track(mountWithTrigger({ items: makeItems() }));
      const child = wrapper.findComponent(BContextMenu);
      const api = child.vm as unknown as MenuApi;
      expect(typeof api.open).toBe('function');
      expect(typeof api.close).toBe('function');

      api.open(100, 100);
      await flushPromises();
      const menu = document.querySelector<HTMLElement>('[role="menu"]');
      expect(menu).not.toBeNull();
      expect(menu!.style.left).toBe('100px');
      expect(menu!.style.top).toBe('100px');

      api.close();
      await flushPromises();
      expect(document.querySelector('[role="menu"]')).toBeNull();
    });
  });

  describe('position clamping', () => {
    it('flips horizontally when the menu would overflow the viewport', async () => {
      // jsdom has no layout — mock getBoundingClientRect on the menu.
      const realProto = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = function () {
        if ((this as Element).getAttribute?.('role') === 'menu') {
          return { width: 200, height: 100, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => '' } as DOMRect;
        }
        return { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => '' } as DOMRect;
      };

      // Force window dims.
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 250, writable: true });
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: 250, writable: true });

      try {
        track(mountWithTrigger({ items: makeItems() }));
        const wrapperEl = document.querySelector<HTMLElement>('.b-context-menu')!;
        // x=100 + width 200 = 300 > 250 → flip → x = 100 - 200 = -100, clamped to 0.
        wrapperEl.dispatchEvent(new MouseEvent('contextmenu', { clientX: 100, clientY: 200, bubbles: true, cancelable: true }));
        await flushPromises();
        await nextTick();
        const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
        // y=200 + height 100 = 300 > 250 → flip → y = 200 - 100 = 100.
        expect(menu.style.left).toBe('0px');
        expect(menu.style.top).toBe('100px');
      } finally {
        Element.prototype.getBoundingClientRect = realProto;
      }
    });
  });
});
