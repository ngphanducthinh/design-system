import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import { BBadgeSize, BBadgeStatus } from '@/types.ts';
import BBadge from './BBadge.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function mountBadge(props = {}, slots: Record<string, unknown> = {}) {
  return mount(BBadge, { props, slots });
}

// ─────────────────────────────────────────────
// 1. Defaults & variants render
// ─────────────────────────────────────────────
describe('BBadge – defaults and variants', () => {
  it('renders root .b-badge element', () => {
    const wrapper = mountBadge({ count: 5 }, { default: () => 'child' });
    expect(wrapper.find('.b-badge').exists()).toBe(true);
  });

  it('renders nothing visible when count is 0 and showZero is false (default)', () => {
    const wrapper = mountBadge({ count: 0 }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').exists()).toBe(false);
  });

  it('renders count badge when showZero is true and count is 0', () => {
    const wrapper = mountBadge({ count: 0, showZero: true }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').exists()).toBe(true);
    expect(wrapper.find('.b-badge__count').text()).toBe('0');
  });

  it('renders dot when dot prop is true', () => {
    const wrapper = mountBadge({ dot: true, count: 5 }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__dot').exists()).toBe(true);
    expect(wrapper.find('.b-badge__count').exists()).toBe(false);
  });

  it('renders status dot standalone when status is set without children', () => {
    const wrapper = mountBadge({ status: BBadgeStatus.Success, text: 'Success' });
    expect(wrapper.find('.b-badge--status').exists()).toBe(true);
    expect(wrapper.find('.b-badge__status-dot').exists()).toBe(true);
    expect(wrapper.find('.b-badge__status-text').text()).toBe('Success');
  });

  it.each(Object.values(BBadgeStatus))(
    'renders status=%s with correct class',
    (status) => {
      const wrapper = mountBadge({ status });
      expect(wrapper.find(`.b-badge__status-dot--${status}`).exists()).toBe(true);
    },
  );
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behavior
// ─────────────────────────────────────────────
describe('BBadge – props map to DOM', () => {
  it('displays count number', () => {
    const wrapper = mountBadge({ count: 25 }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').text()).toBe('25');
  });

  it('displays string count', () => {
    const wrapper = mountBadge({ count: 'NEW' }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').text()).toBe('NEW');
  });

  it('caps count at overflowCount with + suffix', () => {
    const wrapper = mountBadge({ count: 100, overflowCount: 99 }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').text()).toBe('99+');
  });

  it('caps count at custom overflowCount', () => {
    const wrapper = mountBadge({ count: 1000, overflowCount: 999 }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').text()).toBe('999+');
  });

  it('shows exact count when equal to overflowCount', () => {
    const wrapper = mountBadge({ count: 99, overflowCount: 99 }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').text()).toBe('99');
  });

  it('applies size="small" class', () => {
    const wrapper = mountBadge({ count: 5, size: BBadgeSize.Small }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count--small').exists()).toBe(true);
  });

  it('applies title attribute on count', () => {
    const wrapper = mountBadge({ count: 5, title: 'Five items' }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').attributes('title')).toBe('Five items');
  });

  it('uses count as default title when no title prop', () => {
    const wrapper = mountBadge({ count: 42 }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').attributes('title')).toBe('42');
  });

  it('applies title attribute on dot', () => {
    const wrapper = mountBadge({ dot: true, count: 5, title: 'Updates' }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__dot').attributes('title')).toBe('Updates');
  });

  it('applies offset as style', () => {
    const wrapper = mountBadge(
      { count: 5, offset: [10, 10] },
      { default: () => 'child' },
    );
    const style = wrapper.find('.b-badge__count').attributes('style');
    expect(style).toContain('margin-top: 10px');
  });

  it('applies preset color class on count', () => {
    const wrapper = mountBadge({ count: 5, color: 'blue' }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count--blue').exists()).toBe(true);
  });

  it('applies custom color as inline style on count', () => {
    const wrapper = mountBadge({ count: 5, color: '#ff0000' }, { default: () => 'child' });
    const style = wrapper.find('.b-badge__count').attributes('style');
    expect(style).toContain('background-color: rgb(255, 0, 0)');
  });

  it('applies preset color class on dot', () => {
    const wrapper = mountBadge({ dot: true, color: 'green' }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__dot--green').exists()).toBe(true);
  });

  it('applies custom color as inline style on dot', () => {
    const wrapper = mountBadge({ dot: true, color: '#00ff00' }, { default: () => 'child' });
    const style = wrapper.find('.b-badge__dot').attributes('style');
    expect(style).toContain('background-color: rgb(0, 255, 0)');
  });

  it('renders count slot instead of number', () => {
    const wrapper = mountBadge(
      { count: 5 },
      { default: () => 'child', count: () => 'CUSTOM' },
    );
    expect(wrapper.find('.b-badge__count').text()).toBe('CUSTOM');
  });

  it('renders status text next to dot', () => {
    const wrapper = mountBadge({ status: BBadgeStatus.Warning, text: 'Waiting' });
    expect(wrapper.find('.b-badge__status-text').text()).toBe('Waiting');
  });

  it('does not render status text when text prop is not provided', () => {
    const wrapper = mountBadge({ status: BBadgeStatus.Error });
    expect(wrapper.find('.b-badge__status-text').exists()).toBe(false);
  });

  it('renders with color dot standalone (no status, just color)', () => {
    const wrapper = mountBadge({ color: 'purple', text: 'Custom' });
    expect(wrapper.find('.b-badge--status').exists()).toBe(true);
    expect(wrapper.find('.b-badge__status-dot--purple').exists()).toBe(true);
    expect(wrapper.find('.b-badge__status-text').text()).toBe('Custom');
  });
});

// ─────────────────────────────────────────────
// 3. Visibility logic (showZero, dot, count)
// ─────────────────────────────────────────────
describe('BBadge – visibility logic', () => {
  it('hides count badge when count is 0 and showZero is false', () => {
    const wrapper = mountBadge({ count: 0 }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').exists()).toBe(false);
  });

  it('shows count badge when count is 0 and showZero is true', () => {
    const wrapper = mountBadge({ count: 0, showZero: true }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').exists()).toBe(true);
  });

  it('shows dot when dot=true and no count given', () => {
    const wrapper = mountBadge({ dot: true }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__dot').exists()).toBe(true);
  });

  it('hides dot when dot=true and count=0 without showZero', () => {
    const wrapper = mountBadge({ dot: true, count: 0 }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__dot').exists()).toBe(false);
  });

  it('shows dot when dot=true and count=0 with showZero', () => {
    const wrapper = mountBadge({ dot: true, count: 0, showZero: true }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__dot').exists()).toBe(true);
  });

  it('hides badge entirely when no count, no dot, no status', () => {
    const wrapper = mountBadge({}, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').exists()).toBe(false);
    expect(wrapper.find('.b-badge__dot').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 4. Accessibility
// ─────────────────────────────────────────────
describe('BBadge – accessibility', () => {
  it('count badge has role="status"', () => {
    const wrapper = mountBadge({ count: 5 }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').attributes('role')).toBe('status');
  });

  it('dot has role="status"', () => {
    const wrapper = mountBadge({ dot: true }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__dot').attributes('role')).toBe('status');
  });

  it('count badge has aria-label with count value', () => {
    const wrapper = mountBadge({ count: 7 }, { default: () => 'child' });
    const ariaLabel = wrapper.find('.b-badge__count').attributes('aria-label');
    expect(ariaLabel).toContain('7');
  });

  it('dot has aria-label with title', () => {
    const wrapper = mountBadge({ dot: true, count: 3 }, { default: () => 'child' });
    const ariaLabel = wrapper.find('.b-badge__dot').attributes('aria-label');
    expect(ariaLabel).toContain('3');
  });

  it('status dot has role="img"', () => {
    const wrapper = mountBadge({ status: BBadgeStatus.Success });
    expect(wrapper.find('.b-badge__status-dot').attributes('role')).toBe('img');
  });

  it('status dot has aria-label from text or status', () => {
    const wrapper = mountBadge({ status: BBadgeStatus.Error, text: 'Error occurred' });
    expect(wrapper.find('.b-badge__status-dot').attributes('aria-label')).toBe('Error occurred');
  });

  it('status dot uses status as aria-label when no text', () => {
    const wrapper = mountBadge({ status: BBadgeStatus.Warning });
    expect(wrapper.find('.b-badge__status-dot').attributes('aria-label')).toBe('warning');
  });

  it('count badge is a <sup> element (semantic superscript)', () => {
    const wrapper = mountBadge({ count: 5 }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').element.tagName).toBe('SUP');
  });

  it('dot is a <sup> element', () => {
    const wrapper = mountBadge({ dot: true }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__dot').element.tagName).toBe('SUP');
  });
});

// ─────────────────────────────────────────────
// 5. Preset and custom colors
// ─────────────────────────────────────────────
describe('BBadge – colors', () => {
  const presetColors = [
    'pink', 'red', 'yellow', 'orange', 'cyan', 'green', 'blue',
    'purple', 'geekblue', 'magenta', 'volcano', 'gold', 'lime',
  ];

  it.each(presetColors)(
    'applies preset color class for "%s" on status dot',
    (clr) => {
      const wrapper = mountBadge({ color: clr, text: clr });
      expect(wrapper.find(`.b-badge__status-dot--${clr}`).exists()).toBe(true);
    },
  );

  it('applies custom hex color as inline style on status dot', () => {
    const wrapper = mountBadge({ color: '#abcdef', text: 'custom' });
    const style = wrapper.find('.b-badge__status-dot').attributes('style');
    expect(style).toContain('background-color');
  });

  it('applies custom rgb color as inline style', () => {
    const wrapper = mountBadge({ color: 'rgb(100, 200, 50)', text: 'custom' });
    const style = wrapper.find('.b-badge__status-dot').attributes('style');
    expect(style).toContain('background-color');
  });
});

// ─────────────────────────────────────────────
// 6. Edge cases
// ─────────────────────────────────────────────
describe('BBadge – edge cases', () => {
  it('renders multiple independent badges', () => {
    const w1 = mountBadge({ count: 5 }, { default: () => 'a' });
    const w2 = mountBadge({ count: 10, size: BBadgeSize.Small }, { default: () => 'b' });
    expect(w1.find('.b-badge__count').text()).toBe('5');
    expect(w2.find('.b-badge__count').text()).toBe('10');
    expect(w2.find('.b-badge__count--small').exists()).toBe(true);
  });

  it('handles very large count with overflow', () => {
    const wrapper = mountBadge({ count: 999999, overflowCount: 99 }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').text()).toBe('99+');
  });

  it('handles string "0" count as numeric 0', () => {
    const wrapper = mountBadge({ count: '0' }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').exists()).toBe(false);
  });

  it('shows string "0" count when showZero is true', () => {
    const wrapper = mountBadge({ count: '0', showZero: true }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').exists()).toBe(true);
    expect(wrapper.find('.b-badge__count').text()).toBe('0');
  });

  it('handles negative count', () => {
    const wrapper = mountBadge({ count: -1 }, { default: () => 'child' });
    // Negative counts should still display
    expect(wrapper.find('.b-badge__count').exists()).toBe(true);
    expect(wrapper.find('.b-badge__count').text()).toBe('-1');
  });

  it('dot without children still renders', () => {
    const wrapper = mountBadge({ dot: true });
    // No children = no wrapper slot = standalone-ish but dot mode, not status
    expect(wrapper.find('.b-badge').exists()).toBe(true);
  });

  it('renders wrapped child in default slot', () => {
    const wrapper = mountBadge({ count: 1 }, { default: () => 'CHILD' });
    expect(wrapper.text()).toContain('CHILD');
    expect(wrapper.text()).toContain('1');
  });

  it('offset with string values works', () => {
    const wrapper = mountBadge(
      { count: 5, offset: ['1em', '2em'] },
      { default: () => 'child' },
    );
    const style = wrapper.find('.b-badge__count').attributes('style');
    expect(style).toContain('margin-top: 2em');
  });

  it('count updates reactively', async () => {
    const wrapper = mountBadge({ count: 5 }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').text()).toBe('5');
    await wrapper.setProps({ count: 10 });
    expect(wrapper.find('.b-badge__count').text()).toBe('10');
  });

  it('transitions from hidden to visible when count goes from 0 to positive', async () => {
    const wrapper = mountBadge({ count: 0 }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').exists()).toBe(false);
    await wrapper.setProps({ count: 3 });
    expect(wrapper.find('.b-badge__count').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 7. Animation tests with fake timers
// ─────────────────────────────────────────────
describe('BBadge – animation', () => {
  it('count badge element exists immediately (CSS handles animation)', () => {
    const wrapper = mountBadge({ count: 5 }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__count').exists()).toBe(true);
  });

  it('dot element exists immediately (CSS handles animation)', () => {
    const wrapper = mountBadge({ dot: true }, { default: () => 'child' });
    expect(wrapper.find('.b-badge__dot').exists()).toBe(true);
  });

  it('processing status dot has processing class for animation', () => {
    const wrapper = mountBadge({ status: BBadgeStatus.Processing });
    expect(wrapper.find('.b-badge__status-dot--processing').exists()).toBe(true);
  });
});
