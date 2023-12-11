import { BDropdown, BDropdownContent, BDropdownItem } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta<typeof BDropdown> = {
  title: 'Components/Dropdown',
  component: BDropdown,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  // argTypes: {},
  args: {
    inputId: '',
    label: '',
    text: '',
    toggleCssClass: '',
    menuCssClass: '',
    noCloseOnClickOutside: false,
    noCloseOnEsc: false,
    menuFixed: false,
  },
};

export default meta;
type Story = StoryObj<typeof BDropdown>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BDropdown, BDropdownContent, BDropdownItem },
    setup() {
      const items = [
        {
          text: 'Edit',
          icon: 'fa-solid fa-pen-to-square',
        },
        {
          text: 'Delete',
          icon: 'fa-solid fa-trash',
        },
      ];

      return { args, items };
    },
    template: `
      <BDropdown v-bind="args" class="ds-w-fit">
        <template #toggle>
          Dropdown
        </template>
        
        <template #default>
          <BDropdownContent>
            <BDropdownItem v-for="(item, i) in items" :key="'item' + i"  close-on-click class="ds-space-x-2">
              <i :class="item.icon" class="w-6"></i>
              <span class="font-bold"> {{ item.text }} </span>
            </BDropdownItem>
          </BDropdownContent>
        </template>
      </BDropdown>
    `,
  }),
  args: {},
};
