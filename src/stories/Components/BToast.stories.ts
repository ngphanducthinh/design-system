import { BButton, BToast, BToastItem } from '@/components';
import { BToastItemType } from '@/constants/Enums';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

const meta: Meta<typeof BToast> = {
  components: { BToastItem },
  title: 'Components/Toast',
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BToast</code> component is used for displaying a quick message to a user.',
      },
    },
  },
  component: BToast,
  tags: ['autodocs'],
  // argTypes: {},
  args: {
    modelValue: [],
  },
};

export default meta;
type Story = StoryObj<typeof BToast>;

const defaultToastItems = [
  { text: 'Success', type: BToastItemType.Success },
  { text: 'Error', type: BToastItemType.Error },
  { text: 'Default', type: BToastItemType.Default },
];
export const Default: Story = {
  render: (args: any) => ({
    components: { BToast, BToastItem, BButton },
    setup() {
      const toastItems = ref(
        structuredClone([
          { text: 'Success', type: BToastItemType.Success },
          { text: 'Error', type: BToastItemType.Error },
          { text: 'Default', type: BToastItemType.Default },
        ]),
      );
      const refresh = () => {
        toastItems.value = structuredClone(defaultToastItems);
      };

      return { args, toastItems, refresh };
    },
    template: `
      <BToast v-bind="args" v-model="toastItems" style="position: relative; top: unset; right: unset;" />
      
      <BToastItem>
        <template #text>
          <span class="ds-font-semibold ds-text-black/80">
            Hello
          </span>
        </template>
        <template #message>
          <span class="ds-text-gray-500">
            Nice to meet you!
          </span>
        </template>
      </BToastItem>
      
      <div class="ds-w-full ds-text-right ds-my-4">
        <BButton :disabled="toastItems.length === 3" type="icon" size="sm" @click="refresh">
          <i class="fa-solid fa-arrows-rotate"></i>
        </BButton>
      </div>
    `,
  }),
  args: {
    modelValue: structuredClone(defaultToastItems),
  },
};
