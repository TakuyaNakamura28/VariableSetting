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
  clearAllVariables(): void;
}

/**
 * 変数サービスインターフェース
 * 変数の作成、更新、参照管理等を担当
 */
export interface IVariableService {
  createVariable(name: string, lightValue: string, darkValue: string, collectionType: CollectionType, group?: string): Variable | null;
  setVariablePathName(variable: Variable, path: string): void;
  setVariableReference(variable: Variable, refVariable: Variable, modeId: string): void;
  isCircularReference(sourceName: string, targetName: string, collectionType: CollectionType): boolean;
  hexToFigmaColor(hex: string): RGBA;
  figmaColorToHex(color: RGBA): string;
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
  createColorVariable(name: string, lightValue: string, darkValue: string, collectionType: CollectionType, group?: string): Variable | null;
  createSemanticColors(colors: Record<string, string>, _baseOnLight?: boolean): Record<string, Variable | null>;
  createComponentColors(colors: Record<string, string>): Record<string, Variable | null>;
}
