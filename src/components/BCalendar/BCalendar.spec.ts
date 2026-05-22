import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';

import BCalendar from './BCalendar.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function mountCalendar(
  props: Record<string, unknown> = {},
  slots: Record<string, unknown> = {},
) {
  return mount(BCalendar, {
    props,
    // @ts-expect-error - test-utils slot typing is overly strict for scoped slots.
    slots,
    attachTo: document.body,
  });
}

function unmountSafe(wrapper: VueWrapper) {
  try {
    wrapper.unmount();
  } catch {
    // ignore
  }
}

const FIXED_NOW = new Date(2026, 4, 22); // 2026-05-22 (matches CLAUDE.md context).

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
  // jsdom does not implement <dialog>. Stub the methods BModal relies on.
  if (!(HTMLDialogElement.prototype as unknown as { showModal?: () => void }).showModal) {
    (HTMLDialogElement.prototype as unknown as { showModal: () => void }).showModal =
      function showModal(this: HTMLDialogElement) {
        this.setAttribute('open', '');
      };
  }
  if (!(HTMLDialogElement.prototype as unknown as { close?: () => void }).close) {
    (HTMLDialogElement.prototype as unknown as { close: () => void }).close =
      function close(this: HTMLDialogElement) {
        this.removeAttribute('open');
      };
  }
});

afterEach(() => {
  vi.useRealTimers();
});

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────
// 1. Defaults & variants
// ─────────────────────────────────────────────
describe('BCalendar - defaults and variants', () => {
  it('renders the .b-calendar root', () => {
    const wrapper = mountCalendar();
    expect(wrapper.find('.b-calendar').exists()).toBe(true);
    unmountSafe(wrapper);
  });

  it('uses fullscreen mode by default', () => {
    const wrapper = mountCalendar();
    expect(wrapper.find('.b-calendar--fullscreen').exists()).toBe(true);
    expect(wrapper.find('.b-calendar--mini').exists()).toBe(false);
    unmountSafe(wrapper);
  });

  it('switches to mini layout when fullscreen=false', () => {
    const wrapper = mountCalendar({ fullscreen: false });
    expect(wrapper.find('.b-calendar--mini').exists()).toBe(true);
    expect(wrapper.find('.b-calendar--fullscreen').exists()).toBe(false);
    unmountSafe(wrapper);
  });

  it('renders 42 day cells in month mode', () => {
    const wrapper = mountCalendar();
    const cells = wrapper.findAll('.b-calendar__cell');
    expect(cells).toHaveLength(42);
    unmountSafe(wrapper);
  });

  it('renders 12 month cells in year mode', () => {
    const wrapper = mountCalendar({ defaultMode: 'year' });
    const cells = wrapper.findAll('.b-calendar__cell--month');
    expect(cells).toHaveLength(12);
    unmountSafe(wrapper);
  });

  it('shows week-number column when showWeek=true', () => {
    const wrapper = mountCalendar({ showWeek: true });
    expect(wrapper.find('.b-calendar__weekday--week').exists()).toBe(true);
    expect(wrapper.findAll('.b-calendar__week-number').length).toBeGreaterThan(0);
    unmountSafe(wrapper);
  });
});

// ─────────────────────────────────────────────
// 2. Props → DOM & behavior
// ─────────────────────────────────────────────
describe('BCalendar - props map to DOM and behavior', () => {
  it('renders defaultValue selection', () => {
    const wrapper = mountCalendar({ defaultValue: new Date(2026, 4, 15) });
    const selected = wrapper.find('.b-calendar__cell--selected');
    expect(selected.exists()).toBe(true);
    expect(selected.attributes('data-b-calendar-date')).toBe('2026-05-15');
    unmountSafe(wrapper);
  });

  it('marks today with --today class', () => {
    const wrapper = mountCalendar();
    const today = wrapper.find(`[data-b-calendar-date="${isoDate(FIXED_NOW)}"]`);
    expect(today.classes()).toContain('b-calendar__cell--today');
    expect(today.attributes('aria-current')).toBe('date');
    unmountSafe(wrapper);
  });

  it('disables out-of-validRange dates', () => {
    const wrapper = mountCalendar({
      validRange: [new Date(2026, 4, 10), new Date(2026, 4, 20)],
    });
    const outOfRange = wrapper.find(`[data-b-calendar-date="2026-05-05"]`);
    expect(outOfRange.classes()).toContain('b-calendar__cell--disabled');
    expect(outOfRange.attributes('aria-disabled')).toBe('true');
    const inRange = wrapper.find(`[data-b-calendar-date="2026-05-15"]`);
    expect(inRange.classes()).not.toContain('b-calendar__cell--disabled');
    unmountSafe(wrapper);
  });

  it('honors disabledDate predicate', () => {
    const wrapper = mountCalendar({
      disabledDate: (d: Date) => d.getDate() === 1,
    });
    const first = wrapper.find(`[data-b-calendar-date="2026-05-01"]`);
    expect(first.classes()).toContain('b-calendar__cell--disabled');
    unmountSafe(wrapper);
  });

  it('changing year via header select updates panel', async () => {
    const wrapper = mountCalendar();
    const yearSelect = wrapper.find('.b-calendar__select--year');
    (yearSelect.element as HTMLSelectElement).value = '2027';
    await yearSelect.trigger('change');
    expect(wrapper.emitted('panelChange')).toBeTruthy();
    expect(wrapper.find('.b-calendar__select--year').element.getAttribute('value')).toBeTruthy();
    unmountSafe(wrapper);
  });
});

