import { BTabPane, BTabs } from '@/components';
import type { BTabItem } from '@/components/BTabs/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import { defineComponent, h, ref } from 'vue';

const meta = {
  title: 'Navigation/Tabs',
  component: BTabs,
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: 'object',
      description: 'Tab items definition (key, label, optional disabled/closable/keepAlive).',
      table: { category: 'Props' },
    },
    type: {
      control: 'select',
      options: ['line', 'card', 'editable-card'],
      description: 'Visual style of the tabs.',
      table: { category: 'Props', defaultValue: { summary: 'line' } },
    },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Position of the tab bar.',
      table: { category: 'Props', defaultValue: { summary: 'top' } },
    },
    size: {
      control: 'select',
      options: ['small', 'middle', 'large'],
      description: 'Size preset.',
      table: { category: 'Props', defaultValue: { summary: 'middle' } },
    },
    centered: {
      control: 'boolean',
      description: 'Whether to center tabs in the bar.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    animated: {
      control: 'boolean',
      description: 'Whether panel transitions are animated.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    hideAdd: {
      control: 'boolean',
      description: 'Hide add button in editable-card mode.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    destroyOnHidden: {
      control: 'boolean',
      description: 'Destroy inactive tab content.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    keepAlive: {
      control: 'boolean',
      description: 'Keep component state alive when switching tabs.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    tabBarGutter: {
      control: 'number',
      description: 'Gap between tabs (px).',
      table: { category: 'Props' },
    },
    defaultActiveKey: {
      control: 'text',
      description: 'Initial active tab key (uncontrolled mode).',
      table: { category: 'Props' },
    },
    activeKey: {
      control: 'text',
      description: 'Current active tab key (v-model:activeKey).',
      table: { category: 'Two-Way Binding Props' },
    },
    default: {
      description: 'Items mode: scoped slot receiving `{ item }`. Pane mode: contains `<BTabPane>` children.',
      table: { category: 'Slots' },
    },
    leftExtra: {
      description: 'Extra content on the left side of the tab bar.',
      table: { category: 'Slots' },
    },
    rightExtra: {
      description: 'Extra content on the right side of the tab bar.',
      table: { category: 'Slots' },
    },
    onChange: {
      description: 'Emitted when the active tab changes. Payload: `(key)`.',
      table: { category: 'Events' },
    },
    onTabClick: {
      description: 'Emitted when a tab is clicked. Payload: `(key, event)`.',
      table: { category: 'Events' },
    },
    onEdit: {
      description: 'Emitted when a tab is added or removed (editable-card only). Payload: `(key, action)`.',
      table: { category: 'Events' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BTabs</code> component organises content into selectable panels. ' +
          'Supports three visual types (<code>line</code>, <code>card</code>, <code>editable-card</code>), ' +
          'four placements, three sizes, and both controlled / uncontrolled patterns. ' +
          'Tabs may be defined declaratively via the <code>items</code> prop or via <code>&lt;BTabPane&gt;</code> children.',
      },
    },
  },
} satisfies Meta<typeof BTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Sample data
// ─────────────────────────────────────────────
const sampleItems: BTabItem[] = [
  { key: '1', label: 'Tab 1' },
  { key: '2', label: 'Tab 2' },
  { key: '3', label: 'Tab 3' },
];

const manyItems: BTabItem[] = Array.from({ length: 10 }, (_, i) => ({
  key: String(i + 1),
  label: `Tab ${i + 1}`,
}));

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** The default tabs — `type="line"`, top placement, middle size. */
export const Default: Story = {
  args: {
    items: sampleItems,
    type: 'line',
    placement: 'top',
    size: 'middle',
    centered: false,
    animated: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
<BTabs :items="items">
  <template #default="{ item }">
    <div>Content of {{ item.label }}</div>
  </template>
</BTabs>
        `,
      },
    },
  },
  render: (args) => ({
    components: { BTabs },
    setup: () => ({ args }),
    template: `
      <BTabs v-bind="args">
        <template #default="{ item }">
          <div style="padding: 16px;">Content of {{ item.label }}</div>
        </template>
      </BTabs>
    `,
  }),
};

/** `type="card"` — pill-style tab bar useful for content panes. */
export const CardType: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BTabs :items="items" type="card">…</BTabs>`,
      },
    },
  },
  render: () => ({
    components: { BTabs },
    setup: () => ({ items: sampleItems }),
    template: `
      <BTabs :items="items" type="card">
        <template #default="{ item }">
          <div style="padding: 16px;">Content of {{ item.label }}</div>
        </template>
      </BTabs>
    `,
  }),
};

