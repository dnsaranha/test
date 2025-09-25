
import React, { useState, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MediaPlayer } from "@/components/MediaPlayer";
import { MediaGrid } from "@/components/MediaGrid";
import { MediaFilter } from "@/components/MediaFilter";
import { useMediaLoad } from "@/hooks/useMediaLoad";
import { 
  MediaItem, 
  filterMediaByType, 
  filterMediaByCategory 
} from "@/utils/mediaParser";

const SeriesPage: React.FC = () => {
  const { allMedia, loading } = useMediaLoad();
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name');

  // Processar mídia filtrada
  const processedMedia = useMemo(() => {
    let filtered = filterMediaByType(allMedia, 'series');
    
    // Aplicar filtro de categoria
    if (selectedCategories.length > 0) {
      filtered = filterMediaByCategory(filtered, selectedCategories);
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
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [allMedia, selectedCategories, searchTerm, sortBy]);

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
              Séries
            </h1>
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg">Carregando séries...</p>
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
                📺 Séries
              </h1>
              <p className="text-muted-foreground">
                Explore nossa coleção de séries ({processedMedia.length} títulos)
              </p>
            </div>

            {/* Player fixo */}
            {selectedMedia && (
              <div className="bg-card rounded-lg p-6 border mb-6">
                <MediaPlayer 
                  key={selectedMedia.id} 
                  media={selectedMedia} 
                  autoPlay={false} 
                />
              </div>
            )}
          </div>

          {/* Área com scroll para conteúdo */}
          <div className="flex-1 px-6 pb-6">
            <ScrollArea className="h-full">
              <div className="grid lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <MediaFilter
                    mediaItems={filterMediaByType(allMedia, 'series')}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedCategories={selectedCategories}
                    onCategoryToggle={(category) => {
                      setSelectedCategories(prev => 
                        prev.includes(category)
                          ? prev.filter(c => c !== category)
                          : [...prev, category]
                      );
                    }}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
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
            </ScrollArea>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SeriesPage;
