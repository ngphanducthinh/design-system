import { BCard, BCardGrid, BCardMeta } from '@/components';
import { BCardSize, BCardType } from '@/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'DataDisplay/Card',
  component: BCard,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Card title text.',
      table: { category: 'Props' },
    },
    extra: {
      control: 'text',
      description: 'Content in the top-right corner.',
      table: { category: 'Props' },
    },
    bordered: {
      control: 'boolean',
      description: 'Whether to show the card border.',
      table: { defaultValue: { summary: 'true' }, category: 'Props' },
    },
    hoverable: {
      control: 'boolean',
      description: 'Lift the card on hover.',
      table: { defaultValue: { summary: 'false' }, category: 'Props' },
    },
    loading: {
      control: 'boolean',
      description: 'Show loading placeholder.',
      table: { defaultValue: { summary: 'false' }, category: 'Props' },
    },
    size: {
      control: 'select',
      options: Object.values(BCardSize),
      description: 'Size of the card.',
      table: { defaultValue: { summary: BCardSize.Default }, category: 'Props' },
    },
    type: {
      control: 'select',
      options: Object.values(BCardType),
      description: 'Card type: default or inner.',
      table: { defaultValue: { summary: BCardType.Default }, category: 'Props' },
    },
    activeTabKey: {
      control: 'text',
      description: 'Active tab key (controlled).',
      table: { category: 'Two-Way Binding Props' },
    },
    defaultActiveTabKey: {
      control: 'text',
      description: 'Default active tab key (uncontrolled).',
      table: { category: 'Props' },
    },
    tabBarExtraContent: {
      control: 'text',
      description: 'Extra content in the tab bar.',
      table: { category: 'Props' },
    },
    onTabChange: {
      table: { category: 'Events' },
    },
    'onUpdate:activeTabKey': {
      table: { category: 'Events' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BCard</code> component is a simple rectangular container for grouping related content.<br><br>' +
          'Supports <strong>title</strong>, <strong>extra</strong> header areas, <strong>cover</strong> images, <strong>actions</strong>, ' +
          '<strong>tabs</strong>, <strong>loading</strong> skeleton, <strong>hoverable</strong>, <strong>bordered</strong>, and <strong>inner</strong> card types.<br>' +
          'Sub-components: <code>BCardMeta</code> (avatar + title + description) and <code>BCardGrid</code> (grid layout).<br>' +
          'Theming via <code>--b-card-*</code> CSS custom properties. Respects <code>prefers-reduced-motion</code>.',
      },
    },
  },
} satisfies Meta<typeof BCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// 1. Playground (all controls)
// ─────────────────────────────────────────────
/**
 * Interactive playground — tweak all props via the Controls panel.
 */
