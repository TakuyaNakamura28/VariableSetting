# Shadcn UI準拠のFigmaバリアブル設計

## 基本方針

1. **Shadcn UIの命名規則に準拠**: background/foregroundの命名パターンを維持
2. **テーマ対応**: light/darkモードの切り替えに対応
3. **階層構造の明確化**: プリミティブ → セマンティック → コンポーネントの参照関係
4. **Figmaの制約に対応**: 各コレクションは1種類のモードのみ対応

## コレクション構造

Figmaでは以下の5つのコレクションを作成します：

1. **Primitives**（基本値）- モードなし
2. **Theme**（テーマ関連の値）- light/darkモード
3. **Responsive**（レスポンシブ関連の値）- mobile/tablet/desktopモード
4. **Component**（テーマ関連のコンポーネント値）- light/darkモード
5. **Component-Responsive**（レスポンシブ関連のコンポーネント値）- mobile/tablet/desktopモード

## 各コレクションの詳細定義

### 1. Primitives（モードなし）

基本的な値を持つコレクション。他の変数を参照しない純粋な値のみを含みます。

```text
Primitives
├── color
│   ├── base
│   │   ├── black: #000000
│   │   ├── white: #FFFFFF
│   │   └── transparent: rgba(0,0,0,0)
│   │
│   ├── slate
│   │   ├── 50: #f8fafc
│   │   ├── 100: #f1f5f9
│   │   ├── 200: #e2e8f0
│   │   ├── 300: #cbd5e1
│   │   ├── 400: #94a3b8
│   │   ├── 500: #64748b
│   │   ├── 600: #475569
│   │   ├── 700: #334155
│   │   ├── 800: #1e293b
│   │   ├── 900: #0f172a
│   │   └── 950: #020617
│   │
│   ├── gray
│   │   ├── 50: #f9fafb
│   │   ├── 100: #f3f4f6
│   │   ├── 200: #e5e7eb
│   │   ├── 300: #d1d5db
│   │   ├── 400: #9ca3af
│   │   ├── 500: #6b7280
│   │   ├── 600: #4b5563
│   │   ├── 700: #374151
│   │   ├── 800: #1f2937
│   │   ├── 900: #111827
│   │   └── 950: #030712
│   │
│   ├── zinc
│   │   ├── 50: #fafafa
│   │   ├── 100: #f4f4f5
│   │   ├── 200: #e4e4e7
│   │   ├── 300: #d4d4d8
│   │   ├── 400: #a1a1aa
│   │   ├── 500: #71717a
│   │   ├── 600: #52525b
│   │   ├── 700: #3f3f46
│   │   ├── 800: #27272a
│   │   ├── 900: #18181b
│   │   └── 950: #09090b
│   │
│   ├── neutral
│   │   ├── 50: #fafafa
│   │   ├── 100: #f5f5f5
│   │   ├── 200: #e5e5e5
│   │   ├── 300: #d4d4d4
│   │   ├── 400: #a3a3a3
│   │   ├── 500: #737373
│   │   ├── 600: #525252
│   │   ├── 700: #404040
│   │   ├── 800: #262626
│   │   ├── 900: #171717
│   │   └── 950: #0a0a0a
│   │
│   ├── stone
│   │   ├── 50: #fafaf9
│   │   ├── 100: #f5f5f4
│   │   ├── 200: #e7e5e4
│   │   ├── 300: #d6d3d1
│   │   ├── 400: #a8a29e
│   │   ├── 500: #78716c
│   │   ├── 600: #57534e
│   │   ├── 700: #44403c
│   │   ├── 800: #292524
│   │   ├── 900: #1c1917
│   │   └── 950: #0c0a09
│   │
│   ├── red
│   │   ├── 50: #fef2f2
│   │   ├── 100: #fee2e2
│   │   ├── 200: #fecaca
│   │   ├── 300: #fca5a5
│   │   ├── 400: #f87171
│   │   ├── 500: #ef4444
│   │   ├── 600: #dc2626
│   │   ├── 700: #b91c1c
│   │   ├── 800: #991b1b
│   │   ├── 900: #7f1d1d
│   │   └── 950: #450a0a
│   │
│   ├── blue
│   │   ├── 50: #eff6ff
│   │   ├── 100: #dbeafe
│   │   ├── 200: #bfdbfe
│   │   ├── 300: #93c5fd
│   │   ├── 400: #60a5fa
│   │   ├── 500: #3b82f6
│   │   ├── 600: #2563eb
│   │   ├── 700: #1d4ed8
│   │   ├── 800: #1e40af
│   │   ├── 900: #1e3a8a
│   │   └── 950: #172554
│   │
│   ├── green
│   │   ├── 50: #f0fdf4
│   │   ├── 100: #dcfce7
│   │   ├── 200: #bbf7d0
│   │   ├── 300: #86efac
│   │   ├── 400: #4ade80
│   │   ├── 500: #22c55e
│   │   ├── 600: #16a34a
│   │   ├── 700: #15803d
│   │   ├── 800: #166534
│   │   ├── 900: #14532d
│   │   └── 950: #052e16
│
├── size
│   ├── 0: 0px
│   ├── 1: 4px
│   ├── 2: 8px
│   ├── 3: 12px
│   ├── 4: 16px
│   ├── 5: 20px
│   ├── 6: 24px
│   ├── 8: 32px
│   ├── 10: 40px
│   ├── 12: 48px
│   ├── 16: 64px
│   ├── 20: 80px
│   ├── 24: 96px
│   └── ... [その他のサイズ]
│
├── radius
│   ├── none: 0px
│   ├── sm: 2px
│   ├── md: 4px
│   ├── lg: 8px
│   ├── xl: 12px
│   ├── 2xl: 16px
│   ├── 3xl: 24px
│   └── full: 9999px
│
├── font
│   ├── family
│   │   ├── sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
│   │   ├── serif: "Georgia", "Times New Roman", serif
│   │   └── mono: "Roboto Mono", "SF Mono", "Menlo", monospace
│   │
│   ├── size
│   │   ├── xs: 12px
│   │   ├── sm: 14px
│   │   ├── base: 16px
│   │   ├── lg: 18px
│   │   ├── xl: 20px
│   │   ├── 2xl: 24px
│   │   ├── 3xl: 30px
│   │   ├── 4xl: 36px
│   │   ├── 5xl: 48px
│   │   └── ... [その他のサイズ]
│   │
│   ├── weight
│   │   ├── thin: 100
│   │   ├── extralight: 200
│   │   ├── light: 300
│   │   ├── normal: 400
│   │   ├── medium: 500
│   │   ├── semibold: 600
│   │   ├── bold: 700
│   │   ├── extrabold: 800
│   │   └── black: 900
│   │
│   └── line-height
│       ├── none: 1
│       ├── tight: 1.25
│       ├── snug: 1.375
│       ├── normal: 1.5
│       ├── relaxed: 1.625
│       └── loose: 2
│
├── shadow
│   ├── none: none
│   ├── sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
│   ├── md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
│   ├── lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
│   ├── xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
│   └── 2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
│
└── animation
    ├── duration
    │   ├── 75: 75ms
    │   ├── 100: 100ms
    │   ├── 150: 150ms
    │   ├── 200: 200ms
    │   ├── 300: 300ms
    │   ├── 500: 500ms
    │   ├── 700: 700ms
    │   └── 1000: 1000ms
    │
    └── easing
        ├── linear: cubic-bezier(0, 0, 1, 1)
        ├── in: cubic-bezier(0.4, 0, 1, 1)
        ├── out: cubic-bezier(0, 0, 0.2, 1)
        ├── in-out: cubic-bezier(0.4, 0, 0.2, 1)
        └── bounce: cubic-bezier(0.175, 0.885, 0.32, 1.275)
```

