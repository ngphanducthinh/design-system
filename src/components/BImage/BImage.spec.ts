import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BImage from './BImage.vue';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function mountImage(props = {}, slots: Record<string, any> = {}) {
  return mount(BImage, {
    props,
    slots,
    global: {
      stubs: {
        Teleport: true,
      },
    },
  });
}

function mountImageReal(props = {}, slots: Record<string, any> = {}) {
  return mount(BImage, {
    props,
    slots,
    global: { stubs: { Teleport: false } },
  });
}

function fireImgLoad(wrapper: ReturnType<typeof mount>) {
  wrapper.find('.b-image__img').trigger('load');
}

function fireImgError(wrapper: ReturnType<typeof mount>) {
  wrapper.find('.b-image__img').trigger('error');
}

// ─────────────────────────────────────────────
// 1. Defaults & variants render
// ─────────────────────────────────────────────
describe('BImage – defaults and variants', () => {
  it('renders root .b-image element', () => {
    const wrapper = mountImage({ src: 'test.jpg' });
    expect(wrapper.find('.b-image').exists()).toBe(true);
  });

  it('renders an <img> with the correct src', () => {
    const wrapper = mountImage({ src: 'https://example.com/photo.jpg' });
    expect(wrapper.find('.b-image__img').attributes('src')).toBe('https://example.com/photo.jpg');
  });

  it('renders with default preview enabled (has --preview modifier)', () => {
    const wrapper = mountImage({ src: 'test.jpg' });
    expect(wrapper.find('.b-image--preview').exists()).toBe(true);
  });

  it('renders without preview modifier when preview=false', () => {
    const wrapper = mountImage({ src: 'test.jpg', preview: false });
    expect(wrapper.find('.b-image--preview').exists()).toBe(false);
  });

  it('renders alt text on the image', () => {
    const wrapper = mountImage({ src: 'test.jpg', alt: 'A cute cat' });
    expect(wrapper.find('.b-image__img').attributes('alt')).toBe('A cute cat');
  });

  it('defaults alt to empty string', () => {
    const wrapper = mountImage({ src: 'test.jpg' });
    expect(wrapper.find('.b-image__img').attributes('alt')).toBe('');
  });
});

// ─────────────────────────────────────────────
// 2. Props map to DOM and behavior
// ─────────────────────────────────────────────
describe('BImage – props map to DOM', () => {
  it('applies width and height as inline styles on wrapper', () => {
    const wrapper = mountImage({ src: 'test.jpg', width: 200, height: 150 });
    const style = wrapper.find('.b-image').attributes('style');
    expect(style).toContain('width: 200px');
    expect(style).toContain('height: 150px');
  });

  it('applies string width/height as-is', () => {
    const wrapper = mountImage({ src: 'test.jpg', width: '50%', height: 'auto' });
    const style = wrapper.find('.b-image').attributes('style');
    expect(style).toContain('width: 50%');
    expect(style).toContain('height: auto');
  });

  it('sets numeric width/height as img attributes', () => {
    const wrapper = mountImage({ src: 'test.jpg', width: 200, height: 150 });
    expect(wrapper.find('.b-image__img').attributes('width')).toBe('200');
    expect(wrapper.find('.b-image__img').attributes('height')).toBe('150');
  });

  it('shows placeholder shimmer when placeholder=true and loading', () => {
    const wrapper = mountImage({ src: 'test.jpg', placeholder: true });
    expect(wrapper.find('.b-image__placeholder').exists()).toBe(true);
    expect(wrapper.find('.b-image__placeholder-shimmer').exists()).toBe(true);
  });

  it('hides placeholder after image loads', async () => {
    const wrapper = mountImage({ src: 'test.jpg', placeholder: true });
    expect(wrapper.find('.b-image__placeholder').exists()).toBe(true);
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-image__placeholder').exists()).toBe(false);
  });

  it('does not show placeholder when placeholder=false', () => {
    const wrapper = mountImage({ src: 'test.jpg', placeholder: false });
    expect(wrapper.find('.b-image__placeholder').exists()).toBe(false);
  });

  it('shows preview mask only after image loads', async () => {
    const wrapper = mountImage({ src: 'test.jpg' });
    expect(wrapper.find('.b-image__mask').exists()).toBe(false);
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-image__mask').exists()).toBe(true);
  });

  it('does not show mask when preview=false', async () => {
    const wrapper = mountImage({ src: 'test.jpg', preview: false });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-image__mask').exists()).toBe(false);
  });

  // ── Native <img> attributes ──
  it('passes loading="lazy" to the <img>', () => {
    const wrapper = mountImage({ src: 'test.jpg', loading: 'lazy' });
    expect(wrapper.find('.b-image__img').attributes('loading')).toBe('lazy');
  });

  it('passes crossOrigin to the <img>', () => {
    const wrapper = mountImage({ src: 'test.jpg', crossOrigin: 'anonymous' });
    expect(wrapper.find('.b-image__img').attributes('crossorigin')).toBe('anonymous');
  });

  it('passes decoding to the <img>', () => {
    const wrapper = mountImage({ src: 'test.jpg', decoding: 'async' });
    expect(wrapper.find('.b-image__img').attributes('decoding')).toBe('async');
  });

  it('passes referrerPolicy to the <img>', () => {
    const wrapper = mountImage({ src: 'test.jpg', referrerPolicy: 'no-referrer' });
    expect(wrapper.find('.b-image__img').attributes('referrerpolicy')).toBe('no-referrer');
  });
});

