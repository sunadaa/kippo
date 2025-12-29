import { Router, Request, Response } from 'express';
import { calculateHonmeisei, calculateLuckyDirections } from '../utils/fortune';
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
 * 生年月日と年月から吉方位を動的に算出
 * 
 * リクエストボディ:
 * {
 *   "birthDate": "1978-03-10",
 *   "yearMonth": "2025-02"
 * }
 * 
 * レスポンス:
 * {
 *   "honmeisei": "四緑木星",
 *   "honmeiseiNumber": 4,
 *   "directions": ["N", "E"],
 *   "yearPan": { "N": 1, "NE": 8, ... },
 *   "monthPan": { "N": 6, "NE": 4, ... },
 *   "unluckyDirections": {
 *     "goouSatsu": ["CENTER"],
 *     "ankenSatsu": ["CENTER"],
 *     "honmeiSatsu": ["SE"],
 *     "honmeiTekiSatsu": ["NW"]
 *   }
 * }
 */
router.post('/lucky-directions', (req: Request, res: Response) => {
  try {
    const { birthDate, yearMonth } = req.body;
    
    // バリデーション
    if (!birthDate) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'birthDate is required',
      });
    }
    
    if (!yearMonth) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'yearMonth is required',
      });
    }
    
    // 吉方位を動的に計算
    const result = calculateLuckyDirections(birthDate, yearMonth);
    
    res.json(result);
  } catch (error) {
    console.error('Error in /api/fortune/lucky-directions:', error);
    
    res.status(400).json({
      error: 'Bad Request',
      message: error instanceof Error ? error.message : 'Failed to calculate lucky directions',
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

    // yearMonthが未指定の場合、現在の年月を使用
    const targetYearMonth = yearMonth || new Date().toISOString().slice(0, 7);

    // 1. 本命星と吉方位を動的に算出
    const luckyResult = calculateLuckyDirections(birthDate, targetYearMonth);
    console.log(`[Recommendations] Honmeisei calculated: ${luckyResult.honmeisei}`);
    console.log(`[Recommendations] Lucky directions: ${luckyResult.directions.join(', ')}`);

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
    const luckyDirectionsSet = new Set(luckyResult.directions);
    const filteredCandidates = candidates.filter((candidate) =>
      luckyDirectionsSet.has(candidate.direction8)
    );

    console.log(`[Recommendations] Filtered to ${filteredCandidates.length} candidates in lucky directions`);

    // 7. 距離でソート
    filteredCandidates.sort((a, b) => a.distanceKm - b.distanceKm);

    // レスポンス（拡張版：年盤・月盤情報も含む）
    res.json({
      honmeisei: luckyResult.honmeisei,
      honmeiseiNumber: luckyResult.honmeiseiNumber,
      luckyDirections: luckyResult.directions,
      center,
      candidates: filteredCandidates,
      // 追加情報（オプション）
      yearPan: luckyResult.yearPan,
      monthPan: luckyResult.monthPan,
      unluckyDirections: luckyResult.unluckyDirections,
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

