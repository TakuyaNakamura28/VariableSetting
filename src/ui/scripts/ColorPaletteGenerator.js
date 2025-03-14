/**
 * ColorPaletteGeneratorクラス
 * カラーパレットの生成を担当
 */
export class ColorPaletteGenerator {
  /**
   * コンストラクタ
   */
  constructor() {
    // 輝度調整に使用する係数（shadcn/ui準拠）
    this.lightSteps = {
      50: 0.95,
      100: 0.9,
      200: 0.8,
      300: 0.7,
      400: 0.6,
      500: 0.5,
      600: 0.4,
      700: 0.3,
      800: 0.2,
      900: 0.1,
      950: 0.05
    };
    
    // ダークモード用の輝度調整係数
    this.darkSteps = {
      50: 0.05,
      100: 0.1,
      200: 0.2,
      300: 0.3,
      400: 0.4,
      500: 0.5,
      600: 0.6,
      700: 0.7,
      800: 0.8,
      900: 0.9,
      950: 0.95
    };
  }
  
  /**
   * ライトモード用のカラーパレットを生成
   * @param {string} primaryColor - 基本となるプライマリカラー（HEX形式）
   * @returns {Object} 生成されたカラーパレット
   */
  generateLightPalette(primaryColor) {
    const palette = {};
    
    // HEXからRGBに変換
    const rgb = this.hexToRgb(primaryColor);
    
    // HSLに変換
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // 各ステップのカラーを生成
    Object.entries(this.lightSteps).forEach(([step, lightness]) => {
      // HSLの輝度を調整
      const newColor = this.hslToHex(hsl.h, hsl.s, lightness);
      palette[step] = newColor;
    });
    
    return palette;
  }
  
  /**
   * ダークモード用のカラーパレットを生成
   * @param {Object} lightPalette - ライトモードのカラーパレット
   * @returns {Object} 生成されたダークモード用カラーパレット
   */
  generateDarkPalette(lightPalette) {
    const darkPalette = {};
    const primaryHex = lightPalette[500];
    
    // プライマリカラーをHSLに変換
    const rgb = this.hexToRgb(primaryHex);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // 各ステップのカラーを生成
    Object.entries(this.darkSteps).forEach(([step, lightness]) => {
      // HSLの輝度を調整
      const newColor = this.hslToHex(hsl.h, hsl.s, lightness);
      darkPalette[step] = newColor;
    });
    
    return darkPalette;
  }
  
  /**
   * HEX形式のカラーをRGB形式に変換
   * @param {string} hex - HEX形式のカラーコード
   * @returns {Object} RGBオブジェクト {r, g, b}
   */
  hexToRgb(hex) {
    // #を除去
    hex = hex.replace(/^#/, '');
    
    // 3桁の場合は6桁に変換
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    // 16進数から10進数に変換
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
  }
  
  /**
   * RGB形式のカラーをHSL形式に変換
   * @param {number} r - 赤 (0-255)
   * @param {number} g - 緑 (0-255)
   * @param {number} b - 青 (0-255)
   * @returns {Object} HSLオブジェクト {h, s, l}
   */
  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // 無彩色
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      
      h /= 6;
    }
    
    return { h, s, l };
  }
  
  /**
   * HSL形式のカラーをHEX形式に変換
   * @param {number} h - 色相 (0-1)
   * @param {number} s - 彩度 (0-1)
   * @param {number} l - 輝度 (0-1)
   * @returns {string} HEX形式のカラーコード
   */
  hslToHex(h, s, l) {
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // 無彩色
    } else {
      const hue2rgb = (p, q, t) => {
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
    
    // 0-255の範囲に変換
    const toHex = (x) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }
}
