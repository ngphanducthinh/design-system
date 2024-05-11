import { BCurrencyField } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { SupportedLocale } from '@/constants/Enums';

const meta: Meta<typeof BCurrencyField> = {
  title: 'Components/CurrencyField',
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BCurrencyField</code> component is used for inputting money.',
      },
    },
  },
  component: BCurrencyField,
  tags: ['autodocs'],
  argTypes: {
    locale: {
      control: 'select',
      options: Object.values(SupportedLocale) as string[],
    },
    prependIcon: {
      control: 'text',
      description: 'Prepend icon',
    },
    appendIcon: {
      control: 'text',
      description: 'Append icon',
    },
  },
  args: {
    inputId: '',
    inputCssClass: '',
    validationRules: undefined,
    label: '',
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
      const amount = ref(1000000);
      return { args, amount };
    },
    template: `
      <BCurrencyField v-bind="args" v-model="amount">
        <template v-if="args.prependIcon" #prependIcon><span v-html="args.prependIcon" /></template>
        <template v-if="args.appendIcon" #appendIcon><span v-html="args.appendIcon" /></template>
      </BCurrencyField>
      <div style="font-size: 0.75rem; color: gray; margin-top: 1rem">
        <b>FontAwesome v6.1.0 - Solid</b> has been imported already & can be used for demo.
      </div>
    `,
  }),
  args: {
    prependIcon: '<i class="fa-solid fa-money-bills" />',
    appendIcon: '',
    locale: SupportedLocale['en-US'],
  },
};
