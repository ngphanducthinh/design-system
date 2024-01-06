import { BCarousel, BCarouselItem } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta<typeof BCarousel> = {
  title: 'Components/Carousel',
  parameters: {
    docs: {
      description: {
        component: `The <code>BCarousel</code> component is used to display large numbers of visual content on a rotating timer.`,
      },
    },
  },
  component: BCarousel,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    modelValue: {
      control: 'select',
      options: [0, 1, 2],
    },
  },
  args: {
    duration: 5000,
    continuous: true,
    autoplay: true,
    pagination: true,
    navigation: true,
  },
};

export default meta;
type Story = StoryObj<typeof BCarousel>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BCarousel, BCarouselItem },
    setup() {
      return { args };
    },
    template: `
      <BCarousel v-bind="args" style="height: 400px">
        <BCarouselItem>
          <div class="ds-h-full ds-bg-no-repeat ds-bg-cover ds-bg-[url('https://wallpapers.com/images/hd/elegant-feline-in-soft-natural-light-00nbm86akvtczty6.webp')]" />
        </BCarouselItem>
        <BCarouselItem>
          <div class="ds-h-full ds-bg-no-repeat ds-bg-cover ds-bg-[url('https://wallpapers.com/images/hd/colorful-love-birds-0ctuhn6r2rubq7v3.webp')]" />
        </BCarouselItem>
        <BCarouselItem>
          <div class="ds-h-full ds-bg-no-repeat ds-bg-cover ds-bg-[url('https://wallpapers.com/images/high/dog-underwater-swimming-2siawk4nemp214kj.webp')]" />
        </BCarouselItem>
        <BCarouselItem>
          <div class="ds-h-full ds-bg-no-repeat ds-bg-cover ds-bg-[url('https://wallpapers.com/images/high/three-teen-lions-9xiimjysh7htjow3.webp')]" />
        </BCarouselItem>
      </BCarousel>
    `,
  }),
  args: {},
};
