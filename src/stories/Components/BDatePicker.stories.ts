import { BDatePicker } from '@/components';
import { BDatePickerView } from '@/constants/Enums';
import type { Meta, StoryObj } from '@storybook/vue3';
import { computed, ref, watch } from 'vue';

const meta: Meta<typeof BDatePicker> = {
  title: 'Components/DatePicker',
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
    minDate: undefined,
    maxDate: undefined,
    range: false,
    hideDetails: false,
    view: 'dates',
  },
};

export default meta;
type Story = StoryObj<typeof BDatePicker>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BDatePicker },
    setup() {
      const CURRENT_DATE = new Date();

      const date = ref<Date | Date[] | undefined>(new Date());
      const startDate = new Date(
        CURRENT_DATE.getFullYear(),
        CURRENT_DATE.getMonth(),
        CURRENT_DATE.getDate() - 4,
      );
      const endDate = new Date(
        CURRENT_DATE.getFullYear(),
        CURRENT_DATE.getMonth(),
        CURRENT_DATE.getDate() + 2,
      );
      const minDateValue = computed(() =>
        args.minDate ? new Date(args.minDate) : undefined,
      );
      const maxDateValue = computed(() =>
        args.maxDate ? new Date(args.maxDate) : undefined,
      );
      console.log('args.range', args.range);
      watch(
        () => args.range,
        (val) => {
          date.value = val ? [startDate, endDate] : new Date();
        },
        { immediate: true },
      );

      return { args, date, minDateValue, maxDateValue };
    },
    template: `
      <BDatePicker v-bind="args" v-model="date" :min-date="minDateValue" :max-date="maxDateValue" />
    `,
  }),
  args: {},
};