/** `type="editable-card"` — add and close tabs at runtime. */
export const EditableCard: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BTabs
  v-model:active-key="activeKey"
  :items="items"
  type="editable-card"
  @edit="onEdit"
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BTabs },
    setup() {
      const items = ref<BTabItem[]>([
        { key: '1', label: 'Tab 1' },
        { key: '2', label: 'Tab 2' },
        { key: '3', label: 'Tab 3' },
      ]);
      const activeKey = ref('1');
      let nextKey = 4;

      function onEdit(key: string | null, action: 'add' | 'remove') {
        if (action === 'add') {
          const newKey = String(nextKey++);
          items.value = [...items.value, { key: newKey, label: `Tab ${newKey}` }];
          activeKey.value = newKey;
        } else if (key) {
          items.value = items.value.filter((i) => i.key !== key);
          if (activeKey.value === key && items.value.length) {
            activeKey.value = items.value[0].key;
          }
        }
      }

      return { items, activeKey, onEdit };
    },
    template: `
      <BTabs
        v-model:active-key="activeKey"
        :items="items"
        type="editable-card"
        @edit="onEdit"
      >
        <template #default="{ item }">
          <div style="padding: 16px;">Content of {{ item.label }}</div>
        </template>
      </BTabs>
    `,
  }),
};

/** Three sizes side-by-side — `small`, `middle`, `large`. */
export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BTabs :items="items" size="small" />
<BTabs :items="items" size="middle" />
<BTabs :items="items" size="large" />
        `,
      },
    },
  },
  render: () => ({
    components: { BTabs },
    setup: () => ({ items: sampleItems }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 32px;">
        <div>
          <h4 style="margin-bottom: 8px;">Small</h4>
          <BTabs :items="items" size="small">
            <template #default="{ item }">
              <div style="padding: 12px;">{{ item.label }} content</div>
            </template>
          </BTabs>
        </div>
        <div>
          <h4 style="margin-bottom: 8px;">Middle (default)</h4>
          <BTabs :items="items" size="middle">
            <template #default="{ item }">
              <div style="padding: 12px;">{{ item.label }} content</div>
            </template>
          </BTabs>
        </div>
        <div>
          <h4 style="margin-bottom: 8px;">Large</h4>
          <BTabs :items="items" size="large">
            <template #default="{ item }">
              <div style="padding: 12px;">{{ item.label }} content</div>
            </template>
          </BTabs>
        </div>
      </div>
    `,
  }),
};

