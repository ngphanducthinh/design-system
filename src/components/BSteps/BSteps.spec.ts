import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick, ref } from 'vue';

import { type BStepItem, BStepsDirection, BStepsStatus, BStepsType } from '@/types.ts';
import BSteps from './BSteps.vue';

const iconStub = {
  template: '<svg data-test="icon" />',
};

describe('BSteps', () => {
  it('renders items with correct computed statuses', () => {
    const items: BStepItem[] = [{ title: 'One' }, { title: 'Two' }, { title: 'Three' }];
    const wrapper = mount(BSteps, {
      props: {
        items,
        modelValue: 1,
      },
      global: {
        stubs: {
          BIcon: iconStub,
        },
      },
    });

    const steps = wrapper.findAll('.b-steps__item');
    expect(steps).toHaveLength(3);
    expect(steps[0].attributes('data-status')).toBe(BStepsStatus.Finish);
    expect(steps[1].attributes('data-status')).toBe(BStepsStatus.Process);
    expect(steps[2].attributes('data-status')).toBe(BStepsStatus.Wait);
  });

  it('respects item status override', () => {
    const items: BStepItem[] = [{ title: 'One', status: BStepsStatus.Error }, { title: 'Two' }];
    const wrapper = mount(BSteps, {
      props: {
        items,
        modelValue: 1,
      },
      global: {
        stubs: {
          BIcon: iconStub,
        },
      },
    });

    const steps = wrapper.findAll('.b-steps__item');
    expect(steps[0].attributes('data-status')).toBe(BStepsStatus.Error);
  });

  it('emits change and update when clicking navigation steps', async () => {
    const items: BStepItem[] = [{ title: 'One' }, { title: 'Two' }];
    const wrapper = mount(BSteps, {
      props: {
        items,
        modelValue: 0,
        type: BStepsType.Navigation,
      },
      global: {
        stubs: {
          BIcon: iconStub,
        },
      },
    });

    const stepButtons = wrapper.findAll('.b-steps__item-inner');
    await stepButtons[1].trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1]);
    expect(wrapper.emitted('change')?.[0]).toEqual([1]);
  });

  it('applies vertical layout class', () => {
    const items: BStepItem[] = [{ title: 'One' }];
    const wrapper = mount(BSteps, {
      props: {
        items,
        direction: BStepsDirection.Vertical,
      },
    });

    expect(wrapper.classes()).toContain('b-steps--vertical');
  });

  it('updates UI when v-model:current changes', async () => {
    const wrapper = mount({
      components: { BSteps },
      setup() {
        const current = ref(0);
        const items: BStepItem[] = [{ title: 'Start' }, { title: 'Middle' }, { title: 'Done' }];
        return { current, items };
      },
      template: `
        <BSteps v-model="current" :items="items" />
      `,
    });

    expect(wrapper.find('[aria-current="step"]').text()).toContain('Start');

    (wrapper.vm as unknown as { current: number }).current = 2;
    await nextTick();

    expect(wrapper.find('[aria-current="step"]').text()).toContain('Done');
  });
});