### 2. Theme（light/darkモード）

Shadcn UIの命名規則に準拠したテーマ変数を定義します。Primitivesを参照します。

```text
Theme
├── background
│   ├── light: {Primitives.color.base.white}
│   └── dark: {Primitives.color.slate.950}
│
├── foreground
│   ├── light: {Primitives.color.slate.950}
│   └── dark: {Primitives.color.slate.50}
│
├── card
│   ├── light: {Primitives.color.base.white}
│   └── dark: {Primitives.color.slate.950}
│
├── card-foreground
│   ├── light: {Primitives.color.slate.950}
│   └── dark: {Primitives.color.slate.50}
│
├── popover
│   ├── light: {Primitives.color.base.white}
│   └── dark: {Primitives.color.slate.950}
│
├── popover-foreground
│   ├── light: {Primitives.color.slate.950}
│   └── dark: {Primitives.color.slate.50}
│
├── primary
│   ├── light: {Primitives.color.slate.900}
│   └── dark: {Primitives.color.slate.50}
│
├── primary-foreground
│   ├── light: {Primitives.color.slate.50}
│   └── dark: {Primitives.color.slate.900}
│
├── secondary
│   ├── light: {Primitives.color.slate.100}
│   └── dark: {Primitives.color.slate.800}
│
├── secondary-foreground
│   ├── light: {Primitives.color.slate.900}
│   └── dark: {Primitives.color.slate.50}
│
├── muted
│   ├── light: {Primitives.color.slate.100}
│   └── dark: {Primitives.color.slate.800}
│
├── muted-foreground
│   ├── light: {Primitives.color.slate.500}
│   └── dark: {Primitives.color.slate.400}
│
├── accent
│   ├── light: {Primitives.color.slate.100}
│   └── dark: {Primitives.color.slate.800}
│
├── accent-foreground
│   ├── light: {Primitives.color.slate.900}
│   └── dark: {Primitives.color.slate.50}
│
├── destructive
│   ├── light: {Primitives.color.red.500}
│   └── dark: {Primitives.color.red.900}
│
├── destructive-foreground
│   ├── light: {Primitives.color.slate.50}
│   └── dark: {Primitives.color.slate.50}
│
├── border
│   ├── light: {Primitives.color.slate.200}
│   └── dark: {Primitives.color.slate.800}
│
├── input
│   ├── light: {Primitives.color.slate.200}
│   └── dark: {Primitives.color.slate.800}
│
├── ring
│   ├── light: {Primitives.color.slate.900}
│   └── dark: {Primitives.color.slate.300}
│
└── radius
    ├── light: {Primitives.radius.md}
    └── dark: {Primitives.radius.md}
```

