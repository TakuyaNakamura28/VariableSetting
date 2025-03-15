/**
 * メッセージハンドラーサービス実装
 * UIとFigmaプラグイン間のメッセージ処理を担当するサービスの実装
 * SOLID原則に基づいた設計：
 * - 単一責任原則: UIメッセージ処理の責務のみを担う
 * - 開放閉鎖原則: 新しいメッセージタイプに対して拡張可能
 * - リスコフの置換原則: インターフェースに忠実に実装
 * - インターフェース分離原則: IMessageHandlerインターフェースに準拠
 * - 依存性逆転原則: 依存性注入によりサービス間の結合度を低減
 */

import { IMessageHandler } from './interfaces/IMessageHandler';
import { PluginMessage, UIMessage } from '../types/messageTypes';
import { FigmaVariableService } from './FigmaVariableServiceCompat';
import { DesignSystemService } from './DesignSystemService';

/**
 * メッセージハンドラーサービス実装
 */
export class MessageHandlerServiceImpl implements IMessageHandler {
  // 依存するサービス
  private readonly designSystemService: DesignSystemService;
  
  /**
   * コンストラクタ - 依存性注入を通じて必要なサービスを受け取る
   * @param designSystemService デザインシステムサービス
   */
  constructor(designSystemService: DesignSystemService) {
    this.designSystemService = designSystemService;
  }

