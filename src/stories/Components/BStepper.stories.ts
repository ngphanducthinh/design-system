import { BButton, BStepper } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import type { BStepperHeader } from '@/types';

const meta: Meta<typeof BStepper> = {
  title: 'Components/Stepper',
  parameters: {
    docs: {
      description: {
        component: `The <code>BStepper</code> component displays progress through numbered steps.`,
      },
    },
  },
  component: BStepper,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  // argTypes: {},
  args: {
    headers: [],
    modelValue: 0,
  },
};

export default meta;
type Story = StoryObj<typeof BStepper>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BStepper, BButton },
    setup() {
      const headers: BStepperHeader[] = [
        { text: 'Step 01' },
        { text: 'Step 02' },
        { text: 'Step 03' },
        { text: 'Step 04' },
      ];
      const step = ref(0);

      const previous = () => {
        if (step.value === 0) {
          return;
        }
        step.value--;
      };
      const next = () => {
        if (step.value >= headers.length - 1) {
          return;
        }
        step.value++;
      };

      return { args, headers, step, previous, next };
    },
    template: `
      <BStepper
        v-bind="args"
        v-model="step"
        :headers="headers"
      >
        <template #step-header-3="{ text }">
          <i class="fa-solid fa-party-horn ds-pr-1" />
          <span>{{ text }}</span>
        </template>

        <template #step-content-0>
          <div class="ds-mt-4">It is a long established fact that a reader will be distracted by the readable content of
            a page when
            looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of
            letters, as opposed to using 'Content here, content here', making it look like readable English.
          </div>
        </template>
        <template #step-content-1>
          <div class="ds-mt-4">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
            has been the
            industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
            scrambled it to make a type specimen book.
          </div>
        </template>
        <template #step-content-2>
          <div class="ds-mt-4">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a
            piece of classical
            Latin literature from 45 BC, making it over 2000 years old.
          </div>
        </template>
        <template #step-content-3>
          <div class="ds-mt-4">Complete.</div>
        </template>
      </BStepper>
      <div class="ds-flex ds-justify-between ds-mt-4">
        <BButton @click="previous">Previous</BButton>
        <BButton type="primary" @click="next">Next</BButton>
      </div>
    `,
  }),
  args: {},
};
