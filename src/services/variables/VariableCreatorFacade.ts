/**
 * VariableCreatorFacade
 * 各種変数作成クラスを統合するファサードクラス
 * 依存性逆転原則(DIP)とインターフェース分離原則(ISP)に基づき設計
 */
import { ICollectionManager, IVariableCreator } from '../figmaServiceTypes';
import { ColorVariableCreator } from './ColorVariableCreator';
import { NumberVariableCreator } from './NumberVariableCreator';
import { ShadowVariableCreator } from './ShadowVariableCreator';

/**
 * 変数作成ファサードクラス
 * 複数の変数作成クラスを統合し、元々のPrimitiveVariableCreatorの機能を提供
 */
export class VariableCreatorFacade implements IVariableCreator {
  private colorCreator: ColorVariableCreator;
  private numberCreator: NumberVariableCreator;
  private shadowCreator: ShadowVariableCreator;

  /**
   * コンストラクタ
   * @param {ICollectionManager} collectionManager コレクション管理オブジェクト
   */
  constructor(collectionManager: ICollectionManager) {
    this.colorCreator = new ColorVariableCreator(collectionManager);
    this.numberCreator = new NumberVariableCreator(collectionManager);
    this.shadowCreator = new ShadowVariableCreator(collectionManager);
  }

  /**
   * カラー変数を作成する
   * @param {string} name 変数名
   * @param {string} lightValue Light モードの値 (HEX)
   * @param {string} darkValue Dark モードの値 (HEX)
   * @param {string} [group] グループ名
   * @returns {Variable | null} 作成した変数またはnull
   */
  createVariable(name: string, lightValue: string, darkValue: string, group?: string): Variable | null {
    return this.colorCreator.createVariable(name, lightValue, darkValue, group);
  }

  /**
   * 複数のカラー変数を作成する
   * @param {string[]} names 変数名の配列
   * @param {string[]} lightValues Light モードの値の配列 (HEX)
   * @param {string[]} darkValues Dark モードの値の配列 (HEX)
   * @param {string} [group] グループ名
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createVariables(names: string[], lightValues: string[], darkValues: string[], group?: string): Record<string, Variable | null> {
    return this.colorCreator.createVariables(names, lightValues, darkValues, group);
  }

  /**
   * カラーパレットを作成する（インターフェース要件）
   * @param {string} baseColor ベースカラー (HEX)
   * @param {string} [group] グループ名
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createColorPalette(baseColor: string, group?: string): Record<string, Variable | null> {
    // ここでは簡略実装として、単にプリミティブカラーパレットにフォワード
    const palette = {
      '50': this.getLightenColor(baseColor, 0.9),
      '100': this.getLightenColor(baseColor, 0.8),
      '200': this.getLightenColor(baseColor, 0.6),
      '300': this.getLightenColor(baseColor, 0.4),
      '400': this.getLightenColor(baseColor, 0.2),
      '500': baseColor,
      '600': this.getDarkenColor(baseColor, 0.1),
      '700': this.getDarkenColor(baseColor, 0.2),
      '800': this.getDarkenColor(baseColor, 0.3),
      '900': this.getDarkenColor(baseColor, 0.4),
      '950': this.getDarkenColor(baseColor, 0.5),
    };
    
    return this.createPrimitiveColorPalette(group || 'color', palette);
  }

  /**
   * カラーパレットを作成する
   * @param {string} baseName ベース名
   * @param {Record<string, string>} palette カラーパレット (キー: バリアント名, 値: HEX カラー)
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createPrimitiveColorPalette(baseName: string, palette: Record<string, string>): Record<string, Variable | null> {
    return this.colorCreator.createPrimitiveColorPalette(baseName, palette);
  }

  /**
   * 数値トークンを作成する
   * @param {string} prefix プレフィックス (グループ名)
   * @param {Record<string, number>} tokens トークン (キー: 名前, 値: 数値)
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createPrimitiveNumberTokens(prefix: string, tokens: Record<string, number>): Record<string, Variable | null> {
    return this.numberCreator.createPrimitiveNumberTokens(prefix, tokens);
  }

  /**
   * シャドウ変数を作成する
   * @param {Record<string, EffectValue[]>} lightShadows Light モードのシャドウ
   * @param {Record<string, EffectValue[]>} darkShadows Dark モードのシャドウ
   * @param {string} [group] グループ名
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createShadowVariables(
    lightShadows: Record<string, EffectValue[]>,
    darkShadows: Record<string, EffectValue[]>,
    group?: string
  ): Record<string, Variable | null> {
    return this.shadowCreator.createShadowVariables(lightShadows, darkShadows, group);
  }

  /**
   * カラートークンを作成する
   * @param {Record<string, string>} tokens カラートークン
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createColorTokens(tokens: Record<string, string>): Record<string, Variable | null> {
    return this.colorCreator.createColorTokens(tokens);
  }

  /**
   * 数値トークンを作成する
   * @param {Record<string, number>} tokens 数値トークン
   * @param {string} [group] グループ名
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createNumberTokens(tokens: Record<string, number>, group?: string): Record<string, Variable | null> {
    return this.numberCreator.createNumberTokens(tokens, group);
  }

  /**
   * シャドウトークンを作成する
   * @param {Record<string, EffectValue[]>} tokens シャドウトークン
   * @param {string} [group] グループ名
   * @returns {Record<string, Variable | null>} 作成した変数のマップ
   */
  createShadowTokens(tokens: Record<string, EffectValue[]>, group?: string): Record<string, Variable | null> {
    return this.shadowCreator.createShadowTokens(tokens, group);
  }

