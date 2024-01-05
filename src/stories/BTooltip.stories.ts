import { BTooltip } from '@/components';
import { BTooltipOpenEvent, BTooltipPosition } from '@/constants/Enums';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

const meta: Meta<typeof BTooltip> = {
  title: 'Components/Tooltip',
  component: BTooltip,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    position: {
      control: 'select',
      options: Object.values(BTooltipPosition) as string[],
    },
    openEvent: {
      control: 'select',
      options: Object.values(BTooltipOpenEvent) as string[],
    },
    toggle: {
      control: 'text',
      description: 'Toggle',
    },
    default: {
      control: 'text',
      description: "Tooltip's content",
    },
  },
  args: {
    position: BTooltipPosition.Top,
    openEvent: BTooltipOpenEvent.Hover,
  },
};

export default meta;
type Story = StoryObj<typeof BTooltip>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BTooltip },
    setup() {
      const tooltip = ref(false);
      return { args, tooltip };
    },
    template: `
      <div style="height: 200px; padding-top: 16px">
        <BTooltip v-bind="args" v-model="tooltip">
          <template v-if="args.toggle" #toggle><span v-html="args.toggle" /></template>
          <template v-if="args.default" #default><span v-html="args.default" /></template>
        </BTooltip>
      </div>
    `,
  }),
  args: {
    toggle: '<b>Hover me!</b>',
    default:
      '<div>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</div>',
  },
};
