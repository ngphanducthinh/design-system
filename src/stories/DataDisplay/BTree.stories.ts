import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';
import BTree from '../../components/BTree/BTree.vue';
import type { BTreeNodeData, BTreeNodeKey } from '../../components/BTree/types';

// ─── Sample data ──────────────────────────────────────────────────────────────

const sampleData: BTreeNodeData[] = [
  {
    key: '0-0',
    title: 'Parent 0-0',
    children: [
      {
        key: '0-0-0',
        title: 'Child 0-0-0',
        children: [
          { key: '0-0-0-0', title: 'Leaf 0-0-0-0' },
          { key: '0-0-0-1', title: 'Leaf 0-0-0-1' },
        ],
      },
      {
        key: '0-0-1',
        title: 'Child 0-0-1',
        children: [
          { key: '0-0-1-0', title: 'Leaf 0-0-1-0' },
          { key: '0-0-1-1', title: 'Leaf 0-0-1-1', disabled: true },
        ],
      },
    ],
  },
  {
    key: '0-1',
    title: 'Parent 0-1',
    children: [
      { key: '0-1-0', title: 'Child 0-1-0' },
      { key: '0-1-1', title: 'Child 0-1-1' },
    ],
  },
  { key: '0-2', title: 'Leaf 0-2', isLeaf: true },
];

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Data Display/Tree',
  component: BTree,
  tags: ['autodocs'],
  argTypes: {
    // ── Two-Way Binding Props ──────────────────────────────────────────────
    checkedKeys: {
      control: 'object',
      table: {
        category: 'Two-Way Binding Props',
        type: { summary: 'BTreeNodeKey[] | BTreeCheckedKeys' },
      },
    },
    selectedKeys: {
      control: 'object',
      table: {
        category: 'Two-Way Binding Props',
        type: { summary: 'BTreeNodeKey[]' },
      },
    },
    expandedKeys: {
      control: 'object',
      table: {
        category: 'Two-Way Binding Props',
        type: { summary: 'BTreeNodeKey[]' },
      },
    },
    loadedKeys: {
      control: 'object',
      table: {
        category: 'Two-Way Binding Props',
        type: { summary: 'BTreeNodeKey[]' },
      },
    },
    // ── Props ──────────────────────────────────────────────────────────────
    checkable: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    checkStrictly: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    multiple: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    selectable: {
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    disabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    showIcon: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    showLine: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    blockNode: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    draggable: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    defaultExpandAll: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    directory: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    expandAction: {
      control: 'select',
      options: ['click', 'doubleClick', false],
      table: { defaultValue: { summary: 'click' } },
    },
    height: {
      control: { type: 'number', min: 100, max: 600, step: 50 },
      table: { defaultValue: { summary: 'undefined' } },
    },
    treeData: {
      control: 'object',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A hierarchical list structure component, re-implementing Ant Design Tree with Vue 3 idiomatic patterns, full keyboard navigation, and ARIA tree roles.',
      },
    },
    a11y: { test: 'error' },
  },
} satisfies Meta<typeof BTree>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── 1. Playground ────────────────────────────────────────────────────────────

export const Playground: Story = {
  args: {
    treeData: sampleData,
    defaultExpandAll: true,
    checkable: false,
    showLine: false,
    showIcon: false,
    blockNode: false,
    disabled: false,
    multiple: false,
  },
  render: (args) => ({
    components: { BTree },
    setup() {
      return { args };
    },
    template: `<BTree v-bind="args" style="max-width: 320px;" />`,
  }),
};

// ─── 2. Basic ─────────────────────────────────────────────────────────────────

export const Basic: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { BTree },
    setup() {
      return { data: sampleData };
    },
    template: `
      <BTree
        :tree-data="data"
        :default-expanded-keys="['0-0', '0-0-0']"
        :default-selected-keys="['0-0-0-0']"
        style="max-width: 320px;"
      />
    `,
  }),
};

// ─── 3. Checkable ─────────────────────────────────────────────────────────────