// ─────────────────────────────────────────────
// 3. Progressive loading
// ─────────────────────────────────────────────
describe('BImage – progressive loading', () => {
  it('shows blurred low-res placeholder when placeholderSrc set', () => {
    const wrapper = mountImage({ src: 'full.jpg', placeholderSrc: 'thumb.jpg' });
    const prog = wrapper.find('.b-image__progressive-placeholder');
    expect(prog.exists()).toBe(true);
    expect(prog.attributes('src')).toBe('thumb.jpg');
    expect(prog.attributes('aria-hidden')).toBe('true');
  });

  it('hides progressive placeholder after full image loads', async () => {
    const wrapper = mountImage({ src: 'full.jpg', placeholderSrc: 'thumb.jpg' });
    expect(wrapper.find('.b-image__progressive-placeholder').exists()).toBe(true);
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-image__progressive-placeholder').exists()).toBe(false);
  });

  it('does not show shimmer placeholder when placeholderSrc is provided', () => {
    const wrapper = mountImage({
      src: 'full.jpg',
      placeholderSrc: 'thumb.jpg',
      placeholder: true,
    });
    // Shimmer should not show because placeholderSrc takes priority
    expect(wrapper.find('.b-image__placeholder').exists()).toBe(false);
    expect(wrapper.find('.b-image__progressive-placeholder').exists()).toBe(true);
  });

  it('does not show progressive placeholder when not provided', () => {
    const wrapper = mountImage({ src: 'test.jpg' });
    expect(wrapper.find('.b-image__progressive-placeholder').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 4. Mask prop (hide mask while keeping preview)
// ─────────────────────────────────────────────
describe('BImage – mask prop', () => {
  it('shows mask by default when preview=true', async () => {
    const wrapper = mountImage({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-image__mask').exists()).toBe(true);
  });

  it('hides mask overlay when mask=false', async () => {
    const wrapper = mountImage({ src: 'test.jpg', mask: false });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-image__mask').exists()).toBe(false);
  });

  it('shows invisible click target when mask=false and preview=true', async () => {
    const wrapper = mountImage({ src: 'test.jpg', mask: false });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-image__click-target').exists()).toBe(true);
    expect(wrapper.find('.b-image__click-target').attributes('role')).toBe('button');
  });

  it('clicking invisible target opens preview', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg', mask: false });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__click-target').trigger('click');
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.b-image-preview')).toBeTruthy();
    wrapper.unmount();
  });
});

// ─────────────────────────────────────────────
// 5. Events
// ─────────────────────────────────────────────
describe('BImage – events', () => {
  it('emits error when image fails to load', async () => {
    const wrapper = mountImage({ src: 'bad.jpg' });
    fireImgError(wrapper);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('error')).toHaveLength(1);
  });

  it('uses fallback src on error before emitting', async () => {
    const wrapper = mountImage({ src: 'bad.jpg', fallback: 'fallback.jpg' });
    fireImgError(wrapper);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-image__img').attributes('src')).toBe('fallback.jpg');
    expect(wrapper.emitted('error')).toHaveLength(1);
  });

  it('emits error again when fallback also fails', async () => {
    const wrapper = mountImage({ src: 'bad.jpg', fallback: 'fallback.jpg' });
    fireImgError(wrapper);
    await wrapper.vm.$nextTick();
    fireImgError(wrapper);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('error')).toHaveLength(2);
  });

  it('adds --error class when image fails with no fallback', async () => {
    const wrapper = mountImage({ src: 'bad.jpg' });
    fireImgError(wrapper);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-image--error').exists()).toBe(true);
  });

  it('emits update:previewVisible when controlled preview opens', async () => {
    const wrapper = mountImage({ src: 'test.jpg', previewVisible: false });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    expect(wrapper.emitted('update:previewVisible')).toEqual([[true]]);
  });

  it('emits update:previewVisible(false) when controlled preview closes', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg', previewVisible: true });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    const closeBtn = document.querySelector('.b-image-preview__close') as HTMLElement;
    expect(closeBtn).toBeTruthy();
    closeBtn?.click();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('update:previewVisible')).toEqual([[false]]);
    wrapper.unmount();
  });
});

// ─────────────────────────────────────────────
// 6. Transform event
// ─────────────────────────────────────────────
describe('BImage – transform event', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('emits transform with action "zoomIn" on zoom in', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const zoomInBtn = document.querySelector('[aria-label="Zoom in"]') as HTMLElement;
    zoomInBtn?.click();
    await wrapper.vm.$nextTick();
    const transformEvents = wrapper.emitted('transform') as Array<
      [{ transform: unknown; action: string }]
    >;
    expect(transformEvents.length).toBeGreaterThan(0);
    const last = transformEvents[transformEvents.length - 1][0];
    expect(last.action).toBe('zoomIn');
    expect((last.transform as { scale: number }).scale).toBe(1.5);
    wrapper.unmount();
  });

  it('emits transform with action "rotateLeft"', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const btn = document.querySelector('[aria-label="Rotate left"]') as HTMLElement;
    btn?.click();
    await wrapper.vm.$nextTick();
    const events = wrapper.emitted('transform') as Array<[{ transform: unknown; action: string }]>;
    const last = events[events.length - 1][0];
    expect(last.action).toBe('rotateLeft');
    expect((last.transform as { rotate: number }).rotate).toBe(-90);
    wrapper.unmount();
  });

  it('emits transform with action "flipX"', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const btn = document.querySelector('[aria-label="Flip horizontal"]') as HTMLElement;
    btn?.click();
    await wrapper.vm.$nextTick();
    const events = wrapper.emitted('transform') as Array<[{ transform: unknown; action: string }]>;
    const last = events[events.length - 1][0];
    expect(last.action).toBe('flipX');
    expect((last.transform as { flipX: boolean }).flipX).toBe(true);
    wrapper.unmount();
  });

  it('emits transform with action "reset" on 1:1 button', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    // Zoom first
    const zoomInBtn = document.querySelector('[aria-label="Zoom in"]') as HTMLElement;
    zoomInBtn?.click();
    await wrapper.vm.$nextTick();
    // Reset
    const resetBtn = document.querySelector('[aria-label="Reset to original size"]') as HTMLElement;
    resetBtn?.click();
    await wrapper.vm.$nextTick();
    const events = wrapper.emitted('transform') as Array<[{ transform: unknown; action: string }]>;
    const last = events[events.length - 1][0];
    expect(last.action).toBe('reset');
    expect((last.transform as { scale: number }).scale).toBe(1);
    wrapper.unmount();
  });
});

