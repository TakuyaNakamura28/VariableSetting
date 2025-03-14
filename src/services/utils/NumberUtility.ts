/**
 * 数値変換ユーティリティクラス
 * 数値の変換と操作に関する機能を提供
 */

import { INumberUtility } from '../figmaServiceTypes';

export class NumberUtility implements INumberUtility {
  /**
   * 文字列形式の数値（単位付き）を数値に変換
   * @param {string} value 文字列形式の数値 (例: "10px", "1.5rem")
   * @returns {number} 数値のみ（単位なし）
   */
  parseNumberValue(value: string): number {
    // 単位を削除して数値に変換
    return parseFloat(value.replace(/px|rem|em|%/g, ''));
  }
  
  /**
   * 数値を特定の単位で文字列形式に変換
   * @param {number} value 数値
   * @param {string} unit 単位 (例: "px", "rem")
   * @returns {string} 単位付きの文字列形式の数値
   */
  formatNumberWithUnit(value: number, unit: string = 'px'): string {
    return `${value}${unit}`;
  }
  
  /**
   * 数値を特定の小数点以下の桁数で丸める
   * @param {number} value 数値
   * @param {number} decimals 小数点以下の桁数
   * @returns {number} 丸められた数値
   */
  roundToDecimal(value: number, decimals: number = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  /**
   * 警告ログを出力
   * @param {string} message 警告メッセージ
   */
  warn(message: string): void {
    console.warn(`[NumberUtility] ${message}`);
  }
}
