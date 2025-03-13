/**
 * プロジェクト全体で使用する型定義
 */

/**
 * カラーパレット型
 * キーはカラー名（'50', '100', ...）、値はHEXカラーコード
 */
export type ColorPalette = Record<string, string>;

/**
 * セマンティックカラーパレット型
 */
export interface SemanticColors {
  background: string;
  foreground: string;
  
  primary: string;
  primaryForeground: string;
  
  secondary: string;
  secondaryForeground: string;
  
  accent: string;
  accentForeground: string;
  
  muted: string;
  mutedForeground: string;
  
  border: string;
  input: string;
  ring: string;
  
  destructive: string;
  destructiveForeground: string;
  
  success: string;
  successForeground: string;
  
  warning: string;
  warningForeground: string;
  
  // 透明関連のセマンティック変数
  transparent?: string;
  transparentBorder?: string;
  transparentBackground?: string;
  
  // ゴースト関連のセマンティック変数
  ghostBackground?: string;
  ghostForeground?: string;
  ghostBorder?: string;
}

/**
 * ボタンコンポーネントのカラー
 */
export interface ButtonColors {
  background: string;
  foreground: string;
  border: string;
  ring: string;
}

/**
 * コンポーネントカラー定義
 */
export interface ComponentColors {
  button: {
    default: ButtonColors;
    secondary: ButtonColors;
    outline: ButtonColors;
    ghost: ButtonColors;
    destructive: ButtonColors;
  };
  
  card: {
    background: string;
    foreground: string;
    border: string;
  };
  
  input: {
    background: string;
    foreground: string;
    border: string;
    ring: string;
    placeholder: string;
  };
  
  dialog: {
    background: string;
    foreground: string;
    border: string;
    overlay: string;
  };
  
  toast: {
    background: string;
    foreground: string;
    border: string;
    action: string;
  };
  
  popover: {
    background: string;
    foreground: string;
    border: string;
  };
}

/**
 * デザインシステム変数定義
 */
export interface DesignSystemVariables {
  // プリミティブ変数（直接的な値）
  primitives: {
    colors: {
      primary: ColorPalette;
      slate: ColorPalette;
      gray: ColorPalette;
      zinc: ColorPalette;
      neutral: ColorPalette;
      stone: ColorPalette;
    };
    radius: {
      none: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      full: string;
    };
    spacing: Record<string, string>;
    shadow: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
  };
  
  // セマンティック変数（意味的な値）
  semantic: SemanticColors;
  
  // コンポーネント固有の変数
  components: ComponentColors;
}

/**
 * UIからFigmaへのメッセージ型
 */
export type UIToFigmaMessage = 
  | { type: 'generate-color-palette'; color: string }
  | { type: 'create-variables'; colors: ColorPalette }
  | { type: 'cancel' };

/**
 * FigmaからUIへのメッセージ型
 */
export type FigmaToUIMessage = 
  | { type: 'palette-generated'; palette: ColorPalette }
  | { type: 'variables-created'; success: boolean };
