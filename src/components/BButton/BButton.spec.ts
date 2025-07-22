import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { BButtonSize, BButtonVariant } from '@/types.ts'
import BButton from './BButton.vue'

describe('BButton', () => {
  it('renders properly with default props', () => {
    const wrapper = mount(BButton, {
      slots: {
        default: 'Test Button',
      },
    })

    expect(wrapper.text()).toBe('Test Button')
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.attributes('disabled')).toBeUndefined()

    // Default variant should be primary
    expect(wrapper.classes()).toContain('b:bg-sky-500')

    // Default size should be medium
    expect(wrapper.classes()).toContain('b:h-9')
    expect(wrapper.classes()).toContain('b:p-3')
  })

  it('renders with different variants', () => {
    const variants = [
      { prop: BButtonVariant.Primary, className: 'b:bg-sky-500' },
      { prop: BButtonVariant.Secondary, className: 'b:bg-slate-500' },
      { prop: BButtonVariant.Success, className: 'b:bg-green-500' },
      { prop: BButtonVariant.Failure, className: 'b:bg-red-500' },
      { prop: BButtonVariant.Warning, className: 'b:bg-yellow-500' },
      { prop: BButtonVariant.Info, className: 'b:bg-blue-500' },
    ]

    variants.forEach(({ prop, className }) => {
      const wrapper = mount(BButton, {
        props: {
          variant: prop,
        },
      })

      expect(wrapper.classes()).toContain(className)
    })
  })

  it('renders with different sizes', () => {
    const sizes = [
      { prop: BButtonSize.Small, height: 'b:h-7', padding: 'b:p-2' },
      { prop: BButtonSize.Medium, height: 'b:h-9', padding: 'b:p-3' },
      { prop: BButtonSize.Large, height: 'b:h-10', padding: 'b:p-4' },
    ]

    sizes.forEach(({ prop, height, padding }) => {
      const wrapper = mount(BButton, {
        props: {
          size: prop,
        },
      })

      expect(wrapper.classes()).toContain(height)
      expect(wrapper.classes()).toContain(padding)
    })
  })

  it('applies correct text color based on variant', () => {
    // All variants except secondary should have white text
    const whiteTextVariants = [
      BButtonVariant.Primary,
      BButtonVariant.Success,
      BButtonVariant.Failure,
      BButtonVariant.Warning,
      BButtonVariant.Info,
    ]

    whiteTextVariants.forEach((variant) => {
      const wrapper = mount(BButton, {
        props: { variant },
      })

      expect(wrapper.classes()).toContain('b:text-white')
      expect(wrapper.classes()).not.toContain('b:text-black')
    })

    // Secondary variant should have black text
    const wrapper = mount(BButton, {
      props: { variant: BButtonVariant.Secondary },
    })

    expect(wrapper.classes()).toContain('b:text-black')
    expect(wrapper.classes()).not.toContain('b:text-white')
  })

  it('applies disabled attribute and styling when disabled', () => {
    const wrapper = mount(BButton, {
      props: {
        disabled: true,
      },
    })

    expect(wrapper.attributes('disabled')).toBe('')
    expect(wrapper.classes()).toContain('b:disabled:opacity-50')
  })

  it('renders slot content', () => {
    const wrapper = mount(BButton, {
      slots: {
        default: '<span data-test="custom-content">Click me</span>',
      },
    })

    expect(wrapper.find('[data-test="custom-content"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="custom-content"]').text()).toBe('Click me')
  })
})
