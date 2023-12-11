import { BCarousel, BCarouselItem } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta<typeof BCarousel> = {
  title: 'Components/Carousel',
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
      const carouselSlides = [
        'https://wallpapers.com/images/hd/river-and-trees-nature-227nqf2r0aa2xguq.webp',
        'https://wallpapers.com/images/hd/lake-in-the-forest-nature-xavnq3nwry0es5if.webp',
        'https://wallpapers.com/images/hd/attractive-lake-nature-pczghhhvhzi0yf7t.webp',
      ];

      return { args, carouselSlides };
    },
    template: `
      <BCarousel v-bind="args" style="height: 400px">
        <BCarouselItem v-for="(slide, index) in carouselSlides" :key="index">
          <img :src="slide" class="rounded-lg object-cover" alt="" />
        </BCarouselItem>
      </BCarousel>
    `,
  }),
  args: {},
};
