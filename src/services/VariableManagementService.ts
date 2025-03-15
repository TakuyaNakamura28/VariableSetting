/**
 * 変数管理サービス
 * リファクタリング中の橋渡し役として機能
 */
import { CollectionManagerService } from './CollectionManagerService';
import { CollectionType } from './figmaServiceTypes';
import { VariableCreatorFacade } from './variables/VariableCreatorFacade';

/**
 * 変数管理サービス
 */
export class VariableManagementService {
  private collectionManager: CollectionManagerService;
  private variableCreator: VariableCreatorFacade;
  
  constructor() {
    this.collectionManager = CollectionManagerService.getInstance();
    this.variableCreator = new VariableCreatorFacade(this.collectionManager);
  }
  
  /**
   * すべてのコレクションを初期化する
   * @returns {Promise<boolean>} 初期化の成功/失敗
   */
  async initializeCollections(): Promise<boolean> {
    try {
      return await this.collectionManager.initializeCollections();
    } catch (error) {
      figma.notify(`Failed to initialize collections: ${error}`, { error: true });
      return false;
    }
  }
  
  /**
   * すべての変数をクリアする
   */
  clearAllVariables(): void {
    try {
      this.collectionManager.clearAllVariables();
    } catch (error) {
      figma.notify(`Failed to clear variables: ${error}`, { error: true });
    }
  }
  
  /**
   * カラー変数を作成する
   * @param {string} name 変数名
   * @param {string} lightValue Light モードの値 (HEX)
   * @param {string} darkValue Dark モードの値 (HEX)
   * @param {CollectionType} collectionType コレクションタイプ
   * @param {string} [group] グループ名
   * @returns {Variable | null} 作成した変数またはnull
   */
  createColorVariable(
    name: string, 
    lightValue: string, 
    darkValue: string, 
    collectionType: CollectionType = CollectionType.Primitives,
    group?: string
  ): Variable | null {
    if (collectionType === CollectionType.Primitives) {
      return this.variableCreator.createVariable(name, lightValue, darkValue, group);
    }
    
    // 他のコレクションタイプの処理を実装
    figma.notify(`Collection type ${collectionType} not implemented yet`, { error: true });
    return null;
  }
  