export const Playground: Story = {
  args: {
    title: 'Card Title',
    extra: 'More',
    bordered: true,
    hoverable: false,
    loading: false,
    size: BCardSize.Default,
    type: BCardType.Default,
  },
  render: (args) => ({
    components: { BCard },
    setup() {
      return { args };
    },
    template: `
      <div style="max-width:400px;">
        <BCard v-bind="args">
          <template #extra>{{ args.extra }}</template>
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </BCard>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 2. Basic card
// ─────────────────────────────────────────────
/**
 * Simple card with title, extra, and body content.
 */
export const BasicCard: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BCard title="Default Card" extra="More">
  <p>Card content</p>
</BCard>
        `,
      },
    },
  },
  render: () => ({
    components: { BCard },
    template: `
      <div style="display:flex;gap:1.5rem;flex-wrap:wrap;">
        <BCard data-testid="basic-card" title="Default Card" style="width:300px;">
          <template #extra><a href="#">More</a></template>
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </BCard>
        <BCard title="No Border" :bordered="false" style="width:300px;">
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </BCard>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId('basic-card');
    expect(card.querySelector('.b-card__head-title')?.textContent).toBe('Default Card');
    expect(card.querySelector('.b-card__body')).toBeTruthy();
    expect(card.classList.contains('b-card--bordered')).toBe(true);
  },
};

// ─────────────────────────────────────────────
// 3. Hoverable
// ─────────────────────────────────────────────
/**
 * Cards with hover elevation effect.
 */
export const Hoverable: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BCard hoverable title="Hoverable Card">
  <p>Hover over me!</p>
</BCard>
        `,
      },
    },
  },
  render: () => ({
    components: { BCard },
    template: `
      <div style="display:flex;gap:1.5rem;">
        <BCard hoverable title="Hoverable" style="width:240px;">
          <p>Hover over me!</p>
        </BCard>
        <BCard hoverable style="width:240px;">
          <template #cover>
            <img src="https://picsum.photos/seed/card/240/160" alt="Sample cover" style="display:block;width:100%;height:160px;object-fit:cover;" />
          </template>
          <p>With cover image</p>
        </BCard>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 4. Loading state
// ─────────────────────────────────────────────
/**
 * Skeleton loading placeholder.
 */
export const Loading: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BCard loading title="Loading Card">
  <p>This is hidden while loading</p>
</BCard>
        `,
      },
    },
  },
  render: () => ({
    components: { BCard },
    template: `
      <div style="display:flex;gap:1.5rem;">
        <BCard data-testid="loading-card" loading title="Loading Card" style="width:300px;">
          <p>This content is hidden</p>
        </BCard>
        <BCard title="Loaded Card" style="width:300px;">
          <p>This content is visible</p>
        </BCard>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId('loading-card');
    const loading = card.querySelector('.b-card__loading');
    expect(loading).toBeTruthy();
    expect(loading?.getAttribute('aria-busy')).toBe('true');
    expect(card.querySelector('.b-card__loading-line')).toBeTruthy();
  },
};

// ─────────────────────────────────────────────
// 5. Inner card & sizes
// ─────────────────────────────────────────────
/**
 * Inner card type and size variants.
 */
export const InnerAndSizes: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BCard type="inner" title="Inner Card">
  <p>Inner content</p>
</BCard>
<BCard size="small" title="Small Card">
  <p>Small content</p>
</BCard>
        `,
      },
    },
  },
  render: () => ({
    components: { BCard },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem;max-width:400px;">
        <BCard title="Default Size">
          <p>Default padding and header height</p>
        </BCard>
        <BCard size="small" title="Small Size">
          <p>Compact padding and header height</p>
        </BCard>
        <BCard type="inner" title="Inner Card">
          <p>Shaded background for nesting</p>
        </BCard>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 6. Cover, actions, and meta
// ─────────────────────────────────────────────
/**
 * Card with cover image, actions, and BCardMeta.
 */
export const CoverAndMeta: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BCard>
  <template #cover>
    <img src="..." alt="Cover" />
  </template>
  <BCardMeta title="Card Title" description="Card description">
    <template #avatar>
      <img src="..." />
    </template>
  </BCardMeta>
  <template #actions>
    <button>Edit</button>
    <button>Share</button>
  </template>
</BCard>
        `,
      },
    },
  },
  render: () => ({
    components: { BCard, BCardMeta },
    template: `
      <div style="display:flex;gap:1.5rem;flex-wrap:wrap;">
        <BCard data-testid="meta-card" style="width:300px;">
          <template #cover>
            <img src="https://picsum.photos/seed/card-meta/300/200" alt="Sample cover" />
          </template>
          <BCardMeta
            title="Europe Street Beat"
            description="www.instagram.com"
          >
            <template #avatar>
              <img
                src="https://picsum.photos/seed/avatar/40/40"
                alt="User avatar"
                style="width:40px;height:40px;border-radius:50%;"
              />
            </template>
          </BCardMeta>
          <template #actions>
            <span style="cursor:pointer;">Edit</span>
            <span style="cursor:pointer;">Share</span>
            <span style="cursor:pointer;">More</span>
          </template>
        </BCard>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId('meta-card');
    expect(card.querySelector('.b-card__cover')).toBeTruthy();
    expect(card.querySelector('.b-card-meta')).toBeTruthy();
    expect(card.querySelector('.b-card-meta__title')?.textContent).toBe('Europe Street Beat');
    expect(card.querySelector('.b-card-meta__description')?.textContent).toBe('www.instagram.com');
    expect(card.querySelector('.b-card-meta__avatar')).toBeTruthy();
    expect(card.querySelector('.b-card__actions')).toBeTruthy();
    expect(card.querySelector('.b-card__actions')?.getAttribute('role')).toBe('group');
  },
};

// ─────────────────────────────────────────────
// 7. Tabs
// ─────────────────────────────────────────────
/**
 * Card with tab navigation.
 */
export const WithTabs: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BCard
  title="Tabs Card"
  :tabList="[{key:'tab1',tab:'Tab 1'},{key:'tab2',tab:'Tab 2'}]"
  @tabChange="onTabChange"
>
  <p>Content for {{ activeTab }}</p>
