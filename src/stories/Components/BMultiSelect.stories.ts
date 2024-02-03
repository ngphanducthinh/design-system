import { BMultiSelect } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

const meta: Meta<typeof BMultiSelect> = {
  title: 'Components/MultiSelect',
  parameters: {
    docs: {
      description: {
        component: `The <code>BMultiSelect</code> is used for collecting user provided information by picking multiple items from a list of options.`,
      },
    },
  },
  component: BMultiSelect,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  // argTypes: {},
  args: {
    inputId: '',
    label: '',
    disabled: false,
    placeholder: '',
    valueCssClass: '',
    menuCssClass: '',
    validationRules: undefined,
    required: false,
    requiredErrorMessage: '',
    hideDetails: false,
    showSelectedItemCount: false,
    allowInput: false,
  },
};

export default meta;
type Story = StoryObj<typeof BMultiSelect>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BMultiSelect },
    setup() {
      const selectedValues = ref([2, 3, 6]);
      return { args, selectedValues };
    },
    template: `
      <BMultiSelect
        v-bind="args"
        v-model="selectedValues"
      />
      <span class="ds-text-xs ds-text-gray-500">Selected values: <b>{{ selectedValues }}</b></span>
    `,
  }),
  args: {
    modelValue: [2, 5],
    items: [
      { text: 'Item 01', value: 1 },
      { text: 'Item 02', value: 2 },
      { text: 'Item 03', value: 3 },
      { text: 'Item 04', value: 4 },
      { text: 'Item 05', value: 5 },
      { text: 'Item 06', value: 6 },
    ],
  },
};
