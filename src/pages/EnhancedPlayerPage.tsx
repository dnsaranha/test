import React, { useState, useMemo, useCallback } from "react";
import { useMediaContext } from "@/contexts/MediaContext";
import { MediaItem, MediaType } from "@/utils/mediaParser";
import { EnhancedVideoPlayer } from "@/components/EnhancedVideoPlayer";
import { ChannelsList } from "@/components/ChannelsList";
import { SimpleMediaFilter } from "@/components/SimpleMediaFilter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Tv, Link as LinkIcon, Maximize2, Minimize2, PanelRightOpen } from "lucide-react";
import { toast } from "sonner";

const EnhancedPlayerPage: React.FC = () => {
  const { allMedia, loading } = useMediaContext();

  // Estados
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [directLink, setDirectLink] = useState("");
  const [activeTab, setActiveTab] = useState<"channels" | "direct">("channels");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFsSidebarVisible, setIsFsSidebarVisible] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);

  // Filtros
  const [mediaType, setMediaType] = useState<'all' | MediaType>('tv');
  const [searchTerm, setSearchTerm] = useState("");

  // Mídia filtrada e otimizada
  const filteredMedia = useMemo(() => {
    let filtered = allMedia;

    // Filtrar por tipo
    if (mediaType !== 'all') {
      filtered = filtered.filter(item => item.type === mediaType);
    }

    // Filtrar por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [allMedia, mediaType, searchTerm]);

  // Handlers
  const handleChannelSelect = useCallback((media: MediaItem) => {
    setSelectedMedia(media);
    setActiveTab("channels");
    setPlayerError(null);
    toast.success(`Reproduzindo: ${media.name}`);
  }, []);

  const handleDirectPlay = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const url = directLink.trim();
    if (!url) return;

    // Para MP4, abrir em nova aba para contornar restrições de player embarcado
    if (url.endsWith('.mp4')) {
      window.open(url, '_blank', 'noopener,noreferrer');
      toast.info("O vídeo está sendo aberto em uma nova aba.");
      return;
    }

    // Para outros links (HLS, etc.), tentar reproduzir no player
    const directMedia: MediaItem = {
      id: `direct-${Date.now()}`,
      name: "Link Direto",
      url: url,
      logo: "/placeholder.svg",
      category: "Direto",
      type: "tv" // Assumir TV, já que não temos metadados
    };

    setSelectedMedia(directMedia);
    setActiveTab("direct");
    setPlayerError(null);
    toast.success("Tentando reproduzir o link direto...");
  }, [directLink]);

  const handlePlayerError = useCallback((error: string) => {
    setPlayerError(error);
    toast.error(`Erro no reprodutor: ${error}`);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Effect para detectar mudanças de fullscreen
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1 p-6">
            <SidebarTrigger />
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Carregando canais...</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // Layout Fullscreen
  if (isFullscreen && selectedMedia) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex">
        <div className="flex-1">
          <EnhancedVideoPlayer
            src={selectedMedia.url}
            poster={selectedMedia.logo}
            autoPlay={true}
            onError={handlePlayerError}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
        </div>

        {isFsSidebarVisible && (
          <div className="w-80 bg-background border-l flex flex-col">
            <ChannelsList
              channels={filteredMedia}
              selectedChannel={selectedMedia}
              onChannelSelect={handleChannelSelect}
            />
          </div>
        )}

        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            onClick={() => setIsFsSidebarVisible(!isFsSidebarVisible)}
            variant="secondary"
            size="sm"
          >
            <PanelRightOpen size={16} />
          </Button>
          <Button
            onClick={toggleFullscreen}
            variant="secondary"
            size="sm"
          >
            <Minimize2 size={16} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6">
          <SidebarTrigger />
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Reprodutor Avançado</h1>
            <p className="text-muted-foreground">
              Suporte completo a HLS, DASH, MP4/WebM com lista de canais visível
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
            {/* Player Principal */}
            <div className="lg:col-span-2 space-y-4">
              {selectedMedia ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">{selectedMedia.name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedMedia.category}</p>
                    </div>
                    <Button
                      onClick={toggleFullscreen}
                      variant="outline"
                      size="sm"
                    >
                      <Maximize2 size={16} className="mr-2" />
                      Tela Cheia
                    </Button>
                  </div>
                  
                  <EnhancedVideoPlayer
                    src={selectedMedia.url}
                    poster={selectedMedia.logo}
                    autoPlay={true}
                    onError={handlePlayerError}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                  />

                  {playerError && (
                    <Card className="border-destructive">
                      <CardContent className="p-4">
                        <p className="text-destructive text-sm">{playerError}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="h-full">
                  <CardContent className="p-8 h-full flex flex-col items-center justify-center text-center">
                    <Tv size={64} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Selecione um Canal</h3>
                    <p className="text-muted-foreground mb-4">
                      Escolha um canal da lista ou cole um link direto
                    </p>
                    <div className="text-sm text-muted-foreground">
                      ✅ HLS (.m3u8) • ✅ DASH (.mpd) • ✅ MP4/WebM • ⚠️ RTMP
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tabs para Canal/Link Direto */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="channels">Lista de Canais</TabsTrigger>
                  <TabsTrigger value="direct">Link Direto</TabsTrigger>
                </TabsList>
                
                <TabsContent value="direct" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LinkIcon size={20} />
                        Reproduzir Link Direto
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleDirectPlay} className="space-y-4">
                        <Input
                          value={directLink}
                          onChange={(e) => setDirectLink(e.target.value)}
                          placeholder="Cole aqui o link do vídeo (HLS, DASH, MP4, etc.)"
                          className="w-full"
                        />
                        <Button type="submit" disabled={!directLink.trim()} className="w-full">
                          <Tv size={16} className="mr-2" />
                          Reproduzir
                        </Button>
                        <div className="text-xs text-muted-foreground">
                          Suporte: .m3u8 (HLS), .mpd (DASH), .mp4, .webm, embeds
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Lista de Canais (Sidebar) */}
            <div className="flex flex-col gap-4 h-full">
              {/* Filtros */}
              <SimpleMediaFilter
                mediaType={mediaType}
                setMediaType={setMediaType}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                totalCount={allMedia.length}
                filteredCount={filteredMedia.length}
              />

              {/* Lista de Canais */}
              <ChannelsList
                channels={filteredMedia}
                selectedChannel={selectedMedia}
                onChannelSelect={handleChannelSelect}
              />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default EnhancedPlayerPage;