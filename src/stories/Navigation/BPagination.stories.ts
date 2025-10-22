import { BPagination } from '@/components';
import { BCommonSize } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

const meta = {
  title: 'Navigation/Pagination',
  component: BPagination,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: Object.values(BCommonSize) },
    modelValue: { type: { name: 'number', required: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BPagination</code> component is a flexible and customizable pagination component used for navigating through pages of content.<br>',
      },
    },
  },
} satisfies Meta<typeof BPagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * This story demonstrates the default usage of the BPagination component.
 */
export const Default: Story = {
  args: {
    modelValue: 1,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    total: 500,
    size: BCommonSize.Medium,
  },
  argTypes: {
    // https://storybook.js.org/docs/api/arg-types#defaultvalue
    modelValue: {
      table: { category: 'Two-Way Binding Props' },
    },
    pageSize: {
      table: { defaultValue: { summary: '10' } },
    },
    pageSizeOptions: {
      table: { defaultValue: { summary: '[10, 20, 50, 100]' } },
    },
    size: {
      table: { defaultValue: { summary: BCommonSize.Medium } },
    },
  },
  parameters: {
    docs: {
      source: {
        code: `
          <script setup lang="ts">
            import { ref } from 'vue';

            const page = ref(1);
          </script>

          <template>
            <BPagination v-model="page" :total="500"  />
          </template>
        `,
      },
    },
  },
  render: (args: any) => ({
    components: { BPagination },
    setup() {
      const page = ref(args.modelValue);
      return { args, page };
    },
    template: `
      <BPagination v-bind="args" v-model="page"  />
    `,
  }),
};
