import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';

// UI用のビルド設定
export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    target: 'es2020',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    outDir: 'dist',
    rollupOptions: {
      input: 'src/ui.html',
      output: {
        entryFileNames: 'ui.js',
      },
    },
    emptyOutDir: false, // 既にコードがビルドされている可能性があるので空にしない
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
