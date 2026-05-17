import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import BDivider from './BDivider.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function mountDivider(props = {}, slots: Record<string, string> = {}) {
  return mount(BDivider, { props, slots });
}

/** Find the first element that carries the .b-divider class (the component root). */
function root(wrapper: ReturnType<typeof mountDivider>) {
  return wrapper.find('.b-divider');
}

// ─────────────────────────────────────────────
// 1. Defaults render
// ─────────────────────────────────────────────
describe('BDivider – defaults', () => {
  it('renders a horizontal div[role=separator] by default', () => {
    const wrapper = mountDivider();
    const el = root(wrapper);
    expect(el.element.tagName).toBe('DIV');
    expect(el.classes()).toContain('b-divider--horizontal');
    expect(el.classes()).toContain('b-divider--solid');
    expect(el.classes()).toContain('b-divider--size-large');
    expect(el.classes()).toContain('b-divider--plain');
  });

  it('has aria-orientation=horizontal on horizontal hr', () => {
    const wrapper = mountDivider();
    expect(root(wrapper).attributes('aria-orientation')).toBe('horizontal');
  });
});

// ─────────────────────────────────────────────
// 2. Orientation
// ─────────────────────────────────────────────
describe('BDivider – orientation', () => {
  it('renders <span> for vertical orientation', () => {
    const wrapper = mountDivider({ orientation: 'vertical' });
    const el = root(wrapper);
    expect(el.element.tagName).toBe('SPAN');
    expect(el.classes()).toContain('b-divider--vertical');
  });

  it('vertical divider has role=separator and aria-orientation=vertical', () => {
    const wrapper = mountDivider({ orientation: 'vertical' });
    const el = root(wrapper);
    expect(el.attributes('role')).toBe('separator');
    expect(el.attributes('aria-orientation')).toBe('vertical');
  });

  it('renders <div role=separator> for horizontal with no slot', () => {
    const wrapper = mountDivider({ orientation: 'horizontal' });
    const el = root(wrapper);
    expect(el.element.tagName).toBe('DIV');
    expect(el.attributes('role')).toBe('separator');
  });

  it('renders <div role=separator> for horizontal WITH content', () => {
    const wrapper = mountDivider({}, { default: 'Text' });
    const el = root(wrapper);
    expect(el.element.tagName).toBe('DIV');
    expect(el.attributes('role')).toBe('separator');
    expect(el.classes()).toContain('b-divider--with-text');
  });
});

// ─────────────────────────────────────────────
// 3. Variant prop
// ─────────────────────────────────────────────
describe('BDivider – variant', () => {
  it.each(['solid', 'dashed', 'dotted'] as const)('applies b-divider--%s class', (v) => {
    const wrapper = mountDivider({ variant: v });
    expect(root(wrapper).classes()).toContain(`b-divider--${v}`);
  });

  it('legacy dashed=true maps to variant dashed when variant is solid', () => {
    const wrapper = mountDivider({ dashed: true });
    const classes = root(wrapper).classes();
    expect(classes).toContain('b-divider--dashed');
    expect(classes).not.toContain('b-divider--solid');
  });

  it('explicit variant dotted wins over dashed=true', () => {
    const wrapper = mountDivider({ dashed: true, variant: 'dotted' });
    const classes = root(wrapper).classes();
    expect(classes).toContain('b-divider--dotted');
    expect(classes).not.toContain('b-divider--dashed');
  });
});

// ─────────────────────────────────────────────
// 4. Size prop
// ─────────────────────────────────────────────
describe('BDivider – size', () => {
  it.each(['small', 'medium', 'large'] as const)('applies b-divider--size-%s', (s) => {
    const wrapper = mountDivider({ size: s });
    expect(root(wrapper).classes()).toContain(`b-divider--size-${s}`);
  });
});

