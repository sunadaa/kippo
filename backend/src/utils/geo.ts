/**
 * 地理計算ユーティリティ
 * - 距離計算（Haversine公式）
 * - 方位角計算
 * - 8方位への変換
 */

import type { Direction8 } from './fortune';

/**
 * 座標の型定義
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * 地球の半径（km）
 */
const EARTH_RADIUS_KM = 6371;

/**
 * 度をラジアンに変換
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * ラジアンを度に変換
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Haversine公式を使用して2点間の距離を計算（km）
 * 
 * @param coord1 - 地点1の座標
 * @param coord2 - 地点2の座標
 * @returns 距離（km）
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const lat1Rad = toRadians(coord1.lat);
  const lat2Rad = toRadians(coord2.lat);
  const deltaLat = toRadians(coord2.lat - coord1.lat);
  const deltaLng = toRadians(coord2.lng - coord1.lng);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS_KM * c;

  // 小数点以下2桁に丸める
  return Math.round(distance * 100) / 100;
}

/**
 * 2点間の方位角を計算（0-360度）
 * 
 * @param from - 起点の座標
 * @param to - 終点の座標
 * @returns 方位角（度、北を0度として時計回り）
 */
export function calculateBearing(from: Coordinates, to: Coordinates): number {
  const lat1Rad = toRadians(from.lat);
  const lat2Rad = toRadians(to.lat);
  const deltaLng = toRadians(to.lng - from.lng);

  const y = Math.sin(deltaLng) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLng);

  const bearing = toDegrees(Math.atan2(y, x));

  // 0-360度の範囲に正規化
  return (bearing + 360) % 360;
}

/**
 * 方位角を8方位に変換
 * 
 * 方位の範囲:
 * - N:  337.5-22.5度
 * - NE: 22.5-67.5度
 * - E:  67.5-112.5度
 * - SE: 112.5-157.5度
 * - S:  157.5-202.5度
 * - SW: 202.5-247.5度
 * - W:  247.5-292.5度
 * - NW: 292.5-337.5度
 * 
 * @param bearing - 方位角（度）
 * @returns 8方位
 */
export function bearingToDirection8(bearing: number): Direction8 {
  // 0-360度の範囲に正規化
  const normalizedBearing = ((bearing % 360) + 360) % 360;

  if (normalizedBearing >= 337.5 || normalizedBearing < 22.5) {
    return 'N';
  } else if (normalizedBearing >= 22.5 && normalizedBearing < 67.5) {
    return 'NE';
  } else if (normalizedBearing >= 67.5 && normalizedBearing < 112.5) {
    return 'E';
  } else if (normalizedBearing >= 112.5 && normalizedBearing < 157.5) {
    return 'SE';
  } else if (normalizedBearing >= 157.5 && normalizedBearing < 202.5) {
    return 'S';
  } else if (normalizedBearing >= 202.5 && normalizedBearing < 247.5) {
    return 'SW';
  } else if (normalizedBearing >= 247.5 && normalizedBearing < 292.5) {
    return 'W';
  } else {
    return 'NW';
  }
}

/**
 * 2点間の距離と方位を計算
 */
export function calculateDistanceAndDirection(
  from: Coordinates,
  to: Coordinates
): { distanceKm: number; direction8: Direction8; bearing: number } {
  const distanceKm = calculateDistance(from, to);
  const bearing = calculateBearing(from, to);
  const direction8 = bearingToDirection8(bearing);

  return { distanceKm, direction8, bearing };
}

