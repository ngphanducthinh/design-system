import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';

import BCarousel from './BCarousel.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function mountCarousel(
  props: Record<string, unknown> = {},
  slotsConfig: Record<string, unknown> = {},
  slideCount = 3,
) {
  const defaultSlots = Array.from(
    { length: slideCount },
    (_, i) => `<div class="slide-${i}">Slide ${i + 1}</div>`,
  ).join('');
  return mount(BCarousel, {
    props,
    slots: { default: defaultSlots, ...slotsConfig },
    attachTo: document.body,
  });
}

function unmountSafe(wrapper: VueWrapper) {
  try {
    wrapper.unmount();
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────
// 1. Defaults & variants
// ─────────────────────────────────────────────
describe('BCarousel - defaults and variants', () => {
  it('renders root .b-carousel element', () => {
    const wrapper = mountCarousel();
    expect(wrapper.find('.b-carousel').exists()).toBe(true);
    unmountSafe(wrapper);
  });

  it('uses scrollx effect by default', () => {
    const wrapper = mountCarousel();
    expect(wrapper.find('.b-carousel--effect-scrollx').exists()).toBe(true);
    unmountSafe(wrapper);
  });

  it('renders one .b-carousel__slide per child', () => {
    const wrapper = mountCarousel({}, {}, 4);
    expect(wrapper.findAll('.b-carousel__slide')).toHaveLength(4);
    unmountSafe(wrapper);
  });

  it('renders dots by default', () => {
    const wrapper = mountCarousel();
    expect(wrapper.find('.b-carousel__dots').exists()).toBe(true);
    expect(wrapper.findAll('.b-carousel__dot')).toHaveLength(3);
    unmountSafe(wrapper);
  });

  it('hides dots when dots=false', () => {
    const wrapper = mountCarousel({ dots: false });
    expect(wrapper.find('.b-carousel__dots').exists()).toBe(false);
    unmountSafe(wrapper);
  });

  it('hides arrows by default', () => {
    const wrapper = mountCarousel();
    expect(wrapper.find('.b-carousel__arrow').exists()).toBe(false);
    unmountSafe(wrapper);
  });

  it('shows arrows when arrows=true', () => {
    const wrapper = mountCarousel({ arrows: true });
    expect(wrapper.find('.b-carousel__arrow--prev').exists()).toBe(true);
    expect(wrapper.find('.b-carousel__arrow--next').exists()).toBe(true);
    unmountSafe(wrapper);
  });

  it('switches to fade effect via fade prop', () => {
    const wrapper = mountCarousel({ fade: true });
    expect(wrapper.find('.b-carousel--effect-fade').exists()).toBe(true);
    unmountSafe(wrapper);
  });

  it('switches to fade effect via effect="fade"', () => {
    const wrapper = mountCarousel({ effect: 'fade' });
    expect(wrapper.find('.b-carousel--effect-fade').exists()).toBe(true);
    unmountSafe(wrapper);
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM
// ─────────────────────────────────────────────
describe('BCarousel - props map to DOM and behavior', () => {
  it('first slide is active by default', () => {
    const wrapper = mountCarousel();
    const slides = wrapper.findAll('.b-carousel__slide');
    expect(slides[0].classes()).toContain('b-carousel__slide--active');
    expect(slides[1].classes()).not.toContain('b-carousel__slide--active');
    unmountSafe(wrapper);
  });

  it('respects defaultActiveIndex when uncontrolled', () => {
    const wrapper = mountCarousel({ defaultActiveIndex: 2 }, {}, 3);
    const slides = wrapper.findAll('.b-carousel__slide');
    expect(slides[2].classes()).toContain('b-carousel__slide--active');
    unmountSafe(wrapper);
  });

  it('dotPlacement maps to root modifier class', () => {
    const wrapper = mountCarousel({ dotPlacement: 'top' });
    expect(wrapper.find('.b-carousel--dots-top').exists()).toBe(true);
    unmountSafe(wrapper);
  });

  it('applies dotsClassName to dots list', () => {
    const wrapper = mountCarousel({ dotsClassName: 'my-dots' });
    expect(wrapper.find('.b-carousel__dots').classes()).toContain('my-dots');
    unmountSafe(wrapper);
  });

  it('exposes speed via inline CSS variable', () => {
    const wrapper = mountCarousel({ speed: 800 });
    const root = wrapper.find('.b-carousel').element as HTMLElement;
    expect(root.style.getPropertyValue('--b-carousel-speed')).toBe('800ms');
    unmountSafe(wrapper);
  });

  it('exposes easing via inline CSS variable', () => {
    const wrapper = mountCarousel({ easing: 'ease-in-out' });
    const root = wrapper.find('.b-carousel').element as HTMLElement;
    expect(root.style.getPropertyValue('--b-carousel-easing')).toBe('ease-in-out');
    unmountSafe(wrapper);
  });

  it('clicking a dot navigates to that slide (uncontrolled)', async () => {
    const wrapper = mountCarousel({ infinite: false });
    const dots = wrapper.findAll('.b-carousel__dot');
    await dots[2].trigger('click');
    await nextTick();
    expect(wrapper.findAll('.b-carousel__slide')[2].classes()).toContain(
      'b-carousel__slide--active',
    );
    unmountSafe(wrapper);
  });

  it('next() navigates forward', async () => {
    const wrapper = mountCarousel();
    (wrapper.vm as unknown as { next: () => void }).next();
    await nextTick();
    expect(wrapper.findAll('.b-carousel__slide')[1].classes()).toContain(
      'b-carousel__slide--active',
    );
    unmountSafe(wrapper);
  });

  it('prev() navigates backward', async () => {
    const wrapper = mountCarousel({ defaultActiveIndex: 1 });
    (wrapper.vm as unknown as { prev: () => void }).prev();
    await nextTick();
    expect(wrapper.findAll('.b-carousel__slide')[0].classes()).toContain(
      'b-carousel__slide--active',
    );
    unmountSafe(wrapper);
  });

  it('goTo(idx) navigates to a specific index', async () => {
    const wrapper = mountCarousel({}, {}, 4);
    (wrapper.vm as unknown as { goTo: (i: number) => void }).goTo(3);
    await nextTick();
    expect(wrapper.findAll('.b-carousel__slide')[3].classes()).toContain(
      'b-carousel__slide--active',
    );
    unmountSafe(wrapper);
  });

  it('infinite=true wraps prev from 0 to last', async () => {
    const wrapper = mountCarousel({ infinite: true }, {}, 3);
    (wrapper.vm as unknown as { prev: () => void }).prev();
    await nextTick();
    expect(wrapper.findAll('.b-carousel__slide')[2].classes()).toContain(
      'b-carousel__slide--active',
    );
    unmountSafe(wrapper);
  });

  it('infinite=true wraps next from last to 0', async () => {
    const wrapper = mountCarousel({ infinite: true, defaultActiveIndex: 2 }, {}, 3);
    (wrapper.vm as unknown as { next: () => void }).next();
    await nextTick();
    expect(wrapper.findAll('.b-carousel__slide')[0].classes()).toContain(
      'b-carousel__slide--active',
    );
    unmountSafe(wrapper);
  });

  it('infinite=false stops at the last slide', async () => {
    const wrapper = mountCarousel({ infinite: false, defaultActiveIndex: 2 }, {}, 3);
    (wrapper.vm as unknown as { next: () => void }).next();
    await nextTick();
    expect(wrapper.findAll('.b-carousel__slide')[2].classes()).toContain(
      'b-carousel__slide--active',
    );
    unmountSafe(wrapper);
  });

  it('infinite=false disables prev arrow at index 0', () => {
    const wrapper = mountCarousel({ arrows: true, infinite: false });
    const prev = wrapper.find('.b-carousel__arrow--prev');
    expect(prev.attributes('disabled')).toBeDefined();
    unmountSafe(wrapper);
  });

  it('infinite=false disables next arrow at last index', () => {
    const wrapper = mountCarousel(
      { arrows: true, infinite: false, defaultActiveIndex: 2 },
      {},
      3,
    );
    const nextBtn = wrapper.find('.b-carousel__arrow--next');
    expect(nextBtn.attributes('disabled')).toBeDefined();
    unmountSafe(wrapper);
  });

  it('arrow click triggers navigation', async () => {
    const wrapper = mountCarousel({ arrows: true });
    await wrapper.find('.b-carousel__arrow--next').trigger('click');
    await nextTick();
    expect(wrapper.findAll('.b-carousel__slide')[1].classes()).toContain(
      'b-carousel__slide--active',
    );
    unmountSafe(wrapper);
  });

  it('does not render arrows when there is only one slide', () => {
    const wrapper = mountCarousel({ arrows: true }, {}, 1);
    expect(wrapper.find('.b-carousel__arrow').exists()).toBe(false);
    unmountSafe(wrapper);
  });

  it('does not render dots when there is only one slide', () => {
    const wrapper = mountCarousel({}, {}, 1);
    expect(wrapper.find('.b-carousel__dots').exists()).toBe(false);
    unmountSafe(wrapper);
  });
});

// ─────────────────────────────────────────────
// 3. Events order
// ─────────────────────────────────────────────
describe('BCarousel - events', () => {
  it('emits beforeChange before update:modelValue and afterChange last', async () => {
    const wrapper = mountCarousel();
    (wrapper.vm as unknown as { next: () => void }).next();
    await nextTick();

    const beforeChange = wrapper.emitted('beforeChange');
    const updateModel = wrapper.emitted('update:modelValue');
    expect(beforeChange).toHaveLength(1);
    expect(beforeChange?.[0]).toEqual([0, 1]);
    expect(updateModel).toEqual([[1]]);
  });

  it('afterChange fires after the transition (using fake timers)', async () => {
    vi.useFakeTimers();
    const wrapper = mountCarousel({ speed: 200 });
    (wrapper.vm as unknown as { next: () => void }).next();
    await nextTick();

    expect(wrapper.emitted('afterChange')).toBeUndefined();
    vi.advanceTimersByTime(200);
    await nextTick();

    expect(wrapper.emitted('afterChange')).toEqual([[1]]);
    expect(wrapper.emitted('change')).toEqual([[1]]);
    vi.useRealTimers();
    unmountSafe(wrapper);
  });

  it('does not emit when target index equals current', async () => {
    const wrapper = mountCarousel();
    (wrapper.vm as unknown as { goTo: (i: number) => void }).goTo(0);
    await nextTick();
    expect(wrapper.emitted('beforeChange')).toBeUndefined();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    unmountSafe(wrapper);
  });
});

// ─────────────────────────────────────────────
// 4. Keyboard
// ─────────────────────────────────────────────
describe('BCarousel - keyboard', () => {
  it('ArrowRight on dots navigates to next slide', async () => {
    const wrapper = mountCarousel();
    await wrapper.find('.b-carousel__dots').trigger('keydown', { key: 'ArrowRight' });
    await nextTick();
    expect(wrapper.findAll('.b-carousel__slide')[1].classes()).toContain(
      'b-carousel__slide--active',
    );
    unmountSafe(wrapper);
  });

  it('ArrowLeft on dots navigates to previous slide', async () => {
    const wrapper = mountCarousel({ defaultActiveIndex: 1 });
    await wrapper.find('.b-carousel__dots').trigger('keydown', { key: 'ArrowLeft' });
    await nextTick();
    expect(wrapper.findAll('.b-carousel__slide')[0].classes()).toContain(
      'b-carousel__slide--active',
    );
    unmountSafe(wrapper);
  });

  it('Home jumps to first slide', async () => {
    const wrapper = mountCarousel({ defaultActiveIndex: 2 });
    await wrapper.find('.b-carousel__dots').trigger('keydown', { key: 'Home' });
    await nextTick();
    expect(wrapper.findAll('.b-carousel__slide')[0].classes()).toContain(
      'b-carousel__slide--active',
    );
    unmountSafe(wrapper);
  });

  it('End jumps to last slide', async () => {
    const wrapper = mountCarousel({}, {}, 4);
    await wrapper.find('.b-carousel__dots').trigger('keydown', { key: 'End' });
    await nextTick();
    expect(wrapper.findAll('.b-carousel__slide')[3].classes()).toContain(
      'b-carousel__slide--active',
    );
    unmountSafe(wrapper);
  });

  it('active dot has tabindex=0, others -1 (roving tabindex)', () => {
    const wrapper = mountCarousel({ defaultActiveIndex: 1 });
    const dots = wrapper.findAll('.b-carousel__dot');
    expect(dots[0].attributes('tabindex')).toBe('-1');
    expect(dots[1].attributes('tabindex')).toBe('0');
    expect(dots[2].attributes('tabindex')).toBe('-1');
    unmountSafe(wrapper);
  });
});

// ─────────────────────────────────────────────
// 5. Accessibility
// ─────────────────────────────────────────────
describe('BCarousel - accessibility', () => {
  it('root has role=region with aria-roledescription="carousel"', () => {
    const wrapper = mountCarousel();
    const root = wrapper.find('.b-carousel');
    expect(root.attributes('role')).toBe('region');
    expect(root.attributes('aria-roledescription')).toBe('carousel');
  });

  it('uses a custom ariaLabel when provided', () => {
    const wrapper = mountCarousel({ ariaLabel: 'Hero banner' });
    expect(wrapper.find('.b-carousel').attributes('aria-label')).toBe('Hero banner');
  });

  it('each slide is a group with aria-roledescription="slide"', () => {
    const wrapper = mountCarousel();
    const slides = wrapper.findAll('.b-carousel__slide');
    slides.forEach((s) => {
      expect(s.attributes('role')).toBe('group');
      expect(s.attributes('aria-roledescription')).toBe('slide');
    });
  });

  it('inactive slides are aria-hidden', () => {
    const wrapper = mountCarousel();
    const slides = wrapper.findAll('.b-carousel__slide');
    expect(slides[0].attributes('aria-hidden')).toBeUndefined();
    expect(slides[1].attributes('aria-hidden')).toBe('true');
    expect(slides[2].attributes('aria-hidden')).toBe('true');
  });

  it('slide aria-label reads "N of total"', () => {
    const wrapper = mountCarousel({}, {}, 3);
    const slides = wrapper.findAll('.b-carousel__slide');
    expect(slides[0].attributes('aria-label')).toBe('1 of 3');
    expect(slides[1].attributes('aria-label')).toBe('2 of 3');
  });

  it('dots list has role=tablist', () => {
    const wrapper = mountCarousel();
    expect(wrapper.find('.b-carousel__dots').attributes('role')).toBe('tablist');
  });

  it('each dot has role=tab and aria-selected matching active state', async () => {
    const wrapper = mountCarousel();
    const dots = wrapper.findAll('.b-carousel__dot');
    expect(dots[0].attributes('role')).toBe('tab');
    expect(dots[0].attributes('aria-selected')).toBe('true');
    expect(dots[1].attributes('aria-selected')).toBe('false');
    await dots[1].trigger('click');
    expect(wrapper.findAll('.b-carousel__dot')[1].attributes('aria-selected')).toBe('true');
  });

  it('arrow icons are aria-hidden and focusable=false', () => {
    const wrapper = mountCarousel({ arrows: true });
    const icon = wrapper.find('.b-carousel__arrow-icon');
    expect(icon.attributes('aria-hidden')).toBe('true');
    expect(icon.attributes('focusable')).toBe('false');
  });

  it('arrow buttons have aria-labels', () => {
    const wrapper = mountCarousel({ arrows: true });
    expect(wrapper.find('.b-carousel__arrow--prev').attributes('aria-label')).toBe(
      'Previous slide',
    );
    expect(wrapper.find('.b-carousel__arrow--next').attributes('aria-label')).toBe(
      'Next slide',
    );
  });

  it('exposes a polite live region announcing the active slide', async () => {
    const wrapper = mountCarousel();
    const live = wrapper.find('.b-carousel__sr-only');
    expect(live.attributes('aria-live')).toBe('polite');
    expect(live.text()).toBe('Slide 1 of 3');
    (wrapper.vm as unknown as { next: () => void }).next();
    await nextTick();
    expect(wrapper.find('.b-carousel__sr-only').text()).toBe('Slide 2 of 3');
  });
});

// ─────────────────────────────────────────────
// 6. Controlled vs uncontrolled
// ─────────────────────────────────────────────
describe('BCarousel - controlled vs uncontrolled', () => {
  it('emits update:modelValue but does not change DOM when controlled', async () => {
    const wrapper = mount(BCarousel, {
      props: { modelValue: 0 },
      slots: {
        default: '<div>A</div><div>B</div><div>C</div>',
      },
    });
    await wrapper.findAll('.b-carousel__dot')[2].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[2]]);
    // active slide unchanged because parent did not update modelValue
    expect(wrapper.findAll('.b-carousel__slide')[0].classes()).toContain(
      'b-carousel__slide--active',
    );
    unmountSafe(wrapper);
  });

  it('updates DOM when parent updates modelValue', async () => {
    const Parent = defineComponent({
      components: { BCarousel },
      setup() {
        const idx = ref(0);
        return { idx };
      },
      template: `
        <BCarousel v-model="idx">
          <div>A</div><div>B</div><div>C</div>
        </BCarousel>
      `,
    });
    const wrapper = mount(Parent);
    await wrapper.findAll('.b-carousel__dot')[2].trigger('click');
    await nextTick();
    expect(wrapper.findAll('.b-carousel__slide')[2].classes()).toContain(
      'b-carousel__slide--active',
    );
    unmountSafe(wrapper);
  });
});

// ─────────────────────────────────────────────
// 7. Slots
// ─────────────────────────────────────────────
describe('BCarousel - slots', () => {
  it('renders custom prevArrow and nextArrow slots', () => {
    const wrapper = mountCarousel(
      { arrows: true },
      {
        prevArrow: () => h('span', { class: 'custom-prev' }, '‹'),
        nextArrow: () => h('span', { class: 'custom-next' }, '›'),
      },
    );
    expect(wrapper.find('.custom-prev').exists()).toBe(true);
    expect(wrapper.find('.custom-next').exists()).toBe(true);
    unmountSafe(wrapper);
  });

  it('renders custom dot slot with index/active scope', () => {
    const wrapper = mountCarousel(
      {},
      {
        dot: ({ index, active }: { index: number; active: boolean }) =>
          h(
            'span',
            { class: 'custom-dot', 'data-active': active },
            String(index + 1),
          ),
      },
    );
    const customDots = wrapper.findAll('.custom-dot');
    expect(customDots).toHaveLength(3);
    expect(customDots[0].attributes('data-active')).toBe('true');
    expect(customDots[1].attributes('data-active')).toBe('false');
    unmountSafe(wrapper);
  });
});

// ─────────────────────────────────────────────
// 8. Edge cases
// ─────────────────────────────────────────────
describe('BCarousel - edge cases', () => {
  it('handles empty slot gracefully', () => {
    const wrapper = mount(BCarousel, { slots: { default: '' } });
    expect(wrapper.find('.b-carousel').exists()).toBe(true);
    expect(wrapper.findAll('.b-carousel__slide')).toHaveLength(0);
    expect(wrapper.find('.b-carousel__dots').exists()).toBe(false);
    unmountSafe(wrapper);
  });

  it('renders very long content without crashing', () => {
    const longText = 'A'.repeat(2000);
    const wrapper = mount(BCarousel, {
      slots: {
        default: `<div>${longText}</div><div>B</div>`,
      },
    });
    expect(wrapper.findAll('.b-carousel__slide')).toHaveLength(2);
    unmountSafe(wrapper);
  });

  it('clamps activeIndex when slides shrink', async () => {
    const Parent = defineComponent({
      components: { BCarousel },
      setup() {
        const items = ref([1, 2, 3, 4]);
        return { items };
      },
      template: `
        <BCarousel ref="car" :defaultActiveIndex="3">
          <div v-for="i in items" :key="i">{{ i }}</div>
        </BCarousel>
      `,
    });
    const wrapper = mount(Parent);
    await nextTick();
    (wrapper.vm as unknown as { items: number[] }).items = [1, 2];
    await nextTick();
    await nextTick();
    await nextTick();
    const slides = wrapper.findAll('.b-carousel__slide');
    // index was 3, new total is 2 → clamped to last (index 1)
    expect(slides).toHaveLength(2);
    expect(slides[1].classes()).toContain('b-carousel__slide--active');
    unmountSafe(wrapper);
  });
});

// ─────────────────────────────────────────────
// 9. waitForAnimate
// ─────────────────────────────────────────────
describe('BCarousel - waitForAnimate', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('ignores nav requests during animation when waitForAnimate=true', async () => {
    const wrapper = mountCarousel({ waitForAnimate: true, speed: 300 });
    (wrapper.vm as unknown as { next: () => void }).next();
    await nextTick();
    // second call during animation - should be ignored
    (wrapper.vm as unknown as { next: () => void }).next();
    await nextTick();
    expect(wrapper.emitted('beforeChange')).toHaveLength(1);

    // After animation completes, next call works
    vi.advanceTimersByTime(300);
    await nextTick();
    (wrapper.vm as unknown as { next: () => void }).next();
    await nextTick();
    expect(wrapper.emitted('beforeChange')).toHaveLength(2);
    unmountSafe(wrapper);
  });
});

// ─────────────────────────────────────────────
// 10. Autoplay (deterministic with fake timers)
// ─────────────────────────────────────────────
describe('BCarousel - autoplay', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('auto-advances every autoplaySpeed ms', async () => {
    const wrapper = mountCarousel({ autoplay: true, autoplaySpeed: 1000, speed: 0 });
    await nextTick();
    expect(wrapper.findAll('.b-carousel__slide')[0].classes()).toContain(
      'b-carousel__slide--active',
    );
    vi.advanceTimersByTime(1000);
    await nextTick();
    expect(wrapper.findAll('.b-carousel__slide')[1].classes()).toContain(
      'b-carousel__slide--active',
    );
    unmountSafe(wrapper);
  });

  it('does not auto-advance when paused on hover', async () => {
    const wrapper = mountCarousel({
      autoplay: true,
      autoplaySpeed: 1000,
      pauseOnHover: true,
      speed: 0,
    });
    await wrapper.find('.b-carousel').trigger('mouseenter');
    vi.advanceTimersByTime(2000);
    await nextTick();
    expect(wrapper.findAll('.b-carousel__slide')[0].classes()).toContain(
      'b-carousel__slide--active',
    );
    unmountSafe(wrapper);
  });

  it('resumes autoplay after pointer leaves', async () => {
    const wrapper = mountCarousel({
      autoplay: true,
      autoplaySpeed: 500,
      pauseOnHover: true,
      speed: 0,
    });
    await wrapper.find('.b-carousel').trigger('mouseenter');
    vi.advanceTimersByTime(500);
    await wrapper.find('.b-carousel').trigger('mouseleave');
    await nextTick();
    vi.advanceTimersByTime(500);
    await nextTick();
    expect(wrapper.findAll('.b-carousel__slide')[1].classes()).toContain(
      'b-carousel__slide--active',
    );
    unmountSafe(wrapper);
  });

  it('autoplay object form { dotDuration: true } applies progress class', () => {
    const wrapper = mountCarousel({ autoplay: { dotDuration: true } });
    const dots = wrapper.findAll('.b-carousel__dot');
    expect(dots[0].classes()).toContain('b-carousel__dot--progress');
    unmountSafe(wrapper);
  });
});

// ─────────────────────────────────────────────
// 11. CSS class hooks
// ─────────────────────────────────────────────
describe('BCarousel - CSS class hooks', () => {
  it('exposes stable class hooks', () => {
    const wrapper = mountCarousel({ arrows: true });
    expect(wrapper.find('.b-carousel').exists()).toBe(true);
    expect(wrapper.find('.b-carousel__viewport').exists()).toBe(true);
    expect(wrapper.find('.b-carousel__track').exists()).toBe(true);
    expect(wrapper.find('.b-carousel__slide').exists()).toBe(true);
    expect(wrapper.find('.b-carousel__arrow--prev').exists()).toBe(true);
    expect(wrapper.find('.b-carousel__arrow--next').exists()).toBe(true);
    expect(wrapper.find('.b-carousel__dots').exists()).toBe(true);
    expect(wrapper.find('.b-carousel__dot').exists()).toBe(true);
    unmountSafe(wrapper);
  });
});