export const Checkable: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { BTree },
    setup() {
      return { data: sampleData };
    },
    template: `
      <BTree
        :tree-data="data"
        checkable
        :default-expanded-keys="['0-0']"
        :default-checked-keys="['0-0-0-0', '0-0-0-1']"
        style="max-width: 320px;"
      />
    `,
  }),
};

// ─── 4. Show Lines ────────────────────────────────────────────────────────────

export const ShowLines: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { BTree },
    setup() {
      return { data: sampleData };
    },
    template: `
      <BTree
        :tree-data="data"
        show-line
        :default-expanded-keys="['0-0', '0-0-0']"
        style="max-width: 320px;"
      />
    `,
  }),
};

// ─── 5. Directory ─────────────────────────────────────────────────────────────

export const Directory: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { BTree },
    setup() {
      return { data: sampleData };
    },
    template: `
      <div style="display: flex; gap: 2rem;">
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #767676">expandAction: click (default)</p>
          <BTree :tree-data="data" directory expand-action="click" style="max-width: 240px;" />
        </div>
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #767676">expandAction: doubleClick</p>
          <BTree :tree-data="data" directory expand-action="doubleClick" style="max-width: 240px;" />
        </div>
      </div>
    `,
  }),
};

// ─── 6. Multiple Selection ────────────────────────────────────────────────────

export const MultipleSelection: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { BTree },
    setup() {
      return { data: sampleData };
    },
    template: `
      <BTree
        :tree-data="data"
        multiple
        :default-expanded-keys="['0-0']"
        style="max-width: 320px;"
      />
    `,
  }),
};

// ─── 7. Disabled ──────────────────────────────────────────────────────────────

export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { BTree },
    setup() {
      return { data: sampleData };
    },
    template: `
      <div style="display: flex; gap: 2rem;">
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #767676">Entire tree disabled</p>
          <BTree :tree-data="data" disabled :default-expanded-keys="['0-0']" style="max-width: 240px;" />
        </div>
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #767676">Individual node disabled</p>
          <BTree :tree-data="data" :default-expanded-keys="['0-0', '0-0-1']" style="max-width: 240px;" />
        </div>
      </div>
    `,
  }),
};

// ─── 8. Block Node ────────────────────────────────────────────────────────────

export const BlockNode: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { BTree },
    setup() {
      return { data: sampleData };
    },
    template: `
      <BTree
        :tree-data="data"
        block-node
        :default-expanded-keys="['0-0']"
        style="max-width: 320px;"
      />
    `,
  }),
};

// ─── 9. Controlled (v-model) ──────────────────────────────────────────────────

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { BTree },
    setup() {
      const expandedKeys = ref<BTreeNodeKey[]>(['0-0']);
      const selectedKeys = ref<BTreeNodeKey[]>([]);
      const checkedKeys = ref<BTreeNodeKey[]>([]);

      return { expandedKeys, selectedKeys, checkedKeys, data: sampleData };
    },
    template: `
      <div>
        <div style="margin-bottom: 12px; font-size: 12px; color: #767676;">
          <div>Selected: {{ selectedKeys.join(', ') || 'none' }}</div>
          <div>Expanded: {{ expandedKeys.join(', ') }}</div>
          <div>Checked: {{ checkedKeys.join(', ') || 'none' }}</div>
        </div>
        <BTree
          :tree-data="data"
          checkable
          v-model:expanded-keys="expandedKeys"
          v-model:selected-keys="selectedKeys"
          v-model:checked-keys="checkedKeys"
          style="max-width: 320px;"
        />
      </div>
    `,
  }),
};

// ─── 10. Async Loading ────────────────────────────────────────────────────────

export const AsyncLoading: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { BTree },
    setup() {
      const treeData = ref<BTreeNodeData[]>([
        { key: 'node-1', title: 'Expand to load children' },
        { key: 'node-2', title: 'Another async parent' },
      ]);

      async function loadData(node: BTreeNodeData) {
        await new Promise<void>((resolve) => setTimeout(resolve, 1000));
        const newChildren: BTreeNodeData[] = [
          { key: `${node.key}-1`, title: `${node.title} – Child 1`, isLeaf: true },
          { key: `${node.key}-2`, title: `${node.title} – Child 2`, isLeaf: true },
        ];
        treeData.value = treeData.value.map((n) =>
          n.key === node.key ? { ...n, children: newChildren } : n,
        );
      }

      return { treeData, loadData };
    },
    template: `
      <BTree
        :tree-data="treeData"
        :load-data="loadData"
        style="max-width: 320px;"
      />
    `,
  }),
};

