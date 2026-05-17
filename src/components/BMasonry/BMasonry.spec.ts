import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BMasonry from './BMasonry.vue';
import type { BMasonryItem } from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeItems(count: number): BMasonryItem[] {
  return Array.from({ length: count }, (_, i) => ({
    key: i,
    height: 100 + i * 20,
  }));
}

// ResizeObserver is not available in jsdom — stub it
class ResizeObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('BMasonry', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ── Rendering ───────────────────────────────────────────────────────────────

  it('renders with root class b-masonry', () => {
    const wrapper = mount(BMasonry);
    expect(wrapper.find('.b-masonry').exists()).toBe(true);
  });

  it('renders the correct number of columns (default = 3)', () => {
    const wrapper = mount(BMasonry, { props: { items: makeItems(6) } });
    expect(wrapper.findAll('.b-masonry__column').length).toBe(3);
  });

  it('renders a custom column count', () => {
    const wrapper = mount(BMasonry, { props: { columns: 4, items: makeItems(4) } });
    expect(wrapper.findAll('.b-masonry__column').length).toBe(4);
  });

  it('renders zero columns when items is empty', () => {
    const wrapper = mount(BMasonry, { props: { columns: 3, items: [] } });
    // Three columns exist but they are empty
    expect(wrapper.findAll('.b-masonry__column').length).toBe(3);
    expect(wrapper.findAll('.b-masonry__item').length).toBe(0);
  });

  it('renders the correct number of items', () => {
    const wrapper = mount(BMasonry, { props: { items: makeItems(5), columns: 3 } });
    expect(wrapper.findAll('.b-masonry__item').length).toBe(5);
  });

  // ── Accessibility ───────────────────────────────────────────────────────────

  it('has role="list" on root', () => {
    const wrapper = mount(BMasonry);
    expect(wrapper.find('.b-masonry').attributes('role')).toBe('list');
  });

  it('has aria-label on root', () => {
    const wrapper = mount(BMasonry);
    expect(wrapper.find('.b-masonry').attributes('aria-label')).toBeTruthy();
  });

  it('items have role="listitem"', () => {
    const wrapper = mount(BMasonry, { props: { items: makeItems(3) } });
    wrapper.findAll('.b-masonry__item').forEach((el) => {
      expect(el.attributes('role')).toBe('listitem');
    });
  });

  it('columns have role="presentation"', () => {
    const wrapper = mount(BMasonry, { props: { items: makeItems(3) } });
    wrapper.findAll('.b-masonry__column').forEach((el) => {
      expect(el.attributes('role')).toBe('presentation');
    });
  });

  // ── Layout algorithm ────────────────────────────────────────────────────────

  it('distributes items roughly evenly across columns when heights are equal', () => {
    const items: BMasonryItem[] = Array.from({ length: 6 }, (_, i) => ({
      key: i,
      height: 100,
    }));
    const wrapper = mount(BMasonry, { props: { columns: 3, items } });
    const cols = wrapper.findAll('.b-masonry__column');
    // Each column should receive 2 items
    cols.forEach((col) => {
      expect(col.findAll('.b-masonry__item').length).toBe(2);
    });
  });

  it('respects the column pin on items', () => {
    const items: BMasonryItem[] = [
      { key: 'a', height: 100, column: 1 },
      { key: 'b', height: 100, column: 1 },
      { key: 'c', height: 100, column: 3 },
    ];
    const wrapper = mount(BMasonry, { props: { columns: 3, items } });
    const cols = wrapper.findAll('.b-masonry__column');
    // Col 0 (pin=1) has 2 items; col 2 (pin=3) has 1 item
    expect(cols[0].findAll('.b-masonry__item').length).toBe(2);
    expect(cols[2].findAll('.b-masonry__item').length).toBe(1);
  });

  it('clamps out-of-bounds column pin to last column', () => {
    const items: BMasonryItem[] = [{ key: 'x', height: 100, column: 99 }];
    const wrapper = mount(BMasonry, { props: { columns: 2, items } });
    const cols = wrapper.findAll('.b-masonry__column');
    // Should land in the last column (index 1)
    expect(cols[1].findAll('.b-masonry__item').length).toBe(1);
  });

  // ── CSS custom properties ───────────────────────────────────────────────────

  it('sets --b-masonry-columns on root style', () => {
    const wrapper = mount(BMasonry, { props: { columns: 4, items: [] } });
    const style = wrapper.find('.b-masonry').attributes('style') ?? '';
    expect(style).toContain('--b-masonry-columns: 4');
  });

  it('sets --b-masonry-col-gap and --b-masonry-row-gap from gutter', () => {
    const wrapper = mount(BMasonry, { props: { gutter: 16, items: [] } });
    const style = wrapper.find('.b-masonry').attributes('style') ?? '';
    expect(style).toContain('--b-masonry-col-gap: 16px');
    expect(style).toContain('--b-masonry-row-gap: 16px');
  });

  it('accepts [colGap, rowGap] tuple for gutter', () => {
    const wrapper = mount(BMasonry, { props: { gutter: [16, 8], items: [] } });
    const style = wrapper.find('.b-masonry').attributes('style') ?? '';
    expect(style).toContain('--b-masonry-col-gap: 16px');
    expect(style).toContain('--b-masonry-row-gap: 8px');
  });

  // ── classNames / styles customisation ───────────────────────────────────────

  it('applies root classNames string', () => {
    const wrapper = mount(BMasonry, {
      props: { classNames: { root: 'my-masonry' }, items: [] },
    });
    expect(wrapper.find('.b-masonry').classes()).toContain('my-masonry');
  });

  it('applies item classNames function', () => {
    const items: BMasonryItem[] = [{ key: 'k1', height: 100 }];
    const wrapper = mount(BMasonry, {
      props: {
        columns: 1,
        items,
        classNames: { item: (_item: BMasonryItem) => 'custom-item' },
      },
    });
    expect(wrapper.find('.b-masonry__item').classes()).toContain('custom-item');
  });

  it('applies column classNames string', () => {
    const wrapper = mount(BMasonry, {
      props: { classNames: { column: 'my-col' }, columns: 2, items: makeItems(2) },
    });
    wrapper.findAll('.b-masonry__column').forEach((col) => {
      expect(col.classes()).toContain('my-col');
    });
  });

  // ── layoutChange event ───────────────────────────────────────────────────────

  it('emits layoutChange with correct columns value', async () => {
    const wrapper = mount(BMasonry, { props: { columns: 2, items: makeItems(4) } });
    await flushPromises();
    const events = wrapper.emitted('layoutChange') as [{ columns: number }][];
    expect(events).toBeTruthy();
    expect(events[events.length - 1][0].columns).toBe(2);
  });

  it('emits layoutChange with a columnMap keyed by item key', async () => {
    const items: BMasonryItem[] = [
      { key: 'a', height: 100 },
      { key: 'b', height: 100 },
    ];
    const wrapper = mount(BMasonry, { props: { columns: 2, items } });
    await flushPromises();
    const events = wrapper.emitted('layoutChange') as [
      { columns: number; columnMap: Record<string, number> },
    ][];
    const last = events[events.length - 1][0];
    expect(Object.keys(last.columnMap)).toContain('a');
    expect(Object.keys(last.columnMap)).toContain('b');
  });

  // ── Named item slot ─────────────────────────────────────────────────────────

  it('renders content via named item slot', () => {
    const items: BMasonryItem[] = [{ key: 1, height: 100 }];
    const wrapper = mount(BMasonry, {
      props: { columns: 1, items },
      slots: {
        item: `<template #item="{ item }"><span class="slot-content">{{ item.key }}</span></template>`,
      },
    });
    expect(wrapper.find('.slot-content').text()).toBe('1');
  });

  it('passes correct slot props (item, index, column)', () => {
    const items: BMasonryItem[] = [{ key: 'z', height: 100 }];
    const receivedProps: Record<string, unknown>[] = [];
    const wrapper = mount(BMasonry, {
      props: { columns: 1, items },
      slots: {
        item: (props: Record<string, unknown>) => {
          receivedProps.push(props);
          return [];
        },
      },
    });
    expect(receivedProps[0]).toMatchObject({
      item: { key: 'z', height: 100 },
      index: 0,
      column: 0,
    });
  });

  // ── data-masonry-key attribute ───────────────────────────────────────────────

  it('sets data-masonry-key on every item wrapper', () => {
    const items: BMasonryItem[] = [
      { key: 'foo', height: 50 },
      { key: 42, height: 80 },
    ];
    const wrapper = mount(BMasonry, { props: { columns: 2, items } });
    const els = wrapper.findAll('[data-masonry-key]');
    const keys = els.map((el) => el.attributes('data-masonry-key'));
    expect(keys).toContain('foo');
    expect(keys).toContain('42');
  });

  // ── Edge cases ───────────────────────────────────────────────────────────────

  it('handles a single item gracefully', () => {
    const wrapper = mount(BMasonry, {
      props: { columns: 3, items: [{ key: 'only', height: 200 }] },
    });
    expect(wrapper.findAll('.b-masonry__item').length).toBe(1);
  });

  it('handles columns=1 (single column)', () => {
    const wrapper = mount(BMasonry, { props: { columns: 1, items: makeItems(5) } });
    expect(wrapper.findAll('.b-masonry__column').length).toBe(1);
    expect(wrapper.findAll('.b-masonry__item').length).toBe(5);
  });

  it('does not throw when ResizeObserver is unavailable', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    expect(() => mount(BMasonry, { props: { items: makeItems(3), fresh: true } })).not.toThrow();
  });

  it('re-renders when items prop changes', async () => {
    const wrapper = mount(BMasonry, { props: { columns: 2, items: makeItems(2) } });
    expect(wrapper.findAll('.b-masonry__item').length).toBe(2);
    await wrapper.setProps({ items: makeItems(6) });
    expect(wrapper.findAll('.b-masonry__item').length).toBe(6);
  });

  it('re-renders when columns prop changes', async () => {
    const wrapper = mount(BMasonry, { props: { columns: 2, items: makeItems(4) } });
    expect(wrapper.findAll('.b-masonry__column').length).toBe(2);
    await wrapper.setProps({ columns: 4 });
    expect(wrapper.findAll('.b-masonry__column').length).toBe(4);
  });
});
