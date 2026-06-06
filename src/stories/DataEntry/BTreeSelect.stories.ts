import { BTreeSelect } from '@/components';
import type { BTreeSelectNode } from '@/components/BTreeSelect/types.ts';
import {
  BTreeSelectPlacement,
  BTreeSelectStatus,
  BTreeSelectVariant,
} from '@/components/BTreeSelect/types.ts';
import { BCommonSize } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Sample data
// ─────────────────────────────────────────────
const sampleTree: BTreeSelectNode[] = [
  {
    title: 'Parent Node 1',
    value: 'parent-1',
    children: [
      { title: 'Leaf Node 1-0', value: '1-0' },
      { title: 'Leaf Node 1-1', value: '1-1' },
    ],
  },
  {
    title: 'Parent Node 2',
    value: 'parent-2',
    children: [
      {
        title: 'Sub Node 2-0',
        value: '2-0',
        children: [
          { title: 'Leaf Node 2-0-0', value: '2-0-0' },
          { title: 'Leaf Node 2-0-1', value: '2-0-1' },
        ],
      },
      { title: 'Leaf Node 2-1', value: '2-1' },
    ],
  },
  {
    title: 'Parent Node 3 (disabled)',
    value: 'parent-3',
    disabled: true,
    children: [{ title: 'Leaf Node 3-0', value: '3-0' }],
  },
];

const customFieldNamesTree = [
  {
    name: 'United States',
    code: 'us',
    items: [
      { name: 'California', code: 'ca' },
      { name: 'New York', code: 'ny' },
    ],
  },
  {
    name: 'Vietnam',
    code: 'vn',
    items: [
      { name: 'Hanoi', code: 'hn' },
      { name: 'Ho Chi Minh', code: 'hcm' },
    ],
  },
];

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Data Entry/TreeSelect',
  component: BTreeSelect,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'object',
      description: 'Selected value(s). Use array form for multiple/treeCheckable modes.',
      table: { category: 'Two-Way Binding Props' },
    },
    open: {
      control: 'boolean',
      description: 'Controlled open state of the dropdown.',
      table: { category: 'Two-Way Binding Props' },
    },
    treeExpandedKeys: {
      control: 'object',
      description: 'Controlled expanded keys.',
      table: { category: 'Two-Way Binding Props' },
    },
    treeData: {
      control: 'object',
      description: 'Hierarchical tree data.',
      table: { category: 'Props' },
    },
    fieldNames: {
      control: 'object',
      description: 'Replace default `title`/`value`/`children` field names.',
      table: { category: 'Props' },
    },
    multiple: {
      control: 'boolean',
      description: 'Allow multiple selection (no checkboxes).',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    treeCheckable: {
      control: 'boolean',
      description: 'Show checkboxes - implies multiple.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    treeCheckStrictly: {
      control: 'boolean',
      description: 'Disable parent/child cascading in checkable mode.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    labelInValue: {
      control: 'boolean',
      description: 'Return `{ value, label }` instead of just value.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    size: {
      control: 'select',
      options: Object.values(BCommonSize),
      description: 'Selector size.',
      table: { category: 'Props', defaultValue: { summary: BCommonSize.Medium } },
    },
    variant: {
      control: 'select',
      options: Object.values(BTreeSelectVariant),
      description: 'Visual variant of the selector.',
      table: { category: 'Props', defaultValue: { summary: BTreeSelectVariant.Outlined } },
    },
    placement: {
      control: 'select',
      options: Object.values(BTreeSelectPlacement),
      description: 'Dropdown placement.',
      table: { category: 'Props', defaultValue: { summary: BTreeSelectPlacement.BottomLeft } },
    },
    status: {
      control: 'select',
      options: [undefined, ...Object.values(BTreeSelectStatus)],
      description: 'Validation status.',
      table: { category: 'Props' },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder when nothing selected.',
      table: { category: 'Props' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the component.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    showSearch: {
      control: 'boolean',
      description: 'Show search input.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    treeDefaultExpandAll: {
      control: 'boolean',
      description: 'Expand all nodes on mount.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    treeIcon: {
      control: 'boolean',
      description: 'Show icons next to nodes.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    treeLine: {
      control: 'boolean',
      description: 'Show connector lines.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    allowClear: {
      control: 'boolean',
      description: 'Show clear button when a value is set.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    notFoundContent: {
      control: 'text',
      description: 'Content shown when search returns no results.',
      table: { category: 'Props', defaultValue: { summary: 'Not Found' } },
    },
    listHeight: {
      control: 'number',
      description: 'Maximum dropdown height in px.',
      table: { category: 'Props', defaultValue: { summary: '256' } },
    },
    maxTagCount: {
      control: 'number',
      description: 'Max number of tags shown before collapsing into +N.',
      table: { category: 'Props' },
    },
    maxCount: {
      control: 'number',
      description: 'Maximum selectable nodes.',
      table: { category: 'Props' },
    },
    popupMatchSelectWidth: {
      control: 'boolean',
      description: 'Match popup width to selector. Pass a number for fixed width.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BTreeSelect</code> component provides a tree-structured selector. ' +
          'Supports single/multiple selection, cascading checkboxes, search, async load, ' +
          'and custom field names. Uses the native HTML <code>popover</code> attribute and ' +
          'CSS Anchor Positioning.',
      },
    },
  },
} satisfies Meta<typeof BTreeSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────
export const Playground: Story = {
  render: (args) => ({
    components: { BTreeSelect },
    setup() {
      const value = ref<unknown>(undefined);
      return { args, value, sampleTree };
    },
    template: `
      <div style="padding: 40px; max-width: 480px;">
        <BTreeSelect v-bind="args" v-model="value" :tree-data="args.treeData ?? sampleTree" />
        <p style="margin-top: 16px; font-size: 13px; color: #666;">Selected: {{ value }}</p>
      </div>
    `,
  }),
  args: {
    placeholder: 'Please select',
    allowClear: true,
  },
};