// ─── 11. Custom Title Slot ────────────────────────────────────────────────────

export const CustomTitleSlot: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { BTree },
    setup() {
      return { data: sampleData };
    },
    template: `
      <BTree
        :tree-data="data"
        :default-expanded-keys="['0-0']"
        style="max-width: 320px;"
      >
        <template #title="{ node }">
          <span>
            {{ node.title }}
            <span
              v-if="node.isLeaf"
              style="margin-left: 4px; font-size: 10px; color: #595959; background: #f0f0f0; padding: 1px 4px; border-radius: 3px;"
            >leaf</span>
          </span>
        </template>
      </BTree>
    `,
  }),
};

// ─── 12. Accessibility ────────────────────────────────────────────────────────

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { BTree },
    setup() {
      return { data: sampleData };
    },
    template: `
      <div>
        <p style="margin-bottom: 12px; font-size: 13px;">
          Use <kbd>Up</kbd> <kbd>Down</kbd> to navigate,
          <kbd>Right</kbd> to expand,
          <kbd>Left</kbd> to collapse,
          <kbd>Enter</kbd>/<kbd>Space</kbd> to select,
          <kbd>Home</kbd>/<kbd>End</kbd> to jump.
        </p>
        <BTree
          :tree-data="data"
          checkable
          :default-expanded-keys="['0-0']"
          style="max-width: 320px;"
          aria-label="File tree"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tree = canvas.getByRole('tree');

    // 1. Role checks
    expect(tree).toBeDefined();
    const items = canvas.getAllByRole('treeitem');
    expect(items.length).toBeGreaterThan(0);

    // 2. ARIA level on root items
    const rootItems = items.filter((el) => el.getAttribute('aria-level') === '1');
    expect(rootItems.length).toBeGreaterThan(0);

    // 3. aria-expanded on parent nodes
    const parent = items.find((el) => el.getAttribute('aria-expanded') !== null)!;
    expect(parent).toBeDefined();

    // 4. Checkboxes have correct role and aria-checked
    const checkboxes = canvas.getAllByRole('checkbox');
    checkboxes.forEach((cb) => {
      const checked = cb.getAttribute('aria-checked');
      expect(['true', 'false', 'mixed']).toContain(checked);
    });

    // 5. Roving tabindex: exactly one item has tabindex=0
    const tabItems = items.filter((el) => el.getAttribute('tabindex') === '0');
    expect(tabItems).toHaveLength(1);

    // 6. Keyboard: ArrowDown moves focus
    await userEvent.click(tree);
    await userEvent.keyboard('{ArrowDown}');

    // 7. Switcher icons are aria-hidden
    const switchers = canvasElement.querySelectorAll('.b-tree__switcher');
    switchers.forEach((s) => {
      expect(s.getAttribute('aria-hidden')).toBe('true');
    });
  },
};

// ─── 13. Theming (CSS vars override) ─────────────────────────────────────────

export const Theming: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Override CSS custom properties directly on the component to theme it without global styles.',
      },
    },
  },
  render: () => ({
    components: { BTree },
    setup() {
      return { data: sampleData };
    },
    template: `
      <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #767676">Default</p>
          <BTree :tree-data="data" :default-expanded-keys="['0-0']" style="max-width: 240px;" />
        </div>

        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #767676">Purple theme</p>
          <BTree
            :tree-data="data"
            :default-expanded-keys="['0-0']"
            :style="{
              '--b-tree-node-selected-bg': 'oklch(90% 0.08 300)',
              '--b-tree-node-selected-color': 'oklch(25% 0.1 300)',
              '--b-tree-checkbox-checked-bg': 'oklch(55% 0.22 300)',
              '--b-tree-checkbox-checked-border': 'oklch(55% 0.22 300)',
              '--b-tree-title-filtered-color': 'oklch(55% 0.22 300)',
            }"
            style="max-width: 240px;"
          />
        </div>

        <div>
          <p style="margin-bottom: 8px; font-size: 12px; color: #767676">Compact (custom indent + height)</p>
          <BTree
            :tree-data="data"
            :default-expanded-keys="['0-0']"
            :style="{
              '--b-tree-node-height': '18px',
              '--b-tree-indent-size': '16px',
              '--b-tree-font-size': '12px',
            }"
            style="max-width: 240px;"
          />
        </div>
      </div>
    `,
  }),
};

// ─── 14. Interaction tests ────────────────────────────────────────────────────

export const InteractionExpand: Story = {
  name: 'Interaction: Expand and Collapse',
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { BTree },
    setup() {
      return { data: sampleData };
    },
    template: `<BTree :tree-data="data" style="max-width: 320px;" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Initial: 3 top-level nodes
    let items = canvas.getAllByRole('treeitem');
    expect(items).toHaveLength(3);

    // Click switcher to expand Parent 0-0
    const firstSwitcher = canvasElement.querySelector('.b-tree__switcher')!;
    await userEvent.click(firstSwitcher);
    items = canvas.getAllByRole('treeitem');
    expect(items.length).toBeGreaterThan(3);

    // Click again to collapse
    await userEvent.click(firstSwitcher);
    items = canvas.getAllByRole('treeitem');
    expect(items).toHaveLength(3);
  },
};

