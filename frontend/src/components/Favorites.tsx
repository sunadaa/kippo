import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Trash2, AlertCircle, MapPin } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface FavoriteItem {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  direction8: string;
  distanceKm: number;
  createdAt: string;
  searchHistory?: {
    address: string;
    yearMonth: string;
  };
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

export function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/favorites`);
      
      if (!response.ok) {
        throw new Error('お気に入りの取得に失敗しました');
      }

      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このお気に入りを削除しますか？')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/favorites/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      // お気に入りを再取得
      fetchFavorites();
    } catch (err) {
      alert(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  const handleShowOnMap = (favorite: FavoriteItem) => {
    // Google Mapsで開く
    const url = `https://www.google.com/maps/search/?api=1&query=${favorite.lat},${favorite.lng}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          お気に入り
        </CardTitle>
        <CardDescription>お気に入りに登録した神社・寺院の一覧</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && favorites.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>お気に入りがありません</p>
            <p className="text-sm mt-2">検索結果からお気に入りに追加してください</p>
          </div>
        )}

        {!loading && !error && favorites.length > 0 && (
          <div className="space-y-3">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-bold">{favorite.name}</h3>
                    <p className="text-sm text-muted-foreground">{favorite.address}</p>
                    <div className="flex gap-2 flex-wrap items-center">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {DIRECTION_NAMES[favorite.direction8]}
                      </span>
                      <span className="text-sm font-mono">
                        {favorite.distanceKm.toFixed(2)} km
                      </span>
                      {favorite.searchHistory && (
                        <span className="text-xs text-muted-foreground">
                          from {favorite.searchHistory.address}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      登録日時: {formatDate(favorite.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShowOnMap(favorite)}
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      地図で表示
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(favorite.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