</BCard>
        `,
      },
    },
  },
  render: () => ({
    components: { BCard },
    setup() {
      const tabList = [
        { key: 'article', tab: 'Article' },
        { key: 'app', tab: 'App' },
        { key: 'project', tab: 'Project' },
      ];
      return { tabList };
    },
    template: `
      <div style="max-width:500px;">
        <BCard
          data-testid="tab-card"
          title="Card with Tabs"
          :tabList="tabList"
          defaultActiveTabKey="article"
          tabBarExtraContent="Extra"
        >
          <p>Content for the selected tab.</p>
        </BCard>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId('tab-card');

    // Verify tablist role
    const tablist = card.querySelector('[role="tablist"]');
    expect(tablist).toBeTruthy();

    // Verify tabs
    const tabs = card.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(3);

    // First tab is active
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].classList.contains('b-card__tab--active')).toBe(true);

    // Tabpanel exists
    const panel = card.querySelector('[role="tabpanel"]');
    expect(panel).toBeTruthy();

    // Click second tab
    await userEvent.click(tabs[1]);
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].classList.contains('b-card__tab--active')).toBe(true);
    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
  },
};

// ─────────────────────────────────────────────
// 8. Grid layout
// ─────────────────────────────────────────────
/**
 * Card with grid items using BCardGrid.
 */
export const GridLayout: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BCard title="Grid Card">
  <BCardGrid v-for="i in 6" :key="i" hoverable>
    Content {{ i }}
  </BCardGrid>
</BCard>
        `,
      },
    },
  },
  render: () => ({
    components: { BCard, BCardGrid },
    template: `
      <div style="max-width:600px;">
        <BCard title="Grid Card" data-testid="grid-card">
          <BCardGrid v-for="i in 6" :key="i" hoverable style="text-align:center;" :aria-label="'Grid item ' + i">
            Content {{ i }}
          </BCardGrid>
          <div style="clear:both;" />
        </BCard>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId('grid-card');
    const grids = card.querySelectorAll('.b-card-grid');
    expect(grids.length).toBe(6);
    expect(grids[0].classList.contains('b-card-grid--hoverable')).toBe(true);
  },
};

// ─────────────────────────────────────────────
// 9. Accessibility story
// ─────────────────────────────────────────────
/**
 * Accessibility features:
 * - Tab navigation with role="tablist", role="tab", role="tabpanel"
 * - aria-selected, aria-controls, aria-labelledby
 * - Keyboard navigation (Arrow keys, Home, End)
 * - Loading state with aria-busy
 * - Actions with role="group"
 */
export const Accessibility: Story = {
  name: 'Accessibility (roles & keyboard)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Card tabs use proper ARIA roles: `role="tablist"`, `role="tab"`, `role="tabpanel"`. ' +
          'Active tab has `aria-selected="true"`, inactive tabs are focusable via roving tabindex. ' +
          'Keyboard: Arrow keys to move between tabs, Home/End for first/last. ' +
          'Loading state uses `aria-busy="true"`. Actions area has `role="group"`.',
      },
    },
  },
  render: () => ({
    components: { BCard },
    setup() {
      const tabList = [
        { key: 'overview', tab: 'Overview' },
        { key: 'details', tab: 'Details' },
        { key: 'settings', tab: 'Settings', disabled: true },
      ];
      return { tabList };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem;max-width:500px;">
        <div>
          <h4 style="margin:0 0 0.5rem;">Tabs (tablist/tab/tabpanel, keyboard nav)</h4>
          <BCard
            data-testid="a11y-tabs"
            title="Accessible Tabs"
            :tabList="tabList"
          >
            <p>Tab content here. Use Arrow keys to navigate tabs.</p>
          </BCard>
        </div>
        <div>
          <h4 style="margin:0 0 0.5rem;">Loading (aria-busy)</h4>
          <BCard data-testid="a11y-loading" loading title="Loading Card">
            <p>Hidden</p>
          </BCard>
        </div>
        <div>
          <h4 style="margin:0 0 0.5rem;">Actions (role="group")</h4>
          <BCard data-testid="a11y-actions" title="Actions Card">
            <p>Card with actions</p>
            <template #actions>
              <button>Edit</button>
              <button>Delete</button>
            </template>
          </BCard>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Tabs: roles and ARIA
    const tabCard = canvas.getByTestId('a11y-tabs');
    const tablist = tabCard.querySelector('[role="tablist"]');
    expect(tablist).toBeTruthy();
    expect(tablist?.getAttribute('aria-label')).toBe('Accessible Tabs tabs');

    const tabs = tabCard.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(3);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('tabindex')).toBe('0');
    expect(tabs[1].getAttribute('tabindex')).toBe('-1');

    // Disabled tab
    expect(tabs[2].hasAttribute('disabled')).toBe(true);

    // Tabpanel
    const panel = tabCard.querySelector('[role="tabpanel"]');
    expect(panel).toBeTruthy();
    expect(panel?.getAttribute('aria-labelledby')).toBe(tabs[0].id);

    // Keyboard: ArrowRight
    await userEvent.click(tabs[0]);
    await userEvent.keyboard('{ArrowRight}');
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');

    // Loading: aria-busy
    const loadingCard = canvas.getByTestId('a11y-loading');
    const loading = loadingCard.querySelector('.b-card__loading');
    expect(loading?.getAttribute('aria-busy')).toBe('true');

    // Actions: role group
    const actionsCard = canvas.getByTestId('a11y-actions');
    const actions = actionsCard.querySelector('.b-card__actions');
    expect(actions?.getAttribute('role')).toBe('group');
    expect(actions?.getAttribute('aria-label')).toBe('Card actions');
  },
};

