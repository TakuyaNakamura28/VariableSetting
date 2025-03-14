/**
 * Figma API型定義
 * 簡略版（必要な型のみ定義）
 */

declare global {
  // Figmaのグローバルオブジェクト
  interface FigmaInstance {
    readonly variables: VariablesAPI;
    notify(message: string, options?: NotificationOptions): void;
    closePlugin(): void;
    ui: {
      onmessage: (callback: (msg: any) => void) => void;
      postMessage: (msg: any) => void;
    };
    showUI(html: string, options: { width: number; height: number }): void;
  }

  // NotificationOptions型
  interface NotificationOptions {
    timeout?: number;
    error?: boolean;
  }

  // VariablesAPI型
  interface VariablesAPI {
    getLocalVariables(): Variable[];
    getLocalVariableCollections(): VariableCollection[];
    createVariable(name: string, collectionId: string, resolvedType: VariableResolvedDataType): Variable;
  }

  // 変数の解決された型
  type VariableResolvedDataType = 'BOOLEAN' | 'COLOR' | 'FLOAT' | 'STRING' | 'EFFECT';

  // 変数のコレクション
  interface VariableCollection {
    id: string;
    name: string;
    modes: VariableMode[];
    defaultModeId: string;
    remote: boolean;
    hiddenFromPublishing: boolean;
  }

  // 変数のモード
  interface VariableMode {
    id: string;
    name: string;
    modeId: string;
  }

  // 変数
  interface Variable {
    id: string;
    name: string;
    resolvedType: VariableResolvedDataType;
    valuesByMode: Record<string, VariableValue>;
    remote: boolean;
    description: string;
    hiddenFromPublishing: boolean;
    scopes: VariableScope[];
    codeSyntax: CodeSyntaxConfig;
    collectionId: string;

    setValueForMode(modeId: string, value: VariableValue): void;
    remove(): void;
  }

  // 変数のスコープ
  type VariableScope = "ALL_SCOPES" | "TEXT_CONTENT" | "CORNER_RADIUS" | "WIDTH_HEIGHT";

  // 変数の値
  type VariableValue = string | number | boolean | RGBA | EffectValue[];

  // 色の値
  interface RGBA {
    r: number; // 0-1
    g: number; // 0-1
    b: number; // 0-1
    a: number; // 0-1
  }

  // エフェクト値
  interface EffectValue {
    type: "INNER_SHADOW" | "DROP_SHADOW" | "LAYER_BLUR" | "BACKGROUND_BLUR";
    color?: RGBA;
    offset?: Vector;
    radius: number;
    spread?: number;
    visible: boolean;
    blendMode?: BlendMode;
    showShadowBehindNode?: boolean;
  }

  // ベクター値
  interface Vector {
    x: number;
    y: number;
  }

  // ブレンドモード
  type BlendMode = "NORMAL" | "MULTIPLY" | "SCREEN" | "OVERLAY" | "DARKEN" | "LIGHTEN" | "COLOR_DODGE" | "COLOR_BURN" | "HARD_LIGHT" | "SOFT_LIGHT" | "DIFFERENCE" | "EXCLUSION" | "HUE" | "SATURATION" | "COLOR" | "LUMINOSITY";

  // コードシンタックス設定
  interface CodeSyntaxConfig {
    webc?: string;
    scss?: string;
    js?: string;
  }

  // figmaグローバル変数
  const figma: FigmaInstance;
}

// ESLint対策: 空のexport文を追加
export {};