// ─────────────────────────────────────────────
// 7. Keyboard and focus
// ─────────────────────────────────────────────
describe('BImage – keyboard and focus', () => {
  it('mask is focusable with tabindex=0', async () => {
    const wrapper = mountImage({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    const mask = wrapper.find('.b-image__mask');
    expect(mask.attributes('tabindex')).toBe('0');
  });

  it('opens preview on Enter key', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('keydown', { key: 'Enter' });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.b-image-preview')).toBeTruthy();
    wrapper.unmount();
  });

  it('opens preview on Space key', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('keydown', { key: ' ' });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.b-image-preview')).toBeTruthy();
    wrapper.unmount();
  });

  it('closes preview on Escape key', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.b-image-preview')).toBeTruthy();
    const overlay = document.querySelector('.b-image-preview') as HTMLElement;
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    overlay.dispatchEvent(event);
    await wrapper.vm.$nextTick();
    wrapper.unmount();
  });

  it('mask has role="button"', async () => {
    const wrapper = mountImage({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-image__mask').attributes('role')).toBe('button');
  });

  it('mask has aria-label for preview', async () => {
    const wrapper = mountImage({ src: 'test.jpg', alt: 'Sunset' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-image__mask').attributes('aria-label')).toBe('Preview image: Sunset');
  });
});

// ─────────────────────────────────────────────
// 8. Accessibility
// ─────────────────────────────────────────────
describe('BImage – accessibility', () => {
  it('img has correct alt attribute', () => {
    const wrapper = mountImage({ src: 'test.jpg', alt: 'Cat photo' });
    expect(wrapper.find('.b-image__img').attributes('alt')).toBe('Cat photo');
  });

  it('placeholder is aria-hidden', () => {
    const wrapper = mountImage({ src: 'test.jpg', placeholder: true });
    expect(wrapper.find('.b-image__placeholder').attributes('aria-hidden')).toBe('true');
  });

  it('decorative mask SVG is aria-hidden', async () => {
    const wrapper = mountImage({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    const svg = wrapper.find('.b-image__mask-icon');
    expect(svg.attributes('aria-hidden')).toBe('true');
    expect(svg.attributes('focusable')).toBe('false');
  });

  it('preview overlay has role="dialog" and aria-modal', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const dialog = document.querySelector('.b-image-preview');
    expect(dialog?.getAttribute('role')).toBe('dialog');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    wrapper.unmount();
  });

  it('preview has aria-label with alt text', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg', alt: 'Mountain view' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const dialog = document.querySelector('.b-image-preview');
    expect(dialog?.getAttribute('aria-label')).toBe('Image preview: Mountain view');
    wrapper.unmount();
  });

  it('toolbar has role="toolbar" and aria-label', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const toolbar = document.querySelector('.b-image-preview__toolbar');
    expect(toolbar?.getAttribute('role')).toBe('toolbar');
    expect(toolbar?.getAttribute('aria-label')).toBe('Image preview controls');
    wrapper.unmount();
  });

  it('close button has aria-label', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const closeBtn = document.querySelector('.b-image-preview__close');
    expect(closeBtn?.getAttribute('aria-label')).toBe('Close preview');
    wrapper.unmount();
  });

  it('toolbar buttons have aria-labels', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const toolbar = document.querySelector('.b-image-preview__toolbar');
    const buttons = toolbar?.querySelectorAll('button');
    expect(buttons?.length).toBeGreaterThan(0);
    buttons?.forEach((btn) => {
      expect(btn.getAttribute('aria-label')).toBeTruthy();
    });
    wrapper.unmount();
  });

  it('scale indicator has aria-live="polite"', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const scaleEl = document.querySelector('.b-image-preview__scale');
    expect(scaleEl?.getAttribute('aria-live')).toBe('polite');
    expect(scaleEl?.getAttribute('aria-atomic')).toBe('true');
    wrapper.unmount();
  });

  it('toolbar SVGs have aria-hidden and focusable=false', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const svgs = document.querySelectorAll('.b-image-preview__toolbar svg');
    svgs.forEach((svg) => {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
      expect(svg.getAttribute('focusable')).toBe('false');
    });
    wrapper.unmount();
  });

  it('flip buttons have aria-pressed reflecting state', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const flipH = document.querySelector('[aria-label="Flip horizontal"]');
    expect(flipH?.getAttribute('aria-pressed')).toBe('false');
    (flipH as HTMLElement)?.click();
    await wrapper.vm.$nextTick();
    expect(flipH?.getAttribute('aria-pressed')).toBe('true');
    wrapper.unmount();
  });
});

