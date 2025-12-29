import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SearchFormProps {
  onSearch: (data: SearchFormData) => void;
  loading: boolean;
}

export interface SearchFormData {
  birthDate: string;
  address: string;
  yearMonth: string;
  radiusKm: number;
}

export function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [searchParams] = useSearchParams();
  
  // クエリパラメータから初期値を取得、なければデフォルト値
  const [birthDate, setBirthDate] = useState(searchParams.get('birthDate') || '1978-03-10');
  const [address, setAddress] = useState(searchParams.get('address') || '東京都渋谷区');
  const [yearMonth, setYearMonth] = useState(searchParams.get('yearMonth') || '2025-02');
  const [radiusKm, setRadiusKm] = useState(Number(searchParams.get('radiusKm')) || 10);

  // クエリパラメータが変更されたら自動的に検索を実行
  useEffect(() => {
    if (searchParams.has('birthDate') && searchParams.has('address')) {
      // クエリパラメータから再検索
      const formData = {
        birthDate: searchParams.get('birthDate') || birthDate,
        address: searchParams.get('address') || address,
        yearMonth: searchParams.get('yearMonth') || yearMonth,
        radiusKm: Number(searchParams.get('radiusKm')) || radiusKm,
      };
      onSearch(formData);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ birthDate, address, yearMonth, radiusKm });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl">吉方位神社仏閣プランナー</CardTitle>
        <CardDescription>
          あなたの生年月日と住所から、吉方位にある神社・寺院をご案内します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="birthDate">生年月日</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">住所</Label>
            <Input
              id="address"
              type="text"
              placeholder="例：東京都渋谷区"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearMonth">対象年月</Label>
              <Input
                id="yearMonth"
                type="month"
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="radiusKm">検索半径（km）</Label>
              <Input
                id="radiusKm"
                type="number"
                min="1"
                max="100"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            size="lg"
          >
            {loading ? '検索中...' : '吉方位を検索'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

