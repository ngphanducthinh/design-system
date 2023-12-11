import { BRadio } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

const meta: Meta<typeof BRadio> = {
  title: 'Components/Radio',
  component: BRadio,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  // argTypes: {},
  args: {
    inputId: '',
    inputName: '',
    label: '',
    disabled: false,
    labelCssClass: '',
    hideDetails: false,
    validationRules: undefined,
    required: false,
    requiredErrorMessage: '',
  },
};

export default meta;
type Story = StoryObj<typeof BRadio>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BRadio },
    setup() {
      const radio = ref('');
      return { args, radio };
    },
    template: `
      <BRadio
        v-bind="args"
        v-model="radio"
        value="Value 01"
        label="Select 'Value 01'"
      />
      <BRadio
        v-bind="args"
        v-model="radio"
        value="Value 02"
        label="Select 'Value 02'"
      />
      
      <p class="ds-text-xs ds-text-gray-500">
        Selected value: {{ radio }}
      </p>
    `,
  }),
  args: {
    modelValue: '',
  },
};
