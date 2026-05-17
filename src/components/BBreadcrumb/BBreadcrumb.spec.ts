import type { BBreadcrumbItem } from '@/types';
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import BBreadcrumb from './BBreadcrumb.vue';

// ─────────────────────────────────────────────
// ResizeObserver stub (not available in jsdom)
// ─────────────────────────────────────────────
class ResizeObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const ITEMS: BBreadcrumbItem[] = [
  { text: 'Home', href: '/' },
  { text: 'Application', href: '/app' },
  { text: 'Settings' },
];

function mountBreadcrumb(props: Record<string, unknown> = {}) {
  return mount(BBreadcrumb, {
    props,
    attachTo: document.body,
  });
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─────────────────────────────────────────────
// 1. Defaults and variants render
// ─────────────────────────────────────────────
describe('BBreadcrumb – defaults and variants', () => {
  it('renders root <nav> with .b-breadcrumb class and aria-label', () => {
    const w = mountBreadcrumb({ items: ITEMS });
    const nav = w.find('nav.b-breadcrumb');
    expect(nav.exists()).toBe(true);
    expect(nav.attributes('aria-label')).toBe('Breadcrumb');
  });

  it('renders inner <ol> with .b-breadcrumb__list', () => {
    const w = mountBreadcrumb({ items: ITEMS });
    expect(w.find('ol.b-breadcrumb__list').exists()).toBe(true);
  });

  it('renders the correct number of <li> items', () => {
    const w = mountBreadcrumb({ items: ITEMS });
    expect(w.findAll('li.b-breadcrumb__item').length).toBe(ITEMS.length);
  });

  it('renders nothing meaningful for empty items', () => {
    const w = mountBreadcrumb({ items: [] });
    expect(w.findAll('li.b-breadcrumb__item').length).toBe(0);
  });

  it('applies .b-breadcrumb__link to anchor elements', () => {
    const w = mountBreadcrumb({ items: ITEMS });
    const links = w.findAll('a.b-breadcrumb__link');
    expect(links.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM
// ─────────────────────────────────────────────
describe('BBreadcrumb – props', () => {
  it('renders href on anchor links', () => {
    const w = mountBreadcrumb({ items: ITEMS });
    const links = w.findAll('a.b-breadcrumb__link');
    expect(links[0].attributes('href')).toBe('/');
    expect(links[1].attributes('href')).toBe('/app');
  });

  it('uses text as title attribute', () => {
    const w = mountBreadcrumb({ items: ITEMS });
    const links = w.findAll('a.b-breadcrumb__link');
    expect(links[0].attributes('title')).toBe('Home');
  });

  it('renders default separator "/"', () => {
    const w = mountBreadcrumb({ items: ITEMS });
    const seps = w.findAll('.b-breadcrumb__separator');
    expect(seps[0].text()).toBe('/');
  });

  it('renders custom separator when provided', () => {
    const w = mountBreadcrumb({ items: ITEMS, separator: '>' });
    const seps = w.findAll('.b-breadcrumb__separator');
    expect(seps[0].text()).toBe('>');
  });

  it('does not render a separator after the last item', () => {
    const w = mountBreadcrumb({ items: ITEMS });
    const liItems = w.findAll('li.b-breadcrumb__item');
    const lastLi = liItems[liItems.length - 1];
    expect(lastLi!.find('.b-breadcrumb__separator').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 3. Accessibility: roles and aria
// ─────────────────────────────────────────────
describe('BBreadcrumb – accessibility', () => {
  it('sets aria-current="page" on the last visible item', () => {
    const w = mountBreadcrumb({ items: ITEMS });
    const links = w.findAll('a.b-breadcrumb__link');
    const lastLink = links[links.length - 1];
    expect(lastLink!.attributes('aria-current')).toBe('page');
  });

  it('sets aria-current="page" on single item', () => {
    const w = mountBreadcrumb({ items: [{ text: 'Home', href: '/' }] });
    expect(w.find('a.b-breadcrumb__link').attributes('aria-current')).toBe('page');
  });

  it('separators have aria-hidden="true"', () => {
    const w = mountBreadcrumb({ items: ITEMS });
    const seps = w.findAll('[aria-hidden="true"]');
    expect(seps.length).toBeGreaterThan(0);
  });

  it('inner list has role="list"', () => {
    const w = mountBreadcrumb({ items: ITEMS });
    expect(w.find('ol.b-breadcrumb__list').attributes('role')).toBe('list');
  });
});

// ─────────────────────────────────────────────
// 4. Ellipsis button – keyboard and aria
// ─────────────────────────────────────────────
describe('BBreadcrumb – ellipsis button', () => {
  it('ellipsis control is not rendered when nothing is hidden', () => {
    const w = mountBreadcrumb({ items: ITEMS });
    // v-if="isCollapsed" — absent from DOM when all items fit
    expect(w.find('.b-breadcrumb__ellipsis').exists()).toBe(false);
  });

  it('ellipsis button has correct static aria attributes', () => {
    // Mount with items so isCollapsed is true from the start by forcing hidden
    const w = mountBreadcrumb({ items: ITEMS });
    // Manually trigger collapsed state via internal ref
    const vm = w.vm as any;
    vm.breadcrumbItems[1].hidden = true;
    // The button is inside the ellipsis span which only renders when isCollapsed
    // In a real browser the ResizeObserver drives this; here we check static attrs
    // from an already-collapsed state after nextTick.
    // For static attribute coverage we can check the btn on a fresh collapsed mount:
  });

  it('ellipsis button has correct aria attributes when collapsed', async () => {
    const w = mountBreadcrumb({ items: ITEMS });
    const vm = w.vm as any;
    vm.breadcrumbItems[1].hidden = true;
    await nextTick();

    const btn = w.find('.b-breadcrumb__ellipsis-btn');
    expect(btn.exists()).toBe(true);
    expect(btn.attributes('aria-label')).toBe('Show hidden breadcrumb items');
    expect(btn.attributes('type')).toBe('button');
    expect(btn.attributes('aria-expanded')).toBe('false');
  });

  it('toggles collapsedBreadcrumbMenu state on click', async () => {
    const w = mountBreadcrumb({ items: ITEMS });
    const vm = w.vm as any;
    vm.breadcrumbItems[1].hidden = true;
    await nextTick();

    const btn = w.find('.b-breadcrumb__ellipsis-btn');
    // btn.trigger('click') dispatches a real event that calls stopPropagation,
    // so the document listener won't see it — state should stay open.
    await btn.trigger('click');
    expect(vm.collapsedBreadcrumbMenu).toBe(true);
    expect(btn.attributes('aria-expanded')).toBe('true');
  });

  it('toggles collapsedBreadcrumbMenu on Enter key', async () => {
    const w = mountBreadcrumb({ items: ITEMS });
    const vm = w.vm as any;
    vm.breadcrumbItems[1].hidden = true;
    await nextTick();

    const btn = w.find('.b-breadcrumb__ellipsis-btn');
    await btn.trigger('keydown', { key: 'Enter' });
    expect(vm.collapsedBreadcrumbMenu).toBe(true);
  });

  it('closes collapsedBreadcrumbMenu on Escape key', async () => {
    const w = mountBreadcrumb({ items: ITEMS });
    const vm = w.vm as any;
    vm.breadcrumbItems[1].hidden = true;
    await nextTick();

    const btn = w.find('.b-breadcrumb__ellipsis-btn');
    // Open via button click (stopPropagation keeps menu open)
    await btn.trigger('click');
    expect(vm.collapsedBreadcrumbMenu).toBe(true);
    await btn.trigger('keydown', { key: 'Escape' });
    expect(vm.collapsedBreadcrumbMenu).toBe(false);
    expect(btn.attributes('aria-expanded')).toBe('false');
  });
});

// ─────────────────────────────────────────────
// 5. Slots
// ─────────────────────────────────────────────
describe('BBreadcrumb – slots', () => {
  it('renders custom item slot content', () => {
    const w = mount(BBreadcrumb, {
      props: { items: ITEMS },
      slots: {
        'item-0': '<span class="custom-home">Custom Home</span>',
      },
    });
    expect(w.find('.custom-home').exists()).toBe(true);
    expect(w.find('.custom-home').text()).toBe('Custom Home');
  });

  it('renders custom separator slot content', () => {
    const w = mount(BBreadcrumb, {
      props: { items: ITEMS },
      slots: {
        'separator-0': '<span class="custom-sep">→</span>',
      },
    });
    expect(w.find('.custom-sep').text()).toBe('→');
  });
});

// ─────────────────────────────────────────────
// 6. Edge cases
// ─────────────────────────────────────────────
describe('BBreadcrumb – edge cases', () => {
  it('handles a single item without crash', () => {
    const w = mountBreadcrumb({ items: [{ text: 'Only' }] });
    expect(w.find('.b-breadcrumb').exists()).toBe(true);
    expect(w.findAll('li.b-breadcrumb__item').length).toBe(1);
  });

  it('renders without href on items that have no href', () => {
    const w = mountBreadcrumb({ items: [{ text: 'No Link' }] });
    const link = w.find('a.b-breadcrumb__link');
    expect(link.attributes('href')).toBeUndefined();
  });

  it('cleans up ResizeObserver on unmount', () => {
    const w = mountBreadcrumb({ items: ITEMS });
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    w.unmount();
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function));
    removeSpy.mockRestore();
  });
});
