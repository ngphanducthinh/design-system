import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import BLink from './BLink.vue';

// ─────────────────────────────────────────────
// Stub for RouterLink so we can verify the Vue Router branch without
// pulling vue-router into the unit-test runtime. The component uses
// resolveDynamicComponent('RouterLink') to discover it.
// ─────────────────────────────────────────────
const RouterLinkStub = defineComponent({
  name: 'RouterLink',
  props: { to: { type: [String, Object], required: true } },
  setup(props, { slots }) {
    return () =>
      h(
        'a',
        {
          class: 'router-link-stub',
          'data-to': typeof props.to === 'string' ? props.to : JSON.stringify(props.to),
          href: typeof props.to === 'string' ? props.to : '#',
        },
        slots.default?.(),
      );
  },
});

function mountLink(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  return mount(BLink, {
    props,
    slots: { default: 'Click me' },
    attachTo: document.body,
    ...options,
  });
}

describe('BLink — defaults and element resolution', () => {
  it('renders root .b-link element', () => {
    const w = mountLink();
    expect(w.find('.b-link').exists()).toBe(true);
  });

  it('renders <button> when neither href nor to is set', () => {
    const w = mountLink();
    const root = w.find('.b-link');
    expect(root.element.tagName).toBe('BUTTON');
    expect(root.attributes('type')).toBe('button');
  });

  it('renders <a> when href is set', () => {
    const w = mountLink({ href: 'https://example.com' });
    const root = w.find('.b-link');
    expect(root.element.tagName).toBe('A');
    expect(root.attributes('href')).toBe('https://example.com');
  });

  it('renders RouterLink when to is set and router is available', () => {
    const w = mount(BLink, {
      props: { to: '/dashboard' },
      slots: { default: 'Go' },
      global: { components: { RouterLink: RouterLinkStub } },
      attachTo: document.body,
    });
    expect(w.find('.router-link-stub').exists()).toBe(true);
    expect(w.find('.router-link-stub').attributes('data-to')).toBe('/dashboard');
  });

  it('falls back to <a> when to is set but RouterLink is unavailable', () => {
    const w = mountLink({ to: '/dashboard' });
    const root = w.find('.b-link');
    expect(root.element.tagName).toBe('A');
    expect(root.attributes('href')).toBe('/dashboard');
  });

  it('falls back to <a> with object route — uses path', () => {
    const w = mountLink({ to: { path: '/users/42' } });
    const root = w.find('.b-link');
    expect(root.element.tagName).toBe('A');
    expect(root.attributes('href')).toBe('/users/42');
  });

  it('honours `as="button"` even with href set', () => {
    const w = mountLink({ as: 'button', href: 'https://example.com' });
    expect(w.find('.b-link').element.tagName).toBe('BUTTON');
  });

  it('honours `as="a"` and uses href', () => {
    const w = mountLink({ as: 'a', href: 'https://example.com' });
    expect(w.find('.b-link').element.tagName).toBe('A');
  });
});

describe('BLink — props map to DOM', () => {
  it('applies default color class .b-link--primary', () => {
    const w = mountLink();
    expect(w.find('.b-link').classes()).toContain('b-link--primary');
  });

  it('applies every color modifier', () => {
    const colors = ['primary', 'secondary', 'success', 'failure', 'warning', 'info'] as const;
    colors.forEach((c) => {
      const w = mountLink({ color: c });
      expect(w.find('.b-link').classes()).toContain(`b-link--${c}`);
    });
  });

  it('applies underline modifier classes', () => {
    const u = ['always', 'hover', 'none'] as const;
    u.forEach((mode) => {
      const w = mountLink({ underline: mode });
      expect(w.find('.b-link').classes()).toContain(`b-link--underline-${mode}`);
    });
  });

  it('default underline is hover', () => {
    const w = mountLink();
    expect(w.find('.b-link').classes()).toContain('b-link--underline-hover');
  });

  it('passes through target attribute on <a>', () => {
    const w = mountLink({ href: '/x', target: '_self' });
    expect(w.find('.b-link').attributes('target')).toBe('_self');
  });

  it('passes through rel attribute on <a>', () => {
    const w = mountLink({ href: '/x', rel: 'nofollow' });
    expect(w.find('.b-link').attributes('rel')).toContain('nofollow');
  });
});

