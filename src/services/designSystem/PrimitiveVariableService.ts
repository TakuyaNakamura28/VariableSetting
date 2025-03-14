/**
 * プリミティブ変数サービス
 * 基本的なプリミティブ変数（色、数値など）の作成と管理を担当
 */

import { 
  ICollectionManager, 
  IPrimitiveVariableService, 
  IColorUtility,
  IShadowUtility,
  INumberUtility,
  ILoggerService,
  CollectionType 
} from '../figmaServiceTypes';
import { ColorPalette } from '../../types';
import { BaseVariableService } from '../BaseVariableService';

export class PrimitiveVariableService extends BaseVariableService implements IPrimitiveVariableService {
  private shadowUtility: IShadowUtility;
  private numberUtility: INumberUtility;
  // BaseVariableServiceとアクセス修飾子を合わせる（protectedに変更）
  protected readonly colorUtility: IColorUtility;
  
  constructor(
    collectionManager: ICollectionManager,
    logger: ILoggerService,
    shadowUtility: IShadowUtility,
    numberUtility: INumberUtility,
    colorUtility: IColorUtility
  ) {
    super(collectionManager, logger);
    this.shadowUtility = shadowUtility;
    this.numberUtility = numberUtility;
    this.colorUtility = colorUtility;
  }
  
  /**
   * カラー変数を作成する
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
      // ベースクラスのメソッドを呼び出す
      return super.createColorVariable(name, lightValue, darkValue, collectionType, group);
    } catch (error) {
      this.logger.error(`Error creating color variable ${name}:`, error);
      return null;
    }
  }

  /**
   * プリミティブカラーパレットを生成する
   * @param {string} name パレット名
   * @param {ColorPalette} palette 色パレット
   * @returns {Record<string, Variable>} 作成された変数のマップ
   */
  createPrimitiveColorPalette(name: string, palette: ColorPalette): Record<string, Variable> {
    try {
      const variables: Record<string, Variable> = {};
      
      // コレクションとモードIDを取得
      const collection = this.collectionManager.getCollection(CollectionType.Primitives);
      const lightModeId = this.collectionManager.getLightModeId(CollectionType.Primitives);
      const darkModeId = this.collectionManager.getDarkModeId(CollectionType.Primitives);
      
      if (!collection || !lightModeId || !darkModeId) {
        this.logger.error(`Missing collection or mode IDs for color palette`);
        return {};
      }
      
      // パレットの各色に対して変数を作成
      for (const [shade, value] of Object.entries(palette)) {
        const variableName = `${name}/${shade}`;
        
        // 既存の変数を検索
        let variable = this.collectionManager.findVariableByName(variableName, CollectionType.Primitives);
        
        // 変数がなければ作成
        if (!variable) {
          variable = figma.variables.createVariable(variableName, collection.id, 'COLOR');
          
          // パス設定
          this.setVariablePathName(variable, name);
        }
        
        // 値を設定 (ライトモードとダークモードに同じ値)
        if (variable) {
          const color = this.parseColor(value);
          this.setVariableValue(variable, lightModeId, color);
          this.setVariableValue(variable, darkModeId, color);
          variables[shade] = variable;
        }
      }
      
      this.logger.log(`Created ${Object.keys(variables).length} palette variables for ${name}`);
      return variables;
    } catch (error) {
      this.logger.error(`Failed to create primitive color palette:`, error);
      return {};
    }
  }

  /**
   * プリミティブ数値トークンを生成する
   * @param {string} tokenType トークンタイプ
   * @param {Record<string, string>} tokens トークン
   * @returns {Record<string, Variable>} 作成された変数のマップ
   */
  createPrimitiveNumberTokens(
    tokenType: string,
    tokens: Record<string, string>
  ): Record<string, Variable> {
    try {
      const variables: Record<string, Variable> = {};
      
      // コレクションとモードIDを取得
      const collection = this.collectionManager.getCollection(CollectionType.Primitives);
      const lightModeId = this.collectionManager.getLightModeId(CollectionType.Primitives);
      const darkModeId = this.collectionManager.getDarkModeId(CollectionType.Primitives);
      
      if (!collection || !lightModeId || !darkModeId) {
        this.logger.error(`Missing collection or mode IDs for number tokens`);
        return {};
      }
      
      // 各トークンに対して変数を作成
      for (const [key, value] of Object.entries(tokens)) {
        const variableName = `${tokenType}/${key}`;
        
        // 既存の変数を検索
        let variable = this.collectionManager.findVariableByName(variableName, CollectionType.Primitives);
        
        // 変数がなければ作成
        if (!variable) {
          variable = figma.variables.createVariable(variableName, collection.id, 'FLOAT');
          
          // パス設定
          this.setVariablePathName(variable, tokenType);
        }
        
        // 値を設定 (ライトモードとダークモードに同じ値)
        if (variable) {
          const numValue = this.parseNumberValue(value);
          variable.setValueForMode(lightModeId, numValue);
          variable.setValueForMode(darkModeId, numValue);
          variables[key] = variable;
        }
      }
      
      this.logger.log(`Created ${Object.keys(variables).length} number token variables for ${tokenType}`);
      return variables;
    } catch (error) {
      this.logger.error(`Failed to create primitive number tokens:`, error);
      return {};
    }
  }

