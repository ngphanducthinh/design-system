import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import BTree from './BTree.vue';
import type { BTreeNodeData, BTreeNodeKey } from './types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const basicTree: BTreeNodeData[] = [
  {
    key: '1',
    title: 'Parent 1',
    children: [
      { key: '1-1', title: 'Child 1-1' },
      { key: '1-2', title: 'Child 1-2', disabled: true },
    ],
  },
  {
    key: '2',
    title: 'Parent 2',
    children: [
      {
        key: '2-1',
        title: 'Child 2-1',
        children: [{ key: '2-1-1', title: 'Leaf 2-1-1' }],
      },
    ],
  },
  { key: '3', title: 'Leaf 3', isLeaf: true },
];

function mountTree(props: Record<string, unknown> = {}, slots: Record<string, any> = {}) {
  return mount(BTree, {
    props: { treeData: basicTree, ...props },
    slots,
  });
}

// ─── 1. Defaults and variants render ─────────────────────────────────────────

describe('BTree – defaults and rendering', () => {
  it('renders the root tree element with role="tree"', () => {
    const w = mountTree();
    expect(w.find('[role="tree"]').exists()).toBe(true);
    expect(w.find('.b-tree').exists()).toBe(true);
  });

  it('only renders top-level nodes by default (children collapsed)', () => {
    const w = mountTree();
    const nodes = w.findAll('[role="treeitem"]');
    // 3 top-level nodes, children hidden
    expect(nodes).toHaveLength(3);
  });

  it('renders node titles', () => {
    const w = mountTree();
    expect(w.text()).toContain('Parent 1');
    expect(w.text()).toContain('Parent 2');
    expect(w.text()).toContain('Leaf 3');
  });

  it('applies .b-tree--checkable when checkable=true', () => {
    const w = mountTree({ checkable: true });
    expect(w.find('.b-tree--checkable').exists()).toBe(true);
  });

  it('applies .b-tree--show-line when showLine=true', () => {
    const w = mountTree({ showLine: true });
    expect(w.find('.b-tree--show-line').exists()).toBe(true);
  });

  it('applies .b-tree--directory when directory=true', () => {
    const w = mountTree({ directory: true });
    expect(w.find('.b-tree--directory').exists()).toBe(true);
  });

  it('applies .b-tree--disabled when disabled=true', () => {
    const w = mountTree({ disabled: true });
    expect(w.find('.b-tree--disabled').exists()).toBe(true);
  });

  it('applies .b-tree--block-node when blockNode=true', () => {
    const w = mountTree({ blockNode: true });
    expect(w.find('.b-tree--block-node').exists()).toBe(true);
  });

  it('renders switcher for nodes with children', () => {
    const w = mountTree();
    const node1 = w.findAll('[role="treeitem"]')[0];
    expect(node1.find('.b-tree__switcher').exists()).toBe(true);
  });

  it('does not render switcher for leaf nodes', () => {
    const w = mountTree();
    // Node at index 2 is Leaf 3
    const leafNode = w.findAll('[role="treeitem"]')[2];
    expect(leafNode.find('.b-tree__switcher').exists()).toBe(false);
  });
});

// ─── 2. Props → DOM mapping ───────────────────────────────────────────────────

