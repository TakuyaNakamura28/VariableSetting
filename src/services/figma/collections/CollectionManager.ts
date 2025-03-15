/**
 * CollectionManager クラス
 * Figma の変数コレクションを管理するためのクラス
 */
import { ICollectionManager } from '../interfaces/ICollectionManager';
import { FigmaServiceBase } from '../base/FigmaServiceBase';
import { VariableCollection, VariableMode } from '../../figmaServiceTypes';

/**
 * Figma の変数コレクションを管理するクラス
 * 単一責任原則に従い、コレクション管理に特化した機能を提供
 */
export class CollectionManager extends FigmaServiceBase implements ICollectionManager {
  private collections: Map<string, VariableCollection>;
  private defaultCollectionId: string | null = null;
  private fileKey: string;
  private api: any; // Figma API クライアント

  /**
   * コンストラクタ
   * @param {string} fileKey Figma ファイルのキー
   * @param {any} api Figma API クライアント
   */
  constructor(fileKey: string, api: any) {
    super('CollectionManager');
    this.collections = new Map<string, VariableCollection>();
    this.fileKey = fileKey;
    this.api = api;
    this.info('CollectionManager が初期化されました');
  }

  /**
   * 変数コレクションを初期化する
   * @param {string} collectionName コレクション名
   * @returns {Promise<string>} 作成されたコレクションの ID
   */
  public async initializeCollection(collectionName: string): Promise<string> {
    try {
      this.info(`コレクション "${collectionName}" の初期化を開始します`);

      // コレクションがすでに存在するか確認
      const existingId = await this.getCollectionIdByName(collectionName);
      if (existingId) {
        this.info(`コレクション "${collectionName}" はすでに存在します (ID: ${existingId})`);
        // デフォルトコレクションとして設定
        this.defaultCollectionId = existingId;
        return existingId;
      }

      // 新しいコレクションを作成
      const response = await this.api.createVariableCollection({
        file_key: this.fileKey,
        name: collectionName,
        modes: [
          { name: VariableMode.Light, modeId: '1:0' },
          { name: VariableMode.Dark, modeId: '1:1' }
        ]
      });

      if (!response || !response.variable_collection_id) {
        throw new Error('コレクション作成APIの応答に variable_collection_id が含まれていません');
      }

      const collectionId = response.variable_collection_id;
      this.info(`新しいコレクション "${collectionName}" が作成されました (ID: ${collectionId})`);

      // キャッシュを更新
      await this.refreshCollections();

      // デフォルトコレクションとして設定
      this.defaultCollectionId = collectionId;
      return collectionId;
    } catch (error) {
      this.error(`コレクション "${collectionName}" の初期化中にエラーが発生しました`, error);
      throw error;
    }
  }

  /**
   * コレクション名から ID を取得する
   * @param {string} name コレクション名
   * @returns {Promise<string | null>} コレクション ID（存在しない場合は null）
   */
  public async getCollectionIdByName(name: string): Promise<string | null> {
    try {
      await this.refreshCollections();
      
      for (const [id, collection] of this.collections.entries()) {
        if (collection.name === name) {
          return id;
        }
      }
      
      this.warn(`名前 "${name}" のコレクションは見つかりませんでした`);
      return null;
    } catch (error) {
      this.error(`コレクション名 "${name}" の検索中にエラーが発生しました`, error);
      throw error;
    }
  }

  /**
   * コレクション ID からコレクションを取得する
   * @param {string} id コレクション ID
   * @returns {Promise<VariableCollection | null>} 変数コレクション（存在しない場合は null）
   */
  public async getCollectionById(id: string): Promise<VariableCollection | null> {
    try {
      await this.refreshCollections();
      
      const collection = this.collections.get(id);
      if (!collection) {
        this.warn(`ID "${id}" のコレクションは見つかりませんでした`);
        return null;
      }
      
      return collection;
    } catch (error) {
      this.error(`コレクション ID "${id}" の取得中にエラーが発生しました`, error);
      throw error;
    }
  }

  /**
   * すべてのコレクションを取得する
   * @returns {Promise<Map<string, VariableCollection>>} ID をキーとしたコレクションのマップ
   */
  public async getAllCollections(): Promise<Map<string, VariableCollection>> {
    try {
      await this.refreshCollections();
      return this.collections;
    } catch (error) {
      this.error('すべてのコレクションの取得中にエラーが発生しました', error);
      throw error;
    }
  }

  /**
   * コレクションが存在するかどうかを確認する
   * @param {string} name コレクション名
   * @returns {Promise<boolean>} 存在する場合は true
   */
  public async collectionExists(name: string): Promise<boolean> {
    const id = await this.getCollectionIdByName(name);
    return id !== null;
  }

  /**
   * デフォルトコレクション ID を取得する
   * @returns {Promise<string>} デフォルトコレクション ID
   * @throws {Error} デフォルトコレクションが設定されていない場合
   */
  public async getDefaultCollectionId(): Promise<string> {
    if (!this.defaultCollectionId) {
      throw new Error('デフォルトコレクションが設定されていません。まず initializeCollection を呼び出してください。');
    }
    return this.defaultCollectionId;
  }

  /**
   * コレクションのキャッシュを更新する
   * @private
   * @returns {Promise<void>}
   */
  private async refreshCollections(): Promise<void> {
    try {
      this.debug('変数コレクションのキャッシュを更新します');
      
      const response = await this.api.getVariableCollections({
        file_key: this.fileKey
      });
      
      if (!response || !response.variable_collections) {
        throw new Error('コレクション取得APIの応答に variable_collections が含まれていません');
      }
      
      // キャッシュをクリアして更新
      this.collections.clear();
      
      for (const collection of response.variable_collections) {
        if (collection.id) {
          this.collections.set(collection.id, collection);
        }
      }
      
      this.debug(`${this.collections.size} 個のコレクションがキャッシュされました`);
    } catch (error) {
      this.error('コレクションのキャッシュ更新中にエラーが発生しました', error);
      throw error;
    }
  }
}
