/**
 * UIManagerクラス
 * UIの操作とイベントハンドリングを担当
 */
export class UIManager {
  /**
   * コンストラクタ
   * @param {Object} dependencies - 依存するモジュール
   */
  constructor({ logManager, figmaApiClient, colorPaletteGenerator, exportManager }) {
    // 依存関係の注入
    this.logManager = logManager;
    this.figmaApiClient = figmaApiClient;
    this.colorPaletteGenerator = colorPaletteGenerator;
    this.exportManager = exportManager;
    
    // UI要素
    this.elements = {
      colorPicker: null,
      colorHexInput: null,
      generateBtn: null,
      resetBtn: null,
      previewSection: null,
      lightPalette: null,
      darkPalette: null,
      variablesSection: null,
      clearExistingCheckbox: null,
      createVariablesBtn: null,
      clearVariablesBtn: null,
      variablesList: null,
      exportSection: null,
      cssExport: null,
      tailwindExport: null,
      exportCssBtn: null,
      exportTailwindBtn: null,
      confirmModal: null,
      confirmCancelBtn: null,
      confirmDeleteBtn: null
    };
    
    // 現在のカラーパレット状態
    this.currentState = {
      lightPalette: null,
      darkPalette: null,
      variables: []
    };
  }
  
  /**
   * UIの初期化
   */
  initialize() {
    // UI要素の参照取得
    this.initUIElements();
    
    // イベントリスナーの設定
    this.initEventListeners();
    
    // タブ切り替え機能の初期化
    this.initTabs();
  }
  
  /**
   * UI要素の参照を取得
   */
  initUIElements() {
    this.elements.colorPicker = document.getElementById('color-picker');
    this.elements.colorHexInput = document.getElementById('color-hex');
    this.elements.generateBtn = document.getElementById('generate-btn');
    this.elements.resetBtn = document.getElementById('reset-btn');
    this.elements.previewSection = document.getElementById('preview-section');
    this.elements.lightPalette = document.getElementById('light-palette');
    this.elements.darkPalette = document.getElementById('dark-palette');
    this.elements.variablesSection = document.getElementById('variables-section');
    this.elements.clearExistingCheckbox = document.getElementById('clear-existing');
    this.elements.createVariablesBtn = document.getElementById('create-variables-btn');
    this.elements.clearVariablesBtn = document.getElementById('clear-variables-btn');
    this.elements.variablesList = document.getElementById('variables-list');
    this.elements.exportSection = document.getElementById('export-section');
    this.elements.cssExport = document.getElementById('css-export');
    this.elements.tailwindExport = document.getElementById('tailwind-export');
    this.elements.exportCssBtn = document.getElementById('export-css-btn');
    this.elements.exportTailwindBtn = document.getElementById('export-tailwind-btn');
    this.elements.confirmModal = document.getElementById('confirm-modal');
    this.elements.confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    this.elements.confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  }
  
  /**
   * イベントリスナーの設定
   */
  initEventListeners() {
    // カラーピッカーのイベント
    this.elements.colorPicker.addEventListener('input', (e) => {
      const color = e.target.value.toUpperCase();
      this.elements.colorHexInput.value = color;
    });
    
    this.elements.colorHexInput.addEventListener('input', (e) => {
      const color = e.target.value.toUpperCase();
      if (/^#[0-9A-F]{6}$/i.test(color)) {
        this.elements.colorPicker.value = color;
      }
    });
    
    // パレット生成ボタン
    this.elements.generateBtn.addEventListener('click', () => {
      const color = this.elements.colorHexInput.value.toUpperCase();
      if (/^#[0-9A-F]{6}$/i.test(color)) {
        this.generatePalettes(color);
      } else {
        this.logManager.log('有効なHEXカラーを入力してください（例: #3B82F6）', 'error');
      }
    });
    
    // リセットボタン
    this.elements.resetBtn.addEventListener('click', () => {
      this.resetUI();
    });
    
    // 変数生成ボタン
    this.elements.createVariablesBtn.addEventListener('click', () => {
      const color = this.elements.colorHexInput.value.toUpperCase();
      const clearExisting = this.elements.clearExistingCheckbox.checked;
      
      this.logManager.log(`Figma変数生成リクエスト: ${color}（既存変数をクリア: ${clearExisting ? 'はい' : 'いいえ'}）`);
      this.figmaApiClient.createVariables(color, this.currentState.lightPalette, this.currentState.darkPalette, clearExisting);
    });
    
    // 変数クリアボタン
    this.elements.clearVariablesBtn.addEventListener('click', () => {
      this.showConfirmModal();
    });
    
    // 確認モーダルのボタン
    this.elements.confirmCancelBtn.addEventListener('click', () => {
      this.hideConfirmModal();
    });
    
    this.elements.confirmDeleteBtn.addEventListener('click', () => {
      this.hideConfirmModal();
      this.logManager.log('すべての変数のクリアを要求しています...');
      this.figmaApiClient.clearAllVariables();
    });
    
    // エクスポートボタン
    this.elements.exportCssBtn.addEventListener('click', () => {
      this.logManager.log('CSS変数エクスポートリクエスト');
      this.copyToClipboard(this.elements.cssExport.value);
    });
    
    this.elements.exportTailwindBtn.addEventListener('click', () => {
      this.logManager.log('Tailwind設定エクスポートリクエスト');
      this.copyToClipboard(this.elements.tailwindExport.value);
    });
  }
  
