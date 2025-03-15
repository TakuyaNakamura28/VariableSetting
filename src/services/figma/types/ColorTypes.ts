/**
 * 色関連の型定義
 */

/**
 * Figmaの色表現のための型定義
 * r, g, b, a はそれぞれ0-1の範囲の値
 */
export interface RGBA {
  /** 赤成分 (0-1の範囲) */
  r: number;
  /** 緑成分 (0-1の範囲) */
  g: number;
  /** 青成分 (0-1の範囲) */
  b: number;
  /** アルファ成分 (0-1の範囲) */
  a: number;
}

/**
 * HSL色空間の表現のための型定義
 */
export interface HSL {
  /** 色相 (0-1の範囲、1が360度) */
  h: number;
  /** 彩度 (0-1の範囲) */
  s: number;
  /** 明度 (0-1の範囲) */
  l: number;
}
