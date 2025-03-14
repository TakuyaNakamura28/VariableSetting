/**
 * CollectionManager
 * Figma変数コレクションの管理を担当するクラス
 */

import { CollectionType, VariableMode, ICollectionManager } from '../services/figmaServiceTypes';

/**
 * 変数コレクション管理クラス
 */
export class CollectionManager implements ICollectionManager {
  private collections: Map<CollectionType, VariableCollection | null> = new Map();
  private collectionModes: Map<CollectionType, Map<VariableMode, string>> = new Map();
  private variableCache: Map<string, Variable> = new Map();

  /**
   * 変数コレクションを初期化する
   * @returns {Promise<boolean>} 初期化が成功したかどうか
   */
  async initializeCollections(): Promise<boolean> {
    try {
      // プリミティブ変数用コレクション
      await this.initializeCollection(CollectionType.Primitives);

      // セマンティック変数用コレクション
      await this.initializeCollection(CollectionType.Semantic);

      // コンポーネント変数用コレクション
      await this.initializeCollection(CollectionType.Components);

      return true;
    } catch (error) {
      figma.notify(`Error initializing collections: ${error}`, { error: true });
      return false;
    }
  }

  /**
   * 変数名からVariableオブジェクトを取得する
   * @param {string} name 変数名
   * @param {CollectionType} collectionType コレクションタイプ
   * @returns {Variable | null} 変数オブジェクトまたはnull
   */
  findVariableByName(name: string, collectionType: CollectionType): Variable | null {
    // キャッシュをまず検索
    const collectionName = this.getCollectionNameFromType(collectionType);
    const key = `${collectionName}/${name}`;
    
    if (this.variableCache.has(key)) {
      return this.variableCache.get(key) || null;
    }

    // Figmaから変数を検索
    const variables = figma.variables.getLocalVariables();
    const collection = this.getCollection(collectionType);
    
    if (!collection) {
      figma.notify(`Collection ${collectionType} not found`, { error: true });
      return null;
    }
    
    const variable = variables.find(v => 
      v.name === name && 
      v.collectionId === collection.id
    );
    
    if (variable) {
      this.variableCache.set(key, variable);
    }
    
    return variable || null;
  }

  /**
   * Lightモードのモード ID を取得する
   * @param {CollectionType} collectionType コレクションタイプ
   * @returns {string | null} モードID
   */
  getLightModeId(collectionType: CollectionType): string | null {
    return this.getModeId(collectionType, VariableMode.Light);
  }

  /**
   * Darkモードのモード ID を取得する
   * @param {CollectionType} collectionType コレクションタイプ
   * @returns {string | null} モードID
   */
  getDarkModeId(collectionType: CollectionType): string | null {
    return this.getModeId(collectionType, VariableMode.Dark);
  }

  /**
   * 指定されたコレクションタイプのコレクションを取得する
   * @param {CollectionType} collectionType コレクションタイプ
   * @returns {VariableCollection | null} コレクションまたはnull
   */
  getCollection(collectionType: CollectionType): VariableCollection | null {
    return this.collections.get(collectionType) || null;
  }

  /**
   * 変数のコレクション名を取得する
   * @param {Variable} variable 変数
   * @returns {string | null} コレクション名またはnull
   */
  getCollectionNameForVariable(variable: Variable): string | null {
    const collections = figma.variables.getLocalVariableCollections();
    const collection = collections.find(c => c.id === variable.collectionId);
    return collection ? collection.name : null;
  }

  /**
   * 変数をキャッシュに追加する
   * @param {Variable} variable 追加する変数
   */
  addToCache(variable: Variable): void {
    const collectionName = this.getCollectionNameForVariable(variable);
    if (collectionName) {
      const key = `${collectionName}/${variable.name}`;
      this.variableCache.set(key, variable);
    }
  }

  /**
   * すべての変数コレクションをクリアする
   */
  clearAllVariables(): void {
    const variables = figma.variables.getLocalVariables();
    variables.forEach(variable => {
      try {
        variable.remove();
      } catch (error) {
        figma.notify(`Failed to remove variable ${variable.name}: ${error}`, { error: true });
      }
    });
    
    this.variableCache.clear();
    this.collections.clear();
    this.collectionModes.clear();
    
    figma.notify('All variables cleared');
  }

  // Private methods

  /**
   * 指定されたコレクションタイプとモードのモードIDを取得する
   * @private
   * @param {CollectionType} collectionType コレクションタイプ
   * @param {VariableMode} mode モード
   * @returns {string | null} モードID
   */
  private getModeId(collectionType: CollectionType, mode: VariableMode): string | null {
    if (!this.collectionModes.has(collectionType)) {
      return null;
    }
    
    const modes = this.collectionModes.get(collectionType);
    if (!modes) {
      return null;
    }
    
    return modes.get(mode) || null;
  }

  /**
   * コレクションを初期化する
   * @private
   * @param {CollectionType} collectionType コレクションタイプ
   */
  private async initializeCollection(collectionType: CollectionType): Promise<void> {
    const collectionName = this.getCollectionNameFromType(collectionType);
    let collection: VariableCollection | null = null;
    
    // 既存のコレクションをチェック
    const existingCollections = figma.variables.getLocalVariableCollections();
    collection = existingCollections.find(c => c.name === collectionName) || null;
    
    // コレクションが存在しない場合は作成
    if (!collection) {
      collection = figma.variables.createVariableCollection(collectionName);
      figma.notify(`Created new collection: ${collectionName}`);
    } else {
      figma.notify(`Found existing collection: ${collectionName}`);
    }
    
    // コレクションを保存
    this.collections.set(collectionType, collection);
    
    // モードを初期化
    const modes = new Map<VariableMode, string>();
    
    // Lightモードを探索または作成
    let lightMode = collection.modes.find(m => m.name === VariableMode.Light);
    if (!lightMode) {
      collection.addMode(VariableMode.Light);
      lightMode = collection.modes.find(m => m.name === VariableMode.Light);
    }
    
    if (lightMode) {
      modes.set(VariableMode.Light, lightMode.modeId);
    }
    
    // Darkモードを探索または作成
    let darkMode = collection.modes.find(m => m.name === VariableMode.Dark);
    if (!darkMode) {
      collection.addMode(VariableMode.Dark);
      darkMode = collection.modes.find(m => m.name === VariableMode.Dark);
    }
    
    if (darkMode) {
      modes.set(VariableMode.Dark, darkMode.modeId);
    }
    
    // モードを保存
    this.collectionModes.set(collectionType, modes);
  }

  /**
   * コレクションタイプから名前を取得
   * @private
   * @param {CollectionType} type コレクションタイプ
   * @returns {string} コレクション名
   */
  private getCollectionNameFromType(type: CollectionType): string {
    switch (type) {
      case CollectionType.Primitives:
        return 'Primitives';
      case CollectionType.Semantic:
        return 'Semantic';
      case CollectionType.Components:
        return 'Components';
      default:
        return 'Unknown';
    }
  }
}
