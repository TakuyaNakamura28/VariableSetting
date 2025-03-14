# VariableSetting

VariableSetting は、Tailwind CSS と Shadcn UI に基づくデザインシステムを数クリックで生成できる Figma プラグインの開発プロジェクトです。プライマリカラーを選択するだけで、一貫性のあるカラーパレットを素早く構築できることを目指しています。

## 実装済みの機能

1. **階層的変数システム**: プリミティブ変数→セマンティック変数→コンポーネント変数の3階層構造
2. **カラーシステム生成**: プライマリカラーからの完全なカラーシステム生成
3. **変数コレクション管理**: CollectionManagerによる変数コレクションの適切な管理
4. **Figma変数生成**: 設計に基づいた変数の自動生成および管理
5. **Light/Darkモード対応**: モード切替に対応した変数値設定
6. **デザインシステムサービス**: デザインシステム変数の統合的管理

## 今後実装予定の機能

1. **コンポーネント生成**: Tailwind/Shadcn UIに準拠したコンポーネント自動生成
2. **開発者エクスポート**: Tailwind設定ファイルとCSSカスタムプロパティ出力の強化
3. **UIの改善**: より直感的なユーザーインターフェース
4. **プリセット機能**: ユーザー設定の保存と再利用
5. **詳細カスタマイズ**: 高度なパレット調整オプション

## 技術スタック

1. **TypeScript**: すべてのコアロジックとFigma側コード
2. **HTML/CSS/JavaScript**: UIインターフェース
3. **Vite**: モジュールバンドラーとビルドツール
4. **pnpm**: パッケージマネージャー
5. **ESLint/Prettier**: コード品質管理

## プロジェクト構造

```bash
variable-setting/
├── src/
│   ├── code.ts                     # Figma側のエントリーポイント
│   ├── ui.html/ui.js               # プラグインUI
│   ├── services/                   # サービスクラス
│   │   ├── CollectionManager.ts    # 変数コレクション管理
│   │   ├── DesignSystemService.ts  # デザインシステム変数生成
│   │   ├── MessageHandlerService.ts# メッセージング処理
│   │   ├── variables/              # 変数生成クラス群
│   │   │   ├── BaseVariableCreator.ts
│   │   │   ├── ColorVariableCreator.ts
│   │   │   ├── NumberVariableCreator.ts
│   │   │   ├── ShadowVariableCreator.ts
│   │   │   └── VariableCreatorFacade.ts
│   │   └── ...
│   ├── types/                      # 型定義
│   └── utils/                      # ユーティリティ
│       ├── colorUtils.ts           # カラー処理
│       ├── semanticUtils.ts        # セマンティック変数
│       └── tokensUtils.ts          # トークン生成
├── public/                         # 静的アセット
├── tests/                          # テストファイル
├── dist/                           # ビルド成果物
└── ...
```

## 開発環境のセットアップ

1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/variable-setting.git
cd variable-setting
```

1. 依存関係のインストールと初期セットアップ

```bash
pnpm install
pnpm init:dev
```

1. 開発ビルド

```bash
pnpm dev
```

1. 本番ビルド

```bash
pnpm build
```

## 開発コマンド

- **開発ビルド（監視モード）**: `pnpm dev`
- **型チェック**: `pnpm typecheck`
- **リント**: `pnpm lint`
- **フォーマット**: `pnpm format`
- **テスト**: `pnpm test`

## Figmaでの開発テスト

1. Figma で、「プラグイン」→「開発」→「新しい開発プラグインを作成する」を選択
2. 「マニフェストから既存のプラグインを使用」を選択
3. プロジェクトフォルダ内の `manifest.json` ファイルを選択

## 開発ロードマップ

当プロジェクトは現在フェーズ3の実装中で、変数システムの構築に注力しています。次のステップはコンポーネント生成機能の実装です。詳細は `DEV_PLAN.md` を参照してください。

## 貢献ガイドライン

- SOLID原則に従ったコード設計
- 各ファイルは最大200行に収める
- Conventional Commitsに従ったコミットメッセージ
- PRを作成する前にローカルでテストを実行

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

---
最終更新: 2025年3月15日
