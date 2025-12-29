import { SearchHistory } from '@/components/SearchHistory';
import { useNavigate } from 'react-router-dom';
import type { SearchFormData } from '@/components/SearchForm';

export function HistoryPage() {
  const navigate = useNavigate();

  const handleReSearch = (formData: SearchFormData) => {
    // 検索フォームのデータをクエリパラメータとして渡す
    const params = new URLSearchParams({
      birthDate: formData.birthDate,
      address: formData.address,
      yearMonth: formData.yearMonth,
      radiusKm: formData.radiusKm.toString(),
    });
    
    navigate(`/?${params.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <SearchHistory onReSearch={handleReSearch} />
    </div>
  );
}

