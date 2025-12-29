import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MapDisplay } from './MapDisplay';
import { Heart, ArrowUpDown } from 'lucide-react';

export interface Candidate {
  name: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  direction8: string;
}

export interface SearchResult {
  honmeisei: string;
  luckyDirections: string[];
  center: { lat: number; lng: number };
  candidates: Candidate[];
}

interface ResultsDisplayProps {
  result: SearchResult | null;
  searchHistoryId?: number | null;
  onFavoriteToggle?: (candidate: Candidate, isFavorite: boolean) => void;
}

type SortField = 'name' | 'distance' | 'direction';
type SortOrder = 'asc' | 'desc';

const DIRECTION_NAMES: Record<string, string> = {
  N: '北',
  NE: '北東',
  E: '東',
  SE: '南東',
  S: '南',
  SW: '南西',
  W: '西',
  NW: '北西',
};

export function ResultsDisplay({ result, searchHistoryId, onFavoriteToggle }: ResultsDisplayProps) {
  const [sortField, setSortField] = useState<SortField>('distance');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  if (!result) {
    return null;
  }

  // ソート処理
  const sortedCandidates = [...result.candidates].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name, 'ja');
        break;
      case 'distance':
        comparison = a.distanceKm - b.distanceKm;
        break;
      case 'direction':
        const dirOrder = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        comparison = dirOrder.indexOf(a.direction8) - dirOrder.indexOf(b.direction8);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleRowHover = (index: number) => {
    setHighlightedIndex(index);
  };

  const handleRowLeave = () => {
    setHighlightedIndex(-1);
  };

  const handleMarkerClick = (candidate: Candidate, index: number) => {
    // マーカークリック時にテーブルをスクロール（将来実装）
    console.log('Marker clicked:', candidate, index);
  };

  const handleFavoriteClick = (candidate: Candidate) => {
    const key = candidate.name;
    const isFavorite = favorites.has(key);
    
    if (isFavorite) {
      favorites.delete(key);
      setFavorites(new Set(favorites));
    } else {
      favorites.add(key);
      setFavorites(new Set(favorites));
    }
    
    if (onFavoriteToggle) {
      onFavoriteToggle(candidate, !isFavorite);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      {/* 本命星と吉方位の表示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>あなたの本命星</CardTitle>
            <CardDescription>生年月日から算出</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{result.honmeisei}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>吉方位</CardTitle>
            <CardDescription>この月の吉方位</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.luckyDirections.map((dir) => (
                <span
                  key={dir}
                  className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-lg font-semibold text-primary"
                >
                  {DIRECTION_NAMES[dir]}（{dir}）
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 候補神社・寺院のリスト */}
      <Card>
        <CardHeader>
          <CardTitle>吉方位にある神社・寺院</CardTitle>
          <CardDescription>
            {result.candidates.length > 0
              ? `${result.candidates.length}件の候補が見つかりました（距離順）`
              : '吉方位に候補が見つかりませんでした'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result.candidates.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleSort('name')}
                      >
                        名称
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">住所</TableHead>
                    <TableHead className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleSort('direction')}
                      >
                        方位
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleSort('distance')}
                      >
                        距離
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    {searchHistoryId && <TableHead className="w-12"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCandidates.map((candidate, index) => (
                    <TableRow
                      key={index}
                      className={`cursor-pointer transition-colors ${
                        highlightedIndex === index ? 'bg-muted/50' : ''
                      }`}
                      onMouseEnter={() => handleRowHover(index)}
                      onMouseLeave={handleRowLeave}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                        {candidate.address}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {DIRECTION_NAMES[candidate.direction8]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {candidate.distanceKm.toFixed(2)} km
                      </TableCell>
                      {searchHistoryId && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleFavoriteClick(candidate)}
                          >
                            <Heart
                              className={`h-4 w-4 ${
                                favorites.has(candidate.name)
                                  ? 'fill-red-500 text-red-500'
                                  : ''
                              }`}
                            />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>検索範囲を広げるか、別の住所で検索してください。</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 地図表示エリア */}
      <Card>
        <CardHeader>
          <CardTitle>地図</CardTitle>
          <CardDescription>候補の位置を確認</CardDescription>
        </CardHeader>
        <CardContent>
          <MapDisplay
            center={result.center}
            candidates={sortedCandidates}
            onMarkerClick={handleMarkerClick}
            highlightedIndex={highlightedIndex}
          />
        </CardContent>
      </Card>
    </div>
  );
}