  /**
   * UIからのメッセージを処理する
   * メッセージタイプに応じて適切なハンドラーメソッドに処理を委譲
   * @param msg UIからのメッセージイベントデータ
   */
  public async handleUIMessage(msg: MessageEvent['data']): Promise<void> {
    try {
      // メッセージタイプの検証
      if (!msg || !msg.type) {
        console.error('無効なメッセージフォーマット:', msg);
        figma.ui.postMessage({ type: 'error', message: '無効なメッセージフォーマット' });
        return;
      }

      console.log('受信メッセージ:', msg.type);
      
      // メッセージタイプに応じた処理の振り分け
      switch (msg.type) {
        case 'generate-palette':
          await this.handleGeneratePalette(msg as Extract<PluginMessage, { type: 'generate-palette' }>);
          break;
        case 'create-variables':
          await this.handleCreateVariables(msg as Extract<PluginMessage, { type: 'create-variables' }>);
          break;
        case 'export-css':
          await this.handleExportCSS();
          break;
        case 'export-tailwind':
          await this.handleExportTailwind();
          break;
        case 'clear-variables':
          await this.handleClearVariables();
          break;
        default:
          console.warn('未処理のメッセージタイプ:', msg.type);
          figma.ui.postMessage({ 
            type: 'error', 
            message: `未対応のメッセージタイプ: ${msg.type}` 
          });
      }
    } catch (error) {
      // エラーハンドリングの強化
      console.error('メッセージ処理エラー:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      
      // UIにエラー情報を返す
      figma.ui.postMessage({ 
        type: 'error', 
        message: `処理中にエラーが発生しました: ${errorMessage}`,
        details: error instanceof Error ? error.stack : undefined
      });
    }
  }

  /**
   * プラグイン初期化時のメッセージを送信
   * UIにプラグインの準備完了状態を通知
   */
  public sendInitMessage(): void {
    try {
      const message: UIMessage = { 
        type: 'plugin-loaded',
        message: 'プラグインの準備が完了しました'
      };
      
      console.log('初期化メッセージを送信:', message);
      figma.ui.postMessage(message);
      
      // 変数の存在を確認する方法として、コレクションの初期化を試みる
      // これにより間接的に変数が存在するかどうかを判断できる
      FigmaVariableService.initializeCollections()
        .then(initialized => {
          // バージョン情報と変数の有無を送信
          figma.ui.postMessage({
            type: 'init',
            version: '1.0.0',
            hasVariables: initialized
          } as UIMessage);
        })
        .catch(error => {
          console.error('コレクション初期化エラー:', error);
          // エラーが発生した場合も結果を送信（変数なしとして扱う）
          figma.ui.postMessage({
            type: 'init',
            version: '1.0.0',
            hasVariables: false
          } as UIMessage);
        });
    } catch (error) {
      console.error('初期化メッセージ送信エラー:', error);
      // エラーが発生してもUIに通知を試みる
      figma.ui.postMessage({ 
        type: 'error', 
        message: '初期化処理中にエラーが発生しました'
      });
    }
  }

  /**
   * カラーパレット生成リクエストを処理
   * @param msg パレット生成メッセージ
   */
  public async handleGeneratePalette(msg: Extract<PluginMessage, { type: 'generate-palette' }>): Promise<void> {
    try {
      console.log('パレット生成リクエスト受信:', msg.color);
      
      if (!msg.color) {
        throw new Error('カラー情報が指定されていません');
      }
      
      // デザインシステムサービスを使用してパレットを生成
      const palette = this.designSystemService.generateColorPalette(msg.color);
      
      // 生成結果をUIに送信
      figma.ui.postMessage({ 
        type: 'palette-result', 
        palette
      });
      
      console.log('パレット生成完了');
    } catch (error) {
      console.error('パレット生成エラー:', error);
      throw error; // 上位のハンドラでキャッチするために再スロー
    }
  }

  /**
   * 変数作成リクエストを処理
   * @param msg 変数作成メッセージ
   */
  public async handleCreateVariables(msg: Extract<PluginMessage, { type: 'create-variables' }>): Promise<void> {
    try {
      console.log('変数作成リクエスト受信');
      
      if (!msg.config) {
        throw new Error('変数設定情報が指定されていません');
      }
      
      // デザインシステムサービスを使用して変数を作成
      const result = await this.designSystemService.createVariables(msg.config, msg.clearExisting);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // 成功メッセージをUIに送信
      figma.ui.postMessage({ 
        type: 'variables-created',
        message: result.message || '変数が正常に作成されました'
      });
      
      console.log('変数作成完了');
    } catch (error) {
      console.error('変数作成エラー:', error);
      throw error; // 上位のハンドラでキャッチするために再スロー
    }
  }

  /**
   * CSS変数エクスポートを処理
   */
  public async handleExportCSS(): Promise<void> {
    try {
      console.log('CSS変数エクスポートリクエスト受信');
      
      // 変数サービスを使用してCSSエクスポートを実行
      const cssExport = await FigmaVariableService.exportAsCSSVariables();
      
      // 結果をUIに送信
      figma.ui.postMessage({ 
        type: 'css-generated', 
        css: cssExport
      });
      
      console.log('CSSエクスポート完了');
    } catch (error) {
      console.error('CSSエクスポートエラー:', error);
      throw error; // 上位のハンドラでキャッチするために再スロー
    }
  }

  /**
   * Tailwind設定エクスポートを処理
   */
  public async handleExportTailwind(): Promise<void> {
    try {
      console.log('Tailwind設定エクスポートリクエスト受信');
      
      // 変数サービスを使用してTailwindエクスポートを実行
      const tailwindConfig = await FigmaVariableService.exportAsTailwindConfig();
      
      // 結果をUIに送信
      figma.ui.postMessage({ 
        type: 'tailwind-generated', 
        config: tailwindConfig
      });
      
      console.log('Tailwindエクスポート完了');
    } catch (error) {
      console.error('Tailwindエクスポートエラー:', error);
      throw error; // 上位のハンドラでキャッチするために再スロー
    }
  }

  /**
   * 変数クリアリクエストを処理
   */
  public async handleClearVariables(): Promise<void> {
    try {
      console.log('変数クリアリクエスト受信');
      
      // 変数サービスを使用して変数をクリア
      await FigmaVariableService.clearAllVariables();
      
      // 結果をUIに送信
      figma.ui.postMessage({ 
        type: 'variables-cleared', 
        success: true
      });
      
      console.log('変数クリア完了');
    } catch (error) {
      console.error('変数クリアエラー:', error);
      throw error; // 上位のハンドラでキャッチするために再スロー
    }
  }
}
