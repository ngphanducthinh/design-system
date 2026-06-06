import { BAnchor } from '@/components';
import type { BAnchorItem } from '@/components/BAnchor/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent } from 'storybook/test';
import { ref } from 'vue';

const playgroundItems: BAnchorItem[] = [
  { key: '1', href: '#pg-section-1', title: 'Section 1' },
  { key: '2', href: '#pg-section-2', title: 'Section 2' },
  { key: '3', href: '#pg-section-3', title: 'Section 3' },
  { key: '4', href: '#pg-section-4', title: 'Section 4' },
];

const horizontalItems: BAnchorItem[] = [
  { key: '1', href: '#hz-section-1', title: 'Section 1' },
  { key: '2', href: '#hz-section-2', title: 'Section 2' },
  { key: '3', href: '#hz-section-3', title: 'Section 3' },
  { key: '4', href: '#hz-section-4', title: 'Section 4' },
];

const nestedItems: BAnchorItem[] = [
  {
    key: '1',
    href: '#nest-overview',
    title: 'Overview',
    children: [
      { key: '1-1', href: '#nest-getting-started', title: 'Getting Started' },
      { key: '1-2', href: '#nest-installation', title: 'Installation' },
    ],
  },
  {
    key: '2',
    href: '#nest-api',
    title: 'API Reference',
    children: [
      { key: '2-1', href: '#nest-props', title: 'Props' },
      { key: '2-2', href: '#nest-events', title: 'Events' },
    ],
  },
  { key: '3', href: '#nest-faq', title: 'FAQ' },
];

const a11yItems: BAnchorItem[] = [
  { key: '1', href: '#a11y-section-1', title: 'Section 1' },
  { key: '2', href: '#a11y-section-2', title: 'Section 2' },
  { key: '3', href: '#a11y-section-3', title: 'Section 3' },
  { key: '4', href: '#a11y-section-4', title: 'Section 4' },
];

const themeItems: BAnchorItem[] = [
  { key: '1', href: '#theme-section-1', title: 'Section 1' },
  { key: '2', href: '#theme-section-2', title: 'Section 2' },
  { key: '3', href: '#theme-section-3', title: 'Section 3' },
];

const meta = {
  title: 'Navigation/Anchor',
  component: BAnchor,
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: 'object',
      description: 'Data-driven link items.',
      table: { category: 'Props' },
    },
    direction: {
      control: 'radio',
      options: ['vertical', 'horizontal'],
      description: 'Layout direction of the anchor.',
      table: { category: 'Props', defaultValue: { summary: 'vertical' } },
    },
    affix: {
      control: 'boolean',
      description: 'Whether the anchor uses fixed positioning on scroll.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    bounds: {
      control: 'number',
      description: 'Bounding distance of the anchor area in pixels.',
      table: { category: 'Props', defaultValue: { summary: '5' } },
    },
    offsetTop: {
      control: 'number',
      description: 'Pixels to offset from the top when calculating scroll position.',
      table: { category: 'Props' },
    },
    targetOffset: {
      control: 'number',
      description: 'Anchor scroll offset for target elements.',
      table: { category: 'Props' },
    },
    replace: {
      control: 'boolean',
      description: 'Replace browser history instead of pushing.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    modelValue: {
      control: 'text',
      description: 'Currently active link href (controlled).',
      table: { category: 'Two-Way Binding Props' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BAnchor</code> component provides navigation links that track scroll position and highlight the current section. Supports vertical and horizontal directions, nested items, affix behavior, and customizable styling via CSS variables.',
      },
    },
  },
} satisfies Meta<typeof BAnchor>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** The default vertical anchor tracking scroll position within a custom container. */
export const Default: Story = {
  args: {
    items: playgroundItems,
    direction: 'vertical',
    affix: false,
    bounds: 5,
    offsetTop: 0,
    replace: false,
  },
  parameters: {
    docs: {
      source: {
        code: `<BAnchor :items="items" />`,
      },
    },
  },
  render: (args) => ({
    components: { BAnchor },
    setup() {
      const containerRef = ref<HTMLElement | null>(null);
      const getContainer = () => containerRef.value!;
      return { args, containerRef, getContainer };
    },
    template: `
      <div style="display: flex; gap: 16px; height: 400px;">
        <BAnchor v-bind="args" :affix="false" :get-container="getContainer" style="flex-shrink: 0; padding-top: 8px;" />
        <div ref="containerRef" tabindex="0" style="flex: 1; overflow-y: auto; border: 1px solid oklch(88% 0.01 260); border-radius: 8px; padding: 0 16px;">
          <div id="pg-section-1" style="height: 300px; padding: 24px 0;">
            <h2 style="margin: 0 0 8px;">Section 1</h2>
            <p style="color: oklch(50% 0.01 260);">Content for section 1. Scroll down to see the anchor track your position.</p>
          </div>
          <div id="pg-section-2" style="height: 300px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h2 style="margin: 0 0 8px;">Section 2</h2>
            <p style="color: oklch(50% 0.01 260);">Content for section 2.</p>
          </div>
          <div id="pg-section-3" style="height: 300px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h2 style="margin: 0 0 8px;">Section 3</h2>
            <p style="color: oklch(50% 0.01 260);">Content for section 3.</p>
          </div>
          <div id="pg-section-4" style="height: 300px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h2 style="margin: 0 0 8px;">Section 4</h2>
            <p style="color: oklch(50% 0.01 260);">Content for section 4.</p>
          </div>
          <div style="height: 300px;"></div>
        </div>
      </div>
    `,
  }),
};

