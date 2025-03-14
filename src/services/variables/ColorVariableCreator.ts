/**
 * ColorVariableCreator
 * カラー変数の作成を担当するクラス
 */
import { BaseVariableCreator } from './BaseVariableCreator';
import { CollectionType, ICollectionManager } from '../figmaServiceTypes';
import { getRGBAFromHex } from '../../utils/colorUtils';

/**
 * カラー変数作成クラス
 */
export class ColorVariableCreator extends BaseVariableCreator {
  /**
   * コンストラクタ
   * @param {ICollectionManager} collectionManager コレクション管理オブジェクト
   */
  constructor(collectionManager: ICollectionManager) {
    super(collectionManager);
  }

  /**
   * カラー変数を作成する
   * @param {string} name 変数名
   * @param {string} lightValue Light モードの値 (HEX)
   * @param {string} darkValue Dark モードの値 (HEX)
   * @param {string} [group] グループ名
   * @returns {Variable | null} 作成した変数またはnull
   */
  createVariable(name: string, lightValue: string, darkValue: string, group?: string): Variable | null {
    try {
      // 変数の基本情報を準備
      const { variableName, collection, existingVariable } = this.prepareVariableBase(
        name, 
        group, 
        CollectionType.Primitives
      );
      
      // 既存の変数があれば値を更新して返す
      if (existingVariable) {
        this.updateVariableValues(existingVariable, lightValue, darkValue);
        return existingVariable;
      }
      
      // コレクションが見つからなければエラー
      if (!collection) {
        throw new Error('Primitives collection not found');
      }
      
      // Figma変数APIを使用して変数を作成
      const variable = figma.variables.createVariable(
        variableName,
        collection.id,
        'COLOR'
      );
      
      // 値を設定
      this.updateVariableValues(variable, lightValue, darkValue);
      
      // 変数をキャッシュに追加
      this.collectionManager.addToCache(variable);
      
      return variable;
    } catch (error) {
      figma.notify(`Failed to create color variable "${name}": ${error}`, { error: true });
      return null;
    }
  }

  /**
   * カラー変数の値を更新する
   * @protected
   * @param {Variable} variable 更新する変数
   * @param {string} lightValue Light モードの値 (HEX)
   * @param {string} darkValue Dark モードの値 (HEX)
   */
  protected updateVariableValues(variable: Variable, lightValue: string, darkValue: string): void {
    const lightModeId = this.collectionManager.getLightModeId(CollectionType.Primitives);
    const darkModeId = this.collectionManager.getDarkModeId(CollectionType.Primitives);
    
    if (lightModeId) {
      // HEX カラーを RGBA に変換
      const lightColor = getRGBAFromHex(lightValue);
      variable.setValueForMode(lightModeId, lightColor);
    }
    
    if (darkModeId) {
      // HEX カラーを RGBA に変換
      const darkColor = getRGBAFromHex(darkValue);
      variable.setValueForMode(darkModeId, darkColor);
    }
  }

  /**
   * カラーパレットを作成する
   * @param {string} baseName ベース名
   * @param {Record<string, string>} palette カラーパレット (キー: バリアント名, 値: HEX カラー)
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createPrimitiveColorPalette(baseName: string, palette: Record<string, string>): Record<string, Variable | null> {
    const variables: Record<string, Variable | null> = {};
    
    // Light モードとして扱う
    const lightPalette = palette;
    
    // Dark モードとして逆の色を使用（暫定）
    const darkPalette: Record<string, string> = {};
    Object.keys(lightPalette).forEach(key => {
      // 簡易実装（実際には適切なダークモードカラーを設定する必要あり）
      darkPalette[key] = lightPalette[key];
    });
    
    // 各カラーに対して変数を作成
    Object.entries(lightPalette).forEach(([variant, lightColor]) => {
      const darkColor = darkPalette[variant];
      const name = variant === 'default' ? baseName : `${baseName}-${variant}`;
      
      const variable = this.createVariable(name, lightColor, darkColor);
      if (variable) {
        variables[name] = variable;
      } else {
        variables[name] = null;
      }
    });
    
    return variables;
  }

  /**
   * カラートークンを作成する
   * @param {Record<string, string>} tokens カラートークン
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createColorTokens(tokens: Record<string, string>): Record<string, Variable | null> {
    // 同じパレットをライトモードとダークモードの両方に使用（簡易実装）
    return this.createPrimitiveColorPalette('color', tokens);
  }
}
