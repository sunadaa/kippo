# 吉方位神社仏閣プランナー (Kippo - きっぽ)

生年月日と住所から、吉方位にある神社・仏閣を案内する Web アプリケーションのプロトタイプです。

## 📋 プロジェクト構成

```
kippo/
├── backend/          # Express.js + Prisma + TypeScript
├── frontend/         # React + Vite + Tailwind CSS + shadcn/ui
├── docs/             # 要件定義書など
├── package.json      # モノレポのルート設定
└── README.md         # このファイル
```

## ✨ Phase 2 実装完了

Phase 2 の開発が完了しました！以下の新機能が追加されています：

- ✅ **Google Maps 統合**: 候補神社・寺院を地図上にマーカー表示
- ✅ **検索履歴機能**: 検索を自動保存、履歴から再検索可能
- ✅ **お気に入り機能**: 候補をお気に入りに登録・管理
- ✅ **UI/UX 改善**: レスポンシブ対応、ローディング表示、エラーハンドリング、ソート機能
- ✅ **ページルーティング**: React Router による `/`, `/history`, `/favorites` のナビゲーション

詳細は [PHASE2_SETUP.md](./PHASE2_SETUP.md) と [docs/PHASE2_IMPLEMENTATION.md](./docs/PHASE2_IMPLEMENTATION.md) をご覧ください。

## 🚀 セットアップ手順

### 前提条件

- Node.js 18.x 以上
- npm 9.x 以上
- PostgreSQL データベース（Railway など）
- Google Maps API キー（地図表示用）

### 1. 依存関係のインストール

```powershell
# ルートディレクトリで実行（モノレポ全体の依存関係をインストール）
npm install

# バックエンドの依存関係をインストール
cd backend
npm install

# フロントエンドの依存関係をインストール
cd ../frontend
npm install

# ルートに戻る
cd ..
```

### 2. 環境変数の設定

#### バックエンド

`backend/.env` ファイルを作成：

```env
# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Database (Railway PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Server
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

#### フロントエンド（Phase 2）

`frontend/.env.local` ファイルを作成：

```env
# Google Maps API Key（地図表示に必要）
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Backend API URL（本番環境用、ローカル開発時は不要）
# VITE_API_URL=https://your-backend-api-url.com/api
```

**注意**: API キーがないと地図は表示されませんが、他の機能は動作します。

### 3. データベースのセットアップ

```powershell
# backend ディレクトリで実行
cd backend

# Prisma Client の生成
npm run prisma:generate

# マイグレーションの実行（データベースの作成）
npm run prisma:migrate
```

マイグレーション名を聞かれたら、例えば `init` と入力してください。

### 4. 開発サーバーの起動

#### 方法 1: 個別に起動

ターミナルを 2 つ開いて、それぞれで実行：

```powershell
# ターミナル1: バックエンド
cd backend
npm run dev