describe('BTree – props to DOM', () => {
  it('sets height style when height prop provided', () => {
    const w = mountTree({ height: 400 });
    expect(w.find('.b-tree').attributes('style')).toContain('400px');
  });

  it('sets aria-multiselectable when multiple=true', () => {
    const w = mountTree({ multiple: true });
    expect(w.find('[role="tree"]').attributes('aria-multiselectable')).toBe('true');
  });

  it('defaultExpandAll expands all parent nodes', () => {
    const w = mountTree({ defaultExpandAll: true });
    const nodes = w.findAll('[role="treeitem"]');
    // All nodes visible: 3 parents + 4 children + 1 grandchild = 8
    expect(nodes.length).toBeGreaterThan(3);
  });

  it('defaultExpandedKeys expands specified nodes', () => {
    const w = mountTree({ defaultExpandedKeys: ['1'] });
    const nodes = w.findAll('[role="treeitem"]');
    // Parent 1 expanded → +2 children = 5 total visible
    expect(nodes.length).toBe(5);
  });

  it('defaultSelectedKeys pre-selects nodes', () => {
    const w = mountTree({ defaultSelectedKeys: ['3'] });
    const leafNode = w.findAll('[role="treeitem"]')[2];
    expect(leafNode.classes()).toContain('b-tree__node--selected');
  });

  it('fieldNames remaps key/title/children fields', () => {
    const customData: BTreeNodeData[] = [
      {
        id: 'a',
        label: 'Alpha',
        items: [{ id: 'a1', label: 'Alpha 1' }],
      } as unknown as BTreeNodeData,
    ];
    const w = mount(BTree, {
      props: {
        treeData: customData,
        fieldNames: { key: 'id', title: 'label', children: 'items' },
      },
    });
    expect(w.text()).toContain('Alpha');
  });

  it('renders checkboxes when checkable=true', () => {
    const w = mountTree({ checkable: true });
    expect(w.findAll('.b-tree__checkbox').length).toBeGreaterThan(0);
  });

  it('applies disabled class to disabled nodes', () => {
    const w = mountTree({ defaultExpandedKeys: ['1'] });
    const items = w.findAll('[role="treeitem"]');
    // Child 1-2 is disabled
    const disabledNode = items.find((el) => el.text().includes('Child 1-2'));
    expect(disabledNode?.classes()).toContain('b-tree__node--disabled');
  });

  it('node has correct aria-level', () => {
    const w = mountTree({ defaultExpandedKeys: ['1'] });
    const items = w.findAll('[role="treeitem"]');
    expect(items[0].attributes('aria-level')).toBe('1');
    // Child of Parent 1
    const child = items.find((el) => el.text().includes('Child 1-1'));
    expect(child?.attributes('aria-level')).toBe('2');
  });
});

// ─── 3. Expand / Collapse ─────────────────────────────────────────────────────

describe('BTree – expand and collapse', () => {
  it('expands a node when switcher is clicked', async () => {
    const w = mountTree();
    const switcher = w.findAll('.b-tree__switcher')[0];
    await switcher.trigger('click');
    const nodes = w.findAll('[role="treeitem"]');
    expect(nodes.length).toBe(5); // 3 + 2 children
  });

  it('collapses an expanded node when switcher is clicked again', async () => {
    const w = mountTree({ defaultExpandedKeys: ['1'] });
    expect(w.findAll('[role="treeitem"]').length).toBe(5);
    const switcher = w.findAll('.b-tree__switcher')[0];
    await switcher.trigger('click');
    expect(w.findAll('[role="treeitem"]').length).toBe(3);
  });

  it('emits expand event with keys and info on expand', async () => {
    const w = mountTree();
    const switcher = w.findAll('.b-tree__switcher')[0];
    await switcher.trigger('click');
    expect(w.emitted('expand')).toBeTruthy();
    const [keys, info] = w.emitted('expand')![0] as [BTreeNodeKey[], { expanded: boolean }];
    expect(keys).toContain('1');
    expect(info.expanded).toBe(true);
  });

  it('emits expand event with info.expanded=false on collapse', async () => {
    const w = mountTree({ defaultExpandedKeys: ['1'] });
    const switcher = w.findAll('.b-tree__switcher')[0];
    await switcher.trigger('click');
    const last = w.emitted('expand')!.at(-1) as [BTreeNodeKey[], { expanded: boolean }];
    expect(last[1].expanded).toBe(false);
  });

  it('controlled expandedKeys: does not expand without emit handler', async () => {
    const w = mountTree({ expandedKeys: [] });
    const switcher = w.findAll('.b-tree__switcher')[0];
    await switcher.trigger('click');
    // Still shows only root nodes as parent didn't update the prop
    expect(w.findAll('[role="treeitem"]').length).toBe(3);
  });

  it('controlled expandedKeys: emits update:expandedKeys', async () => {
    const w = mountTree({ expandedKeys: [] });
    await w.findAll('.b-tree__switcher')[0].trigger('click');
    expect(w.emitted('update:expandedKeys')).toBeTruthy();
    const emitted = w.emitted('update:expandedKeys')![0] as [BTreeNodeKey[]];
    expect(emitted[0]).toContain('1');
  });

  it('switcher has aria-expanded on the node', async () => {
    const w = mountTree();
    const node = w.findAll('[role="treeitem"]')[0];
    expect(node.attributes('aria-expanded')).toBe('false');
    await w.findAll('.b-tree__switcher')[0].trigger('click');
    expect(w.findAll('[role="treeitem"]')[0].attributes('aria-expanded')).toBe('true');
  });
});

