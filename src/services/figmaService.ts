/**
 * Figma APIとやり取りするためのサービスクラス
 * @deprecated 新しいアーキテクチャ（FigmaServiceFacade）への移行を推奨
 */
import { SemanticColors, ComponentColors, ColorPalette, ButtonColors } from '../types';
import { CollectionManagerService } from './CollectionManagerService';
import { createServiceLogger } from '../utils/logger';

// 新しいアーキテクチャのインポート
import { FigmaServiceFacade } from './figma/FigmaServiceFacade';
import { FigmaServiceFactory } from './figma/FigmaServiceFactory';
import { 
  Variable as NewVariable,
  VariableCollection as NewVariableCollection,
  VariableMode as NewVariableMode,
  VariableType as NewVariableType,
  CollectionType as NewCollectionType
} from './figma/types/VariableTypes';

// Figmaサービス用のロガーを作成
const logger = createServiceLogger('FigmaService');

/**
 * 変数コレクションのモード（Light/Dark）
 * @deprecated 新しい型定義 NewVariableMode を使用してください
 */
export enum VariableMode {
  Light = 'Light',
  Dark = 'Dark'
}

/**
 * コレクションの種類
 * @deprecated 新しい型定義 NewCollectionType を使用してください
 */
export enum CollectionType {
  Primitives = 'Primitives',
  Semantic = 'Semantic',
  Components = 'Components'
}

/**
 * 変数のタイプ
 * @deprecated 新しい型定義 NewVariableType を使用してください
 */
export enum VariableType {
  Primitive = 'primitives',
  Semantic = 'semantic',
  Component = 'components'
}

/**
 * Figma変数コレクション
 * @deprecated 新しい型定義 NewVariableCollection を使用してください
 */
export interface VariableCollection {
  id: string;
  name: string;
  modes: {
    [modeId: string]: {
      name: string;
    }
  };
}

/**
 * Figma変数
 * @deprecated 新しい型定義 NewVariable を使用してください
 */
export interface Variable {
  id: string;
  name: string;
  variableCollectionId: string;
  resolvedType: string;
  valuesByMode: {
    [modeId: string]: any;
  };
  
  // 変数のモード別の値を設定するメソッド
  setValueForMode(modeId: string, value: any): void;
}

/**
 * 変数コレクションを作成するためのサービスクラス
 * @deprecated 新しいアーキテクチャ（FigmaServiceFacade）への移行を推奨
 */
export class FigmaVariableService {
  // コレクション名の定義
  private static readonly COLLECTION_NAMES = {
    [CollectionType.Primitives]: 'Design System/Primitives',
    [CollectionType.Semantic]: 'Design System/Semantic',
    [CollectionType.Components]: 'Design System/Components'
  };
  
  // モードIDのキャッシュ (コレクションごと)
  private static lightModeIds: Record<string, string | null> = {};
  private static darkModeIds: Record<string, string | null> = {};
  
  // コレクションのキャッシュ
  private static collections: Record<string, any> = {};
  
  // 新しいアーキテクチャのファサード
  private static facade: FigmaServiceFacade | null = null;
  
  /**
   * ファサードインスタンスを取得または初期化する
   * @returns {FigmaServiceFacade} ファサードインスタンス
   */
  private static getFacade(): FigmaServiceFacade {
    if (!this.facade) {
      // 既存の設定から必要な情報を取得
      const fileKey = process.env.FIGMA_FILE_KEY || '';
      const api = {
        // APIオブジェクトの設定（既存の実装に合わせて調整）
        // ...
      };
      
      this.facade = new FigmaServiceFacade(fileKey, api);
      logger.info('新しいFigmaServiceFacadeが初期化されました');
    }
    return this.facade;
  }
  
  /**
   * 新しい型定義からレガシー型への変換（Variable）
   * @param {NewVariable} newVar 新しい型の変数
   * @returns {Variable | null} レガシー型の変数
   */
  private static convertToLegacyVariable(newVar: NewVariable): Variable | null {
    if (!newVar) return null;
    
    // 基本的な変数オブジェクトを作成
    const legacyVar: Variable = {
      id: newVar.id,
      name: newVar.name,
      variableCollectionId: newVar.variableCollectionId,
      resolvedType: newVar.resolvedType || '',
      valuesByMode: newVar.valuesByMode || {},
      
      // setValueForModeメソッドを実装
      setValueForMode(modeId: string, value: any): void {
        this.valuesByMode[modeId] = value;
      }
    };
    
    return legacyVar;
  }
  
  /**
   * 新しいCollectionTypeからレガシーCollectionTypeへの変換
   * @param {CollectionType} legacyType レガシーコレクションタイプ
   * @returns {NewCollectionType} 新しいコレクションタイプ
   */
  private static convertToNewCollectionType(legacyType: CollectionType): NewCollectionType {
    switch (legacyType) {
      case CollectionType.Primitives:
        return NewCollectionType.Primitives;
      case CollectionType.Semantic:
        return NewCollectionType.Semantic;
      case CollectionType.Components:
        return NewCollectionType.Components;
      default:
        return NewCollectionType.Primitives;
    }
  }
  
  /**
   * 既存の変数をキャッシュする (コレクションごと)
   * @deprecated 新しいアーキテクチャでは不要
   */
  private static cacheExistingVariables(): void {
    // 新しいアーキテクチャに委譲するため、スタブとして残す
    logger.info('既存変数のキャッシュはスキップされました（新しいアーキテクチャに委譲）');
  }
  
  /**
   * すべてのコレクションを初期化する
   * @deprecated 新しいFigmaServiceFacadeの同名メソッドを使用してください
   * @returns {Promise<boolean>} 初期化が成功したかどうか
   */
  public static async initializeCollections(): Promise<boolean> {
    try {
      logger.info('コレクションの初期化を開始します（レガシーメソッド）');
      
      // 新しいファサードに委譲
      const facade = this.getFacade();
      const result = await facade.variableService.initializeCollections();
      
      if (result) {
        logger.info('コレクションの初期化が完了しました（新しいアーキテクチャに委譲）');
      } else {
        logger.error('コレクションの初期化に失敗しました（新しいアーキテクチャに委譲）');
      }
      
      return result;
    } catch (error) {
      logger.error('コレクションの初期化中にエラーが発生しました:', error);
      return false;
    }
  }

  /**
   * カラー変数を作成する
   * @deprecated 新しいFigmaServiceFacadeの同名メソッドを使用してください
   * @param {string} name 変数名
   * @param {string} lightValue ライトモードの色値
   * @param {string} darkValue ダークモードの色値
   * @param {CollectionType} collectionType コレクションの種類
   * @param {string} [group] 変数グループ（省略可能）
   * @returns {Variable | null} 作成された変数、または失敗した場合はnull
   */
  public static createColorVariable(
    name: string,
    lightValue: string,
    darkValue: string,
    collectionType: CollectionType,
    group?: string
  ): Variable | null {
    try {
      logger.info(`カラー変数の作成を開始: ${name}`);
      
      // 新しいファサードを使用して変数を作成
      const facade = this.getFacade();
      const newCollectionType = this.convertToNewCollectionType(collectionType);
      
      const newVariable = facade.variableService.createColorVariable(
        name,
        lightValue,
        darkValue,
        newCollectionType,
        group
      );
      
      if (newVariable) {
        logger.info(`カラー変数の作成に成功しました: ${name}`);
        // 新しい変数をレガシーフォーマットに変換
        return this.convertToLegacyVariable(newVariable);
      } else {
        logger.warn(`カラー変数の作成に失敗しました: ${name}`);
        return null;
      }
    } catch (error) {
      logger.error(`カラー変数の作成中にエラーが発生しました:`, error);
      return null;
    }
  }
  
  /**
   * カラー変数を作成または更新する (コレクション指定)
   */
  static createColorVariable(
    name: string,
    lightValue: string,
    darkValue: string,
    collectionType: CollectionType,
    group?: string
  ): Variable | null {
    try {
      // CollectionManagerServiceのインスタンスを取得
      const collectionManager = CollectionManagerService.getInstance();
      
      // CollectionManagerServiceのcreateColorVariableメソッドを使用
      const variable = collectionManager.createColorVariable(name, lightValue, darkValue, collectionType);
      
      // 変数が正常に作成された場合
      if (variable && group) {
        // パスの構築（グループが指定されている場合）
        const path = `${collectionType.toLowerCase()}/${group}`;
        this.setVariablePathName(variable, path);
      }
      
      return variable;
    } catch (error) {
      logger.error(`Error in createColorVariable for ${name}: ${error}`);
      return null;
    }
  }
  
