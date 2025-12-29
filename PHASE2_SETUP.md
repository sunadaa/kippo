# Phase 2 セットアップガイド

## 実装完了した機能

✅ 検索履歴・お気に入り機能（データベース連携）
✅ Google Maps 統合（マーカー表示、InfoWindow）
✅ UI/UX 改善（レスポンシブ、ローディング、エラーハンドリング、ソート機能）
✅ React Router によるページルーティング
✅ ナビゲーションバー

## セットアップ手順

### 1. 依存関係のインストール

```bash
# ルートディレクトリで
npm install
```

これで `frontend` と `backend` の両方の依存関係がインストールされます。

### 2. Google Maps API キーの設定

フロントエンドで Google Maps を表示するために API キーが必要です。

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. Maps JavaScript API を有効化
3. API キーを作成
4. フロントエンドの環境変数に設定：

```bash
cd frontend
cp .env.local.example .env.local
# .env.local ファイルを編集して以下を設定
# VITE_GOOGLE_MAPS_API_KEY=あなたのAPIキー
```

**注意**: API キーなしでも動作しますが、地図は表示されません。

### 3. データベースのマイグレーション

検索履歴とお気に入りのテーブルは既に Phase 1 で作成されているはずです。
念のため確認：

```bash
cd backend
npx prisma migrate status
```

もし未適用のマイグレーションがあれば：

```bash
npx prisma migrate dev
```

### 4. 開発サーバーの起動

```bash
# ルートディレクトリで両方同時に起動
npm run dev
```

これで以下が起動します：
- バックエンド: http://localhost:3000
- フロントエンド: http://localhost:5173

## 新機能の使い方

### 検索機能（既存 + 拡張）

1. トップページ（`/`）で生年月日、住所、対象年月、検索半径を入力
2. 「吉方位を検索」ボタンをクリック
3. **自動的に検索履歴が保存されます**（新機能）
4. 検索結果に以下が表示：
   - 本命星と吉方位
   - **Google Maps での候補表示**（新機能）
   - 候補神社・寺院のテーブル（**ソート機能付き**）
   - **お気に入りボタン**（ハートアイコン）

### 地図機能（新機能）

- 黒いマーカー = 現在地（入力住所）
- カラフルなマーカー = 候補神社・寺院
  - 北（N）= 青
  - 北東（NE）= 紫
  - 東（E）= 緑
  - 南東（SE）= 黄
  - 南（S）= 赤
  - 南西（SW）= オレンジ
  - 西（W）= シアン
  - 北西（NW）= バイオレット
- マーカーをクリック → 詳細情報を表示
- テーブルの行にホバー → 対応マーカーが拡大

### 検索履歴（新機能）

1. ナビゲーションバーの「履歴」をクリック（または `/history` へアクセス）
2. 最近の検索履歴を最大 20 件表示
3. 各履歴項目で以下が可能：
   - **再検索**: 同じ条件で再度検索（フォームに値を復元）
   - **削除**: 履歴を削除（関連するお気に入りも削除）

### お気に入り（新機能）

1. 検索結果のテーブルでハートアイコンをクリックしてお気に入りに追加
2. ナビゲーションバーの「お気に入り」をクリック（または `/favorites` へアクセス）
3. 各お気に入り項目で以下が可能：
   - **地図で表示**: Google Maps で開く
   - **削除**: お気に入りから削除

### ソート機能（新機能）

テーブルの列ヘッダーをクリックでソート：
- **名称**: 五十音順（昇順/降順）
- **方位**: N → NE → E → SE → S → SW → W → NW 順
- **距離**: 近い順/遠い順

## API エンドポイント

### 既存
- `POST /api/fortune/recommendations` - 統合検索

### 新規（Phase 2）
- `POST /api/history` - 検索履歴を保存
- `GET /api/history` - 検索履歴一覧を取得
- `DELETE /api/history/:id` - 検索履歴を削除
- `POST /api/favorites` - お気に入りを追加
- `GET /api/favorites` - お気に入り一覧を取得
- `DELETE /api/favorites/:id` - お気に入りを削除
- `GET /api/favorites/check` - お気に入り登録状態を確認

## トラブルシューティング

### 地図が表示されない

**原因**: Google Maps API キーが未設定または無効
**解決策**:
1. `frontend/.env.local` ファイルを確認
2. `VITE_GOOGLE_MAPS_API_KEY=あなたのAPIキー` が正しく設定されているか確認
3. API キーが Maps JavaScript API で有効化されているか確認
4. 開発サーバーを再起動（環境変数の変更後は必須）

### CORS エラー

**原因**: フロントエンドとバックエンドのオリジンが許可されていない
**解決策**: `backend/src/index.ts` の CORS 設定を確認。ローカル開発では `http://localhost:5173` が許可されているはず。

### データベース接続エラー

**原因**: `DATABASE_URL` 環境変数が未設定または無効
**解決策**:
1. `backend/.env` ファイルを確認
2. PostgreSQL が起動しているか確認
3. `DATABASE_URL` の接続文字列が正しいか確認

### 検索履歴・お気に入りが表示されない

**原因**: データベースマイグレーションが未実行
**解決策**:
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

## ディレクトリ構造（Phase 2 で追加されたファイル）

```
kippo/
├── backend/
│   └── src/
│       └── routes/
│           ├── history.ts          # 検索履歴API（新規）
│           └── favorites.ts        # お気に入りAPI（新規）
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── MapDisplay.tsx      # Google Maps（新規）
│       │   ├── SearchHistory.tsx   # 検索履歴（新規）
│       │   ├── Favorites.tsx       # お気に入り（新規）
│       │   ├── Navigation.tsx      # ナビゲーション（新規）
│       │   ├── ErrorAlert.tsx      # エラー表示（新規）
│       │   └── ui/
│       │       ├── alert.tsx       # アラートUI（新規）
│       │       └── spinner.tsx     # スピナーUI（新規）
│       └── pages/
│           ├── SearchPage.tsx      # 検索ページ（新規）
│           ├── HistoryPage.tsx     # 履歴ページ（新規）
│           └── FavoritesPage.tsx   # お気に入りページ（新規）
└── docs/
    └── PHASE2_IMPLEMENTATION.md    # Phase 2 実装詳細（新規）
```

## 次のステップ（Phase 3 予定）

- 立春補正の実装
- 年間の吉方位カレンダー
- 月命星・日盤の対応
- ユーザー認証機能
- 検索結果のエクスポート機能
- ソーシャル機能（共有機能）

---

Phase 2 の実装は完了しました！
質問や問題があれば、お気軽にお知らせください。

