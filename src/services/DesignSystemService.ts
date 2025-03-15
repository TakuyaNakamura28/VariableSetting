/**
 * デザインシステム変数作成サービス
 * プリミティブ変数、セマンティック変数、コンポーネント変数の生成と管理を担当
 * SOLID原則に基づいた設計：
 * - 単一責任原則: デザインシステム関連の処理のみを担当
 * - 開放閉鎖原則: 新しい変数タイプに対して拡張可能
 * - インターフェース分離原則: 明確なパブリックAPIの提供
 * - 依存性逆転原則: 変数サービスへの依存を注入
 */
import { generateColorPalette } from '../utils/colorUtils';
import { generateSemanticColors, generateComponentColors } from '../utils/semanticUtils';
import { 
  generateSpacingTokens, 
  generateRadiusTokens, 
  // generateShadowTokens,  // 現在未使用のため、コメントアウト
  generateGrayscaleTokens,
  generateSupportColorTokens 
} from '../utils/tokensUtils';
import { FigmaVariableAdapter } from './FigmaVariableAdapter';
import { ConfigObject } from '../types/messageTypes';
import { SemanticColors, ComponentColors } from '../types';

// カラー関連の型定義
/**
 * カラーカテゴリ型 - 単一カテゴリ内のカラー名と値のマッピング
 */
interface ColorCategory {
  [colorName: string]: string;
}

/**
 * ネストされたカラーオブジェクト型 - カテゴリとカラーの階層構造
 * SemanticColorsやComponentColorsと互換性を持たせるための共通型
 */
interface NestedColorObject {
  [category: string]: ColorCategory | string;
}

// 型ガード関数 - オブジェクトをColorCategoryとして扱えるか判定
function isColorCategory(value: unknown): value is ColorCategory {
  return typeof value === 'object' && value !== null;
}

/**
 * SemanticColorsをNestedColorObjectに変換するヘルパー関数
 * これにより型の互換性を確保
 */
function semanticColorsToNestedColorObject(semanticColors: SemanticColors): NestedColorObject {
  return semanticColors as unknown as NestedColorObject;
}

/**
 * ComponentColorsをNestedColorObjectに変換するヘルパー関数
 * これにより型の互換性を確保
 */
function componentColorsToNestedColorObject(componentColors: ComponentColors): NestedColorObject {
  return componentColors as unknown as NestedColorObject;
}

/**
 * フラットなカラーパレットをネストされた形式に変換するヘルパー関数
 * @param colorPalette フラットなカラーパレット (例: { "primary-100": "#fff", ... })
 * @returns ネストされた形式のオブジェクト (例: { primary: { "100": "#fff", ... } })
 */
