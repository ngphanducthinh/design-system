import { BBreadcrumb } from '@/components';
import type { BBreadcrumbItem } from '@/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

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
    items: {
      control: 'object',
      description: 'Array of breadcrumb items.',
      table: { category: 'Props' },
    },
    separator: {
      control: 'text',
      description: 'Separator string rendered between items.',
      table: { category: 'Props', defaultValue: { summary: '/' } },
    },
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
// Usage
// ─────────────────────────────────────────────

/** Default breadcrumb with `/` separator. */
export const Default: Story = {
  args: { items: SAMPLE_ITEMS, separator: '/' },
  parameters: {
    docs: {
      source: {
        code: `<BBreadcrumb :items="items" />`,
      },
    },
  },
  render: (args) => ({
    components: { BBreadcrumb },
    setup: () => ({ args }),
    template: `<BBreadcrumb v-bind="args" />`,
  }),
};

/** Provide a custom string for the separator (e.g. `>`, `›`, `•`). */
export const CustomSeparator: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BBreadcrumb :items="items" separator=">" />`,
      },
    },
  },
  render: () => ({
    components: { BBreadcrumb },
    setup: () => ({ items: SAMPLE_ITEMS }),
    template: `<BBreadcrumb :items="items" separator=">" />`,
  }),
};

/** Items can carry an `icon` name from the BIcon registry. */
export const WithIcons: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BBreadcrumb :items="[
  { text: 'Home', href: '/', icon: 'house' },
  { text: 'Products', href: '/products', icon: 'box' },
  { text: 'Detail' },
]" />
        `,
      },
    },
  },
  render: () => ({
    components: { BBreadcrumb },
    setup: () => ({
      items: [
        { text: 'Home', href: '/', icon: 'house' },
        { text: 'Products', href: '/products', icon: 'box' },
        { text: 'Detail' },
      ] satisfies BBreadcrumbItem[],
    }),
    template: `<BBreadcrumb :items="items" />`,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** When the container is too narrow, middle items collapse into a `•••` menu. */
export const ResponsiveCollapse: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'In a narrow container, middle items collapse into a "•••" menu. Click to reveal them.',
      },
      source: {
        code: `
<div style="width: 240px;">
  <BBreadcrumb :items="items" />
</div>
        `,
      },
    },
  },
  render: () => ({
    components: { BBreadcrumb },
    setup: () => ({ items: SAMPLE_ITEMS }),
    template: `
      <div style="width: 240px; border: 1px dashed #ccc; padding: 8px;">
        <BBreadcrumb :items="items" />
      </div>
    `,
  }),
};

/** Use the per-index `#item-N` slot to render any item with custom markup. */
export const CustomItemSlot: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BBreadcrumb :items="items">
  <template #item-0="{ item }">
    <span style="font-weight: 700;">🏠 {{ item.text }}</span>
  </template>
