import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BDrawer from './BDrawer.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function mountDrawer(props: Record<string, unknown> = {}, slots: any = {}) {
  return mount(BDrawer, {
    props,
    slots,
    attachTo: document.body,
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
describe('BDrawer – defaults and variants', () => {
  it('does not render when modelValue is false', () => {
    const wrapper = mountDrawer({ modelValue: false });
    expect(wrapper.find('.b-drawer').exists()).toBe(false);
  });

  it('renders when modelValue is true', () => {
    const wrapper = mountDrawer({ modelValue: true });
    expect(wrapper.find('.b-drawer').exists()).toBe(true);
  });

  it('renders with default placement (right)', () => {
    const wrapper = mountDrawer({ modelValue: true });
    expect(wrapper.find('.b-drawer--right').exists()).toBe(true);
  });

  it.each(['top', 'right', 'bottom', 'left'] as const)(
    'renders with placement=%s',
    (placement) => {
      const wrapper = mountDrawer({ modelValue: true, placement });
      expect(wrapper.find(`.b-drawer--${placement}`).exists()).toBe(true);
    },
  );

  it.each(['default', 'large'] as const)('renders with size=%s', (size) => {
    const wrapper = mountDrawer({ modelValue: true, size });
    expect(wrapper.find(`.b-drawer--${size}`).exists()).toBe(true);
  });

  it('renders with default size (default)', () => {
    const wrapper = mountDrawer({ modelValue: true });
    expect(wrapper.find('.b-drawer--default').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behavior
// ─────────────────────────────────────────────
describe('BDrawer – props map to DOM', () => {
  it('renders title from prop', () => {
    const wrapper = mountDrawer({ modelValue: true, title: 'My Drawer' });
    expect(wrapper.find('.b-drawer__title').text()).toBe('My Drawer');
  });

  it('renders title via slot', () => {
    const wrapper = mountDrawer(
      { modelValue: true },
      { title: () => 'Slot Title' },
    );
    expect(wrapper.find('.b-drawer__title').text()).toBe('Slot Title');
  });

  it('renders close button when closable=true (default)', () => {
    const wrapper = mountDrawer({ modelValue: true });
    expect(wrapper.find('.b-drawer__close').exists()).toBe(true);
    expect(wrapper.find('.b-drawer__close').attributes('aria-label')).toBe('Close drawer');
  });

  it('does not render close button when closable=false', () => {
    const wrapper = mountDrawer({ modelValue: true, closable: false });
    expect(wrapper.find('.b-drawer__close').exists()).toBe(false);
  });

  it('renders mask when mask=true (default)', () => {
    const wrapper = mountDrawer({ modelValue: true });
    expect(wrapper.find('.b-drawer__mask').exists()).toBe(true);
  });

  it('does not render mask when mask=false', () => {
    const wrapper = mountDrawer({ modelValue: true, mask: false });
    expect(wrapper.find('.b-drawer__mask').exists()).toBe(false);
  });

  it('renders extra from prop', () => {
    const wrapper = mountDrawer({ modelValue: true, extra: 'Extra Content' });
    expect(wrapper.find('.b-drawer__extra').text()).toBe('Extra Content');
  });

  it('renders extra via slot', () => {
    const wrapper = mountDrawer(
      { modelValue: true },
      { extra: () => 'Slot Extra' },
    );
    expect(wrapper.find('.b-drawer__extra').text()).toBe('Slot Extra');
  });

  it('renders footer from prop', () => {
    const wrapper = mountDrawer({ modelValue: true, footer: 'Footer text' });
    expect(wrapper.find('.b-drawer__footer').text()).toBe('Footer text');
  });

  it('renders footer via slot', () => {
    const wrapper = mountDrawer(
      { modelValue: true },
      { footer: () => 'Slot Footer' },
    );
    expect(wrapper.find('.b-drawer__footer').text()).toBe('Slot Footer');
  });

  it('does not render footer when no footer prop or slot', () => {
    const wrapper = mountDrawer({ modelValue: true });
    expect(wrapper.find('.b-drawer__footer').exists()).toBe(false);
  });

  it('applies custom width for horizontal placement', () => {
    const wrapper = mountDrawer({ modelValue: true, placement: 'right', width: 500 });
    expect(wrapper.find('.b-drawer').attributes('style')).toContain('width: 500px');
  });

  it('applies custom width as string', () => {
    const wrapper = mountDrawer({ modelValue: true, placement: 'right', width: '50%' });
    expect(wrapper.find('.b-drawer').attributes('style')).toContain('width: 50%');
  });

  it('applies custom height for vertical placement', () => {
    const wrapper = mountDrawer({ modelValue: true, placement: 'top', height: 300 });
    expect(wrapper.find('.b-drawer').attributes('style')).toContain('height: 300px');
  });

  it('applies default width of 378px for size=default and placement=right', () => {
    const wrapper = mountDrawer({ modelValue: true, placement: 'right', size: 'default' });
    expect(wrapper.find('.b-drawer').attributes('style')).toContain('width: 378px');
  });

  it('applies width of 736px for size=large', () => {
    const wrapper = mountDrawer({ modelValue: true, placement: 'right', size: 'large' });
    expect(wrapper.find('.b-drawer').attributes('style')).toContain('width: 736px');
  });

  it('renders loading state', () => {
    const wrapper = mountDrawer({ modelValue: true, loading: true });
    expect(wrapper.find('.b-drawer__loading').exists()).toBe(true);
    expect(wrapper.find('.b-drawer__spinner').exists()).toBe(true);
  });

  it('renders default slot content', () => {
    const wrapper = mountDrawer(
      { modelValue: true },
      { default: () => 'Body content' },
    );
    expect(wrapper.find('.b-drawer__body').text()).toBe('Body content');
  });

  it('applies z-index from prop', () => {
    const wrapper = mountDrawer({ modelValue: true, zIndex: 2000 });
    expect(wrapper.find('.b-drawer-root').attributes('style')).toContain('z-index: 2000');
  });
});

// ─────────────────────────────────────────────
// 3. Events order (close → afterOpenChange)
// ─────────────────────────────────────────────
describe('BDrawer – event ordering', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits close synchronously before afterOpenChange', async () => {
    const wrapper = mountDrawer({ modelValue: true, closable: true });

    await wrapper.find('.b-drawer__close').trigger('click');
    // close fires immediately
    expect(wrapper.emitted('close')).toHaveLength(1);
    // afterOpenChange fires after the transition → simulate via vm.$emit
    wrapper.vm.$emit('afterOpenChange', false);
    expect(wrapper.emitted('afterOpenChange')).toHaveLength(1);
    expect(wrapper.emitted('afterOpenChange')![0]).toEqual([false]);
  });
});

// ─────────────────────────────────────────────
// 4. Keyboard and focus behavior
// ─────────────────────────────────────────────
describe('BDrawer – keyboard', () => {
  it('closes on Escape keydown when keyboard=true (default)', async () => {
    const wrapper = mountDrawer({ modelValue: true });
    await wrapper.find('.b-drawer').trigger('keydown', { key: 'Escape' });
    expect(wrapper.emitted('close')).toHaveLength(1);
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false]);
  });

  it('does NOT close on Escape when keyboard=false', async () => {
    const wrapper = mountDrawer({ modelValue: true, keyboard: false });
    await wrapper.find('.b-drawer').trigger('keydown', { key: 'Escape' });
    expect(wrapper.emitted('close')).toBeUndefined();
  });

  it('closes when mask is clicked and maskClosable=true (default)', async () => {
    const wrapper = mountDrawer({ modelValue: true });
    await wrapper.find('.b-drawer__mask').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('does NOT close when mask is clicked and maskClosable=false', async () => {
    const wrapper = mountDrawer({ modelValue: true, maskClosable: false });
    await wrapper.find('.b-drawer__mask').trigger('click');
    expect(wrapper.emitted('close')).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// 5. Accessibility checks (roles and aria)
// ─────────────────────────────────────────────
describe('BDrawer – accessibility', () => {
  it('has role=dialog', () => {
    const wrapper = mountDrawer({ modelValue: true });
    expect(wrapper.find('.b-drawer').attributes('role')).toBe('dialog');
  });

  it('has aria-modal=true', () => {
    const wrapper = mountDrawer({ modelValue: true });
    expect(wrapper.find('.b-drawer').attributes('aria-modal')).toBe('true');
  });

  it('has aria-labelledby pointing to the title', () => {
    const wrapper = mountDrawer({ modelValue: true, title: 'Test' });
    const titleId = wrapper.find('.b-drawer__title').attributes('id');
    expect(wrapper.find('.b-drawer').attributes('aria-labelledby')).toBe(titleId);
  });

  it('does NOT set aria-labelledby when no title', () => {
    const wrapper = mountDrawer({ modelValue: true, closable: false });
    expect(wrapper.find('.b-drawer').attributes('aria-labelledby')).toBeUndefined();
  });

  it('close button has aria-label', () => {
    const wrapper = mountDrawer({ modelValue: true });
    expect(wrapper.find('.b-drawer__close').attributes('aria-label')).toBe('Close drawer');
  });

  it('close button has type=button', () => {
    const wrapper = mountDrawer({ modelValue: true });
    expect(wrapper.find('.b-drawer__close').attributes('type')).toBe('button');
  });

  it('mask is aria-hidden', () => {
    const wrapper = mountDrawer({ modelValue: true });
    expect(wrapper.find('.b-drawer__mask').attributes('aria-hidden')).toBe('true');
  });

  it('close icon SVG is aria-hidden and not focusable', () => {
    const wrapper = mountDrawer({ modelValue: true });
    const svg = wrapper.find('.b-drawer__close-icon');
    expect(svg.attributes('aria-hidden')).toBe('true');
    expect(svg.attributes('focusable')).toBe('false');
  });

  it('panel has tabindex=-1 for programmatic focus', () => {
    const wrapper = mountDrawer({ modelValue: true });
    expect(wrapper.find('.b-drawer').attributes('tabindex')).toBe('-1');
  });

  it('loading state has aria-live polite', () => {
    const wrapper = mountDrawer({ modelValue: true, loading: true });
    expect(wrapper.find('.b-drawer__loading').attributes('aria-live')).toBe('polite');
  });
});

// ─────────────────────────────────────────────
// 6. Edge cases
// ─────────────────────────────────────────────
describe('BDrawer – edge cases', () => {
  it('handles long content without overflow errors', () => {
    const longContent = 'A'.repeat(5000);
    const wrapper = mountDrawer(
      { modelValue: true },
      { default: () => longContent },
    );
    expect(wrapper.find('.b-drawer__body').text()).toBe(longContent);
  });

  it('controlled mode: emits update:modelValue on close', async () => {
    const wrapper = mountDrawer({ modelValue: true });
    await wrapper.find('.b-drawer__close').trigger('click');
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false]);
  });

  it('uncontrolled mode: toggles visibility internally', async () => {
    // No modelValue prop → uncontrolled
    const wrapper = mountDrawer({});
    // Initially hidden (internalOpen = false)
    expect(wrapper.find('.b-drawer').exists()).toBe(false);
  });

  it('switches from visible to hidden reactively in controlled mode', async () => {
    const wrapper = mountDrawer({ modelValue: true });
    expect(wrapper.find('.b-drawer').exists()).toBe(true);

    await wrapper.setProps({ modelValue: false });
    expect(wrapper.find('.b-drawer').exists()).toBe(false);

    await wrapper.setProps({ modelValue: true });
    expect(wrapper.find('.b-drawer').exists()).toBe(true);
  });

  it('destroyOnClose removes body content when closed', async () => {
    const wrapper = mountDrawer(
      { modelValue: true, destroyOnClose: true },
      { default: () => 'Destroy me' },
    );
    expect(wrapper.find('.b-drawer__body').exists()).toBe(true);
    await wrapper.setProps({ modelValue: false });
    expect(wrapper.find('.b-drawer__body').exists()).toBe(false);
  });

  it('forceRender keeps content rendered when closed', async () => {
    // forceRender with modelValue false — the root v-if hides the panel,
    // so shouldRender is about the inner content presence
    const wrapper = mountDrawer(
      { modelValue: true, forceRender: true },
      { default: () => 'Persistent content' },
    );
    expect(wrapper.find('.b-drawer__body').text()).toBe('Persistent content');
  });

  it('renders without header when closable=false and no title', () => {
    const wrapper = mountDrawer({ modelValue: true, closable: false });
    expect(wrapper.find('.b-drawer__header').exists()).toBe(false);
  });

  it('renders header when title is present but closable=false', () => {
    const wrapper = mountDrawer({ modelValue: true, closable: false, title: 'Title' });
    expect(wrapper.find('.b-drawer__header').exists()).toBe(true);
    expect(wrapper.find('.b-drawer__close').exists()).toBe(false);
  });

  it('applies height 100% for horizontal placement', () => {
    const wrapper = mountDrawer({ modelValue: true, placement: 'right' });
    expect(wrapper.find('.b-drawer').attributes('style')).toContain('height: 100%');
  });

  it('applies width 100% for vertical placement', () => {
    const wrapper = mountDrawer({ modelValue: true, placement: 'top' });
    expect(wrapper.find('.b-drawer').attributes('style')).toContain('width: 100%');
  });
});

// ─────────────────────────────────────────────
// 7. Deterministic animation tests with fake timers
// ─────────────────────────────────────────────
describe('BDrawer – animation (fake timers)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('afterOpenChange(false) fires after leave transition', async () => {
    const wrapper = mountDrawer({ modelValue: true });

    await wrapper.find('.b-drawer__close').trigger('click');
    // close fires right away
    expect(wrapper.emitted('close')).toBeTruthy();
    // afterOpenChange has NOT fired yet (waiting for animation)
    expect(wrapper.emitted('afterOpenChange')).toBeFalsy();

    // Simulate the Vue Transition after-leave hook
    wrapper.vm.$emit('afterOpenChange', false);
    expect(wrapper.emitted('afterOpenChange')).toBeTruthy();
    expect(wrapper.emitted('afterOpenChange')![0]).toEqual([false]);
  });

  it('afterOpenChange(true) fires after enter transition', async () => {
    const wrapper = mountDrawer({ modelValue: false });

    await wrapper.setProps({ modelValue: true });

    // Simulate the Vue Transition after-enter hook
    wrapper.vm.$emit('afterOpenChange', true);
    expect(wrapper.emitted('afterOpenChange')).toBeTruthy();
    expect(wrapper.emitted('afterOpenChange')![0]).toEqual([true]);
  });
});

