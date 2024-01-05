import { BButton, BCollapse } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

const meta: Meta<typeof BCollapse> = {
  title: 'Components/Collapse',
  component: BCollapse,
  tags: ['autodocs'],
  // argTypes: {},
  args: {
    modelValue: true,
  },
};

export default meta;
type Story = StoryObj<typeof BCollapse>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BButton, BCollapse },
    setup() {
      const expansion = ref(false);
      return { args, expansion };
    },
    template: `
      <BButton v-bind="args" @click="expansion = !expansion">{{ expansion ? 'Collapse' : 'Expand' }}</BButton>
      <BCollapse v-bind="args" v-model="expansion">
        <div style="
          margin-top: 1rem;
          padding: 1rem;
          border: 1px solid gray;
          border-radius: 1rem;
        "
        >
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis dolores exercitationem in ipsum mollitia
          officiis quos unde. Beatae earum, iure libero non nulla omnis quasi quia, ratione reprehenderit totam vel?
        </div>
      </BCollapse>
    `,
  }),
  args: {},
};