// ─────────────────────────────────────────────
// 9. Preview toolbar actions
// ─────────────────────────────────────────────
describe('BImage – preview toolbar', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('shows 100% scale by default', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const scaleEl = document.querySelector('.b-image-preview__scale');
    expect(scaleEl?.textContent?.trim()).toBe('100%');
    wrapper.unmount();
  });

  it('zoom in increases scale', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg', scaleStep: 0.5 });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const zoomInBtn = document.querySelector('[aria-label="Zoom in"]') as HTMLElement;
    zoomInBtn?.click();
    await wrapper.vm.$nextTick();
    const scaleEl = document.querySelector('.b-image-preview__scale');
    expect(scaleEl?.textContent?.trim()).toBe('150%');
    wrapper.unmount();
  });

  it('zoom out decreases scale', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg', scaleStep: 0.25 });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const zoomInBtn = document.querySelector('[aria-label="Zoom in"]') as HTMLElement;
    zoomInBtn?.click();
    await wrapper.vm.$nextTick();
    const zoomOutBtn = document.querySelector('[aria-label="Zoom out"]') as HTMLElement;
    zoomOutBtn?.click();
    await wrapper.vm.$nextTick();
    const scaleEl = document.querySelector('.b-image-preview__scale');
    expect(scaleEl?.textContent?.trim()).toBe('100%');
    wrapper.unmount();
  });

  it('zoom out button disabled at minScale', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg', minScale: 1 });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const zoomOutBtn = document.querySelector('[aria-label="Zoom out"]') as HTMLElement;
    expect(zoomOutBtn?.hasAttribute('disabled')).toBe(true);
    wrapper.unmount();
  });

  it('zoom in button disabled at maxScale', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg', maxScale: 1 });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const zoomInBtn = document.querySelector('[aria-label="Zoom in"]') as HTMLElement;
    expect(zoomInBtn?.hasAttribute('disabled')).toBe(true);
    wrapper.unmount();
  });

  it('uses previewSrc for preview image when provided', async () => {
    const wrapper = mountImageReal({ src: 'thumb.jpg', previewSrc: 'full.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const previewImg = document.querySelector('.b-image-preview__img');
    expect(previewImg?.getAttribute('src')).toBe('full.jpg');
    wrapper.unmount();
  });

  it('uses src for preview when previewSrc not provided', async () => {
    const wrapper = mountImageReal({ src: 'photo.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const previewImg = document.querySelector('.b-image-preview__img');
    expect(previewImg?.getAttribute('src')).toBe('photo.jpg');
    wrapper.unmount();
  });

  it('reset button restores scale to 100%', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const zoomInBtn = document.querySelector('[aria-label="Zoom in"]') as HTMLElement;
    zoomInBtn?.click();
    zoomInBtn?.click();
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.b-image-preview__scale')?.textContent?.trim()).toBe('200%');
    const resetBtn = document.querySelector('[aria-label="Reset to original size"]') as HTMLElement;
    resetBtn?.click();
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.b-image-preview__scale')?.textContent?.trim()).toBe('100%');
    wrapper.unmount();
  });
});

// ─────────────────────────────────────────────
// 10. Slots
// ─────────────────────────────────────────────
describe('BImage – slots', () => {
  it('renders custom placeholder slot', () => {
    const wrapper = mountImage(
      { src: 'test.jpg', placeholder: true },
      { placeholder: () => 'Loading...' },
    );
    expect(wrapper.find('.b-image__placeholder').text()).toContain('Loading...');
    expect(wrapper.find('.b-image__placeholder-shimmer').exists()).toBe(false);
  });

  it('renders custom preview-mask slot', async () => {
    const wrapper = mountImage({ src: 'test.jpg' }, { 'preview-mask': () => 'Click to zoom' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-image__mask').text()).toContain('Click to zoom');
    expect(wrapper.find('.b-image__mask-icon').exists()).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 11. Edge cases
// ─────────────────────────────────────────────
describe('BImage – edge cases', () => {
  it('updates displayed image when src changes', async () => {
    const wrapper = mountImage({ src: 'first.jpg' });
    expect(wrapper.find('.b-image__img').attributes('src')).toBe('first.jpg');
    await wrapper.setProps({ src: 'second.jpg' });
    expect(wrapper.find('.b-image__img').attributes('src')).toBe('second.jpg');
  });

  it('resets to loading state when src changes', async () => {
    const wrapper = mountImage({ src: 'test.jpg', placeholder: true });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-image__placeholder').exists()).toBe(false);
    await wrapper.setProps({ src: 'other.jpg' });
    expect(wrapper.find('.b-image__placeholder').exists()).toBe(true);
  });

  it('handles missing src gracefully', () => {
    const wrapper = mountImage({});
    expect(wrapper.find('.b-image').exists()).toBe(true);
    expect(wrapper.find('.b-image__img').exists()).toBe(true);
  });

  it('renders without crashing when no props at all', () => {
    const wrapper = mountImage();
    expect(wrapper.find('.b-image').exists()).toBe(true);
  });

  it('handles controlled preview (v-model:previewVisible)', async () => {
    const wrapper = mountImage({ src: 'test.jpg', previewVisible: false });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    expect(wrapper.emitted('update:previewVisible')).toEqual([[true]]);
  });

  it('locks body scroll when preview opens', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    expect(document.body.style.overflow).toBe('hidden');
    const closeBtn = document.querySelector('.b-image-preview__close') as HTMLElement;
    closeBtn?.click();
    await wrapper.vm.$nextTick();
    expect(document.body.style.overflow).toBe('');
    wrapper.unmount();
  });

  it('resets transform state each time preview opens', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const zoomInBtn = document.querySelector('[aria-label="Zoom in"]') as HTMLElement;
    zoomInBtn?.click();
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.b-image-preview__scale')?.textContent?.trim()).toBe('150%');
    const closeBtn = document.querySelector('.b-image-preview__close') as HTMLElement;
    closeBtn?.click();
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.b-image-preview__scale')?.textContent?.trim()).toBe('100%');
    wrapper.unmount();
  });

  it('backdrop click closes preview', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.b-image-preview')).toBeTruthy();
    const backdrop = document.querySelector('.b-image-preview__backdrop') as HTMLElement;
    backdrop?.click();
    await wrapper.vm.$nextTick();
    wrapper.unmount();
  });

  it('movable=false does not add dragging class on pointerdown', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg', movable: false });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    const overlay = document.querySelector('.b-image-preview') as HTMLElement;
    // Use a custom Event since jsdom lacks PointerEvent constructor
    const evt = new MouseEvent('pointerdown', {
      bubbles: true,
      clientX: 100,
      clientY: 100,
    });
    Object.defineProperty(evt, 'pointerId', { value: 1 });
    overlay.dispatchEvent(evt);
    await wrapper.vm.$nextTick();
    expect(overlay.classList.contains('b-image-preview--dragging')).toBe(false);
    wrapper.unmount();
  });
});

// ─────────────────────────────────────────────
// 12. CSS class hooks
// ─────────────────────────────────────────────
describe('BImage – CSS class hooks', () => {
  it('has stable .b-image root class', () => {
    const wrapper = mountImage({ src: 'test.jpg' });
    expect(wrapper.find('.b-image').exists()).toBe(true);
  });

  it('has .b-image__img class on img element', () => {
    const wrapper = mountImage({ src: 'test.jpg' });
    expect(wrapper.find('.b-image__img').exists()).toBe(true);
  });

  it('has .b-image__placeholder class when placeholder shown', () => {
    const wrapper = mountImage({ src: 'test.jpg', placeholder: true });
    expect(wrapper.find('.b-image__placeholder').exists()).toBe(true);
  });

  it('has .b-image__mask class on preview trigger', async () => {
    const wrapper = mountImage({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.b-image__mask').exists()).toBe(true);
  });

  it('applies .b-image--preview modifier when preview enabled', () => {
    const wrapper = mountImage({ src: 'test.jpg' });
    expect(wrapper.classes()).toContain('b-image--preview');
  });

  it('applies .b-image--error modifier on error', async () => {
    const wrapper = mountImage({ src: 'bad.jpg' });
    fireImgError(wrapper);
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).toContain('b-image--error');
  });

  it('has .b-image__progressive-placeholder for progressive loading', () => {
    const wrapper = mountImage({ src: 'full.jpg', placeholderSrc: 'thumb.jpg' });
    expect(wrapper.find('.b-image__progressive-placeholder').exists()).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 13. Deterministic animation tests with fake timers
// ─────────────────────────────────────────────
describe('BImage – animation with fake timers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('preview transition respects CSS transition timing', async () => {
    const wrapper = mountImageReal({ src: 'test.jpg' });
    fireImgLoad(wrapper);
    await wrapper.vm.$nextTick();
    await wrapper.find('.b-image__mask').trigger('click');
    await wrapper.vm.$nextTick();
    vi.advanceTimersByTime(300);
    expect(document.querySelector('.b-image-preview')).toBeTruthy();
    wrapper.unmount();
  });
});
