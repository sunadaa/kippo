# 吉方位神社仏閣プランナー プロトタイプ要件（1 日開発・MVP）

## 1. ゴールと制約

- **目的**  
  8 時間の開発合宿で「動くもの」を最優先とした最小限プロトタイプを作る。

  - 入力：生年月日・現住所（テキスト）
  - 出力：
    - 本命星（九星）の表示
    - 指定年月の「自宅から見た吉方位」にある神社／寺院候補リスト
    - 簡易な地図表示（Google Maps）

- **割り切り**
  - 本命星のみ（年盤ベース）。月命星・日盤・複数流派は対象外。
  - 本命星の算出は、一般的な簡易計算法（立春補正なし）のプロトタイプ実装。[web:14][web:15]
  - 吉方位ロジックは「デモ用の簡易版ルール」を固定実装。
  - 「向こう一年すべて」ではなく、「ユーザーが選択した 1 つの月」を対象。
  - UI は最低限。「検索できる」「地図に出る」を優先。

---

## 2. 機能要件

### 2.1 画面

1. **トップ／入力画面**

   - 生年月日（YYYY-MM-DD）
   - 住所（1 行テキスト）
   - 対象年月（例：2025-02 のプルダウン）
   - 「吉方位を検索」ボタン

2. **結果画面**
   - 本命星表示（例：「あなたの本命星：六白金星」）。[web:15][web:19]
   - 対象年月の仮吉方位（例：「この月の吉方位：北・東」）。
   - Google Maps 表示
     - 中心：ユーザー住所の座標
     - 半径 N km の神社／寺院マーカー
   - 下部テーブル
     - 名称 / 住所 / 方位（N/NE/E/SE/S/SW/W/NW） / 距離(km)

---

## 3. バックエンド要件（Express.js）

- **技術スタック**

  - Node.js + Express.js で REST API を提供。[web:49][web:57]
  - CORS 許可（フロント別オリジン想定）。
  - 環境変数から Google API キーを取得。

- **`POST /api/fortune/base-info`**

  - 入力：`{ birthDate: "1978-03-10" }`
  - 出力：`{ honmeisei: "四緑木星" }`
  - ロジック：
    - 年の 4 桁和 → 一桁にする → `11 - n` で本命星番号 → 九星名。[web:14][web:15]
  - 立春前生まれなどの厳密な補正は未対応（TODO）。

- **`POST /api/fortune/lucky-directions`**

  - 入力：`{ honmeisei: "四緑木星", yearMonth: "2025-02" }`
  - 出力：`{ directions: ["N", "E"] }`
  - 中身はハードコードの簡易テーブル（本命星 → 吉方位 8 方位配列）。

- **`POST /api/places/shrines`**

  - 入力：
    ```
    {
      "address": "神奈川県横浜市○○",
      "radiusKm": 20
    }
    ```
  - 処理：
    1. 住所を Geocoding API で緯度経度に変換。[web:24]
    2. Places API で周辺の神社・寺院を検索（`keyword=神社` / `keyword=寺`）。[web:20]
  - 出力例：
    ```
    {
      "center": { "lat": 35.XXXX, "lng": 139.XXXX },
      "places": [
        { "name": "◯◯神社", "address": "...", "lat": 35.XXXX, "lng": 139.XXXX }
      ]
    }
    ```

- **`POST /api/fortune/recommendations`**

  - 入力：
    ```
    {
      "birthDate": "1978-03-10",
      "address": "神奈川県横浜市○○",
      "yearMonth": "2025-02",
      "radiusKm": 20
    }
    ```
  - 内部処理：
    1. 本命星算出
    2. 吉方位取得
    3. Geocoding + Places で候補取得
    4. 現在地 → 候補までの距離・方位角計算
    5. 8 方位に分類し、吉方位のみフィルタ
  - 出力：
    ```
    {
      "honmeisei": "六白金星",
      "luckyDirections": ["N", "E"],
      "center": { "lat": 35.XXXX, "lng": 139.XXXX },
      "candidates": [
        {
          "name": "◯◯神社",
          "address": "...",
          "lat": 35.XXXX,
          "lng": 139.XXXX,
          "distanceKm": 12.3,
          "direction8": "N"
        }
      ]
    }
    ```

