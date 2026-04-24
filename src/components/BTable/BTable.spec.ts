import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BTable from './BTable.vue';
import type { BTableColumnType, BTableRowSelection } from './types';

// Convenience alias for untyped column/data to avoid invariance errors at mount() call sites
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyCol = BTableColumnType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = Record<string, any>[];

// ─────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────

interface User extends Record<string, unknown> {
  key: string;
  name: string;
  age: number;
  address: string;
  status?: string;
  children?: User[];
}

const COLUMNS: BTableColumnType<User>[] = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Age', dataIndex: 'age', key: 'age' },
  { title: 'Address', dataIndex: 'address', key: 'address' },
];

const DATA: User[] = [
  { key: '1', name: 'Alice', age: 32, address: '10 Downing St' },
  { key: '2', name: 'Bob', age: 42, address: '221B Baker St' },
  { key: '3', name: 'Carol', age: 28, address: '4 Privet Drive' },
];

function mountTable(props: Record<string, unknown> = {}) {
  return mount(BTable, {
    props: { dataSource: DATA as AnyData, columns: COLUMNS as AnyCol[], ...props },
    attachTo: document.body,
  });
}

// ─────────────────────────────────────────────
// 1. Defaults and variants
// ─────────────────────────────────────────────

describe('BTable – defaults and variants', () => {
  it('renders the root .b-table element', () => {
    const w = mountTable();
    expect(w.find('.b-table').exists()).toBe(true);
  });

  it('renders a <table> element with role="table"', () => {
    const w = mountTable();
    const table = w.find('.b-table__table');
    expect(table.element.tagName).toBe('TABLE');
    expect(table.attributes('role')).toBe('table');
  });

  it('renders a thead when showHeader is true (default)', () => {
    const w = mountTable();
    expect(w.find('.b-table__thead').exists()).toBe(true);
  });

  it('does not render thead when showHeader=false', () => {
    const w = mountTable({ showHeader: false });
    expect(w.find('.b-table__thead').exists()).toBe(false);
  });

  it('renders correct number of header columns', () => {
    const w = mountTable();
    const ths = w.findAll('.b-table__th');
    expect(ths.length).toBe(COLUMNS.length);
  });

  it('renders correct number of body rows', () => {
    const w = mountTable();
    const rows = w.findAll('.b-table__tr--data');
    expect(rows.length).toBe(DATA.length);
  });

  it('applies .b-table--small for size="small"', () => {
    const w = mountTable({ size: 'small' });
    expect(w.find('.b-table--small').exists()).toBe(true);
  });

  it('applies .b-table--middle for size="middle"', () => {
    const w = mountTable({ size: 'middle' });
    expect(w.find('.b-table--middle').exists()).toBe(true);
  });

  it('applies .b-table--bordered when bordered=true', () => {
    const w = mountTable({ bordered: true });
    expect(w.find('.b-table--bordered').exists()).toBe(true);
  });

  it('shows .b-table--loading and spin when loading=true', () => {
    const w = mountTable({ loading: true });
    expect(w.find('.b-table--loading').exists()).toBe(true);
    expect(w.find('.b-table__loading-overlay').exists()).toBe(true);
    expect(w.find('.b-table__spin').exists()).toBe(true);
  });

  it('renders aria-busy="true" on root when loading', () => {
    const w = mountTable({ loading: true });
    expect(w.find('.b-table').attributes('aria-busy')).toBe('true');
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM
// ─────────────────────────────────────────────

describe('BTable – props map to DOM', () => {
  it('renders column titles in <th>', () => {
    const w = mountTable();
    const ths = w.findAll('.b-table__th');
    expect(ths[0].text()).toContain('Name');
    expect(ths[1].text()).toContain('Age');
    expect(ths[2].text()).toContain('Address');
  });

  it('renders data cells with dataIndex values', () => {
    const w = mountTable();
    const firstRow = w.findAll('.b-table__tr--data')[0];
    const cells = firstRow.findAll('.b-table__td');
    expect(cells[0].text()).toBe('Alice');
    expect(cells[1].text()).toBe('32');
    expect(cells[2].text()).toBe('10 Downing St');
  });

  it('supports nested dataIndex via dot-path', () => {
    const data = [{ key: '1', address: { city: 'London' } }];
    const cols: AnyCol[] = [
      { title: 'City', dataIndex: 'address.city', key: 'city' },
    ];
    const w = mount(BTable, { props: { dataSource: data, columns: cols } });
    expect(w.find('.b-table__td').text()).toBe('London');
  });

  it('supports rowKey as string field', () => {
    const w = mountTable({ rowKey: 'key' });
    const rows = w.findAll('.b-table__tr--data');
    expect(rows.length).toBe(3);
  });

  it('supports rowKey as function', () => {
    const w = mountTable({ rowKey: (r: User) => r.key });
    expect(w.findAll('.b-table__tr--data').length).toBe(3);
  });

  it('renders caption when caption prop is provided', () => {
    const w = mountTable({ caption: 'Users table' });
    expect(w.find('.b-table__caption').text()).toBe('Users table');
    expect(w.find('.b-table').attributes('aria-label')).toBe('Users table');
  });

  it('applies column text alignment via CSS class', () => {
    const cols: AnyCol[] = [
      { title: 'Name', dataIndex: 'name', key: 'name', align: 'center' },
    ];
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: cols } });
    expect(w.find('.b-table__td--align-center').exists()).toBe(true);
  });

  it('hides header sticky style when sticky=false', () => {
    const w = mountTable({ sticky: false });
    expect(w.find('.b-table--sticky').exists()).toBe(false);
  });

  it('applies .b-table--sticky when sticky=true', () => {
    const w = mountTable({ sticky: true });
    expect(w.find('.b-table--sticky').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 3. Empty state
// ─────────────────────────────────────────────

describe('BTable – empty state', () => {
  it('renders empty state when dataSource is empty', () => {
    const w = mountTable({ dataSource: [] });
    expect(w.find('.b-table__empty').exists()).toBe(true);
  });

  it('shows default "No data" text', () => {
    const w = mountTable({ dataSource: [] });
    expect(w.find('.b-table__empty-text').text()).toBe('No data');
  });

  it('respects custom emptyText locale', () => {
    const w = mountTable({ dataSource: [], locale: { emptyText: 'Nothing here' } });
    expect(w.find('.b-table__empty-text').text()).toBe('Nothing here');
  });

  it('renders emptyText slot override', () => {
    const w = mount(BTable, {
      props: { dataSource: [], columns: COLUMNS as AnyCol[] },
      slots: { emptyText: '<div class="custom-empty">Custom</div>' },
    });
    expect(w.find('.custom-empty').exists()).toBe(true);
    expect(w.find('.b-table__empty').exists()).toBe(false);
  });

  it('adds .b-table--empty modifier when no data', () => {
    const w = mountTable({ dataSource: [] });
    expect(w.find('.b-table--empty').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 4. Row selection
// ─────────────────────────────────────────────

describe('BTable – row selection', () => {
  const selectionProps: BTableRowSelection<User> = { type: 'checkbox' };

  it('renders selection column when rowSelection is provided', () => {
    const w = mountTable({ rowSelection: selectionProps });
    expect(w.find('.b-table__th--selection').exists()).toBe(true);
    expect(w.find('.b-table__td--selection').exists()).toBe(true);
  });

  it('renders checkbox inputs for each row', () => {
    const w = mountTable({ rowSelection: selectionProps });
    const checkboxes = w.findAll('.b-table__td--selection .b-table__checkbox');
    expect(checkboxes.length).toBe(DATA.length);
  });

  it('renders select-all checkbox in header', () => {
    const w = mountTable({ rowSelection: selectionProps });
    const allCheck = w.find('.b-table__th--selection .b-table__checkbox');
    expect(allCheck.exists()).toBe(true);
  });

  it('fires onChange when a row checkbox is clicked', async () => {
    const onChange = vi.fn();
    const w = mountTable({ rowSelection: { type: 'checkbox', onChange } });
    await w.findAll('.b-table__td--selection .b-table__checkbox')[0].trigger('change');
    expect(onChange).toHaveBeenCalledExactlyOnceWith(['1'], [DATA[0]]);
  });

  it('selects all page rows when select-all is toggled', async () => {
    const onChange = vi.fn();
    const w = mountTable({ rowSelection: { type: 'checkbox', onChange } });
    await w.find('.b-table__th--selection .b-table__checkbox').trigger('change');
    expect(onChange).toHaveBeenCalledWith(
      DATA.map(d => d.key),
      DATA,
    );
  });

  it('applies .b-table__tr--selected to selected rows', async () => {
    const w = mountTable({
      rowSelection: { type: 'checkbox', selectedRowKeys: ['1'] },
    });
    const rows = w.findAll('.b-table__tr--data');
    expect(rows[0].classes()).toContain('b-table__tr--selected');
    expect(rows[1].classes()).not.toContain('b-table__tr--selected');
  });

  it('renders radio inputs when type="radio"', () => {
    const w = mountTable({ rowSelection: { type: 'radio' } });
    const inputs = w.findAll('.b-table__td--selection .b-table__checkbox');
    expect(inputs[0].attributes('type')).toBe('radio');
  });

  it('respects hideSelectAll option', () => {
    const w = mountTable({ rowSelection: { type: 'checkbox', hideSelectAll: true } });
    const allCheck = w.find('.b-table__th--selection .b-table__checkbox');
    expect(allCheck.exists()).toBe(false);
  });

  it('disables checkbox when getCheckboxProps returns disabled:true', () => {
    const w = mountTable({
      rowSelection: {
        type: 'checkbox',
        getCheckboxProps: (r: User) => ({ disabled: r.key === '1' }),
      },
    });
    const checkboxes = w.findAll('.b-table__td--selection .b-table__checkbox');
    expect(checkboxes[0].attributes('disabled')).toBeDefined();
    expect(checkboxes[1].attributes('disabled')).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// 5. Sorting
// ─────────────────────────────────────────────

describe('BTable – sorting', () => {
  const sortableColumns: AnyCol[] = [
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: true },
    { title: 'Age', dataIndex: 'age', key: 'age', sorter: (a: User, b: User) => a.age - b.age },
  ];

  it('renders sorter button for sortable columns', () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: sortableColumns } });
    expect(w.findAll('.b-table__sorter').length).toBe(2);
  });

  it('header th has correct aria-sort attribute before sorting', () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: sortableColumns } });
    const ths = w.findAll('.b-table__th');
    expect(ths[0].attributes('aria-sort')).toBe('none');
  });

  it('clicking sorter changes aria-sort to ascending', async () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: sortableColumns } });
    await w.findAll('.b-table__sorter')[0].trigger('click');
    expect(w.findAll('.b-table__th')[0].attributes('aria-sort')).toBe('ascending');
  });

  it('clicking sorter again changes aria-sort to descending', async () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: sortableColumns } });
    await w.findAll('.b-table__sorter')[0].trigger('click');
    await w.findAll('.b-table__sorter')[0].trigger('click');
    expect(w.findAll('.b-table__th')[0].attributes('aria-sort')).toBe('descending');
  });

  it('emits change event with sorter info on sort', async () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: sortableColumns } });
    await w.findAll('.b-table__sorter')[1].trigger('click');
    const emitted = w.emitted('change');
    expect(emitted).toBeDefined();
    expect(emitted![0][2]).toMatchObject({ order: 'ascend', field: 'age' });
    expect(emitted![0][3]).toMatchObject({ action: 'sort' });
  });

  it('sorts rows ascending by age using sorter function', async () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: sortableColumns } });
    await w.findAll('.b-table__sorter')[1].trigger('click');
    const rows = w.findAll('.b-table__tr--data');
    const ages = rows.map(r => r.findAll('.b-table__td')[1].text());
    expect(ages).toEqual(['28', '32', '42']);
  });

  it('sorts rows descending by age on second click', async () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: sortableColumns } });
    await w.findAll('.b-table__sorter')[1].trigger('click');
    await w.findAll('.b-table__sorter')[1].trigger('click');
    const rows = w.findAll('.b-table__tr--data');
    const ages = rows.map(r => r.findAll('.b-table__td')[1].text());
    expect(ages).toEqual(['42', '32', '28']);
  });

  it('applies .b-table__th--sorted class when column is sorted', async () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: sortableColumns } });
    await w.findAll('.b-table__sorter')[0].trigger('click');
    expect(w.findAll('.b-table__th')[0].classes()).toContain('b-table__th--sorted');
  });
});

