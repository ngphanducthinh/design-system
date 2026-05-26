import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import vueDevTools from 'vite-plugin-vue-devtools';
import { defineConfig } from 'vite';
import { designSystem } from './src/vite/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    designSystem({
      iconsDir: resolve(__dirname, 'src/assets/icons'),
      emit: false,
    }),
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
      external: ['vue'],
      output: {
        preserveModules: true,
      },
    },
  },
});
