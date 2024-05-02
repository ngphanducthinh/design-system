import { BDatePicker } from '@/components';
import { BDatePickerView } from '@/constants/Enums';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

const meta: Meta<typeof BDatePicker> = {
  title: 'Components/DatePickerOld',
  parameters: {
    docs: {
      description: {
        component: `The <code>BDatePicker</code> component is a fully featured date selection component that lets users select a date.`,
      },
    },
  },
  component: BDatePicker,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    view: {
      control: 'select',
      options: Object.values(BDatePickerView) as string[],
    },
  },
  args: {
    inputId: '',
    label: '',
    validationRules: undefined,
    placeholder: '',
    required: false,
    requiredErrorMessage: '',
    disabled: false,
    inputCssClass: '',
    minDate: '',
    maxDate: '',
    showHintToday: false,
    view: 'days',
    hideDetails: false,
    position: 'bottom left',
  },
};

export default meta;
type Story = StoryObj<typeof BDatePicker>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BDatePicker },
    setup() {
      const date = ref(new Date());

      return { args, date };
    },
    template: `
      <BDatePicker v-bind="args" v-model="date" />
    `,
  }),
  args: {},
};
