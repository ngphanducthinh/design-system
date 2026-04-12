import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { BEmptyImage } from '@/types.ts';
import BEmpty from './BEmpty.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function mountEmpty(props = {}, slots: Record<string, unknown> = {}) {
  return mount(BEmpty, { props, slots });
}

// ─────────────────────────────────────────────
// 1. Defaults & variants render
// ─────────────────────────────────────────────
describe('BEmpty – defaults and variants', () => {
  it('renders root .b-empty element with default image', () => {
    const wrapper = mountEmpty();
    expect(wrapper.find('.b-empty').exists()).toBe(true);
    expect(wrapper.find('.b-empty__image').exists()).toBe(true);
    expect(wrapper.find('.b-empty__svg--default').exists()).toBe(true);
  });

  it('renders default description "No data"', () => {
    const wrapper = mountEmpty();
    expect(wrapper.find('.b-empty__description').text()).toBe('No data');
  });

  it('renders simple variant with simple SVG', () => {
    const wrapper = mountEmpty({ image: BEmptyImage.Simple });
    expect(wrapper.find('.b-empty--simple').exists()).toBe(true);
    expect(wrapper.find('.b-empty__svg--simple').exists()).toBe(true);
    expect(wrapper.find('.b-empty__svg--default').exists()).toBe(false);
  });

  it('renders default variant without --simple modifier', () => {
    const wrapper = mountEmpty({ image: BEmptyImage.Default });
    expect(wrapper.find('.b-empty--simple').exists()).toBe(false);
    expect(wrapper.find('.b-empty__svg--default').exists()).toBe(true);
  });

  it.each([BEmptyImage.Default, BEmptyImage.Simple])(
    'renders image variant=%s correctly',
    (variant) => {
      const wrapper = mountEmpty({ image: variant });
      expect(wrapper.find(`.b-empty__svg--${variant}`).exists()).toBe(true);
    },
  );
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behavior
// ─────────────────────────────────────────────
describe('BEmpty – props map to DOM', () => {
  it('renders custom description text', () => {
    const wrapper = mountEmpty({ description: 'Nothing here' });
    expect(wrapper.find('.b-empty__description').text()).toBe('Nothing here');
  });

  it('hides description when hideDescription=true', () => {
    const wrapper = mountEmpty({ hideDescription: true });
    expect(wrapper.find('.b-empty__description').exists()).toBe(false);
  });

  it('renders empty string description', () => {
    const wrapper = mountEmpty({ description: '' });
    expect(wrapper.find('.b-empty__description').exists()).toBe(true);
    expect(wrapper.find('.b-empty__description').text()).toBe('');
  });

  it('applies imageStyle to the image container', () => {
    const wrapper = mountEmpty({ imageStyle: { height: '80px' } });
    const style = wrapper.find('.b-empty__image').attributes('style');
    expect(style).toContain('height: 80px');
  });

  it('renders custom URL image when image prop is a URL string', () => {
    const wrapper = mountEmpty({ image: 'https://example.com/empty.svg' });
    const img = wrapper.find('.b-empty__custom-image');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('https://example.com/empty.svg');
    // Built-in SVGs should not render
    expect(wrapper.find('.b-empty__svg').exists()).toBe(false);
  });

  it('renders description slot overriding prop', () => {
    const wrapper = mountEmpty(
      { description: 'Prop text' },
      { description: () => 'Slot text' },
    );
    expect(wrapper.find('.b-empty__description').text()).toBe('Slot text');
  });

  it('renders image slot overriding built-in image', () => {
    const wrapper = mountEmpty(
      {},
      { image: () => 'Custom Image Content' },
    );
    expect(wrapper.find('.b-empty__image').text()).toContain('Custom Image Content');
    expect(wrapper.find('.b-empty__svg').exists()).toBe(false);
  });

  it('renders default slot as footer actions', () => {
    const wrapper = mountEmpty({}, { default: () => 'Create Now' });
    expect(wrapper.find('.b-empty__footer').exists()).toBe(true);
    expect(wrapper.find('.b-empty__footer').text()).toBe('Create Now');
  });

  it('does not render footer when no default slot', () => {
    const wrapper = mountEmpty();
    expect(wrapper.find('.b-empty__footer').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 3. Slots
// ─────────────────────────────────────────────
describe('BEmpty – slots', () => {
  it('description slot shows even when hideDescription is true', () => {
    const wrapper = mountEmpty(
      { hideDescription: true },
      { description: () => 'Slot overrides hidden' },
    );
    expect(wrapper.find('.b-empty__description').exists()).toBe(true);
    expect(wrapper.find('.b-empty__description').text()).toBe('Slot overrides hidden');
  });

  it('image slot renders custom HTML', () => {
    const wrapper = mountEmpty(
      {},
      { image: () => '<div class="custom-svg">Icon</div>' },
    );
    expect(wrapper.find('.b-empty__image').text()).toContain('Icon');
  });

  it('all three slots render together', () => {
    const wrapper = mountEmpty(
      {},
      {
        image: () => 'IMG',
        description: () => 'DESC',
        default: () => 'ACTION',
      },
    );
    expect(wrapper.find('.b-empty__image').text()).toContain('IMG');
    expect(wrapper.find('.b-empty__description').text()).toBe('DESC');
    expect(wrapper.find('.b-empty__footer').text()).toBe('ACTION');
  });
});

// ─────────────────────────────────────────────
// 4. Accessibility
// ─────────────────────────────────────────────
describe('BEmpty – accessibility', () => {
  it('has role="status" on root element', () => {
    const wrapper = mountEmpty();
    expect(wrapper.find('.b-empty').attributes('role')).toBe('status');
  });

  it('has aria-label with description text', () => {
    const wrapper = mountEmpty({ description: 'No results found' });
    expect(wrapper.find('.b-empty').attributes('aria-label')).toBe('No results found');
  });

  it('has default aria-label "No data" when no description', () => {
    const wrapper = mountEmpty();
    expect(wrapper.find('.b-empty').attributes('aria-label')).toBe('No data');
  });

  it('has aria-label "No data" when hideDescription is true', () => {
    const wrapper = mountEmpty({ hideDescription: true });
    expect(wrapper.find('.b-empty').attributes('aria-label')).toBe('No data');
  });

  it('default SVG has aria-hidden="true"', () => {
    const wrapper = mountEmpty({ image: BEmptyImage.Default });
    expect(wrapper.find('.b-empty__svg--default').attributes('aria-hidden')).toBe('true');
  });

  it('simple SVG has aria-hidden="true"', () => {
    const wrapper = mountEmpty({ image: BEmptyImage.Simple });
    expect(wrapper.find('.b-empty__svg--simple').attributes('aria-hidden')).toBe('true');
  });

  it('custom image has aria-hidden="true"', () => {
    const wrapper = mountEmpty({ image: 'https://example.com/img.png' });
    expect(wrapper.find('.b-empty__custom-image').attributes('aria-hidden')).toBe('true');
  });

  it('SVGs have focusable="false" to prevent focus in IE/Edge', () => {
    const wrapper = mountEmpty({ image: BEmptyImage.Default });
    expect(wrapper.find('.b-empty__svg--default').attributes('focusable')).toBe('false');
  });
});

// ─────────────────────────────────────────────
// 5. Edge cases
// ─────────────────────────────────────────────
describe('BEmpty – edge cases', () => {
  it('handles very long description text', () => {
    const long = 'A'.repeat(500);
    const wrapper = mountEmpty({ description: long });
    expect(wrapper.find('.b-empty__description').text()).toBe(long);
  });

  it('renders multiple independent instances', () => {
    const w1 = mountEmpty({ description: 'First' });
    const w2 = mountEmpty({ description: 'Second', image: BEmptyImage.Simple });
    expect(w1.find('.b-empty__description').text()).toBe('First');
    expect(w2.find('.b-empty__description').text()).toBe('Second');
    expect(w1.find('.b-empty__svg--default').exists()).toBe(true);
    expect(w2.find('.b-empty__svg--simple').exists()).toBe(true);
  });

  it('updates description reactively', async () => {
    const wrapper = mountEmpty({ description: 'Initial' });
    expect(wrapper.find('.b-empty__description').text()).toBe('Initial');
    await wrapper.setProps({ description: 'Updated' });
    expect(wrapper.find('.b-empty__description').text()).toBe('Updated');
  });

  it('updates image variant reactively', async () => {
    const wrapper = mountEmpty({ image: BEmptyImage.Default });
    expect(wrapper.find('.b-empty__svg--default').exists()).toBe(true);
    await wrapper.setProps({ image: BEmptyImage.Simple });
    expect(wrapper.find('.b-empty__svg--simple').exists()).toBe(true);
    expect(wrapper.find('.b-empty__svg--default').exists()).toBe(false);
  });

  it('switches from built-in to custom URL image reactively', async () => {
    const wrapper = mountEmpty({ image: BEmptyImage.Default });
    expect(wrapper.find('.b-empty__svg--default').exists()).toBe(true);
    await wrapper.setProps({ image: 'https://example.com/empty.png' });
    expect(wrapper.find('.b-empty__svg--default').exists()).toBe(false);
    expect(wrapper.find('.b-empty__custom-image').exists()).toBe(true);
  });

  it('handles empty string as image (falls through to custom URL, no render)', () => {
    const wrapper = mountEmpty({ image: '' });
    // Empty string: isBuiltInImage=false, isCustomUrl=false (length===0)
    expect(wrapper.find('.b-empty__svg').exists()).toBe(false);
    expect(wrapper.find('.b-empty__custom-image').exists()).toBe(false);
  });

  it('imageStyle with multiple properties applies correctly', () => {
    const wrapper = mountEmpty({
      imageStyle: { height: '60px', opacity: '0.5' },
    });
    const style = wrapper.find('.b-empty__image').attributes('style');
    expect(style).toContain('height: 60px');
    expect(style).toContain('opacity: 0.5');
  });
});

// ─────────────────────────────────────────────
// 6. CSS class hooks
// ─────────────────────────────────────────────
describe('BEmpty – CSS class hooks', () => {
  it('has stable .b-empty root class', () => {
    const wrapper = mountEmpty();
    expect(wrapper.find('.b-empty').exists()).toBe(true);
  });

  it('has .b-empty__image class on image container', () => {
    const wrapper = mountEmpty();
    expect(wrapper.find('.b-empty__image').exists()).toBe(true);
  });

  it('has .b-empty__description class on description', () => {
    const wrapper = mountEmpty();
    expect(wrapper.find('.b-empty__description').exists()).toBe(true);
  });

  it('has .b-empty__footer class on footer when slot provided', () => {
    const wrapper = mountEmpty({}, { default: () => 'Action' });
    expect(wrapper.find('.b-empty__footer').exists()).toBe(true);
  });

  it('applies .b-empty--simple modifier for simple image', () => {
    const wrapper = mountEmpty({ image: BEmptyImage.Simple });
    expect(wrapper.classes()).toContain('b-empty--simple');
  });
});
