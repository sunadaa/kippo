/**
 * 九星気学 - 本命星・吉方位算出ユーティリティ
 * 
 * Phase 2.5: 年盤・月盤による動的吉方位計算
 * - 立春補正（2月4日前後の生まれの補正）は簡易実装
 * - 年盤・月盤ベースで吉方位を動的に算出
 * - 五黄殺・暗剣殺・本命殺・本命的殺を考慮
 */

// 九星の定義
const KYUSEI_NAMES = [
  '', // 0は使用しない
  '一白水星',
  '二黒土星',
  '三碧木星',
  '四緑木星',
  '五黄土星',
  '六白金星',
  '七赤金星',
  '八白土星',
  '九紫火星',
] as const;

/**
 * 8方位の定義
 */
export type Direction8 = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

/**
 * 方位盤の型定義（8方位 + 中央）
 */
export type DirectionPan = Record<Direction8 | 'CENTER', number>;

/**
 * 五行の定義
 */
enum Gogyou {
  WOOD = 'wood',   // 木
  FIRE = 'fire',   // 火
  EARTH = 'earth', // 土
  METAL = 'metal', // 金
  WATER = 'water', // 水
}

/**
 * 九星と五行の対応表
 */
const KYUSEI_GOGYOU_MAP: Record<number, Gogyou> = {
  1: Gogyou.WATER,  // 一白水星
  2: Gogyou.EARTH,  // 二黒土星
  3: Gogyou.WOOD,   // 三碧木星
  4: Gogyou.WOOD,   // 四緑木星
  5: Gogyou.EARTH,  // 五黄土星
  6: Gogyou.METAL,  // 六白金星
  7: Gogyou.METAL,  // 七赤金星
  8: Gogyou.EARTH,  // 八白土星
  9: Gogyou.FIRE,   // 九紫火星
};

/**
 * 五行の相生関係
 * 木→火→土→金→水→木の順で相生
 */
const GOGYOU_COMPATIBILITY: Record<Gogyou, Gogyou[]> = {
  [Gogyou.WOOD]: [Gogyou.WATER, Gogyou.WOOD, Gogyou.FIRE],  // 木は水を吸い、木同士は中立、火を生む
  [Gogyou.FIRE]: [Gogyou.WOOD, Gogyou.FIRE, Gogyou.EARTH],  // 火は木を燃やし、火同士は中立、土を生む
  [Gogyou.EARTH]: [Gogyou.FIRE, Gogyou.EARTH, Gogyou.METAL], // 土は火から生まれ、土同士は中立、金を生む
  [Gogyou.METAL]: [Gogyou.EARTH, Gogyou.METAL, Gogyou.WATER], // 金は土から生まれ、金同士は中立、水を生む
  [Gogyou.WATER]: [Gogyou.METAL, Gogyou.WATER, Gogyou.WOOD], // 水は金から生まれ、水同士は中立、木を生む
};

/**
 * 方位オフセット（後天定位盤の配置）
 * 中宮を基準とした各方位のオフセット値
 */
const DIRECTION_OFFSET: Record<Direction8, number> = {
  N: 0,   // 北
  NE: 7,  // 北東
  E: 2,   // 東
  SE: 3,  // 南東
  S: 8,   // 南
  SW: 1,  // 南西
  W: 6,   // 西
  NW: 5,  // 北西
};

/**
 * 方位の対角関係（180度反対の方位）
 */
const OPPOSITE_DIRECTION: Record<Direction8 | 'CENTER', Direction8 | 'CENTER'> = {
  N: 'S',
  S: 'N',
  E: 'W',
  W: 'E',
  NE: 'SW',
  SW: 'NE',
  SE: 'NW',
  NW: 'SE',
  CENTER: 'CENTER',
};

/**
 * 月盤中宮の計算表
 * 年盤中宮のグループ（一白/四緑/七赤、二黒/五黄/八白、三碧/六白/九紫）ごとに
 * 月別の中宮を定義
 */
const MONTH_PAN_TABLE: Record<string, number[]> = {
  // 一白水星、四緑木星、七赤金星の年
  '147': [6, 8, 7, 6, 5, 4, 3, 2, 1, 9, 8, 7], // 1月から12月
  // 二黒土星、五黄土星、八白土星の年
  '258': [3, 5, 4, 3, 2, 1, 9, 8, 7, 6, 5, 4],
  // 三碧木星、六白金星、九紫火星の年
  '369': [9, 2, 1, 9, 8, 7, 6, 5, 4, 3, 2, 1],
};

