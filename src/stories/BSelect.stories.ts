import { BSelect } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

const meta: Meta<typeof BSelect> = {
  title: 'Components/Select',
  parameters: {
    docs: {
      description: {
        component: `The <code>BSelect</code> is used for collecting user provided information by picking single item from a list of options.`,
      },
    },
  },
  component: BSelect,
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
    allowInput: false,
  },
};

export default meta;
type Story = StoryObj<typeof BSelect>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BSelect },
    setup() {
      const selectedValue = ref(3);
      return { args, selectedValue };
    },
    template: `
      <BSelect v-bind="args" v-model="selectedValue" />
      <span class="ds-text-xs ds-text-gray-500">Selected value: <b>{{ selectedValue }}</b></span>
    `,
  }),
  args: {
    modelValue: 3,
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
