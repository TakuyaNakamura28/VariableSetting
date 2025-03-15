/**
 * CollectionManagerService
 * Figma変数コレクションの管理を担当するクラス
 */

import { CollectionType, VariableMode, ICollectionManager } from '../services/figmaServiceTypes';

/**
 * コレクション名の定義
 */
const COLLECTION_NAMES: Record<CollectionType, string> = {
  [CollectionType.Primitives]: 'Design System/Primitives',
  [CollectionType.Semantic]: 'Design System/Semantic',
  [CollectionType.Components]: 'Design System/Components'
};

/**
 * 変数コレクション管理クラス
 */
export class CollectionManagerService implements ICollectionManager {
  private readonly collections: Map<CollectionType, VariableCollection | null> = new Map();
  private readonly collectionModes: Map<CollectionType, Map<VariableMode, string>> = new Map();
  private readonly variableCache: Map<string, Variable> = new Map();

  /**
   * シングルトンインスタンス
   */
  private static instance: CollectionManagerService;

  /**
   * シングルトンインスタンスを取得する
   */
  static getInstance(): CollectionManagerService {
    if (!CollectionManagerService.instance) {
      CollectionManagerService.instance = new CollectionManagerService();
    }
    return CollectionManagerService.instance;
  }

  /**
   * プライベートコンストラクタ（シングルトンパターン）
   */
  private constructor() {}

  /**
   * 変数コレクションを初期化する
   * @returns {Promise<boolean>} 初期化が成功したかどうか
   */
  async initializeCollections(): Promise<boolean> {
    try {
      // すべての既存コレクションを取得
      const allCollections = figma.variables.getLocalVariableCollections();
      
      // 各コレクションタイプごとに初期化
      for (const type of Object.values(CollectionType)) {
        await this.initializeCollection(type, allCollections);
      }
      
      // 既存の変数をキャッシュ
      this.cacheExistingVariables();
      
      return true;
    } catch (error) {
      figma.notify(`Error initializing collections: ${error}`, { error: true });
      return false;
    }
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
   * 変数名からVariableオブジェクトを取得する
   * @param {string} name 変数名
   * @param {CollectionType} collectionType コレクションタイプ
   * @returns {Variable | null} 変数オブジェクトまたはnull
   */
  findVariableByName(name: string, collectionType: CollectionType): Variable | null {
    // キャッシュをまず検索
    const collectionName = COLLECTION_NAMES[collectionType];
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
      v.variableCollectionId === collection.id
    );
    
    if (variable) {
      this.variableCache.set(key, variable);
    }
    
    return variable || null;
  }

