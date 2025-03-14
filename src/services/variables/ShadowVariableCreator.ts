/**
 * ShadowVariableCreator
 * シャドウ（エフェクト）変数の作成を担当するクラス
 */
import { BaseVariableCreator } from './BaseVariableCreator';
import { CollectionType, ICollectionManager } from '../figmaServiceTypes';

/**
 * シャドウ変数作成クラス
 */
export class ShadowVariableCreator extends BaseVariableCreator {
  /**
   * コンストラクタ
   * @param {ICollectionManager} collectionManager コレクション管理オブジェクト
   */
  constructor(collectionManager: ICollectionManager) {
    super(collectionManager);
  }

  /**
   * シャドウ変数を作成する
   * @param {string} name 変数名
   * @param {EffectValue[]} lightValue Light モードの値
   * @param {EffectValue[]} darkValue Dark モードの値
   * @param {string} [group] グループ名
   * @returns {Variable | null} 作成した変数またはnull
   */
  createVariable(name: string, lightValue: EffectValue[], darkValue: EffectValue[], group?: string): Variable | null {
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
        'EFFECT'
      );
      
      // 値を設定
      this.updateVariableValues(variable, lightValue, darkValue);
      
      // 変数をキャッシュに追加
      this.collectionManager.addToCache(variable);
      
      return variable;
    } catch (error) {
      figma.notify(`Failed to create shadow variable "${name}": ${error}`, { error: true });
      return null;
    }
  }

  /**
   * シャドウ変数の値を更新する
   * @protected
   * @param {Variable} variable 更新する変数
   * @param {EffectValue[]} lightValue Light モードの値
   * @param {EffectValue[]} darkValue Dark モードの値
   */
  protected updateVariableValues(variable: Variable, lightValue: EffectValue[], darkValue: EffectValue[]): void {
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
   * シャドウ変数を作成する
   * @param {Record<string, EffectValue[]>} lightShadows Light モードのシャドウ
   * @param {Record<string, EffectValue[]>} darkShadows Dark モードのシャドウ
   * @param {string} [group='shadow'] グループ名
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createShadowVariables(
    lightShadows: Record<string, EffectValue[]>,
    darkShadows: Record<string, EffectValue[]>,
    group: string = 'shadow'
  ): Record<string, Variable | null> {
    const variables: Record<string, Variable | null> = {};
    
    // 各シャドウに対して変数を作成
    for (const [key, lightValue] of Object.entries(lightShadows)) {
      // ダークモードの値を取得（存在しない場合はライトモードの値を使用）
      const darkValue = darkShadows[key] || lightValue;
      
      // 変数を作成
      const variable = this.createVariable(key, lightValue, darkValue, group);
      
      if (variable) {
        variables[key] = variable;
      } else {
        variables[key] = null;
      }
    }
    
    return variables;
  }

  /**
   * シャドウトークン作成のショートカットメソッド
   * @param {Record<string, EffectValue[]>} tokens シャドウトークン
   * @param {string} [group] グループ名
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createShadowTokens(tokens: Record<string, EffectValue[]>, group?: string): Record<string, Variable | null> {
    // 同じトークンをライトモードとダークモードの両方に使用（簡易実装）
    return this.createShadowVariables(tokens, tokens, group || 'shadow');
  }
}
