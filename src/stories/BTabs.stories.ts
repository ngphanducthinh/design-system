import { BTab, BTabs } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

const meta: Meta<typeof BTabs> = {
  title: 'Components/Tabs',
  parameters: {
    docs: {
      description: {
        component: `The <code>BTabs</code> component is used for hiding content behind a selectable item.`,
      },
    },
  },
  component: BTabs,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  // argTypes: {},
  args: {
    headers: [
      { text: 'Tab 01' },
      { text: 'Tab 02', disabled: true },
      { text: 'Tab 03' },
      { text: 'Tab 04' },
    ],
    modelValue: 0,
    headerCssClass: '',
  },
};

export default meta;
type Story = StoryObj<typeof BTabs>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BTabs, BTab },
    setup() {
      const tab = ref(0);
      const subTabHeaders = [{ text: 'Subtab 01' }, { text: 'Subtab 02' }];

      return { args, tab, subTabHeaders };
    },
    template: `
      <BTabs
        v-bind="args"
        v-model="tab"
      >
        <BTab class="ds-mt-4">
          <div>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.</div>
        </BTab>
        <BTab>
          <div>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</div>
        </BTab>
        <BTab class="ds-mt-4">
          <div>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.</div>
        </BTab>
        <BTab>
          <BTabs :headers="subTabHeaders">
            <BTab class="ds-mt-4">
              Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.
            </BTab>
            <BTab class="ds-mt-4">
              Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC.
            </BTab>
          </BTabs>
        </BTab>
      </BTabs>
    `,
  }),
  args: {},
};