### 3. Responsive（mobile/tablet/desktopモード）

レスポンシブデザイン用の変数を定義します。主にサイズに関する値を含みます。

```text
Responsive
├── spacing
│   ├── mobile
│   │   ├── 0: {Primitives.size.0}
│   │   ├── 1: {Primitives.size.1}
│   │   ├── 2: {Primitives.size.2}
│   │   ├── 3: {Primitives.size.3}
│   │   ├── 4: {Primitives.size.4}
│   │   └── ... [その他のスペーシング]
│   │
│   ├── tablet
│   │   ├── 0: {Primitives.size.0}
│   │   ├── 1: {Primitives.size.1}
│   │   ├── 2: {Primitives.size.2}
│   │   ├── 3: {Primitives.size.3}
│   │   ├── 4: {Primitives.size.4}
│   │   └── ... [その他のスペーシング]
│   │
│   └── desktop
│       ├── 0: {Primitives.size.0}
│       ├── 1: {Primitives.size.1}
│       ├── 2: {Primitives.size.2}
│       ├── 3: {Primitives.size.3}
│       ├── 4: {Primitives.size.4}
│       └── ... [その他のスペーシング]
│
├── font-size
│   ├── mobile
│   │   ├── xs: {Primitives.font.size.xs}
│   │   ├── sm: {Primitives.font.size.sm}
│   │   ├── base: {Primitives.font.size.base}
│   │   ├── lg: {Primitives.font.size.lg}
│   │   └── ... [その他のフォントサイズ]
│   │
│   ├── tablet
│   │   ├── xs: {Primitives.font.size.xs}
│   │   ├── sm: {Primitives.font.size.sm}
│   │   ├── base: {Primitives.font.size.base}
│   │   ├── lg: {Primitives.font.size.lg}
│   │   └── ... [その他のフォントサイズ]
│   │
│   └── desktop
│       ├── xs: {Primitives.font.size.xs}
│       ├── sm: {Primitives.font.size.sm}
│       ├── base: {Primitives.font.size.base}
│       ├── lg: {Primitives.font.size.lg}
│       └── ... [その他のフォントサイズ]
│
└── breakpoint
    ├── mobile: 640px
    ├── tablet: 768px
    └── desktop: 1024px
```