export const InteractionSelect: Story = {
  name: 'Interaction: Node Selection',
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { BTree },
    setup() {
      return { data: sampleData };
    },
    template: `<BTree :tree-data="data" style="max-width: 320px;" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const leafNode = canvas.getByText('Leaf 0-2');
    await userEvent.click(leafNode);

    const nodeItem = leafNode.closest('[role="treeitem"]')!;
    expect(nodeItem.classList.contains('b-tree__node--selected')).toBe(true);
    expect(nodeItem.getAttribute('aria-selected')).toBe('true');
  },
};

export const InteractionCheckbox: Story = {
  name: 'Interaction: Checkboxes',
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { BTree },
    setup() {
      return { data: sampleData };
    },
    template: `<BTree :tree-data="data" checkable :default-expanded-keys="['0-0', '0-0-0']" style="max-width: 320px;" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check Leaf 0-0-0-0
    const leaf = canvas.getByText('Leaf 0-0-0-0');
    const nodeItem = leaf.closest('[role="treeitem"]')!;
    const checkbox = nodeItem.querySelector('[role="checkbox"]')!;

    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    await userEvent.click(checkbox);
    expect(checkbox.getAttribute('aria-checked')).toBe('true');

    // Parent should become indeterminate (only one of two leaves checked)
    const parent000 = canvas.getByText('Child 0-0-0').closest('[role="treeitem"]')!;
    const parentCheckbox = parent000.querySelector('[role="checkbox"]')!;
    expect(parentCheckbox.getAttribute('aria-checked')).toBe('mixed');
  },
};

