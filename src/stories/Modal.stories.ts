import { BButton, BModal, BModalBody, BModalFooter, BModalHeader } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

const meta = {
  title: 'Feedback/Modal',
  component: BModal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BModal</code> component is a versatile modal dialog component that can be used to display content in a layer above the main application.<br><br>' +
          'It includes subcomponents like <code>BModalHeader</code>, <code>BModalBody</code>, and <code>BModalFooter</code> to structure the modal content effectively.<br>' +
          `When requiring users to interact with the application, but without jumping to a new page and interrupting the user's workflow, you can use Modal to create a new floating layer over the current page to get user feedback or display information.`,
      },
    },
  },
} satisfies Meta<typeof BModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * This story demonstrates the default usage of the BModal component.
 */
export const Default: Story = {
  args: {
    modelValue: false,
  },
  render: (args: any) => ({
    components: { BButton, BModal, BModalHeader, BModalBody, BModalFooter },
    setup() {
      const model = ref(args.modelValue);

      const openModal = () => {
        model.value = true;
      };

      const closeModal = () => {
        model.value = false;
      };

      return { args, model, openModal, closeModal };
    },
    template: `
      <BButton @click="openModal">Modal</BButton>

      <BModal v-bind="args" v-model="model" class="b:w-[400px]">
        <BModalHeader title="My modal title"></BModalHeader>
        <BModalBody>
          {{ 'This is a modal body.' }}
        </BModalBody>
        <BModalFooter @cancel="closeModal">
        </BModalFooter>
      </BModal>
    `,
  }),
};
