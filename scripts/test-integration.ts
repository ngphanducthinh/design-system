#!/usr/bin/env bun

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { $ } from 'bun';

process.env.CI = 'true';

const PROJECT_ROOT = resolve(import.meta.dir, '..');
const APP_NAME = 'test-vue-app';

function log(step: string, msg: string): void {
  console.log(`\x1b[36m[${step}]\x1b[0m ${msg}`);
}

async function main(): Promise<void> {
  const tempDir = join(PROJECT_ROOT, '.integration-test');
  let tgzPath: string | undefined;
  let passed = false;

  try {
    // Step 1: Build the library
    log('BUILD', 'Building the library...');
    await $`bun run build:lib`.cwd(PROJECT_ROOT).quiet();
    log('BUILD', 'Done ✓');

    // Step 2: Pack into .tgz
    log('PACK', 'Creating tarball...');
    await $`bun pm pack`.cwd(PROJECT_ROOT).quiet();
    const tgzFiles = new Bun.Glob('*.tgz');
    let tgzFilename: string | undefined;
    for await (const file of tgzFiles.scan(PROJECT_ROOT)) {
      tgzFilename = file;
      break;
    }
    if (!tgzFilename) throw new Error('No .tgz file found after packing');
    tgzPath = resolve(PROJECT_ROOT, tgzFilename);
    log('PACK', `Created ${tgzFilename} ✓`);

    // Step 3: Create temp directory
    log('SETUP', `Creating temp directory: ${tempDir}`);
    mkdirSync(tempDir, { recursive: true });

    // Step 4: Scaffold a new Vue app with TypeScript
    log('SCAFFOLD', 'Creating Vue app with TypeScript...');
    await $`bunx --bun create-vue@latest ${APP_NAME} --ts`.cwd(tempDir).quiet();
    const appDir = join(tempDir, APP_NAME);
    if (!existsSync(appDir)) {
      throw new Error(`Scaffolded app not found at ${appDir}`);
    }
    log('SCAFFOLD', 'Done ✓');

    // Step 5: Add design system dependency
    log('CONFIG', 'Adding @7pmlabs/design-system to dependencies...');
    const pkgPath = join(appDir, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    pkg.dependencies = pkg.dependencies || {};
    pkg.dependencies['@7pmlabs/design-system'] = `file:${tgzPath}`;
    pkg.dependencies['vue-router'] = '^4.6.0';
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    log('CONFIG', 'Done ✓');

    // Step 6: Install dependencies
    log('INSTALL', 'Installing dependencies...');
    await $`bun install`.cwd(appDir).quiet();
    log('INSTALL', 'Done ✓');

    // Step 7: Modify app to use the library
    log('MODIFY', 'Adding design system imports to app...');

    // 7a: Prepend CSS import to main.ts
    const mainTsPath = join(appDir, 'src', 'main.ts');
    const mainTs = readFileSync(mainTsPath, 'utf-8');
    writeFileSync(mainTsPath, `import '@7pmlabs/design-system/style.css';\n${mainTs}`);

    // 7b: Replace App.vue with a component that uses BButton
    const appVuePath = join(appDir, 'src', 'App.vue');
    writeFileSync(
      appVuePath,
      `<script setup lang="ts">
import { BButton } from '@7pmlabs/design-system';
</script>

<template>
  <div id="app">
    <h1>Integration Test</h1>
    <BButton>Click me</BButton>
  </div>
</template>
`,
    );
    log('MODIFY', 'Done ✓');

    // Step 8a: Type-check
    log('TYPECHECK', 'Running vue-tsc --noEmit...');
    await $`bunx vue-tsc --noEmit -p tsconfig.app.json`.cwd(appDir);
    log('TYPECHECK', 'Passed ✓');

    // Step 8b: Production build
    log('VITE BUILD', 'Running vite build...');
    await $`bun run build`.cwd(appDir).quiet();
    log('VITE BUILD', 'Passed ✓');

    // Step 9: Success
    passed = true;
    console.log('\n' + '='.repeat(50));
    console.log('  INTEGRATION TEST: \x1b[32mPASSED\x1b[0m');
    console.log('='.repeat(50) + '\n');
  } catch (error) {
    console.error('\n' + '='.repeat(50));
    console.error('  INTEGRATION TEST: \x1b[31mFAILED\x1b[0m');
    console.error('='.repeat(50));
    if (error instanceof Error) {
      console.error('\nError:', error.message);
      if (error.stack) console.error(error.stack);
    } else {
      console.error('\nError:', error);
    }
  } finally {
    // Step 10: Cleanup
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
      log('CLEANUP', 'Removed temp directory');
    }
    if (tgzPath && existsSync(tgzPath)) {
      rmSync(tgzPath, { force: true });
      log('CLEANUP', 'Removed tarball');
    }
  }

  process.exit(passed ? 0 : 1);
}

main();
