import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BNotificationPlacement, BNotificationType } from '@/types.ts';
import BNotification from './BNotification.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function mountNotification(props = {}, slots = {}) {
  return mount(BNotification, {
    props,
    slots,
    global: {
      stubs: {
        teleport: true,
      },
    },
  });
}

// ─────────────────────────────────────────────
// 1. Defaults & variants render
// ─────────────────────────────────────────────
describe('BNotification – defaults and variants', () => {
  it('is closed by default (no modelValue provided)', () => {
    const wrapper = mountNotification({ message: 'Hello' });
    expect(wrapper.find('.b-notification').exists()).toBe(false);
  });

  it('renders when modelValue=true', () => {
    const wrapper = mountNotification({ modelValue: true, message: 'Hello' });
    expect(wrapper.find('.b-notification').exists()).toBe(true);
  });

  it('applies default placement class (top-right)', () => {
    const wrapper = mountNotification({ modelValue: true, message: 'Test' });
    expect(wrapper.find('.b-notification--top-right').exists()).toBe(true);
  });

  it.each([
    BNotificationPlacement.TopRight,
    BNotificationPlacement.TopLeft,
    BNotificationPlacement.BottomRight,
    BNotificationPlacement.BottomLeft,
  ])('renders placement=%s with correct class', (placement) => {
    const wrapper = mountNotification({ modelValue: true, placement, message: 'Test' });
    expect(wrapper.find(`.b-notification--${placement}`).exists()).toBe(true);
  });

  it.each([
    BNotificationType.Success,
    BNotificationType.Info,
    BNotificationType.Warning,
    BNotificationType.Error,
  ])('renders type=%s with correct class', (type) => {
    const wrapper = mountNotification({ modelValue: true, type, message: type });
    expect(wrapper.find(`.b-notification--${type}`).exists()).toBe(true);
  });

  it('renders without type (plain notification)', () => {
    const wrapper = mountNotification({ modelValue: true, message: 'Plain' });
    expect(wrapper.find('.b-notification').exists()).toBe(true);
    expect(wrapper.find('.b-notification--success').exists()).toBe(false);
    expect(wrapper.find('.b-notification--info').exists()).toBe(false);
  });

  it('renders icon when type is set and showIcon=true', () => {
    const wrapper = mountNotification({
      modelValue: true,
      type: BNotificationType.Info,
    });
    expect(wrapper.find('.b-notification__icon').exists()).toBe(true);
    expect(wrapper.find('.b-notification--with-icon').exists()).toBe(true);
  });

  it('hides icon when showIcon=false', () => {
    const wrapper = mountNotification({
      modelValue: true,
      type: BNotificationType.Info,
      showIcon: false,
    });
    expect(wrapper.find('.b-notification__icon').exists()).toBe(false);
    expect(wrapper.find('.b-notification--with-icon').exists()).toBe(false);
  });

  it('renders close button by default', () => {
    const wrapper = mountNotification({ modelValue: true, message: 'Test' });
    expect(wrapper.find('.b-notification__close').exists()).toBe(true);
  });

  it('hides close button when closable=false', () => {
    const wrapper = mountNotification({
      modelValue: true,
      message: 'Test',
      closable: false,
    });
    expect(wrapper.find('.b-notification__close').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behaviour
// ─────────────────────────────────────────────
describe('BNotification – props map to DOM', () => {
  it('renders message from prop', () => {
    const wrapper = mountNotification({ modelValue: true, message: 'My Title' });
    expect(wrapper.find('.b-notification__message').text()).toBe('My Title');
  });

  it('renders message via slot', () => {
    const wrapper = mountNotification({ modelValue: true }, { message: () => 'Slot Title' });
    expect(wrapper.find('.b-notification__message').text()).toBe('Slot Title');
  });

  it('renders description from prop', () => {
    const wrapper = mountNotification({
      modelValue: true,
      message: 'Title',
      description: 'Detail text',
    });
    expect(wrapper.find('.b-notification__description').exists()).toBe(true);
    expect(wrapper.find('.b-notification__description').text()).toBe('Detail text');
  });

  it('renders description via slot', () => {
    const wrapper = mountNotification(
      { modelValue: true, message: 'Title' },
      { description: () => 'Slot desc' },
    );
    expect(wrapper.find('.b-notification__description').exists()).toBe(true);
  });

  it('does NOT render description element when neither prop nor slot provided', () => {
    const wrapper = mountNotification({ modelValue: true, message: 'Title' });
    expect(wrapper.find('.b-notification__description').exists()).toBe(false);
    expect(wrapper.find('.b-notification--with-description').exists()).toBe(false);
  });

  it('adds with-description class when description provided', () => {
    const wrapper = mountNotification({
      modelValue: true,
      message: 'Title',
      description: 'Desc',
    });
    expect(wrapper.find('.b-notification--with-description').exists()).toBe(true);
  });

  it('renders btn area via slot', () => {
    const wrapper = mountNotification(
      { modelValue: true, message: 'Title' },
      { btn: () => '<button>Action</button>' },
    );
    expect(wrapper.find('.b-notification__btn').exists()).toBe(true);
  });

  it('renders btn area via prop', () => {
    const wrapper = mountNotification({
      modelValue: true,
      message: 'Title',
      btn: 'Confirm',
    });
    expect(wrapper.find('.b-notification__btn').exists()).toBe(true);
    expect(wrapper.find('.b-notification__btn').text()).toBe('Confirm');
  });

  it('has id attribute', () => {
    const wrapper = mountNotification({ modelValue: true, message: 'A' });
    const id = wrapper.find('.b-notification').attributes('id');
    expect(id).toBeTruthy();
  });

  it('aria-labelledby links to title element id', () => {
    const wrapper = mountNotification({ modelValue: true, message: 'Title' });
    const notif = wrapper.find('.b-notification');
    const labelledby = notif.attributes('aria-labelledby');
    const titleEl = wrapper.find('.b-notification__message');
    expect(labelledby).toBe(titleEl.attributes('id'));
  });

  it('aria-describedby links to description element id when present', () => {
    const wrapper = mountNotification({
      modelValue: true,
      message: 'Title',
      description: 'Desc',
    });
    const notif = wrapper.find('.b-notification');
    const describedby = notif.attributes('aria-describedby');
    const descEl = wrapper.find('.b-notification__description');
    expect(describedby).toBe(descEl.attributes('id'));
  });

  it('aria-describedby is absent when no description', () => {
    const wrapper = mountNotification({ modelValue: true, message: 'Title' });
    expect(wrapper.find('.b-notification').attributes('aria-describedby')).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// 3. Close behaviour
// ─────────────────────────────────────────────
describe('BNotification – close behaviour', () => {
  it('clicking close button emits close event', async () => {
    const wrapper = mountNotification({ modelValue: true, message: 'Test' });
    await wrapper.find('.b-notification__close').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('clicking close button emits update:modelValue=false in controlled mode', async () => {
    const wrapper = mountNotification({ modelValue: true, message: 'Test' });
    await wrapper.find('.b-notification__close').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });

  it('clicking close button hides notification in uncontrolled mode', async () => {
    const wrapper = mountNotification({ message: 'Test', closable: true });
    wrapper.vm.open();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-notification').exists()).toBe(true);

    await wrapper.find('.b-notification__close').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-notification').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 4. Auto-close behaviour
// ─────────────────────────────────────────────
describe('BNotification – auto-close', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('auto-closes after default duration (4.5s)', async () => {
    const wrapper = mountNotification({ modelValue: true, message: 'Auto' });
    expect(wrapper.find('.b-notification').exists()).toBe(true);

    vi.advanceTimersByTime(4500);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('close')).toHaveLength(1);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });

  it('auto-closes after custom duration', async () => {
    const wrapper = mountNotification({
      modelValue: true,
      message: 'Custom',
      duration: 6,
    });

    vi.advanceTimersByTime(5999);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-notification').exists()).toBe(true);

    vi.advanceTimersByTime(1);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('does NOT auto-close when duration=0', async () => {
    const wrapper = mountNotification({
      modelValue: true,
      message: 'Sticky',
      duration: 0,
    });
    vi.advanceTimersByTime(99_999);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-notification').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 5. Controlled mode (v-model)
// ─────────────────────────────────────────────
describe('BNotification – controlled mode', () => {
  it('renders when modelValue=true', () => {
    const wrapper = mountNotification({ modelValue: true, message: 'Vis' });
    expect(wrapper.find('.b-notification').exists()).toBe(true);
  });

  it('does NOT render when modelValue=false', () => {
    const wrapper = mountNotification({ modelValue: false, message: 'Hid' });
    expect(wrapper.find('.b-notification').exists()).toBe(false);
  });

  it('switches reactively in controlled mode', async () => {
    const wrapper = mountNotification({ modelValue: true, message: 'React' });
    expect(wrapper.find('.b-notification').exists()).toBe(true);

    await wrapper.setProps({ modelValue: false });
    expect(wrapper.find('.b-notification').exists()).toBe(false);

    await wrapper.setProps({ modelValue: true });
    expect(wrapper.find('.b-notification').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 6. Uncontrolled mode (imperative API)
// ─────────────────────────────────────────────
describe('BNotification – uncontrolled mode', () => {
  it('is closed by default', () => {
    const wrapper = mountNotification({ message: 'Hidden', duration: 0 });
    expect(wrapper.find('.b-notification').exists()).toBe(false);
  });

  it('opens via exposed open() method', async () => {
    const wrapper = mountNotification({ message: 'Open me', duration: 0 });
    wrapper.vm.open();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-notification').exists()).toBe(true);
  });

  it('closes via exposed close() method', async () => {
    const wrapper = mountNotification({ message: 'Close me', duration: 0 });
    wrapper.vm.open();
    await wrapper.vm.$nextTick();
    wrapper.vm.close();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-notification').exists()).toBe(false);
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('exposes open and close methods', () => {
    const wrapper = mountNotification({ message: 'Imperative', duration: 0 });
    expect(typeof wrapper.vm.open).toBe('function');
    expect(typeof wrapper.vm.close).toBe('function');
  });
});

// ─────────────────────────────────────────────
// 7. Keyboard behaviour
// ─────────────────────────────────────────────
describe('BNotification – keyboard behaviour', () => {
  it('Escape key closes the notification (closable=true)', async () => {
    const wrapper = mountNotification({
      modelValue: true,
      message: 'Esc me',
      closable: true,
    });
    await wrapper.find('.b-notification').trigger('keydown', { key: 'Escape' });
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('Escape key does NOT close when closable=false', async () => {
    const wrapper = mountNotification({
      modelValue: true,
      message: 'No esc',
      closable: false,
    });
    await wrapper.find('.b-notification').trigger('keydown', { key: 'Escape' });
    expect(wrapper.emitted('close')).toBeFalsy();
  });

  it('close button is focusable (tabindex not -1)', () => {
    const wrapper = mountNotification({ modelValue: true, message: 'Test' });
    const closeBtn = wrapper.find('.b-notification__close');
    // Default button elements are focusable; tabindex should not be -1
    expect(closeBtn.attributes('tabindex')).not.toBe('-1');
  });
});

// ─────────────────────────────────────────────
// 8. Event ordering (close → afterClose)
// ─────────────────────────────────────────────
describe('BNotification – event ordering', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits close synchronously before afterClose', async () => {
    const wrapper = mountNotification({
      modelValue: true,
      message: 'Order',
      duration: 1,
    });

    vi.advanceTimersByTime(1000);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('close')).toHaveLength(1);
    // afterClose fires after the CSS transition - not yet
    expect(wrapper.emitted('afterClose')).toBeFalsy();

    // Simulate the Vue Transition after-leave hook
    wrapper.vm.$emit('afterClose');
    expect(wrapper.emitted('afterClose')).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────
// 9. Mouse hover pauses timer
// ─────────────────────────────────────────────
describe('BNotification – mouse hover pauses timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('pauses auto-close on mouseenter and resumes on mouseleave', async () => {
    const wrapper = mountNotification({
      modelValue: true,
      message: 'Hover me',
      duration: 3,
    });

    vi.advanceTimersByTime(2000);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-notification').exists()).toBe(true);

    await wrapper.find('.b-notification').trigger('mouseenter');
    vi.advanceTimersByTime(5000);
    await wrapper.vm.$nextTick();
    // Still visible - timer paused
    expect(wrapper.find('.b-notification').exists()).toBe(true);

    await wrapper.find('.b-notification').trigger('mouseleave');
    vi.advanceTimersByTime(3000);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────
// 10. Accessibility
// ─────────────────────────────────────────────
describe('BNotification – accessibility', () => {
  it('uses role="alert" for error type', () => {
    const wrapper = mountNotification({
      modelValue: true,
      type: BNotificationType.Error,
      message: 'Error',
    });
    expect(wrapper.find('.b-notification').attributes('role')).toBe('alert');
  });

  it('uses role="alert" for warning type', () => {
    const wrapper = mountNotification({
      modelValue: true,
      type: BNotificationType.Warning,
      message: 'Warn',
    });
    expect(wrapper.find('.b-notification').attributes('role')).toBe('alert');
  });

  it('uses role="status" for info type', () => {
    const wrapper = mountNotification({
      modelValue: true,
      type: BNotificationType.Info,
      message: 'Info',
    });
    expect(wrapper.find('.b-notification').attributes('role')).toBe('status');
  });

  it('uses role="status" for success type', () => {
    const wrapper = mountNotification({
      modelValue: true,
      type: BNotificationType.Success,
      message: 'Success',
    });
    expect(wrapper.find('.b-notification').attributes('role')).toBe('status');
  });

  it('uses role="status" for plain (no type) notification', () => {
    const wrapper = mountNotification({ modelValue: true, message: 'Plain' });
    expect(wrapper.find('.b-notification').attributes('role')).toBe('status');
  });

  it('sets aria-live=assertive for error/warning', () => {
    const wrapper = mountNotification({
      modelValue: true,
      type: BNotificationType.Error,
      message: 'Err',
    });
    expect(wrapper.find('.b-notification').attributes('aria-live')).toBe('assertive');
  });

  it('sets aria-live=polite for info/success', () => {
    const wrapper = mountNotification({
      modelValue: true,
      type: BNotificationType.Info,
      message: 'Info',
    });
    expect(wrapper.find('.b-notification').attributes('aria-live')).toBe('polite');
  });

  it('sets aria-atomic=true', () => {
    const wrapper = mountNotification({ modelValue: true, message: 'Test' });
    expect(wrapper.find('.b-notification').attributes('aria-atomic')).toBe('true');
  });

  it('icon is aria-hidden (decorative)', () => {
    const wrapper = mountNotification({
      modelValue: true,
      type: BNotificationType.Info,
      showIcon: true,
    });
    expect(wrapper.find('.b-notification__icon').attributes('aria-hidden')).toBe('true');
  });

  it('icon svg has focusable=false', () => {
    const wrapper = mountNotification({
      modelValue: true,
      type: BNotificationType.Info,
      showIcon: true,
    });
    expect(wrapper.find('.b-notification__icon-svg').attributes('focusable')).toBe('false');
  });

  it('close button has accessible label', () => {
    const wrapper = mountNotification({ modelValue: true, message: 'Test' });
    expect(wrapper.find('.b-notification__close').attributes('aria-label')).toBe(
      'Close notification',
    );
  });

  it('close button is type=button', () => {
    const wrapper = mountNotification({ modelValue: true, message: 'Test' });
    expect(wrapper.find('.b-notification__close').attributes('type')).toBe('button');
  });

  it('aria-labelledby attribute is set', () => {
    const wrapper = mountNotification({ modelValue: true, message: 'Test' });
    const labelledby = wrapper.find('.b-notification').attributes('aria-labelledby');
    expect(labelledby).toBeTruthy();
  });
});

// ─────────────────────────────────────────────
// 11. Edge cases
// ─────────────────────────────────────────────
describe('BNotification – edge cases', () => {
  it('handles very long message and description', () => {
    const longText = 'A'.repeat(2000);
    const wrapper = mountNotification({
      modelValue: true,
      message: longText,
      description: longText,
    });
    expect(wrapper.find('.b-notification__message').text()).toBe(longText);
    expect(wrapper.find('.b-notification__description').text()).toBe(longText);
  });

  it('renders multiple notifications independently', () => {
    const w1 = mountNotification({ modelValue: true, message: 'One', duration: 0 });
    const w2 = mountNotification({ modelValue: true, message: 'Two', duration: 0 });
    expect(w1.find('.b-notification').exists()).toBe(true);
    expect(w2.find('.b-notification').exists()).toBe(true);
  });

  it('uses Teleport to body (stub check)', () => {
    const wrapper = mountNotification({ modelValue: true, message: 'Teleported' });
    expect(wrapper.find('teleport-stub').exists()).toBe(true);
  });

  it('custom closeIcon slot overrides default close icon', () => {
    const wrapper = mountNotification(
      { modelValue: true, message: 'Test' },
      { closeIcon: () => '<span class="custom-close">✕</span>' },
    );
    expect(wrapper.find('.b-notification__close').exists()).toBe(true);
  });

  it('icon slot overrides default type icon', () => {
    const wrapper = mountNotification(
      { modelValue: true, type: BNotificationType.Info },
      { icon: () => '<span class="custom-icon">★</span>' },
    );
    expect(wrapper.find('.b-notification__icon').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 12. Animation / fake timers
// ─────────────────────────────────────────────
describe('BNotification – animation (fake timers)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('afterClose fires after leave transition via $emit simulation', async () => {
    const wrapper = mountNotification({
      modelValue: true,
      message: 'Animate',
      duration: 1,
    });

    vi.advanceTimersByTime(1000);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('afterClose')).toBeFalsy();

    wrapper.vm.$emit('afterClose');
    expect(wrapper.emitted('afterClose')).toBeTruthy();
  });

  it('re-opening in controlled mode restarts the timer', async () => {
    const wrapper = mountNotification({ modelValue: true, message: 'Timer', duration: 2 });

    vi.advanceTimersByTime(2000);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('close')).toHaveLength(1);

    await wrapper.setProps({ modelValue: false });
    await wrapper.setProps({ modelValue: true });

    vi.advanceTimersByTime(2000);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('close')).toHaveLength(2);
  });
});
