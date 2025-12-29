import { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps';
import type { Candidate } from './ResultsDisplay';

interface MapDisplayProps {
  center: { lat: number; lng: number };
  candidates: Candidate[];
  onMarkerClick?: (candidate: Candidate, index: number) => void;
  highlightedIndex?: number;
}

const DIRECTION_COLORS: Record<string, string> = {
  N: '#3b82f6',   // blue
  NE: '#a855f7',  // purple
  E: '#10b981',   // green
  SE: '#f59e0b',  // amber
  S: '#ef4444',   // red
  SW: '#f97316',  // orange
  W: '#06b6d4',   // cyan
  NW: '#8b5cf6',  // violet
};

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

export function MapDisplay({ center, candidates, onMarkerClick, highlightedIndex }: MapDisplayProps) {
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // highlightedIndexが変更されたら、そのマーカーを選択状態にする
  useEffect(() => {
    if (highlightedIndex !== undefined && highlightedIndex >= 0) {
      setSelectedMarker(highlightedIndex);
    }
  }, [highlightedIndex]);

  if (!apiKey) {
    return (
      <div className="w-full h-96 bg-muted rounded-md flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground font-medium">地図を表示するには Google Maps API キーが必要です</p>
          <p className="text-sm text-muted-foreground mt-2">
            環境変数 <code className="bg-muted-foreground/10 px-2 py-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> を設定してください
          </p>
        </div>
      </div>
    );
  }

  const handleMarkerClick = (candidate: Candidate, index: number) => {
    setSelectedMarker(index);
    if (onMarkerClick) {
      onMarkerClick(candidate, index);
    }
  };

  return (
    <APIProvider apiKey={apiKey}>
      <div className="w-full h-96 md:h-[500px] rounded-md overflow-hidden">
        <Map
          defaultCenter={center}
          defaultZoom={12}
          mapId="kippo-map"
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {/* 中心点マーカー（ユーザーの住所） */}
          <AdvancedMarker position={center}>
            <Pin
              background="#1f2937"
              borderColor="#fff"
              glyphColor="#fff"
              scale={1.2}
            />
          </AdvancedMarker>

          {/* 候補神社・寺院のマーカー */}
          {candidates.map((candidate, index) => (
            <AdvancedMarker
              key={index}
              position={{ lat: candidate.lat, lng: candidate.lng }}
              onClick={() => handleMarkerClick(candidate, index)}
            >
              <Pin
                background={DIRECTION_COLORS[candidate.direction8] || '#6b7280'}
                borderColor="#fff"
                glyphColor="#fff"
                scale={highlightedIndex === index ? 1.4 : 1.0}
              >
                <span className="text-xs font-bold">{index + 1}</span>
              </Pin>
            </AdvancedMarker>
          ))}

          {/* InfoWindow */}
          {selectedMarker !== null && candidates[selectedMarker] && (
            <InfoWindow
              position={{
                lat: candidates[selectedMarker].lat,
                lng: candidates[selectedMarker].lng,
              }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-sm mb-1">{candidates[selectedMarker].name}</h3>
                <p className="text-xs text-gray-600 mb-2">{candidates[selectedMarker].address}</p>
                <div className="flex gap-2 text-xs">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                    {DIRECTION_NAMES[candidates[selectedMarker].direction8]}
                  </span>
                  <span className="font-mono">
                    {candidates[selectedMarker].distanceKm.toFixed(2)} km
                  </span>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}

