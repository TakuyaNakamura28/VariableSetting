/**
 * Figma変数サービス実装
 * IVariableServiceインターフェースの実装クラス
 */
import { CollectionManager } from '../collections/CollectionManager';
import { IColorUtility } from '../interfaces/IColorUtility';
import { ICollectionManager } from '../interfaces/ICollectionManager';
import { IVariableService } from '../interfaces/IVariableService';
import { ColorUtils } from '../utils/ColorUtils';
import { 
  RGBA, 
  Variable, 
  VariableMode, 
  VariableType, 
  VariableCollection, 
  CollectionType,
  ColorPalette
} from '../types/VariableTypes';
import { createServiceLogger } from '../../../utils/logger';

// Figmaサービス用のロガーを作成
const logger = createServiceLogger('FigmaVariableService');

/**
 * Figma変数サービスクラス
 * SOLID原則に基づき、単一責任で実装
 */
export class FigmaVariableService implements IVariableService {
  // 依存オブジェクト
  private collectionManager: ICollectionManager;
  private colorUtils: IColorUtility;

  // コレクション名のマッピング
  private readonly COLLECTION_NAMES: Record<CollectionType, string> = {
    [CollectionType.Color]: 'Design System/Colors',
    [CollectionType.Typography]: 'Design System/Typography',
    [CollectionType.Spacing]: 'Design System/Spacing',
    [CollectionType.Grid]: 'Design System/Grid',
    [CollectionType.Shadow]: 'Design System/Shadows',
    [CollectionType.Custom]: 'Design System/Custom'
  };

  /**
   * コンストラクタ - 依存性注入パターンを採用
   * @param collectionManager コレクションマネージャー
   * @param colorUtils カラーユーティリティ
   */
  constructor(
    collectionManager: ICollectionManager = new CollectionManager(),
    colorUtils: IColorUtility = new ColorUtils()
  ) {
    this.collectionManager = collectionManager;
    this.colorUtils = colorUtils;
    logger.info('FigmaVariableService initialized with dependencies');
  }

  /**
   * 変数コレクションの初期化
   * @returns 成功したかどうか
   */
  public async initializeCollections(): Promise<boolean> {
    try {
      logger.info('Initializing collections');
      
      // 各コレクションタイプごとに初期化
      for (const type of Object.values(CollectionType)) {
        const collectionName = this.COLLECTION_NAMES[type];
        const success = await this.collectionManager.initializeCollection(collectionName);
        
        if (!success) {
          logger.error(`Failed to initialize collection: ${collectionName}`);
          return false;
        }
        
        logger.info(`Initialized collection: ${collectionName}`);
      }
      
      return true;
    } catch (error) {
      logger.error("Failed to initialize collections:", error);
      return false;
    }
  }

