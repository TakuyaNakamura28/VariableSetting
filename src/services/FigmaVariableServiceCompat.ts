/**
 * 既存のFigmaVariableServiceとの互換性レイヤー
 * リファクタリング中のスムーズな移行のため
 */
import { VariableManagementService } from './VariableManagementService';
import { CollectionType } from './figmaServiceTypes';

/**
 * 互換性用のFigmaVariableService
 * 同じ静的メソッドを提供するが、内部では新しいクラス構造を使用
 */
export class FigmaVariableService {
  // コレクションタイプの再エクスポート
  static readonly CollectionType = CollectionType;
  
  // サービスのシングルトンインスタンス
  private static readonly service = new VariableManagementService();
  
  /**
   * すべてのコレクションを初期化する
   */
  static async initializeCollections(): Promise<boolean> {
    return await FigmaVariableService.service.initializeCollections();
  }
  
  /**
   * すべての変数をクリア
   */
  static clearAllVariables(): void {
    FigmaVariableService.service.clearAllVariables();
  }
  
  /**
   * プリミティブカラーパレットを作成
   */
  static createPrimitiveColorPalette(
    baseName: string,
    palette: Record<string, string>
  ): Record<string, Variable | null> {
    return FigmaVariableService.service.createPrimitiveColorPalette(baseName, palette);
  }
  
  /**
   * 個別のカラー変数を作成
   */
  static createColorVariable(
    name: string,
    lightValue: string,
    darkValue: string,
    collectionType: CollectionType,
    group?: string
  ): Variable | null {
    return FigmaVariableService.service.createColorVariable(
      name,
      lightValue,
      darkValue,
      collectionType,
      group
    );
  }
  
  /**
   * 数値トークン変数を作成
   */
  static createPrimitiveNumberTokens(
    tokenType: string,
    tokens: Record<string, number>
  ): Record<string, Variable | null> {
    return FigmaVariableService.service.createPrimitiveNumberTokens(tokenType, tokens);
  }
  
  /**
   * シャドウ変数を作成
   */
  static createShadowVariables(
    lightShadows: Record<string, EffectValue[]>,
    darkShadows: Record<string, EffectValue[]>
  ): Record<string, Variable | null> {
    return FigmaVariableService.service.createShadowVariables(lightShadows, darkShadows);
  }
  
  /**
   * セマンティックカラーの作成
   */
  static createSemanticColors(
    lightSemanticColors: Record<string, string>,
    darkSemanticColors: Record<string, string>
  ): Record<string, Variable | null> {
    return FigmaVariableService.service.createSemanticColors(
      lightSemanticColors,
      darkSemanticColors
    );
  }
  
  /**
   * コンポーネントカラーの作成
   */
  static createComponentColors(
    lightComponentColors: Record<string, string>,
    darkComponentColors: Record<string, string>
  ): Record<string, Variable | null> {
    return FigmaVariableService.service.createComponentColors(
      lightComponentColors,
      darkComponentColors
    );
  }
  
  /**
   * CSS変数としてエクスポート
   * @returns {Record<string, string>} CSS変数
   */
  static exportAsCSSVariables(): Record<string, string> {
    return FigmaVariableService.service.exportAsCSSVariables();
  }
  
  /**
   * Tailwind設定としてエクスポート
   * @returns {object | string} Tailwind設定
   */
  static exportAsTailwindConfig(): object | string {
    return FigmaVariableService.service.exportAsTailwindConfig();
  }
}
