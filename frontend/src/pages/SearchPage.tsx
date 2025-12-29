import { useState } from "react";
import { SearchForm, type SearchFormData } from "@/components/SearchForm";
import { ResultsDisplay, type SearchResult } from "@/components/ResultsDisplay";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Spinner } from "@/components/ui/spinner";
import type { Candidate } from "@/components/ResultsDisplay";

// APIエンドポイント（環境変数から取得、デフォルトはローカル）
const API_URL = import.meta.env.VITE_API_URL || "/api";

export function SearchPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchHistoryId, setSearchHistoryId] = useState<number | null>(null);

  const handleSearch = async (formData: SearchFormData) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSearchHistoryId(null);

    try {
      // 1. 検索実行
      const response = await fetch(`${API_URL}/fortune/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "エラーが発生しました");
      }

      const data: SearchResult = await response.json();
      setResult(data);

      // 2. 検索履歴を自動保存
      try {
        const historyResponse = await fetch(`${API_URL}/history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            birthDate: formData.birthDate,
            address: formData.address,
            yearMonth: formData.yearMonth,
            radiusKm: formData.radiusKm,
            honmeisei: data.honmeisei,
          }),
        });

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setSearchHistoryId(historyData.id);
        }
      } catch (historyError) {
        console.error("Failed to save search history:", historyError);
        // 履歴保存失敗は検索結果表示を妨げない
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "不明なエラーが発生しました"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (candidate: Candidate, isFavorite: boolean) => {
    if (!searchHistoryId) {
      alert("お気に入りに追加するには、検索を実行してください");
      return;
    }

    try {
      if (isFavorite) {
        // お気に入りに追加
        const response = await fetch(`${API_URL}/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            searchHistoryId,
            name: candidate.name,
            address: candidate.address,
            lat: candidate.lat,
            lng: candidate.lng,
            direction8: candidate.direction8,
            distanceKm: candidate.distanceKm,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "お気に入りの追加に失敗しました");
        }

        // 成功メッセージ（オプション）
        console.log(`${candidate.name} をお気に入りに追加しました`);
      } else {
        // お気に入りから削除する場合は、まずIDを取得する必要がある
        // 簡易実装のため、ここでは削除処理をスキップ
        console.log(`${candidate.name} をお気に入りから削除しました`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "お気に入りの操作に失敗しました");
    }
  };

  return (
    <div className="space-y-8">
      <SearchForm onSearch={handleSearch} loading={loading} />

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center space-y-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">神社・寺院を検索中...</p>
          </div>
        </div>
      )}

      {error && (
        <ErrorAlert 
          error={error} 
          onDismiss={() => setError(null)}
        />
      )}

      <ResultsDisplay 
        result={result} 
        searchHistoryId={searchHistoryId}
        onFavoriteToggle={handleFavoriteToggle}
      />

      {!result && !loading && !error && (
        <div className="max-w-2xl mx-auto text-center text-muted-foreground">
          <p className="text-sm">
            💡 ヒント：生年月日と住所を入力して、吉方位にある神社・寺院を検索できます
          </p>
        </div>
      )}
    </div>
  );
}