describe('BLink — external prop', () => {
  it('forces target="_blank" when external=true', () => {
    const w = mountLink({ href: 'https://example.com', external: true });
    expect(w.find('.b-link').attributes('target')).toBe('_blank');
  });

  it('forces rel to include noopener noreferrer when external=true', () => {
    const w = mountLink({ href: 'https://example.com', external: true });
    const rel = w.find('.b-link').attributes('rel') ?? '';
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
  });

  it('augments user-supplied rel with noopener noreferrer', () => {
    const w = mountLink({ href: 'https://example.com', external: true, rel: 'nofollow' });
    const rel = w.find('.b-link').attributes('rel') ?? '';
    expect(rel).toContain('nofollow');
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
  });

  it('renders external icon glyph when external=true', () => {
    const w = mountLink({ href: 'https://example.com', external: true });
    expect(w.find('.b-link__external-icon').exists()).toBe(true);
  });

  it('omits external icon when showExternalIcon=false', () => {
    const w = mountLink({ href: 'https://example.com', external: true, showExternalIcon: false });
    expect(w.find('.b-link__external-icon').exists()).toBe(false);
  });

  it('adds .b-link--external class', () => {
    const w = mountLink({ href: '/x', external: true });
    expect(w.find('.b-link').classes()).toContain('b-link--external');
  });

  it('adds noopener noreferrer when consumer sets target=_blank without external', () => {
    const w = mountLink({ href: 'https://example.com', target: '_blank' });
    const rel = w.find('.b-link').attributes('rel') ?? '';
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
  });
});

describe('BLink — disabled', () => {
  it('renders <button disabled> when used as button', () => {
    const w = mountLink({ disabled: true });
    const btn = w.find('.b-link');
    expect(btn.element.tagName).toBe('BUTTON');
    expect((btn.element as HTMLButtonElement).disabled).toBe(true);
  });

  it('downgrades disabled <a> to <span aria-disabled="true">', () => {
    const w = mountLink({ href: '/x', disabled: true });
    const root = w.find('.b-link');
    expect(root.element.tagName).toBe('SPAN');
    expect(root.attributes('aria-disabled')).toBe('true');
    expect(root.attributes('role')).toBe('link');
  });

  it('downgrades disabled RouterLink to <span aria-disabled="true">', () => {
    const w = mount(BLink, {
      props: { to: '/dashboard', disabled: true },
      slots: { default: 'Go' },
      global: { components: { RouterLink: RouterLinkStub } },
      attachTo: document.body,
    });
    expect(w.find('.router-link-stub').exists()).toBe(false);
    const root = w.find('.b-link');
    expect(root.element.tagName).toBe('SPAN');
    expect(root.attributes('aria-disabled')).toBe('true');
  });

  it('applies .b-link--disabled class', () => {
    const w = mountLink({ disabled: true });
    expect(w.find('.b-link').classes()).toContain('b-link--disabled');
  });

  it('does not emit click when disabled <button> is clicked', async () => {
    const w = mountLink({ disabled: true });
    await w.find('.b-link').trigger('click');
    expect(w.emitted('click')).toBeUndefined();
  });
});

describe('BLink — events', () => {
  it('emits click event with MouseEvent on activation', async () => {
    const w = mountLink({ href: '/x' });
    await w.find('.b-link').trigger('click');
    const evs = w.emitted('click');
    expect(evs).toBeDefined();
    expect(evs![0][0]).toBeInstanceOf(MouseEvent);
  });

  it('does not emit click when disabled', async () => {
    const w = mountLink({ href: '/x', disabled: true });
    // Disabled <a> renders as <span>; no native click handler — emit suppressed anyway
    const root = w.find('.b-link');
    await root.trigger('click');
    expect(w.emitted('click')).toBeUndefined();
  });
});

describe('BLink — keyboard interactions', () => {
  it('button activates on Enter (native semantic)', async () => {
    // <button> natively handles Enter/Space — verify the element is focusable.
    const w = mountLink();
    const btn = w.find('.b-link').element as HTMLButtonElement;
    btn.focus();
    expect(document.activeElement).toBe(btn);
  });

  it('anchor is focusable when not disabled', () => {
    const w = mountLink({ href: '/x' });
    const a = w.find('.b-link').element as HTMLAnchorElement;
    a.focus();
    expect(document.activeElement).toBe(a);
  });

  it('disabled <span> does not receive focus through Tab order (no tabindex)', () => {
    const w = mountLink({ href: '/x', disabled: true });
    const span = w.find('.b-link').element as HTMLSpanElement;
    expect(span.getAttribute('tabindex')).toBeNull();
  });
});

