# Kippo Frontend

吉方位神社仏閣プランナーのフロントエンドアプリケーションです。

## 技術スタック

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

## セットアップ

```powershell
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで http://localhost:5173 にアクセスしてください。

## 利用可能なコマンド

```powershell
npm run dev       # 開発サーバー起動
npm run build     # 本番用ビルド
npm run preview   # ビルド後のプレビュー
npm run lint      # ESLintでコードチェック
```

## プロキシ設定

開発時は Vite のプロキシ機能により、`/api` へのリクエストは自動的に `http://localhost:3000` にプロキシされます。

## shadcn/ui コンポーネントの追加

shadcn/uiのコンポーネントを追加する場合：

```powershell
# 例: Buttonコンポーネントを追加
npx shadcn-ui@latest add button
```

詳細は [shadcn/ui公式ドキュメント](https://ui.shadcn.com/) を参照してください。

