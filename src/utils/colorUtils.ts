/**
 * カラー生成に関するユーティリティ関数
 * プリミティブ変数→セマンティック変数→コンポーネント変数の階層構造を実現するための色変換ユーティリティ
 */

/**
 * カラー型定義
 */
export type RGB = {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
};

export type RGBA = {
  r: number; // 0-1
  g: number; // 0-1
  b: number; // 0-1
  a: number; // 0-1
};

export type HSL = {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
};

/**
 * HEX形式のカラーコードをRGBオブジェクトに変換する
 */
export function hexToRgb(hex: string): RGB {
  // # から始まるなら削除
  hex = hex.replace(/^#/, '');

  // 3桁のHEXなら6桁に拡張（#abc → #aabbcc）
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * RGBオブジェクトをHEX形式に変換する
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (value: number) => {
    const hex = Math.round(value).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * HEX カラーコードを RGBA オブジェクトに変換する
 * @param {string} hex HEX カラーコード (例: #FF0000)
 * @returns {RGBA} RGBA オブジェクト
 */
export function getRGBAFromHex(hex: string): RGBA {
  // 特殊なカラー値の処理
  if (hex === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  // #を除去
  hex = hex.replace(/^#/, '');
  
  // 短縮形式の場合は拡張
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // アルファ値の処理 (8桁の場合)
  let alpha = 1;
  if (hex.length === 8) {
    alpha = parseInt(hex.slice(6, 8), 16) / 255;
    hex = hex.slice(0, 6);
  }
  
  // 16進数を10進数に変換 (Figma API用に0-1の範囲に正規化)
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  return { r, g, b, a: alpha };
}

/**
 * カラーを明るくする（tint：白を混ぜる）
 * @param hex - 元のHEXカラー
 * @param amount - 明るくする量（0-1）
 */
export function tint(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  const tintedRgb: RGB = {
    r: rgb.r + (255 - rgb.r) * amount,
    g: rgb.g + (255 - rgb.g) * amount,
    b: rgb.b + (255 - rgb.b) * amount,
  };
  return rgbToHex(tintedRgb);
}

/**
 * カラーを暗くする（shade：黒を混ぜる）
 * @param hex - 元のHEXカラー
 * @param amount - 暗くする量（0-1）
 */
export function shade(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  const shadedRgb: RGB = {
    r: rgb.r * (1 - amount),
    g: rgb.g * (1 - amount),
    b: rgb.b * (1 - amount),
  };
  return rgbToHex(shadedRgb);
}

/**
 * RGBカラーをHSL形式に変換
 */
export function rgbToHsl(rgb: RGB): HSL {
  // RGB値を0-1の範囲に正規化
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  // HSL値の計算
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

    if (max === r) {
      h = (g - b) / diff + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * HSLカラーをRGB形式に変換
 */
export function hslToRgb(hsl: HSL): RGB {
  // HSL値を0-1の範囲に正規化
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // 彩度がない場合はグレースケール
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
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

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * HEXカラーをHSL形式に変換
 */
export function hexToHsl(hex: string): HSL {
  const rgb = hexToRgb(hex);
  return rgbToHsl(rgb);
}

/**
 * HSLカラーをHEX形式に変換
 */
export function hslToHex(hsl: HSL): string {
  const rgb = hslToRgb(hsl);
  return rgbToHex(rgb);
}

/**
 * 色相を取得する
 * @param hex HEXカラーコード
 * @returns 色相（0-360）
 */
export function getHue(hex: string): number {
  const hsl = hexToHsl(hex);
  return hsl.h;
}

/**
 * 色相を変更した新しいカラーを生成する
 * @param hex 元のHEXカラー
 * @param newHue 新しい色相（0-360）
 * @returns 新しいHEXカラー
 */
export function changeHue(hex: string, newHue: number): string {
  const hsl = hexToHsl(hex);
  return hslToHex({ ...hsl, h: newHue });
}

/**
 * アナログカラーを生成する（色相環で隣接した色）
 * @param hex 元のHEXカラー
 * @param offset 色相のオフセット（デフォルト: 30）
 * @returns 新しいHEXカラー
 */
export function analogousColor(hex: string, offset: number = 30): string {
  const hsl = hexToHsl(hex);
  // 色相を時計回りにずらす（360度を超えたら0に戻る）
  const newHue = (hsl.h + offset) % 360;
  return hslToHex({ ...hsl, h: newHue });
}

/**
 * 補色を生成する（色相環で反対側の色）
 * @param hex 元のHEXカラー
 * @returns 補色のHEXカラー
 */
export function complementaryColor(hex: string): string {
  const hsl = hexToHsl(hex);
  // 色相を180度反転
  const newHue = (hsl.h + 180) % 360;
  return hslToHex({ ...hsl, h: newHue });
}

/**
 * 彩度を調整した新しいカラーを生成する
 * @param hex 元のHEXカラー
 * @param amount 調整量（-100〜100）
 * @returns 新しいHEXカラー
 */
export function adjustSaturation(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  // 彩度を調整（0〜100の範囲内に収める）
  const newSaturation = Math.max(0, Math.min(100, hsl.s + amount));
  return hslToHex({ ...hsl, s: newSaturation });
}

/**
 * 明度を調整した新しいカラーを生成する
 * @param hex 元のHEXカラー
 * @param amount 調整量（-100〜100）
 * @returns 新しいHEXカラー
 */
export function adjustLightness(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  // 明度を調整（0〜100の範囲内に収める）
  const newLightness = Math.max(0, Math.min(100, hsl.l + amount));
  return hslToHex({ ...hsl, l: newLightness });
}

/**
 * カラーの明暗を判定し、適切なコントラストカラーを返す
 * @param hex HEXカラー
 * @returns 白または黒のHEXカラー
 */
export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  // YIQ方式で輝度を計算（人間の目の感度の違いを考慮）
  const yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
  return yiq >= 128 ? '#000000' : '#ffffff';
}

/**
 * プライマリカラーに調和する新しいカラーパレットを生成する
 * @param hex プライマリカラーのHEX
 * @param hueOffset 色相オフセット
 * @returns 新しいカラーのHEX
 */
export function generateHarmonizedColor(hex: string, hueOffset: number): string {
  const hsl = hexToHsl(hex);
  const newHue = (hsl.h + hueOffset) % 360;
  return hslToHex({ h: newHue, s: hsl.s, l: hsl.l });
}

/**
 * プライマリカラーから完全な10段階のカラーパレットを生成する
 * Tailwind CSSスタイルのパレット（50-950）
 * HSL色空間を使用してより調和の取れたパレットを生成
 */
export function generateColorPalette(primaryHex: string): Record<string, string> {
  // プライマリカラーはデフォルトで500に割り当てる
  const palette: Record<string, string> = {
    50: '',
    100: '',
    200: '',
    300: '',
    400: '',
    500: primaryHex, // プライマリカラー
    600: '',
    700: '',
    800: '',
    900: '',
    950: ''
  };
  
  // HSL色空間で調整するための変換
  const hsl = hexToHsl(primaryHex);
  
  // 明るい色（50-400）- 色相を維持し、彩度を下げ、明度を上げる
  palette['50'] = hslToHex({ h: hsl.h, s: Math.max(hsl.s - 30, 10), l: Math.min(hsl.l + 45, 97) });
  palette['100'] = hslToHex({ h: hsl.h, s: Math.max(hsl.s - 25, 15), l: Math.min(hsl.l + 40, 94) });
  palette['200'] = hslToHex({ h: hsl.h, s: Math.max(hsl.s - 20, 20), l: Math.min(hsl.l + 30, 86) });
  palette['300'] = hslToHex({ h: hsl.h, s: Math.max(hsl.s - 10, 25), l: Math.min(hsl.l + 20, 78) });
  palette['400'] = hslToHex({ h: hsl.h, s: Math.max(hsl.s - 5, 30), l: Math.min(hsl.l + 10, 70) });
  
  // 暗い色（600-950）- 色相を少し調整し、彩度を維持または上げ、明度を下げる
  palette['600'] = hslToHex({ h: hsl.h, s: Math.min(hsl.s + 5, 90), l: Math.max(hsl.l - 10, 25) });
  palette['700'] = hslToHex({ h: hsl.h, s: Math.min(hsl.s + 10, 95), l: Math.max(hsl.l - 20, 20) });
  palette['800'] = hslToHex({ h: hsl.h, s: Math.min(hsl.s + 15, 98), l: Math.max(hsl.l - 30, 15) });
  palette['900'] = hslToHex({ h: hsl.h, s: Math.min(hsl.s + 20, 100), l: Math.max(hsl.l - 40, 10) });
  palette['950'] = hslToHex({ h: hsl.h, s: Math.min(hsl.s + 15, 95), l: Math.max(hsl.l - 45, 5) });

  return palette;
}

/**
 * プライマリカラーに調和する2次的なカラーパレットを生成
 * @param primaryPalette プライマリカラーパレット
 * @param hueOffset 色相オフセット
 * @returns 派生カラーパレット
 */
export function generateDerivedColorPalette(primaryPalette: Record<string, string>, hueOffset: number): Record<string, string> {
  const derivedPalette: Record<string, string> = {};
  
  // プライマリパレットの各シェードに対して色相を変更
  for (const [shade, color] of Object.entries(primaryPalette)) {
    derivedPalette[shade] = generateHarmonizedColor(color, hueOffset);
  }
  
  return derivedPalette;
}
