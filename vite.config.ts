import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: './dist',
    // https://vite.dev/guide/build#library-mode
    lib: {
      name: 'DesignSystem',
      fileName: 'design-system',
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rolldownOptions: {
      // Vue is provided by the parent project, don't compile Vue source-code inside our library.
      external: ['vue'],
      output: {
        sourcemap: true,
        preserveModules: true,
      },
    },
  },
});
