/**
 * VariableCollectionの管理に関するインターフェース
 * コレクションの作成、取得、モード管理の責務を持つ
 */
export interface ICollectionManager {
  /**
   * コレクションの初期化
   * @returns 成功したかどうか
   */
  initializeCollections(): Promise<boolean>;

  /**
   * コレクションの取得
   * @param type コレクションタイプ
   * @returns 対応するコレクション、存在しない場合はnull
   */
  getCollection(type: CollectionType): VariableCollection | null;

  /**
   * 指定されたコレクションタイプとモードのIDを取得
   * @param type コレクションタイプ
   * @param isLight ライトモードの場合true、ダークモードの場合false
   * @returns モードID、存在しない場合はnull
   */
  getModeId(type: CollectionType, isLight: boolean): string | null;

  /**
   * コレクションを作成する
   * @param name コレクション名
   * @param type コレクションタイプ
   * @returns 作成されたコレクション
   */
  createCollection(name: string, type: CollectionType): VariableCollection | null;

  /**
   * コレクションが存在するかどうかを確認
   * @param type コレクションタイプ
   * @returns 存在する場合true
   */
  hasCollection(type: CollectionType): boolean;
}

/**
 * コレクションタイプの列挙型
 */
export enum CollectionType {
  Primitive = "primitive",
  Semantic = "semantic",
  Component = "component"
}
