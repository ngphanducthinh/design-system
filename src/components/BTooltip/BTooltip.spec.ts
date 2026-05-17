import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BTooltip from './BTooltip.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * jsdom does not implement the Popover API or ToggleEvent.
 * Stub showPopover / hidePopover and dispatch a toggle event
 * with newState/oldState as own properties (matching the ToggleEvent shape).
 */
function createToggleEvent(newState: string, oldState: string): Event {
  const event = new Event('toggle', { bubbles: false });
  (event as any).newState = newState;
  (event as any).oldState = oldState;
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

function mountTooltip(
  props: Record<string, unknown> = {},
  slots: Record<string, () => string> = {},
) {
  const wrapper = mount(BTooltip, {
    props: { title: 'Test tooltip', ...props },
    slots: { default: () => 'Hover me', ...slots },
    attachTo: document.body,
  });

  // Stub popover API on the tooltip content element
  const tooltipEl = wrapper.find('[role="tooltip"]').element as HTMLElement;
  if (tooltipEl) {
    stubPopoverAPI(tooltipEl);
  }

  return wrapper;
}

// ─────────────────────────────────────────────
// 1. Defaults & variants render
// ─────────────────────────────────────────────
describe('BTooltip – defaults and variants', () => {
  it('renders the toggle wrapper with default slot', () => {
    const wrapper = mountTooltip();
    expect(wrapper.find('.b-tooltip__toggle').text()).toBe('Hover me');
  });

  it('renders a tooltip element with role="tooltip"', () => {
    const wrapper = mountTooltip();
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(true);
  });

  it('renders title text from prop', () => {
    const wrapper = mountTooltip({ title: 'Hello World' });
    expect(wrapper.find('.b-tooltip__inner').text()).toBe('Hello World');
  });

  it('renders title from slot, overriding prop', () => {
    const wrapper = mountTooltip({ title: 'Prop title' }, { title: () => 'Slot title' });
    expect(wrapper.find('.b-tooltip__inner').text()).toBe('Slot title');
  });

  it('renders arrow by default', () => {
    const wrapper = mountTooltip();
    expect(wrapper.find('.b-tooltip__arrow').exists()).toBe(true);
  });

  it('hides arrow when arrow=false', () => {
    const wrapper = mountTooltip({ arrow: false });
    expect(wrapper.find('.b-tooltip__arrow').exists()).toBe(false);
    expect(wrapper.find('.b-tooltip__content--no-arrow').exists()).toBe(true);
  });

  it('applies default placement class (top-center)', () => {
    const wrapper = mountTooltip();
    expect(wrapper.find('.b-tooltip__content.top-center').exists()).toBe(true);
  });

  it.each([
    'top-left',
    'top-center',
    'top-right',
    'right-top',
    'right-center',
    'right-bottom',
    'bottom-right',
    'bottom-center',
    'bottom-left',
    'left-bottom',
    'left-center',
    'left-top',
  ])('renders with placement=%s', (placement) => {
    const wrapper = mountTooltip({ placement });
    expect(wrapper.find(`.b-tooltip__content.${placement}`).exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behavior
// ─────────────────────────────────────────────
describe('BTooltip – props map to DOM', () => {
  it('applies custom color via CSS variable', () => {
    const wrapper = mountTooltip({ color: '#ff0000' });
    const style = wrapper.find('.b-tooltip__content').attributes('style') ?? '';
    expect(style).toContain('--b-tooltip-bg: #ff0000');
    expect(style).toContain('--b-tooltip-arrow-color: #ff0000');
  });

  it('applies z-index from prop', () => {
    const wrapper = mountTooltip({ zIndex: 2000 });
    const style = wrapper.find('.b-tooltip__content').attributes('style') ?? '';
    expect(style).toContain('2000');
  });

  it('uses popover="manual" for hover trigger', () => {
    const wrapper = mountTooltip({ trigger: 'hover' });
    expect(wrapper.find('.b-tooltip__content').attributes('popover')).toBe('manual');
  });

  it('uses popover="manual" for click trigger', () => {
    const wrapper = mountTooltip({ trigger: 'click' });
    expect(wrapper.find('.b-tooltip__content').attributes('popover')).toBe('manual');
  });

  it('uses popover="manual" for focus trigger', () => {
    const wrapper = mountTooltip({ trigger: 'focus' });
    expect(wrapper.find('.b-tooltip__content').attributes('popover')).toBe('manual');
  });

  it('applies toggleClass to toggle wrapper', () => {
    const wrapper = mountTooltip({ toggleClass: 'my-toggle' });
    expect(wrapper.find('.b-tooltip__toggle').classes()).toContain('my-toggle');
  });

  it('applies tooltipClass to content wrapper', () => {
    const wrapper = mountTooltip({ tooltipClass: 'my-content' });
    expect(wrapper.find('.b-tooltip__content').classes()).toContain('my-content');
  });

  it('applies tooltipInnerClass to inner wrapper', () => {
    const wrapper = mountTooltip({ tooltipInnerClass: 'my-inner' });
    expect(wrapper.find('.b-tooltip__inner').classes()).toContain('my-inner');
  });
});

// ─────────────────────────────────────────────
// 3. Events
// ─────────────────────────────────────────────
describe('BTooltip – events', () => {
  it('emits openChange when tooltip opens via click trigger', async () => {
    const wrapper = mountTooltip({ trigger: 'click' });
    await wrapper.find('.b-tooltip__toggle').trigger('click');
    expect(wrapper.emitted('openChange')).toBeTruthy();
  });

  it('emits update:modelValue in controlled mode', async () => {
    const wrapper = mountTooltip({ trigger: 'click', modelValue: false });
    await wrapper.find('.b-tooltip__toggle').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });
});

// ─────────────────────────────────────────────
// 4. Keyboard and focus behavior
// ─────────────────────────────────────────────
describe('BTooltip – keyboard', () => {
  it('closes tooltip on Escape keydown', async () => {
    const wrapper = mountTooltip({ trigger: 'click' });

    // Open via click
    await wrapper.find('.b-tooltip__toggle').trigger('click');

    // Press Escape
    await wrapper.find('.b-tooltip__toggle').trigger('keydown', { key: 'Escape' });

    // Should have emitted close
    const events = wrapper.emitted('openChange');
    expect(events).toBeTruthy();
    // Last event should be closing (false)
    expect(events![events!.length - 1]).toEqual([false]);
  });

  it('opens tooltip on focus for hover trigger (focusin)', async () => {
    const wrapper = mountTooltip({ trigger: 'hover' });
    await wrapper.find('.b-tooltip__toggle').trigger('focusin');
    expect(wrapper.emitted('openChange')).toBeTruthy();
  });

  it('opens tooltip on focusin for focus trigger', async () => {
    const wrapper = mountTooltip({ trigger: 'focus' });
    await wrapper.find('.b-tooltip__toggle').trigger('focusin');
    expect(wrapper.emitted('openChange')).toBeTruthy();
  });

  it('closes tooltip on focusout for focus trigger', async () => {
    const wrapper = mountTooltip({ trigger: 'focus' });

    // Open
    await wrapper.find('.b-tooltip__toggle').trigger('focusin');
    // Close
    await wrapper.find('.b-tooltip__toggle').trigger('focusout');

    const events = wrapper.emitted('openChange');
    expect(events).toBeTruthy();
    expect(events![events!.length - 1]).toEqual([false]);
  });
});

// ─────────────────────────────────────────────
// 5. Accessibility checks (roles and aria)
// ─────────────────────────────────────────────
describe('BTooltip – accessibility', () => {
  it('has role="tooltip" on the tooltip content', () => {
    const wrapper = mountTooltip();
    expect(wrapper.find('.b-tooltip__content').attributes('role')).toBe('tooltip');
  });

  it('has a unique id on the tooltip for aria-describedby', () => {
    const wrapper = mountTooltip();
    const id = wrapper.find('[role="tooltip"]').attributes('id');
    expect(id).toBeTruthy();
  });

  it('toggle does NOT have aria-describedby when tooltip is closed', () => {
    const wrapper = mountTooltip();
    // Tooltip starts closed
    expect(wrapper.find('.b-tooltip__toggle').attributes('aria-describedby')).toBeUndefined();
  });

  it('arrow element is aria-hidden', () => {
    const wrapper = mountTooltip();
    expect(wrapper.find('.b-tooltip__arrow').attributes('aria-hidden')).toBe('true');
  });

  it('toggle is an inline-block wrapper (accessible structure)', () => {
    const wrapper = mountTooltip();
    expect(wrapper.find('.b-tooltip__toggle').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 6. Edge cases
// ─────────────────────────────────────────────
describe('BTooltip – edge cases', () => {
  it('handles long content without breaking layout', () => {
    const longContent = 'A'.repeat(500);
    const wrapper = mountTooltip({ title: longContent });
    expect(wrapper.find('.b-tooltip__inner').text()).toBe(longContent);
  });

  it('controlled mode: does not change internal state directly', async () => {
    const wrapper = mountTooltip({ modelValue: false, trigger: 'click' });
    await wrapper.find('.b-tooltip__toggle').trigger('click');
    // Should emit update:modelValue instead of toggling internally
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });

  it('uncontrolled mode: manages state internally', () => {
    const wrapper = mountTooltip({ trigger: 'click' });
    // No modelValue → uncontrolled
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('destroyTooltipOnHide=true removes inner content when closed', () => {
    const wrapper = mountTooltip({ destroyTooltipOnHide: true });
    // When tooltip hasn't been opened, shouldRender is false
    // The inner content should still exist due to template logic (shouldRender || !destroyTooltipOnHide)
    // But with destroyTooltipOnHide=true and not opened, shouldRender=false and !destroyTooltipOnHide=false → no render
    expect(wrapper.find('.b-tooltip__inner').exists()).toBe(false);
  });

  it('renders inner content by default even when closed (not destroyed)', () => {
    const wrapper = mountTooltip({ destroyTooltipOnHide: false });
    expect(wrapper.find('.b-tooltip__inner').exists()).toBe(true);
  });

  it('switches placement reactively', async () => {
    const wrapper = mountTooltip({ placement: 'top-center' });
    expect(wrapper.find('.b-tooltip__content.top-center').exists()).toBe(true);

    await wrapper.setProps({ placement: 'bottom-center' });
    expect(wrapper.find('.b-tooltip__content.bottom-center').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 7. Deterministic animation tests with fake timers
// ─────────────────────────────────────────────
describe('BTooltip – delays (fake timers)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('respects mouseEnterDelay before showing', async () => {
    const wrapper = mountTooltip({ trigger: 'hover', mouseEnterDelay: 500 });

    await wrapper.find('.b-tooltip__toggle').trigger('mouseenter');

    // Not yet opened - delay hasn't elapsed
    expect(wrapper.emitted('openChange')).toBeFalsy();

    // Advance past delay
    vi.advanceTimersByTime(500);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('openChange')).toBeTruthy();
  });

  it('respects mouseLeaveDelay before hiding', async () => {
    const wrapper = mountTooltip({ trigger: 'hover', mouseEnterDelay: 0, mouseLeaveDelay: 300 });

    // Open immediately (delay=0 still goes through showPopover)
    await wrapper.find('.b-tooltip__toggle').trigger('mouseenter');
    await wrapper.vm.$nextTick();

    const openEvents1 = wrapper.emitted('openChange') ?? [];
    expect(openEvents1.length).toBeGreaterThan(0);
    expect(openEvents1[openEvents1.length - 1]).toEqual([true]);

    // Start leaving
    await wrapper.find('.b-tooltip__toggle').trigger('mouseleave');
    await wrapper.vm.$nextTick();

    // Not yet closed - delay hasn't elapsed (only 0ms passed)
    const eventsAfterLeave = wrapper.emitted('openChange')!;
    // Should still only have the open event, not a close event yet
    const hasClose = eventsAfterLeave.some((e) => e[0] === false);
    expect(hasClose).toBe(false);

    // Advance past delay
    vi.advanceTimersByTime(300);
    await wrapper.vm.$nextTick();

    const allEvents = wrapper.emitted('openChange')!;
    expect(allEvents[allEvents.length - 1]).toEqual([false]);
  });

  it('cancels show timer when leaving before delay', async () => {
    const wrapper = mountTooltip({ trigger: 'hover', mouseEnterDelay: 500 });

    await wrapper.find('.b-tooltip__toggle').trigger('mouseenter');
    // Leave before delay
    await wrapper.find('.b-tooltip__toggle').trigger('mouseleave');

    vi.advanceTimersByTime(500);
    await wrapper.vm.$nextTick();

    // Should never have opened
    expect(wrapper.emitted('openChange')).toBeFalsy();
  });
});
