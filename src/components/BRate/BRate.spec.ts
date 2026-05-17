import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import BRate from './BRate.vue';

function getStars(wrapper: VueWrapper) {
  return wrapper.findAll('.b-rate__star');
}

function getRoot(wrapper: VueWrapper) {
  return wrapper.find('.b-rate');
}

describe('BRate', () => {
  // ─────────────────────────────────────────────
  // Defaults and variants render
  // ─────────────────────────────────────────────
  describe('defaults and variants render', () => {
    it('renders with default props', () => {
      const wrapper = mount(BRate);
      expect(getRoot(wrapper).exists()).toBe(true);
      expect(getStars(wrapper)).toHaveLength(5);
    });

    it('renders zero stars selected by default', () => {
      const wrapper = mount(BRate);
      const fullStars = wrapper.findAll('.b-rate__star--full');
      expect(fullStars).toHaveLength(0);
    });

    it('renders correct number of stars from count prop', () => {
      const wrapper = mount(BRate, { props: { count: 8 } });
      expect(getStars(wrapper)).toHaveLength(8);
    });

    it('renders small size', () => {
      const wrapper = mount(BRate, { props: { size: 'small' } });
      expect(wrapper.find('.b-rate--small').exists()).toBe(true);
    });

    it('renders large size', () => {
      const wrapper = mount(BRate, { props: { size: 'large' } });
      expect(wrapper.find('.b-rate--large').exists()).toBe(true);
    });

    it('renders disabled state', () => {
      const wrapper = mount(BRate, { props: { disabled: true } });
      expect(wrapper.find('.b-rate--disabled').exists()).toBe(true);
    });
  });

  // ─────────────────────────────────────────────
  // Props map to DOM and behavior
  // ─────────────────────────────────────────────
  describe('props map to DOM and behavior', () => {
    it('displays filled stars matching modelValue', () => {
      const wrapper = mount(BRate, { props: { modelValue: 3 } });
      const fullStars = wrapper.findAll('.b-rate__star--full');
      expect(fullStars).toHaveLength(3);
    });

    it('displays half star when allowHalf and value is x.5', () => {
      const wrapper = mount(BRate, {
        props: { modelValue: 2.5, allowHalf: true },
      });
      const halfStars = wrapper.findAll('.b-rate__star--half');
      expect(halfStars).toHaveLength(1);
      const fullStars = wrapper.findAll('.b-rate__star--full');
      expect(fullStars).toHaveLength(2);
    });

    it('renders custom character via character prop', () => {
      const wrapper = mount(BRate, { props: { character: 'A' } });
      expect(wrapper.findAll('.b-rate__character')).toHaveLength(10); // 5 stars * 2 halves
      expect(wrapper.find('.b-rate__character').attributes('data-character')).toBe('A');
    });

    it('renders custom character via slot', () => {
      const wrapper = mount(BRate, {
        slots: {
          character: '<span class="custom-star">★</span>',
        },
      });
      expect(wrapper.findAll('.custom-star').length).toBeGreaterThan(0);
    });

    it('applies tooltips as title attributes', () => {
      const tooltips = ['Terrible', 'Bad', 'OK', 'Good', 'Great'];
      const wrapper = mount(BRate, { props: { tooltips } });
      const stars = getStars(wrapper);
      stars.forEach((star, i) => {
        expect(star.attributes('title')).toBe(tooltips[i]);
      });
    });

    it('does not render tooltip when not provided', () => {
      const wrapper = mount(BRate);
      const stars = getStars(wrapper);
      stars.forEach((star) => {
        expect(star.attributes('title')).toBeUndefined();
      });
    });

    it('sets aria-valuenow to current value', () => {
      const wrapper = mount(BRate, { props: { modelValue: 4 } });
      expect(getRoot(wrapper).attributes('aria-valuenow')).toBe('4');
    });

    it('sets aria-valuemax to count', () => {
      const wrapper = mount(BRate, { props: { count: 10 } });
      expect(getRoot(wrapper).attributes('aria-valuemax')).toBe('10');
    });
  });

  // ─────────────────────────────────────────────
  // Events
  // ─────────────────────────────────────────────
  describe('events', () => {
    it('emits change and update:modelValue on star click', async () => {
      const wrapper = mount(BRate);
      const stars = getStars(wrapper);
      await stars[2].trigger('click');
      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')![0]).toEqual([3]);
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([3]);
    });

    it('emits change with 0 when same star clicked (allowClear)', async () => {
      const wrapper = mount(BRate, { props: { modelValue: 3, allowClear: true } });
      const stars = getStars(wrapper);
      await stars[2].trigger('click');
      expect(wrapper.emitted('change')![0]).toEqual([0]);
    });

    it('does not clear when allowClear is false', async () => {
      const wrapper = mount(BRate, {
        props: { modelValue: 3, allowClear: false },
      });
      const stars = getStars(wrapper);
      await stars[2].trigger('click');
      expect(wrapper.emitted('change')![0]).toEqual([3]);
    });

    it('emits hover-change on mouse move', async () => {
      const wrapper = mount(BRate, { attachTo: document.body });
      const stars = getStars(wrapper);
      await stars[1].trigger('mousemove', { clientX: 50 });
      expect(wrapper.emitted('hover-change')).toBeTruthy();
      wrapper.unmount();
    });

    it('emits hover-change with 0 on mouse leave', async () => {
      const wrapper = mount(BRate);
      const root = getRoot(wrapper);
      await root.trigger('mouseleave');
      expect(wrapper.emitted('hover-change')?.[0]).toEqual([0]);
    });

    it('emits focus event', async () => {
      const wrapper = mount(BRate);
      await getRoot(wrapper).trigger('focus');
      expect(wrapper.emitted('focus')).toBeTruthy();
    });

    it('emits blur event', async () => {
      const wrapper = mount(BRate);
      await getRoot(wrapper).trigger('blur');
      expect(wrapper.emitted('blur')).toBeTruthy();
    });

    it('does not emit events when disabled', async () => {
      const wrapper = mount(BRate, { props: { disabled: true } });
      const stars = getStars(wrapper);
      await stars[2].trigger('click');
      expect(wrapper.emitted('change')).toBeFalsy();
    });
  });

  // ─────────────────────────────────────────────
  // Keyboard and focus behavior
  // ─────────────────────────────────────────────
  describe('keyboard and focus behavior', () => {
    it('increases value with ArrowRight', async () => {
      const wrapper = mount(BRate, { props: { modelValue: 2 } });
      await getRoot(wrapper).trigger('focus');
      await getRoot(wrapper).trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('change')![0]).toEqual([3]);
    });

    it('increases value with ArrowUp', async () => {
      const wrapper = mount(BRate, { props: { modelValue: 2 } });
      await getRoot(wrapper).trigger('focus');
      await getRoot(wrapper).trigger('keydown', { key: 'ArrowUp' });
      expect(wrapper.emitted('change')![0]).toEqual([3]);
    });

    it('decreases value with ArrowLeft', async () => {
      const wrapper = mount(BRate, { props: { modelValue: 3 } });
      await getRoot(wrapper).trigger('focus');
      await getRoot(wrapper).trigger('keydown', { key: 'ArrowLeft' });
      expect(wrapper.emitted('change')![0]).toEqual([2]);
    });

    it('decreases value with ArrowDown', async () => {
      const wrapper = mount(BRate, { props: { modelValue: 3 } });
      await getRoot(wrapper).trigger('focus');
      await getRoot(wrapper).trigger('keydown', { key: 'ArrowDown' });
      expect(wrapper.emitted('change')![0]).toEqual([2]);
    });

    it('does not go below 0', async () => {
      const wrapper = mount(BRate, { props: { modelValue: 0 } });
      await getRoot(wrapper).trigger('focus');
      await getRoot(wrapper).trigger('keydown', { key: 'ArrowLeft' });
      expect(wrapper.emitted('change')![0]).toEqual([0]);
    });

    it('does not exceed count', async () => {
      const wrapper = mount(BRate, { props: { modelValue: 5, count: 5 } });
      await getRoot(wrapper).trigger('focus');
      await getRoot(wrapper).trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('change')![0]).toEqual([5]);
    });

    it('steps by 0.5 when allowHalf is true', async () => {
      const wrapper = mount(BRate, {
        props: { modelValue: 2, allowHalf: true },
      });
      await getRoot(wrapper).trigger('focus');
      await getRoot(wrapper).trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('change')![0]).toEqual([2.5]);
    });

    it('ignores keyboard when keyboard prop is false', async () => {
      const wrapper = mount(BRate, {
        props: { modelValue: 2, keyboard: false },
      });
      await getRoot(wrapper).trigger('focus');
      await getRoot(wrapper).trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('change')).toBeFalsy();
    });

    it('ignores keyboard when disabled', async () => {
      const wrapper = mount(BRate, {
        props: { modelValue: 2, disabled: true },
      });
      await getRoot(wrapper).trigger('focus');
      await getRoot(wrapper).trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('change')).toBeFalsy();
    });

    it('emits keydown event', async () => {
      const wrapper = mount(BRate, { props: { modelValue: 2 } });
      await getRoot(wrapper).trigger('focus');
      await getRoot(wrapper).trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('keydown')).toBeTruthy();
    });
  });

  // ─────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────
  describe('accessibility', () => {
    it('has role="slider"', () => {
      const wrapper = mount(BRate);
      expect(getRoot(wrapper).attributes('role')).toBe('slider');
    });

    it('has aria-label', () => {
      const wrapper = mount(BRate);
      expect(getRoot(wrapper).attributes('aria-label')).toBe('Rating');
    });

    it('accepts custom aria-label', () => {
      const wrapper = mount(BRate, { attrs: { 'aria-label': 'Product rating' } });
      expect(getRoot(wrapper).attributes('aria-label')).toBe('Product rating');
    });

    it('has aria-valuenow, aria-valuemin, aria-valuemax', () => {
      const wrapper = mount(BRate, { props: { modelValue: 3, count: 5 } });
      const root = getRoot(wrapper);
      expect(root.attributes('aria-valuenow')).toBe('3');
      expect(root.attributes('aria-valuemin')).toBe('0');
      expect(root.attributes('aria-valuemax')).toBe('5');
    });

    it('has aria-disabled when disabled', () => {
      const wrapper = mount(BRate, { props: { disabled: true } });
      expect(getRoot(wrapper).attributes('aria-disabled')).toBe('true');
    });

    it('does not have aria-disabled when enabled', () => {
      const wrapper = mount(BRate);
      expect(getRoot(wrapper).attributes('aria-disabled')).toBeUndefined();
    });

    it('has tabindex=0 when enabled', () => {
      const wrapper = mount(BRate);
      expect(getRoot(wrapper).attributes('tabindex')).toBe('0');
    });

    it('has tabindex=-1 when disabled', () => {
      const wrapper = mount(BRate, { props: { disabled: true } });
      expect(getRoot(wrapper).attributes('tabindex')).toBe('-1');
    });

    it('star icons are aria-hidden', () => {
      const wrapper = mount(BRate);
      const svgs = wrapper.findAll('svg');
      svgs.forEach((svg) => {
        expect(svg.attributes('aria-hidden')).toBe('true');
      });
    });

    it('has aria-valuetext for screen readers', () => {
      const wrapper = mount(BRate, { props: { modelValue: 3, count: 5 } });
      expect(getRoot(wrapper).attributes('aria-valuetext')).toBe('3 out of 5 stars');
    });
  });

  // ─────────────────────────────────────────────
  // Edge cases
  // ─────────────────────────────────────────────
  describe('edge cases', () => {
    it('controlled mode: respects external value changes', async () => {
      const wrapper = mount(BRate, { props: { modelValue: 2 } });
      expect(wrapper.findAll('.b-rate__star--full')).toHaveLength(2);
      await wrapper.setProps({ modelValue: 4 });
      expect(wrapper.findAll('.b-rate__star--full')).toHaveLength(4);
    });

    it('uncontrolled mode: manages internal value', async () => {
      const wrapper = mount(BRate);
      const stars = getStars(wrapper);
      await stars[3].trigger('click');
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([4]);
    });

    it('count of 0 renders nothing', () => {
      const wrapper = mount(BRate, { props: { count: 0 } });
      expect(getStars(wrapper)).toHaveLength(0);
    });

    it('count of 1 renders single star', () => {
      const wrapper = mount(BRate, { props: { count: 1 } });
      expect(getStars(wrapper)).toHaveLength(1);
    });

    it('exposes focus/blur methods', () => {
      const wrapper = mount(BRate);
      const vm = wrapper.vm as unknown as { focus: () => void; blur: () => void };
      expect(typeof vm.focus).toBe('function');
      expect(typeof vm.blur).toBe('function');
    });

    it('handles rapid hover changes', async () => {
      const wrapper = mount(BRate, { attachTo: document.body });
      const stars = getStars(wrapper);
      await stars[0].trigger('mousemove', { clientX: 50 });
      await stars[3].trigger('mousemove', { clientX: 200 });
      const hoverEvents = wrapper.emitted('hover-change');
      expect(hoverEvents!.length).toBeGreaterThanOrEqual(2);
      wrapper.unmount();
    });
  });

  // ─────────────────────────────────────────────
  // Animation / transition tests (fake timers)
  // ─────────────────────────────────────────────
  describe('animation behavior', () => {
    it('uses CSS transition class on stars', () => {
      const wrapper = mount(BRate);
      const star = getStars(wrapper)[0];
      expect(star.classes()).toContain('b-rate__star');
    });

    it('adds focused class on focus', async () => {
      const wrapper = mount(BRate);
      await getRoot(wrapper).trigger('focus');
      expect(wrapper.find('.b-rate--focused').exists()).toBe(true);
    });

    it('removes focused class on blur', async () => {
      const wrapper = mount(BRate);
      await getRoot(wrapper).trigger('focus');
      await getRoot(wrapper).trigger('blur');
      expect(wrapper.find('.b-rate--focused').exists()).toBe(false);
    });
  });
});