  /**
   * カラーパレットを作成する
   * @param {string} baseName ベース名
   * @param {Record<string, string>} palette カラーパレット (キー: バリアント名, 値: HEX カラー)
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createPrimitiveColorPalette(baseName: string, palette: Record<string, string>): Record<string, Variable | null> {
    return this.variableCreator.createPrimitiveColorPalette(baseName, palette);
  }
  
  /**
   * プリミティブ数値トークンを作成する
   * @param {string} prefix プレフィックス
   * @param {Record<string, number>} tokens トークン (キー: 名前, 値: 数値)
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createPrimitiveNumberTokens(prefix: string, tokens: Record<string, number>): Record<string, Variable | null> {
    return this.variableCreator.createPrimitiveNumberTokens(prefix, tokens);
  }
  
  /**
   * シャドウ変数を作成する
   * @param {Record<string, EffectValue[]>} lightShadows Light モードのシャドウ
   * @param {Record<string, EffectValue[]>} darkShadows Dark モードのシャドウ
   * @param {string} [group] グループ名
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createShadowVariables(
    lightShadows: Record<string, EffectValue[]>, 
    darkShadows: Record<string, EffectValue[]>,
    group?: string
  ): Record<string, Variable | null> {
    return this.variableCreator.createShadowVariables(lightShadows, darkShadows, group);
  }
  
  /**
   * セマンティックカラーを作成する
   * @param {Record<string, string>} lightColors Light モードのカラー
   * @param {Record<string, string>} darkColors Dark モードのカラー
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createSemanticColors(
    lightColors: Record<string, string>,
    darkColors: Record<string, string>
  ): Record<string, Variable | null> {
    // セマンティックカラーの作成ロジックは維持
    const semanticCollection = this.collectionManager.getCollection(CollectionType.Semantic);
    if (!semanticCollection) {
      figma.notify('Semantic collection not found', { error: true });
      return {};
    }
    
    const variables: Record<string, Variable | null> = {};
    
    // 各カラーに対して処理
    for (const [name, lightValue] of Object.entries(lightColors)) {
      const darkValue = darkColors[name] || lightValue;
      
      try {
        // 既存の変数をチェック
        const existingVariable = this.collectionManager.findVariableByName(
          name, 
          CollectionType.Semantic
        );
        
        if (existingVariable) {
          this.updateColorVariable(existingVariable, lightValue, darkValue, CollectionType.Semantic);
          variables[name] = existingVariable;
        } else {
          // 新しい変数を作成
          const variable = figma.variables.createVariable(
            name,
            semanticCollection.id,
            'COLOR'
          );
          
          this.updateColorVariable(variable, lightValue, darkValue, CollectionType.Semantic);
          this.collectionManager.addToCache(variable);
          
          variables[name] = variable;
        }
      } catch (error) {
        figma.notify(`Failed to create semantic color "${name}": ${error}`, { error: true });
        variables[name] = null;
      }
    }
    
    return variables;
  }
  
  /**
   * コンポーネントカラーを作成する
   * @param {Record<string, string>} lightColors Light モードのカラー
   * @param {Record<string, string>} darkColors Dark モードのカラー
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createComponentColors(
    lightColors: Record<string, string>,
    darkColors: Record<string, string>
  ): Record<string, Variable | null> {
    // 同様のロジックで、コンポーネントコレクション用の変数を作成
    const componentCollection = this.collectionManager.getCollection(CollectionType.Components);
    if (!componentCollection) {
      figma.notify('Components collection not found', { error: true });
      return {};
    }
    
    const variables: Record<string, Variable | null> = {};
    
    // 各カラーに対して処理
    for (const [name, lightValue] of Object.entries(lightColors)) {
      const darkValue = darkColors[name] || lightValue;
      
      try {
        // 既存の変数をチェック
        const existingVariable = this.collectionManager.findVariableByName(
          name, 
          CollectionType.Components
        );
        
        if (existingVariable) {
          this.updateColorVariable(existingVariable, lightValue, darkValue, CollectionType.Components);
          variables[name] = existingVariable;
        } else {
          // 新しい変数を作成
          const variable = figma.variables.createVariable(
            name,
            componentCollection.id,
            'COLOR'
          );
          
          this.updateColorVariable(variable, lightValue, darkValue, CollectionType.Components);
          this.collectionManager.addToCache(variable);
          
          variables[name] = variable;
        }
      } catch (error) {
        figma.notify(`Failed to create component color "${name}": ${error}`, { error: true });
        variables[name] = null;
      }
    }
    
    return variables;
  }
  
  /**
   * カラー変数の値を更新する
   * @private
   * @param {Variable} variable 更新する変数
   * @param {string} lightValue Light モードの値 (HEX)
   * @param {string} darkValue Dark モードの値 (HEX)
   * @param {CollectionType} collectionType コレクションタイプ
   */
  private updateColorVariable(
    variable: Variable, 
    lightValue: string, 
    darkValue: string,
    collectionType: CollectionType
  ): void {
    // コレクションタイプに対応したモードIDを取得
    const lightModeId = this.collectionManager.getLightModeId(collectionType);
    const darkModeId = this.collectionManager.getDarkModeId(collectionType);
    
    if (lightModeId) {
      // HEX を RGBA に変換するヘルパー関数
      const rgbaValue = this.hexToRgba(lightValue);
      if (rgbaValue) {
        variable.setValueForMode(lightModeId, rgbaValue);
      }
    }
    
    if (darkModeId) {
      // HEX を RGBA に変換するヘルパー関数
      const rgbaValue = this.hexToRgba(darkValue);
      if (rgbaValue) {
        variable.setValueForMode(darkModeId, rgbaValue);
      }
    }
  }
  
  /**
   * HEX カラーコードを RGBA に変換する
   * @private
   * @param {string} hex HEX カラーコード
   * @returns {RGBA | null} RGBA オブジェクトまたはnull
   */
  private hexToRgba(hex: string): RGBA | null {
    try {
      // ヘルパー関数を使用して HEX を RGBA に変換
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const a = hex.length > 7 ? parseInt(hex.slice(7, 9), 16) / 255 : 1;
      
      return { r, g, b, a };
    } catch (error) {
      figma.notify(`Invalid HEX color: ${hex}`, { error: true });
      return null;
    }
  }
  
  /**
   * CSS変数としてエクスポートする
   * @returns {Record<string, string>} CSS変数
   */
  exportAsCSSVariables(): Record<string, string> {
    // CSS変数エクスポートロジック（現在は単純実装）
    return {
      '--primary-500': '#ff0000',
      '--background': '#ffffff',
      '--foreground': '#000000',
      // その他の変数...
    };
  }
  
  /**
   * Tailwind設定としてエクスポートする
   * @returns {object | string} Tailwind設定
   */
  exportAsTailwindConfig(): object | string {
    // Tailwind設定エクスポートロジック（現在は単純実装）
    return {
      theme: {
        extend: {
          colors: {
            primary: {
              500: '#ff0000'
            },
            // その他の色...
          }
        }
      }
    };
  }
}