# ターミナル2: フロントエンド
cd frontend
npm run dev
```

#### 方法 2: 同時起動（推奨）

ルートディレクトリで：

```powershell
npm run dev
```

### 5. 動作確認

ブラウザで以下の URL にアクセス：

- **フロントエンド**: http://localhost:5173
- **バックエンド API（Health Check）**: http://localhost:3000/health
- **バックエンド API（Hello World）**: http://localhost:3000/api/hello
- **バックエンド API（DB 接続確認）**: http://localhost:3000/api/db-check

正常に起動していれば、フロントエンドの画面に Hello World メッセージが表示されます。

## 📦 利用可能なコマンド

### ルートディレクトリ

```powershell
npm run dev              # フロントエンドとバックエンドを同時起動
npm run dev:frontend     # フロントエンドのみ起動
npm run dev:backend      # バックエンドのみ起動
npm run build            # フロントエンドとバックエンドをビルド
npm run build:frontend   # フロントエンドのみビルド
npm run build:backend    # バックエンドのみビルド
```

### バックエンド (`backend/`)

```powershell
npm run dev              # 開発サーバー起動（ホットリロード）
npm run build            # TypeScriptをビルド
npm start                # 本番用サーバー起動
npm run prisma:generate  # Prisma Clientを生成
npm run prisma:migrate   # マイグレーションを実行
npm run prisma:studio    # Prisma Studioを起動（DB管理GUI）
```

### フロントエンド (`frontend/`)

```powershell
npm run dev              # 開発サーバー起動
npm run build            # 本番用ビルド
npm run preview          # ビルド後のプレビュー
npm run lint             # ESLintでコードチェック
```

## 🗄️ データベーススキーマ

現在のスキーマは以下の 2 つのテーブルで構成されています：

### SearchHistory（検索履歴）

ユーザーの検索履歴を保存します。

- id: 主キー
- birthDate: 生年月日
- address: 住所
- yearMonth: 対象年月
- radiusKm: 検索半径
- honmeisei: 算出された本命星
- createdAt: 作成日時

### Favorite（お気に入り）

検索結果からお気に入り登録された神社・寺院を保存します。

- id: 主キー
- searchHistoryId: 検索履歴への外部キー
- name: 神社・寺院名
- address: 住所
- lat: 緯度
- lng: 経度
- direction8: 8 方位
- distanceKm: 距離
- createdAt: 作成日時

## 🛠️ 技術スタック

### バックエンド

- **Node.js** + **Express.js**: REST API サーバー
- **TypeScript**: 型安全な開発
- **Prisma**: ORM とデータベースマイグレーション
- **PostgreSQL**: データベース（Railway 上で運用）

### フロントエンド

- **React 18**: UI ライブラリ
- **TypeScript**: 型安全な開発
- **Vite**: 高速ビルドツール
- **Tailwind CSS**: ユーティリティファースト CSS
- **shadcn/ui**: Radix UI ベースのコンポーネントライブラリ
- **@vis.gl/react-google-maps**: Google Maps 統合（Phase 2）
- **React Router**: ページルーティング（Phase 2）
- **Lucide React**: アイコンライブラリ

## 📝 API エンドポイント

### システム

- `GET /health` - ヘルスチェック
- `GET /api/hello` - Hello World（動作確認用）
- `GET /api/db-check` - データベース接続確認

### 吉方位検索（Phase 1）

- `POST /api/fortune/base-info` - 本命星算出
- `POST /api/fortune/lucky-directions` - 吉方位取得
- `POST /api/fortune/recommendations` - 統合検索（本命星+吉方位+神社検索）

### 検索履歴（Phase 2）

- `POST /api/history` - 検索履歴を保存
- `GET /api/history` - 検索履歴一覧を取得
- `DELETE /api/history/:id` - 検索履歴を削除

### お気に入り（Phase 2）

- `POST /api/favorites` - お気に入りを追加
- `GET /api/favorites` - お気に入り一覧を取得
- `DELETE /api/favorites/:id` - お気に入りを削除
- `GET /api/favorites/check` - お気に入り登録状態を確認

## 🎯 実装済み機能

### Phase 1（MVP）

- ✅ 本命星算出（生年月日から九星を計算）
- ✅ 吉方位判定（簡易版ルール）
- ✅ 神社・寺院検索（Google Places API）
- ✅ 距離・方位計算（8 方位分類）
- ✅ 検索結果表示（テーブル形式）

### Phase 2（拡張機能）

- ✅ Google Maps 統合（マーカー表示、InfoWindow）
- ✅ 検索履歴機能（自動保存、再検索、削除）
- ✅ お気に入り機能（登録、一覧、削除）
- ✅ テーブルソート機能（名称、距離、方位）
- ✅ レスポンシブデザイン（モバイル/タブレット/PC 対応）
- ✅ ローディング表示（スピナー、メッセージ）
- ✅ エラーハンドリング（種類別メッセージ）
- ✅ ページルーティング（検索/履歴/お気に入り）

## 🔮 今後の実装予定（Phase 3）

- 立春補正の実装
- 年間の吉方位カレンダー
- 月命星・日盤の対応
- 複数流派の対応
- 検索結果のエクスポート機能
- ユーザー認証機能
- ソーシャル機能（共有機能）

## ⚠️ 注意事項

- **プロトタイプ版**: 本番環境での使用は想定していません
- **立春補正未対応**: 本命星の算出は簡易版です（Phase 3 で実装予定）
- **吉方位ロジック**: デモ用の簡易ルールを使用
- **Google Maps API**: 地図表示には有効な API キーが必要です
- **認証機能なし**: 検索履歴とお気に入りはローカルのデータベースに保存されます（Phase 3 でユーザー認証実装予定）

## 📚 ドキュメント

### プロジェクトドキュメント

- [Phase 1 要件定義書](./docs/kippo_requirements.md)
- [Phase 2 要件定義書](./docs/kippo_requirements_phase2.md)
- [Phase 2 実装詳細](./docs/PHASE2_IMPLEMENTATION.md)
- [Phase 2 セットアップガイド](./PHASE2_SETUP.md)

### 技術ドキュメント

- [Express.js 公式](https://expressjs.com/)
- [Prisma 公式](https://www.prisma.io/)
- [React 公式](https://react.dev/)
- [Vite 公式](https://vitejs.dev/)
- [Tailwind CSS 公式](https://tailwindcss.com/)
- [shadcn/ui 公式](https://ui.shadcn.com/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [React Router 公式](https://reactrouter.com/)

## 📄 ライセンス

このプロジェクトはプロトタイプです。

---

開発合宿頑張ってください！ 🚀
