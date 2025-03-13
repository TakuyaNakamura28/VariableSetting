// カラーピッカーと入力フィールドの同期
document.addEventListener('DOMContentLoaded', () => {
  console.log("UI初期化開始");
  
  // UI要素
  const colorPicker = document.getElementById('primary-color-picker');
  const colorHexInput = document.getElementById('primary-color-hex');
  const generateBtn = document.getElementById('generate-btn');
  const createVariablesBtn = document.getElementById('create-variables-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const palettePreview = document.getElementById('palette-preview');
  const swatchesContainer = document.getElementById('swatches-container');
  
  console.log("UI要素の取得完了:", { 
    colorPicker: !!colorPicker, 
    colorHexInput: !!colorHexInput, 
    generateBtn: !!generateBtn,
    palettePreview: !!palettePreview
  });
  
  // タブ関連の要素
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // 変数設定のチェックボックス
  const useSemanticCheckbox = document.getElementById('use-semantic');
  const useComponentTokensCheckbox = document.getElementById('use-component-tokens');
  const prefixInput = document.getElementById('prefix-input');
  
  // プレビューコンテナ
  const lightPreview = document.getElementById('light-preview');
  const darkPreview = document.getElementById('dark-preview');
  const semanticPreview = document.getElementById('semantic-preview');
  
  // 現在のパレットを保存する変数
  let currentPalette = {};
  
  // タブ切り替え機能
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      
      // アクティブなタブを変更
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // 対応するコンテンツを表示
      tabContents.forEach(content => {
        if (content.getAttribute('data-tab') === tabId) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });
  
  // カラーピッカーの変更をHEX入力に反映
  colorPicker.addEventListener('input', (e) => {
    colorHexInput.value = e.target.value;
  });
  
  // HEX入力の変更をカラーピッカーに反映
  colorHexInput.addEventListener('input', (e) => {
    // 正規表現でHEXカラーの形式を確認
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexColorRegex.test(e.target.value)) {
      colorPicker.value = e.target.value;
    }
  });
  
  // パレット生成ボタンのクリックハンドラ
  generateBtn.addEventListener('click', () => {
    console.log("パレット生成ボタンがクリックされました");
    const primaryColor = colorHexInput.value;
    console.log("選択された色:", primaryColor);
    
    // ボタンをロード中状態に
    generateBtn.textContent = '生成中...';
    generateBtn.disabled = true;
    
    // Figmaにメッセージを送信
    try {
      console.log("Figmaにメッセージを送信:", { type: 'generate-color-palette', color: primaryColor });
      parent.postMessage({
        pluginMessage: {
          type: 'generate-color-palette',
          color: primaryColor
        }
      }, '*');
      console.log("メッセージ送信完了");
    } catch (error) {
      console.error("メッセージ送信中にエラーが発生:", error);
      
      // エラー状態から回復
      generateBtn.textContent = 'パレットを生成';
      generateBtn.disabled = false;
      
      showNotification('メッセージの送信に失敗しました', 'error');
    }
  });
  
  // 変数作成ボタンのクリックハンドラ
  createVariablesBtn.addEventListener('click', () => {
    console.log("変数作成ボタンがクリックされました");
    
    // ボタンをロード中状態に
    createVariablesBtn.textContent = '作成中...';
    createVariablesBtn.disabled = true;
    
    // 変数設定オプションを取得
    const options = {
      useSemantic: useSemanticCheckbox.checked,
      useComponentTokens: useComponentTokensCheckbox.checked,
      prefix: prefixInput.value.trim()
    };
    
    console.log("変数作成オプション:", options);
    
    // Figmaにメッセージを送信
    parent.postMessage({
      pluginMessage: {
        type: 'create-variables',
        colors: currentPalette,
        options: options
      }
    }, '*');
  });
  
  // キャンセルボタンのクリックハンドラ
  cancelBtn.addEventListener('click', () => {
    console.log("キャンセルボタンがクリックされました");
    parent.postMessage({
      pluginMessage: {
        type: 'cancel'
      }
    }, '*');
  });
  
  // Figmaからのメッセージ受信
  window.onmessage = (event) => {
    console.log("メッセージを受信:", event.data);
    const msg = event.data.pluginMessage;
    if (!msg) {
      console.log("pluginMessageが存在しません");
      return;
    }
    
    console.log("pluginMessage受信:", msg);
    
    switch (msg.type) {
      case 'palette-generated':
        console.log("パレット生成結果を受信:", msg.palette);
        
        // ボタンを元に戻す
        generateBtn.textContent = 'パレットを生成';
        generateBtn.disabled = false;
        
        // パレットデータを保存
        currentPalette = msg.palette;
        
        // スウォッチを表示
        renderSwatches(currentPalette);
        
        // プレビューを更新
        updateThemePreview(currentPalette);
        updateSemanticPreview(currentPalette);
        
        // パレットプレビューと変数作成ボタンを表示
        palettePreview.style.display = 'block';
        break;
        
      case 'variables-created':
        console.log("変数作成結果を受信:", msg.success);
        
        // ボタンを元に戻す
        createVariablesBtn.textContent = '変数を作成';
        createVariablesBtn.disabled = false;
        
        if (msg.success) {
          showNotification('変数が正常に作成されました！', 'success');
        } else {
          showNotification('変数の作成中にエラーが発生しました。', 'error');
        }
        break;
        
      case 'error':
        console.error("エラーメッセージを受信:", msg.message);
        
        // エラーが発生した場合の処理
        generateBtn.textContent = 'パレットを生成';
        generateBtn.disabled = false;
        createVariablesBtn.textContent = '変数を作成';
        createVariablesBtn.disabled = false;
        
        showNotification(msg.message, 'error');
        break;
        
      default:
        console.log("不明なメッセージタイプ:", msg.type);
    }
  };
  
  // 通知を表示する関数
  function showNotification(message, type) {
    console.log(`通知を表示: "${message}", タイプ: ${type}`);
    
    // 既存の通知があれば削除
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // 新しい通知を作成
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // 通知をドキュメントに追加
    document.body.appendChild(notification);
    
    // 3秒後に通知を消す
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }
  
  // パレットスウォッチを表示する関数
  function renderSwatches(palette) {
    console.log("スウォッチをレンダリング:", palette);
    
    // スウォッチコンテナをクリア
    swatchesContainer.innerHTML = '';
    
    // 表示する順序を設定（数値順にソート）
    const sortOrder = [
      'primary', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900'
    ];
    
    // ソート順に基づいてエントリを並べ替える
    const sortedEntries = Object.entries(palette).sort((a, b) => {
      const indexA = sortOrder.indexOf(a[0]);
      const indexB = sortOrder.indexOf(b[0]);
      return indexA - indexB;
    });
    
    // パレットの各カラーに対してスウォッチを作成
    sortedEntries.forEach(([name, color]) => {
      const swatch = document.createElement('div');
      swatch.className = 'swatch';
      swatch.style.backgroundColor = color;
      
      // カラー名と値を表示
      const swatchInfo = document.createElement('div');
      swatchInfo.className = 'swatch-info';
      
      const swatchName = document.createElement('div');
      swatchName.className = 'swatch-name';
      swatchName.textContent = name;
      
      const swatchValue = document.createElement('div');
      swatchValue.className = 'swatch-value';
      swatchValue.textContent = color.toUpperCase();
      
      swatchInfo.appendChild(swatchName);
      swatchInfo.appendChild(swatchValue);
      swatch.appendChild(swatchInfo);
      
      // コピーボタンを追加
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.textContent = 'コピー';
      copyButton.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(color)
          .then(() => {
            const originalText = copyButton.textContent;
            copyButton.textContent = 'コピー済み';
            setTimeout(() => {
              copyButton.textContent = originalText;
            }, 1000);
          })
          .catch(err => {
            console.error('クリップボードへのコピーに失敗しました:', err);
          });
      });
      
      swatch.appendChild(copyButton);
      swatchesContainer.appendChild(swatch);
    });
    
    console.log("スウォッチのレンダリング完了");
  }
  
  // テーマプレビューを更新する関数
  function updateThemePreview(palette) {
    console.log("テーマプレビューを更新:", palette);
    
    // ライトモードのプレビュー要素
    const lightButtons = lightPreview.querySelectorAll('.preview-button');
    const lightInput = lightPreview.querySelector('.preview-input');
    
    // ダークモードのプレビュー要素
    const darkButtons = darkPreview.querySelectorAll('.preview-button');
    const darkInput = darkPreview.querySelector('.preview-input');
    
    // プライマリボタンの色を設定
    const primaryButtons = document.querySelectorAll('.preview-button.primary');
    primaryButtons.forEach(button => {
      button.style.backgroundColor = palette['500'];
    });
    
    // ライトモードの背景色と前景色
    lightPreview.style.backgroundColor = palette['50'];
    lightPreview.style.color = palette['900'];
    
    // ライトモードのセカンダリボタン
    lightButtons[1].style.backgroundColor = palette['100'];
    lightButtons[1].style.color = palette['700'];
    
    // ライトモードの入力フィールド
    lightInput.style.borderColor = palette['200'];
    
    // ダークモードの背景色と前景色
    darkPreview.style.backgroundColor = palette['900'];
    darkPreview.style.color = palette['50'];
    
    // ダークモードのセカンダリボタン
    darkButtons[1].style.backgroundColor = palette['800'];
    darkButtons[1].style.color = palette['100'];
    
    // ダークモードの入力フィールド
    darkInput.style.backgroundColor = palette['800'];
    darkInput.style.color = palette['100'];
    darkInput.style.borderColor = palette['700'];
    
    console.log("テーマプレビューの更新完了");
  }
  
  // セマンティックカラープレビューを表示する関数
  function updateSemanticPreview(palette) {
    console.log("セマンティックカラープレビューを更新:", palette);
    
    // コンテナをクリア
    semanticPreview.innerHTML = '';
    
    // セマンティックカラーの定義
    const semanticColors = [
      { name: 'background', light: palette['50'], dark: palette['900'] },
      { name: 'foreground', light: palette['900'], dark: palette['50'] },
      { name: 'muted', light: palette['100'], dark: palette['800'] },
      { name: 'muted-foreground', light: palette['700'], dark: palette['300'] },
      { name: 'border', light: palette['200'], dark: palette['700'] },
      { name: 'input', light: palette['200'], dark: palette['700'] },
      { name: 'ring', light: palette['300'], dark: palette['700'] },
    ];
    
    // セマンティックカラーのスウォッチを作成
    semanticColors.forEach(semantic => {
      // ライトモードスウォッチ
      const lightSwatch = document.createElement('div');
      lightSwatch.className = 'semantic-color';
      lightSwatch.style.backgroundColor = semantic.light;
      lightSwatch.textContent = semantic.name;
      
      // テキスト色を調整（背景が明るい場合は暗いテキスト）
      if (semantic.name === 'background' || semantic.name === 'muted') {
        lightSwatch.style.color = '#333';
        lightSwatch.style.textShadow = 'none';
      }
      
      // ダークモードスウォッチ
      const darkSwatch = document.createElement('div');
      darkSwatch.className = 'semantic-color';
      darkSwatch.style.backgroundColor = semantic.dark;
      darkSwatch.textContent = semantic.name;
      
      // 両方のスウォッチをコンテナに追加
      semanticPreview.appendChild(lightSwatch);
      semanticPreview.appendChild(darkSwatch);
    });
    
    console.log("セマンティックカラープレビューの更新完了");
  }
  
  // 変数設定の変更を監視して、プレビューを更新
  useSemanticCheckbox.addEventListener('change', () => {
    if (Object.keys(currentPalette).length > 0) {
      updateSemanticPreview(currentPalette);
    }
  });
  
  useComponentTokensCheckbox.addEventListener('change', () => {
    if (Object.keys(currentPalette).length > 0) {
      updateThemePreview(currentPalette);
    }
  });
  
  console.log("UI初期化完了");
});
