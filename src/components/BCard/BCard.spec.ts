import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import { BCardSize, BCardType } from '@/types.ts';
import BCard from './BCard.vue';
import BCardGrid from './BCardGrid.vue';
import BCardMeta from './BCardMeta.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function mountCard(props = {}, slots: Record<string, any> = {}) {
  return mount(BCard, { props, slots });
}

function mountMeta(props = {}, slots: Record<string, any> = {}) {
  return mount(BCardMeta, { props, slots });
}

function mountGrid(props = {}, slots: Record<string, any> = {}) {
  return mount(BCardGrid, { props, slots });
}

// ─────────────────────────────────────────────
// 1. Defaults & variants render
// ─────────────────────────────────────────────
describe('BCard – defaults and variants', () => {
  it('renders root .b-card element', () => {
    const wrapper = mountCard({}, { default: () => 'Content' });
    expect(wrapper.find('.b-card').exists()).toBe(true);
  });

  it('renders bordered by default', () => {
    const wrapper = mountCard({}, { default: () => 'Content' });
    expect(wrapper.find('.b-card--bordered').exists()).toBe(true);
  });

  it('renders without border when bordered=false', () => {
    const wrapper = mountCard({ bordered: false }, { default: () => 'Content' });
    expect(wrapper.find('.b-card--bordered').exists()).toBe(false);
  });

  it('renders hoverable variant', () => {
    const wrapper = mountCard({ hoverable: true }, { default: () => 'Content' });
    expect(wrapper.find('.b-card--hoverable').exists()).toBe(true);
  });

  it('renders loading state', () => {
    const wrapper = mountCard({ loading: true }, { default: () => 'Content' });
    expect(wrapper.find('.b-card--loading').exists()).toBe(true);
    expect(wrapper.find('.b-card__loading').exists()).toBe(true);
  });

  it('renders inner type', () => {
    const wrapper = mountCard({ type: BCardType.Inner }, { default: () => 'Content' });
    expect(wrapper.find('.b-card--inner').exists()).toBe(true);
  });

  it('renders small size', () => {
    const wrapper = mountCard({ size: BCardSize.Small }, { default: () => 'Content' });
    expect(wrapper.find('.b-card--small').exists()).toBe(true);
  });

  it('renders default size without small class', () => {
    const wrapper = mountCard({ size: BCardSize.Default }, { default: () => 'Content' });
    expect(wrapper.find('.b-card--small').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behavior
// ─────────────────────────────────────────────
describe('BCard – props map to DOM', () => {
  it('renders title as text', () => {
    const wrapper = mountCard({ title: 'My Card' }, { default: () => 'Content' });
    expect(wrapper.find('.b-card__head-title').text()).toBe('My Card');
  });

  it('renders extra as text', () => {
    const wrapper = mountCard({ title: 'Title', extra: 'More' }, { default: () => 'Content' });
    expect(wrapper.find('.b-card__extra').text()).toBe('More');
  });

  it('renders title slot overriding prop', () => {
    const wrapper = mountCard(
      { title: 'Prop Title' },
      { default: () => 'Content', title: () => 'Slot Title' },
    );
    expect(wrapper.find('.b-card__head-title').text()).toBe('Slot Title');
  });

  it('renders extra slot overriding prop', () => {
    const wrapper = mountCard(
      { title: 'Title', extra: 'Prop Extra' },
      { default: () => 'Content', extra: () => 'Slot Extra' },
    );
    expect(wrapper.find('.b-card__extra').text()).toBe('Slot Extra');
  });

  it('does not render head when no title, extra, or tabs', () => {
    const wrapper = mountCard({}, { default: () => 'Content' });
    expect(wrapper.find('.b-card__head').exists()).toBe(false);
  });

  it('renders cover slot', () => {
    const wrapper = mountCard(
      {},
      {
        default: () => 'Content',
        cover: () => '<img src="test.png" alt="cover" />',
      },
    );
    expect(wrapper.find('.b-card__cover').exists()).toBe(true);
    expect(wrapper.find('.b-card--has-cover').exists()).toBe(true);
  });

  it('renders actions slot', () => {
    const wrapper = mountCard(
      {},
      {
        default: () => 'Content',
        actions: () => '<button>Edit</button>',
      },
    );
    expect(wrapper.find('.b-card__actions').exists()).toBe(true);
    expect(wrapper.find('.b-card--has-actions').exists()).toBe(true);
  });

  it('renders default slot as card body content', () => {
    const wrapper = mountCard({}, { default: () => 'Card body content' });
    expect(wrapper.find('.b-card__body').text()).toBe('Card body content');
  });

  it('shows loading skeleton and hides content when loading', () => {
    const wrapper = mountCard({ loading: true }, { default: () => 'Hidden content' });
    expect(wrapper.find('.b-card__loading').exists()).toBe(true);
    expect(wrapper.find('.b-card__body').text()).not.toContain('Hidden content');
  });

  it('shows content when not loading', () => {
    const wrapper = mountCard({ loading: false }, { default: () => 'Visible content' });
    expect(wrapper.find('.b-card__loading').exists()).toBe(false);
    expect(wrapper.find('.b-card__body').text()).toBe('Visible content');
  });

  it('renders loading skeleton lines', () => {
    const wrapper = mountCard({ loading: true });
    const lines = wrapper.findAll('.b-card__loading-line');
    expect(lines.length).toBe(4);
  });
});

// ─────────────────────────────────────────────
// 3. Tab functionality
// ─────────────────────────────────────────────
describe('BCard – tabs', () => {
  const tabList = [
    { key: 'tab1', tab: 'Tab 1' },
    { key: 'tab2', tab: 'Tab 2' },
    { key: 'tab3', tab: 'Tab 3' },
  ];

  it('renders tabs when tabList is provided', () => {
    const wrapper = mountCard({ tabList }, { default: () => 'Content' });
    expect(wrapper.find('.b-card__tabs').exists()).toBe(true);
    expect(wrapper.find('.b-card--has-tabs').exists()).toBe(true);
    expect(wrapper.findAll('.b-card__tab').length).toBe(3);
  });

  it('first tab is active by default', () => {
    const wrapper = mountCard({ tabList }, { default: () => 'Content' });
    const tabs = wrapper.findAll('.b-card__tab');
    expect(tabs[0].classes()).toContain('b-card__tab--active');
    expect(tabs[1].classes()).not.toContain('b-card__tab--active');
  });

  it('uses defaultActiveTabKey for initial active tab', () => {
    const wrapper = mountCard(
      { tabList, defaultActiveTabKey: 'tab2' },
      { default: () => 'Content' },
    );
    const tabs = wrapper.findAll('.b-card__tab');
    expect(tabs[0].classes()).not.toContain('b-card__tab--active');
    expect(tabs[1].classes()).toContain('b-card__tab--active');
  });

  it('uses activeTabKey for controlled active tab', () => {
    const wrapper = mountCard({ tabList, activeTabKey: 'tab3' }, { default: () => 'Content' });
    const tabs = wrapper.findAll('.b-card__tab');
    expect(tabs[2].classes()).toContain('b-card__tab--active');
  });

  it('emits tabChange when tab is clicked', async () => {
    const wrapper = mountCard({ tabList }, { default: () => 'Content' });
    await wrapper.findAll('.b-card__tab')[1].trigger('click');
    expect(wrapper.emitted('tabChange')).toBeTruthy();
    expect(wrapper.emitted('tabChange')![0]).toEqual(['tab2']);
  });

  it('emits update:activeTabKey when tab is clicked', async () => {
    const wrapper = mountCard({ tabList }, { default: () => 'Content' });
    await wrapper.findAll('.b-card__tab')[2].trigger('click');
    expect(wrapper.emitted('update:activeTabKey')).toBeTruthy();
    expect(wrapper.emitted('update:activeTabKey')![0]).toEqual(['tab3']);
  });

  it('updates active tab on click in uncontrolled mode', async () => {
    const wrapper = mountCard({ tabList }, { default: () => 'Content' });
    const tabs = wrapper.findAll('.b-card__tab');
    await tabs[1].trigger('click');
    expect(tabs[1].classes()).toContain('b-card__tab--active');
  });

  it('renders disabled tabs', () => {
    const disabledTabs = [
      { key: 'a', tab: 'A' },
      { key: 'b', tab: 'B', disabled: true },
    ];
    const wrapper = mountCard({ tabList: disabledTabs }, { default: () => 'Content' });
    const tabs = wrapper.findAll('.b-card__tab');
    expect(tabs[1].classes()).toContain('b-card__tab--disabled');
    expect(tabs[1].attributes('disabled')).toBeDefined();
  });

  it('renders tab bar extra content via prop', () => {
    const wrapper = mountCard(
      { tabList, tabBarExtraContent: 'Extra' },
      { default: () => 'Content' },
    );
    expect(wrapper.find('.b-card__tab-extra').text()).toBe('Extra');
  });

  it('renders tab bar extra content via slot', () => {
    const wrapper = mountCard(
      { tabList },
      { default: () => 'Content', tabBarExtraContent: () => 'Slot Extra' },
    );
    expect(wrapper.find('.b-card__tab-extra').text()).toBe('Slot Extra');
  });

  it('renders customTab slot for each tab', () => {
    const wrapper = mountCard(
      { tabList },
      {
        default: () => 'Content',
        customTab: ({ item }: { item: { key: string; tab: string }; isActive: boolean }) =>
          `Custom: ${item.tab}`,
      },
    );
    const tabs = wrapper.findAll('.b-card__tab');
    expect(tabs[0].text()).toBe('Custom: Tab 1');
    expect(tabs[1].text()).toBe('Custom: Tab 2');
  });

  it('renders tab text labels', () => {
    const wrapper = mountCard({ tabList }, { default: () => 'Content' });
    const tabs = wrapper.findAll('.b-card__tab');
    expect(tabs[0].text()).toBe('Tab 1');
    expect(tabs[1].text()).toBe('Tab 2');
    expect(tabs[2].text()).toBe('Tab 3');
  });
});

// ─────────────────────────────────────────────
// 4. Keyboard & focus behavior (tabs)
// ─────────────────────────────────────────────
describe('BCard – keyboard and focus', () => {
  const tabList = [
    { key: 'tab1', tab: 'Tab 1' },
    { key: 'tab2', tab: 'Tab 2' },
    { key: 'tab3', tab: 'Tab 3' },
  ];

  it('active tab has tabindex=0, inactive tabs have tabindex=-1', () => {
    const wrapper = mountCard({ tabList }, { default: () => 'Content' });
    const tabs = wrapper.findAll('.b-card__tab');
    expect(tabs[0].attributes('tabindex')).toBe('0');
    expect(tabs[1].attributes('tabindex')).toBe('-1');
    expect(tabs[2].attributes('tabindex')).toBe('-1');
  });

  it('ArrowRight moves to next tab', async () => {
    const wrapper = mountCard({ tabList }, { default: () => 'Content' });
    const tabs = wrapper.findAll('.b-card__tab');
    await tabs[0].trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('tabChange')![0]).toEqual(['tab2']);
  });

  it('ArrowLeft wraps from first to last tab', async () => {
    const wrapper = mountCard({ tabList }, { default: () => 'Content' });
    const tabs = wrapper.findAll('.b-card__tab');
    await tabs[0].trigger('keydown', { key: 'ArrowLeft' });
    expect(wrapper.emitted('tabChange')![0]).toEqual(['tab3']);
  });

  it('ArrowRight wraps from last to first tab', async () => {
    const wrapper = mountCard(
      { tabList, defaultActiveTabKey: 'tab3' },
      { default: () => 'Content' },
    );
    const tabs = wrapper.findAll('.b-card__tab');
    await tabs[2].trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('tabChange')![0]).toEqual(['tab1']);
  });

  it('Home moves to first tab', async () => {
    const wrapper = mountCard(
      { tabList, defaultActiveTabKey: 'tab3' },
      { default: () => 'Content' },
    );
    const tabs = wrapper.findAll('.b-card__tab');
    await tabs[2].trigger('keydown', { key: 'Home' });
    expect(wrapper.emitted('tabChange')![0]).toEqual(['tab1']);
  });

  it('End moves to last tab', async () => {
    const wrapper = mountCard({ tabList }, { default: () => 'Content' });
    const tabs = wrapper.findAll('.b-card__tab');
    await tabs[0].trigger('keydown', { key: 'End' });
    expect(wrapper.emitted('tabChange')![0]).toEqual(['tab3']);
  });

  it('skips disabled tabs during arrow navigation', async () => {
    const mixedTabs = [
      { key: 'a', tab: 'A' },
      { key: 'b', tab: 'B', disabled: true },
      { key: 'c', tab: 'C' },
    ];
    const wrapper = mountCard({ tabList: mixedTabs }, { default: () => 'Content' });
    const tabs = wrapper.findAll('.b-card__tab');
    await tabs[0].trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('tabChange')![0]).toEqual(['c']);
  });
});

// ─────────────────────────────────────────────
// 5. Accessibility
// ─────────────────────────────────────────────
describe('BCard – accessibility', () => {
  const tabList = [
    { key: 'tab1', tab: 'Tab 1' },
    { key: 'tab2', tab: 'Tab 2' },
  ];

  it('tab buttons have role="tab"', () => {
    const wrapper = mountCard({ tabList }, { default: () => 'Content' });
    const tabs = wrapper.findAll('.b-card__tab');
    tabs.forEach((tab) => {
      expect(tab.attributes('role')).toBe('tab');
    });
  });

  it('tab list has role="tablist"', () => {
    const wrapper = mountCard({ tabList }, { default: () => 'Content' });
    expect(wrapper.find('.b-card__tab-list').attributes('role')).toBe('tablist');
  });

  it('active tab has aria-selected="true"', () => {
    const wrapper = mountCard({ tabList }, { default: () => 'Content' });
    const tabs = wrapper.findAll('.b-card__tab');
    expect(tabs[0].attributes('aria-selected')).toBe('true');
    expect(tabs[1].attributes('aria-selected')).toBe('false');
  });

  it('card body has role="tabpanel" when tabs are present', () => {
    const wrapper = mountCard({ tabList }, { default: () => 'Content' });
    expect(wrapper.find('.b-card__body').attributes('role')).toBe('tabpanel');
  });

  it('card body has no role="tabpanel" when no tabs', () => {
    const wrapper = mountCard({}, { default: () => 'Content' });
    expect(wrapper.find('.b-card__body').attributes('role')).toBeUndefined();
  });

  it('tab aria-controls references the tabpanel', () => {
    const wrapper = mountCard({ tabList }, { default: () => 'Content' });
    const tab = wrapper.findAll('.b-card__tab')[0];
    const panelId = wrapper.find('.b-card__body').attributes('id');
    expect(tab.attributes('aria-controls')).toBe(panelId);
  });

  it('tabpanel aria-labelledby references the active tab', () => {
    const wrapper = mountCard({ tabList }, { default: () => 'Content' });
    const activeTab = wrapper.findAll('.b-card__tab')[0];
    const body = wrapper.find('.b-card__body');
    expect(body.attributes('aria-labelledby')).toBe(activeTab.attributes('id'));
  });

  it('loading state has role="status" and aria-busy="true"', () => {
    const wrapper = mountCard({ loading: true }, { default: () => 'Content' });
    expect(wrapper.find('.b-card__loading').attributes('role')).toBe('status');
    expect(wrapper.find('.b-card__loading').attributes('aria-busy')).toBe('true');
  });

  it('actions area has role="group" and aria-label', () => {
    const wrapper = mountCard(
      {},
      {
        default: () => 'Content',
        actions: () => '<button>Edit</button>',
      },
    );
    const actions = wrapper.find('.b-card__actions');
    expect(actions.attributes('role')).toBe('group');
    expect(actions.attributes('aria-label')).toBe('Card actions');
  });

  it('tablist has aria-label including card title', () => {
    const wrapper = mountCard({ tabList, title: 'Settings' }, { default: () => 'Content' });
    expect(wrapper.find('.b-card__tab-list').attributes('aria-label')).toBe('Settings tabs');
  });

  it('tablist has generic aria-label when no title', () => {
    const wrapper = mountCard({ tabList }, { default: () => 'Content' });
    expect(wrapper.find('.b-card__tab-list').attributes('aria-label')).toBe('Card tabs');
  });
});

// ─────────────────────────────────────────────
// 6. Edge cases
// ─────────────────────────────────────────────
describe('BCard – edge cases', () => {
  it('renders with no props and no slots', () => {
    const wrapper = mountCard();
    expect(wrapper.find('.b-card').exists()).toBe(true);
    expect(wrapper.find('.b-card__head').exists()).toBe(false);
    expect(wrapper.find('.b-card__cover').exists()).toBe(false);
    expect(wrapper.find('.b-card__actions').exists()).toBe(false);
  });

  it('renders with only title and no body content', () => {
    const wrapper = mountCard({ title: 'Empty Card' });
    expect(wrapper.find('.b-card__head-title').text()).toBe('Empty Card');
    expect(wrapper.find('.b-card__body').text()).toBe('');
  });

  it('handles empty tabList', () => {
    const wrapper = mountCard({ tabList: [] }, { default: () => 'Content' });
    expect(wrapper.find('.b-card__tabs').exists()).toBe(false);
    expect(wrapper.find('.b-card--has-tabs').exists()).toBe(false);
  });

  it('renders multiple cards independently', () => {
    const w1 = mountCard({ title: 'Card 1' }, { default: () => 'A' });
    const w2 = mountCard({ title: 'Card 2', hoverable: true }, { default: () => 'B' });
    expect(w1.find('.b-card__head-title').text()).toBe('Card 1');
    expect(w2.find('.b-card__head-title').text()).toBe('Card 2');
    expect(w1.find('.b-card--hoverable').exists()).toBe(false);
    expect(w2.find('.b-card--hoverable').exists()).toBe(true);
  });

  it('updates title reactively', async () => {
    const wrapper = mountCard({ title: 'Old Title' }, { default: () => 'Content' });
    expect(wrapper.find('.b-card__head-title').text()).toBe('Old Title');
    await wrapper.setProps({ title: 'New Title' });
    expect(wrapper.find('.b-card__head-title').text()).toBe('New Title');
  });

  it('toggles loading state reactively', async () => {
    const wrapper = mountCard({ loading: false }, { default: () => 'Content' });
    expect(wrapper.find('.b-card__loading').exists()).toBe(false);
    await wrapper.setProps({ loading: true });
    expect(wrapper.find('.b-card__loading').exists()).toBe(true);
    await wrapper.setProps({ loading: false });
    expect(wrapper.find('.b-card__loading').exists()).toBe(false);
  });

  it('controlled activeTabKey updates active tab externally', async () => {
    const wrapper = mountCard(
      {
        tabList: [
          { key: 'a', tab: 'A' },
          { key: 'b', tab: 'B' },
        ],
        activeTabKey: 'a',
      },
      { default: () => 'Content' },
    );
    let tabs = wrapper.findAll('.b-card__tab');
    expect(tabs[0].classes()).toContain('b-card__tab--active');
    await wrapper.setProps({ activeTabKey: 'b' });
    tabs = wrapper.findAll('.b-card__tab');
    expect(tabs[1].classes()).toContain('b-card__tab--active');
  });

  it('head appears when only extra slot is provided', () => {
    const wrapper = mountCard(
      {},
      {
        default: () => 'Content',
        extra: () => 'Extra only',
      },
    );
    expect(wrapper.find('.b-card__head').exists()).toBe(true);
    expect(wrapper.find('.b-card__extra').text()).toBe('Extra only');
  });
});

// ─────────────────────────────────────────────
// 7. Animation tests with fake timers
// ─────────────────────────────────────────────
describe('BCard – animation / loading skeleton', () => {
  it('loading skeleton lines exist immediately (CSS handles animation)', () => {
    const wrapper = mountCard({ loading: true });
    const lines = wrapper.findAll('.b-card__loading-line');
    expect(lines.length).toBeGreaterThan(0);
  });

  it('loading skeleton has varying line widths', () => {
    const wrapper = mountCard({ loading: true });
    const lines = wrapper.findAll('.b-card__loading-line');
    const widths = lines.map((l) => l.attributes('style'));
    const uniqueWidths = new Set(widths);
    expect(uniqueWidths.size).toBeGreaterThan(1);
  });

  it('loading state transitions correctly with fake timers', async () => {
    vi.useFakeTimers();
    const wrapper = mountCard({ loading: true }, { default: () => 'Content' });
    expect(wrapper.find('.b-card__loading').exists()).toBe(true);

    await wrapper.setProps({ loading: false });
    vi.advanceTimersByTime(300);
    expect(wrapper.find('.b-card__loading').exists()).toBe(false);
    expect(wrapper.find('.b-card__body').text()).toBe('Content');

    vi.useRealTimers();
  });
});

// ─────────────────────────────────────────────
// 8. BCardMeta
// ─────────────────────────────────────────────
describe('BCardMeta', () => {
  it('renders root .b-card-meta element', () => {
    const wrapper = mountMeta({ title: 'Title' });
    expect(wrapper.find('.b-card-meta').exists()).toBe(true);
  });

  it('renders title from prop', () => {
    const wrapper = mountMeta({ title: 'Card Title' });
    expect(wrapper.find('.b-card-meta__title').text()).toBe('Card Title');
  });

  it('renders description from prop', () => {
    const wrapper = mountMeta({ description: 'A description' });
    expect(wrapper.find('.b-card-meta__description').text()).toBe('A description');
  });

  it('renders title slot overriding prop', () => {
    const wrapper = mountMeta({ title: 'Prop' }, { title: () => 'Slot Title' });
    expect(wrapper.find('.b-card-meta__title').text()).toBe('Slot Title');
  });

  it('renders description slot overriding prop', () => {
    const wrapper = mountMeta({ description: 'Prop Desc' }, { description: () => 'Slot Desc' });
    expect(wrapper.find('.b-card-meta__description').text()).toBe('Slot Desc');
  });

  it('renders avatar slot', () => {
    const wrapper = mountMeta({ title: 'Title' }, { avatar: () => '<img src="test.png" />' });
    expect(wrapper.find('.b-card-meta__avatar').exists()).toBe(true);
  });

  it('does not render avatar area without slot', () => {
    const wrapper = mountMeta({ title: 'Title' });
    expect(wrapper.find('.b-card-meta__avatar').exists()).toBe(false);
  });

  it('does not render detail area without title or description', () => {
    const wrapper = mountMeta();
    expect(wrapper.find('.b-card-meta__detail').exists()).toBe(false);
  });

  it('renders both title and description together', () => {
    const wrapper = mountMeta({ title: 'T', description: 'D' });
    expect(wrapper.find('.b-card-meta__title').text()).toBe('T');
    expect(wrapper.find('.b-card-meta__description').text()).toBe('D');
  });
});

// ─────────────────────────────────────────────
// 9. BCardGrid
// ─────────────────────────────────────────────
describe('BCardGrid', () => {
  it('renders root .b-card-grid element', () => {
    const wrapper = mountGrid({}, { default: () => 'Grid content' });
    expect(wrapper.find('.b-card-grid').exists()).toBe(true);
  });

  it('renders content from default slot', () => {
    const wrapper = mountGrid({}, { default: () => 'Grid content' });
    expect(wrapper.text()).toBe('Grid content');
  });

  it('renders hoverable variant', () => {
    const wrapper = mountGrid({ hoverable: true }, { default: () => 'Content' });
    expect(wrapper.find('.b-card-grid--hoverable').exists()).toBe(true);
  });

  it('does not apply hoverable by default', () => {
    const wrapper = mountGrid({}, { default: () => 'Content' });
    expect(wrapper.find('.b-card-grid--hoverable').exists()).toBe(false);
  });

  it('has role="region" when aria-label is provided', () => {
    const wrapper = mountGrid({}, { default: () => 'Content' });
    // Without aria-label, no landmark role
    expect(wrapper.find('.b-card-grid').attributes('role')).toBeUndefined();
  });

  it('has role="region" when aria-label is provided via attrs', () => {
    const wrapper = mount(BCardGrid, {
      props: {},
      attrs: { 'aria-label': 'Grid item 1' },
      slots: { default: () => 'Content' },
    });
    expect(wrapper.find('.b-card-grid').attributes('role')).toBe('region');
    expect(wrapper.find('.b-card-grid').attributes('aria-label')).toBe('Grid item 1');
  });
});
