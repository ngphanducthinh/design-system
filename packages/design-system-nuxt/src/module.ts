import { addComponent, addImports, defineNuxtModule } from '@nuxt/kit';
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
  },
  setup(options, nuxt) {
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