/** All four placements — top, bottom, left, right. */
export const Placements: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BTabs :items="items" placement="top" />
<BTabs :items="items" placement="bottom" />
<BTabs :items="items" placement="left" />
<BTabs :items="items" placement="right" />
        `,
      },
    },
  },
  render: () => ({
    components: { BTabs },
    setup: () => ({ items: sampleItems }),
    template: `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
        <div>
          <h4 style="margin-bottom: 8px;">Top</h4>
          <BTabs :items="items" placement="top">
            <template #default="{ item }">
              <div style="padding: 12px;">{{ item.label }} content</div>
            </template>
          </BTabs>
        </div>
        <div>
          <h4 style="margin-bottom: 8px;">Bottom</h4>
          <BTabs :items="items" placement="bottom">
            <template #default="{ item }">
              <div style="padding: 12px;">{{ item.label }} content</div>
            </template>
          </BTabs>
        </div>
        <div>
          <h4 style="margin-bottom: 8px;">Left</h4>
          <BTabs :items="items" placement="left">
            <template #default="{ item }">
              <div style="padding: 12px;">{{ item.label }} content</div>
            </template>
          </BTabs>
        </div>
        <div>
          <h4 style="margin-bottom: 8px;">Right</h4>
          <BTabs :items="items" placement="right">
            <template #default="{ item }">
              <div style="padding: 12px;">{{ item.label }} content</div>
            </template>
          </BTabs>
        </div>
      </div>
    `,
  }),
};

/** Center the tab items inside the bar. */
export const Centered: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BTabs :items="items" centered />`,
      },
    },
  },
  render: () => ({
    components: { BTabs },
    setup: () => ({ items: sampleItems }),
    template: `
      <BTabs :items="items" centered>
        <template #default="{ item }">
          <div style="padding: 16px;">{{ item.label }} content</div>
        </template>
      </BTabs>
    `,
  }),
};

/** Items can carry `disabled: true` — they remain rendered but are non-interactive. */
export const DisabledTabs: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BTabs :items="[
  { key: '1', label: 'Active' },
  { key: '2', label: 'Disabled', disabled: true },
  { key: '3', label: 'Another' },
]" />
        `,
      },
    },
  },
  render: () => ({
    components: { BTabs },
    setup: () => ({
      items: [
        { key: '1', label: 'Active' },
        { key: '2', label: 'Disabled', disabled: true },
        { key: '3', label: 'Another' },
      ] satisfies BTabItem[],
    }),
    template: `
      <BTabs :items="items">
        <template #default="{ item }">
          <div style="padding: 16px;">Content of {{ item.label }}</div>
        </template>
      </BTabs>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Use the `#leftExtra` and `#rightExtra` slots for actions in the tab bar. */
export const WithExtraContent: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BTabs :items="items">
  <template #leftExtra>Left</template>
  <template #rightExtra>
    <button>Action</button>
  </template>
</BTabs>
        `,
      },
    },
  },
  render: () => ({
    components: { BTabs },
    setup: () => ({ items: sampleItems }),
    template: `
      <BTabs :items="items">
        <template #leftExtra>
          <span style="font-size: 12px; color: #595959;">Left</span>
        </template>
        <template #rightExtra>
          <button style="font-size: 12px; padding: 4px 8px;">Action</button>
        </template>
        <template #default="{ item }">
          <div style="padding: 16px;">{{ item.label }} content</div>
        </template>
      </BTabs>
    `,
  }),
};

/** When tab labels overflow the container, the bar scrolls horizontally. */
export const ManyTabs: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BTabs :items="manyItems" />`,
      },
    },
  },
  render: () => ({
    components: { BTabs },
    setup: () => ({ items: manyItems }),
    template: `
      <BTabs :items="items">
        <template #default="{ item }">
          <div style="padding: 16px;">Content of {{ item.label }}</div>
        </template>
      </BTabs>
    `,
  }),
};

