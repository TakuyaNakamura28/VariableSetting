/**
 * 色変換ユーティリティクラス
 * 色の変換と操作に関する機能を提供
 */

import { IColorUtility } from '../figmaServiceTypes';

export class ColorUtility implements IColorUtility {
  /**
   * HEX形式の色コードをFigmaのRGBA形式に変換
   * @param {string} hex HEX形式の色コード (例: #FF5500 または #FF5500FF)
   * @returns {RGBA} Figmaで使用可能なRGBA形式のオブジェクト
   */
  hexToFigmaColor(hex: string): RGBA {
    // 先頭の#を取り除く
    hex = hex.replace(/^#/, '');
    
    // 3桁のHEXコードを6桁に拡張 (例: #F00 → #FF0000)
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    // RGB値を計算
    let r = 0, g = 0, b = 0, a = 1;
    if (hex.length >= 6) {
      r = parseInt(hex.substring(0, 2), 16) / 255;
      g = parseInt(hex.substring(2, 4), 16) / 255;
      b = parseInt(hex.substring(4, 6), 16) / 255;
      
      // アルファ値がある場合（8桁HEX）
      if (hex.length === 8) {
        a = parseInt(hex.substring(6, 8), 16) / 255;
      }
    }
    
    // 新しいRGBAオブジェクトを作成して返す
    return { r, g, b, a };
  }
  
  /**
   * FigmaのRGBA形式の色をHEX形式に変換
   * @param {RGBA} color Figmaで使用されるRGBA形式のオブジェクト
   * @returns {string} HEX形式の色コード (#RRGGBB または #RRGGBBAA)
   */
  figmaColorToHex(color: RGBA): string {
    // RGB値を16進数に変換
    const r = Math.round(color.r * 255).toString(16).padStart(2, '0');
    const g = Math.round(color.g * 255).toString(16).padStart(2, '0');
    const b = Math.round(color.b * 255).toString(16).padStart(2, '0');
    
    // アルファ値が1未満の場合は透明度も含める
    if (color.a < 1) {
      const a = Math.round(color.a * 255).toString(16).padStart(2, '0');
      return `#${r}${g}${b}${a}`;
    }
    
    return `#${r}${g}${b}`;
  }

  /**
   * 色文字列を標準形式に変換
   * @param {string} colorStr 色文字列（HEX, RGB, 名前など）
   * @returns {string} 標準化されたHEX形式の色コード
   */
  parseColor(colorStr: string): string {
    // 既にHEX形式の場合はそのまま返す
    if (colorStr.startsWith('#')) {
      return colorStr;
    }
    
    // 色名の場合（簡易対応）
    const colorNames: Record<string, string> = {
      black: '#000000',
      white: '#FFFFFF',
      red: '#FF0000',
      green: '#00FF00',
      blue: '#0000FF',
      yellow: '#FFFF00',
      cyan: '#00FFFF',
      magenta: '#FF00FF',
      gray: '#808080',
      grey: '#808080',
      // 必要に応じて追加
    };
    
    const lowerColor = colorStr.toLowerCase();
    if (colorNames[lowerColor]) {
      return colorNames[lowerColor];
    }
    
    // RGB/RGBA形式の場合
    if (colorStr.startsWith('rgb')) {
      const rgbMatch = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1;
        
        // HEX形式に変換
        const rHex = r.toString(16).padStart(2, '0');
        const gHex = g.toString(16).padStart(2, '0');
        const bHex = b.toString(16).padStart(2, '0');
        
        if (a < 1) {
          const aHex = Math.round(a * 255).toString(16).padStart(2, '0');
          return `#${rHex}${gHex}${bHex}${aHex}`;
        }
        
        return `#${rHex}${gHex}${bHex}`;
      }
    }
    
    // 変換できない場合はデフォルト値を返す
    this.warn(`Unknown color format: ${colorStr}, using default black`);
    return '#000000';
  }
  
  /**
   * 警告ログを出力
   * @param {string} message 警告メッセージ
   */
  warn(message: string): void {
    console.warn(`[ColorUtility] ${message}`);
  }
}