### 4. Component（light/darkモード）

コンポーネント固有の変数を定義します。Themeコレクションを参照します。

```text
Component
├── button
│   ├── primary
│   │   ├── background
│   │   │   ├── light: {Theme.primary.light}
│   │   │   └── dark: {Theme.primary.dark}
│   │   │
│   │   ├── foreground
│   │   │   ├── light: {Theme.primary-foreground.light}
│   │   │   └── dark: {Theme.primary-foreground.dark}
│   │   │
│   │   ├── border
│   │   │   ├── light: {Theme.primary.light}
│   │   │   └── dark: {Theme.primary.dark}
│   │   │
│   │   └── hover
│   │       ├── light: darken({Theme.primary.light}, 10%)
│   │       └── dark: lighten({Theme.primary.dark}, 10%)
│   │
│   ├── secondary
│   │   ├── background
│   │   │   ├── light: {Theme.secondary.light}
│   │   │   └── dark: {Theme.secondary.dark}
│   │   │
│   │   ├── foreground
│   │   │   ├── light: {Theme.secondary-foreground.light}
│   │   │   └── dark: {Theme.secondary-foreground.dark}
│   │   │
│   │   ├── border
│   │   │   ├── light: {Theme.secondary.light}
│   │   │   └── dark: {Theme.secondary.dark}
│   │   │
│   │   └── hover
│   │       ├── light: darken({Theme.secondary.light}, 10%)
│   │       └── dark: lighten({Theme.secondary.dark}, 10%)
│   │
│   ├── destructive
│   │   ├── background
│   │   │   ├── light: {Theme.destructive.light}
│   │   │   └── dark: {Theme.destructive.dark}
│   │   │
│   │   ├── foreground
│   │   │   ├── light: {Theme.destructive-foreground.light}
│   │   │   └── dark: {Theme.destructive-foreground.dark}
│   │   │
│   │   ├── border
│   │   │   ├── light: {Theme.destructive.light}
│   │   │   └── dark: {Theme.destructive.dark}
│   │   │
│   │   └── hover
│   │       ├── light: darken({Theme.destructive.light}, 10%)
│   │       └── dark: lighten({Theme.destructive.dark}, 10%)
│   │
│   └── outline
│       ├── background
│       │   ├── light: transparent
│       │   └── dark: transparent
│       │
│       ├── foreground
│       │   ├── light: {Theme.foreground.light}
│       │   └── dark: {Theme.foreground.dark}
│       │
│       ├── border
│       │   ├── light: {Theme.border.light}
│       │   └── dark: {Theme.border.dark}
│       │
│       └── hover
│           ├── light: {Theme.muted.light}
│           └── dark: {Theme.muted.dark}
│
├── card
│   ├── background
│   │   ├── light: {Theme.card.light}
│   │   └── dark: {Theme.card.dark}
│   │
│   ├── foreground
│   │   ├── light: {Theme.card-foreground.light}
│   │   └── dark: {Theme.card-foreground.dark}
│   │
│   └── border
│       ├── light: {Theme.border.light}
│       └── dark: {Theme.border.dark}
│
├── input
│   ├── background
│   │   ├── light: {Theme.background.light}
│   │   └── dark: {Theme.background.dark}
│   │
│   ├── foreground
│   │   ├── light: {Theme.foreground.light}
│   │   └── dark: {Theme.foreground.dark}
│   │
│   ├── border
│   │   ├── light: {Theme.input.light}
│   │   └── dark: {Theme.input.dark}
│   │
│   ├── placeholder
│   │   ├── light: {Theme.muted-foreground.light}
│   │   └── dark: {Theme.muted-foreground.dark}
│   │
│   └── focus
│       ├── light: {Theme.ring.light}
│       └── dark: {Theme.ring.dark}
│
└── ... [その他のコンポーネント]
```

### 5. Component-Responsive（mobile/tablet/desktopモード）

レスポンシブ対応のコンポーネント変数を定義します。Responsiveコレクションを参照します。

