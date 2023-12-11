import { BTextarea, BTextField } from '@/components';
import type { ValidationRule } from '@/composables/Validation';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import FormValidationExample from './FormValidationExample.vue';

const meta: Meta<typeof FormValidationExample> = {
  title: 'FormValidation/Advanced',
  component: FormValidationExample,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  // argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof FormValidationExample>;

export const Default: Story = {
  render: (args: any) => ({
    components: { FormValidationExample, BTextField, BTextarea },
    setup() {
      const formData = ref({
        firstName: '',
        lastName: '',
        email: '',
        age: 18,
        message: '',
      });
      const validateEmailValid: ValidationRule = {
        validateRule: (val: string) =>
          val
            ? /^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/.test(val)
            : true,
        errorMessage: () => 'Email is invalid, please check again',
      };
      const validateAgeMin: ValidationRule = {
        validateRule: (val: number) => (val ? val >= 18 : true),
        errorMessage: () => 'Age must be greater than or equal to 18',
      };
      const validateAgeMax: ValidationRule = {
        validateRule: (val: number) => (val ? val <= 65 : true),
        errorMessage: () => 'Age must be less than or equal to 65',
      };

      return {
        args,
        formData,
        validateEmailValid,
        validateAgeMin,
        validateAgeMax,
      };
    },
    template: `
      <FormValidationExample v-bind="args">
        <div class="ds-flex-1">
          <BTextField v-model="formData.firstName" label="First name" required />
        </div>
        <div class="ds-flex-1">
          <BTextField v-model="formData.lastName" label="Last name" required />
        </div>
        <div class="ds-w-full">
          <BTextField v-model="formData.email" label="Email" required :validation-rules="[validateEmailValid]" />
        </div>
        <div class="ds-w-full">
          <BTextField v-model="formData.age" label="Age" type="number" :validation-rules="[validateAgeMin, validateAgeMax]" />
        </div>
        <div class="ds-w-full">
          <BTextarea v-model="formData.message" label="Message" required required-error-message="Message is required, please fill out this field!" />
        </div>
      </FormValidationExample>
    `,
  }),
  args: {},
};
