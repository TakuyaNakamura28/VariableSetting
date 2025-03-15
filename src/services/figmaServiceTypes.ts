/**
 * FigmaVariableServiceで使用する型定義
 */

/**
 * 変数コレクションのモード（Light/Dark）
 */
export enum VariableMode {
  Light = 'Light',
  Dark = 'Dark'
}

/**
 * コレクションの種類
 */
export enum CollectionType {
  Primitives = 'Primitives',
  Semantic = 'Semantic',
  Components = 'Components'
}

/**
 * 変数のタイプ
 */
export enum VariableType {
  Primitive = 'primitives',
  Semantic = 'semantic',
  Component = 'components'
}

/**
 * コレクション管理インターフェース
 */
export interface ICollectionManager {
  initializeCollections(): Promise<boolean>;
  findVariableByName(name: string, collectionType: CollectionType): Variable | null;
  getLightModeId(collectionType: CollectionType): string | null;
  getDarkModeId(collectionType: CollectionType): string | null;
  getCollection(collectionType: CollectionType): VariableCollection | null;
  getCollectionNameForVariable(variable: Variable): string | null;
  addToCache(variable: Variable): void;
  setVariablePathName(variable: Variable, path: string): void;
  clearAllVariables(): void;
}

/**
 * 色彩変換ユーティリティインターフェース
 */
export interface IColorUtility {
  hexToFigmaColor(hex: string): RGBA;
  figmaColorToHex(color: RGBA): string;
  parseColor(colorStr: string): string; // 色文字列を標準フォーマットに変換
  warn(message: string): void; // 警告ログを出力
}

/**
 * シャドウ変換ユーティリティインターフェース
 */
export interface IShadowUtility {
  parseShadowValue(shadowStr: string): EffectValue;
}

/**
 * 数値変換ユーティリティインターフェース
 */
export interface INumberUtility {
  parseNumberValue(value: string): number;
}

/**
 * 変数作成インターフェース
 */
export interface IVariableCreator {
  createVariable(name: string, lightValue: string, darkValue: string, group?: string): Variable | null;
  createVariables(names: string[], lightValues: string[], darkValues: string[], group?: string): Record<string, Variable | null>;
  createColorPalette(baseColor: string, group?: string): Record<string, Variable | null>;
  createNumberTokens(tokens: Record<string, number>, group?: string): Record<string, Variable | null>;
  createShadowTokens(tokens: Record<string, EffectValue[]>, group?: string): Record<string, Variable | null>;
}

/**
 * 変数管理サービスインターフェース
 */
export interface IVariableManagementService {
  initializeCollections(): Promise<boolean>;
  clearAllVariables(): void;
  createColorVariable(name: string, lightValue: string, darkValue: string, collectionType: CollectionType, group?: string): Variable | null;
  createSemanticColors(colors: Record<string, string>, _baseOnLight?: boolean): Record<string, Variable | null>;
  createComponentColors(colors: Record<string, string>): Record<string, Variable | null>;
}

/**
 * ロギングサービスインターフェース
 */
export interface ILoggerService {
  log(message: string): void;
  error(message: string, error?: unknown): void;
  warn(message: string): void;
  notify(message: string, options?: { error?: boolean }): void;
}

/**
 * 変数サービス基本インターフェース
 * 変数の作成、更新、参照管理等の基本機能を担当
 */
export interface IVariableService extends IColorUtility {
  createVariable(name: string, lightValue: string, darkValue: string, collectionType: CollectionType, group?: string): Variable | null;
  setVariablePathName(variable: Variable, path: string): void;
  setVariableReference(variable: Variable, refVariable: Variable, modeId: string): void;
  isCircularReference(sourceName: string, targetName: string, collectionType: CollectionType): boolean;
}

/**
 * プリミティブ変数サービスインターフェース
 */
export interface IPrimitiveVariableService extends IVariableService, INumberUtility, IShadowUtility {
  createColorVariable(name: string, lightValue: string, darkValue: string, collectionType: CollectionType, group?: string): Variable | null;
  createPrimitiveColorPalette(name: string, palette: Record<string, string>): Record<string, Variable>;
  createPrimitiveNumberTokens(tokenType: string, tokens: Record<string, string>): Record<string, Variable>;
  createShadowVariables(lightShadows: Record<string, string>, darkShadows: Record<string, string>): Record<string, Variable>;
}

/**
 * セマンティック変数サービスインターフェース
 */
export interface ISemanticVariableService {
  createSemanticVariable(name: string, lightRefName: string, darkRefName: string, variableType: string): Variable | null;
  createSemanticColors(lightColors: Record<string, Record<string, string>>, darkColors: Record<string, Record<string, string>>): Record<string, Variable>;
}

/**
 * コンポーネント変数サービスインターフェース
 */
export interface IComponentVariableService {
  createComponentVariable(name: string, semanticRefName: string, componentType: string): Variable | null;
  createComponentColors(colors: Record<string, string>): Record<string, Variable>;
}