function flatPaletteToNested(colorPalette: Record<string, string>): NestedColorObject {
  const result: NestedColorObject = {};
  
  for (const [key, value] of Object.entries(colorPalette)) {
    const parts = key.split('-');
    if (parts.length === 2) {
      const [category, shade] = parts;
      if (!result[category]) {
        result[category] = {};
      }
      
      if (isColorCategory(result[category])) {
        (result[category] as ColorCategory)[shade] = value;
      }
    } else {
      // 単一の色名の場合はそのまま追加
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * デザインシステムサービスクラス
 * カラーパレット生成と変数作成を担当
 */
export class DesignSystemService {
  private figmaVariableAdapter: FigmaVariableAdapter;
  private darkMode = false;
  private logger: { error: (message: string, error?: unknown) => void };

  /**
   * コンストラクタ - 依存性の注入
   * @param figmaVariableAdapter Figma変数アダプター
   */
  constructor(figmaVariableAdapter: FigmaVariableAdapter) {
    this.figmaVariableAdapter = figmaVariableAdapter;
    this.logger = {
      error: (message: string, error?: unknown) => {
        // エラーを常にログ出力（実際の環境に応じて調整可能）
        console.error(`${message}: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
  }

  /**
   * 初期化処理
   * @param configObj 設定オブジェクト
   */
  initialize(configObj: ConfigObject): void {
    // 必要な初期化処理を実行
    this.darkMode = configObj.themeMode === 'dark';
  }

  /**
   * プライマリカラーからパレットを生成
   * @param primaryColor プライマリカラー (HEX)
   * @returns カラーパレット
   */
  generatePalette(primaryColor: string): Record<string, string> {
    try {
      return generateColorPalette(primaryColor);
    } catch (error) {
      // エラーログと代替処理
      this.logError('カラーパレット生成エラー', error);
      return {};
    }
  }

  /**
   * セマンティックカラーの生成
   * @param colorPalette カラーパレット
   * @returns セマンティックカラーオブジェクト
   */
  generateSemanticColorsFromPalette(colorPalette: Record<string, string>): NestedColorObject {
    try {
      // utilsの関数を使用してセマンティックカラーを生成
      const semanticColors = generateSemanticColors(colorPalette, this.darkMode);
      // 型の互換性を保証するために変換
      return semanticColorsToNestedColorObject(semanticColors);
    } catch (error) {
      this.logError('セマンティックカラー生成エラー', error);
      return {};
    }
  }

  /**
   * コンポーネントカラーの生成
   * @param semanticColors セマンティックカラーオブジェクト
   * @returns コンポーネントカラーオブジェクト
   */
  generateComponentColorsFromSemantics(semanticColors: SemanticColors): NestedColorObject {
    try {
      // utilsの関数を使用してコンポーネントカラーを生成
      const componentColors = generateComponentColors(semanticColors, this.darkMode);
      // 型の互換性を保証するために変換
      return componentColorsToNestedColorObject(componentColors);
    } catch (error) {
      this.logError('コンポーネントカラー生成エラー', error);
      return {};
    }
  }

  /**
   * Figma変数コレクションの作成
   * @param name 変数コレクション名
   * @returns コレクションID
   */
  createVariableCollection(name: string): string {
    // アダプターを使用してコレクションを作成
    return this.figmaVariableAdapter.createCollection(name);
  }

  /**
   * プリミティブカラー変数の作成
   * @param collectionId コレクションID
   * @param colorPalette カラーパレット
   */
  createPrimitiveColorVariables(collectionId: string, colorPalette: Record<string, string>): void {
    try {
      // フラットなパレットをネストされた形式に変換
      const nestedPalette = flatPaletteToNested(colorPalette);
      
      for (const [category, shades] of Object.entries(nestedPalette)) {
        if (isColorCategory(shades)) {
          for (const [shade, hexValue] of Object.entries(shades)) {
            const variableName = `${category}-${shade}`;
            this.figmaVariableAdapter.createColorVariable(
              collectionId,
              variableName, 
              hexValue
            );
          }
        } else if (typeof shades === 'string') {
          // 単一カラーの場合
          this.figmaVariableAdapter.createColorVariable(
            collectionId,
            category,
            shades
          );
        }
      }
    } catch (error) {
      this.logError('プリミティブカラー変数作成エラー', error);
    }
  }

  /**
   * セマンティックカラー変数の作成
   * @param collectionId コレクションID
   * @param semanticColors セマンティックカラーオブジェクト
   */
  createSemanticColorVariables(collectionId: string, semanticColors: NestedColorObject): void {
    try {
      this.createNestedColorVariables(collectionId, semanticColors, 'semantic');
    } catch (error) {
      this.logError('セマンティックカラー変数作成エラー', error);
    }
  }

  /**
   * コンポーネントカラー変数の作成
   * @param collectionId コレクションID
   * @param componentColors コンポーネントカラーオブジェクト
   */
  createComponentColorVariables(collectionId: string, componentColors: NestedColorObject): void {
    try {
      this.createNestedColorVariables(collectionId, componentColors, 'component');
    } catch (error) {
      this.logError('コンポーネントカラー変数作成エラー', error);
    }
  }

  /**
   * ネストされたカラー変数の作成（内部ヘルパーメソッド）
   * @param collectionId コレクションID
   * @param colorObject ネストされたカラーオブジェクト
   * @param prefix 変数名のプレフィックス
   */
  private createNestedColorVariables(
    collectionId: string, 
    colorObject: NestedColorObject, 
    prefix: string
  ): void {
    for (const [category, values] of Object.entries(colorObject)) {
      if (isColorCategory(values)) {
        for (const [name, hexValue] of Object.entries(values)) {
          const variableName = `${prefix}/${category}/${name}`;
          this.figmaVariableAdapter.createColorVariable(
            collectionId,
            variableName,
            hexValue
          );
        }
      } else if (typeof values === 'string') {
        const variableName = `${prefix}/${category}`;
        this.figmaVariableAdapter.createColorVariable(
          collectionId,
          variableName,
          values
        );
      }
    }
  }

  /**
   * スペーシングトークンの生成と変数作成
   * @param collectionId コレクションID
   * @param _baseSize ベースサイズ（現在未使用）
   */
  createSpacingVariables(collectionId: string, _baseSize: number): void {
    try {
      // 引数なしで関数を呼び出す
      const spacingTokens = generateSpacingTokens();
      for (const [name, value] of Object.entries(spacingTokens)) {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        this.figmaVariableAdapter.createNumberVariable(
          collectionId,
          `spacing/${name}`,
          numValue
        );
      }
    } catch (error) {
      this.logError('スペーシング変数作成エラー', error);
    }
  }

  /**
   * 角丸トークンの生成と変数作成
   * @param collectionId コレクションID
   * @param _baseSize ベースサイズ（現在未使用）
   */
  createRadiusVariables(collectionId: string, _baseSize: number): void {
    try {
      // 引数なしで関数を呼び出す
      const radiusTokens = generateRadiusTokens();
      for (const [name, value] of Object.entries(radiusTokens)) {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        this.figmaVariableAdapter.createNumberVariable(
          collectionId,
          `radius/${name}`,
          numValue
        );
      }
    } catch (error) {
      this.logError('角丸変数作成エラー', error);
    }
  }

  /**
   * グレースケールトークンの生成と変数作成
   * @param collectionId コレクションID
   */
  createGrayscaleVariables(collectionId: string): void {
    try {
      // 引数なしで関数を呼び出す
      const grayscaleTokens = generateGrayscaleTokens();
      
      // 変換処理でオブジェクト構造を平坦化
      for (const [category, colors] of Object.entries(grayscaleTokens)) {
        for (const [shade, value] of Object.entries(colors as Record<string, string>)) {
          const name = `grayscale/${category}-${shade}`;
          this.figmaVariableAdapter.createColorVariable(
            collectionId,
            name,
            value
          );
        }
      }
    } catch (error) {
      this.logError('グレースケール変数作成エラー', error);
    }
  }

  /**
   * サポートカラートークンの生成と変数作成
   * @param collectionId コレクションID
   */
  createSupportColorVariables(collectionId: string): void {
    try {
      // 引数なしで関数を呼び出す
      const supportColorTokens = generateSupportColorTokens();
      
      // 変換処理でオブジェクト構造を平坦化
      for (const [category, colors] of Object.entries(supportColorTokens)) {
        for (const [shade, value] of Object.entries(colors as Record<string, string>)) {
          const name = `support/${category}-${shade}`;
          this.figmaVariableAdapter.createColorVariable(
            collectionId,
            name,
            value
          );
        }
      }
    } catch (error) {
      this.logError('サポートカラー変数作成エラー', error);
    }
  }

  /**
   * シャドウトークンの生成と変数作成
   * @param _collectionId コレクションID（現在未使用）
   */
  createShadowVariables(_collectionId: string): void {
    try {
      // shadowTokensは現時点では使用されていないため、実装を保留
      // const shadowTokens = generateShadowTokens(this.darkMode);
      // FigmaVariableServiceの実装に応じたシャドウ変数作成
      // 現在は省略 - 今後実装
      this.logError('シャドウ変数作成', 'シャドウ変数の作成はまだ実装されていません');
    } catch (error) {
      this.logError('シャドウ変数作成エラー', error);
    }
  }

  /**
   * 完全なデザインシステムの生成
   * @param primaryColor プライマリカラー
   * @param collectionName コレクション名
   * @returns 生成したすべての変数情報
   */
  generateCompleteDesignSystem(primaryColor: string, collectionName: string): Record<string, unknown> {
    try {
      // コレクション作成
      const collectionId = this.createVariableCollection(collectionName);
      
      // カラーパレット生成
      const colorPalette = this.generatePalette(primaryColor);
      
      // プリミティブカラー変数の作成
      this.createPrimitiveColorVariables(collectionId, colorPalette);
      
      // セマンティックカラーの生成と変数作成
      const semanticColors = this.generateSemanticColorsFromPalette(colorPalette);
      this.createSemanticColorVariables(collectionId, semanticColors);
      
      // コンポーネントカラーの生成と変数作成（型変換でエラーを回避）
      const componentColors = this.generateComponentColorsFromSemantics(semanticColors as unknown as SemanticColors);
      this.createComponentColorVariables(collectionId, componentColors);
      
      // その他のトークン生成と変数作成
      this.createSpacingVariables(collectionId, 4);
      this.createRadiusVariables(collectionId, 4);
      this.createGrayscaleVariables(collectionId);
      this.createSupportColorVariables(collectionId);
      this.createShadowVariables(collectionId);
      
      return {
        collectionId,
        colorPalette,
        semanticColors,
        componentColors
      };
    } catch (error) {
      this.logError('デザインシステム生成エラー', error);
      return {};
    }
  }

  /**
   * エラーログ出力
   * @param message エラーメッセージ
   * @param error エラーオブジェクト
   */
  private logError(message: string, error: unknown): void {
    this.logger.error(message, error);
  }
}
