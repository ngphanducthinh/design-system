import { addComponent, addImports, addVitePlugin, defineNuxtModule } from '@nuxt/kit';
import tailwindcss from '@tailwindcss/vite';
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
  },
  setup(options, nuxt) {
    if (options.tailwind) {
      addVitePlugin(() => tailwindcss());
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
