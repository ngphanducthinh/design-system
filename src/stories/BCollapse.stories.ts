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
          border-radius: 0.5rem; 
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)"
        >
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book
        </div>
      </BCollapse>
    `,
  }),
  args: {},
};
