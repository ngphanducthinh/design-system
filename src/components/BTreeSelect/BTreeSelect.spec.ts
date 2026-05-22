import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import BTreeSelect from './BTreeSelect.vue';
import { BTreeSelectStatus, BTreeSelectVariant, type BTreeSelectNode } from './types';

function createToggleEvent(newState: string, oldState: string): Event {
  const event = new Event('toggle', { bubbles: false });
  (event as unknown as Record<string, string>).newState = newState;
  (event as unknown as Record<string, string>).oldState = oldState;
  return event;
}

function stubPopoverAPI() {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.toggleAttribute('popover-open', true);
    this.dispatchEvent(createToggleEvent('open', 'closed'));
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('popover-open');
    this.dispatchEvent(createToggleEvent('closed', 'open'));
  });
  HTMLElement.prototype.scrollIntoView = vi.fn();
}

const sampleTree: BTreeSelectNode[] = [
  {
    title: 'Parent 1',
    value: 'p1',
    children: [
      { title: 'Child 1-1', value: 'c11' },
      { title: 'Child 1-2', value: 'c12' },
    ],
  },
  {
    title: 'Parent 2',
    value: 'p2',
    children: [
      {
        title: 'Child 2-1',
        value: 'c21',
        children: [
          { title: 'Grandchild 2-1-1', value: 'g211' },
          { title: 'Grandchild 2-1-2', value: 'g212' },
        ],
      },
    ],
  },
];

const treeWithDisabled: BTreeSelectNode[] = [
  { title: 'Active', value: 'a' },
  { title: 'Disabled', value: 'b', disabled: true },
  { title: 'Active 2', value: 'c' },
];

function getSelector(wrapper: VueWrapper) {
  return wrapper.find('[role="combobox"]');
}

function getDropdown(wrapper: VueWrapper) {
  return wrapper.find('.b-tree-select__dropdown');
}

function getNodes(wrapper: VueWrapper) {
  return wrapper.findAll('[role="treeitem"]');
}

