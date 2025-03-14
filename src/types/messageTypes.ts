/**
 * Figmaプラグインのメッセージ型定義
 * UIとプラグイン間のメッセージ交換に使用される型を定義
 */

// プラグインからUIに送信するメッセージの型
export type UIMessage = 
  | { type: 'palette-result'; palette: Record<string, string> }
  | { type: 'variables-creating' }
  | { type: 'variables-created'; success: boolean; message: string }
  | { type: 'css-generated'; css: string }
  | { type: 'tailwind-generated'; config: string }
  | { type: 'variables-cleared'; success: boolean }
  | { type: 'plugin-loaded'; message: string };

// UIからプラグインに送信されるメッセージの型
export type PluginMessage = 
  | { type: 'generate-palette'; color: string }
  | { type: 'create-variables'; color: string; clearExisting?: boolean }
  | { type: 'export-css' }
  | { type: 'export-tailwind' }
  | { type: 'clear-variables' }
  | { type: 'cancel' }
  | { type: string; [key: string]: unknown }; // その他のメッセージに対応
