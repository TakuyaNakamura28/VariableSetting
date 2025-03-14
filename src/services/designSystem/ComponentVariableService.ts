/**
 * コンポーネント変数サービス
 * セマンティック変数を参照するコンポーネント変数の作成と管理を担当
 */

import { ICollectionManager, IVariableService, CollectionType } from '../figmaServiceTypes';
import { ComponentColors } from '../../types';

export class ComponentVariableService {
  constructor(
    private collectionManager: ICollectionManager,
    private variableService: IVariableService
  ) {}
  
  /**
   * コンポーネント変数を作成する
   */
  public createComponentVariable(
    name: string, 
    lightRefName: string, // セマンティック変数名または直接色
    darkRefName: string,  // セマンティック変数名または直接色
    groupName: string     // 'button', 'card' など
  ): Variable | null {
    try {
      // コレクションとモードIDを取得
      const collection = this.collectionManager.getCollection(CollectionType.Components);
      const lightModeId = this.collectionManager.getLightModeId(CollectionType.Components);
      const darkModeId = this.collectionManager.getDarkModeId(CollectionType.Components);
      
      if (!collection || !lightModeId || !darkModeId) {
        console.error(`Missing collection or mode IDs for component variables`);
        return null;
      }
      
      // 既存の変数を検索
      let variable = this.collectionManager.findVariableByName(name, CollectionType.Components);
      
      // 変数がなければ作成
      if (!variable) {
        variable = figma.variables.createVariable(
          name,
          collection.id,
          'COLOR'
        );
        
        // パスを設定
        this.variableService.setVariablePathName(variable, groupName);
      }
      
      // 変数を設定
      if (variable) {
        // ライトモードの値を設定
        this.setComponentVariableValue(variable, lightRefName, lightModeId);
        
        // ダークモードの値を設定
        this.setComponentVariableValue(variable, darkRefName, darkModeId);
      }
      
      return variable;
    } catch (error) {
      console.error(`Failed to create component variable ${name}:`, error);
      return null;
    }
  }
  
  /**
   * コンポーネントカラーを生成する
   */
  public createComponentColors(
    lightComponents: ComponentColors,
    darkComponents: ComponentColors
  ): void {
    console.log('Creating component colors');
    
    try {
      // 各コンポーネントグループに対して処理
      for (const [groupName, lightGroup] of Object.entries(lightComponents)) {
        const darkGroup = darkComponents[groupName] || {};
        this.createComponentGroup(groupName, lightGroup, darkGroup);
      }
      
      console.log('Component colors creation completed');
    } catch (error) {
      console.error(`Failed to create component colors: ${error}`);
    }
  }
  
  /**
   * コンポーネントグループを生成するユーティリティメソッド
   */
  private createComponentGroup(
    groupName: string, 
    lightGroup: Record<string, string>, 
    darkGroup: Record<string, string>
  ): void {
    try {
      console.log(`Creating component group: ${groupName}`);
      
      // グループ内の各変数に対して処理
      for (const [name, lightValue] of Object.entries(lightGroup)) {
        // 対応するダークモード値を取得
        const darkValue = darkGroup[name] || lightValue;
        
        // 変数名を構築
        const variableName = `${name}`;
        
        // 変数を作成
        this.createComponentVariable(
          variableName,
          lightValue,
          darkValue,
          groupName
        );
      }
      
      console.log(`Component group ${groupName} creation completed`);
    } catch (error) {
      console.error(`Failed to create component group ${groupName}: ${error}`);
    }
  }
  
  /**
   * コンポーネント変数に値またはセマンティック参照を設定
   */
  private setComponentVariableValue(
    variable: Variable,
    valueOrRef: string,
    modeId: string
  ): void {
    try {
      // 参照先の変数かどうかを判定（HEXカラーでないかつ既存セマンティック変数名）
      if (!valueOrRef.startsWith('#')) {
        // セマンティック変数を検索
        const refVariable = this.collectionManager.findVariableByName(valueOrRef, CollectionType.Semantic);
        
        if (refVariable) {
          // 循環参照チェック
          if (this.variableService.isCircularReference(variable.name, valueOrRef, CollectionType.Components)) {
            console.error(`Circular reference detected: ${variable.name} -> ${valueOrRef}`);
            return;
          }
          
          // 変数への参照を設定
          this.variableService.setVariableReference(variable, refVariable, modeId);
          return;
        }
        
        // セマンティック変数が見つからない場合、プリミティブ変数を検索
        const primRefVariable = this.collectionManager.findVariableByName(valueOrRef, CollectionType.Primitives);
        
        if (primRefVariable) {
          // 循環参照チェック
          if (this.variableService.isCircularReference(variable.name, valueOrRef, CollectionType.Components)) {
            console.error(`Circular reference detected: ${variable.name} -> ${valueOrRef}`);
            return;
          }
          
          // 変数への参照を設定
          this.variableService.setVariableReference(variable, primRefVariable, modeId);
          return;
        }
      }
      
      // 変数が見つからない場合や直接色の場合は直接値を設定
      const rgba = this.variableService.hexToFigmaColor(valueOrRef);
      variable.setValueForMode(modeId, rgba);
    } catch (error) {
      console.error(`Failed to set component variable value: ${error}`);
    }
  }
}
