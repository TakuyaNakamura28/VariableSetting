/**
 * デザインシステム変数作成サービス
 * プリミティブ変数、セマンティック変数、コンポーネント変数の生成と管理を担当
 */
import { generateColorPalette } from '../utils/colorUtils';
import { generateSemanticColors, generateComponentColors } from '../utils/semanticUtils';
import { 
  generateSpacingTokens, 
  generateRadiusTokens, 
  generateShadowTokens,
  generateGrayscaleTokens,
  generateSupportColorTokens 
} from '../utils/tokensUtils';
import { FigmaVariableService } from './FigmaVariableServiceCompat';
import { CollectionType } from './figmaServiceTypes';

/**
 * プライマリカラーからデザインシステム変数を作成する
 */
export async function createDesignSystemVariables(primaryColor: string, clearExisting: boolean = false) {
  try {
    figma.notify(`Creating design system variables with primary color: ${primaryColor}`);
    
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
      figma.notify('Clearing existing variables...');
      FigmaVariableService.clearAllVariables();
    }
    
    // プライマリカラーからパレット生成と変数作成
    await createPrimitiveColorVariables(primaryColor);
    
    // プリミティブトークン変数の作成
    await createPrimitiveTokenVariables();
    
    // セマンティックカラー変数の作成
    const primaryPalette = generateColorPalette(primaryColor);
    const semanticResult = await createSemanticColorVariables(primaryPalette);
    
    // コンポーネントカラー変数の作成
    const componentResult = await createComponentColorVariables(semanticResult.lightColors, semanticResult.darkColors);
    
    // エクスポート機能を実行
    const exportResult = await exportVariables();
    
    return {
      success: true,
      message: 'Design system variables created successfully in separate collections'
    };
  } catch (error) {
    figma.notify(`Error creating design system variables: ${error}`, { error: true });
    return {
      success: false,
      message: `Error: ${error}`
    };
  }
}

/**
 * プリミティブカラー変数を作成
 */
async function createPrimitiveColorVariables(primaryColor: string) {
  // プライマリカラーからパレット生成
  const primaryPalette = generateColorPalette(primaryColor);
  figma.notify('Primary palette generated');
  
  // プリミティブカラー変数の作成
  figma.notify('Creating primitive color variables...');
  
  // プライマリカラー変数
  const primaryVariables = FigmaVariableService.createPrimitiveColorPalette('primary', primaryPalette);
  if (Object.keys(primaryVariables).length === 0) {
    figma.notify('Warning: No primary variables were created', { error: true });
  }
  
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
  
  figma.notify('Primitive color variables created');
  return primaryPalette;
}

/**
 * プリミティブトークン変数を作成
 */
async function createPrimitiveTokenVariables() {
  figma.notify('Creating primitive token variables...');
  
  // 角丸変数
  const radiusTokens = generateRadiusTokens();
  // 数値型に変換して渡す
  const numericRadiusTokens: Record<string, number> = {};
  for (const [key, value] of Object.entries(radiusTokens)) {
    numericRadiusTokens[key] = typeof value === 'string' ? parseFloat(value) : value;
  }
  FigmaVariableService.createPrimitiveNumberTokens('radius', numericRadiusTokens);
  
  // スペーシング変数
  const spacingTokens = generateSpacingTokens();
  // 小数点を含む名前があるか確認
  for (const key of Object.keys(spacingTokens)) {
    if (key.includes('.')) {
      figma.notify(`Invalid spacing token key contains dot: ${key}`, { error: true });
    }
  }
  
  // 数値型に変換して渡す
  const numericSpacingTokens: Record<string, number> = {};
  for (const [key, value] of Object.entries(spacingTokens)) {
    numericSpacingTokens[key] = typeof value === 'string' ? parseFloat(value) : value;
  }
  FigmaVariableService.createPrimitiveNumberTokens('spacing', numericSpacingTokens);
  
  // シャドウ変数
  const lightShadows = generateShadowTokens(false);
  const darkShadows = generateShadowTokens(true);
  
  // シャドウデータの適切な変換
  const processedLightShadows: Record<string, EffectValue[]> = {};
  const processedDarkShadows: Record<string, EffectValue[]> = {};
  
  // 文字列からEffectValueオブジェクトに変換
  for (const [key, value] of Object.entries(lightShadows)) {
    if (typeof value === 'string') {
      // 文字列から効果を解析（仮実装）
      processedLightShadows[key] = [{
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: 0.2 },
        offset: { x: 0, y: 2 },
        radius: 4,
        spread: 0,
        visible: true,
        blendMode: 'NORMAL'
      }];
    } else if (Array.isArray(value)) {
      processedLightShadows[key] = value as EffectValue[];
    }
  }
  
  // ダークモード用シャドウも同様に処理
  for (const [key, value] of Object.entries(darkShadows)) {
    if (typeof value === 'string') {
      processedDarkShadows[key] = [{
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: 0.4 },
        offset: { x: 0, y: 2 },
        radius: 4,
        spread: 0,
        visible: true,
        blendMode: 'NORMAL'
      }];
    } else if (Array.isArray(value)) {
      processedDarkShadows[key] = value as EffectValue[];
    }
  }
  
  FigmaVariableService.createShadowVariables(processedLightShadows, processedDarkShadows);
  figma.notify('Primitive token variables created');
}