```text
Component-Responsive
├── button
│   ├── padding-x
│   │   ├── mobile: {Responsive.spacing.mobile.4}
│   │   ├── tablet: {Responsive.spacing.tablet.4}
│   │   └── desktop: {Responsive.spacing.desktop.4}
│   │
│   ├── padding-y
│   │   ├── mobile: {Responsive.spacing.mobile.2}
│   │   ├── tablet: {Responsive.spacing.tablet.2}
│   │   └── desktop: {Responsive.spacing.desktop.2}
│   │
│   └── font-size
│       ├── mobile: {Responsive.font-size.mobile.sm}
│       ├── tablet: {Responsive.font-size.tablet.sm}
│       └── desktop: {Responsive.font-size.desktop.sm}
│
├── card
│   ├── padding
│   │   ├── mobile: {Responsive.spacing.mobile.4}
│   │   ├── tablet: {Responsive.spacing.tablet.6}
│   │   └── desktop: {Responsive.spacing.desktop.6}
│   │
│   └── border-radius
│       ├── mobile: {Primitives.radius.lg}
│       ├── tablet: {Primitives.radius.lg}
│       └── desktop: {Primitives.radius.lg}
│
├── input
│   ├── padding-x
│   │   ├── mobile: {Responsive.spacing.mobile.3}
│   │   ├── tablet: {Responsive.spacing.tablet.3}
│   │   └── desktop: {Responsive.spacing.desktop.3}
│   │
│   ├── padding-y
│   │   ├── mobile: {Responsive.spacing.mobile.2}
│   │   ├── tablet: {Responsive.spacing.tablet.2}
│   │   └── desktop: {Responsive.spacing.desktop.2}
│   │
│   └── font-size
│       ├── mobile: {Responsive.font-size.mobile.sm}
│       ├── tablet: {Responsive.font-size.tablet.sm}
│       └── desktop: {Responsive.font-size.desktop.sm}
│
└── ... [その他のコンポーネント]
```

## 実装のポイント

### 1. 命名規則

- **background/foreground**: Shadcn UIの命名規則に従い、背景色と前景色（テキスト色）のペアで定義
- **階層構造**: プリミティブ → テーマ → コンポーネントの参照関係を明確にする
- **一貫性**: すべてのコンポーネントで同じ命名パターンを使用

### 2. モード対応

- **light/dark**: テーマとコンポーネントのコレクションでモード対応
- **mobile/tablet/desktop**: レスポンシブ関連のコレクションでデバイスサイズ対応

### 3. 参照関係

- **Primitives**: 他の変数を参照しない基本値
- **Theme**: Primitivesを参照するセマンティックな値
- **Responsive**: Primitivesを参照するレスポンシブ対応の値
- **Component**: Themeを参照するコンポーネント固有の値
- **Component-Responsive**: Responsiveを参照するレスポンシブ対応のコンポーネント値

### 4. 拡張性

- 新しいコンポーネントを追加する場合は、既存の命名パターンに従って定義
- カスタムテーマカラーを追加する場合は、Primitivesに追加してからThemeで参照

## Tailwind CSSとの統合

このFigmaバリアブル設計は、tailwind.config.jsで以下のように統合できます：

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      spacing: {
        0: 'var(--spacing-0)',
        1: 'var(--spacing-1)',
        2: 'var(--spacing-2)',
        3: 'var(--spacing-3)',
        4: 'var(--spacing-4)',
        // ... その他のスペーシング
      },
      fontSize: {
        xs: 'var(--font-size-xs)',
        sm: 'var(--font-size-sm)',
        base: 'var(--font-size-base)',
        lg: 'var(--font-size-lg)',
        xl: 'var(--font-size-xl)',
        // ... その他のフォントサイズ
      },
      fontFamily: {
        sans: 'var(--font-family-sans)',
        serif: 'var(--font-family-serif)',
        mono: 'var(--font-family-mono)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        none: 'var(--shadow-none)',
      },
    },
  },
};
```

## 最後に

この設計は、Shadcn UIとTailwind CSSの原則に従いながら、Figmaの変数機能を最大限に活用するためのものです。実際のプロジェクトに合わせて調整し、必要に応じて拡張してください。
