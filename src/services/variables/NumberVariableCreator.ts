/**
 * NumberVariableCreator
 * 数値変数の作成を担当するクラス
 */
import { BaseVariableCreator } from './BaseVariableCreator';
import { CollectionType, ICollectionManager } from '../figmaServiceTypes';

/**
 * 数値変数作成クラス
 */
export class NumberVariableCreator extends BaseVariableCreator {
  /**
   * コンストラクタ
   * @param {ICollectionManager} collectionManager コレクション管理オブジェクト
   */
  constructor(collectionManager: ICollectionManager) {
    super(collectionManager);
  }

  /**
   * 数値変数を作成する
   * @param {string} name 変数名
   * @param {number} lightValue Light モードの値
   * @param {number} darkValue Dark モードの値
   * @param {string} [group] グループ名
   * @returns {Variable | null} 作成した変数またはnull
   */
  createVariable(name: string, lightValue: number, darkValue: number, group?: string): Variable | null {
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
        'FLOAT'
      );
      
      // 値を設定
      this.updateVariableValues(variable, lightValue, darkValue);
      
      // 変数をキャッシュに追加
      this.collectionManager.addToCache(variable);
      
      return variable;
    } catch (error) {
      figma.notify(`Failed to create number variable "${name}": ${error}`, { error: true });
      return null;
    }
  }

  /**
   * 数値変数の値を更新する
   * @protected
   * @param {Variable} variable 更新する変数
   * @param {number} lightValue Light モードの値
   * @param {number} darkValue Dark モードの値
   */
  protected updateVariableValues(variable: Variable, lightValue: number, darkValue: number): void {
    const lightModeId = this.collectionManager.getLightModeId(CollectionType.Primitives);
    const darkModeId = this.collectionManager.getDarkModeId(CollectionType.Primitives);
    
    if (lightModeId) {
      variable.setValueForMode(lightModeId, lightValue);
    }
    
    if (darkModeId) {
      variable.setValueForMode(darkModeId, darkValue);
    }
  }

  /**
   * 数値トークンを作成する
   * @param {string} prefix プレフィックス (グループ名)
   * @param {Record<string, number>} tokens トークン (キー: 名前, 値: 数値)
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createPrimitiveNumberTokens(prefix: string, tokens: Record<string, number>): Record<string, Variable | null> {
    const variables: Record<string, Variable | null> = {};
    
    // 各トークンに対して変数を作成
    Object.entries(tokens).forEach(([key, value]) => {
      // ライトモードとダークモードの両方に同じ値を使用
      const variable = this.createVariable(key, value, value, prefix);
      
      if (variable) {
        variables[key] = variable;
      } else {
        variables[key] = null;
      }
    });
    
    return variables;
  }

  /**
   * 数値トークン作成のショートカットメソッド
   * @param {Record<string, number>} tokens トークン (キー: 名前, 値: 数値)
   * @param {string} [group] グループ名
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createNumberTokens(tokens: Record<string, number>, group?: string): Record<string, Variable | null> {
    return this.createPrimitiveNumberTokens(group || 'number', tokens);
  }
}
