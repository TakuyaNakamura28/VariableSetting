/**
 * VariableService クラス
 * Figma 変数の作成と管理を行うサービス
 */
import { IVariableService } from '../interfaces/IVariableService';
import { FigmaServiceBase } from '../base/FigmaServiceBase';
import { CollectionManager } from '../collections/CollectionManager';
import { ColorUtils } from '../utils/ColorUtils';
import { 
  VariableMode,
  VariableType,
  Variable,
  VariableValueMap
} from '../../figmaServiceTypes';

/**
 * Figma 変数の作成と管理を行うサービス
 * 単一責任原則に従い、変数管理に特化した機能を提供
 */
export class VariableService extends FigmaServiceBase implements IVariableService {
  private fileKey: string;
  private api: any; // Figma API クライアント
  private collectionManager: CollectionManager;
  private colorUtils: ColorUtils;

  /**
   * コンストラクタ
   * @param {string} fileKey Figma ファイルのキー
   * @param {any} api Figma API クライアント
   */
  constructor(fileKey: string, api: any) {
    super('VariableService');
    this.fileKey = fileKey;
    this.api = api;
    this.collectionManager = new CollectionManager(fileKey, api);
    this.colorUtils = new ColorUtils();
    this.info('VariableService が初期化されました');
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
    try {
      this.info(`カラー変数 "${name}" の作成を開始します`);

      // コレクション ID を取得
      const collectionId = collectionName
        ? await this.collectionManager.initializeCollection(collectionName)
        : await this.collectionManager.getDefaultCollectionId();

      // 色値の標準化
      const lightColor = this.colorUtils.parseColor(lightValue);
      const darkColor = this.colorUtils.parseColor(darkValue);

      // Figma 色形式に変換
      const lightRgba = this.colorUtils.hexToFigmaColor(lightColor);
      const darkRgba = this.colorUtils.hexToFigmaColor(darkColor);

      // 変数の作成リクエスト
      const response = await this.api.createVariable({
        file_key: this.fileKey,
        variable_collection_id: collectionId,
        name: name,
        variable_type: VariableType.Color,
        value: lightRgba, // ライトモードの値をデフォルト値として使用
        scope: 'ALL_SCOPES',
        description: '',
        ...(group && { resolvedType: group })
      });

      if (!response || !response.variable_id) {
        throw new Error(`変数 "${name}" の作成に失敗しました`);
      }

      const variableId = response.variable_id;
      this.info(`変数 "${name}" が作成されました (ID: ${variableId})`);

      // モード別の値を設定
      const modeValues: VariableValueMap = {};
      
      // コレクションを取得してモード ID を特定
      const collection = await this.collectionManager.getCollectionById(collectionId);
      if (!collection || !collection.modes) {
        throw new Error(`コレクション ID "${collectionId}" の取得に失敗しました`);
      }

      // モード ID をマッピング
      const modeIdMap = new Map<string, string>();
      for (const mode of collection.modes) {
        modeIdMap.set(mode.name, mode.modeId);
      }

      // ライトモードとダークモードの値を設定
      const lightModeId = modeIdMap.get(VariableMode.Light);
      const darkModeId = modeIdMap.get(VariableMode.Dark);

      if (!lightModeId || !darkModeId) {
        throw new Error('必要なモード ID が見つかりませんでした');
      }

      modeValues[lightModeId] = lightRgba;
      modeValues[darkModeId] = darkRgba;

      // 変数のモード値を更新
      await this.api.updateVariableModes({
        file_key: this.fileKey,
        variable_id: variableId,
        mode_values: modeValues
      });

      this.info(`変数 "${name}" のモード値が更新されました`);

      // 作成した変数の情報を取得して返す
      const variable = await this.getVariable(variableId);
      return variable;
    } catch (error) {
      this.error(`カラー変数 "${name}" の作成中にエラーが発生しました`, error);
      return null;
    }
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
    try {
      this.info(`数値変数 "${name}" の作成を開始します`);

      // コレクション ID を取得
      const collectionId = collectionName
        ? await this.collectionManager.initializeCollection(collectionName)
        : await this.collectionManager.getDefaultCollectionId();

      // 変数の作成リクエスト
      const response = await this.api.createVariable({
        file_key: this.fileKey,
        variable_collection_id: collectionId,
        name: name,
        variable_type: VariableType.Number,
        value: lightValue, // ライトモードの値をデフォルト値として使用
        scope: 'ALL_SCOPES',
        description: '',
        ...(group && { resolvedType: group })
      });

      if (!response || !response.variable_id) {
        throw new Error(`変数 "${name}" の作成に失敗しました`);
      }

      const variableId = response.variable_id;
      this.info(`変数 "${name}" が作成されました (ID: ${variableId})`);

      // モード別の値を設定
      const modeValues: VariableValueMap = {};
      
      // コレクションを取得してモード ID を特定
      const collection = await this.collectionManager.getCollectionById(collectionId);
      if (!collection || !collection.modes) {
        throw new Error(`コレクション ID "${collectionId}" の取得に失敗しました`);
      }

      // モード ID をマッピング
      const modeIdMap = new Map<string, string>();
      for (const mode of collection.modes) {
        modeIdMap.set(mode.name, mode.modeId);
      }

      // ライトモードとダークモードの値を設定
      const lightModeId = modeIdMap.get(VariableMode.Light);
      const darkModeId = modeIdMap.get(VariableMode.Dark);

      if (!lightModeId || !darkModeId) {
        throw new Error('必要なモード ID が見つかりませんでした');
      }

      modeValues[lightModeId] = lightValue;
      modeValues[darkModeId] = darkValue;

      // 変数のモード値を更新
      await this.api.updateVariableModes({
        file_key: this.fileKey,
        variable_id: variableId,
        mode_values: modeValues
      });

      this.info(`変数 "${name}" のモード値が更新されました`);

      // 作成した変数の情報を取得して返す
      const variable = await this.getVariable(variableId);
      return variable;
    } catch (error) {
      this.error(`数値変数 "${name}" の作成中にエラーが発生しました`, error);
      return null;
    }
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
    try {
      this.info(`文字列変数 "${name}" の作成を開始します`);

      // コレクション ID を取得
      const collectionId = collectionName
        ? await this.collectionManager.initializeCollection(collectionName)
        : await this.collectionManager.getDefaultCollectionId();

      // 変数の作成リクエスト
      const response = await this.api.createVariable({
        file_key: this.fileKey,
        variable_collection_id: collectionId,
        name: name,
        variable_type: VariableType.String,
        value: lightValue, // ライトモードの値をデフォルト値として使用
        scope: 'ALL_SCOPES',
        description: '',
        ...(group && { resolvedType: group })
      });

      if (!response || !response.variable_id) {
        throw new Error(`変数 "${name}" の作成に失敗しました`);
      }

      const variableId = response.variable_id;
      this.info(`変数 "${name}" が作成されました (ID: ${variableId})`);

      // モード別の値を設定
      const modeValues: VariableValueMap = {};
      
      // コレクションを取得してモード ID を特定
      const collection = await this.collectionManager.getCollectionById(collectionId);
      if (!collection || !collection.modes) {
        throw new Error(`コレクション ID "${collectionId}" の取得に失敗しました`);
      }

      // モード ID をマッピング
      const modeIdMap = new Map<string, string>();
      for (const mode of collection.modes) {
        modeIdMap.set(mode.name, mode.modeId);
      }

      // ライトモードとダークモードの値を設定
      const lightModeId = modeIdMap.get(VariableMode.Light);
      const darkModeId = modeIdMap.get(VariableMode.Dark);

      if (!lightModeId || !darkModeId) {
        throw new Error('必要なモード ID が見つかりませんでした');
      }

      modeValues[lightModeId] = lightValue;
      modeValues[darkModeId] = darkValue;

      // 変数のモード値を更新
      await this.api.updateVariableModes({
        file_key: this.fileKey,
        variable_id: variableId,
        mode_values: modeValues
      });

      this.info(`変数 "${name}" のモード値が更新されました`);

      // 作成した変数の情報を取得して返す
      const variable = await this.getVariable(variableId);
      return variable;
    } catch (error) {
      this.error(`文字列変数 "${name}" の作成中にエラーが発生しました`, error);
      return null;
    }
  }

