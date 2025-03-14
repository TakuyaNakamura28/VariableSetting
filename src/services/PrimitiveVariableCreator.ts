/**
 * PrimitiveVariableCreator
 * プリミティブ変数の作成を担当するクラス
 */
import { ICollectionManager, CollectionType, IVariableCreator } from './figmaServiceTypes';
import { getRGBAFromHex } from '../utils/colorUtils';

/**
 * プリミティブ変数作成クラス
 */
export class PrimitiveVariableCreator implements IVariableCreator {
  private collectionManager: ICollectionManager;

  /**
   * コンストラクタ
   * @param {ICollectionManager} collectionManager コレクション管理オブジェクト
   */
  constructor(collectionManager: ICollectionManager) {
    this.collectionManager = collectionManager;
  }

  /**
   * 変数を作成する
   * @param {string} name 変数名
   * @param {string} lightValue Light モードの値 (HEX)
   * @param {string} darkValue Dark モードの値 (HEX)
   * @param {string} [group] グループ名
   * @returns {Variable | null} 作成した変数またはnull
   */
  createVariable(name: string, lightValue: string, darkValue: string, group?: string): Variable | null {
    try {
      // グループ付きの場合は名前を変更
      const variableName = group ? `${group}/${name}` : name;
      
      // 既存の変数をチェック
      const existingVariable = this.collectionManager.findVariableByName(
        variableName, 
        CollectionType.Primitives
      );
      
      if (existingVariable) {
        // 既存の変数が見つかった場合は値を更新
        this.updateVariableValues(existingVariable, lightValue, darkValue);
        return existingVariable;
      }
      
      // 新しい変数を作成
      const collection = this.collectionManager.getCollection(CollectionType.Primitives);
      if (!collection) {
        throw new Error('Primitives collection not found');
      }
      
      // Figma変数APIを使用して変数を作成
      const variable = figma.variables.createVariable(
        variableName,
        collection.id,
        'COLOR'
      );
      
      // 値を設定
      this.updateVariableValues(variable, lightValue, darkValue);
      
      // 変数をキャッシュに追加
      this.collectionManager.addToCache(variable);
      
      return variable;
    } catch (error) {
      figma.notify(`Failed to create variable "${name}": ${error}`, { error: true });
      return null;
    }
  }

  /**
   * 複数の変数を作成する
   * @param {string[]} names 変数名の配列
   * @param {string[]} lightValues Light モードの値の配列 (HEX)
   * @param {string[]} darkValues Dark モードの値の配列 (HEX)
   * @param {string} [group] グループ名
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createVariables(names: string[], lightValues: string[], darkValues: string[], group?: string): Record<string, Variable | null> {
    const variables: Record<string, Variable | null> = {};
    
    // 配列の長さが一致するかチェック
    const length = Math.min(names.length, lightValues.length, darkValues.length);
    
    for (let i = 0; i < length; i++) {
      const name = names[i];
      const lightValue = lightValues[i];
      const darkValue = darkValues[i];
      
      const variable = this.createVariable(name, lightValue, darkValue, group);
      variables[name] = variable;
    }
    
    return variables;
  }

  /**
   * カラーパレットを作成する
   * @param {string} baseColor ベースカラー (HEX)
   * @param {string} [_group] グループ名
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createColorPalette(baseColor: string, _group?: string): Record<string, Variable | null> {
    // 簡易的なカラーパレット生成（実際にはより高度なアルゴリズムを使用する）
    const palette: Record<string, string> = {
      '50': this.lightenColor(baseColor, 0.9),
      '100': this.lightenColor(baseColor, 0.8),
      '200': this.lightenColor(baseColor, 0.6),
      '300': this.lightenColor(baseColor, 0.4),
      '400': this.lightenColor(baseColor, 0.2),
      '500': baseColor,
      '600': this.darkenColor(baseColor, 0.1),
      '700': this.darkenColor(baseColor, 0.2),
      '800': this.darkenColor(baseColor, 0.3),
      '900': this.darkenColor(baseColor, 0.4),
      '950': this.darkenColor(baseColor, 0.5),
    };
    
    // 同じパレットをライトモードとダークモードの両方に使用（簡易実装）
    return this.createPrimitiveColorPalette('color', palette);
  }

  /**
   * 数値トークンを作成する
   * @param {Record<string, number>} tokens トークン (キー: 名前, 値: 数値)
   * @param {string} [_group] グループ名
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createNumberTokens(tokens: Record<string, number>, _group?: string): Record<string, Variable | null> {
    return this.createPrimitiveNumberTokens(_group || 'number', tokens);
  }

  /**
   * シャドウトークンを作成する
   * @param {Record<string, EffectValue[]>} tokens シャドウトークン
   * @param {string} [_group] グループ名
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createShadowTokens(tokens: Record<string, EffectValue[]>, _group?: string): Record<string, Variable | null> {
    // 同じトークンをライトモードとダークモードの両方に使用（簡易実装）
    return this.createShadowVariables(tokens, tokens);
  }

  /**
   * 変数の値を更新する
   * @private
   * @param {Variable} variable 更新する変数
   * @param {string} lightValue Light モードの値 (HEX)
   * @param {string} darkValue Dark モードの値 (HEX)
   */
  private updateVariableValues(variable: Variable, lightValue: string, darkValue: string): void {
    const lightModeId = this.collectionManager.getLightModeId(CollectionType.Primitives);
    const darkModeId = this.collectionManager.getDarkModeId(CollectionType.Primitives);
    
    if (lightModeId) {
      // HEX カラーを RGBA に変換
      const lightColor = getRGBAFromHex(lightValue);
      variable.setValueForMode(lightModeId, lightColor);
    }
    
    if (darkModeId) {
      // HEX カラーを RGBA に変換
      const darkColor = getRGBAFromHex(darkValue);
      variable.setValueForMode(darkModeId, darkColor);
    }
  }