// ─────────────────────────────────────────────
// 3. Events
// ─────────────────────────────────────────────
describe('BCalendar - events', () => {
  it('emits update:modelValue, change, and select on date click', async () => {
    const wrapper = mountCalendar({ defaultValue: new Date(2026, 4, 1) });
    const cell = wrapper.find(`[data-b-calendar-date="2026-05-15"]`);
    await cell.trigger('click');
    const events = Object.keys(wrapper.emitted());
    expect(events).toContain('update:modelValue');
    expect(events).toContain('change');
    expect(events).toContain('select');
    expect(wrapper.emitted('select')?.[0]?.[1]).toMatchObject({ source: 'date' });
    unmountSafe(wrapper);
  });

  it('does not emit selection on disabled date', async () => {
    const wrapper = mountCalendar({
      disabledDate: () => true,
    });
    const cell = wrapper.find(`[data-b-calendar-date="${isoDate(FIXED_NOW)}"]`);
    await cell.trigger('click');
    expect(wrapper.emitted('change')).toBeUndefined();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    unmountSafe(wrapper);
  });

  it('emits panelChange + update:mode when mode switches', async () => {
    const wrapper = mountCalendar();
    const yearRadio = wrapper.findAll('.b-calendar__mode-option input')[1];
    await yearRadio.setValue();
    expect(wrapper.emitted('update:mode')?.[0]).toEqual(['year']);
    expect(wrapper.emitted('panelChange')?.[0]?.[1]).toBe('year');
    unmountSafe(wrapper);
  });

  it('selecting a month in year mode drills into month mode and emits select(source=month)', async () => {
    const wrapper = mountCalendar({ defaultMode: 'year' });
    const monthCells = wrapper.findAll('.b-calendar__cell--month');
    await monthCells[0].trigger('click'); // January
    expect(wrapper.emitted('select')?.[0]?.[1]).toMatchObject({ source: 'month' });
    expect(wrapper.emitted('update:mode')?.[0]).toEqual(['month']);
    unmountSafe(wrapper);
  });
});

