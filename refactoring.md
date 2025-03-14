# VariableSettingプロジェクトの詳細コード分析

## 1. アーキテクチャと依存関係の詳細分析

### 1.1 現在のコード依存関係図

```
code.ts
  ├── utils/colorUtils.ts
  ├── utils/semanticUtils.ts
  ├── utils/tokensUtils.ts
  └── services/figmaService.ts
       └── types/index.ts (型定義のみ)
```

主要な依存関係の流れ：
- `code.ts`がエントリーポイントとなり、すべてのモジュールを利用
- `figmaService.ts`は内部で色変換などの処理に独自ロジックを持つ（ユーティリティへの依存なし）
- 各ユーティリティは他のファイルへの依存がほとんどなく独立している

### 1.2 呼び出しフローの詳細分析

プラグイン実行時の呼び出しフロー:

```
1. プラグイン初期化 (code.ts)
2. UIとのメッセージやり取り (code.ts:figma.ui.onmessage)
   └── 'generate-palette': カラーパレットのみ生成して返す
   └── 'create-variables': すべての変数を生成する処理を開始
       ├── createDesignSystemVariables()
       │   ├── FigmaVariableService.initializeCollections()
       │   ├── generateColorPalette() // プライマリカラーからのパレット生成
       │   ├── FigmaVariableService.createPrimitiveColorPalette() // プリミティブ変数
       │   ├── FigmaVariableService.createSemanticColors() // セマンティック変数
       │   └── FigmaVariableService.createComponentColors() // コンポーネント変数
       └── figma.ui.postMessage() // 結果をUIに返す
   └── 'export-css': CSS変数としてエクスポート
   └── 'export-tailwind': Tailwind設定としてエクスポート
   └── 'clear-variables': すべての変数を削除
```

## 2. 各ファイルの詳細分析

### 2.1 `figmaService.ts` - 設計上の深刻な問題

このファイルが全体の**1000行以上**を占め、最大の問題点です。詳細な問題を特定します：

#### クラス設計の問題：
```typescript
export class FigmaVariableService {
  // 静的プロパティによる状態管理 - インスタンス化や継承が不可能
  private static readonly COLLECTION_NAMES = {...};
  private static lightModeIds: Record<string, string | null> = {};
  private static darkModeIds: Record<string, string | null> = {};
  private static collections: Record<string, VariableCollection | null> = {};
  private static existingVariables: Map<string, Variable> = new Map();
  
  // メソッドがすべて静的 - OOPの恩恵を得られない
  static async initializeCollections(): Promise<boolean> {...}
  static createColorVariable(...): Variable | null {...}
  // 以下300行以上のメソッド群
}
```

#### メソッドの複雑さ:
特に深刻なのは`setSemanticVariableValue`と`setComponentVariableValue`で、両方とも300行を超える複雑なロジックを持ち、多くの条件分岐と特殊ケース処理を含みます：

```typescript
private static setSemanticVariableValue(variable: Variable, valueOrRef: string, modeId: string): void {
  // 静的なプリミティブ変数のキャッシュ
  const primitiveVarCache: Map<string, Variable> = new Map();
  const semanticVarCache: Map<string, Variable> = new Map();
  
  try {
    // 特殊ケース1: ボタンタイプの処理
    // ...
    
    // 特殊ケース2: FFFFFF参照作成
    // ...
    
    // 循環参照の防止
    if (valueOrRef === variable.name || this.isCircularReference(variable.name, valueOrRef, CollectionType.Semantic)) {
      // 特殊ケース処理...
    }
    
    // セマンティック変数への参照を試みる
    // ...
    
    // valueOrRefがプリミティブ変数名を参照しているか確認
    // ...
    
    // 特殊値の処理
    // ...
    
    // HEX値または色名の場合
    // ...
    
    // 色相違いのコンポーネント変数の参照を試みる
    // ... 

    // 単一の色名からプリミティブを推測
    // ...
    
    // フォールバック
    // ...
  } catch (error) {
    // エラー処理...
  }
}
```

このようなメソッドは理解、保守、テストが非常に困難です。

#### エラー処理の問題：
```typescript
try {
  // 複雑な処理
} catch (error) {
  console.error(`Error in createColorVariable for ${name}: ${error}`);
  return null; // エラー情報の詳細な伝達がない
}
```

### 2.2 `code.ts` - ビジネスロジックとUI処理の混在

