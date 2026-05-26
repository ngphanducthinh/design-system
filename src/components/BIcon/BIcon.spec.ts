import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

import BIcon from './BIcon.vue';

// In unit tests the BIcon source carries the inert sentinel literal — the
// `@7pmlabs/design-system/vite` plugin only replaces it during a consumer's
// real vite build. Static-inline behavior is covered by the integration
// tests (test:int / test:int:nuxt). Here we only verify the runtime-fetch
// fallback path: the URL shape that broke previously when the lib resolved
// /node_modules/... in production.
describe('BIcon', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('<svg></svg>'),
    });
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('runtime fetch fallback', () => {
    it('fetches icons from the stable /_design-system/icons URL (regression test)', async () => {
      mount(BIcon, { props: { icon: 'check' } });
      await nextTick();

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith('/_design-system/icons/regular/check.svg');
    });

    it('uses the variant subfolder in the fallback URL', async () => {
      mount(BIcon, { props: { icon: 'check', variant: 'solid' } });
      await nextTick();

      expect(fetchSpy).toHaveBeenCalledWith('/_design-system/icons/solid/check.svg');
    });

    it('uses the brands folder in the fallback URL when brand=true', async () => {
      mount(BIcon, { props: { icon: 'github', brand: true } });
      await nextTick();

      expect(fetchSpy).toHaveBeenCalledWith('/_design-system/icons/brands/github.svg');
    });

    it('does not depend on /node_modules/ in the URL (the original bug)', async () => {
      mount(BIcon, { props: { icon: 'check' } });
      await nextTick();

      const calledUrl = fetchSpy.mock.calls[0]?.[0] as string;
      expect(calledUrl).not.toContain('/node_modules/');
    });
  });
});
