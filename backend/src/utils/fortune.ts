/**
 * 九星気学 - 本命星算出ユーティリティ
 * 
 * 注意: このプロトタイプ実装は簡易版です。
 * - 立春補正（2月3日前後の生まれの補正）は未対応
 * - 年盤ベースのみで、月命星は対象外
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
  
  const year = date.getFullYear();
  
  // 1900年未満、2100年以降は対象外
  if (year < 1900 || year > 2100) {
    throw new Error('Year must be between 1900 and 2100.');
  }
  
  // 年の各桁を合計して一桁にする
  const singleDigit = sumDigitsToSingle(year);
  
  // 11 - n で本命星番号を算出
  let kyuseiNumber = 11 - singleDigit;
  
  // 10の場合は1に、0の場合は9に補正
  if (kyuseiNumber === 10) {
    kyuseiNumber = 1;
  } else if (kyuseiNumber === 0) {
    kyuseiNumber = 9;
  }
  
  return KYUSEI_NAMES[kyuseiNumber];
}

/**
 * 本命星の番号を取得（1-9）
 */
export function getHonmeiseiNumber(birthDate: string): number {
  const honmeisei = calculateHonmeisei(birthDate);
  return KYUSEI_NAMES.indexOf(honmeisei);
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
 * 8方位の定義
 */
export type Direction8 = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

/**
 * 吉方位の簡易テーブル（デモ用）
 * 
 * 注意: これはプロトタイプ用の簡易実装です。
 * 実際の九星気学では、年盤・月盤・日盤の組み合わせや、
 * 五行の相生・相剋、暗剣殺・五黄殺などの複雑なルールがあります。
 * このテーブルはデモ用の簡易版です。
 */
const LUCKY_DIRECTIONS_TABLE: Record<string, Direction8[]> = {
  '一白水星': ['E', 'SE', 'S', 'SW'],
  '二黒土星': ['N', 'NE', 'W', 'NW'],
  '三碧木星': ['S', 'SW', 'W', 'N'],
  '四緑木星': ['N', 'E', 'SE', 'NW'],
  '五黄土星': ['NE', 'E', 'SW', 'W'],
  '六白金星': ['SE', 'S', 'N', 'NE'],
  '七赤金星': ['E', 'S', 'W', 'NW'],
  '八白土星': ['NE', 'SE', 'SW', 'NW'],
  '九紫火星': ['N', 'E', 'W', 'NW'],
};

/**
 * 本命星と年月から吉方位を取得
 * 
 * @param honmeisei - 本命星（例：「四緑木星」）
 * @param yearMonth - 対象年月（例：「2025-02」）※現在は未使用だが将来の拡張用
 * @returns 吉方位の配列（例：["N", "E"]）
 */
export function getLuckyDirections(honmeisei: string, yearMonth?: string): Direction8[] {
  // 本命星の妥当性チェック
  if (!LUCKY_DIRECTIONS_TABLE[honmeisei]) {
    throw new Error(`Invalid honmeisei: ${honmeisei}`);
  }
  
  // 年月の妥当性チェック（オプショナル）
  if (yearMonth) {
    const yearMonthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!yearMonthRegex.test(yearMonth)) {
      throw new Error('Invalid yearMonth format. Expected YYYY-MM.');
    }
  }
  
  // 簡易版では年月に関係なく、本命星のみで吉方位を返す
  // 将来的には年月による変動を実装する余地がある
  return LUCKY_DIRECTIONS_TABLE[honmeisei];
}

