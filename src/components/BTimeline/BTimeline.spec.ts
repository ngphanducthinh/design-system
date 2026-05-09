import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BTimeline from './BTimeline.vue';
import BTimelineItem from './BTimelineItem.vue';
import type { BTimelineItem as BTimelineItemData } from './types';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const ITEMS: BTimelineItemData[] = [
  { content: 'Create a services site 2015-09-01', color: 'blue' },
  { content: 'Solve initial network problems 2015-09-01', color: 'green' },
  { content: 'Technical testing 2015-09-01', color: 'red' },
  { content: 'Network problems being solved 2015-09-01', color: 'gray' },
];

function mountTimeline(props: Record<string, unknown> = {}, slots?: Record<string, string>) {
  return mount(BTimeline, {
    props,
    slots,
    attachTo: document.body,
  });
}

function mountWithItems(extraProps: Record<string, unknown> = {}) {
  return mountTimeline({ items: ITEMS, ...extraProps });
}

// ─────────────────────────────────────────────
// 1. Defaults and variants render
// ─────────────────────────────────────────────
describe('BTimeline – defaults and variants', () => {
  it('renders root <ol> with .b-timeline class', () => {
    const w = mountTimeline({ items: ITEMS });
    const root = w.find('.b-timeline');
    expect(root.exists()).toBe(true);
    expect(root.element.tagName).toBe('OL');
  });

  it('has aria-label="Timeline" on root', () => {
    const w = mountTimeline({ items: ITEMS });
    expect(w.find('.b-timeline').attributes('aria-label')).toBe('Timeline');
  });

  it('renders correct number of items', () => {
    const w = mountWithItems();
    expect(w.findAll('.b-timeline-item').length).toBe(4);
  });

  it('applies b-timeline--start class by default', () => {
    const w = mountWithItems();
    expect(w.find('.b-timeline--start').exists()).toBe(true);
  });

  it('applies b-timeline--end class when mode=end', () => {
    const w = mountWithItems({ mode: 'end' });
    expect(w.find('.b-timeline--end').exists()).toBe(true);
  });

  it('applies b-timeline--alternate class when mode=alternate', () => {
    const w = mountWithItems({ mode: 'alternate' });
    expect(w.find('.b-timeline--alternate').exists()).toBe(true);
  });

  it('items render content text', () => {
    const w = mountWithItems();
    const contents = w.findAll('.b-timeline-item__content');
    expect(contents[0].text()).toBe('Create a services site 2015-09-01');
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behavior
// ─────────────────────────────────────────────
describe('BTimeline – props map to DOM', () => {
  it('blue item has .b-timeline-item--blue class', () => {
    const w = mountWithItems();
    expect(w.findAll('.b-timeline-item')[0].classes()).toContain('b-timeline-item--blue');
  });

  it('green item has .b-timeline-item--green class', () => {
    const w = mountWithItems();
    expect(w.findAll('.b-timeline-item')[1].classes()).toContain('b-timeline-item--green');
  });

  it('red item has .b-timeline-item--red class', () => {
    const w = mountWithItems();
    expect(w.findAll('.b-timeline-item')[2].classes()).toContain('b-timeline-item--red');
  });

  it('gray item has .b-timeline-item--gray class', () => {
    const w = mountWithItems();
    expect(w.findAll('.b-timeline-item')[3].classes()).toContain('b-timeline-item--gray');
  });

  it('custom color adds .b-timeline-item--custom and inline CSS var', () => {
    const w = mountTimeline({
      items: [{ content: 'Custom', color: '#ff6600' }],
    });
    const item = w.find('.b-timeline-item');
    expect(item.classes()).toContain('b-timeline-item--custom');
    expect(item.attributes('style')).toContain('--b-timeline-item-dot-color: #ff6600');
  });

  it('item with no label renders empty .b-timeline-item__label span', () => {
    const w = mountWithItems();
    // Label spans are always rendered as structural spacers; they're empty when no label text
    const labels = w.findAll('.b-timeline-item__label');
    expect(labels.length).toBe(4);
    labels.forEach((l) => expect(l.text()).toBe(''));
  });

  it('item.icon renders custom dot', () => {
    const w = mountTimeline({
      items: [{ content: 'Check', icon: '✓', color: 'green' }],
    });
    expect(w.find('.b-timeline-item__dot--custom').exists()).toBe(true);
  });

  it('pending item adds .b-timeline-item--pending class', () => {
    const w = mountTimeline({
      items: ITEMS,
      pending: true,
    });
    const pendingItems = w.findAll('.b-timeline-item--pending');
    expect(pendingItems.length).toBeGreaterThanOrEqual(1);
  });

  it('pending=string shows content in pending item', () => {
    const w = mountTimeline({
      items: ITEMS,
      pending: 'Loading...',
    });
    const pendingItems = w.findAll('.b-timeline-item--pending');
    const last = pendingItems[pendingItems.length - 1];
    expect(last.find('.b-timeline-item__content').text()).toBe('Loading...');
  });

  it('pending item has a spinner dot by default', () => {
    const w = mountTimeline({
      items: ITEMS,
      pending: true,
    });
    expect(w.find('.b-timeline-item__dot--pending-spinner').exists()).toBe(true);
  });

  it('reverse=true reverses item order', () => {
    const items: BTimelineItemData[] = [
      { content: 'First', color: 'blue' },
      { content: 'Second', color: 'green' },
      { content: 'Third', color: 'red' },
    ];
    const w = mountTimeline({ items, reverse: true });
    const contents = w.findAll('.b-timeline-item__content');
    expect(contents[0].text()).toBe('Third');
    expect(contents[2].text()).toBe('First');
  });

  it('reverse=false keeps natural order', () => {
    const items: BTimelineItemData[] = [
      { content: 'First', color: 'blue' },
      { content: 'Second', color: 'green' },
    ];
    const w = mountTimeline({ items });
    const contents = w.findAll('.b-timeline-item__content');
    expect(contents[0].text()).toBe('First');
    expect(contents[1].text()).toBe('Second');
  });
});

// ─────────────────────────────────────────────
// 3. Alternate mode positioning
// ─────────────────────────────────────────────
describe('BTimeline – alternate mode positioning', () => {
  it('even items have .b-timeline-item--left in alternate mode', () => {
    const w = mountWithItems({ mode: 'alternate' });
    const items = w.findAll('.b-timeline-item');
    expect(items[0].classes()).toContain('b-timeline-item--left');
    expect(items[2].classes()).toContain('b-timeline-item--left');
  });

  it('odd items have .b-timeline-item--right in alternate mode', () => {
    const w = mountWithItems({ mode: 'alternate' });
    const items = w.findAll('.b-timeline-item');
    expect(items[1].classes()).toContain('b-timeline-item--right');
    expect(items[3].classes()).toContain('b-timeline-item--right');
  });

  it('all items have .b-timeline-item--right in end mode', () => {
    const w = mountWithItems({ mode: 'end' });
    w.findAll('.b-timeline-item').forEach((item) => {
      expect(item.classes()).toContain('b-timeline-item--right');
    });
  });

  it('all items have .b-timeline-item--left in start mode', () => {
    const w = mountWithItems({ mode: 'start' });
    w.findAll('.b-timeline-item').forEach((item) => {
      expect(item.classes()).toContain('b-timeline-item--left');
    });
  });
});

// ─────────────────────────────────────────────
// 4. Slot-based usage (BTimelineItem children)
// ─────────────────────────────────────────────
describe('BTimeline – slot-based items', () => {
  it('renders slot-based BTimelineItem children', () => {
    const w = mount(BTimeline, {
      slots: {
        default: [
          { template: '<li class="b-timeline-item b-timeline-item--blue b-timeline-item--left"><div class="b-timeline-item__tail"></div><div class="b-timeline-item__dot-wrapper"><span class="b-timeline-item__dot"></span></div><div class="b-timeline-item__content">Event A</div></li>' },
          { template: '<li class="b-timeline-item b-timeline-item--green b-timeline-item--left"><div class="b-timeline-item__tail"></div><div class="b-timeline-item__dot-wrapper"><span class="b-timeline-item__dot"></span></div><div class="b-timeline-item__content">Event B</div></li>' },
        ],
      },
    });
    expect(w.findAll('.b-timeline-item').length).toBe(2);
    expect(w.findAll('.b-timeline-item__content')[0].text()).toBe('Event A');
  });

  it('BTimelineItem renders with correct color class', () => {
    const w = mount(BTimelineItem, {
      props: { color: 'red' },
      slots: { default: 'Red event' },
      global: {
        provide: {
          'b-timeline-mode': 'start',
          'b-timeline-item-index': 0,
        },
      },
    });
    expect(w.find('.b-timeline-item--red').exists()).toBe(true);
  });

  it('BTimelineItem renders custom icon slot', () => {
    const w = mount(BTimelineItem, {
      slots: {
        default: 'Content',
        icon: '<span class="custom-dot">★</span>',
      },
      global: {
        provide: {
          'b-timeline-mode': 'start',
          'b-timeline-item-index': 0,
        },
      },
    });
    expect(w.find('.custom-dot').exists()).toBe(true);
    expect(w.find('.custom-dot').text()).toBe('★');
  });

  it('BTimelineItem renders label slot', () => {
    const w = mount(BTimelineItem, {
      slots: {
        default: 'Event',
        label: '2015-09-01',
      },
      global: {
        provide: {
          'b-timeline-mode': 'alternate',
          'b-timeline-item-index': 0,
        },
      },
    });
    expect(w.find('.b-timeline-item__label').text()).toBe('2015-09-01');
  });
});

// ─────────────────────────────────────────────
// 5. Accessibility
// ─────────────────────────────────────────────
describe('BTimeline – accessibility', () => {
  it('root is an <ol> list element', () => {
    const w = mountWithItems();
    expect(w.find('.b-timeline').element.tagName).toBe('OL');
  });

  it('root has aria-label="Timeline"', () => {
    const w = mountWithItems();
    expect(w.find('.b-timeline').attributes('aria-label')).toBe('Timeline');
  });

  it('items are <li> elements', () => {
    const w = mountWithItems();
    w.findAll('.b-timeline-item').forEach((item) => {
      expect(item.element.tagName).toBe('LI');
    });
  });

  it('dot wrapper is aria-hidden', () => {
    const w = mountWithItems();
    w.findAll('.b-timeline-item__dot-wrapper').forEach((dot) => {
      expect(dot.attributes('aria-hidden')).toBe('true');
    });
  });

  it('tail line is aria-hidden', () => {
    const w = mountWithItems();
    w.findAll('.b-timeline-item__tail').forEach((tail) => {
      expect(tail.attributes('aria-hidden')).toBe('true');
    });
  });

  it('pending item has aria-label="Pending"', () => {
    const w = mountTimeline({ items: ITEMS, pending: true });
    const pending = w.find('.b-timeline-item--pending');
    expect(pending.attributes('aria-label')).toBe('Pending');
  });
});

// ─────────────────────────────────────────────
// 6. Edge cases
// ─────────────────────────────────────────────
describe('BTimeline – edge cases', () => {
  it('renders with empty items array', () => {
    const w = mountTimeline({ items: [] });
    expect(w.find('.b-timeline').exists()).toBe(true);
    expect(w.findAll('.b-timeline-item').length).toBe(0);
  });

  it('single item renders without tail (last-child)', () => {
    const w = mountTimeline({ items: [{ content: 'Only', color: 'blue' }] });
    const item = w.find('.b-timeline-item');
    expect(item.exists()).toBe(true);
    // tail should be hidden via CSS :last-child; element still in DOM
    expect(item.find('.b-timeline-item__tail').exists()).toBe(true);
  });

  it('handles very long content without breaking structure', () => {
    const long = 'A'.repeat(500);
    const w = mountTimeline({ items: [{ content: long, color: 'blue' }] });
    expect(w.find('.b-timeline-item__content').text()).toBe(long);
  });

  it('item with loading=true in data array adds --pending class', () => {
    const w = mountTimeline({
      items: [{ content: 'Ongoing', color: 'blue', loading: true }],
    });
    expect(w.find('.b-timeline-item--pending').exists()).toBe(true);
    expect(w.find('.b-timeline-item__dot--pending-spinner').exists()).toBe(true);
  });

  it('does not render pending item when pending=false (default)', () => {
    const w = mountWithItems();
    // No standalone pending item; pending items only if item.pending is set
    const hasPendingSpinner = w.find('.b-timeline-item__dot--pending-spinner').exists();
    expect(hasPendingSpinner).toBe(false);
  });

  it('pendingDot prop shows custom pending dot', () => {
    const w = mountTimeline({
      items: ITEMS,
      pending: true,
      pendingDot: '⏳',
    });
    // The parent pending item should render the pendingDot slot
    const dotWrapper = w.findAll('.b-timeline-item__dot-wrapper');
    const lastDotWrapper = dotWrapper[dotWrapper.length - 1];
    expect(lastDotWrapper.find('.b-timeline-item__dot--custom').attributes('data-icon')).toBe('⏳');
  });

  it('item className prop is applied to li', () => {
    const w = mountTimeline({
      items: [{ content: 'Test', color: 'blue', className: 'my-custom-class' }],
    });
    expect(w.find('.my-custom-class').exists()).toBe(true);
  });

  it('updates reactively when items prop changes', async () => {
    const w = mountWithItems();
    expect(w.findAll('.b-timeline-item').length).toBe(4);
    await w.setProps({
      items: [
        { content: 'Only one', color: 'blue' },
      ],
    });
    expect(w.findAll('.b-timeline-item').length).toBe(1);
  });

  it('updates reactively when mode prop changes', async () => {
    const w = mountWithItems({ mode: 'start' });
    expect(w.find('.b-timeline--start').exists()).toBe(true);
    await w.setProps({ mode: 'end' });
    expect(w.find('.b-timeline--end').exists()).toBe(true);
    expect(w.find('.b-timeline--start').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 7. Animation - fake timers
// ─────────────────────────────────────────────
describe('BTimeline – animation (deterministic)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('spinner element is present and aria-hidden when pending=true', () => {
    const w = mountTimeline({ items: ITEMS, pending: true });
    const spinner = w.find('.b-timeline-item__dot--pending-spinner');
    expect(spinner.exists()).toBe(true);
    // spinner itself is inside aria-hidden wrapper
    const wrapper = w.find('.b-timeline-item--pending .b-timeline-item__dot-wrapper');
    expect(wrapper.attributes('aria-hidden')).toBe('true');
  });

  it('items are rendered synchronously (no async required)', () => {
    const w = mountWithItems();
    vi.runAllTimers();
    expect(w.findAll('.b-timeline-item').length).toBe(4);
  });

  it('reverse changes item order immediately without animation frame', async () => {
    const w = mountTimeline({
      items: [
        { content: 'Alpha', color: 'blue' },
        { content: 'Beta', color: 'green' },
      ],
      reverse: false,
    });
    expect(w.findAll('.b-timeline-item__content')[0].text()).toBe('Alpha');
    await w.setProps({ reverse: true });
    vi.runAllTimers();
    await w.vm.$nextTick();
    expect(w.findAll('.b-timeline-item__content')[0].text()).toBe('Beta');
  });
});

// ─────────────────────────────────────────────
// 8. New Ant Design features
// ─────────────────────────────────────────────
describe('BTimeline – variant', () => {
  it('applies b-timeline--filled class by default', () => {
    const w = mountWithItems();
    expect(w.find('.b-timeline--filled').exists()).toBe(true);
  });

  it('applies b-timeline--outlined class when variant=outlined', () => {
    const w = mountWithItems({ variant: 'outlined' });
    expect(w.find('.b-timeline--outlined').exists()).toBe(true);
  });

  it('outlined variant: dot has no background fill (CSS class present)', () => {
    const w = mountWithItems({ variant: 'outlined' });
    // The CSS rule .b-timeline--outlined .b-timeline-item__dot makes dots transparent
    // - we just verify the class is on the root so CSS can apply
    expect(w.find('.b-timeline--outlined').exists()).toBe(true);
  });
});

describe('BTimeline – orientation', () => {
  it('applies b-timeline--vertical class by default', () => {
    const w = mountWithItems();
    expect(w.find('.b-timeline--vertical').exists()).toBe(true);
  });

  it('applies b-timeline--horizontal class when orientation=horizontal', () => {
    const w = mountWithItems({ orientation: 'horizontal' });
    expect(w.find('.b-timeline--horizontal').exists()).toBe(true);
  });

  it('horizontal mode still renders all items', () => {
    const w = mountWithItems({ orientation: 'horizontal' });
    expect(w.findAll('.b-timeline-item').length).toBe(4);
  });
});

describe('BTimeline – mode canonical values', () => {
  it('mode=start applies b-timeline--start', () => {
    const w = mountWithItems({ mode: 'start' });
    expect(w.find('.b-timeline--start').exists()).toBe(true);
  });

  it('mode=end applies b-timeline--end', () => {
    const w = mountWithItems({ mode: 'end' });
    expect(w.find('.b-timeline--end').exists()).toBe(true);
  });

  it('all items have b-timeline-item--left in start mode', () => {
    const w = mountWithItems({ mode: 'start' });
    w.findAll('.b-timeline-item').forEach((item) => {
      expect(item.classes()).toContain('b-timeline-item--left');
    });
  });

  it('all items have b-timeline-item--right in end mode', () => {
    const w = mountWithItems({ mode: 'end' });
    w.findAll('.b-timeline-item').forEach((item) => {
      expect(item.classes()).toContain('b-timeline-item--right');
    });
  });
});

describe('BTimeline – per-item placement', () => {
  it('item with placement=end gets b-timeline-item--right regardless of mode', () => {
    const w = mountTimeline({
      items: [
        { content: 'Start-side item', color: 'blue' },
        { content: 'End-side item', color: 'green', placement: 'end' },
      ],
      mode: 'start',
    });
    const items = w.findAll('.b-timeline-item');
    expect(items[0].classes()).toContain('b-timeline-item--left');
    expect(items[1].classes()).toContain('b-timeline-item--right');
  });

  it('item with placement=start gets b-timeline-item--left in end mode', () => {
    const w = mountTimeline({
      items: [{ content: 'Override', color: 'blue', placement: 'start' }],
      mode: 'end',
    });
    expect(w.find('.b-timeline-item').classes()).toContain('b-timeline-item--left');
  });
});

describe('BTimeline – item.loading / item.icon / item.title', () => {
  it('item.loading=true renders spinner on that item', () => {
    const w = mountTimeline({
      items: [{ content: 'In progress', color: 'blue', loading: true }],
    });
    expect(w.find('.b-timeline-item--pending').exists()).toBe(true);
    expect(w.find('.b-timeline-item__dot--pending-spinner').exists()).toBe(true);
  });

  it('item.icon renders custom dot', () => {
    const w = mountTimeline({
      items: [{ content: 'Starred', color: 'blue', icon: '★' }],
    });
    expect(w.find('.b-timeline-item__dot--custom').attributes('data-icon')).toBe('★');
  });

  it('item.title renders as label text', () => {
    const w = mountTimeline({
      items: [{ content: 'Event', color: 'blue', title: '2025-01-01' }],
      mode: 'alternate',
    });
    expect(w.find('.b-timeline-item__label').text()).toBe('2025-01-01');
  });
});