  /**
   * 数値変数を作成する
   * @param {string} name 変数名
   * @param {number} lightValue Light モードの値
   * @param {number} darkValue Dark モードの値
   * @param {string} [group] グループ名
   * @returns {Variable | null} 作成した変数またはnull
   */
  createNumberToken(name: string, lightValue: number, darkValue: number, group?: string): Variable | null {
    return this.numberCreator.createVariable(name, lightValue, darkValue, group);
  }
  
  /**
   * カラーを明るくする
   * @private
   * @param {string} hex HEXカラー
   * @param {number} amount 明るさの割合（0-1）
   * @returns {string} 明るくしたHEXカラー
   */
  private getLightenColor(hex: string, amount: number): string {
    return this.adjustColor(hex, amount, true);
  }
  
  /**
   * カラーを暗くする
   * @private
   * @param {string} hex HEXカラー
   * @param {number} amount 暗さの割合（0-1）
   * @returns {string} 暗くしたHEXカラー
   */
  private getDarkenColor(hex: string, amount: number): string {
    return this.adjustColor(hex, amount, false);
  }
  
  /**
   * カラーの明るさを調整する
   * @private
   * @param {string} hex HEXカラー
   * @param {number} amount 調整する割合（0-1）
   * @param {boolean} lighten 明るくするか（false=暗くする）
   * @returns {string} 調整後のHEXカラー
   */
  private adjustColor(hex: string, amount: number, lighten: boolean): string {
    try {
      hex = hex.replace('#', '');
      let r = parseInt(hex.substring(0, 2), 16);
      let g = parseInt(hex.substring(2, 4), 16);
      let b = parseInt(hex.substring(4, 6), 16);
      
      if (lighten) {
        r = Math.min(255, r + Math.round((255 - r) * amount));
        g = Math.min(255, g + Math.round((255 - g) * amount));
        b = Math.min(255, b + Math.round((255 - b) * amount));
      } else {
        r = Math.max(0, r - Math.round(r * amount));
        g = Math.max(0, g - Math.round(g * amount));
        b = Math.max(0, b - Math.round(b * amount));
      }
      
      const rHex = r.toString(16).padStart(2, '0');
      const gHex = g.toString(16).padStart(2, '0');
      const bHex = b.toString(16).padStart(2, '0');
      
      return `#${rHex}${gHex}${bHex}`;
    } catch (error) {
      figma.notify(`Error adjusting color: ${error}`, { error: true });
      return hex; // エラー時は元の色を返す
    }
  }
}
