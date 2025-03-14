/**
 * メッセージハンドラーサービス
 * UIとプラグイン間のメッセージ処理を担当
 */
import { PluginMessage, UIMessage } from '../types/messageTypes';
import { generateColorPalette } from '../utils/colorUtils';
import { FigmaVariableService } from './FigmaVariableServiceCompat';
import { createDesignSystemVariables } from './DesignSystemService';

/**
 * UIからのメッセージを処理する
 */
export async function handleUIMessage(msg: MessageEvent['data']): Promise<void> {
  // 型安全に処理するために型アサーションを使用
  const typedMsg = msg as PluginMessage;
  // 安全な文字列変換のためにプリミティブ型を保証
  figma.notify("メッセージ受信: " + JSON.stringify(typedMsg, null, 2));
  
  switch (typedMsg.type) {
    case 'generate-palette':
      await handleGeneratePalette(typedMsg);
      break;
    case 'create-variables':
      await handleCreateVariables(typedMsg);
      break;
    case 'export-css':
      await handleExportCSS();
      break;
    case 'export-tailwind':
      await handleExportTailwind();
      break;
    case 'clear-variables':
      await handleClearVariables();
      break;
    case 'cancel':
      figma.closePlugin();
      break;
    default:
      figma.notify("不明なメッセージタイプ: " + typedMsg.type);
  }
}

/**
 * カラーパレット生成リクエストを処理
 */
async function handleGeneratePalette(msg: PluginMessage & { type: 'generate-palette' }): Promise<void> {
  // colorプロパティがstring型であることを保証
  const primaryColor = String(msg.color);
  figma.notify("パレット生成リクエスト: " + primaryColor);
  
  // パレット生成
  const palette = generateColorPalette(primaryColor);
  figma.notify("生成されたパレット: " + Object.keys(palette).length + "色");
  
  // 結果をUIに送信
  figma.ui.postMessage({
    type: 'palette-result', 
    palette: palette 
  } as UIMessage);
}

/**
 * 変数作成リクエストを処理
 */
async function handleCreateVariables(msg: PluginMessage & { type: 'create-variables' }): Promise<void> {
  // colorプロパティがstring型であることを保証
  const primaryColor = String(msg.color);
  // 更新モードか確認（デフォルトは更新モード）
  const clearExisting = Boolean(msg.clearExisting);
  
  figma.notify(`変数作成リクエスト: ${primaryColor}${clearExisting ? ' (既存を削除)' : ''}`);
  
  // UIに処理開始を通知
  figma.ui.postMessage({ 
    type: 'variables-creating'
  } as UIMessage);
  
  // デザインシステム変数の作成
  const result = await createDesignSystemVariables(primaryColor, clearExisting);
  
  // 結果をUIに送信
  figma.ui.postMessage({ 
    type: 'variables-created', 
    success: result.success,
    message: result.message
  } as UIMessage);
}

/**
 * CSS変数エクスポートを処理
 */
async function handleExportCSS(): Promise<void> {
  // CSS変数のエクスポートをリクエスト
  const css = FigmaVariableService.exportAsCSSVariables();
  
  // 結果をUIに送信
  figma.ui.postMessage({
    type: 'css-generated',
    css: css
  } as UIMessage);
}

/**
 * Tailwind設定エクスポートを処理
 */
async function handleExportTailwind(): Promise<void> {
  // Tailwind設定のエクスポートをリクエスト
  const config = FigmaVariableService.exportAsTailwindConfig();
  
  // 結果をUIに送信
  figma.ui.postMessage({
    type: 'tailwind-generated',
    config: config
  } as UIMessage);
}

/**
 * 変数クリアリクエストを処理
 */
async function handleClearVariables(): Promise<void> {
  figma.notify("変数クリアリクエスト");
  
  // コレクションの初期化
  await FigmaVariableService.initializeCollections();
  
  // 変数をクリア
  FigmaVariableService.clearAllVariables();
  
  // 結果をUIに送信
  figma.ui.postMessage({
    type: 'variables-cleared',
    success: true
  } as UIMessage);
}

/**
 * プラグイン初期化時のメッセージを送信
 */
export function sendInitMessage(): void {
  figma.ui.postMessage({ 
    type: 'plugin-loaded', 
    message: 'プラグインが読み込まれました' 
  } as UIMessage);
}