// ─────────────────────────────────────────────
// 5. plain prop
// ─────────────────────────────────────────────
describe('BDivider – plain', () => {
  it('adds b-divider--plain class when plain=true (default)', () => {
    const wrapper = mountDivider();
    expect(root(wrapper).classes()).toContain('b-divider--plain');
  });

  it('does NOT add b-divider--plain when plain=false', () => {
    const wrapper = mountDivider({ plain: false });
    expect(root(wrapper).classes()).not.toContain('b-divider--plain');
  });
});

// ─────────────────────────────────────────────
// 6. titlePlacement prop
// ─────────────────────────────────────────────
describe('BDivider – titlePlacement', () => {
  it.each(['start', 'center', 'end'] as const)(
    'applies b-divider--text-%s when there is content',
    (placement) => {
      const wrapper = mountDivider({ titlePlacement: placement }, { default: 'Label' });
      expect(root(wrapper).classes()).toContain(`b-divider--text-${placement}`);
    },
  );

  it('does NOT add text placement class when there is no content', () => {
    const wrapper = mountDivider({ titlePlacement: 'start' });
    expect(root(wrapper).classes()).not.toContain('b-divider--text-start');
  });
});

// ─────────────────────────────────────────────
// 7. Slot content
// ─────────────────────────────────────────────
describe('BDivider – slot content', () => {
  it('renders slot content inside .b-divider__content', () => {
    const wrapper = mountDivider({}, { default: 'My Label' });
    const content = wrapper.find('.b-divider__content');
    expect(content.exists()).toBe(true);
    expect(content.text()).toBe('My Label');
  });

  it('renders HTML slot content', () => {
    const wrapper = mountDivider({}, { default: '<strong>Bold</strong>' });
    expect(wrapper.find('.b-divider__content strong').exists()).toBe(true);
  });

  it('does NOT render .b-divider__content when no slot', () => {
    const wrapper = mountDivider();
    expect(wrapper.find('.b-divider__content').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 8. Accessibility
// ─────────────────────────────────────────────
describe('BDivider – accessibility', () => {
  it('horizontal div carries role=separator and aria-orientation=horizontal', () => {
    const wrapper = mountDivider();
    const el = root(wrapper);
    expect(el.attributes('role')).toBe('separator');
    expect(el.attributes('aria-orientation')).toBe('horizontal');
  });

  it('horizontal div (with text) has role=separator', () => {
    const wrapper = mountDivider({}, { default: 'Text' });
    const el = root(wrapper);
    expect(el.attributes('role')).toBe('separator');
    expect(el.attributes('aria-orientation')).toBe('horizontal');
  });

  it('vertical span has role=separator and aria-orientation=vertical', () => {
    const wrapper = mountDivider({ orientation: 'vertical' });
    const el = root(wrapper);
    expect(el.attributes('role')).toBe('separator');
    expect(el.attributes('aria-orientation')).toBe('vertical');
  });

  it('does not have tabindex (not interactive)', () => {
    const wrapper = mountDivider();
    expect(root(wrapper).attributes('tabindex')).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// 9. Edge cases
// ─────────────────────────────────────────────
describe('BDivider – edge cases', () => {
  it('handles very long text without structural errors', () => {
    const longText = 'A'.repeat(500);
    const wrapper = mountDivider({}, { default: longText });
    expect(wrapper.find('.b-divider__content').text()).toBe(longText);
  });

  it('renders correctly when orientation changes from horizontal to vertical', async () => {
    const wrapper = mountDivider({ orientation: 'horizontal' });
    expect(root(wrapper).element.tagName).toBe('DIV');

    await wrapper.setProps({ orientation: 'vertical' });
    expect(root(wrapper).element.tagName).toBe('SPAN');
    expect(root(wrapper).classes()).toContain('b-divider--vertical');
  });

  it('vertical divider does not render content slot', () => {
    // Vertical dividers cannot have text; the slot template branch is not reached
    const wrapper = mountDivider({ orientation: 'vertical' }, { default: 'ignored' });
    const el = root(wrapper);
    expect(el.element.tagName).toBe('SPAN');
    expect(el.find('.b-divider__content').exists()).toBe(false);
  });
});
