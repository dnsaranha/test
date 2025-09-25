import React, { useMemo, useState } from "react";
import { MediaItem } from "@/utils/mediaParser";
import { Search, Play, Tv, Film, Monitor } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

type ChannelsListProps = {
  channels: MediaItem[];
  selectedChannel?: MediaItem;
  onChannelSelect: (channel: MediaItem) => void;
  className?: string;
};

export const ChannelsList: React.FC<ChannelsListProps> = ({
  channels,
  selectedChannel,
  onChannelSelect,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filtrar e categorizar canais
  const { filteredChannels, categories } = useMemo(() => {
    const cats = ["all", ...Array.from(new Set(channels.map(c => c.category))).sort()];
    
    let filtered = channels;
    
    // Filtro por categoria
    if (selectedCategory !== "all") {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }
    
    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term)
      );
    }
    
    return { filteredChannels: filtered, categories: cats };
  }, [channels, searchTerm, selectedCategory]);

  // Ícone por tipo de mídia
  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'tv': return <Tv size={16} />;
      case 'movie': return <Film size={16} />;
      case 'series': return <Monitor size={16} />;
      default: return <Play size={16} />;
    }
  };

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Tv size={20} />
            Canais ({filteredChannels.length})
          </h3>
          
          {/* Busca */}
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar canais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categorias */}
          <div className="flex flex-wrap gap-1 mb-2">
            {categories.slice(0, 6).map((category) => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="h-7 text-xs"
              >
                {category === "all" ? "Todos" : category}
              </Button>
            ))}
          </div>
          
          {categories.length > 6 && (
            <div className="text-xs text-muted-foreground">
              +{categories.length - 6} categorias
            </div>
          )}
        </div>

        {/* Lista de Canais */}
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {filteredChannels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => onChannelSelect(channel)}
                className={`
                  group cursor-pointer rounded-lg border p-3 transition-all hover:shadow-md
                  ${selectedChannel?.id === channel.id 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Logo do Canal */}
                  <div className="flex-shrink-0">
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-10 h-10 object-contain bg-muted rounded border"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {channel.name}
                      </h4>
                      <div className="flex-shrink-0">
                        {getMediaIcon(channel.type)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {channel.category}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                      >
                        {channel.type === 'tv' ? 'AO VIVO' : 
                         channel.type === 'movie' ? 'FILME' : 'SÉRIE'}
                      </Badge>
                    </div>

                    {/* Status de Qualidade (simulado) */}
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs text-muted-foreground">Online</span>
                    </div>
                  </div>
                </div>

                {/* Indicador de Seleção */}
                {selectedChannel?.id === channel.id && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                    <Play size={12} />
                    <span>Reproduzindo agora</span>
                  </div>
                )}
              </div>
            ))}

            {filteredChannels.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Tv size={48} className="mx-auto mb-2 opacity-50" />
                <p>Nenhum canal encontrado</p>
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="mt-2"
                  >
                    Limpar busca
                  </Button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};