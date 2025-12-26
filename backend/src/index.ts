import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import fortuneRoutes from './routes/fortune';

// 環境変数の読み込み
dotenv.config();

// Prismaクライアントの初期化
const prisma = new PrismaClient();

// Expressアプリの作成
const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// ルーティング
app.use('/api/fortune', fortuneRoutes);

// ヘルスチェックエンドポイント
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'Kippo API is running',
    timestamp: new Date().toISOString()
  });
});

// Hello World エンドポイント
app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ 
    message: 'Hello, World from Kippo API!',
    version: '1.0.0'
  });
});

// データベース接続確認エンドポイント
app.get('/api/db-check', async (req: Request, res: Response) => {
  try {
    // データベース接続テスト
    await prisma.$connect();
    // 簡易的なクエリでデータベース種類を確認
    const dbVersion = await prisma.$queryRaw`SELECT version()` as any[];
    const isPostgres = dbVersion[0]?.version?.toLowerCase().includes('postgresql');
    
    res.json({ 
      status: 'ok', 
      message: 'Database connection successful',
      database: isPostgres ? 'PostgreSQL' : 'Unknown',
      version: dbVersion[0]?.version || 'N/A'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 404ハンドラー
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// エラーハンドラー
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   - GET  /health                         - Health check`);
  console.log(`   - GET  /api/hello                      - Hello World`);
  console.log(`   - GET  /api/db-check                   - Database connection check`);
  console.log(`   - POST /api/fortune/base-info          - Calculate honmeisei (本命星)`);
  console.log(`   - POST /api/fortune/lucky-directions   - Get lucky directions (吉方位)`);
  console.log(`   - POST /api/fortune/recommendations    - Integrated search (統合検索)`);
});

// グレースフルシャットダウン
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

