/**
 * VariableSetting プラグイン メインJavaScriptファイル
 * 各種モジュールのインポートと初期化処理を担当
 */

import { UIManager } from './UIManager.js';
import { ColorPaletteGenerator } from './ColorPaletteGenerator.js';
import { LogManager } from './LogManager.js';
import { FigmaAPIClient } from './FigmaAPIClient.js';
import { ExportManager } from './ExportManager.js';

// ログマネージャーの初期化
const logManager = new LogManager('log-section');

// APIクライアントの初期化
const figmaApiClient = new FigmaAPIClient(logManager);

// カラーパレットジェネレーターの初期化
const colorPaletteGenerator = new ColorPaletteGenerator();

// エクスポートマネージャーの初期化
const exportManager = new ExportManager();

// UIマネージャーの初期化（各モジュールへの参照を注入）
const uiManager = new UIManager({
  logManager,
  figmaApiClient,
  colorPaletteGenerator,
  exportManager
});

// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
  // UI初期化
  uiManager.initialize();
  
  // 初期ログ
  logManager.log('VariableSettingプラグインが起動しました');
  
  // Figma APIイベントリスナーの設定
  window.onmessage = (event) => {
    figmaApiClient.handleMessage(event, uiManager);
  };
});