export const Sizes: Story = {
  render: () => ({
    components: { BTreeSelect },
    setup() {
      const value = ref<unknown>(undefined);
      return { value, sampleTree };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; max-width: 480px;">
        <BTreeSelect :tree-data="sampleTree" v-model="value" size="sm" placeholder="Small" />
        <BTreeSelect :tree-data="sampleTree" v-model="value" size="md" placeholder="Medium (default)" />
        <BTreeSelect :tree-data="sampleTree" v-model="value" size="lg" placeholder="Large" />
      </div>
    `,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { BTreeSelect },
    setup() {
      const value = ref<unknown>(undefined);
      return { value, sampleTree };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; max-width: 480px;">
        <BTreeSelect :tree-data="sampleTree" v-model="value" variant="outlined" placeholder="Outlined" />
        <BTreeSelect :tree-data="sampleTree" v-model="value" variant="filled" placeholder="Filled" />
        <BTreeSelect :tree-data="sampleTree" v-model="value" variant="borderless" placeholder="Borderless" />
        <BTreeSelect :tree-data="sampleTree" v-model="value" variant="underlined" placeholder="Underlined" />
      </div>
    `,
  }),
};

export const WithSearch: Story = {
  render: () => ({
    components: { BTreeSelect },
    setup() {
      const value = ref<unknown>(undefined);
      return { value, sampleTree };
    },
    template: `
      <div style="padding: 40px; max-width: 480px;">
        <BTreeSelect
          :tree-data="sampleTree"
          v-model="value"
          :show-search="true"
          :tree-default-expand-all="true"
          placeholder="Search nodes..."
        />
      </div>
    `,
  }),
};

export const Multiple: Story = {
  render: () => ({
    components: { BTreeSelect },
    setup() {
      const value = ref<(string | number)[]>([]);
      return { value, sampleTree };
    },
    template: `
      <div style="padding: 40px; max-width: 480px;">
        <BTreeSelect
          :tree-data="sampleTree"
          v-model="value"
          :multiple="true"
          :tree-default-expand-all="true"
          placeholder="Pick several"
          allowClear
        />
        <p style="margin-top: 16px; font-size: 13px; color: #666;">Selected: {{ value }}</p>
      </div>
    `,
  }),
};

export const TreeCheckable: Story = {
  render: () => ({
    components: { BTreeSelect },
    setup() {
      const value = ref<(string | number)[]>([]);
      return { value, sampleTree };
    },
    template: `
      <div style="padding: 40px; max-width: 480px;">
        <BTreeSelect
          :tree-data="sampleTree"
          v-model="value"
          :tree-checkable="true"
          :tree-default-expand-all="true"
          placeholder="Check nodes"
          allowClear
        />
        <p style="margin-top: 16px; font-size: 13px; color: #666;">Checked: {{ value }}</p>
      </div>
    `,
  }),
};

export const TreeCheckStrictly: Story = {
  render: () => ({
    components: { BTreeSelect },
    setup() {
      const value = ref<(string | number)[]>([]);
      return { value, sampleTree };
    },
    template: `
      <div style="padding: 40px; max-width: 480px;">
        <BTreeSelect
          :tree-data="sampleTree"
          v-model="value"
          :tree-checkable="true"
          :tree-check-strictly="true"
          :tree-default-expand-all="true"
          placeholder="Check (no cascade)"
        />
      </div>
    `,
  }),
};

export const AsyncLoadData: Story = {
  render: () => ({
    components: { BTreeSelect },
    setup() {
      const value = ref<unknown>(undefined);
      const tree = ref<BTreeSelectNode[]>([
        { title: 'Continent: Asia', value: 'asia', isLeaf: false, children: [] },
        { title: 'Continent: Europe', value: 'europe', isLeaf: false, children: [] },
      ]);

      const loadData = (node: BTreeSelectNode): Promise<void> =>
        new Promise((resolve) => {
          setTimeout(() => {
            const append: BTreeSelectNode[] =
              node.value === 'asia'
                ? [
                    { title: 'Vietnam', value: 'vn' },
                    { title: 'Japan', value: 'jp' },
                  ]
                : [
                    { title: 'France', value: 'fr' },
                    { title: 'Germany', value: 'de' },
                  ];

            const recurse = (nodes: BTreeSelectNode[]): BTreeSelectNode[] =>
              nodes.map((n) => {
                if (n.value === node.value) {
                  return { ...n, children: append };
                }
                if (n.children?.length) {
                  return { ...n, children: recurse(n.children) };
                }
                return n;
              });

            tree.value = recurse(tree.value);
            resolve();
          }, 600);
        });

      return { value, tree, loadData };
    },
    template: `
      <div style="padding: 40px; max-width: 480px;">
        <BTreeSelect
          :tree-data="tree"
          v-model="value"
          :load-data="loadData"
          placeholder="Expand to load children"
        />
      </div>
    `,
  }),
};

export const ValidationStatus: Story = {
  render: () => ({
    components: { BTreeSelect },
    setup() {
      const value = ref<unknown>(undefined);
      return { value, sampleTree };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 16px; max-width: 480px;">
        <BTreeSelect :tree-data="sampleTree" v-model="value" status="error" placeholder="Error" />
        <BTreeSelect :tree-data="sampleTree" v-model="value" status="warning" placeholder="Warning" />
      </div>
    `,
  }),
};

export const CustomFieldNames: Story = {
  render: () => ({
    components: { BTreeSelect },
    setup() {
      const value = ref<unknown>(undefined);
      return { value, customFieldNamesTree };
    },
    template: `
      <div style="padding: 40px; max-width: 480px;">
        <BTreeSelect
          :tree-data="customFieldNamesTree"
          v-model="value"
          :field-names="{ label: 'name', value: 'code', children: 'items' }"
          :tree-default-expand-all="true"
          placeholder="Pick a country/state"
        />
        <p style="margin-top: 16px; font-size: 13px; color: #666;">Selected: {{ value }}</p>
      </div>
    `,
  }),
};

export const ShowLine: Story = {
  render: () => ({
    components: { BTreeSelect },
    setup() {
      const value = ref<unknown>(undefined);
      return { value, sampleTree };
    },
    template: `
      <div style="padding: 40px; max-width: 480px;">
        <BTreeSelect
          :tree-data="sampleTree"
          v-model="value"
          :tree-line="true"
          :tree-default-expand-all="true"
          placeholder="With connector lines"
        />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { BTreeSelect },
    setup() {
      const value = ref('1-0');
      return { value, sampleTree };
    },
    template: `
      <div style="padding: 40px; max-width: 480px;">
        <BTreeSelect :tree-data="sampleTree" v-model="value" :disabled="true" />
      </div>
    `,
  }),
};

export const Accessibility: Story = {
  render: () => ({
    components: { BTreeSelect },
    setup() {
      const value = ref<unknown>(undefined);
      return { value, sampleTree };
    },
    template: `
      <div style="padding: 40px; max-width: 480px;">
        <label id="tree-select-label" style="display: block; margin-bottom: 8px; font-weight: 500;">
          Choose node:
        </label>
        <BTreeSelect
          :tree-data="sampleTree"
          v-model="value"
          placeholder="Navigate with keyboard"
          aria-labelledby="tree-select-label"
          data-testid="a11y-tree-select"
        />
        <p style="margin-top: 12px; font-size: 12px; color: #595959;">
          Tab to focus, Enter/Space to open, Arrow keys to navigate, Right/Left to expand/collapse, Escape to close.
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('combobox');
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('aria-haspopup')).toBe('tree');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    // Open
    await userEvent.click(trigger);

    await waitFor(() => {
      const tree = canvasElement.querySelector('[role="tree"]');
      expect(tree).toBeTruthy();
    });

    const items = canvasElement.querySelectorAll('[role="treeitem"]');
    expect(items.length).toBeGreaterThan(0);

    for (const item of items) {
      expect(item.getAttribute('aria-level')).not.toBeNull();
    }

    // Close before a11y checks run - open popover sits in top-layer and
    // blocks axe-core from resolving aria-controls and underlying contrast.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });
  },
};

export const Theming: Story = {
  render: () => ({
    components: { BTreeSelect },
    setup() {
      const value = ref('1-0');
      return { value, sampleTree };
    },
    template: `
      <div style="padding: 40px; display: flex; flex-direction: column; gap: 24px; max-width: 480px;">
        <div>
          <p style="margin-bottom: 8px; font-weight: 500;">Default theme:</p>
          <BTreeSelect :tree-data="sampleTree" v-model="value" :tree-default-expand-all="true" />
        </div>

        <div
          style="
            --b-tree-select-border-color: #722ed1;
            --b-tree-select-active-border-color: #9254de;
            --b-tree-select-node-selected-bg: #f9f0ff;
            --b-tree-select-node-selected-color: #722ed1;
            --b-tree-select-node-hover-bg: #f9f0ff;
          "
        >
          <p style="margin-bottom: 8px; font-weight: 500;">Purple theme (overriding 5 CSS vars):</p>
          <BTreeSelect :tree-data="sampleTree" v-model="value" :tree-default-expand-all="true" />
        </div>

        <div
          style="
            --b-tree-select-popup-border-radius: 16px;
            --b-tree-select-node-selected-bg: #f6ffed;
            --b-tree-select-node-selected-color: #389e0d;
            --b-tree-select-checkbox-checked-bg: #52c41a;
            --b-tree-select-indent-size: 32px;
            --b-tree-select-title-height: 32px;
          "
        >
          <p style="margin-bottom: 8px; font-weight: 500;">Green / spacious theme (override 6 CSS vars):</p>
          <BTreeSelect
            :tree-data="sampleTree"
            v-model="value"
            :tree-checkable="true"
            :tree-default-expand-all="true"
          />
        </div>
      </div>
    `,
  }),
};

export const InteractionTest: Story = {
  render: () => ({
    components: { BTreeSelect },
    setup() {
      const value = ref<unknown>(undefined);
      return { value, sampleTree };
    },
    template: `
      <div style="padding: 40px; max-width: 480px;">
        <BTreeSelect
          :tree-data="sampleTree"
          v-model="value"
          :tree-default-expand-all="true"
          placeholder="Click to select"
          data-testid="interaction-tree-select"
        />
        <p data-testid="selected-value" style="margin-top: 16px; font-size: 13px;">
          Selected: {{ value ?? 'nothing' }}
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // Initial state: nothing selected
    expect(canvasElement.querySelector('[data-testid="selected-value"]')!.textContent).toContain(
      'nothing',
    );

    // Open dropdown
    const trigger = canvasElement.querySelector('[role="combobox"]')! as HTMLElement;
    await userEvent.click(trigger);

    await waitFor(() => {
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });

    // Click on a leaf node
    const items = canvasElement.querySelectorAll('[role="treeitem"]');
    const leaf = Array.from(items).find((i) => i.textContent?.includes('Leaf Node 1-0'));
    expect(leaf).toBeTruthy();
    await userEvent.click(leaf!);

    // Closes after selection in single mode
    await waitFor(() => {
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });

    // Selected value reflected
    await waitFor(() => {
      const display = canvasElement.querySelector('[data-testid="selected-value"]')!;
      expect(display.textContent).toContain('1-0');
    });
  },
};

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'All scoped CSS variables exposed by <code>BTreeSelect</code>. Override on the component root or any ancestor selector.',
      },
    },
  },
  render: () => ({
    setup() {
      const tokens = [
        {
          variable: '--b-tree-select-indent-size',
          default: '24px',
          description: 'Indent per depth level (AntD: indentSize)',
        },
        {
          variable: '--b-tree-select-node-hover-bg',
          default: 'rgba(0, 0, 0, 0.04)',
          description: 'Background of node on hover (AntD: nodeHoverBg)',
        },
        {
          variable: '--b-tree-select-node-hover-color',
          default: 'rgba(0, 0, 0, 0.88)',
          description: 'Text color of node on hover (AntD: nodeHoverColor)',
        },
        {
          variable: '--b-tree-select-node-selected-bg',
          default: '#e6f4ff',
          description: 'Background of selected node (AntD: nodeSelectedBg)',
        },
        {
          variable: '--b-tree-select-node-selected-color',
          default: 'rgba(0, 0, 0, 0.88)',
          description: 'Text color of selected node (AntD: nodeSelectedColor)',
        },
        {
          variable: '--b-tree-select-switcher-size',
          default: '24px',
          description: 'Size of the expand/collapse switcher (AntD: switcherSize)',
        },
        {
          variable: '--b-tree-select-title-height',
          default: '24px',
          description: 'Height of each node row (AntD: titleHeight)',
        },
        {
          variable: '--b-tree-select-bg',
          default: '#ffffff',
          description: 'Background of the selector input',
        },
        {
          variable: '--b-tree-select-color',
          default: 'rgba(0, 0, 0, 0.88)',
          description: 'Text color of the selector',
        },
        {
          variable: '--b-tree-select-placeholder-color',
          default: '#606870',
          description: 'Placeholder text color',
        },
        {
          variable: '--b-tree-select-border-color',
          default: '#d9d9d9',
          description: 'Border color of the selector',
        },
        {
          variable: '--b-tree-select-hover-border-color',
          default: '#4096ff',
          description: 'Border color on hover',
        },
        {
          variable: '--b-tree-select-active-border-color',
          default: '#1677ff',
          description: 'Border color when focused/active',
        },
        {
          variable: '--b-tree-select-active-outline-color',
          default: 'rgba(5, 145, 255, 0.1)',
          description: 'Focus outline color',
        },
        {
          variable: '--b-tree-select-filled-bg',
          default: 'rgba(0, 0, 0, 0.04)',
          description: 'Background of the filled variant',
        },
        {
          variable: '--b-tree-select-tag-bg',
          default: 'rgba(0, 0, 0, 0.06)',
          description: 'Background of tags (multiple mode)',
        },
        {
          variable: '--b-tree-select-tag-border-color',
          default: 'transparent',
          description: 'Border color of tags',
        },
        {
          variable: '--b-tree-select-multiple-count-bg',
          default: '#f0f0f0',
          description: 'Background of "+N" count tag',
        },
        {
          variable: '--b-tree-select-multiple-count-color',
          default: '#1f1f1f',
          description: 'Text color of "+N" count tag',
        },
        {
          variable: '--b-tree-select-checkbox-size',
          default: '16px',
          description: 'Size of checkbox in checkable mode',
        },
        {
          variable: '--b-tree-select-checkbox-border',
          default: '#d9d9d9',
          description: 'Border color of unchecked checkbox',
        },
        {
          variable: '--b-tree-select-checkbox-bg',
          default: '#ffffff',
          description: 'Background of unchecked checkbox',
        },
        {
          variable: '--b-tree-select-checkbox-checked-bg',
          default: '#1677ff',
          description: 'Background of checked checkbox',
        },
        {
          variable: '--b-tree-select-popup-bg',
          default: '#ffffff',
          description: 'Background of dropdown popup',
        },
        {
          variable: '--b-tree-select-popup-shadow',
          default: '0 6px 16px ...',
          description: 'Box shadow of dropdown popup',
        },
        {
          variable: '--b-tree-select-popup-border-radius',
          default: '8px',
          description: 'Border radius of dropdown popup',
        },
        {
          variable: '--b-tree-select-z-index-popup',
          default: '1050',
          description: 'Z-index of dropdown popup',
        },
        {
          variable: '--b-tree-select-line-color',
          default: '#d9d9d9',
          description: 'Color of connector lines (treeLine)',
        },
        {
          variable: '--b-tree-select-transition-duration',
          default: '200ms',
          description: 'Duration of transitions',
        },
      ];
      return { tokens };
    },
    template: `
      <div style="padding: 24px;">
        <h3 style="margin-bottom: 16px; font-size: 18px; font-weight: 600;">BTreeSelect Design Tokens</h3>
        <p style="margin-bottom: 16px; font-size: 13px; color: #666;">
          Override these CSS variables on the component root or any ancestor to customize appearance.
          Tokens are AntD-aligned where possible.
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 2px solid #f0f0f0;">
              <th style="text-align: left; padding: 8px 12px; font-weight: 600;">Variable</th>
              <th style="text-align: left; padding: 8px 12px; font-weight: 600;">Default</th>
              <th style="text-align: left; padding: 8px 12px; font-weight: 600;">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="token in tokens" :key="token.variable" style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 8px 12px; font-family: monospace; color: #0958d9; white-space: nowrap;">
                {{ token.variable }}
              </td>
              <td style="padding: 8px 12px; font-family: monospace; color: #666;">
                {{ token.default }}
              </td>
              <td style="padding: 8px 12px; color: #333;">
                {{ token.description }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
};
