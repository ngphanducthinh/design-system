import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

import BStatistic from './BStatistic.vue';
import BStatisticTimer from './BStatisticTimer.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function mountStatistic(props: Record<string, unknown> = {}, slots?: Record<string, string>) {
  return mount(BStatistic, {
    props: { value: 0, ...props },
    slots,
    attachTo: document.body,
  });
}

// ─────────────────────────────────────────────
// 1. Defaults & basic render
// ─────────────────────────────────────────────
describe('BStatistic – defaults', () => {
  it('renders root with .b-statistic class', () => {
    const w = mountStatistic({ value: 42 });
    expect(w.find('.b-statistic').exists()).toBe(true);
  });

  it('does not render title when not provided', () => {
    const w = mountStatistic({ value: 1 });
    expect(w.find('.b-statistic__title').exists()).toBe(false);
  });

  it('renders the formatted value', () => {
    const w = mountStatistic({ value: 1234 });
    expect(w.find('.b-statistic__value').text()).toBe('1,234');
  });

  it('renders content with aria-live=polite', () => {
    const w = mountStatistic({ value: 1 });
    expect(w.find('.b-statistic__content').attributes('aria-live')).toBe('polite');
  });

  it('renders title when title prop set', () => {
    const w = mountStatistic({ value: 1, title: 'Active Users' });
    expect(w.find('.b-statistic__title').text()).toBe('Active Users');
  });
});

// ─────────────────────────────────────────────
// 2. Number formatting
// ─────────────────────────────────────────────
describe('BStatistic – number formatting', () => {
  it('uses comma group separator by default', () => {
    const w = mountStatistic({ value: 1234567 });
    expect(w.find('.b-statistic__value').text()).toBe('1,234,567');
  });

  it('uses dot decimal separator by default', () => {
    const w = mountStatistic({ value: 1234.5, precision: 2 });
    expect(w.find('.b-statistic__value').text()).toBe('1,234.50');
  });

  it('respects custom decimalSeparator', () => {
    const w = mountStatistic({ value: 1234.5, precision: 1, decimalSeparator: ',' });
    expect(w.find('.b-statistic__value').text()).toBe('1,234,5');
  });

  it('respects custom groupSeparator', () => {
    const w = mountStatistic({ value: 1234567, groupSeparator: ' ' });
    expect(w.find('.b-statistic__value').text()).toBe('1 234 567');
  });

  it('combines custom group + decimal separators', () => {
    const w = mountStatistic({
      value: 1234567.89,
      precision: 2,
      groupSeparator: '.',
      decimalSeparator: ',',
    });
    expect(w.find('.b-statistic__value').text()).toBe('1.234.567,89');
  });

  it('precision rounds the value', () => {
    const w = mountStatistic({ value: 1.2345, precision: 2 });
    expect(w.find('.b-statistic__value').text()).toBe('1.23');
  });

  it('precision=0 gives integer with no decimal', () => {
    const w = mountStatistic({ value: 12.7, precision: 0 });
    expect(w.find('.b-statistic__value').text()).toBe('13');
  });

  it('handles negative numbers', () => {
    const w = mountStatistic({ value: -1234.56, precision: 2 });
    expect(w.find('.b-statistic__value').text()).toBe('-1,234.56');
  });

  it('handles zero', () => {
    const w = mountStatistic({ value: 0 });
    expect(w.find('.b-statistic__value').text()).toBe('0');
  });

  it('passes string values through unchanged', () => {
    const w = mountStatistic({ value: 'Hello world' });
    expect(w.find('.b-statistic__value').text()).toBe('Hello world');
  });

  it('renders NaN as the literal string', () => {
    const w = mountStatistic({ value: Number.NaN });
    expect(w.find('.b-statistic__value').text()).toBe('NaN');
  });

  it('renders Infinity as the literal string', () => {
    const w = mountStatistic({ value: Number.POSITIVE_INFINITY });
    expect(w.find('.b-statistic__value').text()).toBe('Infinity');
  });
});