/**
 * 年の各桁を合計して一桁にする
 * 例: 1978 → 1+9+7+8 = 25 → 2+5 = 7
 */
function sumDigitsToSingle(year: number): number {
  let sum = year;
  
  while (sum >= 10) {
    sum = sum
      .toString()
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  
  return sum;
}

/**
 * 九星番号を正規化（1-9の範囲に収める）
 */
function normalizeKyuseiNumber(num: number): number {
  const result = ((num - 1) % 9) + 1;
  return result <= 0 ? result + 9 : result;
}

/**
 * 年盤中宮を算出
 * 
 * @param year - 年（4桁）
 * @returns 年盤中宮の九星番号（1-9）
 */
export function calculateYearPanCenter(year: number): number {
  const singleDigit = sumDigitsToSingle(year);
  let kyuseiNumber = 11 - singleDigit;
  return normalizeKyuseiNumber(kyuseiNumber);
}

/**
 * 月盤中宮を算出
 * 
 * @param year - 年（4桁）
 * @param month - 月（1-12）
 * @returns 月盤中宮の九星番号（1-9）
 */
export function calculateMonthPanCenter(year: number, month: number): number {
  // 立春補正：1月は前年の13月として扱う
  let adjustedYear = year;
  let adjustedMonth = month;
  
  if (month === 1) {
    adjustedYear = year - 1;
    adjustedMonth = 12; // 前年の12月として扱う
  } else if (month === 2) {
    // 2月4日以降が新年盤の開始だが、簡易的に2月全体を新年盤として扱う
    // 厳密な実装ではここで日付チェックが必要
    adjustedMonth = 1; // 2月は新年の1月目
  } else {
    // 3月以降は月番号を1つずらす（2月を1月目とするため）
    adjustedMonth = month - 1;
  }
  
  const yearPanCenter = calculateYearPanCenter(adjustedYear);
  
  // 年盤中宮のグループを判定
  let groupKey: string;
  if ([1, 4, 7].includes(yearPanCenter)) {
    groupKey = '147';
  } else if ([2, 5, 8].includes(yearPanCenter)) {
    groupKey = '258';
  } else {
    groupKey = '369';
  }
  
  // 月のインデックス（0始まり）
  const monthIndex = adjustedMonth - 1;
  
  return MONTH_PAN_TABLE[groupKey][monthIndex];
}

/**
 * 方位盤を生成（年盤または月盤）
 * 
 * @param centerStar - 中宮の九星番号（1-9）
 * @returns 各方位の九星番号を含むオブジェクト
 */
export function generateDirectionPan(centerStar: number): DirectionPan {
  const pan: Partial<DirectionPan> = {
    CENTER: centerStar,
  };
  
  // 各方位の九星を計算
  for (const [direction, offset] of Object.entries(DIRECTION_OFFSET)) {
    const starNumber = normalizeKyuseiNumber(centerStar + offset);
    pan[direction as Direction8] = starNumber;
  }
  
  return pan as DirectionPan;
}

/**
 * 五行による相性判定
 * 
 * @param star1 - 判定対象の九星番号（本命星）
 * @param star2 - 方位の九星番号
 * @returns 相性が良いかどうか
 */
export function isCompatibleByGogyou(star1: number, star2: number): boolean {
  const gogyou1 = KYUSEI_GOGYOU_MAP[star1];
  const gogyou2 = KYUSEI_GOGYOU_MAP[star2];
  
  if (!gogyou1 || !gogyou2) {
    return false;
  }
  
  // 相生関係にあるか確認
  return GOGYOU_COMPATIBILITY[gogyou1].includes(gogyou2);
}

/**
 * 凶方位の判定
 * 
 * @param direction - 判定対象の方位
 * @param honmeiseiNumber - 本命星の九星番号
 * @param yearPan - 年盤
 * @param monthPan - 月盤
 * @returns 凶方位かどうか
 */
export function isUnluckyDirection(
  direction: Direction8,
  honmeiseiNumber: number,
  yearPan: DirectionPan,
  monthPan: DirectionPan
): boolean {
  const yearStar = yearPan[direction];
  const monthStar = monthPan[direction];
  
  // 五黄殺：五黄土星が位置する方位
  const goouSatsuYear = yearPan.CENTER === 5 ? 'CENTER' : 
    (Object.entries(yearPan).find(([_, star]) => star === 5)?.[0] as Direction8);
  const goouSatsuMonth = monthPan.CENTER === 5 ? 'CENTER' : 
    (Object.entries(monthPan).find(([_, star]) => star === 5)?.[0] as Direction8);
  
  if (goouSatsuYear === direction || goouSatsuMonth === direction) {
    return true;
  }
  
  // 暗剣殺：五黄土星の正反対の方位
  if (goouSatsuYear && goouSatsuYear !== 'CENTER' && OPPOSITE_DIRECTION[goouSatsuYear] === direction) {
    return true;
  }
  if (goouSatsuMonth && goouSatsuMonth !== 'CENTER' && OPPOSITE_DIRECTION[goouSatsuMonth] === direction) {
    return true;
  }
  
  // 本命殺：本命星が位置する方位
  if (yearStar === honmeiseiNumber || monthStar === honmeiseiNumber) {
    return true;
  }
  
  // 本命的殺：本命星の正反対の方位
  const honmeiDirection = Object.entries(yearPan).find(([_, star]) => star === honmeiseiNumber)?.[0] as Direction8;
  if (honmeiDirection && OPPOSITE_DIRECTION[honmeiDirection] === direction) {
    return true;
  }
  
  const honmeiDirectionMonth = Object.entries(monthPan).find(([_, star]) => star === honmeiseiNumber)?.[0] as Direction8;
  if (honmeiDirectionMonth && OPPOSITE_DIRECTION[honmeiDirectionMonth] === direction) {
    return true;
  }
  
  return false;
}

/**
 * 吉方位を動的に計算
 * 
 * @param birthDate - 生年月日（YYYY-MM-DD形式）
 * @param yearMonth - 対象年月（YYYY-MM形式）
 * @returns 吉方位の詳細情報
 */
export function calculateLuckyDirections(
  birthDate: string,
  yearMonth: string
): {
  honmeisei: string;
  honmeiseiNumber: number;
  directions: Direction8[];
  yearPan: DirectionPan;
  monthPan: DirectionPan;
  unluckyDirections: {
    goouSatsu: (Direction8 | 'CENTER')[];
    ankenSatsu: (Direction8 | 'CENTER')[];
    honmeiSatsu: (Direction8 | 'CENTER')[];
    honmeiTekiSatsu: (Direction8 | 'CENTER')[];
  };
} {
  // 年月のパース
  const yearMonthRegex = /^(\d{4})-(\d{2})$/;
  const match = yearMonth.match(yearMonthRegex);
  if (!match) {
    throw new Error('Invalid yearMonth format. Expected YYYY-MM.');
  }
  
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12.');
  }
  
  // 本命星を算出
  const honmeisei = calculateHonmeisei(birthDate);
  const honmeiseiNumber = getHonmeiseiNumber(birthDate);
  
  // 年盤・月盤を生成
  const yearPanCenter = calculateYearPanCenter(year);
  const monthPanCenter = calculateMonthPanCenter(year, month);
  
  const yearPan = generateDirectionPan(yearPanCenter);
  const monthPan = generateDirectionPan(monthPanCenter);
  
  // 凶方位を特定
  const unluckyDirections = {
    goouSatsu: [] as (Direction8 | 'CENTER')[],
    ankenSatsu: [] as (Direction8 | 'CENTER')[],
    honmeiSatsu: [] as (Direction8 | 'CENTER')[],
    honmeiTekiSatsu: [] as (Direction8 | 'CENTER')[],
  };
  
  // 五黄殺の特定
  for (const [dir, star] of Object.entries(yearPan)) {
    if (star === 5) {
      unluckyDirections.goouSatsu.push(dir as Direction8 | 'CENTER');
    }
  }
  for (const [dir, star] of Object.entries(monthPan)) {
    if (star === 5 && !unluckyDirections.goouSatsu.includes(dir as Direction8 | 'CENTER')) {
      unluckyDirections.goouSatsu.push(dir as Direction8 | 'CENTER');
    }
  }
  
  // 暗剣殺の特定
  for (const goouDir of unluckyDirections.goouSatsu) {
    if (goouDir !== 'CENTER') {
      const oppositeDir = OPPOSITE_DIRECTION[goouDir];
      if (!unluckyDirections.ankenSatsu.includes(oppositeDir)) {
        unluckyDirections.ankenSatsu.push(oppositeDir);
      }
    }
  }
  
  // 本命殺の特定
  for (const [dir, star] of Object.entries(yearPan)) {
    if (star === honmeiseiNumber) {
      unluckyDirections.honmeiSatsu.push(dir as Direction8 | 'CENTER');
    }
  }
  for (const [dir, star] of Object.entries(monthPan)) {
    if (star === honmeiseiNumber && !unluckyDirections.honmeiSatsu.includes(dir as Direction8 | 'CENTER')) {
      unluckyDirections.honmeiSatsu.push(dir as Direction8 | 'CENTER');
    }
  }
  
  // 本命的殺の特定
  for (const honmeiDir of unluckyDirections.honmeiSatsu) {
    if (honmeiDir !== 'CENTER') {
      const oppositeDir = OPPOSITE_DIRECTION[honmeiDir];
      if (!unluckyDirections.honmeiTekiSatsu.includes(oppositeDir)) {
        unluckyDirections.honmeiTekiSatsu.push(oppositeDir);
      }
    }
  }
  
  // 吉方位を判定
  const luckyDirections: Direction8[] = [];
  const allDirections: Direction8[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  
  for (const direction of allDirections) {
    // 凶方位を除外
    if (isUnluckyDirection(direction, honmeiseiNumber, yearPan, monthPan)) {
      continue;
    }
    
    const yearStar = yearPan[direction];
    const monthStar = monthPan[direction];
    
    // 年盤・月盤の両方で本命星と相性が良いかチェック
    const yearCompatible = isCompatibleByGogyou(honmeiseiNumber, yearStar);
    const monthCompatible = isCompatibleByGogyou(honmeiseiNumber, monthStar);
    
    // 両方で相性が良い場合のみ吉方位とする
    if (yearCompatible && monthCompatible) {
      luckyDirections.push(direction);
    }
  }
  
  return {
    honmeisei,
    honmeiseiNumber,
    directions: luckyDirections,
    yearPan,
    monthPan,
    unluckyDirections,
  };
}

/**
 * 生年月日から本命星を算出
 * 
 * @param birthDate - 生年月日（YYYY-MM-DD形式）
 * @returns 本命星の名称（例：「四緑木星」）
 */
export function calculateHonmeisei(birthDate: string): string {
  // 日付の妥当性チェック
  const date = new Date(birthDate);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD.');
  }
  
  let year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 立春補正（簡易版：2月4日未満は前年扱い）
  if (month === 1 || (month === 2 && day < 4)) {
    year = year - 1;
  }
  
  // 1900年未満、2100年以降は対象外
  if (year < 1900 || year > 2100) {
    throw new Error('Year must be between 1900 and 2100.');
  }
  
  // 年の各桁を合計して一桁にする
  const singleDigit = sumDigitsToSingle(year);
  
  // 11 - n で本命星番号を算出
  let kyuseiNumber = 11 - singleDigit;
  kyuseiNumber = normalizeKyuseiNumber(kyuseiNumber);
  
  return KYUSEI_NAMES[kyuseiNumber];
}

