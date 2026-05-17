import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import BFloatButton from './BFloatButton.vue';
import BFloatButtonBackTop from './BFloatButtonBackTop.vue';
import BFloatButtonGroup from './BFloatButtonGroup.vue';
import { BFloatButtonShape, BFloatButtonTrigger, BFloatButtonType } from './types.ts';

// ─────────────────────────────────────────────
// BFloatButton
// ─────────────────────────────────────────────
describe('BFloatButton', () => {
  it('renders with default props', () => {
    const wrapper = mount(BFloatButton);
    expect(wrapper.classes()).toContain('b-float-button');
    expect(wrapper.classes()).toContain('b-float-button--circle');
    expect(wrapper.classes()).toContain('b-float-button--default');
    expect(wrapper.element.tagName.toLowerCase()).toBe('button');
    expect(wrapper.attributes('type')).toBe('button');
  });

  it('renders as an anchor when href is provided', () => {
    const wrapper = mount(BFloatButton, { props: { href: 'https://example.com' } });
    expect(wrapper.element.tagName.toLowerCase()).toBe('a');
    expect(wrapper.attributes('href')).toBe('https://example.com');
    expect(wrapper.attributes('target')).toBe('_blank');
  });

  it('applies custom target to anchor', () => {
    const wrapper = mount(BFloatButton, { props: { href: '/page', target: '_self' } });
    expect(wrapper.attributes('target')).toBe('_self');
  });

  it('applies primary type class', () => {
    const wrapper = mount(BFloatButton, { props: { type: BFloatButtonType.Primary } });
    expect(wrapper.classes()).toContain('b-float-button--primary');
    expect(wrapper.classes()).not.toContain('b-float-button--default');
  });

  it('applies square shape class', () => {
    const wrapper = mount(BFloatButton, { props: { shape: BFloatButtonShape.Square } });
    expect(wrapper.classes()).toContain('b-float-button--square');
    expect(wrapper.classes()).not.toContain('b-float-button--circle');
  });

  it('applies disabled state', () => {
    const wrapper = mount(BFloatButton, { props: { disabled: true } });
    expect(wrapper.classes()).toContain('b-float-button--disabled');
    expect(wrapper.attributes('disabled')).toBe('');
  });

  it('sets aria-disabled on anchor when disabled', () => {
    const wrapper = mount(BFloatButton, { props: { href: '/page', disabled: true } });
    expect(wrapper.attributes('aria-disabled')).toBe('true');
    expect(wrapper.attributes('disabled')).toBeUndefined();
  });

  it('sets aria-label from ariaLabel prop', () => {
    const wrapper = mount(BFloatButton, { props: { ariaLabel: 'My action' } });
    expect(wrapper.attributes('aria-label')).toBe('My action');
  });

  it('sets aria-label from tooltip when no ariaLabel', () => {
    const wrapper = mount(BFloatButton, { props: { tooltip: 'Scroll up' } });
    expect(wrapper.attributes('aria-label')).toBe('Scroll up');
  });

  it('sets title attribute from tooltip', () => {
    const wrapper = mount(BFloatButton, { props: { tooltip: 'Scroll up' } });
    expect(wrapper.attributes('title')).toBe('Scroll up');
  });

  it('renders icon slot', () => {
    const wrapper = mount(BFloatButton, {
      slots: { icon: '<svg data-testid="custom-icon" />' },
    });
    expect(wrapper.find('[data-testid="custom-icon"]').exists()).toBe(true);
  });

  it('renders description only in square shape', () => {
    const circleWrapper = mount(BFloatButton, {
      props: { description: 'Help', shape: BFloatButtonShape.Circle },
    });
    expect(circleWrapper.find('.b-float-button__description').exists()).toBe(false);

    const squareWrapper = mount(BFloatButton, {
      props: { description: 'Help', shape: BFloatButtonShape.Square },
    });
    expect(squareWrapper.find('.b-float-button__description').exists()).toBe(true);
    expect(squareWrapper.find('.b-float-button__description').text()).toBe('Help');
  });

  it('renders description slot', () => {
    const wrapper = mount(BFloatButton, {
      props: { shape: BFloatButtonShape.Square },
      slots: { description: '<span data-testid="desc-slot">Custom</span>' },
    });
    expect(wrapper.find('[data-testid="desc-slot"]').exists()).toBe(true);
  });

  it('emits click event when clicked', async () => {
    const wrapper = mount(BFloatButton);
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('does not emit click when disabled', async () => {
    const wrapper = mount(BFloatButton, { props: { disabled: true } });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('renders badge with count', () => {
    const wrapper = mount(BFloatButton, {
      props: { badge: { count: 5 } },
    });
    const badge = wrapper.find('.b-float-button__badge');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe('5');
  });

  it('renders badge overflow count', () => {
    const wrapper = mount(BFloatButton, {
      props: { badge: { count: 150, overflowCount: 99 } },
    });
    expect(wrapper.find('.b-float-button__badge').text()).toBe('99+');
  });

  it('does not render badge when count is 0 and showZero is false', () => {
    const wrapper = mount(BFloatButton, {
      props: { badge: { count: 0, showZero: false } },
    });
    expect(wrapper.find('.b-float-button__badge').exists()).toBe(false);
  });

  it('renders badge when count is 0 and showZero is true', () => {
    const wrapper = mount(BFloatButton, {
      props: { badge: { count: 0, showZero: true } },
    });
    expect(wrapper.find('.b-float-button__badge').exists()).toBe(true);
    expect(wrapper.find('.b-float-button__badge').text()).toBe('0');
  });

  it('renders dot badge', () => {
    const wrapper = mount(BFloatButton, {
      props: { badge: { dot: true } },
    });
    const badge = wrapper.find('.b-float-button__badge');
    expect(badge.exists()).toBe(true);
    expect(badge.classes()).toContain('b-float-button__badge--dot');
    expect(badge.text()).toBe('');
  });

  it('uses correct htmlType', () => {
    const wrapper = mount(BFloatButton, { props: { htmlType: 'submit' } });
    expect(wrapper.attributes('type')).toBe('submit');
  });

  it('renders tooltip text element', () => {
    const wrapper = mount(BFloatButton, { props: { tooltip: 'My tooltip' } });
    expect(wrapper.find('.b-float-button__tooltip').exists()).toBe(true);
    expect(wrapper.find('.b-float-button__tooltip').text()).toBe('My tooltip');
  });

  it('has correct role on tooltip element', () => {
    const wrapper = mount(BFloatButton, { props: { tooltip: 'Info' } });
    expect(wrapper.find('.b-float-button__tooltip').attributes('role')).toBe('tooltip');
  });

  it('icon is aria-hidden', () => {
    const wrapper = mount(BFloatButton, {
      slots: { icon: '<svg />' },
    });
    expect(wrapper.find('.b-float-button__icon').attributes('aria-hidden')).toBe('true');
  });
});

// ─────────────────────────────────────────────
// BFloatButtonGroup
// ─────────────────────────────────────────────
describe('BFloatButtonGroup', () => {
  it('renders a group wrapper without trigger', () => {
    const wrapper = mount(BFloatButtonGroup);
    expect(wrapper.find('.b-float-button-group').exists()).toBe(true);
    expect(wrapper.find('.b-float-button-group--menu').exists()).toBe(false);
  });

  it('renders menu group when trigger is set', () => {
    const wrapper = mount(BFloatButtonGroup, {
      props: { trigger: BFloatButtonTrigger.Click },
    });
    expect(wrapper.find('.b-float-button-group--menu').exists()).toBe(true);
  });

  it('trigger button has correct aria-expanded when closed', () => {
    const wrapper = mount(BFloatButtonGroup, {
      props: { trigger: BFloatButtonTrigger.Click },
    });
    const trigger = wrapper.find('.b-float-button-group__trigger');
    expect(trigger.attributes('aria-expanded')).toBe('false');
  });

  it('opens on trigger click (uncontrolled)', async () => {
    const wrapper = mount(BFloatButtonGroup, {
      props: { trigger: BFloatButtonTrigger.Click },
    });
    await wrapper.find('.b-float-button-group__trigger').trigger('click');
    await nextTick();
    // Verify via aria-expanded attribute on the trigger button (reflects isOpen state)
    expect(wrapper.find('.b-float-button-group__trigger').attributes('aria-expanded')).toBe('true');
    expect(wrapper.emitted('openChange')).toEqual([[true]]);
  });

  it('closes on second trigger click (uncontrolled)', async () => {
    const wrapper = mount(BFloatButtonGroup, {
      props: { trigger: BFloatButtonTrigger.Click },
    });
    await wrapper.find('.b-float-button-group__trigger').trigger('click');
    await nextTick();
    await wrapper.find('.b-float-button-group__trigger').trigger('click');
    await nextTick();
    expect(wrapper.find('.b-float-button-group__trigger').attributes('aria-expanded')).toBe(
      'false',
    );
    expect(wrapper.emitted('openChange')).toEqual([[true], [false]]);
  });

  it('respects controlled open prop', async () => {
    const wrapper = mount(BFloatButtonGroup, {
      props: { trigger: BFloatButtonTrigger.Click, open: true },
    });
    expect(wrapper.classes()).toContain('b-float-button-group--open');
  });

  it('emits update:open for controlled usage', async () => {
    const wrapper = mount(BFloatButtonGroup, {
      props: { trigger: BFloatButtonTrigger.Click, open: false },
    });
    const trigger = wrapper.find('.b-float-button-group__trigger');
    await trigger.trigger('click');
    expect(wrapper.emitted('update:open')).toEqual([[true]]);
  });

  it('applies placement class', () => {
    const wrapper = mount(BFloatButtonGroup, {
      props: { trigger: BFloatButtonTrigger.Click, placement: 'bottom' },
    });
    expect(wrapper.find('.b-float-button-group--bottom').exists()).toBe(true);
  });

  it('applies shape class', () => {
    const wrapper = mount(BFloatButtonGroup, {
      props: { shape: BFloatButtonShape.Square },
    });
    expect(wrapper.find('.b-float-button-group--shape-square').exists()).toBe(true);
  });

  it('group without trigger has role=group', () => {
    const wrapper = mount(BFloatButtonGroup);
    expect(wrapper.find('[role="group"]').exists()).toBe(true);
  });

  it('list is aria-hidden when closed', () => {
    const wrapper = mount(BFloatButtonGroup, {
      props: { trigger: BFloatButtonTrigger.Click },
    });
    const list = wrapper.find('.b-float-button-group__list');
    expect(list.attributes('aria-hidden')).toBe('true');
  });

  it('list is not aria-hidden when open', async () => {
    const wrapper = mount(BFloatButtonGroup, {
      props: { trigger: BFloatButtonTrigger.Click },
    });
    await wrapper.find('.b-float-button-group__trigger').trigger('click');
    await nextTick();
    // list aria-hidden should reflect isOpen state via aria-expanded on trigger
    expect(wrapper.find('.b-float-button-group__trigger').attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('.b-float-button-group__list').attributes('aria-hidden')).toBe('false');
  });
});

// ─────────────────────────────────────────────
// BFloatButtonBackTop
// ─────────────────────────────────────────────
describe('BFloatButtonBackTop', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollY', 0);
    // Stub rAF to immediately invoke callback with a time far enough in the future
    // (duration default is 450ms) so progress reaches 1 and the loop terminates.
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((cb: FrameRequestCallback) => {
        cb(performance.now() + 1000);
        return 0;
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not render when scroll is below threshold', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
    const wrapper = mount(BFloatButtonBackTop, { props: { visibilityHeight: 400 } });
    expect(wrapper.find('.b-float-button').exists()).toBe(false);
  });

  it('renders when scroll exceeds visibilityHeight', async () => {
    const wrapper = mount(BFloatButtonBackTop, { props: { visibilityHeight: 100 } });
    Object.defineProperty(window, 'scrollY', { value: 200, writable: true, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-float-button').exists()).toBe(true);
  });

  it('emits click when button is clicked', async () => {
    const wrapper = mount(BFloatButtonBackTop, { props: { visibilityHeight: 0 } });
    Object.defineProperty(window, 'scrollY', { value: 1, writable: true, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-float-button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('applies shape and type props to inner button', async () => {
    const wrapper = mount(BFloatButtonBackTop, {
      props: {
        visibilityHeight: 0,
        shape: BFloatButtonShape.Square,
        type: BFloatButtonType.Primary,
      },
    });
    Object.defineProperty(window, 'scrollY', { value: 1, writable: true, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-float-button--square').exists()).toBe(true);
    expect(wrapper.find('.b-float-button--primary').exists()).toBe(true);
  });

  it('has aria-label "Back to top" on inner button', async () => {
    const wrapper = mount(BFloatButtonBackTop, { props: { visibilityHeight: 0 } });
    Object.defineProperty(window, 'scrollY', { value: 1, writable: true, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-float-button').attributes('aria-label')).toBe('Back to top');
  });
});