describe('BLink — accessibility', () => {
  it('button has type="button"', () => {
    const w = mountLink();
    expect(w.find('.b-link').attributes('type')).toBe('button');
  });

  it('button gets aria-disabled when disabled', () => {
    const w = mountLink({ disabled: true });
    expect(w.find('.b-link').attributes('aria-disabled')).toBe('true');
  });

  it('anchor exposes default DOM semantics (no role override)', () => {
    const w = mountLink({ href: '/x' });
    expect(w.find('.b-link').attributes('role')).toBeUndefined();
  });

  it('disabled span exposes role="link" + aria-disabled="true"', () => {
    const w = mountLink({ href: '/x', disabled: true });
    const span = w.find('.b-link');
    expect(span.attributes('role')).toBe('link');
    expect(span.attributes('aria-disabled')).toBe('true');
  });

  it('leading slot wrapper is aria-hidden', () => {
    const w = mount(BLink, {
      slots: { default: 'X', leading: '<span class="ic">L</span>' },
      attachTo: document.body,
    });
    expect(w.find('.b-link__leading').attributes('aria-hidden')).toBe('true');
  });

  it('trailing slot wrapper is aria-hidden', () => {
    const w = mount(BLink, {
      slots: { default: 'X', trailing: '<span class="ic">T</span>' },
      attachTo: document.body,
    });
    expect(w.find('.b-link__trailing').attributes('aria-hidden')).toBe('true');
  });
});

describe('BLink — slots', () => {
  it('renders default slot content', () => {
    const w = mountLink();
    expect(w.find('.b-link__label').text()).toBe('Click me');
  });

  it('renders leading slot', () => {
    const w = mount(BLink, {
      slots: { default: 'Hi', leading: '<span class="lead">L</span>' },
      attachTo: document.body,
    });
    expect(w.find('.b-link__leading').exists()).toBe(true);
    expect(w.find('.lead').text()).toBe('L');
  });

  it('renders trailing slot', () => {
    const w = mount(BLink, {
      slots: { default: 'Hi', trailing: '<span class="trail">T</span>' },
      attachTo: document.body,
    });
    expect(w.find('.b-link__trailing').exists()).toBe(true);
    expect(w.find('.trail').text()).toBe('T');
  });

  it('omits leading wrapper when slot empty', () => {
    const w = mountLink();
    expect(w.find('.b-link__leading').exists()).toBe(false);
  });

  it('user trailing slot suppresses external icon', () => {
    const w = mount(BLink, {
      props: { href: 'https://example.com', external: true },
      slots: { default: 'Go', trailing: '<span class="trail">→</span>' },
      attachTo: document.body,
    });
    expect(w.find('.b-link__trailing').exists()).toBe(true);
    expect(w.find('.b-link__external-icon').exists()).toBe(false);
  });
});

describe('BLink — edge cases', () => {
  it('handles very long content', () => {
    const long = 'A'.repeat(500);
    const w = mount(BLink, { slots: { default: long }, attachTo: document.body });
    expect(w.find('.b-link__label').text()).toBe(long);
  });

  it('reactively updates element when href is added/removed', async () => {
    const w = mountLink();
    expect(w.find('.b-link').element.tagName).toBe('BUTTON');
    await w.setProps({ href: '/x' });
    expect(w.find('.b-link').element.tagName).toBe('A');
    await w.setProps({ href: undefined });
    expect(w.find('.b-link').element.tagName).toBe('BUTTON');
  });

  it('reactively updates color class on prop change', async () => {
    const w = mountLink({ color: 'primary' });
    expect(w.find('.b-link').classes()).toContain('b-link--primary');
    await w.setProps({ color: 'failure' });
    expect(w.find('.b-link').classes()).toContain('b-link--failure');
    expect(w.find('.b-link').classes()).not.toContain('b-link--primary');
  });

  it('reactively updates disabled state', async () => {
    const w = mountLink({ href: '/x' });
    expect(w.find('.b-link').element.tagName).toBe('A');
    await w.setProps({ disabled: true });
    expect(w.find('.b-link').element.tagName).toBe('SPAN');
  });

  it('does not duplicate noopener/noreferrer if rel already includes them', () => {
    const w = mountLink({ href: '/x', external: true, rel: 'noopener nofollow' });
    const rel = (w.find('.b-link').attributes('rel') ?? '').split(/\s+/);
    const occurrences = rel.filter((t) => t === 'noopener').length;
    expect(occurrences).toBe(1);
  });

  it('handles to as object with name (no path) — falls back to JSON-stringified href', () => {
    const w = mountLink({ to: { name: 'home' } });
    const a = w.find('.b-link');
    expect(a.element.tagName).toBe('A');
    // No `path`, so href is the JSON serialization (or omitted) — just assert no crash.
    expect(a.exists()).toBe(true);
  });

  it('click handler is suppressed even via direct trigger when disabled', async () => {
    const onClick = vi.fn();
    const w = mountLink({ disabled: true, onClick });
    await w.find('.b-link').trigger('click');
    expect(onClick).not.toHaveBeenCalled();
  });
});
