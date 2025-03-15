/**
 * Figmaプラグインのメッセージ型定義
 * UIとプラグイン間のメッセージ交換に使用される型を定義
 */

// 設定オブジェクト型
export type ConfigValue = string | number | boolean | null | Record<string, unknown>;
export type ConfigObject = Record<string, ConfigValue>;

// プラグインからUIに送信するメッセージの型
export type UIMessage = 
  | { type: 'init'; version: string; hasVariables: boolean }
  | { type: 'error'; message: string; details?: string }
  | { type: 'palette-result'; palette: Record<string, string>; error?: string }
  | { type: 'variables-creating' }
  | { type: 'variables-created'; success: boolean; message: string }
  | { type: 'css-generated'; css: Record<string, string> | string; error?: string }
  | { type: 'tailwind-generated'; config: ConfigObject | string; error?: string }
  | { type: 'variables-cleared'; success: boolean; error?: string }
  | { type: 'plugin-loaded'; message: string };

// UIからプラグインに送信されるメッセージの型
export type PluginMessage = 
  | { type: 'generate-palette'; color: string }
  | { type: 'create-variables'; config: ConfigObject; clearExisting?: boolean }
  | { type: 'export-css' }
  | { type: 'export-tailwind' }
  | { type: 'clear-variables' }
  | { type: 'cancel' }
  | { type: string; [key: string]: unknown }; // その他のメッセージに対応
