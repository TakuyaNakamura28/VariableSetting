/**
 * ロガーサービス
 * アプリケーション全体でのログ記録と通知を統一的に管理
 */

import { ILoggerService } from '../figmaServiceTypes';

export class LoggerService implements ILoggerService {
  private isDebugMode: boolean = false;

  constructor(debugMode: boolean = false) {
    this.isDebugMode = debugMode;
  }

  /**
   * 情報ログを出力
   * @param {string} message ログメッセージ
   */
  log(message: string): void {
    if (this.isDebugMode) {
      console.log(`[INFO] ${message}`);
    }
  }

  /**
   * エラーログを出力
   * @param {string} message エラーメッセージ
   * @param {unknown} [error] エラーオブジェクト
   */
  error(message: string, error?: unknown): void {
    console.error(`[ERROR] ${message}`, error || '');
    
    // Figma UIに通知（簡略版）
    this.notify(message, { error: true });
  }

  /**
   * 警告ログを出力
   * @param {string} message 警告メッセージ
   */
  warn(message: string): void {
    console.warn(`[WARN] ${message}`);
  }

  /**
   * Figma UI上に通知を表示
   * @param {string} message 通知メッセージ
   * @param {object} [options] 通知オプション
   * @param {boolean} [options.error] エラー通知かどうか
   */
  notify(message: string, options?: { error?: boolean }): void {
    figma.notify(message, options);
  }

  /**
   * デバッグモードの設定
   * @param {boolean} enabled デバッグモードを有効にするかどうか
   */
  setDebugMode(enabled: boolean): void {
    this.isDebugMode = enabled;
  }
}
