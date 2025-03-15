/**
 * FigmaVariableServiceのアダプターインターフェース
 * 静的メソッドを持つFigmaVariableServiceをインスタンスメソッドとして利用できるようにするためのアダプター
 */
import { FigmaVariableService } from './FigmaVariableServiceCompat';
import { CollectionType } from './figmaServiceTypes';

// 型定義がない場合のモックインターフェース
interface Variable {
  id: string;
  name: string;
}

/**
 * FigmaVariableServiceAdapterインターフェース
 * DesignSystemServiceから利用される統一インターフェースを定義
 */
export interface FigmaVariableAdapter {
  createCollection(name: string): string;
  createColorVariable(collectionId: string, name: string, value: string): Variable | null;
  createNumberVariable(collectionId: string, name: string, value: number): Variable | null;
  clearAllVariables(): void;
}

/**
 * FigmaVariableServiceの静的メソッドをインスタンスメソッドとして提供するアダプタークラス
 * このクラスは、リファクタリング中の移行をスムーズにするためのレイヤーとして機能
 * テスト時にはモック実装で置き換え可能
 */
export class FigmaVariableServiceAdapter implements FigmaVariableAdapter {
  // コレクションIDとコレクションタイプのマッピング
  private collectionMap: Map<string, CollectionType> = new Map();
  
  /**
   * 変数コレクションを作成
   * @param name コレクション名
   * @returns コレクションのID
   */
  createCollection(_name: string): string {
    // このメソッドは実際のAPIと違いがあるため、アダプターで橋渡し
    // 一意のIDを生成し、コレクションタイプと関連付け
    const collectionId = `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // デフォルトでPrimitivesタイプを使用
    this.collectionMap.set(collectionId, CollectionType.Primitives);
    
    return collectionId;
  }
  
  /**
   * カラー変数を作成
   * @param collectionId コレクションID
   * @param name 変数名
   * @param value カラー値（HEX）
   * @returns 作成された変数またはnull
   */
  createColorVariable(collectionId: string, name: string, value: string): Variable | null {
    // コレクションタイプを取得、なければデフォルトでPrimitivesを使用
    const collectionType = this.collectionMap.get(collectionId) || CollectionType.Primitives;
    
    // 静的メソッドを呼び出し
    // ライトモードとダークモードの両方に同じ値を設定（仮実装）
    return FigmaVariableService.createColorVariable(
      name,        // 変数名
      value,       // ライトモード値
      value,       // ダークモード値（同じ値を使用）
      collectionType
    );
  }
  
  /**
   * 数値変数を作成
   * @param collectionId コレクションID
   * @param name 変数名
   * @param value 数値
   * @returns 作成された変数またはnull
   */
  createNumberVariable(collectionId: string, name: string, value: number): Variable | null {
    // コレクションタイプにかかわらず数値トークンを作成
    // この実装は簡略化されており、実際のAPIとは異なる可能性がある
    const tokens = { [name]: value };
    const result = FigmaVariableService.createPrimitiveNumberTokens('number', tokens);
    return result[name] || null;
  }
  
  /**
   * すべての変数をクリア
   */
  clearAllVariables(): void {
    FigmaVariableService.clearAllVariables();
    this.collectionMap.clear();
  }
}
