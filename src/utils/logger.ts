/**
 * アプリケーションログ機能
 * ログレベルを制御可能なロガーユーティリティ
 */

export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4
}

interface LoggerOptions {
  level: LogLevel;
  prefix?: string;
}

/**
 * 基本ロガークラス
 * 開発・デバッグモードでのみログを出力し、本番環境では抑制する
 */
class Logger {
  private level: LogLevel;
  private prefix: string;
  
  constructor(options: LoggerOptions = { level: LogLevel.INFO }) {
    this.level = options.level;
    this.prefix = options.prefix ? `[${options.prefix}] ` : '';
  }
  
  /**
   * ログレベルを設定
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }
  
  /**
   * プレフィックスを設定
   */
  setPrefix(prefix: string): void {
    this.prefix = prefix ? `[${prefix}] ` : '';
  }
  
  /**
   * デバッグメッセージを出力
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.level >= LogLevel.DEBUG) {
      console.debug(`${this.prefix}${message}`, ...args);
    }
  }
  
  /**
   * 情報メッセージを出力
   */
  info(message: string, ...args: unknown[]): void {
    if (this.level >= LogLevel.INFO) {
      console.info(`${this.prefix}${message}`, ...args);
    }
  }
  
  /**
   * 警告メッセージを出力
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.level >= LogLevel.WARN) {
      console.warn(`${this.prefix}${message}`, ...args);
    }
  }
  
  /**
   * エラーメッセージを出力
   */
  error(message: string, ...args: unknown[]): void {
    if (this.level >= LogLevel.ERROR) {
      console.error(`${this.prefix}${message}`, ...args);
    }
  }
}

// デフォルトロガーのインスタンス
// 開発モードか本番モードかに応じてログレベルを設定
const isDevelopment = process.env.NODE_ENV !== 'production';
export const logger = new Logger({
  level: isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR,
  prefix: 'VariableSetting'
});

// サービス別ロガーの作成ヘルパー
export function createServiceLogger(serviceName: string): Logger {
  return new Logger({
    level: isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR,
    prefix: serviceName
  });
}

export default logger;
