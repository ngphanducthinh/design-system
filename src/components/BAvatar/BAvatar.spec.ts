import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import { BAvatarShape, BAvatarSize } from '@/types.ts';
import BAvatar from './BAvatar.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function mountAvatar(props = {}, slots = {}) {
  return mount(BAvatar, { props, slots });
}

// ─────────────────────────────────────────────
// 1. Defaults & variants render
// ─────────────────────────────────────────────
describe('BAvatar – defaults and variants', () => {
  it('renders with default props (circle, default size)', () => {
    const wrapper = mountAvatar();
    expect(wrapper.find('.b-avatar').exists()).toBe(true);
    expect(wrapper.find('.b-avatar--circle').exists()).toBe(true);
    expect(wrapper.find('.b-avatar--default').exists()).toBe(true);
  });

  it('renders fallback user icon when no src or slot content', () => {
    const wrapper = mountAvatar();
    expect(wrapper.find('.b-avatar__icon--fallback').exists()).toBe(true);
    expect(wrapper.find('svg').exists()).toBe(true);
  });

  it.each([BAvatarShape.Circle, BAvatarShape.Square])(
    'renders shape=%s with correct class',
    (shape) => {
      const wrapper = mountAvatar({ shape });
      expect(wrapper.find(`.b-avatar--${shape}`).exists()).toBe(true);
    },
  );

  it.each([BAvatarSize.Small, BAvatarSize.Default, BAvatarSize.Large])(
    'renders size=%s with correct class',
    (size) => {
      const wrapper = mountAvatar({ size });
      expect(wrapper.find(`.b-avatar--${size}`).exists()).toBe(true);
    },
  );
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behaviour
// ─────────────────────────────────────────────
describe('BAvatar – props map to DOM', () => {
  it('renders image when src is provided', () => {
    const wrapper = mountAvatar({ src: 'https://example.com/avatar.png' });
    expect(wrapper.find('.b-avatar--image').exists()).toBe(true);
    const img = wrapper.find('img.b-avatar__image');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('https://example.com/avatar.png');
  });

  it('sets alt attribute on img', () => {
    const wrapper = mountAvatar({ src: 'https://example.com/avatar.png', alt: 'User avatar' });
    expect(wrapper.find('img').attributes('alt')).toBe('User avatar');
  });

  it('sets srcset on img when provided', () => {
    const wrapper = mountAvatar({
      src: 'https://example.com/1x.png',
      srcSet: 'https://example.com/2x.png 2x',
    });
    expect(wrapper.find('img').attributes('srcset')).toBe('https://example.com/2x.png 2x');
  });

  it('sets crossorigin on img when provided', () => {
    const wrapper = mountAvatar({
      src: 'https://example.com/avatar.png',
      crossOrigin: 'anonymous',
    });
    expect(wrapper.find('img').attributes('crossorigin')).toBe('anonymous');
  });

  it('sets draggable on img when provided', () => {
    const wrapper = mountAvatar({
      src: 'https://example.com/avatar.png',
      draggable: false,
    });
    expect(wrapper.find('img').attributes('draggable')).toBe('false');
  });

  it('applies custom pixel size via inline style', () => {
    const wrapper = mountAvatar({ size: 64 });
    const el = wrapper.find('.b-avatar');
    expect(el.attributes('style')).toContain('width: 64px');
    expect(el.attributes('style')).toContain('height: 64px');
    expect(el.attributes('style')).toContain('font-size: 32px');
  });

  it('does NOT add size class when custom pixel size is used', () => {
    const wrapper = mountAvatar({ size: 48 });
    expect(wrapper.find('.b-avatar--small').exists()).toBe(false);
    expect(wrapper.find('.b-avatar--default').exists()).toBe(false);
    expect(wrapper.find('.b-avatar--large').exists()).toBe(false);
  });

  it('renders text from default slot', () => {
    const wrapper = mountAvatar({}, { default: () => 'U' });
    expect(wrapper.find('.b-avatar__text').exists()).toBe(true);
    expect(wrapper.find('.b-avatar__text').text()).toBe('U');
  });

  it('renders icon when icon prop is true', () => {
    const wrapper = mountAvatar({ icon: true }, { default: () => '★' });
    expect(wrapper.find('.b-avatar__icon').exists()).toBe(true);
    expect(wrapper.find('.b-avatar__text').exists()).toBe(false);
  });

  it('renders icon slot content', () => {
    const wrapper = mountAvatar({}, { icon: () => '<svg data-testid="custom-icon"></svg>' });
    expect(wrapper.find('.b-avatar__icon').exists()).toBe(true);
  });

  it('applies square shape', () => {
    const wrapper = mountAvatar({ shape: BAvatarShape.Square });
    expect(wrapper.find('.b-avatar--square').exists()).toBe(true);
    expect(wrapper.find('.b-avatar--circle').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 3. Events
// ─────────────────────────────────────────────
describe('BAvatar – events', () => {
  it('emits error and shows fallback when image fails to load', async () => {
    const wrapper = mountAvatar({ src: 'https://example.com/bad.png' });
    expect(wrapper.find('img').exists()).toBe(true);

    await wrapper.find('img').trigger('error');

    expect(wrapper.emitted('error')).toHaveLength(1);
    // After error, image should be gone and fallback should show
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('.b-avatar__icon--fallback').exists()).toBe(true);
  });

  it('falls back to text slot when image errors', async () => {
    const wrapper = mountAvatar(
      { src: 'https://example.com/bad.png' },
      { default: () => 'AB' },
    );
    expect(wrapper.find('img').exists()).toBe(true);

    await wrapper.find('img').trigger('error');

    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('.b-avatar__text').text()).toBe('AB');
  });

  it('resets image state when src changes', async () => {
    const wrapper = mountAvatar({ src: 'https://example.com/bad.png' });
    await wrapper.find('img').trigger('error');
    expect(wrapper.find('img').exists()).toBe(false);

    await wrapper.setProps({ src: 'https://example.com/good.png' });
    expect(wrapper.find('img').exists()).toBe(true);
    expect(wrapper.find('img').attributes('src')).toBe('https://example.com/good.png');
  });
});

// ─────────────────────────────────────────────
// 4. Accessibility
// ─────────────────────────────────────────────
describe('BAvatar – accessibility', () => {
  it('always has role="img"', () => {
    const wrapper = mountAvatar({}, { default: () => 'U' });
    expect(wrapper.find('.b-avatar').attributes('role')).toBe('img');
  });

  it('has aria-label from alt when alt is provided', () => {
    const wrapper = mountAvatar({ src: 'https://example.com/avatar.png', alt: 'John Doe' });
    expect(wrapper.find('.b-avatar').attributes('aria-label')).toBe('John Doe');
  });

  it('has aria-label="Avatar" as default when no alt provided', () => {
    const wrapper = mountAvatar({ src: 'https://example.com/avatar.png' });
    expect(wrapper.find('.b-avatar').attributes('aria-label')).toBe('Avatar');
  });

  it('has aria-label="Avatar" on text avatars without alt', () => {
    const wrapper = mountAvatar({}, { default: () => 'U' });
    expect(wrapper.find('.b-avatar').attributes('aria-label')).toBe('Avatar');
  });

  it('has aria-label="Avatar" on fallback avatar without alt', () => {
    const wrapper = mountAvatar();
    expect(wrapper.find('.b-avatar').attributes('aria-label')).toBe('Avatar');
  });

  it('uses alt as aria-label on text avatars when alt is provided', () => {
    const wrapper = mountAvatar({ alt: 'Jane' }, { default: () => 'J' });
    expect(wrapper.find('.b-avatar').attributes('aria-label')).toBe('Jane');
  });

  it('fallback icon is aria-hidden', () => {
    const wrapper = mountAvatar();
    expect(wrapper.find('.b-avatar__icon--fallback').attributes('aria-hidden')).toBe('true');
  });

  it('text content is aria-hidden (presentational, aria-label is on root)', () => {
    const wrapper = mountAvatar({}, { default: () => 'U' });
    expect(wrapper.find('.b-avatar__text').attributes('aria-hidden')).toBe('true');
  });

  it('icon content is aria-hidden', () => {
    const wrapper = mountAvatar({ icon: true }, { default: () => '★' });
    expect(wrapper.find('.b-avatar__icon').attributes('aria-hidden')).toBe('true');
  });
});

// ─────────────────────────────────────────────
// 5. Text auto-scaling
// ─────────────────────────────────────────────
describe('BAvatar – text auto-scaling', () => {
  it('applies scale transform when text is wider than avatar', async () => {
    // Mock offsetWidth to simulate text overflowing
    const wrapper = mountAvatar({}, { default: () => 'LongUsername' });
    const avatarEl = wrapper.find('.b-avatar').element as HTMLElement;
    const textEl = wrapper.find('.b-avatar__text').element as HTMLElement;

    // Mock: avatar is 32px wide, text is 100px wide
    vi.spyOn(avatarEl, 'offsetWidth', 'get').mockReturnValue(32);
    vi.spyOn(textEl, 'offsetWidth', 'get').mockReturnValue(100);

    // Trigger re-scale by changing gap
    await wrapper.setProps({ gap: 4 });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const style = wrapper.find('.b-avatar__text').attributes('style');
    expect(style).toContain('scale(');
  });

  it('does NOT apply scale when text fits within avatar', async () => {
    const wrapper = mountAvatar({}, { default: () => 'U' });
    const avatarEl = wrapper.find('.b-avatar').element as HTMLElement;
    const textEl = wrapper.find('.b-avatar__text').element as HTMLElement;

    // Mock: avatar is 32px wide, text is 10px wide
    vi.spyOn(avatarEl, 'offsetWidth', 'get').mockReturnValue(32);
    vi.spyOn(textEl, 'offsetWidth', 'get').mockReturnValue(10);

    await wrapper.setProps({ gap: 4 });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const style = wrapper.find('.b-avatar__text').attributes('style');
    // Should not have scale transform (or should be undefined)
    expect(style).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// 6. Edge cases
// ─────────────────────────────────────────────
describe('BAvatar – edge cases', () => {
  it('handles empty src string as no-image', () => {
    const wrapper = mountAvatar({ src: '' });
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('.b-avatar__icon--fallback').exists()).toBe(true);
  });

  it('renders multiple independent avatar instances', () => {
    const w1 = mountAvatar({ size: BAvatarSize.Small });
    const w2 = mountAvatar({ size: BAvatarSize.Large, shape: BAvatarShape.Square });
    expect(w1.find('.b-avatar--small').exists()).toBe(true);
    expect(w2.find('.b-avatar--large').exists()).toBe(true);
    expect(w2.find('.b-avatar--square').exists()).toBe(true);
  });

  it('image avatar has transparent background class', () => {
    const wrapper = mountAvatar({ src: 'https://example.com/avatar.png' });
    expect(wrapper.find('.b-avatar--image').exists()).toBe(true);
  });

  it('renders correctly with all props combined', () => {
    const wrapper = mountAvatar({
      shape: BAvatarShape.Square,
      size: BAvatarSize.Large,
      src: 'https://example.com/avatar.png',
      alt: 'User',
      crossOrigin: 'anonymous',
      draggable: true,
    });
    expect(wrapper.find('.b-avatar--square').exists()).toBe(true);
    expect(wrapper.find('.b-avatar--large').exists()).toBe(true);
    expect(wrapper.find('img').attributes('alt')).toBe('User');
    expect(wrapper.find('img').attributes('crossorigin')).toBe('anonymous');
    expect(wrapper.find('img').attributes('draggable')).toBe('true');
  });

  it('prefers icon slot over default slot', () => {
    const wrapper = mountAvatar(
      {},
      { icon: () => '<span class="custom-icon">I</span>', default: () => 'T' },
    );
    expect(wrapper.find('.b-avatar__icon').exists()).toBe(true);
    expect(wrapper.find('.b-avatar__text').exists()).toBe(false);
  });

  it('prefers image over text slot content', () => {
    const wrapper = mountAvatar(
      { src: 'https://example.com/avatar.png' },
      { default: () => 'AB' },
    );
    expect(wrapper.find('img').exists()).toBe(true);
    expect(wrapper.find('.b-avatar__text').exists()).toBe(false);
  });
});
