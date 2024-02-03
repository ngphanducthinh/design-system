import { BOtpField } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref, watch } from 'vue';

const meta: Meta<typeof BOtpField> = {
  title: 'Components/OtpField',
  parameters: {
    docs: {
      description: {
        component: `The <code>BOtpField</code> is used for inputting OTP.`,
      },
    },
  },
  component: BOtpField,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  // argTypes: {},
  args: {
    inputId: '',
    numInputs: 6,
    focusIndex: undefined,
    disabled: false,
    inputCssClass: '',
    validationRules: undefined,
    required: false,
    requiredErrorMessage: '',
    hideDetails: false,
  },
};

export default meta;
type Story = StoryObj<typeof BOtpField>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BOtpField },
    setup() {
      const otp = ref('');
      /**
       * Watch
       */
      watch(
        () => args.numInputs,
        (val) => {
          otp.value = otp.value.substring(0, val);
        },
      );

      return { args, otp };
    },
    template: `
      <BOtpField v-bind="args"  v-model="otp" />
    `,
  }),
  args: {
    modelValue: '',
  },
};
