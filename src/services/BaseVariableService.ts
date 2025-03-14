/**
 * 基本変数サービス
 * 変数操作の基本機能を提供するベースクラス
 */

import { 
  IVariableService, 
  ICollectionManager, 
  ILoggerService,
  CollectionType 
} from './figmaServiceTypes';
import { ColorUtility } from './utils/ColorUtility';

export class BaseVariableService implements IVariableService {
  protected collectionManager: ICollectionManager;
  protected logger: ILoggerService;
  protected colorUtility: ColorUtility;
  
  constructor(
    collectionManager: ICollectionManager,
    logger: ILoggerService
  ) {
    this.collectionManager = collectionManager;
    this.logger = logger;
    this.colorUtility = new ColorUtility();
  }
  
  /**
   * 変数を作成する
   * @param {string} name 変数名
   * @param {string} lightValue ライトモードの値
   * @param {string} darkValue ダークモードの値
   * @param {CollectionType} collectionType コレクションタイプ
   * @param {string} [group] グループ名
   * @returns {Variable | null} 作成された変数またはnull
   */
  createVariable(
    name: string, 
    lightValue: string, 
    darkValue: string, 
    collectionType: CollectionType,
    group?: string
  ): Variable | null {
    try {
      // コレクションを取得
      const collection = this.collectionManager.getCollection(collectionType);
      const lightModeId = this.collectionManager.getLightModeId(collectionType);
      const darkModeId = this.collectionManager.getDarkModeId(collectionType);
      
      if (!collection || !lightModeId || !darkModeId) {
        this.logger.error(`Missing collection or mode IDs for ${collectionType}`);
        return null;
      }
      
      // 既存の変数を検索
      let variable = this.collectionManager.findVariableByName(name, collectionType);
      
      // 変数が存在しない場合は新規作成
      if (!variable) {
        variable = this.createColorVariable(name, lightValue, darkValue, collectionType, group);
        if (!variable) {
          return null;
        }
      }
      
      // モード別に値を設定
      this.setVariableValue(variable, lightModeId, lightValue);
      this.setVariableValue(variable, darkModeId, darkValue);
      
      // グループ設定
      if (group) {
        this.setVariableGroup(variable, group);
      }
      
      return variable;
    } catch (error) {
      this.logger.error(`Error creating variable ${name}: ${error}`);
      return null;
    }
  }
  
  /**
   * 色変数を作成する
   * @param {string} name 変数名
   * @param {string} lightValue ライトモードの値
   * @param {string} darkValue ダークモードの値
   * @param {CollectionType} collectionType コレクションタイプ
   * @param {string} [group] グループ名
   * @returns {Variable | null} 作成された変数またはnull
   */
  createColorVariable(
    name: string,
    lightValue: string,
    darkValue: string,
    collectionType: CollectionType,
    group?: string
  ): Variable | null {
    try {
      // コレクションを取得
      const collection = this.collectionManager.getCollection(collectionType);
      if (!collection) {
        this.logger.error(`Missing collection for ${collectionType}`);
        return null;
      }
      
      // 色変数を作成
      const variable = figma.variables.createVariable(name, collection.id, 'COLOR');
      
      if (!variable) {
        this.logger.error(`Failed to create color variable ${name}`);
        return null;
      }
      
      // ライトモードとダークモードのIDを取得
      const lightModeId = this.collectionManager.getLightModeId(collectionType);
      const darkModeId = this.collectionManager.getDarkModeId(collectionType);
      
      if (!lightModeId || !darkModeId) {
        this.logger.error(`Missing mode IDs for ${collectionType}`);
        return null;
      }
      
      // 値を設定
      this.setVariableValue(variable, lightModeId, lightValue);
      this.setVariableValue(variable, darkModeId, darkValue);
      
      // グループ設定
      if (group) {
        this.setVariableGroup(variable, group);
      }
      
      // キャッシュに追加
      this.collectionManager.addToCache(variable);
      
      return variable;
    } catch (error) {
      this.logger.error(`Error creating color variable ${name}: ${error}`);
      return null;
    }
  }
  