/** Horizontal layout — useful for top-of-page anchor strips. */
export const Horizontal: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BAnchor direction="horizontal" :items="items" />`,
      },
    },
  },
  render: () => ({
    components: { BAnchor },
    setup() {
      const containerRef = ref<HTMLElement | null>(null);
      const getContainer = () => containerRef.value!;
      return { items: horizontalItems, containerRef, getContainer };
    },
    template: `
      <div style="height: 400px; display: flex; flex-direction: column;">
        <BAnchor direction="horizontal" :affix="false" :items="items" :get-container="getContainer" />
        <div ref="containerRef" tabindex="0" style="flex: 1; overflow-y: auto; margin-top: 16px; border: 1px solid oklch(88% 0.01 260); border-radius: 8px; padding: 0 16px;">
          <div id="hz-section-1" style="height: 300px; padding: 24px 0;">
            <h2 style="margin: 0 0 8px;">Section 1</h2>
          </div>
          <div id="hz-section-2" style="height: 300px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h2 style="margin: 0 0 8px;">Section 2</h2>
          </div>
          <div id="hz-section-3" style="height: 300px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h2 style="margin: 0 0 8px;">Section 3</h2>
          </div>
          <div id="hz-section-4" style="height: 300px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h2 style="margin: 0 0 8px;">Section 4</h2>
          </div>
          <div style="height: 300px;"></div>
        </div>
      </div>
    `,
  }),
};

/** Items can nest to render a multi-level table-of-contents. */
export const NestedItems: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BAnchor :items="[
  { key: '1', href: '#overview', title: 'Overview', children: [
    { key: '1-1', href: '#getting-started', title: 'Getting Started' },
  ]},
  { key: '2', href: '#api', title: 'API Reference' },
]" />
        `,
      },
    },
  },
  render: () => ({
    components: { BAnchor },
    setup() {
      const containerRef = ref<HTMLElement | null>(null);
      const getContainer = () => containerRef.value!;
      return { items: nestedItems, containerRef, getContainer };
    },
    template: `
      <div style="display: flex; gap: 16px; height: 400px;">
        <BAnchor :affix="false" :items="items" :get-container="getContainer" style="flex-shrink: 0; padding-top: 8px;" />
        <div ref="containerRef" tabindex="0" style="flex: 1; overflow-y: auto; border: 1px solid oklch(88% 0.01 260); border-radius: 8px; padding: 0 16px;">
          <div id="nest-overview" style="height: 200px; padding: 24px 0;">
            <h2 style="margin: 0 0 8px;">Overview</h2>
          </div>
          <div id="nest-getting-started" style="height: 200px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h3 style="margin: 0 0 8px;">Getting Started</h3>
          </div>
          <div id="nest-installation" style="height: 200px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h3 style="margin: 0 0 8px;">Installation</h3>
          </div>
          <div id="nest-api" style="height: 200px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h2 style="margin: 0 0 8px;">API Reference</h2>
          </div>
          <div id="nest-props" style="height: 200px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h3 style="margin: 0 0 8px;">Props</h3>
          </div>
          <div id="nest-events" style="height: 200px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h3 style="margin: 0 0 8px;">Events</h3>
          </div>
          <div id="nest-faq" style="height: 200px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h2 style="margin: 0 0 8px;">FAQ</h2>
          </div>
          <div style="height: 300px;"></div>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Documentation sidebar — anchor pinned beside an article body. */
export const DocsSidebar: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A typical documentation layout: anchor on the left, scrollable article content on the right.',
      },
      source: {
        code: `
<div style="display: grid; grid-template-columns: 200px 1fr;">
  <BAnchor :items="items" />
  <article>...</article>
</div>
        `,
      },
    },
  },
  render: () => ({
    components: { BAnchor },
    setup() {
      const containerRef = ref<HTMLElement | null>(null);
      const getContainer = () => containerRef.value!;
      const items: BAnchorItem[] = [
        { key: '1', href: '#docs-intro', title: 'Introduction' },
        { key: '2', href: '#docs-install', title: 'Installation' },
        { key: '3', href: '#docs-usage', title: 'Usage' },
        { key: '4', href: '#docs-api', title: 'API' },
      ];
      return { items, containerRef, getContainer };
    },
    template: `
      <div style="display: grid; grid-template-columns: 200px 1fr; gap: 24px; height: 400px;">
        <BAnchor :affix="false" :items="items" :get-container="getContainer" style="padding-top: 8px;" />
        <div ref="containerRef" tabindex="0" style="overflow-y: auto; border: 1px solid oklch(88% 0.01 260); border-radius: 8px; padding: 16px;">
          <article>
            <section id="docs-intro" style="min-height: 200px;">
              <h2>Introduction</h2>
              <p style="color: oklch(50% 0.01 260);">Welcome to the docs.</p>
            </section>
            <section id="docs-install" style="min-height: 200px; border-top: 1px solid oklch(92% 0.01 260); padding-top: 16px;">
              <h2>Installation</h2>
              <p style="color: oklch(50% 0.01 260);">Install via package manager.</p>
            </section>
            <section id="docs-usage" style="min-height: 200px; border-top: 1px solid oklch(92% 0.01 260); padding-top: 16px;">
              <h2>Usage</h2>
              <p style="color: oklch(50% 0.01 260);">Use it like this.</p>
            </section>
            <section id="docs-api" style="min-height: 200px; border-top: 1px solid oklch(92% 0.01 260); padding-top: 16px;">
              <h2>API</h2>
              <p style="color: oklch(50% 0.01 260);">Reference.</p>
            </section>
            <div style="height: 200px;"></div>
          </article>
        </div>
      </div>
    `,
  }),
};

/** Click-to-activate — verifies the active state updates on user click. */
export const ClickToActivate: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Clicking a link sets the active state and applies <code>aria-current="location"</code>.',
      },
      source: {
        code: `<BAnchor :items="items" v-model="activeHref" />`,
      },
    },
  },
  render: () => ({
    components: { BAnchor },
    setup() {
      const containerRef = ref<HTMLElement | null>(null);
      const getContainer = () => containerRef.value!;
      const items: BAnchorItem[] = [
        { key: '1', href: '#int-section-1', title: 'Section 1' },
        { key: '2', href: '#int-section-2', title: 'Section 2' },
        { key: '3', href: '#int-section-3', title: 'Section 3' },
        { key: '4', href: '#int-section-4', title: 'Section 4' },
      ];
      return { items, containerRef, getContainer };
    },
    template: `
      <div style="display: flex; gap: 16px; height: 400px;">
        <BAnchor :affix="false" :items="items" :get-container="getContainer" style="flex-shrink: 0; padding-top: 8px;" />
        <div ref="containerRef" tabindex="0" style="flex: 1; overflow-y: auto; border: 1px solid oklch(88% 0.01 260); border-radius: 8px; padding: 0 16px;">
          <div id="int-section-1" style="height: 300px; padding: 24px 0;"><h2 style="margin: 0;">Section 1</h2></div>
          <div id="int-section-2" style="height: 300px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);"><h2 style="margin: 0;">Section 2</h2></div>
          <div id="int-section-3" style="height: 300px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);"><h2 style="margin: 0;">Section 3</h2></div>
          <div id="int-section-4" style="height: 300px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);"><h2 style="margin: 0;">Section 4</h2></div>
          <div style="height: 300px;"></div>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const anchorLinks = canvasElement.querySelectorAll('.b-anchor-link__title');

    await userEvent.click(anchorLinks[1]);

    const activeLink = canvasElement.querySelector('.b-anchor-link--active');
    expect(activeLink).not.toBeNull();

    const activeTitleEl = canvasElement.querySelector(
      '.b-anchor-link--active .b-anchor-link__title',
    );
    expect(activeTitleEl?.textContent).toBe('Section 2');
    expect(activeTitleEl?.getAttribute('aria-current')).toBe('location');

    await userEvent.click(anchorLinks[2]);
    const newActive = canvasElement.querySelector('.b-anchor-link--active .b-anchor-link__title');
    expect(newActive?.textContent).toBe('Section 3');
  },
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * BAnchor renders a `<nav role="navigation">` containing a `role="list"` of links.
 * The active link carries `aria-current="location"`; the indicator is `aria-hidden`.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Keyboard reachable via <kbd>Tab</kbd>. The active link is announced via <code>aria-current="location"</code>; the visual indicator is <code>aria-hidden</code>.',
      },
      source: {
        code: `<BAnchor :items="items" v-model="'#a11y-section-2'" />`,
      },
    },
  },
  render: () => ({
    components: { BAnchor },
    setup() {
      return { items: a11yItems };
    },
    template: `<BAnchor :items="items" :affix="false" model-value="#a11y-section-2" />`,
  }),
  play: async ({ canvasElement }) => {
    const nav = canvasElement.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav?.getAttribute('role')).toBe('navigation');
    expect(nav?.getAttribute('aria-label')).toBe('Anchor navigation');

    const list = canvasElement.querySelector('[role="list"]');
    expect(list).not.toBeNull();
    const listItems = canvasElement.querySelectorAll('[role="listitem"]');
    expect(listItems.length).toBe(4);

    const activeLink = canvasElement.querySelector('[aria-current="location"]');
    expect(activeLink).not.toBeNull();
    expect(activeLink?.textContent).toBe('Section 2');

    const indicator = canvasElement.querySelector('.b-anchor__indicator');
    expect(indicator?.getAttribute('aria-hidden')).toBe('true');

    const links = canvasElement.querySelectorAll('.b-anchor-link__title');
    await userEvent.tab();
    expect(links[0]).toHaveFocus();

    await userEvent.tab();
    expect(links[1]).toHaveFocus();

    await userEvent.tab();
    expect(links[2]).toHaveFocus();
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override `--b-anchor-indicator-color`, `--b-anchor-link-color-active`, and
 * `--b-anchor-border-color` (plus extras) to retheme the anchor.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-anchor-indicator-color</code>, <code>--b-anchor-link-color-active</code>, and <code>--b-anchor-border-color</code> on the component root (or any ancestor) to retheme the anchor.',
      },
      source: {
        code: `
<BAnchor
  :items="items"
  style="
    --b-anchor-indicator-color: oklch(45% 0.2 20);
    --b-anchor-link-color-active: oklch(45% 0.2 20);
    --b-anchor-border-color: oklch(80% 0.06 20);
  "
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BAnchor },
    setup() {
      return { items: themeItems };
    },
    template: `
      <div style="display: flex; gap: 48px;">
        <div>
          <h4 style="margin-bottom: 12px;">Default</h4>
          <BAnchor :items="items" :affix="false" model-value="#theme-section-2" aria-label="Default anchor" />
        </div>
        <div>
          <h4 style="margin-bottom: 12px;">Custom Colors</h4>
          <BAnchor
            :items="items"
            :affix="false"
            model-value="#theme-section-2"
            aria-label="Custom colors anchor"
            style="
              --b-anchor-indicator-color: oklch(45% 0.2 20);
              --b-anchor-link-color-active: oklch(45% 0.2 20);
              --b-anchor-link-color-hover: oklch(40% 0.18 20);
            "
          />
        </div>
        <div>
          <h4 style="margin-bottom: 12px;">Custom Spacing</h4>
          <BAnchor
            :items="items"
            :affix="false"
            model-value="#theme-section-2"
            aria-label="Custom spacing anchor"
            style="
              --b-anchor-link-padding-block: 8px;
              --b-anchor-link-padding-inline-start: 24px;
              --b-anchor-indicator-width: 4px;
            "
          />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  { token: '--b-anchor-link-padding-block', defaultValue: '0.25rem', description: 'Vertical padding of an anchor link.' },
  { token: '--b-anchor-link-padding-inline-start', defaultValue: '1rem', description: 'Horizontal padding of an anchor link.' },
  { token: '--b-anchor-background', defaultValue: 'transparent', description: 'Background color of the anchor container.' },
  { token: '--b-anchor-border-color', defaultValue: 'oklch(0% 0 0 / 6%)', description: 'Color of the vertical/horizontal track.' },
  { token: '--b-anchor-indicator-color', defaultValue: 'oklch(62.3% 0.214 259.815)', description: 'Color of the active link indicator.' },
  { token: '--b-anchor-indicator-width', defaultValue: '2px', description: 'Thickness of the active link indicator.' },
  { token: '--b-anchor-link-color', defaultValue: 'oklch(20% 0.005 260 / 88%)', description: 'Default color of anchor link text.' },
  { token: '--b-anchor-link-color-hover', defaultValue: 'oklch(62.3% 0.214 259.815)', description: 'Hover color of anchor link text.' },
  { token: '--b-anchor-link-color-active', defaultValue: 'oklch(62.3% 0.214 259.815)', description: 'Active color of anchor link text.' },
  { token: '--b-anchor-font-size', defaultValue: '0.875rem', description: 'Font size of anchor link text.' },
  { token: '--b-anchor-line-height', defaultValue: '1.5', description: 'Line height of anchor link text.' },
  { token: '--b-anchor-child-indent', defaultValue: '1rem', description: 'Indentation per nested level.' },
  { token: '--b-anchor-transition-duration', defaultValue: '300ms', description: 'Duration of indicator/color transitions.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'All scoped CSS variables exposed by <code>BAnchor</code>. Override on the component root or any ancestor selector.',
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
