/**
 * セマンティックカラーとコンポーネントカラーの生成ユーティリティ
 * プリミティブ変数（直接値）→セマンティック変数（意味的値）→コンポーネント変数（特定用途値）
 * の階層構造を維持するため、セマンティック変数は必ずプリミティブ変数を参照します
 */
import { SemanticColors, ComponentColors } from '../types';

/**
 * セマンティックカラーの生成
 * @param primaryPalette プライマリカラーのパレット
 * @param isDark ダークモード用の生成かどうか
 */
export function generateSemanticColors(primaryPalette: Record<string, string>, isDark: boolean): SemanticColors {
  // ダークモードとライトモードで異なる設定
  if (isDark) {
    return {
      // ダークモード用セマンティックカラー - 必ずプリミティブ変数への参照を使用
      background: 'gray-950',
      foreground: 'gray-50',
      
      primary: 'primary-500',
      primaryForeground: 'gray-50',
      
      secondary: 'primary-700',
      secondaryForeground: 'gray-50', // ダークモード用
      
      accent: 'primary-600',
      accentForeground: 'gray-50',
      
      muted: 'gray-800',
      mutedForeground: 'gray-400',
      
      border: 'gray-800',
      input: 'gray-700',
      
      ring: 'primary-500',
      
      destructive: 'red-700',
      destructiveForeground: 'gray-50',
      
      success: 'green-700',
      successForeground: 'gray-50',
      
      warning: 'amber-700',
      warningForeground: 'gray-50',
      
      // 透明関連のセマンティック変数 - プリミティブの'transparent'を参照
      transparent: 'transparent',
      transparentBorder: 'transparent',
      transparentBackground: 'transparent',
      
      // ゴースト関連のセマンティック変数
      ghostBackground: 'transparent',
      ghostForeground: 'gray-50',
      ghostBorder: 'transparent',
      
      // オーバーレイ変数 - 実装時にrabaはプリミティブを参照するように変換
      overlay: 'gray-950', // 半透明目的だが、プリミティブ参照で実現
      
      // デフォルト背景色用セマンティック変数
      defaultBackground: 'primary-500',
      defaultForeground: 'gray-50',
      
      // セカンダリ背景色用セマンティック変数
      secondaryBackground: 'primary-700',
      
      // アウトライン用セマンティック変数
      outlineBackground: 'transparent',
      outlineForeground: 'foreground',
      outlineBorder: 'border',
      
      // 白色定義はプリミティブを参照
      white: 'gray-50'
    };
  } else {
    return {
      // ライトモード用セマンティックカラー - 必ずプリミティブ変数への参照を使用
      background: 'gray-50',
      foreground: 'gray-950',
      
      primary: 'primary-500',
      primaryForeground: 'gray-50',
      
      secondary: 'primary-100',
      secondaryForeground: 'primary-900', // ライトモード用
      
      accent: 'primary-200',
      accentForeground: 'primary-800',
      
      muted: 'gray-100',
      mutedForeground: 'gray-500',
      
      border: 'gray-200',
      input: 'gray-200',
      
      ring: 'primary-500',
      
      destructive: 'red-500',
      destructiveForeground: 'gray-50',
      
      success: 'green-500',
      successForeground: 'gray-50',
      
      warning: 'amber-500',
      warningForeground: 'gray-950',
      
      // 透明関連のセマンティック変数 - プリミティブの'transparent'を参照
      transparent: 'transparent',
      transparentBorder: 'transparent',
      transparentBackground: 'transparent',
      
      // ゴースト関連のセマンティック変数
      ghostBackground: 'transparent',
      ghostForeground: 'gray-950',
      ghostBorder: 'transparent',
      
      // オーバーレイ変数 - 実装時にrabaはプリミティブを参照するように変換
      overlay: 'gray-900', // 半透明目的だが、プリミティブ参照で実現
      
      // デフォルト背景色用セマンティック変数
      defaultBackground: 'primary-500',
      defaultForeground: 'gray-50',
      
      // セカンダリ背景色用セマンティック変数
      secondaryBackground: 'primary-100',
      
      // アウトライン用セマンティック変数
      outlineBackground: 'transparent',
      outlineForeground: 'foreground',
      outlineBorder: 'border',
      
      // 白色定義はプリミティブを参照
      white: 'gray-50'
    };
  }
}

/**
 * ボタンコンポーネントカラーの生成
 * @param semanticColors セマンティックカラー
 * @param isDark ダークモード用の生成かどうか
 */
export function generateComponentColors(semanticColors: SemanticColors, isDark: boolean): ComponentColors {
  return {
    // ボタンコンポーネント
    button: {
      // デフォルトボタン
      default: {
        background: 'primary',
        foreground: 'primaryForeground',
        border: 'transparentBorder',
        ring: 'ring',
      },
      // セカンダリボタン
      secondary: {
        background: 'secondary',
        foreground: 'secondaryForeground',
        border: 'transparentBorder',
        ring: 'ring',
      },
      // アウトラインボタン
      outline: {
        background: 'transparentBackground',
        foreground: 'foreground',
        border: 'border',
        ring: 'ring',
      },
      // ゴーストボタン
      ghost: {
        background: 'ghostBackground',
        foreground: 'ghostForeground',
        border: 'ghostBorder',
        ring: 'ring',
      },
      // デストラクティブボタン
      destructive: {
        background: 'destructive',
        foreground: 'destructiveForeground',
        border: 'transparentBorder',
        ring: 'destructive',
      },
    },
    
    // カードコンポーネント
    card: {
      background: 'background',
      foreground: 'foreground',
      border: 'border',
    },
    
    // 入力フィールドコンポーネント
    input: {
      background: 'background',
      foreground: 'foreground',
      border: 'input',
      ring: 'ring',
      placeholder: 'mutedForeground',
    },
    
    // ダイアログコンポーネント
    dialog: {
      background: 'background',
      foreground: 'foreground',
      border: 'border',
      overlay: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)',
    },
    
    // トーストコンポーネント
    toast: {
      background: 'background',
      foreground: 'foreground',
      border: 'border',
      action: 'primary',
    },
    
    // ポップオーバーコンポーネント
    popover: {
      background: 'background',
      foreground: 'foreground',
      border: 'border',
    },
  };
}