// ─────────────────────────────────────────────
// 10. Theming story (CSS vars)
// ─────────────────────────────────────────────
/**
 * Override `--b-card-*` CSS custom properties to customize appearance.
 */
export const Theming: Story = {
  name: 'Theming (CSS vars)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Override `--b-card-*` CSS custom properties on the card root to customise appearance ' +
          'without touching the component source.',
      },
      source: {
        code: `
<style>
.custom-card {
  --b-card-bg: #f0f5ff;
  --b-card-border-color: #adc6ff;
  --b-card-head-color: #1d39c4;
  --b-card-border-radius: 16px;
}
</style>

<BCard class="custom-card" title="Custom Theme">
  <p>Themed card content</p>
</BCard>
        `,
      },
    },
  },
  render: () => ({
    components: { BCard },
    template: `
      <div style="display:flex;gap:1.5rem;flex-wrap:wrap;">
        <BCard title="Default" style="width:240px;">
          <p>Default theme</p>
        </BCard>
        <BCard
          title="Blue Theme"
          style="width:240px;--b-card-bg:#f0f5ff;--b-card-border-color:#adc6ff;--b-card-head-color:#1d39c4;--b-card-head-border-color:#adc6ff;"
        >
          <p>Custom blue background</p>
        </BCard>
        <BCard
          title="Rounded"
          style="width:240px;--b-card-border-radius:20px;--b-card-shadow:0 8px 24px oklch(0% 0 0 / 8%);"
          :bordered="false"
        >
          <p>Large border-radius</p>
        </BCard>
        <BCard
          title="Compact"
          style="width:240px;--b-card-body-padding:12px;--b-card-head-padding:8px 12px;--b-card-head-min-height:36px;"
        >
          <p>Reduced padding</p>
        </BCard>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 11. Interaction tests
// ─────────────────────────────────────────────
/**
 * Automated interaction tests: tab switching, keyboard nav, loading.
 */
export const InteractionTests: Story = {
  name: 'Interaction – tabs & keyboard',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Automated play function: verifies tab switching, keyboard navigation, and focus management.',
      },
    },
  },
  render: () => ({
    components: { BCard },
    setup() {
      const tabList = [
        { key: 'first', tab: 'First' },
        { key: 'second', tab: 'Second' },
        { key: 'third', tab: 'Third' },
      ];
      return { tabList };
    },
    template: `
      <div style="max-width:500px;">
        <BCard
          data-testid="interact-card"
          title="Interactive Card"
          :tabList="tabList"
        >
          <p>Content area</p>
        </BCard>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId('interact-card');
    const tabs = card.querySelectorAll('[role="tab"]');

    // Initial state: first tab active
    expect(tabs[0].classList.contains('b-card__tab--active')).toBe(true);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');

    // Click second tab
    await userEvent.click(tabs[1]);
    expect(tabs[1].classList.contains('b-card__tab--active')).toBe(true);
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].classList.contains('b-card__tab--active')).toBe(false);

    // Keyboard: click second tab then ArrowRight to third
    await userEvent.click(tabs[1]);
    await userEvent.keyboard('{ArrowRight}');
    expect(tabs[2].classList.contains('b-card__tab--active')).toBe(true);

    // Keyboard: ArrowRight wraps to first
    await userEvent.keyboard('{ArrowRight}');
    expect(tabs[0].classList.contains('b-card__tab--active')).toBe(true);

    // Keyboard: End goes to last
    await userEvent.keyboard('{End}');
    expect(tabs[2].classList.contains('b-card__tab--active')).toBe(true);

    // Keyboard: Home goes to first
    await userEvent.keyboard('{Home}');
    expect(tabs[0].classList.contains('b-card__tab--active')).toBe(true);
  },
};
