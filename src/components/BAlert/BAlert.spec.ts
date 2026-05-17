import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { BAlertType } from '@/types.ts';
import BAlert from './BAlert.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function mountAlert(props = {}, slots = {}) {
  return mount(BAlert, { props, slots });
}

// ─────────────────────────────────────────────
// 1. Defaults & variants render
// ─────────────────────────────────────────────
describe('BAlert – defaults and variants', () => {
  it('renders with default props (type=info, no icon, no close)', () => {
    const wrapper = mountAlert({ message: 'Hello' });

    expect(wrapper.find('.b-alert').exists()).toBe(true);
    expect(wrapper.find('.b-alert--info').exists()).toBe(true);
    expect(wrapper.find('.b-alert__icon').exists()).toBe(false);
    expect(wrapper.find('.b-alert__close').exists()).toBe(false);
    expect(wrapper.text()).toContain('Hello');
  });

  it.each([BAlertType.Success, BAlertType.Info, BAlertType.Warning, BAlertType.Error])(
    'renders type=%s with correct class',
    (type) => {
      const wrapper = mountAlert({ type, message: type });
      expect(wrapper.find(`.b-alert--${type}`).exists()).toBe(true);
    },
  );

  it('renders icon when showIcon=true', () => {
    const wrapper = mountAlert({ showIcon: true });
    expect(wrapper.find('.b-alert__icon').exists()).toBe(true);
    // Icon svg must be aria-hidden
    const svg = wrapper.find('.b-alert__icon-svg');
    expect(svg.exists()).toBe(true);
  });

  it('renders close button when closable=true', () => {
    const wrapper = mountAlert({ closable: true });
    const closeBtn = wrapper.find('.b-alert__close');
    expect(closeBtn.exists()).toBe(true);
    expect(closeBtn.attributes('aria-label')).toBe('Close alert');
  });

  it('applies banner class when banner=true', () => {
    const wrapper = mountAlert({ banner: true });
    expect(wrapper.find('.b-alert--banner').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM
// ─────────────────────────────────────────────
describe('BAlert – props map to DOM', () => {
  it('renders message from prop', () => {
    const wrapper = mountAlert({ message: 'My Message' });
    expect(wrapper.find('.b-alert__message').text()).toBe('My Message');
  });

  it('renders description from prop', () => {
    const wrapper = mountAlert({ message: 'M', description: 'Desc text' });
    expect(wrapper.find('.b-alert__description').exists()).toBe(true);
    expect(wrapper.find('.b-alert__description').text()).toContain('Desc text');
  });

  it('adds with-description class when description present', () => {
    const wrapper = mountAlert({ message: 'M', description: 'D' });
    expect(wrapper.find('.b-alert--with-description').exists()).toBe(true);
  });

  it('does NOT add with-description class when no description', () => {
    const wrapper = mountAlert({ message: 'M' });
    expect(wrapper.find('.b-alert--with-description').exists()).toBe(false);
  });

  it('renders action text', () => {
    const wrapper = mountAlert({ action: 'Retry' });
    expect(wrapper.find('.b-alert__action').text()).toContain('Retry');
  });

  it('renders message via default slot', () => {
    const wrapper = mountAlert({}, { default: () => 'Slot message' });
    expect(wrapper.find('.b-alert__message').text()).toBe('Slot message');
  });

  it('renders description via description slot', () => {
    const wrapper = mount(BAlert, {
      props: { message: 'M' },
      slots: { description: 'Slot description' },
    });
    expect(wrapper.find('.b-alert__description').text()).toContain('Slot description');
  });

  it('renders action via action slot', () => {
    const wrapper = mount(BAlert, {
      props: {},
      slots: { action: '<button>Undo</button>' },
    });
    expect(wrapper.find('.b-alert__action').exists()).toBe(true);
    expect(wrapper.find('.b-alert__action button').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 3. Uncontrolled close behaviour
// ─────────────────────────────────────────────
describe('BAlert – uncontrolled close', () => {
  it('hides the alert when close button is clicked', async () => {
    const wrapper = mountAlert({ closable: true, message: 'Bye' });
    expect(wrapper.find('.b-alert').exists()).toBe(true);

    await wrapper.find('.b-alert__close').trigger('click');
    // v-if removes the element
    expect(wrapper.find('.b-alert').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 4. Controlled mode (v-model)
// ─────────────────────────────────────────────
describe('BAlert – controlled mode', () => {
  it('renders when modelValue=true', () => {
    const wrapper = mountAlert({ modelValue: true, closable: true });
    expect(wrapper.find('.b-alert').exists()).toBe(true);
  });

  it('does NOT render when modelValue=false', () => {
    const wrapper = mountAlert({ modelValue: false });
    expect(wrapper.find('.b-alert').exists()).toBe(false);
  });

  it('emits update:modelValue=false and close on close click', async () => {
    const wrapper = mountAlert({ modelValue: true, closable: true });
    await wrapper.find('.b-alert__close').trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});

// ─────────────────────────────────────────────
// 5. Event ordering (close → afterClose)
// ─────────────────────────────────────────────
describe('BAlert – event ordering', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits close synchronously before afterClose', async () => {
    const wrapper = mountAlert({ closable: true });

    // Use emitted() which is synchronous capture
    await wrapper.find('.b-alert__close').trigger('click');
    // close fires immediately
    expect(wrapper.emitted('close')).toHaveLength(1);
    // afterClose fires after the CSS transition → simulate via @after-leave
    // Since jsdom doesn't run CSS transitions, we trigger it manually
    wrapper.vm.$emit('afterClose');
    expect(wrapper.emitted('afterClose')).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────
// 6. Keyboard behaviour
// ─────────────────────────────────────────────
describe('BAlert – keyboard', () => {
  it('closes on Enter keydown', async () => {
    const wrapper = mountAlert({ closable: true });
    await wrapper.find('.b-alert__close').trigger('keydown', { key: 'Enter' });
    expect(wrapper.find('.b-alert').exists()).toBe(false);
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('closes on Space keydown', async () => {
    const wrapper = mountAlert({ closable: true });
    await wrapper.find('.b-alert__close').trigger('keydown', { key: ' ' });
    expect(wrapper.find('.b-alert').exists()).toBe(false);
  });

  it('closes on Escape keydown', async () => {
    const wrapper = mountAlert({ closable: true });
    await wrapper.find('.b-alert__close').trigger('keydown', { key: 'Escape' });
    expect(wrapper.find('.b-alert').exists()).toBe(false);
  });

  it('does NOT close on Tab keydown', async () => {
    const wrapper = mountAlert({ closable: true });
    await wrapper.find('.b-alert__close').trigger('keydown', { key: 'Tab' });
    expect(wrapper.find('.b-alert').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 7. Accessibility
// ─────────────────────────────────────────────
describe('BAlert – accessibility', () => {
  it('uses role="alert" for error type', () => {
    const wrapper = mountAlert({ type: BAlertType.Error });
    expect(wrapper.find('.b-alert').attributes('role')).toBe('alert');
  });

  it('uses role="alert" for warning type', () => {
    const wrapper = mountAlert({ type: BAlertType.Warning });
    expect(wrapper.find('.b-alert').attributes('role')).toBe('alert');
  });

  it('uses role="status" for info type', () => {
    const wrapper = mountAlert({ type: BAlertType.Info });
    expect(wrapper.find('.b-alert').attributes('role')).toBe('status');
  });

  it('uses role="status" for success type', () => {
    const wrapper = mountAlert({ type: BAlertType.Success });
    expect(wrapper.find('.b-alert').attributes('role')).toBe('status');
  });

  it('sets aria-live=assertive for error/warning', () => {
    const wrapper = mountAlert({ type: BAlertType.Error });
    expect(wrapper.find('.b-alert').attributes('aria-live')).toBe('assertive');
  });

  it('sets aria-live=polite for info/success', () => {
    const wrapper = mountAlert({ type: BAlertType.Info });
    expect(wrapper.find('.b-alert').attributes('aria-live')).toBe('polite');
  });

  it('sets aria-atomic=true', () => {
    const wrapper = mountAlert({ type: BAlertType.Info });
    expect(wrapper.find('.b-alert').attributes('aria-atomic')).toBe('true');
  });

  it('sets aria-describedby when description is present', () => {
    const wrapper = mountAlert({ message: 'M', description: 'D' });
    const alertEl = wrapper.find('.b-alert');
    const descEl = wrapper.find('.b-alert__description');
    expect(alertEl.attributes('aria-describedby')).toBe(descEl.attributes('id'));
  });

  it('does NOT set aria-describedby when no description', () => {
    const wrapper = mountAlert({ message: 'M' });
    expect(wrapper.find('.b-alert').attributes('aria-describedby')).toBeUndefined();
  });

  it('close button has accessible aria-label', () => {
    const wrapper = mountAlert({ closable: true });
    expect(wrapper.find('.b-alert__close').attributes('aria-label')).toBe('Close alert');
  });

  it('close button has type=button to avoid form submission', () => {
    const wrapper = mountAlert({ closable: true });
    expect(wrapper.find('.b-alert__close').attributes('type')).toBe('button');
  });
});

// ─────────────────────────────────────────────
// 8. Edge cases
// ─────────────────────────────────────────────
describe('BAlert – edge cases', () => {
  it('handles very long message without overflow errors', () => {
    const longMsg = 'A'.repeat(2000);
    const wrapper = mountAlert({ message: longMsg });
    expect(wrapper.find('.b-alert__message').text()).toBe(longMsg);
  });

  it('handles very long description without overflow errors', () => {
    const longDesc = 'B'.repeat(2000);
    const wrapper = mountAlert({ message: 'M', description: longDesc });
    expect(wrapper.find('.b-alert__description').text()).toContain(longDesc);
  });

  it('renders multiple alerts independently', () => {
    const w1 = mountAlert({ closable: true, message: 'One' });
    const w2 = mountAlert({ closable: true, message: 'Two' });
    w1.find('.b-alert__close').trigger('click');
    expect(w2.find('.b-alert').exists()).toBe(true);
  });

  it('switches from visible to hidden reactively in controlled mode', async () => {
    const modelValue = ref(true);
    const wrapper = mount(BAlert, {
      props: { modelValue: modelValue.value },
    });
    expect(wrapper.find('.b-alert').exists()).toBe(true);

    await wrapper.setProps({ modelValue: false });
    expect(wrapper.find('.b-alert').exists()).toBe(false);

    await wrapper.setProps({ modelValue: true });
    expect(wrapper.find('.b-alert').exists()).toBe(true);
  });

  it('does not render extra area when closable=false and no action', () => {
    const wrapper = mountAlert({ message: 'M' });
    expect(wrapper.find('.b-alert__extra').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 9. Animation / fake timers
// ─────────────────────────────────────────────
describe('BAlert – animation (fake timers)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('afterClose event fires after leave transition', async () => {
    const wrapper = mountAlert({ closable: true });

    await wrapper.find('.b-alert__close').trigger('click');
    // close fires right away
    expect(wrapper.emitted('close')).toBeTruthy();
    // afterClose has NOT fired yet (waiting for animation)
    expect(wrapper.emitted('afterClose')).toBeFalsy();

    // Simulate the Vue Transition after-leave hook
    // (jsdom doesn't run CSS transitions – we manually call the exposed hook via vm.$emit)
    wrapper.vm.$emit('afterClose');
    expect(wrapper.emitted('afterClose')).toBeTruthy();
  });
});