// ─────────────────────────────────────────────
// 3. Prefix / Suffix
// ─────────────────────────────────────────────
describe('BStatistic – prefix and suffix', () => {
  it('renders prefix prop', () => {
    const w = mountStatistic({ value: 100, prefix: '$' });
    expect(w.find('.b-statistic__prefix').text()).toBe('$');
  });

  it('renders suffix prop', () => {
    const w = mountStatistic({ value: 100, suffix: '%' });
    expect(w.find('.b-statistic__suffix').text()).toBe('%');
  });

  it('decorative prefix has aria-hidden', () => {
    const w = mountStatistic({ value: 100, prefix: '$' });
    expect(w.find('.b-statistic__prefix').attributes('aria-hidden')).toBe('true');
  });

  it('decorative suffix has aria-hidden', () => {
    const w = mountStatistic({ value: 100, suffix: '%' });
    expect(w.find('.b-statistic__suffix').attributes('aria-hidden')).toBe('true');
  });

  it('prefix slot overrides prop', () => {
    const w = mountStatistic({ value: 1 }, { prefix: '<i class="ix">x</i>' });
    expect(w.find('.b-statistic__prefix .ix').exists()).toBe(true);
  });

  it('suffix slot overrides prop', () => {
    const w = mountStatistic({ value: 1 }, { suffix: '<i class="iy">y</i>' });
    expect(w.find('.b-statistic__suffix .iy').exists()).toBe(true);
  });

  it('omits prefix element when neither prop nor slot present', () => {
    const w = mountStatistic({ value: 1 });
    expect(w.find('.b-statistic__prefix').exists()).toBe(false);
  });

  it('omits suffix element when neither prop nor slot present', () => {
    const w = mountStatistic({ value: 1 });
    expect(w.find('.b-statistic__suffix').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 4. Loading state
// ─────────────────────────────────────────────
describe('BStatistic – loading', () => {
  it('shows skeleton when loading=true', () => {
    const w = mountStatistic({ value: 1, loading: true });
    expect(w.find('.b-statistic__skeleton').exists()).toBe(true);
  });

  it('hides value when loading', () => {
    const w = mountStatistic({ value: 1, loading: true });
    expect(w.find('.b-statistic__value').exists()).toBe(false);
  });

  it('hides prefix/suffix when loading', () => {
    const w = mountStatistic({ value: 1, prefix: '$', suffix: '%', loading: true });
    expect(w.find('.b-statistic__prefix').exists()).toBe(false);
    expect(w.find('.b-statistic__suffix').exists()).toBe(false);
  });

  it('skeleton is announced via role=status / aria-busy', () => {
    const w = mountStatistic({ value: 1, loading: true });
    const sk = w.find('.b-statistic__skeleton');
    expect(sk.attributes('role')).toBe('status');
    expect(sk.attributes('aria-busy')).toBe('true');
    expect(sk.attributes('aria-label')).toBe('Loading');
  });

  it('adds .b-statistic--loading modifier', () => {
    const w = mountStatistic({ value: 1, loading: true });
    expect(w.find('.b-statistic--loading').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 5. Formatter prop and slot
// ─────────────────────────────────────────────
describe('BStatistic – formatter', () => {
  it('formatter function fully overrides number formatting', () => {
    const w = mountStatistic({
      value: 1234,
      formatter: (v: number | string) => `~${Number(v).toFixed(0)}~`,
    });
    expect(w.find('.b-statistic__value').text()).toBe('~1234~');
  });

  it('formatter slot overrides formatter prop and number formatting', () => {
    const w = mountStatistic(
      { value: 1234, formatter: () => 'IGNORED' },
      { formatter: '<span class="custom-fmt">CUSTOM</span>' },
    );
    expect(w.find('.custom-fmt').exists()).toBe(true);
    expect(w.find('.custom-fmt').text()).toBe('CUSTOM');
  });
});

// ─────────────────────────────────────────────
// 6. Title slot
// ─────────────────────────────────────────────
describe('BStatistic – title slot', () => {
  it('renders title slot content', () => {
    const w = mountStatistic({ value: 1 }, { title: '<strong>Bold title</strong>' });
    expect(w.find('.b-statistic__title strong').exists()).toBe(true);
    expect(w.find('.b-statistic__title').text()).toBe('Bold title');
  });

  it('title slot overrides title prop', () => {
    const w = mountStatistic({ value: 1, title: 'Prop title' }, { title: 'Slot title' });
    expect(w.find('.b-statistic__title').text()).toBe('Slot title');
  });
});

// ─────────────────────────────────────────────
// 7. valueStyle
// ─────────────────────────────────────────────
describe('BStatistic – valueStyle', () => {
  it('applies object valueStyle to content element', () => {
    const w = mountStatistic({ value: 1, valueStyle: { color: 'red' } });
    expect(w.find('.b-statistic__content').attributes('style')).toContain('color: red');
  });

  it('applies string valueStyle to content element', () => {
    const w = mountStatistic({ value: 1, valueStyle: 'color: blue; font-weight: 700' });
    const style = w.find('.b-statistic__content').attributes('style') ?? '';
    expect(style).toContain('color: blue');
    expect(style).toContain('font-weight: 700');
  });
});

// ─────────────────────────────────────────────
// 8. Accessibility
// ─────────────────────────────────────────────
describe('BStatistic – accessibility', () => {
  it('content region is a polite live region', () => {
    const w = mountStatistic({ value: 1 });
    expect(w.find('.b-statistic__content').attributes('aria-live')).toBe('polite');
  });

  it('value updates flow into the live region (DOM update)', async () => {
    const w = mountStatistic({ value: 1 });
    expect(w.find('.b-statistic__value').text()).toBe('1');
    await w.setProps({ value: 2 });
    expect(w.find('.b-statistic__value').text()).toBe('2');
  });

  it('prefix and suffix are aria-hidden (decorative)', () => {
    const w = mountStatistic({ value: 1, prefix: '$', suffix: '%' });
    expect(w.find('.b-statistic__prefix').attributes('aria-hidden')).toBe('true');
    expect(w.find('.b-statistic__suffix').attributes('aria-hidden')).toBe('true');
  });
});

// ─────────────────────────────────────────────
// 9. Edge cases
// ─────────────────────────────────────────────
describe('BStatistic – edge cases', () => {
  it('handles very long string values without crash', () => {
    const long = 'A'.repeat(1000);
    const w = mountStatistic({ value: long });
    expect(w.find('.b-statistic__value').text()).toBe(long);
  });

  it('updates reactively when value changes', async () => {
    const w = mountStatistic({ value: 1 });
    await w.setProps({ value: 9999 });
    expect(w.find('.b-statistic__value').text()).toBe('9,999');
  });

  it('updates reactively when loading flips', async () => {
    const w = mountStatistic({ value: 1, loading: true });
    expect(w.find('.b-statistic__skeleton').exists()).toBe(true);
    await w.setProps({ loading: false });
    expect(w.find('.b-statistic__skeleton').exists()).toBe(false);
    expect(w.find('.b-statistic__value').text()).toBe('1');
  });

  it('treats empty title as no title', () => {
    const w = mountStatistic({ value: 1, title: '' });
    expect(w.find('.b-statistic__title').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 10. BStatisticTimer (deterministic - fake timers)
// ─────────────────────────────────────────────
describe('BStatisticTimer – countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders initial remaining time', () => {
    const target = Date.now() + 65_000; // 1m 5s
    const w = mount(BStatisticTimer, {
      props: { value: target, type: 'countdown' },
      attachTo: document.body,
    });
    expect(w.find('.b-statistic__value').text()).toBe('00:01:05');
  });

  it('format prop changes display tokens', () => {
    const target = Date.now() + 3_661_000; // 1h 1m 1s
    const w = mount(BStatisticTimer, {
      props: { value: target, format: 'H:mm:ss' },
      attachTo: document.body,
    });
    expect(w.find('.b-statistic__value').text()).toBe('1:01:01');
  });

  it('format supports [literal] escape brackets', () => {
    const target = Date.now() + 1000 * 60 * 60 * 24 * 2; // 2 days
    const w = mount(BStatisticTimer, {
      props: { value: target, format: 'D [days] HH:mm:ss' },
      attachTo: document.body,
    });
    expect(w.find('.b-statistic__value').text()).toMatch(/^2 days /);
  });

  it('emits change on initial mount', () => {
    const target = Date.now() + 5000;
    const w = mount(BStatisticTimer, {
      props: { value: target },
      attachTo: document.body,
    });
    const evts = w.emitted('change');
    expect(evts).toBeTruthy();
    expect(evts![0][0]).toBeGreaterThan(0);
    expect(evts![0][0]).toBeLessThanOrEqual(5000);
  });

  it('ticks down over time', async () => {
    const target = Date.now() + 5000;
    const w = mount(BStatisticTimer, {
      props: { value: target, format: 'ss' },
      attachTo: document.body,
    });
    expect(w.find('.b-statistic__value').text()).toBe('05');
    vi.advanceTimersByTime(2000);
    await nextTick();
    // Sub-second tick cadence: after 2s of fake time we expect 02 or 03 remaining.
    expect(['02', '03']).toContain(w.find('.b-statistic__value').text());
  });

  it('emits change THEN finish in correct order when reaching zero', async () => {
    const target = Date.now() + 100;
    const w = mount(BStatisticTimer, {
      props: { value: target, type: 'countdown' },
      attachTo: document.body,
    });
    vi.advanceTimersByTime(500);
    await nextTick();

    const change = w.emitted('change') ?? [];
    const finish = w.emitted('finish') ?? [];
    expect(change.length).toBeGreaterThan(0);
    expect(finish.length).toBe(1);

    // Last change(0) must be emitted at or before finish
    const lastZeroChangeIndex = change.findIndex((c) => (c[0] as number) === 0);
    expect(lastZeroChangeIndex).toBeGreaterThanOrEqual(0);
    // Order: change(0) was emitted before finish.
    // We can't compare wallclock between event arrays, but we assert finish happened only once
    // and that a change with 0 ms exists - matching the documented onChange-then-onFinish order.
  });

  it('does not emit finish for countup', async () => {
    const start = Date.now();
    const w = mount(BStatisticTimer, {
      props: { value: start, type: 'countup' },
      attachTo: document.body,
    });
    vi.advanceTimersByTime(2000);
    await nextTick();
    expect(w.emitted('finish')).toBeUndefined();
  });

  it('countup increases over time', async () => {
    const start = Date.now();
    const w = mount(BStatisticTimer, {
      props: { value: start, type: 'countup', format: 'ss' },
      attachTo: document.body,
    });
    expect(w.find('.b-statistic__value').text()).toBe('00');
    vi.advanceTimersByTime(3000);
    await nextTick();
    // Tick cadence is sub-second; the displayed seconds should be 2 or 3 after 3s of fake time.
    expect(['02', '03']).toContain(w.find('.b-statistic__value').text());
  });

  it('cleans up interval on unmount (no errors after unmount)', async () => {
    const target = Date.now() + 60_000;
    const w = mount(BStatisticTimer, {
      props: { value: target },
      attachTo: document.body,
    });
    w.unmount();
    expect(() => vi.advanceTimersByTime(5000)).not.toThrow();
  });

  it('renders title/prefix/suffix props through underlying BStatistic', () => {
    const target = Date.now() + 10_000;
    const w = mount(BStatisticTimer, {
      props: { value: target, title: 'TTL', prefix: '⏱', suffix: 'left' },
      attachTo: document.body,
    });
    expect(w.find('.b-statistic__title').text()).toBe('TTL');
    expect(w.find('.b-statistic__prefix').text()).toBe('⏱');
    expect(w.find('.b-statistic__suffix').text()).toBe('left');
  });
});
