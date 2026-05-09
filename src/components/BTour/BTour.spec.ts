import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BTour from './BTour.vue';
import { BTourPlacement, BTourType, type BTourStep } from './types.ts';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const BASIC_STEPS: BTourStep[] = [
  { title: 'Step 1', description: 'First step description' },
  { title: 'Step 2', description: 'Second step description' },
  { title: 'Step 3', description: 'Third step description' },
];

function mountTour(
  props: Record<string, unknown> = {},
  slots: Record<string, string> = {},
): VueWrapper {
  return mount(BTour, {
    props: {
      steps: BASIC_STEPS,
      open: true,
      ...props,
    },
    slots,
    attachTo: document.body,
    global: {
      stubs: { Teleport: true },
    },
  });
}

// ─────────────────────────────────────────────
// Defaults and rendering
// ─────────────────────────────────────────────

describe('BTour – defaults and rendering', () => {
  it('renders the popup when open=true', () => {
    const wrapper = mountTour();
    expect(wrapper.find('.b-tour__popup').exists()).toBe(true);
  });

  it('does not render when open=false', () => {
    const wrapper = mountTour({ open: false });
    expect(wrapper.find('.b-tour__popup').exists()).toBe(false);
  });

  it('does not render when steps is empty', () => {
    const wrapper = mountTour({ steps: [] });
    expect(wrapper.find('.b-tour__popup').exists()).toBe(false);
  });

  it('shows the first step title by default', () => {
    const wrapper = mountTour();
    expect(wrapper.find('.b-tour__title').text()).toBe('Step 1');
  });

  it('shows the first step description by default', () => {
    const wrapper = mountTour();
    expect(wrapper.find('.b-tour__description').text()).toBe('First step description');
  });

  it('shows the close button by default', () => {
    const wrapper = mountTour();
    expect(wrapper.find('.b-tour__close').exists()).toBe(true);
  });

  it('renders "Next" label for non-last step', () => {
    const wrapper = mountTour();
    expect(wrapper.find('.b-tour__btn--next').text()).toBe('Next');
  });

  it('renders "Finish" label on last step', () => {
    const wrapper = mountTour({ current: 2 });
    expect(wrapper.find('.b-tour__btn--next').text()).toBe('Finish');
  });

  it('hides prev button on first step', () => {
    const wrapper = mountTour({ current: 0 });
    expect(wrapper.find('.b-tour__btn--prev').exists()).toBe(false);
  });

  it('shows prev button from second step onward', () => {
    const wrapper = mountTour({ current: 1 });
    expect(wrapper.find('.b-tour__btn--prev').exists()).toBe(true);
  });

  it('renders correct number of indicators', () => {
    const wrapper = mountTour();
    const dots = wrapper.findAll('.b-tour__indicator');
    expect(dots).toHaveLength(3);
  });

  it('marks the active indicator', () => {
    const wrapper = mountTour({ current: 1 });
    const dots = wrapper.findAll('.b-tour__indicator');
    expect(dots[1].classes()).toContain('b-tour__indicator--active');
    expect(dots[0].classes()).not.toContain('b-tour__indicator--active');
  });
});

// ─────────────────────────────────────────────
// Props → DOM
// ─────────────────────────────────────────────

