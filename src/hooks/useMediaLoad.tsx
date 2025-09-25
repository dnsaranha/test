import { useState, useEffect } from "react";
import { MediaItem, parseM3U, parseXML } from "@/utils/mediaParser";
import { mediaCache } from "@/utils/mediaCache";

// Mídia de fallback caso as listas não carreguem
const FALLBACK_MEDIA: MediaItem[] = [
  {
    id: "tv-cultura",
    name: "TV Cultura",
    url: "https://player-tvcultura.stream.uol.com.br/live/tvcultura.m3u8",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/46/Logo_TV_Cultura_2012.png",
    category: "Cultura",
    type: "tv"
  },
  {
    id: "record-news",
    name: "Record News",
    url: "https://playplus-cdn-01.plr.net.br/live/TVR7/record_news-1/playlist.m3u8",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Record_News_logo.png",
    category: "Notícias",
    type: "tv"
  }
];

interface UseMediaLoadOptions {
  sources?: string[];
  removeDuplicates?: boolean;
}

export const useMediaLoad = (options: UseMediaLoadOptions = {}) => {
  const { sources = [], removeDuplicates = true } = options;
  const [allMedia, setAllMedia] = useState<MediaItem[]>(FALLBACK_MEDIA);
  const [loading, setLoading] = useState(false);

  const loadMedia = async () => {
    console.log('Iniciando carregamento das listas M3U...');
    setLoading(true);
    let mediaItems: MediaItem[] = [...FALLBACK_MEDIA];
    
    const proxy = 'https://corsproxy.io/?';

    for (const source of sources) {
      const proxiedSource = `${proxy}${encodeURIComponent(source)}`;

      try {
        // Check cache first using original source URL as key
        if (mediaCache.has(source)) {
          console.log(`Carregando do cache: ${source}`);
          const cached = mediaCache.get(source);
          if (cached) {
            mediaItems = [...mediaItems, ...cached];
            continue;
          }
        }

        console.log(`Carregando lista via proxy: ${source}`);
        
        // Prepare headers for conditional requests
        const headers: HeadersInit = {};
        const cachedEtag = mediaCache.getEtag(source);
        if (cachedEtag) {
          headers['If-None-Match'] = cachedEtag;
        }

        const response = await fetch(proxiedSource, { headers });
        
        // If not modified, use cached data
        if (response.status === 304) {
          const cached = mediaCache.get(source);
          if (cached) {
            console.log(`Dados não modificados, usando cache: ${source}`);
            mediaItems = [...mediaItems, ...cached];
            continue;
          }
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const content = await response.text();
        let parsed: MediaItem[] = [];
        
        if (content.includes('#EXTM3U')) {
          parsed = parseM3U(content);
          console.log(`Encontrados ${parsed.length} itens M3U em ${source}`);
        } else if (content.includes('<?xml')) {
          parsed = parseXML(content);
          console.log(`Encontrados ${parsed.length} itens XML em ${source}`);
        } else {
          // Try M3U parsing as fallback
          parsed = parseM3U(content);
          console.log(`Tentativa de parsing M3U: ${parsed.length} itens em ${source}`);
        }

        // Cache the results
        const etag = response.headers.get('etag');
        mediaCache.set(source, parsed, etag || undefined);
        
        mediaItems = [...mediaItems, ...parsed];
      } catch (error) {
        console.log(`Erro ao carregar ${source}:`, error);
        
        // Try to use cached data as fallback
        const cached = mediaCache.get(source);
        if (cached) {
          console.log(`Usando cache como fallback: ${source}`);
          mediaItems = [...mediaItems, ...cached];
        }
      }
    }
    
    // Remove duplicatas baseado na URL (se habilitado)
    const finalMedia = removeDuplicates 
      ? mediaItems.filter((item, index, self) => 
          index === self.findIndex(m => m.url === item.url)
        )
      : mediaItems;
    
    setAllMedia(finalMedia);
    setLoading(false);
    console.log(`Total de ${finalMedia.length} itens carregados${removeDuplicates ? ' (sem duplicatas)' : ''}`);
  };

  useEffect(() => {
    console.log('useEffect disparado com sources:', sources);
    if (sources.length > 0) {
      loadMedia();
    } else {
      setAllMedia(FALLBACK_MEDIA);
      setLoading(false);
    }
  }, [JSON.stringify(sources), removeDuplicates]); // Usar JSON.stringify para evitar dependência de array

  return { allMedia, loading, reloadMedia: loadMedia };
};