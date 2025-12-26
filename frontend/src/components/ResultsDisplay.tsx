import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
}

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

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  if (!result) {
    return null;
  }

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>住所</TableHead>
                  <TableHead className="text-center">方位</TableHead>
                  <TableHead className="text-right">距離</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.candidates.map((candidate, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{candidate.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>検索範囲を広げるか、別の住所で検索してください。</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 地図表示エリア（将来実装） */}
      <Card>
        <CardHeader>
          <CardTitle>地図</CardTitle>
          <CardDescription>候補の位置を確認</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            id="map"
            className="w-full h-96 bg-muted rounded-md flex items-center justify-center"
          >
            <p className="text-muted-foreground">地図表示は今後実装予定です</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