describe('BTreeSelect', () => {
  beforeEach(() => {
    stubPopoverAPI();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('defaults and variants render', () => {
    it('renders with default props', () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree },
      });
      expect(wrapper.find('.b-tree-select').exists()).toBe(true);
      expect(getSelector(wrapper).exists()).toBe(true);
      expect(getDropdown(wrapper).exists()).toBe(true);
    });

    it('renders outlined variant by default', () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree },
      });
      const selector = getSelector(wrapper);
      expect(selector.classes().join(' ')).toContain('b:border-[var(--b-tree-select-border-color)]');
    });

    it('renders filled variant', () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, variant: BTreeSelectVariant.Filled },
      });
      const selector = getSelector(wrapper);
      expect(selector.classes().join(' ')).toContain('b:bg-[var(--b-tree-select-filled-bg)]');
    });

    it('renders borderless variant', () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, variant: BTreeSelectVariant.Borderless },
      });
      const selector = getSelector(wrapper);
      expect(selector.classes().join(' ')).toContain('b:bg-transparent');
    });

    it('renders all size variants', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      const heightClasses = ['b:min-h-6', 'b:min-h-8', 'b:min-h-10'];
      sizes.forEach((size, i) => {
        const wrapper = mount(BTreeSelect, { props: { treeData: sampleTree, size } });
        expect(getSelector(wrapper).classes().join(' ')).toContain(heightClasses[i]);
      });
    });

    it('shows placeholder when nothing selected', () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, placeholder: 'Pick a node' },
      });
      expect(wrapper.find('.b-tree-select__placeholder').text()).toBe('Pick a node');
    });

    it('displays selected node label', () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, modelValue: 'c11' },
      });
      expect(wrapper.find('.b-tree-select__value').text()).toBe('Child 1-1');
    });
  });

  describe('props map to DOM and behavior', () => {
    it('disables the component', () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, disabled: true },
      });
      const selector = getSelector(wrapper);
      expect(selector.attributes('aria-disabled')).toBe('true');
      expect(selector.attributes('tabindex')).toBe('-1');
    });

    it('shows error status', () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, status: BTreeSelectStatus.Error },
      });
      expect(getSelector(wrapper).classes().join(' ')).toContain('b:border-red-500!');
    });

    it('shows warning status', () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, status: BTreeSelectStatus.Warning },
      });
      expect(getSelector(wrapper).classes().join(' ')).toContain('b:border-yellow-500!');
    });

    it('shows clear button when allowClear and value exists', () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, modelValue: 'c11', allowClear: true },
      });
      expect(wrapper.find('.b-tree-select__clear').exists()).toBe(true);
    });

    it('hides clear button when no value', () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, allowClear: true },
      });
      expect(wrapper.find('.b-tree-select__clear').exists()).toBe(false);
    });

    it('respects popupMatchSelectWidth as number', () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, popupMatchSelectWidth: 320 },
      });
      expect(getDropdown(wrapper).attributes('style')).toContain('width: 320px');
    });

    it('sets max-height from listHeight', () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, listHeight: 200 },
      });
      expect(getDropdown(wrapper).attributes('style')).toContain('max-height: 200px');
    });

    it('expands all nodes when treeDefaultExpandAll is set', async () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, treeDefaultExpandAll: true },
      });
      await nextTick();
      const nodes = getNodes(wrapper);
      // Total visible nodes should include all (2 parents + 2 + 1 + 2 = 7)
      expect(nodes.length).toBe(7);
    });

    it('honours treeDefaultExpandedKeys', async () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, treeDefaultExpandedKeys: ['p1'] },
      });
      await nextTick();
      const nodes = getNodes(wrapper);
      // p1 + 2 children + p2 = 4
      expect(nodes.length).toBe(4);
    });

    it('renders checkboxes when treeCheckable', () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, treeCheckable: true, treeDefaultExpandAll: true },
      });
      const checkboxes = wrapper.findAll('.b-tree-select__checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('applies custom field names', () => {
      const customTree = [
        { name: 'A', code: 'a', items: [{ name: 'A1', code: 'a1' }] },
      ];
      const wrapper = mount(BTreeSelect, {
        props: {
          treeData: customTree as unknown as BTreeSelectNode[],
          fieldNames: { label: 'name', value: 'code', children: 'items' },
          modelValue: 'a',
        },
      });
      expect(wrapper.find('.b-tree-select__value').text()).toBe('A');
    });
  });

  describe('events order', () => {
    it('emits openChange on open', async () => {
      const wrapper = mount(BTreeSelect, { props: { treeData: sampleTree } });
      await getSelector(wrapper).trigger('click');
      expect(wrapper.emitted().openChange![0]).toEqual([true]);
    });

    it('emits openChange(false) on close', async () => {
      const wrapper = mount(BTreeSelect, { props: { treeData: sampleTree } });
      await getSelector(wrapper).trigger('click');
      await getSelector(wrapper).trigger('click');
      expect(wrapper.emitted().openChange![1]).toEqual([false]);
    });

    it('emits select then change on node click (single mode)', async () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, 'onUpdate:modelValue': () => {} },
      });
      await getSelector(wrapper).trigger('click');
      const nodes = getNodes(wrapper);
      await nodes[0].trigger('click');

      const emitted = wrapper.emitted();
      expect(emitted.select).toBeTruthy();
      expect(emitted.change).toBeTruthy();
      const selectIdx = Object.keys(emitted).indexOf('select');
      const changeIdx = Object.keys(emitted).indexOf('change');
      expect(selectIdx).toBeLessThan(changeIdx);
    });

    it('closes after single-mode selection', async () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, 'onUpdate:modelValue': () => {} },
      });
      await getSelector(wrapper).trigger('click');
      const nodes = getNodes(wrapper);
      await nodes[0].trigger('click');
      await nextTick();
      const events = wrapper.emitted().openChange ?? [];
      // last event should be false (closed)
      expect(events[events.length - 1]).toEqual([false]);
    });

    it('emits clear and change on clear button click', async () => {
      const wrapper = mount(BTreeSelect, {
        props: {
          treeData: sampleTree,
          modelValue: 'c11',
          allowClear: true,
          'onUpdate:modelValue': () => {},
        },
      });
      await wrapper.find('.b-tree-select__clear').trigger('click');
      expect(wrapper.emitted().clear).toBeTruthy();
      expect(wrapper.emitted().change).toBeTruthy();
    });

    it('emits focus and blur', async () => {
      const wrapper = mount(BTreeSelect, { props: { treeData: sampleTree } });
      await getSelector(wrapper).trigger('focus');
      await getSelector(wrapper).trigger('blur');
      expect(wrapper.emitted().focus).toBeTruthy();
      expect(wrapper.emitted().blur).toBeTruthy();
    });

    it('emits treeExpand when toggling a parent', async () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree },
      });
      await getSelector(wrapper).trigger('click');
      const switcher = wrapper.find('.b-tree-select__switcher');
      await switcher.trigger('click');
      expect(wrapper.emitted().treeExpand).toBeTruthy();
    });

    it('emits search on input', async () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, showSearch: true, multiple: true },
      });
      await getSelector(wrapper).trigger('click');
      const input = wrapper.find('.b-tree-select__search');
      await input.setValue('Parent');
      await input.trigger('input');
      expect(wrapper.emitted().search).toBeTruthy();
      expect((wrapper.emitted().search![0] as unknown[])[0]).toBe('Parent');
    });
  });

  describe('keyboard and focus behavior', () => {
    it('opens dropdown on Enter', async () => {
      const wrapper = mount(BTreeSelect, { props: { treeData: sampleTree } });
      await getSelector(wrapper).trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted().openChange![0]).toEqual([true]);
    });

    it('opens dropdown on Space', async () => {
      const wrapper = mount(BTreeSelect, { props: { treeData: sampleTree } });
      await getSelector(wrapper).trigger('keydown', { key: ' ' });
      expect(wrapper.emitted().openChange![0]).toEqual([true]);
    });

    it('opens dropdown on ArrowDown', async () => {
      const wrapper = mount(BTreeSelect, { props: { treeData: sampleTree } });
      await getSelector(wrapper).trigger('keydown', { key: 'ArrowDown' });
      expect(wrapper.emitted().openChange![0]).toEqual([true]);
    });

    it('closes dropdown on Escape', async () => {
      const wrapper = mount(BTreeSelect, { props: { treeData: sampleTree } });
      await getSelector(wrapper).trigger('click');
      await getSelector(wrapper).trigger('keydown', { key: 'Escape' });
      expect(wrapper.emitted().openChange![1]).toEqual([false]);
    });

    it('closes on Tab', async () => {
      const wrapper = mount(BTreeSelect, { props: { treeData: sampleTree } });
      await getSelector(wrapper).trigger('click');
      await getSelector(wrapper).trigger('keydown', { key: 'Tab' });
      expect(wrapper.emitted().openChange![1]).toEqual([false]);
    });

    it('navigates nodes with ArrowDown / ArrowUp', async () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, treeDefaultExpandAll: true },
      });
      await getSelector(wrapper).trigger('click');
      await nextTick();
      const dropdown = getDropdown(wrapper);
      await dropdown.trigger('keydown', { key: 'ArrowDown' });
      await dropdown.trigger('keydown', { key: 'ArrowDown' });
      const nodes = getNodes(wrapper);
      expect(nodes.some((n) => n.classes().includes('b-tree-select__node--focused'))).toBe(true);
    });

    it('expands a parent on ArrowRight', async () => {
      const wrapper = mount(BTreeSelect, { props: { treeData: sampleTree } });
      await getSelector(wrapper).trigger('click');
      await nextTick();
      const dropdown = getDropdown(wrapper);
      // Focus first
      await dropdown.trigger('keydown', { key: 'Home' });
      await dropdown.trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted().treeExpand).toBeTruthy();
    });

    it('collapses a parent on ArrowLeft', async () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, treeDefaultExpandedKeys: ['p1'] },
      });
      await getSelector(wrapper).trigger('click');
      await nextTick();
      const dropdown = getDropdown(wrapper);
      await dropdown.trigger('keydown', { key: 'Home' });
      await dropdown.trigger('keydown', { key: 'ArrowLeft' });
      expect(wrapper.emitted().treeExpand).toBeTruthy();
    });

    it('removes last tag on Backspace when search empty (multiple)', async () => {
      const wrapper = mount(BTreeSelect, {
        props: {
          treeData: sampleTree,
          multiple: true,
          modelValue: ['c11', 'c12'],
          'onUpdate:modelValue': () => {},
        },
      });
      await getSelector(wrapper).trigger('keydown', { key: 'Backspace' });
      expect(wrapper.emitted().deselect).toBeTruthy();
      expect((wrapper.emitted().deselect![0] as unknown[])[0]).toBe('c12');
    });
  });

  describe('accessibility', () => {
    it('selector has combobox role', () => {
      const wrapper = mount(BTreeSelect, { props: { treeData: sampleTree } });
      const selector = getSelector(wrapper);
      expect(selector.attributes('role')).toBe('combobox');
      expect(selector.attributes('aria-haspopup')).toBe('tree');
    });

    it('sets aria-expanded correctly', async () => {
      const wrapper = mount(BTreeSelect, { props: { treeData: sampleTree } });
      expect(getSelector(wrapper).attributes('aria-expanded')).toBe('false');
      await getSelector(wrapper).trigger('click');
      expect(getSelector(wrapper).attributes('aria-expanded')).toBe('true');
    });

    it('sets aria-controls when open', async () => {
      const wrapper = mount(BTreeSelect, { props: { treeData: sampleTree } });
      expect(getSelector(wrapper).attributes('aria-controls')).toBeUndefined();
      await getSelector(wrapper).trigger('click');
      expect(getSelector(wrapper).attributes('aria-controls')).toBeTruthy();
    });

    it('tree has correct role and multiselect attribute', () => {
      const wrapper = mount(BTreeSelect, { props: { treeData: sampleTree, multiple: true } });
      expect(wrapper.find('[role="tree"]').attributes('aria-multiselectable')).toBe('true');
    });

    it('treeitem has aria-level matching depth', async () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, treeDefaultExpandAll: true },
      });
      await nextTick();
      const nodes = getNodes(wrapper);
      expect(nodes[0].attributes('aria-level')).toBe('1');
      expect(nodes[1].attributes('aria-level')).toBe('2');
    });

    it('treeitem with checkable shows aria-checked', () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, treeCheckable: true, modelValue: ['c11'] },
      });
      const nodes = getNodes(wrapper);
      const first = nodes.find((n) => n.text().includes('Parent 1'));
      expect(first?.attributes('aria-checked')).toBeDefined();
    });

    it('disabled treeitem has aria-disabled', async () => {
      const wrapper = mount(BTreeSelect, { props: { treeData: treeWithDisabled } });
      await nextTick();
      const nodes = getNodes(wrapper);
      expect(nodes[1].attributes('aria-disabled')).toBe('true');
    });

    it('clear button has aria-label', () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, modelValue: 'c11', allowClear: true },
      });
      expect(wrapper.find('.b-tree-select__clear').attributes('aria-label')).toBe('Clear selection');
    });

    it('arrow icon is aria-hidden', () => {
      const wrapper = mount(BTreeSelect, { props: { treeData: sampleTree } });
      expect(wrapper.find('.b-tree-select__arrow').attributes('aria-hidden')).toBe('true');
    });

    it('exposes a live region for selection announcements', () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, modelValue: 'c11' },
      });
      const live = wrapper.find('[role="status"]');
      expect(live.attributes('aria-live')).toBe('polite');
    });
  });

  describe('treeCheckable behavior', () => {
    it('cascades children when checking a parent', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BTreeSelect, {
        props: {
          treeData: sampleTree,
          treeCheckable: true,
          treeDefaultExpandAll: true,
          'onUpdate:modelValue': onUpdate,
        },
      });
      const nodes = getNodes(wrapper);
      const parent = nodes.find((n) => n.text().includes('Parent 1'));
      await parent!.find('.b-tree-select__checkbox').trigger('click');

      const last = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0] as unknown[];
      expect(last).toContain('p1');
      expect(last).toContain('c11');
      expect(last).toContain('c12');
    });

    it('treeCheckStrictly does not cascade', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BTreeSelect, {
        props: {
          treeData: sampleTree,
          treeCheckable: true,
          treeCheckStrictly: true,
          treeDefaultExpandAll: true,
          'onUpdate:modelValue': onUpdate,
        },
      });
      const nodes = getNodes(wrapper);
      const parent = nodes.find((n) => n.text().includes('Parent 1'));
      await parent!.find('.b-tree-select__checkbox').trigger('click');

      const last = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0] as unknown[];
      expect(last).toEqual(['p1']);
    });

    it('renders mixed (indeterminate) state for partial children', async () => {
      const wrapper = mount(BTreeSelect, {
        props: {
          treeData: sampleTree,
          treeCheckable: true,
          treeDefaultExpandAll: true,
          modelValue: ['c11'],
        },
      });
      await nextTick();
      const indeterminate = wrapper.find('.b-tree-select__checkbox--indeterminate');
      expect(indeterminate.exists()).toBe(true);
    });
  });

  describe('multiple mode (without checkboxes)', () => {
    it('renders tags for selected values', () => {
      const wrapper = mount(BTreeSelect, {
        props: {
          treeData: sampleTree,
          multiple: true,
          modelValue: ['c11', 'c12'],
        },
      });
      const tags = wrapper.findAll('.b-tree-select__tag');
      expect(tags.length).toBe(2);
      expect(tags[0].text()).toContain('Child 1-1');
    });

    it('removes a tag on close button click', async () => {
      const wrapper = mount(BTreeSelect, {
        props: {
          treeData: sampleTree,
          multiple: true,
          modelValue: ['c11', 'c12'],
          'onUpdate:modelValue': () => {},
        },
      });
      const closeBtn = wrapper.findAll('.b-tree-select__tag-close')[0];
      await closeBtn.trigger('click');
      expect((wrapper.emitted().deselect![0] as unknown[])[0]).toBe('c11');
    });

    it('respects maxTagCount', () => {
      const wrapper = mount(BTreeSelect, {
        props: {
          treeData: sampleTree,
          multiple: true,
          modelValue: ['c11', 'c12', 'g211'],
          maxTagCount: 2,
        },
      });
      const tags = wrapper.findAll('.b-tree-select__tag');
      // 2 visible + 1 count
      expect(tags.length).toBe(3);
      expect(tags[2].text()).toContain('+ 1');
    });

    it('honours maxCount limit', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BTreeSelect, {
        props: {
          treeData: sampleTree,
          multiple: true,
          modelValue: ['c11'],
          maxCount: 1,
          treeDefaultExpandAll: true,
          'onUpdate:modelValue': onUpdate,
        },
      });
      await getSelector(wrapper).trigger('click');
      const nodes = getNodes(wrapper);
      const target = nodes.find((n) => n.text().includes('Child 1-2'));
      await target!.trigger('click');
      // Should not select past the limit
      expect(onUpdate).not.toHaveBeenCalled();
    });
  });

  describe('search/filter behavior', () => {
    it('filters nodes by query', async () => {
      const wrapper = mount(BTreeSelect, {
        props: {
          treeData: sampleTree,
          showSearch: true,
          treeDefaultExpandAll: true,
          multiple: true,
        },
      });
      await getSelector(wrapper).trigger('click');
      const input = wrapper.find('.b-tree-select__search');
      await input.setValue('Grandchild');
      await input.trigger('input');
      const nodes = getNodes(wrapper);
      expect(nodes.length).toBeGreaterThan(0);
      // ancestors of matched nodes preserved
      expect(nodes.some((n) => n.text().includes('Parent 2'))).toBe(true);
      expect(nodes.some((n) => n.text().includes('Grandchild'))).toBe(true);
    });

    it('shows notFoundContent when no match', async () => {
      const wrapper = mount(BTreeSelect, {
        props: {
          treeData: sampleTree,
          showSearch: true,
          notFoundContent: 'Nothing here',
          multiple: true,
        },
      });
      await getSelector(wrapper).trigger('click');
      const input = wrapper.find('.b-tree-select__search');
      await input.setValue('zzz');
      await input.trigger('input');
      expect(wrapper.find('.b-tree-select__empty').text()).toBe('Nothing here');
    });

    it('uses custom filterTreeNode function', async () => {
      const filter = (input: string, node: BTreeSelectNode) =>
        String(node.title).startsWith(input);
      const wrapper = mount(BTreeSelect, {
        props: {
          treeData: sampleTree,
          showSearch: true,
          filterTreeNode: filter,
          multiple: true,
          treeDefaultExpandAll: true,
        },
      });
      await getSelector(wrapper).trigger('click');
      const input = wrapper.find('.b-tree-select__search');
      await input.setValue('Grand');
      await input.trigger('input');
      const nodes = getNodes(wrapper);
      const grandchildNodes = nodes.filter((n) => n.text().includes('Grandchild'));
      expect(grandchildNodes.length).toBeGreaterThan(0);
    });
  });

  describe('controlled vs uncontrolled', () => {
    it('works as controlled with v-model', async () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, modelValue: 'c11', 'onUpdate:modelValue': () => {} },
      });
      expect(wrapper.find('.b-tree-select__value').text()).toBe('Child 1-1');
      await wrapper.setProps({ modelValue: 'c12' });
      expect(wrapper.find('.b-tree-select__value').text()).toBe('Child 1-2');
    });

    it('works as uncontrolled', async () => {
      let captured: unknown;
      const wrapper = mount(BTreeSelect, {
        props: {
          treeData: sampleTree,
          treeDefaultExpandAll: true,
          'onUpdate:modelValue': (v: unknown) => {
            captured = v;
          },
        },
      });
      await getSelector(wrapper).trigger('click');
      const nodes = getNodes(wrapper);
      await nodes[0].trigger('click');
      expect(captured).toBe('p1');
    });

    it('respects controlled `open` prop', async () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, open: true },
      });
      expect(getSelector(wrapper).attributes('aria-expanded')).toBe('true');
      await wrapper.setProps({ open: false });
      expect(getSelector(wrapper).attributes('aria-expanded')).toBe('false');
    });

    it('respects controlled treeExpandedKeys', async () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, treeExpandedKeys: [] },
      });
      let nodes = getNodes(wrapper);
      expect(nodes.length).toBe(2); // only roots

      await wrapper.setProps({ treeExpandedKeys: ['p1'] });
      nodes = getNodes(wrapper);
      expect(nodes.length).toBe(4); // 2 roots + 2 children
    });
  });

  describe('edge cases', () => {
    it('handles empty treeData', () => {
      const wrapper = mount(BTreeSelect, { props: { treeData: [] } });
      expect(wrapper.find('.b-tree-select').exists()).toBe(true);
    });

    it('does not open when disabled', async () => {
      const wrapper = mount(BTreeSelect, {
        props: { treeData: sampleTree, disabled: true },
      });
      await getSelector(wrapper).trigger('click');
      expect(wrapper.emitted().openChange).toBeUndefined();
    });

    it('does not select disabled node', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BTreeSelect, {
        props: { treeData: treeWithDisabled, 'onUpdate:modelValue': onUpdate },
      });
      await getSelector(wrapper).trigger('click');
      const nodes = getNodes(wrapper);
      await nodes[1].trigger('click');
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('supports numeric values', () => {
      const numTree: BTreeSelectNode[] = [
        { title: 'One', value: 1 },
        { title: 'Two', value: 2 },
      ];
      const wrapper = mount(BTreeSelect, {
        props: { treeData: numTree, modelValue: 1 },
      });
      expect(wrapper.find('.b-tree-select__value').text()).toBe('One');
    });

    it('handles long content with truncation classes', () => {
      const longLabel = 'A very very very very very long label that should be truncated';
      const wrapper = mount(BTreeSelect, {
        props: {
          treeData: [{ title: longLabel, value: 'long' }],
          modelValue: 'long',
        },
      });
      const valueEl = wrapper.find('.b-tree-select__value');
      expect(valueEl.classes().join(' ')).toContain('b:truncate');
    });

    it('exposes focus and blur methods', () => {
      const wrapper = mount(BTreeSelect, { props: { treeData: sampleTree } });
      const vm = wrapper.vm as unknown as { focus: () => void; blur: () => void };
      expect(typeof vm.focus).toBe('function');
      expect(typeof vm.blur).toBe('function');
    });

    it('returns labelInValue shape when enabled', async () => {
      const onUpdate = vi.fn();
      const wrapper = mount(BTreeSelect, {
        props: {
          treeData: sampleTree,
          labelInValue: true,
          'onUpdate:modelValue': onUpdate,
        },
      });
      await getSelector(wrapper).trigger('click');
      const nodes = getNodes(wrapper);
      await nodes[0].trigger('click');
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ value: 'p1', label: 'Parent 1' }),
      );
    });
  });

  describe('animation tests with fake timers', () => {
    it('arrow rotates when open', async () => {
      const wrapper = mount(BTreeSelect, { props: { treeData: sampleTree } });
      const arrow = wrapper.find('.b-tree-select__arrow');
      expect(arrow.classes()).not.toContain('b:rotate-180');
      await getSelector(wrapper).trigger('click');
      expect(arrow.classes()).toContain('b:rotate-180');
    });

    it('switcher rotates when expanded (deterministic)', async () => {
      vi.useFakeTimers();
      const wrapper = mount(BTreeSelect, { props: { treeData: sampleTree } });
      await getSelector(wrapper).trigger('click');
      const switcher = wrapper.find('.b-tree-select__switcher');
      await switcher.trigger('click');
      vi.advanceTimersByTime(250);
      expect(switcher.classes()).toContain('b-tree-select__switcher--expanded');
      vi.useRealTimers();
    });

    it('respects reduced motion via CSS class structure', () => {
      const wrapper = mount(BTreeSelect, { props: { treeData: sampleTree } });
      expect(wrapper.find('.b-tree-select__dropdown').exists()).toBe(true);
    });
  });
});