  /**
   * カラー変数を作成
   * @param name 変数名
   * @param lightValue ライトモード値（HEX形式）
   * @param darkValue ダークモード値（HEX形式）
   * @param collectionType コレクションタイプ
   * @param group グループ（オプション）
   * @returns 作成された変数、失敗した場合はnull
   */
  public createColorVariable(
    name: string,
    lightValue: string,
    darkValue: string,
    collectionType: CollectionType,
    group?: string
  ): Variable | null {
    try {
      logger.info(`Creating color variable: ${name} in collection: ${collectionType}`);
      
      // コレクション名を取得
      const collectionName = this.COLLECTION_NAMES[collectionType];
      
      // 既存の変数を検索
      const existingVariable = this.findVariableByName(name, collectionType);
      if (existingVariable) {
        logger.info(`Found existing variable: ${name}, updating values`);
        
        // 既存変数の値を更新
        const lightModeId = this.collectionManager.getModeId(collectionName, VariableMode.Light);
        const darkModeId = this.collectionManager.getModeId(collectionName, VariableMode.Dark);
        
        if (lightModeId && darkModeId) {
          // 色値をRGBAに変換
          const lightRgba = this.colorUtils.hexToRGBA(lightValue);
          const darkRgba = this.colorUtils.hexToRGBA(darkValue);
          
          // 既存変数の値を更新
          try {
            existingVariable.setValueForMode(lightModeId, lightRgba);
            existingVariable.setValueForMode(darkModeId, darkRgba);
            
            // グループがある場合はパス設定
            if (group) {
              this.setVariableGroup(existingVariable, group);
            }
            
            return existingVariable;
          } catch (error) {
            logger.error(`Failed to update variable values: ${error}`);
            return null;
          }
        } else {
          logger.error('Failed to get mode IDs');
          return null;
        }
      } else {
        // 新規作成
        logger.info(`Creating new variable: ${name}`);
        
        // コレクションを取得
        const collection = this.collectionManager.getCollection(collectionName);
        if (!collection) {
          logger.error(`Collection not found: ${collectionName}`);
          return null;
        }
        
        // 変数を作成
        try {
          const variable = figma.variables.createVariable(
            name,
            collection,
            'COLOR'
          );
          
          // モードIDを取得
          const lightModeId = this.collectionManager.getModeId(collectionName, VariableMode.Light);
          const darkModeId = this.collectionManager.getModeId(collectionName, VariableMode.Dark);
          
          if (lightModeId && darkModeId) {
            // 色値をRGBAに変換
            const lightRgba = this.colorUtils.hexToRGBA(lightValue);
            const darkRgba = this.colorUtils.hexToRGBA(darkValue);
            
            // 変数に値を設定
            variable.setValueForMode(lightModeId, lightRgba);
            variable.setValueForMode(darkModeId, darkRgba);
            
            // グループがある場合はパス設定
            if (group) {
              this.setVariableGroup(variable, group);
            }
            
            return variable;
          } else {
            logger.error('Failed to get mode IDs');
            return null;
          }
        } catch (error) {
          logger.error(`Failed to create variable: ${error}`);
          return null;
        }
      }
    } catch (error) {
      logger.error(`Error in createColorVariable for ${name}: ${error}`);
      return null;
    }
  }

  /**
   * 数値変数を作成
   * @param name 変数名
   * @param lightValue ライトモード値
   * @param darkValue ダークモード値
   * @param collectionType コレクションタイプ
   * @param group グループ（オプション）
   * @returns 作成された変数、失敗した場合はnull
   */
  public createNumberVariable(
    name: string,
    lightValue: number,
    darkValue: number,
    collectionType: CollectionType,
    group?: string
  ): Variable | null {
    try {
      logger.info(`Creating number variable: ${name} in collection: ${collectionType}`);
      
      // コレクション名を取得
      const collectionName = this.COLLECTION_NAMES[collectionType];
      
      // 既存の変数を検索
      const existingVariable = this.findVariableByName(name, collectionType);
      if (existingVariable) {
        logger.info(`Found existing variable: ${name}, updating values`);
        
        // 既存変数の値を更新
        const lightModeId = this.collectionManager.getModeId(collectionName, VariableMode.Light);
        const darkModeId = this.collectionManager.getModeId(collectionName, VariableMode.Dark);
        
        if (lightModeId && darkModeId) {
          // 既存変数の値を更新
          try {
            existingVariable.setValueForMode(lightModeId, lightValue);
            existingVariable.setValueForMode(darkModeId, darkValue);
            
            // グループがある場合はパス設定
            if (group) {
              this.setVariableGroup(existingVariable, group);
            }
            
            return existingVariable;
          } catch (error) {
            logger.error(`Failed to update variable values: ${error}`);
            return null;
          }
        } else {
          logger.error('Failed to get mode IDs');
          return null;
        }
      } else {
        // 新規作成
        logger.info(`Creating new variable: ${name}`);
        
        // コレクションを取得
        const collection = this.collectionManager.getCollection(collectionName);
        if (!collection) {
          logger.error(`Collection not found: ${collectionName}`);
          return null;
        }
        
        // 変数を作成
        try {
          const variable = figma.variables.createVariable(
            name,
            collection,
            'FLOAT'
          );
          
          // モードIDを取得
          const lightModeId = this.collectionManager.getModeId(collectionName, VariableMode.Light);
          const darkModeId = this.collectionManager.getModeId(collectionName, VariableMode.Dark);
          
          if (lightModeId && darkModeId) {
            // 変数に値を設定
            variable.setValueForMode(lightModeId, lightValue);
            variable.setValueForMode(darkModeId, darkValue);
            
            // グループがある場合はパス設定
            if (group) {
              this.setVariableGroup(variable, group);
            }
            
            return variable;
          } else {
            logger.error('Failed to get mode IDs');
            return null;
          }
        } catch (error) {
          logger.error(`Failed to create variable: ${error}`);
          return null;
        }
      }
    } catch (error) {
      logger.error(`Error in createNumberVariable for ${name}: ${error}`);
      return null;
    }
  }

