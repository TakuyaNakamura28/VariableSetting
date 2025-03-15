/**
 * FigmaServiceBaseクラス
 * Figmaサービスの基底クラス。共通のユーティリティと設定を提供
 */
import { createServiceLogger } from '../../../utils/logger';
import { Logger } from '../../../utils/logger';

/**
 * Figmaサービスの基底クラス
 * すべてのFigmaサービス関連クラスの親クラス
 */
export abstract class FigmaServiceBase {
  protected readonly logger: Logger;
  
  /**
   * コンストラクタ
   * @param {string} loggerPrefix ロガーのプレフィックス
   */
  constructor(loggerPrefix: string = 'FigmaService') {
    this.logger = createServiceLogger(loggerPrefix);
  }
  
  /**
   * 警告メッセージをログに出力
   * @param {string} message 警告メッセージ
   */
  protected warn(message: string): void {
    this.logger.warn(message);
  }
  
  /**
   * 情報メッセージをログに出力
   * @param {string} message 情報メッセージ
   */
  protected info(message: string): void {
    this.logger.info(message);
  }
  
  /**
   * エラーメッセージをログに出力
   * @param {string} message エラーメッセージ
   * @param {unknown} [error] エラーオブジェクト
   */
  protected error(message: string, error?: unknown): void {
    this.logger.error(message, error);
  }
}
