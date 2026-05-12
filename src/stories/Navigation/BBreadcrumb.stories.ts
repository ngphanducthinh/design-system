import { BBreadcrumb } from '@/components';
import type { BBreadcrumbItem } from '@/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';

const SAMPLE_ITEMS: BBreadcrumbItem[] = [
  { text: 'Home', href: '/' },
  { text: 'Application Center', href: '/app' },
  { text: 'Application List', href: '/app/list' },
  { text: 'An Application' },
];

const meta = {
  title: 'Navigation/Breadcrumb',
  component: BBreadcrumb,
  tags: ['autodocs'],
  argTypes: {
    separator: { control: 'text', description: 'Custom separator string' },
    items: { control: 'object', description: 'Array of breadcrumb items' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BBreadcrumb</code> component shows the current page location within a navigational hierarchy. Supports responsive collapsing, custom separators, icons, and custom item/separator slots.',
      },
    },
  },
} satisfies Meta<typeof BBreadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Playground
// ─────────────────────────────────────────────
export const Playground: Story = {
  args: {
    items: SAMPLE_ITEMS,
    separator: '/',
  },
  render: (args) => ({
    components: { BBreadcrumb },
    setup() {
      return { args };
    },
    template: `<BBreadcrumb v-bind="args" />`,
  }),
};

// ─────────────────────────────────────────────
// Custom Separator
// ─────────────────────────────────────────────
export const CustomSeparator: Story = {
  args: {
    items: SAMPLE_ITEMS,
    separator: '>',
  },
  render: (args) => ({
    components: { BBreadcrumb },
    setup() {
      return { args };
    },
    template: `<BBreadcrumb v-bind="args" />`,
  }),
};

// ─────────────────────────────────────────────
// With Icons
// ─────────────────────────────────────────────
export const WithIcons: Story = {
  args: {
    items: [
      { text: 'Home', href: '/', icon: 'house' },
      { text: 'Products', href: '/products', icon: 'box' },
      { text: 'Detail' },
    ],
    separator: '/',
  },
  render: (args) => ({
    components: { BBreadcrumb },
    setup() {
      return { args };
    },
    template: `<BBreadcrumb v-bind="args" />`,
  }),
};

// ─────────────────────────────────────────────
// Responsive Collapse (narrow container)
// ─────────────────────────────────────────────
export const ResponsiveCollapse: Story = {
  args: {
    items: SAMPLE_ITEMS,
    separator: '/',
  },
  render: (args) => ({
    components: { BBreadcrumb },
    setup() {
      return { args };
    },
    template: `
      <div style="width: 240px; border: 1px dashed #ccc; padding: 8px;">
        <BBreadcrumb v-bind="args" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'In a narrow container, middle items collapse into a "•••" menu. Click to reveal them.',
      },
    },
  },
};

// ─────────────────────────────────────────────
// Custom Item Slot
// ─────────────────────────────────────────────
export const CustomItemSlot: Story = {
  args: {
    items: SAMPLE_ITEMS,
  },
  render: (args) => ({
    components: { BBreadcrumb },
    setup() {
      return { args };
    },
    template: `
      <BBreadcrumb v-bind="args">
        <template #item-0="{ item }">
          <span style="font-weight:700; color: var(--b-breadcrumb-link-hover-color)">🏠 {{ item.text }}</span>
        </template>
      </BBreadcrumb>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility Story
// ─────────────────────────────────────────────
export const Accessibility: Story = {
  args: {
    items: SAMPLE_ITEMS,
    separator: '/',
  },
  render: (args) => ({
    components: { BBreadcrumb },
    setup() {
      return { args };
    },
    template: `<BBreadcrumb v-bind="args" />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Verifies semantic roles, aria attributes, and keyboard navigation. The last item carries <code>aria-current="page"</code>; separators are <code>aria-hidden</code>.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Last item should be aria-current=page
    const links = canvasElement.querySelectorAll('a.b-breadcrumb__link');
    const lastLink = links[links.length - 1] as HTMLElement;
    expect(lastLink.getAttribute('aria-current')).toBe('page');

    // nav has aria-label
    const nav = canvasElement.querySelector('nav.b-breadcrumb');
    expect(nav?.getAttribute('aria-label')).toBe('Breadcrumb');

    // Separators are aria-hidden
    const seps = canvasElement.querySelectorAll('.b-breadcrumb__separator');
    seps.forEach((sep) => {
      expect(sep.closest('[aria-hidden="true"]') || sep.getAttribute('aria-hidden')).toBeTruthy();
    });

    // First link is focusable
    (links[0] as HTMLElement).focus();
    expect(document.activeElement).toBe(links[0]);
  },
};

// ─────────────────────────────────────────────
// Theming Story
// ─────────────────────────────────────────────
export const Theming: Story = {
  args: {
    items: SAMPLE_ITEMS,
    separator: '/',
  },
  render: (args) => ({
    components: { BBreadcrumb },
    setup() {
      return { args };
    },
    // CSS variables must be bound via :style on the component itself so they
    // land as inline styles on the <nav class="b-breadcrumb"> root element.
    // Binding them on a wrapper <div> doesn't work because the component's own
    // stylesheet declarations on .b-breadcrumb win the cascade over inherited
    // custom properties from an ancestor element.
    template: `
      <div style="padding: 12px; border-radius: 8px; background: #f5f3ff;">
        <BBreadcrumb
          v-bind="args"
          :style="{
            '--b-breadcrumb-link-color':       '#5b21b6',
            '--b-breadcrumb-link-hover-color': '#3b0764',
            '--b-breadcrumb-separator-color':  '#6d28d9',
            '--b-breadcrumb-last-item-color':  '#1e1b4b',
            '--b-breadcrumb-ellipsis-bg':      '#ede9fe',
          }"
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Override CSS variables via <code>:style</code> on the component (not a wrapper element) so inline styles beat the component\'s own stylesheet declarations. All colours pass WCAG AA contrast against the <code>#f5f3ff</code> background.',
      },
    },
  },
};
