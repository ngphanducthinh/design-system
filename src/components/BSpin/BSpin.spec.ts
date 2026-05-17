import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BSpinSize } from '@/types.ts';
import BSpin from './BSpin.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function mountSpin(props = {}, slots = {}) {
  return mount(BSpin, {
    props,
    slots,
    global: { stubs: { teleport: true } },
  });
}

// ─────────────────────────────────────────────
// 1. Defaults & variants render
// ─────────────────────────────────────────────
describe('BSpin – defaults and variants', () => {
  it('renders with default props (spinning=true, size=default)', () => {
    const wrapper = mountSpin();

    expect(wrapper.find('.b-spin').exists()).toBe(true);
    expect(wrapper.find('.b-spin--default').exists()).toBe(true);
    expect(wrapper.find('.b-spin--spinning').exists()).toBe(true);
    expect(wrapper.find('.b-spin__dot').exists()).toBe(true);
  });

  it('renders 4 dot items in the default indicator', () => {
    const wrapper = mountSpin();
    expect(wrapper.findAll('.b-spin__dot-item')).toHaveLength(4);
  });

  it.each([BSpinSize.Small, BSpinSize.Default, BSpinSize.Large])(
    'renders size=%s with correct class',
    (size) => {
      const wrapper = mountSpin({ size });
      expect(wrapper.find(`.b-spin--${size}`).exists()).toBe(true);
    },
  );

  it('does not render when spinning=false (standalone)', () => {
    const wrapper = mountSpin({ spinning: false });
    expect(wrapper.find('.b-spin').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behaviour
// ─────────────────────────────────────────────
describe('BSpin – props map to DOM', () => {
  it('renders tip text from prop', () => {
    const wrapper = mountSpin({ tip: 'Loading data...' });
    expect(wrapper.find('.b-spin__tip').exists()).toBe(true);
    expect(wrapper.find('.b-spin__tip').text()).toBe('Loading data...');
  });

  it('does not render tip element when no tip provided', () => {
    const wrapper = mountSpin();
    expect(wrapper.find('.b-spin__tip').exists()).toBe(false);
  });

  it('adds has-tip class when tip is provided', () => {
    const wrapper = mountSpin({ tip: 'Wait...' });
    expect(wrapper.find('.b-spin--has-tip').exists()).toBe(true);
  });

  it('renders as nested when default slot is provided', () => {
    const wrapper = mountSpin({}, { default: () => 'Content' });
    expect(wrapper.find('.b-spin--nested').exists()).toBe(true);
    expect(wrapper.find('.b-spin__content').exists()).toBe(true);
    expect(wrapper.find('.b-spin__overlay-container').exists()).toBe(true);
  });

  it('blurs content when spinning in nested mode', () => {
    const wrapper = mountSpin({ spinning: true }, { default: () => 'Content' });
    expect(wrapper.find('.b-spin__content--blurred').exists()).toBe(true);
  });

  it('does NOT blur content when not spinning in nested mode', () => {
    const wrapper = mountSpin({ spinning: false }, { default: () => 'Content' });
    expect(wrapper.find('.b-spin__content--blurred').exists()).toBe(false);
    expect(wrapper.find('.b-spin__overlay-container').exists()).toBe(false);
  });

  it('renders fullscreen as teleported overlay', () => {
    const wrapper = mountSpin({ fullscreen: true });
    // With stubs, teleport content is still rendered
    expect(wrapper.find('.b-spin--fullscreen').exists()).toBe(true);
  });

  it('does NOT render fullscreen overlay when spinning=false', () => {
    const wrapper = mountSpin({ fullscreen: true, spinning: false });
    expect(wrapper.find('.b-spin--fullscreen').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 3. Slot overrides
// ─────────────────────────────────────────────
describe('BSpin – slot overrides', () => {
  it('renders custom indicator via indicator slot', () => {
    const wrapper = mountSpin({}, { indicator: () => '<div class="custom-spinner">⟳</div>' });
    expect(wrapper.find('.b-spin__dot').exists()).toBe(false);
    expect(wrapper.text()).toContain('⟳');
  });

  it('renders custom tip via tip slot', () => {
    const wrapper = mountSpin({ tip: 'Prop tip' }, { tip: () => 'Slot tip' });
    expect(wrapper.find('.b-spin__tip').text()).toBe('Slot tip');
  });
});

// ─────────────────────────────────────────────
// 4. Delay behaviour (fake timers)
// ─────────────────────────────────────────────
describe('BSpin – delay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not show spinner immediately when delay is set', () => {
    const wrapper = mountSpin({ spinning: true, delay: 500 });
    // Initially should not show
    expect(wrapper.find('.b-spin__dot').exists()).toBe(false);
  });

  it('shows spinner after delay elapses', async () => {
    const wrapper = mountSpin({ spinning: true, delay: 500 });

    vi.advanceTimersByTime(500);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.b-spin').exists()).toBe(true);
    expect(wrapper.find('.b-spin__dot').exists()).toBe(true);
  });

  it('does NOT show spinner if spinning becomes false before delay', async () => {
    const wrapper = mountSpin({ spinning: true, delay: 500 });

    vi.advanceTimersByTime(200);
    await wrapper.setProps({ spinning: false });
    vi.advanceTimersByTime(500);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.b-spin__dot').exists()).toBe(false);
  });

  it('hides immediately when spinning=false (no delay on hide)', async () => {
    const wrapper = mountSpin({ spinning: true, delay: 0 });
    expect(wrapper.find('.b-spin').exists()).toBe(true);

    await wrapper.setProps({ spinning: false });
    expect(wrapper.find('.b-spin').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 5. Accessibility
// ─────────────────────────────────────────────
describe('BSpin – accessibility', () => {
  it('has role="status" on the spin element', () => {
    const wrapper = mountSpin();
    expect(wrapper.find('[role="status"]').exists()).toBe(true);
  });

  it('has aria-label="Loading" when no tip', () => {
    const wrapper = mountSpin();
    expect(wrapper.find('[role="status"]').attributes('aria-label')).toBe('Loading');
  });

  it('uses aria-describedby referencing tip when tip is provided', () => {
    const wrapper = mountSpin({ tip: 'Please wait...' });
    const status = wrapper.find('[role="status"]');
    const tipEl = wrapper.find('.b-spin__tip');
    expect(status.attributes('aria-describedby')).toBe(tipEl.attributes('id'));
  });

  it('does NOT have aria-label when tip is provided (uses aria-describedby instead)', () => {
    const wrapper = mountSpin({ tip: 'Loading...' });
    expect(wrapper.find('[role="status"]').attributes('aria-label')).toBeUndefined();
  });

  it('indicator is aria-hidden', () => {
    const wrapper = mountSpin();
    expect(wrapper.find('.b-spin__indicator').attributes('aria-hidden')).toBe('true');
  });

  it('sets aria-busy on content when spinning in nested mode', () => {
    const wrapper = mountSpin({ spinning: true }, { default: () => 'Content' });
    expect(wrapper.find('.b-spin__content').attributes('aria-busy')).toBe('true');
  });

  it('sets inert on content when spinning in nested mode', () => {
    const wrapper = mountSpin({ spinning: true }, { default: () => 'Content' });
    expect(wrapper.find('.b-spin__content').attributes('inert')).toBe('true');
  });

  it('sets aria-busy=false on content when not spinning in nested mode', () => {
    const wrapper = mountSpin({ spinning: false }, { default: () => 'Content' });
    expect(wrapper.find('.b-spin__content').attributes('aria-busy')).toBe('false');
  });

  it('removes inert on content when not spinning in nested mode', () => {
    const wrapper = mountSpin({ spinning: false }, { default: () => 'Content' });
    expect(wrapper.find('.b-spin__content').attributes('inert')).toBe('false');
  });

  it('has role=status in fullscreen mode', () => {
    const wrapper = mountSpin({ fullscreen: true });
    expect(wrapper.find('[role="status"]').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 6. Nested mode – controlled spinning
// ─────────────────────────────────────────────
describe('BSpin – nested controlled', () => {
  it('toggles overlay on/off when spinning prop changes', async () => {
    const wrapper = mountSpin({ spinning: true }, { default: () => 'Table data' });
    expect(wrapper.find('.b-spin__overlay-container').exists()).toBe(true);

    await wrapper.setProps({ spinning: false });
    expect(wrapper.find('.b-spin__overlay-container').exists()).toBe(false);
    expect(wrapper.find('.b-spin__content--blurred').exists()).toBe(false);

    await wrapper.setProps({ spinning: true });
    expect(wrapper.find('.b-spin__overlay-container').exists()).toBe(true);
    expect(wrapper.find('.b-spin__content--blurred').exists()).toBe(true);
  });

  it('always renders child content regardless of spinning state', async () => {
    const wrapper = mountSpin({ spinning: true }, { default: () => 'Always visible' });
    expect(wrapper.find('.b-spin__content').text()).toBe('Always visible');

    await wrapper.setProps({ spinning: false });
    expect(wrapper.find('.b-spin__content').text()).toBe('Always visible');
  });
});

// ─────────────────────────────────────────────
// 7. Edge cases
// ─────────────────────────────────────────────
describe('BSpin – edge cases', () => {
  it('handles very long tip text', () => {
    const longTip = 'Loading '.repeat(200);
    const wrapper = mountSpin({ tip: longTip });
    expect(wrapper.find('.b-spin__tip').text()).toBe(longTip.trim());
  });

  it('renders multiple independent spin instances', () => {
    const w1 = mountSpin({ size: BSpinSize.Small });
    const w2 = mountSpin({ size: BSpinSize.Large });
    expect(w1.find('.b-spin--small').exists()).toBe(true);
    expect(w2.find('.b-spin--large').exists()).toBe(true);
  });

  it('fullscreen with tip renders correctly', () => {
    const wrapper = mountSpin({ fullscreen: true, tip: 'Loading...' });
    expect(wrapper.find('.b-spin--fullscreen').exists()).toBe(true);
    expect(wrapper.find('.b-spin__tip').text()).toBe('Loading...');
  });

  it('nested with delay toggles correctly', async () => {
    vi.useFakeTimers();
    const wrapper = mountSpin({ spinning: true, delay: 300 }, { default: () => 'Content' });

    // Initially overlay should not show (delay pending)
    expect(wrapper.find('.b-spin__overlay-container').exists()).toBe(false);

    vi.advanceTimersByTime(300);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.b-spin__overlay-container').exists()).toBe(true);
    vi.useRealTimers();
  });

  it('size prop defaults to "default" when not specified', () => {
    const wrapper = mountSpin();
    expect(wrapper.find('.b-spin--default').exists()).toBe(true);
  });
});