/**
 * セマンティックカラー変数を作成
 */
async function createSemanticColorVariables(primaryPalette: Record<string, string>) {
  // 意味のある色（セマンティックカラー）の変数を生成
  const lightSemanticColors = generateSemanticColors(primaryPalette, false);
  const darkSemanticColors = generateSemanticColors(primaryPalette, true);
  figma.notify('Generated semantic colors');
  
  // セマンティックカラーを文字列の辞書に変換
  const lightSemanticColorsAsStrings: Record<string, string> = {};
  const darkSemanticColorsAsStrings: Record<string, string> = {};
  
  // 型安全にアクセスするために安全な型変換を使用
  const convertSemanticColors = (colors: unknown): Record<string, Record<string, string>> => {
    return colors as Record<string, Record<string, string>>;
  };
  
  const lightColorsObj = convertSemanticColors(lightSemanticColors);
  const darkColorsObj = convertSemanticColors(darkSemanticColors);
  
  for (const category of Object.keys(lightColorsObj)) {
    for (const colorName of Object.keys(lightColorsObj[category])) {
      const key = `${category}-${colorName}`;
      lightSemanticColorsAsStrings[key] = lightColorsObj[category][colorName];
    }
  }
  
  for (const category of Object.keys(darkColorsObj)) {
    for (const colorName of Object.keys(darkColorsObj[category])) {
      const key = `${category}-${colorName}`;
      darkSemanticColorsAsStrings[key] = darkColorsObj[category][colorName];
    }
  }
  
  // 文字列の辞書に変換されたセマンティックカラーを使用
  const semanticVariables = FigmaVariableService.createSemanticColors(
    lightSemanticColorsAsStrings,
    darkSemanticColorsAsStrings
  );
  
  if (semanticVariables && Object.keys(semanticVariables).length > 0) {
    figma.notify(`Created ${Object.keys(semanticVariables).length} semantic color variables`);
  } else {
    figma.notify('No semantic color variables were created', { error: true });
  }
  
  return {
    semanticVariables,
    lightColors: lightSemanticColors,
    darkColors: darkSemanticColors
  };
}

/**
 * コンポーネントカラー変数を作成
 */
async function createComponentColorVariables(lightSemanticColors: unknown, darkSemanticColors: unknown) {
  // コンポーネント固有の色変数を生成
  const lightComponentColors = generateComponentColors(lightSemanticColors, false);
  const darkComponentColors = generateComponentColors(darkSemanticColors, true);
  figma.notify('Generated component colors');
  
  // コンポーネントカラーを文字列の辞書に変換
  const lightComponentColorsAsStrings: Record<string, string> = {};
  const darkComponentColorsAsStrings: Record<string, string> = {};
  
  // 型安全にアクセスするための関数
  const convertComponentColors = (colors: unknown): Record<string, Record<string, string>> => {
    return colors as Record<string, Record<string, string>>;
  };
  
  const lightCompObj = convertComponentColors(lightComponentColors);
  const darkCompObj = convertComponentColors(darkComponentColors);
  
  for (const component of Object.keys(lightCompObj)) {
    for (const stateName of Object.keys(lightCompObj[component])) {
      const key = `${component}-${stateName}`;
      lightComponentColorsAsStrings[key] = lightCompObj[component][stateName];
    }
  }
  
  for (const component of Object.keys(darkCompObj)) {
    for (const stateName of Object.keys(darkCompObj[component])) {
      const key = `${component}-${stateName}`;
      darkComponentColorsAsStrings[key] = darkCompObj[component][stateName];
    }
  }
  
  // 文字列の辞書に変換されたコンポーネントカラーを使用
  const componentVariables = FigmaVariableService.createComponentColors(
    lightComponentColorsAsStrings,
    darkComponentColorsAsStrings
  );
  
  if (componentVariables && Object.keys(componentVariables).length > 0) {
    figma.notify(`Created ${Object.keys(componentVariables).length} component color variables`);
  } else {
    figma.notify('No component color variables were created', { error: true });
  }
  
  return componentVariables;
}

/**
 * 変数をエクスポート
 */
async function exportVariables() {
  // CSS変数としてエクスポート
  const cssVariables = FigmaVariableService.exportAsCSSVariables();
  
  // CSS変数の検証
  if (cssVariables && Object.keys(cssVariables).length > 0) {
    figma.notify(`Generated ${Object.keys(cssVariables).length} CSS variables`);
  } else {
    figma.notify('Warning: No CSS variables were generated', { error: true });
  }
  
  // Tailwind設定としてエクスポート
  const tailwindConfig = FigmaVariableService.exportAsTailwindConfig();
  
  // Tailwind設定の検証
  if (tailwindConfig) {
    // tailwindConfigは文字列ではなくオブジェクトとして扱う
    const configObj = typeof tailwindConfig === 'string' 
      ? JSON.parse(tailwindConfig) 
      : tailwindConfig;
    
    const themeKeys = configObj.theme ? Object.keys(configObj.theme).length : 0;
    figma.notify(`Generated Tailwind config with ${themeKeys} theme properties`);
  } else {
    figma.notify('Warning: Tailwind config generation failed', { error: true });
  }
  
  return { cssVariables, tailwindConfig };
}
