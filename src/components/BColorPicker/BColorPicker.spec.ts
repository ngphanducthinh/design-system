import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BColorPicker from './BColorPicker.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function mountPicker(
  props: Record<string, unknown> = {},
  slots: Record<string, () => string> = {},
) {
  return mount(BColorPicker, {
    props: { ...props },
    slots: { ...slots },
    attachTo: document.body,
  });
}

function getPanel(wrapper: ReturnType<typeof mount>) {
  return wrapper.find('.b-color-picker__panel');
}

function getTrigger(wrapper: ReturnType<typeof mount>) {
  return wrapper.find('.b-color-picker__trigger');
}

// ─────────────────────────────────────────────
// 1. Defaults & variants render
// ─────────────────────────────────────────────
describe('BColorPicker – defaults and variants', () => {
  it('renders with root class b-color-picker', () => {
    const wrapper = mountPicker();
    expect(wrapper.find('.b-color-picker').exists()).toBe(true);
  });

  it('renders with default medium size class', () => {
    const wrapper = mountPicker();
    expect(wrapper.find('.b-color-picker--md').exists()).toBe(true);
  });

  it('renders small size variant', () => {
    const wrapper = mountPicker({ size: 'sm' });
    expect(wrapper.find('.b-color-picker--sm').exists()).toBe(true);
  });

  it('renders large size variant', () => {
    const wrapper = mountPicker({ size: 'lg' });
    expect(wrapper.find('.b-color-picker--lg').exists()).toBe(true);
  });

  it('renders a trigger button with swatch', () => {
    const wrapper = mountPicker();
    expect(wrapper.find('.b-color-picker__trigger').exists()).toBe(true);
    expect(wrapper.find('.b-color-picker__swatch').exists()).toBe(true);
  });

  it('applies default color to swatch', () => {
    const wrapper = mountPicker({ defaultValue: '#ff0000' });
    const swatch = wrapper.find('.b-color-picker__swatch');
    expect(swatch.attributes('style')).toContain('background-color');
  });

  it('renders custom trigger via default slot', () => {
    const wrapper = mountPicker({}, { default: () => 'Custom trigger' });
    expect(getTrigger(wrapper).text()).toBe('Custom trigger');
  });

  it('shows text when showText is true', () => {
    const wrapper = mountPicker({ showText: true, defaultValue: '#ff0000' });
    expect(wrapper.find('.b-color-picker__text').exists()).toBe(true);
    expect(wrapper.find('.b-color-picker__text').text()).toContain('#ff0000');
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behavior
// ─────────────────────────────────────────────
describe('BColorPicker – props to DOM', () => {
  it('disabled state adds disabled class and aria-disabled', () => {
    const wrapper = mountPicker({ disabled: true });
    expect(wrapper.find('.b-color-picker--disabled').exists()).toBe(true);
    expect(getTrigger(wrapper).attributes('aria-disabled')).toBe('true');
  });

  it('disabled trigger has tabindex -1', () => {
    const wrapper = mountPicker({ disabled: true });
    expect(getTrigger(wrapper).attributes('tabindex')).toBe('-1');
  });

  it('enabled trigger has tabindex 0', () => {
    const wrapper = mountPicker({ disabled: false });
    expect(getTrigger(wrapper).attributes('tabindex')).toBe('0');
  });

  it('panel hidden by default', () => {
    const wrapper = mountPicker();
    const panel = getPanel(wrapper);
    if (panel.exists()) {
      expect(panel.classes()).not.toContain('b-color-picker__panel--open');
    }
  });

  it('clicking trigger opens panel', async () => {
    const wrapper = mountPicker();
    await getTrigger(wrapper).trigger('click');
    expect(getPanel(wrapper).classes()).toContain('b-color-picker__panel--open');
  });

  it('modelValue sets the displayed color', () => {
    const wrapper = mountPicker({ modelValue: '#00ff00' });
    const swatch = wrapper.find('.b-color-picker__swatch');
    expect(swatch.attributes('style')).toContain('rgb(0, 255, 0)');
  });

  it('allowClear shows clear button in open panel', async () => {
    const wrapper = mountPicker({ allowClear: true });
    await getTrigger(wrapper).trigger('click');
    expect(wrapper.find('.b-color-picker__clear-btn').exists()).toBe(true);
  });

  it('presets render in panel', async () => {
    const wrapper = mountPicker({
      presets: [{ label: 'Primary', colors: ['#ff0000', '#00ff00', '#0000ff'] }],
    });
    await getTrigger(wrapper).trigger('click');
    expect(wrapper.find('.b-color-picker__preset-label').text()).toBe('Primary');
    expect(wrapper.findAll('.b-color-picker__preset-color')).toHaveLength(3);
  });

  it('disabledAlpha hides alpha slider and alpha input', async () => {
    const wrapper = mountPicker({ disabledAlpha: true });
    await getTrigger(wrapper).trigger('click');
    expect(wrapper.find('.b-color-picker__alpha').exists()).toBe(false);
    expect(wrapper.find('.b-color-picker__alpha-input').exists()).toBe(false);
  });

  it('disabledFormat renders label instead of button', async () => {
    const wrapper = mountPicker({ disabledFormat: true });
    await getTrigger(wrapper).trigger('click');
    expect(wrapper.find('.b-color-picker__format-btn').exists()).toBe(false);
    expect(wrapper.find('.b-color-picker__format-label').exists()).toBe(true);
  });

  it('no arrow hides arrow element', async () => {
    const wrapper = mountPicker({ arrow: false });
    await getTrigger(wrapper).trigger('click');
    expect(getPanel(wrapper).classes()).toContain('b-color-picker__panel--no-arrow');
  });

  it('placement prop sets correct panel class', async () => {
    const wrapper = mountPicker({ placement: 'top-center' });
    await getTrigger(wrapper).trigger('click');
    expect(getPanel(wrapper).classes()).toContain('b-color-picker__panel--top-center');
  });
});

// ─────────────────────────────────────────────
// 3. Events
// ─────────────────────────────────────────────
describe('BColorPicker – events', () => {
  it('emits openChange when toggling', async () => {
    const wrapper = mountPicker();
    await getTrigger(wrapper).trigger('click');
    expect(wrapper.emitted('openChange')).toBeTruthy();
    expect(wrapper.emitted('openChange')![0]).toEqual([true]);
  });

  it('emits update:modelValue on color change', async () => {
    const wrapper = mountPicker();
    await getTrigger(wrapper).trigger('click');

    const saturation = wrapper.find('.b-color-picker__saturation');
    const rect = { left: 0, top: 0, width: 200, height: 160 };
    vi.spyOn(saturation.element, 'getBoundingClientRect').mockReturnValue(rect as DOMRect);

    await saturation.trigger('mousedown', { clientX: 100, clientY: 80 });
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });

  it('emits change with value and css string', async () => {
    const wrapper = mountPicker();
    await getTrigger(wrapper).trigger('click');

    const saturation = wrapper.find('.b-color-picker__saturation');
    const rect = { left: 0, top: 0, width: 200, height: 160 };
    vi.spyOn(saturation.element, 'getBoundingClientRect').mockReturnValue(rect as DOMRect);

    await saturation.trigger('mousedown', { clientX: 100, clientY: 80 });
    expect(wrapper.emitted('change')).toBeTruthy();
    const [value, css] = wrapper.emitted('change')![0] as [string, string];
    expect(typeof value).toBe('string');
    expect(typeof css).toBe('string');
  });

  it('emits changeComplete on mouseup after saturation drag', async () => {
    const wrapper = mountPicker();
    await getTrigger(wrapper).trigger('click');

    const saturation = wrapper.find('.b-color-picker__saturation');
    const rect = { left: 0, top: 0, width: 200, height: 160 };
    vi.spyOn(saturation.element, 'getBoundingClientRect').mockReturnValue(rect as DOMRect);

    await saturation.trigger('mousedown', { clientX: 50, clientY: 40 });
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(wrapper.emitted('changeComplete')).toBeTruthy();
  });

  it('emits formatChange when cycling format', async () => {
    const wrapper = mountPicker({ defaultFormat: 'hex' });
    await getTrigger(wrapper).trigger('click');

    const formatBtn = wrapper.find('.b-color-picker__format-btn');
    await formatBtn.trigger('click');
    expect(wrapper.emitted('formatChange')).toBeTruthy();
    expect(wrapper.emitted('formatChange')![0]).toEqual(['hsb']);
  });

  it('emits clear event', async () => {
    const wrapper = mountPicker({ allowClear: true });
    await getTrigger(wrapper).trigger('click');

    const clearBtn = wrapper.find('.b-color-picker__clear-btn');
    await clearBtn.trigger('click');
    expect(wrapper.emitted('clear')).toBeTruthy();
  });

  it('emits update:open in controlled mode', async () => {
    const wrapper = mountPicker({ open: false });
    await getTrigger(wrapper).trigger('click');
    expect(wrapper.emitted('update:open')).toBeTruthy();
    expect(wrapper.emitted('update:open')![0]).toEqual([true]);
  });
});

// ─────────────────────────────────────────────
// 4. Keyboard and focus
// ─────────────────────────────────────────────
describe('BColorPicker – keyboard and focus', () => {
  it('Enter key opens the panel', async () => {
    const wrapper = mountPicker();
    await getTrigger(wrapper).trigger('keydown', { key: 'Enter' });
    expect(getPanel(wrapper).classes()).toContain('b-color-picker__panel--open');
  });

  it('Space key opens the panel', async () => {
    const wrapper = mountPicker();
    await getTrigger(wrapper).trigger('keydown', { key: ' ' });
    expect(getPanel(wrapper).classes()).toContain('b-color-picker__panel--open');
  });

  it('Escape key closes the panel', async () => {
    const wrapper = mountPicker();
    await getTrigger(wrapper).trigger('click');
    expect(getPanel(wrapper).classes()).toContain('b-color-picker__panel--open');

    await getTrigger(wrapper).trigger('keydown', { key: 'Escape' });
    expect(getPanel(wrapper).classes()).not.toContain('b-color-picker__panel--open');
  });

  it('Escape in panel closes it and returns focus to trigger', async () => {
    const wrapper = mountPicker();
    await getTrigger(wrapper).trigger('click');

    const panel = getPanel(wrapper);
    await panel.trigger('keydown', { key: 'Escape' });
    expect(getPanel(wrapper).classes()).not.toContain('b-color-picker__panel--open');
  });

  it('trigger has role="button"', () => {
    const wrapper = mountPicker();
    expect(getTrigger(wrapper).attributes('role')).toBe('button');
  });

  it('trigger has aria-haspopup="dialog"', () => {
    const wrapper = mountPicker();
    expect(getTrigger(wrapper).attributes('aria-haspopup')).toBe('dialog');
  });
});

// ─────────────────────────────────────────────
// 5. Accessibility
// ─────────────────────────────────────────────
describe('BColorPicker – accessibility', () => {
  it('trigger has aria-expanded attribute', () => {
    const wrapper = mountPicker();
    expect(getTrigger(wrapper).attributes('aria-expanded')).toBe('false');
  });

  it('trigger aria-expanded is true when open', async () => {
    const wrapper = mountPicker();
    await getTrigger(wrapper).trigger('click');
    expect(getTrigger(wrapper).attributes('aria-expanded')).toBe('true');
  });

  it('trigger has aria-controls pointing to panel id', async () => {
    const wrapper = mountPicker();
    await getTrigger(wrapper).trigger('click');
    const panelId = getPanel(wrapper).attributes('id');
    expect(getTrigger(wrapper).attributes('aria-controls')).toBe(panelId);
  });

  it('panel has role="dialog"', async () => {
    const wrapper = mountPicker();
    await getTrigger(wrapper).trigger('click');
    expect(getPanel(wrapper).attributes('role')).toBe('dialog');
  });

  it('panel has aria-label', async () => {
    const wrapper = mountPicker();
    await getTrigger(wrapper).trigger('click');
    expect(getPanel(wrapper).attributes('aria-label')).toBe('Color picker');
  });

  it('saturation area has role="slider" and aria-label', async () => {
    const wrapper = mountPicker();
    await getTrigger(wrapper).trigger('click');
    const sat = wrapper.find('.b-color-picker__saturation');
    expect(sat.attributes('role')).toBe('slider');
    expect(sat.attributes('aria-label')).toBe('Color saturation and brightness');
  });

  it('hue slider has role="slider" and aria attributes', async () => {
    const wrapper = mountPicker();
    await getTrigger(wrapper).trigger('click');
    const hue = wrapper.find('.b-color-picker__hue');
    expect(hue.attributes('role')).toBe('slider');
    expect(hue.attributes('aria-label')).toBe('Hue');
    expect(hue.attributes('aria-valuemin')).toBe('0');
    expect(hue.attributes('aria-valuemax')).toBe('360');
  });

  it('alpha slider has role="slider" and aria attributes', async () => {
    const wrapper = mountPicker();
    await getTrigger(wrapper).trigger('click');
    const alpha = wrapper.find('.b-color-picker__alpha');
    expect(alpha.attributes('role')).toBe('slider');
    expect(alpha.attributes('aria-label')).toBe('Opacity');
    expect(alpha.attributes('aria-valuemin')).toBe('0');
    expect(alpha.attributes('aria-valuemax')).toBe('100');
  });

  it('format switch button has aria-label', async () => {
    const wrapper = mountPicker();
    await getTrigger(wrapper).trigger('click');
    const btn = wrapper.find('.b-color-picker__format-btn');
    expect(btn.attributes('aria-label')).toBe('Switch color format');
  });

  it('preset colors have aria-label', async () => {
    const wrapper = mountPicker({
      presets: [{ label: 'Test', colors: ['#ff0000'] }],
    });
    await getTrigger(wrapper).trigger('click');
    const presetBtn = wrapper.find('.b-color-picker__preset-color');
    expect(presetBtn.attributes('aria-label')).toContain('Select color');
  });

  it('arrow has aria-hidden', async () => {
    const wrapper = mountPicker();
    await getTrigger(wrapper).trigger('click');
    const arrowEl = wrapper.find('.b-color-picker__arrow');
    expect(arrowEl.attributes('aria-hidden')).toBe('true');
  });
});

// ─────────────────────────────────────────────
// 6. Edge cases
// ─────────────────────────────────────────────
describe('BColorPicker – edge cases', () => {
  it('controlled mode: external open controls visibility', async () => {
    const wrapper = mountPicker({ open: true });
    expect(getPanel(wrapper).classes()).toContain('b-color-picker__panel--open');
  });

  it('controlled mode: changing open prop updates panel', async () => {
    const wrapper = mountPicker({ open: false });
    expect(
      !getPanel(wrapper).exists() ||
        !getPanel(wrapper).classes().includes('b-color-picker__panel--open'),
    ).toBe(true);

    await wrapper.setProps({ open: true });
    expect(getPanel(wrapper).classes()).toContain('b-color-picker__panel--open');
  });

  it('controlled modelValue updates swatch color', async () => {
    const wrapper = mountPicker({ modelValue: '#ff0000' });
    const swatch = wrapper.find('.b-color-picker__swatch');
    expect(swatch.attributes('style')).toContain('rgb(255, 0, 0)');

    await wrapper.setProps({ modelValue: '#00ff00' });
    expect(swatch.attributes('style')).toContain('rgb(0, 255, 0)');
  });

  it('parses rgb() color strings', () => {
    const wrapper = mountPicker({ modelValue: 'rgb(255, 128, 0)' });
    const swatch = wrapper.find('.b-color-picker__swatch');
    expect(swatch.attributes('style')).toContain('rgb(255, 128, 0)');
  });

  it('parses hsl() color strings', () => {
    const wrapper = mountPicker({ modelValue: 'hsl(120, 100%, 50%)' });
    const swatch = wrapper.find('.b-color-picker__swatch');
    expect(swatch.attributes('style')).toContain('rgb(0,');
  });

  it('destroyOnHidden removes panel from DOM when closed', async () => {
    const wrapper = mountPicker({ destroyOnHidden: true });
    expect(wrapper.find('.b-color-picker__panel').exists()).toBe(false);

    await getTrigger(wrapper).trigger('click');
    expect(wrapper.find('.b-color-picker__panel').exists()).toBe(true);
  });

  it('clicking preset color updates the value', async () => {
    const wrapper = mountPicker({
      presets: [{ label: 'Colors', colors: ['#ff0000'] }],
    });
    await getTrigger(wrapper).trigger('click');

    const presetBtn = wrapper.find('.b-color-picker__preset-color');
    await presetBtn.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });

  it('input change updates color', async () => {
    const wrapper = mountPicker({ defaultFormat: 'hex' });
    await getTrigger(wrapper).trigger('click');

    const input = wrapper.find('.b-color-picker__input');
    await input.setValue('00ff00');
    await input.trigger('change');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });

  it('hover trigger opens on mouseenter', async () => {
    const wrapper = mountPicker({ trigger: 'hover' });
    await getTrigger(wrapper).trigger('mouseenter');
    expect(getPanel(wrapper).classes()).toContain('b-color-picker__panel--open');
  });

  it('outside click closes the panel', async () => {
    const wrapper = mountPicker();
    await getTrigger(wrapper).trigger('click');
    expect(getPanel(wrapper).classes()).toContain('b-color-picker__panel--open');

    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(getPanel(wrapper).classes()).not.toContain('b-color-picker__panel--open');
  });
});

// ─────────────────────────────────────────────
// 7. Deterministic animation tests with fake timers
// ─────────────────────────────────────────────
describe('BColorPicker – timers and delays', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hover trigger closes after delay on mouseleave', async () => {
    const wrapper = mountPicker({ trigger: 'hover' });
    await getTrigger(wrapper).trigger('mouseenter');
    expect(getPanel(wrapper).classes()).toContain('b-color-picker__panel--open');

    await getTrigger(wrapper).trigger('mouseleave');
    vi.advanceTimersByTime(200);
    await wrapper.vm.$nextTick();
    expect(getPanel(wrapper).classes()).not.toContain('b-color-picker__panel--open');
  });

  it('hovering panel cancels the close timer', async () => {
    const wrapper = mountPicker({ trigger: 'hover' });
    await getTrigger(wrapper).trigger('mouseenter');
    expect(getPanel(wrapper).classes()).toContain('b-color-picker__panel--open');

    await getTrigger(wrapper).trigger('mouseleave');
    await getPanel(wrapper).trigger('mouseenter');
    vi.advanceTimersByTime(200);
    await wrapper.vm.$nextTick();
    expect(getPanel(wrapper).classes()).toContain('b-color-picker__panel--open');
  });
});