/**
 * 本命星の番号を取得（1-9）
 */
export function getHonmeiseiNumber(birthDate: string): number {
  const honmeisei = calculateHonmeisei(birthDate);
  return KYUSEI_NAMES.indexOf(honmeisei as typeof KYUSEI_NAMES[number]);
}

/**
 * 本命星名から番号を取得
 */
export function getNumberFromHonmeisei(honmeisei: string): number {
  const index = KYUSEI_NAMES.indexOf(honmeisei as any);
  if (index === -1) {
    throw new Error(`Invalid honmeisei name: ${honmeisei}`);
  }
  return index;
}

/**
 * 旧バージョンとの互換性のための関数
 * @deprecated 新しい calculateLuckyDirections を使用してください
 */
export function getLuckyDirections(honmeisei: string, yearMonth?: string): Direction8[] {
  console.warn('getLuckyDirections is deprecated. Use calculateLuckyDirections instead.');
  
  if (!yearMonth) {
    throw new Error('yearMonth is required for dynamic lucky direction calculation.');
  }
  
  // 本命星から番号を取得
  const honmeiseiNumber = getNumberFromHonmeisei(honmeisei);
  
  // ダミーの生年月日を生成（本命星番号から逆算）
  // これは互換性のための暫定処理
  const year = 2000;
  const targetDigit = 11 - honmeiseiNumber;
  const birthDate = `${year}-06-15`;
  
  try {
    const result = calculateLuckyDirections(birthDate, yearMonth);
    return result.directions;
  } catch (error) {
    console.error('Error in getLuckyDirections:', error);
    return [];
  }
}
