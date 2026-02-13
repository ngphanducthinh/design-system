import { BButton, BSkeleton } from '@/components';
import { BCommonSize, BSkeletonAvatarShape } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ref } from 'vue';

const meta = {
  title: 'Feedback/Skeleton',
  component: BSkeleton,
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
    active: { control: 'boolean' },
    round: { control: 'boolean' },
    avatar: { control: 'object' },
    title: { control: 'object' },
    paragraph: { control: 'object' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BSkeleton</code> component provides loading placeholders for content blocks, matching Ant Design skeleton behavior.',
      },
    },
  },
} satisfies Meta<typeof BSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

const contentTemplate = `
  <div class="b:space-y-2">
    <h3 class="b:text-base b:font-semibold">Analytics overview</h3>
    <p class="b:text-sm b:text-black/[0.6]">
      Updated 3 minutes ago. Performance is trending upward across key metrics.
    </p>
  </div>
`;

export const Default: Story = {
  args: {
    loading: true,
    active: false,
    round: false,
    avatar: true,
    title: true,
    paragraph: true,
  },
  render: (args: any) => ({
    components: { BSkeleton },
    setup() {
      return { args, contentTemplate };
    },
    template: `
      <div class="b:max-w-lg">
        <BSkeleton v-bind="args">
          ${contentTemplate}
        </BSkeleton>
      </div>
    `,
  }),
};

export const Active: Story = {
  args: {
    loading: true,
    active: true,
    avatar: { size: BCommonSize.Medium, shape: BSkeletonAvatarShape.Circle },
    title: true,
    paragraph: true,
  },
  render: Default.render,
};

export const CustomParagraph: Story = {
  args: {
    loading: true,
    active: true,
    avatar: { size: 48, shape: BSkeletonAvatarShape.Square },
    title: { width: '55%' },
    paragraph: { rows: 4, width: ['100%', '90%', '80%', '65%'] },
  },
  render: Default.render,
};

export const Round: Story = {
  args: {
    loading: true,
    active: true,
    round: true,
    avatar: true,
    title: true,
    paragraph: true,
  },
  render: Default.render,
};

export const Loaded: Story = {
  args: {
    loading: false,
    avatar: true,
    title: true,
    paragraph: true,
  },
  render: Default.render,
};

export const Interactive: Story = {
  args: {
    active: true,
    avatar: { size: BCommonSize.Medium, shape: BSkeletonAvatarShape.Circle },
    title: true,
    paragraph: true,
  },
  render: (args: any) => ({
    components: { BButton, BSkeleton },
    setup() {
      const loading = ref(true);
      const toggle = () => {
        loading.value = !loading.value;
      };
      return { args, loading, toggle, contentTemplate };
    },
    template: `
      <div class="b:max-w-lg b:space-y-4">
        <BButton @click="toggle">Toggle loading</BButton>
        <BSkeleton v-bind="args" :loading="loading">
          ${contentTemplate}
        </BSkeleton>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole('button', { name: /toggle loading/i });
    await userEvent.click(button);
    await expect(canvas.findByText('Analytics overview')).resolves.toBeTruthy();
  },
};
