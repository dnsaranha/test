import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { MediaItem } from "@/utils/mediaParser";

type MediaPlayerProps = {
  media: MediaItem;
  autoPlay?: boolean;
};

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ media, autoPlay = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setError(null);

    let hls: Hls | null = null;
    let canPlayHandler: () => void;
    let errorHandler: () => void;

    const cleanup = () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
        if (canPlayHandler) video.removeEventListener('canplay', canPlayHandler);
        if (errorHandler) video.removeEventListener('error', errorHandler);
      }
    };

    // Cleanup anterior antes de carregar nova mídia
    cleanup();

    const loadMedia = () => {
      // Para URLs do Pluto TV, não carregamos diretamente (seria necessário API específica)
      if (media.url.startsWith('pluto://')) {
        setError('Pluto TV streams requerem configuração especial');
        setIsLoading(false);
        return;
      }

      // Detectar tipo de stream baseado na URL e tipo de mídia
      const isHLS = media.url.includes('.m3u8') || media.url.includes('playlist');
      
      if (isHLS) {
        if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: false,
            lowLatencyMode: media.type === 'tv',
            backBufferLength: media.type === 'tv' ? 30 : 60,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            // Configurações para contornar CORS
            xhrSetup: function(xhr: XMLHttpRequest, url: string) {
              xhr.withCredentials = false;
            },
            fetchSetup: function(context: any, initParams: any) {
              initParams.mode = 'cors';
              initParams.credentials = 'omit';
              return new Request(context.url, initParams);
            }
          });
          
          hls.loadSource(media.url);
          hls.attachMedia(video);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            if (autoPlay) {
              video.play().catch(() => console.log("Reprodução automática impedida"));
            }
          });
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.error('HLS Error:', data);
              setError(`Stream indisponível no momento`);
              setIsLoading(false);
              cleanup();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Safari nativo
          video.src = media.url;
          canPlayHandler = () => {
            setIsLoading(false);
            if (autoPlay) {
              video.play().catch(() => console.log("Reprodução automática impedida"));
            }
          };
          errorHandler = () => {
            setError('Erro ao carregar o vídeo');
            setIsLoading(false);
          };
          video.addEventListener('canplay', canPlayHandler);
          video.addEventListener('error', errorHandler);
        }
      } else {
        // Vídeo regular (MP4, etc.)
        video.src = media.url;
        canPlayHandler = () => {
          setIsLoading(false);
        };
        errorHandler = () => {
          setError('Erro ao carregar o vídeo');
          setIsLoading(false);
        };
        video.addEventListener('canplay', canPlayHandler);
        video.addEventListener('error', errorHandler);
      }
    };

    loadMedia();
    
    return cleanup;
  }, [media.url, autoPlay, media.type]);

  if (error) {
    return (
      <div className="w-full bg-muted rounded p-8 text-center" style={{ aspectRatio: "16/9" }}>
        <div className="text-destructive mb-2">⚠️ Erro</div>
        <p className="text-sm text-muted-foreground">{error}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Tipo: {media.type === 'tv' ? 'TV ao Vivo' : media.type === 'movie' ? 'Filme' : 'Série'}
        </p>
        {/* Botão para abrir em nova aba quando há erro de CORS */}
        <a
          href={media.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm"
        >
          🔗 Abrir em Nova Aba
        </a>
        <p className="text-xs text-muted-foreground mt-2">
          Alguns streams podem funcionar melhor em nova aba devido a restrições de CORS
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      
      <video
        ref={videoRef}
        controls
        poster={media.logo}
        className="w-full h-full rounded shadow-lg"
        style={{ background: "#000" }}
        autoPlay={autoPlay}
        playsInline
        crossOrigin="anonymous"
        onContextMenu={(e) => e.preventDefault()}
      >
        Seu navegador não suporta o player de vídeo.
      </video>
      
      {/* Overlay com informações */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b">
        <div className="flex items-center gap-3 text-white">
          <img 
            src={media.logo} 
            alt={media.name} 
            className="w-8 h-8 object-contain bg-white rounded"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/32x32?text=M';
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{media.name}</p>
            <p className="text-sm text-white/70">{media.category}</p>
          </div>
          <div className="text-xs bg-white/20 px-2 py-1 rounded">
            {media.type === 'tv' ? '📺 AO VIVO' : media.type === 'movie' ? '🎬 FILME' : '📺 SÉRIE'}
          </div>
        </div>
      </div>
    </div>
  );
};