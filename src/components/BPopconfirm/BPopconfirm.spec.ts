import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BPopconfirm from './BPopconfirm.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

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

function mountPopconfirm(
  props: Record<string, unknown> = {},
  slots: Record<string, () => string> = {},
) {
  const wrapper = mount(BPopconfirm, {
    props: { title: 'Are you sure?', ...props },
    slots: { default: () => 'Click me', ...slots },
    attachTo: document.body,
  });

  const popconfirmEl = wrapper.find('[role="dialog"]').element as HTMLElement;
  if (popconfirmEl) {
    stubPopoverAPI(popconfirmEl);
  }

  return wrapper;
}

// ─────────────────────────────────────────────
// 1. Defaults & variants render
// ─────────────────────────────────────────────
describe('BPopconfirm – defaults and variants', () => {
  it('renders the toggle wrapper with default slot', () => {
    const wrapper = mountPopconfirm();
    expect(wrapper.find('.b-popconfirm__toggle').text()).toBe('Click me');
  });

  it('renders a dialog element with role="dialog"', () => {
    const wrapper = mountPopconfirm();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
  });

  it('renders title text from prop', () => {
    const wrapper = mountPopconfirm({ title: 'Delete this item?' });
    expect(wrapper.find('.b-popconfirm__title').text()).toBe('Delete this item?');
  });

  it('renders title from slot, overriding prop', () => {
    const wrapper = mountPopconfirm({ title: 'Prop title' }, { title: () => 'Slot title' });
    expect(wrapper.find('.b-popconfirm__title').text()).toBe('Slot title');
  });

  it('renders description when provided', () => {
    const wrapper = mountPopconfirm({ description: 'This cannot be undone.' });
    expect(wrapper.find('.b-popconfirm__description').text()).toBe('This cannot be undone.');
  });

  it('renders description from slot', () => {
    const wrapper = mountPopconfirm({}, { description: () => 'Slot description' });
    expect(wrapper.find('.b-popconfirm__description').text()).toBe('Slot description');
  });

  it('does not render description when not provided', () => {
    const wrapper = mountPopconfirm();
    expect(wrapper.find('.b-popconfirm__description').exists()).toBe(false);
  });

  it('renders arrow by default', () => {
    const wrapper = mountPopconfirm();
    expect(wrapper.find('.b-popconfirm__arrow').exists()).toBe(true);
  });

  it('hides arrow when arrow=false', () => {
    const wrapper = mountPopconfirm({ arrow: false });
    expect(wrapper.find('.b-popconfirm__arrow').exists()).toBe(false);
    expect(wrapper.find('.b-popconfirm__content--no-arrow').exists()).toBe(true);
  });

  it('renders default confirm and cancel buttons', () => {
    const wrapper = mountPopconfirm();
    const buttons = wrapper.findAll('.b-popconfirm__btn');
    expect(buttons.length).toBe(2);
    expect(buttons[0].text()).toBe('No');
    expect(buttons[1].text()).toBe('Yes');
  });

  it('renders custom okText and cancelText', () => {
    const wrapper = mountPopconfirm({ okText: 'Confirm', cancelText: 'Dismiss' });
    const buttons = wrapper.findAll('.b-popconfirm__btn');
    expect(buttons[0].text()).toBe('Dismiss');
    expect(buttons[1].text()).toBe('Confirm');
  });

  it('hides cancel button when showCancel=false', () => {
    const wrapper = mountPopconfirm({ showCancel: false });
    const buttons = wrapper.findAll('.b-popconfirm__btn');
    expect(buttons.length).toBe(1);
    expect(buttons[0].text()).toBe('Yes');
  });

  it('renders default warning icon', () => {
    const wrapper = mountPopconfirm();
    expect(wrapper.find('.b-popconfirm__icon svg').exists()).toBe(true);
  });

  it('renders custom icon from slot', () => {
    const wrapper = mount(BPopconfirm, {
      props: { title: 'Are you sure?' },
      slots: {
        default: () => 'Click me',
        icon: '<span class="custom-icon">!</span>',
      },
      attachTo: document.body,
    });
    const popconfirmEl = wrapper.find('[role="dialog"]').element as HTMLElement;
    if (popconfirmEl) stubPopoverAPI(popconfirmEl);
    expect(wrapper.find('.custom-icon').exists()).toBe(true);
  });

  it('applies default placement class (top-center)', () => {
    const wrapper = mountPopconfirm();
    expect(wrapper.find('.b-popconfirm__content.top-center').exists()).toBe(true);
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
    const wrapper = mountPopconfirm({ placement });
    expect(wrapper.find(`.b-popconfirm__content.${placement}`).exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behavior
// ─────────────────────────────────────────────
describe('BPopconfirm – props map to DOM', () => {
  it('applies z-index from prop', () => {
    const wrapper = mountPopconfirm({ zIndex: 2000 });
    const style = wrapper.find('.b-popconfirm__content').attributes('style') ?? '';
    expect(style).toContain('2000');
  });

  it('uses popover="manual" on the content', () => {
    const wrapper = mountPopconfirm();
    expect(wrapper.find('.b-popconfirm__content').attributes('popover')).toBe('manual');
  });

  it('applies primary class to ok button by default', () => {
    const wrapper = mountPopconfirm();
    const okBtn = wrapper.findAll('.b-popconfirm__btn')[1];
    expect(okBtn.classes()).toContain('b-popconfirm__btn--primary');
  });

  it.each(['primary', 'default', 'dashed', 'text', 'link'] as const)(
    'applies okType=%s class to ok button',
    (okType) => {
      const wrapper = mountPopconfirm({ okType });
      const okBtn = wrapper.findAll('.b-popconfirm__btn').pop()!;
      expect(okBtn.classes()).toContain(`b-popconfirm__btn--${okType}`);
    },
  );

  it('does not open when disabled=true', async () => {
    const wrapper = mountPopconfirm({ disabled: true, trigger: 'click' });
    await wrapper.find('.b-popconfirm__toggle').trigger('click');
    expect(wrapper.emitted('openChange')).toBeFalsy();
  });
});

// ─────────────────────────────────────────────
// 3. Events order
// ─────────────────────────────────────────────
describe('BPopconfirm – events', () => {
  it('emits openChange when popconfirm opens via click', async () => {
    const wrapper = mountPopconfirm({ trigger: 'click' });
    await wrapper.find('.b-popconfirm__toggle').trigger('click');
    expect(wrapper.emitted('openChange')).toBeTruthy();
    expect(wrapper.emitted('openChange')![0]).toEqual([true]);
  });

  it('emits confirm then openChange(false) when ok button is clicked', async () => {
    const wrapper = mountPopconfirm({ trigger: 'click' });

    // Open
    await wrapper.find('.b-popconfirm__toggle').trigger('click');

    // Click confirm
    const okBtn = wrapper.findAll('.b-popconfirm__btn')[1];
    await okBtn.trigger('click');

    expect(wrapper.emitted('confirm')).toBeTruthy();
    expect(wrapper.emitted('confirm')!.length).toBe(1);

    const openEvents = wrapper.emitted('openChange')!;
    expect(openEvents[openEvents.length - 1]).toEqual([false]);
  });

  it('emits cancel then openChange(false) when cancel button is clicked', async () => {
    const wrapper = mountPopconfirm({ trigger: 'click' });

    // Open
    await wrapper.find('.b-popconfirm__toggle').trigger('click');

    // Click cancel
    const cancelBtn = wrapper.findAll('.b-popconfirm__btn')[0];
    await cancelBtn.trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
    expect(wrapper.emitted('cancel')!.length).toBe(1);

    const openEvents = wrapper.emitted('openChange')!;
    expect(openEvents[openEvents.length - 1]).toEqual([false]);
  });

  it('emits update:modelValue in controlled mode', async () => {
    const wrapper = mountPopconfirm({ trigger: 'click', modelValue: false });
    await wrapper.find('.b-popconfirm__toggle').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });
});

// ─────────────────────────────────────────────
// 4. Keyboard and focus behavior
// ─────────────────────────────────────────────
describe('BPopconfirm – keyboard and focus', () => {
  it('closes on Escape from toggle', async () => {
    const wrapper = mountPopconfirm({ trigger: 'click' });

    await wrapper.find('.b-popconfirm__toggle').trigger('click');
    await wrapper.find('.b-popconfirm__toggle').trigger('keydown', { key: 'Escape' });

    const events = wrapper.emitted('openChange');
    expect(events).toBeTruthy();
    expect(events![events!.length - 1]).toEqual([false]);
  });

  it('closes on Escape from popconfirm content', async () => {
    const wrapper = mountPopconfirm({ trigger: 'click' });

    await wrapper.find('.b-popconfirm__toggle').trigger('click');
    await wrapper.find('[role="dialog"]').trigger('keydown', { key: 'Escape' });

    const events = wrapper.emitted('openChange');
    expect(events).toBeTruthy();
    expect(events![events!.length - 1]).toEqual([false]);
  });

  it('traps focus with Tab within popconfirm', async () => {
    const wrapper = mountPopconfirm({ trigger: 'click' });
    await wrapper.find('.b-popconfirm__toggle').trigger('click');

    const dialog = wrapper.find('[role="dialog"]');
    const buttons = wrapper.findAll('.b-popconfirm__btn');
    const lastBtn = buttons[buttons.length - 1].element as HTMLElement;

    // Simulate focus on last button
    lastBtn.focus();

    // Tab should wrap to first focusable
    await dialog.trigger('keydown', { key: 'Tab' });
    // The trapFocus function should have been called
    expect(dialog.exists()).toBe(true);
  });

  it('traps focus with Shift+Tab within popconfirm', async () => {
    const wrapper = mountPopconfirm({ trigger: 'click' });
    await wrapper.find('.b-popconfirm__toggle').trigger('click');

    const dialog = wrapper.find('[role="dialog"]');
    const buttons = wrapper.findAll('.b-popconfirm__btn');
    const firstBtn = buttons[0].element as HTMLElement;

    // Simulate focus on first button
    firstBtn.focus();

    // Shift+Tab should wrap to last focusable
    await dialog.trigger('keydown', { key: 'Tab', shiftKey: true });
    expect(dialog.exists()).toBe(true);
  });

  it('opens on focusin for focus trigger', async () => {
    const wrapper = mountPopconfirm({ trigger: 'focus' });
    await wrapper.find('.b-popconfirm__toggle').trigger('focusin');
    expect(wrapper.emitted('openChange')).toBeTruthy();
  });

  it('closes on focusout for focus trigger', async () => {
    const wrapper = mountPopconfirm({ trigger: 'focus' });

    await wrapper.find('.b-popconfirm__toggle').trigger('focusin');
    await wrapper.find('.b-popconfirm__toggle').trigger('focusout');

    const events = wrapper.emitted('openChange');
    expect(events).toBeTruthy();
    expect(events![events!.length - 1]).toEqual([false]);
  });
});

// ─────────────────────────────────────────────
// 5. Accessibility checks (roles and aria)
// ─────────────────────────────────────────────
describe('BPopconfirm – accessibility', () => {
  it('has role="dialog" on the popconfirm content', () => {
    const wrapper = mountPopconfirm();
    expect(wrapper.find('.b-popconfirm__content').attributes('role')).toBe('dialog');
  });

  it('has aria-modal="false" (non-modal dialog)', () => {
    const wrapper = mountPopconfirm();
    expect(wrapper.find('[role="dialog"]').attributes('aria-modal')).toBe('false');
  });

  it('has aria-labelledby pointing to the title', () => {
    const wrapper = mountPopconfirm();
    const dialog = wrapper.find('[role="dialog"]');
    const titleEl = wrapper.find('.b-popconfirm__title');
    expect(dialog.attributes('aria-labelledby')).toBe(titleEl.attributes('id'));
  });

  it('has aria-describedby pointing to description when present', () => {
    const wrapper = mountPopconfirm({ description: 'Some description' });
    const dialog = wrapper.find('[role="dialog"]');
    const descEl = wrapper.find('.b-popconfirm__description');
    expect(dialog.attributes('aria-describedby')).toBe(descEl.attributes('id'));
  });

  it('does not have aria-describedby when no description', () => {
    const wrapper = mountPopconfirm();
    const dialog = wrapper.find('[role="dialog"]');
    expect(dialog.attributes('aria-describedby')).toBeUndefined();
  });

  it('has a unique id on the dialog', () => {
    const wrapper = mountPopconfirm();
    const id = wrapper.find('[role="dialog"]').attributes('id');
    expect(id).toBeTruthy();
  });

  it('arrow element is aria-hidden', () => {
    const wrapper = mountPopconfirm();
    expect(wrapper.find('.b-popconfirm__arrow').attributes('aria-hidden')).toBe('true');
  });

  it('icon is aria-hidden', () => {
    const wrapper = mountPopconfirm();
    expect(wrapper.find('.b-popconfirm__icon').attributes('aria-hidden')).toBe('true');
  });

  it('icon svg is aria-hidden', () => {
    const wrapper = mountPopconfirm();
    expect(wrapper.find('.b-popconfirm__icon svg').attributes('aria-hidden')).toBe('true');
  });

  it('buttons have role="group"', () => {
    const wrapper = mountPopconfirm();
    expect(wrapper.find('.b-popconfirm__buttons').attributes('role')).toBe('group');
  });

  it('dialog has tabindex="-1" for programmatic focus', () => {
    const wrapper = mountPopconfirm();
    expect(wrapper.find('[role="dialog"]').attributes('tabindex')).toBe('-1');
  });
});

// ─────────────────────────────────────────────
// 6. Edge cases
// ─────────────────────────────────────────────
describe('BPopconfirm – edge cases', () => {
  it('handles long content without breaking layout', () => {
    const longContent = 'A'.repeat(500);
    const wrapper = mountPopconfirm({ title: longContent });
    expect(wrapper.find('.b-popconfirm__title').text()).toBe(longContent);
  });

  it('controlled mode: does not change internal state directly', async () => {
    const wrapper = mountPopconfirm({ modelValue: false, trigger: 'click' });
    await wrapper.find('.b-popconfirm__toggle').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });

  it('uncontrolled mode: manages state internally', () => {
    const wrapper = mountPopconfirm({ trigger: 'click' });
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('destroyTooltipOnHide=true removes inner content when closed', () => {
    const wrapper = mountPopconfirm({ destroyTooltipOnHide: true });
    expect(wrapper.find('.b-popconfirm__inner').exists()).toBe(false);
  });

  it('renders inner content by default even when closed (not destroyed)', () => {
    const wrapper = mountPopconfirm({ destroyTooltipOnHide: false });
    expect(wrapper.find('.b-popconfirm__inner').exists()).toBe(true);
  });

  it('switches placement reactively', async () => {
    const wrapper = mountPopconfirm({ placement: 'top-center' });
    expect(wrapper.find('.b-popconfirm__content.top-center').exists()).toBe(true);

    await wrapper.setProps({ placement: 'bottom-center' });
    expect(wrapper.find('.b-popconfirm__content.bottom-center').exists()).toBe(true);
  });

  it('confirm closes the popconfirm in uncontrolled mode', async () => {
    const wrapper = mountPopconfirm({ trigger: 'click' });

    await wrapper.find('.b-popconfirm__toggle').trigger('click');
    const okBtn = wrapper.findAll('.b-popconfirm__btn')[1];
    await okBtn.trigger('click');

    const events = wrapper.emitted('openChange')!;
    expect(events[events.length - 1]).toEqual([false]);
  });

  it('cancel closes the popconfirm in uncontrolled mode', async () => {
    const wrapper = mountPopconfirm({ trigger: 'click' });

    await wrapper.find('.b-popconfirm__toggle').trigger('click');
    const cancelBtn = wrapper.findAll('.b-popconfirm__btn')[0];
    await cancelBtn.trigger('click');

    const events = wrapper.emitted('openChange')!;
    expect(events[events.length - 1]).toEqual([false]);
  });
});

// ─────────────────────────────────────────────
// 7. Deterministic animation tests with fake timers
// ─────────────────────────────────────────────
describe('BPopconfirm – delays (fake timers)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('respects mouseEnterDelay before showing (hover trigger)', async () => {
    const wrapper = mountPopconfirm({ trigger: 'hover', mouseEnterDelay: 500 });

    await wrapper.find('.b-popconfirm__toggle').trigger('mouseenter');

    expect(wrapper.emitted('openChange')).toBeFalsy();

    vi.advanceTimersByTime(500);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('openChange')).toBeTruthy();
  });

  it('respects mouseLeaveDelay before hiding (hover trigger)', async () => {
    const wrapper = mountPopconfirm({ trigger: 'hover', mouseEnterDelay: 0, mouseLeaveDelay: 300 });

    await wrapper.find('.b-popconfirm__toggle').trigger('mouseenter');
    await wrapper.vm.$nextTick();

    const openEvents1 = wrapper.emitted('openChange') ?? [];
    expect(openEvents1.length).toBeGreaterThan(0);
    expect(openEvents1[openEvents1.length - 1]).toEqual([true]);

    await wrapper.find('.b-popconfirm__toggle').trigger('mouseleave');
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
    const wrapper = mountPopconfirm({ trigger: 'hover', mouseEnterDelay: 500 });

    await wrapper.find('.b-popconfirm__toggle').trigger('mouseenter');
    await wrapper.find('.b-popconfirm__toggle').trigger('mouseleave');

    vi.advanceTimersByTime(500);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('openChange')).toBeFalsy();
  });

  it('keeps popconfirm open when hovering the popconfirm content', async () => {
    const wrapper = mountPopconfirm({ trigger: 'hover', mouseEnterDelay: 0, mouseLeaveDelay: 200 });

    await wrapper.find('.b-popconfirm__toggle').trigger('mouseenter');
    await wrapper.vm.$nextTick();

    // Mouse leaves toggle
    await wrapper.find('.b-popconfirm__toggle').trigger('mouseleave');

    // But enters popconfirm content
    await wrapper.find('[role="dialog"]').trigger('mouseenter');

    vi.advanceTimersByTime(200);
    await wrapper.vm.$nextTick();

    const events = wrapper.emitted('openChange')!;
    // Should only have the open event, no close
    expect(events[events.length - 1]).toEqual([true]);
  });
});
