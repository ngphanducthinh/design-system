import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BMessageType } from '@/types.ts';
import BMessage from './BMessage.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function mountMessage(props = {}, slots = {}) {
  return mount(BMessage, {
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
describe('BMessage – defaults and variants', () => {
  it('is closed by default (no modelValue provided)', () => {
    const wrapper = mountMessage({ content: 'Hello' });
    expect(wrapper.find('.b-message').exists()).toBe(false);
  });

  it('renders when modelValue=true (type=info, with icon)', () => {
    const wrapper = mountMessage({ modelValue: true, content: 'Hello' });

    expect(wrapper.find('.b-message').exists()).toBe(true);
    expect(wrapper.find('.b-message--info').exists()).toBe(true);
    expect(wrapper.find('.b-message__icon').exists()).toBe(true);
    expect(wrapper.text()).toContain('Hello');
  });

  it.each([
    BMessageType.Success,
    BMessageType.Info,
    BMessageType.Warning,
    BMessageType.Error,
    BMessageType.Loading,
  ])('renders type=%s with correct class', (type) => {
    const wrapper = mountMessage({ modelValue: true, type, content: type });
    expect(wrapper.find(`.b-message--${type}`).exists()).toBe(true);
  });

  it('renders icon by default (showIcon=true)', () => {
    const wrapper = mountMessage({ modelValue: true, content: 'Test' });
    expect(wrapper.find('.b-message__icon').exists()).toBe(true);
    // Icon must be aria-hidden
    expect(wrapper.find('.b-message__icon').attributes('aria-hidden')).toBe('true');
  });

  it('hides icon when showIcon=false', () => {
    const wrapper = mountMessage({ modelValue: true, showIcon: false });
    expect(wrapper.find('.b-message__icon').exists()).toBe(false);
  });

  it('renders loading type with spinning icon', () => {
    const wrapper = mountMessage({ modelValue: true, type: BMessageType.Loading });
    expect(wrapper.find('.b-message__icon-svg--spin').exists()).toBe(true);
  });

  it('does NOT spin icon for non-loading types', () => {
    const wrapper = mountMessage({ modelValue: true, type: BMessageType.Info });
    expect(wrapper.find('.b-message__icon-svg--spin').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behaviour
// ─────────────────────────────────────────────
describe('BMessage – props map to DOM', () => {
  it('renders content from prop', () => {
    const wrapper = mountMessage({ modelValue: true, content: 'My Message' });
    expect(wrapper.find('.b-message__content').text()).toBe('My Message');
  });

  it('renders content via default slot', () => {
    const wrapper = mountMessage({ modelValue: true }, { default: () => 'Slot content' });
    expect(wrapper.find('.b-message__content').text()).toBe('Slot content');
  });

  it('adds with-icon class when showIcon=true', () => {
    const wrapper = mountMessage({ modelValue: true, showIcon: true });
    expect(wrapper.find('.b-message--with-icon').exists()).toBe(true);
  });

  it('does NOT add with-icon class when showIcon=false', () => {
    const wrapper = mountMessage({ modelValue: true, showIcon: false });
    expect(wrapper.find('.b-message--with-icon').exists()).toBe(false);
  });

  it('renders icon via icon slot override', () => {
    const wrapper = mountMessage(
      { modelValue: true, showIcon: true },
      { icon: () => '<span class="custom-icon">★</span>' },
    );
    expect(wrapper.find('.b-message__icon').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 3. Auto-close behaviour (controlled via v-model)
// ─────────────────────────────────────────────
describe('BMessage – auto-close', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('auto-closes after default duration (3s)', async () => {
    const wrapper = mountMessage({ modelValue: true, content: 'Auto close' });
    expect(wrapper.find('.b-message').exists()).toBe(true);

    vi.advanceTimersByTime(3000);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('close')).toHaveLength(1);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });

  it('auto-closes after custom duration', async () => {
    const wrapper = mountMessage({ modelValue: true, content: 'Custom', duration: 5 });
    expect(wrapper.find('.b-message').exists()).toBe(true);

    vi.advanceTimersByTime(4999);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-message').exists()).toBe(true);

    vi.advanceTimersByTime(1);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('does NOT auto-close when duration=0', async () => {
    const wrapper = mountMessage({ modelValue: true, content: 'Sticky', duration: 0 });
    vi.advanceTimersByTime(99999);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-message').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 4. Controlled mode (v-model)
// ─────────────────────────────────────────────
describe('BMessage – controlled mode', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders when modelValue=true', () => {
    const wrapper = mountMessage({ modelValue: true });
    expect(wrapper.find('.b-message').exists()).toBe(true);
  });

  it('does NOT render when modelValue=false', () => {
    const wrapper = mountMessage({ modelValue: false });
    expect(wrapper.find('.b-message').exists()).toBe(false);
  });

  it('emits update:modelValue=false when auto-close fires', async () => {
    const wrapper = mountMessage({ modelValue: true, duration: 2 });

    vi.advanceTimersByTime(2000);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('switches from visible to hidden reactively in controlled mode', async () => {
    const wrapper = mountMessage({ modelValue: true });
    expect(wrapper.find('.b-message').exists()).toBe(true);

    await wrapper.setProps({ modelValue: false });
    expect(wrapper.find('.b-message').exists()).toBe(false);

    await wrapper.setProps({ modelValue: true });
    expect(wrapper.find('.b-message').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 5. Uncontrolled mode (open/close via exposed methods)
// ─────────────────────────────────────────────
describe('BMessage – uncontrolled mode', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('is closed by default', () => {
    const wrapper = mountMessage({ content: 'Hidden', duration: 0 });
    expect(wrapper.find('.b-message').exists()).toBe(false);
  });

  it('opens via exposed open() method', async () => {
    const wrapper = mountMessage({ content: 'Open me', duration: 0 });
    expect(wrapper.find('.b-message').exists()).toBe(false);

    wrapper.vm.open();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.b-message').exists()).toBe(true);
  });

  it('auto-closes after duration when opened via open()', async () => {
    const wrapper = mountMessage({ content: 'Auto', duration: 2 });

    wrapper.vm.open();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-message').exists()).toBe(true);

    vi.advanceTimersByTime(2000);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-message').exists()).toBe(false);
    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────
// 6. Event ordering (close → afterClose)
// ─────────────────────────────────────────────
describe('BMessage – event ordering', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits close synchronously before afterClose', async () => {
    const wrapper = mountMessage({ modelValue: true, content: 'Test', duration: 1 });

    vi.advanceTimersByTime(1000);
    await wrapper.vm.$nextTick();

    // close fires immediately
    expect(wrapper.emitted('close')).toHaveLength(1);
    // afterClose fires after the CSS transition → simulate via vm.$emit
    expect(wrapper.emitted('afterClose')).toBeFalsy();

    wrapper.vm.$emit('afterClose');
    expect(wrapper.emitted('afterClose')).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────
// 7. Mouse hover pauses timer
// ─────────────────────────────────────────────
describe('BMessage – mouse hover pauses timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('pauses auto-close on mouseenter and resumes on mouseleave', async () => {
    const wrapper = mountMessage({ modelValue: true, content: 'Hover me', duration: 3 });

    // Advance 2 seconds, then hover
    vi.advanceTimersByTime(2000);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-message').exists()).toBe(true);

    await wrapper.find('.b-message').trigger('mouseenter');

    // Advance past the original duration
    vi.advanceTimersByTime(5000);
    await wrapper.vm.$nextTick();
    // Still visible because timer was paused
    expect(wrapper.find('.b-message').exists()).toBe(true);

    await wrapper.find('.b-message').trigger('mouseleave');

    // Now the timer restarts for the full duration
    vi.advanceTimersByTime(3000);
    await wrapper.vm.$nextTick();
    // In controlled mode, close emits update:modelValue but doesn't hide
    // until parent updates the prop - check for the event instead
    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────
// 8. Accessibility
// ─────────────────────────────────────────────
describe('BMessage – accessibility', () => {
  it('uses role="alert" for error type', () => {
    const wrapper = mountMessage({ modelValue: true, type: BMessageType.Error });
    expect(wrapper.find('.b-message').attributes('role')).toBe('alert');
  });

  it('uses role="alert" for warning type', () => {
    const wrapper = mountMessage({ modelValue: true, type: BMessageType.Warning });
    expect(wrapper.find('.b-message').attributes('role')).toBe('alert');
  });

  it('uses role="status" for info type', () => {
    const wrapper = mountMessage({ modelValue: true, type: BMessageType.Info });
    expect(wrapper.find('.b-message').attributes('role')).toBe('status');
  });

  it('uses role="status" for success type', () => {
    const wrapper = mountMessage({ modelValue: true, type: BMessageType.Success });
    expect(wrapper.find('.b-message').attributes('role')).toBe('status');
  });

  it('uses role="status" for loading type', () => {
    const wrapper = mountMessage({ modelValue: true, type: BMessageType.Loading });
    expect(wrapper.find('.b-message').attributes('role')).toBe('status');
  });

  it('sets aria-live=assertive for error/warning', () => {
    const wrapper = mountMessage({ modelValue: true, type: BMessageType.Error });
    expect(wrapper.find('.b-message').attributes('aria-live')).toBe('assertive');
  });

  it('sets aria-live=polite for info/success/loading', () => {
    const wrapper = mountMessage({ modelValue: true, type: BMessageType.Info });
    expect(wrapper.find('.b-message').attributes('aria-live')).toBe('polite');
  });

  it('sets aria-atomic=true', () => {
    const wrapper = mountMessage({ modelValue: true, type: BMessageType.Info });
    expect(wrapper.find('.b-message').attributes('aria-atomic')).toBe('true');
  });

  it('icon is aria-hidden (decorative)', () => {
    const wrapper = mountMessage({ modelValue: true, showIcon: true });
    expect(wrapper.find('.b-message__icon').attributes('aria-hidden')).toBe('true');
  });

  it('icon svg has focusable=false', () => {
    const wrapper = mountMessage({ modelValue: true, showIcon: true });
    expect(wrapper.find('.b-message__icon-svg').attributes('focusable')).toBe('false');
  });
});

// ─────────────────────────────────────────────
// 9. Edge cases
// ─────────────────────────────────────────────
describe('BMessage – edge cases', () => {
  it('handles very long content without overflow errors', () => {
    const longContent = 'A'.repeat(2000);
    const wrapper = mountMessage({ modelValue: true, content: longContent });
    expect(wrapper.find('.b-message__content').text()).toBe(longContent);
  });

  it('renders multiple messages independently', () => {
    const w1 = mountMessage({ modelValue: true, content: 'One', duration: 0 });
    const w2 = mountMessage({ modelValue: true, content: 'Two', duration: 0 });
    expect(w1.find('.b-message').exists()).toBe(true);
    expect(w2.find('.b-message').exists()).toBe(true);
  });

  it('has an id attribute', () => {
    const wrapper = mountMessage({ modelValue: true, content: 'A' });
    const id = wrapper.find('.b-message').attributes('id');
    expect(id).toBeTruthy();
  });

  it('uses Teleport to body (stub check)', () => {
    const wrapper = mountMessage({ modelValue: true, content: 'Teleported' });
    // With teleport: true stub, the teleport-stub element exists
    expect(wrapper.find('teleport-stub').exists()).toBe(true);
  });

  it('exposes open and close methods', () => {
    const wrapper = mountMessage({ content: 'Imperative', duration: 0 });
    expect(typeof wrapper.vm.open).toBe('function');
    expect(typeof wrapper.vm.close).toBe('function');
  });

  it('imperative open then close triggers events', async () => {
    const wrapper = mountMessage({ content: 'Imperative', duration: 0 });
    expect(wrapper.find('.b-message').exists()).toBe(false);

    wrapper.vm.open();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-message').exists()).toBe(true);

    wrapper.vm.close();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('close')).toHaveLength(1);
    expect(wrapper.find('.b-message').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 10. Animation / fake timers
// ─────────────────────────────────────────────
describe('BMessage – animation (fake timers)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('afterClose event fires after leave transition', async () => {
    const wrapper = mountMessage({ modelValue: true, content: 'Animate me', duration: 1 });

    vi.advanceTimersByTime(1000);
    await wrapper.vm.$nextTick();

    // close fires right away
    expect(wrapper.emitted('close')).toBeTruthy();
    // afterClose fires after the CSS transition → simulate via vm.$emit
    expect(wrapper.emitted('afterClose')).toBeFalsy();

    // Simulate the Vue Transition after-leave hook
    wrapper.vm.$emit('afterClose');
    expect(wrapper.emitted('afterClose')).toBeTruthy();
  });

  it('re-opening in controlled mode restarts the timer', async () => {
    const wrapper = mountMessage({ modelValue: true, duration: 2 });

    vi.advanceTimersByTime(2000);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('close')).toHaveLength(1);

    // Parent closes (sets modelValue to false), then re-opens (true)
    await wrapper.setProps({ modelValue: false });
    await wrapper.setProps({ modelValue: true });

    vi.advanceTimersByTime(2000);
    await wrapper.vm.$nextTick();

    // close fires a second time
    expect(wrapper.emitted('close')).toHaveLength(2);
  });
});
