/**
 * VariableSetting
 * Figmaプラグインメインコード
 * プリミティブ変数→セマンティック変数→コンポーネント変数の階層構造を実現
 */
import { generateColorPalette } from './utils/colorUtils';
import { generateSemanticColors, generateComponentColors } from './utils/semanticUtils';
import { 
  generateSpacingTokens, 
  generateRadiusTokens, 
  generateShadowTokens,
  generateGrayscaleTokens,
  generateSupportColorTokens 
} from './utils/tokensUtils';
import { FigmaVariableService, CollectionType } from './services/figmaService';
import { ColorPalette, SemanticColors, ComponentColors } from './types';

/**
 * プライマリカラーからデザインシステム変数を作成する
 */
async function createDesignSystemVariables(primaryColor: string, clearExisting: boolean = false) {
  try {
    console.log(`Creating design system variables with primary color: ${primaryColor}`);
    
    // 複数コレクションの初期化
    const initialized = await FigmaVariableService.initializeCollections();
    if (!initialized) {
      return {
        success: false,
        message: "Failed to initialize collections"
      };
    }
    
    // 既存変数をクリアするオプション
    if (clearExisting) {
      console.log('Clearing existing variables...');
      FigmaVariableService.clearAllVariables();
    }
    
    // プライマリカラーからパレット生成
    const primaryPalette = generateColorPalette(primaryColor);
    console.log('Primary palette generated');
    
    // プリミティブカラー変数の作成
    console.log('Creating primitive color variables...');
    
    // プライマリカラー変数
    const primaryVariables = FigmaVariableService.createPrimitiveColorPalette('primary', primaryPalette);
    
    // グレースケールカラー変数
    const grayscales = generateGrayscaleTokens();
    for (const [name, palette] of Object.entries(grayscales)) {
      FigmaVariableService.createPrimitiveColorPalette(name, palette);
    }
    
    // 補助カラー変数
    const supportColors = generateSupportColorTokens();
    for (const [name, palette] of Object.entries(supportColors)) {
      FigmaVariableService.createPrimitiveColorPalette(name, palette);
    }
    
    // 特別なプリミティブカラー - 透明色
    FigmaVariableService.createColorVariable(
      'transparent', 
      'transparent', 
      'transparent', 
      CollectionType.Primitives,
      'colors/special'
    );
    
    console.log('Primitive color variables created');
    
    // 数値トークン変数の作成
    console.log('Creating primitive token variables...');
    
    // 角丸変数
    const radiusTokens = generateRadiusTokens();
    FigmaVariableService.createPrimitiveNumberTokens('radius', radiusTokens);
    
    // スペーシング変数
    const spacingTokens = generateSpacingTokens();
    console.log('Generated spacing tokens:', JSON.stringify(spacingTokens));
    // 小数点を含む名前があるか確認
    for (const key of Object.keys(spacingTokens)) {
      if (key.includes('.')) {
        console.error(`Invalid spacing token key contains dot: ${key}`);
      }
    }
    FigmaVariableService.createPrimitiveNumberTokens('spacing', spacingTokens);
    
    // シャドウ変数
    const lightShadows = generateShadowTokens(false);
    const darkShadows = generateShadowTokens(true);
    FigmaVariableService.createShadowVariables(lightShadows, darkShadows);
    
    console.log('Primitive token variables created');
    
    // セマンティックカラーの生成
    console.log('Creating semantic color variables...');
    const lightSemanticColors = generateSemanticColors(primaryPalette, false);
    const darkSemanticColors = generateSemanticColors(primaryPalette, true);
    
    // セマンティック変数の作成
    const semanticVariables = FigmaVariableService.createSemanticColors(
      lightSemanticColors,
      darkSemanticColors
    );
    console.log('Semantic variables created');
    
    // コンポーネントカラーの生成
    console.log('Creating component color variables...');
    const lightComponentColors = generateComponentColors(lightSemanticColors, false);
    const darkComponentColors = generateComponentColors(darkSemanticColors, true);
    
    // コンポーネント変数の作成
    FigmaVariableService.createComponentColors(
      lightComponentColors,
      darkComponentColors
    );
    console.log('Component variables created');
    
    // CSS変数としてエクスポート
    // 実際にはユーザーに保存させる仕組みを追加する予定
    const cssVariables = FigmaVariableService.exportAsCSSVariables();
    console.log('CSS variables generated');
    
    // Tailwind設定としてエクスポート
    // 実際にはユーザーに保存させる仕組みを追加する予定
    const tailwindConfig = FigmaVariableService.exportAsTailwindConfig();
    console.log('Tailwind config generated');
    
    return {
      success: true,
      message: 'Design system variables created successfully in separate collections'
    };
  } catch (error) {
    console.error('Error creating design system variables:', error);
    return {
      success: false,
      message: `Error: ${error}`
    };
  }
}

/**
 * プラグイン初期化
 */
console.log("プラグイン初期化");
figma.showUI(__html__, { width: 500, height: 650 });

/**
 * メッセージ処理
 */
figma.ui.onmessage = async (msg) => {
  console.log("メッセージ受信:", msg);
  
  if (msg.type === 'generate-palette') {
    const primaryColor = msg.color;
    console.log("パレット生成リクエスト:", primaryColor);
    
    // パレット生成
    const palette = generateColorPalette(primaryColor);
    console.log("生成されたパレット:", palette);
    
    // 結果をUIに送信
    figma.ui.postMessage({ 
      type: 'palette-result', 
      palette: palette 
    });
  }
  else if (msg.type === 'create-variables') {
    const primaryColor = msg.color;
    // 更新モードか確認（デフォルトは更新モード）
    const clearExisting = msg.clearExisting === true;
    
    console.log("変数作成リクエスト:", primaryColor, "既存変数をクリア:", clearExisting);
    
    // UIに処理開始を通知
    figma.ui.postMessage({ 
      type: 'variables-creating'
    });
    
    // デザインシステム変数の作成
    const result = await createDesignSystemVariables(primaryColor, clearExisting);
    
    // 結果をUIに送信
    figma.ui.postMessage({ 
      type: 'variables-created', 
      success: result.success,
      message: result.message
    });
  }
  else if (msg.type === 'export-css') {
    // CSS変数のエクスポートをリクエスト
    const css = FigmaVariableService.exportAsCSSVariables();
    
    // 結果をUIに送信
    figma.ui.postMessage({
      type: 'css-generated',
      css: css
    });
  }
  else if (msg.type === 'export-tailwind') {
    // Tailwind設定のエクスポートをリクエスト
    const config = FigmaVariableService.exportAsTailwindConfig();
    
    // 結果をUIに送信
    figma.ui.postMessage({
      type: 'tailwind-generated',
      config: config
    });
  }
  else if (msg.type === 'clear-variables') {
    console.log("変数クリアリクエスト");
    
    // コレクションの初期化
    await FigmaVariableService.initializeCollections();
    
    // 変数をクリア
    FigmaVariableService.clearAllVariables();
    
    // 結果をUIに送信
    figma.ui.postMessage({
      type: 'variables-cleared',
      success: true
    });
  }
  else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
  else {
    console.log("不明なメッセージタイプ:", msg.type);
  }
};

// デバッグ用メッセージ
figma.ui.postMessage({ 
  type: 'plugin-loaded', 
  message: 'プラグインが読み込まれました' 
});
