import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/favorites
 * 
 * お気に入りを追加
 * 
 * リクエストボディ:
 * {
 *   "searchHistoryId": 1,
 *   "name": "渋谷氷川神社",
 *   "address": "東京都渋谷区...",
 *   "lat": 35.6581,
 *   "lng": 139.7013,
 *   "direction8": "N",
 *   "distanceKm": 1.81
 * }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { searchHistoryId, name, address, lat, lng, direction8, distanceKm } = req.body;

    // バリデーション
    if (!searchHistoryId || !name || !address || lat === undefined || lng === undefined || !direction8 || distanceKm === undefined) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'searchHistoryId, name, address, lat, lng, direction8, distanceKm are required',
      });
    }

    // 重複チェック（同じ searchHistoryId と name の組み合わせ）
    const existing = await prisma.favorite.findFirst({
      where: {
        searchHistoryId,
        name,
      },
    });

    if (existing) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'This favorite already exists',
      });
    }

    // お気に入りを追加
    const favorite = await prisma.favorite.create({
      data: {
        searchHistoryId,
        name,
        address,
        lat,
        lng,
        direction8,
        distanceKm,
      },
    });

    res.json(favorite);
  } catch (error) {
    console.error('Error in POST /api/favorites:', error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to add favorite',
    });
  }
});

/**
 * GET /api/favorites
 * 
 * お気に入り一覧を取得
 * 
 * レスポンス:
 * {
 *   "favorites": [
 *     {
 *       "id": 1,
 *       "name": "渋谷氷川神社",
 *       "address": "東京都渋谷区...",
 *       "lat": 35.6581,
 *       "lng": 139.7013,
 *       "direction8": "N",
 *       "distanceKm": 1.81,
 *       "createdAt": "2025-01-15T10:35:00Z"
 *     }
 *   ]
 * }
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // お気に入り一覧を取得（最新順）
    const favorites = await prisma.favorite.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        searchHistory: true,
      },
    });

    res.json({
      favorites,
    });
  } catch (error) {
    console.error('Error in GET /api/favorites:', error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to get favorites',
    });
  }
});

/**
 * DELETE /api/favorites/:id
 * 
 * お気に入りを削除
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

    // お気に入りを削除
    await prisma.favorite.delete({
      where: { id },
    });

    res.json({
      message: 'Favorite deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/favorites/:id:', error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to delete favorite',
    });
  }
});

/**
 * GET /api/favorites/check
 * 
 * お気に入り登録状態を確認
 * 
 * クエリパラメータ:
 * - searchHistoryId: 検索履歴ID
 * - name: 神社・寺院名
 * 
 * レスポンス:
 * { "isFavorite": true/false, "favoriteId": 1 }
 */
router.get('/check', async (req: Request, res: Response) => {
  try {
    const { searchHistoryId, name } = req.query;

    if (!searchHistoryId || !name) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'searchHistoryId and name are required',
      });
    }

    // お気に入り登録状態を確認
    const favorite = await prisma.favorite.findFirst({
      where: {
        searchHistoryId: Number(searchHistoryId),
        name: String(name),
      },
    });

    res.json({
      isFavorite: !!favorite,
      favoriteId: favorite?.id || null,
    });
  } catch (error) {
    console.error('Error in GET /api/favorites/check:', error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to check favorite status',
    });
  }
});

export default router;

