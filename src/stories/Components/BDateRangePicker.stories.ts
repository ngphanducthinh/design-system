import { BDateRangePicker } from '@/components';
import { BDatePickerView } from '@/constants/Enums';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

const meta: Meta<typeof BDateRangePicker> = {
  title: 'Components/DateRangePicker',
  parameters: {
    docs: {
      description: {
        component: `The <code>BDateRangePicker</code> component is a fully featured date selection component that lets users select a range of dates.`,
      },
    },
  },
  component: BDateRangePicker,
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
    view: BDatePickerView.Days,
    hideDetails: false,
    position: 'bottom left',
  },
};

export default meta;
type Story = StoryObj<typeof BDateRangePicker>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BDateRangePicker },
    setup() {
      const currentDate = new Date();
      const fromDate = new Date(
        new Date(currentDate).setDate(currentDate.getDate() - 3),
      );
      const toDate = new Date(currentDate);
      const date = ref([fromDate, toDate]);

      return { args, date };
    },
    template: `
      <BDateRangePicker v-bind="args" v-model="date" />
    `,
  }),
  args: {},
};
