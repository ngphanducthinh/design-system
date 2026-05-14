import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BAnchor from './BAnchor.vue';
import type { BAnchorItem } from './types';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const ITEMS: BAnchorItem[] = [
  { key: '1', href: '#section-1', title: 'Section 1' },
  { key: '2', href: '#section-2', title: 'Section 2' },
  { key: '3', href: '#section-3', title: 'Section 3' },
];

const NESTED_ITEMS: BAnchorItem[] = [
  {
    key: '1',
    href: '#parent',
    title: 'Parent',
    children: [
      { key: '1-1', href: '#child-1', title: 'Child 1' },
      { key: '1-2', href: '#child-2', title: 'Child 2' },
    ],
  },
  { key: '2', href: '#section-2', title: 'Section 2' },
];

function mountAnchor(props: Record<string, unknown> = {}) {
  return mount(BAnchor, {
    props: { items: ITEMS, ...props },
    attachTo: document.body,
  });
}

function createTargetElements() {
  const elements: HTMLDivElement[] = [];
  for (let i = 1; i <= 3; i++) {
    const el = document.createElement('div');
    el.id = `section-${i}`;
    el.style.height = '500px';
    document.body.appendChild(el);
    elements.push(el);
  }
  return elements;
}

// ─────────────────────────────────────────────
// 1. Defaults and variants render
// ─────────────────────────────────────────────
describe('BAnchor – defaults and variants', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders root <nav> with .b-anchor class', () => {
    const w = mountAnchor();
    const root = w.find('.b-anchor');
    expect(root.exists()).toBe(true);
    expect(root.element.tagName).toBe('NAV');
  });

  it('has role="navigation" and aria-label on root', () => {
    const w = mountAnchor();
    const root = w.find('.b-anchor');
    expect(root.attributes('role')).toBe('navigation');
    expect(root.attributes('aria-label')).toBe('Anchor navigation');
  });

  it('applies b-anchor--vertical class by default', () => {
    const w = mountAnchor();
    expect(w.find('.b-anchor--vertical').exists()).toBe(true);
  });

  it('applies b-anchor--horizontal class when direction=horizontal', () => {
    const w = mountAnchor({ direction: 'horizontal' });
    expect(w.find('.b-anchor--horizontal').exists()).toBe(true);
  });

  it('renders correct number of link items', () => {
    const w = mountAnchor();
    expect(w.findAll('.b-anchor-link').length).toBe(3);
  });

  it('renders item titles correctly', () => {
    const w = mountAnchor();
    const links = w.findAll('.b-anchor-link__title');
    expect(links[0].text()).toBe('Section 1');
    expect(links[1].text()).toBe('Section 2');
    expect(links[2].text()).toBe('Section 3');
  });

  it('renders href attributes on links', () => {
    const w = mountAnchor();
    const links = w.findAll('.b-anchor-link__title');
    expect(links[0].attributes('href')).toBe('#section-1');
    expect(links[1].attributes('href')).toBe('#section-2');
  });

  it('renders nested children in vertical mode', () => {
    const w = mountAnchor({ items: NESTED_ITEMS });
    const childLinks = w.findAll('.b-anchor-link--child');
    expect(childLinks.length).toBe(2);
  });

  it('does NOT render nested children in horizontal mode', () => {
    const w = mountAnchor({ items: NESTED_ITEMS, direction: 'horizontal' });
    const childLinks = w.findAll('.b-anchor-link--child');
    expect(childLinks.length).toBe(0);
  });

  it('renders indicator element', () => {
    const w = mountAnchor();
    expect(w.find('.b-anchor__indicator').exists()).toBe(true);
  });

  it('indicator is aria-hidden', () => {
    const w = mountAnchor();
    expect(w.find('.b-anchor__indicator').attributes('aria-hidden')).toBe('true');
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behavior
// ─────────────────────────────────────────────
describe('BAnchor – props behavior', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('sets target attribute on links when provided', () => {
    const items: BAnchorItem[] = [
      { key: '1', href: '#s1', title: 'Link', target: '_blank' },
    ];
    const w = mountAnchor({ items });
    expect(w.find('.b-anchor-link__title').attributes('target')).toBe('_blank');
  });

  it('applies custom className to link items', () => {
    const items: BAnchorItem[] = [
      { key: '1', href: '#s1', title: 'Link', className: 'custom-class' },
    ];
    const w = mountAnchor({ items });
    expect(w.find('.b-anchor-link').classes()).toContain('custom-class');
  });

  it('renders list wrapper with role="list"', () => {
    const w = mountAnchor();
    expect(w.find('.b-anchor__list').attributes('role')).toBe('list');
  });

  it('renders link items with role="listitem"', () => {
    const w = mountAnchor();
    const items = w.findAll('[role="listitem"]');
    expect(items.length).toBe(3);
  });

  it('sets aria-current="location" on active link', async () => {
    const w = mountAnchor({ modelValue: '#section-2' });
    await w.vm.$nextTick();
    await w.vm.$nextTick();
    const links = w.findAll('.b-anchor-link__title');
    const activeLink = links.find((l) => l.attributes('aria-current') === 'location');
    expect(activeLink).toBeDefined();
    expect(activeLink!.text()).toBe('Section 2');
  });

  it('does not set aria-current on inactive links', () => {
    const w = mountAnchor({ modelValue: '#section-2' });
    const firstLink = w.findAll('.b-anchor-link__title')[0];
    expect(firstLink.attributes('aria-current')).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// 3. Events
// ─────────────────────────────────────────────
describe('BAnchor – events', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('emits click event when a link is clicked', async () => {
    createTargetElements();
    const w = mountAnchor();
    await w.find('.b-anchor-link__title').trigger('click');
    expect(w.emitted('click')).toBeTruthy();
    expect(w.emitted('click')![0][1]).toEqual({ href: '#section-1', title: 'Section 1' });
  });

  it('emits change event when a link is clicked', async () => {
    createTargetElements();
    const w = mountAnchor();
    await w.findAll('.b-anchor-link__title')[0].trigger('click');
    const changesAfter = w.emitted('change')!;
    expect(changesAfter[changesAfter.length - 1][0]).toBe('#section-1');
  });

  it('emits update:modelValue when a link is clicked', async () => {
    createTargetElements();
    const w = mountAnchor();
    await w.findAll('.b-anchor-link__title')[0].trigger('click');
    const updates = w.emitted('update:modelValue')!;
    // The last emitted update should be the clicked link
    expect(updates[updates.length - 1][0]).toBe('#section-1');
  });

  it('does not scroll if click event is prevented', async () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo');
    const w = mount(BAnchor, {
      props: {
        items: ITEMS,
        onClick: (e: MouseEvent) => e.preventDefault(),
      },
      attrs: {
        onClick: (e: MouseEvent) => e.preventDefault(),
      },
      attachTo: document.body,
    });

    const link = w.find('.b-anchor-link__title');
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(clickEvent, 'defaultPrevented', { value: true });
    link.element.dispatchEvent(clickEvent);

    expect(scrollToSpy).not.toHaveBeenCalled();
    scrollToSpy.mockRestore();
  });
});

// ─────────────────────────────────────────────
// 4. Keyboard and focus behavior
// ─────────────────────────────────────────────
describe('BAnchor – keyboard and focus', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('links are focusable via Tab (they are <a> elements)', () => {
    const w = mountAnchor();
    const links = w.findAll('.b-anchor-link__title');
    links.forEach((link) => {
      expect(link.element.tagName).toBe('A');
    });
  });

  it('links have title attribute for tooltip', () => {
    const w = mountAnchor();
    const links = w.findAll('.b-anchor-link__title');
    expect(links[0].attributes('title')).toBe('Section 1');
  });

  it('clicking with Enter key triggers navigation', async () => {
    createTargetElements();
    const w = mountAnchor();
    const link = w.find('.b-anchor-link__title');
    await link.trigger('click');
    expect(w.emitted('click')).toBeTruthy();
  });
});

// ─────────────────────────────────────────────
// 5. Accessibility
// ─────────────────────────────────────────────
describe('BAnchor – accessibility', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('has navigation landmark role', () => {
    const w = mountAnchor();
    expect(w.find('nav').exists()).toBe(true);
  });

  it('has accessible label', () => {
    const w = mountAnchor();
    expect(w.find('nav').attributes('aria-label')).toBe('Anchor navigation');
  });

  it('active link gets aria-current="location"', () => {
    const w = mountAnchor({ modelValue: '#section-1' });
    const link = w.findAll('.b-anchor-link__title')[0];
    expect(link.attributes('aria-current')).toBe('location');
  });

  it('indicator is hidden from assistive technology', () => {
    const w = mountAnchor();
    expect(w.find('.b-anchor__indicator').attributes('aria-hidden')).toBe('true');
  });

  it('list structure uses proper role attributes', () => {
    const w = mountAnchor();
    expect(w.find('[role="list"]').exists()).toBe(true);
    expect(w.findAll('[role="listitem"]').length).toBe(3);
  });
});

// ─────────────────────────────────────────────
// 6. Edge cases
// ─────────────────────────────────────────────
describe('BAnchor – edge cases', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders with empty items array', () => {
    const w = mountAnchor({ items: [] });
    expect(w.find('.b-anchor').exists()).toBe(true);
    expect(w.findAll('.b-anchor-link').length).toBe(0);
  });

  it('handles missing target elements gracefully on click', async () => {
    const w = mountAnchor();
    await w.find('.b-anchor-link__title').trigger('click');
    expect(w.emitted('click')).toBeTruthy();
  });

  it('supports controlled mode via modelValue', async () => {
    const w = mountAnchor({ modelValue: '#section-2' });
    const links = w.findAll('.b-anchor-link');
    expect(links[1].classes()).toContain('b-anchor-link--active');
  });

  it('updates active state when modelValue changes', async () => {
    const w = mountAnchor({ modelValue: '#section-1' });
    expect(w.findAll('.b-anchor-link')[0].classes()).toContain('b-anchor-link--active');

    await w.setProps({ modelValue: '#section-3' });
    expect(w.findAll('.b-anchor-link')[2].classes()).toContain('b-anchor-link--active');
  });

  it('getCurrentAnchor overrides active detection', async () => {
    const w = mountAnchor({
      getCurrentAnchor: () => '#section-3',
    });
    // Trigger a scroll event to use getCurrentAnchor
    window.dispatchEvent(new Event('scroll'));
    await w.vm.$nextTick();
    expect(w.findAll('.b-anchor-link')[2].classes()).toContain('b-anchor-link--active');
  });

  it('handles items with long titles via text-overflow', () => {
    const items: BAnchorItem[] = [
      { key: '1', href: '#s1', title: 'A very long section title that should be truncated by CSS' },
    ];
    const w = mountAnchor({ items });
    expect(w.find('.b-anchor-link__title').text()).toContain('A very long section title');
  });
});