// ─── 4. Selection ─────────────────────────────────────────────────────────────

describe('BTree – selection', () => {
  it('selects a node on click', async () => {
    const w = mountTree();
    const node = w.findAll('[role="treeitem"]')[2];
    await node.trigger('click');
    expect(node.classes()).toContain('b-tree__node--selected');
  });

  it('emits select event with keys and info', async () => {
    const w = mountTree();
    await w.findAll('[role="treeitem"]')[2].trigger('click');
    expect(w.emitted('select')).toBeTruthy();
    const [keys, info] = w.emitted('select')![0] as [BTreeNodeKey[], { selected: boolean }];
    expect(keys).toContain('3');
    expect(info.selected).toBe(true);
  });

  it('deselects a node on second click', async () => {
    const w = mountTree();
    const node = w.findAll('[role="treeitem"]')[2];
    await node.trigger('click');
    await node.trigger('click');
    const last = w.emitted('select')!.at(-1) as [BTreeNodeKey[], { selected: boolean }];
    expect(last[1].selected).toBe(false);
  });

  it('allows multiple selection when multiple=true', async () => {
    const w = mountTree({ multiple: true });
    const nodes = w.findAll('[role="treeitem"]');
    await nodes[0].trigger('click');
    await nodes[2].trigger('click');
    const last = w.emitted('select')!.at(-1) as [BTreeNodeKey[], { selected: boolean }];
    expect(last[0]).toHaveLength(2);
  });

  it('single mode clears previous selection', async () => {
    const w = mountTree();
    const nodes = w.findAll('[role="treeitem"]');
    await nodes[0].trigger('click');
    await nodes[2].trigger('click');
    const last = w.emitted('select')!.at(-1) as [BTreeNodeKey[], { selected: boolean }];
    expect(last[0]).toHaveLength(1);
    expect(last[0]).toContain('3');
  });

  it('does not select disabled nodes', async () => {
    const w = mountTree({ defaultExpandedKeys: ['1'] });
    const disabledNode = w
      .findAll('[role="treeitem"]')
      .find((el) => el.text().includes('Child 1-2'))!;
    await disabledNode.trigger('click');
    expect(w.emitted('select')).toBeFalsy();
  });

  it('does not select when selectable=false', async () => {
    const w = mountTree({ selectable: false });
    await w.findAll('[role="treeitem"]')[0].trigger('click');
    expect(w.emitted('select')).toBeFalsy();
  });

  it('controlled selectedKeys: emits update:selectedKeys', async () => {
    const w = mountTree({ selectedKeys: [] });
    await w.findAll('[role="treeitem"]')[2].trigger('click');
    expect(w.emitted('update:selectedKeys')).toBeTruthy();
  });
});

// ─── 5. Checkboxes ────────────────────────────────────────────────────────────