  /**
   * セマンティック変数を作成する（名前ベースの参照）
   */
  static createSemanticVariable(
    name: string, 
    lightRefName: string, // プリミティブ変数名または直接色
    darkRefName: string,  // プリミティブ変数名または直接色
    variableType: string  // 'colors', 'spacing' など
  ): Variable | null {
    // プリミティブ変数への参照を強制する
    // 完全な参照階層システムを実現するため、直接色値を避ける
    logger.info(`Creating semantic variable: ${name} with light: ${lightRefName}, dark: ${darkRefName}`);

    // コレクション情報取得
    const semanticCollection = this.collections[this.COLLECTION_NAMES[CollectionType.Semantic]];
    const semanticLightModeId = this.lightModeIds[this.COLLECTION_NAMES[CollectionType.Semantic]];
    const semanticDarkModeId = this.darkModeIds[this.COLLECTION_NAMES[CollectionType.Semantic]];
    
    if (!semanticCollection || !semanticLightModeId || !semanticDarkModeId) {
      logger.error("Semantic collection not initialized");
      return null;
    }
    
    try {
      // プリミティブ変数をまとめて取得
      const primitiveVars = figma.variables.getLocalVariables().filter(v => 
        v.variableCollectionId === this.collections[this.COLLECTION_NAMES[CollectionType.Primitives]]?.id
      );
      logger.info(`Found ${primitiveVars.length} primitive variables`);
      
      // 直接名前で検索してプリミティブ変数を取得
      let lightPrimitiveVar = null;
      let darkPrimitiveVar = null;
      
      if (lightRefName.includes('-')) {
        lightPrimitiveVar = primitiveVars.find(v => v.name === lightRefName);
        logger.info(`Found light primitive variable: ${lightPrimitiveVar?.name || 'NOT FOUND'}`);
      }
      
      if (darkRefName.includes('-')) {
        darkPrimitiveVar = primitiveVars.find(v => v.name === darkRefName);
        logger.info(`Found dark primitive variable: ${darkPrimitiveVar?.name || 'NOT FOUND'}`);
      }
      
      // 既存の変数を探す
      let variable = this.findVariableByName(name, CollectionType.Semantic);
      
      if (!variable) {
        // 新規作成
        logger.info(`Creating new semantic variable: ${name}`);
        variable = figma.variables.createVariable(
          name,
          semanticCollection,
          'COLOR'
        );
        
        // パスを設定
        this.setVariablePathName(variable, `${VariableType.Semantic}/${variableType}`);
        
        // キャッシュに追加
        this.existingVariables.set(`${this.COLLECTION_NAMES[CollectionType.Semantic]}:${name}`, variable);
      } else {
        logger.info(`Using existing semantic variable: ${name}`);
      }
      
      // 透明関連の特殊処理
      if (name === 'transparent' || name === 'transparentBackground' || name === 'ghostBackground') {
        // 透明のプリミティブ変数を検索
        const primitiveVars = figma.variables.getLocalVariables().filter(v => 
          v.variableCollectionId === this.collections[this.COLLECTION_NAMES[CollectionType.Primitives]]?.id
        );
        const transparentPrimitive = primitiveVars.find(v => v.name === 'transparent');
        
        if (transparentPrimitive) {
          // 透明プリミティブ変数への参照を設定
          logger.info(`Setting reference to transparent primitive for ${name}`);
          try {
            variable.setValueForMode(semanticLightModeId, {
              type: 'VARIABLE_ALIAS',
              id: transparentPrimitive.id
            });
            variable.setValueForMode(semanticDarkModeId, {
              type: 'VARIABLE_ALIAS',
              id: transparentPrimitive.id
            });
            return variable;
          } catch (error) {
            logger.error(`Error setting transparent reference: ${error}`);
          }
        }
        
        // フォールバック: 透明色を直接設定（プリミティブ変数が見つからない場合のみ）
        logger.warn(`Fallback: setting direct transparent color for ${name}`);
        variable.setValueForMode(semanticLightModeId, { r: 0, g: 0, b: 0, a: 0 });
        variable.setValueForMode(semanticDarkModeId, { r: 0, g: 0, b: 0, a: 0 });
        return variable;
      }
      
      // 循環参照を防ぐ - 同名変数へのセルフ参照を避ける
      if (lightRefName === name || this.isCircularReference(name, lightRefName, CollectionType.Semantic)) {
        logger.warn(`Preventing circular reference: ${name} -> ${lightRefName}, finding appropriate primitive instead`);
        
        // 代替のプリミティブ変数を探す
        const primitiveVars = figma.variables.getLocalVariables().filter(v => 
          v.variableCollectionId === this.collections[this.COLLECTION_NAMES[CollectionType.Primitives]]?.id
        );
        
        // 目的に応じた代替プリミティブを検索
        let alternativePrimitive = null;
        
        if (name.includes('foreground') || lightRefName.includes('foreground')) {
          // 前景色の代替としてgray-950またはgray-50を使用
          alternativePrimitive = primitiveVars.find(v => v.name === 'gray-950') || 
                              primitiveVars.find(v => v.name === 'gray-50');
        } else if (name.includes('background') || lightRefName.includes('background')) {
          // 背景色の代替としてgray-50またはgray-950を使用
          alternativePrimitive = primitiveVars.find(v => v.name === 'gray-50') || 
                              primitiveVars.find(v => v.name === 'gray-950');
        } else {
          // その他の場合はgray-500を使用
          alternativePrimitive = primitiveVars.find(v => v.name === 'gray-500');
        }
        
        if (alternativePrimitive) {
          try {
            variable.setValueForMode(semanticLightModeId, {
              type: 'VARIABLE_ALIAS',
              id: alternativePrimitive.id
            });
            logger.info(`Set reference to alternative primitive: ${alternativePrimitive.name} for ${name}`);
            return variable;
          } catch (error) {
            logger.error(`Failed to set alternative primitive: ${error}`);
          }
        }
        
        // 代替プリミティブが見つからなかった場合のフォールバック
        logger.warn(`Fallback: setting direct color for circular reference: ${name} -> ${lightRefName}`);
        const lightColor = this.hexToFigmaColor(lightRefName.startsWith('#') ? lightRefName : '#ffffff');
        variable.setValueForMode(semanticLightModeId, lightColor);
      } else if (lightPrimitiveVar) {
        try {
          // プリミティブ変数へのエイリアス（参照）を作成
          logger.info(`Setting light primitive reference: ${variable.name} -> ${lightPrimitiveVar.name}`);
          variable.setValueForMode(semanticLightModeId, {
            type: 'VARIABLE_ALIAS',
            id: lightPrimitiveVar.id
          });
        } catch (error) {
          logger.error(`Error setting light primitive reference: ${error}`);
          // エラー時はフォールバック
          const lightColor = this.hexToFigmaColor('#ffffff');
          variable.setValueForMode(semanticLightModeId, lightColor);
        }
      } else if (lightRefName.startsWith('#')) {
        const lightColor = this.hexToFigmaColor(lightRefName);
        variable.setValueForMode(semanticLightModeId, lightColor);
        logger.info(`Set direct hex color for light mode: ${lightRefName}`);
      } else {
        // プリミティブカラー名を推測（例: 'primary' -> 'primary-500'）
        const guessedPrimitiveName = `${lightRefName}-500`;
        const guessedPrimitiveVar = primitiveVars.find(v => v.name === guessedPrimitiveName);
        
        if (guessedPrimitiveVar) {
          try {
            // プリミティブ変数へのエイリアスを作成
            logger.info(`Setting guessed light primitive: ${variable.name} -> ${guessedPrimitiveVar.name}`);
            variable.setValueForMode(semanticLightModeId, {
              type: 'VARIABLE_ALIAS',
              id: guessedPrimitiveVar.id
            });
          } catch (error) {
            logger.error(`Error setting guessed light primitive: ${error}`);
            // フォールバック
            const lightColor = this.hexToFigmaColor('#ffffff');
            variable.setValueForMode(semanticLightModeId, lightColor);
          }
        } else {
          // 上記すべて失敗した場合、変換ロジックを使用
          try {
            this.setSemanticVariableValue(variable, lightRefName, semanticLightModeId);
          } catch (error) {
            logger.error(`Error setting light mode value using conversion: ${error}`);
            // 最終フォールバック
            const lightColor = this.hexToFigmaColor('#ffffff');
            variable.setValueForMode(semanticLightModeId, lightColor);
          }
        }
      }
      
      // ダークモードも同様の処理
      if (darkRefName === name || this.isCircularReference(name, darkRefName, CollectionType.Semantic)) {
        logger.warn(`Preventing circular reference: ${name} -> ${darkRefName}, finding appropriate primitive`);
        
        // 代替のプリミティブ変数を探す
        const primitiveVars = figma.variables.getLocalVariables().filter(v => 
          v.variableCollectionId === this.collections[this.COLLECTION_NAMES[CollectionType.Primitives]]?.id
        );
        
        // 目的に応じた代替プリミティブを検索
        let alternativePrimitive = null;
        
        if (name.includes('foreground') || darkRefName.includes('foreground')) {
          // 前景色の代替としてgray-50またはgray-950を使用
          alternativePrimitive = primitiveVars.find(v => v.name === 'gray-50') || 
                              primitiveVars.find(v => v.name === 'gray-950');
        } else if (name.includes('background') || darkRefName.includes('background')) {
          // 背景色の代替としてgray-950またはgray-50を使用
          alternativePrimitive = primitiveVars.find(v => v.name === 'gray-950') || 
                              primitiveVars.find(v => v.name === 'gray-50');
        } else {
          // その他の場合はgray-500を使用
          alternativePrimitive = primitiveVars.find(v => v.name === 'gray-500');
        }
        
        if (alternativePrimitive) {
          try {
            variable.setValueForMode(semanticDarkModeId, {
              type: 'VARIABLE_ALIAS',
              id: alternativePrimitive.id
            });
            logger.info(`Set reference to alternative primitive: ${alternativePrimitive.name} for ${name}`);
            return variable;
          } catch (error) {
            logger.error(`Failed to set alternative primitive: ${error}`);
          }
        }
        
        // 代替プリミティブが見つからなかった場合のフォールバック
        logger.warn(`Fallback: setting direct color for circular reference: ${name} -> ${darkRefName}`);
        const darkColor = this.hexToFigmaColor(darkRefName.startsWith('#') ? darkRefName : '#000000');
        variable.setValueForMode(semanticDarkModeId, darkColor);
      } else if (darkPrimitiveVar) {
        try {
          // プリミティブ変数へのエイリアスを作成
          logger.info(`Setting dark primitive reference: ${variable.name} -> ${darkPrimitiveVar.name}`);
          variable.setValueForMode(semanticDarkModeId, {
            type: 'VARIABLE_ALIAS',
            id: darkPrimitiveVar.id
          });
        } catch (error) {
          logger.error(`Error setting dark primitive reference: ${error}`);
          // エラー時はフォールバック
          const darkColor = this.hexToFigmaColor('#000000');
          variable.setValueForMode(semanticDarkModeId, darkColor);
        }
      } else if (darkRefName.startsWith('#')) {
        const darkColor = this.hexToFigmaColor(darkRefName);
        variable.setValueForMode(semanticDarkModeId, darkColor);
        logger.info(`Set direct hex color for dark mode: ${darkRefName}`);
      } else {
        // プリミティブカラー名を推測
        const guessedPrimitiveName = `${darkRefName}-500`;
        const guessedPrimitiveVar = primitiveVars.find(v => v.name === guessedPrimitiveName);
        
        if (guessedPrimitiveVar) {
          try {
            // 推測したプリミティブ変数へのエイリアスを設定
            logger.info(`Setting guessed dark primitive: ${variable.name} -> ${guessedPrimitiveVar.name}`);
            variable.setValueForMode(semanticDarkModeId, {
              type: 'VARIABLE_ALIAS',
              id: guessedPrimitiveVar.id
            });
          } catch (error) {
            logger.error(`Error setting guessed dark primitive: ${error}`);
            // フォールバック
            const darkColor = this.hexToFigmaColor('#000000');
            variable.setValueForMode(semanticDarkModeId, darkColor);
          }
        } else {
          // 上記すべて失敗した場合、変換ロジックを使用
          try {
            this.setSemanticVariableValue(variable, darkRefName, semanticDarkModeId);
          } catch (error) {
            logger.error(`Error setting dark mode value using conversion: ${error}`);
            // 最終フォールバック
            const darkColor = this.hexToFigmaColor('#000000');
            variable.setValueForMode(semanticDarkModeId, darkColor);
          }
        }
      }
      
      return variable;
    } catch (error) {
      logger.error(`Error creating semantic variable ${name}:`, error);
      return null;
    }
  }
  
  /**
   * 循環参照をチェックする
   */
  private static isCircularReference(sourceName: string, targetName: string, collectionType: CollectionType): boolean {
    // 同じ変数名は明らかに循環参照
    if (sourceName === targetName) {
      return true;
    }
    
    // 既知の循環参照パターン
    if (
      (sourceName === 'foreground' && targetName === 'textColor') ||
      (sourceName === 'textColor' && targetName === 'foreground') ||
      (sourceName === 'background' && targetName === 'backgroundColor') ||
      (sourceName === 'backgroundColor' && targetName === 'background')
    ) {
      return true;
    }
    
    return false;
  }
  