```typescript
// プラグイン初期化
console.log("プラグイン初期化");
figma.showUI(__html__, { width: 500, height: 650 });

// メッセージ処理（UI連携）とビジネスロジック（変数生成）が混在
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-variables') {
    // UIに処理開始を通知
    figma.ui.postMessage({ type: 'variables-creating' });
    
    // ビジネスロジック実行
    const result = await createDesignSystemVariables(primaryColor, clearExisting);
    
    // 結果をUIに送信
    figma.ui.postMessage({ 
      type: 'variables-created', 
      success: result.success,
      message: result.message
    });
  }
  // 他のメッセージハンドリング...
};

// メインのビジネスロジック - あまりにも長いメソッド（200行以上）
async function createDesignSystemVariables(primaryColor: string, clearExisting: boolean = false) {
  try {
    // プリミティブカラー変数の作成
    // グレースケール変数の作成
    // 補助カラー変数の作成
    // 数値トークンの作成
    // セマンティックカラーの生成
    // コンポーネントカラーの生成
    // etc...
  } catch (error) {
    console.error('Error creating design system variables:', error);
    return { success: false, message: `Error: ${error}` };
  }
}
```

### 2.3 ユーティリティの分析

`colorUtils.ts`は比較的独立しており、純粋関数で構成されていますが、オブジェクト指向設計の観点からは改善の余地があります。

```typescript
// 外部に公開された関数が多すぎる - 一部は内部実装として隠すべき
export function hexToRgb(hex: string): RGB {...}
export function rgbToHex(rgb: RGB): string {...}
export function tint(hex: string, amount: number): string {...}
export function shade(hex: string, amount: number): string {...}
export function rgbToHsl(rgb: RGB): HSL {...}
export function hslToRgb(hsl: HSL): RGB {...}
export function hexToHsl(hex: string): HSL {...}
export function hslToHex(hsl: HSL): string {...}
export function getHue(hex: string): number {...}
export function changeHue(hex: string, newHue: number): string {...}
export function analogousColor(hex: string, offset: number = 30): string {...}
export function complementaryColor(hex: string): string {...}
export function adjustSaturation(hex: string, amount: number): string {...}
export function adjustLightness(hex: string, amount: number): string {...}
export function getContrastColor(hex: string): string {...}
export function generateHarmonizedColor(hex: string, hueOffset: number): string {...}
export function generateColorPalette(primaryHex: string): Record<string, string> {...}
export function generateDerivedColorPalette(...): Record<string, string> {...}
```

## 3. 特に深刻な設計上の問題点

### 3.1 状態管理の問題

`FigmaVariableService`は静的プロパティで状態を管理しています：

```typescript
private static lightModeIds: Record<string, string | null> = {};
private static darkModeIds: Record<string, string | null> = {};
private static collections: Record<string, VariableCollection | null> = {};
private static existingVariables: Map<string, Variable> = new Map();
```

これにより：
1. 複数のインスタンスを作成できない
2. テストが困難になる
3. 状態のリセットができない
4. 依存性注入が不可能

### 3.2 エラー伝播と回復の不備

エラーハンドリングが不十分で、多くの場合エラーはログに出力されるだけで具体的な回復または正確な状態報告がありません：

```typescript
try {
  // 複雑な処理
} catch (error) {
  console.error(`Error setting value for component ${variable.name}:`, error);
  // 最終的なフォールバック
  const safeColor = this.hexToFigmaColor('#808080'); // 中間のグレー
  variable.setValueForMode(modeId, safeColor);
  console.log(`Set safe gray color after error for ${variable.name}`);
}
```

ユーザーへのフィードバックが不明確になり、エラー状態からの回復が難しくなります。

### 3.3 変数参照システムの複雑性

現在の変数参照システムは極めて複雑で、参照解決に多くの条件分岐と特殊ケース処理があります：

```typescript
// 複雑な参照解決ロジック
const lightSemanticVar = semanticVars.find(v => v.name === lightSemanticVarName);
if (lightSemanticVar) {
  try {
    variable.setValueForMode(compLightModeId, {
      type: 'VARIABLE_ALIAS',
      id: lightSemanticVar.id
    });
    console.log(`Set light semantic reference: ${name} -> ${lightSemanticVar.name}`);
  } catch (error) {
    console.error(`Failed to set light semantic reference: ${error}`);
  }
} else {
  console.error(`Light semantic variable not found: ${lightSemanticVarName}`);
}
```

このような複雑な参照解決処理は、専用のResolverクラスに分離すべきです。

