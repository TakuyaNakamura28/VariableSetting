/**
 * FigmaServiceFactory クラス
 * Figma関連サービスのインスタンスを生成するためのファクトリークラス
 */
import { FigmaServiceBase } from './base/FigmaServiceBase';
import { CollectionManager } from './collections/CollectionManager';
import { VariableService } from './variables/VariableService';
import { ColorUtils } from './utils/ColorUtils';

/**
 * Figma関連サービスのインスタンスを生成するためのファクトリークラス
 * Factoryパターンに従い、サービス生成ロジックを集約
 */
export class FigmaServiceFactory extends FigmaServiceBase {
  private static instance: FigmaServiceFactory;
  private fileKey: string;
  private api: any;
  
  // シングルトンインスタンスのキャッシュ
  private serviceInstances: Map<string, any>;

  /**
   * プライベートコンストラクタ
   * @param {string} fileKey Figma ファイルのキー
   * @param {any} api Figma API クライアント
   */
  private constructor(fileKey: string, api: any) {
    super('FigmaServiceFactory');
    this.fileKey = fileKey;
    this.api = api;
    this.serviceInstances = new Map<string, any>();
    this.info('FigmaServiceFactory が初期化されました');
  }

  /**
   * FigmaServiceFactory のシングルトンインスタンスを取得する
   * @param {string} fileKey Figma ファイルのキー
   * @param {any} api Figma API クライアント
   * @returns {FigmaServiceFactory} FigmaServiceFactory インスタンス
   */
  public static getInstance(fileKey: string, api: any): FigmaServiceFactory {
    if (!FigmaServiceFactory.instance) {
      FigmaServiceFactory.instance = new FigmaServiceFactory(fileKey, api);
    }
    return FigmaServiceFactory.instance;
  }

  /**
   * FigmaServiceFactory の設定を更新する
   * @param {string} fileKey 新しい Figma ファイルのキー
   * @param {any} api 新しい Figma API クライアント
   */
  public updateConfiguration(fileKey: string, api: any): void {
    if (this.fileKey !== fileKey || this.api !== api) {
      this.fileKey = fileKey;
      this.api = api;
      // 設定が変更されたため、キャッシュをクリア
      this.serviceInstances.clear();
      this.info('FigmaServiceFactory の設定が更新され、キャッシュがクリアされました');
    }
  }

  /**
   * CollectionManager インスタンスを取得する
   * @returns {CollectionManager} CollectionManager インスタンス
   */
  public getCollectionManager(): CollectionManager {
    const serviceKey = 'CollectionManager';
    
    if (!this.serviceInstances.has(serviceKey)) {
      this.debug(`新しい ${serviceKey} インスタンスを作成します`);
      const instance = new CollectionManager(this.fileKey, this.api);
      this.serviceInstances.set(serviceKey, instance);
    }
    
    return this.serviceInstances.get(serviceKey);
  }

  /**
   * VariableService インスタンスを取得する
   * @returns {VariableService} VariableService インスタンス
   */
  public getVariableService(): VariableService {
    const serviceKey = 'VariableService';
    
    if (!this.serviceInstances.has(serviceKey)) {
      this.debug(`新しい ${serviceKey} インスタンスを作成します`);
      const instance = new VariableService(this.fileKey, this.api);
      this.serviceInstances.set(serviceKey, instance);
    }
    
    return this.serviceInstances.get(serviceKey);
  }

  /**
   * ColorUtils インスタンスを取得する
   * @returns {ColorUtils} ColorUtils インスタンス
   */
  public getColorUtils(): ColorUtils {
    const serviceKey = 'ColorUtils';
    
    if (!this.serviceInstances.has(serviceKey)) {
      this.debug(`新しい ${serviceKey} インスタンスを作成します`);
      const instance = new ColorUtils();
      this.serviceInstances.set(serviceKey, instance);
    }
    
    return this.serviceInstances.get(serviceKey);
  }

  /**
   * すべてのサービスインスタンスを一度に作成し、キャッシュする
   * パフォーマンス最適化のためのユーティリティメソッド
   */
  public preloadAllServices(): void {
    this.info('すべてのサービスをプリロードします');
    this.getCollectionManager();
    this.getVariableService();
    this.getColorUtils();
  }

  /**
   * キャッシュされたサービスインスタンスをクリアする
   */
  public clearServiceCache(): void {
    this.info('サービスキャッシュをクリアします');
    this.serviceInstances.clear();
  }
}