</BBreadcrumb>
        `,
      },
    },
  },
  render: () => ({
    components: { BBreadcrumb },
    setup: () => ({ items: SAMPLE_ITEMS }),
    template: `
      <BBreadcrumb :items="items">
        <template #item-0="{ item }">
          <span style="font-weight: 700; color: oklch(50% 0.18 290);">🏠 {{ item.text }}</span>
        </template>
      </BBreadcrumb>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * BBreadcrumb renders as `<nav aria-label="Breadcrumb">` containing an `<ol>` of links.
 * The last item carries `aria-current="page"`; separators are `aria-hidden`.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Verifies semantic roles, ARIA attributes, and keyboard reachability. The last item carries <code>aria-current="page"</code>; separators are <code>aria-hidden</code>.',
      },
      source: {
        code: `<BBreadcrumb :items="items" />`,
      },
    },
  },
  render: () => ({
    components: { BBreadcrumb },
    setup: () => ({ items: SAMPLE_ITEMS }),
    template: `<BBreadcrumb :items="items" />`,
  }),
  play: async ({ canvasElement }) => {
    within(canvasElement);

    const links = canvasElement.querySelectorAll('a.b-breadcrumb__link');
    const lastLink = links[links.length - 1] as HTMLElement;
    expect(lastLink.getAttribute('aria-current')).toBe('page');

    const nav = canvasElement.querySelector('nav.b-breadcrumb');
    expect(nav?.getAttribute('aria-label')).toBe('Breadcrumb');

    const seps = canvasElement.querySelectorAll('.b-breadcrumb__separator');
    seps.forEach((sep) => {
      expect(sep.closest('[aria-hidden="true"]') || sep.getAttribute('aria-hidden')).toBeTruthy();
    });

    (links[0] as HTMLElement).focus();
    expect(document.activeElement).toBe(links[0]);
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * BBreadcrumb has no component-scoped `--b-breadcrumb-*` vars — it uses Tailwind utilities
 * resolved against the global theme tokens. Override the global `--color-primary` family
 * (and friends) on an ancestor to retheme breadcrumbs inside.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'BBreadcrumb uses Tailwind utilities that resolve against the global <code>--color-*</code> tokens. Override <code>--color-primary</code>, <code>--color-primary-hover</code>, and <code>--color-black-base</code> on any ancestor to retheme breadcrumbs.',
      },
      source: {
        code: `
<div
  style="
    --color-primary: oklch(50% 0.18 290);
    --color-primary-hover: oklch(42% 0.2 290);
    --color-black-base: oklch(20% 0.04 290 / 0.85);
  "
>
  <BBreadcrumb :items="items" />
</div>
        `,
      },
    },
  },
  render: () => ({
    components: { BBreadcrumb },
    setup: () => ({ items: SAMPLE_ITEMS }),
    template: `
      <div
        style="
          padding: 12px;
          border-radius: 8px;
          background: oklch(97% 0.02 290);
          --color-primary: oklch(50% 0.18 290);
          --color-primary-hover: oklch(42% 0.2 290);
          --color-black-base: oklch(20% 0.04 290 / 0.85);
        "
      >
        <BBreadcrumb :items="items" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

// BBreadcrumb has NO component-scoped `--b-breadcrumb-*` CSS vars.
// It is styled with Tailwind utility classes resolving against the global theme tokens
// in `src/assets/tailwind.css`. The themable surface is therefore the global tokens below.
const DESIGN_TOKENS: TokenRow[] = [
  { token: '--color-primary', defaultValue: 'oklch(55% 0.169 237.323)', description: 'Hover color of links and color of the ellipsis-toggle button.' },
  { token: '--color-primary-hover', defaultValue: 'oklch(48% 0.158 241.966)', description: 'Hover color used in interactive states.' },
  { token: '--color-black-base', defaultValue: 'oklch(0 0 0 / 0.8)', description: 'Default text color of breadcrumb items and separators.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'BBreadcrumb has <strong>no component-scoped <code>--b-breadcrumb-*</code> CSS variables</strong>. ' +
          'It is styled with Tailwind utility classes that resolve against the global theme tokens ' +
          'defined in <code>src/assets/tailwind.css</code>. To retheme breadcrumbs, override the ' +
          '<code>--color-*</code> tokens listed below at <code>:root</code> or any ancestor element.',
      },
    },
  },
  render: () => ({
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:oklch(96% 0.002 260);">
            <th style="text-align:left;padding:10px 12px;">CSS Variable</th>
            <th style="text-align:left;padding:10px 12px;">Default</th>
            <th style="text-align:left;padding:10px 12px;">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in tokens" :key="t.token" style="border-bottom:1px solid oklch(94% 0.003 260);">
            <td style="padding:8px 12px;font-family:monospace;color:oklch(40% 0.18 280);"><code>{{ t.token }}</code></td>
            <td style="padding:8px 12px;font-family:monospace;color:#595959;">{{ t.defaultValue }}</td>
            <td style="padding:8px 12px;">{{ t.description }}</td>
          </tr>
        </tbody>
      </table>
    `,
  }),
};
