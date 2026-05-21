import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import BSkeleton from './BSkeleton.vue';
import BSkeletonAvatar from './BSkeletonAvatar.vue';
import BSkeletonButton from './BSkeletonButton.vue';
import BSkeletonImage from './BSkeletonImage.vue';
import BSkeletonInput from './BSkeletonInput.vue';
import BSkeletonNode from './BSkeletonNode.vue';

// ─────────────────────────────────────────────
// 1. Defaults & variants
// ─────────────────────────────────────────────
describe('BSkeleton – defaults and variants', () => {
  it('renders with default props (loading=true, title=true, paragraph=true)', () => {
    const wrapper = mount(BSkeleton);
    expect(wrapper.find('.b-skeleton').exists()).toBe(true);
    expect(wrapper.find('.b-skeleton__title').exists()).toBe(true);
    expect(wrapper.find('.b-skeleton__paragraph').exists()).toBe(true);
  });

  it('does not show avatar by default', () => {
    const wrapper = mount(BSkeleton);
    expect(wrapper.find('.b-skeleton-avatar').exists()).toBe(false);
    expect(wrapper.find('.b-skeleton__header').exists()).toBe(false);
    expect(wrapper.find('.b-skeleton').classes()).not.toContain('b-skeleton--with-avatar');
  });

  it('renders default 3 paragraph rows', () => {
    const wrapper = mount(BSkeleton);
    expect(wrapper.findAll('.b-skeleton__paragraph-row')).toHaveLength(3);
  });

  it('does not apply active class by default', () => {
    const wrapper = mount(BSkeleton);
    expect(wrapper.find('.b-skeleton').classes()).not.toContain('b-skeleton--active');
  });

  it('applies active class when active=true', () => {
    const wrapper = mount(BSkeleton, { props: { active: true } });
    expect(wrapper.find('.b-skeleton').classes()).toContain('b-skeleton--active');
  });

  it('applies round class when round=true', () => {
    const wrapper = mount(BSkeleton, { props: { round: true } });
    expect(wrapper.find('.b-skeleton').classes()).toContain('b-skeleton--round');
  });
});

// ─────────────────────────────────────────────
// 2. Title prop
// ─────────────────────────────────────────────
describe('BSkeleton – title', () => {
  it('hides title when title=false', () => {
    const wrapper = mount(BSkeleton, { props: { title: false } });
    expect(wrapper.find('.b-skeleton__title').exists()).toBe(false);
  });

  it('applies a numeric width as px', () => {
    const wrapper = mount(BSkeleton, { props: { title: { width: 200 } } });
    const el = wrapper.find('.b-skeleton__title');
    expect(el.attributes('style')).toContain('width: 200px');
  });

  it('applies a string width verbatim', () => {
    const wrapper = mount(BSkeleton, { props: { title: { width: '40%' } } });
    const el = wrapper.find('.b-skeleton__title');
    expect(el.attributes('style')).toContain('width: 40%');
  });
});

// ─────────────────────────────────────────────
// 3. Paragraph prop
// ─────────────────────────────────────────────
describe('BSkeleton – paragraph', () => {
  it('hides paragraph when paragraph=false', () => {
    const wrapper = mount(BSkeleton, { props: { paragraph: false } });
    expect(wrapper.find('.b-skeleton__paragraph').exists()).toBe(false);
  });

  it('renders configured number of rows', () => {
    const wrapper = mount(BSkeleton, { props: { paragraph: { rows: 5 } } });
    expect(wrapper.findAll('.b-skeleton__paragraph-row')).toHaveLength(5);
  });

  it('applies array of widths to corresponding rows', () => {
    const wrapper = mount(BSkeleton, {
      props: { paragraph: { rows: 3, width: [100, 200, '50%'] } },
    });
    const rows = wrapper.findAll('.b-skeleton__paragraph-row');
    expect(rows[0].attributes('style')).toContain('width: 100px');
    expect(rows[1].attributes('style')).toContain('width: 200px');
    expect(rows[2].attributes('style')).toContain('width: 50%');
  });

  it('applies single width only to the last row', () => {
    const wrapper = mount(BSkeleton, {
      props: { paragraph: { rows: 3, width: '60%' } },
    });
    const rows = wrapper.findAll('.b-skeleton__paragraph-row');
    expect(rows[0].attributes('style')).toBeUndefined();
    expect(rows[1].attributes('style')).toBeUndefined();
    expect(rows[2].attributes('style')).toContain('width: 60%');
  });
});

