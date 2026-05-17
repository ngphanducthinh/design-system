import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { BCommonColor, BCommonSize } from '@/types.ts';
import BButton from './BButton.vue';

describe('BButton', () => {
  it('renders properly with default props', () => {
    const wrapper = mount(BButton, {
      slots: {
        default: 'Test Button',
      },
    });

    expect(wrapper.text()).toBe('Test Button');
    expect(wrapper.attributes('type')).toBe('button');
    expect(wrapper.attributes('disabled')).toBeUndefined();

    // Default variant should be primary
    expect(wrapper.classes()).toContain('b:bg-primary');

    // Default size should be medium
    expect(wrapper.classes()).toContain('b:h-8');
    expect(wrapper.classes()).toContain('b:px-4');
  });

  it('renders with different variants', () => {
    const variants = [
      { prop: BCommonColor.Primary, className: 'b:bg-primary' },
      { prop: BCommonColor.Secondary, className: 'b:bg-secondary' },
      { prop: BCommonColor.Success, className: 'b:bg-success' },
      { prop: BCommonColor.Failure, className: 'b:bg-failure' },
      { prop: BCommonColor.Warning, className: 'b:bg-warning' },
      { prop: BCommonColor.Info, className: 'b:bg-info' },
    ];

    variants.forEach(({ prop, className }) => {
      const wrapper = mount(BButton, {
        props: {
          color: prop,
        },
      });

      expect(wrapper.classes()).toContain(className);
    });
  });

  it('renders with different sizes', () => {
    const sizes = [
      { prop: BCommonSize.Small, height: 'b:h-6', width: 'b:w-6' },
      { prop: BCommonSize.Medium, height: 'b:h-8', width: 'b:w-8' },
      { prop: BCommonSize.Large, height: 'b:h-10', width: 'b:w-10' },
    ];

    sizes.forEach(({ prop, height, width }) => {
      const wrapper = mount(BButton, {
        props: {
          size: prop,
        },
      });

      expect(wrapper.classes()).toContain(height);
      expect(wrapper.classes()).toContain(width);
    });
  });

  it('applies correct text color based on variant', () => {
    // All variants except secondary should have white text
    const whiteTextVariants = [
      BCommonColor.Primary,
      BCommonColor.Success,
      BCommonColor.Failure,
      BCommonColor.Warning,
      BCommonColor.Info,
    ];

    whiteTextVariants.forEach((color) => {
      const wrapper = mount(BButton, {
        props: { color },
      });

      expect(wrapper.classes()).toContain('b:text-white');
      expect(wrapper.classes()).not.toContain('b:text-black');
    });

    // Secondary variant should have black text
    const wrapper = mount(BButton, {
      props: { color: BCommonColor.Secondary },
    });

    expect(wrapper.classes()).toContain('b:text-black');
    expect(wrapper.classes()).not.toContain('b:text-white');
  });

  it('applies disabled attribute and styling when disabled', () => {
    const wrapper = mount(BButton, {
      props: {
        disabled: true,
      },
    });

    expect(wrapper.attributes('disabled')).toBe('');
    expect(wrapper.classes()).toContain('b:disabled:opacity-50');
  });

  it('renders slot content', () => {
    const wrapper = mount(BButton, {
      slots: {
        default: '<span data-test="custom-content">Click me</span>',
      },
    });

    expect(wrapper.find('[data-test="custom-content"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="custom-content"]').text()).toBe('Click me');
  });
});