  /**
   * シャドウ変数を生成する
   * @param {Record<string, string>} lightShadows ライトモードのシャドウ
   * @param {Record<string, string>} darkShadows ダークモードのシャドウ
   * @returns {Record<string, Variable>} 作成された変数のマップ
   */
  createShadowVariables(
    lightShadows: Record<string, string>,
    darkShadows: Record<string, string>
  ): Record<string, Variable> {
    try {
      const variables: Record<string, Variable> = {};
      
      // コレクションとモードIDを取得
      const collection = this.collectionManager.getCollection(CollectionType.Primitives);
      const lightModeId = this.collectionManager.getLightModeId(CollectionType.Primitives);
      const darkModeId = this.collectionManager.getDarkModeId(CollectionType.Primitives);
      
      if (!collection || !lightModeId || !darkModeId) {
        this.logger.error(`Missing collection or mode IDs for primitives`);
        return {};
      }
      
      // 各シャドウに対して変数を作成
      for (const [name, lightValue] of Object.entries(lightShadows)) {
        // 対応するダークモード値を取得
        const darkValue = darkShadows[name] || lightValue;
        
        // 既存の変数を検索
        let variable = this.collectionManager.findVariableByName(name, CollectionType.Primitives);
        
        // 変数がなければ作成
        if (!variable) {
          variable = figma.variables.createVariable(
            name,
            collection.id,
            'EFFECT'
          );
          
          // パスを設定
          this.setVariablePathName(variable, 'shadows');
        }
        
        // シャドウ値をパース
        const lightShadowObj = this.parseShadowValue(lightValue);
        const darkShadowObj = this.parseShadowValue(darkValue);
        
        // 値を設定
        if (variable) {
          // 効果値（EffectValue）を用いるが、VariableValueに変換する必要がある
          // 型キャストを行い、Figma APIの期待する形式に合わせる
          variable.setValueForMode(lightModeId, lightShadowObj as unknown as VariableValue);
          variable.setValueForMode(darkModeId, darkShadowObj as unknown as VariableValue);
          variables[name] = variable;
        }
      }
      
      this.logger.log(`Created ${Object.keys(variables).length} shadow variables`);
      return variables;
    } catch (error) {
      this.logger.error(`Failed to create shadow variables:`, error);
      return {};
    }
  }

  /**
   * 数値文字列を解析し、数値に変換する
   * @param {string} value 数値文字列（単位付きも可）
   * @returns {number} 変換された数値
   */
  parseNumberValue(value: string): number {
    try {
      return this.numberUtility.parseNumberValue(value);
    } catch (error) {
      this.logger.error(`Failed to parse number value ${value}:`, error);
      return 0;
    }
  }

  /**
   * シャドウ文字列を解析し、Figmaのエフェクト値に変換する
   * @param {string} shadowStr シャドウ文字列
   * @returns {EffectValue} 変換されたエフェクト値
   */
  parseShadowValue(shadowStr: string): EffectValue {
    try {
      return this.shadowUtility.parseShadowValue(shadowStr);
    } catch (error) {
      this.logger.error(`Failed to parse shadow value ${shadowStr}:`, error);
      // エラー時はデフォルトのシャドウ値を返す
      return {
        type: "DROP_SHADOW",
        color: { r: 0, g: 0, b: 0, a: 0.2 },
        offset: { x: 0, y: 0 },
        radius: 0,
        spread: 0,
        visible: true,
        // BlendModeは正確な型に合わせる（ユニオン型の一つを直接指定）
        blendMode: "NORMAL"
      };
    }
  }
}