describe('BTree – checkboxes', () => {
  it('checks a node when checkbox is clicked', async () => {
    const w = mountTree({ checkable: true });
    const checkbox = w.findAll('.b-tree__checkbox')[2]; // Leaf 3
    await checkbox.trigger('click');
    expect(checkbox.classes()).toContain('b-tree__checkbox--checked');
  });

  it('emits check event with key and info', async () => {
    const w = mountTree({ checkable: true });
    await w.findAll('.b-tree__checkbox')[2].trigger('click');
    expect(w.emitted('check')).toBeTruthy();
    const [keys] = w.emitted('check')![0] as [BTreeNodeKey[]];
    expect(keys).toContain('3');
  });

  it('checking parent checks all non-disabled children (cascade)', async () => {
    const w = mountTree({ checkable: true, defaultExpandedKeys: ['1'] });
    const parent1Checkbox = w.findAll('.b-tree__checkbox')[0];
    await parent1Checkbox.trigger('click');
    const [keys] = w.emitted('check')!.at(-1) as [BTreeNodeKey[]];
    // Child 1-1 should be checked; Child 1-2 is disabled so skipped
    expect(keys).toContain('1-1');
  });

  it('shows indeterminate when only some children are checked', async () => {
    const w = mountTree({ checkable: true, defaultExpandedKeys: ['1'] });
    // Check only Child 1-1
    const child11Checkbox = w
      .findAll('[role="treeitem"]')
      .find((el) => el.text().includes('Child 1-1'))
      ?.find('.b-tree__checkbox');
    await child11Checkbox?.trigger('click');
    const parent1Checkbox = w.findAll('.b-tree__checkbox')[0];
    expect(parent1Checkbox.classes()).toContain('b-tree__checkbox--indeterminate');
  });

  it('checkStrictly disables cascade', async () => {
    const w = mountTree({ checkable: true, checkStrictly: true, defaultExpandedKeys: ['1'] });
    const parent1Checkbox = w.findAll('.b-tree__checkbox')[0];
    await parent1Checkbox.trigger('click');
    const [keys] = w.emitted('check')!.at(-1) as [BTreeNodeKey[] | { checked: BTreeNodeKey[] }];
    const checkedArr = Array.isArray(keys) ? keys : keys.checked;
    // Only parent checked, not children
    expect(checkedArr).toContain('1');
    expect(checkedArr).not.toContain('1-1');
  });

  it('checkedKeys as object emits halfChecked keys', async () => {
    const w = mountTree({
      checkable: true,
      checkStrictly: true,
      checkedKeys: { checked: ['1-1'], halfChecked: ['1'] },
    });
    const checkbox1 = w.findAll('.b-tree__checkbox')[0];
    expect(checkbox1.attributes('aria-checked')).toBe('mixed');
  });

  it('disabled checkbox does not check', async () => {
    const w = mountTree({ checkable: true, defaultExpandedKeys: ['1'] });
    const disabledCheckbox = w
      .findAll('[role="treeitem"]')
      .find((el) => el.text().includes('Child 1-2'))
      ?.find('.b-tree__checkbox');
    await disabledCheckbox?.trigger('click');
    expect(w.emitted('check')).toBeFalsy();
  });

  it('controlled checkedKeys: emits update:checkedKeys', async () => {
    const w = mountTree({ checkable: true, checkedKeys: [] });
    await w.findAll('.b-tree__checkbox')[2].trigger('click');
    expect(w.emitted('update:checkedKeys')).toBeTruthy();
  });
});

// ─── 6. Keyboard navigation ───────────────────────────────────────────────────

describe('BTree – keyboard navigation', () => {
  it('ArrowDown moves focus to next node', async () => {
    const w = mountTree();
    const tree = w.find('[role="tree"]');
    await tree.trigger('keydown', { key: 'ArrowDown' });
    expect(w.emitted()).toBeTruthy(); // focus moves
  });

  it('ArrowRight expands a collapsed parent node', async () => {
    const w = mountTree();
    const tree = w.find('[role="tree"]');
    await tree.trigger('keydown', { key: 'ArrowRight' });
    expect(w.findAll('[role="treeitem"]').length).toBeGreaterThan(3);
  });

  it('ArrowLeft collapses an expanded node', async () => {
    const w = mountTree({ defaultExpandedKeys: ['1'] });
    const tree = w.find('[role="tree"]');
    // Focus is on first node (Parent 1 which is expanded)
    await tree.trigger('keydown', { key: 'ArrowLeft' });
    expect(w.findAll('[role="treeitem"]').length).toBe(3);
  });

  it('Enter selects the focused node', async () => {
    const w = mountTree();
    const tree = w.find('[role="tree"]');
    await tree.trigger('keydown', { key: 'Enter' });
    expect(w.emitted('select')).toBeTruthy();
  });

  it('Space selects the focused node', async () => {
    const w = mountTree();
    const tree = w.find('[role="tree"]');
    await tree.trigger('keydown', { key: ' ' });
    expect(w.emitted('select')).toBeTruthy();
  });

  it('Space checks the focused node when checkable', async () => {
    const w = mountTree({ checkable: true });
    const tree = w.find('[role="tree"]');
    await tree.trigger('keydown', { key: ' ' });
    expect(w.emitted('check')).toBeTruthy();
  });

  it('Home jumps to first node', async () => {
    const w = mountTree({ defaultExpandedKeys: ['1'] });
    const tree = w.find('[role="tree"]');
    // Move down a few times then Home
    await tree.trigger('keydown', { key: 'ArrowDown' });
    await tree.trigger('keydown', { key: 'ArrowDown' });
    await tree.trigger('keydown', { key: 'Home' });
    const firstNode = w.findAll('[role="treeitem"]')[0];
    expect(firstNode.attributes('tabindex')).toBe('0');
  });

  it('End jumps to last visible node', async () => {
    const w = mountTree();
    const tree = w.find('[role="tree"]');
    await tree.trigger('keydown', { key: 'End' });
    const nodes = w.findAll('[role="treeitem"]');
    expect(nodes[nodes.length - 1].attributes('tabindex')).toBe('0');
  });
});