/** Declarative API: instead of `items`, place `<BTabPane>` children inside `<BTabs>`. */
export const PaneAPI: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use <code>&lt;BTabPane&gt;</code> children when each tab needs its own template. The pane API supports <code>tab-key</code>, <code>tab</code>, <code>disabled</code>, and an optional <code>#tab</code> slot for custom labels.',
      },
      source: {
        code: `
<BTabs>
  <BTabPane tab-key="1" tab="Tab 1">Content 1</BTabPane>
  <BTabPane tab-key="2" tab="Tab 2">Content 2</BTabPane>
  <BTabPane tab-key="3" tab="Tab 3" disabled>Content 3</BTabPane>
</BTabs>
        `,
      },
    },
  },
  render: () => ({
    components: { BTabs, BTabPane },
    template: `
      <BTabs>
        <BTabPane tab-key="1" tab="Tab 1">
          <div style="padding: 16px;">Content of Tab 1 (using BTabPane)</div>
        </BTabPane>
        <BTabPane tab-key="2" tab="Tab 2">
          <div style="padding: 16px;">Content of Tab 2 (using BTabPane)</div>
        </BTabPane>
        <BTabPane tab-key="3" tab="Tab 3" disabled>
          <div style="padding: 16px;">Content of Tab 3 (disabled)</div>
        </BTabPane>
      </BTabs>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const tabs = canvas.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[2]).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(tabs[1]);
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  },
};

/** Add and remove panes dynamically with the pane API. */
export const PaneDynamic: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BTabs v-model:active-key="activeKey">
  <BTabPane v-for="pane in panes" :key="pane.key" :tab-key="pane.key" :tab="pane.tab">
    {{ pane.content }}
  </BTabPane>
</BTabs>
        `,
      },
    },
  },
  render: () => ({
    components: { BTabs, BTabPane },
    setup() {
      const panes = ref([
        { key: '1', tab: 'Tab 1', content: 'Content 1' },
        { key: '2', tab: 'Tab 2', content: 'Content 2' },
        { key: '3', tab: 'Tab 3', content: 'Content 3' },
      ]);
      const activeKey = ref('1');
      let nextKey = 4;

      function addPane() {
        const key = String(nextKey++);
        panes.value = [...panes.value, { key, tab: `Tab ${key}`, content: `Content ${key}` }];
        activeKey.value = key;
      }

      function removePane(key: string) {
        panes.value = panes.value.filter((p) => p.key !== key);
        if (activeKey.value === key && panes.value.length) {
          activeKey.value = panes.value[0].key;
        }
      }

      return { panes, activeKey, addPane, removePane };
    },
    template: `
      <div>
        <div style="margin-bottom: 16px; display: flex; gap: 8px;">
          <button @click="addPane" style="padding: 4px 12px;">Add Tab</button>
          <button @click="removePane(activeKey)" style="padding: 4px 12px;" :disabled="panes.length <= 1">Remove Active</button>
        </div>
        <BTabs v-model:active-key="activeKey">
          <BTabPane v-for="pane in panes" :key="pane.key" :tab-key="pane.key" :tab="pane.tab">
            <div style="padding: 16px;">{{ pane.content }}</div>
          </BTabPane>
        </BTabs>
      </div>
    `,
  }),
};

/** Use the pane's `#tab` slot for icon-decorated labels. */
export const PaneWithCustomLabel: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BTabs>
  <BTabPane tab-key="home">
    <template #tab>🏠 Home</template>
    <div>Home content</div>
  </BTabPane>
  <BTabPane tab-key="settings">
    <template #tab>⚙️ Settings</template>
    <div>Settings content</div>
  </BTabPane>
</BTabs>
        `,
      },
    },
  },
  render: () => ({
    components: { BTabs, BTabPane },
    template: `
      <BTabs>
        <BTabPane tab-key="home">
          <template #tab>
            <span>🏠 Home</span>
          </template>
          <div style="padding: 16px;">Home content with custom icon label</div>
        </BTabPane>
        <BTabPane tab-key="settings">
          <template #tab>
            <span>⚙️ Settings</span>
          </template>
          <div style="padding: 16px;">Settings content with custom icon label</div>
        </BTabPane>
        <BTabPane tab-key="profile">
          <template #tab>
            <span>👤 Profile</span>
          </template>
          <div style="padding: 16px;">Profile content with custom icon label</div>
        </BTabPane>
      </BTabs>
    `,
  }),
};

/**
 * Per-item `keepAlive: true` preserves component state when switching away;
 * `destroyOnHidden: true` resets it. Increment a counter, switch tabs, and
 * see the state behavior diverge.
 */
export const KeepAliveDemo: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Tabs 1 &amp; 2 use <code>keepAlive: true</code> — counter state persists across switches. ' +
          'Tab 3 uses <code>destroyOnHidden: true</code> — state resets every time it becomes inactive.',
      },
      source: {
        code: `