  /**
   * コレクション名からコレクションタイプを取得する
   * @param {string} collectionName コレクション名
   * @returns {CollectionType | null} コレクションタイプまたはnull
   */
  getCollectionTypeFromName(collectionName: string): CollectionType | null {
    for (const [type, name] of Object.entries(COLLECTION_NAMES)) {
      if (name === collectionName) {
        return type as CollectionType;
      }
    }
    return null;
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
   * 変数のコレクション名を取得する
   * @param {Variable} variable 変数
   * @returns {string | null} コレクション名またはnull
   */
  getCollectionNameForVariable(variable: Variable): string | null {
    const collections = figma.variables.getLocalVariableCollections();
    const collection = collections.find(c => c.id === variable.variableCollectionId);
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
   * 色変数を作成または更新する
   * @param {string} name 変数名
   * @param {string} lightValue ライトモードの色値（HEX形式）
   * @param {string} darkValue ダークモードの色値（HEX形式）
   * @param {CollectionType} collectionType コレクションタイプ
   * @returns {Variable | null} 作成または更新された変数、失敗時はnull
   */
  createColorVariable(
    name: string, 
    lightValue: string, 
    darkValue: string, 
    collectionType: CollectionType
  ): Variable | null {
    try {
      // 指定されたコレクションを取得
      const collection = this.getCollection(collectionType);
      if (!collection) {
        figma.notify(`Collection ${COLLECTION_NAMES[collectionType]} not found`, { error: true });
        return null;
      }
      
      // モードIDを取得
      const lightModeId = this.getLightModeId(collectionType);
      const darkModeId = this.getDarkModeId(collectionType);
      
      if (!lightModeId || !darkModeId) {
        figma.notify(`Mode IDs not found for collection ${COLLECTION_NAMES[collectionType]}`, { error: true });
        return null;
      }
      
      // 色値をRGBAに変換
      const lightRgba = this.hexToRgba(lightValue);
      const darkRgba = this.hexToRgba(darkValue);
      
      if (!lightRgba || !darkRgba) {
        figma.notify(`Invalid color values: light=${lightValue}, dark=${darkValue}`, { error: true });
        return null;
      }
      
      // 既存の変数を検索
      let variable = this.findVariableByName(name, collectionType);
      
      if (variable) {
        // 既存の変数を更新
        this.updateVariableValue(variable, lightRgba, darkRgba);
        figma.notify(`変数を更新しました: ${name}`);
      } else {
        // 新しい変数を作成
        variable = figma.variables.createVariable(name, collection.id, 'COLOR');
        
        // ライトモードとダークモードの値を設定
        variable.setValueForMode(lightModeId, lightRgba);
        variable.setValueForMode(darkModeId, darkRgba);
        
        // キャッシュに追加
        this.addToCache(variable);
        
        figma.notify(`新しい変数を作成しました: ${name}`);
      }
      
      return variable;
    } catch (error) {
      figma.notify(`変数の作成中にエラーが発生しました: ${error}`, { error: true });
      return null;
    }
  }

  /**
   * 変数の値を更新する
   * @param {Variable} variable 更新する変数
   * @param {RGBA} lightValue ライトモードの色値
   * @param {RGBA} darkValue ダークモードの色値
   * @returns {boolean} 更新が成功したかどうか
   */
  updateVariableValue(variable: Variable, lightValue: RGBA, darkValue: RGBA): boolean {
    try {
      // 変数のコレクションIDを取得
      const collectionId = variable.variableCollectionId;
      
      // コレクションタイプを特定
      let collectionType: CollectionType | null = null;
      for (const [type, collection] of this.collections.entries()) {
        if (collection?.id === collectionId) {
          collectionType = type;
          break;
        }
      }
      
      if (!collectionType) {
        figma.notify(`Collection not found for variable ${variable.name}`, { error: true });
        return false;
      }
      
      const lightModeId = this.getLightModeId(collectionType);
      const darkModeId = this.getDarkModeId(collectionType);
      
      if (!lightModeId || !darkModeId) {
        figma.notify(`Mode IDs not found for collection ${COLLECTION_NAMES[collectionType]}`, { error: true });
        return false;
      }
      
      // ライトモードの値を設定
      variable.setValueForMode(lightModeId, lightValue);
      
      // ダークモードの値を設定
      variable.setValueForMode(darkModeId, darkValue);
      
      figma.notify(`更新された変数: ${variable.name}`);
      return true;
    } catch (error) {
      figma.notify(`変数の更新中にエラーが発生しました: ${error}`, { error: true });
      return false;
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

  /**
   * コレクションタイプからコレクション名を取得
   * @param {CollectionType} type コレクションタイプ
   * @returns {string} コレクション名
   */
  getCollectionNameFromType(type: CollectionType): string {
    return COLLECTION_NAMES[type];
  }

  /**
   * 既存の変数をキャッシュする
   */
  public cacheExistingVariables(): void {
    this.variableCache.clear();
    const variables = figma.variables.getLocalVariables();
    
    // すべてのコレクションの変数をキャッシュ
    for (const [collectionType, collectionName] of Object.entries(COLLECTION_NAMES)) {
      const collection = this.collections.get(collectionType as CollectionType);
      if (!collection) continue;
      
      const collectionVars = variables.filter(v => 
        v.variableCollectionId === collection.id
      );
      
      collectionVars.forEach(variable => {
        // コレクション名をプレフィックスに含めてキャッシュ
        this.variableCache.set(`${collectionName}/${variable.name}`, variable);
      });
    }
    
    figma.notify(`キャッシュされた変数数: ${this.variableCache.size}`);
  }

  /**
   * HEX色表記をRGBA形式に変換する
   * @private
   * @param {string} hex HEX色表記 (#RRGGBB 形式)
   * @returns {RGBA | null} RGBA形式のオブジェクト、無効なHEX値の場合はnull
   */
  private hexToRgba(hex: string): RGBA | null {
    try {
      // #を取り除く
      const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
      
      // HEX値が無効な場合はnullを返す
      if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
        return null;
      }
      
      // 色成分を取得
      const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
      const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
      const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
      
      // RGBA形式で返す
      return { r, g, b, a: 1 };
    } catch (error) {
      figma.notify(`HEX to RGBA conversion error: ${error}`, { error: true });
      return null;
    }
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
   * @param {VariableCollection[]} existingCollections 既存のコレクション一覧
   */
  private async initializeCollection(
    collectionType: CollectionType, 
    existingCollections: VariableCollection[]
  ): Promise<void> {
    const collectionName = COLLECTION_NAMES[collectionType];
    let collection: VariableCollection | null = null;
    
    // 既存のコレクションをチェック
    collection = existingCollections.find(c => c.name === collectionName) || null;
    
    // コレクションが存在しない場合は作成
    if (!collection) {
      collection = figma.variables.createVariableCollection(collectionName);
      
      // Mode 1をLightモードとして活用する（名前を変更）
      const modes = collection.modes;
      if (modes.length > 0 && modes[0].name === 'Mode 1') {
        // Mode 1の名前をLightに変更
        collection.renameMode(modes[0].modeId, VariableMode.Light);
        
        // Darkモードのみ追加
        collection.addMode(VariableMode.Dark);
        figma.notify(`Mode 1 を Light に変更し、Dark モードを追加しました: "${collectionName}"`);
      } else {
        // 何らかの理由でMode 1が存在しない場合は通常通り追加
        collection.addMode(VariableMode.Light);
        collection.addMode(VariableMode.Dark);
        figma.notify(`Light と Dark モードを追加しました: "${collectionName}"`);
      }
      
      figma.notify(`コレクションを作成しました: "${collectionName}"`);
    } else {
      // 既存コレクションの場合もMode 1を確認して名前変更
      const modes = collection.modes;
      for (const mode of modes) {
        if (mode.name === 'Mode 1') {
          collection.renameMode(mode.modeId, VariableMode.Light);
          figma.notify(`既存コレクションの Mode 1 を Light に変更しました: "${collectionName}"`);
          break;
        }
      }
      figma.notify(`既存コレクションを使用: "${collectionName}"`);
    }
    
    // コレクションを保存
    this.collections.set(collectionType, collection);
    
    // モードを初期化
    const modes = new Map<VariableMode, string>();
    
    // Lightモードを探索
    const lightMode = collection.modes.find(m => m.name === VariableMode.Light);
    if (lightMode) {
      modes.set(VariableMode.Light, lightMode.modeId);
    }
    
    // Darkモードを探索
    const darkMode = collection.modes.find(m => m.name === VariableMode.Dark);
    if (darkMode) {
      modes.set(VariableMode.Dark, darkMode.modeId);
    }
    
    // モードを保存
    this.collectionModes.set(collectionType, modes);
  }
}