// ─────────────────────────────────────────────
// 6. Filtering
// ─────────────────────────────────────────────

describe('BTable – filtering', () => {
  const filterColumns: AnyCol[] = [
    {
      title: 'Name', dataIndex: 'name', key: 'name',
      filters: [
        { text: 'Alice', value: 'Alice' },
        { text: 'Bob', value: 'Bob' },
      ],
    },
  ];

  it('renders filter trigger button for columns with filters', () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: filterColumns } });
    expect(w.find('.b-table__filter-btn').exists()).toBe(true);
  });

  it('opens filter dropdown on filter button click', async () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: filterColumns } });
    await w.find('.b-table__filter-btn').trigger('click');
    expect(w.find('.b-table__filter-dropdown').exists()).toBe(true);
  });

  it('filter button has aria-expanded="false" when closed', () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: filterColumns } });
    expect(w.find('.b-table__filter-btn').attributes('aria-expanded')).toBe('false');
  });

  it('filter button has aria-expanded="true" when open', async () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: filterColumns } });
    await w.find('.b-table__filter-btn').trigger('click');
    expect(w.find('.b-table__filter-btn').attributes('aria-expanded')).toBe('true');
  });

  it('renders filter options in the dropdown', async () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: filterColumns } });
    await w.find('.b-table__filter-btn').trigger('click');
    expect(w.findAll('.b-table__filter-item').length).toBe(2);
  });

  it('confirms filter and emits change with filter action', async () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: filterColumns } });
    await w.find('.b-table__filter-btn').trigger('click');
    await w.find('.b-table__filter-item-input').trigger('change');
    await w.find('.b-table__filter-confirm').trigger('click');
    const emitted = w.emitted('change');
    expect(emitted).toBeDefined();
    expect(emitted![0][3]).toMatchObject({ action: 'filter' });
  });

  it('closes filter dropdown after confirm', async () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: filterColumns } });
    await w.find('.b-table__filter-btn').trigger('click');
    await w.find('.b-table__filter-confirm').trigger('click');
    expect(w.find('.b-table__filter-dropdown').exists()).toBe(false);
  });

  it('closes filter dropdown on Escape key', async () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: filterColumns } });
    await w.find('.b-table__filter-btn').trigger('click');
    await w.find('.b-table__filter-dropdown').trigger('keydown', { key: 'Escape' });
    expect(w.find('.b-table__filter-dropdown').exists()).toBe(false);
  });

  it('filters rows after applying a filter', async () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: filterColumns } });
    await w.find('.b-table__filter-btn').trigger('click');
    await w.findAll('.b-table__filter-item-input')[0].trigger('change');
    await w.find('.b-table__filter-confirm').trigger('click');
    // Only Alice matches
    const rows = w.findAll('.b-table__tr--data');
    expect(rows.length).toBe(1);
    expect(rows[0].findAll('.b-table__td')[0].text()).toBe('Alice');
  });

  it('resets filter and shows all rows', async () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: filterColumns } });
    await w.find('.b-table__filter-btn').trigger('click');
    await w.findAll('.b-table__filter-item-input')[0].trigger('change');
    await w.find('.b-table__filter-confirm').trigger('click');
    // Reopen and reset
    await w.find('.b-table__filter-btn').trigger('click');
    await w.find('.b-table__filter-reset').trigger('click');
    expect(w.findAll('.b-table__tr--data').length).toBe(DATA.length);
  });
});

