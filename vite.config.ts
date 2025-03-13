import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    // コード.tsファイルのビルド設定
    target: 'es2015',
    outDir: 'dist',
    emptyOutDir: false, // UIファイルを保持
    minify: false,
    lib: {
      entry: path.resolve(__dirname, 'src/code.ts'),
      formats: ['iife'], // CJSからIIFEに変更
      fileName: () => 'code.js',
      name: 'VariableSetting' // IIFEの場合、グローバル変数名が必要
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        // exportsをグローバルではなくIIFE内に閉じ込める
        inlineDynamicImports: true,
        // Figmaプラグインの環境に合わせる
        extend: true
      },
    }
  }
});
