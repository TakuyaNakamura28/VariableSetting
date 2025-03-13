# VariableSetting

VariableSetting は、Tailwind CSS と Shadcn UI に基づくデザインシステムを数クリックで生成できる Figma プラグインの開発プロジェクトです。プライマリカラーを選択するだけで、一貫性のあるカラーパレットを素早く構築できることを目指しています。

## 実装予定の機能

- **シンプルなカラー選択**: プライマリカラーからの完全なカラーシステム生成
- **カラースウォッチ生成**: 選択したプライマリカラーから自動的にTailwind CSSスタイルのカラーパレットを生成
- **Figma 変数**: デザインシステム変数を自動的に構築
- **コンポーネント**: Tailwind/Shadcn UI に準拠したコンポーネント
- **開発者エクスポート**: Tailwind 設定ファイルとして出力

## 技術スタック

- **TypeScript**: バックエンド（Figma側）コード
- **バニラHTML/CSS/JS**: シンプルなUIインターフェース
- **Vite**: ビルドツール
- **pnpm**: パッケージマネージャー

## 開発のセットアップ

### プロジェクト開始方法

1. このリポジトリをクローンします
   ```
   git clone https://github.com/yourusername/variable-setting.git
   cd variable-setting
   ```

2. 依存関係をインストールします
   ```
   pnpm install
   ```

3. 開発環境を設定します
   ```
   pnpm init:dev
   ```

4. プラグインを最初にビルドします
   ```
   pnpm build
   ```

### Figmaでの開発テスト

1. Figma で、「プラグイン」→「開発」→「新しい開発プラグインを作成する」を選択
2. 「マニフェストから既存のプラグインを使用」を選択
3. プロジェクトフォルダ内の `manifest.json` ファイルを選択

## プロジェクト構造

```
variable-setting/
├── src/
│   ├── code.ts        # Figma側のメインコード
│   ├── ui.html        # プラグインUI
│   ├── utils/         # ユーティリティ関数（カラー生成など）
│   ├── services/      # Figmaサービスクラス
│   └── types/         # TypeScript型定義
├── public/            # 静的アセット
├── tests/             # テストファイル
├── manifest.json      # Figmaプラグイン設定
└── ...
```

### 開発コマンド

- 初期セットアップ: `pnpm init:dev`
- ビルド: `pnpm build`
- 型チェック: `pnpm typecheck`
- テスト実行: `pnpm test`
- リント実行: `pnpm lint`
- フォーマット: `pnpm format`
- 継続的ビルド: `pnpm figma:watch`

## 開発ロードマップ

1. **フェーズ1**: 開発環境のセットアップと基盤構築
   - プロジェクト構造の確立
   - 開発環境の整備
   - 基本的なCI/CD設定

2. **フェーズ2**: 基本的なカラーパレット生成機能
   - プライマリカラーからのパレット生成
   - 視覚的なカラースウォッチ
   - カラー選択UI

3. **フェーズ3**: Figma変数とモード対応
   - 変数コレクションの自動生成
   - Light/Darkモード対応
   - 変数プレビュー

4. **フェーズ4**: コンポーネント生成
   - 基本コンポーネント（ボタン、カードなど）
   - コンポーネントプレビュー
   - アクセシビリティチェック

5. **フェーズ5以降**: 拡張機能と洗練
   - 追加コンポーネント
   - Tailwind設定ファイルのエクスポート
   - ユーザー設定の保存と拡張オプション

## 貢献方法

プロジェクトへの貢献を歓迎します。以下のガイドラインを参照してください：

1. このリポジトリをフォークします
2. 機能ブランチを作成します (`git checkout -b feature/amazing-feature`)
3. 変更をコミットします (`git commit -m 'feat: add some amazing feature'`)
4. ブランチにプッシュします (`git push origin feature/amazing-feature`)
5. Pull Requestを作成します

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細については [LICENSE](LICENSE) ファイルをご覧ください。

## クレジット

- このプラグインは [Tailwind CSS](https://tailwindcss.com/) と [Shadcn UI](https://ui.shadcn.com/) のデザインシステムに基づいて作成されています。
- Figma Plugin API を使用して開発されています。

---

プロジェクト開始日: 2025年3月12日