  /**
   * タブ切り替え機能の初期化
   */
  initTabs() {
    // パレットプレビュータブ
    document.querySelectorAll('.tab[data-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabType = tab.getAttribute('data-tab');
        
        // タブの表示切り替え
        document.querySelectorAll('.tab[data-tab]').forEach(t => {
          t.classList.remove('active');
        });
        tab.classList.add('active');
        
        // コンテンツの表示切り替え
        document.querySelectorAll('.tab-content[data-tab]').forEach(content => {
          content.classList.remove('active');
        });
        document.querySelector(`.tab-content[data-tab="${tabType}"]`).classList.add('active');
      });
    });
    
    // エクスポートタブ
    document.querySelectorAll('.tab[data-export-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabType = tab.getAttribute('data-export-tab');
        
        // タブの表示切り替え
        document.querySelectorAll('.tab[data-export-tab]').forEach(t => {
          t.classList.remove('active');
        });
        tab.classList.add('active');
        
        // コンテンツの表示切り替え
        document.querySelectorAll('.tab-content[data-export-tab]').forEach(content => {
          content.classList.remove('active');
        });
        document.querySelector(`.tab-content[data-export-tab="${tabType}"]`).classList.add('active');
      });
    });
  }
  
  /**
   * カラーパレットの生成
   * @param {string} primaryColor - プライマリカラー (HEX)
   */
  generatePalettes(primaryColor) {
    this.logManager.log(`カラーパレット生成: ${primaryColor}`);
    
    // ライトモードのパレット生成
    const lightPalette = this.colorPaletteGenerator.generateLightPalette(primaryColor);
    this.currentState.lightPalette = lightPalette;
    
    // ダークモードのパレット生成
    const darkPalette = this.colorPaletteGenerator.generateDarkPalette(lightPalette);
    this.currentState.darkPalette = darkPalette;
    
    // パレットの表示
    this.renderSwatches(this.elements.lightPalette, lightPalette);
    this.renderSwatches(this.elements.darkPalette, darkPalette);
    
    // エクスポートコード生成
    this.elements.cssExport.value = this.exportManager.generateCssVariables(lightPalette, darkPalette);
    this.elements.tailwindExport.value = this.exportManager.generateTailwindConfig(lightPalette, darkPalette);
    
    // セクション表示
    this.elements.previewSection.style.display = 'block';
    this.elements.variablesSection.style.display = 'block';
    this.elements.exportSection.style.display = 'block';
  }
  
  /**
   * パレットスウォッチを表示
   * @param {HTMLElement} container - スウォッチを表示するコンテナ
   * @param {Object} palette - カラーパレット
   */
  renderSwatches(container, palette) {
    container.innerHTML = '';
    
    Object.entries(palette).forEach(([key, value]) => {
      const swatch = document.createElement('div');
      swatch.className = 'swatch';
      swatch.style.backgroundColor = value;
      
      const info = document.createElement('div');
      info.className = 'swatch-info';
      info.textContent = `${key}: ${value}`;
      
      swatch.appendChild(info);
      container.appendChild(swatch);
      
      // クリックでカラーを選択
      swatch.addEventListener('click', () => {
        this.elements.colorPicker.value = value;
        this.elements.colorHexInput.value = value;
      });
    });
  }
  
  /**
   * 変数リストを表示
   * @param {Array} variables - 変数オブジェクトの配列
   */
  renderVariables(variables) {
    this.currentState.variables = variables;
    
    if (variables.length > 0) {
      this.elements.variablesList.innerHTML = '';
      this.elements.variablesList.style.display = 'block';
      
      variables.forEach(v => {
        const item = document.createElement('div');
        item.className = 'variable-item';
        
        const name = document.createElement('div');
        name.className = 'variable-name';
        name.textContent = v.name;
        
        const colorDiv = document.createElement('div');
        colorDiv.className = 'variable-color';
        
        const preview = document.createElement('div');
        preview.className = 'color-preview';
        preview.style.backgroundColor = v.value;
        
        const value = document.createElement('span');
        value.textContent = v.value;
        
        colorDiv.appendChild(preview);
        colorDiv.appendChild(value);
        
        item.appendChild(name);
        item.appendChild(colorDiv);
        
        this.elements.variablesList.appendChild(item);
      });
    } else {
      this.elements.variablesList.style.display = 'none';
    }
  }
  
  /**
   * UIをリセット
   */
  resetUI() {
    // デフォルト値にリセット
    this.elements.colorPicker.value = '#3B82F6';
    this.elements.colorHexInput.value = '#3B82F6';
    
    // セクションを非表示
    this.elements.previewSection.style.display = 'none';
    this.elements.variablesSection.style.display = 'none';
    this.elements.exportSection.style.display = 'none';
    this.elements.variablesList.style.display = 'none';
    
    // 状態リセット
    this.currentState.lightPalette = null;
    this.currentState.darkPalette = null;
    this.currentState.variables = [];
    
    this.logManager.log('UIリセット完了');
  }
  
  /**
   * 確認モーダルを表示
   */
  showConfirmModal() {
    this.elements.confirmModal.classList.remove('hidden');
  }
  
  /**
   * 確認モーダルを非表示
   */
  hideConfirmModal() {
    this.elements.confirmModal.classList.add('hidden');
  }
  
  /**
   * テキストをクリップボードにコピー
   * @param {string} text - コピーするテキスト
   */
  copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    this.logManager.log('クリップボードにコピーしました', 'success');
  }
}
