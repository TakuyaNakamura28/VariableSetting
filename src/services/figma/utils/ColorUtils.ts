/**
 * ColorUtilsクラス
 * 色変換と操作のためのユーティリティクラス
 */
import { FigmaServiceBase } from '../base/FigmaServiceBase';
import { IColorUtility } from '../interfaces/IColorUtility';
import { RGBA, HSL } from '../types/ColorTypes';

/**
 * 色変換と操作のためのユーティリティクラス
 * 単一責任原則に従い、色操作に特化した機能を提供
 */
export class ColorUtils extends FigmaServiceBase implements IColorUtility {
  /**
   * コンストラクタ
   */
  constructor() {
    super('ColorUtils');
  }

  /**
   * HEX形式の色をFigmaのRGBA形式に変換
   * @param {string} hex HEX形式の色（#RRGGBB または #RRGGBBAA）
   * @returns {RGBA} Figmaの色オブジェクト
   */
  public hexToFigmaColor(hex: string): RGBA {
    // 標準フォーマットに変換
    hex = this.parseColor(hex);
    
    // 16進数を10進数に変換し、0-1の範囲にスケール
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    // アルファ値があれば処理、なければ1.0とする
    const a = hex.length > 7 
      ? parseInt(hex.slice(7, 9), 16) / 255 
      : 1.0;
    
    return { r, g, b, a };
  }

  /**
   * FigmaのRGBA形式をHEX形式に変換
   * @param {RGBA} color Figmaの色オブジェクト
   * @returns {string} HEX形式の色
   */
  public figmaColorToHex(color: RGBA): string {
    // 0-1の値を0-255の範囲に変換し、16進数に変換
    const r = Math.round(color.r * 255).toString(16).padStart(2, '0');
    const g = Math.round(color.g * 255).toString(16).padStart(2, '0');
    const b = Math.round(color.b * 255).toString(16).padStart(2, '0');
    const a = color.a < 1 
      ? Math.round(color.a * 255).toString(16).padStart(2, '0') 
      : '';
    
    return `#${r}${g}${b}${a}`.toUpperCase();
  }

  /**
   * 色文字列を標準HEX形式に変換
   * @param {string} colorStr 色を表す文字列
   * @returns {string} 標準化されたHEX形式の色
   */
  public parseColor(colorStr: string): string {
    // 空の場合はデフォルト色を返す
    if (!colorStr) {
      this.warn(`空の色文字列が指定されました。デフォルト色 #000000 を使用します。`);
      return '#000000';
    }
    
    // すでに正しいHEX形式の場合はそのまま返す
    if (/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(colorStr)) {
      return colorStr.toUpperCase();
    }
    
    // 短縮HEX形式を標準形式に変換 (#RGB -> #RRGGBB)
    if (/^#[0-9A-Fa-f]{3}([0-9A-Fa-f])?$/.test(colorStr)) {
      let result = '#';
      for (let i = 1; i < colorStr.length; i++) {
        result += colorStr[i] + colorStr[i];
      }
      return result.toUpperCase();
    }
    
    // RGB/RGBA形式を処理
    const rgbMatch = colorStr.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      return this.rgbToHex(
        parseInt(r, 10), 
        parseInt(g, 10), 
        parseInt(b, 10)
      );
    }
    
    const rgbaMatch = colorStr.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/i);
    if (rgbaMatch) {
      const [, r, g, b, a] = rgbaMatch;
      return this.rgbaToHex(
        parseInt(r, 10), 
        parseInt(g, 10), 
        parseInt(b, 10), 
        parseFloat(a)
      );
    }
    
    // 未対応の形式の場合は警告を出してデフォルト色を返す
    this.warn(`未対応の色形式です: ${colorStr}。デフォルト色 #000000 を使用します。`);
    return '#000000';
  }
  
  /**
   * RGB値をHEX形式に変換
   * @param {number} r 赤（0-255）
   * @param {number} g 緑（0-255）
   * @param {number} b 青（0-255）
   * @returns {string} HEX形式の色
   */
  public rgbToHex(r: number, g: number, b: number): string {
    const rHex = Math.max(0, Math.min(255, r)).toString(16).padStart(2, '0');
    const gHex = Math.max(0, Math.min(255, g)).toString(16).padStart(2, '0');
    const bHex = Math.max(0, Math.min(255, b)).toString(16).padStart(2, '0');
    
    return `#${rHex}${gHex}${bHex}`.toUpperCase();
  }

  /**
   * RGBA値をHEX形式に変換
   * @param {number} r 赤（0-255）
   * @param {number} g 緑（0-255）
   * @param {number} b 青（0-255）
   * @param {number} a アルファ（0-1）
   * @returns {string} HEX形式の色（アルファ込み）
   */
  public rgbaToHex(r: number, g: number, b: number, a: number): string {
    const aHex = Math.max(0, Math.min(1, a)) === 1 
      ? '' 
      : Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');
      
    return `${this.rgbToHex(r, g, b)}${aHex}`.toUpperCase();
  }

  /**
   * 色を明るくする
   * @param {string} hex 元の色（HEX）
   * @param {number} amount 明るくする量（0-1）
   * @returns {string} 明るくした色（HEX）
   */
  public lighten(hex: string, amount: number): string {
    const { h, s, l } = this.hexToHsl(hex);
    return this.hslToHex(h, s, Math.min(1, l + amount));
  }

  /**
   * 色を暗くする
   * @param {string} hex 元の色（HEX）
   * @param {number} amount 暗くする量（0-1）
   * @returns {string} 暗くした色（HEX）
   */
  public darken(hex: string, amount: number): string {
    const { h, s, l } = this.hexToHsl(hex);
    return this.hslToHex(h, s, Math.max(0, l - amount));
  }

  /**
   * HEX形式をHSL形式に変換
   * @private
   * @param {string} hex HEX形式の色
   * @returns {HSL} HSL値
   */
  private hexToHsl(hex: string): HSL {
    // HEXをRGBに変換
    const rgb = this.hexToFigmaColor(hex);
    
    // RGBをHSLに変換
    const r = rgb.r;
    const g = rgb.g;
    const b = rgb.b;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    
    if (max === min) {
      // 無彩色（白、黒、グレー）の場合
      return { h: 0, s: 0, l };
    }
    
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    let h;
    if (max === r) {
      h = (g - b) / d + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else {
      h = (r - g) / d + 4;
    }
    
    h /= 6;
    
    return { h, s, l };
  }

  /**
   * HSL形式をHEX形式に変換
   * @private
   * @param {number} h 色相（0-1）
   * @param {number} s 彩度（0-1）
   * @param {number} l 明度（0-1）
   * @returns {string} HEX形式の色
   */
  private hslToHex(h: number, s: number, l: number): string {
    let r, g, b;
    
    if (s === 0) {
      // 無彩色（白、黒、グレー）の場合
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return this.rgbToHex(
      Math.round(r * 255), 
      Math.round(g * 255), 
      Math.round(b * 255)
    );
  }
}
