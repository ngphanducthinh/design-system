import { BTimeline, BTimelineItem } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

const meta: Meta<typeof BTimeline> = {
  title: 'Components/Timeline',
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BTimeline</code> component is used for stylistically displaying chronological information.',
      },
    },
  },
  component: BTimeline,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  // argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof BTimeline>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BTimeline, BTimelineItem },
    setup() {
      const items = ref([
        {
          title: 'February 04',
          content:
            "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
        },
        {
          title: 'May 12',
          content:
            'It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. ',
        },
        {
          title: 'June 01',
          content:
            'It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages.',
        },
      ]);
      // Return
      return { args, items };
    },
    template: `
      <BTimeline v-bind="args">
        <BTimelineItem v-for="item in items" :key="item.title">
          <div class="ds-py-4">
            <div class="ds-text-gray-400">{{ item.title }}</div>
            <div>{{ item.content }}</div>
          </div>
        </BTimelineItem>
      </BTimeline>
    `,
  }),
  args: {},
};