// ─────────────────────────────────────────────
// 7. Pagination
// ─────────────────────────────────────────────

describe('BTable – pagination', () => {
  const manyUsers: User[] = Array.from({ length: 25 }, (_, i) => ({
    key: String(i + 1),
    name: `User ${i + 1}`,
    age: 20 + i,
    address: `Address ${i + 1}`,
  }));

  it('does not render pagination when pagination=false', () => {
    const w = mountTable({ pagination: false });
    expect(w.find('.b-table__pagination').exists()).toBe(false);
  });

  it('renders pagination controls when data exceeds page size', () => {
    const w = mount(BTable, {
      props: { dataSource: manyUsers as AnyData, columns: COLUMNS as AnyCol[], pagination: { pageSize: 10 } },
    });
    expect(w.find('.b-table__pagination').exists()).toBe(true);
  });

  it('renders only 10 rows per page by default', () => {
    const w = mount(BTable, {
      props: { dataSource: manyUsers as AnyData, columns: COLUMNS as AnyCol[], pagination: { pageSize: 10 } },
    });
    expect(w.findAll('.b-table__tr--data').length).toBe(10);
  });

  it('navigates to next page on next button click', async () => {
    const w = mount(BTable, {
      props: { dataSource: manyUsers as AnyData, columns: COLUMNS as AnyCol[], pagination: { pageSize: 10 } },
    });
    const buttons = w.findAll('.b-table__page-btn');
    const nextBtn = buttons[buttons.length - 1];
    await nextBtn.trigger('click');
    expect(w.findAll('.b-table__tr--data').length).toBe(10);
    const activePage = w.find('.b-table__page-btn--active');
    expect(activePage.text()).toBe('2');
  });

  it('prev button is disabled on first page', () => {
    const w = mount(BTable, {
      props: { dataSource: manyUsers as AnyData, columns: COLUMNS as AnyCol[], pagination: { pageSize: 10 } },
    });
    const prevBtn = w.findAll('.b-table__page-btn')[0];
    expect(prevBtn.attributes('disabled')).toBeDefined();
  });

  it('emits change with paginate action on page change', async () => {
    const w = mount(BTable, {
      props: { dataSource: manyUsers as AnyData, columns: COLUMNS as AnyCol[], pagination: { pageSize: 10 } },
    });
    const buttons = w.findAll('.b-table__page-btn');
    await buttons[buttons.length - 1].trigger('click');
    const emitted = w.emitted('change');
    expect(emitted).toBeDefined();
    expect(emitted![0][3]).toMatchObject({ action: 'paginate' });
  });

  it('page 1 btn has aria-current="page"', () => {
    const w = mount(BTable, {
      props: { dataSource: manyUsers as AnyData, columns: COLUMNS as AnyCol[], pagination: { pageSize: 10 } },
    });
    const activePage = w.find('.b-table__page-btn--active');
    expect(activePage.attributes('aria-current')).toBe('page');
  });

  it('renders page size selector when showSizeChanger=true', () => {
    const w = mount(BTable, {
      props: { dataSource: manyUsers as AnyData, columns: COLUMNS as AnyCol[], pagination: { pageSize: 10, showSizeChanger: true } },
    });
    expect(w.find('.b-table__page-size').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 8. Expandable rows
// ─────────────────────────────────────────────

describe('BTable – expandable', () => {
  const expandableData: User[] = [
    {
      key: '1', name: 'Alice', age: 32, address: 'London',
      children: [{ key: '1-1', name: 'Alice Jr', age: 5, address: 'London' }],
    },
    { key: '2', name: 'Bob', age: 42, address: 'Baker St' },
  ];

  it('renders expand toggle button for expandable rows', () => {
    const w = mount(BTable, {
      props: { dataSource: expandableData as AnyData, columns: COLUMNS as AnyCol[], expandable: {} },
    });
    const btns = w.findAll('.b-table__expand-btn');
    expect(btns.length).toBe(1); // only Alice has children
  });

  it('expand button has aria-expanded="false" initially', () => {
    const w = mount(BTable, {
      props: { dataSource: expandableData as AnyData, columns: COLUMNS as AnyCol[], expandable: {} },
    });
    expect(w.find('.b-table__expand-btn').attributes('aria-expanded')).toBe('false');
  });

  it('clicking expand button toggles expanded content row', async () => {
    const w = mount(BTable, {
      props: { dataSource: expandableData as AnyData, columns: COLUMNS as AnyCol[], expandable: {} },
    });
    expect(w.find('.b-table__tr--expanded-content').exists()).toBe(false);
    await w.find('.b-table__expand-btn').trigger('click');
    expect(w.find('.b-table__tr--expanded-content').exists()).toBe(true);
  });

  it('expand button has aria-expanded="true" after click', async () => {
    const w = mount(BTable, {
      props: { dataSource: expandableData as AnyData, columns: COLUMNS as AnyCol[], expandable: {} },
    });
    await w.find('.b-table__expand-btn').trigger('click');
    expect(w.find('.b-table__expand-btn').attributes('aria-expanded')).toBe('true');
  });

  it('emits expand event when row is toggled', async () => {
    const w = mount(BTable, {
      props: { dataSource: expandableData as AnyData, columns: COLUMNS as AnyCol[], expandable: {} },
    });
    await w.find('.b-table__expand-btn').trigger('click');
    expect(w.emitted('expand')).toBeDefined();
    expect(w.emitted('expand')![0]).toEqual([true, expandableData[0]]);
  });

  it('emits expandedRowsChange with expanded keys', async () => {
    const w = mount(BTable, {
      props: { dataSource: expandableData as AnyData, columns: COLUMNS as AnyCol[], expandable: {} },
    });
    await w.find('.b-table__expand-btn').trigger('click');
    expect(w.emitted('expandedRowsChange')).toBeDefined();
    expect(w.emitted('expandedRowsChange')![0][0]).toContain('1');
  });

  it('supports defaultExpandedRowKeys', () => {
    const w = mount(BTable, {
      props: {
        dataSource: expandableData as AnyData, columns: COLUMNS as AnyCol[],
        expandable: { defaultExpandedRowKeys: ['1'] },
      },
    });
    expect(w.find('.b-table__tr--expanded-content').exists()).toBe(true);
  });

  it('applies .b-table__expand-btn--expanded class to expanded row', async () => {
    const w = mount(BTable, {
      props: { dataSource: expandableData as AnyData, columns: COLUMNS as AnyCol[], expandable: {} },
    });
    await w.find('.b-table__expand-btn').trigger('click');
    expect(w.find('.b-table__expand-btn').classes()).toContain('b-table__expand-btn--expanded');
  });
});

// ─────────────────────────────────────────────
// 9. Custom render and slots
// ─────────────────────────────────────────────

describe('BTable – custom render and slots', () => {
  it('renders column via customRender function', () => {
    const cols: AnyCol[] = [
      {
        title: 'Name', dataIndex: 'name', key: 'name',
        customRender: ({ value }: { value: unknown }) => `★ ${value}`,
      },
    ];
    const w = mount(BTable, { props: { dataSource: [DATA[0]] as AnyData, columns: cols } });
    expect(w.find('.b-table__td').text()).toBe('★ Alice');
  });

  it('renders named cell slot', () => {
    const w = mount(BTable, {
      props: { dataSource: [DATA[0]] as AnyData, columns: COLUMNS as AnyCol[] },
      slots: {
        name: `<template #name="{ value }"><strong class="bold-name">{{ value }}</strong></template>`,
      },
    });
    expect(w.find('.bold-name').exists()).toBe(true);
    expect(w.find('.bold-name').text()).toBe('Alice');
  });

  it('renders title slot', () => {
    const w = mount(BTable, {
      props: { dataSource: DATA as AnyData, columns: COLUMNS as AnyCol[] },
      slots: { title: '<div class="my-title">My Table Title</div>' },
    });
    expect(w.find('.my-title').text()).toBe('My Table Title');
  });

  it('renders footer slot', () => {
    const w = mount(BTable, {
      props: { dataSource: DATA as AnyData, columns: COLUMNS as AnyCol[] },
      slots: { footer: '<div class="my-footer">Footer text</div>' },
    });
    expect(w.find('.my-footer').text()).toBe('Footer text');
  });

  it('renders summary slot', () => {
    const w = mount(BTable, {
      props: { dataSource: DATA as AnyData, columns: COLUMNS as AnyCol[] },
      slots: {
        summary: `<template #summary="{ pageData }"><tr class="summary-row"><td :colspan="3">Total: {{ pageData.length }}</td></tr></template>`,
      },
    });
    expect(w.find('.summary-row').exists()).toBe(true);
    expect(w.find('.summary-row').text()).toContain('Total: 3');
  });
});

// ─────────────────────────────────────────────
// 10. Accessibility
// ─────────────────────────────────────────────

describe('BTable – accessibility', () => {
  it('root has role="region"', () => {
    const w = mountTable();
    expect(w.find('.b-table').attributes('role')).toBe('region');
  });

  it('table element has role="table"', () => {
    const w = mountTable();
    expect(w.find('.b-table__table').attributes('role')).toBe('table');
  });

  it('header cells have scope="col"', () => {
    const w = mountTable();
    w.findAll('.b-table__th').forEach(th => {
      expect(th.attributes('scope')).toBe('col');
    });
  });

  it('sortable th has aria-sort="none" initially', () => {
    const cols: AnyCol[] = [
      { title: 'Name', dataIndex: 'name', key: 'name', sorter: true },
    ];
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: cols } });
    expect(w.find('.b-table__th').attributes('aria-sort')).toBe('none');
  });

  it('loading overlay has role="status"', () => {
    const w = mountTable({ loading: true });
    expect(w.find('.b-table__loading-overlay').attributes('role')).toBe('status');
    expect(w.find('.b-table__loading-overlay').attributes('aria-live')).toBe('polite');
  });

  it('expand buttons have meaningful aria-label', () => {
    const data: User[] = [{
      key: '1', name: 'Alice', age: 32, address: 'London',
      children: [{ key: '1-1', name: 'Alice Jr', age: 5, address: 'London' }],
    }];
    const w = mount(BTable, {
      props: { dataSource: data as AnyData, columns: COLUMNS as AnyCol[], expandable: {} },
    });
    expect(w.find('.b-table__expand-btn').attributes('aria-label')).toBeTruthy();
  });

  it('pagination nav has role="navigation"', () => {
    const manyUsers: User[] = Array.from({ length: 25 }, (_, i) => ({
      key: String(i), name: `User ${i}`, age: i, address: `Addr ${i}`,
    }));
    const w = mount(BTable, {
      props: { dataSource: manyUsers as AnyData, columns: COLUMNS as AnyCol[], pagination: { pageSize: 10 } },
    });
    expect(w.find('.b-table__pagination').attributes('role')).toBe('navigation');
  });

  it('select-all checkbox has aria-label', () => {
    const w = mountTable({ rowSelection: { type: 'checkbox' } });
    const allCheckbox = w.find('.b-table__th--selection .b-table__checkbox');
    expect(allCheckbox.attributes('aria-label')).toBeTruthy();
  });

  it('filter dropdown has role="dialog"', async () => {
    const cols: AnyCol[] = [
      { title: 'Name', dataIndex: 'name', key: 'name', filters: [{ text: 'Alice', value: 'Alice' }] },
    ];
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: cols } });
    await w.find('.b-table__filter-btn').trigger('click');
    expect(w.find('.b-table__filter-dropdown').attributes('role')).toBe('dialog');
  });
});