// ─────────────────────────────────────────────
// 4. Keyboard navigation & focus
// ─────────────────────────────────────────────
describe('BCalendar - keyboard navigation', () => {
  it('Enter selects the focused date', async () => {
    const wrapper = mountCalendar({ defaultValue: new Date(2026, 4, 15) });
    const cell = wrapper.find(`[data-b-calendar-date="2026-05-15"]`);
    await cell.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('change')).toBeTruthy();
    unmountSafe(wrapper);
  });

  it('Space selects the focused date', async () => {
    const wrapper = mountCalendar({ defaultValue: new Date(2026, 4, 15) });
    const cell = wrapper.find(`[data-b-calendar-date="2026-05-15"]`);
    await cell.trigger('keydown', { key: ' ' });
    expect(wrapper.emitted('change')).toBeTruthy();
    unmountSafe(wrapper);
  });

  it('ArrowDown moves focus by one week', async () => {
    const wrapper = mountCalendar({ defaultValue: new Date(2026, 4, 15) });
    const cell = wrapper.find(`[data-b-calendar-date="2026-05-15"]`);
    await cell.trigger('keydown', { key: 'ArrowDown' });
    await nextTick();
    const next = wrapper.find(`[data-b-calendar-date="2026-05-22"]`);
    expect(next.attributes('tabindex')).toBe('0');
    unmountSafe(wrapper);
  });

  it('ArrowRight moves focus by one day, crossing months', async () => {
    const wrapper = mountCalendar({ defaultValue: new Date(2026, 4, 31) });
    const cell = wrapper.find(`[data-b-calendar-date="2026-05-31"]`);
    await cell.trigger('keydown', { key: 'ArrowRight' });
    await nextTick();
    expect(wrapper.emitted('panelChange')).toBeTruthy();
    unmountSafe(wrapper);
  });

  it('Home jumps to first day of month', async () => {
    const wrapper = mountCalendar({ defaultValue: new Date(2026, 4, 15) });
    const cell = wrapper.find(`[data-b-calendar-date="2026-05-15"]`);
    await cell.trigger('keydown', { key: 'Home' });
    await nextTick();
    const first = wrapper.find(`[data-b-calendar-date="2026-05-01"]`);
    expect(first.attributes('tabindex')).toBe('0');
    unmountSafe(wrapper);
  });

  it('End jumps to last day of month', async () => {
    const wrapper = mountCalendar({ defaultValue: new Date(2026, 4, 1) });
    const cell = wrapper.find(`[data-b-calendar-date="2026-05-01"]`);
    await cell.trigger('keydown', { key: 'End' });
    await nextTick();
    const last = wrapper.find(`[data-b-calendar-date="2026-05-31"]`);
    expect(last.attributes('tabindex')).toBe('0');
    unmountSafe(wrapper);
  });
});

// ─────────────────────────────────────────────
// 5. Accessibility
// ─────────────────────────────────────────────
describe('BCalendar - accessibility', () => {
  it('root has role=region with aria-label', () => {
    const wrapper = mountCalendar({ ariaLabel: 'My calendar' });
    expect(wrapper.find('.b-calendar').attributes('role')).toBe('region');
    expect(wrapper.find('.b-calendar').attributes('aria-label')).toBe('My calendar');
  });

  it('grid table has role=grid', () => {
    const wrapper = mountCalendar();
    expect(wrapper.find('.b-calendar__table').attributes('role')).toBe('grid');
  });

  it('day cells have role=gridcell', () => {
    const wrapper = mountCalendar();
    const cells = wrapper.findAll('.b-calendar__cell');
    cells.forEach((c) => {
      expect(c.attributes('role')).toBe('gridcell');
    });
  });

  it('selected cell has aria-selected="true"', () => {
    const wrapper = mountCalendar({ defaultValue: new Date(2026, 4, 15) });
    const sel = wrapper.find('.b-calendar__cell--selected');
    expect(sel.attributes('aria-selected')).toBe('true');
  });

  it('today cell has aria-current="date"', () => {
    const wrapper = mountCalendar();
    const today = wrapper.find(`[data-b-calendar-date="${isoDate(FIXED_NOW)}"]`);
    expect(today.attributes('aria-current')).toBe('date');
  });

  it('exposes a polite live region', () => {
    const wrapper = mountCalendar();
    const live = wrapper.find('.b-calendar__sr-only[aria-live="polite"]');
    expect(live.exists()).toBe(true);
  });

  it('mode switch is a radiogroup', () => {
    const wrapper = mountCalendar();
    expect(wrapper.find('.b-calendar__mode-switch').attributes('role')).toBe('radiogroup');
  });

  it('roving tabindex: only one cell has tabindex=0', () => {
    const wrapper = mountCalendar({ defaultValue: new Date(2026, 4, 15) });
    const focusables = wrapper
      .findAll('.b-calendar__cell')
      .filter((c) => c.attributes('tabindex') === '0');
    expect(focusables).toHaveLength(1);
    expect(focusables[0].attributes('data-b-calendar-date')).toBe('2026-05-15');
  });
});

