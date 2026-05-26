import { addComponent, addImports, addVitePlugin, defineNuxtModule } from '@nuxt/kit';
import tailwindcss from '@tailwindcss/vite';
import { designSystem } from '@7pmlabs/design-system/vite';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { COMPONENT_NAMES, COMPOSABLE_NAMES } from './components';

export interface ModuleOptions {
  /** Auto-register all B* components for use without `import` statements. */
  components?: boolean;
  /** Inject the bundled `@7pmlabs/design-system/style.css` stylesheet. */
  css?: boolean;
  /** Auto-import composables (useValidationForm, useValidationField). */
  composables?: boolean;
  /** Optional prefix prepended to every component name (e.g. 'X' → 'XBButton'). */
  prefix?: string;
  /**
   * Register the `@tailwindcss/vite` plugin so consumers can author Tailwind
   * (incl. the design system's `b:` prefixed classes) without configuring it
   * themselves. Disable if your app already wires Tailwind up another way.
   */
  tailwind?: boolean;
  /**
   * Wire up the `designSystem()` Vite plugin so `BIcon` SVGs are served in
   * dev and copied into the build output. Without this, icons render as
   * empty spans after `nuxi build`. Disable only if you're configuring the
   * plugin manually.
   */
  icons?: boolean;
}

const PKG = '@7pmlabs/design-system';

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@7pmlabs/design-system-nuxt',
    configKey: 'designSystem',
    compatibility: { nuxt: '>=3.0.0' },
  },
  defaults: {
    components: true,
    css: true,
    composables: true,
    prefix: '',
    tailwind: true,
    icons: true,
  },
  setup(options, nuxt) {
    if (options.tailwind) {
      addVitePlugin(() => tailwindcss());
    }

    if (options.icons) {
      addVitePlugin(() => designSystem());

      // For production builds, Nuxt assembles `.output/public/` via Nitro,
      // not Vite's `outDir`. The Vite plugin's `closeBundle` writes to
      // Nuxt's intermediate build dir and never reaches `.output/`. We
      // register the icons directory as a Nitro public asset so Nitro
      // copies it into `.output/public/_design-system/icons/` and serves
      // it from the same URL the Vite middleware uses in dev.
      const require = createRequire(import.meta.url);
      const pkgPath = require.resolve('@7pmlabs/design-system/package.json');
      const iconsDir = join(dirname(pkgPath), 'dist/assets/icons');

      nuxt.hook('nitro:config', (nitroConfig) => {
        nitroConfig.publicAssets ||= [];
        nitroConfig.publicAssets.push({
          dir: iconsDir,
          baseURL: '/_design-system/icons',
          maxAge: 60 * 60 * 24 * 365,
        });
      });
    }

    if (options.css) {
      nuxt.options.css ||= [];
      const cssEntry = `${PKG}/style.css`;
      if (!nuxt.options.css.includes(cssEntry)) {
        nuxt.options.css.push(cssEntry);
      }
    }

    nuxt.options.build.transpile ||= [];
    if (!nuxt.options.build.transpile.includes(PKG)) {
      nuxt.options.build.transpile.push(PKG);
    }

    if (options.components) {
      for (const name of COMPONENT_NAMES) {
        addComponent({
          name: `${options.prefix ?? ''}${name}`,
          export: name,
          filePath: PKG,
        });
      }
    }

    if (options.composables) {
      for (const name of COMPOSABLE_NAMES) {
        addImports({ name, from: PKG });
      }
    }
  },
});