// ─────────────────────────────────────────────
// 4. Avatar prop
// ─────────────────────────────────────────────
describe('BSkeleton – avatar', () => {
  it('renders avatar when avatar=true', () => {
    const wrapper = mount(BSkeleton, { props: { avatar: true } });
    expect(wrapper.find('.b-skeleton-avatar').exists()).toBe(true);
    expect(wrapper.find('.b-skeleton').classes()).toContain('b-skeleton--with-avatar');
  });

  it('renders configurable avatar shape', () => {
    const wrapper = mount(BSkeleton, { props: { avatar: { shape: 'square' } } });
    expect(wrapper.find('.b-skeleton-avatar--square').exists()).toBe(true);
  });

  it('passes active to the avatar when parent is active', () => {
    const wrapper = mount(BSkeleton, { props: { avatar: true, active: true } });
    expect(wrapper.find('.b-skeleton-avatar').classes()).toContain('b-skeleton-element--active');
  });
});

// ─────────────────────────────────────────────
// 5. Loading
// ─────────────────────────────────────────────
describe('BSkeleton – loading', () => {
  it('renders default slot when loading=false', () => {
    const wrapper = mount(BSkeleton, {
      props: { loading: false },
      slots: { default: '<p class="real-content">Hello</p>' },
    });
    expect(wrapper.find('.b-skeleton').exists()).toBe(false);
    expect(wrapper.find('.real-content').exists()).toBe(true);
  });

  it('toggles between placeholder and content when loading flips', async () => {
    const wrapper = mount(BSkeleton, {
      props: { loading: true },
      slots: { default: '<p class="real-content">Hello</p>' },
    });
    expect(wrapper.find('.b-skeleton').exists()).toBe(true);

    await wrapper.setProps({ loading: false });
    expect(wrapper.find('.b-skeleton').exists()).toBe(false);
    expect(wrapper.find('.real-content').exists()).toBe(true);

    await wrapper.setProps({ loading: true });
    expect(wrapper.find('.b-skeleton').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 6. Accessibility
// ─────────────────────────────────────────────
describe('BSkeleton – accessibility', () => {
  it('exposes role="status" with aria-live=polite and aria-label', () => {
    const wrapper = mount(BSkeleton);
    const el = wrapper.find('.b-skeleton');
    expect(el.attributes('role')).toBe('status');
    expect(el.attributes('aria-live')).toBe('polite');
    expect(el.attributes('aria-label')).toBe('Loading');
  });

  it('marks decorative title and paragraph as aria-hidden', () => {
    const wrapper = mount(BSkeleton);
    expect(wrapper.find('.b-skeleton__title').attributes('aria-hidden')).toBe('true');
    expect(wrapper.find('.b-skeleton__paragraph').attributes('aria-hidden')).toBe('true');
  });

  it('Avatar / Button / Input / Image / Node carry aria-hidden', () => {
    expect(mount(BSkeletonAvatar).attributes('aria-hidden')).toBe('true');
    expect(mount(BSkeletonButton).attributes('aria-hidden')).toBe('true');
    expect(mount(BSkeletonInput).attributes('aria-hidden')).toBe('true');
    expect(mount(BSkeletonImage).attributes('aria-hidden')).toBe('true');
    expect(mount(BSkeletonNode).attributes('aria-hidden')).toBe('true');
  });
});

// ─────────────────────────────────────────────
// 7. Sub-component: Avatar
// ─────────────────────────────────────────────
describe('BSkeletonAvatar', () => {
  it('defaults to circle / default size', () => {
    const wrapper = mount(BSkeletonAvatar);
    expect(wrapper.classes()).toContain('b-skeleton-avatar--circle');
    expect(wrapper.classes()).toContain('b-skeleton-avatar--default');
  });

  it('renders square shape', () => {
    const wrapper = mount(BSkeletonAvatar, { props: { shape: 'square' } });
    expect(wrapper.classes()).toContain('b-skeleton-avatar--square');
  });

  it('applies active shimmer class', () => {
    const wrapper = mount(BSkeletonAvatar, { props: { active: true } });
    expect(wrapper.classes()).toContain('b-skeleton-element--active');
  });

  it('applies a custom numeric size as inline style', () => {
    const wrapper = mount(BSkeletonAvatar, { props: { size: 64 } });
    const style = wrapper.attributes('style') ?? '';
    expect(style).toContain('width: 64px');
    expect(style).toContain('height: 64px');
  });
});

// ─────────────────────────────────────────────
// 8. Sub-component: Button
// ─────────────────────────────────────────────
describe('BSkeletonButton', () => {
  it('renders with default size and shape', () => {
    const wrapper = mount(BSkeletonButton);
    expect(wrapper.classes()).toContain('b-skeleton-button--default');
    expect(wrapper.classes()).toContain('b-skeleton-button--default');
  });

  it.each(['small', 'default', 'large'] as const)('renders size=%s', (size) => {
    const wrapper = mount(BSkeletonButton, { props: { size } });
    expect(wrapper.classes()).toContain(`b-skeleton-button--${size}`);
  });

  it.each(['circle', 'round', 'square', 'default'] as const)('renders shape=%s', (shape) => {
    const wrapper = mount(BSkeletonButton, { props: { shape } });
    expect(wrapper.classes()).toContain(`b-skeleton-button--${shape}`);
  });

  it('applies block class', () => {
    const wrapper = mount(BSkeletonButton, { props: { block: true } });
    expect(wrapper.classes()).toContain('b-skeleton-button--block');
  });
});

// ─────────────────────────────────────────────
// 9. Sub-component: Input / Image / Node
// ─────────────────────────────────────────────
describe('BSkeletonInput / Image / Node', () => {
  it('Input renders block class', () => {
    const wrapper = mount(BSkeletonInput, { props: { block: true } });
    expect(wrapper.classes()).toContain('b-skeleton-input--block');
  });

  it('Image renders an svg child', () => {
    const wrapper = mount(BSkeletonImage);
    expect(wrapper.find('svg').exists()).toBe(true);
  });

  it('Node fullSize applies expected class', () => {
    const wrapper = mount(BSkeletonNode, { props: { fullSize: true } });
    expect(wrapper.classes()).toContain('b-skeleton-node--full-size');
  });

  it('Node renders default slot', () => {
    const wrapper = mount(BSkeletonNode, { slots: { default: '<i class="ic">x</i>' } });
    expect(wrapper.find('.ic').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 10. Edge cases
// ─────────────────────────────────────────────
describe('BSkeleton – edge cases', () => {
  it('handles long content via slot when not loading', () => {
    const longText = 'x'.repeat(2000);
    const wrapper = mount(BSkeleton, {
      props: { loading: false },
      slots: { default: `<div class="long">${longText}</div>` },
    });
    expect(wrapper.find('.long').text()).toHaveLength(2000);
  });

  it('paragraph rows=0 falls back to default of 3', () => {
    const wrapper = mount(BSkeleton, { props: { paragraph: { rows: 0 } } });
    expect(wrapper.findAll('.b-skeleton__paragraph-row')).toHaveLength(3);
  });

  it('avatar=false hides avatar even when avatar object would otherwise activate', () => {
    const wrapper = mount(BSkeleton, { props: { avatar: false } });
    expect(wrapper.find('.b-skeleton-avatar').exists()).toBe(false);
  });

  it('uncontrolled vs controlled: parent prop drives loading toggle without internal state', async () => {
    const wrapper = mount(BSkeleton, {
      props: { loading: true },
      slots: { default: '<span class="ok">OK</span>' },
    });
    expect(wrapper.find('.ok').exists()).toBe(false);
    await wrapper.setProps({ loading: false });
    expect(wrapper.find('.ok').exists()).toBe(true);
  });
});