- **ユーティリティ（サーバー側）**
  - Haversine による距離計算（km）。
  - 2 点の座標から方位角（0〜360 度）を算出し、下記の 8 方位に分類：
    - 337.5〜22.5 → N
    - 22.5〜67.5 → NE
    - 67.5〜112.5 → E
    - 112.5〜157.5 → SE
    - 157.5〜202.5 → S
    - 202.5〜247.5 → SW
    - 247.5〜292.5 → W
    - 292.5〜337.5 → NW

---

## 4. フロントエンド要件（React + Tailwind + shadcn/ui）

- **技術スタック**

  - React + TypeScript。
  - Tailwind CSS を導入。公式のユーティリティクラスでレイアウトと余白を定義。[web:69]
  - コンポーネントライブラリとして **shadcn/ui** を採用（Radix UI + Tailwind ベース）。[web:74][web:77][web:80][web:86]

- **shadcn/ui 採用理由**

  - Tailwind と組み合わせたスケーラブルな UI 構築に向いているとの評価が高い。[web:74][web:81]
  - コンポーネントをコードとしてプロジェクトに取り込むスタイルのため、後からのカスタマイズ性が高い。[web:74][web:77]
  - フォーム・ボタン・入力・テーブルなどが整ったデザインで提供される。

- **UI 構成（shadcn/ui 利用想定）**

  - トップ画面
    - `Card` コンポーネントでフォームを囲む。
    - `Input`, `Label`, `Button`, `Select` で生年月日・住所・年月を入力。
  - 結果画面
    - 上部に `Card` で本命星と吉方位を表示。
    - 下部に `Table` コンポーネントで候補神社／寺院を一覧表示。
    - 地図部分は通常の `<div id="map" />` + Maps JS API で描画。[web:54][web:60]

- **フロントの処理フロー**
  1. 入力フォーム送信 → `/api/fortune/recommendations` を `fetch` で呼び出し。
  2. レスポンスを state に格納。
  3. `honmeisei`, `luckyDirections` をテキスト表示。
  4. `candidates` をテーブル表示。
  5. Google Maps JavaScript API で地図とマーカーを描画。

---

## 5. 非機能要件（MVP）

- **パフォーマンス**
  - 1 リクエストで Places API 呼び出しは 1 回（最大 20 件程度）。
- **エラーハンドリング**
  - Geocoding 失敗 → エラーメッセージ返却・表示。
  - Places 0 件 → 「候補なし」メッセージ表示。
- **API キー管理**
  - `.env` に保存し、Express サーバー側からのみ利用。
- **UI**
  - PC ブラウザ前提、レスポンシブ対応は最小限。

---

## 6. 1 日（8 時間）の作業ブレークダウン

1. **1 時間：環境構築**

   - Express プロジェクト作成。
   - React + TypeScript プロジェクト作成。
   - Tailwind + shadcn/ui をセットアップ。[web:74][web:77][web:86]

2. **2 時間：Express 基本 API**

   - `/api/fortune/base-info`
   - `/api/fortune/lucky-directions`
   - 距離・方位計算ユーティリティ実装。

3. **2 時間：Google API 連携**

   - Geocoding + Places 呼び出し処理。
   - `/api/places/shrines` および `/api/fortune/recommendations` の実装。

4. **2 時間：フロント接続 + UI 作成**

   - shadcn/ui でフォーム・カード・テーブルを構築。
   - `/api/fortune/recommendations` を叩いて結果表示。
   - Maps JS API で地図・マーカー表示。

5. **1 時間：調整・README**
   - エラーハンドリング・ローディング表示。
   - セットアップ手順・暦補正未対応などの注意事項を README に記載。