// ─────────────────────────────────────────────
// 6. Controlled vs uncontrolled
// ─────────────────────────────────────────────
describe('BCalendar - controlled vs uncontrolled', () => {
  it('emits update:modelValue but does not change DOM when controlled', async () => {
    const wrapper = mount(BCalendar, {
      props: { modelValue: new Date(2026, 4, 1) },
    });
    const cell = wrapper.find(`[data-b-calendar-date="2026-05-15"]`);
    await cell.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    // Selected cell still on the originally controlled value.
    const sel = wrapper.find('.b-calendar__cell--selected');
    expect(sel.attributes('data-b-calendar-date')).toBe('2026-05-01');
    unmountSafe(wrapper);
  });

  it('updates DOM when parent updates modelValue', async () => {
    const Parent = defineComponent({
      components: { BCalendar },
      setup() {
        const value = ref<Date | null>(new Date(2026, 4, 1));
        return { value };
      },
      template: `<BCalendar v-model="value" />`,
    });
    const wrapper = mount(Parent);
    const cell = wrapper.find(`[data-b-calendar-date="2026-05-15"]`);
    await cell.trigger('click');
    await nextTick();
    const sel = wrapper.find('.b-calendar__cell--selected');
    expect(sel.attributes('data-b-calendar-date')).toBe('2026-05-15');
    unmountSafe(wrapper);
  });

  it('controlled mode prop suppresses internal mode change', async () => {
    const wrapper = mount(BCalendar, {
      props: { mode: 'month' },
    });
    const yearRadio = wrapper.findAll('.b-calendar__mode-option input')[1];
    await yearRadio.setValue();
    // emits, but DOM does not flip to year
    expect(wrapper.emitted('update:mode')?.[0]).toEqual(['year']);
    expect(wrapper.find('.b-calendar--mode-month').exists()).toBe(true);
    unmountSafe(wrapper);
  });
});

