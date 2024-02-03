import { BPagination } from '@/components';
import { BPaginationSize } from '@/constants/Enums';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

const meta: Meta<typeof BPagination> = {
  title: 'Components/Pagination',
  parameters: {
    docs: {
      description: {
        component: `The <code>BPagination</code> component is used to separate long sets of data so that it is easier for a user to consume information.`,
      },
    },
  },
  component: BPagination,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    size: {
      control: 'select',
      options: Object.values(BPaginationSize) as string[],
    },
  },
  args: {
    border: false,
    transparent: false,
    size: BPaginationSize.Medium,
  },
};

export default meta;
type Story = StoryObj<typeof BPagination>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BPagination },
    setup() {
      const page = ref(0);
      return { args, page };
    },
    template: `
      <BPagination v-bind="args" v-model="page" />
    `,
  }),
  args: {
    modelValue: 0,
    numberOfPages: 10,
  },
};