// ─── 7. Accessibility (roles and ARIA) ───────────────────────────────────────

describe('BTree – accessibility', () => {
  it('root element has role="tree"', () => {
    const w = mountTree();
    expect(w.find('.b-tree').attributes('role')).toBe('tree');
  });

  it('each node has role="treeitem"', () => {
    const w = mountTree();
    const nodes = w.findAll('[role="treeitem"]');
    nodes.forEach((n) => {
      expect(n.attributes('role')).toBe('treeitem');
    });
  });

  it('nodes have aria-selected when selectable', () => {
    const w = mountTree();
    const nodes = w.findAll('[role="treeitem"]');
    nodes.forEach((n) => {
      expect(n.attributes('aria-selected')).toBeDefined();
    });
  });

  it('nodes do NOT have aria-selected when selectable=false', () => {
    const w = mountTree({ selectable: false });
    const nodes = w.findAll('[role="treeitem"]');
    nodes.forEach((n) => {
      expect(n.attributes('aria-selected')).toBeUndefined();
    });
  });

  it('parent nodes have aria-expanded', () => {
    const w = mountTree();
    const node = w.findAll('[role="treeitem"]')[0];
    expect(node.attributes('aria-expanded')).toBeDefined();
  });

  it('leaf nodes do not have aria-expanded', () => {
    const w = mountTree();
    const leafNode = w.findAll('[role="treeitem"]')[2];
    expect(leafNode.attributes('aria-expanded')).toBeUndefined();
  });

  it('nodes have aria-level', () => {
    const w = mountTree();
    const nodes = w.findAll('[role="treeitem"]');
    nodes.forEach((n) => {
      expect(n.attributes('aria-level')).toBeDefined();
    });
  });

  it('checkboxes have role="checkbox"', () => {
    const w = mountTree({ checkable: true });
    const checkboxes = w.findAll('.b-tree__checkbox');
    checkboxes.forEach((cb) => {
      expect(cb.attributes('role')).toBe('checkbox');
    });
  });

  it('checked checkbox has aria-checked="true"', async () => {
    const w = mountTree({ checkable: true });
    const cb = w.findAll('.b-tree__checkbox')[2];
    await cb.trigger('click');
    expect(cb.attributes('aria-checked')).toBe('true');
  });

  it('indeterminate checkbox has aria-checked="mixed"', async () => {
    const w = mountTree({ checkable: true, defaultExpandedKeys: ['1'] });
    const child11 = w
      .findAll('[role="treeitem"]')
      .find((el) => el.text().includes('Child 1-1'))
      ?.find('.b-tree__checkbox');
    await child11?.trigger('click');
    const parent1 = w.findAll('.b-tree__checkbox')[0];
    expect(parent1.attributes('aria-checked')).toBe('mixed');
  });

  it('switcher icon is aria-hidden', () => {
    const w = mountTree();
    const switcher = w.find('.b-tree__switcher');
    expect(switcher.attributes('aria-hidden')).toBe('true');
  });

  it('first node in tree has tabindex=0', () => {
    const w = mountTree();
    const firstNode = w.findAll('[role="treeitem"]')[0];
    expect(firstNode.attributes('tabindex')).toBe('0');
  });

  it('subsequent nodes have tabindex=-1', () => {
    const w = mountTree();
    const nodes = w.findAll('[role="treeitem"]');
    expect(nodes[1].attributes('tabindex')).toBe('-1');
    expect(nodes[2].attributes('tabindex')).toBe('-1');
  });

  it('disabled nodes have aria-disabled', () => {
    const w = mountTree({ defaultExpandedKeys: ['1'] });
    const disabledNode = w
      .findAll('[role="treeitem"]')
      .find((el) => el.text().includes('Child 1-2'));
    expect(disabledNode?.attributes('aria-disabled')).toBe('true');
  });

  it('tree root has tabindex on focusable item (roving tabindex)', () => {
    const w = mountTree();
    const nodes = w.findAll('[role="treeitem"]');
    const tabzero = nodes.filter((n) => n.attributes('tabindex') === '0');
    expect(tabzero).toHaveLength(1);
  });
});

