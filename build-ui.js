const fs = require('fs');
const path = require('path');

console.log('UIファイルをビルドします...');

// distディレクトリが存在しない場合は作成
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
  console.log('distディレクトリを作成しました');
}

// ui.htmlをdistディレクトリにコピー
fs.copyFileSync(
  path.resolve(__dirname, 'src/ui.html'),
  path.resolve(__dirname, 'dist/ui.html')
);
console.log('src/ui.html → dist/ui.html にコピーしました');

// 完了メッセージ
console.log('UIファイルのビルドが完了しました');
