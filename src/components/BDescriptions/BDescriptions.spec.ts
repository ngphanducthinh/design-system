import { h } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import BDescriptions from './BDescriptions.vue';
import BDescriptionsItem from './BDescriptionsItem.vue';
import type { BDescriptionsItem as BDescriptionsItemData } from './types';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function mountDescriptions(props = {}, slots: Record<string, unknown> = {}) {
  return mount(BDescriptions, { props, slots });
}

const sampleItems: BDescriptionsItemData[] = [
  { label: 'UserName', children: 'Zhou Maomao' },
  { label: 'Telephone', children: '1810000000' },
  { label: 'Live', children: 'Hangzhou, Zhejiang' },
  { label: 'Remark', children: 'Empty' },
  { label: 'Address', children: 'No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China' },
];

function slotItems() {
  return [
    h(BDescriptionsItem, { label: 'UserName' }, { default: () => 'Zhou Maomao' }),
    h(BDescriptionsItem, { label: 'Telephone' }, { default: () => '1810000000' }),
    h(BDescriptionsItem, { label: 'Live' }, { default: () => 'Hangzhou, Zhejiang' }),
  ];
}

// ─────────────────────────────────────────────
// 1. Defaults & variants render
// ─────────────────────────────────────────────
describe('BDescriptions – defaults and variants', () => {
  it('renders root .b-descriptions element', () => {
    const wrapper = mountDescriptions({ items: sampleItems });
    expect(wrapper.find('.b-descriptions').exists()).toBe(true);
  });

  it('defaults to horizontal layout', () => {
    const wrapper = mountDescriptions({ items: sampleItems });
    expect(wrapper.find('.b-descriptions--horizontal').exists()).toBe(true);
    expect(wrapper.find('.b-descriptions--vertical').exists()).toBe(false);
  });

  it('renders without border by default', () => {
    const wrapper = mountDescriptions({ items: sampleItems });
    expect(wrapper.find('.b-descriptions--bordered').exists()).toBe(false);
  });

  it('renders colon class by default', () => {
    const wrapper = mountDescriptions({ items: sampleItems });
    expect(wrapper.find('.b-descriptions--colon').exists()).toBe(true);
  });

  it('renders bordered variant', () => {
    const wrapper = mountDescriptions({ items: sampleItems, bordered: true });
    expect(wrapper.find('.b-descriptions--bordered').exists()).toBe(true);
  });

  it('renders vertical layout', () => {
    const wrapper = mountDescriptions({ items: sampleItems, layout: 'vertical' });
    expect(wrapper.find('.b-descriptions--vertical').exists()).toBe(true);
    expect(wrapper.find('.b-descriptions--horizontal').exists()).toBe(false);
  });

  it('renders middle size variant', () => {
    const wrapper = mountDescriptions({ items: sampleItems, size: 'middle' });
    expect(wrapper.find('.b-descriptions--middle').exists()).toBe(true);
  });

  it('renders small size variant', () => {
    const wrapper = mountDescriptions({ items: sampleItems, size: 'small' });
    expect(wrapper.find('.b-descriptions--small').exists()).toBe(true);
  });

  it('renders without size modifier for default size', () => {
    const wrapper = mountDescriptions({ items: sampleItems, size: 'default' });
    expect(wrapper.find('.b-descriptions--middle').exists()).toBe(false);
    expect(wrapper.find('.b-descriptions--small').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behavior
// ─────────────────────────────────────────────
describe('BDescriptions – props map to DOM', () => {
  it('renders title as text', () => {
    const wrapper = mountDescriptions({ title: 'User Info', items: sampleItems });
    expect(wrapper.find('.b-descriptions__title').text()).toBe('User Info');
  });

  it('renders extra as text', () => {
    const wrapper = mountDescriptions({ title: 'Title', extra: 'Edit', items: sampleItems });
    expect(wrapper.find('.b-descriptions__extra').text()).toBe('Edit');
  });

  it('renders title slot overriding prop', () => {
    const wrapper = mountDescriptions(
      { title: 'Prop Title', items: sampleItems },
      { title: () => 'Slot Title' },
    );
    expect(wrapper.find('.b-descriptions__title').text()).toBe('Slot Title');
  });

  it('renders extra slot overriding prop', () => {
    const wrapper = mountDescriptions(
      { title: 'Title', extra: 'Prop Extra', items: sampleItems },
      { extra: () => 'Slot Extra' },
    );
    expect(wrapper.find('.b-descriptions__extra').text()).toBe('Slot Extra');
  });

  it('does not render header when no title or extra', () => {
    const wrapper = mountDescriptions({ items: sampleItems });
    expect(wrapper.find('.b-descriptions__header').exists()).toBe(false);
  });

  it('renders items from items prop', () => {
    const wrapper = mountDescriptions({ items: sampleItems, column: 3 });
    const labels = wrapper.findAll('.b-descriptions__item-label');
    expect(labels.length).toBeGreaterThanOrEqual(5);
    expect(labels[0].text()).toBe('UserName');
  });

  it('renders item content from items prop', () => {
    const wrapper = mountDescriptions({ items: sampleItems, column: 3 });
    const contents = wrapper.findAll('.b-descriptions__item-content');
    expect(contents[0].text()).toBe('Zhou Maomao');
  });

  it('renders items from BDescriptionsItem slot children', () => {
    const wrapper = mountDescriptions({}, { default: slotItems });
    const labels = wrapper.findAll('.b-descriptions__item-label');
    expect(labels.length).toBeGreaterThanOrEqual(3);
    expect(labels[0].text()).toBe('UserName');
  });

  it('renders slot item content', () => {
    const wrapper = mountDescriptions({}, { default: slotItems });
    const contents = wrapper.findAll('.b-descriptions__item-content');
    expect(contents[0].text()).toBe('Zhou Maomao');
  });

  it('hides colon class when colon=false', () => {
    const wrapper = mountDescriptions({ items: sampleItems, colon: false });
    expect(wrapper.find('.b-descriptions--colon').exists()).toBe(false);
  });

  it('respects column prop for row distribution', () => {
    const items: BDescriptionsItemData[] = [
      { label: 'A', children: '1' },
      { label: 'B', children: '2' },
      { label: 'C', children: '3' },
      { label: 'D', children: '4' },
    ];
    const wrapper = mountDescriptions({ items, column: 2 });
    const rows = wrapper.findAll('.b-descriptions__row');
    expect(rows.length).toBe(2);
  });

  it('renders bordered table with th for labels and td for content', () => {
    const wrapper = mountDescriptions({ items: sampleItems, bordered: true });
    expect(wrapper.findAll('th.b-descriptions__item-label--bordered').length).toBeGreaterThan(0);
    expect(wrapper.findAll('td.b-descriptions__item-content--bordered').length).toBeGreaterThan(0);
  });

  it('applies labelStyle from prop', () => {
    const items: BDescriptionsItemData[] = [
      { label: 'Name', children: 'Test', labelStyle: { color: 'red' } },
    ];
    const wrapper = mountDescriptions({ items });
    const label = wrapper.find('.b-descriptions__item-label');
    expect(label.attributes('style')).toContain('color: red');
  });

  it('applies contentStyle from prop', () => {
    const items: BDescriptionsItemData[] = [
      { label: 'Name', children: 'Test', contentStyle: { fontWeight: 'bold' } },
    ];
    const wrapper = mountDescriptions({ items });
    const content = wrapper.find('.b-descriptions__item-content');
    expect(content.attributes('style')).toContain('font-weight: bold');
  });

  it('merges global labelStyle with item labelStyle', () => {
    const items: BDescriptionsItemData[] = [
      { label: 'Name', children: 'Test', labelStyle: { color: 'red' } },
    ];
    const wrapper = mountDescriptions({
      items,
      labelStyle: { fontWeight: 'bold' },
    });
    const label = wrapper.find('.b-descriptions__item-label');
    const style = label.attributes('style')!;
    expect(style).toContain('font-weight: bold');
    expect(style).toContain('color: red');
  });

  it('item labelStyle overrides global labelStyle', () => {
    const items: BDescriptionsItemData[] = [
      { label: 'Name', children: 'Test', labelStyle: { fontWeight: '400' } },
    ];
    const wrapper = mountDescriptions({
      items,
      labelStyle: { fontWeight: 'bold' },
    });
    const label = wrapper.find('.b-descriptions__item-label');
    expect(label.attributes('style')).toContain('font-weight: 400');
  });
});

// ─────────────────────────────────────────────
// 3. Span behavior
// ─────────────────────────────────────────────
describe('BDescriptions – span behavior', () => {
  it('last item in a row fills remaining space', () => {
    const items: BDescriptionsItemData[] = [
      { label: 'A', children: '1' },
      { label: 'B', children: '2' },
    ];
    // column=3, two items → second item should span remaining 2 cols
    const wrapper = mountDescriptions({ items, column: 3 });
    const cells = wrapper.findAll('.b-descriptions__item');
    // Second cell should have colspan=2
    expect(cells[1].attributes('colspan')).toBe('2');
  });

  it('respects explicit span on items', () => {
    const items: BDescriptionsItemData[] = [
      { label: 'A', children: '1', span: 2 },
      { label: 'B', children: '2' },
    ];
    const wrapper = mountDescriptions({ items, column: 3 });
    const cells = wrapper.findAll('.b-descriptions__item');
    expect(cells[0].attributes('colspan')).toBe('2');
  });

  it('handles span exceeding column count by capping', () => {
    const items: BDescriptionsItemData[] = [
      { label: 'A', children: '1', span: 5 },
      { label: 'B', children: '2' },
    ];
    const wrapper = mountDescriptions({ items, column: 3 });
    // First item spans full row (3), second item on new row spanning all 3
    const rows = wrapper.findAll('.b-descriptions__row');
    expect(rows.length).toBe(2);
  });

  it('bordered mode uses colspan for spanning items', () => {
    const items: BDescriptionsItemData[] = [
      { label: 'A', children: '1', span: 2 },
      { label: 'B', children: '2' },
    ];
    const wrapper = mountDescriptions({ items, column: 3, bordered: true });
    const contentCells = wrapper.findAll('td.b-descriptions__item-content--bordered');
    // First content cell: effectiveSpan=2, colspan = 2*2-1 = 3
    expect(Number(contentCells[0].attributes('colspan'))).toBeGreaterThan(1);
  });
});

// ─────────────────────────────────────────────
// 4. Vertical layout
// ─────────────────────────────────────────────
describe('BDescriptions – vertical layout', () => {
  it('renders labels and content in separate rows (non-bordered)', () => {
    const items: BDescriptionsItemData[] = [
      { label: 'A', children: '1' },
      { label: 'B', children: '2' },
      { label: 'C', children: '3' },
    ];
    const wrapper = mountDescriptions({ items, layout: 'vertical', column: 3 });
    const rows = wrapper.findAll('.b-descriptions__row');
    // One row of labels + one row of content = 2 rows for 1 logical row
    expect(rows.length).toBe(2);
  });

  it('renders labels and content in separate rows (bordered)', () => {
    const items: BDescriptionsItemData[] = [
      { label: 'A', children: '1' },
      { label: 'B', children: '2' },
      { label: 'C', children: '3' },
    ];
    const wrapper = mountDescriptions({ items, layout: 'vertical', column: 3, bordered: true });
    const rows = wrapper.findAll('.b-descriptions__row');
    // label row + content row = 2
    expect(rows.length).toBe(2);
  });

  it('bordered vertical labels use th elements', () => {
    const items: BDescriptionsItemData[] = [
      { label: 'A', children: '1' },
    ];
    const wrapper = mountDescriptions({ items, layout: 'vertical', bordered: true });
    expect(wrapper.find('th.b-descriptions__item-label--bordered').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 5. Accessibility
// ─────────────────────────────────────────────
describe('BDescriptions – accessibility', () => {
  it('table has role="presentation"', () => {
    const wrapper = mountDescriptions({ items: sampleItems });
    expect(wrapper.find('.b-descriptions__table').attributes('role')).toBe('presentation');
  });

  it('bordered table has role="presentation"', () => {
    const wrapper = mountDescriptions({ items: sampleItems, bordered: true });
    expect(wrapper.find('.b-descriptions__table').attributes('role')).toBe('presentation');
  });

  it('uses th elements for labels in bordered mode (semantic emphasis)', () => {
    const wrapper = mountDescriptions({ items: sampleItems, bordered: true });
    const ths = wrapper.findAll('th.b-descriptions__item-label--bordered');
    expect(ths.length).toBe(sampleItems.length);
  });

  it('uses td elements for content in bordered mode', () => {
    const wrapper = mountDescriptions({ items: sampleItems, bordered: true });
    const tds = wrapper.findAll('td.b-descriptions__item-content--bordered');
    expect(tds.length).toBe(sampleItems.length);
  });
});

// ─────────────────────────────────────────────
// 6. Edge cases
// ─────────────────────────────────────────────
describe('BDescriptions – edge cases', () => {
  it('renders with no items and no slots', () => {
    const wrapper = mountDescriptions();
    expect(wrapper.find('.b-descriptions').exists()).toBe(true);
    expect(wrapper.find('.b-descriptions__header').exists()).toBe(false);
    expect(wrapper.findAll('.b-descriptions__row').length).toBe(0);
  });

  it('renders with empty items array', () => {
    const wrapper = mountDescriptions({ items: [] });
    expect(wrapper.find('.b-descriptions').exists()).toBe(true);
    expect(wrapper.findAll('.b-descriptions__row').length).toBe(0);
  });

  it('renders with single item', () => {
    const items: BDescriptionsItemData[] = [{ label: 'Only', children: 'One' }];
    const wrapper = mountDescriptions({ items, column: 3 });
    const labels = wrapper.findAll('.b-descriptions__item-label');
    expect(labels.length).toBe(1);
    expect(labels[0].text()).toBe('Only');
  });

  it('handles long content gracefully', () => {
    const longText = 'A'.repeat(500);
    const items: BDescriptionsItemData[] = [{ label: 'Long', children: longText }];
    const wrapper = mountDescriptions({ items });
    expect(wrapper.find('.b-descriptions__item-content').text()).toBe(longText);
  });

  it('handles items without labels', () => {
    const items: BDescriptionsItemData[] = [{ children: 'No label here' }];
    const wrapper = mountDescriptions({ items });
    const content = wrapper.find('.b-descriptions__item-content');
    expect(content.text()).toBe('No label here');
  });

  it('handles items without content', () => {
    const items: BDescriptionsItemData[] = [{ label: 'Empty content' }];
    const wrapper = mountDescriptions({ items });
    const label = wrapper.find('.b-descriptions__item-label');
    expect(label.text()).toBe('Empty content');
  });

  it('updates title reactively', async () => {
    const wrapper = mountDescriptions({ title: 'Old Title', items: sampleItems });
    expect(wrapper.find('.b-descriptions__title').text()).toBe('Old Title');
    await wrapper.setProps({ title: 'New Title' });
    expect(wrapper.find('.b-descriptions__title').text()).toBe('New Title');
  });

  it('updates items reactively', async () => {
    const wrapper = mountDescriptions({
      items: [{ label: 'A', children: '1' }],
    });
    expect(wrapper.find('.b-descriptions__item-label').text()).toBe('A');
    await wrapper.setProps({
      items: [{ label: 'B', children: '2' }],
    });
    expect(wrapper.find('.b-descriptions__item-label').text()).toBe('B');
  });

  it('toggles bordered reactively', async () => {
    const wrapper = mountDescriptions({ items: sampleItems, bordered: false });
    expect(wrapper.find('.b-descriptions--bordered').exists()).toBe(false);
    await wrapper.setProps({ bordered: true });
    expect(wrapper.find('.b-descriptions--bordered').exists()).toBe(true);
  });

  it('toggles layout reactively', async () => {
    const wrapper = mountDescriptions({ items: sampleItems, layout: 'horizontal' });
    expect(wrapper.find('.b-descriptions--horizontal').exists()).toBe(true);
    await wrapper.setProps({ layout: 'vertical' });
    expect(wrapper.find('.b-descriptions--vertical').exists()).toBe(true);
    expect(wrapper.find('.b-descriptions--horizontal').exists()).toBe(false);
  });

  it('column=1 renders one item per row', () => {
    const items: BDescriptionsItemData[] = [
      { label: 'A', children: '1' },
      { label: 'B', children: '2' },
      { label: 'C', children: '3' },
    ];
    const wrapper = mountDescriptions({ items, column: 1 });
    const rows = wrapper.findAll('.b-descriptions__row');
    expect(rows.length).toBe(3);
  });

  it('header appears when only extra slot is provided', () => {
    const wrapper = mountDescriptions(
      { items: sampleItems },
      { extra: () => 'Extra only' },
    );
    expect(wrapper.find('.b-descriptions__header').exists()).toBe(true);
    expect(wrapper.find('.b-descriptions__extra').text()).toBe('Extra only');
  });

  it('renders with BDescriptionsItem label slot', () => {
    const wrapper = mountDescriptions({}, {
      default: () => [
        h(
          BDescriptionsItem,
          {},
          {
            label: () => h('strong', 'Bold Label'),
            default: () => 'Content',
          },
        ),
      ],
    });
    // Debug: check what's actually rendered
    const html = wrapper.html();
    // When using VNodes with h(), the parent BDescriptions extracts slots from the VNode.children
    // The label slot VNodes are rendered via the functional component pattern
    expect(html).toContain('Bold Label');
    expect(html).toContain('Content');
  });
});

// ─────────────────────────────────────────────
// 7. BDescriptionsItem (standalone)
// ─────────────────────────────────────────────
describe('BDescriptionsItem – standalone', () => {
  it('renders root .b-descriptions-item element', () => {
    const wrapper = mount(BDescriptionsItem, {
      props: { label: 'Name' },
      slots: { default: () => 'Value' },
    });
    expect(wrapper.find('.b-descriptions-item').exists()).toBe(true);
  });

  it('renders label from prop', () => {
    const wrapper = mount(BDescriptionsItem, {
      props: { label: 'Name' },
      slots: { default: () => 'Value' },
    });
    expect(wrapper.find('.b-descriptions-item__label').text()).toBe('Name');
  });

  it('renders content from default slot', () => {
    const wrapper = mount(BDescriptionsItem, {
      props: { label: 'Name' },
      slots: { default: () => 'Some Content' },
    });
    expect(wrapper.find('.b-descriptions-item__content').text()).toBe('Some Content');
  });

  it('renders label slot overriding prop', () => {
    const wrapper = mount(BDescriptionsItem, {
      props: { label: 'Prop Label' },
      slots: {
        label: () => 'Slot Label',
        default: () => 'Content',
      },
    });
    expect(wrapper.find('.b-descriptions-item__label').text()).toBe('Slot Label');
  });

  it('applies labelStyle', () => {
    const wrapper = mount(BDescriptionsItem, {
      props: { label: 'Name', labelStyle: { color: 'blue' } },
      slots: { default: () => 'Value' },
    });
    expect(wrapper.find('.b-descriptions-item__label').attributes('style')).toContain('color: blue');
  });

  it('applies contentStyle', () => {
    const wrapper = mount(BDescriptionsItem, {
      props: { label: 'Name', contentStyle: { fontWeight: 'bold' } },
      slots: { default: () => 'Value' },
    });
    expect(wrapper.find('.b-descriptions-item__content').attributes('style')).toContain('font-weight: bold');
  });

  it('defaults span to 1', () => {
    const wrapper = mount(BDescriptionsItem, {
      props: { label: 'Name' },
      slots: { default: () => 'Value' },
    });
    // Verify via exposed span
    expect((wrapper.vm as unknown as { span: number }).span).toBe(1);
  });
});
