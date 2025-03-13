const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('VariableSetting プラグインのビルドを開始します...');

try {
  // TypeScriptのコンパイル
  console.log('TypeScriptのコンパイル中...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });

  // Viteビルド実行
  console.log('Viteでビルド中...');
  execSync('npx vite build', { stdio: 'inherit' });

  // UIファイルのコピー
  console.log('UIファイルをコピー中...');
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }
  fs.copyFileSync(
    path.resolve(__dirname, 'src/ui.html'),
    path.resolve(__dirname, 'dist/ui.html')
  );

  console.log('ビルドが正常に完了しました！');
} catch (error) {
  console.error('ビルド中にエラーが発生しました:', error);
  process.exit(1);
}