  /**
   * プリミティブカラーパレットを作成する
   * @param {string} baseName ベース名
   * @param {Record<string, string>} palette カラーパレット (キー: バリアント名, 値: HEX カラー)
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createPrimitiveColorPalette(baseName: string, palette: Record<string, string>): Record<string, Variable | null> {
    const variables: Record<string, Variable | null> = {};
    
    // Light モードとして扱う
    const lightPalette = palette;
    
    // Dark モードとして逆の色を使用（暫定）
    const darkPalette: Record<string, string> = {};
    Object.keys(lightPalette).forEach(key => {
      // 簡易実装（実際には適切なダークモードカラーを設定する必要あり）
      darkPalette[key] = lightPalette[key];
    });
    
    // 各カラーに対して変数を作成
    Object.entries(lightPalette).forEach(([variant, lightColor]) => {
      const darkColor = darkPalette[variant];
      const name = variant === 'default' ? baseName : `${baseName}-${variant}`;
      
      const variable = this.createVariable(name, lightColor, darkColor);
      if (variable) {
        variables[name] = variable;
      } else {
        variables[name] = null;
      }
    });
    
    return variables;
  }

  /**
   * 数値トークンを作成する
   * @param {string} name トークン名
   * @param {number} lightValue Light モードの値
   * @param {number} darkValue Dark モードの値
   * @param {string} [_group] グループ名
   * @returns {Variable | null} 作成した変数またはnull
   */
  createNumberToken(name: string, lightValue: number, darkValue: number, _group?: string): Variable | null {
    try {
      // グループ付きの場合は名前を変更
      const variableName = _group ? `${_group}/${name}` : name;
      
      // 既存の変数をチェック
      const existingVariable = this.collectionManager.findVariableByName(
        variableName, 
        CollectionType.Primitives
      );
      
      if (existingVariable) {
        // 既存の変数が見つかった場合は値を更新
        this.updateNumberVariableValues(existingVariable, lightValue, darkValue);
        return existingVariable;
      }
      
      // 新しい変数を作成
      const collection = this.collectionManager.getCollection(CollectionType.Primitives);
      if (!collection) {
        throw new Error('Primitives collection not found');
      }
      
      // Figma変数APIを使用して変数を作成
      const variable = figma.variables.createVariable(
        variableName,
        collection.id,
        'FLOAT'
      );
      
      // 値を設定
      this.updateNumberVariableValues(variable, lightValue, darkValue);
      
      // 変数をキャッシュに追加
      this.collectionManager.addToCache(variable);
      
      return variable;
    } catch (error) {
      figma.notify(`Failed to create number token "${name}": ${error}`, { error: true });
      return null;
    }
  }

  /**
   * 数値変数の値を更新する
   * @private
   * @param {Variable} variable 更新する変数
   * @param {number} lightValue Light モードの値
   * @param {number} darkValue Dark モードの値
   */
  private updateNumberVariableValues(variable: Variable, lightValue: number, darkValue: number): void {
    const lightModeId = this.collectionManager.getLightModeId(CollectionType.Primitives);
    const darkModeId = this.collectionManager.getDarkModeId(CollectionType.Primitives);
    
    if (lightModeId) {
      variable.setValueForMode(lightModeId, lightValue);
    }
    
    if (darkModeId) {
      variable.setValueForMode(darkModeId, darkValue);
    }
  }

  /**
   * シャドウトークンを作成する
   * @param {string} name トークン名
   * @param {EffectValue[]} lightValue Light モードの値
   * @param {EffectValue[]} darkValue Dark モードの値
   * @param {string} [_group] グループ名
   * @returns {Variable | null} 作成した変数またはnull
   */
  createShadowToken(name: string, lightValue: EffectValue[], darkValue: EffectValue[], _group?: string): Variable | null {
    try {
      // グループ付きの場合は名前を変更
      const variableName = _group ? `${_group}/${name}` : name;
      
      // 既存の変数をチェック
      const existingVariable = this.collectionManager.findVariableByName(
        variableName, 
        CollectionType.Primitives
      );
      
      if (existingVariable) {
        // 既存の変数が見つかった場合は値を更新
        this.updateShadowVariableValues(existingVariable, lightValue, darkValue);
        return existingVariable;
      }
      
      // 新しい変数を作成
      const collection = this.collectionManager.getCollection(CollectionType.Primitives);
      if (!collection) {
        throw new Error('Primitives collection not found');
      }
      
      // Figma変数APIを使用して変数を作成
      const variable = figma.variables.createVariable(
        variableName,
        collection.id,
        'EFFECT'
      );
      
      // 値を設定
      this.updateShadowVariableValues(variable, lightValue, darkValue);
      
      // 変数をキャッシュに追加
      this.collectionManager.addToCache(variable);
      
      return variable;
    } catch (error) {
      figma.notify(`Failed to create shadow token "${name}": ${error}`, { error: true });
      return null;
    }
  }

