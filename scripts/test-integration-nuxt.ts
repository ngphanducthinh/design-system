#!/usr/bin/env bun

/**
 * Integration test for the Nuxt module.
 *
 * 1. Build & pack `@7pmlabs/design-system` (the main lib).
 * 2. Temporarily rewrite the module's `file:../..` dep to `*` so the packed
 *    tarball is consumable from outside the workspace, then build & pack
 *    `@7pmlabs/design-system-nuxt`.
 * 3. Scaffold a minimal Nuxt 4 app in a temp dir and install both tarballs.
 * 4. Wire the module into `nuxt.config.ts`, render auto-imported components
 *    in `app.vue`.
 * 5. Run `nuxi prepare`, `nuxi typecheck`, `nuxi build` - any failure fails
 *    the test.
 * 6. Clean up the temp dir, both tarballs, and restore the module's
 *    `package.json`.
 */

import { $ } from 'bun';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

process.env.CI = 'true';

const PROJECT_ROOT = resolve(import.meta.dir, '..');
const MODULE_ROOT = resolve(PROJECT_ROOT, 'packages/design-system-nuxt');
const APP_NAME = 'test-nuxt-app';

function log(step: string, msg: string): void {
  console.log(`\x1b[36m[${step}]\x1b[0m ${msg}`);
}

async function findFirst(pattern: string, cwd: string): Promise<string | undefined> {
  for await (const file of new Bun.Glob(pattern).scan(cwd)) {
    return file;
  }
  return undefined;
}

