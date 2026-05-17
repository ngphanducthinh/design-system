import { mount, type VueWrapper } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import BSlider from './BSlider.vue';

function getHandle(wrapper: VueWrapper, index = 0): HTMLElement {
  return wrapper.findAll('.b-slider__handle')[index].element as HTMLElement;
}

function getRail(wrapper: VueWrapper): HTMLElement {
  return wrapper.find('.b-slider__rail').element as HTMLElement;
}

describe('BSlider', () => {
  describe('defaults and variants', () => {
    it('renders with default props', () => {
      const wrapper = mount(BSlider);
      expect(wrapper.find('.b-slider').exists()).toBe(true);
      expect(wrapper.find('.b-slider__rail').exists()).toBe(true);
      expect(wrapper.find('.b-slider__track').exists()).toBe(true);
      expect(wrapper.find('.b-slider__handle').exists()).toBe(true);
    });

    it('renders in horizontal mode by default', () => {
      const wrapper = mount(BSlider);
      expect(wrapper.find('.b-slider--vertical').exists()).toBe(false);
    });

    it('renders in vertical mode when vertical=true', () => {
      const wrapper = mount(BSlider, { props: { vertical: true } });
      expect(wrapper.find('.b-slider--vertical').exists()).toBe(true);
    });

    it('renders disabled state', () => {
      const wrapper = mount(BSlider, { props: { disabled: true } });
      expect(wrapper.find('.b-slider--disabled').exists()).toBe(true);
      expect(getHandle(wrapper).getAttribute('aria-disabled')).toBe('true');
    });

    it('renders range mode with two handles', () => {
      const wrapper = mount(BSlider, {
        props: { range: true, modelValue: [20, 80] },
      });
      const handles = wrapper.findAll('.b-slider__handle');
      expect(handles.length).toBe(2);
    });

    it('renders single mode with one handle', () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50 } });
      const handles = wrapper.findAll('.b-slider__handle');
      expect(handles.length).toBe(1);
    });

    it('renders marks when provided', () => {
      const wrapper = mount(BSlider, {
        props: { marks: { 0: '0°', 25: '25°', 50: '50°', 100: '100°' } },
      });
      expect(wrapper.find('.b-slider__marks').exists()).toBe(true);
      expect(wrapper.findAll('.b-slider__mark-text').length).toBe(4);
    });

    it('renders dots when dots=true', () => {
      const wrapper = mount(BSlider, {
        props: { dots: true, step: 20, min: 0, max: 100, modelValue: 0 },
      });
      expect(wrapper.findAll('.b-slider__dot').length).toBe(6); // 0, 20, 40, 60, 80, 100
    });
  });

  describe('props mapping to DOM and behavior', () => {
    it('applies reverse class', () => {
      const wrapper = mount(BSlider, { props: { reverse: true } });
      expect(wrapper.find('.b-slider--reverse').exists()).toBe(true);
    });

    it('maps min/max to aria attributes', () => {
      const wrapper = mount(BSlider, { props: { min: 10, max: 200, modelValue: 50 } });
      const handle = getHandle(wrapper);
      expect(handle.getAttribute('aria-valuemin')).toBe('10');
      expect(handle.getAttribute('aria-valuemax')).toBe('200');
      expect(handle.getAttribute('aria-valuenow')).toBe('50');
    });

    it('reflects current value in aria-valuenow', () => {
      const wrapper = mount(BSlider, { props: { modelValue: 42 } });
      expect(getHandle(wrapper).getAttribute('aria-valuenow')).toBe('42');
    });

    it('handles included=false (no track)', () => {
      const wrapper = mount(BSlider, { props: { included: false } });
      expect(wrapper.find('.b-slider__track').exists()).toBe(false);
    });

    it('shows with-marks class when marks are present', () => {
      const wrapper = mount(BSlider, {
        props: { marks: { 50: 'Middle' } },
      });
      expect(wrapper.find('.b-slider--with-marks').exists()).toBe(true);
    });

    it('correctly marks active dots in range mode', () => {
      const wrapper = mount(BSlider, {
        props: { range: true, modelValue: [20, 60], dots: true, step: 20 },
      });
      const dots = wrapper.findAll('.b-slider__dot');
      const activeDots = wrapper.findAll('.b-slider__dot--active');
      expect(activeDots.length).toBeGreaterThan(0);
    });

    it('handles step=null (marks only mode)', () => {
      const wrapper = mount(BSlider, {
        props: { step: null, marks: { 0: '0', 50: '50', 100: '100' }, modelValue: 0 },
      });
      expect(wrapper.find('.b-slider').exists()).toBe(true);
    });
  });

  describe('v-model and controlled/uncontrolled', () => {
    it('supports v-model for single value', async () => {
      const wrapper = mount(BSlider, {
        props: { modelValue: 30, 'onUpdate:modelValue': vi.fn() },
      });
      expect(getHandle(wrapper).getAttribute('aria-valuenow')).toBe('30');
    });

    it('supports v-model for range value', () => {
      const wrapper = mount(BSlider, {
        props: { range: true, modelValue: [20, 80] },
      });
      const handles = wrapper.findAll('.b-slider__handle');
      expect(handles[0].element.getAttribute('aria-valuenow')).toBe('20');
      expect(handles[1].element.getAttribute('aria-valuenow')).toBe('80');
    });

    it('reflects external modelValue changes', async () => {
      const wrapper = mount(BSlider, { props: { modelValue: 10 } });
      expect(getHandle(wrapper).getAttribute('aria-valuenow')).toBe('10');
      await wrapper.setProps({ modelValue: 90 });
      expect(getHandle(wrapper).getAttribute('aria-valuenow')).toBe('90');
    });

    it('works uncontrolled with default value of 0', () => {
      const wrapper = mount(BSlider);
      expect(getHandle(wrapper).getAttribute('aria-valuenow')).toBe('0');
    });
  });

  describe('events', () => {
    it('emits change on keyboard interaction', async () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50, step: 10 } });
      const handle = wrapper.find('.b-slider__handle');
      await handle.trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')![0]).toEqual([60]);
    });

    it('emits changeComplete on keyboard interaction', async () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50, step: 10 } });
      const handle = wrapper.find('.b-slider__handle');
      await handle.trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('changeComplete')).toBeTruthy();
      expect(wrapper.emitted('changeComplete')![0]).toEqual([60]);
    });

    it('emits range values in range mode', async () => {
      const wrapper = mount(BSlider, {
        props: { range: true, modelValue: [30, 70], step: 10 },
      });
      const handles = wrapper.findAll('.b-slider__handle');
      await handles[1].trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('change')![0]).toEqual([[30, 80]]);
    });

    it('does not emit events when disabled', async () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50, disabled: true } });
      const handle = wrapper.find('.b-slider__handle');
      await handle.trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('change')).toBeFalsy();
    });
  });

  describe('keyboard and focus behavior', () => {
    it('increments value with ArrowRight', async () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50, step: 1 } });
      const handle = wrapper.find('.b-slider__handle');
      await handle.trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([51]);
    });

    it('decrements value with ArrowLeft', async () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50, step: 1 } });
      const handle = wrapper.find('.b-slider__handle');
      await handle.trigger('keydown', { key: 'ArrowLeft' });
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([49]);
    });

    it('increments value with ArrowUp', async () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50, step: 5 } });
      const handle = wrapper.find('.b-slider__handle');
      await handle.trigger('keydown', { key: 'ArrowUp' });
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([55]);
    });

    it('decrements value with ArrowDown', async () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50, step: 5 } });
      const handle = wrapper.find('.b-slider__handle');
      await handle.trigger('keydown', { key: 'ArrowDown' });
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([45]);
    });

    it('goes to min with Home key', async () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50, min: 10 } });
      const handle = wrapper.find('.b-slider__handle');
      await handle.trigger('keydown', { key: 'Home' });
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([10]);
    });

    it('goes to max with End key', async () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50, max: 200 } });
      const handle = wrapper.find('.b-slider__handle');
      await handle.trigger('keydown', { key: 'End' });
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([200]);
    });

    it('does not go below min', async () => {
      const wrapper = mount(BSlider, { props: { modelValue: 0, min: 0, step: 1 } });
      const handle = wrapper.find('.b-slider__handle');
      await handle.trigger('keydown', { key: 'ArrowLeft' });
      const emitted = wrapper.emitted('update:modelValue');
      if (emitted) {
        expect(emitted[0]).toEqual([0]);
      }
    });

    it('does not go above max', async () => {
      const wrapper = mount(BSlider, { props: { modelValue: 100, max: 100, step: 1 } });
      const handle = wrapper.find('.b-slider__handle');
      await handle.trigger('keydown', { key: 'ArrowRight' });
      const emitted = wrapper.emitted('update:modelValue');
      if (emitted) {
        expect(emitted[0]).toEqual([100]);
      }
    });

    it('ignores keyboard when keyboard=false', async () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50, keyboard: false } });
      const handle = wrapper.find('.b-slider__handle');
      await handle.trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('handle is focusable with tabindex=0', () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50 } });
      expect(getHandle(wrapper).getAttribute('tabindex')).toBe('0');
    });

    it('handle has tabindex=-1 when disabled', () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50, disabled: true } });
      expect(getHandle(wrapper).getAttribute('tabindex')).toBe('-1');
    });

    it('range mode lower handle cannot exceed upper value', async () => {
      const wrapper = mount(BSlider, {
        props: { range: true, modelValue: [50, 60], step: 20 },
      });
      const handles = wrapper.findAll('.b-slider__handle');
      await handles[0].trigger('keydown', { key: 'ArrowRight' });
      const emitted = wrapper.emitted('update:modelValue')![0][0] as [number, number];
      expect(emitted[0]).toBeLessThanOrEqual(emitted[1]);
    });
  });

  describe('accessibility', () => {
    it('has role=slider on handles', () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50 } });
      expect(getHandle(wrapper).getAttribute('role')).toBe('slider');
    });

    it('has aria-orientation=horizontal by default', () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50 } });
      expect(getHandle(wrapper).getAttribute('aria-orientation')).toBe('horizontal');
    });

    it('has aria-orientation=vertical when vertical', () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50, vertical: true } });
      expect(getHandle(wrapper).getAttribute('aria-orientation')).toBe('vertical');
    });

    it('supports custom aria-label', () => {
      const wrapper = mount(BSlider, {
        props: { modelValue: 50 },
        attrs: { 'aria-label': 'Volume' },
      });
      expect(getHandle(wrapper).getAttribute('aria-label')).toBe('Volume');
    });

    it('range handles have descriptive aria-labels', () => {
      const wrapper = mount(BSlider, {
        props: { range: true, modelValue: [20, 80] },
      });
      const handles = wrapper.findAll('.b-slider__handle');
      expect(handles[0].element.getAttribute('aria-label')).toContain('Minimum');
      expect(handles[1].element.getAttribute('aria-label')).toBe('Maximum');
    });

    it('range handle lower has max set to upper value', () => {
      const wrapper = mount(BSlider, {
        props: { range: true, modelValue: [20, 80] },
      });
      const lowerHandle = wrapper.findAll('.b-slider__handle')[0].element;
      expect(lowerHandle.getAttribute('aria-valuemax')).toBe('80');
    });

    it('single handle has min from prop', () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50, min: 10 } });
      expect(getHandle(wrapper).getAttribute('aria-valuemin')).toBe('10');
    });

    it('tooltip has role=tooltip', () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50 } });
      const tooltip = wrapper.find('.b-slider__tooltip');
      expect(tooltip.exists()).toBe(true);
      expect(tooltip.element.getAttribute('role')).toBe('tooltip');
    });
  });

  describe('tooltip behavior', () => {
    it('shows tooltip text as current value by default', () => {
      const wrapper = mount(BSlider, { props: { modelValue: 42 } });
      expect(wrapper.find('.b-slider__tooltip').text()).toBe('42');
    });

    it('applies custom formatter', () => {
      const formatter = (v: number) => `${v}%`;
      const wrapper = mount(BSlider, {
        props: { modelValue: 75, tooltip: { formatter } },
      });
      expect(wrapper.find('.b-slider__tooltip').text()).toBe('75%');
    });

    it('hides tooltip when formatter is null', () => {
      const wrapper = mount(BSlider, {
        props: { modelValue: 50, tooltip: { formatter: null } },
      });
      expect(wrapper.find('.b-slider__tooltip').exists()).toBe(false);
    });

    it('forces tooltip visible when open=true', () => {
      const wrapper = mount(BSlider, {
        props: { modelValue: 50, tooltip: { open: true } },
      });
      expect(wrapper.find('.b-slider__tooltip--visible').exists()).toBe(true);
    });

    it('forces tooltip hidden when open=false', () => {
      const wrapper = mount(BSlider, {
        props: { modelValue: 50, tooltip: { open: false } },
      });
      expect(wrapper.find('.b-slider__tooltip--visible').exists()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles min === max gracefully', () => {
      const wrapper = mount(BSlider, { props: { min: 50, max: 50, modelValue: 50 } });
      expect(wrapper.find('.b-slider').exists()).toBe(true);
      expect(getHandle(wrapper).getAttribute('aria-valuenow')).toBe('50');
    });

    it('snaps value to step', async () => {
      const wrapper = mount(BSlider, { props: { modelValue: 0, step: 10, max: 100 } });
      const handle = wrapper.find('.b-slider__handle');
      await handle.trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([10]);
    });

    it('handles large step values', async () => {
      const wrapper = mount(BSlider, { props: { modelValue: 0, step: 50, max: 100 } });
      const handle = wrapper.find('.b-slider__handle');
      await handle.trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([50]);
    });

    it('exposes focus method', () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50 } });
      expect(typeof wrapper.vm.focus).toBe('function');
    });

    it('exposes blur method', () => {
      const wrapper = mount(BSlider, { props: { modelValue: 50 } });
      expect(typeof wrapper.vm.blur).toBe('function');
    });

    it('handles mark with style object', () => {
      const wrapper = mount(BSlider, {
        props: {
          marks: { 50: { style: { color: 'red' }, label: 'Center' } },
          modelValue: 50,
        },
      });
      const markText = wrapper.find('.b-slider__mark-text');
      expect(markText.text()).toBe('Center');
    });

    it('defaults value to 0 without modelValue', () => {
      const wrapper = mount(BSlider);
      expect(getHandle(wrapper).getAttribute('aria-valuenow')).toBe('0');
    });
  });
});
