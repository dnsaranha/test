import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MediaItem, MediaType } from "@/utils/mediaParser";

type MediaFilterProps = {
  mediaItems: MediaItem[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  mediaType: MediaType;
};

export const MediaFilter: React.FC<MediaFilterProps> = ({
  mediaItems,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  mediaType
}) => {

  const getPlaceholderText = () => {
    switch (mediaType) {
      case 'tv': return 'Buscar canais...';
      case 'movie': return 'Buscar filmes...';
      case 'series': return 'Buscar séries...';
      default: return 'Buscar...';
    }
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      {/* Busca */}
      <div>
        <Input
          placeholder={getPlaceholderText()}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-muted-foreground">Filtros:</span>
        
        {/* Select de ordenação */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nome A-Z</SelectItem>
            <SelectItem value="name-desc">Nome Z-A</SelectItem>
            <SelectItem value="type">Tipo</SelectItem>
          </SelectContent>
        </Select>

      </div>

      {/* Estatísticas */}
      <div className="text-xs text-muted-foreground border-t pt-2">
        <span>{mediaItems.length} itens</span>
        {searchTerm && (
          <span> • Busca ativa</span>
        )}
      </div>
    </div>
  );
};