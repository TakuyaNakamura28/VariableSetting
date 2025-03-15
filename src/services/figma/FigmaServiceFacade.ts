/**
 * FigmaServiceFacade クラス
 * Figma関連サービスへのアクセスを統合するファサード
 */
import { FigmaServiceBase } from './base/FigmaServiceBase';
import { FigmaServiceFactory } from './FigmaServiceFactory';
import { VariableService } from './variables/VariableService';
import { CollectionManager } from './collections/CollectionManager';
import { ColorUtils } from './utils/ColorUtils';
import { 
  VariableMode,
  VariableType,
  Variable,
  VariableCollection
} from '../figmaServiceTypes';

/**
 * Figmaサービスへのアクセスを統合するファサード
 * Facadeパターンに従い、複雑なサブシステムに対して単一のインターフェースを提供
 */
export class FigmaServiceFacade extends FigmaServiceBase {
  private factory: FigmaServiceFactory;
  private variableService: VariableService;
  private collectionManager: CollectionManager;
  private colorUtils: ColorUtils;
  private fileKey: string;

  /**
   * コンストラクタ
   * @param {string} fileKey Figma ファイルのキー
   * @param {any} api Figma API クライアント
   */
  constructor(fileKey: string, api: any) {
    super('FigmaServiceFacade');
    this.fileKey = fileKey;
    
    // FigmaServiceFactoryのインスタンスを取得
    this.factory = FigmaServiceFactory.getInstance(fileKey, api);
    
    // 各サービスのインスタンスを取得
    this.variableService = this.factory.getVariableService();
    this.collectionManager = this.factory.getCollectionManager();
    this.colorUtils = this.factory.getColorUtils();
    
    this.info('FigmaServiceFacade が初期化されました');
  }

  /**
   * 指定されたコレクションを初期化または取得する
   * @param {string} collectionName コレクション名
   * @returns {Promise<string>} コレクション ID
   */
  public async initializeCollection(collectionName: string): Promise<string> {
    return this.collectionManager.initializeCollection(collectionName);
  }

  /**
   * コレクション名から ID を取得する
   * @param {string} name コレクション名
   * @returns {Promise<string | null>} コレクション ID（存在しない場合は null）
   */
  public async getCollectionIdByName(name: string): Promise<string | null> {
    return this.collectionManager.getCollectionIdByName(name);
  }

  /**
   * コレクションが存在するかどうかを確認する
   * @param {string} name コレクション名
   * @returns {Promise<boolean>} 存在する場合は true
   */
  public async collectionExists(name: string): Promise<boolean> {
    return this.collectionManager.collectionExists(name);
  }

  /**
   * すべてのコレクションを取得する
   * @returns {Promise<Map<string, VariableCollection>>} ID をキーとしたコレクションのマップ
   */
  public async getAllCollections(): Promise<Map<string, VariableCollection>> {
    return this.collectionManager.getAllCollections();
  }

  /**
   * カラー変数を作成する
   * @param {string} name 変数名
   * @param {string} lightValue ライトモードの色値
   * @param {string} darkValue ダークモードの色値
   * @param {string} [collectionName] コレクション名（省略時はデフォルトコレクションを使用）
   * @param {string} [group] 変数グループ（省略可能）
   * @returns {Promise<Variable | null>} 作成された変数または null
   */
  public async createColorVariable(
    name: string,
    lightValue: string,
    darkValue: string,
    collectionName?: string,
    group?: string
  ): Promise<Variable | null> {
    return this.variableService.createColorVariable(name, lightValue, darkValue, collectionName, group);
  }

  /**
   * 数値変数を作成する
   * @param {string} name 変数名
   * @param {number} lightValue ライトモードの数値
   * @param {number} darkValue ダークモードの数値
   * @param {string} [collectionName] コレクション名（省略時はデフォルトコレクションを使用）
   * @param {string} [group] 変数グループ（省略可能）
   * @returns {Promise<Variable | null>} 作成された変数または null
   */
  public async createNumberVariable(
    name: string,
    lightValue: number,
    darkValue: number,
    collectionName?: string,
    group?: string
  ): Promise<Variable | null> {
    return this.variableService.createNumberVariable(name, lightValue, darkValue, collectionName, group);
  }

  /**
   * 文字列変数を作成する
   * @param {string} name 変数名
   * @param {string} lightValue ライトモードの文字列
   * @param {string} darkValue ダークモードの文字列
   * @param {string} [collectionName] コレクション名（省略時はデフォルトコレクションを使用）
   * @param {string} [group] 変数グループ（省略可能）
   * @returns {Promise<Variable | null>} 作成された変数または null
   */
  public async createStringVariable(
    name: string,
    lightValue: string,
    darkValue: string,
    collectionName?: string,
    group?: string
  ): Promise<Variable | null> {
    return this.variableService.createStringVariable(name, lightValue, darkValue, collectionName, group);
  }

  /**
   * 変数を ID で取得する
   * @param {string} variableId 変数 ID
   * @returns {Promise<Variable | null>} 変数または null
   */
  public async getVariable(variableId: string): Promise<Variable | null> {
    return this.variableService.getVariable(variableId);
  }

  /**
   * 変数を名前で検索する
   * @param {string} name 変数名
   * @param {string} [collectionId] コレクション ID（省略時はすべてのコレクションを検索）
   * @returns {Promise<Variable[]>} 見つかった変数の配列
   */
  public async findVariablesByName(name: string, collectionId?: string): Promise<Variable[]> {
    return this.variableService.findVariablesByName(name, collectionId);
  }