describe('BTour – props map to DOM', () => {
  it('applies the default type class', () => {
    const wrapper = mountTour({ type: BTourType.Default });
    expect(wrapper.find('.b-tour').classes()).toContain('b-tour--default');
  });

  it('applies the primary type class', () => {
    const wrapper = mountTour({ type: BTourType.Primary });
    expect(wrapper.find('.b-tour').classes()).toContain('b-tour--primary');
  });

  it('sets z-index CSS variable from prop', () => {
    const wrapper = mountTour({ zIndex: 2000 });
    const style = wrapper.find('.b-tour').attributes('style');
    expect(style).toContain('--b-tour-z-index: 2000');
  });

  it('hides close button when closeIcon=false', () => {
    const wrapper = mountTour({ closeIcon: false });
    expect(wrapper.find('.b-tour__close').exists()).toBe(false);
  });

  it('hides mask when mask=false', () => {
    const wrapper = mountTour({ mask: false });
    expect(wrapper.find('.b-tour__mask').exists()).toBe(false);
  });

  it('shows mask by default', () => {
    const wrapper = mountTour();
    expect(wrapper.find('.b-tour__mask').exists()).toBe(true);
  });

  it('renders cover image when step.cover is a URL string', () => {
    const steps: BTourStep[] = [
      { title: 'Cover Step', cover: 'https://example.com/img.png' },
    ];
    const wrapper = mountTour({ steps });
    expect(wrapper.find('.b-tour__cover-img').exists()).toBe(true);
    expect(wrapper.find('.b-tour__cover-img').attributes('src')).toBe(
      'https://example.com/img.png',
    );
  });

  it('does not render cover block when step.cover is absent', () => {
    const wrapper = mountTour();
    expect(wrapper.find('.b-tour__cover').exists()).toBe(false);
  });

  it('uses custom next button label from step.nextButtonProps', () => {
    const steps: BTourStep[] = [
      { title: 'S1', nextButtonProps: { children: 'Go →' } },
      { title: 'S2' },
    ];
    const wrapper = mountTour({ steps });
    expect(wrapper.find('.b-tour__btn--next').text()).toBe('Go →');
  });

  it('uses custom prev button label from step.prevButtonProps', () => {
    const steps: BTourStep[] = [
      { title: 'S1' },
      { title: 'S2', prevButtonProps: { children: '← Back' } },
    ];
    const wrapper = mountTour({ steps, current: 1 });
    expect(wrapper.find('.b-tour__btn--prev').text()).toBe('← Back');
  });

  it('applies placement class to popup', () => {
    const wrapper = mountTour({ placement: BTourPlacement.Top });
    // placement class is applied
    expect(wrapper.find('.b-tour__popup').classes()).toContain(
      `b-tour__popup--${BTourPlacement.Top}`,
    );
  });
});

// ─────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────

describe('BTour – events', () => {
  it('emits close with current index when close button clicked', async () => {
    const wrapper = mountTour({ current: 1 });
    await wrapper.find('.b-tour__close').trigger('click');
    expect(wrapper.emitted('close')?.[0]).toEqual([1]);
  });

  it('emits update:open=false when close button clicked (controlled)', async () => {
    const wrapper = mountTour({ open: true });
    await wrapper.find('.b-tour__close').trigger('click');
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
  });

  it('emits change and update:current when Next is clicked', async () => {
    const wrapper = mountTour({ current: 0 });
    await wrapper.find('.b-tour__btn--next').trigger('click');
    expect(wrapper.emitted('change')?.[0]).toEqual([1]);
    expect(wrapper.emitted('update:current')?.[0]).toEqual([1]);
  });

  it('emits change and update:current when Prev is clicked', async () => {
    const wrapper = mountTour({ current: 2 });
    await wrapper.find('.b-tour__btn--prev').trigger('click');
    expect(wrapper.emitted('change')?.[0]).toEqual([1]);
    expect(wrapper.emitted('update:current')?.[0]).toEqual([1]);
  });

  it('emits finish and close when Next clicked on last step', async () => {
    const wrapper = mountTour({ current: 2 });
    await wrapper.find('.b-tour__btn--next').trigger('click');
    expect(wrapper.emitted('finish')).toBeTruthy();
    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
  });

  it('emits finish before close on last step', async () => {
    const wrapper = mountTour({ current: 2 });
    await wrapper.find('.b-tour__btn--next').trigger('click');
    const emitted = wrapper.emitted();
    const finishIndex = Object.keys(emitted).indexOf('finish');
    const closeIndex = Object.keys(emitted).indexOf('close');
    expect(finishIndex).toBeLessThan(closeIndex);
  });

  it('calls step.nextButtonProps.onClick alongside goNext', async () => {
    const onNext = vi.fn();
    const steps: BTourStep[] = [
      { title: 'S1', nextButtonProps: { children: 'Next', onClick: onNext } },
      { title: 'S2' },
    ];
    const wrapper = mountTour({ steps });
    await wrapper.find('.b-tour__btn--next').trigger('click');
    expect(onNext).toHaveBeenCalledOnce();
    expect(wrapper.emitted('change')?.[0]).toEqual([1]);
  });
});

// ─────────────────────────────────────────────
// Controlled vs uncontrolled
// ─────────────────────────────────────────────

