import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import vueDevTools from 'vite-plugin-vue-devtools';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { name: packageName } = JSON.parse(readFileSync('./package.json', 'utf-8'));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: 'src/assets/icons',
          dest: 'assets',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    __PACKAGE_NAME__: JSON.stringify(packageName),
  },
  build: {
    outDir: './dist',
    sourcemap: true,
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
        preserveModules: true,
      },
    },
  },
});
