/**
 * VariableSetting
 * Figmaプラグインメインコード
 * プリミティブ変数→セマンティック変数→コンポーネント変数の階層構造を実現
 */
import { handleUIMessage, sendInitMessage } from './services/MessageHandlerService';

/**
 * プラグイン初期化
 */
figma.notify("プラグイン初期化");
figma.showUI(__html__, { width: 500, height: 650 });

/**
 * メッセージ処理
 */
figma.ui.onmessage = handleUIMessage;

/**
 * 初期メッセージの送信
 */
sendInitMessage();
