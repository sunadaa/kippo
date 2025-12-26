# Kippo Backend API

吉方位神社仏閣プランナーのバックエンドAPIサーバーです。

## 技術スタック

- Node.js + Express.js
- TypeScript
- Prisma ORM
- PostgreSQL (Railway)

## セットアップ

```powershell
# 依存関係のインストール
npm install

# Prisma Clientの生成
npm run prisma:generate

# データベースのマイグレーション
npm run prisma:migrate

# 開発サーバーの起動
npm run dev
```

## 利用可能なエンドポイント

### 現在実装済み

- `GET /health` - ヘルスチェック
- `GET /api/hello` - Hello World
- `GET /api/db-check` - データベース接続確認

### 今後実装予定

- `POST /api/fortune/base-info` - 本命星算出
- `POST /api/fortune/lucky-directions` - 吉方位取得
- `POST /api/places/shrines` - 周辺の神社・寺院検索
- `POST /api/fortune/recommendations` - 統合検索

## 環境変数

`.env` ファイルに以下を設定してください：

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## データベース管理

```powershell
# Prisma Studioを起動（GUI管理ツール）
npm run prisma:studio
```

ブラウザで http://localhost:5555 が開きます。

