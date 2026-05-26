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

    // 7b: Replace App.vue with a component that uses BButton AND BIcon (so we
    // exercise the icon-fetch path, which is the regression we're guarding).
    const appVuePath = join(appDir, 'src', 'App.vue');
    writeFileSync(
      appVuePath,
      `<script setup lang="ts">
import { BButton, BIcon } from '@7pmlabs/design-system';
</script>

<template>
  <div id="app">
    <h1>Integration Test</h1>
    <BButton>Click me</BButton>
    <BIcon icon="check" />
  </div>
</template>
`,
    );

    // 7c: Wire the design-system Vite plugin into the consumer's vite.config.ts
    // so icons are served in dev and copied into dist/ at build time.
    const viteConfigPath = join(appDir, 'vite.config.ts');
    const viteConfig = readFileSync(viteConfigPath, 'utf-8');
    const patchedViteConfig = viteConfig
      .replace(
        /import vue from '@vitejs\/plugin-vue';?/,
        `import vue from '@vitejs/plugin-vue';\nimport { designSystem } from '@7pmlabs/design-system/vite';`,
      )
      .replace(/plugins:\s*\[\s*vue\(\),?/, 'plugins: [\n    vue(),\n    designSystem(),');
    if (patchedViteConfig === viteConfig) {
      throw new Error(
        'Failed to patch vite.config.ts — the regex did not match. ' +
          'create-vue may have changed its scaffold output.',
      );
    }
    writeFileSync(viteConfigPath, patchedViteConfig);
    log('MODIFY', 'Done ✓');

    // Step 8a: Type-check
    log('TYPECHECK', 'Running vue-tsc --noEmit...');
    await $`bunx vue-tsc --noEmit -p tsconfig.app.json`.cwd(appDir);
    log('TYPECHECK', 'Passed ✓');

    // Step 8b: Production build
    log('VITE BUILD', 'Running vite build...');
    await $`bun run build`.cwd(appDir).quiet();
    log('VITE BUILD', 'Passed ✓');

    // Step 8c: Assert the static-inline path actually works.
    // The plugin's AST scan sees `<BIcon icon="check" />` in App.vue, looks
    // up regular/check.svg in node_modules, and inlines its content into
    // the virtual module that BIcon imports. So a unique fragment of the
    // SVG path data must appear somewhere in the built JS bundle.
    log('STATIC INLINE', 'Asserting check.svg path data is inlined into dist/...');
    const inlineProbe = await $`grep -r --include='*.js' -l 'M441 103c9.4 9.4 9.4 24.6 0 33.9' ${join(appDir, 'dist')}`
      .quiet()
      .nothrow();
    if (inlineProbe.exitCode !== 0) {
      throw new Error(
        'Static inlining failed: check.svg path data not found in any built JS chunk. ' +
          'The Vite plugin should have AST-scanned App.vue and inlined the SVG.',
      );
    }
    log('STATIC INLINE', 'SVG inlined into bundle ✓');

    // Step 8c: Serve the built output and verify the icon URL actually
    // resolves. This is the gate for the original bug: previously
    // /node_modules/... was fetched at runtime and 404'd in any production
    // build. The plugin now copies icons into dist/_design-system/icons/.
    log('PREVIEW', 'Starting vite preview...');
    const previewProc = Bun.spawn(
      ['bunx', 'vite', 'preview', '--port', '4173', '--strictPort'],
      { cwd: appDir, stdout: 'ignore', stderr: 'ignore' },
    );

    try {
      // Wait for the preview server to be ready (poll up to 15s).
      const iconUrl = 'http://localhost:4173/_design-system/icons/regular/check.svg';
      let ready = false;
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 500));
        try {
          const probe = await fetch('http://localhost:4173/');
          if (probe.ok) {
            ready = true;
            break;
          }
        } catch {
          /* not yet */
        }
      }
      if (!ready) throw new Error('vite preview did not become ready within 15s');

      log('PREVIEW', `Fetching ${iconUrl}...`);
      const res = await fetch(iconUrl);
      if (!res.ok) {
        throw new Error(`Icon URL returned HTTP ${res.status}; expected 200`);
      }
      const body = await res.text();
      if (!body.trimStart().startsWith('<svg')) {
        throw new Error(`Icon URL did not return SVG markup; got: ${body.slice(0, 80)}...`);
      }
      log('PREVIEW', 'Icon URL serves valid SVG ✓');
    } finally {
      previewProc.kill();
      await previewProc.exited;
    }

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