// ─────────────────────────────────────────────
// 7. Slots
// ─────────────────────────────────────────────
describe('BCalendar - slots', () => {
  it('renders custom header via header slot', () => {
    const wrapper = mountCalendar(
      {},
      {
        header: () => h('div', { class: 'custom-header' }, 'Hi'),
      },
    );
    expect(wrapper.find('.custom-header').exists()).toBe(true);
  });

  it('renders dateCell content', () => {
    const wrapper = mountCalendar(
      {},
      {
        dateCell: ({ date }: { date: Date }) =>
          h('span', { class: 'mark' }, String(date.getDate())),
      },
    );
    expect(wrapper.findAll('.mark').length).toBe(42);
  });

  it('replaces the cell with dateFullCell', () => {
    const wrapper = mountCalendar(
      {},
      {
        dateFullCell: ({ date }: { date: Date }) =>
          h('span', { class: 'full' }, String(date.getDate())),
      },
    );
    expect(wrapper.find('.full').exists()).toBe(true);
    expect(wrapper.find('.b-calendar__date-value').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 8. Edge cases
// ─────────────────────────────────────────────
describe('BCalendar - edge cases', () => {
  it('handles null modelValue gracefully', () => {
    const wrapper = mountCalendar({ modelValue: null });
    expect(wrapper.find('.b-calendar__cell--selected').exists()).toBe(false);
    unmountSafe(wrapper);
  });

  it('renders long custom date content without breaking layout', () => {
    const wrapper = mountCalendar(
      {},
      {
        dateCell: () => h('div', { class: 'long' }, 'x'.repeat(2000)),
      },
    );
    expect(wrapper.findAll('.long').length).toBe(42);
    unmountSafe(wrapper);
  });

  it('exposed select() and setMode() work', async () => {
    const wrapper = mountCalendar();
    const vm = wrapper.vm as unknown as {
      select: (d: Date) => void;
      setMode: (m: 'month' | 'year') => void;
    };
    vm.select(new Date(2026, 4, 10));
    await nextTick();
    expect(wrapper.find('.b-calendar__cell--selected').attributes('data-b-calendar-date')).toBe(
      '2026-05-10',
    );
    vm.setMode('year');
    await nextTick();
    expect(wrapper.find('.b-calendar--mode-year').exists()).toBe(true);
    unmountSafe(wrapper);
  });
});

// ─────────────────────────────────────────────
// 9. Today button
// ─────────────────────────────────────────────
describe('BCalendar - today shortcut', () => {
  it('clicking today selects today', async () => {
    const wrapper = mountCalendar({ defaultValue: new Date(2026, 0, 1) });
    await wrapper.find('.b-calendar__today-btn').trigger('click');
    const sel = wrapper.find('.b-calendar__cell--selected');
    expect(sel.attributes('data-b-calendar-date')).toBe(isoDate(FIXED_NOW));
    unmountSafe(wrapper);
  });
});

// ─────────────────────────────────────────────
// 10. Class hooks
// ─────────────────────────────────────────────
describe('BCalendar - class hooks', () => {
  it('exposes stable class hooks', () => {
    const wrapper = mountCalendar();
    expect(wrapper.find('.b-calendar').exists()).toBe(true);
    expect(wrapper.find('.b-calendar__header').exists()).toBe(true);
    expect(wrapper.find('.b-calendar__body').exists()).toBe(true);
    expect(wrapper.find('.b-calendar__table').exists()).toBe(true);
    expect(wrapper.find('.b-calendar__weekday').exists()).toBe(true);
    expect(wrapper.find('.b-calendar__cell').exists()).toBe(true);
    unmountSafe(wrapper);
  });
});

// ─────────────────────────────────────────────
// 11. Events feature (built-in)
// ─────────────────────────────────────────────
describe('BCalendar - events feature', () => {
  const eventsFn = (d: Date) => {
    const day = d.getDate();
    const month = d.getMonth();
    if (month !== 4) return [];
    if (day === 8) return [{ type: 'success' as const, title: 'Standup' }];
    if (day === 10)
      return [
        { type: 'info' as const, title: 'Design review' },
        { type: 'warning' as const, title: 'Deadline reminder' },
      ];
    if (day === 15)
      return [
        { type: 'error' as const, title: 'Production incident', description: 'P1' },
      ];
    return [];
  };

  it('renders an event item per supplied event', () => {
    const wrapper = mountCalendar({ events: eventsFn });
    const may10 = wrapper.find('[data-b-calendar-date="2026-05-10"]');
    expect(may10.findAll('.b-calendar__event')).toHaveLength(2);
    const may15 = wrapper.find('[data-b-calendar-date="2026-05-15"]');
    expect(may15.findAll('.b-calendar__event')).toHaveLength(1);
    expect(may15.find('.b-calendar__event--error').exists()).toBe(true);
    unmountSafe(wrapper);
  });

  it('caps inline events to maxEventsVisible and shows +N more', () => {
    const manyEvents = (d: Date) =>
      d.getMonth() === 4 && d.getDate() === 12
        ? Array.from({ length: 6 }, (_, i) => ({
            type: 'success' as const,
            title: `Event ${i + 1}`,
          }))
        : [];
    const wrapper = mountCalendar({ events: manyEvents, maxEventsVisible: 3 });
    const may12 = wrapper.find('[data-b-calendar-date="2026-05-12"]');
    expect(may12.findAll('.b-calendar__event')).toHaveLength(3);
    expect(may12.find('.b-calendar__events-more').text()).toBe('+3 more');
    unmountSafe(wrapper);
  });

  it('opens the modal when clicking a date with events', async () => {
    const wrapper = mountCalendar({ events: eventsFn });
    await wrapper.find('[data-b-calendar-date="2026-05-15"]').trigger('click');
    await nextTick();
    expect(wrapper.find('.b-calendar__modal-body').exists()).toBe(true);
    expect(wrapper.find('.b-calendar__modal-event-title').text()).toBe(
      'Production incident',
    );
    unmountSafe(wrapper);
  });

  it('does not open modal when clicking a date without events', async () => {
    const wrapper = mountCalendar({ events: eventsFn });
    await wrapper.find('[data-b-calendar-date="2026-05-09"]').trigger('click');
    await nextTick();
    expect(wrapper.find('.b-calendar__modal-body').exists()).toBe(false);
    unmountSafe(wrapper);
  });

  it('does not open modal when showEventDetails=false', async () => {
    const wrapper = mountCalendar({ events: eventsFn, showEventDetails: false });
    await wrapper.find('[data-b-calendar-date="2026-05-15"]').trigger('click');
    await nextTick();
    expect(wrapper.find('.b-calendar__modal-body').exists()).toBe(false);
    unmountSafe(wrapper);
  });

  it('does not auto-render events when dateCell slot is provided', () => {
    const wrapper = mountCalendar(
      { events: eventsFn },
      {
        dateCell: () => h('span', { class: 'custom' }, 'x'),
      },
    );
    expect(wrapper.find('.b-calendar__events').exists()).toBe(false);
    expect(wrapper.findAll('.custom').length).toBe(42);
    unmountSafe(wrapper);
  });

  it('renders eventDetails slot when provided', async () => {
    const wrapper = mountCalendar(
      { events: eventsFn },
      {
        eventDetails: ({ events: ev }: { events: { title: string }[] }) =>
          h('div', { class: 'custom-details' }, `count:${ev.length}`),
      },
    );
    await wrapper.find('[data-b-calendar-date="2026-05-10"]').trigger('click');
    await nextTick();
    expect(wrapper.find('.custom-details').text()).toBe('count:2');
    unmountSafe(wrapper);
  });
});
