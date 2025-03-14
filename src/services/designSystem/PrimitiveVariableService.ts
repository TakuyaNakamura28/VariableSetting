/**
 * プリミティブ変数サービス
 * 基本的なプリミティブ変数（色、数値など）の作成と管理を担当
 */

import { ICollectionManager, IVariableService, CollectionType } from '../figmaServiceTypes';
import { ColorPalette } from '../../types';

export class PrimitiveVariableService {
  constructor(
    private collectionManager: ICollectionManager,
    private variableService: IVariableService
  ) {}
  
  /**
   * プリミティブカラーパレットを生成する
   */
  public createPrimitiveColorPalette(name: string, palette: ColorPalette): Record<string, Variable> {
    console.log(`Creating primitive color palette: ${name}`);
    const variables: Record<string, Variable> = {};
    
    try {
      // パレットの各色に対して変数を作成
      for (const [shade, color] of Object.entries(palette)) {
        // 変数名を構築 (例: blue-500)
        const variableName = `${name}-${shade}`;
        
        // 変数を作成
        const variable = this.variableService.createColorVariable(
          variableName,
          color,       // ライトモード
          color,       // ダークモード (同じ値)
          CollectionType.Primitives,
          name         // グループ名
        );
        
        if (variable) {
          variables[variableName] = variable;
        }
      }
      
      console.log(`Created ${Object.keys(variables).length} primitive color variables`);
      return variables;
    } catch (error) {
      console.error(`Failed to create primitive color palette: ${error}`);
      return {};
    }
  }
  
  /**
   * プリミティブ数値トークンを生成する
   */
  public createPrimitiveNumberTokens(
    tokenType: string,
    tokens: Record<string, string>
  ): Record<string, Variable> {
    console.log(`Creating primitive number tokens: ${tokenType}`);
    const variables: Record<string, Variable> = {};
    
    try {
      // トークン一覧を取得
      const collection = this.collectionManager.getCollection(CollectionType.Primitives);
      const lightModeId = this.collectionManager.getLightModeId(CollectionType.Primitives);
      const darkModeId = this.collectionManager.getDarkModeId(CollectionType.Primitives);
      
      if (!collection || !lightModeId || !darkModeId) {
        console.error(`Missing collection or mode IDs for primitives`);
        return {};
      }
      
      // 各トークンに対して変数を作成
      for (const [key, value] of Object.entries(tokens)) {
        // 変数名を構築 (例: spacing-sm)
        const variableName = `${key}`;
        
        // 値を数値に変換
        const numValue = this.parseNumberValue(value);
        
        // 既存の変数を検索
        let variable = this.collectionManager.findVariableByName(variableName, CollectionType.Primitives);
        
        // 変数がなければ作成
        if (!variable) {
          variable = figma.variables.createVariable(
            variableName,
            collection.id,
            'FLOAT'
          );
          
          // パスを設定
          this.variableService.setVariablePathName(variable, tokenType);
        }
        
        // 値を設定
        if (variable) {
          variable.setValueForMode(lightModeId, numValue);
          variable.setValueForMode(darkModeId, numValue);
          variables[variableName] = variable;
        }
      }
      
      console.log(`Created ${Object.keys(variables).length} primitive number tokens`);
      return variables;
    } catch (error) {
      console.error(`Failed to create primitive number tokens: ${error}`);
      return {};
    }
  }
  
  /**
   * シャドウ変数を生成する
   */
  public createShadowVariables(
    lightShadows: Record<string, string>,
    darkShadows: Record<string, string>
  ): Record<string, Variable> {
    console.log(`Creating shadow variables`);
    const variables: Record<string, Variable> = {};
    
    try {
      // コレクションを取得
      const collection = this.collectionManager.getCollection(CollectionType.Primitives);
      const lightModeId = this.collectionManager.getLightModeId(CollectionType.Primitives);
      const darkModeId = this.collectionManager.getDarkModeId(CollectionType.Primitives);
      
      if (!collection || !lightModeId || !darkModeId) {
        console.error(`Missing collection or mode IDs for primitives`);
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
            'BOX_SHADOW'
          );
          
          // パスを設定
          this.variableService.setVariablePathName(variable, 'shadows');
        }
        
        // シャドウ値をパース
        const lightShadowObj = this.parseShadowValue(lightValue);
        const darkShadowObj = this.parseShadowValue(darkValue);
        
        // 値を設定
        if (variable) {
          variable.setValueForMode(lightModeId, lightShadowObj);
          variable.setValueForMode(darkModeId, darkShadowObj);
          variables[name] = variable;
        }
      }
      
      console.log(`Created ${Object.keys(variables).length} shadow variables`);
      return variables;
    } catch (error) {
      console.error(`Failed to create shadow variables: ${error}`);
      return {};
    }
  }
  
  /**
   * 文字列の単位値を数値に変換する
   */
  private parseNumberValue(value: string): number {
    // 単位を削除して数値に変換
    return parseFloat(value.replace(/px|rem|em|%/g, ''));
  }
  
  /**
   * シャドウ値をパースしてFigmaのシャドウ効果に変換
   */
  private parseShadowValue(shadowStr: string): Effect {
    // シンプルな実装 - 実際にはより複雑なパースが必要かもしれない
    // 例: "0px 4px 8px rgba(0, 0, 0, 0.1)"
    const parts = shadowStr.split(' ');
    
    // デフォルト値
    const shadow: Effect = {
      type: 'DROP_SHADOW',
      visible: true,
      radius: 4,
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      blendMode: 'NORMAL',
      offset: { x: 0, y: 4 }
    };
    
    // 値を設定（簡易実装）
    if (parts.length >= 3) {
      // X オフセット
      shadow.offset.x = parseFloat(parts[0]);
      // Y オフセット
      shadow.offset.y = parseFloat(parts[1]);
      // ぼかし半径
      shadow.radius = parseFloat(parts[2]);
      
      // 色情報が含まれている場合
      if (parts.length >= 4 && parts[3].includes('rgba')) {
        const colorMatch = parts[3].match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
        if (colorMatch) {
          shadow.color = {
            r: parseInt(colorMatch[1]) / 255,
            g: parseInt(colorMatch[2]) / 255,
            b: parseInt(colorMatch[3]) / 255,
            a: parseFloat(colorMatch[4])
          };
        }
      }
    }
    
    return shadow;
  }
}
