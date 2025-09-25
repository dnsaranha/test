import React, { useState, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MediaPlayer } from "@/components/MediaPlayer";
import { MediaGrid } from "@/components/MediaGrid";
import { MediaFilter } from "@/components/MediaFilter";
import { useMediaLoad } from "@/hooks/useMediaLoad";
import { 
  MediaItem, 
  MediaType, 
  filterMediaByType, 
  filterMediaByCategory 
} from "@/utils/mediaParser";

const TvOnlinePage: React.FC = () => {
  const { allMedia, loading } = useMediaLoad();
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [activeTab, setActiveTab] = useState<MediaType>('tv');
  
  // Estados para filtros por tipo de mídia
  const [searchTerms, setSearchTerms] = useState<Record<MediaType, string>>({
    tv: '', movie: '', series: ''
  });
  const [selectedCategories, setSelectedCategories] = useState<Record<MediaType, string[]>>({
    tv: [], movie: [], series: []
  });
  const [sortBy, setSortBy] = useState<Record<MediaType, string>>({
    tv: 'name', movie: 'name', series: 'name'
  });
  
  // Selecionar primeiro item quando carregamento termina
  React.useEffect(() => {
    if (!loading && !selectedMedia && allMedia.length > 0) {
      const firstTvItem = allMedia.find(item => item.type === 'tv');
      if (firstTvItem) {
        setSelectedMedia(firstTvItem);
      }
    }
  }, [loading, allMedia, selectedMedia]);

  // Processar mídia filtrada para a aba ativa
  const processedMedia = useMemo(() => {
    let filtered = filterMediaByType(allMedia, activeTab);
    
    // Aplicar filtro de categoria
    const activeCategories = selectedCategories[activeTab];
    if (activeCategories.length > 0) {
      filtered = filterMediaByCategory(filtered, activeCategories);
    }
    
    // Aplicar filtro de busca
    const searchTerm = searchTerms[activeTab];
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar ordenação
    const sortMethod = sortBy[activeTab];
    filtered.sort((a, b) => {
      switch (sortMethod) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [allMedia, activeTab, selectedCategories, searchTerms, sortBy]);

  // Handlers para filtros
  const handleSearchChange = (term: string) => {
    setSearchTerms(prev => ({ ...prev, [activeTab]: term }));
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].includes(category)
        ? prev[activeTab].filter(c => c !== category)
        : [...prev[activeTab], category]
    }));
  };

  const handleSortChange = (sort: string) => {
    setSortBy(prev => ({ ...prev, [activeTab]: sort }));
  };

  const handleMediaSelect = (media: MediaItem) => {
    setSelectedMedia(media);
  };

  const handleTabChange = (tab: string) => {
    const newTab = tab as MediaType;
    setActiveTab(newTab);
    
    // Selecionar primeiro item do novo tipo se nenhum estiver selecionado
    if (!selectedMedia || selectedMedia.type !== newTab) {
      const firstItem = filterMediaByType(allMedia, newTab)[0];
      if (firstItem) {
        setSelectedMedia(firstItem);
      }
    }
  };

  // Contar itens por tipo
  const mediaCounts = useMemo(() => ({
    tv: filterMediaByType(allMedia, 'tv').length,
    movie: filterMediaByType(allMedia, 'movie').length,
    series: filterMediaByType(allMedia, 'series').length
  }), [allMedia]);

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
              <p className="text-sm text-muted-foreground mt-2">Processando listas de mídia</p>
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
          <div className="flex-shrink-0 p-6 pb-0">
            <SidebarTrigger />
            
            {/* Header */}
            <div className="space-y-2 mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Centro de Mídia
              </h1>
              <p className="text-muted-foreground">
                Acesse TV ao vivo, filmes e séries em um só lugar
              </p>
            </div>

            {/* Player fixo */}
            {selectedMedia && (
              <div className="bg-card rounded-lg p-6 border mb-6">
                <MediaPlayer 
                  key={selectedMedia.id} 
                  media={selectedMedia} 
                  autoPlay={selectedMedia.type === 'tv'} 
                />
              </div>
            )}

            {/* Tabs de navegação */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="tv" className="flex items-center gap-2">
                  📺 TV Online
                  <span className="bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded">
                    {mediaCounts.tv}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="movie" className="flex items-center gap-2">
                  🎬 Filmes
                  <span className="bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded">
                    {mediaCounts.movie}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="series" className="flex items-center gap-2">
                  📺 Séries
                  <span className="bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded">
                    {mediaCounts.series}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Área com scroll para conteúdo das abas */}
          <div className="flex-1 px-6 pb-6">
            <ScrollArea className="h-full">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                {/* Conteúdo das abas */}
                <TabsContent value="tv" className="space-y-4 mt-0">
                  <div className="grid lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                      <MediaFilter
                        mediaItems={filterMediaByType(allMedia, 'tv')}
                        searchTerm={searchTerms.tv}
                        onSearchChange={handleSearchChange}
                        selectedCategories={selectedCategories.tv}
                        onCategoryToggle={handleCategoryToggle}
                        sortBy={sortBy.tv}
                        onSortChange={handleSortChange}
                        mediaType="tv"
                      />
                    </div>
                    <div className="lg:col-span-3">
                      <MediaGrid
                        mediaItems={processedMedia}
                        selectedMedia={selectedMedia}
                        onSelectMedia={handleMediaSelect}
                        itemsPerRow={5}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="movie" className="space-y-4 mt-0">
                  <div className="grid lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                      <MediaFilter
                        mediaItems={filterMediaByType(allMedia, 'movie')}
                        searchTerm={searchTerms.movie}
                        onSearchChange={handleSearchChange}
                        selectedCategories={selectedCategories.movie}
                        onCategoryToggle={handleCategoryToggle}
                        sortBy={sortBy.movie}
                        onSortChange={handleSortChange}
                        mediaType="movie"
                      />
                    </div>
                    <div className="lg:col-span-3">
                      <MediaGrid
                        mediaItems={processedMedia}
                        selectedMedia={selectedMedia}
                        onSelectMedia={handleMediaSelect}
                        itemsPerRow={4}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="series" className="space-y-4 mt-0">
                  <div className="grid lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                      <MediaFilter
                        mediaItems={filterMediaByType(allMedia, 'series')}
                        searchTerm={searchTerms.series}
                        onSearchChange={handleSearchChange}
                        selectedCategories={selectedCategories.series}
                        onCategoryToggle={handleCategoryToggle}
                        sortBy={sortBy.series}
                        onSortChange={handleSortChange}
                        mediaType="series"
                      />
                    </div>
                    <div className="lg:col-span-3">
                      <MediaGrid
                        mediaItems={processedMedia}
                        selectedMedia={selectedMedia}
                        onSelectMedia={handleMediaSelect}
                        itemsPerRow={4}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Footer com informações */}
              <div className="mt-8 p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">
                  Fontes: ManoTV, Pluto TV e outras listas públicas. A disponibilidade pode variar.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total: {allMedia.length} itens • TV: {mediaCounts.tv} • Filmes: {mediaCounts.movie} • Séries: {mediaCounts.series}
                </p>
              </div>
            </ScrollArea>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default TvOnlinePage;