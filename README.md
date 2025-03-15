# VariableSetting

VariableSetting は、Figma変数を使用したデザインシステムを数クリックで生成できる Figma プラグインの開発プロジェクトです。shadcn/ui準拠のデザインシステムを構築し、プライマリカラーを選択するだけで、一貫性のあるカラーパレットを素早く構築できることを目指しています。

## 実装済みの機能

1. **階層的変数システム**: 5つのコレクション構造（Primitives, Theme, Responsive, Component, Component-Responsive）
2. **カラーシステム生成**: プライマリカラーからの完全なカラーシステム生成
3. **変数コレクション管理**: 設計仕様に準拠した変数コレクションの構造化と管理
4. **Figma変数生成**: 設計に基づいた変数の自動生成および管理
5. **Light/Darkモード対応**: ライト/ダークモードに対応した変数値設定
6. **レスポンシブ対応**: モバイル/タブレット/デスクトップに対応した変数設定

## 今後実装予定の機能

1. **詳細設定オプション**: 各コレクションの有効/無効切替や詳細カスタマイズ
2. **UIの改善**: より直感的なユーザーインターフェースとアクセシビリティ向上
3. **開発者エクスポート**: Tailwind設定ファイルとCSSカスタムプロパティの出力
4. **変数参照システムの強化**: コレクション間の参照関係の可視化と管理
5. **エラーハンドリングの強化**: 堅牢なエラー処理と明確なユーザーフィードバック

## 技術スタック

1. **TypeScript**: すべてのコアロジックとFigma側コード
2. **HTML/CSS**: UIインターフェース
3. **Figma Plugin API**: Figma変数と連携するためのAPI
4. **ESLint/Prettier**: コード品質管理

## プロジェクト構造

```bash
variable-setting/
├── src/
│   ├── code.ts                   # Figma側のエントリーポイント
│   ├── ui.html                   # プラグインUI
│   ├── services/                 # サービスレイヤー
│   │   ├── MessageHandlerService.ts  # メッセージ処理
│   │   ├── FigmaService.ts       # Figma API操作
│   │   └── designSystem/         # デザインシステム関連
│   │       ├── BaseVariableService.ts      # 基底変数サービス
│   │       ├── PrimitiveVariableService.ts # プリミティブ変数サービス
│   │       ├── ThemeVariableService.ts     # テーマ変数サービス
│   │       ├── ResponsiveVariableService.ts # レスポンシブ変数サービス
│   │       ├── ComponentVariableService.ts  # コンポーネント変数サービス
│   │       └── ComponentResponsiveVariableService.ts # レスポンシブコンポーネント変数サービス
│   ├── types/                    # 型定義
│   │   ├── figma.d.ts            # Figma API型定義
│   │   ├── messageTypes.ts       # メッセージ型定義
│   │   └── variableTypes.ts      # 変数関連型定義
│   └── utils/                    # ユーティリティ
│       ├── colorUtils.ts         # 色操作ユーティリティ
│       └── validationUtils.ts    # 検証ユーティリティ
├── dist/                         # ビルド成果物
├── public/                       # 静的アセット
├── figma-variable-design.md      # 変数設計仕様書
├── DEV_PLAN.md                   # 開発計画書
└── ...
```

## 開発環境のセットアップ

1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/variable-setting.git
cd variable-setting
```

2. 依存関係のインストールと初期セットアップ

```bash
npm install
npm run build
```

3. 開発ビルド（監視モード）

```bash
npm run dev
```

## 開発コマンド

- **開発ビルド（監視モード）**: `npm run dev`
- **本番ビルド**: `npm run build`
- **型チェック**: `npm run typecheck`
- **リント**: `npm run lint`

## Figmaでの開発テスト

1. Figma で、「プラグイン」→「開発」→「開発用プラグインを使用する」を選択
2. 「マニフェストから既存のプラグインを使用」を選択
3. プロジェクトフォルダ内の `manifest.json` ファイルを選択

## 開発ロードマップ

当プロジェクトは以下のフェーズで開発を進めています：

1. **フェーズ1**: コード構造の整理（2025/3/16〜3/30）
   - SOLID原則に基づくリファクタリング
   - ファイル構造の最適化

2. **フェーズ2**: 変数設計の実装（2025/3/31〜4/20）
   - 5つのコレクション構造の実装
   - 変数構造の詳細実装
   - 変数参照システムの構築

3. **フェーズ3**: UIの改善（2025/4/21〜5/4）
   - シンプルながら機能的なUI
   - アクセシビリティとUX向上

4. **フェーズ4**: 品質向上（2025/5/5〜5/18）
   - エラーハンドリングの強化
   - テストと最適化

5. **フェーズ5**: 完成と文書化（2025/5/19〜5/25）
   - 最終調整
   - ドキュメント整備

現在、フェーズ1の実装中で、SOLID原則に基づいたコード構造の改善に注力しています。詳細は `DEV_PLAN.md` を参照してください。

## 貢献ガイドライン

- SOLID原則に従ったコード設計
- 各ファイルは最大200行に収める
- Conventional Commitsに従ったコミットメッセージ
- PRを作成する前にローカルでテストを実行

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

---
最終更新: 2025年3月15日