## 4. 特に優先して改善すべき点

### 4.1 FigmaVariableServiceの分解

最も緊急に対処すべき問題は、FigmaVariableServiceの分解です：

```
FigmaVariableService/
├── CollectionManager/       # コレクション管理専用
├── VariableCreationService/ # 変数作成の各種ロジック
├── ReferenceResolver/       # 参照解決のロジック
└── DesignSystemExporter/    # エクスポート機能
```

各クラスは専用のインターフェースを持ち、それぞれ単一の責任に特化すべきです。

### 4.2 巨大メソッドの分割

特に大きなメソッドは小さな関数に分割すべきです：

```typescript
// 変更前: 300行の巨大メソッド
private static setSemanticVariableValue(variable: Variable, valueOrRef: string, modeId: string): void {
  // 300行の複雑なロジック
}

// 変更後: 機能ごとに分割された複数のメソッド
private resolveSemanticVariableValue(variable: Variable, valueOrRef: string, modeId: string): void {
  if (this.isSpecialCase(valueOrRef)) {
    this.handleSpecialCase(variable, valueOrRef, modeId);
    return;
  }
  
  if (this.isCircularReference(variable.name, valueOrRef)) {
    this.handleCircularReference(variable, valueOrRef, modeId);
    return;
  }
  
  if (this.isPrimitiveReference(valueOrRef)) {
    this.resolvePrimitiveReference(variable, valueOrRef, modeId);
    return;
  }
  
  // 以下同様...
}
```

### 4.3 テスト容易性の向上

現在のコードはテストがほぼ不可能です。テスト容易性を向上させるポイント：

1. 依存性注入によるFigma APIのモック化
2. インターフェースの導入による実装の分離
3. 純粋関数の抽出によるロジックテスト
4. 状態とビジネスロジックの分離

例えば：

```typescript
// テスト可能なデザイン
export interface FigmaAPIWrapper {
  createVariable(name: string, collection: VariableCollection, type: string, options?: any): Variable;
  getLocalVariables(): Variable[];
  // その他Figma APIメソッド
}

export class FigmaVariableFactory {
  constructor(private figmaAPI: FigmaAPIWrapper) {}
  
  createColorVariable(name: string, ...): Variable {
    return this.figmaAPI.createVariable(name, ...);
  }
}

// テスト例
const mockFigmaAPI = {
  createVariable: jest.fn().mockReturnValue({ id: '123', name: 'test-var' }),
  getLocalVariables: jest.fn().mockReturnValue([])
};
const factory = new FigmaVariableFactory(mockFigmaAPI);
const variable = factory.createColorVariable('test', '#ffffff', '#000000', CollectionType.Primitives);
expect(mockFigmaAPI.createVariable).toHaveBeenCalled();
```

## 5. 段階的リファクタリング戦略の詳細

大規模なリファクタリングは一度にすべてを変更するのではなく、段階的に行うべきです。以下は具体的なステップです：

### フェーズ1: 基本構造の改善と依存性の整理

1. 最小限の変更でインターフェース導入
   ```typescript
   export interface VariableFactory {
     createColorVariable(...): Variable | null;
     // 他のメソッド...
   }
   
   // 既存コードをラップした実装
   export class FigmaVariableFactoryImpl implements VariableFactory {
     createColorVariable(...): Variable | null {
       return FigmaVariableService.createColorVariable(...);
     }
   }
   ```

2. 静的メソッドをインスタンスメソッドに変換
   ```typescript
   export class FigmaVariableService {
     // 静的プロパティをインスタンスプロパティに変換
     private readonly COLLECTION_NAMES = {...};
     private lightModeIds: Record<string, string | null> = {};
     
     // 静的メソッドをインスタンスメソッドに変換
     async initializeCollections(): Promise<boolean> {
       // 内容はほぼ同じだが、this.で参照
     }
   }
   ```

3. `code.ts`の依存関係を整理
   ```typescript
   // 変更前
   const result = await FigmaVariableService.createDesignSystemVariables(...);
   
   // 変更後
   const variableService = new FigmaVariableService();
   const result = await variableService.createDesignSystemVariables(...);
   ```

### フェーズ2: VariableServiceの分割

