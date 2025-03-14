/**
 * セマンティック変数サービス
 * プリミティブ変数を参照するセマンティック変数の作成と管理を担当
 */

import { ICollectionManager, IVariableService, CollectionType } from '../figmaServiceTypes';
import { SemanticColors } from '../../types';

export class SemanticVariableService {
  constructor(
    private collectionManager: ICollectionManager,
    private variableService: IVariableService
  ) {}
  
  /**
   * セマンティック変数を作成する（名前ベースの参照）
   */
  public createSemanticVariable(
    name: string, 
    lightRefName: string, // プリミティブ変数名または直接色
    darkRefName: string,  // プリミティブ変数名または直接色
    variableType: string  // 'colors', 'spacing' など
  ): Variable | null {
    try {
      // コレクションとモードIDを取得
      const collection = this.collectionManager.getCollection(CollectionType.Semantic);
      const lightModeId = this.collectionManager.getLightModeId(CollectionType.Semantic);
      const darkModeId = this.collectionManager.getDarkModeId(CollectionType.Semantic);
      
      if (!collection || !lightModeId || !darkModeId) {
        console.error(`Missing collection or mode IDs for semantic variables`);
        return null;
      }
      
      // 既存の変数を検索
      let variable = this.collectionManager.findVariableByName(name, CollectionType.Semantic);
      
      // 変数がなければ作成
      if (!variable) {
        variable = figma.variables.createVariable(
          name,
          collection.id,
          'COLOR'
        );
        
        // パスを設定
        this.variableService.setVariablePathName(variable, variableType);
      }
      
      // 変数を設定
      if (variable) {
        // ライトモードの値を設定
        this.setSemanticVariableValue(variable, lightRefName, lightModeId);
        
        // ダークモードの値を設定
        this.setSemanticVariableValue(variable, darkRefName, darkModeId);
      }
      
      return variable;
    } catch (error) {
      console.error(`Failed to create semantic variable ${name}:`, error);
      return null;
    }
  }
  
  /**
   * セマンティックカラーを生成する
   */
  public createSemanticColors(
    lightColors: SemanticColors,
    darkColors: SemanticColors
  ): Record<string, Variable> {
    console.log('Creating semantic colors');
    const variables: Record<string, Variable> = {};
    
    try {
      // 各セマンティックカラーに対して変数を作成
      for (const [category, colors] of Object.entries(lightColors)) {
        for (const [name, lightValue] of Object.entries(colors)) {
          // 対応するダークモード値を取得
          const darkValue = darkColors[category]?.[name] || lightValue;
          
          // 変数名を構築
          const variableName = `${name}`;
          
          // 変数を作成
          const variable = this.createSemanticVariable(
            variableName,
            lightValue,
            darkValue,
            category
          );
          
          if (variable) {
            variables[variableName] = variable;
          }
        }
      }
      
      console.log(`Created ${Object.keys(variables).length} semantic color variables`);
      return variables;
    } catch (error) {
      console.error(`Failed to create semantic colors: ${error}`);
      return {};
    }
  }
  
  /**
   * セマンティック変数に値またはプリミティブ参照を設定
   */
  private setSemanticVariableValue(
    variable: Variable,
    valueOrRef: string,
    modeId: string
  ): void {
    try {
      // 参照先の変数かどうかを判定（HEXカラーでないかつ既存プリミティブ変数名）
      if (!valueOrRef.startsWith('#')) {
        // プリミティブ変数を検索
        const refVariable = this.collectionManager.findVariableByName(valueOrRef, CollectionType.Primitives);
        
        if (refVariable) {
          // 循環参照チェック
          if (this.variableService.isCircularReference(variable.name, valueOrRef, CollectionType.Semantic)) {
            console.error(`Circular reference detected: ${variable.name} -> ${valueOrRef}`);
            return;
          }
          
          // 変数への参照を設定
          this.variableService.setVariableReference(variable, refVariable, modeId);
          return;
        }
      }
      
      // プリミティブ変数が見つからない場合や直接色の場合は直接値を設定
      const rgba = this.variableService.hexToFigmaColor(valueOrRef);
      variable.setValueForMode(modeId, rgba);
    } catch (error) {
      console.error(`Failed to set semantic variable value: ${error}`);
    }
  }
}