async function main(): Promise<void> {
  const tempDir = join(PROJECT_ROOT, '.integration-test-nuxt');
  const modulePkgPath = join(MODULE_ROOT, 'package.json');
  let modulePkgBackup: string | undefined;
  let libTgzPath: string | undefined;
  let moduleTgzPath: string | undefined;
  let passed = false;

  try {
    // 1. Build the main lib
    log('BUILD LIB', 'Building @7pmlabs/design-system...');
    await $`bun run build:lib`.cwd(PROJECT_ROOT).quiet();
    log('BUILD LIB', 'Done ✓');

    // 2. Pack the main lib
    log('PACK LIB', 'Creating @7pmlabs/design-system tarball...');
    await $`bun pm pack --ignore-scripts`.cwd(PROJECT_ROOT).quiet();
    const libFilename = await findFirst('7pmlabs-design-system-*.tgz', PROJECT_ROOT);
    if (!libFilename) throw new Error('No design-system tarball produced');
    libTgzPath = resolve(PROJECT_ROOT, libFilename);
    log('PACK LIB', `Created ${libFilename} ✓`);

    // 3. Rewrite module's `file:../..` dep so the packed tarball is portable
    log('PREP MODULE', 'Rewriting design-system dep to "*" for portable packaging...');
    modulePkgBackup = readFileSync(modulePkgPath, 'utf-8');
    const modulePkg = JSON.parse(modulePkgBackup);
    if (modulePkg.dependencies?.['@7pmlabs/design-system']) {
      modulePkg.dependencies['@7pmlabs/design-system'] = '*';
    }
    writeFileSync(modulePkgPath, JSON.stringify(modulePkg, null, 2));

    // 4. Build & pack the module
    log('PREP MODULE TYPES', 'Generating .nuxt types for module...');
    await $`bun run dev:prepare`.cwd(MODULE_ROOT).quiet();
    log('PREP MODULE TYPES', 'Done ✓');

    log('BUILD MODULE', 'Building @7pmlabs/design-system-nuxt...');
    await $`bun run build`.cwd(MODULE_ROOT);
    log('BUILD MODULE', 'Done ✓');

    log('PACK MODULE', 'Creating @7pmlabs/design-system-nuxt tarball...');
    await $`bun pm pack --ignore-scripts`.cwd(MODULE_ROOT).quiet();
    const moduleFilename = await findFirst('7pmlabs-design-system-nuxt-*.tgz', MODULE_ROOT);
    if (!moduleFilename) throw new Error('No design-system-nuxt tarball produced');
    moduleTgzPath = resolve(MODULE_ROOT, moduleFilename);
    log('PACK MODULE', `Created ${moduleFilename} ✓`);

    // Restore module package.json now - packing is done
    writeFileSync(modulePkgPath, modulePkgBackup);
    modulePkgBackup = undefined;

    // 5. Scaffold a minimal Nuxt app (avoid `nuxi init` to keep this hermetic)
    log('SETUP', `Creating temp directory: ${tempDir}`);
    mkdirSync(tempDir, { recursive: true });
    const appDir = join(tempDir, APP_NAME);
    mkdirSync(appDir, { recursive: true });

    log('SCAFFOLD', 'Writing minimal Nuxt 4 app...');
    writeFileSync(
      join(appDir, 'package.json'),
      JSON.stringify(
        {
          name: APP_NAME,
          private: true,
          type: 'module',
          scripts: {
            prepare: 'nuxi prepare',
            typecheck: 'nuxi typecheck',
            build: 'nuxi build',
          },
          dependencies: {
            '@7pmlabs/design-system': `file:${libTgzPath}`,
            '@7pmlabs/design-system-nuxt': `file:${moduleTgzPath}`,
            nuxt: '^4.0.0',
            vue: '^3.5.0',
          },
          devDependencies: {
            typescript: '^5.9.0',
            'vue-tsc': '^3.0.0',
          },
        },
        null,
        2,
      ),
    );

    writeFileSync(
      join(appDir, 'nuxt.config.ts'),
      `export default defineNuxtConfig({
  modules: ['@7pmlabs/design-system-nuxt'],
  compatibilityDate: '2025-01-01',
});
`,
    );

    writeFileSync(
      join(appDir, 'app.vue'),
      `<script setup lang="ts">
import { ref } from 'vue';
import { z } from 'zod';

// Composables come from the module's auto-imports - no explicit import.
const form = useValidationForm();
const email = ref('');
const { errors, markTouched } = useValidationField(
  'email',
  email,
  z.string().email('Invalid email'),
);

const submit = () => {
  form.validateAll();
};
</script>

<template>
  <div>
    <h1>Integration Test</h1>
    <BAlert type="success" message="The module loads" show-icon />
    <BButton variant="solid" color="primary" @click="submit">Submit</BButton>
    <BInput v-model="email" placeholder="email" @blur="markTouched()" />
    <p v-if="errors.length">{{ errors[0] }}</p>
    <BTag color="success">tag</BTag>
  </div>
</template>
`,
    );

    writeFileSync(
      join(appDir, 'tsconfig.json'),
      JSON.stringify({ extends: './.nuxt/tsconfig.json' }, null, 2),
    );
    log('SCAFFOLD', 'Done ✓');

    // 6. Install dependencies
    log('INSTALL', 'Installing dependencies (this can take a minute)...');
    await $`bun install`.cwd(appDir).quiet();
    log('INSTALL', 'Done ✓');

    // 7. Prepare - generates `.nuxt/tsconfig.json` and types
    log('PREPARE', 'Running nuxi prepare...');
    await $`bun run prepare`.cwd(appDir).quiet();
    log('PREPARE', 'Done ✓');

    // 8. Type-check via vue-tsc (Nuxt's typecheck command)
    log('TYPECHECK', 'Running nuxi typecheck...');
    await $`bun run typecheck`.cwd(appDir);
    log('TYPECHECK', 'Passed ✓');

    // 9. Production build
    log('NUXT BUILD', 'Running nuxi build...');
    await $`bun run build`.cwd(appDir).quiet();
    log('NUXT BUILD', 'Passed ✓');

    passed = true;
    console.log('\n' + '='.repeat(50));
    console.log('  NUXT INTEGRATION TEST: \x1b[32mPASSED\x1b[0m');
    console.log('='.repeat(50) + '\n');
  } catch (error) {
    console.error('\n' + '='.repeat(50));
    console.error('  NUXT INTEGRATION TEST: \x1b[31mFAILED\x1b[0m');
    console.error('='.repeat(50));
    if (error instanceof Error) {
      console.error('\nError:', error.message);
      if (error.stack) console.error(error.stack);
    } else {
      console.error('\nError:', error);
    }
  } finally {
    if (modulePkgBackup) {
      writeFileSync(modulePkgPath, modulePkgBackup);
      log('CLEANUP', 'Restored module package.json');
    }
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
      log('CLEANUP', 'Removed temp directory');
    }
    if (libTgzPath && existsSync(libTgzPath)) {
      rmSync(libTgzPath, { force: true });
      log('CLEANUP', 'Removed design-system tarball');
    }
    if (moduleTgzPath && existsSync(moduleTgzPath)) {
      rmSync(moduleTgzPath, { force: true });
      log('CLEANUP', 'Removed design-system-nuxt tarball');
    }
  }

  process.exit(passed ? 0 : 1);
}

main();
