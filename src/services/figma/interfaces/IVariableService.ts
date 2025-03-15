/**
 * Figma変数サービスのインターフェース
 * 変数の作成、変更、取得などの操作を定義
 */
import { Variable, CollectionType, ColorPalette } from '../types/VariableTypes';

/**
 * 変数サービスのインターフェース
 * 依存性逆転の原則に基づき、具象クラスへの依存を避ける
 */
export interface IVariableService {
  /**
   * 変数コレクションの初期化
   * @returns 成功したかどうか
   */
  initializeCollections(): Promise<boolean>;

  /**
   * カラー変数を作成
   * @param name 変数名
   * @param lightValue ライトモード値
   * @param darkValue ダークモード値
   * @param collectionType コレクションタイプ
   * @param group グループ（オプション）
   * @returns 作成された変数、失敗した場合はnull
   */
  createColorVariable(
    name: string,
    lightValue: string,
    darkValue: string,
    collectionType: CollectionType,
    group?: string
  ): Variable | null;

  /**
   * 数値変数を作成
   * @param name 変数名
   * @param lightValue ライトモード値
   * @param darkValue ダークモード値
   * @param collectionType コレクションタイプ
   * @param group グループ（オプション）
   * @returns 作成された変数、失敗した場合はnull
   */
  createNumberVariable(
    name: string,
    lightValue: number,
    darkValue: number,
    collectionType: CollectionType,
    group?: string
  ): Variable | null;

  /**
   * 変数への参照を作成
   * @param name 変数名
   * @param sourceVariable 参照元変数
   * @param collectionType コレクションタイプ
   * @param group グループ（オプション）
   * @returns 作成された変数、失敗した場合はnull
   */
  createVariableReference(
    name: string,
    sourceVariable: Variable,
    collectionType: CollectionType,
    group?: string
  ): Variable | null;

  /**
   * 変数名で変数を検索
   * @param name 変数名
   * @param collectionType コレクションタイプ
   * @returns 見つかった変数、見つからない場合はnull
   */
  findVariableByName(name: string, collectionType: CollectionType): Variable | null;

  /**
   * プリミティブカラーパレットを作成
   * @param name ベース名
   * @param palette カラーパレット情報
   * @returns 作成された変数のマップ
   */
  createPrimitiveColorPalette(name: string, palette: ColorPalette): Record<string, Variable>;

  /**
   * セマンティックカラー変数を作成
   * @param name 変数名
   * @param lightVariable ライトモードで参照する変数
   * @param darkVariable ダークモードで参照する変数
   * @param group グループ（オプション）
   * @returns 作成された変数、失敗した場合はnull
   */
  createSemanticColorVariable(
    name: string,
    lightVariable: Variable,
    darkVariable: Variable,
    group?: string
  ): Variable | null;
}
