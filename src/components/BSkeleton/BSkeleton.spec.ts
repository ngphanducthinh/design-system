import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { BSkeletonAvatarShape } from '@/types.ts';
import BSkeleton from './BSkeleton.vue';

describe('BSkeleton', () => {
  it('renders slot content when not loading', () => {
    const wrapper = mount(BSkeleton, {
      props: { loading: false },
      slots: {
        default: '<div data-test="content">Loaded content</div>',
      },
    });

    expect(wrapper.find('[data-test="content"]').exists()).toBe(true);
    expect(wrapper.find('.b-skeleton').exists()).toBe(false);
  });

  it('renders default title and paragraph rows when loading', () => {
    const wrapper = mount(BSkeleton, {
      props: { loading: true },
    });

    expect(wrapper.find('.b-skeleton__title').exists()).toBe(true);
    expect(wrapper.findAll('.b-skeleton__line')).toHaveLength(3);
    expect(wrapper.find('.b-skeleton__avatar').exists()).toBe(false);
  });

  it('supports avatar configuration and paragraph widths', () => {
    const wrapper = mount(BSkeleton, {
      props: {
        avatar: { size: 32, shape: BSkeletonAvatarShape.Square },
        paragraph: { rows: 2, width: ['100%', '50%'] },
      },
    });

    const avatar = wrapper.find('.b-skeleton__avatar');
    expect(avatar.exists()).toBe(true);
    expect(avatar.attributes('style')).toContain('width: 32px');
    expect(avatar.classes()).toContain('b:rounded-md');

    const lines = wrapper.findAll('.b-skeleton__line');
    expect(lines).toHaveLength(2);
    expect(lines[1].attributes('style')).toContain('width: 50%');
  });

  it('adds active class when active', () => {
    const wrapper = mount(BSkeleton, {
      props: { active: true },
    });

    expect(wrapper.classes()).toContain('b-skeleton--active');
  });
});
