import { BAnchor } from '@/components';
import type { BAnchorItem } from '@/components/BAnchor/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent } from 'storybook/test';
import { ref } from 'vue';

// Each story uses a unique ID prefix to avoid collisions in docs view
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
  { key: '4', href: '#theme-section-4', title: 'Section 4' },
];

const interactionItems: BAnchorItem[] = [
  { key: '1', href: '#int-section-1', title: 'Section 1' },
  { key: '2', href: '#int-section-2', title: 'Section 2' },
  { key: '3', href: '#int-section-3', title: 'Section 3' },
  { key: '4', href: '#int-section-4', title: 'Section 4' },
];

const meta = {
  title: 'Navigation/Anchor',
  component: BAnchor,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'Currently active link href (controlled mode)',
      table: { category: 'Two-Way Binding Props' },
    },
    direction: {
      control: 'radio',
      options: ['vertical', 'horizontal'],
      description: 'Layout direction of the anchor',
    },
    affix: {
      control: 'boolean',
      description: 'Whether anchor uses fixed positioning on scroll',
    },
    bounds: {
      control: 'number',
      description: 'Bounding distance of anchor area in pixels',
    },
    offsetTop: {
      control: 'number',
      description: 'Pixels to offset from top when calculating position of scroll',
    },
    targetOffset: {
      control: 'number',
      description: 'Anchor scroll offset for target elements',
    },
    replace: {
      control: 'boolean',
      description: 'Replace browser history instead of push',
    },
    items: {
      control: 'object',
      description: 'Data-driven link items',
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
// Playground
// ─────────────────────────────────────────────
export const Playground: Story = {
  args: {
    items: playgroundItems,
    direction: 'vertical',
    affix: false,
    bounds: 5,
    offsetTop: 0,
    replace: false,
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

// ─────────────────────────────────────────────
// Horizontal
// ─────────────────────────────────────────────
export const Horizontal: Story = {
  args: {
    items: horizontalItems,
    direction: 'horizontal',
    affix: false,
  },
  render: (args) => ({
    components: { BAnchor },
    setup() {
      const containerRef = ref<HTMLElement | null>(null);
      const getContainer = () => containerRef.value!;
      return { args, containerRef, getContainer };
    },
    template: `
      <div style="height: 400px; display: flex; flex-direction: column;">
        <BAnchor v-bind="args" :get-container="getContainer" />
        <div ref="containerRef" tabindex="0" style="flex: 1; overflow-y: auto; margin-top: 16px; border: 1px solid oklch(88% 0.01 260); border-radius: 8px; padding: 0 16px;">
          <div id="hz-section-1" style="height: 300px; padding: 24px 0;">
            <h2 style="margin: 0 0 8px;">Section 1</h2>
            <p style="color: oklch(50% 0.01 260);">Content for section 1.</p>
          </div>
          <div id="hz-section-2" style="height: 300px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h2 style="margin: 0 0 8px;">Section 2</h2>
            <p style="color: oklch(50% 0.01 260);">Content for section 2.</p>
          </div>
          <div id="hz-section-3" style="height: 300px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h2 style="margin: 0 0 8px;">Section 3</h2>
            <p style="color: oklch(50% 0.01 260);">Content for section 3.</p>
          </div>
          <div id="hz-section-4" style="height: 300px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h2 style="margin: 0 0 8px;">Section 4</h2>
            <p style="color: oklch(50% 0.01 260);">Content for section 4.</p>
          </div>
          <div style="height: 300px;"></div>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Nested Items
// ─────────────────────────────────────────────
export const NestedItems: Story = {
  args: {
    items: nestedItems,
    direction: 'vertical',
    affix: false,
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
        <BAnchor v-bind="args" :get-container="getContainer" style="flex-shrink: 0; padding-top: 8px;" />
        <div ref="containerRef" tabindex="0" style="flex: 1; overflow-y: auto; border: 1px solid oklch(88% 0.01 260); border-radius: 8px; padding: 0 16px;">
          <div id="nest-overview" style="height: 200px; padding: 24px 0;">
            <h2 style="margin: 0 0 8px;">Overview</h2>
            <p style="color: oklch(50% 0.01 260);">Overview content.</p>
          </div>
          <div id="nest-getting-started" style="height: 200px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h3 style="margin: 0 0 8px;">Getting Started</h3>
            <p style="color: oklch(50% 0.01 260);">Getting started content.</p>
          </div>
          <div id="nest-installation" style="height: 200px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h3 style="margin: 0 0 8px;">Installation</h3>
            <p style="color: oklch(50% 0.01 260);">Installation content.</p>
          </div>
          <div id="nest-api" style="height: 200px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h2 style="margin: 0 0 8px;">API Reference</h2>
            <p style="color: oklch(50% 0.01 260);">API reference content.</p>
          </div>
          <div id="nest-props" style="height: 200px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h3 style="margin: 0 0 8px;">Props</h3>
            <p style="color: oklch(50% 0.01 260);">Props documentation.</p>
          </div>
          <div id="nest-events" style="height: 200px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h3 style="margin: 0 0 8px;">Events</h3>
            <p style="color: oklch(50% 0.01 260);">Events documentation.</p>
          </div>
          <div id="nest-faq" style="height: 200px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h2 style="margin: 0 0 8px;">FAQ</h2>
            <p style="color: oklch(50% 0.01 260);">Frequently asked questions.</p>
          </div>
          <div style="height: 300px;"></div>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────
export const Accessibility: Story = {
  args: {
    items: a11yItems,
    direction: 'vertical',
    affix: false,
    modelValue: '#a11y-section-2',
  },
  render: (args) => ({
    components: { BAnchor },
    setup() {
      return { args };
    },
    template: `<BAnchor v-bind="args" />`,
  }),
  play: async ({ canvasElement }) => {
    // Verify navigation landmark
    const nav = canvasElement.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav?.getAttribute('role')).toBe('navigation');
    expect(nav?.getAttribute('aria-label')).toBe('Anchor navigation');

    // Verify list structure
    const list = canvasElement.querySelector('[role="list"]');
    expect(list).not.toBeNull();
    const listItems = canvasElement.querySelectorAll('[role="listitem"]');
    expect(listItems.length).toBe(4);

    // Verify active link has aria-current
    const activeLink = canvasElement.querySelector('[aria-current="location"]');
    expect(activeLink).not.toBeNull();
    expect(activeLink?.textContent).toBe('Section 2');

    // Verify indicator is hidden from AT
    const indicator = canvasElement.querySelector('.b-anchor__indicator');
    expect(indicator?.getAttribute('aria-hidden')).toBe('true');

    // Test keyboard navigation - Tab to focus links
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
// Theming (CSS Variable Overrides)
// ─────────────────────────────────────────────
export const Theming: Story = {
  args: {
    items: themeItems,
    direction: 'vertical',
    affix: false,
    modelValue: '#theme-section-2',
  },
  render: (args) => ({
    components: { BAnchor },
    setup() {
      return { args };
    },
    template: `
      <div style="display: flex; gap: 48px;">
        <div>
          <h4 style="margin-bottom: 12px;">Default</h4>
          <BAnchor v-bind="args" aria-label="Default anchor" />
        </div>
        <div>
          <h4 style="margin-bottom: 12px;">Custom Colors</h4>
          <BAnchor
            v-bind="args"
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
            v-bind="args"
            aria-label="Custom spacing anchor"
            style="
              --b-anchor-link-padding-block: 8px;
              --b-anchor-link-padding-inline-start: 24px;
              --b-anchor-indicator-width: 4px;
            "
          />
        </div>
        <div>
          <h4 style="margin-bottom: 12px;">Custom Font &amp; Background</h4>
          <BAnchor
            v-bind="args"
            aria-label="Custom font anchor"
            style="
              --b-anchor-font-size: 16px;
              --b-anchor-background: oklch(96% 0.01 260);
              --b-anchor-border-color: oklch(80% 0.02 260);
              --b-anchor-indicator-color: oklch(42% 0.15 145);
              --b-anchor-link-color-active: oklch(42% 0.15 145);
            "
          />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Interaction test
// ─────────────────────────────────────────────
export const InteractionTest: Story = {
  args: {
    items: interactionItems,
    direction: 'vertical',
    affix: false,
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
        <BAnchor v-bind="args" :get-container="getContainer" style="flex-shrink: 0; padding-top: 8px;" />
        <div ref="containerRef" tabindex="0" style="flex: 1; overflow-y: auto; border: 1px solid oklch(88% 0.01 260); border-radius: 8px; padding: 0 16px;">
          <div id="int-section-1" style="height: 300px; padding: 24px 0;">
            <h2 style="margin: 0 0 8px;">Section 1</h2>
          </div>
          <div id="int-section-2" style="height: 300px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h2 style="margin: 0 0 8px;">Section 2</h2>
          </div>
          <div id="int-section-3" style="height: 300px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h2 style="margin: 0 0 8px;">Section 3</h2>
          </div>
          <div id="int-section-4" style="height: 300px; padding: 24px 0; border-top: 1px solid oklch(92% 0.01 260);">
            <h2 style="margin: 0 0 8px;">Section 4</h2>
          </div>
          <div style="height: 300px;"></div>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // Use specific selectors to target anchor links (not content headings)
    const anchorLinks = canvasElement.querySelectorAll('.b-anchor-link__title');

    // Click on Section 2 link
    await userEvent.click(anchorLinks[1]);

    // Verify active state
    const activeLink = canvasElement.querySelector('.b-anchor-link--active');
    expect(activeLink).not.toBeNull();

    const activeTitleEl = canvasElement.querySelector(
      '.b-anchor-link--active .b-anchor-link__title',
    );
    expect(activeTitleEl?.textContent).toBe('Section 2');

    // Verify aria-current is applied
    expect(activeTitleEl?.getAttribute('aria-current')).toBe('location');

    // Click Section 3 link
    await userEvent.click(anchorLinks[2]);

    const newActive = canvasElement.querySelector('.b-anchor-link--active .b-anchor-link__title');
    expect(newActive?.textContent).toBe('Section 3');
  },
};

// ─────────────────────────────────────────────
// Design Tokens - MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  // ── AntD-aligned tokens ──
  {
    token: '--b-anchor-link-padding-block',
    defaultValue: '0.25rem',
    description: 'Vertical padding of an anchor link (AntD: linkPaddingBlock).',
  },
  {
    token: '--b-anchor-link-padding-inline-start',
    defaultValue: '1rem',
    description: 'Horizontal padding of an anchor link (AntD: linkPaddingInlineStart).',
  },
  // ── Local extras ──
  {
    token: '--b-anchor-background',
    defaultValue: 'transparent',
    description: 'Background color of the anchor container.',
  },
  {
    token: '--b-anchor-border-color',
    defaultValue: 'oklch(0% 0 0 / 6%)',
    description: 'Color of the vertical/horizontal track (AntD: colorSplit).',
  },
  {
    token: '--b-anchor-indicator-color',
    defaultValue: 'oklch(62.3% 0.214 259.815)',
    description: 'Color of the active link indicator (AntD: colorPrimary).',
  },
  {
    token: '--b-anchor-indicator-width',
    defaultValue: '2px',
    description: 'Thickness of the active link indicator (AntD: lineWidthBold).',
  },
  {
    token: '--b-anchor-link-color',
    defaultValue: 'oklch(20% 0.005 260 / 88%)',
    description: 'Default color of anchor link text.',
  },
  {
    token: '--b-anchor-link-color-hover',
    defaultValue: 'oklch(62.3% 0.214 259.815)',
    description: 'Hover color of anchor link text.',
  },
  {
    token: '--b-anchor-link-color-active',
    defaultValue: 'oklch(62.3% 0.214 259.815)',
    description: 'Active color of anchor link text.',
  },
  {
    token: '--b-anchor-font-size',
    defaultValue: '0.875rem',
    description: 'Font size of anchor link text.',
  },
  {
    token: '--b-anchor-line-height',
    defaultValue: '1.5',
    description: 'Line height of anchor link text.',
  },
  {
    token: '--b-anchor-child-indent',
    defaultValue: '1rem',
    description: 'Indentation per nested level.',
  },
  {
    token: '--b-anchor-transition-duration',
    defaultValue: '300ms',
    description: 'Duration of indicator/color transitions.',
  },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Reference table of every <code>--b-anchor-*</code> CSS custom property ' +
          'consumers can override to retheme the component.',
      },
    },
  },
  render: () => ({
    components: { BAnchor },
    setup() {
      const items: BAnchorItem[] = [
        { key: 'dt-1', href: '#dt-section-1', title: 'Section 1' },
        { key: 'dt-2', href: '#dt-section-2', title: 'Section 2' },
        { key: 'dt-3', href: '#dt-section-3', title: 'Section 3' },
      ];
      return { tokens: DESIGN_TOKENS, items };
    },
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BAnchor - Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          All tokens scoped to <code>.b-anchor</code>. Override inline or via a CSS class.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:oklch(96% 0.002 260);">
              <th style="text-align:left;padding:10px 12px;border-bottom:1px solid oklch(85% 0.005 260);">CSS Variable</th>
              <th style="text-align:left;padding:10px 12px;border-bottom:1px solid oklch(85% 0.005 260);">Default</th>
              <th style="text-align:left;padding:10px 12px;border-bottom:1px solid oklch(85% 0.005 260);">Description</th>
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

        <h3 style="margin:32px 0 12px;">Override example</h3>
        <p style="margin:0 0 12px;color:#595959;font-size:13px;">
          Three tokens overridden inline (indicator color, link active color, border color).
        </p>
        <BAnchor
          :items="items"
          style="
            --b-anchor-indicator-color: oklch(50% 0.18 290);
            --b-anchor-link-color-active: oklch(50% 0.18 290);
            --b-anchor-border-color: oklch(85% 0.06 290);
          "
        />
      </div>
    `,
  }),
};