  /**
   * セマンティック変数に値またはプリミティブ参照を設定
   * エラー処理を強化と参照取得メカニズムの最適化
   * 必ずプリミティブ変数への参照を優先する
   */
  private static setSemanticVariableValue(
    variable: Variable,
    valueOrRef: string,
    modeId: string
  ): void {
    // 静的なプリミティブ変数のキャッシュ
    const primitiveVarCache: Map<string, Variable> = new Map();
    const semanticVarCache: Map<string, Variable> = new Map();
    
    try {
      logger.info(`Setting semantic variable ${variable.name} with value/ref: ${valueOrRef}`);
      
      // 特殊ケース: ボタンタイプの処理
      const buttonTypes = ['default', 'secondary', 'outline', 'ghost', 'destructive'];
      const buttonProps = ['background', 'foreground', 'border', 'ring'];
      
      // 変数名からボタンタイプとプロパティを抽出
      const nameParts = variable.name.split('-');
      if (nameParts.length === 2) {
        const buttonType = nameParts[0];
        const buttonProp = nameParts[1];
        
        if (buttonTypes.includes(buttonType) && buttonProps.includes(buttonProp)) {
          // 特定のセマンティック変数を探す
          // 例: default-background -> defaultBackground
          const semanticVars = figma.variables.getLocalVariables().filter(v => 
            v.variableCollectionId === this.collections[this.COLLECTION_NAMES[CollectionType.Semantic]]?.id
          );
          
          const semanticVarName = `${buttonType}${buttonProp.charAt(0).toUpperCase()}${buttonProp.slice(1)}`;
          const semanticVar = semanticVars.find(v => v.name === semanticVarName);
          
          if (semanticVar) {
            try {
              variable.setValueForMode(modeId, {
                type: 'VARIABLE_ALIAS',
                id: semanticVar.id
              });
              logger.info(`Set reference to button type semantic variable: ${variable.name} -> ${semanticVar.name}`);
              return;
            } catch (error) {
              logger.error(`Failed to set button type reference: ${error}`);
            }
          }
          
          // 代替セマンティック変数を探す
          // 例: バックグラウンドの場合、ボタンタイプの名前を探す
          if (buttonProp === 'background') {
            const typeVar = semanticVars.find(v => v.name === buttonType);
            if (typeVar) {
              try {
                variable.setValueForMode(modeId, {
                  type: 'VARIABLE_ALIAS',
                  id: typeVar.id
                });
                logger.info(`Set fallback reference to button type: ${variable.name} -> ${typeVar.name}`);
                return;
              } catch (error) {
                logger.error(`Failed to set button type fallback: ${error}`);
              }
            }
          }
        }
      }
      
      // 特殊ケース: FFFFFFの参照作成
      if (valueOrRef === 'FFFFFF' || valueOrRef === '#FFFFFF' || valueOrRef === 'white') {
        // まずプリミティブ変数でwhite-50やgray-50を探す
        const primitiveVars = figma.variables.getLocalVariables().filter(v => 
          v.variableCollectionId === this.collections[this.COLLECTION_NAMES[CollectionType.Primitives]]?.id
        );
        
        // 白色系プリミティブ変数を探す
        const whitePrimitive = primitiveVars.find(v => v.name === 'white-50') || 
                              primitiveVars.find(v => v.name === 'slate-50') ||
                              primitiveVars.find(v => v.name === 'gray-50');
                              
        if (whitePrimitive) {
          try {
            variable.setValueForMode(modeId, {
              type: 'VARIABLE_ALIAS',
              id: whitePrimitive.id
            });
            logger.info(`Set reference to white primitive variable ${whitePrimitive.name} for ${variable.name}`);
            return;
          } catch (error) {
            logger.error(`Failed to set white primitive reference: ${error}`);
          }
        }
        
        // プリミティブ変数が見つからない場合は白のセマンティック変数を探す
        const semanticVars = figma.variables.getLocalVariables().filter(v => 
          v.variableCollectionId === this.collections[this.COLLECTION_NAMES[CollectionType.Semantic]]?.id
        );
        const whiteVar = semanticVars.find(v => v.name === 'white');
        if (whiteVar) {
          try {
            variable.setValueForMode(modeId, {
              type: 'VARIABLE_ALIAS',
              id: whiteVar.id
            });
            logger.info(`Set reference to white semantic variable for ${variable.name}`);
            return;
          } catch (error) {
            logger.error(`Failed to set white reference: ${error}`);
          }
        }
        
        // 両方が失敗した場合のみ、例外的に直接色を設定
        const whiteColor = this.hexToFigmaColor('#FFFFFF');
        variable.setValueForMode(modeId, whiteColor);
        logger.warn(`Fallback: Set direct white color for ${variable.name}`);
        return;
      }
      
      // 循環参照の防止 - 同名変数へのセルフ参照を避ける
      if (valueOrRef === variable.name || this.isCircularReference(variable.name, valueOrRef, CollectionType.Semantic)) {
        logger.warn(`Avoiding circular reference for ${variable.name} -> ${valueOrRef}`);
        
        // 特殊な処理：
        // 'transparent'の場合は透明色を設定
        if (valueOrRef === 'transparent') {
          variable.setValueForMode(modeId, { r: 0, g: 0, b: 0, a: 0 });
          logger.info(`Set transparent color for ${variable.name}`);
          return;
        } 
        // 'foreground'関連は明示的なテキストカラー
        else if (valueOrRef === 'foreground' || valueOrRef.includes('foreground')) {
          const color = modeId.includes('Light') ? 
            this.hexToFigmaColor('#000000') : // ライトモードの前景色はデフォルトで黒
            this.hexToFigmaColor('#ffffff');  // ダークモードの前景色はデフォルトで白
          variable.setValueForMode(modeId, color);
          logger.info(`Set explicit foreground color for ${variable.name}`);
          return;
        }
        // 'background'関連は明示的な背景色
        else if (valueOrRef === 'background' || valueOrRef.includes('background')) {
          const color = modeId.includes('Light') ?
            this.hexToFigmaColor('#ffffff') : // ライトモードの背景色はデフォルトで白
            this.hexToFigmaColor('#000000');  // ダークモードの背景色はデフォルトで黒
          variable.setValueForMode(modeId, color);
          logger.info(`Set explicit background color for ${variable.name}`);
          return;
        }
        // その他は灰色をデフォルトとして設定
        else {
          const color = this.hexToFigmaColor('#808080'); // 中間のグレー
          variable.setValueForMode(modeId, color);
          logger.warn(`Set fallback gray color for circular reference: ${variable.name} -> ${valueOrRef}`);
          return;
        }
      }
      
      // セマンティック変数への参照を先に試みる
      if (!valueOrRef.includes('-')) {
        // 他のセマンティック変数を検索
        const semanticVars = figma.variables.getLocalVariables().filter(v => 
          v.variableCollectionId === this.collections[this.COLLECTION_NAMES[CollectionType.Semantic]]?.id &&
          v.name !== variable.name // 自分自身は除外
        );
        
        // 完全一致の変数を探す
        const refVar = semanticVars.find(v => v.name === valueOrRef);
        
        if (refVar) {
          try {
            // エイリアスを生成して設定
            const variableId = refVar.id;
            if (variableId) {
              variable.setValueForMode(modeId, {
                type: 'VARIABLE_ALIAS',
                id: variableId
              });
              logger.info(`Set reference to semantic variable: ${refVar.name}`);
              return;
            }
          } catch (refError) {
            logger.error(`Failed to create semantic alias for ${refVar.name}: ${refError}`);
          }
        }
      }
      
      // valueOrRefがプリミティブ変数名を参照しているか確認
      // 例: primary-500, slate-200, gray-100など
      if (valueOrRef.includes('-')) {
        // まずキャッシュを確認
        if (primitiveVarCache.has(valueOrRef)) {
          const refVar = primitiveVarCache.get(valueOrRef);
          if (refVar) {
            logger.info(`Found in cache: ${valueOrRef}, setting reference for ${variable.name}`);
            try {
              // 安全にエイリアスを生成
              const variableId = refVar.id;
              if (variableId) {
                variable.setValueForMode(modeId, {
                  type: 'VARIABLE_ALIAS',
                  id: variableId
                });
                logger.info(`Successfully set reference for ${variable.name} to ${refVar.name}`);
                return;
              } else {
                throw new Error(`Invalid reference variable id for ${refVar.name}`);
              }
            } catch (refError) {
              logger.error(`Failed to create alias for ${refVar.name}: ${refError}`);
              // エラー処理を続行
            }
          }
        }
        
        // すべてのプリミティブ変数を取得
        const primitiveVars = figma.variables.getLocalVariables().filter(v => 
          v.variableCollectionId === this.collections[this.COLLECTION_NAMES[CollectionType.Primitives]]?.id
        );
        
        logger.info(`Looking for primitive variable: ${valueOrRef} among ${primitiveVars.length} primitives`);
        logger.info(`Available primitive variables: ${primitiveVars.map(v => v.name).join(', ')}`);
        
        // 完全一致検索
        const refVar = primitiveVars.find(v => v.name === valueOrRef);
        
        if (refVar) {
          // キャッシュに追加
          primitiveVarCache.set(valueOrRef, refVar);
          
          try {
            // 安全にエイリアスを生成
            const variableId = refVar.id;
            if (variableId) {
              variable.setValueForMode(modeId, {
                type: 'VARIABLE_ALIAS',
                id: variableId
              });
              logger.info(`Successfully set reference for ${variable.name} to ${refVar.name}`);
              return;
            }
          } catch (refError) {
            logger.error(`Failed to set reference for ${refVar.name}: ${refError}`);
            // 続行してフォールバックを試みる
          }
        } else {
          logger.warn(`Reference variable ${valueOrRef} not found, trying to find close match...`);
          
          // 部分一致検索（valueOrRefが特定のプリミティブ変数に関連する可能性がある場合）
          const [prefix, shade] = valueOrRef.split('-');
          if (prefix && shade) {
            // 前方一致で検索（例：primary-500で検索するとprimary-500が見つかる）
            const closeMatch = primitiveVars.find(v => v.name.startsWith(`${prefix}-`) && v.name.endsWith(shade));
            if (closeMatch) {
              logger.info(`Found close match: ${closeMatch.name} for ${valueOrRef}`);
              // キャッシュに追加
              primitiveVarCache.set(valueOrRef, closeMatch);
              
              try {
                // エイリアスを作成して設定
                const variableId = closeMatch.id;
                if (variableId) {
                  variable.setValueForMode(modeId, {
                    type: 'VARIABLE_ALIAS',
                    id: variableId
                  });
                  logger.info(`Set reference to close match: ${closeMatch.name}`);
                  return;
                }
              } catch (refError) {
                logger.error(`Failed to set reference for close match ${closeMatch.name}: ${refError}`);
              }
            }
          }
        }
      }
      
      // 特殊値の処理
      if (valueOrRef === 'transparent') {
        // transparentプリミティブ変数を探す
        const primitiveVars = figma.variables.getLocalVariables().filter(v => 
          v.variableCollectionId === this.collections[this.COLLECTION_NAMES[CollectionType.Primitives]]?.id
        );
        const transparentPrimitive = primitiveVars.find(v => v.name === 'transparent');
        
        if (transparentPrimitive) {
          try {
            variable.setValueForMode(modeId, {
              type: 'VARIABLE_ALIAS',
              id: transparentPrimitive.id
            });
            logger.info(`Set reference to transparent primitive for ${variable.name}`);
            return;
          } catch (error) {
            logger.error(`Failed to set transparent primitive reference: ${error}`);
          }
        }
        
        // プリミティブ変数が見つからない場合のみ直接設定
        variable.setValueForMode(modeId, { r: 0, g: 0, b: 0, a: 0 });
        logger.warn(`Fallback: Set transparent color for ${variable.name}`);
        return;
      }
      
      // HEX値または色名の場合
      if (valueOrRef.startsWith('#') || valueOrRef === 'white' || valueOrRef === 'black') {
        // 色名を判別
        const colorName = valueOrRef === 'white' ? 'white' : 
                         valueOrRef === 'black' ? 'black' : null;
        
        // 色名があれば、対応するプリミティブ変数を探す
        if (colorName) {
          const primitiveVars = figma.variables.getLocalVariables().filter(v => 
            v.variableCollectionId === this.collections[this.COLLECTION_NAMES[CollectionType.Primitives]]?.id
          );
          
          // 関連するプリミティブ変数を探す
          let primitiveVar = null;
          if (colorName === 'white') {
            primitiveVar = primitiveVars.find(v => v.name === 'gray-50') || 
                          primitiveVars.find(v => v.name === 'slate-50');
          } else if (colorName === 'black') {
            primitiveVar = primitiveVars.find(v => v.name === 'gray-950') || 
                          primitiveVars.find(v => v.name === 'slate-950');
          }
          
          if (primitiveVar) {
            try {
              variable.setValueForMode(modeId, {
                type: 'VARIABLE_ALIAS',
                id: primitiveVar.id
              });
              logger.info(`Set reference to ${colorName} primitive ${primitiveVar.name} for ${variable.name}`);
              return;
            } catch (error) {
              logger.error(`Failed to set ${colorName} primitive reference: ${error}`);
            }
          }
        }
        
        // HEX値から色相や明度を抽出して近いプリミティブを探す
        // ここでは簡略化のために、特定の汎用的なプリミティブにマッピング
        const primitiveVars = figma.variables.getLocalVariables().filter(v => 
          v.variableCollectionId === this.collections[this.COLLECTION_NAMES[CollectionType.Primitives]]?.id
        );
        
        // HEX値の簡易分類
        const colorValue = valueOrRef === 'white' ? '#ffffff' : 
                          valueOrRef === 'black' ? '#000000' : 
                          valueOrRef;
        
        // 赤系色を探す
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(colorValue) && 
            (colorValue.toLowerCase().includes('f00') || colorValue.toLowerCase().includes('ff0000'))) {
          const redPrimitive = primitiveVars.find(v => v.name === 'red-500');
          if (redPrimitive) {
            try {
              variable.setValueForMode(modeId, {
                type: 'VARIABLE_ALIAS',
                id: redPrimitive.id
              });
              logger.info(`Set reference to red primitive for ${variable.name}`);
              return;
            } catch (error) {
              logger.error(`Failed to set red primitive reference: ${error}`);
            }
          }
        }
        
        // プリミティブ変数が見つからない場合のみ直接設定
        console.info(`Fallback: No matching primitive found for ${colorValue}, setting direct color`);
        const color = this.hexToFigmaColor(colorValue);
        variable.setValueForMode(modeId, color);
        logger.warn(`Set direct color ${colorValue} for ${variable.name}`);
        return;
      }
      
      // 修正: カラー系列の参照を試みる
      // 例えば、gray, slate, redなどが来た場合、その500シェードを探す
      // カラーシリーズを配列で定義
      const colorSeries = [
        'gray', 'slate', 'zinc', 'neutral', 'stone',  // グレー系
        'red', 'orange', 'amber', 'yellow', 'lime',   // 赤黄系
        'green', 'emerald', 'teal', 'cyan', 'sky',    // 緑青系
        'blue', 'indigo', 'violet', 'purple',         // 青紫系
        'fuchsia', 'pink', 'rose'                     // ピンク系
      ];
      
      // まずcolorSeries内で完全一致を探す
      if (colorSeries.includes(valueOrRef)) {
        const colorVarName = `${valueOrRef}-500`; // カラーの中間値
        logger.info(`Trying color series: ${colorVarName}`);
        
        const primitiveVars = figma.variables.getLocalVariables().filter(v => 
          v.variableCollectionId === this.collections[this.COLLECTION_NAMES[CollectionType.Primitives]]?.id
        );
        
        const colorVar = primitiveVars.find(v => v.name === colorVarName);
        if (colorVar) {
          try {
            variable.setValueForMode(modeId, {
              type: 'VARIABLE_ALIAS',
              id: colorVar.id
            });
            logger.info(`Set reference to color series: ${colorVar.name}`);
            return;
          } catch (error) {
            logger.error(`Failed to set color series reference: ${error}`);
          }
        }
      }
      
      // シェードのみの指定（例: '50', '100', '900'など）の場合はグレースケールを使用
      if (/^\d+$/.test(valueOrRef)) {
        const grayVarName = `gray-${valueOrRef}`;
        logger.info(`Trying gray scale: ${grayVarName}`);
        
        const primitiveVars = figma.variables.getLocalVariables().filter(v => 
          v.variableCollectionId === this.collections[this.COLLECTION_NAMES[CollectionType.Primitives]]?.id
        );
        
        const grayVar = primitiveVars.find(v => v.name === grayVarName);
        if (grayVar) {
          try {
            variable.setValueForMode(modeId, {
              type: 'VARIABLE_ALIAS',
              id: grayVar.id
            });
            logger.info(`Set reference to gray scale: ${grayVar.name}`);
            return;
          } catch (error) {
            logger.error(`Failed to set gray scale reference: ${error}`);
          }
        }
      }
      
      // 単純な値から関連するプリミティブ変数を推測する
      // 例: 'primary' -> 'primary-500', 'slate' -> 'slate-500' など
      const guessedPrimitive = `${valueOrRef}-500`; // 500は一般的な中間シェード
      logger.info(`Guessing primitive: ${guessedPrimitive}`);
      
      const primitiveVars = figma.variables.getLocalVariables().filter(v => 
        v.variableCollectionId === this.collections[this.COLLECTION_NAMES[CollectionType.Primitives]]?.id
      );
      
      const guessedVar = primitiveVars.find(v => v.name === guessedPrimitive);
      if (guessedVar) {
        logger.info(`Found guessed primitive: ${guessedVar.name}`);
        try {
          const variableId = guessedVar.id;
          if (variableId) {
            variable.setValueForMode(modeId, {
              type: 'VARIABLE_ALIAS',
              id: variableId
            });
            logger.info(`Set reference to guessed primitive: ${guessedVar.name}`);
            return;
          }
        } catch (refError) {
          logger.error(`Failed to set guessed primitive reference: ${refError}`);
        }
      }
      
      // 最後の手段: valueOrRefの文字列を直接HEX値に変換してみる
      logger.warn(`All reference attempts failed for ${valueOrRef} on ${variable.name}, using fallback`);        
      // 設定が失敗した場合はフォールバック値を使用
      const fallbackColor = modeId === this.lightModeIds[this.COLLECTION_NAMES[CollectionType.Semantic]] 
        ? this.hexToFigmaColor('#ffffff')  // ライトモードのフォールバック: 白
        : this.hexToFigmaColor('#000000'); // ダークモードのフォールバック: 黒
      
      variable.setValueForMode(modeId, fallbackColor);
      logger.warn(`Set fallback color for ${variable.name}`);
      
    } catch (error) {
      logger.error(`Critical error in setSemanticVariableValue for ${variable.name} with value ${valueOrRef}:`, error);
      // 最終フォールバック - 安全な色を設定
      const safeColor = this.hexToFigmaColor('#808080'); // グレー
      variable.setValueForMode(modeId, safeColor);
      logger.warn(`Set safe gray color after error for ${variable.name}`);
    }
  }
  
  /**
   * コンポーネント変数を作成する
   * 全てのコンポーネント変数が必ずセマンティック変数を参照するよう完全に修正
   */
  static createComponentVariable(
    name: string, 
    lightRefName: string, // セマンティック変数名または直接色
    darkRefName: string,  // セマンティック変数名または直接色
    groupName: string     // 'button', 'card' など
  ): Variable | null {
    // コレクション情報取得
    const compCollection = this.collections[this.COLLECTION_NAMES[CollectionType.Components]];
    const compLightModeId = this.lightModeIds[this.COLLECTION_NAMES[CollectionType.Components]];
    const compDarkModeId = this.darkModeIds[this.COLLECTION_NAMES[CollectionType.Components]];
    
    if (!compCollection || !compLightModeId || !compDarkModeId) {
      logger.error("Components collection not initialized");
      return null;
    }
    
    try {
      logger.info(`Creating component variable: ${name} in group ${groupName}`);
      logger.info(`  Light reference: ${lightRefName}`);
      logger.info(`  Dark reference: ${darkRefName}`);
      
      // セマンティック変数を先に取得
      const semanticVars = figma.variables.getLocalVariables().filter(v => 
        v.variableCollectionId === this.collections[this.COLLECTION_NAMES[CollectionType.Semantic]]?.id
      );
      
      // 存在するセマンティック変数をログに出力（デバッグ用）
      logger.info(`Available semantic variables: ${semanticVars.map(v => v.name).join(', ')}`);
      
      // コンポーネント名から対応するセマンティック変数を決定
      let lightSemanticVarName = null;
      let darkSemanticVarName = null;
      
      // コンポーネント名に基づくセマンティック変数の決定ロジック
      // 命名規則: component-property -> property
      // 例: outline-ring -> ring, ghost-background -> background
      if (name.includes('-')) {
        const [componentType, propertyName] = name.split('-');
        logger.info(`Component type: ${componentType}, Property: ${propertyName}`);
        
        // まずプロパティに基づいて探す（例：background, foreground, ring, border）
        // これは異なるタイプのコンポーネントでも共通の特性
        const baseSemanticVar = semanticVars.find(v => v.name === propertyName);
        if (baseSemanticVar) {
          logger.info(`Found matching semantic variable by property: ${baseSemanticVar.name}`);
          lightSemanticVarName = baseSemanticVar.name;
          darkSemanticVarName = baseSemanticVar.name;
        } 
        // 次にコンポーネントタイプと同名のセマンティック変数を探す
        else {
          // ghost-backgroundなど特殊ケース
          if (componentType === 'ghost' && propertyName === 'background') {
            // ghost-backgroundは必ずtransparentを参照
            const transparentVar = semanticVars.find(v => v.name === 'transparent');
            if (transparentVar) {
              lightSemanticVarName = 'transparent';
              darkSemanticVarName = 'transparent';
            }
          } 
          // コンポーネントタイプに対応するセマンティック変数
          else {
            const typeSemanticVar = semanticVars.find(v => v.name === componentType);
            if (typeSemanticVar) {
              logger.info(`Found matching semantic variable by component type: ${typeSemanticVar.name}`);
              lightSemanticVarName = typeSemanticVar.name;
              darkSemanticVarName = typeSemanticVar.name;
            }
          }
        }
      }
      
      // 上記ルールで見つからない場合、渡された参照名を使用
      if (!lightSemanticVarName) {
        // 簡易な直接名前参照
        if (semanticVars.find(v => v.name === lightRefName)) {
          lightSemanticVarName = lightRefName;
          logger.info(`Using direct light reference name: ${lightRefName}`);
        } 
        // 特殊ケース: ring と名前が付くコンポーネントはすべて ring 変数を参照
        else if (name.includes('ring')) {
          const ringVar = semanticVars.find(v => v.name === 'ring');
          if (ringVar) {
            lightSemanticVarName = 'ring';
            logger.info(`Ring component detected, using ring semantic variable`);
          }
        }
        // ghostForeground などの CamelCase をケバブケースに変換して検索
        else if (/[a-z][A-Z]/.test(lightRefName)) {
          const kebabCaseName = lightRefName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
          const kebabVar = semanticVars.find(v => v.name === kebabCaseName);
          if (kebabVar) {
            lightSemanticVarName = kebabVar.name;
            logger.info(`Converted camelCase to kebab-case: ${lightRefName} -> ${kebabVar.name}`);
          }
        }
      }
      
      // 上記すべてのルールで見つからない場合、フォールバックとしてプライマリを使用
      if (!lightSemanticVarName) {
        // プロパティに基づいたフォールバック
        if (name.includes('background')) {
          lightSemanticVarName = 'background';
        } else if (name.includes('foreground')) {
          lightSemanticVarName = 'foreground';
        } else if (name.includes('border')) {
          lightSemanticVarName = 'border';
        } else {
          // 最終フォールバック: primaryを使用
          const primaryVar = semanticVars.find(v => v.name === 'primary');
          if (primaryVar) {
            lightSemanticVarName = 'primary';
            logger.info(`Using primary as fallback for ${name}`);
          }
        }
      }
      
      // ダークモードも同様に処理
      if (!darkSemanticVarName) {
        if (semanticVars.find(v => v.name === darkRefName)) {
          darkSemanticVarName = darkRefName;
        } else if (name.includes('ring')) {
          const ringVar = semanticVars.find(v => v.name === 'ring');
          if (ringVar) {
            darkSemanticVarName = 'ring';
          }
        } else if (/[a-z][A-Z]/.test(darkRefName)) {
          const kebabCaseName = darkRefName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
          const kebabVar = semanticVars.find(v => v.name === kebabCaseName);
          if (kebabVar) {
            darkSemanticVarName = kebabVar.name;
          }
        }
      }
      
      // ダークモードのフォールバック
      if (!darkSemanticVarName) {
        if (name.includes('background')) {
          darkSemanticVarName = 'background';
        } else if (name.includes('foreground')) {
          darkSemanticVarName = 'foreground';
        } else if (name.includes('border')) {
          darkSemanticVarName = 'border';
        } else {
          const primaryVar = semanticVars.find(v => v.name === 'primary');
          if (primaryVar) {
            darkSemanticVarName = 'primary';
          }
        }
      }
      
      // 既存の変数を探す
      let variable = this.findVariableByName(name, CollectionType.Components);
      
      if (!variable) {
        // 新規作成
        logger.info(`Creating new component variable: ${name}`);
        variable = figma.variables.createVariable(
          name,
          compCollection,
          'COLOR'
        );
        
        // パスを設定
        this.setVariablePathName(variable, `${VariableType.Component}/${groupName}`);
        
        // キャッシュに追加
        this.existingVariables.set(`${this.COLLECTION_NAMES[CollectionType.Components]}:${name}`, variable);
      } else {
        logger.info(`Using existing component variable: ${name}`);
      }
      
      // 決定したセマンティック変数をセット
      logger.info(`Final semantic variables for ${name}: Light=${lightSemanticVarName}, Dark=${darkSemanticVarName}`);
      
      // ライトモードの参照を設定
      if (lightSemanticVarName) {
        const lightSemanticVar = semanticVars.find(v => v.name === lightSemanticVarName);
        if (lightSemanticVar) {
          try {
            variable.setValueForMode(compLightModeId, {
              type: 'VARIABLE_ALIAS',
              id: lightSemanticVar.id
            });
            logger.info(`Set light semantic reference: ${name} -> ${lightSemanticVar.name}`);
          } catch (error) {
            logger.error(`Failed to set light semantic reference: ${error}`);
          }
        } else {
          logger.error(`Light semantic variable not found: ${lightSemanticVarName}`);
        }
      } else {
        logger.error(`No light semantic variable determined for ${name}`);
      }
      
      // ダークモードの参照を設定
      if (darkSemanticVarName) {
        const darkSemanticVar = semanticVars.find(v => v.name === darkSemanticVarName);
        if (darkSemanticVar) {
          try {
            variable.setValueForMode(compDarkModeId, {
              type: 'VARIABLE_ALIAS',
              id: darkSemanticVar.id
            });
            logger.info(`Set dark semantic reference: ${name} -> ${darkSemanticVar.name}`);
          } catch (error) {
            logger.error(`Failed to set dark semantic reference: ${error}`);
          }
        } else {
          logger.error(`Dark semantic variable not found: ${darkSemanticVarName}`);
        }
      } else {
        logger.error(`No dark semantic variable determined for ${name}`);
      }
      
      return variable;
    } catch (error) {
      logger.error(`Error creating component variable ${name}:`, error);
      return null;
    }
  }
  
  /**
   * コンポーネント変数に値またはセマンティック参照を設定
   * セマンティック変数への参照を最優先で使用する
   */
  private static setComponentVariableValue(
    variable: Variable,
    valueOrRef: string,
    modeId: string
  ): void {
    try {
      logger.info(`Setting component variable ${variable.name} with value/ref: ${valueOrRef}`);
      
      // 特殊ケース処理: 透明な背景
      if (valueOrRef === 'transparent' || 
          variable.name === 'ghost-background' || 
          (variable.name.includes('-background') && valueOrRef === 'transparent') ||
          valueOrRef === 'ghostBackground' || 
          valueOrRef === 'transparentBackground') {
          
        // まずセマンティック変数の 'transparent' を探す
        const semanticVars = figma.variables.getLocalVariables().filter(v => 
          v.variableCollectionId === this.collections[this.COLLECTION_NAMES[CollectionType.Semantic]]?.id
        );
        const transparentVar = semanticVars.find(v => v.name === 'transparent');
        
        if (transparentVar) {
          // transparent 変数を参照
          try {
            variable.setValueForMode(modeId, {
              type: 'VARIABLE_ALIAS',
              id: transparentVar.id
            });
            logger.info(`Set reference to transparent semantic variable for ${variable.name}`);
            return;
          } catch (error) {
            logger.error(`Failed to reference transparent variable: ${error}`);
          }
        }
        
        // もし参照設定が失敗した場合は直接値を設定
        variable.setValueForMode(modeId, { r: 0, g: 0, b: 0, a: 0 });
        logger.warn(`Set direct transparent color for ${variable.name}`);
        return;
      }
      
      // 循環参照を確認 (同じ名前の変数を参照しようとしている場合)
      if (valueOrRef === variable.name || valueOrRef.includes(variable.name)) {
        logger.warn(`Detected potential circular reference for ${variable.name} -> ${valueOrRef}, using fallback`);
        // コンテキストに応じたフォールバック色
        if (variable.name.includes('-border') || valueOrRef === 'border' || valueOrRef.includes('border')) {
          // ボーダーのフォールバック
          variable.setValueForMode(modeId, { r: 0, g: 0, b: 0, a: 0.1 }); // 半透明ボーダー
        } else if (variable.name.includes('-background') || valueOrRef.includes('background')) {
          // 背景のフォールバック
          variable.setValueForMode(modeId, { r: 1, g: 1, b: 1, a: 0 }); // 透明な背景
        } else {
          // その他のフォールバック
          const fallbackColor = modeId.includes('Light') ? 
            this.hexToFigmaColor('#111111') : // ライトモードのフォールバック: 黒
            this.hexToFigmaColor('#f5f5f5');  // ダークモードのフォールバック: 白
          variable.setValueForMode(modeId, fallbackColor);
        }
        return;
      }
      
      // セマンティック変数への参照を最優先で試みる
      // ここが重要: コンポーネント変数は必ずセマンティック変数を参照する
      const semanticVars = figma.variables.getLocalVariables().filter(v => 
        v.variableCollectionId === this.collections[this.COLLECTION_NAMES[CollectionType.Semantic]]?.id
      );
      
      logger.info(`Searching for semantic variable: ${valueOrRef} among ${semanticVars.length} semantic variables`);
      logger.info(`Available semantic variables: ${semanticVars.map(v => v.name).join(', ')}`);
      
      // 完全一致検索 (変数名が完全に一致する場合)
      const exactMatch = semanticVars.find(v => v.name === valueOrRef);
      if (exactMatch) {
        try {
          // 変数エイリアス (参照) を作成
          variable.setValueForMode(modeId, {
            type: 'VARIABLE_ALIAS',
            id: exactMatch.id
          });
          logger.info(`Set exact semantic reference: ${variable.name} -> ${exactMatch.name}`);
          return;
        } catch (error) {
          logger.error(`Failed to set exact semantic reference: ${error}`);
        }
      }
      
      // camelCase -> kebab-case 変換をチェック
      // 例: primaryForeground -> primary-foreground
      if (/[a-z][A-Z]/.test(valueOrRef)) {
        const kebabCaseName = valueOrRef.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        const kebabMatch = semanticVars.find(v => v.name === kebabCaseName);
        if (kebabMatch) {
          try {
            variable.setValueForMode(modeId, {
              type: 'VARIABLE_ALIAS',
              id: kebabMatch.id
            });
            logger.info(`Set kebab-case semantic reference: ${variable.name} -> ${kebabMatch.name}`);
            return;
          } catch (error) {
            logger.error(`Failed to set kebab-case semantic reference: ${error}`);
          }
        }
      }
      
      // kebab-case -> camelCase 変換をチェック
      // 例: destructive-foreground -> destructiveForeground
      if (valueOrRef.includes('-')) {
        const camelCaseName = valueOrRef.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        const camelMatch = semanticVars.find(v => v.name === camelCaseName);
        if (camelMatch) {
          try {
            variable.setValueForMode(modeId, {
              type: 'VARIABLE_ALIAS',
              id: camelMatch.id
            });
            logger.info(`Set camelCase semantic reference: ${variable.name} -> ${camelMatch.name}`);
            return;
          } catch (error) {
            logger.error(`Failed to set camelCase semantic reference: ${error}`);
          }
        }
      }
      
      // 単語を分解して部分一致を検索
      // 例: primaryForeground -> foreground
      // 例: destructiveBorder -> border
      if (valueOrRef.length > 6) { // 最低でも意味のある長さを持つ場合
        // 一般的なセマンティック変数名のリスト
        const commonNames = [
          'foreground', 'background', 'border', 'ring',
          'primary', 'secondary', 'accent', 'muted',
          'destructive', 'success', 'warning',
          'overlay', 'transparent', 'darkBg', 'darkText',
          'defaultBackground', 'defaultForeground',
          'secondaryBackground', 'secondaryForeground',
          'outlineBackground', 'outlineForeground', 'outlineBorder',
          'white'
        ];
        
        for (const name of commonNames) {
          if (valueOrRef.toLowerCase().includes(name.toLowerCase())) {
            const partialMatch = semanticVars.find(v => v.name === name);
            if (partialMatch) {
              try {
                variable.setValueForMode(modeId, {
                  type: 'VARIABLE_ALIAS',
                  id: partialMatch.id
                });
                logger.info(`Set partial semantic reference: ${variable.name} -> ${partialMatch.name}`);
                return;
              } catch (error) {
                logger.error(`Failed to set partial semantic reference: ${error}`);
              }
            }
          }
        }
      }
      
      // プリミティブ変数への参照を避ける
      // 代わりに、適切なセマンティック変数を探す
      if (valueOrRef.includes('-')) {
        // Tailwind風シンタックス「primary-500」などを処理する
        // 目標: プリミティブではなくセマンティック変数を使用する
        
        // 例: primary-500 -> primary
        const baseName = valueOrRef.split('-')[0];
        
        // セマンティック変数で対応するものを探す
        const baseMatch = semanticVars.find(v => v.name === baseName);
        if (baseMatch) {
          try {
            variable.setValueForMode(modeId, {
              type: 'VARIABLE_ALIAS',
              id: baseMatch.id
            });
            logger.info(`Set base semantic reference: ${variable.name} -> ${baseMatch.name}`);
            return;
          } catch (error) {
            logger.error(`Failed to set base semantic reference: ${error}`);
          }
        }
        
        // 他のセマンティック変数との関連性を探す
        // 例: button-background -> background
        const suffixName = valueOrRef.split('-')[1];
        if (suffixName) {
          const suffixMatch = semanticVars.find(v => v.name === suffixName);
          if (suffixMatch) {
            try {
              variable.setValueForMode(modeId, {
                type: 'VARIABLE_ALIAS',
                id: suffixMatch.id
              });
              logger.info(`Set suffix semantic reference: ${variable.name} -> ${suffixMatch.name}`);
              return;
            } catch (error) {
              logger.error(`Failed to set suffix semantic reference: ${error}`);
            }
          }
        }
      }
      
      // 色相違いのコンポーネント変数の参照を試みる
      // 例: primary-background -> foreground-background
      const componentPrefix = variable.name.split('-')[0];
      if (componentPrefix) {
        const targetSuffix = valueOrRef.includes('-') ? valueOrRef.split('-')[1] : valueOrRef;
        if (targetSuffix) {
          const semanticVarName = targetSuffix; // 例: 'foreground', 'border'など
          const semanticMatch = semanticVars.find(v => v.name === semanticVarName);
          if (semanticMatch) {
            try {
              variable.setValueForMode(modeId, {
                type: 'VARIABLE_ALIAS',
                id: semanticMatch.id
              });
              logger.info(`Set suffix semantic reference: ${variable.name} -> ${semanticMatch.name}`);
              return;
            } catch (error) {
              logger.error(`Failed to set suffix semantic reference: ${error}`);
            }
          }
        }
      }
      
      // 直接HEX値や色名を変数参照に変換
      if (valueOrRef.startsWith('#') || valueOrRef === 'white' || valueOrRef === 'black') {
        // 色名をセマンティック変数にマッピング
        if (valueOrRef === 'white') {
          const whiteVar = semanticVars.find(v => v.name === 'background' || v.name === 'white');
          if (whiteVar) {
            try {
              variable.setValueForMode(modeId, {
                type: 'VARIABLE_ALIAS',
                id: whiteVar.id
              });
              logger.info(`Mapped white to semantic variable: ${variable.name} -> ${whiteVar.name}`);
              return;
            } catch (error) {
              logger.error(`Failed to map white to semantic variable: ${error}`);
            }
          }
        } else if (valueOrRef === 'black') {
          const blackVar = semanticVars.find(v => v.name === 'foreground' || v.name === 'black');
          if (blackVar) {
            try {
              variable.setValueForMode(modeId, {
                type: 'VARIABLE_ALIAS',
                id: blackVar.id
              });
              logger.info(`Mapped black to semantic variable: ${variable.name} -> ${blackVar.name}`);
              return;
            } catch (error) {
              logger.error(`Failed to map black to semantic variable: ${error}`);
            }
          }
        }
        
        // セマンティック背景または前景色を探す
        // 明るい色は背景色に、暗い色は前景色にマッピング
        const isLight = valueOrRef.match(/(white|#[fF]{3,6}|#[eE][0-9a-fA-F]{5}|#[cCdDeEfF][0-9a-fA-F]{5})/);
        const isDark = valueOrRef.match(/(black|#[0-9]{3,6}|#[0-3][0-9a-fA-F]{5})/);
        
        if (isLight) {
          const bgVar = semanticVars.find(v => v.name === 'background');
          if (bgVar) {
            try {
              variable.setValueForMode(modeId, {
                type: 'VARIABLE_ALIAS',
                id: bgVar.id
              });
              logger.info(`Mapped light color to background: ${variable.name} -> background`);
              return;
            } catch (error) {
              logger.error(`Failed to map light color: ${error}`);
            }
          }
        } else if (isDark) {
          const fgVar = semanticVars.find(v => v.name === 'foreground');
          if (fgVar) {
            try {
              variable.setValueForMode(modeId, {
                type: 'VARIABLE_ALIAS',
                id: fgVar.id
              });
              logger.info(`Mapped dark color to foreground: ${variable.name} -> foreground`);
              return;
            } catch (error) {
              logger.error(`Failed to map dark color: ${error}`);
            }
          }
        }
        
        // フォールバック: 直接色ではなく、コンテキストに応じたセマンティック変数を使用
        logger.warn(`Direct color value ${valueOrRef} detected for ${variable.name}, using semantic variable instead`);        
        if (variable.name.includes('background')) {
          const bgVar = semanticVars.find(v => v.name === 'background');
          if (bgVar) {
            try {
              variable.setValueForMode(modeId, {
                type: 'VARIABLE_ALIAS',
                id: bgVar.id
              });
              logger.info(`Fallback to background semantic: ${variable.name} -> background`);
              return;
            } catch (error) {
              logger.error(`Failed fallback to background: ${error}`);
            }
          }
        } else if (variable.name.includes('foreground')) {
          const fgVar = semanticVars.find(v => v.name === 'foreground');
          if (fgVar) {
            try {
              variable.setValueForMode(modeId, {
                type: 'VARIABLE_ALIAS',
                id: fgVar.id
              });
              logger.info(`Fallback to foreground semantic: ${variable.name} -> foreground`);
              return;
            } catch (error) {
              logger.error(`Failed fallback to foreground: ${error}`);
            }
          }
        }
      }
      
      // 16進カラーコードのように見える文字列を検出
      if (/^[0-9A-Fa-f]{6}$/.test(valueOrRef)) {
        logger.info(`Detected possible hex color value without # prefix: ${valueOrRef}`);
        
        // まず「セマンティック変数」で検索してみる
        const darkBgVar = semanticVars.find(v => v.name === 'darkBg');
        const darkTextVar = semanticVars.find(v => v.name === 'darkText');
        
        if ((valueOrRef === '212529' || valueOrRef === '000000') && (darkBgVar || darkTextVar)) {
          const semanticVar = darkBgVar || darkTextVar;
          if (semanticVar) {
            try {
              variable.setValueForMode(modeId, {
                type: 'VARIABLE_ALIAS',
                id: semanticVar.id
              });
              logger.info(`Mapped hex-like string ${valueOrRef} to semantic variable ${semanticVar.name}`);
              return;
            } catch (error) {
              logger.error(`Failed to set hex-like string reference: ${error}`);
            }
          }
        }
        
        // HEX値として処理
        try {
          const hexColor = `#${valueOrRef}`;
          const color = this.hexToFigmaColor(hexColor);
          variable.setValueForMode(modeId, color);
          logger.info(`Converted ${valueOrRef} to hex color: ${hexColor}`);
          return;
        } catch (error) {
          logger.error(`Failed to convert value to color: ${error}`);
        }
      }
      
      // 単一の色名からプリミティブを推測（例: 'primary'→'primary-500'）
      if (!valueOrRef.includes('-') && !valueOrRef.startsWith('#')) {
        const guessedPrimitive = `${valueOrRef}-500`;
        
        const primitiveVars = figma.variables.getLocalVariables().filter(v => 
          v.variableCollectionId === this.collections[this.COLLECTION_NAMES[CollectionType.Primitives]]?.id
        );
        
        const guessedVar = primitiveVars.find(v => v.name === guessedPrimitive);
        if (guessedVar) {
          try {
            variable.setValueForMode(modeId, {
              type: 'VARIABLE_ALIAS',
              id: guessedVar.id
            });
            logger.info(`Set reference to guessed primitive: ${guessedVar.name}`);
            return;
          } catch (error) {
            logger.error(`Failed to set guessed primitive reference: ${error}`);
          }
        }
      }
      
      // フォールバック: コンテキストに基づいたセマンティック変数参照
      logger.warn(`All reference attempts failed for ${valueOrRef} on ${variable.name}, using semantic fallback`);
      
      // コンポーネント名から適切なセマンティック変数を探す最後の試み
      const semanticMap = {
        'foreground': 'foreground',
        'background': 'background',
        'border': 'border',
        'ring': 'ring',
        'outline': 'border',
        'ghost': 'transparent',
        'destructive': 'destructive',
      };
      
      // コンポーネント名の最初の部分を取得
      const mainComponent = variable.name.split('-')[0];
      if (mainComponent && semanticMap[mainComponent]) {
        const lastAttemptVar = semanticVars.find(v => v.name === semanticMap[mainComponent]);
        if (lastAttemptVar) {
          try {
            variable.setValueForMode(modeId, {
              type: 'VARIABLE_ALIAS',
              id: lastAttemptVar.id
            });
            logger.info(`Set last attempt semantic reference: ${variable.name} -> ${lastAttemptVar.name}`);
            return;
          } catch (error) {
            logger.error(`Failed to set last attempt semantic reference: ${error}`);
          }
        }
      }
      
      // 本当の最終フォールバック: コンテキスト依存のセマンティック変数参照
      // この段階では直接色値は設定せず、必ずセマンティック変数への参照を使用する
      
      if (variable.name.includes('-border') || valueOrRef === 'border' || valueOrRef.includes('border')) {
        // ボーダーのフォールバック
        const borderVar = semanticVars.find(v => v.name === 'border');
        if (borderVar) {
          try {
            variable.setValueForMode(modeId, {
              type: 'VARIABLE_ALIAS',
              id: borderVar.id
            });
            logger.info(`Fallback to border semantic: ${variable.name} -> border`);
            return;
          } catch (error) {
            logger.error(`Failed fallback to border: ${error}`);
          }
        }
      } else if (variable.name.includes('-background') || valueOrRef.includes('background')) {
        // 背景関連のフォールバック
        const bgVar = semanticVars.find(v => v.name === 'background');
        if (bgVar) {
          try {
            variable.setValueForMode(modeId, {
              type: 'VARIABLE_ALIAS',
              id: bgVar.id
            });
            logger.info(`Fallback to background semantic: ${variable.name} -> background`);
            return;
          } catch (error) {
            logger.error(`Failed fallback to background: ${error}`);
          }
        }
      } else if (variable.name.includes('-foreground') || valueOrRef.includes('foreground')) {
        // 前景関連のフォールバック
        const fgVar = semanticVars.find(v => v.name === 'foreground');
        if (fgVar) {
          try {
            variable.setValueForMode(modeId, {
              type: 'VARIABLE_ALIAS',
              id: fgVar.id
            });
            logger.info(`Fallback to foreground semantic: ${variable.name} -> foreground`);
            return;
          } catch (error) {
            logger.error(`Failed fallback to foreground: ${error}`);
          }
        }
      } else if (variable.name === 'overlay' || valueOrRef === 'overlay') {
        // オーバーレイの特殊処理
        const overlayVar = semanticVars.find(v => v.name === 'overlay');
        if (overlayVar) {
          try {
            variable.setValueForMode(modeId, {
              type: 'VARIABLE_ALIAS',
              id: overlayVar.id
            });
            logger.info(`Set reference to overlay semantic variable`);
            return;
          } catch (error) {
            logger.error(`Failed to reference overlay variable: ${error}`);
          }
        }
      }
      
      // 絶対最後のフォールバック: マッチする最も基本的なセマンティック変数
      let lastResortVar = null;
      
      if (variable.name.includes('ring')) {
        lastResortVar = semanticVars.find(v => v.name === 'ring' || v.name === 'primary');
      } else if (variable.name.includes('default')) {
        lastResortVar = semanticVars.find(v => v.name === 'primary');
      } else if (variable.name.includes('destructive')) {
        lastResortVar = semanticVars.find(v => v.name === 'destructive');
      } else if (variable.name.includes('secondary')) {
        lastResortVar = semanticVars.find(v => v.name === 'secondary');
      } else {
        // 本当に何も見つからない場合は基本色を使用
        lastResortVar = semanticVars.find(v => v.name === 'foreground') || 
                       semanticVars.find(v => v.name === 'background') || 
                       semanticVars.find(v => v.name === 'primary');
      }
      
      if (lastResortVar) {
        try {
          variable.setValueForMode(modeId, {
            type: 'VARIABLE_ALIAS',
            id: lastResortVar.id
          });
          logger.info(`Last resort fallback: ${variable.name} -> ${lastResortVar.name}`);
          return;
        } catch (error) {
          logger.error(`Failed last resort fallback: ${error}`);
        }
      }
      
      // 万が一何も見つからない場合のみ直接色を設定
      logger.error(`Absolutely no semantic variable found for ${variable.name}. Using direct color as last resort.`);
      const fallbackColor = modeId.includes('Light') ? 
        this.hexToFigmaColor('#f8f9fa') : // ライトモードのフォールバック: 明るいグレー
        this.hexToFigmaColor('#212529'); // ダークモードのフォールバック: 暗いグレー
      
      variable.setValueForMode(modeId, fallbackColor);
      logger.warn(`Set direct color as absolute last resort for ${variable.name}`);
    } catch (error) {
      logger.error(`Critical error setting value for component ${variable.name}:`, error);
      // 最終的なフォールバック
      const safeColor = this.hexToFigmaColor('#808080'); // 中間のグレー
      variable.setValueForMode(modeId, safeColor);
      logger.warn(`Set safe gray color after error for ${variable.name}`);
    }
  }
  
  /**
   * コンポーネントグループを生成するユーティリティメソッド
   */
  private static createComponentGroup(
    groupName: string, 
    lightGroup: Record<string, ButtonColors | string>,
    darkGroup: Record<string, ButtonColors | string>
  ): void {    
    // ボタンコンポーネントの場合は ButtonColors 型として処理
    if (groupName === 'button') {
      // 型安全なチェック: ButtonColors 型かどうかを確認
      // ButtonColors は 'background' プロパティを持っているはず
      const isButtonColorsRecord = (record: Record<string, unknown>): record is Record<string, ButtonColors> => {
        // 少なくとも1つのエントリが ButtonColors 型かどうかをチェック
        return Object.values(record).some(value => 
          typeof value === 'object' && value !== null && 'background' in value
        );
      };
      
      if (isButtonColorsRecord(lightGroup)) {
        for (const [variant, lightValues] of Object.entries(lightGroup)) {
          // darkGroup も同じ型である必要があるが、安全のために型チェック
          const darkValues = isButtonColorsRecord(darkGroup) && variant in darkGroup 
            ? darkGroup[variant] 
            : {} as ButtonColors;
          
          // 型安全なプロパティアクセスのために明示的に各プロパティを処理
          const properties: (keyof ButtonColors)[] = ['background', 'foreground', 'border', 'ring'];
          
          for (const prop of properties) {
            if (prop in lightValues) {
              const lightValue = lightValues[prop];
              // darkValuesから対応するプロパティを安全に取得
              const darkValue = prop in darkValues ? darkValues[prop] : lightValue;
              const varName = `${variant}-${prop}`;
              
              this.createComponentVariable(
                varName,
                lightValue,
                darkValue,
                groupName
              );
            }
          }
        }
      } else {
        logger.error(`Expected ButtonColors record for 'button' group, but received incompatible type`);
      }
    } else {
      // ボタン以外のコンポーネントは文字列値として処理
      const isStringRecord = (record: Record<string, unknown>): record is Record<string, string> => {
        return Object.values(record).every(value => typeof value === 'string');
      };
      
      if (isStringRecord(lightGroup)) {
        for (const [key, lightValue] of Object.entries(lightGroup)) {
          // darkGroupから対応する値を安全に取得
          const darkValue = isStringRecord(darkGroup) && key in darkGroup
            ? darkGroup[key]
            : lightValue; // フォールバック
          
          this.createComponentVariable(
            key,
            lightValue,
            darkValue,
            groupName
          );
        }
      } else {
        logger.error(`Expected string record for '${groupName}' group, but received incompatible type`);
      }
    }
  }
  
  /**
   * HEXカラーをFigmaのRGBAカラーに変換
   */
  private static hexToFigmaColor(hex: string): RGBA {
    // 透明度を処理（rgba形式の場合）
    let alpha = 1;
    
    // 標準的な色名を処理
    if (hex === 'white') hex = '#ffffff';
    if (hex === 'black') hex = '#000000';
    if (hex === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
    
    // rgba形式の場合を処理
    if (hex.startsWith('rgba(')) {
      const rgba = hex.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (rgba) {
        const r = parseInt(rgba[1], 10) / 255;
        const g = parseInt(rgba[2], 10) / 255;
        const b = parseInt(rgba[3], 10) / 255;
        alpha = parseFloat(rgba[4]);
        return { r, g, b, a: alpha };
      }
    }
    
    // # から始まるなら削除
    hex = hex.replace(/^#/, '');
    
    // 3桁のHEXなら6桁に拡張
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    try {
      // RGBに変換
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      
      // Figmaのカラーフォーマットで返す
      return { r, g, b, a: alpha };
    } catch (error) {
      logger.error(`Error parsing color hex ${hex}:`, error);
      // フォールバック: 中間のグレー
      return { r: 0.5, g: 0.5, b: 0.5, a: 1 };
    }
  }
  
  /**
   * RGBA値をHEXに変換
   */
  private static rgbaToHex(r: number, g: number, b: number, a: number): string {
    const toHex = (value: number) => {
      const hex = Math.round(value * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    
    // 透明度が1（1.0）の場合はアルファ値を含めない
    if (a < 1) {
      return `${hex}${toHex(a)}`;
    }
    
    return hex;
  }
  
  /**
   * プリミティブ数値トークンを生成する
   */
  static createPrimitiveNumberTokens(
    tokenType: string,
    tokens: Record<string, string>
  ): Record<string, Variable> {
    const variables: Record<string, Variable> = {};
    logger.info(`Creating primitive number tokens for ${tokenType}:`, tokens);
    
    for (const [key, value] of Object.entries(tokens)) {
      // 変数名を安全な形式に変換（小数点を除去など）
      const varName = key === 'DEFAULT' ? tokenType : `${tokenType}-${key}`;
      logger.info(`Creating variable with name: ${varName}, value: ${value}`);
      
      try {
        const primitiveCollection = this.collections[this.COLLECTION_NAMES[CollectionType.Primitives]];
        if (!primitiveCollection) {
          logger.error("Primitives collection not initialized");
          continue;
        }
        
        // 既存の変数を探す
        let variable = this.findVariableByName(varName, CollectionType.Primitives);
        
        // 文字列から数値への変換
        const numValue = this.parseNumberValue(value);
        
        if (variable) {
          // 既存の変数を更新
          logger.info(`Number variable ${varName} already exists, updating values`);
          
          // すべてのモードに同じ値を設定
          for (const mode of primitiveCollection.modes) {
            variable.setValueForMode(mode.modeId, numValue);
          }
        } else {
          // 新しい変数を作成
          logger.info(`Creating new number variable ${varName}`);
          variable = figma.variables.createVariable(
            varName,
            primitiveCollection,
            'FLOAT'
          );
          
          // すべてのモードに同じ値を設定
          for (const mode of primitiveCollection.modes) {
            variable.setValueForMode(mode.modeId, numValue);
          }
          
          // パスを設定
          this.setVariablePathName(variable, `${VariableType.Primitive}/${tokenType}`);
          
          // キャッシュに追加
          this.existingVariables.set(`${this.COLLECTION_NAMES[CollectionType.Primitives]}:${varName}`, variable);
        }
        
        if (variable) {
          variables[key] = variable;
        }
      } catch (error) {
        logger.error(`Error creating/updating variable ${varName}: ${error}`);
      }
    }
    
    return variables;
  }
  
  /**
   * 文字列の単位値を数値に変換する
   */
  private static parseNumberValue(value: string): number {
    // px単位から数値への変換
    if (value.endsWith('px')) {
      return parseFloat(value.replace('px', ''));
    }
    
    // rem単位からピクセルへの変換 (1rem = 16pxと仕定)
    if (value.endsWith('rem')) {
      return parseFloat(value.replace('rem', '')) * 16;
    }
    
    // 数値のみの場合
    return parseFloat(value);
  }
  
  /**
   * シャドウ変数を生成する
   */
  static createShadowVariables(
    lightShadows: Record<string, string>,
    darkShadows: Record<string, string>
  ): Record<string, Variable> {
    const variables: Record<string, Variable> = {};
    
    for (const [key, lightValue] of Object.entries(lightShadows)) {
      const varName = key === 'DEFAULT' ? 'shadow' : `shadow-${key}`;
      
      try {
        const primitiveCollection = this.collections[this.COLLECTION_NAMES[CollectionType.Primitives]];
        const lightModeId = this.lightModeIds[this.COLLECTION_NAMES[CollectionType.Primitives]];
        const darkModeId = this.darkModeIds[this.COLLECTION_NAMES[CollectionType.Primitives]];
        
        if (!primitiveCollection || !lightModeId || !darkModeId) {
          throw new Error("Primitives collection not initialized");
        }
        
        // 既存の変数を探す
        let variable = this.findVariableByName(varName, CollectionType.Primitives);
        
        if (variable) {
          // 既存の変数を更新
          logger.info(`Shadow variable ${varName} already exists, updating values`);
          
          // ライトモードとダークモードで異なる値を設定
          if (lightModeId) {
            variable.setValueForMode(lightModeId, lightValue);
          }
          
          // ダークモードの値を設定（存在する場合）
          if (darkModeId && darkShadows[key]) {
            variable.setValueForMode(darkModeId, darkShadows[key]);
          }
        } else {
          // 新しい変数を作成
          logger.info(`Creating new shadow variable ${varName}`);
          variable = figma.variables.createVariable(
            varName,
            primitiveCollection,
            'STRING'
          );
          
          // ライトモードとダークモードで異なる値を設定
          if (lightModeId) {
            variable.setValueForMode(lightModeId, lightValue);
          }
          
          // ダークモードの値を設定（存在する場合）
          if (darkModeId && darkShadows[key]) {
            variable.setValueForMode(darkModeId, darkShadows[key]);
          }
          
          // パス設定
          this.setVariablePathName(variable, `${VariableType.Primitive}/shadow`);
          
          // キャッシュに追加
          this.existingVariables.set(`${this.COLLECTION_NAMES[CollectionType.Primitives]}:${varName}`, variable);
        }
        
        variables[key] = variable;
      } catch (error) {
        logger.error(`Error creating/updating shadow variable ${varName}: ${error}`);
      }
    }
    
    return variables;
  }
  
  /**
   * セマンティックカラーを生成する
   */
  static createSemanticColors(
    lightColors: SemanticColors,
    darkColors: SemanticColors
  ): Record<string, Variable> {
    const variables: Record<string, Variable> = {};
    
    // すべてのセマンティックカラーを生成
    for (const [key, lightValue] of Object.entries(lightColors)) {
      const darkValue = darkColors[key as keyof SemanticColors];
      
      const variable = this.createSemanticVariable(
        key,
        lightValue as string,
        darkValue as string,
        'colors'
      );
      
      if (variable) {
        variables[key] = variable;
      }
    }
    
    return variables;
  }
  
  /**
   * コンポーネントカラーを生成する
   */
  static createComponentColors(
    lightComponents: ComponentColors,
    darkComponents: ComponentColors
  ): void {
    // ボタンコンポーネントの変数を生成
    this.createComponentGroup('button', lightComponents.button, darkComponents.button);
    
    // カードコンポーネントの変数を生成
    this.createComponentGroup('card', lightComponents.card, darkComponents.card);
    
    // 入力フィールドコンポーネントの変数を生成
    this.createComponentGroup('input', lightComponents.input, darkComponents.input);
    
    // ダイアログコンポーネントの変数を生成
    this.createComponentGroup('dialog', lightComponents.dialog, darkComponents.dialog);
    
    // トーストコンポーネントの変数を生成
    this.createComponentGroup('toast', lightComponents.toast, darkComponents.toast);
    
    // ポップオーバーコンポーネントの変数を生成
    this.createComponentGroup('popover', lightComponents.popover, darkComponents.popover);
  }
  
  /**
   * デザインシステム変数をCSS変数としてエクスポートする
   */
  static exportAsCSSVariables(): string {
    let css = `:root {
  /* Generated by VariableSetting */
`;
    
    // コレクションごとに変数を取得してエクスポート
    for (const collectionType of Object.values(CollectionType)) {
      const collectionName = this.COLLECTION_NAMES[collectionType];
      const collection = this.collections[collectionName];
      const lightModeId = this.lightModeIds[collectionName];
      
      if (!collection || !lightModeId) continue;
      
      css += `\n  /* ${collectionName} Variables */\n`;
      
      // コレクションのすべての変数を取得
      const variables = figma.variables.getLocalVariables();
      const collectionVars = variables.filter(v => 
        v.variableCollectionId === collection.id
      );
      
      // ライトモードの変数を追加
      for (const variable of collectionVars) {
        const lightValue = variable.valuesByMode[lightModeId];
        if (lightValue) {
          const varName = variable.name.replace(/\s+/g, '-').toLowerCase();
          let cssValue = '';
          
          // 値の型に応じて変換
          if (variable.resolvedType === 'COLOR') {
            const { r, g, b, a } = lightValue as RGBA;
            cssValue = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
          } else if (variable.resolvedType === 'FLOAT') {
            cssValue = `${lightValue}px`;
          } else {
            cssValue = String(lightValue);
          }
          
          css += `  --${varName}: ${cssValue};\n`;
        }
      }
    }
    
    css += `}

.dark {
  /* Dark mode variables */
`;
    
    // ダークモードの変数を追加
    for (const collectionType of Object.values(CollectionType)) {
      const collectionName = this.COLLECTION_NAMES[collectionType];
      const collection = this.collections[collectionName];
      const darkModeId = this.darkModeIds[collectionName];
      
      if (!collection || !darkModeId) continue;
      
      css += `\n  /* ${collectionName} Variables */\n`;
      
      // コレクションのすべての変数を取得
      const variables = figma.variables.getLocalVariables();
      const collectionVars = variables.filter(v => 
        v.variableCollectionId === collection.id
      );
      
      // ダークモードの変数を追加
      for (const variable of collectionVars) {
        const darkValue = variable.valuesByMode[darkModeId];
        if (darkValue) {
          const varName = variable.name.replace(/\s+/g, '-').toLowerCase();
          let cssValue = '';
          
          // 値の型に応じて変換
          if (variable.resolvedType === 'COLOR') {
            const { r, g, b, a } = darkValue as RGBA;
            cssValue = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
          } else if (variable.resolvedType === 'FLOAT') {
            cssValue = `${darkValue}px`;
          } else {
            cssValue = String(darkValue);
          }
          
          css += `  --${varName}: ${cssValue};\n`;
        }
      }
    }
    
    css += `}
`;
    
    return css;
  }
  
  /**
   * デザインシステム変数をTailwind設定としてエクスポートする
   */
  static exportAsTailwindConfig(): string {
    let js = `// Generated by VariableSetting
module.exports = {\n`;
    js += `  theme: {\n`;
    js += `    extend: {\n`;
    
    // プリミティブコレクションから変数を取得
    const primitiveCollection = this.collections[this.COLLECTION_NAMES[CollectionType.Primitives]];
    const lightModeId = this.lightModeIds[this.COLLECTION_NAMES[CollectionType.Primitives]];
    
    if (primitiveCollection && lightModeId) {
      // カラーのエクスポート
      js += `      colors: {\n`;
      
      // コレクションのすべての変数を取得
      const variables = figma.variables.getLocalVariables();
      const colorVars = variables.filter(v => 
        v.variableCollectionId === primitiveCollection.id && 
        v.resolvedType === 'COLOR'
      );
      
      // カラーグループを取得
      const colorGroups = new Set<string>();
      for (const variable of colorVars) {
        const parts = variable.name.split('-');
        if (parts.length > 1) {
          colorGroups.add(parts[0]);
        }
      }
      
      // 各グループごとに出力
      for (const group of colorGroups) {
        js += `        '${group}': {\n`;
        
        // グループ内の変数を取得
        const groupVars = colorVars.filter(v => v.name.startsWith(`${group}-`));
        
        for (const variable of groupVars) {
          const key = variable.name.split('-')[1];
          
          const lightValue = variable.valuesByMode[lightModeId] as RGBA;
          if (lightValue) {
            const { r, g, b, a } = lightValue;
            const hex = this.rgbaToHex(r, g, b, a);
            js += `          '${key}': '${hex}',\n`;
          }
        }
        
        js += `        },\n`;
      }
      
      js += `      },\n`;
      
      // borderRadiusのエクスポート
      const radiusVars = variables.filter(v => 
        v.variableCollectionId === primitiveCollection.id && 
        v.resolvedType === 'FLOAT' &&
        v.name.startsWith('radius-') || v.name === 'radius'
      );
      
      if (radiusVars.length > 0) {
        js += `      borderRadius: {\n`;
        
        for (const variable of radiusVars) {
          let key = 'DEFAULT';
          if (variable.name !== 'radius') {
            key = variable.name.replace('radius-', '');
          }
          
          const value = variable.valuesByMode[lightModeId] as number;
          js += `        '${key}': '${value}px',\n`;
        }
        
        js += `      },\n`;
      }
      
      // spacingのエクスポート
      const spacingVars = variables.filter(v => 
        v.variableCollectionId === primitiveCollection.id && 
        v.resolvedType === 'FLOAT' &&
        v.name.includes('spacing')
      );
      
      if (spacingVars.length > 0) {
        js += `      spacing: {\n`;
        
        for (const variable of spacingVars) {
          const key = variable.name.replace('spacing-', '');
          
          const value = variable.valuesByMode[lightModeId] as number;
          js += `        '${key}': '${value}px',\n`;
        }
        
        js += `      },\n`;
      }
    }
    
    // 最後の閉じ括弧
    js += `    },\n`;
    js += `  },\n`;
    js += `  darkMode: 'class',\n`;
    js += `}\n`;
    
    return js;
  }
  
  /**
   * すべてのコレクションの変数をクリアする
   */
  static clearAllVariables(): void {
    for (const collectionName of Object.values(this.COLLECTION_NAMES)) {
      const collection = this.collections[collectionName];
      if (!collection) continue;
      
      // コレクションのすべての変数を取得
      const variables = figma.variables.getLocalVariables().filter(v => 
        v.variableCollectionId === collection.id
      );
      
      // 変数を削除
      logger.info(`Removing ${variables.length} variables from collection ${collectionName}`);
      variables.forEach(variable => {
        variable.remove();
      });
    }
    
    // キャッシュをクリア
    this.existingVariables.clear();
    
    logger.info("All variables cleared");
  }
}
