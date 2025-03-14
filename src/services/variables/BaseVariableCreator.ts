/**
 * BaseVariableCreator
 * 変数作成の基底クラス
 */
import { ICollectionManager, CollectionType, IVariableCreator } from '../figmaServiceTypes';

/**
 * 変数作成の基底クラス
 */
export abstract class BaseVariableCreator implements IVariableCreator {
  protected collectionManager: ICollectionManager;

  /**
   * コンストラクタ
   * @param {ICollectionManager} collectionManager コレクション管理オブジェクト
   */
  constructor(collectionManager: ICollectionManager) {
    this.collectionManager = collectionManager;
  }

  /**
   * 変数を作成する
   * @param {string} name 変数名
   * @param {any} lightValue Light モードの値
   * @param {any} darkValue Dark モードの値
   * @param {string} [group] グループ名
   * @returns {Variable | null} 作成した変数またはnull
   */
  abstract createVariable(name: string, lightValue: any, darkValue: any, group?: string): Variable | null;

  /**
   * 複数の変数を作成する
   * @param {string[]} names 変数名の配列
   * @param {any[]} lightValues Light モードの値の配列
   * @param {any[]} darkValues Dark モードの値の配列
   * @param {string} [group] グループ名
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createVariables(names: string[], lightValues: any[], darkValues: any[], group?: string): Record<string, Variable | null> {
    const variables: Record<string, Variable | null> = {};
    
    // 配列の長さが一致するかチェック
    const length = Math.min(names.length, lightValues.length, darkValues.length);
    
    for (let i = 0; i < length; i++) {
      const name = names[i];
      const lightValue = lightValues[i];
      const darkValue = darkValues[i];
      
      const variable = this.createVariable(name, lightValue, darkValue, group);
      variables[name] = variable;
    }
    
    return variables;
  }

  /**
   * 変数値を更新する（抽象メソッド）
   * @protected
   * @param {Variable} variable 更新する変数
   * @param {any} lightValue Light モードの値
   * @param {any} darkValue Dark モードの値
   */
  protected abstract updateVariableValues(variable: Variable, lightValue: any, darkValue: any): void;

  /**
   * 変数の基本情報を準備する
   * @protected
   * @param {string} name 変数名
   * @param {string} [group] グループ名
   * @param {CollectionType} collectionType コレクションタイプ
   * @returns {{ variableName: string, collection: VariableCollection | null, existingVariable: Variable | null }}
   */
  protected prepareVariableBase(name: string, group: string | undefined, collectionType: CollectionType): {
    variableName: string;
    collection: VariableCollection | null;
    existingVariable: Variable | null;
  } {
    // グループ付きの場合は名前を変更
    const variableName = group ? `${group}/${name}` : name;
    
    // 既存の変数をチェック
    const existingVariable = this.collectionManager.findVariableByName(
      variableName, 
      collectionType
    );
    
    // コレクションを取得
    const collection = this.collectionManager.getCollection(collectionType);
    
    return { variableName, collection, existingVariable };
  }
}