  /**
   * 変数を ID で取得する
   * @param {string} variableId 変数 ID
   * @returns {Promise<Variable | null>} 変数または null
   */
  public async getVariable(variableId: string): Promise<Variable | null> {
    try {
      this.debug(`変数 ID "${variableId}" の情報を取得します`);
      
      const response = await this.api.getVariable({
        file_key: this.fileKey,
        variable_id: variableId
      });
      
      if (!response || !response.variable) {
        this.warn(`変数 ID "${variableId}" は見つかりませんでした`);
        return null;
      }
      
      return response.variable;
    } catch (error) {
      this.error(`変数 ID "${variableId}" の取得中にエラーが発生しました`, error);
      return null;
    }
  }

  /**
   * 変数を名前で検索する
   * @param {string} name 変数名
   * @param {string} [collectionId] コレクション ID（省略時はすべてのコレクションを検索）
   * @returns {Promise<Variable[]>} 見つかった変数の配列
   */
  public async findVariablesByName(name: string, collectionId?: string): Promise<Variable[]> {
    try {
      this.debug(`変数名 "${name}" で検索します`);
      
      const response = await this.api.getVariables({
        file_key: this.fileKey
      });
      
      if (!response || !response.variables) {
        return [];
      }
      
      let variables = response.variables.filter((variable: Variable) => 
        variable.name === name
      );
      
      // コレクション ID が指定されている場合はフィルタリング
      if (collectionId) {
        variables = variables.filter((variable: Variable) => 
          variable.variableCollectionId === collectionId
        );
      }
      
      return variables;
    } catch (error) {
      this.error(`変数名 "${name}" での検索中にエラーが発生しました`, error);
      return [];
    }
  }