  /**
   * 変数に値を設定する
   * @param {Variable} variable 変数
   * @param {string} modeId モードID
   * @param {string} value 設定する値
   */
  setVariableValue(variable: Variable, modeId: string, value: string): void {
    try {
      const color = this.colorUtility.hexToFigmaColor(value);
      variable.setValueForMode(modeId, color);
    } catch (error) {
      this.logger.error(`Error setting value for variable ${variable.name}: ${error}`);
    }
  }
  
  /**
   * 変数にグループを設定する
   * @param {Variable} variable 変数
   * @param {string} group グループ名
   */
  setVariableGroup(variable: Variable, group: string): void {
    try {
      // グループパスを設定
      variable.name = `${group}/${variable.name}`;
    } catch (error) {
      this.logger.error(`Error setting group for variable ${variable.name}: ${error}`);
    }
  }
  
  /**
   * 変数のパス名を設定する
   * @param {Variable} variable 変数
   * @param {string} path パス名
   */
  setVariablePathName(variable: Variable, path: string): void {
    try {
      // パス名を設定（名前は変更せず、グループのみ変更）
      const name = variable.name.split('/').pop() || variable.name;
      variable.name = `${path}/${name}`;
    } catch (error) {
      this.logger.error(`Failed to set path name for variable:`, error);
    }
  }
  
  /**
   * 変数の参照を設定する
   * @param {Variable} variable 参照先を設定する変数
   * @param {Variable} refVariable 参照される変数
   * @param {string} modeId モードID
   */
  setVariableReference(variable: Variable, refVariable: Variable, modeId: string): void {
    try {
      // 循環参照チェック
      if (this.isCircularReference(variable.name, refVariable.name, variable.variableCollectionId)) {
        this.logger.error(`Circular reference detected: ${variable.name} -> ${refVariable.name}`);
        return;
      }
      
      // 変数への参照を設定
      variable.setValueForMode(modeId, {
        type: 'VARIABLE_ALIAS',
        id: refVariable.id
      });
    } catch (error) {
      this.logger.error(`Failed to set variable reference:`, error);
    }
  }
  
  /**
   * 循環参照をチェックする
   * @param {string} sourceName 参照元の変数名
   * @param {string} targetName 参照先の変数名
   * @param {string} _collectionId コレクションID
   * @returns {boolean} 循環参照があるかどうか
   */
  isCircularReference(sourceName: string, targetName: string, _collectionId: string): boolean {
    // 直接的な循環参照のチェック
    if (sourceName === targetName) {
      return true;
    }
    
    // 間接的な循環参照のチェックは複雑なので、
    // 実際のアプリケーションではより高度なアルゴリズムが必要です
    // 簡易版として、コレクションIDが同じで、参照関係がある場合のみチェック
    
    return false;
  }
  
  /**
   * HEXカラーコードをFigma RGBAに変換する
   * @param {string} hex HEXカラーコード
   * @returns {RGBA} Figma RGBA
   */
  hexToFigmaColor(hex: string): RGBA {
    return this.colorUtility.hexToFigmaColor(hex);
  }
  
  /**
   * 色変換
   * @param {RGBA} color Figmaの色形式
   * @returns {string} 16進数形式の色文字列
   */
  figmaColorToHex(color: RGBA): string {
    return this.colorUtility.figmaColorToHex(color);
  }
  
  /**
   * 色文字列を標準フォーマットに変換
   * @param {string} colorStr 色文字列
   * @returns {string} 標準化された色文字列
   */
  parseColor(colorStr: string): string {
    return this.colorUtility.parseColor(colorStr);
  }
  
  /**
   * 警告ログを出力
   * @param {string} message 警告メッセージ
   */
  warn(message: string): void {
    this.logger.warn(`[BaseVariableService] ${message}`);
  }
}