1. まず`CollectionManager`を抽出
   ```typescript
   export class CollectionManager {
     private collections: Record<string, VariableCollection | null> = {};
     private lightModeIds: Record<string, string | null> = {};
     private darkModeIds: Record<string, string | null> = {};
     
     async initializeCollections(): Promise<boolean> {
       // 既存の初期化ロジック
     }
     
     getCollection(type: CollectionType): VariableCollection | null {
       // コレクション取得ロジック
     }
     
     // 他のコレクション関連メソッド
   }
   
   // FigmaVariableServiceはCollectionManagerを利用
   export class FigmaVariableService {
     private collectionManager = new CollectionManager();
     
     // メソッドはCollectionManagerを使用
   }
   ```

2. 次に`ReferenceResolver`を抽出
   ```typescript
   export class ReferenceResolver {
     constructor(private collectionManager: CollectionManager) {}
     
     setVariableReference(variable: Variable, referenceVariable: Variable, modeId: string): void {
       // 参照設定ロジック
     }
     
     // 他の参照解決メソッド
   }
   ```

3. `VariableFactory`の抽出
   ```typescript
   export class VariableFactory {
     constructor(
       private collectionManager: CollectionManager,
       private referenceResolver: ReferenceResolver
     ) {}
     
     createColorVariable(...): Variable | null {
       // 変数作成ロジック
     }
     
     // 他の変数作成メソッド
   }
   ```

### フェーズ3: 純粋ユーティリティの最適化

1. `ColorConverter`クラスにユーティリティを整理
   ```typescript
   export class ColorConverter {
     hexToRgb(hex: string): RGB { ... }
     rgbToHex(rgb: RGB): string { ... }
     hexToHsl(hex: string): HSL { ... }
     hslToHex(hsl: HSL): string { ... }
     // 他の色変換メソッド
   }
   ```

2. 戦略パターンの導入
   ```typescript
   export interface PaletteGenerationStrategy {
     generatePalette(primaryColor: string): Record<string, string>;
   }
   
   export class HSLPaletteStrategy implements PaletteGenerationStrategy {
     constructor(private colorConverter: ColorConverter) {}
     
     generatePalette(primaryColor: string): Record<string, string> {
       // HSLベースのパレット生成
     }
   }
   ```

### フェーズ4: エラー処理とロギングの強化

1. 専用エラークラスの導入
   ```typescript
   export class VariableCreationError extends Error {
     constructor(
       message: string,
       public readonly variableName: string,
       public readonly originalError?: Error
     ) {
       super(`Variable creation failed for '${variableName}': ${message}`);
       this.name = 'VariableCreationError';
     }
   }
   ```

2. 構造化ロギングの導入
   ```typescript
   export interface Logger {
     debug(message: string, data?: any): void;
     info(message: string, data?: any): void;
     warn(message: string, data?: any): void;
     error(message: string, error?: Error, data?: any): void;
   }
   
   export class ConsoleLogger implements Logger {
     debug(message: string, data?: any): void {
       console.debug(`[DEBUG] ${message}`, data || '');
     }
     // 他のメソッド実装
   }
   ```

## 6. ユニットテスト導入計画

各コンポーネントに対するユニットテストを導入することで、リファクタリングの安全性を確保します：

```typescript
// ColorConverter のテスト例
describe('ColorConverter', () => {
  const converter = new ColorConverter();
  
  test('hexToRgb converts valid hex values', () => {
    expect(converter.hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(converter.hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    expect(converter.hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
  });
  
  test('hexToRgb handles shorthand hex', () => {
    expect(converter.hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
  });
  
  // 他のテストケース
});

// CollectionManager のモックテスト例
describe('CollectionManager', () => {
  const mockFigma = {
    variables: {
      getLocalVariableCollections: jest.fn().mockReturnValue([]),
      createVariableCollection: jest.fn().mockImplementation(name => ({
        name,
        modes: [],
        addMode: jest.fn().mockImplementation(modeName => modeName),
        renameMode: jest.fn()
      }))
    }
  };
  
  beforeEach(() => {
    // モックリセット
    jest.clearAllMocks();
  });
  
  test('initializeCollections creates collections if not exist', async () => {
    const manager = new CollectionManager(mockFigma.variables);
    await manager.initializeCollections();
    
    // 期待通りにコレクションが作成されたかチェック
    expect(mockFigma.variables.createVariableCollection).toHaveBeenCalledTimes(3);
  });
  
  // 他のテストケース
});
```

---

このような詳細な分析と段階的なリファクタリング計画により、コード品質を大幅に向上させながらも既存機能を壊さないよう注意深く改善できます。各ステップで機能テストを行い、安全に進めることが重要です。