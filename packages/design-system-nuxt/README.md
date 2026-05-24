# @7pmlabs/design-system-nuxt

Nuxt 4 module for [`@7pmlabs/design-system`](https://www.npmjs.com/package/@7pmlabs/design-system). Auto-imports every `B*` component, registers the `useValidationForm` / `useValidationField` composables, and injects the bundled stylesheet.

📖 **Documentation:** https://ngphanducthinh.github.io/7pmlabs-design-system/

## Install

```bash
# bun
bun add @7pmlabs/design-system @7pmlabs/design-system-nuxt

# npm
npm i @7pmlabs/design-system @7pmlabs/design-system-nuxt
```

## Usage

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@7pmlabs/design-system-nuxt'],
});
```

That's it. In any `.vue` file:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { z } from 'zod';

const form = useValidationForm();
const email = ref('');
const { errors } = useValidationField('email', email, z.string().email());
</script>

<template>
  <BButton variant="solid" color="primary">Click me</BButton>
  <BInput v-model="email" />
  <BAlert v-if="errors.length" type="failure" :message="errors[0]" />
</template>
```

No imports needed for `BButton`, `BInput`, `BAlert`, `useValidationForm`, or `useValidationField` — the module registers all of them.

## Options

```ts
export default defineNuxtConfig({
  modules: ['@7pmlabs/design-system-nuxt'],
  designSystem: {
    components: true,    // auto-register components (default: true)
    composables: true,   // auto-register composables (default: true)
    css: true,           // inject the bundled stylesheet (default: true)
    prefix: '',          // prepend to every component name, e.g. 'D' → DBButton
  },
});
```

Disable individual features when you want manual control. For example, set `css: false` if you import a custom build of the stylesheet yourself.

## Development

This module lives in a Bun workspace alongside [`@7pmlabs/design-system`](../..). It depends on the main lib via a local `file:../..` reference for development; the integration test rewrites this to a real version range before publishing.

```bash
# from the repo root
bun install              # install workspace deps
bun run build            # build the main lib so the playground can resolve it

# in this package
cd packages/design-system-nuxt
bun run dev:prepare      # generate module stubs + prepare the playground
bun run dev              # nuxi dev playground → http://localhost:3000
bun run dev:build        # nuxi build playground (production build)
bun run build            # produce dist/module.mjs + types for npm
```

The playground in [`playground/`](./playground/) is a minimal Nuxt 4 app used to verify auto-import, CSS injection, and SSR work end-to-end during development.

## Adding a new component to the auto-import list

Whenever the main lib gains a new public component, add its name to [`src/components.ts`](./src/components.ts) — both top-level components and sub-components (e.g. `BFormItem`, `BModalHeader`) need to be listed individually. Same goes for new composables in `COMPOSABLE_NAMES`. Without that, the symbol will still be importable manually but won't auto-import in Nuxt apps.

## Testing

From the repo root:

```bash
bun run test:int:nuxt
```

This packs both `@7pmlabs/design-system` and `@7pmlabs/design-system-nuxt` into `.tgz` files, scaffolds a fresh Nuxt 4 app in a temp directory, installs both tarballs, and runs `nuxi prepare` → `nuxi typecheck` → `nuxi build`. It's the closest signal we have to "would this work for a real consumer". See [`scripts/test-integration-nuxt.ts`](../../scripts/test-integration-nuxt.ts).

## Publishing

The main lib must be published first. Then, before publishing this package:

1. Replace `"@7pmlabs/design-system": "file:../.."` in [`package.json`](./package.json) with the real version range — e.g. `"^1.0.10"`.
2. Bump this package's `version`.
3. `bun run build` to produce `dist/`.
4. `npm publish --access public` (or `bun publish`).
5. Restore `file:../..` if you intend to keep developing locally.

The integration test demonstrates this rewrite step automatically — see `PREP MODULE` in [`scripts/test-integration-nuxt.ts`](../../scripts/test-integration-nuxt.ts).
