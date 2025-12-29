import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/history
 * 
 * 検索履歴を保存
 * 
 * リクエストボディ:
 * {
 *   "birthDate": "1978-03-10",
 *   "address": "東京都渋谷区",
 *   "yearMonth": "2025-02",
 *   "radiusKm": 20,
 *   "honmeisei": "四緑木星"
 * }
 * 
 * レスポンス:
 * {
 *   "id": 1,
 *   "createdAt": "2025-01-15T10:30:00Z"
 * }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { birthDate, address, yearMonth, radiusKm, honmeisei } = req.body;

    // バリデーション
    if (!birthDate || !address || !yearMonth || !honmeisei) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'birthDate, address, yearMonth, honmeisei are required',
      });
    }

    // 検索履歴を保存
    const history = await prisma.searchHistory.create({
      data: {
        birthDate,
        address,
        yearMonth,
        radiusKm: radiusKm || 20,
        honmeisei,
      },
    });

    res.json({
      id: history.id,
      createdAt: history.createdAt,
    });
  } catch (error) {
    console.error('Error in POST /api/history:', error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to save search history',
    });
  }
});

/**
 * GET /api/history
 * 
 * 検索履歴一覧を取得
 * 
 * クエリパラメータ:
 * - limit: 取得件数（デフォルト：20）
 * 
 * レスポンス:
 * {
 *   "histories": [
 *     {
 *       "id": 1,
 *       "birthDate": "1978-03-10",
 *       "address": "東京都渋谷区",
 *       "yearMonth": "2025-02",
 *       "radiusKm": 20,
 *       "honmeisei": "四緑木星",
 *       "createdAt": "2025-01-15T10:30:00Z"
 *     }
 *   ]
 * }
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 20;

    // 検索履歴を取得（最新順）
    const histories = await prisma.searchHistory.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      histories,
    });
  } catch (error) {
    console.error('Error in GET /api/history:', error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to get search history',
    });
  }
});

/**
 * DELETE /api/history/:id
 * 
 * 検索履歴を削除
 * 関連するお気に入りも削除（CASCADE）
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid ID',
      });
    }

    // 検索履歴を削除（お気に入りも CASCADE で削除される）
    await prisma.searchHistory.delete({
      where: { id },
    });

    res.json({
      message: 'Search history deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/history/:id:', error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to delete search history',
    });
  }
});

export default router;

