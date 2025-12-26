# 吉方位神社仏閣プランナー (Kippo - きっぽ)

生年月日と住所から、吉方位にある神社・仏閣を案内するWebアプリケーションのプロトタイプです。

## 📋 プロジェクト構成

```
kippo/
├── backend/          # Express.js + Prisma + TypeScript
├── frontend/         # React + Vite + Tailwind CSS + shadcn/ui
├── docs/             # 要件定義書など
├── package.json      # モノレポのルート設定
└── README.md         # このファイル
```

## 🚀 セットアップ手順

### 前提条件

- Node.js 18.x 以上
- npm 9.x 以上

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

バックエンドに `.env` ファイルを作成します：

```powershell
# backend/.env を作成
cd backend
```

`backend/.env` ファイルに以下を記述：

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

#### 方法1: 個別に起動

ターミナルを2つ開いて、それぞれで実行：

```powershell
# ターミナル1: バックエンド
cd backend
npm run dev

# ターミナル2: フロントエンド
cd frontend
npm run dev
```

#### 方法2: 同時起動（推奨）

ルートディレクトリで：

```powershell
npm run dev
```

### 5. 動作確認

ブラウザで以下のURLにアクセス：

- **フロントエンド**: http://localhost:5173
- **バックエンドAPI（Health Check）**: http://localhost:3000/health
- **バックエンドAPI（Hello World）**: http://localhost:3000/api/hello
- **バックエンドAPI（DB接続確認）**: http://localhost:3000/api/db-check

正常に起動していれば、フロントエンドの画面にHello Worldメッセージが表示されます。

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

現在のスキーマは以下の2つのテーブルで構成されています：

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
- direction8: 8方位
- distanceKm: 距離
- createdAt: 作成日時

## 🛠️ 技術スタック

### バックエンド

- **Node.js** + **Express.js**: REST APIサーバー
- **TypeScript**: 型安全な開発
- **Prisma**: ORMとデータベースマイグレーション
- **PostgreSQL**: データベース（Railway上で運用）

### フロントエンド

- **React 18**: UIライブラリ
- **TypeScript**: 型安全な開発
- **Vite**: 高速ビルドツール
- **Tailwind CSS**: ユーティリティファーストCSS
- **shadcn/ui**: Radix UIベースのコンポーネントライブラリ

## 📝 API エンドポイント（現在実装済み）

- `GET /health` - ヘルスチェック
- `GET /api/hello` - Hello World（動作確認用）
- `GET /api/db-check` - データベース接続確認

## 🔮 今後の実装予定（要件定義書より）

### バックエンドAPI

- `POST /api/fortune/base-info` - 本命星算出
- `POST /api/fortune/lucky-directions` - 吉方位取得
- `POST /api/places/shrines` - 周辺の神社・寺院検索
- `POST /api/fortune/recommendations` - 統合検索（本命星+吉方位+神社検索）

### フロントエンド

- 入力フォーム画面（生年月日・住所・対象年月）
- 結果表示画面（本命星・吉方位・候補リスト・地図）
- Google Maps統合
- shadcn/uiコンポーネントの活用

## ⚠️ 注意事項

- **プロトタイプ版**: 本番環境での使用は想定していません
- **立春補正未対応**: 本命星の算出は簡易版です
- **吉方位ロジック**: デモ用の簡易ルールを使用
- **Google Maps API**: 実際の使用には有効なAPIキーが必要です

## 📚 参考ドキュメント

- [要件定義書](./docs/kippo_requirements.md)
- [Express.js公式](https://expressjs.com/)
- [Prisma公式](https://www.prisma.io/)
- [React公式](https://react.dev/)
- [Vite公式](https://vitejs.dev/)
- [Tailwind CSS公式](https://tailwindcss.com/)
- [shadcn/ui公式](https://ui.shadcn.com/)

## 📄 ライセンス

このプロジェクトはプロトタイプです。

---

開発合宿頑張ってください！ 🚀