  /**
   * 変数を削除する
   * @param {string} variableId 変数 ID
   * @returns {Promise<boolean>} 削除に成功した場合は true
   */
  public async deleteVariable(variableId: string): Promise<boolean> {
    return this.variableService.deleteVariable(variableId);
  }

  /**
   * 変数の値を更新する
   * @param {string} variableId 変数 ID
   * @param {any} lightValue ライトモードの新しい値
   * @param {any} darkValue ダークモードの新しい値
   * @returns {Promise<boolean>} 更新に成功した場合は true
   */
  public async updateVariableValues(
    variableId: string,
    lightValue: any,
    darkValue: any
  ): Promise<boolean> {
    return this.variableService.updateVariableValues(variableId, lightValue, darkValue);
  }

  /**
   * HEX形式の色をFigmaのRGBA形式に変換
   * @param {string} hex HEX形式の色
   * @returns {RGBA} Figmaの色オブジェクト
   */
  public hexToFigmaColor(hex: string): RGBA {
    return this.colorUtils.hexToFigmaColor(hex);
  }

  /**
   * FigmaのRGBA形式をHEX形式に変換
   * @param {RGBA} color Figmaの色オブジェクト
   * @returns {string} HEX形式の色
   */
  public figmaColorToHex(color: RGBA): string {
    return this.colorUtils.figmaColorToHex(color);
  }

  /**
   * 色を標準HEX形式に変換
   * @param {string} colorStr 色を表す文字列
   * @returns {string} 標準化されたHEX形式の色
   */
  public parseColor(colorStr: string): string {
    return this.colorUtils.parseColor(colorStr);
  }

  /**
   * 色を明るくする
   * @param {string} hex 元の色（HEX）
   * @param {number} amount 明るくする量（0-1）
   * @returns {string} 明るくした色（HEX）
   */
  public lightenColor(hex: string, amount: number): string {
    return this.colorUtils.lighten(hex, amount);
  }

  /**
   * 色を暗くする
   * @param {string} hex 元の色（HEX）
   * @param {number} amount 暗くする量（0-1）
   * @returns {string} 暗くした色（HEX）
   */
  public darkenColor(hex: string, amount: number): string {
    return this.colorUtils.darken(hex, amount);
  }

  /**
   * 複数のカラー変数を一括作成する
   * @param {Array<{name: string, lightValue: string, darkValue: string, group?: string}>} variables 変数情報の配列
   * @param {string} [collectionName] コレクション名（省略時はデフォルトコレクションを使用）
   * @returns {Promise<Map<string, Variable>>} 変数名をキー、作成された変数を値とするマップ
   */
  public async createMultipleColorVariables(
    variables: Array<{name: string, lightValue: string, darkValue: string, group?: string}>,
    collectionName?: string
  ): Promise<Map<string, Variable>> {
    const result = new Map<string, Variable>();
    
    this.info(`${variables.length} 個のカラー変数を一括作成します`);
    
    // 各変数を作成
    for (const varInfo of variables) {
      const variable = await this.createColorVariable(
        varInfo.name,
        varInfo.lightValue,
        varInfo.darkValue,
        collectionName,
        varInfo.group
      );
      
      if (variable) {
        result.set(varInfo.name, variable);
      }
    }
    
    this.info(`${result.size}/${variables.length} 個の変数が正常に作成されました`);
    return result;
  }

  /**
   * 複数の数値変数を一括作成する
   * @param {Array<{name: string, lightValue: number, darkValue: number, group?: string}>} variables 変数情報の配列
   * @param {string} [collectionName] コレクション名（省略時はデフォルトコレクションを使用）
   * @returns {Promise<Map<string, Variable>>} 変数名をキー、作成された変数を値とするマップ
   */
  public async createMultipleNumberVariables(
    variables: Array<{name: string, lightValue: number, darkValue: number, group?: string}>,
    collectionName?: string
  ): Promise<Map<string, Variable>> {
    const result = new Map<string, Variable>();
    
    this.info(`${variables.length} 個の数値変数を一括作成します`);
    
    // 各変数を作成
    for (const varInfo of variables) {
      const variable = await this.createNumberVariable(
        varInfo.name,
        varInfo.lightValue,
        varInfo.darkValue,
        collectionName,
        varInfo.group
      );
      
      if (variable) {
        result.set(varInfo.name, variable);
      }
    }
    
    this.info(`${result.size}/${variables.length} 個の変数が正常に作成されました`);
    return result;
  }

  /**
   * サービスの設定を更新する
   * @param {string} fileKey 新しい Figma ファイルのキー
   * @param {any} api 新しい Figma API クライアント
   */
  public updateServiceConfiguration(fileKey: string, api: any): void {
    if (this.fileKey !== fileKey) {
      this.fileKey = fileKey;
      this.factory.updateConfiguration(fileKey, api);
      
      // 新しい設定で各サービスのインスタンスを再取得
      this.variableService = this.factory.getVariableService();
      this.collectionManager = this.factory.getCollectionManager();
      this.colorUtils = this.factory.getColorUtils();
      
      this.info('サービス設定が更新されました');
    }
  }

  /**
   * VariableMode 列挙型へのアクセスを提供
   * @returns {{Light: string, Dark: string}} VariableMode 列挙型
   */
  public getVariableModes(): typeof VariableMode {
    return VariableMode;
  }

  /**
   * VariableType 列挙型へのアクセスを提供
   * @returns {typeof VariableType} VariableType 列挙型
   */
  public getVariableTypes(): typeof VariableType {
    return VariableType;
  }
}
