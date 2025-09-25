import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MediaType } from "@/utils/mediaParser";
import { Search, Filter, X } from "lucide-react";

type SimpleMediaFilterProps = {
  mediaType: 'all' | MediaType;
  setMediaType: (type: 'all' | MediaType) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  totalCount: number;
  filteredCount: number;
};

export const SimpleMediaFilter: React.FC<SimpleMediaFilterProps> = ({
  mediaType,
  setMediaType,
  searchTerm,
  setSearchTerm,
  totalCount,
  filteredCount
}) => {
  const clearFilters = () => {
    setSearchTerm("");
    setMediaType('all');
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Filter size={16} />
          Filtros
        </h3>
        {(searchTerm || mediaType !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={14} className="mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Busca */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar canais, filmes ou séries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tipo de Mídia */}
      <div>
        <label className="text-sm font-medium mb-2 block">Tipo de Mídia:</label>
        <Select value={mediaType} onValueChange={(value: 'all' | MediaType) => setMediaType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="tv">📺 TV ao Vivo</SelectItem>
            <SelectItem value="movie">🎬 Filmes</SelectItem>
            <SelectItem value="series">📺 Séries</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Estatísticas Simplificadas */}
      <div className="text-xs text-muted-foreground border-t pt-3">
        <div className="flex justify-between items-center">
          <span>
            Exibindo {filteredCount} de {totalCount} itens
          </span>
        </div>
      </div>
    </div>
  );
};