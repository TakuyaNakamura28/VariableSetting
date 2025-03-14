/**
 * ExportManagerクラス
 * CSS変数およびTailwind設定のエクスポート機能を担当
 */
export class ExportManager {
  /**
   * コンストラクタ
   */
  constructor() {}
  
  /**
   * CSS変数を生成
   * @param {Object} lightPalette - ライトモードのカラーパレット
   * @param {Object} darkPalette - ダークモードのカラーパレット
   * @returns {string} CSS変数定義
   */
  generateCssVariables(lightPalette, darkPalette) {
    // 検証
    if (!lightPalette || !darkPalette) {
      return '/* パレットが見つかりません */';
    }
    
    // CSS変数の生成
    let cssVariables = `:root {\n`;
    
    // ライトモードの変数
    Object.entries(lightPalette).forEach(([step, color]) => {
      cssVariables += `  --primary-${step}: ${color};\n`;
    });
    
    cssVariables += `\n  /* 基本テーマ変数 */\n`;
    cssVariables += `  --background: #ffffff;\n`;
    cssVariables += `  --foreground: #0f172a;\n`;
    cssVariables += `  --card: #ffffff;\n`;
    cssVariables += `  --card-foreground: #0f172a;\n`;
    cssVariables += `  --popover: #ffffff;\n`;
    cssVariables += `  --popover-foreground: #0f172a;\n`;
    cssVariables += `  --primary: ${lightPalette[500]};\n`;
    cssVariables += `  --primary-foreground: #ffffff;\n`;
    cssVariables += `  --secondary: #f1f5f9;\n`;
    cssVariables += `  --secondary-foreground: #0f172a;\n`;
    cssVariables += `  --muted: #f1f5f9;\n`;
    cssVariables += `  --muted-foreground: #64748b;\n`;
    cssVariables += `  --accent: #f1f5f9;\n`;
    cssVariables += `  --accent-foreground: #0f172a;\n`;
    cssVariables += `  --destructive: #ef4444;\n`;
    cssVariables += `  --destructive-foreground: #ffffff;\n`;
    cssVariables += `  --border: #e2e8f0;\n`;
    cssVariables += `  --input: #e2e8f0;\n`;
    cssVariables += `  --ring: ${lightPalette[500]};\n`;
    cssVariables += `  --radius: 0.5rem;\n`;
    cssVariables += `}\n\n`;
    
    // ダークモードの変数
    cssVariables += `.dark {\n`;
    
    Object.entries(darkPalette).forEach(([step, color]) => {
      cssVariables += `  --primary-${step}: ${color};\n`;
    });
    
    cssVariables += `\n  /* 基本テーマ変数 */\n`;
    cssVariables += `  --background: #0f172a;\n`;
    cssVariables += `  --foreground: #f8fafc;\n`;
    cssVariables += `  --card: #1e293b;\n`;
    cssVariables += `  --card-foreground: #f8fafc;\n`;
    cssVariables += `  --popover: #1e293b;\n`;
    cssVariables += `  --popover-foreground: #f8fafc;\n`;
    cssVariables += `  --primary: ${darkPalette[500]};\n`;
    cssVariables += `  --primary-foreground: #0f172a;\n`;
    cssVariables += `  --secondary: #334155;\n`;
    cssVariables += `  --secondary-foreground: #f8fafc;\n`;
    cssVariables += `  --muted: #334155;\n`;
    cssVariables += `  --muted-foreground: #94a3b8;\n`;
    cssVariables += `  --accent: #334155;\n`;
    cssVariables += `  --accent-foreground: #f8fafc;\n`;
    cssVariables += `  --destructive: #7f1d1d;\n`;
    cssVariables += `  --destructive-foreground: #f8fafc;\n`;
    cssVariables += `  --border: #334155;\n`;
    cssVariables += `  --input: #334155;\n`;
    cssVariables += `  --ring: ${darkPalette[500]};\n`;
    cssVariables += `}\n`;
    
    return cssVariables;
  }
  
  /**
   * Tailwind設定を生成
   * @param {Object} lightPalette - ライトモードのカラーパレット
   * @param {Object} darkPalette - ダークモードのカラーパレット
   * @returns {string} Tailwind設定オブジェクト
   */
  generateTailwindConfig(lightPalette, darkPalette) {
    // 検証
    if (!lightPalette || !darkPalette) {
      return '// パレットが見つかりません';
    }
    
    // primaryカラー設定オブジェクト
    const primaryColors = {};
    Object.entries(lightPalette).forEach(([step, color]) => {
      primaryColors[step] = color;
    });
    
    // 設定オブジェクト
    const config = {
      theme: {
        extend: {
          colors: {
            primary: primaryColors,
            // その他のテーマカラー
            background: '#ffffff',
            foreground: '#0f172a',
            card: '#ffffff',
            'card-foreground': '#0f172a',
            popover: '#ffffff',
            'popover-foreground': '#0f172a',
            // ... その他の色
          },
          // ダークモード
          darkMode: {
            // ダークモードの色設定
          }
        }
      }
    };
    
    // JSON文字列に変換して整形
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          ${Object.keys(lightPalette).map(step => `${step}: "var(--primary-${step})"`).join(',\n          ')}
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
}`;
  }
}