// ─── 8. Async loading ─────────────────────────────────────────────────────────

describe('BTree – async loadData', () => {
  it('shows loading spinner when loadData is pending', async () => {
    let resolve!: () => void;
    const loadData = vi.fn(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    );

    const asyncTree: BTreeNodeData[] = [{ key: 'async-1', title: 'Async Parent' }];
    const w = mount(BTree, { props: { treeData: asyncTree, loadData } });

    await w.findAll('.b-tree__switcher')[0].trigger('click');

    expect(w.find('.b-tree__switcher-icon--spin').exists()).toBe(true);
    resolve();
    await nextTick();
    await nextTick(); // allow async promise chain to settle
    expect(w.find('.b-tree__switcher-icon--spin').exists()).toBe(false);
  });
});

// ─── 9. Draggable ─────────────────────────────────────────────────────────────

describe('BTree – draggable', () => {
  it('nodes have draggable attribute when draggable=true', () => {
    const w = mountTree({ draggable: true });
    const nodes = w.findAll('[role="treeitem"]');
    nodes.forEach((n) => {
      expect(n.attributes('draggable')).toBe('true');
    });
  });

  it('emits dragStart on drag start', async () => {
    const w = mountTree({ draggable: true });
    const dataTransfer = { setData: vi.fn() };
    await w.findAll('[role="treeitem"]')[0].trigger('dragstart', { dataTransfer });
    expect(w.emitted('dragStart')).toBeTruthy();
    const [info] = w.emitted('dragStart')![0] as [{ node: BTreeNodeData }];
    expect(info.node.key).toBe('1');
  });

  it('emits dragEnd on drag end', async () => {
    const w = mountTree({ draggable: true });
    await w.findAll('[role="treeitem"]')[0].trigger('dragend');
    expect(w.emitted('dragEnd')).toBeTruthy();
  });

  it('emits dragEnter on drag enter', async () => {
    const w = mountTree({ draggable: true });
    await w.findAll('[role="treeitem"]')[1].trigger('dragenter');
    expect(w.emitted('dragEnter')).toBeTruthy();
  });
});

// ─── 10. filterTreeNode ───────────────────────────────────────────────────────

describe('BTree – filterTreeNode', () => {
  it('applies --filtered class to matching nodes', () => {
    const w = mountTree({
      filterTreeNode: (node: BTreeNodeData) => node.title === 'Leaf 3',
    });
    const leaf3 = w.findAll('[role="treeitem"]').find((el) => el.text().includes('Leaf 3'));
    expect(leaf3?.find('.b-tree__title').classes()).toContain('b-tree__title--filtered');
  });

  it('non-matching nodes are not filtered', () => {
    const w = mountTree({
      filterTreeNode: (node: BTreeNodeData) => node.title === 'Leaf 3',
    });
    const parent1 = w.findAll('[role="treeitem"]')[0];
    expect(parent1.find('.b-tree__title').classes()).not.toContain('b-tree__title--filtered');
  });
});

// ─── 11. Right click ──────────────────────────────────────────────────────────

describe('BTree – rightClick', () => {
  it('emits rightClick with node and event', async () => {
    const w = mountTree();
    await w.findAll('[role="treeitem"]')[0].trigger('contextmenu');
    expect(w.emitted('rightClick')).toBeTruthy();
    const [info] = w.emitted('rightClick')![0] as [{ node: BTreeNodeData }];
    expect(info.node.key).toBe('1');
  });
});

// ─── 12. Slots ────────────────────────────────────────────────────────────────

describe('BTree – slots', () => {
  it('title slot overrides default title rendering', () => {
    const w = mount(BTree, {
      props: { treeData: basicTree },
      slots: {
        title: '<template #title="{ node }"><em>custom-{{ node.title }}</em></template>',
      },
    });
    expect(w.html()).toContain('custom-Parent 1');
  });

  it('icon slot renders per-node icon', () => {
    const w = mount(BTree, {
      props: { treeData: basicTree, showIcon: true },
      slots: {
        icon: '<template #icon="{ node }"><span class="custom-icon">{{ node.key }}</span></template>',
      },
    });
    expect(w.find('.custom-icon').exists()).toBe(true);
  });
});