  /**
   * 変数への参照を作成
   * @param name 変数名
   * @param sourceVariable 参照元変数
   * @param collectionType コレクションタイプ
   * @param group グループ（オプション）
   * @returns 作成された変数、失敗した場合はnull
   */
  public createVariableReference(
    name: string,
    sourceVariable: Variable,
    collectionType: CollectionType,
    group?: string
  ): Variable | null {
    try {
      logger.info(`Creating variable reference: ${name} -> ${sourceVariable.name}`);
      
      // コレクション名を取得
      const collectionName = this.COLLECTION_NAMES[collectionType];
      
      // 既存の変数を検索
      const existingVariable = this.findVariableByName(name, collectionType);
      
      let variable: Variable;
      
      if (existingVariable) {
        logger.info(`Found existing variable: ${name}, updating reference`);
        variable = existingVariable;
      } else {
        // 新規作成
        logger.info(`Creating new variable reference: ${name}`);
        
        // コレクションを取得
        const collection = this.collectionManager.getCollection(collectionName);
        if (!collection) {
          logger.error(`Collection not found: ${collectionName}`);
          return null;
        }
        
        // ソース変数の型に合わせて変数を作成
        variable = figma.variables.createVariable(
          name,
          collection,
          sourceVariable.variableType
        );
      }
      
      // モードIDを取得
      const lightModeId = this.collectionManager.getModeId(collectionName, VariableMode.Light);
      const darkModeId = this.collectionManager.getModeId(collectionName, VariableMode.Dark);
      
      if (lightModeId && darkModeId) {
        // 変数に参照を設定
        try {
          const aliasValue = {
            type: 'VARIABLE_ALIAS',
            id: sourceVariable.id
          };
          
          variable.setValueForMode(lightModeId, aliasValue);
          variable.setValueForMode(darkModeId, aliasValue);
          
          // グループがある場合はパス設定
          if (group) {
            this.setVariableGroup(variable, group);
          }
          
          return variable;
        } catch (error) {
          logger.error(`Failed to set variable reference: ${error}`);
          return null;
        }
      } else {
        logger.error('Failed to get mode IDs');
        return null;
      }
    } catch (error) {
      logger.error(`Error in createVariableReference for ${name}: ${error}`);
      return null;
    }
  }

  /**
   * 変数名で変数を検索
   * @param name 変数名
   * @param collectionType コレクションタイプ
   * @returns 見つかった変数、見つからない場合はnull
   */
  public findVariableByName(name: string, collectionType: CollectionType): Variable | null {
    try {
      const collectionName = this.COLLECTION_NAMES[collectionType];
      
      // コレクションマネージャを使用して検索
      const variable = this.collectionManager.findVariableByName(
        name,
        collectionName
      );
      
      return variable;
    } catch (error) {
      logger.error(`Error finding variable by name: ${name}`, error);
      return null;
    }
  }

