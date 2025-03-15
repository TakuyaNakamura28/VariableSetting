/**
 * IColorUtility インターフェース
 * 色変換と操作のためのユーティリティメソッドを定義
 */

/**
 * 色変換と操作のためのユーティリティインターフェース
 * 依存性逆転の原則に従い、具象クラスへの依存を避ける
 */
export interface IColorUtility {
  /**
   * HEX形式の色をFigmaのRGBA形式に変換
   * @param {string} hex HEX形式の色（#RRGGBB または #RRGGBBAA）
   * @returns {RGBA} Figmaの色オブジェクト
   */
  hexToFigmaColor(hex: string): RGBA;

  /**
   * FigmaのRGBA形式をHEX形式に変換
   * @param {RGBA} color Figmaの色オブジェクト
   * @returns {string} HEX形式の色
   */
  figmaColorToHex(color: RGBA): string;

  /**
   * 色文字列を標準HEX形式に変換
   * @param {string} colorStr 色を表す文字列
   * @returns {string} 標準化されたHEX形式の色
   */
  parseColor(colorStr: string): string;

  /**
   * RGB値をHEX形式に変換
   * @param {number} r 赤（0-255）
   * @param {number} g 緑（0-255）
   * @param {number} b 青（0-255）
   * @returns {string} HEX形式の色
   */
  rgbToHex(r: number, g: number, b: number): string;

  /**
   * RGBA値をHEX形式に変換
   * @param {number} r 赤（0-255）
   * @param {number} g 緑（0-255）
   * @param {number} b 青（0-255）
   * @param {number} a アルファ（0-1）
   * @returns {string} HEX形式の色（アルファ込み）
   */
  rgbaToHex(r: number, g: number, b: number, a: number): string;

  /**
   * 色を明るくする
   * @param {string} hex 元の色（HEX）
   * @param {number} amount 明るくする量（0-1）
   * @returns {string} 明るくした色（HEX）
   */
  lighten(hex: string, amount: number): string;

  /**
   * 色を暗くする
   * @param {string} hex 元の色（HEX）
   * @param {number} amount 暗くする量（0-1）
   * @returns {string} 暗くした色（HEX）
   */
  darken(hex: string, amount: number): string;
}
