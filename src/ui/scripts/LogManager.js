/**
 * LogManagerクラス
 * ログの表示と管理を担当
 */
export class LogManager {
  /**
   * コンストラクタ
   * @param {string} logContainerId - ログコンテナ要素のID
   */
  constructor(logContainerId) {
    this.logContainer = document.getElementById(logContainerId);
    this.logs = [];
  }
  
  /**
   * ログを追加して表示
   * @param {string} message - ログメッセージ
   * @param {string} type - ログの種類（success, error, または未指定）
   */
  log(message, type) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      timestamp,
      message,
      type
    };
    
    // ログ配列に追加
    this.logs.push(logEntry);
    
    // DOM要素の作成
    const logElement = document.createElement('div');
    logElement.className = `log-entry${type ? ' ' + type : ''}`;
    logElement.textContent = `[${timestamp}] ${message}`;
    
    // コンテナに追加
    this.logContainer.appendChild(logElement);
    
    // 自動スクロール
    this.logContainer.scrollTop = this.logContainer.scrollHeight;
    
    // コンソールにも出力
    if (type === 'error') {
      console.error(message);
    } else {
      console.log(message);
    }
    
    return logEntry;
  }
  
  /**
   * ログをクリア
   */
  clearLogs() {
    this.logs = [];
    this.logContainer.innerHTML = '';
  }
  
  /**
   * すべてのログを取得
   * @returns {Array} ログエントリの配列
   */
  getAllLogs() {
    return [...this.logs];
  }
}
