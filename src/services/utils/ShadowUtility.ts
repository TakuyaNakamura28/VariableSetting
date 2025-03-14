/**
 * シャドウ変換ユーティリティクラス
 * シャドウ効果の変換と操作に関する機能を提供
 */

import { IShadowUtility } from '../figmaServiceTypes';

export class ShadowUtility implements IShadowUtility {
  /**
   * シャドウ文字列をFigmaのエフェクト形式に変換
   * 例: "0px 4px 8px rgba(0, 0, 0, 0.1)" → DropShadowEffect
   * @param {string} shadowStr シャドウを表す文字列
   * @returns {EffectValue} Figmaで使用可能なエフェクト
   */
  parseShadowValue(shadowStr: string): EffectValue {
    // シンプルな実装 - 実際にはより複雑なパースが必要かもしれない
    // 例: "0px 4px 8px rgba(0, 0, 0, 0.1)"
    const parts = shadowStr.split(' ');
    
    // パラメータのデフォルト値
    let xOffset = 0;
    let yOffset = 0;
    let radius = 4;
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0.1;
    
    // 値を設定（簡易実装）
    if (parts.length >= 3) {
      // X オフセット
      xOffset = parseFloat(parts[0]);
      
      // Y オフセット
      yOffset = parseFloat(parts[1]);
      
      // ぼかし半径
      radius = parseFloat(parts[2]);
      
      // 色情報を解析
      if (parts.length >= 4 && parts[3].startsWith('rgba')) {
        const rgba = parts[3].replace(/rgba\(|\)/g, '').split(',');
        if (rgba.length >= 4) {
          r = parseInt(rgba[0].trim()) / 255;
          g = parseInt(rgba[1].trim()) / 255;
          b = parseInt(rgba[2].trim()) / 255;
          a = parseFloat(rgba[3].trim());
        }
      }
    }
    
    // 新しいエフェクトオブジェクトを作成して返す
    const dropShadow: DropShadowEffect = {
      type: 'DROP_SHADOW',
      visible: true,
      radius: radius,
      color: { r, g, b, a },
      blendMode: 'NORMAL',
      offset: { x: xOffset, y: yOffset }
    };
    
    // 型互換性エラーを回避するための型キャスト
    return dropShadow as EffectValue;
  }
  
  /**
   * 複数のシャドウ文字列をFigmaのエフェクト配列に変換
   * @param {string[]} shadowStrings シャドウを表す文字列の配列
   * @returns {EffectValue[]} Figmaで使用可能なエフェクト配列
   */
  parseShadowValues(shadowStrings: string[]): EffectValue[] {
    return shadowStrings.map(shadowStr => this.parseShadowValue(shadowStr));
  }
  
  /**
   * FigmaのエフェクトをCSS形式のシャドウ文字列に変換
   * @param {EffectValue} effect Figmaのエフェクト
   * @returns {string} CSS形式のシャドウ文字列
   */
  effectToCssShadow(effect: EffectValue): string {
    if (effect.type !== 'DROP_SHADOW') {
      return '';
    }
    
    const shadow = effect as DropShadowEffect;
    const { r, g, b, a } = shadow.color;
    const rVal = Math.round(r * 255);
    const gVal = Math.round(g * 255);
    const bVal = Math.round(b * 255);
    
    return `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px rgba(${rVal}, ${gVal}, ${bVal}, ${a})`;
  }

  /**
   * 警告ログを出力
   * @param {string} message 警告メッセージ
   */
  warn(message: string): void {
    console.warn(`[ShadowUtility] ${message}`);
  }
}
