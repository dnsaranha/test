import React from "react";
import { MediaItem } from "@/utils/mediaParser";

type MediaGridProps = {
  mediaItems: MediaItem[];
  selectedMedia: MediaItem | null;
  onSelectMedia: (media: MediaItem) => void;
  itemsPerRow?: number;
};

export const MediaGrid: React.FC<MediaGridProps> = ({ 
  mediaItems, 
  selectedMedia, 
  onSelectMedia,
  itemsPerRow = 6 
}) => {
  const getGridCols = () => {
    switch (itemsPerRow) {
      case 4: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
      case 5: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
      case 6: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
      case 8: return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8';
      default: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tv': return '📺';
      case 'movie': return '🎬';
      case 'series': return '📺';
      default: return '📱';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tv': return 'TV';
      case 'movie': return 'Filme';
      case 'series': return 'Série';
      default: return 'Mídia';
    }
  };

  return (
    <div className={`grid ${getGridCols()} gap-4`}>
      {mediaItems.map((media, index) => (
        <button
          key={`${media.id}-${index}`}
          onClick={() => onSelectMedia(media)}
          className={`group relative flex flex-col items-center p-3 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg ${
            selectedMedia?.id === media.id 
              ? "ring-2 ring-primary bg-primary/10" 
              : "bg-card hover:bg-accent"
          }`}
        >
          {/* Imagem/Logo */}
          <div className="relative w-full aspect-square mb-2 overflow-hidden rounded">
            <img 
              src={media.logo} 
              alt={media.name} 
              className="w-full h-full object-cover bg-muted"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/100x100?text=' + getTypeIcon(media.type);
              }}
            />
            
            {/* Badge do tipo */}
            <div className="absolute top-1 right-1 text-xs bg-black/70 text-white px-1.5 py-0.5 rounded">
              {getTypeIcon(media.type)}
            </div>
            
            {/* Overlay de hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-lg">
                ▶️
              </div>
            </div>
          </div>
          
          {/* Informações */}
          <div className="w-full text-center space-y-1">
            <h3 className="font-medium text-sm line-clamp-2 leading-tight">{media.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{media.category}</p>
            <div className="text-xs text-primary font-medium">
              {getTypeLabel(media.type)}
            </div>
          </div>
          
          {/* Indicador de seleção */}
          {selectedMedia?.id === media.id && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};