  /**
   * シャドウ変数の値を更新する
   * @private
   * @param {Variable} variable 更新する変数
   * @param {EffectValue[]} lightValue Light モードの値
   * @param {EffectValue[]} darkValue Dark モードの値
   */
  private updateShadowVariableValues(variable: Variable, lightValue: EffectValue[], darkValue: EffectValue[]): void {
    const lightModeId = this.collectionManager.getLightModeId(CollectionType.Primitives);
    const darkModeId = this.collectionManager.getDarkModeId(CollectionType.Primitives);
    
    if (lightModeId) {
      variable.setValueForMode(lightModeId, lightValue);
    }
    
    if (darkModeId) {
      variable.setValueForMode(darkModeId, darkValue);
    }
  }

  /**
   * 数値トークン変数のセットを作成する
   * @param {string} tokenType トークンのタイプ (spacing, borderRadius など)
   * @param {Record<string, number>} tokens トークン (キー: 名前, 値: 数値)
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createPrimitiveNumberTokens(
    tokenType: string,
    tokens: Record<string, number>
  ): Record<string, Variable | null> {
    const variables: Record<string, Variable | null> = {};
    
    // 各トークンに対して変数を作成
    Object.entries(tokens).forEach(([name, value]) => {
      const variableName = `${tokenType}-${name}`;
      // 同じ値をライトモードとダークモードの両方に使用
      const variable = this.createNumberToken(variableName, value, value);
      
      if (variable) {
        variables[variableName] = variable;
      } else {
        variables[variableName] = null;
      }
    });
    
    return variables;
  }

  /**
   * シャドウ変数のセットを作成する
   * @param {Record<string, EffectValue[]>} lightShadows ライトモードのシャドウ
   * @param {Record<string, EffectValue[]>} darkShadows ダークモードのシャドウ
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createShadowVariables(
    lightShadows: Record<string, EffectValue[]>,
    darkShadows: Record<string, EffectValue[]>
  ): Record<string, Variable | null> {
    const variables: Record<string, Variable | null> = {};
    
    // 共通のキーを取得
    const allKeys = new Set([
      ...Object.keys(lightShadows),
      ...Object.keys(darkShadows)
    ]);
    
    // 各シャドウに対して変数を作成
    Array.from(allKeys).forEach(name => {
      const lightValue = lightShadows[name] || [];
      const darkValue = darkShadows[name] || [];
      
      const variableName = `shadow-${name}`;
      const variable = this.createShadowToken(variableName, lightValue, darkValue);
      
      if (variable) {
        variables[variableName] = variable;
      } else {
        variables[variableName] = null;
      }
    });
    
    return variables;
  }

  /**
   * 色を明るくする
   * @private
   * @param {string} hex 元のHEXカラー
   * @param {number} factor 明るくする係数 (0-1)
   * @returns {string} 明るくしたHEXカラー
   */
  private lightenColor(hex: string, factor: number): string {
    const rgba = getRGBAFromHex(hex);
    const r = Math.min(1, rgba.r + (1 - rgba.r) * factor);
    const g = Math.min(1, rgba.g + (1 - rgba.g) * factor);
    const b = Math.min(1, rgba.b + (1 - rgba.b) * factor);
    
    // 簡易的にRGBAをHEXに変換
    const rHex = Math.round(r * 255).toString(16).padStart(2, '0');
    const gHex = Math.round(g * 255).toString(16).padStart(2, '0');
    const bHex = Math.round(b * 255).toString(16).padStart(2, '0');
    
    return `#${rHex}${gHex}${bHex}`;
  }

  /**
   * 色を暗くする
   * @private
   * @param {string} hex 元のHEXカラー
   * @param {number} factor 暗くする係数 (0-1)
   * @returns {string} 暗くしたHEXカラー
   */
  private darkenColor(hex: string, factor: number): string {
    const rgba = getRGBAFromHex(hex);
    const r = Math.max(0, rgba.r * (1 - factor));
    const g = Math.max(0, rgba.g * (1 - factor));
    const b = Math.max(0, rgba.b * (1 - factor));
    
    // 簡易的にRGBAをHEXに変換
    const rHex = Math.round(r * 255).toString(16).padStart(2, '0');
    const gHex = Math.round(g * 255).toString(16).padStart(2, '0');
    const bHex = Math.round(b * 255).toString(16).padStart(2, '0');
    
    return `#${rHex}${gHex}${bHex}`;
  }
}