export const InteractionKeyboard: Story = {
  name: 'Interaction: Keyboard Navigation',
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { BTree },
    setup() {
      return { data: sampleData };
    },
    template: `<BTree :tree-data="data" style="max-width: 320px;" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tree = canvas.getByRole('tree');

    // Focus the first treeitem directly so keyboard events are routed to it
    const initialItems = canvas.getAllByRole('treeitem');
    await userEvent.click(initialItems[0]);

    // ArrowDown: focus moves to second node
    await userEvent.keyboard('{ArrowDown}');
    const afterDown = canvas.getAllByRole('treeitem');
    expect(afterDown[1].getAttribute('tabindex')).toBe('0');

    // ArrowRight: move back up then expand the first node
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{ArrowRight}');
    const afterExpand = canvas.getAllByRole('treeitem');
    expect(afterExpand.length).toBeGreaterThan(3);

    // End: jump to last visible node
    await userEvent.keyboard('{End}');
    const finalItems = canvas.getAllByRole('treeitem');
    const lastItem = finalItems[finalItems.length - 1];
    expect(lastItem.getAttribute('tabindex')).toBe('0');

    // Sanity: tree still mounted
    expect(tree).toBeInTheDocument();
  },
};

// ─── 15. Draggable ───────────────────────────────────────────────────────────

export const Draggable: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Drag a node and drop it onto another to reorder the tree. ' +
          'The `drop` event provides `dragNode`, `node` (drop target), `dropPosition`, and `dropToGap`.',
      },
    },
  },
  render: () => ({
    components: { BTree },
    setup() {
      const treeData = ref<BTreeNodeData[]>([
        {
          key: 'A',
          title: 'Folder A',
          children: [
            { key: 'A-1', title: 'File A-1', isLeaf: true },
            { key: 'A-2', title: 'File A-2', isLeaf: true },
          ],
        },
        {
          key: 'B',
          title: 'Folder B',
          children: [
            { key: 'B-1', title: 'File B-1', isLeaf: true },
            { key: 'B-2', title: 'File B-2', isLeaf: true },
          ],
        },
        { key: 'C', title: 'Loose File C', isLeaf: true },
      ]);

      const lastDrop = ref<string | null>(null);

      function removeNode(
        nodes: BTreeNodeData[],
        key: BTreeNodeKey,
      ): { list: BTreeNodeData[]; removed: BTreeNodeData | null } {
        let removed: BTreeNodeData | null = null;
        const list = nodes
          .filter((n) => {
            if (n.key === key) {
              removed = n;
              return false;
            }
            return true;
          })
          .map((n) => {
            if (n.children?.length) {
              const sub = removeNode(n.children, key);
              if (sub.removed) {
                removed = sub.removed;
                return { ...n, children: sub.list };
              }
            }
            return n;
          });
        return { list, removed };
      }

      function insertNode(
        nodes: BTreeNodeData[],
        targetKey: BTreeNodeKey,
        node: BTreeNodeData,
        dropToGap: boolean,
        dropPosition: number,
      ): BTreeNodeData[] {
        return nodes.flatMap((n) => {
          if (n.key === targetKey) {
            if (!dropToGap && n.children !== undefined) {
              // Drop inside
              return [{ ...n, children: [...(n.children ?? []), node] }];
            }
            // Drop before or after
            return dropPosition < 0 ? [node, n] : [n, node];
          }
          if (n.children?.length) {
            return [
              { ...n, children: insertNode(n.children, targetKey, node, dropToGap, dropPosition) },
            ];
          }
          return [n];
        });
      }

      function onDrop({
        node,
        dragNode,
        dropPosition,
        dropToGap,
      }: {
        node: BTreeNodeData;
        dragNode: BTreeNodeData;
        dropPosition: number;
        dropToGap: boolean;
      }) {
        lastDrop.value = `"${dragNode.title}" → ${dropToGap ? 'beside' : 'into'} "${node.title}"`;
        const { list, removed } = removeNode(treeData.value, dragNode.key);
        if (!removed) return;
        treeData.value = insertNode(list, node.key, removed, dropToGap, dropPosition);
      }

      return { treeData, lastDrop, onDrop };
    },
    template: `
      <div>
        <p style="margin-bottom: 8px; font-size: 12px; color: #767676;">
          Drag any node onto another to move it inside that folder.
        </p>
        <BTree
          :tree-data="treeData"
          draggable
          :default-expanded-keys="['A', 'B']"
          block-node
          style="max-width: 320px;"
          @drop="onDrop"
        />
        <p
          v-if="lastDrop"
          style="margin-top: 10px; font-size: 12px; color: #555; font-style: italic;"
        >
          Last drop: {{ lastDrop }}
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // All nodes are draggable
    const items = canvas.getAllByRole('treeitem');
    items.forEach((item) => {
      expect(item.getAttribute('draggable')).toBe('true');
    });

    // dragstart fires on the first node and applies the dragging class
    const firstNode = items[0];
    fireEvent.dragStart(firstNode);
    await waitFor(() => expect(firstNode.classList.contains('b-tree__node--dragging')).toBe(true));

    // dragend clears the dragging class
    fireEvent.dragEnd(firstNode);
    await waitFor(() => expect(firstNode.classList.contains('b-tree__node--dragging')).toBe(false));
  },
};
