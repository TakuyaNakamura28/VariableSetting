/**
 * メッセージハンドラーインターフェース
 * UIとプラグイン間のメッセージ処理を担当するサービスの契約を定義
 */
import { PluginMessage } from '../../types/messageTypes';

/**
 * メッセージハンドラーインターフェース
 * SOLID原則に基づき、UIとプラグイン間のメッセージ処理の責務を定義
 */
export interface IMessageHandler {
  /**
   * UIからのメッセージを処理する
   * 受信したメッセージの種類に応じて適切なハンドラーに処理を委譲
   * @param msg メッセージイベントのデータ
   * @throws 無効なメッセージやエラー発生時に例外をスロー
   */
  handleUIMessage(msg: MessageEvent['data']): Promise<void>;
  
  /**
   * プラグイン初期化時のメッセージを送信
   * UIにプラグインの準備完了状態を通知
   */
  sendInitMessage(): void;
  
  /**
   * カラーパレット生成リクエストを処理
   * 指定された色に基づきカラーパレットを生成しUIに結果を返す
   * @param msg パレット生成リクエストメッセージ
   * @throws カラー処理に関連するエラー発生時に例外をスロー
   */
  handleGeneratePalette(msg: Extract<PluginMessage, { type: 'generate-palette' }>): Promise<void>;
  
  /**
   * 変数作成リクエストを処理
   * 指定された色に基づきFigma変数を作成しUIに結果を返す
   * @param msg 変数作成リクエストメッセージ
   * @throws 変数作成処理中のエラー発生時に例外をスロー
   */
  handleCreateVariables(msg: Extract<PluginMessage, { type: 'create-variables' }>): Promise<void>;
  
  /**
   * CSS変数エクスポートを処理
   * 現在のFigma変数をCSS変数形式でエクスポートしUIに結果を返す
   * @throws エクスポート処理中のエラー発生時に例外をスロー
   */
  handleExportCSS(): Promise<void>;
  
  /**
   * Tailwind設定エクスポートを処理
   * 現在のFigma変数をTailwind設定形式でエクスポートしUIに結果を返す
   * @throws エクスポート処理中のエラー発生時に例外をスロー
   */
  handleExportTailwind(): Promise<void>;
  
  /**
   * 変数クリアリクエストを処理
   * 全てのFigma変数を削除しUIに結果を返す
   * @throws 変数削除処理中のエラー発生時に例外をスロー
   */
  handleClearVariables(): Promise<void>;
}