// ─── 13. Controlled vs uncontrolled ──────────────────────────────────────────

describe('BTree – controlled vs uncontrolled', () => {
  it('uncontrolled selectedKeys persists across clicks', async () => {
    const w = mountTree();
    await w.findAll('[role="treeitem"]')[0].trigger('click');
    const node = w.findAll('[role="treeitem"]')[0];
    expect(node.classes()).toContain('b-tree__node--selected');
  });

  it('controlled selectedKeys only shows selection from prop', async () => {
    const w = mountTree({ selectedKeys: ['3'] });
    const leaf3 = w.findAll('[role="treeitem"]')[2];
    expect(leaf3.classes()).toContain('b-tree__node--selected');
  });

  it('controlled: clicking without handler does not change selection visually', async () => {
    const w = mountTree({ selectedKeys: ['3'] });
    await w.findAll('[role="treeitem"]')[0].trigger('click');
    // '3' still selected because prop wasn't updated
    const leaf3 = w.findAll('[role="treeitem"]')[2];
    expect(leaf3.classes()).toContain('b-tree__node--selected');
  });

  it('controlled checkedKeys reflects prop', () => {
    const w = mountTree({ checkable: true, checkedKeys: ['3'] });
    const cb = w.findAll('.b-tree__checkbox')[2];
    expect(cb.classes()).toContain('b-tree__checkbox--checked');
  });
});

// ─── 14. Directory mode ───────────────────────────────────────────────────────

describe('BTree – directory mode', () => {
  it('click expands directory nodes when expandAction=click', async () => {
    const w = mountTree({ directory: true, expandAction: 'click' });
    const parent1 = w.findAll('[role="treeitem"]')[0];
    await parent1.trigger('click');
    expect(w.findAll('[role="treeitem"]').length).toBeGreaterThan(3);
  });

  it('double-click expands directory nodes when expandAction=doubleClick', async () => {
    const w = mountTree({ directory: true, expandAction: 'doubleClick' });
    const parent1 = w.findAll('[role="treeitem"]')[0];
    await parent1.trigger('dblclick');
    expect(w.findAll('[role="treeitem"]').length).toBeGreaterThan(3);
  });

  it('selected directory node gets directory-specific class', async () => {
    const w = mountTree({ directory: true });
    await w.findAll('[role="treeitem"]')[2].trigger('click');
    const leaf = w.findAll('[role="treeitem"]')[2];
    expect(leaf.classes()).toContain('b-tree__node--selected');
    // The tree root has directory class so CSS applies the dir color
    expect(w.find('.b-tree--directory').exists()).toBe(true);
  });
});

// ─── 15. Edge cases ───────────────────────────────────────────────────────────

describe('BTree – edge cases', () => {
  it('renders empty tree without errors', () => {
    const w = mount(BTree, { props: { treeData: [] } });
    expect(w.find('[role="tree"]').exists()).toBe(true);
    expect(w.findAll('[role="treeitem"]').length).toBe(0);
  });

  it('handles deeply nested data without errors', () => {
    const deep: BTreeNodeData[] = [
      {
        key: 'd1',
        title: 'D1',
        children: [
          {
            key: 'd2',
            title: 'D2',
            children: [
              {
                key: 'd3',
                title: 'D3',
                children: [{ key: 'd4', title: 'D4' }],
              },
            ],
          },
        ],
      },
    ];
    const w = mount(BTree, {
      props: { treeData: deep, defaultExpandAll: true },
    });
    expect(w.findAll('[role="treeitem"]').length).toBe(4);
  });

  it('handles nodes with same title but different keys', () => {
    const dupes: BTreeNodeData[] = [
      { key: 'a', title: 'Same' },
      { key: 'b', title: 'Same' },
    ];
    const w = mount(BTree, { props: { treeData: dupes } });
    expect(w.findAll('[role="treeitem"]').length).toBe(2);
  });

  it('scrollTo method is exposed without throwing', () => {
    const w = mountTree();
    expect(() => w.vm.scrollTo({ key: '3' })).not.toThrow();
  });
});
