import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import path from 'path';
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
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        logger: {
          // silence warnings to speed up the build
          warn: () => {},
        },
      },
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
      formats: ['es'],
    },
    rollupOptions: {
      // Vue is provided by the parent project, don't compile Vue source-code inside our library.
      external: ['vue'],
      output: {
        // https://rollupjs.org/configuration-options/#output-format
        sourcemap: true,
        preserveModules: true,
      },
    },
  },
});
