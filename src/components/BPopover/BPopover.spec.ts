import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BPopover from './BPopover.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function createToggleEvent(newState: string, oldState: string): Event {
  const event = new Event('toggle', { bubbles: false });
  (event as unknown as Record<string, string>).newState = newState;
  (event as unknown as Record<string, string>).oldState = oldState;
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

function mountPopover(
  props: Record<string, unknown> = {},
  slots: Record<string, () => string> = {},
) {
  const wrapper = mount(BPopover, {
    props: { title: 'Popover Title', content: 'Popover content', ...props },
    slots: { default: () => 'Hover me', ...slots },
    attachTo: document.body,
  });

  const popoverEl = wrapper.find('[role="tooltip"]').element as HTMLElement;
  if (popoverEl) {
    stubPopoverAPI(popoverEl);
  }

  return wrapper;
}

// ─────────────────────────────────────────────
// 1. Defaults & variants render
// ─────────────────────────────────────────────
describe('BPopover – defaults and variants', () => {
  it('renders the toggle wrapper with default slot', () => {
    const wrapper = mountPopover();
    expect(wrapper.find('.b-popover__toggle').text()).toBe('Hover me');
  });

  it('renders a tooltip element with role="tooltip"', () => {
    const wrapper = mountPopover();
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(true);
  });

  it('renders title text from prop', () => {
    const wrapper = mountPopover({ title: 'My Title' });
    expect(wrapper.find('.b-popover__title').text()).toBe('My Title');
  });

  it('renders title from slot, overriding prop', () => {
    const wrapper = mountPopover({ title: 'Prop title' }, { title: () => 'Slot title' });
    expect(wrapper.find('.b-popover__title').text()).toBe('Slot title');
  });

  it('renders content text from prop', () => {
    const wrapper = mountPopover({ content: 'Body text' });
    expect(wrapper.find('.b-popover__body').text()).toBe('Body text');
  });

  it('renders content from slot, overriding prop', () => {
    const wrapper = mountPopover({ content: 'Prop content' }, { content: () => 'Slot content' });
    expect(wrapper.find('.b-popover__body').text()).toBe('Slot content');
  });

  it('does not render title element when no title is provided', () => {
    const wrapper = mount(BPopover, {
      props: { content: 'Body only' },
      slots: { default: () => 'Trigger' },
      attachTo: document.body,
    });
    const popoverEl = wrapper.find('[role="tooltip"]').element as HTMLElement;
    if (popoverEl) stubPopoverAPI(popoverEl);
    expect(wrapper.find('.b-popover__title').exists()).toBe(false);
  });

  it('renders arrow by default', () => {
    const wrapper = mountPopover();
    expect(wrapper.find('.b-popover__arrow').exists()).toBe(true);
  });

  it('hides arrow when arrow=false', () => {
    const wrapper = mountPopover({ arrow: false });
    expect(wrapper.find('.b-popover__arrow').exists()).toBe(false);
    expect(wrapper.find('.b-popover__content--no-arrow').exists()).toBe(true);
  });

  it('applies default placement class (top-center)', () => {
    const wrapper = mountPopover();
    expect(wrapper.find('.b-popover__content.top-center').exists()).toBe(true);
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
    const wrapper = mountPopover({ placement });
    expect(wrapper.find(`.b-popover__content.${placement}`).exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behavior
// ─────────────────────────────────────────────
describe('BPopover – props map to DOM', () => {
  it('applies z-index from prop', () => {
    const wrapper = mountPopover({ zIndex: 2000 });
    const style = wrapper.find('.b-popover__content').attributes('style') ?? '';
    expect(style).toContain('2000');
  });

  it('uses popover="manual" on the content', () => {
    const wrapper = mountPopover();
    expect(wrapper.find('.b-popover__content').attributes('popover')).toBe('manual');
  });

  it('has tabindex="-1" for programmatic focus', () => {
    const wrapper = mountPopover();
    expect(wrapper.find('[role="tooltip"]').attributes('tabindex')).toBe('-1');
  });

  it('has a unique id on the popover', () => {
    const wrapper = mountPopover();
    const id = wrapper.find('[role="tooltip"]').attributes('id');
    expect(id).toBeTruthy();
  });
});

// ─────────────────────────────────────────────
// 3. Events
// ─────────────────────────────────────────────
describe('BPopover – events', () => {
  it('emits openChange when popover opens via click', async () => {
    const wrapper = mountPopover({ trigger: 'click' });
    await wrapper.find('.b-popover__toggle').trigger('click');
    expect(wrapper.emitted('openChange')).toBeTruthy();
    expect(wrapper.emitted('openChange')![0]).toEqual([true]);
  });

  it('emits openChange(false) when popover closes via click', async () => {
    const wrapper = mountPopover({ trigger: 'click' });

    await wrapper.find('.b-popover__toggle').trigger('click');
    await wrapper.find('.b-popover__toggle').trigger('click');

    const events = wrapper.emitted('openChange')!;
    expect(events[events.length - 1]).toEqual([false]);
  });

  it('emits update:modelValue in controlled mode', async () => {
    const wrapper = mountPopover({ trigger: 'click', modelValue: false });
    await wrapper.find('.b-popover__toggle').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });

  it('emits openChange on hover trigger', async () => {
    const wrapper = mountPopover({ trigger: 'hover', mouseEnterDelay: 0 });
    await wrapper.find('.b-popover__toggle').trigger('mouseenter');
    expect(wrapper.emitted('openChange')).toBeTruthy();
    expect(wrapper.emitted('openChange')![0]).toEqual([true]);
  });

  it('emits openChange on focus trigger', async () => {
    const wrapper = mountPopover({ trigger: 'focus' });
    await wrapper.find('.b-popover__toggle').trigger('focusin');
    expect(wrapper.emitted('openChange')).toBeTruthy();
    expect(wrapper.emitted('openChange')![0]).toEqual([true]);
  });
});

// ─────────────────────────────────────────────
// 4. Keyboard and focus behavior
// ─────────────────────────────────────────────
describe('BPopover – keyboard and focus', () => {
  it('closes on Escape from toggle', async () => {
    const wrapper = mountPopover({ trigger: 'click' });

    await wrapper.find('.b-popover__toggle').trigger('click');
    await wrapper.find('.b-popover__toggle').trigger('keydown', { key: 'Escape' });

    const events = wrapper.emitted('openChange');
    expect(events).toBeTruthy();
    expect(events![events!.length - 1]).toEqual([false]);
  });

  it('closes on Escape from popover content', async () => {
    const wrapper = mountPopover({ trigger: 'click' });

    await wrapper.find('.b-popover__toggle').trigger('click');
    await wrapper.find('[role="tooltip"]').trigger('keydown', { key: 'Escape' });

    const events = wrapper.emitted('openChange');
    expect(events).toBeTruthy();
    expect(events![events!.length - 1]).toEqual([false]);
  });

  it('traps focus with Tab within popover', async () => {
    const wrapper = mount(BPopover, {
      props: { trigger: 'click', content: 'Body' },
      slots: {
        default: () => 'Trigger',
        content: () => '<button class="inner-btn">Click</button>',
      },
      attachTo: document.body,
    });
    const popoverEl = wrapper.find('[role="tooltip"]').element as HTMLElement;
    if (popoverEl) stubPopoverAPI(popoverEl);

    await wrapper.find('.b-popover__toggle').trigger('click');
    const tooltip = wrapper.find('[role="tooltip"]');
    await tooltip.trigger('keydown', { key: 'Tab' });
    expect(tooltip.exists()).toBe(true);
  });

  it('opens on focusin for focus trigger', async () => {
    const wrapper = mountPopover({ trigger: 'focus' });
    await wrapper.find('.b-popover__toggle').trigger('focusin');
    expect(wrapper.emitted('openChange')).toBeTruthy();
  });

  it('closes on focusout for focus trigger', async () => {
    const wrapper = mountPopover({ trigger: 'focus' });

    await wrapper.find('.b-popover__toggle').trigger('focusin');
    await wrapper.find('.b-popover__toggle').trigger('focusout');

    const events = wrapper.emitted('openChange');
    expect(events).toBeTruthy();
    expect(events![events!.length - 1]).toEqual([false]);
  });
});

// ─────────────────────────────────────────────
// 5. Accessibility checks (roles and aria)
// ─────────────────────────────────────────────
describe('BPopover – accessibility', () => {
  it('has role="tooltip" on the popover content', () => {
    const wrapper = mountPopover();
    expect(wrapper.find('.b-popover__content').attributes('role')).toBe('tooltip');
  });

  it('has aria-labelledby pointing to the title', () => {
    const wrapper = mountPopover({ title: 'Title' });
    const popoverEl = wrapper.find('[role="tooltip"]');
    const titleEl = wrapper.find('.b-popover__title');
    expect(popoverEl.attributes('aria-labelledby')).toBe(titleEl.attributes('id'));
  });

  it('has a unique id on the tooltip', () => {
    const wrapper = mountPopover();
    const id = wrapper.find('[role="tooltip"]').attributes('id');
    expect(id).toBeTruthy();
  });

  it('arrow element is aria-hidden', () => {
    const wrapper = mountPopover();
    expect(wrapper.find('.b-popover__arrow').attributes('aria-hidden')).toBe('true');
  });

  it('tabindex="-1" allows programmatic focus', () => {
    const wrapper = mountPopover();
    expect(wrapper.find('[role="tooltip"]').attributes('tabindex')).toBe('-1');
  });

  it('title id matches aria-labelledby on the popover', () => {
    const wrapper = mountPopover({ title: 'Check IDs' });
    const tooltipEl = wrapper.find('[role="tooltip"]');
    const titleEl = wrapper.find('.b-popover__title');
    const labelledBy = tooltipEl.attributes('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(labelledBy).toBe(titleEl.attributes('id'));
  });
});

// ─────────────────────────────────────────────
// 6. Edge cases
// ─────────────────────────────────────────────
describe('BPopover – edge cases', () => {
  it('handles long content without breaking layout', () => {
    const longContent = 'A'.repeat(500);
    const wrapper = mountPopover({ content: longContent });
    expect(wrapper.find('.b-popover__body').text()).toBe(longContent);
  });

  it('controlled mode: does not change internal state directly', async () => {
    const wrapper = mountPopover({ modelValue: false, trigger: 'click' });
    await wrapper.find('.b-popover__toggle').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });

  it('uncontrolled mode: manages state internally', () => {
    const wrapper = mountPopover({ trigger: 'click' });
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('destroyTooltipOnHide=true removes inner content when closed', () => {
    const wrapper = mountPopover({ destroyTooltipOnHide: true });
    expect(wrapper.find('.b-popover__inner').exists()).toBe(false);
  });

  it('renders inner content by default even when closed (not destroyed)', () => {
    const wrapper = mountPopover({ destroyTooltipOnHide: false });
    expect(wrapper.find('.b-popover__inner').exists()).toBe(true);
  });

  it('switches placement reactively', async () => {
    const wrapper = mountPopover({ placement: 'top-center' });
    expect(wrapper.find('.b-popover__content.top-center').exists()).toBe(true);

    await wrapper.setProps({ placement: 'bottom-center' });
    expect(wrapper.find('.b-popover__content.bottom-center').exists()).toBe(true);
  });

  it('renders without title, only content', () => {
    const wrapper = mount(BPopover, {
      props: { content: 'Just content' },
      slots: { default: () => 'Trigger' },
      attachTo: document.body,
    });
    const popoverEl = wrapper.find('[role="tooltip"]').element as HTMLElement;
    if (popoverEl) stubPopoverAPI(popoverEl);

    expect(wrapper.find('.b-popover__title').exists()).toBe(false);
    expect(wrapper.find('.b-popover__body').text()).toBe('Just content');
  });

  it('renders with title slot and content slot simultaneously', () => {
    const wrapper = mount(BPopover, {
      props: {},
      slots: {
        default: () => 'Trigger',
        title: () => 'Custom Title',
        content: () => 'Custom Content',
      },
      attachTo: document.body,
    });
    const popoverEl = wrapper.find('[role="tooltip"]').element as HTMLElement;
    if (popoverEl) stubPopoverAPI(popoverEl);

    expect(wrapper.find('.b-popover__title').text()).toBe('Custom Title');
    expect(wrapper.find('.b-popover__body').text()).toBe('Custom Content');
  });
});

// ─────────────────────────────────────────────
// 7. Deterministic animation tests with fake timers
// ─────────────────────────────────────────────
describe('BPopover – delays (fake timers)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('respects mouseEnterDelay before showing (hover trigger)', async () => {
    const wrapper = mountPopover({ trigger: 'hover', mouseEnterDelay: 500 });

    await wrapper.find('.b-popover__toggle').trigger('mouseenter');

    expect(wrapper.emitted('openChange')).toBeFalsy();

    vi.advanceTimersByTime(500);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('openChange')).toBeTruthy();
  });

  it('respects mouseLeaveDelay before hiding (hover trigger)', async () => {
    const wrapper = mountPopover({ trigger: 'hover', mouseEnterDelay: 0, mouseLeaveDelay: 300 });

    await wrapper.find('.b-popover__toggle').trigger('mouseenter');
    await wrapper.vm.$nextTick();

    const openEvents1 = wrapper.emitted('openChange') ?? [];
    expect(openEvents1.length).toBeGreaterThan(0);
    expect(openEvents1[openEvents1.length - 1]).toEqual([true]);

    await wrapper.find('.b-popover__toggle').trigger('mouseleave');
    await wrapper.vm.$nextTick();

    const eventsAfterLeave = wrapper.emitted('openChange')!;
    const hasClose = eventsAfterLeave.some((e) => e[0] === false);
    expect(hasClose).toBe(false);

    vi.advanceTimersByTime(300);
    await wrapper.vm.$nextTick();

    const allEvents = wrapper.emitted('openChange')!;
    expect(allEvents[allEvents.length - 1]).toEqual([false]);
  });

  it('cancels show timer when leaving before delay', async () => {
    const wrapper = mountPopover({ trigger: 'hover', mouseEnterDelay: 500 });

    await wrapper.find('.b-popover__toggle').trigger('mouseenter');
    await wrapper.find('.b-popover__toggle').trigger('mouseleave');

    vi.advanceTimersByTime(500);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('openChange')).toBeFalsy();
  });

  it('keeps popover open when hovering the popover content', async () => {
    const wrapper = mountPopover({ trigger: 'hover', mouseEnterDelay: 0, mouseLeaveDelay: 200 });

    await wrapper.find('.b-popover__toggle').trigger('mouseenter');
    await wrapper.vm.$nextTick();

    // Mouse leaves toggle
    await wrapper.find('.b-popover__toggle').trigger('mouseleave');

    // But enters popover content
    await wrapper.find('[role="tooltip"]').trigger('mouseenter');

    vi.advanceTimersByTime(200);
    await wrapper.vm.$nextTick();

    const events = wrapper.emitted('openChange')!;
    // Should only have the open event, no close
    expect(events[events.length - 1]).toEqual([true]);
  });
});
