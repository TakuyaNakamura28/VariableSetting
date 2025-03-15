/**
 * VariableSetting
 * Figmaプラグインメインコード
 * プリミティブ変数→セマンティック変数→コンポーネント変数の階層構造を実現
 */
import { MessageHandlerServiceImpl } from './services/MessageHandlerServiceImpl';
import { IMessageHandler } from './services/interfaces/IMessageHandler';
import { DesignSystemService } from './services/DesignSystemService';
import { FigmaVariableServiceAdapter } from './services/FigmaVariableAdapter';

/**
 * サービスの初期化
 * 依存性注入パターンを使用し、SOLID原則の依存性逆転原則に準拠
 */
// 必要なサービスを初期化
const figmaVariableAdapter = new FigmaVariableServiceAdapter();
const designSystemService = new DesignSystemService(figmaVariableAdapter);
// メッセージハンドラに依存サービスを注入
const messageHandler: IMessageHandler = new MessageHandlerServiceImpl(designSystemService);

/**
 * プラグイン初期化
 */
figma.notify("プラグイン初期化");
figma.showUI(__html__, { width: 500, height: 650 });

/**
 * メッセージ処理
 */
figma.ui.onmessage = (msg) => messageHandler.handleUIMessage(msg);

/**
 * 初期メッセージの送信
 */
messageHandler.sendInitMessage();