  /**
   * 変数を削除する
   * @param {string} variableId 変数 ID
   * @returns {Promise<boolean>} 削除に成功した場合は true
   */
  public async deleteVariable(variableId: string): Promise<boolean> {
    try {
      this.info(`変数 ID "${variableId}" の削除を開始します`);
      
      await this.api.deleteVariable({
        file_key: this.fileKey,
        variable_id: variableId
      });
      
      this.info(`変数 ID "${variableId}" が正常に削除されました`);
      return true;
    } catch (error) {
      this.error(`変数 ID "${variableId}" の削除中にエラーが発生しました`, error);
      return false;
    }
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
    try {
      this.info(`変数 ID "${variableId}" の値を更新します`);
      
      // 変数の詳細を取得
      const variable = await this.getVariable(variableId);
      if (!variable) {
        throw new Error(`変数 ID "${variableId}" は見つかりません`);
      }
      
      // 変数の型に応じた値の処理
      if (variable.variableType === VariableType.Color) {
        if (typeof lightValue === 'string') {
          lightValue = this.colorUtils.hexToFigmaColor(this.colorUtils.parseColor(lightValue));
        }
        if (typeof darkValue === 'string') {
          darkValue = this.colorUtils.hexToFigmaColor(this.colorUtils.parseColor(darkValue));
        }
      }
      
      // コレクションを取得してモード ID を特定
      const collection = await this.collectionManager.getCollectionById(variable.variableCollectionId);
      if (!collection || !collection.modes) {
        throw new Error(`コレクション ID "${variable.variableCollectionId}" の取得に失敗しました`);
      }
      
      // モード ID をマッピング
      const modeIdMap = new Map<string, string>();
      for (const mode of collection.modes) {
        modeIdMap.set(mode.name, mode.modeId);
      }
      
      // ライトモードとダークモードの値を設定
      const lightModeId = modeIdMap.get(VariableMode.Light);
      const darkModeId = modeIdMap.get(VariableMode.Dark);
      
      if (!lightModeId || !darkModeId) {
        throw new Error('必要なモード ID が見つかりませんでした');
      }
      
      const modeValues: VariableValueMap = {};
      modeValues[lightModeId] = lightValue;
      modeValues[darkModeId] = darkValue;
      
      // 変数のモード値を更新
      await this.api.updateVariableModes({
        file_key: this.fileKey,
        variable_id: variableId,
        mode_values: modeValues
      });
      
      this.info(`変数 ID "${variableId}" の値が正常に更新されました`);
      return true;
    } catch (error) {
      this.error(`変数 ID "${variableId}" の値の更新中にエラーが発生しました`, error);
      return false;
    }
  }

  /**
   * CollectionManager インスタンスを取得する
   * @returns {CollectionManager} CollectionManager インスタンス
   */
  public getCollectionManager(): CollectionManager {
    return this.collectionManager;
  }

  /**
   * ColorUtils インスタンスを取得する
   * @returns {ColorUtils} ColorUtils インスタンス
   */
  public getColorUtils(): ColorUtils {
    return this.colorUtils;
  }
}