  /**
   * プリミティブカラーパレットを作成
   * @param name ベース名
   * @param palette カラーパレット情報
   * @returns 作成された変数のマップ
   */
  public createPrimitiveColorPalette(name: string, palette: ColorPalette): Record<string, Variable> {
    const variables: Record<string, Variable> = {};
    logger.info(`Creating primitive color palette: ${name}`);
    
    try {
      // 基本色をRGBAに変換
      const baseRgba = this.colorUtils.hexToRGBA(palette.baseColor);
      
      // 各ステップの色を生成
      for (const step of palette.steps) {
        // ステップに応じて色を調整（明るさ調整）
        const lightnessAdjustment = palette.lightnessAdjustment || 1;
        let stepColor: RGBA;
        
        if (step < 500) {
          // 明るくする
          const amount = (500 - step) / 500 * lightnessAdjustment;
          stepColor = this.colorUtils.lightenColor(baseRgba, amount);
        } else if (step > 500) {
          // 暗くする
          const amount = (step - 500) / 500 * lightnessAdjustment;
          stepColor = this.colorUtils.darkenColor(baseRgba, amount);
        } else {
          // 500はベース色のまま
          stepColor = { ...baseRgba };
        }
        
        // 色を16進数形式に変換
        const hexColor = this.colorUtils.rgbaToHex(stepColor);
        
        // 変数名を生成
        const varName = `${name}-${step}`;
        
        // 変数を作成
        const variable = this.createColorVariable(
          varName,
          hexColor,
          hexColor, // プリミティブなのでライト/ダークモードは同色
          CollectionType.Color,
          `primitives/${name}`
        );
        
        if (variable) {
          variables[step.toString()] = variable;
          logger.info(`Created color variable: ${varName} = ${hexColor}`);
        }
      }
      
      return variables;
    } catch (error) {
      logger.error(`Error creating primitive color palette: ${name}`, error);
      return variables;
    }
  }

  /**
   * セマンティックカラー変数を作成
   * @param name 変数名
   * @param lightVariable ライトモードで参照する変数
   * @param darkVariable ダークモードで参照する変数
   * @param group グループ（オプション）
   * @returns 作成された変数、失敗した場合はnull
   */
  public createSemanticColorVariable(
    name: string,
    lightVariable: Variable,
    darkVariable: Variable,
    group?: string
  ): Variable | null {
    try {
      logger.info(`Creating semantic color variable: ${name}`);
      
      // コレクション名を取得
      const collectionName = this.COLLECTION_NAMES[CollectionType.Color];
      
      // 既存の変数を検索
      const existingVariable = this.findVariableByName(name, CollectionType.Color);
      
      let variable: Variable;
      
      if (existingVariable) {
        logger.info(`Found existing variable: ${name}, updating references`);
        variable = existingVariable;
      } else {
        // 新規作成
        logger.info(`Creating new semantic variable: ${name}`);
        
        // コレクションを取得
        const collection = this.collectionManager.getCollection(collectionName);
        if (!collection) {
          logger.error(`Collection not found: ${collectionName}`);
          return null;
        }
        
        // 変数を作成
        variable = figma.variables.createVariable(
          name,
          collection,
          'COLOR'
        );
      }
      
      // モードIDを取得
      const lightModeId = this.collectionManager.getModeId(collectionName, VariableMode.Light);
      const darkModeId = this.collectionManager.getModeId(collectionName, VariableMode.Dark);
      
      if (lightModeId && darkModeId) {
        // 変数に参照を設定
        try {
          const lightAliasValue = {
            type: 'VARIABLE_ALIAS',
            id: lightVariable.id
          };
          
          const darkAliasValue = {
            type: 'VARIABLE_ALIAS',
            id: darkVariable.id
          };
          
          variable.setValueForMode(lightModeId, lightAliasValue);
          variable.setValueForMode(darkModeId, darkAliasValue);
          
          // グループがある場合はパス設定
          if (group) {
            this.setVariableGroup(variable, `semantic/${group}`);
          }
          
          return variable;
        } catch (error) {
          logger.error(`Failed to set variable reference: ${error}`);
          return null;
        }
      } else {
        logger.error('Failed to get mode IDs');
        return null;
      }
    } catch (error) {
      logger.error(`Error in createSemanticColorVariable for ${name}: ${error}`);
      return null;
    }
  }

  /**
   * 変数のグループを設定する（プライベートヘルパーメソッド）
   * @param variable 対象変数
   * @param group グループパス
   */
  private setVariableGroup(variable: Variable, group: string): void {
    try {
      // 変数に組織的な階層を設定
      if (variable && group) {
        // プロパティで直接設定
        if ('resolvedType' in variable) {
          variable.resolvedType = group;
        }
        
        // JSONでエクスポートする場合のパス設定
        if (figma.variables.setVariableCodeSyntax) {
          figma.variables.setVariableCodeSyntax(variable, {
            property: group + '/' + variable.name,
            alias: group + '-' + variable.name
          });
        }
      }
    } catch (error) {
      logger.error(`Error setting variable group: ${error}`);
    }
  }
}
