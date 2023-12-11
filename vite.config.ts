import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';
// import dts from 'vite-plugin-dts';

// const resolve = (dir: any) => path.join(__dirname, dir);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // packages: resolve('./src/components'),
    },
  },
  // https://vitejs.dev/guide/build.html#library-mode
  build: {
    // Output compiled files to /dist.
    outDir: './dist',
    lib: {
      // Set the entry point (file that contains our components exported).
      entry: path.resolve(__dirname, 'src/index.ts'),
      fileName: 'design-system',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // Vue is provided by the parent project, don't compile Vue source-code inside our library.
      external: ['vue', 'imask'],
      output: {
        // Provide a global variable for these externalized dependencies in UMD build mode
        globals: {
          vue: 'Vue',
        },
        sourcemap: true,
        format: 'esm',
        preserveModules: true,
      },
    },
  },
});
