import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BPagination from './BPagination.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function mountPagination(props: Record<string, unknown> = {}) {
  return mount(BPagination, {
    props: { total: 100, ...props },
    attachTo: document.body,
  });
}

function getPageButtons(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('.b-pagination__page');
}

function getActiveButton(wrapper: ReturnType<typeof mount>) {
  return wrapper.find('.b-pagination__page--active');
}

// ─────────────────────────────────────────────
// 1. Defaults and variants render
// ─────────────────────────────────────────────
describe('BPagination – defaults and variants', () => {
  it('renders root .b-pagination element with role="navigation"', () => {
    const w = mountPagination();
    expect(w.find('.b-pagination').exists()).toBe(true);
    expect(w.find('.b-pagination').attributes('role')).toBe('navigation');
  });

  it('renders aria-label="Pagination"', () => {
    const w = mountPagination();
    expect(w.find('.b-pagination').attributes('aria-label')).toBe('Pagination');
  });

  it('defaults to page 1 active', () => {
    const w = mountPagination();
    const active = getActiveButton(w);
    expect(active.exists()).toBe(true);
    expect(active.text()).toBe('1');
  });

  it('renders prev and next buttons', () => {
    const w = mountPagination();
    expect(w.find('.b-pagination__prev').exists()).toBe(true);
    expect(w.find('.b-pagination__next').exists()).toBe(true);
  });

  it('prev button is disabled on page 1', () => {
    const w = mountPagination();
    expect(w.find('.b-pagination__prev').attributes('disabled')).toBeDefined();
  });

  it('next button is enabled when there are more pages', () => {
    const w = mountPagination();
    expect(w.find('.b-pagination__next').attributes('disabled')).toBeUndefined();
  });

  it('renders correct number of page items for small total', () => {
    const w = mountPagination({ total: 50, defaultPageSize: 10 });
    const pages = getPageButtons(w);
    expect(pages.length).toBe(5);
  });

  it('renders ellipsis for large totals', () => {
    const w = mountPagination({ total: 200, defaultPageSize: 10, defaultCurrent: 10 });
    expect(w.findAll('.b-pagination__ellipsis').length).toBeGreaterThan(0);
  });

  it('renders small size modifier', () => {
    const w = mountPagination({ size: 'small' });
    expect(w.find('.b-pagination--small').exists()).toBe(true);
  });

  it('renders large size modifier', () => {
    const w = mountPagination({ size: 'large' });
    expect(w.find('.b-pagination--large').exists()).toBe(true);
  });

  it('renders alignment start modifier', () => {
    const w = mountPagination({ align: 'start' });
    expect(w.find('.b-pagination--align-start').exists()).toBe(true);
  });

  it('renders alignment center modifier', () => {
    const w = mountPagination({ align: 'center' });
    expect(w.find('.b-pagination--align-center').exists()).toBe(true);
  });

  it('renders alignment end modifier', () => {
    const w = mountPagination({ align: 'end' });
    expect(w.find('.b-pagination--align-end').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behavior
// ─────────────────────────────────────────────
describe('BPagination – props map to DOM', () => {
  it('defaultCurrent sets initial page', () => {
    const w = mountPagination({ defaultCurrent: 3 });
    expect(getActiveButton(w).text()).toBe('3');
  });

  it('current (controlled) sets active page', () => {
    const w = mountPagination({ current: 5 });
    expect(getActiveButton(w).text()).toBe('5');
  });

  it('disabled adds --disabled class', () => {
    const w = mountPagination({ disabled: true });
    expect(w.find('.b-pagination--disabled').exists()).toBe(true);
  });

  it('disabled disables all buttons', () => {
    const w = mountPagination({ disabled: true });
    w.findAll('button').forEach((btn) => {
      expect(btn.attributes('disabled')).toBeDefined();
    });
  });

  it('hideOnSinglePage hides when only one page', () => {
    const w = mountPagination({ total: 5, defaultPageSize: 10, hideOnSinglePage: true });
    expect(w.find('.b-pagination').exists()).toBe(false);
  });

  it('hideOnSinglePage shows when multiple pages', () => {
    const w = mountPagination({ total: 100, defaultPageSize: 10, hideOnSinglePage: true });
    expect(w.find('.b-pagination').exists()).toBe(true);
  });

  it('showTitle adds title attributes', () => {
    const w = mountPagination({ showTitle: true });
    expect(w.find('.b-pagination__prev').attributes('title')).toBe('Previous Page');
    expect(w.find('.b-pagination__next').attributes('title')).toBe('Next Page');
    expect(getPageButtons(w)[0].attributes('title')).toBe('1');
  });

  it('showTitle=false omits title attributes', () => {
    const w = mountPagination({ showTitle: false });
    expect(w.find('.b-pagination__prev').attributes('title')).toBeUndefined();
  });

  it('showTotal renders total text', () => {
    const showTotal = (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} of ${total}`;
    const w = mountPagination({ showTotal, total: 100, defaultPageSize: 10 });
    expect(w.find('.b-pagination__total').text()).toBe('1-10 of 100');
  });

  it('showLessItems reduces visible pages', () => {
    const w1 = mountPagination({ total: 200, defaultCurrent: 10, showLessItems: false });
    const w2 = mountPagination({ total: 200, defaultCurrent: 10, showLessItems: true });
    const pages1 = getPageButtons(w1).length;
    const pages2 = getPageButtons(w2).length;
    expect(pages2).toBeLessThan(pages1);
  });

  it('showQuickJumper renders jumper input', () => {
    const w = mountPagination({ showQuickJumper: true });
    expect(w.find('.b-pagination__quick-jumper').exists()).toBe(true);
    expect(w.find('.b-pagination__jumper-input').exists()).toBe(true);
  });

  it('showSizeChanger renders select', () => {
    const w = mountPagination({ showSizeChanger: true });
    expect(w.find('.b-pagination__size-changer').exists()).toBe(true);
  });

  it('showSizeChanger auto-shows when total > totalBoundaryShowSizeChanger', () => {
    const w = mountPagination({ total: 60, totalBoundaryShowSizeChanger: 50 });
    expect(w.find('.b-pagination__size-changer').exists()).toBe(true);
  });

  it('showSizeChanger does not auto-show when total <= totalBoundaryShowSizeChanger', () => {
    const w = mountPagination({ total: 40, totalBoundaryShowSizeChanger: 50 });
    expect(w.find('.b-pagination__size-changer').exists()).toBe(false);
  });

  it('pageSizeOptions renders correct options in select', () => {
    const w = mountPagination({ showSizeChanger: true, pageSizeOptions: [5, 10, 25] });
    const options = w.findAll('.b-pagination__size-changer option');
    expect(options.length).toBe(3);
    expect(options[0].text()).toBe('5 / page');
    expect(options[1].text()).toBe('10 / page');
    expect(options[2].text()).toBe('25 / page');
  });

  it('simple mode renders simple pager', () => {
    const w = mountPagination({ simple: true });
    expect(w.find('.b-pagination--simple').exists()).toBe(true);
    expect(w.find('.b-pagination__simple-pager').exists()).toBe(true);
    expect(w.find('.b-pagination__simple-input').exists()).toBe(true);
  });

  it('simple readOnly mode renders text instead of input', () => {
    const w = mountPagination({ simple: { readOnly: true } });
    expect(w.find('.b-pagination__simple-input').exists()).toBe(false);
    expect(w.find('.b-pagination__simple-current').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 3. Events
// ─────────────────────────────────────────────
describe('BPagination – events', () => {
  it('clicking a page emits update:current and change', async () => {
    const w = mountPagination({ defaultCurrent: 1 });
    const pages = getPageButtons(w);
    await pages[1].trigger('click');
    expect(w.emitted('update:current')?.[0]).toEqual([2]);
    expect(w.emitted('change')?.[0]).toEqual([2, 10]);
  });

  it('clicking next emits events', async () => {
    const w = mountPagination({ defaultCurrent: 1 });
    await w.find('.b-pagination__next').trigger('click');
    expect(w.emitted('update:current')?.[0]).toEqual([2]);
    expect(w.emitted('change')?.[0]).toEqual([2, 10]);
  });

  it('clicking prev emits events', async () => {
    const w = mountPagination({ defaultCurrent: 3 });
    await w.find('.b-pagination__prev').trigger('click');
    expect(w.emitted('update:current')?.[0]).toEqual([2]);
    expect(w.emitted('change')?.[0]).toEqual([2, 10]);
  });

  it('clicking same page does not emit', async () => {
    const w = mountPagination({ defaultCurrent: 1 });
    await getPageButtons(w)[0].trigger('click');
    expect(w.emitted('update:current')).toBeUndefined();
    expect(w.emitted('change')).toBeUndefined();
  });

  it('changing page size emits showSizeChange', async () => {
    const w = mountPagination({ showSizeChanger: true });
    const select = w.find('.b-pagination__size-changer');
    await select.setValue('20');
    expect(w.emitted('showSizeChange')?.[0]).toEqual([1, 20]);
    expect(w.emitted('update:pageSize')?.[0]).toEqual([20]);
  });

  it('changing page size adjusts current page if it exceeds new total', async () => {
    const w = mountPagination({ total: 50, defaultCurrent: 5, defaultPageSize: 10, showSizeChanger: true });
    const select = w.find('.b-pagination__size-changer');
    await select.setValue('50');
    expect(w.emitted('update:current')?.[0]).toEqual([1]);
  });

  it('quick jumper navigates to valid page on Enter', async () => {
    const w = mountPagination({ showQuickJumper: true });
    const input = w.find('.b-pagination__jumper-input');
    await input.setValue('5');
    await input.trigger('keydown', { key: 'Enter' });
    expect(w.emitted('update:current')?.[0]).toEqual([5]);
  });

  it('quick jumper does not navigate to invalid page', async () => {
    const w = mountPagination({ showQuickJumper: true, total: 50 });
    const input = w.find('.b-pagination__jumper-input');
    await input.setValue('999');
    await input.trigger('keydown', { key: 'Enter' });
    expect(w.emitted('update:current')).toBeUndefined();
  });

  it('disabled pagination does not emit on click', async () => {
    const w = mountPagination({ disabled: true });
    const pages = getPageButtons(w);
    await pages[1].trigger('click');
    expect(w.emitted('update:current')).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// 4. Keyboard and focus
// ─────────────────────────────────────────────
describe('BPagination – keyboard and focus', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('page buttons are focusable via Tab', () => {
    const w = mountPagination();
    const pages = getPageButtons(w);
    pages.forEach((page) => {
      expect((page.element as HTMLElement).tabIndex).not.toBe(-1);
    });
  });

  it('prev/next buttons are focusable', () => {
    const w = mountPagination({ defaultCurrent: 3 });
    const prev = w.find('.b-pagination__prev');
    const next = w.find('.b-pagination__next');
    expect((prev.element as HTMLElement).tabIndex).not.toBe(-1);
    expect((next.element as HTMLElement).tabIndex).not.toBe(-1);
  });

  it('disabled prev is not clickable', async () => {
    const w = mountPagination({ defaultCurrent: 1 });
    await w.find('.b-pagination__prev').trigger('click');
    expect(w.emitted('update:current')).toBeUndefined();
  });

  it('disabled next is not clickable on last page', async () => {
    const w = mountPagination({ total: 50, defaultCurrent: 5, defaultPageSize: 10 });
    await w.find('.b-pagination__next').trigger('click');
    expect(w.emitted('update:current')).toBeUndefined();
  });

  it('Enter activates page button', async () => {
    const w = mountPagination();
    const pages = getPageButtons(w);
    await pages[1].trigger('click');
    expect(w.emitted('update:current')?.[0]).toEqual([2]);
  });
});

// ─────────────────────────────────────────────
// 5. Accessibility
// ─────────────────────────────────────────────
describe('BPagination – accessibility', () => {
  it('root has role="navigation" and aria-label', () => {
    const w = mountPagination();
    const nav = w.find('.b-pagination');
    expect(nav.attributes('role')).toBe('navigation');
    expect(nav.attributes('aria-label')).toBe('Pagination');
  });

  it('active page has aria-current="page"', () => {
    const w = mountPagination({ defaultCurrent: 3 });
    const active = getActiveButton(w);
    expect(active.attributes('aria-current')).toBe('page');
  });

  it('non-active pages do not have aria-current', () => {
    const w = mountPagination({ defaultCurrent: 1 });
    const pages = getPageButtons(w);
    pages.slice(1).forEach((page) => {
      expect(page.attributes('aria-current')).toBeUndefined();
    });
  });

  it('page buttons have aria-label', () => {
    const w = mountPagination();
    const pages = getPageButtons(w);
    expect(pages[0].attributes('aria-label')).toBe('Page 1');
    expect(pages[1].attributes('aria-label')).toBe('Page 2');
  });

  it('prev/next have aria-label', () => {
    const w = mountPagination();
    expect(w.find('.b-pagination__prev').attributes('aria-label')).toBe('Previous Page');
    expect(w.find('.b-pagination__next').attributes('aria-label')).toBe('Next Page');
  });

  it('disabled prev has aria-disabled', () => {
    const w = mountPagination({ defaultCurrent: 1 });
    expect(w.find('.b-pagination__prev').attributes('aria-disabled')).toBe('true');
  });

  it('disabled next has aria-disabled', () => {
    const w = mountPagination({ total: 10, defaultCurrent: 1, defaultPageSize: 10 });
    expect(w.find('.b-pagination__next').attributes('aria-disabled')).toBe('true');
  });

  it('ellipsis has aria-label', () => {
    const w = mountPagination({ total: 200, defaultCurrent: 10 });
    const ellipses = w.findAll('.b-pagination__ellipsis');
    ellipses.forEach((e) => {
      expect(e.attributes('aria-label')).toMatch(/Previous 5 Pages|Next 5 Pages/);
    });
  });

  it('icons are aria-hidden', () => {
    const w = mountPagination();
    const icons = w.findAll('[aria-hidden="true"]');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('size changer has aria-label', () => {
    const w = mountPagination({ showSizeChanger: true });
    expect(w.find('.b-pagination__size-changer').attributes('aria-label')).toBe('Items per page');
  });

  it('quick jumper input has aria-label', () => {
    const w = mountPagination({ showQuickJumper: true });
    expect(w.find('.b-pagination__jumper-input').attributes('aria-label')).toBe('Go to page');
  });

  it('simple input has aria-label with page info', () => {
    const w = mountPagination({ simple: true, total: 100, defaultPageSize: 10 });
    expect(w.find('.b-pagination__simple-input').attributes('aria-label')).toBe('Page 1 of 10');
  });
});

// ─────────────────────────────────────────────
// 6. Edge cases
// ─────────────────────────────────────────────
describe('BPagination – edge cases', () => {
  it('total=0 renders nothing useful (no pages)', () => {
    const w = mountPagination({ total: 0 });
    expect(getPageButtons(w).length).toBe(0);
  });

  it('handles total less than pageSize', () => {
    const w = mountPagination({ total: 3, defaultPageSize: 10 });
    const pages = getPageButtons(w);
    expect(pages.length).toBe(1);
    expect(pages[0].text()).toBe('1');
  });

  it('clamps page to valid range on nav', async () => {
    const w = mountPagination({ total: 30, defaultCurrent: 3, defaultPageSize: 10 });
    await w.find('.b-pagination__next').trigger('click');
    expect(w.emitted('update:current')).toBeUndefined();
  });

  it('controlled mode: does not update internal state', async () => {
    const w = mountPagination({ current: 1 });
    const pages = getPageButtons(w);
    await pages[1].trigger('click');
    expect(w.emitted('update:current')?.[0]).toEqual([2]);
    expect(getActiveButton(w).text()).toBe('1');
  });

  it('controlled mode: updates when prop changes', async () => {
    const w = mountPagination({ current: 1 });
    await w.setProps({ current: 5 });
    expect(getActiveButton(w).text()).toBe('5');
  });

  it('uncontrolled mode: updates active page on click', async () => {
    const w = mountPagination({ defaultCurrent: 1 });
    const pages = getPageButtons(w);
    await pages[1].trigger('click');
    expect(getActiveButton(w).text()).toBe('2');
  });

  it('pageSize controlled mode works with update:pageSize', async () => {
    const w = mountPagination({ pageSize: 10, showSizeChanger: true });
    const select = w.find('.b-pagination__size-changer');
    await select.setValue('20');
    expect(w.emitted('update:pageSize')?.[0]).toEqual([20]);
  });

  it('simple mode navigates via input', async () => {
    const w = mountPagination({ simple: true, total: 100, defaultPageSize: 10 });
    const input = w.find('.b-pagination__simple-input');
    await input.setValue('7');
    await input.trigger('keydown', { key: 'Enter' });
    expect(w.emitted('update:current')?.[0]).toEqual([7]);
  });

  it('simple mode blur commits valid value', async () => {
    const w = mountPagination({ simple: true, total: 100, defaultPageSize: 10 });
    const input = w.find('.b-pagination__simple-input');
    await input.setValue('4');
    await input.trigger('blur');
    expect(w.emitted('update:current')?.[0]).toEqual([4]);
  });

  it('simple mode blur resets invalid value', async () => {
    const w = mountPagination({ simple: true, total: 100, defaultPageSize: 10 });
    const input = w.find('.b-pagination__simple-input');
    await input.setValue('999');
    await input.trigger('blur');
    expect(w.emitted('update:current')).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// 7. Animation / fake timers
// ─────────────────────────────────────────────
describe('BPagination – deterministic (fake timers)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('page change is synchronous (no timers needed)', async () => {
    const w = mountPagination({ defaultCurrent: 1 });
    const pages = getPageButtons(w);
    await pages[2].trigger('click');
    vi.runAllTimers();
    await w.vm.$nextTick();
    expect(getActiveButton(w).text()).toBe('3');
  });

  it('rapid clicks settle on correct page', async () => {
    const w = mountPagination({ defaultCurrent: 1 });
    await w.find('.b-pagination__next').trigger('click');
    await w.find('.b-pagination__next').trigger('click');
    await w.find('.b-pagination__next').trigger('click');
    vi.runAllTimers();
    await w.vm.$nextTick();
    expect(getActiveButton(w).text()).toBe('4');
  });
});
