import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Trash2, Search, AlertCircle } from 'lucide-react';
import type { SearchFormData } from './SearchForm';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface SearchHistoryItem {
  id: number;
  birthDate: string;
  address: string;
  yearMonth: string;
  radiusKm: number;
  honmeisei: string;
  createdAt: string;
}

interface SearchHistoryProps {
  onReSearch?: (formData: SearchFormData) => void;
}

export function SearchHistory({ onReSearch }: SearchHistoryProps) {
  const [histories, setHistories] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistories = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/history?limit=20`);
      
      if (!response.ok) {
        throw new Error('検索履歴の取得に失敗しました');
      }

      const data = await response.json();
      setHistories(data.histories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この検索履歴を削除しますか？')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/history/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      // 履歴を再取得
      fetchHistories();
    } catch (err) {
      alert(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  const handleReSearch = (history: SearchHistoryItem) => {
    if (onReSearch) {
      onReSearch({
        birthDate: history.birthDate,
        address: history.address,
        yearMonth: history.yearMonth,
        radiusKm: history.radiusKm,
      });
    }
  };

  useEffect(() => {
    fetchHistories();
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

  const formatYearMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    return `${year}年${month}月`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          検索履歴
        </CardTitle>
        <CardDescription>最近の検索履歴から再検索できます（最大20件）</CardDescription>
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

        {!loading && !error && histories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>検索履歴がありません</p>
            <p className="text-sm mt-2">検索を実行すると、ここに履歴が表示されます</p>
          </div>
        )}

        {!loading && !error && histories.length > 0 && (
          <div className="space-y-3">
            {histories.map((history) => (
              <div
                key={history.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-primary">{history.honmeisei}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatYearMonth(history.yearMonth)}
                      </span>
                    </div>
                    <p className="text-sm">{history.address}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(history.createdAt)} • 半径 {history.radiusKm}km
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReSearch(history)}
                    >
                      <Search className="h-4 w-4 mr-1" />
                      再検索
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(history.id)}
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