<BTabs
  :items="[
    { key: '1', label: 'Counter A', keepAlive: true },
    { key: '2', label: 'Counter B', keepAlive: true },
    { key: '3', label: 'No KeepAlive', destroyOnHidden: true },
  ]"
  keep-alive
>
  <template #default="{ item }">
    <Counter :label="item.label" />
  </template>
</BTabs>
        `,
      },
    },
  },
  render: () => {
    const Counter = defineComponent({
      name: 'Counter',
      props: { label: String },
      setup(props) {
        const count = ref(0);
        return () =>
          h('div', { style: 'padding: 16px;' }, [
            h('p', {}, `${props.label} - Count: ${count.value}`),
            h(
              'button',
              { onClick: () => count.value++, style: 'margin-top: 8px; padding: 4px 12px;' },
              'Increment',
            ),
            h(
              'p',
              { style: 'margin-top: 8px; color: #666; font-size: 12px;' },
              'Switch tabs and come back - state is preserved with keepAlive!',
            ),
          ]);
      },
    });

    return {
      components: { BTabs, Counter },
      setup() {
        const items: BTabItem[] = [
          { key: '1', label: 'Counter A', keepAlive: true },
          { key: '2', label: 'Counter B', keepAlive: true },
          { key: '3', label: 'No KeepAlive', destroyOnHidden: true },
        ];
        return { items, Counter };
      },
      template: `
        <div>
          <p style="margin-bottom: 16px; color: #666; font-size: 14px;">
            Tabs 1 &amp; 2 have <code>keepAlive: true</code> - their counter state persists when switching.<br/>
            Tab 3 has <code>destroyOnHidden: true</code> - its state resets on every switch.
          </p>
          <BTabs :items="items" keep-alive>
            <template #default="{ item }">
              <Counter :label="item.label" />
            </template>
          </BTabs>
        </div>
      `,
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Tab 1 is active by default - increment counter 3 times
    const tabs = canvas.getAllByRole('tab');
    let incrementBtn = canvas.getByRole('button', { name: 'Increment' });
    await userEvent.click(incrementBtn);
    await userEvent.click(incrementBtn);
    await userEvent.click(incrementBtn);

    const panel = canvas.getByRole('tabpanel');
    expect(panel).toHaveTextContent('Count: 3');

    // Switch to Tab 2, increment once
    await userEvent.click(tabs[1]);
    incrementBtn = canvas.getByRole('button', { name: 'Increment' });
    await userEvent.click(incrementBtn);
    expect(canvas.getByRole('tabpanel')).toHaveTextContent('Count: 1');

    // Switch back to Tab 1 - state should be preserved (keepAlive: true)
    await userEvent.click(tabs[0]);
    expect(canvas.getByRole('tabpanel')).toHaveTextContent('Count: 3');

    // Switch back to Tab 2 - state should also be preserved
    await userEvent.click(tabs[1]);
    expect(canvas.getByRole('tabpanel')).toHaveTextContent('Count: 1');

    // Switch to Tab 3 (destroyOnHidden: true), increment twice
    await userEvent.click(tabs[2]);
    incrementBtn = canvas.getByRole('button', { name: 'Increment' });
    await userEvent.click(incrementBtn);
    await userEvent.click(incrementBtn);
    expect(canvas.getByRole('tabpanel')).toHaveTextContent('Count: 2');

    // Switch away and back - state should reset to 0 (destroyOnHidden)
    await userEvent.click(tabs[0]);
    await userEvent.click(tabs[2]);
    expect(canvas.getByRole('tabpanel')).toHaveTextContent('Count: 0');
  },
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * BTabs renders `role="tablist"` containing `role="tab"` items, each pointing to
 * a `role="tabpanel"`. The active tab carries `aria-selected="true"`; <kbd>ArrowRight</kbd>
 * / <kbd>ArrowLeft</kbd> navigate between tabs.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Verifies <code>role="tablist"</code>, per-tab <code>aria-selected</code>, <code>aria-labelledby</code> linkage to the panel, and <kbd>ArrowRight</kbd>/<kbd>ArrowLeft</kbd> keyboard navigation.',
      },
      source: {
        code: `<BTabs :items="items" />`,
      },
    },
  },
  render: () => ({
    components: { BTabs },
    setup: () => ({ items: sampleItems }),
    template: `
      <BTabs :items="items">
        <template #default="{ item }">
          <div style="padding: 16px;">Content of {{ item.label }}</div>
        </template>
      </BTabs>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify tablist role exists
    const tablist = canvas.getByRole('tablist');
    expect(tablist).toBeInTheDocument();
    expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');

    // Verify tab roles and aria attributes
    const tabs = canvas.getAllByRole('tab');
    expect(tabs).toHaveLength(3);

    // First tab should be selected
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[2]).toHaveAttribute('aria-selected', 'false');

    // Verify tabpanel
    const panel = canvas.getByRole('tabpanel');
    expect(panel).toBeInTheDocument();
    expect(panel.getAttribute('aria-labelledby')).toMatch(/-tab-1$/);

    // Keyboard navigation: ArrowRight moves to next tab
    await userEvent.click(tabs[0]);
    await userEvent.keyboard('{ArrowRight}');

    // After keyboard navigation, second tab should become active
    const updatedTabs = canvas.getAllByRole('tab');
    expect(updatedTabs[1]).toHaveAttribute('aria-selected', 'true');

    // Verify the tabpanel updates
    const updatedPanel = canvas.getByRole('tabpanel');
    expect(updatedPanel.getAttribute('aria-labelledby')).toMatch(/-tab-2$/);

    // Tab to content panel should be possible
    expect(updatedPanel).toHaveAttribute('tabindex', '0');

    // Click a different tab and verify panel content changes
    await userEvent.click(tabs[2]);
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
    const panel3 = canvas.getByRole('tabpanel');
    expect(panel3).toHaveTextContent('Content of Tab 3');
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override `--b-tabs-ink-bar-color`, `--b-tabs-item-selected-color`, and
 * `--b-tabs-horizontal-item-gutter` (plus extras) to retheme tabs.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-tabs-ink-bar-color</code>, <code>--b-tabs-item-selected-color</code>, and <code>--b-tabs-horizontal-item-gutter</code> on <code>.b-tabs</code> (or via inline style).',
      },
      source: {
        code: `
<BTabs
  :items="items"
  style="
    --b-tabs-ink-bar-color: #52c41a;
    --b-tabs-item-selected-color: #722ed1;
    --b-tabs-item-hover-color: #9254de;
    --b-tabs-horizontal-item-gutter: 48px;
  "
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BTabs },
    setup: () => ({ items: sampleItems }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 32px;">
        <div>
          <h4 style="margin-bottom: 8px;">Default theme</h4>
          <BTabs :items="items">
            <template #default="{ item }">
              <div style="padding: 16px;">{{ item.label }} content</div>
            </template>
          </BTabs>
        </div>

        <div>
          <h4 style="margin-bottom: 8px;">Custom theme (green indicator, purple text, large gutter)</h4>
          <BTabs
            :items="items"
            style="
              --b-tabs-ink-bar-color: #52c41a;
              --b-tabs-item-selected-color: #722ed1;
              --b-tabs-item-hover-color: #9254de;
              --b-tabs-horizontal-item-gutter: 48px;
            "
          >
            <template #default="{ item }">
              <div style="padding: 16px;">{{ item.label }} content</div>
            </template>
          </BTabs>
        </div>

        <div>
          <h4 style="margin-bottom: 8px;">Card with custom background and border</h4>
          <BTabs
            :items="items"
            type="card"
            style="
              --b-tabs-card-bg: #f6ffed;
              --b-tabs-border-color: #b7eb8f;
              --b-tabs-card-border-radius: 12px 12px 0 0;
            "
          >
            <template #default="{ item }">
              <div style="padding: 16px;">{{ item.label }} content</div>
            </template>
          </BTabs>
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
  { token: '--b-tabs-ink-bar-color', defaultValue: 'oklch(54.6% 0.245 262.881)', description: 'Color of the active tab indicator bar.' },
  { token: '--b-tabs-item-active-color', defaultValue: 'oklch(35% 0.2 260)', description: 'Text color of active (pressed) tab.' },
  { token: '--b-tabs-item-color', defaultValue: 'oklch(30% 0.02 260 / 88%)', description: 'Default text color of tab items.' },
  { token: '--b-tabs-item-hover-color', defaultValue: 'oklch(54.6% 0.245 262.881)', description: 'Text color of hovered tab.' },
  { token: '--b-tabs-item-selected-color', defaultValue: 'oklch(54.6% 0.245 262.881)', description: 'Text color of selected tab.' },
  { token: '--b-tabs-item-disabled-color', defaultValue: 'oklch(30% 0.02 260 / 25%)', description: 'Text color of disabled tab.' },
  { token: '--b-tabs-title-font-size', defaultValue: '14px', description: 'Font size of tab titles.' },
  { token: '--b-tabs-title-font-size-lg', defaultValue: '16px', description: 'Font size of large tab titles.' },
  { token: '--b-tabs-title-font-size-sm', defaultValue: '14px', description: 'Font size of small tab titles.' },
  { token: '--b-tabs-card-bg', defaultValue: 'oklch(97% 0.003 260 / 50%)', description: 'Background color of card-type tabs.' },
  { token: '--b-tabs-card-height', defaultValue: '40px', description: 'Height of card-type tabs.' },
  { token: '--b-tabs-card-height-lg', defaultValue: '48px', description: 'Height of large card-type tabs.' },
  { token: '--b-tabs-card-height-sm', defaultValue: '32px', description: 'Height of small card-type tabs.' },
  { token: '--b-tabs-card-padding', defaultValue: '8px 16px', description: 'Padding inside card-type tabs.' },
  { token: '--b-tabs-card-padding-lg', defaultValue: '11px 16px', description: 'Padding inside large card-type tabs.' },
  { token: '--b-tabs-card-padding-sm', defaultValue: '4px 8px', description: 'Padding inside small card-type tabs.' },
  { token: '--b-tabs-card-gutter', defaultValue: '2px', description: 'Gap between card-type tabs.' },
  { token: '--b-tabs-card-border-radius', defaultValue: '8px 8px 0 0', description: 'Border radius of card-type tabs.' },
  { token: '--b-tabs-horizontal-item-gutter', defaultValue: '32px', description: 'Gap between horizontal tab items.' },
  { token: '--b-tabs-horizontal-item-padding', defaultValue: '12px 0', description: 'Padding of horizontal tab items.' },
  { token: '--b-tabs-horizontal-item-padding-lg', defaultValue: '16px 0', description: 'Padding of large horizontal tab items.' },
  { token: '--b-tabs-horizontal-item-padding-sm', defaultValue: '8px 0', description: 'Padding of small horizontal tab items.' },
  { token: '--b-tabs-horizontal-margin', defaultValue: '0 0 16px 0', description: 'Margin below horizontal tab bar.' },
  { token: '--b-tabs-vertical-item-margin', defaultValue: '16px 0 0 0', description: 'Margin between vertical tab items.' },
  { token: '--b-tabs-vertical-item-padding', defaultValue: '8px 24px', description: 'Padding of vertical tab items.' },
  { token: '--b-tabs-border-color', defaultValue: 'oklch(80% 0.005 260)', description: 'Border color separating header from content.' },
  { token: '--b-tabs-content-min-height', defaultValue: '0', description: 'Minimum height of the content area.' },
  { token: '--b-tabs-focus-ring', defaultValue: '0 0 0 2px oklch(54.6% 0.245 262.881 / 20%)', description: 'Focus ring style for keyboard navigation.' },
  { token: '--b-tabs-transition-duration', defaultValue: '200ms', description: 'Duration of all transitions and animations.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'All scoped CSS variables exposed by <code>BTabs</code>. Override on <code>.b-tabs</code> or any ancestor selector.',
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