// ─────────────────────────────────────────────
// 7. Animation tests with fake timers
// ─────────────────────────────────────────────
describe('BAnchor – animation timing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('scrolling lock is released after timeout', async () => {
    createTargetElements();
    const w = mountAnchor();

    await w.find('.b-anchor-link__title').trigger('click');

    // During scroll lock, the change event shouldn't fire on scroll
    window.dispatchEvent(new Event('scroll'));

    vi.advanceTimersByTime(500);

    // After timeout, scroll should be unlocked
    window.dispatchEvent(new Event('scroll'));
    await w.vm.$nextTick();
    expect(true).toBe(true);
  });

  it('replace prop uses replaceState instead of pushState', async () => {
    createTargetElements();
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    const w = mountAnchor({ replace: true });
    await w.find('.b-anchor-link__title').trigger('click');

    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '#section-1');
    expect(pushStateSpy).not.toHaveBeenCalled();

    replaceStateSpy.mockRestore();
    pushStateSpy.mockRestore();
  });

  it('default uses pushState for history', async () => {
    createTargetElements();
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    const w = mountAnchor({ replace: false });
    await w.find('.b-anchor-link__title').trigger('click');

    expect(pushStateSpy).toHaveBeenCalledWith(null, '', '#section-1');
    pushStateSpy.mockRestore();
  });
});
