/**
 * FigmaAPIClientクラス
 * Figmaプラグインとの通信を担当
 */
export class FigmaAPIClient {
  /**
   * コンストラクタ
   * @param {LogManager} logManager - ログ管理クラスのインスタンス
   */
  constructor(logManager) {
    this.logManager = logManager;
  }
  
  /**
   * Figmaから送信されたメッセージを処理
   * @param {Event} event - メッセージイベント
   * @param {UIManager} uiManager - UIマネージャーインスタンス
   */
  handleMessage(event, uiManager) {
    const { type, message } = event.data.pluginMessage || {};
    
    if (!type) return;
    
    switch (type) {
      case 'init-complete':
        this.logManager.log('Figmaプラグイン接続完了');
        break;
        
      case 'variables-created':
        this.logManager.log('Figma変数が正常に作成されました', 'success');
        uiManager.renderVariables(message.variables);
        break;
        
      case 'variables-cleared':
        this.logManager.log('すべての変数が正常にクリアされました', 'success');
        uiManager.renderVariables([]);
        break;
        
      case 'error':
        this.logManager.log(`エラー: ${message}`, 'error');
        break;
        
      case 'log':
        this.logManager.log(message);
        break;
        
      default:
        this.logManager.log(`不明なメッセージタイプ: ${type}`);
    }
  }
  
  /**
   * カラー変数を作成するリクエストを送信
   * @param {string} primaryColor - プライマリカラー(HEX)
   * @param {Object} lightPalette - ライトモードのカラーパレット
   * @param {Object} darkPalette - ダークモードのカラーパレット
   * @param {boolean} clearExisting - 既存の変数をクリアするかどうか
   */
  createVariables(primaryColor, lightPalette, darkPalette, clearExisting) {
    if (!lightPalette || !darkPalette) {
      this.logManager.log('パレットが生成されていません。先にパレットを生成してください。', 'error');
      return;
    }
    
    // Figmaプラグインに変数作成リクエストを送信
    parent.postMessage({
      pluginMessage: {
        type: 'create-variables',
        primaryColor,
        lightPalette,
        darkPalette,
        clearExisting
      }
    }, '*');
  }
  
  /**
   * すべての変数をクリアするリクエストを送信
   */
  clearAllVariables() {
    // Figmaプラグインに変数クリアリクエストを送信
    parent.postMessage({
      pluginMessage: {
        type: 'clear-variables'
      }
    }, '*');
  }
  
  /**
   * CSS変数をエクスポートするリクエストを送信
   * @param {Object} lightPalette - ライトモードのカラーパレット
   * @param {Object} darkPalette - ダークモードのカラーパレット
   */
  exportCssVariables(lightPalette, darkPalette) {
    // Figmaプラグインに変数エクスポートリクエストを送信
    parent.postMessage({
      pluginMessage: {
        type: 'export-css',
        lightPalette,
        darkPalette
      }
    }, '*');
  }
  
  /**
   * Tailwind設定をエクスポートするリクエストを送信
   * @param {Object} lightPalette - ライトモードのカラーパレット
   * @param {Object} darkPalette - ダークモードのカラーパレット
   */
  exportTailwindConfig(lightPalette, darkPalette) {
    // Figmaプラグインに変数エクスポートリクエストを送信
    parent.postMessage({
      pluginMessage: {
        type: 'export-tailwind',
        lightPalette,
        darkPalette
      }
    }, '*');
  }
}
