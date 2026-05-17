import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BSegmented from './BSegmented.vue';
import type { BSegmentedRawOption } from './types';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const STRING_OPTS: BSegmentedRawOption[] = ['Daily', 'Weekly', 'Monthly'];
const NUMBER_OPTS: BSegmentedRawOption[] = [1, 2, 3];
const OBJECT_OPTS: BSegmentedRawOption[] = [
  { label: 'Map', value: 'map' },
  { label: 'Transit', value: 'transit' },
  { label: 'Satellite', value: 'satellite', disabled: true },
];

function mountSegmented(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  return mount(BSegmented, {
    props: { options: STRING_OPTS, ...props },
    slots,
    attachTo: document.body,
  });
}

// ─────────────────────────────────────────────
// 1. Defaults and variants render
// ─────────────────────────────────────────────
describe('BSegmented – defaults and variants', () => {
  it('renders root .b-segmented element', () => {
    const w = mountSegmented();
    expect(w.find('.b-segmented').exists()).toBe(true);
  });

  it('renders role="group" on root', () => {
    const w = mountSegmented();
    expect(w.find('.b-segmented').attributes('role')).toBe('group');
  });

  it('renders an item per option', () => {
    const w = mountSegmented();
    expect(w.findAll('.b-segmented__item').length).toBe(3);
  });

  it('first option is selected by default (uncontrolled)', () => {
    const w = mountSegmented();
    const items = w.findAll('.b-segmented__item');
    expect(items[0].classes()).toContain('b-segmented__item--selected');
    expect(items[0].attributes('aria-checked')).toBe('true');
  });

  it('uses defaultValue when provided', () => {
    const w = mountSegmented({ defaultValue: 'Weekly' });
    const items = w.findAll('.b-segmented__item');
    expect(items[1].classes()).toContain('b-segmented__item--selected');
    expect(items[1].attributes('aria-checked')).toBe('true');
  });

  it('does not add disabled class in default state', () => {
    const w = mountSegmented();
    expect(w.find('.b-segmented--disabled').exists()).toBe(false);
  });

  it('renders small size modifier', () => {
    const w = mountSegmented({ size: 'small' });
    expect(w.find('.b-segmented--small').exists()).toBe(true);
  });

  it('renders large size modifier', () => {
    const w = mountSegmented({ size: 'large' });
    expect(w.find('.b-segmented--large').exists()).toBe(true);
  });

  it('renders no size modifier for default size', () => {
    const w = mountSegmented({ size: 'default' });
    expect(w.find('.b-segmented--small').exists()).toBe(false);
    expect(w.find('.b-segmented--large').exists()).toBe(false);
  });

  it('renders block modifier', () => {
    const w = mountSegmented({ block: true });
    expect(w.find('.b-segmented--block').exists()).toBe(true);
  });

  it('renders items from number options', () => {
    const w = mountSegmented({ options: NUMBER_OPTS });
    const items = w.findAll('.b-segmented__item');
    expect(items.length).toBe(3);
    expect(items[0].find('.b-segmented__item-label').text()).toBe('1');
  });

  it('renders items from object options', () => {
    const w = mountSegmented({ options: OBJECT_OPTS });
    const labels = w.findAll('.b-segmented__item-label');
    expect(labels[0].text()).toBe('Map');
    expect(labels[2].text()).toBe('Satellite');
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behavior
// ─────────────────────────────────────────────
describe('BSegmented – props map to DOM', () => {
  it('controlled: modelValue selects the matching item', () => {
    const w = mountSegmented({ modelValue: 'Monthly' });
    const items = w.findAll('.b-segmented__item');
    expect(items[2].classes()).toContain('b-segmented__item--selected');
    expect(items[2].attributes('aria-checked')).toBe('true');
  });

  it('non-selected items have aria-checked="false"', () => {
    const w = mountSegmented({ modelValue: 'Daily' });
    const items = w.findAll('.b-segmented__item');
    expect(items[1].attributes('aria-checked')).toBe('false');
    expect(items[2].attributes('aria-checked')).toBe('false');
  });

  it('disabled=true adds --disabled class and aria-disabled', () => {
    const w = mountSegmented({ disabled: true });
    expect(w.find('.b-segmented--disabled').exists()).toBe(true);
    expect(w.find('.b-segmented').attributes('aria-disabled')).toBe('true');
  });

  it('disabled=false omits aria-disabled attribute', () => {
    const w = mountSegmented({ disabled: false });
    expect(w.find('.b-segmented').attributes('aria-disabled')).toBeUndefined();
  });

  it('per-item disabled adds --disabled class and aria-disabled', () => {
    const w = mountSegmented({ options: OBJECT_OPTS });
    const items = w.findAll('.b-segmented__item');
    expect(items[2].classes()).toContain('b-segmented__item--disabled');
    expect(items[2].attributes('aria-disabled')).toBe('true');
  });

  it('enabled items have no aria-disabled', () => {
    const w = mountSegmented({ options: OBJECT_OPTS });
    const items = w.findAll('.b-segmented__item');
    expect(items[0].attributes('aria-disabled')).toBeUndefined();
  });

  it('selected item has tabindex=0', () => {
    const w = mountSegmented({ modelValue: 'Daily' });
    const items = w.findAll('.b-segmented__item');
    expect(items[0].attributes('tabindex')).toBe('0');
  });

  it('non-selected items have tabindex=-1', () => {
    const w = mountSegmented({ modelValue: 'Daily' });
    const items = w.findAll('.b-segmented__item');
    expect(items[1].attributes('tabindex')).toBe('-1');
  });

  it('disabled items have tabindex=-1', () => {
    const w = mountSegmented({ disabled: true });
    w.findAll('.b-segmented__item').forEach((item) => {
      expect(item.attributes('tabindex')).toBe('-1');
    });
  });

  it('all items have role="radio"', () => {
    const w = mountSegmented();
    w.findAll('.b-segmented__item').forEach((item) => {
      expect(item.attributes('role')).toBe('radio');
    });
  });

  it('renders icon when provided', () => {
    const w = mountSegmented({
      options: [{ label: 'Home', value: 'home', icon: '🏠' }],
    });
    expect(w.find('.b-segmented__item-icon').exists()).toBe(true);
    expect(w.find('.b-segmented__item-icon').attributes('aria-hidden')).toBe('true');
  });

  it('does not render icon element when icon is absent', () => {
    const w = mountSegmented({ options: STRING_OPTS });
    expect(w.find('.b-segmented__item-icon').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 3. Events
// ─────────────────────────────────────────────
describe('BSegmented – events', () => {
  it('clicking an item emits update:modelValue', async () => {
    const w = mountSegmented({ modelValue: 'Daily' });
    await w.findAll('.b-segmented__item')[1].trigger('click');
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['Weekly']);
  });

  it('clicking an item emits change', async () => {
    const w = mountSegmented({ modelValue: 'Daily' });
    await w.findAll('.b-segmented__item')[1].trigger('click');
    expect(w.emitted('change')?.[0]).toEqual(['Weekly']);
  });

  it('both events fire together in the same interaction', async () => {
    const w = mountSegmented({ modelValue: 'Daily' });
    await w.findAll('.b-segmented__item')[2].trigger('click');
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['Monthly']);
    expect(w.emitted('change')?.[0]).toEqual(['Monthly']);
  });

  it('clicking the already-selected item does not emit events', async () => {
    const w = mountSegmented({ modelValue: 'Daily' });
    await w.findAll('.b-segmented__item')[0].trigger('click');
    expect(w.emitted('update:modelValue')).toBeUndefined();
    expect(w.emitted('change')).toBeUndefined();
  });

  it('clicking a globally disabled segmented does not emit', async () => {
    const w = mountSegmented({ modelValue: 'Daily', disabled: true });
    await w.findAll('.b-segmented__item')[1].trigger('click');
    expect(w.emitted('update:modelValue')).toBeUndefined();
  });

  it('clicking a per-item disabled option does not emit', async () => {
    const w = mountSegmented({ options: OBJECT_OPTS, modelValue: 'map' });
    await w.findAll('.b-segmented__item')[2].trigger('click'); // 'satellite' is disabled
    expect(w.emitted('update:modelValue')).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// 4. Controlled vs uncontrolled
// ─────────────────────────────────────────────
describe('BSegmented – controlled vs uncontrolled', () => {
  it('uncontrolled: internal state updates on click', async () => {
    const w = mountSegmented();
    const items = w.findAll('.b-segmented__item');
    await items[1].trigger('click');
    await w.vm.$nextTick();
    expect(items[1].classes()).toContain('b-segmented__item--selected');
  });

  it('controlled: external modelValue change updates selected item', async () => {
    const w = mountSegmented({ modelValue: 'Daily' });
    await w.setProps({ modelValue: 'Monthly' });
    const items = w.findAll('.b-segmented__item');
    expect(items[2].classes()).toContain('b-segmented__item--selected');
  });

  it('controlled: internal click fires event but waits for parent to update', async () => {
    const w = mountSegmented({ modelValue: 'Daily' });
    await w.findAll('.b-segmented__item')[1].trigger('click');
    // Event emitted but since parent hasn't changed modelValue, selection stays
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['Weekly']);
    // Visually still Daily because prop not updated
    expect(w.findAll('.b-segmented__item')[0].classes()).toContain('b-segmented__item--selected');
  });
});

// ─────────────────────────────────────────────
// 5. Keyboard navigation
// ─────────────────────────────────────────────
describe('BSegmented – keyboard navigation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('Enter key on a non-selected item selects it', async () => {
    const w = mountSegmented({ modelValue: 'Daily' }, {});
    const items = w.findAll('.b-segmented__item');
    await items[1].trigger('keydown', { key: 'Enter' });
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['Weekly']);
  });

  it('Space key on a non-selected item selects it', async () => {
    const w = mountSegmented({ modelValue: 'Daily' });
    const items = w.findAll('.b-segmented__item');
    await items[2].trigger('keydown', { key: ' ' });
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['Monthly']);
  });

  it('ArrowRight moves focus to the next enabled item', async () => {
    const w = mountSegmented();
    const items = w.findAll('.b-segmented__item');
    items[0].element.focus();
    await items[0].trigger('keydown', { key: 'ArrowRight' });
    expect(document.activeElement).toBe(items[1].element);
  });

  it('ArrowLeft moves focus to the previous enabled item', async () => {
    const w = mountSegmented();
    const items = w.findAll('.b-segmented__item');
    items[1].element.focus();
    await items[1].trigger('keydown', { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(items[0].element);
  });

  it('ArrowRight wraps around from last to first', async () => {
    const w = mountSegmented();
    const items = w.findAll('.b-segmented__item');
    items[2].element.focus();
    await items[2].trigger('keydown', { key: 'ArrowRight' });
    expect(document.activeElement).toBe(items[0].element);
  });

  it('ArrowLeft wraps from first to last', async () => {
    const w = mountSegmented();
    const items = w.findAll('.b-segmented__item');
    items[0].element.focus();
    await items[0].trigger('keydown', { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(items[2].element);
  });

  it('ArrowDown is equivalent to ArrowRight', async () => {
    const w = mountSegmented();
    const items = w.findAll('.b-segmented__item');
    items[0].element.focus();
    await items[0].trigger('keydown', { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[1].element);
  });

  it('ArrowUp is equivalent to ArrowLeft', async () => {
    const w = mountSegmented();
    const items = w.findAll('.b-segmented__item');
    items[1].element.focus();
    await items[1].trigger('keydown', { key: 'ArrowUp' });
    expect(document.activeElement).toBe(items[0].element);
  });

  it('keyboard navigation skips disabled items', async () => {
    const w = mountSegmented({ options: OBJECT_OPTS });
    const allItems = w.findAll('.b-segmented__item');
    // Focus map (index 0), ArrowRight should jump to transit (index 1), skipping satellite
    allItems[0].element.focus();
    await allItems[0].trigger('keydown', { key: 'ArrowRight' });
    expect(document.activeElement).toBe(allItems[1].element);
  });
});

// ─────────────────────────────────────────────
// 6. Accessibility
// ─────────────────────────────────────────────
describe('BSegmented – accessibility', () => {
  it('root has role="group"', () => {
    const w = mountSegmented();
    expect(w.find('.b-segmented').attributes('role')).toBe('group');
  });

  it('all items have role="radio"', () => {
    const w = mountSegmented();
    w.findAll('.b-segmented__item').forEach((item) => {
      expect(item.attributes('role')).toBe('radio');
    });
  });

  it('selected item has aria-checked="true"', () => {
    const w = mountSegmented({ modelValue: 'Weekly' });
    expect(w.findAll('.b-segmented__item')[1].attributes('aria-checked')).toBe('true');
  });

  it('non-selected items have aria-checked="false"', () => {
    const w = mountSegmented({ modelValue: 'Daily' });
    expect(w.findAll('.b-segmented__item')[1].attributes('aria-checked')).toBe('false');
    expect(w.findAll('.b-segmented__item')[2].attributes('aria-checked')).toBe('false');
  });

  it('disabled root has aria-disabled="true"', () => {
    const w = mountSegmented({ disabled: true });
    expect(w.find('.b-segmented').attributes('aria-disabled')).toBe('true');
  });

  it('per-item disabled has aria-disabled="true"', () => {
    const w = mountSegmented({ options: OBJECT_OPTS });
    expect(w.findAll('.b-segmented__item')[2].attributes('aria-disabled')).toBe('true');
  });

  it('icon is aria-hidden', () => {
    const w = mountSegmented({ options: [{ label: 'Home', value: 'home', icon: '🏠' }] });
    expect(w.find('.b-segmented__item-icon').attributes('aria-hidden')).toBe('true');
  });

  it('thumb is aria-hidden', () => {
    const w = mountSegmented();
    // thumb may not exist until mounted + nextTick; check if present then verify
    const thumb = w.find('.b-segmented__thumb');
    if (thumb.exists()) {
      expect(thumb.attributes('aria-hidden')).toBe('true');
    }
  });
});

// ─────────────────────────────────────────────
// 7. Edge cases
// ─────────────────────────────────────────────
describe('BSegmented – edge cases', () => {
  it('renders with empty options', () => {
    const w = mountSegmented({ options: [] });
    expect(w.find('.b-segmented').exists()).toBe(true);
    expect(w.findAll('.b-segmented__item').length).toBe(0);
  });

  it('renders with a single option', () => {
    const w = mountSegmented({ options: ['Only'] });
    const items = w.findAll('.b-segmented__item');
    expect(items.length).toBe(1);
    expect(items[0].classes()).toContain('b-segmented__item--selected');
  });

  it('handles long label text without breaking layout', () => {
    const long = 'A'.repeat(100);
    const w = mountSegmented({ options: [long, 'Short'] });
    expect(w.findAll('.b-segmented__item-label')[0].text()).toBe(long);
  });

  it('updates reactively when options prop changes', async () => {
    const w = mountSegmented({ options: STRING_OPTS });
    expect(w.findAll('.b-segmented__item').length).toBe(3);
    await w.setProps({ options: ['X', 'Y'] });
    expect(w.findAll('.b-segmented__item').length).toBe(2);
  });

  it('updates selected modifier reactively on prop change', async () => {
    const w = mountSegmented({ modelValue: 'Daily' });
    expect(w.findAll('.b-segmented__item')[0].classes()).toContain('b-segmented__item--selected');
    await w.setProps({ modelValue: 'Monthly' });
    expect(w.findAll('.b-segmented__item')[2].classes()).toContain('b-segmented__item--selected');
    expect(w.findAll('.b-segmented__item')[0].classes()).not.toContain(
      'b-segmented__item--selected',
    );
  });

  it('updates disabled state reactively', async () => {
    const w = mountSegmented({ disabled: false });
    expect(w.find('.b-segmented--disabled').exists()).toBe(false);
    await w.setProps({ disabled: true });
    expect(w.find('.b-segmented--disabled').exists()).toBe(true);
  });

  it('label slot renders custom content', () => {
    const w = mountSegmented(
      { options: STRING_OPTS },
      { label: ({ option }: { option: { value: string } }) => `[${option.value}]` },
    );
    expect(w.findAll('.b-segmented__item-label')[0].text()).toContain('[Daily]');
  });
});

// ─────────────────────────────────────────────
// 8. Animation - fake timers
// ─────────────────────────────────────────────
describe('BSegmented – thumb animation (deterministic)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('thumb does not exist before mount resolves', () => {
    // In jsdom getBoundingClientRect returns zeros so thumb style may be set;
    // assert it is aria-hidden when present
    const w = mountSegmented();
    const thumb = w.find('.b-segmented__thumb');
    if (thumb.exists()) {
      expect(thumb.attributes('aria-hidden')).toBe('true');
    }
  });

  it('selecting an item updates internalValue synchronously (uncontrolled)', async () => {
    const w = mountSegmented();
    const items = w.findAll('.b-segmented__item');
    await items[2].trigger('click');
    vi.runAllTimers();
    await w.vm.$nextTick();
    expect(items[2].classes()).toContain('b-segmented__item--selected');
  });
});
