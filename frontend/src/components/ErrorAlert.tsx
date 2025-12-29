import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, XCircle, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorAlertProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorAlert({ error, onRetry, onDismiss }: ErrorAlertProps) {
  // エラーの種類を判定
  const isNetworkError = error.toLowerCase().includes('network') || 
                         error.toLowerCase().includes('接続') ||
                         error.toLowerCase().includes('failed to fetch');
  
  const isAddressError = error.toLowerCase().includes('住所') || 
                         error.toLowerCase().includes('address');

  const getIcon = () => {
    if (isNetworkError) return <WifiOff className="h-4 w-4" />;
    if (isAddressError) return <AlertCircle className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  const getTitle = () => {
    if (isNetworkError) return "接続エラー";
    if (isAddressError) return "住所エラー";
    return "エラー";
  };

  const getDescription = () => {
    if (isNetworkError) {
      return "インターネット接続を確認してください。";
    }
    if (isAddressError) {
      return "住所が見つかりませんでした。別の住所でお試しください。";
    }
    return error;
  };

  return (
    <Alert variant="destructive" className="max-w-2xl mx-auto">
      {getIcon()}
      <AlertTitle>{getTitle()}</AlertTitle>
      <AlertDescription>
        <p className="mb-3">{getDescription()}</p>
        {error !== getDescription() && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer">詳細を表示</summary>
            <p className="mt-2 font-mono">{error}</p>
          </details>
        )}
        <div className="flex gap-2 mt-4">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              再試行
            </Button>
          )}
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              閉じる
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

