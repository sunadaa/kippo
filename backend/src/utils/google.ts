/**
 * Google Maps API 連携ユーティリティ
 * - Geocoding API（住所 → 緯度経度）
 * - Places API（周辺の神社・寺院検索）
 */

import type { Coordinates } from './geo';

/**
 * 神社・寺院の情報
 */
export interface PlaceInfo {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

/**
 * Geocoding APIを使用して住所を座標に変換
 * 
 * @param address - 住所（例：「神奈川県横浜市○○」）
 * @returns 座標
 */
export async function geocodeAddress(address: string): Promise<Coordinates> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY is not set in environment variables');
  }

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.append('address', address);
  url.searchParams.append('key', apiKey);
  url.searchParams.append('language', 'ja');

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Geocoding API request failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
  }

  if (!data.results || data.results.length === 0) {
    throw new Error('No results found for the given address');
  }

  const location = data.results[0].geometry.location;
  
  return {
    lat: location.lat,
    lng: location.lng,
  };
}

/**
 * Places API（Nearby Search）を使用して周辺の神社・寺院を検索
 * 
 * @param center - 中心座標
 * @param radiusKm - 検索半径（km）
 * @returns 神社・寺院のリスト
 */
export async function searchNearbyPlaces(
  center: Coordinates,
  radiusKm: number
): Promise<PlaceInfo[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY is not set in environment variables');
  }

  // Places API (Nearby Search) は半径をメートルで指定
  const radiusMeters = radiusKm * 1000;

  // 神社と寺院の両方を検索するため、2回のリクエストを実行
  const shrineKeywords = ['神社', 'shrine'];
  const templeKeywords = ['寺', '寺院', 'temple'];

  const allPlaces: PlaceInfo[] = [];

  // 神社を検索
  for (const keyword of shrineKeywords) {
    const places = await searchByKeyword(center, radiusMeters, keyword, apiKey);
    allPlaces.push(...places);
  }

  // 寺院を検索
  for (const keyword of templeKeywords) {
    const places = await searchByKeyword(center, radiusMeters, keyword, apiKey);
    allPlaces.push(...places);
  }

  // 重複を除去（name + address で判定）
  const uniquePlaces = Array.from(
    new Map(allPlaces.map(place => [`${place.name}-${place.address}`, place])).values()
  );

  return uniquePlaces;
}

/**
 * Places APIでキーワード検索を実行
 */
async function searchByKeyword(
  center: Coordinates,
  radiusMeters: number,
  keyword: string,
  apiKey: string
): Promise<PlaceInfo[]> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
  url.searchParams.append('location', `${center.lat},${center.lng}`);
  url.searchParams.append('radius', radiusMeters.toString());
  url.searchParams.append('keyword', keyword);
  url.searchParams.append('key', apiKey);
  url.searchParams.append('language', 'ja');

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Places API request failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Places API failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
  }

  if (!data.results || data.results.length === 0) {
    return [];
  }

  return data.results.map((result: any) => ({
    name: result.name,
    address: result.vicinity || result.formatted_address || '',
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
  }));
}

