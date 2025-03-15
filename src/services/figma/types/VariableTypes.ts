/**
 * Figma変数関連の型定義
 * 単一責任の原則に従い、変数関連の型定義を集約
 */

import { RGBA } from './ColorTypes';

/**
 * 変数モード列挙型
 */
export enum VariableMode {
  Light = 'Light',
  Dark = 'Dark'
}

/**
 * 変数タイプ列挙型
 */
export enum VariableType {
  Color = 'COLOR',
  Number = 'FLOAT',
  String = 'STRING'
}

/**
 * コレクションタイプ列挙型
 */
export enum CollectionType {
  Color = 'Color',
  Typography = 'Typography',
  Spacing = 'Spacing',
  Grid = 'Grid',
  Shadow = 'Shadow',
  Custom = 'Custom'
}

/**
 * 変数の基本情報
 */
export interface VariableBase {
  /** 変数ID */
  id: string;
  /** 変数名 */
  name: string;
  /** 変数の説明 */
  description?: string;
  /** 公開時に非表示かどうか */
  hiddenFromPublishing: boolean;
  /** 変数の型 */
  variableType: VariableType;
  /** 変数が所属するコレクションのID */
  variableCollectionId: string;
  /** 変数のキー */
  key?: string;
  /** 変数のリモートID */
  remote?: boolean;
  /** 変数のコードシンタックス */
  codeSyntax?: Record<string, unknown>;
  /** 変数のスコープ */
  scopes?: string[];
  /** 変数のモード値 */
  valuesByMode: VariableValueMap;
}

/**
 * Figma変数インターフェース
 */
export interface Variable extends VariableBase {
  /** 変数が所属するグループパス */
  resolvedType?: string;
}

/**
 * 変数コレクションの基本情報
 */
export interface VariableCollectionBase {
  /** コレクションID */
  id: string;
  /** コレクション名 */
  name: string;
  /** コレクションの説明 */
  description?: string;
  /** コレクションのモード */
  modes: VariableCollectionMode[];
  /** デフォルトモードID */
  defaultModeId: string;
  /** 公開時に非表示かどうか */
  hiddenFromPublishing: boolean;
  /** コレクションのリモートID */
  remote?: boolean;
  /** コレクションのキー */
  key?: string;
}

/**
 * Figma変数コレクションインターフェース
 */
export interface VariableCollection extends VariableCollectionBase {
  /** コレクションのタイプ */
  type?: CollectionType;
}

/**
 * 変数コレクションモード
 */
export interface VariableCollectionMode {
  /** モードID */
  modeId: string;
  /** モード名 */
  name: string;
  /** モードの説明 */
  description?: string;
}

/**
 * 変数の値マップ
 * キーはモードID、値は変数値
 */
export interface VariableValueMap {
  [modeId: string]: VariableValue;
}

/**
 * 変数値の共通型（ユニオン型）
 */
export type VariableValue = VariableColorValue | VariableNumberValue | VariableStringValue | string | number | RGBA;

/**
 * 変数カラー値
 */
export interface VariableColorValue {
  /** 色のRGBA値 */
  color: RGBA;
  /** 変数参照 */
  variableReference?: string;
}

/**
 * 変数数値値
 */
export interface VariableNumberValue {
  /** 数値 */
  value: number;
  /** 変数参照 */
  variableReference?: string;
}

/**
 * 変数文字列値
 */
export interface VariableStringValue {
  /** 文字列 */
  value: string;
  /** 変数参照 */
  variableReference?: string;
}

/**
 * 変数作成オプション
 */
export interface VariableCreateOptions {
  /** 変数名 */
  name: string;
  /** ライトモードの値 */
  lightValue: VariableValue;
  /** ダークモードの値 */
  darkValue: VariableValue;
  /** コレクション名 */
  collectionName?: string;
  /** 変数のグループパス */
  group?: string;
}

/**
 * カラーパレット型定義
 * カラーパレット生成に必要な情報を定義
 */
export interface ColorPalette {
  /** ベースカラー（16進数またはRGBA文字列） */
  baseColor: string;
  /** 明度ステップの配列 */
  steps: number[];
  /** 明度調整の係数 */
  lightnessAdjustment?: number;
}
