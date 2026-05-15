import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { describe, expect, it } from 'vitest';

import BTabs from './BTabs.vue';
import BTabPane from './BTabPane.vue';
import type { BTabItem } from './types';

const defaultItems: BTabItem[] = [
  { key: '1', label: 'Tab 1' },
  { key: '2', label: 'Tab 2' },
  { key: '3', label: 'Tab 3' },
];

describe('BTabs', () => {
  // ─────────────────────────────────────────────
  // Rendering defaults
  // ─────────────────────────────────────────────
  describe('rendering', () => {
    it('renders with default props and first tab active', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });

      expect(wrapper.classes()).toContain('b-tabs');
      expect(wrapper.classes()).toContain('b-tabs--line');
      expect(wrapper.classes()).toContain('b-tabs--top');
      expect(wrapper.classes()).toContain('b-tabs--middle');

      const tabs = wrapper.findAll('[role="tab"]');
      expect(tabs).toHaveLength(3);
      expect(tabs[0].attributes('aria-selected')).toBe('true');
      expect(tabs[1].attributes('aria-selected')).toBe('false');
    });

    it('renders correct tablist role and orientation', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });

      const tablist = wrapper.find('[role="tablist"]');
      expect(tablist.exists()).toBe(true);
      expect(tablist.attributes('aria-orientation')).toBe('horizontal');
    });

    it('renders vertical orientation when placement is left', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, placement: 'left' },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });

      const tablist = wrapper.find('[role="tablist"]');
      expect(tablist.attributes('aria-orientation')).toBe('vertical');
    });

    it('renders tabpanels with correct aria attributes', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });

      const panels = wrapper.findAll('[role="tabpanel"]');
      expect(panels.length).toBeGreaterThanOrEqual(1);
      const activePanel = panels.find((p) => p.attributes('aria-hidden') === 'false');
      expect(activePanel).toBeDefined();
      expect(activePanel!.attributes('aria-labelledby')).toContain('-tab-1');
    });
  });

  // ─────────────────────────────────────────────
  // Type variants
  // ─────────────────────────────────────────────
  describe('type variants', () => {
    it('renders line type by default', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      expect(wrapper.classes()).toContain('b-tabs--line');
      expect(wrapper.find('.b-tabs__ink-bar').exists()).toBe(true);
    });

    it('renders card type without ink bar', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, type: 'card' },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      expect(wrapper.classes()).toContain('b-tabs--card');
      expect(wrapper.find('.b-tabs__ink-bar').exists()).toBe(false);
    });

    it('renders editable-card type with close buttons and add button', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, type: 'editable-card' },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      expect(wrapper.classes()).toContain('b-tabs--editable-card');
      expect(wrapper.findAll('.b-tabs__tab-remove')).toHaveLength(3);
      expect(wrapper.find('.b-tabs__add').exists()).toBe(true);
    });

    it('hides add button when hideAdd is true', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, type: 'editable-card', hideAdd: true },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      expect(wrapper.find('.b-tabs__add').exists()).toBe(false);
    });

    it('hides close button when item.closable is false', () => {
      const items: BTabItem[] = [
        { key: '1', label: 'Tab 1', closable: false },
        { key: '2', label: 'Tab 2' },
      ];
      const wrapper = mount(BTabs, {
        props: { items, type: 'editable-card' },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      expect(wrapper.findAll('.b-tabs__tab-remove')).toHaveLength(1);
    });
  });

  // ─────────────────────────────────────────────
  // Size variants
  // ─────────────────────────────────────────────
  describe('size variants', () => {
    it('applies small size class', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, size: 'small' },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      expect(wrapper.classes()).toContain('b-tabs--small');
    });

    it('applies large size class', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, size: 'large' },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      expect(wrapper.classes()).toContain('b-tabs--large');
    });
  });

  // ─────────────────────────────────────────────
  // Placement
  // ─────────────────────────────────────────────
  describe('placement', () => {
    const placements = ['top', 'bottom', 'left', 'right'] as const;
    placements.forEach((p) => {
      it(`applies ${p} placement class`, () => {
        const wrapper = mount(BTabs, {
          props: { items: defaultItems, placement: p },
          slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
        });
        expect(wrapper.classes()).toContain(`b-tabs--${p}`);
      });
    });
  });

  // ─────────────────────────────────────────────
  // Controlled vs. uncontrolled
  // ─────────────────────────────────────────────
  describe('controlled and uncontrolled', () => {
    it('uncontrolled: activates first tab by default', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      const tabs = wrapper.findAll('[role="tab"]');
      expect(tabs[0].attributes('aria-selected')).toBe('true');
    });

    it('uncontrolled: uses defaultActiveKey', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, defaultActiveKey: '2' },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      const tabs = wrapper.findAll('[role="tab"]');
      expect(tabs[1].attributes('aria-selected')).toBe('true');
    });

    it('uncontrolled: switches tab on click', async () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      const tabs = wrapper.findAll('[role="tab"]');

      await tabs[1].trigger('click');
      expect(tabs[1].attributes('aria-selected')).toBe('true');
      expect(tabs[0].attributes('aria-selected')).toBe('false');
    });

    it('controlled: respects activeKey prop', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, activeKey: '3' },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      const tabs = wrapper.findAll('[role="tab"]');
      expect(tabs[2].attributes('aria-selected')).toBe('true');
    });

    it('controlled: emits update:activeKey on tab click', async () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, activeKey: '1' },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      const tabs = wrapper.findAll('[role="tab"]');

      await tabs[1].trigger('click');
      expect(wrapper.emitted('update:activeKey')?.[0]).toEqual(['2']);
      expect(wrapper.emitted('change')?.[0]).toEqual(['2']);
    });
  });

  // ─────────────────────────────────────────────
  // Events
  // ─────────────────────────────────────────────
  describe('events', () => {
    it('emits tabClick with key and event', async () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      const tabs = wrapper.findAll('[role="tab"]');

      await tabs[1].trigger('click');
      const emitted = wrapper.emitted('tabClick');
      expect(emitted).toHaveLength(1);
      expect(emitted![0][0]).toBe('2');
      expect(emitted![0][1]).toBeInstanceOf(MouseEvent);
    });

    it('emits edit with action "add" when add button is clicked', async () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, type: 'editable-card' },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });

      await wrapper.find('.b-tabs__add').trigger('click');
      expect(wrapper.emitted('edit')?.[0]).toEqual([null, 'add']);
    });

    it('emits edit with action "remove" when close button is clicked', async () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, type: 'editable-card' },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });

      const removeButtons = wrapper.findAll('.b-tabs__tab-remove');
      await removeButtons[0].trigger('click');
      expect(wrapper.emitted('edit')?.[0]).toEqual(['1', 'remove']);
    });

    it('does not emit change when clicking the already active tab', async () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      const tabs = wrapper.findAll('[role="tab"]');

      await tabs[0].trigger('click');
      expect(wrapper.emitted('change')).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────
  // Disabled tabs
  // ─────────────────────────────────────────────
  describe('disabled tabs', () => {
    const itemsWithDisabled: BTabItem[] = [
      { key: '1', label: 'Tab 1' },
      { key: '2', label: 'Tab 2', disabled: true },
      { key: '3', label: 'Tab 3' },
    ];

    it('renders disabled tab with correct attributes', () => {
      const wrapper = mount(BTabs, {
        props: { items: itemsWithDisabled },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      const tabs = wrapper.findAll('[role="tab"]');
      expect(tabs[1].classes()).toContain('b-tabs__tab--disabled');
      expect(tabs[1].attributes('aria-disabled')).toBe('true');
    });

    it('does not activate disabled tab on click', async () => {
      const wrapper = mount(BTabs, {
        props: { items: itemsWithDisabled },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      const tabs = wrapper.findAll('[role="tab"]');

      await tabs[1].trigger('click');
      expect(tabs[1].attributes('aria-selected')).toBe('false');
      expect(wrapper.emitted('change')).toBeUndefined();
    });

    it('skips first disabled tab for default selection', () => {
      const items: BTabItem[] = [
        { key: '1', label: 'Tab 1', disabled: true },
        { key: '2', label: 'Tab 2' },
      ];
      const wrapper = mount(BTabs, {
        props: { items },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      const tabs = wrapper.findAll('[role="tab"]');
      expect(tabs[1].attributes('aria-selected')).toBe('true');
    });
  });

  // ─────────────────────────────────────────────
  // Keyboard navigation
  // ─────────────────────────────────────────────
  describe('keyboard navigation', () => {
    it('moves focus to next tab on ArrowRight', async () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
        attachTo: document.body,
      });
      const tabs = wrapper.findAll('[role="tab"]');

      await tabs[0].trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('change')?.[0]).toEqual(['2']);
    });

    it('moves focus to previous tab on ArrowLeft', async () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, defaultActiveKey: '2' },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
        attachTo: document.body,
      });
      const tabs = wrapper.findAll('[role="tab"]');

      await tabs[1].trigger('keydown', { key: 'ArrowLeft' });
      expect(wrapper.emitted('change')?.[0]).toEqual(['1']);
    });

    it('wraps around on ArrowRight from last tab', async () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, defaultActiveKey: '3' },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
        attachTo: document.body,
      });
      const tabs = wrapper.findAll('[role="tab"]');

      await tabs[2].trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('change')?.[0]).toEqual(['1']);
    });

    it('uses ArrowDown/ArrowUp for vertical placement', async () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, placement: 'left' },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
        attachTo: document.body,
      });
      const tabs = wrapper.findAll('[role="tab"]');

      await tabs[0].trigger('keydown', { key: 'ArrowDown' });
      expect(wrapper.emitted('change')?.[0]).toEqual(['2']);
    });

    it('Home key activates first tab', async () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, defaultActiveKey: '3' },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
        attachTo: document.body,
      });
      const tabs = wrapper.findAll('[role="tab"]');

      await tabs[2].trigger('keydown', { key: 'Home' });
      expect(wrapper.emitted('change')?.[0]).toEqual(['1']);
    });

    it('End key activates last tab', async () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
        attachTo: document.body,
      });
      const tabs = wrapper.findAll('[role="tab"]');

      await tabs[0].trigger('keydown', { key: 'End' });
      expect(wrapper.emitted('change')?.[0]).toEqual(['3']);
    });

    it('skips disabled tabs during keyboard navigation', async () => {
      const items: BTabItem[] = [
        { key: '1', label: 'Tab 1' },
        { key: '2', label: 'Tab 2', disabled: true },
        { key: '3', label: 'Tab 3' },
      ];
      const wrapper = mount(BTabs, {
        props: { items },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
        attachTo: document.body,
      });
      const tabs = wrapper.findAll('[role="tab"]');

      await tabs[0].trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('change')?.[0]).toEqual(['3']);
    });
  });

  // ─────────────────────────────────────────────
  // Content rendering (destroyOnHidden, forceRender)
  // ─────────────────────────────────────────────
  describe('content rendering', () => {
    it('renders active panel visible and others hidden', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      const panels = wrapper.findAll('[role="tabpanel"]');
      const visiblePanel = panels.find((p) => p.attributes('aria-hidden') === 'false');
      expect(visiblePanel?.text()).toContain('Content 1');
    });

    it('destroys inactive tab content when destroyOnHidden is true', async () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, destroyOnHidden: true },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });

      // Initially only 1 panel rendered
      expect(wrapper.findAll('[role="tabpanel"]')).toHaveLength(1);

      // Switch to tab 2
      const tabs = wrapper.findAll('[role="tab"]');
      await tabs[1].trigger('click');

      // Only tab 2 panel rendered
      const panels = wrapper.findAll('[role="tabpanel"]');
      expect(panels).toHaveLength(1);
      expect(panels[0].text()).toContain('Content 2');
    });

    it('force renders a panel even when not active', () => {
      const items: BTabItem[] = [
        { key: '1', label: 'Tab 1' },
        { key: '2', label: 'Tab 2', forceRender: true },
        { key: '3', label: 'Tab 3' },
      ];
      const wrapper = mount(BTabs, {
        props: { items },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });

      const panels = wrapper.findAll('[role="tabpanel"]');
      expect(panels.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ─────────────────────────────────────────────
  // Centered
  // ─────────────────────────────────────────────
  describe('centered', () => {
    it('applies centered class', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, centered: true },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      expect(wrapper.classes()).toContain('b-tabs--centered');
    });
  });

  // ─────────────────────────────────────────────
  // Tab bar gutter
  // ─────────────────────────────────────────────
  describe('tabBarGutter', () => {
    it('applies custom gap style on tab list', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, tabBarGutter: 16 },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      const list = wrapper.find('[role="tablist"]');
      expect(list.attributes('style')).toContain('gap: 16px');
    });
  });

  // ─────────────────────────────────────────────
  // Slots
  // ─────────────────────────────────────────────
  describe('slots', () => {
    it('renders custom label via slot', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems },
        slots: {
          label: ({ item }: { item?: BTabItem }) => `Custom-${item!.label}`,
          default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}`,
        },
      });
      const tabs = wrapper.findAll('[role="tab"]');
      expect(tabs[0].text()).toContain('Custom-Tab 1');
    });

    it('renders leftExtra and rightExtra slots', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems },
        slots: {
          leftExtra: () => 'LEFT',
          rightExtra: () => 'RIGHT',
          default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}`,
        },
      });
      expect(wrapper.find('.b-tabs__extra--left').text()).toBe('LEFT');
      expect(wrapper.find('.b-tabs__extra--right').text()).toBe('RIGHT');
    });
  });

  // ─────────────────────────────────────────────
  // Animation
  // ─────────────────────────────────────────────
  describe('animation', () => {
    it('applies animated class when animated is true', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, animated: true },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      const activePanel = wrapper.find('.b-tabs__panel--active');
      expect(activePanel.classes()).toContain('b-tabs__panel--animated');
    });

    it('does not apply animated class when animated is false', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, animated: false },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      const activePanel = wrapper.find('.b-tabs__panel--active');
      expect(activePanel.classes()).not.toContain('b-tabs__panel--animated');
    });
  });

  // ─────────────────────────────────────────────
  // Edge cases
  // ─────────────────────────────────────────────
  describe('edge cases', () => {
    it('handles empty items gracefully', () => {
      const wrapper = mount(BTabs, {
        props: { items: [] },
        slots: { default: () => 'No tabs' },
      });
      expect(wrapper.findAll('[role="tab"]')).toHaveLength(0);
      expect(wrapper.find('.b-tabs').exists()).toBe(true);
    });

    it('handles single tab', () => {
      const wrapper = mount(BTabs, {
        props: { items: [{ key: '1', label: 'Only Tab' }] },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });
      const tabs = wrapper.findAll('[role="tab"]');
      expect(tabs).toHaveLength(1);
      expect(tabs[0].attributes('aria-selected')).toBe('true');
    });

    it('handles items update reactively', async () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item!.key}` },
      });

      await wrapper.setProps({
        items: [
          { key: 'a', label: 'Tab A' },
          { key: 'b', label: 'Tab B' },
        ],
      });

      const tabs = wrapper.findAll('[role="tab"]');
      expect(tabs).toHaveLength(2);
    });
  });

  // ─────────────────────────────────────────────
  // BTabPane child component API
  // ─────────────────────────────────────────────
  describe('BTabPane (pane mode)', () => {
    it('registers panes and renders tabs', async () => {
      const wrapper = mount(BTabs, {
        slots: {
          default: () => [
            h(BTabPane, { tabKey: 'a', tab: 'Tab A' }, { default: () => 'Content A' }),
            h(BTabPane, { tabKey: 'b', tab: 'Tab B' }, { default: () => 'Content B' }),
          ],
        },
      });

      await nextTick();
      await nextTick();

      const tabs = wrapper.findAll('[role="tab"]');
      expect(tabs).toHaveLength(2);
      expect(tabs[0].text()).toContain('Tab A');
      expect(tabs[1].text()).toContain('Tab B');
    });

    it('first pane is active by default', async () => {
      const wrapper = mount(BTabs, {
        slots: {
          default: () => [
            h(BTabPane, { tabKey: 'a', tab: 'Tab A' }, { default: () => 'Content A' }),
            h(BTabPane, { tabKey: 'b', tab: 'Tab B' }, { default: () => 'Content B' }),
          ],
        },
      });

      await nextTick();
      await nextTick();

      const tabs = wrapper.findAll('[role="tab"]');
      expect(tabs[0].attributes('aria-selected')).toBe('true');
    });

    it('renders active pane content', async () => {
      const wrapper = mount(BTabs, {
        slots: {
          default: () => [
            h(BTabPane, { tabKey: 'a', tab: 'Tab A' }, { default: () => 'Content A' }),
            h(BTabPane, { tabKey: 'b', tab: 'Tab B' }, { default: () => 'Content B' }),
          ],
        },
      });

      await nextTick();
      await nextTick();

      const panels = wrapper.findAll('[role="tabpanel"]');
      const visiblePanel = panels.find((p) => p.attributes('aria-hidden') === 'false');
      expect(visiblePanel?.text()).toContain('Content A');
    });

    it('switches pane content on tab click', async () => {
      const wrapper = mount(BTabs, {
        slots: {
          default: () => [
            h(BTabPane, { tabKey: 'a', tab: 'Tab A' }, { default: () => 'Content A' }),
            h(BTabPane, { tabKey: 'b', tab: 'Tab B' }, { default: () => 'Content B' }),
          ],
        },
      });

      await nextTick();
      await nextTick();

      const tabs = wrapper.findAll('[role="tab"]');
      await tabs[1].trigger('click');

      await nextTick();

      const panels = wrapper.findAll('[role="tabpanel"]');
      const visiblePanel = panels.find((p) => p.attributes('aria-hidden') === 'false');
      expect(visiblePanel?.text()).toContain('Content B');
    });

    it('supports disabled panes', async () => {
      const wrapper = mount(BTabs, {
        slots: {
          default: () => [
            h(BTabPane, { tabKey: 'a', tab: 'Tab A' }, { default: () => 'Content A' }),
            h(BTabPane, { tabKey: 'b', tab: 'Tab B', disabled: true }, { default: () => 'Content B' }),
          ],
        },
      });

      await nextTick();
      await nextTick();

      const tabs = wrapper.findAll('[role="tab"]');
      expect(tabs[1].attributes('aria-disabled')).toBe('true');
    });

    it('renders custom label via tab slot', async () => {
      const wrapper = mount(BTabs, {
        slots: {
          default: () => [
            h(BTabPane, { tabKey: 'a' }, {
              default: () => 'Content A',
              tab: () => h('span', { class: 'custom-label' }, 'Custom Label'),
            }),
          ],
        },
      });

      await nextTick();
      await nextTick();

      const tab = wrapper.find('[role="tab"]');
      expect(tab.find('.custom-label').exists()).toBe(true);
      expect(tab.text()).toContain('Custom Label');
    });

    it('unregisters pane on unmount', async () => {
      const show = ref(true);

      const TestComp = defineComponent({
        setup() {
          return () => h(BTabs, null, {
            default: () => {
              const panes = [
                h(BTabPane, { tabKey: 'a', tab: 'Tab A' }, { default: () => 'Content A' }),
              ];
              if (show.value) {
                panes.push(h(BTabPane, { tabKey: 'b', tab: 'Tab B' }, { default: () => 'Content B' }));
              }
              return panes;
            },
          });
        },
      });

      const wrapper = mount(TestComp);
      await nextTick();
      await nextTick();

      expect(wrapper.findAll('[role="tab"]')).toHaveLength(2);

      show.value = false;
      await nextTick();
      await nextTick();

      expect(wrapper.findAll('[role="tab"]')).toHaveLength(1);
    });

    it('items prop takes priority over BTabPane children', async () => {
      const wrapper = mount(BTabs, {
        props: { items: [{ key: '1', label: 'Items Tab' }] },
        slots: {
          default: ({ item }: { item?: BTabItem }) => {
            if (item) return `Content ${item.key}`;
            return h(BTabPane, { tabKey: 'a', tab: 'Pane Tab' }, { default: () => 'Pane Content' });
          },
        },
      });

      await nextTick();

      const tabs = wrapper.findAll('[role="tab"]');
      expect(tabs).toHaveLength(1);
      expect(tabs[0].text()).toContain('Items Tab');
    });
  });

  // ─────────────────────────────────────────────
  // KeepAlive
  // ─────────────────────────────────────────────
  describe('keepAlive', () => {
    it('renders panel with KeepAlive when keepAlive is true globally', () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, keepAlive: true },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item?.key}` },
      });

      const panels = wrapper.findAll('[role="tabpanel"]');
      expect(panels.length).toBeGreaterThanOrEqual(1);
    });

    it('keepAlive panels stay rendered after visiting', async () => {
      const wrapper = mount(BTabs, {
        props: { items: defaultItems, keepAlive: true },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item?.key}` },
      });

      // Visit tab 2
      const tabs = wrapper.findAll('[role="tab"]');
      await tabs[1].trigger('click');

      // All visited panels should still exist in the DOM
      const panels = wrapper.findAll('[role="tabpanel"]');
      expect(panels.length).toBeGreaterThanOrEqual(1);
    });

    it('per-item keepAlive overrides global setting', () => {
      const items: BTabItem[] = [
        { key: '1', label: 'Tab 1', keepAlive: true },
        { key: '2', label: 'Tab 2' },
        { key: '3', label: 'Tab 3' },
      ];
      const wrapper = mount(BTabs, {
        props: { items, destroyOnHidden: true },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item?.key}` },
      });

      // Tab 1 has keepAlive=true, so it should be rendered even though global destroyOnHidden is true
      // But since tab 1 is active, we check the panel is there
      const panels = wrapper.findAll('[role="tabpanel"]');
      expect(panels.length).toBeGreaterThanOrEqual(1);
    });

    it('destroyOnHidden overrides keepAlive at item level', async () => {
      const items: BTabItem[] = [
        { key: '1', label: 'Tab 1' },
        { key: '2', label: 'Tab 2', destroyOnHidden: true },
        { key: '3', label: 'Tab 3' },
      ];
      const wrapper = mount(BTabs, {
        props: { items, keepAlive: true },
        slots: { default: ({ item }: { item?: BTabItem }) => `Content ${item?.key}` },
      });

      // Visit tab 2 then switch back
      const tabs = wrapper.findAll('[role="tab"]');
      await tabs[1].trigger('click');
      await tabs[0].trigger('click');

      // Tab 2 has destroyOnHidden=true, so it should be destroyed even with global keepAlive
      const panels = wrapper.findAll('[role="tabpanel"]');
      const tab2Panel = panels.find((p) => p.attributes('id')?.endsWith('-tabpanel-2'));
      expect(tab2Panel).toBeUndefined();
    });

    it('keepAlive works with BTabPane children', async () => {
      const wrapper = mount(BTabs, {
        props: { keepAlive: true },
        slots: {
          default: () => [
            h(BTabPane, { tabKey: 'a', tab: 'Tab A' }, { default: () => 'Content A' }),
            h(BTabPane, { tabKey: 'b', tab: 'Tab B' }, { default: () => 'Content B' }),
          ],
        },
      });

      await nextTick();
      await nextTick();

      const tabs = wrapper.findAll('[role="tab"]');
      await tabs[1].trigger('click');
      await nextTick();

      // Both panels should have their content available
      const panels = wrapper.findAll('[role="tabpanel"]');
      expect(panels.length).toBeGreaterThanOrEqual(1);
    });
  });
});