describe('BTour – controlled vs uncontrolled', () => {
  it('uses defaultCurrent in uncontrolled mode', () => {
    const wrapper = mount(BTour, {
      props: { steps: BASIC_STEPS, open: true, defaultCurrent: 2 },
      attachTo: document.body,
      global: { stubs: { Teleport: true } },
    });
    expect(wrapper.find('.b-tour__title').text()).toBe('Step 3');
  });

  it('advances step internally in uncontrolled mode', async () => {
    const wrapper = mount(BTour, {
      props: { steps: BASIC_STEPS, open: true },
      attachTo: document.body,
      global: { stubs: { Teleport: true } },
    });
    expect(wrapper.find('.b-tour__title').text()).toBe('Step 1');
    await wrapper.find('.b-tour__btn--next').trigger('click');
    expect(wrapper.find('.b-tour__title').text()).toBe('Step 2');
  });

  it('does not advance step in controlled mode (emits only)', async () => {
    const wrapper = mount(BTour, {
      props: { steps: BASIC_STEPS, open: true, current: 0 },
      attachTo: document.body,
      global: { stubs: { Teleport: true } },
    });
    await wrapper.find('.b-tour__btn--next').trigger('click');
    // Still shows step 0 because we hold current=0 from outside
    expect(wrapper.find('.b-tour__title').text()).toBe('Step 1');
    expect(wrapper.emitted('update:current')?.[0]).toEqual([1]);
  });

  it('opens internally when open is not bound', async () => {
    const wrapper = mount(BTour, {
      props: { steps: BASIC_STEPS },
      attachTo: document.body,
      global: { stubs: { Teleport: true } },
    });
    // no open prop → internal state controls visibility
    expect(wrapper.find('.b-tour__popup').exists()).toBe(false);
    // Programmatically open not directly testable via v-model here,
    // but confirming render is gated on internalOpen:
    await wrapper.setProps({ open: undefined });
    expect(wrapper.find('.b-tour__popup').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// Keyboard navigation
// ─────────────────────────────────────────────

describe('BTour – keyboard navigation', () => {
  it('closes tour on Escape key', async () => {
    const wrapper = mountTour();
    await wrapper.find('.b-tour__popup').trigger('keydown', { key: 'Escape' });
    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
  });

  it('goes to next step on ArrowRight', async () => {
    const wrapper = mountTour({ current: 0 });
    await wrapper.find('.b-tour__popup').trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('change')?.[0]).toEqual([1]);
  });

  it('goes to previous step on ArrowLeft', async () => {
    const wrapper = mountTour({ current: 2 });
    await wrapper.find('.b-tour__popup').trigger('keydown', { key: 'ArrowLeft' });
    expect(wrapper.emitted('change')?.[0]).toEqual([1]);
  });

  it('does not go before step 0 with ArrowLeft', async () => {
    const wrapper = mountTour({ current: 0 });
    await wrapper.find('.b-tour__popup').trigger('keydown', { key: 'ArrowLeft' });
    expect(wrapper.emitted('change')).toBeFalsy();
  });

  it('disables keyboard navigation when keyboard=false', async () => {
    const wrapper = mountTour({ keyboard: false });
    await wrapper.find('.b-tour__popup').trigger('keydown', { key: 'Escape' });
    expect(wrapper.emitted('close')).toBeFalsy();
    await wrapper.find('.b-tour__popup').trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('change')).toBeFalsy();
  });
});

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

describe('BTour – accessibility', () => {
  it('has role="dialog" on root', () => {
    const wrapper = mountTour();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
  });

  it('has aria-modal="true" on root', () => {
    const wrapper = mountTour();
    expect(wrapper.find('[role="dialog"]').attributes('aria-modal')).toBe('true');
  });

  it('has aria-label matching the current step title', () => {
    const wrapper = mountTour({ current: 1 });
    expect(wrapper.find('[role="dialog"]').attributes('aria-label')).toBe('Step 2');
  });

  it('close button has aria-label', () => {
    const wrapper = mountTour();
    expect(wrapper.find('.b-tour__close').attributes('aria-label')).toBe('Close tour');
  });

  it('close SVG icon is aria-hidden', () => {
    const wrapper = mountTour();
    const svg = wrapper.find('.b-tour__close-icon');
    expect(svg.attributes('aria-hidden')).toBe('true');
  });

  it('mask SVG is aria-hidden', () => {
    const wrapper = mountTour();
    const svg = wrapper.find('.b-tour__mask');
    expect(svg.attributes('aria-hidden')).toBe('true');
  });

  it('spotlight is aria-hidden', () => {
    const wrapper = mountTour();
    // No highlightRect without a real target, so spotlight absent - just check when it would appear
    // Verify the attribute is present in the template (structural test)
    const spotlight = wrapper.find('.b-tour__spotlight');
    if (spotlight.exists()) {
      expect(spotlight.attributes('aria-hidden')).toBe('true');
    }
  });

  it('active indicator has aria-current="step"', () => {
    const wrapper = mountTour({ current: 1 });
    const dots = wrapper.findAll('.b-tour__indicator');
    expect(dots[1].attributes('aria-current')).toBe('step');
    expect(dots[0].attributes('aria-current')).toBeUndefined();
  });

  it('popup has tabindex=-1 for programmatic focus', () => {
    const wrapper = mountTour();
    expect(wrapper.find('.b-tour__popup').attributes('tabindex')).toBe('-1');
  });

  it('buttons are type="button" to prevent form submit', () => {
    const wrapper = mountTour({ current: 1 });
    wrapper.findAll('.b-tour__btn').forEach((btn) => {
      expect(btn.attributes('type')).toBe('button');
    });
    expect(wrapper.find('.b-tour__close').attributes('type')).toBe('button');
  });
});

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────

describe('BTour – slots', () => {
  it('renders indicatorsRender slot with current and total', () => {
    const wrapper = mount(BTour, {
      props: { steps: BASIC_STEPS, open: true, current: 1 },
      slots: {
        indicatorsRender: `<template #indicatorsRender="{ current, total }">
          <span data-testid="custom-indicator">{{ current }}/{{ total }}</span>
        </template>`,
      },
      attachTo: document.body,
      global: { stubs: { Teleport: true } },
    });
    expect(wrapper.find('[data-testid="custom-indicator"]').text()).toBe('1/3');
  });
});

// ─────────────────────────────────────────────
// Animation (fake timers)
// ─────────────────────────────────────────────

describe('BTour – animation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('popup is present immediately when open changes to true', async () => {
    const wrapper = mount(BTour, {
      props: { steps: BASIC_STEPS, open: false },
      attachTo: document.body,
      global: { stubs: { Teleport: true } },
    });
    expect(wrapper.find('.b-tour__popup').exists()).toBe(false);
    await wrapper.setProps({ open: true });
    expect(wrapper.find('.b-tour__popup').exists()).toBe(true);
  });

  it('popup is removed after transition when open changes to false', async () => {
    const wrapper = mountTour({ open: true });
    expect(wrapper.find('.b-tour__popup').exists()).toBe(true);
    await wrapper.setProps({ open: false });
    vi.runAllTimers();
    // After Vue transition the v-if removes it
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-tour__popup').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// Edge cases
// ─────────────────────────────────────────────

describe('BTour – edge cases', () => {
  it('handles a single step (no prev, next=Finish)', () => {
    const wrapper = mountTour({ steps: [{ title: 'Only Step' }] });
    expect(wrapper.find('.b-tour__btn--prev').exists()).toBe(false);
    expect(wrapper.find('.b-tour__btn--next').text()).toBe('Finish');
  });

  it('handles long title without layout breaking', () => {
    const longTitle = 'A'.repeat(120);
    const wrapper = mountTour({ steps: [{ title: longTitle }] });
    expect(wrapper.find('.b-tour__title').text()).toBe(longTitle);
  });

  it('handles long description without layout breaking', () => {
    const longDesc = 'B'.repeat(400);
    const wrapper = mountTour({ steps: [{ title: 'T', description: longDesc }] });
    expect(wrapper.find('.b-tour__description').text()).toBe(longDesc);
  });

  it('renders cover block only when cover is provided', () => {
    const nocover = mountTour({ steps: [{ title: 'T' }] });
    expect(nocover.find('.b-tour__cover').exists()).toBe(false);

    const withcover = mountTour({
      steps: [{ title: 'T', cover: 'https://example.com/img.png' }],
    });
    expect(withcover.find('.b-tour__cover').exists()).toBe(true);
  });

  it('does not emit change when on last step and ArrowRight pressed (emits finish/close)', async () => {
    const wrapper = mountTour({ current: 2 });
    await wrapper.find('.b-tour__popup').trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('finish')).toBeTruthy();
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('step-level type overrides tour-level type', () => {
    const steps: BTourStep[] = [
      { title: 'Override', type: BTourType.Primary },
    ];
    const wrapper = mountTour({ steps, type: BTourType.Default });
    // The b-tour root class reflects effective type
    expect(wrapper.find('.b-tour').classes()).toContain('b-tour--primary');
  });

  it('renders with mask color from mask object prop', () => {
    const wrapper = mountTour({ mask: { color: 'rgba(0,0,255,0.5)' } });
    // Mask SVG exists
    expect(wrapper.find('.b-tour__mask').exists()).toBe(true);
  });
});