// ─────────────────────────────────────────────
// 11. Column groups (nested headers)
// ─────────────────────────────────────────────

describe('BTable – column groups', () => {
  const groupedColumns: AnyCol[] = [
    { title: 'Basic Info', children: [
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Age',  dataIndex: 'age',  key: 'age'  },
    ]},
    { title: 'Address', dataIndex: 'address', key: 'address' },
  ];

  it('renders multiple header rows for nested columns', () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: groupedColumns } });
    const headerRows = w.findAll('.b-table__tr--header');
    expect(headerRows.length).toBe(2);
  });

  it('renders data cells for all leaf columns', () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: groupedColumns } });
    const cells = w.findAll('.b-table__tr--data')[0].findAll('.b-table__td');
    expect(cells.length).toBe(3);
  });
});

// ─────────────────────────────────────────────
// 12. Edge cases
// ─────────────────────────────────────────────

describe('BTable – edge cases', () => {
  it('renders with empty columns gracefully', () => {
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: [] } });
    expect(w.find('.b-table').exists()).toBe(true);
  });

  it('renders with undefined dataSource gracefully', () => {
    const w = mount(BTable, { props: { dataSource: undefined, columns: COLUMNS as AnyCol[] } });
    expect(w.find('.b-table__empty').exists()).toBe(true);
  });

  it('handles column without dataIndex (renders empty cell)', () => {
    const cols: AnyCol[] = [
      { title: 'Actions', key: 'actions' },
    ];
    const w = mount(BTable, { props: { dataSource: [DATA[0]] as AnyData, columns: cols } });
    expect(w.findAll('.b-table__td').length).toBe(1);
  });

  it('ellipsis column renders .b-table__td--ellipsis', () => {
    const cols: AnyCol[] = [
      { title: 'Address', dataIndex: 'address', key: 'address', ellipsis: true },
    ];
    const w = mount(BTable, { props: { dataSource: DATA as AnyData, columns: cols } });
    expect(w.find('.b-table__td--ellipsis').exists()).toBe(true);
    expect(w.find('.b-table__cell-ellipsis').exists()).toBe(true);
  });

  it('controlled rowSelection: selectedRowKeys from parent is reflected', () => {
    const w = mountTable({ rowSelection: { type: 'checkbox', selectedRowKeys: ['2'] } });
    const rows = w.findAll('.b-table__tr--data');
    expect(rows[0].classes()).not.toContain('b-table__tr--selected');
    expect(rows[1].classes()).toContain('b-table__tr--selected');
  });

  it('uncontrolled row selection: no rowSelection prop → no selection column', () => {
    const w = mountTable();
    expect(w.find('.b-table__th--selection').exists()).toBe(false);
  });

  it('rowClassName applies custom class to rows', () => {
    const w = mountTable({ rowClassName: (r: User) => r.key === '1' ? 'highlight' : '' });
    const rows = w.findAll('.b-table__tr--data');
    expect(rows[0].classes()).toContain('highlight');
    expect(rows[1].classes()).not.toContain('highlight');
  });

  it('onRow binds event handlers to rows', async () => {
    const click = vi.fn();
    const w = mountTable({ onRow: () => ({ onClick: click }) });
    await w.findAll('.b-table__tr--data')[0].trigger('click');
    expect(click).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────
// 13. Deterministic animation (fake timers)
// ─────────────────────────────────────────────

describe('BTable – loading animation (fake timers)', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('loading overlay is present when loading=true', () => {
    const w = mountTable({ loading: true });
    expect(w.find('.b-table__loading-overlay').exists()).toBe(true);
  });

  it('loading overlay is removed when loading switches to false', async () => {
    const w = mountTable({ loading: true });
    expect(w.find('.b-table__loading-overlay').exists()).toBe(true);
    await w.setProps({ loading: false });
    expect(w.find('.b-table__loading-overlay').exists()).toBe(false);
  });
});
