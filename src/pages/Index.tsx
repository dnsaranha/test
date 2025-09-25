
import React, { useState, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MediaPlayer } from "@/components/MediaPlayer";
import { MediaGrid } from "@/components/MediaGrid";
import { ChannelsList } from "@/components/ChannelsList";
import { MediaFilter } from "@/components/MediaFilter";
import { useMediaContext } from "@/contexts/MediaContext";
import { 
  MediaItem, 
  filterMediaByType
} from "@/utils/mediaParser";

const Index: React.FC = () => {
  const { allMedia, loading, mediaCounts } = useMediaContext();
  
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedMediaType, setSelectedMediaType] = useState<'all' | 'tv' | 'movie' | 'series'>('all');

  // Processar todas as mídias (TV, filmes e séries)
  const processedMedia = useMemo(() => {
    let filtered = [...allMedia];
    
    // Aplicar filtro por tipo de mídia
    if (selectedMediaType !== 'all') {
      filtered = filterMediaByType(filtered, selectedMediaType);
    }
    
    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
    
     return filtered;
   }, [allMedia, searchTerm, sortBy, selectedMediaType]);

  const handleMediaSelect = (media: MediaItem) => {
    setSelectedMedia(media);
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1 p-6">
            <SidebarTrigger />
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Centro de Mídia
            </h1>
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg">Carregando conteúdo...</p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col h-screen">
          {/* Header e Player fixos - sem scroll */}
          <div className="flex-shrink-0 p-6 border-b bg-background">
            <SidebarTrigger />
            
            {/* Header */}
            <div className="space-y-2 mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                📺 Centro de Mídia
              </h1>
              <p className="text-muted-foreground">
                Acesse TV ao vivo, filmes e séries • Total: {allMedia.length} itens
              </p>
              <div className="flex gap-4 text-sm">
                <button 
                  onClick={() => setSelectedMediaType('all')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    selectedMediaType === 'all' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Todos: {allMedia.length}
                </button>
                <button 
                  onClick={() => setSelectedMediaType('tv')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    selectedMediaType === 'tv' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  📺 TV: {mediaCounts.tv}
                </button>
                <button 
                  onClick={() => setSelectedMediaType('movie')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    selectedMediaType === 'movie' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  🎬 Filmes: {mediaCounts.movie}
                </button>
                <button 
                  onClick={() => setSelectedMediaType('series')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    selectedMediaType === 'series' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  📺 Séries: {mediaCounts.series}
                </button>
              </div>
            </div>

            {/* Player foi removido desta seção de cabeçalho */}
          </div>

          {/* Conteúdo principal com layout de 2 colunas */}
          <div className="flex-1 p-6 overflow-hidden grid lg:grid-cols-3 gap-6">

            {/* Coluna Esquerda (2/3): Player ou Mensagem de Boas-Vindas */}
            <div className="lg:col-span-2 h-full flex flex-col">
              {selectedMedia ? (
                <MediaPlayer 
                  key={selectedMedia.id} 
                  media={selectedMedia} 
                  autoPlay={selectedMedia.type === 'tv'} 
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-card border rounded-lg">
                  <div className="text-center text-muted-foreground p-8">
                    <h2 className="text-2xl font-semibold mb-2">Bem-vindo ao Centro de Mídia</h2>
                    <p>Selecione um canal, filme ou série da lista à direita para começar.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Coluna Direita (1/3): Filtro e Lista de Mídia */}
            <div className="lg:col-span-1 h-full flex flex-col gap-4">
              <MediaFilter
                mediaItems={allMedia}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortBy={sortBy}
                onSortChange={setSortBy}
                mediaType="tv"
              />
              <ScrollArea className="flex-1 border rounded-lg">
                <ChannelsList
                  channels={processedMedia}
                  selectedChannel={selectedMedia}
                  onChannelSelect={handleMediaSelect}
                />
              </ScrollArea>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
