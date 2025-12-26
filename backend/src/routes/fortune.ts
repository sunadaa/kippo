import { Router, Request, Response } from 'express';
import { calculateHonmeisei, getLuckyDirections } from '../utils/fortune';
import { geocodeAddress, searchNearbyPlaces } from '../utils/google';
import { calculateDistanceAndDirection } from '../utils/geo';

const router = Router();

/**
 * POST /api/fortune/base-info
 * 
 * 生年月日から本命星を算出
 * 
 * リクエストボディ:
 * {
 *   "birthDate": "1978-03-10"
 * }
 * 
 * レスポンス:
 * {
 *   "honmeisei": "四緑木星"
 * }
 */
router.post('/base-info', (req: Request, res: Response) => {
  try {
    const { birthDate } = req.body;
    
    // バリデーション
    if (!birthDate) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'birthDate is required',
      });
    }
    
    // 本命星を算出
    const honmeisei = calculateHonmeisei(birthDate);
    
    res.json({ honmeisei });
  } catch (error) {
    console.error('Error in /api/fortune/base-info:', error);
    
    res.status(400).json({
      error: 'Bad Request',
      message: error instanceof Error ? error.message : 'Failed to calculate honmeisei',
    });
  }
});

/**
 * POST /api/fortune/lucky-directions
 * 
 * 本命星と年月から吉方位を取得
 * 
 * リクエストボディ:
 * {
 *   "honmeisei": "四緑木星",
 *   "yearMonth": "2025-02"
 * }
 * 
 * レスポンス:
 * {
 *   "directions": ["N", "E", "SE", "NW"]
 * }
 */
router.post('/lucky-directions', (req: Request, res: Response) => {
  try {
    const { honmeisei, yearMonth } = req.body;
    
    // バリデーション
    if (!honmeisei) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'honmeisei is required',
      });
    }
    
    // 吉方位を取得
    const directions = getLuckyDirections(honmeisei, yearMonth);
    
    res.json({ directions });
  } catch (error) {
    console.error('Error in /api/fortune/lucky-directions:', error);
    
    res.status(400).json({
      error: 'Bad Request',
      message: error instanceof Error ? error.message : 'Failed to get lucky directions',
    });
  }
});

/**
 * POST /api/fortune/recommendations
 * 
 * 統合検索API
 * 生年月日と住所から、吉方位にある神社・寺院を検索
 * 
 * リクエストボディ:
 * {
 *   "birthDate": "1978-03-10",
 *   "address": "神奈川県横浜市",
 *   "yearMonth": "2025-02",
 *   "radiusKm": 20
 * }
 * 
 * レスポンス:
 * {
 *   "honmeisei": "六白金星",
 *   "luckyDirections": ["N", "E"],
 *   "center": { "lat": 35.XXXX, "lng": 139.XXXX },
 *   "candidates": [
 *     {
 *       "name": "◯◯神社",
 *       "address": "...",
 *       "lat": 35.XXXX,
 *       "lng": 139.XXXX,
 *       "distanceKm": 12.3,
 *       "direction8": "N"
 *     }
 *   ]
 * }
 */
router.post('/recommendations', async (req: Request, res: Response) => {
  try {
    const { birthDate, address, yearMonth, radiusKm = 20 } = req.body;

    // バリデーション
    if (!birthDate) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'birthDate is required',
      });
    }

    if (!address) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'address is required',
      });
    }

    // 半径の妥当性チェック
    if (radiusKm < 1 || radiusKm > 100) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'radiusKm must be between 1 and 100',
      });
    }

    console.log(`[Recommendations] Request received:`, { birthDate, address, yearMonth, radiusKm });

    // 1. 本命星を算出
    const honmeisei = calculateHonmeisei(birthDate);
    console.log(`[Recommendations] Honmeisei calculated: ${honmeisei}`);

    // 2. 吉方位を取得
    const luckyDirections = getLuckyDirections(honmeisei, yearMonth);
    console.log(`[Recommendations] Lucky directions: ${luckyDirections.join(', ')}`);

    // 3. 住所から座標を取得
    console.log(`[Recommendations] Geocoding address: ${address}`);
    const center = await geocodeAddress(address);
    console.log(`[Recommendations] Center coordinates:`, center);

    // 4. 周辺の神社・寺院を検索
    console.log(`[Recommendations] Searching nearby places within ${radiusKm}km`);
    const places = await searchNearbyPlaces(center, radiusKm);
    console.log(`[Recommendations] Found ${places.length} places`);

    // 5. 各候補について距離と方位を計算
    const candidates = places.map((place) => {
      const { distanceKm, direction8 } = calculateDistanceAndDirection(
        center,
        { lat: place.lat, lng: place.lng }
      );

      return {
        name: place.name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        distanceKm,
        direction8,
      };
    });

    // 6. 吉方位のみフィルタリング
    const luckyDirectionsSet = new Set(luckyDirections);
    const filteredCandidates = candidates.filter((candidate) =>
      luckyDirectionsSet.has(candidate.direction8)
    );

    console.log(`[Recommendations] Filtered to ${filteredCandidates.length} candidates in lucky directions`);

    // 7. 距離でソート
    filteredCandidates.sort((a, b) => a.distanceKm - b.distanceKm);

    // レスポンス
    res.json({
      honmeisei,
      luckyDirections,
      center,
      candidates: filteredCandidates,
    });
  } catch (error) {
    console.error('Error in /api/fortune/recommendations:', error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to get recommendations',
    });
  }
});

export default router;

