import { useState } from 'react'
import './App.css'
import { SearchForm, type SearchFormData } from './components/SearchForm'
import { ResultsDisplay, type SearchResult } from './components/ResultsDisplay'

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (formData: SearchFormData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/fortune/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'エラーが発生しました');
      }

      const data: SearchResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
      <div className="container mx-auto space-y-8">
        <SearchForm onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">エラー</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <ResultsDisplay result={result} />

        {!result && !loading && !error && (
          <div className="max-w-2xl mx-auto text-center text-muted-foreground">
            <p className="text-sm">
              💡 ヒント：生年月日と住所を入力して、吉方位にある神社・寺院を検索できます
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

