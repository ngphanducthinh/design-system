import { BCurrencyField } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

const meta: Meta<typeof BCurrencyField> = {
  title: 'Components/CurrencyField',
  component: BCurrencyField,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  args: {
    inputId: '',
    inputCssClass: '',
    validationRules: undefined,
    label: '',
    prependIcon: '',
    hidePrependIcon: false,
    appendIcon: '',
    hideAppendIcon: false,
    placeholder: '',
    autocomplete: false,
    disabled: false,
    readonly: false,
    required: false,
    requiredErrorMessage: '',
    hideDetails: false,
  },
};

export default meta;
type Story = StoryObj<typeof BCurrencyField>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BCurrencyField },
    setup() {
      const amount = ref(0);
      return { args, amount };
    },
    template: `
      <BCurrencyField v-bind="args"  v-model="amount" />
    `,
  }),
  args: {
    modelValue: '',
  },
};
